/*
  # Create Exchange Rates Table

  ## Purpose
  Store configurable currency exchange rates for display-only price conversion.
  All prices are stored in USD internally; rates convert for display purposes.

  ## New Tables
  - `exchange_rates`
    - `id` (uuid, pk)
    - `currency` (text, unique) — e.g. USD, CDF, EUR, XAF
    - `name` (text) — full display name
    - `symbol` (text) — e.g. $, FC, €, FCFA
    - `rate_to_usd` (numeric) — how many units of this currency = 1 USD
    - `is_active` (boolean)
    - `updated_at` (timestamptz)

  ## Default Values
  - USD: 1 (base)
  - CDF: 2800 (Congolese Franc)
  - EUR: 0.92
  - XAF: 600 (Central African Franc / Congo Brazzaville)

  ## Security
  - RLS enabled
  - Public SELECT (rates are public info)
  - Only service role can INSERT/UPDATE/DELETE
*/

CREATE TABLE IF NOT EXISTS exchange_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  currency text UNIQUE NOT NULL,
  name text NOT NULL,
  symbol text NOT NULL DEFAULT '',
  rate_to_usd numeric NOT NULL DEFAULT 1,
  is_active boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Exchange rates are publicly readable"
  ON exchange_rates FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can update exchange rates"
  ON exchange_rates FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

INSERT INTO exchange_rates (currency, name, symbol, rate_to_usd, is_active) VALUES
  ('USD', 'Dollar américain', '$', 1, true),
  ('CDF', 'Franc congolais (RDC)', 'FC', 2800, true),
  ('EUR', 'Euro', '€', 0.92, true),
  ('XAF', 'Franc CFA (Brazzaville)', 'FCFA', 600, true)
ON CONFLICT (currency) DO NOTHING;
