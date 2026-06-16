CREATE TABLE users (
  id            TEXT PRIMARY KEY,
  username      TEXT NOT NULL UNIQUE,
  display_name  TEXT,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('admin','user')),
  is_disabled   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL,
  updated_at    TIMESTAMPTZ NOT NULL,
  last_login_at TIMESTAMPTZ
);

CREATE TABLE sessions (
  id           TEXT PRIMARY KEY,
  user_id      TEXT NOT NULL REFERENCES users(id),
  token_hash   TEXT NOT NULL UNIQUE,
  user_agent   TEXT,
  ip_address   INET,
  created_at   TIMESTAMPTZ NOT NULL,
  last_used_at TIMESTAMPTZ,
  expires_at   TIMESTAMPTZ NOT NULL,
  revoked_at   TIMESTAMPTZ
);

CREATE TABLE device_tokens (
  id           TEXT PRIMARY KEY,
  user_id      TEXT NOT NULL REFERENCES users(id),
  name         TEXT NOT NULL,
  token_hash   TEXT NOT NULL UNIQUE,
  created_at   TIMESTAMPTZ NOT NULL,
  last_used_at TIMESTAMPTZ,
  expires_at   TIMESTAMPTZ,
  revoked_at   TIMESTAMPTZ
);

CREATE TABLE clips (
  id              TEXT PRIMARY KEY,
  owner_user_id   TEXT NOT NULL REFERENCES users(id),
  client_clip_id  TEXT,
  title           TEXT NOT NULL,
  game_name       TEXT,
  game_id         TEXT,
  game_executable TEXT,
  source_type     TEXT,
  recorded_at     TIMESTAMPTZ,
  uploaded_at     TIMESTAMPTZ,
  duration_ms     BIGINT,
  file_size_bytes BIGINT,
  width           BIGINT,
  height          BIGINT,
  fps             DOUBLE PRECISION,
  container       TEXT,
  video_codec     TEXT,
  audio_codec     TEXT,
  checksum_sha256 TEXT,
  visibility      TEXT NOT NULL CHECK (visibility IN ('private','public','unlisted')),
  status          TEXT NOT NULL CHECK (status IN ('created','uploading','processing','ready','failed','deleted')),
  storage_backend TEXT NOT NULL CHECK (storage_backend IN ('local','s3')),
  storage_key     TEXT,
  poster_key      TEXT,
  thumbnail_key   TEXT,
  public_share_id TEXT UNIQUE,
  created_at      TIMESTAMPTZ NOT NULL,
  updated_at      TIMESTAMPTZ NOT NULL,
  deleted_at      TIMESTAMPTZ
);

CREATE UNIQUE INDEX clips_owner_client_clip_id_ux
  ON clips(owner_user_id, client_clip_id)
  WHERE client_clip_id IS NOT NULL;

CREATE TABLE clip_markers (
  id            TEXT PRIMARY KEY,
  clip_id       TEXT NOT NULL REFERENCES clips(id) ON DELETE CASCADE,
  kind          TEXT NOT NULL,
  label         TEXT,
  timestamp_ms  BIGINT NOT NULL,
  metadata_json JSONB,
  created_at    TIMESTAMPTZ NOT NULL
);

CREATE TABLE upload_sessions (
  id                  TEXT PRIMARY KEY,
  clip_id             TEXT NOT NULL REFERENCES clips(id),
  user_id             TEXT NOT NULL REFERENCES users(id),
  status              TEXT NOT NULL CHECK (status IN ('created','uploading','completed','aborted','failed')),
  expected_size_bytes BIGINT NOT NULL,
  received_size_bytes BIGINT NOT NULL DEFAULT 0,
  part_size_bytes     BIGINT,
  storage_key         TEXT NOT NULL,
  storage_upload_id   TEXT,
  checksum_sha256     TEXT,
  created_at          TIMESTAMPTZ NOT NULL,
  updated_at          TIMESTAMPTZ NOT NULL,
  completed_at        TIMESTAMPTZ,
  expires_at          TIMESTAMPTZ NOT NULL
);

CREATE TABLE upload_parts (
  upload_session_id TEXT NOT NULL REFERENCES upload_sessions(id) ON DELETE CASCADE,
  part_number       BIGINT NOT NULL,
  size_bytes        BIGINT NOT NULL,
  checksum_sha256   TEXT,
  etag              TEXT,
  received_at       TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (upload_session_id, part_number)
);

CREATE TABLE jobs (
  id           TEXT PRIMARY KEY,
  kind         TEXT NOT NULL,
  status       TEXT NOT NULL CHECK (status IN ('pending','running','succeeded','failed','dead')),
  target_type  TEXT,
  target_id    TEXT,
  attempts     BIGINT NOT NULL DEFAULT 0,
  max_attempts BIGINT NOT NULL DEFAULT 5,
  next_run_at  TIMESTAMPTZ NOT NULL,
  locked_by    TEXT,
  locked_at    TIMESTAMPTZ,
  last_error   TEXT,
  created_at   TIMESTAMPTZ NOT NULL,
  updated_at   TIMESTAMPTZ NOT NULL
);

CREATE TABLE audit_log (
  id            TEXT PRIMARY KEY,
  actor_user_id TEXT REFERENCES users(id),
  action        TEXT NOT NULL,
  target_type   TEXT,
  target_id     TEXT,
  ip_address    INET,
  metadata_json JSONB,
  created_at    TIMESTAMPTZ NOT NULL
);

CREATE INDEX clips_owner_recorded_at_idx  ON clips(owner_user_id, recorded_at DESC);
CREATE INDEX clips_owner_uploaded_at_idx  ON clips(owner_user_id, uploaded_at DESC);
CREATE INDEX clips_owner_game_idx         ON clips(owner_user_id, game_id);
CREATE INDEX clips_owner_visibility_idx   ON clips(owner_user_id, visibility);
CREATE INDEX clips_public_share_id_idx    ON clips(public_share_id);
CREATE INDEX jobs_status_next_run_idx     ON jobs(status, next_run_at);
