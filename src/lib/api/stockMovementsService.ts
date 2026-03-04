import { apiClient } from './apiClient';

export interface StockMovement {
  id: string;
  store_product_id: string;
  product_id: string;
  store_id: string;
  movement_type: 'in' | 'out';
  quantity: number;
  previous_stock: number;
  new_stock: number;
  notes: string;
  created_by?: string;
  created_at: string;
}

interface StockMovementFilters {
  storeId?: string;
  storeProductId?: string;
  limit?: number;
}

export const stockMovementsService = {
  getById: (id: string) =>
    apiClient.get<StockMovement>(`/stock-movements/${id}`),

  getByStore: (storeId: string, limit?: number) => {
    const params = new URLSearchParams();
    params.append('store_id', storeId);
    if (limit) params.append('limit', String(limit));
    return apiClient.get<StockMovement[]>(`/stock-movements?${params.toString()}`);
  },

  getByStoreProduct: (storeProductId: string) =>
    apiClient.get<StockMovement[]>(`/stock-movements?store_product_id=${storeProductId}`),

  getAll: (filters?: StockMovementFilters) => {
    const params = new URLSearchParams();
    if (filters?.storeId) params.append('store_id', filters.storeId);
    if (filters?.storeProductId) params.append('store_product_id', filters.storeProductId);
    if (filters?.limit) params.append('limit', String(filters.limit));
    const queryString = params.toString();
    return apiClient.get<StockMovement[]>(`/stock-movements${queryString ? `?${queryString}` : ''}`);
  },

  create: (data: Omit<StockMovement, 'id' | 'created_at'>) =>
    apiClient.post<StockMovement>('/stock-movements', data),

  delete: (id: string) =>
    apiClient.delete<void>(`/stock-movements/${id}`),
};
