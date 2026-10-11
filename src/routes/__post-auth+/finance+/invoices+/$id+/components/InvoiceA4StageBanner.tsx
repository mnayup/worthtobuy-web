import React from 'react';
import { date, money } from '~/lib/format';
import type { StageMode } from '../types';

interface InvoiceA4StageBannerProps {
  invoice: any;
  activeDisplayMode: StageMode;
  totalBill: number;
  paidAmount: number;
  outstandingAmount: number;
  dpAmount: number;
}

export function InvoiceA4StageBanner({
  invoice,
  activeDisplayMode,
  totalBill,
  paidAmount,
  outstandingAmount,
  dpAmount,
}: InvoiceA4StageBannerProps) {
  if (activeDisplayMode === 'DP') {
    return (
      <div
        className={
          'mt-3.5 rounded-xl border-2 border-amber-400 bg-amber-50/90 p-3 sm:p-3.5 ' +
          'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'
        }
      >
        <div className="flex items-start gap-3">
          <div
            className={
              'grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-amber-500 ' +
              'text-white font-black text-xs shadow-sm'
            }
          >
            DP
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-amber-950">
              Down Payment Bill (DP {invoice.dpPercent || 50}%)
            </p>
            <p className="text-[11px] text-amber-900 font-medium mt-0.5">
              Awaiting DP for shopping. Settle{' '}
              {invoice.dpSettlementNote || 'when ready to ship'}.
            </p>
          </div>
        </div>
        <div
          className={
            'text-left sm:text-right shrink-0 border-t sm:border-t-0 sm:border-l ' +
            'border-amber-300 pt-2 sm:pt-0 sm:pl-4'
          }
        >
          <p className="text-[9px] font-extrabold uppercase tracking-wider text-amber-800">
            Down Payment Due (Tagihan DP)
          </p>
          <p className="text-lg font-black text-amber-950 leading-tight">
            {money(dpAmount)}
          </p>
          <p className="text-[10px] font-bold text-amber-700">
            Remaining Later: {money(Math.max(0, totalBill - dpAmount))}
          </p>
        </div>
      </div>
    );
  }

  if (activeDisplayMode === 'SETTLEMENT') {
    return (
      <div
        className={
          'mt-3.5 rounded-xl border-2 border-cherry-400 bg-cherry-50/90 p-3 sm:p-3.5 ' +
          'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'
        }
      >
        <div className="flex items-start gap-3">
          <div
            className={
              'grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-cherry-600 ' +
              'text-white font-black text-xs shadow-sm'
            }
          >
            2
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-cherry-950">
              Order Settlement Bill
            </p>
            <p className="text-[11px] text-cherry-900 font-medium mt-0.5">
              Items ready. DP {money(paidAmount)} received. Settle balance to ship.
            </p>
          </div>
        </div>
        <div
          className={
            'text-left sm:text-right shrink-0 border-t sm:border-t-0 sm:border-l ' +
            'border-cherry-300 pt-2 sm:pt-0 sm:pl-4'
          }
        >
          <p className="text-[9px] font-extrabold uppercase tracking-wider text-cherry-800">
            Remaining Balance to Pay
          </p>
          <p className="text-lg font-black text-cherry-950 leading-tight">
            {money(outstandingAmount)}
          </p>
          <p className="text-[10px] font-bold text-cherry-700">
            Total Order: {money(totalBill)}
          </p>
        </div>
      </div>
    );
  }

  if (activeDisplayMode === 'PAID') {
    return (
      <div
        className={
          'mt-3.5 rounded-xl border-2 border-emerald-400 bg-emerald-50/90 p-3 sm:p-3.5 ' +
          'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'
        }
      >
        <div className="flex items-start gap-3">
          <div
            className={
              'grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-600 ' +
              'text-white font-black text-xs shadow-sm'
            }
          >
            ✓
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-emerald-950">
              Official Payment Receipt (Kuitansi Lunas)
            </p>
            <p className="text-[11px] text-emerald-900 font-medium mt-0.5">
              Order fully paid amounting to <strong>{money(paidAmount)}</strong>.
            </p>
          </div>
        </div>
        <div
          className={
            'text-left sm:text-right shrink-0 border-t sm:border-t-0 sm:border-l ' +
            'border-emerald-300 pt-2 sm:pt-0 sm:pl-4'
          }
        >
          <div
            className={
              'inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-0.5 ' +
              'text-xs font-black text-white shadow-sm'
            }
          >
            <span>✓</span> PAID
          </div>
          <p className="mt-0.5 text-[10px] font-bold text-emerald-800">
            Remaining: Rp 0
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={
        'mt-3.5 rounded-xl border-2 border-brand-300 bg-brand-50/80 p-3 sm:p-3.5 ' +
        'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'
      }
    >
      <div className="flex items-start gap-3">
        <div
          className={
            'grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-900 ' +
            'text-white font-black text-xs shadow-sm'
          }
        >
          1
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-brand-950">
            Full Payment Bill (100% Upfront)
          </p>
          <p className="text-[11px] text-brand-700 font-medium mt-0.5">
            Please transfer full payment so order can be processed.
          </p>
        </div>
      </div>
      <div
        className={
          'text-left sm:text-right shrink-0 border-t sm:border-t-0 sm:border-l ' +
          'border-brand-200 pt-2 sm:pt-0 sm:pl-4'
        }
      >
        <p className="text-[9px] font-extrabold uppercase tracking-wider text-brand-600">
          Total Bill to Pay
        </p>
        <p className="text-lg font-black text-brand-950 leading-tight">
          {money(totalBill)}
        </p>
        <p className="text-[10px] font-bold text-brand-600">
          Due: {date(invoice.dueDate)}
        </p>
      </div>
    </div>
  );
}
