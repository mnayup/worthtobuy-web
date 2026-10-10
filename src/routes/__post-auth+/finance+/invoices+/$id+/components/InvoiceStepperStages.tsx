import React from 'react';
import { Check, FileText, RotateCcw } from 'lucide-react';
import { money } from '~/lib/format';
import type { PreviewStage, StageMode } from '../types';

interface InvoiceStepperStagesProps {
  invoice: any;
  isDpScheme: boolean;
  currentStage: 'DP' | 'SETTLEMENT' | 'PAID' | 'FULL_UNPAID';
  previewStage: PreviewStage;
  activeDisplayMode: StageMode;
  totalBill: number;
  outstandingAmount: number;
  dpAmount: number;
  setPreviewStage: (stage: PreviewStage) => void;
}

export function InvoiceStepperStages({
  invoice,
  isDpScheme,
  currentStage,
  previewStage,
  activeDisplayMode,
  totalBill,
  outstandingAmount,
  dpAmount,
  setPreviewStage,
}: InvoiceStepperStagesProps) {
  return (
    <>
      <div
        className={
          'flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between ' +
          'border-b border-brand-100 pb-4'
        }
      >
        <div>
          <div className="flex items-center gap-2">
            <span
              className={
                'rounded-lg bg-cherry-50 px-2.5 py-1 text-[11px] font-black uppercase ' +
                'tracking-wider text-cherry-700'
              }
            >
              Billing Stage Process
            </span>
            <span className="text-xs font-bold text-brand-600">
              {isDpScheme
                ? `Pre-Order Scheme (DP ${invoice.dpPercent || 50}%)`
                : 'Full Payment Scheme (100%)'}
            </span>
          </div>
          <p className="mt-1 text-xs text-brand-500">
            The billing process runs sequentially according to the customer payment lifecycle.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {previewStage !== 'AUTO' && (
            <button
              type="button"
              onClick={() => setPreviewStage('AUTO')}
              className={
                'inline-flex items-center gap-1.5 rounded-xl border border-cherry-300 ' +
                'bg-cherry-50 px-3 py-1.5 text-xs font-black text-cherry-700 ' +
                'hover:bg-cherry-100 transition shadow-sm'
              }
            >
              <RotateCcw size={13} /> Return to Active Stage
            </button>
          )}
          <button
            type="button"
            onClick={() => setPreviewStage(previewStage === 'REKAP' ? 'AUTO' : 'REKAP')}
            className={
              'inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold ' +
              'transition border ' +
              (previewStage === 'REKAP'
                ? 'border-brand-900 bg-brand-900 text-white'
                : 'border-brand-200 bg-white text-brand-600 hover:bg-brand-50')
            }
          >
            <FileText size={13} />{' '}
            {previewStage === 'REKAP' ? 'Showing Full Recap' : 'View Full Recap'}
          </button>
        </div>
      </div>

      <div className="mt-4">
        {isDpScheme ? (
          <div className="grid gap-3 sm:grid-cols-3">
            <StageCard
              step={1}
              title="Stage 1: DP Billing"
              subtitle={`${money(dpAmount)} (${invoice.dpPercent || 50}%)`}
              statusLabel={
                currentStage === 'SETTLEMENT' || currentStage === 'PAID'
                  ? '✓ DP Received'
                  : '● Awaiting DP'
              }
              statusType={
                currentStage === 'SETTLEMENT' || currentStage === 'PAID'
                  ? 'success'
                  : 'warning'
              }
              isActive={activeDisplayMode === 'DP'}
              isCompleted={currentStage === 'SETTLEMENT' || currentStage === 'PAID'}
              isCurrent={currentStage === 'DP'}
              onClick={() => setPreviewStage('DP')}
            />

            <StageCard
              step={2}
              title="Stage 2: Settlement"
              subtitle={`Remaining: ${money(outstandingAmount)}`}
              statusLabel={
                currentStage === 'PAID'
                  ? '✓ Completed'
                  : currentStage === 'SETTLEMENT'
                    ? '● Awaiting Settlement'
                    : 'Awaiting DP'
              }
              statusType={
                currentStage === 'PAID'
                  ? 'success'
                  : currentStage === 'SETTLEMENT'
                    ? 'danger'
                    : 'muted'
              }
              isActive={activeDisplayMode === 'SETTLEMENT'}
              isCompleted={currentStage === 'PAID'}
              isCurrent={currentStage === 'SETTLEMENT'}
              onClick={() => setPreviewStage('SETTLEMENT')}
            />

            <StageCard
              step={3}
              title="Stage 3: Official Receipt"
              subtitle="Official Payment Proof"
              statusLabel={currentStage === 'PAID' ? '✓ Paid in Full' : 'Belum Completed'}
              statusType={currentStage === 'PAID' ? 'success' : 'muted'}
              isActive={activeDisplayMode === 'PAID'}
              isCompleted={currentStage === 'PAID'}
              isCurrent={false}
              onClick={() => setPreviewStage('PAID')}
            />
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <StageCard
              step={1}
              title="Stage 1: Full Payment Billing"
              subtitle={`Total: ${money(totalBill)}`}
              statusLabel={
                currentStage === 'PAID'
                  ? '✓ Diterima Paid in Full'
                  : '● Awaiting Payment'
              }
              statusType={currentStage === 'PAID' ? 'success' : 'warning'}
              isActive={activeDisplayMode === 'FULL'}
              isCompleted={currentStage === 'PAID'}
              isCurrent={currentStage !== 'PAID'}
              onClick={() => setPreviewStage('FULL')}
            />

            <StageCard
              step={2}
              title="Tahap 2: Kuitansi Paid in Full"
              subtitle="Official Payment Proof"
              statusLabel={currentStage === 'PAID' ? '✓ Paid in Full' : 'Belum Completed'}
              statusType={currentStage === 'PAID' ? 'success' : 'muted'}
              isActive={activeDisplayMode === 'PAID'}
              isCompleted={currentStage === 'PAID'}
              isCurrent={false}
              onClick={() => setPreviewStage('PAID')}
            />
          </div>
        )}
      </div>
    </>
  );
}

function StageCard({
  step,
  title,
  subtitle,
  statusLabel,
  statusType,
  isActive,
  isCompleted,
  isCurrent,
  onClick,
}: {
  step: number;
  title: string;
  subtitle: string;
  statusLabel: string;
  statusType: 'success' | 'warning' | 'danger' | 'muted';
  isActive: boolean;
  isCompleted: boolean;
  isCurrent: boolean;
  onClick: () => void;
}) {
  const badgeCls =
    statusType === 'success'
      ? 'bg-emerald-100 text-emerald-800'
      : statusType === 'warning'
        ? 'bg-amber-100 text-amber-800'
        : statusType === 'danger'
          ? 'bg-cherry-100 text-cherry-800'
          : 'bg-brand-100 text-brand-500';

  const iconCls = isCompleted
    ? 'bg-emerald-500 text-white'
    : isCurrent
      ? 'bg-cherry-600 text-white shadow-sm ring-2 ring-cherry-200'
      : 'bg-brand-100 text-brand-400';

  const containerCls =
    'group relative cursor-pointer rounded-2xl border-2 p-4 transition-all duration-150 ' +
    (isActive
      ? 'border-cherry-600 bg-cherry-50/20 shadow-md ring-2 ring-cherry-600/10'
      : 'border-brand-100 bg-brand-50/30 hover:border-brand-300 hover:bg-white');

  return (
    <div onClick={onClick} className={containerCls}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className={
              `grid h-7 w-7 place-items-center rounded-xl text-xs font-black transition ${iconCls}`
            }
          >
            {isCompleted ? <Check size={14} /> : step}
          </div>
          <div>
            <p className="text-xs font-black text-brand-900">{title}</p>
            <p className="text-[11px] font-bold text-brand-500">{subtitle}</p>
          </div>
        </div>
        <div>
          <span className={`rounded-md px-2 py-0.5 text-[10px] font-black ${badgeCls}`}>
            {statusLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
