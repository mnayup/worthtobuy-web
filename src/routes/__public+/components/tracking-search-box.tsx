import { AlertCircle, Search, ShieldCheck, Truck } from 'lucide-react';

interface TrackingSearchBoxProps {
  inputCode: string;
  setInputCode: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  error: string;
  onSelectSample: (sample: string) => void;
}

export function TrackingSearchBox({
  inputCode,
  setInputCode,
  onSubmit,
  loading,
  error,
  onSelectSample,
}: TrackingSearchBoxProps) {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
      <div
        className={
          'rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 ' +
          'shadow-xl shadow-slate-950/5'
        }
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
              Nomor Invoice / Order ID / Customer ID / Nomor Resi Kurir
            </label>
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 border border-indigo-200/70">
              <ShieldCheck size={12} className="text-indigo-600" />
              Customer ID (CUS-... / CUST-...) dilindungi verifikasi 5 digit No. Telepon
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="Contoh: CUS-20261103-... atau INV-2026-0001 atau ORD-2026-0002 atau Resi..."
                className={
                  'w-full rounded-2xl border-2 border-slate-200 bg-slate-50/80 ' +
                  'py-3.5 pl-11 pr-4 text-sm font-bold text-slate-900 outline-none ' +
                  'transition focus:border-rose-500 focus:bg-white focus:ring-4 ' +
                  'focus:ring-rose-500/10 placeholder:text-slate-400 font-mono'
                }
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !inputCode.trim()}
              className={
                'inline-flex items-center justify-center gap-2 rounded-2xl ' +
                'bg-gradient-to-r from-rose-600 to-pink-600 px-7 py-3.5 text-sm ' +
                'font-black text-white shadow-md shadow-rose-600/25 transition ' +
                'hover:from-rose-700 hover:to-pink-700 active:scale-95 ' +
                'disabled:opacity-50 cursor-pointer shrink-0'
              }
            >
              {loading ? (
                <span>Mencari...</span>
              ) : (
                <>
                  <Truck size={17} />
                  <span>Lacak Status</span>
                </>
              )}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-slate-500">
            <span className="font-bold text-slate-400">Coba nomor demo:</span>
            <button
              type="button"
              onClick={() => onSelectSample('INV-2026-0001')}
              className={
                'rounded-lg border border-rose-200 bg-rose-50/70 px-2.5 py-1 ' +
                'text-xs font-black text-rose-700 hover:bg-rose-100 transition cursor-pointer'
              }
            >
              INV-2026-0001 (Belanja di Event)
            </button>
            <button
              type="button"
              onClick={() => onSelectSample('004289104829')}
              className={
                'rounded-lg border border-emerald-200 bg-emerald-50/70 px-2.5 py-1 ' +
                'text-xs font-black text-emerald-700 hover:bg-emerald-100 transition cursor-pointer'
              }
            >
              004289104829 (SiCepat Resi)
            </button>
          </div>
        </form>

        {error && (
          <div
            className={
              'mt-6 flex items-start gap-3 rounded-2xl border border-rose-200 ' +
              'bg-rose-50/90 p-4 text-xs font-semibold text-rose-700 animate-rise'
            }
          >
            <AlertCircle size={18} className="shrink-0 mt-0.5 text-rose-600" />
            <div>
              <p className="font-black text-rose-800">Pesanan Tidak Ditemukan</p>
              <p className="mt-1 leading-relaxed">{error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
