import { apiClient } from './apiClient';
import type { Store, StoreProduct, StockMovement, Order, Product } from '../../types';

export interface StoreStats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  lowStockProducts: number;
  averageRating: number;
  revenueGrowth: number;
  ordersGrowth: number;
}

export const storePortalApiService = {
  getStoreById: async (storeId: string) => {
    return apiClient.get<Store>(`/stores/${storeId}`);
  },

  getStoresForManager: async () => {
    return apiClient.get<Store[]>('/stores?is_active=true');
  },

  getStoreStats: async (storeId: string) => {
    return apiClient.get<StoreStats>(`/stores/${storeId}/stats`);
  },

  getStoreProducts: async (storeId: string) => {
    return apiClient.get<StoreProduct[]>(`/stores/${storeId}/products`);
  },

  getAvailableProducts: async (storeId: string) => {
    return apiClient.get<Product[]>(`/stores/${storeId}/available-products`);
  },

  addProductToStore: async (storeId: string, productId: string, data: Partial<StoreProduct>) => {
    return apiClient.post<StoreProduct>(`/stores/${storeId}/products`, {
      product_id: productId,
      ...data,
    });
  },

  updateStoreProduct: async (id: string, data: Partial<StoreProduct>) => {
    return apiClient.patch<StoreProduct>(`/store-products/${id}`, data);
  },

  removeProductFromStore: async (id: string) => {
    return apiClient.delete<void>(`/store-products/${id}`);
  },

  updateStock: async (
    storeProductId: string,
    quantity: number,
    movementType: StockMovement['movement_type'],
    notes?: string
  ) => {
    return apiClient.post<void>(`/store-products/${storeProductId}/stock`, {
      quantity,
      movement_type: movementType,
      notes,
    });
  },

  getStockMovements: async (storeId: string, limit = 50) => {
    return apiClient.get<StockMovement[]>(`/stores/${storeId}/stock-movements?limit=${limit}`);
  },

  getStoreOrders: async (storeId: string) => {
    return apiClient.get<Order[]>(`/stores/${storeId}/orders`);
  },

  updateOrderStatus: async (orderId: string, status: string) => {
    return apiClient.patch<void>(`/orders/${orderId}`, { status });
  },

  getLowStockProducts: async (storeId: string) => {
    return apiClient.get<StoreProduct[]>(`/stores/${storeId}/low-stock-products`);
  },
};
