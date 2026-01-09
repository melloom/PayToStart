-- Add UPDATE policy for companies table
-- This allows contractors to update their own company (e.g., for plan selection)

CREATE POLICY "Contractors can update their own company"
  ON companies FOR UPDATE
  USING (id = get_contractor_company_id())
  WITH CHECK (id = get_contractor_company_id());

