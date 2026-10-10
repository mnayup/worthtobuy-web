import React from 'react';
import { Weight, DollarSign, Calendar, Image, Truck } from 'lucide-react';
import { FileUploadInput } from '~/components/FileUploadInput';

interface SetTrackingAdditionalFieldsProps {
  weightKg: string;
  setWeightKg: (val: string) => void;
  shippingCost: string;
  setShippingCost: (val: string) => void;
  shippedAt: string;
  setShippedAt: (val: string) => void;
  proofUrl: string;
  setProofUrl: (val: string) => void;
  notes: string;
  setNotes: (val: string) => void;
  orderNumber?: string;
  saving: boolean;
  fullyPaid: boolean;
  trackingNumber: string;
  onClose: () => void;
}

export function SetTrackingAdditionalFields({
  weightKg,
  setWeightKg,
  shippingCost,
  setShippingCost,
  shippedAt,
  setShippedAt,
  proofUrl,
  setProofUrl,
  notes,
  setNotes,
  orderNumber,
  saving,
  fullyPaid,
  trackingNumber,
  onClose,
}: SetTrackingAdditionalFieldsProps) {
  return (
    <>
      {/* Weight, Shipping Cost & Date Grid */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-brand-700 flex items-center gap-1">
            <Weight size={12} className="text-brand-400" />
            Weight (kg)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            className="input !h-9 text-xs"
            placeholder="e.g. 1.5"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-brand-700 flex items-center gap-1">
            <DollarSign size={12} className="text-brand-400" />
            Actual Shipping Fee (IDR)
          </label>
          <input
            type="number"
            min="0"
            className="input !h-9 text-xs"
            placeholder="e.g. 24000"
            value={shippingCost}
            onChange={(e) => setShippingCost(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-brand-700 flex items-center gap-1">
            <Calendar size={12} className="text-brand-400" />
            Shipment Date
          </label>
          <input
            type="datetime-local"
            className="input !h-9 text-xs"
            value={shippedAt}
            onChange={(e) => setShippedAt(e.target.value)}
          />
        </div>
      </div>

      {/* Waybill Proof URL & Notes */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-brand-700 flex items-center gap-1">
            <Image size={12} className="text-brand-400" />
            Waybill / Receipt Photo URL
          </label>
          <FileUploadInput
            value={proofUrl}
            onChange={setProofUrl}
            entityType="shipments"
            allowedType="all"
            placeholder="Upload waybill photo or document..."
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-brand-700">Logistics Notes</label>
          <input
            type="text"
            className="input !h-9 text-xs"
            placeholder="e.g. Dropped at drop point, fragile tag"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>

      {/* Bottom Action Hint */}
      <div
        className={
          'rounded-xl border border-sky-200 bg-sky-50/70 p-3 text-xs ' +
          'text-sky-800 flex items-start gap-2'
        }
      >
        <Truck size={16} className="text-sky-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Setting this tracking number will advance shipment status to{' '}
          <strong className="font-bold text-sky-900">In Transit (Shipped)</strong> and
          automatically update Order{' '}
          <strong className="font-bold text-sky-900">{orderNumber}</strong> status to{' '}
          <strong className="font-bold text-sky-900">SHIPPED</strong>.
        </p>
      </div>

      {/* Submit Footer */}
      <div className="flex items-center justify-end gap-3 border-t border-brand-100 pt-4">
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="btn-secondary !py-2.5 !px-4 text-xs font-bold cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving || !trackingNumber.trim() || !fullyPaid}
          className={
            'btn-primary !py-2.5 !px-6 text-xs font-bold flex items-center gap-2 ' +
            (!fullyPaid
              ? '!bg-slate-200 !text-slate-400 !border-transparent opacity-60 ' +
                'cursor-not-allowed shadow-none'
              : '!bg-indigo-600 hover:!bg-indigo-700 shadow-md shadow-indigo-600/30 cursor-pointer')
          }
          title={!fullyPaid ? 'Cannot set resi: Order must be Full Payment first' : undefined}
        >
          <Truck size={16} />
          {saving ? 'Saving...' : 'Set Resi & Dispatch Shipment'}
        </button>
      </div>
    </>
  );
}
