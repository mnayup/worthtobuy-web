import React from 'react';
import { Package, Calendar, FileText, User } from 'lucide-react';
import { money } from '~/lib/format';
import { StatusBadge } from '~/components/StatusBadge';
import type { Purchase } from '../types';

interface PurchaseDetailInfoGridProps {
  purchase: Purchase;
  order: any;
  isPartial: boolean;
  estPrice: number;
  actualPrice: number;
  priceDiff: number;
}

export function PurchaseDetailInfoGrid({
  purchase,
  order,
  isPartial,
  estPrice,
  actualPrice,
  priceDiff,
}: PurchaseDetailInfoGridProps) {
  const isMultiItem = Boolean(purchase.items && purchase.items.length > 1);
  const eventName = purchase.period?.name || purchase.period?.code || '-';
  const reqItemName =
    purchase.product_summary ||
    purchase.product?.name ||
    purchase.orderItem?.manualProductName ||
    purchase.order_item?.manual_product_name ||
    '-';
  const brandName = purchase.brandName || purchase.brand_name || '-';
  const orderNum = order?.orderNumber || order?.order_number || '-';
  const custName =
    order?.customer?.fullName || order?.customer?.full_name || '-';
  const totalBill = money(order?.totalBill ?? order?.total_bill);
  const balance = money(order?.outstandingAmount ?? order?.outstanding_amount);

  return (
    <div className="space-y-4">
      {/* Info Cards Grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        {/* Item & Brand / Event */}
        <div className="rounded-2xl border border-brand-100 bg-brand-50/40 p-4 space-y-2">
          <div
            className={
              'flex items-center gap-2 text-xs font-bold text-brand-500 ' +
              'uppercase tracking-wider'
            }
          >
            <Package size={14} className="text-brand-600" />
            <span>Target Purchase Item</span>
          </div>
          <p className="font-black text-brand-900 text-base leading-snug">
            {reqItemName}
          </p>
          <div
            className={
              'flex justify-between text-xs text-brand-600 font-medium ' +
              'pt-1 border-t border-brand-100/70'
            }
          >
            <span>
              Brand:{' '}
              <strong className="text-brand-900 font-bold">{brandName}</strong>
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={12} className="text-brand-400" />
              Event:{' '}
              <strong className="text-brand-900 font-bold">{eventName}</strong>
            </span>
          </div>
        </div>

        {/* Order & Customer */}
        <div className="rounded-2xl border border-brand-100 bg-brand-50/40 p-4 space-y-2">
          <div
            className={
              'flex items-center gap-2 text-xs font-bold text-brand-500 ' +
              'uppercase tracking-wider'
            }
          >
            <FileText size={14} className="text-brand-600" />
            <span>{isMultiItem ? 'Consolidated Orders' : 'Order & Customer'}</span>
          </div>
          {isMultiItem ? (
            <div className="space-y-1 text-xs text-brand-600">
              <div className="flex justify-between items-center">
                <span className="font-black text-brand-900 text-sm">
                  {purchase.items?.length} Customer Orders
                </span>
                <span className="text-brand-500 font-bold">
                  Target: {purchase.eligibleQuantity ?? purchase.quantity} pcs
                </span>
              </div>
              <p className="text-xs text-brand-500">
                Consolidated purchase across same event & items.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span className="font-black text-brand-900 text-sm">
                  {orderNum}
                </span>
                {order?.status && <StatusBadge value={order.status} />}
              </div>
              <div className="text-xs text-brand-600 font-medium space-y-1">
                <div className="flex items-center gap-1.5">
                  <User size={12} className="text-brand-400" />
                  <span className="font-semibold text-brand-800">{custName}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-brand-100/70">
                  <span>
                    Total:{' '}
                    <strong className="text-brand-900 font-bold">
                      {totalBill}
                    </strong>
                  </span>
                  <span
                    className={
                      isPartial
                        ? 'text-rose-600 font-bold'
                        : 'text-emerald-600 font-bold'
                    }
                  >
                    Balance: {balance} {isPartial ? '(Partial DP)' : '(Paid)'}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Pricing Summary */}
      <div
        className={
          'rounded-2xl border border-brand-100 p-4 bg-white ' +
          'grid grid-cols-3 gap-2 text-center shadow-xs'
        }
      >
        <div>
          <div className="text-[11px] font-bold uppercase text-brand-400">
            Estimated Cost
          </div>
          <div className="text-sm font-black text-brand-800">
            {money(estPrice)}
          </div>
        </div>
        <div>
          <div className="text-[11px] font-bold uppercase text-brand-400">
            Actual Cost
          </div>
          <div className="text-sm font-black text-brand-900">
            {money(actualPrice)}
          </div>
        </div>
        <div>
          <div className="text-[11px] font-bold uppercase text-brand-400">
            Difference
          </div>
          <div
            className={
              'text-sm font-black ' +
              (priceDiff > 0 ? 'text-rose-600' : 'text-emerald-600')
            }
          >
            {money(priceDiff)}
          </div>
        </div>
      </div>
    </div>
  );
}
