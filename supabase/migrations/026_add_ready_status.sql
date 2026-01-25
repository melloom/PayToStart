-- Add "ready" status to contracts table
-- This status indicates a contract is complete and ready to send (distinct from "draft" which is incomplete)

-- Drop the old constraint
ALTER TABLE contracts DROP CONSTRAINT IF EXISTS contracts_status_check;

-- Add the new constraint with "ready" status
ALTER TABLE contracts ADD CONSTRAINT contracts_status_check 
  CHECK (status IN ('draft', 'ready', 'sent', 'signed', 'paid', 'completed', 'cancelled'));

-- Update any existing contracts that should be "ready" instead of "draft"
-- (This is optional - existing drafts can stay as drafts)
-- Uncomment if you want to migrate existing complete contracts:
-- UPDATE contracts 
-- SET status = 'ready' 
-- WHERE status = 'draft' 
--   AND content IS NOT NULL 
--   AND content != '' 
--   AND title IS NOT NULL 
--   AND title != '';
