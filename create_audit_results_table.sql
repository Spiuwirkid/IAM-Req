-- Create audit_results table for storing manager decisions
-- Run this in Supabase SQL Editor

-- =====================================================
-- 1. CREATE AUDIT RESULTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_results (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  manager_name VARCHAR(255) NOT NULL,
  decision VARCHAR(20) NOT NULL CHECK (decision IN ('yes', 'no', 'pending')),
  comments TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one review per user per campaign
  UNIQUE(campaign_id, user_id)
);

-- =====================================================
-- 2. CREATE INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_audit_results_campaign_id ON audit_results(campaign_id);
CREATE INDEX IF NOT EXISTS idx_audit_results_user_id ON audit_results(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_results_decision ON audit_results(decision);
CREATE INDEX IF NOT EXISTS idx_audit_results_manager ON audit_results(manager_name);

-- =====================================================
-- 3. ENABLE RLS
-- =====================================================
ALTER TABLE audit_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Everyone can view audit results" ON audit_results;
DROP POLICY IF EXISTS "Authenticated users can manage audit results" ON audit_results;

CREATE POLICY "Everyone can view audit results" ON audit_results FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage audit results" ON audit_results FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- 4. TRIGGER FOR UPDATED_AT
-- =====================================================
DROP TRIGGER IF EXISTS update_audit_results_updated_at ON audit_results;
CREATE TRIGGER update_audit_results_updated_at
    BEFORE UPDATE ON audit_results
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 5. ADD PROGRESS COLUMN TO CAMPAIGNS TABLE
-- =====================================================
-- Add progress column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'campaigns' AND column_name = 'progress') THEN
        ALTER TABLE campaigns ADD COLUMN progress INTEGER DEFAULT 0;
    END IF;
END $$;

-- =====================================================
-- 6. VERIFICATION QUERIES
-- =====================================================

-- Check table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'audit_results'
ORDER BY ordinal_position;

-- Show sample data (will be empty initially)
SELECT 
  'Audit Results' as table_name,
  COUNT(*) as count
FROM audit_results
UNION ALL
SELECT 
  'Campaigns with Progress' as table_name,
  COUNT(*) as count
FROM campaigns
WHERE progress IS NOT NULL; 