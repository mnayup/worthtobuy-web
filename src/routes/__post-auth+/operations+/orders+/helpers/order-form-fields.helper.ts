import dayjs from 'dayjs';
import type { FieldConfig } from '~/types';
import {
  loadCustomers,
  loadPeriods,
  loadProducts,
  loadUsers,
  getNowDateTimeLocal,
} from './order-options.helper';

export function getOrderFields(user: any): FieldConfig[] {
  return [
    {
      name: 'customerId',
      label: 'Customer',
      type: 'select',
      loadOptions: loadCustomers,
      searchable: true,
      required: true,
    },
    {
      name: 'orderDate',
      label: 'Order Date',
      type: 'datetime-local',
      defaultValue: getNowDateTimeLocal,
      max: (form) => {
        if (
          form?.periodId_option?.code !== 'READY-STOCK' &&
          form?.periodId_option?.orderCloseAt
        ) {
          return String(form.periodId_option.orderCloseAt).slice(0, 16);
        }
        return undefined;
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
      name: 'newProductImageUrl',
      label: 'Product Photo / Image',
      type: 'image',
      entityType: 'orders',
      fileType: 'image',
      placeholder: 'Upload product photo...',
      colSpan: 2,
      dependsOn: (form) => form.productId === '__NEW_PRODUCT__',
    },
    {
      name: 'newProductNotes',
      label: 'Product Notes',
      type: 'textarea',
      placeholder: 'Variant notes, size instructions, etc.',
      colSpan: 2,
      dependsOn: (form) => form.productId === '__NEW_PRODUCT__',
    },
    {
      name: 'quantity',
      label: 'Quantity',
      type: 'number',
      defaultValue: 1,
      required: true,
      max: (form) =>
        form.productId === '__NEW_PRODUCT__'
          ? undefined
          : form.productId_option?.stock ?? undefined,
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
      name: 'unitPriceForeign',
      label: 'Item Price (IDR)',
      type: 'currency',
      required: true,
    },
    { name: 'keptUntil', label: 'Hold Until Date', type: 'date' },
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
      label: 'Manual Fee',
      type: 'currency',
      defaultValue: 0,
      dependsOn: (form) => form.serviceFeeMode === 'MANUAL',
    },
    {
      name: 'serviceFeeNote',
      label: 'Fee / Promo Notes',
      placeholder: 'e.g. Flash sale, war item, custom markup',
      dependsOn: (form) => form.serviceFeeMode === 'MANUAL',
    },
    {
      name: 'additionalFee',
      label: 'Additional Surcharge',
      type: 'currency',
      defaultValue: 0,
      dependsOn: (form) => form.serviceFeeMode === 'MANUAL',
    },
    {
      name: 'discount',
      label: 'Discount',
      type: 'currency',
      defaultValue: 0,
      dependsOn: (form) => form.serviceFeeMode === 'MANUAL',
    },
    { name: 'customerNotes', label: 'Customer Notes', type: 'textarea', colSpan: 2 },
    { name: 'internalNotes', label: 'Internal Staff Notes', type: 'textarea', colSpan: 2 },
  ];
}

export function prepareInitialOrder(row: any) {
  return {
    ...row,
    orderDate: row.orderDate
      ? dayjs(row.orderDate).format('YYYY-MM-DDTHH:mm')
      : getNowDateTimeLocal(),
    dueDate: row.dueDate ? String(row.dueDate).slice(0, 10) : '',
    productId: row.items?.[0]?.productId || '',
    fulfillmentStatus: row.items?.[0]?.fulfillmentStatus || 'PENDING',
    keptUntil: row.items?.[0]?.keptUntil ? String(row.items[0].keptUntil).slice(0, 10) : '',
    quantity: row.items?.[0]?.quantity,
    unitPriceForeign: row.items?.[0]?.unitPriceForeign,
    serviceFeeMode:
      row.serviceFeeMode === 'AUTO'
        ? 'AUTO_CUSTOMER'
        : row.serviceFeeMode || 'AUTO_CUSTOMER',
  };
}

export function prepareSubmitOrder(form: any) {
  const {
    productId,
    newProductName,
    newProductBrand,
    newProductCategory,
    newProductStoreLocation,
    newProductImageUrl,
    newProductNotes,
    keptUntil,
    quantity,
    unitPriceForeign,
    ...order
  } = form;

  const isAutoFee =
    order.serviceFeeMode === 'AUTO' ||
    order.serviceFeeMode === 'AUTO_CUSTOMER' ||
    order.serviceFeeMode === 'AUTO_RESELLER';

  if (isAutoFee) {
    order.serviceFee = 0;
    order.localShipping = 0;
    order.customerShipping = 0;
    order.additionalFee = 0;
    order.discount = 0;
    order.serviceFeeNote = '';
  }

  const isCreatingProduct = productId === '__NEW_PRODUCT__';
  if (isCreatingProduct && !newProductName?.trim()) {
    throw new Error('Please enter a name for the new product.');
  }

  const isReadyStock = isCreatingProduct
    ? false
    : form.productId_option?.stockMode === 'READY_STOCK';

  const orderDateObj = order.orderDate ? new Date(order.orderDate) : new Date();
  const periodOption = form.periodId_option;

  if (periodOption && periodOption.code !== 'READY-STOCK') {
    if (periodOption.orderCloseAt && orderDateObj > new Date(periodOption.orderCloseAt)) {
      throw new Error('Order date cannot be later than event order closing date.');
    }
  }

  const newProductPayload = isCreatingProduct
    ? {
        name: newProductName.trim(),
        brandName: newProductBrand?.trim() || undefined,
        category: newProductCategory?.trim() || undefined,
        storeLocation: newProductStoreLocation?.trim() || undefined,
        buyPrice: Number(unitPriceForeign || 0),
        sellingPrice: Number(unitPriceForeign || 0),
        stockMode: periodOption?.code === 'READY-STOCK' ? 'READY_STOCK' : 'EVENT',
        stockQuantity: 0,
        imageUrl: newProductImageUrl?.trim() || undefined,
        notes: newProductNotes?.trim() || undefined,
        periodId: Number(order.periodId),
      }
    : undefined;

  const isPriority = form.customerId_option?.segment === 'PRIORITY';
  const defaultInitialStatus = isPriority ? 'WAITING_PURCHASE' : 'NEW';

  return {
    ...order,
    orderDate: order.orderDate
      ? new Date(order.orderDate).toISOString()
      : new Date().toISOString(),
    status: defaultInitialStatus,
    adminId: order.adminId ? Number(order.adminId) : undefined,
    serviceFeeMode: order.serviceFeeMode || 'AUTO_CUSTOMER',
    serviceFee: Number(order.serviceFee || 0),
    localShipping: Number(order.localShipping || 0),
    customerShipping: Number(order.customerShipping || 0),
    additionalFee: Number(order.additionalFee || 0),
    discount: Number(order.discount || 0),
    items: [
      {
        productId: isCreatingProduct ? undefined : productId || undefined,
        newProduct: newProductPayload,
        manualProductName: isCreatingProduct ? newProductName.trim() : undefined,
        brandName: isCreatingProduct ? newProductBrand?.trim() || undefined : undefined,
        sourceType: isReadyStock ? 'READY_STOCK' : 'CATALOG',
        fulfillmentStatus: isReadyStock ? 'AVAILABLE' : 'PENDING',
        keptUntil: keptUntil ? new Date(keptUntil).toISOString() : undefined,
        quantity: Number(quantity || 1),
        unitPriceForeign: Number(unitPriceForeign || 0),
        targetPriceIdr: Number(unitPriceForeign || 0),
      },
    ],
  };
}
