-- Add trial support to companies table
-- 7-day (1 week) trial automatically granted on signup

-- Add trial fields to companies table (only if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='companies' AND column_name='trial_start') THEN
    ALTER TABLE companies ADD COLUMN trial_start TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='companies' AND column_name='trial_end') THEN
    ALTER TABLE companies ADD COLUMN trial_end TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='companies' AND column_name='trial_tier') THEN
    ALTER TABLE companies ADD COLUMN trial_tier subscription_tier DEFAULT 'starter';
  END IF;
END $$;

-- Create index for trial queries (only if it doesn't exist)
CREATE INDEX IF NOT EXISTS idx_companies_trial_end ON companies(trial_end) WHERE trial_end IS NOT NULL;

-- Function to update company creation trigger to include trial
CREATE OR REPLACE FUNCTION create_company_for_contractor()
RETURNS TRIGGER AS $$
DECLARE
  new_company_id UUID;
  trial_start_date TIMESTAMPTZ;
  trial_end_date TIMESTAMPTZ;
BEGIN
  -- Set trial dates (7 days / 1 week trial)
  trial_start_date := NOW();
  trial_end_date := NOW() + INTERVAL '7 days';

  -- Create a company for the new contractor with trial
  INSERT INTO companies (name, subscription_tier, trial_start, trial_end, trial_tier)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'company_name', 'My Company'),
    'starter', -- Give starter tier during trial
    trial_start_date,
    trial_end_date,
    'starter' -- Trial tier
  )
  RETURNING id INTO new_company_id;

  -- Create contractor record linked to the company
  INSERT INTO contractors (id, company_id, name, email, company_name)
  VALUES (
    NEW.id,
    new_company_id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    NEW.raw_user_meta_data->>'company_name'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if a company is currently in trial
CREATE OR REPLACE FUNCTION is_in_trial(company_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  trial_end_date TIMESTAMPTZ;
BEGIN
  SELECT trial_end INTO trial_end_date
  FROM companies
  WHERE id = company_uuid;

  -- If no trial_end, not in trial
  IF trial_end_date IS NULL THEN
    RETURN false;
  END IF;

  -- Check if trial is still active (trial_end is in the future)
  RETURN trial_end_date > NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get effective tier (trial tier if in trial, otherwise subscription tier)
CREATE OR REPLACE FUNCTION get_effective_tier(company_uuid UUID)
RETURNS subscription_tier AS $$
DECLARE
  current_tier subscription_tier;
  trial_end_date TIMESTAMPTZ;
  trial_tier_val subscription_tier;
BEGIN
  SELECT subscription_tier, trial_end, trial_tier
  INTO current_tier, trial_end_date, trial_tier_val
  FROM companies
  WHERE id = company_uuid;

  -- If in trial, return trial tier
  IF trial_end_date IS NOT NULL AND trial_end_date > NOW() THEN
    RETURN COALESCE(trial_tier_val, 'starter');
  END IF;

  -- Otherwise return current subscription tier
  RETURN COALESCE(current_tier, 'free');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle trial expiration (runs automatically or via cron)
CREATE OR REPLACE FUNCTION expire_trials()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  -- Update companies with expired trials to free tier
  UPDATE companies
  SET 
    subscription_tier = 'free',
    trial_start = NULL,
    trial_end = NULL,
    updated_at = NOW()
  WHERE trial_end IS NOT NULL 
    AND trial_end <= NOW()
    AND subscription_tier != 'free'
    AND subscription_status IS NULL; -- Only if no active subscription

  GET DIAGNOSTICS expired_count = ROW_COUNT;
  
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

