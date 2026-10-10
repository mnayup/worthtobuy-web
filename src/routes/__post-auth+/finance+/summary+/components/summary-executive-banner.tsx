import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { money, number } from '~/lib/format';

interface SummaryExecutiveBannerProps {
  stats: any;
}

function SummaryMetric({
  label,
  value,
  onClick,
}: {
  label: string;
  value: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={
        'rounded-2xl bg-white/10 p-3.5 text-left transition ' +
        'hover:bg-white/15 hover:-translate-y-0.5'
      }
    >
      <p className="text-[11px] font-bold uppercase tracking-wider text-brand-300">
        {label}
      </p>
      <p className="mt-1 truncate text-lg font-black text-white">{value}</p>
    </button>
  );
}

export function SummaryExecutiveBanner({
  stats,
}: SummaryExecutiveBannerProps) {
  const navigate = useNavigate();

  return (
    <section
      className={
        'relative overflow-hidden rounded-[2.25rem] bg-gradient-to-r ' +
        'from-brand-900 to-brand-950 p-6 sm:p-8 text-white shadow-xl ' +
        'shadow-brand-950/15 border border-brand-800'
      }
    >
      <div
        className={
          'absolute -right-12 -top-12 h-56 w-56 rounded-full ' +
          'bg-cherry-500/20 blur-3xl pointer-events-none'
        }
      />
      <div className="relative">
        <span
          className={
            'inline-flex items-center gap-2 rounded-full bg-white/10 ' +
            'px-3.5 py-1 text-xs font-bold text-white shadow-xs backdrop-blur'
          }
        >
          <Sparkles size={14} className="text-honey-400" /> Executive Overview
        </span>
        <h2 className="mt-4 text-3xl font-black tracking-[-.04em] sm:text-4xl">
          {money(stats.omzet)}
        </h2>
        <p className="mt-1 text-xs font-bold uppercase tracking-wider text-brand-300">
          Total Invoiced Revenue
        </p>
      </div>

      <div className="relative mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryMetric
          label="Orders"
          value={number(stats.orders ?? stats.totalOrders)}
          onClick={() => navigate('/orders')}
        />
        <SummaryMetric
          label="Barang"
          value={money(stats.goodsRevenue ?? 0)}
          onClick={() => navigate('/orders')}
        />
        <SummaryMetric
          label="Fee Jastip"
          value={money(stats.serviceFees ?? 0)}
          onClick={() => navigate('/finance')}
        />
        <SummaryMetric
          label="Modal Beli"
          value={money(stats.actualBuyPrice ?? stats.modal ?? 0)}
          onClick={() => navigate('/finance')}
        />
      </div>

      <div className="relative mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryMetric
          label="Laba Bersih"
          value={money(stats.netProfit ?? 0)}
          onClick={() => navigate('/reports')}
        />
        <SummaryMetric
          label="Aset Ready Stock"
          value={money(stats.readyStock?.totalCapitalValue ?? 0)}
          onClick={() => navigate('/finance')}
        />
        <SummaryMetric
          label="Items"
          value={number(stats.itemCount ?? 0)}
          onClick={() => navigate('/orders')}
        />
        <SummaryMetric
          label="Outstanding"
          value={money(stats.outstanding ?? 0)}
          onClick={() => navigate('/invoices?outstanding=1')}
        />
      </div>
    </section>
  );
}
