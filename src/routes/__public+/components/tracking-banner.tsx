import { Truck } from 'lucide-react';

export function TrackingBanner() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div
        className={
          'rounded-[2.5rem] bg-gradient-to-br from-brand-950 via-slate-900 ' +
          'to-indigo-950 p-8 sm:p-14 text-white shadow-2xl relative overflow-hidden'
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
            'bg-indigo-500/20 blur-3xl pointer-events-none'
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
            <Truck size={13} className="text-rose-300" />
            Live Order & Parcel Tracking
          </span>

          <h1
            className={
              'mt-4 text-3xl sm:text-5xl font-black tracking-tight ' +
              'text-white leading-tight'
            }
          >
            Lacak Status Pesanan Tanpa Login
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed font-medium">
            Pantau perjalanan titipan belanja Anda: mulai dari verifikasi pembayaran,
            pencarian di venue event, tiba di Hub Warehouse, packing, hingga nomor resi
            kurir pengiriman.
          </p>
        </div>
      </div>
    </div>
  );
}
