import type { FieldConfig } from '~/types';
import { api } from '~/lib/api';
import {
  loadCustomers,
  loadPeriods,
  loadProducts,
  loadUsers,
  getNowDateTimeLocal,
} from './order-options.helper';

export { prepareInitialOrder, prepareSubmitOrder } from './order-form-submit.helper';

export const productCategoryOptions = [
  { label: 'Fashion & Apparel', value: 'Fashion' },
  { label: 'Beauty & Skincare', value: 'Skincare' },
  { label: 'Shoes & Footwear', value: 'Shoes' },
  { label: 'Bags & Accessories', value: 'Bags' },
  { label: 'Food & Snacks', value: 'Snack' },
  { label: 'Electronics & Gadgets', value: 'Electronics' },
  { label: 'Houseware & Home', value: 'HOUSEWARE' },
  { label: 'Toys & Hobbies', value: 'TOYS' },
  { label: 'Mukena & Prayer Sets', value: 'MUKENA' },
  { label: 'Other', value: 'Other' },
];

export function getOrderFields(user: any): FieldConfig[] {
  return [
    {
      name: 'customerId',
      label: 'Customer',
      type: 'select',
      loadOptions: loadCustomers,
      searchable: true,
      required: true,
      onChange: async (value, option, set) => {
        set('targetInvoiceMode', 'NEW');
        set('targetInvoiceId', '');
        set('unpackedInvoiceOptions', []);
        if (value) {
          try {
            const res = await api.get(`/invoices/unpacked-invoices?customerId=${value}`);
            const list = res.data || [];
            if (list.length > 0) {
              const opts = list.map((inv: any) => ({
                value: String(inv.id),
                label: `${inv.invoice_number} • ${inv.order_count} order(s) (${inv.order_numbers}) • Total ${inv.total_bill?.toLocaleString('id-ID')} • Status: ${inv.status}`,
              }));
              set('unpackedInvoiceOptions', opts);
              set('targetInvoiceId', String(list[0].id));
            }
          } catch {
            // ignore
          }
        }
      },
    },
    {
      name: 'targetInvoiceMode',
      label: 'Invoice Option (Customer Has Unpacked Invoice)',
      type: 'select',
      defaultValue: 'NEW',
      options: [
        { value: 'NEW', label: 'Create New Invoice' },
        { value: 'EXISTING', label: 'Include / Add to Existing Unpacked Invoice' },
      ],
      dependsOn: (form) =>
        Boolean(form.customerId && form.unpackedInvoiceOptions && form.unpackedInvoiceOptions.length > 0),
    },
    {
      name: 'targetInvoiceId',
      label: 'Select Existing Unpacked Invoice',
      type: 'select',
      options: [],
      loadOptions: async (_search, form) => {
        return form?.unpackedInvoiceOptions || [];
      },
      dependsOn: (form) =>
        form.targetInvoiceMode === 'EXISTING' &&
        Boolean(form.unpackedInvoiceOptions && form.unpackedInvoiceOptions.length > 0),
    },
    {
      name: 'orderDate',
      label: 'Order Date',
      type: 'datetime-local',
      defaultValue: getNowDateTimeLocal,
      max: (form) => {
        const opt = form?.periodId_option;
        return opt?.code !== 'READY-STOCK' && opt?.orderCloseAt
          ? String(opt.orderCloseAt).slice(0, 16)
          : undefined;
      },
      required: true,
    },
    {
      name: 'periodId',
      label: 'Event',
      type: 'select',
      loadOptions: loadPeriods,
      searchable: true,
      required: true,
      onChange: (value, option, set) => {
        set('productId', '');
        set('productId_option', null);
        set('orderBasket', []);
      },
    },
    {
      name: 'orderBasket',
      label: 'Products, Variants & Bundle Deals',
      type: 'order-product-basket',
      colSpan: 2,
      dependsOn: (form) => Boolean(form.periodId),
    },
    {
      name: 'adminId',
      label: 'Assigned Admin',
      type: 'select',
      loadOptions: loadUsers,
      searchable: true,
      defaultValue: user?.id,
      disabled: true,
      options: user ? [{ value: user.id, label: user.name }] : [],
    },
    {
      name: 'serviceFeeMode',
      label: 'Concierge Fee Mode',
      type: 'select',
      options: [
        { value: 'AUTO_CUSTOMER', label: 'Automatic (Customer)' },
        { value: 'AUTO_RESELLER', label: 'Automatic (Reseller)' },
        { value: 'MANUAL', label: 'Manual' },
      ],
      defaultValue: 'AUTO_CUSTOMER',
      required: true,
    },
    {
      name: 'serviceFee',
      label: 'Manual Concierge Fee',
      type: 'currency',
      defaultValue: 0,
      dependsOn: (form) => form.serviceFeeMode === 'MANUAL',
    },
    {
      name: 'additionalFees',
      label: 'Additional Surcharges & Fees',
      type: 'additional-fees',
      colSpan: 2,
      defaultValue: [],
    },
    {
      name: 'discount',
      label: 'Discount',
      type: 'currency',
      defaultValue: 0,
      dependsOn: (form) => form.serviceFeeMode === 'MANUAL',
    },
    {
      name: 'initialPaymentAmount',
      label: 'Initial DP / Payment Amount (Optional)',
      type: 'currency',
      placeholder: 'Enter DP or full payment amount if paid upon order...',
      defaultValue: 0,
      dependsOn: (form) => !form.id,
    },
    {
      name: 'initialPaymentMethod',
      label: 'DP / Payment Method',
      type: 'select',
      options: [
        { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
        { value: 'QRIS', label: 'QRIS' },
        { value: 'CASH', label: 'Cash' },
        { value: 'E_WALLET', label: 'E-Wallet' },
      ],
      defaultValue: 'BANK_TRANSFER',
      dependsOn: (form) => !form.id && Number(form.initialPaymentAmount || 0) > 0,
    },
    {
      name: 'initialPaymentProofUrl',
      label: 'DP / Payment Proof Receipt (Optional)',
      type: 'file',
      entityType: 'payments',
      fileType: 'all',
      colSpan: 2,
      dependsOn: (form) => !form.id && Number(form.initialPaymentAmount || 0) > 0,
    },
    {
      name: 'customerNotes',
      label: 'Customer Notes',
      type: 'textarea',
      colSpan: 2,
    },
    {
      name: 'internalNotes',
      label: 'Internal Staff Notes',
      type: 'textarea',
      colSpan: 2,
    },
  ];
}
