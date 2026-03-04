/*
  # Enhanced Products Schema for Modern E-commerce

  1. New Columns on `products` table:
    - `sku` (text) - Stock Keeping Unit for inventory
    - `barcode` (text) - Universal product barcode (UPC/EAN)
    - `brand_id` (uuid) - Reference to brands table
    - `weight` (numeric) - Product weight in kg
    - `weight_unit` (text) - kg, g, lb, oz
    - `dimensions` (jsonb) - length, width, height
    - `material` (text) - Primary material
    - `color` (text) - Main product color
    - `size` (text) - Standard size
    - `gender` (text) - Target gender (men, women, unisex, kids)
    - `age_group` (text) - Target age group
    - `condition` (text) - new, refurbished, used
    - `warranty_months` (integer) - Warranty duration
    - `country_of_origin` (text) - Manufacturing country
    - `meta_title` (text) - SEO title
    - `meta_description` (text) - SEO description
    - `specifications` (jsonb) - Key-value specifications
    - `features` (text[]) - Product features list
    - `shipping_class` (text) - standard, express, freight
    - `is_digital` (boolean) - Digital product flag
    - `min_order_qty` (integer) - Minimum order quantity
    - `max_order_qty` (integer) - Maximum order quantity
    - `low_stock_threshold` (integer) - Alert threshold
    - `backorder_allowed` (boolean) - Allow backorders
    - `preorder_date` (timestamptz) - Preorder availability
    - `published_at` (timestamptz) - Publication date
    - `slug` (text) - URL-friendly identifier

  2. New Table: `store_products`
    - Tracks inventory per store
    - Allows different pricing per store
    - Manages stock levels independently
    - Low stock alerts per store

  3. New Table: `product_attributes`
    - Flexible attribute storage
    - Supports any product type

  4. New Table: `stock_movements`
    - Track all inventory changes
    - Audit trail for stock

  5. Security
    - RLS enabled on all new tables
    - Policies for authenticated access
*/

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'sku') THEN
    ALTER TABLE products ADD COLUMN sku text DEFAULT '';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'barcode') THEN
    ALTER TABLE products ADD COLUMN barcode text DEFAULT '';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'brand_id') THEN
    ALTER TABLE products ADD COLUMN brand_id uuid REFERENCES brands(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'weight') THEN
    ALTER TABLE products ADD COLUMN weight numeric DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'weight_unit') THEN
    ALTER TABLE products ADD COLUMN weight_unit text DEFAULT 'kg' CHECK (weight_unit IN ('kg', 'g', 'lb', 'oz'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'dimensions') THEN
    ALTER TABLE products ADD COLUMN dimensions jsonb DEFAULT '{"length": 0, "width": 0, "height": 0, "unit": "cm"}'::jsonb;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'material') THEN
    ALTER TABLE products ADD COLUMN material text DEFAULT '';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'color') THEN
    ALTER TABLE products ADD COLUMN color text DEFAULT '';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'size') THEN
    ALTER TABLE products ADD COLUMN size text DEFAULT '';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'gender') THEN
    ALTER TABLE products ADD COLUMN gender text DEFAULT 'unisex' CHECK (gender IN ('men', 'women', 'unisex', 'kids', 'baby'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'age_group') THEN
    ALTER TABLE products ADD COLUMN age_group text DEFAULT 'adult' CHECK (age_group IN ('newborn', 'infant', 'toddler', 'kids', 'teen', 'adult'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'condition') THEN
    ALTER TABLE products ADD COLUMN condition text DEFAULT 'new' CHECK (condition IN ('new', 'refurbished', 'used', 'open_box'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'warranty_months') THEN
    ALTER TABLE products ADD COLUMN warranty_months integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'country_of_origin') THEN
    ALTER TABLE products ADD COLUMN country_of_origin text DEFAULT '';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'meta_title') THEN
    ALTER TABLE products ADD COLUMN meta_title text DEFAULT '';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'meta_description') THEN
    ALTER TABLE products ADD COLUMN meta_description text DEFAULT '';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'specifications') THEN
    ALTER TABLE products ADD COLUMN specifications jsonb DEFAULT '{}'::jsonb;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'features') THEN
    ALTER TABLE products ADD COLUMN features text[] DEFAULT '{}'::text[];
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'shipping_class') THEN
    ALTER TABLE products ADD COLUMN shipping_class text DEFAULT 'standard' CHECK (shipping_class IN ('standard', 'express', 'freight', 'digital'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'is_digital') THEN
    ALTER TABLE products ADD COLUMN is_digital boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'min_order_qty') THEN
    ALTER TABLE products ADD COLUMN min_order_qty integer DEFAULT 1;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'max_order_qty') THEN
    ALTER TABLE products ADD COLUMN max_order_qty integer DEFAULT 100;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'low_stock_threshold') THEN
    ALTER TABLE products ADD COLUMN low_stock_threshold integer DEFAULT 10;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'backorder_allowed') THEN
    ALTER TABLE products ADD COLUMN backorder_allowed boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'preorder_date') THEN
    ALTER TABLE products ADD COLUMN preorder_date timestamptz;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'published_at') THEN
    ALTER TABLE products ADD COLUMN published_at timestamptz DEFAULT now();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'slug') THEN
    ALTER TABLE products ADD COLUMN slug text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'updated_at') THEN
    ALTER TABLE products ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS store_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  price numeric NOT NULL DEFAULT 0,
  compare_at_price numeric DEFAULT 0,
  cost_price numeric DEFAULT 0,
  stock integer NOT NULL DEFAULT 0,
  reserved_stock integer DEFAULT 0,
  low_stock_threshold integer DEFAULT 10,
  sku text DEFAULT '',
  barcode text DEFAULT '',
  location text DEFAULT '',
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(store_id, product_id)
);

CREATE TABLE IF NOT EXISTS stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_product_id uuid REFERENCES store_products(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE,
  movement_type text NOT NULL CHECK (movement_type IN ('in', 'out', 'adjustment', 'transfer', 'return', 'damaged', 'expired')),
  quantity integer NOT NULL,
  previous_stock integer DEFAULT 0,
  new_stock integer DEFAULT 0,
  reference_type text DEFAULT '',
  reference_id uuid,
  notes text DEFAULT '',
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_attributes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  attribute_name text NOT NULL,
  attribute_value text NOT NULL,
  attribute_type text DEFAULT 'text' CHECK (attribute_type IN ('text', 'number', 'boolean', 'color', 'size', 'date')),
  display_order integer DEFAULT 0,
  is_filterable boolean DEFAULT false,
  is_visible boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_products_slug') THEN
    CREATE INDEX idx_products_slug ON products(slug);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_products_brand_id') THEN
    CREATE INDEX idx_products_brand_id ON products(brand_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_products_sku') THEN
    CREATE INDEX idx_products_sku ON products(sku);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_store_products_store_id') THEN
    CREATE INDEX idx_store_products_store_id ON store_products(store_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_store_products_product_id') THEN
    CREATE INDEX idx_store_products_product_id ON store_products(product_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_stock_movements_store_product') THEN
    CREATE INDEX idx_stock_movements_store_product ON stock_movements(store_product_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_product_attributes_product_id') THEN
    CREATE INDEX idx_product_attributes_product_id ON product_attributes(product_id);
  END IF;
END $$;

ALTER TABLE store_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_attributes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read store_products" ON store_products;
CREATE POLICY "Public read store_products" ON store_products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated manage store_products" ON store_products;
CREATE POLICY "Authenticated manage store_products" ON store_products FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated read stock_movements" ON stock_movements;
CREATE POLICY "Authenticated read stock_movements" ON stock_movements FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated insert stock_movements" ON stock_movements;
CREATE POLICY "Authenticated insert stock_movements" ON stock_movements FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Public read product_attributes" ON product_attributes;
CREATE POLICY "Public read product_attributes" ON product_attributes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated manage product_attributes" ON product_attributes;
CREATE POLICY "Authenticated manage product_attributes" ON product_attributes FOR ALL TO authenticated USING (true) WITH CHECK (true);
