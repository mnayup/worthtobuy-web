import {
  Boxes,
  ShoppingBag,
  Sparkles,
  TrendingDown,
  TrendingUp,
  WalletCards,
} from 'lucide-react';
import { money } from '~/lib/format';
import { StatCard } from '~/components/StatCard';
import type { ProfitLossReport } from '../types';

interface ReportStatCardsProps {
  report: ProfitLossReport;
}

export function ReportStatCards({ report }: ReportStatCardsProps) {
  const readyStock = report.readyStock;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <StatCard
        label="Gross Revenue"
        value={money(report.omzet)}
        icon={WalletCards}
        caption={`Barang: ${money(report.goodsRevenue)}`}
      />
      <StatCard
        label="Modal Belanja Riil"
        value={money(report.actualBuyPrice)}
        icon={ShoppingBag}
        tone="amber"
        caption={`Est: ${money(report.estimatedBuyPrice)}`}
      />
      <StatCard
        label="Pendapatan Fee Jastip"
        value={money(report.serviceFeeIncome)}
        icon={Sparkles}
        tone="sky"
        caption="100% Margin Jasa"
      />
      <StatCard
        label="Beban Operasional"
        value={money(report.operational)}
        icon={TrendingDown}
        tone="rose"
        caption={`Refund: ${money(report.refund)}`}
      />
      <StatCard
        label="Laba Bersih"
        value={money(report.netProfit)}
        icon={TrendingUp}
        tone={report.netProfit >= 0 ? 'emerald' : 'rose'}
        caption={`Margin ${Number(report.margin).toFixed(1)}%`}
      />
      <StatCard
        label="Aset Ready Stock"
        value={money(readyStock?.totalCapitalValue || 0)}
        icon={Boxes}
        tone="indigo"
        caption={`Potensi: ${money(readyStock?.totalPotentialSales || 0)}`}
      />
    </div>
  );
}
