import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ShoppingBag, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email.trim()) e.email = 'Email requis';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Email invalide';
    if (!password) e.password = 'Mot de passe requis';
    else if (password.length < 6) e.password = 'Au moins 6 caractères';
    if (mode === 'register' && !fullName.trim()) e.fullName = 'Nom requis';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    setGeneralError('');
    
    try {
      let result;
      if (mode === 'login') {
        result = await signIn(email, password);
      } else {
        result = await signUp(email, password, fullName);
      }

      if (result.error) {
        const errorMessage = result.error?.message || 
                            result.error?.toString() || 
                            (mode === 'login' ? 'Identifiants invalides' : 'Erreur lors de la création du compte');
        setGeneralError(errorMessage);
      } else {
        // Success - redirect to dashboard
        navigate('/');
      }
    } catch (err: any) {
      const errorMessage = err?.message || (mode === 'login' ? 'Erreur de connexion' : 'Erreur lors de la création du compte');
      setGeneralError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-kclick-orange via-kclick-orange-light to-kclick-peach relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: `${80 + i * 40}px`,
                height: `${80 + i * 40}px`,
                top: `${10 + i * 10}%`,
                left: `${-10 + i * 15}%`,
              }}
            />
          ))}
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-3 mb-12">
            <img src="/kclick_logo.png" alt="Kclick" className="w-12 h-12" />
            <div>
              <div className="font-black text-2xl leading-none">Kclick</div>
              <div className="text-white/70 text-sm">Marketplace</div>
            </div>
          </div>
          <h2 className="font-black text-4xl leading-tight mb-4">
            Le marché en ligne qui vous rapproche des meilleurs vendeurs
          </h2>
          <p className="text-white/80 text-lg leading-relaxed mb-10">
            Achetez, vendez et développez votre activité avec des milliers de partenaires de confiance.
          </p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: '50k+', label: 'Produits' },
              { value: '2k+', label: 'Boutiques' },
              { value: '120k+', label: 'Clients' },
            ].map(stat => (
              <div key={stat.label} className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 text-center">
                <div className="font-black text-2xl">{stat.value}</div>
                <div className="text-white/70 text-xs mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <img src="/kclick_logo.png" alt="Kclick" className="w-10 h-10" />
            <div>
              <div className="font-black text-xl leading-none text-kclick-orange">Kclick</div>
              <div className="text-gray-400 text-xs">Marketplace</div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="flex border-b border-gray-100">
              {(['login', 'register'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => { setMode(tab); setErrors({}); setGeneralError(''); }}
                  className={`flex-1 py-4 text-sm font-bold transition-all ${
                    mode === tab
                      ? 'text-kclick-orange border-b-2 border-kclick-orange'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {tab === 'login' ? 'Connexion' : 'Inscription'}
                </button>
              ))}
            </div>

            <div className="p-8">
              <div className="mb-6">
                <h1 className="font-black text-2xl text-gray-900">
                  {mode === 'login' ? 'Bienvenue !' : 'Créer un compte'}
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  {mode === 'login' ? 'Connectez-vous à votre compte Kclick' : 'Rejoignez la communauté Kclick'}
                </p>
              </div>

              {generalError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                  <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{generalError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'register' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nom complet</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={e => { setFullName(e.target.value); setErrors(prev => ({ ...prev, fullName: '' })); }}
                      placeholder="Jean Dupont"
                      className={`w-full px-4 py-3 border rounded-xl text-sm outline-none transition-all ${
                        errors.fullName ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-kclick-orange focus:ring-2 focus:ring-orange-100'
                      }`}
                    />
                    {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Adresse email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: '' })); }}
                      placeholder="votre@email.com"
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm outline-none transition-all ${
                        errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-kclick-orange focus:ring-2 focus:ring-orange-100'
                      }`}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>

                {mode === 'register' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Téléphone</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+243 000 000 000"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-kclick-orange focus:ring-2 focus:ring-orange-100 transition-all"
                    />
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-semibold text-gray-700">Mot de passe</label>
                    {mode === 'login' && (
                      <Link to="/forgot-password" className="text-xs text-kclick-orange hover:text-kclick-orange-dark font-medium">
                        Mot de passe oublié ?
                      </Link>
                    )}
                  </div>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: '' })); }}
                      placeholder={mode === 'login' ? 'Votre mot de passe' : 'Minimum 6 caractères'}
                      className={`w-full pl-10 pr-11 py-3 border rounded-xl text-sm outline-none transition-all ${
                        errors.password ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-kclick-orange focus:ring-2 focus:ring-orange-100'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                </div>

                {mode === 'login' && (
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 accent-kclick-orange" />
                    <span className="text-sm text-gray-600">Se souvenir de moi</span>
                  </label>
                )}

                {mode === 'register' && (
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 accent-kclick-orange mt-0.5" />
                    <span className="text-xs text-gray-500 leading-relaxed">
                      J'accepte les{' '}
                      <Link to="/legal" className="text-kclick-orange hover:underline">conditions d'utilisation</Link>{' '}
                      et la{' '}
                      <Link to="/legal" className="text-kclick-orange hover:underline">politique de confidentialité</Link>
                    </span>
                  </label>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-kclick-orange hover:bg-kclick-orange-dark disabled:bg-kclick-peach text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {mode === 'login' ? 'Connexion...' : 'Création...'}
                    </>
                  ) : (
                    mode === 'login' ? 'Se connecter' : 'Créer mon compte'
                  )}
                </button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 bg-white text-xs text-gray-400 font-medium">ou continuer avec</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {['Google', 'Facebook'].map(provider => (
                  <button
                    key={provider}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-gray-200 hover:border-gray-300 rounded-xl text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50"
                  >
                    <ShoppingBag size={15} className="text-gray-500" />
                    {provider}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="text-center mt-6">
            <p className="text-xs text-gray-400">
              Vous êtes vendeur ?{' '}
              <Link to="https://store.kclick.co" target='__blank' className="text-kclick-orange font-semibold hover:text-kclick-orange-dark">
                Ouvrez votre boutique
              </Link>
            </p>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            &copy; {new Date().getFullYear()} Kclick Marketplace. Tous droits réservés.
          </p>
        </div>
      </div>
    </div>
  );
}
