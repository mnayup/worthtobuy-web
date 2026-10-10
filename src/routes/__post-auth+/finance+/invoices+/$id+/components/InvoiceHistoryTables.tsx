import React from 'react';
import { ArrowUpDown, History, WalletCards } from 'lucide-react';
import clsx from 'clsx';
import { dateTime, money, titleCase } from '~/lib/format';
import { StatusBadge } from '~/components/StatusBadge';
import type { PaymentSortCol, RefundSortCol, SortDir } from '../types';

interface InvoiceHistoryTablesProps {
  sortedPayments: any[];
  paymentSortCol: PaymentSortCol;
  paymentSortDir: SortDir;
  onSortPayment: (col: NonNullable<PaymentSortCol>) => void;
  sortedRefunds: any[];
  refundSortCol: RefundSortCol;
  refundSortDir: SortDir;
  onSortRefund: (col: NonNullable<RefundSortCol>) => void;
}

export function InvoiceHistoryTables({
  sortedPayments,
  paymentSortCol,
  paymentSortDir,
  onSortPayment,
  sortedRefunds,
  refundSortCol,
  refundSortDir,
  onSortRefund,
}: InvoiceHistoryTablesProps) {
  return (
    <div className="no-print mx-auto mt-6 grid max-w-[980px] gap-5 lg:grid-cols-2">
      {/* Installment Payments */}
      <section className="card overflow-hidden">
        <div
          className={
            'flex items-center justify-between border-b border-brand-100 px-5 py-4 bg-brand-50/40'
          }
        >
          <div className="flex items-center gap-2">
            <History size={18} className="text-cherry-500" />
            <h2 className="font-extrabold text-brand-900">Installment Payments</h2>
          </div>
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="min-w-full divide-y divide-brand-100">
            <thead className="table-head">
              <tr>
                <PaymentHeader
                  label="Date"
                  col="date"
                  activeCol={paymentSortCol}
                  dir={paymentSortDir}
                  onSort={onSortPayment}
                />
                <PaymentHeader
                  label="Method"
                  col="method"
                  activeCol={paymentSortCol}
                  dir={paymentSortDir}
                  onSort={onSortPayment}
                />
                <PaymentHeader
                  label="Amount"
                  col="amount"
                  activeCol={paymentSortCol}
                  dir={paymentSortDir}
                  onSort={onSortPayment}
                />
                <PaymentHeader
                  label="Status"
                  col="status"
                  activeCol={paymentSortCol}
                  dir={paymentSortDir}
                  onSort={onSortPayment}
                />
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100 bg-white">
              {sortedPayments.length ? (
                sortedPayments.map((payment: any) => (
                  <tr key={payment.id} className="hover:bg-brand-50/50">
                    <td className="table-cell">{dateTime(payment.paymentDate)}</td>
                    <td className="table-cell">
                      <p className="font-bold text-brand-800">{payment.method}</p>
                      <p className="text-[11px] text-brand-400">{payment.paymentNumber}</p>
                    </td>
                    <td className="table-cell font-black">{money(payment.amount)}</td>
                    <td className="table-cell">
                      <StatusBadge value={payment.status} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-sm text-brand-400">
                    No payments recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Refund History */}
      <section className="card overflow-hidden">
        <div className="flex items-center gap-2 border-b border-brand-100 px-5 py-4 bg-brand-50/40">
          <WalletCards size={18} className="text-honey-500" />
          <h2 className="font-extrabold text-brand-900">Refund History</h2>
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="min-w-full divide-y divide-brand-100">
            <thead className="table-head">
              <tr>
                <RefundHeader
                  label="Refund #"
                  col="number"
                  activeCol={refundSortCol}
                  dir={refundSortDir}
                  onSort={onSortRefund}
                />
                <RefundHeader
                  label="Reason"
                  col="reason"
                  activeCol={refundSortCol}
                  dir={refundSortDir}
                  onSort={onSortRefund}
                />
                <RefundHeader
                  label="Amount"
                  col="amount"
                  activeCol={refundSortCol}
                  dir={refundSortDir}
                  onSort={onSortRefund}
                />
                <RefundHeader
                  label="Status"
                  col="status"
                  activeCol={refundSortCol}
                  dir={refundSortDir}
                  onSort={onSortRefund}
                />
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100 bg-white">
              {sortedRefunds.length ? (
                sortedRefunds.map((refund: any) => (
                  <tr key={refund.id} className="hover:bg-brand-50/50">
                    <td className="table-cell">
                      <p className="font-bold text-brand-800">{refund.refundNumber}</p>
                      <p className="text-[11px] text-brand-400">
                        {refund.autoGenerated ? 'Automatic' : 'Manual'} •{' '}
                        {titleCase(refund.source)}
                      </p>
                    </td>
                    <td className="max-w-[240px] px-4 py-3 text-sm text-brand-600">
                      {refund.reason}
                    </td>
                    <td className="table-cell font-black">{money(refund.amount)}</td>
                    <td className="table-cell">
                      <StatusBadge value={refund.status} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-sm text-brand-400">
                    No refunds recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function PaymentHeader({
  label,
  col,
  activeCol,
  dir,
  onSort,
}: {
  label: string;
  col: NonNullable<PaymentSortCol>;
  activeCol: PaymentSortCol;
  dir: SortDir;
  onSort: (c: NonNullable<PaymentSortCol>) => void;
}) {
  const isMatch = activeCol === col;
  return (
    <th
      className="px-4 py-3 cursor-pointer hover:bg-brand-100 select-none group"
      onClick={() => onSort(col)}
    >
      <div className="inline-flex items-center gap-1.5">
        <span className={clsx(isMatch && 'text-cherry-600 font-extrabold')}>{label}</span>
        <ArrowUpDown
          size={12}
          className={clsx(
            isMatch ? 'text-cherry-600 opacity-100' : 'opacity-40 group-hover:opacity-100'
          )}
        />
      </div>
    </th>
  );
}

function RefundHeader({
  label,
  col,
  activeCol,
  dir,
  onSort,
}: {
  label: string;
  col: NonNullable<RefundSortCol>;
  activeCol: RefundSortCol;
  dir: SortDir;
  onSort: (c: NonNullable<RefundSortCol>) => void;
}) {
  const isMatch = activeCol === col;
  return (
    <th
      className="px-4 py-3 cursor-pointer hover:bg-brand-100 select-none group"
      onClick={() => onSort(col)}
    >
      <div className="inline-flex items-center gap-1.5">
        <span className={clsx(isMatch && 'text-cherry-600 font-extrabold')}>{label}</span>
        <ArrowUpDown
          size={12}
          className={clsx(
            isMatch ? 'text-cherry-600 opacity-100' : 'opacity-40 group-hover:opacity-100'
          )}
        />
      </div>
    </th>
  );
}
