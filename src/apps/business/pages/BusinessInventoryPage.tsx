import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Package, Search, Filter, Plus, AlertTriangle, TrendingUp,
  Edit2, X, Check, AlertCircle, ArrowUp, ArrowDown
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { storesService, productsService, stockMovementsService } from '../../../lib/api';
import type { StoreProduct, StockMovement } from '../../../lib/api';
import BusinessLayout from '../components/BusinessLayout';
import type { Store } from '../../../types';
import Pagination from '../../../components/Pagination';

export default function BusinessInventoryPage() {
  const navigate = useNavigate();
  const { storeId } = useParams<{ storeId: string }>();
  const { user } = useAuth();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<StoreProduct[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [editingProduct, setEditingProduct] = useState<StoreProduct | null>(null);
  const [stockAction, setStockAction] = useState<{ type: 'add' | 'remove'; quantity: number }>({ type: 'add', quantity: 0 });
  const [productsPage, setProductsPage] = useState(1);
  const [movementsPage, setMovementsPage] = useState(1);

  useEffect(() => {
    if (!user || !storeId) {
      navigate('/business');
      return;
    }

    const loadData = async () => {
      try {
        const { data: storeData, error: storeError } = await storesService.getByIdAndOwner(storeId, user.id);

        if (storeError) {
          console.error('Error loading store:', storeError.message);
        } else if (storeData) {
          setStore(storeData);
        }

        const { data: productsData, error: productsError } = await productsService.getByStore(storeId);

        if (productsError) {
          console.error('Error loading products:', productsError.message);
        } else {
          setProducts(productsData || []);
        }

        const { data: movementsData, error: movementsError } = await stockMovementsService.getByStore(storeId, 10);

        if (movementsError) {
          console.error('Error loading stock movements:', movementsError.message);
        } else {
          setStockMovements(movementsData || []);
        }
      } catch (error) {
        console.error('Error loading inventory:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, storeId, navigate]);

  useEffect(() => {
    let filtered = products;

    if (filterLowStock) {
      filtered = filtered.filter((p) => (p.stock || 0) < (p.low_stock_threshold || 10));
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, filterLowStock]);

  const handleUpdateStock = async () => {
    if (!editingProduct || !user || !storeId) return;

    const newStock = stockAction.type === 'add'
      ? editingProduct.stock + stockAction.quantity
      : editingProduct.stock - stockAction.quantity;

    if (newStock < 0) {
      alert('Stock insuffisant');
      return;
    }

    try {
      const { error: updateError } = await productsService.updateStock(editingProduct.id, newStock);

      if (updateError) throw new Error(updateError.message);

      const { error: movementError } = await stockMovementsService.create({
        store_product_id: editingProduct.id,
        product_id: editingProduct.product_id,
        store_id: storeId,
        movement_type: stockAction.type === 'add' ? 'in' : 'out',
        quantity: stockAction.quantity,
        previous_stock: editingProduct.stock,
        new_stock: newStock,
        created_by: user.id,
        notes: stockAction.type === 'add' ? 'Stock reçu' : 'Stock retiré',
      });

      if (movementError) throw new Error(movementError.message);

      setProducts((prev) =>
        prev.map((p) => (p.id === editingProduct.id ? { ...p, stock: newStock } : p))
      );

      setEditingProduct(null);
      setStockAction({ type: 'add', quantity: 0 });
    } catch (error) {
      console.error('Error updating stock:', error);
    }
  };

  const lowStockCount = products.filter((p) => (p.stock || 0) < (p.low_stock_threshold || 10)).length;
  const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
  const activeProducts = products.filter((p) => p.is_active).length;

  return (
    <BusinessLayout store={store} loading={loading}>
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900">Inventaire</h1>
          <p className="text-gray-500 mt-1">Gérez le stock de votre boutique</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <p className="text-gray-600 text-sm mb-1">Stock total</p>
            <p className="text-2xl font-bold text-gray-900">{totalStock}</p>
            <p className="text-xs text-gray-500 mt-2">{activeProducts} produits actifs</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <p className="text-gray-600 text-sm mb-1 flex items-center gap-2">
              <AlertTriangle size={16} className="text-orange-600" />
              Stock faible
            </p>
            <p className="text-2xl font-bold text-orange-600">{lowStockCount}</p>
            <p className="text-xs text-gray-500 mt-2">Besoin de réapprovisionnement</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <p className="text-gray-600 text-sm mb-1">Produits</p>
            <p className="text-2xl font-bold text-gray-900">{products.length}</p>
            <p className="text-xs text-gray-500 mt-2">Au total</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-kclick-orange"
              />
            </div>

            <button
              onClick={() => setFilterLowStock(!filterLowStock)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                filterLowStock
                  ? 'bg-orange-100 text-orange-700'
                  : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <AlertTriangle size={18} />
              Stock faible
            </button>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">Aucun produit trouvé</p>
              <p className="text-sm text-gray-400">Commencez à ajouter des produits à votre boutique</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">SKU</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Stock</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Réservé</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Disponible</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Seuil</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Statut</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const ITEMS_PER_PAGE = 20;
                    const startIndex = (productsPage - 1) * ITEMS_PER_PAGE;
                    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
                    return paginatedProducts.map((product) => {
                    const available = (product.stock || 0) - (product.reserved_stock || 0);
                    const isLowStock = (product.stock || 0) < (product.low_stock_threshold || 10);

                    return (
                      <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-900">{product.sku}</p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-gray-900">{product.stock}</p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-gray-600">{product.reserved_stock || 0}</p>
                        </td>
                        <td className="py-3 px-4">
                          <p className={`font-medium ${available > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {available}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-gray-600">{product.low_stock_threshold || 10}</p>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            isLowStock
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {isLowStock ? 'Faible' : 'Bon'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => setEditingProduct(product)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-kclick-orange hover:bg-orange-50 rounded-lg transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  });
                  })()}
                </tbody>
              </table>
            </div>
          )}
          {filteredProducts.length > 20 && (
            <Pagination
              currentPage={productsPage}
              totalPages={Math.ceil(filteredProducts.length / 20)}
              totalItems={filteredProducts.length}
              itemsPerPage={20}
              onPageChange={setProductsPage}
            />
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-bold text-lg text-gray-900 mb-6">Mouvements récents</h3>
          {stockMovements.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Aucun mouvement de stock</p>
          ) : (() => {
            const ITEMS_PER_PAGE = 10;
            const startIndex = (movementsPage - 1) * ITEMS_PER_PAGE;
            const paginatedMovements = stockMovements.slice(startIndex, startIndex + ITEMS_PER_PAGE);
            return (
            <>
            <div className="space-y-3">
              {paginatedMovements.map((movement) => (
                <div key={movement.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      movement.movement_type === 'in' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {movement.movement_type === 'in' ? (
                        <ArrowUp className="text-green-600" size={20} />
                      ) : (
                        <ArrowDown className="text-red-600" size={20} />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{movement.notes}</p>
                      <p className="text-sm text-gray-500">
                        {movement.previous_stock} → {movement.new_stock}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${movement.movement_type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                      {movement.movement_type === 'in' ? '+' : '-'}{movement.quantity}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(movement.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {stockMovements.length > ITEMS_PER_PAGE && (
              <Pagination
                currentPage={movementsPage}
                totalPages={Math.ceil(stockMovements.length / ITEMS_PER_PAGE)}
                totalItems={stockMovements.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setMovementsPage}
              />
            )}
            </>
            );
          })()}
        </div>
      </div>

      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Mettre à jour le stock</h2>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <p className="text-sm text-gray-600 mb-2">Produit: <strong>{editingProduct.sku}</strong></p>
                <p className="text-sm text-gray-600">Stock actuel: <strong>{editingProduct.stock}</strong></p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Type d'action</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setStockAction({ ...stockAction, type: 'add' })}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      stockAction.type === 'add'
                        ? 'bg-green-100 text-green-700'
                        : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Ajouter
                  </button>
                  <button
                    onClick={() => setStockAction({ ...stockAction, type: 'remove' })}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      stockAction.type === 'remove'
                        ? 'bg-red-100 text-red-700'
                        : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Retirer
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Quantité</label>
                <input
                  type="number"
                  min="1"
                  value={stockAction.quantity}
                  onChange={(e) => setStockAction({ ...stockAction, quantity: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-kclick-orange"
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Nouveau stock:</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stockAction.type === 'add'
                    ? editingProduct.stock + stockAction.quantity
                    : editingProduct.stock - stockAction.quantity}
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setEditingProduct(null)}
                className="flex-1 px-6 py-3 border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleUpdateStock}
                className="flex-1 px-6 py-3 bg-kclick-orange hover:bg-kclick-orange-dark text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Check size={18} />
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </BusinessLayout>
  );
}
