import React from 'react';
import { Box, Package } from 'lucide-react';
import { StatusBadge } from '~/components/StatusBadge';

interface ShipmentDetailItemsCardProps {
  items: any[];
  totalItemsCount: number;
}

export function ShipmentDetailItemsCard({
  items,
  totalItemsCount,
}: ShipmentDetailItemsCardProps) {
  return (
    <div className="rounded-2xl border border-brand-200 bg-white p-4 space-y-3 shadow-xs">
      <div className="flex items-center justify-between border-b border-brand-100 pb-2.5">
        <div className="flex items-center gap-2">
          <div
            className={
              'flex h-7 w-7 items-center justify-center rounded-lg ' +
              'bg-amber-50 text-amber-600 border border-amber-200'
            }
          >
            <Box size={16} />
          </div>
          <div>
            <h3 className="text-sm font-black text-brand-900">
              Items to Pack in this Shipment
            </h3>
            <p className="text-[11px] text-brand-500">
              Verify all items before sealing and attaching the tracking label
            </p>
          </div>
        </div>
        <span
          className={
            'rounded-full bg-indigo-50 px-2.5 py-1 text-xs ' +
            'font-black text-indigo-700 border border-indigo-200'
          }
        >
          {totalItemsCount} pcs total
        </span>
      </div>

      {items.length > 0 ? (
        <div className="divide-y divide-brand-100 max-h-56 overflow-y-auto pr-1">
          {items.map((item, i) => (
            <div
              key={item.id || i}
              className="py-2.5 flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={
                    'flex h-10 w-10 shrink-0 items-center justify-center ' +
                    'rounded-xl bg-brand-50 border border-brand-100 overflow-hidden text-brand-400'
                  }
                >
                  {item.photoUrl || item.product?.imageUrl ? (
                    <img
                      src={item.photoUrl || item.product?.imageUrl || undefined}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Package size={18} />
                  )}
                </div>
                <div className="min-w-0 truncate">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-brand-900 truncate">
                      {item.product?.name || item.manualProductName || 'Item'}
                    </p>
                    {item.brandName && (
                      <span
                        className={
                          'rounded bg-brand-100 px-1.5 py-0.5 text-[10px] ' +
                          'font-bold text-brand-700 shrink-0'
                        }
                      >
                        {item.brandName}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5 text-[11px] text-brand-500 mt-0.5">
                    {item.variation && (
                      <span>
                        Var: <strong className="text-brand-700">{item.variation}</strong>
                      </span>
                    )}
                    {item.size && (
                      <span>
                        Size: <strong className="text-brand-700">{item.size}</strong>
                      </span>
                    )}
                    {item.color && (
                      <span>
                        Color: <strong className="text-brand-700">{item.color}</strong>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <span
                  className={
                    'flex h-6 items-center px-2 rounded-lg bg-indigo-50 ' +
                    'font-black text-indigo-700 text-xs'
                  }
                >
                  x{item.quantity}
                </span>
                <StatusBadge value={item.fulfillmentStatus || 'AVAILABLE'} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl bg-brand-50/60 p-4 text-center text-xs text-brand-500 italic">
          No individual order items recorded for this shipment.
        </div>
      )}
    </div>
  );
}
