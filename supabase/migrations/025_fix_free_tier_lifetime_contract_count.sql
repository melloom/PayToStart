-- Fix free tier contract counting to be lifetime (not per period)
-- Free tier users get 3 contracts lifetime, and deletions don't reduce the count

-- Update get_usage_count to handle free tier differently
CREATE OR REPLACE FUNCTION get_usage_count(
  company_uuid UUID,
  counter_type_val TEXT
)
RETURNS INTEGER AS $$
DECLARE
  current_tier subscription_tier;
  period_start_val TIMESTAMPTZ;
  period_end_val TIMESTAMPTZ;
  current_count INTEGER;
BEGIN
  -- Get current tier
  SELECT subscription_tier INTO current_tier
  FROM companies
  WHERE id = company_uuid;

  IF current_tier IS NULL THEN
    current_tier := 'free';
  END IF;

  -- For free tier contracts, count ALL contracts ever created (lifetime)
  -- This includes deleted/voided contracts - once created, it counts forever
  IF current_tier = 'free' AND counter_type_val = 'contracts' THEN
    SELECT COUNT(*) INTO current_count
    FROM contracts
    WHERE company_id = company_uuid;
    -- Note: We count ALL contracts regardless of status (sent, completed, cancelled, etc.)
    -- Once a contract is created, it counts toward the lifetime limit even if deleted
    
    RETURN COALESCE(current_count, 0);
  END IF;

  -- For paid tiers or other counter types, use billing period
  SELECT period_start, period_end INTO period_start_val, period_end_val
  FROM get_current_billing_period(company_uuid);

  -- Get current count for the billing period
  SELECT COALESCE(count, 0) INTO current_count
  FROM usage_counters
  WHERE company_id = company_uuid
    AND counter_type = counter_type_val
    AND period_start = period_start_val
    AND period_end = period_end_val;

  RETURN COALESCE(current_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update check_tier_limit to use lifetime count for free tier contracts
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
        WHEN 'free' THEN tier_limit := 3; -- Free plan: 3 contracts lifetime
        WHEN 'starter' THEN tier_limit := 20; -- Starter: 20 contracts per month
        WHEN 'pro', 'premium' THEN tier_limit := 999999; -- Unlimited
        ELSE tier_limit := 0;
      END CASE;
    WHEN 'companies' THEN
      CASE current_tier
        WHEN 'starter' THEN tier_limit := 1;
        WHEN 'pro', 'premium' THEN tier_limit := 999999; -- Unlimited
        ELSE tier_limit := 0;
      END CASE;
    ELSE
      tier_limit := 0;
  END CASE;

  -- If unlimited (999999), allow
  IF tier_limit = 999999 THEN
    RETURN true;
  END IF;

  -- Get current usage (this will use lifetime count for free tier contracts)
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

-- Update increment_usage_counter to handle free tier contracts
-- For free tier, we still increment the counter but it's tracked differently
CREATE OR REPLACE FUNCTION increment_usage_counter(
  company_uuid UUID,
  counter_type_val TEXT
)
RETURNS INTEGER AS $$
DECLARE
  current_tier subscription_tier;
  period_start_val TIMESTAMPTZ;
  period_end_val TIMESTAMPTZ;
  current_count INTEGER;
BEGIN
  -- Get current tier
  SELECT subscription_tier INTO current_tier
  FROM companies
  WHERE id = company_uuid;

  IF current_tier IS NULL THEN
    current_tier := 'free';
  END IF;

  -- For free tier contracts, we don't use usage_counters table
  -- The count is done directly from contracts table in get_usage_count
  -- But we still increment the counter for consistency and tracking
  IF current_tier = 'free' AND counter_type_val = 'contracts' THEN
    -- Still create/update a counter entry for tracking purposes
    -- Use a special "lifetime" period
    period_start_val := '1970-01-01'::timestamptz;
    period_end_val := '2099-12-31'::timestamptz;
    
    INSERT INTO usage_counters (company_id, counter_type, period_start, period_end, count)
    VALUES (company_uuid, counter_type_val, period_start_val, period_end_val, 1)
    ON CONFLICT (company_id, counter_type, period_start)
    DO UPDATE SET
      count = usage_counters.count + 1,
      updated_at = NOW()
    RETURNING count INTO current_count;
    
    RETURN current_count;
  END IF;

  -- For paid tiers or other counter types, use billing period
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
