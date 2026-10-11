import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { money } from '~/lib/format';
import { useCreateInvoice } from '../hooks/use-create-invoice';
import { CreateInvoiceOrdersStep } from './create-invoice-orders-step';
import { CreateInvoiceShippingStep } from './create-invoice-shipping-step';
import { CreateInvoiceDepositStep } from './create-invoice-deposit-step';
import { CreateInvoiceSchemeStep } from './create-invoice-scheme-step';
import { CreateInvoiceDpConfigStep } from './create-invoice-dp-config-step';

interface CreateInvoiceModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (id: number) => void;
  initialOrderId?: number | null;
}

export function CreateInvoiceModal({
  open,
  onClose,
  onCreated,
  initialOrderId,
}: CreateInvoiceModalProps) {
  const {
    searchParams,
    customers,
    orders,
    customerId,
    setCustomerId,
    selected,
    setSelected,
    selectedRows,
    setSelectedOrders,
    orderShippingMap,
    setOrderShipping,
    orderSearch,
    setOrderSearch,
    dueDate,
    setDueDate,
    notes,
    setNotes,
    billingModel,
    setBillingModel,
    dpPercent,
    setDpPercent,
    dpAmount,
    setDpAmount,
    dpSettlementNote,
    setDpSettlementNote,
    isManualDp,
    setIsManualDp,
    loading,
    saving,
    error,
    availableDeposit,
    useDeposit,
    depositAmount,
    setDepositAmount,
    depositLoading,
    total,
    totalShipping,
    totalServiceFee,
    calculatedDpFromPercent,
    loadCustomerOptions,
    handleToggleDeposit,
    toggleOrder,
    submit,
  } = useCreateInvoice({ open, onCreated, initialOrderId });

  if (!open) return null;

  const disableCustomerSelect =
    Boolean(initialOrderId) || Boolean(searchParams.get('orderId'));
  const finalTotal =
    useDeposit && depositAmount > 0
      ? money(Math.max(0, total - depositAmount))
      : money(total);

  return createPortal(
    <div
      className={
        'fixed inset-0 z-[100] flex items-end justify-center ' +
        'bg-brand-950/40 backdrop-blur-sm sm:items-center sm:p-4'
      }
    >
      <div
        className={
          'max-h-[94vh] w-full max-w-4xl overflow-hidden rounded-t-3xl ' +
          'bg-white shadow-2xl sm:rounded-3xl border border-brand-100'
        }
      >
        <div
          className={
            'flex items-center justify-between border-b border-brand-100 ' +
            'px-6 py-4 bg-brand-50/40'
          }
        >
          <div>
            <h2 className="text-lg font-black text-brand-900">
              Create Consolidated Invoice
            </h2>
            <p className="text-xs text-brand-500">
              Select multiple orders for the same customer, configure shipping, then choose payment scheme.
            </p>
          </div>
          <button
            onClick={onClose}
            className={
              'rounded-xl p-2 text-brand-400 hover:bg-brand-100 ' +
              'hover:text-brand-700 transition'
            }
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={submit}
          className="scrollbar-thin max-h-[calc(94vh-80px)] overflow-y-auto p-6"
        >
          {error && (
            <div
              className={
                'mb-4 rounded-xl bg-cherry-50 border border-cherry-200 ' +
                'p-3 text-sm font-bold text-cherry-700'
              }
            >
              {error}
            </div>
          )}

          {/* Step 1: Customer & Orders Selection */}
          <CreateInvoiceOrdersStep
            customers={customers}
            customerId={customerId}
            setCustomerId={setCustomerId}
            loadCustomerOptions={loadCustomerOptions}
            disableCustomerSelect={disableCustomerSelect}
            dueDate={dueDate}
            setDueDate={setDueDate}
            orderSearch={orderSearch}
            setOrderSearch={setOrderSearch}
            orders={orders}
            selected={selected}
            toggleOrder={toggleOrder}
            loading={loading}
            onCustomerReset={() => {
              setSelected([]);
              setSelectedOrders({});
              setOrderSearch('');
            }}
          />

          {/* Step 2: Estimated Shipping Cost (input before DP / Full scheme) */}
          <CreateInvoiceShippingStep
            selectedOrders={selectedRows}
            orderShippingMap={orderShippingMap}
            setOrderShipping={setOrderShipping}
            totalShipping={totalShipping}
            totalBill={total}
          />

          {/* Step 3: Customer Deposit Balance (Optional) */}
          {customerId && (
            <CreateInvoiceDepositStep
              availableDeposit={availableDeposit}
              depositLoading={depositLoading}
              useDeposit={useDeposit}
              onToggleDeposit={handleToggleDeposit}
              depositAmount={depositAmount}
              setDepositAmount={setDepositAmount}
              total={total}
            />
          )}

          {/* Step 4: Payment Scheme Selection (DP vs Full Payment) */}
          <CreateInvoiceSchemeStep
            billingModel={billingModel}
            setBillingModel={setBillingModel}
          />

          {/* Step 5: Down Payment / Full Payment Configuration */}
          <CreateInvoiceDpConfigStep
            billingModel={billingModel}
            total={total}
            totalShipping={totalShipping}
            totalServiceFee={totalServiceFee}
            dpPercent={dpPercent}
            setDpPercent={setDpPercent}
            dpAmount={dpAmount}
            setDpAmount={setDpAmount}
            isManualDp={isManualDp}
            setIsManualDp={setIsManualDp}
            calculatedDpFromPercent={calculatedDpFromPercent}
            dpSettlementNote={dpSettlementNote}
            setDpSettlementNote={setDpSettlementNote}
          />

          {/* Step 6: Invoice Notes */}
          <div className="mt-4">
            <label className="label">Step 6: Invoice Notes (Catatan Invoice - optional)</label>
            <textarea
              className="input min-h-20"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Payment instructions, bank accounts, delivery notes..."
            />
          </div>

          <div
            className={
              'mt-6 flex flex-col gap-3 border-t border-brand-100 pt-5 ' +
              'sm:flex-row sm:items-center sm:justify-between'
            }
          >
            <div>
              <p className="text-xs font-bold text-brand-400">
                {selected.length} orders selected
                {totalShipping > 0 && ` • Shipping: ${money(totalShipping)}`}
              </p>
              <div className="flex items-baseline gap-2">
                <p className="text-xl font-black text-brand-900">{finalTotal}</p>
                {useDeposit && depositAmount > 0 && (
                  <span
                    className={
                      'rounded-md bg-purple-100 px-1.5 py-0.5 text-xs ' +
                      'font-extrabold text-purple-700'
                    }
                  >
                    Deposit: -{money(depositAmount)}
                  </span>
                )}
                {billingModel === 'DP' && (
                  <span className="text-xs font-extrabold text-cherry-600">
                    (DP: {money(dpAmount)})
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                disabled={saving || !selected.length || !dueDate}
                className="btn-primary"
              >
                {saving
                  ? 'Issuing...'
                  : billingModel === 'DP'
                    ? 'Issue DP Invoice'
                    : 'Issue Full Invoice'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
