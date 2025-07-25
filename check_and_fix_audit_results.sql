-- Check and fix audit_results table
-- Run this in Supabase SQL Editor

-- =====================================================
-- 1. CHECK IF TABLE EXISTS
-- =====================================================
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'audit_results') THEN
        RAISE NOTICE 'Creating audit_results table...';
        
        CREATE TABLE audit_results (
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
        
        -- Create indexes
        CREATE INDEX idx_audit_results_campaign_id ON audit_results(campaign_id);
        CREATE INDEX idx_audit_results_user_id ON audit_results(user_id);
        CREATE INDEX idx_audit_results_decision ON audit_results(decision);
        CREATE INDEX idx_audit_results_manager ON audit_results(manager_name);
        
        -- Enable RLS
        ALTER TABLE audit_results ENABLE ROW LEVEL SECURITY;
        
        -- RLS Policies
        CREATE POLICY "Everyone can view audit results" ON audit_results FOR SELECT USING (true);
        CREATE POLICY "Authenticated users can manage audit results" ON audit_results FOR ALL USING (auth.role() = 'authenticated');
        
        -- Trigger for updated_at
        CREATE TRIGGER update_audit_results_updated_at
            BEFORE UPDATE ON audit_results
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
            
        RAISE NOTICE 'audit_results table created successfully!';
    ELSE
        RAISE NOTICE 'audit_results table already exists';
    END IF;
END $$;

-- =====================================================
-- 2. FIX CONSTRAINT IF NEEDED
-- =====================================================
DO $$ 
BEGIN
    -- Check if constraint exists and allows 'pending'
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conrelid = 'audit_results'::regclass 
        AND contype = 'c' 
        AND conname = 'audit_results_decision_check'
    ) THEN
        -- Drop existing constraint
        ALTER TABLE audit_results DROP CONSTRAINT audit_results_decision_check;
        RAISE NOTICE 'Dropped existing constraint';
    END IF;
    
    -- Add new constraint with 'pending' support
    ALTER TABLE audit_results ADD CONSTRAINT audit_results_decision_check 
    CHECK (decision IN ('yes', 'no', 'pending'));
    RAISE NOTICE 'Added new constraint with pending support';
END $$;

-- =====================================================
-- 3. ADD PROGRESS COLUMN TO CAMPAIGNS IF MISSING
-- =====================================================
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'campaigns' AND column_name = 'progress') THEN
        ALTER TABLE campaigns ADD COLUMN progress INTEGER DEFAULT 0;
        RAISE NOTICE 'Added progress column to campaigns table';
    ELSE
        RAISE NOTICE 'Progress column already exists in campaigns table';
    END IF;
END $$;

-- =====================================================
-- 4. VERIFICATION
-- =====================================================

-- Show table structure
SELECT 
  'audit_results table structure:' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'audit_results'
ORDER BY ordinal_position;

-- Show constraint
SELECT 
  'audit_results constraint:' as info,
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'audit_results'::regclass 
AND contype = 'c';

-- Test constraint (simplified without ON CONFLICT)
DO $$
DECLARE
    test_campaign_id UUID;
BEGIN
    -- Get a campaign ID for testing
    SELECT id INTO test_campaign_id FROM campaigns LIMIT 1;
    
    IF test_campaign_id IS NOT NULL THEN
        -- Try to insert test data
        INSERT INTO audit_results (
          campaign_id, 
          user_id, 
          user_email, 
          manager_name, 
          decision, 
          comments, 
          reviewed_at
        ) VALUES (
          test_campaign_id,
          'test_user_pending',
          'test_pending@test.com',
          'Test Manager',
          'pending',
          'Test pending decision',
          NOW()
        );
        
        RAISE NOTICE '✅ Test insert with pending decision successful!';
        
        -- Clean up test data
        DELETE FROM audit_results WHERE user_id = 'test_user_pending';
        RAISE NOTICE '✅ Test data cleaned up';
    ELSE
        RAISE NOTICE '⚠️ No campaigns found for testing';
    END IF;
END $$;

SELECT 
  '✅ audit_results table is ready for pending decisions!' as final_status; 