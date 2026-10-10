import { money } from '~/lib/format';

interface TopShoppersCardProps {
  topCustomers?: Array<{ name: string; orders: number; omzet: number }>;
}

export function TopShoppersCard({ topCustomers = [] }: TopShoppersCardProps) {
  return (
    <section className="card p-5 sm:p-6">
      <h2 className="section-title">Top Shoppers</h2>
      <p className="mb-4 mt-1 text-sm font-medium text-slate-400">
        Customers with highest spending.
      </p>
      <div className="space-y-2.5">
        {topCustomers.slice(0, 5).map((customer, index) => (
          <div
            key={`${customer.name}-${index}`}
            className="flex items-center gap-3 rounded-2xl border border-slate-100 p-3 transition hover:bg-slate-50"
          >
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-rose-50 text-xs font-black text-rose-600 ring-1 ring-rose-200">
              #{index + 1}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-extrabold text-slate-900">
                {customer.name}
              </p>
              <p className="text-xs font-semibold text-slate-400">
                {customer.orders} orders
              </p>
            </div>
            <p className="text-xs font-black text-slate-800">
              {money(customer.omzet)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
