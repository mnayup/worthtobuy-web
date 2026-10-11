import React from 'react';
import { date } from '~/lib/format';
import { StatusBadge } from '~/components/StatusBadge';
import type { StageMode } from '../types';

interface InvoiceA4HeaderProps {
  invoice: any;
  brand: any;
  invoiceSettings: any;
  activeDisplayMode: StageMode;
}

export function InvoiceA4Header({
  invoice,
  brand,
  invoiceSettings,
  activeDisplayMode,
}: InvoiceA4HeaderProps) {
  const stageTitle =
    activeDisplayMode === 'DP'
      ? 'DP Bill (Down Payment)'
      : activeDisplayMode === 'SETTLEMENT'
        ? 'Settlement Bill'
        : activeDisplayMode === 'PAID'
          ? 'Official Payment Receipt (Bukti Pembayaran Lunas)'
          : activeDisplayMode === 'REKAP'
            ? 'Consolidated Invoice (Master Ledger)'
            : 'Invoice Bill';

  const eventList = [
    ...new Set<string>(
      (invoice.orders || [])
        .map((link: any) => String(link.order?.period?.code || ''))
        .filter(Boolean)
    ),
  ].join(', ') || '-';

  return (
    <>
      <header
        className="border-b-2 border-brand-900 bg-white px-6 py-4 sm:px-8 sm:py-5 text-brand-950"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3.5">
            <div
              className={
                'grid h-13 w-13 place-items-center rounded-xl border border-brand-200 ' +
                'bg-brand-50 p-1 shadow-sm shrink-0'
              }
            >
              <img
                src={brand.logoUrl || '/worthtobuy-mark.png'}
                className="h-10 w-10 object-contain"
                alt=""
              />
            </div>
            <div>
              <p className="text-xl font-black tracking-tight text-brand-950">
                {invoiceSettings.businessName || brand.name || 'WORTHTOBUY'}
              </p>
              <p className="text-xs font-semibold text-brand-600">
                {brand.tagline || 'Your personal shopper & jastip concierge'}
              </p>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-[11px] font-black uppercase tracking-wider text-cherry-700">
              {stageTitle}
            </p>
            <p className="font-mono text-xl font-black text-brand-950 tracking-tight mt-0.5">
              {invoice.invoiceNumber}
            </p>
            <p className="text-[11px] font-semibold text-brand-600 mt-0.5">
              Issued: {date(invoice.invoiceDate)} • Due: {date(invoice.dueDate)}
            </p>
            <div className="mt-1.5">
              {activeDisplayMode === 'DP' ? (
                <span
                  className={
                    'inline-flex items-center rounded-lg border border-amber-400 bg-amber-50 ' +
                    'px-2.5 py-0.5 text-[11px] font-black text-amber-900'
                  }
                >
                  DP BILL ({invoice.dpPercent || 50}%)
                </span>
              ) : activeDisplayMode === 'SETTLEMENT' ? (
                <span
                  className={
                    'inline-flex items-center rounded-lg border border-cherry-400 bg-cherry-50 ' +
                    'px-2.5 py-0.5 text-[11px] font-black text-cherry-900'
                  }
                >
                  AWAITING SETTLEMENT
                </span>
              ) : activeDisplayMode === 'PAID' ? (
                <span
                  className={
                    'inline-flex items-center gap-1 rounded-lg border border-emerald-400 ' +
                    'bg-emerald-50 px-2.5 py-0.5 text-[11px] font-black text-emerald-900'
                  }
                >
                  <span>✓</span> PAID / FULLY PAID
                </span>
              ) : (
                <StatusBadge value={invoice.status} />
              )}
            </div>
          </div>
        </div>
      </header>

      <div
        className={
          'grid gap-4 border-b border-brand-200 bg-white px-6 py-4 sm:px-8 ' +
          'sm:grid-cols-2 text-xs'
        }
      >
        <div>
          <p className="text-[10px] font-black uppercase text-brand-500 tracking-wider">
            Billed To
          </p>
          <p className="text-base font-black text-brand-950 mt-0.5">
            {invoice.customer?.fullName || invoice.customer?.full_name || '-'}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-brand-700">
            {invoice.customer?.whatsapp || '-'}
            {invoice.customer?.email ? ` • ${invoice.customer.email}` : ''}
            <br />
            {invoice.customer?.address || ''}
            {invoice.customer?.city ? `, ${invoice.customer.city}` : ''}{' '}
            {invoice.customer?.postalCode || invoice.customer?.postal_code || ''}
          </p>
        </div>
        <div className="sm:text-right">
          <p className="text-[10px] font-black uppercase text-brand-500 tracking-wider">
            Invoice Details
          </p>
          <p className="font-extrabold text-brand-900 mt-0.5">
            {invoice.orders?.length || 0} customer orders
          </p>
          <p className="mt-1 text-xs leading-relaxed text-brand-700">
            Events: {eventList}
            <br />
            Terms: Multi-stage (DP / Settlement)
          </p>
        </div>
      </div>
    </>
  );
}
