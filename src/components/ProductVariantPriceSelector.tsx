import React from 'react';
import { Plus, Trash2, Tag, Sparkles } from 'lucide-react';
import { money } from '~/lib/format';
import {
  type VariantPriceRule,
  type BundlePriceRule,
  type ProductPriceRules,
  parseProductPriceRules,
} from '~/lib/pricing-rules';

export type { VariantPriceRule, BundlePriceRule, ProductPriceRules };

interface ProductVariantPriceSelectorProps {
  value?: ProductPriceRules | VariantPriceRule[];
  onChange: (val: ProductPriceRules) => void;
  form?: Record<string, any>;
  disabled?: boolean;
}

export function ProductVariantPriceSelector({
  value,
  onChange,
  form = {},
  disabled = false,
}: ProductVariantPriceSelectorProps) {
  // Normalize incoming value
  const normalizedValue: ProductPriceRules = React.useMemo(() => {
    return parseProductPriceRules(value);
  }, [value]);

  const variantRules = normalizedValue.variantRules || [];
  const bundleRules = normalizedValue.bundleRules || [];

  // Parse available tags from variant and size fields
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

  const availableVariants = React.useMemo(
    () => parseTags(form.variant || form.variation),
    [form.variant, form.variation]
  );
  const availableSizes = React.useMemo(
    () => parseTags(form.size),
    [form.size]
  );

  const defaultBuyPrice = Number(form.buy_price ?? form.buyPrice ?? 0);
  const defaultSellingPrice = Number(form.selling_price ?? form.sellingPrice ?? 0);

  // Variant rule helpers
  const handleAddVariantRule = () => {
    if (disabled) return;
    const next: VariantPriceRule[] = [
      ...variantRules,
      {
        variants: [],
        sizes: [],
        buyPrice: defaultBuyPrice || undefined,
        sellingPrice: defaultSellingPrice || 0,
      },
    ];
    onChange({ ...normalizedValue, variantRules: next });
  };

  const handleUpdateVariantRule = (
    index: number,
    patch: Partial<VariantPriceRule>
  ) => {
    if (disabled) return;
    const next = variantRules.map((rule, idx) =>
      idx === index ? { ...rule, ...patch } : rule
    );
    onChange({ ...normalizedValue, variantRules: next });
  };

  const handleRemoveVariantRule = (index: number) => {
    if (disabled) return;
    const next = variantRules.filter((_, idx) => idx !== index);
    onChange({ ...normalizedValue, variantRules: next });
  };

  const handleToggleVariantInRule = (ruleIndex: number, variantName: string) => {
    const current = variantRules[ruleIndex]?.variants || [];
    const exists = current.includes(variantName);
    const updated = exists
      ? current.filter((v) => v !== variantName)
      : [...current, variantName];
    handleUpdateVariantRule(ruleIndex, { variants: updated });
  };

  const handleToggleSizeInRule = (ruleIndex: number, sizeName: string) => {
    const current = variantRules[ruleIndex]?.sizes || [];
    const exists = current.includes(sizeName);
    const updated = exists
      ? current.filter((s) => s !== sizeName)
      : [...current, sizeName];
    handleUpdateVariantRule(ruleIndex, { sizes: updated });
  };

  // Bundle rule helpers
  const handleAddBundleRule = () => {
    if (disabled) return;
    const next: BundlePriceRule[] = [
      ...bundleRules,
      {
        name: `Bundle ${bundleRules.length + 1}`,
        minQty: 3,
        bundlePrice: defaultSellingPrice ? defaultSellingPrice * 3 : 0,
        note: '',
      },
    ];
    onChange({ ...normalizedValue, bundleRules: next });
  };

  const handleUpdateBundleRule = (
    index: number,
    patch: Partial<BundlePriceRule>
  ) => {
    if (disabled) return;
    const next = bundleRules.map((rule, idx) =>
      idx === index ? { ...rule, ...patch } : rule
    );
    onChange({ ...normalizedValue, bundleRules: next });
  };

  const handleRemoveBundleRule = (index: number) => {
    if (disabled) return;
    const next = bundleRules.filter((_, idx) => idx !== index);
    onChange({ ...normalizedValue, bundleRules: next });
  };

  return (
    <div className="space-y-4 rounded-2xl border border-brand-200 bg-brand-50/30 p-4">
      {/* 1. Variant & Size Custom Pricing */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-100 pb-2">
          <div>
            <div className="flex items-center gap-1.5">
              <Tag size={15} className="text-cherry-600" />
              <span className="text-xs font-black text-brand-900">
                Custom Price per Variant & Size
              </span>
            </div>
            <p className="text-[11px] text-brand-500">
              Set specific selling prices for groups of variants & sizes. Unmatched options use the base selling price.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddVariantRule}
            disabled={disabled}
            className="inline-flex items-center gap-1 rounded-xl bg-cherry-600 px-2.5 py-1 text-xs font-bold text-white shadow-xs hover:bg-cherry-700 disabled:opacity-50 transition cursor-pointer"
          >
            <Plus size={14} /> Add Price Rule
          </button>
        </div>

        {variantRules.length === 0 ? (
          <div className="rounded-xl border border-dashed border-brand-200 bg-white/70 py-3.5 text-center text-xs text-brand-400">
            No custom variant rules. All variants & sizes will use base price{' '}
            <strong className="text-brand-700">{money(defaultSellingPrice)}</strong>.
          </div>
        ) : (
          <div className="space-y-3">
            {variantRules.map((rule, ruleIdx) => {
              const ruleVariants = rule.variants || [];
              const ruleSizes = rule.sizes || [];

              return (
                <div
                  key={`vrule-${ruleIdx}`}
                  className="rounded-xl border border-brand-200 bg-white p-3 shadow-2xs space-y-2.5"
                >
                  <div className="flex items-center justify-between border-b border-brand-100/70 pb-2">
                    <span className="text-[11px] font-black uppercase text-brand-700 tracking-wider">
                      Rule #{ruleIdx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveVariantRule(ruleIdx)}
                      disabled={disabled}
                      className="text-brand-400 hover:text-rose-600 transition p-1 cursor-pointer"
                      title="Remove rule"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Multi-select Variant Pills */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase text-brand-500">
                        Select Variants (Color / Pattern)
                      </span>
                      {availableVariants.length > 0 && (
                        <div className="flex items-center gap-1.5 text-[10px]">
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateVariantRule(ruleIdx, {
                                variants: [...availableVariants],
                              })
                            }
                            className="text-cherry-600 hover:underline font-semibold cursor-pointer"
                          >
                            Select All
                          </button>
                          <span>•</span>
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateVariantRule(ruleIdx, { variants: [] })
                            }
                            className="text-brand-400 hover:underline cursor-pointer"
                          >
                            Clear
                          </button>
                        </div>
                      )}
                    </div>
                    {availableVariants.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {availableVariants.map((v) => {
                          const isSelected = ruleVariants.includes(v);
                          return (
                            <button
                              key={v}
                              type="button"
                              onClick={() => handleToggleVariantInRule(ruleIdx, v)}
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
                    ) : (
                      <p className="text-[11px] text-brand-400 italic">
                        Type variants in the &quot;Variant&quot; field above to select here.
                      </p>
                    )}
                  </div>

                  {/* Multi-select Size Pills */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase text-brand-500">
                        Select Sizes
                      </span>
                      {availableSizes.length > 0 && (
                        <div className="flex items-center gap-1.5 text-[10px]">
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateVariantRule(ruleIdx, {
                                sizes: [...availableSizes],
                              })
                            }
                            className="text-indigo-600 hover:underline font-semibold cursor-pointer"
                          >
                            Select All
                          </button>
                          <span>•</span>
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateVariantRule(ruleIdx, { sizes: [] })
                            }
                            className="text-brand-400 hover:underline cursor-pointer"
                          >
                            Clear
                          </button>
                        </div>
                      )}
                    </div>
                    {availableSizes.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {availableSizes.map((s) => {
                          const isSelected = ruleSizes.includes(s);
                          return (
                            <button
                              key={s}
                              type="button"
                              onClick={() => handleToggleSizeInRule(ruleIdx, s)}
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
                    ) : (
                      <p className="text-[11px] text-brand-400 italic">
                        Type sizes in the &quot;Size&quot; field above to select here.
                      </p>
                    )}
                  </div>

                  {/* Prices for this rule */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-brand-100/70">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-brand-500 block mb-0.5">
                        Selling Price (IDR) <span className="text-cherry-600">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        className="input !py-1.5 font-bold text-cherry-700"
                        value={rule.sellingPrice}
                        onChange={(e) =>
                          handleUpdateVariantRule(ruleIdx, {
                            sellingPrice: Math.max(0, Number(e.target.value || 0)),
                          })
                        }
                        placeholder="e.g. 150000"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-brand-500 block mb-0.5">
                        Buy Price (Optional)
                      </label>
                      <input
                        type="number"
                        min="0"
                        className="input !py-1.5 font-medium text-brand-700"
                        value={rule.buyPrice ?? ''}
                        onChange={(e) =>
                          handleUpdateVariantRule(ruleIdx, {
                            buyPrice: e.target.value ? Math.max(0, Number(e.target.value)) : undefined,
                          })
                        }
                        placeholder="e.g. 100000"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Bundle / Mix & Match Pricing */}
      <div className="space-y-3 pt-3 border-t border-brand-200">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-100 pb-2">
          <div>
            <div className="flex items-center gap-1.5">
              <Sparkles size={15} className="text-amber-600" />
              <span className="text-xs font-black text-brand-900">
                Bundle / Tiered Pricing Deals
              </span>
            </div>
            <p className="text-[11px] text-brand-500">
              Define promo package bundles (e.g. Buy 3 pcs of any variant/size for Rp 3.000).
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddBundleRule}
            disabled={disabled}
            className="inline-flex items-center gap-1 rounded-xl bg-amber-600 px-2.5 py-1 text-xs font-bold text-white shadow-xs hover:bg-amber-700 disabled:opacity-50 transition cursor-pointer"
          >
            <Plus size={14} /> Add Bundle Deal
          </button>
        </div>

        {bundleRules.length === 0 ? (
          <div className="rounded-xl border border-dashed border-brand-200 bg-white/70 py-3.5 text-center text-xs text-brand-400">
            No bundle deals defined. Orders will be priced per piece.
          </div>
        ) : (
          <div className="space-y-2.5">
            {bundleRules.map((bRule, bIdx) => {
              const unitEquivalent =
                bRule.minQty > 0 ? Math.round(bRule.bundlePrice / bRule.minQty) : 0;

              return (
                <div
                  key={`brule-${bIdx}`}
                  className="rounded-xl border border-amber-200/80 bg-amber-50/20 p-3 shadow-2xs space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase text-amber-800 tracking-wider">
                      Bundle Deal #{bIdx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveBundleRule(bIdx)}
                      disabled={disabled}
                      className="text-brand-400 hover:text-rose-600 transition p-1 cursor-pointer"
                      title="Remove bundle"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-brand-600 block mb-0.5">
                        Bundle Name / Label
                      </label>
                      <input
                        type="text"
                        className="input !py-1 text-xs"
                        value={bRule.name || ''}
                        onChange={(e) =>
                          handleUpdateBundleRule(bIdx, { name: e.target.value })
                        }
                        placeholder="e.g. Bundle of 3"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-brand-600 block mb-0.5">
                        Quantity (pcs)
                      </label>
                      <input
                        type="number"
                        min="2"
                        className="input !py-1 text-xs font-bold text-brand-900"
                        value={bRule.minQty}
                        onChange={(e) =>
                          handleUpdateBundleRule(bIdx, {
                            minQty: Math.max(1, Number(e.target.value || 1)),
                          })
                        }
                        placeholder="3"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-brand-600 block mb-0.5">
                        Total Bundle Price (IDR)
                      </label>
                      <input
                        type="number"
                        min="0"
                        className="input !py-1 text-xs font-bold text-amber-700"
                        value={bRule.bundlePrice}
                        onChange={(e) =>
                          handleUpdateBundleRule(bIdx, {
                            bundlePrice: Math.max(0, Number(e.target.value || 0)),
                          })
                        }
                        placeholder="e.g. 3000"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-amber-800 bg-white/70 px-2.5 py-1 rounded-lg border border-amber-200/50">
                    <span>
                      Equivalent unit rate:{' '}
                      <strong className="text-amber-900">{money(unitEquivalent)} / pc</strong>
                    </span>
                    <span className="text-[10px] text-brand-400">
                      Eligible for mix & match variants/sizes
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
