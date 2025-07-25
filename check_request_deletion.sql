-- Check and fix request deletion issue
-- This script helps debug why a request appears to be deleted but still shows in the UI

-- 1. Check if the request still exists in the database
SELECT 
  'Checking if request still exists:' as info,
  r.id as request_id,
  r.application_name,
  r.status,
  r.user_id,
  r.created_at,
  r.updated_at
FROM requests r
WHERE r.id = '0ec6b28d-0caf-4e0e-8c30-8c593ee4081b';

-- 2. Check approval workflow for this request
SELECT 
  'Approval workflow for this request:' as info,
  aw.request_id,
  aw.level,
  aw.manager_name,
  aw.status,
  aw.created_at
FROM approval_workflow aw
WHERE aw.request_id = '0ec6b28d-0caf-4e0e-8c30-8c593ee4081b';

-- 3. Check all requests for the user (staff@gmail.com user_id)
SELECT 
  'All requests for user:' as info,
  r.id as request_id,
  r.application_name,
  r.status,
  r.user_id,
  r.created_at
FROM requests r
WHERE r.user_id = (
  SELECT id FROM users WHERE email = 'staff@gmail.com'
)
ORDER BY r.created_at DESC;

-- 4. If request still exists, manually delete it
-- Uncomment the lines below if the request still exists and needs manual deletion

/*
-- Delete approval workflow first (due to foreign key constraint)
DELETE FROM approval_workflow 
WHERE request_id = '0ec6b28d-0caf-4e0e-8c30-8c593ee4081b';

-- Delete the request
DELETE FROM requests 
WHERE id = '0ec6b28d-0caf-4e0e-8c30-8c593ee4081b';

-- Verify deletion
SELECT 
  'After manual deletion - checking if request exists:' as info,
  COUNT(*) as request_count
FROM requests 
WHERE id = '0ec6b28d-0caf-4e0e-8c30-8c593ee4081b';
*/

-- 5. Check for any orphaned approval workflow records
SELECT 
  'Orphaned approval workflow records:' as info,
  aw.id,
  aw.request_id,
  aw.manager_name,
  aw.status
FROM approval_workflow aw
LEFT JOIN requests r ON aw.request_id = r.id
WHERE r.id IS NULL; 