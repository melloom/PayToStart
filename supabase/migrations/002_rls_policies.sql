-- Enable Row Level Security on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- Helper function to get contractor's company_id
CREATE OR REPLACE FUNCTION get_contractor_company_id()
RETURNS UUID AS $$
  SELECT company_id FROM contractors WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER;

-- Companies policies
CREATE POLICY "Contractors can view their own company"
  ON companies FOR SELECT
  USING (id = get_contractor_company_id());

-- Contractors policies
CREATE POLICY "Contractors can view their own company contractors"
  ON contractors FOR SELECT
  USING (company_id = get_contractor_company_id());

CREATE POLICY "Contractors can insert themselves"
  ON contractors FOR INSERT
  WITH CHECK (id = auth.uid() AND company_id = get_contractor_company_id());

CREATE POLICY "Contractors can update themselves"
  ON contractors FOR UPDATE
  USING (id = auth.uid() AND company_id = get_contractor_company_id());

-- Clients policies
CREATE POLICY "Contractors can view clients in their company"
  ON clients FOR SELECT
  USING (company_id = get_contractor_company_id());

CREATE POLICY "Contractors can insert clients in their company"
  ON clients FOR INSERT
  WITH CHECK (company_id = get_contractor_company_id());

CREATE POLICY "Contractors can update clients in their company"
  ON clients FOR UPDATE
  USING (company_id = get_contractor_company_id());

CREATE POLICY "Contractors can delete clients in their company"
  ON clients FOR DELETE
  USING (company_id = get_contractor_company_id());

-- Contract templates policies
CREATE POLICY "Contractors can view templates in their company"
  ON contract_templates FOR SELECT
  USING (company_id = get_contractor_company_id());

CREATE POLICY "Contractors can insert templates in their company"
  ON contract_templates FOR INSERT
  WITH CHECK (company_id = get_contractor_company_id() AND contractor_id = auth.uid());

CREATE POLICY "Contractors can update templates in their company"
  ON contract_templates FOR UPDATE
  USING (company_id = get_contractor_company_id());

CREATE POLICY "Contractors can delete templates in their company"
  ON contract_templates FOR DELETE
  USING (company_id = get_contractor_company_id());

-- Contracts policies
CREATE POLICY "Contractors can view contracts in their company"
  ON contracts FOR SELECT
  USING (company_id = get_contractor_company_id());

-- Remove public read access - contracts are accessed via signing token in application code
-- Application validates token before returning contract data
-- This prevents anonymous table scans

CREATE POLICY "Contractors can insert contracts in their company"
  ON contracts FOR INSERT
  WITH CHECK (company_id = get_contractor_company_id() AND contractor_id = auth.uid());

CREATE POLICY "Contractors can update contracts in their company"
  ON contracts FOR UPDATE
  USING (company_id = get_contractor_company_id());

-- Payments policies
CREATE POLICY "Contractors can view payments in their company"
  ON payments FOR SELECT
  USING (company_id = get_contractor_company_id());

CREATE POLICY "Contractors can insert payments in their company"
  ON payments FOR INSERT
  WITH CHECK (company_id = get_contractor_company_id());

CREATE POLICY "Contractors can update payments in their company"
  ON payments FOR UPDATE
  USING (company_id = get_contractor_company_id());

-- Signatures policies
CREATE POLICY "Contractors can view signatures in their company"
  ON signatures FOR SELECT
  USING (company_id = get_contractor_company_id());

-- Remove public insert access - signatures are created via authenticated API endpoints
-- Application validates signing_token before allowing signature creation

-- Attachments policies
CREATE POLICY "Contractors can view attachments in their company"
  ON attachments FOR SELECT
  USING (company_id = get_contractor_company_id());

CREATE POLICY "Contractors can insert attachments in their company"
  ON attachments FOR INSERT
  WITH CHECK (company_id = get_contractor_company_id() AND uploaded_by = auth.uid());

CREATE POLICY "Contractors can delete attachments in their company"
  ON attachments FOR DELETE
  USING (company_id = get_contractor_company_id());

