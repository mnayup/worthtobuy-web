import React from 'react';
import { MapPin, MessageCircle, Truck, Copy, Check, Image } from 'lucide-react';
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
  const estCost = Number(shipment.shipping_cost ?? shipment.shippingCost ?? 0);
  const actCost = shipment.actual_shipping_cost ?? shipment.actualShippingCost;
  const diffCost = shipment.shipping_cost_difference ?? shipment.shippingCostDifference;
  const proofBefore = shipment.proof_before_url ?? shipment.proofBeforeUrl;
  const proofAfter = shipment.proof_url ?? shipment.proofUrl;

  return (
    <div className="space-y-4">
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
              {shipment.customer?.full_name || shipment.customer?.fullName || '-'}
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
                  {shipment.service_type || shipment.serviceType || 'Regular (REG)'}
                </span>
              </p>
            </div>
          </div>

          {(shipment.tracking_number || shipment.trackingNumber) ? (
            <div
              className={
                'flex items-center justify-between rounded-xl bg-white ' +
                'border border-brand-200 p-2.5'
              }
            >
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase text-brand-400">Nomor Resi</p>
                <p className="font-mono font-black text-brand-900 text-sm tracking-wider truncate">
                  {shipment.tracking_number || shipment.trackingNumber}
                </p>
              </div>
              <button
                type="button"
                onClick={onCopyTracking}
                className={
                  'flex items-center gap-1 rounded-lg bg-brand-50 px-2 py-1 ' +
                  'text-xs font-bold text-brand-700 hover:bg-brand-100 ' +
                  'transition shrink-0 cursor-pointer'
                }
                title="Copy Resi"
              >
                {copiedResi ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                {copiedResi ? 'Copied' : 'Copy'}
              </button>
            </div>
          ) : (
            <div
              className={
                'rounded-xl border border-amber-200 bg-amber-50/70 p-2 ' +
                'text-xs text-amber-800 font-semibold'
              }
            >
              Nomor resi belum diinput. Lakukan proses packing terlebih dahulu.
            </div>
          )}

          {/* Ongkir Breakdown Grid */}
          <div
            className={
              'grid grid-cols-3 gap-2 text-xs text-brand-600 font-medium ' +
              'pt-1 border-t border-brand-100/80'
            }
          >
            <div>
              <span className="text-brand-400 block text-[10px]">Estimasi Ongkir:</span>
              <strong className="text-brand-900 font-bold">{money(estCost)}</strong>
            </div>
            <div>
              <span className="text-brand-400 block text-[10px]">Aktual Ongkir:</span>
              <strong className="text-brand-900 font-bold">
                {actCost !== null && actCost !== undefined ? money(Number(actCost)) : '-'}
              </strong>
            </div>
            <div>
              <span className="text-brand-400 block text-[10px]">Selisih:</span>
              {diffCost !== null && diffCost !== undefined ? (
                Number(diffCost) > 0 ? (
                  <span className="font-bold text-amber-700 text-[11px]">
                    +Rp{Number(diffCost).toLocaleString('id-ID')} (Kurang)
                  </span>
                ) : Number(diffCost) < 0 ? (
                  <span className="font-bold text-emerald-700 text-[11px]">
                    -Rp{Math.abs(Number(diffCost)).toLocaleString('id-ID')} (Refund)
                  </span>
                ) : (
                  <span className="font-bold text-sky-700 text-[11px]">Pas (Rp 0)</span>
                )
              ) : (
                <span className="text-slate-400">-</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Evidence Photos (Sebelum & Setelah Packing) */}
      {(proofBefore || proofAfter) && (
        <div className="rounded-2xl border border-brand-100 bg-brand-50/20 p-4 space-y-3">
          <span
            className={
              'text-xs font-bold uppercase tracking-wider text-brand-600 ' +
              'flex items-center gap-1.5'
            }
          >
            <Image size={14} />
            Foto Bukti Pengiriman (Evidence Photos)
          </span>
          <div className="grid gap-3 sm:grid-cols-2">
            {proofBefore && (
              <div className="rounded-xl border border-slate-200 bg-white p-2.5 space-y-1.5">
                <span className="text-[10px] font-bold text-amber-800 uppercase block">
                  Foto Sebelum Packing (Barang & Label)
                </span>
                <a href={proofBefore} target="_blank" rel="noreferrer" className="block group">
                  <img
                    src={proofBefore}
                    alt="Bukti Sebelum Packing"
                    className={
                      'h-32 w-full object-cover rounded-lg border border-slate-100 ' +
                      'group-hover:opacity-90 transition'
                    }
                  />
                  <span className="text-[10px] text-indigo-600 font-semibold mt-1 block">
                    Lihat Foto Penuh ↗
                  </span>
                </a>
              </div>
            )}
            {proofAfter && (
              <div className="rounded-xl border border-slate-200 bg-white p-2.5 space-y-1.5">
                <span className="text-[10px] font-bold text-indigo-800 uppercase block">
                  Foto Setelah Packing (Paket & Resi)
                </span>
                <a href={proofAfter} target="_blank" rel="noreferrer" className="block group">
                  <img
                    src={proofAfter}
                    alt="Bukti Setelah Packing"
                    className={
                      'h-32 w-full object-cover rounded-lg border border-slate-100 ' +
                      'group-hover:opacity-90 transition'
                    }
                  />
                  <span className="text-[10px] text-indigo-600 font-semibold mt-1 block">
                    Lihat Foto Penuh ↗
                  </span>
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
