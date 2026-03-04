
/*
  # Orders, Payments, Vouchers & Marketing Tables

  1. New Tables
    - `orders` - Customer orders
    - `order_items` - Line items per order
    - `payments` - Payment records (M-Pesa + Bank)
    - `vouchers` - Discount vouchers/promo codes
    - `voucher_usages` - Track voucher usage per user
    - `campaigns` - Marketing campaigns
    - `banners` - Homepage/promotional banners
    - `reviews` - Product reviews
    - `wishlists` - User wishlists

  2. Security
    - RLS enabled on all tables
*/

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  store_id uuid REFERENCES stores(id),
  status text DEFAULT 'pending' CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled','refunded')),
  subtotal numeric DEFAULT 0,
  discount_amount numeric DEFAULT 0,
  total numeric DEFAULT 0,
  voucher_id uuid,
  voucher_code text DEFAULT '',
  shipping_name text DEFAULT '',
  shipping_phone text DEFAULT '',
  shipping_address text DEFAULT '',
  shipping_city text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users and managers can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    user_id = auth.uid()
    OR store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id),
  product_name text NOT NULL,
  product_image text DEFAULT '',
  variant text DEFAULT '',
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  total_price numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    order_id IN (
      SELECT id FROM orders WHERE user_id = auth.uid()
      UNION
      SELECT id FROM orders WHERE store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
    )
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can create order items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    order_id IN (SELECT id FROM orders WHERE user_id = auth.uid())
  );

CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id),
  user_id uuid REFERENCES profiles(id),
  method text NOT NULL CHECK (method IN ('mpesa','bank_card','bank_transfer')),
  status text DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','failed','refunded')),
  amount numeric NOT NULL DEFAULT 0,
  currency text DEFAULT 'USD',
  transaction_ref text DEFAULT '',
  phone_number text DEFAULT '',
  card_last4 text DEFAULT '',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can create payments"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS vouchers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  discount_type text DEFAULT 'percent' CHECK (discount_type IN ('percent','fixed')),
  discount_value numeric NOT NULL DEFAULT 0,
  min_order_amount numeric DEFAULT 0,
  max_discount_amount numeric DEFAULT 0,
  usage_limit integer DEFAULT 0,
  used_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  starts_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  store_id uuid REFERENCES stores(id),
  created_by uuid,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active vouchers"
  ON vouchers FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage vouchers"
  ON vouchers FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','store_manager'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','store_manager'))
  );

CREATE TABLE IF NOT EXISTS voucher_usages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_id uuid REFERENCES vouchers(id),
  user_id uuid REFERENCES profiles(id),
  order_id uuid REFERENCES orders(id),
  used_at timestamptz DEFAULT now()
);

ALTER TABLE voucher_usages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own voucher usages"
  ON voucher_usages FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert voucher usages"
  ON voucher_usages FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  type text DEFAULT 'flash_sale' CHECK (type IN ('flash_sale','seasonal','clearance','new_arrival','featured')),
  banner_url text DEFAULT '',
  discount_percent integer DEFAULT 0,
  starts_at timestamptz DEFAULT now(),
  ends_at timestamptz,
  is_active boolean DEFAULT true,
  store_id uuid REFERENCES stores(id),
  created_by uuid,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active campaigns"
  ON campaigns FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage campaigns"
  ON campaigns FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','store_manager'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','store_manager'))
  );

CREATE TABLE IF NOT EXISTS banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text DEFAULT '',
  image_url text NOT NULL,
  link_url text DEFAULT '',
  position text DEFAULT 'hero' CHECK (position IN ('hero','sidebar','category','flash_sale')),
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  starts_at timestamptz DEFAULT now(),
  ends_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active banners"
  ON banners FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage banners"
  ON banners FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id),
  user_name text DEFAULT '',
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text DEFAULT '',
  images text[] DEFAULT '{}',
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS wishlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own wishlist"
  ON wishlists FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can add to wishlist"
  ON wishlists FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove from wishlist"
  ON wishlists FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
