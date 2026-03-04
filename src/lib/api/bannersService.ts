import { apiClient } from './apiClient';

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image_url: string;
  link_url?: string;
  link_text?: string;
  position: 'hero' | 'sidebar' | 'category' | 'flash_sale' | 'promo';
  sort_order: number;
  is_active: boolean;
  campaign_id?: string;
  starts_at?: string;
  ends_at?: string;
  created_at: string;
  updated_at: string;
}

export const bannersService = {
  getAll: async (params?: { page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    return apiClient.get<Banner[]>(`/banners?${query.toString()}`);
  },

  getActive: async (position?: Banner['position']) => {
    const query = position ? `?is_active=true&position=${position}` : '?is_active=true';
    return apiClient.get<Banner[]>(`/banners${query}`);
  },

  getById: async (id: string) => {
    return apiClient.get<Banner>(`/banners/${id}`);
  },

  create: async (data: Omit<Banner, 'id' | 'created_at' | 'updated_at'>) => {
    return apiClient.post<Banner>('/banners', data);
  },

  update: async (id: string, data: Partial<Banner>) => {
    return apiClient.patch<Banner>(`/banners/${id}`, data);
  },

  delete: async (id: string) => {
    return apiClient.delete<void>(`/banners/${id}`);
  },
};
