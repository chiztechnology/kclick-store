import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ShoppingCart, ChevronRight, Search, Filter, Download,
  CheckCircle, Clock, Truck, AlertCircle, X, Eye
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { storesService, ordersService, apiClient } from '../../../lib/api';
import BusinessLayout from '../components/BusinessLayout';
import type { Store } from '../../../types';
import Pagination from '../../../components/Pagination';

interface OrderWithItems {
  id: string;
  user_id: string;
  store_id: string;
  total: number;
  status: string;
  created_at: string;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  order_items: Array<{
    id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
  }>;
}

export default function BusinessOrdersPage() {
  const navigate = useNavigate();
  const { storeId } = useParams<{ storeId: string }>();
  const { user } = useAuth();
  const [store, setStore] = useState<Store | null>(null);
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!user || !storeId) {
      navigate('/business');
      return;
    }

    const loadData = async () => {
      try {
        const { data: storeData, error: storeError } = await storesService.getByIdAndOwner(storeId, user.id);

        if (storeError) {
          console.error('Error loading store:', storeError);
        }
        if (storeData) setStore(storeData);

        const { data: ordersData, error: ordersError } = await apiClient.get<OrderWithItems[]>(
          `/orders?store_id=${storeId}&include=order_items&order_by=created_at&order_dir=desc`
        );

        if (ordersError) {
          console.error('Error loading orders:', ordersError);
        }
        setOrders(ordersData || []);
      } catch (error) {
        console.error('Error loading orders:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, storeId, navigate]);

  useEffect(() => {
    let filtered = orders;

    if (statusFilter !== 'all') {
      filtered = filtered.filter((o) => o.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (o) =>
          o.shipping_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          o.shipping_phone.includes(searchTerm)
      );
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-orange-100 text-orange-700',
      confirmed: 'bg-blue-100 text-blue-700',
      processing: 'bg-purple-100 text-purple-700',
      shipped: 'bg-cyan-100 text-cyan-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
      refunded: 'bg-gray-100 text-gray-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle size={16} />;
      case 'pending':
        return <Clock size={16} />;
      case 'shipped':
        return <Truck size={16} />;
      default:
        return <AlertCircle size={16} />;
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await ordersService.update(orderId, {
        status: newStatus,
      });

      if (error) throw new Error(error.message);

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );

      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  const formatDate = (date: string) => new Date(date).toLocaleDateString('fr-FR');

  return (
    <BusinessLayout store={store} loading={loading}>
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900">Commandes</h1>
          <p className="text-gray-500 mt-1">Gérez les commandes de votre boutique</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom ou téléphone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-kclick-orange"
              />
            </div>

            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-kclick-orange bg-white"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="confirmed">Confirmée</option>
                <option value="processing">En traitement</option>
                <option value="shipped">Expédiée</option>
                <option value="delivered">Livrée</option>
                <option value="cancelled">Annulée</option>
              </select>

              <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Download size={18} />
                <span className="hidden sm:inline">Exporter</span>
              </button>
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">Aucune commande trouvée</p>
              <p className="text-sm text-gray-400">Les commandes apparaîtront ici quand des clients placeront des commandes</p>
            </div>
          ) : (() => {
            const ITEMS_PER_PAGE = 20;
            const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
            const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
            const paginatedOrders = filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

            return (
            <>
            <div className="space-y-4">
              {paginatedOrders.map((order) => (
                <div
                  key={order.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900 truncate">{order.shipping_name}</h3>
                        <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">{order.shipping_phone}</p>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Montant</p>
                          <p className="font-bold text-gray-900">{formatCurrency(order.total)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Produits</p>
                          <p className="font-bold text-gray-900">{order.order_items.length}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Date</p>
                          <p className="font-bold text-gray-900">{formatDate(order.created_at)}</p>
                        </div>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-gray-400 shrink-0 mt-1" />
                  </div>
                </div>
              ))}
            </div>
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredOrders.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
              />
            )}
            </>
            );
          })()}
        </div>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl my-8">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Commande #{selectedOrder.id.slice(0, 8)}</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Informations de livraison</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p className="font-medium text-gray-900">{selectedOrder.shipping_name}</p>
                  <p className="text-gray-600">{selectedOrder.shipping_phone}</p>
                  <p className="text-gray-600">{selectedOrder.shipping_address}</p>
                  <p className="text-gray-600">{selectedOrder.shipping_city}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Produits</h3>
                <div className="space-y-3">
                  {selectedOrder.order_items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.product_name}</p>
                        <p className="text-sm text-gray-500">Qté: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-gray-900">{formatCurrency(item.unit_price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(selectedOrder.total)}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Statut</label>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-kclick-orange bg-white"
                  >
                    <option value="pending">En attente</option>
                    <option value="confirmed">Confirmée</option>
                    <option value="processing">En traitement</option>
                    <option value="shipped">Expédiée</option>
                    <option value="delivered">Livrée</option>
                    <option value="cancelled">Annulée</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-3 border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors flex-1"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </BusinessLayout>
  );
}
