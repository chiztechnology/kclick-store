import { apiClient } from './apiClient';
import type { Campaign } from '../../types';

interface CampaignFilters {
  storeId?: string;
  isActive?: boolean;
}

interface CampaignCategory {
  campaign_id: string;
  category_id: string;
}

export const campaignsService = {
  getById: (id: string) =>
    apiClient.get<Campaign>(`/campaigns/${id}`),

  getAll: (filters?: CampaignFilters) => {
    const params = new URLSearchParams();
    if (filters?.storeId) params.append('store_id', filters.storeId);
    if (filters?.isActive !== undefined) params.append('is_active', String(filters.isActive));
    const queryString = params.toString();
    return apiClient.get<Campaign[]>(`/campaigns${queryString ? `?${queryString}` : ''}`);
  },

  create: (data: Partial<Campaign>) =>
    apiClient.post<Campaign>('/campaigns', data),

  update: (id: string, data: Partial<Campaign>) =>
    apiClient.patch<Campaign>(`/campaigns/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<void>(`/campaigns/${id}`),

  // Campaign categories management
  getCampaignCategories: (campaignId: string) =>
    apiClient.get<CampaignCategory[]>(`/campaigns/${campaignId}/categories`),

  setCampaignCategories: (campaignId: string, categoryIds: string[]) =>
    apiClient.put<CampaignCategory[]>(`/campaigns/${campaignId}/categories`, { category_ids: categoryIds }),

  deleteCampaignCategories: (campaignId: string) =>
    apiClient.delete<void>(`/campaigns/${campaignId}/categories`),
};
