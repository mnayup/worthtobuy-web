import React from 'react';
import { PackageCheck, Truck, CheckCircle2, Eye, Clock } from 'lucide-react';
import { isShipmentFullyPaid, type Shipment } from '../types';

interface RenderShipmentRowActionsProps {
  row: Shipment;
  rowActionLoadingId: number | null;
  onOpenPack: (row: Shipment) => void;
  onOpenSetTracking: (row: Shipment) => void;
  onOpenConfirmDelivered: (row: Shipment) => void;
  onOpenDetail: (row: Shipment) => void;
}

export function renderShipmentRowActions({
  row,
  rowActionLoadingId,
  onOpenPack,
  onOpenSetTracking,
  onOpenConfirmDelivered,
  onOpenDetail,
}: RenderShipmentRowActionsProps) {
  const status = row.status || 'WAITING_PACKING';
  const isPackingLoading = rowActionLoadingId === row.id;
  const fullyPaid = isShipmentFullyPaid(row);

  return (
    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
      {/* 1. WAITING_PACKING: Cannot set resi before pack! Only show Pack button */}
      {status === 'WAITING_PACKING' && (
        <button
          type="button"
          onClick={() => {
            if (!fullyPaid) return;
            onOpenPack(row);
          }}
          disabled={isPackingLoading || !fullyPaid}
          className={
            'inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs ' +
            'font-bold transition shadow-2xs ' +
            (!fullyPaid
              ? 'opacity-40 bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-amber-500 text-white hover:bg-amber-600 cursor-pointer shadow-amber-500/20')
          }
          title={
            !fullyPaid
              ? 'Cannot pack: Order must be Full Payment first'
              : 'Open Packing, Label Generation & Evidence Upload'
          }
        >
          <PackageCheck size={14} />
          <span>{isPackingLoading ? 'Loading...' : 'Pack & Cetak Label'}</span>
        </button>
      )}

      {/* 2. PACKED or READY: Staff can now input Resi, Actual Ongkir & Evidence After Packing */}
      {(status === 'PACKED' || status === 'READY') && (
        <button
          type="button"
          onClick={() => {
            if (!fullyPaid) return;
            onOpenSetTracking(row);
          }}
          disabled={!fullyPaid}
          className={
            'inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs ' +
            'font-bold transition shadow-xs ' +
            (!fullyPaid
              ? 'opacity-40 bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer')
          }
          title={
            !fullyPaid
              ? 'Cannot set resi: Order must be Full Payment first'
              : 'Input Tracking Number (Resi) & Actual Ongkir'
          }
        >
          <Truck size={14} />
          <span>Input Resi & Ongkir</span>
        </button>
      )}

      {/* 3. WAITING_SETTLEMENT: Shortage of shipping cost, customer needs to pay */}
      {status === 'WAITING_SETTLEMENT' && (
        <button
          type="button"
          onClick={() => onOpenSetTracking(row)}
          className={
            'inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs ' +
            'font-bold transition shadow-2xs bg-orange-50 border border-orange-200 ' +
            'text-orange-700 hover:bg-orange-100 cursor-pointer'
          }
          title="Menunggu Pelunasan Kurang Ongkir dari Customer. Klik untuk edit resi/ongkir."
        >
          <Clock size={14} className="text-orange-600" />
          <span>Kurang Ongkir</span>
        </button>
      )}

      {/* 4. IN_TRANSIT or HANDED_TO_COURIER: Package is on the way */}
      {(status === 'IN_TRANSIT' || status === 'HANDED_TO_COURIER') && (
        <>
          <button
            type="button"
            onClick={() => onOpenConfirmDelivered(row)}
            className={
              'inline-flex items-center gap-1 rounded-xl bg-emerald-600 ' +
              'text-white px-3 py-1 text-xs font-bold hover:bg-emerald-700 ' +
              'transition shadow-xs cursor-pointer'
            }
            title="Confirm Customer Received Package & Complete Order"
          >
            <CheckCircle2 size={14} />
            <span>Received</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenSetTracking(row)}
            className={
              'rounded-xl p-1.5 text-brand-400 hover:bg-brand-100 ' +
              'hover:text-brand-700 transition cursor-pointer'
            }
            title="Edit Tracking Number (Resi)"
          >
            <Truck size={15} />
          </button>
        </>
      )}

      <button
        type="button"
        onClick={() => onOpenDetail(row)}
        className={
          'rounded-xl p-1.5 text-brand-500 hover:bg-brand-100 ' +
          'hover:text-brand-900 transition cursor-pointer'
        }
        title="View Items Checklist & Shipment Details"
      >
        <Eye size={16} />
      </button>
    </div>
  );
}
