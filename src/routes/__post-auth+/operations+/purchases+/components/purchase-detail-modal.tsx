import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertCircle, ShoppingCart } from 'lucide-react';
import { api, errorMessage } from '~/lib/api';
import { StatusBadge } from '~/components/StatusBadge';
import type { Purchase } from '../types';
import { PurchaseDetailInfoGrid } from './purchase-detail-info-grid';
import { PurchaseDetailStatusSection } from './purchase-detail-status-section';

interface PurchaseDetailModalProps {
  open: boolean;
  purchase: Purchase | null;
  onClose: () => void;
  onSaved: () => void;
}

export function PurchaseDetailModal({
  open,
  purchase,
  onClose,
  onSaved,
}: PurchaseDetailModalProps) {
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
      const actual = purchase.actualPrice ?? purchase.actual_price;
      const estimated = purchase.estimatedPrice ?? purchase.estimated_price;
      setActualPrice(Number(actual ?? estimated ?? 0));
      setPaymentMethod(purchase.paymentMethod || purchase.payment_method || '');
      setReceiptUrl(purchase.receiptUrl || purchase.receipt_url || '');
      setNotes(purchase.notes || '');
      setError('');
    }
  }, [open, purchase]);

  if (!open || !purchase) return null;

  const order = purchase.orderItem?.order || purchase.order_item?.order;
  const isPartial =
    Number(order?.outstandingAmount ?? order?.outstanding_amount ?? 0) > 0;
  const estPrice = Number(purchase.estimatedPrice ?? purchase.estimated_price ?? 0);
  const priceDiff = Number(actualPrice || 0) - estPrice;

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
    <div
      className={
        'fixed inset-0 z-[100] flex items-end justify-center bg-brand-900/45 ' +
        'backdrop-blur-sm sm:items-center sm:p-4'
      }
    >
      <div
        className={
          'w-full max-w-2xl max-h-[90vh] flex flex-col rounded-t-3xl bg-white ' +
          'shadow-2xl sm:rounded-3xl overflow-hidden'
        }
      >
        {/* Header */}
        <div
          className={
            'flex items-center justify-between border-b border-brand-100 px-6 py-4 ' +
            'bg-gradient-to-r from-white via-brand-50/30 to-brand-50/50'
          }
        >
          <div className="flex items-center gap-3">
            <div
              className={
                'flex h-11 w-11 items-center justify-center rounded-2xl ' +
                'bg-indigo-50 text-indigo-700 shadow-xs'
              }
            >
              <ShoppingCart size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-brand-900 tracking-tight">
                  {purchase.purchaseNumber || purchase.purchase_number}
                </h2>
                <StatusBadge value={purchase.status || 'WAITING_PURCHASE'} />
              </div>
              <p className="text-xs text-brand-500 font-medium">
                Purchase Execution & In-Store Receipts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-brand-400 hover:bg-brand-50 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div
              className={
                'rounded-xl bg-cherry-50 border border-cherry-200 p-3.5 ' +
                'text-sm font-semibold text-cherry-700 flex items-center gap-2'
              }
            >
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <PurchaseDetailInfoGrid
            purchase={purchase}
            order={order}
            isPartial={isPartial}
            estPrice={estPrice}
            actualPrice={actualPrice}
            priceDiff={priceDiff}
          />

          <PurchaseDetailStatusSection
            status={status}
            onSelectStatus={setStatus}
            isPartial={isPartial}
            outstandingAmount={
              Number(order?.outstandingAmount ?? order?.outstanding_amount ?? 0)
            }
          />

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
        <div
          className={
            'flex items-center justify-end gap-3 border-t border-brand-100 ' +
            'px-6 py-4 bg-brand-50/20'
          }
        >
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
