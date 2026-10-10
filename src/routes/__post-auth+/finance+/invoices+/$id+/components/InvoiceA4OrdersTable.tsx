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
      {orders?.map((link: any) => (
        <section key={link.id} className="overflow-hidden rounded-xl border border-brand-200">
          <div
            className={
              'flex flex-col gap-1.5 bg-brand-50 px-3.5 py-2 sm:flex-row ' +
              'sm:items-center sm:justify-between border-b border-brand-200'
            }
          >
            <div>
              <p className="font-extrabold text-brand-900 text-xs">
                {link.order.orderNumber}
              </p>
              <p className="text-[11px] font-semibold text-brand-500">
                {link.order.period?.code} • {link.order.period?.name} •{' '}
                {date(link.order.orderDate)}
              </p>
            </div>
            <p className="font-black text-brand-900 text-xs">
              {money(link.snapshotAmount)}
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
                {link.order.items?.map((item: any) => (
                  <tr key={item.id} className="hover:bg-brand-50/50">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2.5">
                        {(item.photoUrl || item.product?.imageUrl) && (
                          <img
                            src={item.photoUrl || item.product?.imageUrl}
                            className="h-8 w-8 rounded-lg object-cover ring-1 ring-brand-100"
                            alt=""
                          />
                        )}
                        <div>
                          <p className="text-xs font-extrabold text-brand-900">
                            {item.product?.name || item.manualProductName || 'Custom Item'}
                          </p>
                          <p className="text-[10px] font-medium text-brand-400">
                            {[item.variation, item.size, item.color]
                              .filter(Boolean)
                              .join(' • ') || titleCase(item.sourceType)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-xs font-semibold text-brand-600">
                      {item.product?.brandName || item.brandName || '-'}
                    </td>
                    <td className="px-3 py-2 text-center text-xs font-bold">{item.quantity}</td>
                    <td className="px-3 py-2">
                      <StatusBadge value={item.fulfillmentStatus} />
                    </td>
                    <td className="px-3 py-2 text-right text-xs">
                      {money(item.unitPriceForeign)}
                    </td>
                    <td className="px-3 py-2 text-right text-xs font-black text-brand-900">
                      {money(Number(item.unitPriceForeign) * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}
