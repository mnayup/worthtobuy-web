import { Search } from 'lucide-react';
import type { EventTab } from '../hooks/use-public-events';

interface EventsFilterBarProps {
  activeTab: EventTab;
  onTabChange: (tab: EventTab) => void;
  search: string;
  onSearchChange: (search: string) => void;
}

const TABS: { id: EventTab; label: string }[] = [
  { id: 'ALL', label: 'Semua Event' },
  { id: 'OPEN', label: '🔥 Sedang Buka PO' },
  { id: 'LOCAL', label: 'Pameran Domestik' },
  { id: 'OVERSEAS', label: 'Overseas Trip' },
];

export function EventsFilterBar({
  activeTab,
  onTabChange,
  search,
  onSearchChange,
}: EventsFilterBarProps) {
  return (
    <div
      className={
        'flex flex-col md:flex-row items-stretch md:items-center ' +
        'justify-between gap-4 rounded-2xl border border-slate-200 ' +
        'bg-white p-3 shadow-xs'
      }
    >
      <div className="flex flex-wrap items-center gap-1.5">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={
              'rounded-xl px-4 py-2 text-xs font-black transition cursor-pointer ' +
              (activeTab === tab.id
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="relative min-w-[260px]">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari nama event, venue, kota..."
          className={
            'w-full rounded-xl border border-slate-200 bg-slate-50 py-2 ' +
            'pl-9 pr-4 text-xs text-slate-900 outline-none transition ' +
            'focus:border-rose-400 focus:bg-white focus:ring-2 ' +
            'focus:ring-rose-500/10 placeholder:text-slate-400 font-medium'
          }
        />
      </div>
    </div>
  );
}
