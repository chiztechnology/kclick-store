import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Product, Profile, Store } from '../types';

interface AppContextType {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  currentUser: Profile | null;
  setCurrentUser: (u: Profile | null) => void;
  isAuthOpen: boolean;
  setIsAuthOpen: (open: boolean) => void;
  wishlistIds: string[];
  toggleWishlist: (productId: string) => void;
  notification: { message: string; type: 'success' | 'error' | 'info' } | null;
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
  selectedStore: Store | null;
  setSelectedStore: (store: Store | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEMO_USER: Profile = {
  id: 'demo-user',
  full_name: 'Jean Dupont',
  phone: '+243 81 234 5678',
  avatar_url: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=100',
  role: 'customer',
  address: '15 Avenue de la Révolution',
  city: 'Kinshasa',
  created_at: '2024-01-01T00:00:00Z',
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState<Profile | null>(DEMO_USER);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [wishlistIds, setWishlistIds] = useState<string[]>(['p-3', 'p-14', 'p-22']);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  const toggleWishlist = useCallback((productId: string) => {
    setWishlistIds(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  }, []);

  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  }, []);

  return (
    <AppContext.Provider value={{
      searchQuery, setSearchQuery,
      currentUser, setCurrentUser,
      isAuthOpen, setIsAuthOpen,
      wishlistIds, toggleWishlist,
      notification, showNotification,
      selectedStore, setSelectedStore,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
