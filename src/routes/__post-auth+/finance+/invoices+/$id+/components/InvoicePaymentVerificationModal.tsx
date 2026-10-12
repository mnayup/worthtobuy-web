import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, XCircle, PlusCircle, Loader2 } from 'lucide-react';
import dayjs from 'dayjs';
import { api, errorMessage } from '~/lib/api';
import { VerifyProofPreview } from './VerifyProofPreview';

interface Props {
  open: boolean;
  payment: any | null;
  invoice: any;
  onClose: () => void;
  onSuccess: () => void;
  onRecordNewPayment: () => void;
}

export function InvoicePaymentVerificationModal(props: Props) {
  const { open, payment, invoice, onClose, onSuccess, onRecordNewPayment } = props;
  const [amountStr, setAmountStr] = useState('');
  const [method, setMethod] = useState('');
  const [destAccount, setDestAccount] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && payment) {
      setAmountStr(String(payment.amount || ''));
      setMethod(payment.method || payment.payment_method || 'Bank Transfer BCA');
      setDestAccount(payment.destination_account || payment.destinationAccount || '');
      const rawDate = payment.payment_date || payment.paymentDate || payment.created_at;
      setPaymentDate(dayjs(rawDate || undefined).format('YYYY-MM-DDTHH:mm'));
      setNotes(payment.notes || '');
      setError('');
    }
  }, [open, payment]);

  if (!open || !payment) return null;

  const handleVerify = async () => {
    setSaving(true);
    setError('');
    try {
      const numericAmount = Number(amountStr.replace(/\D/g, ''));
      if (!numericAmount || numericAmount <= 0) {
        setError('Please enter a valid amount.');
        return;
      }
      await api.put(`/payments/${payment.id}`, {
        amount: numericAmount,
        method,
        destinationAccount: destAccount || null,
        paymentDate: paymentDate ? new Date(paymentDate).toISOString() : new Date().toISOString(),
        notes: notes || null,
        status: 'VERIFIED',
      });
      onSuccess();
      onClose();
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async () => {
    setSaving(true);
    setError('');
    try {
      const rejectNote = notes
        ? `Rejected: ${notes}`
        : 'Bukti transfer tidak valid atau dana belum diterima.';
      await api.put(`/payments/${payment.id}`, {
        notes: rejectNote,
        status: 'REJECTED',
      });
      onSuccess();
      onClose();
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setSaving(false);
    }
  };

  const formattedAmount = amountStr ? Number(amountStr).toLocaleString('id-ID') : '';
  const customerName = invoice?.customer?.full_name || invoice?.customer?.fullName || 'Customer';
  const proofUrl = payment.proof_url || payment.proofUrl;

  return createPortal(
    <div
      className={
        'fixed inset-0 z-[100] flex items-end justify-center bg-brand-950/50 ' +
        'backdrop-blur-sm sm:items-center sm:p-4'
      }
    >
      <div
        className={
          'max-h-[96vh] w-full max-w-3xl overflow-hidden rounded-t-3xl bg-white ' +
          'shadow-2xl sm:rounded-3xl border border-brand-100 flex flex-col'
        }
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-brand-100 px-6 py-4">
          <div>
            <h2 className="font-black text-brand-950 text-base sm:text-lg flex items-center gap-2">
              <span>Verify Customer Payment Proof</span>
              <span
                className={
                  'rounded bg-amber-100 px-2 py-0.5 text-[10px] font-black ' +
                  'text-amber-900 border border-amber-300'
                }
              >
                {payment.status || 'PENDING'}
              </span>
            </h2>
            <p className="text-xs text-brand-500 mt-0.5">
              {payment.payment_number || payment.paymentNumber} • {customerName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-brand-400 hover:bg-brand-100 hover:text-brand-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="scrollbar-thin overflow-y-auto p-5 sm:p-6 space-y-4">
          {error && (
            <div
              className={
                'rounded-xl bg-cherry-50 border border-cherry-200 p-3 text-xs ' +
                'font-bold text-cherry-700'
              }
            >
              {error}
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            {/* Left: Proof Image */}
            <div className="space-y-2">
              <span className="block text-xs font-black uppercase text-brand-800">
                Transfer Receipt (Bukti Transfer)
              </span>
              <VerifyProofPreview proofUrl={proofUrl} />
            </div>

            {/* Right: Edit & Verification Form */}
            <div className="space-y-3">
              <span className="block text-xs font-black uppercase text-brand-800">
                Check & Adjust Details (Koreksi)
              </span>

              <div>
                <label className="block text-xs font-bold text-brand-700 mb-1">
                  Actual Amount Received (Nominal Masuk) *
                </label>
                <div className="relative">
                  <span
                    className={
                      'absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black ' +
                      'text-brand-500'
                    }
                  >
                    Rp
                  </span>
                  <input
                    type="text"
                    required
                    className={
                      'w-full rounded-xl border border-brand-300 py-1.5 pl-9 pr-3 ' +
                      'text-sm font-black text-brand-950 focus:border-brand-500'
                    }
                    value={formattedAmount}
                    onChange={(e) => setAmountStr(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-700 mb-1">
                  Payment Method (Metode Pembayaran)
                </label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-brand-300 py-1.5 px-3 text-xs"
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-700 mb-1">
                  Destination Account / Wallet
                </label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-brand-300 py-1.5 px-3 text-xs"
                  value={destAccount}
                  placeholder="e.g. BCA 1234567890 a.n WORTHTOBUY"
                  onChange={(e) => setDestAccount(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-700 mb-1">
                  Payment Date & Time
                </label>
                <input
                  type="datetime-local"
                  className="w-full rounded-xl border border-brand-300 py-1.5 px-3 text-xs"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-700 mb-1">
                  Audit Notes / Reason (Catatan)
                </label>
                <textarea
                  className="w-full rounded-xl border border-brand-300 p-2 text-xs min-h-[50px]"
                  value={notes}
                  placeholder="Verified with m-banking, or rejection reason..."
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          className={
            'border-t border-brand-100 p-4 sm:px-6 bg-brand-50/40 flex flex-col ' +
            'sm:flex-row items-center justify-between gap-2.5'
          }
        >
          <button
            type="button"
            onClick={() => {
              onClose();
              onRecordNewPayment();
            }}
            className={
              'w-full sm:w-auto inline-flex items-center justify-center gap-1.5 ' +
              'rounded-xl border border-brand-300 bg-white px-3 py-2 text-xs font-bold'
            }
          >
            <PlusCircle size={14} /> Record New Payment Instead (Catat Baru)
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              disabled={saving}
              onClick={handleReject}
              className={
                'flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 ' +
                'rounded-xl bg-cherry-100 border border-cherry-300 px-3.5 py-2 text-xs ' +
                'font-black text-cherry-800 hover:bg-cherry-200 transition'
              }
            >
              <XCircle size={14} /> Reject Proof (Tolak)
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={handleVerify}
              className={
                'flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 ' +
                'rounded-xl bg-emerald-600 px-4 py-2 text-xs font-black text-white ' +
                'hover:bg-emerald-700 transition'
              }
            >
              {saving ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Verifying...
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} /> Verify Payment (Verifikasi)
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
