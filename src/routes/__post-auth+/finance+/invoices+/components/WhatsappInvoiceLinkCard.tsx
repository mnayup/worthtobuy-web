import React, { useState } from 'react';
import { Copy, Check, ExternalLink, Link2 } from 'lucide-react';

interface Props {
  publicInvoiceUrl: string;
}

export function WhatsappInvoiceLinkCard({ publicInvoiceUrl }: Props) {
  const [copied, setCopied] = useState(false);

  if (!publicInvoiceUrl) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(publicInvoiceUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={
        'rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3.5 ' +
        'flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs'
      }
    >
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 font-bold text-emerald-900">
          <Link2 size={15} className="text-emerald-700 shrink-0" />
          <span>Customer Invoice & Proof Upload Link:</span>
        </div>
        <p className="font-mono text-[11px] text-emerald-800 truncate mt-0.5 select-all">
          {publicInvoiceUrl}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={handleCopy}
          className={
            'inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 ' +
            'text-xs font-bold transition ' +
            (copied
              ? 'bg-emerald-600 text-white'
              : 'bg-white border border-emerald-300 text-emerald-900 hover:bg-emerald-100/50')
          }
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          <span>{copied ? 'Copied!' : 'Copy Link'}</span>
        </button>
        <a
          href={publicInvoiceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={
            'inline-flex items-center gap-1 rounded-xl bg-white border ' +
            'border-emerald-300 px-2.5 py-1.5 text-xs font-bold text-emerald-900 ' +
            'hover:bg-emerald-100/50 transition'
          }
        >
          <ExternalLink size={13} /> Open
        </a>
      </div>
    </div>
  );
}
