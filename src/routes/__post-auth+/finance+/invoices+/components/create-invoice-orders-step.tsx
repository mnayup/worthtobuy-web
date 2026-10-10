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
}: CreateInvoiceOrdersStepProps) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Customer *</label>
          <SearchableSelect
            value={customerId}
            options={customers.map((c) => ({
              value: c.id,
              label: `${c.customerCode} • ${c.fullName} • ${c.whatsapp}`,
            }))}
            loadOptions={loadCustomerOptions}
            onChange={(value) => {
              setCustomerId(String(value));
              onCustomerReset();
            }}
            placeholder="Type name, ID, or WhatsApp number..."
            disabled={disableCustomerSelect}
          />
        </div>
        <div>
          <label className="label">Due Date *</label>
          <input
            type="date"
            className="input"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
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
                        {order.orderNumber}
                      </p>
                      <span className="pill text-[11px] !py-0.5">
                        {order.period?.code}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-brand-500 font-medium">
                      {date(order.orderDate)} •{' '}
                      {(order.items || [])
                        .map(
                          (item: any) =>
                            item.product?.name || item.manualProductName
                        )
                        .filter(Boolean)
                        .join(', ') || 'Manual order item'}
                    </p>
                  </div>
                  <p className="shrink-0 font-black text-brand-900">
                    {money(order.totalBill)}
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
    </>
  );
}
