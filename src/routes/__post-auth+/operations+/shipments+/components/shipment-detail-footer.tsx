import React from 'react';
import { PackageCheck, Truck, CheckCircle2, Clock } from 'lucide-react';
import type { Shipment } from '../types';

interface ShipmentDetailFooterProps {
  currentStatus: string;
  packingLoading: boolean;
  fullyPaid: boolean;
  shipment: Shipment;
  onClose: () => void;
  onOpenPack?: (shipment: Shipment) => void;
  onOpenSetTracking?: (shipment: Shipment) => void;
  onOpenConfirmDelivered?: (shipment: Shipment) => void;
}

export function ShipmentDetailFooter({
  currentStatus,
  packingLoading,
  fullyPaid,
  shipment,
  onClose,
  onOpenPack,
  onOpenSetTracking,
  onOpenConfirmDelivered,
}: ShipmentDetailFooterProps) {
  return (
    <div
      className={
        'flex flex-wrap items-center justify-between gap-3 border-t ' +
        'border-brand-100 px-6 py-4 bg-brand-50/30'
      }
    >
      <button
        type="button"
        onClick={onClose}
        className="btn-secondary !py-2.5 !px-4 text-xs font-bold cursor-pointer"
      >
        Close
      </button>

      <div className="flex items-center gap-2">
        {/* If WAITING_PACKING: Cannot set resi before pack! Only show Pack */}
        {currentStatus === 'WAITING_PACKING' && (
          <button
            type="button"
            onClick={() => {
              if (!fullyPaid) return;
              onClose();
              onOpenPack?.(shipment);
            }}
            disabled={packingLoading || !fullyPaid}
            className={
              'btn-primary !bg-amber-600 hover:!bg-amber-700 !py-2.5 !px-5 ' +
              'text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-600/25 ' +
              (!fullyPaid ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer')
            }
            title={
              !fullyPaid
                ? 'Cannot pack: Order must be Full Payment first'
                : 'Mulai proses packing & cetak label'
            }
          >
            <PackageCheck size={16} />
            <span>Pack & Cetak Label</span>
          </button>
        )}

        {/* If PACKED or READY */}
        {(currentStatus === 'PACKED' || currentStatus === 'READY') && (
          <>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenPack?.(shipment);
              }}
              className="btn-secondary !py-2.5 !px-3.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              title="Lihat atau cetak ulang label pengiriman"
            >
              <PackageCheck size={16} className="text-brand-600" />
              <span>Cetak Label</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (!fullyPaid) return;
                onClose();
                onOpenSetTracking?.(shipment);
              }}
              disabled={!fullyPaid}
              className={
                'btn-primary !py-2.5 !px-5 text-xs font-bold flex items-center ' +
                'gap-1.5 cursor-pointer ' +
                (!fullyPaid
                  ? '!bg-slate-200 !text-slate-400 !border-transparent opacity-60 cursor-not-allowed'
                  : '!bg-indigo-600 hover:!bg-indigo-700 shadow-md shadow-indigo-600/30')
              }
              title={
                !fullyPaid
                  ? 'Cannot set resi: Order must be Full Payment first'
                  : 'Set Tracking Number & Actual Ongkir'
              }
            >
              <Truck size={16} />
              Input Resi & Ongkir
            </button>
          </>
        )}

        {/* If WAITING_SETTLEMENT */}
        {currentStatus === 'WAITING_SETTLEMENT' && (
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenSetTracking?.(shipment);
            }}
            className={
              'btn-secondary !bg-orange-50 !border-orange-300 !text-orange-800 ' +
              'hover:!bg-orange-100 !py-2.5 !px-4 text-xs font-bold flex items-center ' +
              'gap-1.5 cursor-pointer'
            }
          >
            <Clock size={16} className="text-orange-600" />
            <span>Update Resi / Ongkir</span>
          </button>
        )}

        {/* If IN_TRANSIT or HANDED_TO_COURIER */}
        {(currentStatus === 'IN_TRANSIT' || currentStatus === 'HANDED_TO_COURIER') && (
          <>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenSetTracking?.(shipment);
              }}
              className="btn-secondary !py-2.5 !px-3.5 text-xs font-bold cursor-pointer"
              title="Update Resi / Courier if needed"
            >
              Edit Resi
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenConfirmDelivered?.(shipment);
              }}
              className={
                'btn-primary !bg-emerald-600 hover:!bg-emerald-700 !py-2.5 !px-5 ' +
                'text-xs font-bold flex items-center gap-1.5 cursor-pointer ' +
                'shadow-md shadow-emerald-600/30'
              }
            >
              <CheckCircle2 size={16} />
              Konfirmasi Sampai (Delivered)
            </button>
          </>
        )}
      </div>
    </div>
  );
}
