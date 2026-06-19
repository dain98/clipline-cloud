mod admin;
mod auth;
mod clips;
mod config;
mod logging;
mod media;
mod uploads;

use std::{net::SocketAddr, sync::Arc};

use anyhow::Context;
use axum::{
    body::Body,
    extract::{ConnectInfo, DefaultBodyLimit, State},
    http::{header, HeaderMap, HeaderName, HeaderValue, Request, StatusCode},
    middleware::{self, Next},
    response::{IntoResponse, Response},
    routing::get,
    Json, Router,
};
use clipline_cloud_api_types::{HealthResponse, ReadinessResponse};
use clipline_cloud_core::jobs::{
    ensure_cleanup_clip_sweep, ensure_cleanup_session_sweep, JobRunner, JobRunnerConfig,
};
use clipline_cloud_db::{Database, Repositories};
use clipline_cloud_storage::{LocalStorage, S3Storage, S3StorageConfig, SharedStorageBackend};
use config::{Config, ProcessRole, StorageConfig};
use tokio::task::JoinHandle;
use tokio::{net::TcpListener, sync::watch};
use tower_http::{catch_panic::CatchPanicLayer, services::ServeDir};
use tracing::{info, warn};

const MIB: u64 = 1024 * 1024;

#[derive(Clone)]
pub(crate) struct AppState {
    pub(crate) config: Arc<Config>,
    pub(crate) database: Database,
    pub(crate) repositories: Repositories,
    pub(crate) storage: SharedStorageBackend,
    pub(crate) auth: auth::AuthRuntime,
}

#[derive(Debug, Clone)]
pub(crate) struct ClientIp(pub(crate) String);

impl ClientIp {
    pub(crate) fn as_str(&self) -> &str {
        &self.0
    }
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let config = Config::from_env().context("failed to load configuration")?;
    logging::init(&config.log_level).context("failed to initialize logging")?;

    log_config_summary(&config);

    for warning in config.startup_warnings() {
        warn!(event = "config.warning", message = %warning);
    }

    run(config).await
}

async fn run(config: Config) -> anyhow::Result<()> {
    let bind_addr = config.bind_addr;
    let process_role = config.process_role;
    let config = Arc::new(config);
    let database = Database::connect_and_migrate(&config.database_url)
        .await
        .context("failed to connect database and run migrations")?;

    info!(
        event = "database.ready",
        backend = ?database.kind(),
    );
    let repositories = Repositories::new(database.clone());
    if process_role.runs_http() {
        auth::ensure_first_admin(&config, &repositories)
            .await
            .context("failed to ensure first owner user")?;
    } else {
        info!(
            event = "auth.bootstrap_admin.skipped",
            process_role = process_role.as_str()
        );
    }

    let storage = build_storage(&config)
        .await
        .context("failed to initialize storage backend")?;
    info!(
        event = "storage.selected",
        backend = config.storage_backend_name(),
    );

    match process_role {
        ProcessRole::All => {
            let (job_shutdown_tx, job_runner_handle) =
                start_job_runner(&config, repositories.clone(), storage.clone(), "server").await?;
            let server_result =
                run_http_server(config, database, repositories, storage, bind_addr).await;
            stop_job_runner(job_shutdown_tx, job_runner_handle).await;
            server_result?;
        }
        ProcessRole::Web => {
            run_http_server(config, database, repositories, storage, bind_addr).await?;
        }
        ProcessRole::Worker => {
            let (job_shutdown_tx, job_runner_handle) =
                start_job_runner(&config, repositories, storage, "worker").await?;
            shutdown_signal().await;
            stop_job_runner(job_shutdown_tx, job_runner_handle).await;
        }
    }

    Ok(())
}

async fn run_http_server(
    config: Arc<Config>,
    database: Database,
    repositories: Repositories,
    storage: SharedStorageBackend,
    bind_addr: SocketAddr,
) -> anyhow::Result<()> {
    let auth_runtime = auth::AuthRuntime::new(config.session_secret.as_deref());
    let app = router(config, database, repositories, storage, auth_runtime);
    let listener = TcpListener::bind(bind_addr)
        .await
        .with_context(|| format!("failed to bind {bind_addr}"))?;
    let local_addr = listener
        .local_addr()
        .context("failed to read local address")?;

    info!(event = "server.listening", bind_addr = %local_addr);

    axum::serve(
        listener,
        app.into_make_service_with_connect_info::<SocketAddr>(),
    )
    .with_graceful_shutdown(shutdown_signal())
    .await
    .context("server failed")
}

async fn start_job_runner(
    config: &Config,
    repositories: Repositories,
    storage: SharedStorageBackend,
    runner_prefix: &str,
) -> anyhow::Result<(watch::Sender<bool>, JoinHandle<()>)> {
    ensure_cleanup_session_sweep(&repositories)
        .await
        .context("failed to schedule cleanup session sweep")?;
    ensure_cleanup_clip_sweep(&repositories)
        .await
        .context("failed to schedule cleanup clip sweep")?;

    let (job_shutdown_tx, job_shutdown_rx) = watch::channel(false);
    let job_runner = JobRunner::new(
        repositories,
        storage,
        JobRunnerConfig {
            runner_id: format!("{runner_prefix}-{}", clipline_cloud_db::new_ulid()),
            poll_interval: config.job_poll_interval,
            lock_timeout: config.job_lock_timeout,
            retry_base_delay: config.job_retry_base_delay,
            retry_max_delay: config.job_retry_max_delay,
            video_optimization: config.video_optimization.clone(),
        },
    );
    Ok((
        job_shutdown_tx,
        tokio::spawn(job_runner.run_until_shutdown(job_shutdown_rx)),
    ))
}

async fn stop_job_runner(job_shutdown_tx: watch::Sender<bool>, job_runner_handle: JoinHandle<()>) {
    let _ = job_shutdown_tx.send(true);
    if let Err(error) = job_runner_handle.await {
        warn!(event = "jobs.runner_join_failed", error = %error);
    }
}

fn log_config_summary(config: &Config) {
    info!(
        event = "config.loaded",
        process_role = config.process_role.as_str(),
        public_url = %config.public_url,
        database_url = %config.database_url,
        storage_backend = config.storage_backend_name(),
        bootstrap_admin_username_configured = config.bootstrap_admin_username.is_some(),
        bootstrap_admin_password_configured = config.bootstrap_admin_password.is_some(),
        max_upload_size_bytes = config.max_upload_size_bytes,
        upload_part_size_bytes = config.upload_part_size_bytes,
        single_put_max_bytes = config.single_put_max_bytes,
        upload_session_ttl_seconds = config.upload_session_ttl.as_secs(),
        direct_s3_uploads = config.direct_s3_uploads,
        job_poll_interval_seconds = config.job_poll_interval.as_secs(),
        job_lock_timeout_seconds = config.job_lock_timeout.as_secs(),
        job_retry_base_delay_seconds = config.job_retry_base_delay.as_secs(),
        job_retry_max_delay_seconds = config.job_retry_max_delay.as_secs(),
        video_optimization_enabled = config.video_optimization.enabled,
        video_optimization_crf = config.video_optimization.settings.crf,
        video_optimization_preset = %config.video_optimization.settings.preset.as_str(),
        video_optimization_max_width = ?config.video_optimization.settings.max_width,
        video_optimization_min_savings_percent = config.video_optimization.min_savings_percent,
        video_optimization_keep_original = config.video_optimization.keep_original,
        public_media_mode = config.public_media_mode.as_str(),
        public_read_url_ttl_seconds = config.public_read_url_ttl.as_secs(),
        max_active_upload_sessions_per_user = config.max_active_upload_sessions_per_user,
        user_storage_quota_bytes = config.user_storage_quota_bytes,
        global_storage_warning_threshold_bytes = config.global_storage_warning_threshold_bytes,
        trusted_proxy_hops = ?config.trusted_proxy_hops,
        session_secret_configured = config.session_secret.is_some(),
        static_dir = %config.static_dir.display(),
    );

    match &config.storage {
        StorageConfig::Local { data_dir } => {
            info!(event = "config.storage.local", data_dir = %data_dir.display());
        }
        StorageConfig::S3 {
            endpoint,
            bucket,
            region,
            access_key_id,
            secret_access_key,
            force_path_style,
            prefix,
        } => {
            info!(
                event = "config.storage.s3",
                endpoint = %endpoint,
                bucket = %bucket,
                region = %region,
                credentials_configured = !access_key_id.is_empty() && !secret_access_key.is_empty(),
                force_path_style = *force_path_style,
                prefix = prefix.as_deref().unwrap_or(""),
            );
        }
    }
}

async fn build_storage(config: &Config) -> anyhow::Result<SharedStorageBackend> {
    match &config.storage {
        StorageConfig::Local { data_dir } => Ok(Arc::new(LocalStorage::new(data_dir.clone()))),
        StorageConfig::S3 {
            endpoint,
            bucket,
            region,
            access_key_id,
            secret_access_key,
            force_path_style,
            prefix,
        } => Ok(Arc::new(
            S3Storage::new(S3StorageConfig {
                endpoint: endpoint.clone(),
                bucket: bucket.clone(),
                region: region.clone(),
                access_key_id: access_key_id.clone(),
                secret_access_key: secret_access_key.clone(),
                force_path_style: *force_path_style,
                prefix: prefix.clone(),
            })
            .await?,
        )),
    }
}

fn router(
    config: Arc<Config>,
    database: Database,
    repositories: Repositories,
    storage: SharedStorageBackend,
    auth: auth::AuthRuntime,
) -> Router {
    let static_files = ServeDir::new(&config.static_dir);
    let max_body_bytes = usize::try_from(config.max_upload_size_bytes).unwrap_or(usize::MAX);
    let max_upload_request_body_bytes = upload_request_body_limit(&config);

    Router::new()
        .route("/healthz", get(healthz))
        .route("/readyz", get(readyz))
        .route("/", get(spa_index))
        .route("/login", get(spa_index))
        .route("/about", get(spa_index))
        .route("/public", get(spa_index))
        .route("/library", get(spa_index))
        .route("/admin", get(spa_index))
        .route("/account", get(spa_index))
        .route("/clip/{*path}", get(spa_index))
        .merge(auth::routes())
        .merge(admin::routes())
        .merge(clips::routes())
        .merge(media::routes())
        .merge(uploads::routes(max_upload_request_body_bytes))
        .fallback_service(static_files)
        .layer(DefaultBodyLimit::max(max_body_bytes))
        .layer(middleware::from_fn_with_state(
            config.clone(),
            secure_headers,
        ))
        .layer(middleware::from_fn_with_state(
            config.clone(),
            attach_client_ip,
        ))
        .layer(CatchPanicLayer::new())
        .with_state(AppState {
            config,
            database,
            repositories,
            storage,
            auth,
        })
}

async fn healthz() -> Json<HealthResponse> {
    Json(HealthResponse { status: "ok" })
}

async fn readyz(State(state): State<AppState>) -> (StatusCode, Json<ReadinessResponse>) {
    let _storage_backend = state.config.storage_backend_name();

    let database_status = match state.database.ping().await {
        Ok(()) => "ok",
        Err(error) => {
            warn!(event = "database.readyz_failed", error = %error);
            "error"
        }
    };
    let storage_status = match state.storage.probe().await {
        Ok(()) => "ok",
        Err(error) => {
            warn!(event = "storage.readyz_failed", error = %error);
            "error"
        }
    };
    let ready = database_status == "ok" && storage_status == "ok";

    readiness_response(database_status, storage_status, ready)
}

fn readiness_response(
    database_status: &'static str,
    storage_status: &'static str,
    ready: bool,
) -> (StatusCode, Json<ReadinessResponse>) {
    (
        if ready {
            StatusCode::OK
        } else {
            StatusCode::SERVICE_UNAVAILABLE
        },
        Json(ReadinessResponse {
            status: if ready { "ok" } else { "not_ready" },
            database: database_status,
            storage: storage_status,
        }),
    )
}

async fn spa_index(State(state): State<AppState>) -> Result<Response, StatusCode> {
    let index_path = state.config.static_dir.join("index.html");
    let bytes = tokio::fs::read(index_path)
        .await
        .map_err(|_| StatusCode::NOT_FOUND)?;
    Ok((
        StatusCode::OK,
        [(header::CONTENT_TYPE, "text/html; charset=utf-8")],
        Body::from(bytes),
    )
        .into_response())
}

async fn attach_client_ip(
    State(config): State<Arc<Config>>,
    ConnectInfo(remote_addr): ConnectInfo<SocketAddr>,
    mut request: Request<Body>,
    next: Next,
) -> Response {
    let client_ip = resolve_client_ip(&config, remote_addr, request.headers());
    request.extensions_mut().insert(ClientIp(client_ip));
    next.run(request).await
}

async fn secure_headers(
    State(config): State<Arc<Config>>,
    request: Request<Body>,
    next: Next,
) -> Response {
    let mut response = next.run(request).await;
    let headers = response.headers_mut();
    insert_static_header(
        headers,
        HeaderName::from_static("content-security-policy"),
        "default-src 'self'; base-uri 'self'; frame-ancestors 'none'; object-src 'none'; img-src 'self' data: blob:; media-src 'self' blob:; connect-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'",
    );
    insert_static_header(
        headers,
        HeaderName::from_static("x-content-type-options"),
        "nosniff",
    );
    insert_static_header(
        headers,
        HeaderName::from_static("referrer-policy"),
        "no-referrer",
    );
    insert_static_header(
        headers,
        HeaderName::from_static("permissions-policy"),
        "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
    );
    if config.public_url.scheme() == "https" {
        insert_static_header(
            headers,
            HeaderName::from_static("strict-transport-security"),
            "max-age=31536000; includeSubDomains",
        );
    }
    response
}

fn insert_static_header(headers: &mut HeaderMap, name: HeaderName, value: &'static str) {
    if !headers.contains_key(&name) {
        headers.insert(name, HeaderValue::from_static(value));
    }
}

fn resolve_client_ip(config: &Config, remote_addr: SocketAddr, headers: &HeaderMap) -> String {
    resolve_client_ip_from_trusted(&config.trusted_proxy_hops, remote_addr, headers)
}

fn resolve_client_ip_from_trusted(
    trusted_proxy_hops: &[std::net::IpAddr],
    remote_addr: SocketAddr,
    headers: &HeaderMap,
) -> String {
    let remote_ip = remote_addr.ip();
    let Some(mut chain) = forwarded_for_chain(headers) else {
        return remote_ip.to_string();
    };
    chain.push(remote_ip);
    while chain
        .last()
        .is_some_and(|ip| trusted_proxy_hops.contains(ip))
    {
        chain.pop();
    }
    chain.last().copied().unwrap_or(remote_ip).to_string()
}

fn forwarded_for_chain(headers: &HeaderMap) -> Option<Vec<std::net::IpAddr>> {
    let value = headers
        .get(HeaderName::from_static("x-forwarded-for"))?
        .to_str()
        .ok()?;
    let chain = value
        .split(',')
        .map(str::trim)
        .map(str::parse::<std::net::IpAddr>)
        .collect::<Result<Vec<_>, _>>()
        .ok()?;
    (!chain.is_empty()).then_some(chain)
}

fn upload_request_body_limit(config: &Config) -> usize {
    let derived_part_size = round_up_to_mib_saturating(
        config
            .max_upload_size_bytes
            .div_ceil(10_000)
            .max(config.upload_part_size_bytes),
    )
    .max(config.single_put_max_bytes);
    usize::try_from(derived_part_size).unwrap_or(usize::MAX)
}

fn round_up_to_mib_saturating(value: u64) -> u64 {
    value
        .checked_add(MIB - 1)
        .map(|value| (value / MIB) * MIB)
        .unwrap_or(u64::MAX)
}

async fn shutdown_signal() {
    let ctrl_c = async {
        if let Err(error) = tokio::signal::ctrl_c().await {
            warn!(event = "server.shutdown_signal_error", signal = "ctrl_c", error = %error);
        }
    };

    #[cfg(unix)]
    {
        let terminate = async {
            match tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate()) {
                Ok(mut signal) => {
                    signal.recv().await;
                }
                Err(error) => {
                    warn!(event = "server.shutdown_signal_error", signal = "sigterm", error = %error);
                }
            }
        };

        tokio::select! {
            _ = ctrl_c => {}
            _ = terminate => {}
        }
    }

    #[cfg(not(unix))]
    {
        ctrl_c.await;
    }

    info!(event = "server.shutdown");
}

#[cfg(test)]
mod tests {
    use super::*;

    fn headers_with_xff(value: &'static str) -> HeaderMap {
        let mut headers = HeaderMap::new();
        headers.insert(
            HeaderName::from_static("x-forwarded-for"),
            HeaderValue::from_static(value),
        );
        headers
    }

    #[test]
    fn forwarded_for_uses_rightmost_untrusted_hop() {
        let headers = headers_with_xff("198.51.100.9, 203.0.113.7");
        let trusted = ["10.0.0.2".parse().unwrap()];
        let remote_addr = "10.0.0.2:443".parse().unwrap();

        assert_eq!(
            resolve_client_ip_from_trusted(&trusted, remote_addr, &headers),
            "203.0.113.7"
        );
    }

    #[test]
    fn forwarded_for_strips_trusted_trailing_proxy_hops() {
        let headers = headers_with_xff("203.0.113.7, 10.0.0.1");
        let trusted = ["10.0.0.1".parse().unwrap(), "10.0.0.2".parse().unwrap()];
        let remote_addr = "10.0.0.2:443".parse().unwrap();

        assert_eq!(
            resolve_client_ip_from_trusted(&trusted, remote_addr, &headers),
            "203.0.113.7"
        );
    }

    #[test]
    fn untrusted_remote_peer_ignores_forwarded_for() {
        let headers = headers_with_xff("203.0.113.7");
        let trusted = ["10.0.0.2".parse().unwrap()];
        let remote_addr = "198.51.100.9:443".parse().unwrap();

        assert_eq!(
            resolve_client_ip_from_trusted(&trusted, remote_addr, &headers),
            "198.51.100.9"
        );
    }

    #[test]
    fn upload_request_body_limit_rounds_derived_part_size() {
        assert_eq!(round_up_to_mib_saturating((64 * MIB) + 1), 65 * MIB);
    }

    #[test]
    fn readiness_response_reports_not_ready_when_a_dependency_fails() {
        let (status, Json(body)) = readiness_response("ok", "ok", true);
        assert_eq!(status, StatusCode::OK);
        assert_eq!(body.status, "ok");
        assert_eq!(body.database, "ok");
        assert_eq!(body.storage, "ok");

        let (status, Json(body)) = readiness_response("error", "ok", false);
        assert_eq!(status, StatusCode::SERVICE_UNAVAILABLE);
        assert_eq!(body.status, "not_ready");
        assert_eq!(body.database, "error");
        assert_eq!(body.storage, "ok");

        let (status, Json(body)) = readiness_response("ok", "error", false);
        assert_eq!(status, StatusCode::SERVICE_UNAVAILABLE);
        assert_eq!(body.status, "not_ready");
        assert_eq!(body.database, "ok");
        assert_eq!(body.storage, "error");
    }
}
