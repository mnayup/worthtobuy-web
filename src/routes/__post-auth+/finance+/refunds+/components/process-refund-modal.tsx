import { useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowUpRight, CheckCircle2, DollarSign, Wallet, X } from 'lucide-react';
import { api, errorMessage } from '~/lib/api';
import { money } from '~/lib/format';
import type { Refund } from '../types';

interface ProcessRefundModalProps {
  open: boolean;
  refund: Refund | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function ProcessRefundModal({ open, refund, onClose, onSuccess }: ProcessRefundModalProps) {
  const [refundType, setRefundType] = useState<'CUSTOMER_DEPOSIT' | 'DIRECT_TRANSFER'>(
    (refund?.refundType as any) || 'CUSTOMER_DEPOSIT'
  );
  const [notes, setNotes] = useState('');
  const [refundedAt, setRefundedAt] = useState(new Date().toISOString().slice(0, 16));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!open || !refund) return null;

  const customerName =
    refund.customer?.fullName ||
    refund.invoice?.customer?.fullName ||
    refund.order?.customer?.fullName ||
    'Customer';

  const targetLabel =
    refund.invoice?.invoiceNumber ||
    refund.order?.orderNumber ||
    (refund.invoiceId ? `Invoice #${refund.invoiceId}` : refund.orderId ? `Order #${refund.orderId}` : '-');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!refund) return;
    setSaving(true);
    setError('');
    try {
      await api.put(`/refunds/${refund.id}/process`, {
        refundType,
        notes: notes.trim() || undefined,
        refundedAt: refundedAt ? new Date(refundedAt).toISOString() : new Date().toISOString(),
      });
      onSuccess();
      onClose();
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setSaving(false);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-brand-950/40 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="max-h-[94vh] w-full max-w-xl overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl border border-brand-100">
        <div className="flex items-center justify-between border-b border-brand-100 px-6 py-4 bg-brand-50/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-cherry-100 px-2 py-0.5 text-[11px] font-black uppercase text-cherry-700">
                Process Refund
              </span>
              <span className="text-xs font-bold text-brand-600">{refund.refundNumber}</span>
            </div>
            <h2 className="mt-1 text-base font-black text-brand-950">
              Pilih Metode Pengembalian Dana
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-brand-400 hover:bg-brand-100 hover:text-brand-700 transition"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit} className="scrollbar-thin max-h-[calc(94vh-80px)] overflow-y-auto p-6">
          {error && (
            <div className="mb-4 rounded-xl bg-cherry-50 border border-cherry-200 p-3 text-sm font-bold text-cherry-700">
              {error}
            </div>
          )}

          {/* Refund Context Card */}
          <div className="mb-5 rounded-2xl border border-brand-200 bg-brand-50/70 p-4">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-brand-500 font-semibold">Pelanggan</p>
                <p className="font-extrabold text-brand-900 mt-0.5">{customerName}</p>
              </div>
              <div>
                <p className="text-brand-500 font-semibold">Dokumen Terkait</p>
                <p className="font-extrabold text-brand-900 mt-0.5">{targetLabel}</p>
              </div>
              <div>
                <p className="text-brand-500 font-semibold">Alasan Refund</p>
                <p className="font-bold text-brand-800 mt-0.5">{refund.reason}</p>
              </div>
              <div>
                <p className="text-brand-500 font-semibold">Nominal Refund</p>
                <p className="text-sm font-black text-cherry-600 mt-0.5">{money(refund.amount)}</p>
              </div>
            </div>
          </div>

          {/* 2 Types Resolution Picker */}
          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-wider text-brand-700">
              Pilih Jenis Penyelesaian Refund:
            </label>

            {/* Option 1: Customer Deposit */}
            <div
              onClick={() => setRefundType('CUSTOMER_DEPOSIT')}
              className={`cursor-pointer rounded-2xl border-2 p-4 transition-all duration-150 ${
                refundType === 'CUSTOMER_DEPOSIT'
                  ? 'border-purple-600 bg-purple-50/40 shadow-sm ring-2 ring-purple-600/10'
                  : 'border-brand-200 bg-white hover:border-brand-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border ${
                    refundType === 'CUSTOMER_DEPOSIT'
                      ? 'border-purple-300 bg-purple-600 text-white'
                      : 'border-brand-200 bg-brand-100 text-brand-600'
                  }`}
                >
                  <Wallet size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-brand-950">
                      1. Simpan sebagai Saldo Deposit Pelanggan
                    </span>
                    <span className="rounded-md bg-purple-100 px-2 py-0.5 text-[10px] font-black text-purple-800">
                      Rekomendasi
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-brand-600 leading-relaxed">
                    Nominal <strong>{money(refund.amount)}</strong> akan masuk ke saldo deposit akun customer ini. Pada tagihan invoice atau order berikutnya, saldo ini bisa digunakan untuk <strong>memotong total pembayaran secara opsional</strong>.
                  </p>
                </div>
              </div>
            </div>

            {/* Option 2: Direct Transfer */}
            <div
              onClick={() => setRefundType('DIRECT_TRANSFER')}
              className={`cursor-pointer rounded-2xl border-2 p-4 transition-all duration-150 ${
                refundType === 'DIRECT_TRANSFER'
                  ? 'border-sky-600 bg-sky-50/40 shadow-sm ring-2 ring-sky-600/10'
                  : 'border-brand-200 bg-white hover:border-brand-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border ${
                    refundType === 'DIRECT_TRANSFER'
                      ? 'border-sky-300 bg-sky-600 text-white'
                      : 'border-brand-200 bg-brand-100 text-brand-600'
                  }`}
                >
                  <ArrowUpRight size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-brand-950">
                      2. Transfer Kembali ke Rekening Pelanggan
                    </span>
                    <span className="rounded-md bg-sky-100 px-2 py-0.5 text-[10px] font-black text-sky-800">
                      Kirim Balik Tunai
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-brand-600 leading-relaxed">
                    Dana <strong>{money(refund.amount)}</strong> ditransfer langsung kembali ke nomor rekening / bank pelanggan. Tidak dimasukkan ke saldo deposit akun.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label">Tanggal & Waktu Realisasi</label>
              <input
                type="datetime-local"
                className="input"
                value={refundedAt}
                onChange={(e) => setRefundedAt(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Catatan Tambahan / Ref Bank (Opsional)</label>
              <input
                type="text"
                className="input"
                placeholder={
                  refundType === 'CUSTOMER_DEPOSIT'
                    ? 'e.g., dialihkan ke saldo deposit'
                    : 'e.g., Transfer BCA No. Ref 123456'
                }
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-brand-100 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={saving}>
              Batal
            </button>
            <button
              type="submit"
              className={`btn text-white ${
                refundType === 'CUSTOMER_DEPOSIT'
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : 'bg-sky-600 hover:bg-sky-700'
              }`}
              disabled={saving}
            >
              {saving ? (
                'Memproses...'
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>
                    Konfirmasi {refundType === 'CUSTOMER_DEPOSIT' ? 'Jadikan Deposit' : 'Transfer Balik'}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
