import { MessageCircle, Sparkles } from 'lucide-react';

export function EventsCustomRequest() {
  const waCustomUrl =
    'https://wa.me/6281234567890?text=' +
    encodeURIComponent('Halo Admin Worthtobuy! Saya mau request titipan di event khusus.');

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div
        className={
          'rounded-3xl border border-rose-100 bg-gradient-to-r ' +
          'from-rose-50 via-white to-pink-50 p-8 sm:p-10 flex flex-col ' +
          'md:flex-row items-center justify-between gap-6'
        }
      >
        <div className="flex items-center gap-4">
          <div
            className={
              'flex h-14 w-14 items-center justify-center rounded-2xl ' +
              'bg-rose-500 text-white shadow-md shadow-rose-500/25 shrink-0'
            }
          >
            <Sparkles size={28} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900">
              Punya Titipan di Event Lain?
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-xl">
              Bila pameran atau brand yang Anda cari belum tercantum di jadwal kami,
              Anda bisa request personal shopping khusus ke admin kami!
            </p>
          </div>
        </div>

        <a
          href={waCustomUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={
            'inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-6 ' +
            'py-3.5 text-xs font-black text-white transition hover:bg-slate-800 ' +
            'active:scale-95 shrink-0'
          }
        >
          <MessageCircle size={16} />
          <span>Request Event via WhatsApp</span>
        </a>
      </div>
    </div>
  );
}
