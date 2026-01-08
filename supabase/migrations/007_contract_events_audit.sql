-- Contract Events Audit Log Table
-- Tracks all important contract state changes for audit and debugging

CREATE TABLE IF NOT EXISTS contract_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'created',
    'sent',
    'signed',
    'payment_initiated',
    'payment_completed',
    'paid',
    'finalized',
    'completed',
    'voided',
    'content_updated',
    'status_changed'
  )),
  actor_type TEXT NOT NULL CHECK (actor_type IN ('contractor', 'client', 'system', 'webhook')),
  actor_id UUID, -- contractor_id or client_id depending on actor_type
  metadata JSONB DEFAULT '{}'::jsonb, -- Additional event data (IP, user agent, etc.)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_contract_events_contract_id ON contract_events(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_events_company_id ON contract_events(company_id);
CREATE INDEX IF NOT EXISTS idx_contract_events_event_type ON contract_events(event_type);
CREATE INDEX IF NOT EXISTS idx_contract_events_created_at ON contract_events(created_at);

-- RLS policies for contract_events
ALTER TABLE contract_events ENABLE ROW LEVEL SECURITY;

-- Contractors can view events for contracts in their company
CREATE POLICY "Contractors can view events in their company"
  ON contract_events FOR SELECT
  USING (company_id = (
    SELECT company_id FROM contractors WHERE id = auth.uid()
  ));

-- Only system/backend can insert events (via service role)
-- This prevents tampering with audit logs
-- Application code will use service role to insert events

-- Helper function to log contract events (called from application code)
CREATE OR REPLACE FUNCTION log_contract_event(
  p_contract_id UUID,
  p_event_type TEXT,
  p_actor_type TEXT,
  p_actor_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  v_company_id UUID;
  v_event_id UUID;
BEGIN
  -- Get company_id from contract
  SELECT company_id INTO v_company_id
  FROM contracts
  WHERE id = p_contract_id;

  IF v_company_id IS NULL THEN
    RAISE EXCEPTION 'Contract not found: %', p_contract_id;
  END IF;

  -- Insert event
  INSERT INTO contract_events (
    contract_id,
    company_id,
    event_type,
    actor_type,
    actor_id,
    metadata
  )
  VALUES (
    p_contract_id,
    v_company_id,
    p_event_type,
    p_actor_type,
    p_actor_id,
    p_metadata
  )
  RETURNING id INTO v_event_id;

  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

