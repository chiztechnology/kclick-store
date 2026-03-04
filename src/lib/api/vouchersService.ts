import { apiClient } from './apiClient';

export interface Voucher {
  id: string;
  code: string;
  name: string;
  description?: string;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  min_order_amount?: number;
  max_discount?: number;
  usage_limit?: number;
  used_count: number;
  is_active: boolean;
  starts_at?: string;
  ends_at?: string;
  store_id?: string;
  store?: {
    id: string;
    name: string;
    logo_url?: string;
  };
  created_at: string;
  updated_at: string;
}

export const vouchersService = {
  getAll: async (params?: { page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    return apiClient.get<Voucher[]>(`/vouchers?${query.toString()}`);
  },

  getActive: async (limit?: number) => {
    return apiClient.get<Voucher[]>(`/vouchers?is_active=true${limit ? `&limit=${limit}` : ''}`);
  },

  getById: async (id: string) => {
    return apiClient.get<Voucher>(`/vouchers/${id}`);
  },

  getByCode: async (code: string) => {
    return apiClient.get<Voucher>(`/vouchers/code/${code}`);
  },

  getByStore: async (storeId: string) => {
    return apiClient.get<Voucher[]>(`/vouchers?store_id=${storeId}`);
  },

  validate: async (code: string, orderAmount: number) => {
    return apiClient.post<Voucher>('/vouchers/validate', { code, order_amount: orderAmount });
  },

  create: async (data: Omit<Voucher, 'id' | 'used_count' | 'created_at' | 'updated_at'>) => {
    return apiClient.post<Voucher>('/vouchers', data);
  },

  update: async (id: string, data: Partial<Voucher>) => {
    return apiClient.patch<Voucher>(`/vouchers/${id}`, data);
  },

  delete: async (id: string) => {
    return apiClient.delete<void>(`/vouchers/${id}`);
  },
};
