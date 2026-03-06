import { useState, useRef } from 'react';
import { Camera, Save, Upload } from 'lucide-react';
import type { Store } from '../../../types';
import * as businessService from '../services/businessService';

interface StoreSettingsTabProps {
  store: Store;
  userId: string;
  onRefresh: () => void;
  showNotification: (message: string, type?: 'success' | 'error') => void;
}

export default function StoreSettingsTab({ store, userId, onRefresh, showNotification }: StoreSettingsTabProps) {
  const [name, setName] = useState(store.name);
  const [city, setCity] = useState(store.city);
  const [phone, setPhone] = useState(store.phone || '');
  const [email, setEmail] = useState(store.email || '');
  const [address, setAddress] = useState(store.address || '');
  const [description, setDescription] = useState(store.description || '');
  const [shippingPolicy, setShippingPolicy] = useState(store.shipping_policy || '');
  const [returnPolicy, setReturnPolicy] = useState(store.return_policy || '');
  const [logoUrl, setLogoUrl] = useState(store.logo_url || '');
  const [coverUrl, setCoverUrl] = useState(store.cover_image_url || '');
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const url = await businessService.uploadStoreImage(file);
      setLogoUrl(url);
      showNotification('Logo mis a jour');
    } catch {
      showNotification('Erreur lors du telechargement du logo', 'error');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    try {
      const url = await businessService.uploadStoreImage(file);
      setCoverUrl(url);
      showNotification('Image de couverture mise a jour');
    } catch {
      showNotification('Erreur lors du telechargement de la couverture', 'error');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates: Record<string, unknown> = {};

      if (name !== store.name) updates.name = name;
      if (city !== store.city) updates.city = city;
      if (phone !== (store.phone || '')) updates.phone = phone;
      if (email !== (store.email || '')) updates.email = email;
      if (address !== (store.address || '')) updates.address = address;
      if (description !== (store.description || '')) updates.description = description;
      if (shippingPolicy !== (store.shipping_policy || '')) updates.shipping_policy = shippingPolicy;
      if (returnPolicy !== (store.return_policy || '')) updates.return_policy = returnPolicy;
      if (logoUrl !== (store.logo_url || '')) updates.logo_url = logoUrl;
      if (coverUrl !== (store.cover_image_url || '')) updates.cover_image_url = coverUrl;

      if (Object.keys(updates).length === 0) {
        showNotification('Aucune modification detectee');
        setSaving(false);
        return;
      }

      await businessService.updateStoreProfile(store.id, updates);
      showNotification('Profil de la boutique mis a jour');
      onRefresh();
    } catch {
      showNotification('Erreur lors de la sauvegarde', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div
          className="relative h-48 bg-gray-100 cursor-pointer group"
          onClick={() => coverInputRef.current?.click()}
        >
          {coverUrl ? (
            <img src={coverUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
              <Upload size={32} />
              <span className="text-sm mt-2">Ajouter une image de couverture</span>
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            {uploadingCover ? (
              <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <div className="text-white flex flex-col items-center">
                <Camera size={24} />
                <span className="text-sm mt-1">Changer la couverture</span>
              </div>
            )}
          </div>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            onChange={handleCoverUpload}
            className="hidden"
          />
        </div>

        <div className="px-6 pb-6 -mt-12 relative z-10">
          <div
            className="w-24 h-24 rounded-2xl border-4 border-white bg-gray-100 overflow-hidden cursor-pointer group relative shadow-lg"
            onClick={() => logoInputRef.current?.click()}
          >
            {logoUrl ? (
              <img src={logoUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <Camera size={28} />
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
              {uploadingLogo ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Camera size={20} className="text-white" />
              )}
            </div>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">Cliquez pour modifier le logo</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="font-bold text-gray-900 text-lg mb-6">Informations de la boutique</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Nom de la boutique
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-kclick-orange transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Ville
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-kclick-orange transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Telephone
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-kclick-orange transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-kclick-orange transition-colors"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Adresse
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-kclick-orange transition-colors resize-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-kclick-orange transition-colors resize-none"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="font-bold text-gray-900 text-lg mb-6">Politiques</h3>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Politique de livraison
            </label>
            <textarea
              value={shippingPolicy}
              onChange={(e) => setShippingPolicy(e.target.value)}
              rows={4}
              placeholder="Decrivez votre politique de livraison..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-kclick-orange transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Politique de retour
            </label>
            <textarea
              value={returnPolicy}
              onChange={(e) => setReturnPolicy(e.target.value)}
              rows={4}
              placeholder="Decrivez votre politique de retour..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-kclick-orange transition-colors resize-none"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-kclick-orange hover:bg-kclick-orange/90 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold px-8 py-3 rounded-xl transition-colors"
        >
          <Save size={18} />
          {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </button>
      </div>
    </div>
  );
}
