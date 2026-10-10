import { Scale, TrendingDown, TrendingUp } from 'lucide-react';
import { money } from '~/lib/format';
import type { ProfitLossReport } from '../../reports+/types';

interface OverviewShoppingVarianceProps {
  report: ProfitLossReport;
}

export function OverviewShoppingVariance({
  report,
}: OverviewShoppingVarianceProps) {
  const isEfficient = report.shoppingVariance >= 0;
  const ratioPercent =
    report.estimatedBuyPrice > 0
      ? (report.actualBuyPrice / report.estimatedBuyPrice) * 100
      : 100;

  return (
    <section className="card p-6">
      <div
        className={
          'flex flex-col gap-2 md:flex-row md:items-center ' +
          'md:justify-between border-b border-slate-100 pb-4'
        }
      >
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-amber-50 p-2 text-amber-600 ring-1 ring-amber-200">
            <Scale size={20} />
          </div>
          <div>
            <h2 className="section-title">
              Rekapitulasi Harga Beli: Estimasi vs Realisasi Toko
            </h2>
            <p className="text-xs text-slate-500">
              Evaluasi selisih antara perkiraan target modal awal dengan harga riil saat belanja.
            </p>
          </div>
        </div>

        {/* Shopping Variance Badge */}
        <div
          className={
            'inline-flex items-center gap-2 rounded-2xl px-4 py-2 border ' +
            'text-sm font-bold shadow-xs ' +
            (isEfficient
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-rose-200 bg-rose-50 text-rose-800')
          }
        >
          {isEfficient ? (
            <>
              <TrendingDown className="text-emerald-600" size={18} />
              <span>
                Hemat Belanja (Efisiensi Modal): +{money(report.shoppingVariance)} (
                {report.shoppingEfficiency.toFixed(1)}%)
              </span>
            </>
          ) : (
            <>
              <TrendingUp className="text-rose-600" size={18} />
              <span>
                Over-Budget Belanja: -{money(Math.abs(report.shoppingVariance))} (
                {Math.abs(report.shoppingEfficiency).toFixed(1)}%)
              </span>
            </>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Estimasi Awal Modal Belanja
          </span>
          <p className="mt-2 text-2xl font-black text-slate-900">
            {money(report.estimatedBuyPrice)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Total target harga beli awal yang dicatat pada pesanan pelanggan.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/40 p-5">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
            Realisasi Modal Belanja Aktual
          </span>
          <p className="mt-2 text-2xl font-black text-amber-900">
            {money(report.actualBuyPrice)}
          </p>
          <p className="mt-1 text-xs text-amber-700">
            Uang keluar riil yang dibayarkan di kasir / toko saat pembelian barang.
          </p>
        </div>

        <div
          className={`rounded-2xl border p-5 ${
            isEfficient
              ? 'border-emerald-200 bg-emerald-50/50'
              : 'border-rose-200 bg-rose-50/50'
          }`}
        >
          <span
            className={`text-xs font-bold uppercase tracking-wider ${
              isEfficient ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            Selisih Belanja (Variance)
          </span>
          <p
            className={`mt-2 text-2xl font-black ${
              isEfficient ? 'text-emerald-900' : 'text-rose-900'
            }`}
          >
            {isEfficient
              ? `+${money(report.shoppingVariance)}`
              : `-${money(Math.abs(report.shoppingVariance))}`}
          </p>
          <p
            className={`mt-1 text-xs ${
              isEfficient ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {isEfficient
              ? 'Pengeluaran belanja lebih murah dari perkiraan (menguntungkan).'
              : 'Pengeluaran belanja melampaui estimasi awal (perlu diperhatikan).'}
          </p>
        </div>
      </div>

      {/* Visual Bar Comparison */}
      <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4">
        <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-2">
          <span>Rasio Realisasi terhadap Estimasi Belanja</span>
          <span>
            {report.estimatedBuyPrice > 0
              ? `${ratioPercent.toFixed(1)}%`
              : '100%'}
          </span>
        </div>
        <div className="h-3 w-full rounded-full bg-slate-200 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              report.actualBuyPrice <= report.estimatedBuyPrice
                ? 'bg-emerald-500'
                : 'bg-rose-500'
            }`}
            style={{
              width: `${Math.min(100, ratioPercent)}%`,
            }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
          <span>0%</span>
          <span>Estimasi: {money(report.estimatedBuyPrice)}</span>
          <span>Realisasi: {money(report.actualBuyPrice)}</span>
        </div>
      </div>
    </section>
  );
}
