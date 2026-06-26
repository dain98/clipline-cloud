ALTER TABLE invitation_tokens ADD COLUMN claim_token_hash TEXT;
ALTER TABLE invitation_tokens ADD COLUMN claimed_at TIMESTAMPTZ;

CREATE UNIQUE INDEX invitation_tokens_claim_token_hash_idx
  ON invitation_tokens(claim_token_hash)
  WHERE claim_token_hash IS NOT NULL;
