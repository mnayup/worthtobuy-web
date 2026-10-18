import { CheckSquare, Search, Square, X } from 'lucide-react';
import { date, money } from '~/lib/format';
import { SearchableSelect } from '~/components/SearchableSelect';

interface CreateInvoiceOrdersStepProps {
  customers: any[];
  customerId: string;
  setCustomerId: (id: string) => void;
  loadCustomerOptions: (query: string) => Promise<any[]>;
  disableCustomerSelect: boolean;
  dueDate: string;
  setDueDate: (date: string) => void;
  orderSearch: string;
  setOrderSearch: (search: string) => void;
  orders: any[];
  selected: number[];
  toggleOrder: (order: any) => void;
  loading: boolean;
  onCustomerReset: () => void;
  unpackedInvoices?: any[];
  targetInvoiceMode?: 'NEW' | 'EXISTING';
  setTargetInvoiceMode?: (mode: 'NEW' | 'EXISTING') => void;
  targetInvoiceId?: string;
  setTargetInvoiceId?: (id: string) => void;
}

export function CreateInvoiceOrdersStep({
  customers,
  customerId,
  setCustomerId,
  loadCustomerOptions,
  disableCustomerSelect,
  dueDate,
  setDueDate,
  orderSearch,
  setOrderSearch,
  orders,
  selected,
  toggleOrder,
  loading,
  onCustomerReset,
  unpackedInvoices = [],
  targetInvoiceMode = 'NEW',
  setTargetInvoiceMode,
  targetInvoiceId = '',
  setTargetInvoiceId,
}: CreateInvoiceOrdersStepProps) {
  const hasUnpackedInvoices = Boolean(customerId && unpackedInvoices.length > 0);

  return (
    <div className="mb-5">
      <div className="mb-3">
        <span className="text-xs font-black uppercase tracking-wider text-brand-700">
          Step 1: Customer & Orders Selection
        </span>
        <p className="text-[11px] font-semibold text-brand-500">
          Select customer, invoice target option, and orders to combine into this invoice
        </p>
      </div>

      {hasUnpackedInvoices && (
        <div className="mb-4 rounded-2xl border border-honey-300 bg-honey-50/70 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-xs font-black text-honey-950">
                Invoice Option for Returning Customer
              </p>
              <p className="text-[11px] text-honey-800 font-medium">
                Customer has unpacked order(s) without keep items. You can combine this order into an existing invoice or create a brand new one.
              </p>
            </div>
            <div className="inline-flex rounded-xl bg-white p-1 border border-honey-300 shadow-sm shrink-0">
              <button
                type="button"
                onClick={() => setTargetInvoiceMode?.('NEW')}
                className={`rounded-lg px-3 py-1.5 text-xs font-black transition ${
                  targetInvoiceMode === 'NEW'
                    ? 'bg-brand-900 text-white shadow-sm'
                    : 'text-brand-600 hover:text-brand-900'
                }`}
              >
                Create New Invoice
              </button>
              <button
                type="button"
                onClick={() => setTargetInvoiceMode?.('EXISTING')}
                className={`rounded-lg px-3 py-1.5 text-xs font-black transition ${
                  targetInvoiceMode === 'EXISTING'
                    ? 'bg-honey-500 text-brand-950 shadow-sm'
                    : 'text-brand-600 hover:text-brand-900'
                }`}
              >
                Add to Existing Invoice
              </button>
            </div>
          </div>

          {targetInvoiceMode === 'EXISTING' && (
            <div className="mt-3 pt-3 border-t border-honey-200">
              <label className="label text-honey-900 font-bold">
                Select Existing Unpacked Invoice *
              </label>
              <select
                className="input bg-white text-xs font-bold"
                value={targetInvoiceId}
                onChange={(e) => setTargetInvoiceId?.(e.target.value)}
              >
                {unpackedInvoices.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoice_number} • {inv.order_count} order(s) ({inv.order_numbers}) • Total {money(inv.total_bill)} • Status: {inv.status}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Customer *</label>
          <SearchableSelect
            value={customerId}
            options={customers.map((c) => {
              const code = c.customer_code || c.customerCode || '';
              const name = c.full_name || c.fullName || '';
              const wa = c.whatsapp || c.phone || '';
              const labelParts = [code, name, wa].filter(Boolean).join(' • ');
              return {
                value: c.id,
                label: labelParts || `Customer #${c.id}`,
              };
            })}
            loadOptions={loadCustomerOptions}
            onChange={(value) => {
              setCustomerId(String(value));
              onCustomerReset();
            }}
            placeholder="Type name, ID, or WhatsApp number..."
            disabled={disableCustomerSelect}
          />
        </div>
        {targetInvoiceMode === 'NEW' && (
          <div>
            <label className="label">Due Date *</label>
            <input
              type="date"
              className="input"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        )}
      </div>

      <div className="mt-5">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="font-extrabold text-brand-900">Available Orders</p>
            <p className="text-xs text-brand-400">
              Orders already assigned to active invoices are omitted.
            </p>
          </div>
        </div>

        {customerId && (
          <div className="relative mb-3">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-400"
              size={16}
            />
            <input
              className="input !pl-10 !pr-10"
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
              placeholder="Search order number, event, or product name..."
            />
            {orderSearch && (
              <button
                type="button"
                aria-label="Clear order search"
                onClick={() => setOrderSearch('')}
                className={
                  'absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 ' +
                  'text-brand-400 hover:text-brand-700'
                }
              >
                <X size={15} />
              </button>
            )}
          </div>
        )}

        <div
          className={
            'scrollbar-thin max-h-80 overflow-y-auto rounded-2xl ' +
            'border border-brand-200'
          }
        >
          {loading ? (
            <p className="p-8 text-center text-sm text-brand-400">
              Loading orders...
            </p>
          ) : !customerId ? (
            <p className="p-8 text-center text-sm text-brand-400">
              Select a customer above to view available orders.
            </p>
          ) : orders.length ? (
            orders.map((order) => {
              const checked = selected.includes(order.id);
              return (
                <button
                  type="button"
                  key={order.id}
                  onClick={() => toggleOrder(order)}
                  className={
                    'flex w-full items-start gap-3 border-b border-brand-100 p-4 ' +
                    'text-left transition last:border-0 ' +
                    (checked ? 'bg-cherry-50/60' : 'hover:bg-brand-50')
                  }
                >
                  {checked ? (
                    <CheckSquare
                      className="mt-0.5 shrink-0 text-cherry-600"
                      size={19}
                    />
                  ) : (
                    <Square
                      className="mt-0.5 shrink-0 text-brand-300"
                      size={19}
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-extrabold text-brand-900">
                        {order.order_number || order.orderNumber}
                      </p>
                      <span className="pill text-[11px] !py-0.5">
                        {order.period?.code}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-brand-500 font-medium">
                      {date(order.order_date || order.orderDate)} •{' '}
                      {(order.items || [])
                        .map(
                          (item: any) =>
                            item.product?.name ||
                            item.manual_product_name ||
                            item.manualProductName
                        )
                        .filter(Boolean)
                        .join(', ') || 'Manual order item'}
                    </p>
                  </div>
                  <p className="shrink-0 font-black text-brand-900">
                    {money(order.total_bill ?? order.totalBill ?? 0)}
                  </p>
                </button>
              );
            })
          ) : (
            <p className="p-8 text-center text-sm text-brand-400">
              No orders available for invoice generation for this customer.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
