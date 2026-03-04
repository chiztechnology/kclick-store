/*
  # Add test variants, images and attributes to existing product

  Tests real Supabase data integration for product details page with:
  - Product variants (sizes and colors)
  - Product images
  - Product attributes (specifications)
  - Product features
*/

DO $$
DECLARE
  v_product_id uuid;
BEGIN
  -- Get the existing product
  SELECT id INTO v_product_id FROM products WHERE slug = 'veste-milano-berlusconi' LIMIT 1;
  
  IF v_product_id IS NOT NULL THEN
    -- Update product with features and specifications
    UPDATE products 
    SET 
      features = ARRAY['Tissu premium de haute qualité', 'Coupe moderne et ajustée', 'Poches intérieures et extérieures', 'Doublure entièrement doublée', 'Fermeture éclair YKK'],
      specifications = jsonb_build_object(
        'Composition Tissu', '100% Laine vierge',
        'Doublure', '100% Soie',
        'Provenance', 'Italie',
        'Lavage', 'Nettoyage à sec recommandé'
      ),
      material = 'Laine vierge',
      color = 'Noir',
      weight = 0.8,
      warranty_months = 12,
      country_of_origin = 'Italie'
    WHERE id = v_product_id;

    -- Insert product variants (sizes)
    INSERT INTO product_variants (product_id, name, value, price_modifier, stock) VALUES
      (v_product_id, 'Taille', 'XS', 0, 5),
      (v_product_id, 'Taille', 'S', 0, 8),
      (v_product_id, 'Taille', 'M', 0, 10),
      (v_product_id, 'Taille', 'L', 0, 7),
      (v_product_id, 'Taille', 'XL', 0, 4),
      (v_product_id, 'Taille', 'XXL', 5, 3)
    ON CONFLICT DO NOTHING;

    -- Insert product variants (colors)
    INSERT INTO product_variants (product_id, name, value, price_modifier, stock) VALUES
      (v_product_id, 'Couleur', 'Noir', 0, 20),
      (v_product_id, 'Couleur', 'Gris', 0, 15),
      (v_product_id, 'Couleur', 'Marron', 0, 12),
      (v_product_id, 'Couleur', 'Bleu Marine', 0, 10)
    ON CONFLICT DO NOTHING;

    -- Insert product images
    INSERT INTO product_images (product_id, url, sort_order) VALUES
      (v_product_id, 'https://images.pexels.com/photos/3622617/pexels-photo-3622617.jpeg?auto=compress&cs=tinysrgb&w=600', 0),
      (v_product_id, 'https://images.pexels.com/photos/1055691/pexels-photo-1055691.jpeg?auto=compress&cs=tinysrgb&w=600', 1),
      (v_product_id, 'https://images.pexels.com/photos/5632399/pexels-photo-5632399.jpeg?auto=compress&cs=tinysrgb&w=600', 2)
    ON CONFLICT DO NOTHING;

    -- Insert product attributes
    INSERT INTO product_attributes (product_id, attribute_name, attribute_value, attribute_type, display_order, is_visible) VALUES
      (v_product_id, 'Ajustement', 'Coupe cintrée', 'text', 1, true),
      (v_product_id, 'Type de Col', 'Col de chemise', 'text', 2, true),
      (v_product_id, 'Longueur des Manches', 'Manches longues', 'text', 3, true),
      (v_product_id, 'Doublure', 'Soie 100%', 'text', 4, true),
      (v_product_id, 'Saison', 'Toutes saisons', 'text', 5, true)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;