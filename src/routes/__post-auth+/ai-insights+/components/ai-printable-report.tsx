import React from 'react';
import { dateTime, money, number } from '~/lib/format';
import type { WeeklyReport } from '../types';

export function PrintableReport({ report }: { report: WeeklyReport }) {
  const marginStr = `${Number(report.financialHealth.marginPercent || 0).toFixed(2)}%`;

  return (
    <div className="print-only p-4 text-[#302125]">
      <div className="border-b-2 border-brand-900 pb-4">
        <p className="text-sm font-bold text-brand-500">WORTHTOBUY</p>
        <h1 className="mt-1 text-2xl font-black">{report.title}</h1>
        <p className="mt-1 text-sm text-brand-600">
          {report.periodLabel} • {dateTime(report.generatedAt)}
        </p>
      </div>

      <h2 className="mt-6 text-lg font-black">1. Executive Business Summary</h2>
      <table className="mt-3 w-full border-collapse text-sm">
        <tbody>
          {[
            ['Total Revenue', money(report.businessSummary.totalRevenue)],
            ['Transactions', number(report.businessSummary.transactions)],
            [
              'New Customers',
              report.businessSummary.newCustomers === null
                ? 'Restricted to Finance role'
                : number(report.businessSummary.newCustomers),
            ],
            [
              'Repeat Customers',
              report.businessSummary.repeatCustomers === null
                ? 'Restricted to Finance role'
                : number(report.businessSummary.repeatCustomers),
            ],
          ].map(([label, value]) => (
            <tr key={String(label)}>
              <td className="border border-slate-300 p-2 font-bold">{label}</td>
              <td className="border border-slate-300 p-2">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-6">{report.executiveSummary}</p>

      <h2 className="mt-6 text-lg font-black">2. Financial Health</h2>
      <table className="mt-3 w-full border-collapse text-sm">
        <tbody>
          {[
            ['Payments Received', money(report.financialHealth.paymentsReceived)],
            ['Outstanding', money(report.financialHealth.outstanding)],
            ['Overdue Invoices', number(report.financialHealth.overdueInvoices)],
            ['Capital / COGS', money(report.financialHealth.capital)],
            ['Expenses', money(report.financialHealth.expenses)],
            ['Refunds', money(report.financialHealth.refunds)],
            ['Net Profit', money(report.financialHealth.profit)],
            ['Margin', marginStr],
          ].map(([label, value]) => (
            <tr key={String(label)}>
              <td className="border border-slate-300 p-2 font-bold">{label}</td>
              <td className="border border-slate-300 p-2">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-6">
        {report.financialCommentary}
      </p>

      <h2 className="mt-6 text-lg font-black">3. Operational Issues</h2>
      {report.operationalIssues.length ? (
        <ul className="mt-3 space-y-2 text-sm">
          {report.operationalIssues.map((issue, index) => (
            <li key={index}>
              <strong>
                {issue.title} ({issue.severity}):
              </strong>{' '}
              {issue.detail}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm">No critical operational issues detected.</p>
      )}

      <h2 className="mt-6 text-lg font-black">4. Recommendations</h2>
      <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm">
        {report.recommendations.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ol>
      {Boolean(report.caveats.length) && (
        <p className="mt-6 border-t border-slate-300 pt-3 text-xs">
          <strong>Data Notes:</strong> {report.caveats.join(' • ')}
        </p>
      )}
    </div>
  );
}
