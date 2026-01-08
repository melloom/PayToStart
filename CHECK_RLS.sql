-- Diagnostic queries to check RLS policies and contractor records
-- Run these in Supabase SQL Editor to see what's happening

-- 1. Check if the policy exists
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'contractors' 
  AND policyname = 'Contractors can view their own record';

-- 2. Check all policies on contractors table
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'contractors';

-- 3. Check if you have a contractor record (replace 'YOUR_USER_ID' with your actual user ID from auth.users)
-- First, get your user ID:
SELECT id, email FROM auth.users LIMIT 5;

-- Then check if contractor exists (replace the UUID with your user ID):
-- SELECT * FROM contractors WHERE id = 'YOUR_USER_ID_HERE';

