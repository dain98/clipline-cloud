# 11 — Deployment, Operations & Hardening

**Phase:** Phase 1 (v1) — closes the v1 completeness target
**Status:** ◐ In progress
**Depends on:** docs 01–10 (a working server + frontend + desktop flow to deploy and harden)
**Design sections:** §20 (limits), §21 (security), §24 (deployment), §25 (backup), §27 (failure modes), §28 (observability)

> Goal: make the whole thing **shippable and operable** — the Compose profiles, secure-headers and
> remaining security hardening, quota/limit defaults, backup/restore docs, health/observability, and
> clean handling of every failure mode. When this doc is `☑ Complete`, docs 01–11 together meet the
> Phase-1 / v1 bar.

---

## Goal

The five Compose profiles, production hardening (secure headers, proxy-hop `X-Forwarded-For` trust,
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

After first login, rotate the bootstrap admin password through the app. For production, pin
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

The Caddy profile pins Caddy to `172.30.0.2` and sets
`CLIPLINE_TRUSTED_PROXY_HOPS=172.30.0.2`. If the subnet or static IP is overridden, update both
values together or the server will ignore `X-Forwarded-For` and audit logs will show the proxy IP.

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

- [ ] All five Compose profiles authored in `deploy/compose/` and verified to start
- [x] Minimal profile runs **as copied** (generated admin password printed; non-HTTPS warning shown)
- [ ] Caddy profile terminates TLS with the real domain over HTTPS
- [x] `_FILE` secret variants honored across all profiles
- [x] Operator-tunable limits implemented with the documented defaults (5 GiB / 24h / 8 MiB / 64 MiB / mp4 / private)
- [x] Optional per-user storage quota + global storage-warning threshold wired (enforced at upload create)
- [x] Secure headers emitted (CSP, `nosniff`, Referrer-Policy, Permissions-Policy, HSTS on HTTPS) by app or documented for proxy
- [x] `X-Forwarded-For` trusted only from the known proxy hop; audit-log IPs use it correctly
- [x] Non-HTTPS `CLIPLINE_PUBLIC_URL` warning confirmed (doc 01) and documented as expected for LAN
- [x] Backup/restore docs written for SQLite, Postgres, and S3 (including no-live-file-copy caveat + back-up-before-upgrade)
- [x] Local→S3 migration documented as explicit/non-automatic
- [x] `/healthz` + `/readyz` finalized; admin diagnostics surface (storage usage, totals, dead jobs, recent admin actions)
- [ ] Every §27 failure mode handled with a clear, retryable state in API + web UI

## Definition of done

- [ ] Each Compose profile brings up a working instance; minimal one needs zero edits to smoke-test
- [ ] A production HTTPS deployment behind Caddy passes a secure-headers check and uses correct client IPs in the audit log
- [ ] Backups restore to a working instance (DB + media point-in-time consistent) following the docs
- [ ] `/readyz` flips to not-ready when DB or storage is down; admin diagnostics reflect real state
- [ ] Pulling each failure mode (storage down, disk full, bad S3 creds, killed mid-upload/mid-processing) yields a clear, recoverable state — no stranded clips, no data loss
- [ ] **v1 gate:** the full loop (Compose → first-run admin → user creation → desktop upload → library → share) works on **both** local disk and S3

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
  reported `/readyz` OK, generated a first-run admin password, accepted admin login/device-token
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
  postgres' deploy/compose/smoke.sh`. Fixed generated local secret permissions so the non-root app
  user can read persisted secrets, verified the default profile backup/restore path, and verified
  MinIO/Postgres storage/database dependency failures flip `/readyz` to not-ready. Real-domain Caddy
  TLS and external-S3 production-bucket checks remain operator-resource gates.
