import React, { useState, useEffect } from 'react';
import {
  Package, Tag, DollarSign, Layers, Truck, Shield, Globe, Ruler,
  Scale, Palette, Users, Info, Image, Plus, X, ChevronDown, ChevronUp,
  Sparkles, AlertCircle, Clock
} from 'lucide-react';
import type { Product, Category, Store, Brand, ProductVariant, ProductImage } from '../types';

interface ProductFormProps {
  product?: Product | null;
  categories: Category[];
  stores: Store[];
  brands?: Brand[];
  productImages: { url: string; sort_order: number }[];
  productVariants: Partial<ProductVariant>[];
  onImagesChange: (images: { url: string; sort_order: number }[]) => void;
  onVariantsChange: (variants: Partial<ProductVariant>[]) => void;
  onImageUpload: (file: File) => Promise<string>;
  onChange: (data: Partial<Product>) => void;
  formData: Partial<Product>;
  hideStoreSelect?: boolean;
  storeId?: string;
}

const GENDER_OPTIONS = [
  { value: 'unisex', label: 'Unisexe' },
  { value: 'men', label: 'Homme' },
  { value: 'women', label: 'Femme' },
  { value: 'kids', label: 'Enfant' },
  { value: 'baby', label: 'Bebe' },
];

const AGE_GROUP_OPTIONS = [
  { value: 'adult', label: 'Adulte' },
  { value: 'teen', label: 'Adolescent' },
  { value: 'kids', label: 'Enfant' },
  { value: 'toddler', label: 'Bambin' },
  { value: 'infant', label: 'Nourrisson' },
  { value: 'newborn', label: 'Nouveau-ne' },
];

const CONDITION_OPTIONS = [
  { value: 'new', label: 'Neuf' },
  { value: 'refurbished', label: 'Reconditionne' },
  { value: 'used', label: 'Occasion' },
  { value: 'open_box', label: 'Boite ouverte' },
];

const SHIPPING_CLASS_OPTIONS = [
  { value: 'standard', label: 'Standard' },
  { value: 'express', label: 'Express' },
  { value: 'freight', label: 'Fret' },
  { value: 'digital', label: 'Digital' },
];

const WEIGHT_UNIT_OPTIONS = [
  { value: 'kg', label: 'Kilogrammes (kg)' },
  { value: 'g', label: 'Grammes (g)' },
  { value: 'lb', label: 'Livres (lb)' },
  { value: 'oz', label: 'Onces (oz)' },
];

const COLOR_PALETTE = [
  { name: 'Noir', hex: '#000000' },
  { name: 'Blanc', hex: '#FFFFFF' },
  { name: 'Gris', hex: '#6B7280' },
  { name: 'Gris clair', hex: '#D1D5DB' },
  { name: 'Rouge', hex: '#EF4444' },
  { name: 'Rouge foncé', hex: '#991B1B' },
  { name: 'Rose', hex: '#EC4899' },
  { name: 'Rose clair', hex: '#FBCFE8' },
  { name: 'Orange', hex: '#F97316' },
  { name: 'Jaune', hex: '#EAB308' },
  { name: 'Vert', hex: '#22C55E' },
  { name: 'Vert foncé', hex: '#166534' },
  { name: 'Bleu', hex: '#3B82F6' },
  { name: 'Bleu foncé', hex: '#1E3A8A' },
  { name: 'Cyan', hex: '#06B6D4' },
  { name: 'Turquoise', hex: '#14B8A6' },
  { name: 'Marron', hex: '#92400E' },
  { name: 'Beige', hex: '#F5F0E8' },
  { name: 'Bordeaux', hex: '#7F1D1D' },
  { name: 'Kaki', hex: '#65a30d' },
  { name: 'Marine', hex: '#1e3a5f' },
  { name: 'Camel', hex: '#C19A6B' },
  { name: 'Corail', hex: '#FF6B6B' },
  { name: 'Or', hex: '#D4AF37' },
  { name: 'Argent', hex: '#C0C0C0' },
  { name: 'Lavande', hex: '#E6E6FA' },
  { name: 'Ivoire', hex: '#FFFFF0' },
  { name: 'Fuchsia', hex: '#D946EF' },
];

function parseColors(colorStr: string | undefined): string[] {
  if (!colorStr) return [];
  return colorStr.split(',').map(c => c.trim()).filter(Boolean);
}

function serializeColors(colors: string[]): string {
  return colors.join(',');
}

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function FormSection({ title, icon, children, defaultOpen = true }: SectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-gray-500">{icon}</span>
          <span className="font-semibold text-gray-900">{title}</span>
        </div>
        {isOpen ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
      </button>
      {isOpen && (
        <div className="p-4 space-y-4 bg-white">
          {children}
        </div>
      )}
    </div>
  );
}

export default function ProductForm({
  product,
  categories,
  stores,
  brands = [],
  productImages,
  productVariants,
  onImagesChange,
  onVariantsChange,
  onImageUpload,
  onChange,
  formData,
  hideStoreSelect = false,
  storeId
}: ProductFormProps) {
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newFeature, setNewFeature] = useState('');
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');

  useEffect(() => {
    if (storeId && !formData.store_id) {
      onChange({ ...formData, store_id: storeId });
    }
  }, [storeId]);

  const handleImageAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    try {
      const newImages = [...productImages];
      for (let i = 0; i < files.length; i++) {
        const url = await onImageUpload(files[i]);
        newImages.push({ url, sort_order: newImages.length });
      }
      onImagesChange(newImages);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageRemove = (index: number) => {
    onImagesChange(productImages.filter((_, i) => i !== index));
  };

  const handleAddVariant = () => {
    onVariantsChange([...productVariants, { name: '', value: '', price_modifier: 0, stock: 0 }]);
  };

  const handleVariantChange = (index: number, field: string, value: string | number) => {
    const updated = [...productVariants];
    updated[index] = { ...updated[index], [field]: value };
    onVariantsChange(updated);
  };

  const handleRemoveVariant = (index: number) => {
    onVariantsChange(productVariants.filter((_, i) => i !== index));
  };

  const handleAddFeature = () => {
    if (!newFeature.trim()) return;
    const features = formData.features || [];
    onChange({ ...formData, features: [...features, newFeature.trim()] });
    setNewFeature('');
  };

  const handleRemoveFeature = (index: number) => {
    const features = formData.features || [];
    onChange({ ...formData, features: features.filter((_, i) => i !== index) });
  };

  const handleAddSpec = () => {
    if (!newSpecKey.trim() || !newSpecValue.trim()) return;
    const specs = formData.specifications || {};
    onChange({ ...formData, specifications: { ...specs, [newSpecKey.trim()]: newSpecValue.trim() } });
    setNewSpecKey('');
    setNewSpecValue('');
  };

  const handleRemoveSpec = (key: string) => {
    const specs = { ...(formData.specifications || {}) };
    delete specs[key];
    onChange({ ...formData, specifications: specs });
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <FormSection title="Informations de base" icon={<Package size={18} />} defaultOpen={true}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Nom du produit *</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => onChange({
                ...formData,
                name: e.target.value,
                slug: generateSlug(e.target.value)
              })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              placeholder="Ex: Montre Connectee Sport Pro"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Slug (URL)</label>
            <input
              type="text"
              value={formData.slug || ''}
              onChange={(e) => onChange({ ...formData, slug: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 bg-gray-50"
              placeholder="montre-connectee-sport-pro"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">SKU (Reference)</label>
            <input
              type="text"
              value={formData.sku || ''}
              onChange={(e) => onChange({ ...formData, sku: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 uppercase"
              placeholder="PROD-001"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Code-barres (UPC/EAN)</label>
            <input
              type="text"
              value={formData.barcode || ''}
              onChange={(e) => onChange({ ...formData, barcode: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"
              placeholder="1234567890123"
            />
          </div>

          {!hideStoreSelect && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Boutique *</label>
              <select
                value={formData.store_id || ''}
                onChange={(e) => onChange({ ...formData, store_id: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"
              >
                <option value="">Selectionner une boutique...</option>
                {stores.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Categorie *</label>
            <select
              value={formData.category_id || ''}
              onChange={(e) => onChange({ ...formData, category_id: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"
            >
              <option value="">Selectionner une categorie...</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Marque</label>
            <select
              value={formData.brand_id || ''}
              onChange={(e) => onChange({ ...formData, brand_id: e.target.value || undefined })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"
            >
              <option value="">Aucune marque</option>
              {brands.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => onChange({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 resize-none"
              rows={4}
              placeholder="Decrivez votre produit en detail..."
            />
          </div>
        </div>
      </FormSection>

      <FormSection title="Prix et Stock" icon={<DollarSign size={18} />} defaultOpen={true}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Prix de vente *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price || ''}
                onChange={(e) => onChange({ ...formData, price: parseFloat(e.target.value) || 0 })}
                className="w-full pl-8 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Prix original</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.original_price || ''}
                onChange={(e) => onChange({ ...formData, original_price: parseFloat(e.target.value) || 0 })}
                className="w-full pl-8 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Reduction (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.discount_percent || 0}
              onChange={(e) => onChange({ ...formData, discount_percent: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Stock</label>
            <input
              type="number"
              min="0"
              value={formData.stock || 0}
              onChange={(e) => onChange({ ...formData, stock: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Seuil stock faible</label>
            <input
              type="number"
              min="0"
              value={formData.low_stock_threshold || 10}
              onChange={(e) => onChange({ ...formData, low_stock_threshold: parseInt(e.target.value) || 10 })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Qte min. commande</label>
            <input
              type="number"
              min="1"
              value={formData.min_order_qty || 1}
              onChange={(e) => onChange({ ...formData, min_order_qty: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Qte max. commande</label>
            <input
              type="number"
              min="1"
              value={formData.max_order_qty || 100}
              onChange={(e) => onChange({ ...formData, max_order_qty: parseInt(e.target.value) || 100 })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"
            />
          </div>

          <div className="flex items-center gap-4 col-span-2 md:col-span-4 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.backorder_allowed ?? false}
                onChange={(e) => onChange({ ...formData, backorder_allowed: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Autoriser les precommandes</span>
            </label>
          </div>
        </div>
      </FormSection>

      <FormSection title="Images du produit" icon={<Image size={18} />} defaultOpen={true}>
        <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
          {productImages.map((img, index) => (
            <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200">
              <img src={img.url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => handleImageRemove(index)}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
              {index === 0 && (
                <span className="absolute bottom-1 left-1 text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded">
                  Principal
                </span>
              )}
            </div>
          ))}
          <label className={`aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 flex flex-col items-center justify-center cursor-pointer transition-colors ${uploadingImage ? 'opacity-50 cursor-wait' : ''}`}>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageAdd}
              className="hidden"
              disabled={uploadingImage}
            />
            {uploadingImage ? (
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Plus size={20} className="text-gray-400" />
                <span className="text-xs text-gray-400 mt-1">Ajouter</span>
              </>
            )}
          </label>
        </div>
      </FormSection>

      <FormSection title="Attributs physiques" icon={<Ruler size={18} />} defaultOpen={false}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Poids</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.weight || ''}
              onChange={(e) => onChange({ ...formData, weight: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Unite de poids</label>
            <select
              value={formData.weight_unit || 'kg'}
              onChange={(e) => onChange({ ...formData, weight_unit: e.target.value as any })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"
            >
              {WEIGHT_UNIT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Longueur (cm)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={formData.dimensions?.length || ''}
              onChange={(e) => onChange({
                ...formData,
                dimensions: {
                  ...formData.dimensions,
                  length: parseFloat(e.target.value) || 0,
                  width: formData.dimensions?.width || 0,
                  height: formData.dimensions?.height || 0,
                  unit: 'cm'
                }
              })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Largeur (cm)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={formData.dimensions?.width || ''}
              onChange={(e) => onChange({
                ...formData,
                dimensions: {
                  ...formData.dimensions,
                  length: formData.dimensions?.length || 0,
                  width: parseFloat(e.target.value) || 0,
                  height: formData.dimensions?.height || 0,
                  unit: 'cm'
                }
              })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Hauteur (cm)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={formData.dimensions?.height || ''}
              onChange={(e) => onChange({
                ...formData,
                dimensions: {
                  ...formData.dimensions,
                  length: formData.dimensions?.length || 0,
                  width: formData.dimensions?.width || 0,
                  height: parseFloat(e.target.value) || 0,
                  unit: 'cm'
                }
              })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Materiau</label>
            <input
              type="text"
              value={formData.material || ''}
              onChange={(e) => onChange({ ...formData, material: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"
              placeholder="Ex: Acier inoxydable"
            />
          </div>

          <div className="col-span-2 md:col-span-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Couleurs disponibles</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {parseColors(formData.color).map((hex) => {
                const colorDef = COLOR_PALETTE.find(c => c.hex.toLowerCase() === hex.toLowerCase());
                return (
                  <div key={hex} className="relative group">
                    <button
                      type="button"
                      title={colorDef?.name || hex}
                      onClick={() => {
                        const current = parseColors(formData.color);
                        onChange({ ...formData, color: serializeColors(current.filter(c => c.toLowerCase() !== hex.toLowerCase())) });
                      }}
                      className="w-8 h-8 rounded-full border-2 border-blue-500 shadow-md flex items-center justify-center overflow-hidden"
                      style={{ backgroundColor: hex }}
                    >
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs hidden group-hover:flex items-center justify-center font-bold leading-none">×</span>
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="border border-gray-200 rounded-xl p-3 bg-gray-50">
              <p className="text-xs text-gray-500 mb-2 font-medium">Cliquer pour ajouter une couleur:</p>
              <div className="grid grid-cols-10 gap-1.5">
                {COLOR_PALETTE.map((color) => {
                  const selected = parseColors(formData.color).some(c => c.toLowerCase() === color.hex.toLowerCase());
                  return (
                    <button
                      key={color.hex}
                      type="button"
                      title={color.name}
                      onClick={() => {
                        const current = parseColors(formData.color);
                        if (selected) {
                          onChange({ ...formData, color: serializeColors(current.filter(c => c.toLowerCase() !== color.hex.toLowerCase())) });
                        } else {
                          onChange({ ...formData, color: serializeColors([...current, color.hex]) });
                        }
                      }}
                      className={`w-7 h-7 rounded-full transition-all border-2 ${selected ? 'border-blue-500 scale-110 shadow-md' : 'border-transparent hover:border-gray-400 hover:scale-105'} ${color.hex === '#FFFFFF' || color.hex === '#F5F0E8' || color.hex === '#FFFFF0' || color.hex === '#E6E6FA' ? 'border-gray-200' : ''}`}
                      style={{ backgroundColor: color.hex }}
                    />
                  );
                })}
              </div>
            </div>
            {parseColors(formData.color).length > 0 && (
              <p className="text-xs text-gray-500 mt-1.5">
                {parseColors(formData.color).length} couleur{parseColors(formData.color).length > 1 ? 's' : ''} sélectionnée{parseColors(formData.color).length > 1 ? 's' : ''}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Taille</label>
            <input
              type="text"
              value={formData.size || ''}
              onChange={(e) => onChange({ ...formData, size: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"
              placeholder="Ex: M, L, XL ou 42"
            />
          </div>
        </div>
      </FormSection>

      <FormSection title="Public cible" icon={<Users size={18} />} defaultOpen={false}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Genre</label>
            <select
              value={formData.gender || 'unisex'}
              onChange={(e) => onChange({ ...formData, gender: e.target.value as any })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"
            >
              {GENDER_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Tranche d'age</label>
            <select
              value={formData.age_group || 'adult'}
              onChange={(e) => onChange({ ...formData, age_group: e.target.value as any })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"
            >
              {AGE_GROUP_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Etat du produit</label>
            <select
              value={formData.condition || 'new'}
              onChange={(e) => onChange({ ...formData, condition: e.target.value as any })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"
            >
              {CONDITION_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </FormSection>

      <FormSection title="Expedition et Garantie" icon={<Truck size={18} />} defaultOpen={false}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Classe d'expedition</label>
            <select
              value={formData.shipping_class || 'standard'}
              onChange={(e) => onChange({ ...formData, shipping_class: e.target.value as any })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"
            >
              {SHIPPING_CLASS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Garantie (mois)</label>
            <input
              type="number"
              min="0"
              value={formData.warranty_months || 0}
              onChange={(e) => onChange({ ...formData, warranty_months: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Pays d'origine</label>
            <input
              type="text"
              value={formData.country_of_origin || ''}
              onChange={(e) => onChange({ ...formData, country_of_origin: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"
              placeholder="Ex: France"
            />
          </div>

          <div className="flex items-center pt-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_digital ?? false}
                onChange={(e) => onChange({ ...formData, is_digital: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Produit digital</span>
            </label>
          </div>
        </div>
      </FormSection>

      <FormSection title="Caracteristiques" icon={<Sparkles size={18} />} defaultOpen={false}>
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddFeature()}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"
              placeholder="Ajouter une caracteristique..."
            />
            <button
              type="button"
              onClick={handleAddFeature}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700"
            >
              <Plus size={16} />
            </button>
          </div>
          {(formData.features || []).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {(formData.features || []).map((feature, index) => (
                <span key={index} className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm">
                  {feature}
                  <button type="button" onClick={() => handleRemoveFeature(index)} className="hover:text-blue-900">
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </FormSection>

      <FormSection title="Specifications techniques" icon={<Info size={18} />} defaultOpen={false}>
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={newSpecKey}
              onChange={(e) => setNewSpecKey(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"
              placeholder="Nom (ex: Batterie)"
            />
            <input
              type="text"
              value={newSpecValue}
              onChange={(e) => setNewSpecValue(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"
              placeholder="Valeur (ex: 5000 mAh)"
            />
            <button
              type="button"
              onClick={handleAddSpec}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700"
            >
              <Plus size={16} />
            </button>
          </div>
          {Object.keys(formData.specifications || {}).length > 0 && (
            <div className="space-y-2">
              {Object.entries(formData.specifications || {}).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-xl">
                  <div>
                    <span className="font-medium text-gray-900">{key}:</span>
                    <span className="ml-2 text-gray-600">{value}</span>
                  </div>
                  <button type="button" onClick={() => handleRemoveSpec(key)} className="text-red-500 hover:text-red-700">
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </FormSection>

      <FormSection title="Variantes" icon={<Layers size={18} />} defaultOpen={false}>
        <div className="space-y-3">
          {productVariants.map((variant, index) => (
            <div key={index} className="flex gap-2 items-start p-3 bg-gray-50 rounded-xl">
              <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-2">
                <input
                  type="text"
                  value={variant.name || ''}
                  onChange={(e) => handleVariantChange(index, 'name', e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400"
                  placeholder="Type (ex: Taille)"
                />
                <input
                  type="text"
                  value={variant.value || ''}
                  onChange={(e) => handleVariantChange(index, 'value', e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400"
                  placeholder="Valeur (ex: XL)"
                />
                <input
                  type="number"
                  value={variant.price_modifier || ''}
                  onChange={(e) => handleVariantChange(index, 'price_modifier', parseFloat(e.target.value) || 0)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400"
                  placeholder="Diff. prix"
                />
                <input
                  type="number"
                  value={variant.stock || ''}
                  onChange={(e) => handleVariantChange(index, 'stock', parseInt(e.target.value) || 0)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400"
                  placeholder="Stock"
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemoveVariant(index)}
                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddVariant}
            className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-xl text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 w-full justify-center"
          >
            <Plus size={16} />
            Ajouter une variante
          </button>
        </div>
      </FormSection>

      <FormSection title="SEO et Tags" icon={<Globe size={18} />} defaultOpen={false}>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Meta titre</label>
            <input
              type="text"
              value={formData.meta_title || ''}
              onChange={(e) => onChange({ ...formData, meta_title: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"
              placeholder="Titre pour les moteurs de recherche"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Meta description</label>
            <textarea
              value={formData.meta_description || ''}
              onChange={(e) => onChange({ ...formData, meta_description: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 resize-none"
              rows={2}
              placeholder="Description pour les moteurs de recherche"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Tags (separes par virgule)</label>
            <input
              type="text"
              value={(formData.tags || []).join(', ')}
              onChange={(e) => onChange({ ...formData, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"
              placeholder="nouveau, populaire, promo"
            />
          </div>
        </div>
      </FormSection>

      <FormSection title="Publication et Statut" icon={<Clock size={18} />} defaultOpen={true}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Date de publication</label>
            <input
              type="datetime-local"
              value={formData.published_at ? formData.published_at.slice(0, 16) : ''}
              onChange={(e) => onChange({ ...formData, published_at: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Date de precommande</label>
            <input
              type="datetime-local"
              value={formData.preorder_date ? formData.preorder_date.slice(0, 16) : ''}
              onChange={(e) => onChange({ ...formData, preorder_date: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-4 pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_active ?? true}
              onChange={(e) => onChange({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Actif</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_featured ?? false}
              onChange={(e) => onChange({ ...formData, is_featured: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">En vedette</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_flash_sale ?? false}
              onChange={(e) => onChange({ ...formData, is_flash_sale: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Vente flash</span>
          </label>
        </div>
      </FormSection>
    </div>
  );
}
