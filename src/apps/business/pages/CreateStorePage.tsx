import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Store, CheckCircle, X, Upload, AlertTriangle,
  MapPin, Phone, Mail, FileText, Image as ImageIcon, Info,
  Loader, Send
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { apiClient, storesService } from '../../../lib/api';
import { createSlug } from '../../../lib/utils';
import ImageUpload from '../components/ImageUpload';

interface StoreForm {
  name: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  logo_url: string;
  cover_url: string;
}

const CITIES = ['Kinshasa', 'Lubumbashi', 'Goma', 'Bukavu', 'Kisangani', 'Mbuji-Mayi', 'Kananga', 'Matadi', 'Boma', 'Autre'];

export default function CreateStorePage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [form, setForm] = useState<StoreForm>({
    name: '',
    description: '',
    phone: '',
    email: user?.email || '',
    address: '',
    city: 'Kinshasa',
    logo_url: '',
    cover_url: '',
  });
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!user) navigate('/business');
  }, [user, navigate]);

  const set = (patch: Partial<StoreForm>) => setForm(p => ({ ...p, ...patch }));

  const notify = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleUploadImage = async (file: File, type: 'logo' | 'cover') => {
    if (!user) throw new Error('Not authenticated');
    // const { data, error } = await apiClient.upload('/uploads/store-images', file, {
    const { data, error } = await apiClient.upload('/uploads', file, {
      type,
      userId: user.id,
    });
    if (error || !data) throw new Error(error?.message || 'Upload failed');
    return data.url;
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) { notify('Le nom de la boutique est requis', 'error'); return; }
    if (!form.cover_url) { notify("L'image de couverture est requise", 'error'); return; }

    setSaving(true);
    try {
      const { error } = await storesService.create({
        name: form.name.trim(),
        description: form.description,
        phone: form.phone,
        email: form.email || user?.email,
        address: form.address,
        city: form.city,
        logo_url: form.logo_url || null,
        cover_url: form.cover_url,
        owner_id: user?.id,
        is_active: false,
        is_verified: false,
        status: 'pending',
        rating: 0,
        review_count: 0,
        product_count: 0,
        slug : createSlug(form.name.trim())
      });

      if (error) throw new Error(error.message);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      notify('Erreur lors de la création de la boutique', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-10 text-center text-white">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={40} className="text-white" />
            </div>
            <h1 className="text-2xl font-black mb-2">Demande envoyée !</h1>
            <p className="text-green-100">Votre boutique a été soumise pour examen.</p>
          </div>
          <div className="p-8">
            <h2 className="font-bold text-gray-900 text-lg mb-4">Prochaines étapes</h2>
            <div className="space-y-3 mb-8">
              <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-semibold mb-1">Documents KYC requis</p>
                  <p className="text-amber-700">Pour finaliser la vérification, envoyez les documents suivants par email :</p>
                  <ul className="mt-2 space-y-1 list-none">
                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0" />Registre de commerce</li>
                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0" />Identifiant fiscal (numéro fiscal)</li>
                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0" />Pièce d'identité (CNI, passeport)</li>
                  </ul>
                </div>
              </div>
              <a
                href="mailto:ecommerce@kennysinternational.com?subject=Documents KYC — Boutique"
                className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl hover:border-kclick-orange hover:bg-orange-50 transition-all group"
              >
                <div className="w-10 h-10 bg-kclick-orange/10 rounded-xl flex items-center justify-center group-hover:bg-kclick-orange/20">
                  <Mail size={18} className="text-kclick-orange" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Envoyer les documents</p>
                  <p className="text-xs text-gray-500">ecommerce@kennysinternational.com</p>
                </div>
              </a>
            </div>
            <Link
              to="/business/portal"
              className="w-full flex items-center justify-center gap-2 bg-kclick-orange hover:bg-kclick-orange-dark text-white font-bold py-3.5 rounded-xl transition-colors"
            >
              Retour à mes boutiques
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 text-white font-medium transition-all ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {notification.type === 'success' ? <CheckCircle size={16} /> : <X size={16} />}
          {notification.message}
        </div>
      )}

      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            to="/business/portal"
            className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Mes boutiques</span>
          </Link>
          <div className="h-5 w-px bg-gray-200" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-kclick-orange rounded-lg flex items-center justify-center">
              <Store size={14} className="text-white" />
            </div>
            <h1 className="font-black text-gray-900 text-lg">Créer une boutique</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 space-y-5">

            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 bg-gray-50/50">
                <Store size={16} className="text-kclick-orange" />
                <h3 className="font-bold text-gray-900 text-sm">Informations générales</h3>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nom de la boutique *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => set({ name: e.target.value })}
                    placeholder="Ex: Ma Super Boutique"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-kclick-orange text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                  <textarea
                    value={form.description}
                    onChange={e => set({ description: e.target.value })}
                    rows={3}
                    placeholder="Décrivez votre boutique, ce que vous vendez, votre spécialité..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-kclick-orange text-sm resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email de contact</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => set({ email: e.target.value })}
                      placeholder="contact@maboutique.com"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-kclick-orange text-sm"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 bg-gray-50/50">
                <MapPin size={16} className="text-kclick-orange" />
                <h3 className="font-bold text-gray-900 text-sm">Localisation & Contact</h3>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ville</label>
                    <select
                      value={form.city}
                      onChange={e => set({ city: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-kclick-orange text-sm"
                    >
                      {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Téléphone</label>
                    <div className="relative">
                      <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={e => set({ phone: e.target.value })}
                        placeholder="+243 ..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-kclick-orange text-sm"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Adresse</label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={e => set({ address: e.target.value })}
                    placeholder="Av. de la Victoire, Commune de Gombe..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-kclick-orange text-sm"
                  />
                </div>
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 bg-gray-50/50">
                <ImageIcon size={16} className="text-kclick-orange" />
                <h3 className="font-bold text-gray-900 text-sm">Images</h3>
              </div>
              <div className="p-5 space-y-5">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex gap-2">
                  <Info size={14} className="text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-800">
                    <span className="font-semibold">Logo</span> recommandé : <span className="font-mono bg-blue-100 px-1 rounded">400 × 400 px</span> (carré).
                    <span className="font-semibold ml-3">Couverture</span> : <span className="font-mono bg-blue-100 px-1 rounded">1200 × 400 px</span> (paysage).
                  </div>
                </div>
                <ImageUpload
                  label="Logo de la boutique (optionnel)"
                  value={form.logo_url}
                  onChange={url => set({ logo_url: url || '' })}
                  onUpload={file => handleUploadImage(file, 'logo')}
                />
                <ImageUpload
                  label="Image de couverture *"
                  value={form.cover_url}
                  onChange={url => set({ cover_url: url || '' })}
                  onUpload={file => handleUploadImage(file, 'cover')}
                />
              </div>
            </section>

          </div>

          <div className="space-y-5">

            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 bg-gray-50/50">
                <FileText size={16} className="text-kclick-orange" />
                <h3 className="font-bold text-gray-900 text-sm">Documents KYC</h3>
              </div>
              <div className="p-5">
                <p className="text-sm text-gray-600 mb-4">
                  Pour valider l'authenticité de votre boutique, notre équipe aura besoin de vérifier les documents suivants :
                </p>
                <ul className="space-y-2.5 mb-5">
                  {[
                    { label: 'Registre de commerce', desc: 'Document officiel d\'enregistrement' },
                    { label: 'Identifiant fiscal', desc: 'Numéro fiscal / NIF' },
                    { label: "Pièce d'identité", desc: 'CNI, passeport ou permis de conduire' },
                  ].map(doc => (
                    <li key={doc.label} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{doc.label}</p>
                        <p className="text-xs text-gray-500">{doc.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-sm font-semibold text-amber-900 mb-1">Envoi par email</p>
                  <p className="text-xs text-amber-700 mb-3">
                    Après soumission, envoyez vos documents à :
                  </p>
                  <a
                    href="mailto:ecommerce@kennysinternational.com?subject=Documents KYC — Vérification boutique"
                    className="flex items-center gap-2 text-sm font-bold text-kclick-orange hover:underline"
                  >
                    <Mail size={14} />
                    ecommerce@kennysinternational.com
                  </a>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5">
                <div className="flex items-start gap-3 mb-5 p-3 bg-gray-50 rounded-xl">
                  <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-600">
                    Votre boutique sera en <span className="font-semibold">examen</span> jusqu'à validation par l'équipe Kclick. Vous pouvez suivre le statut depuis votre portail.
                  </p>
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={saving || !form.name.trim() || !form.cover_url}
                  className="w-full flex items-center justify-center gap-2 bg-kclick-orange hover:bg-kclick-orange-dark disabled:bg-gray-300 text-white font-bold py-3.5 rounded-xl transition-colors"
                >
                  {saving ? (
                    <><Loader size={16} className="animate-spin" /> Création...</>
                  ) : (
                    <><Send size={16} /> Soumettre pour examen</>
                  )}
                </button>
                <Link
                  to="/business/portal"
                  className="w-full mt-3 flex items-center justify-center py-3 border border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-colors text-sm"
                >
                  Annuler
                </Link>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
