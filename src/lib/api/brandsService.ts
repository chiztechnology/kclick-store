import { apiClient } from './apiClient';
import type { Brand } from '../../types';

interface BrandFilters {
  isActive?: boolean;
}

export const brandsService = {
  getById: (id: string) =>
    apiClient.get<Brand>(`/brands/${id}`),

  getAll: (filters?: BrandFilters) => {
    const params = new URLSearchParams();
    if (filters?.isActive !== undefined) params.append('is_active', String(filters.isActive));
    const queryString = params.toString();
    return apiClient.get<Brand[]>(`/brands${queryString ? `?${queryString}` : ''}`);
  },

  create: (data: Partial<Brand>) =>
    apiClient.post<Brand>('/brands', data),

  update: (id: string, data: Partial<Brand>) =>
    apiClient.patch<Brand>(`/brands/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<void>(`/brands/${id}`),
};
