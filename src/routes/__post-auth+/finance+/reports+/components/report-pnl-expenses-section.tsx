import { money } from '~/lib/format';
import type { ProfitLossReport } from '../types';

interface ReportPnlExpensesSectionProps {
  report: ProfitLossReport;
}

export function ReportPnlExpensesSection({
  report,
}: ReportPnlExpensesSectionProps) {
  const isProfitable = report.netProfit >= 0;

  return (
    <>
      {/* IV. Beban Operasional */}
      <div>
        <div
          className={
            'flex items-center justify-between bg-rose-50 px-4 py-2 ' +
            'rounded-xl text-xs font-black uppercase tracking-wider text-rose-900'
          }
        >
          <span>IV. BEBAN OPERASIONAL & BIAYA PENDUKUNG</span>
          <span>JUMLAH</span>
        </div>
        <div className="divide-y divide-slate-100 px-2">
          {Object.entries(report.expenseBreakdown || {}).map(([cat, amt]) => (
            <div
              key={cat}
              className="flex justify-between py-2.5 text-sm text-slate-700"
            >
              <div>
                <p className="font-semibold">{cat.replaceAll('_', ' ')}</p>
                <p className="text-xs text-slate-400">
                  Beban operasional & logistik
                </p>
              </div>
              <span className="font-bold text-rose-700">-{money(amt)}</span>
            </div>
          ))}

          {Object.keys(report.expenseBreakdown || {}).length === 0 && (
            <div className="flex justify-between py-2.5 text-sm text-slate-500">
              <span>Total Beban Operasional Terdata</span>
              <span>-{money(report.operational)}</span>
            </div>
          )}

          {report.refund > 0 && (
            <div className="flex justify-between py-2.5 text-sm text-rose-700">
              <div>
                <p className="font-semibold">Refund Pengembalian Dana Customer</p>
                <p className="text-xs text-rose-400">
                  Barang out of stock / dibatalkan
                </p>
              </div>
              <span className="font-bold">-{money(report.refund)}</span>
            </div>
          )}

          <div
            className={
              'flex justify-between py-3 text-sm font-black ' +
              'bg-rose-50/40 px-2 rounded-lg text-rose-950'
            }
          >
            <span>TOTAL BEBAN OPERASIONAL & REFUND</span>
            <span>-{money(report.operational + report.refund)}</span>
          </div>
        </div>
      </div>

      {/* V. Laba Bersih */}
      <div
        className={`rounded-2xl border p-5 ${
          isProfitable
            ? 'border-emerald-300 bg-gradient-to-br from-emerald-50 to-emerald-100/40'
            : 'border-rose-300 bg-gradient-to-br from-rose-50 to-rose-100/40'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <span
              className={`text-xs font-black uppercase tracking-wider ${
                isProfitable ? 'text-emerald-800' : 'text-rose-800'
              }`}
            >
              V. LABA BERSIH OPERASIONAL (NET PROFIT)
            </span>
            <p
              className={`text-xs font-semibold mt-0.5 ${
                isProfitable ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              Laba Kotor dikurangi Beban Operasional dan Refund
            </p>
          </div>
          <div className="text-right">
            <p
              className={`text-3xl font-black ${
                isProfitable ? 'text-emerald-950' : 'text-rose-950'
              }`}
            >
              {money(report.netProfit)}
            </p>
            <span
              className={`inline-block mt-1 rounded-full px-3 py-0.5 text-xs font-black ${
                isProfitable
                  ? 'bg-emerald-200 text-emerald-900'
                  : 'bg-rose-200 text-rose-900'
              }`}
            >
              Net Profit Margin {report.margin.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
