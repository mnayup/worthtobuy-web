import {
  ArrowDownLeft,
  ArrowUpRight,
  Coins,
  Receipt,
  Sparkles,
} from 'lucide-react';
import { money } from '~/lib/format';
import type { ProfitLossReport } from '../../reports+/types';

interface OverviewCashFlowReconciliationProps {
  report: ProfitLossReport;
}

export function OverviewCashFlowReconciliation({
  report,
}: OverviewCashFlowReconciliationProps) {
  const isPositiveCashFlow = report.netCashFlow >= 0;

  return (
    <section className="card p-6">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600 ring-1 ring-emerald-200">
          <Coins size={20} />
        </div>
        <div>
          <h2 className="section-title">Arus Kas & Rekonsiliasi Keuangan</h2>
          <p className="text-xs text-slate-500">
            Pelacakan realisasi kas masuk vs arus kas keluar, beban operasional, dan laba bersih.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Real Cash Inflow
            </span>
            <ArrowDownLeft className="text-emerald-600" size={18} />
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-950">
            {money(report.verifiedCashIn)}
          </p>
          <p className="mt-1 text-xs text-emerald-700">Verified customer payments</p>
        </div>

        <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
              Total Cash Outflow
            </span>
            <ArrowUpRight className="text-rose-600" size={18} />
          </div>
          <p className="mt-2 text-2xl font-black text-rose-950">
            {money(report.cashOutflow)}
          </p>
          <p className="mt-1 text-xs text-rose-700">
            Shopping Capital + Operational Expenses + Refunds
          </p>
        </div>

        <div
          className={`rounded-2xl border p-4 ${
            isPositiveCashFlow
              ? 'border-sky-200 bg-sky-50/40'
              : 'border-amber-200 bg-amber-50/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                isPositiveCashFlow ? 'text-sky-700' : 'text-amber-800'
              }`}
            >
              Net Cash Flow
            </span>
            <Sparkles
              className={isPositiveCashFlow ? 'text-sky-600' : 'text-amber-600'}
              size={18}
            />
          </div>
          <p
            className={`mt-2 text-2xl font-black ${
              isPositiveCashFlow ? 'text-sky-950' : 'text-amber-950'
            }`}
          >
            {money(report.netCashFlow)}
          </p>
          <p
            className={`mt-1 text-xs ${
              isPositiveCashFlow ? 'text-sky-700' : 'text-amber-800'
            }`}
          >
            Difference of cash inflow received minus total cash outflow
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
              Unpaid Receivables
            </span>
            <Receipt className="text-amber-600" size={18} />
          </div>
          <p className="mt-2 text-2xl font-black text-amber-950">
            {money(report.receivables)}
          </p>
          <p className="mt-1 text-xs text-amber-700">
            Active invoice bills that are still outstanding
          </p>
        </div>
      </div>

      {/* Operating Expense Breakdown & Reconciliation */}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5">
          <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider mb-3">
            Operational Expense Breakdown ({money(report.operational)})
          </h3>
          {Object.keys(report.expenseBreakdown || {}).length === 0 ? (
            <p className="text-xs text-slate-400 py-3">
              No operational expenses recorded yet.
            </p>
          ) : (
            <div className="space-y-2">
              {Object.entries(report.expenseBreakdown).map(([cat, amt]) => (
                <div
                  key={cat}
                  className={
                    'flex items-center justify-between rounded-xl bg-white ' +
                    'p-3 border border-slate-100 shadow-2xs'
                  }
                >
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    {cat.replaceAll('_', ' ')}
                  </span>
                  <strong className="text-sm font-extrabold text-slate-900">
                    {money(amt)}
                  </strong>
                </div>
              ))}
            </div>
          )}
          {report.refund > 0 && (
            <div
              className={
                'mt-3 flex items-center justify-between rounded-xl ' +
                'bg-rose-50/60 p-3 border border-rose-100'
              }
            >
              <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
                Refunds Returned to Customers
              </span>
              <strong className="text-sm font-extrabold text-rose-800">
                -{money(report.refund)}
              </strong>
            </div>
          )}
          {Boolean(report.shopeeRefund && report.shopeeRefund > 0) && (
            <div
              className={
                'mt-2 flex items-center justify-between rounded-xl ' +
                'bg-amber-50/70 p-3 border border-amber-200'
              }
            >
              <div>
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
                  Shopee Checkout Offsets
                </span>
                <span className="text-[10px] text-amber-600">
                  Dikeluarkan dari beban kas masuk/keluar (ditalangi via Shopee)
                </span>
              </div>
              <strong className="text-sm font-extrabold text-amber-900">
                {money(report.shopeeRefund || 0)}
              </strong>
            </div>
          )}
        </div>

        <div
          className={
            'rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 ' +
            'flex flex-col justify-between'
          }
        >
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider mb-3">
              Rekonsiliasi Net Operational Profit
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1 text-slate-600">
                <span>Total Invoice Revenue (Gross Revenue)</span>
                <strong className="text-slate-900">{money(report.omzet)}</strong>
              </div>
              <div className="flex justify-between py-1 text-amber-700">
                <span>Actual Shopping Capital (COGS)</span>
                <strong>-{money(report.actualBuyPrice)}</strong>
              </div>
              <div
                className={
                  'flex justify-between py-1 border-t border-slate-200 ' +
                  'font-bold text-slate-800'
                }
              >
                <span>Gross Profit</span>
                <span>{money(report.grossProfit)}</span>
              </div>
              <div className="flex justify-between py-1 text-rose-600">
                <span>Total Operational Costs</span>
                <strong>-{money(report.operational)}</strong>
              </div>
              {report.refund > 0 && (
                <div className="flex justify-between py-1 text-rose-600">
                  <span>Customer Refunds</span>
                  <strong>-{money(report.refund)}</strong>
                </div>
              )}
              <div
                className={
                  'flex justify-between py-2.5 border-t-2 border-slate-300 ' +
                  'font-black text-base text-slate-950'
                }
              >
                <span>Net Operational Profit (Net Profit)</span>
                <span className={report.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                  {money(report.netProfit)}
                </span>
              </div>
            </div>
          </div>

          <div
            className={
              'mt-4 rounded-xl bg-emerald-50 p-3.5 text-xs text-emerald-900 ' +
              'border border-emerald-200/80 flex items-center justify-between'
            }
          >
            <div>
              <p className="font-bold">Net Profit Margin</p>
              <p className="text-[11px] text-emerald-700">
                Percentage of net profit against total revenue
              </p>
            </div>
            <span className="text-xl font-black text-emerald-800">
              {report.margin.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
