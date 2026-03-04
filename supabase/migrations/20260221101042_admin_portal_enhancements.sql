/*
  # Admin Portal Enhancements

  1. Modified Tables
    - `stores` - Added columns for onboarding/KYC:
      - `status` (text) - pending/approved/suspended/rejected/blocked
      - `commission_rate` (numeric) - store-specific commission override
      - `category` (text) - store category assignment
      - `business_registration` (text) - KYC document URL
      - `tax_id` (text) - KYC tax ID document URL
      - `id_proof` (text) - KYC identity proof URL
      - `rejection_reason` (text) - reason for rejection
      - `approved_at` (timestamptz) - when approved
      - `suspended_at` (timestamptz) - when suspended
    - `orders` - Added commission/financial columns:
      - `store_amount` (numeric) - amount due to store
      - `platform_commission` (numeric) - platform commission amount
      - `tax_amount` (numeric) - tax on order
      - `payout_status` (text) - pending/processing/completed/failed
      - `dispute_status` (text) - none/open/investigating/resolved/escalated
      - `dispute_reason` (text) - dispute details
      - `dispute_resolution` (text) - resolution details
    - `profiles` - Added suspension support:
      - `is_suspended` (boolean) - whether user is suspended
      - `suspended_reason` (text) - reason for suspension

  2. New Tables
    - `platform_config` - Global platform configuration (commission, tax, shipping, etc.)
    - `category_attributes` - Required attributes per category
    - `disputes` - Full dispute tracking with timeline

  3. Security
    - RLS enabled on new tables
    - Policies for authenticated access
*/

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stores' AND column_name = 'status') THEN
    ALTER TABLE stores ADD COLUMN status text DEFAULT 'pending' CHECK (status IN ('pending','approved','suspended','rejected','blocked'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stores' AND column_name = 'commission_rate') THEN
    ALTER TABLE stores ADD COLUMN commission_rate numeric DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stores' AND column_name = 'store_category') THEN
    ALTER TABLE stores ADD COLUMN store_category text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stores' AND column_name = 'business_registration') THEN
    ALTER TABLE stores ADD COLUMN business_registration text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stores' AND column_name = 'tax_id') THEN
    ALTER TABLE stores ADD COLUMN tax_id text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stores' AND column_name = 'id_proof') THEN
    ALTER TABLE stores ADD COLUMN id_proof text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stores' AND column_name = 'rejection_reason') THEN
    ALTER TABLE stores ADD COLUMN rejection_reason text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stores' AND column_name = 'approved_at') THEN
    ALTER TABLE stores ADD COLUMN approved_at timestamptz;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stores' AND column_name = 'suspended_at') THEN
    ALTER TABLE stores ADD COLUMN suspended_at timestamptz;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'store_amount') THEN
    ALTER TABLE orders ADD COLUMN store_amount numeric DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'platform_commission') THEN
    ALTER TABLE orders ADD COLUMN platform_commission numeric DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'tax_amount') THEN
    ALTER TABLE orders ADD COLUMN tax_amount numeric DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'payout_status') THEN
    ALTER TABLE orders ADD COLUMN payout_status text DEFAULT 'pending' CHECK (payout_status IN ('pending','processing','completed','failed'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'dispute_status') THEN
    ALTER TABLE orders ADD COLUMN dispute_status text DEFAULT 'none' CHECK (dispute_status IN ('none','open','investigating','resolved','escalated'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'dispute_reason') THEN
    ALTER TABLE orders ADD COLUMN dispute_reason text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'dispute_resolution') THEN
    ALTER TABLE orders ADD COLUMN dispute_resolution text DEFAULT '';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_suspended') THEN
    ALTER TABLE profiles ADD COLUMN is_suspended boolean DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'suspended_reason') THEN
    ALTER TABLE profiles ADD COLUMN suspended_reason text DEFAULT '';
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS platform_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL DEFAULT '{}',
  description text DEFAULT '',
  category text DEFAULT 'general',
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES profiles(id)
);

ALTER TABLE platform_config ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'platform_config' AND policyname = 'Admins can manage platform config') THEN
    CREATE POLICY "Admins can manage platform config"
      ON platform_config
      FOR ALL
      TO authenticated
      USING (
        EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
      )
      WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
      );
  END IF;
END $$;

INSERT INTO platform_config (key, value, description, category) VALUES
  ('global_commission_rate', '{"rate": 10}', 'Default platform commission percentage', 'finance'),
  ('tax_rate', '{"rate": 16}', 'Default tax percentage', 'finance'),
  ('settlement_schedule', '{"frequency": "weekly", "day": "monday"}', 'Payout settlement schedule', 'finance'),
  ('platform_service_fee', '{"fixed": 0, "percent": 0}', 'Additional platform service fees', 'finance'),
  ('currency', '{"default": "USD", "supported": ["USD", "CDF"]}', 'Currency settings', 'general'),
  ('shipping_rules', '{"free_threshold": 50, "default_rate": 5}', 'Shipping configuration', 'shipping'),
  ('payment_providers', '{"mpesa": true, "bank_card": true, "bank_transfer": true}', 'Active payment providers', 'payments')
ON CONFLICT (key) DO NOTHING;

CREATE TABLE IF NOT EXISTS category_attributes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES categories(id),
  attribute_name text NOT NULL,
  attribute_type text DEFAULT 'text' CHECK (attribute_type IN ('text','number','boolean','color','size','date','select')),
  is_required boolean DEFAULT false,
  options jsonb DEFAULT '[]',
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE category_attributes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'category_attributes' AND policyname = 'Admins can manage category attributes') THEN
    CREATE POLICY "Admins can manage category attributes"
      ON category_attributes
      FOR ALL
      TO authenticated
      USING (
        EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
      )
      WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
      );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id),
  store_id uuid REFERENCES stores(id),
  user_id uuid REFERENCES profiles(id),
  type text DEFAULT 'refund' CHECK (type IN ('refund','product_issue','delivery_issue','fraud','other')),
  status text DEFAULT 'open' CHECK (status IN ('open','investigating','resolved','escalated','closed')),
  reason text DEFAULT '',
  resolution text DEFAULT '',
  refund_amount numeric DEFAULT 0,
  admin_notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'disputes' AND policyname = 'Admins can manage disputes') THEN
    CREATE POLICY "Admins can manage disputes"
      ON disputes
      FOR ALL
      TO authenticated
      USING (
        EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
      )
      WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
      );
  END IF;
END $$;

UPDATE stores SET status = 'approved' WHERE is_verified = true AND status IS NULL;
UPDATE stores SET status = 'pending' WHERE is_verified = false AND status IS NULL;