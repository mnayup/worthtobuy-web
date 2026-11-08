import React from 'react';
import { Copy, Plus, ShoppingBag, Sparkles } from 'lucide-react';
import { money } from '~/lib/format';
import { OrderVariantRow } from './OrderVariantRow';
import {
  parseProductPriceRules,
  findMatchingVariantPrice,
  applyBundleToItems,
  type BundlePriceRule,
} from '~/lib/pricing-rules';

export interface VariantQuantityItem {
  variant: string;
  size: string;
  quantity: number;
  price?: number;
  bundleName?: string;
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
  const rawProduct = form.productId_option?.raw || form.selectedProduct;
  const isNewProduct = form.productId === '__NEW_PRODUCT__';

  const productPriceRules = React.useMemo(() => {
    const raw = rawProduct?.variant_prices || rawProduct?.variantPrices;
    return parseProductPriceRules(raw);
  }, [rawProduct]);

  const availableBundles = React.useMemo(() => {
    return productPriceRules.bundleRules || [];
  }, [productPriceRules]);

  const [activeBundleId, setActiveBundleId] = React.useState<string | null>(null);

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
        bundleName: it.bundleName,
      }));
    }
    return [{ variant: '', size: '', quantity: 1, price: defaultPrice || undefined }];
  }, [value, defaultPrice]);

  const isReadyOrLiveStock = React.useMemo(() => {
    if (isNewProduct) return false;
    return (
      form.periodId_option?.type === 'LIVE_SHOPPING' ||
      form.periodId_option?.raw?.type === 'LIVE_SHOPPING' ||
      form.periodId_option?.code === 'READY-STOCK' ||
      rawProduct?.period?.type === 'LIVE_SHOPPING' ||
      ['READY_STOCK', 'BOTH'].includes(rawProduct?.stock_mode || rawProduct?.stockMode)
    );
  }, [isNewProduct, form.periodId_option, rawProduct]);

  const availableVariantStocks: Array<{
    variant: string;
    size: string;
    available: number;
  }> = React.useMemo(() => {
    if (!isReadyOrLiveStock) return [];
    const list = rawProduct?.available_variant_stocks;
    return Array.isArray(list) ? list.filter((x: any) => Number(x.available || 0) > 0) : [];
  }, [isReadyOrLiveStock, rawProduct]);

  const availableVariants = React.useMemo(() => {
    if (isReadyOrLiveStock && Array.isArray(rawProduct?.available_variant_stocks)) {
      return Array.from(
        new Set(availableVariantStocks.map((x) => x.variant).filter(Boolean))
      );
    }
    const raw = isNewProduct
      ? form.newProductVariant
      : rawProduct?.variant || rawProduct?.variation;
    if (!raw || typeof raw !== 'string') return [];
    return raw
      .split(/[,;\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }, [rawProduct, isNewProduct, form.newProductVariant, isReadyOrLiveStock, availableVariantStocks]);

  const availableSizes = React.useMemo(() => {
    if (isReadyOrLiveStock && Array.isArray(rawProduct?.available_variant_stocks)) {
      return Array.from(
        new Set(availableVariantStocks.map((x) => x.size).filter(Boolean))
      );
    }
    const raw = isNewProduct ? form.newProductSize : rawProduct?.size;
    if (!raw || typeof raw !== 'string') return [];
    return raw
      .split(/[,;\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }, [rawProduct, isNewProduct, form.newProductSize, isReadyOrLiveStock, availableVariantStocks]);

  const variantStockCounts = React.useMemo(() => {
    if (!isReadyOrLiveStock || availableVariantStocks.length === 0) return undefined;
    const map: Record<string, number> = {};
    for (const entry of availableVariantStocks) {
      if (!entry.variant) continue;
      map[entry.variant] = (map[entry.variant] || 0) + entry.available;
    }
    return map;
  }, [isReadyOrLiveStock, availableVariantStocks]);

  const getSizesForVariant = React.useCallback(
    (selectedVariant: string) => {
      if (!isReadyOrLiveStock || !Array.isArray(rawProduct?.available_variant_stocks)) {
        return availableSizes;
      }
      const normVar = (selectedVariant || '').trim().toLowerCase();
      const matching = normVar
        ? availableVariantStocks.filter((x) => x.variant.trim().toLowerCase() === normVar)
        : availableVariantStocks;
      return Array.from(new Set(matching.map((x) => x.size).filter(Boolean)));
    },
    [isReadyOrLiveStock, rawProduct, availableVariantStocks, availableSizes]
  );

  const getSizeStockCountsForVariant = React.useCallback(
    (selectedVariant: string) => {
      if (!isReadyOrLiveStock || availableVariantStocks.length === 0) return undefined;
      const normVar = (selectedVariant || '').trim().toLowerCase();
      const matching = normVar
        ? availableVariantStocks.filter((x) => x.variant.trim().toLowerCase() === normVar)
        : availableVariantStocks;
      const map: Record<string, number> = {};
      for (const entry of matching) {
        if (!entry.size) continue;
        map[entry.size] = (map[entry.size] || 0) + entry.available;
      }
      return map;
    },
    [isReadyOrLiveStock, availableVariantStocks]
  );

  const getMaxQuantityForRow = React.useCallback(
    (rowVariant: string, rowSize: string, rowIdx: number) => {
      if (!isReadyOrLiveStock) return undefined;
      const totalProdStock = Math.max(
        0,
        Number(rawProduct?.stock_quantity ?? rawProduct?.stockQuantity ?? 0) -
          Number(rawProduct?.reserved_quantity ?? rawProduct?.reservedQuantity ?? 0)
      );
      if (availableVariantStocks.length === 0) {
        return totalProdStock > 0 ? totalProdStock : undefined;
      }
      const normVar = (rowVariant || '').trim().toLowerCase();
      const normSize = (rowSize || '').trim().toLowerCase();
      const matched = availableVariantStocks.filter(
        (x) =>
          (!normVar || x.variant.trim().toLowerCase() === normVar) &&
          (!normSize || x.size.trim().toLowerCase() === normSize)
      );
      const bucketAvail = matched.reduce((sum, x) => sum + x.available, 0);
      const usedInOtherRows = items.reduce((sum, it, idx) => {
        if (idx === rowIdx) return sum;
        const itVar = (it.variant || '').trim().toLowerCase();
        const itSize = (it.size || '').trim().toLowerCase();
        if (itVar === normVar && itSize === normSize) {
          return sum + Number(it.quantity || 1);
        }
        return sum;
      }, 0);
      return Math.max(1, bucketAvail - usedInOtherRows);
    },
    [isReadyOrLiveStock, rawProduct, availableVariantStocks, items]
  );

  const activeBundle = React.useMemo(() => {
    if (!activeBundleId) return null;
    return availableBundles.find((b, idx) => (b.id || String(idx)) === activeBundleId) || null;
  }, [activeBundleId, availableBundles]);

  const maxBundleCapacity = activeBundle ? activeBundle.minQty : null;

  const totalQuantity = items.reduce((sum, it) => sum + Number(it.quantity || 1), 0);
  const totalSubtotal = activeBundle
    ? activeBundle.bundlePrice
    : items.reduce((sum, it) => {
        const p = it.price !== undefined && it.price !== null ? Number(it.price) : defaultPrice;
        return sum + Number(it.quantity || 1) * p;
      }, 0);

  const handleUpdate = (index: number, patch: Partial<VariantQuantityItem>) => {
    // If bundle is active, prevent exceeding bundle package max capacity
    if (activeBundle && patch.quantity !== undefined) {
      const currentOtherQty = items.reduce(
        (sum, it, idx) => (idx === index ? sum : sum + Number(it.quantity || 1)),
        0
      );
      const requestedQty = Math.max(1, Number(patch.quantity));
      if (currentOtherQty + requestedQty > activeBundle.minQty) {
        return;
      }
    }

    const rawUpdated = items.map((it, idx) => {
      if (idx !== index) return it;
      const updated = { ...it, ...patch };

      if (isReadyOrLiveStock && patch.variant !== undefined) {
        const validSizes = getSizesForVariant(updated.variant);
        if (validSizes.length > 0 && !validSizes.includes(updated.size)) {
          updated.size = validSizes[0];
        } else if (validSizes.length === 0) {
          updated.size = '';
        }
      }

      // If variant or size changed and not in a locked bundle deal, recalculate matched variant price
      if (
        !activeBundleId &&
        (patch.variant !== undefined || patch.size !== undefined) &&
        patch.price === undefined
      ) {
        const matched = findMatchingVariantPrice(
          productPriceRules,
          updated.variant,
          updated.size,
          defaultPrice
        );
        updated.price = matched;
      }
      return updated;
    });

    if (activeBundleId) {
      const recomputed = applyBundleToItems(rawUpdated, activeBundle, productPriceRules, defaultPrice);
      onChange(recomputed);
    } else {
      onChange(rawUpdated);
    }
  };

  const handleApplyAll = (priceToApply: number) => {
    setActiveBundleId(null);
    const next = items.map((it) => ({ ...it, price: priceToApply, bundleName: undefined }));
    onChange(next);
  };

  const handleAddRow = (presetVariant = '', presetSize = '') => {
    if (activeBundle && totalQuantity >= activeBundle.minQty) {
      return;
    }

    const newRow: VariantQuantityItem = {
      variant: presetVariant,
      size: presetSize,
      quantity: 1,
      price: findMatchingVariantPrice(productPriceRules, presetVariant, presetSize, defaultPrice),
    };
    const nextItems = [...items, newRow];

    if (activeBundleId) {
      const recomputed = applyBundleToItems(nextItems, activeBundle, productPriceRules, defaultPrice);
      onChange(recomputed);
    } else {
      onChange(nextItems);
    }
  };

  const handleRemoveRow = (index: number) => {
    if (items.length <= 1) return;
    const remaining = items.filter((_, idx) => idx !== index);
    if (activeBundleId) {
      const recomputed = applyBundleToItems(remaining, activeBundle, productPriceRules, defaultPrice);
      onChange(recomputed);
    } else {
      onChange(remaining);
    }
  };

  const handleSelectBundle = (bundle: BundlePriceRule | null, bundleKey: string | null) => {
    setActiveBundleId(bundleKey);
    // When activating a bundle, trim or adjust items so total fits bundle.minQty
    let baseItems = [...items];
    if (bundle && bundle.minQty > 0) {
      // If current count is less than minQty, pad with rows up to bundle.minQty
      const currentQty = baseItems.reduce((sum, it) => sum + Number(it.quantity || 1), 0);
      if (currentQty < bundle.minQty) {
        const needed = bundle.minQty - currentQty;
        const lastRow = baseItems[baseItems.length - 1];
        for (let k = 0; k < needed; k++) {
          baseItems.push({
            variant: lastRow?.variant || availableVariants[0] || '',
            size: lastRow?.size || availableSizes[0] || '',
            quantity: 1,
            price: 0,
          });
        }
      } else if (currentQty > bundle.minQty) {
        // Trim down to minQty
        const trimmed: VariantQuantityItem[] = [];
        let count = 0;
        for (const it of baseItems) {
          if (count >= bundle.minQty) break;
          const q = Math.min(Number(it.quantity || 1), bundle.minQty - count);
          trimmed.push({ ...it, quantity: q });
          count += q;
        }
        baseItems = trimmed;
      }
    }

    const updated = applyBundleToItems(baseItems, bundle, productPriceRules, defaultPrice);
    onChange(updated);
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

      {/* Bundle Selection Bar (if product has bundle rules) */}
      {availableBundles.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-2.5 space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Sparkles size={14} className="text-amber-600" />
            <span className="text-xs font-black text-amber-900">
              Promo Package / Bundle Deal Available:
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={disabled}
              onClick={() => handleSelectBundle(null, null)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition border cursor-pointer ${
                !activeBundleId
                  ? 'bg-brand-900 text-white border-brand-900 shadow-2xs'
                  : 'bg-white text-brand-700 border-brand-200 hover:bg-brand-50'
              }`}
            >
              Standard (Per Piece)
            </button>
            {availableBundles.map((b, idx) => {
              const bKey = b.id || String(idx);
              const isSelected = activeBundleId === bKey;
              const unitEquivalent =
                b.minQty > 0 ? Math.round(b.bundlePrice / b.minQty) : b.bundlePrice;

              return (
                <button
                  key={bKey}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleSelectBundle(b, bKey)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition border flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                      : 'bg-white text-amber-900 border-amber-300 hover:bg-amber-100/60'
                  }`}
                >
                  <span>{b.name || `Bundle ${b.minQty} pcs`}</span>
                  <span
                    className={`text-[10px] px-1 py-0.2 rounded font-black ${
                      isSelected ? 'bg-amber-700 text-amber-100' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {money(b.bundlePrice)} ({money(unitEquivalent)}/pc)
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

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
        {items.map((row, index) => {
          const isAtBundleLimit = activeBundle ? totalQuantity >= activeBundle.minQty : false;
          const rowSizes = getSizesForVariant(row.variant);
          const rowSizeCounts = getSizeStockCountsForVariant(row.variant);
          const rowMaxQty = getMaxQuantityForRow(row.variant, row.size, index);
          return (
            <OrderVariantRow
              key={index}
              index={index}
              row={row}
              defaultPrice={defaultPrice}
              availableVariants={availableVariants}
              availableSizes={rowSizes}
              variantStockCounts={variantStockCounts}
              sizeStockCounts={rowSizeCounts}
              maxQuantity={rowMaxQty}
              lockToAvailableStock={isReadyOrLiveStock}
              disabled={disabled}
              isBundleActive={Boolean(activeBundle)}
              canIncrease={!isAtBundleLimit}
              canRemove={items.length > 1}
              onUpdate={(patch) => handleUpdate(index, patch)}
              onRemove={() => handleRemoveRow(index)}
              onApplyToAll={items.length > 1 && !activeBundle ? handleApplyAll : undefined}
            />
          );
        })}
      </div>

      {/* Add Row Button & Bottom Summary Bar */}
      <div
        className={
          'flex flex-wrap items-center justify-between gap-2 pt-1 ' +
          'border-t border-brand-100'
        }
      >
        {activeBundle && totalQuantity >= activeBundle.minQty ? (
          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-xl">
            ✓ Bundle Package Full ({activeBundle.minQty} pcs max). Add next item as another product below.
          </span>
        ) : (
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
        )}

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
