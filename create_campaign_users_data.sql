-- Create dedicated campaign users table with sample data
-- Run this in Supabase SQL Editor

-- =====================================================
-- 1. CREATE CAMPAIGN USERS MASTER TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS campaign_users_master (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL UNIQUE,
  user_name VARCHAR(255) NOT NULL,
  user_email VARCHAR(255) NOT NULL UNIQUE,
  department VARCHAR(100),
  position VARCHAR(100),
  employee_id VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. CREATE INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_campaign_users_master_user_id ON campaign_users_master(user_id);
CREATE INDEX IF NOT EXISTS idx_campaign_users_master_email ON campaign_users_master(user_email);
CREATE INDEX IF NOT EXISTS idx_campaign_users_master_active ON campaign_users_master(is_active);

-- =====================================================
-- 3. ENABLE RLS
-- =====================================================
ALTER TABLE campaign_users_master ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Everyone can view campaign users master" ON campaign_users_master;
DROP POLICY IF EXISTS "Authenticated users can manage campaign users master" ON campaign_users_master;

CREATE POLICY "Everyone can view campaign users master" ON campaign_users_master FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage campaign users master" ON campaign_users_master FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- 4. TRIGGER FOR UPDATED_AT
-- =====================================================
DROP TRIGGER IF EXISTS update_campaign_users_master_updated_at ON campaign_users_master;
CREATE TRIGGER update_campaign_users_master_updated_at
    BEFORE UPDATE ON campaign_users_master
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 5. INSERT 7 SAMPLE USERS
-- =====================================================

-- Clear existing data first
DELETE FROM campaign_users_master;

-- Insert 7 sample users
INSERT INTO campaign_users_master (user_id, user_name, user_email, department, position, employee_id) VALUES 
('user_001', 'John Doe', 'john.doe@company.com', 'IT Department', 'System Administrator', 'EMP001'),
('user_002', 'Jane Smith', 'jane.smith@company.com', 'IT Department', 'Network Engineer', 'EMP002'),
('user_003', 'Bob Wilson', 'bob.wilson@company.com', 'Development Team', 'Senior Developer', 'EMP003'),
('user_004', 'Alice Johnson', 'alice.johnson@company.com', 'Development Team', 'DevOps Engineer', 'EMP004'),
('user_005', 'Charlie Brown', 'charlie.brown@company.com', 'Security Team', 'Security Analyst', 'EMP005'),
('user_006', 'Diana Prince', 'diana.prince@company.com', 'IT Department', 'Database Administrator', 'EMP006'),
('user_007', 'Eve Adams', 'eve.adams@company.com', 'Development Team', 'Frontend Developer', 'EMP007');

-- =====================================================
-- 6. UPDATE EXISTING CAMPAIGN USERS TO USE MASTER DATA
-- =====================================================

-- First, let's clear existing campaign_users data
DELETE FROM campaign_users;

-- Now insert campaign users from master data for existing campaigns
INSERT INTO campaign_users (campaign_id, user_id, user_name, user_email, application_id, application_name, current_access_level, access_granted_date)
SELECT 
  c.id as campaign_id,
  cum.user_id,
  cum.user_name,
  cum.user_email,
  c.application_id,
  COALESCE(a.name, 'Unknown Application') as application_name,
  CASE 
    WHEN cum.position LIKE '%Admin%' THEN 'Admin Access'
    WHEN cum.position LIKE '%Engineer%' THEN 'Full Access'
    WHEN cum.position LIKE '%Developer%' THEN 'Developer Access'
    WHEN cum.position LIKE '%Analyst%' THEN 'Analyst Access'
    ELSE 'Standard Access'
  END as current_access_level,
  NOW() - (INTERVAL '1 day' * (RANDOM() * 365 + 30)) as access_granted_date
FROM campaigns c
CROSS JOIN campaign_users_master cum
LEFT JOIN applications a ON c.application_id = a.id
WHERE c.status = 'active'
AND cum.is_active = true;

-- =====================================================
-- 7. VERIFICATION QUERIES
-- =====================================================

-- Check master users
SELECT 
  'Master Users' as table_name,
  COUNT(*) as count
FROM campaign_users_master
UNION ALL
SELECT 
  'Campaign Users' as table_name,
  COUNT(*) as count
FROM campaign_users;

-- Show sample master users
SELECT 
  user_id,
  user_name,
  user_email,
  department,
  position,
  employee_id
FROM campaign_users_master
ORDER BY user_name;

-- Show campaign users with campaign info
SELECT 
  c.name as campaign_name,
  cu.user_name,
  cu.user_email,
  cu.current_access_level,
  cu.application_name,
  cu.access_granted_date
FROM campaign_users cu
JOIN campaigns c ON cu.campaign_id = c.id
ORDER BY c.name, cu.user_name; 