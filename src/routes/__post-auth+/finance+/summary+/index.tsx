import { useNavigate } from 'react-router-dom';
import { PencilLine } from 'lucide-react';
import { PageHeader } from '~/components/PageHeader';
import { useAuth } from '~/context/AuthContext';
import {
  useSummaryData,
  fetchSummaryData,
} from './hooks/use-summary-data';
import { SummaryExecutiveBanner } from './components/summary-executive-banner';
import { SummaryFeeCalculator } from './components/summary-fee-calculator';
import { SummaryFeeScheduleTable } from './components/summary-fee-schedule-table';
import { SummaryRecentOrdersTable } from './components/summary-recent-orders-table';

export async function loader() {
  return fetchSummaryData();
}

export default function SummaryRoute() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    stats,
    orders,
    orderPage,
    setOrderPage,
    orderPageSize,
    amount,
    setAmount,
    mode,
    setMode,
    manualFee,
    setManualFee,
    specialNote,
    setSpecialNote,
    error,
    calculation,
    sortedOrders,
    sortedRules,
    handleOrderSort,
    handleRuleSort,
  } = useSummaryData();

  return (
    <div className="animate-rise space-y-6">
      <PageHeader
        title="Summary & Service Fees"
        description={
          'Review executive revenue figures and calculate personal shopping fees dynamically.'
        }
        actions={
          user?.role === 'OWNER' ? (
            <button
              onClick={() => navigate('/settings')}
              className="btn-secondary"
            >
              <PencilLine size={16} className="text-brand-500" /> Edit Fee Tiers
            </button>
          ) : undefined
        }
      />
      {error && (
        <div
          className={
            'rounded-2xl border border-cherry-200 bg-cherry-50/80 p-4 ' +
            'text-sm font-bold text-cherry-700 shadow-sm'
          }
        >
          {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.05fr_.95fr]">
        <SummaryExecutiveBanner stats={stats} />

        <SummaryFeeCalculator
          amount={amount}
          setAmount={setAmount}
          mode={mode}
          setMode={setMode}
          manualFee={manualFee}
          setManualFee={setManualFee}
          specialNote={specialNote}
          setSpecialNote={setSpecialNote}
          calculation={calculation}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[.85fr_1.15fr]">
        <SummaryFeeScheduleTable
          sortedRules={sortedRules}
          onSort={handleRuleSort}
        />

        <SummaryRecentOrdersTable
          orders={orders}
          sortedOrders={sortedOrders}
          orderPage={orderPage}
          setOrderPage={setOrderPage}
          orderPageSize={orderPageSize}
          onSort={handleOrderSort}
        />
      </div>
    </div>
  );
}
