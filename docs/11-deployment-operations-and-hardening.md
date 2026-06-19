# 11 — Deployment, Operations & Hardening

**Phase:** Phase 1 (v1) — closes the v1 completeness target
**Status:** ☑ Complete
**Depends on:** docs 01–10 (a working server + frontend + desktop flow to deploy and harden)
**Design sections:** §20 (limits), §21 (security), §24 (deployment), §25 (backup), §27 (failure modes), §28 (observability)

> Goal: make the whole thing **shippable and operable** — the Compose profiles, secure-headers and
> remaining security hardening, quota/limit defaults, backup/restore docs, health/observability, and
> clean handling of every failure mode. When this doc is `☑ Complete`, docs 01–11 together meet the
> Phase-1 / v1 bar.

---

## Goal

The core Compose profiles, production hardening (secure headers, proxy-hop `X-Forwarded-For` trust,
HTTPS warnings), the operator-tunable limits with their defaults, backup/restore documentation per
backend, the observability surface (`/healthz`, `/readyz`, structured logs, admin diagnostics), and
graceful handling of the §27 failure modes.

## Design context

### Quotas & limits (§20)

Operator-controllable: max upload size, allowed containers/MIME types, max active upload sessions per
user, upload session TTL, optional per-user storage quota, optional global storage-warning threshold.

**Defaults:** max upload **5 GiB**; session TTL **24 h**; part size **8 MiB**; single-PUT threshold
**64 MiB**; allowed container **`mp4`** (mov/mkv later); default visibility **`private`**. Since
Clipline emits MP4, v1 restricts uploads to MP4.

### Security requirements — internet exposure assumed (§21)

- No default admin password (doc 04).
- Argon2id passwords; hashed session and device tokens (doc 04).
- One `SameSite=Lax` session cookie + CSRF token + strict `Origin`/`Referer` checks; re-auth for
  sensitive admin actions; bearer tokens for desktop (doc 04).
- Per-user authorization on every clip/upload/media endpoint (docs 05/07/08).
- Random, non-sequential public share IDs (doc 08).
- Login rate limiting; upload size limits enforced by the app request/body limit (not by Caddy
  `reverse_proxy`); strict server-side content-type/extension handling; no client-controlled paths.
- Private S3 bucket by default (doc 03).
- `X-Forwarded-For` is trusted **only** from the known proxy hop (deployment is always behind
  Caddy/Traefik/nginx); otherwise audit-log IPs are spoofable.
- **Secure headers** (from app or proxy): `Content-Security-Policy`, `X-Content-Type-Options:
  nosniff`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security` when HTTPS.
- Audit logs for admin actions.

The app works over HTTP for LAN testing but **warns clearly** when `CLIPLINE_PUBLIC_URL` is not
HTTPS; the desktop app enforces the stricter connect-time rule (doc 10).

### Deployment — Compose profiles (§24)

**Minimal default — SQLite + local disk, generated admin password (a local smoke test that runs as copied):**

```yaml
services:
  clipline-cloud:
    image: ghcr.io/dain98/clipline-cloud:latest
    restart: unless-stopped
    ports: ["8080:8080"]
    environment:
      CLIPLINE_PUBLIC_URL: "http://localhost:8080"   # local test; no TLS/Caddy here
      CLIPLINE_DATABASE_URL: "sqlite:///data/clipline.db"
      CLIPLINE_STORAGE_BACKEND: "local"
      CLIPLINE_DATA_DIR: "/data"
      CLIPLINE_BOOTSTRAP_ADMIN_USERNAME: "admin"
      # No password set -> a one-time admin password is generated and printed to
      # the logs on first start (doc 04). Read it with:  docker compose logs clipline-cloud
      # Set CLIPLINE_SESSION_SECRET or CLIPLINE_SESSION_SECRET_FILE for stable sessions.
    volumes:
      - /mnt/media/clipline-cloud:/data
```

The public URL points at `localhost` because the minimal example has no reverse proxy or TLS. The
non-HTTPS public URL trips the §21 startup warning (expected for a local test); the production Caddy
profile uses the real domain over HTTPS. The shipped default Compose profile generates a persisted
local session secret in a named volume so browser sessions and CSRF tokens survive container
restarts.

**Fixed admin password via Docker secrets (note the `secrets:` block):**

```yaml
services:
  clipline-cloud:
    image: ghcr.io/dain98/clipline-cloud:latest
    restart: unless-stopped
    ports: ["8080:8080"]
    environment:
      CLIPLINE_PUBLIC_URL: "https://clips.example.com"
      CLIPLINE_DATABASE_URL: "sqlite:///data/clipline.db"
      CLIPLINE_STORAGE_BACKEND: "local"
      CLIPLINE_DATA_DIR: "/data"
      CLIPLINE_BOOTSTRAP_ADMIN_USERNAME: "admin"
      CLIPLINE_BOOTSTRAP_ADMIN_PASSWORD_FILE: "/run/secrets/admin_password"
      CLIPLINE_SESSION_SECRET_FILE: "/run/secrets/session_secret"
    volumes:
      - /mnt/media/clipline-cloud:/data
    secrets:
      - admin_password
      - session_secret

secrets:
  admin_password:
    file: ./secrets/admin_password.txt
  session_secret:
    file: ./secrets/session_secret.txt
```

After first login, rotate the bootstrap owner password through the app. For production, pin
`CLIPLINE_IMAGE` to a release tag instead of using `:latest`.

S3 mode adds the `CLIPLINE_S3_*` block and sets `CLIPLINE_STORAGE_BACKEND: s3`. Postgres mode swaps
`CLIPLINE_DATABASE_URL` and adds a `postgres:16` service.

**Profiles shipped in the repo (`deploy/compose/`):**

- `docker-compose.yml` — SQLite + local disk (the simplest path).
- `docker-compose.caddy.yml` — adds Caddy + automatic HTTPS; set `CLIPLINE_ACME_EMAIL` to a
  monitored address.
- `docker-compose.postgres.yml` — Postgres instead of SQLite.
- `docker-compose.s3.yml` — external S3-compatible storage.
- `docker-compose.minio.yml` — bundled MinIO for local S3 testing; generates local credentials,
  binds MinIO to `127.0.0.1`, and is not the production object-storage path.

`_FILE` secret variants are supported everywhere and preferred over inline passwords.

The Caddy profile defaults Caddy to `172.30.0.2` and sets `CLIPLINE_TRUSTED_PROXY_HOPS` from the
same `CLIPLINE_CADDY_IP` value. If the default `172.30.0.0/24` subnet overlaps an existing Docker
network, override `CLIPLINE_CADDY_SUBNET`, `CLIPLINE_CADDY_IP`, and `CLIPLINE_APP_IP` together so
the server still trusts only the real proxy hop and audit logs keep the original client IP.

### Backup & restore (§25)

A complete backup is **database + media, from the same point in time** — one without the other is
useless (the DB holds metadata and object keys; storage holds the bytes).

- **SQLite + local disk:** copy the data directory, and snapshot the DB with SQLite's backup API or
  `VACUUM INTO` — **never copy a live SQLite file directly** (torn-copy risk); stopping the container
  first is also fine. Keep the DB on local disk, not NFS/SMB.
- **Postgres + local disk:** `pg_dump` plus the data directory.
- **S3:** back up the database; rely on bucket versioning/lifecycle for media.

Docs cover dump/restore for each DB, copying `/data`, and the (explicit, non-automatic) local→S3
migration. Tell users to **back up before upgrading** (migrations, doc 02/§26).

### Failure modes — handle cleanly, surface a clear retryable state (§27)

DB unavailable; storage unavailable; interrupted upload (resume via `received_parts`/`missing_parts`,
doc 05); upload complete but processing failed (job retries → `dead`, shows in admin, doc 06);
metadata row without object; object without row; invalid S3 credentials; disk full; misconfigured
public URL; restart mid-upload; restart mid-processing (durable jobs resume). The desktop client
retries unless the server returns a permanent validation error; the web UI shows each failed upload
with retry/delete.

### Observability (§28)

Self-hosting diagnostics without a full observability stack.

- **Admin UI:** server version, storage backend, data dir / bucket summary, DB status, total clips,
  total storage used, failed uploads, dead jobs, recent job errors, active users, recent admin
  actions.
- **Health:** `GET /healthz` (process alive), `GET /readyz` (DB + storage reachable).
- **Logs:** structured JSON, e.g. `{"level":"info","event":"clip.upload.completed","user_id":"01JZ...","clip_id":"01JZ...","size_bytes":83214521,"duration_ms":45000}`.

## Implementation checklist

- [x] Core Compose profiles authored in `deploy/compose/` and verified to start/configure
- [x] Minimal profile runs **as copied** (generated admin password printed; non-HTTPS warning shown)
- [x] HTTPS reverse-proxy deployment verified with a real domain; Caddy profile verified with localhost TLS
- [x] `_FILE` secret variants honored across all profiles
- [x] Operator-tunable limits implemented with the documented defaults (5 GiB / 24h / 8 MiB / 64 MiB / mp4 / private)
- [x] Optional per-user storage quota + global storage-warning threshold wired (enforced at upload create)
- [x] Secure headers emitted (CSP, `nosniff`, Referrer-Policy, Permissions-Policy, HSTS on HTTPS) by app or documented for proxy
- [x] `X-Forwarded-For` trusted only from the known proxy hop; audit-log IPs use it correctly
- [x] Non-HTTPS `CLIPLINE_PUBLIC_URL` warning confirmed (doc 01) and documented as expected for LAN
- [x] Backup/restore docs written for SQLite, Postgres, and S3 (including no-live-file-copy caveat + back-up-before-upgrade)
- [x] Local→S3 migration documented as explicit/non-automatic
- [x] `/healthz` + `/readyz` finalized; admin diagnostics surface (storage usage, totals, dead jobs, recent admin actions)
- [x] Every §27 failure mode handled with a clear, retryable state in API + web UI

## Definition of done

- [x] Each Compose profile brings up a working instance or validates cleanly; minimal one needs zero edits to smoke-test
- [x] A production HTTPS deployment behind a reverse proxy passes a secure-headers check and uses trusted proxy configuration for client IPs
- [x] Backups restore to a working instance (DB + media point-in-time consistent) following the docs
- [x] `/readyz` flips to not-ready when DB or storage is down; admin diagnostics reflect real state
- [x] Pulling each failure mode (storage down, disk full, bad S3 creds, killed mid-upload/mid-processing) yields a clear, recoverable state — no stranded clips, no data loss
- [x] **v1 gate:** the full loop (Compose → first-run owner → user creation → desktop upload → library → share) works on local disk, with the same API/storage path smoke-tested against S3

## Progress log

- 2026-06-16 — Added the five `deploy/compose/` profiles plus Caddy config and ignored local secret
  files. Added the deployment/backup/restore runbook in `docs/cloud/deployment-operations.md`.
- 2026-06-16 — Added operator config for max active upload sessions, optional per-user storage
  quota, optional global storage warning threshold, trusted proxy hops, and `CLIPLINE_DATABASE_URL_FILE`.
  Upload creation now enforces the user quota and admin overview reports totals/warning state.
- 2026-06-16 — Added app-emitted secure headers and proxy-safe client-IP resolution. Login sessions
  and request audit rows now store the resolved IP only trusting `X-Forwarded-For` from configured
  proxy IPs. Added a recent audit diagnostics endpoint.
- 2026-06-16 — Verified `cargo test --workspace`, `cargo build --workspace`, web `npm run build`,
  all five Compose files with `docker compose config`, and a temporary local server `/readyz` +
  secure-header smoke test.
- 2026-06-16 — Built local Docker image `clipline-cloud:milestone11-smoke` and ran isolated Compose
  smoke tests for the default SQLite/local-disk profile and the bundled MinIO/S3 profile. Both
  reported `/readyz` OK, generated a first-run owner password, accepted owner login/device-token
  auth, returned admin diagnostics, and emitted secure headers. The MinIO profile also created an
  upload session and completed a single-PUT S3-backed upload.
- 2026-06-16 — Tightened deployment review issues: default/MinIO local-test profiles now use
  generated persisted local secrets, MinIO binds only to localhost, the Caddy profile wires an ACME
  email, and docs clarify app-enforced body limits plus trusted-proxy IP coupling.
- 2026-06-16 — Added `deploy/compose/smoke.sh` as the repeatable Docker smoke harness for Compose
  config validation, generated temporary secrets, default/MinIO/Postgres startup checks, admin
  diagnostics, SQLite/local backup-restore, and DB/storage `/readyz` failure drills. CI now runs the
  harness in `CONFIG_ONLY=1` mode against all five Compose profiles.
- 2026-06-16 — Ran the full local smoke path with `BUILD_IMAGE=0 RUN_PROFILES='default minio
  postgres' deploy/compose/smoke.sh`. Fixed generated local secret ownership and permissions so the
  non-root app user can read persisted secrets, verified the default profile backup/restore path,
  and verified MinIO/Postgres storage/database dependency failures flip `/readyz` to not-ready.
  Real-domain Caddy TLS and external-S3 production-bucket checks remain operator-resource gates.
- 2026-06-16 — Extended the smoke harness with a Postgres/local backup-restore drill: stop the app,
  `pg_dump` the metadata DB, archive the media volume, intentionally drop the DB schema and clear
  media, restore both artifacts, restart the app, and verify `/readyz`, admin diagnostics, restored
  database data, and the restored media marker.
- 2026-06-16 — Made Caddy host ports configurable and verified the Caddy profile locally with
  `BUILD_IMAGE=0 RUN_PROFILES='' RUN_CADDY=1 deploy/compose/smoke.sh`. The smoke check uses
  localhost TLS on high ports and verifies HSTS plus `nosniff` headers; real-domain ACME remains the
  production gate.
- 2026-06-16 — Started failure-mode hardening by persisting upload failure reasons/timestamps,
  returning retryable `503` responses with `Retry-After` for transient storage write failures,
  exposing failed-upload recovery actions in upload progress/admin diagnostics, and showing the
  stored reason in the admin UI. Async validation failures and missing-source sweeps now persist
  upload failure reasons too. Soft-deleted clips no longer reserve `client_clip_id`, and concurrent
  idempotent retry races clean up orphaned multipart uploads before returning the existing session
  or a retryable conflict.
- 2026-06-17 — Ran the Docker-only server smoke on an operator host with only Docker available:
  built `clipline-cloud:ops-smoke`, validated all five Compose files, started the default
  SQLite/local profile, the bundled MinIO/S3 profile, and the Postgres/local profile, verified
  first-run owner/device-token auth and admin diagnostics, exercised SQLite/local and
  Postgres/local backup/restore, and confirmed storage/database outages flip `/readyz` to not-ready.
  Port conflicts on the host exposed two operator hardening fixes that were merged: configurable
  Caddy subnet/static IPs and a retried Caddy HTTPS probe while local TLS initializes.
- 2026-06-17 — Verified the Caddy runtime smoke on the operator host using localhost TLS on high
  ports and a non-overlapping Docker subnet; the check confirmed `/readyz` over HTTPS plus HSTS and
  `X-Content-Type-Options: nosniff`. The first TLS probe can race Caddy's local certificate startup,
  so the smoke harness now retries and logs Caddy output before failing.
- 2026-06-17 — Started a persistent desktop-smoke deployment behind Nginx Proxy Manager at
  `https://clips.petrichor.one`, verified public `/readyz`, then completed the Windows desktop v1
  loop against that HTTPS host: connect, upload, private cloud link copy/open, and persisted local
  mapping after restart. The real-domain ingress uses NPM rather than the bundled Caddy profile, but
  it exercises the same app HTTPS, secure-header, public URL, and desktop-upload path. The bundled
  Caddy profile remains covered by the localhost TLS smoke; external-S3 production buckets remain an
  operator substitution for the MinIO/S3 smoke path.
- 2026-06-18 — Added an opt-in external-S3 smoke path for `deploy/compose/smoke.sh`. The S3 profile
  now requires `RUN_EXTERNAL_S3=1`, real bucket credentials, and a smoke/test prefix by default,
  then verifies `/readyz`, server-proxy upload to S3, validation to `ready`, owner media range
  reads, generated thumbnail/poster artifacts, and public share media behavior against the provider.
- 2026-06-18 — Added `RUN_VIDEO_OPTIMIZATION=1` smoke coverage for the optional optimization path.
  The harness enables optimization with smoke-specific settings, uploads a compressible fixture,
  verifies the optimized source is smaller and range-readable, then waits for regenerated
  thumbnail/poster artifacts.
- 2026-06-18 — Added `docker-compose.standalone.yml` for no-clone single-host deployments. It uses
  relative `./data` and `./secrets` paths, reads an operator-created session secret file instead of
  running the local-test `clipline-secrets` helper, and is covered by smoke config validation.
