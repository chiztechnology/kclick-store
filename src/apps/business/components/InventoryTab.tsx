import { useState, useEffect } from 'react';
import { Package, AlertTriangle, Plus, ArrowUpRight, ArrowDownRight, Search, RotateCcw } from 'lucide-react';
import type { Product, StockMovement, StockMovementType } from '../../../types';
import * as businessService from '../services/businessService';

interface InventoryTabProps {
  products: Product[];
  storeId: string;
  userId: string;
  onRefresh: () => void;
  showNotification: (message: string, type?: 'success' | 'error') => void;
}

const MOVEMENT_TYPE_LABELS: Record<StockMovementType, string> = {
  in: 'Entree de stock',
  out: 'Sortie de stock',
  return: 'Retour',
  damaged: 'Endommage',
  expired: 'Expire',
  adjustment: 'Ajustement',
  transfer: 'Transfert',
};

const MOVEMENT_TYPE_OPTIONS: { value: StockMovementType; label: string }[] = [
  { value: 'in', label: 'Entree de stock' },
  { value: 'out', label: 'Sortie de stock' },
  { value: 'return', label: 'Retour' },
  { value: 'damaged', label: 'Endommage' },
  { value: 'expired', label: 'Expire' },
  { value: 'adjustment', label: 'Ajustement' },
];

function getStockStatus(stock: number, threshold: number): 'ok' | 'low' | 'out' {
  if (stock <= 0) return 'out';
  if (stock < threshold) return 'low';
  return 'ok';
}

function getStatusBadge(status: 'ok' | 'low' | 'out') {
  switch (status) {
    case 'ok':
      return { label: 'En stock', className: 'bg-emerald-100 text-emerald-700' };
    case 'low':
      return { label: 'Stock faible', className: 'bg-amber-100 text-amber-700' };
    case 'out':
      return { label: 'Rupture', className: 'bg-red-100 text-red-700' };
  }
}

function isStockIncrease(type: StockMovementType): boolean {
  return type === 'in' || type === 'return';
}

export default function InventoryTab({ products, storeId, userId, onRefresh, showNotification }: InventoryTabProps) {
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loadingMovements, setLoadingMovements] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [selectedProductId, setSelectedProductId] = useState('');
  const [movementType, setMovementType] = useState<StockMovementType>('in');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  const loadMovements = async () => {
    setLoadingMovements(true);
    try {
      const data = await businessService.getStockMovements(storeId);
      setMovements(data as StockMovement[]);
    } catch {
      showNotification('Erreur lors du chargement des mouvements', 'error');
    } finally {
      setLoadingMovements(false);
    }
  };

  useEffect(() => {
    loadMovements();
  }, [storeId]);

  const lowStockProducts = products.filter(
    (p) => p.stock < (p.low_stock_threshold ?? 10)
  );

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !searchTerm ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()));

    if (showLowStockOnly) {
      return matchesSearch && p.stock < (p.low_stock_threshold ?? 10);
    }
    return matchesSearch;
  });

  const openModal = () => {
    setSelectedProductId(products[0]?.id || '');
    setMovementType('in');
    setQuantity(1);
    setNotes('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedProductId('');
    setQuantity(1);
    setNotes('');
  };

  const handleSubmitAdjustment = async () => {
    if (!selectedProductId || quantity <= 0) {
      showNotification('Veuillez remplir tous les champs correctement', 'error');
      return;
    }

    const product = products.find((p) => p.id === selectedProductId);
    if (!product) return;

    const increase = isStockIncrease(movementType);
    const newStock = increase ? product.stock + quantity : product.stock - quantity;

    if (newStock < 0) {
      showNotification('Stock insuffisant pour cette operation', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await businessService.createStockMovement({
        product_id: selectedProductId,
        store_id: storeId,
        movement_type: movementType,
        quantity,
        previous_stock: product.stock,
        new_stock: newStock,
        notes: notes || undefined,
        created_by: userId,
      });

      await businessService.updateProductStock(selectedProductId, newStock);

      showNotification('Mouvement de stock enregistre');
      closeModal();
      onRefresh();
      loadMovements();
    } catch {
      showNotification('Erreur lors de la mise a jour du stock', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  return (
    <div className="space-y-6">
      {lowStockProducts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-center gap-4">
          <div className="p-2 bg-amber-100 rounded-xl">
            <AlertTriangle size={20} className="text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-amber-900">
              {lowStockProducts.length} produit{lowStockProducts.length > 1 ? 's' : ''} en stock faible
            </p>
            <p className="text-sm text-amber-700">
              Ces produits necessitent un reapprovisionnement
            </p>
          </div>
          <button
            onClick={() => setShowLowStockOnly(true)}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-medium transition-colors"
          >
            Voir
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom ou SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-kclick-orange"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              showLowStockOnly
                ? 'bg-amber-100 text-amber-700'
                : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <AlertTriangle size={16} />
            Stock faible
          </button>

          <button
            onClick={openModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-kclick-orange hover:bg-kclick-orange-dark text-white rounded-xl text-sm font-semibold transition-colors"
          >
            <Plus size={16} />
            Ajustement
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Niveaux de stock</h3>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-1">Aucun produit trouve</p>
            <p className="text-sm text-gray-400">
              {showLowStockOnly
                ? 'Aucun produit en stock faible'
                : 'Ajoutez des produits a votre boutique'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                    Produit
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                    SKU
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                    Stock
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                    Seuil
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product) => {
                  const threshold = product.low_stock_threshold ?? 10;
                  const status = getStockStatus(product.stock, threshold);
                  const badge = getStatusBadge(status);

                  return (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                              <Package size={16} className="text-gray-400" />
                            </div>
                          )}
                          <p className="font-medium text-gray-900 line-clamp-1 max-w-xs">
                            {product.name}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-600 font-mono">
                          {product.sku || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`font-semibold ${
                            status === 'ok'
                              ? 'text-emerald-600'
                              : status === 'low'
                              ? 'text-amber-600'
                              : 'text-red-600'
                          }`}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-600">{threshold}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Mouvements recents</h3>
          <button
            onClick={loadMovements}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RotateCcw size={16} />
          </button>
        </div>

        {loadingMovements ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-kclick-orange/30 border-t-kclick-orange rounded-full animate-spin" />
          </div>
        ) : movements.length === 0 ? (
          <div className="text-center py-12">
            <RotateCcw size={40} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucun mouvement de stock</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {movements.map((movement) => {
              const increase = isStockIncrease(movement.movement_type as StockMovementType);
              const product = products.find((p) => p.id === movement.product_id);

              return (
                <div
                  key={movement.id}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      increase ? 'bg-emerald-100' : 'bg-red-100'
                    }`}
                  >
                    {increase ? (
                      <ArrowUpRight size={18} className="text-emerald-600" />
                    ) : (
                      <ArrowDownRight size={18} className="text-red-600" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {product?.name || 'Produit inconnu'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {MOVEMENT_TYPE_LABELS[movement.movement_type as StockMovementType] || movement.movement_type}
                      {movement.notes ? ` - ${movement.notes}` : ''}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p
                      className={`font-semibold ${
                        increase ? 'text-emerald-600' : 'text-red-600'
                      }`}
                    >
                      {increase ? '+' : '-'}
                      {movement.quantity}
                    </p>
                    <p className="text-xs text-gray-500">
                      {movement.previous_stock} &rarr; {movement.new_stock}
                    </p>
                  </div>

                  <div className="text-right shrink-0 hidden sm:block">
                    <p className="text-xs text-gray-500">
                      {new Date(movement.created_at).toLocaleDateString('fr-FR')}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(movement.created_at).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Ajustement de stock</h2>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="sr-only">Fermer</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Produit
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-kclick-orange bg-white"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (stock: {p.stock})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Type de mouvement
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {MOVEMENT_TYPE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setMovementType(opt.value)}
                      className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                        movementType === opt.value
                          ? isStockIncrease(opt.value)
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-red-100 text-red-700'
                          : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quantite
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-kclick-orange"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Raison de l'ajustement..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-kclick-orange resize-none"
                />
              </div>

              {selectedProduct && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Stock actuel</span>
                    <span className="font-semibold text-gray-900">{selectedProduct.stock}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-gray-600">Nouveau stock</span>
                    <span
                      className={`font-bold text-lg ${
                        isStockIncrease(movementType) ? 'text-emerald-600' : 'text-red-600'
                      }`}
                    >
                      {isStockIncrease(movementType)
                        ? selectedProduct.stock + quantity
                        : Math.max(0, selectedProduct.stock - quantity)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={closeModal}
                disabled={submitting}
                className="flex-1 px-6 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmitAdjustment}
                disabled={submitting || !selectedProductId || quantity <= 0}
                className="flex-1 px-6 py-3 bg-kclick-orange hover:bg-kclick-orange-dark disabled:bg-gray-300 text-white font-semibold rounded-xl transition-colors"
              >
                {submitting ? 'Enregistrement...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
