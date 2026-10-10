import type { LucideIcon } from 'lucide-react';
import clsx from 'clsx';

export function StatCard({
  label,
  value,
  icon: Icon,
  caption,
  tone = 'brand',
  trend,
  onClick,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  caption?: string;
  tone?: 'brand' | 'emerald' | 'amber' | 'rose' | 'sky' | 'indigo' | 'violet';
  trend?: string;
  onClick?: () => void;
}) {
  const tones = {
    brand: 'bg-slate-100 text-slate-700 ring-slate-200/80',
    emerald: 'bg-emerald-50 text-emerald-600 ring-emerald-200/70',
    amber: 'bg-amber-50 text-amber-600 ring-amber-200/70',
    rose: 'bg-rose-50 text-rose-600 ring-rose-200/70',
    sky: 'bg-sky-50 text-sky-600 ring-sky-200/70',
    indigo: 'bg-indigo-50 text-indigo-600 ring-indigo-200/70',
    violet: 'bg-violet-50 text-violet-600 ring-violet-200/70',
  };

  const strValue = String(value ?? '');
  const len = strValue.length;

  // Responsive font size calculation to guarantee numbers never truncate
  let valueFontSize = 'text-xl sm:text-2xl';
  if (len > 15) {
    valueFontSize = 'text-sm sm:text-base';
  } else if (len > 12) {
    valueFontSize = 'text-base sm:text-lg';
  } else if (len > 9) {
    valueFontSize = 'text-[17px] sm:text-xl';
  }

  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={clsx(
        'card group flex flex-col justify-between w-full p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300',
        onClick && 'cursor-pointer focus:outline-none focus:ring-4 focus:ring-rose-500/10'
      )}
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 leading-tight">
            {label}
          </p>
          <div className={clsx('rounded-xl p-2 ring-1 shadow-2xs shrink-0 transition-transform duration-200 group-hover:scale-105', tones[tone])}>
            <Icon size={16} />
          </div>
        </div>

        <div className="mt-2.5">
          <p
            className={clsx(
              'font-black tracking-tight text-slate-900 leading-tight whitespace-nowrap overflow-visible',
              valueFontSize
            )}
            title={strValue}
          >
            {value}
          </p>
        </div>
      </div>

      {(caption || trend) && (
        <div className="mt-2.5 border-t border-slate-100/80 pt-2 flex flex-wrap items-center justify-between gap-1 text-[11px]">
          {caption && (
            <p className="font-medium text-slate-400 truncate max-w-full" title={caption}>
              {caption}
            </p>
          )}
          {trend && (
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 font-bold text-emerald-600 ring-1 ring-emerald-200">
              {trend}
            </span>
          )}
        </div>
      )}
    </Tag>
  );
}
