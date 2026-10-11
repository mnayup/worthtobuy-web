import React from 'react';
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { money } from '~/lib/format';

interface PurchaseDetailStatusSectionProps {
  status: string;
  onSelectStatus: (status: string) => void;
  isPartial: boolean;
  outstandingAmount: number;
}

export function PurchaseDetailStatusSection({
  status,
  onSelectStatus,
  isPartial,
  outstandingAmount,
}: PurchaseDetailStatusSectionProps) {
  return (
    <div className="space-y-3">
      <label className="label text-xs font-bold uppercase tracking-wider text-brand-500">
        Update Purchase Status
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <button
          type="button"
          onClick={() => onSelectStatus('PURCHASED')}
          className={
            'flex items-center justify-center gap-2 p-3.5 rounded-2xl border text-xs font-bold ' +
            'transition shadow-xs ' +
            (status === 'PURCHASED'
              ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-2 ring-indigo-500/20'
              : 'border-brand-200 bg-white text-brand-600 hover:bg-brand-50')
          }
        >
          <CheckCircle2
            size={16}
            className={status === 'PURCHASED' ? 'text-indigo-600' : 'text-brand-400'}
          />
          Purchased
        </button>

        <button
          type="button"
          onClick={() => onSelectStatus('UNAVAILABLE')}
          className={
            'flex items-center justify-center gap-2 p-3.5 rounded-2xl border text-xs font-bold ' +
            'transition shadow-xs ' +
            (status === 'UNAVAILABLE'
              ? 'border-cherry-600 bg-cherry-50 text-cherry-900 ring-2 ring-cherry-500/20'
              : 'border-brand-200 bg-white text-brand-600 hover:bg-cherry-50')
          }
        >
          <AlertCircle
            size={16}
            className={status === 'UNAVAILABLE' ? 'text-cherry-600' : 'text-brand-400'}
          />
          Unavailable
        </button>

        <button
          type="button"
          onClick={() => onSelectStatus('WAITING_PURCHASE')}
          className={
            'flex items-center justify-center gap-2 p-3.5 rounded-2xl border text-xs font-bold ' +
            'transition shadow-xs ' +
            (status === 'WAITING_PURCHASE'
              ? 'border-amber-500 bg-amber-50 text-amber-900 ring-2 ring-amber-500/20'
              : 'border-brand-200 bg-white text-brand-600 hover:bg-amber-50')
          }
        >
          <Clock
            size={16}
            className={status === 'WAITING_PURCHASE' ? 'text-amber-600' : 'text-brand-400'}
          />
          Waiting Purchase
        </button>
      </div>

      {status === 'PURCHASED' && (
        <div
          className={
            'rounded-2xl border border-brand-200 bg-brand-50/70 p-3.5 text-xs ' +
            'text-brand-800 space-y-1.5'
          }
        >
          <p className="font-bold flex items-center gap-1.5 text-brand-900">
            <CheckCircle2 size={14} className="text-emerald-600" />
            Automated Pipeline on "Purchased":
          </p>
          {isPartial ? (
            <p className="text-brand-700 leading-relaxed">
              Customer payment is still on <strong>Partial Deposit</strong> (remaining balance:{' '}
              {money(outstandingAmount)}). Order status will automatically update to{' '}
              <strong className="text-orange-700 font-bold">Waiting Settlement</strong>.
            </p>
          ) : (
            <p className="text-brand-700 leading-relaxed">
              Order is <strong>Fully Paid</strong>! Order status will automatically become{' '}
              <strong className="text-cyan-700 font-bold">Ready to Ship</strong> and a new{' '}
              <strong className="text-brand-900 font-bold">
                Shipment record (Waiting Packing)
              </strong>{' '}
              will be generated.
            </p>
          )}
        </div>
      )}

      {status === 'UNAVAILABLE' && (
        <div
          className={
            'rounded-2xl border border-cherry-200 bg-cherry-50 p-3.5 text-xs text-cherry-800'
          }
        >
          <p className="font-bold flex items-center gap-1.5 text-cherry-900">
            <AlertCircle size={14} className="text-cherry-600" />
            Item Unavailable at Store:
          </p>
          <p className="mt-1 text-cherry-700 leading-relaxed">
            This item will be recorded as Unavailable, and a refund ledger entry will be queued
            for the customer.
          </p>
        </div>
      )}
    </div>
  );
}
