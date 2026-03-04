/*
  # Grant Public Access for Testing

  1. Security Changes
    - Temporarily grant all authenticated users full access to all tables
    - Allow public upload/read on storage buckets
    - FOR TESTING PURPOSES ONLY - Remove before production

  2. Tables Affected
    - profiles, stores, categories, products, product_images, product_variants
    - orders, order_items, vouchers, campaigns
    - All storage buckets
*/

-- Profiles: Allow all authenticated users to view and update
DROP POLICY IF EXISTS "Admin full access to profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Testing: All authenticated can view profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Testing: All authenticated can update profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Testing: All authenticated can insert profiles"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Testing: All authenticated can delete profiles"
  ON profiles FOR DELETE
  TO authenticated
  USING (true);

-- Stores: Allow all authenticated users full CRUD
DROP POLICY IF EXISTS "Anyone can view stores" ON stores;
DROP POLICY IF EXISTS "Admin full access to stores" ON stores;
DROP POLICY IF EXISTS "Store managers can view their store" ON stores;
DROP POLICY IF EXISTS "Store managers can update their store" ON stores;

CREATE POLICY "Testing: All authenticated full access to stores"
  ON stores FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Categories: Allow all authenticated users full CRUD
DROP POLICY IF EXISTS "Anyone can view categories" ON categories;
DROP POLICY IF EXISTS "Admin full access to categories" ON categories;

CREATE POLICY "Testing: All authenticated full access to categories"
  ON categories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Products: Allow all authenticated users full CRUD
DROP POLICY IF EXISTS "Anyone can view products" ON products;
DROP POLICY IF EXISTS "Admin full access to products" ON products;
DROP POLICY IF EXISTS "Store managers can manage their products" ON products;

CREATE POLICY "Testing: All authenticated full access to products"
  ON products FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Product Images: Allow all authenticated users full CRUD
DROP POLICY IF EXISTS "Anyone can view product images" ON product_images;
DROP POLICY IF EXISTS "Admin full access to product images" ON product_images;

CREATE POLICY "Testing: All authenticated full access to product_images"
  ON product_images FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Product Variants: Allow all authenticated users full CRUD
DROP POLICY IF EXISTS "Anyone can view product variants" ON product_variants;
DROP POLICY IF EXISTS "Admin full access to product variants" ON product_variants;

CREATE POLICY "Testing: All authenticated full access to product_variants"
  ON product_variants FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Orders: Allow all authenticated users full CRUD
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can create orders" ON orders;
DROP POLICY IF EXISTS "Admin full access to orders" ON orders;
DROP POLICY IF EXISTS "Store managers can view their orders" ON orders;

CREATE POLICY "Testing: All authenticated full access to orders"
  ON orders FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Order Items: Allow all authenticated users full CRUD
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
DROP POLICY IF EXISTS "Users can create order items" ON order_items;
DROP POLICY IF EXISTS "Admin full access to order items" ON order_items;

CREATE POLICY "Testing: All authenticated full access to order_items"
  ON order_items FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Vouchers: Allow all authenticated users full CRUD
DROP POLICY IF EXISTS "Anyone can view active vouchers" ON vouchers;
DROP POLICY IF EXISTS "Admin full access to vouchers" ON vouchers;

CREATE POLICY "Testing: All authenticated full access to vouchers"
  ON vouchers FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Campaigns: Allow all authenticated users full CRUD
DROP POLICY IF EXISTS "Anyone can view active campaigns" ON campaigns;
DROP POLICY IF EXISTS "Admin full access to campaigns" ON campaigns;

CREATE POLICY "Testing: All authenticated full access to campaigns"
  ON campaigns FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Storage: Grant public access to all buckets
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload store images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view store images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete store images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload campaign images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view campaign images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete campaign images" ON storage.objects;

CREATE POLICY "Testing: All authenticated can upload to any bucket"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Testing: Anyone can view storage objects"
  ON storage.objects FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Testing: All authenticated can update storage objects"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Testing: All authenticated can delete storage objects"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (true);