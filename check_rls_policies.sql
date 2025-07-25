-- Check RLS policies on requests table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'requests';

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'requests';

-- Check current user permissions
SELECT current_user, session_user;

-- Test direct delete with current user
SELECT auth.uid() as current_user_id; 