import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  MessageCircle,
  Printer,
  Smartphone,
  Trash2,
  Wallet,
} from 'lucide-react';
import clsx from 'clsx';
import { money } from '~/lib/format';
import type { PrintFormat } from '../types';

interface InvoiceDetailActionsProps {
  invoice: any;
  user: any;
  fromOrders: boolean;
  printFormat: PrintFormat;
  setPrintFormat: (fmt: PrintFormat) => void;
  onOpenDeposit: () => void;
  onOpenWhatsapp: () => void;
  onOpenDelete: () => void;
}

export function InvoiceDetailActions({
  invoice,
  user,
  fromOrders,
  printFormat,
  setPrintFormat,
  onOpenDeposit,
  onOpenWhatsapp,
  onOpenDelete,
}: InvoiceDetailActionsProps) {
  const navigate = useNavigate();

  const btnFormatCls =
    'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition';

  return (
    <div
      className="no-print mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <button
        onClick={() => navigate(fromOrders ? '/orders' : '/invoices')}
        className="btn-secondary w-fit"
      >
        <ArrowLeft size={16} /> {fromOrders ? 'Back to Orders' : 'Back to Invoices'}
      </button>

      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-xl bg-brand-100 p-1 border border-brand-200">
          <button
            type="button"
            onClick={() => setPrintFormat('A4')}
            className={clsx(
              btnFormatCls,
              printFormat === 'A4'
                ? 'bg-white text-brand-950 shadow-sm font-extrabold ring-1 ring-brand-200/80'
                : 'text-brand-600 hover:text-brand-900'
            )}
          >
            <FileText size={14} className={printFormat === 'A4' ? 'text-cherry-600' : ''} />
            Format A4
          </button>
          <button
            type="button"
            onClick={() => setPrintFormat('MOBILE')}
            className={clsx(
              btnFormatCls,
              printFormat === 'MOBILE'
                ? 'bg-white text-brand-950 shadow-sm font-extrabold ring-1 ring-brand-200/80'
                : 'text-brand-600 hover:text-brand-900'
            )}
          >
            <Smartphone
              size={14}
              className={printFormat === 'MOBILE' ? 'text-cherry-600' : ''}
            />
            Mobile Format (Receipt / Struk)
          </button>
        </div>

        <button
          type="button"
          onClick={onOpenDeposit}
          className={clsx(
            'btn',
            Number(invoice.depositAmount) > 0
              ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 font-extrabold'
              : 'btn-secondary text-purple-700 hover:bg-purple-50'
          )}
          title="Manage customer deposit balance deduction for this invoice"
        >
          <Wallet size={16} className="text-purple-600" />
          <span>
            {Number(invoice.depositAmount) > 0
              ? `Deposit: -${money(invoice.depositAmount)}`
              : 'Use Deposit (Gunakan Deposit)'}
          </span>
        </button>

        <button onClick={onOpenWhatsapp} className="btn-secondary">
          <MessageCircle size={16} className="text-emerald-600" /> WhatsApp Template
        </button>

        <button onClick={() => window.print()} className="btn-primary">
          <Printer size={16} /> Print {printFormat === 'A4' ? 'A4 (PDF)' : 'Mobile Receipt (PDF)'}
        </button>

        {user?.role === 'OWNER' && (
          <button onClick={onOpenDelete} className="btn bg-rose-600 text-white hover:bg-rose-700">
            <Trash2 size={16} /> Move to Trash
          </button>
        )}
      </div>
    </div>
  );
}
