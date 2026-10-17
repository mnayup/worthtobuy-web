import React from 'react';
import { CreditCard, MessageCircle, Printer } from 'lucide-react';
import { money } from '~/lib/format';
import { InvoiceShippingCostSection } from './InvoiceShippingCostSection';
import { InvoiceKeepItemsSection } from './InvoiceKeepItemsSection';

interface InvoicePaymentSchemeBarProps {
  invoice: any;
  isDpScheme: boolean;
  currentStage: 'DP' | 'SETTLEMENT' | 'PAID' | 'FULL_UNPAID';
  totalBill: number;
  paidAmount: number;
  outstandingAmount: number;
  dpAmount: number;
  updatingScheme: boolean;
  updatePaymentScheme: (model: 'DP' | 'FULL_PAYMENT', percent?: number) => Promise<void>;
  updateShippingCost?: (orderId: number, shippingCost: number) => Promise<void>;
  updateKeepItems?: (keep: boolean, customDate?: string) => Promise<void>;
  onOpenWhatsapp: () => void;
  openPaymentWith: (amount?: number, notes?: string) => void;
}

export function InvoicePaymentSchemeBar({
  invoice,
  isDpScheme,
  currentStage,
  totalBill,
  paidAmount,
  outstandingAmount,
  dpAmount,
  updatingScheme,
  updatePaymentScheme,
  updateShippingCost,
  updateKeepItems,
  onOpenWhatsapp,
  openPaymentWith,
}: InvoicePaymentSchemeBarProps) {
  const currentPct = invoice.dpPercent || invoice.dp_percent || 50;

  return (
    <div className="mt-4 pt-4 border-t border-brand-100">
      {paidAmount === 0 ? (
        <div className="rounded-2xl border border-brand-200/90 bg-brand-50/60 p-4 sm:p-5 space-y-4">
          {/* Step 1: Estimated Shipping Cost (ongkir input BEFORE selecting scheme) */}
          <InvoiceShippingCostSection
            invoice={invoice}
            orders={invoice.orders || []}
            updatingScheme={updatingScheme}
            updateShippingCost={updateShippingCost}
          />

          {/* Step 2: Payment Scheme Selection */}
          <div
            className={
              'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ' +
              'border-t border-b border-brand-200/80 py-3'
            }
          >
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-brand-800">
                Step 2: Payment Scheme Selection (Skema Pembayaran)
              </p>
              <p className="text-xs text-brand-500 font-medium">
                Choose whether customer pays a Down Payment first or pays in full (100%):
              </p>
            </div>
            <div
              className={
                'inline-flex rounded-xl bg-white p-1 border border-brand-200 shadow-sm shrink-0'
              }
            >
              <button
                type="button"
                disabled={updatingScheme}
                onClick={() => updatePaymentScheme('DP', currentPct)}
                className={`rounded-lg px-3 py-1.5 text-xs font-black transition ${
                  isDpScheme
                    ? 'bg-cherry-600 text-white shadow-sm'
                    : 'text-brand-600 hover:text-brand-900'
                }`}
              >
                Bill Down Payment First (DP)
              </button>
              <button
                type="button"
                disabled={updatingScheme}
                onClick={() => updatePaymentScheme('FULL_PAYMENT')}
                className={`rounded-lg px-3 py-1.5 text-xs font-black transition ${
                  !isDpScheme
                    ? 'bg-brand-900 text-white shadow-sm'
                    : 'text-brand-600 hover:text-brand-900'
                }`}
              >
                Direct Full Payment (100% Upfront)
              </button>
            </div>
          </div>

          {/* Step 2b: Keep Items / Titip Simpan Selection */}
          <InvoiceKeepItemsSection
            invoice={invoice}
            updatingScheme={updatingScheme}
            updateKeepItems={updateKeepItems}
          />

          {/* Step 3: Payment Configuration and Actions */}
          {isDpScheme ? (
            <div className="space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-brand-700">
                    Step 3: Select DP Percentage:
                  </span>
                  {[30, 50, 75].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      disabled={updatingScheme}
                      onClick={() => updatePaymentScheme('DP', pct)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-black transition ${
                        currentPct === pct
                          ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-300'
                          : 'bg-white border border-brand-200 text-brand-700 hover:bg-brand-100'
                      }`}
                    >
                      DP {pct}%
                    </button>
                  ))}
                </div>
                <div className="text-right">
                  <span className="text-xs text-brand-500 font-semibold">
                    DP Amount ({currentPct}%):{' '}
                  </span>
                  <span className="text-sm font-black text-brand-900">{money(dpAmount)}</span>
                  <span className="ml-2 text-xs text-brand-400 font-medium">
                    (Remaining: {money(Math.max(0, totalBill - dpAmount))})
                  </span>
                </div>
              </div>

              <div
                className={
                  'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ' +
                  'rounded-xl bg-amber-50 border border-amber-200 p-3.5'
                }
              >
                <div>
                  <p className="text-xs font-black text-amber-950">
                    Stage 1: Down Payment Bill (Tagihan DP) — {money(dpAmount)} ({currentPct}%)
                  </p>
                  <p className="text-[11px] text-amber-800 font-medium mt-0.5">
                    Send DP bill via WhatsApp. Customer can view invoice and upload proof.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={onOpenWhatsapp}
                    className="btn-secondary !py-2 !px-3 text-xs font-bold text-emerald-700"
                  >
                    <MessageCircle size={14} /> Send DP Bill via WA
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div
                className={
                  'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ' +
                  'rounded-xl bg-brand-100/70 border border-brand-200 p-3.5'
                }
              >
                <div>
                  <p className="text-xs font-black text-brand-950">
                    Stage 1: Direct Full Payment Bill (Tagihan Lunas 100%) — {money(totalBill)}
                  </p>
                  <p className="text-[11px] text-brand-700 font-medium mt-0.5">
                    Send invoice via WhatsApp, then record full payment once received.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={onOpenWhatsapp}
                    className="btn-secondary !py-2 !px-3 text-xs font-bold text-emerald-700"
                  >
                    <MessageCircle size={14} /> Send Bill via WA
                  </button>
                  <button
                    type="button"
                    onClick={() => openPaymentWith(totalBill, 'Pembayaran Lunas (Full Payment)')}
                    className="btn-primary !py-2 !px-3.5 text-xs font-black shadow-sm"
                  >
                    <CreditCard size={14} /> Record Payment {money(totalBill)}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : currentStage === 'SETTLEMENT' ? (
        <div
          className={
            'flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 ' +
            'p-4 sm:flex-row sm:items-center sm:justify-between'
          }
        >
          <div>
            <p className="text-xs font-black text-emerald-950">
              Stage 2: Down Payment Received ({money(paidAmount)}), Awaiting Settlement
            </p>
            <p className="mt-0.5 text-xs text-emerald-800 font-medium">
              The remaining balance to be paid is{' '}
              <strong className="text-cherry-600">{money(outstandingAmount)}</strong>.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenWhatsapp}
              className="btn-secondary !py-2 !px-3 text-xs font-bold text-emerald-700"
            >
              <MessageCircle size={14} /> Bill Settlement via WA
            </button>
            <button
              type="button"
              onClick={() => openPaymentWith(outstandingAmount, 'Pelunasan Invoice (Settlement)')}
              className={
                'btn-primary !bg-emerald-600 hover:!bg-emerald-700 !py-2 !px-3.5 ' +
                'text-xs font-black shadow-sm'
              }
            >
              <CreditCard size={14} /> Record Settlement {money(outstandingAmount)}
            </button>
          </div>
        </div>
      ) : currentStage === 'PAID' ? (
        <div
          className={
            'flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 ' +
            'p-4 sm:flex-row sm:items-center sm:justify-between'
          }
        >
          <div>
            <p className="text-xs font-black text-emerald-950">
              Stage 3 Completed: All Orders Paid in Full (Lunas)
            </p>
            <p className="mt-0.5 text-xs text-emerald-800 font-medium">
              Total verified: <strong>{money(paidAmount)}</strong>. Official Payment Receipt.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenWhatsapp}
              className="btn-secondary !py-2 !px-3 text-xs font-bold text-emerald-700"
            >
              <MessageCircle size={14} /> Send Receipt via WA
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className={
                'btn-primary !bg-emerald-600 hover:!bg-emerald-700 !py-2 !px-3.5 ' +
                'text-xs font-black shadow-sm'
              }
            >
              <Printer size={14} /> Print Official Receipt
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
