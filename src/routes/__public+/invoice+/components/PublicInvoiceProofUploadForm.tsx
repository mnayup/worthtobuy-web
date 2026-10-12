import React, { useState, useEffect } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
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
  }) => Promise<boolean>;
  bankSettings: any;
  pendingPayments: any[];
  isOrdersWaitingSettlement: boolean;
}

export function PublicInvoiceProofUploadForm(props: Props) {
  const {
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
    const previewUrl = URL.createObjectURL(file);
    setLocalPreview(previewUrl);

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

    const dest = `${bankSettings.bankName || 'BCA'} - ${bankSettings.accountNumber || ''}`;
    const success = await onSubmitProof({
      amount: numericAmount,
      method,
      destinationAccount: dest,
      proofUrl: uploadedUrl,
      notes: notes || undefined,
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
  if (pendingPayments && pendingPayments.length > 0) {
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
