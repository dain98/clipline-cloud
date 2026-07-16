use axum::{
    body::Body,
    extract::{Extension, Path, Query, State},
    http::{header, HeaderMap, HeaderValue, StatusCode},
    response::Response,
    routing::{get, patch},
    Json, Router,
};
use chrono::{DateTime, Utc};
use clipline_cloud_db::{
    AppSettings, AuditLogEntry, DatabaseKind, GameCategory, GameCategoryName, Job,
    MergeGameCategoryOutcome, NewAuditLogEntry, NewGameCategory, SeparateGameCategoryNameOutcome,
    UpdateAppSettings, UploadSession,
};
use serde::{Deserialize, Serialize};

use crate::{
    auth, config::StorageConfig, error::ApiError, mail, steamgriddb,
    validation::normalized_optional, AppState, ClientIp,
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
        .route(
            "/api/v1/admin/game-categories",
            get(game_categories),
        )
        .route(
            "/api/v1/admin/game-categories/steamgriddb/search",
            get(search_steamgriddb_games),
        )
        .route(
            "/api/v1/admin/game-categories/steamgriddb/games/{game_id}/artwork",
            get(steamgriddb_artwork),
        )
        .route(
            "/api/v1/admin/game-categories/steamgriddb/games/{game_id}/artwork/{kind}/{artwork_id}/preview",
            get(steamgriddb_artwork_preview),
        )
        .route(
            "/api/v1/admin/game-categories/{id}",
            patch(update_game_category),
        )
        .route(
            "/api/v1/admin/game-categories/{id}/merge",
            axum::routing::post(merge_game_category),
        )
        .route(
            "/api/v1/admin/game-categories/{id}/reported-names/{name_id}/separate",
            axum::routing::post(separate_game_category_name),
        )
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
    user_storage_quota_env_fallback_bytes: Option<u64>,
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
struct AdminGameCategoryListResponse {
    steamgriddb_configured: bool,
    categories: Vec<AdminGameCategoryResponse>,
}

#[derive(Debug, Serialize)]
struct AdminGameCategoryResponse {
    id: String,
    display_name: String,
    steamgriddb_game_id: Option<i64>,
    grid_artwork_id: Option<i64>,
    grid_artwork_url: Option<String>,
    video_artwork_id: Option<i64>,
    video_artwork_url: Option<String>,
    icon_artwork_id: Option<i64>,
    icon_artwork_url: Option<String>,
    clip_count: i64,
    reported_names: Vec<AdminGameCategoryNameResponse>,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize)]
struct AdminGameCategoryNameResponse {
    id: String,
    reported_name: String,
    clip_count: i64,
}

#[derive(Debug, Deserialize)]
struct UpsertGameCategoryRequest {
    display_name: String,
    steamgriddb_game_id: Option<i64>,
    grid_artwork_id: Option<i64>,
    video_artwork_id: Option<i64>,
    icon_artwork_id: Option<i64>,
}

#[derive(Debug, Deserialize)]
struct MergeGameCategoryRequest {
    destination_category_id: String,
}

#[derive(Debug, Deserialize)]
struct SteamGridDbSearchQuery {
    q: String,
}

#[derive(Debug, Deserialize)]
struct SteamGridDbArtworkQuery {
    kind: String,
}

#[derive(Debug, Serialize)]
struct SteamGridDbArtworkResponse {
    id: i64,
    kind: String,
    score: i64,
    style: String,
    preview_url: String,
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

async fn game_categories(
    State(state): State<AppState>,
    headers: HeaderMap,
) -> Result<Json<AdminGameCategoryListResponse>, ApiError> {
    let _auth = auth::require_admin(&state, &headers).await?;
    Ok(Json(AdminGameCategoryListResponse {
        steamgriddb_configured: steamgriddb::configured(&state.config),
        categories: load_admin_game_categories(&state).await?,
    }))
}

async fn load_admin_game_categories(
    state: &AppState,
) -> Result<Vec<AdminGameCategoryResponse>, ApiError> {
    let categories = state.repositories.game_categories.list().await?;
    let names = state.repositories.game_categories.list_all_names().await?;
    let clip_counts = state
        .repositories
        .clips
        .list_game_names()
        .await?
        .into_iter()
        .map(|game| (game.game_name.to_lowercase(), game.clip_count))
        .collect::<std::collections::HashMap<_, _>>();
    let mut names_by_category = std::collections::HashMap::<String, Vec<GameCategoryName>>::new();
    for name in names {
        names_by_category
            .entry(name.category_id.clone())
            .or_default()
            .push(name);
    }
    Ok(categories
        .into_iter()
        .map(|category| {
            let names = names_by_category.remove(&category.id).unwrap_or_default();
            AdminGameCategoryResponse::from_category(category, names, &clip_counts)
        })
        .collect())
}

async fn load_admin_game_category(
    state: &AppState,
    category_id: &str,
) -> Result<AdminGameCategoryResponse, ApiError> {
    load_admin_game_categories(state)
        .await?
        .into_iter()
        .find(|category| category.id == category_id)
        .ok_or_else(|| ApiError::not_found("game category not found"))
}

async fn search_steamgriddb_games(
    State(state): State<AppState>,
    headers: HeaderMap,
    Query(query): Query<SteamGridDbSearchQuery>,
) -> Result<Json<Vec<steamgriddb::GameSearchResult>>, ApiError> {
    let _auth = auth::require_admin(&state, &headers).await?;
    Ok(Json(
        steamgriddb::search_games(&state.config, &query.q).await?,
    ))
}

async fn steamgriddb_artwork(
    State(state): State<AppState>,
    headers: HeaderMap,
    Path(game_id): Path<i64>,
    Query(query): Query<SteamGridDbArtworkQuery>,
) -> Result<Json<Vec<SteamGridDbArtworkResponse>>, ApiError> {
    let _auth = auth::require_admin(&state, &headers).await?;
    let kind = query.kind.parse()?;
    Ok(Json(
        steamgriddb::list_artwork(&state.config, game_id, kind)
            .await?
            .into_iter()
            .map(|artwork| SteamGridDbArtworkResponse {
                preview_url: format!(
                    "/api/v1/admin/game-categories/steamgriddb/games/{game_id}/artwork/{}/{}/preview",
                    artwork.kind, artwork.id
                ),
                id: artwork.id,
                kind: artwork.kind,
                score: artwork.score,
                style: artwork.style,
            })
            .collect(),
    ))
}

async fn steamgriddb_artwork_preview(
    State(state): State<AppState>,
    headers: HeaderMap,
    Path((game_id, kind, artwork_id)): Path<(i64, String, i64)>,
) -> Result<Response, ApiError> {
    let _auth = auth::require_admin(&state, &headers).await?;
    let kind = kind.parse()?;
    let artwork = steamgriddb::list_artwork(&state.config, game_id, kind)
        .await?
        .into_iter()
        .find(|asset| asset.id == artwork_id)
        .ok_or_else(|| ApiError::not_found("SteamGridDB artwork not found"))?;
    steamgriddb_image_response(
        steamgriddb::fetch_image(&artwork.thumb).await?,
        "private, max-age=3600",
    )
}

async fn update_game_category(
    State(state): State<AppState>,
    Extension(client_ip): Extension<ClientIp>,
    headers: HeaderMap,
    Path(id): Path<String>,
    Json(request): Json<UpsertGameCategoryRequest>,
) -> Result<Json<AdminGameCategoryResponse>, ApiError> {
    let auth = auth::require_admin(&state, &headers).await?;
    auth::require_csrf_for_cookie(&state, &headers, &auth)?;
    let existing = state
        .repositories
        .game_categories
        .get(&id)
        .await?
        .ok_or_else(|| ApiError::not_found("game category not found"))?;
    let update = new_game_category(&state, request, Some(&existing)).await?;
    let mut audit = NewAuditLogEntry::new("game_category.updated");
    audit.actor_user_id = Some(auth.user.id.clone());
    audit.target_type = Some("game_category".to_string());
    audit.target_id = Some(id.clone());
    audit.ip_address = Some(client_ip.as_str().to_string());
    audit.metadata_json = Some(sqlx::types::Json(serde_json::json!({
        "display_name": update.display_name.clone(),
        "steamgriddb_game_id": update.steamgriddb_game_id,
        "grid_artwork_id": update.artwork_id,
        "video_artwork_id": update.video_artwork_id,
        "icon_artwork_id": update.icon_artwork_id,
    })));
    if !state
        .repositories
        .update_game_category_with_audit(&id, &update, &audit)
        .await?
    {
        return Err(ApiError::not_found("game category not found"));
    }
    Ok(Json(load_admin_game_category(&state, &id).await?))
}

async fn merge_game_category(
    State(state): State<AppState>,
    Extension(client_ip): Extension<ClientIp>,
    headers: HeaderMap,
    Path(id): Path<String>,
    Json(request): Json<MergeGameCategoryRequest>,
) -> Result<Json<AdminGameCategoryResponse>, ApiError> {
    let auth = auth::require_admin(&state, &headers).await?;
    auth::require_csrf_for_cookie(&state, &headers, &auth)?;
    let destination_id = request.destination_category_id.trim();
    if destination_id.is_empty() {
        return Err(ApiError::bad_request("destination category is required"));
    }
    if id == destination_id {
        return Err(ApiError::bad_request(
            "a category cannot be merged into itself",
        ));
    }
    let source = state
        .repositories
        .game_categories
        .get(&id)
        .await?
        .ok_or_else(|| ApiError::not_found("source game category not found"))?;
    let destination = state
        .repositories
        .game_categories
        .get(destination_id)
        .await?
        .ok_or_else(|| ApiError::not_found("destination game category not found"))?;
    let moved_names = state
        .repositories
        .game_categories
        .list_names(&id)
        .await?
        .into_iter()
        .map(|name| {
            serde_json::json!({
                "id": name.id,
                "reported_name": name.reported_name,
            })
        })
        .collect::<Vec<_>>();
    let mut audit = NewAuditLogEntry::new("game_category.merged");
    audit.actor_user_id = Some(auth.user.id.clone());
    audit.target_type = Some("game_category".to_string());
    audit.target_id = Some(destination_id.to_string());
    audit.ip_address = Some(client_ip.as_str().to_string());
    audit.metadata_json = Some(sqlx::types::Json(serde_json::json!({
        "source_category_id": id.clone(),
        "destination_category_id": destination_id,
        "source_display_name": source.display_name,
        "destination_display_name": destination.display_name,
        "moved_reported_names": moved_names,
    })));
    match state
        .repositories
        .merge_game_categories(&id, destination_id, Some(&audit))
        .await?
    {
        MergeGameCategoryOutcome::Merged => {}
        MergeGameCategoryOutcome::SourceNotFound => {
            return Err(ApiError::not_found("source game category not found"));
        }
        MergeGameCategoryOutcome::DestinationNotFound => {
            return Err(ApiError::not_found("destination game category not found"));
        }
    }
    Ok(Json(
        load_admin_game_category(&state, destination_id).await?,
    ))
}

async fn separate_game_category_name(
    State(state): State<AppState>,
    Extension(client_ip): Extension<ClientIp>,
    headers: HeaderMap,
    Path((id, name_id)): Path<(String, String)>,
) -> Result<(StatusCode, Json<AdminGameCategoryResponse>), ApiError> {
    let auth = auth::require_admin(&state, &headers).await?;
    auth::require_csrf_for_cookie(&state, &headers, &auth)?;
    let mut audit = NewAuditLogEntry::new("game_category_name.separated");
    audit.actor_user_id = Some(auth.user.id.clone());
    audit.target_type = Some("game_category".to_string());
    audit.target_id = Some(id.clone());
    audit.ip_address = Some(client_ip.as_str().to_string());
    audit.metadata_json = Some(sqlx::types::Json(serde_json::json!({
        "source_category_id": id.clone(),
        "reported_name_id": name_id.clone(),
    })));
    let new_category_id = match state
        .repositories
        .separate_game_category_name(&id, &name_id, Some(&audit))
        .await?
    {
        SeparateGameCategoryNameOutcome::Created(category_id) => category_id,
        SeparateGameCategoryNameOutcome::CategoryNotFound => {
            return Err(ApiError::not_found("game category not found"));
        }
        SeparateGameCategoryNameOutcome::NameNotFound
        | SeparateGameCategoryNameOutcome::NameNotInCategory => {
            return Err(ApiError::not_found("reported game name not found"));
        }
        SeparateGameCategoryNameOutcome::AlreadySeparate => {
            return Err(ApiError::conflict(
                "reported game name is already in its own category",
            ));
        }
    };
    Ok((
        StatusCode::CREATED,
        Json(load_admin_game_category(&state, &new_category_id).await?),
    ))
}

async fn new_game_category(
    state: &AppState,
    request: UpsertGameCategoryRequest,
    existing: Option<&GameCategory>,
) -> Result<NewGameCategory, ApiError> {
    let display_name = validate_game_category_display_name(&request)?;
    if request.steamgriddb_game_id.is_some_and(|id| id <= 0) {
        return Err(ApiError::bad_request(
            "SteamGridDB game id must be positive",
        ));
    }
    let mut new = NewGameCategory::new(&display_name);
    new.steamgriddb_game_id = request.steamgriddb_game_id;
    let grid = resolve_artwork_slot(
        state,
        request.steamgriddb_game_id,
        steamgriddb::ArtworkKind::Grid,
        request.grid_artwork_id,
        existing.and_then(|category| category.steamgriddb_game_id),
        existing.and_then(|category| category.artwork_id),
        existing.and_then(|category| category.artwork_url.as_deref()),
        existing.and_then(|category| category.artwork_thumb_url.as_deref()),
    )
    .await?;
    if let Some(grid) = grid {
        new.artwork_kind = Some("grid".to_string());
        new.artwork_id = Some(grid.id);
        new.artwork_url = Some(grid.url);
        new.artwork_thumb_url = Some(grid.thumb);
    }

    let video = resolve_artwork_slot(
        state,
        request.steamgriddb_game_id,
        steamgriddb::ArtworkKind::Hero,
        request.video_artwork_id,
        existing.and_then(|category| category.steamgriddb_game_id),
        existing.and_then(|category| category.video_artwork_id),
        existing.and_then(|category| category.video_artwork_url.as_deref()),
        existing.and_then(|category| category.video_artwork_thumb_url.as_deref()),
    )
    .await?;
    if let Some(video) = video {
        new.video_artwork_id = Some(video.id);
        new.video_artwork_url = Some(video.url);
        new.video_artwork_thumb_url = Some(video.thumb);
    }

    let icon = resolve_artwork_slot(
        state,
        request.steamgriddb_game_id,
        steamgriddb::ArtworkKind::Icon,
        request.icon_artwork_id,
        existing.and_then(|category| category.steamgriddb_game_id),
        existing.and_then(|category| category.icon_artwork_id),
        existing.and_then(|category| category.icon_artwork_url.as_deref()),
        existing.and_then(|category| category.icon_artwork_thumb_url.as_deref()),
    )
    .await?;
    if let Some(icon) = icon {
        new.icon_artwork_id = Some(icon.id);
        new.icon_artwork_url = Some(icon.url);
        new.icon_artwork_thumb_url = Some(icon.thumb);
    }
    Ok(new)
}

struct ResolvedArtworkSlot {
    id: i64,
    url: String,
    thumb: String,
}

#[allow(clippy::too_many_arguments)]
async fn resolve_artwork_slot(
    state: &AppState,
    game_id: Option<i64>,
    kind: steamgriddb::ArtworkKind,
    requested_id: Option<i64>,
    existing_game_id: Option<i64>,
    existing_id: Option<i64>,
    existing_url: Option<&str>,
    existing_thumb: Option<&str>,
) -> Result<Option<ResolvedArtworkSlot>, ApiError> {
    let Some(requested_id) = requested_id else {
        return Ok(None);
    };
    let game_id = game_id.ok_or_else(|| {
        ApiError::bad_request("select a SteamGridDB game before selecting artwork")
    })?;
    if existing_game_id == Some(game_id) && existing_id == Some(requested_id) {
        if let (Some(url), Some(thumb)) = (existing_url, existing_thumb) {
            return Ok(Some(ResolvedArtworkSlot {
                id: requested_id,
                url: url.to_string(),
                thumb: thumb.to_string(),
            }));
        }
    }
    let asset = steamgriddb::list_artwork(&state.config, game_id, kind)
        .await?
        .into_iter()
        .find(|asset| asset.id == requested_id)
        .ok_or_else(|| {
            ApiError::not_found(format!(
                "selected SteamGridDB {} artwork not found",
                kind.as_str()
            ))
        })?;
    Ok(Some(ResolvedArtworkSlot {
        id: asset.id,
        url: asset.url,
        thumb: asset.thumb,
    }))
}

fn validate_game_category_display_name(
    request: &UpsertGameCategoryRequest,
) -> Result<String, ApiError> {
    let display_name = request.display_name.trim();
    if display_name.is_empty() {
        return Err(ApiError::bad_request("display name is required"));
    }
    if display_name.chars().count() > 200 {
        return Err(ApiError::bad_request(
            "display name must be at most 200 characters",
        ));
    }
    Ok(display_name.to_string())
}

fn steamgriddb_image_response(
    image: steamgriddb::ImageAsset,
    cache_control: &'static str,
) -> Result<Response, ApiError> {
    let content_type = HeaderValue::from_str(&image.content_type)
        .map_err(|_| ApiError::bad_gateway("SteamGridDB returned an invalid content type"))?;
    Response::builder()
        .header(header::CONTENT_TYPE, content_type)
        .header(header::CACHE_CONTROL, cache_control)
        .body(Body::from(image.bytes))
        .map_err(|_| ApiError::internal("SteamGridDB artwork response could not be created"))
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
            None => None,
            Some(bytes) => {
                let bytes = i64::try_from(bytes)
                    .map_err(|_| ApiError::bad_request("storage quota is too large"))?;
                if bytes < 0 {
                    return Err(ApiError::bad_request("storage quota must be non-negative"));
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

    Ok(Json(AdminSettingsResponse::from_settings(
        updated,
        &state.config,
    )))
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
    let Some(value) = normalized_optional(value) else {
        return Ok(None);
    };
    if value.len() > MAX_SMTP_FIELD_LEN {
        return Err(ApiError::bad_request(format!(
            "{label} must be at most {MAX_SMTP_FIELD_LEN} bytes"
        )));
    }
    Ok(Some(value))
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

pub(crate) fn stored_storage_quota_bytes(stored: Option<i64>) -> Option<u64> {
    match stored {
        None => None,
        Some(0) => None,
        Some(value) => u64::try_from(value).ok(),
    }
}

pub(crate) fn effective_per_user_storage_quota_bytes(
    user: &clipline_cloud_db::User,
    settings: &AppSettings,
    config: &crate::config::Config,
) -> Option<u64> {
    match user.storage_quota_bytes {
        None | Some(0) => effective_user_storage_quota_bytes(settings, config),
        Some(value) => u64::try_from(value).ok().filter(|quota| *quota > 0),
    }
}

fn stored_user_storage_quota_bytes(settings: &AppSettings) -> Option<u64> {
    stored_storage_quota_bytes(settings.user_storage_quota_bytes)
}

impl AdminSettingsResponse {
    fn from_settings(settings: AppSettings, config: &crate::config::Config) -> Self {
        let smtp_password_configured = settings
            .smtp_password
            .as_deref()
            .is_some_and(|password| !password.trim().is_empty());
        let user_storage_quota_bytes = stored_user_storage_quota_bytes(&settings);
        let user_storage_quota_env_fallback_bytes = if settings.user_storage_quota_bytes.is_none() {
            config.user_storage_quota_bytes
        } else {
            None
        };
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
            user_storage_quota_env_fallback_bytes,
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
            user_storage_quota_bytes: stored_storage_quota_bytes(value.user_storage_quota_bytes),
            user_storage_quota_env_fallback_bytes: None,
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

impl AdminGameCategoryResponse {
    fn from_category(
        value: GameCategory,
        names: Vec<GameCategoryName>,
        clip_counts: &std::collections::HashMap<String, i64>,
    ) -> Self {
        let grid_artwork_url = category_artwork_url(
            &value.id,
            "grid",
            value.artwork_id,
            value.artwork_thumb_url.as_deref(),
        );
        let video_artwork_url = category_artwork_url(
            &value.id,
            "video",
            value.video_artwork_id,
            value.video_artwork_thumb_url.as_deref(),
        );
        let icon_artwork_url = category_artwork_url(
            &value.id,
            "icon",
            value.icon_artwork_id,
            value.icon_artwork_thumb_url.as_deref(),
        );
        let reported_names = names
            .into_iter()
            .map(|name| AdminGameCategoryNameResponse {
                clip_count: clip_counts
                    .get(&name.reported_name.to_lowercase())
                    .copied()
                    .unwrap_or_default(),
                id: name.id,
                reported_name: name.reported_name,
            })
            .collect::<Vec<_>>();
        let clip_count = reported_names.iter().map(|name| name.clip_count).sum();
        Self {
            id: value.id,
            display_name: value.display_name,
            steamgriddb_game_id: value.steamgriddb_game_id,
            grid_artwork_id: value.artwork_id,
            grid_artwork_url,
            video_artwork_id: value.video_artwork_id,
            video_artwork_url,
            icon_artwork_id: value.icon_artwork_id,
            icon_artwork_url,
            clip_count,
            reported_names,
            created_at: value.created_at,
            updated_at: value.updated_at,
        }
    }
}

fn category_artwork_url(
    category_id: &str,
    slot: &str,
    artwork_id: Option<i64>,
    stored_url: Option<&str>,
) -> Option<String> {
    stored_url.zip(artwork_id).map(|(_, artwork_id)| {
        format!("/api/v1/public/game-categories/{category_id}/artwork/{slot}?v={artwork_id}")
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::Utc;

    #[test]
    fn game_category_validation_trims_display_name() {
        let display_name = validate_game_category_display_name(&UpsertGameCategoryRequest {
            display_name: "  Grand Theft Auto V  ".to_string(),
            steamgriddb_game_id: None,
            grid_artwork_id: None,
            video_artwork_id: None,
            icon_artwork_id: None,
        })
        .expect("valid category");
        assert_eq!(display_name, "Grand Theft Auto V");
    }

    #[test]
    fn game_category_validation_rejects_empty_display_name() {
        assert!(
            validate_game_category_display_name(&UpsertGameCategoryRequest {
                display_name: " ".to_string(),
                steamgriddb_game_id: None,
                grid_artwork_id: None,
                video_artwork_id: None,
                icon_artwork_id: None,
            })
            .is_err()
        );
    }

    #[test]
    fn category_artwork_urls_are_slot_specific_and_cache_versioned() {
        assert_eq!(
            category_artwork_url("category-1", "video", Some(98), Some("stored")),
            Some("/api/v1/public/game-categories/category-1/artwork/video?v=98".to_string())
        );
        assert_eq!(category_artwork_url("category-1", "icon", None, None), None);
    }

    #[test]
    fn admin_category_response_aggregates_names_and_uses_same_origin_artwork() {
        let now = Utc::now();
        let category = GameCategory {
            id: "category-1".to_string(),
            display_name: "Grand Theft Auto V".to_string(),
            steamgriddb_game_id: Some(5258),
            artwork_kind: Some("grid".to_string()),
            artwork_id: Some(8842),
            artwork_url: Some("https://cdn2.steamgriddb.com/grid.png".to_string()),
            artwork_thumb_url: Some("https://cdn2.steamgriddb.com/grid-thumb.png".to_string()),
            video_artwork_id: Some(8843),
            video_artwork_url: Some("https://cdn2.steamgriddb.com/hero.png".to_string()),
            video_artwork_thumb_url: Some(
                "https://cdn2.steamgriddb.com/hero-thumb.png".to_string(),
            ),
            icon_artwork_id: Some(8844),
            icon_artwork_url: Some("https://cdn2.steamgriddb.com/icon.png".to_string()),
            icon_artwork_thumb_url: Some("https://cdn2.steamgriddb.com/icon-thumb.png".to_string()),
            created_at: now,
            updated_at: now,
        };
        let names = vec![
            GameCategoryName {
                id: "name-1".to_string(),
                category_id: category.id.clone(),
                reported_name: "GTA5_Enhanced".to_string(),
                created_at: now,
                updated_at: now,
            },
            GameCategoryName {
                id: "name-2".to_string(),
                category_id: category.id.clone(),
                reported_name: "Grand Theft Auto V".to_string(),
                created_at: now,
                updated_at: now,
            },
        ];
        let counts = std::collections::HashMap::from([
            ("gta5_enhanced".to_string(), 3),
            ("grand theft auto v".to_string(), 2),
        ]);

        let response = AdminGameCategoryResponse::from_category(category, names, &counts);

        assert_eq!(response.clip_count, 5);
        assert_eq!(response.reported_names[0].clip_count, 3);
        assert_eq!(response.reported_names[1].clip_count, 2);
        assert_eq!(
            response.grid_artwork_url.as_deref(),
            Some("/api/v1/public/game-categories/category-1/artwork/grid?v=8842")
        );
        assert_eq!(
            response.video_artwork_url.as_deref(),
            Some("/api/v1/public/game-categories/category-1/artwork/video?v=8843")
        );
        assert_eq!(
            response.icon_artwork_url.as_deref(),
            Some("/api/v1/public/game-categories/category-1/artwork/icon?v=8844")
        );
    }

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
        assert_eq!(effective_user_storage_quota_bytes(&settings, &config), None);
    }

    #[test]
    fn settings_response_exposes_stored_quota_separately_from_env_fallback() {
        let mut settings = sample_settings(None);
        settings.user_storage_quota_bytes = None;
        let mut config = crate::config::Config::for_tests(
            "sqlite:///:memory:".to_string(),
            std::path::PathBuf::from("/tmp"),
        );
        config.user_storage_quota_bytes = Some(4096);
        let response = AdminSettingsResponse::from_settings(settings, &config);
        assert_eq!(response.user_storage_quota_bytes, None);
        assert_eq!(response.user_storage_quota_env_fallback_bytes, Some(4096));
    }

    #[test]
    fn stored_storage_quota_bytes_treats_zero_as_disabled() {
        assert_eq!(stored_storage_quota_bytes(None), None);
        assert_eq!(stored_storage_quota_bytes(Some(0)), None);
        assert_eq!(stored_storage_quota_bytes(Some(4096)), Some(4096));
    }

    #[test]
    fn effective_per_user_storage_quota_inherits_default_for_null_or_zero() {
        let user = clipline_cloud_db::User {
            id: "user-1".to_string(),
            username: "user".to_string(),
            display_name: None,
            email: None,
            bio: None,
            avatar_key: None,
            password_hash: "hash".to_string(),
            role: "user".to_string(),
            is_disabled: false,
            storage_quota_bytes: None,
            created_at: Utc::now(),
            updated_at: Utc::now(),
            last_login_at: None,
        };
        let settings = sample_settings(Some(1024));
        let config = crate::config::Config::for_tests(
            "sqlite:///:memory:".to_string(),
            std::path::PathBuf::from("/tmp"),
        );
        assert_eq!(
            effective_per_user_storage_quota_bytes(&user, &settings, &config),
            Some(1024)
        );

        let mut zero_user = user;
        zero_user.storage_quota_bytes = Some(0);
        assert_eq!(
            effective_per_user_storage_quota_bytes(&zero_user, &settings, &config),
            Some(1024)
        );
    }

    #[test]
    fn settings_response_hides_zero_stored_quota() {
        let settings = sample_settings(Some(0));
        let config = crate::config::Config::for_tests(
            "sqlite:///:memory:".to_string(),
            std::path::PathBuf::from("/tmp"),
        );
        let response = AdminSettingsResponse::from_settings(settings, &config);
        assert_eq!(response.user_storage_quota_bytes, None);
        assert_eq!(response.user_storage_quota_env_fallback_bytes, None);
    }
}
