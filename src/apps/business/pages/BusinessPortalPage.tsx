import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Store, Plus, ChevronRight, CheckCircle, Clock, X,
  LogOut, Home, AlertTriangle, Trash2, Mail, FileText,
  XCircle, ShieldAlert, RefreshCw
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { storesService, ordersService, productsService, apiClient } from '../../../lib/api';
import type { Store as StoreType, StoreStatus } from '../../../types';
import { isStoreManager } from '../../../lib/roleUtils';


const ECOMMERCE_URL = import.meta.env.VITE_ECOMMERCE_URL || 'http://localhost:3000';

interface StoreStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
}

interface StoreWithReview extends StoreType {
  review_message?: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode; bg: string }> = {
  pending:   { label: 'En attente', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: <Clock size={14} /> },
  approved:  { label: 'Approuvée', color: 'text-green-700', bg: 'bg-green-50 border-green-200', icon: <CheckCircle size={14} /> },
  rejected:  { label: 'Refusée', color: 'text-red-700', bg: 'bg-red-50 border-red-200', icon: <XCircle size={14} /> },
  suspended: { label: 'Suspendue', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200', icon: <ShieldAlert size={14} /> },
  blocked:   { label: 'Bloquée', color: 'text-red-700', bg: 'bg-red-50 border-red-200', icon: <XCircle size={14} /> },
};

function getStatusConfig(store: StoreWithReview) {
  if (store.status && STATUS_CONFIG[store.status]) return STATUS_CONFIG[store.status];
  if (store.is_verified) return STATUS_CONFIG.approved;
  return STATUS_CONFIG.pending;
}

export default function BusinessPortalPage() {
  const navigate = useNavigate();
  const { user, profile, signOut, canAccessStore } = useAuth();
  const [stores, setStores] = useState<StoreWithReview[]>([]);
  const [storeStats, setStoreStats] = useState<Record<string, StoreStats>>({});
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [reviewStore, setReviewStore] = useState<StoreWithReview | null>(null);

  const notify = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const loadStores = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await storesService.getByOwner(user.id);

      if (error) throw new Error(error.message);
      setStores(data || []);

      const stats: Record<string, StoreStats> = {};
      for (const store of data || []) {
        const [ordersRes, productsRes] = await Promise.all([
          ordersService.getByStore(store.id),
          apiClient.get<{ id: string }[]>(`/products?store_id=${store.id}`),
        ]);
        stats[store.id] = {
          totalRevenue: (ordersRes.data || []).reduce((sum, o) => sum + Number(o.total || 0), 0),
          totalOrders: ordersRes.data?.length || 0,
          totalProducts: productsRes.data?.length || 0,
        };
      }
      setStoreStats(stats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) { navigate('/welcome'); return; }
    if(user && !canAccessStore) {navigate('/confirm-account-conversion'); return;}
    loadStores();
  }, [user, canAccessStore, navigate, loadStores]);

  const isApproved = (store: StoreWithReview) =>
    store.is_verified || store.status === 'approved';

  const isUnderReview = (store: StoreWithReview) =>
    !store.is_verified && (!store.status || store.status === 'pending');

  const handleStoreClick = (store: StoreWithReview) => {
    if (isApproved(store)) {
      navigate(`/business/store/${store.id}`);
    } else {
      setReviewStore(store);
    }
  };

  const handleDelete = async (store: StoreWithReview) => {
    if (!window.confirm(`Supprimer la boutique "${store.name}" ? Cette action est irréversible.`)) return;
    setDeletingId(store.id);
    try {
      const { error } = await storesService.delete(store.id);
      if (error) throw new Error(error.message);
      notify('Boutique supprimée');
      if (reviewStore?.id === store.id) setReviewStore(null);
      loadStores();
    } catch {
      notify('Erreur lors de la suppression', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-kclick-orange/30 border-t-kclick-orange rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Chargement de vos boutiques...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white font-medium flex items-center gap-2`}>
          {notification.type === 'success' ? <CheckCircle size={18} /> : <X size={18} />}
          {notification.message}
        </div>
      )}

      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img src="/Kclick_LOGO-3.png" alt="Kclick" className="h-10 w-10" />
              <div>
                <div className="font-black text-xl text-kclick-orange">Kclick Business</div>
                <div className="text-xs text-gray-500">Portail vendeur</div>
              </div>
            </Link>
            <div className="flex items-center gap-3">
              <Link to={ECOMMERCE_URL} target='__blank' className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors">
                <Home size={18} />
                <span className="hidden sm:inline">Marketplace</span>
              </Link>
              <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover" />
                ) : (
                  <div className="w-9 h-9 bg-kclick-orange rounded-full flex items-center justify-center text-white font-bold">
                    {profile?.full_name?.[0] || 'U'}
                  </div>
                )}
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-gray-900">{profile?.full_name}</p>
                  <p className="text-xs text-gray-500">{profile?.email}</p>
                </div>
                <button onClick={() => signOut()} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Mes Boutiques</h1>
            <p className="text-gray-500">Gérez vos boutiques et suivez vos performances</p>
          </div>
          <Link
            to="/business/portal/new"
            className="flex items-center gap-2 bg-kclick-orange hover:bg-kclick-orange-dark text-white font-semibold px-5 py-3 rounded-xl transition-all"
          >
            <Plus size={18} />
            Créer une boutique
          </Link>
        </div>

        {stores.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Store size={40} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Aucune boutique</h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Vous n'avez pas encore de boutique. Créez votre première boutique pour commencer à vendre sur Kclick.
            </p>
            <Link
              to="/business/portal/new"
              className="inline-flex items-center gap-2 bg-kclick-orange hover:bg-kclick-orange-dark text-white font-semibold px-6 py-3 rounded-xl transition-all"
            >
              <Plus size={18} />
              Créer ma première boutique
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map(store => {
              const stats = storeStats[store.id] || { totalRevenue: 0, totalOrders: 0, totalProducts: 0 };
              const statusCfg = getStatusConfig(store);
              const approved = isApproved(store);

              return (
                <div
                  key={store.id}
                  className={`bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all hover:shadow-lg ${approved ? 'cursor-pointer' : 'cursor-pointer'}`}
                >
                  <div
                    onClick={() => handleStoreClick(store)}
                    className="relative h-32 bg-gradient-to-br from-gray-100 to-gray-200"
                  >
                    {store.cover_url && (
                      <img src={store.cover_url} alt="" className="w-full h-full object-cover" />
                    )}
                    <div className="absolute top-3 right-3">
                      <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${statusCfg.bg} ${statusCfg.color}`}>
                        {statusCfg.icon}
                        {statusCfg.label}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <div
                      onClick={() => handleStoreClick(store)}
                      className="flex items-start gap-3 mb-4"
                    >
                      <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center shrink-0 -mt-10 border-4 border-white shadow-md">
                        {store.logo_url ? (
                          <img src={store.logo_url} alt="" className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <Store size={24} className="text-gray-400" />
                        )}
                      </div>
                      <div className="min-w-0 pt-1">
                        <h3 className="font-bold text-gray-900 truncate">{store.name}</h3>
                        <p className="text-sm text-gray-500">{store.city}</p>
                      </div>
                    </div>

                    {store.description && (
                      <p onClick={() => handleStoreClick(store)} className="text-sm text-gray-600 line-clamp-2 mb-4">{store.description}</p>
                    )}

                    {approved ? (
                      <>
                        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100 mb-4">
                          <div className="text-center">
                            <p className="text-lg font-bold text-gray-900">${stats.totalRevenue.toFixed(0)}</p>
                            <p className="text-xs text-gray-500">Revenus</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-gray-900">{stats.totalOrders}</p>
                            <p className="text-xs text-gray-500">Commandes</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-gray-900">{stats.totalProducts}</p>
                            <p className="text-xs text-gray-500">Produits</p>
                          </div>
                        </div>
                        <button
                          onClick={() => navigate(`/business/store/${store.id}`)}
                          className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-kclick-orange hover:text-white text-gray-700 font-semibold py-2.5 rounded-xl transition-all"
                        >
                          Gérer la boutique
                          <ChevronRight size={16} />
                        </button>
                      </>
                    ) : (
                      <div className="pt-4 border-t border-gray-100 space-y-3">
                        <button
                          onClick={() => handleStoreClick(store)}
                          className={`w-full flex items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-xl border transition-all ${statusCfg.bg} ${statusCfg.color} border-current/20`}
                        >
                          {statusCfg.icon}
                          Voir le statut
                        </button>
                        <button
                          onClick={() => handleDelete(store)}
                          disabled={deletingId === store.id}
                          className="w-full flex items-center justify-center gap-2 text-sm font-medium text-red-600 hover:bg-red-50 py-2 rounded-xl border border-red-100 transition-all"
                        >
                          <Trash2 size={14} />
                          {deletingId === store.id ? 'Suppression...' : 'Supprimer cette boutique'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            <Link
              to="/business/portal/new"
              className="bg-white rounded-2xl border-2 border-dashed border-gray-300 hover:border-kclick-orange p-8 flex flex-col items-center justify-center transition-all hover:bg-orange-50 min-h-[300px]"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                <Plus size={32} className="text-gray-400" />
              </div>
              <p className="font-semibold text-gray-700">Ajouter une boutique</p>
              <p className="text-sm text-gray-500 mt-1">Créer une nouvelle boutique</p>
            </Link>
          </div>
        )}

        <div className="mt-12 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <h2 className="text-2xl font-bold mb-2">Besoin d'aide?</h2>
              <p className="text-gray-400 max-w-xl">Notre équipe est là pour vous accompagner dans le développement de votre activité sur Kclick.</p>
            </div>
            <Link to={ECOMMERCE_URL + '/help'} target='__blank' className="flex items-center gap-2 bg-white text-gray-900 font-semibold px-5 py-3 rounded-xl hover:bg-gray-100 transition-colors shrink-0">
              Centre d'aide
              <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </main>

      {reviewStore && (
        <StoreReviewModal
          store={reviewStore}
          onClose={() => setReviewStore(null)}
          onDelete={() => handleDelete(reviewStore)}
          deleting={deletingId === reviewStore.id}
        />
      )}
    </div>
  );
}

function StoreReviewModal({
  store,
  onClose,
  onDelete,
  deleting,
}: {
  store: StoreWithReview;
  onClose: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  const statusCfg = getStatusConfig(store);
  const isRejected = store.status === 'rejected';
  const isSuspended = store.status === 'suspended' || store.status === 'blocked';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className={`p-6 border-b ${statusCfg.bg}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isRejected || isSuspended ? 'bg-red-100' : 'bg-amber-100'}`}>
                {statusCfg.icon && React.cloneElement(statusCfg.icon as React.ReactElement, { size: 20, className: statusCfg.color })}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{store.name}</h3>
                <span className={`text-sm font-semibold ${statusCfg.color}`}>{statusCfg.label}</span>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {!isRejected && !isSuspended && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-start gap-3">
                <Clock size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-900">Examen en cours</p>
                  <p className="text-sm text-amber-700 mt-1">
                    Notre équipe examine votre dossier. Ce processus prend généralement 1 à 3 jours ouvrés.
                  </p>
                </div>
              </div>
            </div>
          )}

          {(isRejected || isSuspended) && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-start gap-3">
                <XCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900">
                    {isRejected ? 'Boutique refusée' : 'Boutique suspendue'}
                  </p>
                  {store.review_message || store.rejection_reason ? (
                    <p className="text-sm text-red-700 mt-1">
                      {store.review_message || store.rejection_reason}
                    </p>
                  ) : (
                    <p className="text-sm text-red-600 mt-1">
                      Contactez-nous pour plus d'informations.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
            <p className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FileText size={14} className="text-kclick-orange" />
              Documents KYC requis
            </p>
            <ul className="space-y-1.5 text-sm text-gray-600 mb-4">
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0" />Aucun registre de commerce</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0" />Aucun ID fiscal</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0" />Aucune pièce d'identité</li>
            </ul>
            <p className="text-xs text-gray-500 mb-3">
              Envoyez vos documents par email pour accélérer la validation :
            </p>
            <a
              href={`mailto:admin@kclick.co?subject=Documents KYC — ${encodeURIComponent(store.name)}`}
              className="flex items-center gap-2 text-sm font-semibold text-kclick-orange hover:underline"
            >
              <Mail size={14} />
              admin@kclick.co
            </a>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onDelete}
              disabled={deleting}
              className="flex-1 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-3 rounded-xl border border-red-200 transition-colors"
            >
              <Trash2 size={16} />
              {deleting ? 'Suppression...' : 'Supprimer'}
            </button>
            <button
              onClick={onClose}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-colors"
            >
              <RefreshCw size={16} />
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
