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
              * Please include Invoice No. <strong>{invoice.invoiceNumber}</strong> in notes.
            </p>
          </div>
        ) : activeDisplayMode === 'PAID' ? (
          <div className="rounded-xl border border-emerald-300 bg-emerald-50/80 p-3 text-xs">
            <p className="text-[10px] font-extrabold uppercase text-emerald-700 tracking-wider">
              Payment Status
            </p>
            <p className="text-sm font-black text-emerald-950 mt-0.5 flex items-center gap-1.5">
              <span>✓</span> Pembayaran Telah Diterima Paid in Full
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
            <SummaryLine label="Total Order Value" value={money(totalBill)} />
            {Number(invoice.depositAmount) > 0 && (
              <>
                <SummaryLine
                  label="Potongan Saldo Deposit"
                  value={`- ${money(invoice.depositAmount)}`}
                />
                <SummaryLine
                  label="Tagihan Bersih"
                  value={money(
                    Math.max(0, totalBill - Number(invoice.depositAmount))
                  )}
                  strong
                />
              </>
            )}
            <div className="my-1.5 rounded-lg bg-amber-100/90 border border-amber-300 p-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-950">
                  Tagihan DP ({invoice.dpPercent || 50}%):
                </span>
                <span className="text-base font-black text-amber-950">
                  {money(dpAmount)}
                </span>
              </div>
            </div>
            <SummaryLine
              label="Balance at Settlement"
              value={money(
                Math.max(
                  0,
                  totalBill - dpAmount - Number(invoice.depositAmount || 0)
                )
              )}
            />
          </>
        ) : activeDisplayMode === 'SETTLEMENT' ? (
          <>
            <SummaryLine label="Total Order Value" value={money(totalBill)} />
            {Number(invoice.depositAmount) > 0 && (
              <SummaryLine
                label="Potongan Saldo Deposit"
                value={`- ${money(invoice.depositAmount)}`}
              />
            )}
            <SummaryLine label="Already Paid (DP)" value={`- ${money(paidAmount)}`} />
            <div className="my-1.5 rounded-lg bg-cherry-100/90 border border-cherry-300 p-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-cherry-950">
                  Sisa Perlu Settled:
                </span>
                <span className="text-base font-black text-cherry-950">
                  {money(outstandingAmount)}
                </span>
              </div>
            </div>
          </>
        ) : activeDisplayMode === 'PAID' ? (
          <>
            <SummaryLine label="Total Order Value" value={money(totalBill)} />
            {Number(invoice.depositAmount) > 0 && (
              <SummaryLine
                label="Potongan Saldo Deposit"
                value={`- ${money(invoice.depositAmount)}`}
              />
            )}
            <SummaryLine label="Total Paid" value={money(paidAmount)} />
            <div className="my-1.5 rounded-lg bg-emerald-100/90 border border-emerald-300 p-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-950">
                  Remaining Balance:
                </span>
                <span className="text-base font-black text-emerald-950">
                  Rp 0 (LUNAS)
                </span>
              </div>
            </div>
          </>
        ) : (
          <>
            <SummaryLine label="Total Bill" value={money(totalBill)} strong />
            {Number(invoice.depositAmount) > 0 && (
              <>
                <SummaryLine
                  label="Potongan Saldo Deposit"
                  value={`- ${money(invoice.depositAmount)}`}
                />
                <SummaryLine
                  label="Tagihan Bersih"
                  value={money(
                    Math.max(0, totalBill - Number(invoice.depositAmount))
                  )}
                  strong
                />
              </>
            )}
            <SummaryLine label="Total Paid" value={money(paidAmount)} />
            <SummaryLine
              label="Sisa Tagihan"
              value={money(outstandingAmount)}
              strong
            />
          </>
        )}
      </div>
    </div>
  );
}
