use chrono::{DateTime, Utc};
use serde_json::json;
use sqlx::{types::Json, Postgres, Sqlite};

use super::{AbortUploadOutcome, BulkVisibilityUpdate, FinalizeUploadOutcome, Repositories};
use crate::{
    now_utc, Database, DbResult, NewAuditLogEntry, NewClip, NewClipMarker, NewJob,
    NewUploadSession, NewUser,
};

impl Repositories {
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

    pub async fn update_password_and_revoke_credentials(
        &self,
        user_id: &str,
        password_hash: &str,
    ) -> DbResult<()> {
        let now = now_utc();
        match &self.users.database {
            Database::Sqlite(pool) => {
                let mut transaction = pool.begin().await?;
                update_password_and_revoke_sqlite(&mut transaction, user_id, password_hash, now)
                    .await?;
                transaction.commit().await?;
            }
            Database::Postgres(pool) => {
                let mut transaction = pool.begin().await?;
                update_password_and_revoke_postgres(&mut transaction, user_id, password_hash, now)
                    .await?;
                transaction.commit().await?;
            }
        }
        Ok(())
    }

    pub async fn redeem_reset_password_token(
        &self,
        token_id: &str,
        user_id: &str,
        password_hash: &str,
        now: DateTime<Utc>,
    ) -> DbResult<bool> {
        match &self.users.database {
            Database::Sqlite(pool) => {
                let mut transaction = pool.begin().await?;
                let consumed = sqlx::query(
                    "UPDATE reset_password_tokens
                     SET used_at = ?
                     WHERE id = ? AND user_id = ? AND used_at IS NULL AND expires_at > ?",
                )
                .bind(now)
                .bind(token_id)
                .bind(user_id)
                .bind(now)
                .execute(&mut *transaction)
                .await?
                .rows_affected();
                if consumed != 1 {
                    return Ok(false);
                }
                update_password_and_revoke_sqlite(&mut transaction, user_id, password_hash, now)
                    .await?;
                transaction.commit().await?;
            }
            Database::Postgres(pool) => {
                let mut transaction = pool.begin().await?;
                let consumed = sqlx::query(
                    "UPDATE reset_password_tokens
                     SET used_at = $1
                     WHERE id = $2 AND user_id = $3 AND used_at IS NULL AND expires_at > $4",
                )
                .bind(now)
                .bind(token_id)
                .bind(user_id)
                .bind(now)
                .execute(&mut *transaction)
                .await?
                .rows_affected();
                if consumed != 1 {
                    return Ok(false);
                }
                update_password_and_revoke_postgres(&mut transaction, user_id, password_hash, now)
                    .await?;
                transaction.commit().await?;
            }
        }
        Ok(true)
    }

    pub async fn redeem_invitation_token(
        &self,
        token_id: &str,
        presented_token_hash: &str,
        new_user: &NewUser,
        now: DateTime<Utc>,
    ) -> DbResult<bool> {
        match &self.users.database {
            Database::Sqlite(pool) => {
                let mut transaction = pool.begin().await?;
                let consumed = sqlx::query(
                    "UPDATE invitation_tokens
                     SET claimed_at = COALESCE(claimed_at, ?), used_at = ?
                     WHERE id = ? AND used_at IS NULL AND expires_at > ?
                       AND (
                         (token_hash = ? AND claim_token_hash IS NULL AND claimed_at IS NULL)
                         OR claim_token_hash = ?
                       )",
                )
                .bind(now)
                .bind(now)
                .bind(token_id)
                .bind(now)
                .bind(presented_token_hash)
                .bind(presented_token_hash)
                .execute(&mut *transaction)
                .await?
                .rows_affected();
                if consumed != 1 {
                    return Ok(false);
                }
                insert_user_sqlite(&mut transaction, new_user).await?;
                transaction.commit().await?;
            }
            Database::Postgres(pool) => {
                let mut transaction = pool.begin().await?;
                let consumed = sqlx::query(
                    "UPDATE invitation_tokens
                     SET claimed_at = COALESCE(claimed_at, $1), used_at = $2
                     WHERE id = $3 AND used_at IS NULL AND expires_at > $4
                       AND (
                         (token_hash = $5 AND claim_token_hash IS NULL AND claimed_at IS NULL)
                         OR claim_token_hash = $6
                       )",
                )
                .bind(now)
                .bind(now)
                .bind(token_id)
                .bind(now)
                .bind(presented_token_hash)
                .bind(presented_token_hash)
                .execute(&mut *transaction)
                .await?
                .rows_affected();
                if consumed != 1 {
                    return Ok(false);
                }
                insert_user_postgres(&mut transaction, new_user).await?;
                transaction.commit().await?;
            }
        }
        Ok(true)
    }

    pub async fn create_upload_bundle(
        &self,
        clip: &NewClip,
        session: &NewUploadSession,
        markers: &[NewClipMarker],
    ) -> DbResult<()> {
        match &self.clips.database {
            Database::Sqlite(pool) => {
                let mut transaction = pool.begin().await?;
                insert_clip_sqlite(&mut transaction, clip).await?;
                insert_upload_session_sqlite(&mut transaction, session).await?;
                for marker in markers {
                    insert_clip_marker_sqlite(&mut transaction, marker).await?;
                }
                transaction.commit().await?;
            }
            Database::Postgres(pool) => {
                let mut transaction = pool.begin().await?;
                insert_clip_postgres(&mut transaction, clip).await?;
                insert_upload_session_postgres(&mut transaction, session).await?;
                for marker in markers {
                    insert_clip_marker_postgres(&mut transaction, marker).await?;
                }
                transaction.commit().await?;
            }
        }
        Ok(())
    }

    pub async fn finalize_upload(
        &self,
        session_id: &str,
        clip_id: &str,
        expected_size_bytes: i64,
        validate_job: &NewJob,
    ) -> DbResult<FinalizeUploadOutcome> {
        match &self.upload_sessions.database {
            Database::Sqlite(pool) => {
                let mut transaction = pool.begin().await?;
                let outcome = finalize_upload_sqlite(
                    &mut transaction,
                    session_id,
                    clip_id,
                    expected_size_bytes,
                    validate_job,
                )
                .await?;
                if outcome != FinalizeUploadOutcome::NotMutable {
                    transaction.commit().await?;
                } else {
                    transaction.rollback().await?;
                }
                Ok(outcome)
            }
            Database::Postgres(pool) => {
                let mut transaction = pool.begin().await?;
                let outcome = finalize_upload_postgres(
                    &mut transaction,
                    session_id,
                    clip_id,
                    expected_size_bytes,
                    validate_job,
                )
                .await?;
                if outcome != FinalizeUploadOutcome::NotMutable {
                    transaction.commit().await?;
                } else {
                    transaction.rollback().await?;
                }
                Ok(outcome)
            }
        }
    }

    pub async fn abort_upload(
        &self,
        session_id: &str,
        clip_id: &str,
    ) -> DbResult<AbortUploadOutcome> {
        match &self.upload_sessions.database {
            Database::Sqlite(pool) => {
                let mut transaction = pool.begin().await?;
                let outcome = abort_upload_sqlite(&mut transaction, session_id, clip_id).await?;
                if outcome != AbortUploadOutcome::NotMutable {
                    transaction.commit().await?;
                } else {
                    transaction.rollback().await?;
                }
                Ok(outcome)
            }
            Database::Postgres(pool) => {
                let mut transaction = pool.begin().await?;
                let outcome = abort_upload_postgres(&mut transaction, session_id, clip_id).await?;
                if outcome != AbortUploadOutcome::NotMutable {
                    transaction.commit().await?;
                } else {
                    transaction.rollback().await?;
                }
                Ok(outcome)
            }
        }
    }

    pub async fn delete_upload_bundle(&self, session_id: &str, clip_id: &str) -> DbResult<()> {
        match &self.upload_sessions.database {
            Database::Sqlite(pool) => {
                let mut transaction = pool.begin().await?;
                sqlx::query("DELETE FROM upload_sessions WHERE id = ? AND clip_id = ?")
                    .bind(session_id)
                    .bind(clip_id)
                    .execute(&mut *transaction)
                    .await?;
                sqlx::query("DELETE FROM clips WHERE id = ?")
                    .bind(clip_id)
                    .execute(&mut *transaction)
                    .await?;
                transaction.commit().await?;
            }
            Database::Postgres(pool) => {
                let mut transaction = pool.begin().await?;
                sqlx::query("DELETE FROM upload_sessions WHERE id = $1 AND clip_id = $2")
                    .bind(session_id)
                    .bind(clip_id)
                    .execute(&mut *transaction)
                    .await?;
                sqlx::query("DELETE FROM clips WHERE id = $1")
                    .bind(clip_id)
                    .execute(&mut *transaction)
                    .await?;
                transaction.commit().await?;
            }
        }
        Ok(())
    }
}

async fn update_password_and_revoke_sqlite(
    transaction: &mut sqlx::Transaction<'_, Sqlite>,
    user_id: &str,
    password_hash: &str,
    now: DateTime<Utc>,
) -> Result<(), sqlx::Error> {
    sqlx::query("UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?")
        .bind(password_hash)
        .bind(now)
        .bind(user_id)
        .execute(&mut **transaction)
        .await?;
    sqlx::query("UPDATE sessions SET revoked_at = COALESCE(revoked_at, ?) WHERE user_id = ?")
        .bind(now)
        .bind(user_id)
        .execute(&mut **transaction)
        .await?;
    sqlx::query("UPDATE device_tokens SET revoked_at = COALESCE(revoked_at, ?) WHERE user_id = ?")
        .bind(now)
        .bind(user_id)
        .execute(&mut **transaction)
        .await?;
    Ok(())
}

async fn update_password_and_revoke_postgres(
    transaction: &mut sqlx::Transaction<'_, Postgres>,
    user_id: &str,
    password_hash: &str,
    now: DateTime<Utc>,
) -> Result<(), sqlx::Error> {
    sqlx::query("UPDATE users SET password_hash = $1, updated_at = $2 WHERE id = $3")
        .bind(password_hash)
        .bind(now)
        .bind(user_id)
        .execute(&mut **transaction)
        .await?;
    sqlx::query("UPDATE sessions SET revoked_at = COALESCE(revoked_at, $1) WHERE user_id = $2")
        .bind(now)
        .bind(user_id)
        .execute(&mut **transaction)
        .await?;
    sqlx::query(
        "UPDATE device_tokens SET revoked_at = COALESCE(revoked_at, $1) WHERE user_id = $2",
    )
    .bind(now)
    .bind(user_id)
    .execute(&mut **transaction)
    .await?;
    Ok(())
}

async fn insert_user_sqlite(
    transaction: &mut sqlx::Transaction<'_, Sqlite>,
    new: &NewUser,
) -> Result<(), sqlx::Error> {
    sqlx::query(
        "INSERT INTO users (id, username, display_name, email, bio, avatar_key, password_hash, role, is_disabled, storage_quota_bytes, created_at, updated_at, last_login_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(&new.id)
    .bind(&new.username)
    .bind(new.display_name.as_deref())
    .bind(new.email.as_deref())
    .bind(new.bio.as_deref())
    .bind(new.avatar_key.as_deref())
    .bind(&new.password_hash)
    .bind(&new.role)
    .bind(new.is_disabled)
    .bind(new.storage_quota_bytes)
    .bind(new.created_at)
    .bind(new.updated_at)
    .bind(new.last_login_at)
    .execute(&mut **transaction)
    .await?;
    Ok(())
}

async fn insert_user_postgres(
    transaction: &mut sqlx::Transaction<'_, Postgres>,
    new: &NewUser,
) -> Result<(), sqlx::Error> {
    sqlx::query(
        "INSERT INTO users (id, username, display_name, email, bio, avatar_key, password_hash, role, is_disabled, storage_quota_bytes, created_at, updated_at, last_login_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)",
    )
    .bind(&new.id)
    .bind(&new.username)
    .bind(new.display_name.as_deref())
    .bind(new.email.as_deref())
    .bind(new.bio.as_deref())
    .bind(new.avatar_key.as_deref())
    .bind(&new.password_hash)
    .bind(&new.role)
    .bind(new.is_disabled)
    .bind(new.storage_quota_bytes)
    .bind(new.created_at)
    .bind(new.updated_at)
    .bind(new.last_login_at)
    .execute(&mut **transaction)
    .await?;
    Ok(())
}

const INSERT_CLIP_SQL: &str =
    "INSERT INTO clips (
       id, owner_user_id, client_clip_id, title, description, game_name, game_id, game_executable, source_type,
       recorded_at, uploaded_at, duration_ms, file_size_bytes, width, height, fps, container,
       video_codec, audio_codec, checksum_sha256, visibility, status, storage_backend, storage_key,
       poster_key, thumbnail_key, public_share_id, view_count, created_at, updated_at, deleted_at
     )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

const INSERT_UPLOAD_SESSION_SQL: &str =
    "INSERT INTO upload_sessions (
       id, clip_id, user_id, status, expected_size_bytes, received_size_bytes, part_size_bytes,
       storage_key, storage_upload_id, checksum_sha256, failure_reason, created_at, updated_at, completed_at, failed_at, expires_at
     )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

const INSERT_CLIP_MARKER_SQL: &str =
    "INSERT INTO clip_markers (id, clip_id, kind, label, timestamp_ms, metadata_json, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)";

const INSERT_ACTIVE_JOB_SQL: &str = "INSERT INTO jobs (
       id, kind, status, target_type, target_id, attempts, max_attempts, next_run_at,
       locked_by, locked_at, last_error, created_at, updated_at
     )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT DO NOTHING";

async fn insert_clip_sqlite(
    transaction: &mut sqlx::Transaction<'_, Sqlite>,
    new: &NewClip,
) -> Result<(), sqlx::Error> {
    let query = sqlx::query(INSERT_CLIP_SQL)
        .bind(&new.id)
        .bind(&new.owner_user_id)
        .bind(new.client_clip_id.as_deref())
        .bind(&new.title)
        .bind(new.description.as_deref())
        .bind(new.game_name.as_deref())
        .bind(new.game_id.as_deref())
        .bind(new.game_executable.as_deref())
        .bind(new.source_type.as_deref())
        .bind(new.recorded_at)
        .bind(new.uploaded_at)
        .bind(new.duration_ms)
        .bind(new.file_size_bytes)
        .bind(new.width)
        .bind(new.height)
        .bind(new.fps)
        .bind(new.container.as_deref())
        .bind(new.video_codec.as_deref())
        .bind(new.audio_codec.as_deref())
        .bind(new.checksum_sha256.as_deref())
        .bind(&new.visibility)
        .bind(&new.status)
        .bind(&new.storage_backend)
        .bind(new.storage_key.as_deref())
        .bind(new.poster_key.as_deref())
        .bind(new.thumbnail_key.as_deref())
        .bind(new.public_share_id.as_deref())
        .bind(new.view_count)
        .bind(new.created_at)
        .bind(new.updated_at)
        .bind(new.deleted_at);
    query.execute(&mut **transaction).await?;
    Ok(())
}

async fn insert_clip_postgres(
    transaction: &mut sqlx::Transaction<'_, Postgres>,
    new: &NewClip,
) -> Result<(), sqlx::Error> {
    let sql = crate::postgres_placeholders(INSERT_CLIP_SQL);
    let query = sqlx::query(&sql)
        .bind(&new.id)
        .bind(&new.owner_user_id)
        .bind(new.client_clip_id.as_deref())
        .bind(&new.title)
        .bind(new.description.as_deref())
        .bind(new.game_name.as_deref())
        .bind(new.game_id.as_deref())
        .bind(new.game_executable.as_deref())
        .bind(new.source_type.as_deref())
        .bind(new.recorded_at)
        .bind(new.uploaded_at)
        .bind(new.duration_ms)
        .bind(new.file_size_bytes)
        .bind(new.width)
        .bind(new.height)
        .bind(new.fps)
        .bind(new.container.as_deref())
        .bind(new.video_codec.as_deref())
        .bind(new.audio_codec.as_deref())
        .bind(new.checksum_sha256.as_deref())
        .bind(&new.visibility)
        .bind(&new.status)
        .bind(&new.storage_backend)
        .bind(new.storage_key.as_deref())
        .bind(new.poster_key.as_deref())
        .bind(new.thumbnail_key.as_deref())
        .bind(new.public_share_id.as_deref())
        .bind(new.view_count)
        .bind(new.created_at)
        .bind(new.updated_at)
        .bind(new.deleted_at);
    query.execute(&mut **transaction).await?;
    Ok(())
}

async fn insert_upload_session_sqlite(
    transaction: &mut sqlx::Transaction<'_, Sqlite>,
    new: &NewUploadSession,
) -> Result<(), sqlx::Error> {
    sqlx::query(INSERT_UPLOAD_SESSION_SQL)
        .bind(&new.id)
        .bind(&new.clip_id)
        .bind(&new.user_id)
        .bind(&new.status)
        .bind(new.expected_size_bytes)
        .bind(new.received_size_bytes)
        .bind(new.part_size_bytes)
        .bind(&new.storage_key)
        .bind(new.storage_upload_id.as_deref())
        .bind(new.checksum_sha256.as_deref())
        .bind(new.failure_reason.as_deref())
        .bind(new.created_at)
        .bind(new.updated_at)
        .bind(new.completed_at)
        .bind(new.failed_at)
        .bind(new.expires_at)
        .execute(&mut **transaction)
        .await?;
    Ok(())
}

async fn insert_upload_session_postgres(
    transaction: &mut sqlx::Transaction<'_, Postgres>,
    new: &NewUploadSession,
) -> Result<(), sqlx::Error> {
    let sql = crate::postgres_placeholders(INSERT_UPLOAD_SESSION_SQL);
    sqlx::query(&sql)
        .bind(&new.id)
        .bind(&new.clip_id)
        .bind(&new.user_id)
        .bind(&new.status)
        .bind(new.expected_size_bytes)
        .bind(new.received_size_bytes)
        .bind(new.part_size_bytes)
        .bind(&new.storage_key)
        .bind(new.storage_upload_id.as_deref())
        .bind(new.checksum_sha256.as_deref())
        .bind(new.failure_reason.as_deref())
        .bind(new.created_at)
        .bind(new.updated_at)
        .bind(new.completed_at)
        .bind(new.failed_at)
        .bind(new.expires_at)
        .execute(&mut **transaction)
        .await?;
    Ok(())
}

async fn insert_clip_marker_sqlite(
    transaction: &mut sqlx::Transaction<'_, Sqlite>,
    new: &NewClipMarker,
) -> Result<(), sqlx::Error> {
    sqlx::query(INSERT_CLIP_MARKER_SQL)
        .bind(&new.id)
        .bind(&new.clip_id)
        .bind(&new.kind)
        .bind(new.label.as_deref())
        .bind(new.timestamp_ms)
        .bind(new.metadata_json.as_ref())
        .bind(new.created_at)
        .execute(&mut **transaction)
        .await?;
    Ok(())
}

async fn insert_clip_marker_postgres(
    transaction: &mut sqlx::Transaction<'_, Postgres>,
    new: &NewClipMarker,
) -> Result<(), sqlx::Error> {
    let sql = crate::postgres_placeholders(INSERT_CLIP_MARKER_SQL);
    sqlx::query(&sql)
        .bind(&new.id)
        .bind(&new.clip_id)
        .bind(&new.kind)
        .bind(new.label.as_deref())
        .bind(new.timestamp_ms)
        .bind(new.metadata_json.as_ref())
        .bind(new.created_at)
        .execute(&mut **transaction)
        .await?;
    Ok(())
}

async fn insert_active_job_sqlite(
    transaction: &mut sqlx::Transaction<'_, Sqlite>,
    new: &NewJob,
) -> Result<(), sqlx::Error> {
    sqlx::query(INSERT_ACTIVE_JOB_SQL)
        .bind(&new.id)
        .bind(&new.kind)
        .bind(&new.status)
        .bind(new.target_type.as_deref())
        .bind(new.target_id.as_deref())
        .bind(new.attempts)
        .bind(new.max_attempts)
        .bind(new.next_run_at)
        .bind(new.locked_by.as_deref())
        .bind(new.locked_at)
        .bind(new.last_error.as_deref())
        .bind(new.created_at)
        .bind(new.updated_at)
        .execute(&mut **transaction)
        .await?;
    Ok(())
}

async fn insert_active_job_postgres(
    transaction: &mut sqlx::Transaction<'_, Postgres>,
    new: &NewJob,
) -> Result<(), sqlx::Error> {
    let sql = crate::postgres_placeholders(INSERT_ACTIVE_JOB_SQL);
    sqlx::query(&sql)
        .bind(&new.id)
        .bind(&new.kind)
        .bind(&new.status)
        .bind(new.target_type.as_deref())
        .bind(new.target_id.as_deref())
        .bind(new.attempts)
        .bind(new.max_attempts)
        .bind(new.next_run_at)
        .bind(new.locked_by.as_deref())
        .bind(new.locked_at)
        .bind(new.last_error.as_deref())
        .bind(new.created_at)
        .bind(new.updated_at)
        .execute(&mut **transaction)
        .await?;
    Ok(())
}

async fn finalize_upload_sqlite(
    transaction: &mut sqlx::Transaction<'_, Sqlite>,
    session_id: &str,
    clip_id: &str,
    expected_size_bytes: i64,
    validate_job: &NewJob,
) -> Result<FinalizeUploadOutcome, sqlx::Error> {
    let now = now_utc();
    let updated = sqlx::query(
        "UPDATE upload_sessions
         SET status = 'completed', received_size_bytes = ?, completed_at = ?,
             failure_reason = NULL, failed_at = NULL, updated_at = ?
         WHERE id = ? AND clip_id = ? AND status IN ('created','uploading')",
    )
    .bind(expected_size_bytes)
    .bind(now)
    .bind(now)
    .bind(session_id)
    .bind(clip_id)
    .execute(&mut **transaction)
    .await?
    .rows_affected();
    let outcome = if updated == 1 {
        FinalizeUploadOutcome::Finalized
    } else {
        let status = sqlx::query_as::<_, (String,)>(
            "SELECT status FROM upload_sessions WHERE id = ? AND clip_id = ?",
        )
        .bind(session_id)
        .bind(clip_id)
        .fetch_optional(&mut **transaction)
        .await?;
        match status.as_ref().map(|row| row.0.as_str()) {
            Some("completed") => FinalizeUploadOutcome::AlreadyCompleted,
            _ => return Ok(FinalizeUploadOutcome::NotMutable),
        }
    };

    let clip_status = sqlx::query_as::<_, (String,)>(
        "SELECT status FROM clips WHERE id = ? AND deleted_at IS NULL",
    )
    .bind(clip_id)
    .fetch_optional(&mut **transaction)
    .await?;
    match clip_status.as_ref().map(|row| row.0.as_str()) {
        Some("ready") => return Ok(outcome),
        Some("created" | "uploading" | "processing") => {}
        _ => return Ok(FinalizeUploadOutcome::NotMutable),
    }
    sqlx::query(
        "UPDATE clips
         SET status = 'processing', uploaded_at = COALESCE(uploaded_at, ?), updated_at = ?
         WHERE id = ? AND deleted_at IS NULL AND status IN ('created','uploading','processing')",
    )
    .bind(now)
    .bind(now)
    .bind(clip_id)
    .execute(&mut **transaction)
    .await?;
    insert_active_job_sqlite(transaction, validate_job).await?;
    Ok(outcome)
}

async fn finalize_upload_postgres(
    transaction: &mut sqlx::Transaction<'_, Postgres>,
    session_id: &str,
    clip_id: &str,
    expected_size_bytes: i64,
    validate_job: &NewJob,
) -> Result<FinalizeUploadOutcome, sqlx::Error> {
    let now = now_utc();
    let updated = sqlx::query(
        "UPDATE upload_sessions
         SET status = 'completed', received_size_bytes = $1, completed_at = $2,
             failure_reason = NULL, failed_at = NULL, updated_at = $3
         WHERE id = $4 AND clip_id = $5 AND status IN ('created','uploading')",
    )
    .bind(expected_size_bytes)
    .bind(now)
    .bind(now)
    .bind(session_id)
    .bind(clip_id)
    .execute(&mut **transaction)
    .await?
    .rows_affected();
    let outcome = if updated == 1 {
        FinalizeUploadOutcome::Finalized
    } else {
        let status = sqlx::query_as::<_, (String,)>(
            "SELECT status FROM upload_sessions WHERE id = $1 AND clip_id = $2 FOR UPDATE",
        )
        .bind(session_id)
        .bind(clip_id)
        .fetch_optional(&mut **transaction)
        .await?;
        match status.as_ref().map(|row| row.0.as_str()) {
            Some("completed") => FinalizeUploadOutcome::AlreadyCompleted,
            _ => return Ok(FinalizeUploadOutcome::NotMutable),
        }
    };

    let clip_status = sqlx::query_as::<_, (String,)>(
        "SELECT status FROM clips WHERE id = $1 AND deleted_at IS NULL FOR UPDATE",
    )
    .bind(clip_id)
    .fetch_optional(&mut **transaction)
    .await?;
    match clip_status.as_ref().map(|row| row.0.as_str()) {
        Some("ready") => return Ok(outcome),
        Some("created" | "uploading" | "processing") => {}
        _ => return Ok(FinalizeUploadOutcome::NotMutable),
    }
    sqlx::query(
        "UPDATE clips
         SET status = 'processing', uploaded_at = COALESCE(uploaded_at, $1), updated_at = $2
         WHERE id = $3 AND deleted_at IS NULL AND status IN ('created','uploading','processing')",
    )
    .bind(now)
    .bind(now)
    .bind(clip_id)
    .execute(&mut **transaction)
    .await?;
    insert_active_job_postgres(transaction, validate_job).await?;
    Ok(outcome)
}

async fn abort_upload_sqlite(
    transaction: &mut sqlx::Transaction<'_, Sqlite>,
    session_id: &str,
    clip_id: &str,
) -> Result<AbortUploadOutcome, sqlx::Error> {
    let now = now_utc();
    let updated = sqlx::query(
        "UPDATE upload_sessions SET status = 'aborted', updated_at = ?
         WHERE id = ? AND clip_id = ? AND status IN ('created','uploading')",
    )
    .bind(now)
    .bind(session_id)
    .bind(clip_id)
    .execute(&mut **transaction)
    .await?
    .rows_affected();
    let outcome = if updated == 1 {
        AbortUploadOutcome::Aborted
    } else {
        let status = sqlx::query_as::<_, (String,)>(
            "SELECT status FROM upload_sessions WHERE id = ? AND clip_id = ?",
        )
        .bind(session_id)
        .bind(clip_id)
        .fetch_optional(&mut **transaction)
        .await?;
        match status.as_ref().map(|row| row.0.as_str()) {
            Some("aborted") => AbortUploadOutcome::AlreadyAborted,
            _ => return Ok(AbortUploadOutcome::NotMutable),
        }
    };
    sqlx::query("DELETE FROM upload_parts WHERE upload_session_id = ?")
        .bind(session_id)
        .execute(&mut **transaction)
        .await?;
    sqlx::query(
        "UPDATE clips SET status = 'deleted', deleted_at = COALESCE(deleted_at, ?), updated_at = ?
         WHERE id = ? AND status <> 'ready'",
    )
    .bind(now)
    .bind(now)
    .bind(clip_id)
    .execute(&mut **transaction)
    .await?;
    Ok(outcome)
}

async fn abort_upload_postgres(
    transaction: &mut sqlx::Transaction<'_, Postgres>,
    session_id: &str,
    clip_id: &str,
) -> Result<AbortUploadOutcome, sqlx::Error> {
    let now = now_utc();
    let updated = sqlx::query(
        "UPDATE upload_sessions SET status = 'aborted', updated_at = $1
         WHERE id = $2 AND clip_id = $3 AND status IN ('created','uploading')",
    )
    .bind(now)
    .bind(session_id)
    .bind(clip_id)
    .execute(&mut **transaction)
    .await?
    .rows_affected();
    let outcome = if updated == 1 {
        AbortUploadOutcome::Aborted
    } else {
        let status = sqlx::query_as::<_, (String,)>(
            "SELECT status FROM upload_sessions WHERE id = $1 AND clip_id = $2 FOR UPDATE",
        )
        .bind(session_id)
        .bind(clip_id)
        .fetch_optional(&mut **transaction)
        .await?;
        match status.as_ref().map(|row| row.0.as_str()) {
            Some("aborted") => AbortUploadOutcome::AlreadyAborted,
            _ => return Ok(AbortUploadOutcome::NotMutable),
        }
    };
    sqlx::query("DELETE FROM upload_parts WHERE upload_session_id = $1")
        .bind(session_id)
        .execute(&mut **transaction)
        .await?;
    sqlx::query(
        "UPDATE clips SET status = 'deleted', deleted_at = COALESCE(deleted_at, $1), updated_at = $2
         WHERE id = $3 AND status <> 'ready'",
    )
    .bind(now)
    .bind(now)
    .bind(clip_id)
    .execute(&mut **transaction)
    .await?;
    Ok(outcome)
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
