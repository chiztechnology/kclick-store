import { apiClient } from './apiClient';

export interface ProductView {
  id: string;
  product_id: string;
  user_id?: string;
  session_id: string;
  referrer?: string;
  device_type: 'mobile' | 'tablet' | 'desktop';
  browser?: string;
  country?: string;
  city?: string;
  duration_seconds?: number;
  converted: boolean;
  created_at: string;
}

export interface ProductViewStats {
  total_views: number;
  unique_views: number;
  average_duration: number;
  conversion_rate: number;
  views_by_device: Record<string, number>;
  views_by_country: Record<string, number>;
  views_trend: Array<{
    date: string;
    views: number;
    unique_views: number;
  }>;
}

export interface CreateProductViewRequest {
  product_id: string;
  session_id: string;
  referrer?: string;
  device_type: ProductView['device_type'];
  browser?: string;
  country?: string;
  city?: string;
}

export interface UpdateProductViewRequest {
  duration_seconds?: number;
  converted?: boolean;
}

export const productViewsService = {
  getAll: async (params?: { product_id?: string; user_id?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.product_id) queryParams.append('product_id', params.product_id);
    if (params?.user_id) queryParams.append('user_id', params.user_id);
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiClient.get<ProductView[]>(`/product-views${query}`);
  },

  getById: async (id: string) => {
    return apiClient.get<ProductView>(`/product-views/${id}`);
  },

  create: async (data: CreateProductViewRequest) => {
    return apiClient.post<ProductView>('/product-views', data);
  },

  update: async (id: string, data: UpdateProductViewRequest) => {
    return apiClient.patch<ProductView>(`/product-views/${id}`, data);
  },

  getProductViews: async (productId: string, params?: { days?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.days) queryParams.append('days', String(params.days));
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiClient.get<ProductView[]>(`/products/${productId}/views${query}`);
  },

  getProductStats: async (productId: string, params?: { days?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.days) queryParams.append('days', String(params.days));
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiClient.get<ProductViewStats>(`/products/${productId}/views/stats${query}`);
  },

  getStoreProductsStats: async (storeId: string, params?: { days?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.days) queryParams.append('days', String(params.days));
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiClient.get<Array<{ product_id: string; stats: ProductViewStats }>>(
      `/stores/${storeId}/products/views/stats${query}`
    );
  },

  getUserViewHistory: async (userId: string, limit = 50) => {
    return apiClient.get<ProductView[]>(`/users/${userId}/product-views?limit=${limit}`);
  },

  getTrendingProducts: async (params?: { days?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.days) queryParams.append('days', String(params.days));
    if (params?.limit) queryParams.append('limit', String(params.limit));
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiClient.get<Array<{
      product_id: string;
      total_views: number;
      unique_views: number;
      conversion_rate: number;
    }>>(`/product-views/trending${query}`);
  },

  recordConversion: async (viewId: string) => {
    return apiClient.post<ProductView>(`/product-views/${viewId}/convert`, {});
  },
};
