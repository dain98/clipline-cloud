ALTER TABLE users ADD COLUMN storage_quota_bytes BIGINT CHECK (storage_quota_bytes IS NULL OR storage_quota_bytes >= 0);

CREATE TABLE app_settings (
  id                    BIGINT PRIMARY KEY CHECK (id = 1),
  owner_user_id         TEXT REFERENCES users(id),
  allow_vod_uploads     BOOLEAN NOT NULL DEFAULT TRUE,
  vod_threshold_minutes BIGINT NOT NULL DEFAULT 30 CHECK (vod_threshold_minutes > 0),
  about_text            TEXT NOT NULL,
  created_at            TIMESTAMPTZ NOT NULL,
  updated_at            TIMESTAMPTZ NOT NULL
);

INSERT INTO app_settings (
  id,
  owner_user_id,
  allow_vod_uploads,
  vod_threshold_minutes,
  about_text,
  created_at,
  updated_at
)
VALUES (
  1,
  (SELECT id FROM users WHERE role = 'admin' ORDER BY created_at ASC, id ASC LIMIT 1),
  TRUE,
  30,
  'Self-hosted clip sharing for Clipline. Upload clips from the desktop app, manage your own library, and share public links without relying on a hosted service.',
  NOW(),
  NOW()
);
