import { useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, AlertCircle, X, PackageCheck, User, Truck, MapPin } from 'lucide-react';
import { api, errorMessage } from '~/lib/api';
import type { Shipment } from '../types';

interface ConfirmDeliveredModalProps {
  open: boolean;
  shipment: Shipment | null;
  onClose: () => void;
  onConfirmed: () => void;
}

export function ConfirmDeliveredModal({ open, shipment, onClose, onConfirmed }: ConfirmDeliveredModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open || !shipment) return null;

  async function handleConfirm() {
    if (!shipment) return;
    setLoading(true);
    setError('');

    try {
      await api.put(`/shipments/${shipment.id}`, {
        status: 'DELIVERED',
      });
      onConfirmed();
      onClose();
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setLoading(false);
    }
  }

  const items = shipment.order?.items || [];
  const totalQty = items.reduce((s, it) => s + (it.quantity || 1), 0);

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-brand-900/50 p-4 backdrop-blur-sm animate-in fade-in-0 duration-200">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-brand-100 space-y-5 animate-in zoom-in-95 duration-200">
        
        {/* Header Icon & Title */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm">
              <CheckCircle2 size={26} />
            </div>
            <div>
              <h3 className="text-lg font-black text-brand-900">Confirm Delivered</h3>
              <p className="text-xs text-brand-500 font-medium">Customer Received Package</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-brand-400 hover:bg-brand-100 hover:text-brand-700 transition"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="rounded-2xl bg-cherry-50 border border-cherry-200 p-3 text-xs font-semibold text-cherry-700 flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0 text-cherry-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Confirmation Details Card */}
        <div className="rounded-2xl border border-brand-100 bg-brand-50/50 p-4 space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-brand-100/80 pb-2">
            <span className="text-brand-500 font-medium flex items-center gap-1.5">
              <PackageCheck size={14} className="text-brand-600" /> Order Number
            </span>
            <span className="font-extrabold text-brand-900">{shipment.order?.orderNumber || '-'}</span>
          </div>

          <div className="flex items-center justify-between border-b border-brand-100/80 pb-2">
            <span className="text-brand-500 font-medium flex items-center gap-1.5">
              <User size={14} className="text-brand-600" /> Customer
            </span>
            <span className="font-bold text-brand-800">{shipment.customer?.fullName || '-'}</span>
          </div>

          <div className="flex items-center justify-between border-b border-brand-100/80 pb-2">
            <span className="text-brand-500 font-medium flex items-center gap-1.5">
              <Truck size={14} className="text-indigo-600" /> Tracking # (Resi)
            </span>
            <span className="font-mono font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
              {shipment.trackingNumber || '-'} ({shipment.courier || 'JNE'})
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-brand-500 font-medium">Items Delivered</span>
            <span className="font-bold text-brand-800">{totalQty} pcs ({items.length} items)</span>
          </div>
        </div>

        {/* Informative Alert */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3.5 text-xs text-emerald-900 space-y-1">
          <p className="font-bold flex items-center gap-1.5 text-emerald-800">
            <CheckCircle2 size={14} className="text-emerald-600" />
            Automatic Status Completion
          </p>
          <p className="text-[11px] leading-relaxed text-emerald-700">
            Confirming this will mark shipment as <strong className="font-bold">Delivered</strong> and update Order <strong className="font-bold">{shipment.order?.orderNumber}</strong> status to <strong className="font-bold">COMPLETED</strong>.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="btn-secondary !py-2.5 !px-4 text-xs font-bold"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="btn-primary !bg-emerald-600 hover:!bg-emerald-700 !py-2.5 !px-5 text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-2"
          >
            <CheckCircle2 size={16} />
            {loading ? 'Completing...' : 'Yes, Customer Received'}
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
