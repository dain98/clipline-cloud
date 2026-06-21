use std::net::{Ipv4Addr, Ipv6Addr};

use bytes::Bytes;
pub use clipline_cloud_api_types::{
    ClipDetailResponse, ClipListResponse, ClipMarkerResponse, ClipSummaryResponse,
    CreateDeviceTokenRequest, CreateDeviceTokenResponse, CreateUploadRequest, CreateUploadResponse,
    DiscoveryResponse, HealthResponse, MeResponse, PartUploadResponse, ReadinessResponse,
    UpdateVisibilityRequest, UploadProgressResponse, UserResponse,
};
use reqwest::{header, StatusCode};
use serde::Deserialize;
use sha2::{Digest, Sha256};
use thiserror::Error;
use url::{Host, Url};

pub use clipline_cloud_api_types as types;

const EXPECTED_DISCOVERY_NAME: &str = "Clipline Cloud";
const SUPPORTED_API_VERSION: &str = "v1";
const PART_SHA256_HEADER: &str = "x-clipline-part-sha256";

#[derive(Debug, Error)]
pub enum CloudApiError {
    #[error("cloud host URL is invalid: {0}")]
    InvalidUrl(#[from] url::ParseError),
    #[error("cloud host URL must use https or http")]
    UnsupportedScheme,
    #[error("plain HTTP requires explicit user confirmation because credentials are sent once")]
    PlainHttpRequiresConfirmation,
    #[error("plain HTTP is only allowed for localhost, loopback, or RFC1918 IPv4 addresses")]
    PlainHttpPublicHost,
    #[error("server did not identify as Clipline Cloud")]
    InvalidDiscovery,
    #[error("unsupported Clipline Cloud API version {0}")]
    UnsupportedApiVersion(String),
    #[error("request failed with {status}: {message}")]
    Api { status: StatusCode, message: String },
    #[error("HTTP client error: {0}")]
    Http(#[from] reqwest::Error),
    #[error("request body is inconsistent with declared upload metadata: {0}")]
    InvalidUpload(String),
}

pub type CloudApiResult<T> = Result<T, CloudApiError>;

#[derive(Debug, Clone)]
pub struct CloudClient {
    base_url: Url,
    http: reqwest::Client,
    device_token: Option<String>,
}

#[derive(Debug, Clone)]
pub struct ConnectedCloud {
    pub client: CloudClient,
    pub discovery: DiscoveryResponse,
    pub token: String,
    pub user: UserResponse,
}

impl CloudClient {
    pub fn new(mut base_url: Url) -> Self {
        normalize_base_url_path(&mut base_url);
        Self {
            base_url,
            http: reqwest::Client::new(),
            device_token: None,
        }
    }

    pub fn with_device_token(mut base_url: Url, device_token: impl Into<String>) -> Self {
        normalize_base_url_path(&mut base_url);
        Self {
            base_url,
            http: reqwest::Client::new(),
            device_token: Some(device_token.into()),
        }
    }

    pub fn base_url(&self) -> &Url {
        &self.base_url
    }

    pub async fn discover(&self) -> CloudApiResult<DiscoveryResponse> {
        let discovery = self.get("/.well-known/clipline-cloud").await?;
        ensure_compatible_discovery(&discovery)?;
        Ok(discovery)
    }

    pub async fn create_device_token(
        &self,
        request: &CreateDeviceTokenRequest,
    ) -> CloudApiResult<CreateDeviceTokenResponse> {
        self.post_json("/api/v1/auth/device-token", request).await
    }

    pub async fn me(&self) -> CloudApiResult<MeResponse> {
        self.get("/api/v1/auth/me").await
    }

    pub async fn create_upload(
        &self,
        request: &CreateUploadRequest,
    ) -> CloudApiResult<CreateUploadResponse> {
        self.post_json("/api/v1/uploads", request).await
    }

    pub async fn get_upload(&self, upload_id: &str) -> CloudApiResult<UploadProgressResponse> {
        self.get(&format!("/api/v1/uploads/{upload_id}")).await
    }

    pub async fn get_clip(&self, clip_id: &str) -> CloudApiResult<ClipDetailResponse> {
        self.get(&format!("/api/v1/clips/{clip_id}")).await
    }

    pub async fn set_visibility(
        &self,
        clip_id: &str,
        visibility: impl Into<String>,
    ) -> CloudApiResult<ClipDetailResponse> {
        self.post_json(
            &format!("/api/v1/clips/{clip_id}/visibility"),
            &UpdateVisibilityRequest {
                visibility: visibility.into(),
            },
        )
        .await
    }

    pub async fn put_single_content(
        &self,
        upload_id: &str,
        bytes: impl Into<Bytes>,
    ) -> CloudApiResult<UploadProgressResponse> {
        self.put_body(
            &format!("/api/v1/uploads/{upload_id}/content"),
            bytes.into(),
            None,
        )
        .await
    }

    pub async fn put_part(
        &self,
        upload_id: &str,
        part_number: u16,
        bytes: impl Into<Bytes>,
    ) -> CloudApiResult<PartUploadResponse> {
        let bytes = bytes.into();
        let checksum = sha256_hex(&bytes);
        self.put_body(
            &format!("/api/v1/uploads/{upload_id}/parts/{part_number}"),
            bytes,
            Some(checksum),
        )
        .await
    }

    pub async fn complete_upload(&self, upload_id: &str) -> CloudApiResult<UploadProgressResponse> {
        self.post_json(
            &format!("/api/v1/uploads/{upload_id}/complete"),
            &serde_json_value_empty(),
        )
        .await
    }

    pub async fn upload_mp4_bytes(
        &self,
        request: &CreateUploadRequest,
        bytes: impl AsRef<[u8]>,
    ) -> CloudApiResult<UploadProgressResponse> {
        self.upload_mp4_bytes_with_progress(request, bytes, |_| {})
            .await
    }

    pub async fn upload_mp4_bytes_with_progress<F>(
        &self,
        request: &CreateUploadRequest,
        bytes: impl AsRef<[u8]>,
        mut on_progress: F,
    ) -> CloudApiResult<UploadProgressResponse>
    where
        F: FnMut(&UploadProgressResponse),
    {
        let bytes = bytes.as_ref();
        validate_upload_request_matches_bytes(request, bytes)?;
        let upload = self.create_upload(request).await?;
        match upload.mode.as_str() {
            "single_put" => {
                let progress = self.get_upload(&upload.upload_id).await?;
                if progress.status == "completed" {
                    on_progress(&progress);
                    return Ok(progress);
                }
                let progress = self
                    .put_single_content(&upload.upload_id, Bytes::copy_from_slice(bytes))
                    .await?;
                on_progress(&progress);
                Ok(progress)
            }
            "chunked" => {
                let progress = self.get_upload(&upload.upload_id).await?;
                on_progress(&progress);
                for part_number in progress.missing_parts {
                    let chunk = chunk_for_part(bytes, upload.part_size_bytes, part_number)?;
                    self.put_part(&upload.upload_id, part_number, chunk).await?;
                    let progress = self.get_upload(&upload.upload_id).await?;
                    on_progress(&progress);
                }
                let progress = self.complete_upload(&upload.upload_id).await?;
                on_progress(&progress);
                Ok(progress)
            }
            other => Err(CloudApiError::InvalidUpload(format!(
                "server returned unsupported upload mode {other:?}"
            ))),
        }
    }

    async fn get<T: serde::de::DeserializeOwned>(&self, path: &str) -> CloudApiResult<T> {
        self.send_json(self.request(reqwest::Method::GET, path)?)
            .await
    }

    async fn post_json<T, B>(&self, path: &str, body: &B) -> CloudApiResult<T>
    where
        T: serde::de::DeserializeOwned,
        B: serde::Serialize + ?Sized,
    {
        self.send_json(self.request(reqwest::Method::POST, path)?.json(body))
            .await
    }

    async fn put_body<T>(
        &self,
        path: &str,
        bytes: Bytes,
        checksum: Option<String>,
    ) -> CloudApiResult<T>
    where
        T: serde::de::DeserializeOwned,
    {
        let mut request = self
            .request(reqwest::Method::PUT, path)?
            .header(header::CONTENT_TYPE, "video/mp4")
            .body(bytes);
        if let Some(checksum) = checksum {
            request = request.header(PART_SHA256_HEADER, checksum);
        }
        self.send_json(request).await
    }

    fn request(
        &self,
        method: reqwest::Method,
        path: &str,
    ) -> CloudApiResult<reqwest::RequestBuilder> {
        let url = self.base_url.join(path.trim_start_matches('/'))?;
        let request = self.http.request(method, url);
        Ok(match &self.device_token {
            Some(token) => request.bearer_auth(token),
            None => request,
        })
    }

    async fn send_json<T: serde::de::DeserializeOwned>(
        &self,
        request: reqwest::RequestBuilder,
    ) -> CloudApiResult<T> {
        let response = request.send().await?;
        let status = response.status();
        if !status.is_success() {
            let message = response
                .json::<ErrorResponse>()
                .await
                .map(|body| body.error)
                .unwrap_or_else(|_| status.to_string());
            return Err(CloudApiError::Api { status, message });
        }
        Ok(response.json::<T>().await?)
    }
}

pub async fn connect_with_device_token(
    host_url: &str,
    username: impl Into<String>,
    password: impl Into<String>,
    device_name: impl Into<String>,
    plain_http_confirmed: bool,
) -> CloudApiResult<ConnectedCloud> {
    let base_url = validate_cloud_host(host_url, plain_http_confirmed)?;
    let anonymous = CloudClient::new(base_url.clone());
    let discovery = anonymous.discover().await?;
    let response = anonymous
        .create_device_token(&CreateDeviceTokenRequest {
            username: username.into(),
            password: password.into(),
            name: device_name.into(),
        })
        .await?;
    let token = response.token;
    let client = CloudClient::with_device_token(base_url, token.clone());
    let me = client.me().await?;
    Ok(ConnectedCloud {
        client,
        discovery,
        token,
        user: me.user,
    })
}

pub fn validate_cloud_host(input: &str, plain_http_confirmed: bool) -> CloudApiResult<Url> {
    let mut url = Url::parse(input)?;
    normalize_base_url_path(&mut url);

    match url.scheme() {
        "https" => Ok(url),
        "http" => {
            if !is_plain_http_host_allowed(&url) {
                return Err(CloudApiError::PlainHttpPublicHost);
            }
            if !plain_http_confirmed {
                return Err(CloudApiError::PlainHttpRequiresConfirmation);
            }
            Ok(url)
        }
        _ => Err(CloudApiError::UnsupportedScheme),
    }
}

fn normalize_base_url_path(url: &mut Url) {
    if !url.path().ends_with('/') {
        let path = format!("{}/", url.path());
        url.set_path(&path);
    }
}

pub fn ensure_compatible_discovery(discovery: &DiscoveryResponse) -> CloudApiResult<()> {
    if discovery.name != EXPECTED_DISCOVERY_NAME {
        return Err(CloudApiError::InvalidDiscovery);
    }
    if discovery.api_version != SUPPORTED_API_VERSION {
        return Err(CloudApiError::UnsupportedApiVersion(
            discovery.api_version.clone(),
        ));
    }
    Ok(())
}

fn is_plain_http_host_allowed(url: &Url) -> bool {
    match url.host() {
        Some(Host::Domain(domain)) => domain.eq_ignore_ascii_case("localhost"),
        Some(Host::Ipv4(address)) => is_loopback_or_rfc1918(address),
        Some(Host::Ipv6(address)) => address == Ipv6Addr::LOCALHOST,
        None => false,
    }
}

fn is_loopback_or_rfc1918(address: Ipv4Addr) -> bool {
    address.is_loopback()
        || address.octets()[0] == 10
        || (address.octets()[0] == 172 && (16..=31).contains(&address.octets()[1]))
        || (address.octets()[0] == 192 && address.octets()[1] == 168)
}

fn validate_upload_request_matches_bytes(
    request: &CreateUploadRequest,
    bytes: &[u8],
) -> CloudApiResult<()> {
    if request.file_size_bytes != bytes.len() as u64 {
        return Err(CloudApiError::InvalidUpload(format!(
            "file_size_bytes is {}, but body has {} bytes",
            request.file_size_bytes,
            bytes.len()
        )));
    }
    let checksum = sha256_hex(bytes);
    if request.checksum_sha256.to_ascii_lowercase() != checksum {
        return Err(CloudApiError::InvalidUpload(
            "checksum_sha256 does not match body bytes".to_string(),
        ));
    }
    Ok(())
}

fn chunk_for_part(bytes: &[u8], part_size_bytes: u64, part_number: u16) -> CloudApiResult<Bytes> {
    let part_size = usize::try_from(part_size_bytes)
        .map_err(|_| CloudApiError::InvalidUpload("part size does not fit usize".to_string()))?;
    if part_size == 0 {
        return Err(CloudApiError::InvalidUpload(
            "part size must be positive".to_string(),
        ));
    }
    let index = usize::from(part_number.saturating_sub(1));
    let start = index
        .checked_mul(part_size)
        .ok_or_else(|| CloudApiError::InvalidUpload("part offset overflowed".to_string()))?;
    if start >= bytes.len() {
        return Err(CloudApiError::InvalidUpload(format!(
            "part {part_number} starts beyond the body"
        )));
    }
    let end = start.saturating_add(part_size).min(bytes.len());
    Ok(Bytes::copy_from_slice(&bytes[start..end]))
}

pub fn sha256_hex(bytes: &[u8]) -> String {
    let digest = Sha256::digest(bytes);
    let mut out = String::with_capacity(digest.len() * 2);
    for byte in digest {
        use std::fmt::Write as _;
        let _ = write!(out, "{byte:02x}");
    }
    out
}

fn serde_json_value_empty() -> serde_json::Value {
    serde_json::json!({})
}

#[derive(Debug, Deserialize)]
struct ErrorResponse {
    error: String,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn transport_guard_accepts_https_without_confirmation() {
        let url = validate_cloud_host("https://clips.example.com", false).expect("url");
        assert_eq!(url.scheme(), "https");
    }

    #[test]
    fn base_url_paths_are_normalized_with_trailing_slash() {
        let url = Url::parse("https://clips.example.com/clipline").expect("url");
        let client = CloudClient::new(url);
        assert_eq!(
            client.base_url().as_str(),
            "https://clips.example.com/clipline/"
        );

        let url = validate_cloud_host("https://clips.example.com/clipline", false).expect("url");
        assert_eq!(url.as_str(), "https://clips.example.com/clipline/");
    }

    #[test]
    fn transport_guard_requires_confirmation_for_local_http() {
        let error = validate_cloud_host("http://localhost:8080", false).expect_err("confirm");
        assert!(matches!(
            error,
            CloudApiError::PlainHttpRequiresConfirmation
        ));

        let url = validate_cloud_host("http://localhost:8080", true).expect("url");
        assert_eq!(url.host_str(), Some("localhost"));
    }

    #[test]
    fn transport_guard_rejects_public_http() {
        let error = validate_cloud_host("http://203.0.113.10", true).expect_err("public");
        assert!(matches!(error, CloudApiError::PlainHttpPublicHost));
    }

    #[test]
    fn transport_guard_accepts_rfc1918_http_with_confirmation() {
        assert!(validate_cloud_host("http://10.1.2.3", true).is_ok());
        assert!(validate_cloud_host("http://172.16.0.5", true).is_ok());
        assert!(validate_cloud_host("http://192.168.1.50", true).is_ok());
    }

    #[test]
    fn discovery_compatibility_checks_name_and_api_version() {
        let mut discovery = DiscoveryResponse {
            name: "Clipline Cloud".to_string(),
            api_version: "v1".to_string(),
            server_version: "0.1.0".to_string(),
            min_client_version: "0.1.0".to_string(),
            public_url: "https://clips.example.com".to_string(),
            features: clipline_cloud_api_types::DiscoveryFeatures {
                single_put_upload: true,
                chunked_upload: true,
                direct_s3_upload: false,
                public_sharing: true,
                clip_markers: true,
                max_upload_size_bytes: 1,
            },
        };
        assert!(ensure_compatible_discovery(&discovery).is_ok());
        discovery.api_version = "v2".to_string();
        assert!(matches!(
            ensure_compatible_discovery(&discovery),
            Err(CloudApiError::UnsupportedApiVersion(_))
        ));
    }

    #[test]
    fn upload_request_must_match_body_size_and_checksum() {
        let bytes = b"clip bytes";
        let request = CreateUploadRequest {
            client_clip_id: Some("local-1".to_string()),
            title: "clip".to_string(),
            description: None,
            game_name: None,
            game_id: None,
            game_executable: None,
            source_type: None,
            recorded_at: None,
            duration_ms: None,
            file_size_bytes: bytes.len() as u64,
            checksum_sha256: sha256_hex(bytes),
            container: "mp4".to_string(),
            video_codec: Some("h264".to_string()),
            audio_codec: None,
            width: None,
            height: None,
            fps: None,
            visibility: Some("private".to_string()),
            markers: None,
        };
        assert!(validate_upload_request_matches_bytes(&request, bytes).is_ok());

        let mut wrong = request;
        wrong.file_size_bytes += 1;
        assert!(validate_upload_request_matches_bytes(&wrong, bytes).is_err());
    }
}
