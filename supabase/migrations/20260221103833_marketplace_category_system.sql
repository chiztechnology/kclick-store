/*
  # Marketplace Category System

  1. Overview
    Complete overhaul of category system from clothing-specific to universal marketplace categories.
    Supports unlimited category depth with parent-child relationships.
    Includes 12 main categories with comprehensive subcategories.

  2. Changes
    - Add `description` field for category descriptions
    - Add `icon_name` field for Lucide React icon names
    - Add `meta_title` and `meta_description` for SEO
    - Add `is_featured` to highlight categories
    - Add `level` to track hierarchy depth (0 = root, 1 = subcategory, etc.)

  3. Main Categories (12)
    - Electronics & Computers
    - Fashion & Apparel
    - Home & Garden
    - Beauty & Personal Care
    - Sports & Outdoors
    - Toys, Kids & Baby
    - Books, Media & Entertainment
    - Automotive & Industrial
    - Food & Beverages
    - Health & Wellness
    - Office & Stationery
    - Pet Supplies

  4. Security
    - Maintains existing RLS policies
*/

-- Add new columns to categories table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'categories' AND column_name = 'description'
  ) THEN
    ALTER TABLE categories ADD COLUMN description text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'categories' AND column_name = 'icon_name'
  ) THEN
    ALTER TABLE categories ADD COLUMN icon_name text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'categories' AND column_name = 'meta_title'
  ) THEN
    ALTER TABLE categories ADD COLUMN meta_title text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'categories' AND column_name = 'meta_description'
  ) THEN
    ALTER TABLE categories ADD COLUMN meta_description text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'categories' AND column_name = 'is_featured'
  ) THEN
    ALTER TABLE categories ADD COLUMN is_featured boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'categories' AND column_name = 'level'
  ) THEN
    ALTER TABLE categories ADD COLUMN level integer DEFAULT 0;
  END IF;
END $$;

-- Clear existing categories (marketplace fresh start)
TRUNCATE categories CASCADE;

-- Insert main categories (level 0)
INSERT INTO categories (name, slug, icon_name, description, level, sort_order, is_featured, is_active) VALUES
('Electronics & Computers', 'electronics-computers', 'Laptop', 'Phones, laptops, TVs, cameras, and all electronic devices', 0, 1, true, true),
('Fashion & Apparel', 'fashion-apparel', 'Shirt', 'Clothing, shoes, accessories for men, women, and kids', 0, 2, true, true),
('Home & Garden', 'home-garden', 'Home', 'Furniture, decor, kitchen, gardening, and home improvement', 0, 3, true, true),
('Beauty & Personal Care', 'beauty-personal-care', 'Sparkles', 'Cosmetics, skincare, fragrances, and personal hygiene', 0, 4, true, true),
('Sports & Outdoors', 'sports-outdoors', 'Dumbbell', 'Fitness equipment, outdoor gear, camping, and sports', 0, 5, false, true),
('Toys, Kids & Baby', 'toys-kids-baby', 'Baby', 'Toys, games, baby products, and kids essentials', 0, 6, true, true),
('Books, Media & Entertainment', 'books-media-entertainment', 'BookOpen', 'Books, music, movies, games, and hobbies', 0, 7, false, true),
('Automotive & Industrial', 'automotive-industrial', 'Car', 'Car parts, tools, industrial supplies, and machinery', 0, 8, false, true),
('Food & Beverages', 'food-beverages', 'UtensilsCrossed', 'Groceries, snacks, drinks, and gourmet foods', 0, 9, true, true),
('Health & Wellness', 'health-wellness', 'Heart', 'Vitamins, supplements, medical supplies, and wellness products', 0, 10, false, true),
('Office & Stationery', 'office-stationery', 'Briefcase', 'Office supplies, stationery, printers, and business essentials', 0, 11, false, true),
('Pet Supplies', 'pet-supplies', 'PawPrint', 'Pet food, toys, accessories, and care products', 0, 12, false, true);

-- Electronics & Computers subcategories
INSERT INTO categories (name, slug, icon_name, parent_id, level, sort_order, is_active)
SELECT 'Mobile Phones & Tablets', 'mobile-phones-tablets', 'Smartphone', id, 1, 1, true FROM categories WHERE slug = 'electronics-computers'
UNION ALL
SELECT 'Laptops & Computers', 'laptops-computers', 'Monitor', id, 1, 2, true FROM categories WHERE slug = 'electronics-computers'
UNION ALL
SELECT 'TVs & Audio', 'tvs-audio', 'Tv', id, 1, 3, true FROM categories WHERE slug = 'electronics-computers'
UNION ALL
SELECT 'Cameras & Photography', 'cameras-photography', 'Camera', id, 1, 4, true FROM categories WHERE slug = 'electronics-computers'
UNION ALL
SELECT 'Video Games & Consoles', 'video-games-consoles', 'Gamepad2', id, 1, 5, true FROM categories WHERE slug = 'electronics-computers'
UNION ALL
SELECT 'Wearable Technology', 'wearable-technology', 'Watch', id, 1, 6, true FROM categories WHERE slug = 'electronics-computers'
UNION ALL
SELECT 'Accessories & Peripherals', 'accessories-peripherals', 'Usb', id, 1, 7, true FROM categories WHERE slug = 'electronics-computers'
UNION ALL
SELECT 'Smart Home & Security', 'smart-home-security', 'Lock', id, 1, 8, true FROM categories WHERE slug = 'electronics-computers';

-- Fashion & Apparel subcategories
INSERT INTO categories (name, slug, icon_name, parent_id, level, sort_order, is_active)
SELECT 'Men''s Clothing', 'mens-clothing', 'User', id, 1, 1, true FROM categories WHERE slug = 'fashion-apparel'
UNION ALL
SELECT 'Women''s Clothing', 'womens-clothing', 'UserRound', id, 1, 2, true FROM categories WHERE slug = 'fashion-apparel'
UNION ALL
SELECT 'Kids'' Clothing', 'kids-clothing', 'Baby', id, 1, 3, true FROM categories WHERE slug = 'fashion-apparel'
UNION ALL
SELECT 'Shoes & Footwear', 'shoes-footwear', 'Footprints', id, 1, 4, true FROM categories WHERE slug = 'fashion-apparel'
UNION ALL
SELECT 'Bags & Luggage', 'bags-luggage', 'ShoppingBag', id, 1, 5, true FROM categories WHERE slug = 'fashion-apparel'
UNION ALL
SELECT 'Jewelry & Watches', 'jewelry-watches', 'Gem', id, 1, 6, true FROM categories WHERE slug = 'fashion-apparel'
UNION ALL
SELECT 'Accessories', 'fashion-accessories', 'Glasses', id, 1, 7, true FROM categories WHERE slug = 'fashion-apparel';

-- Home & Garden subcategories
INSERT INTO categories (name, slug, icon_name, parent_id, level, sort_order, is_active)
SELECT 'Furniture', 'furniture', 'Armchair', id, 1, 1, true FROM categories WHERE slug = 'home-garden'
UNION ALL
SELECT 'Home Decor', 'home-decor', 'Lamp', id, 1, 2, true FROM categories WHERE slug = 'home-garden'
UNION ALL
SELECT 'Kitchen & Dining', 'kitchen-dining', 'ChefHat', id, 1, 3, true FROM categories WHERE slug = 'home-garden'
UNION ALL
SELECT 'Bedding & Bath', 'bedding-bath', 'Bed', id, 1, 4, true FROM categories WHERE slug = 'home-garden'
UNION ALL
SELECT 'Lighting', 'lighting', 'Lightbulb', id, 1, 5, true FROM categories WHERE slug = 'home-garden'
UNION ALL
SELECT 'Gardening & Outdoor', 'gardening-outdoor', 'Flower2', id, 1, 6, true FROM categories WHERE slug = 'home-garden'
UNION ALL
SELECT 'Home Improvement & Tools', 'home-improvement-tools', 'Wrench', id, 1, 7, true FROM categories WHERE slug = 'home-garden'
UNION ALL
SELECT 'Storage & Organization', 'storage-organization', 'Package', id, 1, 8, true FROM categories WHERE slug = 'home-garden';

-- Beauty & Personal Care subcategories
INSERT INTO categories (name, slug, icon_name, parent_id, level, sort_order, is_active)
SELECT 'Makeup', 'makeup', 'Palette', id, 1, 1, true FROM categories WHERE slug = 'beauty-personal-care'
UNION ALL
SELECT 'Skincare', 'skincare', 'Droplet', id, 1, 2, true FROM categories WHERE slug = 'beauty-personal-care'
UNION ALL
SELECT 'Haircare', 'haircare', 'Scissors', id, 1, 3, true FROM categories WHERE slug = 'beauty-personal-care'
UNION ALL
SELECT 'Fragrances', 'fragrances', 'Flower', id, 1, 4, true FROM categories WHERE slug = 'beauty-personal-care'
UNION ALL
SELECT 'Personal Hygiene', 'personal-hygiene', 'Droplets', id, 1, 5, true FROM categories WHERE slug = 'beauty-personal-care'
UNION ALL
SELECT 'Bath & Body', 'bath-body', 'Waves', id, 1, 6, true FROM categories WHERE slug = 'beauty-personal-care'
UNION ALL
SELECT 'Beauty Tools & Accessories', 'beauty-tools-accessories', 'Brush', id, 1, 7, true FROM categories WHERE slug = 'beauty-personal-care';

-- Sports & Outdoors subcategories
INSERT INTO categories (name, slug, icon_name, parent_id, level, sort_order, is_active)
SELECT 'Fitness Equipment', 'fitness-equipment', 'Dumbbell', id, 1, 1, true FROM categories WHERE slug = 'sports-outdoors'
UNION ALL
SELECT 'Team Sports', 'team-sports', 'Trophy', id, 1, 2, true FROM categories WHERE slug = 'sports-outdoors'
UNION ALL
SELECT 'Cycling', 'cycling', 'Bike', id, 1, 3, true FROM categories WHERE slug = 'sports-outdoors'
UNION ALL
SELECT 'Camping & Hiking', 'camping-hiking', 'Tent', id, 1, 4, true FROM categories WHERE slug = 'sports-outdoors'
UNION ALL
SELECT 'Water Sports', 'water-sports', 'Waves', id, 1, 5, true FROM categories WHERE slug = 'sports-outdoors'
UNION ALL
SELECT 'Outdoor Recreation', 'outdoor-recreation', 'Mountain', id, 1, 6, true FROM categories WHERE slug = 'sports-outdoors'
UNION ALL
SELECT 'Sportswear', 'sportswear', 'Shirt', id, 1, 7, true FROM categories WHERE slug = 'sports-outdoors';

-- Toys, Kids & Baby subcategories
INSERT INTO categories (name, slug, icon_name, parent_id, level, sort_order, is_active)
SELECT 'Baby Care', 'baby-care', 'Baby', id, 1, 1, true FROM categories WHERE slug = 'toys-kids-baby'
UNION ALL
SELECT 'Baby Feeding', 'baby-feeding', 'Milk', id, 1, 2, true FROM categories WHERE slug = 'toys-kids-baby'
UNION ALL
SELECT 'Baby Gear & Furniture', 'baby-gear-furniture', 'Armchair', id, 1, 3, true FROM categories WHERE slug = 'toys-kids-baby'
UNION ALL
SELECT 'Toys & Games', 'toys-games', 'Puzzle', id, 1, 4, true FROM categories WHERE slug = 'toys-kids-baby'
UNION ALL
SELECT 'Kids'' Room Decor', 'kids-room-decor', 'Palette', id, 1, 5, true FROM categories WHERE slug = 'toys-kids-baby'
UNION ALL
SELECT 'Educational Toys', 'educational-toys', 'GraduationCap', id, 1, 6, true FROM categories WHERE slug = 'toys-kids-baby';

-- Books, Media & Entertainment subcategories
INSERT INTO categories (name, slug, icon_name, parent_id, level, sort_order, is_active)
SELECT 'Books', 'books', 'BookOpen', id, 1, 1, true FROM categories WHERE slug = 'books-media-entertainment'
UNION ALL
SELECT 'Music & Instruments', 'music-instruments', 'Music', id, 1, 2, true FROM categories WHERE slug = 'books-media-entertainment'
UNION ALL
SELECT 'Movies & TV Shows', 'movies-tv-shows', 'Film', id, 1, 3, true FROM categories WHERE slug = 'books-media-entertainment'
UNION ALL
SELECT 'Board Games & Puzzles', 'board-games-puzzles', 'Puzzle', id, 1, 4, true FROM categories WHERE slug = 'books-media-entertainment'
UNION ALL
SELECT 'Arts & Crafts', 'arts-crafts', 'Paintbrush', id, 1, 5, true FROM categories WHERE slug = 'books-media-entertainment'
UNION ALL
SELECT 'Collectibles', 'collectibles', 'Star', id, 1, 6, true FROM categories WHERE slug = 'books-media-entertainment';

-- Automotive & Industrial subcategories
INSERT INTO categories (name, slug, icon_name, parent_id, level, sort_order, is_active)
SELECT 'Car Parts & Accessories', 'car-parts-accessories', 'CarFront', id, 1, 1, true FROM categories WHERE slug = 'automotive-industrial'
UNION ALL
SELECT 'Motorcycle Parts', 'motorcycle-parts', 'Bike', id, 1, 2, true FROM categories WHERE slug = 'automotive-industrial'
UNION ALL
SELECT 'Tools & Equipment', 'tools-equipment', 'Wrench', id, 1, 3, true FROM categories WHERE slug = 'automotive-industrial'
UNION ALL
SELECT 'Industrial Supplies', 'industrial-supplies', 'Factory', id, 1, 4, true FROM categories WHERE slug = 'automotive-industrial'
UNION ALL
SELECT 'Safety Equipment', 'safety-equipment', 'ShieldCheck', id, 1, 5, true FROM categories WHERE slug = 'automotive-industrial';

-- Food & Beverages subcategories
INSERT INTO categories (name, slug, icon_name, parent_id, level, sort_order, is_active)
SELECT 'Fresh Produce', 'fresh-produce', 'Apple', id, 1, 1, true FROM categories WHERE slug = 'food-beverages'
UNION ALL
SELECT 'Beverages', 'beverages', 'Coffee', id, 1, 2, true FROM categories WHERE slug = 'food-beverages'
UNION ALL
SELECT 'Snacks & Sweets', 'snacks-sweets', 'Candy', id, 1, 3, true FROM categories WHERE slug = 'food-beverages'
UNION ALL
SELECT 'Pantry Staples', 'pantry-staples', 'Package', id, 1, 4, true FROM categories WHERE slug = 'food-beverages'
UNION ALL
SELECT 'Gourmet & Specialty Foods', 'gourmet-specialty-foods', 'ChefHat', id, 1, 5, true FROM categories WHERE slug = 'food-beverages'
UNION ALL
SELECT 'Organic & Natural', 'organic-natural', 'Leaf', id, 1, 6, true FROM categories WHERE slug = 'food-beverages';

-- Health & Wellness subcategories
INSERT INTO categories (name, slug, icon_name, parent_id, level, sort_order, is_active)
SELECT 'Vitamins & Supplements', 'vitamins-supplements', 'Pill', id, 1, 1, true FROM categories WHERE slug = 'health-wellness'
UNION ALL
SELECT 'Medical Supplies', 'medical-supplies', 'Stethoscope', id, 1, 2, true FROM categories WHERE slug = 'health-wellness'
UNION ALL
SELECT 'Fitness & Nutrition', 'fitness-nutrition', 'Heart', id, 1, 3, true FROM categories WHERE slug = 'health-wellness'
UNION ALL
SELECT 'Personal Care Devices', 'personal-care-devices', 'Thermometer', id, 1, 4, true FROM categories WHERE slug = 'health-wellness'
UNION ALL
SELECT 'Sexual Wellness', 'sexual-wellness', 'HeartPulse', id, 1, 5, true FROM categories WHERE slug = 'health-wellness';

-- Office & Stationery subcategories
INSERT INTO categories (name, slug, icon_name, parent_id, level, sort_order, is_active)
SELECT 'Office Supplies', 'office-supplies', 'Pen', id, 1, 1, true FROM categories WHERE slug = 'office-stationery'
UNION ALL
SELECT 'Stationery', 'stationery', 'NotebookPen', id, 1, 2, true FROM categories WHERE slug = 'office-stationery'
UNION ALL
SELECT 'Printers & Ink', 'printers-ink', 'Printer', id, 1, 3, true FROM categories WHERE slug = 'office-stationery'
UNION ALL
SELECT 'Office Furniture', 'office-furniture', 'Armchair', id, 1, 4, true FROM categories WHERE slug = 'office-stationery'
UNION ALL
SELECT 'School Supplies', 'school-supplies', 'GraduationCap', id, 1, 5, true FROM categories WHERE slug = 'office-stationery';

-- Pet Supplies subcategories
INSERT INTO categories (name, slug, icon_name, parent_id, level, sort_order, is_active)
SELECT 'Pet Food', 'pet-food', 'Apple', id, 1, 1, true FROM categories WHERE slug = 'pet-supplies'
UNION ALL
SELECT 'Pet Toys', 'pet-toys', 'Bone', id, 1, 2, true FROM categories WHERE slug = 'pet-supplies'
UNION ALL
SELECT 'Pet Accessories', 'pet-accessories', 'Tag', id, 1, 3, true FROM categories WHERE slug = 'pet-supplies'
UNION ALL
SELECT 'Pet Health & Grooming', 'pet-health-grooming', 'Scissors', id, 1, 4, true FROM categories WHERE slug = 'pet-supplies'
UNION ALL
SELECT 'Pet Furniture & Bedding', 'pet-furniture-bedding', 'Bed', id, 1, 5, true FROM categories WHERE slug = 'pet-supplies';
