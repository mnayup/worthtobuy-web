import React from 'react';
import type { PreviewStage, StageMode } from '../types';
import { InvoiceStepperStages } from './InvoiceStepperStages';
import { InvoicePaymentSchemeBar } from './InvoicePaymentSchemeBar';

interface InvoiceStepperCardProps {
  invoice: any;
  isDpScheme: boolean;
  currentStage: 'DP' | 'SETTLEMENT' | 'PAID' | 'FULL_UNPAID';
  previewStage: PreviewStage;
  activeDisplayMode: StageMode;
  totalBill: number;
  paidAmount: number;
  outstandingAmount: number;
  dpAmount: number;
  updatingScheme: boolean;
  setPreviewStage: (stage: PreviewStage) => void;
  updatePaymentScheme: (model: 'DP' | 'FULL_PAYMENT', percent?: number) => Promise<void>;
  updateShippingCost?: (orderId: number, shippingCost: number) => Promise<void>;
  onOpenWhatsapp: () => void;
  openPaymentWith: (amount?: number, notes?: string) => void;
}

export function InvoiceStepperCard({
  invoice,
  isDpScheme,
  currentStage,
  previewStage,
  activeDisplayMode,
  totalBill,
  paidAmount,
  outstandingAmount,
  dpAmount,
  updatingScheme,
  setPreviewStage,
  updatePaymentScheme,
  updateShippingCost,
  onOpenWhatsapp,
  openPaymentWith,
}: InvoiceStepperCardProps) {
  return (
    <div
      className={
        'no-print mx-auto mb-5 max-w-[980px] rounded-3xl border border-brand-200/90 ' +
        'bg-white p-5 sm:p-6 shadow-sm'
      }
    >
      <InvoiceStepperStages
        invoice={invoice}
        isDpScheme={isDpScheme}
        currentStage={currentStage}
        previewStage={previewStage}
        activeDisplayMode={activeDisplayMode}
        totalBill={totalBill}
        paidAmount={paidAmount}
        outstandingAmount={outstandingAmount}
        dpAmount={dpAmount}
        setPreviewStage={setPreviewStage}
      />

      <InvoicePaymentSchemeBar
        invoice={invoice}
        isDpScheme={isDpScheme}
        currentStage={currentStage}
        totalBill={totalBill}
        paidAmount={paidAmount}
        outstandingAmount={outstandingAmount}
        dpAmount={dpAmount}
        updatingScheme={updatingScheme}
        updatePaymentScheme={updatePaymentScheme}
        updateShippingCost={updateShippingCost}
        onOpenWhatsapp={onOpenWhatsapp}
        openPaymentWith={openPaymentWith}
      />
    </div>
  );
}
