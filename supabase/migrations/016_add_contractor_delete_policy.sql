-- Add RLS policy to allow contractors to delete their own account
-- This is needed for the account deletion feature

-- Drop the policy if it already exists (to allow re-running this migration)
DROP POLICY IF EXISTS "Contractors can delete their own account" ON contractors;

-- Allow contractors to delete their own record
CREATE POLICY "Contractors can delete their own account"
  ON contractors FOR DELETE
  USING (id = auth.uid());

