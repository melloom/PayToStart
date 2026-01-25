-- Run this SQL in Supabase Dashboard → SQL Editor to fix the 403 errors
-- Copy and paste this entire block into the SQL Editor and click Run

-- Fix: Allow contractors to read their own record directly
-- This fixes the circular dependency - the existing policy uses get_contractor_company_id()
-- which queries the contractors table, but that query is blocked by RLS!
-- This simpler policy allows direct access by auth.uid() without needing to query contractors first.

DROP POLICY IF EXISTS "Contractors can view their own record" ON contractors;

CREATE POLICY "Contractors can view their own record"
  ON contractors FOR SELECT
  USING (id = auth.uid());

