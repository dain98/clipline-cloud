use chrono::{DateTime, Utc};
use serde_json::json;
use sqlx::{types::Json, Postgres, QueryBuilder, Sqlite};

use crate::{
    db_execute, db_execute_rows, db_fetch_all, db_fetch_optional, now_utc, AppSettings,
    AuditLogEntry, Clip, ClipComment, ClipMarker, Database, DbResult, DeviceToken, InvitationToken,
    Job, NewAuditLogEntry, NewClip, NewClipComment, NewClipMarker, NewDeviceToken,
    NewInvitationToken, NewJob, NewResetPasswordToken, NewSession, NewUploadPart, NewUploadSession,
    NewUser, ResetPasswordToken, Session, UploadPart, UploadSession, User,
};

pub const DEFAULT_ABOUT_TEXT: &str = "Self-hosted clip sharing for Clipline. Upload clips from the desktop app, manage your own library, and share public links without relying on a hosted service.";

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ClipSort {
    RecordedAtDesc,
    RecordedAtAsc,
    UploadedAtDesc,
    UploadedAtAsc,
    DurationDesc,
    DurationAsc,
    FileSizeDesc,
    FileSizeAsc,
    TitleAsc,
    TitleDesc,
    CreatedAtDesc,
    CreatedAtAsc,
    UpdatedAtDesc,
    UpdatedAtAsc,
}

#[derive(Debug, Clone)]
pub struct ClipListParams {
    pub owner_user_id: String,
    pub game: Option<String>,
    pub source_type: Option<String>,
    pub visibility: Option<String>,
    pub status: Option<String>,
    pub from: Option<DateTime<Utc>>,
    pub to: Option<DateTime<Utc>>,
    pub min_duration_ms: Option<i64>,
    pub max_duration_ms: Option<i64>,
    pub min_size_bytes: Option<i64>,
    pub max_size_bytes: Option<i64>,
    pub query: Option<String>,
    pub sort: ClipSort,
    pub limit: i64,
    pub offset: i64,
}

#[derive(Debug, Clone)]
pub struct PublicClipListParams {
    pub owner_user_id: Option<String>,
    pub game: Option<String>,
    pub query: Option<String>,
    pub sort: ClipSort,
    pub limit: i64,
    pub offset: i64,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct PublicGameSummary {
    pub game: String,
    pub clip_count: i64,
}

#[derive(Debug, Clone)]
pub struct BulkVisibilityUpdate {
    pub clip_id: String,
    pub public_share_id: Option<String>,
}

#[derive(Clone)]
pub struct Repositories {
    pub settings: AppSettingsRepository,
    pub users: UserRepository,
    pub sessions: SessionRepository,
    pub device_tokens: DeviceTokenRepository,
    pub clips: ClipRepository,
    pub clip_comments: ClipCommentRepository,
    pub clip_markers: ClipMarkerRepository,
    pub upload_sessions: UploadSessionRepository,
    pub upload_parts: UploadPartRepository,
    pub jobs: JobRepository,
    pub audit_log: AuditLogRepository,
    pub reset_password_tokens: ResetPasswordTokenRepository,
    pub invitation_tokens: InvitationTokenRepository,
}

impl Repositories {
    pub fn new(database: Database) -> Self {
        Self {
            settings: AppSettingsRepository::new(database.clone()),
            users: UserRepository::new(database.clone()),
            sessions: SessionRepository::new(database.clone()),
            device_tokens: DeviceTokenRepository::new(database.clone()),
            clips: ClipRepository::new(database.clone()),
            clip_comments: ClipCommentRepository::new(database.clone()),
            clip_markers: ClipMarkerRepository::new(database.clone()),
            upload_sessions: UploadSessionRepository::new(database.clone()),
            upload_parts: UploadPartRepository::new(database.clone()),
            jobs: JobRepository::new(database.clone()),
            audit_log: AuditLogRepository::new(database.clone()),
            reset_password_tokens: ResetPasswordTokenRepository::new(database.clone()),
            invitation_tokens: InvitationTokenRepository::new(database),
        }
    }

    pub async fn bulk_soft_delete_clips_with_audit(
        &self,
        owner_user_id: &str,
        clip_ids: &[String],
        actor_user_id: Option<&str>,
        ip_address: Option<&str>,
    ) -> DbResult<usize> {
        match &self.clips.database {
            Database::Sqlite(pool) => {
                let mut transaction = pool.begin().await?;
                for clip_id in clip_ids {
                    let now = now_utc();
                    let rows = sqlx::query(
                        "UPDATE clips
                         SET status = 'deleted', deleted_at = ?, updated_at = ?
                         WHERE id = ? AND owner_user_id = ? AND deleted_at IS NULL",
                    )
                    .bind(now)
                    .bind(now)
                    .bind(clip_id)
                    .bind(owner_user_id)
                    .execute(&mut *transaction)
                    .await?
                    .rows_affected();
                    if rows != 1 {
                        return Err(sqlx::Error::RowNotFound.into());
                    }

                    let entry = bulk_audit_entry(
                        actor_user_id,
                        ip_address,
                        "clip.deleted",
                        clip_id,
                        Json(json!({ "bulk": true })),
                    );
                    insert_audit_sqlite(&mut transaction, &entry).await?;
                }
                transaction.commit().await?;
            }
            Database::Postgres(pool) => {
                let mut transaction = pool.begin().await?;
                let update_sql = crate::postgres_placeholders(
                    "UPDATE clips
                     SET status = 'deleted', deleted_at = ?, updated_at = ?
                     WHERE id = ? AND owner_user_id = ? AND deleted_at IS NULL",
                );
                for clip_id in clip_ids {
                    let now = now_utc();
                    let rows = sqlx::query(&update_sql)
                        .bind(now)
                        .bind(now)
                        .bind(clip_id)
                        .bind(owner_user_id)
                        .execute(&mut *transaction)
                        .await?
                        .rows_affected();
                    if rows != 1 {
                        return Err(sqlx::Error::RowNotFound.into());
                    }

                    let entry = bulk_audit_entry(
                        actor_user_id,
                        ip_address,
                        "clip.deleted",
                        clip_id,
                        Json(json!({ "bulk": true })),
                    );
                    insert_audit_postgres(&mut transaction, &entry).await?;
                }
                transaction.commit().await?;
            }
        }

        Ok(clip_ids.len())
    }

    pub async fn bulk_set_visibility_with_audit(
        &self,
        owner_user_id: &str,
        updates: &[BulkVisibilityUpdate],
        visibility: &str,
        actor_user_id: Option<&str>,
        ip_address: Option<&str>,
    ) -> DbResult<usize> {
        match &self.clips.database {
            Database::Sqlite(pool) => {
                let mut transaction = pool.begin().await?;
                for update in updates {
                    let rows = sqlx::query(
                        "UPDATE clips
                         SET visibility = ?, public_share_id = ?, updated_at = ?
                         WHERE id = ? AND owner_user_id = ? AND status = 'ready' AND deleted_at IS NULL",
                    )
                    .bind(visibility)
                    .bind(update.public_share_id.as_deref())
                    .bind(now_utc())
                    .bind(&update.clip_id)
                    .bind(owner_user_id)
                    .execute(&mut *transaction)
                    .await?
                    .rows_affected();
                    if rows != 1 {
                        return Err(sqlx::Error::RowNotFound.into());
                    }

                    let entry = bulk_audit_entry(
                        actor_user_id,
                        ip_address,
                        "clip.visibility_changed",
                        &update.clip_id,
                        Json(json!({ "visibility": visibility, "bulk": true })),
                    );
                    insert_audit_sqlite(&mut transaction, &entry).await?;
                }
                transaction.commit().await?;
            }
            Database::Postgres(pool) => {
                let mut transaction = pool.begin().await?;
                let update_sql = crate::postgres_placeholders(
                    "UPDATE clips
                     SET visibility = ?, public_share_id = ?, updated_at = ?
                     WHERE id = ? AND owner_user_id = ? AND status = 'ready' AND deleted_at IS NULL",
                );
                for update in updates {
                    let rows = sqlx::query(&update_sql)
                        .bind(visibility)
                        .bind(update.public_share_id.as_deref())
                        .bind(now_utc())
                        .bind(&update.clip_id)
                        .bind(owner_user_id)
                        .execute(&mut *transaction)
                        .await?
                        .rows_affected();
                    if rows != 1 {
                        return Err(sqlx::Error::RowNotFound.into());
                    }

                    let entry = bulk_audit_entry(
                        actor_user_id,
                        ip_address,
                        "clip.visibility_changed",
                        &update.clip_id,
                        Json(json!({ "visibility": visibility, "bulk": true })),
                    );
                    insert_audit_postgres(&mut transaction, &entry).await?;
                }
                transaction.commit().await?;
            }
        }

        Ok(updates.len())
    }
}

fn bulk_audit_entry(
    actor_user_id: Option<&str>,
    ip_address: Option<&str>,
    action: &str,
    target_id: &str,
    metadata: Json<serde_json::Value>,
) -> NewAuditLogEntry {
    let mut entry = NewAuditLogEntry::new(action);
    entry.actor_user_id = actor_user_id.map(ToOwned::to_owned);
    entry.target_type = Some("clip".to_string());
    entry.target_id = Some(target_id.to_string());
    entry.ip_address = ip_address.map(ToOwned::to_owned);
    entry.metadata_json = Some(metadata);
    entry
}

async fn insert_audit_sqlite(
    transaction: &mut sqlx::Transaction<'_, Sqlite>,
    entry: &NewAuditLogEntry,
) -> Result<(), sqlx::Error> {
    sqlx::query(
        "INSERT INTO audit_log (id, actor_user_id, action, target_type, target_id, ip_address, metadata_json, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(&entry.id)
    .bind(entry.actor_user_id.as_deref())
    .bind(&entry.action)
    .bind(entry.target_type.as_deref())
    .bind(entry.target_id.as_deref())
    .bind(entry.ip_address.as_deref())
    .bind(entry.metadata_json.as_ref())
    .bind(entry.created_at)
    .execute(&mut **transaction)
    .await
    .map(|_| ())
}

async fn insert_audit_postgres(
    transaction: &mut sqlx::Transaction<'_, Postgres>,
    entry: &NewAuditLogEntry,
) -> Result<(), sqlx::Error> {
    let sql = crate::postgres_placeholders(
        "INSERT INTO audit_log (id, actor_user_id, action, target_type, target_id, ip_address, metadata_json, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    );
    sqlx::query(&sql)
        .bind(&entry.id)
        .bind(entry.actor_user_id.as_deref())
        .bind(&entry.action)
        .bind(entry.target_type.as_deref())
        .bind(entry.target_id.as_deref())
        .bind(entry.ip_address.as_deref())
        .bind(entry.metadata_json.as_ref())
        .bind(entry.created_at)
        .execute(&mut **transaction)
        .await
        .map(|_| ())
}

#[derive(Debug, Clone, Default)]
pub struct UpdateAppSettings {
    pub allow_vod_uploads: Option<bool>,
    pub vod_threshold_minutes: Option<i64>,
    pub about_text: Option<String>,
    pub smtp_enabled: Option<bool>,
    pub smtp_host: Option<Option<String>>,
    pub smtp_port: Option<i64>,
    pub smtp_tls_mode: Option<String>,
    pub smtp_username: Option<Option<String>>,
    pub smtp_password: Option<Option<String>>,
    pub smtp_from_email: Option<Option<String>>,
    pub smtp_from_name: Option<Option<String>>,
}

#[derive(Clone)]
pub struct AppSettingsRepository {
    database: Database,
}

impl AppSettingsRepository {
    pub fn new(database: Database) -> Self {
        Self { database }
    }

    pub async fn get(&self) -> DbResult<AppSettings> {
        self.ensure_default().await?;
        Ok(db_fetch_optional!(
            &self.database,
            AppSettings,
            "SELECT id, owner_user_id, allow_vod_uploads, vod_threshold_minutes, about_text,
                    smtp_enabled, smtp_host, smtp_port, smtp_tls_mode, smtp_username, smtp_password,
                    smtp_from_email, smtp_from_name, created_at, updated_at
             FROM app_settings WHERE id = 1",
            []
        )?
        .expect("app settings row should exist"))
    }

    pub async fn update(&self, update: &UpdateAppSettings) -> DbResult<AppSettings> {
        self.ensure_default().await?;
        let update_smtp_host = update.smtp_host.is_some();
        let smtp_host = update.smtp_host.as_ref().and_then(Option::as_deref);
        let update_smtp_username = update.smtp_username.is_some();
        let smtp_username = update.smtp_username.as_ref().and_then(Option::as_deref);
        let update_smtp_password = update.smtp_password.is_some();
        let smtp_password = update.smtp_password.as_ref().and_then(Option::as_deref);
        let update_smtp_from_email = update.smtp_from_email.is_some();
        let smtp_from_email = update.smtp_from_email.as_ref().and_then(Option::as_deref);
        let update_smtp_from_name = update.smtp_from_name.is_some();
        let smtp_from_name = update.smtp_from_name.as_ref().and_then(Option::as_deref);
        db_execute!(
            &self.database,
            "UPDATE app_settings
             SET allow_vod_uploads = COALESCE(?, allow_vod_uploads),
                 vod_threshold_minutes = COALESCE(?, vod_threshold_minutes),
                 about_text = COALESCE(?, about_text),
                 smtp_enabled = COALESCE(?, smtp_enabled),
                 smtp_host = CASE WHEN ? THEN ? ELSE smtp_host END,
                 smtp_port = COALESCE(?, smtp_port),
                 smtp_tls_mode = COALESCE(?, smtp_tls_mode),
                 smtp_username = CASE WHEN ? THEN ? ELSE smtp_username END,
                 smtp_password = CASE WHEN ? THEN ? ELSE smtp_password END,
                 smtp_from_email = CASE WHEN ? THEN ? ELSE smtp_from_email END,
                 smtp_from_name = CASE WHEN ? THEN ? ELSE smtp_from_name END,
                 updated_at = ?
             WHERE id = 1",
            [
                update.allow_vod_uploads,
                update.vod_threshold_minutes,
                update.about_text.as_deref(),
                update.smtp_enabled,
                update_smtp_host,
                smtp_host,
                update.smtp_port,
                update.smtp_tls_mode.as_deref(),
                update_smtp_username,
                smtp_username,
                update_smtp_password,
                smtp_password,
                update_smtp_from_email,
                smtp_from_email,
                update_smtp_from_name,
                smtp_from_name,
                now_utc(),
            ]
        )?;
        self.get().await
    }

    pub async fn set_owner_user_id(&self, owner_user_id: &str) -> DbResult<AppSettings> {
        self.ensure_default().await?;
        db_execute!(
            &self.database,
            "UPDATE app_settings SET owner_user_id = ?, updated_at = ? WHERE id = 1",
            [owner_user_id, now_utc()]
        )?;
        self.get().await
    }

    async fn ensure_default(&self) -> DbResult<()> {
        let now = now_utc();
        db_execute!(
            &self.database,
            "INSERT INTO app_settings (
                 id, owner_user_id, allow_vod_uploads, vod_threshold_minutes, about_text,
                 smtp_enabled, smtp_host, smtp_port, smtp_tls_mode, smtp_username, smtp_password,
                 smtp_from_email, smtp_from_name, created_at, updated_at
             )
             VALUES (1, NULL, ?, ?, ?, ?, NULL, ?, ?, NULL, NULL, NULL, NULL, ?, ?)
             ON CONFLICT(id) DO NOTHING",
            [
                true,
                30_i64,
                DEFAULT_ABOUT_TEXT,
                false,
                587_i64,
                "starttls",
                now,
                now
            ]
        )?;
        Ok(())
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
            "INSERT INTO users (id, username, display_name, email, bio, avatar_key, password_hash, role, is_disabled, storage_quota_bytes, created_at, updated_at, last_login_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
                &new.id,
                &new.username,
                new.display_name.as_deref(),
                new.email.as_deref(),
                new.bio.as_deref(),
                new.avatar_key.as_deref(),
                &new.password_hash,
                &new.role,
                new.is_disabled,
                new.storage_quota_bytes,
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
            "SELECT id, username, display_name, email, bio, avatar_key, password_hash, role, is_disabled, storage_quota_bytes, created_at, updated_at, last_login_at
             FROM users WHERE id = ?",
            [id]
        )?)
    }

    pub async fn get_by_username(&self, username: &str) -> DbResult<Option<User>> {
        Ok(db_fetch_optional!(
            &self.database,
            User,
            "SELECT id, username, display_name, email, bio, avatar_key, password_hash, role, is_disabled, storage_quota_bytes, created_at, updated_at, last_login_at
             FROM users WHERE username = ?",
            [username]
        )?)
    }

    pub async fn list(&self) -> DbResult<Vec<User>> {
        Ok(db_fetch_all!(
            &self.database,
            User,
            "SELECT id, username, display_name, email, bio, avatar_key, password_hash, role, is_disabled, storage_quota_bytes, created_at, updated_at, last_login_at
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

    pub async fn first_admin(&self) -> DbResult<Option<User>> {
        Ok(db_fetch_optional!(
            &self.database,
            User,
            "SELECT id, username, display_name, email, bio, avatar_key, password_hash, role, is_disabled, storage_quota_bytes, created_at, updated_at, last_login_at
             FROM users WHERE role = 'admin' AND is_disabled = ? ORDER BY created_at ASC, id ASC LIMIT 1",
            [false]
        )?)
    }

    pub async fn update_profile(
        &self,
        id: &str,
        display_name: Option<&str>,
        role: &str,
        is_disabled: bool,
        storage_quota_bytes: Option<i64>,
    ) -> DbResult<()> {
        db_execute!(
            &self.database,
            "UPDATE users SET display_name = ?, role = ?, is_disabled = ?, storage_quota_bytes = ?, updated_at = ? WHERE id = ?",
            [
                display_name,
                role,
                is_disabled,
                storage_quota_bytes,
                now_utc(),
                id,
            ]
        )?;
        Ok(())
    }

    pub async fn update_self_profile(
        &self,
        id: &str,
        display_name: Option<&str>,
        bio: Option<&str>,
    ) -> DbResult<()> {
        db_execute!(
            &self.database,
            "UPDATE users SET display_name = ?, bio = ?, updated_at = ? WHERE id = ?",
            [display_name, bio, now_utc(), id]
        )?;
        Ok(())
    }

    pub async fn set_avatar_key(&self, id: &str, avatar_key: Option<&str>) -> DbResult<()> {
        db_execute!(
            &self.database,
            "UPDATE users SET avatar_key = ?, updated_at = ? WHERE id = ?",
            [avatar_key, now_utc(), id]
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

    pub async fn list_for_user(&self, user_id: &str) -> DbResult<Vec<Session>> {
        Ok(db_fetch_all!(
            &self.database,
            Session,
            "SELECT id, user_id, token_hash, user_agent, CAST(ip_address AS TEXT) AS ip_address, created_at, last_used_at, expires_at, revoked_at
             FROM sessions
             WHERE user_id = ? AND revoked_at IS NULL AND expires_at > ?
             ORDER BY COALESCE(last_used_at, created_at) DESC, created_at DESC, id ASC",
            [user_id, now_utc()]
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

    pub async fn revoke_for_user_by_id(&self, user_id: &str, id: &str) -> DbResult<u64> {
        Ok(db_execute_rows!(
            &self.database,
            "UPDATE sessions SET revoked_at = ? WHERE user_id = ? AND id = ? AND revoked_at IS NULL",
            [now_utc(), user_id, id]
        )?)
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

    pub async fn revoke_for_user(&self, user_id: &str, id: &str) -> DbResult<u64> {
        Ok(db_execute_rows!(
            &self.database,
            "UPDATE device_tokens SET revoked_at = ? WHERE user_id = ? AND id = ? AND revoked_at IS NULL",
            [now_utc(), user_id, id]
        )?)
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
               id, owner_user_id, client_clip_id, title, description, game_name, game_id, game_executable, source_type,
               recorded_at, uploaded_at, duration_ms, file_size_bytes, width, height, fps, container,
               video_codec, audio_codec, checksum_sha256, visibility, status, storage_backend, storage_key,
               poster_key, thumbnail_key, public_share_id, view_count, created_at, updated_at, deleted_at
             )
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
                &new.id,
                &new.owner_user_id,
                new.client_clip_id.as_deref(),
                &new.title,
                new.description.as_deref(),
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
                new.view_count,
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

    pub async fn list_owned_for_bulk(
        &self,
        owner_user_id: &str,
        ids: &[String],
        ready_only: bool,
    ) -> DbResult<Vec<Clip>> {
        if ids.is_empty() {
            return Ok(Vec::new());
        }

        match &self.database {
            Database::Sqlite(pool) => {
                let mut builder = QueryBuilder::<Sqlite>::new(CLIP_SELECT_SQL);
                push_bulk_clip_filters_sqlite(&mut builder, owner_user_id, ids, ready_only);
                Ok(builder.build_query_as::<Clip>().fetch_all(pool).await?)
            }
            Database::Postgres(pool) => {
                let mut builder = QueryBuilder::<Postgres>::new(CLIP_SELECT_SQL);
                push_bulk_clip_filters_postgres(&mut builder, owner_user_id, ids, ready_only);
                Ok(builder.build_query_as::<Clip>().fetch_all(pool).await?)
            }
        }
    }

    pub async fn get_by_owner_client_clip_id(
        &self,
        owner_user_id: &str,
        client_clip_id: &str,
    ) -> DbResult<Option<Clip>> {
        Ok(db_fetch_optional!(
            &self.database,
            Clip,
            CLIP_SELECT_SQL.to_string()
                + " WHERE owner_user_id = ? AND client_clip_id = ?
                    AND deleted_at IS NULL AND status <> 'deleted'",
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

    pub async fn list_public(&self, params: &PublicClipListParams) -> DbResult<Vec<Clip>> {
        match &self.database {
            Database::Sqlite(pool) => {
                let mut builder = QueryBuilder::<Sqlite>::new(CLIP_SELECT_SQL);
                push_public_clip_list_filters_sqlite(&mut builder, params);
                builder.push(clip_order_by(params.sort));
                builder.push(" LIMIT ");
                builder.push_bind(params.limit);
                builder.push(" OFFSET ");
                builder.push_bind(params.offset);
                Ok(builder.build_query_as::<Clip>().fetch_all(pool).await?)
            }
            Database::Postgres(pool) => {
                let mut builder = QueryBuilder::<Postgres>::new(CLIP_SELECT_SQL);
                push_public_clip_list_filters_postgres(&mut builder, params);
                builder.push(clip_order_by(params.sort));
                builder.push(" LIMIT ");
                builder.push_bind(params.limit);
                builder.push(" OFFSET ");
                builder.push_bind(params.offset);
                Ok(builder.build_query_as::<Clip>().fetch_all(pool).await?)
            }
        }
    }

    pub async fn list_public_games(&self) -> DbResult<Vec<PublicGameSummary>> {
        let rows = db_fetch_all!(
            &self.database,
            (String, i64),
            "SELECT game, CAST(COUNT(*) AS BIGINT) AS clip_count
             FROM (
               SELECT COALESCE(NULLIF(TRIM(game_name), ''), NULLIF(TRIM(game_id), '')) AS game
               FROM clips
               WHERE visibility = 'public'
                 AND status = 'ready'
                 AND deleted_at IS NULL
                 AND public_share_id IS NOT NULL
             ) public_games
             WHERE game IS NOT NULL
             GROUP BY game
             ORDER BY LOWER(game) ASC, game ASC",
            []
        )?;
        Ok(rows
            .into_iter()
            .map(|(game, clip_count)| PublicGameSummary { game, clip_count })
            .collect())
    }

    pub async fn count_public_for_owner(&self, owner_user_id: &str) -> DbResult<i64> {
        Ok(db_fetch_optional!(
            &self.database,
            (i64,),
            "SELECT CAST(COUNT(*) AS BIGINT)
             FROM clips
             WHERE visibility = 'public'
               AND status = 'ready'
               AND deleted_at IS NULL
               AND public_share_id IS NOT NULL
               AND owner_user_id = ?",
            [owner_user_id]
        )?
        .map(|row| row.0)
        .unwrap_or_default())
    }

    pub async fn increment_view_count(&self, id: &str) -> DbResult<i64> {
        db_execute!(
            &self.database,
            "UPDATE clips SET view_count = view_count + 1 WHERE id = ?",
            [id]
        )?;
        Ok(db_fetch_optional!(
            &self.database,
            (i64,),
            "SELECT view_count FROM clips WHERE id = ?",
            [id]
        )?
        .map(|row| row.0)
        .unwrap_or_default())
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

    pub async fn active_storage_bytes_by_owner(&self) -> DbResult<Vec<(String, i64)>> {
        Ok(db_fetch_all!(
            &self.database,
            (String, i64),
            "SELECT owner_user_id, CAST(COALESCE(SUM(file_size_bytes), 0) AS BIGINT)
             FROM clips
             WHERE deleted_at IS NULL
               AND status IN ('created','uploading','processing','ready')
             GROUP BY owner_user_id
             ORDER BY owner_user_id ASC",
            []
        )?)
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
        description: Option<&str>,
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
             SET title = ?, description = ?, game_name = ?, game_id = ?, game_executable = ?,
                 source_type = ?, recorded_at = ?, duration_ms = ?, updated_at = ?
             WHERE id = ?",
            [
                title,
                description,
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

    #[allow(clippy::too_many_arguments)]
    pub async fn update_source_metadata(
        &self,
        id: &str,
        file_size_bytes: i64,
        checksum_sha256: &str,
        container: Option<&str>,
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
             SET file_size_bytes = ?,
                 checksum_sha256 = ?,
                 container = COALESCE(?, container),
                 duration_ms = COALESCE(?, duration_ms),
                 width = COALESCE(?, width),
                 height = COALESCE(?, height),
                 fps = COALESCE(?, fps),
                 video_codec = COALESCE(?, video_codec),
                 audio_codec = COALESCE(?, audio_codec),
                 updated_at = ?
             WHERE id = ? AND deleted_at IS NULL AND status <> 'deleted'",
            [
                file_size_bytes,
                checksum_sha256,
                container,
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
  id, owner_user_id, client_clip_id, title, description, game_name, game_id, game_executable, source_type,
  recorded_at, uploaded_at, duration_ms, file_size_bytes, width, height, fps, container,
  video_codec, audio_codec, checksum_sha256, visibility, status, storage_backend, storage_key,
  poster_key, thumbnail_key, public_share_id, view_count, created_at, updated_at, deleted_at
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

fn push_public_clip_list_filters_sqlite(
    builder: &mut QueryBuilder<'_, Sqlite>,
    params: &PublicClipListParams,
) {
    builder.push(
        " WHERE visibility = 'public'
          AND status = 'ready'
          AND deleted_at IS NULL
          AND public_share_id IS NOT NULL",
    );
    if let Some(owner_user_id) = &params.owner_user_id {
        builder.push(" AND owner_user_id = ");
        builder.push_bind(owner_user_id.clone());
    }
    push_public_clip_optional_filters_sqlite(builder, params);
}

fn push_public_clip_list_filters_postgres(
    builder: &mut QueryBuilder<'_, Postgres>,
    params: &PublicClipListParams,
) {
    builder.push(
        " WHERE visibility = 'public'
          AND status = 'ready'
          AND deleted_at IS NULL
          AND public_share_id IS NOT NULL",
    );
    if let Some(owner_user_id) = &params.owner_user_id {
        builder.push(" AND owner_user_id = ");
        builder.push_bind(owner_user_id.clone());
    }
    push_public_clip_optional_filters_postgres(builder, params);
}

fn push_bulk_clip_filters_sqlite(
    builder: &mut QueryBuilder<'_, Sqlite>,
    owner_user_id: &str,
    ids: &[String],
    ready_only: bool,
) {
    builder.push(" WHERE owner_user_id = ");
    builder.push_bind(owner_user_id.to_string());
    builder.push(" AND deleted_at IS NULL AND id IN (");
    let mut separated = builder.separated(", ");
    for id in ids {
        separated.push_bind(id.clone());
    }
    separated.push_unseparated(")");
    if ready_only {
        builder.push(" AND status = 'ready'");
    }
}

fn push_bulk_clip_filters_postgres(
    builder: &mut QueryBuilder<'_, Postgres>,
    owner_user_id: &str,
    ids: &[String],
    ready_only: bool,
) {
    builder.push(" WHERE owner_user_id = ");
    builder.push_bind(owner_user_id.to_string());
    builder.push(" AND deleted_at IS NULL AND id IN (");
    let mut separated = builder.separated(", ");
    for id in ids {
        separated.push_bind(id.clone());
    }
    separated.push_unseparated(")");
    if ready_only {
        builder.push(" AND status = 'ready'");
    }
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
    if let Some(source_type) = &params.source_type {
        builder.push(" AND source_type = ");
        builder.push_bind(source_type.clone());
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
    if let Some(min_duration_ms) = params.min_duration_ms {
        builder.push(" AND duration_ms >= ");
        builder.push_bind(min_duration_ms);
    }
    if let Some(max_duration_ms) = params.max_duration_ms {
        builder.push(" AND duration_ms <= ");
        builder.push_bind(max_duration_ms);
    }
    if let Some(min_size_bytes) = params.min_size_bytes {
        builder.push(" AND file_size_bytes >= ");
        builder.push_bind(min_size_bytes);
    }
    if let Some(max_size_bytes) = params.max_size_bytes {
        builder.push(" AND file_size_bytes <= ");
        builder.push_bind(max_size_bytes);
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
    if let Some(source_type) = &params.source_type {
        builder.push(" AND source_type = ");
        builder.push_bind(source_type.clone());
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
    if let Some(min_duration_ms) = params.min_duration_ms {
        builder.push(" AND duration_ms >= ");
        builder.push_bind(min_duration_ms);
    }
    if let Some(max_duration_ms) = params.max_duration_ms {
        builder.push(" AND duration_ms <= ");
        builder.push_bind(max_duration_ms);
    }
    if let Some(min_size_bytes) = params.min_size_bytes {
        builder.push(" AND file_size_bytes >= ");
        builder.push_bind(min_size_bytes);
    }
    if let Some(max_size_bytes) = params.max_size_bytes {
        builder.push(" AND file_size_bytes <= ");
        builder.push_bind(max_size_bytes);
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

fn push_public_clip_optional_filters_sqlite(
    builder: &mut QueryBuilder<'_, Sqlite>,
    params: &PublicClipListParams,
) {
    if let Some(game) = &params.game {
        builder.push(" AND (game_id = ");
        builder.push_bind(game.clone());
        builder.push(" OR game_name = ");
        builder.push_bind(game.clone());
        builder.push(")");
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

fn push_public_clip_optional_filters_postgres(
    builder: &mut QueryBuilder<'_, Postgres>,
    params: &PublicClipListParams,
) {
    if let Some(game) = &params.game {
        builder.push(" AND (game_id = ");
        builder.push_bind(game.clone());
        builder.push(" OR game_name = ");
        builder.push_bind(game.clone());
        builder.push(")");
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
        ClipSort::FileSizeDesc => {
            " ORDER BY file_size_bytes IS NULL ASC, file_size_bytes DESC, id DESC"
        }
        ClipSort::FileSizeAsc => {
            " ORDER BY file_size_bytes IS NULL ASC, file_size_bytes ASC, id ASC"
        }
        ClipSort::TitleAsc => " ORDER BY title ASC, id ASC",
        ClipSort::TitleDesc => " ORDER BY title DESC, id DESC",
        ClipSort::CreatedAtDesc => " ORDER BY created_at DESC, id DESC",
        ClipSort::CreatedAtAsc => " ORDER BY created_at ASC, id ASC",
        ClipSort::UpdatedAtDesc => " ORDER BY updated_at DESC, id DESC",
        ClipSort::UpdatedAtAsc => " ORDER BY updated_at ASC, id ASC",
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
pub struct ClipCommentRepository {
    database: Database,
}

impl ClipCommentRepository {
    pub fn new(database: Database) -> Self {
        Self { database }
    }

    pub async fn create(&self, new: &NewClipComment) -> DbResult<ClipComment> {
        db_execute!(
            &self.database,
            "INSERT INTO clip_comments (id, clip_id, user_id, body, created_at, updated_at, deleted_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)",
            [
                &new.id,
                &new.clip_id,
                &new.user_id,
                &new.body,
                new.created_at,
                new.updated_at,
                new.deleted_at,
            ]
        )?;

        Ok(self
            .get(&new.id)
            .await?
            .expect("inserted clip comment should exist"))
    }

    pub async fn get(&self, id: &str) -> DbResult<Option<ClipComment>> {
        Ok(db_fetch_optional!(
            &self.database,
            ClipComment,
            "SELECT id, clip_id, user_id, body, created_at, updated_at, deleted_at
             FROM clip_comments WHERE id = ?",
            [id]
        )?)
    }

    pub async fn list_for_clip(&self, clip_id: &str, limit: i64) -> DbResult<Vec<ClipComment>> {
        Ok(db_fetch_all!(
            &self.database,
            ClipComment,
            "SELECT id, clip_id, user_id, body, created_at, updated_at, deleted_at
             FROM (
               SELECT id, clip_id, user_id, body, created_at, updated_at, deleted_at
               FROM clip_comments
               WHERE clip_id = ? AND deleted_at IS NULL
               ORDER BY created_at DESC, id DESC
               LIMIT ?
             ) recent_comments
             ORDER BY created_at ASC, id ASC",
            [clip_id, limit]
        )?)
    }

    pub async fn soft_delete(&self, id: &str) -> DbResult<bool> {
        let now = now_utc();
        let rows_affected = db_execute_rows!(
            &self.database,
            "UPDATE clip_comments
             SET deleted_at = ?, updated_at = ?
             WHERE id = ? AND deleted_at IS NULL",
            [now, now, id]
        )?;
        Ok(rows_affected > 0)
    }
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
               storage_key, storage_upload_id, checksum_sha256, failure_reason, created_at, updated_at, completed_at, failed_at, expires_at
             )
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
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
                new.failure_reason.as_deref(),
                new.created_at,
                new.updated_at,
                new.completed_at,
                new.failed_at,
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
                    storage_key, storage_upload_id, checksum_sha256, failure_reason, created_at, updated_at, completed_at, failed_at, expires_at
             FROM upload_sessions WHERE id = ?",
            [id]
        )?)
    }

    pub async fn get_by_clip_id(&self, clip_id: &str) -> DbResult<Option<UploadSession>> {
        Ok(db_fetch_optional!(
            &self.database,
            UploadSession,
            "SELECT id, clip_id, user_id, status, expected_size_bytes, received_size_bytes, part_size_bytes,
                    storage_key, storage_upload_id, checksum_sha256, failure_reason, created_at, updated_at, completed_at, failed_at, expires_at
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
                    storage_key, storage_upload_id, checksum_sha256, failure_reason, created_at, updated_at, completed_at, failed_at, expires_at
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
            "UPDATE upload_sessions
             SET status = 'completed', completed_at = ?, failure_reason = NULL, failed_at = NULL, updated_at = ?
             WHERE id = ?",
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

    pub async fn fail(&self, id: &str, reason: &str) -> DbResult<()> {
        let now = now_utc();
        db_execute!(
            &self.database,
            "UPDATE upload_sessions SET status = 'failed', failure_reason = ?, failed_at = ?, updated_at = ? WHERE id = ?",
            [reason, now, now, id]
        )?;
        Ok(())
    }

    pub async fn list_failed(&self, limit: i64) -> DbResult<Vec<UploadSession>> {
        Ok(db_fetch_all!(
            &self.database,
            UploadSession,
            "SELECT id, clip_id, user_id, status, expected_size_bytes, received_size_bytes, part_size_bytes,
                    storage_key, storage_upload_id, checksum_sha256, failure_reason, created_at, updated_at, completed_at, failed_at, expires_at
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

    pub async fn delete_for_user(&self, user_id: &str) -> DbResult<()> {
        db_execute!(
            &self.database,
            "DELETE FROM reset_password_tokens WHERE user_id = ?",
            [user_id]
        )?;
        Ok(())
    }
}

#[derive(Clone)]
pub struct InvitationTokenRepository {
    database: Database,
}

impl InvitationTokenRepository {
    pub fn new(database: Database) -> Self {
        Self { database }
    }

    pub async fn create(&self, new: &NewInvitationToken) -> DbResult<InvitationToken> {
        db_execute!(
            &self.database,
            "INSERT INTO invitation_tokens (id, token_hash, role, created_by_user_id, created_at, expires_at, used_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)",
            [
                &new.id,
                &new.token_hash,
                &new.role,
                new.created_by_user_id.as_deref(),
                new.created_at,
                new.expires_at,
                new.used_at,
            ]
        )?;

        Ok(self
            .get(&new.id)
            .await?
            .expect("inserted invitation token should exist"))
    }

    pub async fn get(&self, id: &str) -> DbResult<Option<InvitationToken>> {
        Ok(db_fetch_optional!(
            &self.database,
            InvitationToken,
            "SELECT id, token_hash, role, created_by_user_id, created_at, expires_at, used_at
             FROM invitation_tokens WHERE id = ?",
            [id]
        )?)
    }

    pub async fn get_by_token_hash(&self, token_hash: &str) -> DbResult<Option<InvitationToken>> {
        Ok(db_fetch_optional!(
            &self.database,
            InvitationToken,
            "SELECT id, token_hash, role, created_by_user_id, created_at, expires_at, used_at
             FROM invitation_tokens WHERE token_hash = ?",
            [token_hash]
        )?)
    }

    pub async fn mark_used_if_valid(
        &self,
        id: &str,
        now: chrono::DateTime<chrono::Utc>,
    ) -> DbResult<bool> {
        let rows = db_execute_rows!(
            &self.database,
            "UPDATE invitation_tokens SET used_at = ? WHERE id = ? AND used_at IS NULL AND expires_at > ?",
            [now, id, now]
        )?;
        Ok(rows > 0)
    }

    pub async fn delete(&self, id: &str) -> DbResult<()> {
        db_execute!(
            &self.database,
            "DELETE FROM invitation_tokens WHERE id = ?",
            [id]
        )?;
        Ok(())
    }
}
