import { apiClient } from './apiClient';

export interface StorePromotion {
  id: string;
  store_id: string;
  title: string;
  description: string;
  discount_type: 'percentage' | 'fixed' | 'buy_x_get_y' | 'free_shipping';
  discount_value: number;
  min_purchase_amount?: number;
  max_discount_amount?: number;
  applicable_to: 'all' | 'category' | 'product';
  category_ids?: string[];
  product_ids?: string[];
  start_date: string;
  end_date: string;
  is_active: boolean;
  usage_limit?: number;
  usage_count: number;
  code?: string;
  is_stackable: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface PromotionStats {
  total_promotions: number;
  active_promotions: number;
  total_usage: number;
  total_discount_given: number;
  top_promotions: Array<{
    id: string;
    title: string;
    usage_count: number;
    discount_given: number;
  }>;
}

export interface CreatePromotionRequest {
  store_id: string;
  title: string;
  description: string;
  discount_type: StorePromotion['discount_type'];
  discount_value: number;
  min_purchase_amount?: number;
  max_discount_amount?: number;
  applicable_to: StorePromotion['applicable_to'];
  category_ids?: string[];
  product_ids?: string[];
  start_date: string;
  end_date: string;
  usage_limit?: number;
  code?: string;
  is_stackable?: boolean;
  priority?: number;
}

export interface UpdatePromotionRequest {
  title?: string;
  description?: string;
  discount_value?: number;
  min_purchase_amount?: number;
  max_discount_amount?: number;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
  usage_limit?: number;
  code?: string;
  is_stackable?: boolean;
  priority?: number;
}

export const storePromotionsService = {
  getAll: async (params?: { store_id?: string; is_active?: boolean }) => {
    const queryParams = new URLSearchParams();
    if (params?.store_id) queryParams.append('store_id', params.store_id);
    if (params?.is_active !== undefined) queryParams.append('is_active', String(params.is_active));
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiClient.get<StorePromotion[]>(`/store-promotions${query}`);
  },

  getById: async (id: string) => {
    return apiClient.get<StorePromotion>(`/store-promotions/${id}`);
  },

  create: async (data: CreatePromotionRequest) => {
    return apiClient.post<StorePromotion>('/store-promotions', data);
  },

  update: async (id: string, data: UpdatePromotionRequest) => {
    return apiClient.patch<StorePromotion>(`/store-promotions/${id}`, data);
  },

  delete: async (id: string) => {
    return apiClient.delete<void>(`/store-promotions/${id}`);
  },

  getStorePromotions: async (storeId: string) => {
    return apiClient.get<StorePromotion[]>(`/stores/${storeId}/promotions`);
  },

  getActivePromotions: async (storeId: string) => {
    return apiClient.get<StorePromotion[]>(`/stores/${storeId}/promotions?is_active=true`);
  },

  toggleActive: async (id: string, isActive: boolean) => {
    return apiClient.patch<StorePromotion>(`/store-promotions/${id}`, { is_active: isActive });
  },

  validateCode: async (storeId: string, code: string, cartAmount?: number) => {
    return apiClient.post<{ valid: boolean; promotion?: StorePromotion; message?: string }>(
      `/stores/${storeId}/promotions/validate`,
      { code, cart_amount: cartAmount }
    );
  },

  getStats: async (storeId: string) => {
    return apiClient.get<PromotionStats>(`/stores/${storeId}/promotions/stats`);
  },

  applyPromotion: async (promotionId: string, orderId: string) => {
    return apiClient.post<void>(`/store-promotions/${promotionId}/apply`, { order_id: orderId });
  },
};
