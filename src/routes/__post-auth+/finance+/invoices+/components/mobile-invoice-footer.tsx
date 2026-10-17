import React from 'react';
import { Building2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { date, money } from '~/lib/format';
import type { StageMode } from '../types';

interface MobileInvoiceFooterProps {
  invoice: any;
  invoiceSettings: any;
  activeDisplayMode: StageMode;
  totalBill: number;
  dpAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  paymentsChronological: any[];
}

export function MobileInvoiceFooter({
  invoice,
  invoiceSettings,
  activeDisplayMode,
  totalBill,
  dpAmount,
  paidAmount,
  outstandingAmount,
  paymentsChronological,
}: MobileInvoiceFooterProps) {
  const barcodePattern = [
    3, 1, 4, 1, 5, 2, 4, 1, 5, 2, 4, 1, 3, 2, 5, 1, 4, 2, 4, 3, 1, 3, 2, 4,
  ];

  const totalServiceFee = (invoice.orders || []).reduce(
    (acc: number, link: any) =>
      acc + Number(link.order?.service_fee ?? link.order?.serviceFee ?? 0),
    0
  );
  const totalShipping = (invoice.orders || []).reduce(
    (acc: number, link: any) =>
      acc +
      Number(
        link.order?.customer_shipping ??
          link.order?.customerShipping ??
          link.order?.local_shipping ??
          link.order?.localShipping ??
          0
      ),
    0
  );
  // Aggregate all additional fees across orders
  const allAdditionalFees: Array<{ name: string; amount: number }> = [];
  (invoice.orders || []).forEach((link: any) => {
    const raw = link.order?.additional_fees ?? link.order?.additionalFees;
    if (Array.isArray(raw)) {
      raw.forEach((f: any) => {
        const name = f.type === 'Other' ? (f.customName || 'Other Fee') : f.type;
        const amount = Number(f.amount || 0);
        if (amount > 0) {
          const existing = allAdditionalFees.find((item) => item.name === name);
          if (existing) existing.amount += amount;
          else allAdditionalFees.push({ name, amount });
        }
      });
    } else if (Number(link.order?.additional_fee ?? link.order?.additionalFee ?? 0) > 0) {
      const amount = Number(link.order?.additional_fee ?? link.order?.additionalFee);
      const existing = allAdditionalFees.find((item) => item.name === 'Additional Surcharge');
      if (existing) existing.amount += amount;
      else allAdditionalFees.push({ name: 'Additional Surcharge', amount });
    }
  });

  const totalAdditionalFee = allAdditionalFees.reduce((sum, f) => sum + f.amount, 0);
  const totalProductSubtotal = Math.max(
    0,
    totalBill - totalServiceFee - totalShipping - totalAdditionalFee
  );

  return (
    <>
      {/* 5. Summary Breakdown */}
      <div className="px-4 py-2 bg-white text-[11px]">
        <p className="text-[10px] font-black uppercase tracking-wider text-brand-500 mb-1.5">
          Billing Summary
        </p>
        <div className="space-y-1.5">
          {totalProductSubtotal > 0 && (totalServiceFee > 0 || totalShipping > 0 || allAdditionalFees.length > 0) && (
            <div className="flex items-center justify-between text-brand-600">
              <span>Product Subtotal:</span>
              <span className="font-semibold">{money(totalProductSubtotal)}</span>
            </div>
          )}
          {totalServiceFee > 0 && (
            <div className="flex items-center justify-between text-cherry-700 font-semibold">
              <span>Service Fee (Jastip Fee):</span>
              <span className="font-bold">{money(totalServiceFee)}</span>
            </div>
          )}
          {totalShipping > 0 && (
            <div className="flex items-center justify-between text-sky-800 font-semibold">
              <span>Estimated Shipping Cost (Ongkir):</span>
              <span className="font-bold">{money(totalShipping)}</span>
            </div>
          )}
          {allAdditionalFees.map((af, idx) => (
            <div key={`af-${idx}`} className="flex items-center justify-between text-amber-800 font-semibold">
              <span>{af.name}:</span>
              <span className="font-bold">{money(af.amount)}</span>
            </div>
          ))}

          <div className="flex items-center justify-between">
            <span className="text-brand-600 font-medium">Total Order Value:</span>
            <span className="font-black text-brand-950">{money(totalBill)}</span>
          </div>

          {Number(invoice.depositAmount) > 0 && (
            <div className="flex items-center justify-between text-purple-900 font-bold">
              <span>Deposit Deduction (Potongan Deposit):</span>
              <span className="font-black">- {money(invoice.depositAmount)}</span>
            </div>
          )}

          {activeDisplayMode === 'DP' ? (
            <>
              <div
                className={
                  'flex items-center justify-between pt-1 border-t border-brand-200/80 ' +
                  'text-amber-950 font-bold'
                }
              >
                <span>DP Bill ({invoice.dpPercent || 50}%):</span>
                <span className="text-xs font-black text-amber-900">{money(dpAmount)}</span>
              </div>
              <div className="flex items-center justify-between text-brand-600 text-[10px]">
                <span>Balance at Settlement:</span>
                <span className="font-bold">{money(Math.max(0, totalBill - dpAmount))}</span>
              </div>
              <p className="text-[9px] text-brand-500 font-medium">
                * Settlement {invoice.dpSettlementNote || 'when products are ready to ship'}
              </p>
            </>
          ) : activeDisplayMode === 'SETTLEMENT' ? (
            <>
              <div className="flex items-center justify-between text-emerald-800 font-bold">
                <span>DP Received:</span>
                <span className="font-black">- {money(paidAmount)}</span>
              </div>
              <div
                className={
                  'flex items-center justify-between pt-1 border-t border-brand-200/80 ' +
                  'text-cherry-950'
                }
              >
                <span className="font-black">Remaining Balance to Pay:</span>
                <span className="text-xs font-black text-cherry-900">
                  {money(outstandingAmount)}
                </span>
              </div>
              <p className="text-[9px] text-brand-500 font-medium">
                * Please settle the balance for shipping
              </p>
            </>
          ) : activeDisplayMode === 'PAID' ? (
            <>
              <div className="flex items-center justify-between text-emerald-800 font-bold">
                <span>Total Paid:</span>
                <span className="font-black">{money(paidAmount)}</span>
              </div>
              <div
                className={
                  'flex items-center justify-between pt-1 border-t border-brand-200/80 ' +
                  'text-emerald-950'
                }
              >
                <span className="font-black">Remaining Balance:</span>
                <span className="text-xs font-black text-emerald-800">Rp 0 (PAID)</span>
              </div>
              <div
                className={
                  'mt-1 flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 ' +
                  'text-[10px] font-bold text-emerald-900 border border-emerald-200'
                }
              >
                <CheckCircle2 size={11} className="text-emerald-600 shrink-0" />
                <span>All bills have been fully paid and verified.</span>
              </div>
            </>
          ) : (
            <div
              className={
                'flex items-center justify-between pt-1 border-t border-brand-200/80 ' +
                'font-black text-brand-950'
              }
            >
              <span>Total Bill:</span>
              <span className="text-xs font-black">{money(totalBill)}</span>
            </div>
          )}
        </div>
      </div>

      {/* 6. Bank Transfer or Payment Verification */}
      {activeDisplayMode !== 'PAID' && outstandingAmount > 0 ? (
        <div
          className="mx-4 my-2 rounded-xl border border-brand-300 bg-brand-50/80 p-2.5 text-[11px]"
        >
          <div className="flex items-center gap-1.5 mb-1.5 text-brand-950 font-black">
            <Building2 size={13} className="text-cherry-600 shrink-0" />
            <span>Payment Transfer Account</span>
          </div>
          <div className="rounded-lg bg-white p-2 border border-brand-200 shadow-sm">
            <p className="text-[9px] font-extrabold text-brand-500 uppercase">
              {invoiceSettings.bankName || 'BCA / Bank Transfer'}
            </p>
            <p
              className={
                'text-base font-black tracking-wider text-brand-950 my-0.5 ' +
                'select-all leading-tight'
              }
            >
              {invoiceSettings.accountNumber || '1234567890'}
            </p>
            <p className="text-[10px] font-bold text-brand-700">
              a.n. {invoiceSettings.accountHolder || 'WORTHTOBUY'}
            </p>
          </div>
          <p className="text-[9px] text-brand-500 font-medium mt-1 leading-snug">
            * Include Invoice No. <strong>{invoice.invoiceNumber}</strong> in the transfer notes.
          </p>
        </div>
      ) : activeDisplayMode === 'PAID' ? (
        <div
          className={
            'mx-4 my-2 rounded-xl border border-emerald-300 bg-emerald-50/90 p-2.5 text-[11px]'
          }
        >
          <div className="flex items-center gap-1.5 mb-1.5 text-emerald-950 font-black">
            <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
            <span>Official Payment Verification</span>
          </div>
          <div className="space-y-1 text-[10px]">
            {paymentsChronological.length ? (
              paymentsChronological.map((payment: any, pIdx: number) => (
                <div
                  key={payment.id || pIdx}
                  className={
                    'flex items-center justify-between rounded-md bg-white p-1.5 ' +
                    'border border-emerald-200'
                  }
                >
                  <div>
                    <p className="font-extrabold text-emerald-950">
                      {payment.method || 'Bank Transfer'}
                    </p>
                    <p className="text-[9px] text-brand-500">
                      {date(payment.paymentDate)} • {payment.paymentNumber || '-'}
                    </p>
                  </div>
                  <span className="font-black text-emerald-800">
                    {money(payment.amount)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-[10px] text-emerald-900 font-bold">
                Total verified payments: {money(paidAmount)}
              </p>
            )}
          </div>
          <p className="text-[9px] text-emerald-900 font-bold mt-1 text-center">
            ✓ Payment is valid & recorded in the system WORTHTOBUY.
          </p>
        </div>
      ) : null}

      {/* 7. Barcode Simulation Watermark & Footer */}
      <footer className="bg-brand-50 px-4 py-2.5 text-center border-t border-brand-200">
        <div className="mx-auto flex h-6 w-36 items-center justify-center gap-0.5 opacity-80">
          {barcodePattern.map((w, i) => (
            <div key={i} className="bg-brand-950 h-full" style={{ width: `${w}px` }} />
          ))}
        </div>
        <p className="mt-0.5 font-mono text-[9px] font-bold tracking-widest text-brand-500">
          {invoice.invoiceNumber}
        </p>
        <p className="mt-1 text-[9px] font-semibold text-brand-700 leading-tight">
          {invoice.notes || invoiceSettings.footer || 'Thank you for shopping with WORTHTOBUY!'}
        </p>
      </footer>
    </>
  );
}
