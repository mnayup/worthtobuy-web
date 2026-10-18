import React, { useState } from 'react';
import { CreditCard, Copy, Check, Building2, QrCode, Download, ZoomIn, X, Info } from 'lucide-react';

interface PublicInvoiceBankTransferCardProps {
  bankSettings: any;
  invoiceNumber: string;
}

export function PublicInvoiceBankTransferCard({
  bankSettings,
  invoiceNumber,
}: PublicInvoiceBankTransferCardProps) {
  const [activeTab, setActiveTab] = useState<'bank' | 'qris'>('bank');
  const [copied, setCopied] = useState(false);
  const [showZoomModal, setShowZoomModal] = useState(false);

  const bankName = bankSettings.bankName || 'BCA (Bank Central Asia)';
  const accountNumber = bankSettings.accountNumber || '1234567890';
  const accountHolder = bankSettings.accountHolder || 'WORTHTOBUY';

  const qrisImage = bankSettings.qrisImageUrl ? String(bankSettings.qrisImageUrl).trim() : '';
  const hasQris = Boolean(qrisImage);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-3xl border border-brand-200/90 bg-white p-5 sm:p-6 shadow-sm space-y-4">
      {/* Header & Tabs */}
      <div className="space-y-3.5 border-b border-brand-100 pb-3.5">
        {/* Full-length Header at the top */}
        <div className="flex items-center gap-2.5 w-full">
          <div
            className={
              'grid h-9 w-9 place-items-center rounded-xl bg-brand-900 text-white font-black shrink-0 shadow-xs'
            }
          >
            <CreditCard size={18} />
          </div>
          <div className="w-full min-w-0">
            <h2 className="text-sm font-black uppercase tracking-wider text-brand-950">
              Payment Transfer Account
            </h2>
            <p className="text-[11px] text-brand-500">
              {hasQris
                ? 'Pilih Transfer Bank atau Scan QRIS untuk pembayaran'
                : 'Transfer directly to our official bank account below.'}
            </p>
          </div>
        </div>

        {/* Tab buttons: Full width below the header */}
        {hasQris && (
          <div className="grid grid-cols-2 rounded-2xl bg-brand-100/90 p-1 w-full border border-brand-200 shadow-inner">
            <button
              type="button"
              onClick={() => setActiveTab('bank')}
              className={`flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-black transition cursor-pointer ${
                activeTab === 'bank'
                  ? 'bg-white text-brand-950 shadow-sm border border-brand-200/60'
                  : 'text-brand-600 hover:text-brand-900 hover:bg-white/50'
              }`}
            >
              <Building2 size={15} className="shrink-0" />
              <span>Transfer Bank</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('qris')}
              className={`flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-black transition cursor-pointer ${
                activeTab === 'qris'
                  ? 'bg-cherry-600 text-white shadow-sm'
                  : 'text-brand-600 hover:text-brand-900 hover:bg-white/50'
              }`}
            >
              <QrCode size={15} className="shrink-0" />
              <span>QRIS</span>
              <span className={`rounded px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                activeTab === 'qris'
                  ? 'bg-amber-400 text-amber-950'
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}>
                Instant
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Tab 1: Bank Transfer Content */}
      {activeTab === 'bank' && (
        <div className="rounded-2xl border-2 border-brand-800 bg-brand-50/70 p-4 space-y-3 animate-in fade-in-50 duration-200">
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
                'text-xs font-black transition cursor-pointer ' +
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
            * Please include your invoice number <strong>{invoiceNumber}</strong> in the transfer remarks / notes.
          </p>
        </div>
      )}

      {/* Tab 2: QRIS Content */}
      {activeTab === 'qris' && (
        <div className="rounded-2xl border-2 border-cherry-300 bg-gradient-to-b from-cherry-50/60 to-white p-4 sm:p-5 space-y-4 animate-in fade-in-50 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-lg bg-cherry-600 text-white">
                <QrCode size={14} />
              </span>
              <div>
                <span className="font-black text-xs text-brand-950 uppercase tracking-tight block">
                  QRIS Standar Pembayaran Nasional
                </span>
                <span className="text-[10px] text-brand-500 font-medium">
                  {accountHolder}
                </span>
              </div>
            </div>
            <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 border border-emerald-200">
              Bebas Biaya Admin
            </span>
          </div>

          {/* QR Code Container - Centered and Bigger */}
          <div className="flex flex-col items-center bg-white p-4 sm:p-5 rounded-2xl border border-brand-200 shadow-xs space-y-3.5">
            <div className="relative group">
              <div className="w-56 h-56 sm:w-64 sm:h-64 bg-white p-2.5 rounded-2xl border-2 border-brand-900 flex items-center justify-center overflow-hidden shadow-sm">
                <img
                  src={qrisImage}
                  alt="QRIS Worthtobuy"
                  className="w-full h-full object-contain cursor-pointer transition group-hover:scale-102"
                  onClick={() => setShowZoomModal(true)}
                />
              </div>
              <button
                type="button"
                onClick={() => setShowZoomModal(true)}
                className="absolute inset-0 bg-brand-950/40 text-white rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 text-xs font-bold transition backdrop-blur-2xs cursor-pointer"
              >
                <ZoomIn size={18} /> Klik untuk Perbesar
              </button>
            </div>

            <div className="flex flex-wrap gap-2.5 justify-center w-full pt-1">
              <a
                href={qrisImage}
                download={`QRIS-WTB-${invoiceNumber}.png`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-brand-200 bg-brand-50 px-4 py-2 text-xs font-bold text-brand-900 hover:bg-brand-100 transition shadow-2xs"
              >
                <Download size={14} /> Unduh QRIS
              </a>
              <button
                type="button"
                onClick={() => setShowZoomModal(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-900 px-4 py-2 text-xs font-bold text-white hover:bg-brand-800 transition shadow-2xs cursor-pointer"
              >
                <ZoomIn size={14} /> Tampilkan Penuh
              </button>
            </div>
          </div>

          <div className="rounded-xl bg-amber-50 border border-amber-200/80 p-2.5 text-[11px] text-amber-900 flex items-start gap-2">
            <Info size={14} className="text-amber-700 shrink-0 mt-0.5" />
            <span>
              <strong>Pembayaran Bertahap / QRIS:</strong> Anda dapat mengunggah bukti pembayaran QRIS beberapa kali (multiple submit) jika melakukan transfer bertahap.
            </span>
          </div>
        </div>
      )}

      {/* QRIS Fullscreen Zoom Modal */}
      {showZoomModal && (
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center bg-brand-950/85 backdrop-blur-md p-3 sm:p-6 animate-in fade-in-0 duration-200 overflow-y-auto"
          onClick={() => setShowZoomModal(false)}
        >
          <div
            className="relative bg-white rounded-3xl p-5 sm:p-8 max-w-2xl w-full shadow-2xl text-center space-y-5 animate-in zoom-in-95 duration-200 border border-brand-100 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowZoomModal(false)}
              className="absolute right-4 top-4 p-2.5 rounded-2xl text-brand-400 hover:bg-brand-100 hover:text-brand-700 transition cursor-pointer"
            >
              <X size={24} />
            </button>
            <div>
              <span className="text-[11px] font-black uppercase text-brand-400 tracking-wider">
                WORTHTOBUY OFFICIAL QRIS
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-brand-950 mt-1">
                Scan Barcode QRIS untuk Pembayaran
              </h3>
              <p className="text-xs sm:text-sm text-brand-600 font-semibold mt-1">Invoice #{invoiceNumber}</p>
            </div>

            {/* Much Larger QR Display */}
            <div className="w-[85vw] max-w-[480px] h-[85vw] max-h-[480px] sm:w-[500px] sm:h-[500px] mx-auto p-3 sm:p-4 border-2 border-brand-900 rounded-3xl bg-white shadow-lg flex items-center justify-center">
              <img
                src={qrisImage}
                alt="QRIS Fullscreen"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex flex-wrap gap-3 justify-center pt-1">
              <a
                href={qrisImage}
                download={`QRIS-WTB-${invoiceNumber}.png`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl bg-cherry-600 px-6 py-3 text-xs sm:text-sm font-black text-white hover:bg-cherry-700 transition shadow-md shadow-cherry-600/25"
              >
                <Download size={16} /> Unduh Gambar QRIS
              </a>
              <button
                type="button"
                onClick={() => setShowZoomModal(false)}
                className="btn-secondary !py-3 !px-6 text-xs sm:text-sm font-bold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
