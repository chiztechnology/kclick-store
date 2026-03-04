/*
  # Add Store Policies

  1. Changes
    - Add shipping_policy column to stores table
    - Add return_policy column to stores table
    - Add delivery_terms column to stores table

  2. Notes
    - These fields will be displayed when customers browse products
    - Helps customers make informed purchasing decisions
    - Store managers can edit these via store settings
*/

-- Add policy fields to stores table
ALTER TABLE stores
ADD COLUMN IF NOT EXISTS shipping_policy text DEFAULT '',
ADD COLUMN IF NOT EXISTS return_policy text DEFAULT '',
ADD COLUMN IF NOT EXISTS delivery_terms text DEFAULT '';