import React, { useState, useEffect } from 'react';
import { ZoomIn, ExternalLink, Download, FileImage, Loader2, AlertCircle } from 'lucide-react';

interface Props {
  proofUrl?: string | null;
}

export function VerifyProofPreview({ proofUrl }: Props) {
  const [zoomed, setZoomed] = useState(false);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [converting, setConverting] = useState(false);
  const [conversionFailed, setConversionFailed] = useState(false);
  const [hasError, setHasError] = useState(false);

  const isHeic = Boolean(proofUrl && /\.hei[cf](\?.*)?$/i.test(proofUrl));

  useEffect(() => {
    let active = true;
    let createdUrl: string | null = null;

    setConvertedUrl(null);
    setConversionFailed(false);
    setHasError(false);

    if (proofUrl && isHeic) {
      setConverting(true);
      fetch(proofUrl)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch image');
          return res.blob();
        })
        .then(async (blob) => {
          const heic2any = (await import('heic2any')).default;
          const converted = await heic2any({
            blob,
            toType: 'image/jpeg',
            quality: 0.85,
          });
          const resultBlob = Array.isArray(converted) ? converted[0] : converted;
          if (active) {
            createdUrl = URL.createObjectURL(resultBlob);
            setConvertedUrl(createdUrl);
            setConverting(false);
          }
        })
        .catch((err) => {
          console.warn('Failed to convert HEIC preview:', err);
          if (active) {
            setConversionFailed(true);
            setConverting(false);
          }
        });
    }

    return () => {
      active = false;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [proofUrl, isHeic]);

  if (!proofUrl) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-brand-200 p-8 text-center text-xs text-brand-400">
        No proof image attached.
      </div>
    );
  }

  const effectiveSrc = convertedUrl || proofUrl;

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-brand-200 p-2 text-center bg-white">
        {converting ? (
          <div className="flex flex-col items-center justify-center p-8 space-y-2 bg-brand-50/50 rounded-xl min-h-[220px]">
            <Loader2 className="animate-spin text-honey-600" size={24} />
            <p className="text-xs font-bold text-brand-700">Converting Apple HEIC image...</p>
            <p className="text-[11px] text-brand-400">Processing preview for browser compatibility</p>
          </div>
        ) : (hasError && isHeic) || conversionFailed ? (
          <div className="flex flex-col items-center justify-center p-6 space-y-3 bg-brand-50/60 rounded-xl min-h-[220px]">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-honey-100 text-honey-700">
              <FileImage size={24} />
            </div>
            <div className="text-center">
              <span className="inline-block rounded px-2 py-0.5 text-[10px] font-black uppercase bg-honey-200 text-honey-900 mb-1">
                Apple HEIC / HEIF Format
              </span>
              <p className="text-xs font-bold text-brand-900">Apple format cannot be displayed in browser</p>
              <p className="text-[11px] text-brand-500 mt-0.5 max-w-xs mx-auto">
                This image was taken on an iPhone/Mac in HEIC format. You can download or open it in your system viewer.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <a
                href={proofUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary !py-1.5 text-xs flex items-center gap-1.5"
              >
                <Download size={14} /> Download Image
              </a>
              <a
                href={proofUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary !py-1.5 text-xs flex items-center gap-1.5"
              >
                <ExternalLink size={14} /> Open in Tab
              </a>
            </div>
          </div>
        ) : (
          <div className="relative group max-h-[300px] overflow-hidden rounded-xl bg-black/5 flex items-center justify-center">
            <img
              src={effectiveSrc}
              alt="Transfer Receipt"
              onError={() => setHasError(true)}
              className="max-h-[280px] w-auto mx-auto object-contain rounded-lg"
            />
            {isHeic && convertedUrl && (
              <span className="absolute top-2 left-2 rounded-md bg-brand-900/80 backdrop-blur-sm px-2 py-0.5 text-[10px] font-bold text-white shadow">
                HEIC (Converted)
              </span>
            )}
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setZoomed(true)}
                className="rounded-xl bg-white/95 p-2 text-xs font-bold flex items-center gap-1 shadow"
              >
                <ZoomIn size={14} /> Zoom
              </button>
              <a
                href={effectiveSrc}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-white/95 p-2 text-xs font-bold flex items-center gap-1 shadow"
              >
                <ExternalLink size={14} /> Open Tab
              </a>
              <a
                href={proofUrl}
                download
                className="rounded-xl bg-white/95 p-2 text-xs font-bold flex items-center gap-1 shadow"
              >
                <Download size={14} /> Download
              </a>
            </div>
          </div>
        )}
      </div>

      {zoomed && (
        <div
          className="fixed inset-0 z-[120] bg-black/85 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setZoomed(false)}
        >
          <img
            src={effectiveSrc}
            alt="Proof Zoomed"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl"
          />
        </div>
      )}
    </>
  );
}
