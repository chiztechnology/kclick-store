/*
  # Create category-images storage bucket

  Creates a public storage bucket for category images so admins
  can upload pictures that display in the category grid on the homepage.
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('category-images', 'category-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read category images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'category-images');

CREATE POLICY "Authenticated upload category images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'category-images');

CREATE POLICY "Authenticated update category images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'category-images');

CREATE POLICY "Authenticated delete category images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'category-images');
