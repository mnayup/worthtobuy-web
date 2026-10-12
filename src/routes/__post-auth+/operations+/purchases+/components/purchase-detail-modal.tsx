import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertCircle, ShoppingCart, Layers } from 'lucide-react';
import { api, errorMessage } from '~/lib/api';
import { StatusBadge } from '~/components/StatusBadge';
import { FileUploadInput } from '~/components/FileUploadInput';
import type { Purchase } from '../types';
import { PurchaseDetailInfoGrid } from './purchase-detail-info-grid';
import { PurchaseTargetBar } from './purchase-target-bar';
import {
  PurchaseItemsChecklist,
  type ItemChecklistState,
} from './purchase-items-checklist';
import {
  buildInitialItemsState,
  computePurchaseMetrics,
} from '../helpers/purchase-modal.helper';

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
  const [data, setData] = useState<Purchase | null>(null);
  const [itemsState, setItemsState] = useState<Record<number, ItemChecklistState>>({});
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [receiptUrl, setReceiptUrl] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const initData = (p: Purchase) => {
    setData(p);
    setPaymentMethod(p.paymentMethod || p.payment_method || '');
    setReceiptUrl(p.receiptUrl || p.receipt_url || '');
    setNotes(p.notes || '');
    setItemsState(buildInitialItemsState(p.items));
  };

  useEffect(() => {
    if (!open || !purchase) return;
    initData(purchase);
    setError('');

    api
      .get(`/purchases/${purchase.id}`)
      .then((res) => {
        if (res.data) initData(res.data);
      })
      .catch((err) => {
        console.warn('Could not reload purchase detail:', err);
      });
  }, [open, purchase]);

  if (!open || !data) return null;

  const items = data.items || [];
  const targetEligible =
    data.eligibleQuantity ??
    items
      .filter((i) => i.is_eligible_to_buy)
      .reduce((sum, i) => sum + i.quantity, 0);
  const totalOrdered =
    data.totalQuantity ??
    items.reduce((sum, i) => sum + i.quantity, 0);

  const { actualBought, rejectedCount, computedActualPrice } =
    computePurchaseMetrics(items, itemsState);

  const estPrice = Number(data.estimatedPrice ?? data.estimated_price ?? 0);
  const priceDiff = computedActualPrice - estPrice;
  const order = data.orderItem?.order || data.order_item?.order;
  const isPartial =
    Number(order?.outstandingAmount ?? order?.outstanding_amount ?? 0) > 0;
  const batchNum = data.batchNumber || data.batch_number || 1;

  const handleChangeItemState = (
    itemId: number,
    patch: Partial<ItemChecklistState>
  ) => {
    setItemsState((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], ...patch },
    }));
  };

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      const payloadItems = Object.values(itemsState).map((st) => ({
        id: st.id,
        order_item_id: st.order_item_id,
        status: st.status,
        is_bought: st.status === 'PURCHASED',
        is_rejected: st.status === 'UNAVAILABLE',
        allocated_qty: st.allocated_qty,
        actual_price: st.actual_unit_price,
      }));

      await api.put(`/purchases/${data!.id}`, {
        items: payloadItems,
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
        'fixed inset-0 z-[100] flex items-end justify-center ' +
        'bg-brand-900/45 backdrop-blur-sm sm:items-center sm:p-4'
      }
    >
      <div
        className={
          'w-full max-w-3xl max-h-[92vh] flex flex-col rounded-t-3xl ' +
          'bg-white shadow-2xl sm:rounded-3xl overflow-hidden'
        }
      >
        {/* Header */}
        <div
          className={
            'flex items-center justify-between border-b border-brand-100 ' +
            'px-6 py-4 bg-gradient-to-r from-white via-brand-50/30 to-brand-50/50'
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
                  {data.purchaseNumber || data.purchase_number}
                </h2>
                <span
                  className={
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-lg ' +
                    'bg-indigo-100 text-indigo-800 text-[11px] font-black tracking-wide'
                  }
                >
                  <Layers size={12} />
                  Batch {batchNum}
                </span>
                <StatusBadge value={data.status || 'WAITING_PURCHASE'} />
              </div>
              <p className="text-xs text-brand-500 font-medium">
                Consolidated Event Purchase Checklist & Allocation
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
                'rounded-xl bg-rose-50 border border-rose-200 p-3.5 ' +
                'text-sm font-semibold text-rose-700 flex items-center gap-2'
              }
            >
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Pricing & Overview Grid */}
          <PurchaseDetailInfoGrid
            purchase={data}
            order={order}
            isPartial={isPartial}
            estPrice={estPrice}
            actualPrice={computedActualPrice}
            priceDiff={priceDiff}
          />

          {/* Target Shopping Bar */}
          <PurchaseTargetBar
            targetEligibleQty={targetEligible}
            totalOrderedQty={totalOrdered}
            actualBoughtQty={actualBought}
            rejectedQty={rejectedCount}
          />

          {/* Items Checklist & Allocation */}
          <PurchaseItemsChecklist
            items={items}
            itemsState={itemsState}
            onChangeItemState={handleChangeItemState}
          />

          {/* Receipt Proof & Shopper Notes */}
          <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-brand-100/70">
            <div>
              <label className="label">Foto Struk / Bukti Pembelian</label>
              <FileUploadInput
                value={receiptUrl}
                onChange={setReceiptUrl}
                allowedType="image"
                entityType="misc"
                placeholder="Upload foto bukti pembelian / struk..."
              />
            </div>
            <div>
              <label className="label">Shopper Notes</label>
              <textarea
                className="input min-h-[90px] leading-relaxed"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Catatan pembelian, nomor struk, atau info toko..."
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={
            'flex items-center justify-between border-t border-brand-100 ' +
            'px-6 py-4 bg-brand-50/20'
          }
        >
          <div className="text-xs text-brand-500 font-medium">
            Bought: <strong className="text-brand-900">{actualBought} pcs</strong>{' '}
            | Refunded:{' '}
            <strong className="text-rose-700">{rejectedCount} pcs</strong>
          </div>
          <div className="flex items-center gap-3">
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
              onClick={handleSave}
              disabled={saving}
              className="btn-primary !py-2 !px-5 text-xs font-bold"
            >
              {saving ? 'Saving...' : 'Save & Execute Purchases'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
