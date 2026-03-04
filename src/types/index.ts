export type UserRole = 'customer' | 'store_manager' | 'admin';
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'packed' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type ProductStatus = 'draft' | 'published' | 'archived';
export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type PaymentMethod = 'mpesa' | 'bank_card' | 'bank_transfer';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
export type CampaignType = 'flash_sale' | 'seasonal' | 'clearance' | 'new_arrival' | 'featured';
export type DiscountType = 'percent' | 'fixed';
export type ProductCondition = 'new' | 'refurbished' | 'used' | 'open_box';
export type Gender = 'men' | 'women' | 'unisex' | 'kids' | 'baby';
export type AgeGroup = 'newborn' | 'infant' | 'toddler' | 'kids' | 'teen' | 'adult';
export type ShippingClass = 'standard' | 'express' | 'freight' | 'digital';
export type WeightUnit = 'kg' | 'g' | 'lb' | 'oz';
export type StockMovementType = 'in' | 'out' | 'adjustment' | 'transfer' | 'return' | 'damaged' | 'expired';

export interface Profile {
  id: string;
  full_name: string;
  phone: string;
  avatar_url: string;
  role: UserRole;
  store_id?: string;
  address: string;
  city: string;
  is_suspended?: boolean;
  suspended_reason?: string;
  created_at: string;
  updated_at?: string;
}

export type StoreStatus = 'pending' | 'approved' | 'suspended' | 'rejected' | 'blocked';
export type DisputeStatus = 'none' | 'open' | 'investigating' | 'resolved' | 'escalated';
export type DisputeType = 'refund' | 'product_issue' | 'delivery_issue' | 'fraud' | 'other';

export interface Store {
  id: string;
  name: string;
  description: string;
  logo_url: string;
  cover_image_url: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  rating: number;
  review_count: number;
  product_count: number;
  is_active: boolean;
  is_verified: boolean;
  owner_id?: string;
  shipping_policy?: string;
  return_policy?: string;
  status?: StoreStatus;
  commission_rate?: number;
  store_category?: string;
  business_registration?: string;
  tax_id?: string;
  id_proof?: string;
  rejection_reason?: string;
  approved_at?: string;
  suspended_at?: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon_name: string;
  image_url: string;
  description: string;
  parent_id?: string;
  level: number;
  sort_order: number;
  is_active: boolean;
  is_featured: boolean;
  product_count: number;
  meta_title?: string;
  meta_description?: string;
  subcategories?: Category[];
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url: string;
  is_active: boolean;
  created_at: string;
}

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
  unit: 'cm' | 'in';
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  value: string;
  price_modifier: number;
  stock: number;
  created_at?: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  sort_order: number;
  created_at?: string;
}

export interface ProductAttribute {
  id: string;
  product_id: string;
  attribute_name: string;
  attribute_value: string;
  attribute_type: 'text' | 'number' | 'boolean' | 'color' | 'size' | 'date';
  display_order: number;
  is_filterable: boolean;
  is_visible: boolean;
}

export interface Product {
  id: string;
  slug?: string;
  sku?: string;
  barcode?: string;
  store_id: string;
  store_name?: string;
  category_id: string;
  category_name?: string;
  brand_id?: string;
  brand_name?: string;
  name: string;
  description: string;
  price: number;
  original_price: number;
  discount_percent: number;
  stock: number;
  sold_count: number;
  avg_rating: number;
  review_count: number;
  image_url: string;
  images?: ProductImage[];
  variants?: ProductVariant[];
  attributes?: ProductAttribute[];
  tags: string[];
  features?: string[];
  specifications?: Record<string, string>;
  weight?: number;
  weight_unit?: WeightUnit;
  dimensions?: ProductDimensions;
  material?: string;
  color?: string;
  size?: string;
  gender?: Gender;
  age_group?: AgeGroup;
  condition?: ProductCondition;
  warranty_months?: number;
  country_of_origin?: string;
  meta_title?: string;
  meta_description?: string;
  shipping_class?: ShippingClass;
  is_digital?: boolean;
  min_order_qty?: number;
  max_order_qty?: number;
  low_stock_threshold?: number;
  backorder_allowed?: boolean;
  preorder_date?: string;
  published_at?: string;
  status?: ProductStatus;
  is_active: boolean;
  is_featured: boolean;
  is_flash_sale: boolean;
  flash_sale_end?: string;
  created_at: string;
  updated_at?: string;
}

export interface StoreProduct {
  id: string;
  store_id: string;
  product_id: string;
  product?: Product;
  store?: Store;
  price: number;
  compare_at_price: number;
  cost_price: number;
  stock: number;
  reserved_stock: number;
  low_stock_threshold: number;
  sku: string;
  barcode: string;
  location: string;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface StockMovement {
  id: string;
  store_product_id?: string;
  product_id?: string;
  store_id?: string;
  movement_type: StockMovementType;
  quantity: number;
  previous_stock: number;
  new_stock: number;
  reference_type?: string;
  reference_id?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  variant?: string;
}

export interface Order {
  id: string;
  user_id: string;
  store_id: string;
  store_name?: string;
  user_name?: string;
  status: OrderStatus;
  subtotal: number;
  discount_amount: number;
  total: number;
  store_amount?: number;
  platform_commission?: number;
  tax_amount?: number;
  payout_status?: string;
  dispute_status?: DisputeStatus;
  dispute_reason?: string;
  dispute_resolution?: string;
  voucher_code?: string;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  tracking_number?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
  items?: OrderItem[];
}

export interface Dispute {
  id: string;
  order_id: string;
  store_id?: string;
  user_id?: string;
  type: DisputeType;
  status: 'open' | 'investigating' | 'resolved' | 'escalated' | 'closed';
  reason: string;
  resolution: string;
  refund_amount: number;
  admin_notes: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  order?: Order;
  store?: Store;
  user?: Profile;
}

export interface PlatformConfig {
  id: string;
  key: string;
  value: Record<string, any>;
  description: string;
  category: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_image: string;
  variant?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Payment {
  id: string;
  order_id: string;
  user_id: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  currency: string;
  transaction_ref: string;
  phone_number?: string;
  card_last4?: string;
  created_at: string;
}

export interface Voucher {
  id: string;
  code: string;
  name: string;
  description: string;
  discount_type: DiscountType;
  discount_value: number;
  min_order_amount: number;
  max_discount_amount: number;
  usage_limit: number;
  used_count: number;
  is_active: boolean;
  starts_at: string;
  expires_at?: string;
  store_id?: string;
  created_by?: string;
}

export interface Campaign {
  id: string;
  name: string;
  slug? : string;
  description: string;
  type: CampaignType;
  banner_url: string;
  discount_percent: number;
  starts_at: string;
  ends_at?: string;
  is_active: boolean;
  store_id?: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  link_url: string;
  position: 'hero' | 'sidebar' | 'category' | 'flash_sale';
  sort_order: number;
  is_active: boolean;
  starts_at?: string;
  ends_at?: string;
  created_at?: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  comment: string;
  images?: string[];
  is_verified: boolean;
  created_at: string;
}

export interface StorePayout {
  id: string;
  store_id: string;
  period_start: string;
  period_end: string;
  gross_sales: number;
  commission_rate: number;
  commission_amount: number;
  net_amount: number;
  status: PayoutStatus;
  paid_at?: string;
  payment_method?: string;
  payment_reference?: string;
  notes?: string;
  created_at: string;
}

export interface StorePromotion {
  id: string;
  store_id: string;
  product_id?: string;
  product?: Product;
  name: string;
  discount_type: DiscountType;
  discount_value: number;
  starts_at: string;
  ends_at?: string;
  is_active: boolean;
  created_at: string;
}

export interface ProductView {
  id: string;
  product_id: string;
  store_id: string;
  user_id?: string;
  viewed_at: string;
}

export type MessageSenderRole = 'customer' | 'store' | 'admin';
export type MessageContentType = 'text' | 'image';

export interface OrderChat {
  id: string;
  order_id: string;
  is_open: boolean;
  is_litige: boolean;
  litige_resolved: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrderMessage {
  id: string;
  chat_id: string;
  order_id: string;
  sender_id: string;
  sender_role: MessageSenderRole;
  sender_name: string;
  content?: string;
  image_url?: string;
  content_type: MessageContentType;
  is_deleted: boolean;
  deleted_at?: string;
  created_at: string;
}

export type ViewType =
  | 'home'
  | 'products'
  | 'product-detail'
  | 'cart'
  | 'checkout'
  | 'order-success'
  | 'profile'
  | 'orders'
  | 'admin'
  | 'store-portal'
  | 'store-detail';
