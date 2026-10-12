import React from 'react';
import { money } from '~/lib/format';

interface PublicInvoiceOrdersTableProps {
  orders: any[];
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

            <div className="divide-y divide-brand-100">
              {(order.items || []).map((item: any) => {
                const unitPrice = Number(
                  item.unit_price_foreign ??
                    item.unitPriceForeign ??
                    item.target_price_idr ??
                    item.targetPriceIdr ??
                    0
                );
                const qty = Number(item.quantity || 1);
                const subtotal = unitPrice * qty;
                const photo =
                  item.photo_url ||
                  item.photoUrl ||
                  item.product?.image_url ||
                  item.product?.imageUrl;

                return (
                  <div
                    key={item.id}
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
                        <p className="font-extrabold text-brand-950 truncate">
                          {item.product?.name ||
                            item.manual_product_name ||
                            item.manualProductName ||
                            'Ordered Item'}
                        </p>
                        <p className="text-[11px] text-brand-400 truncate mt-0.5">
                          {[
                            item.product?.brand_name || item.brand_name,
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
