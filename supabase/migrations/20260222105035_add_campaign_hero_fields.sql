/*
  # Add Hero Slider Fields to Campaigns

  Adds optional hero-display columns to the campaigns table so that
  a campaign's banner can appear in the homepage hero slider.

  1. New Columns on `campaigns`
    - `show_in_hero` (boolean, default false) — opt-in to show in hero slider
    - `hero_title` (text) — headline text for the slide
    - `hero_subtitle` (text) — subtitle text
    - `hero_link_url` (text) — CTA button link
*/

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='campaigns' AND column_name='show_in_hero') THEN
    ALTER TABLE campaigns ADD COLUMN show_in_hero boolean DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='campaigns' AND column_name='hero_title') THEN
    ALTER TABLE campaigns ADD COLUMN hero_title text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='campaigns' AND column_name='hero_subtitle') THEN
    ALTER TABLE campaigns ADD COLUMN hero_subtitle text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='campaigns' AND column_name='hero_link_url') THEN
    ALTER TABLE campaigns ADD COLUMN hero_link_url text DEFAULT '';
  END IF;
END $$;
