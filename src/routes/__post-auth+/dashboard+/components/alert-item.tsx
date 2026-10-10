import type { LucideIcon } from 'lucide-react';

export function AlertItem({
  icon: Icon,
  label,
  value,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl border border-brand-200/80 bg-white p-3.5 text-left transition-all duration-150 hover:-translate-y-0.5 hover:bg-brand-50 hover:border-brand-300 shadow-2xs group"
    >
      <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600 ring-1 ring-amber-200/60 transition group-hover:scale-105">
        <Icon size={18} />
      </div>
      <p className="flex-1 text-sm font-bold text-brand-800">{label}</p>
      <span className="rounded-full bg-brand-900 px-3 py-1 text-xs font-black text-white shadow-xs">
        {value}
      </span>
    </button>
  );
}
