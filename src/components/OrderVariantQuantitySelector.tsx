import React from 'react';
import { Copy, Plus, ShoppingBag } from 'lucide-react';
import { money } from '~/lib/format';
import { OrderVariantRow } from './OrderVariantRow';

export interface VariantQuantityItem {
  variant: string;
  size: string;
  quantity: number;
  price?: number;
}

interface OrderVariantQuantitySelectorProps {
  value?: VariantQuantityItem[];
  onChange: (items: VariantQuantityItem[]) => void;
  form: Record<string, any>;
  disabled?: boolean;
}

export function OrderVariantQuantitySelector({
  value,
  onChange,
  form,
  disabled = false,
}: OrderVariantQuantitySelectorProps) {
  const defaultPrice = Number(form.unitPriceForeign || form.unit_price_foreign || 0);

  const items: VariantQuantityItem[] = React.useMemo(() => {
    if (Array.isArray(value) && value.length > 0) {
      return value.map((it) => ({
        variant: it.variant ?? '',
        size: it.size ?? '',
        quantity: Math.max(1, Number(it.quantity || 1)),
        price:
          it.price !== undefined && it.price !== null
            ? Number(it.price)
            : defaultPrice > 0
            ? defaultPrice
            : undefined,
      }));
    }
    return [{ variant: '', size: '', quantity: 1, price: defaultPrice || undefined }];
  }, [value, defaultPrice]);

  const rawProduct = form.productId_option?.raw || form.selectedProduct;
  const isNewProduct = form.productId === '__NEW_PRODUCT__';

  const availableVariants = React.useMemo(() => {
    const raw = isNewProduct
      ? form.newProductVariant
      : rawProduct?.variant || rawProduct?.variation;
    if (!raw || typeof raw !== 'string') return [];
    return raw
      .split(/[,;\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }, [rawProduct, isNewProduct, form.newProductVariant]);

  const availableSizes = React.useMemo(() => {
    const raw = isNewProduct ? form.newProductSize : rawProduct?.size;
    if (!raw || typeof raw !== 'string') return [];
    return raw
      .split(/[,;\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }, [rawProduct, isNewProduct, form.newProductSize]);

  const totalQuantity = items.reduce((sum, it) => sum + Number(it.quantity || 1), 0);
  const totalSubtotal = items.reduce((sum, it) => {
    const p = it.price !== undefined && it.price !== null ? Number(it.price) : defaultPrice;
    return sum + Number(it.quantity || 1) * p;
  }, 0);

  const handleUpdate = (index: number, patch: Partial<VariantQuantityItem>) => {
    const next = items.map((it, idx) => (idx === index ? { ...it, ...patch } : it));
    onChange(next);
  };

  const handleApplyAll = (priceToApply: number) => {
    const next = items.map((it) => ({ ...it, price: priceToApply }));
    onChange(next);
  };

  const handleAddRow = (presetVariant = '', presetSize = '') => {
    const lastPrice = items[items.length - 1]?.price ?? defaultPrice;
    onChange([
      ...items,
      { variant: presetVariant, size: presetSize, quantity: 1, price: lastPrice },
    ]);
  };

  const handleRemoveRow = (index: number) => {
    if (items.length <= 1) return;
    onChange(items.filter((_, idx) => idx !== index));
  };

  if (!form.productId) {
    return (
      <div
        className={
          'rounded-2xl border border-dashed border-brand-200 bg-brand-50/40 ' +
          'p-4 text-center'
        }
      >
        <ShoppingBag size={20} className="mx-auto text-brand-400 mb-1.5" />
        <p className="text-xs font-bold text-brand-700">Select a Product First</p>
        <p className="text-[11px] text-brand-400">
          Choose an event and product above to specify variants, sizes, and quantities.
        </p>
      </div>
    );
  }

  const primaryPhoto =
    rawProduct?.image_url ||
    rawProduct?.imageUrls?.[0] ||
    rawProduct?.image_urls?.[0] ||
    form.newProductImageUrls?.[0] ||
    form.newProductImageUrl;

  const firstValidPrice = items.find((it) => Number(it.price || 0) > 0)?.price ?? defaultPrice;

  return (
    <div className="space-y-3 rounded-2xl border border-brand-200 bg-white p-3.5 shadow-sm">
      {/* Product Summary Header */}
      <div
        className={
          'flex flex-wrap items-center justify-between gap-2.5 pb-2.5 ' +
          'border-b border-brand-100'
        }
      >
        <div className="flex items-center gap-2.5">
          {primaryPhoto ? (
            <img
              src={primaryPhoto}
              alt=""
              className="h-10 w-10 rounded-xl object-cover border border-brand-100 shrink-0"
            />
          ) : (
            <div
              className={
                'grid h-10 w-10 place-items-center rounded-xl bg-brand-100 ' +
                'text-brand-500 font-bold text-xs shrink-0'
              }
            >
              <ShoppingBag size={18} />
            </div>
          )}
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-brand-900">
                {rawProduct?.name || form.newProductName || 'Selected Product'}
              </span>
              {rawProduct?.sku && (
                <span
                  className={
                    'rounded bg-brand-100 px-1.5 py-0.2 text-[9px] ' +
                    'font-mono text-brand-700'
                  }
                >
                  {rawProduct.sku}
                </span>
              )}
            </div>
            <p className="text-xs font-black text-rose-600">
              {defaultPrice > 0 ? `${money(defaultPrice)} base price` : 'Set prices per variant'}
            </p>
          </div>
        </div>

        {firstValidPrice > 0 && items.length > 1 && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => handleApplyAll(firstValidPrice)}
            className={
              'inline-flex items-center gap-1 rounded-lg border border-brand-200 ' +
              'bg-brand-50 px-2 py-1 text-[11px] font-bold text-brand-700 ' +
              'hover:bg-brand-100 hover:border-brand-300 transition cursor-pointer'
            }
            title="Apply first price to all variant rows"
          >
            <Copy size={12} className="text-cherry-500" />
            <span>Copy Price to All Rows</span>
          </button>
        )}
      </div>

      {/* Quick Variant & Size Suggestion Chips */}
      {(availableVariants.length > 0 || availableSizes.length > 0) && (
        <div className="space-y-1.5 rounded-xl bg-brand-50/60 p-2 text-xs">
          {availableVariants.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-bold text-brand-500 uppercase tracking-wider">
                Variant Options:
              </span>
              {availableVariants.map((v) => (
                <button
                  type="button"
                  key={v}
                  disabled={disabled}
                  onClick={() => handleAddRow(v, '')}
                  className={
                    'rounded-lg bg-white border border-brand-200 px-2 py-0.5 ' +
                    'text-[10px] font-bold text-brand-700 hover:bg-brand-100 transition ' +
                    'cursor-pointer active:scale-95'
                  }
                  title={`Click to add row with variant: ${v}`}
                >
                  + {v}
                </button>
              ))}
            </div>
          )}

          {availableSizes.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-bold text-brand-500 uppercase tracking-wider">
                Size Options:
              </span>
              {availableSizes.map((s) => (
                <button
                  type="button"
                  key={s}
                  disabled={disabled}
                  onClick={() => handleAddRow('', s)}
                  className={
                    'rounded-lg bg-white border border-brand-200 px-2 py-0.5 ' +
                    'text-[10px] font-bold text-brand-700 hover:bg-brand-100 transition ' +
                    'cursor-pointer active:scale-95'
                  }
                  title={`Click to add row with size: ${s}`}
                >
                  + {s}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Rows Table */}
      <div className="space-y-2">
        {items.map((row, index) => (
          <OrderVariantRow
            key={index}
            index={index}
            row={row}
            defaultPrice={defaultPrice}
            availableVariants={availableVariants}
            availableSizes={availableSizes}
            disabled={disabled}
            canRemove={items.length > 1}
            onUpdate={(patch) => handleUpdate(index, patch)}
            onRemove={() => handleRemoveRow(index)}
            onApplyToAll={items.length > 1 ? handleApplyAll : undefined}
          />
        ))}
      </div>

      {/* Add Row Button & Bottom Summary Bar */}
      <div
        className={
          'flex flex-wrap items-center justify-between gap-2 pt-1 ' +
          'border-t border-brand-100'
        }
      >
        <button
          type="button"
          disabled={disabled}
          onClick={() => handleAddRow()}
          className={
            'inline-flex items-center gap-1.5 rounded-xl border border-dashed ' +
            'border-brand-300 bg-white px-3 py-1.5 text-xs font-bold text-brand-700 ' +
            'hover:border-brand-400 hover:bg-brand-50 transition cursor-pointer'
          }
        >
          <Plus size={14} className="text-brand-500" />
          <span>+ Add Another Variant / Size</span>
        </button>

        <div className="flex items-center gap-2 text-xs">
          <span className="rounded-md bg-brand-100 px-2 py-0.5 font-bold text-brand-700">
            Total: {totalQuantity} pcs
          </span>
          <span className="rounded-md bg-cherry-50 px-2 py-0.5 font-bold text-cherry-700">
            Subtotal: {money(totalSubtotal)}
          </span>
        </div>
      </div>
    </div>
  );
}
