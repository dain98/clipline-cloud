use axum::{
    extract::{Extension, Path, Query, State},
    http::HeaderMap,
    routing::{get, post},
    Json, Router,
};
use chrono::{DateTime, Utc};
use clipline_cloud_api_types::{
    ClipDetailResponse, ClipListResponse, ClipMarkerResponse, ClipSummaryResponse, StatusResponse,
    UpdateVisibilityRequest,
};
use clipline_cloud_db::{BulkVisibilityUpdate, Clip, ClipListParams, ClipMarker, ClipSort};
use rand::{rngs::OsRng, RngCore};
use serde::{Deserialize, Deserializer, Serialize};
use serde_json::{json, Value};
use std::collections::HashMap;

use crate::{
    auth,
    error::ApiError,
    game_category_id, game_display_name, game_display_name_map, game_icon_url, game_video_art_url,
    validation::{normalized_optional, validate_optional_char_count},
    AppState, ClientIp,
};

const DEFAULT_PAGE: i64 = 1;
const DEFAULT_PAGE_SIZE: i64 = 50;
const MAX_PAGE_SIZE: i64 = 100;
const MAX_PAGE: i64 = 1_000_000;
const MAX_BULK_CLIPS: usize = 100;
const PUBLIC_SHARE_ID_LEN: usize = 22;
const MAX_TITLE_LEN: usize = 300;
const MAX_DESCRIPTION_LEN: usize = 10_000;
const MAX_METADATA_FIELD_LEN: usize = 1_024;
const BASE62: &[u8; 62] = b"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/api/v1/clips", get(list_clips))
        .route("/api/v1/clips/bulk-delete", post(bulk_delete_clips))
        .route(
            "/api/v1/clips/bulk-visibility",
            post(bulk_update_visibility),
        )
        .route(
            "/api/v1/clips/{id}",
            get(get_clip).patch(update_clip).delete(delete_clip),
        )
        .route("/api/v1/clips/{id}/visibility", post(update_visibility))
}

#[derive(Debug, Deserialize)]
struct ListClipsQuery {
    sort: Option<String>,
    game: Option<String>,
    game_category_id: Option<String>,
    source_type: Option<String>,
    visibility: Option<String>,
    status: Option<String>,
    from: Option<DateTime<Utc>>,
    to: Option<DateTime<Utc>>,
    min_duration_ms: Option<i64>,
    max_duration_ms: Option<i64>,
    min_size_bytes: Option<i64>,
    max_size_bytes: Option<i64>,
    q: Option<String>,
    page: Option<i64>,
    page_size: Option<i64>,
}

#[derive(Debug, Deserialize)]
struct UpdateClipRequest {
    title: Option<String>,
    #[serde(default, deserialize_with = "deserialize_patch_value")]
    description: PatchValue,
    game_name: Option<Option<String>>,
    game_id: Option<Option<String>>,
    game_executable: Option<Option<String>>,
    source_type: Option<Option<String>>,
    recorded_at: Option<Option<DateTime<Utc>>>,
    duration_ms: Option<Option<i64>>,
}

#[derive(Debug, Default)]
enum PatchValue {
    #[default]
    Missing,
    Present(Value),
}

fn deserialize_patch_value<'de, D>(deserializer: D) -> Result<PatchValue, D::Error>
where
    D: Deserializer<'de>,
{
    Value::deserialize(deserializer).map(PatchValue::Present)
}

#[derive(Debug, Deserialize)]
struct BulkClipIdsRequest {
    ids: Vec<String>,
}

#[derive(Debug, Deserialize)]
struct BulkVisibilityRequest {
    ids: Vec<String>,
    visibility: String,
}

#[derive(Debug, Serialize)]
struct BulkMutationResponse {
    status: &'static str,
    affected: usize,
}

async fn list_clips(
    State(state): State<AppState>,
    headers: HeaderMap,
    Query(query): Query<ListClipsQuery>,
) -> Result<Json<ClipListResponse>, ApiError> {
    let auth = auth::require_auth(&state, &headers).await?;
    let page = query.page.unwrap_or(DEFAULT_PAGE).clamp(1, MAX_PAGE);
    let page_size = query
        .page_size
        .unwrap_or(DEFAULT_PAGE_SIZE)
        .clamp(1, MAX_PAGE_SIZE);
    let min_duration_ms = non_negative(query.min_duration_ms, "min_duration_ms")?;
    let max_duration_ms = non_negative(query.max_duration_ms, "max_duration_ms")?;
    let min_size_bytes = non_negative(query.min_size_bytes, "min_size_bytes")?;
    let max_size_bytes = non_negative(query.max_size_bytes, "max_size_bytes")?;
    validate_bounds(
        min_duration_ms,
        max_duration_ms,
        "min_duration_ms must be less than or equal to max_duration_ms",
    )?;
    validate_bounds(
        min_size_bytes,
        max_size_bytes,
        "min_size_bytes must be less than or equal to max_size_bytes",
    )?;
    let game = normalized_optional(query.game);
    let game_category_id = normalized_optional(query.game_category_id);
    if game.is_some() && game_category_id.is_some() {
        return Err(ApiError::bad_request(
            "game and game_category_id cannot be combined",
        ));
    }
    let params = ClipListParams {
        owner_user_id: auth.user.id.clone(),
        game,
        game_category_id,
        source_type: normalized_optional(query.source_type),
        visibility: normalized_optional(query.visibility)
            .map(validate_visibility)
            .transpose()?,
        status: normalized_optional(query.status)
            .map(validate_list_status)
            .transpose()?,
        from: query.from,
        to: query.to,
        min_duration_ms,
        max_duration_ms,
        min_size_bytes,
        max_size_bytes,
        query: normalized_optional(query.q),
        sort: parse_sort(query.sort.as_deref())?,
        limit: page_size + 1,
        offset: page.saturating_sub(1).saturating_mul(page_size),
    };
    if matches!((params.from.as_ref(), params.to.as_ref()), (Some(from), Some(to)) if from > to) {
        return Err(ApiError::bad_request("from must be before or equal to to"));
    }

    let mut clips = state.repositories.clips.list_for_owner(&params).await?;
    let has_more = clips.len() as i64 > page_size;
    clips.truncate(page_size as usize);
    let stats = state.repositories.clips.stats_for_owner(&params).await?;
    let display_names = game_display_name_map(&state).await?;
    let clips = clips
        .into_iter()
        .map(|clip| clip_summary_response(clip, &state, &display_names))
        .collect();

    Ok(Json(ClipListResponse {
        page,
        page_size,
        has_more,
        total: stats.total,
        total_size_bytes: stats.total_size_bytes,
        clips,
    }))
}

async fn get_clip(
    State(state): State<AppState>,
    headers: HeaderMap,
    Path(id): Path<String>,
) -> Result<Json<ClipDetailResponse>, ApiError> {
    let auth = auth::require_auth(&state, &headers).await?;
    let Some(clip) = state
        .repositories
        .clips
        .get_owned_ready(&auth.user.id, &id)
        .await?
    else {
        return Err(ApiError::not_found("clip not found"));
    };
    Ok(Json(detail_response(&state, clip).await?))
}

async fn update_clip(
    State(state): State<AppState>,
    Extension(client_ip): Extension<ClientIp>,
    headers: HeaderMap,
    Path(id): Path<String>,
    Json(request): Json<UpdateClipRequest>,
) -> Result<Json<ClipDetailResponse>, ApiError> {
    let auth = auth::require_auth(&state, &headers).await?;
    auth::require_csrf_for_cookie(&state, &headers, &auth)?;
    validate_update_clip_request(&request)?;
    if request.game_name.is_some() {
        return Err(ApiError::bad_request(
            "game_name cannot be changed after upload",
        ));
    }
    let Some(existing) = state
        .repositories
        .clips
        .get_owned_non_deleted(&auth.user.id, &id)
        .await?
    else {
        return Err(ApiError::not_found("clip not found"));
    };

    let title = match request.title {
        Some(title) => {
            let title = title.trim().to_string();
            if title.is_empty() {
                return Err(ApiError::bad_request("title cannot be empty"));
            }
            title
        }
        None => existing.title.clone(),
    };
    let description_updated = matches!(request.description, PatchValue::Present(_));
    let description = match request.description {
        PatchValue::Present(Value::Null) => None,
        PatchValue::Present(Value::String(value)) => normalized_optional(Some(value)),
        PatchValue::Present(_) => {
            return Err(ApiError::bad_request(
                "description must be a string or null",
            ))
        }
        PatchValue::Missing => existing.description.clone(),
    };
    let game_id = patch_optional_string(request.game_id, existing.game_id);
    let game_executable = patch_optional_string(request.game_executable, existing.game_executable);
    let source_type = patch_optional_string(request.source_type, existing.source_type);
    let recorded_at = request.recorded_at.unwrap_or(existing.recorded_at);
    let duration_ms = match request.duration_ms.unwrap_or(existing.duration_ms) {
        Some(value) if value < 0 => {
            return Err(ApiError::bad_request("duration_ms must be non-negative"))
        }
        value => value,
    };

    state
        .repositories
        .clips
        .update_metadata(
            &existing.id,
            &title,
            description.as_deref(),
            game_id.as_deref(),
            game_executable.as_deref(),
            source_type.as_deref(),
            recorded_at,
            duration_ms,
        )
        .await?;
    auth::audit_with_ip(
        &state.repositories,
        Some(client_ip.as_str()),
        Some(&auth.user),
        "clip.updated",
        Some("clip"),
        Some(&existing.id),
        Some(json!({ "title": title, "description_updated": description_updated })),
    )
    .await?;

    let clip = state
        .repositories
        .clips
        .get_owned_non_deleted(&auth.user.id, &id)
        .await?
        .ok_or_else(|| ApiError::conflict("clip was deleted before the update completed"))?;
    Ok(Json(detail_response(&state, clip).await?))
}

fn validate_update_clip_request(request: &UpdateClipRequest) -> Result<(), ApiError> {
    validate_optional_char_count(request.title.as_deref(), "title", MAX_TITLE_LEN)?;
    if let PatchValue::Present(Value::String(description)) = &request.description {
        validate_optional_char_count(Some(description), "description", MAX_DESCRIPTION_LEN)?;
    }
    for (name, value) in [
        (
            "game_name",
            request.game_name.as_ref().and_then(Option::as_deref),
        ),
        (
            "game_id",
            request.game_id.as_ref().and_then(Option::as_deref),
        ),
        (
            "game_executable",
            request.game_executable.as_ref().and_then(Option::as_deref),
        ),
        (
            "source_type",
            request.source_type.as_ref().and_then(Option::as_deref),
        ),
    ] {
        validate_optional_char_count(value, name, MAX_METADATA_FIELD_LEN)?;
    }
    Ok(())
}

async fn delete_clip(
    State(state): State<AppState>,
    Extension(client_ip): Extension<ClientIp>,
    headers: HeaderMap,
    Path(id): Path<String>,
) -> Result<Json<StatusResponse>, ApiError> {
    let auth = auth::require_auth(&state, &headers).await?;
    auth::require_csrf_for_cookie(&state, &headers, &auth)?;
    let Some(clip) = state
        .repositories
        .clips
        .get_owned_non_deleted(&auth.user.id, &id)
        .await?
    else {
        return Err(ApiError::not_found("clip not found"));
    };

    state.repositories.clips.soft_delete(&clip.id).await?;
    auth::audit_with_ip(
        &state.repositories,
        Some(client_ip.as_str()),
        Some(&auth.user),
        "clip.deleted",
        Some("clip"),
        Some(&clip.id),
        None,
    )
    .await?;
    Ok(Json(StatusResponse::ok()))
}

async fn bulk_delete_clips(
    State(state): State<AppState>,
    Extension(client_ip): Extension<ClientIp>,
    headers: HeaderMap,
    Json(request): Json<BulkClipIdsRequest>,
) -> Result<Json<BulkMutationResponse>, ApiError> {
    let auth = auth::require_auth(&state, &headers).await?;
    auth::require_csrf_for_cookie(&state, &headers, &auth)?;
    let ids = normalize_bulk_ids(request.ids)?;
    load_bulk_clips(&state, &auth.user.id, &ids, false).await?;

    let affected = state
        .repositories
        .bulk_soft_delete_clips_with_audit(
            &auth.user.id,
            &ids,
            Some(&auth.user.id),
            Some(client_ip.as_str()),
        )
        .await?;

    Ok(Json(BulkMutationResponse {
        status: "ok",
        affected,
    }))
}

async fn update_visibility(
    State(state): State<AppState>,
    Extension(client_ip): Extension<ClientIp>,
    headers: HeaderMap,
    Path(id): Path<String>,
    Json(request): Json<UpdateVisibilityRequest>,
) -> Result<Json<ClipDetailResponse>, ApiError> {
    let auth = auth::require_auth(&state, &headers).await?;
    auth::require_csrf_for_cookie(&state, &headers, &auth)?;
    let visibility = validate_visibility(request.visibility)?;
    let Some(clip) = state
        .repositories
        .clips
        .get_owned_ready(&auth.user.id, &id)
        .await?
    else {
        return Err(ApiError::not_found("clip not found"));
    };

    let public_share_id = match visibility.as_str() {
        "private" => None,
        "public" | "unlisted" => clip
            .public_share_id
            .clone()
            .or_else(|| Some(generate_public_share_id())),
        _ => unreachable!("validated visibility"),
    };
    state
        .repositories
        .clips
        .set_visibility(&clip.id, &visibility, public_share_id.as_deref())
        .await?;
    auth::audit_with_ip(
        &state.repositories,
        Some(client_ip.as_str()),
        Some(&auth.user),
        "clip.visibility_changed",
        Some("clip"),
        Some(&clip.id),
        Some(json!({ "visibility": visibility })),
    )
    .await?;

    let clip = state
        .repositories
        .clips
        .get_owned_ready(&auth.user.id, &id)
        .await?
        .ok_or_else(|| ApiError::conflict("clip was deleted before the update completed"))?;
    Ok(Json(detail_response(&state, clip).await?))
}

async fn bulk_update_visibility(
    State(state): State<AppState>,
    Extension(client_ip): Extension<ClientIp>,
    headers: HeaderMap,
    Json(request): Json<BulkVisibilityRequest>,
) -> Result<Json<BulkMutationResponse>, ApiError> {
    let auth = auth::require_auth(&state, &headers).await?;
    auth::require_csrf_for_cookie(&state, &headers, &auth)?;
    let visibility = validate_visibility(request.visibility)?;
    let ids = normalize_bulk_ids(request.ids)?;
    let clips = load_bulk_clips(&state, &auth.user.id, &ids, true).await?;
    let updates = clips
        .into_iter()
        .map(|clip| {
            let public_share_id = match visibility.as_str() {
                "private" => None,
                "public" | "unlisted" => clip
                    .public_share_id
                    .clone()
                    .or_else(|| Some(generate_public_share_id())),
                _ => unreachable!("validated visibility"),
            };
            BulkVisibilityUpdate {
                clip_id: clip.id,
                public_share_id,
            }
        })
        .collect::<Vec<_>>();
    let affected = state
        .repositories
        .bulk_set_visibility_with_audit(
            &auth.user.id,
            &updates,
            &visibility,
            Some(&auth.user.id),
            Some(client_ip.as_str()),
        )
        .await?;

    Ok(Json(BulkMutationResponse {
        status: "ok",
        affected,
    }))
}

async fn detail_response(state: &AppState, clip: Clip) -> Result<ClipDetailResponse, ApiError> {
    let markers = state
        .repositories
        .clip_markers
        .list_for_clip(&clip.id)
        .await?
        .into_iter()
        .map(clip_marker_response)
        .collect();
    let display_names = game_display_name_map(state).await?;
    Ok(clip_detail_response(clip, markers, state, &display_names))
}

fn clip_summary_response(
    clip: Clip,
    state: &AppState,
    display_names: &HashMap<String, crate::ResolvedGameCategory>,
) -> ClipSummaryResponse {
    let game_display_name = game_display_name(clip.game_name.as_deref(), display_names);
    let game_category_id = game_category_id(clip.game_name.as_deref(), display_names);
    let game_icon_url = game_icon_url(clip.game_name.as_deref(), display_names);
    let game_video_art_url = game_video_art_url(clip.game_name.as_deref(), display_names);
    ClipSummaryResponse {
        id: clip.id,
        client_clip_id: clip.client_clip_id,
        title: clip.title,
        description: clip.description,
        game_name: clip.game_name,
        game_category_id,
        game_display_name,
        game_icon_url,
        game_video_art_url,
        game_id: clip.game_id,
        source_type: clip.source_type,
        recorded_at: clip.recorded_at,
        uploaded_at: clip.uploaded_at,
        duration_ms: clip.duration_ms,
        file_size_bytes: clip.file_size_bytes,
        width: clip.width,
        height: clip.height,
        fps: clip.fps,
        visibility: clip.visibility,
        status: clip.status,
        public_url: clip
            .public_share_id
            .as_deref()
            .and_then(|share_id| public_url(state, share_id)),
        view_count: clip.view_count,
        created_at: clip.created_at,
        updated_at: clip.updated_at,
    }
}

fn clip_detail_response(
    clip: Clip,
    markers: Vec<ClipMarkerResponse>,
    state: &AppState,
    display_names: &HashMap<String, crate::ResolvedGameCategory>,
) -> ClipDetailResponse {
    let public_url = clip
        .public_share_id
        .as_deref()
        .and_then(|share_id| public_url(state, share_id));
    let game_display_name = game_display_name(clip.game_name.as_deref(), display_names);
    let game_category_id = game_category_id(clip.game_name.as_deref(), display_names);
    let game_icon_url = game_icon_url(clip.game_name.as_deref(), display_names);
    let game_video_art_url = game_video_art_url(clip.game_name.as_deref(), display_names);
    ClipDetailResponse {
        id: clip.id,
        client_clip_id: clip.client_clip_id,
        title: clip.title,
        description: clip.description,
        game_name: clip.game_name,
        game_category_id,
        game_display_name,
        game_icon_url,
        game_video_art_url,
        game_id: clip.game_id,
        game_executable: clip.game_executable,
        source_type: clip.source_type,
        recorded_at: clip.recorded_at,
        uploaded_at: clip.uploaded_at,
        duration_ms: clip.duration_ms,
        file_size_bytes: clip.file_size_bytes,
        width: clip.width,
        height: clip.height,
        fps: clip.fps,
        container: clip.container,
        video_codec: clip.video_codec,
        audio_codec: clip.audio_codec,
        checksum_sha256: clip.checksum_sha256,
        visibility: clip.visibility,
        status: clip.status,
        public_share_id: clip.public_share_id,
        public_url,
        view_count: clip.view_count,
        markers,
        created_at: clip.created_at,
        updated_at: clip.updated_at,
    }
}

fn clip_marker_response(value: ClipMarker) -> ClipMarkerResponse {
    ClipMarkerResponse {
        id: value.id,
        kind: value.kind,
        label: value.label,
        timestamp_ms: value.timestamp_ms,
        metadata: value.metadata_json.map(|metadata| metadata.0),
        created_at: value.created_at,
    }
}

fn parse_sort(value: Option<&str>) -> Result<ClipSort, ApiError> {
    match value.unwrap_or("uploaded_at_desc") {
        "recorded_at_desc" => Ok(ClipSort::RecordedAtDesc),
        "recorded_at_asc" => Ok(ClipSort::RecordedAtAsc),
        "uploaded_at_desc" => Ok(ClipSort::UploadedAtDesc),
        "uploaded_at_asc" => Ok(ClipSort::UploadedAtAsc),
        "duration_desc" => Ok(ClipSort::DurationDesc),
        "duration_asc" => Ok(ClipSort::DurationAsc),
        "size_desc" => Ok(ClipSort::FileSizeDesc),
        "size_asc" => Ok(ClipSort::FileSizeAsc),
        "title_asc" => Ok(ClipSort::TitleAsc),
        "title_desc" => Ok(ClipSort::TitleDesc),
        "created_at_desc" => Ok(ClipSort::CreatedAtDesc),
        "created_at_asc" => Ok(ClipSort::CreatedAtAsc),
        "updated_at_desc" => Ok(ClipSort::UpdatedAtDesc),
        "updated_at_asc" => Ok(ClipSort::UpdatedAtAsc),
        _ => Err(ApiError::bad_request("unsupported clip sort")),
    }
}

fn normalize_bulk_ids(ids: Vec<String>) -> Result<Vec<String>, ApiError> {
    let mut normalized = Vec::new();
    for id in ids {
        let id = id.trim().to_string();
        if id.is_empty() || normalized.iter().any(|existing| existing == &id) {
            continue;
        }
        normalized.push(id);
    }
    if normalized.is_empty() {
        return Err(ApiError::bad_request("at least one clip id is required"));
    }
    if normalized.len() > MAX_BULK_CLIPS {
        return Err(ApiError::bad_request(format!(
            "bulk operations are limited to {MAX_BULK_CLIPS} clips"
        )));
    }
    Ok(normalized)
}

async fn load_bulk_clips(
    state: &AppState,
    owner_user_id: &str,
    ids: &[String],
    ready_only: bool,
) -> Result<Vec<Clip>, ApiError> {
    let clips = state
        .repositories
        .clips
        .list_owned_for_bulk(owner_user_id, ids, ready_only)
        .await?;
    if clips.len() != ids.len() {
        return Err(ApiError::not_found("one or more clips were not found"));
    }
    Ok(clips)
}

fn non_negative(value: Option<i64>, field: &'static str) -> Result<Option<i64>, ApiError> {
    match value {
        Some(value) if value < 0 => Err(ApiError::bad_request(format!(
            "{field} must be non-negative"
        ))),
        value => Ok(value),
    }
}

fn validate_bounds(
    min: Option<i64>,
    max: Option<i64>,
    message: &'static str,
) -> Result<(), ApiError> {
    if matches!((min, max), (Some(min), Some(max)) if min > max) {
        return Err(ApiError::bad_request(message));
    }
    Ok(())
}

fn validate_visibility(value: String) -> Result<String, ApiError> {
    match value.as_str() {
        "private" | "public" | "unlisted" => Ok(value),
        _ => Err(ApiError::bad_request(
            "visibility must be private, public, or unlisted",
        )),
    }
}

fn validate_list_status(value: String) -> Result<String, ApiError> {
    match value.as_str() {
        "created" | "uploading" | "processing" | "ready" | "failed" => Ok(value),
        "deleted" => Err(ApiError::bad_request(
            "deleted clips are excluded from library queries",
        )),
        _ => Err(ApiError::bad_request("unsupported clip status")),
    }
}

fn patch_optional_string(patch: Option<Option<String>>, current: Option<String>) -> Option<String> {
    match patch {
        Some(Some(value)) => normalized_optional(Some(value)),
        Some(None) => None,
        None => current,
    }
}

pub(crate) fn generate_public_share_id() -> String {
    let mut value = String::with_capacity(2 + PUBLIC_SHARE_ID_LEN);
    value.push_str("c_");
    for _ in 0..PUBLIC_SHARE_ID_LEN {
        value.push(random_base62_char());
    }
    value
}

fn random_base62_char() -> char {
    loop {
        let mut byte = [0_u8; 1];
        OsRng.fill_bytes(&mut byte);
        if byte[0] < 248 {
            return BASE62[(byte[0] % BASE62.len() as u8) as usize] as char;
        }
    }
}

fn public_url(state: &AppState, share_id: &str) -> Option<String> {
    state
        .config
        .public_url
        .join(&format!("c/{share_id}"))
        .ok()
        .map(|url| url.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::Arc;

    use axum::{
        body::Body,
        http::{header, HeaderValue, Request, StatusCode},
        response::IntoResponse,
    };
    use clipline_cloud_db::{new_ulid, Database, NewClip, NewDeviceToken, NewUser, Repositories};
    use clipline_cloud_storage::{LocalStorage, SharedStorageBackend};
    use sha2::{Digest, Sha256};
    use tempfile::TempDir;
    use tower::ServiceExt;

    struct TestApp {
        state: AppState,
        _temp_dir: TempDir,
    }

    #[test]
    fn generated_public_share_id_has_expected_shape() {
        let id = generate_public_share_id();
        assert_eq!(id.len(), 24);
        assert!(id.starts_with("c_"));
        assert!(id[2..].bytes().all(|byte| byte.is_ascii_alphanumeric()));
    }

    #[test]
    fn bulk_ids_are_trimmed_deduplicated_and_limited() {
        assert_eq!(
            normalize_bulk_ids(vec![
                " clip-a ".to_string(),
                "".to_string(),
                "clip-a".to_string(),
                "clip-b".to_string(),
            ])
            .expect("normalized ids"),
            vec!["clip-a".to_string(), "clip-b".to_string()]
        );

        assert!(normalize_bulk_ids(Vec::new()).is_err());
        assert!(normalize_bulk_ids(
            (0..=MAX_BULK_CLIPS)
                .map(|index| format!("clip-{index}"))
                .collect()
        )
        .is_err());
    }

    #[tokio::test]
    async fn bulk_delete_rejects_foreign_clip_without_mutating_owned_clip() {
        let app = test_app().await;
        let owner = insert_user(&app.state, "owner").await;
        let other = insert_user(&app.state, "other").await;
        let owned_clip = insert_ready_clip(&app.state, &owner.id, "owned").await;
        let foreign_clip = insert_ready_clip(&app.state, &other.id, "foreign").await;
        let headers = auth_headers(&app.state, &owner.id).await;

        let status = error_status(
            bulk_delete_clips(
                State(app.state.clone()),
                Extension(ClientIp("203.0.113.10".to_string())),
                headers,
                Json(BulkClipIdsRequest {
                    ids: vec![owned_clip.id.clone(), foreign_clip.id.clone()],
                }),
            )
            .await,
        );

        assert_eq!(status, StatusCode::NOT_FOUND);
        let owned_after = app
            .state
            .repositories
            .clips
            .get(&owned_clip.id)
            .await
            .expect("clip lookup")
            .expect("owned clip");
        assert_eq!(owned_after.status, "ready");
        assert!(owned_after.deleted_at.is_none());
    }

    #[tokio::test]
    async fn bulk_visibility_rejects_foreign_clip_without_mutating_owned_clip() {
        let app = test_app().await;
        let owner = insert_user(&app.state, "owner").await;
        let other = insert_user(&app.state, "other").await;
        let owned_clip = insert_ready_clip(&app.state, &owner.id, "owned").await;
        let foreign_clip = insert_ready_clip(&app.state, &other.id, "foreign").await;
        let headers = auth_headers(&app.state, &owner.id).await;

        let status = error_status(
            bulk_update_visibility(
                State(app.state.clone()),
                Extension(ClientIp("203.0.113.10".to_string())),
                headers,
                Json(BulkVisibilityRequest {
                    ids: vec![owned_clip.id.clone(), foreign_clip.id.clone()],
                    visibility: "public".to_string(),
                }),
            )
            .await,
        );

        assert_eq!(status, StatusCode::NOT_FOUND);
        let owned_after = app
            .state
            .repositories
            .clips
            .get(&owned_clip.id)
            .await
            .expect("clip lookup")
            .expect("owned clip");
        assert_eq!(owned_after.visibility, "private");
        assert!(owned_after.public_share_id.is_none());
    }

    #[tokio::test]
    async fn bulk_delete_rejects_empty_selection() {
        let app = test_app().await;
        let owner = insert_user(&app.state, "owner").await;
        let headers = auth_headers(&app.state, &owner.id).await;

        let status = error_status(
            bulk_delete_clips(
                State(app.state.clone()),
                Extension(ClientIp("203.0.113.10".to_string())),
                headers,
                Json(BulkClipIdsRequest { ids: Vec::new() }),
            )
            .await,
        );

        assert_eq!(status, StatusCode::BAD_REQUEST);
    }

    #[tokio::test]
    async fn list_clips_rejects_invalid_sort_key() {
        let app = test_app().await;
        let owner = insert_user(&app.state, "owner").await;
        let headers = auth_headers(&app.state, &owner.id).await;

        let status = error_status(
            list_clips(
                State(app.state.clone()),
                headers,
                Query(ListClipsQuery {
                    sort: Some("definitely-not-a-sort".to_string()),
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
                    q: None,
                    page: None,
                    page_size: None,
                }),
            )
            .await,
        );

        assert_eq!(status, StatusCode::BAD_REQUEST);
    }

    #[tokio::test]
    async fn list_clips_returns_client_fields_and_excludes_deleted_for_device_token() {
        let app = test_app().await;
        let owner = insert_user(&app.state, "owner").await;

        let mut ready = NewClip::new(&owner.id, "Ready clip", "local");
        ready.status = "ready".to_string();
        ready.client_clip_id = Some("local-ready".to_string());
        ready.source_type = Some("replay".to_string());
        ready.file_size_bytes = Some(200);
        app.state
            .repositories
            .clips
            .create(&ready)
            .await
            .expect("ready clip");

        let mut processing = NewClip::new(&owner.id, "Processing clip", "local");
        processing.status = "processing".to_string();
        processing.client_clip_id = Some("local-processing".to_string());
        processing.source_type = Some("replay".to_string());
        processing.file_size_bytes = Some(100);
        app.state
            .repositories
            .clips
            .create(&processing)
            .await
            .expect("processing clip");

        let mut deleted = NewClip::new(&owner.id, "Deleted clip", "local");
        deleted.status = "ready".to_string();
        deleted.client_clip_id = Some("local-deleted".to_string());
        let deleted = app
            .state
            .repositories
            .clips
            .create(&deleted)
            .await
            .expect("deleted clip");
        app.state
            .repositories
            .clips
            .soft_delete(&deleted.id)
            .await
            .expect("soft delete clip");

        let headers = auth_headers(&app.state, &owner.id).await;
        let authorization = headers
            .get(header::AUTHORIZATION)
            .expect("authorization header")
            .clone();
        let request = Request::builder()
            .method("GET")
            .uri("/api/v1/clips?sort=title_asc&page_size=100")
            .header(header::AUTHORIZATION, authorization)
            .body(Body::empty())
            .expect("request");

        let response = routes()
            .with_state(app.state.clone())
            .oneshot(request)
            .await
            .expect("response");

        assert_eq!(response.status(), StatusCode::OK);
        let body = axum::body::to_bytes(response.into_body(), usize::MAX)
            .await
            .expect("response body");
        let response: ClipListResponse = serde_json::from_slice(&body).expect("clip list");

        assert_eq!(response.page, 1);
        assert_eq!(response.page_size, 100);
        assert!(!response.has_more);
        assert_eq!(response.total, 2);
        assert_eq!(response.total_size_bytes, 300);
        assert_eq!(
            response
                .clips
                .iter()
                .map(|clip| (clip.title.as_str(), clip.status.as_str()))
                .collect::<Vec<_>>(),
            vec![("Processing clip", "processing"), ("Ready clip", "ready")]
        );
        assert_eq!(
            response.clips[0].client_clip_id.as_deref(),
            Some("local-processing")
        );
        assert_eq!(response.clips[0].source_type.as_deref(), Some("replay"));
        assert_eq!(
            response.clips[1].client_clip_id.as_deref(),
            Some("local-ready")
        );
        assert_eq!(response.clips[1].source_type.as_deref(), Some("replay"));
    }

    async fn test_app() -> TestApp {
        let temp_dir = tempfile::tempdir().expect("temp dir");
        let database_url = format!("sqlite://{}", temp_dir.path().join("clipline.db").display());
        let config = Arc::new(crate::config::Config::for_tests(
            database_url.clone(),
            temp_dir.path().join("data"),
        ));
        let database = Database::connect_and_migrate(&database_url)
            .await
            .expect("database");
        let repositories = Repositories::new(database.clone());
        let storage: SharedStorageBackend =
            Arc::new(LocalStorage::new(temp_dir.path().join("data")));
        let auth = auth::AuthRuntime::new(config.session_secret.as_deref());
        let state = AppState {
            config,
            database,
            repositories,
            storage,
            auth,
            game_category_map_cache: Arc::default(),
            readiness: crate::health::ReadinessCache::default(),
        };
        TestApp {
            state,
            _temp_dir: temp_dir,
        }
    }

    async fn insert_user(state: &AppState, username: &str) -> clipline_cloud_db::User {
        state
            .repositories
            .users
            .create(&NewUser::new(
                format!("{username}-{}", new_ulid()),
                "argon2id-hash",
                "user",
            ))
            .await
            .expect("user")
    }

    async fn insert_ready_clip(state: &AppState, owner_user_id: &str, title: &str) -> Clip {
        let mut new_clip = NewClip::new(owner_user_id, title, "local");
        new_clip.status = "ready".to_string();
        state
            .repositories
            .clips
            .create(&new_clip)
            .await
            .expect("clip")
    }

    async fn auth_headers(state: &AppState, user_id: &str) -> HeaderMap {
        let raw_token = format!("test-token-{}", new_ulid());
        let token_hash = hash_token_for_test(&raw_token);
        state
            .repositories
            .device_tokens
            .create(&NewDeviceToken::new(user_id, "test token", token_hash))
            .await
            .expect("device token");

        let mut headers = HeaderMap::new();
        headers.insert(
            header::AUTHORIZATION,
            HeaderValue::from_str(&format!("Bearer {raw_token}")).expect("authorization header"),
        );
        headers
    }

    fn hash_token_for_test(token: &str) -> String {
        let digest = Sha256::digest(token.as_bytes());
        let mut out = String::with_capacity(digest.len() * 2);
        for byte in digest {
            use std::fmt::Write as _;
            let _ = write!(out, "{byte:02x}");
        }
        out
    }

    fn error_status<T>(result: Result<T, ApiError>) -> StatusCode {
        match result {
            Ok(_) => panic!("expected handler error"),
            Err(error) => error.into_response().status(),
        }
    }
}
