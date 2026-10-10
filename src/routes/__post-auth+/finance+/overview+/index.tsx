import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  Printer,
  RefreshCw,
} from 'lucide-react';
import { PageHeader } from '~/components/PageHeader';
import {
  useFinanceOverview,
  fetchFinanceOverview,
} from './hooks/use-finance-overview';
import { OverviewStatCards } from './components/overview-stat-cards';
import { OverviewShoppingVariance } from './components/overview-shopping-variance';
import { OverviewMarginsAndServices } from './components/overview-margins-and-services';
import { OverviewReadyStockValuation } from './components/overview-ready-stock-valuation';
import { OverviewCashFlowReconciliation } from './components/overview-cash-flow-reconciliation';
import type { FinanceOverviewData } from './types';

export async function loader(periodId?: string): Promise<FinanceOverviewData> {
  return fetchFinanceOverview(periodId);
}

export default function FinanceOverviewRoute() {
  const navigate = useNavigate();
  const {
    report,
    readyStock,
    periods,
    periodId,
    setPeriodId,
    stockSearch,
    setStockSearch,
    loading,
    error,
    filteredStockItems,
    selectedPeriod,
    load,
  } = useFinanceOverview();

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Financial Overview & Money Cockpit"
        description={
          'Comprehensive report of shopping realization vs estimates, ' +
          'sales margins, service fee income, ready stock valuation, and cash flows.'
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => window.print()} className="btn-secondary">
              <Printer size={16} /> Cetak
            </button>
            <button
              onClick={() => navigate('/reports')}
              className="btn-secondary"
            >
              Profit & Loss Report <ArrowRight size={16} />
            </button>
          </div>
        }
      />

      {/* Filter Bar */}
      <div
        className={
          'card flex flex-col gap-3 p-4 sm:flex-row sm:items-center ' +
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
            <option value="">All Events (All Shopping Events & Ready Stock)</option>
            {periods.map((p) => (
              <option key={p.id} value={p.id}>
                {p.code} • {p.name} ({p.city || 'Indonesia'})
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          {selectedPeriod && (
            <span
              className={
                'rounded-full bg-rose-50 px-3 py-1 text-xs font-bold ' +
                'text-rose-700 ring-1 ring-rose-200'
              }
            >
              {selectedPeriod.code} Aktif
            </span>
          )}
          <button onClick={load} disabled={loading} className="btn-primary">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh Data
          </button>
        </div>
      </div>

      {error ? (
        <div
          className={
            'rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm ' +
            'text-rose-800 flex items-start gap-3'
          }
        >
          <AlertTriangle className="text-rose-600 mt-0.5 shrink-0" size={18} />
          <div>
            <p className="font-bold">Gagal memuat data keuangan</p>
            <p className="mt-1 text-rose-700">{error}</p>
          </div>
        </div>
      ) : !report ? (
        <div className="card p-12 text-center text-slate-400">
          <RefreshCw className="mx-auto animate-spin mb-3 text-slate-400" size={28} />
          Loading financial reports...
        </div>
      ) : (
        <>
          <OverviewStatCards report={report} />

          <OverviewShoppingVariance report={report} />

          <OverviewMarginsAndServices report={report} />

          <OverviewReadyStockValuation
            readyStock={readyStock}
            filteredStockItems={filteredStockItems}
            stockSearch={stockSearch}
            setStockSearch={setStockSearch}
          />

          <OverviewCashFlowReconciliation report={report} />
        </>
      )}
    </div>
  );
}
