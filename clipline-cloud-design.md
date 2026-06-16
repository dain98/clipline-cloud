# Clipline Cloud — Backend Design

**Status:** proposed
**Target:** first self-hosted release (v1)
**Repo:** `dain98/clipline` (monorepo — see §29)

**One sentence:** Clipline Cloud is a self-hosted clip library and sharing server for Clipline — users keep control of the host, storage, accounts, and public links while still getting the upload-and-share workflow expected from a modern game clipper.

---

## 1. Summary

Clipline Cloud is a self-hosted web app + API server that lets the Clipline desktop client upload recorded clips to a host the user controls, and lets users and admins browse, manage, and share those clips from a web frontend. It is deployable with Docker Compose, points the desktop app at a host URL, and never depends on Clipline-operated infrastructure.

The same backend serves two clients:

- The **Clipline desktop app**, which authenticates and uploads clips.
- The **Clipline Cloud web frontend**, which manages clips, visibility, accounts, and storage.

Storage is pluggable: a mounted local data directory (the simplest default) or any S3-compatible provider (MinIO, Backblaze B2, Cloudflare R2, Wasabi, AWS S3). **Both local and S3 storage are in scope for v1** (§30) — local is the default Compose path, but S3 support is required before the backend is considered v1-complete.

## 2. Goals and Non-Goals

**v1 delivers a complete self-hosted clip-sharing loop:** deploy with Compose → first-run admin → admin creates users → desktop app connects with a host URL + credentials, receives a revocable device token, and uploads → clips appear in the owner's library → owner sorts/filters, sets private/public, and shares public clips via non-guessable URLs. Storage works identically whether backed by local disk or S3.

**Explicitly out of scope for v1:** public discovery feed; likes/comments/follows/subscriptions/recommendations; a central Clipline account system; federation; server-side transcoding to multiple resolutions; mobile apps; real-time chat; end-to-end encrypted media; multi-tenant commercial hosting; OAuth/OIDC login (Discord/Google/Steam). These are revisitable later; v1 focuses on reliable upload, private library management, and shareable links.

## 3. Design Principles

Clipline Cloud follows the desktop app's philosophy: local-first, privacy-aware, user-controlled, minimal.

- The backend never phones home to Clipline-owned services.
- The whole stack runs on a single machine with Docker Compose, with **no required second container** in the default (SQLite + local disk) configuration.
- Infrastructure is open and replaceable: a single embedded database by default, a storage abstraction, and static frontend assets served by the backend.
- The desktop app never persists the user's password. It exchanges credentials once for a revocable device token and stores that token in the platform credential store.
- The backend never stores plaintext passwords. Argon2id only.
- The storage layer is abstracted so local disk and S3 behave identically to the rest of the app.

## 4. Resolved Decisions (the opinionated part)

These are the choices that differ from a "leave it open" doc. Each is a deliberate v1 commitment.

1. **Database: SQLite is the only *required* v1 database; Postgres is supported once CI proves it.** The stated goal is "simple enough for a hobbyist," and a required Postgres container is exactly the friction that audience doesn't want; the workload (read-heavy, modest writes, single node) sits comfortably inside SQLite with WAL. SQLite + local disk is the default and the only database v1 must ship with. Postgres is a supported option selected via `CLIPLINE_DATABASE_URL`, promoted to "supported" only once CI proves *both* migration sets and repository tests pass on both backends — because dual-backend support is migration testing, SQL-dialect discipline, pagination/timestamp/transaction-semantics checks, and per-backend backup docs, not a connection-string swap.
2. **Tokens are opaque, never JWT.** Every requirement here — hashed-at-rest storage, revocation from the web UI, `last_used_at` — only works with opaque random tokens looked up by hash. JWTs are self-contained and unrevocable without a denylist. Both browser sessions and desktop device tokens are opaque random strings stored as SHA-256 hashes.
3. **Identifiers are ULIDs stored as `TEXT`.** Time-sortable IDs give far better index locality for the time-ordered library views than random UUIDv4, and `TEXT` ULIDs are trivially portable across SQLite and Postgres. Public share IDs are a *separate*, random, non-sortable token (§15).
4. **`client_clip_id` is an enforced idempotency key**, not advisory metadata (§7, §12).
5. **Chunked upload is the default path; single-PUT is the small-file exception.** 1080p60 game clips routinely exceed several hundred MiB; a non-resumable multi-GiB PUT that dies at 90% wastes everything. Single-PUT is used only below a configurable threshold (default 64 MiB).
6. **One upload protocol, wired directly to the storage abstraction's multipart methods** (§11–§12). The client's chunk boundaries *are* the S3 multipart part boundaries (1-based), so the backend never buffers a whole part to re-chunk it.
7. **Public media is served inline.** No download button by default; in S3 mode the page points at a short-lived presigned GET with `Content-Disposition: inline`. This is **not DRM** — viewers can still save the bytes — and the product says so plainly (§15). S3 support ships within v1 (§30), not as a post-v1 add-on.
8. **`private` means application-level access control, not cryptography.** The operator runs the infrastructure and can technically read files and rows. The product says so plainly (§22). E2E encryption is out of scope.
9. **No social features, no self-registration, manual upload only, public links stable-until-revoked.** (Resolved open questions, Appendix A.)

## 5. Architecture

Five components:

- **Clipline Desktop Client** — existing Tauri/Rust app; gains a Cloud settings page and upload flow.
- **Web Frontend** — login, library, clip detail, share pages, admin. Built as static assets, served by the backend.
- **API Backend** — auth, users, clip metadata, upload sessions, permissions, public links, storage coordination, lightweight processing.
- **Database** — SQLite by default, Postgres optional.
- **Storage** — local filesystem or S3-compatible, behind one abstraction.

A typical deployment:

```
clipline-desktop
      |
      |  HTTPS API
      v
reverse proxy (Caddy/Traefik/nginx)   <- TLS terminates here in prod
      |
      v
clipline-cloud-backend
      |-- sqlite file (default)  OR  postgres (optional)
      |-- local /data directory  OR  S3-compatible storage
      |-- in-process job runner (durable jobs table, §7/§13)
      `-- frontend static assets (served directly)
```

For v1 the backend serves the frontend's static files itself. A separate frontend container is allowed but the simpler single-process deployment is preferred.

## 6. Technology Stack

**Backend:** Rust with Axum, Tokio for async I/O, SQLx for database access (works against both SQLite and Postgres), Argon2id for password hashing, opaque tokens (§9). The backend image bundles `ffmpeg`/`ffprobe` for thumbnail/poster generation and metadata backfill — so it is **not** a tiny static binary; this is a deliberate, stated dependency.

**Frontend:** any of React / SvelteKit / Solid / plain Vite; Tailwind or similar; HTML5 `<video>` for playback. No proprietary cloud dependency.

**Storage:** local filesystem adapter + S3-compatible adapter behind one trait. Optional MinIO Compose profile for local S3 testing.

**Reverse proxy:** Caddy is the documented default (automatic HTTPS). The base Compose file exposes the app port directly; a Caddy example is provided for production.

## 7. Data Model

**Type mapping (portable schema).** The reference DDL below is shown in a Postgres-leaning dialect for readability. Backend mappings:

| Concept | SQLite | Postgres |
|---|---|---|
| Identifier | `TEXT` (26-char ULID) | `TEXT` (26-char ULID) |
| Timestamp | `TEXT` ISO-8601 UTC | `TIMESTAMPTZ` |
| JSON blob | `TEXT` (JSON) | `JSONB` |
| IP address | `TEXT` | `INET` |
| Boolean | `INTEGER 0/1` | `BOOLEAN` |

All IDs are ULIDs-as-text. All timestamps are UTC.

### SQLite operational requirements

When running on SQLite (the default):

- WAL mode enabled; `foreign_keys = ON`; a configured `busy_timeout`.
- Transactions kept short; **media bytes never pass through the database**.
- Single-writer only — no horizontal multi-writer deployment on SQLite.
- Avoid NFS/SMB-backed SQLite files (locking is unreliable); keep the DB on local disk.

### users
```sql
users (
  id            TEXT PRIMARY KEY,           -- ULID
  username      TEXT NOT NULL UNIQUE,
  display_name  TEXT,
  password_hash TEXT NOT NULL,              -- Argon2id
  role          TEXT NOT NULL CHECK (role IN ('admin','user')),
  is_disabled   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL,
  updated_at    TIMESTAMPTZ NOT NULL,
  last_login_at TIMESTAMPTZ
)
```

### sessions  (browser, opaque token)
```sql
sessions (
  id           TEXT PRIMARY KEY,            -- ULID
  user_id      TEXT NOT NULL REFERENCES users(id),
  token_hash   TEXT NOT NULL UNIQUE,        -- SHA-256 of opaque token
  user_agent   TEXT,
  ip_address   TEXT,
  created_at   TIMESTAMPTZ NOT NULL,
  last_used_at TIMESTAMPTZ,
  expires_at   TIMESTAMPTZ NOT NULL,
  revoked_at   TIMESTAMPTZ
)
```

### device_tokens  (desktop, opaque bearer)
```sql
device_tokens (
  id           TEXT PRIMARY KEY,            -- ULID
  user_id      TEXT NOT NULL REFERENCES users(id),
  name         TEXT NOT NULL,               -- "Dain's Desktop"
  token_hash   TEXT NOT NULL UNIQUE,        -- SHA-256 of opaque token
  created_at   TIMESTAMPTZ NOT NULL,
  last_used_at TIMESTAMPTZ,
  expires_at   TIMESTAMPTZ,                 -- nullable = no expiry
  revoked_at   TIMESTAMPTZ
)
```

### clips
```sql
clips (
  id              TEXT PRIMARY KEY,         -- ULID
  owner_user_id   TEXT NOT NULL REFERENCES users(id),
  client_clip_id  TEXT,                     -- idempotency key, see UNIQUE below
  title           TEXT NOT NULL,
  game_name       TEXT,
  game_id         TEXT,
  game_executable TEXT,
  source_type     TEXT,                     -- replay_buffer|manual|session_trim|league_marker|...
  recorded_at     TIMESTAMPTZ,              -- client-reported
  uploaded_at     TIMESTAMPTZ,              -- SERVER-authoritative (set at finalize)
  duration_ms     INTEGER,
  file_size_bytes BIGINT,
  width           INTEGER,
  height          INTEGER,
  fps             NUMERIC,
  container       TEXT,
  video_codec     TEXT,
  audio_codec     TEXT,
  checksum_sha256 TEXT,                     -- whole-file, client-declared (see §12)
  visibility      TEXT NOT NULL CHECK (visibility IN ('private','public','unlisted')),
  status          TEXT NOT NULL CHECK (status IN ('created','uploading','processing','ready','failed','deleted')),
  storage_backend TEXT NOT NULL,            -- 'local' | 's3'
  storage_key     TEXT,
  poster_key      TEXT,
  thumbnail_key   TEXT,
  public_share_id TEXT UNIQUE,
  created_at      TIMESTAMPTZ NOT NULL,
  updated_at      TIMESTAMPTZ NOT NULL,
  deleted_at      TIMESTAMPTZ
)

-- Idempotency: a repeated client_clip_id from the same owner returns the
-- existing clip instead of creating a duplicate (§12).
CREATE UNIQUE INDEX clips_owner_client_clip_id_ux
  ON clips(owner_user_id, client_clip_id)
  WHERE client_clip_id IS NOT NULL;   -- NULLs allowed/distinct on both backends
```

`visibility` keeps `unlisted` in the enum from day one even though v1 has no discovery feed (so `public` and `unlisted` behave identically for now); storing it as an enum lets the model evolve without a migration.

### clip_markers
```sql
clip_markers (
  id            TEXT PRIMARY KEY,           -- ULID
  clip_id       TEXT NOT NULL REFERENCES clips(id) ON DELETE CASCADE,
  kind          TEXT NOT NULL,              -- kill|death|assist|objective|...
  label         TEXT,
  timestamp_ms  INTEGER NOT NULL,
  metadata_json JSONB,
  created_at    TIMESTAMPTZ NOT NULL
)
```

### upload_sessions
```sql
upload_sessions (
  id                  TEXT PRIMARY KEY,     -- ULID
  clip_id             TEXT NOT NULL REFERENCES clips(id),
  user_id             TEXT NOT NULL REFERENCES users(id),
  status              TEXT NOT NULL CHECK (status IN ('created','uploading','completed','aborted','failed')),
  expected_size_bytes BIGINT NOT NULL,
  received_size_bytes BIGINT NOT NULL DEFAULT 0,
  part_size_bytes     INTEGER,              -- pinned per-session at create time
  storage_key         TEXT NOT NULL,
  storage_upload_id   TEXT,                 -- S3 multipart UploadId; NULL for local
  checksum_sha256     TEXT,                 -- expected whole-file hash (see §12)
  created_at          TIMESTAMPTZ NOT NULL,
  updated_at          TIMESTAMPTZ NOT NULL,
  completed_at        TIMESTAMPTZ,
  expires_at          TIMESTAMPTZ NOT NULL
)
```

### upload_parts
```sql
upload_parts (
  upload_session_id TEXT NOT NULL REFERENCES upload_sessions(id) ON DELETE CASCADE,
  part_number       INTEGER NOT NULL,        -- 1-based (see §12)
  size_bytes        BIGINT NOT NULL,
  checksum_sha256   TEXT,
  etag              TEXT,                    -- S3 part ETag, needed for CompleteMultipartUpload
  received_at       TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (upload_session_id, part_number)
)
```

### jobs  (durable, in-process runner)
```sql
jobs (
  id           TEXT PRIMARY KEY,            -- ULID
  kind         TEXT NOT NULL,               -- validate_object|thumbnail|poster|probe_metadata|cleanup_session|cleanup_clip
  status       TEXT NOT NULL CHECK (status IN ('pending','running','succeeded','failed','dead')),
  target_type  TEXT,                        -- NULL for global sweeps (e.g. expired-session cleanup)
  target_id    TEXT,                        -- NULL for global sweeps
  attempts     INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 5,
  next_run_at  TIMESTAMPTZ NOT NULL,
  locked_by    TEXT,                        -- runner instance id holding the job
  locked_at    TIMESTAMPTZ,                 -- when the lock was taken
  last_error   TEXT,
  created_at   TIMESTAMPTZ NOT NULL,
  updated_at   TIMESTAMPTZ NOT NULL
)
```

The job runner is in-process for v1, but **state is persisted** so a restart mid-processing doesn't strand a clip in `processing` or orphan temp files: jobs are picked up by `next_run_at`, retried with backoff up to `max_attempts`, then marked `dead` for admin visibility. `target_type`/`target_id` are nullable so periodic sweeps (expired-session and orphaned-part cleanup) share the same table.

**Claiming and stale-lock recovery.** A persisted table alone doesn't prevent two runners claiming the same job, or a crashed process leaving a job stuck in `running`. A job is **claimable** when `status = 'pending'`, or when `status = 'running' AND locked_at < now() - job_lock_timeout` (a crashed runner's job is requeued after the timeout). Claiming is a single atomic `UPDATE jobs SET status='running', locked_by=:runner, locked_at=now() WHERE id = (SELECT id FROM jobs WHERE <claimable> ORDER BY next_run_at LIMIT 1) RETURNING *` (SQLite 3.35+ and Postgres both support `RETURNING`). This is overkill for a single v1 process but makes restart recovery precise and makes the future worker-container split (§30, Phase 4) safe with no schema change.

### audit_log
```sql
audit_log (
  id            TEXT PRIMARY KEY,           -- ULID
  actor_user_id TEXT REFERENCES users(id),
  action        TEXT NOT NULL,
  target_type   TEXT,
  target_id     TEXT,
  ip_address    TEXT,
  metadata_json JSONB,
  created_at    TIMESTAMPTZ NOT NULL
)
```

The audit log captures admin actions, password resets, token revocation, visibility changes, and deletes.

### Indexes
```sql
CREATE INDEX clips_owner_recorded_at_idx  ON clips(owner_user_id, recorded_at DESC);
CREATE INDEX clips_owner_uploaded_at_idx  ON clips(owner_user_id, uploaded_at DESC);
CREATE INDEX clips_owner_game_idx         ON clips(owner_user_id, game_id);
CREATE INDEX clips_owner_visibility_idx   ON clips(owner_user_id, visibility);
CREATE INDEX clips_public_share_id_idx    ON clips(public_share_id);
CREATE INDEX jobs_status_next_run_idx     ON jobs(status, next_run_at);
```

## 8. Identifiers

- **Entity IDs** (`users`, `clips`, `sessions`, etc.): ULID, stored as 26-char `TEXT`. Time-sortable, so inserts cluster well and the `*_recorded_at`/`*_uploaded_at` index views stay tight. (UUIDv7 is an equivalent choice; ULID is chosen for compactness and because the original examples already used it.)
- **Public share IDs**: deliberately *not* derived from entity IDs and *not* sortable. A separate random token, `c_` + 22 chars base62, e.g. `c_7Gx9rLmP2qVaFz31N6db`. Sequential or guessable public URLs are never exposed.
- **Tokens** (session, device, reset): 256 bits of CSPRNG randomness, base64url-encoded, with a human-readable prefix (`clp_ses_`, `clp_dev_`). Shown to the client once; only the SHA-256 hash is persisted.

## 9. Authentication

Two distinct flows.

**Browser (cookie session).** Username/password login. On success the backend issues an opaque session token, stored hashed in `sessions`, and sets it in a cookie:

- One `HttpOnly`, `Secure`, `SameSite=Lax` session cookie. (No split SameSite policy across areas — that needs separate cookies/boundaries and isn't worth it.)
- A CSRF token is required on every state-changing browser request, **plus** strict `Origin`/`Referer` validation as defense in depth.
- Sensitive admin actions (create/disable user, reset password) require **re-authentication**, rather than a separate cookie policy.
- Sessions are revocable from the account page; revocation is immediate because validation is a DB lookup, not signature verification.

**Desktop (bearer device token).** The app collects host URL, username, password, sends them once over HTTPS, and receives a device token it stores in the OS credential store, discarding the password.

```
1. User enters host URL, username, password.
2. Client GETs  /.well-known/clipline-cloud   (verify it's a Clipline host + API version).
3. Client POSTs /api/v1/auth/device-token     (credentials + device name).
4. Backend validates credentials, creates a named device token, returns it ONCE.
5. Client stores the token; discards the password.
6. All future calls send  Authorization: Bearer clp_dev_...
```

**Transport safety.** Because credentials are sent once at connect time, the desktop app **refuses non-HTTPS hosts by default**. Plain HTTP is permitted only for `localhost`, `127.0.0.1`, and RFC1918 LAN addresses, and only after an explicit "I understand this sends my password in plaintext on this network" confirmation. A device token, once issued, is still a bearer secret and should travel over HTTPS. Device tokens carry a `name`, `last_used_at`, and optional `expires_at`, and are revocable from the web UI. The desktop app shows the connected server and account.

## 10. Password and Token Security

"Encrypted user system" is implemented as hashing, not reversible encryption.

- **Passwords:** Argon2id, per-user salt. Never encrypted, never recoverable.
- **Session & device tokens:** generated server-side, returned once, stored as SHA-256 hashes. A DB leak does not yield usable tokens.
- **Reset tokens:** short-lived, random, stored hashed.
- **Secrets** (DB URL, S3 keys, session secret): via env or `_FILE` variants for Docker secrets.
- **TLS:** terminated by the reverse proxy (or the app directly for LAN testing).

`CLIPLINE_SESSION_SECRET` is used only to HMAC CSRF tokens (and any other signed-cookie needs) — **not** to validate sessions, which are opaque DB lookups. Rotating it invalidates outstanding CSRF tokens but leaves logged-in sessions intact.

## 11. Storage Abstraction

One trait, two implementations. The API and DB never see filesystem paths — only logical, server-generated object keys.

```
trait StorageBackend {
  put_object(key, stream, metadata)
  get_object(key, range?) -> stream            // range for HTTP 206
  head_object(key) -> ObjectMetadata {         // metadata WITHOUT opening a stream
    size_bytes, content_type, etag, last_modified, checksum_sha256?
  }
  delete_object(key)
  object_exists(key) -> bool

  create_multipart_upload(key) -> upload_id
  upload_part(upload_id, key, part_number, stream) -> PartResult { etag, size }
  complete_multipart_upload(upload_id, key, parts[])
  abort_multipart_upload(upload_id, key)

  create_read_url(key, ttl) -> Option<Url>      // Some(..) for S3 presign; None for local
}
```

`head_object` exists because range responses, upload validation, thumbnail/poster jobs, and cleanup all need size / content-type / ETag / last-modified (and optionally a checksum) without streaming the object body.

- **Local adapter:** `create_multipart_upload` allocates a temp dir; `upload_part` writes `part_<NNNN>`. **Completion is crash-safe:** validate all parts, concatenate in part-number order into `source.mp4.tmp`, `fsync`, then **atomically rename** to the final key. The server never exposes a partially assembled final object. `create_read_url` returns `None`, signalling the caller to proxy.
- **S3 adapter:** maps 1:1 to S3 multipart; `complete` passes the stored per-part ETags; `create_read_url` returns a presigned GET.

**Object key layout** (identical logical keys on both backends). Keys are built from a **random, non-sortable 256-bit media token** per clip — *not* from `user_id`/`clip_id` — because S3 mode hands the raw object key to public viewers inside the presigned URL. ULID-derived paths would leak internal IDs and rough creation timing through that URL, partially defeating the random public share ID (§15). The owner/clip mapping lives only in the database (`clips.storage_key` etc.):
```
objects/media/<random-256-bit-token>/source.mp4
objects/media/<random-256-bit-token>/poster.jpg
objects/media/<random-256-bit-token>/thumb_320.jpg
```
The media token is independent of `public_share_id` (so regenerating a share link never moves objects) and of entity ULIDs (so the key reveals nothing). It is generated server-side; the backend never trusts a client-supplied path.

Local disk lays these under `CLIPLINE_DATA_DIR` (`/data/objects/media/<token>/...`), with `/data/tmp/uploads/<session>` for in-progress parts.

For S3, the bucket stays **private by default**. Public clips are still presented through the Clipline frontend (a share page), backed by either a backend proxy or a short-lived presigned GET — never permanent public bucket ACLs.

## 12. Upload Protocol

One protocol covers both backends and both file sizes. The client's chunk size *is* the storage part size, so the backend streams each chunk straight through to storage with no re-buffering.

```
POST   /api/v1/uploads                          create clip + session
GET    /api/v1/uploads/{id}                      progress (received/missing parts)
PUT    /api/v1/uploads/{id}/content              single-PUT body (small clips)
PUT    /api/v1/uploads/{id}/parts/{part_number}  one chunk (chunked path)
POST   /api/v1/uploads/{id}/complete             finalize
DELETE /api/v1/uploads/{id}                       abort + cleanup
```

**Part numbering (1-based).** Part numbers are **1-based and in `[1, 10000]`**, matching S3 multipart exactly so there's no off-by-one translation layer between client and S3 adapter. The final part may be smaller than `part_size_bytes`; when `storage_backend = s3`, every non-final part must be ≥ 5 MiB.

**Create.** The client sends clip metadata *and the whole-file `checksum_sha256` and `file_size_bytes` up front*. The server:
1. Resolves idempotency: if `(owner, client_clip_id)` already exists, returns the existing clip/session instead of creating a new one.
2. Creates the `clips` row (`status=created`) and an `upload_sessions` row.
3. Computes and pins `part_size_bytes` for the session (see formula below).
4. Chooses `mode`: `single_put` if `file_size_bytes <= CLIPLINE_SINGLE_PUT_MAX_BYTES` (default 64 MiB), else `chunked`.
5. For S3 chunked mode, calls `create_multipart_upload` and stores `storage_upload_id`.

> Because part size is pinned on the session row (not re-read from env at finalize), changing the global default never corrupts in-flight sessions.

**Part-size selection (must respect S3's 10,000-part ceiling).** The configured default is a floor, not the final value — at 5 GiB / 8 MiB you're well under 10,000 parts, but if an admin raises `CLIPLINE_MAX_UPLOAD_SIZE_BYTES` later the default could overflow the limit. The server computes, then rounds up to a clean MiB boundary:
```
part_size_bytes = round_up_to_MiB( max(
    CLIPLINE_UPLOAD_PART_SIZE_BYTES,           # configured floor
    ceil(file_size_bytes / 10000),             # stay under 10k parts
    5 MiB if storage_backend == s3 else 0      # S3 minimum non-final part
) )
```
The client uses the server-returned `part_size_bytes`, never its own local default.

Example create request:
```json
{
  "client_clip_id": "6f70710e-54e6-49d1-b7ab-3802edabf3c5",
  "title": "Baron steal",
  "game_name": "League of Legends",
  "game_id": "league-of-legends",
  "source_type": "league_marker",
  "recorded_at": "2026-06-15T02:31:14Z",
  "duration_ms": 45000,
  "file_size_bytes": 83214521,
  "checksum_sha256": "9f2c...",
  "container": "mp4",
  "video_codec": "h264",
  "audio_codec": "aac",
  "width": 1920, "height": 1080, "fps": 60,
  "visibility": "private",
  "markers": [{ "kind": "kill", "label": "Kill", "timestamp_ms": 18200 }]
}
```

Example create response:
```json
{
  "clip_id": "01JZ8T2K9V7S8F5GTRR0VYR1WX",
  "upload_id": "01JZ8T2N8MM86AGD9TD98DQ1RE",
  "mode": "chunked",
  "part_size_bytes": 8388608,
  "single_put_url": null,
  "parts_url_template": "/api/v1/uploads/01JZ8T2N8MM86AGD9TD98DQ1RE/parts/{part_number}"
}
```
(The response does not echo the bearer token back — the client already has it.)

**Single-PUT path.** `PUT /content` streams the body to `put_object`; the server verifies size and (cheaply, since it has the bytes) `checksum_sha256`, then finalizes.

**Chunked path.** Each `PUT /parts/{n}` (1-based) streams to `upload_part`. The client *may* send `X-Clipline-Part-SHA256`; the server computes the SHA-256 **while streaming the part regardless**, rejects the part if a supplied header mismatches, and stores its own server-computed checksum (never the client's claim) along with `size_bytes` and the storage `etag`, then bumps `received_size_bytes`. `GET /uploads/{id}` reports `received_parts` / `missing_parts` so an interrupted client resumes exactly where it stopped.

```json
{
  "upload_id": "01JZ8T2N8MM86AGD9TD98DQ1RE",
  "clip_id": "01JZ8T2K9V7S8F5GTRR0VYR1WX",
  "status": "uploading",
  "file_size_bytes": 83214521,
  "part_size_bytes": 8388608,
  "received_parts": [1, 2, 3, 4, 5],
  "missing_parts":  [6, 7, 8, 9, 10]
}
```

**Duplicate parts.** `PUT /parts/{n}` is idempotent when the uploaded checksum matches the already-stored checksum (safe to retry on flaky connections). Re-uploading an already-accepted part number with a **different** checksum returns `409 Conflict` unless the upload session is explicitly reset.

**Complete.** The server verifies every part is present and `Σ size == expected_size_bytes`, then calls `complete_multipart_upload` with the stored ETags.

**`POST /complete` is idempotent, because it spans two systems** (object storage and the DB) that can't be updated atomically — the server can crash between `CompleteMultipartUpload` succeeding and the DB commit, after which the S3 multipart upload ID no longer exists and a naive retry of `CompleteMultipartUpload` fails with `NoSuchUpload` even though the final object may already be assembled. Reconciliation rule:

```
On POST /complete:
  if upload_session.status == 'completed':
      return the existing clip/upload state (200)         # already done
  try storage.complete_multipart_upload(...)
  on NoSuchUpload / already-completed error:
      meta = storage.head_object(storage_key)
      if meta exists and meta.size_bytes == expected_size_bytes:
          mark session completed; enqueue validate_object; return processing
      else:
          keep the session retryable, or mark failed on a hard storage error
```

This makes crash-then-retry safe: either the object is there (adopt it) or it isn't (retry/fail), with no dependence on the consumed multipart upload ID.

> **Integrity (be precise about S3):** the checksum stored per part is always **server-computed** (see chunked path), never a client claim. On **local**, `complete` also verifies whole-file SHA-256 (the server has all the bytes). On **S3**, completion verifies part presence, part sizes, server-observed part checksums, and S3 ETags; whole-object SHA-256 verification is **asynchronous** (a background `validate_object` job streams the object) *unless* S3 native checksums (SHA-256/CRC32 on multipart) are enabled, in which case S3 verifies on `CompleteMultipartUpload`. Treat **S3 ETags as completion handles, not cryptographic integrity proofs** — S3-compatible providers vary in how ETags are computed for multipart objects. The product does **not** claim end-to-end hash verification at completion in S3 mode.

The clip becomes viewable only after `complete` succeeds and processing reaches `ready`. `uploaded_at` is stamped server-side at this point — never from a client clock.

A future version can add direct-to-S3 multipart (client uploads parts straight to S3 via presigned part URLs, backend only orchestrates) or the TUS protocol. The first-party protocol above is enough for v1 and keeps tight control over the desktop UX.

## 13. Clip Lifecycle and Processing

Clipline already produces playable MP4, so **no server-side transcoding in v1**. After finalize, a durable `validate_object` job (§7) confirms the stored object exists and matches expected size, then transitions the clip to `ready`. Thumbnail/poster generation and ffprobe metadata backfill are **Phase 2** jobs (so the Phase-1 library shows placeholders — intentional).

States: `created` → `uploading` → `processing` → `ready`, plus `failed` and `deleted` (soft-delete). Because jobs are persisted, a restart during processing resumes rather than stranding a clip; a job that exhausts `max_attempts` is marked `dead` and surfaced in the admin UI.

**Untrusted-media boundary (write this before Phase 2 ships).** Thumbnail/poster/probe jobs run `ffmpeg`/`ffprobe` against arbitrary user-uploaded files, which is an attack surface. Those processes must run as a **non-root** user, with **no network access**, a **strict wall-clock timeout**, and memory/process limits where the host allows (cgroups/`ulimit`). `ffprobe` output is parsed but **never trusted blindly** — reported dimensions, duration, and codecs are validated against sane bounds before they touch the DB or the player. Not a Phase-1 blocker, but a hard requirement for the job that introduces media decoding.

## 14. Media Serving and Range Requests

Video seeking requires HTTP range support, so the media endpoint is range-aware from day one.

- Honor `Range: bytes=...`; respond `206 Partial Content` with `Accept-Ranges: bytes`, `Content-Range`, `Content-Length`, and the correct `Content-Type` (from `head_object`).
- Thumbnails/posters get cache headers; media gets conditional/`ETag` handling.

**Local backend:** stream from disk with range slicing.
**S3 backend:** private clips are proxied by the backend (range forwarded to S3). Public clips use short-lived presigned GETs (§15) so the high-fanout path doesn't run through the app's bandwidth.

## 15. Public Sharing

Each clip has a `visibility` and, when shared, a `public_share_id`.

- Marking a clip public activates a random `public_share_id`; URL form: `https://clips.example.com/c/{share_id}`.
- The public page (no login) shows player, title, game, date, duration. It exposes no owner metadata, no edit/delete controls.
- Reverting to private makes the public page return **404** (not 403) for anonymous users — 403 would confirm the clip exists.
- Public links are **stable until revoked**; expiring links are a future feature.

**Download honesty.** Public clips are served **inline with no download button by default**. This is **not DRM** — a presigned GET is a working URL while valid, and even backend-proxied video can be saved by a viewer. The product states plainly that public media can be copied by anyone who can view it. In S3 mode, public playback uses short-lived presigned GET URLs with `Content-Disposition: inline`.

**Revocation is eventual, not instant, in S3 presigned mode.** Making a clip private immediately takes down the share *page* and stops the backend from minting new presigned URLs — but any presigned URL already handed out stays valid until its TTL expires. Keep that TTL short (recommended **5–10 minutes**); operators who need instant revocation should run public media through the backend proxy instead of presigned URLs. For browser `<video>` playback against a cross-origin S3 host, the bucket needs CORS allowing `GET`/`HEAD` and the `Range` request header from the public origin, and the presigned response should carry `Content-Type: video/mp4`, `Accept-Ranges: bytes`, and cache headers; same-origin backend-proxied media avoids the CORS surface entirely.

## 16. API Surface

All under `/api/v1`.

**Discovery** (called by the desktop app before login):
```
GET /.well-known/clipline-cloud
```
```json
{
  "name": "Clipline Cloud",
  "api_version": "v1",
  "server_version": "0.1.0",
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
The desktop client's compatibility contract covers upload modes, max size, chunk size, auth, and sharing — **not** the storage backend. Whether the host uses local disk or S3 is invisible to the client by design; if that fact is needed for diagnostics it belongs in an admin-only `server.storage_backend` field, not here.

**Auth**
```
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
GET    /api/v1/auth/me
POST   /api/v1/auth/device-token
GET    /api/v1/auth/device-tokens
DELETE /api/v1/auth/device-tokens/{id}
```

**Users** (admin-only except self password change)
```
GET    /api/v1/users
POST   /api/v1/users
GET    /api/v1/users/{id}
PATCH  /api/v1/users/{id}
DELETE /api/v1/users/{id}
POST   /api/v1/users/{id}/reset-password
POST   /api/v1/me/change-password
```

**Clips**
```
GET    /api/v1/clips
GET    /api/v1/clips/{id}
PATCH  /api/v1/clips/{id}
DELETE /api/v1/clips/{id}
POST   /api/v1/clips/{id}/visibility
```
List example:
```
GET /api/v1/clips?sort=recorded_at_desc&game=league-of-legends&visibility=private&page=1&page_size=50
```

**Media** (ownership enforced for private)
```
GET /api/v1/clips/{id}/media
GET /api/v1/clips/{id}/thumbnail
GET /api/v1/clips/{id}/poster
```

**Public** (no auth, by share ID)
```
GET /api/v1/public/clips/{share_id}
GET /api/v1/public/clips/{share_id}/media
GET /api/v1/public/clips/{share_id}/thumbnail
```

**Uploads** — see §12.

Every clip/upload/media endpoint enforces: authenticated caller owns the resource; the upload session hasn't expired; bytes match expected size; nothing becomes viewable until finalized.

## 17. Web Frontend

Four areas.

**Login** — username/password, clear errors, no self-registration unless an admin enables it (omitted from v1).

**Library** — the owner's clips, with sort (newest/oldest, game, recorded/uploaded date, duration) and filters (game, visibility, status). Fields: thumbnail, title, game, duration, recorded date, upload date, visibility badge, file size. Actions: view, copy link, toggle public/private, delete. *Phase-1 note: thumbnails are generated in Phase 2, so the Phase-1 library renders placeholders — intentional.*

**Clip detail** — player, title, game, recorded date, duration, markers (League markers as timeline ticks), visibility control, public URL when public, metadata, delete.

**Admin** — create/disable user, reset password, list users, per-user storage usage, active sessions/device tokens, server version + config summary, failed uploads, dead jobs, optional per-user quotas. Admins manage accounts and infrastructure but get **no casual "view everyone's private clips" UI** (§22).

## 18. Desktop App Integration

A **Cloud** section in Settings: host URL, username, password, Connect button, connection status, connected account, default visibility, optional *delete-local-after-upload* (off by default), optional *auto-upload rules* (off by default, and a later feature).

Flow: open Settings → Cloud → enter host + credentials → app validates discovery endpoint → (if non-HTTPS, the LAN-only confirmation from §9) → logs in, stores device token, discards password → clips gain an Upload button → progress shows in-app → after upload the user copies the private or public URL.

Desktop upload states: `not_uploaded`, `queued`, `uploading`, `processing`, `uploaded_private`, `uploaded_public`, `failed`, `retrying`.

The app keeps a local mapping `local_clip_id -> remote_clip_id -> remote_url -> upload_status` (the `client_clip_id` idempotency key is what makes this safe across restarts and prevents duplicate uploads). Uploads are treated as retryable unless the server returns a permanent validation error.

## 19. Sorting and Search

Query fields: `sort` (`recorded_at_desc|recorded_at_asc|uploaded_at_desc|uploaded_at_asc|duration_desc|duration_asc|title_asc`), `game` (exact or normalized ID), `visibility`, `status`, `from`/`to` (date bounds), `q` (simple title/game text search). The §7 indexes back the common views.

## 20. Quotas and Limits

Operator-controllable: max upload size, allowed containers/MIME types, max active upload sessions per user, upload session TTL, optional per-user storage quota, optional global storage-warning threshold.

Defaults: max upload 5 GiB; session TTL 24 h; part size 8 MiB; single-PUT threshold 64 MiB; allowed container `mp4` (mov/mkv later); default visibility `private`. Since Clipline emits MP4, v1 restricts uploads to MP4.

## 21. Security Requirements

Assume internet exposure:

- No default admin password (§ first-run below).
- Argon2id passwords; hashed session and device tokens.
- One `SameSite=Lax` session cookie + CSRF token + strict `Origin`/`Referer` checks for browser requests; re-auth for sensitive admin actions; bearer tokens for desktop.
- Per-user authorization on every clip/upload/media endpoint.
- Random, non-sequential public share IDs.
- Login rate limiting; upload size limits; strict server-side content-type/extension handling; no client-controlled paths.
- Private S3 bucket by default.
- `X-Forwarded-For` is trusted **only** from the known proxy hop (the deployment model is always behind Caddy/Traefik/nginx); otherwise audit-log IPs are spoofable.
- Secure headers (from app or proxy): `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security` when HTTPS.
- Audit logs for admin actions.

The app works over HTTP for LAN testing but warns clearly when `CLIPLINE_PUBLIC_URL` is not HTTPS; the desktop app enforces the stricter connect-time rule in §9.

### First-run admin creation
On first start the backend initializes schema and ensures one admin exists. **No hardcoded password.** Username from `CLIPLINE_BOOTSTRAP_ADMIN_USERNAME`; password from `CLIPLINE_BOOTSTRAP_ADMIN_PASSWORD[_FILE]`; if none supplied, generate a one-time password and print it once:
```
Clipline Cloud initialized.
Initial admin user created: admin
One-time password: <generated-password>
Save this password now. It will not be shown again.
```
After an admin exists, bootstrap credentials are ignored. A later CLI adds `clipline-cloud admin reset-password <user>`.

## 22. Privacy Model

Stated plainly to the user, because people read "private" as cryptographic:

- Private clips are private from other normal users and are not public on the web.
- The instance operator runs the server, database, and storage and can technically access files and rows.
- True secrecy from the operator would require end-to-end encryption, which is out of scope for v1.

In v1, **private = application-level access control**, nothing more, and the product never claims otherwise.

## 23. Configuration

```
CLIPLINE_PUBLIC_URL                 # required for share links; warns if not HTTPS
CLIPLINE_BIND_ADDR
CLIPLINE_DATABASE_URL               # sqlite:///data/clipline.db (default) | postgres://...

CLIPLINE_BOOTSTRAP_ADMIN_USERNAME
CLIPLINE_BOOTSTRAP_ADMIN_PASSWORD
CLIPLINE_BOOTSTRAP_ADMIN_PASSWORD_FILE

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
CLIPLINE_PUBLIC_MEDIA_MODE          # presigned (default) | proxy
CLIPLINE_PUBLIC_READ_URL_TTL_SECONDS # default 300

CLIPLINE_SESSION_SECRET[_FILE]      # HMAC for CSRF tokens (NOT session validation)
CLIPLINE_LOG_LEVEL
```

Config is validated at startup; the app fails loudly on invalid storage/DB settings. `local` requires `CLIPLINE_DATA_DIR`; `s3` requires endpoint, bucket, access key, secret key; `CLIPLINE_PUBLIC_URL` is required for share links.

## 24. Deployment

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
      # the logs on first start (§21). Read it with:  docker compose logs clipline-cloud
    volumes:
      - /mnt/media/clipline-cloud:/data
```
This points the public URL at `localhost` because the minimal example has no reverse proxy or TLS — `https://clips.example.com` would resolve to nothing and have no terminator. The non-HTTPS public URL trips the §21 startup warning (expected for a local test); the production Caddy profile below uses the real domain over HTTPS.

**Fixed admin password via Docker secrets (note the `secrets:` block — the prior draft referenced a secret file without declaring it):**
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
    volumes:
      - /mnt/media/clipline-cloud:/data
    secrets:
      - admin_password

secrets:
  admin_password:
    file: ./secrets/admin_password.txt
```

S3 mode adds the `CLIPLINE_S3_*` block and sets `CLIPLINE_STORAGE_BACKEND: s3`. Postgres mode swaps `CLIPLINE_DATABASE_URL` and adds a `postgres:16` service.

Compose profiles shipped in the repo:

- `docker-compose.yml` — SQLite + local disk (the simplest path).
- `docker-compose.caddy.yml` — adds Caddy + automatic HTTPS.
- `docker-compose.postgres.yml` — Postgres instead of SQLite.
- `docker-compose.s3.yml` — external S3-compatible storage.
- `docker-compose.minio.yml` — bundled MinIO for local S3 testing.

`_FILE` secret variants are supported everywhere and preferred over inline passwords.

## 25. Backup and Restore

A complete backup is **database + media, from the same point in time** — one without the other is useless (the DB holds metadata and object keys; storage holds the bytes).

- **SQLite + local disk:** copy the data directory, and snapshot the DB with SQLite's backup API or `VACUUM INTO` — **never copy a live SQLite file directly** (you risk a torn copy); stopping the container first is also fine. Keep the DB on local disk, not NFS/SMB.
- **Postgres + local disk:** `pg_dump` plus the data directory.
- **S3:** back up the database; rely on bucket versioning/lifecycle for media.

Docs cover dump/restore for each DB, copying `/data`, and the (explicit, non-automatic) local→S3 migration.

## 26. Migrations

Embedded migrations run at startup; a failed migration prevents the server from starting; history lives in the DB. On Postgres, wrap migration runs in a session-level advisory lock so multiple replicas can't race; on SQLite the single-writer model serializes this naturally but startup still gates on success. Users are told to back up before upgrading. Storage migrations (e.g., local→S3) are never automatic.

## 27. Failure Modes

Handle cleanly and surface a clear, retryable state: DB unavailable; storage unavailable; interrupted upload; upload complete but processing failed (the `validate_object`/processing job retries, then goes `dead` and shows in admin); metadata row without object; object without row; invalid S3 credentials; disk full; misconfigured public URL; restart mid-upload (resume via `received_parts`/`missing_parts`); restart mid-processing (durable jobs resume). The desktop client retries unless the server returns a permanent validation error; the web UI shows each failed upload with retry/delete.

## 28. Observability

Self-hosting diagnostics without a full observability stack.

- **Admin UI:** server version, storage backend, data dir / bucket summary, DB status, total clips, total storage used, failed uploads, dead jobs, recent job errors, active users, recent admin actions.
- **Health:** `GET /healthz` (process alive), `GET /readyz` (DB + storage reachable).
- **Logs:** structured JSON, e.g. `{"level":"info","event":"clip.upload.completed","user_id":"01JZ...","clip_id":"01JZ...","size_bytes":83214521,"duration_ms":45000}`.

## 29. Repository Layout

**Monorepo, inside `dain98/clipline`.** The decisive reason: the desktop app is Rust/Tauri and the backend is Rust, so a shared `clipline-cloud-api-types` crate lets the upload/auth contract be type-checked on *both* ends. A separate repo is operationally cleaner but loses that, and the coordination cost between desktop and server is exactly where bugs hide.

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
    clipline-cloud-web/         # frontend
  deploy/compose/               # the profiles from §24
  docs/cloud/                   # deployment, configuration, api, backup-restore
```

## 30. Implementation Phases

**Phase 1 — v1 completeness target.** SQLite + local disk default **and S3-compatible storage**; first-run admin; admin-created users; browser login; desktop device-token login (with the non-HTTPS guard, §9); chunked upload + single-PUT small-file path; durable jobs table + `validate_object` on finalize; private clips; public share links with inline presigned/proxied playback; HTTP range playback; basic delete; health checks; minimal audit log. *(Thumbnails are placeholders here.)*

> Implementation may sequence local-first and add the S3 adapter second **within** this phase, but S3 is part of the v1 bar, not a later release.

**Phase 2 — Processing & reliability polish.** Thumbnail/poster generation; ffprobe metadata backfill; expired-session and orphaned-part cleanup sweeps; richer upload progress in web + desktop; login rate limiting; **Postgres backend promoted to supported once CI proves both backends** (migrations + repository tests green on SQLite and Postgres).

**Phase 3 — Admin & library polish.** Per-user storage usage and quotas; advanced sort/search; game grouping; bulk delete and bulk visibility; device-token and session management UI.

**Phase 4 — Optional scale.** Direct-to-S3 multipart via presigned part URLs; dedicated worker container; transcoding/multiple qualities; CDN for public clips; invite links; OIDC; federation. Build only if demand appears.

---

## Appendix A — Resolved Open Questions

| Question | v1 decision |
|---|---|
| Can admins view all users' private clips in the UI? | No casual "view all" UI. Admins see storage/account metadata only. The privacy model (§22) is honest that the operator controls the infrastructure. |
| Are public clips downloadable? | No download button by default; served inline. Not DRM — viewers can still copy the bytes. An explicit download toggle is a later per-clip / instance setting. |
| Self-registration? | Disabled by default; omitted from v1. |
| Auto-upload rules in desktop v1? | No. Manual upload first; auto-upload later. |
| Do public links expire? | Stable until revoked; expiring links are a future feature. |
| Accept uploads from non-Clipline clients? | API is clean and documented, but the supported client is Clipline. |

## Appendix B — Changes From the Original Draft (round 1)

- **Tokens:** committed to opaque (dropped the JWT option) so hashed-at-rest storage, revocation, and `last_used_at` actually work.
- **IDs:** unified on ULID-as-`TEXT` everywhere (the original mixed `UUID PRIMARY KEY` with ULID examples), chosen for index locality and SQLite/Postgres portability.
- **Database:** flipped the default to SQLite (Postgres optional) to match the "simple for a hobbyist" goal; schema made portable with a type-mapping table.
- **Idempotency:** `client_clip_id` made an enforced `UNIQUE(owner, client_clip_id)` with defined repeat-request behavior.
- **Upload protocol ↔ storage:** explicitly wired together (`storage_upload_id`, per-part `etag`); client chunk size pinned to S3 part size.
- **Integrity:** whole-file `checksum_sha256` declared at create time.
- **Upload sizing:** chunked default, single-PUT for small files.
- **New columns:** `source_type`, `checksum_sha256` on `clips`; `etag`, `storage_upload_id` on the upload tables.
- **Smaller fixes:** server-authoritative `uploaded_at`; upload response no longer echoes the bearer token; `X-Forwarded-For` trust scoped to the proxy hop; `CLIPLINE_SESSION_SECRET` role clarified; migrations take a Postgres advisory lock; ffmpeg dependency stated outright.

## Appendix C — Changes In This Revision (round 2, post-review)

- **S3 moved into v1.** Storage being "pluggable (local or S3)" is a v1 requirement, so S3 is in the Phase-1 completeness target, not a later phase. Phases renumbered (old 5 → 4).
- **Database commitment tightened.** SQLite is the *only required* v1 DB; Postgres is "supported" only once CI proves both backends. Dropped the soft "Postgres may slip" fallback.
- **Part numbers are 1-based `[1, 10000]` everywhere** (examples were 0-based), matching S3 multipart so there's no off-by-one translation layer. Added duplicate-part idempotency + `409` on checksum mismatch.
- **S3 integrity wording corrected.** Completion verifies part presence/sizes/checksums/ETags; whole-object SHA-256 is asynchronous unless S3 native checksums are enabled. No claim of end-to-end hash verification at completion in S3 mode.
- **"Streamable, not downloadable" replaced** with honest language: inline, no download button, **not DRM**, copyable; presigned GETs use `Content-Disposition: inline`.
- **Storage trait gained `head_object` / `ObjectMetadata`** (size/content-type/etag/last-modified/checksum without opening a stream).
- **Crash-safe local completion specified:** temp parts → validate → concat to `.tmp` → `fsync` → atomic rename. No partial final objects.
- **Added a durable `jobs` table** (kind/status/attempts/max_attempts/next_run_at/last_error, nullable target for sweeps) so processing and cleanup survive restarts.
- **CSRF simplified** to one `SameSite=Lax` cookie + CSRF token + `Origin`/`Referer` checks, with re-auth for sensitive admin actions (dropped the split-SameSite policy).
- **Desktop transport guard:** refuses non-HTTPS hosts except `localhost`/`127.0.0.1`/RFC1918, and only behind an explicit plaintext-password confirmation.
- **Compose fixed:** minimal example uses the generated first-run password (runs as copied); a second example shows the full Docker `secrets:` block.
- **SQLite operational requirements added** (WAL, `foreign_keys=ON`, `busy_timeout`, short transactions, no NFS/SMB, single-writer) and a SQLite backup caveat (no live-file copy).

## Appendix D — Changes In This Revision (round 3, post-review)

Four required edits plus polish; after this round the design is treated as an implementation base rather than something to keep rewriting.

- **(Required) Storage keys randomized.** Media object keys are now `objects/media/<random-256-bit-token>/...` instead of `clips/user_<ULID>/clip_<ULID>/...`. ULID-derived keys would have leaked internal IDs and rough creation timing through public presigned URLs, partially defeating the random public share ID. The token is independent of both `public_share_id` and entity ULIDs; owner/clip mapping lives only in the DB.
- **(Required) Durable job locking/recovery.** Added `locked_by` / `locked_at` to `jobs`, an atomic `UPDATE ... RETURNING` claim, and a stale-lock requeue rule (`running` + `locked_at` older than `job_lock_timeout` → claimable). Makes restart recovery precise and the future worker split safe.
- **(Required) Idempotent multipart-complete reconciliation.** Defined what happens when storage completion succeeds but the DB update doesn't (or the process crashes between): `POST /complete` is idempotent; on a `NoSuchUpload`/already-completed error it calls `head_object` and adopts the final object if it exists and matches size. Avoids the classic "retry fails because the multipart upload ID is gone but the object exists" trap.
- **(Required) Minimal Compose `CLIPLINE_PUBLIC_URL` fixed** to `http://localhost:8080` so the no-Caddy example is actually a runnable local smoke test; the production domain stays in the Caddy profile.
- **Part-size selection is now formulaic:** `round_up_MiB(max(configured, ceil(size/10000), 5 MiB for s3))`, so raising max upload size later can't overflow S3's 10,000-part ceiling. Client uses the server-returned value.
- **Checksum mechanism specified:** optional `X-Clipline-Part-SHA256` header; server computes and stores its own checksum regardless; S3 ETags labelled completion handles, not cryptographic proofs (providers vary).
- **Presigned revocation/CORS spelled out:** going private takes down the page and stops new URLs, but issued presigned URLs live until their (recommended 5–10 min) TTL; documented bucket CORS + response headers for browser `<video>`.
- **ffmpeg untrusted-media boundary** (non-root, no network, timeouts, resource limits, don't trust `ffprobe` blindly) written down as a hard requirement for the Phase-2 job that introduces media decoding.
- **Discovery slimmed:** removed `s3_storage` from the client-facing feature contract — the desktop client doesn't need to know the storage backend; that's admin-only diagnostics.
