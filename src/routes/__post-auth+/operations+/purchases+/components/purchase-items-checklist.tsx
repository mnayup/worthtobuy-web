import React from 'react';
import type { PurchaseItem } from '../types';
import {
  PurchaseItemChecklistRow,
  type ItemChecklistState,
} from './purchase-item-checklist-row';

export type { ItemChecklistState };

interface PurchaseItemsChecklistProps {
  items: PurchaseItem[];
  itemsState: Record<number, ItemChecklistState>;
  onChangeItemState: (
    itemId: number,
    patch: Partial<ItemChecklistState>
  ) => void;
}

export function PurchaseItemsChecklist({
  items,
  itemsState,
  onChangeItemState,
}: PurchaseItemsChecklistProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="label text-xs font-bold uppercase tracking-wider text-brand-600">
          Order Items & Shopper Checklist
        </label>
        <span className="text-xs text-brand-400 font-medium">
          {items.length} order items
        </span>
      </div>

      <div className="space-y-2.5">
        {items.map((item) => {
          const state = itemsState[item.id] || {
            id: item.id,
            order_item_id: item.order_item_id || item.id,
            status: item.status || 'WAITING_PURCHASE',
            allocated_qty: item.quantity,
            max_qty: item.quantity,
            actual_unit_price:
              Number(item.actual_price || item.estimated_price || 0) /
              (item.quantity || 1),
            estimated_unit_price:
              Number(item.estimated_price || 0) / (item.quantity || 1),
          };

          return (
            <PurchaseItemChecklistRow
              key={item.id}
              item={item}
              state={state}
              onChange={(patch) => onChangeItemState(item.id, patch)}
            />
          );
        })}
      </div>
    </div>
  );
}
