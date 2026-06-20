use std::{
    ffi::OsString,
    path::{Path, PathBuf},
    process::{Output, Stdio},
    time::Duration,
};

use bytes::Bytes;
use clipline_cloud_storage::{MediaObjectKeys, ObjectKey, PutObjectMetadata, SharedStorageBackend};
use serde::Deserialize;
use thiserror::Error;
use tokio::{
    fs,
    io::{AsyncRead, AsyncReadExt},
    process::Command,
    time,
};

const DEFAULT_TIMEOUT: Duration = Duration::from_secs(30);
const MAX_DURATION_MS: i64 = 24 * 60 * 60 * 1000;
const MAX_DIMENSION: i64 = 16_384;
const MAX_FPS: f64 = 1_000.0;
const DEFAULT_MEMORY_LIMIT_BYTES: u64 = 512 * 1024 * 1024;
const DEFAULT_PROCESS_LIMIT: u64 = 32;
const MAX_MEDIA_STDOUT_BYTES: usize = 4 * 1024 * 1024;
const MAX_MEDIA_STDERR_BYTES: usize = 64 * 1024;

#[derive(Debug, Clone)]
pub struct MediaProcessingConfig {
    pub ffmpeg_bin: String,
    pub ffprobe_bin: String,
    pub timeout: Duration,
    pub sandbox_uid: u32,
    pub sandbox_gid: u32,
    pub memory_limit_bytes: u64,
    pub process_limit: u64,
}

impl Default for MediaProcessingConfig {
    fn default() -> Self {
        Self {
            ffmpeg_bin: "ffmpeg".to_string(),
            ffprobe_bin: "ffprobe".to_string(),
            timeout: DEFAULT_TIMEOUT,
            sandbox_uid: 65_534,
            sandbox_gid: 65_534,
            memory_limit_bytes: DEFAULT_MEMORY_LIMIT_BYTES,
            process_limit: DEFAULT_PROCESS_LIMIT,
        }
    }
}

#[derive(Debug, Clone, PartialEq)]
pub struct ValidatedMediaMetadata {
    pub duration_ms: Option<i64>,
    pub width: Option<i64>,
    pub height: Option<i64>,
    pub fps: Option<f64>,
    pub video_codec: Option<String>,
    pub audio_codec: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct VideoOptimizationSettings {
    pub crf: u8,
    pub preset: String,
    pub max_width: Option<u32>,
}

impl Default for VideoOptimizationSettings {
    fn default() -> Self {
        Self {
            crf: 26,
            preset: "veryfast".to_string(),
            max_width: None,
        }
    }
}

#[derive(Debug, Clone, PartialEq)]
pub struct OptimizedVideoCandidate {
    pub bytes: Bytes,
    pub metadata: ValidatedMediaMetadata,
}

#[derive(Debug, Error)]
pub enum MediaProcessingError {
    #[error(transparent)]
    Storage(#[from] clipline_cloud_storage::StorageError),
    #[error(transparent)]
    Io(#[from] std::io::Error),
    #[error(transparent)]
    Json(#[from] serde_json::Error),
    #[error("media processor timed out running {program}")]
    Timeout { program: String },
    #[error("media processor failed running {program}: {stderr}")]
    ProcessFailed { program: String, stderr: String },
    #[error("{0}")]
    Validation(String),
}

#[derive(Debug, Clone)]
pub struct MediaProcessor {
    config: MediaProcessingConfig,
}

impl Default for MediaProcessor {
    fn default() -> Self {
        Self::new(MediaProcessingConfig::default())
    }
}

impl MediaProcessor {
    pub fn new(config: MediaProcessingConfig) -> Self {
        Self { config }
    }

    pub async fn probe_metadata(
        &self,
        storage: &SharedStorageBackend,
        source_key: &ObjectKey,
    ) -> Result<ValidatedMediaMetadata, MediaProcessingError> {
        let scratch = ScratchDir::create().await?;
        let input_path = scratch.path().join("source.mp4");
        write_source_object(storage, source_key, &input_path).await?;

        self.probe_file(&input_path).await
    }

    pub async fn optimize_video(
        &self,
        storage: &SharedStorageBackend,
        source_key: &ObjectKey,
        settings: &VideoOptimizationSettings,
    ) -> Result<OptimizedVideoCandidate, MediaProcessingError> {
        let scratch = ScratchDir::create().await?;
        let input_path = scratch.path().join("source.mp4");
        let output_path = scratch.path().join("optimized.mp4");
        write_source_object(storage, source_key, &input_path).await?;

        let mut args = vec![
            os("-v"),
            os("error"),
            os("-nostdin"),
            os("-protocol_whitelist"),
            os("file,pipe"),
            os("-threads"),
            os("1"),
            os("-i"),
            input_path.as_os_str().to_os_string(),
            os("-map"),
            os("0:v:0"),
            os("-map"),
            os("0:a?"),
            os("-c:v"),
            os("libx264"),
            os("-preset"),
            os(&settings.preset),
            os("-crf"),
            os(&settings.crf.to_string()),
            os("-pix_fmt"),
            os("yuv420p"),
        ];
        if let Some(max_width) = settings.max_width {
            args.extend([
                os("-vf"),
                os(&format!(
                    "scale=min({max_width}\\,iw):-2:force_original_aspect_ratio=decrease"
                )),
            ]);
        }
        args.extend([
            os("-c:a"),
            os("aac"),
            os("-b:a"),
            os("128k"),
            os("-movflags"),
            os("+faststart"),
            os("-threads"),
            os("1"),
            output_path.as_os_str().to_os_string(),
        ]);

        self.run_media_command(&self.config.ffmpeg_bin, args)
            .await?;

        let bytes = fs::read(&output_path).await?;
        if bytes.is_empty() {
            return Err(MediaProcessingError::Validation(
                "video optimization produced an empty file".to_string(),
            ));
        }
        let metadata = self.probe_file(&output_path).await?;
        validate_optimized_candidate(&metadata)?;

        Ok(OptimizedVideoCandidate {
            bytes: Bytes::from(bytes),
            metadata,
        })
    }

    pub async fn generate_thumbnail(
        &self,
        storage: &SharedStorageBackend,
        source_key: &ObjectKey,
        target_key: &ObjectKey,
    ) -> Result<(), MediaProcessingError> {
        self.generate_jpeg(storage, source_key, target_key, "320:-2", "thumbnail")
            .await
    }

    pub async fn generate_poster(
        &self,
        storage: &SharedStorageBackend,
        source_key: &ObjectKey,
        target_key: &ObjectKey,
    ) -> Result<(), MediaProcessingError> {
        self.generate_jpeg(storage, source_key, target_key, "1280:-2", "poster")
            .await
    }

    async fn generate_jpeg(
        &self,
        storage: &SharedStorageBackend,
        source_key: &ObjectKey,
        target_key: &ObjectKey,
        scale: &str,
        label: &str,
    ) -> Result<(), MediaProcessingError> {
        let scratch = ScratchDir::create().await?;
        let input_path = scratch.path().join("source.mp4");
        let output_path = scratch.path().join(format!("{label}.jpg"));
        let vf = format!("scale={scale}:force_original_aspect_ratio=decrease");
        write_source_object(storage, source_key, &input_path).await?;

        self.run_media_command(
            &self.config.ffmpeg_bin,
            vec![
                os("-v"),
                os("error"),
                os("-nostdin"),
                os("-protocol_whitelist"),
                os("file,pipe"),
                os("-threads"),
                os("1"),
                os("-i"),
                input_path.as_os_str().to_os_string(),
                os("-an"),
                os("-vf"),
                os(&vf),
                os("-frames:v"),
                os("1"),
                os("-c:v"),
                os("mjpeg"),
                os("-threads:v"),
                os("1"),
                os("-q:v"),
                os("4"),
                output_path.as_os_str().to_os_string(),
            ],
        )
        .await?;

        let bytes = fs::read(output_path).await?;
        if bytes.is_empty() {
            return Err(MediaProcessingError::Validation(format!(
                "{label} generation produced an empty image"
            )));
        }
        storage
            .put_object(
                target_key,
                Bytes::from(bytes),
                PutObjectMetadata::new("image/jpeg"),
            )
            .await?;
        Ok(())
    }

    async fn run_media_command(
        &self,
        program: &str,
        args: Vec<OsString>,
    ) -> Result<std::process::Output, MediaProcessingError> {
        run_media_command(&self.config, program, args).await
    }

    async fn probe_file(
        &self,
        path: &Path,
    ) -> Result<ValidatedMediaMetadata, MediaProcessingError> {
        let output = self
            .run_media_command(
                &self.config.ffprobe_bin,
                vec![
                    os("-v"),
                    os("error"),
                    os("-protocol_whitelist"),
                    os("file,pipe"),
                    os("-threads"),
                    os("1"),
                    os("-print_format"),
                    os("json"),
                    os("-show_format"),
                    os("-show_streams"),
                    path.as_os_str().to_os_string(),
                ],
            )
            .await?;
        let parsed = serde_json::from_slice::<FfprobeOutput>(&output.stdout)?;
        validate_probe_output(parsed)
    }
}

async fn run_media_command(
    config: &MediaProcessingConfig,
    program: &str,
    args: Vec<OsString>,
) -> Result<Output, MediaProcessingError> {
    let mut command = Command::new(program);
    command
        .env_clear()
        .stdin(Stdio::null())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .kill_on_drop(true);
    for arg in args {
        command.arg(arg);
    }

    harden_command(&mut command, config);

    let mut child = command.spawn()?;
    let stdout = child
        .stdout
        .take()
        .ok_or_else(|| std::io::Error::other("media command stdout was not captured"))?;
    let stderr = child
        .stderr
        .take()
        .ok_or_else(|| std::io::Error::other("media command stderr was not captured"))?;
    let stdout_task = tokio::spawn(read_limited(stdout, MAX_MEDIA_STDOUT_BYTES));
    let stderr_task = tokio::spawn(read_limited(stderr, MAX_MEDIA_STDERR_BYTES));

    let status = match time::timeout(config.timeout, child.wait()).await {
        Ok(result) => result?,
        Err(_) => {
            let _ = child.kill().await;
            let _ = child.wait().await;
            stdout_task.abort();
            stderr_task.abort();
            return Err(MediaProcessingError::Timeout {
                program: program.to_string(),
            });
        }
    };
    let stdout = stdout_task
        .await
        .map_err(|error| std::io::Error::other(error.to_string()))??;
    let mut stderr = stderr_task
        .await
        .map_err(|error| std::io::Error::other(error.to_string()))??;
    if stderr.truncated {
        stderr.bytes.extend_from_slice(b"\n[stderr truncated]");
    }
    let stdout_truncated = stdout.truncated;
    let output = Output {
        status,
        stdout: stdout.bytes,
        stderr: stderr.bytes,
    };
    if output.status.success() && stdout_truncated {
        return Err(MediaProcessingError::Validation(format!(
            "{program} stdout exceeded {MAX_MEDIA_STDOUT_BYTES} bytes"
        )));
    }
    if !output.status.success() {
        return Err(MediaProcessingError::ProcessFailed {
            program: program.to_string(),
            stderr: stderr_string(&output.stderr),
        });
    }
    Ok(output)
}

struct CapturedStream {
    bytes: Vec<u8>,
    truncated: bool,
}

async fn read_limited<R>(reader: R, limit: usize) -> std::io::Result<CapturedStream>
where
    R: AsyncRead + Unpin,
{
    let mut reader = reader.take(limit.saturating_add(1) as u64);
    let mut bytes = Vec::with_capacity(limit.min(8 * 1024));
    reader.read_to_end(&mut bytes).await?;
    let truncated = bytes.len() > limit;
    if truncated {
        bytes.truncate(limit);
    }
    Ok(CapturedStream { bytes, truncated })
}

fn os(value: &str) -> OsString {
    OsString::from(value)
}

#[cfg(unix)]
fn harden_command(command: &mut Command, config: &MediaProcessingConfig) {
    if unsafe { libc::geteuid() } == 0 {
        command.uid(config.sandbox_uid);
        command.gid(config.sandbox_gid);
    }

    let memory_limit_bytes = config.memory_limit_bytes;
    let process_limit = config.process_limit;
    unsafe {
        command.pre_exec(move || {
            set_rlimit(libc::RLIMIT_AS, memory_limit_bytes)?;
            set_rlimit(libc::RLIMIT_NPROC, process_limit)?;
            install_no_network_seccomp()?;
            Ok(())
        });
    }
}

#[cfg(not(unix))]
fn harden_command(_command: &mut Command, _config: &MediaProcessingConfig) {}

#[cfg(unix)]
fn set_rlimit(resource: libc::__rlimit_resource_t, value: u64) -> std::io::Result<()> {
    let limit = libc::rlimit {
        rlim_cur: value as libc::rlim_t,
        rlim_max: value as libc::rlim_t,
    };
    if unsafe { libc::setrlimit(resource, &limit) } == 0 {
        Ok(())
    } else {
        Err(std::io::Error::last_os_error())
    }
}

#[cfg(target_os = "linux")]
fn install_no_network_seccomp() -> std::io::Result<()> {
    use libc::{sock_filter, sock_fprog};

    const SYSCALL_NR_OFFSET: u32 = 0;
    const ARCH_OFFSET: u32 = 4;
    const SECCOMP_RET_KILL_PROCESS: u32 = 0x8000_0000;
    let audit_arch = seccomp_audit_arch().ok_or_else(|| {
        std::io::Error::new(
            std::io::ErrorKind::Unsupported,
            "unsupported architecture for seccomp audit check",
        )
    })?;

    fn stmt(code: u16, k: u32) -> sock_filter {
        sock_filter {
            code,
            jt: 0,
            jf: 0,
            k,
        }
    }

    fn jump_eq(syscall: libc::c_long) -> [sock_filter; 2] {
        [
            sock_filter {
                code: (libc::BPF_JMP | libc::BPF_JEQ | libc::BPF_K) as u16,
                jt: 0,
                jf: 1,
                k: syscall as u32,
            },
            stmt(
                (libc::BPF_RET | libc::BPF_K) as u16,
                libc::SECCOMP_RET_ERRNO | libc::EPERM as u32,
            ),
        ]
    }

    let mut filter = vec![
        stmt(
            (libc::BPF_LD | libc::BPF_W | libc::BPF_ABS) as u16,
            ARCH_OFFSET,
        ),
        sock_filter {
            code: (libc::BPF_JMP | libc::BPF_JEQ | libc::BPF_K) as u16,
            jt: 1,
            jf: 0,
            k: audit_arch,
        },
        stmt(
            (libc::BPF_RET | libc::BPF_K) as u16,
            SECCOMP_RET_KILL_PROCESS,
        ),
        stmt(
            (libc::BPF_LD | libc::BPF_W | libc::BPF_ABS) as u16,
            SYSCALL_NR_OFFSET,
        ),
    ];
    for pair in [
        jump_eq(libc::SYS_socket),
        jump_eq(libc::SYS_socketpair),
        jump_eq(libc::SYS_connect),
        jump_eq(libc::SYS_accept),
        jump_eq(libc::SYS_accept4),
        jump_eq(libc::SYS_bind),
        jump_eq(libc::SYS_listen),
    ] {
        filter.extend(pair);
    }
    filter.push(stmt(
        (libc::BPF_RET | libc::BPF_K) as u16,
        libc::SECCOMP_RET_ALLOW,
    ));

    let mut program = sock_fprog {
        len: filter.len() as libc::c_ushort,
        filter: filter.as_mut_ptr(),
    };

    if unsafe { libc::prctl(libc::PR_SET_NO_NEW_PRIVS, 1, 0, 0, 0) } != 0 {
        return Err(std::io::Error::last_os_error());
    }
    if unsafe {
        libc::prctl(
            libc::PR_SET_SECCOMP,
            libc::SECCOMP_MODE_FILTER,
            &mut program as *mut sock_fprog,
        )
    } != 0
    {
        return Err(std::io::Error::last_os_error());
    }

    Ok(())
}

#[cfg(all(target_os = "linux", target_arch = "x86_64"))]
fn seccomp_audit_arch() -> Option<u32> {
    Some(0xC000_003E)
}

#[cfg(all(target_os = "linux", target_arch = "aarch64"))]
fn seccomp_audit_arch() -> Option<u32> {
    Some(0xC000_00B7)
}

#[cfg(all(target_os = "linux", target_arch = "x86"))]
fn seccomp_audit_arch() -> Option<u32> {
    Some(0x4000_0003)
}

#[cfg(all(target_os = "linux", target_arch = "arm"))]
fn seccomp_audit_arch() -> Option<u32> {
    Some(0x4000_0028)
}

#[cfg(all(
    target_os = "linux",
    not(any(
        target_arch = "x86_64",
        target_arch = "aarch64",
        target_arch = "x86",
        target_arch = "arm"
    ))
))]
fn seccomp_audit_arch() -> Option<u32> {
    None
}

#[cfg(not(target_os = "linux"))]
fn install_no_network_seccomp() -> std::io::Result<()> {
    Ok(())
}

async fn write_source_object(
    storage: &SharedStorageBackend,
    source_key: &ObjectKey,
    input_path: &Path,
) -> Result<(), MediaProcessingError> {
    let object = storage.get_object(source_key, None).await?;
    fs::write(input_path, object.bytes).await?;
    Ok(())
}

fn stderr_string(stderr: &[u8]) -> String {
    String::from_utf8_lossy(stderr).trim().to_string()
}

#[derive(Debug)]
struct ScratchDir {
    path: PathBuf,
}

impl ScratchDir {
    async fn create() -> Result<Self, std::io::Error> {
        let path =
            std::env::temp_dir().join(format!("clipline-media-{}", clipline_cloud_db::new_ulid()));
        fs::create_dir_all(&path).await?;
        #[cfg(unix)]
        {
            use std::os::unix::fs::PermissionsExt;
            fs::set_permissions(&path, std::fs::Permissions::from_mode(0o777)).await?;
        }
        Ok(Self { path })
    }

    fn path(&self) -> &Path {
        &self.path
    }
}

impl Drop for ScratchDir {
    fn drop(&mut self) {
        let _ = std::fs::remove_dir_all(&self.path);
    }
}

#[derive(Debug, Deserialize)]
struct FfprobeOutput {
    streams: Vec<FfprobeStream>,
    format: Option<FfprobeFormat>,
}

#[derive(Debug, Deserialize)]
struct FfprobeFormat {
    duration: Option<String>,
}

#[derive(Debug, Deserialize)]
struct FfprobeStream {
    codec_type: Option<String>,
    codec_name: Option<String>,
    width: Option<i64>,
    height: Option<i64>,
    avg_frame_rate: Option<String>,
    r_frame_rate: Option<String>,
    duration: Option<String>,
}

fn validate_probe_output(
    output: FfprobeOutput,
) -> Result<ValidatedMediaMetadata, MediaProcessingError> {
    let video = output
        .streams
        .iter()
        .find(|stream| stream.codec_type.as_deref() == Some("video"));
    let audio = output
        .streams
        .iter()
        .find(|stream| stream.codec_type.as_deref() == Some("audio"));

    let duration_ms = output
        .format
        .as_ref()
        .and_then(|format| parse_duration_ms(format.duration.as_deref()))
        .or_else(|| video.and_then(|stream| parse_duration_ms(stream.duration.as_deref())))
        .map(validate_duration_ms)
        .transpose()?;
    let width = video
        .and_then(|stream| stream.width)
        .map(|value| validate_dimension("width", value))
        .transpose()?;
    let height = video
        .and_then(|stream| stream.height)
        .map(|value| validate_dimension("height", value))
        .transpose()?;
    let fps = video
        .and_then(|stream| {
            parse_frame_rate(stream.avg_frame_rate.as_deref())
                .or_else(|| parse_frame_rate(stream.r_frame_rate.as_deref()))
        })
        .map(validate_fps)
        .transpose()?;

    Ok(ValidatedMediaMetadata {
        duration_ms,
        width,
        height,
        fps,
        video_codec: video
            .and_then(|stream| stream.codec_name.as_deref())
            .map(validate_codec)
            .transpose()?,
        audio_codec: audio
            .and_then(|stream| stream.codec_name.as_deref())
            .map(validate_codec)
            .transpose()?,
    })
}

fn validate_optimized_candidate(
    metadata: &ValidatedMediaMetadata,
) -> Result<(), MediaProcessingError> {
    if metadata.duration_ms.is_none() || metadata.width.is_none() || metadata.height.is_none() {
        return Err(MediaProcessingError::Validation(
            "optimized video is missing required probe metadata".to_string(),
        ));
    }
    if metadata.video_codec.as_deref() != Some("h264") {
        return Err(MediaProcessingError::Validation(format!(
            "optimized video codec is {:?}, expected h264",
            metadata.video_codec
        )));
    }
    if let Some(audio_codec) = metadata.audio_codec.as_deref() {
        if audio_codec != "aac" {
            return Err(MediaProcessingError::Validation(format!(
                "optimized audio codec is {audio_codec:?}, expected aac"
            )));
        }
    }

    Ok(())
}

fn parse_duration_ms(value: Option<&str>) -> Option<i64> {
    let seconds = value?.parse::<f64>().ok()?;
    seconds
        .is_finite()
        .then(|| (seconds * 1000.0).round() as i64)
}

fn validate_duration_ms(value: i64) -> Result<i64, MediaProcessingError> {
    if (1..=MAX_DURATION_MS).contains(&value) {
        Ok(value)
    } else {
        Err(MediaProcessingError::Validation(format!(
            "ffprobe duration_ms {value} is outside sane bounds"
        )))
    }
}

fn validate_dimension(name: &str, value: i64) -> Result<i64, MediaProcessingError> {
    if (1..=MAX_DIMENSION).contains(&value) {
        Ok(value)
    } else {
        Err(MediaProcessingError::Validation(format!(
            "ffprobe {name} {value} is outside sane bounds"
        )))
    }
}

fn validate_fps(value: f64) -> Result<f64, MediaProcessingError> {
    if value.is_finite() && value > 0.0 && value <= MAX_FPS {
        Ok(value)
    } else {
        Err(MediaProcessingError::Validation(format!(
            "ffprobe fps {value} is outside sane bounds"
        )))
    }
}

fn validate_codec(value: &str) -> Result<String, MediaProcessingError> {
    let value = value.trim();
    if !value.is_empty()
        && value.len() <= 64
        && value
            .bytes()
            .all(|byte| byte.is_ascii_alphanumeric() || matches!(byte, b'_' | b'-' | b'.'))
    {
        Ok(value.to_string())
    } else {
        Err(MediaProcessingError::Validation(
            "ffprobe codec name is outside sane bounds".to_string(),
        ))
    }
}

fn parse_frame_rate(value: Option<&str>) -> Option<f64> {
    let value = value?;
    let (numerator, denominator) = value.split_once('/')?;
    let numerator = numerator.parse::<f64>().ok()?;
    let denominator = denominator.parse::<f64>().ok()?;
    (denominator != 0.0).then_some(numerator / denominator)
}

pub fn media_keys_for_clip(
    source_key: &ObjectKey,
) -> Result<MediaObjectKeys, MediaProcessingError> {
    MediaObjectKeys::from_source_key(source_key).map_err(Into::into)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn validates_sane_ffprobe_metadata() {
        let output = FfprobeOutput {
            streams: vec![
                FfprobeStream {
                    codec_type: Some("video".to_string()),
                    codec_name: Some("h264".to_string()),
                    width: Some(1920),
                    height: Some(1080),
                    avg_frame_rate: Some("30000/1001".to_string()),
                    r_frame_rate: None,
                    duration: None,
                },
                FfprobeStream {
                    codec_type: Some("audio".to_string()),
                    codec_name: Some("aac".to_string()),
                    width: None,
                    height: None,
                    avg_frame_rate: None,
                    r_frame_rate: None,
                    duration: None,
                },
            ],
            format: Some(FfprobeFormat {
                duration: Some("12.345".to_string()),
            }),
        };

        let metadata = validate_probe_output(output).expect("metadata");

        assert_eq!(metadata.duration_ms, Some(12_345));
        assert_eq!(metadata.width, Some(1920));
        assert_eq!(metadata.height, Some(1080));
        assert_eq!(metadata.video_codec.as_deref(), Some("h264"));
        assert_eq!(metadata.audio_codec.as_deref(), Some("aac"));
        assert!(metadata.fps.unwrap() > 29.9);
    }

    #[test]
    fn rejects_unsane_ffprobe_values() {
        let output = FfprobeOutput {
            streams: vec![FfprobeStream {
                codec_type: Some("video".to_string()),
                codec_name: Some("h264".to_string()),
                width: Some(99_999),
                height: Some(1080),
                avg_frame_rate: Some("30/1".to_string()),
                r_frame_rate: None,
                duration: None,
            }],
            format: Some(FfprobeFormat {
                duration: Some("12".to_string()),
            }),
        };

        assert!(validate_probe_output(output).is_err());
    }

    #[test]
    fn validates_optimized_candidate_metadata() {
        let valid = ValidatedMediaMetadata {
            duration_ms: Some(10_000),
            width: Some(1280),
            height: Some(720),
            fps: Some(60.0),
            video_codec: Some("h264".to_string()),
            audio_codec: Some("aac".to_string()),
        };
        validate_optimized_candidate(&valid).expect("valid optimized metadata");

        let without_audio = ValidatedMediaMetadata {
            audio_codec: None,
            ..valid.clone()
        };
        validate_optimized_candidate(&without_audio).expect("video-only clips are valid");

        let missing_required = ValidatedMediaMetadata {
            width: None,
            ..valid.clone()
        };
        assert!(validate_optimized_candidate(&missing_required).is_err());

        let wrong_video_codec = ValidatedMediaMetadata {
            video_codec: Some("hevc".to_string()),
            ..valid.clone()
        };
        assert!(validate_optimized_candidate(&wrong_video_codec).is_err());

        let wrong_audio_codec = ValidatedMediaMetadata {
            audio_codec: Some("opus".to_string()),
            ..valid
        };
        assert!(validate_optimized_candidate(&wrong_audio_codec).is_err());
    }

    #[cfg(unix)]
    #[tokio::test]
    async fn media_command_sandbox_allows_simple_process() {
        let config = MediaProcessingConfig {
            timeout: Duration::from_secs(2),
            ..MediaProcessingConfig::default()
        };

        run_media_command(&config, "true", Vec::new())
            .await
            .expect("sandboxed true");
    }

    #[tokio::test]
    async fn read_limited_reports_truncated_stream() {
        use tokio::io::AsyncWriteExt;

        let (mut writer, reader) = tokio::io::duplex(16);
        let writer_task = tokio::spawn(async move {
            writer.write_all(b"abcdef").await.expect("write");
            writer.shutdown().await.expect("shutdown");
        });

        let captured = read_limited(reader, 3).await.expect("capture");
        writer_task.await.expect("writer task");

        assert_eq!(captured.bytes, b"abc");
        assert!(captured.truncated);
    }
}
