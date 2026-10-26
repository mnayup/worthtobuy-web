import { useMemo, useState, useEffect } from 'react';
import { Eye, Layers } from 'lucide-react';
import { CrudPage } from '~/components/CrudPage';
import { StatusBadge } from '~/components/StatusBadge';
import { api } from '~/lib/api';
import { money } from '~/lib/format';
import type { FieldConfig, Option } from '~/types';
import { purchaseStatusOptions, type Purchase } from './types';
import { PurchaseDetailModal } from './components/purchase-detail-modal';
import { PurchaseStatusCards } from './components/purchase-status-cards';
import { PurchaseSummaryModal } from './components/purchase-summary-modal';

import {
  responseRows,
  loadPeriods,
  loadProducts,
  loadUsers,
  loadOrderItems,
} from './helpers/purchase-options.helper';

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
  const [selectedPurchaseForSummary, setSelectedPurchaseForSummary] = useState<Purchase | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [summary, setSummary] = useState<Record<string, number>>({});
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [periodOptions, setPeriodOptions] = useState<Option[]>([]);
  const [brandOptions, setBrandOptions] = useState<Option[]>([]);
  const [productOptions, setProductOptions] = useState<Option[]>([]);

  const fetchSummary = async () => {
    try {
      const res = await api.get('/purchases/summary');
      setSummary(res.data || {});
    } catch (err) {
      console.error('Failed to load purchase summary:', err);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const [periodsRes, activeProductsRes, allProductsRes] = await Promise.allSettled([
        api.get('/periods?status=OPEN&limit=100'),
        api.get('/products?activePeriod=true&limit=250'),
        api.get('/products?limit=250'),
      ]);

      if (periodsRes.status === 'fulfilled') {
        const rows = responseRows(periodsRes.value);
        setPeriodOptions(
          rows.map((p: any) => ({
            value: String(p.id),
            label: `${p.code} • ${p.name}`,
          }))
        );
      }

      const activeProductRows =
        activeProductsRes.status === 'fulfilled' ? responseRows(activeProductsRes.value) : [];
      const allProductRows =
        allProductsRes.status === 'fulfilled' ? responseRows(allProductsRes.value) : [];

      // Combine brands from active events products and catalog products
      const combined = [...activeProductRows, ...allProductRows];
      const distinctBrands = Array.from(
        new Set(
          combined
            .map((p: any) => (p.brand_name || p.brandName || '').trim())
            .filter(Boolean)
        )
      ).sort();

      setBrandOptions(
        distinctBrands.map((b) => ({
          value: b,
          label: b,
        }))
      );

      // Distinct products for product filter
      const seenProductIds = new Set<number>();
      const distinctProducts: Option[] = [];
      for (const p of combined) {
        if (p.id && !seenProductIds.has(p.id)) {
          seenProductIds.add(p.id);
          const brandPrefix = p.brand_name || p.brandName ? `[${p.brand_name || p.brandName}] ` : '';
          distinctProducts.push({
            value: String(p.id),
            label: `${brandPrefix}${p.name}`,
          });
        }
      }
      distinctProducts.sort((a, b) => a.label.localeCompare(b.label));
      setProductOptions(distinctProducts);
    } catch (err) {
      console.error('Failed to load purchase filter options:', err);
    }
  };

  useEffect(() => {
    fetchSummary();
    fetchFilterOptions();
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
            key: 'periodId',
            label: 'Event',
            placeholder: 'All Events',
            options: periodOptions,
          },
          {
            key: 'productId',
            label: 'Product',
            placeholder: 'All Products',
            options: productOptions,
          },
          {
            key: 'brand',
            label: 'Brand',
            placeholder: 'All Brands',
            options: brandOptions,
          },
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
            exportValue: (row) => row.purchase_number || row.purchaseNumber,
            render: (row) => (
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-brand-900 text-xs">
                  {row.purchase_number || row.purchaseNumber}
                </span>
                {(row.batch_number || row.batchNumber) && (
                  <span
                    className={
                      'rounded bg-indigo-50 px-1.5 py-0.5 ' +
                      'text-[10px] font-bold text-indigo-700'
                    }
                  >
                    B{row.batch_number || row.batchNumber}
                  </span>
                )}
              </div>
            ),
          },
          {
            key: 'period',
            label: 'Event',
            exportValue: (row) => (row.period ? `${row.period.code ? `[${row.period.code}] ` : ''}${row.period.name}` : '-'),
            render: (row) => row.period?.name || '-',
          },
          {
            key: 'product',
            label: 'Product / Items',
            exportValue: (row) =>
              row.product_summary ||
              row.product?.name ||
              row.orderItem?.manualProductName ||
              row.order_item?.manual_product_name ||
              '-',
            render: (row) =>
              row.product_summary ||
              row.product?.name ||
              row.orderItem?.manualProductName ||
              row.order_item?.manual_product_name ||
              '-',
          },
          {
            key: 'quantity',
            label: 'Target Qty',
            exportValue: (row) => Number(row.eligibleQuantity ?? row.totalQuantity ?? row.quantity ?? 1),
            render: (row) => {
              const eligible = row.eligibleQuantity;
              const total = row.totalQuantity ?? row.quantity ?? 1;
              if (eligible !== undefined && eligible !== total) {
                return (
                  <span title="Eligible (DP / VIP) / Total">
                    <strong className="text-brand-900 font-bold">{eligible}</strong>
                    <span className="text-brand-400 text-xs font-medium"> / {total} pcs</span>
                  </span>
                );
              }
              return `${total} pcs`;
            },
          },
          {
            key: 'shopper',
            label: 'Shopper',
            exportValue: (row) => row.shopper?.name || '-',
            render: (row) => row.shopper?.name || '-',
          },
          {
            key: 'brandName',
            label: 'Brand',
            exportValue: (row) => row.brand_name || row.brandName || '-',
            render: (row) => row.brand_name || row.brandName,
          },
          {
            key: 'estimatedPrice',
            label: 'Estimated (IDR)',
            exportValue: (row) => Number(row.estimated_price ?? row.estimatedPrice ?? 0),
            render: (row) => money(row.estimated_price ?? row.estimatedPrice),
          },
          {
            key: 'actualPrice',
            label: 'Actual (IDR)',
            exportValue: (row) => Number(row.actual_price ?? row.actualPrice ?? 0),
            render: (row) => money(row.actual_price ?? row.actualPrice),
          },
          {
            key: 'priceDifference',
            label: 'Difference (IDR)',
            exportValue: (row) => Number(row.price_difference ?? row.priceDifference ?? 0),
            render: (row) => {
              const diff = Number(row.price_difference ?? row.priceDifference ?? 0);
              const cls = diff > 0 ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold';
              return <span className={cls}>{money(diff)}</span>;
            },
          },
          {
            key: 'status',
            label: 'Status',
            exportValue: (row) => row.status || 'WAITING_PURCHASE',
            render: (row) => <StatusBadge value={row.status || 'WAITING_PURCHASE'} />,
          },
        ]}
        selectable={false}
        renderActions={(row) => (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedPurchaseForSummary(row)}
              className="inline-flex items-center justify-center px-2.5 py-1.5 h-8 min-w-[34px] rounded-xl border border-indigo-200 bg-white text-indigo-600 shadow-2xs hover:bg-indigo-50 hover:text-indigo-900 hover:border-indigo-300 transition cursor-pointer"
              title="Summary Variant & Color List"
              aria-label="Summary Variant & Color List"
            >
              <Layers size={15} />
            </button>
            <button
              type="button"
              onClick={() => setSelectedPurchase(row)}
              className="inline-flex items-center justify-center px-2.5 py-1.5 h-8 min-w-[34px] rounded-xl border border-brand-200 bg-white text-brand-600 shadow-2xs hover:bg-brand-50 hover:text-brand-900 hover:border-brand-300 transition cursor-pointer"
              title="Details & Update Status"
              aria-label="Details & Update Status"
            >
              <Eye size={15} />
            </button>
          </div>
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

      <PurchaseSummaryModal
        open={Boolean(selectedPurchaseForSummary)}
        purchase={selectedPurchaseForSummary}
        onClose={() => setSelectedPurchaseForSummary(null)}
      />
    </>
  );
}
