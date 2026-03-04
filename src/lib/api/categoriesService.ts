import { apiClient } from './apiClient';
import type { Category } from '../../types';

interface CategoryFilters {
  isActive?: boolean;
  parentId?: string;
}

export const categoriesService = {
  getById: (id: string) =>
    apiClient.get<Category>(`/categories/${id}`),

  getAll: (filters?: CategoryFilters) => {
    const params = new URLSearchParams();
    if (filters?.isActive !== undefined) params.append('is_active', String(filters.isActive));
    if (filters?.parentId) params.append('parent_id', filters.parentId);
    const queryString = params.toString();
    return apiClient.get<Category[]>(`/categories${queryString ? `?${queryString}` : ''}`);
  },

  create: (data: Partial<Category>) =>
    apiClient.post<Category>('/categories', data),

  update: (id: string, data: Partial<Category>) =>
    apiClient.patch<Category>(`/categories/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<void>(`/categories/${id}`),
};
