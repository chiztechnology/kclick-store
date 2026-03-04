import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, UserPlus, X, ChevronDown, Store, Send, Check, AlertCircle, Shield, Package, BarChart3 } from 'lucide-react';

const ROLES = [
  {
    id: 'manager',
    label: 'Gérant',
    desc: 'Peut gérer les produits, les commandes et les paramètres de la boutique',
    icon: Store,
    permissions: ['Produits', 'Commandes', 'Paramètres', 'Rapports'],
  },
  {
    id: 'staff',
    label: 'Staff',
    desc: 'Peut traiter les commandes et gérer le stock',
    icon: Package,
    permissions: ['Commandes', 'Stock'],
  },
  {
    id: 'analyst',
    label: 'Analyste',
    desc: 'Accès en lecture seule aux rapports et statistiques',
    icon: BarChart3,
    permissions: ['Rapports (lecture)'],
  },
];

interface Invite {
  email: string;
  role: string;
  status: 'pending' | 'sent' | 'error';
}

export default function InviteUserStorePage() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('staff');
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const selectedRole = ROLES.find(r => r.id === role)!;
  const RoleIcon = selectedRole.icon;

  const validateEmail = (v: string) => /\S+@\S+\.\S+/.test(v);

  const handleAdd = () => {
    if (!email.trim()) { setError('Entrez une adresse email'); return; }
    if (!validateEmail(email)) { setError('Email invalide'); return; }
    if (invites.some(i => i.email === email)) { setError('Cet email a déjà été ajouté'); return; }
    setInvites(prev => [...prev, { email: email.trim(), role, status: 'pending' }]);
    setEmail('');
    setError('');
  };

  const handleRemove = (idx: number) => {
    setInvites(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSend = async () => {
    if (invites.length === 0) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1800));
    setInvites(prev => prev.map(inv => ({ ...inv, status: 'sent' as const })));
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <img src="/kclick_logo.png" alt="Kclick" className="w-8 h-8" />
          <span className="font-black text-kclick-orange text-xl">Kclick</span>
        </div>

        <div className="mb-8">
          <h1 className="font-black text-3xl text-gray-900 mb-2">Inviter des collaborateurs</h1>
          <p className="text-gray-500">Donnez accès à votre boutique à des membres de votre équipe</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 mb-6">
          <Store size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Boutique : Ma Boutique Principale</p>
            <p className="text-xs text-amber-600 mt-0.5">Vous invitez des membres à rejoindre cette boutique</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="font-bold text-gray-900 mb-5">Ajouter des invitations</h2>

          <div className="flex gap-3 mb-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Adresse email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
                  placeholder="collaborateur@email.com"
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm outline-none transition-all ${
                    error ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-kclick-orange focus:ring-2 focus:ring-orange-100'
                  }`}
                />
              </div>
              {error && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                  <AlertCircle size={12} /> {error}
                </p>
              )}
            </div>

            <div className="w-40">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Rôle</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowRoleMenu(!showRoleMenu)}
                  className="w-full flex items-center justify-between gap-2 px-3 py-3 border border-gray-200 rounded-xl text-sm hover:border-gray-300 transition-colors bg-white"
                >
                  <span className="font-medium text-gray-800">{selectedRole.label}</span>
                  <ChevronDown size={14} className={`text-gray-400 transition-transform ${showRoleMenu ? 'rotate-180' : ''}`} />
                </button>
                {showRoleMenu && (
                  <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
                    {ROLES.map(r => (
                      <button
                        key={r.id}
                        onClick={() => { setRole(r.id); setShowRoleMenu(false); }}
                        className={`w-full text-left px-3 py-2.5 text-sm transition-colors ${
                          role === r.id ? 'bg-orange-50 text-kclick-orange font-semibold' : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 mb-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
                <RoleIcon size={16} className="text-kclick-orange" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{selectedRole.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{selectedRole.desc}</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {selectedRole.permissions.map(p => (
                    <span key={p} className="px-2 py-0.5 bg-white border border-gray-200 rounded-full text-xs text-gray-600">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Message personnalisé (optionnel)</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Bonjour, je vous invite à rejoindre notre équipe sur Kclick..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-kclick-orange focus:ring-2 focus:ring-orange-100 transition-all resize-none"
            />
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl text-sm transition-colors"
          >
            <UserPlus size={16} />
            Ajouter à la liste
          </button>
        </div>

        {invites.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
            <h2 className="font-bold text-gray-900 mb-1">
              Invitations en attente
              <span className="ml-2 text-sm font-normal text-gray-500">({invites.length})</span>
            </h2>
            <p className="text-xs text-gray-400 mb-5">Ces invitations seront envoyées en même temps</p>

            <div className="space-y-3">
              {invites.map((inv, idx) => {
                const r = ROLES.find(r => r.id === inv.role)!;
                const Icon = r.icon;
                return (
                  <div key={idx} className={`flex items-center gap-3 p-3.5 rounded-xl border-2 ${
                    inv.status === 'sent' ? 'border-green-200 bg-green-50' : 'border-gray-100 bg-gray-50'
                  }`}>
                    <div className="w-9 h-9 bg-white border border-gray-200 rounded-xl flex items-center justify-center shrink-0">
                      <Icon size={16} className="text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{inv.email}</p>
                      <p className="text-xs text-gray-500">{r.label}</p>
                    </div>
                    {inv.status === 'sent' ? (
                      <span className="flex items-center gap-1.5 text-xs text-green-700 font-semibold">
                        <Check size={14} />
                        Envoyé
                      </span>
                    ) : (
                      <button
                        onClick={() => handleRemove(idx)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X size={15} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {invites.some(i => i.status === 'pending') && (
              <button
                onClick={handleSend}
                disabled={loading}
                className="mt-5 w-full bg-kclick-orange hover:bg-kclick-orange-dark disabled:bg-kclick-peach text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Envoyer {invites.filter(i => i.status === 'pending').length} invitation{invites.filter(i => i.status === 'pending').length > 1 ? 's' : ''}
                  </>
                )}
              </button>
            )}

            {invites.every(i => i.status === 'sent') && (
              <div className="mt-4 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check size={24} className="text-green-600" />
                </div>
                <p className="font-bold text-gray-900 text-sm">Toutes les invitations ont été envoyées !</p>
                <button
                  onClick={() => setInvites([])}
                  className="mt-3 text-sm text-kclick-orange hover:text-kclick-orange-dark font-medium"
                >
                  Inviter d'autres personnes
                </button>
              </div>
            )}
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-start gap-3">
          <Shield size={18} className="text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-900">À propos des rôles</p>
            <p className="text-xs text-blue-700 mt-1 leading-relaxed">
              Chaque membre ne peut accéder qu'aux sections autorisées par son rôle. Vous pouvez modifier ou révoquer les accès depuis les paramètres de la boutique.
            </p>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link to="/business" className="text-sm text-gray-500 hover:text-gray-700">
            Retour au portail vendeur
          </Link>
        </div>
      </div>
    </div>
  );
}
