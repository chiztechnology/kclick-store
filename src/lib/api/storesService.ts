import { apiClient } from './apiClient';
import type { Store } from '../../types';

interface StoreFilters {
  ownerId?: string;
}

export const storesService = {
  getById: (id: string) =>
    apiClient.get<Store>(`/stores/${id}`),

  getByOwner: (ownerId: string) =>
    apiClient.get<Store[]>(`/stores?owner_id=${ownerId}`),

  getByIdAndOwner: (id: string, ownerId: string) =>
    apiClient.get<Store>(`/stores/${id}?owner_id=${ownerId}`),

  getAll: (filters?: StoreFilters) => {
    const params = new URLSearchParams();
    if (filters?.ownerId) params.append('owner_id', filters.ownerId);
    const queryString = params.toString();
    return apiClient.get<Store[]>(`/stores${queryString ? `?${queryString}` : ''}`);
  },

  create: (data: Partial<Store>) =>
    apiClient.post<Store>('/stores', data),

  update: (id: string, data: Partial<Store>) =>
    apiClient.patch<Store>(`/stores/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<void>(`/stores/${id}`),
};
