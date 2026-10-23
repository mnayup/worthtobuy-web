import React, { useState, useEffect } from 'react';
import { CheckCircle2, Loader2, Archive, Package, Lock } from 'lucide-react';
import { useS3Upload } from '~/hooks/useS3Upload';
import { money } from '~/lib/format';
import { ProofUploadDropzone } from './ProofUploadDropzone';
import {
  PendingProofBanner,
  WaitingSettlementBanner,
  PaidInFullBanner,
  PAYMENT_METHODS,
} from './PublicInvoiceProofStatusBanners';

interface Props {
  invoice?: any;
  payments?: any[];
  currentStage: 'DP' | 'SETTLEMENT' | 'PAID' | 'FULL_UNPAID';
  dpAmount: number;
  totalBill: number;
  paidAmount: number;
  outstandingAmount: number;
  submitting: boolean;
  onSubmitProof: (data: {
    amount: number;
    method: string;
    destinationAccount?: string;
    proofUrl: string;
    notes?: string;
    keepItem?: boolean;
    shippingMethod?: 'MANUAL' | 'SHOPEE';
    shopeeUsername?: string;
  }) => Promise<boolean>;
  bankSettings: any;
  pendingPayments: any[];
  isOrdersWaitingSettlement: boolean;
  shippingMethod?: 'MANUAL' | 'SHOPEE';
  shopeeUsername?: string;
}

export function PublicInvoiceProofUploadForm(props: Props) {
  const {
    invoice,
    payments,
    currentStage,
    dpAmount,
    totalBill,
    paidAmount,
    outstandingAmount,
    submitting,
    onSubmitProof,
    bankSettings,
    pendingPayments,
    isOrdersWaitingSettlement,
  } = props;

  const isFirstProof = !payments || payments.length === 0;
  const existingKeepItem = (invoice?.orders || []).some((link: any) =>
    (link.order?.items || []).some((it: any) => it.kept_until || it.fulfillment_status === 'KEPT')
  );
  const existingKeptUntil = (invoice?.orders || []).flatMap((link: any) =>
    (link.order?.items || []).map((it: any) => it.kept_until).filter(Boolean)
  )[0];

  const [keepItem, setKeepItem] = useState(existingKeepItem);

  const isSettlement = paidAmount > 0 && isOrdersWaitingSettlement;
  const defaultTarget = isSettlement
    ? outstandingAmount
    : currentStage === 'DP'
      ? dpAmount
      : totalBill || outstandingAmount;

  const [amountStr, setAmountStr] = useState(String(defaultTarget || ''));
  const [method, setMethod] = useState('Bank Transfer BCA');
  const [notes, setNotes] = useState('');
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [formError, setFormError] = useState('');

  const { uploadFile, isUploading, error: uploadError } = useS3Upload();

  useEffect(() => {
    if (defaultTarget > 0 && !amountStr) {
      setAmountStr(String(defaultTarget));
    }
  }, [defaultTarget]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormError('');

    if (/\.hei[cf]$/i.test(file.name) || file.type.includes('heic') || file.type.includes('heif')) {
      try {
        const heic2any = (await import('heic2any')).default;
        const converted = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.85 });
        const blob = Array.isArray(converted) ? converted[0] : converted;
        setLocalPreview(URL.createObjectURL(blob));
      } catch {
        setLocalPreview(URL.createObjectURL(file));
      }
    } else {
      setLocalPreview(URL.createObjectURL(file));
    }

    const publicUrl = await uploadFile(file, 'payments', 'image');
    if (publicUrl) {
      setUploadedUrl(publicUrl);
    } else {
      setLocalPreview(null);
    }
  };

  const clearProof = () => {
    setLocalPreview(null);
    setUploadedUrl('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const numericAmount = Number(amountStr.replace(/\D/g, ''));
    if (!numericAmount || numericAmount <= 0) {
      setFormError('Please enter a valid payment amount.');
      return;
    }

    if (!uploadedUrl) {
      setFormError('Please upload an image receipt/screenshot of your transfer.');
      return;
    }

    const isQris = method.toUpperCase().includes('QRIS');
    const dest = isQris
      ? `QRIS - ${bankSettings.accountHolder || 'WORTHTOBUY'}`
      : `${bankSettings.bankName || 'BCA'} - ${bankSettings.accountNumber || ''}`;
    const success = await onSubmitProof({
      amount: numericAmount,
      method,
      destinationAccount: dest,
      proofUrl: uploadedUrl,
      notes: notes || undefined,
      keepItem: isFirstProof ? keepItem : undefined,
      shippingMethod: isFirstProof ? props.shippingMethod : undefined,
      shopeeUsername: isFirstProof ? props.shopeeUsername : undefined,
    });

    if (success) {
      setUploadedUrl('');
      setLocalPreview(null);
      setNotes('');
    }
  };

  if (currentStage === 'PAID' || (outstandingAmount <= 0 && paidAmount > 0)) {
    return <PaidInFullBanner />;
  }

  // 1. If customer already transferred and proof is pending verification
  const isPendingQris = (pendingPayments || []).some((p: any) =>
    String(p.method || '').toUpperCase().includes('QRIS')
  );

  // If there are pending non-QRIS payments (e.g. Bank Transfer) and method isn't QRIS, block.
  // But if it's QRIS, allow multiple submit so customer can upload multiple partial QRIS proofs.
  const hasPendingNonQris = (pendingPayments || []).some(
    (p: any) => !String(p.method || '').toUpperCase().includes('QRIS')
  );

  if (hasPendingNonQris && !method.toUpperCase().includes('QRIS')) {
    return <PendingProofBanner pendingPayment={pendingPayments[0]} />;
  }

  // 2. If already paid (DP) but orders are not yet WAITING_SETTLEMENT
  if (paidAmount > 0 && !isOrdersWaitingSettlement) {
    return (
      <WaitingSettlementBanner
        paidAmount={paidAmount}
        outstandingAmount={outstandingAmount}
      />
    );
  }

  const formattedAmount = amountStr ? Number(amountStr).toLocaleString('id-ID') : '';
  const title = isSettlement
    ? 'Upload Proof of Settlement (Konfirmasi Pembayaran Pelunasan)'
    : 'Upload Proof of Transfer (Konfirmasi Pembayaran)';
  const subtitle = isSettlement
    ? 'Unggah bukti transfer pelunasan pesanan Anda. Admin kami akan segera memverifikasinya.'
    : 'Upload your bank transfer screenshot / receipt here. Our admin team will verify it.';

  return (
    <div
      className={
        'rounded-3xl border border-brand-200/90 bg-white p-5 sm:p-7 ' +
        'shadow-sm space-y-5'
      }
    >
      {/* If there are pending proofs, show compact notice above the upload fields */}
      {pendingPayments && pendingPayments.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
              <span>⏳</span> Bukti Pembayaran Sebelumnya Menunggu Verifikasi ({pendingPayments.length})
            </span>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded-md">
              QRIS Multiple Submit Aktif
            </span>
          </div>
          <div className="divide-y divide-amber-200/60 max-h-32 overflow-y-auto text-xs">
            {pendingPayments.map((p: any) => (
              <div key={p.id} className="py-1.5 flex items-center justify-between text-amber-900">
                <span className="font-semibold">{p.method || 'QRIS'}: <strong>{money(Number(p.amount))}</strong></span>
                <span className="text-[10px] text-amber-700">Status: Menunggu Cek Admin</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center gap-2">
          <span
            className={
              'grid h-7 w-7 place-items-center rounded-lg bg-cherry-600 ' +
              'text-white font-black text-xs'
            }
          >
            ✓
          </span>
          <h2 className="text-base font-black text-brand-950">{title}</h2>
        </div>
        <p className="text-xs text-brand-500 mt-1">{subtitle}</p>
      </div>

      {(formError || uploadError) && (
        <div
          className={
            'rounded-xl bg-cherry-50 border border-cherry-200 p-3 ' +
            'text-xs font-bold text-cherry-700'
          }
        >
          {formError || uploadError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold text-brand-800 mb-1">
              Amount Transferred (Nominal Transfer) *
            </label>
            <div className="relative">
              <span
                className={
                  'absolute left-3.5 top-1/2 -translate-y-1/2 text-xs ' +
                  'font-black text-brand-600'
                }
              >
                Rp
              </span>
              <input
                type="text"
                required
                className={
                  'w-full rounded-xl border border-brand-200 bg-brand-50/40 ' +
                  'py-2 pl-10 pr-3 text-sm font-black text-brand-950 ' +
                  'focus:border-brand-500'
                }
                value={formattedAmount}
                onChange={(e) => setAmountStr(e.target.value.replace(/\D/g, ''))}
                placeholder="0"
              />
            </div>
            {defaultTarget > 0 && (
              <p className="text-[10px] text-brand-400 mt-1">
                Suggested target: {money(defaultTarget)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-800 mb-1">
              Payment Method (Metode Pembayaran) *
            </label>
            <select
              className={
                'w-full rounded-xl border border-brand-200 bg-brand-50/40 ' +
                'py-2 px-3 text-xs font-bold text-brand-950 focus:border-brand-500'
              }
              value={method}
              onChange={(e) => setMethod(e.target.value)}
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-brand-800 mb-1">
            Proof of Transfer Image (Foto / Screenshot Bukti Transfer) *
          </label>

          <ProofUploadDropzone
            localPreview={localPreview}
            uploadedUrl={uploadedUrl}
            isUploading={isUploading}
            onFileChange={handleFileChange}
            onClear={clearProof}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-brand-800 mb-1">
            Notes / Sender Name (Nama Pengirim / Catatan - optional)
          </label>
          <input
            type="text"
            className={
              'w-full rounded-xl border border-brand-200 bg-brand-50/40 ' +
              'py-2 px-3 text-xs text-brand-950 focus:border-brand-500 focus:outline-none'
            }
            placeholder="e.g., Transfer dari rekening an Kak Anita"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Pilihan Pengiriman / Titip Simpan (Keep Item Selection) */}
        {isFirstProof ? (
          <div className="rounded-2xl border border-brand-200/90 bg-brand-50/50 p-4 space-y-2.5">
            <div>
              <label className="block text-xs font-black text-brand-900">
                Pilihan Pengiriman / Titip Simpan (Delivery or Storage Option) *
              </label>
              <p className="text-[11px] text-brand-600 mt-0.5">
                Pilih apakah barang ingin langsung dikirim ke alamat Anda setelah tiba, atau dititip simpan di warehouse kami terlebih dahulu:
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setKeepItem(false)}
                className={`flex items-start gap-2.5 rounded-xl border p-3 text-left transition ${
                  !keepItem
                    ? 'border-brand-900 bg-brand-900 text-white shadow-sm'
                    : 'border-brand-200 bg-white text-brand-800 hover:bg-brand-50'
                }`}
              >
                <Package size={18} className="shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-black">Kirim Langsung (Direct Shipment)</p>
                  <p className={`text-[10px] mt-0.5 ${!keepItem ? 'text-brand-200' : 'text-brand-500'}`}>
                    Barang segera dikemas & dikirim ke alamat setelah pembelanjaan tiba.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setKeepItem(true)}
                className={`flex items-start gap-2.5 rounded-xl border p-3 text-left transition ${
                  keepItem
                    ? 'border-brand-900 bg-brand-900 text-white shadow-sm'
                    : 'border-brand-200 bg-white text-brand-800 hover:bg-brand-50'
                }`}
              >
                <Archive size={18} className="shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-black">Titip Simpan (Keep 1 Month)</p>
                  <p className={`text-[10px] mt-0.5 ${keepItem ? 'text-brand-200' : 'text-brand-500'}`}>
                    Disimpan aman di warehouse kami selama 1 bulan gratis sejak pembayaran pertama.
                  </p>
                </div>
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-brand-200/90 bg-brand-50/50 p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              {existingKeepItem ? (
                <Archive size={18} className="text-indigo-600 shrink-0" />
              ) : (
                <Package size={18} className="text-brand-600 shrink-0" />
              )}
              <div>
                <p className="text-xs font-bold text-brand-900">
                  Pilihan Pengiriman:{' '}
                  <span className="font-black text-indigo-700">
                    {existingKeepItem ? 'Titip Simpan (Keep Items)' : 'Kirim Langsung (Direct Shipment)'}
                  </span>
                </p>
                <p className="text-[10px] text-brand-500">
                  {existingKeepItem
                    ? `Barang dititip simpan s/d ${new Date(existingKeptUntil || Date.now() + 30 * 86400000).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`
                    : 'Barang akan dikirim langsung setelah pesanan selesai diproses.'}
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] bg-brand-200/80 text-brand-700 font-bold px-2.5 py-1 rounded-lg shrink-0">
              <Lock size={11} /> Hanya Lihat
            </span>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || isUploading || !uploadedUrl}
          className={
            'w-full rounded-2xl bg-cherry-600 py-3 px-4 text-xs font-black ' +
            'text-white hover:bg-cherry-700 disabled:opacity-50 transition ' +
            'shadow-sm flex items-center justify-center gap-2'
          }
        >
          {submitting || isUploading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              {isUploading ? 'Uploading Image...' : 'Submitting Proof...'}
            </>
          ) : (
            <>
              <CheckCircle2 size={16} />
              {isSettlement
                ? 'Submit Proof of Settlement (Kirim Bukti Pelunasan)'
                : 'Submit Proof of Transfer (Kirim Bukti Pembayaran)'}
            </>
          )}
        </button>
      </form>
    </div>
  );
}
