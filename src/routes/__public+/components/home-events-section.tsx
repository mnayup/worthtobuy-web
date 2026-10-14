import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight, MessageCircle, Sparkles } from 'lucide-react';
import { date } from '~/lib/format';
import { buildWhatsAppUrl } from '~/lib/whatsapp';

interface HomeEventsSectionProps {
  events: any[];
}

export function HomeEventsSection({ events }: HomeEventsSectionProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div
        className={
          'flex flex-col sm:flex-row sm:items-end justify-between gap-4 ' +
          'border-b border-slate-200/80 pb-6'
        }
      >
        <div>
          <div
            className={
              'flex items-center gap-2 text-rose-600 font-extrabold ' +
              'text-xs uppercase tracking-wider'
            }
          >
            <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-ping" />
            <span>Jadwal Live Shopping Terkini</span>
          </div>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
            Event & Pameran Sedang Berjalan
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Buka titipan belanja langsung dari venue pameran terfavorit. Kuota terbatas!
          </p>
        </div>

        <Link
          to="/events"
          className={
            'inline-flex items-center gap-1.5 text-sm font-extrabold ' +
            'text-rose-600 hover:text-rose-700 transition'
          }
        >
          <span>Lihat Semua Event</span>
          <ChevronRight size={16} />
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map((evt) => {
          const isOverseas = evt.type === 'OVERSEAS';
          const waEventUrl = buildWhatsAppUrl(
            `Halo Admin Worthtobuy, saya mau titip belanja untuk event ` +
              `*${evt.name}* (${evt.city})!`
          );

          const badgeClass = isOverseas
            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
            : 'bg-rose-50 text-rose-700 border border-rose-200';

          return (
            <div
              key={evt.id}
              className={
                'group relative flex flex-col justify-between rounded-3xl ' +
                'border border-slate-200 bg-white p-6 shadow-sm transition-all ' +
                'duration-200 hover:-translate-y-1 hover:border-rose-200 ' +
                'hover:shadow-xl hover:shadow-rose-950/5'
              }
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={
                      'inline-flex items-center gap-1.5 rounded-full px-3 py-1 ' +
                      `text-[11px] font-black uppercase tracking-wider ${badgeClass}`
                    }
                  >
                    <Sparkles size={11} />
                    {evt.status === 'OPEN' ? 'OPEN PO' : 'LIVE SHOPPING'}
                  </span>

                  <span className="text-xs font-bold text-slate-400">
                    {evt.city || evt.country}
                  </span>
                </div>

                <h3
                  className={
                    'mt-4 text-xl font-black text-slate-900 group-hover:text-rose-600 ' +
                    'transition'
                  }
                >
                  {evt.name}
                </h3>

                <p className="mt-2 text-xs leading-relaxed text-slate-500 line-clamp-3">
                  {evt.notes ||
                    'Titip belanja produk official event dengan harga promo & garansi original.'}
                </p>

                <div
                  className={
                    'mt-6 space-y-2 rounded-2xl bg-slate-50 p-4 text-xs font-medium ' +
                    'text-slate-600 border border-slate-100'
                  }
                >
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Order Tutup:</span>
                    <span className="font-extrabold text-slate-800">
                      {date(evt.orderCloseAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Estimasi Kirim:</span>
                    <span className="font-extrabold text-rose-600">
                      {date(evt.estimatedShippingAt || evt.returnAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
                <a
                  href={waEventUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={
                    'flex-1 inline-flex items-center justify-center gap-2 rounded-xl ' +
                    'bg-gradient-to-r from-rose-600 to-pink-600 py-3 text-xs font-black ' +
                    'text-white shadow-xs transition hover:from-rose-700 ' +
                    'hover:to-pink-700 active:scale-95'
                  }
                >
                  <MessageCircle size={15} />
                  <span>Titip via WA</span>
                </a>

                <Link
                  to="/events"
                  className={
                    'inline-flex items-center justify-center rounded-xl border ' +
                    'border-slate-200 bg-white p-3 text-slate-600 ' +
                    'hover:border-slate-300 hover:bg-slate-50 transition'
                  }
                  title="Detail Event"
                >
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
