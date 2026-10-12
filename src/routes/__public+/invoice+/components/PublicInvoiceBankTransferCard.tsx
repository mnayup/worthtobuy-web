import React, { useState } from 'react';
import { CreditCard, Copy, Check, Building2 } from 'lucide-react';

interface PublicInvoiceBankTransferCardProps {
  bankSettings: any;
  invoiceNumber: string;
}

export function PublicInvoiceBankTransferCard({
  bankSettings,
  invoiceNumber,
}: PublicInvoiceBankTransferCardProps) {
  const [copied, setCopied] = useState(false);

  const bankName = bankSettings.bankName || 'BCA (Bank Central Asia)';
  const accountNumber = bankSettings.accountNumber || '1234567890';
  const accountHolder = bankSettings.accountHolder || 'WORTHTOBUY';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-3xl border border-brand-200/90 bg-white p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-2.5 border-b border-brand-100 pb-3">
        <div
          className={
            'grid h-8 w-8 place-items-center rounded-xl bg-brand-900 text-white font-black'
          }
        >
          <CreditCard size={16} />
        </div>
        <div>
          <h2 className="text-sm font-black uppercase tracking-wider text-brand-950">
            Payment Transfer Account (Rekening Pembayaran)
          </h2>
          <p className="text-[11px] text-brand-500">
            Transfer directly to our official bank account below.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border-2 border-brand-800 bg-brand-50/70 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-brand-700">
            <Building2 size={16} className="text-brand-800" />
            <span>{bankName}</span>
          </div>
          <span
            className={
              'rounded-md bg-brand-200/80 px-2 py-0.5 text-[10px] font-black text-brand-900'
            }
          >
            Official Account
          </span>
        </div>

        <div
          className={
            'flex items-center justify-between gap-3 bg-white p-3 rounded-xl ' +
            'border border-brand-200 shadow-2xs'
          }
        >
          <div>
            <span className="block text-[10px] font-bold uppercase text-brand-400">
              Account Number (Nomor Rekening)
            </span>
            <span className="text-lg sm:text-xl font-black text-brand-950 tracking-wider">
              {accountNumber}
            </span>
          </div>
          <button
            type="button"
            onClick={copyToClipboard}
            className={
              'inline-flex items-center gap-1.5 rounded-xl px-3 py-2 ' +
              'text-xs font-black transition ' +
              (copied
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-brand-900 text-white hover:bg-brand-800 shadow-xs')
            }
          >
            {copied ? (
              <>
                <Check size={14} /> Copied!
              </>
            ) : (
              <>
                <Copy size={14} /> Copy (Salin)
              </>
            )}
          </button>
        </div>

        <div className="text-xs">
          <span className="text-[11px] text-brand-500 block">
            Account Holder Name (Atas Nama):
          </span>
          <p className="font-extrabold text-brand-900 text-sm mt-0.5">{accountHolder}</p>
        </div>

        <p
          className={
            'text-[11px] text-brand-600 font-medium leading-relaxed border-t ' +
            'border-brand-200/60 pt-2'
          }
        >
          * Please include your invoice number <strong>{invoiceNumber}</strong> in the notes.
        </p>
      </div>
    </div>
  );
}
