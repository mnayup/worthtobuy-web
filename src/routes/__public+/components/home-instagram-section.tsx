import { Instagram } from 'lucide-react';
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from '~/lib/brand';

const SHOWCASE_CARDS = [
  {
    title: 'IMBEX Hall Live',
    tag: '#HaulIMBEX',
    img:
      'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4' +
      '?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'BBW Books Collection',
    tag: '#BukuImpor',
    img:
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c' +
      '?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Safe Packing & QC',
    tag: '#BubbleWrapTebal',
    img:
      'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd' +
      '?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Happy Customers',
    tag: '#TestimoniWTB',
    img:
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af' +
      '?auto=format&fit=crop&w=600&q=80',
  },
];

export function HomeInstagramSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div
        className={
          'rounded-3xl border border-pink-100 bg-gradient-to-br ' +
          'from-pink-50/60 via-white to-rose-50/40 p-8 sm:p-12'
        }
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-pink-600 font-extrabold text-xs">
              <Instagram size={18} />
              <span>Follow Instagram {INSTAGRAM_HANDLE}</span>
            </div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-black text-slate-900">
              Update Live Shopping & Testimoni
            </h2>
            <p className="mt-1 text-sm text-slate-600 max-w-xl">
              Cek highlight Instagram kami untuk melihat live review booth pameran,
              unboxing hasil belanja, dan ribuan bukti pengiriman customer sejak 2019.
            </p>
          </div>

          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={
              'inline-flex items-center justify-center gap-2 rounded-2xl ' +
              'bg-gradient-to-r from-pink-600 to-rose-600 px-6 py-3.5 text-sm ' +
              'font-black text-white shadow-lg shadow-pink-500/25 transition ' +
              'hover:shadow-xl hover:-translate-y-0.5 shrink-0'
            }
          >
            <Instagram size={18} />
            <span>Buka Instagram {INSTAGRAM_HANDLE}</span>
          </a>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {SHOWCASE_CARDS.map((card, idx) => (
            <div
              key={idx}
              className="group relative aspect-4/3 overflow-hidden rounded-2xl shadow-sm"
            >
              <img
                src={card.img}
                alt={card.title}
                className={
                  'h-full w-full object-cover transition-transform ' +
                  'duration-300 group-hover:scale-105'
                }
                loading="lazy"
              />
              <div
                className={
                  'absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent ' +
                  'to-transparent flex flex-col justify-end p-3 text-white'
                }
              >
                <span className="text-[10px] font-black text-rose-300">{card.tag}</span>
                <span className="text-xs font-bold leading-tight">{card.title}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
