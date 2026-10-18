import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ArrowUpRight, CheckCircle2, Building2, CreditCard, User, FileText, Wallet, X, UploadCloud, AlertCircle } from 'lucide-react';
import { api, errorMessage } from '~/lib/api';
import { money } from '~/lib/format';
import { FileUploadInput } from '~/components/FileUploadInput';
import type { Refund } from '../types';

interface ProcessRefundModalProps {
  open: boolean;
  refund: Refund | null;
  mode?: 'method' | 'execute';
  onClose: () => void;
  onSuccess: () => void;
}

export function ProcessRefundModal({ open, refund, mode = 'execute', onClose, onSuccess }: ProcessRefundModalProps) {
  const [refundType, setRefundType] = useState<'CUSTOMER_DEPOSIT' | 'DIRECT_TRANSFER'>('CUSTOMER_DEPOSIT');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [transferNotes, setTransferNotes] = useState('');
  const [notes, setNotes] = useState('');
  const [refundedAt, setRefundedAt] = useState(new Date().toISOString().slice(0, 16));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Sync state whenever open or refund changes
  useEffect(() => {
    if (refund) {
      setRefundType((refund.refundType as any) || 'CUSTOMER_DEPOSIT');
      setBankName(refund.bankName || refund.bank_name || '');
      setAccountNumber(refund.accountNumber || refund.account_number || '');
      setAccountHolder(refund.accountHolder || refund.account_holder || '');
      setProofUrl(refund.proofUrl || refund.proof_url || '');
      setTransferNotes(refund.transferNotes || refund.transfer_notes || '');
      setNotes(refund.notes || '');
      setRefundedAt(new Date().toISOString().slice(0, 16));
      setError('');
    }
  }, [refund, open]);

  if (!open || !refund) return null;

  const isMethodOnly = mode === 'method';

  const customerName =
    refund.customer?.full_name ||
    refund.customer?.fullName ||
    refund.invoice?.customer?.full_name ||
    refund.invoice?.customer?.fullName ||
    refund.order?.customer?.full_name ||
    refund.order?.customer?.fullName ||
    'Customer';

  const targetLabel =
    refund.invoice?.invoice_number ||
    refund.invoice?.invoiceNumber ||
    refund.order?.order_number ||
    refund.order?.orderNumber ||
    (refund.invoice_id || refund.invoiceId
      ? `Invoice #${refund.invoice_id || refund.invoiceId}`
      : refund.order_id || refund.orderId
      ? `Order #${refund.order_id || refund.orderId}`
      : '-');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!refund) return;

    if (refundType === 'DIRECT_TRANSFER') {
      if (!bankName.trim() || !accountNumber.trim() || !accountHolder.trim()) {
        setError('Nama Bank, Nomor Rekening, dan Nama Penerima wajib diisi.');
        return;
      }
    }

    if (!isMethodOnly && refundType === 'DIRECT_TRANSFER' && !proofUrl.trim()) {
      setError('Bukti transfer wajib diunggah sebelum memverifikasi refund rekening!');
      return;
    }

    setSaving(true);
    setError('');
    try {
      if (isMethodOnly) {
        // Step 1: Save refund method & bank account details
        if (refundType === 'CUSTOMER_DEPOSIT') {
          // If customer deposit is chosen, finalize directly to customer's deposit balance
          await api.put(`/refunds/${refund.id}`, {
            refundType: 'CUSTOMER_DEPOSIT',
            status: 'PAID',
            notes: notes.trim() || undefined,
            refundedAt: refundedAt ? new Date(refundedAt).toISOString() : new Date().toISOString(),
          });
        } else {
          // DIRECT_TRANSFER selected: save bank details and set status to ON_PROCESS (ready for Owner/Finance to transfer)
          await api.put(`/refunds/${refund.id}`, {
            refundType: 'DIRECT_TRANSFER',
            status: 'ON_PROCESS',
            bankName: bankName.trim(),
            accountNumber: accountNumber.trim(),
            accountHolder: accountHolder.trim(),
            transferNotes: transferNotes.trim() || undefined,
            notes: notes.trim() || undefined,
          });
        }
      } else {
        // Step 2: Owner/Finance upload bukti transfer, realization date & notes, and complete refund
        await api.put(`/refunds/${refund.id}/process`, {
          refundType,
          bankName: bankName.trim() || undefined,
          accountNumber: accountNumber.trim() || undefined,
          accountHolder: accountHolder.trim() || undefined,
          proofUrl: proofUrl.trim() || undefined,
          transferNotes: transferNotes.trim() || undefined,
          notes: notes.trim() || undefined,
          refundedAt: refundedAt ? new Date(refundedAt).toISOString() : new Date().toISOString(),
        });
      }
      onSuccess();
      onClose();
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setSaving(false);
    }
  }

  async function handleReturnToRequested() {
    if (!refund) return;
    const confirmed = window.confirm(
      'Kembalikan status refund ini ke "REQUESTED"? Admin/Staff akan dapat memilih ulang metode pengembalian dana dan menginput data rekening kembali.'
    );
    if (!confirmed) return;

    setSaving(true);
    setError('');
    try {
      await api.put(`/refunds/${refund.id}`, {
        status: 'REQUESTED',
        notes: notes.trim() ? `[Dikembalikan ke Request] ${notes.trim()}` : undefined,
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
      <div className="max-h-[94vh] w-full max-w-xl overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl border border-brand-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-brand-100 px-6 py-4 bg-brand-50/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-cherry-100 px-2 py-0.5 text-[11px] font-black uppercase text-cherry-700">
                {isMethodOnly ? 'Tahap 1: Metode & Rekening' : 'Tahap 2: Eksekusi Transfer & Bukti'}
              </span>
              <span className="text-xs font-bold text-brand-600">{refund.refundNumber}</span>
            </div>
            <h2 className="mt-1 text-base font-black text-brand-950">
              {isMethodOnly
                ? 'Pilih Metode Pengembalian Dana'
                : 'Kirim Dana & Upload Bukti Transfer'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-brand-400 hover:bg-brand-100 hover:text-brand-700 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body Content */}
        <form onSubmit={submit} className="scrollbar-thin max-h-[calc(94vh-80px)] overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="rounded-xl bg-cherry-50 border border-cherry-200 p-3 text-sm font-bold text-cherry-700 flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Refund Context Card */}
          <div className="rounded-2xl border border-brand-200 bg-brand-50/70 p-4">
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

          {isMethodOnly ? (
            /* TAHAP 1: PILIH METODE PENGEMBALIAN DANA (STAFF / ADMIN) */
            <>
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-wider text-brand-700">
                  Pilih Metode Pengembalian Dana:
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
                          1. Simpan ke Saldo Deposit Pelanggan (Selesai Langsung)
                        </span>
                        <span className="rounded-md bg-purple-100 px-2 py-0.5 text-[10px] font-black text-purple-800">
                          Otomatis
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-brand-600 leading-relaxed">
                        Dana <strong>{money(refund.amount)}</strong> langsung ditambahkan ke saldo deposit akun customer untuk memotong invoice selanjutnya. Tidak memerlukan transfer bank.
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
                          2. Transfer Balik ke Rekening Pelanggan
                        </span>
                        <span className="rounded-md bg-sky-100 px-2 py-0.5 text-[10px] font-black text-sky-800">
                          Perlu Approval Owner
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-brand-600 leading-relaxed">
                        Input data rekening tujuan pelanggan. Setelah disimpan, status menjadi <strong>On Process</strong> agar Owner/Finance dapat mentransfer dana dan mengunggah bukti transfer.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Direct Transfer Bank Details Form */}
              {refundType === 'DIRECT_TRANSFER' && (
                <div className="rounded-2xl border-2 border-sky-300 bg-sky-50/50 p-4 space-y-4 animate-in fade-in-50 duration-200">
                  <div className="flex items-center gap-2">
                    <Building2 size={16} className="text-sky-700" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-sky-950">
                      Input Data Rekening Penerima
                    </h3>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="label">Nama Bank</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="e.g. BCA, Mandiri, BRI, BNI"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="label">Nomor Rekening</label>
                      <input
                        type="text"
                        className="input font-mono font-bold"
                        placeholder="e.g. 1234567890"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="label">Atas Nama (Nama Pemilik Rekening)</label>
                      <input
                        type="text"
                        className="input font-bold"
                        placeholder="e.g. Budi Santoso"
                        value={accountHolder}
                        onChange={(e) => setAccountHolder(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">Catatan Instruksi Transfer untuk Owner (Opsional)</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. Rekening telah dikonfirmasi via WA customer"
                      value={transferNotes}
                      onChange={(e) => setTransferNotes(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="label">Catatan Internal (Opsional)</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Catatan tambahan..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </>
          ) : (
            /* TAHAP 2: EKSEKUSI TRANSFER & UPLOAD BUKTI (OWNER / FINANCE) */
            <>
              {/* Direct Info Card: Rekening Tujuan Transfer */}
              <div className="rounded-2xl border-2 border-sky-300 bg-sky-50/70 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 size={16} className="text-sky-700" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-sky-950">
                      Rekening Tujuan Transfer Pelanggan
                    </h3>
                  </div>
                  <span className="rounded-md bg-sky-200/80 px-2 py-0.5 text-[10px] font-black text-sky-900">
                    Step 2: Transfer Dana
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 text-xs">
                  <div className="rounded-xl bg-white p-3 border border-sky-100 shadow-2xs">
                    <p className="text-brand-500 font-semibold">Bank Tujuan</p>
                    <p className="text-sm font-black text-brand-950 mt-0.5">{bankName || '-'}</p>
                  </div>
                  <div className="rounded-xl bg-white p-3 border border-sky-100 shadow-2xs">
                    <p className="text-brand-500 font-semibold">Nomor Rekening</p>
                    <p className="text-base font-mono font-black text-sky-700 mt-0.5">{accountNumber || '-'}</p>
                  </div>
                  <div className="sm:col-span-2 rounded-xl bg-white p-3 border border-sky-100 shadow-2xs">
                    <p className="text-brand-500 font-semibold">Atas Nama Penerima</p>
                    <p className="text-sm font-black text-brand-950 mt-0.5">{accountHolder || '-'}</p>
                  </div>
                  {transferNotes && (
                    <div className="sm:col-span-2 rounded-xl bg-sky-100/70 p-2.5 text-xs text-sky-900">
                      <span className="font-bold">Catatan Admin: </span>
                      <span>{transferNotes}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Bukti Foto Transfer */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-sky-950 uppercase tracking-wider flex items-center gap-1.5">
                    <UploadCloud size={14} className="text-sky-700" />
                    Upload Bukti Foto Transfer (Owner / Finance)
                  </label>
                  <span className="rounded bg-sky-200/80 px-2 py-0.5 text-[10px] font-bold text-sky-900">
                    Wajib Upload
                  </span>
                </div>
                <FileUploadInput
                  allowedType="image"
                  entityType="payments"
                  value={proofUrl}
                  onChange={(url) => setProofUrl(url || '')}
                  placeholder="Unggah struk atau screenshot bukti transfer refund..."
                />
                <p className="text-[11px] text-sky-800 font-medium">
                  Bukti transfer ini akan ditampilkan langsung kepada pelanggan di portal invoice & tracking.
                </p>
              </div>

              {/* Realization Date & Execution Notes */}
              <div className="grid gap-3 sm:grid-cols-2 pt-1">
                <div>
                  <label className="label">Tanggal & Waktu Realisasi</label>
                  <input
                    type="datetime-local"
                    className="input"
                    value={refundedAt}
                    onChange={(e) => setRefundedAt(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="label">Catatan Transfer (Opsional)</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. Ditransfer via BCA Mobile"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between border-t border-brand-100 pt-4">
            <div>
              {!isMethodOnly && (
                <button
                  type="button"
                  onClick={handleReturnToRequested}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl transition cursor-pointer"
                  disabled={saving}
                  title="Kembalikan status refund ke REQUESTED untuk mengubah metode atau nomor rekening"
                >
                  <span>↩ Kembalikan ke Request (Ubah Metode / Rekening)</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button type="button" onClick={onClose} className="btn-secondary" disabled={saving}>
                Batal
              </button>
              <button
                type="submit"
                className={`btn text-white font-black cursor-pointer ${
                  isMethodOnly
                    ? refundType === 'CUSTOMER_DEPOSIT'
                      ? 'bg-purple-600 hover:bg-purple-700'
                      : 'bg-sky-600 hover:bg-sky-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
                disabled={saving}
              >
                {saving ? (
                  'Memproses...'
                ) : isMethodOnly ? (
                  refundType === 'CUSTOMER_DEPOSIT' ? (
                    <>
                      <CheckCircle2 size={16} />
                      <span>Selesaikan via Saldo Deposit</span>
                    </>
                  ) : (
                    <>
                      <ArrowUpRight size={16} />
                      <span>Simpan & Lanjutkan ke On Process</span>
                    </>
                  )
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Verifikasi & Selesaikan Transfer</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
