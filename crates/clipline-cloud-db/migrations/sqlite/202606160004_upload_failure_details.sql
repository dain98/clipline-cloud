ALTER TABLE upload_sessions ADD COLUMN failure_reason TEXT;
ALTER TABLE upload_sessions ADD COLUMN failed_at TEXT;

DROP INDEX clips_owner_client_clip_id_ux;
CREATE UNIQUE INDEX clips_owner_client_clip_id_ux
  ON clips(owner_user_id, client_clip_id)
  WHERE client_clip_id IS NOT NULL AND deleted_at IS NULL AND status <> 'deleted';
