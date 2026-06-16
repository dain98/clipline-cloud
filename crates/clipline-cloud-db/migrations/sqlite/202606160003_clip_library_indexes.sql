CREATE INDEX clips_owner_status_idx ON clips(owner_user_id, status);
CREATE INDEX clips_owner_duration_idx ON clips(owner_user_id, duration_ms);
CREATE INDEX clips_owner_title_idx ON clips(owner_user_id, title);
