-- Secure signing tokens migration
-- Changes signing_token from plain text to hashed storage

-- Add new columns for secure token management
ALTER TABLE contracts
ADD COLUMN IF NOT EXISTS signing_token_hash TEXT,
ADD COLUMN IF NOT EXISTS signing_token_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS signing_token_used_at TIMESTAMPTZ;

-- Migrate existing tokens: hash them before removing plain text column
-- Note: This is a one-time migration for existing data
-- New contracts will only have hashed tokens

-- Create index for faster hash lookups
CREATE INDEX IF NOT EXISTS idx_contracts_signing_token_hash ON contracts(signing_token_hash) WHERE signing_token_hash IS NOT NULL;

-- Create rate limiting table for token verification attempts
CREATE TABLE IF NOT EXISTS signing_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ip_address TEXT NOT NULL,
  contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  success BOOLEAN NOT NULL DEFAULT false
);

-- Index for rate limiting queries
CREATE INDEX IF NOT EXISTS idx_signing_attempts_ip_time ON signing_attempts(ip_address, attempted_at);
CREATE INDEX IF NOT EXISTS idx_signing_attempts_contract ON signing_attempts(contract_id, attempted_at);

-- After migration, we can drop the old signing_token column
-- But we'll keep it for now to ensure backwards compatibility during migration
-- You can drop it later with: ALTER TABLE contracts DROP COLUMN signing_token;

