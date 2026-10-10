import { useEffect, useState, useMemo } from 'react';
import { api, errorMessage } from '~/lib/api';
import type { FinanceOverviewData, ReadyStockItem } from '../types';

export async function fetchFinanceOverview(
  periodId?: string
): Promise<FinanceOverviewData> {
  const p = periodId ? `?periodId=${periodId}` : '';
  const [d, r] = await Promise.all([
    api.get(`/dashboard${p}`),
    api.get(`/reports/profit-loss${p}`),
  ]);

  const report = r.data;
  const kpi = d.data?.kpi || {};

  return {
    stats: {
      cashIn: report.verifiedCashIn || kpi.paymentsTotal || 0,
      cashOut:
        report.cashOutflow ||
        kpi.modal + kpi.operational + kpi.refundTotal ||
        0,
      ...kpi,
    },
    report,
  };
}

export function useFinanceOverview() {
  const [data, setData] = useState<FinanceOverviewData | null>(null);
  const [periods, setPeriods] = useState<any[]>([]);
  const [periodId, setPeriodId] = useState('');
  const [stockSearch, setStockSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    try {
      setLoading(true);
      setError('');
      const result = await fetchFinanceOverview(periodId);
      setData(result);
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

  const report = data?.report;
  const readyStock = report?.readyStock;

  const filteredStockItems = useMemo(() => {
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
    data,
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
  };
}
