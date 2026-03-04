import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BellOff, CheckCircle, Mail, MailOpen } from 'lucide-react';

const CATEGORIES = [
  { id: 'promotions', label: 'Promotions & Offres spéciales', desc: 'Bons plans, ventes flash et réductions exclusives' },
  { id: 'orders', label: 'Mises à jour de commandes', desc: 'Confirmations, expéditions et livraisons' },
  { id: 'newsletters', label: 'Newsletter hebdomadaire', desc: 'Nouveautés, tendances et articles du blog' },
  { id: 'recommendations', label: 'Recommandations personnalisées', desc: 'Produits sélectionnés selon vos préférences' },
  { id: 'stores', label: 'Actualités des boutiques', desc: 'Nouveaux produits de vos boutiques favorites' },
  { id: 'system', label: 'Notifications système', desc: 'Sécurité, mises à jour de compte et alertes importantes' },
];

export default function UnsubscribePage() {
  const [selected, setSelected] = useState<Set<string>>(new Set(['promotions', 'newsletters', 'recommendations']));
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [unsubAll, setUnsubAll] = useState(false);

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    setDone(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="px-8 pt-10 pb-6 text-center border-b border-gray-100">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {done ? <MailOpen size={28} className="text-gray-600" /> : <BellOff size={28} className="text-gray-600" />}
              </div>
              <div className="flex items-center justify-center gap-2 mb-1">
                <img src="/kclick_logo.png" alt="Kclick" className="w-6 h-6" />
                <span className="font-black text-kclick-orange">Kclick</span>
              </div>
              <h1 className="font-black text-2xl text-gray-900 mt-1">
                {done ? 'Préférences mises à jour' : 'Gérer mes notifications'}
              </h1>
              <p className="text-gray-500 text-sm mt-2">
                {done
                  ? 'Vos préférences de notification ont été enregistrées avec succès.'
                  : 'Choisissez les types d\'emails que vous souhaitez recevoir de notre part.'}
              </p>
            </div>

            <div className="p-8">
              {done ? (
                <div className="text-center py-2">
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={28} className="text-green-600" />
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-6">
                    {unsubAll
                      ? 'Vous avez été désinscrit de toutes nos communications. Vous pouvez vous réinscrire à tout moment depuis votre profil.'
                      : 'Vos préférences ont été sauvegardées. Les changements prendront effet lors de nos prochains envois.'}
                  </p>
                  <div className="space-y-3">
                    <button
                      onClick={() => { setDone(false); setUnsubAll(false); }}
                      className="w-full border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-semibold py-3 rounded-xl transition-all text-sm"
                    >
                      Modifier mes préférences
                    </button>
                    <Link
                      to="/"
                      className="block w-full text-center bg-kclick-orange hover:bg-kclick-orange-dark text-white font-bold py-3 rounded-xl transition-colors text-sm"
                    >
                      Retour à l'accueil
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-3">
                    {CATEGORIES.map(cat => {
                      const isSystem = cat.id === 'system';
                      const isChecked = isSystem ? true : selected.has(cat.id);
                      return (
                        <label
                          key={cat.id}
                          className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            isChecked
                              ? 'border-kclick-orange bg-orange-50/40'
                              : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                          } ${isSystem ? 'opacity-75 cursor-not-allowed' : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            disabled={isSystem}
                            onChange={() => !isSystem && toggle(cat.id)}
                            className="w-4 h-4 mt-0.5 rounded accent-kclick-orange shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900">{cat.label}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{cat.desc}</p>
                            {isSystem && (
                              <span className="text-xs text-amber-600 font-medium mt-1 block">
                                Ces emails ne peuvent pas être désactivés
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Mail size={14} className={isChecked ? 'text-kclick-orange' : 'text-gray-300'} />
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  <div className="pt-2 space-y-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-kclick-orange hover:bg-kclick-orange-dark disabled:bg-kclick-peach text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Sauvegarde...
                        </>
                      ) : (
                        'Sauvegarder mes préférences'
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => { setUnsubAll(true); setSelected(new Set()); handleSubmit({ preventDefault: () => {} } as any); }}
                      className="w-full border-2 border-red-200 hover:border-red-300 hover:bg-red-50 text-red-600 font-semibold py-3 rounded-xl transition-all text-sm"
                    >
                      Se désinscrire de toutes les communications
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            Vous recevez cet email car vous avez un compte Kclick.{' '}
            <Link to="/settings" className="text-kclick-orange hover:underline">Gérer depuis le profil</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
