import { ShieldCheck, Sparkles, Truck } from 'lucide-react';

export function EventsBanner() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div
        className={
          'rounded-[2.5rem] bg-gradient-to-br from-rose-950 via-slate-900 to-brand-950 ' +
          'p-8 sm:p-14 text-white shadow-2xl relative overflow-hidden'
        }
      >
        <div
          className={
            'absolute -top-16 -right-16 h-80 w-80 rounded-full ' +
            'bg-rose-500/20 blur-3xl pointer-events-none'
          }
        />
        <div
          className={
            'absolute -bottom-16 -left-16 h-80 w-80 rounded-full ' +
            'bg-amber-500/20 blur-3xl pointer-events-none'
          }
        />

        <div className="relative max-w-3xl">
          <span
            className={
              'inline-flex items-center gap-1.5 rounded-full bg-rose-500/30 ' +
              'px-3.5 py-1 text-xs font-black uppercase text-rose-200 ' +
              'border border-rose-500/40 backdrop-blur-md'
            }
          >
            <Sparkles size={13} className="text-amber-300" />
            Live Shopping Calendar
          </span>

          <h1
            className={
              'mt-4 text-3xl sm:text-5xl font-black tracking-tight ' +
              'text-white leading-tight'
            }
          >
            Event Jastip & Open PO Sedang Berjalan
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed font-medium">
            Daftar pameran pameran ibu & bayi (IMBEX, WILBEX, MB Fair), bazar buku impor (BBW
            Books), serta trip belanja mancanegara. Kami belanja langsung di venue resmi dengan
            jaminan 100% original.
          </p>

          <div
            className={
              'mt-6 flex flex-wrap items-center gap-4 text-xs ' +
              'font-semibold text-slate-400'
            }
          >
            <span className="flex items-center gap-1.5 text-rose-300">
              <ShieldCheck size={16} />
              Garansi Struk & Produk Original
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-amber-300">
              <Truck size={16} />
              Kirim Aman ke Seluruh Indonesia
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
