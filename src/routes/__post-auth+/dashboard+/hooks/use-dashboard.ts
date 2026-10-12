import { useEffect, useMemo, useState } from 'react';
import { api, errorMessage } from '~/lib/api';
import { calculatePaymentProgress } from '../helpers/dashboard-helpers';
import type {
  DashboardCharts,
  DashboardData,
  DashboardFilterParams,
  DashboardStats,
} from '../types';

export async function loadDashboard(
  params?: DashboardFilterParams
): Promise<DashboardData> {
  const query = new URLSearchParams();
  if (params?.periodId) {
    query.set('periodId', params.periodId);
    query.set('period_id', params.periodId);
  }
  if (params?.start) query.set('start', params.start);
  if (params?.end) query.set('end', params.end);
  const response = await api.get(`/dashboard?${query}`);
  return response.data;
}

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [periods, setPeriods] = useState<any[]>([]);
  const [periodId, setPeriodId] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const responseData = await loadDashboard({ periodId, start, end });
      setData(responseData);
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    api
      .get('/periods?limit=100')
      .then((response) => setPeriods(response.data.data || []))
      .catch(() => {});
    load();
  }, []);

  const rawStats: any = data?.stats || {};
  const rawKpi: any = (data as any)?.kpi || {};

  const stats: DashboardStats = useMemo(() => ({
    totalOrders: rawStats.totalOrders ?? rawKpi.orders ?? 0,
    itemCount: rawStats.itemCount ?? rawKpi.itemCount ?? 0,
    omzet: rawStats.omzet ?? rawKpi.omzet ?? 0,
    averageOrder: rawStats.averageOrder ?? rawKpi.averageOrder ?? 0,
    serviceFees: rawStats.serviceFees ?? rawKpi.serviceFees ?? 0,
    outstanding: rawStats.outstanding ?? rawKpi.outstanding ?? 0,
    unpaidOrders: rawStats.unpaidOrders ?? 0,
    cashIn: rawStats.cashIn ?? rawKpi.paymentsTotal ?? 0,
    cashOut:
      rawStats.cashOut ??
      Number(rawKpi.modal || 0) + Number(rawKpi.operational || 0),
    readyToShip: rawStats.readyToShip ?? 0,
    completed: rawStats.completed ?? 0,
    invoiceCount: rawStats.invoiceCount ?? 0,
  }), [rawStats, rawKpi]);

  const charts: DashboardCharts = useMemo(() => ({
    daily: data?.charts?.daily || [],
    statusGroups:
      data?.charts?.statusGroups ||
      (data as any)?.orderStatuses?.map((s: any) => ({
        status: s.status,
        _count: { _all: s.count },
      })) ||
      [],
    topProducts: data?.charts?.topProducts || [],
    topCustomers: data?.charts?.topCustomers || [],
  }), [data]);

  const paymentProgress = useMemo(
    () => calculatePaymentProgress(stats.omzet, stats.cashIn),
    [stats.omzet, stats.cashIn]
  );

  return {
    data,
    periods,
    periodId,
    setPeriodId,
    start,
    setStart,
    end,
    setEnd,
    loading,
    error,
    stats,
    charts,
    paymentProgress,
    load,
  };
}
