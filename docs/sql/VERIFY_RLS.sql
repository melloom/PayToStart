-- Verify RLS policies are set up correctly
-- Run this to check if the policies exist

-- Check contractors policies
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'contractors'
ORDER BY policyname;

-- Check companies policies  
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'companies'
ORDER BY policyname;

