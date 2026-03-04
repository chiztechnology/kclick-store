import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, LogOut, Menu, X,
  Home, Settings, BarChart3, TrendingUp, Users, FileText,
  AlertCircle, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import type { Store } from '../../../types';

interface BusinessLayoutProps {
  children: React.ReactNode;
  store: Store | null;
  loading?: boolean;
}

export default function BusinessLayout({ children, store, loading }: BusinessLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, profile } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { label: 'Accueil', icon: LayoutDashboard, path: '/business', badge: null },
    { label: 'Tableau de bord', icon: BarChart3, path: '/business/dashboard', badge: null },
    { label: 'Commandes', icon: ShoppingCart, path: '/business/orders', badge: 'new' },
    { label: 'Inventaire', icon: Package, path: '/business/inventory', badge: null },
    { label: 'Produits', icon: FileText, path: '/business/products', badge: null },
    { label: 'Analyses', icon: TrendingUp, path: '/business/analytics', badge: null },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <aside className={`fixed md:relative z-40 h-full bg-white border-r border-gray-200 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-0 md:w-20'} overflow-hidden md:overflow-visible`}>
        <div className={`flex flex-col h-full ${!sidebarOpen && 'md:items-center'}`}>
          <div className="p-6 border-b border-gray-100">
            <Link to="/business" className="flex items-center gap-3">
              <img src="/Kclick_LOGO-3.png" alt="Kclick" className="h-8 w-8 shrink-0" />
              {sidebarOpen && (
                <div>
                  <div className="font-black text-lg text-kclick-orange">Kclick</div>
                  <div className="text-xs text-gray-500">Business</div>
                </div>
              )}
            </Link>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group relative ${
                    active
                      ? 'bg-kclick-orange text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} className="shrink-0" />
                  {sidebarOpen && (
                    <>
                      <span className="font-medium truncate">{item.label}</span>
                      {item.badge === 'new' && (
                        <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          Nouveau
                        </span>
                      )}
                    </>
                  )}
                  {!sidebarOpen && item.badge === 'new' && (
                    <span className="absolute -top-2 -right-2 w-3 h-3 bg-red-500 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-100 space-y-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden md:flex items-center gap-3 w-full px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              {sidebarOpen && <span className="font-medium">Réduire</span>}
            </button>

            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={20} className="shrink-0" />
              {sidebarOpen && <span className="font-medium">Déconnexion</span>}
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <div>
              {store && !loading ? (
                <div className="flex items-center gap-3">
                  {store.logo_url && (
                    <img src={store.logo_url} alt="" className="w-8 h-8 rounded object-cover" />
                  )}
                  <div>
                    <h1 className="font-bold text-gray-900">{store.name}</h1>
                    <p className="text-xs text-gray-500">{store.city}</p>
                  </div>
                </div>
              ) : (
                <div className="h-8 bg-gray-200 rounded w-32 animate-pulse" />
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg hover:text-gray-900 transition-colors">
              <AlertCircle size={20} />
            </button>

            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover" />
              ) : (
                <div className="w-9 h-9 bg-kclick-orange rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {profile?.full_name?.[0] || 'U'}
                </div>
              )}
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-gray-900">{profile?.full_name}</p>
                <p className="text-xs text-gray-500">Propriétaire</p>
              </div>
            </div>
          </div>
        </header>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-200 p-4 space-y-2 max-h-96 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    active
                      ? 'bg-kclick-orange text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                  {item.badge === 'new' && (
                    <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      Nouveau
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
