# 04 — Authentication, Users & First-Run Admin

**Phase:** Phase 1 (v1)
**Status:** ☑ Complete
**Depends on:** doc 02 (users/sessions/device_tokens/audit_log tables)
**Design sections:** §9, §10, §16 (auth + users endpoints), §21 (first-run, security), §8 (tokens)

> Goal: both auth flows (browser cookie session + desktop bearer device token), Argon2id passwords,
> hashed opaque tokens, first-run owner bootstrap with **no hardcoded password**, the discovery
> endpoint, and the admin user-management API. After this milestone the server has identity and
> access control — the gate every protected endpoint in later docs relies on.

---

## Goal

Working login for both clients, revocable hashed tokens, CSRF + origin defenses for the browser,
the device-token connect flow with its non-HTTPS guard, first-run owner creation, and the
owner/admin user-management endpoints with re-auth and audit logging.

## Design context

### Password & token security (§10)

"Encrypted user system" is hashing, not reversible encryption.

- **Passwords:** Argon2id, per-user salt. Never encrypted, never recoverable.
- **Session & device tokens:** generated server-side, returned **once**, stored as SHA-256 hashes. A
  DB leak does not yield usable tokens.
- **Reset tokens:** short-lived, random, stored hashed.
- **Secrets** (DB URL, S3 keys, session secret): via env or `_FILE` variants for Docker secrets.
- **TLS:** terminated by the reverse proxy (or the app directly for LAN testing).
- `CLIPLINE_SESSION_SECRET` HMACs CSRF tokens (and other signed-cookie needs) — **not** session
  validation, which is an opaque DB lookup. Rotating it invalidates outstanding CSRF tokens but
  leaves logged-in sessions intact.

### Token format (§8)

256-bit CSPRNG, base64url, human-readable prefix (`clp_ses_`, `clp_dev_`). Shown once; only the
SHA-256 hash persisted.

### Browser auth — cookie session (§9)

- Username/password login → opaque session token, stored hashed in `sessions`, set in a cookie.
- One `HttpOnly`, `SameSite=Lax` session cookie (no split SameSite policy). The cookie is marked
  `Secure` when `CLIPLINE_PUBLIC_URL` is HTTPS; HTTP mode is supported only for local/LAN testing.
- A **CSRF token** is required on every state-changing browser request, **plus** strict
  `Origin`/`Referer` validation as defense in depth.
- Sensitive admin actions (create/disable user, reset password) require **re-authentication**.
- Sessions revocable from the account page; revocation is immediate (validation is a DB lookup).

### Desktop auth — bearer device token (§9)

```
1. User enters host URL, username, password.
2. Client GETs  /.well-known/clipline-cloud   (verify it's a Clipline host + API version).
3. Client POSTs /api/v1/auth/device-token     (credentials + device name).
4. Backend validates credentials, creates a named device token, returns it ONCE.
5. Client stores the token; discards the password.
6. All future calls send  Authorization: Bearer clp_dev_...
```

**Transport safety.** Because credentials are sent once at connect time, the desktop app **refuses
non-HTTPS hosts by default.** Plain HTTP is permitted only for `localhost`, `127.0.0.1`, and RFC1918
LAN addresses, and only after an explicit "I understand this sends my password in plaintext on this
network" confirmation (the *client* enforces this — doc 10; the *server* must still support the
discovery + device-token endpoints). Device tokens carry `name`, `last_used_at`, optional
`expires_at`, and are revocable from the web UI.

### Discovery endpoint (§16) — called by the desktop app before login

```
GET /.well-known/clipline-cloud
```
```json
{
  "name": "Clipline Cloud",
  "api_version": "v1",
  "server_version": "1.2.13",
  "min_client_version": "0.1.0",
  "public_url": "https://clips.example.com",
  "features": {
    "single_put_upload": true,
    "chunked_upload": true,
    "public_sharing": true,
    "clip_markers": true,
    "max_upload_size_bytes": 5368709120
  }
}
```

The compatibility contract covers upload modes, max size, chunk size, auth, sharing — **not** the
storage backend. Whether the host uses local or S3 is invisible to the client by design; if needed
for diagnostics it belongs in an admin-only `server.storage_backend` field, not here.

### Auth API (§16)

```
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
GET    /api/v1/auth/me
POST   /api/v1/auth/reset-password
POST   /api/v1/auth/device-token
GET    /api/v1/auth/device-tokens
DELETE /api/v1/auth/device-tokens/{id}
```

### Users API (§16) — admin-only except self password change

```
GET    /api/v1/users
POST   /api/v1/users
GET    /api/v1/users/{id}
PATCH  /api/v1/users/{id}
DELETE /api/v1/users/{id}
POST   /api/v1/users/{id}/reset-password
POST   /api/v1/me/change-password
```

`POST /api/v1/users/{id}/reset-password` returns both the raw reset token and a browser-ready
`/reset-password?token=...` URL. The web UI shows the reset URL with a copy action so owners and
admins can create password setup links for users.

### First-run owner creation (§21)

On first start the backend initializes schema and ensures one owner exists. The owner is stored as
`app_settings.owner_user_id`; in the users table that account still carries the `admin` role for
backward-compatible admin permissions. Existing instances with admins but no owner promote the
earliest admin to owner during migration/startup. **No hardcoded password.** Username from
`CLIPLINE_BOOTSTRAP_ADMIN_USERNAME`; password from
`CLIPLINE_BOOTSTRAP_ADMIN_PASSWORD[_FILE]`; if none supplied, generate a one-time password and print
it once:

```
Clipline Cloud initialized.
Initial owner user created: admin
One-time password: <generated-password>
Save this password now. It will not be shown again.
```

After an owner exists, bootstrap credentials are ignored. Operators with database access through the
Docker image can run `clipline-cloud-server admin reset-password [username]` to reset the configured
owner or a named user, re-enable the account by default, and revoke existing sessions/device
tokens/reset links.

Owners and admins can use the admin API. Only the owner can create admin accounts, disable admin
accounts, modify the owner account, edit the public About text, or configure SMTP invite settings.
User creation can generate a copyable invite link without SMTP, or send an email invite containing a
one-time password setup link when SMTP is enabled.

### Security requirements that land here (§21)

- No default admin password (above).
- Argon2id passwords; hashed session and device tokens.
- One `SameSite=Lax` session cookie + CSRF token + strict `Origin`/`Referer` checks; re-auth for
  sensitive admin actions; bearer tokens for desktop.
- Login **rate limiting** (basic now; richer in Phase 2 / doc 12).
- Audit logs for admin actions, password resets, token revocation (write to `audit_log`).

## Implementation checklist

- [x] Argon2id password hashing + verification (per-user salt)
- [x] Opaque token generator (256-bit, base64url, `clp_ses_`/`clp_dev_` prefixes); store SHA-256 hash only, return raw once
- [x] `GET /.well-known/clipline-cloud` discovery endpoint (no storage backend leaked)
- [x] `POST /auth/login` → creates hashed session row, sets `HttpOnly; SameSite=Lax` cookie; updates `last_login_at`
- [x] Cookie `Secure` flag follows `CLIPLINE_PUBLIC_URL` scheme so supported HTTP deployments can log in
- [x] `POST /auth/logout`, `GET /auth/me`
- [x] CSRF token issuance + verification (HMAC via `CLIPLINE_SESSION_SECRET`) on all state-changing browser requests
- [x] Strict `Origin`/`Referer` validation as defense in depth
- [x] `POST /auth/device-token` (validate credentials, create named token, return once); `GET`/`DELETE` device-tokens with `last_used_at`
- [x] Auth middleware: cookie-session for browser, `Authorization: Bearer` for desktop; updates `last_used_at`; immediate revocation honored
- [x] First-run owner bootstrap: env password, `_FILE`, or generated-and-printed-once; ignored after an owner exists
- [x] Docker image operator password reset for owner/admin lockout recovery
- [x] Users API (admin-only) + `POST /me/change-password` (self)
- [x] Owner guardrails: only owner can create/disable admins, modify the owner account, and edit About text
- [x] Re-authentication required for sensitive admin actions (create/disable user, reset password)
- [x] Reset-password tokens: short-lived, random, stored hashed; redeeming one changes the password and revokes existing sessions/device tokens
- [x] Login rate limiting by username/source and source, with bounded in-memory buckets
- [x] Audit-log writes for admin actions, password resets, token revocation

## Definition of done

- [x] Browser login → authenticated session; logout/revocation takes effect immediately
- [x] Desktop connect flow issues a device token shown exactly once; bearer auth works on subsequent calls
- [x] DB inspection shows **no plaintext passwords and no plaintext tokens** — Argon2id hashes and SHA-256 hashes only
- [x] CSRF-less or wrong-`Origin` state-changing browser requests are rejected
- [x] First boot with no bootstrap password generates + prints a one-time password; second boot ignores bootstrap creds
- [x] Sensitive admin actions demand re-auth and produce audit-log entries

## Progress log

- 2026-06-16: Implemented auth runtime and routes in the server: discovery, browser sessions,
  logout/me, desktop device tokens, admin users, reset-password token issuance, self password
  change, CSRF/origin validation, login throttling, first-run owner bootstrap, and audit writes.
- 2026-06-16: Added reset-password token migrations and repository coverage for SQLite/Postgres,
  plus DB/server tests for hashing, token hashing, CSRF binding, migrations, and repository
  roundtrips.
- 2026-06-16: Verified with `cargo fmt --all --check`, `cargo test --workspace`,
  `cargo build --workspace`, and an HTTP smoke test covering generated bootstrap password,
  bootstrap ignore on second boot, browser session revocation, device-token revocation, CSRF/origin
  rejection, re-auth rejection, rate limiting, audit-log markers, and DB string inspection for no
  raw passwords or tokens.
