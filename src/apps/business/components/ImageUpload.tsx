import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string | null) => void;
  onUpload: (file: File) => Promise<string>;
  label?: string;
  accept?: string;
}

export default function ImageUpload({
  value,
  onChange,
  onUpload,
  label = 'Image',
  accept = 'image/*',
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Le fichier est trop volumineux (max 5MB)');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const url = await onUpload(file);
      onChange(url);
    } catch (err) {
      setError('Erreur lors du telechargement');
      console.error(err);
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>

      {value ? (
        <div className="relative w-full h-40 rounded-xl overflow-hidden border border-gray-200 group">
          <img src={value} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="p-2 bg-white rounded-lg hover:bg-gray-100"
            >
              <Upload size={18} />
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="p-2 bg-white rounded-lg hover:bg-gray-100"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full h-40 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-blue-400 hover:bg-blue-50/50 transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600" />
              <span className="text-sm text-gray-500">Telechargement...</span>
            </>
          ) : (
            <>
              <ImageIcon size={32} className="text-gray-400" />
              <span className="text-sm text-gray-500">Cliquez pour telecharger</span>
              <span className="text-xs text-gray-400">PNG, JPG jusqu'a 5MB</span>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
