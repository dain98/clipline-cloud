use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use sqlx::{types::Json, FromRow};

use crate::{new_ulid, now_utc};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, FromRow)]
pub struct User {
    pub id: String,
    pub username: String,
    pub display_name: Option<String>,
    pub email: Option<String>,
    pub bio: Option<String>,
    pub avatar_key: Option<String>,
    pub password_hash: String,
    pub role: String,
    pub is_disabled: bool,
    pub storage_quota_bytes: Option<i64>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub last_login_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone)]
pub struct NewUser {
    pub id: String,
    pub username: String,
    pub display_name: Option<String>,
    pub email: Option<String>,
    pub bio: Option<String>,
    pub avatar_key: Option<String>,
    pub password_hash: String,
    pub role: String,
    pub is_disabled: bool,
    pub storage_quota_bytes: Option<i64>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub last_login_at: Option<DateTime<Utc>>,
}

impl NewUser {
    pub fn new(
        username: impl Into<String>,
        password_hash: impl Into<String>,
        role: impl Into<String>,
    ) -> Self {
        let now = now_utc();
        Self {
            id: new_ulid(),
            username: username.into(),
            display_name: None,
            email: None,
            bio: None,
            avatar_key: None,
            password_hash: password_hash.into(),
            role: role.into(),
            is_disabled: false,
            storage_quota_bytes: None,
            created_at: now,
            updated_at: now,
            last_login_at: None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, FromRow)]
pub struct AppSettings {
    pub id: i64,
    pub owner_user_id: Option<String>,
    pub allow_vod_uploads: bool,
    pub vod_threshold_minutes: i64,
    pub about_text: String,
    pub smtp_enabled: bool,
    pub smtp_host: Option<String>,
    pub smtp_port: i64,
    pub smtp_tls_mode: String,
    pub smtp_username: Option<String>,
    pub smtp_password: Option<String>,
    pub smtp_from_email: Option<String>,
    pub smtp_from_name: Option<String>,
    pub user_storage_quota_bytes: Option<i64>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, FromRow)]
pub struct Session {
    pub id: String,
    pub user_id: String,
    pub token_hash: String,
    pub user_agent: Option<String>,
    pub ip_address: Option<String>,
    pub created_at: DateTime<Utc>,
    pub last_used_at: Option<DateTime<Utc>>,
    pub expires_at: DateTime<Utc>,
    pub revoked_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone)]
pub struct NewSession {
    pub id: String,
    pub user_id: String,
    pub token_hash: String,
    pub user_agent: Option<String>,
    pub ip_address: Option<String>,
    pub created_at: DateTime<Utc>,
    pub last_used_at: Option<DateTime<Utc>>,
    pub expires_at: DateTime<Utc>,
    pub revoked_at: Option<DateTime<Utc>>,
}

impl NewSession {
    pub fn new(
        user_id: impl Into<String>,
        token_hash: impl Into<String>,
        expires_at: DateTime<Utc>,
    ) -> Self {
        Self {
            id: new_ulid(),
            user_id: user_id.into(),
            token_hash: token_hash.into(),
            user_agent: None,
            ip_address: None,
            created_at: now_utc(),
            last_used_at: None,
            expires_at,
            revoked_at: None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, FromRow)]
pub struct DeviceToken {
    pub id: String,
    pub user_id: String,
    pub name: String,
    pub token_hash: String,
    pub created_at: DateTime<Utc>,
    pub last_used_at: Option<DateTime<Utc>>,
    pub expires_at: Option<DateTime<Utc>>,
    pub revoked_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone)]
pub struct NewDeviceToken {
    pub id: String,
    pub user_id: String,
    pub name: String,
    pub token_hash: String,
    pub created_at: DateTime<Utc>,
    pub last_used_at: Option<DateTime<Utc>>,
    pub expires_at: Option<DateTime<Utc>>,
    pub revoked_at: Option<DateTime<Utc>>,
}

impl NewDeviceToken {
    pub fn new(
        user_id: impl Into<String>,
        name: impl Into<String>,
        token_hash: impl Into<String>,
    ) -> Self {
        Self {
            id: new_ulid(),
            user_id: user_id.into(),
            name: name.into(),
            token_hash: token_hash.into(),
            created_at: now_utc(),
            last_used_at: None,
            expires_at: None,
            revoked_at: None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, FromRow)]
pub struct Clip {
    pub id: String,
    pub owner_user_id: String,
    pub client_clip_id: Option<String>,
    pub title: String,
    pub description: Option<String>,
    pub game_name: Option<String>,
    pub game_id: Option<String>,
    pub game_executable: Option<String>,
    pub source_type: Option<String>,
    pub recorded_at: Option<DateTime<Utc>>,
    pub uploaded_at: Option<DateTime<Utc>>,
    pub duration_ms: Option<i64>,
    pub file_size_bytes: Option<i64>,
    pub width: Option<i64>,
    pub height: Option<i64>,
    pub fps: Option<f64>,
    pub container: Option<String>,
    pub video_codec: Option<String>,
    pub audio_codec: Option<String>,
    pub checksum_sha256: Option<String>,
    pub visibility: String,
    pub status: String,
    pub storage_backend: String,
    pub storage_key: Option<String>,
    pub poster_key: Option<String>,
    pub thumbnail_key: Option<String>,
    pub public_share_id: Option<String>,
    pub view_count: i64,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub deleted_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone)]
pub struct NewClip {
    pub id: String,
    pub owner_user_id: String,
    pub client_clip_id: Option<String>,
    pub title: String,
    pub description: Option<String>,
    pub game_name: Option<String>,
    pub game_id: Option<String>,
    pub game_executable: Option<String>,
    pub source_type: Option<String>,
    pub recorded_at: Option<DateTime<Utc>>,
    pub uploaded_at: Option<DateTime<Utc>>,
    pub duration_ms: Option<i64>,
    pub file_size_bytes: Option<i64>,
    pub width: Option<i64>,
    pub height: Option<i64>,
    pub fps: Option<f64>,
    pub container: Option<String>,
    pub video_codec: Option<String>,
    pub audio_codec: Option<String>,
    pub checksum_sha256: Option<String>,
    pub visibility: String,
    pub status: String,
    pub storage_backend: String,
    pub storage_key: Option<String>,
    pub poster_key: Option<String>,
    pub thumbnail_key: Option<String>,
    pub public_share_id: Option<String>,
    pub view_count: i64,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub deleted_at: Option<DateTime<Utc>>,
}

impl NewClip {
    pub fn new(
        owner_user_id: impl Into<String>,
        title: impl Into<String>,
        storage_backend: impl Into<String>,
    ) -> Self {
        let now = now_utc();
        Self {
            id: new_ulid(),
            owner_user_id: owner_user_id.into(),
            client_clip_id: None,
            title: title.into(),
            description: None,
            game_name: None,
            game_id: None,
            game_executable: None,
            source_type: None,
            recorded_at: None,
            uploaded_at: None,
            duration_ms: None,
            file_size_bytes: None,
            width: None,
            height: None,
            fps: None,
            container: None,
            video_codec: None,
            audio_codec: None,
            checksum_sha256: None,
            visibility: "private".to_string(),
            status: "created".to_string(),
            storage_backend: storage_backend.into(),
            storage_key: None,
            poster_key: None,
            thumbnail_key: None,
            public_share_id: None,
            view_count: 0,
            created_at: now,
            updated_at: now,
            deleted_at: None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, FromRow)]
pub struct GameCategory {
    pub id: String,
    pub display_name: String,
    pub steamgriddb_game_id: Option<i64>,
    pub artwork_kind: Option<String>,
    pub artwork_id: Option<i64>,
    pub artwork_url: Option<String>,
    pub artwork_thumb_url: Option<String>,
    pub video_artwork_id: Option<i64>,
    pub video_artwork_url: Option<String>,
    pub video_artwork_thumb_url: Option<String>,
    pub icon_artwork_id: Option<i64>,
    pub icon_artwork_url: Option<String>,
    pub icon_artwork_thumb_url: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone)]
pub struct NewGameCategory {
    pub id: String,
    pub display_name: String,
    pub steamgriddb_game_id: Option<i64>,
    pub artwork_kind: Option<String>,
    pub artwork_id: Option<i64>,
    pub artwork_url: Option<String>,
    pub artwork_thumb_url: Option<String>,
    pub video_artwork_id: Option<i64>,
    pub video_artwork_url: Option<String>,
    pub video_artwork_thumb_url: Option<String>,
    pub icon_artwork_id: Option<i64>,
    pub icon_artwork_url: Option<String>,
    pub icon_artwork_thumb_url: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl NewGameCategory {
    pub fn new(display_name: impl Into<String>) -> Self {
        let now = now_utc();
        let display_name = display_name.into().chars().take(200).collect();
        Self {
            id: new_ulid(),
            display_name,
            steamgriddb_game_id: None,
            artwork_kind: None,
            artwork_id: None,
            artwork_url: None,
            artwork_thumb_url: None,
            video_artwork_id: None,
            video_artwork_url: None,
            video_artwork_thumb_url: None,
            icon_artwork_id: None,
            icon_artwork_url: None,
            icon_artwork_thumb_url: None,
            created_at: now,
            updated_at: now,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, FromRow)]
pub struct GameCategoryName {
    pub id: String,
    pub category_id: String,
    pub reported_name: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone)]
pub struct NewGameCategoryName {
    pub id: String,
    pub category_id: String,
    pub reported_name: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl NewGameCategoryName {
    pub fn new(category_id: impl Into<String>, reported_name: impl Into<String>) -> Self {
        let now = now_utc();
        Self {
            id: new_ulid(),
            category_id: category_id.into(),
            reported_name: reported_name.into(),
            created_at: now,
            updated_at: now,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, FromRow)]
pub struct ClipComment {
    pub id: String,
    pub clip_id: String,
    pub parent_comment_id: Option<String>,
    pub user_id: String,
    pub body: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub deleted_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone)]
pub struct NewClipComment {
    pub id: String,
    pub clip_id: String,
    pub parent_comment_id: Option<String>,
    pub user_id: String,
    pub body: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub deleted_at: Option<DateTime<Utc>>,
}

impl NewClipComment {
    pub fn new(
        clip_id: impl Into<String>,
        user_id: impl Into<String>,
        body: impl Into<String>,
    ) -> Self {
        let now = now_utc();
        Self {
            id: new_ulid(),
            clip_id: clip_id.into(),
            parent_comment_id: None,
            user_id: user_id.into(),
            body: body.into(),
            created_at: now,
            updated_at: now,
            deleted_at: None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, FromRow)]
pub struct ClipMarker {
    pub id: String,
    pub clip_id: String,
    pub kind: String,
    pub label: Option<String>,
    pub timestamp_ms: i64,
    pub metadata_json: Option<Json<Value>>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone)]
pub struct NewClipMarker {
    pub id: String,
    pub clip_id: String,
    pub kind: String,
    pub label: Option<String>,
    pub timestamp_ms: i64,
    pub metadata_json: Option<Json<Value>>,
    pub created_at: DateTime<Utc>,
}

impl NewClipMarker {
    pub fn new(clip_id: impl Into<String>, kind: impl Into<String>, timestamp_ms: i64) -> Self {
        Self {
            id: new_ulid(),
            clip_id: clip_id.into(),
            kind: kind.into(),
            label: None,
            timestamp_ms,
            metadata_json: None,
            created_at: now_utc(),
        }
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, FromRow)]
pub struct UploadSession {
    pub id: String,
    pub clip_id: String,
    pub user_id: String,
    pub status: String,
    pub expected_size_bytes: i64,
    pub received_size_bytes: i64,
    pub part_size_bytes: Option<i64>,
    pub storage_key: String,
    pub storage_upload_id: Option<String>,
    pub checksum_sha256: Option<String>,
    pub failure_reason: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub completed_at: Option<DateTime<Utc>>,
    pub failed_at: Option<DateTime<Utc>>,
    pub expires_at: DateTime<Utc>,
}

#[derive(Debug, Clone)]
pub struct NewUploadSession {
    pub id: String,
    pub clip_id: String,
    pub user_id: String,
    pub status: String,
    pub expected_size_bytes: i64,
    pub received_size_bytes: i64,
    pub part_size_bytes: Option<i64>,
    pub storage_key: String,
    pub storage_upload_id: Option<String>,
    pub checksum_sha256: Option<String>,
    pub failure_reason: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub completed_at: Option<DateTime<Utc>>,
    pub failed_at: Option<DateTime<Utc>>,
    pub expires_at: DateTime<Utc>,
}

impl NewUploadSession {
    pub fn new(
        clip_id: impl Into<String>,
        user_id: impl Into<String>,
        expected_size_bytes: i64,
        storage_key: impl Into<String>,
        expires_at: DateTime<Utc>,
    ) -> Self {
        let now = now_utc();
        Self {
            id: new_ulid(),
            clip_id: clip_id.into(),
            user_id: user_id.into(),
            status: "created".to_string(),
            expected_size_bytes,
            received_size_bytes: 0,
            part_size_bytes: None,
            storage_key: storage_key.into(),
            storage_upload_id: None,
            checksum_sha256: None,
            failure_reason: None,
            created_at: now,
            updated_at: now,
            completed_at: None,
            failed_at: None,
            expires_at,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, FromRow)]
pub struct UploadPart {
    pub upload_session_id: String,
    pub part_number: i64,
    pub size_bytes: i64,
    pub checksum_sha256: Option<String>,
    pub etag: Option<String>,
    pub received_at: DateTime<Utc>,
}

#[derive(Debug, Clone)]
pub struct NewUploadPart {
    pub upload_session_id: String,
    pub part_number: i64,
    pub size_bytes: i64,
    pub checksum_sha256: Option<String>,
    pub etag: Option<String>,
    pub received_at: DateTime<Utc>,
}

impl NewUploadPart {
    pub fn new(upload_session_id: impl Into<String>, part_number: i64, size_bytes: i64) -> Self {
        Self {
            upload_session_id: upload_session_id.into(),
            part_number,
            size_bytes,
            checksum_sha256: None,
            etag: None,
            received_at: now_utc(),
        }
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, FromRow)]
pub struct Job {
    pub id: String,
    pub kind: String,
    pub status: String,
    pub target_type: Option<String>,
    pub target_id: Option<String>,
    pub attempts: i64,
    pub max_attempts: i64,
    pub next_run_at: DateTime<Utc>,
    pub locked_by: Option<String>,
    pub locked_at: Option<DateTime<Utc>>,
    pub last_error: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone)]
pub struct NewJob {
    pub id: String,
    pub kind: String,
    pub status: String,
    pub target_type: Option<String>,
    pub target_id: Option<String>,
    pub attempts: i64,
    pub max_attempts: i64,
    pub next_run_at: DateTime<Utc>,
    pub locked_by: Option<String>,
    pub locked_at: Option<DateTime<Utc>>,
    pub last_error: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl NewJob {
    pub fn new(kind: impl Into<String>, next_run_at: DateTime<Utc>) -> Self {
        let now = now_utc();
        Self {
            id: new_ulid(),
            kind: kind.into(),
            status: "pending".to_string(),
            target_type: None,
            target_id: None,
            attempts: 0,
            max_attempts: 5,
            next_run_at,
            locked_by: None,
            locked_at: None,
            last_error: None,
            created_at: now,
            updated_at: now,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, FromRow)]
pub struct AuditLogEntry {
    pub id: String,
    pub actor_user_id: Option<String>,
    pub action: String,
    pub target_type: Option<String>,
    pub target_id: Option<String>,
    pub ip_address: Option<String>,
    pub metadata_json: Option<Json<Value>>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone)]
pub struct NewAuditLogEntry {
    pub id: String,
    pub actor_user_id: Option<String>,
    pub action: String,
    pub target_type: Option<String>,
    pub target_id: Option<String>,
    pub ip_address: Option<String>,
    pub metadata_json: Option<Json<Value>>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, FromRow)]
pub struct ResetPasswordToken {
    pub id: String,
    pub user_id: String,
    pub token_hash: String,
    pub created_at: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
    pub used_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone)]
pub struct NewResetPasswordToken {
    pub id: String,
    pub user_id: String,
    pub token_hash: String,
    pub created_at: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
    pub used_at: Option<DateTime<Utc>>,
}

impl NewResetPasswordToken {
    pub fn new(
        user_id: impl Into<String>,
        token_hash: impl Into<String>,
        expires_at: DateTime<Utc>,
    ) -> Self {
        Self {
            id: new_ulid(),
            user_id: user_id.into(),
            token_hash: token_hash.into(),
            created_at: now_utc(),
            expires_at,
            used_at: None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, FromRow)]
pub struct InvitationToken {
    pub id: String,
    pub token_hash: String,
    pub claim_token_hash: Option<String>,
    pub role: String,
    pub created_by_user_id: Option<String>,
    pub created_at: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
    pub claimed_at: Option<DateTime<Utc>>,
    pub used_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone)]
pub struct NewInvitationToken {
    pub id: String,
    pub token_hash: String,
    pub claim_token_hash: Option<String>,
    pub role: String,
    pub created_by_user_id: Option<String>,
    pub created_at: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
    pub claimed_at: Option<DateTime<Utc>>,
    pub used_at: Option<DateTime<Utc>>,
}

impl NewInvitationToken {
    pub fn new(
        token_hash: impl Into<String>,
        role: impl Into<String>,
        expires_at: DateTime<Utc>,
    ) -> Self {
        Self {
            id: new_ulid(),
            token_hash: token_hash.into(),
            claim_token_hash: None,
            role: role.into(),
            created_by_user_id: None,
            created_at: now_utc(),
            expires_at,
            claimed_at: None,
            used_at: None,
        }
    }
}

impl NewAuditLogEntry {
    pub fn new(action: impl Into<String>) -> Self {
        Self {
            id: new_ulid(),
            actor_user_id: None,
            action: action.into(),
            target_type: None,
            target_id: None,
            ip_address: None,
            metadata_json: None,
            created_at: now_utc(),
        }
    }
}
