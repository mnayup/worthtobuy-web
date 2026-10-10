import React from 'react';
import { Download } from 'lucide-react';
import { dateTime, money, number } from '~/lib/format';
import type { WeeklyReport } from '../types';

export function ReportMetric({
  label,
  value,
  caption,
}: {
  label: string;
  value: string;
  caption?: string;
}) {
  return (
    <div className="rounded-2xl border border-brand-100 bg-white p-4 shadow-xs">
      <p className="text-[10px] font-extrabold uppercase tracking-[.1em] text-brand-400">
        {label}
      </p>
      <p className="mt-2 text-xl font-black text-brand-900 tracking-tight">{value}</p>
      {caption && <p className="mt-1 text-[10px] font-semibold text-brand-500">{caption}</p>}
    </div>
  );
}

export function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-brand-50 p-3 border border-brand-100/60">
      <p className="font-bold text-brand-400 text-xs">{label}</p>
      <p className="mt-1 font-black text-brand-800 text-sm">{value}</p>
    </div>
  );
}

interface ReportCardProps {
  report: WeeklyReport;
  onPrint: () => void;
}

export function ReportCard({ report, onPrint }: ReportCardProps) {
  const marginPct = Number(report.financialHealth.marginPercent || 0).toFixed(2);

  return (
    <section className="card mt-6 overflow-hidden">
      <div
        className={
          'flex flex-col gap-3 border-b border-brand-100 bg-brand-50/50 px-5 py-4 ' +
          'sm:flex-row sm:items-center sm:justify-between'
        }
      >
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[.12em] text-cherry-600">
            AI Business Report
          </p>
          <h2 className="mt-1 text-xl font-black text-brand-900 tracking-tight">
            {report.title}
          </h2>
          <p className="mt-1 text-xs font-semibold text-brand-500">
            {report.periodLabel} • generated {dateTime(report.generatedAt)}
          </p>
        </div>
        <button
          className="btn-secondary !bg-white hover:!bg-brand-50 cursor-pointer"
          onClick={onPrint}
        >
          <Download size={16} /> Export PDF
        </button>
      </div>

      <div className="p-5 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <ReportMetric
            label="Total Revenue"
            value={money(report.businessSummary.totalRevenue)}
          />
          <ReportMetric
            label="Transactions"
            value={number(report.businessSummary.transactions)}
          />
          <ReportMetric
            label="Payments Received"
            value={money(report.financialHealth.paymentsReceived)}
          />
          <ReportMetric
            label="Net Profit"
            value={money(report.financialHealth.profit)}
            caption={`Margin ${marginPct}%`}
          />
          {report.businessSummary.newCustomers !== null && (
            <ReportMetric
              label="New Customers"
              value={number(report.businessSummary.newCustomers)}
            />
          )}
          {report.businessSummary.repeatCustomers !== null && (
            <ReportMetric
              label="Repeat Customers"
              value={number(report.businessSummary.repeatCustomers)}
            />
          )}
          <ReportMetric
            label="Outstanding"
            value={money(report.financialHealth.outstanding)}
            caption={`${number(report.financialHealth.overdueInvoices)} overdue invoices`}
          />
          <ReportMetric
            label="Total Expenses"
            value={money(report.financialHealth.expenses)}
          />
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <article className="rounded-2xl border border-brand-100 bg-white p-5">
            <h3 className="font-black text-brand-900">Executive Business Summary</h3>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-brand-600">
              {report.executiveSummary}
            </p>
          </article>
          <article className="rounded-2xl border border-brand-100 bg-white p-5">
            <h3 className="font-black text-brand-900">Financial Health</h3>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-brand-600">
              {report.financialCommentary}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <MiniMetric
                label="Capital / COGS"
                value={money(report.financialHealth.capital)}
              />
              <MiniMetric
                label="Refunds"
                value={money(report.financialHealth.refunds)}
              />
            </div>
          </article>
        </div>

        {report.operationalMetrics && (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <ReportMetric
              label="Pending Purchase"
              value={number(report.operationalMetrics.pendingPurchase)}
            />
            <ReportMetric
              label="Purchased (Not Ready)"
              value={number(report.operationalMetrics.purchasedNotReady)}
            />
            <ReportMetric
              label="Waiting Shipment"
              value={number(report.operationalMetrics.waitingShipment)}
            />
            <ReportMetric
              label="In Transit"
              value={number(report.operationalMetrics.customerNotReceived)}
            />
          </div>
        )}

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <article className="rounded-2xl border border-brand-100 bg-brand-50/50 p-5">
            <h3 className="font-black text-brand-900">Operational Issues</h3>
            <div className="mt-3 space-y-3">
              {report.operationalIssues.length ? (
                report.operationalIssues.map((issue, index) => (
                  <div
                    key={`${issue.title}-${index}`}
                    className="rounded-xl bg-white p-3.5 shadow-xs border border-brand-100/60"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-black text-brand-800">{issue.title}</p>
                      <span
                        className={
                          'rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase ' +
                          (issue.severity === 'HIGH'
                            ? 'bg-rose-100 text-rose-700'
                            : issue.severity === 'MEDIUM'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700')
                        }
                      >
                        {issue.severity}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-brand-600 font-medium">
                      {issue.detail}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-brand-400">
                  No critical operational issues detected.
                </p>
              )}
            </div>
          </article>

          <article className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
            <h3 className="font-black text-brand-900">Priority Action Items</h3>
            <ol className="mt-3 space-y-3">
              {report.recommendations.map((recommendation, index) => (
                <li
                  key={`${recommendation}-${index}`}
                  className="flex gap-3 text-sm leading-6 text-brand-800"
                >
                  <span
                    className={
                      'grid h-7 w-7 shrink-0 place-items-center rounded-full ' +
                      'bg-brand-900 text-xs font-black text-white'
                    }
                  >
                    {index + 1}
                  </span>
                  <span className="font-medium">{recommendation}</span>
                </li>
              ))}
            </ol>
          </article>
        </div>

        {Boolean(report.caveats.length) && (
          <div
            className={
              'mt-5 rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 ' +
              'text-xs leading-5 text-brand-500 font-medium'
            }
          >
            <strong className="font-bold text-brand-800">Data note:</strong>{' '}
            {report.caveats.join(' • ')}
          </div>
        )}
      </div>
    </section>
  );
}
