-- OPTION 1: Manually create contractor record for your user
-- Replace 'YOUR_USER_ID' and 'YOUR_EMAIL' with your actual values
-- First, get your user ID: SELECT id, email FROM auth.users;

-- Step 1: Create a company for yourself (if it doesn't exist)
-- Replace 'YOUR_USER_ID' with your actual user ID
DO $$
DECLARE
  user_id UUID := 'YOUR_USER_ID_HERE'; -- Replace this!
  user_email TEXT;
  user_name TEXT;
  company_name_val TEXT;
  new_company_id UUID;
  existing_contractor_id UUID;
BEGIN
  -- Get user info
  SELECT email, raw_user_meta_data->>'name' INTO user_email, user_name
  FROM auth.users WHERE id = user_id;
  
  IF user_email IS NULL THEN
    RAISE EXCEPTION 'User not found. Make sure you replaced YOUR_USER_ID_HERE with your actual user ID';
  END IF;
  
  -- Get company name from metadata or use default
  company_name_val := COALESCE(
    (SELECT raw_user_meta_data->>'company_name' FROM auth.users WHERE id = user_id),
    'My Company'
  );
  
  -- Check if contractor already exists
  SELECT id INTO existing_contractor_id FROM contractors WHERE id = user_id;
  
  IF existing_contractor_id IS NOT NULL THEN
    RAISE NOTICE 'Contractor record already exists for user %', user_id;
    RETURN;
  END IF;
  
  -- Create company
  INSERT INTO companies (name)
  VALUES (company_name_val)
  RETURNING id INTO new_company_id;
  
  -- Create contractor record
  INSERT INTO contractors (id, company_id, name, email, company_name)
  VALUES (
    user_id,
    new_company_id,
    COALESCE(user_name, user_email),
    user_email,
    company_name_val
  );
  
  RAISE NOTICE 'Successfully created contractor record for user % with company %', user_id, new_company_id;
END $$;

