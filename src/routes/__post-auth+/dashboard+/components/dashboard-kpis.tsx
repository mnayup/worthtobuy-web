import { Clock3, Coins, ReceiptText, WalletCards } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '~/components/StatCard';
import { money, number } from '~/lib/format';
import type { DashboardStats } from '../types';

interface DashboardKpisProps {
  stats: DashboardStats;
}

export function DashboardKpis({ stats }: DashboardKpisProps) {
  const navigate = useNavigate();

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Total Orders"
        value={number(stats.totalOrders)}
        icon={ReceiptText}
        caption={`${number(stats.itemCount)} items logged`}
        tone="rose"
        onClick={() => navigate('/orders')}
      />
      <StatCard
        label="Gross Revenue"
        value={money(stats.omzet)}
        icon={WalletCards}
        caption={`Avg. invoice ${money(stats.averageOrder)}`}
        tone="emerald"
        onClick={() => navigate('/summary')}
      />
      <StatCard
        label="Service Fees"
        value={money(stats.serviceFees)}
        icon={Coins}
        caption="Jastip earnings"
        tone="amber"
        onClick={() => navigate('/finance')}
      />
      <StatCard
        label="Outstanding Balance"
        value={money(stats.outstanding)}
        icon={Clock3}
        caption={`${number(stats.unpaidOrders)} unpaid invoices`}
        tone="indigo"
        onClick={() => navigate('/invoices?outstanding=1')}
      />
    </div>
  );
}
