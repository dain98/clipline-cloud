use axum::{
    body::Bytes,
    extract::{Path, State},
    http::{header, HeaderMap},
    routing::{get, post, put},
    Json, Router,
};
use chrono::Duration as ChronoDuration;
use clipline_cloud_api_types::{
    CreateUploadRequest, CreateUploadResponse, PartUploadResponse, UploadProgressResponse,
};
use clipline_cloud_core::jobs::enqueue_validate_object;
use clipline_cloud_db::{
    now_utc, Clip, NewClip, NewClipMarker, NewUploadPart, NewUploadSession, UploadPart,
    UploadSession,
};
use clipline_cloud_storage::{
    CompletedUploadPart, MediaObjectKeys, ObjectKey, PutObjectMetadata, StorageError,
};
use serde_json::json;
use sha2::{Digest, Sha256};
use tracing::warn;

use crate::{
    auth::{self, ApiError, AuthenticatedUser},
    config::{Config, StorageConfig},
    AppState,
};

const MIB: u64 = 1024 * 1024;
const S3_MIN_PART_SIZE_BYTES: u64 = 5 * MIB;
const MAX_MULTIPART_PARTS: u64 = 10_000;
const PART_SHA256_HEADER: &str = "x-clipline-part-sha256";

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/api/v1/uploads", post(create_upload))
        .route("/api/v1/uploads/{id}", get(get_upload).delete(abort_upload))
        .route("/api/v1/uploads/{id}/content", put(put_content))
        .route("/api/v1/uploads/{id}/parts/{part_number}", put(put_part))
        .route("/api/v1/uploads/{id}/complete", post(complete_upload))
}

async fn create_upload(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(request): Json<CreateUploadRequest>,
) -> Result<Json<CreateUploadResponse>, ApiError> {
    let auth = auth::require_auth(&state, &headers).await?;
    auth::require_csrf_for_cookie(&state, &headers, &auth)?;
    validate_create_request(&state.config, &request)?;

    if let Some(client_clip_id) = normalized_optional(&request.client_clip_id) {
        if let Some(existing_clip) = state
            .repositories
            .clips
            .get_by_owner_client_clip_id(&auth.user.id, &client_clip_id)
            .await?
        {
            let Some(existing_session) = state
                .repositories
                .upload_sessions
                .get_by_clip_id(&existing_clip.id)
                .await?
            else {
                return Err(ApiError::conflict(
                    "existing idempotent clip is missing an upload session",
                ));
            };
            return Ok(Json(create_response(&existing_session)?));
        }
    }

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
    enforce_user_storage_quota(&state, &auth.user.id, request.file_size_bytes).await?;

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
    new_clip.client_clip_id = normalized_optional(&request.client_clip_id);
    new_clip.game_name = normalized_optional(&request.game_name);
    new_clip.game_id = normalized_optional(&request.game_id);
    new_clip.game_executable = normalized_optional(&request.game_executable);
    new_clip.source_type = normalized_optional(&request.source_type);
    new_clip.recorded_at = request.recorded_at;
    new_clip.duration_ms = request.duration_ms;
    new_clip.file_size_bytes = Some(request.file_size_bytes as i64);
    new_clip.width = request.width;
    new_clip.height = request.height;
    new_clip.fps = request.fps;
    new_clip.container = Some("mp4".to_string());
    new_clip.video_codec = normalized_optional(&request.video_codec);
    new_clip.audio_codec = normalized_optional(&request.audio_codec);
    new_clip.checksum_sha256 = Some(request.checksum_sha256.to_ascii_lowercase());
    new_clip.visibility = request.visibility.unwrap_or_else(|| "private".to_string());
    new_clip.storage_key = Some(keys.source.as_str().to_string());
    new_clip.poster_key = Some(keys.poster.as_str().to_string());
    new_clip.thumbnail_key = Some(keys.thumbnail.as_str().to_string());

    let clip = state.repositories.clips.create(&new_clip).await?;
    for marker in request.markers.unwrap_or_default() {
        let mut new_marker = NewClipMarker::new(&clip.id, marker.kind.trim(), marker.timestamp_ms);
        new_marker.label = normalized_optional(&marker.label);
        new_marker.metadata_json = marker.metadata.map(sqlx::types::Json);
        state.repositories.clip_markers.create(&new_marker).await?;
    }

    let expires_at = now_utc() + upload_session_ttl(&state.config);
    let mut new_session = NewUploadSession::new(
        &clip.id,
        &auth.user.id,
        request.file_size_bytes as i64,
        keys.source.as_str(),
        expires_at,
    );
    new_session.part_size_bytes = Some(part_size_bytes as i64);
    new_session.storage_upload_id = storage_upload_id;
    new_session.checksum_sha256 = Some(request.checksum_sha256.to_ascii_lowercase());
    let session = state
        .repositories
        .upload_sessions
        .create(&new_session)
        .await?;

    Ok(Json(create_response(&session)?))
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

    finalize_upload_db(&state, &session).await?;
    Ok(Json(
        progress_response(
            &state,
            &state
                .repositories
                .upload_sessions
                .get(&session.id)
                .await?
                .expect("finalized upload session should exist"),
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
    state
        .repositories
        .upload_sessions
        .mark_uploading(&session.id, received_size)
        .await?;

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
        return Ok(Json(progress_response(&state, &session).await?));
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
                    return Err(ApiError::conflict(
                        "stored object exists but size does not match expected upload size",
                    ))
                }
                Err(head_error) => return Err(storage_error(head_error)),
            }
        }
    };

    if metadata.size_bytes != expected_size {
        return Err(ApiError::conflict(
            "completed object size does not match expected upload size",
        ));
    }

    if !is_s3_storage(&state.config) {
        let stored = state
            .storage
            .get_object(&key, None)
            .await
            .map_err(storage_error)?;
        let checksum = sha256_hex(&stored.bytes);
        if Some(checksum.as_str()) != session.checksum_sha256.as_deref() {
            let _ = state.storage.delete_object(&key).await;
            state.repositories.upload_sessions.fail(&session.id).await?;
            return Err(ApiError::conflict(
                "completed local object SHA-256 does not match expected upload checksum",
            ));
        }
    }

    finalize_upload_db(&state, &session).await?;
    let session = state
        .repositories
        .upload_sessions
        .get(&session.id)
        .await?
        .expect("finalized upload session should exist");
    Ok(Json(progress_response(&state, &session).await?))
}

async fn abort_upload(
    State(state): State<AppState>,
    headers: HeaderMap,
    Path(id): Path<String>,
) -> Result<Json<serde_json::Value>, ApiError> {
    let auth = auth::require_auth(&state, &headers).await?;
    auth::require_csrf_for_cookie(&state, &headers, &auth)?;
    let (session, clip) = load_owned_upload(&state, &auth, &id).await?;
    if session.status == "completed" {
        return Err(ApiError::conflict("completed uploads cannot be aborted"));
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

    state
        .repositories
        .upload_parts
        .delete_for_session(&session.id)
        .await?;
    state
        .repositories
        .upload_sessions
        .abort(&session.id)
        .await?;
    state.repositories.clips.soft_delete(&clip.id).await?;
    Ok(Json(json!({ "status": "ok" })))
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

fn validate_create_request(config: &Config, request: &CreateUploadRequest) -> Result<(), ApiError> {
    if request.title.trim().is_empty() {
        return Err(ApiError::bad_request("title is required"));
    }
    if request.file_size_bytes == 0 {
        return Err(ApiError::bad_request(
            "file_size_bytes must be greater than zero",
        ));
    }
    if request.file_size_bytes > config.max_upload_size_bytes {
        return Err(ApiError::bad_request("file exceeds maximum upload size"));
    }
    validate_checksum(&request.checksum_sha256)?;
    if request.container.trim().to_ascii_lowercase() != "mp4" {
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
    for marker in request.markers.as_deref().unwrap_or_default() {
        if marker.kind.trim().is_empty() || marker.timestamp_ms < 0 {
            return Err(ApiError::bad_request(
                "markers require a kind and a non-negative timestamp",
            ));
        }
    }

    Ok(())
}

async fn enforce_user_storage_quota(
    state: &AppState,
    user_id: &str,
    requested_size_bytes: u64,
) -> Result<(), ApiError> {
    let Some(quota_bytes) = state.config.user_storage_quota_bytes else {
        return Ok(());
    };

    let used_bytes = state
        .repositories
        .clips
        .active_storage_bytes_for_owner(user_id)
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
        "failed" => Err(ApiError::conflict("upload session is failed")),
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
    let missing_parts = if upload_mode(session) == UploadMode::Chunked {
        missing_parts(session, &parts)?
    } else {
        Vec::new()
    };

    Ok(UploadProgressResponse {
        upload_id: session.id.clone(),
        clip_id: session.clip_id.clone(),
        mode: upload_mode(session).as_str().to_string(),
        status: session.status.clone(),
        file_size_bytes: expected_size(session)?,
        part_size_bytes: part_size(session)?,
        received_size_bytes: u64::try_from(session.received_size_bytes).unwrap_or_default(),
        received_parts,
        missing_parts,
    })
}

fn create_response(session: &UploadSession) -> Result<CreateUploadResponse, ApiError> {
    let mode = upload_mode(session);
    Ok(CreateUploadResponse {
        clip_id: session.clip_id.clone(),
        upload_id: session.id.clone(),
        mode: mode.as_str().to_string(),
        part_size_bytes: part_size(session)?,
        single_put_url: (mode == UploadMode::SinglePut)
            .then(|| format!("/api/v1/uploads/{}/content", session.id)),
        parts_url_template: (mode == UploadMode::Chunked)
            .then(|| format!("/api/v1/uploads/{}/parts/{{part_number}}", session.id)),
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

async fn finalize_upload_db(state: &AppState, session: &UploadSession) -> Result<(), ApiError> {
    state
        .repositories
        .upload_sessions
        .update_received_size(&session.id, session.expected_size_bytes)
        .await?;
    state
        .repositories
        .upload_sessions
        .complete(&session.id)
        .await?;
    let transitioned = state
        .repositories
        .clips
        .mark_uploaded_processing(&session.clip_id)
        .await?;
    if !transitioned {
        return Err(ApiError::conflict(
            "clip could not transition into processing",
        ));
    }

    enqueue_validate_object(&state.repositories, &session.clip_id)
        .await
        .map_err(|error| {
            warn!(event = "api.job_enqueue_error", error = %error);
            ApiError::internal("failed to enqueue validation job")
        })?;
    Ok(())
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
    let mut out = String::with_capacity(digest.len() * 2);
    for byte in digest {
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

fn normalized_optional(value: &Option<String>) -> Option<String> {
    value
        .as_deref()
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .map(ToOwned::to_owned)
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
        StorageError::InvalidKey { .. } | StorageError::InvalidPart(_) => {
            ApiError::bad_request(error.to_string())
        }
        other => {
            warn!(event = "api.storage_error", error = %other);
            ApiError::internal("storage error")
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

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
            created_at: now,
            updated_at: now,
            completed_at: None,
            expires_at: now + ChronoDuration::hours(1),
        }
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
}
