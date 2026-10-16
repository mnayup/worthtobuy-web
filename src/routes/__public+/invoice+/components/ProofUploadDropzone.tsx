import React from 'react';
import { UploadCloud, X } from 'lucide-react';

interface Props {
  localPreview: string | null;
  uploadedUrl: string;
  isUploading: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
}

export function ProofUploadDropzone({
  localPreview,
  uploadedUrl,
  isUploading,
  onFileChange,
  onClear,
}: Props) {
  if (localPreview || uploadedUrl) {
    return (
      <div
        className={
          'relative rounded-2xl border border-brand-200 bg-brand-50/40 p-3 ' +
          'flex items-center justify-between gap-3'
        }
      >
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={localPreview || uploadedUrl}
            alt="Proof preview"
            className="h-16 w-16 rounded-xl object-cover ring-1 ring-brand-200 shrink-0"
          />
          <div className="min-w-0">
            <p className="text-xs font-black text-brand-950 truncate">
              {isUploading ? 'Uploading proof to server...' : 'Transfer Proof Attached'}
            </p>
            <p className="text-[10px] text-emerald-700 font-bold mt-0.5">
              {uploadedUrl ? '✓ Ready to submit' : 'Processing...'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClear}
          disabled={isUploading}
          className={
            'rounded-xl p-2 text-brand-400 hover:bg-white hover:text-cherry-600 ' +
            'transition'
          }
        >
          <X size={18} />
        </button>
      </div>
    );
  }

  return (
    <label
      className={
        'relative flex flex-col items-center justify-center rounded-2xl ' +
        'border-2 border-dashed border-brand-300 bg-brand-50/40 p-6 text-center ' +
        'hover:bg-brand-50 transition cursor-pointer'
      }
    >
      <UploadCloud size={32} className="text-brand-500 mb-2" />
      <p className="text-xs font-bold text-brand-900">
        Click or drag & drop to upload transfer receipt
      </p>
      <p className="text-[10px] text-brand-400 mt-0.5">
        PNG, JPG, JPEG, WEBP up to 1 MB
      </p>
      <input
        type="file"
        accept="image/*"
        onChange={onFileChange}
        disabled={isUploading}
        className="hidden"
      />
    </label>
  );
}
