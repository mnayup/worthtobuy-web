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
      },
    },
    {
      name: 'productId',
      label: 'Product',
      type: 'select',
      loadOptions: loadProducts,
      searchable: true,
      required: true,
      disabled: (form) => !form.periodId,
      onChange: (value, option, set) => {
        if (value === '__NEW_PRODUCT__') {
          set('unitPriceForeign', 0);
        } else if (option?.price !== undefined) {
          set('unitPriceForeign', option.price);
        }
      },
    },
    {
      name: 'newProductName',
      label: 'Product Name',
      placeholder: 'e.g. Pop Mart Labubu, Coach Tabby Bag, etc.',
      type: 'text',
      required: true,
      dependsOn: (form) => form.productId === '__NEW_PRODUCT__',
    },
    {
      name: 'newProductBrand',
      label: 'Brand Name',
      placeholder: 'e.g. Pop Mart, Coach, Nike, Gentle Monster',
      type: 'text',
      dependsOn: (form) => form.productId === '__NEW_PRODUCT__',
    },
    {
      name: 'newProductCategory',
      label: 'Category',
      placeholder: 'e.g. Collectibles, Bags, Skincare, Shoes',
      type: 'text',
      dependsOn: (form) => form.productId === '__NEW_PRODUCT__',
    },
    {
      name: 'newProductStoreLocation',
      label: 'Store Location / Tenant',
      placeholder: 'e.g. Takashimaya Shinjuku, Mega Don Quijote',
      type: 'text',
      dependsOn: (form) => form.productId === '__NEW_PRODUCT__',
    },
    {
      name: 'newProductVariant',
      label: 'Available Variants (Colors / Patterns)',
      placeholder: 'Type variant & press Enter (e.g. Crimson, Navy Blue)',
      type: 'tags',
      dependsOn: (form) => form.productId === '__NEW_PRODUCT__',
    },
    {
      name: 'newProductSize',
      label: 'Available Sizes',
      placeholder: 'Type size & press Enter (e.g. S, M, L, XL, 42)',
      type: 'tags',
      dependsOn: (form) => form.productId === '__NEW_PRODUCT__',
    },
    {
      name: 'newProductImageUrls',
      label: 'Product Photos (Variant / Color / Details)',
      type: 'images',
      entityType: 'products',
      placeholder: 'Upload multiple product photos...',
      colSpan: 2,
      dependsOn: (form) => form.productId === '__NEW_PRODUCT__',
    },
    {
      name: 'newProductNotes',
      label: 'Product Notes',
      type: 'textarea',
      placeholder: 'Special instructions or general notes...',
      colSpan: 2,
      dependsOn: (form) => form.productId === '__NEW_PRODUCT__',
    },
    {
      name: 'newProductBuyPrice',
      label: 'Store Buy Price / Modal (IDR)',
      type: 'currency',
      placeholder: 'Store cost to purchase item',
      defaultValue: 0,
      dependsOn: (form) => form.productId === '__NEW_PRODUCT__',
    },
    {
      name: 'unitPriceForeign',
      label: 'Customer Selling Price (IDR)',
      type: 'currency',
      placeholder: 'Price billed to customer (for invoice)',
    },
    {
      name: 'variantItems',
      label: 'Variant, Size & Quantities',
      type: 'variant-quantities',
      colSpan: 2,
      dependsOn: (form) => Boolean(form.productId),
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
