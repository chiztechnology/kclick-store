/*
  # Add store logo and cover image columns

  1. Modified Tables
    - `stores`
      - Added `logo_url` (text, optional) - Store logo image
      - Added `cover_url` (text, optional) - Store cover/banner image

  2. Notes
    - Logo is optional for backward compatibility
    - Cover image is optional
    - Both columns use Supabase storage URLs
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stores' AND column_name = 'logo_url'
  ) THEN
    ALTER TABLE stores ADD COLUMN logo_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stores' AND column_name = 'cover_url'
  ) THEN
    ALTER TABLE stores ADD COLUMN cover_url text;
  END IF;
END $$;