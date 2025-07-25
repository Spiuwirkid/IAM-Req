-- Simple fix for audit_results constraint
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
-- 3. ADD PROGRESS COLUMN TO CAMPAIGNS IF MISSING
-- =====================================================
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'campaigns' AND column_name = 'progress') THEN
        ALTER TABLE campaigns ADD COLUMN progress INTEGER DEFAULT 0;
    END IF;
END $$;

-- =====================================================
-- 4. VERIFICATION
-- =====================================================
SELECT 
  '✅ Constraint fixed!' as status,
  'audit_results table now accepts yes, no, pending' as details; 