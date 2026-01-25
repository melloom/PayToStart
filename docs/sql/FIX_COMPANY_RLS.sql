-- Fix RLS policy for companies table
-- The existing policy uses get_contractor_company_id() which has a circular dependency
-- Add a simpler policy that allows contractors to read their own company directly

DROP POLICY IF EXISTS "Contractors can view their own company by id" ON companies;

CREATE POLICY "Contractors can view their own company by id"
  ON companies FOR SELECT
  USING (id IN (
    SELECT company_id FROM contractors WHERE id = auth.uid()
  ));

