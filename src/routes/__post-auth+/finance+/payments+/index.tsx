import { useMemo } from 'react';
import { CrudPage } from '~/components/CrudPage';
import { StatusBadge } from '~/components/StatusBadge';
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
  return api.put(`/payments/${data.id}`, { status: data.status });
}

export default function PaymentsRoute() {
  const { user } = useAuth();
  const fields = useMemo<FieldConfig[]>(
    () => [
      { name: 'paymentNumber', label: 'Payment number' },
      { name: 'invoiceId', label: 'Invoice (recommended)', type: 'select', loadOptions: loadInvoices, searchable: true },
      { name: 'orderId', label: 'Legacy order without invoice', type: 'select', loadOptions: loadOrders, searchable: true },
      { name: 'paymentDate', label: 'Payment date', type: 'datetime-local' },
      { name: 'amount', label: 'Amount', type: 'currency', required: true },
      {
        name: 'method',
        label: 'Method',
        type: 'select',
        options: ['Bank Transfer', 'QRIS', 'E-Wallet', 'Cash', 'Credit Card', 'Payment Gateway', 'Shopee Checkout'].map(
          (value) => ({ value, label: value })
        ),
        required: true,
      },
      { name: 'destinationAccount', label: 'Destination bank / account' },
      { name: 'proofUrl', label: 'Proof of payment / Receipt', type: 'file', entityType: 'payments', fileType: 'all', colSpan: 2 },
      { name: 'status', label: 'Verification status', type: 'select', options: paymentStatusOptions, defaultValue: 'PENDING' },
      { name: 'notes', label: 'Installment / payment notes', type: 'textarea', colSpan: 2 },
    ],
    []
  );

  return (
    <CrudPage
      title="Payments"
      description="Track customer deposits, installments, full settlements, and Shopee checkout verifications."
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
        { key: 'paymentNumber', label: 'Payment #' },
        {
          key: 'target',
          label: 'Invoice / Order',
          render: (row) => row.invoice?.invoiceNumber || row.order?.orderNumber || '-',
        },
        {
          key: 'customer',
          label: 'Customer',
          render: (row) => row.invoice?.customer?.fullName || row.order?.customer?.fullName || '-',
        },
        { key: 'amount', label: 'Amount', render: (row) => <strong>{money(row.amount)}</strong> },
        { key: 'method', label: 'Method' },
        { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
        { key: 'paymentDate', label: 'Date', render: (row) => date(row.paymentDate) },
      ]}
      canDelete={user?.role === 'OWNER' || user?.role === 'FINANCE'}
      bulkStatus={{
        label: 'Payment status',
        options: paymentStatusOptions,
        apply: (id, value) => api.put(`/payments/${id}`, { status: value }),
      }}
    />
  );
}
