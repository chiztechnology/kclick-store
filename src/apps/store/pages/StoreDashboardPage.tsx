import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingBag, TrendingUp, AlertTriangle, Plus,
  Edit2, Trash2, Eye, ChevronRight, DollarSign, Users, Star, Bell,
  ArrowUpRight, ArrowDownRight, RefreshCw, Settings, LogOut, Search,
  Check, X, Minus, BarChart3, Clock, Truck, Box
} from 'lucide-react';
import {
  storesService,
  productsService,
  ordersService,
  stockMovementsService,
  categoriesService,
  brandsService,
  apiClient
} from '../../../lib/api';
import type { Store, StoreProduct, Order, Product, StockMovement, Category, Brand, ProductVariant } from '../../../types';
import ProductForm from '../../../components/ProductForm';
import Pagination from '../../../components/Pagination';

type DashboardTab = 'overview' | 'products' | 'orders' | 'inventory' | 'analytics';

const ITEMS_PER_PAGE = 20;

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-teal-100 text-teal-700',
  processing: 'bg-orange-100 text-orange-700',
  shipped: 'bg-sky-100 text-sky-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-700',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirme',
  processing: 'Preparation',
  shipped: 'Expedie',
  delivered: 'Livre',
  cancelled: 'Annule',
  refunded: 'Rembourse',
};

const MOVEMENT_LABELS: Record<string, { label: string; color: string }> = {
  in: { label: 'Entree', color: 'text-emerald-600 bg-emerald-50' },
  out: { label: 'Sortie', color: 'text-red-600 bg-red-50' },
  adjustment: { label: 'Ajustement', color: 'text-blue-600 bg-blue-50' },
  return: { label: 'Retour', color: 'text-amber-600 bg-amber-50' },
  damaged: { label: 'Endommage', color: 'text-red-600 bg-red-50' },
  expired: { label: 'Expire', color: 'text-gray-600 bg-gray-50' },
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

export default function StoreDashboardPage() {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [store, setStore] = useState<Store | null>(null);
  const [storeProducts, setStoreProducts] = useState<StoreProduct[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [stats, setStats] = useState<StoreStats | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [orderFilter, setOrderFilter] = useState('all');
  const [stockModal, setStockModal] = useState<{ open: boolean; product: StoreProduct | null }>({ open: false, product: null });
  const [stockAction, setStockAction] = useState<{ type: string; quantity: number; notes: string }>({ type: 'in', quantity: 0, notes: '' });
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [productsPage, setProductsPage] = useState(1);
  const [ordersPage, setOrdersPage] = useState(1);
  const [movementsPage, setMovementsPage] = useState(1);
  const [productsTotalCount, setProductsTotalCount] = useState(0);
  const [ordersTotalCount, setOrdersTotalCount] = useState(0);
  const [movementsTotalCount, setMovementsTotalCount] = useState(0);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [productModal, setProductModal] = useState<{ open: boolean; editing: Product | null }>({ open: false, editing: null });
  const [productFormData, setProductFormData] = useState<Partial<Product>>({});
  const [productImages, setProductImages] = useState<{ url: string; sort_order: number }[]>([]);
  const [productVariants, setProductVariants] = useState<Partial<ProductVariant>[]>([]);
  const [savingProduct, setSavingProduct] = useState(false);

  const showNotification = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const loadData = useCallback(async (resetPages = false) => {
    if (resetPages) {
      setProductsPage(1);
      setOrdersPage(1);
      setMovementsPage(1);
    }
    try {
      // Load store, categories, and brands in parallel
      const [storeRes, categoriesRes, brandsRes] = await Promise.all([
        storesService.getById(storeId!),
        categoriesService.getAll({ isActive: true }),
        brandsService.getAll({ isActive: true }),
      ]);

      if (categoriesRes.data) {
        setCategories(categoriesRes.data);
      }
      if (brandsRes.data) {
        setBrands(brandsRes.data);
      }

      const storeData = storeRes.data;
      if (storeData) {
        setStore(storeData);
      }

      // Load products for this store
      const productsRes = await productsService.getByStore(storeId!);
      const productsData = productsRes.data || [];
      setProductsTotalCount(productsData.length);

      if (productsData.length > 0) {
        const storeProductsData = productsData.map((p: any) => ({
          id: p.id,
          store_id: p.store_id || storeId,
          product_id: p.id,
          product: p,
          price: Number(p.price),
          compare_at_price: Number(p.original_price || 0),
          cost_price: 0,
          stock: p.stock || 0,
          reserved_stock: 0,
          low_stock_threshold: p.low_stock_threshold || 10,
          sku: p.sku || '',
          barcode: p.barcode || '',
          location: '',
          is_active: p.is_active || true,
          is_featured: p.is_featured || false,
          sort_order: 0,
          created_at: p.created_at,
          updated_at: p.updated_at || p.created_at,
        }));
        setStoreProducts(storeProductsData as any);
      }

      // Load orders for this store
      const ordersRes = await ordersService.getByStore(storeId!);
      const ordersData = ordersRes.data || [];
      setOrdersTotalCount(ordersData.length);

      if (ordersData.length > 0) {
        setOrders(ordersData as any);
      }

      // Load stock movements for this store
      const movementsRes = await stockMovementsService.getByStore(storeId!);
      const movementsData = movementsRes.data || [];
      setMovementsTotalCount(movementsData.length);

      if (movementsData.length > 0) {
        setMovements(movementsData);
      }

      const products = productsData;
      const ordersList = ordersData;

      setStats({
        totalRevenue: ordersList.reduce((sum: number, o: any) => sum + Number(o.total || 0), 0),
        totalOrders: ordersList.length,
        pendingOrders: ordersList.filter((o: any) => o.status === 'pending').length,
        totalProducts: products.length,
        lowStockProducts: products.filter((p: any) => p.stock <= (p.low_stock_threshold || 10)).length,
        averageRating: storeData?.rating || 4.5,
        revenueGrowth: 12.5,
        ordersGrowth: 8.3
      });
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [storeId, productsPage, ordersPage, movementsPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  console.log(storeProducts);
  console.log(movements)

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleOrderStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const updateRes = await ordersService.updateStatus(orderId, newStatus);
      if (updateRes.error) {
        throw new Error(updateRes.error.message);
      }

      if (newStatus === 'confirmed') {
        const order = orders.find(o => o.id === orderId);
        if (order?.items && order.items.length > 0) {
          for (const item of order.items) {
            const sp = storeProducts.find(p => p.product_id === item.product_id);
            if (sp) {
              const previousStock = sp.stock;
              const newStock = Math.max(0, previousStock - item.quantity);
              const currentSoldCount = sp.product?.sold_count || 0;
              const newSoldCount = currentSoldCount + item.quantity;

              // Update product stock via API
              await productsService.updateStock(item.product_id, newStock);

              // Create stock movement via API
              await stockMovementsService.create({
                store_product_id: '',
                product_id: item.product_id,
                store_id: storeId!,
                movement_type: 'out',
                quantity: item.quantity,
                previous_stock: previousStock,
                new_stock: newStock,
                notes: `Commande acceptee #${orderId.slice(0, 8).toUpperCase()}`
              });

              setStoreProducts(prev => prev.map(p => p.product_id === item.product_id ? {
                ...p,
                stock: newStock,
                product: { ...p.product, stock: newStock, sold_count: newSoldCount }
              } : p));

              setMovements(prev => [{
                id: `m-${Date.now()}-${item.product_id}`,
                store_product_id: '',
                product_id: item.product_id,
                store_id: storeId!,
                movement_type: 'out',
                quantity: item.quantity,
                previous_stock: previousStock,
                new_stock: newStock,
                reference_type: 'order',
                reference_id: orderId,
                notes: `Commande acceptee #${orderId.slice(0, 8).toUpperCase()}`,
                created_at: new Date().toISOString()
              }, ...prev]);
            }
          }
        }
      }

      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus as Order['status'] } : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus as Order['status'] } : null);
      }
      showNotification(`Commande ${STATUS_LABELS[newStatus]}`);
    } catch (error) {
      console.error('Error updating order:', error);
      showNotification('Erreur lors de la mise a jour', 'error');
    }
  };

  const handleStockUpdate = async () => {
    if (!stockModal.product || stockAction.quantity <= 0) return;

    const sp = stockModal.product;
    let newStock = sp.stock;

    if (stockAction.type === 'in' || stockAction.type === 'return') {
      newStock = sp.stock + stockAction.quantity;
    } else if (stockAction.type === 'out' || stockAction.type === 'damaged') {
      newStock = Math.max(0, sp.stock - stockAction.quantity);
    } else if (stockAction.type === 'adjustment') {
      newStock = stockAction.quantity;
    }

    try {
      // Update product stock via API
      await productsService.updateStock(sp.product_id, newStock);

      // Create stock movement via API
      await stockMovementsService.create({
        store_product_id: '',
        product_id: sp.product_id,
        store_id: storeId!,
        movement_type: stockAction.type as StockMovement['movement_type'],
        quantity: stockAction.quantity,
        previous_stock: sp.stock,
        new_stock: newStock,
        notes: stockAction.notes,
      });

      setStoreProducts(storeProducts.map(p =>
        p.id === sp.id ? { ...p, stock: newStock, product: { ...p.product, stock: newStock } } : p
      ));

      setMovements([
        {
          id: `m-${Date.now()}`,
          store_product_id: '',
          product_id: sp.product_id,
          store_id: storeId!,
          movement_type: stockAction.type as StockMovement['movement_type'],
          quantity: stockAction.quantity,
          previous_stock: sp.stock,
          new_stock: newStock,
          notes: stockAction.notes,
          created_at: new Date().toISOString()
        },
        ...movements
      ]);

      showNotification('Stock mis a jour');
    } catch (error) {
      console.error('Error updating stock:', error);
      showNotification('Erreur lors de la mise a jour du stock', 'error');
    }

    setStockModal({ open: false, product: null });
    setStockAction({ type: 'in', quantity: 0, notes: '' });
  };

  const openProductModal = (product?: Product) => {
    setProductModal({ open: true, editing: product || null });
    if (product) {
      setProductFormData({ ...product });
      setProductImages(product.images?.map(img => ({ url: img.url, sort_order: img.sort_order })) || []);
      setProductVariants(product.variants || []);
    } else {
      setProductFormData({ store_id: storeId, is_active: true });
      setProductImages([]);
      setProductVariants([]);
    }
  };

  const closeProductModal = () => {
    setProductModal({ open: false, editing: null });
    setProductFormData({});
    setProductImages([]);
    setProductVariants([]);
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    const result = await apiClient.upload('/uploads/products', file, { path });

    if (result.error) {
      throw new Error(result.error.message);
    }

    return result.data?.url || '';
  };

  const handleSaveProduct = async () => {
    if (!productFormData.name || !productFormData.category_id) {
      showNotification('Veuillez remplir les champs obligatoires', 'error');
      return;
    }

    setSavingProduct(true);
    try {
      const productData = {
        ...productFormData,
        store_id: storeId,
        image_url: productImages[0]?.url || productFormData.image_url || '',
      };

      let productId = productModal.editing?.id;

      if (productModal.editing) {
        const updateRes = await productsService.update(productId!, productData as any);
        if (updateRes.error) {
          throw new Error(updateRes.error.message);
        }
      } else {
        const createRes = await productsService.create(productData as any);
        if (createRes.error) {
          throw new Error(createRes.error.message);
        }
        productId = createRes.data?.id;
      }

      // Note: Product images and variants would need their own API endpoints
      // For now, we'll skip those as they would require additional services

      showNotification(productModal.editing ? 'Produit mis a jour' : 'Produit cree avec succes');
      closeProductModal();
      loadData();
    } catch (error) {
      console.error('Error saving product:', error);
      showNotification('Erreur lors de la sauvegarde', 'error');
    } finally {
      setSavingProduct(false);
    }
  };

  const filteredOrders = orders.filter(o =>
    orderFilter === 'all' || o.status === orderFilter
  ).filter(o =>
    o.shipping_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lowStockProducts = storeProducts.filter(sp => sp.stock <= sp.low_stock_threshold);

  const tabs = [
    { id: 'overview' as DashboardTab, icon: <LayoutDashboard size={16} />, label: 'Tableau de bord' },
    { id: 'products' as DashboardTab, icon: <Package size={16} />, label: 'Produits', badge: storeProducts.length },
    { id: 'orders' as DashboardTab, icon: <ShoppingBag size={16} />, label: 'Commandes', badge: stats?.pendingOrders },
    { id: 'inventory' as DashboardTab, icon: <Box size={16} />, label: 'Inventaire', badge: lowStockProducts.length > 0 ? lowStockProducts.length : undefined },
    { id: 'analytics' as DashboardTab, icon: <BarChart3 size={16} />, label: 'Analytiques' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg ${notification.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'} text-white font-medium flex items-center gap-2`}>
          {notification.type === 'success' ? <Check size={18} /> : <X size={18} />}
          {notification.message}
        </div>
      )}

      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/store-portal/select-store')}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
              >
                <ChevronRight size={16} className="rotate-180" />
                <span className="text-sm">Boutiques</span>
              </button>
              <div className="w-px h-6 bg-gray-200" />
              <div className="flex items-center gap-3">
                {store?.logo_url ? (
                  <img src={store.logo_url} alt="" className="w-10 h-10 rounded-xl object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <Package size={20} className="text-emerald-600" />
                  </div>
                )}
                <div>
                  <h1 className="font-bold text-gray-900">{store?.name}</h1>
                  <p className="text-xs text-gray-500">{store?.city}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
              </button>
              <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
                <Bell size={18} />
                {stats && stats.pendingOrders > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
                <Settings size={18} />
              </button>
              <div className="w-px h-6 bg-gray-200 mx-1" />
              <Link to="/" className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-xl hover:bg-gray-100">
                Voir boutique
              </Link>
              <button
                onClick={() => navigate('/store-portal/signin')}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {(stats?.pendingOrders || 0) > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 mb-6 flex items-center gap-4">
            <div className="p-2 bg-amber-100 rounded-xl">
              <Clock size={20} className="text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-amber-900">{stats?.pendingOrders} commande{(stats?.pendingOrders || 0) > 1 ? 's' : ''} en attente</p>
              <p className="text-sm text-amber-700">Traitez ces commandes rapidement pour satisfaire vos clients</p>
            </div>
            <button
              onClick={() => { setActiveTab('orders'); setOrderFilter('pending'); }}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-medium transition-colors"
            >
              Voir les commandes
            </button>
          </div>
        )}

        {lowStockProducts.length > 0 && activeTab === 'overview' && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 mb-6 flex items-center gap-4">
            <div className="p-2 bg-red-100 rounded-xl">
              <AlertTriangle size={20} className="text-red-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-red-900">{lowStockProducts.length} produit{lowStockProducts.length > 1 ? 's' : ''} en stock faible</p>
              <p className="text-sm text-red-700">Reapprovisionnez ces articles pour eviter les ruptures</p>
            </div>
            <button
              onClick={() => setActiveTab('inventory')}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors"
            >
              Gerer l'inventaire
            </button>
          </div>
        )}

        <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl mb-6 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSearchQuery(''); setOrderFilter('all'); }}
              className={`shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.id ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${activeTab === tab.id ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Chiffre d'affaires" value={`$${stats.totalRevenue.toFixed(0)}`} change={stats.revenueGrowth} icon={<DollarSign size={20} className="text-emerald-600" />} color="bg-emerald-50" />
              <StatCard title="Commandes" value={stats.totalOrders.toString()} change={stats.ordersGrowth} icon={<ShoppingBag size={20} className="text-blue-600" />} color="bg-blue-50" />
              <StatCard title="Produits" value={stats.totalProducts.toString()} icon={<Package size={20} className="text-orange-600" />} color="bg-orange-50" />
              <StatCard title="Note moyenne" value={`${stats.averageRating}`} icon={<Star size={20} className="text-amber-500" />} color="bg-amber-50" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">Commandes recentes</h3>
                  <button onClick={() => setActiveTab('orders')} className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                    Voir tout
                  </button>
                </div>
                {orders.length === 0 ? (
                  <p className="text-center text-gray-400 py-8">Aucune commande</p>
                ) : (
                  <div className="space-y-3">
                    {orders.slice(0, 5).map(order => (
                      <div key={order.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center text-white font-bold">
                          {order.shipping_name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{order.shipping_name}</p>
                          <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString('fr-FR')}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-emerald-600">${Number(order.total).toFixed(2)}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[order.status]}`}>
                            {STATUS_LABELS[order.status]}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">Produits populaires</h3>
                  <button onClick={() => setActiveTab('products')} className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                    Voir tout
                  </button>
                </div>
                {storeProducts.length === 0 ? (
                  <p className="text-center text-gray-400 py-8">Aucun produit</p>
                ) : (
                  <div className="space-y-3">
                    {storeProducts.slice(0, 5).map(sp => (
                      <div key={sp.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                        <img src={sp.product?.image_url} alt="" className="w-10 h-10 rounded-xl object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{sp.product?.name}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{sp.product?.sold_count || 0} vendus</span>
                            <span className={sp.stock <= sp.low_stock_threshold ? 'text-red-500 font-medium' : ''}>
                              Stock: {sp.stock}
                            </span>
                          </div>
                        </div>
                        <span className="font-bold text-emerald-600">${sp.price}</span>
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
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="relative flex-1 min-w-64">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un produit..."
                  className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <button
                onClick={() => openProductModal()}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2.5 rounded-xl transition-colors"
              >
                <Plus size={16} />
                Ajouter un produit
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Produit</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">SKU</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Prix</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Stock</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Statut</th>
                      <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {storeProducts.filter(sp =>
                      sp.product?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      sp.sku.toLowerCase().includes(searchQuery.toLowerCase())
                    ).map(sp => (
                      <tr key={sp.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img src={sp.product?.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                            <div>
                              <p className="font-medium text-gray-900 line-clamp-1">{sp.product?.name}</p>
                              <p className="text-xs text-gray-500">Emplacement: {sp.location || '-'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <code className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-0.5 rounded">{sp.sku || '-'}</code>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <span className="font-bold text-gray-900">${sp.price}</span>
                            {sp.compare_at_price > sp.price && (
                              <span className="ml-2 text-xs text-gray-400 line-through">${sp.compare_at_price}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold ${sp.stock <= sp.low_stock_threshold ? 'text-red-600' : sp.stock <= sp.low_stock_threshold * 2 ? 'text-amber-600' : 'text-emerald-600'}`}>
                              {sp.stock}
                            </span>
                            {sp.stock <= sp.low_stock_threshold && (
                              <AlertTriangle size={14} className="text-red-500" />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${sp.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                            {sp.is_active ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setStockModal({ open: true, product: sp })}
                              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Gerer le stock"
                            >
                              <Box size={14} />
                            </button>
                            <button className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                              <Edit2 size={14} />
                            </button>
                            <button className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                currentPage={productsPage}
                totalPages={Math.ceil(productsTotalCount / ITEMS_PER_PAGE)}
                totalItems={productsTotalCount}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setProductsPage}
                loading={loading}
              />
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="relative flex-1 min-w-64">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher par nom ou numero..."
                  className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered'].map(status => (
                  <button
                    key={status}
                    onClick={() => setOrderFilter(status)}
                    className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${orderFilter === status ? 'bg-emerald-100 text-emerald-700' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >
                    {status === 'all' ? 'Toutes' : STATUS_LABELS[status]}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                  <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">Aucune commande trouvee</p>
                </div>
              ) : (
                filteredOrders.map(order => (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0">
                            {order.shipping_name[0]}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <p className="font-bold text-gray-900">{order.shipping_name}</p>
                              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status]}`}>
                                {STATUS_LABELS[order.status]}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">{order.shipping_city} · {order.shipping_phone}</p>
                            <p className="text-xs text-gray-400 font-mono mt-0.5">#{order.id.slice(0, 12).toUpperCase()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-2xl text-emerald-600">${Number(order.total).toFixed(2)}</p>
                          <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                          {order.items && <p className="text-xs text-gray-400">{order.items.length} article{order.items.length > 1 ? 's' : ''}</p>}
                        </div>
                      </div>

                      {order.items && order.items.length > 0 && (
                        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                          {order.items.slice(0, 4).map(item => (
                            <div key={item.id} className="shrink-0 flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                              <img src={item.product_image} alt="" className="w-8 h-8 rounded-lg object-cover" />
                              <div className="text-xs">
                                <p className="font-medium text-gray-800 max-w-32 truncate">{item.product_name}</p>
                                <p className="text-gray-400">x{item.quantity}</p>
                              </div>
                            </div>
                          ))}
                          {order.items.length > 4 && (
                            <div className="shrink-0 flex items-center justify-center bg-gray-100 rounded-xl px-4 text-xs font-medium text-gray-500">
                              +{order.items.length - 4}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="mt-4 flex items-center gap-2 flex-wrap" onClick={e => e.stopPropagation()}>
                        {order.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleOrderStatusChange(order.id, 'confirmed')}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2"
                            >
                              <Check size={14} /> Accepter
                            </button>
                            <button
                              onClick={() => handleOrderStatusChange(order.id, 'cancelled')}
                              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-xl transition-colors flex items-center gap-2"
                            >
                              <X size={14} /> Refuser
                            </button>
                          </>
                        )}
                        {order.status === 'confirmed' && (
                          <button
                            onClick={() => handleOrderStatusChange(order.id, 'processing')}
                            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2"
                          >
                            <Package size={14} /> Preparer la commande
                          </button>
                        )}
                        {order.status === 'processing' && (
                          <button
                            onClick={() => handleOrderStatusChange(order.id, 'shipped')}
                            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2"
                          >
                            <Truck size={14} /> Marquer comme expedie
                          </button>
                        )}
                        {order.status === 'shipped' && (
                          <button
                            onClick={() => handleOrderStatusChange(order.id, 'delivered')}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2"
                          >
                            <Check size={14} /> Marquer comme livre
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-colors flex items-center gap-2"
                        >
                          <Eye size={14} /> Facture
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
              {filteredOrders.length > 0 && (
                <Pagination
                  currentPage={ordersPage}
                  totalPages={Math.ceil(ordersTotalCount / ITEMS_PER_PAGE)}
                  totalItems={ordersTotalCount}
                  itemsPerPage={ITEMS_PER_PAGE}
                  onPageChange={setOrdersPage}
                  loading={loading}
                />
              )}
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-6">
            {lowStockProducts.length > 0 && (
              <div className="bg-white rounded-2xl border border-red-200 overflow-hidden">
                <div className="px-5 py-4 bg-red-50 border-b border-red-200 flex items-center gap-3">
                  <AlertTriangle size={20} className="text-red-600" />
                  <div>
                    <h3 className="font-bold text-red-900">Alertes stock faible</h3>
                    <p className="text-sm text-red-700">{lowStockProducts.length} produit{lowStockProducts.length > 1 ? 's' : ''} necessitent un reapprovisionnement</p>
                  </div>
                </div>
                <div className="divide-y divide-gray-100">
                  {lowStockProducts.map(sp => (
                    <div key={sp.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                      <img src={sp.product?.image_url} alt="" className="w-12 h-12 rounded-xl object-cover" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{sp.product?.name}</p>
                        <p className="text-sm text-gray-500">SKU: {sp.sku || '-'} | Emplacement: {sp.location || '-'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-red-600">{sp.stock}</p>
                        <p className="text-xs text-gray-500">Seuil: {sp.low_stock_threshold}</p>
                      </div>
                      <button
                        onClick={() => setStockModal({ open: true, product: sp })}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition-colors"
                      >
                        Reapprovisionner
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">Historique des mouvements</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {movements.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">
                    Aucun mouvement enregistre
                  </div>
                ) : (
                  movements.map(m => {
                    const config = MOVEMENT_LABELS[m.movement_type] || { label: m.movement_type, color: 'text-gray-600 bg-gray-50' };
                    const product = storeProducts.find(sp => sp.id === m.store_product_id);
                    return (
                      <div key={m.id} className="flex items-center gap-4 p-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.color}`}>
                          {m.movement_type === 'in' || m.movement_type === 'return' ? (
                            <ArrowUpRight size={18} />
                          ) : (
                            <ArrowDownRight size={18} />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${config.color}`}>
                              {config.label}
                            </span>
                            <span className="font-bold text-gray-900">
                              {m.movement_type === 'adjustment' ? '' : m.movement_type === 'in' || m.movement_type === 'return' ? '+' : '-'}
                              {m.quantity}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{product?.product?.name || 'Produit'}</p>
                          {m.notes && <p className="text-xs text-gray-400 mt-1">{m.notes}</p>}
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <p>{m.previous_stock} -&gt; {m.new_stock}</p>
                          <p className="text-xs">{new Date(m.created_at).toLocaleDateString('fr-FR')}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              {movements.length > 0 && (
                <Pagination
                  currentPage={movementsPage}
                  totalPages={Math.ceil(movementsTotalCount / ITEMS_PER_PAGE)}
                  totalItems={movementsTotalCount}
                  itemsPerPage={ITEMS_PER_PAGE}
                  onPageChange={setMovementsPage}
                  loading={loading}
                />
              )}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'Vues produits (ce mois)', value: '12,456', change: '+18%', icon: <Eye size={20} className="text-blue-500" /> },
                { label: 'Taux de conversion', value: '3.2%', change: '+0.5%', icon: <TrendingUp size={20} className="text-emerald-500" /> },
                { label: 'Panier moyen', value: '$95', change: '+$12', icon: <DollarSign size={20} className="text-orange-500" /> },
              ].map(item => (
                <div key={item.label} className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="flex items-center justify-between mb-2">
                    {item.icon}
                    <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">{item.change}</span>
                  </div>
                  <p className="text-3xl font-black text-gray-900">{item.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{item.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Performance des produits</h3>
              <div className="space-y-4">
                {storeProducts.map(sp => (
                  <div key={sp.id} className="flex items-center gap-4">
                    <img src={sp.product?.image_url} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{sp.product?.name}</p>
                        <span className="text-sm font-bold text-gray-900 ml-2">{sp.product?.sold_count || 0} vendus</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all"
                          style={{ width: `${Math.min(100, ((sp.product?.sold_count || 0) / 500) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {stockModal.open && stockModal.product && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Gerer le stock</h3>
                <button
                  onClick={() => setStockModal({ open: false, product: null })}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <img src={stockModal.product.product?.image_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                <div>
                  <p className="font-medium text-gray-900">{stockModal.product.product?.name}</p>
                  <p className="text-sm text-gray-500">Stock actuel: <span className="font-bold">{stockModal.product.stock}</span></p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Type de mouvement</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'in', label: 'Entree', icon: <Plus size={14} /> },
                    { value: 'out', label: 'Sortie', icon: <Minus size={14} /> },
                    { value: 'adjustment', label: 'Ajustement', icon: <Edit2 size={14} /> },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setStockAction({ ...stockAction, type: opt.value })}
                      className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${stockAction.type === opt.value ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      {opt.icon}
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {stockAction.type === 'adjustment' ? 'Nouveau stock' : 'Quantite'}
                </label>
                <input
                  type="number"
                  min="0"
                  value={stockAction.quantity || ''}
                  onChange={(e) => setStockAction({ ...stockAction, quantity: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-lg font-bold text-center focus:outline-none focus:border-emerald-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Notes (optionnel)</label>
                <textarea
                  value={stockAction.notes}
                  onChange={(e) => setStockAction({ ...stockAction, notes: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 resize-none"
                  rows={2}
                  placeholder="Raison du mouvement..."
                />
              </div>
            </div>

            <div className="p-5 border-t border-gray-100 flex gap-3">
              <button
                onClick={handleStockUpdate}
                disabled={stockAction.quantity <= 0}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-medium py-3 rounded-xl transition-colors"
              >
                Mettre a jour
              </button>
              <button
                onClick={() => setStockModal({ open: false, product: null })}
                className="px-6 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[92vh] flex flex-col">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 rounded-xl">
                  <ShoppingBag size={20} className="text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Details de la commande</h3>
                  <p className="text-xs text-gray-400 font-mono">#{selectedOrder.id.slice(0, 12).toUpperCase()}</p>
                </div>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Statut</p>
                    <span className={`text-sm font-bold px-3 py-1.5 rounded-full ${STATUS_COLORS[selectedOrder.status]}`}>
                      {STATUS_LABELS[selectedOrder.status]}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Date</p>
                    <p className="text-sm font-semibold text-gray-700">{new Date(selectedOrder.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4">
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-3">Livraison</p>
                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                    <div>
                      <p className="text-gray-500">Destinataire</p>
                      <p className="font-semibold text-gray-900">{selectedOrder.shipping_name}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Telephone</p>
                      <p className="font-semibold text-gray-900">{selectedOrder.shipping_phone}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Ville</p>
                      <p className="font-semibold text-gray-900">{selectedOrder.shipping_city}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Adresse</p>
                      <p className="font-semibold text-gray-900">{selectedOrder.shipping_address || '-'}</p>
                    </div>
                    {selectedOrder.tracking_number && (
                      <div className="col-span-2">
                        <p className="text-gray-500">Numero de suivi</p>
                        <p className="font-semibold text-gray-900 font-mono">{selectedOrder.tracking_number}</p>
                      </div>
                    )}
                  </div>
                </div>

                {selectedOrder.items && selectedOrder.items.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-3">Articles commandes</p>
                    <div className="border border-gray-100 rounded-2xl overflow-hidden">
                      <div className="divide-y divide-gray-50">
                        {selectedOrder.items.map((item, idx) => (
                          <div key={item.id} className={`flex items-center gap-4 p-4 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                            <img src={item.product_image} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0 border border-gray-100" />
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 truncate">{item.product_name}</p>
                              {item.variant && <p className="text-xs text-gray-500 mt-0.5">{item.variant}</p>}
                              <p className="text-sm text-gray-500 mt-0.5">${Number(item.unit_price).toFixed(2)} x {item.quantity}</p>
                            </div>
                            <p className="font-bold text-gray-900 text-right">${Number(item.total_price).toFixed(2)}</p>
                          </div>
                        ))}
                      </div>

                      <div className="bg-gray-50 border-t border-gray-100 p-4 space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Sous-total</span>
                          <span>${Number(selectedOrder.subtotal || selectedOrder.total).toFixed(2)}</span>
                        </div>
                        {selectedOrder.discount_amount > 0 && (
                          <div className="flex justify-between text-sm text-emerald-600">
                            <span>Reduction {selectedOrder.voucher_code && <span className="font-mono text-xs bg-emerald-100 px-1.5 rounded">({selectedOrder.voucher_code})</span>}</span>
                            <span>-${Number(selectedOrder.discount_amount).toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-black text-gray-900 text-lg pt-2 border-t border-gray-200">
                          <span>Total</span>
                          <span className="text-emerald-600">${Number(selectedOrder.total).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedOrder.notes && (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                    <p className="text-xs text-amber-600 uppercase font-semibold mb-1">Notes client</p>
                    <p className="text-sm text-amber-900">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-5 border-t border-gray-100 shrink-0 flex items-center gap-3 flex-wrap">
              {selectedOrder.status === 'pending' && (
                <>
                  <button
                    onClick={() => { handleOrderStatusChange(selectedOrder.id, 'confirmed'); }}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Check size={16} /> Accepter la commande
                  </button>
                  <button
                    onClick={() => { handleOrderStatusChange(selectedOrder.id, 'cancelled'); setSelectedOrder(null); }}
                    className="px-5 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-xl transition-colors flex items-center gap-2"
                  >
                    <X size={16} /> Refuser
                  </button>
                </>
              )}
              {selectedOrder.status === 'confirmed' && (
                <button
                  onClick={() => handleOrderStatusChange(selectedOrder.id, 'processing')}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Package size={16} /> Preparer la commande
                </button>
              )}
              {selectedOrder.status === 'processing' && (
                <button
                  onClick={() => handleOrderStatusChange(selectedOrder.id, 'shipped')}
                  className="flex-1 bg-sky-600 hover:bg-sky-700 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Truck size={16} /> Marquer comme expedie
                </button>
              )}
              {selectedOrder.status === 'shipped' && (
                <button
                  onClick={() => handleOrderStatusChange(selectedOrder.id, 'delivered')}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Check size={16} /> Marquer comme livre
                </button>
              )}
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {productModal.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-gray-100 shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-gray-900">
                  {productModal.editing ? 'Modifier le produit' : 'Nouveau produit'}
                </h3>
                <button
                  onClick={closeProductModal}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden p-5">
              <ProductForm
                product={productModal.editing}
                categories={categories}
                stores={store ? [store] : []}
                brands={brands}
                productImages={productImages}
                productVariants={productVariants}
                onImagesChange={setProductImages}
                onVariantsChange={setProductVariants}
                onImageUpload={handleImageUpload}
                onChange={setProductFormData}
                formData={productFormData}
                hideStoreSelect={true}
                storeId={storeId}
              />
            </div>

            <div className="p-5 border-t border-gray-100 flex gap-3 shrink-0">
              <button
                onClick={handleSaveProduct}
                disabled={savingProduct}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-medium py-3 rounded-xl transition-colors"
              >
                {savingProduct ? 'Enregistrement...' : (productModal.editing ? 'Mettre a jour' : 'Creer le produit')}
              </button>
              <button
                onClick={closeProductModal}
                disabled={savingProduct}
                className="px-6 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
