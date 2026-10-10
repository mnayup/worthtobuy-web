import React from 'react';
import { MapPin, MessageCircle, Truck, Copy, Check } from 'lucide-react';
import { money } from '~/lib/format';
import type { Shipment } from '../types';

interface ShipmentDetailLogisticsProps {
  shipment: Shipment;
  waLink: string | null;
  copiedResi: boolean;
  onCopyTracking: () => void;
}

export function ShipmentDetailLogistics({
  shipment,
  waLink,
  copiedResi,
  onCopyTracking,
}: ShipmentDetailLogisticsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {/* Delivery Destination */}
      <div className="rounded-2xl border border-brand-100 bg-brand-50/40 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span
            className={
              'text-xs font-bold uppercase tracking-wider text-brand-500 ' +
              'flex items-center gap-1.5'
            }
          >
            <MapPin size={14} className="text-brand-600" />
            Delivery Destination
          </span>
          {waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noreferrer"
              className={
                'inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 ' +
                'hover:text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full ' +
                'border border-emerald-200 transition'
              }
            >
              <MessageCircle size={12} />
              WhatsApp
            </a>
          )}
        </div>

        <div>
          <p className="font-black text-brand-900 text-sm">
            {shipment.customer?.fullName || '-'}
          </p>
          <p className="text-xs text-brand-500 font-mono">
            {shipment.customer?.whatsapp || '-'}
          </p>
        </div>

        <div className="border-t border-brand-100/80 pt-2 text-xs">
          <p className="font-semibold text-brand-800 leading-relaxed">
            {shipment.address || (
              <span className="text-brand-400 italic">Address not specified</span>
            )}
          </p>
        </div>
      </div>

      {/* Courier & Tracking Details */}
      <div className="rounded-2xl border border-brand-100 bg-brand-50/40 p-4 space-y-3">
        <span
          className={
            'text-xs font-bold uppercase tracking-wider text-indigo-600 ' +
            'flex items-center gap-1.5'
          }
        >
          <Truck size={14} />
          Courier & Waybill
        </span>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-black text-brand-900 text-sm">
              {shipment.courier || 'JNE'}{' '}
              <span
                className={
                  'text-xs font-bold text-indigo-700 bg-indigo-50 border ' +
                  'border-indigo-100 px-2 py-0.5 rounded-full ml-1'
                }
              >
                {shipment.serviceType || 'Regular (REG)'}
              </span>
            </p>
          </div>
        </div>

        {shipment.trackingNumber ? (
          <div
            className={
              'flex items-center justify-between rounded-xl bg-white ' +
              'border border-brand-200 p-2.5'
            }
          >
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase text-brand-400">Nomor Resi</p>
              <p className="font-mono font-black text-brand-900 text-sm tracking-wider truncate">
                {shipment.trackingNumber}
              </p>
            </div>
            <button
              type="button"
              onClick={onCopyTracking}
              className={
                'flex items-center gap-1 rounded-lg bg-brand-50 px-2 py-1 ' +
                'text-xs font-bold text-brand-700 hover:bg-brand-100 transition shrink-0 cursor-pointer'
              }
              title="Copy Resi"
            >
              {copiedResi ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              {copiedResi ? 'Copied' : 'Copy'}
            </button>
          </div>
        ) : (
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-2 text-xs text-amber-800 font-semibold">
            Tracking number not yet assigned. Pack the items first or click "Set Resi".
          </div>
        )}

        <div
          className={
            'grid grid-cols-2 gap-2 text-xs text-brand-600 font-medium ' +
            'pt-1 border-t border-brand-100/80'
          }
        >
          <div>
            <span className="text-brand-400 block text-[10px]">Weight:</span>
            <strong className="text-brand-900 font-bold">{shipment.weightKg || 0} kg</strong>
          </div>
          <div>
            <span className="text-brand-400 block text-[10px]">Shipping Cost:</span>
            <strong className="text-brand-900 font-bold">{money(shipment.shippingCost)}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
