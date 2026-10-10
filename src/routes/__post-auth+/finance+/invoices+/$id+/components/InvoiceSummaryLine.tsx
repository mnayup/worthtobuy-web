import React from 'react';

interface SummaryLineProps {
  label: string;
  value: string;
  strong?: boolean;
  warning?: boolean;
}

export function SummaryLine({ label, value, strong, warning }: SummaryLineProps) {
  const labelCls = warning
    ? 'font-bold text-amber-800'
    : strong
      ? 'font-black text-brand-950'
      : 'font-semibold text-brand-700';

  const valCls = warning
    ? 'text-amber-800'
    : strong
      ? 'text-brand-950 text-sm'
      : 'text-brand-900';

  return (
    <div
      className={
        'flex items-center justify-between gap-3 border-b border-brand-200/80 ' +
        'py-1.5 last:border-0 ' +
        (strong ? 'text-sm font-black' : 'text-xs')
      }
    >
      <span className={labelCls}>{label}</span>
      <span className={`font-black ${valCls}`}>{value}</span>
    </div>
  );
}
