import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Plus, Trash2, Check, X, Loader, Upload, Scan, Barcode,
  Package, ChevronDown, Info, Save, AlertTriangle, CheckCircle
} from 'lucide-react';
import { apiClient, storesService } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import type { Category, Brand } from '../../../types';

interface BulkRow {
  id: string;
  name: string;
  barcode: string;
  sku: string;
  category_id: string;
  price: string;
  original_price: string;
  stock: string;
  description: string;
  status: 'draft' | 'published';
  _state: 'idle' | 'saving' | 'saved' | 'error';
  _error?: string;
}

const EMPTY_ROW = (): BulkRow => ({
  id: crypto.randomUUID(),
  name: '',
  barcode: '',
  sku: '',
  category_id: '',
  price: '',
  original_price: '',
  stock: '0',
  description: '',
  status: 'draft',
  _state: 'idle',
});

const COLS = [
  { key: 'barcode', label: 'Code-barres', width: 'w-36', placeholder: 'Scannez ou saisissez' },
  { key: 'sku', label: 'SKU', width: 'w-28', placeholder: 'Ref. produit' },
  { key: 'name', label: 'Nom *', width: 'w-52', placeholder: 'Nom du produit' },
  { key: 'category_id', label: 'Catégorie *', width: 'w-40', placeholder: '' },
  { key: 'price', label: 'Prix *', width: 'w-24', placeholder: '0.00' },
  { key: 'original_price', label: 'Prix original', width: 'w-28', placeholder: '0.00' },
  { key: 'stock', label: 'Stock', width: 'w-20', placeholder: '0' },
  { key: 'status', label: 'Statut', width: 'w-28', placeholder: '' },
  { key: 'description', label: 'Description', width: 'w-48', placeholder: 'Courte description...' },
];

export default function BulkProductPage() {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [rows, setRows] = useState<BulkRow[]>([EMPTY_ROW(), EMPTY_ROW(), EMPTY_ROW()]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [store, setStore] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [scanMode, setScanMode] = useState(false);
  const [activeScanRow, setActiveScanRow] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const scanBufferRef = useRef('');
  const lastKeyTimeRef = useRef(0);

  const notify = (msg: string, type: 'success' | 'error' = 'success') => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    const load = async () => {
      const [catRes, storeRes] = await Promise.all([
        apiClient.get<Category[]>('/categories?is_active=true&order=sort_order'),
        storesService.getById(storeId!),
      ]);
      setCategories(catRes.data || []);
      setStore(storeRes.data);
    };
    load();
  }, [storeId]);

  useEffect(() => {
    if (!scanMode) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const now = Date.now();
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' && (target as HTMLInputElement).dataset.barcodeField) return;
      if (now - lastKeyTimeRef.current > 120) scanBufferRef.current = '';
      lastKeyTimeRef.current = now;
      if (e.key === 'Enter') {
        const code = scanBufferRef.current.trim();
        if (code.length > 2 && activeScanRow) {
          updateRow(activeScanRow, 'barcode', code);
          if (!rows.find(r => r.id === activeScanRow)?.sku) {
            updateRow(activeScanRow, 'sku', code);
          }
          notify(`Code capturé: ${code}`);
        }
        scanBufferRef.current = '';
        return;
      }
      if (e.key.length === 1) scanBufferRef.current += e.key;
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scanMode, activeScanRow, rows]);

  const updateRow = useCallback((id: string, field: keyof BulkRow, value: string) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value, _state: 'idle', _error: undefined } : r));
  }, []);

  const addRows = (count = 5) => {
    setRows(prev => [...prev, ...Array.from({ length: count }, EMPTY_ROW)]);
  };

  const removeRow = (id: string) => {
    setRows(prev => prev.filter(r => r.id !== id));
  };

  const duplicateRow = (id: string) => {
    const src = rows.find(r => r.id === id);
    if (!src) return;
    setRows(prev => {
      const idx = prev.findIndex(r => r.id === id);
      const copy = { ...src, id: crypto.randomUUID(), _state: 'idle' as const };
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
  };

  const validRows = rows.filter(r => r.name.trim() && r.category_id && r.price);

  const handleSaveAll = async (defaultStatus: 'draft' | 'published') => {
    if (validRows.length === 0) {
      notify('Aucun produit valide à sauvegarder. Remplissez au minimum le nom, la catégorie et le prix.', 'error');
      return;
    }
    setSaving(true);
    let savedCount = 0;
    let errorCount = 0;

    for (const row of validRows) {
      setRows(prev => prev.map(r => r.id === row.id ? { ...r, _state: 'saving' } : r));
      try {
        const payload = {
          store_id: storeId,
          name: row.name.trim(),
          barcode: row.barcode.trim() || null,
          sku: row.sku.trim() || null,
          category_id: row.category_id,
          price: parseFloat(row.price) || 0,
          original_price: parseFloat(row.original_price) || parseFloat(row.price) || 0,
          stock: parseInt(row.stock) || 0,
          description: row.description.trim() || '',
          status: row.status || defaultStatus,
          is_active: (row.status || defaultStatus) === 'published',
          slug: row.name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now(),
          image_url: null,
          discount_percent: 0,
        };
        const { data: productData, error } = await apiClient.post<{ id: string }>('/products', payload);
        if (error || !productData) throw new Error(error?.message || 'Failed to create product');
        setRows(prev => prev.map(r => r.id === row.id ? { ...r, _state: 'saved' } : r));
        savedCount++;
      } catch (err: any) {
        setRows(prev => prev.map(r => r.id === row.id ? { ...r, _state: 'error', _error: err?.message || 'Erreur' } : r));
        errorCount++;
      }
    }

    setSaving(false);
    if (errorCount === 0) {
      notify(`${savedCount} produit(s) sauvegardé(s) avec succès !`);
      setTimeout(() => navigate(`/business/store/${storeId}?tab=products`), 1200);
    } else {
      notify(`${savedCount} sauvegardé(s), ${errorCount} erreur(s)`, 'error');
    }
  };

  const incompleteCount = rows.filter(r => r.name || r.price || r.barcode).filter(r => !r.name || !r.category_id || !r.price).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 text-white font-medium ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {notification.type === 'success' ? <Check size={16} /> : <X size={16} />}
          {notification.msg}
        </div>
      )}

      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-full px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to={`/business/store/${storeId}?tab=products`} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors">
              <ArrowLeft size={18} />
              <span className="text-sm font-medium hidden sm:block">{store?.name || 'Produits'}</span>
            </Link>
            <div className="h-5 w-px bg-gray-200" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center">
                <Upload size={14} className="text-white" />
              </div>
              <h1 className="font-black text-gray-900 text-lg">Ajout groupé de produits</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setScanMode(!scanMode)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border-2 transition-all ${scanMode ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600 hover:border-orange-400'}`}
            >
              <Scan size={14} />
              {scanMode ? 'Scan ON' : 'Scanner'}
            </button>
            <button
              onClick={() => handleSaveAll('draft')}
              disabled={saving || validRows.length === 0}
              className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-semibold rounded-xl text-sm transition-colors disabled:opacity-40"
            >
              <Save size={14} /> Brouillons ({validRows.length})
            </button>
            <button
              onClick={() => handleSaveAll('published')}
              disabled={saving || validRows.length === 0}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-bold px-5 py-2 rounded-xl text-sm transition-colors"
            >
              {saving ? <Loader size={14} className="animate-spin" /> : <Check size={14} />}
              Publier tout ({validRows.length})
            </button>
          </div>
        </div>
      </header>

      <div className="px-4 py-4">
        <div className="flex items-center gap-3 flex-wrap mb-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm text-blue-800">
            <Info size={15} className="text-blue-500 shrink-0" />
            Remplissez le tableau — <strong>Nom, Catégorie et Prix</strong> sont obligatoires par ligne. Les colonnes vides sont ignorées.
          </div>
          {scanMode && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm text-green-800">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Scanner actif — cliquez sur une ligne puis scannez pour remplir le code-barres
            </div>
          )}
          {incompleteCount > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm text-amber-800">
              <AlertTriangle size={15} className="text-amber-500 shrink-0" />
              {incompleteCount} ligne(s) incomplète(s) — seules les lignes valides seront sauvegardées
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="w-8 px-2 py-3 text-center">
                    <span className="text-xs font-semibold text-gray-400">#</span>
                  </th>
                  {COLS.map(col => (
                    <th key={col.key} className={`${col.width} px-2 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap`}>
                      {col.label}
                    </th>
                  ))}
                  <th className="w-20 px-2 py-3 text-center text-xs font-semibold text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <BulkRow
                    key={row.id}
                    row={row}
                    idx={idx}
                    categories={categories}
                    scanMode={scanMode}
                    isActiveScan={activeScanRow === row.id}
                    onActivateScan={() => setActiveScanRow(row.id)}
                    onChange={updateRow}
                    onRemove={() => removeRow(row.id)}
                    onDuplicate={() => duplicateRow(row.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 border-t border-gray-100 flex items-center gap-3">
            <button onClick={() => addRows(1)} className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-orange-600 px-3 py-1.5 rounded-lg hover:bg-orange-50 transition-colors">
              <Plus size={14} /> Ajouter 1 ligne
            </button>
            <button onClick={() => addRows(5)} className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-orange-600 px-3 py-1.5 rounded-lg hover:bg-orange-50 transition-colors">
              <Plus size={14} /> +5 lignes
            </button>
            <button onClick={() => addRows(10)} className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-orange-600 px-3 py-1.5 rounded-lg hover:bg-orange-50 transition-colors">
              <Plus size={14} /> +10 lignes
            </button>
            <span className="ml-auto text-xs text-gray-400">{rows.length} ligne(s) — {validRows.length} valide(s)</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            onClick={() => handleSaveAll('draft')}
            disabled={saving || validRows.length === 0}
            className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-semibold rounded-xl transition-colors disabled:opacity-40"
          >
            <Save size={16} /> Sauvegarder en brouillon ({validRows.length})
          </button>
          <button
            onClick={() => handleSaveAll('published')}
            disabled={saving || validRows.length === 0}
            className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl transition-colors"
          >
            {saving ? <Loader size={16} className="animate-spin" /> : <Check size={16} />}
            Publier {validRows.length} produit(s)
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

interface BulkRowProps {
  row: BulkRow;
  idx: number;
  categories: Category[];
  scanMode: boolean;
  isActiveScan: boolean;
  onActivateScan: () => void;
  onChange: (id: string, field: keyof BulkRow, value: string) => void;
  onRemove: () => void;
  onDuplicate: () => void;
}

function BulkRow({ row, idx, categories, scanMode, isActiveScan, onActivateScan, onChange, onRemove, onDuplicate }: BulkRowProps) {
  const isComplete = row.name.trim() && row.category_id && row.price;
  const hasAny = row.name || row.barcode || row.price || row.sku;

  const rowCls = row._state === 'saved'
    ? 'bg-green-50'
    : row._state === 'error'
    ? 'bg-red-50'
    : isActiveScan && scanMode
    ? 'bg-green-50/40 ring-2 ring-green-300 ring-inset'
    : '';

  return (
    <tr
      className={`border-b border-gray-100 hover:bg-gray-50/50 transition-colors ${rowCls}`}
      onClick={scanMode ? onActivateScan : undefined}
    >
      <td className="px-2 py-1.5 text-center">
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-xs text-gray-400 font-mono">{idx + 1}</span>
          {row._state === 'saved' && <CheckCircle size={12} className="text-green-500" />}
          {row._state === 'error' && <AlertTriangle size={12} className="text-red-500" />}
          {row._state === 'saving' && <Loader size={12} className="text-orange-400 animate-spin" />}
        </div>
      </td>

      <td className="px-1 py-1.5">
        <div className="flex items-center gap-1">
          {scanMode && isActiveScan && <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shrink-0" />}
          <input
            type="text"
            value={row.barcode}
            onChange={e => onChange(row.id, 'barcode', e.target.value)}
            data-barcode-field="true"
            placeholder="Scannez..."
            className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs font-mono focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100"
            onFocus={onActivateScan}
          />
        </div>
      </td>

      <td className="px-1 py-1.5">
        <input
          type="text"
          value={row.sku}
          onChange={e => onChange(row.id, 'sku', e.target.value)}
          placeholder="SKU"
          className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs font-mono focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100"
        />
      </td>

      <td className="px-1 py-1.5">
        <input
          type="text"
          value={row.name}
          onChange={e => onChange(row.id, 'name', e.target.value)}
          placeholder="Nom du produit *"
          className={`w-full px-2 py-1.5 border rounded-lg text-xs focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100 ${hasAny && !row.name ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
        />
      </td>

      <td className="px-1 py-1.5">
        <select
          value={row.category_id}
          onChange={e => onChange(row.id, 'category_id', e.target.value)}
          className={`w-full px-2 py-1.5 border rounded-lg text-xs focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100 ${hasAny && !row.category_id ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
        >
          <option value="">Catégorie *</option>
          {categories.filter(c => c.level === 0).map(cat => (
            <optgroup key={cat.id} label={cat.name}>
              <option value={cat.id}>{cat.name}</option>
              {categories.filter(c => c.parent_id === cat.id).map(sub => (
                <option key={sub.id} value={sub.id}>— {sub.name}</option>
              ))}
            </optgroup>
          ))}
          {categories.filter(c => c.level === 0).length === 0 && categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </td>

      <td className="px-1 py-1.5">
        <input
          type="number"
          value={row.price}
          onChange={e => onChange(row.id, 'price', e.target.value)}
          placeholder="0.00 *"
          min="0"
          step="0.01"
          className={`w-full px-2 py-1.5 border rounded-lg text-xs text-right focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100 ${hasAny && !row.price ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
        />
      </td>

      <td className="px-1 py-1.5">
        <input
          type="number"
          value={row.original_price}
          onChange={e => onChange(row.id, 'original_price', e.target.value)}
          placeholder="0.00"
          min="0"
          step="0.01"
          className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs text-right focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100"
        />
      </td>

      <td className="px-1 py-1.5">
        <input
          type="number"
          value={row.stock}
          onChange={e => onChange(row.id, 'stock', e.target.value)}
          placeholder="0"
          min="0"
          className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs text-right focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100"
        />
      </td>

      <td className="px-1 py-1.5">
        <select
          value={row.status}
          onChange={e => onChange(row.id, 'status', e.target.value)}
          className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100"
        >
          <option value="draft">Brouillon</option>
          <option value="published">Publier</option>
        </select>
      </td>

      <td className="px-1 py-1.5">
        <input
          type="text"
          value={row.description}
          onChange={e => onChange(row.id, 'description', e.target.value)}
          placeholder="Description..."
          className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100"
        />
      </td>

      <td className="px-2 py-1.5">
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
            title="Dupliquer"
            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
          >
            <Plus size={13} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            title="Supprimer"
            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </td>
    </tr>
  );
}
