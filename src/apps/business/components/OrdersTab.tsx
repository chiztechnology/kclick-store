import { useState } from 'react';
import {
  Clock,
  CheckCircle,
  Package,
  Truck,
  MapPin,
  Phone,
  Printer,
  X,
  ChevronDown,
  ChevronUp,
  Filter,
  MessageCircle,
} from 'lucide-react';
import { Order } from '../../../types';
import OrderChatDrawer from './chat/OrderChatDrawer';

interface OrdersTabProps {
  orders: Order[];
  onStatusChange: (orderId: string, newStatus: string) => Promise<void>;
  onTrackingUpdate: (orderId: string, tracking: string) => Promise<void>;
  showNotification: (message: string, type?: 'success' | 'error') => void;
  storeName?: string;
}

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

const FILTER_STATUSES = [
  'all',
  'pending',
  'confirmed',
  'processing',
  'packed',
  'shipped',
  'delivered',
] as const;

const FILTER_LABELS: Record<string, string> = {
  all: 'Tous',
  pending: 'En attente',
  confirmed: 'Confirme',
  processing: 'Preparation',
  packed: 'Emballe',
  shipped: 'Expedie',
  delivered: 'Livre',
};

export default function OrdersTab({
  orders,
  onStatusChange,
  onTrackingUpdate,
  showNotification,
  storeName,
}: OrdersTabProps) {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [trackingModal, setTrackingModal] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [chatOrder, setChatOrder] = useState<Order | null>(null);

  const filteredOrders =
    activeFilter === 'all'
      ? orders
      : orders.filter((order) => order.status === activeFilter);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setLoadingAction(orderId);
    try {
      await onStatusChange(orderId, newStatus);
      showNotification(
        `Commande mise a jour: ${STATUS_LABELS[newStatus] || newStatus}`,
        'success'
      );
    } catch {
      showNotification('Erreur lors de la mise a jour de la commande', 'error');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleShipOrder = async (orderId: string) => {
    if (!trackingNumber.trim()) {
      showNotification('Veuillez entrer un numero de suivi', 'error');
      return;
    }
    setLoadingAction(orderId);
    try {
      await onTrackingUpdate(orderId, trackingNumber.trim());
      await onStatusChange(orderId, 'shipped');
      showNotification('Commande expediee avec succes', 'success');
      setTrackingModal(null);
      setTrackingNumber('');
    } catch {
      showNotification("Erreur lors de l'expedition", 'error');
    } finally {
      setLoadingAction(null);
    }
  };

  const printInvoice = (order: Order) => {
    const itemsHtml = (order.items || [])
      .map(
        (item) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.product_name || 'Article'}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity || 1}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${(item.total_price || (item.unit_price || 0) * (item.quantity || 1)).toLocaleString()} FCFA</td>
        </tr>`
      )
      .join('');

    const html = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <title>Facture - ${order.id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
          .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; border-bottom: 3px solid #f97316; padding-bottom: 20px; }
          .title { font-size: 28px; font-weight: bold; color: #f97316; }
          .info { margin-bottom: 30px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
          .info-block { background: #f9fafb; padding: 15px; border-radius: 8px; }
          .info-block h3 { margin: 0 0 8px 0; font-size: 14px; color: #6b7280; text-transform: uppercase; }
          .info-block p { margin: 4px 0; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th { background: #f97316; color: white; padding: 10px 8px; text-align: left; }
          th:last-child { text-align: right; }
          th:nth-child(2) { text-align: center; }
          .total-row { font-weight: bold; font-size: 18px; text-align: right; padding: 15px 0; border-top: 2px solid #f97316; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #9ca3af; }
          .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">FACTURE</div>
          <div>
            <p style="margin: 0; font-size: 14px; color: #6b7280;">Commande #${order.id?.slice(-8) || ''}</p>
            <p style="margin: 4px 0 0 0; font-size: 14px; color: #6b7280;">${order.created_at ? new Date(order.created_at).toLocaleDateString('fr-FR') : ''}</p>
          </div>
        </div>
        <div class="info-grid">
          <div class="info-block">
            <h3>Client</h3>
            <p><strong>${order.shipping_name || ''}</strong></p>
            <p>${order.shipping_phone || ''}</p>
            <p>${order.shipping_city || ''}</p>
          </div>
          <div class="info-block">
            <h3>Statut</h3>
            <p>${STATUS_LABELS[order.status] || order.status}</p>
            ${order.trackingNumber ? `<p>Suivi: ${order.trackingNumber}</p>` : ''}
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Article</th>
              <th>Quantite</th>
              <th>Montant</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        <div class="total-row">
          Total: ${(order.total || 0).toLocaleString()} FCFA
        </div>
        <div class="footer">
          <p>Merci pour votre commande</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  const getCustomerInitial = (name: string | undefined) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderActionButtons = (order: Order) => {
    const isLoading = loadingAction === order.id;
    const baseClass =
      'px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50';

    switch (order.status) {
      case 'pending':
        return (
          <div className="flex gap-2">
            <button
              className={`${baseClass} bg-kclick-orange text-white hover:bg-orange-600`}
              disabled={isLoading}
              onClick={() => handleStatusChange(order.id, 'confirmed')}
            >
              <CheckCircle className="inline w-4 h-4 mr-1" />
              Confirmer
            </button>
            <button
              className={`${baseClass} bg-red-100 text-red-700 hover:bg-red-200`}
              disabled={isLoading}
              onClick={() => handleStatusChange(order.id, 'cancelled')}
            >
              <X className="inline w-4 h-4 mr-1" />
              Annuler
            </button>
          </div>
        );
      case 'confirmed':
        return (
          <button
            className={`${baseClass} bg-kclick-orange text-white hover:bg-orange-600`}
            disabled={isLoading}
            onClick={() => handleStatusChange(order.id, 'processing')}
          >
            <Clock className="inline w-4 h-4 mr-1" />
            Preparer
          </button>
        );
      case 'processing':
        return (
          <button
            className={`${baseClass} bg-kclick-orange text-white hover:bg-orange-600`}
            disabled={isLoading}
            onClick={() => handleStatusChange(order.id, 'packed')}
          >
            <Package className="inline w-4 h-4 mr-1" />
            Emballer
          </button>
        );
      case 'packed':
        return (
          <button
            className={`${baseClass} bg-kclick-orange text-white hover:bg-orange-600`}
            disabled={isLoading}
            onClick={() => {
              setTrackingModal(order.id);
              setTrackingNumber('');
            }}
          >
            <Truck className="inline w-4 h-4 mr-1" />
            Expedier
          </button>
        );
      case 'shipped':
        return (
          <button
            className={`${baseClass} bg-emerald-500 text-white hover:bg-emerald-600`}
            disabled={isLoading}
            onClick={() => handleStatusChange(order.id, 'delivered')}
          >
            <CheckCircle className="inline w-4 h-4 mr-1" />
            Livre
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
        {FILTER_STATUSES.map((status) => (
          <button
            key={status}
            onClick={() => setActiveFilter(status)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              activeFilter === status
                ? 'bg-kclick-orange text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {FILTER_LABELS[status]}
            {status !== 'all' && (
              <span className="ml-1.5 text-xs opacity-75">
                ({orders.filter((o) => o.status === status).length})
              </span>
            )}
            {status === 'all' && (
              <span className="ml-1.5 text-xs opacity-75">
                ({orders.length})
              </span>
            )}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-lg font-medium">Aucune commande</p>
          <p className="text-sm">
            Aucune commande trouvee pour ce filtre
          </p>
        </div>
      )}

      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-kclick-orange text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                    {getCustomerInitial(order.shipping_name)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {order.shipping_name || 'Client'}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-0.5">
                      {order.shipping_city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {order.shipping_city}
                        </span>
                      )}
                      {order.shipping_phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" />
                          {order.shipping_phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700'}`}
                  >
                    {STATUS_LABELS[order.status] || order.status}
                  </span>
                  <button
                    onClick={() => setChatOrder(order)}
                    className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="Contacter le client"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => printInvoice(order)}
                    className="p-2 text-gray-400 hover:text-kclick-orange hover:bg-orange-50 rounded-lg transition-colors"
                    title="Imprimer la facture"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-4">
                  <span className="text-lg font-bold text-gray-900">
                    {(order.total || 0).toLocaleString()} FCFA
                  </span>
                  <span className="text-sm text-gray-400">
                    {formatDate(order.created_at)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {renderActionButtons(order)}
                  <button
                    onClick={() =>
                      setExpandedOrder(
                        expandedOrder === order.id ? null : order.id
                      )
                    }
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {expandedOrder === order.id ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {order.trackingNumber && order.status === 'shipped' && (
                <div className="mt-3 px-3 py-2 bg-teal-50 rounded-xl text-sm text-teal-700">
                  <Truck className="inline w-4 h-4 mr-1" />
                  Suivi: {order.trackingNumber}
                </div>
              )}
            </div>

            {expandedOrder === order.id && order.items && (
              <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">
                <p className="text-sm font-medium text-gray-500 mb-3">
                  Articles commandes
                </p>
                <div className="space-y-2">
                  {order.items.map(
                    (item, index) => (
                      <div
                        key={item.id || index}
                        className="flex items-center justify-between bg-white rounded-xl px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          {item.product_image && (
                            <img
                              src={item.product_image}
                              alt={item.product_name || 'Article'}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {item.product_name || 'Article'}
                            </p>
                            <p className="text-xs text-gray-500">
                              Qte: {item.quantity || 1}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          {(item.total_price || (item.unit_price || 0) * (item.quantity || 1)).toLocaleString()}{' '}
                          FCFA
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {chatOrder && (
        <OrderChatDrawer
          order={chatOrder}
          onClose={() => setChatOrder(null)}
          senderRole="store"
          senderName={storeName || 'Vendeur'}
        />
      )}

      {trackingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Numero de suivi
              </h3>
              <button
                onClick={() => {
                  setTrackingModal(null);
                  setTrackingNumber('');
                }}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Entrez le numero de suivi pour cette expedition
            </p>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Ex: TN123456789"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-kclick-orange focus:border-transparent mb-4"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleShipOrder(trackingModal);
                }
              }}
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setTrackingModal(null);
                  setTrackingNumber('');
                }}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => handleShipOrder(trackingModal)}
                disabled={loadingAction === trackingModal}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-kclick-orange text-white hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                {loadingAction === trackingModal
                  ? 'Expedition...'
                  : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
