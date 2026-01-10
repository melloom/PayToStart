-- Create drafts tables for contracts and templates
-- These allow users to save work-in-progress before finalizing

-- Contract drafts table
CREATE TABLE IF NOT EXISTS contract_drafts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  contractor_id UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  template_id UUID REFERENCES contract_templates(id) ON DELETE SET NULL,
  title TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  field_values JSONB DEFAULT '{}'::jsonb,
  custom_fields JSONB DEFAULT '[]'::jsonb,
  deposit_amount DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb, -- Store additional data like branding, etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Template drafts table
CREATE TABLE IF NOT EXISTS template_drafts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  contractor_id UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  fields JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_contract_drafts_contractor_id ON contract_drafts(contractor_id);
CREATE INDEX idx_contract_drafts_company_id ON contract_drafts(company_id);
CREATE INDEX idx_contract_drafts_updated_at ON contract_drafts(updated_at DESC);
CREATE INDEX idx_template_drafts_contractor_id ON template_drafts(contractor_id);
CREATE INDEX idx_template_drafts_company_id ON template_drafts(company_id);
CREATE INDEX idx_template_drafts_updated_at ON template_drafts(updated_at DESC);

-- Triggers for updated_at
CREATE TRIGGER update_contract_drafts_updated_at BEFORE UPDATE ON contract_drafts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_template_drafts_updated_at BEFORE UPDATE ON template_drafts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for contract_drafts
ALTER TABLE contract_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contractors can view their own contract drafts"
  ON contract_drafts FOR SELECT
  USING (
    contractor_id = auth.uid() AND
    company_id = (SELECT company_id FROM contractors WHERE id = auth.uid())
  );

CREATE POLICY "Contractors can create their own contract drafts"
  ON contract_drafts FOR INSERT
  WITH CHECK (
    contractor_id = auth.uid() AND
    company_id = (SELECT company_id FROM contractors WHERE id = auth.uid())
  );

CREATE POLICY "Contractors can update their own contract drafts"
  ON contract_drafts FOR UPDATE
  USING (
    contractor_id = auth.uid() AND
    company_id = (SELECT company_id FROM contractors WHERE id = auth.uid())
  )
  WITH CHECK (
    contractor_id = auth.uid() AND
    company_id = (SELECT company_id FROM contractors WHERE id = auth.uid())
  );

CREATE POLICY "Contractors can delete their own contract drafts"
  ON contract_drafts FOR DELETE
  USING (
    contractor_id = auth.uid() AND
    company_id = (SELECT company_id FROM contractors WHERE id = auth.uid())
  );

-- RLS Policies for template_drafts
ALTER TABLE template_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contractors can view their own template drafts"
  ON template_drafts FOR SELECT
  USING (
    contractor_id = auth.uid() AND
    company_id = (SELECT company_id FROM contractors WHERE id = auth.uid())
  );

CREATE POLICY "Contractors can create their own template drafts"
  ON template_drafts FOR INSERT
  WITH CHECK (
    contractor_id = auth.uid() AND
    company_id = (SELECT company_id FROM contractors WHERE id = auth.uid())
  );

CREATE POLICY "Contractors can update their own template drafts"
  ON template_drafts FOR UPDATE
  USING (
    contractor_id = auth.uid() AND
    company_id = (SELECT company_id FROM contractors WHERE id = auth.uid())
  )
  WITH CHECK (
    contractor_id = auth.uid() AND
    company_id = (SELECT company_id FROM contractors WHERE id = auth.uid())
  );

CREATE POLICY "Contractors can delete their own template drafts"
  ON template_drafts FOR DELETE
  USING (
    contractor_id = auth.uid() AND
    company_id = (SELECT company_id FROM contractors WHERE id = auth.uid())
  );


