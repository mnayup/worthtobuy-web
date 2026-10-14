import { Link } from 'react-router-dom';
import { Calendar, Clock, Globe2, MapPin, MessageCircle, Truck } from 'lucide-react';
import { date } from '~/lib/format';
import { buildWhatsAppUrl } from '~/lib/whatsapp';

interface EventCardProps {
  evt: any;
}

export function EventCard({ evt }: EventCardProps) {
  const isOverseas = evt.type === 'OVERSEAS' || evt.type === 'INTERNATIONAL';
  const isOpen = evt.status === 'OPEN';
  const isShopping = evt.is_shopping_live ?? evt.isShoppingLive;
  const orderCloseAt = evt.order_close_at ?? evt.orderCloseAt;
  const departureAt = evt.departure_at ?? evt.departureAt;
  const returnAt = evt.return_at ?? evt.returnAt;
  const estimatedShippingAt =
    evt.estimated_shipping_at ?? evt.estimatedShippingAt ?? returnAt;

  const waUrl = buildWhatsAppUrl(
    `Halo Admin Worthtobuy, saya mau titip belanja untuk event *${evt.name}* ` +
      `(Kode: ${evt.code}). Mohon info alur titipannya ya kak!`
  );

  const badgeClass = isShopping
    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
    : isOpen
    ? 'bg-rose-50 text-rose-700 border border-rose-200'
    : 'bg-slate-100 text-slate-600 border border-slate-200';

  const dotClass = isShopping ? 'bg-emerald-500 animate-ping' : 'bg-rose-500';

  const badgeText = isShopping
    ? 'SEDANG LIVE HUNTING'
    : isOpen
    ? 'OPEN PO SEKARANG'
    : evt.status;

  return (
    <div
      className={
        'group relative flex flex-col justify-between rounded-3xl border ' +
        'border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 ' +
        'hover:-translate-y-1 hover:border-rose-300 hover:shadow-xl ' +
        'hover:shadow-rose-950/5'
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
            <span className={`h-2 w-2 rounded-full ${dotClass}`} />
            {badgeText}
          </span>

          <span className="flex items-center gap-1 text-xs font-bold text-slate-500">
            {isOverseas ? (
              <Globe2 size={13} className="text-indigo-500" />
            ) : (
              <MapPin size={13} className="text-rose-500" />
            )}
            <span>{evt.city || evt.country}</span>
          </span>
        </div>

        <h2
          className={
            'mt-4 text-xl font-black text-slate-900 group-hover:text-rose-600 ' +
            'transition'
          }
        >
          {evt.name}
        </h2>

        <p className="mt-2.5 text-xs leading-relaxed text-slate-500 line-clamp-3">
          {evt.notes || 'Titipan belanja barang resmi pameran dengan estimasi harga transparan.'}
        </p>

        <div
          className={
            'mt-6 space-y-2.5 rounded-2xl bg-slate-50/80 p-4 text-xs ' +
            'border border-slate-100'
          }
        >
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium flex items-center gap-1.5">
              <Clock size={13} className="text-slate-400" />
              <span>Batas Tutup Order:</span>
            </span>
            <span className="font-extrabold text-slate-900">
              {date(orderCloseAt)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium flex items-center gap-1.5">
              <Calendar size={13} className="text-slate-400" />
              <span>Jadwal Belanja:</span>
            </span>
            <span className="font-bold text-slate-700">
              {date(departureAt)} – {date(returnAt)}
            </span>
          </div>

          <div className="flex items-center justify-between border-t border-slate-200/60 pt-2">
            <span className="text-slate-500 font-medium flex items-center gap-1.5">
              <Truck size={13} className="text-rose-500" />
              <span>Estimasi Kirim:</span>
            </span>
            <span className="font-black text-rose-600">
              {date(estimatedShippingAt)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={
            'flex-1 inline-flex items-center justify-center gap-2 rounded-xl ' +
            'bg-gradient-to-r from-rose-600 to-pink-600 py-3 text-xs font-black ' +
            'text-white shadow-xs transition hover:from-rose-700 hover:to-pink-700 ' +
            'active:scale-95'
          }
        >
          <MessageCircle size={15} />
          <span>Titip Belanja Sekarang</span>
        </a>

        <Link
          to="/track"
          className={
            'inline-flex items-center justify-center rounded-xl border ' +
            'border-slate-200 bg-white px-3 py-3 text-slate-600 ' +
            'hover:border-slate-300 hover:bg-slate-50 text-xs font-bold transition'
          }
          title="Lacak Pesanan"
        >
          <Truck size={16} />
        </Link>
      </div>
    </div>
  );
}
