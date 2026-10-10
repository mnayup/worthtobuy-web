import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import clsx from 'clsx';
import { type Invoice } from '../types';
import {
  type SortColumn,
  type SortDirection,
} from '../helpers/invoice-sort.helper';
import { InvoicesTableRow } from './invoices-table-row';

interface InvoicesTableProps {
  invoices: Invoice[];
  loading: boolean;
  canDeleteInvoices?: boolean;
  allInvoicesSelected: boolean;
  someInvoicesSelected: boolean;
  selectedInvoiceIds: number[];
  sortCol: SortColumn | null;
  sortDir: SortDirection;
  onSortToggle: (col: SortColumn) => void;
  onToggleAll: (checked: boolean) => void;
  onToggleOne: (id: number, checked: boolean) => void;
  onDeleteOne?: (invoice: Invoice) => void;
}

const thCls =
  'px-4 py-3.5 text-left font-bold cursor-pointer hover:bg-brand-100/80 ' +
  'select-none group';

export function InvoicesTable({
  invoices,
  loading,
  canDeleteInvoices,
  allInvoicesSelected,
  someInvoicesSelected,
  selectedInvoiceIds,
  sortCol,
  sortDir,
  onSortToggle,
  onToggleAll,
  onToggleOne,
  onDeleteOne,
}: InvoicesTableProps) {
  const renderSortIndicator = (col: SortColumn) => {
    const isActive = sortCol === col && Boolean(sortDir);
    return (
      <span
        className={clsx(
          'inline-flex items-center justify-center rounded p-0.5 transition-all',
          isActive
            ? 'text-cherry-600 bg-cherry-50'
            : 'text-brand-300 opacity-60 group-hover:opacity-100 group-hover:text-brand-600'
        )}
      >
        {sortCol === col && sortDir === 'asc' ? (
          <ArrowUp size={13} className="stroke-[2.5]" />
        ) : sortCol === col && sortDir === 'desc' ? (
          <ArrowDown size={13} className="stroke-[2.5]" />
        ) : (
          <ArrowUpDown size={13} />
        )}
      </span>
    );
  };

  const columns: { key: SortColumn; label: string }[] = [
    { key: 'invoiceNumber', label: 'Invoice' },
    { key: 'customer', label: 'Customer' },
    { key: 'event', label: 'Event' },
    { key: 'totalBill', label: 'Total Bill' },
    { key: 'paidAmount', label: 'Paid / Balance' },
    { key: 'dueDate', label: 'Due Date' },
    { key: 'status', label: 'Status' },
  ];

  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="min-w-full divide-y divide-brand-100">
        <thead className="table-head">
          <tr>
            {canDeleteInvoices && (
              <th className="w-12 px-4 py-3.5 text-center">
                <input
                  type="checkbox"
                  className={
                    'h-4 w-4 cursor-pointer rounded border-brand-300 ' +
                    'accent-cherry-500 transition focus:ring-2 focus:ring-cherry-400'
                  }
                  aria-label="Select all invoices"
                  checked={allInvoicesSelected}
                  ref={(input) => {
                    if (input) {
                      input.indeterminate = Boolean(
                        someInvoicesSelected && !allInvoicesSelected
                      );
                    }
                  }}
                  onChange={(e) => onToggleAll(e.target.checked)}
                  disabled={loading || invoices.length === 0}
                />
              </th>
            )}
            {columns.map(({ key, label }) => (
              <th
                key={key}
                onClick={() => onSortToggle(key)}
                className={thCls}
              >
                <div className="inline-flex items-center gap-1.5">
                  <span
                    className={clsx(
                      sortCol === key && sortDir && 'text-cherry-600 font-extrabold'
                    )}
                  >
                    {label}
                  </span>
                  {renderSortIndicator(key)}
                </div>
              </th>
            ))}
            <th className="px-4 py-3.5 text-right font-bold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-100/70 bg-white">
          {loading ? (
            Array.from({ length: 5 }).map((_, idx) => (
              <tr key={idx} className="animate-pulse">
                {Array.from({ length: canDeleteInvoices ? 9 : 8 }).map((__, c) => (
                  <td key={c} className="px-4 py-4">
                    <div className="h-4 w-24 rounded-md bg-brand-100" />
                  </td>
                ))}
              </tr>
            ))
          ) : invoices.length ? (
            invoices.map((invoice) => (
              <InvoicesTableRow
                key={invoice.id}
                invoice={invoice}
                canDeleteInvoices={canDeleteInvoices}
                isSelected={selectedInvoiceIds.includes(invoice.id)}
                onToggle={(checked) => onToggleOne(invoice.id, checked)}
                onDelete={onDeleteOne ? () => onDeleteOne(invoice) : undefined}
              />
            ))
          ) : (
            <tr>
              <td
                colSpan={canDeleteInvoices ? 9 : 8}
                className="px-6 py-16 text-center text-sm font-medium text-brand-400"
              >
                No invoices match the current filter.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
