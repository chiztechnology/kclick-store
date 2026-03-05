import { Link } from 'react-router-dom';
import { Store, ArrowLeft, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import React from 'react';

export default function ConfirmAccountConversionPage() {
  const { user, profile, convertToSeller } = useAuth();
  const [loading, setLoading] = React.useState(false);


  const handleStartConversion = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await convertToSeller(user.email);
    if(error) {
      alert('Une erreur est survenue lors de la conversion de votre compte. Veuillez réessayer plus tard.');
    }
    setLoading(false);
  }


  const isLoggedIn = !!user;

  return (
    <div className="min-h-screen bg-surface-secondary">
      {/* Minimal header */}
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <img src="/Kclick_LOGO-1.png" alt="KClick" className="h-8" />
            </Link>
            {isLoggedIn && (
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-8 h-8 rounded-full bg-kclick-orange/10 flex items-center justify-center">
                  <span className="text-kclick-orange font-bold text-xs">
                    {(profile?.full_name || user.email || '?')[0].toUpperCase()}
                  </span>
                </div>
                <span className="font-medium">{profile?.full_name || user.email}</span>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-20">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-kclick-orange transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Retour à l'accueil
        </Link>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-card overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-brand p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
              <Store className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-kclick-orange">Devenir Vendeur KCLICK</h1>
            <p className="text-gray-600 mt-2">Convertissez votre compte client en compte vendeur</p>
          </div>

          <div className="p-8">
            {isLoggedIn ? (
              <>
                {/* Account info */}
                <div className="bg-kclick-orange/5 border border-kclick-orange/20 rounded-2xl p-5 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-kclick-orange mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">Vous avez un compte client</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Votre compte <strong>{profile?.full_name || user.email}</strong> est actuellement un compte client.
                        Cliquez ci-dessous pour le convertir en compte vendeur et accéder au portail de gestion de boutique.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Benefits */}
                <div className="space-y-4 mb-8">
                  <h3 className="font-bold text-gray-900">Ce que vous obtiendrez :</h3>
                  {[
                    'Votre propre boutique en ligne sur KCLICK',
                    'Tableau de bord de gestion des produits et commandes',
                    'Accès aux statistiques et analytics de vente',
                    'Support vendeur prioritaire 24/7',
                  ].map((benefit) => (
                    <div key={benefit} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleStartConversion}
                  disabled={loading}
                  className="w-full bg-kclick-orange text-white py-4 rounded-2xl font-bold text-lg hover:shadow-glow-orange transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-3"
                >
                  Confirmer la conversion en compte vendeur
                  <ArrowRight className="w-5 h-5" />
                </button>

                <p className="text-xs text-gray-400 text-center mt-4">
                  En confirmant, vous acceptez les{' '}
                  <a href="#" className="text-kclick-orange hover:underline">conditions générales vendeur</a>{' '}
                  de KCLICK.
                </p>
              </>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">Connectez-vous d'abord</h3>
                <p className="text-gray-500 mb-6">
                  Vous devez avoir un compte KCLICK pour devenir vendeur.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    to="/login"
                    className="bg-gradient-brand text-white px-8 py-3 rounded-xl font-semibold hover:shadow-glow-orange transition-all duration-300"
                  >
                    Se connecter
                  </Link>
                  <Link
                    to="/login"
                    className="border-2 border-gray-200 text-gray-700 px-8 py-3 rounded-xl font-semibold hover:border-kclick-orange hover:text-kclick-orange transition-all duration-300"
                  >
                    Créer un compte
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}