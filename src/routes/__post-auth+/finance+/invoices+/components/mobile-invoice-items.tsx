import React from 'react';
import { Calendar, Package, User } from 'lucide-react';
import { date, money } from '~/lib/format';

interface MobileInvoiceItemsProps {
  invoice: any;
  eventCodes: string;
  allOrderItems: any[];
}

export function MobileInvoiceItems({
  invoice,
  eventCodes,
  allOrderItems,
}: MobileInvoiceItemsProps) {
  return (
    <>
      {/* 3. Customer & Metadata Info */}
      <div className="px-4 py-2 text-[11px] bg-white">
        <div className="flex items-center justify-between pb-1.5 border-b border-brand-100">
          <span className="text-brand-500 font-semibold flex items-center gap-1">
            <User size={11} className="text-brand-400" /> Pelanggan:
          </span>
          <span className="font-extrabold text-brand-950 text-right">
            {invoice.customer?.fullName}
          </span>
        </div>
        <div className="flex items-center justify-between py-1.5 border-b border-brand-100">
          <span className="text-brand-500 font-semibold">WhatsApp:</span>
          <span className="font-bold text-brand-800 text-right">
            {invoice.customer?.whatsapp}
          </span>
        </div>
        {invoice.customer?.city && (
          <div className="flex items-center justify-between py-1.5 border-b border-brand-100">
            <span className="text-brand-500 font-semibold">Kota Tujuan:</span>
            <span className="font-bold text-brand-800 text-right">
              {invoice.customer?.city}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between py-1.5 border-b border-brand-100">
          <span className="text-brand-500 font-semibold">Event / Trip:</span>
          <span className="font-extrabold text-cherry-700 text-right">{eventCodes}</span>
        </div>
        <div className="flex items-center justify-between pt-1.5">
          <span className="text-brand-500 font-semibold flex items-center gap-1">
            <Calendar size={11} className="text-brand-400" /> Jatuh Tempo:
          </span>
          <span className="font-black text-brand-950 text-right">
            {date(invoice.dueDate)}
          </span>
        </div>
      </div>

      {/* Perforation Divider 2 */}
      <div className="relative flex items-center justify-between bg-white py-0.5">
        <div
          className="h-4 w-4 rounded-full bg-brand-100 border border-brand-200 shadow-inner -ml-2"
        />
        <div className="flex-1 border-t border-dashed border-brand-300 mx-2" />
        <div
          className="h-4 w-4 rounded-full bg-brand-100 border border-brand-200 shadow-inner -mr-2"
        />
      </div>

      {/* 4. Compact Itemized Products List */}
      <div className="px-4 py-2 bg-white">
        <div className="flex items-center justify-between mb-1.5">
          <p
            className={
              'text-[10px] font-black uppercase tracking-wider text-brand-500 ' +
              'flex items-center gap-1'
            }
          >
            <Package size={11} className="text-brand-400" /> Rincian Item ({allOrderItems.length})
          </p>
          <span className="text-[9px] font-bold text-brand-500">
            {invoice.orders?.length || 0} No. Order
          </span>
        </div>
        <div className="space-y-1.5">
          {allOrderItems.map((item: any, idx: number) => {
            const subtitle =
              [item.product?.brandName || item.brandName, item.variation, item.size]
                .filter(Boolean)
                .join(' • ') || '-';

            return (
              <div
                key={item.id || idx}
                className={
                  'flex items-start gap-2 rounded-lg bg-brand-50/70 p-2 border border-brand-200/80'
                }
              >
                {item.photoUrl || item.product?.imageUrl ? (
                  <img
                    src={item.photoUrl || item.product?.imageUrl}
                    className="h-8 w-8 rounded-md object-cover ring-1 ring-brand-200 shrink-0"
                    alt=""
                  />
                ) : (
                  <div
                    className={
                      'grid h-8 w-8 place-items-center rounded-md bg-brand-200/70 ' +
                      'text-brand-600 text-[9px] font-bold shrink-0'
                    }
                  >
                    Item
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-black text-brand-950 truncate">
                    {item.product?.name || item.manualProductName || 'Item Pesanan'}
                  </p>
                  <p className="text-[9px] font-medium text-brand-500 truncate">{subtitle}</p>
                  <div className="mt-0.5 flex items-center justify-between text-[10px]">
                    <span className="font-bold text-brand-600">
                      {item.quantity}x {money(item.unitPriceForeign)}
                    </span>
                    <span className="font-black text-brand-950">
                      {money(Number(item.unitPriceForeign) * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Perforation Divider 3 */}
      <div className="relative flex items-center justify-between bg-white py-0.5">
        <div
          className="h-4 w-4 rounded-full bg-brand-100 border border-brand-200 shadow-inner -ml-2"
        />
        <div className="flex-1 border-t border-dashed border-brand-300 mx-2" />
        <div
          className="h-4 w-4 rounded-full bg-brand-100 border border-brand-200 shadow-inner -mr-2"
        />
      </div>
    </>
  );
}
