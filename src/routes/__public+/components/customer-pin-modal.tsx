import { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  ShieldCheck,
  UserCheck,
  X,
} from 'lucide-react';

interface CustomerPinModalProps {
  open: boolean;
  customerCode: string;
  phoneLast5: string;
  setPhoneLast5: (val: string) => void;
  loading: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function CustomerPinModal({
  open,
  customerCode,
  phoneLast5,
  setPhoneLast5,
  loading,
  error,
  onClose,
  onSubmit,
}: CustomerPinModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setShowPassword(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 60);
    }
  }, [open]);

  if (!open) return null;

  const cleanDigits = phoneLast5.replace(/\D/g, '').slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-fade-in">
      <div
        className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-2xl animate-rise"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
          aria-label="Tutup modal"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-500 text-white shadow-md shadow-rose-500/25 shrink-0">
            <ShieldCheck size={24} />
          </div>
          <div>
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-rose-700 border border-rose-200">
              Verifikasi Customer
            </span>
            <h3 className="mt-1 text-lg font-black text-slate-900">
              Konfirmasi Nomor Telepon
            </h3>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200/80 bg-slate-50 p-3.5 text-xs text-slate-600 leading-relaxed">
          Untuk mengakses daftar invoice milik Customer ID{' '}
          <span className="inline-block rounded-md bg-white px-2 py-0.5 font-mono font-black text-rose-700 border border-rose-200">
            {customerCode.toUpperCase()}
          </span>
          , masukkan <strong>5 digit terakhir nomor WhatsApp/telepon</strong>{' '}
          Anda yang terdaftar.
        </div>

        <form onSubmit={onSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
              5 Digit Terakhir Nomor Telepon / WhatsApp
            </label>
            <div className="relative">
              <KeyRound
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                ref={inputRef}
                type={showPassword ? 'text' : 'password'}
                inputMode="numeric"
                autoComplete="off"
                maxLength={5}
                value={cleanDigits}
                onChange={(e) =>
                  setPhoneLast5(e.target.value.replace(/\D/g, '').slice(0, 5))
                }
                placeholder="•••••"
                className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50/80 py-3.5 pl-11 pr-12 text-base font-black tracking-[0.35em] text-slate-900 outline-none transition focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-500/10 placeholder:text-slate-300 font-mono"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
                title={showPassword ? 'Sembunyikan digit' : 'Lihat digit'}
                aria-label={showPassword ? 'Sembunyikan digit' : 'Lihat digit'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span className="inline-flex items-center gap-1">
                <Lock size={12} className="text-emerald-600" />
                Privasi dilindungi tanpa perlu login
              </span>
              <span className="font-mono font-bold text-slate-500">
                {cleanDigits.length}/5 digit
              </span>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50/90 p-3.5 text-xs font-semibold text-rose-700 animate-rise">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || cleanDigits.length !== 5}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 px-5 py-3 text-xs font-black text-white shadow-md shadow-rose-600/25 hover:from-rose-700 hover:to-pink-700 active:scale-95 disabled:opacity-50 transition cursor-pointer"
            >
              {loading ? (
                <span>Memverifikasi...</span>
              ) : (
                <>
                  <UserCheck size={16} />
                  <span>Verifikasi & Lihat Invoice</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

