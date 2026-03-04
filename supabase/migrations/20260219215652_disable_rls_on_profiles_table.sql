/*
  # Disable RLS on Profiles Table

  1. Security Changes
    - Disable RLS on profiles table to fix infinite recursion error
    - All other tables keep RLS enabled but with testing policies
    - FOR TESTING PURPOSES ONLY
*/

-- Disable RLS on profiles table
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Drop all profiles policies
DROP POLICY IF EXISTS "Testing: All authenticated can view profiles" ON profiles;
DROP POLICY IF EXISTS "Testing: All authenticated can update profiles" ON profiles;
DROP POLICY IF EXISTS "Testing: All authenticated can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Testing: All authenticated can delete profiles" ON profiles;
DROP POLICY IF EXISTS "Admin full access to profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;