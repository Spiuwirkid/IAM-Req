-- Upload default logo to app-logos bucket
-- This should be done via Supabase Dashboard or Storage API

-- First, make sure the bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('app-logos', 'app-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Note: To upload the actual default.png file, you need to:
-- 1. Go to Supabase Dashboard
-- 2. Navigate to Storage
-- 3. Click on 'app-logos' bucket
-- 4. Upload a default.png file
-- 5. Or use the Storage API from your application

-- Verify bucket exists
SELECT * FROM storage.buckets WHERE id = 'app-logos'; 