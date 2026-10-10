import { Calculator } from 'lucide-react';
import { money } from '~/lib/format';

interface SummaryFeeCalculatorProps {
  amount: number;
  setAmount: (amt: number) => void;
  mode: 'AUTO' | 'MANUAL';
  setMode: (mode: 'AUTO' | 'MANUAL') => void;
  manualFee: number;
  setManualFee: (fee: number) => void;
  specialNote: string;
  setSpecialNote: (note: string) => void;
  calculation: {
    fee: number;
    rule?: any;
  };
}

export function SummaryFeeCalculator({
  amount,
  setAmount,
  mode,
  setMode,
  manualFee,
  setManualFee,
  specialNote,
  setSpecialNote,
  calculation,
}: SummaryFeeCalculatorProps) {
  return (
    <section className="card p-6">
      <div className="flex items-center gap-3">
        <div
          className={
            'rounded-2xl bg-gradient-to-br from-cherry-50 to-rose-100 ' +
            'p-3 text-cherry-600 ring-1 ring-cherry-200'
          }
        >
          <Calculator size={22} />
        </div>
        <div>
          <h2 className="section-title">Fee Calculator</h2>
          <p className="text-xs font-medium text-brand-400">
            Simulate shopper service fees before checkout.
          </p>
        </div>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label">Item Price in Rupiah (IDR)</label>
          <input
            className="input text-lg font-black text-brand-900"
            type="number"
            min="0"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value || 0))}
          />
        </div>
        <div>
          <label className="label">Fee Mode</label>
          <select
            className="input"
            value={mode}
            onChange={(e) => setMode(e.target.value as 'AUTO' | 'MANUAL')}
          >
            <option value="AUTO">Automated Tier Rule</option>
            <option value="MANUAL">Manual / Custom Promo</option>
          </select>
        </div>
        <div>
          <label className="label">Manual Fee (IDR)</label>
          <input
            className="input"
            type="number"
            min="0"
            value={manualFee}
            disabled={mode === 'AUTO'}
            onChange={(e) => setManualFee(Number(e.target.value || 0))}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Promo / Event Note</label>
          <input
            className="input"
            value={specialNote}
            onChange={(e) => setSpecialNote(e.target.value)}
            placeholder="e.g. Flash sale special, Tokyo airport pickup..."
          />
        </div>
      </div>
      <div className="mt-5 rounded-2xl border border-honey-200 bg-honey-50/80 p-5 shadow-xs">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-honey-800">
              Applied Service Fee
            </p>
            <p className="mt-1 text-3xl font-black tracking-[-.04em] text-brand-900">
              {money(calculation.fee)}
            </p>
          </div>
          <span
            className={
              'rounded-full bg-white px-3 py-1.5 text-xs font-black ' +
              'text-brand-800 shadow-sm border border-honey-200'
            }
          >
            {mode === 'AUTO'
              ? calculation.rule?.label || 'Tier Rule'
              : 'Manual Rule'}
          </span>
        </div>
        {specialNote && (
          <p className="mt-3 border-t border-honey-200 pt-3 text-xs font-bold text-brand-700">
            Note: {specialNote}
          </p>
        )}
      </div>
    </section>
  );
}
