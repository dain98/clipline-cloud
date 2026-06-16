use std::time::Duration;

use chrono::Duration as ChronoDuration;
use clipline_cloud_db::{now_utc, Job, NewJob, Repositories};
use clipline_cloud_storage::{ObjectKey, SharedStorageBackend, StorageError};
use sha2::{Digest, Sha256};
use thiserror::Error;
use tokio::{sync::watch, time::sleep};
use tracing::{debug, error, info, warn};

pub const VALIDATE_OBJECT_KIND: &str = "validate_object";

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
    #[error("{0}")]
    InvalidJob(String),
    #[error("{0}")]
    Validation(String),
}

pub async fn enqueue_validate_object(
    repositories: &Repositories,
    clip_id: impl Into<String>,
) -> Result<Job, JobRunnerError> {
    let clip_id = clip_id.into();
    let mut job = NewJob::new(VALIDATE_OBJECT_KIND, now_utc());
    job.target_type = Some("clip".to_string());
    job.target_id = Some(clip_id);
    Ok(repositories.jobs.create(&job).await?)
}

#[derive(Clone)]
pub struct JobRunner {
    repositories: Repositories,
    storage: SharedStorageBackend,
    config: JobRunnerConfig,
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

        let result = match job.kind.as_str() {
            VALIDATE_OBJECT_KIND => self.validate_object(&job).await,
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
                let attempts = job.attempts.saturating_add(1);
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

    fn retry_delay(&self, attempts: i64) -> Duration {
        let exponent = attempts.saturating_sub(1).clamp(0, 16) as u32;
        let base_ms = self.config.retry_base_delay.as_millis();
        let max_ms = self.config.retry_max_delay.as_millis();
        let delay_ms = base_ms.saturating_mul(2_u128.saturating_pow(exponent));
        Duration::from_millis(delay_ms.min(max_ms).try_into().unwrap_or(u64::MAX))
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
        if clip.status == "ready" {
            return Ok(());
        }
        if clip.status != "processing" {
            return Err(JobRunnerError::Validation(format!(
                "clip {} is in status {:?}, expected processing",
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

        Ok(())
    }
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

#[cfg(test)]
mod tests {
    use std::sync::Arc;

    use clipline_cloud_db::{Database, NewClip, NewUser, Repositories};
    use clipline_cloud_storage::{
        LocalStorage, MediaObjectKeys, PutObjectMetadata, StorageBackend,
    };
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
