import React, { useState } from 'react';
import { Plus, Trash2, ShoppingBag } from 'lucide-react';
import { SearchableSelect } from './SearchableSelect';
import { OrderVariantQuantitySelector, type VariantQuantityItem } from './OrderVariantQuantitySelector';
import { loadProducts } from '~/routes/__post-auth+/operations+/orders+/helpers/order-options.helper';
import { parseProductPriceRules, findMatchingVariantPrice } from '~/lib/pricing-rules';
import { money } from '~/lib/format';
import type { Option } from '~/types';

export interface ProductBasketEntry {
  id: string;
  productId: string | number;
  productOption?: Option | null;
  unitPriceForeign: number;
  variantItems: VariantQuantityItem[];
}

interface MultiProductOrderBasketProps {
  value?: ProductBasketEntry[];
  onChange: (entries: ProductBasketEntry[]) => void;
  form: Record<string, any>;
  disabled?: boolean;
}

export function MultiProductOrderBasket({
  value,
  onChange,
  form,
  disabled = false,
}: MultiProductOrderBasketProps) {
  // If no basket entries exist yet, initialize from form.productId & form.variantItems or a single default
  const entries: ProductBasketEntry[] = React.useMemo(() => {
    if (Array.isArray(value) && value.length > 0) {
      return value;
    }
    return [
      {
        id: 'entry-0',
        productId: form.productId || '',
        productOption: form.productId_option || null,
        unitPriceForeign: Number(form.unitPriceForeign || 0),
        variantItems: Array.isArray(form.variantItems) && form.variantItems.length > 0
          ? form.variantItems
          : [{ variant: '', size: '', quantity: 1, price: Number(form.unitPriceForeign || 0) }],
      },
    ];
  }, [value, form.productId, form.productId_option, form.unitPriceForeign, form.variantItems]);

  const updateEntry = (index: number, patch: Partial<ProductBasketEntry>) => {
    const next = entries.map((entry, idx) => (idx === index ? { ...entry, ...patch } : entry));
    onChange(next);
  };

  const addProductEntry = () => {
    const newEntry: ProductBasketEntry = {
      id: `entry-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      productId: '',
      productOption: null,
      unitPriceForeign: 0,
      variantItems: [{ variant: '', size: '', quantity: 1, price: 0 }],
    };
    onChange([...entries, newEntry]);
  };

  const removeProductEntry = (index: number) => {
    if (entries.length <= 1) return;
    onChange(entries.filter((_, idx) => idx !== index));
  };

  const totalAllItems = entries.reduce((total, entry) => {
    return (
      total +
      entry.variantItems.reduce(
        (sum, it) => sum + Number(it.quantity || 1) * Number(it.price ?? entry.unitPriceForeign ?? 0),
        0
      )
    );
  }, 0);

  const totalAllPcs = entries.reduce((total, entry) => {
    return total + entry.variantItems.reduce((sum, it) => sum + Number(it.quantity || 1), 0);
  }, 0);

  return (
    <div className="space-y-4">
      {entries.map((entry, index) => {
        const entryForm = {
          ...form,
          productId: entry.productId,
          productId_option: entry.productOption,
          unitPriceForeign: entry.unitPriceForeign,
          selectedProduct: entry.productOption?.raw,
        };

        return (
          <div
            key={entry.id}
            className="rounded-2xl border-2 border-brand-200/80 bg-white p-4 shadow-xs space-y-3 relative"
          >
            {/* Header with Product Label & Remove Entry button */}
            <div className="flex items-center justify-between border-b border-brand-100 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-cherry-100 text-cherry-700 text-xs font-black">
                  {index + 1}
                </span>
                <span className="text-xs font-black text-brand-900 uppercase tracking-wider">
                  Product #{index + 1}
                </span>
                {entry.productOption?.label && (
                  <span className="text-xs font-bold text-cherry-700 max-w-[280px] sm:max-w-md truncate">
                    • {entry.productOption.label}
                  </span>
                )}
              </div>

              {entries.length > 1 && (
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => removeProductEntry(index)}
                  className="flex items-center gap-1 text-xs font-bold text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded-lg transition cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>Remove Product</span>
                </button>
              )}
            </div>

            {/* Product Search & Select for this entry */}
            <div>
              <label className="label !mb-1">
                Select Product <span className="text-rose-500">*</span>
              </label>
              <SearchableSelect
                name={`product_${entry.id}`}
                value={entry.productId}
                selectedOption={entry.productOption}
                disabled={disabled || !form.periodId}
                loadOptions={loadProducts}
                form={entryForm}
                placeholder="Search catalog or ready-stock product..."
                onChange={(val, opt) => {
                  const unitPrice = Number(opt?.price ?? opt?.raw?.selling_price ?? opt?.raw?.sellingPrice ?? 0);
                  const rawProd = opt?.raw;
                  const priceRules = parseProductPriceRules(rawProd?.variant_prices || rawProd?.variantPrices);
                  const availStocks: Array<{ variant: string; size: string; available: number }> =
                    Array.isArray(rawProd?.available_variant_stocks) ? rawProd.available_variant_stocks : [];
                  const firstAvail = availStocks.find((s) => s.available > 0);
                  const initVariant = firstAvail ? firstAvail.variant : '';
                  const initSize = firstAvail ? firstAvail.size : '';
                  const matchedPrice = findMatchingVariantPrice(
                    priceRules,
                    initVariant,
                    initSize,
                    unitPrice
                  );
                  updateEntry(index, {
                    productId: val,
                    productOption: opt || null,
                    unitPriceForeign: unitPrice,
                    variantItems: [
                      {
                        variant: initVariant,
                        size: initSize,
                        quantity: 1,
                        price: matchedPrice,
                      },
                    ],
                  });
                }}
              />
            </div>

            {/* Variant, Size & Bundle selector for this product */}
            {Boolean(entry.productId) && (
              <OrderVariantQuantitySelector
                value={entry.variantItems}
                disabled={disabled}
                form={entryForm}
                onChange={(items) => updateEntry(index, { variantItems: items })}
              />
            )}
          </div>
        );
      })}

      {/* Action to Add Another Product & Overall Summary */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          type="button"
          disabled={disabled || !form.periodId}
          onClick={addProductEntry}
          className="btn-secondary !text-xs font-bold flex items-center gap-1.5 shadow-2xs hover:border-brand-400 cursor-pointer"
        >
          <Plus size={15} className="text-cherry-600" />
          <span>+ Add Another Product</span>
        </button>

        <div className="flex items-center gap-2.5 text-xs">
          <span className="rounded-lg bg-brand-100 px-2.5 py-1 font-bold text-brand-800">
            Total Items: {totalAllPcs} pcs ({entries.length} product{entries.length > 1 ? 's' : ''})
          </span>
          <span className="rounded-lg bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 font-black text-emerald-700">
            Order Subtotal: {money(totalAllItems)}
          </span>
        </div>
      </div>
    </div>
  );
}

