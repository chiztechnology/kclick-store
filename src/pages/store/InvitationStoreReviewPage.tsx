import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Store, CheckCircle, XCircle, Clock, Package, BarChart3, Shield, Users, Star, MapPin, ExternalLink } from 'lucide-react';

const MOCK_STORE = {
  name: 'Boutique Excellence',
  logo: null as null | string,
  cover: null as null | string,
  description: 'Spécialiste en électronique et accessoires haut de gamme. Plus de 5 ans d\'expérience dans la vente en ligne.',
  location: 'Kinshasa, République Démocratique du Congo',
  category: 'Électronique',
  rating: 4.7,
  totalProducts: 142,
  totalSales: 1230,
  joinedSince: 'Janvier 2023',
  owner: 'Jean-Pierre Kabila',
};

const ROLE = {
  label: 'Gérant',
  desc: 'Vous aurez accès à la gestion des produits, commandes et paramètres',
  permissions: [
    { label: 'Gérer les produits', icon: Package, allowed: true },
    { label: 'Traiter les commandes', icon: CheckCircle, allowed: true },
    { label: 'Consulter les rapports', icon: BarChart3, allowed: true },
    { label: 'Paramètres de la boutique', icon: Store, allowed: true },
    { label: 'Inviter des membres', icon: Users, allowed: false },
    { label: 'Supprimer la boutique', icon: XCircle, allowed: false },
  ],
};

export default function InvitationStoreReviewPage() {
  const [loading, setLoading] = useState(false);
  const [decision, setDecision] = useState<'accepted' | 'declined' | null>(null);

  const handleDecide = async (accept: boolean) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    setDecision(accept ? 'accepted' : 'declined');
  };

  if (decision) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
            decision === 'accepted' ? 'bg-green-100' : 'bg-gray-100'
          }`}>
            {decision === 'accepted'
              ? <CheckCircle size={40} className="text-green-600" />
              : <XCircle size={40} className="text-gray-500" />
            }
          </div>

          <h1 className="font-black text-2xl text-gray-900 mb-3">
            {decision === 'accepted' ? 'Invitation acceptée !' : 'Invitation refusée'}
          </h1>

          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            {decision === 'accepted'
              ? `Bienvenue dans l'équipe de "${MOCK_STORE.name}". Vous pouvez maintenant accéder à la boutique depuis votre portail vendeur.`
              : `Vous avez refusé l'invitation à rejoindre "${MOCK_STORE.name}". Vous pouvez fermer cette page.`
            }
          </p>

          {decision === 'accepted' ? (
            <div className="space-y-3">
              <Link
                to="/business/portal"
                className="block w-full bg-kclick-orange hover:bg-kclick-orange-dark text-white font-bold py-3.5 rounded-xl transition-colors"
              >
                Accéder à ma boutique
              </Link>
              <Link to="/" className="block w-full text-sm text-gray-500 hover:text-gray-700 py-2">
                Retour à l'accueil
              </Link>
            </div>
          ) : (
            <Link to="/" className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-colors text-sm">
              Retour à l'accueil
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <img src="/kclick_logo.png" alt="Kclick" className="w-8 h-8" />
          <span className="font-black text-kclick-orange text-xl">Kclick</span>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 text-kclick-orange text-sm font-semibold px-4 py-2 rounded-full mb-4">
            <Store size={16} />
            Invitation à rejoindre une boutique
          </div>
          <h1 className="font-black text-3xl text-gray-900 mb-2">
            Vous avez été invité !
          </h1>
          <p className="text-gray-500">
            <strong className="text-gray-700">{MOCK_STORE.owner}</strong> vous invite à rejoindre son équipe en tant que <strong className="text-kclick-orange">{ROLE.label}</strong>
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-5">
          <div className="relative h-28 bg-gradient-to-br from-kclick-orange/20 to-kclick-peach/20">
            {MOCK_STORE.cover && <img src={MOCK_STORE.cover} alt="" className="w-full h-full object-cover" />}
            <div className="absolute inset-0 bg-gradient-to-t from-white/50 to-transparent" />
          </div>

          <div className="px-6 pb-6">
            <div className="flex items-end gap-4 -mt-8 mb-4">
              <div className="w-16 h-16 bg-white rounded-2xl border-2 border-white shadow-md flex items-center justify-center shrink-0">
                {MOCK_STORE.logo
                  ? <img src={MOCK_STORE.logo} alt={MOCK_STORE.name} className="w-full h-full object-cover rounded-2xl" />
                  : <Store size={24} className="text-kclick-orange" />
                }
              </div>
              <div className="pb-1 flex-1 min-w-0">
                <h2 className="font-black text-xl text-gray-900">{MOCK_STORE.name}</h2>
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                  <span className="flex items-center gap-1">
                    <Star size={11} className="text-amber-400 fill-amber-400" />
                    {MOCK_STORE.rating}
                  </span>
                  <span>{MOCK_STORE.category}</span>
                  <span className="flex items-center gap-1">
                    <MapPin size={11} />
                    {MOCK_STORE.location.split(',')[0]}
                  </span>
                </div>
              </div>
              <a
                href="#"
                className="flex items-center gap-1.5 text-xs text-kclick-orange font-medium hover:text-kclick-orange-dark"
              >
                Voir la boutique
                <ExternalLink size={12} />
              </a>
            </div>

            <p className="text-sm text-gray-600 mb-5 leading-relaxed">{MOCK_STORE.description}</p>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Produits', value: MOCK_STORE.totalProducts.toString() },
                { label: 'Ventes', value: MOCK_STORE.totalSales.toLocaleString() },
                { label: 'Membre depuis', value: MOCK_STORE.joinedSince },
              ].map(stat => (
                <div key={stat.label} className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="font-black text-gray-900 text-lg leading-none">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
          <div className="flex items-start gap-3 mb-5">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
              <Shield size={18} className="text-kclick-orange" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Vos accès en tant que {ROLE.label}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{ROLE.desc}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {ROLE.permissions.map(({ label, icon: Icon, allowed }) => (
              <div key={label} className={`flex items-center gap-3 p-3 rounded-xl ${allowed ? 'bg-green-50' : 'bg-gray-50'}`}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${allowed ? 'bg-green-100' : 'bg-gray-200'}`}>
                  <Icon size={14} className={allowed ? 'text-green-600' : 'text-gray-400'} />
                </div>
                <span className={`text-sm ${allowed ? 'text-gray-900 font-medium' : 'text-gray-400 line-through'}`}>
                  {label}
                </span>
                {allowed
                  ? <CheckCircle size={14} className="text-green-500 ml-auto shrink-0" />
                  : <XCircle size={14} className="text-gray-300 ml-auto shrink-0" />
                }
              </div>
            ))}
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 mb-6">
          <Clock size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 leading-relaxed">
            Cette invitation expirera dans <strong>7 jours</strong>. Après cette date, vous devrez demander une nouvelle invitation.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleDecide(false)}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-6 py-3.5 border-2 border-red-200 hover:border-red-300 hover:bg-red-50 text-red-600 font-bold rounded-xl transition-all disabled:opacity-50"
          >
            {loading ? <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" /> : <XCircle size={18} />}
            Refuser
          </button>
          <button
            onClick={() => handleDecide(true)}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-kclick-orange hover:bg-kclick-orange-dark disabled:bg-kclick-peach text-white font-bold rounded-xl transition-colors"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <CheckCircle size={18} />}
            Accepter
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Vous recevez cet email car <strong className="text-gray-500">{MOCK_STORE.owner}</strong> vous a invité.
          Si vous ne connaissez pas cette personne,{' '}
          <Link to="/help" className="text-kclick-orange hover:underline">signalez-le ici</Link>.
        </p>
      </div>
    </div>
  );
}
