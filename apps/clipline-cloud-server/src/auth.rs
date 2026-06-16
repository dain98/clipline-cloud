use std::{
    collections::HashMap,
    sync::{Arc, Mutex},
    time::{Duration, Instant},
};

use argon2::{
    password_hash::{
        rand_core::OsRng as PasswordOsRng, PasswordHash, PasswordHasher, PasswordVerifier,
        SaltString,
    },
    Argon2,
};
use axum::{
    extract::{Extension, Path, State},
    http::{header, HeaderMap, HeaderValue, StatusCode},
    response::{IntoResponse, Response},
    routing::{delete, get, post},
    Json, Router,
};
use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine as _};
use chrono::{DateTime, Duration as ChronoDuration, Utc};
use clipline_cloud_api_types::{
    CreateDeviceTokenRequest, CreateDeviceTokenResponse, DeviceTokenResponse, DiscoveryFeatures,
    DiscoveryResponse, MeResponse, UserResponse,
};
use clipline_cloud_db::{
    now_utc, DeviceToken, NewAuditLogEntry, NewDeviceToken, NewResetPasswordToken, NewSession,
    NewUser, Repositories, User,
};
use cookie::{Cookie, SameSite};
use hmac::{Hmac, Mac};
use rand::{rngs::OsRng, RngCore};
use serde::{Deserialize, Serialize};
use serde_json::json;
use sha2::{Digest, Sha256};
use tracing::{info, warn};

use crate::{config::Config, AppState, ClientIp};

const SESSION_COOKIE: &str = "clipline_session";
const CSRF_HEADER: &str = "x-csrf-token";
const SESSION_TTL_DAYS: i64 = 30;
const RESET_TOKEN_TTL_HOURS: i64 = 2;
const LOGIN_LIMIT_WINDOW: Duration = Duration::from_secs(60);
const LOGIN_LIMIT_MAX_FAILURES: u32 = 10;

type HmacSha256 = Hmac<Sha256>;

#[derive(Clone)]
pub struct AuthRuntime {
    csrf_secret: Arc<Vec<u8>>,
    login_limiter: Arc<Mutex<HashMap<String, LoginBucket>>>,
}

#[derive(Debug, Clone)]
struct LoginBucket {
    failures: u32,
    reset_at: Instant,
}

impl AuthRuntime {
    pub fn new(session_secret: Option<&str>) -> Self {
        let csrf_secret = match session_secret {
            Some(value) if !value.is_empty() => value.as_bytes().to_vec(),
            _ => {
                let mut bytes = vec![0_u8; 32];
                OsRng.fill_bytes(&mut bytes);
                warn!(
                    event = "auth.csrf_secret.generated",
                    message = "CLIPLINE_SESSION_SECRET is not configured; generated an ephemeral CSRF secret for this process"
                );
                bytes
            }
        };

        Self {
            csrf_secret: Arc::new(csrf_secret),
            login_limiter: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    fn csrf_token(&self, session_hash: &str) -> String {
        let mut nonce = [0_u8; 16];
        OsRng.fill_bytes(&mut nonce);
        let nonce = URL_SAFE_NO_PAD.encode(nonce);
        let signature = csrf_signature(&self.csrf_secret, session_hash, &nonce);
        format!("{nonce}.{signature}")
    }

    fn verify_csrf_token(&self, session_hash: &str, token: &str) -> bool {
        let Some((nonce, signature)) = token.split_once('.') else {
            return false;
        };
        csrf_signature(&self.csrf_secret, session_hash, nonce) == signature
    }

    fn login_allowed(&self, username: &str) -> bool {
        let key = username.to_ascii_lowercase();
        let mut buckets = self.login_limiter.lock().expect("login limiter lock");
        let bucket = buckets.entry(key).or_insert_with(|| LoginBucket {
            failures: 0,
            reset_at: Instant::now() + LOGIN_LIMIT_WINDOW,
        });
        if Instant::now() >= bucket.reset_at {
            bucket.failures = 0;
            bucket.reset_at = Instant::now() + LOGIN_LIMIT_WINDOW;
        }
        bucket.failures < LOGIN_LIMIT_MAX_FAILURES
    }

    fn record_login_failure(&self, username: &str) {
        let key = username.to_ascii_lowercase();
        let mut buckets = self.login_limiter.lock().expect("login limiter lock");
        let bucket = buckets.entry(key).or_insert_with(|| LoginBucket {
            failures: 0,
            reset_at: Instant::now() + LOGIN_LIMIT_WINDOW,
        });
        if Instant::now() >= bucket.reset_at {
            bucket.failures = 0;
            bucket.reset_at = Instant::now() + LOGIN_LIMIT_WINDOW;
        }
        bucket.failures += 1;
    }

    fn record_login_success(&self, username: &str) {
        self.login_limiter
            .lock()
            .expect("login limiter lock")
            .remove(&username.to_ascii_lowercase());
    }
}

pub async fn ensure_first_admin(
    config: &Config,
    repositories: &Repositories,
) -> anyhow::Result<()> {
    if repositories.users.count_admins().await? > 0 {
        return Ok(());
    }

    let username = config
        .bootstrap_admin_username
        .clone()
        .unwrap_or_else(|| "admin".to_string());
    let password = match &config.bootstrap_admin_password {
        Some(password) => password.clone(),
        None => generate_one_time_password(),
    };
    let generated_password = config.bootstrap_admin_password.is_none();
    let password_hash = hash_password(&password).map_err(|error| anyhow::anyhow!(error.message))?;
    let user = repositories
        .users
        .create(&NewUser::new(&username, password_hash, "admin"))
        .await?;

    let mut audit = NewAuditLogEntry::new("admin.bootstrap.created");
    audit.target_type = Some("user".to_string());
    audit.target_id = Some(user.id.clone());
    audit.metadata_json = Some(sqlx::types::Json(json!({ "username": username })));
    repositories.audit_log.create(&audit).await?;

    if generated_password {
        println!("Clipline Cloud initialized.");
        println!("Initial admin user created: {username}");
        println!("One-time password: {password}");
        println!("Save this password now. It will not be shown again.");
    } else {
        info!(
            event = "admin.bootstrap.created",
            username = %username,
            message = "Initial admin user created from bootstrap credentials"
        );
    }

    Ok(())
}

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/.well-known/clipline-cloud", get(discovery))
        .route("/api/v1/auth/login", post(login))
        .route("/api/v1/auth/logout", post(logout))
        .route("/api/v1/auth/me", get(me))
        .route("/api/v1/auth/device-token", post(create_device_token))
        .route("/api/v1/auth/device-tokens", get(list_device_tokens))
        .route(
            "/api/v1/auth/device-tokens/{id}",
            delete(revoke_device_token),
        )
        .route("/api/v1/users", get(list_users).post(create_user))
        .route(
            "/api/v1/users/{id}",
            get(get_user).patch(update_user).delete(disable_user),
        )
        .route("/api/v1/users/{id}/reset-password", post(reset_password))
        .route("/api/v1/me/change-password", post(change_password))
}

async fn discovery(State(state): State<AppState>) -> Json<DiscoveryResponse> {
    Json(DiscoveryResponse {
        name: "Clipline Cloud".to_string(),
        api_version: "v1".to_string(),
        server_version: env!("CARGO_PKG_VERSION").to_string(),
        min_client_version: "0.1.0".to_string(),
        public_url: state.config.public_url.to_string(),
        features: DiscoveryFeatures {
            single_put_upload: true,
            chunked_upload: true,
            public_sharing: true,
            clip_markers: true,
            max_upload_size_bytes: state.config.max_upload_size_bytes,
        },
    })
}

#[derive(Debug, Deserialize)]
struct LoginRequest {
    username: String,
    password: String,
}

#[derive(Debug, Serialize)]
struct LoginResponse {
    user: UserResponse,
    csrf_token: String,
}

async fn login(
    State(state): State<AppState>,
    Extension(client_ip): Extension<ClientIp>,
    headers: HeaderMap,
    Json(request): Json<LoginRequest>,
) -> Result<Response, ApiError> {
    if !state.auth.login_allowed(&request.username) {
        return Err(ApiError::too_many_requests("too many login attempts"));
    }

    let Some(user) = state
        .repositories
        .users
        .get_by_username(&request.username)
        .await?
    else {
        state.auth.record_login_failure(&request.username);
        return Err(ApiError::unauthorized("invalid username or password"));
    };
    if user.is_disabled || !verify_password(&request.password, &user.password_hash)? {
        state.auth.record_login_failure(&request.username);
        return Err(ApiError::unauthorized("invalid username or password"));
    }

    state.auth.record_login_success(&request.username);

    let raw_token = generate_prefixed_token("clp_ses_");
    let token_hash = hash_token(&raw_token);
    let mut new_session = NewSession::new(
        &user.id,
        &token_hash,
        now_utc() + ChronoDuration::days(SESSION_TTL_DAYS),
    );
    new_session.user_agent = header_to_string(&headers, header::USER_AGENT.as_str());
    new_session.ip_address = Some(client_ip.0);
    let session = state.repositories.sessions.create(&new_session).await?;
    state.repositories.users.update_last_login(&user.id).await?;

    let csrf_token = state.auth.csrf_token(&token_hash);
    let body = Json(LoginResponse {
        user: user_response(user),
        csrf_token,
    });
    let mut response = body.into_response();
    response.headers_mut().insert(
        header::SET_COOKIE,
        HeaderValue::from_str(&session_cookie(&raw_token, Some(session.expires_at)))
            .expect("valid cookie"),
    );
    Ok(response)
}

async fn logout(State(state): State<AppState>, headers: HeaderMap) -> Result<Response, ApiError> {
    let auth = require_auth(&state, &headers).await?;
    require_csrf_for_cookie(&state, &headers, &auth)?;

    if let AuthKind::Cookie { token_hash } = &auth.kind {
        state
            .repositories
            .sessions
            .revoke_by_token_hash(token_hash)
            .await?;
    }

    let mut response = Json(json!({ "status": "ok" })).into_response();
    response.headers_mut().insert(
        header::SET_COOKIE,
        HeaderValue::from_static(
            "clipline_session=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax",
        ),
    );
    Ok(response)
}

async fn me(
    State(state): State<AppState>,
    headers: HeaderMap,
) -> Result<Json<MeResponse>, ApiError> {
    let auth = require_auth(&state, &headers).await?;
    let csrf_token = match &auth.kind {
        AuthKind::Cookie { token_hash } => Some(state.auth.csrf_token(token_hash)),
        AuthKind::Bearer => None,
    };

    Ok(Json(MeResponse {
        user: user_response(auth.user),
        auth_kind: auth.kind.name().to_string(),
        csrf_token,
    }))
}

async fn create_device_token(
    State(state): State<AppState>,
    Json(request): Json<CreateDeviceTokenRequest>,
) -> Result<Json<CreateDeviceTokenResponse>, ApiError> {
    if request.name.trim().is_empty() {
        return Err(ApiError::bad_request("device name is required"));
    }
    if !state.auth.login_allowed(&request.username) {
        return Err(ApiError::too_many_requests("too many login attempts"));
    }

    let Some(user) = state
        .repositories
        .users
        .get_by_username(&request.username)
        .await?
    else {
        state.auth.record_login_failure(&request.username);
        return Err(ApiError::unauthorized("invalid username or password"));
    };
    if user.is_disabled || !verify_password(&request.password, &user.password_hash)? {
        state.auth.record_login_failure(&request.username);
        return Err(ApiError::unauthorized("invalid username or password"));
    }

    state.auth.record_login_success(&request.username);

    let raw_token = generate_prefixed_token("clp_dev_");
    let token_hash = hash_token(&raw_token);
    let device_token = state
        .repositories
        .device_tokens
        .create(&NewDeviceToken::new(
            &user.id,
            request.name.trim(),
            token_hash,
        ))
        .await?;

    Ok(Json(CreateDeviceTokenResponse {
        token: raw_token,
        device_token: device_token_response(device_token),
    }))
}

async fn list_device_tokens(
    State(state): State<AppState>,
    headers: HeaderMap,
) -> Result<Json<Vec<DeviceTokenResponse>>, ApiError> {
    let auth = require_auth(&state, &headers).await?;
    let tokens = state
        .repositories
        .device_tokens
        .list_for_user(&auth.user.id)
        .await?
        .into_iter()
        .map(device_token_response)
        .collect();
    Ok(Json(tokens))
}

async fn revoke_device_token(
    State(state): State<AppState>,
    Extension(client_ip): Extension<ClientIp>,
    headers: HeaderMap,
    Path(id): Path<String>,
) -> Result<Json<serde_json::Value>, ApiError> {
    let auth = require_auth(&state, &headers).await?;
    require_csrf_for_cookie(&state, &headers, &auth)?;

    state
        .repositories
        .device_tokens
        .revoke_for_user(&auth.user.id, &id)
        .await?;
    audit_with_ip(
        &state.repositories,
        Some(client_ip.as_str()),
        Some(&auth.user),
        "device_token.revoked",
        Some("device_token"),
        Some(&id),
        None,
    )
    .await?;
    Ok(Json(json!({ "status": "ok" })))
}

async fn list_users(
    State(state): State<AppState>,
    headers: HeaderMap,
) -> Result<Json<Vec<UserResponse>>, ApiError> {
    let _auth = require_admin(&state, &headers).await?;
    let users = state
        .repositories
        .users
        .list()
        .await?
        .into_iter()
        .map(user_response)
        .collect();
    Ok(Json(users))
}

#[derive(Debug, Deserialize)]
struct CreateUserRequest {
    username: String,
    password: String,
    display_name: Option<String>,
    role: Option<String>,
    reauth_password: String,
}

async fn create_user(
    State(state): State<AppState>,
    Extension(client_ip): Extension<ClientIp>,
    headers: HeaderMap,
    Json(request): Json<CreateUserRequest>,
) -> Result<Json<UserResponse>, ApiError> {
    let auth = require_admin(&state, &headers).await?;
    require_csrf_for_cookie(&state, &headers, &auth)?;
    require_reauth(&auth.user, &request.reauth_password)?;

    let role = request.role.unwrap_or_else(|| "user".to_string());
    validate_role(&role)?;
    if request.username.trim().is_empty() || request.password.len() < 8 {
        return Err(ApiError::bad_request(
            "username and an 8+ character password are required",
        ));
    }

    let mut new_user = NewUser::new(
        request.username.trim(),
        hash_password(&request.password)?,
        role,
    );
    new_user.display_name = request.display_name;
    let created = state.repositories.users.create(&new_user).await?;
    audit_with_ip(
        &state.repositories,
        Some(client_ip.as_str()),
        Some(&auth.user),
        "user.created",
        Some("user"),
        Some(&created.id),
        Some(json!({ "username": created.username })),
    )
    .await?;
    Ok(Json(user_response(created)))
}

async fn get_user(
    State(state): State<AppState>,
    headers: HeaderMap,
    Path(id): Path<String>,
) -> Result<Json<UserResponse>, ApiError> {
    let _auth = require_admin(&state, &headers).await?;
    let Some(user) = state.repositories.users.get(&id).await? else {
        return Err(ApiError::not_found("user not found"));
    };
    Ok(Json(user_response(user)))
}

#[derive(Debug, Deserialize)]
struct UpdateUserRequest {
    display_name: Option<String>,
    role: Option<String>,
    is_disabled: Option<bool>,
    reauth_password: String,
}

async fn update_user(
    State(state): State<AppState>,
    Extension(client_ip): Extension<ClientIp>,
    headers: HeaderMap,
    Path(id): Path<String>,
    Json(request): Json<UpdateUserRequest>,
) -> Result<Json<UserResponse>, ApiError> {
    let auth = require_admin(&state, &headers).await?;
    require_csrf_for_cookie(&state, &headers, &auth)?;
    require_reauth(&auth.user, &request.reauth_password)?;

    let Some(existing) = state.repositories.users.get(&id).await? else {
        return Err(ApiError::not_found("user not found"));
    };
    let role = request.role.unwrap_or(existing.role);
    validate_role(&role)?;
    let is_disabled = request.is_disabled.unwrap_or(existing.is_disabled);

    state
        .repositories
        .users
        .update_profile(&id, request.display_name.as_deref(), &role, is_disabled)
        .await?;
    audit_with_ip(
        &state.repositories,
        Some(client_ip.as_str()),
        Some(&auth.user),
        "user.updated",
        Some("user"),
        Some(&id),
        Some(json!({ "role": role, "is_disabled": is_disabled })),
    )
    .await?;

    Ok(Json(user_response(
        state
            .repositories
            .users
            .get(&id)
            .await?
            .expect("updated user should exist"),
    )))
}

async fn disable_user(
    State(state): State<AppState>,
    Extension(client_ip): Extension<ClientIp>,
    headers: HeaderMap,
    Path(id): Path<String>,
    Json(request): Json<ResetPasswordRequest>,
) -> Result<Json<serde_json::Value>, ApiError> {
    let auth = require_admin(&state, &headers).await?;
    require_csrf_for_cookie(&state, &headers, &auth)?;
    require_reauth(&auth.user, &request.reauth_password)?;

    state.repositories.users.set_disabled(&id, true).await?;
    audit_with_ip(
        &state.repositories,
        Some(client_ip.as_str()),
        Some(&auth.user),
        "user.disabled",
        Some("user"),
        Some(&id),
        None,
    )
    .await?;
    Ok(Json(json!({ "status": "ok" })))
}

#[derive(Debug, Deserialize)]
struct ResetPasswordRequest {
    reauth_password: String,
}

#[derive(Debug, Serialize)]
struct ResetPasswordResponse {
    reset_token: String,
    expires_at: DateTime<Utc>,
}

async fn reset_password(
    State(state): State<AppState>,
    Extension(client_ip): Extension<ClientIp>,
    headers: HeaderMap,
    Path(id): Path<String>,
    Json(request): Json<ResetPasswordRequest>,
) -> Result<Json<ResetPasswordResponse>, ApiError> {
    let auth = require_admin(&state, &headers).await?;
    require_csrf_for_cookie(&state, &headers, &auth)?;
    require_reauth(&auth.user, &request.reauth_password)?;

    if state.repositories.users.get(&id).await?.is_none() {
        return Err(ApiError::not_found("user not found"));
    }

    let raw_token = generate_prefixed_token("clp_rst_");
    let expires_at = now_utc() + ChronoDuration::hours(RESET_TOKEN_TTL_HOURS);
    state
        .repositories
        .reset_password_tokens
        .create(&NewResetPasswordToken::new(
            &id,
            hash_token(&raw_token),
            expires_at,
        ))
        .await?;
    audit_with_ip(
        &state.repositories,
        Some(client_ip.as_str()),
        Some(&auth.user),
        "user.password_reset_token.created",
        Some("user"),
        Some(&id),
        None,
    )
    .await?;

    Ok(Json(ResetPasswordResponse {
        reset_token: raw_token,
        expires_at,
    }))
}

#[derive(Debug, Deserialize)]
struct ChangePasswordRequest {
    current_password: String,
    new_password: String,
}

async fn change_password(
    State(state): State<AppState>,
    Extension(client_ip): Extension<ClientIp>,
    headers: HeaderMap,
    Json(request): Json<ChangePasswordRequest>,
) -> Result<Json<serde_json::Value>, ApiError> {
    let auth = require_auth(&state, &headers).await?;
    require_csrf_for_cookie(&state, &headers, &auth)?;
    if !verify_password(&request.current_password, &auth.user.password_hash)? {
        return Err(ApiError::forbidden("current password is incorrect"));
    }
    if request.new_password.len() < 8 {
        return Err(ApiError::bad_request(
            "new password must be at least 8 characters",
        ));
    }

    state
        .repositories
        .users
        .update_password_hash(&auth.user.id, &hash_password(&request.new_password)?)
        .await?;
    audit_with_ip(
        &state.repositories,
        Some(client_ip.as_str()),
        Some(&auth.user),
        "user.password_changed",
        Some("user"),
        Some(&auth.user.id),
        None,
    )
    .await?;
    Ok(Json(json!({ "status": "ok" })))
}

#[derive(Debug, Clone)]
pub(crate) struct AuthenticatedUser {
    pub(crate) user: User,
    kind: AuthKind,
}

#[derive(Debug, Clone)]
enum AuthKind {
    Cookie { token_hash: String },
    Bearer,
}

impl AuthKind {
    fn name(&self) -> &'static str {
        match self {
            Self::Cookie { .. } => "cookie",
            Self::Bearer => "bearer",
        }
    }
}

pub(crate) async fn require_admin(
    state: &AppState,
    headers: &HeaderMap,
) -> Result<AuthenticatedUser, ApiError> {
    let auth = require_auth(state, headers).await?;
    if auth.user.role != "admin" {
        return Err(ApiError::forbidden("admin role required"));
    }
    Ok(auth)
}

pub(crate) async fn require_auth(
    state: &AppState,
    headers: &HeaderMap,
) -> Result<AuthenticatedUser, ApiError> {
    if let Some(token) = bearer_token(headers) {
        let token_hash = hash_token(token);
        let Some(device_token) = state
            .repositories
            .device_tokens
            .get_by_token_hash(&token_hash)
            .await?
        else {
            return Err(ApiError::unauthorized("invalid bearer token"));
        };
        if device_token.revoked_at.is_some()
            || device_token
                .expires_at
                .is_some_and(|expires_at| expires_at <= now_utc())
        {
            return Err(ApiError::unauthorized("invalid bearer token"));
        }
        let Some(user) = state.repositories.users.get(&device_token.user_id).await? else {
            return Err(ApiError::unauthorized("invalid bearer token"));
        };
        if user.is_disabled {
            return Err(ApiError::unauthorized("user is disabled"));
        }
        state
            .repositories
            .device_tokens
            .touch(&device_token.id)
            .await?;
        return Ok(AuthenticatedUser {
            user,
            kind: AuthKind::Bearer,
        });
    }

    let Some(raw_session_token) = session_cookie_value(headers) else {
        return Err(ApiError::unauthorized("authentication required"));
    };
    let token_hash = hash_token(&raw_session_token);
    let Some(session) = state
        .repositories
        .sessions
        .get_by_token_hash(&token_hash)
        .await?
    else {
        return Err(ApiError::unauthorized("authentication required"));
    };
    if session.revoked_at.is_some() || session.expires_at <= now_utc() {
        return Err(ApiError::unauthorized("authentication required"));
    }
    let Some(user) = state.repositories.users.get(&session.user_id).await? else {
        return Err(ApiError::unauthorized("authentication required"));
    };
    if user.is_disabled {
        return Err(ApiError::unauthorized("user is disabled"));
    }
    state.repositories.sessions.touch(&session.id).await?;

    Ok(AuthenticatedUser {
        user,
        kind: AuthKind::Cookie { token_hash },
    })
}

pub(crate) fn require_csrf_for_cookie(
    state: &AppState,
    headers: &HeaderMap,
    auth: &AuthenticatedUser,
) -> Result<(), ApiError> {
    let AuthKind::Cookie { token_hash } = &auth.kind else {
        return Ok(());
    };

    validate_origin(headers, &state.config.public_url)?;

    let Some(token) = header_to_string(headers, CSRF_HEADER) else {
        return Err(ApiError::forbidden("CSRF token is required"));
    };
    if !state.auth.verify_csrf_token(token_hash, &token) {
        return Err(ApiError::forbidden("CSRF token is invalid"));
    }

    Ok(())
}

fn require_reauth(user: &User, password: &str) -> Result<(), ApiError> {
    if verify_password(password, &user.password_hash)? {
        Ok(())
    } else {
        Err(ApiError::forbidden("reauthentication failed"))
    }
}

pub(crate) async fn audit_with_ip(
    repositories: &Repositories,
    ip_address: Option<&str>,
    actor: Option<&User>,
    action: &str,
    target_type: Option<&str>,
    target_id: Option<&str>,
    metadata: Option<serde_json::Value>,
) -> Result<(), ApiError> {
    let mut entry = NewAuditLogEntry::new(action);
    entry.actor_user_id = actor.map(|user| user.id.clone());
    entry.target_type = target_type.map(ToOwned::to_owned);
    entry.target_id = target_id.map(ToOwned::to_owned);
    entry.ip_address = ip_address.map(ToOwned::to_owned);
    entry.metadata_json = metadata.map(sqlx::types::Json);
    repositories.audit_log.create(&entry).await?;
    Ok(())
}

fn validate_origin(headers: &HeaderMap, public_url: &url::Url) -> Result<(), ApiError> {
    let expected = origin(public_url);
    let actual = header_to_string(headers, header::ORIGIN.as_str()).or_else(|| {
        header_to_string(headers, header::REFERER.as_str())
            .and_then(|value| url::Url::parse(&value).ok().map(|parsed| origin(&parsed)))
    });

    match actual {
        Some(actual) if actual == expected => Ok(()),
        _ => Err(ApiError::forbidden("request origin is not allowed")),
    }
}

fn origin(url: &url::Url) -> String {
    let host = url.host_str().unwrap_or_default();
    match url.port() {
        Some(port) => format!("{}://{}:{}", url.scheme(), host, port),
        None => format!("{}://{}", url.scheme(), host),
    }
}

fn validate_role(role: &str) -> Result<(), ApiError> {
    match role {
        "admin" | "user" => Ok(()),
        _ => Err(ApiError::bad_request("role must be admin or user")),
    }
}

fn hash_password(password: &str) -> Result<String, ApiError> {
    Ok(Argon2::default()
        .hash_password(
            password.as_bytes(),
            &SaltString::generate(&mut PasswordOsRng),
        )
        .map_err(|error| ApiError::internal(error.to_string()))?
        .to_string())
}

fn verify_password(password: &str, password_hash: &str) -> Result<bool, ApiError> {
    let parsed =
        PasswordHash::new(password_hash).map_err(|error| ApiError::internal(error.to_string()))?;
    Ok(Argon2::default()
        .verify_password(password.as_bytes(), &parsed)
        .is_ok())
}

fn generate_prefixed_token(prefix: &str) -> String {
    let mut bytes = [0_u8; 32];
    OsRng.fill_bytes(&mut bytes);
    format!("{prefix}{}", URL_SAFE_NO_PAD.encode(bytes))
}

fn generate_one_time_password() -> String {
    let mut bytes = [0_u8; 18];
    OsRng.fill_bytes(&mut bytes);
    URL_SAFE_NO_PAD.encode(bytes)
}

fn hash_token(token: &str) -> String {
    let digest = Sha256::digest(token.as_bytes());
    let mut out = String::with_capacity(digest.len() * 2);
    for byte in digest {
        use std::fmt::Write as _;
        let _ = write!(out, "{byte:02x}");
    }
    out
}

fn csrf_signature(secret: &[u8], session_hash: &str, nonce: &str) -> String {
    let mut mac = HmacSha256::new_from_slice(secret).expect("HMAC accepts any key length");
    mac.update(session_hash.as_bytes());
    mac.update(b".");
    mac.update(nonce.as_bytes());
    URL_SAFE_NO_PAD.encode(mac.finalize().into_bytes())
}

fn session_cookie(raw_token: &str, expires_at: Option<DateTime<Utc>>) -> String {
    let mut cookie = Cookie::build((SESSION_COOKIE, raw_token.to_string()))
        .path("/")
        .http_only(true)
        .secure(true)
        .same_site(SameSite::Lax)
        .build();
    if let Some(expires_at) = expires_at {
        cookie.set_expires(
            cookie::time::OffsetDateTime::from_unix_timestamp(expires_at.timestamp()).ok(),
        );
    }
    cookie.to_string()
}

fn session_cookie_value(headers: &HeaderMap) -> Option<String> {
    let cookies = headers.get(header::COOKIE)?.to_str().ok()?;
    cookies
        .split(';')
        .filter_map(|value| Cookie::parse(value.trim()).ok())
        .find(|cookie| cookie.name() == SESSION_COOKIE)
        .map(|cookie| cookie.value().to_string())
}

fn bearer_token(headers: &HeaderMap) -> Option<&str> {
    let header = headers.get(header::AUTHORIZATION)?.to_str().ok()?;
    header.strip_prefix("Bearer ")
}

fn header_to_string(headers: &HeaderMap, key: &str) -> Option<String> {
    headers
        .get(key)
        .and_then(|value| value.to_str().ok())
        .map(ToOwned::to_owned)
}

fn user_response(value: User) -> UserResponse {
    UserResponse {
        id: value.id,
        username: value.username,
        display_name: value.display_name,
        role: value.role,
        is_disabled: value.is_disabled,
        created_at: value.created_at,
        updated_at: value.updated_at,
        last_login_at: value.last_login_at,
    }
}

fn device_token_response(value: DeviceToken) -> DeviceTokenResponse {
    DeviceTokenResponse {
        id: value.id,
        name: value.name,
        created_at: value.created_at,
        last_used_at: value.last_used_at,
        expires_at: value.expires_at,
        revoked_at: value.revoked_at,
    }
}

#[derive(Debug)]
pub struct ApiError {
    status: StatusCode,
    message: String,
}

impl ApiError {
    pub(crate) fn bad_request(message: impl Into<String>) -> Self {
        Self {
            status: StatusCode::BAD_REQUEST,
            message: message.into(),
        }
    }

    pub(crate) fn unauthorized(message: impl Into<String>) -> Self {
        Self {
            status: StatusCode::UNAUTHORIZED,
            message: message.into(),
        }
    }

    pub(crate) fn forbidden(message: impl Into<String>) -> Self {
        Self {
            status: StatusCode::FORBIDDEN,
            message: message.into(),
        }
    }

    pub(crate) fn not_found(message: impl Into<String>) -> Self {
        Self {
            status: StatusCode::NOT_FOUND,
            message: message.into(),
        }
    }

    pub(crate) fn conflict(message: impl Into<String>) -> Self {
        Self {
            status: StatusCode::CONFLICT,
            message: message.into(),
        }
    }

    pub(crate) fn payload_too_large(message: impl Into<String>) -> Self {
        Self {
            status: StatusCode::PAYLOAD_TOO_LARGE,
            message: message.into(),
        }
    }

    pub(crate) fn too_many_requests(message: impl Into<String>) -> Self {
        Self {
            status: StatusCode::TOO_MANY_REQUESTS,
            message: message.into(),
        }
    }

    pub(crate) fn internal(message: impl Into<String>) -> Self {
        Self {
            status: StatusCode::INTERNAL_SERVER_ERROR,
            message: message.into(),
        }
    }
}

impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        let status = self.status;
        let body = Json(json!({ "error": self.message }));
        (status, body).into_response()
    }
}

impl From<clipline_cloud_db::DbError> for ApiError {
    fn from(value: clipline_cloud_db::DbError) -> Self {
        warn!(event = "api.db_error", error = %value);
        Self::internal("database error")
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn token_hash_is_sha256_hex_not_plaintext() {
        let token = generate_prefixed_token("clp_ses_");
        let hash = hash_token(&token);

        assert_ne!(token, hash);
        assert_eq!(hash.len(), 64);
        assert!(token.starts_with("clp_ses_"));
    }

    #[test]
    fn password_hash_verifies_without_plaintext() {
        let hash = hash_password("correct horse battery staple").expect("hash");

        assert_ne!(hash, "correct horse battery staple");
        assert!(hash.starts_with("$argon2id$"));
        assert!(verify_password("correct horse battery staple", &hash).expect("verify"));
        assert!(!verify_password("wrong", &hash).expect("verify"));
    }

    #[test]
    fn csrf_token_is_bound_to_session_hash() {
        let runtime = AuthRuntime::new(Some("secret"));
        let token = runtime.csrf_token("session-a");

        assert!(runtime.verify_csrf_token("session-a", &token));
        assert!(!runtime.verify_csrf_token("session-b", &token));
    }
}
