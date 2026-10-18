import React from 'react';
import { ArrowUpRight, CheckCircle2, Clock, ExternalLink, Wallet } from 'lucide-react';
import { money, dateTime } from '~/lib/format';
import { SafeProofImage } from '~/components/SafeProofImage';

interface PublicInvoiceRefundsListProps {
  refunds: any[];
}

export function PublicInvoiceRefundsList({ refunds }: PublicInvoiceRefundsListProps) {
  if (!refunds || refunds.length === 0) return null;

  return (
    <div className="rounded-3xl border border-brand-200/90 bg-white p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-brand-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-lg bg-sky-600 text-white">
            <ArrowUpRight size={14} />
          </span>
          <h2 className="text-sm font-black uppercase tracking-wider text-brand-900">
            Riwayat Refund / Pengembalian Dana
          </h2>
        </div>
        <span className="rounded-full bg-sky-100 text-sky-800 text-[10px] font-black px-2.5 py-0.5 border border-sky-200">
          {refunds.length} Pengembalian
        </span>
      </div>

      <div className="space-y-3">
        {refunds.map((r: any) => {
          const isDeposit = r.refund_type === 'CUSTOMER_DEPOSIT' || r.refundType === 'CUSTOMER_DEPOSIT';
          const isPaid = r.status === 'PAID';
          const isApproved = r.status === 'APPROVED' || r.status === 'ON_PROCESS';
          const isRequested = r.status === 'REQUESTED';

          const cardBorder = isPaid
            ? 'border-emerald-200 bg-emerald-50/40'
            : isApproved
            ? 'border-sky-200 bg-sky-50/40'
            : isRequested
            ? 'border-amber-200 bg-amber-50/40'
            : 'border-cherry-200 bg-cherry-50/40';

          const proof = r.proof_url || r.proofUrl;
          const bankName = r.bank_name || r.bankName;
          const accNumber = r.account_number || r.accountNumber;
          const accHolder = r.account_holder || r.accountHolder;

          return (
            <div
              key={r.id}
              className={`rounded-2xl border p-3.5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${cardBorder}`}
            >
              <div className="flex items-start sm:items-center gap-3 min-w-0">
                {/* Proof Image or Badge */}
                {proof ? (
                  <a
                    href={proof}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative group shrink-0"
                    title="Klik untuk melihat bukti transfer refund"
                  >
                    <SafeProofImage
                      src={proof}
                      alt="Bukti Transfer Refund"
                      className="h-14 w-14 rounded-xl object-cover ring-1 ring-brand-200 group-hover:opacity-80 transition"
                    />
                    <div className="absolute inset-0 grid place-items-center bg-black/30 rounded-xl opacity-0 group-hover:opacity-100 transition text-white">
                      <ExternalLink size={14} />
                    </div>
                  </a>
                ) : (
                  <div className="h-14 w-14 rounded-xl bg-sky-100 grid place-items-center text-sky-700 font-bold shrink-0 border border-sky-200">
                    {isDeposit ? <Wallet size={20} /> : <ArrowUpRight size={20} />}
                  </div>
                )}

                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-extrabold text-brand-950 text-sm">
                      {money(r.amount)}
                    </span>
                    <span className="rounded-md bg-white border border-brand-200 px-2 py-0.5 text-[10px] font-bold text-brand-700">
                      {r.refund_number || r.refundNumber}
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[9px] font-black uppercase ${
                        isDeposit
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-sky-100 text-sky-800'
                      }`}
                    >
                      {isDeposit ? 'Saldo Deposit' : 'Transfer Rekening'}
                    </span>
                  </div>

                  <p className="text-[11px] text-brand-700 font-semibold">
                    Alasan: {r.reason || '-'}
                  </p>

                  {!isDeposit && (bankName || accNumber || accHolder) && (
                    <p className="text-[11px] text-brand-600 font-medium">
                      Rekening Tujuan: <strong>{bankName}</strong> {accNumber ? `(${accNumber})` : ''} {accHolder ? `a/n ${accHolder}` : ''}
                    </p>
                  )}

                  {proof && (
                    <a
                      href={proof}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 hover:text-sky-900 underline pt-0.5"
                    >
                      <ExternalLink size={12} /> Lihat Bukti Transfer Pemilik
                    </a>
                  )}

                  <p className="text-[10px] text-brand-400">
                    {dateTime(r.refunded_at || r.refundedAt || r.created_at)}
                    {r.transfer_notes || r.notes ? ` • "${r.transfer_notes || r.notes}"` : ''}
                  </p>
                </div>
              </div>

              <div className="self-start sm:self-auto shrink-0">
                {isPaid && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-1 text-[11px] font-black text-emerald-800">
                    <CheckCircle2 size={12} />
                    Refund Berhasil (Selesai)
                  </span>
                )}
                {isApproved && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 border border-sky-300 px-2.5 py-1 text-[11px] font-black text-sky-800">
                    <Clock size={12} />
                    Menunggu Transfer Owner
                  </span>
                )}
                {isRequested && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 border border-amber-300 px-2.5 py-1 text-[11px] font-black text-amber-900">
                    <Clock size={12} />
                    Diajukan (Review)
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
