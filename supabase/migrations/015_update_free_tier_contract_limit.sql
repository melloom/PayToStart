-- Update free tier contract limit to 3 contracts (ever, not per month)
-- This allows Basic plan users to create up to 3 contracts total

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



