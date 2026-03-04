/*
  # Add dispute details to orders

  1. Changes
    - Add `dispute_type` column to track type of issue
    - Add `dispute_opened_at` column to track when dispute was opened
    - These fields enhance dispute tracking for customer-initiated disputes

  2. Security
    - No RLS changes needed (orders table already has proper RLS)
*/

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'dispute_type') THEN
    ALTER TABLE orders ADD COLUMN dispute_type text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'dispute_opened_at') THEN
    ALTER TABLE orders ADD COLUMN dispute_opened_at timestamptz;
  END IF;
END $$;
