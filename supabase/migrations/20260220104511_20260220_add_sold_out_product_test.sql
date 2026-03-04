/*
  # Add a sold-out product for testing

  Creates a test product with zero stock to demonstrate:
  - Sold out watermark overlay
  - Similar products suggestion
  - Disabled purchase buttons
*/

DO $$
DECLARE
  v_store_id uuid;
  v_category_id uuid;
  v_sold_out_product_id uuid;
BEGIN
  -- Get an existing store and category
  SELECT id INTO v_store_id FROM stores LIMIT 1;
  SELECT id INTO v_category_id FROM categories WHERE slug = 'fashion' LIMIT 1;
  
  IF v_store_id IS NOT NULL AND v_category_id IS NOT NULL THEN
    -- Insert a sold-out product
    INSERT INTO products (
      store_id, 
      category_id, 
      name, 
      description, 
      price, 
      original_price,
      discount_percent,
      stock,
      sold_count,
      rating,
      review_count,
      image_url,
      slug,
      sku,
      brand_id,
      material,
      color,
      features,
      specifications,
      warranty_months,
      country_of_origin,
      is_active
    ) VALUES (
      v_store_id,
      v_category_id,
      'Manteau d''Hiver Premium VENDU',
      'Manteau d''hiver élégant et chaud, malheureusement épuisé. Un best-seller de notre collection.',
      199,
      299,
      33,
      0,
      247,
      4.8,
      45,
      'https://images.pexels.com/photos/1038000/pexels-photo-1038000.jpeg?auto=compress&cs=tinysrgb&w=600',
      'manteau-hiver-premium-vendu',
      'COAT-WINTER-001',
      (SELECT id FROM brands WHERE slug = 'zara' LIMIT 1),
      'Laine mélangée',
      'Beige',
      ARRAY['Isolation thermique supérieure', 'Col montant', 'Poches doublées', 'Coupe longue', 'Boutons dorés'],
      jsonb_build_object(
        'Composition', '70% Laine, 30% Polyester',
        'Doublure', '100% Polyester',
        'Longueur', '95 cm',
        'Entretien', 'Nettoyage à sec uniquement'
      ),
      24,
      'Turquie',
      true
    )
    RETURNING id INTO v_sold_out_product_id;

    -- Add product images
    INSERT INTO product_images (product_id, url, sort_order) VALUES
      (v_sold_out_product_id, 'https://images.pexels.com/photos/1038000/pexels-photo-1038000.jpeg?auto=compress&cs=tinysrgb&w=600', 0),
      (v_sold_out_product_id, 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=600', 1),
      (v_sold_out_product_id, 'https://images.pexels.com/photos/2699419/pexels-photo-2699419.jpeg?auto=compress&cs=tinysrgb&w=600', 2);

    -- Add product attributes
    INSERT INTO product_attributes (product_id, attribute_name, attribute_value, display_order, is_visible) VALUES
      (v_sold_out_product_id, 'Style', 'Classique', 1, true),
      (v_sold_out_product_id, 'Saison', 'Automne/Hiver', 2, true),
      (v_sold_out_product_id, 'Coupe', 'Regular', 3, true),
      (v_sold_out_product_id, 'Fermeture', 'Boutons', 4, true);
  END IF;
END $$;