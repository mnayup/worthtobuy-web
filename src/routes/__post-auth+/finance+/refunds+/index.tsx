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
  return api.put(`/refunds/${data.id}`, { status: data.status });
}

export default function RefundsRoute() {
  const { user, hasPermission } = useAuth();
  const [processingRefund, setProcessingRefund] = useState<{ refund: Refund; mode: 'method' | 'execute' } | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const canRequest = hasPermission('refunds', 'request');
  const canExecute = hasPermission('refunds', 'execute');

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
        name: 'bankName',
        label: 'Nama Bank Tujuan Transfer',
        type: 'text',
        placeholder: 'e.g. BCA, Mandiri, BRI, BNI',
        dependsOn: (form) => form.refundType === 'DIRECT_TRANSFER',
        required: true,
      },
      {
        name: 'accountNumber',
        label: 'Nomor Rekening Tujuan',
        type: 'text',
        placeholder: 'e.g. 1234567890',
        dependsOn: (form) => form.refundType === 'DIRECT_TRANSFER',
        required: true,
      },
      {
        name: 'accountHolder',
        label: 'Nama Penerima (Atas Nama)',
        type: 'text',
        placeholder: 'e.g. Budi Santoso',
        dependsOn: (form) => form.refundType === 'DIRECT_TRANSFER',
        required: true,
      },
      {
        name: 'transferNotes',
        label: 'Catatan Transfer Admin',
        type: 'textarea',
        colSpan: 2,
        placeholder: 'Catatan instruksi transfer untuk owner...',
        dependsOn: (form) => form.refundType === 'DIRECT_TRANSFER',
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
        description="Manage customer refunds, choose resolution methods (Deposit / Rekening), and verify bank transfers."
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
          {
            key: 'refundNumber',
            label: 'Refund #',
            render: (row) => (
              <span className="font-mono font-bold text-brand-900">
                {row.refund_number || row.refundNumber || '-'}
              </span>
            ),
          },
          {
            key: 'target',
            label: 'Invoice / Order',
            render: (row) => {
              const invNum = row.invoice?.invoice_number || row.invoice?.invoiceNumber;
              const ordNum = row.order?.order_number || row.order?.orderNumber;
              const invId = row.invoice_id ?? row.invoice?.id;

              if (invNum && invId) {
                return (
                  <div>
                    <a
                      href={`/invoices/${invId}`}
                      className="font-extrabold text-cherry-600 hover:underline"
                    >
                      {invNum}
                    </a>
                    {ordNum && (
                      <p className="text-[10px] text-brand-400">Order: {ordNum}</p>
                    )}
                  </div>
                );
              }

              return (
                <div>
                  <span className="font-extrabold text-brand-950">
                    {invNum || ordNum || '-'}
                  </span>
                  {invNum && ordNum && (
                    <p className="text-[10px] text-brand-400">Order: {ordNum}</p>
                  )}
                </div>
              );
            },
          },
          {
            key: 'customer',
            label: 'Customer',
            render: (row) =>
              row.customer?.full_name ||
              row.customer?.fullName ||
              row.invoice?.customer?.full_name ||
              row.invoice?.customer?.fullName ||
              row.order?.customer?.full_name ||
              row.order?.customer?.fullName ||
              '-',
          },
          { key: 'amount', label: 'Amount', render: (row) => <strong>{money(row.amount)}</strong> },

          {
            key: 'refundType',
            label: 'Resolution Type',
            render: (row) => (
              <div className="space-y-1">
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
                {row.refundType === 'DIRECT_TRANSFER' && (row.bankName || row.bank_name || row.accountNumber || row.account_number) && (
                  <p className="text-[10px] text-brand-500 font-medium">
                    {row.bankName || row.bank_name}: {row.accountNumber || row.account_number} ({row.accountHolder || row.account_holder || '-'})
                  </p>
                )}
              </div>
            ),
          },
          { key: 'source', label: 'Source', render: (row) => <StatusBadge value={row.source} /> },
          { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
        ]}
        renderActions={(row) => {
          const status = row.status;

          // Sequential Rigid Flow:
          // 1. Status 'REQUESTED': Staff selects method (Deposit or Direct Transfer) & inputs bank details.
          //    Visible only if user has permission 'refunds:request' (canRequest).
          if (status === 'REQUESTED') {
            if (!canRequest) return null;
            return (
              <button
                type="button"
                onClick={() => setProcessingRefund({ refund: row, mode: 'method' })}
                className="inline-flex items-center justify-center px-2.5 py-1.5 h-8 min-w-[34px] rounded-xl border border-purple-300 bg-purple-50 text-purple-700 shadow-2xs hover:bg-purple-600 hover:text-white hover:border-purple-600 transition cursor-pointer shrink-0"
                title="Pilih Metode Pengembalian Dana & Input Rekening"
                aria-label="Pilih Metode Pengembalian Dana & Input Rekening"
              >
                <Wallet size={15} />
              </button>
            );
          }

          // 2. Status 'ON_PROCESS' (or legacy 'APPROVED'): Waiting for Owner/Finance to execute transfer & upload transfer receipt.
          //    Visible only if user has permission 'refunds:execute' (canExecute).
          if (status === 'ON_PROCESS' || status === 'APPROVED') {
            if (!canExecute) return null;
            return (
              <button
                type="button"
                onClick={() => setProcessingRefund({ refund: row, mode: 'execute' })}
                className="inline-flex items-center justify-center px-2.5 py-1.5 h-8 min-w-[34px] rounded-xl border border-sky-300 bg-sky-50 text-sky-700 shadow-2xs hover:bg-sky-600 hover:text-white hover:border-sky-600 transition cursor-pointer shrink-0"
                title="Kirim Dana & Upload Bukti Transfer"
                aria-label="Kirim Dana & Upload Bukti Transfer"
              >
                <ArrowUpRight size={15} />
              </button>
            );
          }

          return null;
        }}
        canCreate={canRequest}
        canEdit={false}
        canDelete={hasPermission('refunds', 'delete') || user?.role === 'OWNER'}
        canEditRow={() => false}
        canDeleteRow={(row) => (!row.auto_generated && !row.autoGenerated) && (hasPermission('refunds', 'delete') || user?.role === 'OWNER')}
        canSelectRow={(row) => !row.auto_generated && !row.autoGenerated}
      />

      <ProcessRefundModal
        open={Boolean(processingRefund)}
        refund={processingRefund?.refund ?? null}
        mode={processingRefund?.mode ?? 'execute'}
        onClose={() => setProcessingRefund(null)}
        onSuccess={() => setRefreshTrigger((prev) => prev + 1)}
      />
    </>
  );
}
