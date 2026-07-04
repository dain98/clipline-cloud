use axum::{
    extract::{Extension, Query, State},
    http::HeaderMap,
    routing::get,
    Json, Router,
};
use chrono::{DateTime, Utc};
use clipline_cloud_db::{
    AppSettings, AuditLogEntry, DatabaseKind, Job, UpdateAppSettings, UploadSession,
};
use serde::{Deserialize, Serialize};

use crate::{
    auth::{self, ApiError},
    config::StorageConfig,
    mail, AppState, ClientIp,
};

const DEFAULT_LIMIT: i64 = 50;
const MAX_LIMIT: i64 = 200;
const MAX_SMTP_FIELD_LEN: usize = 320;

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/api/v1/about", get(about))
        .route(
            "/api/v1/admin/settings",
            get(settings).patch(update_settings),
        )
        .route("/api/v1/admin/overview", get(overview))
        .route("/api/v1/admin/uploads/failed", get(failed_uploads))
        .route("/api/v1/admin/jobs/dead", get(dead_jobs))
        .route("/api/v1/admin/jobs/recent-errors", get(recent_job_errors))
        .route("/api/v1/admin/audit/recent", get(recent_audit_log))
}

#[derive(Debug, Serialize)]
struct PublicAboutResponse {
    about_text: String,
}

#[derive(Debug, Serialize)]
struct AdminSettingsResponse {
    owner_user_id: Option<String>,
    allow_vod_uploads: bool,
    vod_threshold_minutes: i64,
    about_text: String,
    smtp_enabled: bool,
    smtp_host: Option<String>,
    smtp_port: i64,
    smtp_tls_mode: String,
    smtp_username: Option<String>,
    smtp_password_configured: bool,
    smtp_from_email: Option<String>,
    smtp_from_name: Option<String>,
    user_storage_quota_bytes: Option<u64>,
    updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
struct UpdateAdminSettingsRequest {
    allow_vod_uploads: Option<bool>,
    vod_threshold_minutes: Option<i64>,
    about_text: Option<String>,
    smtp_enabled: Option<bool>,
    smtp_host: Option<Option<String>>,
    smtp_port: Option<i64>,
    smtp_tls_mode: Option<String>,
    smtp_username: Option<Option<String>>,
    smtp_password: Option<String>,
    smtp_password_clear: Option<bool>,
    smtp_from_email: Option<Option<String>>,
    smtp_from_name: Option<Option<String>>,
    user_storage_quota_bytes: Option<Option<u64>>,
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
    direct_s3_uploads: bool,
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

async fn about(State(state): State<AppState>) -> Result<Json<PublicAboutResponse>, ApiError> {
    let settings = state.repositories.settings.get().await?;
    Ok(Json(PublicAboutResponse {
        about_text: settings.about_text,
    }))
}

async fn settings(
    State(state): State<AppState>,
    headers: HeaderMap,
) -> Result<Json<AdminSettingsResponse>, ApiError> {
    let _auth = auth::require_admin(&state, &headers).await?;
    let settings = state.repositories.settings.get().await?;
    Ok(Json(AdminSettingsResponse::from_settings(
        settings,
        &state.config,
    )))
}

async fn update_settings(
    State(state): State<AppState>,
    Extension(client_ip): Extension<ClientIp>,
    headers: HeaderMap,
    Json(request): Json<UpdateAdminSettingsRequest>,
) -> Result<Json<AdminSettingsResponse>, ApiError> {
    let auth = auth::require_admin(&state, &headers).await?;
    auth::require_csrf_for_cookie(&state, &headers, &auth)?;
    let current_settings = state.repositories.settings.get().await?;

    let mut update = UpdateAppSettings {
        allow_vod_uploads: request.allow_vod_uploads,
        vod_threshold_minutes: None,
        about_text: None,
        ..UpdateAppSettings::default()
    };

    if let Some(threshold) = request.vod_threshold_minutes {
        if !(1..=1440).contains(&threshold) {
            return Err(ApiError::bad_request(
                "VOD threshold must be between 1 and 1440 minutes",
            ));
        }
        update.vod_threshold_minutes = Some(threshold);
    }

    if let Some(quota) = request.user_storage_quota_bytes {
        let stored = match quota {
            None => Some(0_i64),
            Some(bytes) => {
                let bytes = i64::try_from(bytes)
                    .map_err(|_| ApiError::bad_request("storage quota is too large"))?;
                if bytes < 0 {
                    return Err(ApiError::bad_request(
                        "storage quota must be non-negative",
                    ));
                }
                Some(bytes)
            }
        };
        update.user_storage_quota_bytes = Some(stored);
    }

    if let Some(about_text) = request.about_text {
        if !auth::user_is_owner(&state, &auth.user).await? {
            return Err(ApiError::forbidden("owner role required to edit About"));
        }
        let about_text = about_text.trim();
        if about_text.is_empty() {
            return Err(ApiError::bad_request("About text is required"));
        }
        if about_text.len() > 5000 {
            return Err(ApiError::bad_request(
                "About text must be at most 5000 bytes",
            ));
        }
        update.about_text = Some(about_text.to_string());
    }

    let smtp_updated = request.smtp_enabled.is_some()
        || request.smtp_host.is_some()
        || request.smtp_port.is_some()
        || request.smtp_tls_mode.is_some()
        || request.smtp_username.is_some()
        || request.smtp_password.is_some()
        || request.smtp_password_clear.unwrap_or(false)
        || request.smtp_from_email.is_some()
        || request.smtp_from_name.is_some();
    let mut effective_settings = current_settings.clone();
    if smtp_updated {
        if !auth::user_is_owner(&state, &auth.user).await? {
            return Err(ApiError::forbidden("owner role required to edit SMTP"));
        }
        if let Some(enabled) = request.smtp_enabled {
            update.smtp_enabled = Some(enabled);
            effective_settings.smtp_enabled = enabled;
        }
        if let Some(host) = request.smtp_host {
            let host = normalized_optional_admin_string(host, "SMTP host")?;
            effective_settings.smtp_host = host.clone();
            update.smtp_host = Some(host);
        }
        if let Some(port) = request.smtp_port {
            if !(1..=65535).contains(&port) {
                return Err(ApiError::bad_request(
                    "SMTP port must be between 1 and 65535",
                ));
            }
            update.smtp_port = Some(port);
            effective_settings.smtp_port = port;
        }
        if let Some(tls_mode) = request.smtp_tls_mode {
            if !matches!(tls_mode.as_str(), "starttls" | "tls" | "none") {
                return Err(ApiError::bad_request(
                    "SMTP TLS mode must be starttls, tls, or none",
                ));
            }
            update.smtp_tls_mode = Some(tls_mode.clone());
            effective_settings.smtp_tls_mode = tls_mode;
        }
        if let Some(username) = request.smtp_username {
            let username = normalized_optional_admin_string(username, "SMTP username")?;
            effective_settings.smtp_username = username.clone();
            update.smtp_username = Some(username);
        }
        if request.smtp_password_clear.unwrap_or(false) {
            update.smtp_password = Some(None);
            effective_settings.smtp_password = None;
        } else if let Some(password) = request.smtp_password {
            let password = password.trim();
            if !password.is_empty() {
                if password.len() > MAX_SMTP_FIELD_LEN {
                    return Err(ApiError::bad_request(
                        "SMTP password must be at most 320 bytes",
                    ));
                }
                update.smtp_password = Some(Some(password.to_string()));
                effective_settings.smtp_password = Some(password.to_string());
            }
        }
        if let Some(from_email) = request.smtp_from_email {
            let from_email = normalized_optional_admin_string(from_email, "SMTP from email")?;
            if let Some(from_email) = from_email.as_deref() {
                validate_emailish(from_email, "SMTP from email")?;
            }
            effective_settings.smtp_from_email = from_email.clone();
            update.smtp_from_email = Some(from_email);
        }
        if let Some(from_name) = request.smtp_from_name {
            let from_name = normalized_optional_admin_string(from_name, "SMTP from name")?;
            effective_settings.smtp_from_name = from_name.clone();
            update.smtp_from_name = Some(from_name);
        }
        if effective_settings.smtp_enabled {
            mail::SmtpInviteConfig::from_settings(&effective_settings)
                .map_err(|error| ApiError::bad_request(error.to_string()))?;
        }
    }

    let updated = state.repositories.settings.update(&update).await?;
    auth::audit_with_ip(
        &state.repositories,
        Some(client_ip.as_str()),
        Some(&auth.user),
        "settings.updated",
        Some("app_settings"),
        Some("1"),
        Some(serde_json::json!({
            "allow_vod_uploads": update.allow_vod_uploads,
            "vod_threshold_minutes": update.vod_threshold_minutes,
            "about_text_updated": update.about_text.is_some(),
            "smtp_updated": smtp_updated,
            "smtp_enabled": update.smtp_enabled,
            "user_storage_quota_bytes": update.user_storage_quota_bytes,
        })),
    )
    .await?;

    Ok(Json(AdminSettingsResponse::from_settings(updated, &state.config)))
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
    let settings = state.repositories.settings.get().await?;
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
        direct_s3_uploads: state.config.direct_s3_uploads,
        max_active_upload_sessions_per_user: state.config.max_active_upload_sessions_per_user,
        user_storage_quota_bytes: effective_user_storage_quota_bytes(&settings, &state.config),
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

fn normalized_optional_admin_string(
    value: Option<String>,
    label: &str,
) -> Result<Option<String>, ApiError> {
    let Some(value) = value else {
        return Ok(None);
    };
    let value = value.trim();
    if value.is_empty() {
        return Ok(None);
    }
    if value.len() > MAX_SMTP_FIELD_LEN {
        return Err(ApiError::bad_request(format!(
            "{label} must be at most {MAX_SMTP_FIELD_LEN} bytes"
        )));
    }
    Ok(Some(value.to_string()))
}

fn validate_emailish(value: &str, label: &str) -> Result<(), ApiError> {
    if value.contains('@') && !value.contains(char::is_whitespace) {
        Ok(())
    } else {
        Err(ApiError::bad_request(format!(
            "{label} must be an email address"
        )))
    }
}

pub(crate) fn effective_user_storage_quota_bytes(
    settings: &AppSettings,
    config: &crate::config::Config,
) -> Option<u64> {
    match settings.user_storage_quota_bytes {
        None => config.user_storage_quota_bytes,
        Some(0) => None,
        Some(value) => u64::try_from(value).ok(),
    }
}

impl AdminSettingsResponse {
    fn from_settings(settings: AppSettings, config: &crate::config::Config) -> Self {
        let smtp_password_configured = settings
            .smtp_password
            .as_deref()
            .is_some_and(|password| !password.trim().is_empty());
        let user_storage_quota_bytes =
            effective_user_storage_quota_bytes(&settings, config);
        Self {
            owner_user_id: settings.owner_user_id,
            allow_vod_uploads: settings.allow_vod_uploads,
            vod_threshold_minutes: settings.vod_threshold_minutes,
            about_text: settings.about_text,
            smtp_enabled: settings.smtp_enabled,
            smtp_host: settings.smtp_host,
            smtp_port: settings.smtp_port,
            smtp_tls_mode: settings.smtp_tls_mode,
            smtp_username: settings.smtp_username,
            smtp_password_configured,
            smtp_from_email: settings.smtp_from_email,
            smtp_from_name: settings.smtp_from_name,
            user_storage_quota_bytes,
            updated_at: settings.updated_at,
        }
    }
}

impl From<AppSettings> for AdminSettingsResponse {
    fn from(value: AppSettings) -> Self {
        Self {
            owner_user_id: value.owner_user_id,
            allow_vod_uploads: value.allow_vod_uploads,
            vod_threshold_minutes: value.vod_threshold_minutes,
            about_text: value.about_text,
            smtp_enabled: value.smtp_enabled,
            smtp_host: value.smtp_host,
            smtp_port: value.smtp_port,
            smtp_tls_mode: value.smtp_tls_mode,
            smtp_username: value.smtp_username,
            smtp_password_configured: value
                .smtp_password
                .as_deref()
                .is_some_and(|password| !password.trim().is_empty()),
            smtp_from_email: value.smtp_from_email,
            smtp_from_name: value.smtp_from_name,
            user_storage_quota_bytes: value
                .user_storage_quota_bytes
                .and_then(|quota| u64::try_from(quota).ok())
                .filter(|quota| *quota > 0),
            updated_at: value.updated_at,
        }
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

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::Utc;

    fn sample_settings(user_storage_quota_bytes: Option<i64>) -> AppSettings {
        AppSettings {
            id: 1,
            owner_user_id: None,
            allow_vod_uploads: true,
            vod_threshold_minutes: 30,
            about_text: "About".to_string(),
            smtp_enabled: false,
            smtp_host: None,
            smtp_port: 587,
            smtp_tls_mode: "starttls".to_string(),
            smtp_username: None,
            smtp_password: None,
            smtp_from_email: None,
            smtp_from_name: None,
            user_storage_quota_bytes,
            created_at: Utc::now(),
            updated_at: Utc::now(),
        }
    }

    #[test]
    fn effective_user_storage_quota_prefers_settings_over_env() {
        let settings = sample_settings(Some(2048));
        let config = crate::config::Config::for_tests(
            "sqlite:///:memory:".to_string(),
            std::path::PathBuf::from("/tmp"),
        );
        assert_eq!(
            effective_user_storage_quota_bytes(&settings, &config),
            Some(2048)
        );
    }

    #[test]
    fn effective_user_storage_quota_treats_zero_as_disabled() {
        let settings = sample_settings(Some(0));
        let config = crate::config::Config::for_tests(
            "sqlite:///:memory:".to_string(),
            std::path::PathBuf::from("/tmp"),
        );
        assert_eq!(
            effective_user_storage_quota_bytes(&settings, &config),
            None
        );
    }
}
