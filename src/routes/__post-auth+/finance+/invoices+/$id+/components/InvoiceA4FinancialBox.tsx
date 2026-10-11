import React from 'react';
import { money } from '~/lib/format';
import { SummaryLine } from './InvoiceSummaryLine';
import type { StageMode } from '../types';

interface InvoiceA4FinancialBoxProps {
  invoice: any;
  invoiceSettings: any;
  activeDisplayMode: StageMode;
  totalBill: number;
  paidAmount: number;
  outstandingAmount: number;
  dpAmount: number;
}

export function InvoiceA4FinancialBox({
  invoice,
  invoiceSettings,
  activeDisplayMode,
  totalBill,
  paidAmount,
  outstandingAmount,
  dpAmount,
}: InvoiceA4FinancialBoxProps) {
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
  const totalProductSubtotal = Math.max(
    0,
    totalBill - totalServiceFee - totalShipping
  );

  const depositUsed = Number(invoice.depositAmount || invoice.deposit_amount || 0);

  const renderBreakdown = () => (
    <>
      {totalServiceFee > 0 || totalShipping > 0 ? (
        <>
          <SummaryLine label="Product Subtotal" value={money(totalProductSubtotal)} />
          {totalServiceFee > 0 && (
            <SummaryLine
              label="Service Fee (Jastip Fee)"
              value={money(totalServiceFee)}
            />
          )}
          {totalShipping > 0 && (
            <SummaryLine
              label="Estimated Shipping Cost (Ongkir)"
              value={money(totalShipping)}
            />
          )}
          <SummaryLine label="Total Order Value" value={money(totalBill)} strong />
        </>
      ) : (
        <SummaryLine label="Total Order Value" value={money(totalBill)} strong />
      )}
      {depositUsed > 0 && (
        <SummaryLine
          label="Deposit Deduction (Potongan Deposit)"
          value={`- ${money(depositUsed)}`}
        />
      )}
    </>
  );

  return (
    <div
      className={
        'mt-3.5 grid gap-4 lg:grid-cols-[1fr_320px] print:grid-cols-[1fr_300px] items-start'
      }
      style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
    >
      <div className="space-y-2.5">
        {activeDisplayMode !== 'PAID' && outstandingAmount > 0 ? (
          <div className="rounded-xl border border-brand-200 bg-brand-50/70 p-3 text-xs">
            <p className="text-[10px] font-extrabold uppercase text-brand-500 tracking-wider">
              Payment Transfer Account
            </p>
            <p className="text-sm font-black text-brand-950 mt-0.5">
              {invoiceSettings.bankName || 'BCA / Bank Transfer'} •{' '}
              {invoiceSettings.accountNumber || '1234567890'}
            </p>
            <p className="text-[11px] font-bold text-brand-700">
              a.n. {invoiceSettings.accountHolder || 'WORTHTOBUY'}
            </p>
            <p className="text-[10px] text-brand-500 mt-1 leading-tight">
              * Please include Invoice No. <strong>{invoice.invoiceNumber || invoice.invoice_number}</strong> in notes.
            </p>
          </div>
        ) : activeDisplayMode === 'PAID' ? (
          <div className="rounded-xl border border-emerald-300 bg-emerald-50/80 p-3 text-xs">
            <p className="text-[10px] font-extrabold uppercase text-emerald-700 tracking-wider">
              Payment Status
            </p>
            <p className="text-sm font-black text-emerald-950 mt-0.5 flex items-center gap-1.5">
              <span>✓</span> Payment Received in Full (Lunas)
            </p>
            <p className="text-[10px] text-emerald-800 mt-0.5">
              This document serves as an official payment receipt.
            </p>
          </div>
        ) : null}

        <div
          className={
            'rounded-xl bg-brand-50/50 p-2.5 text-[11px] leading-relaxed text-brand-700 ' +
            'border border-brand-100'
          }
        >
          <p className="font-bold text-brand-900 mb-0.5">Notes & Terms:</p>
          <p>
            {invoice.notes ||
              invoiceSettings.footer ||
              'Thank you for trusting your shopping to WORTHTOBUY!'}
          </p>
        </div>
      </div>

      <div
        className={
          'rounded-xl border-2 border-brand-900 bg-brand-50/70 p-3.5 ' +
          'text-brand-950 shadow-sm'
        }
        style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
      >
        {activeDisplayMode === 'DP' ? (
          <>
            {renderBreakdown()}
            {depositUsed > 0 && (
              <SummaryLine
                label="Net Bill (Tagihan Bersih)"
                value={money(Math.max(0, totalBill - depositUsed))}
                strong
              />
            )}
            <div className="my-1.5 rounded-lg bg-amber-100/90 border border-amber-300 p-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-950">
                  Down Payment Bill (Tagihan DP {invoice.dpPercent || invoice.dp_percent || 50}%):
                </span>
                <span className="text-base font-black text-amber-950">
                  {money(dpAmount)}
                </span>
              </div>
            </div>
            <SummaryLine
              label="Balance at Settlement (Sisa Pelunasan)"
              value={money(Math.max(0, totalBill - dpAmount - depositUsed))}
            />
          </>
        ) : activeDisplayMode === 'SETTLEMENT' ? (
          <>
            {renderBreakdown()}
            <SummaryLine label="Already Paid (DP)" value={`- ${money(paidAmount)}`} />
            <div className="my-1.5 rounded-lg bg-cherry-100/90 border border-cherry-300 p-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-cherry-950">
                  Settlement Balance Due (Sisa Pelunasan):
                </span>
                <span className="text-base font-black text-cherry-950">
                  {money(outstandingAmount)}
                </span>
              </div>
            </div>
          </>
        ) : activeDisplayMode === 'PAID' ? (
          <>
            {renderBreakdown()}
            <SummaryLine label="Total Paid" value={money(paidAmount)} />
            <div className="my-1.5 rounded-lg bg-emerald-100/90 border border-emerald-300 p-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-950">
                  Remaining Balance:
                </span>
                <span className="text-base font-black text-emerald-950">
                  Rp 0 (PAID IN FULL)
                </span>
              </div>
            </div>
          </>
        ) : (
          <>
            {renderBreakdown()}
            {depositUsed > 0 && (
              <SummaryLine
                label="Net Bill (Tagihan Bersih)"
                value={money(Math.max(0, totalBill - depositUsed))}
                strong
              />
            )}
            <SummaryLine label="Total Paid" value={money(paidAmount)} />
            <SummaryLine
              label="Outstanding Balance (Sisa Tagihan)"
              value={money(outstandingAmount)}
              strong
            />
          </>
        )}
      </div>
    </div>
  );
}
