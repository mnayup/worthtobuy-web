import { ChevronLeft, ChevronRight, PackageSearch } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StatusBadge } from '~/components/StatusBadge';
import { date, money } from '~/lib/format';

interface CustomerOrdersSectionProps {
  orders: any[];
  totalOrders: number;
  page: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
}

export function CustomerOrdersSection({
  orders,
  totalOrders,
  page,
  totalPages,
  pageSize,
  onPageChange,
}: CustomerOrdersSectionProps) {
  const navigate = useNavigate();

  return (
    <section className="card overflow-hidden">
      <div
        className={
          'flex items-center justify-between border-b border-brand-100 ' +
          'px-5 py-4 bg-brand-50/20'
        }
      >
        <div className="flex items-center gap-2">
          <PackageSearch size={18} className="text-cherry-500" />
          <h2 className="font-black text-brand-900">Recent Orders</h2>
        </div>
        <span
          className={
            'text-xs font-semibold text-brand-500 bg-brand-100/70 ' +
            'px-2 py-0.5 rounded-full'
          }
        >
          {totalOrders} orders
        </span>
      </div>

      <div className="divide-y divide-brand-50">
        {orders.length ? (
          orders.map((order: any) => (
            <button
              key={order.id}
              onClick={() =>
                navigate(`/orders?search=${encodeURIComponent(order.orderNumber)}`)
              }
              className={
                'flex w-full items-center justify-between gap-4 px-5 py-4 ' +
                'text-left hover:bg-brand-50 transition'
              }
            >
              <div>
                <p className="font-black text-brand-900">{order.orderNumber}</p>
                <p className="mt-1 text-xs text-brand-500">
                  {order.period?.code} • {date(order.orderDate)} •{' '}
                  {(order.items || [])
                    .map((item: any) => item.product?.name || item.manualProductName)
                    .filter(Boolean)
                    .join(', ')}
                </p>
              </div>
              <div className="text-right">
                <p className="font-black text-brand-900">{money(order.totalBill)}</p>
                <StatusBadge value={order.status} />
              </div>
            </button>
          ))
        ) : (
          <p className="p-8 text-center text-sm font-medium text-brand-400">
            No orders found.
          </p>
        )}
      </div>

      {totalOrders > pageSize && (
        <div
          className={
            'flex items-center justify-between border-t border-brand-100 ' +
            'px-4 py-3 text-xs bg-brand-50/20'
          }
        >
          <span className="text-brand-500">
            {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalOrders)} of{' '}
            {totalOrders}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              className="btn-secondary !p-1 text-xs"
              disabled={page <= 1}
              onClick={() => onPageChange(Math.max(1, page - 1))}
            >
              <ChevronLeft size={14} />
            </button>
            <span className="font-bold text-brand-700">
              {page} / {totalPages}
            </span>
            <button
              className="btn-secondary !p-1 text-xs"
              disabled={page >= totalPages}
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
