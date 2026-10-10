import React from 'react';
import { dateTime, money } from '~/lib/format';
import { StatusBadge } from '~/components/StatusBadge';

interface InvoiceA4PaymentHistoryProps {
  invoiceNumber: string;
  paymentsChronological: any[];
}

export function InvoiceA4PaymentHistory({
  invoiceNumber,
  paymentsChronological,
}: InvoiceA4PaymentHistoryProps) {
  return (
    <section className="print-only print-payment-history mt-8 border-t border-brand-100 pt-6">
      <div className="mb-3 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-[.08em] text-brand-900">
            Payment History Record
          </p>
          <p className="mt-1 text-xs font-medium text-brand-500">
            Detailed payment transaction log for invoice {invoiceNumber}.
          </p>
        </div>
        <p className="text-xs font-bold text-brand-600">
          {paymentsChronological.length} transactions
        </p>
      </div>
      <table
        className="min-w-full border-collapse overflow-hidden rounded-xl border border-brand-100"
      >
        <thead className="table-head">
          <tr>
            <th className="px-2.5 py-2">#</th>
            <th className="px-2.5 py-2">Date</th>
            <th className="px-2.5 py-2">Method / Ref</th>
            <th className="px-2.5 py-2">Notes</th>
            <th className="px-2.5 py-2 text-right">Amount</th>
            <th className="px-2.5 py-2">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-100">
          {paymentsChronological.length ? (
            paymentsChronological.map((payment: any, index: number) => (
              <tr key={payment.id}>
                <td className="px-2.5 py-2 text-xs font-black text-brand-900">
                  {index + 1}
                </td>
                <td
                  className="whitespace-nowrap px-2.5 py-2 text-[11px] font-semibold text-brand-700"
                >
                  {dateTime(payment.paymentDate)}
                </td>
                <td className="px-2.5 py-2">
                  <p className="text-[11px] font-extrabold text-brand-900">
                    {payment.method || '-'}
                  </p>
                  <p className="text-[10px] text-brand-400">
                    {payment.paymentNumber || '-'}
                  </p>
                </td>
                <td
                  className="max-w-[190px] px-2.5 py-2 text-[11px] leading-relaxed text-brand-600"
                >
                  {payment.notes || '-'}
                </td>
                <td
                  className={
                    'whitespace-nowrap px-2.5 py-2 text-right text-xs font-black text-brand-900'
                  }
                >
                  {money(payment.amount)}
                </td>
                <td className="px-2.5 py-2">
                  <StatusBadge value={payment.status} />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="px-4 py-6 text-center text-xs font-medium text-brand-400">
                No payments recorded yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}
