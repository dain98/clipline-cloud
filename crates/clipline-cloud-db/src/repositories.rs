use chrono::{DateTime, Utc};
use sqlx::{Postgres, QueryBuilder, Sqlite};

use crate::{
    db_execute, db_execute_rows, db_fetch_all, db_fetch_optional, now_utc, AuditLogEntry, Clip,
    ClipMarker, Database, DbResult, DeviceToken, Job, NewAuditLogEntry, NewClip, NewClipMarker,
    NewDeviceToken, NewJob, NewResetPasswordToken, NewSession, NewUploadPart, NewUploadSession,
    NewUser, ResetPasswordToken, Session, UploadPart, UploadSession, User,
};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ClipSort {
    RecordedAtDesc,
    RecordedAtAsc,
    UploadedAtDesc,
    UploadedAtAsc,
    DurationDesc,
    DurationAsc,
    TitleAsc,
}

#[derive(Debug, Clone)]
pub struct ClipListParams {
    pub owner_user_id: String,
    pub game: Option<String>,
    pub visibility: Option<String>,
    pub status: Option<String>,
    pub from: Option<DateTime<Utc>>,
    pub to: Option<DateTime<Utc>>,
    pub query: Option<String>,
    pub sort: ClipSort,
    pub limit: i64,
    pub offset: i64,
}

#[derive(Clone)]
pub struct Repositories {
    pub users: UserRepository,
    pub sessions: SessionRepository,
    pub device_tokens: DeviceTokenRepository,
    pub clips: ClipRepository,
    pub clip_markers: ClipMarkerRepository,
    pub upload_sessions: UploadSessionRepository,
    pub upload_parts: UploadPartRepository,
    pub jobs: JobRepository,
    pub audit_log: AuditLogRepository,
    pub reset_password_tokens: ResetPasswordTokenRepository,
}

impl Repositories {
    pub fn new(database: Database) -> Self {
        Self {
            users: UserRepository::new(database.clone()),
            sessions: SessionRepository::new(database.clone()),
            device_tokens: DeviceTokenRepository::new(database.clone()),
            clips: ClipRepository::new(database.clone()),
            clip_markers: ClipMarkerRepository::new(database.clone()),
            upload_sessions: UploadSessionRepository::new(database.clone()),
            upload_parts: UploadPartRepository::new(database.clone()),
            jobs: JobRepository::new(database.clone()),
            audit_log: AuditLogRepository::new(database.clone()),
            reset_password_tokens: ResetPasswordTokenRepository::new(database),
        }
    }
}

#[derive(Clone)]
pub struct UserRepository {
    database: Database,
}

impl UserRepository {
    pub fn new(database: Database) -> Self {
        Self { database }
    }

    pub async fn create(&self, new: &NewUser) -> DbResult<User> {
        db_execute!(
            &self.database,
            "INSERT INTO users (id, username, display_name, password_hash, role, is_disabled, created_at, updated_at, last_login_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
                &new.id,
                &new.username,
                new.display_name.as_deref(),
                &new.password_hash,
                &new.role,
                new.is_disabled,
                new.created_at,
                new.updated_at,
                new.last_login_at,
            ]
        )?;

        Ok(self
            .get(&new.id)
            .await?
            .expect("inserted user should exist"))
    }

    pub async fn get(&self, id: &str) -> DbResult<Option<User>> {
        Ok(db_fetch_optional!(
            &self.database,
            User,
            "SELECT id, username, display_name, password_hash, role, is_disabled, created_at, updated_at, last_login_at
             FROM users WHERE id = ?",
            [id]
        )?)
    }

    pub async fn get_by_username(&self, username: &str) -> DbResult<Option<User>> {
        Ok(db_fetch_optional!(
            &self.database,
            User,
            "SELECT id, username, display_name, password_hash, role, is_disabled, created_at, updated_at, last_login_at
             FROM users WHERE username = ?",
            [username]
        )?)
    }

    pub async fn list(&self) -> DbResult<Vec<User>> {
        Ok(db_fetch_all!(
            &self.database,
            User,
            "SELECT id, username, display_name, password_hash, role, is_disabled, created_at, updated_at, last_login_at
             FROM users ORDER BY username ASC",
            []
        )?)
    }

    pub async fn count_all(&self) -> DbResult<i64> {
        Ok(
            db_fetch_optional!(&self.database, (i64,), "SELECT COUNT(*) FROM users", [])?
                .map(|row| row.0)
                .unwrap_or_default(),
        )
    }

    pub async fn count_admins(&self) -> DbResult<i64> {
        Ok(db_fetch_optional!(
            &self.database,
            (i64,),
            "SELECT COUNT(*) FROM users WHERE role = 'admin'",
            []
        )?
        .map(|row| row.0)
        .unwrap_or_default())
    }

    pub async fn update_profile(
        &self,
        id: &str,
        display_name: Option<&str>,
        role: &str,
        is_disabled: bool,
    ) -> DbResult<()> {
        db_execute!(
            &self.database,
            "UPDATE users SET display_name = ?, role = ?, is_disabled = ?, updated_at = ? WHERE id = ?",
            [display_name, role, is_disabled, now_utc(), id]
        )?;
        Ok(())
    }

    pub async fn update_password_hash(&self, id: &str, password_hash: &str) -> DbResult<()> {
        db_execute!(
            &self.database,
            "UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?",
            [password_hash, now_utc(), id]
        )?;
        Ok(())
    }

    pub async fn set_disabled(&self, id: &str, is_disabled: bool) -> DbResult<()> {
        db_execute!(
            &self.database,
            "UPDATE users SET is_disabled = ?, updated_at = ? WHERE id = ?",
            [is_disabled, now_utc(), id]
        )?;
        Ok(())
    }

    pub async fn update_last_login(&self, id: &str) -> DbResult<()> {
        let now = now_utc();
        db_execute!(
            &self.database,
            "UPDATE users SET last_login_at = ?, updated_at = ? WHERE id = ?",
            [now, now, id]
        )?;
        Ok(())
    }

    pub async fn delete(&self, id: &str) -> DbResult<()> {
        db_execute!(&self.database, "DELETE FROM users WHERE id = ?", [id])?;
        Ok(())
    }
}

#[derive(Clone)]
pub struct SessionRepository {
    database: Database,
}

impl SessionRepository {
    pub fn new(database: Database) -> Self {
        Self { database }
    }

    pub async fn create(&self, new: &NewSession) -> DbResult<Session> {
        let insert_sql = match &self.database {
            Database::Sqlite(_) => {
                "INSERT INTO sessions (id, user_id, token_hash, user_agent, ip_address, created_at, last_used_at, expires_at, revoked_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
            }
            Database::Postgres(_) => {
                "INSERT INTO sessions (id, user_id, token_hash, user_agent, ip_address, created_at, last_used_at, expires_at, revoked_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
            }
        };

        db_execute!(
            &self.database,
            insert_sql,
            [
                &new.id,
                &new.user_id,
                &new.token_hash,
                new.user_agent.as_deref(),
                new.ip_address.as_deref(),
                new.created_at,
                new.last_used_at,
                new.expires_at,
                new.revoked_at,
            ]
        )?;

        Ok(self
            .get(&new.id)
            .await?
            .expect("inserted session should exist"))
    }

    pub async fn get(&self, id: &str) -> DbResult<Option<Session>> {
        Ok(db_fetch_optional!(
            &self.database,
            Session,
            "SELECT id, user_id, token_hash, user_agent, CAST(ip_address AS TEXT) AS ip_address, created_at, last_used_at, expires_at, revoked_at
             FROM sessions WHERE id = ?",
            [id]
        )?)
    }

    pub async fn get_by_token_hash(&self, token_hash: &str) -> DbResult<Option<Session>> {
        Ok(db_fetch_optional!(
            &self.database,
            Session,
            "SELECT id, user_id, token_hash, user_agent, CAST(ip_address AS TEXT) AS ip_address, created_at, last_used_at, expires_at, revoked_at
             FROM sessions WHERE token_hash = ?",
            [token_hash]
        )?)
    }

    pub async fn touch(&self, id: &str) -> DbResult<()> {
        db_execute!(
            &self.database,
            "UPDATE sessions SET last_used_at = ? WHERE id = ?",
            [now_utc(), id]
        )?;
        Ok(())
    }

    pub async fn revoke(&self, id: &str) -> DbResult<()> {
        db_execute!(
            &self.database,
            "UPDATE sessions SET revoked_at = ? WHERE id = ?",
            [now_utc(), id]
        )?;
        Ok(())
    }

    pub async fn revoke_by_token_hash(&self, token_hash: &str) -> DbResult<()> {
        db_execute!(
            &self.database,
            "UPDATE sessions SET revoked_at = ? WHERE token_hash = ? AND revoked_at IS NULL",
            [now_utc(), token_hash]
        )?;
        Ok(())
    }

    pub async fn revoke_for_user(&self, user_id: &str) -> DbResult<()> {
        db_execute!(
            &self.database,
            "UPDATE sessions SET revoked_at = ? WHERE user_id = ? AND revoked_at IS NULL",
            [now_utc(), user_id]
        )?;
        Ok(())
    }

    pub async fn delete(&self, id: &str) -> DbResult<()> {
        db_execute!(&self.database, "DELETE FROM sessions WHERE id = ?", [id])?;
        Ok(())
    }
}

#[derive(Clone)]
pub struct DeviceTokenRepository {
    database: Database,
}

impl DeviceTokenRepository {
    pub fn new(database: Database) -> Self {
        Self { database }
    }

    pub async fn create(&self, new: &NewDeviceToken) -> DbResult<DeviceToken> {
        db_execute!(
            &self.database,
            "INSERT INTO device_tokens (id, user_id, name, token_hash, created_at, last_used_at, expires_at, revoked_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [
                &new.id,
                &new.user_id,
                &new.name,
                &new.token_hash,
                new.created_at,
                new.last_used_at,
                new.expires_at,
                new.revoked_at,
            ]
        )?;

        Ok(self
            .get(&new.id)
            .await?
            .expect("inserted device token should exist"))
    }

    pub async fn get(&self, id: &str) -> DbResult<Option<DeviceToken>> {
        Ok(db_fetch_optional!(
            &self.database,
            DeviceToken,
            "SELECT id, user_id, name, token_hash, created_at, last_used_at, expires_at, revoked_at
             FROM device_tokens WHERE id = ?",
            [id]
        )?)
    }

    pub async fn get_by_token_hash(&self, token_hash: &str) -> DbResult<Option<DeviceToken>> {
        Ok(db_fetch_optional!(
            &self.database,
            DeviceToken,
            "SELECT id, user_id, name, token_hash, created_at, last_used_at, expires_at, revoked_at
             FROM device_tokens WHERE token_hash = ?",
            [token_hash]
        )?)
    }

    pub async fn list_for_user(&self, user_id: &str) -> DbResult<Vec<DeviceToken>> {
        Ok(db_fetch_all!(
            &self.database,
            DeviceToken,
            "SELECT id, user_id, name, token_hash, created_at, last_used_at, expires_at, revoked_at
             FROM device_tokens WHERE user_id = ? ORDER BY created_at DESC",
            [user_id]
        )?)
    }

    pub async fn touch(&self, id: &str) -> DbResult<()> {
        db_execute!(
            &self.database,
            "UPDATE device_tokens SET last_used_at = ? WHERE id = ?",
            [now_utc(), id]
        )?;
        Ok(())
    }

    pub async fn revoke(&self, id: &str) -> DbResult<()> {
        db_execute!(
            &self.database,
            "UPDATE device_tokens SET revoked_at = ? WHERE id = ?",
            [now_utc(), id]
        )?;
        Ok(())
    }

    pub async fn revoke_for_user(&self, user_id: &str, id: &str) -> DbResult<()> {
        db_execute!(
            &self.database,
            "UPDATE device_tokens SET revoked_at = ? WHERE user_id = ? AND id = ?",
            [now_utc(), user_id, id]
        )?;
        Ok(())
    }

    pub async fn revoke_all_for_user(&self, user_id: &str) -> DbResult<()> {
        db_execute!(
            &self.database,
            "UPDATE device_tokens SET revoked_at = ? WHERE user_id = ? AND revoked_at IS NULL",
            [now_utc(), user_id]
        )?;
        Ok(())
    }

    pub async fn delete(&self, id: &str) -> DbResult<()> {
        db_execute!(
            &self.database,
            "DELETE FROM device_tokens WHERE id = ?",
            [id]
        )?;
        Ok(())
    }
}

#[derive(Clone)]
pub struct ClipRepository {
    database: Database,
}

impl ClipRepository {
    pub fn new(database: Database) -> Self {
        Self { database }
    }

    pub async fn create(&self, new: &NewClip) -> DbResult<Clip> {
        db_execute!(
            &self.database,
            "INSERT INTO clips (
               id, owner_user_id, client_clip_id, title, game_name, game_id, game_executable, source_type,
               recorded_at, uploaded_at, duration_ms, file_size_bytes, width, height, fps, container,
               video_codec, audio_codec, checksum_sha256, visibility, status, storage_backend, storage_key,
               poster_key, thumbnail_key, public_share_id, created_at, updated_at, deleted_at
             )
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
                &new.id,
                &new.owner_user_id,
                new.client_clip_id.as_deref(),
                &new.title,
                new.game_name.as_deref(),
                new.game_id.as_deref(),
                new.game_executable.as_deref(),
                new.source_type.as_deref(),
                new.recorded_at,
                new.uploaded_at,
                new.duration_ms,
                new.file_size_bytes,
                new.width,
                new.height,
                new.fps,
                new.container.as_deref(),
                new.video_codec.as_deref(),
                new.audio_codec.as_deref(),
                new.checksum_sha256.as_deref(),
                &new.visibility,
                &new.status,
                &new.storage_backend,
                new.storage_key.as_deref(),
                new.poster_key.as_deref(),
                new.thumbnail_key.as_deref(),
                new.public_share_id.as_deref(),
                new.created_at,
                new.updated_at,
                new.deleted_at,
            ]
        )?;

        Ok(self
            .get(&new.id)
            .await?
            .expect("inserted clip should exist"))
    }

    pub async fn get(&self, id: &str) -> DbResult<Option<Clip>> {
        Ok(db_fetch_optional!(
            &self.database,
            Clip,
            CLIP_SELECT_SQL.to_string() + " WHERE id = ?",
            [id]
        )?)
    }

    pub async fn get_owned_ready(&self, owner_user_id: &str, id: &str) -> DbResult<Option<Clip>> {
        Ok(db_fetch_optional!(
            &self.database,
            Clip,
            CLIP_SELECT_SQL.to_string()
                + " WHERE owner_user_id = ? AND id = ? AND status = 'ready' AND deleted_at IS NULL",
            [owner_user_id, id]
        )?)
    }

    pub async fn get_owned_non_deleted(
        &self,
        owner_user_id: &str,
        id: &str,
    ) -> DbResult<Option<Clip>> {
        Ok(db_fetch_optional!(
            &self.database,
            Clip,
            CLIP_SELECT_SQL.to_string()
                + " WHERE owner_user_id = ? AND id = ? AND deleted_at IS NULL",
            [owner_user_id, id]
        )?)
    }

    pub async fn get_by_owner_client_clip_id(
        &self,
        owner_user_id: &str,
        client_clip_id: &str,
    ) -> DbResult<Option<Clip>> {
        Ok(db_fetch_optional!(
            &self.database,
            Clip,
            CLIP_SELECT_SQL.to_string() + " WHERE owner_user_id = ? AND client_clip_id = ?",
            [owner_user_id, client_clip_id]
        )?)
    }

    pub async fn get_by_public_share_id(&self, public_share_id: &str) -> DbResult<Option<Clip>> {
        Ok(db_fetch_optional!(
            &self.database,
            Clip,
            CLIP_SELECT_SQL.to_string()
                + " WHERE public_share_id = ? AND status = 'ready' AND deleted_at IS NULL
                    AND visibility IN ('public','unlisted')",
            [public_share_id]
        )?)
    }

    pub async fn list_for_owner(&self, params: &ClipListParams) -> DbResult<Vec<Clip>> {
        match &self.database {
            Database::Sqlite(pool) => {
                let mut builder = QueryBuilder::<Sqlite>::new(CLIP_SELECT_SQL);
                push_clip_list_filters_sqlite(&mut builder, params);
                builder.push(clip_order_by(params.sort));
                builder.push(" LIMIT ");
                builder.push_bind(params.limit);
                builder.push(" OFFSET ");
                builder.push_bind(params.offset);
                Ok(builder.build_query_as::<Clip>().fetch_all(pool).await?)
            }
            Database::Postgres(pool) => {
                let mut builder = QueryBuilder::<Postgres>::new(CLIP_SELECT_SQL);
                push_clip_list_filters_postgres(&mut builder, params);
                builder.push(clip_order_by(params.sort));
                builder.push(" LIMIT ");
                builder.push_bind(params.limit);
                builder.push(" OFFSET ");
                builder.push_bind(params.offset);
                Ok(builder.build_query_as::<Clip>().fetch_all(pool).await?)
            }
        }
    }

    pub async fn list_ready_with_storage_key(&self, limit: i64) -> DbResult<Vec<Clip>> {
        Ok(db_fetch_all!(
            &self.database,
            Clip,
            CLIP_SELECT_SQL.to_string()
                + " WHERE status = 'ready' AND deleted_at IS NULL AND storage_key IS NOT NULL
                    ORDER BY updated_at ASC, id ASC LIMIT ?",
            [limit]
        )?)
    }

    pub async fn list_deleted(&self, limit: i64) -> DbResult<Vec<Clip>> {
        Ok(db_fetch_all!(
            &self.database,
            Clip,
            CLIP_SELECT_SQL.to_string()
                + " WHERE status = 'deleted' OR deleted_at IS NOT NULL
                    ORDER BY COALESCE(deleted_at, updated_at) ASC, id ASC LIMIT ?",
            [limit]
        )?)
    }

    pub async fn list_active_storage_references(&self) -> DbResult<Vec<String>> {
        let rows = db_fetch_all!(
            &self.database,
            (String,),
            "SELECT storage_key FROM clips
             WHERE deleted_at IS NULL AND status <> 'deleted' AND storage_key IS NOT NULL
             UNION
             SELECT poster_key FROM clips
             WHERE deleted_at IS NULL AND status <> 'deleted' AND poster_key IS NOT NULL
             UNION
             SELECT thumbnail_key FROM clips
             WHERE deleted_at IS NULL AND status <> 'deleted' AND thumbnail_key IS NOT NULL",
            []
        )?;
        Ok(rows.into_iter().map(|row| row.0).collect())
    }

    pub async fn count_non_deleted(&self) -> DbResult<i64> {
        Ok(db_fetch_optional!(
            &self.database,
            (i64,),
            "SELECT COUNT(*) FROM clips WHERE deleted_at IS NULL AND status <> 'deleted'",
            []
        )?
        .map(|row| row.0)
        .unwrap_or_default())
    }

    pub async fn total_storage_bytes(&self) -> DbResult<i64> {
        Ok(db_fetch_optional!(
            &self.database,
            (i64,),
            "SELECT CAST(COALESCE(SUM(file_size_bytes), 0) AS BIGINT)
             FROM clips WHERE deleted_at IS NULL AND status <> 'deleted'",
            []
        )?
        .map(|row| row.0)
        .unwrap_or_default())
    }

    pub async fn active_storage_bytes_for_owner(&self, owner_user_id: &str) -> DbResult<i64> {
        Ok(db_fetch_optional!(
            &self.database,
            (i64,),
            "SELECT CAST(COALESCE(SUM(file_size_bytes), 0) AS BIGINT)
             FROM clips
             WHERE owner_user_id = ? AND deleted_at IS NULL
               AND status IN ('created','uploading','processing','ready')",
            [owner_user_id]
        )?
        .map(|row| row.0)
        .unwrap_or_default())
    }

    pub async fn update_status(&self, id: &str, status: &str) -> DbResult<()> {
        db_execute!(
            &self.database,
            "UPDATE clips SET status = ?, updated_at = ? WHERE id = ?",
            [status, now_utc(), id]
        )?;
        Ok(())
    }

    pub async fn mark_uploaded_processing(&self, id: &str) -> DbResult<bool> {
        let now = now_utc();
        let rows = db_execute_rows!(
            &self.database,
            "UPDATE clips
             SET status = 'processing', uploaded_at = COALESCE(uploaded_at, ?), updated_at = ?
             WHERE id = ? AND deleted_at IS NULL AND status IN ('created','uploading','processing')",
            [now, now, id]
        )?;
        Ok(rows > 0)
    }

    pub async fn mark_ready(&self, id: &str) -> DbResult<bool> {
        let rows = db_execute_rows!(
            &self.database,
            "UPDATE clips
             SET status = 'ready', updated_at = ?
             WHERE id = ? AND deleted_at IS NULL AND status IN ('processing','ready')",
            [now_utc(), id]
        )?;
        Ok(rows > 0)
    }

    pub async fn mark_failed(&self, id: &str) -> DbResult<bool> {
        let rows = db_execute_rows!(
            &self.database,
            "UPDATE clips
             SET status = 'failed', updated_at = ?
             WHERE id = ? AND deleted_at IS NULL AND status <> 'deleted'",
            [now_utc(), id]
        )?;
        Ok(rows > 0)
    }

    pub async fn set_visibility(
        &self,
        id: &str,
        visibility: &str,
        public_share_id: Option<&str>,
    ) -> DbResult<()> {
        db_execute!(
            &self.database,
            "UPDATE clips SET visibility = ?, public_share_id = ?, updated_at = ? WHERE id = ?",
            [visibility, public_share_id, now_utc(), id]
        )?;
        Ok(())
    }

    #[allow(clippy::too_many_arguments)]
    pub async fn update_metadata(
        &self,
        id: &str,
        title: &str,
        game_name: Option<&str>,
        game_id: Option<&str>,
        game_executable: Option<&str>,
        source_type: Option<&str>,
        recorded_at: Option<DateTime<Utc>>,
        duration_ms: Option<i64>,
    ) -> DbResult<()> {
        db_execute!(
            &self.database,
            "UPDATE clips
             SET title = ?, game_name = ?, game_id = ?, game_executable = ?, source_type = ?,
                 recorded_at = ?, duration_ms = ?, updated_at = ?
             WHERE id = ?",
            [
                title,
                game_name,
                game_id,
                game_executable,
                source_type,
                recorded_at,
                duration_ms,
                now_utc(),
                id
            ]
        )?;
        Ok(())
    }

    #[allow(clippy::too_many_arguments)]
    pub async fn update_probe_metadata(
        &self,
        id: &str,
        duration_ms: Option<i64>,
        width: Option<i64>,
        height: Option<i64>,
        fps: Option<f64>,
        video_codec: Option<&str>,
        audio_codec: Option<&str>,
    ) -> DbResult<()> {
        db_execute!(
            &self.database,
            "UPDATE clips
             SET duration_ms = COALESCE(?, duration_ms),
                 width = COALESCE(?, width),
                 height = COALESCE(?, height),
                 fps = COALESCE(?, fps),
                 video_codec = COALESCE(?, video_codec),
                 audio_codec = COALESCE(?, audio_codec),
                 updated_at = ?
             WHERE id = ? AND deleted_at IS NULL AND status <> 'deleted'",
            [
                duration_ms,
                width,
                height,
                fps,
                video_codec,
                audio_codec,
                now_utc(),
                id,
            ]
        )?;
        Ok(())
    }

    pub async fn set_media_artifact_keys(
        &self,
        id: &str,
        poster_key: Option<&str>,
        thumbnail_key: Option<&str>,
    ) -> DbResult<()> {
        db_execute!(
            &self.database,
            "UPDATE clips
             SET poster_key = COALESCE(?, poster_key),
                 thumbnail_key = COALESCE(?, thumbnail_key),
                 updated_at = ?
             WHERE id = ? AND deleted_at IS NULL AND status <> 'deleted'",
            [poster_key, thumbnail_key, now_utc(), id]
        )?;
        Ok(())
    }

    pub async fn soft_delete(&self, id: &str) -> DbResult<()> {
        let now = now_utc();
        db_execute!(
            &self.database,
            "UPDATE clips SET status = 'deleted', deleted_at = ?, updated_at = ? WHERE id = ?",
            [now, now, id]
        )?;
        Ok(())
    }

    pub async fn delete(&self, id: &str) -> DbResult<()> {
        db_execute!(&self.database, "DELETE FROM clips WHERE id = ?", [id])?;
        Ok(())
    }
}

const CLIP_SELECT_SQL: &str = "SELECT
  id, owner_user_id, client_clip_id, title, game_name, game_id, game_executable, source_type,
  recorded_at, uploaded_at, duration_ms, file_size_bytes, width, height, fps, container,
  video_codec, audio_codec, checksum_sha256, visibility, status, storage_backend, storage_key,
  poster_key, thumbnail_key, public_share_id, created_at, updated_at, deleted_at
  FROM clips";

fn push_clip_list_filters_sqlite(builder: &mut QueryBuilder<'_, Sqlite>, params: &ClipListParams) {
    builder.push(" WHERE owner_user_id = ");
    builder.push_bind(params.owner_user_id.clone());
    builder.push(" AND deleted_at IS NULL");
    push_clip_status_filter_sqlite(builder, params);
    push_clip_optional_filters_sqlite(builder, params);
}

fn push_clip_list_filters_postgres(
    builder: &mut QueryBuilder<'_, Postgres>,
    params: &ClipListParams,
) {
    builder.push(" WHERE owner_user_id = ");
    builder.push_bind(params.owner_user_id.clone());
    builder.push(" AND deleted_at IS NULL");
    push_clip_status_filter_postgres(builder, params);
    push_clip_optional_filters_postgres(builder, params);
}

fn push_clip_status_filter_sqlite(builder: &mut QueryBuilder<'_, Sqlite>, params: &ClipListParams) {
    builder.push(" AND status = ");
    builder.push_bind(params.status.clone().unwrap_or_else(|| "ready".to_string()));
}

fn push_clip_status_filter_postgres(
    builder: &mut QueryBuilder<'_, Postgres>,
    params: &ClipListParams,
) {
    builder.push(" AND status = ");
    builder.push_bind(params.status.clone().unwrap_or_else(|| "ready".to_string()));
}

fn push_clip_optional_filters_sqlite(
    builder: &mut QueryBuilder<'_, Sqlite>,
    params: &ClipListParams,
) {
    if let Some(game) = &params.game {
        builder.push(" AND (game_id = ");
        builder.push_bind(game.clone());
        builder.push(" OR game_name = ");
        builder.push_bind(game.clone());
        builder.push(")");
    }
    if let Some(visibility) = &params.visibility {
        builder.push(" AND visibility = ");
        builder.push_bind(visibility.clone());
    }
    if let Some(from) = params.from {
        builder.push(" AND COALESCE(recorded_at, uploaded_at, created_at) >= ");
        builder.push_bind(from);
    }
    if let Some(to) = params.to {
        builder.push(" AND COALESCE(recorded_at, uploaded_at, created_at) <= ");
        builder.push_bind(to);
    }
    if let Some(query) = &params.query {
        let pattern = escaped_like_pattern(query);
        builder.push(" AND (LOWER(title) LIKE ");
        builder.push_bind(pattern.clone());
        builder.push(" ESCAPE '\\' OR LOWER(COALESCE(game_name, '')) LIKE ");
        builder.push_bind(pattern.clone());
        builder.push(" ESCAPE '\\' OR LOWER(COALESCE(game_id, '')) LIKE ");
        builder.push_bind(pattern);
        builder.push(" ESCAPE '\\')");
    }
}

fn push_clip_optional_filters_postgres(
    builder: &mut QueryBuilder<'_, Postgres>,
    params: &ClipListParams,
) {
    if let Some(game) = &params.game {
        builder.push(" AND (game_id = ");
        builder.push_bind(game.clone());
        builder.push(" OR game_name = ");
        builder.push_bind(game.clone());
        builder.push(")");
    }
    if let Some(visibility) = &params.visibility {
        builder.push(" AND visibility = ");
        builder.push_bind(visibility.clone());
    }
    if let Some(from) = params.from {
        builder.push(" AND COALESCE(recorded_at, uploaded_at, created_at) >= ");
        builder.push_bind(from);
    }
    if let Some(to) = params.to {
        builder.push(" AND COALESCE(recorded_at, uploaded_at, created_at) <= ");
        builder.push_bind(to);
    }
    if let Some(query) = &params.query {
        let pattern = escaped_like_pattern(query);
        builder.push(" AND (LOWER(title) LIKE ");
        builder.push_bind(pattern.clone());
        builder.push(" ESCAPE '\\' OR LOWER(COALESCE(game_name, '')) LIKE ");
        builder.push_bind(pattern.clone());
        builder.push(" ESCAPE '\\' OR LOWER(COALESCE(game_id, '')) LIKE ");
        builder.push_bind(pattern);
        builder.push(" ESCAPE '\\')");
    }
}

fn clip_order_by(sort: ClipSort) -> &'static str {
    match sort {
        ClipSort::RecordedAtDesc => " ORDER BY recorded_at IS NULL ASC, recorded_at DESC, id DESC",
        ClipSort::RecordedAtAsc => " ORDER BY recorded_at IS NULL ASC, recorded_at ASC, id ASC",
        ClipSort::UploadedAtDesc => " ORDER BY uploaded_at IS NULL ASC, uploaded_at DESC, id DESC",
        ClipSort::UploadedAtAsc => " ORDER BY uploaded_at IS NULL ASC, uploaded_at ASC, id ASC",
        ClipSort::DurationDesc => " ORDER BY duration_ms IS NULL ASC, duration_ms DESC, id DESC",
        ClipSort::DurationAsc => " ORDER BY duration_ms IS NULL ASC, duration_ms ASC, id ASC",
        ClipSort::TitleAsc => " ORDER BY title ASC, id ASC",
    }
}

fn escaped_like_pattern(query: &str) -> String {
    let mut pattern = String::with_capacity(query.len() + 2);
    pattern.push('%');
    for ch in query.to_ascii_lowercase().chars() {
        if matches!(ch, '%' | '_' | '\\') {
            pattern.push('\\');
        }
        pattern.push(ch);
    }
    pattern.push('%');
    pattern
}

#[derive(Clone)]
pub struct ClipMarkerRepository {
    database: Database,
}

impl ClipMarkerRepository {
    pub fn new(database: Database) -> Self {
        Self { database }
    }

    pub async fn create(&self, new: &NewClipMarker) -> DbResult<ClipMarker> {
        db_execute!(
            &self.database,
            "INSERT INTO clip_markers (id, clip_id, kind, label, timestamp_ms, metadata_json, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)",
            [
                &new.id,
                &new.clip_id,
                &new.kind,
                new.label.as_deref(),
                new.timestamp_ms,
                new.metadata_json.as_ref(),
                new.created_at,
            ]
        )?;

        Ok(self
            .get(&new.id)
            .await?
            .expect("inserted clip marker should exist"))
    }

    pub async fn get(&self, id: &str) -> DbResult<Option<ClipMarker>> {
        Ok(db_fetch_optional!(
            &self.database,
            ClipMarker,
            "SELECT id, clip_id, kind, label, timestamp_ms, metadata_json, created_at FROM clip_markers WHERE id = ?",
            [id]
        )?)
    }

    pub async fn list_for_clip(&self, clip_id: &str) -> DbResult<Vec<ClipMarker>> {
        Ok(db_fetch_all!(
            &self.database,
            ClipMarker,
            "SELECT id, clip_id, kind, label, timestamp_ms, metadata_json, created_at
             FROM clip_markers WHERE clip_id = ? ORDER BY timestamp_ms ASC, id ASC",
            [clip_id]
        )?)
    }

    pub async fn delete(&self, id: &str) -> DbResult<()> {
        db_execute!(
            &self.database,
            "DELETE FROM clip_markers WHERE id = ?",
            [id]
        )?;
        Ok(())
    }
}

#[derive(Clone)]
pub struct UploadSessionRepository {
    database: Database,
}

impl UploadSessionRepository {
    pub fn new(database: Database) -> Self {
        Self { database }
    }

    pub async fn create(&self, new: &NewUploadSession) -> DbResult<UploadSession> {
        db_execute!(
            &self.database,
            "INSERT INTO upload_sessions (
               id, clip_id, user_id, status, expected_size_bytes, received_size_bytes, part_size_bytes,
               storage_key, storage_upload_id, checksum_sha256, created_at, updated_at, completed_at, expires_at
             )
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
                &new.id,
                &new.clip_id,
                &new.user_id,
                &new.status,
                new.expected_size_bytes,
                new.received_size_bytes,
                new.part_size_bytes,
                &new.storage_key,
                new.storage_upload_id.as_deref(),
                new.checksum_sha256.as_deref(),
                new.created_at,
                new.updated_at,
                new.completed_at,
                new.expires_at,
            ]
        )?;

        Ok(self
            .get(&new.id)
            .await?
            .expect("inserted upload session should exist"))
    }

    pub async fn get(&self, id: &str) -> DbResult<Option<UploadSession>> {
        Ok(db_fetch_optional!(
            &self.database,
            UploadSession,
            "SELECT id, clip_id, user_id, status, expected_size_bytes, received_size_bytes, part_size_bytes,
                    storage_key, storage_upload_id, checksum_sha256, created_at, updated_at, completed_at, expires_at
             FROM upload_sessions WHERE id = ?",
            [id]
        )?)
    }

    pub async fn get_by_clip_id(&self, clip_id: &str) -> DbResult<Option<UploadSession>> {
        Ok(db_fetch_optional!(
            &self.database,
            UploadSession,
            "SELECT id, clip_id, user_id, status, expected_size_bytes, received_size_bytes, part_size_bytes,
                    storage_key, storage_upload_id, checksum_sha256, created_at, updated_at, completed_at, expires_at
             FROM upload_sessions WHERE clip_id = ?
             ORDER BY created_at DESC, id DESC LIMIT 1",
            [clip_id]
        )?)
    }

    pub async fn count_active_for_user(
        &self,
        user_id: &str,
        now: chrono::DateTime<chrono::Utc>,
    ) -> DbResult<i64> {
        Ok(db_fetch_optional!(
            &self.database,
            (i64,),
            "SELECT COUNT(*) FROM upload_sessions
             WHERE user_id = ? AND status IN ('created','uploading') AND expires_at > ?",
            [user_id, now]
        )?
        .map(|row| row.0)
        .unwrap_or_default())
    }

    pub async fn list_expired_active(
        &self,
        now: chrono::DateTime<chrono::Utc>,
        limit: i64,
    ) -> DbResult<Vec<UploadSession>> {
        Ok(db_fetch_all!(
            &self.database,
            UploadSession,
            "SELECT id, clip_id, user_id, status, expected_size_bytes, received_size_bytes, part_size_bytes,
                    storage_key, storage_upload_id, checksum_sha256, created_at, updated_at, completed_at, expires_at
             FROM upload_sessions
             WHERE status IN ('created','uploading') AND expires_at <= ?
             ORDER BY expires_at ASC, id ASC LIMIT ?",
            [now, limit]
        )?)
    }

    pub async fn list_active_storage_upload_ids(&self) -> DbResult<Vec<String>> {
        let rows = db_fetch_all!(
            &self.database,
            (String,),
            "SELECT storage_upload_id FROM upload_sessions
             WHERE status IN ('created','uploading') AND storage_upload_id IS NOT NULL",
            []
        )?;
        Ok(rows.into_iter().map(|row| row.0).collect())
    }

    pub async fn update_received_size(&self, id: &str, received_size_bytes: i64) -> DbResult<()> {
        db_execute!(
            &self.database,
            "UPDATE upload_sessions SET received_size_bytes = ?, updated_at = ? WHERE id = ?",
            [received_size_bytes, now_utc(), id]
        )?;
        Ok(())
    }

    pub async fn mark_uploading(&self, id: &str, received_size_bytes: i64) -> DbResult<()> {
        db_execute!(
            &self.database,
            "UPDATE upload_sessions SET status = 'uploading', received_size_bytes = ?, updated_at = ? WHERE id = ?",
            [received_size_bytes, now_utc(), id]
        )?;
        Ok(())
    }

    pub async fn complete(&self, id: &str) -> DbResult<()> {
        let now = now_utc();
        db_execute!(
            &self.database,
            "UPDATE upload_sessions SET status = 'completed', completed_at = ?, updated_at = ? WHERE id = ?",
            [now, now, id]
        )?;
        Ok(())
    }

    pub async fn abort(&self, id: &str) -> DbResult<()> {
        db_execute!(
            &self.database,
            "UPDATE upload_sessions SET status = 'aborted', updated_at = ? WHERE id = ?",
            [now_utc(), id]
        )?;
        Ok(())
    }

    pub async fn abort_if_expired(
        &self,
        id: &str,
        now: chrono::DateTime<chrono::Utc>,
    ) -> DbResult<bool> {
        let rows = db_execute_rows!(
            &self.database,
            "UPDATE upload_sessions
             SET status = 'aborted', updated_at = ?
             WHERE id = ? AND status IN ('created','uploading') AND expires_at <= ?",
            [now, id, now]
        )?;
        Ok(rows > 0)
    }

    pub async fn fail(&self, id: &str) -> DbResult<()> {
        db_execute!(
            &self.database,
            "UPDATE upload_sessions SET status = 'failed', updated_at = ? WHERE id = ?",
            [now_utc(), id]
        )?;
        Ok(())
    }

    pub async fn list_failed(&self, limit: i64) -> DbResult<Vec<UploadSession>> {
        Ok(db_fetch_all!(
            &self.database,
            UploadSession,
            "SELECT id, clip_id, user_id, status, expected_size_bytes, received_size_bytes, part_size_bytes,
                    storage_key, storage_upload_id, checksum_sha256, created_at, updated_at, completed_at, expires_at
             FROM upload_sessions WHERE status = 'failed'
             ORDER BY updated_at DESC, id DESC LIMIT ?",
            [limit]
        )?)
    }

    pub async fn delete(&self, id: &str) -> DbResult<()> {
        db_execute!(
            &self.database,
            "DELETE FROM upload_sessions WHERE id = ?",
            [id]
        )?;
        Ok(())
    }

    pub async fn delete_for_clip(&self, clip_id: &str) -> DbResult<()> {
        db_execute!(
            &self.database,
            "DELETE FROM upload_parts
             WHERE upload_session_id IN (
               SELECT id FROM upload_sessions WHERE clip_id = ?
             )",
            [clip_id]
        )?;
        db_execute!(
            &self.database,
            "DELETE FROM upload_sessions WHERE clip_id = ?",
            [clip_id]
        )?;
        Ok(())
    }
}

#[derive(Clone)]
pub struct UploadPartRepository {
    database: Database,
}

impl UploadPartRepository {
    pub fn new(database: Database) -> Self {
        Self { database }
    }

    pub async fn upsert(&self, new: &NewUploadPart) -> DbResult<UploadPart> {
        db_execute!(
            &self.database,
            "INSERT INTO upload_parts (upload_session_id, part_number, size_bytes, checksum_sha256, etag, received_at)
             VALUES (?, ?, ?, ?, ?, ?)
             ON CONFLICT (upload_session_id, part_number)
             DO UPDATE SET size_bytes = excluded.size_bytes,
                           checksum_sha256 = excluded.checksum_sha256,
                           etag = excluded.etag,
                           received_at = excluded.received_at",
            [
                &new.upload_session_id,
                new.part_number,
                new.size_bytes,
                new.checksum_sha256.as_deref(),
                new.etag.as_deref(),
                new.received_at,
            ]
        )?;

        Ok(self
            .get(&new.upload_session_id, new.part_number)
            .await?
            .expect("upserted upload part should exist"))
    }

    pub async fn get(
        &self,
        upload_session_id: &str,
        part_number: i64,
    ) -> DbResult<Option<UploadPart>> {
        Ok(db_fetch_optional!(
            &self.database,
            UploadPart,
            "SELECT upload_session_id, part_number, size_bytes, checksum_sha256, etag, received_at
             FROM upload_parts WHERE upload_session_id = ? AND part_number = ?",
            [upload_session_id, part_number]
        )?)
    }

    pub async fn list_for_session(&self, upload_session_id: &str) -> DbResult<Vec<UploadPart>> {
        Ok(db_fetch_all!(
            &self.database,
            UploadPart,
            "SELECT upload_session_id, part_number, size_bytes, checksum_sha256, etag, received_at
             FROM upload_parts WHERE upload_session_id = ? ORDER BY part_number ASC",
            [upload_session_id]
        )?)
    }

    pub async fn sum_size_for_session(&self, upload_session_id: &str) -> DbResult<i64> {
        Ok(db_fetch_optional!(
            &self.database,
            (i64,),
            "SELECT COALESCE(SUM(size_bytes), 0) FROM upload_parts WHERE upload_session_id = ?",
            [upload_session_id]
        )?
        .map(|row| row.0)
        .unwrap_or_default())
    }

    pub async fn delete(&self, upload_session_id: &str, part_number: i64) -> DbResult<()> {
        db_execute!(
            &self.database,
            "DELETE FROM upload_parts WHERE upload_session_id = ? AND part_number = ?",
            [upload_session_id, part_number]
        )?;
        Ok(())
    }

    pub async fn delete_for_session(&self, upload_session_id: &str) -> DbResult<()> {
        db_execute!(
            &self.database,
            "DELETE FROM upload_parts WHERE upload_session_id = ?",
            [upload_session_id]
        )?;
        Ok(())
    }
}

#[derive(Clone)]
pub struct JobRepository {
    database: Database,
}

impl JobRepository {
    pub fn new(database: Database) -> Self {
        Self { database }
    }

    pub async fn create(&self, new: &NewJob) -> DbResult<Job> {
        db_execute!(
            &self.database,
            "INSERT INTO jobs (
               id, kind, status, target_type, target_id, attempts, max_attempts, next_run_at,
               locked_by, locked_at, last_error, created_at, updated_at
             )
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
                &new.id,
                &new.kind,
                &new.status,
                new.target_type.as_deref(),
                new.target_id.as_deref(),
                new.attempts,
                new.max_attempts,
                new.next_run_at,
                new.locked_by.as_deref(),
                new.locked_at,
                new.last_error.as_deref(),
                new.created_at,
                new.updated_at,
            ]
        )?;

        Ok(self.get(&new.id).await?.expect("inserted job should exist"))
    }

    pub async fn get(&self, id: &str) -> DbResult<Option<Job>> {
        Ok(db_fetch_optional!(
            &self.database,
            Job,
            "SELECT id, kind, status, target_type, target_id, attempts, max_attempts, next_run_at,
                    locked_by, locked_at, last_error, created_at, updated_at
             FROM jobs WHERE id = ?",
            [id]
        )?)
    }

    pub async fn list_due(
        &self,
        now: chrono::DateTime<chrono::Utc>,
        limit: i64,
    ) -> DbResult<Vec<Job>> {
        Ok(db_fetch_all!(
            &self.database,
            Job,
            "SELECT id, kind, status, target_type, target_id, attempts, max_attempts, next_run_at,
                    locked_by, locked_at, last_error, created_at, updated_at
             FROM jobs WHERE status = 'pending' AND next_run_at <= ?
             ORDER BY next_run_at ASC, id ASC LIMIT ?",
            [now, limit]
        )?)
    }

    pub async fn claim_next(
        &self,
        runner_id: &str,
        now: chrono::DateTime<chrono::Utc>,
        stale_before: chrono::DateTime<chrono::Utc>,
    ) -> DbResult<Option<Job>> {
        match &self.database {
            Database::Sqlite(_) => Ok(db_fetch_optional!(
                &self.database,
                Job,
                "UPDATE jobs
                 SET status = 'running', attempts = attempts + 1, locked_by = ?, locked_at = ?, updated_at = ?
                 WHERE id = (
                   SELECT id FROM jobs
                   WHERE (status = 'pending' AND next_run_at <= ?)
                      OR (status = 'running' AND locked_at < ?)
                   ORDER BY next_run_at ASC, id ASC
                   LIMIT 1
                 )
                 AND (
                   (status = 'pending' AND next_run_at <= ?)
                   OR (status = 'running' AND locked_at < ?)
                 )
                 RETURNING id, kind, status, target_type, target_id, attempts, max_attempts, next_run_at,
                           locked_by, locked_at, last_error, created_at, updated_at",
                [runner_id, now, now, now, stale_before, now, stale_before]
            )?),
            Database::Postgres(pool) => Ok(sqlx::query_as::<_, Job>(
                "UPDATE jobs
                 SET status = 'running', attempts = attempts + 1, locked_by = $1, locked_at = $2, updated_at = $3
                 WHERE id = (
                   SELECT id FROM jobs
                   WHERE (status = 'pending' AND next_run_at <= $4)
                      OR (status = 'running' AND locked_at < $5)
                   ORDER BY next_run_at ASC, id ASC
                   LIMIT 1
                   FOR UPDATE SKIP LOCKED
                 )
                 AND (
                   (status = 'pending' AND next_run_at <= $6)
                   OR (status = 'running' AND locked_at < $7)
                 )
                 RETURNING id, kind, status, target_type, target_id, attempts, max_attempts, next_run_at,
                           locked_by, locked_at, last_error, created_at, updated_at",
            )
            .bind(runner_id)
            .bind(now)
            .bind(now)
            .bind(now)
            .bind(stale_before)
            .bind(now)
            .bind(stale_before)
            .fetch_optional(pool)
            .await?),
        }
    }

    pub async fn set_status(
        &self,
        id: &str,
        status: &str,
        last_error: Option<&str>,
    ) -> DbResult<()> {
        db_execute!(
            &self.database,
            "UPDATE jobs SET status = ?, last_error = ?, updated_at = ? WHERE id = ?",
            [status, last_error, now_utc(), id]
        )?;
        Ok(())
    }

    pub async fn mark_succeeded(&self, id: &str) -> DbResult<()> {
        db_execute!(
            &self.database,
            "UPDATE jobs
             SET status = 'succeeded', locked_by = NULL, locked_at = NULL, last_error = NULL, updated_at = ?
             WHERE id = ?",
            [now_utc(), id]
        )?;
        Ok(())
    }

    pub async fn mark_retry(
        &self,
        id: &str,
        attempts: i64,
        next_run_at: chrono::DateTime<chrono::Utc>,
        last_error: &str,
    ) -> DbResult<()> {
        db_execute!(
            &self.database,
            "UPDATE jobs
             SET status = 'pending', attempts = ?, next_run_at = ?, locked_by = NULL, locked_at = NULL,
                 last_error = ?, updated_at = ?
             WHERE id = ?",
            [attempts, next_run_at, last_error, now_utc(), id]
        )?;
        Ok(())
    }

    pub async fn mark_dead(&self, id: &str, attempts: i64, last_error: &str) -> DbResult<()> {
        db_execute!(
            &self.database,
            "UPDATE jobs
             SET status = 'dead', attempts = ?, locked_by = NULL, locked_at = NULL,
                 last_error = ?, updated_at = ?
             WHERE id = ?",
            [attempts, last_error, now_utc(), id]
        )?;
        Ok(())
    }

    pub async fn list_dead(&self, limit: i64) -> DbResult<Vec<Job>> {
        Ok(db_fetch_all!(
            &self.database,
            Job,
            "SELECT id, kind, status, target_type, target_id, attempts, max_attempts, next_run_at,
                    locked_by, locked_at, last_error, created_at, updated_at
             FROM jobs WHERE status = 'dead'
             ORDER BY updated_at DESC, id DESC LIMIT ?",
            [limit]
        )?)
    }

    pub async fn list_recent_errors(&self, limit: i64) -> DbResult<Vec<Job>> {
        Ok(db_fetch_all!(
            &self.database,
            Job,
            "SELECT id, kind, status, target_type, target_id, attempts, max_attempts, next_run_at,
                    locked_by, locked_at, last_error, created_at, updated_at
             FROM jobs WHERE last_error IS NOT NULL
             ORDER BY updated_at DESC, id DESC LIMIT ?",
            [limit]
        )?)
    }

    pub async fn count_active_global_kind(&self, kind: &str) -> DbResult<i64> {
        Ok(db_fetch_optional!(
            &self.database,
            (i64,),
            "SELECT COUNT(*) FROM jobs
             WHERE kind = ? AND status IN ('pending','running')
               AND target_type IS NULL AND target_id IS NULL",
            [kind]
        )?
        .map(|row| row.0)
        .unwrap_or_default())
    }

    pub async fn delete(&self, id: &str) -> DbResult<()> {
        db_execute!(&self.database, "DELETE FROM jobs WHERE id = ?", [id])?;
        Ok(())
    }
}

#[derive(Clone)]
pub struct AuditLogRepository {
    database: Database,
}

impl AuditLogRepository {
    pub fn new(database: Database) -> Self {
        Self { database }
    }

    pub async fn create(&self, new: &NewAuditLogEntry) -> DbResult<AuditLogEntry> {
        let insert_sql = match &self.database {
            Database::Sqlite(_) => {
                "INSERT INTO audit_log (id, actor_user_id, action, target_type, target_id, ip_address, metadata_json, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
            }
            Database::Postgres(_) => {
                "INSERT INTO audit_log (id, actor_user_id, action, target_type, target_id, ip_address, metadata_json, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
            }
        };

        db_execute!(
            &self.database,
            insert_sql,
            [
                &new.id,
                new.actor_user_id.as_deref(),
                &new.action,
                new.target_type.as_deref(),
                new.target_id.as_deref(),
                new.ip_address.as_deref(),
                new.metadata_json.as_ref(),
                new.created_at,
            ]
        )?;

        Ok(self
            .get(&new.id)
            .await?
            .expect("inserted audit log entry should exist"))
    }

    pub async fn get(&self, id: &str) -> DbResult<Option<AuditLogEntry>> {
        Ok(db_fetch_optional!(
            &self.database,
            AuditLogEntry,
            "SELECT id, actor_user_id, action, target_type, target_id, CAST(ip_address AS TEXT) AS ip_address, metadata_json, created_at
             FROM audit_log WHERE id = ?",
            [id]
        )?)
    }

    pub async fn list_recent(&self, limit: i64) -> DbResult<Vec<AuditLogEntry>> {
        Ok(db_fetch_all!(
            &self.database,
            AuditLogEntry,
            "SELECT id, actor_user_id, action, target_type, target_id, CAST(ip_address AS TEXT) AS ip_address, metadata_json, created_at
             FROM audit_log ORDER BY created_at DESC, id DESC LIMIT ?",
            [limit]
        )?)
    }
}

#[derive(Clone)]
pub struct ResetPasswordTokenRepository {
    database: Database,
}

impl ResetPasswordTokenRepository {
    pub fn new(database: Database) -> Self {
        Self { database }
    }

    pub async fn create(&self, new: &NewResetPasswordToken) -> DbResult<ResetPasswordToken> {
        db_execute!(
            &self.database,
            "INSERT INTO reset_password_tokens (id, user_id, token_hash, created_at, expires_at, used_at)
             VALUES (?, ?, ?, ?, ?, ?)",
            [
                &new.id,
                &new.user_id,
                &new.token_hash,
                new.created_at,
                new.expires_at,
                new.used_at,
            ]
        )?;

        Ok(self
            .get(&new.id)
            .await?
            .expect("inserted reset password token should exist"))
    }

    pub async fn get(&self, id: &str) -> DbResult<Option<ResetPasswordToken>> {
        Ok(db_fetch_optional!(
            &self.database,
            ResetPasswordToken,
            "SELECT id, user_id, token_hash, created_at, expires_at, used_at
             FROM reset_password_tokens WHERE id = ?",
            [id]
        )?)
    }

    pub async fn get_by_token_hash(
        &self,
        token_hash: &str,
    ) -> DbResult<Option<ResetPasswordToken>> {
        Ok(db_fetch_optional!(
            &self.database,
            ResetPasswordToken,
            "SELECT id, user_id, token_hash, created_at, expires_at, used_at
             FROM reset_password_tokens WHERE token_hash = ?",
            [token_hash]
        )?)
    }

    pub async fn mark_used(&self, id: &str) -> DbResult<()> {
        db_execute!(
            &self.database,
            "UPDATE reset_password_tokens SET used_at = ? WHERE id = ?",
            [now_utc(), id]
        )?;
        Ok(())
    }

    pub async fn mark_used_if_valid(
        &self,
        id: &str,
        now: chrono::DateTime<chrono::Utc>,
    ) -> DbResult<bool> {
        let rows = db_execute_rows!(
            &self.database,
            "UPDATE reset_password_tokens SET used_at = ? WHERE id = ? AND used_at IS NULL AND expires_at > ?",
            [now, id, now]
        )?;
        Ok(rows > 0)
    }
}
