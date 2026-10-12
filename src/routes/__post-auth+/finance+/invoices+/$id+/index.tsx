import React from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { Toast } from '~/components/Toast';
import { ConfirmDialog } from '~/components/ConfirmDialog';
import { useAuth } from '~/context/AuthContext';
import { PaymentModal } from '~/routes/__post-auth+/finance+/invoices+/components/payment-modal';
import { DepositModal } from '~/routes/__post-auth+/finance+/invoices+/components/deposit-modal';
import {
  WhatsappMessageModal,
} from '~/routes/__post-auth+/finance+/invoices+/components/whatsapp-message-modal';
import {
  MobileInvoicePaper,
} from '~/routes/__post-auth+/finance+/invoices+/components/mobile-invoice-paper';
import { InvoiceDetailActions } from './components/InvoiceDetailActions';
import { InvoiceStepperCard } from './components/InvoiceStepperCard';
import { InvoiceA4Paper } from './components/InvoiceA4Paper';
import { InvoiceHistoryTables } from './components/InvoiceHistoryTables';
import {
  InvoicePaymentVerificationModal,
} from './components/InvoicePaymentVerificationModal';
import { useInvoiceDetail, loader } from './hooks/use-invoice-detail';

export { loader };

export default function InvoiceDetailRoute() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const fromOrders = searchParams.get('from') === 'orders';
  const { user } = useAuth();

  const d = useInvoiceDetail(id);

  if (d.loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div
          className={
            'h-10 w-10 animate-spin rounded-full border-4 border-brand-100 border-t-cherry-500'
          }
        />
      </div>
    );
  }

  if (d.error || !d.invoice) {
    return (
      <div className="card p-8 text-center">
        <p className="font-bold text-cherry-600">{d.error || 'Invoice not found.'}</p>
        <button onClick={() => navigate('/invoices')} className="btn-secondary mt-4">
          Back to Invoices
        </button>
      </div>
    );
  }

  const hasRefundAlert =
    Number(d.invoice.overpaymentAmount) > 0 ||
    d.invoice.refunds?.some((row: any) => row.status !== 'PAID');

  return (
    <div className="print-shell animate-rise">
      <InvoiceDetailActions
        invoice={d.invoice}
        user={user}
        fromOrders={fromOrders}
        printFormat={d.printFormat}
        setPrintFormat={d.setPrintFormat}
        onOpenDeposit={() => d.setDepositModalOpen(true)}
        onOpenWhatsapp={() => d.setWhatsappOpen(true)}
        onOpenDelete={() => d.setDeleteOpen(true)}
      />

      {hasRefundAlert && (
        <div
          className="no-print mb-5 rounded-2xl border border-honey-200 bg-honey-50/80 p-4 shadow-sm"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 text-honey-600" size={20} />
            <div>
              <p className="font-extrabold text-honey-900">Refund Action Required</p>
              <p className="mt-0.5 text-xs text-brand-600 font-medium">
                The system detected an overpayment or unavailable item. Review refund records.
              </p>
            </div>
          </div>
        </div>
      )}

      {d.pendingPayments && d.pendingPayments.length > 0 && (
        <div
          className={
            'no-print mx-auto mb-4 max-w-[980px] flex items-center justify-between ' +
            'rounded-2xl bg-amber-500/10 px-4 py-3 text-xs font-semibold text-amber-950 ' +
            'border border-amber-300'
          }
        >
          <div className="flex items-center gap-2.5">
            <span
              className={
                'grid h-6 w-6 place-items-center rounded-lg bg-amber-500 ' +
                'text-white font-black text-xs shrink-0'
              }
            >
              !
            </span>
            <span>
              <strong>{d.pendingPayments.length} Customer Payment Proof(s) Uploaded</strong>
              {' '}awaiting your review & verification.
            </span>
          </div>
          <button
            type="button"
            onClick={() => d.openVerifyModal(d.pendingPayments[0])}
            className={
              'rounded-xl bg-amber-500 px-3.5 py-1.5 text-xs font-black text-white ' +
              'hover:bg-amber-600 transition shadow-xs shrink-0'
            }
          >
            Check & Verify
          </button>
        </div>
      )}

      <InvoiceStepperCard
        invoice={d.invoice}
        isDpScheme={d.isDpScheme}
        currentStage={d.currentStage}
        previewStage={d.previewStage}
        activeDisplayMode={d.activeDisplayMode}
        totalBill={d.totalBill}
        paidAmount={d.paidAmount}
        outstandingAmount={d.outstandingAmount}
        dpAmount={d.dpAmount}
        updatingScheme={d.updatingScheme}
        setPreviewStage={d.setPreviewStage}
        updatePaymentScheme={d.updatePaymentScheme}
        updateShippingCost={d.updateShippingCost}
        onOpenWhatsapp={() => d.setWhatsappOpen(true)}
        openPaymentWith={d.openPaymentWith}
      />

      {d.previewStage !== 'AUTO' && (
        <div
          className={
            'no-print mx-auto mb-4 max-w-[980px] flex items-center justify-between ' +
            'rounded-2xl bg-brand-100/90 px-4 py-2.5 text-xs font-semibold text-brand-700 ' +
            'border border-brand-200'
          }
        >
          <span>
            View preview:{' '}
            <strong>
              {d.previewStage === 'REKAP'
                ? 'Full Consolidated Recap'
                : d.previewStage === 'DP'
                  ? 'DP Bill (Stage 1)'
                  : d.previewStage === 'SETTLEMENT'
                    ? 'Settlement Bill (Stage 2)'
                    : 'Kuitansi Paid in Full'}
            </strong>
          </span>
          <button
            type="button"
            onClick={() => d.setPreviewStage('AUTO')}
            className="font-black text-cherry-600 hover:underline"
          >
            Return to Active Stage
          </button>
        </div>
      )}

      {d.printFormat === 'A4' ? (
        <InvoiceA4Paper
          invoice={d.invoice}
          settings={d.settings}
          activeDisplayMode={d.activeDisplayMode}
          totalBill={d.totalBill}
          paidAmount={d.paidAmount}
          outstandingAmount={d.outstandingAmount}
          dpAmount={d.dpAmount}
          paymentsChronological={d.paymentsChronological}
        />
      ) : (
        <MobileInvoicePaper
          invoice={d.invoice}
          settings={d.settings}
          activeDisplayMode={d.activeDisplayMode}
          totalBill={d.totalBill}
          dpAmount={d.dpAmount}
          paidAmount={d.paidAmount}
          outstandingAmount={d.outstandingAmount}
          paymentsChronological={d.paymentsChronological}
        />
      )}

      <InvoiceHistoryTables
        sortedPayments={d.sortedPayments}
        paymentSortCol={d.paymentSortCol}
        paymentSortDir={d.paymentSortDir}
        onSortPayment={d.handleSortPayment}
        sortedRefunds={d.sortedRefunds}
        refundSortCol={d.refundSortCol}
        refundSortDir={d.refundSortDir}
        onSortRefund={d.handleSortRefund}
        onVerifyPayment={d.openVerifyModal}
      />

      <InvoicePaymentVerificationModal
        open={d.verifyModalOpen}
        payment={d.verifyingPayment}
        invoice={d.invoice}
        onClose={d.closeVerifyModal}
        onSuccess={() => {
          d.closeVerifyModal();
          d.setToast({
            message: 'Payment verified and invoice status updated.',
            type: 'success',
          });
          d.load();
        }}
        onRecordNewPayment={() => {
          d.closeVerifyModal();
          d.setPaymentOpen(true);
        }}
      />

      <PaymentModal
        open={d.paymentOpen}
        invoice={d.invoice}
        initialAmount={d.paymentInitialAmount}
        initialNotes={d.paymentInitialNotes}
        onClose={() => {
          d.setPaymentOpen(false);
          d.setPaymentInitialAmount(undefined);
          d.setPaymentInitialNotes(undefined);
        }}
        onSaved={() => {
          d.setPaymentOpen(false);
          d.setPaymentInitialAmount(undefined);
          d.setPaymentInitialNotes(undefined);
          d.setToast({
            message: 'Payment recorded successfully and invoice total updated.',
            type: 'success',
          });
          d.load();
        }}
      />
      <WhatsappMessageModal
        open={d.whatsappOpen}
        invoice={d.invoice}
        onClose={() => d.setWhatsappOpen(false)}
        onSaved={(opened: boolean) => {
          d.setWhatsappOpen(false);
          d.setToast({
            message: opened
              ? 'Message saved and WhatsApp launched.'
              : 'WhatsApp template saved and copied to clipboard.',
            type: 'success',
          });
          d.load();
        }}
      />
      <ConfirmDialog
        open={d.deleteOpen}
        title="Move invoice to Trash?"
        message="The invoice and payment records will be safely archived in the Trash."
        onCancel={() => d.setDeleteOpen(false)}
        onConfirm={d.removeInvoice}
        loading={d.deleteSaving}
      />
      <DepositModal
        open={d.depositModalOpen}
        invoice={d.invoice}
        onClose={() => d.setDepositModalOpen(false)}
        onSaved={() => {
          d.setToast({
            message: 'Penggunaan saldo deposit berhasil diperbarui.',
            type: 'success',
          });
          d.load();
        }}
      />
      {d.toast && <Toast {...d.toast} onClose={() => d.setToast(null)} />}
    </div>
  );
}
