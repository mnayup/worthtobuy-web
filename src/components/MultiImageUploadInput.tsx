import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  X,
  ExternalLink,
  AlertCircle,
  Image as ImageIcon,
  Check,
} from 'lucide-react';
import { useS3Upload, type EntityType } from '~/hooks/useS3Upload';

interface MultiImageUploadInputProps {
  value?: string[] | string;
  onChange: (urls: string[]) => void;
  entityType?: EntityType;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  maxFiles?: number;
}

export function MultiImageUploadInput({
  value,
  onChange,
  entityType = 'products',
  placeholder,
  className = '',
  disabled = false,
  maxFiles = 10,
}: MultiImageUploadInputProps) {
  const { uploadFile, deleteFile, error, clearError } = useS3Upload();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadState, setUploadState] = useState<{
    uploading: boolean;
    current: number;
    total: number;
  }>({ uploading: false, current: 0, total: 0 });

  // Normalize incoming value to an array of non-empty strings
  const urls: string[] = React.useMemo(() => {
    if (Array.isArray(value)) {
      return value.filter((u): u is string => typeof u === 'string' && !!u.trim());
    }
    if (typeof value === 'string' && value.trim()) {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return parsed.filter(Boolean);
        }
      } catch {
        // Fallback for comma separated or single string
        return value.split(',').map((u) => u.trim()).filter(Boolean);
      }
      return [value.trim()];
    }
    return [];
  }, [value]);

  const handleFilesSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    clearError();
    const fileList = Array.from(files);
    const availableSlots = maxFiles - urls.length;
    const filesToUpload = fileList.slice(0, Math.max(0, availableSlots));

    if (filesToUpload.length === 0) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploadState({ uploading: true, current: 0, total: filesToUpload.length });

    const newUrls: string[] = [];
    for (let i = 0; i < filesToUpload.length; i++) {
      setUploadState({ uploading: true, current: i + 1, total: filesToUpload.length });
      const uploadedUrl = await uploadFile(filesToUpload[i], entityType, 'image');
      if (uploadedUrl) {
        newUrls.push(uploadedUrl);
      }
    }

    setUploadState({ uploading: false, current: 0, total: 0 });
    if (fileInputRef.current) fileInputRef.current.value = '';

    if (newUrls.length > 0) {
      onChange([...urls, ...newUrls]);
    }
  };

  const handleRemove = async (indexToRemove: number) => {
    const targetUrl = urls[indexToRemove];
    if (targetUrl) {
      await deleteFile(targetUrl);
    }
    const updated = urls.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Upload button / Trigger area */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="text-xs font-semibold text-brand-600">
            Product & Variant Gallery ({urls.length}/{maxFiles})
          </span>
          <p className="text-[10px] text-brand-400">Max 1 MB per image (PNG, JPG, WEBP)</p>
        </div>
        {urls.length < maxFiles && (
          <button
            type="button"
            disabled={disabled || uploadState.uploading}
            onClick={() => fileInputRef.current?.click()}
            className={
              'inline-flex items-center gap-1.5 rounded-xl border border-brand-200 ' +
              'bg-white px-3 py-1.5 text-xs font-bold text-brand-700 shadow-xs ' +
              'hover:bg-brand-50 hover:border-brand-300 transition cursor-pointer ' +
              'disabled:opacity-50 disabled:cursor-not-allowed'
            }
          >
            <UploadCloud size={14} className="text-brand-500" />
            <span>Upload Images</span>
          </button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFilesSelect}
        className="hidden"
        accept="image/png,image/jpeg,image/webp,image/gif"
        multiple
        disabled={disabled || uploadState.uploading}
      />

      {/* Uploading progress notification */}
      {uploadState.uploading && (
        <div className="rounded-xl border border-cherry-100 bg-cherry-50/60 p-2.5">
          <div
            className={
              'flex items-center justify-between text-xs text-cherry-900 ' +
              'font-semibold mb-1'
            }
          >
            <span>
              Uploading image {uploadState.current} of {uploadState.total}...
            </span>
            <span>
              {Math.round((uploadState.current / uploadState.total) * 100)}%
            </span>
          </div>
          <div className="w-full bg-cherry-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-cherry-600 h-1.5 rounded-full transition-all duration-300"
              style={{
                width: `${(uploadState.current / uploadState.total) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Error alert */}
      {error && (
        <div
          className={
            'flex items-start gap-1.5 p-2 rounded-xl bg-red-50 ' +
            'border border-red-200 text-red-700 text-xs'
          }
        >
          <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid of uploaded images */}
      {urls.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {urls.map((url, idx) => (
            <div
              key={`${url}-${idx}`}
              className={
                'group relative aspect-square rounded-2xl overflow-hidden ' +
                'border border-brand-200 bg-brand-50/50 shadow-xs transition ' +
                'hover:shadow-md hover:border-brand-300'
              }
            >
              <img
                src={url}
                alt={`Product visual ${idx + 1}`}
                className="h-full w-full object-cover transition group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/100';
                }}
              />

              {/* Primary tag on first image */}
              {idx === 0 && (
                <div
                  className={
                    'absolute top-1.5 left-1.5 rounded-md bg-emerald-600/90 ' +
                    'px-1.5 py-0.5 text-[9px] font-bold text-white shadow-xs'
                  }
                >
                  Primary
                </div>
              )}

              {/* Action overlays */}
              <div
                className={
                  'absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 ' +
                  'transition flex items-center justify-center gap-2 p-1'
                }
              >
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className={
                    'p-1.5 rounded-lg bg-white/90 text-brand-700 hover:bg-white ' +
                    'shadow-xs transition'
                  }
                  title="View full image"
                >
                  <ExternalLink size={13} />
                </a>
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => handleRemove(idx)}
                    className={
                      'p-1.5 rounded-lg bg-rose-600/90 text-white hover:bg-rose-700 ' +
                      'shadow-xs transition cursor-pointer'
                    }
                    title="Remove image"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Quick upload tile in the grid if room remains */}
          {urls.length < maxFiles && !disabled && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={
                'flex flex-col items-center justify-center aspect-square ' +
                'rounded-2xl border-2 border-dashed border-brand-200 ' +
                'bg-brand-50/30 text-brand-500 hover:bg-brand-50 ' +
                'hover:border-brand-400 hover:text-brand-700 transition ' +
                'cursor-pointer'
              }
              title="Add another image"
            >
              <UploadCloud size={18} className="mb-1" />
              <span className="text-[10px] font-bold">+ Add Photo</span>
            </button>
          )}
        </div>
      ) : (
        /* Empty state dropzone */
        <button
          type="button"
          disabled={disabled || uploadState.uploading}
          onClick={() => fileInputRef.current?.click()}
          className={
            'w-full flex flex-col items-center justify-center gap-2 ' +
            'rounded-2xl border-2 border-dashed border-brand-200 ' +
            'bg-brand-50/30 p-5 text-center transition ' +
            'hover:border-brand-400 hover:bg-brand-50 cursor-pointer'
          }
        >
          <div className="flex items-center gap-2 text-brand-400">
            <ImageIcon size={22} />
            <UploadCloud size={20} />
          </div>
          <div>
            <span className="text-xs font-bold text-brand-800 block">
              {placeholder || 'Click or drag photos to upload'}
            </span>
            <span className="text-[11px] text-brand-500 font-medium">
              Upload multiple images for colors, patterns, and size variants
            </span>
          </div>
          <span className="text-[10px] text-brand-400">
            Supports JPG, PNG, WEBP, GIF (up to {maxFiles} images)
          </span>
        </button>
      )}
    </div>
  );
}
