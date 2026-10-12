import React from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export const STATUS_STEPS = [
  { key: 'WAITING_PACKING', label: '1. Awaiting Packing', shortLabel: 'Packing' },
  { key: 'PACKED', label: '2. Packed', shortLabel: 'Packed' },
  { key: 'WAITING_SETTLEMENT', label: '3. Settlement Due', shortLabel: 'Settlement' },
  { key: 'IN_TRANSIT', label: '4. In Transit', shortLabel: 'In Transit' },
  { key: 'DELIVERED', label: '5. Delivered', shortLabel: 'Delivered' },
];

export function getStepIndex(status: string) {
  if (status === 'WAITING_PACKING') return 0;
  if (status === 'PACKED' || status === 'READY') return 1;
  if (status === 'WAITING_SETTLEMENT') return 2;
  if (status === 'IN_TRANSIT' || status === 'HANDED_TO_COURIER') return 3;
  if (status === 'DELIVERED') return 4;
  return 0;
}

export function ShipmentDetailPipeline({ currentStatus }: { currentStatus: string }) {
  const currentStepIdx = getStepIndex(currentStatus);

  return (
    <div className="rounded-2xl border border-brand-100 bg-brand-50/50 p-4">
      <p
        className={
          'text-xs font-bold uppercase tracking-wider text-brand-500 mb-3 ' +
          'flex items-center gap-1.5'
        }
      >
        <Sparkles size={14} className="text-brand-600" />
        Sequential Shipment Pipeline
      </p>
      <div className="grid grid-cols-5 gap-1.5">
        {STATUS_STEPS.map((step, idx) => {
          const isPassed = currentStepIdx > idx;
          const isCurrent = currentStepIdx === idx;
          return (
            <div
              key={step.key}
              className={
                'flex flex-col items-center text-center p-2 rounded-xl border ' +
                'text-xs font-bold transition ' +
                (isCurrent
                  ? 'border-indigo-500 bg-indigo-50/90 text-indigo-900 ' +
                    'ring-2 ring-indigo-500/20 shadow-xs'
                  : isPassed
                  ? 'border-emerald-200 bg-emerald-50/60 text-emerald-800'
                  : 'border-slate-200 bg-white/60 text-slate-400')
              }
            >
              <div className="flex items-center gap-1 mb-0.5">
                {isPassed ? (
                  <CheckCircle2 size={12} className="text-emerald-600" />
                ) : isCurrent ? (
                  <div className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-ping" />
                ) : (
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                )}
                <span className="text-[10px] truncate">{step.shortLabel}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
