import { apiClient } from './apiClient';

export interface StoreProduct {
  id: string;
  store_id: string;
  product_id: string;
  price: number;
  stock: number;
  reserved_stock: number;
  low_stock_threshold: number;
  sku: string;
  product_name?: string;
  is_active: boolean;
  created_at?: string;
}

interface ProductFilters {
  storeId?: string;
  isActive?: boolean;
}

export const productsService = {
  getById: (id: string) =>
    apiClient.get<StoreProduct>(`/store-products/${id}`),

  getByStore: (storeId: string) =>
    apiClient.get<StoreProduct[]>(`/store-products?store_id=${storeId}`),

  // getAll: (filters?: ProductFilters) => {
  //   const params = new URLSearchParams();
  //   if (filters?.storeId) params.append('store_id', filters.storeId);
  //   if (filters?.isActive !== undefined) params.append('is_active', String(filters.isActive));
  //   const queryString = params.toString();
  //   return apiClient.get<StoreProduct[]>(`/store-products${queryString ? `?${queryString}` : ''}`);
  // },

  getAll: (filters?: ProductFilters) => {
    const params = new URLSearchParams();
    if (filters?.storeId) params.append('store_id', filters.storeId);
    if (filters?.isActive !== undefined) params.append('is_active', String(filters.isActive));
    const queryString = params.toString();
    return apiClient.get<StoreProduct[]>(`/products${queryString ? `?${queryString}` : ''}`);
  },

  create: (data: Partial<StoreProduct>) =>
    apiClient.post<StoreProduct>('/store-products', data),

  update: (id: string, data: Partial<StoreProduct>) =>
    apiClient.patch<StoreProduct>(`/store-products/${id}`, data),

  updateStock: (id: string, stock: number) =>
    apiClient.patch<StoreProduct>(`/store-products/${id}`, { stock }),

  delete: (id: string) =>
    apiClient.delete<void>(`/store-products/${id}`),
};
