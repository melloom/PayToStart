-- Support both client and contractor signatures
-- Make client_id nullable and add contractor_id field

-- First, drop the existing foreign key constraint
ALTER TABLE signatures
DROP CONSTRAINT IF EXISTS signatures_client_id_fkey;

-- Make client_id nullable
ALTER TABLE signatures
ALTER COLUMN client_id DROP NOT NULL;

-- Add contractor_id field
ALTER TABLE signatures
ADD COLUMN IF NOT EXISTS contractor_id UUID REFERENCES contractors(id) ON DELETE CASCADE;

-- Add check constraint to ensure one of client_id or contractor_id is set
ALTER TABLE signatures
ADD CONSTRAINT signatures_signer_check 
CHECK (
  (client_id IS NOT NULL AND contractor_id IS NULL) OR 
  (client_id IS NULL AND contractor_id IS NOT NULL)
);

-- Re-add foreign key constraint for client_id (now nullable)
ALTER TABLE signatures
ADD CONSTRAINT signatures_client_id_fkey 
FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

-- Add index for contractor_id lookups
CREATE INDEX IF NOT EXISTS idx_signatures_contractor_id ON signatures(contractor_id);
