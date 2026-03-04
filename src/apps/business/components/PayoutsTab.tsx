import { useState, useEffect } from 'react';
import { DollarSign, Download, Clock, CheckCircle, Wallet } from 'lucide-react';
import type { Order, StorePayout } from '../../../types';
import * as businessService from '../services/businessService';

interface PayoutsTabProps {
  storeId: string;
  orders: Order[];
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  completed: 'bg-emerald-100 text-emerald-700',
  failed: 'bg-red-100 text-red-700',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  processing: 'En cours',
  completed: 'Termine',
  failed: 'Echoue',
};

function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export default function PayoutsTab({ storeId, orders }: PayoutsTabProps) {
  const [payouts, setPayouts] = useState<StorePayout[]>([]);
  const [loadingPayouts, setLoadingPayouts] = useState(true);

  const validOrders = orders.filter(
    (o) => o.status !== 'cancelled' && o.status !== 'refunded'
  );

  const totalSales = validOrders.reduce(
    (sum, o) => sum + Number(o.total || 0),
    0
  );

  const commission = totalSales * 0.1;

  const pendingPayouts = payouts
    .filter((p) => p.status === 'pending' || p.status === 'processing')
    .reduce((sum, p) => sum + Number(p.net_amount || 0), 0);

  const completedPayouts = payouts
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + Number(p.net_amount || 0), 0);

  const availableBalance = totalSales - commission - completedPayouts;

  useEffect(() => {
    async function fetchPayouts() {
      try {
        const data = await businessService.getStorePayouts(storeId);
        setPayouts(data);
      } catch {
        setPayouts([]);
      } finally {
        setLoadingPayouts(false);
      }
    }
    fetchPayouts();
  }, [storeId]);

  const handleDownloadCSV = () => {
    const header = 'Date,ID Commande,Total,Commission (10%),Net\n';
    const rows = validOrders.map((o) => {
      const date = new Date(o.created_at).toLocaleDateString('fr-FR');
      const total = Number(o.total || 0);
      const comm = total * 0.1;
      const net = total - comm;
      return `${date},${o.id},${total.toFixed(2)},${comm.toFixed(2)},${net.toFixed(2)}`;
    });

    const csv = header + rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `paiements-${storeId}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Paiements et revenus</h2>
        <button
          onClick={handleDownloadCSV}
          disabled={validOrders.length === 0}
          className="flex items-center gap-2 bg-kclick-orange hover:bg-kclick-orange-dark disabled:bg-gray-300 text-white font-medium px-4 py-2.5 rounded-xl transition-colors"
        >
          <Download size={16} />
          Exporter CSV
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-all duration-300">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Ventes totales</p>
              <p className="text-2xl font-black text-gray-900 mt-1">
                {formatCurrency(totalSales)}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50">
              <DollarSign size={20} className="text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-all duration-300">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Commission plateforme (10%)</p>
              <p className="text-2xl font-black text-gray-900 mt-1">
                {formatCurrency(commission)}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-orange-50">
              <Wallet size={20} className="text-kclick-orange" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-all duration-300">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Paiements en attente</p>
              <p className="text-2xl font-black text-gray-900 mt-1">
                {formatCurrency(pendingPayouts)}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50">
              <Clock size={20} className="text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-all duration-300">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Paiements completes</p>
              <p className="text-2xl font-black text-gray-900 mt-1">
                {formatCurrency(completedPayouts)}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50">
              <CheckCircle size={20} className="text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-white/10">
            <Wallet size={24} className="text-kclick-orange" />
          </div>
          <div>
            <p className="text-sm text-gray-400 font-medium">Solde disponible</p>
            <p className="text-3xl font-black">{formatCurrency(availableBalance)}</p>
          </div>
        </div>
        <div className="flex items-center gap-6 text-sm text-gray-400">
          <span>Ventes: {formatCurrency(totalSales)}</span>
          <span>-</span>
          <span>Commission: {formatCurrency(commission)}</span>
          <span>-</span>
          <span>Deja verse: {formatCurrency(completedPayouts)}</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Historique des paiements</h3>
        </div>
        {loadingPayouts ? (
          <div className="p-12 text-center">
            <div className="w-10 h-10 border-4 border-kclick-orange/30 border-t-kclick-orange rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Chargement...</p>
          </div>
        ) : payouts.length === 0 ? (
          <div className="p-12 text-center">
            <DollarSign size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Aucun paiement enregistre</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                    Periode
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                    Ventes brutes
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                    Commission
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                    Montant net
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                    Statut
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                    Date de paiement
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payouts.map((payout) => (
                  <tr key={payout.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(payout.period_start).toLocaleDateString('fr-FR')} -{' '}
                      {new Date(payout.period_end).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                      {formatCurrency(Number(payout.gross_sales))}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatCurrency(Number(payout.commission_amount))}
                      <span className="text-xs text-gray-400 ml-1">
                        ({(Number(payout.commission_rate) * 100).toFixed(0)}%)
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-kclick-orange">
                      {formatCurrency(Number(payout.net_amount))}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[payout.status] || 'bg-gray-100 text-gray-600'}`}
                      >
                        {STATUS_LABELS[payout.status] || payout.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {payout.paid_at
                        ? new Date(payout.paid_at).toLocaleDateString('fr-FR')
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
        <h4 className="font-bold text-blue-900 mb-2">Comment fonctionnent les paiements ?</h4>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <CheckCircle size={16} className="text-blue-600 mt-0.5 shrink-0" />
            Les ventes sont calculees a partir de toutes les commandes non annulees et non remboursees.
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle size={16} className="text-blue-600 mt-0.5 shrink-0" />
            Une commission de 10% est prelevee sur chaque vente pour couvrir les frais de la plateforme.
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle size={16} className="text-blue-600 mt-0.5 shrink-0" />
            Les paiements sont traites automatiquement selon un cycle regulier.
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle size={16} className="text-blue-600 mt-0.5 shrink-0" />
            Vous pouvez telecharger un rapport CSV de vos transactions a tout moment.
          </li>
        </ul>
      </div>
    </div>
  );
}
