-- Add password protection for contracts
-- Allows contractors to set a password that clients must enter to view and sign contracts

-- Add password_hash column to contracts table
ALTER TABLE contracts 
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Add comment explaining the column
COMMENT ON COLUMN contracts.password_hash IS 'SHA256 hash of the password required to access this contract. NULL means no password protection.';

-- Create index for performance (though password lookups are rare)
CREATE INDEX IF NOT EXISTS idx_contracts_password_hash ON contracts(password_hash) WHERE password_hash IS NOT NULL;
