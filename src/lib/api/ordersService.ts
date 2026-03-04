import { apiClient } from './apiClient';

export interface Order {
  id: string;
  store_id: string;
  user_id: string;
  total: number;
  status: string;
  created_at: string;
  shipping_name: string;
  shipping_address?: string;
  shipping_city?: string;
  shipping_phone?: string;
}

interface OrderFilters {
  storeId?: string;
  userId?: string;
  status?: string;
}

export const ordersService = {
  getById: (id: string) =>
    apiClient.get<Order>(`/orders/${id}`),

  getByStore: (storeId: string) =>
    apiClient.get<Order[]>(`/orders?store_id=${storeId}`),

  getByUser: (userId: string) =>
    apiClient.get<Order[]>(`/orders?user_id=${userId}`),

  getAll: (filters?: OrderFilters) => {
    const params = new URLSearchParams();
    if (filters?.storeId) params.append('store_id', filters.storeId);
    if (filters?.userId) params.append('user_id', filters.userId);
    if (filters?.status) params.append('status', filters.status);
    const queryString = params.toString();
    return apiClient.get<Order[]>(`/orders${queryString ? `?${queryString}` : ''}`);
  },

  create: (data: Partial<Order>) =>
    apiClient.post<Order>('/orders', data),

  update: (id: string, data: Partial<Order>) =>
    apiClient.patch<Order>(`/orders/${id}`, data),

  updateStatus: (id: string, status: string) =>
    apiClient.patch<Order>(`/orders/${id}`, { status }),

  delete: (id: string) =>
    apiClient.delete<void>(`/orders/${id}`),
};
