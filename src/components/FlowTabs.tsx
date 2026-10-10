import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import type { ComponentType } from 'react';

export interface FlowTabItem {
  to: string;
  label: string;
  icon?: ComponentType<{ size?: number; className?: string }>;
  badge?: string | number;
}

export function FlowTabs({ items }: { items: FlowTabItem[] }) {
  if (!items || items.length <= 1) return null;

  return (
    <div className="mb-5 flex flex-wrap items-center gap-1.5 rounded-2xl border border-brand-100 bg-white/80 p-1.5 shadow-sm backdrop-blur-sm sm:inline-flex">
      {items.map(({ to, label, icon: Icon, badge }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/orders' || to === '/invoices' || to === '/finance' || to === '/shopping-list' || to === '/settings'}
          className={({ isActive }) =>
            clsx(
              'flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all sm:text-sm',
              isActive
                ? 'bg-brand-900 text-white shadow-md shadow-brand-900/15'
                : 'text-brand-600 hover:bg-brand-50 hover:text-brand-900'
            )
          }
        >
          {Icon && <Icon size={16} />}
          <span>{label}</span>
          {badge !== undefined && badge !== null && (
            <span className="rounded-full bg-brand-100/60 px-2 py-0.5 text-[11px] font-extrabold text-brand-700">
              {badge}
            </span>
          )}
        </NavLink>
      ))}
    </div>
  );
}
