import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Split, AlertCircle, X, Package, Check, Loader2, User } from 'lucide-react';
import { api, errorMessage } from '~/lib/api';
import { money } from '~/lib/format';
import { getShipmentOrders, type Shipment } from '../types';

interface SplitShipmentModalProps {
  open: boolean;
  shipment: Shipment | null;
  onClose: () => void;
  onSplit: () => void;
}

export function SplitShipmentModal({
  open,
  shipment,
  onClose,
  onSplit,
}: SplitShipmentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedOrderIds, setSelectedOrderIds] = useState<number[]>([]);

  const orders = shipment ? getShipmentOrders(shipment) : [];

  useEffect(() => {
    if (open && orders.length > 1) {
      setError('');
      // By default select the last order to split
      setSelectedOrderIds([orders[orders.length - 1].id]);
    } else {
      setSelectedOrderIds([]);
    }
  }, [open, shipment]);

  if (!open || !shipment) return null;

  const customerName = shipment.customer?.full_name || shipment.customer?.fullName || '-';

  const toggleOrderSelection = (id: number) => {
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  async function handleConfirmSplit() {
    if (selectedOrderIds.length === 0) {
      setError('Pilih minimal satu pesanan untuk dipisahkan.');
      return;
    }

    if (selectedOrderIds.length >= orders.length) {
      setError('Setidaknya satu pesanan harus tetap berada dalam pengiriman awal.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post(`/shipments/${shipment!.id}/split`, {
        order_ids: selectedOrderIds,
      });
      onSplit();
      onClose();
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setLoading(false);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-brand-900/50 p-4 backdrop-blur-sm animate-in fade-in-0 duration-200">
      <div className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl bg-white shadow-2xl border border-brand-100 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-brand-100 px-6 py-4 bg-gradient-to-r from-amber-50 via-white to-brand-50/30">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-md shadow-amber-500/20">
              <Split size={22} />
            </div>
            <div>
              <h2 className="font-black text-brand-900 text-base">
                Split Shipment #{shipment.id}
              </h2>
              <p className="text-xs text-brand-500 font-medium">
                Separate merged orders into individual shipments
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-brand-400 hover:bg-brand-100 hover:text-brand-700 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-brand-700">
          {error && (
            <div className="flex items-start gap-2.5 rounded-2xl bg-rose-50 border border-rose-200 p-3.5 text-rose-800 text-xs">
              <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{error}</div>
            </div>
          )}

          {/* Customer Info */}
          <div className="flex items-center justify-between rounded-2xl bg-brand-50/60 p-3.5 border border-brand-100/80">
            <div className="flex items-center gap-2 text-brand-900 font-bold">
              <User size={15} className="text-brand-500" />
              <span>{customerName}</span>
            </div>
            <span className="text-[11px] font-semibold text-brand-500">
              {orders.length} orders currently merged
            </span>
          </div>

          <div className="space-y-2">
            <label className="font-bold text-brand-900 text-xs flex items-center justify-between">
              <span>Select order(s) to move into a NEW shipment:</span>
              <span className="text-brand-500 font-medium">
                {selectedOrderIds.length} selected
              </span>
            </label>

            {orders.length <= 1 ? (
              <div className="p-6 text-center text-brand-400 bg-brand-50/30 rounded-2xl border border-dashed border-brand-200">
                This shipment only contains 1 order and cannot be split by order.
              </div>
            ) : (
              <div className="divide-y divide-brand-100 border border-brand-100 rounded-2xl overflow-hidden bg-white shadow-xs">
                {orders.map((order) => {
                  const isChecked = selectedOrderIds.includes(order.id);
                  const items = order.items || [];
                  const totalPcs = items.reduce((acc, it) => acc + (it.quantity || 1), 0);
                  const ordNum = order.order_number || order.orderNumber || `Order #${order.id}`;

                  return (
                    <label
                      key={order.id}
                      className={`flex items-start gap-3 p-3.5 cursor-pointer transition ${
                        isChecked
                          ? 'bg-amber-50/50 hover:bg-amber-50/70'
                          : 'hover:bg-brand-50/30'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleOrderSelection(order.id)}
                        className="mt-1 h-4 w-4 rounded border-brand-300 accent-amber-500 cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-brand-900 text-xs">
                            {ordNum}
                          </span>
                          <span className="font-bold text-brand-900 text-xs">
                            {money(Number(order.customer_shipping ?? order.customerShipping ?? 0))}
                          </span>
                        </div>
                        <p className="text-[11px] text-brand-500 mt-0.5">
                          {totalPcs} pcs ({items.length} item lines)
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {items.slice(0, 3).map((it) => (
                            <span
                              key={it.id}
                              className="inline-flex items-center gap-1 text-[10px] bg-white border border-brand-200/80 px-2 py-0.5 rounded text-brand-700"
                            >
                              <Package size={10} className="text-brand-400" />
                              {it.quantity}x {it.product?.name || it.manual_product_name || 'Item'}
                            </span>
                          ))}
                          {items.length > 3 && (
                            <span className="text-[10px] text-brand-400 font-medium px-1">
                              +{items.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <p className="text-[11px] text-brand-500 bg-amber-50/70 border border-amber-200/60 p-3 rounded-xl leading-relaxed">
            <strong>Note:</strong> Selected order(s) will be removed from shipment #{shipment.id} and created as a new shipment in <strong>Waiting Packing</strong> status.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 border-t border-brand-100 bg-brand-50/40 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl px-4 py-2 font-bold text-xs text-brand-600 hover:bg-brand-100 hover:text-brand-900 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmSplit}
            disabled={loading || selectedOrderIds.length === 0 || selectedOrderIds.length >= orders.length}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2 font-bold text-xs text-white shadow-md shadow-amber-500/20 hover:bg-amber-600 active:scale-98 transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Splitting...
              </>
            ) : (
              <>
                <Check size={14} />
                Split into New Shipment
              </>
            )}
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
