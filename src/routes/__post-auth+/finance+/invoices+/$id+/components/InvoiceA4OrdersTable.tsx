import React from 'react';
import { date, money, titleCase } from '~/lib/format';
import { StatusBadge } from '~/components/StatusBadge';

interface InvoiceA4OrdersTableProps {
  orders: any[];
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
        const totalAmount = Number(
          link.snapshot_amount ??
            link.snapshotAmount ??
            order.total_bill ??
            order.totalBill ??
            0
        );
        const serviceFee = Number(order.service_fee ?? order.serviceFee ?? 0);
        const shippingCost = Number(
          order.customer_shipping ??
            order.customerShipping ??
            order.local_shipping ??
            order.localShipping ??
            0
        );
        const productSubtotal = Number(
          order.product_subtotal_idr ??
            order.productSubtotalIdr ??
            Math.max(0, totalAmount - serviceFee - shippingCost)
        );

        return (
          <section key={link.id} className="overflow-hidden rounded-xl border border-brand-200">
            <div
              className={
                'flex flex-col gap-1.5 bg-brand-50 px-3.5 py-2 sm:flex-row ' +
                'sm:items-center sm:justify-between border-b border-brand-200'
              }
            >
              <div>
                <p className="font-extrabold text-brand-900 text-xs">
                  {orderNumber}
                </p>
                <p className="text-[11px] font-semibold text-brand-500">
                  {[periodCode, periodName, orderDate ? date(orderDate) : null]
                    .filter(Boolean)
                    .join(' • ')}
                </p>
              </div>
              <p className="font-black text-brand-900 text-xs">
                {money(totalAmount)}
              </p>
            </div>
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
                  {order.items?.map((item: any) => {
                    const unitPrice = Number(
                      item.unit_price_foreign ??
                        item.unitPriceForeign ??
                        item.target_price_idr ??
                        item.targetPriceIdr ??
                        0
                    );
                    const qty = Number(item.quantity || 1);
                    const subtotal = unitPrice * qty;

                    return (
                      <tr key={item.id} className="hover:bg-brand-50/50">
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2.5">
                            {(item.photo_url ||
                              item.photoUrl ||
                              item.product?.image_url ||
                              item.product?.imageUrl) && (
                              <img
                                src={
                                  item.photo_url ||
                                  item.photoUrl ||
                                  item.product?.image_url ||
                                  item.product?.imageUrl
                                }
                                className="h-8 w-8 rounded-lg object-cover ring-1 ring-brand-100"
                                alt=""
                              />
                            )}
                            <div>
                              <p className="text-xs font-extrabold text-brand-900">
                                {item.product?.name ||
                                  item.manual_product_name ||
                                  item.manualProductName ||
                                  'Custom Item'}
                              </p>
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
                          {item.product?.brand_name ||
                            item.product?.brandName ||
                            item.brand_name ||
                            item.brandName ||
                            '-'}
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
                          {order.service_fee_note ? ` (${order.service_fee_note})` : ''}
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
