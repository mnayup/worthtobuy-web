import dayjs from 'dayjs';
import { getNowDateTimeLocal } from './order-options.helper';

export function prepareInitialOrder(row: any) {
  const oDate = row.order_date || row.orderDate;
  const dDate = row.due_date || row.dueDate;
  const mode = row.service_fee_mode || row.serviceFeeMode;
  const items = row.items || [];
  const first = items[0];
  const variantItems =
    items.length > 0
      ? items.map((it: any) => ({
          variant: it.variation || it.variant || '',
          size: it.size || '',
          quantity: Math.max(1, Number(it.quantity || 1)),
          price: Number(it.unit_price_foreign ?? it.unitPriceForeign ?? 0),
        }))
      : [{ variant: '', size: '', quantity: 1, price: 0 }];

  return {
    ...row,
    orderDate: oDate ? dayjs(oDate).format('YYYY-MM-DDTHH:mm') : getNowDateTimeLocal(),
    dueDate: dDate ? String(dDate).slice(0, 10) : '',
    customerId: row.customer_id ?? row.customerId,
    periodId: row.period_id ?? row.periodId,
    productId: first?.product_id || first?.productId || '',
    fulfillmentStatus: first?.fulfillment_status || first?.fulfillmentStatus || 'PENDING',
    variantItems,
    unitPriceForeign: first?.unit_price_foreign ?? first?.unitPriceForeign ?? 0,
    serviceFeeMode: mode === 'AUTO' ? 'AUTO_CUSTOMER' : mode || 'AUTO_CUSTOMER',
    serviceFee: row.service_fee ?? row.serviceFee ?? 0,
    additionalFees: Array.isArray(row.additional_fees ?? row.additionalFees)
      ? row.additional_fees ?? row.additionalFees
      : Number(row.additional_fee ?? row.additionalFee ?? 0) > 0
      ? [{ type: 'Other', customName: 'Additional Fee', amount: Number(row.additional_fee ?? row.additionalFee) }]
      : [],
    customerNotes: row.customer_notes ?? row.customerNotes ?? '',
    internalNotes: row.internal_notes ?? row.internalNotes ?? '',
  };
}

function buildNewProductPayload(form: any, periodOption: any, unitPriceForeign: number) {
  const rawImgs = form.newProductImageUrls;
  const imgs: string[] = Array.isArray(rawImgs) ? rawImgs.filter(Boolean) : [];
  const primaryImg = imgs[0] || undefined;

  return {
    name: form.newProductName.trim(),
    brand_name: form.newProductBrand?.trim() || undefined,
    category: form.newProductCategory?.trim() || undefined,
    store_location: form.newProductStoreLocation?.trim() || undefined,
    variant: form.newProductVariant?.trim() || undefined,
    buy_price: Number(form.newProductBuyPrice ?? unitPriceForeign ?? 0),
    selling_price: Number(unitPriceForeign || 0),
    stock_mode: periodOption?.code === 'READY-STOCK' ? 'READY_STOCK' : 'EVENT',
    stock_quantity: 0,
    image_url: primaryImg,
    image_urls: imgs,
    notes: form.newProductNotes?.trim() || undefined,
    period_id: Number(form.periodId),
  };
}

export function prepareSubmitOrder(form: any) {
  const {
    productId,
    newProductName,
    newProductBrand,
    newProductCategory,
    newProductStoreLocation,
    newProductVariant,
    newProductSize,
    newProductImageUrls,
    newProductNotes,
    variantItems,
    unitPriceForeign,
    ...order
  } = form;

  const isAutoFee = ['AUTO', 'AUTO_CUSTOMER', 'AUTO_RESELLER'].includes(
    order.serviceFeeMode || ''
  );
  if (isAutoFee) {
    Object.assign(order, {
      serviceFee: 0,
      localShipping: 0,
      customerShipping: 0,
      discount: 0,
      serviceFeeNote: '',
    });
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
    ? buildNewProductPayload(form, periodOption, Number(unitPriceForeign || 0))
    : undefined;

  const isPriority = form.customerId_option?.segment === 'PRIORITY';
  const defaultInitialStatus = isPriority ? 'WAITING_PURCHASE' : 'NEW';

  const rows: Array<{
    variant?: string;
    size?: string;
    quantity: number;
    price?: number;
  }> =
    Array.isArray(variantItems) && variantItems.length > 0
      ? variantItems.filter((v: any) => Number(v.quantity) > 0)
      : [{ variant: '', size: '', quantity: 1, price: Number(unitPriceForeign || 0) }];

  const items = rows.map((vi) => {
    const itemPrice =
      vi.price !== undefined && vi.price !== null
        ? Number(vi.price)
        : Number(unitPriceForeign || 0);

    return {
      productId: isCreatingProduct ? undefined : productId || undefined,
      newProduct: newProductPayload,
      manualProductName: isCreatingProduct ? newProductName.trim() : undefined,
      brandName: isCreatingProduct ? newProductBrand?.trim() || undefined : undefined,
      variation: vi.variant?.trim() || undefined,
      size: vi.size?.trim() || undefined,
      sourceType: isReadyStock ? 'READY_STOCK' : 'CATALOG',
      fulfillmentStatus: isReadyStock ? 'AVAILABLE' : 'PENDING',
      quantity: Number(vi.quantity || 1),
      unitPriceForeign: itemPrice,
      targetPriceIdr: itemPrice,
    };
  });

    const validAdditionalFees = Array.isArray(order.additionalFees)
      ? order.additionalFees
          .filter((f: any) => f && (f.amount > 0 || f.type))
          .map((f: any) => ({
            type: f.type || 'Other',
            customName: f.type === 'Other' ? (f.customName || 'Other Fee') : '',
            amount: Number(f.amount || 0),
          }))
      : [];

    const totalAdditionalFee = validAdditionalFees.reduce(
      (sum: number, f: any) => sum + Number(f.amount || 0),
      0
    );

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
      additionalFee: totalAdditionalFee,
      additionalFees: validAdditionalFees,
      discount: Number(order.discount || 0),
      items,
    };
  }
