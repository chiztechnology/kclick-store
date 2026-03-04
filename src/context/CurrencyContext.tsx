import React, { createContext, useContext, useState, useEffect } from 'react';
import { exchangeRatesService, type ExchangeRate } from '../lib/api';

interface CurrencyContextType {
  currency: string;
  setCurrency: (currency: string) => void;
  rates: ExchangeRate[];
  loading: boolean;
  error: string | null;
  convertFromUSD: (amountUSD: number) => number;
  formatPrice: (amountUSD: number) => string;
  getSymbol: () => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<string>(() => {
    return localStorage.getItem('preferred_currency') || 'USD';
  });
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRates();
  }, []);

  useEffect(() => {
    localStorage.setItem('preferred_currency', currency);
  }, [currency]);

  const loadRates = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: apiError } = await exchangeRatesService.getActive();
      if (apiError) throw new Error(apiError.message);
      setRates(data || []);
    } catch (err) {
      console.error('Error loading exchange rates:', err);
      setError(err instanceof Error ? err.message : 'Failed to load exchange rates');
      setRates([
        { id: '1', currency: 'USD', rate_to_usd: 1, symbol: '$', name: 'US Dollar', is_active: true, updated_at: new Date().toISOString() },
        { id: '2', currency: 'CDF', rate_to_usd: 2800, symbol: 'FC', name: 'Franc Congolais', is_active: true, updated_at: new Date().toISOString() },
        { id: '3', currency: 'EUR', rate_to_usd: 0.92, symbol: '€', name: 'Euro', is_active: true, updated_at: new Date().toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const convertFromUSD = React.useCallback((amountUSD: number): number => {
    const rate = rates.find(r => r.currency === currency);
    if (!rate) return amountUSD;
    return amountUSD * rate.rate_to_usd;
  }, [rates, currency]);

  const getSymbol = React.useCallback((): string => {
    const rate = rates.find(r => r.currency === currency);
    return rate?.symbol || '$';
  }, [rates, currency]);

  const formatPrice = React.useCallback((amountUSD: number): string => {
    const converted = convertFromUSD(amountUSD);
    const symbol = getSymbol();

    if (currency === 'CDF') {
      return `${symbol} ${converted.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}`;
    }

    return `${symbol}${converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }, [convertFromUSD, getSymbol, currency]);

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        rates,
        loading,
        error,
        convertFromUSD,
        formatPrice,
        getSymbol,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}

export type { ExchangeRate };
