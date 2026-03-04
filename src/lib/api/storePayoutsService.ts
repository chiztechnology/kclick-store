import { apiClient } from './apiClient';

export interface StorePayout {
  id: string;
  store_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  payment_method: string;
  payment_details?: Record<string, any>;
  period_start: string;
  period_end: string;
  total_orders: number;
  total_revenue: number;
  commission_amount: number;
  net_amount: number;
  processed_by?: string;
  processed_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PayoutSummary {
  pending_amount: number;
  processing_amount: number;
  completed_amount: number;
  total_payouts: number;
  next_payout_date?: string;
}

export interface CreatePayoutRequest {
  store_id: string;
  period_start: string;
  period_end: string;
  payment_method: string;
  payment_details?: Record<string, any>;
}

export interface UpdatePayoutRequest {
  status?: StorePayout['status'];
  notes?: string;
}

export const storePayoutsService = {
  getAll: async (params?: { store_id?: string; status?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.store_id) queryParams.append('store_id', params.store_id);
    if (params?.status) queryParams.append('status', params.status);
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiClient.get<StorePayout[]>(`/store-payouts${query}`);
  },

  getById: async (id: string) => {
    return apiClient.get<StorePayout>(`/store-payouts/${id}`);
  },

  create: async (data: CreatePayoutRequest) => {
    return apiClient.post<StorePayout>('/store-payouts', data);
  },

  update: async (id: string, data: UpdatePayoutRequest) => {
    return apiClient.patch<StorePayout>(`/store-payouts/${id}`, data);
  },

  delete: async (id: string) => {
    return apiClient.delete<void>(`/store-payouts/${id}`);
  },

  getStorePayouts: async (storeId: string) => {
    return apiClient.get<StorePayout[]>(`/stores/${storeId}/payouts`);
  },

  getStoreSummary: async (storeId: string) => {
    return apiClient.get<PayoutSummary>(`/stores/${storeId}/payouts/summary`);
  },

  processPayout: async (id: string) => {
    return apiClient.post<StorePayout>(`/store-payouts/${id}/process`, {});
  },

  cancelPayout: async (id: string, reason?: string) => {
    return apiClient.post<StorePayout>(`/store-payouts/${id}/cancel`, { reason });
  },

  getPendingPayouts: async () => {
    return apiClient.get<StorePayout[]>('/store-payouts?status=pending');
  },
};
