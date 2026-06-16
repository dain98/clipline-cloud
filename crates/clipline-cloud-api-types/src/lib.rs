use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct HealthResponse {
    pub status: &'static str,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ReadinessResponse {
    pub status: &'static str,
    pub database: &'static str,
    pub storage: &'static str,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct DiscoveryResponse {
    pub name: String,
    pub api_version: String,
    pub server_version: String,
    pub min_client_version: String,
    pub public_url: String,
    pub features: DiscoveryFeatures,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct DiscoveryFeatures {
    pub single_put_upload: bool,
    pub chunked_upload: bool,
    pub public_sharing: bool,
    pub clip_markers: bool,
    pub max_upload_size_bytes: u64,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct UserResponse {
    pub id: String,
    pub username: String,
    pub display_name: Option<String>,
    pub role: String,
    pub is_disabled: bool,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
    pub last_login_at: Option<chrono::DateTime<chrono::Utc>>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct MeResponse {
    pub user: UserResponse,
    pub auth_kind: String,
    pub csrf_token: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct CreateDeviceTokenRequest {
    pub username: String,
    pub password: String,
    pub name: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct CreateDeviceTokenResponse {
    pub token: String,
    pub device_token: DeviceTokenResponse,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct DeviceTokenResponse {
    pub id: String,
    pub name: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub last_used_at: Option<chrono::DateTime<chrono::Utc>>,
    pub expires_at: Option<chrono::DateTime<chrono::Utc>>,
    pub revoked_at: Option<chrono::DateTime<chrono::Utc>>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct CreateUploadRequest {
    pub client_clip_id: Option<String>,
    pub title: String,
    pub game_name: Option<String>,
    pub game_id: Option<String>,
    pub game_executable: Option<String>,
    pub source_type: Option<String>,
    pub recorded_at: Option<chrono::DateTime<chrono::Utc>>,
    pub duration_ms: Option<i64>,
    pub file_size_bytes: u64,
    pub checksum_sha256: String,
    pub container: String,
    pub video_codec: Option<String>,
    pub audio_codec: Option<String>,
    pub width: Option<i64>,
    pub height: Option<i64>,
    pub fps: Option<f64>,
    pub visibility: Option<String>,
    pub markers: Option<Vec<CreateMarkerRequest>>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct CreateMarkerRequest {
    pub kind: String,
    pub label: Option<String>,
    pub timestamp_ms: i64,
    pub metadata: Option<serde_json::Value>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct CreateUploadResponse {
    pub clip_id: String,
    pub upload_id: String,
    pub mode: String,
    pub part_size_bytes: u64,
    pub single_put_url: Option<String>,
    pub parts_url_template: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct UploadProgressResponse {
    pub upload_id: String,
    pub clip_id: String,
    pub mode: String,
    pub status: String,
    pub file_size_bytes: u64,
    pub part_size_bytes: u64,
    pub received_size_bytes: u64,
    pub received_parts: Vec<u16>,
    pub missing_parts: Vec<u16>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct PartUploadResponse {
    pub upload_id: String,
    pub part_number: u16,
    pub size_bytes: u64,
    pub checksum_sha256: String,
    pub etag: Option<String>,
    pub idempotent: bool,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ClipListResponse {
    pub page: i64,
    pub page_size: i64,
    pub clips: Vec<ClipSummaryResponse>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ClipSummaryResponse {
    pub id: String,
    pub title: String,
    pub game_name: Option<String>,
    pub game_id: Option<String>,
    pub recorded_at: Option<chrono::DateTime<chrono::Utc>>,
    pub uploaded_at: Option<chrono::DateTime<chrono::Utc>>,
    pub duration_ms: Option<i64>,
    pub file_size_bytes: Option<i64>,
    pub width: Option<i64>,
    pub height: Option<i64>,
    pub fps: Option<f64>,
    pub visibility: String,
    pub status: String,
    pub public_url: Option<String>,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ClipDetailResponse {
    pub id: String,
    pub client_clip_id: Option<String>,
    pub title: String,
    pub game_name: Option<String>,
    pub game_id: Option<String>,
    pub game_executable: Option<String>,
    pub source_type: Option<String>,
    pub recorded_at: Option<chrono::DateTime<chrono::Utc>>,
    pub uploaded_at: Option<chrono::DateTime<chrono::Utc>>,
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
    pub public_share_id: Option<String>,
    pub public_url: Option<String>,
    pub markers: Vec<ClipMarkerResponse>,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ClipMarkerResponse {
    pub id: String,
    pub kind: String,
    pub label: Option<String>,
    pub timestamp_ms: i64,
    pub metadata: Option<serde_json::Value>,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct UpdateVisibilityRequest {
    pub visibility: String,
}
