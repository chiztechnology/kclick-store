import { Link } from 'react-router-dom';
import { ShoppingBag, Store, Truck, Shield, Star, Users, ArrowRight, Smartphone, Globe, CreditCard, HeadphonesIcon, ChevronRight } from 'lucide-react';
import phoneMockup from '/assets/ecommerce - presentation screenshot.png';
import qrPlaystore from '/assets/qrcode-sample.png';
import qrAppstore from '/assets/qrcode-sample.png';
import { ECOMMERCE_URL } from '../apps/business/pages/BusinessStoreDashboard';

const stats = [
    { value: '2,500+', label: 'Boutiques actives', icon: Store },
    { value: '150K+', label: 'Produits disponibles', icon: ShoppingBag },
    { value: '500K+', label: 'Clients satisfaits', icon: Users },
    { value: '98%', label: 'Taux de satisfaction', icon: Star },
];

const features = [
    {
        icon: Store,
        title: 'Marketplace Multi-Vendeurs',
        description: 'Des milliers de boutiques réunies sur une seule plateforme pour une expérience shopping unique.',
    },
    {
        icon: Truck,
        title: 'Livraison Rapide',
        description: 'Recevez vos commandes rapidement grâce à notre réseau de livreurs partenaires dans toute la ville.',
    },
    {
        icon: Shield,
        title: 'Paiement Sécurisé',
        description: 'Transactions protégées avec Mobile Money, cartes bancaires et paiement à la livraison.',
    },
    {
        icon: CreditCard,
        title: 'Mobile Money Intégré',
        description: 'Payez facilement via Airtel Money, M-Pesa, Orange Money et bien plus encore.',
    },
    {
        icon: Globe,
        title: 'Disponible Partout',
        description: 'Accessible depuis Kinshasa, Lubumbashi, Goma et toutes les grandes villes du Congo.',
    },
    {
        icon: HeadphonesIcon,
        title: 'Support 24/7',
        description: 'Notre équipe est disponible à tout moment pour vous accompagner dans vos achats.',
    },
];

const howItWorks = [
    { step: '01', title: 'Créez votre compte', description: 'Inscrivez-vous gratuitement en quelques secondes.' },
    { step: '02', title: 'Parcourez les boutiques', description: 'Explorez des milliers de produits de vendeurs vérifiés.' },
    { step: '03', title: 'Commandez & Payez', description: 'Ajoutez au panier et payez avec votre méthode préférée.' },
    { step: '04', title: 'Recevez chez vous', description: 'Suivez votre commande et recevez-la rapidement.' },
];

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2">
                            <img src="/Kclick_LOGO-1.png" alt="KClick" className="h-9" />
                        </div>
                        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
                            <a href="#features" className="hover:text-kclick-orange transition-colors">Fonctionnalités</a>
                            <a href="#how-it-works" className="hover:text-kclick-orange transition-colors">Comment ça marche</a>
                            <a href="#download" className="hover:text-kclick-orange transition-colors">Télécharger</a>
                            <Link to="/login" className="hover:text-kclick-orange transition-colors">Connexion</Link>
                        </div>
                        <Link
                            to="/confirm-account-conversion"
                            className="bg-gradient-brand text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:shadow-glow-orange transition-all duration-300 hover:scale-105"
                        >
                            Devenir Vendeur
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                {/* Background decorations */}
                <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-kclick-peach-light/30 rounded-full blur-3xl -z-10" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-kclick-orange/5 rounded-full blur-3xl -z-10" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8">
                            <div className="inline-flex items-center gap-2 bg-kclick-orange/10 text-kclick-orange px-4 py-2 rounded-full text-sm font-semibold">
                                <Smartphone className="w-4 h-4" />
                                Disponible sur iOS & Android
                            </div>
                            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-gray-900 leading-[1.05]">
                                Le shopping
                                <span className="block bg-gradient-to-r from-kclick-orange to-kclick-orange-light bg-clip-text text-transparent">
                                    réinventé.
                                </span>
                            </h1>
                            <p className="text-lg text-gray-500 leading-relaxed max-w-lg">
                                KCLICK est la première marketplace congolaise qui connecte acheteurs et vendeurs.
                                Découvrez des milliers de produits livrés directement chez vous.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link
                                    to="/login"
                                    className="bg-kclick-orange text-white px-8 py-4 rounded-2xl text-base font-bold hover:shadow-glow-orange transition-all duration-300 hover:scale-105 flex items-center gap-2"
                                >
                                    Commencer maintenant
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                                <a
                                    href="#download"
                                    className="bg-gray-900 text-white px-8 py-4 rounded-2xl text-base font-bold hover:bg-gray-800 transition-all duration-300 flex items-center gap-2"
                                >
                                    <Smartphone className="w-5 h-5" />
                                    Télécharger l'app
                                </a>
                            </div>

                            {/* Mini stats */}
                            <div className="flex gap-8 pt-4">
                                {stats.slice(0, 3).map((stat) => (
                                    <div key={stat.label}>
                                        <div className="text-2xl font-black text-gray-900">{stat.value}</div>
                                        <div className="text-xs text-gray-400 font-medium">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Phone mockup */}
                        <div className="relative flex justify-center lg:justify-end">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-kclick-orange/20 to-kclick-peach/20 rounded-[3rem] blur-2xl scale-110" />
                                <img
                                    src={phoneMockup}
                                    alt="KCLICK App"
                                    className="relative w-[340px] sm:w-[600px] drop-shadow-2xl animate-fade-in"
                                />
                            </div>
                            {/* Floating badges */}
                            <div className="absolute top-10 -left-4 bg-white rounded-2xl shadow-card-hover px-4 py-3 flex items-center gap-3 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-gray-900">Paiement sécurisé</div>
                                    <div className="text-xs text-gray-400">100% protégé</div>
                                </div>
                            </div>
                            <div className="absolute bottom-20 -left-8 bg-white rounded-2xl shadow-card-hover px-4 py-3 flex items-center gap-3 animate-fade-in" style={{ animationDelay: '0.6s' }}>
                                <div className="w-10 h-10 rounded-xl bg-kclick-orange/10 flex items-center justify-center">
                                    <Star className="w-5 h-5 text-kclick-orange" />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-gray-900">4.8/5 étoiles</div>
                                    <div className="text-xs text-gray-400">+10K avis</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Bar */}
            <section className="py-16 bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat) => (
                            <div key={stat.label} className="text-center">
                                <stat.icon className="w-8 h-8 text-kclick-orange mx-auto mb-3" />
                                <div className="text-3xl font-black text-white">{stat.value}</div>
                                <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="py-24 bg-surface-secondary">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="text-kclick-orange font-semibold text-sm uppercase tracking-wider">Fonctionnalités</span>
                        <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mt-3">
                            Tout ce dont vous avez besoin
                        </h2>
                        <p className="text-gray-500 mt-4 max-w-2xl mx-auto text-lg">
                            Une plateforme complète pour acheter et vendre en toute simplicité.
                        </p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature) => (
                            <div
                                key={feature.title}
                                className="bg-white rounded-2xl p-7 border border-gray-100 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 group"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-gradient-brand flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                                    <feature.icon className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section id="how-it-works" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="text-kclick-orange font-semibold text-sm uppercase tracking-wider">Comment ça marche</span>
                        <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mt-3">
                            Simple comme 1, 2, 3, 4
                        </h2>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {howItWorks.map((item, i) => (
                            <div key={item.step} className="relative text-center group">
                                <div className="text-6xl font-black text-kclick-peach-light group-hover:text-kclick-orange/20 transition-colors duration-300">
                                    {item.step}
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mt-2">{item.title}</h3>
                                <p className="text-gray-500 text-sm mt-2">{item.description}</p>
                                {i < howItWorks.length - 1 && (
                                    <ChevronRight className="hidden lg:block absolute top-8 -right-4 w-6 h-6 text-gray-300" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Become Seller CTA */}
            <section className="py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-kclick-orange/10 rounded-full blur-3xl" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="max-w-3xl mx-auto text-center">
                        <span className="inline-flex items-center gap-2 bg-kclick-orange/20 text-kclick-orange px-4 py-2 rounded-full text-sm font-semibold mb-6">
                            <Store className="w-4 h-4" />
                            Opportunité
                        </span>
                        <h2 className="text-4xl sm:text-5xl font-black text-white">
                            Vendez sur <span className="text-kclick-orange">KCLICK</span>
                        </h2>
                        <p className="text-gray-400 text-lg mt-6 max-w-2xl mx-auto">
                            Rejoignez plus de 2 500 vendeurs qui font confiance à KCLICK. Créez votre boutique en ligne,
                            touchez des milliers de clients et développez votre activité.
                        </p>
                        <div className="mt-10">
                            <Link
                                to="/confirm-account-conversion"
                                className="inline-flex items-center gap-3 bg-kclick-orange text-white px-10 py-5 rounded-2xl text-lg font-bold hover:shadow-glow-orange transition-all duration-300 hover:scale-105"
                            >
                                Devenir Vendeur
                                <ArrowRight className="w-6 h-6" />
                            </Link>
                        </div>
                        <div className="flex justify-center gap-12 mt-12 text-center">
                            <div>
                                <div className="text-3xl font-black text-white">0%</div>
                                <div className="text-sm text-gray-400 mt-1">Frais d'inscription</div>
                            </div>
                            <div>
                                <div className="text-3xl font-black text-white">24h</div>
                                <div className="text-sm text-gray-400 mt-1">Activation boutique</div>
                            </div>
                            {/* <div>
                <div className="text-3xl font-black text-white">5%</div>
                <div className="text-sm text-gray-400 mt-1">Commission seulement</div>
              </div> */}
                        </div>
                    </div>
                </div>
            </section>

            {/* Download Section */}
            <section id="download" className="py-24 bg-surface-secondary">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <span className="text-kclick-orange font-semibold text-sm uppercase tracking-wider">Télécharger</span>
                        <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mt-3">
                            Téléchargez l'application
                        </h2>
                        <p className="text-gray-500 mt-4 text-lg">
                            Scannez le QR code ou cliquez sur les boutons ci-dessous.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-12">
                        {/* Play Store */}
                        <div className="bg-white rounded-3xl p-8 shadow-card hover:shadow-card-hover transition-all duration-300 text-center">
                            <img src={qrPlaystore} alt="QR Code Play Store" className="w-40 h-40 mx-auto mb-4 rounded-xl" />
                            <div className="font-bold text-gray-900 mb-1">Google Play Store</div>
                            <div className="text-sm text-gray-400 mb-4">Android</div>
                            <a href="#" className="inline-block">
                                <img src="/playstore.png" alt="Google Play" className="h-12 mx-auto" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                            </a>
                        </div>

                        {/* App Store */}
                        <div className="bg-white rounded-3xl p-8 shadow-card hover:shadow-card-hover transition-all duration-300 text-center">
                            <img src={qrAppstore} alt="QR Code App Store" className="w-40 h-40 mx-auto mb-4 rounded-xl" />
                            <div className="font-bold text-gray-900 mb-1">Apple App Store</div>
                            <div className="text-sm text-gray-400 mb-4">iOS</div>
                            <a href="#" className="inline-block">
                                <img src="/appstore.png" alt="App Store" className="h-12 mx-auto" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white pt-16 pb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-gray-800">
                        {/* Brand */}
                        <div>
                            <img src="/Kclick_LOGO-2.png" alt="KClick" className="h-10 mb-4" onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                            }} />
                            <p className="text-gray-400 text-sm leading-relaxed">
                                La première marketplace congolaise. Achetez et vendez en toute confiance.
                            </p>
                        </div>

                        {/* Liens utiles */}
                        <div>
                            <h4 className="font-bold text-white mb-4">Liens Utiles</h4>
                            <ul className="space-y-3 text-sm text-gray-400">
                                <li><a href="#features" className="hover:text-kclick-orange transition-colors">Fonctionnalités</a></li>
                                <li><a href="#how-it-works" className="hover:text-kclick-orange transition-colors">Comment ça marche</a></li>
                                <li><a href="#download" className="hover:text-kclick-orange transition-colors">Télécharger l'app</a></li>
                                <li><Link to="/confirm-account-conversion" className="hover:text-kclick-orange transition-colors">Devenir Vendeur</Link></li>
                            </ul>
                        </div>

                        {/* Légal */}
                        <div>
                            <h4 className="font-bold text-white mb-4">Légal</h4>
                            <ul className="space-y-3 text-sm text-gray-400">
                                <li><a href={ECOMMERCE_URL + '/legal?type=confidentialite'} target="_blank" className="hover:text-kclick-orange transition-colors">Politique de Confidentialité</a></li>
                                <li><a href={ECOMMERCE_URL + '/legal?type=mentions'} target="_blank" className="hover:text-kclick-orange transition-colors">Mentions Légales</a></li>
                                <li><a href={ECOMMERCE_URL + '/legal?type=cookies'} target="_blank" className="hover:text-kclick-orange transition-colors">Politique de Cookies</a></li>
                            </ul>
                        </div>

                        {/* Contact */}
                        <div>
                            <h4 className="font-bold text-white mb-4">Contact</h4>
                            <ul className="space-y-3 text-sm text-gray-400">
                                <li>📧 contact@kclick.co</li>
                                <li>📞 +243 XXX XXX XXX</li>
                                <li>📍 Kinshasa, RD Congo</li>
                            </ul>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between pt-8 text-sm text-gray-500">
                        <p>© {new Date().getFullYear()} KCLICK. Tous droits réservés.</p>
                        <div className="flex gap-6 mt-4 sm:mt-0">
                            <a href="#" className="hover:text-kclick-orange transition-colors">Facebook</a>
                            <a href="#" className="hover:text-kclick-orange transition-colors">Instagram</a>
                            <a href="#" className="hover:text-kclick-orange transition-colors">Twitter</a>
                            <a href="#" className="hover:text-kclick-orange transition-colors">TikTok</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}