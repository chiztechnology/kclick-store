import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, MapPin, Star, Package, ChevronRight, Search, LogOut, BadgeCheck } from 'lucide-react';
import { storesService } from '../../../lib/api';
import type { Store as StoreType } from '../../../types';

export default function StoreSelectPage() {
  const navigate = useNavigate();
  const [stores, setStores] = useState<StoreType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      const result = await storesService.getAll();

      if (result.error) {
        throw new Error(result.error.message);
      }

      if (result.data && result.data.length > 0) {
        // Filter only active stores
        const activeStores = result.data.filter((store: any) => store.is_active);
        setStores(activeStores);
      } 
    } catch (error) {
      console.error('Error loading stores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStore = (storeId: string) => {
    navigate(`/store-portal/store/${storeId}`);
  };

  const filteredStores = stores.filter(store =>
    store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    store.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-white mb-1">Selectionnez une boutique</h1>
            <p className="text-gray-400 text-sm">Choisissez la boutique que vous souhaitez gerer</p>
          </div>
          <button
            onClick={() => navigate('/store-portal/signin')}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-400 hover:text-white text-sm font-medium transition-all"
          >
            <LogOut size={16} />
            Deconnexion
          </button>
        </div>

        <div className="relative mb-6">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une boutique..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          </div>
        ) : filteredStores.length === 0 ? (
          <div className="text-center py-20">
            <Store size={48} className="mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400">Aucune boutique trouvee</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredStores.map((store) => (
              <button
                key={store.id}
                onClick={() => handleSelectStore(store.id)}
                className="group relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/30 rounded-2xl p-5 text-left transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/5 overflow-hidden"
              >
                {/* Background cover image */}
                {store.cover_image_url && (
                  <>
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-20 group-hover:opacity-30 transition-opacity"
                      style={{
                        backgroundImage: `url(${store.cover_image_url})`
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 to-gray-900/60" />
                  </>
                )}
                
                {/* Content */}
                <div className="relative z-10 flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-800 shrink-0">
                    {store.logo_url ? (
                      <img
                        src={store.logo_url}
                        alt={store.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Store size={24} className="text-gray-600" />
                      </div>
                    )}
                    {store.is_verified && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-gray-900">
                        <BadgeCheck size={12} className="text-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-white text-lg truncate">{store.name}</h3>
                    </div>
                    <p className="text-gray-400 text-sm mb-2">{store.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        {store.city}
                      </span>
                      <span className="flex items-center gap-1 text-amber-400">
                        <Star size={12} fill="currentColor" />
                        {store.rating}
                      </span>
                      <span className="flex items-center gap-1">
                        <Package size={12} />
                        {store.product_count} produits
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 group-hover:bg-emerald-500 flex items-center justify-center transition-colors">
                      <ChevronRight size={20} className="text-emerald-500 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
