import React from 'react';
import { Truck } from 'lucide-react';
import { money } from '~/lib/format';

interface CreateInvoiceShippingStepProps {
  selectedOrders: any[];
  orderShippingMap: Record<number, number>;
  setOrderShipping: (orderId: number, amount: number) => void;
  totalShipping: number;
  totalBill: number;
}

export function CreateInvoiceShippingStep({
  selectedOrders,
  orderShippingMap,
  setOrderShipping,
  totalShipping,
  totalBill,
}: CreateInvoiceShippingStepProps) {
  if (!selectedOrders.length) return null;

  return (
    <div className="mb-5 rounded-2xl border border-sky-200 bg-sky-50/50 p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div
            className={
              'grid h-8 w-8 place-items-center rounded-xl bg-sky-600 ' +
              'text-white shrink-0 mt-0.5'
            }
          >
            <Truck size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-sky-950">
                Step 2: Estimated Shipping Cost (Ongkos Kirim)
              </span>
              <span
                className={
                  'rounded-md bg-sky-200/80 px-2 py-0.5 text-xs font-black text-sky-950'
                }
              >
                {money(totalShipping)}
              </span>
            </div>
            <p className="mt-1 text-xs text-sky-800 leading-relaxed">
              Set or adjust the domestic / destination shipping cost before selecting
              the payment scheme. This cost will be itemized in the invoice and included
              in the total order bill.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2.5 border-t border-sky-200/80 pt-3">
        {selectedOrders.map((order) => {
          const orderId = order.id;
          const orderNum = order.order_number || order.orderNumber || `Order #${orderId}`;
          const currentShipping = orderShippingMap[orderId] ?? Number(
            order.customer_shipping ??
              order.customerShipping ??
              order.local_shipping ??
              order.localShipping ??
              0
          );
          const serviceFee = Number(order.service_fee ?? order.serviceFee ?? 0);
          const initialShipping = Number(
            order.customer_shipping ??
              order.customerShipping ??
              order.local_shipping ??
              order.localShipping ??
              0
          );
          const baseBillWithoutShipping = Math.max(
            0,
            Number(order.total_bill ?? order.totalBill ?? 0) - initialShipping
          );
          const effectiveOrderTotal = baseBillWithoutShipping + currentShipping;

          const itemsSummary = (order.items || [])
            .map(
              (item: any) =>
                item.product?.name ||
                item.manual_product_name ||
                item.manualProductName
            )
            .filter(Boolean)
            .join(', ') || 'Custom item';

          return (
            <div
              key={orderId}
              className={
                'flex flex-col gap-2 rounded-xl bg-white p-3 border border-sky-200/80 ' +
                'sm:flex-row sm:items-center sm:justify-between shadow-2xs'
              }
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-extrabold text-brand-900">{orderNum}</p>
                  {order.period?.code && (
                    <span className="pill text-[10px] !py-0.2">
                      {order.period.code}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-brand-500 truncate max-w-sm">
                  {itemsSummary}
                </p>
                <p className="text-[10px] text-brand-400 mt-0.5">
                  Base (Products + Service Fee): {money(baseBillWithoutShipping)}
                  {serviceFee > 0 ? ` (incl. Service Fee: ${money(serviceFee)})` : ''}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div>
                  <label className="text-[10px] font-bold text-sky-900 block mb-0.5">
                    Shipping Cost (Ongkir)
                  </label>
                  <div className="relative">
                    <span
                      className={
                        'absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold ' +
                        'text-sky-700'
                      }
                    >
                      Rp
                    </span>
                    <input
                      type="text"
                      className={
                        'w-32 rounded-lg border border-sky-300 bg-white py-1 pl-8 pr-2 ' +
                        'text-xs font-bold text-sky-950 focus:border-sky-500 focus:outline-none'
                      }
                      placeholder="0"
                      value={currentShipping ? currentShipping.toLocaleString('id-ID') : ''}
                      onChange={(e) => {
                        const raw = Number(e.target.value.replace(/\D/g, ''));
                        setOrderShipping(orderId, raw);
                      }}
                    />
                  </div>
                </div>

                <div className="text-right pl-2 border-l border-sky-100 min-w-[90px]">
                  <p className="text-[10px] font-bold text-brand-400 uppercase">
                    Order Total
                  </p>
                  <p className="text-xs font-black text-brand-950">
                    {money(effectiveOrderTotal)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div
        className={
          'mt-3 flex items-center justify-between rounded-xl bg-sky-100/70 ' +
          'px-3.5 py-2 text-xs text-sky-950 font-bold border border-sky-200'
        }
      >
        <span>Total Order Value (Products + Fees + Shipping):</span>
        <span className="text-sm font-black text-sky-950">{money(totalBill)}</span>
      </div>
    </div>
  );
}
