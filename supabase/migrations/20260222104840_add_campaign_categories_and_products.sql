/*
  # Campaign Categories & Products Association

  Adds a join table so campaigns can target specific categories and
  a campaign_products table for explicit product targeting.

  1. New Tables
    - `campaign_categories` - links campaigns to category IDs
      - `campaign_id` (uuid, FK campaigns)
      - `category_id` (uuid, FK categories)
    - `campaign_products` - links campaigns to specific product IDs
      - `campaign_id` (uuid, FK campaigns)
      - `product_id` (uuid, FK products)

  2. Notes
    - When both tables are empty for a campaign → applies to ALL products
    - When campaign_categories has rows → applies to products in those categories
    - When campaign_products has rows → applies to explicitly listed products
    - RLS follows the same pattern as campaigns (public read, admin write)
*/

CREATE TABLE IF NOT EXISTS campaign_categories (
  campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (campaign_id, category_id)
);

ALTER TABLE campaign_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view campaign categories"
  ON campaign_categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage campaign categories"
  ON campaign_categories FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','store_manager'))
  );

CREATE POLICY "Admins can delete campaign categories"
  ON campaign_categories FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','store_manager'))
  );

CREATE TABLE IF NOT EXISTS campaign_products (
  campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  PRIMARY KEY (campaign_id, product_id)
);

ALTER TABLE campaign_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view campaign products"
  ON campaign_products FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage campaign products"
  ON campaign_products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','store_manager'))
  );

CREATE POLICY "Admins can delete campaign products"
  ON campaign_products FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','store_manager'))
  );
