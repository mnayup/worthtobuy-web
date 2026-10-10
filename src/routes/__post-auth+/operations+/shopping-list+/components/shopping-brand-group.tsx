import React from 'react';
import { Store } from 'lucide-react';
import type { ShoppingListItem } from '../types';
import { ShoppingItemRow } from './shopping-item-row';

interface ShoppingBrandGroupProps {
  brandName: string;
  rows: ShoppingListItem[];
  onSetStatus: (id: number, status: string) => void;
}

export function ShoppingBrandGroup({
  brandName,
  rows,
  onSetStatus,
}: ShoppingBrandGroupProps) {
  const storeLocation = rows[0]?.product?.storeLocation || 'Store location not specified';
  const totalQuantity = rows.reduce((sum, row) => sum + row.quantity, 0);

  return (
    <section className="card overflow-hidden shadow-xs">
      <div
        className={
          'flex flex-col gap-2 border-b border-brand-100 bg-brand-50/50 ' +
          'px-5 py-4 sm:flex-row sm:items-center sm:justify-between'
        }
      >
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-700 border border-indigo-100">
            <Store size={19} />
          </div>
          <div>
            <h2 className="font-black text-brand-900 text-base">{brandName}</h2>
            <p className="text-xs text-brand-500 font-medium">
              {storeLocation} • {rows.length} {rows.length === 1 ? 'item' : 'items'}
            </p>
          </div>
        </div>
        <p className="text-sm font-bold text-brand-700">
          Total Items: {totalQuantity} pcs
        </p>
      </div>
      <div className="divide-y divide-brand-100">
        {rows.map((item) => (
          <ShoppingItemRow
            key={item.id}
            item={item}
            onSetStatus={onSetStatus}
          />
        ))}
      </div>
    </section>
  );
}
