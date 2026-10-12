import { Crown, Check, X, AlertCircle } from 'lucide-react';
import { money } from '~/lib/format';
import type { PurchaseItem, ItemChecklistState } from '../types';

export type { ItemChecklistState };

interface PurchaseItemChecklistRowProps {
  item: PurchaseItem;
  state: ItemChecklistState;
  onChange: (patch: Partial<ItemChecklistState>) => void;
}

export function PurchaseItemChecklistRow({
  item,
  state,
  onChange,
}: PurchaseItemChecklistRowProps) {
  const isEligible = Boolean(item.is_eligible_to_buy);
  const isPurchased = state.status === 'PURCHASED';
  const isUnavailable = state.status === 'UNAVAILABLE';
  const isVip = Boolean(item.is_priority_customer);

  return (
    <div
      className={
        'rounded-2xl border p-4 transition shadow-xs space-y-3 ' +
        (isUnavailable
          ? 'border-rose-200 bg-rose-50/30'
          : isPurchased
            ? 'border-emerald-200 bg-emerald-50/20'
            : isEligible
              ? 'border-brand-200 bg-white'
              : 'border-amber-200 bg-amber-50/25')
      }
    >
      {/* Customer & Order Header */}
      <div
        className={
          'flex flex-wrap items-center justify-between gap-2 ' +
          'border-b border-brand-100/70 pb-2.5'
        }
      >
        <div className="flex items-center gap-2">
          <span className="font-black text-brand-900 text-sm">
            {item.customer_name}
          </span>
          {isVip && (
            <span
              className={
                'inline-flex items-center gap-1 rounded-md bg-amber-100 ' +
                'px-2 py-0.5 text-[10px] font-black text-amber-800 uppercase'
              }
            >
              <Crown size={11} className="text-amber-600" />
              VIP
            </span>
          )}
          <span className="text-xs text-brand-400 font-mono">
            ({item.order_number})
          </span>
        </div>

        <div className="flex items-center gap-2">
          {item.has_paid_dp ? (
            <span
              className={
                'text-[11px] font-bold text-emerald-700 bg-emerald-50 ' +
                'px-2 py-0.5 rounded-lg border border-emerald-200'
              }
            >
              ✓ DP Verified
            </span>
          ) : isVip ? (
            <span
              className={
                'text-[11px] font-bold text-indigo-700 bg-indigo-50 ' +
                'px-2 py-0.5 rounded-lg border border-indigo-200'
              }
            >
              ★ VIP No-DP Allowed
            </span>
          ) : (
            <span
              className={
                'text-[11px] font-bold text-amber-700 bg-amber-100 ' +
                'px-2 py-0.5 rounded-lg border border-amber-300 flex items-center gap-1'
              }
            >
              <AlertCircle size={12} />
              Awaiting DP
            </span>
          )}
        </div>
      </div>

      {/* Product & Spec Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <div className="font-bold text-brand-900 text-sm">
            {item.product_name}
          </div>
          <div className="flex flex-wrap items-center gap-1.5 mt-1">
            {item.brand_name && (
              <span className="rounded bg-brand-100/80 px-1.5 py-0.5 text-[11px] font-semibold">
                {item.brand_name}
              </span>
            )}
            {item.variation && (
              <span
                className={
                  'rounded bg-indigo-50 px-1.5 py-0.5 ' +
                  'text-[11px] font-semibold text-indigo-700'
                }
              >
                Var: {item.variation}
              </span>
            )}
            {item.size && (
              <span
                className={
                  'rounded bg-indigo-50 px-1.5 py-0.5 ' +
                  'text-[11px] font-semibold text-indigo-700'
                }
              >
                Size: {item.size}
              </span>
            )}
            {item.color && (
              <span
                className={
                  'rounded bg-indigo-50 px-1.5 py-0.5 ' +
                  'text-[11px] font-semibold text-indigo-700'
                }
              >
                Color: {item.color}
              </span>
            )}
          </div>
        </div>

        <div className="flex sm:justify-end items-center gap-4 text-brand-600">
          <div>
            <span className="text-[10px] uppercase text-brand-400 font-bold block">
              Target Qty
            </span>
            <span className="font-black text-brand-900 text-sm">
              {item.quantity} pcs
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase text-brand-400 font-bold block">
              Est. Unit
            </span>
            <span className="font-bold text-brand-700 text-xs">
              {money(state.estimated_unit_price)}
            </span>
          </div>
        </div>
      </div>

      {/* Actual Price & Allocation Controls */}
      <div
        className={
          'flex flex-wrap items-end justify-between gap-3 pt-2 ' +
          'border-t border-brand-100/70 bg-brand-50/30 p-2.5 rounded-xl'
        }
      >
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="text-[10px] font-bold uppercase text-brand-500 block mb-1">
              Actual Unit Price (IDR)
            </label>
            <input
              type="number"
              className="input !py-1 !px-2.5 text-xs w-32 font-bold"
              value={state.actual_unit_price}
              onChange={(e) =>
                onChange({
                  actual_unit_price: Math.max(0, Number(e.target.value)),
                })
              }
              placeholder="Actual unit price"
            />
          </div>

          {isPurchased && item.quantity > 1 && (
            <div>
              <label className="text-[10px] font-bold uppercase text-brand-500 block mb-1">
                Allocated Qty (Bought)
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={0}
                  max={item.quantity}
                  className="input !py-1 !px-2 text-xs w-20 text-center font-bold"
                  value={state.allocated_qty}
                  onChange={(e) => {
                    const val = Math.min(
                      item.quantity,
                      Math.max(0, Number(e.target.value))
                    );
                    onChange({
                      allocated_qty: val,
                      status: val === 0 ? 'UNAVAILABLE' : 'PURCHASED',
                    });
                  }}
                />
                <span className="text-xs text-brand-400 font-medium">
                  / {item.quantity} pcs
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() =>
              onChange({
                status: 'PURCHASED',
                allocated_qty:
                  state.allocated_qty > 0
                    ? state.allocated_qty
                    : item.quantity,
              })
            }
            className={
              'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ' +
              'transition ' +
              (isPurchased
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white border border-brand-200 text-brand-600 hover:bg-emerald-50')
            }
          >
            <Check size={14} />
            Bought (Didapat)
          </button>

          <button
            type="button"
            onClick={() =>
              onChange({
                status: 'UNAVAILABLE',
                allocated_qty: 0,
              })
            }
            className={
              'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ' +
              'transition ' +
              (isUnavailable
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white border border-brand-200 text-brand-600 hover:bg-rose-50')
            }
          >
            <X size={14} />
            Reject (Tidak Dapat)
          </button>
        </div>
      </div>

      {isUnavailable && (
        <div
          className={
            'text-[11px] text-rose-700 bg-rose-50 p-2 rounded-lg ' +
            'flex items-center gap-1.5 font-medium'
          }
        >
          <AlertCircle size={13} className="shrink-0" />
          <span>
            Item unavailable at store. Customer's paid DP will automatically
            be queued for refund.
          </span>
        </div>
      )}
      {isPurchased && state.allocated_qty < item.quantity && (
        <div
          className={
            'text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg ' +
            'flex items-center gap-1.5 font-medium'
          }
        >
          <AlertCircle size={13} className="shrink-0" />
          <span>
            Shortage: {item.quantity - state.allocated_qty} pcs will be
            recorded as unavailable and refunded to customer.
          </span>
        </div>
      )}
    </div>
  );
}
