-- Super simple script to add users to campaigns
-- Only uses basic columns that definitely exist

-- 1. Check current state
SELECT 'Current campaigns and users:' as info;
SELECT 
    c.name as campaign_name,
    COUNT(cu.id) as user_count
FROM campaigns c
LEFT JOIN campaign_users cu ON c.id = cu.campaign_id
GROUP BY c.id, c.name
ORDER BY c.created_at DESC;

-- 2. Check master users structure
SELECT 'Master users columns:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'campaign_users_master'
ORDER BY ordinal_position;

-- 3. Check master users count
SELECT 'Master users available:' as info;
SELECT COUNT(*) as total_users FROM campaign_users_master WHERE is_active = true;

-- 4. Super simple insert - only use basic columns
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
    'Unknown Application' as application_name,
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
);

-- 5. Check results
SELECT 'After adding users:' as info;
SELECT 
    c.name as campaign_name,
    COUNT(cu.id) as user_count
FROM campaigns c
LEFT JOIN campaign_users cu ON c.id = cu.campaign_id
GROUP BY c.id, c.name
ORDER BY c.created_at DESC; 