-- Fix campaign_users duplication and improve structure for multiple applications

-- 1. Add unique constraint to prevent duplicate users per campaign
ALTER TABLE campaign_users 
ADD CONSTRAINT unique_campaign_user 
UNIQUE (campaign_id, user_id);

-- 2. Add application_ids column to campaigns table if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'campaigns' AND column_name = 'application_ids') THEN
        ALTER TABLE campaigns ADD COLUMN application_ids TEXT[] DEFAULT ARRAY[]::TEXT[];
    END IF;
END $$;

-- 3. Update existing campaigns to have application_ids based on their application_id
UPDATE campaigns 
SET application_ids = ARRAY[application_id] 
WHERE application_ids IS NULL OR array_length(application_ids, 1) IS NULL;

-- 4. Remove duplicate users from campaign_users (keep only the first occurrence)
DELETE FROM campaign_users 
WHERE id NOT IN (
    SELECT MIN(id) 
    FROM campaign_users 
    GROUP BY campaign_id, user_id
);

-- 5. Add index for better performance
CREATE INDEX IF NOT EXISTS idx_campaign_users_campaign_user 
ON campaign_users(campaign_id, user_id);

-- 6. Add comment to document the structure
COMMENT ON TABLE campaign_users IS 'Users assigned to campaigns for audit review';
COMMENT ON COLUMN campaigns.application_ids IS 'Array of application IDs that this campaign audits';
