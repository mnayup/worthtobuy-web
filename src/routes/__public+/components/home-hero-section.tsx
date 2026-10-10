import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Boxes,
  Flame,
  Instagram,
  Search,
  Sparkles,
  Star,
} from 'lucide-react';

interface HomeHeroSectionProps {
  trackingCode: string;
  setTrackingCode: (val: string) => void;
  onQuickTrack: (e: React.FormEvent) => void;
}

export function HomeHeroSection({
  trackingCode,
  setTrackingCode,
  onQuickTrack,
}: HomeHeroSectionProps) {
  return (
    <section className="relative overflow-hidden pt-10 sm:pt-16 pb-16 lg:pb-24">
      <div
        className={
          'absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 ' +
          'w-[700px] h-[400px] bg-gradient-to-tr from-rose-200/40 via-pink-200/30 ' +
          'to-amber-100/30 blur-3xl pointer-events-none rounded-full'
        }
      />
      <div
        className={
          'absolute -top-10 -right-10 w-96 h-96 bg-rose-100/50 blur-3xl ' +
          'rounded-full pointer-events-none'
        }
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <div
            className={
              'inline-flex items-center gap-2 rounded-full border border-rose-200/80 ' +
              'bg-white/90 px-4 py-1.5 text-xs font-black text-rose-700 shadow-xs ' +
              'backdrop-blur-md'
            }
          >
            <Sparkles
              size={14}
              className="text-rose-500 animate-spin"
              style={{ animationDuration: '6s' }}
            />
            <span>Indonesia Jastip HQ & Live Shopping Specialist Sejak 2019</span>
          </div>

          <h1
            className={
              'mt-6 text-4xl font-black tracking-tight text-slate-900 ' +
              'sm:text-6xl sm:leading-[1.12]'
            }
          >
            Titip Belanja Event Favoritmu,{' '}
            <span
              className={
                'bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 ' +
                'bg-clip-text text-transparent'
              }
            >
              Tanpa Antre & Macet.
            </span>
          </h1>

          <p
            className={
              'mt-6 text-base sm:text-lg leading-relaxed text-slate-600 ' +
              'font-medium max-w-2xl mx-auto'
            }
          >
            Spesialis Live Shopping <strong>IMBEX</strong>, <strong>WILBEX</strong>,{' '}
            <strong>Big Bad Wolf Books</strong>, <strong>Mother & Baby Fair</strong>, dan
            Trip Luar Negeri. Garansi 100% original, fee transparan, dikirim aman ke
            seluruh Indonesia.
          </p>

          <div className="mt-8 mx-auto max-w-xl">
            <form
              onSubmit={onQuickTrack}
              className={
                'relative flex items-center rounded-2xl border-2 border-rose-200/90 ' +
                'bg-white p-2 shadow-xl shadow-rose-950/5 transition ' +
                'focus-within:border-rose-500 focus-within:ring-4 focus-within:ring-rose-500/10'
              }
            >
              <div
                className={
                  'flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 ' +
                  'text-rose-600 shrink-0 ml-1'
                }
              >
                <Search size={18} />
              </div>
              <input
                type="text"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                placeholder="Lacak Invoice / Order / No. Resi (cth: INV-2026-0001)..."
                className={
                  'flex-1 bg-transparent px-3 text-sm text-slate-900 ' +
                  'placeholder:text-slate-400 outline-none font-medium'
                }
              />
              <button
                type="submit"
                className={
                  'inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r ' +
                  'from-rose-600 to-pink-600 px-4 py-2.5 text-xs font-black text-white ' +
                  'shadow-md shadow-rose-600/25 transition hover:from-rose-700 ' +
                  'hover:to-pink-700 active:scale-95 cursor-pointer shrink-0'
                }
              >
                <span>Lacak</span>
                <ArrowRight size={14} />
              </button>
            </form>
            <div className="mt-2 flex items-center justify-center gap-2 text-[11px] text-slate-500">
              <span className="font-semibold">Coba sample resi:</span>
              <button
                type="button"
                onClick={() => setTrackingCode('INV-2026-0001')}
                className={
                  'font-bold text-rose-600 underline underline-offset-2 ' +
                  'hover:text-rose-700'
                }
              >
                INV-2026-0001
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setTrackingCode('004289104829')}
                className={
                  'font-bold text-rose-600 underline underline-offset-2 ' +
                  'hover:text-rose-700'
                }
              >
                004289104829 (SiCepat)
              </button>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <Link
              to="/events"
              className={
                'inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r ' +
                'from-rose-600 to-pink-600 px-6 py-3.5 text-sm font-black text-white ' +
                'shadow-lg shadow-rose-500/25 transition hover:shadow-xl ' +
                'hover:-translate-y-0.5 active:scale-95'
              }
            >
              <Flame size={18} className="text-amber-300 fill-amber-300" />
              <span>Lihat Event Berjalan</span>
            </Link>

            <Link
              to="/ready-stock"
              className={
                'inline-flex items-center gap-2 rounded-2xl border border-slate-200 ' +
                'bg-white px-6 py-3.5 text-sm font-bold text-slate-700 shadow-sm ' +
                'transition hover:border-slate-300 hover:bg-slate-50 hover:-translate-y-0.5'
              }
            >
              <Boxes size={18} className="text-rose-500" />
              <span>Ready Stock Inventory</span>
            </Link>
          </div>
        </div>

        <div
          className={
            'mt-16 rounded-3xl border border-slate-200/80 bg-white/90 p-6 sm:p-8 ' +
            'shadow-xl shadow-slate-900/5 backdrop-blur-md'
          }
        >
          <div
            className={
              'grid grid-cols-2 gap-6 md:grid-cols-4 divide-y md:divide-y-0 ' +
              'md:divide-x divide-slate-100 text-center'
            }
          >
            <div className="p-2">
              <p className="text-3xl sm:text-4xl font-black text-slate-900">3,200+</p>
              <p
                className={
                  'mt-1 text-xs font-bold text-slate-500 flex items-center ' +
                  'justify-center gap-1'
                }
              >
                <Instagram size={13} className="text-pink-500" />
                Instagram Followers
              </p>
            </div>

            <div className="p-2">
              <p className="text-3xl sm:text-4xl font-black text-rose-600">150+</p>
              <p className="mt-1 text-xs font-bold text-slate-500">Event Sukses Sejak 2019</p>
            </div>

            <div className="p-2 pt-6 md:pt-2">
              <p className="text-3xl sm:text-4xl font-black text-emerald-600">100%</p>
              <p className="mt-1 text-xs font-bold text-slate-500">Original Official Booth</p>
            </div>

            <div className="p-2 pt-6 md:pt-2">
              <p className="text-3xl sm:text-4xl font-black text-amber-500">4.9 / 5.0</p>
              <p
                className={
                  'mt-1 text-xs font-bold text-slate-500 flex items-center ' +
                  'justify-center gap-1'
                }
              >
                <Star size={13} className="text-amber-400 fill-amber-400" />
                Kepuasan Customer
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
