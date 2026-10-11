import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StatusBadge } from '~/components/StatusBadge';
import { date, money } from '~/lib/format';

interface CustomerInvoicesTableProps {
  invoices: any[];
  totalInvoices: number;
  page: number;
  totalPages: number;
  pageSize: number;
  sortKey: string | null;
  sortDirection: 'asc' | 'desc' | null;
  onSort: (key: string) => void;
  onPageChange: (newPage: number) => void;
}

export function CustomerInvoicesTable({
  invoices,
  totalInvoices,
  page,
  totalPages,
  pageSize,
  sortKey,
  sortDirection,
  onSort,
  onPageChange,
}: CustomerInvoicesTableProps) {
  const navigate = useNavigate();

  const renderSortIndicator = (key: string) => {
    if (sortKey !== key || !sortDirection) {
      return (
        <ArrowUpDown
          size={12}
          className="opacity-40 group-hover:opacity-100 transition-opacity"
        />
      );
    }
    if (sortDirection === 'asc') {
      return <ArrowUp size={12} className="text-cherry-600 dark:text-cherry-400" />;
    }
    return <ArrowDown size={12} className="text-cherry-600 dark:text-cherry-400" />;
  };

  const renderHeader = (label: string, fieldKey: string) => (
    <th className="px-4 py-3">
      <button
        type="button"
        onClick={() => onSort(fieldKey)}
        className={
          'group inline-flex items-center gap-1.5 font-bold uppercase ' +
          'tracking-wider text-xs hover:text-brand-900 transition-colors'
        }
      >
        <span>{label}</span>
        {renderSortIndicator(fieldKey)}
      </button>
    </th>
  );

  return (
    <section className="card overflow-hidden">
      <div
        className={
          'flex items-center justify-between border-b border-brand-100 ' +
          'px-5 py-4 bg-brand-50/20'
        }
      >
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-cherry-500" />
          <h2 className="font-black text-brand-900">Recent Invoices</h2>
        </div>
        <span
          className={
            'text-xs font-semibold text-brand-500 bg-brand-100/70 ' +
            'px-2 py-0.5 rounded-full'
          }
        >
          {totalInvoices} invoices
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="table-head">
            <tr>
              {renderHeader('Invoice', 'invoiceNumber')}
              {renderHeader('Date', 'invoiceDate')}
              {renderHeader('Total Bill', 'totalBill')}
              {renderHeader('Balance', 'outstandingAmount')}
              {renderHeader('Status', 'status')}
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-50">
            {invoices.length ? (
              invoices.map((invoice: any) => (
                <tr
                  key={invoice.id}
                  className="cursor-pointer hover:bg-brand-50 transition"
                  onClick={() => navigate(`/invoices/${invoice.id}`)}
                >
                  <td className="table-cell font-black text-brand-900">
                    {invoice.invoice_number || invoice.invoiceNumber}
                  </td>
                  <td className="table-cell">
                    {date(invoice.invoice_date || invoice.invoiceDate)}
                  </td>
                  <td className="table-cell font-bold text-brand-900">
                    {money(invoice.total_bill ?? invoice.totalBill)}
                  </td>
                  <td className="table-cell font-semibold text-brand-700">
                    {money(invoice.outstanding_amount ?? invoice.outstandingAmount)}
                  </td>
                  <td className="table-cell">
                    <StatusBadge value={invoice.status} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-10 text-center text-sm font-medium text-brand-400"
                >
                  No invoices found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalInvoices > pageSize && (
        <div
          className={
            'flex items-center justify-between border-t border-brand-100 ' +
            'px-4 py-3 text-xs bg-brand-50/20'
          }
        >
          <span className="text-brand-500">
            {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalInvoices)} of{' '}
            {totalInvoices}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              className="btn-secondary !p-1 text-xs"
              disabled={page <= 1}
              onClick={() => onPageChange(Math.max(1, page - 1))}
            >
              <ChevronLeft size={14} />
            </button>
            <span className="font-bold text-brand-700">
              {page} / {totalPages}
            </span>
            <button
              className="btn-secondary !p-1 text-xs"
              disabled={page >= totalPages}
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
