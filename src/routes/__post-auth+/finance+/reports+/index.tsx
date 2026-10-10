import { Download, Printer, RefreshCw } from 'lucide-react';
import { PageHeader } from '~/components/PageHeader';
import {
  useReportsData,
  fetchReportsData,
} from './hooks/use-reports-data';
import { ReportStatCards } from './components/report-stat-cards';
import { ReportFilterBar } from './components/report-filter-bar';
import { ReportPnlTab } from './components/report-pnl-tab';
import { ReportReadyStockTab } from './components/report-ready-stock-tab';
import { ReportPerformanceTab } from './components/report-performance-tab';

export async function loader(periodId?: string) {
  return fetchReportsData(periodId);
}

export default function ReportsRoute() {
  const {
    periods,
    periodId,
    setPeriodId,
    report,
    performance,
    activeTab,
    setActiveTab,
    stockSearch,
    setStockSearch,
    loading,
    error,
    readyStock,
    filteredStock,
    selectedPeriod,
    load,
    downloadExcel,
  } = useReportsData();

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Financial & Profit/Loss Reports"
        description={
          'Comprehensive profit & loss report, details of shopping capital ' +
          'vs estimates, service income, ready stock valuation, and per-event performance.'
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => window.print()} className="btn-secondary">
              <Printer size={16} /> Print Report
            </button>
            <button onClick={downloadExcel} className="btn-primary">
              <Download size={16} /> Export Excel Lengkap
            </button>
          </div>
        }
      />

      <ReportFilterBar
        periods={periods}
        periodId={periodId}
        setPeriodId={setPeriodId}
        load={load}
        loading={loading}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        readyStockSkuCount={readyStock?.skuCount || 0}
        performanceCount={performance.length}
      />

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800">
          {error}
        </div>
      ) : !report ? (
        <div className="card p-12 text-center text-slate-400">
          <RefreshCw className="mx-auto animate-spin mb-3 text-slate-400" size={28} />
          Loading financial report data...
        </div>
      ) : (
        <>
          <ReportStatCards report={report} />

          {activeTab === 'pnl' && (
            <ReportPnlTab
              report={report}
              selectedPeriod={selectedPeriod}
              onGoToReadyStock={() => setActiveTab('ready_stock')}
            />
          )}

          {activeTab === 'ready_stock' && (
            <ReportReadyStockTab
              readyStock={readyStock}
              filteredStock={filteredStock}
              stockSearch={stockSearch}
              setStockSearch={setStockSearch}
            />
          )}

          {activeTab === 'performance' && (
            <ReportPerformanceTab performance={performance} />
          )}
        </>
      )}
    </div>
  );
}
