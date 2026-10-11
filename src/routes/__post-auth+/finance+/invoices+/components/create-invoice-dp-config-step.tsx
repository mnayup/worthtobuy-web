import { money } from '~/lib/format';

interface CreateInvoiceDpConfigStepProps {
  billingModel: 'DP' | 'FULL_PAYMENT';
  total: number;
  totalShipping?: number;
  totalServiceFee?: number;
  dpPercent: number;
  setDpPercent: (pct: number) => void;
  dpAmount: number;
  setDpAmount: (amt: number) => void;
  isManualDp: boolean;
  setIsManualDp: (manual: boolean) => void;
  calculatedDpFromPercent: number;
  dpSettlementNote: string;
  setDpSettlementNote: (note: string) => void;
}

export function CreateInvoiceDpConfigStep({
  billingModel,
  total,
  totalShipping = 0,
  totalServiceFee = 0,
  dpPercent,
  setDpPercent,
  dpAmount,
  setDpAmount,
  isManualDp,
  setIsManualDp,
  calculatedDpFromPercent,
  dpSettlementNote,
  setDpSettlementNote,
}: CreateInvoiceDpConfigStepProps) {
  if (billingModel !== 'DP') {
    const productSubtotal = Math.max(0, total - totalShipping - totalServiceFee);
    return (
      <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 text-xs">
        <div className="flex items-center gap-2 font-black text-emerald-900 text-sm">
          <span>✓ Step 5: Direct Full Payment Summary (100% Upfront)</span>
        </div>
        <p className="mt-1 text-emerald-800">
          This invoice will bill the entire order total upfront without a down payment scheme.
        </p>

        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 rounded-xl bg-white p-3 border border-emerald-200 text-xs">
          <div>
            <span className="text-brand-500 text-[11px]">Product Subtotal:</span>
            <p className="font-extrabold text-brand-900">{money(productSubtotal)}</p>
          </div>
          <div>
            <span className="text-brand-500 text-[11px]">Service Fee (Jastip):</span>
            <p className="font-extrabold text-cherry-700">{money(totalServiceFee)}</p>
          </div>
          <div>
            <span className="text-brand-500 text-[11px]">Shipping Cost (Ongkir):</span>
            <p className="font-extrabold text-sky-800">{money(totalShipping)}</p>
          </div>
          <div>
            <span className="text-brand-500 text-[11px]">Total Bill (100%):</span>
            <p className="font-black text-emerald-950 text-sm">{money(total)}</p>
          </div>
        </div>
      </div>
    );
  }

  const productSubtotal = Math.max(0, total - totalShipping - totalServiceFee);

  return (
    <div className="mb-5 rounded-2xl border border-brand-200 bg-brand-50/50 p-4">
      <div className="mb-3">
        <p className="font-extrabold text-brand-900">
          Step 5: Down Payment (DP) Calculation
        </p>
        <p className="text-xs text-brand-500">
          Determine the percentage or down payment amount the customer must pay upfront.
        </p>
      </div>

      <div className="space-y-3.5 border-t border-brand-200/80 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-brand-700">Preset DP Percent:</span>
            {[30, 50, 75].map((pct) => (
              <button
                type="button"
                key={pct}
                onClick={() => {
                  setDpPercent(pct);
                  setDpAmount(Math.round((total * pct) / 100));
                  setIsManualDp(false);
                }}
                className={`rounded-lg px-2.5 py-1 text-xs font-extrabold transition ${
                  dpPercent === pct && !isManualDp
                    ? 'bg-cherry-600 text-white shadow-sm'
                    : 'bg-white border border-brand-200 text-brand-700 hover:bg-brand-100'
                }`}
              >
                {pct}%
              </button>
            ))}
          </div>
          {isManualDp && (
            <button
              type="button"
              onClick={() => {
                setDpAmount(Math.round((total * dpPercent) / 100));
                setIsManualDp(false);
              }}
              className="text-xs font-extrabold text-cherry-600 hover:underline"
            >
              Reset to {dpPercent}%
            </button>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">DP Percent (%)</label>
            <input
              type="number"
              min={1}
              max={100}
              className="input font-bold"
              value={dpPercent || ''}
              onChange={(e) => {
                const val = Number(e.target.value);
                setDpPercent(val);
                setDpAmount(Math.round((total * val) / 100));
                setIsManualDp(false);
              }}
              placeholder="50"
            />
          </div>
          <div>
            <label className="label">DP Amount (Rp) *</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-black text-brand-600">
                Rp.
              </span>
              <input
                type="text"
                className="input !pl-11 font-black text-brand-900"
                value={dpAmount ? Number(dpAmount).toLocaleString('id-ID') : ''}
                onChange={(e) => {
                  const raw = Number(e.target.value.replace(/\D/g, ''));
                  setDpAmount(raw);
                  setIsManualDp(true);
                }}
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Breakdown Box */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 rounded-xl bg-white p-3 border border-brand-200 text-xs">
          <div>
            <span className="text-brand-500 text-[11px]">Product Subtotal:</span>
            <p className="font-extrabold text-brand-900">{money(productSubtotal)}</p>
          </div>
          <div>
            <span className="text-brand-500 text-[11px]">Service Fee (Jastip):</span>
            <p className="font-extrabold text-cherry-700">{money(totalServiceFee)}</p>
          </div>
          <div>
            <span className="text-brand-500 text-[11px]">Shipping Cost (Ongkir):</span>
            <p className="font-extrabold text-sky-800">{money(totalShipping)}</p>
          </div>
          <div>
            <span className="text-brand-500 text-[11px]">Total Order Value:</span>
            <p className="font-black text-brand-950 text-sm">{money(total)}</p>
          </div>
        </div>

        {isManualDp && dpAmount !== calculatedDpFromPercent && (
          <div
            className={
              'flex flex-wrap items-center justify-between gap-2 rounded-xl ' +
              'bg-amber-50 border border-amber-200 px-3.5 py-2 text-xs text-amber-900'
            }
          >
            <span>
              {dpPercent}% of current total = <strong>{money(calculatedDpFromPercent)}</strong>,
              different from entered amount ({money(dpAmount)}).
            </span>
            <button
              type="button"
              onClick={() => {
                setDpAmount(calculatedDpFromPercent);
                setIsManualDp(false);
              }}
              className={
                'rounded-lg bg-amber-200 px-2.5 py-1 text-xs font-bold ' +
                'text-amber-950 hover:bg-amber-300 transition'
              }
            >
              Recalculate
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 rounded-xl bg-white p-3 border border-brand-200/80 text-xs">
          <div>
            <span className="text-brand-500">Down Payment Bill (Tagihan DP):</span>
            <p className="text-sm font-black text-cherry-600">{money(dpAmount)}</p>
          </div>
          <div>
            <span className="text-brand-500">Balance at Settlement (Sisa Pelunasan):</span>
            <p className="text-sm font-black text-brand-900">
              {money(Math.max(0, total - dpAmount))}
            </p>
          </div>
        </div>

        <div>
          <label className="label">Settlement Note (Catatan Pelunasan - optional)</label>
          <input
            type="text"
            className="input"
            value={dpSettlementNote}
            onChange={(e) => setDpSettlementNote(e.target.value)}
            placeholder="when products are ready to ship"
          />
          <p className="mt-1 text-[11px] text-brand-400">
            Text displayed on customer invoices and WhatsApp messages, e.g.,
            "when products arrive in Indonesia" or "when orders are ready to ship".
          </p>
        </div>
      </div>
    </div>
  );
}
