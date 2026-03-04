import { useState, useEffect, useMemo, useCallback } from 'react';
import { apiClient } from './api';

interface PricingConfig {
  global_commission_rate: { rate: number };
  tax_rate: { rate: number };
  platform_service_fee: { fixed: number; percent: number };
  shipping_rules: { free_threshold: number; default_rate: number };
}

interface PricingCalculation {
  subtotal: number;
  commissionAmount: number;
  taxAmount: number;
  serviceFee: number;
  shippingFee: number;
  total: number;
  storeReceives: number;
  loading: boolean;
}

interface UsePricingResult {
  config: PricingConfig | null;
  loading: boolean;
  error: string | null;
  calculatePricing: (subtotal: number) => PricingCalculation;
  calculateStorePayout: (orderTotal: number) => number;
  formatCurrency: (amount: number) => string;
  reload: () => void;

  /* product-specific helpers (optional) */
  hasDiscount?: boolean;
  discountPercent?: number;
  finalPrice?: number;
  originalPrice?: number;
  discountLabel?: string | null;
}

const DEFAULT_CONFIG: PricingConfig = {
  global_commission_rate: { rate: 10 },
  tax_rate: { rate: 0 },
  platform_service_fee: { fixed: 0, percent: 0 },
  shipping_rules: { free_threshold: 50, default_rate: 5 },
};

export function usePricing(product?: any | null): UsePricingResult {
  const [config, setConfig] = useState<PricingConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConfig = useCallback( () => {
    try {
      setLoading(true);
      // setError(null);
      // const { data, error: apiError } = await apiClient.get<any[]>('/platform-config?is_public=true');

      // if (apiError) throw new Error(apiError.message);

      // if (data && data.length > 0) {
      //   const configMap: Record<string, any> = {};
      //   data.forEach((item: any) => {
      //     configMap[item.key] = item.value;
      //   });

      //   setConfig({
      //     global_commission_rate: configMap.global_commission_rate || DEFAULT_CONFIG.global_commission_rate,
      //     tax_rate: configMap.tax_rate || DEFAULT_CONFIG.tax_rate,
      //     platform_service_fee: configMap.platform_service_fee || DEFAULT_CONFIG.platform_service_fee,
      //     shipping_rules: configMap.shipping_rules || DEFAULT_CONFIG.shipping_rules,
      //   });
      // } else {
      //   setConfig(DEFAULT_CONFIG);
      // }
      setConfig(DEFAULT_CONFIG);

    } catch (err) {
      console.error('Error loading pricing config:', err);
      setError(err instanceof Error ? err.message : 'Failed to load pricing config');
      setConfig(DEFAULT_CONFIG);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const calculatePricing = useMemo(() => {
    return (subtotal: number): PricingCalculation => {
      const cfg = config || DEFAULT_CONFIG;

      const commissionRate = cfg.global_commission_rate.rate / 100;
      const taxRate = cfg.tax_rate.rate / 100;
      const serviceFeeFixed = cfg.platform_service_fee.fixed;
      const serviceFeePercent = cfg.platform_service_fee.percent / 100;
      const freeShippingThreshold = cfg.shipping_rules.free_threshold;
      const defaultShipping = cfg.shipping_rules.default_rate;

      const commissionAmount = subtotal * commissionRate;
      const taxAmount = subtotal * taxRate;
      const serviceFee = serviceFeeFixed + (subtotal * serviceFeePercent);
      const shippingFee = subtotal >= freeShippingThreshold ? 0 : defaultShipping;

      const total = subtotal + taxAmount + serviceFee + shippingFee;
      const storeReceives = subtotal - commissionAmount;

      return {
        subtotal,
        commissionAmount,
        taxAmount,
        serviceFee,
        shippingFee,
        total,
        storeReceives,
        loading
      };
    };
  }, [config, loading]);

  const calculateStorePayout = useMemo(() => {
    return (orderTotal: number): number => {
      const cfg = config || DEFAULT_CONFIG;
      const commissionRate = cfg.global_commission_rate.rate / 100;
      return orderTotal * (1 - commissionRate);
    };
  }, [config]);

  const formatCurrency = useCallback((amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }, []);

  // product-specific derived values
  const productPricing = useMemo(() => {
    if (!product) return {};

    const originalPrice = (product.original_price && product.original_price > 0) ? product.original_price : product.price;
    const finalPrice = product.price;
    let discountPercent = 0;
    if (product.discount_percent && product.discount_percent > 0) discountPercent = product.discount_percent;
    else if (originalPrice > 0 && originalPrice > finalPrice) {
      discountPercent = (1 - finalPrice / originalPrice) * 100;
    }

    const hasDiscount = discountPercent > 0 && originalPrice > finalPrice;
    const discountLabel = hasDiscount ? `${Math.round(discountPercent)}% de réduction` : null;

    return {
      hasDiscount,
      discountPercent,
      finalPrice,
      originalPrice,
      discountLabel,
    };
  }, [product, config]);

  return {
    config,
    loading,
    error,
    calculatePricing,
    calculateStorePayout,
    formatCurrency,
    reload: loadConfig,
    ...productPricing,
  };
}
