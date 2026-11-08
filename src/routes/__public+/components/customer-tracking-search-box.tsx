import { Link } from 'react-router-dom';
import {
  AlertCircle,
  KeyRound,
  Lock,
  Search,
  ShieldCheck,
  Truck,
  UserCheck,
} from 'lucide-react';

interface CustomerTrackingSearchBoxProps {
  customerCode: string;
  setCustomerCode: (val: string) => void;
  phoneLast4: string;
  setPhoneLast4: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  error: string;
}

export function CustomerTrackingSearchBox({
  customerCode,
  setCustomerCode,
  phoneLast4,
  setPhoneLast4,
  onSubmit,
  loading,
  error,
}: CustomerTrackingSearchBoxProps) {
  const cleanDigits = phoneLast4.replace(/\D/g, '').slice(0, 4);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
      {/* Mode Switcher Tabs */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Link
          to="/track"
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition shadow-2xs"
        >
          <Truck size={15} className="text-slate-400" />
          <span>Lacak Cepat (No. Invoice / Order / Resi)</span>
        </Link>
        <div className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-4 py-2.5 text-xs font-black text-white shadow-sm shadow-rose-500/20">
          <UserCheck size={15} />
          <span>Lacak via Customer ID (Semua Invoice)</span>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl shadow-slate-950/5">
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 text-xs text-indigo-950">
          <ShieldCheck size={18} className="text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-black text-indigo-950">
              Verifikasi Keamanan Tanpa Login (2-Step Verification)
            </p>
            <p className="mt-0.5 text-indigo-800/90 leading-relaxed">
              Masukkan <strong>Customer ID</strong> beserta{' '}
              <strong>4 digit terakhir nomor WhatsApp</strong> yang terdaftar
              untuk melihat daftar seluruh Invoice dan memantau status pengiriman
              pesanan Anda.
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            {/* Customer ID Input */}
            <div className="sm:col-span-7">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                Customer ID
              </label>
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={customerCode}
                  onChange={(e) => setCustomerCode(e.target.value.toUpperCase())}
                  placeholder="Contoh: CUS-20261103-XXXXXX atau CUST-0001"
                  className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50/80 py-3.5 pl-11 pr-4 text-sm font-bold text-slate-900 outline-none transition focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-500/10 placeholder:text-slate-400 font-mono uppercase"
                  required
                />
              </div>
            </div>

            {/* Last 4 Digits of Phone Input */}
            <div className="sm:col-span-5">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                4 Digit Terakhir No. WhatsApp
              </label>
              <div className="relative">
                <KeyRound
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  pattern="\d{4}"
                  value={cleanDigits}
                  onChange={(e) =>
                    setPhoneLast4(e.target.value.replace(/\D/g, '').slice(0, 4))
                  }
                  placeholder="Contoh: 2535"
                  className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50/80 py-3.5 pl-11 pr-4 text-sm font-black tracking-[0.3em] text-slate-900 outline-none transition focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-500/10 placeholder:text-slate-400 placeholder:tracking-normal font-mono"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
              <Lock size={13} className="text-emerald-600 shrink-0" />
              <span>
                Dilindungi batas percobaan otomatis (Anti Brute-Force) & penyamaran data privasi
              </span>
            </div>

            <button
              type="submit"
              disabled={
                loading || !customerCode.trim() || cleanDigits.length !== 4
              }
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 px-7 py-3.5 text-sm font-black text-white shadow-md shadow-rose-600/25 transition hover:from-rose-700 hover:to-pink-700 active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
            >
              {loading ? (
                <span>Memverifikasi...</span>
              ) : (
                <>
                  <UserCheck size={17} />
                  <span>Verifikasi & Lihat Daftar Invoice</span>
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-xs font-semibold text-rose-700 animate-rise">
            <AlertCircle size={18} className="shrink-0 mt-0.5 text-rose-600" />
            <div>
              <p className="font-black text-rose-800">Verifikasi Gagal</p>
              <p className="mt-1 leading-relaxed">{error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

