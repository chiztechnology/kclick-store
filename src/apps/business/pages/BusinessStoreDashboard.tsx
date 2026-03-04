import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingBag, Plus,
  Edit2, Trash2, Eye, ChevronRight, DollarSign, Star,
  ArrowUpRight, ArrowDownRight, RefreshCw, Settings, Search,
  Check, X, BarChart3, Clock, Home, Store, Box, Wallet, Tag,
  Upload, Globe, EyeOff, Archive
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { storesService, ordersService, productsService, apiClient } from '../../../lib/api';
import type { Store as StoreType, Order, Product, Category, Brand } from '../../../types';
import OrdersTab from '../components/OrdersTab';
import InventoryTab from '../components/InventoryTab';
import PayoutsTab from '../components/PayoutsTab';
import PromotionsTab from '../components/PromotionsTab';
import AnalyticsTab from '../components/AnalyticsTab';
import StoreSettingsTab from '../components/StoreSettingsTab';
import * as businessService from '../services/businessService';

type DashboardTab = 'overview' | 'products' | 'orders' | 'inventory' | 'payouts' | 'promotions' | 'analytics' | 'settings';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-orange-100 text-orange-700',
  packed: 'bg-cyan-100 text-cyan-700',
  shipped: 'bg-teal-100 text-teal-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-700',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirme',
  processing: 'Preparation',
  packed: 'Emballe',
  shipped: 'Expedie',
  delivered: 'Livre',
  cancelled: 'Annule',
  refunded: 'Rembourse',
};

interface StoreStats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  lowStockProducts: number;
  averageRating: number;
  revenueGrowth: number;
  ordersGrowth: number;
}

export const ECOMMERCE_URL = import.meta.env.VITE_ECOMMERCE_URL || 'http://localhost:3000';


function StatCard({ title, value, change, icon, color }: { title: string; value: string; change?: number; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-all duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-black text-gray-900 mt-1">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-sm font-semibold ${change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {change >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {Math.abs(change)}% ce mois
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
      </div>
    </div>
  );
}

export default function BusinessStoreDashboard() {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<DashboardTab>(() => {
    const t = searchParams.get('tab') as DashboardTab | null;
    return t || 'overview';
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [store, setStore] = useState<StoreType | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<StoreStats | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [productStatusFilter, setProductStatusFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const loadData = useCallback(async () => {
    if (!storeId || !user) return;

    try {
      const [storeRes, productsRes, ordersRes, categoriesRes, brandsRes] = await Promise.all([
        storesService.getByIdAndOwner(storeId, user.id),
        apiClient.get<any[]>(`/products?store_id=${storeId}&include=product_images,product_variants&order_by=created_at&order_dir=desc`),
        apiClient.get<any[]>(`/orders?store_id=${storeId}&include=order_items&order_by=created_at&order_dir=desc`),
        apiClient.get<Category[]>(`/categories?is_active=true&order_by=sort_order`),
        apiClient.get<Brand[]>(`/brands?is_active=true&order_by=name`),
      ]);

      if (!storeRes.data) {
        navigate('/business/portal');
        return;
      }

      setStore(storeRes.data);
      const productsList = (productsRes.data || []).map((p: any) => ({
        ...p,
        images: p.product_images || [],
        variants: p.product_variants || [],
      }));
      setProducts(productsList);
      setOrders(ordersRes.data || []);
      setCategories(categoriesRes.data || []);
      setBrands(brandsRes.data || []);

      const ordersList = ordersRes.data || [];

      setStats({
        totalRevenue: ordersList.reduce((sum: number, o: any) => sum + Number(o.total || 0), 0),
        totalOrders: ordersList.length,
        pendingOrders: ordersList.filter((o: any) => o.status === 'pending').length,
        totalProducts: productsList.length,
        lowStockProducts: productsList.filter((p: any) => (p.stock || 0) < (p.low_stock_threshold || 10)).length,
        averageRating: storeRes.data.rating || 0,
        revenueGrowth: 12.5,
        ordersGrowth: 8.3,
      });
    } catch (error) {
      console.error('Error loading data:', error);
      showNotification('Erreur lors du chargement', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [storeId, user, navigate, showNotification]);

  useEffect(() => {
    if (!user) {
      navigate('/welcome');
      return;
    }
    loadData();
  }, [user, loadData, navigate]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleQuickStatusChange = async (product: Product, newStatus: 'published' | 'draft' | 'archived') => {
    try {
      const { error } = await apiClient.patch(`/products/${product.id}`, {
        status: newStatus,
        is_active: newStatus === 'published',
      });
      if (error) throw new Error(error.message);
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, status: newStatus, is_active: newStatus === 'published' } : p));
      const labels: Record<string, string> = { published: 'Publié', draft: 'Mis en brouillon', archived: 'Archivé' };
      showNotification(labels[newStatus] || 'Mis à jour');
    } catch {
      showNotification('Erreur lors de la mise à jour', 'error');
    }
  };

  const handleOrderStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await businessService.updateOrderStatus(orderId, newStatus);
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus as Order['status'] } : o));
      showNotification(`Commande ${STATUS_LABELS[newStatus]}`);
    } catch {
      showNotification('Erreur lors de la mise a jour', 'error');
    }
  };

  const handleOrderTrackingUpdate = async (orderId: string, tracking: string) => {
    try {
      await businessService.updateOrderTracking(orderId, tracking);
      setOrders(orders.map(o => o.id === orderId ? { ...o, tracking_number: tracking } : o));
    } catch {
      showNotification('Erreur lors de la mise a jour', 'error');
    }
  };


  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Supprimer ce produit?')) return;
    try {
      const { error } = await apiClient.delete(`/products/${productId}`);
      if (error) throw new Error(error.message);
      setProducts(products.filter(p => p.id !== productId));
      showNotification('Produit supprime');
    } catch {
      showNotification('Erreur lors de la suppression', 'error');
    }
  };

  const filteredProducts = products
    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.sku || '').toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(p => {
      if (productStatusFilter === 'all') return true;
      if (productStatusFilter === 'draft') return p.status === 'draft';
      if (productStatusFilter === 'published') return p.status === 'published' || (!p.status && p.is_active);
      if (productStatusFilter === 'archived') return p.status === 'archived';
      return true;
    });

  const draftCount = products.filter(p => p.status === 'draft').length;
  const publishedCount = products.filter(p => p.status === 'published' || (!p.status && p.is_active)).length;

  const getStatusBadge = (product: Product) => {
    if (product.status === 'draft') return { label: 'Brouillon', cls: 'bg-amber-100 text-amber-700' };
    if (product.status === 'archived') return { label: 'Archive', cls: 'bg-gray-100 text-gray-600' };
    if (product.status === 'published' || (!product.status && product.is_active)) return { label: 'Publie', cls: 'bg-emerald-100 text-emerald-700' };
    return { label: 'Inactif', cls: 'bg-gray-100 text-gray-600' };
  };

  const tabs = [
    { id: 'overview' as DashboardTab, icon: <LayoutDashboard size={16} />, label: 'Tableau de bord' },
    { id: 'products' as DashboardTab, icon: <Package size={16} />, label: 'Produits', badge: products.length },
    { id: 'orders' as DashboardTab, icon: <ShoppingBag size={16} />, label: 'Commandes', badge: stats?.pendingOrders },
    { id: 'inventory' as DashboardTab, icon: <Box size={16} />, label: 'Inventaire' },
    { id: 'payouts' as DashboardTab, icon: <Wallet size={16} />, label: 'Paiements' },
    { id: 'promotions' as DashboardTab, icon: <Tag size={16} />, label: 'Promotions' },
    { id: 'analytics' as DashboardTab, icon: <BarChart3 size={16} />, label: 'Analytiques' },
    { id: 'settings' as DashboardTab, icon: <Settings size={16} />, label: 'Parametres' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-kclick-orange/30 border-t-kclick-orange rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white font-medium flex items-center gap-2`}>
          {notification.type === 'success' ? <Check size={18} /> : <X size={18} />}
          {notification.message}
        </div>
      )}

      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/business/portal" className="flex items-center gap-2 text-gray-500 hover:text-gray-700">
                <ChevronRight size={16} className="rotate-180" />
                <span className="text-sm">Mes boutiques</span>
              </Link>
              <div className="w-px h-6 bg-gray-200" />
              <div className="flex items-center gap-3">
                {store?.logo_url ? (
                  <img src={store.logo_url} alt="" className="w-10 h-10 rounded-xl object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-kclick-orange/10 flex items-center justify-center">
                    <Store size={20} className="text-kclick-orange" />
                  </div>
                )}
                <div>
                  <h1 className="font-bold text-gray-900">{store?.name}</h1>
                  <p className="text-xs text-gray-500">{store?.city}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleRefresh} disabled={refreshing} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
                <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
              </button>
              <Link to={`${ECOMMERCE_URL}/stores/${storeId}`} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-xl hover:bg-gray-100 flex items-center gap-2">
                <Eye size={16} /> Voir boutique
              </Link>
              <Link to="/" className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
                <Home size={18} />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {(stats?.pendingOrders || 0) > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 mb-6 flex items-center gap-4">
            <div className="p-2 bg-amber-100 rounded-xl"><Clock size={20} className="text-amber-600" /></div>
            <div className="flex-1">
              <p className="font-semibold text-amber-900">{stats?.pendingOrders} commande{(stats?.pendingOrders || 0) > 1 ? 's' : ''} en attente</p>
              <p className="text-sm text-amber-700">Traitez ces commandes rapidement</p>
            </div>
            <button onClick={() => setActiveTab('orders')} className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-medium transition-colors">Voir</button>
          </div>
        )}

        <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl mb-6 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSearchQuery(''); }}
              className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.id ? 'bg-white text-kclick-orange shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${activeTab === tab.id ? 'bg-kclick-orange/10 text-kclick-orange' : 'bg-gray-200 text-gray-600'}`}>{tab.badge}</span>
              )}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Chiffre d'affaires" value={`$${stats.totalRevenue.toFixed(0)}`} change={stats.revenueGrowth} icon={<DollarSign size={20} className="text-emerald-600" />} color="bg-emerald-50" />
              <StatCard title="Commandes" value={stats.totalOrders.toString()} change={stats.ordersGrowth} icon={<ShoppingBag size={20} className="text-blue-600" />} color="bg-blue-50" />
              <StatCard title="Produits" value={stats.totalProducts.toString()} icon={<Package size={20} className="text-kclick-orange" />} color="bg-orange-50" />
              <StatCard title="Note moyenne" value={`${stats.averageRating}`} icon={<Star size={20} className="text-amber-500" />} color="bg-amber-50" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">Commandes recentes</h3>
                  <button onClick={() => setActiveTab('orders')} className="text-sm text-kclick-orange hover:text-kclick-orange-dark font-medium">Voir tout</button>
                </div>
                {orders.length === 0 ? (
                  <p className="text-center text-gray-400 py-8">Aucune commande</p>
                ) : (
                  <div className="space-y-3">
                    {orders.slice(0, 5).map(order => (
                      <div key={order.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="w-10 h-10 bg-gradient-to-br from-kclick-orange to-kclick-orange-dark rounded-xl flex items-center justify-center text-white font-bold">{order.shipping_name?.[0] || '?'}</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{order.shipping_name}</p>
                          <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString('fr-FR')}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-kclick-orange">${Number(order.total).toFixed(2)}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[order.status]}`}>{STATUS_LABELS[order.status]}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">Produits populaires</h3>
                  <button onClick={() => setActiveTab('products')} className="text-sm text-kclick-orange hover:text-kclick-orange-dark font-medium">Voir tout</button>
                </div>
                {products.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400 mb-4">Aucun produit</p>
                    <Link to={`/business/store/${storeId}/products/new`} className="inline-flex items-center gap-2 bg-kclick-orange hover:bg-kclick-orange-dark text-white font-medium px-4 py-2 rounded-xl transition-colors"><Plus size={16} /> Ajouter un produit</Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {products.slice(0, 5).map(product => (
                      <div key={product.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                        {product.image_url ? <img src={product.image_url} alt="" className="w-10 h-10 rounded-xl object-cover" /> : <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center"><Package size={16} className="text-gray-400" /></div>}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.sold_count || 0} vendus</p>
                        </div>
                        <span className="font-bold text-kclick-orange">${product.price}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-56">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Rechercher par nom ou SKU..." className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-kclick-orange" />
              </div>
              <div className="flex gap-1.5">
                {(['all', 'published', 'draft', 'archived'] as const).map(f => (
                  <button key={f} onClick={() => setProductStatusFilter(f)} className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${productStatusFilter === f ? 'bg-kclick-orange text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    {f === 'all' ? 'Tous' : f === 'published' ? `Publiés (${publishedCount})` : f === 'draft' ? `Brouillons (${draftCount})` : 'Archivés'}
                  </button>
                ))}
              </div>
              <Link
                to={`/business/store/${storeId}/products/bulk`}
                className="flex items-center gap-2 bg-white border border-gray-200 hover:border-orange-400 hover:bg-orange-50 text-gray-700 hover:text-orange-600 font-medium px-4 py-2.5 rounded-xl transition-all text-sm"
              >
                <Upload size={15} /> Ajout groupé
              </Link>
              <Link
                to={`/business/store/${storeId}/products/new`}
                className="flex items-center gap-2 bg-kclick-orange hover:bg-kclick-orange-dark text-white font-medium px-4 py-2.5 rounded-xl transition-colors"
              >
                <Plus size={16} /> Ajouter un produit
              </Link>
            </div>
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <Package size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="font-bold text-gray-900 mb-2">Aucun produit</h3>
                <p className="text-gray-500 mb-4">Ajoutez votre premier produit pour commencer à vendre</p>
                <div className="flex items-center justify-center gap-3">
                  <Link to={`/business/store/${storeId}/products/new`} className="inline-flex items-center gap-2 bg-kclick-orange hover:bg-kclick-orange-dark text-white font-medium px-4 py-2.5 rounded-xl transition-colors"><Plus size={16} /> Ajouter un produit</Link>
                  <Link to={`/business/store/${storeId}/products/bulk`} className="inline-flex items-center gap-2 border border-gray-200 hover:border-orange-400 text-gray-700 font-medium px-4 py-2.5 rounded-xl transition-all"><Upload size={16} /> Ajout groupé</Link>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Produit</th>
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">SKU / Barcode</th>
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Prix</th>
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Stock</th>
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Vendus</th>
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Statut</th>
                        <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredProducts.map(product => {
                        const badge = getStatusBadge(product);
                        const isPublished = product.status === 'published' || (!product.status && product.is_active);
                        return (
                          <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                {product.image_url ? <img src={product.image_url} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" /> : <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0"><Package size={16} className="text-gray-400" /></div>}
                                <p className="font-medium text-gray-900 line-clamp-1 max-w-48">{product.name}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-xs">
                                {product.sku && <div className="font-mono text-gray-600">{product.sku}</div>}
                                {(product as any).barcode && <div className="font-mono text-gray-400">{(product as any).barcode}</div>}
                                {!product.sku && !(product as any).barcode && <span className="text-gray-300">—</span>}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-bold text-gray-900">${product.price}</span>
                              {product.discount_percent > 0 && <span className="ml-2 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">-{product.discount_percent}%</span>}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`font-semibold ${(product.stock || 0) < (product.low_stock_threshold || 10) ? 'text-red-600' : 'text-emerald-600'}`}>{product.stock || 0}</span>
                            </td>
                            <td className="px-4 py-3"><span className="text-gray-600">{product.sold_count || 0}</span></td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${badge.cls}`}>{badge.label}</span>
                                <button
                                  title={isPublished ? 'Dépublier (mettre en brouillon)' : 'Publier'}
                                  onClick={() => handleQuickStatusChange(product, isPublished ? 'draft' : 'published')}
                                  className={`p-1 rounded-lg transition-colors ${isPublished ? 'text-green-600 hover:bg-red-50 hover:text-red-600' : 'text-gray-400 hover:bg-green-50 hover:text-green-600'}`}
                                >
                                  {isPublished ? <Globe size={13} /> : <EyeOff size={13} />}
                                </button>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-1">
                                <Link to={`/business/store/${storeId}/products/${product.id}`} className="p-1.5 text-gray-500 hover:text-kclick-orange hover:bg-orange-50 rounded-lg transition-colors"><Edit2 size={14} /></Link>
                                <button onClick={() => handleQuickStatusChange(product, 'archived')} className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Archiver"><Archive size={14} /></button>
                                <button onClick={() => handleDeleteProduct(product.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <OrdersTab orders={orders} onStatusChange={handleOrderStatusChange} onTrackingUpdate={handleOrderTrackingUpdate} showNotification={showNotification} storeName={store?.name} />
        )}

        {activeTab === 'inventory' && storeId && user && (
          <InventoryTab products={products} storeId={storeId} userId={user.id} onRefresh={loadData} showNotification={showNotification} />
        )}

        {activeTab === 'payouts' && storeId && (
          <PayoutsTab storeId={storeId} orders={orders} />
        )}

        {activeTab === 'promotions' && storeId && (
          <PromotionsTab storeId={storeId} products={products} showNotification={showNotification} />
        )}

        {activeTab === 'analytics' && storeId && (
          <AnalyticsTab storeId={storeId} products={products} orders={orders} />
        )}

        {activeTab === 'settings' && store && user && (
          <StoreSettingsTab store={store} userId={user.id} onRefresh={loadData} showNotification={showNotification} />
        )}
      </div>

    </div>
  );
}
