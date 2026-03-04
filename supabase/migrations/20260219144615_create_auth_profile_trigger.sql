/*
  # Auth Profile Auto-Creation

  1. Functions
    - `handle_new_user()` - Automatically creates a profile when a user signs up
  
  2. Triggers
    - Trigger on `auth.users` insert to create profile
  
  3. Security
    - Function runs with security definer to bypass RLS
    - Only creates profile for the new user
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.phone, ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    'customer'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();