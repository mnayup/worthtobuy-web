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

  const prod = first?.product;
  const cust = row.customer;
  const period = row.period;

  // Build orderBasket for multi-product editing if multiple products exist in row.items
  const productGroups = new Map<number | string, any[]>();
  for (const it of items) {
    const key = it.product_id || it.productId || 'none';
    if (!productGroups.has(key)) productGroups.set(key, []);
    productGroups.get(key)!.push(it);
  }

  const orderBasket = Array.from(productGroups.entries()).map(([pid, pItems], idx) => {
    const pFirst = pItems[0];
    const pProd = pFirst?.product;
    return {
      id: `basket-${pid}-${idx}`,
      productId: pid === 'none' ? '' : pid,
      productOption: pProd
        ? {
            value: pProd.id,
            label: pProd.name,
            subLabel: [
              pProd.sku ? `SKU: ${pProd.sku}` : '',
              [pProd.variant || pProd.variation, pProd.size ? `Size: ${pProd.size}` : ''].filter(Boolean).join(' • '),
            ]
              .filter(Boolean)
              .join(' • '),
            price: Number(pProd.selling_price ?? pProd.sellingPrice ?? pFirst?.unit_price_foreign ?? 0),
            raw: pProd,
          }
        : undefined,
      unitPriceForeign: Number(pProd?.selling_price ?? pProd?.sellingPrice ?? pFirst?.unit_price_foreign ?? 0),
      variantItems: pItems.map((it: any) => ({
        variant: it.variation || it.variant || '',
        size: it.size || '',
        quantity: Math.max(1, Number(it.quantity || 1)),
        price: Number(it.unit_price_foreign ?? it.unitPriceForeign ?? 0),
        bundleName: it.bundle_name || it.bundleName || undefined,
      })),
    };
  });

  return {
    ...row,
    orderDate: oDate ? dayjs(oDate).format('YYYY-MM-DDTHH:mm') : getNowDateTimeLocal(),
    dueDate: dDate ? String(dDate).slice(0, 10) : '',
    customerId: row.customer_id ?? row.customerId,
    customerId_option: cust
      ? {
          value: cust.id,
          label: `${cust.fullName || cust.full_name || cust.name || `Customer #${cust.id}`}${
            cust.segment === 'PRIORITY' ? ' (VIP Priority)' : ''
          }`,
          subLabel: [
            cust.customerCode || cust.customer_code ? `ID: ${cust.customerCode || cust.customer_code}` : `ID: #${cust.id}`,
            cust.whatsapp || cust.phone || '',
          ]
            .filter(Boolean)
            .join(' • '),
          raw: cust,
        }
      : undefined,
    periodId: row.period_id ?? row.periodId,
    periodId_option: period
      ? {
          value: period.id,
          label: period.name,
          tag:
            period.type === 'LIVE_SHOPPING'
              ? 'Live Shopping'
              : period.code === 'READY-STOCK'
              ? 'Ready Stock'
              : undefined,
          tagColor:
            period.type === 'LIVE_SHOPPING'
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : period.code === 'READY-STOCK'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : undefined,
          subLabel: [
            period.code ? `Code: ${period.code}` : '',
            [period.city, period.country].filter(Boolean).join(', '),
          ]
            .filter(Boolean)
            .join(' • ') || undefined,
          code: period.code,
          type: period.type,
          raw: period,
        }
      : undefined,
    productId: first?.product_id || first?.productId || '',
    productId_option: prod
      ? {
          value: prod.id,
          label: prod.name,
          subLabel: [
            prod.sku ? `SKU: ${prod.sku}` : '',
            [prod.variant || prod.variation, prod.size ? `Size: ${prod.size}` : ''].filter(Boolean).join(' • '),
          ]
            .filter(Boolean)
            .join(' • '),
          price: Number(prod.selling_price ?? prod.sellingPrice ?? first?.unit_price_foreign ?? 0),
          raw: prod,
        }
      : undefined,
    fulfillmentStatus: first?.fulfillment_status || first?.fulfillmentStatus || 'PENDING',
    orderBasket: orderBasket.length > 0 ? orderBasket : undefined,
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
    size: form.newProductSize?.trim() || undefined,
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

  const orderDateObj = order.orderDate ? new Date(order.orderDate) : new Date();
  const periodOption = form.periodId_option;
  const isLiveOrReadyPeriod =
    periodOption?.type === 'LIVE_SHOPPING' ||
    periodOption?.raw?.type === 'LIVE_SHOPPING' ||
    periodOption?.code === 'READY-STOCK';

  const isReadyStock = isCreatingProduct
    ? isLiveOrReadyPeriod
    : isLiveOrReadyPeriod || form.productId_option?.stockMode === 'READY_STOCK';

  if (periodOption) {
    const rawStatus = (periodOption.raw?.status || periodOption.status || '').toUpperCase();
    if (rawStatus && rawStatus !== 'OPEN') {
      throw new Error(`Event "${periodOption.label || periodOption.code}" is not open (status: ${rawStatus}).`);
    }
    if (periodOption.code !== 'READY-STOCK' && periodOption.orderCloseAt && orderDateObj > new Date(periodOption.orderCloseAt)) {
      throw new Error('Order date cannot be later than event order closing date.');
    }
  }

  const newProductPayload = isCreatingProduct
    ? buildNewProductPayload(form, periodOption, Number(unitPriceForeign || 0))
    : undefined;

  const isPriority = form.customerId_option?.segment === 'PRIORITY';
  const hasInitialDp = Number(order.initialPaymentAmount || 0) > 0;
  const defaultInitialStatus =
    isPriority || hasInitialDp
      ? isLiveOrReadyPeriod
        ? 'WAITING_SETTLEMENT'
        : 'WAITING_PURCHASE'
      : 'NEW';

  // Group items by product to build order items
  let items: any[] = [];

  const basket = form.orderBasket;
  if (!isCreatingProduct && Array.isArray(basket) && basket.length > 0) {
    for (const entry of basket) {
      const entryPid = entry.productId;
      if (!entryPid) continue;
      const isEntryReadyStock =
        isLiveOrReadyPeriod || entry.productOption?.stockMode === 'READY_STOCK';
      const entryVariantRows = Array.isArray(entry.variantItems) && entry.variantItems.length > 0
        ? entry.variantItems.filter((v: any) => Number(v.quantity) > 0)
        : [{ variant: '', size: '', quantity: 1, price: Number(entry.unitPriceForeign || 0) }];

      for (const vi of entryVariantRows) {
        const itemPrice =
          vi.price !== undefined && vi.price !== null
            ? Number(vi.price)
            : Number(entry.unitPriceForeign || 0);

        items.push({
          productId: entryPid,
          variation: vi.variant?.trim() || undefined,
          size: vi.size?.trim() || undefined,
          sourceType: isEntryReadyStock ? 'READY_STOCK' : 'CATALOG',
          fulfillmentStatus: isEntryReadyStock ? 'AVAILABLE' : 'PENDING',
          quantity: Number(vi.quantity || 1),
          unitPriceForeign: itemPrice,
          targetPriceIdr: itemPrice,
          bundleName: vi.bundleName || undefined,
        });
      }
    }
  }

  // Fallback to single product if basket is empty
  if (items.length === 0) {
    const rows: Array<{
      variant?: string;
      size?: string;
      quantity: number;
      price?: number;
      bundleName?: string;
    }> =
      Array.isArray(variantItems) && variantItems.length > 0
        ? variantItems.filter((v: any) => Number(v.quantity) > 0)
        : [{ variant: '', size: '', quantity: 1, price: Number(unitPriceForeign || 0) }];

    items = rows.map((vi) => {
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
        bundleName: vi.bundleName || undefined,
      };
    });
  }

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
      initialPaymentAmount: Number(order.initialPaymentAmount || 0),
      initialPaymentMethod: order.initialPaymentMethod || 'BANK_TRANSFER',
      initialPaymentProofUrl: order.initialPaymentProofUrl || undefined,
      targetInvoiceId:
        order.targetInvoiceMode === 'EXISTING' && order.targetInvoiceId
          ? Number(order.targetInvoiceId)
          : undefined,
      items,
    };
  }
