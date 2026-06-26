ALTER TABLE clip_comments ADD COLUMN parent_comment_id TEXT REFERENCES clip_comments(id) ON DELETE CASCADE;

CREATE INDEX clip_comments_parent_created_idx
  ON clip_comments(parent_comment_id, created_at ASC, id ASC)
  WHERE deleted_at IS NULL;
