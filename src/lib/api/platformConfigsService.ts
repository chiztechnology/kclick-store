import { apiClient } from './apiClient';

export interface PlatformConfig {
  id: string;
  commission_rate: number;
  min_commission: number;
  currency: string;
  tax_rate: number;
  shipping_fee: number;
  free_shipping_threshold: number;
  referral_bonus: number;
  maintenance_mode: boolean;
  allowed_payment_methods: string[];
  max_product_images: number;
  max_product_variants: number;
  support_email: string;
  support_phone: string;
  terms_url: string;
  privacy_url: string;
  created_at: string;
  updated_at: string;
}

export interface CommissionSettings {
  commission_rate: number;
  min_commission: number;
}

export interface ShippingSettings {
  shipping_fee: number;
  free_shipping_threshold: number;
}

export interface TaxSettings {
  tax_rate: number;
}

export interface UpdatePlatformConfigRequest {
  commission_rate?: number;
  min_commission?: number;
  currency?: string;
  tax_rate?: number;
  shipping_fee?: number;
  free_shipping_threshold?: number;
  referral_bonus?: number;
  maintenance_mode?: boolean;
  allowed_payment_methods?: string[];
  max_product_images?: number;
  max_product_variants?: number;
  support_email?: string;
  support_phone?: string;
  terms_url?: string;
  privacy_url?: string;
}

export const platformConfigsService = {
  get: async () => {
    return apiClient.get<PlatformConfig>('/platform-config');
  },

  update: async (data: UpdatePlatformConfigRequest) => {
    return apiClient.patch<PlatformConfig>('/platform-config', data);
  },

  getCommissionSettings: async () => {
    return apiClient.get<CommissionSettings>('/platform-config/commission');
  },

  updateCommissionSettings: async (data: CommissionSettings) => {
    return apiClient.patch<CommissionSettings>('/platform-config/commission', data);
  },

  getShippingSettings: async () => {
    return apiClient.get<ShippingSettings>('/platform-config/shipping');
  },

  updateShippingSettings: async (data: ShippingSettings) => {
    return apiClient.patch<ShippingSettings>('/platform-config/shipping', data);
  },

  getTaxSettings: async () => {
    return apiClient.get<TaxSettings>('/platform-config/tax');
  },

  updateTaxSettings: async (data: TaxSettings) => {
    return apiClient.patch<TaxSettings>('/platform-config/tax', data);
  },

  toggleMaintenanceMode: async (enabled: boolean) => {
    return apiClient.patch<PlatformConfig>('/platform-config/maintenance', { enabled });
  },
};
