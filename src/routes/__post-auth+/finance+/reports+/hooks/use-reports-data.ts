import { useEffect, useState, useMemo } from 'react';
import { api, errorMessage } from '~/lib/api';
import type { PeriodPerformance, ProfitLossReport } from '../types';
import type { ReadyStockItem } from '../../overview+/types';
import { exportReportsToExcel } from '../helpers/reports-excel.helper';

export async function fetchReportsData(periodId?: string) {
  const [r, p] = await Promise.all([
    api.get(`/reports/profit-loss${periodId ? `?periodId=${periodId}` : ''}`),
    api.get('/reports/period-performance'),
  ]);
  return {
    report: r.data as ProfitLossReport,
    performance: p.data as PeriodPerformance[],
  };
}

export function useReportsData() {
  const [periods, setPeriods] = useState<any[]>([]);
  const [periodId, setPeriodId] = useState('');
  const [report, setReport] = useState<ProfitLossReport | null>(null);
  const [performance, setPerformance] = useState<PeriodPerformance[]>([]);
  const [activeTab, setActiveTab] = useState<
    'pnl' | 'ready_stock' | 'performance'
  >('pnl');
  const [stockSearch, setStockSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setError('');
    setLoading(true);
    try {
      const result = await fetchReportsData(periodId);
      setReport(result.report);
      setPerformance(result.performance);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    api
      .get('/periods?limit=100')
      .then((r) => setPeriods(r.data.data || []));
    load();
  }, [periodId]);

  const readyStock = report?.readyStock;

  const filteredStock = useMemo(() => {
    if (!readyStock?.items) return [];
    if (!stockSearch.trim()) return readyStock.items;
    const q = stockSearch.toLowerCase();
    return readyStock.items.filter(
      (item: ReadyStockItem) =>
        item.name.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        (item.brandName && item.brandName.toLowerCase().includes(q))
    );
  }, [readyStock?.items, stockSearch]);

  const selectedPeriod = periods.find(
    (p) => String(p.id) === String(periodId)
  );

  return {
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
    downloadExcel: () => {
      if (report) exportReportsToExcel(report);
    },
  };
}
