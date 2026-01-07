-- Add signature metadata fields to signatures table
-- Run this if you've already run 001_initial_schema.sql without these fields

ALTER TABLE signatures
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS ip_address TEXT,
ADD COLUMN IF NOT EXISTS user_agent TEXT,
ADD COLUMN IF NOT EXISTS contract_hash TEXT;

-- Update existing signatures to have required fields
UPDATE signatures
SET full_name = COALESCE(full_name, 'Unknown'),
    ip_address = COALESCE(ip_address, 'unknown'),
    user_agent = COALESCE(user_agent, 'unknown'),
    contract_hash = COALESCE(contract_hash, '')
WHERE full_name IS NULL OR contract_hash IS NULL;

-- Make full_name and contract_hash NOT NULL after updating
ALTER TABLE signatures
ALTER COLUMN full_name SET NOT NULL,
ALTER COLUMN contract_hash SET NOT NULL;

-- Make signature_url nullable (typed name only is valid)
ALTER TABLE signatures
ALTER COLUMN signature_url DROP NOT NULL;

