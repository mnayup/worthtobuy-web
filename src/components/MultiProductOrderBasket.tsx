import React, { useState } from 'react';
import { Plus, Trash2, ShoppingBag, Sparkles } from 'lucide-react';
import { SearchableSelect } from './SearchableSelect';
import { OrderVariantQuantitySelector, type VariantQuantityItem } from './OrderVariantQuantitySelector';
import { MultiImageUploadInput } from './MultiImageUploadInput';
import { loadProducts } from '~/routes/__post-auth+/operations+/orders+/helpers/order-options.helper';
import { productCategoryOptions } from '~/routes/__post-auth+/operations+/orders+/helpers/order-form-fields.helper';
import { parseProductPriceRules, findMatchingVariantPrice } from '~/lib/pricing-rules';
import { money } from '~/lib/format';
import type { Option } from '~/types';

const formatCurrency = (val: any) =>
  val != null && val !== '' ? String(val).replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '';

export interface ProductBasketEntry {
  id: string;
  productId: string | number;
  productOption?: Option | null;
  unitPriceForeign: number;
  variantItems: VariantQuantityItem[];
  // New Product attributes if productId === '__NEW_PRODUCT__'
  newProductName?: string;
  newProductBrand?: string;
  newProductCategory?: string;
  newProductStoreLocation?: string;
  newProductBuyPrice?: number;
  newProductNotes?: string;
  newProductImageUrls?: string[];
}

interface MultiProductOrderBasketProps {
  value?: ProductBasketEntry[];
  onChange: (entries: ProductBasketEntry[]) => void;
  form: Record<string, any>;
  setFormValue?: (field: string, value: any) => void;
  disabled?: boolean;
}

export function MultiProductOrderBasket({
  value,
  onChange,
  form,
  setFormValue,
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
                  if (val === '__NEW_PRODUCT__') {
                    updateEntry(index, {
                      productId: '__NEW_PRODUCT__',
                      productOption: opt || { value: '__NEW_PRODUCT__', label: '+ Create / Add New Product' },
                      unitPriceForeign: entry.unitPriceForeign || 0,
                      variantItems: entry.variantItems?.length > 0 ? entry.variantItems : [
                        { variant: '', size: '', quantity: 1, price: 0 },
                      ],
                    });
                    return;
                  }
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

            {/* Inline New Product Form if creating new product */}
            {entry.productId === '__NEW_PRODUCT__' && (
              <div className="rounded-xl border border-amber-200/90 bg-amber-50/40 p-3.5 space-y-3.5 transition-all animate-fadeIn">
                <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-900 border-b border-amber-200/60 pb-2">
                  <Sparkles size={14} className="text-amber-600" />
                  <span>New Product Information</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="label !mb-1 text-xs">
                      Product Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      disabled={disabled}
                      required
                      className="input !text-xs !py-1.5"
                      placeholder="e.g. Pop Mart Labubu, Coach Tabby Bag"
                      value={entry.newProductName || ''}
                      onChange={(e) => updateEntry(index, { newProductName: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="label !mb-1 text-xs">Brand Name</label>
                    <input
                      type="text"
                      disabled={disabled}
                      className="input !text-xs !py-1.5"
                      placeholder="e.g. Pop Mart, Coach, Nike, Gentle Monster"
                      value={entry.newProductBrand || ''}
                      onChange={(e) => updateEntry(index, { newProductBrand: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="label !mb-1 text-xs">Category</label>
                    <SearchableSelect
                      name={`category_${entry.id}`}
                      value={entry.newProductCategory || ''}
                      options={productCategoryOptions}
                      allowCustom={true}
                      disabled={disabled}
                      placeholder="Select category or type custom..."
                      onChange={(val) => updateEntry(index, { newProductCategory: String(val || '') })}
                    />
                  </div>

                  <div>
                    <label className="label !mb-1 text-xs">Store Location / Tenant</label>
                    <input
                      type="text"
                      disabled={disabled}
                      className="input !text-xs !py-1.5"
                      placeholder="e.g. Takashimaya Shinjuku, Mega Don Quijote"
                      value={entry.newProductStoreLocation || ''}
                      onChange={(e) => updateEntry(index, { newProductStoreLocation: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="label !mb-1 text-xs">Store Buy Price / Modal (IDR)</label>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-xs font-bold text-slate-400">
                        Rp
                      </span>
                      <input
                        type="text"
                        disabled={disabled}
                        className="input !text-xs !py-1.5 !pl-8"
                        placeholder="Store cost to purchase"
                        value={formatCurrency(entry.newProductBuyPrice)}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\./g, '');
                          if (raw && !/^\d+$/.test(raw)) return;
                          updateEntry(index, { newProductBuyPrice: raw ? parseInt(raw, 10) : 0 });
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label !mb-1 text-xs">Customer Selling Price / Unit (IDR)</label>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-xs font-bold text-slate-400">
                        Rp
                      </span>
                      <input
                        type="text"
                        disabled={disabled}
                        className="input !text-xs !py-1.5 !pl-8"
                        placeholder="Price billed to customer"
                        value={formatCurrency(entry.unitPriceForeign)}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\./g, '');
                          if (raw && !/^\d+$/.test(raw)) return;
                          const val = raw ? parseInt(raw, 10) : 0;
                          const updatedVariants = (entry.variantItems || []).map((vi) => ({
                            ...vi,
                            price: vi.price === 0 || vi.price === entry.unitPriceForeign ? val : vi.price,
                          }));
                          updateEntry(index, { unitPriceForeign: val, variantItems: updatedVariants });
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="label !mb-1 text-xs">Product Photos</label>
                  <MultiImageUploadInput
                    value={entry.newProductImageUrls || []}
                    entityType="products"
                    disabled={disabled}
                    onChange={(urls) => updateEntry(index, { newProductImageUrls: urls })}
                  />
                </div>

                <div>
                  <label className="label !mb-1 text-xs">Product Notes</label>
                  <textarea
                    rows={2}
                    disabled={disabled}
                    className="input !text-xs !py-1.5 resize-y"
                    placeholder="Special instructions or general notes for this product..."
                    value={entry.newProductNotes || ''}
                    onChange={(e) => updateEntry(index, { newProductNotes: e.target.value })}
                  />
                </div>
              </div>
            )}

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

