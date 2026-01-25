-- Payment Providers Migration
-- Allows companies to connect multiple payment providers (Stripe, Venmo, Cash App, etc.)

-- Payment provider types enum
CREATE TYPE payment_provider_type AS ENUM (
  'stripe',
  'venmo',
  'cashapp',
  'paypal',
  'zelle',
  'bank_transfer',
  'other'
);

-- Payment provider status enum
CREATE TYPE payment_provider_status AS ENUM (
  'pending',
  'connected',
  'disconnected',
  'error'
);

-- Payment providers table
CREATE TABLE payment_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  provider_type payment_provider_type NOT NULL,
  provider_name TEXT NOT NULL, -- Display name (e.g., "Stripe", "Venmo Business")
  status payment_provider_status NOT NULL DEFAULT 'pending',
  is_default BOOLEAN DEFAULT false,
  
  -- Provider-specific connection data (stored as JSONB for flexibility)
  connection_data JSONB DEFAULT '{}'::jsonb,
  
  -- Stripe-specific fields (for backwards compatibility)
  stripe_customer_id TEXT,
  stripe_account_id TEXT,
  
  -- Metadata
  connected_at TIMESTAMPTZ,
  disconnected_at TIMESTAMPTZ,
  last_synced_at TIMESTAMPTZ,
  error_message TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure unique provider type per company (optional - remove if you want multiple of same type)
  UNIQUE(company_id, provider_type)
);

-- Indexes
CREATE INDEX idx_payment_providers_company_id ON payment_providers(company_id);
CREATE INDEX idx_payment_providers_status ON payment_providers(status);
CREATE INDEX idx_payment_providers_type ON payment_providers(provider_type);

-- Ensure only one default provider per company (partial unique index)
CREATE UNIQUE INDEX idx_payment_providers_one_default_per_company 
ON payment_providers(company_id) 
WHERE is_default = true;

-- Trigger for updated_at
CREATE TRIGGER update_payment_providers_updated_at BEFORE UPDATE ON payment_providers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE payment_providers ENABLE ROW LEVEL SECURITY;

-- Policy: Contractors can view payment providers for their company
CREATE POLICY "Contractors can view payment providers for their company"
  ON payment_providers
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM contractors WHERE id = auth.uid()
    )
  );

-- Policy: Contractors can insert payment providers for their company
CREATE POLICY "Contractors can insert payment providers for their company"
  ON payment_providers
  FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM contractors WHERE id = auth.uid()
    )
  );

-- Policy: Contractors can update payment providers for their company
CREATE POLICY "Contractors can update payment providers for their company"
  ON payment_providers
  FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM contractors WHERE id = auth.uid()
    )
  );

-- Policy: Contractors can delete payment providers for their company
CREATE POLICY "Contractors can delete payment providers for their company"
  ON payment_providers
  FOR DELETE
  USING (
    company_id IN (
      SELECT company_id FROM contractors WHERE id = auth.uid()
    )
  );

-- Migrate existing Stripe connections
-- This will create a payment_provider record for companies that already have Stripe connected
INSERT INTO payment_providers (
  company_id,
  provider_type,
  provider_name,
  status,
  is_default,
  stripe_customer_id,
  connection_data,
  connected_at
)
SELECT 
  id,
  'stripe'::payment_provider_type,
  'Stripe',
  CASE 
    WHEN subscription_stripe_customer_id IS NOT NULL THEN 'connected'::payment_provider_status
    ELSE 'pending'::payment_provider_status
  END,
  true, -- Make existing Stripe connections default
  subscription_stripe_customer_id,
  jsonb_build_object(
    'subscription_id', subscription_stripe_subscription_id,
    'customer_id', subscription_stripe_customer_id
  ),
  created_at
FROM companies
WHERE subscription_stripe_customer_id IS NOT NULL
ON CONFLICT (company_id, provider_type) DO NOTHING;
