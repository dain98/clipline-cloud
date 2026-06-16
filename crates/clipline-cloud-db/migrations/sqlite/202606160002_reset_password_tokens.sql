CREATE TABLE reset_password_tokens (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id),
  token_hash TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used_at    TEXT
);

CREATE INDEX reset_password_tokens_user_idx ON reset_password_tokens(user_id);
CREATE INDEX reset_password_tokens_expires_at_idx ON reset_password_tokens(expires_at);
