/*
  # Add barcode column to products table

  Adds a `barcode` column to support EAN, UPC, QR or any barcode format
  scanned via a USB barcode reader.

  1. Modified Tables
    - `products`
      - `barcode` (text, nullable) — stores the raw scanned barcode string
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'barcode'
  ) THEN
    ALTER TABLE products ADD COLUMN barcode text DEFAULT NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode) WHERE barcode IS NOT NULL;
