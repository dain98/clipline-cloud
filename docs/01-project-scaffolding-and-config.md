# 01 — Project Scaffolding & Configuration

**Phase:** Phase 1 (v1)
**Status:** ☑ Complete
**Depends on:** doc 00 (read first)
**Design sections:** §6, §23, §28 (health), §21 (startup warning)

> Goal: stand up the Cargo workspace, the server binary, configuration loading with **startup
> validation**, structured logging, and health endpoints — the skeleton every later milestone plugs
> into. Nothing in here serves real clips yet; the bar is "it boots, validates its config, fails
> loudly on bad config, and answers `/healthz`."

---

## Goal

A runnable `clipline-cloud-server` binary that: parses and validates configuration on startup,
fails loudly on invalid storage/DB settings, emits structured JSON logs, serves `/healthz` and a
stub `/readyz`, and serves frontend static assets (empty placeholder is fine for now). This is the
foundation for the crate layout in §29 (doc 00).

## Design context

### Technology stack (§6)

- **Rust + Axum**, **Tokio** async I/O.
- **SQLx** for DB (wired in doc 02), **Argon2id** (doc 04), opaque tokens (doc 04).
- The image bundles **`ffmpeg`/`ffprobe`** (used in Phase 2) — a deliberate, stated dependency, so
  the container is not a tiny static binary. Set the build/Dockerfile up to include them.

### Crate layout to create (§29)

```
clipline/
  crates/
    clipline-cloud-api-types/   # shared request/response types (desktop + server)
    clipline-cloud-api/         # Axum handlers, auth, permissions
    clipline-cloud-core/        # domain logic, clip lifecycle, job runner
    clipline-cloud-storage/     # StorageBackend trait + local/s3 adapters
    clipline-cloud-db/          # SQLx, migrations, repositories
  apps/
    clipline-cloud-server/      # binary: serves API + static frontend
    clipline-cloud-web/         # frontend (doc 09)
  deploy/compose/               # Compose profiles (doc 11)
  docs/cloud/                   # deployment, configuration, api, backup-restore
```

Create the workspace and empty crates now; later docs fill them in. Keep `clipline-cloud-api-types`
as the shared contract crate — every request/response type the desktop app and frontend rely on
goes here so it is type-checked on both ends.

### Configuration surface (§23)

```
CLIPLINE_PUBLIC_URL                 # required for share links; warns if not HTTPS
CLIPLINE_BIND_ADDR
CLIPLINE_PROCESS_ROLE               # all (default) | web | worker
CLIPLINE_DATABASE_URL[_FILE]        # sqlite:///data/clipline.db (default) | postgres://...

CLIPLINE_BOOTSTRAP_ADMIN_USERNAME
CLIPLINE_BOOTSTRAP_ADMIN_PASSWORD
CLIPLINE_BOOTSTRAP_ADMIN_PASSWORD_FILE
CLIPLINE_STEAMGRIDDB_API_KEY[_FILE] # optional; admin game search and category artwork

CLIPLINE_STORAGE_BACKEND            # local | s3
CLIPLINE_DATA_DIR                   # required for local

CLIPLINE_S3_ENDPOINT
CLIPLINE_S3_BUCKET
CLIPLINE_S3_REGION
CLIPLINE_S3_ACCESS_KEY_ID[_FILE]
CLIPLINE_S3_SECRET_ACCESS_KEY[_FILE]
CLIPLINE_S3_FORCE_PATH_STYLE
CLIPLINE_S3_PREFIX

CLIPLINE_MAX_UPLOAD_SIZE_BYTES
CLIPLINE_UPLOAD_PART_SIZE_BYTES     # must be >= 5 MiB for S3
CLIPLINE_SINGLE_PUT_MAX_BYTES       # default 64 MiB
CLIPLINE_UPLOAD_SESSION_TTL_SECONDS
CLIPLINE_DIRECT_S3_UPLOADS          # optional Phase-4 direct upload; false by default, s3 only
CLIPLINE_VIDEO_OPTIMIZATION         # off (default) | on; optional lossy source optimization
CLIPLINE_VIDEO_OPTIMIZATION_CRF     # default 26; valid 18..35
CLIPLINE_VIDEO_OPTIMIZATION_PRESET  # default veryfast; x264 preset
CLIPLINE_VIDEO_OPTIMIZATION_MAX_WIDTH # optional; 0/unset disables resize
CLIPLINE_VIDEO_OPTIMIZATION_MIN_SAVINGS_PERCENT # default 5
CLIPLINE_VIDEO_OPTIMIZATION_KEEP_ORIGINAL # false; stores original-source.mp4 for active clips
CLIPLINE_MAX_ACTIVE_UPLOAD_SESSIONS_PER_USER
CLIPLINE_USER_STORAGE_QUOTA_BYTES   # optional; 0/unset disables
CLIPLINE_GLOBAL_STORAGE_WARNING_THRESHOLD_BYTES # optional; 0/unset disables
CLIPLINE_PUBLIC_MEDIA_MODE          # presigned (default) | proxy
CLIPLINE_PUBLIC_READ_URL_TTL_SECONDS # default 300
CLIPLINE_TRUSTED_PROXY_HOPS         # comma-separated proxy IPs allowed to set X-Forwarded-For

CLIPLINE_SESSION_SECRET[_FILE]      # HMAC for CSRF tokens (NOT session validation)
CLIPLINE_LOG_LEVEL
```

**Validation rules (fail loudly at startup):**

- `CLIPLINE_PUBLIC_URL` is required (needed for share links).
- `CLIPLINE_PROCESS_ROLE` must be `all`, `web`, or `worker`; `all` preserves the default combined
  HTTP + job-runner process.
- `local` backend requires `CLIPLINE_DATA_DIR`.
- `s3` backend requires `CLIPLINE_S3_ENDPOINT`, `CLIPLINE_S3_BUCKET`, access key, secret key.
- `CLIPLINE_DIRECT_S3_UPLOADS=true` requires `CLIPLINE_STORAGE_BACKEND=s3`.
- `CLIPLINE_VIDEO_OPTIMIZATION` must be `off` or `on`; CRF must be 18..35; preset must be a valid
  x264 preset; max width is optional; min savings must be 0..100.
- `CLIPLINE_PUBLIC_MEDIA_MODE` must be `presigned` or `proxy`; public read URL TTL must be positive.
- `_FILE` variants (Docker secrets) are supported for every secret and **preferred** over inline
  values — read the file contents at startup.
- If `CLIPLINE_PUBLIC_URL` is not HTTPS, **emit a clear startup warning** (§21). The app still works
  over HTTP for LAN testing, but it must warn.

### Health endpoints (§28)

- `GET /healthz` — process is alive (no dependency checks).
- `GET /readyz` — DB + storage reachable. In this doc, stub it (return ok / not-implemented for the
  dependency checks); doc 02 wires the DB probe and doc 03 wires the storage probe.

### Logging (§28)

Structured JSON logs, e.g.:

```json
{"level":"info","event":"clip.upload.completed","user_id":"01JZ...","clip_id":"01JZ...","size_bytes":83214521,"duration_ms":45000}
```

Set up a `tracing`-based JSON subscriber honoring `CLIPLINE_LOG_LEVEL` now, so every later milestone
logs consistently.

## Implementation checklist

- [x] Create the Cargo workspace with the five `crates/` and two `apps/` members from §29
- [x] `clipline-cloud-api-types` crate created (empty/shared types stub)
- [x] `clipline-cloud-server` binary boots Axum + Tokio and listens on `CLIPLINE_BIND_ADDR`
- [x] Config struct loads every `CLIPLINE_*` var, including `_FILE` secret variants
- [x] Startup validation: required vars present per backend; invalid storage/DB config aborts boot with a clear error
- [x] Non-HTTPS `CLIPLINE_PUBLIC_URL` emits the §21 warning (does not abort)
- [x] Sensible defaults applied (`CLIPLINE_DATABASE_URL` → `sqlite:///data/clipline.db`, single-PUT max 64 MiB, part size 8 MiB, session TTL 24h — see doc 11 §20 for the full default table)
- [x] Structured JSON logging via `tracing`, level from `CLIPLINE_LOG_LEVEL`
- [x] `GET /healthz` returns 200 when the process is alive
- [x] `GET /readyz` scaffolded (DB/storage probes stubbed for docs 02/03 to fill in)
- [x] Static-asset serving wired (serves `clipline-cloud-web` build output; placeholder index is fine)
- [x] Dockerfile builds the server image **with `ffmpeg`/`ffprobe` present**

## Definition of done

- [x] `cargo build` / `cargo test` green across the workspace
- [x] Starting the binary with a valid minimal env (public URL + sqlite + local data dir) boots and serves `/healthz`
- [x] Starting with a missing required var (e.g. `s3` backend without a bucket) aborts with a clear, actionable error message
- [x] Starting with a non-HTTPS public URL boots **and** logs the warning
- [x] Logs are structured JSON and respect the configured level

## Progress log

- 2026-06-16 — Created the Cargo workspace, scaffold crates/apps, Axum server, configuration
  validation, JSON tracing, `/healthz`, stub `/readyz`, static placeholder frontend, and Dockerfile.
  Verified `cargo fmt --all --check`, `cargo build --workspace`, `cargo test --workspace`, local
  endpoint smoke checks, invalid S3 config failure, Docker image build, and `ffmpeg`/`ffprobe`
  availability in the image.
