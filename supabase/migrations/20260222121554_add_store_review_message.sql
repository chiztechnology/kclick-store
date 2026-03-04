/*
  # Add review_message to stores table

  Adds a `review_message` column to the stores table to store admin messages
  during the review process (e.g., denial reasons, additional instructions).

  1. Changes
    - `stores`: add `review_message` (text, nullable) — message shown to store owner during review
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stores' AND column_name = 'review_message'
  ) THEN
    ALTER TABLE stores ADD COLUMN review_message text;
  END IF;
END $$;
