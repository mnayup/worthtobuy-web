import React from 'react';
import { Clock, CheckCircle2, Lock, ExternalLink } from 'lucide-react';
import { money, date } from '~/lib/format';

interface PendingProofBannerProps {
  pendingPayment: any;
  onAddNewProof?: () => void;
  allowMultiple?: boolean;
}

export function PendingProofBanner({
  pendingPayment,
  onAddNewProof,
  allowMultiple,
}: PendingProofBannerProps) {
  const amount = Number(pendingPayment?.amount || 0);
  const method = pendingPayment?.method || 'Bank Transfer';
  const payDate = pendingPayment?.payment_date || pendingPayment?.paymentDate;
  const proofUrl = pendingPayment?.proof_url || pendingPayment?.proofUrl;
  const isQris = String(method).toUpperCase().includes('QRIS');

  return (
    <div
      className={
        'rounded-3xl border border-amber-200 bg-amber-50/80 p-6 sm:p-7 ' +
        'shadow-sm space-y-4'
      }
    >
      <div className="flex items-start gap-3">
        <div
          className={
            'grid h-10 w-10 place-items-center rounded-2xl bg-amber-500 ' +
            'text-white shrink-0 mt-0.5'
          }
        >
          <Clock size={20} />
        </div>
        <div className="flex-1">
          <span
            className={
              'rounded-md bg-amber-200/80 text-amber-950 font-black ' +
              'text-[10px] uppercase px-2 py-0.5'
            }
          >
            Transfer Submitted • Awaiting Verification
          </span>
          <h3 className="text-base font-black text-amber-950 mt-1">
            Bukti Transfer Sudah Terkirim (Menunggu Verifikasi)
          </h3>
          <p className="text-xs text-amber-800 leading-relaxed mt-1">
            Anda telah mengirim bukti transfer sebesar{' '}
            <strong className="text-amber-950">{money(amount)}</strong> ({method}).
            Admin kami sedang memverifikasi dana yang masuk.
            {isQris || allowMultiple
              ? ' Anda dapat mengirimkan bukti pembayaran QRIS tambahan di bawah jika melakukan transfer bertahap.'
              : ' Form transfer ditutup sementara hingga proses verifikasi selesai.'}
          </p>
        </div>
      </div>

      <div
        className={
          'rounded-2xl bg-white/90 p-3.5 border border-amber-200 text-xs ' +
          'flex flex-wrap items-center justify-between gap-3 shadow-2xs'
        }
      >
        <div>
          <span className="text-[10px] text-amber-700 block font-bold uppercase">
            Nominal Ditransfer
          </span>
          <span className="font-black text-brand-950 text-sm">
            {money(amount)}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-amber-700 block font-bold uppercase">
            Metode Pembayaran
          </span>
          <span className="font-bold text-brand-800">{method}</span>
        </div>
        {payDate && (
          <div>
            <span className="text-[10px] text-amber-700 block font-bold uppercase">
              Waktu Unggah
            </span>
            <span className="font-bold text-brand-800">{date(payDate)}</span>
          </div>
        )}
        {proofUrl && (
          <a
            href={proofUrl}
            target="_blank"
            rel="noreferrer"
            className={
              'inline-flex items-center gap-1 rounded-xl border border-amber-300 ' +
              'bg-amber-100/70 px-3 py-1.5 text-xs font-bold text-amber-950 ' +
              'hover:bg-amber-200 transition'
            }
          >
            <ExternalLink size={12} /> Lihat Bukti Transfer
          </a>
        )}
      </div>
    </div>
  );
}

interface WaitingSettlementBannerProps {
  paidAmount: number;
  outstandingAmount: number;
}

export function WaitingSettlementBanner({
  paidAmount,
  outstandingAmount,
}: WaitingSettlementBannerProps) {
  return (
    <div
      className={
        'rounded-3xl border border-sky-200 bg-sky-50/80 p-6 sm:p-7 ' +
        'shadow-sm space-y-3.5'
      }
    >
      <div className="flex items-start gap-3">
        <div
          className={
            'grid h-10 w-10 place-items-center rounded-2xl bg-sky-600 ' +
            'text-white shrink-0 mt-0.5'
          }
        >
          <CheckCircle2 size={20} />
        </div>
        <div>
          <span
            className={
              'rounded-md bg-sky-200/80 text-sky-950 font-black ' +
              'text-[10px] uppercase px-2 py-0.5'
            }
          >
            DP Received • Order In Progress
          </span>
          <h3 className="text-base font-black text-sky-950 mt-1">
            Pembayaran DP Telah Diterima (Pesanan Sedang Diproses)
          </h3>
          <p className="text-xs text-sky-800 leading-relaxed mt-1">
            Pembayaran Down Payment sebesar{' '}
            <strong className="text-sky-950">{money(paidAmount)}</strong> telah berhasil
            diverifikasi. Tim kami sedang memproses pembelian pesanan Anda.
          </p>
        </div>
      </div>

      <div
        className={
          'rounded-2xl bg-white/90 p-4 border border-sky-200 text-xs ' +
          'space-y-1.5 shadow-2xs'
        }
      >
        <div className="flex items-center gap-2 text-brand-900 font-black">
          <Lock size={14} className="text-sky-600" />
          <span>Form Pelunasan Belum Dibuka</span>
        </div>
        <p className="text-brand-600 text-xs leading-relaxed">
          Form transfer pelunasan (sisa{' '}
          <strong className="text-cherry-600 font-black">
            {money(outstandingAmount)}
          </strong>
          ) akan otomatis aktif saat pesanan tiba dan status berubah menjadi{' '}
          <strong className="text-brand-900 font-extrabold">
            Waiting for Settlement (Menunggu Pelunasan)
          </strong>
          .
        </p>
      </div>
    </div>
  );
}

export function PaidInFullBanner() {
  return (
    <div
      className={
        'rounded-3xl border border-emerald-200 bg-emerald-50/70 p-6 ' +
        'text-center space-y-2 shadow-sm'
      }
    >
      <CheckCircle2 size={36} className="text-emerald-600 mx-auto" />
      <h3 className="text-base font-black text-emerald-950">
        Payment Verified in Full (Invoice Lunas)
      </h3>
      <p className="text-xs text-emerald-800">
        All orders under this invoice are fully paid. Thank you for shopping with WORTHTOBUY!
      </p>
    </div>
  );
}

export const PAYMENT_METHODS = [
  'Bank Transfer BCA',
  'Bank Transfer Mandiri',
  'Bank Transfer BRI',
  'Bank Transfer BNI',
  'QRIS',
  'ShopeePay / E-Wallet',
  'Other Bank Transfer',
];
