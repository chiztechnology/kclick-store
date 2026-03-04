import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Package, Check, X, Loader, Scan, Barcode,
  Eye, EyeOff, Globe, FileText
} from 'lucide-react';
import { apiClient, storesService } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import ProductForm from '../../../components/ProductForm';
import type { Product, Category, Brand, ProductVariant } from '../../../types';

export default function ProductFormPage() {
  const { storeId, productId } = useParams<{ storeId: string; productId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = !!productId;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [store, setStore] = useState<any>(null);

  const [formData, setFormData] = useState<Partial<Product>>({
    store_id: storeId,
    is_active: true,
    stock: 0,
    price: 0,
    original_price: 0,
    discount_percent: 0,
    status: 'draft',
  });
  const [productImages, setProductImages] = useState<{ url: string; sort_order: number }[]>([]);
  const [productVariants, setProductVariants] = useState<Partial<ProductVariant>[]>([]);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const [barcodeInput, setBarcodeInput] = useState('');
  const [scanMode, setScanMode] = useState(false);
  const [scanBuffer, setScanBuffer] = useState('');
  const [lastKeyTime, setLastKeyTime] = useState(0);
  const barcodeRef = useRef<HTMLInputElement>(null);
  const scanBufferRef = useRef('');
  const lastKeyTimeRef = useRef(0);

  const notify = (msg: string, type: 'success' | 'error' = 'success') => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 3500);
  };

  useEffect(() => {
    const load = async () => {
      const [catRes, brandRes, storeRes] = await Promise.all([
        apiClient.get<Category[]>('/categories?is_active=true&order=sort_order'),
        apiClient.get<Brand[]>('/brands?is_active=true&order=name'),
        storesService.getById(storeId!),
      ]);
      setCategories(catRes.data || []);
      setBrands(brandRes.data || []);
      setStore(storeRes.data);

      if (isEdit && productId) {
        const { data } = await apiClient.get<Product & { product_images: any[]; product_variants: ProductVariant[] }>(
          `/products/${productId}?include=product_images,product_variants`
        );
        if (data) {
          setFormData({ ...data });
          setProductImages(data.product_images?.map((img: any) => ({ url: img.url, sort_order: img.sort_order })) || []);
          setProductVariants(data.product_variants || []);
          if (data.barcode) setBarcodeInput(data.barcode);
        }
        setLoading(false);
      }
    };
    load();
  }, [isEdit, productId, storeId]);

  const handleImageUpload = async (file: File): Promise<string> => {
    // const { data, error } = await apiClient.upload('/uploads/product-images', file, {
    const { data, error } = await apiClient.upload('/uploads', file, {
      storeId: storeId!,
    });
    if (error || !data) throw new Error(error?.message || 'Upload failed');
    return data.url;
  };

  const handleSave = async (status: 'draft' | 'published') => {
    if (!formData.name) { notify('Le nom est requis', 'error'); return; }
    if (!formData.category_id) { notify('La catégorie est requise', 'error'); return; }
    setSaving(true);
    try {
      const payload = {
        ...formData,
        store_id: storeId,
        // status,
        is_active: status === 'published',
        image_url: productImages[0]?.url || formData.image_url || '',
        slug: formData.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        barcode: barcodeInput || formData.barcode || null,
        // include product images in payload so backend can process them if supported
        product_images: productImages.map((img, i) => ({ url: img.url, sort_order: img.sort_order ?? i })),
      };

      let pid = productId;
      if (isEdit && productId) {
        const { error } = await apiClient.patch(`/products/${productId}`, payload);
        if (error) throw new Error(error.message);
      } else {
        const { data, error } = await apiClient.post<{ id: string }>('/products', payload);
        if (error || !data) throw new Error(error?.message || 'Failed to create product');
        pid = data.id;
      }

      if (pid && productImages.length > 0) {
        await apiClient.delete(`/product-images?product_id=${pid}`);
        for (let i = 0; i < productImages.length; i++) {
          const { data: imgData, error: imgError } = await apiClient.post<{ id: string; url: string }>('/product-images', {
            product_id: pid,
            url: productImages[i].url,
            sort_order: i,
          });
          if (i === 0 && imgData && payload.image_url) {
            await apiClient.patch(`/products/${pid}`, { image_url: imgData.url });
          }
        }
      }

      if (pid && productVariants.length > 0) {
        await apiClient.delete(`/product-variants?product_id=${pid}`);
        for (const v of productVariants) {
          if (v.name && v.value) {
            await apiClient.post('/product-variants', {
              product_id: pid,
              name: v.name,
              value: v.value,
              price_modifier: v.price_modifier || 0,
              stock: v.stock || 0,
            });
          }
        }
      }

      notify(status === 'draft' ? 'Brouillon sauvegardé' : isEdit ? 'Produit mis à jour' : 'Produit publié');
      setTimeout(() => navigate(`/business/store/${storeId}?tab=products`), 800);
    } catch (err) {
      console.error(err);
      notify('Erreur lors de la sauvegarde', 'error');
    } finally {
      setSaving(false);
    }
  };

  const applyBarcode = (code: string) => {
    const trimmed = code.trim();
    if (!trimmed) return;
    setBarcodeInput(trimmed);
    setFormData(prev => ({ ...prev, barcode: trimmed, sku: prev.sku || trimmed }));
    notify(`Code-barres capturé : ${trimmed}`);
  };

  useEffect(() => {
    if (!scanMode) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const now = Date.now();
      if (now - lastKeyTimeRef.current > 100) {
        scanBufferRef.current = '';
      }
      lastKeyTimeRef.current = now;

      if (e.key === 'Enter') {
        if (scanBufferRef.current.length > 3) {
          applyBarcode(scanBufferRef.current);
        }
        scanBufferRef.current = '';
        return;
      }
      if (e.key.length === 1) {
        scanBufferRef.current += e.key;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scanMode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 text-white font-medium ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {notification.type === 'success' ? <Check size={16} /> : <X size={16} />}
          {notification.msg}
        </div>
      )}

      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to={`/business/store/${storeId}?tab=products`}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft size={18} />
              <span className="text-sm font-medium hidden sm:block">{store?.name || 'Produits'}</span>
            </Link>
            <div className="h-5 w-px bg-gray-200" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center">
                <Package size={14} className="text-white" />
              </div>
              <h1 className="font-black text-gray-900 text-lg">
                {isEdit ? 'Modifier le produit' : 'Nouveau produit'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSave('draft')}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-semibold rounded-xl text-sm transition-colors disabled:opacity-50"
            >
              <FileText size={14} />
              <span className="hidden sm:block">Brouillon</span>
            </button>
            <button
              onClick={() => handleSave('published')}
              disabled={saving}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-bold px-5 py-2 rounded-xl text-sm transition-colors"
            >
              {saving ? <Loader size={14} className="animate-spin" /> : <Globe size={14} />}
              {isEdit ? 'Mettre à jour' : 'Publier'}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-5 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Barcode size={18} className="text-orange-500" />
              <h3 className="font-bold text-gray-900 text-sm">Code-barres / SKU</h3>
            </div>
            <button
              onClick={() => setScanMode(!scanMode)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all ${scanMode ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600 hover:border-orange-400'}`}
            >
              <Scan size={13} />
              {scanMode ? 'Scan actif — pointez le lecteur' : 'Activer le scanner'}
            </button>
          </div>

          {scanMode && (
            <div className="mb-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <p className="text-sm text-green-800 font-medium">
                Scanner actif — Pointez votre lecteur de code-barres sur le produit. Le code sera capturé automatiquement.
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <div className="relative flex-1">
              <Barcode size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                ref={barcodeRef}
                type="text"
                value={barcodeInput}
                onChange={e => setBarcodeInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    applyBarcode(barcodeInput);
                    e.preventDefault();
                  }
                }}
                placeholder="Scannez ou saisissez le code-barres (EAN, UPC, QR...)"
                className="input pl-9 font-mono"
              />
            </div>
            <button
              onClick={() => applyBarcode(barcodeInput)}
              className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              Appliquer
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Connectez votre lecteur USB — il envoie le code comme une frappe clavier. Appuyez sur Entree ou cliquez Appliquer pour valider.
          </p>
        </div>

        <ProductForm
          product={isEdit ? (formData as Product) : null}
          categories={categories}
          stores={store ? [store] : []}
          brands={brands}
          productImages={productImages}
          productVariants={productVariants}
          onImagesChange={setProductImages}
          onVariantsChange={setProductVariants}
          onImageUpload={handleImageUpload}
          onChange={setFormData}
          formData={formData}
          hideStoreSelect={true}
          storeId={storeId}
        />

        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            onClick={() => handleSave('draft')}
            disabled={saving}
            className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-semibold rounded-xl transition-colors disabled:opacity-50"
          >
            <FileText size={16} /> Sauvegarder brouillon
          </button>
          <button
            onClick={() => handleSave('published')}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl transition-colors"
          >
            {saving ? <Loader size={16} className="animate-spin" /> : <Globe size={16} />}
            {isEdit ? 'Mettre à jour et publier' : 'Publier le produit'}
          </button>
          <Link
            to={`/business/store/${storeId}?tab=products`}
            className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-colors text-sm"
          >
            Annuler
          </Link>
        </div>
      </div>
    </div>
  );
}
