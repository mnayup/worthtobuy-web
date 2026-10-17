import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

export interface AdditionalFeeItem {
  type: string; // 'Bulky / Handling' | 'Flashsale' | 'Other'
  customName?: string;
  amount: number;
}

const PRESET_FEE_TYPES = [
  'Bulky / Handling',
  'Flashsale',
  'Other',
];

interface AdditionalFeesSelectorProps {
  value?: AdditionalFeeItem[];
  onChange: (items: AdditionalFeeItem[]) => void;
  disabled?: boolean;
}

export function AdditionalFeesSelector({
  value,
  onChange,
  disabled,
}: AdditionalFeesSelectorProps) {
  const items: AdditionalFeeItem[] = Array.isArray(value) ? value : [];

  const handleAdd = () => {
    if (disabled) return;
    onChange([
      ...items,
      { type: 'Bulky / Handling', customName: '', amount: 0 },
    ]);
  };

  const handleRemove = (index: number) => {
    if (disabled) return;
    const next = [...items];
    next.splice(index, 1);
    onChange(next);
  };

  const handleUpdate = (index: number, partial: Partial<AdditionalFeeItem>) => {
    if (disabled) return;
    const next = items.map((item, i) => {
      if (i !== index) return item;
      const updated = { ...item, ...partial };
      if (updated.type !== 'Other') {
        updated.customName = '';
      }
      return updated;
    });
    onChange(next);
  };

  const total = items.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  return (
    <div className="space-y-3 rounded-2xl border border-brand-200 bg-brand-50/40 p-3.5">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-black text-brand-900">Additional Surcharges / Fees</span>
          <p className="text-[11px] text-brand-500">
            Add one or more extra fees (Bulky, Flashsale, or custom other).
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={disabled}
          className="inline-flex items-center gap-1 rounded-xl bg-cherry-600 px-2.5 py-1 text-xs font-bold text-white shadow-xs hover:bg-cherry-700 disabled:opacity-50 transition"
        >
          <Plus size={14} /> Add Fee
        </button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-brand-200 bg-white/70 py-4 text-center text-xs text-brand-400">
          No additional fees added yet. Click &quot;Add Fee&quot; to add one.
        </div>
      ) : (
        <div className="space-y-2.5">
          {items.map((item, idx) => {
            const isOther = item.type === 'Other';
            const displayType = PRESET_FEE_TYPES.includes(item.type) ? item.type : 'Other';

            return (
              <div
                key={idx}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 rounded-xl bg-white p-2.5 border border-brand-200/80 shadow-2xs"
              >
                <div className="w-full sm:w-44">
                  <select
                    className="input py-1.5 text-xs font-semibold"
                    disabled={disabled}
                    value={displayType}
                    onChange={(e) => {
                      const val = e.target.value;
                      handleUpdate(idx, {
                        type: val,
                        customName: val === 'Other' ? item.customName || '' : '',
                      });
                    }}
                  >
                    {PRESET_FEE_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                {isOther && (
                  <div className="w-full sm:flex-1">
                    <input
                      type="text"
                      className="input py-1.5 text-xs"
                      disabled={disabled}
                      placeholder="Enter custom fee name (e.g. Packing Kayu)..."
                      value={item.customName ?? ''}
                      onChange={(e) => handleUpdate(idx, { customName: e.target.value })}
                      required
                    />
                  </div>
                )}

                <div className="relative w-full sm:w-36">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-brand-400">
                    Rp
                  </span>
                  <input
                    type="text"
                    className="input pl-8 py-1.5 text-xs text-right font-black text-brand-900"
                    disabled={disabled}
                    placeholder="0"
                    value={
                      item.amount != null && item.amount !== 0
                        ? String(item.amount).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
                        : ''
                    }
                    onChange={(e) => {
                      const num = Number(e.target.value.replace(/\D/g, ''));
                      handleUpdate(idx, { amount: num });
                    }}
                  />
                </div>

                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => handleRemove(idx)}
                  className="inline-flex items-center justify-center rounded-xl p-2 text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition disabled:opacity-50"
                  title="Remove Fee"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}

          <div className="flex items-center justify-between border-t border-brand-200/60 pt-2 px-1 text-xs">
            <span className="font-bold text-brand-600">Total Additional Fees:</span>
            <span className="font-black text-brand-950">
              Rp {total.toLocaleString('id-ID')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
