import { useState, useEffect } from 'react';
import { Eye, TrendingUp, DollarSign, Users, BarChart3, ShoppingBag } from 'lucide-react';
import type { Product, Order } from '../../../types';
import * as businessService from '../services/businessService';

interface AnalyticsTabProps {
  storeId: string;
  products: Product[];
  orders: Order[];
}

interface ProductViewData {
  product_id: string;
  count: number;
}

export default function AnalyticsTab({ storeId, products, orders }: AnalyticsTabProps) {
  const [productViewsCount, setProductViewsCount] = useState(0);
  const [dailySales, setDailySales] = useState<{ total: number; created_at: string }[]>([]);
  const [repeatCustomers, setRepeatCustomers] = useState(0);
  const [productViews, setProductViews] = useState<ProductViewData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const [views, sales, repeats] = await Promise.all([
          businessService.getProductViewsCount(storeId),
          businessService.getDailySales(storeId),
          businessService.getRepeatCustomers(storeId),
        ]);
        setProductViewsCount(views);
        setDailySales(sales);
        setRepeatCustomers(repeats);

        const viewsByProduct: Record<string, number> = {};
        products.forEach((p) => {
          viewsByProduct[p.id] = 0;
        });
        setProductViews(
          products.map((p) => ({
            product_id: p.id,
            count: viewsByProduct[p.id] || 0,
          }))
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, [storeId, products]);

  const validOrders = orders.filter(
    (o) => o.status !== 'cancelled' && o.status !== 'refunded'
  );

  const conversionRate =
    productViewsCount > 0
      ? ((validOrders.length / productViewsCount) * 100).toFixed(1)
      : '0';

  const averageCart =
    validOrders.length > 0
      ? (
          validOrders.reduce((sum, o) => sum + Number(o.total || 0), 0) /
          validOrders.length
        ).toFixed(0)
      : '0';

  const uniqueCustomers = new Set(validOrders.map((o) => o.user_id)).size;

  const dailySalesAggregated = dailySales.reduce<Record<string, number>>(
    (acc, sale) => {
      const date = new Date(sale.created_at).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + Number(sale.total || 0);
      return acc;
    },
    {}
  );

  const last10Days: { date: string; total: number }[] = [];
  for (let i = 9; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    last10Days.push({ date: key, total: dailySalesAggregated[key] || 0 });
  }
  const maxDailySale = Math.max(...last10Days.map((d) => d.total), 1);

  const topProducts = [...products]
    .sort((a, b) => (b.sold_count || 0) - (a.sold_count || 0))
    .slice(0, 10);
  const maxSold = Math.max(...topProducts.map((p) => p.sold_count || 0), 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-kclick-orange/30 border-t-kclick-orange rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-all duration-300">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Vues produits (30j)</p>
              <p className="text-2xl font-black text-gray-900 mt-1">
                {productViewsCount.toLocaleString('fr-FR')}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50">
              <Eye size={20} className="text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-all duration-300">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Taux de conversion</p>
              <p className="text-2xl font-black text-gray-900 mt-1">{conversionRate}%</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50">
              <TrendingUp size={20} className="text-emerald-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-all duration-300">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Panier moyen</p>
              <p className="text-2xl font-black text-gray-900 mt-1">${averageCart}</p>
            </div>
            <div className="p-3 rounded-xl bg-orange-50">
              <DollarSign size={20} className="text-kclick-orange" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-all duration-300">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Clients fideles</p>
              <p className="text-2xl font-black text-gray-900 mt-1">{repeatCustomers}</p>
            </div>
            <div className="p-3 rounded-xl bg-purple-50">
              <Users size={20} className="text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 size={20} className="text-kclick-orange" />
          <h3 className="font-bold text-gray-900">Vues vs Achats</h3>
        </div>
        {products.length === 0 ? (
          <p className="text-center text-gray-400 py-8">Aucun produit a analyser</p>
        ) : (
          <div className="space-y-4">
            {products.slice(0, 8).map((product) => {
              const viewData = productViews.find(
                (pv) => pv.product_id === product.id
              );
              const views = viewData?.count || 0;
              const sold = product.sold_count || 0;
              const maxVal = Math.max(views, sold, 1);
              return (
                <div key={product.id} className="space-y-1.5">
                  <p className="text-sm font-medium text-gray-700 truncate max-w-xs">
                    {product.name}
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-12 shrink-0">Vues</span>
                    <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-400 rounded-full transition-all duration-500"
                        style={{
                          width: `${(views / maxVal) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-600 w-10 text-right">
                      {views}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-12 shrink-0">Achats</span>
                    <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-kclick-orange rounded-full transition-all duration-500"
                        style={{
                          width: `${(sold / maxVal) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-600 w-10 text-right">
                      {sold}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-6">
          <ShoppingBag size={20} className="text-kclick-orange" />
          <h3 className="font-bold text-gray-900">Ventes quotidiennes (10 derniers jours)</h3>
        </div>
        <div className="flex items-end gap-2 h-48">
          {last10Days.map((day) => (
            <div
              key={day.date}
              className="flex-1 flex flex-col items-center justify-end h-full"
            >
              <span className="text-xs font-semibold text-gray-700 mb-1">
                ${day.total.toFixed(0)}
              </span>
              <div
                className="w-full bg-gradient-to-t from-kclick-orange to-kclick-orange/60 rounded-t-lg transition-all duration-500"
                style={{
                  height: `${(day.total / maxDailySale) * 100}%`,
                  minHeight: day.total > 0 ? '8px' : '2px',
                }}
              />
              <span className="text-[10px] text-gray-500 mt-2">
                {new Date(day.date + 'T00:00:00').toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: '2-digit',
                })}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp size={20} className="text-kclick-orange" />
          <h3 className="font-bold text-gray-900">Top Produits</h3>
        </div>
        {topProducts.length === 0 ? (
          <p className="text-center text-gray-400 py-8">Aucun produit</p>
        ) : (
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={product.id} className="flex items-center gap-4">
                <span className="text-sm font-bold text-gray-400 w-6 text-right shrink-0">
                  {index + 1}
                </span>
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt=""
                    className="w-10 h-10 rounded-lg object-cover shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                    <ShoppingBag size={16} className="text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {product.name}
                    </p>
                    <span className="text-sm font-bold text-gray-900 ml-2 shrink-0">
                      {product.sold_count || 0} vendus
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-kclick-orange to-emerald-400 rounded-full transition-all duration-500"
                      style={{
                        width: `${((product.sold_count || 0) / maxSold) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Users size={20} className="text-kclick-orange" />
          <h3 className="font-bold text-gray-900">Fidelite clients</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center p-6 bg-blue-50 rounded-2xl">
            <p className="text-4xl font-black text-blue-600">{uniqueCustomers}</p>
            <p className="text-sm text-blue-700 font-medium mt-2">Clients uniques</p>
          </div>
          <div className="text-center p-6 bg-emerald-50 rounded-2xl">
            <p className="text-4xl font-black text-emerald-600">{repeatCustomers}</p>
            <p className="text-sm text-emerald-700 font-medium mt-2">Clients fideles</p>
            {uniqueCustomers > 0 && (
              <p className="text-xs text-emerald-600 mt-1">
                {((repeatCustomers / uniqueCustomers) * 100).toFixed(1)}% de taux de fidelite
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
