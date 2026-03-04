import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, ShieldCheck } from 'lucide-react';

function StrengthBar({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const strength = checks.filter(Boolean).length;
  const labels = ['', 'Faible', 'Moyen', 'Bon', 'Fort'];
  const colors = ['bg-gray-200', 'bg-red-400', 'bg-amber-400', 'bg-blue-400', 'bg-green-500'];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? colors[strength] : 'bg-gray-200'}`}
          />
        ))}
      </div>
      {strength > 0 && (
        <p className={`text-xs font-medium ${
          strength <= 1 ? 'text-red-500' : strength === 2 ? 'text-amber-500' : strength === 3 ? 'text-blue-500' : 'text-green-600'
        }`}>
          {labels[strength]}
        </p>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (password.length < 8) e.password = 'Au moins 8 caractères requis';
    if (password !== confirm) e.confirm = 'Les mots de passe ne correspondent pas';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    setDone(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-kclick-orange to-kclick-orange-light px-8 py-10 text-white text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ShieldCheck size={32} className="text-white" />
              </div>
              <h1 className="font-black text-2xl">Nouveau mot de passe</h1>
              <p className="text-white/80 text-sm mt-2">Choisissez un mot de passe sécurisé</p>
            </div>

            <div className="p-8">
              {done ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} className="text-green-600" />
                  </div>
                  <h2 className="font-bold text-xl text-gray-900 mb-2">Mot de passe mis à jour !</h2>
                  <p className="text-sm text-gray-500 mb-6">
                    Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.
                  </p>
                  <Link
                    to="/login"
                    className="block w-full text-center bg-kclick-orange hover:bg-kclick-orange-dark text-white font-bold py-3.5 rounded-xl transition-colors"
                  >
                    Se connecter
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Nouveau mot de passe
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: '' })); }}
                        placeholder="Minimum 8 caractères"
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
                    {errors.password && <p className="text-xs text-red-500 mt-1.5">{errors.password}</p>}
                    <StrengthBar password={password} />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Confirmer le mot de passe
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        value={confirm}
                        onChange={e => { setConfirm(e.target.value); setErrors(prev => ({ ...prev, confirm: '' })); }}
                        placeholder="Répétez le mot de passe"
                        className={`w-full pl-10 pr-11 py-3 border rounded-xl text-sm outline-none transition-all ${
                          errors.confirm ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-kclick-orange focus:ring-2 focus:ring-orange-100'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errors.confirm && <p className="text-xs text-red-500 mt-1.5">{errors.confirm}</p>}
                    {confirm && !errors.confirm && password === confirm && (
                      <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1">
                        <CheckCircle size={12} /> Les mots de passe correspondent
                      </p>
                    )}
                  </div>

                  <ul className="bg-gray-50 rounded-xl p-4 space-y-2">
                    {[
                      { label: 'Au moins 8 caractères', ok: password.length >= 8 },
                      { label: 'Une lettre majuscule', ok: /[A-Z]/.test(password) },
                      { label: 'Un chiffre', ok: /[0-9]/.test(password) },
                      { label: 'Un caractère spécial', ok: /[^A-Za-z0-9]/.test(password) },
                    ].map(({ label, ok }) => (
                      <li key={label} className={`flex items-center gap-2 text-xs ${ok ? 'text-green-600' : 'text-gray-400'}`}>
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${ok ? 'bg-green-100' : 'bg-gray-200'}`}>
                          {ok ? <CheckCircle size={10} /> : <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />}
                        </div>
                        {label}
                      </li>
                    ))}
                  </ul>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-kclick-orange hover:bg-kclick-orange-dark disabled:bg-kclick-peach text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Mise à jour...
                      </>
                    ) : (
                      'Réinitialiser le mot de passe'
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            &copy; {new Date().getFullYear()} Kclick Marketplace. Tous droits réservés.
          </p>
        </div>
      </div>
    </div>
  );
}
