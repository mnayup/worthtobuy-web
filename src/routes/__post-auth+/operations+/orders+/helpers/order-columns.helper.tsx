import React from 'react';
import type { NavigateFunction } from 'react-router-dom';
import { MessageCircle, ReceiptText, RefreshCw } from 'lucide-react';
import { money } from '~/lib/format';
import { StatusBadge } from '~/components/StatusBadge';

export function getOrderColumns() {
  return [
    {
      key: 'customer',
      label: 'Customer',
      render: (row: any) => {
        const customerName = row.customer?.full_name || row.customer?.fullName || '-';
        const orderNumber = row.order_number || row.orderNumber;

        return (
          <div className="flex flex-col">
            <span className="font-semibold text-brand-900">{customerName}</span>
            {orderNumber && (
              <span className="font-mono text-[11px] text-brand-400 font-medium">
                {orderNumber}
              </span>
            )}
          </div>
        );
      },
      exportValue: (row: any) => row.customer?.full_name || row.customer?.fullName || '-',
    },
    {
      key: 'whatsapp_group',
      label: 'WA Group',
      render: (row: any) => {
        const group = row.customer?.whatsapp_group || row.customer?.whatsappGroup;
        if (!group) {
          return <span className="text-brand-300 text-xs italic">Unassigned</span>;
        }
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
            <MessageCircle size={12} className="text-emerald-500 shrink-0" />
            <span className="max-w-[130px] truncate">{group.name}</span>
          </span>
        );
      },
      exportValue: (row: any) => {
        const group = row.customer?.whatsapp_group || row.customer?.whatsappGroup;
        return group?.name || 'Unassigned';
      },
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
      exportValue: (row: any) =>
        row.period ? `${row.period.code ? `[${row.period.code}] ` : ''}${row.period.name}` : '-',
    },
    {
      key: 'item',
      label: 'Items & Variants',
      render: (row: any) => {
        const items = row.items || [];
        if (items.length === 0) return '-';
        const totalPcs = items.reduce(
          (sum: number, it: any) => sum + Number(it.quantity || 1),
          0
        );
        const first = items[0];
        const name =
          first.product?.name ||
          first.manual_product_name ||
          first.manualProductName ||
          'Product';
        const variantSummary = [
          first.variation || first.variant,
          first.size ? `Sz ${first.size}` : null,
        ]
          .filter(Boolean)
          .join(' / ');
        const extraCount = items.length - 1;

        return (
          <div className="flex flex-col text-xs leading-relaxed">
            <span className="font-bold text-brand-900">{name}</span>
            <span className="text-brand-500 font-medium">
              <span className="font-bold text-cherry-600">{totalPcs} pcs</span>
              {variantSummary ? ` • ${variantSummary}` : ''}
              {extraCount > 0 ? ` (+${extraCount} more)` : ''}
            </span>
          </div>
        );
      },
      exportValue: (row: any) => {
        const items = row.items || [];
        if (items.length === 0) return '-';
        return items
          .map((it: any) => {
            const name =
              it.product?.name ||
              it.manual_product_name ||
              it.manualProductName ||
              'Item';
            const variant = [it.variation || it.variant, it.size ? `Sz ${it.size}` : null]
              .filter(Boolean)
              .join(' / ');
            const qty = Number(it.quantity || 1);
            return `${qty}x ${name}${variant ? ` (${variant})` : ''}`;
          })
          .join('; ');
      },
    },
    {
      key: 'feeMode',
      label: 'Fee Mode',
      render: (row: any) => {
        const mode = row.service_fee_mode || row.serviceFeeMode;
        if (mode === 'AUTO_RESELLER') {
          return (
            <span className="pill bg-indigo-50 text-indigo-700 border border-indigo-200">
              Auto (Reseller)
            </span>
          );
        }
        if (mode === 'AUTO' || mode === 'AUTO_CUSTOMER') {
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
      exportValue: (row: any) => {
        const mode = row.service_fee_mode || row.serviceFeeMode;
        if (mode === 'AUTO_RESELLER') return 'Auto (Reseller)';
        if (mode === 'AUTO' || mode === 'AUTO_CUSTOMER') return 'Auto (Customer)';
        return 'Manual';
      },
    },
    {
      key: 'totalBill',
      label: 'Total',
      render: (row: any) => <strong>{money(row.total_bill ?? row.totalBill ?? 0)}</strong>,
      exportValue: (row: any) => Number(row.total_bill ?? row.totalBill ?? 0),
    },
    {
      key: 'outstandingAmount',
      label: 'Balance',
      render: (row: any) => {
        const balance = Number(row.outstanding_amount ?? row.outstandingAmount ?? 0);
        return (
          <span
            className={
              balance > 0
                ? 'font-semibold text-cherry-600'
                : 'text-emerald-600 font-semibold'
            }
          >
            {money(balance)}
          </span>
        );
      },
      exportValue: (row: any) => Number(row.outstanding_amount ?? row.outstandingAmount ?? 0),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row: any) => <StatusBadge value={row.status} />,
      exportValue: (row: any) => row.status || '-',
    },
  ];
}

export function renderOrderActions(
  row: any,
  navigate: NavigateFunction,
  setInvoiceModal: (id: number) => void,
  onChangeStatus?: (row: any) => void
) {
  const invoiceId =
    row.invoice_links?.[0]?.invoice_id ??
    row.invoice_links?.[0]?.invoiceId ??
    row.invoiceLinks?.[0]?.invoiceId;

  const linkedInvoice =
    row.invoice_links?.[0]?.invoice ||
    row.invoiceLinks?.[0]?.invoice;

  const isFullPaymentInvoice =
    linkedInvoice &&
    (linkedInvoice.billing_model === 'FULL_PAYMENT' ||
      linkedInvoice.billingModel === 'FULL_PAYMENT' ||
      linkedInvoice.status === 'PAID' ||
      Number(linkedInvoice.outstanding_amount ?? linkedInvoice.outstandingAmount ?? 0) <= 0);

  const items: any[] = row.items || [];
  const activeItems = items.filter(
    (i) => (i.fulfillment_status || i.fulfillmentStatus) !== 'UNAVAILABLE'
  );
  const isItemsPurchased =
    activeItems.length > 0 &&
    activeItems.every((i) =>
      ['AVAILABLE', 'KEPT', 'READY_TO_SHIP', 'SHIPPED', 'DELIVERED'].includes(
        i.fulfillment_status || i.fulfillmentStatus || ''
      ) || (i.purchase_status || i.purchaseStatus) === 'PURCHASED'
    );

  // Button only appears if the order is Full Payment AND its items have already been purchased (e.g. from Purchase Sorting / Summary)
  const canManuallyChangeStatus =
    isFullPaymentInvoice &&
    (isItemsPurchased || row.status === 'PURCHASED' || row.status === 'WAITING_SETTLEMENT') &&
    row.status !== 'READY_TO_SHIP' &&
    row.status !== 'SHIPPED' &&
    row.status !== 'COMPLETED' &&
    row.status !== 'CANCELLED';

  return (
    <div className="flex gap-1.5">
      {canManuallyChangeStatus && onChangeStatus && (
        <button
          onClick={() => onChangeStatus(row)}
          className="inline-flex items-center justify-center px-2.5 py-1.5 h-8 min-w-[34px] rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-700 shadow-2xs hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition cursor-pointer"
          title="Ubah Status Pesanan (Khusus Full Payment)"
          aria-label="Ubah Status Pesanan (Khusus Full Payment)"
        >
          <RefreshCw size={14} />
        </button>
      )}
      <button
        onClick={() => {
          if (invoiceId) {
            navigate(`/invoices/${invoiceId}?from=orders`);
          } else {
            setInvoiceModal(row.id);
          }
        }}
        className="inline-flex items-center justify-center px-2.5 py-1.5 h-8 min-w-[34px] rounded-xl border border-indigo-200 bg-indigo-50/70 text-indigo-600 shadow-2xs hover:bg-indigo-100 hover:text-indigo-700 hover:border-indigo-300 transition cursor-pointer"
        title={invoiceId ? 'Open Invoice' : 'Create Invoice'}
        aria-label={invoiceId ? 'Open Invoice' : 'Create Invoice'}
      >
        <ReceiptText size={15} />
      </button>
    </div>
  );
}
