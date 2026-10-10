import React from 'react';
import { ShieldCheck, QrCode, AlertTriangle } from 'lucide-react';

interface ProfileMfaSectionProps {
  mfaEnabled?: boolean;
  onStartSetup: () => void;
  onOpenDisable: () => void;
}

export function ProfileMfaSection({
  mfaEnabled,
  onStartSetup,
  onOpenDisable,
}: ProfileMfaSectionProps) {
  return (
    <div className="rounded-3xl border border-brand-200/80 bg-white p-6 sm:p-8 shadow-xs">
      <div
        className={
          'flex flex-col md:flex-row md:items-center justify-between ' +
          'gap-4 pb-5 border-b border-brand-100'
        }
      >
        <div className="flex items-start gap-3">
          <div
            className={
              'flex h-12 w-12 items-center justify-center rounded-2xl ' +
              'bg-cherry-50 text-cherry-600 border border-cherry-200 shrink-0'
            }
          >
            <ShieldCheck size={26} />
          </div>
          <div>
            <h2 className="text-base font-black text-brand-900">
              Two-Factor Authentication (MFA / 2FA)
            </h2>
            <p className="text-xs text-brand-500 leading-relaxed max-w-xl mt-0.5">
              Tambahkan lapisan keamanan ekstra pada akun Anda. Setiap kali login,
              sistem akan meminta 6-digit kode verifikasi dari aplikasi Authenticator.
            </p>
          </div>
        </div>

        <div className="shrink-0">
          {mfaEnabled ? (
            <button
              type="button"
              onClick={onOpenDisable}
              className={
                'btn-secondary !h-10 px-4 text-xs font-bold text-red-600 ' +
                'border-red-200 hover:bg-red-50 hover:border-red-300 cursor-pointer'
              }
            >
              Nonaktifkan MFA
            </button>
          ) : (
            <button
              type="button"
              onClick={onStartSetup}
              className={
                'btn-primary !h-10 px-5 text-xs font-black shadow-md ' +
                'shadow-cherry-500/25 flex items-center gap-2 cursor-pointer'
              }
            >
              <QrCode size={16} />
              <span>Aktifkan MFA 2FA</span>
            </button>
          )}
        </div>
      </div>

      {mfaEnabled ? (
        <div
          className={
            'mt-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 ' +
            'p-4 flex items-center gap-3'
          }
        >
          <ShieldCheck size={20} className="text-emerald-600 shrink-0" />
          <div className="text-xs text-emerald-800">
            <span className="font-black">Status Keamanan: Terproteksi Tinggi.</span>
            <p className="mt-0.5 text-emerald-700">
              Autentikasi dua faktor aktif. Anda memerlukan kode OTP setiap kali masuk ke akun ini.
            </p>
          </div>
        </div>
      ) : (
        <div
          className={
            'mt-5 rounded-2xl bg-amber-50/80 border border-amber-200 ' +
            'p-4 flex items-center gap-3'
          }
        >
          <AlertTriangle size={20} className="text-amber-600 shrink-0" />
          <div className="text-xs text-amber-800">
            <span className="font-bold">Rekomendasi Keamanan:</span> Akun Anda saat ini
            hanya dilindungi oleh password. Aktifkan MFA untuk mencegah akses tidak sah.
          </div>
        </div>
      )}
    </div>
  );
}
