import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Sparkles,
  Search,
  Calendar,
  Boxes,
  Truck,
  Instagram,
  MessageCircle,
  Menu,
  X,
  LayoutDashboard,
  LogIn,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '~/context/AuthContext';
import { useBrand } from '~/context/BrandContext';
import { buildWhatsAppUrl } from '~/lib/whatsapp';

export function PublicNavbar() {
  const { user } = useAuth();
  const { brandName, tagline, whatsapp, instagram, instagramUrl } = useBrand();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { to: '/', label: 'Beranda', icon: Sparkles },
    {
      to: '/events',
      label: 'Event Berjalan',
      icon: Calendar,
      badge: 'LIVE',
      badgeColor: 'bg-rose-500 text-white animate-pulse',
    },
    {
      to: '/ready-stock',
      label: 'Ready Stock',
      icon: Boxes,
      badge: 'Ready',
      badgeColor: 'bg-amber-100 text-amber-800 border border-amber-200',
    },
    { to: '/track', label: 'Lacak Pesanan', icon: Truck },
  ];

  const waUrl = buildWhatsAppUrl(
    `Halo Admin ${brandName}! Saya mau tanya seputar titip belanja event & ready stock.`,
    whatsapp
  );

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-rose-600 via-brand-900 to-indigo-950 px-4 py-2 text-center text-xs font-bold text-white shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2">
          <div className="hidden sm:flex items-center gap-1.5 text-rose-200">
            <Sparkles size={14} className="text-amber-300" />
            <span>Indonesia Personal Shopper & Jastip Pameran Resmi sejak 2019</span>
          </div>

          <div className="mx-auto sm:mx-0 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/30 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider text-rose-100 backdrop-blur-xs">
              ⚡ LIVE HUNTING
            </span>
            <span className="text-white/90">
              IMBEX 2026 & BBW sedang buka titipan!
            </span>
            <Link
              to="/events"
              className="inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-300 hover:text-white underline underline-offset-2 ml-1"
            >
              Lihat Event <ArrowRight size={11} />
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-3 text-xs">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-rose-200 hover:text-white transition"
            >
              <Instagram size={13} />
              <span>{instagram}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Glassmorphism Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md transition-all">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-500 text-white shadow-md shadow-rose-500/25 transition-transform duration-200 group-hover:scale-105">
              <ShoppingBag size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-slate-900 group-hover:text-rose-600 transition">
                  {brandName}
                </span>
                <span className="rounded-md bg-rose-50 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-rose-600 border border-rose-200/60">
                  HQ
                </span>
              </div>
              <p className="text-[11px] font-bold text-slate-400">
                {tagline}
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `relative flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-bold transition-all duration-150 ${
                    isActive
                      ? 'bg-rose-50 text-rose-700 font-extrabold shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                {({ isActive }) => {
                  const Icon = item.icon;
                  return (
                    <>
                      <Icon
                        size={16}
                        className={isActive ? 'text-rose-600' : 'text-slate-400'}
                      />
                      <span>{item.label}</span>
                      {item.badge && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${item.badgeColor}`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  );
                }}
              </NavLink>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-2xs transition hover:border-pink-300 hover:text-pink-600"
              title={`Follow Instagram ${instagram}`}
            >
              <Instagram size={15} className="text-pink-500" />
              <span>Instagram</span>
            </a>

            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-extrabold text-white shadow-xs transition hover:bg-emerald-700 hover:shadow-md hover:-translate-y-0.5"
            >
              <MessageCircle size={15} />
              <span>Chat WhatsApp</span>
            </a>

            <div className="h-6 w-px bg-slate-200" />

            {user ? (
              <Link
                to="/dashboard"
                className="flex items-center gap-2 rounded-xl border border-rose-200 bg-gradient-to-r from-rose-50 to-pink-50 px-3.5 py-2 text-xs font-black text-rose-700 shadow-2xs transition hover:bg-rose-100"
              >
                <LayoutDashboard size={15} />
                <span>Dashboard Admin</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <LogIn size={14} />
                <span>Login Staff</span>
              </Link>
            )}
          </div>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-xs md:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="border-b border-slate-200 bg-white px-4 py-5 md:hidden animate-rise">
            <div className="flex flex-col space-y-1.5">
              {navLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition ${
                        isActive
                          ? 'bg-rose-50 text-rose-700 font-extrabold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${item.badgeColor}`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2.5">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-xs"
              >
                <MessageCircle size={18} />
                <span>Chat Admin WhatsApp</span>
              </a>

              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-pink-200 bg-pink-50/50 py-2.5 text-xs font-bold text-pink-700"
              >
                <Instagram size={16} />
                <span>Follow Instagram {instagram}</span>
              </a>

              {user ? (
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-xs font-black text-white"
                >
                  <LayoutDashboard size={16} />
                  <span>Buka Dashboard Staff</span>
                </Link>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2 text-xs font-bold text-slate-600"
                >
                  <LogIn size={15} />
                  <span>Portal Login Staff</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
