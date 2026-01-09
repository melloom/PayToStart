-- Update free tier contract limit to 3 contracts (ever, not per month)
-- This allows Basic plan users to create up to 3 contracts total

-- First, update get_usage_count to handle free tier contracts (lifetime total)
CREATE OR REPLACE FUNCTION get_usage_count(
  company_uuid UUID,
  counter_type_val TEXT
)
RETURNS INTEGER AS $$
DECLARE
  period_start_val TIMESTAMPTZ;
  period_end_val TIMESTAMPTZ;
  current_count INTEGER;
  current_tier subscription_tier;
BEGIN
  -- Get current tier
  SELECT subscription_tier INTO current_tier
  FROM companies
  WHERE id = company_uuid;

  IF current_tier IS NULL THEN
    current_tier := 'free';
  END IF;

  -- For free tier contracts, count ALL contracts ever (not per period)
  IF counter_type_val = 'contracts' AND current_tier = 'free' THEN
    SELECT COALESCE(SUM(count), 0) INTO current_count
    FROM usage_counters
    WHERE company_id = company_uuid
      AND counter_type = 'contracts';
    RETURN COALESCE(current_count, 0);
  END IF;

  -- For other tiers or other counter types, use per-period counting
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

-- Now update check_tier_limit function
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
        WHEN 'free' THEN tier_limit := 3; -- Free plan: 3 contracts ever
        WHEN 'starter' THEN tier_limit := 20; -- Starter: 20 contracts per month
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
  IF limit_type_val = 'contracts' AND current_tier = 'free' THEN
    -- For free tier contracts, count ALL contracts ever (not per period)
    -- Sum all usage counters for contracts regardless of period
    SELECT COALESCE(SUM(count), 0) INTO current_count
    FROM usage_counters
    WHERE company_id = company_uuid
      AND counter_type = 'contracts';
  ELSIF limit_type_val IN ('templates', 'contracts') THEN
    -- For other tiers or templates, use per-period counting
    SELECT get_usage_count(company_uuid, limit_type_val) INTO current_count;
  ELSE
    -- For company count, check actual count
    SELECT COUNT(*) INTO current_count FROM companies WHERE id = company_uuid;
  END IF;

  -- Check if adding required_count would exceed limit
  RETURN (current_count + required_count_val) <= tier_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

