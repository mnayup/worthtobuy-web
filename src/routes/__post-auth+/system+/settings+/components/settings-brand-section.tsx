import React, { type Dispatch, type SetStateAction, type ReactNode } from 'react';
import {
  Sparkles,
  Instagram,
  MessageCircle,
  Palette,
  ExternalLink,
  Globe,
  Tag,
  UploadCloud,
  Loader2,
  Trash2,
  ImageIcon,
} from 'lucide-react';
import { useS3Upload } from '~/hooks/useS3Upload';
import type { BrandSettings } from '../types';

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-brand-400">{hint}</p>}
    </div>
  );
}

interface SettingsBrandSectionProps {
  brand: BrandSettings;
  setBrand: Dispatch<SetStateAction<BrandSettings>>;
}

export function SettingsBrandSection({
  brand,
  setBrand,
}: SettingsBrandSectionProps) {
  const { uploadFile, deleteFile, isUploading, error: uploadError } = useS3Upload();
  const cleanWa = (brand.whatsapp || '').replace(/\D/g, '');
  const previewWaUrl = cleanWa ? `https://wa.me/${cleanWa}` : '#';

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const oldLogoUrl = brand.logoUrl;
      const uploadedUrl = await uploadFile(file, 'brand', 'image');
      if (uploadedUrl) {
        setBrand((curr) => ({ ...curr, logoUrl: uploadedUrl }));
        // Clean up previous logo from storage if it exists
        if (oldLogoUrl) {
          await deleteFile(oldLogoUrl);
        }
      }
    } catch (err) {
      console.error('Failed uploading brand logo:', err);
    } finally {
      e.target.value = '';
    }
  };

  const handleDeleteLogo = async () => {
    if (brand.logoUrl) {
      await deleteFile(brand.logoUrl);
    }
    setBrand((curr) => ({ ...curr, logoUrl: '' }));
  };

  return (
    <section className="card p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-rose-50 p-3 text-rose-600">
            <Sparkles size={22} />
          </div>
          <div>
            <h2 className="section-title">Brand & Public Identity Settings</h2>
            <p className="text-sm font-medium text-brand-500">
              Configure your public storefront name, official WhatsApp, Instagram handle, and brand accents.
            </p>
          </div>
        </div>

        {/* Live Preview Pill */}
        <div className="flex items-center gap-2 rounded-2xl bg-brand-50 border border-brand-200/80 px-4 py-2 self-start sm:self-auto">
          <div
            className="h-3.5 w-3.5 rounded-full shadow-xs shrink-0"
            style={{ backgroundColor: brand.primaryColor || '#b7332b' }}
          />
          <span className="text-xs font-black text-brand-900 tracking-wide uppercase">
            {brand.name || 'WORTHTOBUY'}
          </span>
          <span className="text-[11px] font-semibold text-brand-500">
            {brand.instagram || '@worthtobuy_sub'}
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Field label="Brand Name (BRAND_NAME)" hint="Displayed on public header, footer, invoices & page titles.">
          <div className="relative">
            <input
              className="input font-bold uppercase tracking-wide"
              value={brand.name || ''}
              onChange={(e) =>
                setBrand((curr) => ({ ...curr, name: e.target.value.toUpperCase() }))
              }
              placeholder="WORTHTOBUY"
            />
            <Tag size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-400" />
          </div>
        </Field>

        <Field label="Brand Tagline / Slogan" hint="Brief summary shown under hero headers and meta descriptions.">
          <input
            className="input"
            value={brand.tagline || ''}
            onChange={(e) =>
              setBrand((curr) => ({ ...curr, tagline: e.target.value }))
            }
            placeholder="Your Trusted Jastip Bestie & Personal Shopper Nasional"
          />
        </Field>

        <Field
          label="Official WhatsApp (BRAND_WHATSAPP)"
          hint="Default WhatsApp used for public order links & floating button (e.g. 6285186852535)."
        >
          <div className="relative">
            <input
              className="input font-mono"
              value={brand.whatsapp || ''}
              onChange={(e) =>
                setBrand((curr) => ({ ...curr, whatsapp: e.target.value.trim() }))
              }
              placeholder="6285186852535"
            />
            <MessageCircle size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" />
          </div>
        </Field>

        <Field
          label="Instagram Handle (BRAND_INSTAGRAM)"
          hint="Handle with '@' prefix displayed across public badges and testimonials."
        >
          <div className="relative">
            <input
              className="input font-mono"
              value={brand.instagram || ''}
              onChange={(e) =>
                setBrand((curr) => ({ ...curr, instagram: e.target.value.trim() }))
              }
              placeholder="@worthtobuy_sub"
            />
            <Instagram size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-pink-500" />
          </div>
        </Field>

        <Field
          label="Instagram Profile URL (BRAND_INSTAGRAM_URL)"
          hint="Full profile link for clickable social icons & marketing cards."
        >
          <div className="relative">
            <input
              className="input font-mono text-xs"
              value={brand.instagramUrl || ''}
              onChange={(e) =>
                setBrand((curr) => ({ ...curr, instagramUrl: e.target.value.trim() }))
              }
              placeholder="https://www.instagram.com/worthtobuy_sub"
            />
            <ExternalLink size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-400" />
          </div>
        </Field>

        <Field label="Primary Brand Color" hint="Hex color code used for accents, buttons and branding.">
          <div className="flex items-center gap-2">
            <input
              type="color"
              className="h-10 w-12 cursor-pointer rounded-xl border border-brand-200 bg-white p-1"
              value={brand.primaryColor || '#b7332b'}
              onChange={(e) =>
                setBrand((curr) => ({ ...curr, primaryColor: e.target.value }))
              }
            />
            <input
              className="input font-mono uppercase text-xs flex-1"
              value={brand.primaryColor || ''}
              onChange={(e) =>
                setBrand((curr) => ({ ...curr, primaryColor: e.target.value }))
              }
              placeholder="#b7332b"
            />
            <Palette size={16} className="text-brand-400" />
          </div>
        </Field>

        <div className="md:col-span-2 xl:col-span-3">
          <label className="label">Brand Logo</label>
          <p className="mb-2 text-[11px] text-brand-400">
            Upload your official brand logo image (PNG, JPG, WEBP, or SVG up to 1 MB).
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-2xl border border-dashed border-brand-200 bg-brand-50/40 p-4">
            {/* Logo Preview */}
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-brand-200 bg-white shadow-xs">
              {brand.logoUrl ? (
                <img
                  src={brand.logoUrl}
                  alt="Brand Logo"
                  className="h-full w-full object-contain p-1"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/worthtobuy-logo.png';
                  }}
                />
              ) : (
                <ImageIcon size={28} className="text-brand-300" />
              )}
            </div>

            {/* Actions */}
            <div className="flex-1 space-y-2 w-full">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="file"
                  id="brand-logo-file-input"
                  className="hidden"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={handleFileSelect}
                  disabled={isUploading}
                />
                <label
                  htmlFor="brand-logo-file-input"
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold shadow-xs transition cursor-pointer ${
                    isUploading
                      ? 'bg-brand-200 text-brand-500 cursor-not-allowed'
                      : 'bg-brand-900 text-white hover:bg-brand-800'
                  }`}
                >
                  {isUploading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud size={14} />
                      <span>{brand.logoUrl ? 'Change Logo' : 'Upload Logo'}</span>
                    </>
                  )}
                </label>

                {brand.logoUrl && (
                  <button
                    type="button"
                    onClick={handleDeleteLogo}
                    className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-100 transition"
                  >
                    <Trash2 size={13} />
                    <span>Delete Logo</span>
                  </button>
                )}
              </div>

              {uploadError && (
                <p className="text-xs font-semibold text-rose-600">{uploadError}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Helpful preview bar */}
      <div className="mt-6 rounded-2xl bg-slate-900 p-4 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl font-black text-white text-xs shadow-xs"
            style={{ backgroundColor: brand.primaryColor || '#b7332b' }}
          >
            WTB
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-rose-300">
              Live Preview for Customers
            </p>
            <p className="text-sm font-extrabold text-white">
              {brand.name || 'WORTHTOBUY'} &bull;{' '}
              <span className="text-slate-300 font-medium text-xs">
                {brand.tagline || 'Your Trusted Jastip Bestie'}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {brand.instagramUrl && (
            <a
              href={brand.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs font-bold text-white transition"
            >
              <Instagram size={14} className="text-pink-400" />
              <span>{brand.instagram || 'Instagram'}</span>
            </a>
          )}
          {cleanWa && (
            <a
              href={previewWaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white transition"
            >
              <MessageCircle size={14} />
              <span>+{cleanWa}</span>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
