import { useMemo, useState } from 'react';
import { ArrowUpRight, Wallet } from 'lucide-react';
import clsx from 'clsx';
import { CrudPage } from '~/components/CrudPage';
import { StatusBadge } from '~/components/StatusBadge';
import { api } from '~/lib/api';
import { money, titleCase } from '~/lib/format';
import { useAuth } from '~/context/AuthContext';
import type { FieldConfig, Option } from '~/types';
import { refundStatusOptions, refundTypeOptions, type Refund } from './types';
import { ProcessRefundModal } from './components/process-refund-modal';

const opts = (values: string[]): Option[] => values.map((value) => ({ value, label: titleCase(value) }));

const responseRows = (response: any): any[] => {
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.data)) return response.data;
  return [];
};

const loadPaginatedOptions = (endpoint: string, mapper: (row: any) => Option) => async (search: string): Promise<Option[]> => {
  const query = new URLSearchParams({ limit: '25' });
  if (search) query.set('search', search);
  const response = await api.get(`${endpoint}?${query}`);
  return responseRows(response).map(mapper);
};

const loadInvoices = loadPaginatedOptions('/invoices', (row) => ({
  value: row.id,
  label: `${row.invoiceNumber} • ${row.customer?.fullName || '-'} • remaining ${money(row.outstandingAmount)}`,
}));
const loadOrders = loadPaginatedOptions('/orders', (row) => ({
  value: row.id,
  label: `${row.orderNumber} • ${row.customer?.fullName || '-'} • ${money(row.totalBill)}`,
}));

export async function loader() {
  const [invoicesRes, ordersRes] = await Promise.allSettled([
    api.get('/invoices?limit=100'),
    api.get('/orders?limit=100'),
  ]);
  return {
    invoices: invoicesRes.status === 'fulfilled' ? responseRows(invoicesRes.value) : [],
    orders: ordersRes.status === 'fulfilled' ? responseRows(ordersRes.value) : [],
  };
}

export async function action(data: { id: string | number; status: string }) {
  return api.put(`/refunds/${data.id}`, { status: data.status });
}

export default function RefundsRoute() {
  const { user } = useAuth();
  const [processingRefund, setProcessingRefund] = useState<Refund | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fields = useMemo<FieldConfig[]>(
    () => [
      { name: 'refundNumber', label: 'Refund number' },
      { name: 'invoiceId', label: 'Invoice', type: 'select', loadOptions: loadInvoices, searchable: true },
      { name: 'orderId', label: 'Legacy order without invoice', type: 'select', loadOptions: loadOrders, searchable: true },
      { name: 'amount', label: 'Refund amount', type: 'currency', required: true },
      { name: 'reason', label: 'Reason for refund', type: 'textarea', colSpan: 2, required: true },
      {
        name: 'refundType',
        label: 'Refund Resolution Type',
        type: 'select',
        options: refundTypeOptions,
        defaultValue: 'CUSTOMER_DEPOSIT',
      },
      {
        name: 'source',
        label: 'Refund source',
        type: 'select',
        options: opts(['MANUAL', 'OVERPAYMENT', 'UNAVAILABLE_ITEM']),
        defaultValue: 'MANUAL',
      },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        options: refundStatusOptions,
        defaultValue: 'REQUESTED',
      },
      { name: 'refundedAt', label: 'Refund date & time', type: 'datetime-local' },
      { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
    ],
    []
  );

  return (
    <>
      <CrudPage
        title="Customer Refunds"
        description="Manage manual customer refunds and automated claims for overpayments or out-of-stock items."
        endpoint="/refunds"
        fields={fields}
        extraQuery={{ _v: refreshTrigger }}
        searchPlaceholder="Search refund number, customer, invoice / order, reason..."
        filters={[
          {
            key: 'status',
            label: 'Refund Status',
            placeholder: 'All Status',
            options: refundStatusOptions,
          },
          {
            key: 'refundType',
            label: 'Resolution Type',
            placeholder: 'All Types',
            options: refundTypeOptions,
          },
          {
            key: 'source',
            label: 'Claim Cause',
            placeholder: 'All Causes',
            options: [
              { label: 'Overpayment', value: 'OVERPAYMENT' },
              { label: 'Out of Stock', value: 'UNAVAILABLE_ITEM' },
              { label: 'Manual Entry', value: 'MANUAL' },
            ],
          },
        ]}
        columns={[
          { key: 'refundNumber', label: 'Refund #' },
          {
            key: 'target',
            label: 'Invoice / Order',
            render: (row) => row.invoice?.invoiceNumber || row.order?.orderNumber || '-',
          },
          {
            key: 'customer',
            label: 'Customer',
            render: (row) =>
              row.customer?.fullName ||
              row.invoice?.customer?.fullName ||
              row.order?.customer?.fullName ||
              '-',
          },
          { key: 'amount', label: 'Amount', render: (row) => <strong>{money(row.amount)}</strong> },
          {
            key: 'refundType',
            label: 'Resolution Type',
            render: (row) => (
              <span
                className={clsx(
                  'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold border',
                  row.refundType === 'CUSTOMER_DEPOSIT'
                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                    : 'bg-sky-50 text-sky-700 border-sky-200'
                )}
              >
                {row.refundType === 'CUSTOMER_DEPOSIT' ? (
                  <>
                    <Wallet size={12} className="text-purple-600" />
                    <span>Customer Deposit</span>
                  </>
                ) : (
                  <>
                    <ArrowUpRight size={12} className="text-sky-600" />
                    <span>Direct Transfer</span>
                  </>
                )}
              </span>
            ),
          },
          { key: 'source', label: 'Source', render: (row) => <StatusBadge value={row.source} /> },
          { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
        ]}
        renderActions={(row) => (
          ['REQUESTED', 'APPROVED'].includes(row.status) && (
            <button
              type="button"
              onClick={() => setProcessingRefund(row)}
              className="inline-flex items-center gap-1 rounded-xl bg-purple-600 px-2.5 py-1 text-xs font-black text-white hover:bg-purple-700 shadow-sm transition"
              title="Proses refund ini menjadi saldo deposit atau transfer langsung"
            >
              <Wallet size={12} />
              <span>Proses Refund</span>
            </button>
          )
        )}
        canDelete={user?.role === 'OWNER'}
        bulkStatus={{
          label: 'Refund status',
          options: refundStatusOptions,
          apply: (id, value) => api.put(`/refunds/${id}`, { status: value }),
        }}
      />

      <ProcessRefundModal
        open={Boolean(processingRefund)}
        refund={processingRefund}
        onClose={() => setProcessingRefund(null)}
        onSuccess={() => setRefreshTrigger((prev) => prev + 1)}
      />
    </>
  );
}
