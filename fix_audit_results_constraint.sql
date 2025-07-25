-- Fix audit_results table constraint to accept 'pending' decision
-- Run this in Supabase SQL Editor

-- =====================================================
-- 1. DROP EXISTING CONSTRAINT
-- =====================================================
ALTER TABLE audit_results 
DROP CONSTRAINT IF EXISTS audit_results_decision_check;

-- =====================================================
-- 2. ADD NEW CONSTRAINT WITH 'pending' SUPPORT
-- =====================================================
ALTER TABLE audit_results 
ADD CONSTRAINT audit_results_decision_check 
CHECK (decision IN ('yes', 'no', 'pending'));

-- =====================================================
-- 3. VERIFY THE FIX
-- =====================================================

-- Test the constraint
INSERT INTO audit_results (
  campaign_id, 
  user_id, 
  user_email, 
  manager_name, 
  decision, 
  comments, 
  reviewed_at
) VALUES (
  (SELECT id FROM campaigns LIMIT 1),
  'test_user',
  'test@test.com',
  'Test Manager',
  'pending',
  'Test pending decision',
  NOW()
) ON CONFLICT (campaign_id, user_id) DO NOTHING;

-- Show the constraint
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'audit_results'::regclass 
AND contype = 'c';

-- Clean up test data
DELETE FROM audit_results WHERE user_id = 'test_user';

-- =====================================================
-- 4. VERIFICATION QUERY
-- =====================================================
SELECT 
  'Constraint fixed successfully' as status,
  'audit_results table now accepts yes, no, pending' as details; 