use axum::{
    body::{Body, Bytes},
    extract::{Path, State},
    http::{header, HeaderMap, HeaderName, HeaderValue, StatusCode},
    response::{IntoResponse, Response},
    routing::get,
    Json, Router,
};
use chrono::{DateTime, Utc};
use clipline_cloud_db::Clip;
use clipline_cloud_storage::{
    ByteRange, ContentRange, ObjectKey, ObjectMetadata, StorageError, StoredObject,
};
use serde::Serialize;
use tracing::warn;
use url::Url;

use crate::{
    auth::{self, ApiError},
    config::PublicMediaMode,
    AppState,
};

const COPY_NOTICE: &str =
    "Public clips are not DRM-protected. Anyone who can view this clip can copy the media.";
const PLACEHOLDER_ETAG: &str = "clipline-placeholder-v1";
const PLACEHOLDER_SVG: &str = r##"<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360" role="img" aria-label="Clip preview placeholder"><rect width="640" height="360" fill="#161a1d"/><rect x="268" y="128" width="104" height="104" rx="8" fill="#2f3940"/><path d="M307 153v54l45-27z" fill="#d9e2e7"/><text x="320" y="276" fill="#a9b6bd" font-family="Arial, sans-serif" font-size="22" text-anchor="middle">Preview processing</text></svg>"##;

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/api/v1/clips/{id}/media", get(get_owned_media))
        .route("/api/v1/clips/{id}/thumbnail", get(get_owned_thumbnail))
        .route("/api/v1/clips/{id}/poster", get(get_owned_poster))
        .route("/api/v1/public/clips/{share_id}", get(get_public_clip))
        .route(
            "/api/v1/public/clips/{share_id}/media",
            get(get_public_media),
        )
        .route(
            "/api/v1/public/clips/{share_id}/thumbnail",
            get(get_public_thumbnail),
        )
}

#[derive(Debug, Serialize)]
struct PublicMarker {
    kind: String,
    label: Option<String>,
    timestamp_ms: i64,
}

#[derive(Debug, Serialize)]
struct PublicClipResponse {
    share_id: String,
    title: String,
    game_name: Option<String>,
    game_id: Option<String>,
    recorded_at: Option<DateTime<Utc>>,
    uploaded_at: Option<DateTime<Utc>>,
    duration_ms: Option<i64>,
    media_url: String,
    thumbnail_url: String,
    share_url: String,
    copy_notice: &'static str,
    has_thumbnail: bool,
    markers: Vec<PublicMarker>,
}

#[derive(Debug, Clone, Copy)]
enum CacheScope {
    Owner,
    Public,
}

async fn get_owned_media(
    State(state): State<AppState>,
    headers: HeaderMap,
    Path(id): Path<String>,
) -> Result<Response, ApiError> {
    let auth = auth::require_auth(&state, &headers).await?;
    let Some(clip) = state
        .repositories
        .clips
        .get_owned_ready(&auth.user.id, &id)
        .await?
    else {
        return Err(ApiError::not_found("clip not found"));
    };

    serve_clip_media(&state, &headers, &clip, CacheScope::Owner).await
}

async fn get_owned_thumbnail(
    State(state): State<AppState>,
    headers: HeaderMap,
    Path(id): Path<String>,
) -> Result<Response, ApiError> {
    let auth = auth::require_auth(&state, &headers).await?;
    let clip = ensure_owned_ready_clip(&state, &auth.user.id, &id).await?;
    serve_clip_image_or_placeholder(
        &state,
        &headers,
        &clip,
        clip.thumbnail_key.as_deref(),
        CacheScope::Owner,
    )
    .await
}

async fn get_owned_poster(
    State(state): State<AppState>,
    headers: HeaderMap,
    Path(id): Path<String>,
) -> Result<Response, ApiError> {
    let auth = auth::require_auth(&state, &headers).await?;
    let clip = ensure_owned_ready_clip(&state, &auth.user.id, &id).await?;
    serve_clip_image_or_placeholder(
        &state,
        &headers,
        &clip,
        clip.poster_key.as_deref(),
        CacheScope::Owner,
    )
    .await
}

async fn get_public_clip(
    State(state): State<AppState>,
    Path(share_id): Path<String>,
) -> Result<Json<PublicClipResponse>, ApiError> {
    let clip = load_public_clip(&state, &share_id).await?;
    let has_thumbnail = clip.thumbnail_key.is_some();
    let markers = state
        .repositories
        .clip_markers
        .list_for_clip(&clip.id)
        .await?
        .into_iter()
        .map(|m| PublicMarker {
            kind: m.kind,
            label: m.label,
            timestamp_ms: m.timestamp_ms,
        })
        .collect();
    Ok(Json(PublicClipResponse {
        share_id: share_id.clone(),
        title: clip.title,
        game_name: clip.game_name,
        game_id: clip.game_id,
        recorded_at: clip.recorded_at,
        uploaded_at: clip.uploaded_at,
        duration_ms: clip.duration_ms,
        media_url: absolute_url(&state, &format!("api/v1/public/clips/{share_id}/media")),
        thumbnail_url: absolute_url(&state, &format!("api/v1/public/clips/{share_id}/thumbnail")),
        share_url: absolute_url(&state, &format!("c/{share_id}")),
        copy_notice: COPY_NOTICE,
        has_thumbnail,
        markers,
    }))
}

async fn get_public_media(
    State(state): State<AppState>,
    headers: HeaderMap,
    Path(share_id): Path<String>,
) -> Result<Response, ApiError> {
    let clip = load_public_clip(&state, &share_id).await?;

    if state.config.public_media_mode == PublicMediaMode::Presigned {
        let key = clip_source_key(&clip)?;
        let metadata = state
            .storage
            .head_object(&key)
            .await
            .map_err(storage_error)?;
        if let Some(url) = state
            .storage
            .create_read_url(&key, state.config.public_read_url_ttl)
            .await
            .map_err(storage_error)?
        {
            return Ok(presigned_redirect_response(url, &metadata));
        }
    }

    serve_clip_media(&state, &headers, &clip, CacheScope::Public).await
}

async fn get_public_thumbnail(
    State(state): State<AppState>,
    headers: HeaderMap,
    Path(share_id): Path<String>,
) -> Result<Response, ApiError> {
    let clip = load_public_clip(&state, &share_id).await?;
    serve_clip_image_or_placeholder(
        &state,
        &headers,
        &clip,
        clip.thumbnail_key.as_deref(),
        CacheScope::Public,
    )
    .await
}

async fn ensure_owned_ready_clip(
    state: &AppState,
    owner_user_id: &str,
    clip_id: &str,
) -> Result<Clip, ApiError> {
    let Some(clip) = state
        .repositories
        .clips
        .get_owned_ready(owner_user_id, clip_id)
        .await?
    else {
        return Err(ApiError::not_found("clip not found"));
    };
    Ok(clip)
}

async fn load_public_clip(state: &AppState, share_id: &str) -> Result<Clip, ApiError> {
    let Some(clip) = state
        .repositories
        .clips
        .get_by_public_share_id(share_id)
        .await?
    else {
        return Err(ApiError::not_found("clip not found"));
    };
    Ok(clip)
}

async fn serve_clip_media(
    state: &AppState,
    headers: &HeaderMap,
    clip: &Clip,
    scope: CacheScope,
) -> Result<Response, ApiError> {
    let key = clip_source_key(clip)?;
    let metadata = state
        .storage
        .head_object(&key)
        .await
        .map_err(storage_error)?;
    let range = match parse_range_header(headers, metadata.size_bytes) {
        Ok(range) => range,
        Err(()) => return Ok(range_not_satisfiable_response(&metadata, scope)),
    };

    if range.is_none() && etag_matches(headers, metadata.etag.as_deref()) {
        return Ok(not_modified_response(&metadata, scope));
    }

    let object = match state.storage.get_object(&key, range).await {
        Ok(object) => object,
        Err(StorageError::InvalidRange { .. }) => {
            return Ok(range_not_satisfiable_response(&metadata, scope));
        }
        Err(error) => return Err(storage_error(error)),
    };
    Ok(media_response(object, scope))
}

async fn serve_clip_image_or_placeholder(
    state: &AppState,
    headers: &HeaderMap,
    clip: &Clip,
    storage_key: Option<&str>,
    scope: CacheScope,
) -> Result<Response, ApiError> {
    let Some(storage_key) = storage_key else {
        return Ok(placeholder_response(headers));
    };
    let key = match ObjectKey::parse(storage_key) {
        Ok(key) => key,
        Err(error) => {
            warn!(event = "media.invalid_artifact_key", clip_id = %clip.id, error = %error);
            return Ok(placeholder_response(headers));
        }
    };
    let metadata = match state.storage.head_object(&key).await {
        Ok(metadata) => metadata,
        Err(StorageError::NotFound(_)) => return Ok(placeholder_response(headers)),
        Err(error) => return Err(storage_error(error)),
    };
    if etag_matches(headers, metadata.etag.as_deref()) {
        return Ok(not_modified_response(&metadata, scope));
    }

    match state.storage.get_object(&key, None).await {
        Ok(object) => Ok(media_response(object, scope)),
        Err(StorageError::NotFound(_)) => Ok(placeholder_response(headers)),
        Err(error) => Err(storage_error(error)),
    }
}

fn clip_source_key(clip: &Clip) -> Result<ObjectKey, ApiError> {
    let Some(storage_key) = clip.storage_key.as_deref() else {
        return Err(ApiError::not_found("media not found"));
    };
    ObjectKey::parse(storage_key).map_err(|error| {
        warn!(event = "media.invalid_storage_key", clip_id = %clip.id, error = %error);
        ApiError::internal("invalid media storage key")
    })
}

fn media_response(object: StoredObject, scope: CacheScope) -> Response {
    let status = if object.content_range.is_some() {
        StatusCode::PARTIAL_CONTENT
    } else {
        StatusCode::OK
    };
    let body_len = object.bytes.len();
    let mut response = Response::builder()
        .status(status)
        .body(Body::from(object.bytes))
        .expect("media response should be valid");
    insert_media_headers(
        response.headers_mut(),
        &object.metadata,
        object.content_range.as_ref(),
        Some(body_len),
        scope,
    );
    response
}

fn not_modified_response(metadata: &ObjectMetadata, scope: CacheScope) -> Response {
    let mut response = StatusCode::NOT_MODIFIED.into_response();
    insert_media_headers(response.headers_mut(), metadata, None, None, scope);
    response
}

fn range_not_satisfiable_response(metadata: &ObjectMetadata, scope: CacheScope) -> Response {
    let mut response = Response::builder()
        .status(StatusCode::RANGE_NOT_SATISFIABLE)
        .body(Body::empty())
        .expect("range response should be valid");
    insert_media_headers(response.headers_mut(), metadata, None, Some(0), scope);
    insert_header_str(
        response.headers_mut(),
        header::CONTENT_RANGE,
        format!("bytes */{}", metadata.size_bytes),
    );
    response
}

fn presigned_redirect_response(url: Url, metadata: &ObjectMetadata) -> Response {
    let mut response = Response::builder()
        .status(StatusCode::TEMPORARY_REDIRECT)
        .header(header::LOCATION, url.as_str())
        .body(Body::empty())
        .expect("redirect response should be valid");
    insert_media_headers(
        response.headers_mut(),
        metadata,
        None,
        Some(0),
        CacheScope::Public,
    );
    response
}

fn insert_media_headers(
    headers: &mut HeaderMap,
    metadata: &ObjectMetadata,
    content_range: Option<&ContentRange>,
    content_length: Option<usize>,
    scope: CacheScope,
) {
    headers.insert(header::ACCEPT_RANGES, HeaderValue::from_static("bytes"));
    insert_header_str(headers, header::CONTENT_TYPE, &metadata.content_type);
    headers.insert(
        header::CACHE_CONTROL,
        HeaderValue::from_static(media_cache_control(scope)),
    );
    headers.insert(
        header::CONTENT_DISPOSITION,
        HeaderValue::from_static("inline"),
    );
    if let Some(etag) = metadata.etag.as_deref().and_then(quoted_etag) {
        insert_header_str(headers, header::ETAG, etag);
    }
    if let Some(content_length) = content_length {
        insert_header_str(headers, header::CONTENT_LENGTH, content_length.to_string());
    }
    if let Some(range) = content_range {
        insert_header_str(
            headers,
            header::CONTENT_RANGE,
            format!(
                "bytes {}-{}/{}",
                range.start, range.end_inclusive, range.total_size
            ),
        );
    }
}

fn media_cache_control(scope: CacheScope) -> &'static str {
    match scope {
        CacheScope::Owner => "private, no-cache",
        CacheScope::Public => "public, no-cache",
    }
}

fn placeholder_response(headers: &HeaderMap) -> Response {
    let metadata = ObjectMetadata {
        size_bytes: PLACEHOLDER_SVG.len() as u64,
        content_type: "image/svg+xml; charset=utf-8".to_string(),
        etag: Some(PLACEHOLDER_ETAG.to_string()),
        last_modified: None,
        checksum_sha256: None,
    };
    if etag_matches(headers, metadata.etag.as_deref()) {
        let mut response = StatusCode::NOT_MODIFIED.into_response();
        insert_placeholder_headers(response.headers_mut(), &metadata, None);
        return response;
    }

    let bytes = Bytes::from_static(PLACEHOLDER_SVG.as_bytes());
    let mut response = Response::builder()
        .status(StatusCode::OK)
        .body(Body::from(bytes))
        .expect("placeholder response should be valid");
    insert_placeholder_headers(
        response.headers_mut(),
        &metadata,
        Some(PLACEHOLDER_SVG.len()),
    );
    response
}

fn insert_placeholder_headers(
    headers: &mut HeaderMap,
    metadata: &ObjectMetadata,
    content_length: Option<usize>,
) {
    insert_header_str(headers, header::CONTENT_TYPE, &metadata.content_type);
    headers.insert(
        header::CACHE_CONTROL,
        HeaderValue::from_static("public, max-age=300"),
    );
    if let Some(etag) = metadata.etag.as_deref().and_then(quoted_etag) {
        insert_header_str(headers, header::ETAG, etag);
    }
    if let Some(content_length) = content_length {
        insert_header_str(headers, header::CONTENT_LENGTH, content_length.to_string());
    }
}

fn parse_range_header(headers: &HeaderMap, size: u64) -> Result<Option<ByteRange>, ()> {
    let Some(value) = headers.get(header::RANGE) else {
        return Ok(None);
    };
    let value = value.to_str().map_err(|_| ())?;
    let spec = value.strip_prefix("bytes=").ok_or(())?;
    if spec.contains(',') {
        return Err(());
    }
    let (start, end) = spec.split_once('-').ok_or(())?;

    if start.is_empty() {
        let suffix_len = end.parse::<u64>().map_err(|_| ())?;
        if suffix_len == 0 || size == 0 {
            return Err(());
        }
        let start = size.saturating_sub(suffix_len);
        return Ok(Some(ByteRange::new(start, Some(size - 1))));
    }

    let start = start.parse::<u64>().map_err(|_| ())?;
    if size == 0 || start >= size {
        return Err(());
    }
    let end = if end.is_empty() {
        None
    } else {
        let parsed = end.parse::<u64>().map_err(|_| ())?;
        if parsed < start {
            return Err(());
        }
        Some(parsed)
    };

    Ok(Some(ByteRange::new(start, end)))
}

fn etag_matches(headers: &HeaderMap, etag: Option<&str>) -> bool {
    let Some(etag) = etag else {
        return false;
    };
    let Some(value) = headers
        .get(header::IF_NONE_MATCH)
        .and_then(|value| value.to_str().ok())
    else {
        return false;
    };

    value.split(',').any(|candidate| {
        let candidate = candidate.trim();
        if candidate == "*" {
            return true;
        }
        let candidate = candidate.strip_prefix("W/").unwrap_or(candidate).trim();
        candidate.trim_matches('"') == etag
    })
}

fn quoted_etag(etag: &str) -> Option<String> {
    if etag.bytes().any(|byte| matches!(byte, b'\r' | b'\n')) {
        return None;
    }
    Some(format!("\"{}\"", etag.replace('"', "")))
}

fn insert_header_str(headers: &mut HeaderMap, name: HeaderName, value: impl AsRef<str>) {
    if let Ok(value) = HeaderValue::from_str(value.as_ref()) {
        headers.insert(name, value);
    }
}

fn absolute_url(state: &AppState, path: &str) -> String {
    state
        .config
        .public_url
        .join(path.trim_start_matches('/'))
        .map(|url| url.to_string())
        .unwrap_or_else(|_| format!("/{}", path.trim_start_matches('/')))
}

fn storage_error(error: StorageError) -> ApiError {
    match error {
        StorageError::NotFound(_) => ApiError::not_found("media not found"),
        StorageError::InvalidRange { .. } => ApiError::bad_request("invalid range"),
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

    #[test]
    fn public_clip_response_serializes_markers_and_has_thumbnail() {
        let resp = PublicClipResponse {
            share_id: "c_x".into(),
            title: "t".into(),
            game_name: None,
            game_id: None,
            recorded_at: None,
            uploaded_at: None,
            duration_ms: Some(1000),
            media_url: "u".into(),
            thumbnail_url: "u".into(),
            share_url: "u".into(),
            copy_notice: "n",
            has_thumbnail: false,
            markers: vec![PublicMarker {
                kind: "kill".into(),
                label: Some("First Blood".into()),
                timestamp_ms: 500,
            }],
        };
        let json = serde_json::to_value(&resp).unwrap();
        assert_eq!(json["markers"][0]["kind"], "kill");
        assert_eq!(json["markers"][0]["timestamp_ms"], 500);
        assert_eq!(json["has_thumbnail"], false);
        assert!(
            json["markers"][0].get("id").is_none(),
            "must not leak internal id"
        );
    }

    #[test]
    fn parses_common_byte_ranges() {
        let headers = headers_with_range("bytes=2-5");
        assert_eq!(
            parse_range_header(&headers, 10).expect("range"),
            Some(ByteRange::new(2, Some(5)))
        );

        let headers = headers_with_range("bytes=7-");
        assert_eq!(
            parse_range_header(&headers, 10).expect("range"),
            Some(ByteRange::new(7, None))
        );

        let headers = headers_with_range("bytes=-4");
        assert_eq!(
            parse_range_header(&headers, 10).expect("range"),
            Some(ByteRange::new(6, Some(9)))
        );

        let headers = headers_with_range("bytes=-20");
        assert_eq!(
            parse_range_header(&headers, 10).expect("range"),
            Some(ByteRange::new(0, Some(9)))
        );
    }

    #[test]
    fn rejects_invalid_or_unsupported_ranges() {
        assert!(parse_range_header(&headers_with_range("bytes=12-"), 10).is_err());
        assert!(parse_range_header(&headers_with_range("bytes=5-3"), 10).is_err());
        assert!(parse_range_header(&headers_with_range("bytes=0-1,3-4"), 10).is_err());
        assert!(parse_range_header(&headers_with_range("items=0-1"), 10).is_err());
        assert!(parse_range_header(&headers_with_range("bytes=-0"), 10).is_err());
    }

    #[test]
    fn etag_matching_accepts_quoted_weak_and_star_values() {
        let mut headers = HeaderMap::new();
        headers.insert(
            header::IF_NONE_MATCH,
            HeaderValue::from_static("\"other\", W/\"abc123\""),
        );
        assert!(etag_matches(&headers, Some("abc123")));

        headers.insert(header::IF_NONE_MATCH, HeaderValue::from_static("*"));
        assert!(etag_matches(&headers, Some("abc123")));

        headers.insert(header::IF_NONE_MATCH, HeaderValue::from_static("\"other\""));
        assert!(!etag_matches(&headers, Some("abc123")));
    }

    fn headers_with_range(value: &'static str) -> HeaderMap {
        let mut headers = HeaderMap::new();
        headers.insert(header::RANGE, HeaderValue::from_static(value));
        headers
    }
}
