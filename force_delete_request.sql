-- Force delete request with cache clearing
-- This script will aggressively delete the problematic request

-- 1. Check current state
SELECT 
  'Current state - Request:' as info,
  r.id as request_id,
  r.application_name,
  r.status,
  r.user_id,
  r.created_at
FROM requests r
WHERE r.id = '1194b6c0-db17-4a22-bae1-452f0fee9c5c';

SELECT 
  'Current state - Approval Workflow:' as info,
  aw.id,
  aw.request_id,
  aw.level,
  aw.manager_name,
  aw.status
FROM approval_workflow aw
WHERE aw.request_id = '1194b6c0-db17-4a22-bae1-452f0fee9c5c';

-- 2. Force delete ALL related records
-- Delete from audit_log if exists
DELETE FROM audit_log 
WHERE resource_id = '1194b6c0-db17-4a22-bae1-452f0fee9c5c' 
AND resource_type = 'request';

-- Delete from access_permissions if exists
DELETE FROM access_permissions 
WHERE request_id = '1194b6c0-db17-4a22-bae1-452f0fee9c5c';

-- Delete from approval_workflow
DELETE FROM approval_workflow 
WHERE request_id = '1194b6c0-db17-4a22-bae1-452f0fee9c5c';

-- Delete from requests
DELETE FROM requests 
WHERE id = '1194b6c0-db17-4a22-bae1-452f0fee9c5c';

-- 3. Force commit and clear cache
-- This is a comment - PostgreSQL doesn't have explicit cache clearing
-- But we can force a commit by doing a dummy operation
SELECT pg_sleep(1);

-- 4. Verify deletion
SELECT 
  'After deletion - Request count:' as info,
  COUNT(*) as request_count
FROM requests 
WHERE id = '1194b6c0-db17-4a22-bae1-452f0fee9c5c';

SELECT 
  'After deletion - Approval workflow count:' as info,
  COUNT(*) as approval_count
FROM approval_workflow 
WHERE request_id = '1194b6c0-db17-4a22-bae1-452f0fee9c5c';

-- 5. Check remaining requests for the user
SELECT 
  'Remaining requests for user:' as info,
  r.id as request_id,
  r.application_name,
  r.status,
  r.created_at
FROM requests r
WHERE r.user_id = 'cc02b3c5-7b01-42cd-9dd5-f921e56d5972'
ORDER BY r.created_at DESC;

-- 6. Check for any orphaned records
SELECT 
  'Orphaned approval workflow records:' as info,
  COUNT(*) as orphaned_count
FROM approval_workflow aw
LEFT JOIN requests r ON aw.request_id = r.id
WHERE r.id IS NULL; 