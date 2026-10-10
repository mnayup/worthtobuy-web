import React from 'react';
import { Package } from 'lucide-react';

interface SetTrackingItemsPreviewProps {
  items: any[];
}

export function SetTrackingItemsPreview({ items }: SetTrackingItemsPreviewProps) {
  const totalCount = items.reduce((s, it) => s + (it.quantity || 1), 0);

  return (
    <div className="rounded-2xl border border-brand-100 bg-brand-50/40 p-4 space-y-2.5">
      <div className="flex items-center justify-between">
        <span
          className={
            'text-xs font-bold uppercase tracking-wider text-brand-500 ' +
            'flex items-center gap-1.5'
          }
        >
          <Package size={14} className="text-brand-600" />
          Items to Pack ({totalCount} pcs)
        </span>
        <span className="text-xs font-semibold text-brand-600">
          {items.length} product line{items.length > 1 ? 's' : ''}
        </span>
      </div>
      {items.length > 0 ? (
        <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
          {items.map((item) => (
            <div
              key={item.id}
              className={
                'flex items-center justify-between text-xs bg-white/80 ' +
                'border border-brand-100 rounded-xl p-2'
              }
            >
              <div className="flex items-center gap-2 truncate">
                <span
                  className={
                    'flex h-5 w-5 shrink-0 items-center justify-center ' +
                    'rounded-md bg-indigo-50 font-bold text-indigo-700 text-[10px]'
                  }
                >
                  {item.quantity}x
                </span>
                <span className="font-semibold text-brand-900 truncate">
                  {item.product?.name || item.manualProductName || 'Item'}
                </span>
                {(item.variation || item.size || item.color) && (
                  <span className="text-brand-400 text-[11px] truncate">
                    ({[item.variation, item.size, item.color].filter(Boolean).join(' • ')})
                  </span>
                )}
              </div>
              {item.brandName && (
                <span
                  className={
                    'text-[10px] font-bold text-brand-500 bg-brand-100 ' +
                    'px-1.5 py-0.5 rounded-md shrink-0'
                  }
                >
                  {item.brandName}
                </span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-brand-500 italic">
          No specific items listed on order.
        </p>
      )}
    </div>
  );
}
