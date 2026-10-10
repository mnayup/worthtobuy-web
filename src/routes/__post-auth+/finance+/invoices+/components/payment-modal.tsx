import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2 } from 'lucide-react';
import { api, errorMessage } from '~/lib/api';
import { money } from '~/lib/format';
import { paymentMethods } from '~/routes/__post-auth+/finance+/invoices+/types';
import { FileUploadInput } from '~/components/FileUploadInput';
import dayjs from 'dayjs';

interface PaymentModalProps {
  open: boolean;
  invoice: any;
  initialAmount?: number;
  initialNotes?: string;
  onClose: () => void;
  onSaved: () => void;
}

export function PaymentModal({ open, invoice, initialAmount, initialNotes, onClose, onSaved }: PaymentModalProps) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Transfer Bank');
  const [paymentDate, setPaymentDate] = useState(dayjs().format('YYYY-MM-DDTHH:mm'));
  const [status, setStatus] = useState('VERIFIED');
  const [proofUrl, setProofUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      const defaultAmount = initialAmount !== undefined 
        ? initialAmount 
        : Math.max(0, Number(invoice?.outstandingAmount || 0));
      setAmount(String(defaultAmount));
      if (initialNotes) {
        setNotes(initialNotes);
      } else {
        setNotes('');
      }
      setProofUrl('');
      setError('');
    }
  }, [open, invoice, initialAmount, initialNotes]);

  if (!open) return null;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await api.post('/payments', {
        invoiceId: invoice.id,
        amount: Number(amount),
        method,
        paymentDate: paymentDate ? new Date(paymentDate).toISOString() : new Date().toISOString(),
        status,
        proofUrl: proofUrl || null,
        notes: notes || null,
      });
      onSaved();
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setSaving(false);
    }
  }

  const formattedAmount = amount ? Number(amount).toLocaleString('id-ID') : '';

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-brand-950/40 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="w-full max-w-xl rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl border border-brand-100">
        <div className="flex items-center justify-between border-b border-brand-100 px-6 py-4 bg-brand-50/40">
          <div>
            <h2 className="font-black text-brand-900 text-lg">Record Customer Payment</h2>
            <p className="text-xs text-brand-500">
              {invoice.invoiceNumber} • Remaining balance: {money(invoice.outstandingAmount)}
            </p>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 text-brand-400 hover:bg-brand-100 hover:text-brand-700 transition">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={submit} className="p-6">
          {error && <div className="mb-4 rounded-xl bg-cherry-50 border border-cherry-200 p-3 text-sm font-bold text-cherry-700">{error}</div>}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Amount Paid *</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-black text-brand-600">Rp.</span>
                <input
                  required
                  type="text"
                  className="input !pl-11 font-black text-brand-900"
                  value={formattedAmount}
                  placeholder="0"
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, '');
                    setAmount(raw);
                  }}
                />
              </div>
            </div>
            <div>
              <label className="label">Payment Method *</label>
              <select className="input" value={method} onChange={(e) => setMethod(e.target.value)}>
                {paymentMethods.map((val: string) => (
                  <option key={val}>{val}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Payment Date & Time</label>
              <input
                type="datetime-local"
                className="input"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Verification Status</label>
              <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="VERIFIED">Verified</option>
                <option value="PENDING">Pending Verification</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Proof of Payment URL</label>
              <FileUploadInput
                value={proofUrl}
                onChange={setProofUrl}
                entityType="invoices"
                allowedType="all"
                placeholder="Upload receipt image or document..."
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Payment Notes</label>
              <textarea
                className="input min-h-20"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., initial deposit, settlement payment, checkout via marketplace..."
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-2 border-t border-brand-100 pt-5">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button disabled={saving} className="btn-primary flex items-center gap-2">
              {saving && <Loader2 size={16} className="animate-spin" />}
              {saving ? 'Saving...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
