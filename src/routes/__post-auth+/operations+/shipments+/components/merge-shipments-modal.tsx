import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { GitMerge, AlertCircle, X, User, Truck, MapPin, Package, Check, Loader2 } from 'lucide-react';
import { api, errorMessage } from '~/lib/api';
import { money } from '~/lib/format';
import { getShipmentItems, getShipmentOrderNumbers, type Shipment } from '../types';

interface MergeShipmentsModalProps {
  open: boolean;
  shipments: Shipment[];
  courierOptions: Array<{ label: string; value: string }>;
  onClose: () => void;
  onMerged: () => void;
}

export function MergeShipmentsModal({
  open,
  shipments,
  courierOptions,
  onClose,
  onMerged,
}: MergeShipmentsModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedAddress, setSelectedAddress] = useState('');
  const [customAddress, setCustomAddress] = useState('');
  const [selectedCourier, setSelectedCourier] = useState('JNE');
  const [customNotes, setCustomNotes] = useState('');

  const firstCustomer = shipments[0]?.customer;
  const customerName = firstCustomer?.full_name || firstCustomer?.fullName || '-';

  // Distinct addresses from selected shipments
  const addressOptions = Array.from(
    new Set(
      shipments
        .map((s) => s.address?.trim())
        .filter((a): a is string => Boolean(a) && a !== '-')
    )
  );

  useEffect(() => {
    if (open && shipments.length > 0) {
      setError('');
      setSelectedCourier(shipments[0]?.courier || 'JNE');
      const initialAddr = addressOptions[0] || firstCustomer?.address || '';
      setSelectedAddress(initialAddr);
      setCustomAddress(initialAddr);
      setCustomNotes('');
    }
  }, [open, shipments]);

  if (!open || shipments.length < 2) return null;

  const totalShippingFee = shipments.reduce(
    (sum, s) => sum + Number(s.shipping_cost ?? s.shippingCost ?? 0),
    0
  );

  const totalItemsCount = shipments.reduce(
    (sum, s) => sum + getShipmentItems(s).reduce((itSum, it) => itSum + (it.quantity || 1), 0),
    0
  );

  const allOrderNumbers = Array.from(
    new Set(shipments.flatMap((s) => getShipmentOrderNumbers(s)))
  );

  async function handleConfirmMerge() {
    setLoading(true);
    setError('');

    const finalAddress = customAddress.trim() || selectedAddress.trim() || '-';

    try {
      await api.post('/shipments/merge', {
        shipment_ids: shipments.map((s) => s.id),
        address: finalAddress,
        courier: selectedCourier,
        notes: customNotes.trim() ? customNotes.trim() : undefined,
      });
      onMerged();
      onClose();
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setLoading(false);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-brand-900/50 p-4 backdrop-blur-sm animate-in fade-in-0 duration-200">
      <div className="w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl bg-white shadow-2xl border border-brand-100 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-brand-100 px-6 py-4 bg-gradient-to-r from-purple-50 via-white to-brand-50/30">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-600 text-white shadow-md shadow-purple-600/20">
              <GitMerge size={22} />
            </div>
            <div>
              <h2 className="font-black text-brand-900 text-base">
                Merge {shipments.length} Shipments into 1
              </h2>
              <p className="text-xs text-brand-500 font-medium">
                Combine shipments for customer: <strong className="text-brand-800 font-bold">{customerName}</strong>
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
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-brand-700">
          {error && (
            <div className="flex items-start gap-2.5 rounded-2xl bg-rose-50 border border-rose-200 p-3.5 text-rose-800 text-xs">
              <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{error}</div>
            </div>
          )}

          {/* Customer & Orders Overview */}
          <div className="rounded-2xl bg-brand-50/50 border border-brand-100/80 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-brand-900 font-bold text-sm">
                <User size={16} className="text-purple-600" />
                <span>{customerName}</span>
                {firstCustomer?.customer_code && (
                  <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-brand-200/60 text-brand-800">
                    {firstCustomer.customer_code}
                  </span>
                )}
              </div>
              <span className="rounded-full bg-purple-100 text-purple-800 font-extrabold px-2.5 py-0.5 text-[11px]">
                {allOrderNumbers.length} Orders • {totalItemsCount} Total Items
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {allOrderNumbers.map((ordNum) => (
                <span
                  key={ordNum}
                  className="inline-flex items-center gap-1 font-mono font-bold text-xs bg-white border border-brand-200 rounded-lg px-2.5 py-1 text-brand-900 shadow-xs"
                >
                  <Package size={12} className="text-amber-500" />
                  {ordNum}
                </span>
              ))}
            </div>
          </div>

          {/* List of Shipments to Merge */}
          <div className="space-y-2">
            <label className="font-bold text-brand-900 text-xs flex items-center justify-between">
              <span>Selected Shipments ({shipments.length})</span>
              <span className="text-brand-500 font-medium">Combined Est. Shipping: <strong className="text-brand-900">{money(totalShippingFee)}</strong></span>
            </label>
            <div className="divide-y divide-brand-100 border border-brand-100 rounded-2xl overflow-hidden bg-white shadow-xs">
              {shipments.map((s) => {
                const items = getShipmentItems(s);
                const ordNums = getShipmentOrderNumbers(s);
                return (
                  <div key={s.id} className="p-3.5 hover:bg-brand-50/30 transition flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-600 font-black text-xs">
                        #{s.id}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-brand-900 text-xs">
                          {ordNums.join(', ')}
                        </span>
                        <span className="text-[11px] text-brand-500">
                          {s.courier} • {items.reduce((acc, it) => acc + (it.quantity || 1), 0)} pcs ({items.length} line{items.length > 1 ? 's' : ''})
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-brand-900 text-xs">
                        {money(Number(s.shipping_cost ?? s.shippingCost ?? 0))}
                      </span>
                      <span className="block text-[10px] text-emerald-600 font-semibold">
                        Waiting Packing
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery Address Choice */}
          <div className="space-y-2">
            <label className="font-bold text-brand-900 text-xs flex items-center gap-1.5">
              <MapPin size={14} className="text-brand-500" />
              Consolidated Delivery Address
            </label>
            {addressOptions.length > 1 && (
              <div className="space-y-1.5 mb-2">
                {addressOptions.map((addr) => (
                  <label
                    key={addr}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                      selectedAddress === addr
                        ? 'border-purple-500 bg-purple-50/50 text-purple-950 font-medium'
                        : 'border-brand-200 hover:bg-brand-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="addressChoice"
                      value={addr}
                      checked={selectedAddress === addr}
                      onChange={() => {
                        setSelectedAddress(addr);
                        setCustomAddress(addr);
                      }}
                      className="mt-0.5 accent-purple-600"
                    />
                    <span className="flex-1 leading-snug">{addr}</span>
                  </label>
                ))}
              </div>
            )}
            <textarea
              rows={2}
              value={customAddress}
              onChange={(e) => setCustomAddress(e.target.value)}
              placeholder="Enter destination address..."
              className="w-full rounded-xl border border-brand-200 p-3 text-xs text-brand-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
            />
          </div>

          {/* Courier Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-brand-900 text-xs flex items-center gap-1.5 mb-1.5">
                <Truck size={14} className="text-brand-500" />
                Courier
              </label>
              <select
                value={selectedCourier}
                onChange={(e) => setSelectedCourier(e.target.value)}
                className="w-full rounded-xl border border-brand-200 px-3 py-2 text-xs text-brand-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 bg-white"
              >
                {courierOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-bold text-brand-900 text-xs mb-1.5 block">
                Total Shipping Fee
              </label>
              <div className="rounded-xl border border-brand-200 px-3 py-2 bg-brand-50/60 font-bold text-brand-900 text-xs">
                {money(totalShippingFee)}
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="font-bold text-brand-900 text-xs mb-1.5 block">
              Shipment Notes (Optional)
            </label>
            <input
              type="text"
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="e.g. Combined orders into single large box"
              className="w-full rounded-xl border border-brand-200 px-3 py-2 text-xs text-brand-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
            />
          </div>
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
            onClick={handleConfirmMerge}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2 font-bold text-xs text-white shadow-md shadow-purple-600/20 hover:bg-purple-700 active:scale-98 transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Merging...
              </>
            ) : (
              <>
                <Check size={14} />
                Merge into 1 Shipment
              </>
            )}
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
