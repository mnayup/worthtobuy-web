import React from 'react';
import { Plus, Trash2, Tag, Layers } from 'lucide-react';
import { money } from '~/lib/format';
import type { VariantPriceRule } from '~/lib/pricing-rules';

export interface ManualPurchaseVariantItem {
  variant: string;
  size: string;
  quantity: number;
  buyPrice: number;
  sellingPrice: number;
}

interface ManualPurchaseVariantItemsSelectorProps {
  value?: ManualPurchaseVariantItem[];
  onChange: (items: ManualPurchaseVariantItem[]) => void;
  form?: Record<string, any>;
  disabled?: boolean;
}

const formatCurrency = (val: any) =>
  val != null && val !== '' ? String(val).replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '';

const parseTags = (raw: any): string[] => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(String).map((s) => s.trim()).filter(Boolean);
  if (typeof raw === 'string') {
    return raw
      .split(/[,;\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
};

/**
 * Automatically group variant & size purchase rows into Product VariantPriceRules:
 * - Rows with the same (buyPrice, sellingPrice) are merged into 1 rule (combining unique variants & sizes).
 * - Rows with different (buyPrice, sellingPrice) are split into separate rules.
 */
export function buildGroupedVariantRulesFromItems(
  items: ManualPurchaseVariantItem[]
): Array<VariantPriceRule & { mergedCount: number }> {
  const groups = new Map<
    string,
    {
      variants: Set<string>;
      sizes: Set<string>;
      buyPrice: number;
      sellingPrice: number;
      mergedCount: number;
    }
  >();

  for (const it of items) {
    const buyPrice = Math.max(0, Number(it.buyPrice || 0));
    const sellingPrice = Math.max(0, Number(it.sellingPrice || 0));
    if (buyPrice <= 0 && sellingPrice <= 0) continue;

    const key = `${buyPrice}___${sellingPrice}`;
    if (!groups.has(key)) {
      groups.set(key, {
        variants: new Set<string>(),
        sizes: new Set<string>(),
        buyPrice,
        sellingPrice,
        mergedCount: 0,
      });
    }
    const g = groups.get(key)!;
    const v = String(it.variant || '').trim();
    const s = String(it.size || '').trim();
    if (v) g.variants.add(v);
    if (s) g.sizes.add(s);
    g.mergedCount += 1;
  }

  return Array.from(groups.values()).map((g) => ({
    variants: Array.from(g.variants),
    sizes: Array.from(g.sizes),
    buyPrice: g.buyPrice,
    sellingPrice: g.sellingPrice,
    mergedCount: g.mergedCount,
  }));
}

export function ManualPurchaseVariantItemsSelector({
  value,
  onChange,
  form = {},
  disabled = false,
}: ManualPurchaseVariantItemsSelectorProps) {
  const items: ManualPurchaseVariantItem[] = React.useMemo(() => {
    if (Array.isArray(value) && value.length > 0) return value;
    return [];
  }, [value]);

  const availableVariants = React.useMemo(() => {
    const fromForm = parseTags(form.newProductVariant || form.variant);
    const fromSelectedOpt = parseTags(
      form.productId_option?.raw?.variant || form.productId_option?.raw?.variation
    );
    return Array.from(new Set([...fromForm, ...fromSelectedOpt]));
  }, [form.newProductVariant, form.variant, form.productId_option]);

  const availableSizes = React.useMemo(() => {
    const fromForm = parseTags(form.newProductSize || form.size);
    const fromSelectedOpt = parseTags(form.productId_option?.raw?.size);
    return Array.from(new Set([...fromForm, ...fromSelectedOpt]));
  }, [form.newProductSize, form.size, form.productId_option]);

  const defaultBuyPrice = Number(
    form.newProductBuyPrice ??
      form.unitBuyPrice ??
      form.productId_option?.raw?.buy_price ??
      form.productId_option?.raw?.buyPrice ??
      0
  );
  const defaultSellingPrice = Number(
    form.newProductSellingPrice ??
      form.productId_option?.raw?.selling_price ??
      form.productId_option?.raw?.sellingPrice ??
      0
  );

  // Initialize with 1 row if empty so user can immediately input
  React.useEffect(() => {
    if (!Array.isArray(value) || value.length === 0) {
      onChange([
        {
          variant: availableVariants[0] || '',
          size: availableSizes[0] || '',
          quantity: 1,
          buyPrice: defaultBuyPrice || 0,
          sellingPrice: defaultSellingPrice || 0,
        },
      ]);
    }
  }, []);

  const handleAddItem = () => {
    if (disabled) return;
    const lastItem = items[items.length - 1];
    const next: ManualPurchaseVariantItem[] = [
      ...items,
      {
        variant: '',
        size: '',
        quantity: 1,
        buyPrice: lastItem ? lastItem.buyPrice : defaultBuyPrice || 0,
        sellingPrice: lastItem ? lastItem.sellingPrice : defaultSellingPrice || 0,
      },
    ];
    onChange(next);
  };

  const handleUpdateItem = (
    index: number,
    patch: Partial<ManualPurchaseVariantItem>
  ) => {
    if (disabled) return;
    const next = items.map((item, idx) =>
      idx === index ? { ...item, ...patch } : item
    );
    onChange(next);
  };

  const handleRemoveItem = (index: number) => {
    if (disabled || items.length <= 1) return;
    const next = items.filter((_, idx) => idx !== index);
    onChange(next);
  };

  const groupedRules = React.useMemo(
    () => buildGroupedVariantRulesFromItems(items),
    [items]
  );

  const totalQty = React.useMemo(
    () => items.reduce((sum, it) => sum + Math.max(1, Number(it.quantity || 1)), 0),
    [items]
  );

  const totalActualCost = React.useMemo(
    () =>
      items.reduce(
        (sum, it) =>
          sum + Math.max(1, Number(it.quantity || 1)) * Math.max(0, Number(it.buyPrice || 0)),
        0
      ),
    [items]
  );

  return (
    <div className="space-y-4 rounded-2xl border border-brand-200 bg-brand-50/30 p-4">
      {/* 1. Variant & Size Items Input (Styled like Custom Price per Variant & Size) */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-100 pb-2">
          <div>
            <div className="flex items-center gap-1.5">
              <Tag size={15} className="text-cherry-600" />
              <span className="text-xs font-black text-brand-900">
                Custom Price &amp; Qty per Variant &amp; Size
              </span>
            </div>
            <p className="text-[11px] text-brand-500">
              Add 1 or more variant &amp; size items with specific qty, unit modal, and selling price.
              Saved as 1 product with automatic price rules.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddItem}
            disabled={disabled}
            className="inline-flex items-center gap-1 rounded-xl bg-cherry-600 px-2.5 py-1 text-xs font-bold text-white shadow-xs hover:bg-cherry-700 disabled:opacity-50 transition cursor-pointer"
          >
            <Plus size={14} /> Add Variant / Size Item
          </button>
        </div>

        <div className="space-y-3">
          {items.map((item, idx) => {
            const qty = Math.max(1, Number(item.quantity || 1));
            const buyPrice = Math.max(0, Number(item.buyPrice || 0));
            const sellingPrice = Math.max(0, Number(item.sellingPrice || 0));
            const rowModalTotal = qty * buyPrice;

            return (
              <div
                key={`mp-item-${idx}`}
                className="rounded-xl border border-brand-200 bg-white p-3 shadow-2xs space-y-2.5"
              >
                <div className="flex items-center justify-between border-b border-brand-100/70 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black uppercase text-brand-700 tracking-wider">
                      Item #{idx + 1}
                    </span>
                    {(item.variant || item.size) && (
                      <span className="rounded-md bg-brand-100 px-2 py-0.5 text-[10px] font-bold text-brand-700">
                        {[item.variant, item.size ? `Size: ${item.size}` : '']
                          .filter(Boolean)
                          .join(' • ')}
                      </span>
                    )}
                  </div>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      disabled={disabled}
                      className="text-brand-400 hover:text-rose-600 transition p-1 cursor-pointer"
                      title="Remove item"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                {/* Variant Selection Pills + Input */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase text-brand-500">
                        Variant (Color / Pattern)
                      </span>
                      {item.variant && (
                        <button
                          type="button"
                          onClick={() => handleUpdateItem(idx, { variant: '' })}
                          className="text-[10px] text-brand-400 hover:underline cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    {availableVariants.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-1.5">
                        {availableVariants.map((v) => {
                          const isSelected =
                            item.variant.trim().toLowerCase() === v.trim().toLowerCase();
                          return (
                            <button
                              key={v}
                              type="button"
                              onClick={() =>
                                handleUpdateItem(idx, {
                                  variant: isSelected ? '' : v,
                                })
                              }
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition border cursor-pointer ${
                                isSelected
                                  ? 'bg-cherry-600 text-white border-cherry-600 shadow-2xs'
                                  : 'bg-brand-50/70 text-brand-700 border-brand-200 hover:bg-brand-100'
                              }`}
                            >
                              {v}
                            </button>
                          );
                        })}
                      </div>
                    )}
                    <input
                      type="text"
                      className="input !py-1.5 text-xs"
                      value={item.variant}
                      disabled={disabled}
                      onChange={(e) => handleUpdateItem(idx, { variant: e.target.value })}
                      placeholder={
                        availableVariants.length > 0
                          ? 'Or type custom variant...'
                          : 'e.g. White, Black, Pink'
                      }
                    />
                  </div>

                  {/* Size Selection Pills + Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase text-brand-500">
                        Size
                      </span>
                      {item.size && (
                        <button
                          type="button"
                          onClick={() => handleUpdateItem(idx, { size: '' })}
                          className="text-[10px] text-brand-400 hover:underline cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    {availableSizes.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-1.5">
                        {availableSizes.map((s) => {
                          const isSelected =
                            item.size.trim().toLowerCase() === s.trim().toLowerCase();
                          return (
                            <button
                              key={s}
                              type="button"
                              onClick={() =>
                                handleUpdateItem(idx, {
                                  size: isSelected ? '' : s,
                                })
                              }
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition border cursor-pointer ${
                                isSelected
                                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                                  : 'bg-brand-50/70 text-brand-700 border-brand-200 hover:bg-brand-100'
                              }`}
                            >
                              {s}
                            </button>
                          );
                        })}
                      </div>
                    )}
                    <input
                      type="text"
                      className="input !py-1.5 text-xs"
                      value={item.size}
                      disabled={disabled}
                      onChange={(e) => handleUpdateItem(idx, { size: e.target.value })}
                      placeholder={
                        availableSizes.length > 0
                          ? 'Or type custom size...'
                          : 'e.g. S, M, L, XL, All Size'
                      }
                    />
                  </div>
                </div>

                {/* Qty, Unit Actual Price / Modal, and Customer Selling Price */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-brand-100/70">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-brand-500 block mb-0.5">
                      Purchased Qty (pcs) <span className="text-cherry-600">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      disabled={disabled}
                      className="input !py-1.5 font-black text-brand-900"
                      value={item.quantity}
                      onChange={(e) =>
                        handleUpdateItem(idx, {
                          quantity: Math.max(1, Number(e.target.value || 1)),
                        })
                      }
                      placeholder="1"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-brand-500 block mb-0.5">
                      Unit Actual / Modal (IDR) <span className="text-cherry-600">*</span>
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-xs font-bold text-slate-400">
                        Rp.
                      </span>
                      <input
                        type="text"
                        disabled={disabled}
                        className="input !py-1.5 !pl-9 font-bold text-brand-800"
                        value={formatCurrency(item.buyPrice)}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\./g, '');
                          if (raw && !/^\d+$/.test(raw)) return;
                          handleUpdateItem(idx, {
                            buyPrice: raw ? parseInt(raw, 10) : 0,
                          });
                        }}
                        placeholder="e.g. 100.000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-brand-500 block mb-0.5">
                      Customer Selling Price (IDR) <span className="text-cherry-600">*</span>
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-xs font-bold text-slate-400">
                        Rp.
                      </span>
                      <input
                        type="text"
                        disabled={disabled}
                        className="input !py-1.5 !pl-9 font-bold text-cherry-700"
                        value={formatCurrency(item.sellingPrice)}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\./g, '');
                          if (raw && !/^\d+$/.test(raw)) return;
                          handleUpdateItem(idx, {
                            sellingPrice: raw ? parseInt(raw, 10) : 0,
                          });
                        }}
                        placeholder="e.g. 150.000"
                      />
                    </div>
                  </div>
                </div>

                {/* Row subtotal bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-brand-50/60 px-2.5 py-1.5 text-[11px] text-brand-600">
                  <span>
                    Row Modal Subtotal ({qty} pcs &times; {money(buyPrice)}):{' '}
                    <strong className="text-brand-900">{money(rowModalTotal)}</strong>
                  </span>
                  <span>
                    Selling Price:{' '}
                    <strong className="text-cherry-700">{money(sellingPrice)} / pc</strong>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Bar across all rows */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-indigo-200/80 bg-indigo-50/50 px-3.5 py-2.5 text-xs">
          <div className="font-bold text-indigo-950">
            Total Purchased Stock:{' '}
            <span className="font-black text-indigo-700">{totalQty} pcs</span> across{' '}
            {items.length} variant/size item(s)
          </div>
          <div className="font-bold text-indigo-950">
            Total Actual Cost / Modal:{' '}
            <span className="font-black text-emerald-700">{money(totalActualCost)}</span>
          </div>
        </div>
      </div>

      {/* 2. Preview of Auto-Grouped Custom Price Rules on the single Product */}
      {groupedRules.length > 0 && (
        <div className="space-y-2.5 pt-3 border-t border-brand-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Layers size={14} className="text-indigo-600" />
              <span className="text-xs font-black text-brand-900">
                Auto-Grouped Custom Price Rules ({groupedRules.length} Rule
                {groupedRules.length > 1 ? 's' : ''})
              </span>
            </div>
            <span className="text-[10px] font-semibold text-brand-500">
              Same buy &amp; selling price = 1 rule • Different price = separate rule
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {groupedRules.map((rule, rIdx) => (
              <div
                key={`grouped-rule-${rIdx}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-brand-200/80 bg-white px-3 py-2 text-xs shadow-2xs"
              >
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="rounded bg-brand-100 px-1.5 py-0.5 text-[10px] font-black uppercase text-brand-800">
                    Rule #{rIdx + 1}
                  </span>
                  {rule.variants.length > 0 ? (
                    rule.variants.map((v) => (
                      <span
                        key={v}
                        className="rounded-md bg-cherry-50 border border-cherry-200 px-2 py-0.5 text-[11px] font-bold text-cherry-700"
                      >
                        {v}
                      </span>
                    ))
                  ) : (
                    <span className="text-[11px] text-brand-400 italic">All Variants</span>
                  )}
                  {rule.sizes.length > 0 ? (
                    rule.sizes.map((s) => (
                      <span
                        key={s}
                        className="rounded-md bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[11px] font-bold text-indigo-700"
                      >
                        Size: {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-[11px] text-brand-400 italic">All Sizes</span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-[11px]">
                  <span className="text-brand-600">
                    Modal: <strong className="text-brand-900">{money(rule.buyPrice || 0)}</strong>
                  </span>
                  <span className="text-brand-600">
                    Sell: <strong className="text-cherry-700">{money(rule.sellingPrice)}</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

