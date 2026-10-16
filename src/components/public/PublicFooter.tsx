import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Instagram,
  MessageCircle,
  MapPin,
  Clock,
  ShieldCheck,
  Truck,
  Heart,
  ExternalLink,
} from 'lucide-react';

import { buildWhatsAppUrl } from '~/lib/whatsapp';
import { useBrand } from '~/context/BrandContext';

export function PublicFooter() {
  const { brandName, tagline, whatsapp, instagram, instagramUrl } = useBrand();
  const waUrl = buildWhatsAppUrl(
    `Halo Admin ${brandName}! Saya mau konsultasi seputar titip belanja.`,
    whatsapp
  );

  return (
    <footer className="border-t border-slate-200/80 bg-slate-900 text-slate-300">
      {/* Upper Footer / Social Proof */}
      <div className="border-b border-slate-800 bg-slate-950/60 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-4 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400">
                <ShieldCheck size={26} />
              </div>
              <div>
                <p className="text-sm font-extrabold text-white">100% Original</p>
                <p className="text-xs text-slate-400">Official booth & brand store</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <Truck size={26} />
              </div>
              <div>
                <p className="text-sm font-extrabold text-white">Central Hub</p>
                <p className="text-xs text-slate-400">Instant Courier & Ekspedisi</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-500/10 text-pink-400">
                <Instagram size={26} />
              </div>
              <div>
                <p className="text-sm font-extrabold text-white">3,200+ Followers</p>
                <p className="text-xs text-slate-400">Aktif & terpercaya sejak 2019</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                <Clock size={26} />
              </div>
              <div>
                <p className="text-sm font-extrabold text-white">Live Tracking</p>
                <p className="text-xs text-slate-400">Update status pesanan realtime</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Info */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white shadow-md shadow-rose-500/25">
                <ShoppingBag size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black tracking-tight text-white">
                    {brandName}
                  </span>
                  <span className="rounded-md bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-black text-rose-300 border border-rose-500/30">
                    HQ
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-400">
                  {tagline}
                </p>
              </div>
            </Link>

            <p className="mt-4 text-sm leading-relaxed text-slate-400 max-w-sm">
              Jasa titip pameran dan personal shopper berskala nasional.
              Spesialis Live Shopping <strong>IMBEX</strong>, <strong>WILBEX</strong>,{' '}
              <strong>BBW Books</strong>, <strong>Mother & Baby Fair</strong>, dan trip
              mancanegara dengan fee transparan dan proteksi paket maksimal.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-800/80 px-3.5 py-2 text-xs font-bold text-white transition hover:border-pink-500 hover:text-pink-300"
              >
                <Instagram size={15} className="text-pink-400" />
                <span>{instagram}</span>
              </a>

              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600/90 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-emerald-600"
              >
                <MessageCircle size={15} />
                <span>WhatsApp Admin</span>
              </a>
            </div>
          </div>

          {/* Navigasi Utama */}
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-white">
              Menu Layanan
            </p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition">
                  Beranda Utama
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-white transition flex items-center gap-1.5">
                  <span>Event Berjalan</span>
                  <span className="rounded-full bg-rose-500/30 px-1.5 py-0.2 text-[9px] font-black text-rose-300">
                    OPEN PO
                  </span>
                </Link>
              </li>
              <li>
                <Link to="/ready-stock" className="hover:text-white transition">
                  Ready Stock Inventory
                </Link>
              </li>
              <li>
                <Link to="/track" className="hover:text-white transition">
                  Lacak Status Pesanan
                </Link>
              </li>
            </ul>
          </div>

          {/* Spesialisasi Event */}
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-white">
              Spesialisasi Jastip
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
              <li className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                <span>IMBEX Maternity & Kids</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                <span>WILBEX Branded Expo</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                <span>Big Bad Wolf (BBW) Books</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                <span>Mother & Baby Fair</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                <span>Bangkok & Overseas Trips</span>
              </li>
            </ul>
          </div>

          {/* Kontak & HQ */}
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-white">
              Hub & Operasional
            </p>
            <div className="mt-4 space-y-3 text-xs text-slate-400">
              <div className="flex items-start gap-2.5">
                <MapPin size={16} className="text-rose-400 shrink-0 mt-0.5" />
                <span>
                  Central Hub (Pengiriman ke seluruh Indonesia siap kirim via kurir instant & Ekspedisi)
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock size={16} className="text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Admin Online: Setiap Hari
                  <br />08:00 – 22:00 WIB
                </span>
              </div>
              <div className="pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-300 transition"
                >
                  <span>Portal Staf Internal</span>
                  <ExternalLink size={12} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Partners & Logistik */}
        <div className="mt-12 border-t border-slate-800 pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-400">Metode Pengiriman & Pembayaran:</span>
              <span className="rounded bg-slate-800 px-2 py-1 text-slate-300 font-semibold">BCA</span>
              <span className="rounded bg-slate-800 px-2 py-1 text-slate-300 font-semibold">Mandiri</span>
              <span className="rounded bg-slate-800 px-2 py-1 text-slate-300 font-semibold">QRIS</span>
              <span className="rounded bg-slate-800 px-2 py-1 text-slate-300 font-semibold">GoSend</span>
              <span className="rounded bg-slate-800 px-2 py-1 text-slate-300 font-semibold">Grab</span>
              <span className="rounded bg-slate-800 px-2 py-1 text-slate-300 font-semibold">SiCepat</span>
              <span className="rounded bg-slate-800 px-2 py-1 text-slate-300 font-semibold">JNE</span>
              <span className="rounded bg-slate-800 px-2 py-1 text-slate-300 font-semibold">Paxel</span>
            </div>
            <p className="flex items-center gap-1 text-center sm:text-right">
              Crafted with <Heart size={13} className="text-rose-500 fill-rose-500 inline" /> for smart shoppers.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="border-t border-slate-800/80 bg-slate-950 px-4 py-4 text-center text-xs text-slate-500">
        <p>© 2019 – {new Date().getFullYear()} {brandName} ({instagram}). Hak Cipta Dilindungi.</p>
      </div>
    </footer>
  );
}
