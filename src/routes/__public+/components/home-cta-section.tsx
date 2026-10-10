import { Link } from 'react-router-dom';
import { MessageCircle, Truck } from 'lucide-react';

export function HomeCtaSection() {
  const waUrl =
    'https://wa.me/6281234567890?text=' +
    encodeURIComponent('Halo Admin Worthtobuy! Saya punya wishlist barang yang mau dititip.');

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div
        className={
          'rounded-[2.5rem] bg-gradient-to-r from-rose-600 via-pink-600 ' +
          'to-rose-700 p-8 sm:p-12 text-center text-white shadow-2xl relative overflow-hidden'
        }
      >
        <div
          className={
            'absolute -top-12 -right-12 h-64 w-64 rounded-full bg-white/10 ' +
            'blur-2xl pointer-events-none'
          }
        />

        <span
          className={
            'inline-flex items-center gap-1.5 rounded-full bg-white/20 ' +
            'px-3.5 py-1 text-xs font-black uppercase text-white backdrop-blur-md'
          }
        >
          <MessageCircle size={14} />
          Konsultasi Jastip Gratis
        </span>

        <h2 className="mt-4 text-3xl sm:text-4xl font-black tracking-tight text-white">
          Punya Barang Impian di Pameran Tertentu?
        </h2>

        <p className="mt-3 text-sm sm:text-base text-rose-100 max-w-xl mx-auto font-medium">
          Kirimkan foto atau wishlist belanja Anda ke Admin WhatsApp kami. Kami siap
          mencarikan dan mengamankan barang Anda langsung dari venue!
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={
              'inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-3.5 ' +
              'text-sm font-black text-rose-700 shadow-xl transition hover:bg-rose-50 ' +
              'active:scale-95'
            }
          >
            <MessageCircle size={18} className="text-emerald-600" />
            <span>Chat WhatsApp Sekarang</span>
          </a>

          <Link
            to="/track"
            className={
              'inline-flex items-center gap-2 rounded-2xl border border-white/40 ' +
              'bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-md ' +
              'transition hover:bg-white/20'
            }
          >
            <Truck size={17} />
            <span>Lacak Pesanan Saya</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
