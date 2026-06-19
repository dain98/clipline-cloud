use std::{
    ffi::OsString,
    path::{Component, Path, PathBuf},
    sync::Arc,
    time::Duration,
};

use async_trait::async_trait;
use aws_config::BehaviorVersion;
use aws_credential_types::Credentials;
use aws_sdk_s3::{
    config::Region,
    presigning::PresigningConfig,
    primitives::ByteStream,
    types::{CompletedMultipartUpload, CompletedPart},
    Client,
};
use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine as _};
use bytes::Bytes;
use chrono::{DateTime, Utc};
use rand::{rngs::OsRng, RngCore};
use serde::{Deserialize, Serialize};
use thiserror::Error;
use tokio::{
    fs::{self, File, OpenOptions},
    io::{AsyncReadExt, AsyncSeekExt, AsyncWriteExt, SeekFrom},
};
use url::Url;

pub type StorageResult<T> = Result<T, StorageError>;
pub type SharedStorageBackend = Arc<dyn StorageBackend>;

#[derive(Debug, Error)]
pub enum StorageError {
    #[error("invalid object key {key:?}: {reason}")]
    InvalidKey { key: String, reason: &'static str },
    #[error("object not found: {0}")]
    NotFound(String),
    #[error("invalid byte range {start}-{end:?} for object of size {size}")]
    InvalidRange {
        start: u64,
        end: Option<u64>,
        size: u64,
    },
    #[error("invalid multipart part: {0}")]
    InvalidPart(String),
    #[error("multipart completion interrupted before final rename")]
    CompletionInterrupted,
    #[error("failed to parse URL: {0}")]
    Url(#[from] url::ParseError),
    #[error("I/O error: {0}")]
    Io(#[from] std::io::Error),
    #[error("S3 error: {0}")]
    S3(String),
}

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct ObjectKey(String);

impl ObjectKey {
    pub fn parse(key: impl Into<String>) -> StorageResult<Self> {
        let key = key.into();
        validate_key(&key)?;
        Ok(Self(key))
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl AsRef<str> for ObjectKey {
    fn as_ref(&self) -> &str {
        self.as_str()
    }
}

impl std::fmt::Display for ObjectKey {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str(self.as_str())
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct MediaObjectKeys {
    pub media_token: String,
    pub source: ObjectKey,
    pub poster: ObjectKey,
    pub thumbnail: ObjectKey,
}

impl MediaObjectKeys {
    pub fn generate() -> StorageResult<Self> {
        Self::from_media_token(generate_media_token())
    }

    pub fn from_media_token(media_token: String) -> StorageResult<Self> {
        validate_media_token(&media_token)?;

        Ok(Self {
            source: ObjectKey::parse(format!("objects/media/{media_token}/source.mp4"))?,
            poster: ObjectKey::parse(format!("objects/media/{media_token}/poster.jpg"))?,
            thumbnail: ObjectKey::parse(format!("objects/media/{media_token}/thumb_320.jpg"))?,
            media_token,
        })
    }

    pub fn from_source_key(source_key: &ObjectKey) -> StorageResult<Self> {
        let key = source_key.as_str();
        let media_token = key
            .strip_prefix("objects/media/")
            .and_then(|value| value.strip_suffix("/source.mp4"))
            .ok_or_else(|| StorageError::InvalidKey {
                key: key.to_string(),
                reason: "expected objects/media/<token>/source.mp4",
            })?;
        Self::from_media_token(media_token.to_string())
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ByteRange {
    pub start: u64,
    pub end_inclusive: Option<u64>,
}

impl ByteRange {
    pub fn new(start: u64, end_inclusive: Option<u64>) -> Self {
        Self {
            start,
            end_inclusive,
        }
    }

    fn s3_header_value(&self) -> String {
        match self.end_inclusive {
            Some(end) => format!("bytes={}-{}", self.start, end),
            None => format!("bytes={}-", self.start),
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ContentRange {
    pub start: u64,
    pub end_inclusive: u64,
    pub total_size: u64,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ObjectMetadata {
    pub size_bytes: u64,
    pub content_type: String,
    pub etag: Option<String>,
    pub last_modified: Option<DateTime<Utc>>,
    pub checksum_sha256: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct PutObjectMetadata {
    pub content_type: String,
    pub checksum_sha256: Option<String>,
}

impl PutObjectMetadata {
    pub fn new(content_type: impl Into<String>) -> Self {
        Self {
            content_type: content_type.into(),
            checksum_sha256: None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct StoredObject {
    pub bytes: Bytes,
    pub metadata: ObjectMetadata,
    pub content_range: Option<ContentRange>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ObjectSummary {
    pub key: ObjectKey,
    pub size_bytes: u64,
    pub last_modified: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct MultipartUploadSummary {
    pub upload_id: String,
    pub key: ObjectKey,
    pub initiated_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct PartResult {
    pub part_number: u16,
    pub etag: String,
    pub size_bytes: u64,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct PresignedUploadHeader {
    pub name: String,
    pub value: String,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct PresignedUploadPartUrl {
    pub url: Url,
    pub expires_at: DateTime<Utc>,
    pub headers: Vec<PresignedUploadHeader>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct CompletedUploadPart {
    pub part_number: u16,
    pub etag: String,
    pub size_bytes: u64,
}

impl From<PartResult> for CompletedUploadPart {
    fn from(value: PartResult) -> Self {
        Self {
            part_number: value.part_number,
            etag: value.etag,
            size_bytes: value.size_bytes,
        }
    }
}

#[async_trait]
pub trait StorageBackend: Send + Sync {
    async fn probe(&self) -> StorageResult<()>;
    async fn put_object(
        &self,
        key: &ObjectKey,
        bytes: Bytes,
        metadata: PutObjectMetadata,
    ) -> StorageResult<ObjectMetadata>;
    async fn get_object(
        &self,
        key: &ObjectKey,
        range: Option<ByteRange>,
    ) -> StorageResult<StoredObject>;
    async fn head_object(&self, key: &ObjectKey) -> StorageResult<ObjectMetadata>;
    async fn delete_object(&self, key: &ObjectKey) -> StorageResult<()>;
    async fn object_exists(&self, key: &ObjectKey) -> StorageResult<bool>;
    async fn list_objects(&self, prefix: &str) -> StorageResult<Vec<ObjectSummary>>;
    async fn create_multipart_upload(&self, key: &ObjectKey) -> StorageResult<String>;
    async fn list_multipart_uploads(
        &self,
        prefix: &str,
    ) -> StorageResult<Vec<MultipartUploadSummary>>;
    async fn upload_part(
        &self,
        upload_id: &str,
        key: &ObjectKey,
        part_number: u16,
        bytes: Bytes,
    ) -> StorageResult<PartResult>;
    async fn create_upload_part_url(
        &self,
        upload_id: &str,
        key: &ObjectKey,
        part_number: u16,
        ttl: Duration,
    ) -> StorageResult<Option<PresignedUploadPartUrl>>;
    async fn complete_multipart_upload(
        &self,
        upload_id: &str,
        key: &ObjectKey,
        parts: &[CompletedUploadPart],
    ) -> StorageResult<ObjectMetadata>;
    async fn abort_multipart_upload(&self, upload_id: &str, key: &ObjectKey) -> StorageResult<()>;
    async fn create_read_url(&self, key: &ObjectKey, ttl: Duration) -> StorageResult<Option<Url>>;
}

#[derive(Debug, Clone)]
pub struct LocalStorage {
    data_dir: PathBuf,
    tmp_uploads_dir: PathBuf,
}

impl LocalStorage {
    pub fn new(data_dir: impl Into<PathBuf>) -> Self {
        let data_dir = data_dir.into();
        let tmp_uploads_dir = data_dir.join("tmp").join("uploads");
        Self {
            data_dir,
            tmp_uploads_dir,
        }
    }

    pub fn data_dir(&self) -> &Path {
        &self.data_dir
    }

    fn path_for_key(&self, key: &ObjectKey) -> PathBuf {
        let mut path = self.data_dir.clone();
        for segment in key.as_str().split('/') {
            path.push(segment);
        }
        path
    }

    fn part_path(&self, upload_id: &str, part_number: u16) -> StorageResult<PathBuf> {
        validate_upload_id(upload_id)?;
        validate_part_number(part_number)?;
        Ok(self
            .tmp_uploads_dir
            .join(upload_id)
            .join(format!("part_{part_number:05}")))
    }

    fn upload_dir(&self, upload_id: &str) -> StorageResult<PathBuf> {
        validate_upload_id(upload_id)?;
        Ok(self.tmp_uploads_dir.join(upload_id))
    }

    async fn complete_multipart_upload_inner(
        &self,
        upload_id: &str,
        key: &ObjectKey,
        parts: &[CompletedUploadPart],
        interrupt_before_rename: bool,
    ) -> StorageResult<ObjectMetadata> {
        self.probe().await?;
        let sorted_parts = validate_completed_parts(parts)?;
        let final_path = self.path_for_key(key);
        let tmp_path = append_suffix(&final_path, ".tmp");

        if let Some(parent) = final_path.parent() {
            fs::create_dir_all(parent).await?;
        }

        let mut final_file = OpenOptions::new()
            .create(true)
            .truncate(true)
            .write(true)
            .open(&tmp_path)
            .await?;

        for part in &sorted_parts {
            let part_path = self.part_path(upload_id, part.part_number)?;
            let metadata = fs::metadata(&part_path)
                .await
                .map_err(|error| map_not_found(error, part_path.display().to_string()))?;
            if metadata.len() != part.size_bytes {
                return Err(StorageError::InvalidPart(format!(
                    "part {} size mismatch: expected {}, got {}",
                    part.part_number,
                    part.size_bytes,
                    metadata.len()
                )));
            }

            let expected_etag = local_part_etag(part.part_number, part.size_bytes);
            if part.etag != expected_etag {
                return Err(StorageError::InvalidPart(format!(
                    "part {} etag mismatch",
                    part.part_number
                )));
            }

            let mut part_file = File::open(part_path).await?;
            tokio::io::copy(&mut part_file, &mut final_file).await?;
        }

        final_file.flush().await?;
        final_file.sync_all().await?;
        drop(final_file);

        if interrupt_before_rename {
            return Err(StorageError::CompletionInterrupted);
        }

        fs::rename(&tmp_path, &final_path).await?;
        sync_parent_dir(&final_path).await;

        let metadata = self
            .write_sidecar(
                key,
                PutObjectMetadata::new(infer_content_type(key)),
                Some(local_object_etag(&final_path).await?),
            )
            .await?;
        let _ = fs::remove_dir_all(self.upload_dir(upload_id)?).await;

        Ok(metadata)
    }

    async fn read_upload_metadata(
        &self,
        upload_id: &str,
    ) -> StorageResult<Option<LocalUploadMetadata>> {
        match fs::read(self.upload_dir(upload_id)?.join("upload.json")).await {
            Ok(bytes) => serde_json::from_slice(&bytes)
                .map(Some)
                .map_err(|error| StorageError::InvalidPart(error.to_string())),
            Err(error) if error.kind() == std::io::ErrorKind::NotFound => Ok(None),
            Err(error) => Err(error.into()),
        }
    }

    async fn write_sidecar(
        &self,
        key: &ObjectKey,
        put_metadata: PutObjectMetadata,
        etag: Option<String>,
    ) -> StorageResult<ObjectMetadata> {
        let path = self.path_for_key(key);
        let file_metadata = fs::metadata(&path).await?;
        let etag = etag.or_else(|| Some(fallback_local_etag(&file_metadata)));
        let metadata = ObjectMetadata {
            size_bytes: file_metadata.len(),
            content_type: put_metadata.content_type,
            etag,
            last_modified: file_metadata.modified().ok().map(DateTime::<Utc>::from),
            checksum_sha256: put_metadata.checksum_sha256,
        };
        let sidecar = LocalMetadataSidecar::from(&metadata);
        let sidecar_path = sidecar_path(&path);
        if let Some(parent) = sidecar_path.parent() {
            fs::create_dir_all(parent).await?;
        }
        let bytes = serde_json::to_vec(&sidecar)
            .map_err(|error| StorageError::InvalidPart(error.to_string()))?;
        fs::write(sidecar_path, bytes).await?;

        Ok(metadata)
    }

    #[cfg(test)]
    async fn complete_multipart_upload_interrupt_before_rename(
        &self,
        upload_id: &str,
        key: &ObjectKey,
        parts: &[CompletedUploadPart],
    ) -> StorageResult<ObjectMetadata> {
        self.complete_multipart_upload_inner(upload_id, key, parts, true)
            .await
    }
}

#[async_trait]
impl StorageBackend for LocalStorage {
    async fn probe(&self) -> StorageResult<()> {
        fs::create_dir_all(&self.data_dir).await?;
        fs::create_dir_all(&self.tmp_uploads_dir).await?;
        Ok(())
    }

    async fn put_object(
        &self,
        key: &ObjectKey,
        bytes: Bytes,
        metadata: PutObjectMetadata,
    ) -> StorageResult<ObjectMetadata> {
        self.probe().await?;
        let final_path = self.path_for_key(key);
        let tmp_path = append_suffix(&final_path, ".tmp");

        if let Some(parent) = final_path.parent() {
            fs::create_dir_all(parent).await?;
        }

        let mut file = OpenOptions::new()
            .create(true)
            .truncate(true)
            .write(true)
            .open(&tmp_path)
            .await?;
        file.write_all(&bytes).await?;
        file.flush().await?;
        file.sync_all().await?;
        drop(file);

        fs::rename(&tmp_path, &final_path).await?;
        sync_parent_dir(&final_path).await;

        self.write_sidecar(key, metadata, Some(local_object_etag(&final_path).await?))
            .await
    }

    async fn get_object(
        &self,
        key: &ObjectKey,
        range: Option<ByteRange>,
    ) -> StorageResult<StoredObject> {
        let metadata = self.head_object(key).await?;
        let path = self.path_for_key(key);
        let mut file = File::open(&path)
            .await
            .map_err(|error| map_not_found(error, key.to_string()))?;

        let (start, end_inclusive, content_range) = match range {
            Some(range) => {
                let end = normalize_range(&range, metadata.size_bytes)?;
                (
                    range.start,
                    end,
                    Some(ContentRange {
                        start: range.start,
                        end_inclusive: end,
                        total_size: metadata.size_bytes,
                    }),
                )
            }
            None => (0, metadata.size_bytes.saturating_sub(1), None),
        };

        let len = if metadata.size_bytes == 0 {
            0
        } else {
            end_inclusive - start + 1
        };
        let mut bytes = vec![0_u8; len as usize];
        if len > 0 {
            file.seek(SeekFrom::Start(start)).await?;
            file.read_exact(&mut bytes).await?;
        }

        Ok(StoredObject {
            bytes: Bytes::from(bytes),
            metadata,
            content_range,
        })
    }

    async fn head_object(&self, key: &ObjectKey) -> StorageResult<ObjectMetadata> {
        let path = self.path_for_key(key);
        let file_metadata = fs::metadata(&path)
            .await
            .map_err(|error| map_not_found(error, key.to_string()))?;

        let sidecar = read_local_sidecar(&path).await?;
        Ok(ObjectMetadata {
            size_bytes: file_metadata.len(),
            content_type: sidecar
                .as_ref()
                .map(|value| value.content_type.clone())
                .unwrap_or_else(|| infer_content_type(key)),
            etag: sidecar
                .as_ref()
                .and_then(|value| value.etag.clone())
                .or_else(|| Some(fallback_local_etag(&file_metadata))),
            last_modified: file_metadata.modified().ok().map(DateTime::<Utc>::from),
            checksum_sha256: sidecar.and_then(|value| value.checksum_sha256),
        })
    }

    async fn delete_object(&self, key: &ObjectKey) -> StorageResult<()> {
        let path = self.path_for_key(key);
        match fs::remove_file(&path).await {
            Ok(()) => {}
            Err(error) if error.kind() == std::io::ErrorKind::NotFound => {}
            Err(error) => return Err(error.into()),
        }
        let _ = fs::remove_file(sidecar_path(&path)).await;
        Ok(())
    }

    async fn object_exists(&self, key: &ObjectKey) -> StorageResult<bool> {
        let path = self.path_for_key(key);
        match fs::metadata(path).await {
            Ok(metadata) => Ok(metadata.is_file()),
            Err(error) if error.kind() == std::io::ErrorKind::NotFound => Ok(false),
            Err(error) => Err(error.into()),
        }
    }

    async fn list_objects(&self, prefix: &str) -> StorageResult<Vec<ObjectSummary>> {
        validate_prefix(prefix)?;
        let start = self.data_dir.join(prefix.trim_end_matches('/'));
        let mut summaries = Vec::new();
        let mut dirs = vec![start];
        while let Some(dir) = dirs.pop() {
            let mut entries = match fs::read_dir(&dir).await {
                Ok(entries) => entries,
                Err(error) if error.kind() == std::io::ErrorKind::NotFound => continue,
                Err(error) => return Err(error.into()),
            };
            while let Some(entry) = entries.next_entry().await? {
                let path = entry.path();
                let metadata = entry.metadata().await?;
                if metadata.is_dir() {
                    dirs.push(path);
                    continue;
                }
                if !metadata.is_file() {
                    continue;
                }
                let Some(relative) = path.strip_prefix(&self.data_dir).ok() else {
                    continue;
                };
                let key = path_to_object_key(relative)?;
                if key.as_str().ends_with(".meta.json") || key.as_str().ends_with(".tmp") {
                    continue;
                }
                summaries.push(ObjectSummary {
                    key,
                    size_bytes: metadata.len(),
                    last_modified: metadata.modified().ok().map(DateTime::<Utc>::from),
                });
            }
        }
        summaries.sort_by(|left, right| left.key.as_str().cmp(right.key.as_str()));
        Ok(summaries)
    }

    async fn create_multipart_upload(&self, key: &ObjectKey) -> StorageResult<String> {
        self.probe().await?;
        let upload_id = generate_upload_id();
        let upload_dir = self.upload_dir(&upload_id)?;
        fs::create_dir(&upload_dir).await?;
        let metadata = LocalUploadMetadata {
            key: key.as_str().to_string(),
            created_at: Utc::now(),
        };
        let bytes = serde_json::to_vec(&metadata)
            .map_err(|error| StorageError::InvalidPart(error.to_string()))?;
        fs::write(upload_dir.join("upload.json"), bytes).await?;
        Ok(upload_id)
    }

    async fn list_multipart_uploads(
        &self,
        prefix: &str,
    ) -> StorageResult<Vec<MultipartUploadSummary>> {
        validate_prefix(prefix)?;
        let mut summaries = Vec::new();
        let mut entries = match fs::read_dir(&self.tmp_uploads_dir).await {
            Ok(entries) => entries,
            Err(error) if error.kind() == std::io::ErrorKind::NotFound => return Ok(summaries),
            Err(error) => return Err(error.into()),
        };
        while let Some(entry) = entries.next_entry().await? {
            let metadata = entry.metadata().await?;
            if !metadata.is_dir() {
                continue;
            }
            let Some(upload_id) = entry.file_name().to_str().map(ToOwned::to_owned) else {
                continue;
            };
            validate_upload_id(&upload_id)?;
            let upload_metadata = self.read_upload_metadata(&upload_id).await?;
            let key = upload_metadata
                .as_ref()
                .and_then(|value| ObjectKey::parse(value.key.clone()).ok())
                .unwrap_or_else(|| ObjectKey::parse("objects/media/unknown/source.mp4").unwrap());
            if !key.as_str().starts_with(prefix) {
                continue;
            }
            summaries.push(MultipartUploadSummary {
                upload_id,
                key,
                initiated_at: upload_metadata
                    .map(|value| value.created_at)
                    .or_else(|| metadata.modified().ok().map(DateTime::<Utc>::from)),
            });
        }
        summaries.sort_by(|left, right| left.upload_id.cmp(&right.upload_id));
        Ok(summaries)
    }

    async fn upload_part(
        &self,
        upload_id: &str,
        _key: &ObjectKey,
        part_number: u16,
        bytes: Bytes,
    ) -> StorageResult<PartResult> {
        validate_part_number(part_number)?;
        let part_path = self.part_path(upload_id, part_number)?;
        let tmp_path = append_suffix(&part_path, ".tmp");
        if let Some(parent) = part_path.parent() {
            fs::create_dir_all(parent).await?;
        }

        let mut file = OpenOptions::new()
            .create(true)
            .truncate(true)
            .write(true)
            .open(&tmp_path)
            .await?;
        file.write_all(&bytes).await?;
        file.flush().await?;
        file.sync_all().await?;
        drop(file);
        fs::rename(&tmp_path, &part_path).await?;

        Ok(PartResult {
            part_number,
            etag: local_part_etag(part_number, bytes.len() as u64),
            size_bytes: bytes.len() as u64,
        })
    }

    async fn create_upload_part_url(
        &self,
        _upload_id: &str,
        _key: &ObjectKey,
        part_number: u16,
        _ttl: Duration,
    ) -> StorageResult<Option<PresignedUploadPartUrl>> {
        validate_part_number(part_number)?;
        Ok(None)
    }

    async fn complete_multipart_upload(
        &self,
        upload_id: &str,
        key: &ObjectKey,
        parts: &[CompletedUploadPart],
    ) -> StorageResult<ObjectMetadata> {
        self.complete_multipart_upload_inner(upload_id, key, parts, false)
            .await
    }

    async fn abort_multipart_upload(&self, upload_id: &str, _key: &ObjectKey) -> StorageResult<()> {
        match fs::remove_dir_all(self.upload_dir(upload_id)?).await {
            Ok(()) => Ok(()),
            Err(error) if error.kind() == std::io::ErrorKind::NotFound => Ok(()),
            Err(error) => Err(error.into()),
        }
    }

    async fn create_read_url(
        &self,
        _key: &ObjectKey,
        _ttl: Duration,
    ) -> StorageResult<Option<Url>> {
        Ok(None)
    }
}

#[derive(Debug, Clone)]
pub struct S3StorageConfig {
    pub endpoint: String,
    pub bucket: String,
    pub region: String,
    pub access_key_id: String,
    pub secret_access_key: String,
    pub force_path_style: bool,
    pub prefix: Option<String>,
}

#[derive(Clone)]
pub struct S3Storage {
    client: Client,
    bucket: String,
    prefix: Option<String>,
}

impl S3Storage {
    pub async fn new(config: S3StorageConfig) -> StorageResult<Self> {
        let shared_config = aws_config::defaults(BehaviorVersion::latest())
            .region(Region::new(config.region.clone()))
            .credentials_provider(Credentials::new(
                config.access_key_id,
                config.secret_access_key,
                None,
                None,
                "clipline-cloud",
            ))
            .endpoint_url(config.endpoint)
            .load()
            .await;
        let s3_config = aws_sdk_s3::config::Builder::from(&shared_config)
            .force_path_style(config.force_path_style)
            .build();

        Ok(Self {
            client: Client::from_conf(s3_config),
            bucket: config.bucket,
            prefix: normalize_s3_prefix(config.prefix),
        })
    }

    fn physical_key(&self, key: &ObjectKey) -> String {
        match &self.prefix {
            Some(prefix) => format!("{prefix}/{}", key.as_str()),
            None => key.as_str().to_string(),
        }
    }

    fn physical_prefix(&self, prefix: &str) -> String {
        match &self.prefix {
            Some(storage_prefix) => format!("{storage_prefix}/{prefix}"),
            None => prefix.to_string(),
        }
    }

    fn logical_key(&self, physical_key: &str) -> Option<String> {
        match &self.prefix {
            Some(prefix) => physical_key
                .strip_prefix(prefix)
                .and_then(|value| value.strip_prefix('/'))
                .map(ToOwned::to_owned),
            None => Some(physical_key.to_string()),
        }
    }
}

#[async_trait]
impl StorageBackend for S3Storage {
    async fn probe(&self) -> StorageResult<()> {
        let mut request = self
            .client
            .list_objects_v2()
            .bucket(&self.bucket)
            .max_keys(1);
        if let Some(prefix) = &self.prefix {
            request = request.prefix(format!("{prefix}/"));
        }
        request.send().await.map_err(s3_error)?;
        Ok(())
    }

    async fn put_object(
        &self,
        key: &ObjectKey,
        bytes: Bytes,
        metadata: PutObjectMetadata,
    ) -> StorageResult<ObjectMetadata> {
        let physical_key = self.physical_key(key);
        let mut request = self
            .client
            .put_object()
            .bucket(&self.bucket)
            .key(&physical_key)
            .content_type(metadata.content_type.clone())
            .body(ByteStream::from(bytes.clone()));
        if let Some(checksum) = &metadata.checksum_sha256 {
            request = request.metadata("clipline-checksum-sha256", checksum);
        }
        request.send().await.map_err(s3_error)?;
        self.head_object(key).await
    }

    async fn get_object(
        &self,
        key: &ObjectKey,
        range: Option<ByteRange>,
    ) -> StorageResult<StoredObject> {
        let physical_key = self.physical_key(key);
        let mut request = self
            .client
            .get_object()
            .bucket(&self.bucket)
            .key(physical_key);
        if let Some(range) = &range {
            request = request.range(range.s3_header_value());
        }

        let output = request.send().await.map_err(s3_error)?;
        let body = output
            .body
            .collect()
            .await
            .map_err(|error| StorageError::S3(error.to_string()))?;
        let metadata = self.head_object(key).await?;
        let content_range = range
            .as_ref()
            .and_then(|range| {
                normalize_range(range, metadata.size_bytes)
                    .ok()
                    .map(|end| (range, end))
            })
            .map(|(range, end)| ContentRange {
                start: range.start,
                end_inclusive: end,
                total_size: metadata.size_bytes,
            });

        Ok(StoredObject {
            bytes: body.into_bytes(),
            metadata,
            content_range,
        })
    }

    async fn head_object(&self, key: &ObjectKey) -> StorageResult<ObjectMetadata> {
        let output = self
            .client
            .head_object()
            .bucket(&self.bucket)
            .key(self.physical_key(key))
            .send()
            .await
            .map_err(|error| {
                if is_s3_not_found(&error) {
                    StorageError::NotFound(key.to_string())
                } else {
                    s3_error(error)
                }
            })?;

        Ok(ObjectMetadata {
            size_bytes: output.content_length().unwrap_or(0).max(0) as u64,
            content_type: output
                .content_type()
                .map(ToOwned::to_owned)
                .unwrap_or_else(|| infer_content_type(key)),
            etag: output.e_tag().map(trim_s3_etag),
            last_modified: None,
            checksum_sha256: output
                .metadata()
                .and_then(|metadata| metadata.get("clipline-checksum-sha256").cloned()),
        })
    }

    async fn delete_object(&self, key: &ObjectKey) -> StorageResult<()> {
        self.client
            .delete_object()
            .bucket(&self.bucket)
            .key(self.physical_key(key))
            .send()
            .await
            .map_err(s3_error)?;
        Ok(())
    }

    async fn object_exists(&self, key: &ObjectKey) -> StorageResult<bool> {
        match self.head_object(key).await {
            Ok(_) => Ok(true),
            Err(StorageError::NotFound(_)) => Ok(false),
            Err(error) => Err(error),
        }
    }

    async fn list_objects(&self, prefix: &str) -> StorageResult<Vec<ObjectSummary>> {
        validate_prefix(prefix)?;
        let physical_prefix = self.physical_prefix(prefix);
        let mut continuation_token = None;
        let mut summaries = Vec::new();
        loop {
            let mut request = self
                .client
                .list_objects_v2()
                .bucket(&self.bucket)
                .prefix(&physical_prefix);
            if let Some(token) = continuation_token.take() {
                request = request.continuation_token(token);
            }
            let output = request.send().await.map_err(s3_error)?;
            for object in output.contents() {
                let Some(physical_key) = object.key() else {
                    continue;
                };
                let Some(logical_key) = self.logical_key(physical_key) else {
                    continue;
                };
                let key = ObjectKey::parse(logical_key)?;
                summaries.push(ObjectSummary {
                    key,
                    size_bytes: object.size().unwrap_or(0).max(0) as u64,
                    last_modified: object.last_modified().and_then(smithy_datetime_to_chrono),
                });
            }
            if output.is_truncated().unwrap_or(false) {
                continuation_token = output.next_continuation_token().map(ToOwned::to_owned);
                if continuation_token.is_none() {
                    break;
                }
            } else {
                break;
            }
        }
        Ok(summaries)
    }

    async fn create_multipart_upload(&self, key: &ObjectKey) -> StorageResult<String> {
        let output = self
            .client
            .create_multipart_upload()
            .bucket(&self.bucket)
            .key(self.physical_key(key))
            .content_type(infer_content_type(key))
            .send()
            .await
            .map_err(s3_error)?;

        output
            .upload_id()
            .map(ToOwned::to_owned)
            .ok_or_else(|| StorageError::S3("S3 did not return an upload id".to_string()))
    }

    async fn list_multipart_uploads(
        &self,
        prefix: &str,
    ) -> StorageResult<Vec<MultipartUploadSummary>> {
        validate_prefix(prefix)?;
        let physical_prefix = self.physical_prefix(prefix);
        let mut key_marker = None;
        let mut upload_id_marker = None;
        let mut summaries = Vec::new();
        loop {
            let mut request = self
                .client
                .list_multipart_uploads()
                .bucket(&self.bucket)
                .prefix(&physical_prefix);
            if let Some(marker) = key_marker.take() {
                request = request.key_marker(marker);
            }
            if let Some(marker) = upload_id_marker.take() {
                request = request.upload_id_marker(marker);
            }

            let output = request.send().await.map_err(s3_error)?;
            for upload in output.uploads() {
                let (Some(upload_id), Some(physical_key)) = (upload.upload_id(), upload.key())
                else {
                    continue;
                };
                let Some(logical_key) = self.logical_key(physical_key) else {
                    continue;
                };
                summaries.push(MultipartUploadSummary {
                    upload_id: upload_id.to_string(),
                    key: ObjectKey::parse(logical_key)?,
                    initiated_at: upload.initiated().and_then(smithy_datetime_to_chrono),
                });
            }

            if output.is_truncated().unwrap_or(false) {
                key_marker = output.next_key_marker().map(ToOwned::to_owned);
                upload_id_marker = output.next_upload_id_marker().map(ToOwned::to_owned);
                if key_marker.is_none() {
                    break;
                }
            } else {
                break;
            }
        }
        Ok(summaries)
    }

    async fn upload_part(
        &self,
        upload_id: &str,
        key: &ObjectKey,
        part_number: u16,
        bytes: Bytes,
    ) -> StorageResult<PartResult> {
        validate_part_number(part_number)?;
        let output = self
            .client
            .upload_part()
            .bucket(&self.bucket)
            .key(self.physical_key(key))
            .upload_id(upload_id)
            .part_number(i32::from(part_number))
            .body(ByteStream::from(bytes.clone()))
            .send()
            .await
            .map_err(s3_error)?;

        Ok(PartResult {
            part_number,
            etag: output.e_tag().map(trim_s3_etag).unwrap_or_default(),
            size_bytes: bytes.len() as u64,
        })
    }

    async fn create_upload_part_url(
        &self,
        upload_id: &str,
        key: &ObjectKey,
        part_number: u16,
        ttl: Duration,
    ) -> StorageResult<Option<PresignedUploadPartUrl>> {
        validate_part_number(part_number)?;
        let presigned = self
            .client
            .upload_part()
            .bucket(&self.bucket)
            .key(self.physical_key(key))
            .upload_id(upload_id)
            .part_number(i32::from(part_number))
            .presigned(
                PresigningConfig::expires_in(ttl)
                    .map_err(|error| StorageError::S3(error.to_string()))?,
            )
            .await
            .map_err(s3_error)?;

        let expires_at = Utc::now()
            + chrono::Duration::from_std(ttl)
                .map_err(|error| StorageError::S3(error.to_string()))?;

        let headers = presigned
            .headers()
            .map(|(name, value)| PresignedUploadHeader {
                name: name.to_string(),
                value: value.to_string(),
            })
            .collect();

        Ok(Some(PresignedUploadPartUrl {
            url: Url::parse(&presigned.uri().to_string())?,
            expires_at,
            headers,
        }))
    }

    async fn complete_multipart_upload(
        &self,
        upload_id: &str,
        key: &ObjectKey,
        parts: &[CompletedUploadPart],
    ) -> StorageResult<ObjectMetadata> {
        let parts = validate_completed_parts(parts)?;
        let completed_parts = parts
            .into_iter()
            .map(|part| {
                CompletedPart::builder()
                    .part_number(i32::from(part.part_number))
                    .e_tag(part.etag)
                    .build()
            })
            .collect::<Vec<_>>();

        self.client
            .complete_multipart_upload()
            .bucket(&self.bucket)
            .key(self.physical_key(key))
            .upload_id(upload_id)
            .multipart_upload(
                CompletedMultipartUpload::builder()
                    .set_parts(Some(completed_parts))
                    .build(),
            )
            .send()
            .await
            .map_err(s3_error)?;

        self.head_object(key).await
    }

    async fn abort_multipart_upload(&self, upload_id: &str, key: &ObjectKey) -> StorageResult<()> {
        match self
            .client
            .abort_multipart_upload()
            .bucket(&self.bucket)
            .key(self.physical_key(key))
            .upload_id(upload_id)
            .send()
            .await
        {
            Ok(_) => Ok(()),
            Err(error) if is_s3_not_found(&error) => Ok(()),
            Err(error) => Err(s3_error(error)),
        }
    }

    async fn create_read_url(&self, key: &ObjectKey, ttl: Duration) -> StorageResult<Option<Url>> {
        let cache_control = format!("private, max-age={}", ttl.as_secs());
        let presigned = self
            .client
            .get_object()
            .bucket(&self.bucket)
            .key(self.physical_key(key))
            .response_content_disposition("inline")
            .response_content_type(infer_content_type(key))
            .response_cache_control(cache_control)
            .presigned(
                PresigningConfig::expires_in(ttl)
                    .map_err(|error| StorageError::S3(error.to_string()))?,
            )
            .await
            .map_err(s3_error)?;

        Ok(Some(Url::parse(&presigned.uri().to_string())?))
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct LocalMetadataSidecar {
    content_type: String,
    etag: Option<String>,
    checksum_sha256: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct LocalUploadMetadata {
    key: String,
    created_at: DateTime<Utc>,
}

impl From<&ObjectMetadata> for LocalMetadataSidecar {
    fn from(value: &ObjectMetadata) -> Self {
        Self {
            content_type: value.content_type.clone(),
            etag: value.etag.clone(),
            checksum_sha256: value.checksum_sha256.clone(),
        }
    }
}

async fn read_local_sidecar(path: &Path) -> StorageResult<Option<LocalMetadataSidecar>> {
    let sidecar_path = sidecar_path(path);
    match fs::read(sidecar_path).await {
        Ok(bytes) => serde_json::from_slice(&bytes)
            .map(Some)
            .map_err(|error| StorageError::InvalidPart(error.to_string())),
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => Ok(None),
        Err(error) => Err(error.into()),
    }
}

fn validate_key(key: &str) -> StorageResult<()> {
    if key.is_empty() {
        return Err(StorageError::InvalidKey {
            key: key.to_string(),
            reason: "empty keys are not allowed",
        });
    }
    if key.starts_with('/') || key.contains('\\') {
        return Err(StorageError::InvalidKey {
            key: key.to_string(),
            reason: "absolute paths and backslashes are not allowed",
        });
    }
    if key
        .bytes()
        .any(|byte| !(byte.is_ascii_alphanumeric() || matches!(byte, b'/' | b'.' | b'_' | b'-')))
    {
        return Err(StorageError::InvalidKey {
            key: key.to_string(),
            reason: "only ASCII alphanumerics plus / . _ - are allowed",
        });
    }
    for component in Path::new(key).components() {
        match component {
            Component::Normal(_) => {}
            _ => {
                return Err(StorageError::InvalidKey {
                    key: key.to_string(),
                    reason: "path traversal components are not allowed",
                });
            }
        }
    }
    if key
        .split('/')
        .any(|segment| segment.is_empty() || segment == "." || segment == "..")
    {
        return Err(StorageError::InvalidKey {
            key: key.to_string(),
            reason: "empty, current-directory, and parent-directory segments are not allowed",
        });
    }

    Ok(())
}

fn validate_prefix(prefix: &str) -> StorageResult<()> {
    if prefix.is_empty() {
        return Ok(());
    }
    validate_key(prefix.trim_end_matches('/'))
}

fn path_to_object_key(path: &Path) -> StorageResult<ObjectKey> {
    let mut key = String::new();
    for component in path.components() {
        let Component::Normal(segment) = component else {
            return Err(StorageError::InvalidKey {
                key: path.display().to_string(),
                reason: "object path contains non-normal components",
            });
        };
        let Some(segment) = segment.to_str() else {
            return Err(StorageError::InvalidKey {
                key: path.display().to_string(),
                reason: "object path is not valid UTF-8",
            });
        };
        if !key.is_empty() {
            key.push('/');
        }
        key.push_str(segment);
    }
    ObjectKey::parse(key)
}

fn validate_media_token(media_token: &str) -> StorageResult<()> {
    if media_token.len() < 43
        || media_token
            .bytes()
            .any(|byte| !(byte.is_ascii_alphanumeric() || matches!(byte, b'_' | b'-')))
    {
        return Err(StorageError::InvalidKey {
            key: media_token.to_string(),
            reason: "media token must be base64url random bytes",
        });
    }

    Ok(())
}

fn validate_upload_id(upload_id: &str) -> StorageResult<()> {
    if upload_id.is_empty()
        || upload_id
            .bytes()
            .any(|byte| !(byte.is_ascii_alphanumeric() || matches!(byte, b'_' | b'-')))
    {
        return Err(StorageError::InvalidPart("invalid upload id".to_string()));
    }

    Ok(())
}

fn validate_part_number(part_number: u16) -> StorageResult<()> {
    if !(1..=10_000).contains(&part_number) {
        return Err(StorageError::InvalidPart(format!(
            "part number {part_number} is outside 1..=10000"
        )));
    }

    Ok(())
}

fn validate_completed_parts(
    parts: &[CompletedUploadPart],
) -> StorageResult<Vec<CompletedUploadPart>> {
    if parts.is_empty() {
        return Err(StorageError::InvalidPart(
            "multipart completion requires at least one part".to_string(),
        ));
    }

    let mut sorted = parts.to_vec();
    sorted.sort_by_key(|part| part.part_number);
    let mut previous = None;
    for part in &sorted {
        validate_part_number(part.part_number)?;
        if Some(part.part_number) == previous {
            return Err(StorageError::InvalidPart(format!(
                "duplicate part {}",
                part.part_number
            )));
        }
        previous = Some(part.part_number);
    }

    Ok(sorted)
}

fn generate_media_token() -> String {
    let mut bytes = [0_u8; 32];
    OsRng.fill_bytes(&mut bytes);
    URL_SAFE_NO_PAD.encode(bytes)
}

fn generate_upload_id() -> String {
    let mut bytes = [0_u8; 24];
    OsRng.fill_bytes(&mut bytes);
    URL_SAFE_NO_PAD.encode(bytes)
}

fn infer_content_type(key: &ObjectKey) -> String {
    match key.as_str().rsplit('.').next() {
        Some("mp4") => "video/mp4",
        Some("jpg" | "jpeg") => "image/jpeg",
        Some("png") => "image/png",
        Some("webp") => "image/webp",
        _ => "application/octet-stream",
    }
    .to_string()
}

fn normalize_range(range: &ByteRange, size: u64) -> StorageResult<u64> {
    if size == 0 || range.start >= size {
        return Err(StorageError::InvalidRange {
            start: range.start,
            end: range.end_inclusive,
            size,
        });
    }
    let end = range.end_inclusive.unwrap_or(size - 1).min(size - 1);
    if end < range.start {
        return Err(StorageError::InvalidRange {
            start: range.start,
            end: range.end_inclusive,
            size,
        });
    }

    Ok(end)
}

fn sidecar_path(path: &Path) -> PathBuf {
    append_suffix(path, ".meta.json")
}

fn append_suffix(path: &Path, suffix: &str) -> PathBuf {
    let mut value: OsString = path.as_os_str().to_os_string();
    value.push(suffix);
    PathBuf::from(value)
}

async fn local_object_etag(path: &Path) -> StorageResult<String> {
    let metadata = fs::metadata(path).await?;
    Ok(fallback_local_etag(&metadata))
}

fn fallback_local_etag(metadata: &std::fs::Metadata) -> String {
    let modified_nanos = metadata
        .modified()
        .ok()
        .and_then(|time| time.duration_since(std::time::UNIX_EPOCH).ok())
        .map(|duration| duration.as_nanos())
        .unwrap_or_default();
    format!("local-{}-{modified_nanos}", metadata.len())
}

fn local_part_etag(part_number: u16, size_bytes: u64) -> String {
    format!("local-part-{part_number}-{size_bytes}")
}

fn map_not_found(error: std::io::Error, key: String) -> StorageError {
    if error.kind() == std::io::ErrorKind::NotFound {
        StorageError::NotFound(key)
    } else {
        StorageError::Io(error)
    }
}

async fn sync_parent_dir(path: &Path) {
    let Some(parent) = path.parent() else {
        return;
    };
    if let Ok(dir) = File::open(parent).await {
        let _ = dir.sync_all().await;
    }
}

fn normalize_s3_prefix(prefix: Option<String>) -> Option<String> {
    prefix
        .map(|value| value.trim_matches('/').to_string())
        .filter(|value| !value.is_empty())
}

fn trim_s3_etag(etag: &str) -> String {
    etag.trim_matches('"').to_string()
}

fn s3_error(error: impl std::fmt::Display) -> StorageError {
    StorageError::S3(error.to_string())
}

fn is_s3_not_found(error: &impl std::fmt::Display) -> bool {
    let text = error.to_string();
    text.contains("NotFound")
        || text.contains("NoSuchKey")
        || text.contains("NoSuchUpload")
        || text.contains("404")
}

fn smithy_datetime_to_chrono(value: &aws_sdk_s3::primitives::DateTime) -> Option<DateTime<Utc>> {
    DateTime::<Utc>::from_timestamp(value.secs(), value.subsec_nanos())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn media_keys_are_random_and_do_not_contain_entity_ids() {
        let user_id = "01JZ0000000000000000000000";
        let clip_id = "01JZ1111111111111111111111";

        let keys = MediaObjectKeys::generate().expect("keys");

        assert_eq!(
            keys.source.as_str(),
            format!("objects/media/{}/source.mp4", keys.media_token)
        );
        assert!(keys.source.as_str().contains("objects/media/"));
        assert!(!keys.source.as_str().contains(user_id));
        assert!(!keys.source.as_str().contains(clip_id));
        assert!(keys.media_token.len() >= 43);
    }

    #[test]
    fn media_keys_can_be_reconstructed_from_source_key() {
        let keys = MediaObjectKeys::generate().expect("keys");
        let reconstructed = MediaObjectKeys::from_source_key(&keys.source).expect("reconstructed");

        assert_eq!(reconstructed, keys);
        assert!(MediaObjectKeys::from_source_key(
            &ObjectKey::parse("objects/other/source.mp4").unwrap()
        )
        .is_err());
    }

    #[test]
    fn object_key_rejects_path_traversal() {
        assert!(ObjectKey::parse("../source.mp4").is_err());
        assert!(ObjectKey::parse("objects/media/token/../source.mp4").is_err());
        assert!(ObjectKey::parse("/objects/media/token/source.mp4").is_err());
        assert!(ObjectKey::parse("objects\\media\\token\\source.mp4").is_err());
    }

    #[tokio::test]
    async fn local_put_head_get_range_delete_round_trip() {
        let temp_dir = tempfile::tempdir().expect("temp dir");
        let storage = LocalStorage::new(temp_dir.path());
        let key = MediaObjectKeys::generate().expect("keys").source;
        let mut put_metadata = PutObjectMetadata::new("video/mp4");
        put_metadata.checksum_sha256 = Some("checksum".to_string());

        let metadata = storage
            .put_object(&key, Bytes::from_static(b"0123456789"), put_metadata)
            .await
            .expect("put");

        assert_eq!(metadata.size_bytes, 10);
        assert!(storage.object_exists(&key).await.expect("exists"));
        assert_eq!(
            storage
                .head_object(&key)
                .await
                .expect("head")
                .checksum_sha256,
            Some("checksum".to_string())
        );

        let ranged = storage
            .get_object(&key, Some(ByteRange::new(2, Some(5))))
            .await
            .expect("range");
        assert_eq!(ranged.bytes, Bytes::from_static(b"2345"));
        assert_eq!(
            ranged.content_range,
            Some(ContentRange {
                start: 2,
                end_inclusive: 5,
                total_size: 10
            })
        );

        assert!(storage
            .create_read_url(&key, Duration::from_secs(60))
            .await
            .expect("read url")
            .is_none());

        storage.delete_object(&key).await.expect("delete");
        assert!(!storage.object_exists(&key).await.expect("not exists"));
    }

    #[tokio::test]
    async fn local_lists_objects_and_multipart_uploads() {
        let temp_dir = tempfile::tempdir().expect("temp dir");
        let storage = LocalStorage::new(temp_dir.path());
        let keys = MediaObjectKeys::generate().expect("keys");
        storage
            .put_object(
                &keys.source,
                Bytes::from_static(b"source"),
                PutObjectMetadata::new("video/mp4"),
            )
            .await
            .expect("put source");
        storage
            .put_object(
                &keys.thumbnail,
                Bytes::from_static(b"thumbnail"),
                PutObjectMetadata::new("image/jpeg"),
            )
            .await
            .expect("put thumb");
        let upload_id = storage
            .create_multipart_upload(&keys.poster)
            .await
            .expect("create multipart");

        let objects = storage
            .list_objects("objects/media/")
            .await
            .expect("list objects");
        assert_eq!(
            objects
                .iter()
                .map(|object| object.key.as_str())
                .collect::<Vec<_>>(),
            vec![keys.source.as_str(), keys.thumbnail.as_str()]
        );
        assert!(objects.iter().all(|object| object.last_modified.is_some()));

        let uploads = storage
            .list_multipart_uploads("objects/media/")
            .await
            .expect("list uploads");
        assert_eq!(uploads.len(), 1);
        assert_eq!(uploads[0].upload_id, upload_id);
        assert_eq!(uploads[0].key, keys.poster);
        assert!(uploads[0].initiated_at.is_some());
    }

    #[tokio::test]
    async fn local_multipart_completion_is_crash_safe_until_rename() {
        let temp_dir = tempfile::tempdir().expect("temp dir");
        let storage = LocalStorage::new(temp_dir.path());
        let key = MediaObjectKeys::generate().expect("keys").source;
        let upload_id = storage
            .create_multipart_upload(&key)
            .await
            .expect("upload id");
        let part1 = storage
            .upload_part(&upload_id, &key, 1, Bytes::from_static(b"hello "))
            .await
            .expect("part 1");
        let part2 = storage
            .upload_part(&upload_id, &key, 2, Bytes::from_static(b"world"))
            .await
            .expect("part 2");
        let parts = vec![part1.into(), part2.into()];

        let interrupted = storage
            .complete_multipart_upload_interrupt_before_rename(&upload_id, &key, &parts)
            .await
            .expect_err("interrupt");
        assert!(matches!(interrupted, StorageError::CompletionInterrupted));
        assert!(!storage.object_exists(&key).await.expect("not visible"));

        storage
            .complete_multipart_upload(&upload_id, &key, &parts)
            .await
            .expect("complete");
        let object = storage.get_object(&key, None).await.expect("object");
        assert_eq!(object.bytes, Bytes::from_static(b"hello world"));
    }

    #[tokio::test]
    async fn local_ready_probe_fails_when_data_dir_is_a_file() {
        let temp_dir = tempfile::tempdir().expect("temp dir");
        let path = temp_dir.path().join("not-a-directory");
        fs::write(&path, b"file").await.expect("write file");
        let storage = LocalStorage::new(path);

        assert!(storage.probe().await.is_err());
    }

    #[tokio::test]
    #[ignore = "requires CLIPLINE_TEST_S3_* env vars pointing at MinIO"]
    async fn s3_round_trip_against_minio() {
        let endpoint = std::env::var("CLIPLINE_TEST_S3_ENDPOINT").expect("endpoint");
        let bucket = std::env::var("CLIPLINE_TEST_S3_BUCKET").expect("bucket");
        let access_key_id = std::env::var("CLIPLINE_TEST_S3_ACCESS_KEY_ID").expect("access key");
        let secret_access_key =
            std::env::var("CLIPLINE_TEST_S3_SECRET_ACCESS_KEY").expect("secret key");
        let storage = S3Storage::new(S3StorageConfig {
            endpoint,
            bucket,
            region: "us-east-1".to_string(),
            access_key_id,
            secret_access_key,
            force_path_style: true,
            prefix: Some(format!("test-{}", generate_upload_id())),
        })
        .await
        .expect("storage");

        match storage
            .client
            .create_bucket()
            .bucket(&storage.bucket)
            .send()
            .await
        {
            Ok(_) => {}
            Err(error)
                if error.to_string().contains("BucketAlreadyOwnedByYou")
                    || error.to_string().contains("BucketAlreadyExists") => {}
            Err(error) => panic!("create bucket failed: {error}"),
        }

        storage.probe().await.expect("probe");

        let key = MediaObjectKeys::generate().expect("keys").source;
        storage
            .put_object(
                &key,
                Bytes::from_static(b"0123456789"),
                PutObjectMetadata::new("video/mp4"),
            )
            .await
            .expect("put");
        assert!(storage.object_exists(&key).await.expect("exists"));
        assert_eq!(
            storage
                .get_object(&key, Some(ByteRange::new(3, Some(6))))
                .await
                .expect("range")
                .bytes,
            Bytes::from_static(b"3456")
        );
        assert!(storage
            .create_read_url(&key, Duration::from_secs(60))
            .await
            .expect("presign")
            .is_some());
        storage.delete_object(&key).await.expect("delete object");

        let multipart_key = MediaObjectKeys::generate().expect("keys").source;
        let upload_id = storage
            .create_multipart_upload(&multipart_key)
            .await
            .expect("multipart create");
        let part1_bytes = Bytes::from(vec![b'a'; 5 * 1024 * 1024]);
        let part1 = storage
            .upload_part(&upload_id, &multipart_key, 1, part1_bytes)
            .await
            .expect("part 1");
        let part2 = storage
            .upload_part(&upload_id, &multipart_key, 2, Bytes::from_static(b"tail"))
            .await
            .expect("part 2");
        storage
            .complete_multipart_upload(&upload_id, &multipart_key, &[part1.into(), part2.into()])
            .await
            .expect("multipart complete");
        assert_eq!(
            storage
                .head_object(&multipart_key)
                .await
                .expect("multipart head")
                .size_bytes,
            5 * 1024 * 1024 + 4
        );
        storage
            .delete_object(&multipart_key)
            .await
            .expect("delete multipart object");
    }
}
