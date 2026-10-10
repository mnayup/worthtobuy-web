import { useAuth } from '~/context/AuthContext';
import { DashboardAlertsCard } from './components/dashboard-alerts-card';
import { DashboardFilters } from './components/dashboard-filters';
import { DashboardHero } from './components/dashboard-hero';
import { DashboardKpis } from './components/dashboard-kpis';
import { DashboardLoading } from './components/dashboard-loading';
import { CollectionsCard } from './components/collections-card';
import { OrderStatusCard } from './components/order-status-card';
import { RevenueTrendCard } from './components/revenue-trend-card';
import { TopProductsCard } from './components/top-products-card';
import { TopShoppersCard } from './components/top-shoppers-card';
import { useDashboard } from './hooks/use-dashboard';

export default function DashboardRoute() {
  const { user } = useAuth();
  const {
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
  } = useDashboard();

  if (loading && !data) {
    return <DashboardLoading />;
  }

  return (
    <div className="animate-rise space-y-6">
      <DashboardHero />

      {user?.role === 'OWNER' && (
        <>
          <DashboardFilters
            start={start}
            end={end}
            periodId={periodId}
            periods={periods}
            onStartChange={setStart}
            onEndChange={setEnd}
            onPeriodChange={setPeriodId}
            onApply={load}
          />

          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-sm font-bold text-rose-700 shadow-sm">
              {error}
            </div>
          )}

          <DashboardKpis stats={stats} />

          <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
            <RevenueTrendCard
              data={charts.daily || []}
              invoiceCount={stats.invoiceCount}
            />
            <CollectionsCard
              cashIn={stats.cashIn}
              omzet={stats.omzet}
              paymentProgress={paymentProgress}
              readyToShip={stats.readyToShip}
              completed={stats.completed}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <OrderStatusCard statusGroups={charts.statusGroups} />
            <TopProductsCard topProducts={charts.topProducts} />
            <TopShoppersCard topCustomers={charts.topCustomers} />
          </div>

          <div className="grid gap-6">
            <DashboardAlertsCard alerts={data?.alerts} />
          </div>
        </>
      )}
    </div>
  );
}
