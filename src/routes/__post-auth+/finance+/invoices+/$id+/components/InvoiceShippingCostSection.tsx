import React, { useState, useEffect, useMemo } from 'react';
import { Truck, Check, Edit2, Lock } from 'lucide-react';
import { money } from '~/lib/format';

interface InvoiceShippingCostSectionProps {
  invoice?: any;
  orders: any[];
  updatingScheme: boolean;
  updateShippingCost?: (orderId: number, shippingCost: number) => Promise<void>;
}

export function InvoiceShippingCostSection({
  invoice,
  orders,
  updatingScheme,
  updateShippingCost,
}: InvoiceShippingCostSectionProps) {
  if (!orders || orders.length === 0 || !updateShippingCost) return null;

  const [shippingValues, setShippingValues] = useState<Record<number, string>>({});
  const [editingMap, setEditingMap] = useState<Record<number, boolean>>({});
  const [savingOrderId, setSavingOrderId] = useState<number | null>(null);

  const hasSubmittedProof = useMemo(() => {
    if (!invoice) return false;
    const payments = invoice.payments || [];
    const hasProof = payments.some(
      (p: any) => Boolean(p.proof_url || p.proofUrl || p.status === 'VERIFIED')
    );
    const hasPaid = Number(invoice.paid_amount ?? invoice.paidAmount ?? 0) > 0;
    return hasProof || hasPaid;
  }, [invoice]);

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
      setEditingMap((prev) => ({ ...prev, [orderId]: false }));
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
          <div
            className="grid h-7 w-7 place-items-center rounded-lg bg-sky-600 text-white shrink-0"
          >
            <Truck size={14} />
          </div>
          <div>
            <p className="font-extrabold text-sky-950 text-xs">
              Step 1: Estimated Shipping Cost (Ongkos Kirim)
            </p>
            <p className="text-[11px] text-sky-700 font-medium">
              {hasSubmittedProof
                ? 'Shipping is locked: payment proof submitted.'
                : 'Input shipping once and save. Editable until proof submitted.'}
            </p>
          </div>
        </div>
        {totalShipping > 0 && (
          <span
            className={
              'rounded-lg bg-sky-100 border border-sky-300 px-2.5 py-1 ' +
              'text-xs font-black text-sky-950 self-start sm:self-auto'
            }
          >
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

          const savedShipping = Number(
            order.customer_shipping ??
              order.customerShipping ??
              order.local_shipping ??
              order.localShipping ??
              0
          );

          const isEditing = !hasSubmittedProof && (
            editingMap[order.id] ?? (savedShipping === 0)
          );

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
                {isEditing ? (
                  <>
                    <div className="relative">
                      <span
                        className={
                          'absolute left-2.5 top-1/2 -translate-y-1/2 ' +
                          'text-xs font-bold text-sky-700'
                        }
                      >
                        Rp
                      </span>
                      <input
                        type="text"
                        disabled={isSaving}
                        className={
                          'w-32 rounded-lg border border-sky-300 bg-white py-1 pl-8 pr-2 ' +
                          'text-xs font-black text-sky-950 focus:border-sky-500 ' +
                          'focus:outline-none disabled:opacity-60'
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
                      {savingOrderId === order.id ? 'Saving...' : 'Save Shipping'}
                    </button>
                    {savedShipping > 0 && (
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => {
                          setShippingValues((prev) => ({
                            ...prev,
                            [order.id]: String(savedShipping || ''),
                          }));
                          setEditingMap((prev) => ({ ...prev, [order.id]: false }));
                        }}
                        className={
                          'rounded-lg border border-brand-200 bg-white px-2.5 py-1 ' +
                          'text-xs font-bold text-brand-600 hover:bg-brand-50'
                        }
                      >
                        Cancel
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <span className="text-xs font-black text-sky-950">
                      {money(savedShipping)}
                    </span>
                    <span
                      className={
                        'inline-flex items-center gap-1 rounded-md bg-emerald-50 ' +
                        'border border-emerald-200 px-2 py-0.5 text-[10px] font-bold ' +
                        'text-emerald-800'
                      }
                    >
                      <Check size={11} /> Saved
                    </span>
                    {!hasSubmittedProof ? (
                      <button
                        type="button"
                        disabled={updatingScheme}
                        onClick={() => {
                          setShippingValues((prev) => ({
                            ...prev,
                            [order.id]: String(savedShipping || ''),
                          }));
                          setEditingMap((prev) => ({ ...prev, [order.id]: true }));
                        }}
                        className={
                          'inline-flex items-center gap-1 rounded-lg border ' +
                          'border-sky-300 bg-white px-2.5 py-1 text-xs font-bold ' +
                          'text-sky-700 hover:bg-sky-50 transition shadow-2xs'
                        }
                      >
                        <Edit2 size={11} /> Edit Shipping
                      </button>
                    ) : (
                      <span
                        className={
                          'inline-flex items-center gap-1 rounded-md bg-amber-50 ' +
                          'border border-amber-300 px-2 py-0.5 text-[10px] font-bold ' +
                          'text-amber-900'
                        }
                        title="Customer has submitted payment proof. Shipping is locked."
                      >
                        <Lock size={11} /> Locked (Proof submitted)
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
