-- Fix applications table logo column to support larger image data
-- Change from VARCHAR(500) to TEXT to support base64 images

-- Check current column type
SELECT 
    column_name, 
    data_type, 
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'applications' 
AND column_name = 'logo';

-- Alter the logo column to TEXT type (unlimited length)
ALTER TABLE applications 
ALTER COLUMN logo TYPE TEXT;

-- Add comment to document the change
COMMENT ON COLUMN applications.logo IS 'Base64 encoded image data or file path for application logo';

-- Verify the change
SELECT 
    column_name, 
    data_type, 
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'applications' 
AND column_name = 'logo';

-- Update existing records to use placeholder if logo is too long
UPDATE applications 
SET logo = '/app-logo/default.png' 
WHERE logo IS NOT NULL 
AND length(logo) > 500;

-- Show current applications with their logo status
SELECT 
    id,
    name,
    CASE 
        WHEN logo IS NULL THEN 'No logo'
        WHEN logo = '/app-logo/default.png' THEN 'Default logo'
        WHEN logo LIKE 'data:%' THEN 'Base64 image'
        ELSE 'File path: ' || logo
    END as logo_status,
    length(logo) as logo_length
FROM applications
ORDER BY name; 