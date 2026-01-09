-- Fix RLS policy for contractors table
-- The existing policy has a circular dependency because get_contractor_company_id() 
-- queries the contractors table, which is blocked by RLS.
-- 
-- Add a simple policy that allows contractors to read their own record by auth.uid()

-- Drop the policy if it already exists (to allow re-running this migration)
DROP POLICY IF EXISTS "Contractors can view their own record" ON contractors;

-- Allow contractors to read their own record directly
CREATE POLICY "Contractors can view their own record"
  ON contractors FOR SELECT
  USING (id = auth.uid());

