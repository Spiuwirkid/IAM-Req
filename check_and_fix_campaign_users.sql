-- Check and fix campaign users issues

-- 1. Check if campaign_users_master table exists and has data
SELECT 'campaign_users_master' as table_name, COUNT(*) as record_count 
FROM campaign_users_master 
WHERE is_active = true;

-- 2. Check campaign_users table
SELECT 'campaign_users' as table_name, COUNT(*) as record_count 
FROM campaign_users;

-- 3. Check specific campaign users
SELECT 
    c.name as campaign_name,
    COUNT(cu.id) as user_count
FROM campaigns c
LEFT JOIN campaign_users cu ON c.id = cu.campaign_id
GROUP BY c.id, c.name
ORDER BY c.created_at DESC;

-- 4. Check if unique constraint exists
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type
FROM information_schema.table_constraints tc
WHERE tc.table_name = 'campaign_users' 
AND tc.constraint_type = 'UNIQUE';

-- 5. If no users in campaign_users, manually add some for testing
-- (Only run this if campaign_users is empty)
INSERT INTO campaign_users (
    campaign_id,
    user_id,
    user_name,
    user_email,
    application_id,
    application_name,
    current_access_level,
    access_granted_date,
    is_active
)
SELECT 
    c.id as campaign_id,
    cum.user_id,
    cum.user_name,
    cum.user_email,
    c.application_id,
    cum.application_name,
    'Standard Access' as current_access_level,
    CURRENT_DATE as access_granted_date,
    true as is_active
FROM campaigns c
CROSS JOIN campaign_users_master cum
WHERE c.status = 'active'
AND cum.is_active = true
AND NOT EXISTS (
    SELECT 1 FROM campaign_users cu 
    WHERE cu.campaign_id = c.id 
    AND cu.user_id = cum.user_id
)
LIMIT 10; -- Limit to prevent too many inserts

-- 6. Check results after insert
SELECT 
    c.name as campaign_name,
    COUNT(cu.id) as user_count
FROM campaigns c
LEFT JOIN campaign_users cu ON c.id = cu.campaign_id
GROUP BY c.id, c.name
ORDER BY c.created_at DESC; 