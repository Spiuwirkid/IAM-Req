-- Fix campaign data to ensure assigned_managers is properly set
-- Run this in Supabase SQL Editor

-- Update campaigns that have NULL or empty assigned_managers
UPDATE campaigns 
SET assigned_managers = ARRAY['Manager A', 'Manager B', 'Manager C']
WHERE assigned_managers IS NULL 
   OR assigned_managers = '{}'
   OR array_length(assigned_managers, 1) IS NULL;

-- Update specific campaigns with proper assigned managers
UPDATE campaigns 
SET assigned_managers = ARRAY['Manager A', 'Manager B', 'Manager C']
WHERE name = 'AWS Users Audit Q1 2024';

UPDATE campaigns 
SET assigned_managers = ARRAY['Manager A', 'Manager B']
WHERE name = 'Docker Container Security Review';

UPDATE campaigns 
SET assigned_managers = ARRAY['Manager A', 'Manager B', 'Manager C']
WHERE name = 'Esxi';

-- Verify the updates
SELECT 
  id,
  name,
  assigned_managers,
  application_id,
  status,
  created_at
FROM campaigns
ORDER BY created_at DESC;

-- Show campaign summary with application names
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