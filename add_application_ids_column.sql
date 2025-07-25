-- Add application_ids column to campaigns table
ALTER TABLE campaigns 
ADD COLUMN application_ids TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Update existing campaigns to have application_ids based on their application_id
UPDATE campaigns 
SET application_ids = ARRAY[application_id] 
WHERE application_ids IS NULL OR array_length(application_ids, 1) IS NULL;

-- Add comment to document the column
COMMENT ON COLUMN campaigns.application_ids IS 'Array of application IDs that this campaign audits'; 