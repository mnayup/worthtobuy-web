import { Package, ShieldCheck, Sparkles, Truck } from 'lucide-react';

export function HomePillarsSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div
        className={
          'rounded-[2.5rem] bg-gradient-to-br from-brand-950 via-slate-900 ' +
          'to-brand-900 p-8 sm:p-14 text-white shadow-2xl relative overflow-hidden'
        }
      >
        <div
          className={
            'absolute -top-24 -right-24 h-96 w-96 rounded-full ' +
            'bg-rose-500/20 blur-3xl pointer-events-none'
          }
        />
        <div
          className={
            'absolute -bottom-24 -left-24 h-96 w-96 rounded-full ' +
            'bg-indigo-500/20 blur-3xl pointer-events-none'
          }
        />

        <div className="relative text-center max-w-2xl mx-auto">
          <span
            className={
              'inline-flex items-center gap-1.5 rounded-full bg-rose-500/20 ' +
              'px-3.5 py-1 text-xs font-extrabold text-rose-300 border border-rose-500/30'
            }
          >
            <ShieldCheck size={14} />
            Komitmen Kualitas & Pelayanan
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-black tracking-tight text-white">
            Kenapa Belanja Jastip di Worthtobuy?
          </h2>
          <p className="mt-3 text-sm text-slate-400 leading-relaxed">
            Kami telah dipercaya ribuan pelanggan sejak 2019 karena transparansi,
            ketepatan, dan jaminan keaslian barang.
          </p>
        </div>

        <div className="relative mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <div
              className={
                'flex h-12 w-12 items-center justify-center rounded-xl ' +
                'bg-rose-500/20 text-rose-400'
              }
            >
              <ShieldCheck size={26} />
            </div>
            <h3 className="mt-4 text-base font-extrabold text-white">100% Produk Original</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              Belanja langsung di booth resmi pameran & authorized store, lengkap dengan
              struk fisik.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <div
              className={
                'flex h-12 w-12 items-center justify-center rounded-xl ' +
                'bg-amber-500/20 text-amber-400'
              }
            >
              <Sparkles size={26} />
            </div>
            <h3 className="mt-4 text-base font-extrabold text-white">Live Shopping Story</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              Update langsung dari venue via Instagram Story @worthtobuy_sub & broadcast WhatsApp.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <div
              className={
                'flex h-12 w-12 items-center justify-center rounded-xl ' +
                'bg-emerald-500/20 text-emerald-400'
              }
            >
              <Truck size={26} />
            </div>
            <h3 className="mt-4 text-base font-extrabold text-white">Packing Ekstra Aman</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              Setiap barang dibungkus bubble wrap tebal dan proteksi anti basah untuk
              pengiriman ke seluruh nusantara.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <div
              className={
                'flex h-12 w-12 items-center justify-center rounded-xl ' +
                'bg-indigo-500/20 text-indigo-400'
              }
            >
              <Package size={26} />
            </div>
            <h3 className="mt-4 text-base font-extrabold text-white">Deposit & Refund Mudah</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              Jika barang habis, uang langsung kembali atau dapat disimpan sebagai
              saldo deposit tanpa potongan.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
