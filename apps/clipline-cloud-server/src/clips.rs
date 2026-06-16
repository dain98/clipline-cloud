use axum::{
    extract::{Extension, Path, Query, State},
    http::HeaderMap,
    routing::{get, post},
    Json, Router,
};
use chrono::{DateTime, Utc};
use clipline_cloud_api_types::{
    ClipDetailResponse, ClipListResponse, ClipMarkerResponse, ClipSummaryResponse,
    UpdateVisibilityRequest,
};
use clipline_cloud_db::{Clip, ClipListParams, ClipMarker, ClipSort};
use rand::{rngs::OsRng, RngCore};
use serde::Deserialize;
use serde_json::json;

use crate::{
    auth::{self, ApiError},
    AppState, ClientIp,
};

const DEFAULT_PAGE: i64 = 1;
const DEFAULT_PAGE_SIZE: i64 = 50;
const MAX_PAGE_SIZE: i64 = 100;
const PUBLIC_SHARE_ID_LEN: usize = 22;
const BASE62: &[u8; 62] = b"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/api/v1/clips", get(list_clips))
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
    visibility: Option<String>,
    status: Option<String>,
    from: Option<DateTime<Utc>>,
    to: Option<DateTime<Utc>>,
    q: Option<String>,
    page: Option<i64>,
    page_size: Option<i64>,
}

#[derive(Debug, Deserialize)]
struct UpdateClipRequest {
    title: Option<String>,
    game_name: Option<Option<String>>,
    game_id: Option<Option<String>>,
    game_executable: Option<Option<String>>,
    source_type: Option<Option<String>>,
    recorded_at: Option<Option<DateTime<Utc>>>,
    duration_ms: Option<Option<i64>>,
}

async fn list_clips(
    State(state): State<AppState>,
    headers: HeaderMap,
    Query(query): Query<ListClipsQuery>,
) -> Result<Json<ClipListResponse>, ApiError> {
    let auth = auth::require_auth(&state, &headers).await?;
    let page = query.page.unwrap_or(DEFAULT_PAGE).max(1);
    let page_size = query
        .page_size
        .unwrap_or(DEFAULT_PAGE_SIZE)
        .clamp(1, MAX_PAGE_SIZE);
    let params = ClipListParams {
        owner_user_id: auth.user.id.clone(),
        game: normalized_optional(query.game),
        visibility: normalized_optional(query.visibility)
            .map(validate_visibility)
            .transpose()?,
        status: normalized_optional(query.status)
            .map(validate_list_status)
            .transpose()?,
        from: query.from,
        to: query.to,
        query: normalized_optional(query.q),
        sort: parse_sort(query.sort.as_deref())?,
        limit: page_size,
        offset: (page - 1) * page_size,
    };
    if matches!((params.from.as_ref(), params.to.as_ref()), (Some(from), Some(to)) if from > to) {
        return Err(ApiError::bad_request("from must be before or equal to to"));
    }

    let clips = state
        .repositories
        .clips
        .list_for_owner(&params)
        .await?
        .into_iter()
        .map(|clip| clip_summary_response(clip, &state))
        .collect();

    Ok(Json(ClipListResponse {
        page,
        page_size,
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
    let game_name = patch_optional_string(request.game_name, existing.game_name);
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
            game_name.as_deref(),
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
        Some(json!({ "title": title })),
    )
    .await?;

    let clip = state
        .repositories
        .clips
        .get_owned_non_deleted(&auth.user.id, &id)
        .await?
        .expect("updated clip should exist");
    Ok(Json(detail_response(&state, clip).await?))
}

async fn delete_clip(
    State(state): State<AppState>,
    Extension(client_ip): Extension<ClientIp>,
    headers: HeaderMap,
    Path(id): Path<String>,
) -> Result<Json<serde_json::Value>, ApiError> {
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
    Ok(Json(json!({ "status": "ok" })))
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
        .expect("updated clip should exist");
    Ok(Json(detail_response(&state, clip).await?))
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
    Ok(clip_detail_response(clip, markers, state))
}

fn clip_summary_response(clip: Clip, state: &AppState) -> ClipSummaryResponse {
    ClipSummaryResponse {
        id: clip.id,
        title: clip.title,
        game_name: clip.game_name,
        game_id: clip.game_id,
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
        created_at: clip.created_at,
        updated_at: clip.updated_at,
    }
}

fn clip_detail_response(
    clip: Clip,
    markers: Vec<ClipMarkerResponse>,
    state: &AppState,
) -> ClipDetailResponse {
    let public_url = clip
        .public_share_id
        .as_deref()
        .and_then(|share_id| public_url(state, share_id));
    ClipDetailResponse {
        id: clip.id,
        client_clip_id: clip.client_clip_id,
        title: clip.title,
        game_name: clip.game_name,
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
        "title_asc" => Ok(ClipSort::TitleAsc),
        _ => Err(ApiError::bad_request("unsupported clip sort")),
    }
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

fn normalized_optional(value: Option<String>) -> Option<String> {
    value
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty())
}

fn patch_optional_string(patch: Option<Option<String>>, current: Option<String>) -> Option<String> {
    match patch {
        Some(Some(value)) => normalized_optional(Some(value)),
        Some(None) => None,
        None => current,
    }
}

fn generate_public_share_id() -> String {
    let mut value = String::with_capacity(2 + PUBLIC_SHARE_ID_LEN);
    value.push_str("c_");
    for _ in 0..PUBLIC_SHARE_ID_LEN {
        let index = (OsRng.next_u32() as usize) % BASE62.len();
        value.push(BASE62[index] as char);
    }
    value
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

    #[test]
    fn generated_public_share_id_has_expected_shape() {
        let id = generate_public_share_id();
        assert_eq!(id.len(), 24);
        assert!(id.starts_with("c_"));
        assert!(id[2..].bytes().all(|byte| byte.is_ascii_alphanumeric()));
    }
}
