import { ArrowUpRight, FileText, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '~/context/AuthContext';

export function DashboardHero() {
  const { user, hasPermission } = useAuth();
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 px-6 py-8 text-white shadow-xl shadow-slate-900/10 sm:px-8 lg:px-10 lg:py-10 border border-slate-800">
      <div className="absolute -right-20 -top-24 h-80 w-80 rounded-full bg-rose-500/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-[25%] h-56 w-56 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm backdrop-blur-md">
            <Sparkles size={14} className="text-amber-400" /> WORTHTOBUY Operations Control
          </span>
          <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl text-white">
            Welcome back, {user?.name?.split(' ')[0] || 'Owner'}.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base font-normal">
            Monitor your personal shopper workflow: events, orders, deposits, service fees, and parcel deliveries in real-time.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {hasPermission('orders', 'create') && (
              <button
                onClick={() => navigate('/orders')}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-500 hover:bg-rose-600 px-5 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-rose-500/30 hover:-translate-y-0.5 transition"
              >
                + New Order <ArrowUpRight size={16} />
              </button>
            )}
            {hasPermission('invoices', 'create') && (
              <button
                onClick={() => navigate('/invoices')}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/20 hover:-translate-y-0.5 transition backdrop-blur-sm"
              >
                <FileText size={16} /> Create Invoice
              </button>
            )}
          </div>
        </div>
        <div className="relative mx-auto w-36 shrink-0 lg:mx-0 lg:w-44">
          <div className="absolute inset-4 rounded-full bg-rose-500/25 blur-2xl" />
          <img
            src="/worthtobuy-mark.png"
            alt="WORTHTOBUY"
            className="relative w-full animate-floaty object-contain drop-shadow-2xl"
          />
        </div>
      </div>
    </section>
  );
}
