CREATE TABLE invitation_tokens (
  id                 TEXT PRIMARY KEY,
  token_hash         TEXT NOT NULL UNIQUE,
  role               TEXT NOT NULL CHECK (role IN ('admin','user')),
  created_by_user_id TEXT REFERENCES users(id),
  created_at         TIMESTAMPTZ NOT NULL,
  expires_at         TIMESTAMPTZ NOT NULL,
  used_at            TIMESTAMPTZ
);

CREATE INDEX invitation_tokens_expires_at_idx ON invitation_tokens(expires_at);
CREATE INDEX invitation_tokens_created_by_idx ON invitation_tokens(created_by_user_id);
