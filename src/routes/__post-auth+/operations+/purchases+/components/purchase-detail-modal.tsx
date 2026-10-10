import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, AlertCircle, Clock, ShoppingCart, User, Package, FileText } from 'lucide-react';
import { api, errorMessage } from '~/lib/api';
import { money } from '~/lib/format';
import { StatusBadge } from '~/components/StatusBadge';
import type { Purchase } from '../types';

interface PurchaseDetailModalProps {
  open: boolean;
  purchase: Purchase | null;
  onClose: () => void;
  onSaved: () => void;
}

export function PurchaseDetailModal({ open, purchase, onClose, onSaved }: PurchaseDetailModalProps) {
  const [status, setStatus] = useState<string>('WAITING_PURCHASE');
  const [actualPrice, setActualPrice] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [receiptUrl, setReceiptUrl] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && purchase) {
      setStatus(purchase.status || 'WAITING_PURCHASE');
      setActualPrice(Number(purchase.actualPrice ?? purchase.estimatedPrice ?? 0));
      setPaymentMethod(purchase.paymentMethod || '');
      setReceiptUrl(purchase.receiptUrl || '');
      setNotes(purchase.notes || '');
      setError('');
    }
  }, [open, purchase]);

  if (!open || !purchase) return null;

  const order = purchase.orderItem?.order;
  const isPartial = Number(order?.outstandingAmount || 0) > 0;
  const priceDiff = Number(actualPrice || 0) - Number(purchase.estimatedPrice || 0);

  async function handleSave(newStatus?: string) {
    const finalStatus = newStatus || status;
    setSaving(true);
    setError('');
    try {
      await api.put(`/purchases/${purchase!.id}`, {
        status: finalStatus,
        actualPrice: Number(actualPrice),
        paymentMethod: paymentMethod || null,
        receiptUrl: receiptUrl || null,
        notes: notes || null,
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
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-brand-900/45 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-brand-100 px-6 py-4 bg-gradient-to-r from-white via-brand-50/30 to-brand-50/50">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 shadow-xs">
              <ShoppingCart size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-brand-900 tracking-tight">{purchase.purchaseNumber}</h2>
                <StatusBadge value={purchase.status || 'WAITING_PURCHASE'} />
              </div>
              <p className="text-xs text-brand-500 font-medium">Purchase Execution & In-Store Receipts</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 text-brand-400 hover:bg-brand-50 transition">
            <X size={20} />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="rounded-xl bg-cherry-50 border border-cherry-200 p-3.5 text-sm font-semibold text-cherry-700 flex items-center gap-2">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Info Cards Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Item & Brand */}
            <div className="rounded-2xl border border-brand-100 bg-brand-50/40 p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-brand-500 uppercase tracking-wider">
                <Package size={14} className="text-brand-600" />
                <span>Requested Item</span>
              </div>
              <p className="font-black text-brand-900 text-base">
                {purchase.product?.name || purchase.orderItem?.manualProductName || '-'}
              </p>
              <div className="flex justify-between text-xs text-brand-600 font-medium pt-1 border-t border-brand-100/70">
                <span>Brand: <strong className="text-brand-900 font-bold">{purchase.brandName || '-'}</strong></span>
                <span>Quantity: <strong className="text-brand-900 font-bold">{purchase.quantity} pcs</strong></span>
              </div>
            </div>

            {/* Order & Customer */}
            <div className="rounded-2xl border border-brand-100 bg-brand-50/40 p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-brand-500 uppercase tracking-wider">
                <FileText size={14} className="text-brand-600" />
                <span>Order & Customer</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-black text-brand-900 text-sm">
                  {order?.orderNumber || '-'}
                </span>
                {order?.status && <StatusBadge value={order.status} />}
              </div>
              <div className="text-xs text-brand-600 font-medium space-y-1">
                <div className="flex items-center gap-1.5">
                  <User size={12} className="text-brand-400" />
                  <span className="font-semibold text-brand-800">{order?.customer?.fullName || '-'}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-brand-100/70">
                  <span>Total: <strong className="text-brand-900 font-bold">{money(order?.totalBill)}</strong></span>
                  <span className={isPartial ? 'text-cherry-600 font-bold' : 'text-emerald-600 font-bold'}>
                    Balance: {money(order?.outstandingAmount)} {isPartial ? '(Partial Deposit)' : '(Paid)'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="rounded-2xl border border-brand-100 p-4 bg-white grid grid-cols-3 gap-2 text-center shadow-xs">
            <div>
              <div className="text-[11px] font-bold uppercase text-brand-400">Estimated</div>
              <div className="text-sm font-black text-brand-800">{money(purchase.estimatedPrice)}</div>
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase text-brand-400">Actual</div>
              <div className="text-sm font-black text-brand-900">{money(actualPrice)}</div>
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase text-brand-400">Difference</div>
              <div className={`text-sm font-black ${priceDiff > 0 ? 'text-cherry-600' : 'text-emerald-600'}`}>
                {money(priceDiff)}
              </div>
            </div>
          </div>

          {/* Quick Status Action Section */}
          <div className="space-y-3">
            <label className="label text-xs font-bold uppercase tracking-wider text-brand-500">Update Purchase Status</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setStatus('PURCHASED')}
                className={`flex items-center justify-center gap-2 p-3.5 rounded-2xl border text-xs font-bold transition shadow-xs ${
                  status === 'PURCHASED'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-2 ring-indigo-500/20 shadow-sm'
                    : 'border-brand-200 bg-white text-brand-600 hover:bg-brand-50'
                }`}
              >
                <CheckCircle2 size={16} className={status === 'PURCHASED' ? 'text-indigo-600' : 'text-brand-400'} />
                Purchased
              </button>

              <button
                type="button"
                onClick={() => setStatus('UNAVAILABLE')}
                className={`flex items-center justify-center gap-2 p-3.5 rounded-2xl border text-xs font-bold transition shadow-xs ${
                  status === 'UNAVAILABLE'
                    ? 'border-cherry-600 bg-cherry-50 text-cherry-900 ring-2 ring-cherry-500/20 shadow-sm'
                    : 'border-brand-200 bg-white text-brand-600 hover:bg-cherry-50'
                }`}
              >
                <AlertCircle size={16} className={status === 'UNAVAILABLE' ? 'text-cherry-600' : 'text-brand-400'} />
                Unavailable
              </button>

              <button
                type="button"
                onClick={() => setStatus('WAITING_PURCHASE')}
                className={`flex items-center justify-center gap-2 p-3.5 rounded-2xl border text-xs font-bold transition shadow-xs ${
                  status === 'WAITING_PURCHASE'
                    ? 'border-amber-500 bg-amber-50 text-amber-900 ring-2 ring-amber-500/20 shadow-sm'
                    : 'border-brand-200 bg-white text-brand-600 hover:bg-amber-50'
                }`}
              >
                <Clock size={16} className={status === 'WAITING_PURCHASE' ? 'text-amber-600' : 'text-brand-400'} />
                Waiting Purchase
              </button>
            </div>

            {/* Workflow guidance hint */}
            {status === 'PURCHASED' && (
              <div className="rounded-2xl border border-brand-200 bg-brand-50/70 p-3.5 text-xs text-brand-800 space-y-1.5">
                <p className="font-bold flex items-center gap-1.5 text-brand-900">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  Automated Pipeline on "Purchased":
                </p>
                {isPartial ? (
                  <p className="text-brand-700 leading-relaxed">
                    Customer payment is still on <strong>Partial Deposit</strong> (remaining balance: {money(order?.outstandingAmount)}). Order status will automatically update to <strong className="text-orange-700 font-bold">Waiting Settlement</strong>.
                  </p>
                ) : (
                  <p className="text-brand-700 leading-relaxed">
                    Order is <strong>Fully Paid</strong>! Order status will automatically become <strong className="text-cyan-700 font-bold">Ready to Ship</strong> and a new <strong className="text-brand-900 font-bold">Shipment record (Waiting Packing)</strong> will be generated.
                  </p>
                )}
              </div>
            )}

            {status === 'UNAVAILABLE' && (
              <div className="rounded-2xl border border-cherry-200 bg-cherry-50 p-3.5 text-xs text-cherry-800">
                <p className="font-bold flex items-center gap-1.5 text-cherry-900">
                  <AlertCircle size={14} className="text-cherry-600" />
                  Item Unavailable at Store:
                </p>
                <p className="mt-1 text-cherry-700 leading-relaxed">
                  This item will be recorded as Unavailable, and a refund ledger entry will be queued for the customer.
                </p>
              </div>
            )}
          </div>

          {/* Form details (Price, Payment method, Notes) */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Actual Purchase Price (IDR)</label>
              <input
                type="number"
                className="input"
                value={actualPrice}
                onChange={(e) => setActualPrice(Number(e.target.value))}
                placeholder="Actual amount paid"
              />
            </div>
            <div>
              <label className="label">Payment Method</label>
              <input
                type="text"
                className="input"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                placeholder="e.g. Cash, Credit Card, QRIS, Wire"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Receipt / Invoice Proof (URL)</label>
              <input
                type="url"
                className="input font-mono text-xs"
                value={receiptUrl}
                onChange={(e) => setReceiptUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Shopper Notes</label>
              <textarea
                className="input min-h-[70px] leading-relaxed"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes from store visit, receipt number, or variant substitutes..."
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-brand-100 px-6 py-4 bg-brand-50/20">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="btn-secondary !py-2 !px-4 text-xs font-bold"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className="btn-primary !py-2 !px-5 text-xs font-bold"
          >
            {saving ? 'Saving...' : 'Save Purchase Details'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
