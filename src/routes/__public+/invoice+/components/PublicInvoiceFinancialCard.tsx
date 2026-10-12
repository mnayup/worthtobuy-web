import React from 'react';
import { money } from '~/lib/format';

interface PublicInvoiceFinancialCardProps {
  invoice: any;
  currentStage: 'DP' | 'SETTLEMENT' | 'PAID' | 'FULL_UNPAID';
  totalBill: number;
  paidAmount: number;
  outstandingAmount: number;
  dpAmount: number;
  dpPercent: number;
}

export function PublicInvoiceFinancialCard({
  invoice,
  currentStage,
  totalBill,
  paidAmount,
  outstandingAmount,
  dpAmount,
  dpPercent,
}: PublicInvoiceFinancialCardProps) {
  const isDpScheme =
    invoice?.billing_model === 'DP' ||
    invoice?.billingModel === 'DP' ||
    dpAmount > 0;
  const depositUsed = Number(invoice?.deposit_amount ?? invoice?.depositAmount ?? 0);

  const totalShipping = (invoice?.orders || []).reduce(
    (sum: number, link: any) =>
      sum +
      Number(
        link.order?.customer_shipping ??
          link.order?.customerShipping ??
          link.order?.local_shipping ??
          link.order?.localShipping ??
          0
      ),
    0
  );

  const totalServiceFee = (invoice?.orders || []).reduce(
    (sum: number, link: any) =>
      sum + Number(link.order?.service_fee ?? link.order?.serviceFee ?? 0),
    0
  );

  const productSubtotal = Math.max(0, totalBill - totalServiceFee - totalShipping);

  return (
    <div className="rounded-3xl border border-brand-200/90 bg-white p-5 sm:p-6 shadow-sm space-y-4">
      <h2
        className={
          'text-sm font-black uppercase tracking-wider text-brand-900 ' +
          'border-b border-brand-100 pb-3'
        }
      >
        Invoice Summary (Ringkasan Tagihan)
      </h2>

      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between text-brand-600">
          <span>Product Subtotal:</span>
          <span className="font-bold text-brand-800">{money(productSubtotal)}</span>
        </div>
        {totalServiceFee > 0 && (
          <div className="flex items-center justify-between text-cherry-700">
            <span>Jastip Service Fee:</span>
            <span className="font-bold">{money(totalServiceFee)}</span>
          </div>
        )}
        {totalShipping > 0 && (
          <div className="flex items-center justify-between text-sky-800">
            <span>Estimated Shipping Cost (Ongkir):</span>
            <span className="font-bold">{money(totalShipping)}</span>
          </div>
        )}
        <div
          className={
            'flex items-center justify-between border-t border-brand-100 ' +
            'pt-2 font-black text-brand-950 text-sm'
          }
        >
          <span>Total Order Value:</span>
          <span>{money(totalBill)}</span>
        </div>
        {depositUsed > 0 && (
          <div className="flex items-center justify-between text-emerald-700 font-semibold text-xs">
            <span>Deposit Deduction (Potongan Deposit):</span>
            <span>- {money(depositUsed)}</span>
          </div>
        )}
      </div>

      {isDpScheme ? (
        <div className="space-y-2.5 rounded-2xl bg-amber-50/80 border border-amber-200 p-4 text-xs">
          <div className="flex items-center justify-between font-black text-amber-950 text-sm">
            <span>Down Payment Target ({dpPercent}%):</span>
            <span className="text-base font-black text-amber-950">{money(dpAmount)}</span>
          </div>
          <div className="flex items-center justify-between text-amber-800 font-medium">
            <span>Remaining at Settlement (Sisa Pelunasan):</span>
            <span className="font-bold">
              {money(Math.max(0, totalBill - dpAmount - depositUsed))}
            </span>
          </div>
          {paidAmount > 0 && (
            <div
              className={
                'flex items-center justify-between text-emerald-800 font-bold ' +
                'border-t border-amber-200 pt-2'
              }
            >
              <span>Verified Amount Paid (Sudah Diverifikasi):</span>
              <span>{money(paidAmount)}</span>
            </div>
          )}
          <div
            className={
              'flex items-center justify-between border-t border-amber-300/80 ' +
              'pt-2 font-black text-amber-950 text-sm'
            }
          >
            <span>Current Outstanding Balance (Sisa Tagihan):</span>
            <span className="text-cherry-700 font-black text-base">
              {money(outstandingAmount)}
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-2 rounded-2xl bg-brand-50/80 border border-brand-200 p-4 text-xs">
          <div className="flex items-center justify-between text-brand-700 font-semibold">
            <span>Verified Paid Amount (Sudah Dibayar):</span>
            <span className="font-black text-emerald-700">{money(paidAmount)}</span>
          </div>
          <div
            className={
              'flex items-center justify-between border-t border-brand-200 ' +
              'pt-2 font-black text-brand-950 text-sm'
            }
          >
            <span>Outstanding Balance (Sisa Tagihan):</span>
            <span className="text-cherry-700 font-black text-base">
              {money(outstandingAmount)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
