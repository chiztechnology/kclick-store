import React from 'react';
import { Link } from 'react-router-dom';
import {
  Store, TrendingUp, Shield, Truck, Users, CreditCard,
  BarChart3, Globe, Headphones, CheckCircle, ArrowRight,
  Zap, Package, Star
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useApp } from '../../../context/AppContext';

const FEATURES = [
  {
    icon: <Store size={24} />,
    title: 'Créez votre boutique',
    description: 'Lancez votre boutique en ligne en quelques minutes. Aucune compétence technique requise.',
  },
  {
    icon: <Package size={24} />,
    title: 'Gérez vos produits',
    description: 'Ajoutez, modifiez et organisez facilement votre catalogue de produits.',
  },
  {
    icon: <TrendingUp size={24} />,
    title: 'Suivez vos ventes',
    description: 'Tableau de bord analytique complet pour suivre vos performances en temps réel.',
  },
  {
    icon: <CreditCard size={24} />,
    title: 'Paiements sécurisés',
    description: 'Recevez vos paiements via M-Pesa, carte bancaire et virement.',
  },
  {
    icon: <Truck size={24} />,
    title: 'Logistique simplifiée',
    description: 'Gestion des commandes et livraisons intégrée à la plateforme.',
  },
  {
    icon: <Headphones size={24} />,
    title: 'Support dédié',
    description: 'Une équipe à votre service pour vous accompagner dans votre succès.',
  },
];

const BENEFITS = [
  'Commission compétitive sur les ventes',
  'Accès à des millions de clients potentiels',
  'Outils marketing intégrés',
  'Formation et ressources gratuites',
  'Protection vendeur garantie',
  'Paiements rapides et sécurisés',
];

const TESTIMONIALS = [
  {
    name: 'Marie Kabongo',
    store: 'Mode Elegante',
    image: 'https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?w=200',
    quote: 'Kclick m\'a permis de développer mon activité de mode au-delà de Kinshasa. Mes ventes ont triplé en 6 mois!',
  },
  {
    name: 'Jean-Pierre Mukendi',
    store: 'TechZone',
    image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?w=200',
    quote: 'La plateforme est intuitive et le support est excellent. Je recommande à tous les entrepreneurs congolais.',
  },
  {
    name: 'Esther Lumumba',
    store: 'Beauté Africaine',
    image: 'https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?w=200',
    quote: 'Grâce à Kclick, j\'ai pu atteindre des clients dans toute la RDC. Une vraie révolution pour mon business!',
  },
];

export default function BusinessLandingPage() {
  const { user } = useAuth();
  const { setIsAuthOpen } = useApp();

  const handleGetStarted = () => {
    if (user) {
      window.location.href = '/business/portal';
    } else {
      setIsAuthOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?w=1920')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-kclick-orange/20 border border-kclick-orange/30 rounded-full px-4 py-2 mb-6">
              <Zap size={16} className="text-kclick-orange" />
              <span className="text-sm font-medium text-kclick-orange">Rejoignez +500 vendeurs actifs</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
              Vendez sur le plus grand
              <span className="text-kclick-orange"> marketplace</span> de la RDC
            </h1>

            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Kclick Business vous donne tous les outils pour créer, gérer et développer votre boutique en ligne.
              Atteignez des millions de clients à travers tout le pays.
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleGetStarted}
                className="inline-flex items-center gap-2 bg-kclick-orange hover:bg-kclick-orange-dark text-white font-bold px-8 py-4 rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-kclick-orange/30"
              >
                {user ? 'Accéder au portail' : 'Commencer gratuitement'}
                <ArrowRight size={20} />
              </button>
              <Link
                to="/"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-xl transition-all border border-white/20"
              >
                Retour au marketplace
              </Link>
            </div>

            <div className="flex items-center gap-6 mt-10 pt-10 border-t border-white/10">
              <div>
                <p className="text-3xl font-black text-white">500+</p>
                <p className="text-sm text-gray-400">Vendeurs actifs</p>
              </div>
              <div className="w-px h-12 bg-white/20" />
              <div>
                <p className="text-3xl font-black text-white">50K+</p>
                <p className="text-sm text-gray-400">Produits en ligne</p>
              </div>
              <div className="w-px h-12 bg-white/20" />
              <div>
                <p className="text-3xl font-black text-white">98%</p>
                <p className="text-sm text-gray-400">Satisfaction</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
              Tout ce dont vous avez besoin pour réussir
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Des outils puissants et simples d'utilisation pour gérer votre activité en ligne
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-kclick-peach hover:shadow-lg transition-all group"
              >
                <div className="w-12 h-12 bg-kclick-orange/10 rounded-xl flex items-center justify-center text-kclick-orange mb-4 group-hover:bg-kclick-orange group-hover:text-white transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6">
                Pourquoi vendre sur Kclick?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Rejoignez une communauté de vendeurs qui font confiance à Kclick pour développer leur activité en ligne.
              </p>

              <div className="space-y-4">
                {BENEFITS.map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                      <CheckCircle size={14} className="text-green-600" />
                    </div>
                    <span className="text-gray-700 font-medium">{benefit}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleGetStarted}
                className="mt-8 inline-flex items-center gap-2 bg-kclick-orange hover:bg-kclick-orange-dark text-white font-bold px-6 py-3 rounded-xl transition-all"
              >
                Créer ma boutique
                <ArrowRight size={18} />
              </button>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-kclick-orange/20 to-kclick-peach/20 rounded-3xl p-8">
                <img
                  src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?w=600"
                  alt="Vendeur Kclick"
                  className="rounded-2xl shadow-2xl"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <TrendingUp size={24} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Croissance moyenne</p>
                  <p className="text-xl font-black text-gray-900">+150%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              Ils nous font confiance
            </h2>
            <p className="text-lg text-gray-400">
              Découvrez les témoignages de nos vendeurs à succès
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((testimonial, idx) => (
              <div key={idx} className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-bold text-white">{testimonial.name}</p>
                    <p className="text-sm text-gray-400">{testimonial.store}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
              Comment ça marche?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Créez votre compte', desc: 'Inscription gratuite en 2 minutes' },
              { step: '2', title: 'Créez votre boutique', desc: 'Personnalisez votre espace de vente' },
              { step: '3', title: 'Ajoutez vos produits', desc: 'Uploadez photos et descriptions' },
              { step: '4', title: 'Commencez à vendre', desc: 'Recevez vos premières commandes' },
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="w-16 h-16 bg-kclick-orange text-white rounded-2xl flex items-center justify-center text-2xl font-black mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-kclick-orange to-kclick-orange-dark">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-6">
            Prêt à développer votre business?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Rejoignez Kclick Business aujourd'hui et commencez à vendre à des milliers de clients en RDC.
          </p>
          <button
            onClick={handleGetStarted}
            className="inline-flex items-center gap-2 bg-white text-kclick-orange font-bold px-8 py-4 rounded-xl transition-all transform hover:scale-105 shadow-lg"
          >
            {user ? 'Accéder au portail' : 'Créer ma boutique gratuitement'}
            <ArrowRight size={20} />
          </button>
        </div>
      </section>

      <footer className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src="/Kclick_LOGO-3.png" alt="Kclick" className="h-10 w-10" />
              <div>
                <div className="font-black text-xl text-kclick-orange">Kclick Business</div>
                <div className="text-gray-400 text-sm">Portail vendeur</div>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <Link to="/help" className="hover:text-white transition-colors">Aide</Link>
              <Link to="/legal" className="hover:text-white transition-colors">Conditions</Link>
              <Link to="/" className="hover:text-white transition-colors">Retour au marketplace</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
