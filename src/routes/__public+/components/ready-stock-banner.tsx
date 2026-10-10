import { Boxes, ShieldCheck, Truck } from 'lucide-react';

export function ReadyStockBanner() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div
        className={
          'rounded-[2.5rem] bg-gradient-to-br from-amber-950 via-slate-900 ' +
          'to-brand-950 p-8 sm:p-14 text-white shadow-2xl relative overflow-hidden'
        }
      >
        <div
          className={
            'absolute -top-16 -right-16 h-80 w-80 rounded-full ' +
            'bg-amber-500/20 blur-3xl pointer-events-none'
          }
        />
        <div
          className={
            'absolute -bottom-16 -left-16 h-80 w-80 rounded-full ' +
            'bg-rose-500/20 blur-3xl pointer-events-none'
          }
        />

        <div className="relative max-w-3xl">
          <span
            className={
              'inline-flex items-center gap-1.5 rounded-full bg-amber-500/30 ' +
              'px-3.5 py-1 text-xs font-black uppercase text-amber-200 ' +
              'border border-amber-500/40 backdrop-blur-md'
            }
          >
            <Boxes size={13} className="text-amber-300" />
            Central Warehouse Inventory
          </span>

          <h1
            className={
              'mt-4 text-3xl sm:text-5xl font-black tracking-tight ' +
              'text-white leading-tight'
            }
          >
            Ready Stock Items — Siap Kirim Hari Ini
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed font-medium">
            Koleksi barang original yang telah siap di warehouse kami. Siap dikirim
            hari ini via kurir instant (area tertentu) atau ekspedisi ke seluruh
            Indonesia tanpa menunggu jadwal event belanja!
          </p>

          <div
            className={
              'mt-6 flex flex-wrap items-center gap-4 text-xs ' +
              'font-semibold text-slate-400'
            }
          >
            <span className="flex items-center gap-1.5 text-amber-300">
              <Truck size={16} />
              Tersedia Pengiriman Instant
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-emerald-300">
              <ShieldCheck size={16} />
              Stok Asli & Fisik Tersedia
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
