-- Add contract_type field to contract_templates and default_contract_templates
-- This allows templates to be categorized as "contract" (client pays) or "proposal" (contractor pays)

-- Add contract_type to contract_templates (user-created templates)
ALTER TABLE contract_templates 
ADD COLUMN IF NOT EXISTS contract_type TEXT DEFAULT 'contract' CHECK (contract_type IN ('contract', 'proposal'));

-- Add contract_type to default_contract_templates (system templates)
ALTER TABLE default_contract_templates 
ADD COLUMN IF NOT EXISTS contract_type TEXT DEFAULT 'contract' CHECK (contract_type IN ('contract', 'proposal'));

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_contract_templates_contract_type ON contract_templates(contract_type);
CREATE INDEX IF NOT EXISTS idx_default_contract_templates_contract_type ON default_contract_templates(contract_type);

-- Update existing templates to have 'contract' as default (they're already contracts)
UPDATE contract_templates SET contract_type = 'contract' WHERE contract_type IS NULL;
UPDATE default_contract_templates SET contract_type = 'contract' WHERE contract_type IS NULL;
