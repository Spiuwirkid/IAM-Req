-- Manually add users to existing campaigns

-- 1. Check current state
SELECT 'Current state:' as info;
SELECT 
    c.name as campaign_name,
    c.id as campaign_id,
    COUNT(cu.id) as user_count
FROM campaigns c
LEFT JOIN campaign_users cu ON c.id = cu.campaign_id
GROUP BY c.id, c.name
ORDER BY c.created_at DESC;

-- 2. Add users to campaigns that don't have any
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
    COALESCE(a.name, 'Unknown Application') as application_name,
    CASE 
        WHEN cum.position ILIKE '%admin%' THEN 'Admin Access'
        WHEN cum.position ILIKE '%engineer%' OR cum.position ILIKE '%devops%' THEN 'Full Access'
        WHEN cum.position ILIKE '%developer%' THEN 'Developer Access'
        WHEN cum.position ILIKE '%analyst%' THEN 'Analyst Access'
        ELSE 'Standard Access'
    END as current_access_level,
    COALESCE(cum.access_date, CURRENT_DATE) as access_granted_date,
    true as is_active
FROM campaigns c
CROSS JOIN campaign_users_master cum
LEFT JOIN applications a ON c.application_id = a.id
WHERE c.status = 'active'
AND cum.is_active = true
AND NOT EXISTS (
    SELECT 1 FROM campaign_users cu 
    WHERE cu.campaign_id = c.id 
    AND cu.user_id = cum.user_id
);

-- 3. Check results after insert
SELECT 'After adding users:' as info;
SELECT 
    c.name as campaign_name,
    c.id as campaign_id,
    COUNT(cu.id) as user_count
FROM campaigns c
LEFT JOIN campaign_users cu ON c.id = cu.campaign_id
GROUP BY c.id, c.name
ORDER BY c.created_at DESC;

-- 4. Show sample users for verification
SELECT 
    c.name as campaign_name,
    cu.user_name,
    cu.user_email,
    cu.application_name,
    cu.current_access_level
FROM campaigns c
JOIN campaign_users cu ON c.id = cu.campaign_id
WHERE c.status = 'active'
ORDER BY c.name, cu.user_name
LIMIT 10; 