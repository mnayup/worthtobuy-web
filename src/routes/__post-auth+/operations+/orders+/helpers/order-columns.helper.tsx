import React from 'react';
import type { NavigateFunction } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { money } from '~/lib/format';
import { StatusBadge } from '~/components/StatusBadge';

export function getOrderColumns() {
  return [
    { key: 'orderNumber', label: 'Order Number' },
    {
      key: 'customer',
      label: 'Customer',
      render: (row: any) => row.customer?.fullName,
    },
    {
      key: 'period',
      label: 'Event',
      render: (row: any) =>
        row.period ? (
          <div className="flex flex-col">
            <span className="font-semibold text-brand-900">{row.period.name}</span>
            <span className="text-[11px] text-brand-400 font-medium">{row.period.code}</span>
          </div>
        ) : (
          '-'
        ),
    },
    {
      key: 'item',
      label: 'Items',
      render: (row: any) =>
        row.items?.[0]?.product?.name || row.items?.[0]?.manualProductName || '-',
    },
    {
      key: 'feeMode',
      label: 'Fee Mode',
      render: (row: any) => {
        if (row.serviceFeeMode === 'AUTO_RESELLER') {
          return (
            <span className="pill bg-indigo-50 text-indigo-700 border border-indigo-200">
              Auto (Reseller)
            </span>
          );
        }
        if (row.serviceFeeMode === 'AUTO' || row.serviceFeeMode === 'AUTO_CUSTOMER') {
          return (
            <span className="pill bg-cherry-50 text-cherry-700 border border-cherry-200">
              Auto (Customer)
            </span>
          );
        }
        return (
          <span className="pill bg-slate-100 text-slate-700 border border-slate-200">
            Manual
          </span>
        );
      },
    },
    {
      key: 'totalBill',
      label: 'Total',
      render: (row: any) => <strong>{money(row.totalBill)}</strong>,
    },
    {
      key: 'outstandingAmount',
      label: 'Balance',
      render: (row: any) => (
        <span
          className={
            Number(row.outstandingAmount) > 0
              ? 'font-semibold text-cherry-600'
              : 'text-emerald-600 font-semibold'
          }
        >
          {money(row.outstandingAmount)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row: any) => <StatusBadge value={row.status} />,
    },
  ];
}

export function renderOrderActions(
  row: any,
  navigate: NavigateFunction,
  setInvoiceModal: (id: number) => void
) {
  const invoiceId = row.invoiceLinks?.[0]?.invoiceId;
  return (
    <div className="flex gap-1">
      <button
        onClick={() => {
          if (invoiceId) {
            navigate(`/invoices/${invoiceId}?from=orders`);
          } else {
            setInvoiceModal(row.id);
          }
        }}
        className="rounded-xl p-2 text-cherry-500 hover:bg-cherry-50 transition cursor-pointer"
        title={invoiceId ? 'Open Invoice' : 'Create Invoice'}
      >
        <FileText size={16} />
      </button>
    </div>
  );
}
