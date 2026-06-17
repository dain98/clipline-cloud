CREATE INDEX clips_owner_source_type_idx ON clips(owner_user_id, source_type);
CREATE INDEX clips_owner_game_name_idx ON clips(owner_user_id, game_name);
CREATE INDEX clips_owner_file_size_idx ON clips(owner_user_id, file_size_bytes);
CREATE INDEX clips_owner_created_at_idx ON clips(owner_user_id, created_at);
CREATE INDEX clips_owner_updated_at_idx ON clips(owner_user_id, updated_at);
