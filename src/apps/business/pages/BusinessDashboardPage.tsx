import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  TrendingUp, ShoppingCart, Package, DollarSign, AlertTriangle,
  Calendar, ArrowRight, Eye, CheckCircle, Clock
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { storesService, ordersService, productsService } from '../../../lib/api';
import BusinessLayout from '../components/BusinessLayout';
import type { Store } from '../../../types';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  lowStockCount: number;
  pendingOrders: number;
  deliveredOrders: number;
}

interface RecentOrder {
  id: string;
  user_id: string;
  total: number;
  status: string;
  created_at: string;
  shipping_name: string;
}

export default function BusinessDashboardPage() {
  const navigate = useNavigate();
  const { storeId } = useParams<{ storeId: string }>();
  const { user } = useAuth();
  const [store, setStore] = useState<Store | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !storeId) {
      navigate('/business');
      return;
    }

    const loadData = async () => {
      try {
        const { data: storeData, error: storeError } = await storesService.getByIdAndOwner(storeId, user.id);

        if (storeError) throw new Error(storeError.message);
        setStore(storeData);

        const [ordersRes, productsRes] = await Promise.all([
          ordersService.getByStore(storeId),
          productsService.getByStore(storeId),
        ]);

        if (ordersRes.error) throw new Error(ordersRes.error.message);
        if (productsRes.error) throw new Error(productsRes.error.message);

        const orders = ordersRes.data || [];
        const products = productsRes.data || [];

        const lowStockCount = products.filter((p) => (p.stock || 0) < (p.low_stock_threshold || 10)).length;
        const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);
        const pendingOrders = orders.filter((o) => o.status === 'pending').length;
        const deliveredOrders = orders.filter((o) => o.status === 'delivered').length;

        setStats({
          totalRevenue,
          totalOrders: orders.length,
          totalProducts: products.length,
          lowStockCount,
          pendingOrders,
          deliveredOrders,
        });

        setRecentOrders(
          orders
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 5)
        );
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, storeId, navigate]);

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  const formatDate = (date: string) => new Date(date).toLocaleDateString('fr-FR');

  const statCards = [
    { label: 'Revenus totaux', value: formatCurrency(stats?.totalRevenue || 0), icon: DollarSign, color: 'bg-green-100', textColor: 'text-green-600' },
    { label: 'Commandes', value: stats?.totalOrders || 0, icon: ShoppingCart, color: 'bg-blue-100', textColor: 'text-blue-600' },
    { label: 'Produits', value: stats?.totalProducts || 0, icon: Package, color: 'bg-purple-100', textColor: 'text-purple-600' },
    { label: 'Stock faible', value: stats?.lowStockCount || 0, icon: AlertTriangle, color: 'bg-orange-100', textColor: 'text-orange-600' },
  ];

  return (
    <BusinessLayout store={store} loading={loading}>
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900">Tableau de bord</h1>
          <p className="text-gray-500 mt-1">Vue d'ensemble de votre boutique</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon size={24} className={card.textColor} />
                </div>
                <p className="text-gray-600 text-sm mb-1">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock size={18} className="text-orange-600" />
              Commandes en attente
            </h3>
            <p className="text-3xl font-black text-orange-600">{stats?.pendingOrders || 0}</p>
            <button
              onClick={() => navigate(`/business/store/${storeId}/orders`)}
              className="mt-4 flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 font-semibold"
            >
              Voir toutes les commandes
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle size={18} className="text-green-600" />
              Commandes livrées
            </h3>
            <p className="text-3xl font-black text-green-600">{stats?.deliveredOrders || 0}</p>
            <p className="text-sm text-gray-500 mt-2">Depuis le début</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle size={18} className="text-red-600" />
              Stock faible
            </h3>
            <p className="text-3xl font-black text-red-600">{stats?.lowStockCount || 0}</p>
            <button
              onClick={() => navigate(`/business/store/${storeId}/inventory`)}
              className="mt-4 flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-semibold"
            >
              Gérer l'inventaire
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-bold text-lg text-gray-900 mb-6">Commandes récentes</h3>
          {recentOrders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucune commande pour le moment</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Client</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Montant</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Statut</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-900">{order.shipping_name}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-gray-900">${order.total.toFixed(2)}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                          order.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                          order.status === 'shipped' ? 'bg-purple-100 text-purple-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-sm">{formatDate(order.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </BusinessLayout>
  );
}
