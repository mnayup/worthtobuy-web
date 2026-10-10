import React, { type FormEvent } from 'react';

interface ProfileDisableMfaModalProps {
  isOpen: boolean;
  onClose: () => void;
  disableVerifyInput: string;
  setDisableVerifyInput: (val: string) => void;
  disablingMfa: boolean;
  onSubmit: (e: FormEvent) => void;
}

export function ProfileDisableMfaModal({
  isOpen,
  onClose,
  disableVerifyInput,
  setDisableVerifyInput,
  disablingMfa,
  onSubmit,
}: ProfileDisableMfaModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className={
        'fixed inset-0 z-50 flex items-center justify-center p-4 ' +
        'bg-black/50 backdrop-blur-xs animate-fade-in'
      }
    >
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-brand-200">
        <h3 className="text-lg font-black text-brand-900 mb-1">Nonaktifkan MFA 2FA</h3>
        <p className="text-xs text-brand-500 mb-4 leading-relaxed">
          Untuk keamanan akun Anda, masukkan password akun Anda atau 6-digit kode OTP saat ini
          untuk mengonfirmasi penonaktifan MFA.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="label">Password Akun atau Kode OTP 6-Digit</label>
            <input
              type="password"
              required
              autoFocus
              value={disableVerifyInput}
              onChange={(e) => setDisableVerifyInput(e.target.value)}
              placeholder="Masukkan password atau kode OTP..."
              className="input"
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
              disabled={disablingMfa || !disableVerifyInput.trim()}
              className={
                'btn-secondary !h-10 px-4 text-xs font-bold text-red-600 ' +
                'border-red-300 hover:bg-red-50 cursor-pointer'
              }
            >
              {disablingMfa ? 'Memproses...' : 'Konfirmasi Nonaktifkan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
