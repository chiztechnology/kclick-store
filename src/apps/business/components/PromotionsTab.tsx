import { useState, useEffect } from 'react';
import { Tag, Ticket, Megaphone, Plus, Trash2, Percent } from 'lucide-react';
import type { Product, StorePromotion, Voucher, Campaign } from '../../../types';
import * as businessService from '../services/businessService';

interface PromotionsTabProps {
  storeId: string;
  products: Product[];
  showNotification: (message: string, type?: 'success' | 'error') => void;
}

type Section = 'promotions' | 'coupons' | 'campaigns';

export default function PromotionsTab({ storeId, products, showNotification }: PromotionsTabProps) {
  const [activeSection, setActiveSection] = useState<Section>('promotions');
  const [promotions, setPromotions] = useState<StorePromotion[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);

  const [promoForm, setPromoForm] = useState({
    name: '',
    product_id: '',
    discount_type: 'percent' as 'percent' | 'fixed',
    discount_value: 0,
    starts_at: '',
    ends_at: '',
  });

  const [voucherForm, setVoucherForm] = useState({
    code: '',
    name: '',
    discount_type: 'percent' as 'percent' | 'fixed',
    discount_value: 0,
    min_order_amount: 0,
    usage_limit: 0,
    expires_at: '',
  });

  useEffect(() => {
    loadData();
  }, [storeId]);

  async function loadData() {
    setLoading(true);
    try {
      const [promos, vouchs, camps] = await Promise.all([
        businessService.getStorePromotions(storeId),
        businessService.getStoreVouchers(storeId),
        businessService.getActiveCampaigns(),
      ]);
      setPromotions(promos);
      setVouchers(vouchs);
      setCampaigns(camps);
    } catch {
      showNotification('Erreur lors du chargement des promotions', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreatePromotion() {
    if (!promoForm.name || !promoForm.discount_value || !promoForm.starts_at) {
      showNotification('Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }
    try {
      await businessService.createStorePromotion({
        store_id: storeId,
        name: promoForm.name,
        product_id: promoForm.product_id || undefined,
        discount_type: promoForm.discount_type,
        discount_value: promoForm.discount_value,
        starts_at: promoForm.starts_at,
        ends_at: promoForm.ends_at || undefined,
        is_active: true,
      });
      showNotification('Remise créée avec succès', 'success');
      setShowPromoModal(false);
      setPromoForm({ name: '', product_id: '', discount_type: 'percent', discount_value: 0, starts_at: '', ends_at: '' });
      const updated = await businessService.getStorePromotions(storeId);
      setPromotions(updated);
    } catch {
      showNotification('Erreur lors de la création de la remise', 'error');
    }
  }

  async function handleDeletePromotion(id: string) {
    try {
      await businessService.deleteStorePromotion(id);
      showNotification('Remise supprimée', 'success');
      setPromotions((prev) => prev.filter((p) => p.id !== id));
    } catch {
      showNotification('Erreur lors de la suppression', 'error');
    }
  }

  async function handleCreateVoucher() {
    if (!voucherForm.code || !voucherForm.name || !voucherForm.discount_value) {
      showNotification('Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }
    try {
      await businessService.createStoreVoucher({
        store_id: storeId,
        created_by: storeId,
        code: voucherForm.code.toUpperCase(),
        name: voucherForm.name,
        discount_type: voucherForm.discount_type,
        discount_value: voucherForm.discount_value,
        min_order_amount: voucherForm.min_order_amount,
        usage_limit: voucherForm.usage_limit,
        expires_at: voucherForm.expires_at || undefined,
        is_active: true,
        used_count: 0,
      });
      showNotification('Coupon créé avec succès', 'success');
      setShowVoucherModal(false);
      setVoucherForm({ code: '', name: '', discount_type: 'percent', discount_value: 0, min_order_amount: 0, usage_limit: 0, expires_at: '' });
      const updated = await businessService.getStoreVouchers(storeId);
      setVouchers(updated);
    } catch {
      showNotification('Erreur lors de la création du coupon', 'error');
    }
  }

  async function handleDeleteVoucher(id: string) {
    try {
      await businessService.deleteStoreVoucher(id);
      showNotification('Coupon supprimé', 'success');
      setVouchers((prev) => prev.filter((v) => v.id !== id));
    } catch {
      showNotification('Erreur lors de la suppression', 'error');
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-kclick-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveSection('promotions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            activeSection === 'promotions'
              ? 'bg-kclick-orange text-white'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Tag size={18} />
          Remises
        </button>
        <button
          onClick={() => setActiveSection('coupons')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            activeSection === 'coupons'
              ? 'bg-kclick-orange text-white'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Ticket size={18} />
          Coupons
        </button>
        <button
          onClick={() => setActiveSection('campaigns')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            activeSection === 'campaigns'
              ? 'bg-kclick-orange text-white'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Megaphone size={18} />
          Campagnes
        </button>
      </div>

      {activeSection === 'promotions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Remises boutique</h3>
            <button
              onClick={() => setShowPromoModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-kclick-orange text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              <Plus size={18} />
              Nouvelle remise
            </button>
          </div>

          {promotions.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
              <Tag size={40} className="mx-auto mb-3 text-gray-300" />
              <p>Aucune remise pour le moment</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {promotions.map((promo) => (
                <div
                  key={promo.id}
                  className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Percent size={20} className="text-kclick-orange" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{promo.name}</p>
                      <p className="text-sm text-gray-500">
                        {promo.discount_type === 'percent'
                          ? `${promo.discount_value}%`
                          : `${promo.discount_value.toLocaleString('fr-FR')} FC`}
                        {' de réduction'}
                        {promo.product ? ` sur ${promo.product.name}` : ' sur tous les produits'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDate(promo.starts_at)}
                        {promo.ends_at ? ` - ${formatDate(promo.ends_at)}` : ' - Sans fin'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeletePromotion(promo.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeSection === 'coupons' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Coupons de réduction</h3>
            <button
              onClick={() => setShowVoucherModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-kclick-orange text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              <Plus size={18} />
              Nouveau coupon
            </button>
          </div>

          {vouchers.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
              <Ticket size={40} className="mx-auto mb-3 text-gray-300" />
              <p>Aucun coupon pour le moment</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {vouchers.map((voucher) => (
                <div
                  key={voucher.id}
                  className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Ticket size={20} className="text-purple-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">{voucher.name}</p>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-mono rounded">
                          {voucher.code}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {voucher.discount_type === 'percent'
                          ? `${voucher.discount_value}%`
                          : `${voucher.discount_value.toLocaleString('fr-FR')} FC`}
                        {' de réduction'}
                        {voucher.min_order_amount > 0 &&
                          ` | Min. ${voucher.min_order_amount.toLocaleString('fr-FR')} FC`}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Utilisé {voucher.used_count}/{voucher.usage_limit} fois
                        {voucher.expires_at && ` | Expire le ${formatDate(voucher.expires_at)}`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteVoucher(voucher.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeSection === 'campaigns' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900">Campagnes marketplace</h3>

          {campaigns.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
              <Megaphone size={40} className="mx-auto mb-3 text-gray-300" />
              <p>Aucune campagne active pour le moment</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="bg-white rounded-xl border border-gray-200 p-4"
                >
                  <div className="flex items-center gap-4">
                    {campaign.banner_url ? (
                      <img
                        src={campaign.banner_url}
                        alt={campaign.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Megaphone size={24} className="text-blue-600" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">{campaign.name}</p>
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                          Active
                        </span>
                      </div>
                      {campaign.description && (
                        <p className="text-sm text-gray-500 mt-1">{campaign.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                        <span>Type : {campaign.type}</span>
                        <span>Réduction : {campaign.discount_percent}%</span>
                        <span>Début : {formatDate(campaign.starts_at)}</span>
                        {campaign.ends_at && <span>Fin : {formatDate(campaign.ends_at)}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showPromoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Nouvelle remise</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la remise</label>
                <input
                  type="text"
                  value={promoForm.name}
                  onChange={(e) => setPromoForm({ ...promoForm, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-kclick-orange focus:border-transparent outline-none"
                  placeholder="Ex: Soldes d'été"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Produit cible</label>
                <select
                  value={promoForm.product_id}
                  onChange={(e) => setPromoForm({ ...promoForm, product_id: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-kclick-orange focus:border-transparent outline-none"
                >
                  <option value="">Tous les produits</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type de réduction</label>
                  <select
                    value={promoForm.discount_type}
                    onChange={(e) =>
                      setPromoForm({ ...promoForm, discount_type: e.target.value as 'percent' | 'fixed' })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-kclick-orange focus:border-transparent outline-none"
                  >
                    <option value="percent">Pourcentage (%)</option>
                    <option value="fixed">Montant fixe (FC)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valeur</label>
                  <input
                    type="number"
                    min={0}
                    value={promoForm.discount_value}
                    onChange={(e) => setPromoForm({ ...promoForm, discount_value: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-kclick-orange focus:border-transparent outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                  <input
                    type="date"
                    value={promoForm.starts_at}
                    onChange={(e) => setPromoForm({ ...promoForm, starts_at: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-kclick-orange focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
                  <input
                    type="date"
                    value={promoForm.ends_at}
                    onChange={(e) => setPromoForm({ ...promoForm, ends_at: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-kclick-orange focus:border-transparent outline-none"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowPromoModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleCreatePromotion}
                className="px-4 py-2 bg-kclick-orange text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
              >
                Créer la remise
              </button>
            </div>
          </div>
        </div>
      )}

      {showVoucherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Nouveau coupon</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                  <input
                    type="text"
                    value={voucherForm.code}
                    onChange={(e) => setVoucherForm({ ...voucherForm, code: e.target.value.toUpperCase() })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-kclick-orange focus:border-transparent outline-none font-mono"
                    placeholder="EX: PROMO2024"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input
                    type="text"
                    value={voucherForm.name}
                    onChange={(e) => setVoucherForm({ ...voucherForm, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-kclick-orange focus:border-transparent outline-none"
                    placeholder="Nom du coupon"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type de réduction</label>
                  <select
                    value={voucherForm.discount_type}
                    onChange={(e) =>
                      setVoucherForm({ ...voucherForm, discount_type: e.target.value as 'percent' | 'fixed' })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-kclick-orange focus:border-transparent outline-none"
                  >
                    <option value="percent">Pourcentage (%)</option>
                    <option value="fixed">Montant fixe (FC)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valeur</label>
                  <input
                    type="number"
                    min={0}
                    value={voucherForm.discount_value}
                    onChange={(e) => setVoucherForm({ ...voucherForm, discount_value: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-kclick-orange focus:border-transparent outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Commande minimum (FC)</label>
                  <input
                    type="number"
                    min={0}
                    value={voucherForm.min_order_amount}
                    onChange={(e) =>
                      setVoucherForm({ ...voucherForm, min_order_amount: Number(e.target.value) })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-kclick-orange focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Limite d'utilisation</label>
                  <input
                    type="number"
                    min={0}
                    value={voucherForm.usage_limit}
                    onChange={(e) => setVoucherForm({ ...voucherForm, usage_limit: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-kclick-orange focus:border-transparent outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date d'expiration</label>
                <input
                  type="date"
                  value={voucherForm.expires_at}
                  onChange={(e) => setVoucherForm({ ...voucherForm, expires_at: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-kclick-orange focus:border-transparent outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowVoucherModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateVoucher}
                className="px-4 py-2 bg-kclick-orange text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
              >
                Créer le coupon
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
