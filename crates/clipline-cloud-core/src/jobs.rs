use std::{collections::HashSet, time::Duration};

use chrono::Duration as ChronoDuration;
use clipline_cloud_db::{now_utc, Clip, Job, NewJob, Repositories, UploadSession};
use clipline_cloud_storage::{ObjectKey, SharedStorageBackend, StorageError};
use rand::{rngs::OsRng, Rng};
use sha2::{Digest, Sha256};
use thiserror::Error;
use tokio::{sync::watch, time::sleep};
use tracing::{debug, error, info, warn};

use crate::media_processing::{
    media_keys_for_clip, MediaProcessingError, MediaProcessor, ValidatedMediaMetadata,
};

pub const VALIDATE_OBJECT_KIND: &str = "validate_object";
pub const PROBE_METADATA_KIND: &str = "probe_metadata";
pub const THUMBNAIL_KIND: &str = "thumbnail";
pub const POSTER_KIND: &str = "poster";
pub const CLEANUP_SESSION_KIND: &str = "cleanup_session";
pub const CLEANUP_CLIP_KIND: &str = "cleanup_clip";
const CLEANUP_SESSION_BATCH_SIZE: i64 = 100;
const CLEANUP_SESSION_INTERVAL: Duration = Duration::from_secs(15 * 60);
const CLEANUP_CLIP_BATCH_SIZE: i64 = 100;
const CLEANUP_CLIP_INTERVAL: Duration = Duration::from_secs(30 * 60);
const CLEANUP_ORPHAN_GRACE: Duration = Duration::from_secs(60 * 60);
const MEDIA_OBJECT_PREFIX: &str = "objects/media/";

#[derive(Debug, Clone)]
pub struct JobRunnerConfig {
    pub runner_id: String,
    pub poll_interval: Duration,
    pub lock_timeout: Duration,
    pub retry_base_delay: Duration,
    pub retry_max_delay: Duration,
}

impl Default for JobRunnerConfig {
    fn default() -> Self {
        Self {
            runner_id: format!("runner-{}", clipline_cloud_db::new_ulid()),
            poll_interval: Duration::from_secs(1),
            lock_timeout: Duration::from_secs(5 * 60),
            retry_base_delay: Duration::from_secs(5),
            retry_max_delay: Duration::from_secs(5 * 60),
        }
    }
}

#[derive(Debug, Error)]
pub enum JobRunnerError {
    #[error(transparent)]
    Database(#[from] clipline_cloud_db::DbError),
    #[error(transparent)]
    Storage(#[from] StorageError),
    #[error(transparent)]
    MediaProcessing(#[from] MediaProcessingError),
    #[error("{0}")]
    InvalidJob(String),
    #[error("{0}")]
    Validation(String),
}

pub async fn enqueue_validate_object(
    repositories: &Repositories,
    clip_id: impl Into<String>,
) -> Result<Job, JobRunnerError> {
    enqueue_clip_job(repositories, VALIDATE_OBJECT_KIND, clip_id.into()).await
}

pub async fn enqueue_probe_metadata(
    repositories: &Repositories,
    clip_id: impl Into<String>,
) -> Result<Job, JobRunnerError> {
    enqueue_clip_job(repositories, PROBE_METADATA_KIND, clip_id.into()).await
}

pub async fn enqueue_thumbnail(
    repositories: &Repositories,
    clip_id: impl Into<String>,
) -> Result<Job, JobRunnerError> {
    enqueue_clip_job(repositories, THUMBNAIL_KIND, clip_id.into()).await
}

pub async fn enqueue_poster(
    repositories: &Repositories,
    clip_id: impl Into<String>,
) -> Result<Job, JobRunnerError> {
    enqueue_clip_job(repositories, POSTER_KIND, clip_id.into()).await
}

pub async fn ensure_cleanup_session_sweep(
    repositories: &Repositories,
) -> Result<Option<Job>, JobRunnerError> {
    if repositories
        .jobs
        .count_active_global_kind(CLEANUP_SESSION_KIND)
        .await?
        > 0
    {
        return Ok(None);
    }
    enqueue_cleanup_session_sweep(repositories, now_utc())
        .await
        .map(Some)
}

pub async fn ensure_cleanup_clip_sweep(
    repositories: &Repositories,
) -> Result<Option<Job>, JobRunnerError> {
    if repositories
        .jobs
        .count_active_global_kind(CLEANUP_CLIP_KIND)
        .await?
        > 0
    {
        return Ok(None);
    }
    enqueue_cleanup_clip_sweep(repositories, now_utc())
        .await
        .map(Some)
}

pub async fn enqueue_cleanup_session_sweep(
    repositories: &Repositories,
    next_run_at: chrono::DateTime<chrono::Utc>,
) -> Result<Job, JobRunnerError> {
    enqueue_global_job(repositories, CLEANUP_SESSION_KIND, next_run_at).await
}

pub async fn enqueue_cleanup_clip_sweep(
    repositories: &Repositories,
    next_run_at: chrono::DateTime<chrono::Utc>,
) -> Result<Job, JobRunnerError> {
    enqueue_global_job(repositories, CLEANUP_CLIP_KIND, next_run_at).await
}

async fn enqueue_clip_job(
    repositories: &Repositories,
    kind: &'static str,
    clip_id: String,
) -> Result<Job, JobRunnerError> {
    let mut job = NewJob::new(kind, now_utc());
    job.target_type = Some("clip".to_string());
    job.target_id = Some(clip_id);
    Ok(repositories.jobs.create(&job).await?)
}

async fn enqueue_global_job(
    repositories: &Repositories,
    kind: &'static str,
    next_run_at: chrono::DateTime<chrono::Utc>,
) -> Result<Job, JobRunnerError> {
    let job = NewJob::new(kind, next_run_at);
    Ok(repositories.jobs.create(&job).await?)
}

#[derive(Clone)]
pub struct JobRunner {
    repositories: Repositories,
    storage: SharedStorageBackend,
    config: JobRunnerConfig,
    media_processor: MediaProcessor,
}

impl JobRunner {
    pub fn new(
        repositories: Repositories,
        storage: SharedStorageBackend,
        config: JobRunnerConfig,
    ) -> Self {
        Self {
            repositories,
            storage,
            config,
            media_processor: MediaProcessor::default(),
        }
    }

    pub async fn run_until_shutdown(self, mut shutdown: watch::Receiver<bool>) {
        info!(
            event = "jobs.runner_started",
            runner_id = %self.config.runner_id,
            poll_interval_ms = self.config.poll_interval.as_millis(),
            lock_timeout_ms = self.config.lock_timeout.as_millis(),
        );

        loop {
            if *shutdown.borrow() {
                break;
            }

            match self.run_once().await {
                Ok(true) => continue,
                Ok(false) => {
                    tokio::select! {
                        _ = shutdown.changed() => {}
                        _ = sleep(self.config.poll_interval) => {}
                    }
                }
                Err(error) => {
                    error!(event = "jobs.runner_error", error = %error);
                    tokio::select! {
                        _ = shutdown.changed() => {}
                        _ = sleep(self.config.poll_interval) => {}
                    }
                }
            }
        }

        info!(event = "jobs.runner_stopped", runner_id = %self.config.runner_id);
    }

    pub async fn run_once(&self) -> Result<bool, JobRunnerError> {
        let now = now_utc();
        let stale_before = now - chrono_duration(self.config.lock_timeout);
        let Some(job) = self
            .repositories
            .jobs
            .claim_next(&self.config.runner_id, now, stale_before)
            .await?
        else {
            return Ok(false);
        };

        self.run_claimed_job(job).await?;
        Ok(true)
    }

    async fn run_claimed_job(&self, job: Job) -> Result<(), JobRunnerError> {
        debug!(
            event = "jobs.claimed",
            job_id = %job.id,
            kind = %job.kind,
            attempts = job.attempts,
            max_attempts = job.max_attempts,
        );
        if job.attempts > job.max_attempts {
            self.repositories
                .jobs
                .mark_dead(
                    &job.id,
                    job.attempts,
                    "job lock expired after maximum attempts",
                )
                .await?;
            warn!(
                event = "jobs.dead",
                job_id = %job.id,
                kind = %job.kind,
                attempts = job.attempts,
                message = "job lock expired after maximum attempts",
            );
            return Ok(());
        }

        let result = match job.kind.as_str() {
            VALIDATE_OBJECT_KIND => self.validate_object(&job).await,
            PROBE_METADATA_KIND => self.probe_metadata(&job).await,
            THUMBNAIL_KIND => self.generate_thumbnail(&job).await,
            POSTER_KIND => self.generate_poster(&job).await,
            CLEANUP_SESSION_KIND => self.cleanup_sessions(&job).await,
            CLEANUP_CLIP_KIND => self.cleanup_clips(&job).await,
            other => Err(JobRunnerError::InvalidJob(format!(
                "unknown job kind {other:?}"
            ))),
        };

        match result {
            Ok(()) => {
                self.repositories.jobs.mark_succeeded(&job.id).await?;
                info!(event = "jobs.succeeded", job_id = %job.id, kind = %job.kind);
            }
            Err(error) => {
                let error_message = error.to_string();
                let attempts = job.attempts;
                if attempts >= job.max_attempts {
                    self.repositories
                        .jobs
                        .mark_dead(&job.id, attempts, &error_message)
                        .await?;
                    if job.kind == VALIDATE_OBJECT_KIND {
                        if let Some(clip_id) = job.target_id.as_deref() {
                            let _ = self.repositories.clips.mark_failed(clip_id).await?;
                        }
                    }
                    if self
                        .enqueue_next_cleanup_sweep_for_kind(&job.kind, now_utc())
                        .await?
                    {
                        info!(
                            event = "jobs.cleanup_sweep_rearmed",
                            job_id = %job.id,
                            kind = %job.kind,
                        );
                    }
                    warn!(
                        event = "jobs.dead",
                        job_id = %job.id,
                        kind = %job.kind,
                        attempts,
                        error = %error_message,
                    );
                } else {
                    let next_run_at = now_utc() + chrono_duration(self.retry_delay(attempts));
                    self.repositories
                        .jobs
                        .mark_retry(&job.id, attempts, next_run_at, &error_message)
                        .await?;
                    warn!(
                        event = "jobs.retry_scheduled",
                        job_id = %job.id,
                        kind = %job.kind,
                        attempts,
                        next_run_at = %next_run_at,
                        error = %error_message,
                    );
                }
            }
        }

        Ok(())
    }

    async fn enqueue_next_cleanup_sweep_for_kind(
        &self,
        kind: &str,
        now: chrono::DateTime<chrono::Utc>,
    ) -> Result<bool, JobRunnerError> {
        match kind {
            CLEANUP_SESSION_KIND => {
                enqueue_cleanup_session_sweep(
                    &self.repositories,
                    now + chrono_duration(CLEANUP_SESSION_INTERVAL),
                )
                .await?;
                Ok(true)
            }
            CLEANUP_CLIP_KIND => {
                enqueue_cleanup_clip_sweep(
                    &self.repositories,
                    now + chrono_duration(CLEANUP_CLIP_INTERVAL),
                )
                .await?;
                Ok(true)
            }
            _ => Ok(false),
        }
    }

    fn retry_delay(&self, attempts: i64) -> Duration {
        let exponent = attempts.saturating_sub(1).clamp(0, 16) as u32;
        let base_ms = self.config.retry_base_delay.as_millis();
        let max_ms = self.config.retry_max_delay.as_millis();
        let delay_ms = base_ms.saturating_mul(2_u128.saturating_pow(exponent));
        let capped_ms = delay_ms.min(max_ms).try_into().unwrap_or(u64::MAX);
        if capped_ms <= 1 {
            return Duration::from_millis(capped_ms);
        }
        Duration::from_millis(OsRng.gen_range((capped_ms / 2)..=capped_ms))
    }

    async fn validate_object(&self, job: &Job) -> Result<(), JobRunnerError> {
        if job.target_type.as_deref() != Some("clip") {
            return Err(JobRunnerError::InvalidJob(
                "validate_object requires target_type=clip".to_string(),
            ));
        }
        let clip_id = job.target_id.as_deref().ok_or_else(|| {
            JobRunnerError::InvalidJob("validate_object requires target_id".to_string())
        })?;
        let clip =
            self.repositories.clips.get(clip_id).await?.ok_or_else(|| {
                JobRunnerError::Validation("target clip does not exist".to_string())
            })?;

        if clip.deleted_at.is_some() || clip.status == "deleted" {
            return Ok(());
        }
        if clip.status != "processing" && clip.status != "ready" {
            return Err(JobRunnerError::Validation(format!(
                "clip {} is in status {:?}, expected processing or ready",
                clip.id, clip.status
            )));
        }

        let storage_key = clip
            .storage_key
            .as_deref()
            .ok_or_else(|| JobRunnerError::Validation("clip is missing storage_key".to_string()))?;
        let expected_size = clip.file_size_bytes.ok_or_else(|| {
            JobRunnerError::Validation("clip is missing file_size_bytes".to_string())
        })?;
        let expected_size = u64::try_from(expected_size).map_err(|_| {
            JobRunnerError::Validation("clip file_size_bytes is negative".to_string())
        })?;
        let key = ObjectKey::parse(storage_key)?;
        let metadata = self.storage.head_object(&key).await?;
        if metadata.size_bytes != expected_size {
            return Err(JobRunnerError::Validation(format!(
                "object size mismatch: expected {}, got {}",
                expected_size, metadata.size_bytes
            )));
        }

        if clip.storage_backend == "s3" {
            if let Some(expected_checksum) = clip.checksum_sha256.as_deref() {
                let object = self.storage.get_object(&key, None).await?;
                let actual_checksum = sha256_hex(&object.bytes);
                if actual_checksum != expected_checksum {
                    return Err(JobRunnerError::Validation(
                        "object SHA-256 mismatch".to_string(),
                    ));
                }
            }
        }

        if !self.repositories.clips.mark_ready(&clip.id).await? {
            return Err(JobRunnerError::Validation(
                "clip could not transition to ready".to_string(),
            ));
        }

        self.enqueue_media_processing_jobs(&clip.id).await?;

        Ok(())
    }

    async fn enqueue_media_processing_jobs(&self, clip_id: &str) -> Result<(), JobRunnerError> {
        enqueue_probe_metadata(&self.repositories, clip_id).await?;
        enqueue_thumbnail(&self.repositories, clip_id).await?;
        enqueue_poster(&self.repositories, clip_id).await?;
        Ok(())
    }

    async fn probe_metadata(&self, job: &Job) -> Result<(), JobRunnerError> {
        let Some(clip) = self.load_ready_clip(job, PROBE_METADATA_KIND).await? else {
            return Ok(());
        };
        let source_key = clip_source_key(&clip)?;
        let metadata = self
            .media_processor
            .probe_metadata(&self.storage, &source_key)
            .await?;
        self.update_probe_metadata(&clip, metadata).await
    }

    async fn update_probe_metadata(
        &self,
        clip: &Clip,
        metadata: ValidatedMediaMetadata,
    ) -> Result<(), JobRunnerError> {
        self.repositories
            .clips
            .update_probe_metadata(
                &clip.id,
                metadata.duration_ms,
                metadata.width,
                metadata.height,
                metadata.fps,
                metadata.video_codec.as_deref(),
                metadata.audio_codec.as_deref(),
            )
            .await?;
        Ok(())
    }

    async fn generate_thumbnail(&self, job: &Job) -> Result<(), JobRunnerError> {
        let Some(clip) = self.load_ready_clip(job, THUMBNAIL_KIND).await? else {
            return Ok(());
        };
        let source_key = clip_source_key(&clip)?;
        let target_key = match clip
            .thumbnail_key
            .as_deref()
            .map(ObjectKey::parse)
            .transpose()?
        {
            Some(key) => key,
            None => media_keys_for_clip(&source_key)?.thumbnail,
        };

        self.media_processor
            .generate_thumbnail(&self.storage, &source_key, &target_key)
            .await?;
        self.repositories
            .clips
            .set_media_artifact_keys(&clip.id, None, Some(target_key.as_str()))
            .await?;
        Ok(())
    }

    async fn generate_poster(&self, job: &Job) -> Result<(), JobRunnerError> {
        let Some(clip) = self.load_ready_clip(job, POSTER_KIND).await? else {
            return Ok(());
        };
        let source_key = clip_source_key(&clip)?;
        let target_key = match clip
            .poster_key
            .as_deref()
            .map(ObjectKey::parse)
            .transpose()?
        {
            Some(key) => key,
            None => media_keys_for_clip(&source_key)?.poster,
        };

        self.media_processor
            .generate_poster(&self.storage, &source_key, &target_key)
            .await?;
        self.repositories
            .clips
            .set_media_artifact_keys(&clip.id, Some(target_key.as_str()), None)
            .await?;
        Ok(())
    }

    async fn load_ready_clip(&self, job: &Job, kind: &str) -> Result<Option<Clip>, JobRunnerError> {
        if job.target_type.as_deref() != Some("clip") {
            return Err(JobRunnerError::InvalidJob(format!(
                "{kind} requires target_type=clip"
            )));
        }
        let clip_id = job
            .target_id
            .as_deref()
            .ok_or_else(|| JobRunnerError::InvalidJob(format!("{kind} requires target_id")))?;
        let clip =
            self.repositories.clips.get(clip_id).await?.ok_or_else(|| {
                JobRunnerError::Validation("target clip does not exist".to_string())
            })?;

        if clip.deleted_at.is_some() || clip.status == "deleted" {
            return Ok(None);
        }
        if clip.status != "ready" {
            return Err(JobRunnerError::Validation(format!(
                "clip {} is in status {:?}, expected ready",
                clip.id, clip.status
            )));
        }
        Ok(Some(clip))
    }

    async fn cleanup_sessions(&self, job: &Job) -> Result<(), JobRunnerError> {
        if job.target_type.is_some() || job.target_id.is_some() {
            return Err(JobRunnerError::InvalidJob(
                "cleanup_session requires a global job target".to_string(),
            ));
        }

        let now = now_utc();
        let expired_sessions = self
            .repositories
            .upload_sessions
            .list_expired_active(now, CLEANUP_SESSION_BATCH_SIZE)
            .await?;
        for session in expired_sessions {
            self.cleanup_expired_upload_session(&session, now).await?;
        }

        self.enqueue_next_cleanup_sweep_for_kind(CLEANUP_SESSION_KIND, now)
            .await?;
        Ok(())
    }

    async fn cleanup_expired_upload_session(
        &self,
        session: &UploadSession,
        now: chrono::DateTime<chrono::Utc>,
    ) -> Result<(), JobRunnerError> {
        if self
            .repositories
            .upload_sessions
            .abort_if_expired(&session.id, now)
            .await?
        {
            if let Some(storage_upload_id) = session.storage_upload_id.as_deref() {
                let key = ObjectKey::parse(&session.storage_key)?;
                if let Err(error) = self
                    .storage
                    .abort_multipart_upload(storage_upload_id, &key)
                    .await
                {
                    if !matches!(error, StorageError::NotFound(_)) {
                        warn!(
                            event = "jobs.cleanup_session_abort_storage_failed",
                            session_id = %session.id,
                            storage_upload_id = %storage_upload_id,
                            error = %error,
                        );
                    }
                }
            }
            self.repositories
                .upload_parts
                .delete_for_session(&session.id)
                .await?;
            self.repositories
                .clips
                .soft_delete(&session.clip_id)
                .await?;
        }
        Ok(())
    }

    async fn cleanup_clips(&self, job: &Job) -> Result<(), JobRunnerError> {
        if job.target_type.is_some() || job.target_id.is_some() {
            return Err(JobRunnerError::InvalidJob(
                "cleanup_clip requires a global job target".to_string(),
            ));
        }

        let now = now_utc();
        self.cleanup_deleted_clips().await?;
        self.mark_ready_clips_with_missing_source().await?;
        self.delete_orphan_media_objects(now).await?;
        self.abort_orphan_multipart_uploads(now).await?;

        self.enqueue_next_cleanup_sweep_for_kind(CLEANUP_CLIP_KIND, now)
            .await?;
        Ok(())
    }

    async fn cleanup_deleted_clips(&self) -> Result<(), JobRunnerError> {
        let deleted_clips = self
            .repositories
            .clips
            .list_deleted(CLEANUP_CLIP_BATCH_SIZE)
            .await?;
        for clip in deleted_clips {
            self.delete_clip_objects(&clip).await?;
            self.repositories
                .upload_sessions
                .delete_for_clip(&clip.id)
                .await?;
            self.repositories.clips.delete(&clip.id).await?;
        }
        Ok(())
    }

    async fn delete_clip_objects(&self, clip: &Clip) -> Result<(), JobRunnerError> {
        let mut keys = HashSet::new();
        for key in [
            clip.storage_key.as_deref(),
            clip.poster_key.as_deref(),
            clip.thumbnail_key.as_deref(),
        ]
        .into_iter()
        .flatten()
        {
            keys.insert(key.to_string());
        }

        for key in keys {
            let key = ObjectKey::parse(key)?;
            if let Err(error) = self.storage.delete_object(&key).await {
                if !matches!(error, StorageError::NotFound(_)) {
                    return Err(error.into());
                }
            }
        }
        Ok(())
    }

    async fn mark_ready_clips_with_missing_source(&self) -> Result<(), JobRunnerError> {
        let ready_clips = self
            .repositories
            .clips
            .list_ready_with_storage_key(CLEANUP_CLIP_BATCH_SIZE)
            .await?;
        for clip in ready_clips {
            let source_key = clip_source_key(&clip)?;
            if !self.storage.object_exists(&source_key).await? {
                self.repositories.clips.mark_failed(&clip.id).await?;
            }
        }
        Ok(())
    }

    async fn delete_orphan_media_objects(
        &self,
        now: chrono::DateTime<chrono::Utc>,
    ) -> Result<(), JobRunnerError> {
        let active_references = self
            .repositories
            .clips
            .list_active_storage_references()
            .await?
            .into_iter()
            .collect::<HashSet<_>>();
        let objects = self.storage.list_objects(MEDIA_OBJECT_PREFIX).await?;
        for object in objects {
            if active_references.contains(object.key.as_str()) {
                continue;
            }
            if !is_older_than(object.last_modified, now, CLEANUP_ORPHAN_GRACE) {
                continue;
            }
            if let Err(error) = self.storage.delete_object(&object.key).await {
                if !matches!(error, StorageError::NotFound(_)) {
                    return Err(error.into());
                }
            }
        }
        Ok(())
    }

    async fn abort_orphan_multipart_uploads(
        &self,
        now: chrono::DateTime<chrono::Utc>,
    ) -> Result<(), JobRunnerError> {
        let active_upload_ids = self
            .repositories
            .upload_sessions
            .list_active_storage_upload_ids()
            .await?
            .into_iter()
            .collect::<HashSet<_>>();
        let uploads = self
            .storage
            .list_multipart_uploads(MEDIA_OBJECT_PREFIX)
            .await?;
        for upload in uploads {
            if active_upload_ids.contains(&upload.upload_id) {
                continue;
            }
            if !is_older_than(upload.initiated_at, now, CLEANUP_ORPHAN_GRACE) {
                continue;
            }
            self.storage
                .abort_multipart_upload(&upload.upload_id, &upload.key)
                .await?;
        }
        Ok(())
    }
}

fn clip_source_key(clip: &Clip) -> Result<ObjectKey, JobRunnerError> {
    let storage_key = clip
        .storage_key
        .as_deref()
        .ok_or_else(|| JobRunnerError::Validation("clip is missing storage_key".to_string()))?;
    ObjectKey::parse(storage_key).map_err(Into::into)
}

fn chrono_duration(duration: Duration) -> ChronoDuration {
    ChronoDuration::from_std(duration).unwrap_or_else(|_| ChronoDuration::seconds(i64::MAX))
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

fn is_older_than(
    timestamp: Option<chrono::DateTime<chrono::Utc>>,
    now: chrono::DateTime<chrono::Utc>,
    age: Duration,
) -> bool {
    timestamp.is_some_and(|timestamp| timestamp <= now - chrono_duration(age))
}

#[cfg(test)]
mod tests {
    use std::sync::Arc;

    use clipline_cloud_db::{
        Database, NewClip, NewUploadPart, NewUploadSession, NewUser, Repositories,
    };
    use clipline_cloud_storage::{
        LocalStorage, MediaObjectKeys, PutObjectMetadata, StorageBackend,
    };
    use tokio::fs;
    use tokio::sync::watch;

    use super::*;

    async fn sqlite_repositories() -> (tempfile::TempDir, Repositories) {
        let temp_dir = tempfile::tempdir().expect("temp dir");
        let database_url = format!("sqlite://{}", temp_dir.path().join("test.db").display());
        let database = Database::connect_and_migrate(&database_url)
            .await
            .expect("database");
        (temp_dir, Repositories::new(database))
    }

    #[tokio::test]
    async fn validate_object_marks_processing_clip_ready() {
        let (temp_dir, repositories) = sqlite_repositories().await;
        let storage = Arc::new(LocalStorage::new(temp_dir.path().join("storage")));
        storage.probe().await.expect("probe");
        let user = repositories
            .users
            .create(&NewUser::new("admin", "hash", "admin"))
            .await
            .expect("user");
        let keys = MediaObjectKeys::generate().expect("keys");
        let bytes = bytes::Bytes::from_static(b"ready-object");
        storage
            .put_object(
                &keys.source,
                bytes.clone(),
                PutObjectMetadata::new("video/mp4"),
            )
            .await
            .expect("put object");
        let mut clip = NewClip::new(&user.id, "ready clip", "local");
        clip.status = "processing".to_string();
        clip.file_size_bytes = Some(bytes.len() as i64);
        clip.storage_key = Some(keys.source.as_str().to_string());
        let clip = repositories.clips.create(&clip).await.expect("clip");
        let job = enqueue_validate_object(&repositories, &clip.id)
            .await
            .expect("enqueue");

        let runner = JobRunner::new(
            repositories.clone(),
            storage,
            JobRunnerConfig {
                runner_id: "test-runner".to_string(),
                poll_interval: Duration::from_millis(10),
                lock_timeout: Duration::from_secs(60),
                retry_base_delay: Duration::from_millis(1),
                retry_max_delay: Duration::from_millis(10),
            },
        );
        assert!(runner.run_once().await.expect("run once"));

        let clip = repositories
            .clips
            .get(&clip.id)
            .await
            .expect("get clip")
            .expect("clip exists");
        assert_eq!(clip.status, "ready");
        let job = repositories
            .jobs
            .get(&job.id)
            .await
            .expect("get job")
            .expect("job exists");
        assert_eq!(job.status, "succeeded");

        let mut queued_kinds = repositories
            .jobs
            .list_due(now_utc() + chrono::Duration::seconds(1), 10)
            .await
            .expect("due jobs")
            .into_iter()
            .map(|job| job.kind)
            .collect::<Vec<_>>();
        queued_kinds.sort();
        assert_eq!(
            queued_kinds,
            vec![
                POSTER_KIND.to_string(),
                PROBE_METADATA_KIND.to_string(),
                THUMBNAIL_KIND.to_string()
            ]
        );
    }

    #[tokio::test]
    async fn failing_job_retries_then_goes_dead_and_marks_clip_failed() {
        let (temp_dir, repositories) = sqlite_repositories().await;
        let storage = Arc::new(LocalStorage::new(temp_dir.path().join("storage")));
        storage.probe().await.expect("probe");
        let user = repositories
            .users
            .create(&NewUser::new("admin", "hash", "admin"))
            .await
            .expect("user");
        let mut clip = NewClip::new(&user.id, "missing object", "local");
        clip.status = "processing".to_string();
        clip.file_size_bytes = Some(10);
        clip.storage_key = Some(
            "objects/media/missing000000000000000000000000000000000000/source.mp4".to_string(),
        );
        let clip = repositories.clips.create(&clip).await.expect("clip");
        let mut job = NewJob::new(VALIDATE_OBJECT_KIND, now_utc());
        job.target_type = Some("clip".to_string());
        job.target_id = Some(clip.id.clone());
        job.max_attempts = 1;
        let job = repositories.jobs.create(&job).await.expect("job");

        let runner = JobRunner::new(
            repositories.clone(),
            storage,
            JobRunnerConfig {
                runner_id: "test-runner".to_string(),
                poll_interval: Duration::from_millis(10),
                lock_timeout: Duration::from_secs(60),
                retry_base_delay: Duration::from_millis(1),
                retry_max_delay: Duration::from_millis(10),
            },
        );
        assert!(runner.run_once().await.expect("run once"));

        let job = repositories
            .jobs
            .get(&job.id)
            .await
            .expect("get job")
            .expect("job exists");
        assert_eq!(job.status, "dead");
        assert_eq!(job.attempts, 1);
        assert!(job.last_error.is_some());
        let clip = repositories
            .clips
            .get(&clip.id)
            .await
            .expect("get clip")
            .expect("clip exists");
        assert_eq!(clip.status, "failed");
    }

    #[tokio::test]
    async fn cleanup_session_aborts_expired_uploads_and_schedules_next_sweep() {
        let (temp_dir, repositories) = sqlite_repositories().await;
        let storage = Arc::new(LocalStorage::new(temp_dir.path().join("storage")));
        storage.probe().await.expect("probe");
        let user = repositories
            .users
            .create(&NewUser::new("admin", "hash", "admin"))
            .await
            .expect("user");
        let keys = MediaObjectKeys::generate().expect("keys");
        let upload_id = storage
            .create_multipart_upload(&keys.source)
            .await
            .expect("create multipart");
        let uploaded_part = storage
            .upload_part(
                &upload_id,
                &keys.source,
                1,
                bytes::Bytes::from_static(b"partial"),
            )
            .await
            .expect("upload part");

        let mut clip = NewClip::new(&user.id, "expired upload", "local");
        clip.storage_key = Some(keys.source.as_str().to_string());
        let clip = repositories.clips.create(&clip).await.expect("clip");
        let mut session = NewUploadSession::new(
            &clip.id,
            &user.id,
            1024,
            keys.source.as_str(),
            now_utc() - chrono::Duration::minutes(1),
        );
        session.status = "uploading".to_string();
        session.storage_upload_id = Some(upload_id.clone());
        let session = repositories
            .upload_sessions
            .create(&session)
            .await
            .expect("session");
        let mut part = NewUploadPart::new(
            &session.id,
            i64::from(uploaded_part.part_number),
            uploaded_part.size_bytes as i64,
        );
        part.etag = Some(uploaded_part.etag);
        repositories
            .upload_parts
            .upsert(&part)
            .await
            .expect("part row");
        let job = enqueue_cleanup_session_sweep(&repositories, now_utc())
            .await
            .expect("enqueue cleanup");

        let runner = JobRunner::new(
            repositories.clone(),
            storage.clone(),
            JobRunnerConfig {
                runner_id: "test-runner".to_string(),
                poll_interval: Duration::from_millis(10),
                lock_timeout: Duration::from_secs(60),
                retry_base_delay: Duration::from_millis(1),
                retry_max_delay: Duration::from_millis(10),
            },
        );
        assert!(runner.run_once().await.expect("run once"));

        let session = repositories
            .upload_sessions
            .get(&session.id)
            .await
            .expect("get session")
            .expect("session exists");
        assert_eq!(session.status, "aborted");
        let clip = repositories
            .clips
            .get(&clip.id)
            .await
            .expect("get clip")
            .expect("clip exists");
        assert_eq!(clip.status, "deleted");
        assert!(repositories
            .upload_parts
            .list_for_session(&session.id)
            .await
            .expect("parts")
            .is_empty());
        let job = repositories
            .jobs
            .get(&job.id)
            .await
            .expect("get job")
            .expect("job exists");
        assert_eq!(job.status, "succeeded");

        let next_sweep = repositories
            .jobs
            .list_due(now_utc() + chrono::Duration::minutes(16), 10)
            .await
            .expect("due jobs")
            .into_iter()
            .find(|job| job.kind == CLEANUP_SESSION_KIND)
            .expect("next cleanup sweep");
        assert_eq!(next_sweep.target_type, None);
        assert_eq!(next_sweep.target_id, None);
    }

    #[tokio::test]
    async fn cleanup_session_keeps_single_put_object_after_guarded_abort() {
        let (temp_dir, repositories) = sqlite_repositories().await;
        let storage = Arc::new(LocalStorage::new(temp_dir.path().join("storage")));
        storage.probe().await.expect("probe");
        let user = repositories
            .users
            .create(&NewUser::new("admin", "hash", "admin"))
            .await
            .expect("user");
        let keys = MediaObjectKeys::generate().expect("keys");
        storage
            .put_object(
                &keys.source,
                bytes::Bytes::from_static(b"finished body"),
                PutObjectMetadata::new("video/mp4"),
            )
            .await
            .expect("put object");

        let mut clip = NewClip::new(&user.id, "expired single put", "local");
        clip.storage_key = Some(keys.source.as_str().to_string());
        let clip = repositories.clips.create(&clip).await.expect("clip");
        let mut session = NewUploadSession::new(
            &clip.id,
            &user.id,
            1024,
            keys.source.as_str(),
            now_utc() - chrono::Duration::minutes(1),
        );
        session.status = "uploading".to_string();
        let session = repositories
            .upload_sessions
            .create(&session)
            .await
            .expect("session");
        enqueue_cleanup_session_sweep(&repositories, now_utc())
            .await
            .expect("enqueue cleanup");

        let runner = JobRunner::new(
            repositories.clone(),
            storage.clone(),
            JobRunnerConfig {
                runner_id: "test-runner".to_string(),
                poll_interval: Duration::from_millis(10),
                lock_timeout: Duration::from_secs(60),
                retry_base_delay: Duration::from_millis(1),
                retry_max_delay: Duration::from_millis(10),
            },
        );
        assert!(runner.run_once().await.expect("run once"));

        let session = repositories
            .upload_sessions
            .get(&session.id)
            .await
            .expect("get session")
            .expect("session exists");
        assert_eq!(session.status, "aborted");
        let clip = repositories
            .clips
            .get(&clip.id)
            .await
            .expect("get clip")
            .expect("clip exists");
        assert_eq!(clip.status, "deleted");
        assert!(storage
            .object_exists(&keys.source)
            .await
            .expect("object is retained for orphan cleanup"));
    }

    #[tokio::test]
    async fn dead_cleanup_sweep_rearms_next_global_sweep() {
        assert_dead_cleanup_rearms(CLEANUP_SESSION_KIND, chrono::Duration::minutes(16)).await;
        assert_dead_cleanup_rearms(CLEANUP_CLIP_KIND, chrono::Duration::minutes(31)).await;
    }

    async fn assert_dead_cleanup_rearms(kind: &'static str, due_after: chrono::Duration) {
        let (temp_dir, repositories) = sqlite_repositories().await;
        let storage = Arc::new(LocalStorage::new(temp_dir.path().join("storage")));
        storage.probe().await.expect("probe");
        let mut job = NewJob::new(kind, now_utc());
        job.target_type = Some("clip".to_string());
        job.max_attempts = 1;
        let job = repositories.jobs.create(&job).await.expect("job");
        let runner = JobRunner::new(
            repositories.clone(),
            storage,
            JobRunnerConfig {
                runner_id: "test-runner".to_string(),
                poll_interval: Duration::from_millis(10),
                lock_timeout: Duration::from_secs(60),
                retry_base_delay: Duration::from_millis(1),
                retry_max_delay: Duration::from_millis(10),
            },
        );

        assert!(runner.run_once().await.expect("run once"));

        let dead_job = repositories
            .jobs
            .get(&job.id)
            .await
            .expect("get job")
            .expect("job exists");
        assert_eq!(dead_job.status, "dead");
        let next_sweep = repositories
            .jobs
            .list_due(now_utc() + due_after, 10)
            .await
            .expect("due jobs")
            .into_iter()
            .find(|job| job.kind == kind)
            .expect("next cleanup sweep");
        assert_eq!(next_sweep.status, "pending");
        assert_eq!(next_sweep.target_type, None);
        assert_eq!(next_sweep.target_id, None);
    }

    #[tokio::test]
    async fn cleanup_clip_removes_deleted_rows_and_orphan_uploads() {
        let (temp_dir, repositories) = sqlite_repositories().await;
        let storage = Arc::new(LocalStorage::new(temp_dir.path().join("storage")));
        storage.probe().await.expect("probe");
        let user = repositories
            .users
            .create(&NewUser::new("admin", "hash", "admin"))
            .await
            .expect("user");

        let deleted_keys = MediaObjectKeys::generate().expect("deleted keys");
        for key in [
            &deleted_keys.source,
            &deleted_keys.poster,
            &deleted_keys.thumbnail,
        ] {
            storage
                .put_object(
                    key,
                    bytes::Bytes::from_static(b"deleted"),
                    PutObjectMetadata::new("application/octet-stream"),
                )
                .await
                .expect("put deleted object");
        }
        let mut deleted_clip = NewClip::new(&user.id, "deleted clip", "local");
        deleted_clip.status = "deleted".to_string();
        deleted_clip.deleted_at = Some(now_utc());
        deleted_clip.storage_key = Some(deleted_keys.source.as_str().to_string());
        deleted_clip.poster_key = Some(deleted_keys.poster.as_str().to_string());
        deleted_clip.thumbnail_key = Some(deleted_keys.thumbnail.as_str().to_string());
        let deleted_clip = repositories
            .clips
            .create(&deleted_clip)
            .await
            .expect("deleted clip");
        let deleted_session = repositories
            .upload_sessions
            .create(&NewUploadSession::new(
                &deleted_clip.id,
                &user.id,
                1024,
                deleted_keys.source.as_str(),
                now_utc() + chrono::Duration::hours(1),
            ))
            .await
            .expect("deleted upload session");

        let missing_keys = MediaObjectKeys::generate().expect("missing keys");
        let mut missing_clip = NewClip::new(&user.id, "missing source", "local");
        missing_clip.status = "ready".to_string();
        missing_clip.storage_key = Some(missing_keys.source.as_str().to_string());
        let missing_clip = repositories
            .clips
            .create(&missing_clip)
            .await
            .expect("missing clip");

        let orphan_keys = MediaObjectKeys::generate().expect("orphan keys");
        let orphan_upload_id = storage
            .create_multipart_upload(&orphan_keys.source)
            .await
            .expect("create orphan multipart");
        let old_created_at = (now_utc() - chrono::Duration::hours(2)).to_rfc3339();
        let upload_metadata = format!(
            r#"{{"key":"{}","created_at":"{}"}}"#,
            orphan_keys.source.as_str(),
            old_created_at
        );
        fs::write(
            temp_dir
                .path()
                .join("storage/tmp/uploads")
                .join(&orphan_upload_id)
                .join("upload.json"),
            upload_metadata,
        )
        .await
        .expect("age orphan upload");

        let job = enqueue_cleanup_clip_sweep(&repositories, now_utc())
            .await
            .expect("enqueue cleanup");
        let runner = JobRunner::new(
            repositories.clone(),
            storage.clone(),
            JobRunnerConfig {
                runner_id: "test-runner".to_string(),
                poll_interval: Duration::from_millis(10),
                lock_timeout: Duration::from_secs(60),
                retry_base_delay: Duration::from_millis(1),
                retry_max_delay: Duration::from_millis(10),
            },
        );
        assert!(runner.run_once().await.expect("run once"));

        assert!(repositories
            .clips
            .get(&deleted_clip.id)
            .await
            .expect("get deleted clip")
            .is_none());
        assert!(repositories
            .upload_sessions
            .get(&deleted_session.id)
            .await
            .expect("get deleted session")
            .is_none());
        for key in [
            &deleted_keys.source,
            &deleted_keys.poster,
            &deleted_keys.thumbnail,
        ] {
            assert!(!storage.object_exists(key).await.expect("object gone"));
        }

        let missing_clip = repositories
            .clips
            .get(&missing_clip.id)
            .await
            .expect("get missing clip")
            .expect("missing clip still exists");
        assert_eq!(missing_clip.status, "failed");

        let uploads = storage
            .list_multipart_uploads(MEDIA_OBJECT_PREFIX)
            .await
            .expect("uploads");
        assert!(!uploads
            .iter()
            .any(|upload| upload.upload_id == orphan_upload_id));

        let job = repositories
            .jobs
            .get(&job.id)
            .await
            .expect("get job")
            .expect("job exists");
        assert_eq!(job.status, "succeeded");
    }

    #[tokio::test]
    async fn run_until_shutdown_exits_when_requested() {
        let (temp_dir, repositories) = sqlite_repositories().await;
        let storage = Arc::new(LocalStorage::new(temp_dir.path().join("storage")));
        let (sender, receiver) = watch::channel(false);
        let runner = JobRunner::new(
            repositories,
            storage,
            JobRunnerConfig {
                runner_id: "test-runner".to_string(),
                poll_interval: Duration::from_millis(1),
                lock_timeout: Duration::from_secs(60),
                retry_base_delay: Duration::from_millis(1),
                retry_max_delay: Duration::from_millis(10),
            },
        );
        let handle = tokio::spawn(runner.run_until_shutdown(receiver));
        sender.send(true).expect("send shutdown");
        handle.await.expect("runner task");
    }
}
