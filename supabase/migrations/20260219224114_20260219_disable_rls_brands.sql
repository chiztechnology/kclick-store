/*
  # Disable RLS on brands table

  1. Security
    - Disable RLS on `brands` table to allow public access
    - Brands data is non-sensitive and should be accessible to all users (authenticated and unauthenticated)
*/

ALTER TABLE brands DISABLE ROW LEVEL SECURITY;