import React, { type FormEvent } from 'react';
import {
  ShieldCheck,
  QrCode,
  Copy,
  Check,
  Download,
  Loader2,
} from 'lucide-react';

interface ProfileMfaModalProps {
  isOpen: boolean;
  onClose: () => void;
  mfaRecoveryCodes: string[];
  mfaSetupData: { secret: string; qrCodeDataUrl: string } | null;
  mfaCode: string;
  setMfaCode: (val: string) => void;
  enablingMfa: boolean;
  copiedSecret: boolean;
  copiedRecovery: boolean;
  onCopySecret: () => void;
  onCopyRecovery: () => void;
  onDownloadRecovery: () => void;
  onSubmitOtp: (e: FormEvent) => void;
}

export function ProfileMfaModal({
  isOpen,
  onClose,
  mfaRecoveryCodes,
  mfaSetupData,
  mfaCode,
  setMfaCode,
  enablingMfa,
  copiedSecret,
  copiedRecovery,
  onCopySecret,
  onCopyRecovery,
  onDownloadRecovery,
  onSubmitOtp,
}: ProfileMfaModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className={
        'fixed inset-0 z-50 flex items-center justify-center p-4 ' +
        'bg-black/50 backdrop-blur-xs animate-fade-in'
      }
    >
      <div
        className={
          'w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 ' +
          'shadow-2xl border border-brand-200 max-h-[90vh] overflow-y-auto'
        }
      >
        {mfaRecoveryCodes.length > 0 ? (
          /* Step 3: Backup Recovery Codes Display */
          <div className="space-y-5 animate-rise">
            <div className="flex items-center gap-2 text-emerald-600">
              <ShieldCheck size={26} />
              <span className="text-xs font-black uppercase tracking-wider">
                MFA Berhasil Diaktifkan!
              </span>
            </div>
            <h3 className="text-xl font-black text-brand-900">
              Simpan Kode Pemulihan (Backup Codes)
            </h3>
            <p className="text-xs text-brand-600 leading-relaxed">
              Jika Anda kehilangan akses ke aplikasi Authenticator ponsel Anda, Anda dapat
              menggunakan salah satu kode pemulihan ini untuk masuk.
            </p>

            <div className="rounded-2xl border border-brand-200 bg-brand-50/60 p-4">
              <div
                className={
                  'grid grid-cols-2 gap-2.5 font-mono text-xs ' +
                  'font-black text-brand-900 text-center'
                }
              >
                {mfaRecoveryCodes.map((code, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-2 rounded-lg border border-brand-200/80 shadow-2xs"
                  >
                    {code}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onCopyRecovery}
                className={
                  'btn-secondary flex-1 py-2.5 text-xs font-bold ' +
                  'flex items-center justify-center gap-1.5 cursor-pointer'
                }
              >
                {copiedRecovery ? (
                  <Check size={14} className="text-emerald-600" />
                ) : (
                  <Copy size={14} />
                )}
                <span>{copiedRecovery ? 'Tersalin!' : 'Salin Semua'}</span>
              </button>
              <button
                type="button"
                onClick={onDownloadRecovery}
                className={
                  'btn-secondary flex-1 py-2.5 text-xs font-bold ' +
                  'flex items-center justify-center gap-1.5 cursor-pointer'
                }
              >
                <Download size={14} />
                <span>Download TXT</span>
              </button>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className={
                  'btn-primary w-full py-3 text-xs font-black ' +
                  'shadow-md shadow-cherry-500/25 cursor-pointer'
                }
              >
                Selesai & Tutup
              </button>
            </div>
          </div>
        ) : (
          /* Step 1 & 2: Scan QR & Enter OTP */
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-brand-100">
              <div className="flex items-center gap-2 text-cherry-600">
                <QrCode size={20} />
                <h3 className="text-base font-black text-brand-900">
                  Pengaturan Authenticator (MFA)
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-bold text-brand-400 hover:text-brand-700 cursor-pointer"
              >
                Batal
              </button>
            </div>

            {mfaSetupData ? (
              <form onSubmit={onSubmitOtp} className="space-y-5">
                <div className="text-xs text-brand-600 leading-relaxed space-y-2">
                  <p>
                    <strong>Langkah 1:</strong> Buka Google Authenticator / 1Password di ponsel
                    Anda, lalu pindai kode QR di bawah ini:
                  </p>
                </div>

                {/* QR Code display */}
                <div
                  className={
                    'flex flex-col items-center justify-center p-4 ' +
                    'rounded-2xl bg-brand-50/50 border border-brand-200'
                  }
                >
                  <img
                    src={mfaSetupData.qrCodeDataUrl}
                    alt="MFA QR Code"
                    className="w-48 h-48 rounded-xl bg-white p-2 shadow-xs"
                  />
                  <p className="mt-3 text-[11px] text-brand-500 font-medium">
                    Atau masukkan kunci rahasia secara manual:
                  </p>
                  <div
                    className={
                      'mt-1 flex items-center gap-2 bg-white px-3 py-1.5 ' +
                      'rounded-lg border border-brand-200 text-xs font-mono font-bold text-brand-900'
                    }
                  >
                    <span>{mfaSetupData.secret}</span>
                    <button
                      type="button"
                      onClick={onCopySecret}
                      className="p-1 text-brand-400 hover:text-brand-900 transition cursor-pointer"
                      title="Copy secret key"
                    >
                      {copiedSecret ? (
                        <Check size={14} className="text-emerald-600" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="label">
                    <strong>Langkah 2:</strong> Masukkan 6-digit kode OTP dari aplikasi
                  </label>
                  <input
                    type="text"
                    autoFocus
                    maxLength={6}
                    required
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Contoh: 123456"
                    className="input text-center font-mono text-xl tracking-widest font-black"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn-secondary !h-10 px-4 text-xs font-bold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={enablingMfa || mfaCode.length < 6}
                    className={
                      'btn-primary !h-10 px-6 text-xs font-black shadow-md ' +
                      'shadow-cherry-500/25 flex items-center gap-2 cursor-pointer'
                    }
                  >
                    {enablingMfa && <Loader2 size={15} className="animate-spin" />}
                    <span>{enablingMfa ? 'Memverifikasi...' : 'Aktifkan MFA'}</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex h-48 items-center justify-center">
                <Loader2 size={24} className="animate-spin text-cherry-600" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
