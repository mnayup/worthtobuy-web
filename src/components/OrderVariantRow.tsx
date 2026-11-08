import React from 'react';
import { Copy, Trash2 } from 'lucide-react';
import { money } from '~/lib/format';
import type { VariantQuantityItem } from './OrderVariantQuantitySelector';

interface OrderVariantRowProps {
  index: number;
  row: VariantQuantityItem;
  defaultPrice: number;
  availableVariants?: string[];
  availableSizes?: string[];
  variantStockCounts?: Record<string, number>;
  sizeStockCounts?: Record<string, number>;
  maxQuantity?: number;
  lockToAvailableStock?: boolean;
  disabled?: boolean;
  canIncrease?: boolean;
  isBundleActive?: boolean;
  canRemove: boolean;
  onUpdate: (patch: Partial<VariantQuantityItem>) => void;
  onRemove: () => void;
  onApplyToAll?: (price: number) => void;
}

const formatCurrency = (val: any) =>
  val != null && val !== ''
    ? String(val).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    : '';

export function OrderVariantRow({
  index,
  row,
  defaultPrice,
  availableVariants = [],
  availableSizes = [],
  variantStockCounts,
  sizeStockCounts,
  maxQuantity,
  lockToAvailableStock = false,
  disabled,
  canIncrease = true,
  isBundleActive = false,
  canRemove,
  onUpdate,
  onRemove,
  onApplyToAll,
}: OrderVariantRowProps) {
  const effectivePrice = Number(
    row.price !== undefined && row.price !== null
      ? row.price
      : defaultPrice || 0
  );
  const rowSubtotal = Number(row.quantity || 1) * effectivePrice;

  const hasVariantOptions = availableVariants.length > 0 || lockToAvailableStock;
  const hasSizeOptions = availableSizes.length > 0 || lockToAvailableStock;
  const isAtMaxStock = maxQuantity !== undefined ? row.quantity >= maxQuantity : false;

  return (
    <div
      className={
        'flex flex-col lg:flex-row items-stretch lg:items-center gap-2 ' +
        'rounded-xl border border-brand-200 bg-brand-50/30 p-2.5 transition ' +
        'hover:border-brand-300'
      }
    >
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        <span
          className={
            'flex h-5 w-5 shrink-0 items-center justify-center rounded-full ' +
            'bg-brand-200 text-[10px] font-bold text-brand-800'
          }
        >
          {index + 1}
        </span>

        {/* Variant selection: dropdown if options available, else text input */}
        <div className="flex-1 min-w-[120px]">
          {hasVariantOptions ? (
            <select
              disabled={disabled}
              value={row.variant}
              onChange={(e) => onUpdate({ variant: e.target.value })}
              className={
                'w-full rounded-lg border border-brand-200 bg-white px-2 py-1.5 ' +
                'text-xs font-semibold text-brand-900 focus:border-cherry-500 ' +
                'focus:outline-none cursor-pointer'
              }
            >
              <option value="">
                {availableVariants.length > 0 ? 'Select Variant...' : 'No Variant / Default'}
              </option>
              {availableVariants.map((v) => {
                const count = variantStockCounts?.[v];
                const isOutOfStock = lockToAvailableStock && variantStockCounts !== undefined && (count === undefined || count <= 0);
                return (
                  <option key={v} value={v} disabled={isOutOfStock}>
                    {v}
                    {count !== undefined ? ` (${count} pcs)` : ''}
                    {isOutOfStock ? ' - Habis' : ''}
                  </option>
                );
              })}
            </select>
          ) : (
            <input
              type="text"
              disabled={disabled}
              value={row.variant}
              onChange={(e) => onUpdate({ variant: e.target.value })}
              placeholder="Variant (Color / Pattern)"
              className={
                'w-full rounded-lg border border-brand-200 bg-white px-2.5 py-1.5 ' +
                'text-xs font-semibold text-brand-900 placeholder:text-brand-300 ' +
                'focus:border-cherry-500 focus:outline-none'
              }
            />
          )}
        </div>

        {/* Size selection: dropdown if options available, else text input */}
        <div className="w-32 shrink-0">
          {hasSizeOptions ? (
            <select
              disabled={disabled}
              value={row.size}
              onChange={(e) => onUpdate({ size: e.target.value })}
              className={
                'w-full rounded-lg border border-brand-200 bg-white px-2 py-1.5 ' +
                'text-xs font-semibold text-brand-900 focus:border-cherry-500 ' +
                'focus:outline-none cursor-pointer'
              }
            >
              <option value="">
                {availableSizes.length > 0 ? 'Select Size...' : 'No Size / Default'}
              </option>
              {availableSizes.map((s) => {
                const count = sizeStockCounts?.[s];
                const isOutOfStock = lockToAvailableStock && sizeStockCounts !== undefined && (count === undefined || count <= 0);
                return (
                  <option key={s} value={s} disabled={isOutOfStock}>
                    {s}
                    {count !== undefined ? ` (${count} pcs)` : ''}
                    {isOutOfStock ? ' - Habis' : ''}
                  </option>
                );
              })}
            </select>
          ) : (
            <input
              type="text"
              disabled={disabled}
              value={row.size}
              onChange={(e) => onUpdate({ size: e.target.value })}
              placeholder="Size (S/M/42)"
              className={
                'w-full rounded-lg border border-brand-200 bg-white px-2.5 py-1.5 ' +
                'text-xs font-semibold text-brand-900 placeholder:text-brand-300 ' +
                'focus:border-cherry-500 focus:outline-none'
              }
            />
          )}
        </div>
      </div>

      {/* Price input per variant with Apply to All button */}
      <div className="flex items-center gap-1 shrink-0">
        <div className="relative w-28 shrink-0">
          <span
            className={
              'pointer-events-none absolute inset-y-0 left-0 flex ' +
              'items-center pl-2 text-[10px] font-bold text-slate-400'
            }
          >
            Rp
          </span>
          <input
            type="text"
            disabled={disabled}
            value={
              row.price !== undefined && row.price !== null
                ? formatCurrency(row.price)
                : formatCurrency(defaultPrice)
            }
            onChange={(e) => {
              const cleaned = e.target.value.replace(/\./g, '');
              if (cleaned && !/^\d+$/.test(cleaned)) return;
              const num = cleaned ? parseInt(cleaned, 10) : 0;
              onUpdate({ price: num });
            }}
            placeholder="Price"
            className={
              'w-full rounded-lg border border-brand-200 bg-white pl-7 pr-2 py-1.5 ' +
              'text-xs font-bold text-brand-900 placeholder:text-brand-300 ' +
              'focus:border-cherry-500 focus:outline-none text-right'
            }
          />
        </div>

        {onApplyToAll && effectivePrice > 0 && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => onApplyToAll(effectivePrice)}
            className={
              'inline-flex items-center gap-0.5 rounded-lg border border-brand-200 ' +
              'bg-white px-1.5 py-1.5 text-[10px] font-bold text-brand-700 ' +
              'hover:bg-brand-50 hover:border-brand-300 transition cursor-pointer shrink-0'
            }
            title="Set this price to all other variants"
          >
            <Copy size={11} className="text-cherry-500" />
            <span className="hidden sm:inline">Set All</span>
          </button>
        )}
      </div>

      {/* Stepper & Row Subtotal */}
      <div className="flex items-center justify-between lg:justify-end gap-2.5 shrink-0">
        <div className="flex items-center rounded-lg border border-brand-200 bg-white">
          <button
            type="button"
            disabled={disabled || row.quantity <= 1}
            onClick={() => onUpdate({ quantity: Math.max(1, row.quantity - 1) })}
            className={
              'px-2 py-1 text-xs font-bold text-brand-600 ' +
              'hover:bg-brand-50 disabled:opacity-40'
            }
          >
            -
          </button>
          <input
            type="number"
            disabled={disabled || isBundleActive}
            min="1"
            max={maxQuantity}
            value={row.quantity}
            onChange={(e) => {
              const rawQty = Math.max(1, parseInt(e.target.value, 10) || 1);
              onUpdate({
                quantity: maxQuantity !== undefined ? Math.min(maxQuantity, rawQty) : rawQty,
              });
            }}
            className="w-9 text-center text-xs font-bold text-brand-900 focus:outline-none disabled:bg-brand-50/50"
          />
          <button
            type="button"
            disabled={disabled || !canIncrease || isAtMaxStock}
            onClick={() =>
              onUpdate({
                quantity:
                  maxQuantity !== undefined
                    ? Math.min(maxQuantity, row.quantity + 1)
                    : row.quantity + 1,
              })
            }
            className={
              'px-2 py-1 text-xs font-bold text-brand-600 ' +
              'hover:bg-brand-50 disabled:opacity-40'
            }
          >
            +
          </button>
        </div>

        <div className="text-right min-w-[75px]">
          <div className="flex items-center justify-end gap-1">
            <span className="text-[11px] font-bold text-brand-900 block">
              {isBundleActive ? '-' : money(rowSubtotal)}
            </span>
            {row.bundleName && (
              <span className="rounded bg-amber-100 text-amber-800 px-1 py-0.2 text-[8px] font-black uppercase tracking-wider shrink-0">
                {row.bundleName}
              </span>
            )}
          </div>
          <span className="text-[9px] text-brand-400">
            {isBundleActive ? `${row.quantity} pc (In Bundle)` : `${row.quantity} x ${money(effectivePrice)}`}
          </span>
          {lockToAvailableStock && maxQuantity !== undefined && (
            <span
              className={`block text-[9px] font-bold ${
                maxQuantity <= 0 ? 'text-rose-600' : 'text-emerald-600'
              }`}
            >
              Max: {maxQuantity} ready
            </span>
          )}
        </div>

        {canRemove && (
          <button
            type="button"
            disabled={disabled}
            onClick={onRemove}
            className={
              'p-1 rounded-lg text-rose-500 hover:bg-rose-50 ' +
              'transition cursor-pointer'
            }
            title="Remove variant row"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
