import React from 'react';
import { PackageCheck, Truck, CheckCircle2, Eye } from 'lucide-react';
import { isShipmentFullyPaid, type Shipment } from '../types';

interface RenderShipmentRowActionsProps {
  row: Shipment;
  rowActionLoadingId: number | null;
  onQuickPack: (row: Shipment) => void;
  onOpenSetTracking: (row: Shipment) => void;
  onOpenConfirmDelivered: (row: Shipment) => void;
  onOpenDetail: (row: Shipment) => void;
}

export function renderShipmentRowActions({
  row,
  rowActionLoadingId,
  onQuickPack,
  onOpenSetTracking,
  onOpenConfirmDelivered,
  onOpenDetail,
}: RenderShipmentRowActionsProps) {
  const status = row.status || 'WAITING_PACKING';
  const isPackingLoading = rowActionLoadingId === row.id;
  const fullyPaid = isShipmentFullyPaid(row);

  return (
    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
      {/* If WAITING_PACKING */}
      {status === 'WAITING_PACKING' && (
        <>
          <button
            type="button"
            onClick={() => {
              if (!fullyPaid) return;
              onQuickPack(row);
            }}
            disabled={isPackingLoading || !fullyPaid}
            className={
              'inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs ' +
              'font-bold transition shadow-2xs ' +
              (!fullyPaid
                ? 'opacity-40 bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-amber-50 border border-amber-200/90 text-amber-800 hover:bg-amber-100 cursor-pointer')
            }
            title={
              !fullyPaid
                ? 'Cannot pack: Order must be Full Payment first'
                : 'Mark items as Packed'
            }
          >
            <PackageCheck
              size={14}
              className={!fullyPaid ? 'text-slate-400' : 'text-amber-600'}
            />
            <span>{isPackingLoading ? 'Packing...' : 'Pack'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (!fullyPaid) return;
              onOpenSetTracking(row);
            }}
            disabled={!fullyPaid}
            className={
              'inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs ' +
              'font-bold transition shadow-2xs ' +
              (!fullyPaid
                ? 'opacity-40 bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 cursor-pointer')
            }
            title={
              !fullyPaid
                ? 'Cannot set resi: Order must be Full Payment first'
                : 'Set Tracking Number & Ship'
            }
          >
            <Truck size={14} className={!fullyPaid ? 'text-slate-400' : 'text-indigo-600'} />
            <span>Set Resi</span>
          </button>
        </>
      )}

      {/* If PACKED or READY */}
      {(status === 'PACKED' || status === 'READY') && (
        <button
          type="button"
          onClick={() => {
            if (!fullyPaid) return;
            onOpenSetTracking(row);
          }}
          disabled={!fullyPaid}
          className={
            'inline-flex items-center gap-1 rounded-xl px-3 py-1 text-xs ' +
            'font-bold transition shadow-xs ' +
            (!fullyPaid
              ? 'opacity-40 bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer')
          }
          title={
            !fullyPaid
              ? 'Cannot set resi: Order must be Full Payment first'
              : 'Input Tracking Number (Resi)'
          }
        >
          <Truck size={14} />
          <span>Input Resi</span>
        </button>
      )}

      {/* If IN_TRANSIT or HANDED_TO_COURIER */}
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
