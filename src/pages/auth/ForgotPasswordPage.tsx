import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Veuillez entrer votre adresse email');
      return;
    }
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-kclick-orange to-kclick-orange-light px-8 py-10 text-white text-center">
              <Link
                to="/login"
                className="absolute top-5 left-5 flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium transition-colors"
              >
                <ArrowLeft size={16} />
                Retour
              </Link>
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <img src="/kclick_logo.png" alt="Kclick" className="w-10 h-10" />
              </div>
              <h1 className="font-black text-2xl leading-tight">Mot de passe oublié</h1>
              <p className="text-white/80 text-sm mt-2">
                Entrez votre email pour recevoir un lien de réinitialisation
              </p>
            </div>

            <div className="p-8">
              {sent ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} className="text-green-600" />
                  </div>
                  <h2 className="font-bold text-xl text-gray-900 mb-2">Email envoyé !</h2>
                  <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                    Un lien de réinitialisation a été envoyé à <strong className="text-gray-700">{email}</strong>. Vérifiez votre boîte de réception (et vos spams).
                  </p>
                  <div className="space-y-3">
                    <button
                      onClick={() => { setSent(false); setEmail(''); }}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-colors text-sm"
                    >
                      Renvoyer l'email
                    </button>
                    <Link
                      to="/login"
                      className="block w-full text-center bg-kclick-orange hover:bg-kclick-orange-dark text-white font-bold py-3 rounded-xl transition-colors text-sm"
                    >
                      Retour à la connexion
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Adresse email
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={e => { setEmail(e.target.value); setError(''); }}
                        placeholder="votre@email.com"
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm outline-none transition-all ${
                          error ? 'border-red-400 focus:border-red-400 bg-red-50' : 'border-gray-200 focus:border-kclick-orange focus:ring-2 focus:ring-orange-100'
                        }`}
                        autoFocus
                      />
                    </div>
                    {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-kclick-orange hover:bg-kclick-orange-dark disabled:bg-kclick-peach text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      'Envoyer le lien'
                    )}
                  </button>

                  <p className="text-center text-sm text-gray-500">
                    Vous vous souvenez de votre mot de passe ?{' '}
                    <Link to="/login" className="text-kclick-orange font-bold hover:text-kclick-orange-dark">
                      Se connecter
                    </Link>
                  </p>
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
