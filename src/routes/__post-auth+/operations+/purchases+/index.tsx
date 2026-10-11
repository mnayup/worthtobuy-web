import { useMemo, useState, useEffect } from 'react';
import { Eye } from 'lucide-react';
import { CrudPage } from '~/components/CrudPage';
import { StatusBadge } from '~/components/StatusBadge';
import { api } from '~/lib/api';
import { money } from '~/lib/format';
import type { FieldConfig, Option } from '~/types';
import { purchaseStatusOptions, type Purchase } from './types';
import { PurchaseDetailModal } from './components/purchase-detail-modal';
import { PurchaseStatusCards } from './components/purchase-status-cards';

const responseRows = (response: any): any[] => {
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.data)) return response.data;
  return [];
};

const loadPaginatedOptions =
  (endpoint: string, mapper: (row: any) => Option) =>
  async (search: string): Promise<Option[]> => {
    const [path, queryString] = endpoint.split('?');
    const query = new URLSearchParams(queryString || '');
    query.set('limit', '25');
    if (search) query.set('search', search);
    const response = await api.get(`${path}?${query}`);
    return responseRows(response).map(mapper);
  };

const loadPeriods = loadPaginatedOptions('/periods?status=OPEN', (row) => ({
  value: row.id,
  label: `${row.code} • ${row.name}`,
}));
const loadProducts = loadPaginatedOptions('/products?activePeriod=true', (row) => ({
  value: row.id,
  label: `${row.sku} • ${row.name}`,
}));
const loadUsers = loadPaginatedOptions('/users', (row) => ({
  value: row.id,
  label: `${row.name} • ${row.role?.name || ''}`,
}));
const loadOrderItems = loadPaginatedOptions('/order-items', (row) => {
  const oNum = row.order?.order_number || row.order?.orderNumber || '-';
  const pName =
    row.product?.name ||
    row.manual_product_name ||
    row.manualProductName ||
    'Custom item';
  const cName =
    row.order?.customer?.full_name || row.order?.customer?.fullName || '-';
  return { value: row.id, label: `${oNum} • ${pName} • ${cName}` };
});

export async function loader() {
  const [periodsRes, itemsRes] = await Promise.allSettled([
    api.get('/periods?limit=100'),
    api.get('/shopping-list'),
  ]);
  return {
    periods: periodsRes.status === 'fulfilled' ? responseRows(periodsRes.value) : [],
    items: itemsRes.status === 'fulfilled' ? responseRows(itemsRes.value) : [],
  };
}

export default function PurchasesRoute() {
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [summary, setSummary] = useState<Record<string, number>>({});
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const fetchSummary = async () => {
    try {
      const res = await api.get('/purchases/summary');
      setSummary(res.data || {});
    } catch (err) {
      console.error('Failed to load purchase summary:', err);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const fields = useMemo<FieldConfig[]>(
    () => [
      { name: 'purchaseNumber', label: 'Purchase Number' },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        options: purchaseStatusOptions,
        defaultValue: 'WAITING_PURCHASE',
      },
      { name: 'purchaseDate', label: 'Purchase Date', type: 'datetime-local' },
      {
        name: 'shopperId',
        label: 'Assigned Shopper',
        type: 'select',
        loadOptions: loadUsers,
        searchable: true,
      },
      {
        name: 'periodId',
        label: 'Event',
        type: 'select',
        loadOptions: loadPeriods,
        searchable: true,
        required: true,
        disabled: (form) => Boolean(form.id),
      },
      {
        name: 'orderItemId',
        label: 'Ordered Item',
        type: 'select',
        loadOptions: loadOrderItems,
        searchable: true,
        required: true,
        disabled: (form) => Boolean(form.id),
      },
      { name: 'quantity', label: 'Quantity', type: 'number', required: true },
      {
        name: 'estimatedPrice',
        label: 'Estimated Cost (IDR)',
        type: 'currency',
        required: true,
      },
      {
        name: 'actualPrice',
        label: 'Actual Cost (IDR)',
        type: 'currency',
        required: true,
      },
      { name: 'paymentMethod', label: 'Payment Method' },
      {
        name: 'receiptUrl',
        label: 'Receipt / Proof of Purchase',
        type: 'file',
        entityType: 'purchases',
        fileType: 'all',
        colSpan: 2,
      },
      { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
    ],
    []
  );

  return (
    <>
      <CrudPage
        key={refreshKey}
        title="Store / Event Purchases"
        description={
          'Verify personal shopper purchases per brand, record actual costs, ' +
          'and upload receipt proof.'
        }
        endpoint="/purchases"
        fields={fields}
        extraQuery={selectedStatus ? { status: selectedStatus } : undefined}
        searchPlaceholder="Search purchase number, item name, brand, shopper..."
        filters={[
          {
            key: 'status',
            label: 'Purchase Status',
            placeholder: 'All Status',
            options: [
              { label: 'Waiting Purchase', value: 'WAITING_PURCHASE' },
              { label: 'Purchased', value: 'PURCHASED' },
              { label: 'Unavailable', value: 'UNAVAILABLE' },
            ],
          },
        ]}
        topContent={
          <PurchaseStatusCards
            selectedStatus={selectedStatus}
            onSelectStatus={setSelectedStatus}
            summary={summary}
          />
        }
        columns={[
          {
            key: 'purchaseNumber',
            label: 'Purchase #',
            render: (row) => row.purchase_number || row.purchaseNumber,
          },
          { key: 'period', label: 'Event', render: (row) => row.period?.name || '-' },
          {
            key: 'product',
            label: 'Product',
            render: (row) =>
              row.product?.name ||
              row.orderItem?.manualProductName ||
              row.order_item?.manual_product_name ||
              '-',
          },
          { key: 'shopper', label: 'Shopper', render: (row) => row.shopper?.name || '-' },
          {
            key: 'brandName',
            label: 'Brand',
            render: (row) => row.brand_name || row.brandName,
          },
          {
            key: 'estimatedPrice',
            label: 'Estimated',
            render: (row) => money(row.estimated_price ?? row.estimatedPrice),
          },
          {
            key: 'actualPrice',
            label: 'Actual',
            render: (row) => money(row.actual_price ?? row.actualPrice),
          },
          {
            key: 'priceDifference',
            label: 'Difference',
            render: (row) => {
              const diff = Number(row.price_difference ?? row.priceDifference ?? 0);
              const cls = diff > 0 ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold';
              return <span className={cls}>{money(diff)}</span>;
            },
          },
          {
            key: 'status',
            label: 'Status',
            render: (row) => <StatusBadge value={row.status || 'WAITING_PURCHASE'} />,
          },
        ]}
        bulkStatus={{
          label: 'Purchase Status',
          options: purchaseStatusOptions,
          apply: async (id, value) => {
            const res = await api.put(`/purchases/${id}`, { status: value });
            fetchSummary();
            return res;
          },
        }}
        renderActions={(row) => (
          <button
            type="button"
            onClick={() => setSelectedPurchase(row)}
            className="rounded-xl p-2 text-brand-500 hover:bg-brand-100 hover:text-brand-900"
            title="Details & Update Status"
          >
            <Eye size={16} />
          </button>
        )}
        canDelete={false}
        canEdit={false}
        prepareInitial={(row) => {
          const pDate = row.purchase_date || row.purchaseDate;
          return {
            ...row,
            purchaseDate: pDate ? String(pDate).slice(0, 16) : '',
            brandName: row.brand_name || row.brandName,
            actualPrice: row.actual_price ?? row.actualPrice,
            estimatedPrice: row.estimated_price ?? row.estimatedPrice,
          };
        }}
        prepareSubmit={(form) => ({
          ...form,
          purchaseDate: form.purchaseDate
            ? new Date(form.purchaseDate).toISOString()
            : undefined,
          periodId: form.periodId ? Number(form.periodId) : undefined,
          orderItemId: form.orderItemId ? Number(form.orderItemId) : undefined,
          shopperId: form.shopperId ? Number(form.shopperId) : undefined,
          quantity: form.quantity ? Number(form.quantity) : undefined,
          estimatedPrice: form.estimatedPrice ? Number(form.estimatedPrice) : undefined,
          actualPrice: form.actualPrice ? Number(form.actualPrice) : undefined,
        })}
      />

      <PurchaseDetailModal
        open={Boolean(selectedPurchase)}
        purchase={selectedPurchase}
        onClose={() => setSelectedPurchase(null)}
        onSaved={() => {
          setRefreshKey((k) => k + 1);
          fetchSummary();
        }}
      />
    </>
  );
}
