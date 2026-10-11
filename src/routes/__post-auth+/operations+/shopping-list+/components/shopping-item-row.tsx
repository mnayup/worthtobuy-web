import React from 'react';
import {
  Image as ImageIcon,
  Tag,
  Check,
  PackageX,
} from 'lucide-react';
import { money } from '~/lib/format';
import { StatusBadge } from '~/components/StatusBadge';
import type { ShoppingListItem } from '../types';

interface ShoppingItemRowProps {
  item: ShoppingListItem;
  onSetStatus: (id: number, status: string) => void;
}

export function ShoppingItemRow({ item, onSetStatus }: ShoppingItemRowProps) {
  const productName =
    item.product?.name || item.manualProductName || 'Custom Requested Product';
  const image = item.photoUrl || item.product?.imageUrl;
  const targetPrice =
    item.targetPriceIdr || Number(item.unitPriceForeign || 0) * item.quantity;

  return (
    <div
      className={
        'grid gap-4 p-4 lg:grid-cols-[72px_1fr_auto] lg:items-center ' +
        'hover:bg-brand-50/30 transition'
      }
    >
      {image ? (
        <img
          src={image}
          className="h-16 w-16 rounded-2xl object-cover border border-brand-100"
          alt=""
        />
      ) : (
        <div
          className={
            'grid h-16 w-16 place-items-center rounded-2xl bg-brand-50 ' +
            'text-brand-400 border border-brand-100'
          }
        >
          <ImageIcon size={24} />
        </div>
      )}
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-bold text-brand-900 text-sm">{productName}</p>
          <StatusBadge value={item.sourceType || 'CATALOG'} />
        </div>
        <p className="mt-1 text-xs font-semibold text-brand-500">
          {item.order?.orderNumber} • {item.order?.customer?.fullName} •{' '}
          {item.order?.period?.code}
        </p>
        <div className="mt-2 flex flex-wrap gap-2 text-xs text-brand-500">
          <span className="pill bg-white border border-brand-200">
            <Tag size={12} className="text-brand-400" /> Qty {item.quantity}
          </span>
          <span className="pill bg-white border border-brand-200 font-semibold text-brand-800">
            Target {money(targetPrice)}
          </span>
          {item.variation && (
            <span className="pill bg-cherry-50 text-cherry-700 border border-cherry-200">
              Var: {item.variation}
            </span>
          )}
          {item.size && (
            <span className="pill bg-brand-50 text-brand-700 border border-brand-200">
              Size: {item.size}
            </span>
          )}
        </div>
        {item.purchaseNotes && (
          <p className="mt-2 text-xs text-brand-500 font-medium">
            Notes: {item.purchaseNotes}
          </p>
        )}
      </div>
      <div className="flex flex-wrap gap-2 lg:max-w-[320px] lg:justify-end">
        <StatusBadge value={item.purchaseStatus} />
        {item.purchaseStatus !== 'PURCHASED' && (
          <button
            className="btn-primary !px-3 !py-2 text-xs font-bold cursor-pointer"
            onClick={() => onSetStatus(item.id, 'PURCHASED')}
          >
            <Check size={15} /> Found
          </button>
        )}
        {item.purchaseStatus !== 'OUT_OF_STOCK' && (
          <button
            className="btn-secondary !px-3 !py-2 text-xs font-bold cursor-pointer"
            onClick={() => onSetStatus(item.id, 'OUT_OF_STOCK')}
          >
            <PackageX size={15} /> Out of Stock
          </button>
        )}
      </div>
    </div>
  );
}
