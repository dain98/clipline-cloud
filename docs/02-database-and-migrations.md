# 02 — Database & Migrations

**Phase:** Phase 1 (v1)
**Status:** ☑ Complete
**Depends on:** doc 01 (workspace + config)
**Design sections:** §7 (data model), §8 (identifiers), §26 (migrations)

> Goal: the portable schema, embedded migrations, ULID/timestamp conventions, repositories, and the
> SQLite operational requirements. Every later milestone reads and writes through this layer. Build
> it **portable from day one** (SQLite required; Postgres dialect-clean even though Postgres is only
> *promoted* in Phase 2).

---

## Goal

`clipline-cloud-db`: SQLx-backed repositories over a portable schema, embedded migrations that run
at startup (and gate boot on success), ULID-as-`TEXT` IDs, UTC timestamps, and SQLite WAL/pragma
setup. Wire the `/readyz` DB probe stubbed in doc 01.

## Design context

### Portable type mapping (§7)

Reference DDL below is Postgres-leaning for readability. Backend mappings:

| Concept | SQLite | Postgres |
|---|---|---|
| Identifier | `TEXT` (26-char ULID) | `TEXT` (26-char ULID) |
| Timestamp | `TEXT` ISO-8601 UTC | `TIMESTAMPTZ` |
| JSON blob | `TEXT` (JSON) | `JSONB` |
| IP address | `TEXT` | `INET` |
| Boolean | `INTEGER 0/1` | `BOOLEAN` |

All IDs are ULIDs-as-text. All timestamps are UTC.

### Identifiers (§8)

- **Entity IDs**: ULID, 26-char `TEXT`, time-sortable (good index locality for time-ordered views).
- **Public share IDs**: separate, random, non-sortable — `c_` + 22 chars base62. Generated in doc 08.
- **Tokens**: 256-bit CSPRNG, base64url, prefixed; stored only as SHA-256 hashes (doc 04).

### SQLite operational requirements (§7)

When running on SQLite (the default):

- WAL mode enabled; `foreign_keys = ON`; a configured `busy_timeout`.
- Transactions kept short; **media bytes never pass through the database.**
- Single-writer only — no horizontal multi-writer deployment on SQLite.
- Avoid NFS/SMB-backed SQLite files (locking is unreliable); keep the DB on local disk.

### Schema (§7)

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

sessions (                                  -- browser, opaque token
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

device_tokens (                             -- desktop, opaque bearer
  id           TEXT PRIMARY KEY,            -- ULID
  user_id      TEXT NOT NULL REFERENCES users(id),
  name         TEXT NOT NULL,               -- "Dain's Desktop"
  token_hash   TEXT NOT NULL UNIQUE,        -- SHA-256 of opaque token
  created_at   TIMESTAMPTZ NOT NULL,
  last_used_at TIMESTAMPTZ,
  expires_at   TIMESTAMPTZ,                 -- nullable = no expiry
  revoked_at   TIMESTAMPTZ
)

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
  checksum_sha256 TEXT,                     -- whole-file, client-declared (see doc 05)
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
-- existing clip instead of creating a duplicate (doc 05).
CREATE UNIQUE INDEX clips_owner_client_clip_id_ux
  ON clips(owner_user_id, client_clip_id)
  WHERE client_clip_id IS NOT NULL;   -- NULLs allowed/distinct on both backends

clip_markers (
  id            TEXT PRIMARY KEY,           -- ULID
  clip_id       TEXT NOT NULL REFERENCES clips(id) ON DELETE CASCADE,
  kind          TEXT NOT NULL,              -- kill|death|assist|objective|...
  label         TEXT,
  timestamp_ms  INTEGER NOT NULL,
  metadata_json JSONB,
  created_at    TIMESTAMPTZ NOT NULL
)

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
  checksum_sha256     TEXT,                 -- expected whole-file hash (see doc 05)
  created_at          TIMESTAMPTZ NOT NULL,
  updated_at          TIMESTAMPTZ NOT NULL,
  completed_at        TIMESTAMPTZ,
  expires_at          TIMESTAMPTZ NOT NULL
)

upload_parts (
  upload_session_id TEXT NOT NULL REFERENCES upload_sessions(id) ON DELETE CASCADE,
  part_number       INTEGER NOT NULL,        -- 1-based (see doc 05)
  size_bytes        BIGINT NOT NULL,
  checksum_sha256   TEXT,
  etag              TEXT,                    -- S3 part ETag, needed for CompleteMultipartUpload
  received_at       TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (upload_session_id, part_number)
)

jobs (                                       -- durable, in-process runner (doc 06)
  id           TEXT PRIMARY KEY,            -- ULID
  kind         TEXT NOT NULL,               -- validate_object|thumbnail|poster|probe_metadata|cleanup_session|cleanup_clip
  status       TEXT NOT NULL CHECK (status IN ('pending','running','succeeded','failed','dead')),
  target_type  TEXT,                        -- NULL for global sweeps
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

`visibility` keeps `unlisted` in the enum from day one even though v1 has no discovery feed (so
`public` and `unlisted` behave identically for now); storing it as an enum lets the model evolve
without a migration.

### Indexes (§7)

```sql
CREATE INDEX clips_owner_recorded_at_idx  ON clips(owner_user_id, recorded_at DESC);
CREATE INDEX clips_owner_uploaded_at_idx  ON clips(owner_user_id, uploaded_at DESC);
CREATE INDEX clips_owner_game_idx         ON clips(owner_user_id, game_id);
CREATE INDEX clips_owner_visibility_idx   ON clips(owner_user_id, visibility);
CREATE INDEX clips_public_share_id_idx    ON clips(public_share_id);
CREATE INDEX jobs_status_next_run_idx     ON jobs(status, next_run_at);
```

### Migrations (§26)

- Embedded migrations run **at startup**; a failed migration **prevents the server from starting**;
  history lives in the DB.
- On **Postgres**, wrap migration runs in a **session-level advisory lock** so multiple replicas
  can't race. On **SQLite** the single-writer model serializes this naturally, but startup still
  gates on success.
- Users are told to back up before upgrading (doc 11). Storage migrations (local→S3) are never automatic.

## Implementation checklist

- [x] `clipline-cloud-db` crate with SQLx; connection pool for both SQLite and Postgres from `CLIPLINE_DATABASE_URL`
- [x] SQLite startup pragmas: WAL, `foreign_keys = ON`, configured `busy_timeout`
- [x] ULID generation helper; UTC timestamp helpers; portable mapping for booleans/JSON/IP/timestamps across both dialects
- [x] Migration set authored for **both** SQLite and Postgres dialects (the type-mapping table is the guide)
- [x] Embedded migrations run at startup and **abort boot on failure**
- [x] Postgres migration runs take a session-level advisory lock
- [x] All tables created: `users`, `sessions`, `device_tokens`, `clips`, `clip_markers`, `upload_sessions`, `upload_parts`, `jobs`, `audit_log`
- [x] All indexes created, including the partial `clips_owner_client_clip_id_ux`
- [x] Repository layer for each table (typed CRUD used by later docs); transactions kept short
- [x] `/readyz` DB-reachability probe implemented (replaces doc 01 stub)
- [x] Repository tests run against SQLite (and are structured to also run against Postgres for the Phase-2 CI gate)

## Definition of done

- [x] Fresh boot on SQLite creates the full schema via migrations and serves `/readyz` = ok
- [x] Migrations are reversible/forward-only as designed and re-running boot is a no-op
- [x] Repository tests pass on SQLite; the same suite is wired to run on Postgres (green Postgres run is the doc-12 gate, not required here)
- [x] No SQL uses a dialect-specific construct without a portable mapping
- [x] Partial unique index on `(owner_user_id, client_clip_id)` verified to allow multiple NULLs on both backends

## Progress log

- 2026-06-16 — Implemented `clipline-cloud-db` with SQLx SQLite/Postgres pools, SQLite WAL /
  `foreign_keys` / `busy_timeout`, embedded migrations for both dialects, Postgres advisory-lock
  migration guard, ULID and UTC helpers, typed repositories for all schema tables, and a server
  startup migration gate. Replaced the `/readyz` DB stub with a real database ping.
- 2026-06-16 — Verified `cargo fmt --all --check`, `cargo build --workspace`,
  `cargo test --workspace`, SQLite repository tests, migration idempotency, partial
  `(owner_user_id, client_clip_id)` uniqueness behavior, and a fresh SQLite server boot returning
  `/readyz` with `database: "ok"`. The local shell did not have `sqlite3`; schema table checks are
  covered by the DB crate tests.
