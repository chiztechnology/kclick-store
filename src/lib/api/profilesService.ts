import { apiClient } from './apiClient';
import type { Profile } from '../../types';

export const profilesService = {
  getAll: async () => {
    return apiClient.get<Profile[]>('/profiles');
  },

  getById: async (id: string) => {
    return apiClient.get<Profile>(`/profiles/${id}`);
  },

  update: async (id: string, updates: Partial<Profile>) => {
    return apiClient.patch<Profile>(`/profiles/${id}`, updates);
  },

  delete: async (id: string) => {
    return apiClient.delete<void>(`/profiles/${id}`);
  },
};
