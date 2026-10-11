import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, Wallet, X } from 'lucide-react';
import { api, errorMessage } from '~/lib/api';
import { money } from '~/lib/format';

interface DepositModalProps {
  open: boolean;
  invoice: any;
  onClose: () => void;
  onSaved: () => void;
}

export function DepositModal({ open, invoice, onClose, onSaved }: DepositModalProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [availableDeposit, setAvailableDeposit] = useState(0);
  const [useDeposit, setUseDeposit] = useState(false);
  const [depositAmount, setDepositAmount] = useState(0);

  useEffect(() => {
    if (!open || !invoice) return;
    const currentUsed = Number(invoice.depositAmount || 0);
    setUseDeposit(currentUsed > 0);
    setDepositAmount(currentUsed);
    setLoading(true);
    setError('');

    api.get(`/customers/${invoice.customerId}/deposit-balance?excludeInvoiceId=${invoice.id}`)
      .then((res) => {
        setAvailableDeposit(Number(res.data?.availableDeposit || 0));
      })
      .catch((err) => {
        setError(errorMessage(err));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [open, invoice]);

  if (!open || !invoice) return null;

  const totalBill = Number(invoice.totalBill || 0);
  const maxCanUse = Math.min(availableDeposit, totalBill);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const finalAmount = useDeposit ? Number(depositAmount || 0) : 0;
      await api.put(`/invoices/${invoice.id}`, {
        useDeposit: useDeposit && finalAmount > 0,
        depositAmount: finalAmount,
      });
      onSaved();
      onClose();
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setSaving(false);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-brand-950/40 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="max-h-[94vh] w-full max-w-lg overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl border border-brand-100">
        <div className="flex items-center justify-between border-b border-brand-100 px-6 py-4 bg-brand-50/50">
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-purple-600 text-white shrink-0">
              <Wallet size={16} />
            </div>
            <div>
              <h2 className="text-base font-black text-brand-950">
                Manage Customer Deposit Balance (Saldo Deposit)
              </h2>
              <p className="text-xs text-brand-500">{invoice.invoiceNumber} • {invoice.customer?.fullName}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 text-brand-400 hover:bg-brand-100 hover:text-brand-700 transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit} className="scrollbar-thin max-h-[calc(94vh-80px)] overflow-y-auto p-6">
          {error && (
            <div className="mb-4 rounded-xl bg-cherry-50 border border-cherry-200 p-3 text-sm font-bold text-cherry-700">
              {error}
            </div>
          )}

          {/* Deposit Info */}
          <div className="rounded-2xl border border-purple-200 bg-purple-50/60 p-4 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-900">Available Customer Deposit Balance:</span>
              <span className="text-sm font-black text-purple-950">
                {loading ? 'Loading...' : money(availableDeposit)}
              </span>
            </div>
            <p className="text-[11px] text-purple-700 mt-1 leading-relaxed">
              This credit balance originates from refunds processed as deposits. You can decide whether to apply this balance toward this invoice or keep it for future orders.
            </p>
          </div>

          <div className="space-y-4">
            <label className="flex items-start gap-3 rounded-xl border border-brand-200 p-3 hover:bg-brand-50/50 cursor-pointer transition select-none">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-brand-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                checked={useDeposit}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setUseDeposit(checked);
                  if (checked && depositAmount === 0) {
                    setDepositAmount(maxCanUse);
                  }
                }}
              />
              <div>
                <p className="text-xs font-black text-brand-900">Apply Deposit Balance to Deduct from This Invoice</p>
                <p className="text-[11px] text-brand-500 mt-0.5">
                  Check to deduct from total invoice payment. Uncheck if customer chooses not to use deposit on this order.
                </p>
              </div>
            </label>

            {useDeposit && (
              <div className="rounded-xl border border-purple-200 bg-white p-4 space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-brand-700">Deposit Amount to Use:</label>
                    <button
                      type="button"
                      onClick={() => setDepositAmount(maxCanUse)}
                      className="text-xs font-extrabold text-purple-700 hover:underline"
                    >
                      Use Maximum ({money(maxCanUse)})
                    </button>
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={maxCanUse}
                    className="input font-black text-purple-950"
                    value={depositAmount}
                    onChange={(e) =>
                      setDepositAmount(
                        Math.min(
                          Math.max(0, Number(e.target.value) || 0),
                          maxCanUse
                        )
                      )
                    }
                  />
                </div>

                <div className="rounded-lg bg-brand-50 p-2.5 text-xs space-y-1">
                  <div className="flex justify-between text-brand-600">
                    <span>Total Order Bill:</span>
                    <span className="font-bold">{money(totalBill)}</span>
                  </div>
                  <div className="flex justify-between text-purple-800 font-bold">
                    <span>Deposit Deduction (Potongan Deposit):</span>
                    <span>- {money(depositAmount)}</span>
                  </div>
                  <div className="flex justify-between text-brand-950 font-black border-t border-brand-200 pt-1">
                    <span>Net Amount Due to Pay (Tagihan Bersih):</span>
                    <span className="text-sm">{money(Math.max(0, totalBill - depositAmount))}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center justify-end gap-2 border-t border-brand-100 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={saving}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn bg-purple-600 text-white hover:bg-purple-700"
              disabled={saving}
            >
              {saving ? 'Saving...' : (
                <>
                  <CheckCircle2 size={16} />
                  <span>{useDeposit && depositAmount > 0 ? 'Apply Deposit' : 'Save (Without Deposit)'}</span>
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
