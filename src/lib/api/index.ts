// API Client
export { apiClient } from './apiClient';

// Auth Service
export { authService } from './authService';
export type { User, Profile, Session, AuthResponse } from './authService';

// Services
export { storesService } from './storesService';
export { ordersService } from './ordersService';
export type { Order } from './ordersService';
export { productsService } from './productsService';
export type { StoreProduct } from './productsService';
export { stockMovementsService } from './stockMovementsService';
export type { StockMovement } from './stockMovementsService';
export { categoriesService } from './categoriesService';
export { brandsService } from './brandsService';
export { campaignsService } from './campaignsService';
export { profilesService } from './profilesService';

// Additional Services
export { exchangeRatesService } from './exchangeRatesService';
export type { ExchangeRate } from './exchangeRatesService';
export { vouchersService } from './vouchersService';
export type { Voucher } from './vouchersService';
export { bannersService } from './bannersService';
export type { Banner } from './bannersService';
export { chatService } from './chatService';
export type { OrderChat, OrderMessage } from './chatService';
export { storePortalApiService } from './storePortalService';
export type { StoreStats } from './storePortalService';
export { disputesService } from './disputesService';
export type { Dispute, DisputeMessage, CreateDisputeRequest, UpdateDisputeRequest } from './disputesService';
export { platformConfigsService } from './platformConfigsService';
export type { PlatformConfig as PlatformConfigFull, CommissionSettings, ShippingSettings, TaxSettings, UpdatePlatformConfigRequest } from './platformConfigsService';
export { storePayoutsService } from './storePayoutsService';
export type { StorePayout, PayoutSummary, CreatePayoutRequest, UpdatePayoutRequest } from './storePayoutsService';
export { storePromotionsService } from './storePromotionsService';
export type { StorePromotion, PromotionStats, CreatePromotionRequest, UpdatePromotionRequest } from './storePromotionsService';
export { productViewsService } from './productViewsService';
export type { ProductView, ProductViewStats, CreateProductViewRequest, UpdateProductViewRequest } from './productViewsService';

// Re-export common types
export type {
  Store,
  Product,
  Category,
  Brand,
  Campaign,
  PlatformConfig,
} from './types';
