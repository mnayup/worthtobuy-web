import React from 'react';
import {
  ShoppingBag,
  Package,
  PackageCheck,
  Truck,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export const STATUS_CARDS = [
  {
    key: 'ALL',
    label: 'All Shipments',
    icon: ShoppingBag,
    theme: {
      active: 'bg-brand-600 border-transparent shadow-brand-600/30',
      hover: 'hover:border-brand-300 hover:bg-brand-50',
      iconDefault: 'bg-slate-50 text-slate-400',
      iconHover: 'group-hover:bg-brand-100 group-hover:text-brand-600',
    },
  },
  {
    key: 'WAITING_PACKING',
    label: 'Awaiting Packing',
    icon: Package,
    theme: {
      active: 'bg-amber-500 border-transparent shadow-amber-500/30',
      hover: 'hover:border-amber-300 hover:bg-amber-50',
      iconDefault: 'bg-slate-50 text-slate-400',
      iconHover: 'group-hover:bg-amber-100 group-hover:text-amber-600',
    },
  },
  {
    key: 'PACKED',
    label: 'Packed',
    icon: PackageCheck,
    theme: {
      active: 'bg-blue-500 border-transparent shadow-blue-500/30',
      hover: 'hover:border-blue-300 hover:bg-blue-50',
      iconDefault: 'bg-slate-50 text-slate-400',
      iconHover: 'group-hover:bg-blue-100 group-hover:text-blue-600',
    },
  },
  {
    key: 'IN_TRANSIT',
    label: 'In Transit (Shipped)',
    icon: Truck,
    theme: {
      active: 'bg-indigo-500 border-transparent shadow-indigo-500/30',
      hover: 'hover:border-indigo-300 hover:bg-indigo-50',
      iconDefault: 'bg-slate-50 text-slate-400',
      iconHover: 'group-hover:bg-indigo-100 group-hover:text-indigo-600',
    },
  },
  {
    key: 'DELIVERED',
    label: 'Delivered (Completed)',
    icon: CheckCircle2,
    theme: {
      active: 'bg-emerald-500 border-transparent shadow-emerald-500/30',
      hover: 'hover:border-emerald-300 hover:bg-emerald-50',
      iconDefault: 'bg-slate-50 text-slate-400',
      iconHover: 'group-hover:bg-emerald-100 group-hover:text-emerald-600',
    },
  },
  {
    key: 'FAILED',
    label: 'Failed / Return',
    icon: XCircle,
    theme: {
      active: 'bg-rose-500 border-transparent shadow-rose-500/30',
      hover: 'hover:border-rose-300 hover:bg-rose-50',
      iconDefault: 'bg-slate-50 text-slate-400',
      iconHover: 'group-hover:bg-rose-100 group-hover:text-rose-600',
    },
  },
];

interface ShipmentStatusCardsProps {
  selectedStatus: string | null;
  onSelectStatus: (status: string | null) => void;
  summary: Record<string, number>;
}

export function ShipmentStatusCards({
  selectedStatus,
  onSelectStatus,
  summary,
}: ShipmentStatusCardsProps) {
  return (
    <div className="mb-4 flex gap-3 overflow-x-auto pb-6 pt-2 px-1 scrollbar-hide">
      {STATUS_CARDS.map((card) => {
        const isSelected =
          selectedStatus === card.key || (!selectedStatus && card.key === 'ALL');
        const count = card.key === 'ALL' ? summary.TOTAL || 0 : summary[card.key] || 0;
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
              'group relative flex min-w-[155px] flex-col items-start gap-3 ' +
              'rounded-2xl border p-4 transition-all duration-300 ease-out ' +
              'hover:-translate-y-1 hover:shadow-lg hover:z-10 cursor-pointer ' +
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
                  (isSelected ? 'text-white' : 'text-slate-900 group-hover:text-slate-900')
                }
              >
                {count}
              </span>
            </div>
            <span
              className={
                'text-xs font-semibold tracking-wide ' +
                (isSelected ? 'text-white/90' : 'text-slate-500 group-hover:text-slate-700')
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
