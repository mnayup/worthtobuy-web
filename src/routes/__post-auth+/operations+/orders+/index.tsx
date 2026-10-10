import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
            orderOpenAt: row.orderOpenAt,
            orderCloseAt: row.orderCloseAt,
          }))
        : [],
    customers:
      customersRes.status === 'fulfilled'
        ? responseRows(customersRes.value).map((row: any) => ({
            value: row.id,
            label: row.fullName,
          }))
        : [],
    products:
      productsRes.status === 'fulfilled'
        ? responseRows(productsRes.value).map((row: any) => {
            const isReady = ['READY_STOCK', 'BOTH'].includes(row.stockMode);
            const stock = Math.max(0, (row.stockQuantity || 0) - (row.reservedQuantity || 0));
            return {
              value: row.id,
              label: `${row.sku} • ${row.name}${isReady ? ` • stock ${stock}` : ''}`,
              stock: isReady ? stock : undefined,
              stockMode: row.stockMode,
              price: Number(row.sellingPrice || 0),
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
        canEditRow={(row) => Number(row.paidAmount || 0) === 0}
        canDeleteRow={(row) => Number(row.paidAmount || 0) === 0}
        renderActions={(row) => renderOrderActions(row, navigate, setInvoiceModal)}
        prepareInitial={prepareInitialOrder}
        prepareSubmit={prepareSubmitOrder}
        bulkStatus={{
          label: 'Order Status',
          options: orderStatusOptions,
          apply: async (id, value) => {
            const res = await api.put(`/orders/${id}`, { status: value });
            fetchSummary();
            return res;
          },
        }}
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
    </>
  );
}
