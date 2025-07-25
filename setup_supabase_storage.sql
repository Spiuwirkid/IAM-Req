-- Setup Supabase Storage for Application Logos
-- This script should be run in Supabase SQL Editor

-- Create storage bucket for app logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('app-logos', 'app-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS (Row Level Security) policies for the bucket
-- Allow authenticated users to upload images
CREATE POLICY "Allow authenticated users to upload app logos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'app-logos' 
  AND auth.role() = 'authenticated'
);

-- Allow public to view app logos
CREATE POLICY "Allow public to view app logos" ON storage.objects
FOR SELECT USING (bucket_id = 'app-logos');

-- Allow authenticated users to update their uploaded images
CREATE POLICY "Allow authenticated users to update app logos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'app-logos' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete their uploaded images
CREATE POLICY "Allow authenticated users to delete app logos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'app-logos' 
  AND auth.role() = 'authenticated'
);

-- Verify bucket creation
SELECT * FROM storage.buckets WHERE id = 'app-logos';

-- Show bucket info
SELECT 
    id,
    name,
    public,
    created_at
FROM storage.buckets 
WHERE id = 'app-logos'; 