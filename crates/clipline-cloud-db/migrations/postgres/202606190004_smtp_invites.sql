ALTER TABLE users ADD COLUMN email TEXT;

CREATE UNIQUE INDEX users_email_unique_idx ON users(email) WHERE email IS NOT NULL;

ALTER TABLE app_settings ADD COLUMN smtp_enabled BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE app_settings ADD COLUMN smtp_host TEXT;
ALTER TABLE app_settings ADD COLUMN smtp_port BIGINT NOT NULL DEFAULT 587 CHECK (smtp_port > 0 AND smtp_port <= 65535);
ALTER TABLE app_settings ADD COLUMN smtp_tls_mode TEXT NOT NULL DEFAULT 'starttls' CHECK (smtp_tls_mode IN ('starttls','tls','none'));
ALTER TABLE app_settings ADD COLUMN smtp_username TEXT;
ALTER TABLE app_settings ADD COLUMN smtp_password TEXT;
ALTER TABLE app_settings ADD COLUMN smtp_from_email TEXT;
ALTER TABLE app_settings ADD COLUMN smtp_from_name TEXT;
