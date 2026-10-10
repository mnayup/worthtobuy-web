import React from 'react';
import type { StageMode } from '../types';
import { InvoiceA4Header } from './InvoiceA4Header';
import { InvoiceA4OrdersTable } from './InvoiceA4OrdersTable';
import { InvoiceA4StageBanner } from './InvoiceA4StageBanner';
import { InvoiceA4FinancialBox } from './InvoiceA4FinancialBox';
import { InvoiceA4PaymentHistory } from './InvoiceA4PaymentHistory';

interface InvoiceA4PaperProps {
  invoice: any;
  settings: any;
  activeDisplayMode: StageMode;
  totalBill: number;
  paidAmount: number;
  outstandingAmount: number;
  dpAmount: number;
  paymentsChronological: any[];
}

export function InvoiceA4Paper({
  invoice,
  settings,
  activeDisplayMode,
  totalBill,
  paidAmount,
  outstandingAmount,
  dpAmount,
  paymentsChronological,
}: InvoiceA4PaperProps) {
  const brand = settings.brand || {};
  const invoiceSettings = settings.invoice || {};

  return (
    <article
      className={
        'invoice-paper invoice-paper-a4 mx-auto max-w-[980px] overflow-hidden ' +
        'rounded-[1.75rem] border border-brand-200/80 shadow-card'
      }
    >
      <InvoiceA4Header
        invoice={invoice}
        brand={brand}
        invoiceSettings={invoiceSettings}
        activeDisplayMode={activeDisplayMode}
      />

      <div className="p-5 sm:p-6 print:p-2">
        <InvoiceA4StageBanner
          invoice={invoice}
          activeDisplayMode={activeDisplayMode}
          totalBill={totalBill}
          paidAmount={paidAmount}
          outstandingAmount={outstandingAmount}
          dpAmount={dpAmount}
        />

        <InvoiceA4OrdersTable orders={invoice.orders || []} />

        <InvoiceA4FinancialBox
          invoice={invoice}
          invoiceSettings={invoiceSettings}
          activeDisplayMode={activeDisplayMode}
          totalBill={totalBill}
          paidAmount={paidAmount}
          outstandingAmount={outstandingAmount}
          dpAmount={dpAmount}
        />

        <InvoiceA4PaymentHistory
          invoiceNumber={invoice.invoiceNumber}
          paymentsChronological={paymentsChronological}
        />
      </div>
    </article>
  );
}
