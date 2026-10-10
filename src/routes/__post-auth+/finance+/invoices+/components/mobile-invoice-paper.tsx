import React from 'react';
import type { StageMode } from '../types';
import { MobileInvoiceHeader } from './mobile-invoice-header';
import { MobileInvoiceItems } from './mobile-invoice-items';
import { MobileInvoiceFooter } from './mobile-invoice-footer';

interface MobileInvoicePaperProps {
  invoice: any;
  settings: any;
  activeDisplayMode: StageMode;
  totalBill: number;
  dpAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  paymentsChronological: any[];
}

export function MobileInvoicePaper({
  invoice,
  settings,
  activeDisplayMode,
  totalBill,
  dpAmount,
  paidAmount,
  outstandingAmount,
  paymentsChronological,
}: MobileInvoicePaperProps) {
  const brand = settings.brand || {};
  const invoiceSettings = settings.invoice || {};

  const allOrderItems = (invoice.orders || []).flatMap((link: any) =>
    (link.order?.items || []).map((item: any) => ({
      ...item,
      orderNumber: link.order?.orderNumber,
      periodCode: link.order?.period?.code,
    }))
  );

  const eventCodes =
    [
      ...new Set<string>(
        (invoice.orders || [])
          .map((link: any) => String(link.order?.period?.code || ''))
          .filter(Boolean)
      ),
    ].join(', ') || '-';

  return (
    <article
      className={
        'invoice-paper invoice-paper-mobile mx-auto max-w-[400px] overflow-hidden ' +
        'rounded-2xl border-2 border-brand-900 bg-white text-brand-900 shadow-xl transition-all'
      }
      style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
    >
      <MobileInvoiceHeader
        invoice={invoice}
        brand={brand}
        invoiceSettings={invoiceSettings}
        activeDisplayMode={activeDisplayMode}
        totalBill={totalBill}
        dpAmount={dpAmount}
        paidAmount={paidAmount}
        outstandingAmount={outstandingAmount}
      />

      <MobileInvoiceItems
        invoice={invoice}
        eventCodes={eventCodes}
        allOrderItems={allOrderItems}
      />

      <MobileInvoiceFooter
        invoice={invoice}
        invoiceSettings={invoiceSettings}
        activeDisplayMode={activeDisplayMode}
        totalBill={totalBill}
        dpAmount={dpAmount}
        paidAmount={paidAmount}
        outstandingAmount={outstandingAmount}
        paymentsChronological={paymentsChronological}
      />
    </article>
  );
}
