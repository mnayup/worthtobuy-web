import { useNavigate } from 'react-router-dom';
import {
  Boxes,
  Coins,
  Receipt,
  ShoppingBag,
  Sparkles,
  WalletCards,
} from 'lucide-react';
import { money, number } from '~/lib/format';
import { StatCard } from '~/components/StatCard';
import type { ProfitLossReport } from '../../reports+/types';

interface OverviewStatCardsProps {
  report: ProfitLossReport;
}

export function OverviewStatCards({ report }: OverviewStatCardsProps) {
  const navigate = useNavigate();
  const readyStock = report.readyStock;
  const skuUnitsCaption =
    `${number(readyStock?.totalUnits || 0)} unit ` +
    `(${readyStock?.skuCount || 0} SKU)`;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <StatCard
        label="Total Invoice Revenue"
        value={money(report.omzet)}
        icon={WalletCards}
        tone="brand"
        caption={`Barang: ${money(report.goodsRevenue)}`}
      />
      <StatCard
        label="Modal Belanja Riil"
        value={money(report.actualBuyPrice)}
        icon={ShoppingBag}
        tone="amber"
        caption={`Estimasi: ${money(report.estimatedBuyPrice)}`}
      />
      <StatCard
        label="Pendapatan Fee Jastip"
        value={money(report.serviceFeeIncome)}
        icon={Sparkles}
        tone="sky"
        caption="100% Keuntungan Jasa"
      />
      <StatCard
        label="Net Operational Profit"
        value={money(report.netProfit)}
        icon={Coins}
        tone={report.netProfit >= 0 ? 'emerald' : 'rose'}
        caption={`Margin ${Number(report.margin).toFixed(1)}%`}
      />
      <StatCard
        label="Valuasi Modal Ready Stock"
        value={money(readyStock?.totalCapitalValue || 0)}
        icon={Boxes}
        tone="indigo"
        caption={skuUnitsCaption}
      />
      <StatCard
        label="Piutang Pelanggan"
        value={money(report.receivables)}
        icon={Receipt}
        tone={report.receivables > 0 ? 'rose' : 'emerald'}
        caption={
          report.receivables > 0
            ? 'Menunggu Pelunasan'
            : 'Semua Tagihan Lunas'
        }
        onClick={() => navigate('/invoices?outstanding=1')}
      />
    </div>
  );
}
