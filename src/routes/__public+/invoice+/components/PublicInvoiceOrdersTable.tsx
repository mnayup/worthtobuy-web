import React from 'react';
import { MessageSquareText } from 'lucide-react';
import { money } from '~/lib/format';
import { parseProductPriceRules, findMatchingVariantPrice } from '~/lib/pricing-rules';

interface PublicInvoiceOrdersTableProps {
  orders: any[];
}

interface GroupedPublicInvoiceItem {
  id: string;
  isBundle: boolean;
  bundleName?: string;
  name: string;
  brand: string;
  photoUrl?: string;
  totalQty: number;
  totalSubtotal: number;
  items: any[];
}

function groupPublicOrderItems(items: any[]): GroupedPublicInvoiceItem[] {
  if (!items || !items.length) return [];

  const grouped: GroupedPublicInvoiceItem[] = [];

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
        'Ordered Item';
      grouped.push({
        id: item.id || Math.random().toString(),
        isBundle: false,
        name: prodName,
        brand,
        photoUrl: photo,
        totalQty: qty,
        totalSubtotal: subtotal,
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
            items: currentPackItems,
          });
          currentPackItems = [];
          currentPackPcs = 0;
          packIndex++;
        }
      }
    }

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
        items: currentPackItems,
      });
    }
  }

  return grouped;
}

export function PublicInvoiceOrdersTable({ orders }: PublicInvoiceOrdersTableProps) {
  if (!orders || orders.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-black uppercase tracking-wider text-brand-900">
        Order Items & Breakdown (Rincian Pesanan)
      </h2>

      {orders.map((link: any) => {
        const order = link.order || {};
        const orderNum = order.order_number || order.orderNumber || `Order #${link.order_id}`;
        const periodCode = order.period?.code;
        const periodName = order.period?.name;
        const totalAmount = Number(
          link.snapshot_amount ?? link.snapshotAmount ?? order.total_bill ?? order.totalBill ?? 0
        );
        const serviceFee = Number(order.service_fee ?? order.serviceFee ?? 0);
        const shippingCost = Number(
          order.customer_shipping ??
            order.customerShipping ??
            order.local_shipping ??
            order.localShipping ??
            0
        );

        return (
          <div
            key={link.id || order.id}
            className="overflow-hidden rounded-2xl border border-brand-200/90 bg-white shadow-2xs"
          >
            <div
              className={
                'flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 ' +
                'bg-brand-50/70 px-4 py-2.5 border-b border-brand-200 text-xs'
              }
            >
              <div>
                <span className="font-extrabold text-brand-900">{orderNum}</span>
                {periodCode && (
                  <span
                    className={
                      'ml-2 inline-block rounded-md bg-white border border-brand-200 ' +
                      'px-2 py-0.5 text-[10px] font-bold text-brand-700'
                    }
                  >
                    {periodCode} {periodName ? `• ${periodName}` : ''}
                  </span>
                )}
              </div>
              <span className="font-black text-brand-950">{money(totalAmount)}</span>
            </div>

            {(() => {
              const customerNotes = order.customer_notes || order.customerNotes;
              if (!customerNotes) return null;
              return (
                <div className="flex items-start gap-2 bg-amber-50/70 border-b border-amber-200/80 px-4 py-2 text-xs">
                  <MessageSquareText size={14} className="text-amber-600 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="font-bold text-amber-900 mr-1.5">Customer Note:</span>
                    <span className="text-amber-800 break-words">{customerNotes}</span>
                  </div>
                </div>
              );
            })()}

            <div className="divide-y divide-brand-100">
              {groupPublicOrderItems(order.items || []).map((row) => {
                if (row.isBundle) {
                  return (
                    <div
                      key={row.id}
                      className="flex items-start justify-between gap-3 p-3.5 text-xs hover:bg-brand-50/30 transition-colors"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        {row.photoUrl ? (
                          <img
                            src={row.photoUrl}
                            alt=""
                            className="h-11 w-11 rounded-xl object-cover ring-1 ring-brand-100 shrink-0 mt-0.5"
                          />
                        ) : (
                          <div className="h-11 w-11 rounded-xl bg-brand-100/70 grid place-items-center text-brand-400 font-bold shrink-0 mt-0.5">
                            WTB
                          </div>
                        )}
                        <div className="min-w-0 space-y-1.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-black text-brand-950 uppercase tracking-wide">
                              {row.name}
                            </span>
                            <span className="rounded bg-amber-100 text-amber-800 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider shrink-0">
                              Bundle Promo
                            </span>
                          </div>

                          <div className="rounded-lg bg-brand-50/80 border border-brand-100/90 px-2.5 py-1.5 text-[11px] space-y-1 text-brand-700">
                            <p className="font-semibold text-brand-500 uppercase tracking-wider text-[9px]">
                              Bundle Items:
                            </p>
                            {row.items.map((it, idx) => {
                              const itQty = Number(it.quantity || 1);
                              const itName =
                                it.product?.name ||
                                it.manual_product_name ||
                                it.manualProductName ||
                                'Item';
                              const itSpecs = [
                                it.product?.brand_name || it.brand_name,
                                it.variant || it.variation,
                                it.size ? `Size: ${it.size}` : null,
                                it.color,
                              ]
                                .filter(Boolean)
                                .join(' • ');

                              return (
                                <div key={idx} className="flex items-center gap-2">
                                  <span className="text-brand-400">•</span>
                                  <span className="font-semibold text-brand-900">
                                    {itName}
                                  </span>
                                  {itSpecs && (
                                    <span className="text-brand-500 text-[10px]">
                                      ({itSpecs})
                                    </span>
                                  )}
                                  <span className="font-bold text-brand-800 ml-auto pl-2">
                                    x{itQty}
                                  </span>
                                </div>
                              );
                            })}
                          </div>

                          <p className="text-[10px] font-medium text-brand-500">
                            1 pack (Total {row.totalQty} pcs) × {money(row.totalSubtotal)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-black text-brand-900 text-sm">
                          {money(row.totalSubtotal)}
                        </span>
                      </div>
                    </div>
                  );
                }

                const item = row.items[0];
                const qty = row.totalQty;
                const subtotal = row.totalSubtotal;
                const unitPrice = qty > 0 ? Math.round(subtotal / qty) : 0;
                const photo = row.photoUrl;

                return (
                  <div
                    key={row.id}
                    className="flex items-center justify-between gap-3 p-3.5 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {photo ? (
                        <img
                          src={photo}
                          alt=""
                          className={
                            'h-11 w-11 rounded-xl object-cover ring-1 ring-brand-100 shrink-0'
                          }
                        />
                      ) : (
                        <div
                          className={
                            'h-11 w-11 rounded-xl bg-brand-100/70 grid place-items-center ' +
                            'text-brand-400 font-bold shrink-0'
                          }
                        >
                          WTB
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-extrabold text-brand-950 truncate flex items-center gap-1.5">
                          <span>{row.name}</span>
                        </p>
                        <p className="text-[11px] text-brand-400 truncate mt-0.5">
                          {[
                            row.brand,
                            item.variant || item.variation,
                            item.size ? `Size: ${item.size}` : null,
                            item.color,
                          ]
                            .filter(Boolean)
                            .join(' • ') || '-'}
                        </p>
                        <p className="text-[10px] font-medium text-brand-500 mt-0.5">
                          {qty} × {money(unitPrice)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-black text-brand-900">{money(subtotal)}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-brand-100 bg-brand-50/40 p-3 text-xs space-y-1">
              {serviceFee > 0 && (
                <div className="flex items-center justify-between text-cherry-800 text-[11px]">
                  <span>Jastip Service Fee:</span>
                  <span className="font-semibold">{money(serviceFee)}</span>
                </div>
              )}
              {shippingCost > 0 && (
                <div className="flex items-center justify-between text-sky-800 text-[11px]">
                  <span>Estimated Domestic Shipping (Ongkir):</span>
                  <span className="font-semibold">{money(shippingCost)}</span>
                </div>
              )}
              {(() => {
                const raw = order.additional_fees ?? order.additionalFees;
                const fees: any[] = Array.isArray(raw)
                  ? raw
                  : Number(order.additional_fee ?? order.additionalFee ?? 0) > 0
                  ? [{ type: 'Additional Surcharge', amount: Number(order.additional_fee ?? order.additionalFee) }]
                  : [];
                return fees.map((af, idx) => {
                  const feeName = af.type === 'Other' ? (af.customName || 'Other Additional Fee') : af.type;
                  return (
                    <div key={`af-${idx}`} className="flex items-center justify-between text-amber-800 text-[11px]">
                      <span>{feeName}:</span>
                      <span className="font-semibold">{money(Number(af.amount || 0))}</span>
                    </div>
                  );
                });
              })()}
              <div
                className={
                  'flex items-center justify-between pt-1 border-t ' +
                  'border-brand-200/60 font-black text-brand-950 text-xs'
                }
              >
                <span>Order Total:</span>
                <span>{money(totalAmount)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
