-- Create contractor record for your user
-- User ID: f7f10c11-42ac-476e-a8fd-1cc18918a21c

DO $$
DECLARE
  user_id UUID := 'f7f10c11-42ac-476e-a8fd-1cc18918a21c';
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
    RAISE EXCEPTION 'User not found with ID: %', user_id;
  END IF;
  
  -- Get company name from metadata or use default
  company_name_val := COALESCE(
    (SELECT raw_user_meta_data->>'company_name' FROM auth.users WHERE id = user_id),
    'My Company'
  );
  
  -- Check if contractor already exists
  SELECT id INTO existing_contractor_id FROM contractors WHERE id = user_id;
  
  IF existing_contractor_id IS NOT NULL THEN
    RAISE NOTICE 'Contractor record already exists for user % (email: %)', user_id, user_email;
    RAISE NOTICE 'If you still have issues, the problem might be with RLS policies.';
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
  
  RAISE NOTICE 'Successfully created contractor record!';
  RAISE NOTICE 'User: % (%)', user_email, user_id;
  RAISE NOTICE 'Company: % (%)', company_name_val, new_company_id;
  RAISE NOTICE 'You can now try logging in again.';
END $$;

