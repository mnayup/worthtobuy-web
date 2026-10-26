import { useMemo } from 'react';
import { CrudPage } from '~/components/CrudPage';
import { StatusBadge } from '~/components/StatusBadge';
import { SafeProofImage } from '~/components/SafeProofImage';
import { api } from '~/lib/api';
import { date, money } from '~/lib/format';
import { useAuth } from '~/context/AuthContext';
import type { FieldConfig, Option } from '~/types';
import { paymentStatusOptions } from './types';

const responseRows = (response: any): any[] => {
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.data)) return response.data;
  return [];
};

const loadPaginatedOptions =
  (endpoint: string, mapper: (row: any) => Option) =>
  async (search: string): Promise<Option[]> => {
    const query = new URLSearchParams({ limit: '25' });
    if (search) query.set('search', search);
    const response = await api.get(`${endpoint}?${query}`);
    return responseRows(response).map(mapper);
  };

const loadInvoices = loadPaginatedOptions('/invoices', (row) => {
  const num = row.invoice_number || row.invoiceNumber;
  const cust = row.customer?.full_name || row.customer?.fullName || '-';
  const rem = money(row.outstanding_amount ?? row.outstandingAmount);
  return { value: row.id, label: `${num} • ${cust} • remaining ${rem}` };
});

const loadOrders = loadPaginatedOptions('/orders', (row) => {
  const num = row.order_number || row.orderNumber;
  const cust = row.customer?.full_name || row.customer?.fullName || '-';
  const total = money(row.total_bill ?? row.totalBill);
  return { value: row.id, label: `${num} • ${cust} • ${total}` };
});

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
  return api.put(`/payments/${data.id}`, { status: data.status });
}

export default function PaymentsRoute() {
  const { user, hasPermission } = useAuth();
  const fields = useMemo<FieldConfig[]>(
    () => [
      { name: 'paymentNumber', label: 'Payment number' },
      {
        name: 'invoiceId',
        label: 'Invoice (recommended)',
        type: 'select',
        loadOptions: loadInvoices,
        searchable: true,
      },
      {
        name: 'orderId',
        label: 'Legacy order without invoice',
        type: 'select',
        loadOptions: loadOrders,
        searchable: true,
      },
      { name: 'paymentDate', label: 'Payment date', type: 'datetime-local' },
      { name: 'amount', label: 'Amount', type: 'currency', required: true },
      {
        name: 'method',
        label: 'Method',
        type: 'select',
        options: [
          'Bank Transfer',
          'QRIS',
          'E-Wallet',
          'Cash',
          'Credit Card',
          'Payment Gateway',
          'Shopee Checkout',
        ].map((value) => ({ value, label: value })),
        required: true,
      },
      { name: 'destinationAccount', label: 'Destination bank / account' },
      {
        name: 'proofUrl',
        label: 'Proof of payment / Receipt',
        type: 'file',
        entityType: 'payments',
        fileType: 'all',
        colSpan: 2,
      },
      {
        name: 'status',
        label: 'Verification status',
        type: 'select',
        options: paymentStatusOptions,
        defaultValue: 'PENDING',
      },
      { name: 'notes', label: 'Installment / payment notes', type: 'textarea', colSpan: 2 },
    ],
    []
  );

  return (
    <CrudPage
      title="Payments"
      description={
        'Track customer deposits, installments, full settlements, ' +
        'and Shopee checkout verifications.'
      }
      endpoint="/payments"
      fields={fields}
      searchPlaceholder="Search payment number, customer, invoice / order, account..."
      filters={[
        {
          key: 'status',
          label: 'Payment Status',
          placeholder: 'All Status',
          options: [
            { label: 'Pending Verification', value: 'PENDING' },
            { label: 'Verified', value: 'VERIFIED' },
            { label: 'Rejected', value: 'REJECTED' },
            { label: 'Refunded', value: 'REFUNDED' },
          ],
        },
        {
          key: 'method',
          label: 'Payment Method',
          placeholder: 'All Methods',
          options: [
            { label: 'Bank Transfer', value: 'Bank Transfer' },
            { label: 'QRIS', value: 'QRIS' },
            { label: 'E-Wallet', value: 'E-Wallet' },
            { label: 'Cash', value: 'Cash' },
            { label: 'Credit Card', value: 'Credit Card' },
            { label: 'Shopee Checkout', value: 'Shopee Checkout' },
          ],
        },
      ]}
      columns={[
        {
          key: 'paymentNumber',
          label: 'Payment #',
          exportValue: (row) => row.payment_number || row.paymentNumber || '-',
          render: (row) => row.payment_number || row.paymentNumber,
        },
        {
          key: 'target',
          label: 'Invoice / Order',
          exportValue: (row) => {
            const invNum = row.invoice?.invoice_number || row.invoice?.invoiceNumber;
            const ordNum = row.order?.order_number || row.order?.orderNumber;
            return invNum || ordNum || '-';
          },
          render: (row) => {
            const num =
              row.invoice?.invoice_number ||
              row.invoice?.invoiceNumber;
            const invId = row.invoice_id ?? row.invoice?.id;
            if (num && invId) {
              return (
                <a
                  href={`/invoices/${invId}`}
                  className="font-bold text-cherry-600 hover:underline"
                >
                  {num}
                </a>
              );
            }
            return (
              row.order?.order_number ||
              row.order?.orderNumber ||
              '-'
            );
          },
        },
        {
          key: 'customer',
          label: 'Customer',
          exportValue: (row) =>
            row.invoice?.customer?.full_name ||
            row.invoice?.customer?.fullName ||
            row.order?.customer?.full_name ||
            row.order?.customer?.fullName ||
            '-',
          render: (row) =>
            row.invoice?.customer?.full_name ||
            row.invoice?.customer?.fullName ||
            row.order?.customer?.full_name ||
            row.order?.customer?.fullName ||
            '-',
        },
        {
          key: 'amount',
          label: 'Amount (IDR)',
          exportValue: (row) => Number(row.amount || 0),
          render: (row) => <strong>{money(row.amount)}</strong>,
        },
        {
          key: 'method',
          label: 'Method',
          exportValue: (row) => row.payment_method || row.method || '-',
          render: (row) => row.payment_method || row.method,
        },
        {
          key: 'proof',
          label: 'Receipt Proof',
          exportValue: (row) => row.proof_url || row.proofUrl || '-',
          render: (row) => {
            const url = row.proof_url || row.proofUrl;
            if (!url) {
              return <span className="text-xs text-brand-300">-</span>;
            }
            return (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className={
                  'inline-flex items-center gap-1.5 text-xs font-bold ' +
                  'text-cherry-600 hover:underline'
                }
              >
                <SafeProofImage
                  src={url}
                  alt="Receipt"
                  className="h-6 w-6 rounded object-cover border border-brand-200"
                />
                <span>View</span>
              </a>
            );
          },
        },
        {
          key: 'status',
          label: 'Status',
          exportValue: (row) => row.status || 'PENDING',
          render: (row) => <StatusBadge value={row.status} />,
        },
        {
          key: 'paymentDate',
          label: 'Date',
          exportValue: (row) => date(row.payment_date || row.paymentDate),
          render: (row) => date(row.payment_date || row.paymentDate),
        },
      ]}
      canCreate={hasPermission('payments', 'create')}
      canEdit={hasPermission('payments', 'verify') || hasPermission('payments', 'create')}
      canDelete={hasPermission('payments', 'delete')}
      prepareInitial={(row) => ({
        ...row,
        paymentNumber: row.payment_number || row.paymentNumber,
        invoiceId: row.invoice_id ?? row.invoiceId,
        orderId: row.order_id ?? row.orderId,
        paymentDate: row.payment_date
          ? String(row.payment_date).slice(0, 16)
          : row.paymentDate
          ? String(row.paymentDate).slice(0, 16)
          : '',
        amount: Number(row.amount || 0),
        method: row.payment_method || row.method,
        destinationAccount: row.destination_account || row.destinationAccount,
        proofUrl: row.proof_url || row.proofUrl,
      })}
      bulkStatus={{
        label: 'Payment status',
        options: paymentStatusOptions,
        apply: (id, value) => api.put(`/payments/${id}`, { status: value }),
      }}
    />
  );
}
