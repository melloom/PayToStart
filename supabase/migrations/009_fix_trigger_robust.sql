-- Fix the trigger to handle missing columns gracefully
-- This migration makes the trigger more robust and prevents signup failures

-- Drop the existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create a more robust trigger function that handles errors gracefully
CREATE OR REPLACE FUNCTION create_company_for_contractor()
RETURNS TRIGGER AS $$
DECLARE
  new_company_id UUID;
  trial_start_date TIMESTAMPTZ;
  trial_end_date TIMESTAMPTZ;
  company_name_val TEXT;
  contractor_name_val TEXT;
  has_subscription_tier BOOLEAN;
  has_trial_fields BOOLEAN;
BEGIN
  -- Set trial dates (7 days / 1 week trial)
  trial_start_date := NOW();
  trial_end_date := NOW() + INTERVAL '7 days';
  
  -- Get values from metadata with fallbacks
  company_name_val := COALESCE(NEW.raw_user_meta_data->>'company_name', 'My Company');
  contractor_name_val := COALESCE(NEW.raw_user_meta_data->>'name', NEW.email);

  -- Check if columns exist
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'companies' AND column_name = 'subscription_tier'
  ) INTO has_subscription_tier;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'companies' AND column_name = 'trial_start'
  ) INTO has_trial_fields;

  -- Create company based on what columns exist
  IF has_subscription_tier AND has_trial_fields THEN
    -- Full version with subscription and trial support
    INSERT INTO companies (
      name, 
      subscription_tier, 
      trial_start, 
      trial_end, 
      trial_tier
    )
    VALUES (
      company_name_val,
      'starter',
      trial_start_date,
      trial_end_date,
      'starter'
    )
    RETURNING id INTO new_company_id;
  ELSIF has_subscription_tier THEN
    -- Version with subscription_tier but no trial fields
    INSERT INTO companies (name, subscription_tier)
    VALUES (company_name_val, 'starter')
    RETURNING id INTO new_company_id;
  ELSE
    -- Basic version without subscription fields
    INSERT INTO companies (name)
    VALUES (company_name_val)
    RETURNING id INTO new_company_id;
  END IF;

  -- Create contractor record linked to the company
  INSERT INTO contractors (id, company_id, name, email, company_name)
  VALUES (
    NEW.id,
    new_company_id,
    contractor_name_val,
    NEW.email,
    company_name_val
  )
  ON CONFLICT (id) DO NOTHING; -- Prevent duplicate contractor creation

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log the error but don't fail the user creation
  -- This allows users to sign up even if company creation fails
  -- They can be manually fixed later
  RAISE WARNING 'Error creating company/contractor for user %: %', NEW.id, SQLERRM;
  -- Still return NEW to allow user creation even if company creation fails
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_company_for_contractor();

