import React from 'react';
import { Target, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';

interface PurchaseTargetBarProps {
  targetEligibleQty: number;
  totalOrderedQty: number;
  actualBoughtQty: number;
  rejectedQty: number;
}

export function PurchaseTargetBar({
  targetEligibleQty,
  totalOrderedQty,
  actualBoughtQty,
  rejectedQty,
}: PurchaseTargetBarProps) {
  const ineligibleQty = Math.max(0, totalOrderedQty - targetEligibleQty);
  const shortage = Math.max(0, targetEligibleQty - actualBoughtQty);

  return (
    <div className="space-y-2.5">
      <div
        className={
          'grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-2xl ' +
          'bg-gradient-to-r from-brand-50/70 via-indigo-50/40 to-brand-50/50 ' +
          'border border-brand-200/80 shadow-xs'
        }
      >
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-100/80 text-indigo-700 shrink-0">
            <Target size={16} />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase text-brand-500">
              Target to Buy
            </div>
            <div className="text-base font-black text-brand-900">
              {targetEligibleQty}{' '}
              <span className="text-xs font-semibold text-brand-500">pcs</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-100/80 text-emerald-700 shrink-0">
            <CheckCircle2 size={16} />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase text-brand-500">
              Actual Bought
            </div>
            <div className="text-base font-black text-emerald-700">
              {actualBoughtQty}{' '}
              <span className="text-xs font-semibold text-emerald-600">pcs</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div
            className={
              'p-2 rounded-xl shrink-0 ' +
              (shortage > 0
                ? 'bg-amber-100/80 text-amber-700'
                : 'bg-brand-100/80 text-brand-500')
            }
          >
            <AlertTriangle size={16} />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase text-brand-500">
              Shortage
            </div>
            <div
              className={
                'text-base font-black ' +
                (shortage > 0 ? 'text-amber-700' : 'text-brand-500')
              }
            >
              {shortage}{' '}
              <span className="text-xs font-semibold text-brand-500">pcs</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div
            className={
              'p-2 rounded-xl shrink-0 ' +
              (rejectedQty > 0
                ? 'bg-rose-100/80 text-rose-700'
                : 'bg-brand-100/80 text-brand-500')
            }
          >
            <AlertCircle size={16} />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase text-brand-500">
              Rejected / Refund
            </div>
            <div
              className={
                'text-base font-black ' +
                (rejectedQty > 0 ? 'text-rose-700' : 'text-brand-500')
              }
            >
              {rejectedQty}{' '}
              <span className="text-xs font-semibold text-brand-500">pcs</span>
            </div>
          </div>
        </div>
      </div>

      {ineligibleQty > 0 && (
        <div
          className={
            'flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50/90 ' +
            'border border-amber-200 text-xs font-medium text-amber-800'
          }
        >
          <AlertCircle size={14} className="shrink-0 text-amber-600" />
          <span>
            <strong>{ineligibleQty} pcs excluded:</strong> Customer hasn't paid DP
            and is not Priority VIP. Only buy once DP is verified.
          </span>
        </div>
      )}

      {shortage > 0 && (
        <div
          className={
            'flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-50/90 ' +
            'border border-rose-200 text-xs font-medium text-rose-800'
          }
        >
          <AlertTriangle size={14} className="shrink-0 text-rose-600" />
          <span>
            <strong>Shortage detected ({shortage} pcs):</strong> Assign bought
            items to customers below. Unallocated items will be marked Unavailable
            and automatically queued for DP refund.
          </span>
        </div>
      )}
    </div>
  );
}
