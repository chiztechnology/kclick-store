import { apiClient } from './apiClient';

export interface Dispute {
  id: string;
  order_id: string;
  user_id: string;
  store_id: string;
  reason: string;
  description: string;
  status: 'pending' | 'investigating' | 'resolved' | 'rejected';
  resolution?: string;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DisputeMessage {
  id: string;
  dispute_id: string;
  user_id: string;
  message: string;
  is_admin: boolean;
  created_at: string;
}

export interface CreateDisputeRequest {
  order_id: string;
  reason: string;
  description: string;
}

export interface UpdateDisputeRequest {
  status?: Dispute['status'];
  resolution?: string;
}

export const disputesService = {
  getAll: async (params?: { status?: string; store_id?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.store_id) queryParams.append('store_id', params.store_id);
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiClient.get<Dispute[]>(`/disputes${query}`);
  },

  getById: async (id: string) => {
    return apiClient.get<Dispute>(`/disputes/${id}`);
  },

  create: async (data: CreateDisputeRequest) => {
    return apiClient.post<Dispute>('/disputes', data);
  },

  update: async (id: string, data: UpdateDisputeRequest) => {
    return apiClient.patch<Dispute>(`/disputes/${id}`, data);
  },

  delete: async (id: string) => {
    return apiClient.delete<void>(`/disputes/${id}`);
  },

  getMessages: async (disputeId: string) => {
    return apiClient.get<DisputeMessage[]>(`/disputes/${disputeId}/messages`);
  },

  addMessage: async (disputeId: string, message: string) => {
    return apiClient.post<DisputeMessage>(`/disputes/${disputeId}/messages`, { message });
  },

  getUserDisputes: async (userId: string) => {
    return apiClient.get<Dispute[]>(`/users/${userId}/disputes`);
  },

  getStoreDisputes: async (storeId: string) => {
    return apiClient.get<Dispute[]>(`/stores/${storeId}/disputes`);
  },
};
