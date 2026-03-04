/*
  # Admin CRUD Policies and Storage Setup

  1. Changes
    - Add full CRUD policies for admins on all tables
    - Add policies for product_images and product_variants management
    - Create storage bucket for product images
    - Add admin ability to manage profiles (update roles)
  
  2. Security
    - All admin operations require authenticated user with admin role
    - Storage policies for image uploads
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage product images'
  ) THEN
    CREATE POLICY "Admins can manage product images"
      ON product_images FOR ALL
      TO authenticated
      USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
        OR product_id IN (SELECT id FROM products WHERE store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()))
      )
      WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
        OR product_id IN (SELECT id FROM products WHERE store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()))
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage product variants'
  ) THEN
    CREATE POLICY "Admins can manage product variants"
      ON product_variants FOR ALL
      TO authenticated
      USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
        OR product_id IN (SELECT id FROM products WHERE store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()))
      )
      WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
        OR product_id IN (SELECT id FROM products WHERE store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()))
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admins can update any profile'
  ) THEN
    CREATE POLICY "Admins can update any profile"
      ON profiles FOR UPDATE
      TO authenticated
      USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
      )
      WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admins can delete profiles'
  ) THEN
    CREATE POLICY "Admins can delete profiles"
      ON profiles FOR DELETE
      TO authenticated
      USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
        AND id != auth.uid()
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage orders'
  ) THEN
    CREATE POLICY "Admins can manage orders"
      ON orders FOR ALL
      TO authenticated
      USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
      )
      WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage order items'
  ) THEN
    CREATE POLICY "Admins can manage order items"
      ON order_items FOR ALL
      TO authenticated
      USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
      )
      WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage payments'
  ) THEN
    CREATE POLICY "Admins can manage payments"
      ON payments FOR ALL
      TO authenticated
      USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
      )
      WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
      );
  END IF;
END $$;

INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('store-images', 'store-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('campaign-images', 'campaign-images', true)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view product images bucket'
  ) THEN
    CREATE POLICY "Anyone can view product images bucket"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'product-images');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can upload product images'
  ) THEN
    CREATE POLICY "Authenticated users can upload product images"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id IN ('product-images', 'store-images', 'campaign-images'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can update their uploads'
  ) THEN
    CREATE POLICY "Authenticated users can update their uploads"
      ON storage.objects FOR UPDATE
      TO authenticated
      USING (bucket_id IN ('product-images', 'store-images', 'campaign-images'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can delete their uploads'
  ) THEN
    CREATE POLICY "Authenticated users can delete their uploads"
      ON storage.objects FOR DELETE
      TO authenticated
      USING (bucket_id IN ('product-images', 'store-images', 'campaign-images'));
  END IF;
END $$;