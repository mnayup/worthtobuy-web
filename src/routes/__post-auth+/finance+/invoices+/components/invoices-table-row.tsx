import { useNavigate } from 'react-router-dom';
import { Eye, Printer, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import { date, money } from '~/lib/format';
import { StatusBadge } from '~/components/StatusBadge';
import { type Invoice } from '../types';

interface InvoicesTableRowProps {
  invoice: Invoice;
  canDeleteInvoices?: boolean;
  isSelected: boolean;
  onToggle: (checked: boolean) => void;
  onDelete?: () => void;
}

export function InvoicesTableRow({
  invoice,
  canDeleteInvoices,
  isSelected,
  onToggle,
  onDelete,
}: InvoicesTableRowProps) {
  const navigate = useNavigate();

  const overdue =
    invoice.dueDate &&
    new Date(invoice.dueDate) < new Date() &&
    Number(invoice.outstandingAmount) > 0;

  const eventCodes = [
    ...new Set<string>(
      (invoice.orders || [])
        .map((link: any) => String(link.order?.period?.code || ''))
        .filter(Boolean)
    ),
  ];

  const hasDp =
    invoice.billingModel === 'DP' ||
    (invoice.dpAmount && Number(invoice.dpAmount) > 0);

  return (
    <tr
      className={clsx(
        'transition-colors duration-100',
        isSelected
          ? 'bg-cherry-50/60 hover:bg-cherry-50/80'
          : 'hover:bg-brand-50/80'
      )}
    >
      {canDeleteInvoices && (
        <td className="w-12 px-4 py-3.5 text-center">
          <input
            type="checkbox"
            className={
              'h-4 w-4 cursor-pointer rounded border-brand-300 ' +
              'accent-cherry-500 transition focus:ring-2 focus:ring-cherry-400'
            }
            aria-label={`Select invoice ${invoice.invoiceNumber}`}
            checked={isSelected}
            onChange={(e) => onToggle(e.target.checked)}
          />
        </td>
      )}

      <td className="table-cell">
        <div className="flex items-center gap-1.5">
          <p className="font-extrabold text-brand-900">{invoice.invoiceNumber}</p>
          {hasDp && (
            <span
              className={
                'rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] ' +
                'font-black text-amber-800'
              }
            >
              DP {invoice.dpPercent || 50}%
            </span>
          )}
          {Number(invoice.depositAmount) > 0 && (
            <span
              className={
                'rounded-md bg-purple-100 px-1.5 py-0.5 text-[10px] ' +
                'font-black text-purple-800'
              }
              title={`Potongan Saldo Deposit: ${money(invoice.depositAmount)}`}
            >
              Deposit: -{money(invoice.depositAmount)}
            </span>
          )}
        </div>
        <p className="text-[11px] font-semibold text-brand-400">
          {invoice.orders?.length || 0} orders linked
        </p>
      </td>

      <td className="table-cell">
        <p className="font-bold text-brand-800">{invoice.customer?.fullName}</p>
        <p className="text-xs text-brand-400">{invoice.customer?.whatsapp}</p>
      </td>

      <td className="table-cell">
        <div className="flex max-w-[220px] flex-wrap gap-1">
          {eventCodes.length ? (
            eventCodes.map((code: string) => (
              <span key={code} className="pill text-[11px] !py-0.5">
                {code}
              </span>
            ))
          ) : (
            <span className="text-xs text-brand-300">-</span>
          )}
        </div>
      </td>

      <td className="table-cell font-black text-brand-900">
        {money(invoice.totalBill)}
      </td>

      <td className="table-cell">
        <p className="font-bold text-emerald-600">{money(invoice.paidAmount)}</p>
        {hasDp && Number(invoice.paidAmount || 0) === 0 ? (
          <p className="text-xs font-bold text-amber-600">
            Bill DP: {money(invoice.dpAmount || Math.round(Number(invoice.totalBill) * 0.5))}
          </p>
        ) : (
          <p className="text-xs text-cherry-500 font-semibold">
            Due: {money(invoice.outstandingAmount)}
          </p>
        )}
      </td>

      <td className="table-cell">
        <p className={overdue ? 'font-black text-rose-600' : 'text-brand-700'}>
          {date(invoice.dueDate)}
        </p>
        {overdue && <p className="text-[11px] font-bold text-rose-500">Overdue</p>}
      </td>

      <td className="table-cell">
        <StatusBadge value={invoice.status} />
      </td>

      <td className="px-4 py-3.5 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => navigate(`/invoices/${invoice.id}`)}
            className={
              'rounded-xl p-2 text-brand-500 transition ' +
              'hover:bg-brand-100 hover:text-brand-900'
            }
            title="View Invoice"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => navigate(`/invoices/${invoice.id}?print=1`)}
            className="rounded-xl p-2 text-cherry-600 transition hover:bg-cherry-50"
            title="Print Invoice"
          >
            <Printer size={16} />
          </button>
          {onDelete && (
            <button
              onClick={onDelete}
              className={
                'rounded-xl p-2 text-rose-500 transition ' +
                'hover:bg-rose-50 hover:text-rose-700'
              }
              title="Move to Trash"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
