import React, { useState, useRef } from 'react';
import { Button } from '../ui/Button';
import { UploadCloud, CheckCircle2, AlertCircle, Image as ImageIcon } from 'lucide-react';

interface PhotoUploaderProps {
  onFileSelect: (file: File) => void;
  maxSizeMB?: number;
  initialPreviewUrl?: string;
  disabled?: boolean;
}

export function PhotoUploader({
  onFileSelect,
  maxSizeMB = 5,
  initialPreviewUrl,
  disabled = false,
}: PhotoUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialPreviewUrl || null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Check type
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Format file harus berupa foto atau gambar (JPG, PNG, WEBP).');
      return;
    }

    // Check size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setErrorMessage(`Ukuran foto terlalu besar. Mohon gunakan foto dengan ukuran maksimal ${maxSizeMB} MB.`);
      return;
    }

    setFileName(file.name);
    const objectUrl = typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function'
      ? URL.createObjectURL(file)
      : `mock-preview://${file.name}`;
    setPreviewUrl(objectUrl);
    onFileSelect(file);
  };

  return (
    <div className="w-full space-y-3">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        data-testid="photo-upload-input"
        className="hidden"
        disabled={disabled}
      />

      {previewUrl ? (
        <div className="relative rounded-2xl overflow-hidden border-2 border-brand-500/30 bg-slate-900/5 p-3 flex flex-col items-center">
          <img
            src={previewUrl}
            alt="Bukti Transfer"
            className="max-h-64 w-auto rounded-xl object-contain shadow-sm"
          />
          <div className="mt-3 flex items-center justify-between w-full">
            <span className="text-base text-slate-700 font-medium truncate max-w-[200px]">
              {fileName || 'Foto Bukti Terlampir'}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="text-base"
            >
              Ganti Foto
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="w-full rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/70 p-6 flex flex-col items-center justify-center hover:bg-orange-50/40 hover:border-brand-500 transition-colors cursor-pointer group min-h-[140px]"
        >
          <div className="rounded-full bg-brand-100 p-4 text-brand-600 group-hover:scale-110 transition-transform">
            <UploadCloud className="w-8 h-8" />
          </div>
          <span className="mt-3 text-lg font-bold text-slate-800">
            Pilih Foto Bukti Transfer
          </span>
          <span className="text-base text-slate-500 mt-1">
            Format JPG, PNG (Maksimal {maxSizeMB} MB)
          </span>
        </button>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-base font-medium animate-in fade-in-50">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
