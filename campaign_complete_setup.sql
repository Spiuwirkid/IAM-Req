-- =====================================================
-- COMPLETE CAMPAIGN AUDIT SYSTEM SETUP
-- Run this in Supabase SQL Editor
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. CAMPAIGNS TABLE (Main campaign table)
-- =====================================================
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  due_date DATE NOT NULL,
  assigned_managers TEXT[] DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  users_to_review INTEGER DEFAULT 0,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. CAMPAIGN USERS TABLE (Users to be audited)
-- =====================================================
CREATE TABLE IF NOT EXISTS campaign_users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  application_name VARCHAR(255) NOT NULL,
  current_access_level VARCHAR(100) NOT NULL,
  access_granted_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. AUDIT RESULTS TABLE (Manager decisions)
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_results (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  manager_name VARCHAR(255) NOT NULL,
  decision VARCHAR(10) NOT NULL CHECK (decision IN ('yes', 'no')),
  comments TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(campaign_id, user_id, application_id)
);

-- =====================================================
-- 4. CAMPAIGN SETTINGS TABLE (Campaign configuration)
-- =====================================================
CREATE TABLE IF NOT EXISTS campaign_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  review_period_days INTEGER DEFAULT 30,
  auto_revoke_access BOOLEAN DEFAULT false,
  notification_emails TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(campaign_id)
);

-- =====================================================
-- 5. CREATE INDEXES (Only if they don't exist)
-- =====================================================

-- Campaigns indexes
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_campaigns_application_id') THEN
        CREATE INDEX idx_campaigns_application_id ON campaigns(application_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_campaigns_status') THEN
        CREATE INDEX idx_campaigns_status ON campaigns(status);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_campaigns_due_date') THEN
        CREATE INDEX idx_campaigns_due_date ON campaigns(due_date);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_campaigns_created_at') THEN
        CREATE INDEX idx_campaigns_created_at ON campaigns(created_at);
    END IF;
END $$;

-- Campaign users indexes
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_campaign_users_campaign_id') THEN
        CREATE INDEX idx_campaign_users_campaign_id ON campaign_users(campaign_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_campaign_users_user_id') THEN
        CREATE INDEX idx_campaign_users_user_id ON campaign_users(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_campaign_users_application_id') THEN
        CREATE INDEX idx_campaign_users_application_id ON campaign_users(application_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_campaign_users_active') THEN
        CREATE INDEX idx_campaign_users_active ON campaign_users(is_active);
    END IF;
END $$;

-- Audit results indexes
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_audit_results_campaign_id') THEN
        CREATE INDEX idx_audit_results_campaign_id ON audit_results(campaign_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_audit_results_user_id') THEN
        CREATE INDEX idx_audit_results_user_id ON audit_results(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_audit_results_manager_name') THEN
        CREATE INDEX idx_audit_results_manager_name ON audit_results(manager_name);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_audit_results_decision') THEN
        CREATE INDEX idx_audit_results_decision ON audit_results(decision);
    END IF;
END $$;

-- Campaign settings indexes
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_campaign_settings_campaign_id') THEN
        CREATE INDEX idx_campaign_settings_campaign_id ON campaign_settings(campaign_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_campaign_settings_dates') THEN
        CREATE INDEX idx_campaign_settings_dates ON campaign_settings(start_date, end_date);
    END IF;
END $$;

-- =====================================================
-- 6. ENABLE RLS (Row Level Security)
-- =====================================================
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_settings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 7. RLS POLICIES (Drop existing policies first)
-- =====================================================

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Everyone can view campaigns" ON campaigns;
DROP POLICY IF EXISTS "Authenticated users can manage campaigns" ON campaigns;
DROP POLICY IF EXISTS "Everyone can view campaign users" ON campaign_users;
DROP POLICY IF EXISTS "Authenticated users can manage campaign users" ON campaign_users;
DROP POLICY IF EXISTS "Everyone can view audit results" ON audit_results;
DROP POLICY IF EXISTS "Authenticated users can manage audit results" ON audit_results;
DROP POLICY IF EXISTS "Everyone can view campaign settings" ON campaign_settings;
DROP POLICY IF EXISTS "Authenticated users can manage campaign settings" ON campaign_settings;

-- Create new policies
CREATE POLICY "Everyone can view campaigns" ON campaigns FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage campaigns" ON campaigns FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Everyone can view campaign users" ON campaign_users FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage campaign users" ON campaign_users FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Everyone can view audit results" ON audit_results FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage audit results" ON audit_results FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Everyone can view campaign settings" ON campaign_settings FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage campaign settings" ON campaign_settings FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- 8. TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Create or replace the update function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers (drop first to avoid conflicts)
DROP TRIGGER IF EXISTS update_campaigns_updated_at ON campaigns;
DROP TRIGGER IF EXISTS update_campaign_users_updated_at ON campaign_users;
DROP TRIGGER IF EXISTS update_audit_results_updated_at ON audit_results;
DROP TRIGGER IF EXISTS update_campaign_settings_updated_at ON campaign_settings;

CREATE TRIGGER update_campaigns_updated_at
    BEFORE UPDATE ON campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaign_users_updated_at
    BEFORE UPDATE ON campaign_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_audit_results_updated_at
    BEFORE UPDATE ON audit_results
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaign_settings_updated_at
    BEFORE UPDATE ON campaign_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 9. SAMPLE DATA (Only if campaigns table is empty)
-- =====================================================

-- Insert sample campaigns only if table is empty
INSERT INTO campaigns (name, description, application_id, due_date, assigned_managers, status, users_to_review, progress)
SELECT 
  'AWS Users Audit Q1 2024',
  'Comprehensive audit of AWS user access and permissions for Q1 2024',
  (SELECT id FROM applications WHERE name = 'GNS3' LIMIT 1),
  '2024-03-31',
  ARRAY['Manager A', 'Manager B', 'Manager C'],
  'active',
  25,
  60
WHERE NOT EXISTS (SELECT 1 FROM campaigns WHERE name = 'AWS Users Audit Q1 2024');

INSERT INTO campaigns (name, description, application_id, due_date, assigned_managers, status, users_to_review, progress)
SELECT 
  'Docker Container Security Review',
  'Security audit of Docker containers and access permissions',
  (SELECT id FROM applications WHERE name = 'Docker' LIMIT 1),
  '2024-04-15',
  ARRAY['Manager A', 'Manager B'],
  'active',
  15,
  30
WHERE NOT EXISTS (SELECT 1 FROM campaigns WHERE name = 'Docker Container Security Review');

-- Insert sample campaign settings
INSERT INTO campaign_settings (campaign_id, start_date, end_date, review_period_days, auto_revoke_access)
SELECT 
  c.id,
  c.created_at::date,
  c.due_date,
  30,
  false
FROM campaigns c
WHERE NOT EXISTS (SELECT 1 FROM campaign_settings WHERE campaign_id = c.id);

-- Insert sample campaign users with proper application name handling
INSERT INTO campaign_users (campaign_id, user_id, user_name, user_email, application_id, application_name, current_access_level, access_granted_date)
SELECT 
  c.id,
  'user_001',
  'John Doe',
  'john.doe@company.com',
  c.application_id,
  COALESCE((SELECT name FROM applications WHERE id = c.application_id), 'Unknown Application'),
  'Admin Access',
  NOW() - INTERVAL '6 months'
FROM campaigns c
WHERE c.name = 'AWS Users Audit Q1 2024'
AND c.application_id IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM campaign_users 
  WHERE campaign_id = c.id AND user_id = 'user_001'
);

INSERT INTO campaign_users (campaign_id, user_id, user_name, user_email, application_id, application_name, current_access_level, access_granted_date)
SELECT 
  c.id,
  'user_002',
  'Jane Smith',
  'jane.smith@company.com',
  c.application_id,
  COALESCE((SELECT name FROM applications WHERE id = c.application_id), 'Unknown Application'),
  'Standard Access',
  NOW() - INTERVAL '3 months'
FROM campaigns c
WHERE c.name = 'AWS Users Audit Q1 2024'
AND c.application_id IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM campaign_users 
  WHERE campaign_id = c.id AND user_id = 'user_002'
);

-- =====================================================
-- 10. VIEWS FOR REPORTING
-- =====================================================

-- Drop existing views to avoid conflicts
DROP VIEW IF EXISTS v_campaign_summary;
DROP VIEW IF EXISTS v_manager_audit_workload;

-- Campaign summary view
CREATE VIEW v_campaign_summary AS
SELECT 
  c.id as campaign_id,
  c.name as campaign_name,
  c.description,
  c.status,
  c.due_date,
  cs.start_date,
  cs.end_date,
  COALESCE(a.name, 'Unknown Application') as application_name,
  COUNT(cu.id) as total_users_to_review,
  COUNT(ar.id) as reviewed_users,
  ROUND(
    COUNT(ar.id) * 100.0 / NULLIF(COUNT(cu.id), 0), 1
  ) as completion_percentage,
  COUNT(CASE WHEN ar.decision = 'yes' THEN 1 END) as approved_access,
  COUNT(CASE WHEN ar.decision = 'no' THEN 1 END) as revoked_access
FROM campaigns c
LEFT JOIN applications a ON c.application_id = a.id
LEFT JOIN campaign_settings cs ON c.id = cs.campaign_id
LEFT JOIN campaign_users cu ON c.id = cu.campaign_id AND cu.is_active = true
LEFT JOIN audit_results ar ON c.id = ar.campaign_id
GROUP BY c.id, c.name, c.description, c.status, c.due_date, cs.start_date, cs.end_date, a.name
ORDER BY c.created_at DESC;

-- Manager audit workload view
CREATE VIEW v_manager_audit_workload AS
SELECT 
  ar.manager_name,
  c.name as campaign_name,
  COUNT(*) as total_reviews,
  COUNT(CASE WHEN ar.decision = 'yes' THEN 1 END) as approved_count,
  COUNT(CASE WHEN ar.decision = 'no' THEN 1 END) as revoked_count,
  ROUND(
    COUNT(CASE WHEN ar.decision = 'yes' THEN 1 END) * 100.0 / 
    NULLIF(COUNT(*), 0), 1
  ) as approval_rate,
  MIN(ar.reviewed_at) as first_review,
  MAX(ar.reviewed_at) as last_review
FROM audit_results ar
JOIN campaigns c ON ar.campaign_id = c.id
GROUP BY ar.manager_name, c.name, c.id
ORDER BY ar.manager_name, c.created_at DESC;

-- =====================================================
-- 11. VERIFICATION QUERY
-- =====================================================

-- Check all tables were created successfully
SELECT 
  'Tables Created' as check_type,
  table_name,
  '✅' as status
FROM information_schema.tables 
WHERE table_name IN ('campaigns', 'campaign_users', 'audit_results', 'campaign_settings')
AND table_schema = 'public'
ORDER BY table_name;

-- Check sample data
SELECT 
  'Sample Data' as check_type,
  'Campaigns' as table_name,
  COUNT(*) as count,
  '✅' as status
FROM campaigns
UNION ALL
SELECT 
  'Sample Data' as check_type,
  'Campaign Users' as table_name,
  COUNT(*) as count,
  '✅' as status
FROM campaign_users
UNION ALL
SELECT 
  'Sample Data' as check_type,
  'Campaign Settings' as table_name,
  COUNT(*) as count,
  '✅' as status
FROM campaign_settings;

-- Show campaign summary
SELECT 
  c.name as campaign_name,
  c.status,
  c.due_date,
  c.users_to_review,
  c.progress,
  COALESCE(a.name, 'Unknown Application') as application_name,
  c.created_at
FROM campaigns c
LEFT JOIN applications a ON c.application_id = a.id
ORDER BY c.created_at DESC; 