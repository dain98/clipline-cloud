ALTER TABLE users ADD COLUMN storage_quota_bytes INTEGER CHECK (storage_quota_bytes IS NULL OR storage_quota_bytes >= 0);

CREATE TABLE app_settings (
  id                    INTEGER PRIMARY KEY CHECK (id = 1),
  owner_user_id         TEXT REFERENCES users(id),
  allow_vod_uploads     INTEGER NOT NULL DEFAULT 1 CHECK (allow_vod_uploads IN (0,1)),
  vod_threshold_minutes INTEGER NOT NULL DEFAULT 30 CHECK (vod_threshold_minutes > 0),
  about_text            TEXT NOT NULL,
  created_at            TEXT NOT NULL,
  updated_at            TEXT NOT NULL
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
  1,
  30,
  'Self-hosted clip sharing for Clipline. Upload clips from the desktop app, manage your own library, and share public links without relying on a hosted service.',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);
