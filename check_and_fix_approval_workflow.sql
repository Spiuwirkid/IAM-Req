-- Check and fix approval workflow for sequential filtering
-- Run this in Supabase SQL Editor

-- =====================================================
-- 1. CHECK CURRENT DATA
-- =====================================================

-- Show all pending requests with their approval workflow
SELECT 
  'Current pending requests:' as info,
  r.id as request_id,
  r.user_name,
  r.application_name,
  r.current_level,
  r.total_levels,
  r.status as request_status
FROM requests r
WHERE r.status = 'pending'
ORDER BY r.created_at DESC;

-- Show approval workflow for pending requests
SELECT 
  'Approval workflow for pending requests:' as info,
  r.id as request_id,
  r.application_name,
  aw.level,
  aw.manager_name,
  aw.status as approval_status,
  aw.created_at
FROM requests r
JOIN approval_workflow aw ON r.id = aw.request_id
WHERE r.status = 'pending'
ORDER BY r.id, aw.level;

-- =====================================================
-- 2. FIX APPROVAL WORKFLOW STATUS
-- =====================================================

-- For leveling applications, ensure only first level is 'pending'
UPDATE approval_workflow 
SET status = 'waiting' 
WHERE level > 1 
AND status = 'pending'
AND request_id IN (
  SELECT r.id 
  FROM requests r 
  JOIN applications a ON r.application_id = a.id 
  WHERE a.type_level = 'Leveling'
  AND r.status = 'pending'
);

-- =====================================================
-- 3. VERIFY THE FIX
-- =====================================================

-- Show updated approval workflow
SELECT 
  'Updated approval workflow:' as info,
  r.id as request_id,
  r.application_name,
  aw.level,
  aw.manager_name,
  aw.status as approval_status
FROM requests r
JOIN approval_workflow aw ON r.id = aw.request_id
WHERE r.status = 'pending'
ORDER BY r.id, aw.level;

-- Show status distribution
SELECT 
  'Status distribution:' as info,
  aw.status,
  COUNT(*) as count
FROM approval_workflow aw
JOIN requests r ON aw.request_id = r.id
WHERE r.status = 'pending'
GROUP BY aw.status
ORDER BY aw.status;

-- =====================================================
-- 4. TEST SEQUENTIAL LOGIC
-- =====================================================

-- Simulate what Manager A should see
SELECT 
  'Manager A should see:' as info,
  r.id as request_id,
  r.application_name,
  aw.level,
  aw.manager_name,
  aw.status
FROM requests r
JOIN approval_workflow aw ON r.id = aw.request_id
WHERE r.status = 'pending'
AND aw.manager_name = 'Manager A'
AND aw.level = 1
AND aw.status = 'pending'
ORDER BY r.created_at DESC;

-- Simulate what Manager B should see (should be empty if Manager A hasn't approved)
SELECT 
  'Manager B should see:' as info,
  r.id as request_id,
  r.application_name,
  aw.level,
  aw.manager_name,
  aw.status
FROM requests r
JOIN approval_workflow aw ON r.id = aw.request_id
WHERE r.status = 'pending'
AND aw.manager_name = 'Manager B'
AND aw.level = 2
AND aw.status = 'pending'
AND EXISTS (
  SELECT 1 FROM approval_workflow aw2 
  WHERE aw2.request_id = r.id 
  AND aw2.level = 1 
  AND aw2.status = 'approved'
)
ORDER BY r.created_at DESC;

-- Simulate what Manager C should see (should be empty if Manager A or B hasn't approved)
SELECT 
  'Manager C should see:' as info,
  r.id as request_id,
  r.application_name,
  aw.level,
  aw.manager_name,
  aw.status
FROM requests r
JOIN approval_workflow aw ON r.id = aw.request_id
WHERE r.status = 'pending'
AND aw.manager_name = 'Manager C'
AND aw.level = 3
AND aw.status = 'pending'
AND EXISTS (
  SELECT 1 FROM approval_workflow aw2 
  WHERE aw2.request_id = r.id 
  AND aw2.level = 1 
  AND aw2.status = 'approved'
)
AND EXISTS (
  SELECT 1 FROM approval_workflow aw3 
  WHERE aw3.request_id = r.id 
  AND aw3.level = 2 
  AND aw3.status = 'approved'
)
ORDER BY r.created_at DESC;

SELECT 
  '✅ Approval workflow checked and fixed!' as final_status; 