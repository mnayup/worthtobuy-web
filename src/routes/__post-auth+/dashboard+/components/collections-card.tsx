import { useNavigate } from 'react-router-dom';
import { money, number } from '~/lib/format';

interface CollectionsCardProps {
  cashIn?: number;
  omzet?: number;
  paymentProgress: number;
  readyToShip?: number;
  completed?: number;
}

export function CollectionsCard({
  cashIn,
  omzet,
  paymentProgress,
  readyToShip,
  completed,
}: CollectionsCardProps) {
  const navigate = useNavigate();

  return (
    <section className="card p-5 sm:p-6 flex flex-col justify-between">
      <div>
        <h2 className="section-title">Collections & Cash Flow</h2>
        <p className="mt-1 text-sm font-medium text-slate-400">
          Ratio of verified cash receipts to total invoiced.
        </p>
      </div>
      <div className="mt-6 rounded-2xl bg-slate-900 p-5 text-white shadow-sm border border-slate-800">
        <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Verified Cash Received
        </p>
        <p className="mt-2 text-2xl font-black">{money(cashIn)}</p>
        <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
            style={{ width: `${paymentProgress}%` }}
          />
        </div>
        <div className="mt-2.5 flex justify-between text-xs font-bold text-slate-300">
          <span>{paymentProgress.toFixed(0)}% collected</span>
          <span>Total: {money(omzet)}</span>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate('/orders?status=READY_TO_SHIP')}
          className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:-translate-y-0.5 hover:bg-slate-100 hover:border-slate-300"
        >
          <p className="text-xs font-bold text-slate-400">Ready to Ship</p>
          <p className="mt-1 text-xl font-black text-slate-900">
            {number(readyToShip)}
          </p>
        </button>
        <button
          onClick={() => navigate('/orders?status=COMPLETED')}
          className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:-translate-y-0.5 hover:bg-slate-100 hover:border-slate-300"
        >
          <p className="text-xs font-bold text-slate-400">Completed</p>
          <p className="mt-1 text-xl font-black text-slate-900">
            {number(completed)}
          </p>
        </button>
      </div>
    </section>
  );
}
