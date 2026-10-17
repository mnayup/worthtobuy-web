import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { CrudPage } from '~/components/CrudPage';
import { api } from '~/lib/api';
import { useAuth } from '~/context/AuthContext';
import type { FieldConfig } from '~/types';
import { orderStatusOptions } from './helpers/format-order';
import { responseRows } from './helpers/order-options.helper';
import {
  getOrderFields,
  prepareInitialOrder,
  prepareSubmitOrder,
} from './helpers/order-form-fields.helper';
import { OrderStatusCards } from './components/order-status-cards';
import { getOrderColumns, renderOrderActions } from './helpers/order-columns.helper';
import { CreateInvoiceModal } from '../../finance+/invoices+/components/create-invoice-modal';
import { BulkIssueInvoicesModal } from './components/bulk-issue-invoices-modal';

export async function loader() {
  const [periodsRes, customersRes, productsRes, usersRes] = await Promise.allSettled([
    api.get('/periods?limit=100'),
    api.get('/customers?limit=100'),
    api.get('/products?limit=100'),
    api.get('/users?limit=100'),
  ]);

  return {
    periods:
      periodsRes.status === 'fulfilled'
        ? responseRows(periodsRes.value).map((row: any) => ({
            value: row.id,
            label: `${row.code} • ${row.name}`,
            orderOpenAt: row.order_open_at || row.orderOpenAt,
            orderCloseAt: row.order_close_at || row.orderCloseAt,
          }))
        : [],
    customers:
      customersRes.status === 'fulfilled'
        ? responseRows(customersRes.value).map((row: any) => ({
            value: row.id,
            label: row.full_name || row.fullName,
          }))
        : [],
    products:
      productsRes.status === 'fulfilled'
        ? responseRows(productsRes.value).map((row: any) => {
            const mode = row.stock_mode || row.stockMode;
            const isReady = ['READY_STOCK', 'BOTH'].includes(mode);
            const stockQty = row.stock_quantity ?? row.stockQuantity ?? 0;
            const resQty = row.reserved_quantity ?? row.reservedQuantity ?? 0;
            const stock = Math.max(0, stockQty - resQty);
            const price = Number(row.selling_price ?? row.sellingPrice ?? 0);
            return {
              value: row.id,
              label: `${row.sku} • ${row.name}${isReady ? ` • stock ${stock}` : ''}`,
              stock: isReady ? stock : undefined,
              stockMode: mode,
              price,
            };
          })
        : [],
    users:
      usersRes.status === 'fulfilled'
        ? responseRows(usersRes.value).map((row: any) => ({
            value: row.id,
            label: row.name,
          }))
        : [],
  };
}

export async function action(data: {
  intent: string;
  id?: string | number;
  payload?: any;
}) {
  if (data.intent === 'update-status' && data.id) {
    return api.patch(`/orders/${data.id}/status`, { status: data.payload });
  }
  if (data.intent === 'delete' && data.id) {
    return api.delete(`/orders/${data.id}`);
  }
  return null;
}

export default function OrdersRoute() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [invoiceModal, setInvoiceModal] = useState<number | null>(null);
  const [summary, setSummary] = useState<Record<string, number>>({});
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  // Dynamic filter options
  const [periodOptions, setPeriodOptions] = useState<Array<{ label: string; value: string | number }>>([]);
  const [customerOptions, setCustomerOptions] = useState<Array<{ label: string; value: string | number }>>([]);

  // Bulk Issue Invoices state
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkSelectedIds, setBulkSelectedIds] = useState<string[]>([]);
  const [bulkSelectedRows, setBulkSelectedRows] = useState<any[]>([]);
  const [clearSelectionCallback, setClearSelectionCallback] = useState<(() => void) | null>(null);
  const [reloadCallback, setReloadCallback] = useState<(() => void) | null>(null);

  const fetchSummary = async () => {
    try {
      const res = await api.get('/orders/summary');
      setSummary(res.data || {});
    } catch (err) {
      console.error('Failed to load order summary:', err);
    }
  };

  useEffect(() => {
    fetchSummary();

    // Fetch dynamic options for filters
    api.get('/periods?limit=200').then((res) => {
      const rows = res.data?.data || res.data || [];
      setPeriodOptions(
        rows.map((row: any) => ({
          label: `${row.code} • ${row.name}`,
          value: row.id,
        }))
      );
    }).catch(() => {});

    api.get('/customers?limit=300').then((res) => {
      const rows = res.data?.data || res.data || [];
      setCustomerOptions(
        rows.map((row: any) => ({
          label: `${row.customer_code ? `${row.customer_code} • ` : ''}${row.full_name || row.fullName}`,
          value: row.id,
        }))
      );
    }).catch(() => {});
  }, []);

  const fields = useMemo<FieldConfig[]>(() => getOrderFields(user), [user]);
  const columns = useMemo(() => getOrderColumns(), []);

  return (
    <>
      <CrudPage
        title="Customer Orders"
        description={
          'Process orders from product catalog, ready stock items, or ' +
          'direct on-the-spot shopper requests.'
        }
        endpoint="/orders"
        fields={fields}
        extraQuery={selectedStatus ? { status: selectedStatus } : undefined}
        searchPlaceholder="Search order number, customer name, product, notes..."
        filters={[
          {
            key: 'periodId',
            label: 'Event',
            placeholder: 'All Events',
            options: periodOptions,
          },
          {
            key: 'customerId',
            label: 'Customer',
            placeholder: 'All Customers',
            options: customerOptions,
          },
          {
            key: 'status',
            label: 'Order Status',
            placeholder: 'All Status',
            options: orderStatusOptions,
          },
          {
            key: 'serviceFeeMode',
            label: 'Concierge Fee Mode',
            placeholder: 'All Fee Modes',
            options: [
              { label: 'Auto (Customer)', value: 'AUTO_CUSTOMER' },
              { label: 'Auto (Reseller)', value: 'AUTO_RESELLER' },
              { label: 'Manual Fee', value: 'MANUAL' },
            ],
          },
        ]}
        topContent={
          <OrderStatusCards
            selectedStatus={selectedStatus}
            onSelectStatus={setSelectedStatus}
            summary={summary}
          />
        }
        columns={columns}
        canDelete={user?.role === 'OWNER'}
        canBulkDelete={false}
        selectable={true}
        canSelectRow={(row) => row.status === 'NEW'}
        canEditRow={(row) => Number(row.paid_amount ?? row.paidAmount ?? 0) === 0}
        canDeleteRow={(row) => Number(row.paid_amount ?? row.paidAmount ?? 0) === 0}
        renderActions={(row) => renderOrderActions(row, navigate, setInvoiceModal)}
        renderBulkActions={({ selectedIds, selectedRows, clearSelection, reload }) => (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-honey-200 bg-honey-50/80 p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-honey-700" />
              <p className="text-sm font-extrabold text-honey-900">
                {selectedIds.length} order{selectedIds.length > 1 ? 's' : ''} selected.
              </p>
            </div>
            <button
              type="button"
              className="btn bg-honey-500 text-brand-950 font-black hover:bg-honey-400 !py-1.5 text-xs shadow-sm flex items-center gap-1.5"
              onClick={() => {
                setBulkSelectedIds(selectedIds);
                setBulkSelectedRows(selectedRows);
                setClearSelectionCallback(() => clearSelection);
                setReloadCallback(() => reload);
                setBulkModalOpen(true);
              }}
            >
              <FileText size={14} /> Bulk Issue Invoices
            </button>
          </div>
        )}
        prepareInitial={prepareInitialOrder}
        prepareSubmit={prepareSubmitOrder}
      />
      <CreateInvoiceModal
        open={Boolean(invoiceModal)}
        initialOrderId={invoiceModal}
        onClose={() => {
          setInvoiceModal(null);
          fetchSummary();
        }}
        onCreated={(id: number) => {
          setInvoiceModal(null);
          fetchSummary();
          navigate(`/invoices/${id}?from=orders`);
        }}
      />
      <BulkIssueInvoicesModal
        open={bulkModalOpen}
        onClose={() => setBulkModalOpen(false)}
        selectedOrderIds={bulkSelectedIds}
        selectedOrders={bulkSelectedRows}
        onSuccess={({ invoiceIds, count }) => {
          fetchSummary();
          clearSelectionCallback?.();
          reloadCallback?.();
          if (invoiceIds.length === 1) {
            navigate(`/invoices/${invoiceIds[0]}?from=orders`);
          } else if (invoiceIds.length > 1) {
            navigate('/invoices');
          }
        }}
      />
    </>
  );
}
