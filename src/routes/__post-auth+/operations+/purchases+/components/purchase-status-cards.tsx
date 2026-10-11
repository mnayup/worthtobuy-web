import React from 'react';
import { ShoppingBag, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export const STATUS_CARDS = [
  {
    key: 'ALL',
    label: 'All Purchases',
    icon: ShoppingBag,
    theme: {
      active: 'bg-brand-900 border-transparent shadow-brand-900/30',
      hover: 'hover:border-brand-300 hover:bg-brand-50',
      iconDefault: 'bg-slate-50 text-slate-400',
      iconHover: 'group-hover:bg-brand-100 group-hover:text-brand-600',
    },
  },
  {
    key: 'WAITING_PURCHASE',
    label: 'Waiting Purchase',
    icon: Clock,
    theme: {
      active: 'bg-indigo-600 border-transparent shadow-indigo-500/30',
      hover: 'hover:border-indigo-300 hover:bg-indigo-50',
      iconDefault: 'bg-slate-50 text-slate-400',
      iconHover: 'group-hover:bg-indigo-100 group-hover:text-indigo-600',
    },
  },
  {
    key: 'PURCHASED',
    label: 'Purchased',
    icon: CheckCircle2,
    theme: {
      active: 'bg-emerald-600 border-transparent shadow-emerald-500/30',
      hover: 'hover:border-emerald-300 hover:bg-emerald-50',
      iconDefault: 'bg-slate-50 text-slate-400',
      iconHover: 'group-hover:bg-emerald-100 group-hover:text-emerald-600',
    },
  },
  {
    key: 'UNAVAILABLE',
    label: 'Unavailable',
    icon: AlertCircle,
    theme: {
      active: 'bg-rose-600 border-transparent shadow-rose-500/30',
      hover: 'hover:border-rose-300 hover:bg-rose-50',
      iconDefault: 'bg-slate-50 text-slate-400',
      iconHover: 'group-hover:bg-rose-100 group-hover:text-rose-600',
    },
  },
];

interface PurchaseStatusCardsProps {
  selectedStatus: string | null;
  onSelectStatus: (status: string | null) => void;
  summary: Record<string, number>;
}

export function PurchaseStatusCards({
  selectedStatus,
  onSelectStatus,
  summary,
}: PurchaseStatusCardsProps) {
  return (
    <div className="mb-4 flex gap-3 overflow-x-auto pb-6 pt-2 px-1 scrollbar-hide">
      {STATUS_CARDS.map((card) => {
        const isSelected =
          selectedStatus === card.key || (!selectedStatus && card.key === 'ALL');
        const count =
          card.key === 'ALL' ? summary.TOTAL || 0 : summary[card.key] || 0;
        const Icon = card.icon;

        return (
          <button
            key={card.key}
            type="button"
            onClick={() => {
              if (card.key === 'ALL' || selectedStatus === card.key) {
                onSelectStatus(null);
              } else {
                onSelectStatus(card.key);
              }
            }}
            className={
              'group relative flex min-w-[150px] flex-col items-start gap-3 ' +
              'rounded-2xl border p-4 transition-all duration-300 ease-out ' +
              'hover:-translate-y-1 hover:shadow-lg hover:z-10 ' +
              (isSelected
                ? `${card.theme.active} text-white shadow-xl z-10`
                : `border-slate-200 bg-white/70 backdrop-blur-md ${card.theme.hover} z-0`)
            }
          >
            <div className="flex w-full items-center justify-between">
              <div
                className={
                  'flex h-10 w-10 items-center justify-center rounded-xl transition-colors ' +
                  (isSelected
                    ? 'bg-white/20 text-white'
                    : `${card.theme.iconDefault} ${card.theme.iconHover}`)
                }
              >
                <Icon size={20} strokeWidth={2.5} />
              </div>
              <span
                className={
                  'text-2xl font-bold tracking-tight ' +
                  (isSelected
                    ? 'text-white'
                    : 'text-slate-900 group-hover:text-slate-900')
                }
              >
                {count}
              </span>
            </div>
            <span
              className={
                'text-sm font-semibold tracking-wide ' +
                (isSelected
                  ? 'text-white/90'
                  : 'text-slate-500 group-hover:text-slate-700')
              }
            >
              {card.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
