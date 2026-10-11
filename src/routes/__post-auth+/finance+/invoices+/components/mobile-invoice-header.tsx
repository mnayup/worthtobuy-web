import React from 'react';
import { Check, Receipt } from 'lucide-react';
import { date, dateTime, money } from '~/lib/format';
import type { StageMode } from '../types';

interface MobileInvoiceHeaderProps {
  invoice: any;
  brand: any;
  invoiceSettings: any;
  activeDisplayMode: StageMode;
  totalBill: number;
  dpAmount: number;
  paidAmount: number;
  outstandingAmount: number;
}

export function MobileInvoiceHeader({
  invoice,
  brand,
  invoiceSettings,
  activeDisplayMode,
  totalBill,
  dpAmount,
  paidAmount,
  outstandingAmount,
}: MobileInvoiceHeaderProps) {
  return (
    <>
      <header
        className={
          'relative overflow-hidden bg-brand-950 px-4 py-3.5 text-center text-white ' +
          'border-b-2 border-brand-900'
        }
        style={{ backgroundColor: '#0f172a', color: '#ffffff' }}
      >
        <div className="flex flex-col items-center">
          <div
            className="mb-1.5 grid h-11 w-11 place-items-center rounded-xl bg-white p-1 shadow-sm"
          >
            <img
              src={brand.logoUrl || '/worthtobuy-mark.png'}
              className="h-full w-full object-contain"
              alt="WORTHTOBUY"
            />
          </div>
          <p className="text-base font-black uppercase tracking-wider text-white">
            {invoiceSettings.businessName || brand.name || 'WORTHTOBUY'}
          </p>
          <p className="text-[10px] font-medium text-brand-300">
            {brand.tagline || 'Personal Shopper & Jastip Concierge'}
          </p>

          <div
            className={
              'mt-1.5 inline-flex items-center gap-1 rounded-full border border-white/20 ' +
              'bg-white/10 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider ' +
              'text-brand-200'
            }
          >
            <Receipt size={10} className="text-cherry-400" />
            <span>Digital Receipt & Billing</span>
          </div>

          <p className="mt-1 font-mono text-xs font-black text-brand-200 tracking-wide">
            {invoice.invoiceNumber}
          </p>
          <p className="text-[10px] font-medium text-brand-300">
            Date: {dateTime(invoice.invoiceDate || invoice.createdAt)}
          </p>
        </div>

        <div className="mt-2.5">
          {activeDisplayMode === 'DP' ? (
            <div
              className={
                'rounded-xl border-2 border-amber-400 bg-amber-50 p-2.5 text-center shadow-sm'
              }
            >
              <span
                className={
                  'inline-block rounded-md border border-amber-300 bg-amber-200/90 ' +
                  'px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-950'
                }
              >
                Down Payment Bill (Tagihan DP {invoice.dpPercent || 50}%)
              </span>
              <p className="mt-1 text-2xl font-black text-amber-950 tracking-tight leading-none">
                {money(dpAmount)}
              </p>
              <p className="mt-1 text-[10px] font-bold text-amber-800">
                Settlement balance later: {money(Math.max(0, totalBill - dpAmount))}
              </p>
              <div
                className={
                  'mt-1.5 inline-flex items-center gap-1 rounded-full border ' +
                  'border-amber-300 bg-amber-200/80 px-2 py-0.5 text-[9px] font-black ' +
                  'text-amber-950'
                }
              >
                <span className="h-1.5 w-1.5 rounded-full bg-amber-600 animate-pulse" />{' '}
                Awaiting Down Payment (Menunggu DP)
              </div>
            </div>
          ) : activeDisplayMode === 'SETTLEMENT' ? (
            <div
              className={
                'rounded-xl border-2 border-cherry-400 bg-cherry-50 p-2.5 text-center shadow-sm'
              }
            >
              <span
                className={
                  'inline-block rounded-md border border-cherry-300 bg-cherry-200/90 ' +
                  'px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-cherry-950'
                }
              >
                Remaining Settlement Bill
              </span>
              <p className="mt-1 text-2xl font-black text-cherry-950 tracking-tight leading-none">
                {money(outstandingAmount)}
              </p>
              <p className="mt-1 text-[10px] font-bold text-cherry-800">
                ✓ DP {money(paidAmount)} received previously
              </p>
              <div
                className={
                  'mt-1.5 inline-flex items-center gap-1 rounded-full border ' +
                  'border-cherry-300 bg-cherry-200/80 px-2 py-0.5 text-[9px] font-black ' +
                  'text-cherry-950'
                }
              >
                <span className="h-1.5 w-1.5 rounded-full bg-cherry-600 animate-pulse" />{' '}
                Awaiting Settlement (Menunggu Pelunasan)
              </div>
            </div>
          ) : activeDisplayMode === 'PAID' ? (
            <div
              className={
                'rounded-xl border-2 border-emerald-400 bg-emerald-50 p-2.5 text-center shadow-sm'
              }
            >
              <span
                className={
                  'inline-block rounded-md border border-emerald-300 bg-emerald-200/90 ' +
                  'px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-950'
                }
              >
                Official Payment Receipt (Bukti Pembayaran)
              </span>
              <p className="mt-1 text-2xl font-black text-emerald-950 tracking-tight leading-none">
                PAID IN FULL (LUNAS)
              </p>
              <p className="mt-1 text-[10px] font-bold text-emerald-800">
                Total {money(paidAmount)} verified paid in full
              </p>
              <div
                className={
                  'mt-1.5 inline-flex items-center gap-1 rounded-full border ' +
                  'border-emerald-300 bg-emerald-200/80 px-2 py-0.5 text-[9px] font-black ' +
                  'text-emerald-950'
                }
              >
                <Check size={11} /> Officially Verified
              </div>
            </div>
          ) : (
            <div
              className={
                'rounded-xl border-2 border-brand-300 bg-brand-50 p-2.5 text-center shadow-sm'
              }
            >
              <span
                className={
                  'inline-block rounded-md border border-brand-200 bg-brand-200 px-2 py-0.5 ' +
                  'text-[9px] font-black uppercase tracking-wider text-brand-900'
                }
              >
                Direct Full Payment Bill (100% Upfront)
              </span>
              <p className="mt-1 text-2xl font-black text-brand-950 tracking-tight leading-none">
                {money(totalBill)}
              </p>
              <p className="mt-1 text-[10px] font-bold text-brand-700">
                Due date: {date(invoice.dueDate)}
              </p>
              <div
                className={
                  'mt-1.5 inline-flex items-center gap-1 rounded-full border ' +
                  'border-brand-300 bg-brand-200 px-2 py-0.5 text-[9px] font-black ' +
                  'text-brand-900'
                }
              >
                <span className="h-1.5 w-1.5 rounded-full bg-brand-700 animate-pulse" />{' '}
                Awaiting Payment (Menunggu Pembayaran)
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Perforation Divider 1 */}
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
