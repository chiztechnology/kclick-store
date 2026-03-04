/*
  # Add Store Manager and Admin Access Policies

  1. Changes
    - Add policy for store managers to view their own store
    - Add policy for admins to view all profiles
    - Add policy for admins to view all stores (including inactive)
    - Add policy for store managers to update their associated store
    
  2. Security
    - Store managers can only access their assigned store
    - Admins have full visibility for management purposes
    - All policies require authentication
*/

CREATE POLICY "Store managers can view their store"
  ON stores FOR SELECT
  TO authenticated
  USING (
    id IN (SELECT store_id FROM profiles WHERE id = auth.uid() AND role = 'store_manager')
  );

CREATE POLICY "Store managers can update their store"
  ON stores FOR UPDATE
  TO authenticated
  USING (
    id IN (SELECT store_id FROM profiles WHERE id = auth.uid() AND role = 'store_manager')
  )
  WITH CHECK (
    id IN (SELECT store_id FROM profiles WHERE id = auth.uid() AND role = 'store_manager')
  );

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can view all stores"
  ON stores FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );