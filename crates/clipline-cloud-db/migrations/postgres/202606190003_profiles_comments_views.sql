ALTER TABLE users ADD COLUMN bio TEXT;
ALTER TABLE users ADD COLUMN avatar_key TEXT;

ALTER TABLE clips ADD COLUMN view_count BIGINT NOT NULL DEFAULT 0;

CREATE TABLE clip_comments (
  id         TEXT PRIMARY KEY,
  clip_id    TEXT NOT NULL REFERENCES clips(id) ON DELETE CASCADE,
  user_id    TEXT NOT NULL REFERENCES users(id),
  body       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  deleted_at TIMESTAMPTZ
);

CREATE INDEX clip_comments_clip_created_idx
  ON clip_comments(clip_id, created_at ASC, id ASC)
  WHERE deleted_at IS NULL;

CREATE INDEX clips_public_owner_uploaded_idx
  ON clips(owner_user_id, uploaded_at DESC, id DESC)
  WHERE visibility = 'public' AND status = 'ready' AND deleted_at IS NULL AND public_share_id IS NOT NULL;
