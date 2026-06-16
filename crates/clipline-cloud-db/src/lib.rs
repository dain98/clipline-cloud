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
const POSTGRES_MIGRATION_ADVISORY_LOCK_ID: i64 = 0x434c_504c_494e_45;
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
                "audit_log",
                "clip_markers",
                "clips",
                "device_tokens",
                "jobs",
                "reset_password_tokens",
                "sessions",
                "upload_parts",
                "upload_sessions",
                "users",
            ]
        );
    }

    #[test]
    fn postgres_placeholder_conversion_is_sequential() {
        assert_eq!(
            postgres_placeholders("SELECT * FROM users WHERE id = ? AND username = ?"),
            "SELECT * FROM users WHERE id = $1 AND username = $2"
        );
    }

    #[tokio::test]
    async fn sqlite_migration_creates_expected_tables_and_is_idempotent() {
        let (_temp_dir, database) = sqlite_test_database().await;
        assert_migrations_are_idempotent(&database).await;
    }

    #[tokio::test]
    async fn postgres_migration_creates_expected_tables_and_is_idempotent() {
        let Some(database) = postgres_test_database().await else {
            return;
        };
        assert_migrations_are_idempotent(&database).await;
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

        let mut new_user = NewUser::new(&username, "argon2id-hash", "admin");
        new_user.display_name = Some("Dain".to_string());
        let user = repos.users.create(&new_user).await.expect("create user");
        assert_eq!(user.username, username);

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
        repos
            .upload_sessions
            .update_received_size(&upload_session.id, 512)
            .await
            .expect("update received");
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
        repos
            .upload_sessions
            .complete(&upload_session.id)
            .await
            .expect("complete upload");

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
    }

    async fn futures_from_handles<T>(handles: Vec<tokio::task::JoinHandle<T>>) -> Vec<T> {
        let mut out = Vec::new();
        for handle in handles {
            out.push(handle.await.expect("join"));
        }
        out
    }
}
