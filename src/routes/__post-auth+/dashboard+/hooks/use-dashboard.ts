import { useEffect, useMemo, useState } from 'react';
import { api, errorMessage } from '~/lib/api';
import { calculatePaymentProgress } from '../helpers/dashboard-helpers';
import type { DashboardData, DashboardFilterParams } from '../types';

export async function loadDashboard(
  params?: DashboardFilterParams
): Promise<DashboardData> {
  const query = new URLSearchParams();
  if (params?.periodId) query.set('periodId', params.periodId);
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

  const stats = data?.stats || {};
  const charts = data?.charts || {};
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
