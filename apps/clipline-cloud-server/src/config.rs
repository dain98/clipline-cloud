use std::{
    env, fs,
    net::{IpAddr, SocketAddr},
    path::PathBuf,
    str::FromStr,
    time::Duration,
};

#[cfg(test)]
use std::collections::BTreeMap;

use thiserror::Error;
use url::Url;

const DEFAULT_BIND_ADDR: &str = "0.0.0.0:8080";
const DEFAULT_DATABASE_URL: &str = "sqlite:///data/clipline.db";
const DEFAULT_STORAGE_BACKEND: &str = "local";
const DEFAULT_PROCESS_ROLE: &str = "all";
const DEFAULT_LOG_LEVEL: &str = "info";
const DEFAULT_S3_REGION: &str = "us-east-1";
const DEFAULT_MAX_UPLOAD_SIZE_BYTES: u64 = 5 * 1024 * 1024 * 1024;
const DEFAULT_UPLOAD_PART_SIZE_BYTES: u64 = 8 * 1024 * 1024;
const DEFAULT_SINGLE_PUT_MAX_BYTES: u64 = 64 * 1024 * 1024;
const DEFAULT_UPLOAD_SESSION_TTL_SECONDS: u64 = 24 * 60 * 60;
const DEFAULT_JOB_POLL_INTERVAL_SECONDS: u64 = 1;
const DEFAULT_JOB_LOCK_TIMEOUT_SECONDS: u64 = 5 * 60;
const DEFAULT_JOB_RETRY_BASE_DELAY_SECONDS: u64 = 5;
const DEFAULT_JOB_RETRY_MAX_DELAY_SECONDS: u64 = 5 * 60;
const DEFAULT_PUBLIC_READ_URL_TTL_SECONDS: u64 = 5 * 60;
const DEFAULT_MAX_ACTIVE_UPLOAD_SESSIONS_PER_USER: u64 = 16;
const S3_MIN_PART_SIZE_BYTES: u64 = 5 * 1024 * 1024;

#[derive(Debug, Clone)]
pub struct Config {
    pub process_role: ProcessRole,
    pub public_url: Url,
    pub bind_addr: SocketAddr,
    pub database_url: String,
    pub bootstrap_admin_username: Option<String>,
    pub bootstrap_admin_password: Option<String>,
    pub storage: StorageConfig,
    pub max_upload_size_bytes: u64,
    pub upload_part_size_bytes: u64,
    pub single_put_max_bytes: u64,
    pub upload_session_ttl: Duration,
    pub job_poll_interval: Duration,
    pub job_lock_timeout: Duration,
    pub job_retry_base_delay: Duration,
    pub job_retry_max_delay: Duration,
    pub public_media_mode: PublicMediaMode,
    pub public_read_url_ttl: Duration,
    pub max_active_upload_sessions_per_user: i64,
    pub user_storage_quota_bytes: Option<u64>,
    pub global_storage_warning_threshold_bytes: Option<u64>,
    pub trusted_proxy_hops: Vec<IpAddr>,
    pub session_secret: Option<String>,
    pub log_level: String,
    pub static_dir: PathBuf,
    startup_warnings: Vec<StartupWarning>,
}

#[derive(Debug, Clone)]
pub enum StorageConfig {
    Local {
        data_dir: PathBuf,
    },
    S3 {
        endpoint: String,
        bucket: String,
        region: String,
        access_key_id: String,
        secret_access_key: String,
        force_path_style: bool,
        prefix: Option<String>,
    },
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum PublicMediaMode {
    Presigned,
    Proxy,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ProcessRole {
    All,
    Web,
    Worker,
}

impl ProcessRole {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::All => "all",
            Self::Web => "web",
            Self::Worker => "worker",
        }
    }

    pub fn runs_http(self) -> bool {
        matches!(self, Self::All | Self::Web)
    }

    pub fn runs_jobs(self) -> bool {
        matches!(self, Self::All | Self::Worker)
    }
}

impl PublicMediaMode {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Presigned => "presigned",
            Self::Proxy => "proxy",
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum StartupWarning {
    NonHttpsPublicUrl { url: String },
}

impl std::fmt::Display for StartupWarning {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            StartupWarning::NonHttpsPublicUrl { url } => write!(
                f,
                "CLIPLINE_PUBLIC_URL is not HTTPS ({url}); only use HTTP for trusted LAN or local testing"
            ),
        }
    }
}

#[derive(Debug, Error)]
pub enum ConfigError {
    #[error("{name} is required")]
    MissingRequired { name: &'static str },
    #[error("{name} must be one of {expected}; got {value:?}")]
    InvalidEnum {
        name: &'static str,
        value: String,
        expected: &'static str,
    },
    #[error("{name} must be a positive integer; got {value:?}")]
    InvalidNumber { name: &'static str, value: String },
    #[error("{name} must be a boolean (true/false, 1/0, yes/no); got {value:?}")]
    InvalidBool { name: &'static str, value: String },
    #[error("{name} must be a socket address; got {value:?}")]
    InvalidSocketAddr { name: &'static str, value: String },
    #[error("{name} must be a comma-separated list of IP addresses; got {value:?}")]
    InvalidIpList { name: &'static str, value: String },
    #[error("{name} must be a valid URL; got {value:?}")]
    InvalidUrl { name: &'static str, value: String },
    #[error("failed to read {name} from {path}: {source}")]
    SecretFileRead {
        name: &'static str,
        path: PathBuf,
        #[source]
        source: std::io::Error,
    },
    #[error("{0}")]
    Validation(String),
}

impl Config {
    pub fn from_env() -> Result<Self, ConfigError> {
        let source = ProcessEnv;
        Self::from_source(&source)
    }

    #[cfg(test)]
    pub(crate) fn for_tests(database_url: impl Into<String>, data_dir: impl Into<PathBuf>) -> Self {
        let data_dir = data_dir.into();
        let source = BTreeMap::from([
            ("CLIPLINE_PUBLIC_URL", "http://localhost:8080".to_string()),
            ("CLIPLINE_DATABASE_URL", database_url.into()),
            ("CLIPLINE_DATA_DIR", data_dir.display().to_string()),
            (
                "CLIPLINE_SESSION_SECRET",
                "clipline-test-session-secret".to_string(),
            ),
        ]);
        Self::from_source(&source).expect("test config should be valid")
    }

    pub fn startup_warnings(&self) -> &[StartupWarning] {
        &self.startup_warnings
    }

    pub fn storage_backend_name(&self) -> &'static str {
        match self.storage {
            StorageConfig::Local { .. } => "local",
            StorageConfig::S3 { .. } => "s3",
        }
    }

    fn from_source(source: &impl EnvSource) -> Result<Self, ConfigError> {
        let process_role = parse_process_role(
            optional(source, "CLIPLINE_PROCESS_ROLE")
                .unwrap_or_else(|| DEFAULT_PROCESS_ROLE.to_string()),
        )?;
        let public_url = required_url(source, "CLIPLINE_PUBLIC_URL")?;
        let bind_addr = parse_socket_addr(
            "CLIPLINE_BIND_ADDR",
            optional(source, "CLIPLINE_BIND_ADDR").unwrap_or_else(|| DEFAULT_BIND_ADDR.to_string()),
        )?;
        let database_url = secret(source, "CLIPLINE_DATABASE_URL")?
            .unwrap_or_else(|| DEFAULT_DATABASE_URL.to_string());
        validate_database_url(&database_url)?;

        let bootstrap_admin_username = optional(source, "CLIPLINE_BOOTSTRAP_ADMIN_USERNAME");
        let bootstrap_admin_password = secret(source, "CLIPLINE_BOOTSTRAP_ADMIN_PASSWORD")?;
        let storage_backend = optional(source, "CLIPLINE_STORAGE_BACKEND")
            .unwrap_or_else(|| DEFAULT_STORAGE_BACKEND.to_string());

        let max_upload_size_bytes = parse_u64(
            "CLIPLINE_MAX_UPLOAD_SIZE_BYTES",
            optional(source, "CLIPLINE_MAX_UPLOAD_SIZE_BYTES"),
            DEFAULT_MAX_UPLOAD_SIZE_BYTES,
        )?;
        let upload_part_size_bytes = parse_u64(
            "CLIPLINE_UPLOAD_PART_SIZE_BYTES",
            optional(source, "CLIPLINE_UPLOAD_PART_SIZE_BYTES"),
            DEFAULT_UPLOAD_PART_SIZE_BYTES,
        )?;
        let single_put_max_bytes = parse_u64(
            "CLIPLINE_SINGLE_PUT_MAX_BYTES",
            optional(source, "CLIPLINE_SINGLE_PUT_MAX_BYTES"),
            DEFAULT_SINGLE_PUT_MAX_BYTES,
        )?;
        let upload_session_ttl_seconds = parse_u64(
            "CLIPLINE_UPLOAD_SESSION_TTL_SECONDS",
            optional(source, "CLIPLINE_UPLOAD_SESSION_TTL_SECONDS"),
            DEFAULT_UPLOAD_SESSION_TTL_SECONDS,
        )?;
        let job_poll_interval_seconds = parse_u64(
            "CLIPLINE_JOB_POLL_INTERVAL_SECONDS",
            optional(source, "CLIPLINE_JOB_POLL_INTERVAL_SECONDS"),
            DEFAULT_JOB_POLL_INTERVAL_SECONDS,
        )?;
        let job_lock_timeout_seconds = parse_u64(
            "CLIPLINE_JOB_LOCK_TIMEOUT_SECONDS",
            optional(source, "CLIPLINE_JOB_LOCK_TIMEOUT_SECONDS"),
            DEFAULT_JOB_LOCK_TIMEOUT_SECONDS,
        )?;
        let job_retry_base_delay_seconds = parse_u64(
            "CLIPLINE_JOB_RETRY_BASE_DELAY_SECONDS",
            optional(source, "CLIPLINE_JOB_RETRY_BASE_DELAY_SECONDS"),
            DEFAULT_JOB_RETRY_BASE_DELAY_SECONDS,
        )?;
        let job_retry_max_delay_seconds = parse_u64(
            "CLIPLINE_JOB_RETRY_MAX_DELAY_SECONDS",
            optional(source, "CLIPLINE_JOB_RETRY_MAX_DELAY_SECONDS"),
            DEFAULT_JOB_RETRY_MAX_DELAY_SECONDS,
        )?;
        let public_media_mode = parse_public_media_mode(
            optional(source, "CLIPLINE_PUBLIC_MEDIA_MODE")
                .unwrap_or_else(|| "presigned".to_string()),
        )?;
        let public_read_url_ttl_seconds = parse_u64(
            "CLIPLINE_PUBLIC_READ_URL_TTL_SECONDS",
            optional(source, "CLIPLINE_PUBLIC_READ_URL_TTL_SECONDS"),
            DEFAULT_PUBLIC_READ_URL_TTL_SECONDS,
        )?;
        let max_active_upload_sessions_per_user = parse_u64(
            "CLIPLINE_MAX_ACTIVE_UPLOAD_SESSIONS_PER_USER",
            optional(source, "CLIPLINE_MAX_ACTIVE_UPLOAD_SESSIONS_PER_USER"),
            DEFAULT_MAX_ACTIVE_UPLOAD_SESSIONS_PER_USER,
        )?;
        let user_storage_quota_bytes = parse_optional_u64(
            "CLIPLINE_USER_STORAGE_QUOTA_BYTES",
            optional(source, "CLIPLINE_USER_STORAGE_QUOTA_BYTES"),
        )?;
        let global_storage_warning_threshold_bytes = parse_optional_u64(
            "CLIPLINE_GLOBAL_STORAGE_WARNING_THRESHOLD_BYTES",
            optional(source, "CLIPLINE_GLOBAL_STORAGE_WARNING_THRESHOLD_BYTES"),
        )?;
        let trusted_proxy_hops = parse_ip_list(
            "CLIPLINE_TRUSTED_PROXY_HOPS",
            optional(source, "CLIPLINE_TRUSTED_PROXY_HOPS"),
        )?;
        validate_upload_limits(
            max_upload_size_bytes,
            upload_part_size_bytes,
            single_put_max_bytes,
            max_active_upload_sessions_per_user,
        )?;
        validate_job_limits(
            job_poll_interval_seconds,
            job_lock_timeout_seconds,
            job_retry_base_delay_seconds,
            job_retry_max_delay_seconds,
        )?;
        validate_public_media_limits(public_read_url_ttl_seconds)?;

        let session_secret = secret(source, "CLIPLINE_SESSION_SECRET")?;
        let log_level =
            optional(source, "CLIPLINE_LOG_LEVEL").unwrap_or_else(|| DEFAULT_LOG_LEVEL.to_string());
        let storage = parse_storage(source, &storage_backend, upload_part_size_bytes)?;
        let static_dir = default_static_dir();
        let mut startup_warnings = Vec::new();

        if public_url.scheme() != "https" {
            startup_warnings.push(StartupWarning::NonHttpsPublicUrl {
                url: public_url.as_str().to_string(),
            });
        }

        Ok(Self {
            process_role,
            public_url,
            bind_addr,
            database_url,
            bootstrap_admin_username,
            bootstrap_admin_password,
            storage,
            max_upload_size_bytes,
            upload_part_size_bytes,
            single_put_max_bytes,
            upload_session_ttl: Duration::from_secs(upload_session_ttl_seconds),
            job_poll_interval: Duration::from_secs(job_poll_interval_seconds),
            job_lock_timeout: Duration::from_secs(job_lock_timeout_seconds),
            job_retry_base_delay: Duration::from_secs(job_retry_base_delay_seconds),
            job_retry_max_delay: Duration::from_secs(job_retry_max_delay_seconds),
            public_media_mode,
            public_read_url_ttl: Duration::from_secs(public_read_url_ttl_seconds),
            max_active_upload_sessions_per_user: i64::try_from(max_active_upload_sessions_per_user)
                .expect("validated active upload session limit fits i64"),
            user_storage_quota_bytes,
            global_storage_warning_threshold_bytes,
            trusted_proxy_hops,
            session_secret,
            log_level,
            static_dir,
            startup_warnings,
        })
    }
}

trait EnvSource {
    fn get(&self, key: &'static str) -> Option<String>;
}

struct ProcessEnv;

impl EnvSource for ProcessEnv {
    fn get(&self, key: &'static str) -> Option<String> {
        env::var(key).ok()
    }
}

#[cfg(test)]
impl EnvSource for BTreeMap<&'static str, String> {
    fn get(&self, key: &'static str) -> Option<String> {
        BTreeMap::get(self, key).cloned()
    }
}

fn optional(source: &impl EnvSource, name: &'static str) -> Option<String> {
    source
        .get(name)
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty())
}

fn required(source: &impl EnvSource, name: &'static str) -> Result<String, ConfigError> {
    optional(source, name).ok_or(ConfigError::MissingRequired { name })
}

fn required_url(source: &impl EnvSource, name: &'static str) -> Result<Url, ConfigError> {
    let value = required(source, name)?;
    Url::parse(&value).map_err(|_| ConfigError::InvalidUrl { name, value })
}

fn secret(source: &impl EnvSource, name: &'static str) -> Result<Option<String>, ConfigError> {
    let file_name = match name {
        "CLIPLINE_BOOTSTRAP_ADMIN_PASSWORD" => "CLIPLINE_BOOTSTRAP_ADMIN_PASSWORD_FILE",
        "CLIPLINE_DATABASE_URL" => "CLIPLINE_DATABASE_URL_FILE",
        "CLIPLINE_S3_ACCESS_KEY_ID" => "CLIPLINE_S3_ACCESS_KEY_ID_FILE",
        "CLIPLINE_S3_SECRET_ACCESS_KEY" => "CLIPLINE_S3_SECRET_ACCESS_KEY_FILE",
        "CLIPLINE_SESSION_SECRET" => "CLIPLINE_SESSION_SECRET_FILE",
        _ => return Ok(optional(source, name)),
    };

    if let Some(path) = optional(source, file_name) {
        let path = PathBuf::from(path);
        let value = fs::read_to_string(&path).map_err(|source| ConfigError::SecretFileRead {
            name: file_name,
            path: path.clone(),
            source,
        })?;
        return Ok(Some(value.trim_end_matches(['\r', '\n']).to_string()));
    }

    Ok(optional(source, name))
}

fn parse_storage(
    source: &impl EnvSource,
    storage_backend: &str,
    upload_part_size_bytes: u64,
) -> Result<StorageConfig, ConfigError> {
    match storage_backend {
        "local" => {
            let data_dir = required(source, "CLIPLINE_DATA_DIR")?;
            Ok(StorageConfig::Local {
                data_dir: PathBuf::from(data_dir),
            })
        }
        "s3" => {
            if upload_part_size_bytes < S3_MIN_PART_SIZE_BYTES {
                return Err(ConfigError::Validation(format!(
                    "CLIPLINE_UPLOAD_PART_SIZE_BYTES must be at least {S3_MIN_PART_SIZE_BYTES} for s3 storage"
                )));
            }

            Ok(StorageConfig::S3 {
                endpoint: required(source, "CLIPLINE_S3_ENDPOINT")?,
                bucket: required(source, "CLIPLINE_S3_BUCKET")?,
                region: optional(source, "CLIPLINE_S3_REGION")
                    .unwrap_or_else(|| DEFAULT_S3_REGION.to_string()),
                access_key_id: secret(source, "CLIPLINE_S3_ACCESS_KEY_ID")?.ok_or(
                    ConfigError::MissingRequired {
                        name: "CLIPLINE_S3_ACCESS_KEY_ID",
                    },
                )?,
                secret_access_key: secret(source, "CLIPLINE_S3_SECRET_ACCESS_KEY")?.ok_or(
                    ConfigError::MissingRequired {
                        name: "CLIPLINE_S3_SECRET_ACCESS_KEY",
                    },
                )?,
                force_path_style: parse_bool(
                    "CLIPLINE_S3_FORCE_PATH_STYLE",
                    optional(source, "CLIPLINE_S3_FORCE_PATH_STYLE"),
                    false,
                )?,
                prefix: optional(source, "CLIPLINE_S3_PREFIX"),
            })
        }
        other => Err(ConfigError::InvalidEnum {
            name: "CLIPLINE_STORAGE_BACKEND",
            value: other.to_string(),
            expected: "local, s3",
        }),
    }
}

fn validate_database_url(database_url: &str) -> Result<(), ConfigError> {
    if database_url.starts_with("sqlite://")
        || database_url.starts_with("postgres://")
        || database_url.starts_with("postgresql://")
    {
        return Ok(());
    }

    Err(ConfigError::Validation(
        "CLIPLINE_DATABASE_URL must start with sqlite://, postgres://, or postgresql://"
            .to_string(),
    ))
}

fn validate_upload_limits(
    max_upload_size_bytes: u64,
    upload_part_size_bytes: u64,
    single_put_max_bytes: u64,
    max_active_upload_sessions_per_user: u64,
) -> Result<(), ConfigError> {
    if max_upload_size_bytes == 0 {
        return Err(ConfigError::Validation(
            "CLIPLINE_MAX_UPLOAD_SIZE_BYTES must be greater than zero".to_string(),
        ));
    }
    if upload_part_size_bytes == 0 {
        return Err(ConfigError::Validation(
            "CLIPLINE_UPLOAD_PART_SIZE_BYTES must be greater than zero".to_string(),
        ));
    }
    if single_put_max_bytes == 0 {
        return Err(ConfigError::Validation(
            "CLIPLINE_SINGLE_PUT_MAX_BYTES must be greater than zero".to_string(),
        ));
    }
    if single_put_max_bytes > max_upload_size_bytes {
        return Err(ConfigError::Validation(
            "CLIPLINE_SINGLE_PUT_MAX_BYTES cannot exceed CLIPLINE_MAX_UPLOAD_SIZE_BYTES"
                .to_string(),
        ));
    }
    if max_active_upload_sessions_per_user == 0 {
        return Err(ConfigError::Validation(
            "CLIPLINE_MAX_ACTIVE_UPLOAD_SESSIONS_PER_USER must be greater than zero".to_string(),
        ));
    }
    if max_active_upload_sessions_per_user > i64::MAX as u64 {
        return Err(ConfigError::Validation(
            "CLIPLINE_MAX_ACTIVE_UPLOAD_SESSIONS_PER_USER is too large".to_string(),
        ));
    }

    Ok(())
}

fn validate_job_limits(
    poll_interval_seconds: u64,
    lock_timeout_seconds: u64,
    retry_base_delay_seconds: u64,
    retry_max_delay_seconds: u64,
) -> Result<(), ConfigError> {
    if poll_interval_seconds == 0 {
        return Err(ConfigError::Validation(
            "CLIPLINE_JOB_POLL_INTERVAL_SECONDS must be greater than zero".to_string(),
        ));
    }
    if lock_timeout_seconds == 0 {
        return Err(ConfigError::Validation(
            "CLIPLINE_JOB_LOCK_TIMEOUT_SECONDS must be greater than zero".to_string(),
        ));
    }
    if retry_base_delay_seconds == 0 {
        return Err(ConfigError::Validation(
            "CLIPLINE_JOB_RETRY_BASE_DELAY_SECONDS must be greater than zero".to_string(),
        ));
    }
    if retry_max_delay_seconds < retry_base_delay_seconds {
        return Err(ConfigError::Validation(
            "CLIPLINE_JOB_RETRY_MAX_DELAY_SECONDS cannot be less than CLIPLINE_JOB_RETRY_BASE_DELAY_SECONDS"
                .to_string(),
        ));
    }

    Ok(())
}

fn validate_public_media_limits(public_read_url_ttl_seconds: u64) -> Result<(), ConfigError> {
    if public_read_url_ttl_seconds == 0 {
        return Err(ConfigError::Validation(
            "CLIPLINE_PUBLIC_READ_URL_TTL_SECONDS must be greater than zero".to_string(),
        ));
    }

    Ok(())
}

fn parse_public_media_mode(value: String) -> Result<PublicMediaMode, ConfigError> {
    match value.as_str() {
        "presigned" => Ok(PublicMediaMode::Presigned),
        "proxy" => Ok(PublicMediaMode::Proxy),
        other => Err(ConfigError::InvalidEnum {
            name: "CLIPLINE_PUBLIC_MEDIA_MODE",
            value: other.to_string(),
            expected: "presigned, proxy",
        }),
    }
}

fn parse_process_role(value: String) -> Result<ProcessRole, ConfigError> {
    match value.as_str() {
        "all" => Ok(ProcessRole::All),
        "web" => Ok(ProcessRole::Web),
        "worker" => Ok(ProcessRole::Worker),
        other => Err(ConfigError::InvalidEnum {
            name: "CLIPLINE_PROCESS_ROLE",
            value: other.to_string(),
            expected: "all, web, worker",
        }),
    }
}

fn parse_u64(name: &'static str, value: Option<String>, default: u64) -> Result<u64, ConfigError> {
    match value {
        Some(value) => value
            .parse::<u64>()
            .map_err(|_| ConfigError::InvalidNumber { name, value }),
        None => Ok(default),
    }
}

fn parse_optional_u64(
    name: &'static str,
    value: Option<String>,
) -> Result<Option<u64>, ConfigError> {
    match value {
        Some(value) => {
            let parsed = value
                .parse::<u64>()
                .map_err(|_| ConfigError::InvalidNumber { name, value })?;
            Ok((parsed > 0).then_some(parsed))
        }
        None => Ok(None),
    }
}

fn parse_bool(
    name: &'static str,
    value: Option<String>,
    default: bool,
) -> Result<bool, ConfigError> {
    match value.as_deref().map(str::to_ascii_lowercase).as_deref() {
        Some("true" | "1" | "yes") => Ok(true),
        Some("false" | "0" | "no") => Ok(false),
        Some(_) => Err(ConfigError::InvalidBool {
            name,
            value: value.unwrap_or_default(),
        }),
        None => Ok(default),
    }
}

fn parse_socket_addr(name: &'static str, value: String) -> Result<SocketAddr, ConfigError> {
    SocketAddr::from_str(&value).map_err(|_| ConfigError::InvalidSocketAddr { name, value })
}

fn parse_ip_list(name: &'static str, value: Option<String>) -> Result<Vec<IpAddr>, ConfigError> {
    let Some(value) = value else {
        return Ok(Vec::new());
    };

    value
        .split(',')
        .map(str::trim)
        .filter(|part| !part.is_empty())
        .map(|part| {
            IpAddr::from_str(part).map_err(|_| ConfigError::InvalidIpList {
                name,
                value: value.clone(),
            })
        })
        .collect()
}

fn default_static_dir() -> PathBuf {
    let workspace_relative = PathBuf::from("apps/clipline-cloud-web/dist");
    if workspace_relative.exists() {
        return workspace_relative;
    }

    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../clipline-cloud-web/dist")
}

#[cfg(test)]
mod tests {
    use super::*;

    fn valid_local_env() -> BTreeMap<&'static str, String> {
        BTreeMap::from([
            ("CLIPLINE_PUBLIC_URL", "http://localhost:8080".to_string()),
            ("CLIPLINE_DATA_DIR", "/tmp/clipline-cloud-test".to_string()),
        ])
    }

    #[test]
    fn local_config_uses_defaults_and_warns_for_http() {
        let config = Config::from_source(&valid_local_env()).expect("config");

        assert_eq!(config.bind_addr, "0.0.0.0:8080".parse().unwrap());
        assert_eq!(config.process_role, ProcessRole::All);
        assert_eq!(config.database_url, DEFAULT_DATABASE_URL);
        assert_eq!(config.storage_backend_name(), "local");
        assert_eq!(config.max_upload_size_bytes, DEFAULT_MAX_UPLOAD_SIZE_BYTES);
        assert_eq!(
            config.upload_part_size_bytes,
            DEFAULT_UPLOAD_PART_SIZE_BYTES
        );
        assert_eq!(config.single_put_max_bytes, DEFAULT_SINGLE_PUT_MAX_BYTES);
        assert_eq!(config.public_media_mode, PublicMediaMode::Presigned);
        assert_eq!(
            config.public_read_url_ttl,
            Duration::from_secs(DEFAULT_PUBLIC_READ_URL_TTL_SECONDS)
        );
        assert_eq!(
            config.max_active_upload_sessions_per_user,
            DEFAULT_MAX_ACTIVE_UPLOAD_SESSIONS_PER_USER as i64
        );
        assert_eq!(config.user_storage_quota_bytes, None);
        assert_eq!(config.global_storage_warning_threshold_bytes, None);
        assert!(config.trusted_proxy_hops.is_empty());
        assert_eq!(
            config.startup_warnings(),
            &[StartupWarning::NonHttpsPublicUrl {
                url: "http://localhost:8080/".to_string()
            }]
        );
    }

    #[test]
    fn public_media_mode_can_use_proxy() {
        let mut env = valid_local_env();
        env.insert("CLIPLINE_PUBLIC_MEDIA_MODE", "proxy".to_string());
        env.insert("CLIPLINE_PUBLIC_READ_URL_TTL_SECONDS", "600".to_string());

        let config = Config::from_source(&env).expect("config");

        assert_eq!(config.public_media_mode, PublicMediaMode::Proxy);
        assert_eq!(config.public_read_url_ttl, Duration::from_secs(600));
    }

    #[test]
    fn process_role_can_split_http_and_job_runner() {
        let mut env = valid_local_env();
        env.insert("CLIPLINE_PROCESS_ROLE", "web".to_string());

        let config = Config::from_source(&env).expect("web config");

        assert_eq!(config.process_role, ProcessRole::Web);
        assert!(config.process_role.runs_http());
        assert!(!config.process_role.runs_jobs());

        env.insert("CLIPLINE_PROCESS_ROLE", "worker".to_string());
        let config = Config::from_source(&env).expect("worker config");

        assert_eq!(config.process_role, ProcessRole::Worker);
        assert!(!config.process_role.runs_http());
        assert!(config.process_role.runs_jobs());
    }

    #[test]
    fn process_role_rejects_unknown_values() {
        let mut env = valid_local_env();
        env.insert("CLIPLINE_PROCESS_ROLE", "scheduler".to_string());

        let err = Config::from_source(&env).expect_err("invalid role should fail");

        assert!(matches!(
            err,
            ConfigError::InvalidEnum {
                name: "CLIPLINE_PROCESS_ROLE",
                ..
            }
        ));
    }

    #[test]
    fn public_read_url_ttl_must_be_positive() {
        let mut env = valid_local_env();
        env.insert("CLIPLINE_PUBLIC_READ_URL_TTL_SECONDS", "0".to_string());

        let err = Config::from_source(&env).expect_err("zero ttl should fail");

        assert!(
            matches!(err, ConfigError::Validation(message) if message.contains("CLIPLINE_PUBLIC_READ_URL_TTL_SECONDS"))
        );
    }

    #[test]
    fn operational_limits_and_trusted_proxy_hops_are_configurable() {
        let mut env = valid_local_env();
        env.insert(
            "CLIPLINE_MAX_ACTIVE_UPLOAD_SESSIONS_PER_USER",
            "4".to_string(),
        );
        env.insert("CLIPLINE_USER_STORAGE_QUOTA_BYTES", "1024".to_string());
        env.insert(
            "CLIPLINE_GLOBAL_STORAGE_WARNING_THRESHOLD_BYTES",
            "2048".to_string(),
        );
        env.insert(
            "CLIPLINE_TRUSTED_PROXY_HOPS",
            "127.0.0.1, 10.0.0.2".to_string(),
        );

        let config = Config::from_source(&env).expect("config");

        assert_eq!(config.max_active_upload_sessions_per_user, 4);
        assert_eq!(config.user_storage_quota_bytes, Some(1024));
        assert_eq!(config.global_storage_warning_threshold_bytes, Some(2048));
        assert_eq!(
            config.trusted_proxy_hops,
            vec![
                "127.0.0.1".parse::<IpAddr>().unwrap(),
                "10.0.0.2".parse::<IpAddr>().unwrap()
            ]
        );
    }

    #[test]
    fn s3_config_requires_bucket() {
        let mut env = valid_local_env();
        env.insert("CLIPLINE_STORAGE_BACKEND", "s3".to_string());
        env.insert("CLIPLINE_S3_ENDPOINT", "http://localhost:9000".to_string());
        env.insert("CLIPLINE_S3_ACCESS_KEY_ID", "access".to_string());
        env.insert("CLIPLINE_S3_SECRET_ACCESS_KEY", "secret".to_string());

        let err = Config::from_source(&env).expect_err("missing bucket should fail");

        assert!(matches!(
            err,
            ConfigError::MissingRequired {
                name: "CLIPLINE_S3_BUCKET"
            }
        ));
    }

    #[test]
    fn file_variant_takes_precedence_over_inline_secret() {
        let path =
            std::env::temp_dir().join(format!("clipline-cloud-secret-{}", std::process::id()));
        fs::write(&path, "from-file\n").expect("write secret file");

        let mut env = valid_local_env();
        env.insert("CLIPLINE_BOOTSTRAP_ADMIN_PASSWORD", "from-env".to_string());
        env.insert(
            "CLIPLINE_BOOTSTRAP_ADMIN_PASSWORD_FILE",
            path.display().to_string(),
        );

        let config = Config::from_source(&env).expect("config");

        assert_eq!(
            config.bootstrap_admin_password.as_deref(),
            Some("from-file")
        );
        fs::remove_file(path).ok();
    }
}
