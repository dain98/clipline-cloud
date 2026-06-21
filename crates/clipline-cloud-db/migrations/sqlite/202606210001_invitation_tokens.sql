CREATE TABLE invitation_tokens (
  id                 TEXT PRIMARY KEY,
  token_hash         TEXT NOT NULL UNIQUE,
  role               TEXT NOT NULL CHECK (role IN ('admin','user')),
  created_by_user_id TEXT REFERENCES users(id),
  created_at         TEXT NOT NULL,
  expires_at         TEXT NOT NULL,
  used_at            TEXT
);

CREATE INDEX invitation_tokens_expires_at_idx ON invitation_tokens(expires_at);
CREATE INDEX invitation_tokens_created_by_idx ON invitation_tokens(created_by_user_id);
