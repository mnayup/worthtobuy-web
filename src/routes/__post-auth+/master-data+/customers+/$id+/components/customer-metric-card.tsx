export function CustomerMetricCard({
  label,
  value,
  caption,
  tone = 'indigo',
}: {
  label: string;
  value: string;
  caption: string;
  tone?: 'cherry' | 'emerald' | 'indigo' | 'amber';
}) {
  const toneMap = {
    cherry:
      'from-cherry-500/10 via-cherry-500/5 to-transparent ' +
      'border-cherry-200/60 text-cherry-700',
    emerald:
      'from-emerald-500/10 via-emerald-500/5 to-transparent ' +
      'border-emerald-200/60 text-emerald-700',
    indigo:
      'from-indigo-500/10 via-indigo-500/5 to-transparent ' +
      'border-indigo-200/60 text-indigo-700',
    amber:
      'from-amber-500/10 via-amber-500/5 to-transparent ' +
      'border-amber-200/60 text-amber-700',
  };

  return (
    <div
      className={
        `card relative overflow-hidden bg-gradient-to-br ${toneMap[tone]} ` +
        'p-5 transition hover:shadow-card'
      }
    >
      <p className="text-xs font-bold uppercase tracking-wider text-brand-500">{label}</p>
      <p className="mt-2 text-2xl font-black text-brand-900 tracking-tight">{value}</p>
      <p className="mt-1 text-xs font-semibold text-brand-500">{caption}</p>
    </div>
  );
}

