import { useMemo, useState, useEffect } from 'react';
import { Eye, Clock, CheckCircle2, AlertCircle, ShoppingBag } from 'lucide-react';
import { CrudPage } from '~/components/CrudPage';
import { StatusBadge } from '~/components/StatusBadge';
import { api } from '~/lib/api';
import { money } from '~/lib/format';
import type { FieldConfig, Option } from '~/types';
import { purchaseStatusOptions, type Purchase } from './types';
import { PurchaseDetailModal } from './components/purchase-detail-modal';

const responseRows = (response: any): any[] => {
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.data)) return response.data;
  return [];
};

const loadPaginatedOptions = (endpoint: string, mapper: (row: any) => Option) => async (search: string): Promise<Option[]> => {
  const [path, queryString] = endpoint.split('?');
  const query = new URLSearchParams(queryString || '');
  query.set('limit', '25');
  if (search) query.set('search', search);
  const response = await api.get(`${path}?${query}`);
  return responseRows(response).map(mapper);
};

const loadPeriods = loadPaginatedOptions('/periods?status=OPEN', (row) => ({ value: row.id, label: `${row.code} • ${row.name}` }));
const loadProducts = loadPaginatedOptions('/products?activePeriod=true', (row) => ({ value: row.id, label: `${row.sku} • ${row.name}` }));
const loadUsers = loadPaginatedOptions('/users', (row) => ({ value: row.id, label: `${row.name} • ${row.role?.name || ''}` }));
const loadOrderItems = loadPaginatedOptions('/order-items', (row) => ({
  value: row.id,
  label: `${row.order?.orderNumber || '-'} • ${row.product?.name || row.manualProductName || 'Custom item'} • ${row.order?.customer?.fullName || '-'}`,
}));

const STATUS_CARDS = [
  {
    key: 'ALL', label: 'All Purchases', icon: ShoppingBag,
    theme: {
      active: 'bg-brand-900 border-transparent shadow-brand-900/30',
      hover: 'hover:border-brand-300 hover:bg-brand-50',
      iconDefault: 'bg-slate-50 text-slate-400',
      iconHover: 'group-hover:bg-brand-100 group-hover:text-brand-600',
    }
  },
  {
    key: 'WAITING_PURCHASE', label: 'Waiting Purchase', icon: Clock,
    theme: {
      active: 'bg-indigo-600 border-transparent shadow-indigo-500/30',
      hover: 'hover:border-indigo-300 hover:bg-indigo-50',
      iconDefault: 'bg-slate-50 text-slate-400',
      iconHover: 'group-hover:bg-indigo-100 group-hover:text-indigo-600',
    }
  },
  {
    key: 'PURCHASED', label: 'Purchased', icon: CheckCircle2,
    theme: {
      active: 'bg-emerald-600 border-transparent shadow-emerald-500/30',
      hover: 'hover:border-emerald-300 hover:bg-emerald-50',
      iconDefault: 'bg-slate-50 text-slate-400',
      iconHover: 'group-hover:bg-emerald-100 group-hover:text-emerald-600',
    }
  },
  {
    key: 'UNAVAILABLE', label: 'Unavailable', icon: AlertCircle,
    theme: {
      active: 'bg-rose-600 border-transparent shadow-rose-500/30',
      hover: 'hover:border-rose-300 hover:bg-rose-50',
      iconDefault: 'bg-slate-50 text-slate-400',
      iconHover: 'group-hover:bg-rose-100 group-hover:text-rose-600',
    }
  },
];

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
      { name: 'status', label: 'Status', type: 'select', options: purchaseStatusOptions, defaultValue: 'WAITING_PURCHASE' },
      { name: 'purchaseDate', label: 'Purchase Date', type: 'datetime-local' },
      { name: 'shopperId', label: 'Assigned Shopper', type: 'select', loadOptions: loadUsers, searchable: true },
      { name: 'periodId', label: 'Event', type: 'select', loadOptions: loadPeriods, searchable: true, required: true, disabled: (form) => Boolean(form.id) },
      { name: 'orderItemId', label: 'Ordered Item', type: 'select', loadOptions: loadOrderItems, searchable: true, required: true, disabled: (form) => Boolean(form.id) },
      { name: 'quantity', label: 'Quantity', type: 'number', required: true },
      { name: 'estimatedPrice', label: 'Estimated Cost (IDR)', type: 'currency', required: true },
      { name: 'actualPrice', label: 'Actual Cost (IDR)', type: 'currency', required: true },
      { name: 'paymentMethod', label: 'Payment Method' },
      { name: 'receiptUrl', label: 'Receipt / Proof of Purchase', type: 'file', entityType: 'purchases', fileType: 'all', colSpan: 2 },
      { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
    ],
    []
  );

  return (
    <>
      <CrudPage
        key={refreshKey}
        title="Store / Event Purchases"
        description="Verify personal shopper purchases per brand, record actual costs, and upload receipt proof."
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
          <div className="mb-4 flex gap-3 overflow-x-auto pb-6 pt-2 px-1 scrollbar-hide">
            {STATUS_CARDS.map((card) => {
              const isSelected = selectedStatus === card.key || (!selectedStatus && card.key === 'ALL');
              const count = card.key === 'ALL' ? (summary.TOTAL || 0) : (summary[card.key] || 0);
              const Icon = card.icon;

              return (
                <button
                  key={card.key}
                  type="button"
                  onClick={() => {
                    if (card.key === 'ALL' || selectedStatus === card.key) {
                      setSelectedStatus(null);
                    } else {
                      setSelectedStatus(card.key);
                    }
                  }}
                  className={`group relative flex min-w-[150px] flex-col items-start gap-3 rounded-2xl border p-4 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:z-10 ${
                    isSelected
                      ? `${card.theme.active} text-white shadow-xl z-10`
                      : `border-slate-200 bg-white/70 backdrop-blur-md ${card.theme.hover} z-0`
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                      isSelected ? 'bg-white/20 text-white' : `${card.theme.iconDefault} ${card.theme.iconHover}`
                    }`}>
                      <Icon size={20} strokeWidth={2.5} />
                    </div>
                    <span className={`text-2xl font-bold tracking-tight ${isSelected ? 'text-white' : 'text-slate-900 group-hover:text-slate-900'}`}>
                      {count}
                    </span>
                  </div>
                  <span className={`text-sm font-semibold tracking-wide ${isSelected ? 'text-white/90' : 'text-slate-500 group-hover:text-slate-700'}`}>
                    {card.label}
                  </span>
                </button>
              );
            })}
          </div>
        }
        columns={[
          { key: 'purchaseNumber', label: 'Purchase #' },
          { key: 'period', label: 'Event', render: (row) => row.period?.name || '-' },
          {
            key: 'product',
            label: 'Product',
            render: (row) => row.product?.name || row.orderItem?.manualProductName || '-',
          },
          { key: 'shopper', label: 'Shopper', render: (row) => row.shopper?.name || '-' },
          { key: 'brandName', label: 'Brand' },
          { key: 'estimatedPrice', label: 'Estimated', render: (row) => money(row.estimatedPrice) },
          { key: 'actualPrice', label: 'Actual', render: (row) => money(row.actualPrice) },
          {
            key: 'priceDifference',
            label: 'Difference',
            render: (row) => (
              <span className={Number(row.priceDifference) > 0 ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
                {money(row.priceDifference)}
              </span>
            ),
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
            className="rounded-xl p-2 text-brand-500 hover:bg-brand-100 hover:text-brand-900 transition"
            title="Details & Update Status"
          >
            <Eye size={16} />
          </button>
        )}
        canDelete={false}
        canEdit={false}
        prepareInitial={(row) => ({
          ...row,
          purchaseDate: row.purchaseDate ? String(row.purchaseDate).slice(0, 16) : '',
        })}
        prepareSubmit={(form) => ({
          ...form,
          purchaseDate: form.purchaseDate ? new Date(form.purchaseDate).toISOString() : undefined,
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
