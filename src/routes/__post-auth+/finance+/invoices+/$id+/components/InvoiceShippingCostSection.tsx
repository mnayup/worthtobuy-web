import React, { useState, useEffect } from 'react';
import { Truck } from 'lucide-react';
import { money } from '~/lib/format';

interface InvoiceShippingCostSectionProps {
  orders: any[];
  updatingScheme: boolean;
  updateShippingCost?: (orderId: number, shippingCost: number) => Promise<void>;
}

export function InvoiceShippingCostSection({
  orders,
  updatingScheme,
  updateShippingCost,
}: InvoiceShippingCostSectionProps) {
  if (!orders || orders.length === 0 || !updateShippingCost) return null;

  const [shippingValues, setShippingValues] = useState<Record<number, string>>({});
  const [savingOrderId, setSavingOrderId] = useState<number | null>(null);

  useEffect(() => {
    const initial: Record<number, string> = {};
    orders.forEach((link: any) => {
      const order = link.order;
      if (order?.id) {
        const val = Number(
          order.customer_shipping ??
            order.customerShipping ??
            order.local_shipping ??
            order.localShipping ??
            0
        );
        initial[order.id] = String(val || '');
      }
    });
    setShippingValues(initial);
  }, [orders]);

  const handleSave = async (orderId: number) => {
    setSavingOrderId(orderId);
    try {
      const cost = Number((shippingValues[orderId] || '').replace(/\D/g, ''));
      await updateShippingCost(orderId, cost);
    } finally {
      setSavingOrderId(null);
    }
  };

  const totalShipping = orders.reduce((sum: number, link: any) => {
    const order = link.order;
    return (
      sum +
      Number(
        order?.customer_shipping ??
          order?.customerShipping ??
          order?.local_shipping ??
          order?.localShipping ??
          0
      )
    );
  }, 0);

  return (
    <div className="rounded-xl border border-sky-200 bg-sky-50/70 p-3.5 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-lg bg-sky-600 text-white shrink-0">
            <Truck size={14} />
          </div>
          <div>
            <p className="font-extrabold text-sky-950 text-xs">
              Step 1: Estimated Shipping Cost (Ongkos Kirim)
            </p>
            <p className="text-[11px] text-sky-700 font-medium">
              Set or adjust delivery cost before selecting DP or Full Payment.
            </p>
          </div>
        </div>
        {totalShipping > 0 && (
          <span className="rounded-lg bg-sky-100 border border-sky-300 px-2.5 py-1 text-xs font-black text-sky-900 self-start sm:self-auto">
            Total Shipping: {money(totalShipping)}
          </span>
        )}
      </div>

      <div className="space-y-2 border-t border-sky-200/80 pt-2.5">
        {orders.map((link: any) => {
          const order = link.order;
          if (!order?.id) return null;
          const orderNum = order.order_number || order.orderNumber || `Order #${order.id}`;
          const currentVal = shippingValues[order.id] ?? '';
          const isSaving = savingOrderId === order.id || updatingScheme;

          return (
            <div
              key={order.id}
              className={
                'flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ' +
                'rounded-lg bg-white p-2.5 border border-sky-200 text-xs shadow-2xs'
              }
            >
              <div className="min-w-0">
                <span className="font-extrabold text-brand-900">{orderNum}</span>
                {order.period?.code && (
                  <span className="ml-2 pill text-[10px] !py-0.2">
                    {order.period.code}
                  </span>
                )}
                <span className="block text-[10px] text-brand-400 truncate">
                  Order Total: {money(order.total_bill ?? order.totalBill ?? 0)}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-sky-700">
                    Rp
                  </span>
                  <input
                    type="text"
                    disabled={isSaving}
                    className={
                      'w-32 rounded-lg border border-sky-300 bg-white py-1 pl-8 pr-2 ' +
                      'text-xs font-black text-sky-950 focus:border-sky-500 focus:outline-none disabled:opacity-60'
                    }
                    placeholder="0"
                    value={currentVal ? Number(currentVal).toLocaleString('id-ID') : ''}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '');
                      setShippingValues((prev) => ({ ...prev, [order.id]: digits }));
                    }}
                  />
                </div>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSave(order.id)}
                  className={
                    'rounded-lg bg-sky-600 px-3 py-1 text-xs font-black ' +
                    'text-white hover:bg-sky-700 disabled:opacity-50 transition shadow-xs'
                  }
                >
                  {savingOrderId === order.id ? 'Saving...' : 'Save Shipping (Simpan Ongkir)'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
