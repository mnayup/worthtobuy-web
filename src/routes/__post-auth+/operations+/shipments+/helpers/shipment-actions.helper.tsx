import React from 'react';
import { Eye } from 'lucide-react';
import type { Shipment } from '../types';

interface RenderShipmentRowActionsProps {
  row: Shipment;
  onOpenDetail: (row: Shipment) => void;
}

export function renderShipmentRowActions({
  row,
  onOpenDetail,
}: RenderShipmentRowActionsProps) {
  return (
    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
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

