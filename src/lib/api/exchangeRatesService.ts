import { apiClient } from './apiClient';

export interface ExchangeRate {
  id: string;
  currency: string;
  rate_to_usd: number;
  symbol: string;
  name: string;
  is_active: boolean;
  updated_at: string;
}

export const exchangeRatesService = {
  getAll: async () => {
    return apiClient.get<ExchangeRate[]>('/exchange-rates');
  },

  getActive: async () => {
    return apiClient.get<ExchangeRate[]>('/exchange-rates?is_active=true');
  },

  getById: async (id: string) => {
    return apiClient.get<ExchangeRate>(`/exchange-rates/${id}`);
  },

  getByCurrency: async (currency: string) => {
    return apiClient.get<ExchangeRate>(`/exchange-rates/currency/${currency}`);
  },

  update: async (id: string, data: Partial<ExchangeRate>) => {
    return apiClient.patch<ExchangeRate>(`/exchange-rates/${id}`, data);
  },

  create: async (data: Omit<ExchangeRate, 'id' | 'updated_at'>) => {
    return apiClient.post<ExchangeRate>('/exchange-rates', data);
  },
};
