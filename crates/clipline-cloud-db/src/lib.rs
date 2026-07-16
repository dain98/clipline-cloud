mod models;
mod repositories;

use std::{fs, path::Path, str::FromStr, time::Duration};

use chrono::{DateTime, Utc};
pub use models::*;
pub use repositories::*;
use sqlx::{
    migrate::Migrator,
    postgres::{PgPoolOptions, PgRow},
    sqlite::{SqliteConnectOptions, SqliteJournalMode, SqlitePoolOptions, SqliteRow},
    Executor, PgPool, Row, SqlitePool,
};
use thiserror::Error;
use ulid::Ulid;

static SQLITE_MIGRATOR: Migrator = sqlx::migrate!("./migrations/sqlite");
static POSTGRES_MIGRATOR: Migrator = sqlx::migrate!("./migrations/postgres");
const POSTGRES_MIGRATION_ADVISORY_LOCK_ID: i64 = 0x0043_4c50_4c49_4e45;
const SQLITE_BUSY_TIMEOUT: Duration = Duration::from_secs(5);

#[derive(Debug, Error)]
pub enum DbError {
    #[error("unsupported database URL: {0}")]
    UnsupportedDatabaseUrl(String),
    #[error("failed to create SQLite parent directory {path}: {source}")]
    CreateSqliteParent {
        path: String,
        #[source]
        source: std::io::Error,
    },
    #[error(transparent)]
    Sqlx(#[from] sqlx::Error),
    #[error(transparent)]
    Migrate(#[from] sqlx::migrate::MigrateError),
}

pub type DbResult<T> = Result<T, DbError>;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum DatabaseKind {
    Sqlite,
    Postgres,
}

#[derive(Clone)]
pub enum Database {
    Sqlite(SqlitePool),
    Postgres(PgPool),
}

impl Database {
    pub async fn connect(database_url: &str) -> DbResult<Self> {
        if database_url.starts_with("sqlite:") {
            return connect_sqlite(database_url).await;
        }

        if database_url.starts_with("postgres://") || database_url.starts_with("postgresql://") {
            return Ok(Self::Postgres(
                PgPoolOptions::new()
                    .max_connections(10)
                    .connect(database_url)
                    .await?,
            ));
        }

        Err(DbError::UnsupportedDatabaseUrl(database_url.to_string()))
    }

    pub async fn connect_and_migrate(database_url: &str) -> DbResult<Self> {
        let database = Self::connect(database_url).await?;
        database.run_migrations().await?;
        Ok(database)
    }

    pub fn kind(&self) -> DatabaseKind {
        match self {
            Self::Sqlite(_) => DatabaseKind::Sqlite,
            Self::Postgres(_) => DatabaseKind::Postgres,
        }
    }

    pub async fn run_migrations(&self) -> DbResult<()> {
        match self {
            Self::Sqlite(pool) => {
                SQLITE_MIGRATOR.run(pool).await?;
            }
            Self::Postgres(pool) => {
                let mut connection = pool.acquire().await?;
                sqlx::query("SELECT pg_advisory_lock($1)")
                    .bind(POSTGRES_MIGRATION_ADVISORY_LOCK_ID)
                    .execute(&mut *connection)
                    .await?;

                let migration_result = POSTGRES_MIGRATOR.run(&mut *connection).await;
                let unlock_result = sqlx::query("SELECT pg_advisory_unlock($1)")
                    .bind(POSTGRES_MIGRATION_ADVISORY_LOCK_ID)
                    .execute(&mut *connection)
                    .await;

                migration_result?;
                unlock_result?;
            }
        }

        Ok(())
    }

    pub async fn ping(&self) -> DbResult<()> {
        match self {
            Self::Sqlite(pool) => {
                sqlx::query("SELECT 1").execute(pool).await?;
            }
            Self::Postgres(pool) => {
                sqlx::query("SELECT 1").execute(pool).await?;
            }
        }

        Ok(())
    }

    pub async fn table_names(&self) -> DbResult<Vec<String>> {
        match self {
            Self::Sqlite(pool) => {
                let rows = sqlx::query(
                    "SELECT name FROM sqlite_schema WHERE type = 'table' AND name NOT LIKE '_sqlx_%' ORDER BY name",
                )
                .fetch_all(pool)
                .await?;

                Ok(rows
                    .into_iter()
                    .map(|row: SqliteRow| row.get::<String, _>("name"))
                    .collect())
            }
            Self::Postgres(pool) => {
                let rows = sqlx::query(
                    "SELECT table_name FROM information_schema.tables
                     WHERE table_schema = current_schema() AND table_name NOT LIKE '_sqlx_%'
                     ORDER BY table_name",
                )
                .fetch_all(pool)
                .await?;

                Ok(rows
                    .into_iter()
                    .map(|row: PgRow| row.get::<String, _>("table_name"))
                    .collect())
            }
        }
    }
}

impl DbError {
    pub fn is_unique_violation(&self) -> bool {
        match self {
            Self::Sqlx(sqlx::Error::Database(error)) => error.is_unique_violation(),
            _ => false,
        }
    }
}

async fn connect_sqlite(database_url: &str) -> DbResult<Database> {
    create_sqlite_parent_dir(database_url)?;

    let options = SqliteConnectOptions::from_str(database_url)?
        .create_if_missing(true)
        .foreign_keys(true)
        .journal_mode(SqliteJournalMode::Wal)
        .busy_timeout(SQLITE_BUSY_TIMEOUT);

    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .after_connect(|connection, _metadata| {
            Box::pin(async move {
                connection.execute("PRAGMA foreign_keys = ON").await?;
                connection.execute("PRAGMA busy_timeout = 5000").await?;
                connection.execute("PRAGMA journal_mode = WAL").await?;
                Ok(())
            })
        })
        .connect_with(options)
        .await?;

    Ok(Database::Sqlite(pool))
}

fn create_sqlite_parent_dir(database_url: &str) -> DbResult<()> {
    let Some(path) = sqlite_file_path(database_url) else {
        return Ok(());
    };
    let Some(parent) = path.parent() else {
        return Ok(());
    };
    if parent.as_os_str().is_empty() {
        return Ok(());
    }

    fs::create_dir_all(parent).map_err(|source| DbError::CreateSqliteParent {
        path: parent.display().to_string(),
        source,
    })
}

fn sqlite_file_path(database_url: &str) -> Option<&Path> {
    if database_url == "sqlite::memory:" || database_url == "sqlite://:memory:" {
        return None;
    }

    let raw_path = database_url.strip_prefix("sqlite://")?;
    if raw_path.is_empty() || raw_path.starts_with('?') {
        return None;
    }

    let path = raw_path.split('?').next().unwrap_or(raw_path);
    Some(Path::new(path))
}

pub fn new_ulid() -> String {
    Ulid::new().to_string()
}

pub fn now_utc() -> DateTime<Utc> {
    Utc::now()
}

pub(crate) fn postgres_placeholders(sql: &str) -> String {
    let mut index = 1;
    let mut out = String::with_capacity(sql.len() + 8);

    for ch in sql.chars() {
        if ch == '?' {
            out.push('$');
            out.push_str(&index.to_string());
            index += 1;
        } else {
            out.push(ch);
        }
    }

    out
}

macro_rules! db_execute {
    ($database:expr, $sql:expr, [$($bind:expr),* $(,)?]) => {{
        let sql = $sql;
        let sql_ref: &str = sql.as_ref();
        match $database {
            $crate::Database::Sqlite(pool) => {
                #[allow(unused_mut)]
                let mut query = sqlx::query(sql_ref);
                $(query = query.bind($bind);)*
                query.execute(pool).await.map(|_| ())
            }
            $crate::Database::Postgres(pool) => {
                let sql = $crate::postgres_placeholders(sql_ref);
                #[allow(unused_mut)]
                let mut query = sqlx::query(sql.as_ref());
                $(query = query.bind($bind);)*
                query.execute(pool).await.map(|_| ())
            }
        }
    }};
}

macro_rules! db_execute_rows {
    ($database:expr, $sql:expr, [$($bind:expr),* $(,)?]) => {{
        let sql = $sql;
        let sql_ref: &str = sql.as_ref();
        match $database {
            $crate::Database::Sqlite(pool) => {
                #[allow(unused_mut)]
                let mut query = sqlx::query(sql_ref);
                $(query = query.bind($bind);)*
                query.execute(pool).await.map(|result| result.rows_affected())
            }
            $crate::Database::Postgres(pool) => {
                let sql = $crate::postgres_placeholders(sql_ref);
                #[allow(unused_mut)]
                let mut query = sqlx::query(sql.as_ref());
                $(query = query.bind($bind);)*
                query.execute(pool).await.map(|result| result.rows_affected())
            }
        }
    }};
}

macro_rules! db_fetch_optional {
    ($database:expr, $model:ty, $sql:expr, [$($bind:expr),* $(,)?]) => {{
        let sql = $sql;
        let sql_ref: &str = sql.as_ref();
        match $database {
            $crate::Database::Sqlite(pool) => {
                #[allow(unused_mut)]
                let mut query = sqlx::query_as::<_, $model>(sql_ref);
                $(query = query.bind($bind);)*
                query.fetch_optional(pool).await
            }
            $crate::Database::Postgres(pool) => {
                let sql = $crate::postgres_placeholders(sql_ref);
                #[allow(unused_mut)]
                let mut query = sqlx::query_as::<_, $model>(sql.as_ref());
                $(query = query.bind($bind);)*
                query.fetch_optional(pool).await
            }
        }
    }};
}

macro_rules! db_fetch_all {
    ($database:expr, $model:ty, $sql:expr, [$($bind:expr),* $(,)?]) => {{
        let sql = $sql;
        let sql_ref: &str = sql.as_ref();
        match $database {
            $crate::Database::Sqlite(pool) => {
                #[allow(unused_mut)]
                let mut query = sqlx::query_as::<_, $model>(sql_ref);
                $(query = query.bind($bind);)*
                query.fetch_all(pool).await
            }
            $crate::Database::Postgres(pool) => {
                let sql = $crate::postgres_placeholders(sql_ref);
                #[allow(unused_mut)]
                let mut query = sqlx::query_as::<_, $model>(sql.as_ref());
                $(query = query.bind($bind);)*
                query.fetch_all(pool).await
            }
        }
    }};
}

pub(crate) use db_execute;
pub(crate) use db_execute_rows;
pub(crate) use db_fetch_all;
pub(crate) use db_fetch_optional;

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::Duration as ChronoDuration;
    use repositories::{ClipListParams, ClipSort, PublicClipListParams};
    use serde_json::json;
    use sqlx::types::Json;
    use std::env;
    use tempfile::TempDir;

    async fn sqlite_test_database() -> (TempDir, Database) {
        let temp_dir = tempfile::tempdir().expect("temp dir");
        let db_path = temp_dir.path().join("clipline-test.db");
        let database_url = format!("sqlite://{}", db_path.display());
        let database = Database::connect_and_migrate(&database_url)
            .await
            .expect("sqlite database");
        (temp_dir, database)
    }

    async fn postgres_test_database() -> Option<Database> {
        let database_url = match env::var("CLIPLINE_TEST_POSTGRES_URL") {
            Ok(value) if !value.trim().is_empty() => value,
            _ => return None,
        };
        let schema = format!("clipline_test_{}", new_ulid().to_ascii_lowercase());
        let create_schema_sql = format!(r#"CREATE SCHEMA "{schema}""#);
        let search_path_sql = format!(r#"SET search_path TO "{schema}""#);
        let admin_pool = PgPoolOptions::new()
            .max_connections(1)
            .connect(&database_url)
            .await
            .expect("connect postgres test database");

        sqlx::query(&create_schema_sql)
            .execute(&admin_pool)
            .await
            .expect("create postgres test schema");
        admin_pool.close().await;

        let pool = PgPoolOptions::new()
            .max_connections(10)
            .after_connect(move |connection, _metadata| {
                let search_path_sql = search_path_sql.clone();
                Box::pin(async move {
                    connection.execute(search_path_sql.as_str()).await?;
                    Ok(())
                })
            })
            .connect(&database_url)
            .await
            .expect("connect postgres schema database");
        let database = Database::Postgres(pool);
        database
            .run_migrations()
            .await
            .expect("postgres migrations");

        Some(database)
    }

    #[test]
    fn postgres_placeholder_conversion_is_sequential() {
        assert_eq!(
            postgres_placeholders("SELECT * FROM users WHERE id = ? AND username = ?"),
            "SELECT * FROM users WHERE id = $1 AND username = $2"
        );
    }

    async fn assert_migrations_are_idempotent(database: &Database) {
        database
            .run_migrations()
            .await
            .expect("second migration run");
        database.ping().await.expect("ping");

        let tables = database.table_names().await.expect("table names");

        assert_eq!(
            tables,
            vec![
                "app_settings",
                "audit_log",
                "clip_comments",
                "clip_markers",
                "clips",
                "device_tokens",
                "game_categories",
                "game_category_names",
                "invitation_tokens",
                "jobs",
                "reset_password_tokens",
                "sessions",
                "upload_parts",
                "upload_sessions",
                "users",
            ]
        );
    }

    async fn assert_active_job_migration_prefers_running_job(database: &Database) {
        let reset_sql = "DROP INDEX jobs_active_target_kind_ux;
                         DROP INDEX jobs_active_global_kind_ux;
                         DELETE FROM jobs;";
        match database {
            Database::Sqlite(pool) => {
                sqlx::raw_sql(reset_sql)
                    .execute(pool)
                    .await
                    .expect("reset SQLite job indexes");
            }
            Database::Postgres(pool) => {
                sqlx::raw_sql(reset_sql)
                    .execute(pool)
                    .await
                    .expect("reset Postgres job indexes");
            }
        }

        let repositories = Repositories::new(database.clone());
        let now = now_utc();
        let mut pending = NewJob::new("validate_object", now);
        pending.target_type = Some("clip".to_string());
        pending.target_id = Some("migration-target".to_string());
        pending.created_at = now - ChronoDuration::minutes(1);
        pending.updated_at = pending.created_at;
        let pending = repositories
            .jobs
            .create(&pending)
            .await
            .expect("create pending duplicate");

        let mut running = NewJob::new("validate_object", now);
        running.status = "running".to_string();
        running.target_type = Some("clip".to_string());
        running.target_id = Some("migration-target".to_string());
        running.locked_by = Some("active-worker".to_string());
        running.locked_at = Some(now);
        let running = repositories
            .jobs
            .create(&running)
            .await
            .expect("create running duplicate");

        let mut null_type = NewJob::new("validate_object", now);
        null_type.target_id = Some("mixed-null-target-type".to_string());
        null_type.created_at = now - ChronoDuration::minutes(1);
        null_type.updated_at = null_type.created_at;
        let null_type = repositories
            .jobs
            .create(&null_type)
            .await
            .expect("create NULL target-type duplicate");

        let mut empty_type = NewJob::new("validate_object", now);
        empty_type.status = "running".to_string();
        empty_type.target_type = Some(String::new());
        empty_type.target_id = Some("mixed-null-target-type".to_string());
        empty_type.locked_by = Some("active-worker".to_string());
        empty_type.locked_at = Some(now);
        let empty_type = repositories
            .jobs
            .create(&empty_type)
            .await
            .expect("create empty target-type duplicate");

        match database {
            Database::Sqlite(pool) => {
                sqlx::raw_sql(include_str!(
                    "../migrations/sqlite/202607100001_active_job_uniqueness.sql"
                ))
                .execute(pool)
                .await
                .expect("reapply SQLite active-job migration");
            }
            Database::Postgres(pool) => {
                sqlx::raw_sql(include_str!(
                    "../migrations/postgres/202607100001_active_job_uniqueness.sql"
                ))
                .execute(pool)
                .await
                .expect("reapply Postgres active-job migration");
            }
        }

        let pending = repositories
            .jobs
            .get(&pending.id)
            .await
            .expect("load pending duplicate")
            .expect("pending duplicate");
        let running = repositories
            .jobs
            .get(&running.id)
            .await
            .expect("load running duplicate")
            .expect("running duplicate");
        let null_type = repositories
            .jobs
            .get(&null_type.id)
            .await
            .expect("load NULL target-type duplicate")
            .expect("NULL target-type duplicate");
        let empty_type = repositories
            .jobs
            .get(&empty_type.id)
            .await
            .expect("load empty target-type duplicate")
            .expect("empty target-type duplicate");
        assert_eq!(pending.status, "failed");
        assert_eq!(running.status, "running");
        assert_eq!(null_type.status, "failed");
        assert_eq!(empty_type.status, "running");
    }

    async fn assert_active_jobs_without_target_type_are_deduplicated(database: &Database) {
        let repositories = Repositories::new(database.clone());
        let mut first = NewJob::new("validate_object", now_utc());
        first.target_id = Some("target-without-type".to_string());
        let first = repositories
            .jobs
            .create_if_absent_active(&first)
            .await
            .expect("create first untyped target job");

        let mut duplicate = NewJob::new("validate_object", now_utc());
        duplicate.target_id = Some("target-without-type".to_string());
        let duplicate = repositories
            .jobs
            .create_if_absent_active(&duplicate)
            .await
            .expect("deduplicate untyped target job");

        assert_eq!(duplicate.id, first.id);
        assert_eq!(
            repositories
                .jobs
                .get_active_by_kind_and_target("validate_object", None, Some("target-without-type"))
                .await
                .expect("find untyped target job")
                .map(|job| job.id),
            Some(first.id)
        );
    }

    async fn assert_game_category_lifecycle(database: Database) {
        let raw_database = database.clone();
        let repos = Repositories::new(database);
        let suffix = new_ulid().to_ascii_lowercase();
        let user = repos
            .users
            .create(&NewUser::new(
                format!("categories-{suffix}"),
                "hash",
                "user",
            ))
            .await
            .expect("category test user");

        let long_reported_name = "LongGame".repeat(128);
        let mut long_name_clip = NewClip::new(&user.id, "Long category name", "local");
        long_name_clip.game_name = Some(long_reported_name.clone());
        let long_name_session = NewUploadSession::new(
            &long_name_clip.id,
            &user.id,
            1,
            format!("objects/{suffix}/long-name.mp4"),
            now_utc() + ChronoDuration::hours(1),
        );
        let long_name_bundle = repos
            .create_upload_bundle(&long_name_clip, &long_name_session, &[])
            .await
            .expect("long reported name upload");
        let long_name_category = long_name_bundle
            .created_game_category
            .expect("long reported name creates category");
        assert_eq!(long_name_category.display_name.chars().count(), 200);
        assert_eq!(
            repos
                .game_categories
                .list_names(&long_name_category.id)
                .await
                .expect("long reported name mapping")[0]
                .reported_name,
            long_reported_name
        );

        let mut first = NewClip::new(&user.id, "Enhanced", "local");
        first.game_name = Some("GTA5_Enhanced".to_string());
        first.status = "ready".to_string();
        first.visibility = "public".to_string();
        first.public_share_id = Some(format!("category-first-{suffix}"));
        let first_session = NewUploadSession::new(
            &first.id,
            &user.id,
            1,
            format!("objects/{suffix}/first.mp4"),
            now_utc() + ChronoDuration::hours(1),
        );
        let first_bundle = repos
            .create_upload_bundle(&first, &first_session, &[])
            .await
            .expect("first category upload");
        assert_eq!(
            first_bundle
                .created_game_category
                .as_ref()
                .map(|category| category.display_name.as_str()),
            Some("GTA5_Enhanced")
        );

        let mut second = NewClip::new(&user.id, "Canonical", "local");
        second.game_name = Some("Grand Theft Auto V".to_string());
        second.status = "ready".to_string();
        second.visibility = "public".to_string();
        second.public_share_id = Some(format!("category-second-{suffix}"));
        let second_session = NewUploadSession::new(
            &second.id,
            &user.id,
            1,
            format!("objects/{suffix}/second.mp4"),
            now_utc() + ChronoDuration::hours(1),
        );
        let second_bundle = repos
            .create_upload_bundle(&second, &second_session, &[])
            .await
            .expect("second category upload");
        let created_destination = second_bundle
            .created_game_category
            .expect("new upload creates a managed category");
        let mut automatic_metadata = NewGameCategory::new("ignored display name");
        automatic_metadata.steamgriddb_game_id = Some(5258);
        automatic_metadata.artwork_kind = Some("grid".to_string());
        automatic_metadata.artwork_id = Some(101);
        automatic_metadata.artwork_url = Some("https://cdn2.steamgriddb.com/grid.png".to_string());
        automatic_metadata.artwork_thumb_url =
            Some("https://cdn2.steamgriddb.com/grid-thumb.png".to_string());
        automatic_metadata.video_artwork_id = Some(102);
        automatic_metadata.video_artwork_url =
            Some("https://cdn2.steamgriddb.com/hero.png".to_string());
        automatic_metadata.video_artwork_thumb_url =
            Some("https://cdn2.steamgriddb.com/hero-thumb.png".to_string());
        automatic_metadata.icon_artwork_id = Some(103);
        automatic_metadata.icon_artwork_url =
            Some("https://cdn2.steamgriddb.com/icon.png".to_string());
        automatic_metadata.icon_artwork_thumb_url =
            Some("https://cdn2.steamgriddb.com/icon-thumb.png".to_string());
        let automatically_enriched = repos
            .game_categories
            .apply_automatic_metadata_if_unchanged(
                &created_destination.id,
                created_destination.updated_at,
                &automatic_metadata,
            )
            .await
            .expect("apply automatic category metadata")
            .expect("unchanged category accepts automatic metadata");
        assert_eq!(automatically_enriched.artwork_id, Some(101));
        assert_eq!(automatically_enriched.video_artwork_id, Some(102));
        assert_eq!(automatically_enriched.icon_artwork_id, Some(103));
        assert!(repos
            .game_categories
            .apply_automatic_metadata_if_unchanged(
                &created_destination.id,
                created_destination.updated_at,
                &automatic_metadata,
            )
            .await
            .expect("reject stale automatic category metadata")
            .is_none());

        let source = repos
            .game_categories
            .get_by_reported_name("gta5_enhanced")
            .await
            .expect("source lookup")
            .expect("source category");
        let destination = repos
            .game_categories
            .get_by_reported_name("Grand Theft Auto V")
            .await
            .expect("destination lookup")
            .expect("destination category");
        assert_ne!(source.id, destination.id);
        assert_eq!(
            repos
                .merge_game_categories(&source.id, &destination.id, None)
                .await
                .expect("merge categories"),
            MergeGameCategoryOutcome::Merged
        );

        let mut params = ClipListParams {
            owner_user_id: user.id.clone(),
            game: None,
            game_category_id: Some(destination.id.clone()),
            source_type: None,
            visibility: None,
            status: None,
            from: None,
            to: None,
            min_duration_ms: None,
            max_duration_ms: None,
            min_size_bytes: None,
            max_size_bytes: None,
            query: None,
            sort: ClipSort::CreatedAtAsc,
            limit: 10,
            offset: 0,
        };
        assert_eq!(
            repos
                .clips
                .list_for_owner(&params)
                .await
                .expect("merged category filter")
                .len(),
            2
        );
        let mut public_params = PublicClipListParams {
            owner_user_id: None,
            game: None,
            game_category_id: Some(destination.id.clone()),
            query: None,
            sort: ClipSort::CreatedAtAsc,
            limit: 10,
            offset: 0,
        };
        assert_eq!(
            repos
                .clips
                .list_public(&public_params)
                .await
                .expect("merged public category filter")
                .len(),
            2
        );
        assert!(repos
            .clips
            .list_public_games()
            .await
            .expect("merged public category summaries")
            .iter()
            .any(|game| game.category_id == destination.id && game.clip_count == 2));
        assert_eq!(
            repos
                .game_categories
                .list_name_clip_counts(&destination.id)
                .await
                .expect("targeted merged name clip counts")
                .into_iter()
                .map(|(_, count)| count)
                .sum::<i64>(),
            2
        );

        let name = repos
            .game_categories
            .list_names(&destination.id)
            .await
            .expect("merged names")
            .into_iter()
            .find(|name| name.reported_name == "GTA5_Enhanced")
            .expect("enhanced name");
        let separated_id = match repos
            .separate_game_category_name(&destination.id, &name.id, None)
            .await
            .expect("separate name")
        {
            SeparateGameCategoryNameOutcome::Created(id) => id,
            outcome => panic!("unexpected separate outcome: {outcome:?}"),
        };
        params.game_category_id = Some(separated_id);
        public_params.game_category_id = params.game_category_id.clone();
        let separated = repos
            .clips
            .list_for_owner(&params)
            .await
            .expect("separated category filter");
        assert_eq!(separated.len(), 1);
        assert_eq!(separated[0].game_name.as_deref(), Some("GTA5_Enhanced"));
        assert_eq!(
            repos
                .clips
                .list_public(&public_params)
                .await
                .expect("separated public category filter")
                .len(),
            1
        );

        let immutable_update_rejected = match raw_database {
            Database::Sqlite(pool) => sqlx::query("UPDATE clips SET game_name = ? WHERE id = ?")
                .bind("Changed")
                .bind(&first.id)
                .execute(&pool)
                .await
                .is_err(),
            Database::Postgres(pool) => {
                sqlx::query("UPDATE clips SET game_name = $1 WHERE id = $2")
                    .bind("Changed")
                    .bind(&first.id)
                    .execute(&pool)
                    .await
                    .is_err()
            }
        };
        assert!(immutable_update_rejected);
        assert_eq!(
            repos
                .clips
                .get(&first.id)
                .await
                .expect("immutable clip lookup")
                .expect("immutable clip")
                .game_name
                .as_deref(),
            Some("GTA5_Enhanced")
        );
    }

    #[tokio::test]
    async fn sqlite_migration_creates_expected_tables_and_is_idempotent() {
        let (_temp_dir, database) = sqlite_test_database().await;
        assert_migrations_are_idempotent(&database).await;
    }

    #[tokio::test]
    async fn sqlite_active_job_migration_preserves_running_duplicate() {
        let (_temp_dir, database) = sqlite_test_database().await;
        assert_active_job_migration_prefers_running_job(&database).await;
    }

    #[tokio::test]
    async fn sqlite_active_jobs_without_target_type_are_deduplicated() {
        let (_temp_dir, database) = sqlite_test_database().await;
        assert_active_jobs_without_target_type_are_deduplicated(&database).await;
    }

    #[tokio::test]
    async fn sqlite_game_categories_merge_filter_separate_without_rewriting_clips() {
        let (_temp_dir, database) = sqlite_test_database().await;
        assert_game_category_lifecycle(database).await;
    }

    #[tokio::test]
    async fn postgres_migration_creates_expected_tables_and_is_idempotent() {
        let Some(database) = postgres_test_database().await else {
            return;
        };
        assert_migrations_are_idempotent(&database).await;
    }

    #[tokio::test]
    async fn postgres_active_job_migration_preserves_running_duplicate() {
        let Some(database) = postgres_test_database().await else {
            return;
        };
        assert_active_job_migration_prefers_running_job(&database).await;
    }

    #[tokio::test]
    async fn postgres_active_jobs_without_target_type_are_deduplicated() {
        let Some(database) = postgres_test_database().await else {
            return;
        };
        assert_active_jobs_without_target_type_are_deduplicated(&database).await;
    }

    #[tokio::test]
    async fn postgres_game_categories_merge_filter_separate_without_rewriting_clips() {
        let Some(database) = postgres_test_database().await else {
            return;
        };
        assert_game_category_lifecycle(database).await;
    }

    #[tokio::test]
    async fn sqlite_repositories_round_trip_all_tables() {
        let (_temp_dir, database) = sqlite_test_database().await;
        assert_repositories_round_trip_all_tables(database).await;
    }

    #[tokio::test]
    async fn postgres_repositories_round_trip_all_tables() {
        let Some(database) = postgres_test_database().await else {
            return;
        };
        assert_repositories_round_trip_all_tables(database).await;
    }

    #[tokio::test]
    async fn sqlite_active_storage_bytes_by_owner_filters_inactive_clips() {
        let (_temp_dir, database) = sqlite_test_database().await;
        assert_active_storage_bytes_by_owner_filters_inactive_clips(database).await;
    }

    #[tokio::test]
    async fn postgres_active_storage_bytes_by_owner_filters_inactive_clips() {
        let Some(database) = postgres_test_database().await else {
            return;
        };
        assert_active_storage_bytes_by_owner_filters_inactive_clips(database).await;
    }

    async fn assert_repositories_round_trip_all_tables(database: Database) {
        let test_id = new_ulid().to_ascii_lowercase();
        let repos = Repositories::new(database);
        let expires_at = now_utc() + ChronoDuration::hours(1);
        let username = format!("dain-{test_id}");
        let session_token_hash = format!("session-token-hash-{test_id}");
        let device_token_hash = format!("device-token-hash-{test_id}");
        let client_clip_id = format!("local-clip-{test_id}");
        let storage_key = format!("objects/media/{test_id}/original.mp4");
        let poster_key = format!("objects/media/{test_id}/poster.jpg");
        let thumbnail_key = format!("objects/media/{test_id}/thumb_320.jpg");
        let public_share_id = format!("c_{test_id}");
        let reset_token_hash = format!("reset-token-hash-{test_id}");
        let invitation_token_hash = format!("invite-token-hash-{test_id}");

        let mut new_user = NewUser::new(&username, "argon2id-hash", "admin");
        new_user.display_name = Some("Dain".to_string());
        new_user.email = Some(format!("dain-{test_id}@example.com"));
        new_user.storage_quota_bytes = Some(1024);
        let user = repos.users.create(&new_user).await.expect("create user");
        assert_eq!(user.username, username);
        assert_eq!(user.email, new_user.email);
        assert_eq!(user.storage_quota_bytes, Some(1024));

        let settings = repos.settings.get().await.expect("settings");
        assert!(settings.allow_vod_uploads);
        assert_eq!(settings.vod_threshold_minutes, 30);
        assert!(settings.about_text.contains("Clipline"));
        assert!(!settings.smtp_enabled);
        assert_eq!(settings.smtp_port, 587);
        assert_eq!(settings.smtp_tls_mode, "starttls");
        let settings = repos
            .settings
            .set_owner_user_id(&user.id)
            .await
            .expect("set owner");
        assert_eq!(settings.owner_user_id.as_deref(), Some(user.id.as_str()));
        let settings = repos
            .settings
            .update(&UpdateAppSettings {
                allow_vod_uploads: Some(false),
                vod_threshold_minutes: Some(45),
                about_text: Some("Custom About".to_string()),
                smtp_enabled: Some(true),
                smtp_host: Some(Some("smtp.example.com".to_string())),
                smtp_port: Some(465),
                smtp_tls_mode: Some("tls".to_string()),
                smtp_username: Some(Some("mailer".to_string())),
                smtp_password: Some(Some("secret".to_string())),
                smtp_from_email: Some(Some("clips@example.com".to_string())),
                smtp_from_name: Some(Some("Clipline".to_string())),
                ..UpdateAppSettings::default()
            })
            .await
            .expect("update settings");
        assert!(!settings.allow_vod_uploads);
        assert_eq!(settings.vod_threshold_minutes, 45);
        assert_eq!(settings.about_text, "Custom About");
        assert!(settings.smtp_enabled);
        assert_eq!(settings.smtp_host.as_deref(), Some("smtp.example.com"));
        assert_eq!(settings.smtp_port, 465);
        assert_eq!(settings.smtp_tls_mode, "tls");
        assert_eq!(settings.smtp_username.as_deref(), Some("mailer"));
        assert_eq!(settings.smtp_password.as_deref(), Some("secret"));
        assert_eq!(
            settings.smtp_from_email.as_deref(),
            Some("clips@example.com")
        );
        assert_eq!(settings.smtp_from_name.as_deref(), Some("Clipline"));
        let settings = repos
            .settings
            .update(&UpdateAppSettings {
                user_storage_quota_bytes: Some(Some(5 * 1024 * 1024 * 1024)),
                ..UpdateAppSettings::default()
            })
            .await
            .expect("set default quota");
        assert_eq!(
            settings.user_storage_quota_bytes,
            Some(5 * 1024 * 1024 * 1024)
        );
        let settings = repos
            .settings
            .update(&UpdateAppSettings {
                user_storage_quota_bytes: Some(Some(0)),
                ..UpdateAppSettings::default()
            })
            .await
            .expect("disable default quota");
        assert_eq!(settings.user_storage_quota_bytes, Some(0));
        let settings = repos
            .settings
            .update(&UpdateAppSettings {
                smtp_password: Some(None),
                ..UpdateAppSettings::default()
            })
            .await
            .expect("clear SMTP password");
        assert_eq!(settings.smtp_password, None);

        repos
            .users
            .update_last_login(&user.id)
            .await
            .expect("last login");
        assert!(repos
            .users
            .get_by_username(&username)
            .await
            .expect("get user")
            .expect("user")
            .last_login_at
            .is_some());

        let mut new_session = NewSession::new(&user.id, &session_token_hash, expires_at);
        new_session.user_agent = Some("test-agent".to_string());
        new_session.ip_address = Some("127.0.0.1".to_string());
        let session = repos
            .sessions
            .create(&new_session)
            .await
            .expect("create session");
        repos
            .sessions
            .touch(&session.id)
            .await
            .expect("touch session");
        repos
            .sessions
            .revoke(&session.id)
            .await
            .expect("revoke session");
        assert!(repos
            .sessions
            .get_by_token_hash(&session_token_hash)
            .await
            .expect("get session")
            .expect("session")
            .revoked_at
            .is_some());

        let device_token = repos
            .device_tokens
            .create(&NewDeviceToken::new(
                &user.id,
                "Dain's Desktop",
                &device_token_hash,
            ))
            .await
            .expect("create device token");
        repos
            .device_tokens
            .touch(&device_token.id)
            .await
            .expect("touch device token");
        assert!(repos
            .device_tokens
            .get_by_token_hash(&device_token_hash)
            .await
            .expect("get device token")
            .is_some());

        let category = repos
            .game_categories
            .create(&NewGameCategory::new("Grand Theft Auto V"))
            .await
            .expect("create game category");
        let category_name = repos
            .game_categories
            .create_name(&NewGameCategoryName::new(&category.id, "GTA5_Enhanced"))
            .await
            .expect("create game category name");
        assert_eq!(
            repos
                .game_categories
                .list()
                .await
                .expect("list game categories"),
            vec![category.clone()]
        );
        assert_eq!(
            repos
                .game_categories
                .list_names(&category.id)
                .await
                .expect("list game category names"),
            vec![category_name]
        );
        let mut updated_category = NewGameCategory::new("GTA V");
        updated_category.steamgriddb_game_id = Some(5258);
        updated_category.artwork_kind = Some("grid".to_string());
        updated_category.artwork_id = Some(8842);
        updated_category.artwork_url =
            Some("https://cdn2.steamgriddb.com/grid/full.png".to_string());
        updated_category.artwork_thumb_url =
            Some("https://cdn2.steamgriddb.com/grid/thumb.png".to_string());
        updated_category.video_artwork_id = Some(8843);
        updated_category.video_artwork_url =
            Some("https://cdn2.steamgriddb.com/hero/full.png".to_string());
        updated_category.video_artwork_thumb_url =
            Some("https://cdn2.steamgriddb.com/hero/thumb.png".to_string());
        updated_category.icon_artwork_id = Some(8844);
        updated_category.icon_artwork_url =
            Some("https://cdn2.steamgriddb.com/icon/full.png".to_string());
        updated_category.icon_artwork_thumb_url =
            Some("https://cdn2.steamgriddb.com/icon/thumb.png".to_string());
        let category = repos
            .game_categories
            .update(&category.id, &updated_category)
            .await
            .expect("update game category")
            .expect("game category");
        assert_eq!(category.display_name, "GTA V");
        assert_eq!(category.steamgriddb_game_id, Some(5258));
        assert_eq!(category.artwork_kind.as_deref(), Some("grid"));
        assert_eq!(category.artwork_id, Some(8842));
        assert_eq!(category.video_artwork_id, Some(8843));
        assert_eq!(category.icon_artwork_id, Some(8844));
        assert!(!repos
            .game_categories
            .list()
            .await
            .expect("list retained game categories")
            .is_empty());

        let mut new_clip = NewClip::new(&user.id, "First Clip", "local");
        new_clip.client_clip_id = Some(client_clip_id);
        new_clip.storage_key = Some(storage_key.clone());
        let clip = repos.clips.create(&new_clip).await.expect("create clip");
        repos
            .clips
            .update_probe_metadata(
                &clip.id,
                Some(12_345),
                Some(1920),
                Some(1080),
                Some(59.94),
                Some("h264"),
                Some("aac"),
            )
            .await
            .expect("update probe metadata");
        repos
            .clips
            .set_media_artifact_keys(&clip.id, Some(&poster_key), Some(&thumbnail_key))
            .await
            .expect("set artifact keys");
        let clip = repos
            .clips
            .get(&clip.id)
            .await
            .expect("get clip")
            .expect("clip");
        assert_eq!(clip.duration_ms, Some(12_345));
        assert_eq!(clip.width, Some(1920));
        assert_eq!(clip.height, Some(1080));
        assert_eq!(clip.video_codec.as_deref(), Some("h264"));
        assert_eq!(clip.thumbnail_key.as_deref(), Some(thumbnail_key.as_str()));
        repos
            .clips
            .set_visibility(&clip.id, "public", Some(&public_share_id))
            .await
            .expect("set visibility");
        repos
            .clips
            .update_status(&clip.id, "uploading")
            .await
            .expect("update clip status");

        let mut marker = NewClipMarker::new(&clip.id, "kill", 1500);
        marker.metadata_json = Some(Json(json!({ "weapon": "rail" })));
        repos
            .clip_markers
            .create(&marker)
            .await
            .expect("create marker");
        assert_eq!(
            repos
                .clip_markers
                .list_for_clip(&clip.id)
                .await
                .expect("markers")
                .len(),
            1
        );

        let upload_session = repos
            .upload_sessions
            .create(&NewUploadSession::new(
                &clip.id,
                &user.id,
                1024,
                &storage_key,
                expires_at,
            ))
            .await
            .expect("create upload session");
        assert!(repos
            .upload_sessions
            .update_received_size(&upload_session.id, 512)
            .await
            .expect("update received"));
        repos
            .upload_parts
            .upsert(&NewUploadPart::new(&upload_session.id, 1, 512))
            .await
            .expect("upsert part");
        assert_eq!(
            repos
                .upload_parts
                .list_for_session(&upload_session.id)
                .await
                .expect("parts")
                .len(),
            1
        );
        assert!(repos
            .upload_sessions
            .complete(&upload_session.id)
            .await
            .expect("complete upload"));

        let job = repos
            .jobs
            .create(&NewJob::new("validate_object", now_utc()))
            .await
            .expect("create job");
        let due_jobs = repos
            .jobs
            .list_due(now_utc() + ChronoDuration::minutes(1), 1000)
            .await
            .expect("due jobs");
        assert!(due_jobs.iter().any(|due_job| due_job.id == job.id));
        repos
            .jobs
            .set_status(&job.id, "succeeded", None)
            .await
            .expect("set job status");

        let mut audit = NewAuditLogEntry::new("user.created");
        audit.actor_user_id = Some(user.id.clone());
        audit.target_type = Some("user".to_string());
        audit.target_id = Some(user.id.clone());
        audit.ip_address = Some("127.0.0.1".to_string());
        audit.metadata_json = Some(Json(json!({ "username": username })));
        let audit = repos
            .audit_log
            .create(&audit)
            .await
            .expect("create audit entry");
        let audit_entries = repos
            .audit_log
            .list_recent(1000)
            .await
            .expect("audit entries");
        assert!(audit_entries.iter().any(|entry| entry.id == audit.id));

        let reset_token = repos
            .reset_password_tokens
            .create(&NewResetPasswordToken::new(
                &user.id,
                &reset_token_hash,
                expires_at,
            ))
            .await
            .expect("create reset token");
        assert!(repos
            .reset_password_tokens
            .get_by_token_hash(&reset_token_hash)
            .await
            .expect("get reset token")
            .is_some());
        repos
            .reset_password_tokens
            .mark_used(&reset_token.id)
            .await
            .expect("mark reset token used");
        assert!(repos
            .reset_password_tokens
            .get(&reset_token.id)
            .await
            .expect("get reset token")
            .expect("reset token")
            .used_at
            .is_some());

        let mut new_invitation =
            NewInvitationToken::new(&invitation_token_hash, "user", expires_at);
        new_invitation.created_by_user_id = Some(user.id.clone());
        let invitation = repos
            .invitation_tokens
            .create(&new_invitation)
            .await
            .expect("create invitation token");
        assert!(repos
            .invitation_tokens
            .get_by_token_hash(&invitation_token_hash)
            .await
            .expect("get invitation token")
            .is_some());
        assert!(repos
            .invitation_tokens
            .claim_if_valid(&invitation.id, "invite-claim-token-hash", now_utc())
            .await
            .expect("claim invitation token"));
        assert!(repos
            .invitation_tokens
            .get_by_claim_token_hash("invite-claim-token-hash")
            .await
            .expect("get invitation claim token")
            .is_some());
        assert!(repos
            .invitation_tokens
            .mark_claim_used_if_valid(&invitation.id, now_utc())
            .await
            .expect("mark invitation used"));
        let invitation = repos
            .invitation_tokens
            .get(&invitation.id)
            .await
            .expect("get invitation")
            .expect("invitation");
        assert!(invitation.claimed_at.is_some());
        assert!(invitation.used_at.is_some());
    }

    async fn assert_active_storage_bytes_by_owner_filters_inactive_clips(database: Database) {
        let test_id = new_ulid().to_ascii_lowercase();
        let repos = Repositories::new(database);
        let first_user = repos
            .users
            .create(&NewUser::new(
                format!("storage-a-{test_id}"),
                "hash",
                "user",
            ))
            .await
            .expect("create first user");
        let second_user = repos
            .users
            .create(&NewUser::new(
                format!("storage-b-{test_id}"),
                "hash",
                "user",
            ))
            .await
            .expect("create second user");

        let mut created = NewClip::new(&first_user.id, "created", "local");
        created.file_size_bytes = Some(10);
        repos.clips.create(&created).await.expect("created clip");

        let mut ready = NewClip::new(&first_user.id, "ready", "local");
        ready.status = "ready".to_string();
        ready.file_size_bytes = Some(20);
        repos.clips.create(&ready).await.expect("ready clip");

        let mut failed = NewClip::new(&first_user.id, "failed", "local");
        failed.status = "failed".to_string();
        failed.file_size_bytes = Some(40);
        repos.clips.create(&failed).await.expect("failed clip");

        let mut deleted = NewClip::new(&first_user.id, "deleted", "local");
        deleted.status = "ready".to_string();
        deleted.file_size_bytes = Some(80);
        let deleted = repos.clips.create(&deleted).await.expect("deleted clip");
        repos
            .clips
            .soft_delete(&deleted.id)
            .await
            .expect("soft delete clip");

        let mut uploading = NewClip::new(&second_user.id, "uploading", "local");
        uploading.status = "uploading".to_string();
        uploading.file_size_bytes = Some(7);
        repos
            .clips
            .create(&uploading)
            .await
            .expect("uploading clip");

        let usage = repos
            .clips
            .active_storage_bytes_by_owner()
            .await
            .expect("storage by owner")
            .into_iter()
            .collect::<std::collections::HashMap<_, _>>();

        assert_eq!(usage.get(&first_user.id), Some(&30));
        assert_eq!(usage.get(&second_user.id), Some(&7));
        assert_eq!(usage.len(), 2);
        assert_eq!(
            repos
                .clips
                .active_storage_bytes_for_owner(&first_user.id)
                .await
                .expect("first owner storage"),
            30
        );
    }

    #[tokio::test]
    async fn sqlite_user_auth_records_can_be_revoked() {
        let (_temp_dir, database) = sqlite_test_database().await;
        assert_user_auth_records_can_be_revoked(database).await;
    }

    #[tokio::test]
    async fn postgres_user_auth_records_can_be_revoked() {
        let Some(database) = postgres_test_database().await else {
            return;
        };
        assert_user_auth_records_can_be_revoked(database).await;
    }

    async fn assert_user_auth_records_can_be_revoked(database: Database) {
        let test_id = new_ulid().to_ascii_lowercase();
        let repos = Repositories::new(database);
        let expires_at = now_utc() + ChronoDuration::hours(1);
        let target_user = repos
            .users
            .create(&NewUser::new(
                format!("target-{test_id}"),
                "argon2id-hash",
                "user",
            ))
            .await
            .expect("target user");
        let other_user = repos
            .users
            .create(&NewUser::new(
                format!("other-{test_id}"),
                "argon2id-hash",
                "user",
            ))
            .await
            .expect("other user");
        let target_session = repos
            .sessions
            .create(&NewSession::new(
                &target_user.id,
                format!("target-session-{test_id}"),
                expires_at,
            ))
            .await
            .expect("target session");
        let other_session = repos
            .sessions
            .create(&NewSession::new(
                &other_user.id,
                format!("other-session-{test_id}"),
                expires_at,
            ))
            .await
            .expect("other session");
        let target_token = repos
            .device_tokens
            .create(&NewDeviceToken::new(
                &target_user.id,
                "Target Desktop",
                format!("target-token-{test_id}"),
            ))
            .await
            .expect("target device token");
        let other_token = repos
            .device_tokens
            .create(&NewDeviceToken::new(
                &other_user.id,
                "Other Desktop",
                format!("other-token-{test_id}"),
            ))
            .await
            .expect("other device token");

        repos
            .sessions
            .revoke_for_user(&target_user.id)
            .await
            .expect("revoke target sessions");
        repos
            .device_tokens
            .revoke_all_for_user(&target_user.id)
            .await
            .expect("revoke target device tokens");

        assert!(repos
            .sessions
            .get(&target_session.id)
            .await
            .expect("get target session")
            .expect("target session")
            .revoked_at
            .is_some());
        assert!(repos
            .device_tokens
            .get(&target_token.id)
            .await
            .expect("get target token")
            .expect("target token")
            .revoked_at
            .is_some());
        assert!(repos
            .sessions
            .get(&other_session.id)
            .await
            .expect("get other session")
            .expect("other session")
            .revoked_at
            .is_none());
        assert!(repos
            .device_tokens
            .get(&other_token.id)
            .await
            .expect("get other token")
            .expect("other token")
            .revoked_at
            .is_none());
    }

    #[tokio::test]
    async fn expired_upload_sessions_can_be_listed_and_aborted() {
        let (_temp_dir, database) = sqlite_test_database().await;
        assert_expired_upload_sessions_can_be_listed_and_aborted(database).await;
    }

    #[tokio::test]
    async fn postgres_expired_upload_sessions_can_be_listed_and_aborted() {
        let Some(database) = postgres_test_database().await else {
            return;
        };
        assert_expired_upload_sessions_can_be_listed_and_aborted(database).await;
    }

    #[tokio::test]
    async fn sqlite_atomic_upload_lifecycle_persists_markers_and_jobs() {
        let (_temp_dir, database) = sqlite_test_database().await;
        assert_atomic_upload_lifecycle(database).await;
    }

    #[tokio::test]
    async fn postgres_atomic_upload_lifecycle_persists_markers_and_jobs() {
        let Some(database) = postgres_test_database().await else {
            return;
        };
        assert_atomic_upload_lifecycle(database).await;
    }

    async fn assert_atomic_upload_lifecycle(database: Database) {
        let test_id = new_ulid().to_ascii_lowercase();
        let repos = Repositories::new(database);
        let user = repos
            .users
            .create(&NewUser::new(format!("atomic-{test_id}"), "hash", "user"))
            .await
            .expect("user");
        let mut clip = NewClip::new(&user.id, "Atomic Upload", "local");
        clip.client_clip_id = Some(format!("client-{test_id}"));
        let session = NewUploadSession::new(
            &clip.id,
            &user.id,
            1024,
            format!("objects/media/{test_id}/source.mp4"),
            now_utc() + ChronoDuration::hours(1),
        );
        let mut marker = NewClipMarker::new(&clip.id, "kill", 500);
        marker.metadata_json = Some(Json(json!({ "weapon": "rail" })));
        repos
            .create_upload_bundle(&clip, &session, &[marker])
            .await
            .expect("create upload bundle");
        assert_eq!(
            repos
                .clip_markers
                .list_for_clip(&clip.id)
                .await
                .expect("markers")
                .len(),
            1
        );

        let mut conflicting_clip = NewClip::new(&user.id, "Conflicting Upload", "local");
        conflicting_clip.client_clip_id = clip.client_clip_id.clone();
        let conflicting_session = NewUploadSession::new(
            &conflicting_clip.id,
            &user.id,
            1024,
            format!("objects/media/{test_id}/conflict.mp4"),
            now_utc() + ChronoDuration::hours(1),
        );
        let conflicting_marker = NewClipMarker::new(&conflicting_clip.id, "kill", 100);
        let error = repos
            .create_upload_bundle(
                &conflicting_clip,
                &conflicting_session,
                &[conflicting_marker],
            )
            .await
            .expect_err("duplicate client clip id");
        assert!(error.is_unique_violation());
        assert!(repos
            .clips
            .get(&conflicting_clip.id)
            .await
            .expect("conflicting clip lookup")
            .is_none());
        assert!(repos
            .upload_sessions
            .get(&conflicting_session.id)
            .await
            .expect("conflicting session lookup")
            .is_none());

        let mut validation_job = NewJob::new("validate_object", now_utc());
        validation_job.target_type = Some("clip".to_string());
        validation_job.target_id = Some(clip.id.clone());
        assert_eq!(
            repos
                .finalize_upload(&session.id, &clip.id, 1024, &validation_job)
                .await
                .expect("finalize"),
            FinalizeUploadOutcome::Finalized
        );
        assert_eq!(
            repos
                .finalize_upload(&session.id, &clip.id, 1024, &validation_job)
                .await
                .expect("idempotent finalize"),
            FinalizeUploadOutcome::AlreadyCompleted
        );
        assert_eq!(
            repos
                .upload_sessions
                .get(&session.id)
                .await
                .expect("session")
                .expect("session")
                .status,
            "completed"
        );
        assert_eq!(
            repos
                .clips
                .get(&clip.id)
                .await
                .expect("clip")
                .expect("clip")
                .status,
            "processing"
        );
        assert!(repos
            .jobs
            .get_active_by_kind_and_target("validate_object", Some("clip"), Some(&clip.id))
            .await
            .expect("active validation job")
            .is_some());
        let mut duplicate_job = NewJob::new("validate_object", now_utc());
        duplicate_job.target_type = Some("clip".to_string());
        duplicate_job.target_id = Some(clip.id.clone());
        let deduplicated = repos
            .jobs
            .create_if_absent_active(&duplicate_job)
            .await
            .expect("deduplicate active validation job");
        assert_eq!(deduplicated.id, validation_job.id);
        assert_eq!(
            repos
                .abort_upload(&session.id, &clip.id)
                .await
                .expect("abort completed"),
            AbortUploadOutcome::NotMutable
        );

        let aborted_clip = NewClip::new(&user.id, "Aborted Upload", "local");
        let aborted_session = NewUploadSession::new(
            &aborted_clip.id,
            &user.id,
            512,
            format!("objects/media/{test_id}/aborted.mp4"),
            now_utc() + ChronoDuration::hours(1),
        );
        repos
            .create_upload_bundle(&aborted_clip, &aborted_session, &[])
            .await
            .expect("create abort bundle");
        repos
            .upload_parts
            .upsert(&NewUploadPart::new(&aborted_session.id, 1, 512))
            .await
            .expect("part");
        assert_eq!(
            repos
                .abort_upload(&aborted_session.id, &aborted_clip.id)
                .await
                .expect("abort"),
            AbortUploadOutcome::Aborted
        );
        assert_eq!(
            repos
                .abort_upload(&aborted_session.id, &aborted_clip.id)
                .await
                .expect("idempotent abort"),
            AbortUploadOutcome::AlreadyAborted
        );
        assert!(repos
            .upload_parts
            .list_for_session(&aborted_session.id)
            .await
            .expect("parts")
            .is_empty());
        assert_eq!(
            repos
                .clips
                .get(&aborted_clip.id)
                .await
                .expect("aborted clip")
                .expect("aborted clip")
                .status,
            "deleted"
        );
    }

    async fn assert_expired_upload_sessions_can_be_listed_and_aborted(database: Database) {
        let test_id = new_ulid().to_ascii_lowercase();
        let repos = Repositories::new(database);
        let user = repos
            .users
            .create(&NewUser::new(format!("uploader-{test_id}"), "hash", "user"))
            .await
            .expect("user");
        let clip = repos
            .clips
            .create(&NewClip::new(&user.id, "Expired Upload", "local"))
            .await
            .expect("clip");
        let now = now_utc();
        let mut expired = NewUploadSession::new(
            &clip.id,
            &user.id,
            1024,
            format!("objects/media/{test_id}/source.mp4"),
            now - ChronoDuration::minutes(1),
        );
        expired.status = "uploading".to_string();
        let expired = repos
            .upload_sessions
            .create(&expired)
            .await
            .expect("expired session");
        let active = repos
            .upload_sessions
            .create(&NewUploadSession::new(
                &clip.id,
                &user.id,
                1024,
                format!("objects/media/{test_id}/source-2.mp4"),
                now + ChronoDuration::minutes(1),
            ))
            .await
            .expect("active session");

        let expired_sessions = repos
            .upload_sessions
            .list_expired_active(now, 10)
            .await
            .expect("expired sessions");
        assert_eq!(
            expired_sessions
                .iter()
                .map(|session| session.id.as_str())
                .collect::<Vec<_>>(),
            vec![expired.id.as_str()]
        );
        assert!(repos
            .upload_sessions
            .abort_if_expired(&expired.id, now)
            .await
            .expect("abort expired"));
        assert!(!repos
            .upload_sessions
            .abort_if_expired(&active.id, now)
            .await
            .expect("do not abort active"));
        assert_eq!(
            repos
                .upload_sessions
                .get(&expired.id)
                .await
                .expect("get expired")
                .expect("expired")
                .status,
            "aborted"
        );
        repos
            .upload_sessions
            .fail(&active.id, "storage temporarily unavailable")
            .await
            .expect("fail active upload");
        let failed = repos
            .upload_sessions
            .get(&active.id)
            .await
            .expect("get failed")
            .expect("failed upload");
        assert_eq!(failed.status, "failed");
        assert_eq!(
            failed.failure_reason.as_deref(),
            Some("storage temporarily unavailable")
        );
        assert!(failed.failed_at.is_some());
        assert!(!repos
            .upload_sessions
            .complete(&active.id)
            .await
            .expect("complete after failure"));
        let failed = repos
            .upload_sessions
            .get(&active.id)
            .await
            .expect("get failed")
            .expect("failed");
        assert_eq!(failed.status, "failed");
        assert_eq!(
            failed.failure_reason.as_deref(),
            Some("storage temporarily unavailable")
        );
        assert!(failed.failed_at.is_some());

        let cleanup_kind = format!("cleanup_session_{test_id}");
        let global_job = repos
            .jobs
            .create(&NewJob::new(&cleanup_kind, now))
            .await
            .expect("global job");
        assert_eq!(
            repos
                .jobs
                .count_active_global_kind(&cleanup_kind)
                .await
                .expect("count globals"),
            1
        );
        repos
            .jobs
            .set_status(&global_job.id, "succeeded", None)
            .await
            .expect("finish global job");
    }

    #[tokio::test]
    async fn sqlite_clip_query_escapes_like_wildcards_and_sorts_nulls_last() {
        let (_temp_dir, database) = sqlite_test_database().await;
        let repos = Repositories::new(database);
        let user = repos
            .users
            .create(&NewUser::new(
                format!("owner-{}", new_ulid()),
                "hash",
                "user",
            ))
            .await
            .expect("create user");

        let mut literal_percent = NewClip::new(&user.id, "100% match", "local");
        literal_percent.status = "ready".to_string();
        literal_percent.recorded_at = Some(now_utc());
        repos
            .clips
            .create(&literal_percent)
            .await
            .expect("percent clip");
        let mut plain = NewClip::new(&user.id, "plain match", "local");
        plain.status = "ready".to_string();
        plain.recorded_at = None;
        repos.clips.create(&plain).await.expect("plain clip");

        let mut params = ClipListParams {
            owner_user_id: user.id.clone(),
            game: None,
            game_category_id: None,
            source_type: None,
            visibility: None,
            status: None,
            from: None,
            to: None,
            min_duration_ms: None,
            max_duration_ms: None,
            min_size_bytes: None,
            max_size_bytes: None,
            query: Some("%".to_string()),
            sort: ClipSort::RecordedAtDesc,
            limit: 10,
            offset: 0,
        };
        let clips = repos
            .clips
            .list_for_owner(&params)
            .await
            .expect("query clips");
        assert_eq!(clips.len(), 1);
        assert_eq!(clips[0].title, "100% match");

        params.query = None;
        let clips = repos
            .clips
            .list_for_owner(&params)
            .await
            .expect("ordered clips");
        assert!(clips[0].recorded_at.is_some());
        assert!(clips[1].recorded_at.is_none());
    }

    #[tokio::test]
    async fn sqlite_clip_query_filters_source_duration_size_and_sorts_size() {
        let (_temp_dir, database) = sqlite_test_database().await;
        assert_clip_query_filters_source_duration_size_and_sorts_size(database).await;
    }

    #[tokio::test]
    async fn postgres_clip_query_filters_source_duration_size_and_sorts_size() {
        let Some(database) = postgres_test_database().await else {
            return;
        };
        assert_clip_query_filters_source_duration_size_and_sorts_size(database).await;
    }

    #[tokio::test]
    async fn sqlite_public_clip_query_discovers_only_public_ready_clips() {
        let (_temp_dir, database) = sqlite_test_database().await;
        assert_public_clip_query_discovers_only_public_ready_clips(database).await;
    }

    #[tokio::test]
    async fn postgres_public_clip_query_discovers_only_public_ready_clips() {
        let Some(database) = postgres_test_database().await else {
            return;
        };
        assert_public_clip_query_discovers_only_public_ready_clips(database).await;
    }

    #[tokio::test]
    async fn sqlite_public_clip_count_for_owner_is_not_page_limited() {
        let (_temp_dir, database) = sqlite_test_database().await;
        assert_public_clip_count_for_owner_is_not_page_limited(database).await;
    }

    #[tokio::test]
    async fn postgres_public_clip_count_for_owner_is_not_page_limited() {
        let Some(database) = postgres_test_database().await else {
            return;
        };
        assert_public_clip_count_for_owner_is_not_page_limited(database).await;
    }

    #[tokio::test]
    async fn sqlite_clip_comments_limit_keeps_newest_comments() {
        let (_temp_dir, database) = sqlite_test_database().await;
        assert_clip_comments_limit_keeps_newest_comments(database).await;
    }

    #[tokio::test]
    async fn postgres_clip_comments_limit_keeps_newest_comments() {
        let Some(database) = postgres_test_database().await else {
            return;
        };
        assert_clip_comments_limit_keeps_newest_comments(database).await;
    }

    async fn assert_clip_query_filters_source_duration_size_and_sorts_size(database: Database) {
        let repos = Repositories::new(database);
        let user = repos
            .users
            .create(&NewUser::new(
                format!("owner-{}", new_ulid()),
                "hash",
                "user",
            ))
            .await
            .expect("create user");

        let mut small = NewClip::new(&user.id, "Small match", "local");
        small.status = "ready".to_string();
        small.source_type = Some("replay".to_string());
        small.duration_ms = Some(20_000);
        small.file_size_bytes = Some(2_000);
        repos.clips.create(&small).await.expect("small clip");

        let mut large = NewClip::new(&user.id, "Large match", "local");
        large.status = "ready".to_string();
        large.source_type = Some("replay".to_string());
        large.duration_ms = Some(30_000);
        large.file_size_bytes = Some(8_000);
        repos.clips.create(&large).await.expect("large clip");

        let mut wrong_source = NewClip::new(&user.id, "Wrong source", "local");
        wrong_source.status = "ready".to_string();
        wrong_source.source_type = Some("manual".to_string());
        wrong_source.duration_ms = Some(25_000);
        wrong_source.file_size_bytes = Some(5_000);
        repos
            .clips
            .create(&wrong_source)
            .await
            .expect("wrong source clip");

        let mut too_short = NewClip::new(&user.id, "Too short", "local");
        too_short.status = "ready".to_string();
        too_short.source_type = Some("replay".to_string());
        too_short.duration_ms = Some(5_000);
        too_short.file_size_bytes = Some(5_000);
        repos.clips.create(&too_short).await.expect("short clip");

        let mut too_large = NewClip::new(&user.id, "Too large", "local");
        too_large.status = "ready".to_string();
        too_large.source_type = Some("replay".to_string());
        too_large.duration_ms = Some(25_000);
        too_large.file_size_bytes = Some(50_000);
        repos.clips.create(&too_large).await.expect("large clip");

        let params = ClipListParams {
            owner_user_id: user.id.clone(),
            game: None,
            game_category_id: None,
            source_type: Some("replay".to_string()),
            visibility: None,
            status: None,
            from: None,
            to: None,
            min_duration_ms: Some(10_000),
            max_duration_ms: Some(40_000),
            min_size_bytes: Some(1_000),
            max_size_bytes: Some(10_000),
            query: None,
            sort: ClipSort::FileSizeDesc,
            limit: 10,
            offset: 0,
        };
        let clips = repos
            .clips
            .list_for_owner(&params)
            .await
            .expect("advanced query clips");
        assert_eq!(
            clips
                .iter()
                .map(|clip| clip.title.as_str())
                .collect::<Vec<_>>(),
            vec!["Large match", "Small match"]
        );
    }

    async fn assert_public_clip_query_discovers_only_public_ready_clips(database: Database) {
        let test_id = new_ulid().to_ascii_lowercase();
        let repos = Repositories::new(database);
        let user = repos
            .users
            .create(&NewUser::new(format!("owner-{test_id}"), "hash", "user"))
            .await
            .expect("create user");

        let mut public = NewClip::new(&user.id, "public Renata clip", "local");
        public.status = "ready".to_string();
        public.visibility = "public".to_string();
        public.public_share_id = Some(format!("public-{test_id}"));
        public.game_name = Some("Renata Glasc".to_string());
        let public = repos.clips.create(&public).await.expect("public clip");

        let mut unlisted = NewClip::new(&user.id, "unlisted clip", "local");
        unlisted.status = "ready".to_string();
        unlisted.visibility = "unlisted".to_string();
        unlisted.public_share_id = Some(format!("unlisted-{test_id}"));
        repos.clips.create(&unlisted).await.expect("unlisted clip");

        let mut private = NewClip::new(&user.id, "private clip", "local");
        private.status = "ready".to_string();
        private.visibility = "private".to_string();
        repos.clips.create(&private).await.expect("private clip");

        let mut processing = NewClip::new(&user.id, "processing public clip", "local");
        processing.status = "processing".to_string();
        processing.visibility = "public".to_string();
        processing.public_share_id = Some(format!("processing-{test_id}"));
        repos
            .clips
            .create(&processing)
            .await
            .expect("processing clip");

        let mut no_share = NewClip::new(&user.id, "public without share id", "local");
        no_share.status = "ready".to_string();
        no_share.visibility = "public".to_string();
        repos.clips.create(&no_share).await.expect("no-share clip");

        let mut deleted = NewClip::new(&user.id, "deleted public clip", "local");
        deleted.status = "ready".to_string();
        deleted.visibility = "public".to_string();
        deleted.public_share_id = Some(format!("deleted-{test_id}"));
        let deleted = repos.clips.create(&deleted).await.expect("deleted clip");
        repos
            .clips
            .soft_delete(&deleted.id)
            .await
            .expect("soft delete clip");

        let mut params = PublicClipListParams {
            owner_user_id: None,
            game: None,
            game_category_id: None,
            query: None,
            sort: ClipSort::UploadedAtDesc,
            limit: 10,
            offset: 0,
        };
        let clips = repos
            .clips
            .list_public(&params)
            .await
            .expect("list public clips");
        assert_eq!(clips.len(), 1);
        assert_eq!(clips[0].title, "public Renata clip");

        params.query = Some("renata".to_string());
        assert_eq!(
            repos
                .clips
                .list_public(&params)
                .await
                .expect("search public clips")
                .len(),
            1
        );

        params.query = None;
        params.game = Some("Renata Glasc".to_string());
        assert_eq!(
            repos
                .clips
                .list_public(&params)
                .await
                .expect("filter public clips")
                .len(),
            1
        );

        let other_user = repos
            .users
            .create(&NewUser::new(format!("other-{test_id}"), "hash", "user"))
            .await
            .expect("create other user");
        let mut other_public = NewClip::new(&other_user.id, "other public clip", "local");
        other_public.status = "ready".to_string();
        other_public.visibility = "public".to_string();
        other_public.public_share_id = Some(format!("other-public-{test_id}"));
        other_public.game_id = Some("Factorio".to_string());
        repos
            .clips
            .create(&other_public)
            .await
            .expect("other public clip");
        repos
            .reconcile_game_categories()
            .await
            .expect("reconcile game categories");

        params.game = None;
        params.owner_user_id = Some(user.id.clone());
        assert_eq!(
            repos
                .clips
                .list_public(&params)
                .await
                .expect("filter public clips by owner")
                .len(),
            1
        );
        params.owner_user_id = Some(other_user.id.clone());
        assert_eq!(
            repos
                .clips
                .list_public(&params)
                .await
                .expect("filter other public clips by owner")
                .len(),
            1
        );
        assert_eq!(
            repos
                .clips
                .list_public_games()
                .await
                .expect("list public games"),
            vec![PublicGameSummary {
                category_id: repos
                    .game_categories
                    .get_by_reported_name("Renata Glasc")
                    .await
                    .expect("find Renata category")
                    .expect("Renata category")
                    .id,
                display_name: "Renata Glasc".to_string(),
                clip_count: 1,
            }]
        );
        assert_eq!(
            repos
                .clips
                .count_public_for_owner(&user.id)
                .await
                .expect("count public clips for owner"),
            1
        );

        let view_count = repos
            .clips
            .increment_view_count(&public.id)
            .await
            .expect("increment view count");
        assert_eq!(view_count, 1);

        let comment = repos
            .clip_comments
            .create(&NewClipComment::new(&public.id, &user.id, "looks good"))
            .await
            .expect("create comment");
        assert_eq!(comment.body, "looks good");
        assert!(comment.parent_comment_id.is_none());
        let mut reply = NewClipComment::new(&public.id, &user.id, "agreed");
        reply.parent_comment_id = Some(comment.id.clone());
        let reply = repos
            .clip_comments
            .create(&reply)
            .await
            .expect("create reply");
        assert_eq!(
            reply.parent_comment_id.as_deref(),
            Some(comment.id.as_str())
        );
        assert_eq!(
            repos
                .clip_comments
                .list_for_clip(&public.id, 10)
                .await
                .expect("list comments")
                .len(),
            2
        );
        assert!(repos
            .clip_comments
            .soft_delete(&comment.id)
            .await
            .expect("soft delete comment"));
        assert!(!repos
            .clip_comments
            .soft_delete(&comment.id)
            .await
            .expect("second soft delete is a no-op"));
        assert!(repos
            .clip_comments
            .soft_delete(&reply.id)
            .await
            .expect("soft delete reply"));
        assert_eq!(
            repos
                .clip_comments
                .list_for_clip(&public.id, 10)
                .await
                .expect("list comments after soft delete")
                .len(),
            0
        );
    }

    async fn assert_public_clip_count_for_owner_is_not_page_limited(database: Database) {
        let test_id = new_ulid().to_ascii_lowercase();
        let repos = Repositories::new(database);
        let user = repos
            .users
            .create(&NewUser::new(format!("profile-{test_id}"), "hash", "user"))
            .await
            .expect("create user");

        for index in 0..65 {
            let mut clip = NewClip::new(&user.id, format!("public clip {index}"), "local");
            clip.status = "ready".to_string();
            clip.visibility = "public".to_string();
            clip.public_share_id = Some(format!("profile-{test_id}-{index}"));
            repos.clips.create(&clip).await.expect("create clip");
        }

        assert_eq!(
            repos
                .clips
                .count_public_for_owner(&user.id)
                .await
                .expect("count clips"),
            65
        );
    }

    async fn assert_clip_comments_limit_keeps_newest_comments(database: Database) {
        let test_id = new_ulid().to_ascii_lowercase();
        let repos = Repositories::new(database);
        let user = repos
            .users
            .create(&NewUser::new(
                format!("commenter-{test_id}"),
                "hash",
                "user",
            ))
            .await
            .expect("create user");
        let mut clip = NewClip::new(&user.id, "commented clip", "local");
        clip.status = "ready".to_string();
        let clip = repos.clips.create(&clip).await.expect("create clip");

        for index in 0..3 {
            let mut comment = NewClipComment::new(&clip.id, &user.id, format!("comment {index}"));
            comment.created_at = now_utc() + ChronoDuration::seconds(index);
            comment.updated_at = comment.created_at;
            repos
                .clip_comments
                .create(&comment)
                .await
                .expect("create comment");
        }

        let comments = repos
            .clip_comments
            .list_for_clip(&clip.id, 2)
            .await
            .expect("list comments");
        assert_eq!(
            comments
                .iter()
                .map(|comment| comment.body.as_str())
                .collect::<Vec<_>>(),
            vec!["comment 1", "comment 2"]
        );
    }

    #[tokio::test]
    async fn sqlite_bulk_soft_delete_rolls_back_when_audit_fails() {
        let (_temp_dir, database) = sqlite_test_database().await;
        assert_bulk_soft_delete_rolls_back_when_audit_fails(database).await;
    }

    #[tokio::test]
    async fn postgres_bulk_soft_delete_rolls_back_when_audit_fails() {
        let Some(database) = postgres_test_database().await else {
            return;
        };
        assert_bulk_soft_delete_rolls_back_when_audit_fails(database).await;
    }

    async fn assert_bulk_soft_delete_rolls_back_when_audit_fails(database: Database) {
        let repos = Repositories::new(database);
        let user = repos
            .users
            .create(&NewUser::new(
                format!("owner-{}", new_ulid()),
                "hash",
                "user",
            ))
            .await
            .expect("create user");
        let mut first = NewClip::new(&user.id, "first", "local");
        first.status = "ready".to_string();
        let first = repos.clips.create(&first).await.expect("first clip");
        let mut second = NewClip::new(&user.id, "second", "local");
        second.status = "ready".to_string();
        let second = repos.clips.create(&second).await.expect("second clip");

        let err = repos
            .bulk_soft_delete_clips_with_audit(
                &user.id,
                &[first.id.clone(), second.id.clone()],
                Some("missing-actor"),
                Some("127.0.0.1"),
            )
            .await
            .expect_err("invalid audit actor should fail");
        assert!(matches!(err, DbError::Sqlx(sqlx::Error::Database(_))));

        assert_eq!(
            repos
                .clips
                .get(&first.id)
                .await
                .expect("get first")
                .expect("first")
                .status,
            "ready"
        );
        assert_eq!(
            repos
                .clips
                .get(&second.id)
                .await
                .expect("get second")
                .expect("second")
                .status,
            "ready"
        );
        assert!(repos
            .audit_log
            .list_recent(10)
            .await
            .expect("audit entries")
            .is_empty());
    }

    #[tokio::test]
    async fn sqlite_bulk_visibility_updates_and_audits_each_clip() {
        let (_temp_dir, database) = sqlite_test_database().await;
        assert_bulk_visibility_updates_and_audits_each_clip(database).await;
    }

    #[tokio::test]
    async fn postgres_bulk_visibility_updates_and_audits_each_clip() {
        let Some(database) = postgres_test_database().await else {
            return;
        };
        assert_bulk_visibility_updates_and_audits_each_clip(database).await;
    }

    async fn assert_bulk_visibility_updates_and_audits_each_clip(database: Database) {
        let test_id = new_ulid().to_ascii_lowercase();
        let repos = Repositories::new(database);
        let user = repos
            .users
            .create(&NewUser::new(format!("owner-{test_id}"), "hash", "user"))
            .await
            .expect("create user");
        let mut first = NewClip::new(&user.id, "first", "local");
        first.status = "ready".to_string();
        let first = repos.clips.create(&first).await.expect("first clip");
        let mut second = NewClip::new(&user.id, "second", "local");
        second.status = "ready".to_string();
        let second = repos.clips.create(&second).await.expect("second clip");

        let updates = vec![
            BulkVisibilityUpdate {
                clip_id: first.id.clone(),
                public_share_id: Some(format!("c_{test_id}a")),
            },
            BulkVisibilityUpdate {
                clip_id: second.id.clone(),
                public_share_id: Some(format!("c_{test_id}b")),
            },
        ];
        let affected = repos
            .bulk_set_visibility_with_audit(
                &user.id,
                &updates,
                "public",
                Some(&user.id),
                Some("127.0.0.1"),
            )
            .await
            .expect("bulk visibility");
        assert_eq!(affected, 2);
        assert_eq!(
            repos
                .clips
                .get(&first.id)
                .await
                .expect("get first")
                .expect("first")
                .visibility,
            "public"
        );
        assert_eq!(
            repos
                .audit_log
                .list_recent(10)
                .await
                .expect("audit entries")
                .iter()
                .filter(|entry| entry.action == "clip.visibility_changed")
                .count(),
            2
        );
    }

    #[tokio::test]
    async fn reset_password_token_mark_used_if_valid_is_single_use() {
        let (_temp_dir, database) = sqlite_test_database().await;
        let repos = Repositories::new(database);
        let user = repos
            .users
            .create(&NewUser::new(
                format!("owner-{}", new_ulid()),
                "hash",
                "user",
            ))
            .await
            .expect("create user");
        let token = repos
            .reset_password_tokens
            .create(&NewResetPasswordToken::new(
                &user.id,
                format!("reset-token-{}", new_ulid()),
                now_utc() + ChronoDuration::minutes(5),
            ))
            .await
            .expect("create token");

        assert!(repos
            .reset_password_tokens
            .mark_used_if_valid(&token.id, now_utc())
            .await
            .expect("first use"));
        assert!(!repos
            .reset_password_tokens
            .mark_used_if_valid(&token.id, now_utc())
            .await
            .expect("second use"));
    }

    #[tokio::test]
    async fn sqlite_reset_redemption_updates_password_and_token_atomically() {
        let (_temp_dir, database) = sqlite_test_database().await;
        assert_reset_redemption_updates_password_and_token_atomically(database).await;
    }

    #[tokio::test]
    async fn postgres_reset_redemption_updates_password_and_token_atomically() {
        let Some(database) = postgres_test_database().await else {
            return;
        };
        assert_reset_redemption_updates_password_and_token_atomically(database).await;
    }

    async fn assert_reset_redemption_updates_password_and_token_atomically(database: Database) {
        let repos = Repositories::new(database);
        let user = repos
            .users
            .create(&NewUser::new(
                format!("reset-target-{}", new_ulid()),
                "old-hash",
                "user",
            ))
            .await
            .expect("target user");
        let other = repos
            .users
            .create(&NewUser::new(
                format!("reset-other-{}", new_ulid()),
                "other-hash",
                "user",
            ))
            .await
            .expect("other user");
        let token = repos
            .reset_password_tokens
            .create(&NewResetPasswordToken::new(
                &user.id,
                format!("atomic-reset-{}", new_ulid()),
                now_utc() + ChronoDuration::minutes(5),
            ))
            .await
            .expect("reset token");

        assert!(!repos
            .redeem_reset_password_token(&token.id, &other.id, "new-hash", now_utc())
            .await
            .expect("mismatched redemption"));
        assert!(repos
            .reset_password_tokens
            .get(&token.id)
            .await
            .expect("token")
            .expect("token")
            .used_at
            .is_none());
        assert_eq!(
            repos
                .users
                .get(&user.id)
                .await
                .expect("user")
                .expect("user")
                .password_hash,
            "old-hash"
        );

        assert!(repos
            .redeem_reset_password_token(&token.id, &user.id, "new-hash", now_utc())
            .await
            .expect("valid redemption"));
        assert_eq!(
            repos
                .users
                .get(&user.id)
                .await
                .expect("updated user")
                .expect("updated user")
                .password_hash,
            "new-hash"
        );
        assert!(repos
            .reset_password_tokens
            .get(&token.id)
            .await
            .expect("used token")
            .expect("used token")
            .used_at
            .is_some());
    }

    #[tokio::test]
    async fn postgres_repositories_round_trip_text_ip_addresses() {
        let Some(database) = postgres_test_database().await else {
            return;
        };
        let repos = Repositories::new(database);
        let user = repos
            .users
            .create(&NewUser::new(
                format!("pg-ip-{}", new_ulid()),
                "hash",
                "user",
            ))
            .await
            .expect("create user");
        let mut session = NewSession::new(
            &user.id,
            format!("session-token-{}", new_ulid()),
            now_utc() + ChronoDuration::hours(1),
        );
        session.ip_address = Some("203.0.113.7".to_string());
        let session = repos.sessions.create(&session).await.expect("session");
        assert_eq!(session.ip_address.as_deref(), Some("203.0.113.7"));

        let mut audit = NewAuditLogEntry::new("postgres.ip_address.round_trip");
        audit.actor_user_id = Some(user.id.clone());
        audit.ip_address = Some("2001:db8::1".to_string());
        let audit = repos.audit_log.create(&audit).await.expect("audit");
        assert_eq!(audit.ip_address.as_deref(), Some("2001:db8::1"));
    }

    #[tokio::test]
    async fn partial_client_clip_id_index_allows_nulls_and_rejects_duplicate_keys() {
        let (_temp_dir, database) = sqlite_test_database().await;
        assert_partial_client_clip_id_index_allows_nulls_and_rejects_duplicate_keys(database).await;
    }

    #[tokio::test]
    async fn postgres_partial_client_clip_id_index_allows_nulls_and_rejects_duplicate_keys() {
        let Some(database) = postgres_test_database().await else {
            return;
        };
        assert_partial_client_clip_id_index_allows_nulls_and_rejects_duplicate_keys(database).await;
    }

    async fn assert_partial_client_clip_id_index_allows_nulls_and_rejects_duplicate_keys(
        database: Database,
    ) {
        let test_id = new_ulid().to_ascii_lowercase();
        let repos = Repositories::new(database);

        let user = repos
            .users
            .create(&NewUser::new(format!("owner-{test_id}"), "hash", "user"))
            .await
            .expect("create user");

        repos
            .clips
            .create(&NewClip::new(&user.id, "null client id 1", "local"))
            .await
            .expect("first null client id");
        repos
            .clips
            .create(&NewClip::new(&user.id, "null client id 2", "local"))
            .await
            .expect("second null client id");

        let mut first = NewClip::new(&user.id, "duplicate key 1", "local");
        first.client_clip_id = Some(format!("client-clip-id-{test_id}"));
        repos.clips.create(&first).await.expect("first client id");

        let mut duplicate = NewClip::new(&user.id, "duplicate key 2", "local");
        duplicate.client_clip_id = first.client_clip_id.clone();
        let err = repos
            .clips
            .create(&duplicate)
            .await
            .expect_err("duplicate client id should fail");

        assert!(matches!(err, DbError::Sqlx(sqlx::Error::Database(_))));
        assert!(err.is_unique_violation());

        let first = repos
            .clips
            .get_by_owner_client_clip_id(&user.id, first.client_clip_id.as_deref().unwrap())
            .await
            .expect("lookup first")
            .expect("first clip");
        repos
            .clips
            .soft_delete(&first.id)
            .await
            .expect("soft delete first clip");
        assert!(repos
            .clips
            .get_by_owner_client_clip_id(&user.id, first.client_clip_id.as_deref().unwrap())
            .await
            .expect("lookup deleted")
            .is_none());

        repos
            .clips
            .create(&duplicate)
            .await
            .expect("duplicate client id is reusable after soft delete");
    }

    #[tokio::test]
    async fn job_claim_is_atomic_under_contention() {
        let (_temp_dir, database) = sqlite_test_database().await;
        assert_job_claim_is_atomic_under_contention(database).await;
    }

    #[tokio::test]
    async fn postgres_job_claim_is_atomic_under_contention() {
        let Some(database) = postgres_test_database().await else {
            return;
        };
        assert_job_claim_is_atomic_under_contention(database).await;
    }

    async fn assert_job_claim_is_atomic_under_contention(database: Database) {
        let repos = Repositories::new(database);
        let job = repos
            .jobs
            .create(&NewJob::new("validate_object", now_utc()))
            .await
            .expect("create job");

        let mut handles = Vec::new();
        for index in 0..20 {
            let repos = repos.clone();
            handles.push(tokio::spawn(async move {
                repos
                    .jobs
                    .claim_next(
                        &format!("runner-{index}"),
                        now_utc() + ChronoDuration::seconds(1),
                        now_utc() - ChronoDuration::minutes(5),
                    )
                    .await
                    .expect("claim")
                    .map(|job| job.id)
            }));
        }

        let claimed = futures_from_handles(handles).await;
        let claimed_ids = claimed.into_iter().flatten().collect::<Vec<_>>();
        assert_eq!(claimed_ids, vec![job.id]);
    }

    #[tokio::test]
    async fn stale_running_job_can_be_claimed_after_lock_timeout() {
        let (_temp_dir, database) = sqlite_test_database().await;
        assert_stale_running_job_can_be_claimed_after_lock_timeout(database).await;
    }

    #[tokio::test]
    async fn postgres_stale_running_job_can_be_claimed_after_lock_timeout() {
        let Some(database) = postgres_test_database().await else {
            return;
        };
        assert_stale_running_job_can_be_claimed_after_lock_timeout(database).await;
    }

    async fn assert_stale_running_job_can_be_claimed_after_lock_timeout(database: Database) {
        let repos = Repositories::new(database);
        let mut job = NewJob::new("validate_object", now_utc() + ChronoDuration::hours(1));
        job.status = "running".to_string();
        job.locked_by = Some("crashed-runner".to_string());
        job.locked_at = Some(now_utc() - ChronoDuration::minutes(10));
        let job = repos.jobs.create(&job).await.expect("create job");

        let claimed = repos
            .jobs
            .claim_next(
                "recovery-runner",
                now_utc(),
                now_utc() - ChronoDuration::minutes(5),
            )
            .await
            .expect("claim stale")
            .expect("stale job claimed");

        assert_eq!(claimed.id, job.id);
        assert_eq!(claimed.locked_by.as_deref(), Some("recovery-runner"));
        assert_eq!(claimed.attempts, 1);
    }

    async fn futures_from_handles<T>(handles: Vec<tokio::task::JoinHandle<T>>) -> Vec<T> {
        let mut out = Vec::new();
        for handle in handles {
            out.push(handle.await.expect("join"));
        }
        out
    }
}
