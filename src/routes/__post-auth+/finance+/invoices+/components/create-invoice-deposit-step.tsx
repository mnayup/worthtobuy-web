import { Wallet } from 'lucide-react';
import { money } from '~/lib/format';

interface CreateInvoiceDepositStepProps {
  availableDeposit: number;
  depositLoading: boolean;
  useDeposit: boolean;
  onToggleDeposit: (checked: boolean) => void;
  depositAmount: number;
  setDepositAmount: (amount: number) => void;
  total: number;
}

export function CreateInvoiceDepositStep({
  availableDeposit,
  depositLoading,
  useDeposit,
  onToggleDeposit,
  depositAmount,
  setDepositAmount,
  total,
}: CreateInvoiceDepositStepProps) {
  const maxDeposit = Math.min(availableDeposit, total);

  return (
    <div className="mb-5 rounded-2xl border border-purple-200 bg-purple-50/50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div
            className={
              'grid h-8 w-8 place-items-center rounded-xl bg-purple-600 ' +
              'text-white shrink-0 mt-0.5'
            }
          >
            <Wallet size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-purple-900">
                Step 3: Customer Deposit Balance (Saldo Deposit - Optional)
              </span>
              {depositLoading ? (
                <span className="text-[11px] text-purple-500 animate-pulse">
                  Checking balance...
                </span>
              ) : (
                <span
                  className={
                    'rounded-md bg-purple-200/80 px-2 py-0.5 text-xs ' +
                    'font-black text-purple-900'
                  }
                >
                  {money(availableDeposit)}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-purple-700 leading-relaxed">
              {availableDeposit > 0
                ? 'Customer has available credit balance from previous refunds. ' +
                  'You can apply this to deduct from this invoice total (optional).'
                : 'This customer has no active deposit balance at this time.'}
            </p>
          </div>
        </div>
      </div>

      {availableDeposit > 0 && (
        <div className="mt-3.5 border-t border-purple-200/80 pt-3.5">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              className={
                'h-4 w-4 rounded border-purple-300 text-purple-600 ' +
                'focus:ring-purple-500 cursor-pointer'
              }
              checked={useDeposit}
              onChange={(e) => onToggleDeposit(e.target.checked)}
            />
            <span className="text-xs font-extrabold text-purple-950">
              Apply Customer Deposit to Deduct from This Invoice (Optional)
            </span>
          </label>

          {useDeposit && (
            <div
              className={
                'mt-3 rounded-xl bg-white p-3.5 border border-purple-200 ' +
                'shadow-sm space-y-3'
              }
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <label className="text-[11px] font-bold text-brand-600">
                    Deposit Amount Used (Rp)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={maxDeposit}
                    className="input mt-1 font-black text-purple-900"
                    value={depositAmount}
                    onChange={(e) =>
                      setDepositAmount(
                        Math.min(
                          Math.max(0, Number(e.target.value) || 0),
                          maxDeposit
                        )
                      )
                    }
                  />
                </div>
                <div className="shrink-0 self-end">
                  <button
                    type="button"
                    onClick={() => setDepositAmount(maxDeposit)}
                    className={
                      'btn-secondary !py-2 !px-3 text-xs font-bold ' +
                      'text-purple-700 border-purple-200 hover:bg-purple-50'
                    }
                  >
                    Use Maximum ({money(maxDeposit)})
                  </button>
                </div>
              </div>

              <div
                className={
                  'rounded-lg bg-purple-50/80 p-2.5 text-xs space-y-1 ' +
                  'border border-purple-100'
                }
              >
                <div className="flex justify-between text-brand-600">
                  <span>Selected Orders Total:</span>
                  <span className="font-bold">{money(total)}</span>
                </div>
                <div className="flex justify-between text-purple-800 font-bold">
                  <span>Deposit Deduction (Potongan Deposit):</span>
                  <span>- {money(depositAmount)}</span>
                </div>
                <div
                  className={
                    'flex justify-between text-brand-950 font-black ' +
                    'border-t border-purple-200 pt-1'
                  }
                >
                  <span>Net Bill to Pay (Tagihan Bersih):</span>
                  <span className="text-sm text-purple-950">
                    {money(Math.max(0, total - depositAmount))}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
