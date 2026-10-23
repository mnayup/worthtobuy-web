import React from 'react';
import { Eye, Split } from 'lucide-react';
import { getShipmentOrders, type Shipment } from '../types';

interface RenderShipmentRowActionsProps {
  row: Shipment;
  onOpenDetail: (row: Shipment) => void;
  onOpenSplit?: (row: Shipment) => void;
}

export function renderShipmentRowActions({
  row,
  onOpenDetail,
  onOpenSplit,
}: RenderShipmentRowActionsProps) {
  const isMultiOrder = getShipmentOrders(row).length > 1;
  const canSplit = isMultiOrder && row.status === 'WAITING_PACKING' && !row.packed_at;

  return (
    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
      {canSplit && onOpenSplit && (
        <button
          type="button"
          onClick={() => onOpenSplit(row)}
          className="inline-flex items-center justify-center px-2 py-1.5 h-8 min-w-[34px] rounded-xl border border-amber-200 bg-amber-50 text-amber-700 shadow-2xs hover:bg-amber-100 hover:border-amber-300 transition cursor-pointer"
          title="Split Shipment into separate shipments"
          aria-label="Split Shipment"
        >
          <Split size={14} />
        </button>
      )}
      <button
        type="button"
        onClick={() => onOpenDetail(row)}
        className="inline-flex items-center justify-center px-2.5 py-1.5 h-8 min-w-[34px] rounded-xl border border-brand-200 bg-white text-brand-600 shadow-2xs hover:bg-brand-50 hover:text-brand-900 hover:border-brand-300 transition cursor-pointer"
        title="View Details & Process Shipment"
        aria-label="View Details & Process Shipment"
      >
        <Eye size={15} />
      </button>
    </div>
  );
}

