import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { CartProvider } from './context/CartContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { Router } from './Router';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <CurrencyProvider>
        <AppProvider>
          <CartProvider>
            <Router />
          </CartProvider>
        </AppProvider>
      </CurrencyProvider>
    </AuthProvider>
  </StrictMode>
);
