use axum::{
    body::{Body, Bytes},
    extract::{Path, Query, State},
    http::{header, HeaderMap, HeaderName, HeaderValue, StatusCode},
    response::{IntoResponse, Response},
    routing::get,
    Json, Router,
};
use chrono::{DateTime, Utc};
use clipline_cloud_db::{Clip, ClipSort, PublicClipListParams, User};
use clipline_cloud_storage::{
    ByteRange, ContentRange, ObjectKey, ObjectMetadata, StorageError, StoredObject,
};
use serde::{Deserialize, Serialize};
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
const DEFAULT_PUBLIC_PAGE: i64 = 1;
const DEFAULT_PUBLIC_PAGE_SIZE: i64 = 48;
const MAX_PUBLIC_PAGE_SIZE: i64 = 100;
const DEFAULT_RECOMMENDATION_LIMIT: i64 = 8;
const MAX_RECOMMENDATION_LIMIT: i64 = 24;
const RECOMMENDATION_CANDIDATE_LIMIT: i64 = 120;

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/c/{share_id}", get(get_public_share_page))
        .route("/api/v1/clips/{id}/media", get(get_owned_media))
        .route("/api/v1/clips/{id}/thumbnail", get(get_owned_thumbnail))
        .route("/api/v1/clips/{id}/poster", get(get_owned_poster))
        .route("/api/v1/public/clips", get(list_public_clips))
        .route(
            "/api/v1/public/recommendations",
            get(list_public_recommendations),
        )
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

#[derive(Debug, Deserialize)]
struct PublicClipListQuery {
    sort: Option<String>,
    game: Option<String>,
    q: Option<String>,
    page: Option<i64>,
    page_size: Option<i64>,
}

#[derive(Debug, Deserialize)]
struct PublicRecommendationQuery {
    share_id: Option<String>,
    limit: Option<i64>,
}

#[derive(Debug, Serialize)]
struct PublicClipListResponse {
    page: i64,
    page_size: i64,
    clips: Vec<PublicClipSummaryResponse>,
}

#[derive(Debug, Serialize)]
struct PublicRecommendationResponse {
    clips: Vec<PublicClipSummaryResponse>,
}

#[derive(Debug, Serialize)]
struct PublicClipSummaryResponse {
    share_id: String,
    title: String,
    author_name: String,
    game_name: Option<String>,
    game_id: Option<String>,
    recorded_at: Option<DateTime<Utc>>,
    uploaded_at: Option<DateTime<Utc>>,
    duration_ms: Option<i64>,
    thumbnail_url: String,
    share_url: String,
}

#[derive(Debug, Serialize)]
struct PublicClipResponse {
    share_id: String,
    title: String,
    author_name: String,
    game_name: Option<String>,
    game_id: Option<String>,
    recorded_at: Option<DateTime<Utc>>,
    uploaded_at: Option<DateTime<Utc>>,
    duration_ms: Option<i64>,
    media_url: String,
    thumbnail_url: String,
    share_url: String,
    copy_notice: &'static str,
}

#[derive(Debug, Clone, Copy)]
enum CacheScope {
    Owner,
    Public,
}

async fn get_public_share_page(
    State(state): State<AppState>,
    Path(share_id): Path<String>,
) -> Result<Response, ApiError> {
    let Some(clip) = state
        .repositories
        .clips
        .get_by_public_share_id(&share_id)
        .await?
    else {
        return Ok(public_share_unavailable_response(&state, &share_id));
    };

    let author_name = public_clip_author_name(&state, &clip).await?;
    Ok(public_share_page_response(
        &state,
        &share_id,
        &clip,
        &author_name,
    ))
}

async fn list_public_clips(
    State(state): State<AppState>,
    Query(query): Query<PublicClipListQuery>,
) -> Result<Json<PublicClipListResponse>, ApiError> {
    let page = query.page.unwrap_or(DEFAULT_PUBLIC_PAGE).max(1);
    let page_size = query
        .page_size
        .unwrap_or(DEFAULT_PUBLIC_PAGE_SIZE)
        .clamp(1, MAX_PUBLIC_PAGE_SIZE);
    let params = PublicClipListParams {
        game: normalized_optional(query.game),
        query: normalized_optional(query.q),
        sort: parse_public_sort(query.sort.as_deref())?,
        limit: page_size,
        offset: (page - 1) * page_size,
    };
    let clips = state.repositories.clips.list_public(&params).await?;
    let mut public_clips = Vec::with_capacity(clips.len());
    for clip in clips {
        if clip.public_share_id.is_some() {
            let author_name = public_clip_author_name(&state, &clip).await?;
            if let Some(response) = public_clip_summary_response(&state, clip, author_name) {
                public_clips.push(response);
            }
        }
    }

    Ok(Json(PublicClipListResponse {
        page,
        page_size,
        clips: public_clips,
    }))
}

async fn list_public_recommendations(
    State(state): State<AppState>,
    Query(query): Query<PublicRecommendationQuery>,
) -> Result<Json<PublicRecommendationResponse>, ApiError> {
    let limit = query
        .limit
        .unwrap_or(DEFAULT_RECOMMENDATION_LIMIT)
        .clamp(1, MAX_RECOMMENDATION_LIMIT);
    let source_share_id = normalized_optional(query.share_id);
    let source = match source_share_id.as_deref() {
        Some(share_id) => Some(load_public_clip(&state, share_id).await?),
        None => None,
    };
    let params = PublicClipListParams {
        game: None,
        query: None,
        sort: ClipSort::UploadedAtDesc,
        limit: RECOMMENDATION_CANDIDATE_LIMIT.max(limit),
        offset: 0,
    };
    let candidates = state.repositories.clips.list_public(&params).await?;
    let clips = recommend_public_clips(candidates, source.as_ref(), limit as usize);

    let mut public_clips = Vec::with_capacity(clips.len());
    for clip in clips {
        let author_name = public_clip_author_name(&state, &clip).await?;
        if let Some(response) = public_clip_summary_response(&state, clip, author_name) {
            public_clips.push(response);
        }
    }

    Ok(Json(PublicRecommendationResponse {
        clips: public_clips,
    }))
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
    let author_name = public_clip_author_name(&state, &clip).await?;
    Ok(Json(PublicClipResponse {
        share_id: share_id.clone(),
        title: clip.title,
        author_name,
        game_name: clip.game_name,
        game_id: clip.game_id,
        recorded_at: clip.recorded_at,
        uploaded_at: clip.uploaded_at,
        duration_ms: clip.duration_ms,
        media_url: absolute_url(&state, &format!("api/v1/public/clips/{share_id}/media")),
        thumbnail_url: absolute_url(&state, &format!("api/v1/public/clips/{share_id}/thumbnail")),
        share_url: absolute_url(&state, &format!("c/{share_id}")),
        copy_notice: COPY_NOTICE,
    }))
}

fn public_clip_summary_response(
    state: &AppState,
    clip: Clip,
    author_name: String,
) -> Option<PublicClipSummaryResponse> {
    let share_id = clip.public_share_id?;
    Some(PublicClipSummaryResponse {
        thumbnail_url: absolute_url(state, &format!("api/v1/public/clips/{share_id}/thumbnail")),
        share_url: absolute_url(state, &format!("c/{share_id}")),
        share_id,
        title: clip.title,
        author_name,
        game_name: clip.game_name,
        game_id: clip.game_id,
        recorded_at: clip.recorded_at,
        uploaded_at: clip.uploaded_at,
        duration_ms: clip.duration_ms,
    })
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

fn public_share_page_response(
    state: &AppState,
    share_id: &str,
    clip: &Clip,
    author_name: &str,
) -> Response {
    let title = public_share_title(clip);
    let description = public_share_description(clip, Some(author_name));
    let share_url = absolute_url(state, &format!("c/{share_id}"));
    let media_url = absolute_url(state, &format!("api/v1/public/clips/{share_id}/media"));
    let thumbnail_url = absolute_url(state, &format!("api/v1/public/clips/{share_id}/thumbnail"));
    let width = clip.width.unwrap_or(1280).max(1);
    let height = clip.height.unwrap_or(720).max(1);
    let html = public_share_html(PublicShareHtml {
        title: &title,
        description: &description,
        share_url: &share_url,
        media_url: &media_url,
        thumbnail_url: &thumbnail_url,
        width,
        height,
        status_message: "Loading public clip...",
    });
    html_response(StatusCode::OK, html)
}

fn public_share_unavailable_response(state: &AppState, share_id: &str) -> Response {
    let title = "Clip unavailable";
    let description = "This Clipline public link is no longer active.";
    let share_url = absolute_url(state, &format!("c/{share_id}"));
    let html = public_share_html(PublicShareHtml {
        title,
        description,
        share_url: &share_url,
        media_url: "",
        thumbnail_url: "",
        width: 1280,
        height: 720,
        status_message: "Clip unavailable",
    });
    html_response(StatusCode::NOT_FOUND, html)
}

struct PublicShareHtml<'a> {
    title: &'a str,
    description: &'a str,
    share_url: &'a str,
    media_url: &'a str,
    thumbnail_url: &'a str,
    width: i64,
    height: i64,
    status_message: &'a str,
}

fn public_share_html(data: PublicShareHtml<'_>) -> String {
    let title = escape_html(data.title);
    let description = escape_html(data.description);
    let share_url = escape_html(data.share_url);
    let media_url = escape_html(data.media_url);
    let thumbnail_url = escape_html(data.thumbnail_url);
    let status_message = escape_html(data.status_message);
    let image_meta = if data.thumbnail_url.is_empty() {
        String::new()
    } else {
        format!(
            r#"
    <meta property="og:image" content="{thumbnail_url}">
    <meta property="og:image:secure_url" content="{thumbnail_url}">
    <meta property="og:image:type" content="image/jpeg">
    <meta name="twitter:image" content="{thumbnail_url}">"#
        )
    };
    let video_meta = if data.media_url.is_empty() {
        String::new()
    } else {
        format!(
            r#"
    <meta property="og:video" content="{media_url}">
    <meta property="og:video:secure_url" content="{media_url}">
    <meta property="og:video:type" content="video/mp4">
    <meta property="og:video:width" content="{width}">
    <meta property="og:video:height" content="{height}">"#,
            width = data.width,
            height = data.height
        )
    };

    format!(
        r##"<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="dark">
    <meta name="theme-color" content="#2563eb">
    <title>{title}</title>
    <meta name="description" content="{description}">
    <meta property="og:site_name" content="Clipline Cloud">
    <meta property="og:type" content="video.other">
    <meta property="og:title" content="{title}">
    <meta property="og:description" content="{description}">
    <meta property="og:url" content="{share_url}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{title}">
    <meta name="twitter:description" content="{description}">{image_meta}{video_meta}
    <link rel="canonical" href="{share_url}">
    <link rel="stylesheet" href="/styles.css">
    <script type="module" src="/app.js"></script>
  </head>
  <body>
    <div id="app" class="app-root">
      <main class="boot-screen">
        <div class="brand-mark" aria-hidden="true">CL</div>
        <p>{status_message}</p>
      </main>
    </div>
  </body>
</html>
"##
    )
}

fn html_response(status: StatusCode, html: String) -> Response {
    let mut response = Response::builder()
        .status(status)
        .body(Body::from(html))
        .expect("HTML response should be valid");
    response.headers_mut().insert(
        header::CONTENT_TYPE,
        HeaderValue::from_static("text/html; charset=utf-8"),
    );
    response.headers_mut().insert(
        header::CACHE_CONTROL,
        HeaderValue::from_static("public, no-cache"),
    );
    response
}

fn public_share_title(clip: &Clip) -> String {
    let title = clip.title.trim();
    if title.is_empty() {
        "Clipline clip".to_string()
    } else {
        title.to_string()
    }
}

async fn public_clip_author_name(state: &AppState, clip: &Clip) -> Result<String, ApiError> {
    let user = state.repositories.users.get(&clip.owner_user_id).await?;
    Ok(public_user_name(user.as_ref()))
}

fn public_user_name(user: Option<&User>) -> String {
    user.map(|user| public_author_label(user.display_name.as_deref(), &user.username))
        .unwrap_or_else(|| "Unknown creator".to_string())
}

fn public_author_label(display_name: Option<&str>, username: &str) -> String {
    [display_name, Some(username)]
        .into_iter()
        .flatten()
        .map(str::trim)
        .find(|value| !value.is_empty())
        .unwrap_or("Unknown creator")
        .to_string()
}

fn public_share_description(clip: &Clip, author_name: Option<&str>) -> String {
    let intro = author_name
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .map(|author_name| format!("Shared Clipline clip by {author_name}"))
        .unwrap_or_else(|| "Shared Clipline clip".to_string());
    let mut parts = Vec::new();
    if let Some(game) = clip
        .game_name
        .as_deref()
        .or(clip.game_id.as_deref())
        .map(str::trim)
        .filter(|value| !value.is_empty())
    {
        parts.push(game.to_string());
    }
    if let Some(duration_ms) = clip.duration_ms.filter(|value| *value >= 0) {
        parts.push(format_duration(duration_ms));
    }
    if parts.is_empty() {
        intro
    } else {
        format!("{intro} - {}", parts.join(" - "))
    }
}

fn format_duration(duration_ms: i64) -> String {
    let total_seconds = duration_ms / 1000;
    let minutes = total_seconds / 60;
    let seconds = total_seconds % 60;
    format!("{minutes}:{seconds:02}")
}

fn escape_html(value: &str) -> String {
    let mut escaped = String::with_capacity(value.len());
    for ch in value.chars() {
        match ch {
            '&' => escaped.push_str("&amp;"),
            '<' => escaped.push_str("&lt;"),
            '>' => escaped.push_str("&gt;"),
            '"' => escaped.push_str("&quot;"),
            '\'' => escaped.push_str("&#39;"),
            _ => escaped.push(ch),
        }
    }
    escaped
}

fn normalized_optional(value: Option<String>) -> Option<String> {
    value
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty())
}

fn recommend_public_clips(
    mut candidates: Vec<Clip>,
    source: Option<&Clip>,
    limit: usize,
) -> Vec<Clip> {
    let now = Utc::now();
    let source_share_id = source.and_then(|clip| clip.public_share_id.as_deref());
    candidates.retain(|clip| {
        clip.public_share_id.is_some() && clip.public_share_id.as_deref() != source_share_id
    });
    candidates.sort_by(|left, right| {
        let left_score = recommendation_score(left, source, now);
        let right_score = recommendation_score(right, source, now);
        right_score
            .cmp(&left_score)
            .then_with(|| recommendation_timestamp(right).cmp(&recommendation_timestamp(left)))
            .then_with(|| right.id.cmp(&left.id))
    });
    candidates.truncate(limit);
    candidates
}

fn recommendation_score(clip: &Clip, source: Option<&Clip>, now: DateTime<Utc>) -> i64 {
    let mut score = recency_score(clip, now) + stable_bucket(&clip.id, 11);
    if clip.duration_ms.is_some() {
        score += 3;
    }

    let Some(source) = source else {
        return score;
    };

    if source.owner_user_id == clip.owner_user_id {
        score += 8;
    }
    if game_keys(source)
        .iter()
        .any(|source_key| game_keys(clip).contains(source_key))
    {
        score += 120;
    }

    let source_tokens = title_tokens(&source.title);
    if !source_tokens.is_empty() {
        let overlap = title_tokens(&clip.title)
            .intersection(&source_tokens)
            .count()
            .min(4) as i64;
        score += overlap * 12;
    }

    if let (Some(source_duration), Some(duration)) = (source.duration_ms, clip.duration_ms) {
        let source_duration = source_duration.max(1);
        let diff = (duration - source_duration).abs();
        if diff * 100 <= source_duration * 15 {
            score += 20;
        } else if diff * 100 <= source_duration * 50 {
            score += 8;
        }
    }

    score
}

fn recency_score(clip: &Clip, now: DateTime<Utc>) -> i64 {
    let timestamp = clip
        .uploaded_at
        .as_ref()
        .or(clip.recorded_at.as_ref())
        .unwrap_or(&clip.created_at);
    let age_days = now.signed_duration_since(*timestamp).num_days().max(0);
    (60 - age_days).clamp(0, 60)
}

fn recommendation_timestamp(clip: &Clip) -> i64 {
    clip.uploaded_at
        .as_ref()
        .or(clip.recorded_at.as_ref())
        .unwrap_or(&clip.created_at)
        .timestamp()
}

fn game_keys(clip: &Clip) -> Vec<String> {
    [clip.game_id.as_deref(), clip.game_name.as_deref()]
        .into_iter()
        .flatten()
        .filter_map(normalized_key)
        .collect()
}

fn title_tokens(title: &str) -> std::collections::HashSet<String> {
    title
        .split(|ch: char| !ch.is_ascii_alphanumeric())
        .filter_map(normalized_key)
        .filter(|token| token.len() >= 3)
        .collect()
}

fn normalized_key(value: &str) -> Option<String> {
    let value = value.trim().to_ascii_lowercase();
    (!value.is_empty()).then_some(value)
}

fn stable_bucket(value: &str, modulo: u64) -> i64 {
    let mut hash = 0xcbf29ce484222325_u64;
    for byte in value.as_bytes() {
        hash ^= u64::from(*byte);
        hash = hash.wrapping_mul(0x100000001b3);
    }
    (hash % modulo) as i64
}

fn parse_public_sort(value: Option<&str>) -> Result<ClipSort, ApiError> {
    match value.unwrap_or("uploaded_at_desc") {
        "recorded_at_desc" => Ok(ClipSort::RecordedAtDesc),
        "recorded_at_asc" => Ok(ClipSort::RecordedAtAsc),
        "uploaded_at_desc" => Ok(ClipSort::UploadedAtDesc),
        "uploaded_at_asc" => Ok(ClipSort::UploadedAtAsc),
        "created_at_desc" => Ok(ClipSort::CreatedAtDesc),
        "created_at_asc" => Ok(ClipSort::CreatedAtAsc),
        "updated_at_desc" => Ok(ClipSort::UpdatedAtDesc),
        "updated_at_asc" => Ok(ClipSort::UpdatedAtAsc),
        "duration_desc" => Ok(ClipSort::DurationDesc),
        "duration_asc" => Ok(ClipSort::DurationAsc),
        "title_asc" => Ok(ClipSort::TitleAsc),
        "title_desc" => Ok(ClipSort::TitleDesc),
        _ => Err(ApiError::bad_request("invalid sort")),
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

    #[test]
    fn public_share_html_escapes_metadata_and_includes_video_tags() {
        let html = public_share_html(PublicShareHtml {
            title: "Clip <one> \"win\"",
            description: "A&B's clip",
            share_url: "https://clips.example.com/c/share",
            media_url: "https://clips.example.com/api/v1/public/clips/share/media",
            thumbnail_url: "https://clips.example.com/api/v1/public/clips/share/thumbnail",
            width: 1920,
            height: 1080,
            status_message: "Loading <clip>",
        });

        assert!(html.contains("Clip &lt;one&gt; &quot;win&quot;"));
        assert!(html.contains("A&amp;B&#39;s clip"));
        assert!(html.contains(r#"<meta property="og:video:type" content="video/mp4">"#));
        assert!(html.contains(r#"<meta property="og:video:width" content="1920">"#));
        assert!(html.contains(r#"<meta property="og:image:type" content="image/jpeg">"#));
        assert!(!html.contains("Loading <clip>"));
    }

    #[test]
    fn public_share_description_uses_game_and_duration() {
        let clip = test_clip_with_metadata(Some("Renata Glasc"), Some(65_500));
        assert_eq!(
            public_share_description(&clip, Some("Dain")),
            "Shared Clipline clip by Dain - Renata Glasc - 1:05"
        );
        assert_eq!(
            public_share_description(&clip, None),
            "Shared Clipline clip - Renata Glasc - 1:05"
        );

        let clip = test_clip_with_metadata(None, None);
        assert_eq!(
            public_share_description(&clip, Some("Dain")),
            "Shared Clipline clip by Dain"
        );
        assert_eq!(
            public_share_description(&clip, None),
            "Shared Clipline clip"
        );
    }

    #[test]
    fn public_author_label_prefers_display_name_then_username() {
        assert_eq!(
            public_author_label(Some("  Display Name  "), "username"),
            "Display Name"
        );
        assert_eq!(public_author_label(Some("   "), " username "), "username");
        assert_eq!(public_author_label(None, " username "), "username");
        assert_eq!(public_author_label(None, "   "), "Unknown creator");
    }

    #[test]
    fn recommendations_exclude_source_and_prefer_same_game() {
        let mut source = test_clip_with_metadata(Some("Factorio"), Some(30_000));
        source.id = "source".to_string();
        source.title = "factory belt rebuild".to_string();
        source.public_share_id = Some("source-share".to_string());

        let mut same_game = test_clip_with_metadata(Some("Factorio"), Some(31_000));
        same_game.id = "same-game".to_string();
        same_game.title = "factory belt upgrade".to_string();
        same_game.public_share_id = Some("same-share".to_string());

        let mut other_game = test_clip_with_metadata(Some("League"), Some(31_000));
        other_game.id = "other-game".to_string();
        other_game.title = "unrelated fight".to_string();
        other_game.public_share_id = Some("other-share".to_string());

        let recommendations = recommend_public_clips(
            vec![other_game.clone(), source.clone(), same_game.clone()],
            Some(&source),
            3,
        );

        assert_eq!(recommendations.len(), 2);
        assert_eq!(recommendations[0].id, same_game.id);
        assert!(recommendations
            .iter()
            .all(|clip| clip.public_share_id.as_deref() != Some("source-share")));
    }

    #[test]
    fn recommendations_ignore_clips_without_public_share_ids() {
        let mut public = test_clip_with_metadata(Some("Factorio"), Some(30_000));
        public.id = "public".to_string();
        public.public_share_id = Some("public-share".to_string());

        let mut no_share = test_clip_with_metadata(Some("Factorio"), Some(30_000));
        no_share.id = "no-share".to_string();
        no_share.public_share_id = None;

        let recommendations = recommend_public_clips(vec![no_share, public.clone()], None, 5);

        assert_eq!(recommendations.len(), 1);
        assert_eq!(recommendations[0].id, public.id);
    }

    fn headers_with_range(value: &'static str) -> HeaderMap {
        let mut headers = HeaderMap::new();
        headers.insert(header::RANGE, HeaderValue::from_static(value));
        headers
    }

    fn test_clip_with_metadata(game_name: Option<&str>, duration_ms: Option<i64>) -> Clip {
        let now = Utc::now();
        Clip {
            id: "clip".to_string(),
            owner_user_id: "owner".to_string(),
            client_clip_id: None,
            title: "title".to_string(),
            game_name: game_name.map(ToOwned::to_owned),
            game_id: None,
            game_executable: None,
            source_type: None,
            recorded_at: None,
            uploaded_at: Some(now),
            duration_ms,
            file_size_bytes: None,
            width: None,
            height: None,
            fps: None,
            container: None,
            video_codec: None,
            audio_codec: None,
            checksum_sha256: None,
            visibility: "unlisted".to_string(),
            status: "ready".to_string(),
            storage_backend: "local".to_string(),
            storage_key: None,
            poster_key: None,
            thumbnail_key: None,
            public_share_id: Some("share".to_string()),
            created_at: now,
            updated_at: now,
            deleted_at: None,
        }
    }
}
