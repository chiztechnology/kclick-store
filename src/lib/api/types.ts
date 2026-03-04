export interface Store {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  cover_image_url?: string;
  owner_id: string;
  is_active: boolean;
  is_verified: boolean;
  shipping_policy?: string;
  return_policy?: string;
  delivery_terms?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  sort_order: number;
  is_primary: boolean;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  value: string;
  price_modifier: number;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  original_price?: number;
  discount_percent?: number;
  image_url?: string;
  images?: ProductImage[];
  variants?: ProductVariant[];
  stock: number;
  sold_count: number;
  avg_rating?: number;
  review_count: number;
  is_active: boolean;
  is_featured: boolean;
  is_flash_sale: boolean;
  store_id: string;
  store?: Store;
  category_id?: string;
  category?: Category;
  brand_id?: string;
  brand?: Brand;
  barcode?: string;
  sku?: string;
  weight?: number;
  dimensions?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon_name?: string;
  image_url?: string;
  parent_id?: string;
  level: number;
  sort_order: number;
  is_active: boolean;
  is_featured: boolean;
  subcategories?: Category[];
  created_at: string;
  updated_at: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: string;
  name: string;
  slug: string;
  description?: string;
  type: 'flash_sale' | 'promotion' | 'featured' | 'seasonal';
  image_url?: string;
  banner_url?: string;
  discount_percent?: number;
  starts_at?: string;
  ends_at?: string;
  is_active: boolean;
  store_id?: string;
  products?: Product[];
  categories?: Category[];
  hero_title?: string;
  hero_subtitle?: string;
  hero_cta_text?: string;
  hero_cta_link?: string;
  created_at: string;
  updated_at: string;
}

export interface PlatformConfig {
  id: string;
  key: string;
  value: any;
  category: string;
  description?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
