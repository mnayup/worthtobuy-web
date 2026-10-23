import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { usePublicInvoice } from './hooks/use-public-invoice';
import { PublicInvoiceHeader } from './components/PublicInvoiceHeader';
import { PublicInvoiceOrdersTable } from './components/PublicInvoiceOrdersTable';
import { PublicInvoiceFinancialCard } from './components/PublicInvoiceFinancialCard';
import { PublicInvoiceBankTransferCard } from './components/PublicInvoiceBankTransferCard';
import { PublicInvoiceShippingMethodCard } from './components/PublicInvoiceShippingMethodCard';
import { PublicInvoiceProofUploadForm } from './components/PublicInvoiceProofUploadForm';
import { PublicInvoicePaymentsList } from './components/PublicInvoicePaymentsList';
import { PublicInvoiceRefundsList } from './components/PublicInvoiceRefundsList';

export default function PublicInvoiceViewRoute() {
  const d = usePublicInvoice();

  if (d.loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="flex items-center gap-2.5 text-xs font-bold text-brand-600">
          <Loader2 size={18} className="animate-spin text-cherry-600" />
          Loading invoice details...
        </div>
      </div>
    );
  }

  if (d.error && !d.invoice) {
    return (
      <div className="mx-auto max-w-lg p-6 py-20 text-center space-y-4">
        <div
          className={
            'grid h-14 w-14 place-items-center rounded-2xl bg-cherry-50 ' +
            'text-cherry-600 mx-auto border border-cherry-200'
          }
        >
          <AlertCircle size={28} />
        </div>
        <h2 className="text-lg font-black text-brand-950">Invoice Not Found</h2>
        <p className="text-xs text-brand-600 leading-relaxed">{d.error}</p>
        <Link
          to="/"
          className={
            'inline-flex items-center gap-1.5 rounded-xl bg-brand-900 px-4 py-2 ' +
            'text-xs font-bold text-white hover:bg-brand-800 transition'
          }
        >
          <ArrowLeft size={14} /> Back to Home
        </Link>
      </div>
    );
  }

  const isFirstProof = !d.payments || d.payments.length === 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:py-10 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className={
            'inline-flex items-center gap-1.5 text-xs font-bold text-brand-500 ' +
            'hover:text-brand-900 transition'
          }
        >
          <ArrowLeft size={14} /> Back to WORTHTOBUY
        </Link>
        <span className="text-[11px] font-bold text-brand-400">
          Customer Invoice Portal
        </span>
      </div>

      {d.successMsg && (
        <div
          className={
            'rounded-2xl border border-emerald-300 bg-emerald-50/90 p-4 ' +
            'text-xs font-bold text-emerald-900 flex items-center gap-2.5 shadow-sm'
          }
        >
          <CheckCircle2 size={18} className="text-emerald-700 shrink-0" />
          <span>{d.successMsg}</span>
        </div>
      )}

      {/* 1. Header with Status & Overview */}
      <PublicInvoiceHeader
        invoice={d.invoice}
        currentStage={d.currentStage}
        totalBill={d.totalBill}
        dpAmount={d.dpAmount}
        dpPercent={d.dpPercentValue}
        outstandingAmount={d.outstandingAmount}
      />

      {/* 2. Orders & Items Breakdown */}
      <PublicInvoiceOrdersTable orders={d.invoice?.orders || []} />

      {/* 3. Financial Summary & Bank Details Side-by-Side on Desktop */}
      <div className="grid gap-6 md:grid-cols-2">
        <PublicInvoiceFinancialCard
          invoice={d.invoice}
          currentStage={d.currentStage}
          totalBill={d.totalBill}
          paidAmount={d.paidAmount}
          outstandingAmount={d.outstandingAmount}
          dpAmount={d.dpAmount}
          dpPercent={d.dpPercentValue}
        />

        <PublicInvoiceBankTransferCard
          bankSettings={d.bankSettings}
          invoiceNumber={d.invoice?.invoice_number || d.invoice?.invoiceNumber || ''}
        />
      </div>

      {/* 4. Shipment Method Selection (Manual Shipment vs Kirim via Shopee) */}
      <PublicInvoiceShippingMethodCard
        currentMethod={d.shippingMethod}
        currentShopeeUsername={d.shopeeUsername}
        isFirstProof={isFirstProof}
        onUpdateShippingMethod={d.updateShippingMethod}
      />

      {/* 5. Proof of Transfer Upload Form */}
      <PublicInvoiceProofUploadForm
        invoice={d.invoice}
        payments={d.payments}
        currentStage={d.currentStage}
        dpAmount={d.dpAmount}
        totalBill={d.totalBill}
        paidAmount={d.paidAmount}
        outstandingAmount={d.outstandingAmount}
        submitting={d.submitting}
        onSubmitProof={d.submitProof}
        bankSettings={d.bankSettings}
        pendingPayments={d.pendingPayments}
        isOrdersWaitingSettlement={d.isOrdersWaitingSettlement}
        shippingMethod={d.shippingMethod}
        shopeeUsername={d.shopeeUsername}
      />

      {/* 5. Payment & Verification History */}
      <PublicInvoicePaymentsList payments={d.payments} />

      {/* 6. Refund History & Transfer Evidence */}
      <PublicInvoiceRefundsList refunds={d.refunds} />
    </div>
  );
}
