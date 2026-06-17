use axum::{
    extract::{Query, State},
    http::HeaderMap,
    routing::get,
    Json, Router,
};
use chrono::{DateTime, Utc};
use clipline_cloud_db::{AuditLogEntry, DatabaseKind, Job, UploadSession};
use serde::{Deserialize, Serialize};

use crate::{
    auth::{self, ApiError},
    config::StorageConfig,
    AppState,
};

const DEFAULT_LIMIT: i64 = 50;
const MAX_LIMIT: i64 = 200;

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/api/v1/admin/overview", get(overview))
        .route("/api/v1/admin/uploads/failed", get(failed_uploads))
        .route("/api/v1/admin/jobs/dead", get(dead_jobs))
        .route("/api/v1/admin/jobs/recent-errors", get(recent_job_errors))
        .route("/api/v1/admin/audit/recent", get(recent_audit_log))
}

#[derive(Debug, Deserialize)]
struct ListQuery {
    limit: Option<i64>,
}

#[derive(Debug, Serialize)]
struct JobResponse {
    id: String,
    kind: String,
    status: String,
    target_type: Option<String>,
    target_id: Option<String>,
    attempts: i64,
    max_attempts: i64,
    next_run_at: DateTime<Utc>,
    locked_by: Option<String>,
    locked_at: Option<DateTime<Utc>>,
    last_error: Option<String>,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize)]
struct AdminOverviewResponse {
    server_version: &'static str,
    api_version: &'static str,
    public_url: String,
    storage_backend: &'static str,
    storage_summary: String,
    database_backend: &'static str,
    max_upload_size_bytes: u64,
    upload_part_size_bytes: u64,
    single_put_max_bytes: u64,
    upload_session_ttl_seconds: u64,
    max_active_upload_sessions_per_user: i64,
    user_storage_quota_bytes: Option<u64>,
    global_storage_warning_threshold_bytes: Option<u64>,
    global_storage_warning: bool,
    public_media_mode: &'static str,
    public_read_url_ttl_seconds: u64,
    trusted_proxy_hops: Vec<String>,
    total_users: i64,
    total_clips: i64,
    total_storage_bytes: u64,
}

#[derive(Debug, Serialize)]
struct UploadSessionResponse {
    id: String,
    clip_id: String,
    user_id: String,
    status: String,
    expected_size_bytes: i64,
    received_size_bytes: i64,
    part_size_bytes: Option<i64>,
    progress_basis_points: u16,
    checksum_sha256: Option<String>,
    failure_reason: Option<String>,
    recovery_action: Option<&'static str>,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
    completed_at: Option<DateTime<Utc>>,
    failed_at: Option<DateTime<Utc>>,
    expires_at: DateTime<Utc>,
}

#[derive(Debug, Serialize)]
struct AuditLogEntryResponse {
    id: String,
    actor_user_id: Option<String>,
    action: String,
    target_type: Option<String>,
    target_id: Option<String>,
    ip_address: Option<String>,
    metadata: Option<serde_json::Value>,
    created_at: DateTime<Utc>,
}

async fn overview(
    State(state): State<AppState>,
    headers: HeaderMap,
) -> Result<Json<AdminOverviewResponse>, ApiError> {
    let _auth = auth::require_admin(&state, &headers).await?;
    let total_users = state.repositories.users.count_all().await?;
    let total_clips = state.repositories.clips.count_non_deleted().await?;
    let total_storage_bytes = state.repositories.clips.total_storage_bytes().await?;
    let total_storage_bytes = u64::try_from(total_storage_bytes)
        .map_err(|_| ApiError::internal("stored total storage usage is negative"))?;
    let global_storage_warning = state
        .config
        .global_storage_warning_threshold_bytes
        .is_some_and(|threshold| total_storage_bytes >= threshold);

    Ok(Json(AdminOverviewResponse {
        server_version: env!("CARGO_PKG_VERSION"),
        api_version: "v1",
        public_url: state.config.public_url.to_string(),
        storage_backend: state.config.storage_backend_name(),
        storage_summary: storage_summary(&state.config.storage),
        database_backend: database_kind_name(state.database.kind()),
        max_upload_size_bytes: state.config.max_upload_size_bytes,
        upload_part_size_bytes: state.config.upload_part_size_bytes,
        single_put_max_bytes: state.config.single_put_max_bytes,
        upload_session_ttl_seconds: state.config.upload_session_ttl.as_secs(),
        max_active_upload_sessions_per_user: state.config.max_active_upload_sessions_per_user,
        user_storage_quota_bytes: state.config.user_storage_quota_bytes,
        global_storage_warning_threshold_bytes: state.config.global_storage_warning_threshold_bytes,
        global_storage_warning,
        public_media_mode: state.config.public_media_mode.as_str(),
        public_read_url_ttl_seconds: state.config.public_read_url_ttl.as_secs(),
        trusted_proxy_hops: state
            .config
            .trusted_proxy_hops
            .iter()
            .map(ToString::to_string)
            .collect(),
        total_users,
        total_clips,
        total_storage_bytes,
    }))
}

async fn failed_uploads(
    State(state): State<AppState>,
    headers: HeaderMap,
    Query(query): Query<ListQuery>,
) -> Result<Json<Vec<UploadSessionResponse>>, ApiError> {
    let _auth = auth::require_admin(&state, &headers).await?;
    let uploads = state
        .repositories
        .upload_sessions
        .list_failed(normalized_limit(query.limit))
        .await?
        .into_iter()
        .map(UploadSessionResponse::from)
        .collect();
    Ok(Json(uploads))
}

async fn dead_jobs(
    State(state): State<AppState>,
    headers: HeaderMap,
    Query(query): Query<ListQuery>,
) -> Result<Json<Vec<JobResponse>>, ApiError> {
    let _auth = auth::require_admin(&state, &headers).await?;
    let jobs = state
        .repositories
        .jobs
        .list_dead(normalized_limit(query.limit))
        .await?
        .into_iter()
        .map(JobResponse::from)
        .collect();
    Ok(Json(jobs))
}

async fn recent_job_errors(
    State(state): State<AppState>,
    headers: HeaderMap,
    Query(query): Query<ListQuery>,
) -> Result<Json<Vec<JobResponse>>, ApiError> {
    let _auth = auth::require_admin(&state, &headers).await?;
    let jobs = state
        .repositories
        .jobs
        .list_recent_errors(normalized_limit(query.limit))
        .await?
        .into_iter()
        .map(JobResponse::from)
        .collect();
    Ok(Json(jobs))
}

async fn recent_audit_log(
    State(state): State<AppState>,
    headers: HeaderMap,
    Query(query): Query<ListQuery>,
) -> Result<Json<Vec<AuditLogEntryResponse>>, ApiError> {
    let _auth = auth::require_admin(&state, &headers).await?;
    let entries = state
        .repositories
        .audit_log
        .list_recent(normalized_limit(query.limit))
        .await?
        .into_iter()
        .map(AuditLogEntryResponse::from)
        .collect();
    Ok(Json(entries))
}

fn normalized_limit(limit: Option<i64>) -> i64 {
    limit.unwrap_or(DEFAULT_LIMIT).clamp(1, MAX_LIMIT)
}

fn storage_summary(storage: &StorageConfig) -> String {
    match storage {
        StorageConfig::Local { data_dir } => data_dir.display().to_string(),
        StorageConfig::S3 {
            endpoint,
            bucket,
            region,
            prefix,
            ..
        } => format!(
            "{} bucket={} region={} prefix={}",
            endpoint,
            bucket,
            region,
            prefix.as_deref().unwrap_or("")
        ),
    }
}

fn database_kind_name(kind: DatabaseKind) -> &'static str {
    match kind {
        DatabaseKind::Sqlite => "sqlite",
        DatabaseKind::Postgres => "postgres",
    }
}

impl From<Job> for JobResponse {
    fn from(value: Job) -> Self {
        Self {
            id: value.id,
            kind: value.kind,
            status: value.status,
            target_type: value.target_type,
            target_id: value.target_id,
            attempts: value.attempts,
            max_attempts: value.max_attempts,
            next_run_at: value.next_run_at,
            locked_by: value.locked_by,
            locked_at: value.locked_at,
            last_error: value.last_error,
            created_at: value.created_at,
            updated_at: value.updated_at,
        }
    }
}

impl From<UploadSession> for UploadSessionResponse {
    fn from(value: UploadSession) -> Self {
        let progress_basis_points = admin_progress_basis_points(
            value.status.as_str(),
            value.received_size_bytes,
            value.expected_size_bytes,
        );
        let recovery_action = recovery_action(value.status.as_str());
        Self {
            id: value.id,
            clip_id: value.clip_id,
            user_id: value.user_id,
            status: value.status,
            expected_size_bytes: value.expected_size_bytes,
            received_size_bytes: value.received_size_bytes,
            part_size_bytes: value.part_size_bytes,
            progress_basis_points,
            checksum_sha256: value.checksum_sha256,
            failure_reason: value.failure_reason,
            recovery_action,
            created_at: value.created_at,
            updated_at: value.updated_at,
            completed_at: value.completed_at,
            failed_at: value.failed_at,
            expires_at: value.expires_at,
        }
    }
}

fn admin_progress_basis_points(
    status: &str,
    received_size_bytes: i64,
    expected_size_bytes: i64,
) -> u16 {
    if status == "completed" {
        return 10_000;
    }
    if expected_size_bytes <= 0 || received_size_bytes <= 0 {
        return 0;
    }
    let value = (received_size_bytes as u128)
        .saturating_mul(10_000)
        .checked_div(expected_size_bytes as u128)
        .unwrap_or_default()
        .min(10_000);
    value as u16
}

fn recovery_action(status: &str) -> Option<&'static str> {
    match status {
        "failed" => Some("delete_and_retry"),
        "created" | "uploading" => Some("retry"),
        _ => None,
    }
}

impl From<AuditLogEntry> for AuditLogEntryResponse {
    fn from(value: AuditLogEntry) -> Self {
        Self {
            id: value.id,
            actor_user_id: value.actor_user_id,
            action: value.action,
            target_type: value.target_type,
            target_id: value.target_id,
            ip_address: value.ip_address,
            metadata: value.metadata_json.map(|metadata| metadata.0),
            created_at: value.created_at,
        }
    }
}
