interface CreateInvoiceSchemeStepProps {
  billingModel: 'DP' | 'FULL_PAYMENT';
  setBillingModel: (model: 'DP' | 'FULL_PAYMENT') => void;
}

export function CreateInvoiceSchemeStep({
  billingModel,
  setBillingModel,
}: CreateInvoiceSchemeStepProps) {
  const isDp = billingModel === 'DP';
  const isFull = billingModel === 'FULL_PAYMENT';

  return (
    <div className="mb-5 rounded-2xl border border-brand-200 bg-brand-50/60 p-4">
      <div className="mb-2.5 flex items-center justify-between">
        <span className="text-xs font-black uppercase tracking-wider text-brand-700">
          1. Pilih Skema Pembayaran Invoice
        </span>
        <span className="text-[11px] font-semibold text-brand-500">
          Tentukan apakah ingin menagih DP dulu atau langsung lunas
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div
          onClick={() => setBillingModel('DP')}
          className={
            'cursor-pointer rounded-2xl border-2 p-3.5 transition-all duration-150 ' +
            (isDp
              ? 'border-cherry-600 bg-white shadow-md ring-2 ring-cherry-600/10'
              : 'border-brand-200 bg-white/70 hover:bg-white hover:border-brand-300')
          }
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-brand-900 text-sm">
                  Tagih DP Dulu
                </span>
                <span
                  className={
                    'rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] ' +
                    'font-black text-amber-800'
                  }
                >
                  Pre-Order / DP
                </span>
              </div>
              <p className="mt-1 text-xs text-brand-500 leading-relaxed">
                Tagih uang muka (DP) dulu; sisa tagihan dilunasi belakangan saat pesanan siap kirim.
              </p>
            </div>
            <div
              className={
                'mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ' +
                'border-2 transition ' +
                (isDp ? 'border-cherry-600 bg-cherry-600' : 'border-brand-300')
              }
            >
              {isDp && <div className="h-2 w-2 rounded-full bg-white" />}
            </div>
          </div>
        </div>

        <div
          onClick={() => setBillingModel('FULL_PAYMENT')}
          className={
            'cursor-pointer rounded-2xl border-2 p-3.5 transition-all duration-150 ' +
            (isFull
              ? 'border-cherry-600 bg-white shadow-md ring-2 ring-cherry-600/10'
              : 'border-brand-200 bg-white/70 hover:bg-white hover:border-brand-300')
          }
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-brand-900 text-sm">
                  Langsung Bayar Lunas
                </span>
                <span
                  className={
                    'rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] ' +
                    'font-black text-emerald-800'
                  }
                >
                  100% di Muka
                </span>
              </div>
              <p className="mt-1 text-xs text-brand-500 leading-relaxed">
                Tagih total pesanan penuh di awal (tanpa skema uang muka/termin).
              </p>
            </div>
            <div
              className={
                'mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ' +
                'border-2 transition ' +
                (isFull ? 'border-cherry-600 bg-cherry-600' : 'border-brand-300')
              }
            >
              {isFull && <div className="h-2 w-2 rounded-full bg-white" />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
