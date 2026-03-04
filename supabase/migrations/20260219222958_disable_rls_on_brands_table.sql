/*
  # Disable RLS on brands table

  1. Security Changes
    - Disable RLS on brands table for public access
*/

ALTER TABLE brands DISABLE ROW LEVEL SECURITY;
