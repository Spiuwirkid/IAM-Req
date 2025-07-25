-- Fix campaign manager assignments to ensure consistency
-- Run this in Supabase SQL Editor

-- First, let's see what we have currently
SELECT 
  id,
  name,
  assigned_managers,
  created_at
FROM campaigns
ORDER BY created_at DESC;

-- Update campaigns to use consistent email format for assigned_managers
-- This ensures that manager filtering works correctly

-- Update campaigns that have manager IDs to use email format
UPDATE campaigns 
SET assigned_managers = ARRAY['manager.a@gmail.com']
WHERE assigned_managers = ARRAY['manager_a']
   OR assigned_managers = ARRAY['Manager A'];

UPDATE campaigns 
SET assigned_managers = ARRAY['manager.b@gmail.com']
WHERE assigned_managers = ARRAY['manager_b']
   OR assigned_managers = ARRAY['Manager B'];

UPDATE campaigns 
SET assigned_managers = ARRAY['manager.c@gmail.com']
WHERE assigned_managers = ARRAY['manager_c']
   OR assigned_managers = ARRAY['Manager C'];

-- Update campaigns that have multiple managers (if any)
UPDATE campaigns 
SET assigned_managers = ARRAY['manager.a@gmail.com', 'manager.b@gmail.com', 'manager.c@gmail.com']
WHERE assigned_managers = ARRAY['manager_a', 'manager_b', 'manager_c']
   OR assigned_managers = ARRAY['Manager A', 'Manager B', 'Manager C'];

-- Update campaigns that have empty or NULL assigned_managers
UPDATE campaigns 
SET assigned_managers = ARRAY['manager.a@gmail.com']
WHERE assigned_managers IS NULL 
   OR assigned_managers = '{}'
   OR array_length(assigned_managers, 1) IS NULL;

-- Verify the updates
SELECT 
  id,
  name,
  assigned_managers,
  created_at
FROM campaigns
ORDER BY created_at DESC;

-- Show campaign summary with proper manager assignments
SELECT 
  c.name as campaign_name,
  c.status,
  c.due_date,
  c.users_to_review,
  c.progress,
  COALESCE(a.name, 'Unknown Application') as application_name,
  c.assigned_managers,
  c.created_at
FROM campaigns c
LEFT JOIN applications a ON c.application_id = a.id
ORDER BY c.created_at DESC; 