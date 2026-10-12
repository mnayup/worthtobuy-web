import React from 'react';
import { FileText, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { date, money } from '~/lib/format';

interface PublicInvoiceHeaderProps {
  invoice: any;
  currentStage: 'DP' | 'SETTLEMENT' | 'PAID' | 'FULL_UNPAID';
  totalBill: number;
  dpAmount: number;
  dpPercent: number;
  outstandingAmount: number;
}

export function PublicInvoiceHeader({
  invoice,
  currentStage,
  totalBill,
  dpAmount,
  dpPercent,
  outstandingAmount,
}: PublicInvoiceHeaderProps) {
  const customerName = invoice?.customer?.full_name || invoice?.customer?.fullName || 'Customer';
  const invoiceNumber = invoice?.invoice_number || invoice?.invoiceNumber || '-';
  const invoiceDate = invoice?.invoice_date || invoice?.invoiceDate;
  const dueDate = invoice?.due_date || invoice?.dueDate;

  const stageBadge = () => {
    if (currentStage === 'PAID') {
      return (
        <span
          className={
            'inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 ' +
            'text-xs font-black text-emerald-800 border border-emerald-300'
          }
        >
          <CheckCircle2 size={13} />
          Paid in Full (Lunas)
        </span>
      );
    }
    if (currentStage === 'SETTLEMENT') {
      return (
        <span
          className={
            'inline-flex items-center gap-1.5 rounded-full bg-cherry-100 px-3 py-1 ' +
            'text-xs font-black text-cherry-800 border border-cherry-300'
          }
        >
          <Clock size={13} />
          Stage 2: Awaiting Settlement (Pelunasan)
        </span>
      );
    }
    if (currentStage === 'DP') {
      return (
        <span
          className={
            'inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 ' +
            'text-xs font-black text-amber-900 border border-amber-300'
          }
        >
          <Clock size={13} />
          Stage 1: Awaiting Down Payment (DP {dpPercent}%)
        </span>
      );
    }
    return (
      <span
        className={
          'inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-1 ' +
          'text-xs font-black text-brand-800 border border-brand-300'
        }
      >
        <AlertCircle size={13} />
        Awaiting Payment (Belum Lunas)
      </span>
    );
  };

  return (
    <div className="rounded-3xl border border-brand-200/90 bg-white p-5 sm:p-7 shadow-sm space-y-4">
      <div
        className={
          'flex flex-col sm:flex-row sm:items-center justify-between gap-3 ' +
          'border-b border-brand-100 pb-4'
        }
      >
        <div className="flex items-center gap-3">
          <div
            className={
              'grid h-12 w-12 place-items-center rounded-2xl bg-cherry-600 ' +
              'text-white font-black text-xl shadow-sm'
            }
          >
            <FileText size={22} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-brand-400">
              Official Customer Invoice
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-brand-950 tracking-tight">
              {invoiceNumber}
            </h1>
          </div>
        </div>
        <div className="self-start sm:self-auto">{stageBadge()}</div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <span className="text-brand-400 font-semibold block text-[11px]">Billed To:</span>
          <p className="font-extrabold text-brand-900 text-sm mt-0.5">Kak {customerName}</p>
        </div>
        <div>
          <span className="text-brand-400 font-semibold block text-[11px]">Invoice Date:</span>
          <p className="font-bold text-brand-800 mt-0.5">
            {invoiceDate ? date(invoiceDate) : '-'}
          </p>
        </div>
        <div>
          <span className="text-brand-400 font-semibold block text-[11px]">Due Date:</span>
          <p className="font-bold text-cherry-700 mt-0.5">
            {dueDate ? date(dueDate) : 'On Order'}
          </p>
        </div>
        <div>
          <span className="text-brand-400 font-semibold block text-[11px]">Payment Target:</span>
          <p className="font-black text-brand-950 text-sm mt-0.5">
            {currentStage === 'DP'
              ? `${money(dpAmount)} (DP)`
              : currentStage === 'SETTLEMENT'
              ? `${money(outstandingAmount)} (Sisa)`
              : money(totalBill)}
          </p>
        </div>
      </div>

      {currentStage === 'DP' && (
        <div
          className={
            'rounded-2xl bg-amber-50/90 border border-amber-200 p-3.5 text-xs ' +
            'text-amber-950 flex items-start gap-2.5'
          }
        >
          <Clock size={16} className="text-amber-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-black text-amber-950">
              Down Payment Bill (Tagihan DP {dpPercent}%) — {money(dpAmount)}
            </p>
            <p className="text-[11px] text-amber-800 font-medium mt-0.5">
              Please transfer the Down Payment amount below to secure your items. The remaining
              balance of {money(Math.max(0, totalBill - dpAmount))} will be due{' '}
              {invoice.dp_settlement_note || invoice.dpSettlementNote || 'when ready to ship'}.
            </p>
          </div>
        </div>
      )}

      {currentStage === 'SETTLEMENT' && (
        <div
          className={
            'rounded-2xl bg-cherry-50/90 border border-cherry-200 p-3.5 text-xs ' +
            'text-cherry-950 flex items-start gap-2.5'
          }
        >
          <Clock size={16} className="text-cherry-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-black text-cherry-950">
              Settlement Bill (Tagihan Pelunasan) — {money(outstandingAmount)}
            </p>
            <p className="text-[11px] text-cherry-800 font-medium mt-0.5">
              Your items are secured! Please settle the remaining balance so we can dispatch your
              package to your address.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
