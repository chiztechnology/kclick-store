/*
  # Create store-images storage bucket

  1. New Storage Bucket
    - `store-images` - For storing store logos and cover images
      - Public read access (anyone can view)
      - Authenticated write access (only store owners can upload)
      - Max file size: 5MB
*/

-- Storage bucket is managed via Supabase dashboard or API
-- This migration documents the bucket structure
-- The bucket will be created manually through Supabase dashboard if not already present