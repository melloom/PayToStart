-- OPTION 2: Fix ALL users who are missing contractor records
-- This will create contractor records for any users in auth.users who don't have one
-- Run this if you want to fix all users at once

DO $$
DECLARE
  user_record RECORD;
  new_company_id UUID;
  company_name_val TEXT;
  contractor_name_val TEXT;
  created_count INTEGER := 0;
BEGIN
  -- Loop through all users who don't have contractor records
  FOR user_record IN 
    SELECT 
      u.id,
      u.email,
      COALESCE(u.raw_user_meta_data->>'name', u.email) as name,
      COALESCE(u.raw_user_meta_data->>'company_name', 'My Company') as company_name
    FROM auth.users u
    LEFT JOIN contractors c ON c.id = u.id
    WHERE c.id IS NULL
  LOOP
    BEGIN
      -- Create company for this user
      company_name_val := COALESCE(user_record.company_name, 'My Company');
      contractor_name_val := COALESCE(user_record.name, user_record.email);
      
      INSERT INTO companies (name)
      VALUES (company_name_val)
      RETURNING id INTO new_company_id;
      
      -- Create contractor record
      INSERT INTO contractors (id, company_id, name, email, company_name)
      VALUES (
        user_record.id,
        new_company_id,
        contractor_name_val,
        user_record.email,
        company_name_val
      );
      
      created_count := created_count + 1;
      RAISE NOTICE 'Created contractor record for user: % (%)', user_record.email, user_record.id;
      
    EXCEPTION WHEN OTHERS THEN
      -- Log error but continue with other users
      RAISE WARNING 'Failed to create contractor for user %: %', user_record.email, SQLERRM;
    END;
  END LOOP;
  
  RAISE NOTICE 'Finished. Created % contractor record(s)', created_count;
END $$;

