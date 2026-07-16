use axum::{
    body::Bytes,
    extract::{DefaultBodyLimit, Path, State},
    http::{header, HeaderMap},
    routing::{get, post, put},
    Json, Router,
};
use chrono::Duration as ChronoDuration;
use clipline_cloud_api_types::{
    CreateUploadRequest, CreateUploadResponse, DirectPartUploadAckRequest,
    DirectPartUploadUrlResponse, DirectUploadHeader, PartUploadResponse, StatusResponse,
    UploadProgressResponse,
};
use clipline_cloud_core::jobs::VALIDATE_OBJECT_KIND;
use clipline_cloud_db::{
    now_utc, AbortUploadOutcome, Clip, FinalizeUploadOutcome, NewClip, NewClipMarker,
    NewGameCategory, NewJob, NewUploadPart, NewUploadSession, UploadPart, UploadSession,
};
use clipline_cloud_storage::{
    CompletedUploadPart, MediaObjectKeys, ObjectKey, PutObjectMetadata, SharedStorageBackend,
    StorageError,
};
use sha2::{Digest, Sha256};
use tokio::io::AsyncReadExt;
use tracing::{info, warn};

use crate::{
    auth::{self, AuthenticatedUser},
    clips::generate_public_share_id,
    config::{Config, StorageConfig},
    error::ApiError,
    steamgriddb,
    validation::{normalized_optional_ref, validate_optional_char_count},
    AppState,
};

const MIB: u64 = 1024 * 1024;
const S3_MIN_PART_SIZE_BYTES: u64 = 5 * MIB;
const MAX_MULTIPART_PARTS: u64 = 10_000;
const PART_SHA256_HEADER: &str = "x-clipline-part-sha256";
const STORAGE_RETRY_AFTER: std::time::Duration = std::time::Duration::from_secs(10);
const DIRECT_UPLOAD_PART_URL_TTL: std::time::Duration = std::time::Duration::from_secs(15 * 60);
pub(crate) const UPLOAD_JSON_BODY_LIMIT: usize = 256 * 1024;
const MAX_TITLE_LEN: usize = 300;
const MAX_DESCRIPTION_LEN: usize = 10_000;
const MAX_CLIENT_CLIP_ID_LEN: usize = 255;

fn schedule_automatic_game_category_enrichment(state: AppState, category: NewGameCategory) {
    if !steamgriddb::configured(&state.config) {
        return;
    }
    tokio::spawn(async move {
        enrich_new_game_category(&state, category).await;
    });
}

async fn enrich_new_game_category(state: &AppState, category: NewGameCategory) {
    let search_results =
        match steamgriddb::search_games(&state.config, &category.display_name).await {
            Ok(results) => results,
            Err(error) => {
                warn!(
                    event = "game_category.auto_enrichment_search_failed",
                    category_id = %category.id,
                    status = %error.status(),
                    error = error.message()
                );
                return;
            }
        };
    let Some(game) = steamgriddb::best_game_match(&category.display_name, search_results) else {
        info!(
            event = "game_category.auto_enrichment_no_match",
            category_id = %category.id
        );
        return;
    };

    let (grid_result, video_result, icon_result) = tokio::join!(
        steamgriddb::list_artwork(&state.config, game.id, steamgriddb::ArtworkKind::Grid),
        steamgriddb::list_artwork(&state.config, game.id, steamgriddb::ArtworkKind::Hero),
        steamgriddb::list_artwork(&state.config, game.id, steamgriddb::ArtworkKind::Icon),
    );
    let grid = automatic_artwork_result(&category.id, "grid", grid_result);
    let video = automatic_artwork_result(&category.id, "video", video_result);
    let icon = automatic_artwork_result(&category.id, "icon", icon_result);

    let mut update = NewGameCategory::new(&category.display_name);
    update.steamgriddb_game_id = Some(game.id);
    if let Some(asset) = grid {
        update.artwork_kind = Some("grid".to_string());
        update.artwork_id = Some(asset.id);
        update.artwork_url = Some(asset.url);
        update.artwork_thumb_url = Some(asset.thumb);
    }
    if let Some(asset) = video {
        update.video_artwork_id = Some(asset.id);
        update.video_artwork_url = Some(asset.url);
        update.video_artwork_thumb_url = Some(asset.thumb);
    }
    if let Some(asset) = icon {
        update.icon_artwork_id = Some(asset.id);
        update.icon_artwork_url = Some(asset.url);
        update.icon_artwork_thumb_url = Some(asset.thumb);
    }

    match state
        .repositories
        .game_categories
        .apply_automatic_metadata_if_unchanged(&category.id, category.updated_at, &update)
        .await
    {
        Ok(Some(_)) => info!(
            event = "game_category.auto_enrichment_completed",
            category_id = %category.id,
            steamgriddb_game_id = game.id,
            grid_artwork_id = update.artwork_id,
            video_artwork_id = update.video_artwork_id,
            icon_artwork_id = update.icon_artwork_id
        ),
        Ok(None) => info!(
            event = "game_category.auto_enrichment_skipped_changed_category",
            category_id = %category.id
        ),
        Err(error) => warn!(
            event = "game_category.auto_enrichment_update_failed",
            category_id = %category.id,
            error = %error
        ),
    }
}

fn automatic_artwork_result(
    category_id: &str,
    slot: &str,
    result: Result<Vec<steamgriddb::ArtworkResult>, ApiError>,
) -> Option<steamgriddb::ArtworkResult> {
    match result {
        Ok(results) => steamgriddb::highest_scoring_artwork(results),
        Err(error) => {
            warn!(
                event = "game_category.auto_enrichment_artwork_failed",
                category_id,
                slot,
                status = %error.status(),
                error = error.message()
            );
            None
        }
    }
}
const MAX_METADATA_FIELD_LEN: usize = 1_024;
const MAX_CODEC_LEN: usize = 120;
const MAX_MARKERS: usize = 1_000;
const MAX_MARKER_KIND_LEN: usize = 64;
const MAX_MARKER_LABEL_LEN: usize = 256;
const MAX_MARKER_METADATA_BYTES: usize = 16 * 1024;

pub fn routes(max_request_body_bytes: usize) -> Router<AppState> {
    let media_body_routes = Router::new()
        .route("/api/v1/uploads/{id}/content", put(put_content))
        .route("/api/v1/uploads/{id}/parts/{part_number}", put(put_part))
        .layer(DefaultBodyLimit::max(max_request_body_bytes));

    Router::new()
        .route(
            "/api/v1/uploads",
            post(create_upload).layer(DefaultBodyLimit::max(UPLOAD_JSON_BODY_LIMIT)),
        )
        .route("/api/v1/uploads/{id}", get(get_upload).delete(abort_upload))
        .route(
            "/api/v1/uploads/{id}/parts/{part_number}/presign",
            post(create_direct_part_url),
        )
        .route(
            "/api/v1/uploads/{id}/parts/{part_number}/ack",
            post(ack_direct_part_upload),
        )
        .route("/api/v1/uploads/{id}/complete", post(complete_upload))
        .merge(media_body_routes)
}

async fn create_upload(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(request): Json<CreateUploadRequest>,
) -> Result<Json<CreateUploadResponse>, ApiError> {
    let auth = auth::require_auth(&state, &headers).await?;
    auth::require_csrf_for_cookie(&state, &headers, &auth)?;
    validate_create_request(&state.config, &request)?;

    let client_clip_id = normalized_optional_ref(request.client_clip_id.as_deref());
    if let Some(client_clip_id) = client_clip_id.as_deref() {
        if let Some(existing_session) =
            load_existing_idempotent_session(&state, &auth.user.id, client_clip_id).await?
        {
            return Ok(Json(create_response(&state.config, &existing_session)?));
        }
    }
    enforce_upload_policy(&state, &request).await?;

    let active_uploads = state
        .repositories
        .upload_sessions
        .count_active_for_user(&auth.user.id, now_utc())
        .await?;
    if active_uploads >= state.config.max_active_upload_sessions_per_user {
        return Err(ApiError::too_many_requests(
            "too many active upload sessions for this user",
        ));
    }
    enforce_user_storage_quota(&state, &auth.user, request.file_size_bytes).await?;

    let keys = MediaObjectKeys::generate().map_err(storage_error)?;
    let is_s3 = is_s3_storage(&state.config);
    let part_size_bytes = choose_part_size(
        request.file_size_bytes,
        state.config.upload_part_size_bytes,
        is_s3,
    )?;
    let mode = if request.file_size_bytes <= state.config.single_put_max_bytes {
        UploadMode::SinglePut
    } else {
        UploadMode::Chunked
    };

    let storage_upload_id = match mode {
        UploadMode::SinglePut => None,
        UploadMode::Chunked => Some(
            state
                .storage
                .create_multipart_upload(&keys.source)
                .await
                .map_err(storage_error)?,
        ),
    };

    let mut new_clip = NewClip::new(
        &auth.user.id,
        request.title.trim(),
        state.config.storage_backend_name(),
    );
    new_clip.client_clip_id = client_clip_id.clone();
    new_clip.description = normalized_optional_ref(request.description.as_deref());
    new_clip.game_name = normalized_optional_ref(request.game_name.as_deref());
    new_clip.game_id = normalized_optional_ref(request.game_id.as_deref());
    new_clip.game_executable = normalized_optional_ref(request.game_executable.as_deref());
    new_clip.source_type = normalized_optional_ref(request.source_type.as_deref());
    new_clip.recorded_at = request.recorded_at;
    new_clip.duration_ms = request.duration_ms;
    new_clip.file_size_bytes = Some(request.file_size_bytes as i64);
    new_clip.width = request.width;
    new_clip.height = request.height;
    new_clip.fps = request.fps;
    new_clip.container = Some("mp4".to_string());
    new_clip.video_codec = normalized_optional_ref(request.video_codec.as_deref());
    new_clip.audio_codec = normalized_optional_ref(request.audio_codec.as_deref());
    new_clip.checksum_sha256 = Some(request.checksum_sha256.to_ascii_lowercase());
    new_clip.visibility = request.visibility.unwrap_or_else(|| "private".to_string());
    if matches!(new_clip.visibility.as_str(), "public" | "unlisted") {
        new_clip.public_share_id = Some(generate_public_share_id());
    }
    new_clip.storage_key = Some(keys.source.as_str().to_string());
    new_clip.poster_key = Some(keys.poster.as_str().to_string());
    new_clip.thumbnail_key = Some(keys.thumbnail.as_str().to_string());

    let markers = build_clip_markers(&new_clip.id, request.markers.as_deref());
    let expires_at = now_utc() + upload_session_ttl(&state.config);
    let mut new_session = NewUploadSession::new(
        &new_clip.id,
        &auth.user.id,
        request.file_size_bytes as i64,
        keys.source.as_str(),
        expires_at,
    );
    new_session.part_size_bytes = Some(part_size_bytes as i64);
    new_session.storage_upload_id = storage_upload_id;
    new_session.checksum_sha256 = Some(request.checksum_sha256.to_ascii_lowercase());
    let storage_upload_id = new_session.storage_upload_id.clone();

    let bundle = match state
        .repositories
        .create_upload_bundle(&new_clip, &new_session, &markers)
        .await
    {
        Ok(bundle) => bundle,
        Err(error) => {
            cleanup_created_storage_upload(&state, storage_upload_id.as_deref(), &keys.source)
                .await;
            if let Some(client_clip_id) = client_clip_id.as_deref() {
                if error.is_unique_violation() {
                    if let Some(existing_session) =
                        load_existing_idempotent_session(&state, &auth.user.id, client_clip_id)
                            .await?
                    {
                        return Ok(Json(create_response(&state.config, &existing_session)?));
                    }
                    return Err(ApiError::conflict(
                        "idempotent upload is being created; retry this request",
                    ));
                }
            }
            return Err(error.into());
        }
    };
    if let Some(category) = bundle.created_game_category {
        schedule_automatic_game_category_enrichment(state.clone(), category);
    }
    let session = state
        .repositories
        .upload_sessions
        .get(&new_session.id)
        .await?
        .ok_or_else(|| ApiError::internal("created upload session is missing"))?;

    enforce_upload_limits_after_create(
        &state,
        &auth.user,
        &session,
        storage_upload_id.as_deref(),
        &keys.source,
    )
    .await?;

    Ok(Json(create_response(&state.config, &session)?))
}

async fn get_upload(
    State(state): State<AppState>,
    headers: HeaderMap,
    Path(id): Path<String>,
) -> Result<Json<UploadProgressResponse>, ApiError> {
    let auth = auth::require_auth(&state, &headers).await?;
    let (session, _clip) = load_owned_upload(&state, &auth, &id).await?;
    ensure_not_expired(&session)?;
    Ok(Json(progress_response(&state, &session).await?))
}

async fn put_content(
    State(state): State<AppState>,
    headers: HeaderMap,
    Path(id): Path<String>,
    body: Bytes,
) -> Result<Json<UploadProgressResponse>, ApiError> {
    let auth = auth::require_auth(&state, &headers).await?;
    auth::require_csrf_for_cookie(&state, &headers, &auth)?;
    require_single_put_content_type(&headers)?;

    let (session, _clip) = load_owned_upload(&state, &auth, &id).await?;
    ensure_mutable_upload(&session)?;
    if upload_mode(&session) != UploadMode::SinglePut {
        return Err(ApiError::bad_request(
            "chunked upload sessions must upload numbered parts",
        ));
    }

    let expected_size = expected_size(&session)?;
    if body.len() as u64 != expected_size {
        return Err(ApiError::bad_request(format!(
            "request body size {} does not match expected file size {expected_size}",
            body.len()
        )));
    }

    let checksum = sha256_hex(&body);
    if Some(checksum.as_str()) != session.checksum_sha256.as_deref() {
        return Err(ApiError::bad_request("whole-file SHA-256 mismatch"));
    }

    let key = ObjectKey::parse(&session.storage_key).map_err(storage_error)?;
    let mut metadata = PutObjectMetadata::new("video/mp4");
    metadata.checksum_sha256 = Some(checksum);
    let object_metadata = state
        .storage
        .put_object(&key, body, metadata)
        .await
        .map_err(storage_error)?;
    if object_metadata.size_bytes != expected_size {
        return Err(ApiError::internal(
            "storage returned an unexpected object size after single PUT",
        ));
    }

    let _ = finalize_upload_db(&state, &session).await?;
    Ok(Json(
        progress_response(
            &state,
            &state
                .repositories
                .upload_sessions
                .get(&session.id)
                .await?
                .ok_or_else(|| ApiError::conflict("upload session no longer exists"))?,
        )
        .await?,
    ))
}

async fn put_part(
    State(state): State<AppState>,
    headers: HeaderMap,
    Path((id, part_number)): Path<(String, u16)>,
    body: Bytes,
) -> Result<Json<PartUploadResponse>, ApiError> {
    let auth = auth::require_auth(&state, &headers).await?;
    auth::require_csrf_for_cookie(&state, &headers, &auth)?;
    let (session, _clip) = load_owned_upload(&state, &auth, &id).await?;
    ensure_mutable_upload(&session)?;
    let Some(storage_upload_id) = session.storage_upload_id.as_deref() else {
        return Err(ApiError::bad_request(
            "single PUT upload sessions must upload content directly",
        ));
    };
    validate_part_number_for_session(&session, part_number)?;

    let checksum = sha256_hex(&body);
    if let Some(supplied_checksum) = optional_checksum_header(&headers)? {
        if supplied_checksum != checksum {
            return Err(ApiError::bad_request(
                "part SHA-256 header does not match body",
            ));
        }
    }

    if let Some(existing) = state
        .repositories
        .upload_parts
        .get(&session.id, i64::from(part_number))
        .await?
    {
        if existing.checksum_sha256.as_deref() == Some(checksum.as_str())
            && u64::try_from(existing.size_bytes).ok() == Some(body.len() as u64)
        {
            return Ok(Json(part_response(&session.id, &existing, true)));
        }
        return Err(ApiError::conflict(
            "part number already exists with a different checksum",
        ));
    }

    validate_part_size(&state.config, &session, part_number, body.len() as u64)?;

    let key = ObjectKey::parse(&session.storage_key).map_err(storage_error)?;
    let uploaded_part = state
        .storage
        .upload_part(storage_upload_id, &key, part_number, body)
        .await
        .map_err(storage_error)?;

    let mut new_part = NewUploadPart::new(
        &session.id,
        i64::from(part_number),
        uploaded_part.size_bytes as i64,
    );
    new_part.checksum_sha256 = Some(checksum);
    new_part.etag = Some(uploaded_part.etag);
    let part = state.repositories.upload_parts.upsert(&new_part).await?;
    let received_size = state
        .repositories
        .upload_parts
        .sum_size_for_session(&session.id)
        .await?;
    if !state
        .repositories
        .upload_sessions
        .mark_uploading(&session.id, received_size)
        .await?
    {
        return Err(upload_session_no_longer_mutable(&state, &session.id).await?);
    }

    Ok(Json(part_response(&session.id, &part, false)))
}

async fn create_direct_part_url(
    State(state): State<AppState>,
    headers: HeaderMap,
    Path((id, part_number)): Path<(String, u16)>,
) -> Result<Json<DirectPartUploadUrlResponse>, ApiError> {
    let auth = auth::require_auth(&state, &headers).await?;
    auth::require_csrf_for_cookie(&state, &headers, &auth)?;
    ensure_direct_s3_uploads(&state.config)?;

    let (session, _clip) = load_owned_upload(&state, &auth, &id).await?;
    ensure_mutable_upload(&session)?;
    let Some(storage_upload_id) = session.storage_upload_id.as_deref() else {
        return Err(ApiError::bad_request(
            "single PUT upload sessions cannot use direct S3 part URLs",
        ));
    };
    validate_part_number_for_session(&session, part_number)?;
    if state
        .repositories
        .upload_parts
        .get(&session.id, i64::from(part_number))
        .await?
        .is_some()
    {
        return Err(ApiError::conflict("part number is already acknowledged"));
    }

    let key = ObjectKey::parse(&session.storage_key).map_err(storage_error)?;
    let Some(presigned) = state
        .storage
        .create_upload_part_url(
            storage_upload_id,
            &key,
            part_number,
            DIRECT_UPLOAD_PART_URL_TTL,
        )
        .await
        .map_err(storage_error)?
    else {
        return Err(ApiError::bad_request(
            "direct S3 uploads are not available for this storage backend",
        ));
    };

    Ok(Json(DirectPartUploadUrlResponse {
        upload_id: session.id.clone(),
        part_number,
        method: "PUT".to_string(),
        url: presigned.url.to_string(),
        expires_at: presigned.expires_at,
        expected_size_bytes: expected_size_for_part(&session, part_number)?,
        headers: presigned
            .headers
            .into_iter()
            .map(|header| DirectUploadHeader {
                name: header.name,
                value: header.value,
            })
            .collect(),
    }))
}

async fn ack_direct_part_upload(
    State(state): State<AppState>,
    headers: HeaderMap,
    Path((id, part_number)): Path<(String, u16)>,
    Json(request): Json<DirectPartUploadAckRequest>,
) -> Result<Json<PartUploadResponse>, ApiError> {
    let auth = auth::require_auth(&state, &headers).await?;
    auth::require_csrf_for_cookie(&state, &headers, &auth)?;
    ensure_direct_s3_uploads(&state.config)?;

    let (session, _clip) = load_owned_upload(&state, &auth, &id).await?;
    ensure_mutable_upload(&session)?;
    if session.storage_upload_id.is_none() {
        return Err(ApiError::bad_request(
            "single PUT upload sessions cannot acknowledge direct S3 parts",
        ));
    }
    validate_part_number_for_session(&session, part_number)?;

    let ack = validate_direct_part_ack(&state.config, &session, part_number, &request)?;

    if let Some(existing) = state
        .repositories
        .upload_parts
        .get(&session.id, i64::from(part_number))
        .await?
    {
        if direct_part_ack_matches_existing(&existing, &ack) {
            return Ok(Json(part_response(&session.id, &existing, true)));
        }
        return Err(ApiError::conflict(
            "part number already exists with different direct upload metadata",
        ));
    }

    let mut new_part =
        NewUploadPart::new(&session.id, i64::from(part_number), ack.size_bytes as i64);
    new_part.checksum_sha256 = Some(ack.checksum_sha256);
    new_part.etag = Some(ack.etag);
    let part = state.repositories.upload_parts.upsert(&new_part).await?;
    let received_size = state
        .repositories
        .upload_parts
        .sum_size_for_session(&session.id)
        .await?;
    if !state
        .repositories
        .upload_sessions
        .mark_uploading(&session.id, received_size)
        .await?
    {
        return Err(upload_session_no_longer_mutable(&state, &session.id).await?);
    }

    Ok(Json(part_response(&session.id, &part, false)))
}

async fn complete_upload(
    State(state): State<AppState>,
    headers: HeaderMap,
    Path(id): Path<String>,
) -> Result<Json<UploadProgressResponse>, ApiError> {
    let auth = auth::require_auth(&state, &headers).await?;
    auth::require_csrf_for_cookie(&state, &headers, &auth)?;
    let (session, _clip) = load_owned_upload(&state, &auth, &id).await?;
    if session.status == "completed" {
        let _ = finalize_upload_db(&state, &session).await?;
        let reconciled = state
            .repositories
            .upload_sessions
            .get(&session.id)
            .await?
            .ok_or_else(|| ApiError::conflict("upload session no longer exists"))?;
        return Ok(Json(progress_response(&state, &reconciled).await?));
    }
    ensure_mutable_upload(&session)?;
    let Some(storage_upload_id) = session.storage_upload_id.as_deref() else {
        return Err(ApiError::bad_request(
            "single PUT upload sessions complete through PUT /content",
        ));
    };

    let parts = state
        .repositories
        .upload_parts
        .list_for_session(&session.id)
        .await?;
    let completed_parts = validate_completed_parts(&state.config, &session, &parts)?;
    let expected_size = expected_size(&session)?;
    let key = ObjectKey::parse(&session.storage_key).map_err(storage_error)?;

    let metadata = match state
        .storage
        .complete_multipart_upload(storage_upload_id, &key, &completed_parts)
        .await
    {
        Ok(metadata) => metadata,
        Err(error) => {
            if !should_try_completion_reconciliation(&error) {
                return Err(storage_error(error));
            }
            match state.storage.head_object(&key).await {
                Ok(metadata) if metadata.size_bytes == expected_size => metadata,
                Ok(_) => {
                    let reason =
                        "stored object exists but size does not match expected upload size";
                    mark_upload_failed(&state, &session, reason).await?;
                    return Err(ApiError::conflict(reason));
                }
                Err(head_error) => return Err(storage_error(head_error)),
            }
        }
    };

    if metadata.size_bytes != expected_size {
        let reason = "completed object size does not match expected upload size";
        mark_upload_failed(&state, &session, reason).await?;
        return Err(ApiError::conflict(reason));
    }

    if !is_s3_storage(&state.config) {
        let checksum = sha256_object_hex(&state.storage, &key)
            .await
            .map_err(storage_error)?;
        if Some(checksum.as_str()) != session.checksum_sha256.as_deref() {
            let _ = state.storage.delete_object(&key).await;
            let reason = "completed local object SHA-256 does not match expected upload checksum";
            mark_upload_failed(&state, &session, reason).await?;
            return Err(ApiError::conflict(reason));
        }
    }

    let _ = finalize_upload_db(&state, &session).await?;
    let session = state
        .repositories
        .upload_sessions
        .get(&session.id)
        .await?
        .ok_or_else(|| ApiError::conflict("upload session no longer exists"))?;
    Ok(Json(progress_response(&state, &session).await?))
}

async fn abort_upload(
    State(state): State<AppState>,
    headers: HeaderMap,
    Path(id): Path<String>,
) -> Result<Json<StatusResponse>, ApiError> {
    let auth = auth::require_auth(&state, &headers).await?;
    auth::require_csrf_for_cookie(&state, &headers, &auth)?;
    let (session, clip) = load_owned_upload(&state, &auth, &id).await?;
    match state
        .repositories
        .abort_upload(&session.id, &clip.id)
        .await?
    {
        AbortUploadOutcome::Aborted | AbortUploadOutcome::AlreadyAborted => {}
        AbortUploadOutcome::NotMutable => {
            return Err(upload_session_no_longer_mutable(&state, &session.id).await?)
        }
    }

    let key = ObjectKey::parse(&session.storage_key).map_err(storage_error)?;
    if let Some(storage_upload_id) = session.storage_upload_id.as_deref() {
        if let Err(error) = state
            .storage
            .abort_multipart_upload(storage_upload_id, &key)
            .await
        {
            if !should_try_completion_reconciliation(&error) {
                return Err(storage_error(error));
            }
        }
    } else if let Err(error) = state.storage.delete_object(&key).await {
        if !matches!(error, StorageError::NotFound(_)) {
            return Err(storage_error(error));
        }
    }

    Ok(Json(StatusResponse::ok()))
}

async fn load_owned_upload(
    state: &AppState,
    auth: &AuthenticatedUser,
    upload_id: &str,
) -> Result<(UploadSession, Clip), ApiError> {
    let Some(session) = state.repositories.upload_sessions.get(upload_id).await? else {
        return Err(ApiError::not_found("upload session not found"));
    };
    if session.user_id != auth.user.id {
        return Err(ApiError::not_found("upload session not found"));
    }
    let Some(clip) = state.repositories.clips.get(&session.clip_id).await? else {
        return Err(ApiError::internal("upload session clip is missing"));
    };
    Ok((session, clip))
}

async fn load_existing_idempotent_session(
    state: &AppState,
    user_id: &str,
    client_clip_id: &str,
) -> Result<Option<UploadSession>, ApiError> {
    let Some(existing_clip) = state
        .repositories
        .clips
        .get_by_owner_client_clip_id(user_id, client_clip_id)
        .await?
    else {
        return Ok(None);
    };
    let Some(existing_session) = state
        .repositories
        .upload_sessions
        .get_by_clip_id(&existing_clip.id)
        .await?
    else {
        return Err(ApiError::conflict(
            "idempotent upload is being created; retry this request",
        ));
    };
    Ok(Some(existing_session))
}

async fn cleanup_created_storage_upload(
    state: &AppState,
    storage_upload_id: Option<&str>,
    key: &ObjectKey,
) {
    let Some(storage_upload_id) = storage_upload_id else {
        return;
    };
    if let Err(error) = state
        .storage
        .abort_multipart_upload(storage_upload_id, key)
        .await
    {
        if !matches!(error, StorageError::NotFound(_)) {
            warn!(
                event = "api.upload_orphan_cleanup_failed",
                storage_upload_id = %storage_upload_id,
                error = %error,
            );
        }
    }
}

fn validate_create_request(config: &Config, request: &CreateUploadRequest) -> Result<(), ApiError> {
    if request.title.trim().is_empty() {
        return Err(ApiError::bad_request("title is required"));
    }
    validate_optional_char_count(Some(request.title.as_str()), "title", MAX_TITLE_LEN)?;
    validate_optional_char_count(
        request.client_clip_id.as_deref(),
        "client_clip_id",
        MAX_CLIENT_CLIP_ID_LEN,
    )?;
    validate_optional_char_count(
        request.description.as_deref(),
        "description",
        MAX_DESCRIPTION_LEN,
    )?;
    for (name, value) in [
        ("game_name", request.game_name.as_deref()),
        ("game_id", request.game_id.as_deref()),
        ("game_executable", request.game_executable.as_deref()),
        ("source_type", request.source_type.as_deref()),
    ] {
        validate_optional_char_count(value, name, MAX_METADATA_FIELD_LEN)?;
    }
    for (name, value) in [
        ("video_codec", request.video_codec.as_deref()),
        ("audio_codec", request.audio_codec.as_deref()),
    ] {
        validate_optional_char_count(value, name, MAX_CODEC_LEN)?;
    }
    if request.file_size_bytes == 0 {
        return Err(ApiError::bad_request(
            "file_size_bytes must be greater than zero",
        ));
    }
    if request.file_size_bytes > config.max_upload_size_bytes {
        return Err(ApiError::bad_request("file exceeds maximum upload size"));
    }
    if request.file_size_bytes > i64::MAX as u64 {
        return Err(ApiError::bad_request(
            "file_size_bytes exceeds the supported database range",
        ));
    }
    validate_checksum(&request.checksum_sha256)?;
    if !request.container.trim().eq_ignore_ascii_case("mp4") {
        return Err(ApiError::bad_request("only mp4 uploads are supported"));
    }
    if let Some(visibility) = &request.visibility {
        match visibility.as_str() {
            "private" | "public" | "unlisted" => {}
            _ => {
                return Err(ApiError::bad_request(
                    "visibility must be private, public, or unlisted",
                ))
            }
        }
    }
    if request.duration_ms.is_some_and(|value| value < 0)
        || request.width.is_some_and(|value| value <= 0)
        || request.height.is_some_and(|value| value <= 0)
        || request.fps.is_some_and(|value| value <= 0.0)
    {
        return Err(ApiError::bad_request(
            "duration, dimensions, and fps must be positive when provided",
        ));
    }
    validate_markers(request.markers.as_deref(), request.duration_ms)?;
    Ok(())
}

fn validate_markers(
    markers: Option<&[clipline_cloud_api_types::CreateMarkerRequest]>,
    duration_ms: Option<i64>,
) -> Result<(), ApiError> {
    let Some(markers) = markers else {
        return Ok(());
    };
    if markers.len() > MAX_MARKERS {
        return Err(ApiError::bad_request(format!(
            "markers must contain {MAX_MARKERS} entries or fewer"
        )));
    }
    for marker in markers {
        if marker.kind.trim().is_empty() {
            return Err(ApiError::bad_request("marker kind is required"));
        }
        validate_optional_char_count(
            Some(marker.kind.as_str()),
            "marker kind",
            MAX_MARKER_KIND_LEN,
        )?;
        validate_optional_char_count(
            marker.label.as_deref(),
            "marker label",
            MAX_MARKER_LABEL_LEN,
        )?;
        if marker.timestamp_ms < 0
            || duration_ms.is_some_and(|duration_ms| marker.timestamp_ms > duration_ms)
        {
            return Err(ApiError::bad_request(
                "marker timestamp_ms must fall within the clip duration",
            ));
        }
        if let Some(metadata) = marker.metadata.as_ref() {
            let size = serde_json::to_vec(metadata)
                .map_err(|_| ApiError::bad_request("marker metadata is invalid"))?
                .len();
            if size > MAX_MARKER_METADATA_BYTES {
                return Err(ApiError::bad_request(format!(
                    "marker metadata must be {MAX_MARKER_METADATA_BYTES} bytes or fewer"
                )));
            }
        }
    }
    Ok(())
}

fn build_clip_markers(
    clip_id: &str,
    markers: Option<&[clipline_cloud_api_types::CreateMarkerRequest]>,
) -> Vec<NewClipMarker> {
    markers
        .unwrap_or_default()
        .iter()
        .map(|marker| {
            let mut new_marker =
                NewClipMarker::new(clip_id, marker.kind.trim(), marker.timestamp_ms);
            new_marker.label = marker
                .label
                .as_deref()
                .map(str::trim)
                .filter(|value| !value.is_empty())
                .map(ToOwned::to_owned);
            new_marker.metadata_json = marker.metadata.clone().map(sqlx::types::Json);
            new_marker
        })
        .collect()
}

async fn enforce_user_storage_quota(
    state: &AppState,
    user: &clipline_cloud_db::User,
    requested_size_bytes: u64,
) -> Result<(), ApiError> {
    let settings = state.repositories.settings.get().await?;
    let quota_bytes =
        crate::admin::effective_per_user_storage_quota_bytes(user, &settings, &state.config);
    let Some(quota_bytes) = quota_bytes else {
        return Ok(());
    };

    let used_bytes = state
        .repositories
        .clips
        .active_storage_bytes_for_owner(&user.id)
        .await?;
    let used_bytes = u64::try_from(used_bytes)
        .map_err(|_| ApiError::internal("stored user storage usage is negative"))?;
    let projected_bytes = used_bytes.saturating_add(requested_size_bytes);
    if projected_bytes > quota_bytes {
        return Err(ApiError::payload_too_large(format!(
            "upload would exceed user storage quota ({projected_bytes}/{quota_bytes} bytes)"
        )));
    }

    Ok(())
}

async fn enforce_upload_limits_after_create(
    state: &AppState,
    user: &clipline_cloud_db::User,
    session: &UploadSession,
    storage_upload_id: Option<&str>,
    key: &ObjectKey,
) -> Result<(), ApiError> {
    // This is a committed-state backstop for concurrent creates, not a
    // serializable reservation. If the visible state is over limits, undo this
    // newly-created session and any storage upload side effect.
    let active_uploads = state
        .repositories
        .upload_sessions
        .count_active_for_user(&user.id, now_utc())
        .await?;
    let result = if active_uploads > state.config.max_active_upload_sessions_per_user {
        Err(ApiError::too_many_requests(
            "too many active upload sessions for this user",
        ))
    } else {
        enforce_user_storage_quota(state, user, 0).await
    };

    if result.is_err() {
        rollback_created_upload_session(state, session, storage_upload_id, key).await;
    }

    result
}

async fn rollback_created_upload_session(
    state: &AppState,
    session: &UploadSession,
    storage_upload_id: Option<&str>,
    key: &ObjectKey,
) {
    cleanup_created_storage_upload(state, storage_upload_id, key).await;
    if let Err(error) = state
        .repositories
        .delete_upload_bundle(&session.id, &session.clip_id)
        .await
    {
        warn!(
            event = "api.upload_rejected_bundle_cleanup_failed",
            session_id = %session.id,
            clip_id = %session.clip_id,
            error = %error,
        );
    }
}

async fn enforce_upload_policy(
    state: &AppState,
    request: &CreateUploadRequest,
) -> Result<(), ApiError> {
    let settings = state.repositories.settings.get().await?;
    if settings.allow_vod_uploads {
        return Ok(());
    }

    enforce_vod_policy(
        settings.allow_vod_uploads,
        settings.vod_threshold_minutes,
        request.duration_ms,
    )
}

fn enforce_vod_policy(
    allow_vod_uploads: bool,
    vod_threshold_minutes: i64,
    duration_ms: Option<i64>,
) -> Result<(), ApiError> {
    if allow_vod_uploads {
        return Ok(());
    }

    let threshold_ms = vod_threshold_minutes
        .saturating_mul(60)
        .saturating_mul(1000);
    let Some(duration_ms) = duration_ms else {
        return Err(ApiError::bad_request(
            "duration_ms is required when full-length VOD uploads are disabled",
        ));
    };
    if duration_ms >= threshold_ms {
        return Err(ApiError::bad_request(
            "full-length VOD uploads are disabled for this instance",
        ));
    }

    Ok(())
}

fn ensure_direct_s3_uploads(config: &Config) -> Result<(), ApiError> {
    if direct_s3_uploads_available(config) {
        return Ok(());
    }
    // Config validation rejects this at startup; keep the branch as defense-in-depth for tests and
    // future config construction paths.
    if config.direct_s3_uploads {
        return Err(ApiError::bad_request(
            "direct S3 uploads require s3 storage",
        ));
    }
    Err(ApiError::bad_request("direct S3 uploads are not enabled"))
}

fn direct_s3_uploads_available(config: &Config) -> bool {
    config.direct_s3_uploads && is_s3_storage(config)
}

fn ensure_not_expired(session: &UploadSession) -> Result<(), ApiError> {
    if session.status != "completed" && session.expires_at <= now_utc() {
        return Err(ApiError::conflict("upload session has expired"));
    }
    Ok(())
}

fn ensure_mutable_upload(session: &UploadSession) -> Result<(), ApiError> {
    ensure_not_expired(session)?;
    match session.status.as_str() {
        "created" | "uploading" => Ok(()),
        "completed" => Err(ApiError::conflict("upload session is already completed")),
        "aborted" => Err(ApiError::conflict("upload session is aborted")),
        "failed" => {
            let message = match session.failure_reason.as_deref() {
                Some(reason) => format!(
                    "upload session is failed: {reason}; delete this upload and retry from a new session"
                ),
                None => "upload session is failed; delete this upload and retry from a new session"
                    .to_string(),
            };
            Err(ApiError::conflict(message))
        }
        _ => Err(ApiError::conflict("upload session is not mutable")),
    }
}

async fn progress_response(
    state: &AppState,
    session: &UploadSession,
) -> Result<UploadProgressResponse, ApiError> {
    let parts = state
        .repositories
        .upload_parts
        .list_for_session(&session.id)
        .await?;
    let received_parts = parts
        .iter()
        .map(|part| u16::try_from(part.part_number).unwrap_or_default())
        .filter(|part_number| *part_number != 0)
        .collect::<Vec<_>>();
    let mode = upload_mode(session);
    let missing_parts = if mode == UploadMode::Chunked {
        missing_parts(session, &parts)?
    } else {
        Vec::new()
    };
    let file_size_bytes = expected_size(session)?;
    let received_size_bytes = u64::try_from(session.received_size_bytes).unwrap_or_default();
    let total_parts = if mode == UploadMode::Chunked {
        part_count(session)?
    } else {
        1
    };
    let received_part_count = if mode == UploadMode::Chunked {
        saturating_u16_len(received_parts.len())
    } else if received_size_bytes > 0 || session.status == "completed" {
        1
    } else {
        0
    };
    let missing_part_count = if mode == UploadMode::Chunked {
        saturating_u16_len(missing_parts.len())
    } else if session.status == "completed" {
        0
    } else {
        1
    };
    let next_part_number = missing_parts.first().copied();

    Ok(UploadProgressResponse {
        upload_id: session.id.clone(),
        clip_id: session.clip_id.clone(),
        mode: mode.as_str().to_string(),
        status: session.status.clone(),
        file_size_bytes,
        part_size_bytes: part_size(session)?,
        received_size_bytes,
        total_parts,
        received_part_count,
        missing_part_count,
        next_part_number,
        progress_basis_points: progress_basis_points(
            session.status.as_str(),
            received_size_bytes,
            file_size_bytes,
        ),
        failure_reason: session.failure_reason.clone(),
        recovery_action: recovery_action(session.status.as_str()).map(ToOwned::to_owned),
        expires_at: session.expires_at,
        received_parts,
        missing_parts,
    })
}

fn create_response(
    config: &Config,
    session: &UploadSession,
) -> Result<CreateUploadResponse, ApiError> {
    let mode = upload_mode(session);
    let direct_upload = mode == UploadMode::Chunked && direct_s3_uploads_available(config);
    Ok(CreateUploadResponse {
        clip_id: session.clip_id.clone(),
        upload_id: session.id.clone(),
        mode: mode.as_str().to_string(),
        part_size_bytes: part_size(session)?,
        single_put_url: (mode == UploadMode::SinglePut)
            .then(|| format!("/api/v1/uploads/{}/content", session.id)),
        parts_url_template: (mode == UploadMode::Chunked)
            .then(|| format!("/api/v1/uploads/{}/parts/{{part_number}}", session.id)),
        direct_part_presign_url_template: direct_upload.then(|| {
            format!(
                "/api/v1/uploads/{}/parts/{{part_number}}/presign",
                session.id
            )
        }),
        direct_part_ack_url_template: direct_upload
            .then(|| format!("/api/v1/uploads/{}/parts/{{part_number}}/ack", session.id)),
    })
}

fn part_response(upload_id: &str, part: &UploadPart, idempotent: bool) -> PartUploadResponse {
    PartUploadResponse {
        upload_id: upload_id.to_string(),
        part_number: u16::try_from(part.part_number).unwrap_or_default(),
        size_bytes: u64::try_from(part.size_bytes).unwrap_or_default(),
        checksum_sha256: part.checksum_sha256.clone().unwrap_or_default(),
        etag: part.etag.clone(),
        idempotent,
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
struct DirectPartAck {
    size_bytes: u64,
    checksum_sha256: String,
    etag: String,
}

fn validate_direct_part_ack(
    config: &Config,
    session: &UploadSession,
    part_number: u16,
    request: &DirectPartUploadAckRequest,
) -> Result<DirectPartAck, ApiError> {
    let checksum = request.checksum_sha256.trim().to_ascii_lowercase();
    validate_checksum(&checksum)?;
    validate_part_size(config, session, part_number, request.size_bytes)?;
    let etag = normalize_direct_part_etag(&request.etag)?;
    Ok(DirectPartAck {
        size_bytes: request.size_bytes,
        checksum_sha256: checksum,
        etag,
    })
}

fn direct_part_ack_matches_existing(part: &UploadPart, ack: &DirectPartAck) -> bool {
    part.checksum_sha256.as_deref() == Some(ack.checksum_sha256.as_str())
        && u64::try_from(part.size_bytes).ok() == Some(ack.size_bytes)
        && part.etag.as_deref() == Some(ack.etag.as_str())
}

fn validate_completed_parts(
    config: &Config,
    session: &UploadSession,
    parts: &[UploadPart],
) -> Result<Vec<CompletedUploadPart>, ApiError> {
    let part_count = part_count(session)?;
    if parts.len() != usize::from(part_count) {
        return Err(ApiError::bad_request("upload is missing one or more parts"));
    }

    let mut completed_parts = Vec::with_capacity(parts.len());
    let mut total_size = 0_u64;
    for expected_number in 1..=part_count {
        let Some(part) = parts
            .iter()
            .find(|part| part.part_number == i64::from(expected_number))
        else {
            return Err(ApiError::bad_request("upload is missing one or more parts"));
        };
        let size = u64::try_from(part.size_bytes)
            .map_err(|_| ApiError::internal("stored upload part has a negative size"))?;
        validate_part_size(config, session, expected_number, size)?;
        let checksum = part
            .checksum_sha256
            .as_deref()
            .ok_or_else(|| ApiError::internal("stored upload part is missing a checksum"))?;
        validate_checksum(checksum)?;
        total_size = total_size
            .checked_add(size)
            .ok_or_else(|| ApiError::internal("upload part sizes overflowed"))?;
        completed_parts.push(CompletedUploadPart {
            part_number: expected_number,
            etag: part
                .etag
                .clone()
                .ok_or_else(|| ApiError::internal("stored upload part is missing an etag"))?,
            size_bytes: size,
        });
    }

    if total_size != expected_size(session)? {
        return Err(ApiError::bad_request(
            "sum of uploaded part sizes does not match expected file size",
        ));
    }

    Ok(completed_parts)
}

fn missing_parts(session: &UploadSession, parts: &[UploadPart]) -> Result<Vec<u16>, ApiError> {
    let received = parts
        .iter()
        .map(|part| part.part_number)
        .collect::<std::collections::BTreeSet<_>>();
    let count = part_count(session)?;
    Ok((1..=count)
        .filter(|part_number| !received.contains(&i64::from(*part_number)))
        .collect())
}

fn validate_part_number_for_session(
    session: &UploadSession,
    part_number: u16,
) -> Result<(), ApiError> {
    if part_number == 0 || u64::from(part_number) > MAX_MULTIPART_PARTS {
        return Err(ApiError::bad_request(
            "part_number must be in the range 1..=10000",
        ));
    }
    if part_number > part_count(session)? {
        return Err(ApiError::bad_request(
            "part_number exceeds expected upload part count",
        ));
    }
    Ok(())
}

fn validate_part_size(
    config: &Config,
    session: &UploadSession,
    part_number: u16,
    actual_size: u64,
) -> Result<(), ApiError> {
    let expected_size = expected_size_for_part(session, part_number)?;
    if actual_size != expected_size {
        return Err(ApiError::bad_request(format!(
            "part {part_number} size {actual_size} does not match expected size {expected_size}"
        )));
    }
    if is_s3_storage(config)
        && part_number < part_count(session)?
        && actual_size < S3_MIN_PART_SIZE_BYTES
    {
        return Err(ApiError::bad_request(
            "non-final S3 multipart parts must be at least 5 MiB",
        ));
    }
    Ok(())
}

fn expected_size_for_part(session: &UploadSession, part_number: u16) -> Result<u64, ApiError> {
    validate_part_number_for_session(session, part_number)?;
    let part_size = part_size(session)?;
    let file_size = expected_size(session)?;
    let part_start = u64::from(part_number - 1)
        .checked_mul(part_size)
        .ok_or_else(|| ApiError::internal("part offset overflowed"))?;
    let remaining = file_size
        .checked_sub(part_start)
        .ok_or_else(|| ApiError::bad_request("part_number exceeds upload size"))?;
    Ok(remaining.min(part_size))
}

fn part_count(session: &UploadSession) -> Result<u16, ApiError> {
    let part_size = part_size(session)?;
    let file_size = expected_size(session)?;
    let count = file_size.div_ceil(part_size);
    if count == 0 || count > MAX_MULTIPART_PARTS {
        return Err(ApiError::bad_request(
            "upload cannot be represented within 10000 parts",
        ));
    }
    u16::try_from(count).map_err(|_| ApiError::bad_request("too many upload parts"))
}

fn choose_part_size(
    file_size_bytes: u64,
    configured_floor: u64,
    is_s3: bool,
) -> Result<u64, ApiError> {
    let size = configured_floor
        .max(file_size_bytes.div_ceil(MAX_MULTIPART_PARTS))
        .max(if is_s3 { S3_MIN_PART_SIZE_BYTES } else { 0 });
    round_up_to_mib(size)
}

fn round_up_to_mib(value: u64) -> Result<u64, ApiError> {
    if value == 0 {
        return Ok(MIB);
    }
    value
        .checked_add(MIB - 1)
        .map(|value| (value / MIB) * MIB)
        .ok_or_else(|| ApiError::bad_request("upload part size overflowed"))
}

fn expected_size(session: &UploadSession) -> Result<u64, ApiError> {
    u64::try_from(session.expected_size_bytes)
        .map_err(|_| ApiError::internal("stored upload session has a negative expected size"))
}

fn part_size(session: &UploadSession) -> Result<u64, ApiError> {
    let Some(part_size) = session.part_size_bytes else {
        return Err(ApiError::internal(
            "upload session is missing part_size_bytes",
        ));
    };
    u64::try_from(part_size)
        .map_err(|_| ApiError::internal("stored upload session has a negative part size"))
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum UploadMode {
    SinglePut,
    Chunked,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum FinalizeUploadResult {
    Finalized,
    AlreadyCompleted,
}

impl UploadMode {
    fn as_str(self) -> &'static str {
        match self {
            Self::SinglePut => "single_put",
            Self::Chunked => "chunked",
        }
    }
}

fn upload_mode(session: &UploadSession) -> UploadMode {
    if session.storage_upload_id.is_some() {
        UploadMode::Chunked
    } else {
        UploadMode::SinglePut
    }
}

fn saturating_u16_len(value: usize) -> u16 {
    u16::try_from(value).unwrap_or(u16::MAX)
}

fn progress_basis_points(status: &str, received_size_bytes: u64, file_size_bytes: u64) -> u16 {
    if status == "completed" {
        return 10_000;
    }
    if file_size_bytes == 0 {
        return 0;
    }
    let value = (u128::from(received_size_bytes).saturating_mul(10_000))
        .checked_div(u128::from(file_size_bytes))
        .unwrap_or_default()
        .min(10_000);
    value as u16
}

async fn finalize_upload_db(
    state: &AppState,
    session: &UploadSession,
) -> Result<FinalizeUploadResult, ApiError> {
    let mut job = NewJob::new(VALIDATE_OBJECT_KIND, now_utc());
    job.target_type = Some("clip".to_string());
    job.target_id = Some(session.clip_id.clone());
    match state
        .repositories
        .finalize_upload(
            &session.id,
            &session.clip_id,
            session.expected_size_bytes,
            &job,
        )
        .await?
    {
        FinalizeUploadOutcome::Finalized => Ok(FinalizeUploadResult::Finalized),
        FinalizeUploadOutcome::AlreadyCompleted => Ok(FinalizeUploadResult::AlreadyCompleted),
        FinalizeUploadOutcome::NotMutable => {
            Err(ApiError::conflict("upload session is no longer mutable"))
        }
    }
}

async fn upload_session_no_longer_mutable(
    state: &AppState,
    session_id: &str,
) -> Result<ApiError, ApiError> {
    match state.repositories.upload_sessions.get(session_id).await? {
        Some(session) if session.status == "completed" => {
            Ok(ApiError::conflict("upload session is already completed"))
        }
        Some(session) if session.status == "aborted" => {
            Ok(ApiError::conflict("upload session is aborted"))
        }
        Some(session) if session.status == "failed" => Ok(ApiError::conflict(
            session
                .failure_reason
                .map(|reason| {
                    format!(
                        "upload session is failed: {reason}; delete this upload and retry from a new session"
                    )
                })
                .unwrap_or_else(|| {
                    "upload session is failed; delete this upload and retry from a new session"
                        .to_string()
                }),
        )),
        Some(_) => Ok(ApiError::conflict("upload session is no longer mutable")),
        None => Ok(ApiError::conflict("upload session no longer exists")),
    }
}

async fn mark_upload_failed(
    state: &AppState,
    session: &UploadSession,
    reason: &str,
) -> Result<(), ApiError> {
    state
        .repositories
        .upload_sessions
        .fail(&session.id, reason)
        .await?;
    if !state
        .repositories
        .clips
        .mark_failed(&session.clip_id)
        .await?
    {
        warn!(
            event = "api.upload_clip_mark_failed_skipped",
            clip_id = %session.clip_id,
        );
    }
    Ok(())
}

fn recovery_action(status: &str) -> Option<&'static str> {
    match status {
        "failed" => Some("delete_and_retry"),
        "created" | "uploading" => Some("retry"),
        _ => None,
    }
}

fn optional_checksum_header(headers: &HeaderMap) -> Result<Option<String>, ApiError> {
    let Some(value) = headers
        .get(PART_SHA256_HEADER)
        .and_then(|value| value.to_str().ok())
    else {
        return Ok(None);
    };
    let checksum = value.trim().to_ascii_lowercase();
    validate_checksum(&checksum)?;
    Ok(Some(checksum))
}

fn normalize_direct_part_etag(etag: &str) -> Result<String, ApiError> {
    let etag = etag.trim();
    let starts_with_quote = etag.starts_with('"');
    let ends_with_quote = etag.ends_with('"');
    let etag = match (starts_with_quote, ends_with_quote) {
        (true, true) if etag.len() >= 2 => &etag[1..etag.len() - 1],
        (true, _) | (_, true) => {
            return Err(ApiError::bad_request("etag must be an S3-style ETag"));
        }
        (false, false) => etag,
    };

    if !is_s3_style_etag(etag) {
        return Err(ApiError::bad_request("etag must be an S3-style ETag"));
    }
    Ok(etag.to_string())
}

fn is_s3_style_etag(etag: &str) -> bool {
    let (hex, suffix) = match etag.split_once('-') {
        Some((hex, suffix)) if !hex.contains('-') && !suffix.contains('-') => (hex, Some(suffix)),
        Some(_) => return false,
        None => (etag, None),
    };

    if hex.len() != 32 || !hex.bytes().all(|byte| byte.is_ascii_hexdigit()) {
        return false;
    }

    match suffix {
        Some(value) => {
            !value.is_empty() && value.bytes().all(|byte| byte.is_ascii_digit()) && value != "0"
        }
        None => true,
    }
}

fn validate_checksum(checksum: &str) -> Result<(), ApiError> {
    if checksum.len() == 64 && checksum.bytes().all(|byte| byte.is_ascii_hexdigit()) {
        return Ok(());
    }
    Err(ApiError::bad_request(
        "checksum_sha256 must be a 64-character hexadecimal SHA-256 digest",
    ))
}

fn sha256_hex(bytes: &[u8]) -> String {
    let digest = Sha256::digest(bytes);
    hex_bytes(&digest)
}

async fn sha256_object_hex(
    storage: &SharedStorageBackend,
    key: &ObjectKey,
) -> Result<String, StorageError> {
    let mut object = storage.get_object_stream(key, None).await?;
    let mut hasher = Sha256::new();
    let mut buffer = [0_u8; 64 * 1024];
    loop {
        let read = object.reader.as_mut().read(&mut buffer).await?;
        if read == 0 {
            break;
        }
        hasher.update(&buffer[..read]);
    }
    let digest = hasher.finalize();
    Ok(hex_bytes(&digest))
}

fn hex_bytes(bytes: &[u8]) -> String {
    let mut out = String::with_capacity(bytes.len() * 2);
    for byte in bytes {
        use std::fmt::Write as _;
        let _ = write!(out, "{byte:02x}");
    }
    out
}

fn require_single_put_content_type(headers: &HeaderMap) -> Result<(), ApiError> {
    let content_type = headers
        .get(header::CONTENT_TYPE)
        .and_then(|value| value.to_str().ok())
        .map(|value| value.split(';').next().unwrap_or(value).trim());
    match content_type {
        Some("video/mp4") => Ok(()),
        _ => Err(ApiError::bad_request(
            "single PUT uploads require Content-Type: video/mp4",
        )),
    }
}

fn is_s3_storage(config: &Config) -> bool {
    matches!(config.storage, StorageConfig::S3 { .. })
}

fn upload_session_ttl(config: &Config) -> ChronoDuration {
    ChronoDuration::from_std(config.upload_session_ttl)
        .unwrap_or_else(|_| ChronoDuration::hours(24))
}

fn should_try_completion_reconciliation(error: &StorageError) -> bool {
    match error {
        StorageError::NotFound(_) | StorageError::CompletionInterrupted => true,
        StorageError::Io(error) if error.kind() == std::io::ErrorKind::NotFound => true,
        StorageError::S3(message) => {
            message.contains("NoSuchUpload")
                || message.contains("NotFound")
                || message.contains("already")
                || message.contains("404")
        }
        _ => false,
    }
}

fn storage_error(error: StorageError) -> ApiError {
    match error {
        StorageError::NotFound(_) => ApiError::not_found("storage object not found"),
        StorageError::InvalidKey { .. }
        | StorageError::InvalidPart(_)
        | StorageError::InvalidRange { .. } => ApiError::bad_request(error.to_string()),
        StorageError::CompletionInterrupted => {
            warn!(event = "api.storage_retryable_error", error = %error);
            ApiError::service_unavailable_after(
                "storage operation did not finish; retry this upload request",
                STORAGE_RETRY_AFTER,
            )
        }
        StorageError::Io(error) if io_error_is_retryable(&error) => {
            warn!(event = "api.storage_retryable_error", error = %error);
            ApiError::service_unavailable_after(
                "storage is temporarily unavailable; retry this upload request later",
                STORAGE_RETRY_AFTER,
            )
        }
        StorageError::S3(message) if s3_error_is_retryable(&message) => {
            warn!(event = "api.storage_retryable_error", error = %message);
            ApiError::service_unavailable_after(
                "storage is temporarily unavailable; retry this upload request later",
                STORAGE_RETRY_AFTER,
            )
        }
        other => {
            warn!(event = "api.storage_error", error = %other);
            ApiError::internal("storage error")
        }
    }
}

fn io_error_is_retryable(error: &std::io::Error) -> bool {
    matches!(
        error.kind(),
        std::io::ErrorKind::Interrupted
            | std::io::ErrorKind::WouldBlock
            | std::io::ErrorKind::TimedOut
            | std::io::ErrorKind::ConnectionAborted
            | std::io::ErrorKind::ConnectionRefused
            | std::io::ErrorKind::ConnectionReset
            | std::io::ErrorKind::BrokenPipe
    ) || error.raw_os_error() == Some(28)
}

fn s3_error_is_retryable(message: &str) -> bool {
    let lower = message.to_ascii_lowercase();
    lower.contains("timeout")
        || lower.contains("temporar")
        || lower.contains("slowdown")
        || lower.contains("throttl")
        || lower.contains("internalerror")
        || lower.contains("serviceunavailable")
        || lower.contains("503")
        || lower.contains("500")
        || lower.contains("502")
        || lower.contains("504")
        || lower.contains("connection")
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::http::StatusCode;
    use axum::response::IntoResponse;

    fn session(part_size_bytes: i64, expected_size_bytes: i64) -> UploadSession {
        let now = now_utc();
        UploadSession {
            id: "upload".to_string(),
            clip_id: "clip".to_string(),
            user_id: "user".to_string(),
            status: "uploading".to_string(),
            expected_size_bytes,
            received_size_bytes: 0,
            part_size_bytes: Some(part_size_bytes),
            storage_key: "objects/media/token/source.mp4".to_string(),
            storage_upload_id: Some("storage-upload".to_string()),
            checksum_sha256: Some("0".repeat(64)),
            failure_reason: None,
            created_at: now,
            updated_at: now,
            completed_at: None,
            failed_at: None,
            expires_at: now + ChronoDuration::hours(1),
        }
    }

    fn s3_direct_config() -> Config {
        let mut config = Config::for_tests("sqlite:///tmp/clipline-upload-test.db", "/tmp");
        config.direct_s3_uploads = true;
        config.storage = StorageConfig::S3 {
            endpoint: "http://localhost:9000".to_string(),
            bucket: "clipline".to_string(),
            region: "us-east-1".to_string(),
            access_key_id: "access".to_string(),
            secret_access_key: "secret".to_string(),
            force_path_style: true,
            prefix: None,
        };
        config
    }

    fn error_status(result: Result<(), ApiError>) -> StatusCode {
        result
            .expect_err("expected handler error")
            .into_response()
            .status()
    }

    #[test]
    fn part_size_rounds_up_to_mib_and_respects_s3_minimum() {
        assert_eq!(choose_part_size(1, 1, false).unwrap(), MIB);
        assert_eq!(choose_part_size(100 * MIB, 8 * MIB, true).unwrap(), 8 * MIB);
        assert_eq!(choose_part_size(100 * MIB, MIB, true).unwrap(), 5 * MIB);
    }

    #[test]
    fn part_size_respects_ten_thousand_part_ceiling() {
        let file_size = (10_000 * 8 * MIB) + 1;
        assert_eq!(
            choose_part_size(file_size, 8 * MIB, false).unwrap(),
            9 * MIB
        );
    }

    #[test]
    fn missing_parts_reports_gaps() {
        let session = session(4, 10);
        let now = now_utc();
        let parts = vec![
            UploadPart {
                upload_session_id: session.id.clone(),
                part_number: 1,
                size_bytes: 4,
                checksum_sha256: Some("a".repeat(64)),
                etag: Some("etag-1".to_string()),
                received_at: now,
            },
            UploadPart {
                upload_session_id: session.id.clone(),
                part_number: 3,
                size_bytes: 2,
                checksum_sha256: Some("b".repeat(64)),
                etag: Some("etag-3".to_string()),
                received_at: now,
            },
        ];

        assert_eq!(missing_parts(&session, &parts).unwrap(), vec![2]);
    }

    #[test]
    fn progress_basis_points_are_clamped_and_completed_is_full() {
        assert_eq!(progress_basis_points("uploading", 25, 100), 2_500);
        assert_eq!(progress_basis_points("uploading", 150, 100), 10_000);
        assert_eq!(progress_basis_points("created", 0, 0), 0);
        assert_eq!(progress_basis_points("completed", 0, 100), 10_000);
    }

    #[test]
    fn upload_markers_are_validated_and_converted_for_persistence() {
        let markers = vec![clipline_cloud_api_types::CreateMarkerRequest {
            kind: " kill ".to_string(),
            label: Some(" First blood ".to_string()),
            timestamp_ms: 750,
            metadata: Some(serde_json::json!({ "weapon": "rail" })),
        }];

        validate_markers(Some(&markers), Some(1_000)).expect("valid markers");
        let converted = build_clip_markers("clip", Some(&markers));

        assert_eq!(converted.len(), 1);
        assert_eq!(converted[0].clip_id, "clip");
        assert_eq!(converted[0].kind, "kill");
        assert_eq!(converted[0].label.as_deref(), Some("First blood"));
        assert_eq!(
            converted[0].metadata_json.as_ref().map(|value| &value.0),
            markers[0].metadata.as_ref()
        );
    }

    #[test]
    fn upload_markers_must_fit_within_clip_duration() {
        let markers = vec![clipline_cloud_api_types::CreateMarkerRequest {
            kind: "kill".to_string(),
            label: None,
            timestamp_ms: 1_001,
            metadata: None,
        }];

        assert_eq!(
            error_status(validate_markers(Some(&markers), Some(1_000))),
            StatusCode::BAD_REQUEST
        );
    }

    #[test]
    fn create_response_advertises_direct_s3_templates_only_when_enabled() {
        let upload = session(4, 10);
        let local_config = Config::for_tests("sqlite:///tmp/clipline-upload-test.db", "/tmp");

        let response = create_response(&local_config, &upload).expect("local response");
        assert!(response.direct_part_presign_url_template.is_none());
        assert!(response.direct_part_ack_url_template.is_none());

        let s3_config = s3_direct_config();

        let response = create_response(&s3_config, &upload).expect("s3 response");
        assert_eq!(
            response.direct_part_presign_url_template.as_deref(),
            Some("/api/v1/uploads/upload/parts/{part_number}/presign")
        );
        assert_eq!(
            response.direct_part_ack_url_template.as_deref(),
            Some("/api/v1/uploads/upload/parts/{part_number}/ack")
        );
    }

    #[test]
    fn vod_policy_blocks_threshold_and_missing_duration_when_disabled() {
        assert!(enforce_vod_policy(false, 30, Some(29 * 60 * 1000)).is_ok());
        assert_eq!(
            error_status(enforce_vod_policy(false, 30, Some(30 * 60 * 1000))),
            StatusCode::BAD_REQUEST
        );
        assert_eq!(
            error_status(enforce_vod_policy(false, 30, None)),
            StatusCode::BAD_REQUEST
        );
        assert!(enforce_vod_policy(true, 30, None).is_ok());
    }

    #[test]
    fn direct_s3_gate_requires_enabled_s3_storage() {
        let local_config = Config::for_tests("sqlite:///tmp/clipline-upload-test.db", "/tmp");
        let err = ensure_direct_s3_uploads(&local_config).expect_err("disabled");
        assert_eq!(err.into_response().status(), StatusCode::BAD_REQUEST);

        let mut invalid_config = local_config;
        invalid_config.direct_s3_uploads = true;
        let err = ensure_direct_s3_uploads(&invalid_config).expect_err("not s3");
        assert_eq!(err.into_response().status(), StatusCode::BAD_REQUEST);

        assert!(ensure_direct_s3_uploads(&s3_direct_config()).is_ok());
    }

    #[test]
    fn direct_part_ack_validation_rejects_bad_metadata() {
        let config = s3_direct_config();
        let upload = session(5 * MIB as i64, 5 * MIB as i64);
        let valid_etag = "0123456789abcdef0123456789abcdef";
        let valid = DirectPartUploadAckRequest {
            size_bytes: 5 * MIB,
            checksum_sha256: "a".repeat(64),
            etag: valid_etag.to_string(),
        };

        let ack = validate_direct_part_ack(&config, &upload, 1, &valid).expect("valid ack");
        assert_eq!(ack.size_bytes, 5 * MIB);
        assert_eq!(ack.checksum_sha256, "a".repeat(64));
        assert_eq!(ack.etag, valid_etag);

        let mut bad_checksum = valid.clone();
        bad_checksum.checksum_sha256 = "not-a-checksum".to_string();
        assert!(validate_direct_part_ack(&config, &upload, 1, &bad_checksum).is_err());

        let mut bad_size = valid.clone();
        bad_size.size_bytes = 1;
        assert!(validate_direct_part_ack(&config, &upload, 1, &bad_size).is_err());

        let mut bad_etag = valid;
        bad_etag.etag = "bad etag".to_string();
        assert!(validate_direct_part_ack(&config, &upload, 1, &bad_etag).is_err());
    }

    #[test]
    fn direct_part_ack_matching_detects_idempotent_and_conflicting_metadata() {
        let etag = "0123456789abcdef0123456789abcdef";
        let existing = UploadPart {
            upload_session_id: "upload".to_string(),
            part_number: 1,
            size_bytes: 5 * MIB as i64,
            checksum_sha256: Some("a".repeat(64)),
            etag: Some(etag.to_string()),
            received_at: now_utc(),
        };
        let ack = DirectPartAck {
            size_bytes: 5 * MIB,
            checksum_sha256: "a".repeat(64),
            etag: etag.to_string(),
        };

        assert!(direct_part_ack_matches_existing(&existing, &ack));

        let mut different_checksum = ack.clone();
        different_checksum.checksum_sha256 = "b".repeat(64);
        assert!(!direct_part_ack_matches_existing(
            &existing,
            &different_checksum
        ));

        let mut different_size = ack.clone();
        different_size.size_bytes -= 1;
        assert!(!direct_part_ack_matches_existing(
            &existing,
            &different_size
        ));

        let mut different_etag = ack;
        different_etag.etag = "fedcba9876543210fedcba9876543210".to_string();
        assert!(!direct_part_ack_matches_existing(
            &existing,
            &different_etag
        ));
    }

    #[test]
    fn direct_part_etag_normalization_accepts_s3_style_etags() {
        assert_eq!(
            normalize_direct_part_etag(r#" "0123456789abcdef0123456789abcdef" "#).expect("etag"),
            "0123456789abcdef0123456789abcdef"
        );
        assert_eq!(
            normalize_direct_part_etag("0123456789ABCDEF0123456789ABCDEF-2").expect("multipart"),
            "0123456789ABCDEF0123456789ABCDEF-2"
        );
        assert!(normalize_direct_part_etag("").is_err());
        assert!(normalize_direct_part_etag("\"").is_err());
        assert!(normalize_direct_part_etag("abc123").is_err());
        assert!(normalize_direct_part_etag("bad\netag").is_err());
        assert!(normalize_direct_part_etag("0123456789abcdef0123456789abcdef-0").is_err());
        assert!(normalize_direct_part_etag("0123456789abcdef0123456789abcdef-2-3").is_err());
    }

    #[test]
    fn recovery_action_marks_failed_uploads_delete_and_retry() {
        assert_eq!(recovery_action("uploading"), Some("retry"));
        assert_eq!(recovery_action("failed"), Some("delete_and_retry"));
        assert_eq!(recovery_action("completed"), None);
    }

    #[test]
    fn retryable_storage_errors_are_service_unavailable() {
        let error = storage_error(StorageError::CompletionInterrupted);
        let response = error.into_response();
        assert_eq!(response.status(), StatusCode::SERVICE_UNAVAILABLE);
        assert_eq!(
            response
                .headers()
                .get(axum::http::header::RETRY_AFTER)
                .and_then(|value| value.to_str().ok()),
            Some("10")
        );
    }

    #[test]
    fn permanent_storage_errors_are_internal() {
        let error = storage_error(StorageError::S3("AccessDenied".to_string()));
        let response = error.into_response();
        assert_eq!(response.status(), StatusCode::INTERNAL_SERVER_ERROR);

        let error = storage_error(StorageError::Url(
            url::Url::parse("://not-a-url").expect_err("invalid url"),
        ));
        let response = error.into_response();
        assert_eq!(response.status(), StatusCode::INTERNAL_SERVER_ERROR);
    }

    #[test]
    fn transient_s3_errors_are_service_unavailable() {
        let error = storage_error(StorageError::S3("ServiceUnavailable: 503".to_string()));
        let response = error.into_response();
        assert_eq!(response.status(), StatusCode::SERVICE_UNAVAILABLE);
    }

    #[test]
    fn automatic_artwork_failure_leaves_that_slot_empty() {
        assert!(automatic_artwork_result(
            "category",
            "icon",
            Err(ApiError::bad_gateway("upstream unavailable")),
        )
        .is_none());
    }
}
