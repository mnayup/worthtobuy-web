import React from 'react';
import { Clock, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import { money, dateTime } from '~/lib/format';
import { SafeProofImage } from '~/components/SafeProofImage';

interface PublicInvoicePaymentsListProps {
  payments: any[];
}

export function PublicInvoicePaymentsList({ payments }: PublicInvoicePaymentsListProps) {
  if (!payments || payments.length === 0) return null;

  return (
    <div className="rounded-3xl border border-brand-200/90 bg-white p-5 sm:p-6 shadow-sm space-y-4">
      <h2
        className={
          'text-sm font-black uppercase tracking-wider text-brand-900 ' +
          'border-b border-brand-100 pb-3'
        }
      >
        Payment & Verification History (Riwayat Pembayaran)
      </h2>

      <div className="space-y-3">
        {payments.map((p: any) => {
          const isPending = p.status === 'PENDING';
          const isVerified = p.status === 'VERIFIED';
          const isRejected = p.status === 'REJECTED';

          const cardBorder = isVerified
            ? 'border-emerald-200 bg-emerald-50/40'
            : isPending
            ? 'border-amber-200 bg-amber-50/40'
            : 'border-cherry-200 bg-cherry-50/40';

          return (
            <div
              key={p.id}
              className={`rounded-2xl border p-3.5 text-xs flex flex-col sm:flex-row ` +
                `sm:items-center justify-between gap-3 ${cardBorder}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {p.proof_url ? (
                  <a
                    href={p.proof_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative group shrink-0"
                    title="View uploaded transfer receipt"
                  >
                    <SafeProofImage
                      src={p.proof_url}
                      alt="Proof receipt"
                      className={
                        'h-12 w-12 rounded-xl object-cover ring-1 ring-brand-200 ' +
                        'group-hover:opacity-80 transition'
                      }
                    />
                    <div
                      className={
                        'absolute inset-0 grid place-items-center bg-black/30 rounded-xl ' +
                        'opacity-0 group-hover:opacity-100 transition text-white'
                      }
                    >
                      <ExternalLink size={14} />
                    </div>
                  </a>
                ) : (
                  <div
                    className={
                      'h-12 w-12 rounded-xl bg-brand-100 grid place-items-center ' +
                      'text-brand-400 font-bold shrink-0'
                    }
                  >
                    Pay
                  </div>
                )}

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-brand-950 text-sm">
                      {money(p.amount)}
                    </span>
                    <span className="text-[11px] font-semibold text-brand-500">
                      • {p.method}
                    </span>
                  </div>
                  <p className="text-[10px] text-brand-400 mt-0.5">
                    {dateTime(p.payment_date || p.paymentDate || p.created_at)}
                    {p.notes ? ` • "${p.notes}"` : ''}
                  </p>
                </div>
              </div>

              <div className="self-start sm:self-auto shrink-0">
                {isVerified && (
                  <span
                    className={
                      'inline-flex items-center gap-1 rounded-full bg-emerald-100 ' +
                      'border border-emerald-300 px-2.5 py-1 text-[11px] font-black ' +
                      'text-emerald-800'
                    }
                  >
                    <CheckCircle2 size={12} />
                    Verified (Terverifikasi)
                  </span>
                )}
                {isPending && (
                  <span
                    className={
                      'inline-flex items-center gap-1 rounded-full bg-amber-100 ' +
                      'border border-amber-300 px-2.5 py-1 text-[11px] font-black ' +
                      'text-amber-900 animate-pulse'
                    }
                  >
                    <Clock size={12} />
                    Awaiting Verification (Menunggu)
                  </span>
                )}
                {isRejected && (
                  <span
                    className={
                      'inline-flex items-center gap-1 rounded-full bg-cherry-100 ' +
                      'border border-cherry-300 px-2.5 py-1 text-[11px] font-black ' +
                      'text-cherry-800'
                    }
                  >
                    <XCircle size={12} />
                    Rejected (Ditolak)
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
