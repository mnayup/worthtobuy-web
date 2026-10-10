import React from 'react';
import { PackageCheck, Truck, CheckCircle2 } from 'lucide-react';
import type { Shipment } from '../types';

interface ShipmentDetailFooterProps {
  currentStatus: string;
  packingLoading: boolean;
  fullyPaid: boolean;
  shipment: Shipment;
  onClose: () => void;
  onMarkAsPacked: () => void;
  onOpenSetTracking?: (shipment: Shipment) => void;
  onOpenConfirmDelivered?: (shipment: Shipment) => void;
}

export function ShipmentDetailFooter({
  currentStatus,
  packingLoading,
  fullyPaid,
  shipment,
  onClose,
  onMarkAsPacked,
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
        {/* If WAITING_PACKING */}
        {currentStatus === 'WAITING_PACKING' && (
          <>
            <button
              type="button"
              onClick={onMarkAsPacked}
              disabled={packingLoading || !fullyPaid}
              className={
                'btn-secondary !py-2.5 !px-4 text-xs font-bold flex items-center ' +
                'gap-1.5 shadow-xs cursor-pointer ' +
                (!fullyPaid
                  ? '!bg-slate-100 !border-slate-200 !text-slate-400 opacity-60 cursor-not-allowed'
                  : '!bg-amber-50 !border-amber-300 !text-amber-800 hover:!bg-amber-100')
              }
              title={
                !fullyPaid
                  ? 'Cannot pack: Order must be Full Payment first'
                  : 'Mark as Packed'
              }
            >
              <PackageCheck
                size={16}
                className={!fullyPaid ? 'text-slate-400' : 'text-amber-600'}
              />
              {packingLoading ? 'Marking Packed...' : 'Mark as Packed'}
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
                  : 'Input Resi & Ship'
              }
            >
              <Truck size={16} />
              Input Resi & Ship
            </button>
          </>
        )}

        {/* If PACKED or READY */}
        {(currentStatus === 'PACKED' || currentStatus === 'READY') && (
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
                : 'Set Tracking Number (Resi)'
            }
          >
            <Truck size={16} />
            Set Tracking Number (Resi)
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
                'text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-1.5 cursor-pointer'
              }
            >
              <CheckCircle2 size={16} />
              Confirm Delivered & Complete
            </button>
          </>
        )}

        {/* If DELIVERED */}
        {currentStatus === 'DELIVERED' && (
          <div
            className={
              'flex items-center gap-2 rounded-xl bg-emerald-50 border ' +
              'border-emerald-200 px-3.5 py-2 text-xs font-bold text-emerald-800'
            }
          >
            <CheckCircle2 size={16} className="text-emerald-600" />
            Shipment & Order Completed
          </div>
        )}
      </div>
    </div>
  );
}
