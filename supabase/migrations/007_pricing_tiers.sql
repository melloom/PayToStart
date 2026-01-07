-- Pricing tiers migration
-- Adds subscription management and usage counters

-- Subscription tiers enum
CREATE TYPE subscription_tier AS ENUM ('starter', 'pro', 'premium', 'free');

-- Add subscription fields to companies table
ALTER TABLE companies
ADD COLUMN subscription_tier subscription_tier NOT NULL DEFAULT 'free',
ADD COLUMN subscription_stripe_subscription_id TEXT,
ADD COLUMN subscription_stripe_customer_id TEXT,
ADD COLUMN subscription_current_period_start TIMESTAMPTZ,
ADD COLUMN subscription_current_period_end TIMESTAMPTZ,
ADD COLUMN subscription_status TEXT DEFAULT 'active',
ADD COLUMN subscription_cancel_at_period_end BOOLEAN DEFAULT false;

-- Usage counters table - tracks monthly usage per company
CREATE TABLE usage_counters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  counter_type TEXT NOT NULL, -- 'contracts', 'templates', 'sms_sent', etc.
  period_start TIMESTAMPTZ NOT NULL, -- Start of billing period
  period_end TIMESTAMPTZ NOT NULL, -- End of billing period
  count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, counter_type, period_start)
);

-- Indexes for usage counters
CREATE INDEX idx_usage_counters_company_id ON usage_counters(company_id);
CREATE INDEX idx_usage_counters_type_period ON usage_counters(company_id, counter_type, period_start, period_end);

-- Function to get current billing period start/end for a company
CREATE OR REPLACE FUNCTION get_current_billing_period(company_uuid UUID)
RETURNS TABLE(period_start TIMESTAMPTZ, period_end TIMESTAMPTZ) AS $$
DECLARE
  sub_start TIMESTAMPTZ;
  sub_end TIMESTAMPTZ;
  period_start_val TIMESTAMPTZ;
  period_end_val TIMESTAMPTZ;
BEGIN
  SELECT subscription_current_period_start, subscription_current_period_end
  INTO sub_start, sub_end
  FROM companies
  WHERE id = company_uuid;

  -- If subscription period is set, use it
  IF sub_start IS NOT NULL AND sub_end IS NOT NULL THEN
    period_start_val := sub_start;
    period_end_val := sub_end;
  ELSE
    -- Default to calendar month
    period_start_val := date_trunc('month', NOW());
    period_end_val := (date_trunc('month', NOW()) + interval '1 month' - interval '1 day')::date + time '23:59:59';
  END IF;

  period_start := period_start_val;
  period_end := period_end_val;
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Function to increment usage counter
CREATE OR REPLACE FUNCTION increment_usage_counter(
  company_uuid UUID,
  counter_type_val TEXT
)
RETURNS INTEGER AS $$
DECLARE
  period_start_val TIMESTAMPTZ;
  period_end_val TIMESTAMPTZ;
  current_count INTEGER;
BEGIN
  -- Get current billing period
  SELECT period_start, period_end INTO period_start_val, period_end_val
  FROM get_current_billing_period(company_uuid);

  -- Upsert usage counter
  INSERT INTO usage_counters (company_id, counter_type, period_start, period_end, count)
  VALUES (company_uuid, counter_type_val, period_start_val, period_end_val, 1)
  ON CONFLICT (company_id, counter_type, period_start)
  DO UPDATE SET
    count = usage_counters.count + 1,
    updated_at = NOW()
  RETURNING count INTO current_count;

  RETURN current_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current usage count
CREATE OR REPLACE FUNCTION get_usage_count(
  company_uuid UUID,
  counter_type_val TEXT
)
RETURNS INTEGER AS $$
DECLARE
  period_start_val TIMESTAMPTZ;
  period_end_val TIMESTAMPTZ;
  current_count INTEGER;
BEGIN
  -- Get current billing period
  SELECT period_start, period_end INTO period_start_val, period_end_val
  FROM get_current_billing_period(company_uuid);

  -- Get current count
  SELECT COALESCE(count, 0) INTO current_count
  FROM usage_counters
  WHERE company_id = company_uuid
    AND counter_type = counter_type_val
    AND period_start = period_start_val
    AND period_end = period_end_val;

  RETURN COALESCE(current_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at for usage_counters
CREATE TRIGGER update_usage_counters_updated_at BEFORE UPDATE ON usage_counters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS policies for usage_counters (same as companies)
ALTER TABLE usage_counters ENABLE ROW LEVEL SECURITY;

-- Policy: Contractors can view usage counters for their company
CREATE POLICY "Contractors can view usage counters for their company"
  ON usage_counters FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM contractors WHERE id = auth.uid()
    )
  );

-- Policy: System can insert/update usage counters (via SECURITY DEFINER functions)
CREATE POLICY "System can manage usage counters"
  ON usage_counters FOR ALL
  USING (true)
  WITH CHECK (true);

-- Helper function to check if company can perform action (for tier limits)
CREATE OR REPLACE FUNCTION check_tier_limit(
  company_uuid UUID,
  limit_type_val TEXT,
  required_count_val INTEGER DEFAULT 1
)
RETURNS BOOLEAN AS $$
DECLARE
  current_tier subscription_tier;
  current_count INTEGER;
  tier_limit INTEGER;
BEGIN
  -- Get current tier
  SELECT subscription_tier INTO current_tier
  FROM companies
  WHERE id = company_uuid;

  IF current_tier IS NULL THEN
    current_tier := 'free';
  END IF;

  -- Define tier limits
  CASE limit_type_val
    WHEN 'templates' THEN
      CASE current_tier
        WHEN 'starter' THEN tier_limit := 2;
        WHEN 'pro', 'premium' THEN tier_limit := 999999; -- Unlimited
        ELSE tier_limit := 0;
      END CASE;
    WHEN 'contracts' THEN
      CASE current_tier
        WHEN 'starter' THEN tier_limit := 20;
        WHEN 'pro', 'premium' THEN tier_limit := 999999; -- Unlimited
        ELSE tier_limit := 0;
      END CASE;
    WHEN 'companies' THEN
      CASE current_tier
        WHEN 'starter' THEN tier_limit := 1;
        WHEN 'pro', 'premium' THEN tier_limit := 999999; -- Unlimited (but not really multi-company)
        ELSE tier_limit := 0;
      END CASE;
    ELSE
      tier_limit := 0;
  END CASE;

  -- If unlimited (999999), allow
  IF tier_limit = 999999 THEN
    RETURN true;
  END IF;

  -- Get current usage
  IF limit_type_val IN ('templates', 'contracts') THEN
    SELECT get_usage_count(company_uuid, limit_type_val) INTO current_count;
  ELSE
    -- For company count, check actual count
    SELECT COUNT(*) INTO current_count FROM companies WHERE id = company_uuid;
  END IF;

  -- Check if adding required_count would exceed limit
  RETURN (current_count + required_count_val) <= tier_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

