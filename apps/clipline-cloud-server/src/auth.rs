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
    body::Bytes,
    extract::{DefaultBodyLimit, Extension, Path, State},
    http::{header, HeaderMap, HeaderValue, StatusCode},
    response::{IntoResponse, Response},
    routing::{delete, get, patch, post, put},
    Json, Router,
};
use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine as _};
use chrono::{DateTime, Duration as ChronoDuration, Utc};
use clipline_cloud_api_types::{
    CreateDeviceTokenRequest, CreateDeviceTokenResponse, DeviceTokenResponse, DiscoveryFeatures,
    DiscoveryResponse, MeResponse, SessionResponse, UserResponse,
};
use clipline_cloud_db::{
    now_utc, AppSettings, DeviceToken, NewAuditLogEntry, NewDeviceToken, NewResetPasswordToken,
    NewSession, NewUser, Repositories, Session, User,
};
use clipline_cloud_storage::{ObjectKey, PutObjectMetadata, StorageError};
use cookie::{Cookie, SameSite};
use hmac::{Hmac, Mac};
use rand::{rngs::OsRng, RngCore};
use serde::{Deserialize, Deserializer, Serialize};
use serde_json::json;
use sha2::{Digest, Sha256};
use tracing::{info, warn};

use crate::{config::Config, mail, AppState, ClientIp};

const SESSION_COOKIE: &str = "clipline_session";
const CSRF_HEADER: &str = "x-csrf-token";
const SESSION_TTL_DAYS: i64 = 30;
const RESET_TOKEN_TTL_HOURS: i64 = 2;
const LOGIN_LIMIT_WINDOW: Duration = Duration::from_secs(15 * 60);
const LOGIN_USERNAME_MAX_FAILURES: u32 = 5;
const LOGIN_SOURCE_MAX_FAILURES: u32 = 30;
const LOGIN_LOCKOUT_BASE: Duration = Duration::from_secs(60);
const LOGIN_LOCKOUT_MAX: Duration = Duration::from_secs(15 * 60);
const LOGIN_LIMIT_MAX_BUCKETS: usize = 4096;
const MIN_PASSWORD_LEN: usize = 8;
const MAX_PASSWORD_LEN: usize = 1024;
const MAX_DISPLAY_NAME_LEN: usize = 120;
const MAX_PROFILE_BIO_LEN: usize = 2000;
const MAX_AVATAR_BYTES: usize = 2 * 1024 * 1024;

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
    blocked_until: Option<Instant>,
}

#[derive(Debug, Clone, PartialEq, Eq, Default)]
enum PatchField<T> {
    #[default]
    Unset,
    Set(Option<T>),
}

fn deserialize_patch_field<'de, D, T>(deserializer: D) -> Result<PatchField<T>, D::Error>
where
    D: Deserializer<'de>,
    T: Deserialize<'de>,
{
    Option::<T>::deserialize(deserializer).map(PatchField::Set)
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
        let Ok(signature) = URL_SAFE_NO_PAD.decode(signature) else {
            return false;
        };
        verify_csrf_signature(&self.csrf_secret, session_hash, nonce, &signature)
    }

    fn login_allowed(&self, username: &str, source: &str) -> Result<(), Duration> {
        let mut buckets = self.login_limiter.lock().expect("login limiter lock");
        let now = Instant::now();
        prune_login_buckets(&mut buckets, now);
        let username_retry = login_bucket_retry_after(
            &mut buckets,
            login_username_key(username),
            now,
            LOGIN_USERNAME_MAX_FAILURES,
        );
        let source_retry = login_bucket_retry_after(
            &mut buckets,
            login_source_key(source),
            now,
            LOGIN_SOURCE_MAX_FAILURES,
        );
        match (username_retry, source_retry) {
            (None, None) => Ok(()),
            (Some(left), None) | (None, Some(left)) => Err(left),
            (Some(left), Some(right)) => Err(left.max(right)),
        }
    }

    fn record_login_failure(&self, username: &str, source: &str) {
        let mut buckets = self.login_limiter.lock().expect("login limiter lock");
        let now = Instant::now();
        prune_login_buckets(&mut buckets, now);
        record_login_bucket_failure(
            &mut buckets,
            login_username_key(username),
            now,
            LOGIN_USERNAME_MAX_FAILURES,
        );
        record_login_bucket_failure(
            &mut buckets,
            login_source_key(source),
            now,
            LOGIN_SOURCE_MAX_FAILURES,
        );
    }

    fn record_login_success(&self, username: &str, _source: &str) {
        self.login_limiter
            .lock()
            .expect("login limiter lock")
            .remove(&login_username_key(username));
    }
}

fn login_username_key(username: &str) -> String {
    format!("user:{}", username.trim().to_ascii_lowercase())
}

fn login_source_key(source: &str) -> String {
    format!("source:{source}")
}

fn new_login_bucket(now: Instant) -> LoginBucket {
    LoginBucket {
        failures: 0,
        reset_at: now + LOGIN_LIMIT_WINDOW,
        blocked_until: None,
    }
}

fn prune_login_buckets(buckets: &mut HashMap<String, LoginBucket>, now: Instant) {
    buckets.retain(|_, bucket| {
        bucket.reset_at > now || bucket.blocked_until.is_some_and(|blocked| blocked > now)
    });
    while buckets.len() >= LOGIN_LIMIT_MAX_BUCKETS {
        let Some(oldest_key) = buckets
            .iter()
            .min_by_key(|(_, bucket)| bucket.reset_at)
            .map(|(key, _)| key.clone())
        else {
            break;
        };
        buckets.remove(&oldest_key);
    }
}

fn login_bucket_retry_after(
    buckets: &mut HashMap<String, LoginBucket>,
    key: String,
    now: Instant,
    _max_failures: u32,
) -> Option<Duration> {
    let bucket = buckets.get_mut(&key)?;
    if now >= bucket.reset_at && bucket.blocked_until.map_or(true, |blocked| blocked <= now) {
        bucket.failures = 0;
        bucket.reset_at = now + LOGIN_LIMIT_WINDOW;
        bucket.blocked_until = None;
        return None;
    }
    bucket
        .blocked_until
        .and_then(|blocked| blocked.checked_duration_since(now))
}

fn record_login_bucket_failure(
    buckets: &mut HashMap<String, LoginBucket>,
    key: String,
    now: Instant,
    max_failures: u32,
) {
    let bucket = buckets.entry(key).or_insert_with(|| new_login_bucket(now));
    if now >= bucket.reset_at && bucket.blocked_until.map_or(true, |blocked| blocked <= now) {
        *bucket = new_login_bucket(now);
    }
    bucket.failures = bucket.failures.saturating_add(1);
    if bucket.failures >= max_failures {
        let overage = bucket.failures.saturating_sub(max_failures).min(8);
        let multiplier = 2_u64.saturating_pow(overage);
        let lockout = Duration::from_secs(
            LOGIN_LOCKOUT_BASE
                .as_secs()
                .saturating_mul(multiplier)
                .min(LOGIN_LOCKOUT_MAX.as_secs()),
        );
        bucket.blocked_until = Some(now + lockout);
    }
}

pub async fn ensure_first_admin(
    config: &Config,
    repositories: &Repositories,
) -> anyhow::Result<()> {
    let settings = repositories.settings.get().await?;
    if let Some(owner_user_id) = settings.owner_user_id.as_deref() {
        if repositories
            .users
            .get(owner_user_id)
            .await?
            .is_some_and(|owner| !owner.is_disabled)
        {
            return Ok(());
        }
        warn!(
            event = "owner.bootstrap.recover",
            owner_user_id = %owner_user_id,
            message = "Configured owner account is missing or disabled; selecting an active owner"
        );
    }

    if let Some(admin) = repositories.users.first_admin().await? {
        repositories.settings.set_owner_user_id(&admin.id).await?;
        info!(
            event = "owner.bootstrap.promoted",
            username = %admin.username,
            message = "Existing admin account promoted to instance owner"
        );
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
    repositories.settings.set_owner_user_id(&user.id).await?;

    let mut audit = NewAuditLogEntry::new("owner.bootstrap.created");
    audit.target_type = Some("user".to_string());
    audit.target_id = Some(user.id.clone());
    audit.metadata_json = Some(sqlx::types::Json(json!({ "username": username })));
    repositories.audit_log.create(&audit).await?;

    if generated_password {
        println!("Clipline Cloud initialized.");
        println!("Initial owner user created: {username}");
        println!("One-time password: {password}");
        println!("Save this password now. It will not be shown again.");
    } else {
        info!(
            event = "owner.bootstrap.created",
            username = %username,
            message = "Initial owner user created from bootstrap credentials"
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
        .route("/api/v1/auth/reset-password", post(redeem_reset_password))
        .route("/api/v1/auth/device-token", post(create_device_token))
        .route("/api/v1/auth/device-tokens", get(list_device_tokens))
        .route(
            "/api/v1/auth/device-tokens/{id}",
            delete(revoke_device_token),
        )
        .route("/api/v1/auth/sessions", get(list_sessions))
        .route("/api/v1/auth/sessions/{id}", delete(revoke_session))
        .route("/api/v1/users", get(list_users).post(create_user))
        .route(
            "/api/v1/users/{id}",
            get(get_user).patch(update_user).delete(disable_user),
        )
        .route("/api/v1/users/{id}/reset-password", post(reset_password))
        .route("/api/v1/me/profile", patch(update_me_profile))
        .route(
            "/api/v1/me/avatar",
            put(update_me_avatar).layer(DefaultBodyLimit::max(MAX_AVATAR_BYTES)),
        )
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
            direct_s3_upload: state.config.direct_s3_uploads,
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
    let login_source = client_ip.as_str();
    if let Err(retry_after) = state.auth.login_allowed(&request.username, login_source) {
        return Err(ApiError::too_many_requests_after(
            "too many login attempts",
            retry_after,
        ));
    }

    let Some(user) = state
        .repositories
        .users
        .get_by_username(&request.username)
        .await?
    else {
        state
            .auth
            .record_login_failure(&request.username, login_source);
        return Err(ApiError::unauthorized("invalid username or password"));
    };
    if user.is_disabled || !verify_password(&request.password, &user.password_hash)? {
        state
            .auth
            .record_login_failure(&request.username, login_source);
        return Err(ApiError::unauthorized("invalid username or password"));
    }

    state
        .auth
        .record_login_success(&request.username, login_source);

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
        user: user_response_for_state(&state, user).await?,
        csrf_token,
    });
    let mut response = body.into_response();
    response.headers_mut().insert(
        header::SET_COOKIE,
        HeaderValue::from_str(&session_cookie(
            &raw_token,
            Some(session.expires_at),
            should_secure_cookie(&state.config),
        ))
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
        HeaderValue::from_str(&clear_session_cookie(should_secure_cookie(&state.config)))
            .expect("valid cookie"),
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
        user: user_response_for_state(&state, auth.user).await?,
        auth_kind: auth.kind.name().to_string(),
        csrf_token,
    }))
}

async fn create_device_token(
    State(state): State<AppState>,
    Extension(client_ip): Extension<ClientIp>,
    Json(request): Json<CreateDeviceTokenRequest>,
) -> Result<Json<CreateDeviceTokenResponse>, ApiError> {
    if request.name.trim().is_empty() {
        return Err(ApiError::bad_request("device name is required"));
    }
    let login_source = client_ip.as_str();
    if let Err(retry_after) = state.auth.login_allowed(&request.username, login_source) {
        return Err(ApiError::too_many_requests_after(
            "too many login attempts",
            retry_after,
        ));
    }

    let Some(user) = state
        .repositories
        .users
        .get_by_username(&request.username)
        .await?
    else {
        state
            .auth
            .record_login_failure(&request.username, login_source);
        return Err(ApiError::unauthorized("invalid username or password"));
    };
    if user.is_disabled || !verify_password(&request.password, &user.password_hash)? {
        state
            .auth
            .record_login_failure(&request.username, login_source);
        return Err(ApiError::unauthorized("invalid username or password"));
    }

    state
        .auth
        .record_login_success(&request.username, login_source);

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

    let revoked = state
        .repositories
        .device_tokens
        .revoke_for_user(&auth.user.id, &id)
        .await?;
    if revoked == 0 {
        return Err(ApiError::not_found("device token not found"));
    }
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

async fn list_sessions(
    State(state): State<AppState>,
    headers: HeaderMap,
) -> Result<Json<Vec<SessionResponse>>, ApiError> {
    let auth = require_auth(&state, &headers).await?;
    let current_token_hash = match &auth.kind {
        AuthKind::Cookie { token_hash } => Some(token_hash.as_str()),
        AuthKind::Bearer => None,
    };
    let sessions = state
        .repositories
        .sessions
        .list_for_user(&auth.user.id)
        .await?
        .into_iter()
        .map(|session| session_response(session, current_token_hash))
        .collect();
    Ok(Json(sessions))
}

async fn revoke_session(
    State(state): State<AppState>,
    Extension(client_ip): Extension<ClientIp>,
    headers: HeaderMap,
    Path(id): Path<String>,
) -> Result<Json<serde_json::Value>, ApiError> {
    let auth = require_auth(&state, &headers).await?;
    require_csrf_for_cookie(&state, &headers, &auth)?;

    let revoked = state
        .repositories
        .sessions
        .revoke_for_user_by_id(&auth.user.id, &id)
        .await?;
    if revoked == 0 {
        return Err(ApiError::not_found("session not found"));
    }
    audit_with_ip(
        &state.repositories,
        Some(client_ip.as_str()),
        Some(&auth.user),
        "session.revoked",
        Some("session"),
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
    let owner_user_id = state.repositories.settings.get().await?.owner_user_id;
    let storage_by_owner = state
        .repositories
        .clips
        .active_storage_bytes_by_owner()
        .await?
        .into_iter()
        .map(|(owner_user_id, storage_bytes)| {
            Ok((
                owner_user_id,
                u64::try_from(storage_bytes)
                    .map_err(|_| ApiError::internal("stored user storage usage is negative"))?,
            ))
        })
        .collect::<Result<HashMap<_, _>, ApiError>>()?;
    let users = state
        .repositories
        .users
        .list()
        .await?
        .into_iter()
        .map(|user| {
            let storage_bytes = storage_by_owner
                .get(user.id.as_str())
                .copied()
                .unwrap_or_default();
            user_response_with_storage_and_owner(user, storage_bytes, owner_user_id.as_deref())
        })
        .collect();
    Ok(Json(users))
}

#[derive(Debug, Deserialize)]
struct CreateUserRequest {
    username: String,
    password: Option<String>,
    email: Option<String>,
    send_invite: Option<bool>,
    generate_invite_link: Option<bool>,
    display_name: Option<String>,
    role: Option<String>,
}

#[derive(Debug, Serialize)]
struct CreateUserResponse {
    #[serde(flatten)]
    user: UserResponse,
    invite_link: Option<PasswordSetupLinkResponse>,
}

async fn create_user(
    State(state): State<AppState>,
    Extension(client_ip): Extension<ClientIp>,
    headers: HeaderMap,
    Json(request): Json<CreateUserRequest>,
) -> Result<Json<CreateUserResponse>, ApiError> {
    let auth = require_admin(&state, &headers).await?;
    require_csrf_for_cookie(&state, &headers, &auth)?;

    let role = request.role.unwrap_or_else(|| "user".to_string());
    validate_role(&role)?;
    if role == "admin" && !user_is_owner(&state, &auth.user).await? {
        return Err(ApiError::forbidden("owner role required to create admins"));
    }
    if request.username.trim().is_empty() {
        return Err(ApiError::bad_request("username is required"));
    }
    let email = normalized_optional_email(request.email)?;
    let send_invite = request.send_invite.unwrap_or(false);
    let generate_invite_link = request.generate_invite_link.unwrap_or(false);
    if send_invite && generate_invite_link {
        return Err(ApiError::bad_request(
            "choose either email invite or invite link",
        ));
    }
    if send_invite && email.is_none() {
        return Err(ApiError::bad_request("email is required to send an invite"));
    }
    if send_invite {
        let settings = state.repositories.settings.get().await?;
        if mail::SmtpInviteConfig::from_settings(&settings)
            .map_err(|error| ApiError::bad_request(error.to_string()))?
            .is_none()
        {
            return Err(ApiError::bad_request("SMTP invites are not enabled"));
        }
    }
    let password = if send_invite || generate_invite_link {
        generate_prefixed_token("clp_tmp_")
    } else {
        let Some(password) = request.password.as_deref() else {
            return Err(ApiError::bad_request("password is required"));
        };
        password.to_string()
    };
    validate_new_password(&password)?;

    let mut new_user = NewUser::new(request.username.trim(), hash_password(&password)?, role);
    new_user.display_name = normalized_display_name(request.display_name)?;
    new_user.email = email;
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
    if send_invite {
        if let Err(error) =
            send_invite_email_for_user(&state, &auth.user, &created, Some(client_ip.as_str())).await
        {
            rollback_new_invited_user(&state, &created.id).await;
            return Err(error);
        }
    }
    let invite_link = if generate_invite_link {
        let link = create_password_setup_link(&state, &created.id).await?;
        audit_with_ip(
            &state.repositories,
            Some(client_ip.as_str()),
            Some(&auth.user),
            "user.invite_link.created",
            Some("user"),
            Some(&created.id),
            Some(json!({ "username": created.username })),
        )
        .await?;
        Some(link)
    } else {
        None
    };
    Ok(Json(CreateUserResponse {
        user: user_response_for_state(&state, created).await?,
        invite_link,
    }))
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
    Ok(Json(user_response_for_state(&state, user).await?))
}

#[derive(Debug, Deserialize)]
struct UpdateUserRequest {
    display_name: Option<String>,
    role: Option<String>,
    is_disabled: Option<bool>,
    #[serde(default, deserialize_with = "deserialize_patch_field")]
    storage_quota_bytes: PatchField<u64>,
    reauth_password: Option<String>,
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

    let Some(existing) = state.repositories.users.get(&id).await? else {
        return Err(ApiError::not_found("user not found"));
    };
    let settings = state.repositories.settings.get().await?;
    let actor_is_owner = settings.owner_user_id.as_deref() == Some(auth.user.id.as_str());
    require_reauth_for_privileged_user_patch(&auth.user, &existing, &request)?;
    enforce_user_update_policy(&auth.user, &existing, &request, &settings, actor_is_owner)?;

    let was_disabled = existing.is_disabled;
    let role = request
        .role
        .clone()
        .unwrap_or_else(|| existing.role.clone());
    validate_role(&role)?;
    let is_disabled = request.is_disabled.unwrap_or(was_disabled);
    let storage_quota_bytes = match request.storage_quota_bytes {
        PatchField::Set(Some(value)) => Some(
            i64::try_from(value)
                .map_err(|_| ApiError::bad_request("storage quota is too large"))?,
        ),
        PatchField::Set(None) => None,
        PatchField::Unset => existing.storage_quota_bytes,
    };
    let display_name = match request.display_name {
        Some(display_name) => normalized_display_name(Some(display_name))?,
        None => existing.display_name,
    };

    state
        .repositories
        .users
        .update_profile(
            &id,
            display_name.as_deref(),
            &role,
            is_disabled,
            storage_quota_bytes,
        )
        .await?;
    if is_disabled && !was_disabled {
        revoke_user_auth(&state.repositories, &id).await?;
    }
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

    Ok(Json(user_response_with_storage_and_owner(
        state
            .repositories
            .users
            .get(&id)
            .await?
            .expect("updated user should exist"),
        0,
        settings.owner_user_id.as_deref(),
    )))
}

#[derive(Debug, Deserialize)]
struct UpdateMeProfileRequest {
    #[serde(default, deserialize_with = "deserialize_patch_field")]
    display_name: PatchField<String>,
    #[serde(default, deserialize_with = "deserialize_patch_field")]
    bio: PatchField<String>,
}

async fn update_me_profile(
    State(state): State<AppState>,
    Extension(client_ip): Extension<ClientIp>,
    headers: HeaderMap,
    Json(request): Json<UpdateMeProfileRequest>,
) -> Result<Json<UserResponse>, ApiError> {
    let auth = require_auth(&state, &headers).await?;
    require_csrf_for_cookie(&state, &headers, &auth)?;

    let display_name = match request.display_name {
        PatchField::Set(value) => normalized_display_name(value)?,
        PatchField::Unset => auth.user.display_name.clone(),
    };
    let bio = match request.bio {
        PatchField::Set(value) => normalized_bio(value)?,
        PatchField::Unset => auth.user.bio.clone(),
    };
    state
        .repositories
        .users
        .update_self_profile(&auth.user.id, display_name.as_deref(), bio.as_deref())
        .await?;
    audit_with_ip(
        &state.repositories,
        Some(client_ip.as_str()),
        Some(&auth.user),
        "user.profile_updated",
        Some("user"),
        Some(&auth.user.id),
        None,
    )
    .await?;

    let updated = state
        .repositories
        .users
        .get(&auth.user.id)
        .await?
        .expect("updated user should exist");
    Ok(Json(user_response_for_state(&state, updated).await?))
}

async fn update_me_avatar(
    State(state): State<AppState>,
    Extension(client_ip): Extension<ClientIp>,
    headers: HeaderMap,
    bytes: Bytes,
) -> Result<Json<UserResponse>, ApiError> {
    let auth = require_auth(&state, &headers).await?;
    require_csrf_for_cookie(&state, &headers, &auth)?;
    if bytes.is_empty() {
        return Err(ApiError::bad_request("avatar image is required"));
    }
    if bytes.len() > MAX_AVATAR_BYTES {
        return Err(ApiError::payload_too_large("avatar image is too large"));
    }
    let content_type = avatar_content_type(&headers)?;
    let extension = avatar_extension(content_type)
        .ok_or_else(|| ApiError::bad_request("avatar must be a PNG, JPEG, WebP, or GIF image"))?;
    let avatar_key = ObjectKey::parse(format!(
        "objects/avatars/{}/avatar.{extension}",
        auth.user.id
    ))
    .map_err(|_| ApiError::internal("invalid avatar key"))?;
    state
        .storage
        .put_object(
            &avatar_key,
            bytes,
            PutObjectMetadata::new(content_type.to_string()),
        )
        .await
        .map_err(storage_api_error)?;

    if let Some(previous_key) = auth.user.avatar_key.as_deref() {
        if previous_key != avatar_key.as_str() {
            if let Ok(key) = ObjectKey::parse(previous_key) {
                let _ = state.storage.delete_object(&key).await;
            }
        }
    }
    state
        .repositories
        .users
        .set_avatar_key(&auth.user.id, Some(avatar_key.as_str()))
        .await?;
    audit_with_ip(
        &state.repositories,
        Some(client_ip.as_str()),
        Some(&auth.user),
        "user.avatar_updated",
        Some("user"),
        Some(&auth.user.id),
        None,
    )
    .await?;

    let updated = state
        .repositories
        .users
        .get(&auth.user.id)
        .await?
        .expect("updated user should exist");
    Ok(Json(user_response_for_state(&state, updated).await?))
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

    let Some(existing) = state.repositories.users.get(&id).await? else {
        return Err(ApiError::not_found("user not found"));
    };
    let settings = state.repositories.settings.get().await?;
    enforce_user_disable_policy(&auth.user, &existing, &settings)?;

    state.repositories.users.set_disabled(&id, true).await?;
    revoke_user_auth(&state.repositories, &id).await?;
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

async fn revoke_user_auth(repositories: &Repositories, user_id: &str) -> Result<(), ApiError> {
    repositories.sessions.revoke_for_user(user_id).await?;
    repositories
        .device_tokens
        .revoke_all_for_user(user_id)
        .await?;
    Ok(())
}

#[derive(Debug, Deserialize)]
struct ResetPasswordRequest {
    reauth_password: String,
}

#[derive(Debug, Serialize)]
struct PasswordSetupLinkResponse {
    reset_token: String,
    reset_url: String,
    expires_at: DateTime<Utc>,
}

type ResetPasswordResponse = PasswordSetupLinkResponse;

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

    let Some(target_user) = state.repositories.users.get(&id).await? else {
        return Err(ApiError::not_found("user not found"));
    };
    let settings = state.repositories.settings.get().await?;
    if is_owner_user(&target_user, &settings) && !is_owner_user(&auth.user, &settings) {
        return Err(ApiError::forbidden(
            "owner role required to reset the owner",
        ));
    }

    let (raw_token, expires_at) = create_reset_token(&state, &id).await?;
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

    let reset_url = mail::reset_url(&state.config.public_url, &raw_token)
        .map_err(|_| ApiError::internal("failed to build reset URL"))?
        .to_string();
    Ok(Json(ResetPasswordResponse {
        reset_token: raw_token,
        reset_url,
        expires_at,
    }))
}

async fn rollback_new_invited_user(state: &AppState, user_id: &str) {
    if let Err(error) = state
        .repositories
        .reset_password_tokens
        .delete_for_user(user_id)
        .await
    {
        warn!(event = "invite.rollback_reset_tokens_failed", user_id = %user_id, error = %error);
    }
    if let Err(error) = state.repositories.users.delete(user_id).await {
        warn!(event = "invite.rollback_user_failed", user_id = %user_id, error = %error);
    }
}

async fn create_password_setup_link(
    state: &AppState,
    user_id: &str,
) -> Result<PasswordSetupLinkResponse, ApiError> {
    let (reset_token, expires_at) = create_reset_token(state, user_id).await?;
    Ok(PasswordSetupLinkResponse {
        reset_url: mail::reset_url(&state.config.public_url, &reset_token)
            .map_err(|_| ApiError::internal("failed to build reset URL"))?
            .to_string(),
        reset_token,
        expires_at,
    })
}

async fn create_reset_token(
    state: &AppState,
    user_id: &str,
) -> Result<(String, DateTime<Utc>), ApiError> {
    let raw_token = generate_prefixed_token("clp_rst_");
    let expires_at = now_utc() + ChronoDuration::hours(RESET_TOKEN_TTL_HOURS);
    state
        .repositories
        .reset_password_tokens
        .create(&NewResetPasswordToken::new(
            user_id,
            hash_token(&raw_token),
            expires_at,
        ))
        .await?;
    Ok((raw_token, expires_at))
}

async fn send_invite_email_for_user(
    state: &AppState,
    actor: &User,
    target: &User,
    client_ip: Option<&str>,
) -> Result<(), ApiError> {
    let Some(email) = target
        .email
        .as_deref()
        .map(str::trim)
        .filter(|email| !email.is_empty())
    else {
        return Err(ApiError::bad_request(
            "user email is required to send an invite",
        ));
    };
    let settings = state.repositories.settings.get().await?;
    let Some(config) = mail::SmtpInviteConfig::from_settings(&settings)
        .map_err(|error| ApiError::bad_request(error.to_string()))?
    else {
        return Err(ApiError::bad_request("SMTP invites are not enabled"));
    };
    let (reset_token, expires_at) = create_reset_token(state, &target.id).await?;
    mail::send_invite(
        &config,
        &state.config.public_url,
        mail::InviteEmail {
            to_email: email.to_string(),
            username: target.username.clone(),
            reset_token,
            expires_at,
        },
    )
    .await
    .map_err(|error| {
        warn!(event = "smtp.invite_failed", user_id = %target.id, error = %error);
        ApiError::internal("invite email failed")
    })?;
    audit_with_ip(
        &state.repositories,
        client_ip,
        Some(actor),
        "user.invite_email.sent",
        Some("user"),
        Some(&target.id),
        Some(json!({ "email": email })),
    )
    .await?;
    Ok(())
}

#[derive(Debug, Deserialize)]
struct ChangePasswordRequest {
    current_password: String,
    new_password: String,
}

#[derive(Debug, Deserialize)]
struct RedeemResetPasswordRequest {
    reset_token: String,
    new_password: String,
}

async fn redeem_reset_password(
    State(state): State<AppState>,
    Extension(client_ip): Extension<ClientIp>,
    Json(request): Json<RedeemResetPasswordRequest>,
) -> Result<Json<serde_json::Value>, ApiError> {
    validate_new_password(&request.new_password)?;
    let token_hash = hash_token(&request.reset_token);
    let Some(token) = state
        .repositories
        .reset_password_tokens
        .get_by_token_hash(&token_hash)
        .await?
    else {
        return Err(ApiError::unauthorized("reset token is invalid or expired"));
    };
    if token.used_at.is_some() || token.expires_at <= now_utc() {
        return Err(ApiError::unauthorized("reset token is invalid or expired"));
    }
    let Some(user) = state.repositories.users.get(&token.user_id).await? else {
        return Err(ApiError::unauthorized("reset token is invalid or expired"));
    };
    if !state
        .repositories
        .reset_password_tokens
        .mark_used_if_valid(&token.id, now_utc())
        .await?
    {
        return Err(ApiError::unauthorized("reset token is invalid or expired"));
    }

    state
        .repositories
        .users
        .update_password_hash(&user.id, &hash_password(&request.new_password)?)
        .await?;
    state
        .repositories
        .sessions
        .revoke_for_user(&user.id)
        .await?;
    state
        .repositories
        .device_tokens
        .revoke_all_for_user(&user.id)
        .await?;
    audit_with_ip(
        &state.repositories,
        Some(client_ip.as_str()),
        None,
        "user.password_reset_redeemed",
        Some("user"),
        Some(&user.id),
        None,
    )
    .await?;

    Ok(Json(json!({ "status": "ok" })))
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
    validate_new_password(&request.new_password)?;

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
    if !matches!(auth.user.role.as_str(), "admin" | "owner")
        && !user_is_owner(state, &auth.user).await?
    {
        return Err(ApiError::forbidden("admin role required"));
    }
    Ok(auth)
}

pub(crate) async fn user_is_owner(state: &AppState, user: &User) -> Result<bool, ApiError> {
    let settings = state.repositories.settings.get().await?;
    Ok(is_owner_user(user, &settings))
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

pub(crate) async fn optional_auth(
    state: &AppState,
    headers: &HeaderMap,
) -> Result<Option<AuthenticatedUser>, ApiError> {
    if bearer_token(headers).is_none() && session_cookie_value(headers).is_none() {
        return Ok(None);
    }
    match require_auth(state, headers).await {
        Ok(auth) => Ok(Some(auth)),
        Err(error) if error.status == StatusCode::UNAUTHORIZED => Ok(None),
        Err(error) => Err(error),
    }
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

pub(crate) fn require_reauth(user: &User, password: &str) -> Result<(), ApiError> {
    if verify_password(password, &user.password_hash)? {
        Ok(())
    } else {
        Err(ApiError::forbidden("reauthentication failed"))
    }
}

pub(crate) fn validate_new_password(password: &str) -> Result<(), ApiError> {
    if password.len() < MIN_PASSWORD_LEN {
        return Err(ApiError::bad_request(format!(
            "new password must be at least {MIN_PASSWORD_LEN} characters"
        )));
    }
    if password.len() > MAX_PASSWORD_LEN {
        return Err(ApiError::bad_request(format!(
            "new password must be at most {MAX_PASSWORD_LEN} bytes"
        )));
    }
    Ok(())
}

fn normalized_optional_email(email: Option<String>) -> Result<Option<String>, ApiError> {
    let Some(email) = email else {
        return Ok(None);
    };
    let email = email.trim();
    if email.is_empty() {
        return Ok(None);
    }
    if email.len() > 320 || !email.contains('@') || email.contains(char::is_whitespace) {
        return Err(ApiError::bad_request("email must be a valid email address"));
    }
    Ok(Some(email.to_string()))
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

fn enforce_user_update_policy(
    actor: &User,
    target: &User,
    request: &UpdateUserRequest,
    settings: &AppSettings,
    actor_is_owner: bool,
) -> Result<(), ApiError> {
    let target_is_owner = is_owner_user(target, settings);
    let target_is_admin = matches!(target.role.as_str(), "admin" | "owner");
    let role_change = request
        .role
        .as_deref()
        .is_some_and(|role| role != target.role);
    let disabled_state_change = request
        .is_disabled
        .is_some_and(|is_disabled| is_disabled != target.is_disabled);

    if target_is_owner {
        if !actor_is_owner {
            return Err(ApiError::forbidden(
                "owner role required to modify the owner",
            ));
        }
        if request.is_disabled == Some(true) {
            return Err(ApiError::forbidden("owner account cannot be disabled"));
        }
        if role_change {
            return Err(ApiError::forbidden("owner role cannot be changed"));
        }
    }

    if target_is_admin && !actor_is_owner {
        if disabled_state_change {
            return Err(ApiError::forbidden(
                "owner role required to change admin disabled state",
            ));
        }
        if role_change {
            return Err(ApiError::forbidden("owner role required to change admins"));
        }
    }

    if request.role.as_deref() == Some("admin") && !target_is_admin && !actor_is_owner {
        return Err(ApiError::forbidden("owner role required to grant admin"));
    }

    if actor.id == target.id && request.is_disabled == Some(true) {
        return Err(ApiError::forbidden("users cannot disable themselves"));
    }

    Ok(())
}

fn require_reauth_for_privileged_user_patch(
    actor: &User,
    target: &User,
    request: &UpdateUserRequest,
) -> Result<(), ApiError> {
    let role_change = request
        .role
        .as_deref()
        .is_some_and(|role| role != target.role);
    let disabled_state_change = request
        .is_disabled
        .is_some_and(|is_disabled| is_disabled != target.is_disabled);
    if role_change || disabled_state_change {
        let Some(password) = request.reauth_password.as_deref() else {
            return Err(ApiError::bad_request(
                "reauth_password is required for role or disabled-state changes",
            ));
        };
        require_reauth(actor, password)?;
    }
    Ok(())
}

fn enforce_user_disable_policy(
    actor: &User,
    target: &User,
    settings: &AppSettings,
) -> Result<(), ApiError> {
    if actor.id == target.id {
        return Err(ApiError::forbidden("users cannot disable themselves"));
    }
    if is_owner_user(target, settings) {
        return Err(ApiError::forbidden("owner account cannot be disabled"));
    }
    if matches!(target.role.as_str(), "admin" | "owner") && !is_owner_user(actor, settings) {
        return Err(ApiError::forbidden("owner role required to disable admins"));
    }
    Ok(())
}

fn is_owner_user(user: &User, settings: &AppSettings) -> bool {
    settings.owner_user_id.as_deref() == Some(user.id.as_str())
}

fn validate_role(role: &str) -> Result<(), ApiError> {
    match role {
        "admin" | "user" => Ok(()),
        _ => Err(ApiError::bad_request("role must be admin or user")),
    }
}

fn normalized_optional_string(value: Option<String>) -> Option<String> {
    value
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty())
}

fn normalized_display_name(value: Option<String>) -> Result<Option<String>, ApiError> {
    let Some(value) = normalized_optional_string(value) else {
        return Ok(None);
    };
    if value.len() > MAX_DISPLAY_NAME_LEN {
        return Err(ApiError::bad_request(format!(
            "display_name must be at most {MAX_DISPLAY_NAME_LEN} bytes"
        )));
    }
    Ok(Some(value))
}

fn normalized_bio(value: Option<String>) -> Result<Option<String>, ApiError> {
    let Some(value) = normalized_optional_string(value) else {
        return Ok(None);
    };
    if value.chars().count() > MAX_PROFILE_BIO_LEN {
        return Err(ApiError::bad_request(format!(
            "bio must be {MAX_PROFILE_BIO_LEN} characters or fewer"
        )));
    }
    Ok(Some(value))
}

fn avatar_content_type(headers: &HeaderMap) -> Result<&'static str, ApiError> {
    let value = headers
        .get(header::CONTENT_TYPE)
        .and_then(|value| value.to_str().ok())
        .unwrap_or_default()
        .split(';')
        .next()
        .unwrap_or_default()
        .trim()
        .to_ascii_lowercase();
    match value.as_str() {
        "image/png" => Ok("image/png"),
        "image/jpeg" | "image/jpg" => Ok("image/jpeg"),
        "image/webp" => Ok("image/webp"),
        "image/gif" => Ok("image/gif"),
        _ => Err(ApiError::bad_request(
            "avatar must be a PNG, JPEG, WebP, or GIF image",
        )),
    }
}

fn avatar_extension(content_type: &str) -> Option<&'static str> {
    match content_type {
        "image/png" => Some("png"),
        "image/jpeg" => Some("jpg"),
        "image/webp" => Some("webp"),
        "image/gif" => Some("gif"),
        _ => None,
    }
}

fn storage_api_error(error: StorageError) -> ApiError {
    match error {
        StorageError::NotFound(_) => ApiError::not_found("object not found"),
        error => {
            warn!(event = "api.storage_error", error = %error);
            ApiError::internal("storage error")
        }
    }
}

pub(crate) fn hash_password(password: &str) -> Result<String, ApiError> {
    Ok(Argon2::default()
        .hash_password(
            password.as_bytes(),
            &SaltString::generate(&mut PasswordOsRng),
        )
        .map_err(|error| ApiError::internal(error.to_string()))?
        .to_string())
}

fn verify_password(password: &str, password_hash: &str) -> Result<bool, ApiError> {
    if password.len() > MAX_PASSWORD_LEN {
        return Ok(false);
    }
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

pub(crate) fn generate_one_time_password() -> String {
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
    URL_SAFE_NO_PAD.encode(csrf_signature_bytes(secret, session_hash, nonce))
}

fn csrf_signature_bytes(secret: &[u8], session_hash: &str, nonce: &str) -> Vec<u8> {
    let mut mac = HmacSha256::new_from_slice(secret).expect("HMAC accepts any key length");
    mac.update(session_hash.as_bytes());
    mac.update(b".");
    mac.update(nonce.as_bytes());
    mac.finalize().into_bytes().to_vec()
}

fn verify_csrf_signature(secret: &[u8], session_hash: &str, nonce: &str, signature: &[u8]) -> bool {
    let mut mac = HmacSha256::new_from_slice(secret).expect("HMAC accepts any key length");
    mac.update(session_hash.as_bytes());
    mac.update(b".");
    mac.update(nonce.as_bytes());
    mac.verify_slice(signature).is_ok()
}

fn session_cookie(raw_token: &str, expires_at: Option<DateTime<Utc>>, secure: bool) -> String {
    let mut cookie = Cookie::build((SESSION_COOKIE, raw_token.to_string()))
        .path("/")
        .http_only(true)
        .secure(secure)
        .same_site(SameSite::Lax)
        .build();
    if let Some(expires_at) = expires_at {
        cookie.set_expires(
            cookie::time::OffsetDateTime::from_unix_timestamp(expires_at.timestamp()).ok(),
        );
    }
    cookie.to_string()
}

fn clear_session_cookie(secure: bool) -> String {
    let mut cookie = format!("{SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax");
    if secure {
        cookie.push_str("; Secure");
    }
    cookie
}

fn should_secure_cookie(config: &Config) -> bool {
    config.public_url.scheme() == "https"
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

async fn user_response_for_state(state: &AppState, value: User) -> Result<UserResponse, ApiError> {
    let owner_user_id = state.repositories.settings.get().await?.owner_user_id;
    Ok(user_response_with_storage_and_owner(
        value,
        0,
        owner_user_id.as_deref(),
    ))
}

fn user_response_with_storage_and_owner(
    value: User,
    storage_bytes: u64,
    owner_user_id: Option<&str>,
) -> UserResponse {
    let storage_quota_bytes = value
        .storage_quota_bytes
        .and_then(|quota| u64::try_from(quota).ok());
    let role = if owner_user_id == Some(value.id.as_str()) {
        "owner".to_string()
    } else {
        value.role
    };
    let avatar_url = value
        .avatar_key
        .as_ref()
        .map(|_| public_avatar_url_path(&value.username));
    UserResponse {
        id: value.id,
        username: value.username,
        display_name: value.display_name,
        email: value.email,
        bio: value.bio,
        avatar_url,
        role,
        is_disabled: value.is_disabled,
        storage_bytes,
        storage_quota_bytes,
        created_at: value.created_at,
        updated_at: value.updated_at,
        last_login_at: value.last_login_at,
    }
}

fn public_avatar_url_path(username: &str) -> String {
    format!("/api/v1/public/users/{}/avatar", path_segment(username))
}

fn path_segment(value: &str) -> String {
    const HEX: &[u8; 16] = b"0123456789ABCDEF";
    let mut encoded = String::new();
    for byte in value.bytes() {
        if byte.is_ascii_alphanumeric() || matches!(byte, b'-' | b'_' | b'.' | b'~') {
            encoded.push(byte as char);
        } else {
            encoded.push('%');
            encoded.push(HEX[(byte >> 4) as usize] as char);
            encoded.push(HEX[(byte & 0x0f) as usize] as char);
        }
    }
    encoded
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

fn session_response(value: Session, current_token_hash: Option<&str>) -> SessionResponse {
    let current = current_token_hash.is_some_and(|token_hash| value.token_hash == token_hash);
    SessionResponse {
        id: value.id,
        user_agent: value.user_agent,
        ip_address: value.ip_address,
        current,
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
    retry_after: Option<Duration>,
}

impl ApiError {
    pub(crate) fn message(&self) -> &str {
        &self.message
    }

    pub(crate) fn bad_request(message: impl Into<String>) -> Self {
        Self {
            status: StatusCode::BAD_REQUEST,
            message: message.into(),
            retry_after: None,
        }
    }

    pub(crate) fn unauthorized(message: impl Into<String>) -> Self {
        Self {
            status: StatusCode::UNAUTHORIZED,
            message: message.into(),
            retry_after: None,
        }
    }

    pub(crate) fn forbidden(message: impl Into<String>) -> Self {
        Self {
            status: StatusCode::FORBIDDEN,
            message: message.into(),
            retry_after: None,
        }
    }

    pub(crate) fn not_found(message: impl Into<String>) -> Self {
        Self {
            status: StatusCode::NOT_FOUND,
            message: message.into(),
            retry_after: None,
        }
    }

    pub(crate) fn conflict(message: impl Into<String>) -> Self {
        Self {
            status: StatusCode::CONFLICT,
            message: message.into(),
            retry_after: None,
        }
    }

    pub(crate) fn payload_too_large(message: impl Into<String>) -> Self {
        Self {
            status: StatusCode::PAYLOAD_TOO_LARGE,
            message: message.into(),
            retry_after: None,
        }
    }

    pub(crate) fn too_many_requests(message: impl Into<String>) -> Self {
        Self {
            status: StatusCode::TOO_MANY_REQUESTS,
            message: message.into(),
            retry_after: None,
        }
    }

    pub(crate) fn too_many_requests_after(
        message: impl Into<String>,
        retry_after: Duration,
    ) -> Self {
        Self {
            status: StatusCode::TOO_MANY_REQUESTS,
            message: message.into(),
            retry_after: Some(retry_after),
        }
    }

    pub(crate) fn service_unavailable_after(
        message: impl Into<String>,
        retry_after: Duration,
    ) -> Self {
        Self {
            status: StatusCode::SERVICE_UNAVAILABLE,
            message: message.into(),
            retry_after: Some(retry_after),
        }
    }

    pub(crate) fn internal(message: impl Into<String>) -> Self {
        Self {
            status: StatusCode::INTERNAL_SERVER_ERROR,
            message: message.into(),
            retry_after: None,
        }
    }
}

impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        let status = self.status;
        let retry_after = self.retry_after;
        let body = Json(json!({ "error": self.message }));
        let mut response = (status, body).into_response();
        if let Some(retry_after) = retry_after {
            let seconds = retry_after.as_secs().max(1).to_string();
            if let Ok(value) = HeaderValue::from_str(&seconds) {
                response.headers_mut().insert(header::RETRY_AFTER, value);
            }
        }
        response
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
    use std::sync::Arc;

    use axum::response::IntoResponse;
    use clipline_cloud_db::{
        new_ulid, Database, DeviceToken, NewDeviceToken, NewSession, NewUser, Repositories, Session,
    };
    use clipline_cloud_storage::{LocalStorage, SharedStorageBackend};
    use tempfile::TempDir;

    struct TestApp {
        state: AppState,
        _temp_dir: TempDir,
    }

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

    #[test]
    fn csrf_token_rejects_tampered_signature() {
        let runtime = AuthRuntime::new(Some("secret"));
        let token = runtime.csrf_token("session-a");
        let (nonce, signature) = token.split_once('.').expect("token parts");
        let mut signature = signature.as_bytes().to_vec();
        let last = signature.last_mut().expect("signature byte");
        *last = if *last == b'A' { b'B' } else { b'A' };
        let tampered = format!("{nonce}.{}", String::from_utf8(signature).expect("utf8"));

        assert!(!runtime.verify_csrf_token("session-a", &tampered));
    }

    #[test]
    fn session_cookie_secure_flag_tracks_public_url_scheme() {
        let secure_cookie = session_cookie(
            "clp_ses_token",
            Some(now_utc() + ChronoDuration::hours(1)),
            true,
        );
        let insecure_cookie = session_cookie(
            "clp_ses_token",
            Some(now_utc() + ChronoDuration::hours(1)),
            false,
        );

        assert!(secure_cookie.contains("Secure"));
        assert!(!insecure_cookie.contains("Secure"));
        assert!(clear_session_cookie(true).contains("Secure"));
        assert!(!clear_session_cookie(false).contains("Secure"));
    }

    #[test]
    fn login_limiter_blocks_repeated_failures_for_username() {
        let runtime = AuthRuntime::new(Some("secret"));
        for _ in 0..LOGIN_USERNAME_MAX_FAILURES {
            assert!(runtime.login_allowed("Dain", "198.51.100.10").is_ok());
            runtime.record_login_failure("Dain", "198.51.100.10");
        }

        let retry_after = runtime
            .login_allowed("dain", "198.51.100.11")
            .expect_err("username should be blocked");
        assert!(retry_after >= Duration::from_secs(1));

        runtime.record_login_success("dain", "198.51.100.11");
        assert!(runtime.login_allowed("dain", "198.51.100.11").is_ok());
    }

    #[test]
    fn login_limiter_blocks_username_spraying_from_source() {
        let runtime = AuthRuntime::new(Some("secret"));
        for index in 0..LOGIN_SOURCE_MAX_FAILURES {
            let username = format!("user-{index}");
            assert!(runtime.login_allowed(&username, "203.0.113.10").is_ok());
            runtime.record_login_failure(&username, "203.0.113.10");
        }

        assert!(runtime.login_allowed("fresh-user", "203.0.113.10").is_err());
        assert!(runtime.login_allowed("fresh-user", "203.0.113.11").is_ok());
    }

    #[test]
    fn too_many_requests_sets_retry_after_header() {
        let response =
            ApiError::too_many_requests_after("slow down", Duration::from_secs(7)).into_response();

        assert_eq!(response.status(), StatusCode::TOO_MANY_REQUESTS);
        assert_eq!(
            response.headers().get(header::RETRY_AFTER),
            Some(&HeaderValue::from_static("7"))
        );
    }

    #[test]
    fn update_user_request_distinguishes_null_storage_quota() {
        let omitted: UpdateUserRequest = serde_json::from_str("{}").expect("omitted quota");
        assert!(matches!(omitted.storage_quota_bytes, PatchField::Unset));

        let cleared: UpdateUserRequest =
            serde_json::from_str(r#"{"storage_quota_bytes":null}"#).expect("null quota");
        assert!(matches!(cleared.storage_quota_bytes, PatchField::Set(None)));
    }

    #[tokio::test]
    async fn revoke_routes_reject_foreign_ids_without_audit() {
        let app = test_app().await;
        let owner = insert_user(&app.state, "owner").await;
        let other = insert_user(&app.state, "other").await;
        let headers = auth_headers(&app.state, &owner.id).await;
        let other_session = insert_session(&app.state, &other.id).await;
        let other_token = insert_device_token(&app.state, &other.id).await;

        let session_status = error_status(
            revoke_session(
                State(app.state.clone()),
                Extension(ClientIp("203.0.113.10".to_string())),
                headers.clone(),
                Path(other_session.id.clone()),
            )
            .await,
        );
        let token_status = error_status(
            revoke_device_token(
                State(app.state.clone()),
                Extension(ClientIp("203.0.113.10".to_string())),
                headers,
                Path(other_token.id.clone()),
            )
            .await,
        );

        assert_eq!(session_status, StatusCode::NOT_FOUND);
        assert_eq!(token_status, StatusCode::NOT_FOUND);
        assert!(app
            .state
            .repositories
            .sessions
            .get(&other_session.id)
            .await
            .expect("session lookup")
            .expect("session")
            .revoked_at
            .is_none());
        assert!(app
            .state
            .repositories
            .device_tokens
            .get(&other_token.id)
            .await
            .expect("token lookup")
            .expect("token")
            .revoked_at
            .is_none());
        assert!(app
            .state
            .repositories
            .audit_log
            .list_recent(10)
            .await
            .expect("audit log")
            .is_empty());
    }

    #[tokio::test]
    async fn revoke_routes_reject_already_revoked_ids_without_audit() {
        let app = test_app().await;
        let owner = insert_user(&app.state, "owner").await;
        let headers = auth_headers(&app.state, &owner.id).await;
        let session = insert_session(&app.state, &owner.id).await;
        let token = insert_device_token(&app.state, &owner.id).await;
        app.state
            .repositories
            .sessions
            .revoke(&session.id)
            .await
            .expect("revoke session");
        app.state
            .repositories
            .device_tokens
            .revoke(&token.id)
            .await
            .expect("revoke token");

        let session_status = error_status(
            revoke_session(
                State(app.state.clone()),
                Extension(ClientIp("203.0.113.10".to_string())),
                headers.clone(),
                Path(session.id),
            )
            .await,
        );
        let token_status = error_status(
            revoke_device_token(
                State(app.state.clone()),
                Extension(ClientIp("203.0.113.10".to_string())),
                headers,
                Path(token.id),
            )
            .await,
        );

        assert_eq!(session_status, StatusCode::NOT_FOUND);
        assert_eq!(token_status, StatusCode::NOT_FOUND);
        assert!(app
            .state
            .repositories
            .audit_log
            .list_recent(10)
            .await
            .expect("audit log")
            .is_empty());
    }

    #[tokio::test]
    async fn owner_user_is_returned_with_owner_role() {
        let app = test_app().await;
        let owner = insert_user_with_role(&app.state, "owner", "admin").await;
        app.state
            .repositories
            .settings
            .set_owner_user_id(&owner.id)
            .await
            .expect("set owner");

        let response = user_response_for_state(&app.state, owner)
            .await
            .expect("user response");

        assert_eq!(response.role, "owner");
    }

    #[tokio::test]
    async fn only_owner_can_disable_admin_accounts() {
        let app = test_app().await;
        let owner = insert_user_with_role(&app.state, "owner", "admin").await;
        let admin_actor = insert_user_with_role(&app.state, "admin-actor", "admin").await;
        let admin_target = insert_user_with_role(&app.state, "admin-target", "admin").await;
        let settings = app
            .state
            .repositories
            .settings
            .set_owner_user_id(&owner.id)
            .await
            .expect("set owner");
        let request = UpdateUserRequest {
            display_name: None,
            role: None,
            is_disabled: Some(true),
            storage_quota_bytes: PatchField::Unset,
            reauth_password: None,
        };

        assert_eq!(
            error_status(enforce_user_update_policy(
                &admin_actor,
                &admin_target,
                &request,
                &settings,
                false,
            )),
            StatusCode::FORBIDDEN
        );
        let mut disabled_admin_target = admin_target.clone();
        disabled_admin_target.is_disabled = true;
        let reenable_request = UpdateUserRequest {
            display_name: None,
            role: None,
            is_disabled: Some(false),
            storage_quota_bytes: PatchField::Unset,
            reauth_password: None,
        };
        assert_eq!(
            error_status(enforce_user_update_policy(
                &admin_actor,
                &disabled_admin_target,
                &reenable_request,
                &settings,
                false,
            )),
            StatusCode::FORBIDDEN
        );
        assert_eq!(
            error_status(enforce_user_disable_policy(
                &admin_actor,
                &admin_target,
                &settings,
            )),
            StatusCode::FORBIDDEN
        );
        enforce_user_update_policy(&owner, &admin_target, &request, &settings, true)
            .expect("owner can update admin");
        enforce_user_disable_policy(&owner, &admin_target, &settings)
            .expect("owner can disable admin");
    }

    #[tokio::test]
    async fn ensure_first_admin_recovers_disabled_configured_owner() {
        let app = test_app().await;
        let disabled_owner = insert_user_with_role(&app.state, "disabled-owner", "admin").await;
        let active_admin = insert_user_with_role(&app.state, "active-admin", "admin").await;
        app.state
            .repositories
            .users
            .set_disabled(&disabled_owner.id, true)
            .await
            .expect("disable owner");
        app.state
            .repositories
            .settings
            .set_owner_user_id(&disabled_owner.id)
            .await
            .expect("set disabled owner");

        ensure_first_admin(&app.state.config, &app.state.repositories)
            .await
            .expect("recover owner");

        let settings = app
            .state
            .repositories
            .settings
            .get()
            .await
            .expect("settings");
        assert_eq!(
            settings.owner_user_id.as_deref(),
            Some(active_admin.id.as_str())
        );
    }

    #[tokio::test]
    async fn update_me_profile_preserves_omitted_fields() {
        let app = test_app().await;
        let user = insert_user(&app.state, "profile").await;
        app.state
            .repositories
            .users
            .update_self_profile(&user.id, Some("Original"), Some("Keep this bio"))
            .await
            .expect("seed profile");
        let headers = auth_headers(&app.state, &user.id).await;

        let _ = update_me_profile(
            State(app.state.clone()),
            Extension(ClientIp("203.0.113.10".to_string())),
            headers,
            Json(UpdateMeProfileRequest {
                display_name: PatchField::Set(Some("Updated".to_string())),
                bio: PatchField::Unset,
            }),
        )
        .await
        .expect("update profile");

        let updated = app
            .state
            .repositories
            .users
            .get(&user.id)
            .await
            .expect("load user")
            .expect("user");
        assert_eq!(updated.display_name.as_deref(), Some("Updated"));
        assert_eq!(updated.bio.as_deref(), Some("Keep this bio"));
    }

    async fn test_app() -> TestApp {
        let temp_dir = tempfile::tempdir().expect("temp dir");
        let database_url = format!("sqlite://{}", temp_dir.path().join("clipline.db").display());
        let config = Arc::new(crate::config::Config::for_tests(
            database_url.clone(),
            temp_dir.path().join("data"),
        ));
        let database = Database::connect_and_migrate(&database_url)
            .await
            .expect("database");
        let repositories = Repositories::new(database.clone());
        let storage: SharedStorageBackend =
            Arc::new(LocalStorage::new(temp_dir.path().join("data")));
        let auth = AuthRuntime::new(config.session_secret.as_deref());
        let state = AppState {
            config,
            database,
            repositories,
            storage,
            auth,
        };
        TestApp {
            state,
            _temp_dir: temp_dir,
        }
    }

    async fn insert_user(state: &AppState, username: &str) -> User {
        insert_user_with_role(state, username, "user").await
    }

    async fn insert_user_with_role(state: &AppState, username: &str, role: &str) -> User {
        state
            .repositories
            .users
            .create(&NewUser::new(
                format!("{username}-{}", new_ulid()),
                "argon2id-hash",
                role,
            ))
            .await
            .expect("user")
    }

    async fn auth_headers(state: &AppState, user_id: &str) -> HeaderMap {
        let raw_token = format!("test-token-{}", new_ulid());
        let token_hash = hash_token(&raw_token);
        state
            .repositories
            .device_tokens
            .create(&NewDeviceToken::new(user_id, "test token", token_hash))
            .await
            .expect("device token");

        let mut headers = HeaderMap::new();
        headers.insert(
            header::AUTHORIZATION,
            HeaderValue::from_str(&format!("Bearer {raw_token}")).expect("authorization header"),
        );
        headers
    }

    async fn insert_session(state: &AppState, user_id: &str) -> Session {
        let token_hash = hash_token(&format!("session-token-{}", new_ulid()));
        state
            .repositories
            .sessions
            .create(&NewSession::new(
                user_id,
                token_hash,
                now_utc() + ChronoDuration::hours(1),
            ))
            .await
            .expect("session")
    }

    async fn insert_device_token(state: &AppState, user_id: &str) -> DeviceToken {
        let token_hash = hash_token(&format!("device-token-{}", new_ulid()));
        state
            .repositories
            .device_tokens
            .create(&NewDeviceToken::new(user_id, "target token", token_hash))
            .await
            .expect("device token")
    }

    fn error_status<T>(result: Result<T, ApiError>) -> StatusCode {
        match result {
            Ok(_) => panic!("expected handler error"),
            Err(error) => error.into_response().status(),
        }
    }
}
