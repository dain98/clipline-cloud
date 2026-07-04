ALTER TABLE app_settings ADD COLUMN user_storage_quota_bytes INTEGER
  CHECK (user_storage_quota_bytes IS NULL OR user_storage_quota_bytes >= 0);
