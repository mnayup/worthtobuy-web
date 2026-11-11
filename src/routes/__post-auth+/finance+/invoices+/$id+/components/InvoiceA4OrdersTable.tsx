import React from 'react';
import { MessageSquareText } from 'lucide-react';
import { date, money, titleCase } from '~/lib/format';
import { StatusBadge } from '~/components/StatusBadge';
import { parseProductPriceRules, findMatchingVariantPrice } from '~/lib/pricing-rules';

interface InvoiceA4OrdersTableProps {
  orders: any[];
}

interface GroupedInvoiceItem {
  id: string;
  isBundle: boolean;
  bundleName?: string;
  name: string;
  brand: string;
  photoUrl?: string;
  totalQty: number;
  totalSubtotal: number;
  fulfillmentStatus?: string;
  items: any[];
}

function groupOrderItems(items: any[]): GroupedInvoiceItem[] {
  if (!items || !items.length) return [];

  const grouped: GroupedInvoiceItem[] = [];

  // Group items by product + bundle name first
  const bundleBucketMap = new Map<string, any[]>();

  for (const item of items) {
    const bundleName = (item.bundle_name || item.bundleName || '').trim();
    const productId = String(
      item.product_id ??
        item.productId ??
        item.product?.id ??
        item.manual_product_name ??
        item.manualProductName ??
        ''
    );
    const bundleKey = bundleName ? `${productId}___${bundleName}` : '';
    const qty = Number(item.quantity || 1);
    const rawUnitPrice = Number(
      item.unit_price_foreign ??
        item.unitPriceForeign ??
        item.target_price_idr ??
        item.targetPriceIdr ??
        0
    );
    const prodSellingPrice = Number(
      item.product?.selling_price ?? item.product?.sellingPrice ?? 0
    );
    const prodRules = parseProductPriceRules(
      item.product?.variant_prices || item.product?.variantPrices
    );
    const resolvedSellPrice = findMatchingVariantPrice(
      prodRules,
      item.variation || item.variant || '',
      item.size || '',
      prodSellingPrice
    );
    const unitPrice = rawUnitPrice > 0 ? rawUnitPrice : resolvedSellPrice;
    const subtotal = unitPrice * qty;
    const photo =
      item.photo_url ||
      item.photoUrl ||
      item.product?.image_url ||
      item.product?.imageUrl;
    const brand =
      item.product?.brand_name ||
      item.product?.brandName ||
      item.brand_name ||
      item.brandName ||
      '';

    if (bundleKey) {
      if (!bundleBucketMap.has(bundleKey)) {
        bundleBucketMap.set(bundleKey, []);
      }
      bundleBucketMap.get(bundleKey)!.push({
        ...item,
        _qty: qty,
        _unitPrice: unitPrice,
        _subtotal: subtotal,
        _photo: photo,
        _brand: brand,
        _bundleName: bundleName,
      });
    } else {
      const prodName =
        item.product?.name ||
        item.manual_product_name ||
        item.manualProductName ||
        'Custom Item';
      grouped.push({
        id: item.id || Math.random().toString(),
        isBundle: false,
        name: prodName,
        brand: brand || '-',
        photoUrl: photo,
        totalQty: qty,
        totalSubtotal: subtotal,
        fulfillmentStatus: item.fulfillment_status || item.fulfillmentStatus,
        items: [item],
      });
    }
  }

  // Now split each bundle bucket into separate packs based on bundle's minQty
  for (const [bundleKey, bucketItems] of bundleBucketMap.entries()) {
    const firstItem = bucketItems[0];
    const rawProduct = firstItem.product;
    const priceRules = parseProductPriceRules(rawProduct?.variant_prices || rawProduct?.variantPrices);
    const matchedRule = (priceRules.bundleRules || []).find(
      (b) => (b.name || '').trim().toLowerCase() === firstItem._bundleName.toLowerCase()
    );
    // Bundle capacity per pack (e.g. 3)
    const packCapacity = matchedRule && matchedRule.minQty > 0 ? matchedRule.minQty : 3;

    // Expand items into single units or small chunks
    let currentPackItems: any[] = [];
    let currentPackPcs = 0;
    let packIndex = 1;

    for (const it of bucketItems) {
      let remainingQty = it._qty;
      while (remainingQty > 0) {
        const spaceInPack = packCapacity - currentPackPcs;
        const take = Math.min(remainingQty, spaceInPack);

        currentPackItems.push({
          ...it,
          quantity: take,
        });
        currentPackPcs += take;
        remainingQty -= take;

        if (currentPackPcs >= packCapacity) {
          // Finalize this pack
          const packSubtotal = currentPackItems.reduce(
            (sum, x) => sum + Number(x._unitPrice || 0) * Number(x.quantity || 1),
            0
          );
          grouped.push({
            id: `bundle-${bundleKey}-pack-${packIndex}-${firstItem.id}`,
            isBundle: true,
            bundleName: firstItem._bundleName,
            name: firstItem._bundleName,
            brand: firstItem._brand || '-',
            photoUrl: firstItem._photo,
            totalQty: currentPackPcs,
            totalSubtotal: packSubtotal,
            fulfillmentStatus: firstItem.fulfillment_status || firstItem.fulfillmentStatus,
            items: currentPackItems,
          });
          currentPackItems = [];
          currentPackPcs = 0;
          packIndex++;
        }
      }
    }

    // Any leftover pieces in an incomplete pack
    if (currentPackItems.length > 0) {
      const packSubtotal = currentPackItems.reduce(
        (sum, x) => sum + Number(x._unitPrice || 0) * Number(x.quantity || 1),
        0
      );
      grouped.push({
        id: `bundle-${bundleKey}-pack-${packIndex}-${firstItem.id}`,
        isBundle: true,
        bundleName: firstItem._bundleName,
        name: firstItem._bundleName,
        brand: firstItem._brand || '-',
        photoUrl: firstItem._photo,
        totalQty: currentPackPcs,
        totalSubtotal: packSubtotal,
        fulfillmentStatus: firstItem.fulfillment_status || firstItem.fulfillmentStatus,
        items: currentPackItems,
      });
    }
  }

  return grouped;
}

export function InvoiceA4OrdersTable({ orders }: InvoiceA4OrdersTableProps) {
  const thCls = 'px-3 py-2 text-[10px] font-extrabold uppercase text-brand-700';

  return (
    <div className="mt-4 space-y-3">
      {orders?.map((link: any) => {
        const order = link.order || {};
        const orderNumber = order.order_number || order.orderNumber || '-';
        const orderDate = order.order_date || order.orderDate;
        const periodCode = order.period?.code || '';
        const periodName = order.period?.name || '';
        const isOrderUnavailable =
          order.status === 'UNAVAILABLE' ||
          (Array.isArray(order.items) &&
            order.items.length > 0 &&
            order.items.every((it: any) => (it.fulfillment_status || it.fulfillmentStatus) === 'UNAVAILABLE'));
        const totalAmount = isOrderUnavailable
          ? 0
          : Number(
              link.snapshot_amount ??
                link.snapshotAmount ??
                order.total_bill ??
                order.totalBill ??
                0
            );
        const originalAmount = Number(
          link.snapshot_amount ??
            link.snapshotAmount ??
            order.total_bill ??
            order.totalBill ??
            0
        );
        const serviceFee = isOrderUnavailable ? 0 : Number(order.service_fee ?? order.serviceFee ?? 0);
        const shippingCost = isOrderUnavailable
          ? 0
          : Number(
              order.customer_shipping ??
                order.customerShipping ??
                order.local_shipping ??
                order.localShipping ??
                0
            );
        const rawAdditionalFees = order.additional_fees ?? order.additionalFees;
        const additionalFeesList: any[] = isOrderUnavailable
          ? []
          : Array.isArray(rawAdditionalFees)
          ? rawAdditionalFees
          : Number(order.additional_fee ?? order.additionalFee ?? 0) > 0
          ? [{ type: 'Additional Surcharge', amount: Number(order.additional_fee ?? order.additionalFee) }]
          : [];
        const totalAdditionalFee = additionalFeesList.reduce((sum, f) => sum + Number(f.amount || 0), 0);

        const productSubtotal = isOrderUnavailable
          ? 0
          : Number(
              order.product_subtotal_idr ??
                order.productSubtotalIdr ??
                Math.max(0, totalAmount - serviceFee - shippingCost - totalAdditionalFee)
            );

        const customerNotes = order.customer_notes || order.customerNotes;

        return (
          <section
            key={link.id}
            className={`overflow-hidden rounded-xl border ${
              isOrderUnavailable ? 'border-rose-200 bg-rose-50/20' : 'border-brand-200'
            }`}
          >
            <div
              className={`flex flex-col gap-1.5 px-3.5 py-2 sm:flex-row sm:items-center sm:justify-between border-b ${
                isOrderUnavailable
                  ? 'bg-rose-50/80 border-rose-200'
                  : 'bg-brand-50 border-brand-200'
              }`}
            >
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <p
                    className={`font-extrabold text-xs ${
                      isOrderUnavailable ? 'line-through text-rose-900' : 'text-brand-900'
                    }`}
                  >
                    {orderNumber}
                  </p>
                  {isOrderUnavailable && (
                    <span className="rounded bg-rose-100 text-rose-700 border border-rose-300 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                      Barang Kosong / Dibatalkan
                    </span>
                  )}
                </div>
                <p className="text-[11px] font-semibold text-brand-500">
                  {[periodCode, periodName, orderDate ? date(orderDate) : null]
                    .filter(Boolean)
                    .join(' • ')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {isOrderUnavailable && (
                  <span className="line-through text-xs text-rose-400 font-medium">
                    {money(originalAmount)}
                  </span>
                )}
                <p className={`font-black text-xs ${isOrderUnavailable ? 'text-rose-700' : 'text-brand-900'}`}>
                  {money(totalAmount)}
                </p>
              </div>
            </div>
            {customerNotes && (
              <div className="flex items-start gap-2 bg-amber-50/70 border-b border-amber-200/80 px-3.5 py-2 text-xs">
                <MessageSquareText size={14} className="text-amber-600 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="font-bold text-amber-900 mr-1.5">Customer Note:</span>
                  <span className="text-amber-800 break-words">{customerNotes}</span>
                </div>
              </div>
            )}
            <div className="overflow-x-auto scrollbar-thin">
              <table className="min-w-full divide-y divide-brand-200">
                <thead className="bg-brand-50/60">
                  <tr>
                    <th className={`${thCls} text-left`}>Product Item</th>
                    <th className={`${thCls} text-left`}>Brand</th>
                    <th className={`${thCls} text-center`}>Qty</th>
                    <th className={`${thCls} text-left`}>Fulfillment</th>
                    <th className={`${thCls} text-right`}>Unit Price</th>
                    <th className={`${thCls} text-right`}>Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-100 bg-white">
                  {groupOrderItems(order.items).map((row) => {
                    if (row.isBundle) {
                      return (
                        <tr key={row.id} className="hover:bg-brand-50/50">
                          <td className="px-3 py-2">
                            <div className="flex items-start gap-2.5">
                              {row.photoUrl && (
                                <img
                                  src={row.photoUrl}
                                  className="h-8 w-8 rounded-lg object-cover ring-1 ring-brand-100 mt-0.5"
                                  alt=""
                                />
                              )}
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                  <p className="text-xs font-black text-brand-950 uppercase tracking-wide">
                                    {row.name}
                                  </p>
                                  <span className="rounded bg-amber-100 text-amber-800 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider shrink-0">
                                    Bundle Promo
                                  </span>
                                </div>
                                <div className="rounded-md bg-brand-50/80 border border-brand-100/80 px-2 py-1 text-[10px] space-y-0.5 text-brand-700">
                                  <p className="font-semibold text-brand-500 uppercase tracking-wider text-[9px]">
                                    Bundle Details:
                                  </p>
                                  {row.items.map((it, idx) => {
                                    const itQty = Number(it.quantity || 1);
                                    const itName =
                                      it.product?.name ||
                                      it.manual_product_name ||
                                      it.manualProductName ||
                                      'Item';
                                    const itSpecs = [
                                      it.variation || it.variant,
                                      it.size ? `Size: ${it.size}` : null,
                                      it.color,
                                    ]
                                      .filter(Boolean)
                                      .join(' • ');

                                    return (
                                      <div key={idx} className="flex items-center gap-1.5">
                                        <span className="text-brand-400">•</span>
                                        <span className="font-medium text-brand-900">
                                          {itName}
                                        </span>
                                        {itSpecs && (
                                          <span className="text-brand-500">
                                            ({itSpecs})
                                          </span>
                                        )}
                                        <span className="font-bold text-brand-800 ml-auto">
                                          x{itQty}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-xs font-semibold text-brand-600">
                            {row.brand || '-'}
                          </td>
                          <td className="px-3 py-2 text-center text-xs font-bold">
                            1 pack
                          </td>
                          <td className="px-3 py-2">
                            <StatusBadge value={row.fulfillmentStatus || 'UNFULFILLED'} />
                          </td>
                          <td className="px-3 py-2 text-right text-xs font-semibold text-brand-800">
                            {money(row.totalSubtotal)}
                          </td>
                          <td className="px-3 py-2 text-right text-xs font-black text-brand-900">
                            {money(row.totalSubtotal)}
                          </td>
                        </tr>
                      );
                    }

                    const item = row.items[0];
                    const qty = row.totalQty;
                    const subtotal = row.totalSubtotal;
                    const unitPrice = qty > 0 ? Math.round(subtotal / qty) : 0;

                    return (
                      <tr key={row.id} className="hover:bg-brand-50/50">
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2.5">
                            {row.photoUrl && (
                              <img
                                src={row.photoUrl}
                                className="h-8 w-8 rounded-lg object-cover ring-1 ring-brand-100"
                                alt=""
                              />
                            )}
                            <div>
                              <div className="flex items-center gap-1.5">
                                <p className="text-xs font-extrabold text-brand-900">
                                  {row.name}
                                </p>
                              </div>
                              <p className="text-[10px] font-medium text-brand-400">
                                {[
                                  item.variation || item.variant,
                                  item.size ? `Size: ${item.size}` : null,
                                  item.color,
                                ]
                                  .filter(Boolean)
                                  .join(' • ') ||
                                  titleCase(item.source_type || item.sourceType) ||
                                  '-'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-xs font-semibold text-brand-600">
                          {row.brand}
                        </td>
                        <td className="px-3 py-2 text-center text-xs font-bold">
                          {qty}
                        </td>
                        <td className="px-3 py-2">
                          <StatusBadge
                            value={item.fulfillment_status || item.fulfillmentStatus}
                          />
                        </td>
                        <td className="px-3 py-2 text-right text-xs">
                          {money(unitPrice)}
                        </td>
                        <td className="px-3 py-2 text-right text-xs font-black text-brand-900">
                          {money(subtotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="border-t border-brand-200 bg-brand-50/40 text-xs">
                  {serviceFee > 0 && (
                    <>
                      <tr>
                        <td
                          colSpan={5}
                          className="px-3 py-1.5 text-right font-medium text-brand-600"
                        >
                          Product Subtotal
                        </td>
                        <td className="px-3 py-1.5 text-right font-semibold text-brand-800">
                          {money(productSubtotal)}
                        </td>
                      </tr>
                      <tr>
                        <td
                          colSpan={5}
                          className="px-3 py-1.5 text-right font-semibold text-cherry-700"
                        >
                          Service Fee (Jastip Fee)
                        </td>
                        <td className="px-3 py-1.5 text-right font-black text-cherry-800">
                          {money(serviceFee)}
                        </td>
                      </tr>
                    </>
                  )}
                  {shippingCost > 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-3 py-1.5 text-right font-semibold text-sky-800"
                      >
                        Estimated Shipping Cost (Ongkir)
                      </td>
                      <td className="px-3 py-1.5 text-right font-black text-sky-900">
                        {money(shippingCost)}
                      </td>
                    </tr>
                  )}
                  {additionalFeesList.map((af: any, idx: number) => {
                    const feeName = af.type === 'Other' ? (af.customName || 'Other Additional Fee') : af.type;
                    return (
                      <tr key={`af-${idx}`}>
                        <td
                          colSpan={5}
                          className="px-3 py-1.5 text-right font-semibold text-amber-800"
                        >
                          {feeName}
                        </td>
                        <td className="px-3 py-1.5 text-right font-black text-amber-900">
                          {money(Number(af.amount || 0))}
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="border-t border-brand-200/80 bg-brand-100/50">
                    <td
                      colSpan={5}
                      className="px-3 py-1.5 text-right font-black text-brand-950 uppercase text-[10px] tracking-wider"
                    >
                      Total Order (Total Pesanan)
                    </td>
                    <td className="px-3 py-1.5 text-right font-black text-brand-950">
                      {money(totalAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>
        );
      })}
    </div>
  );
}
