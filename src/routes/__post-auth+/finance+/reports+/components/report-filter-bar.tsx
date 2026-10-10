import { RefreshCw } from 'lucide-react';

interface ReportFilterBarProps {
  periods: any[];
  periodId: string;
  setPeriodId: (id: string) => void;
  load: () => void;
  loading: boolean;
  activeTab: 'pnl' | 'ready_stock' | 'performance';
  setActiveTab: (tab: 'pnl' | 'ready_stock' | 'performance') => void;
  readyStockSkuCount: number;
  performanceCount: number;
}

export function ReportFilterBar({
  periods,
  periodId,
  setPeriodId,
  load,
  loading,
  activeTab,
  setActiveTab,
  readyStockSkuCount,
  performanceCount,
}: ReportFilterBarProps) {
  return (
    <div
      className={
        'card flex flex-col gap-4 p-4 sm:flex-row sm:items-center ' +
        'sm:justify-between'
      }
    >
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        <label
          className={
            'text-xs font-bold uppercase tracking-wider text-slate-500 ' +
            'whitespace-nowrap'
          }
        >
          Event Filter:
        </label>
        <select
          className="input sm:max-w-md font-semibold text-slate-800"
          value={periodId}
          onChange={(e) => setPeriodId(e.target.value)}
        >
          <option value="">All Events (All Events & Ready Stock)</option>
          {periods.map((p) => (
            <option key={p.id} value={p.id}>
              {p.code} • {p.name} ({p.city || 'Indonesia'})
            </option>
          ))}
        </select>
        <button
          onClick={load}
          disabled={loading}
          className="btn-secondary whitespace-nowrap"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
        <button
          onClick={() => setActiveTab('pnl')}
          className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
            activeTab === 'pnl'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Laporan Laba Rugi
        </button>
        <button
          onClick={() => setActiveTab('ready_stock')}
          className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
            activeTab === 'ready_stock'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Valuasi Ready Stock ({readyStockSkuCount})
        </button>
        <button
          onClick={() => setActiveTab('performance')}
          className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
            activeTab === 'performance'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Kinerja per Event ({performanceCount})
        </button>
      </div>
    </div>
  );
}
