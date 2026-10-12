import React, { useState } from 'react';
import { ZoomIn, ExternalLink } from 'lucide-react';

interface Props {
  proofUrl?: string | null;
}

export function VerifyProofPreview({ proofUrl }: Props) {
  const [zoomed, setZoomed] = useState(false);

  if (!proofUrl) {
    return (
      <div
        className={
          'rounded-2xl border-2 border-dashed border-brand-200 p-8 ' +
          'text-center text-xs text-brand-400'
        }
      >
        No proof image attached.
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-brand-200 p-2 text-center">
        <div className="relative group max-h-[300px] overflow-hidden rounded-xl bg-black/5">
          <img
            src={proofUrl}
            alt="Transfer Receipt"
            className="max-h-[280px] w-auto mx-auto object-contain rounded-lg"
          />
          <div
            className={
              'absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 ' +
              'transition flex items-center justify-center gap-2'
            }
          >
            <button
              type="button"
              onClick={() => setZoomed(true)}
              className="rounded-xl bg-white/95 p-2 text-xs font-bold flex items-center gap-1"
            >
              <ZoomIn size={14} /> Zoom
            </button>
            <a
              href={proofUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-white/95 p-2 text-xs font-bold flex items-center gap-1"
            >
              <ExternalLink size={14} /> Open Tab
            </a>
          </div>
        </div>
      </div>

      {zoomed && (
        <div
          className={
            'fixed inset-0 z-[120] bg-black/85 flex items-center ' +
            'justify-center p-4 cursor-pointer'
          }
          onClick={() => setZoomed(false)}
        >
          <img
            src={proofUrl}
            alt="Proof Zoomed"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl"
          />
        </div>
      )}
    </>
  );
}
