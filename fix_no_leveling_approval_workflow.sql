-- Fix approval workflow for No leveling applications
-- This script directly fixes the approval workflow records that were created with wrong manager names

-- 1. Show current problematic approval workflow
SELECT 
  'BEFORE FIX - Current approval workflow:' as info,
  r.id as request_id,
  r.application_name,
  aw.manager_name as current_manager,
  a.managers as assigned_managers
FROM requests r
JOIN approval_workflow aw ON r.id = aw.request_id
JOIN applications a ON r.application_id = a.id
WHERE a.type_level = 'No leveling'
ORDER BY r.created_at DESC;

-- 2. Fix the approval workflow - Update manager_name to match applications.managers
UPDATE approval_workflow 
SET 
  manager_name = a.managers[1],
  manager_id = LOWER(REPLACE(a.managers[1], ' ', '_')),
  updated_at = NOW()
FROM requests r
JOIN applications a ON r.application_id = a.id
WHERE approval_workflow.request_id = r.id
AND a.type_level = 'No leveling'
AND a.managers IS NOT NULL
AND array_length(a.managers, 1) > 0;

-- 3. Show the fix result
SELECT 
  'AFTER FIX - Updated approval workflow:' as info,
  r.id as request_id,
  r.application_name,
  aw.manager_name as current_manager,
  a.managers as assigned_managers
FROM requests r
JOIN approval_workflow aw ON r.id = aw.request_id
JOIN applications a ON r.application_id = a.id
WHERE a.type_level = 'No leveling'
ORDER BY r.created_at DESC;

-- 4. Test what Manager A should see now
SELECT 
  'Manager A should now see these requests:' as info,
  r.id as request_id,
  r.application_name,
  aw.level,
  aw.manager_name,
  aw.status as approval_status
FROM requests r
JOIN approval_workflow aw ON r.id = aw.request_id
WHERE r.status = 'pending'
AND aw.manager_name = 'Manager A'
AND aw.status = 'pending'
ORDER BY r.created_at DESC; 