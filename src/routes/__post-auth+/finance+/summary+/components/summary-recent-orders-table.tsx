import { useNavigate } from 'react-router-dom';
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  FileText,
} from 'lucide-react';
import { money } from '~/lib/format';
import { StatusBadge } from '~/components/StatusBadge';
import type { OrderSortCol } from '../hooks/use-summary-data';

interface SummaryRecentOrdersTableProps {
  orders: any[];
  sortedOrders: any[];
  orderPage: number;
  setOrderPage: (page: number | ((p: number) => number)) => void;
  orderPageSize: number;
  onSort: (col: NonNullable<OrderSortCol>) => void;
}

export function SummaryRecentOrdersTable({
  orders,
  sortedOrders,
  orderPage,
  setOrderPage,
  orderPageSize,
  onSort,
}: SummaryRecentOrdersTableProps) {
  const navigate = useNavigate();

  const totalPages = Math.ceil(orders.length / orderPageSize);
  const startRow = (orderPage - 1) * orderPageSize + 1;
  const endRow = Math.min(orderPage * orderPageSize, orders.length);

  return (
    <section className="card overflow-hidden">
      <div
        className={
          'flex items-center justify-between border-b border-brand-100 ' +
          'p-5 bg-brand-50/40'
        }
      >
        <div>
          <h2 className="section-title">Recent Orders</h2>
          <p className="mt-0.5 text-xs font-medium text-brand-400">
            Quickly launch invoices directly from summary.
          </p>
        </div>
        <button
          onClick={() => navigate('/invoices')}
          className="btn-secondary !px-3 !py-1.5 text-xs"
        >
          <FileText size={15} /> All Invoices
        </button>
      </div>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="min-w-full divide-y divide-brand-100">
          <thead className="table-head">
            <tr>
              <th
                className="px-4 py-3 cursor-pointer hover:bg-brand-100 select-none group"
                onClick={() => onSort('orderNumber')}
              >
                <div className="inline-flex items-center gap-1.5">
                  <span>Order #</span>
                  <ArrowUpDown size={12} className="opacity-50 group-hover:opacity-100" />
                </div>
              </th>
              <th
                className="px-4 py-3 cursor-pointer hover:bg-brand-100 select-none group"
                onClick={() => onSort('customer')}
              >
                <div className="inline-flex items-center gap-1.5">
                  <span>Customer</span>
                  <ArrowUpDown size={12} className="opacity-50 group-hover:opacity-100" />
                </div>
              </th>
              <th
                className="px-4 py-3 cursor-pointer hover:bg-brand-100 select-none group"
                onClick={() => onSort('total')}
              >
                <div className="inline-flex items-center gap-1.5">
                  <span>Total</span>
                  <ArrowUpDown size={12} className="opacity-50 group-hover:opacity-100" />
                </div>
              </th>
              <th
                className="px-4 py-3 cursor-pointer hover:bg-brand-100 select-none group"
                onClick={() => onSort('status')}
              >
                <div className="inline-flex items-center gap-1.5">
                  <span>Status</span>
                  <ArrowUpDown size={12} className="opacity-50 group-hover:opacity-100" />
                </div>
              </th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-100">
            {sortedOrders.length ? (
              sortedOrders
                .slice((orderPage - 1) * orderPageSize, orderPage * orderPageSize)
                .map((order) => {
                  const invoiceId = order.invoiceLinks?.[0]?.invoiceId;
                  return (
                    <tr key={order.id} className="hover:bg-brand-50 transition-colors">
                      <td className="table-cell font-extrabold text-brand-900">
                        {order.orderNumber}
                      </td>
                      <td className="table-cell text-brand-700">
                        {order.customer?.fullName}
                      </td>
                      <td className="table-cell font-black text-brand-900">
                        {money(order.totalBill)}
                      </td>
                      <td className="table-cell">
                        <StatusBadge value={order.status} />
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() =>
                            navigate(
                              invoiceId
                                ? `/invoices/${invoiceId}`
                                : `/invoices?orderId=${order.id}`
                            )
                          }
                          className={
                            'rounded-xl p-2 text-brand-500 hover:bg-brand-100 ' +
                            'hover:text-brand-900 transition'
                          }
                          title={invoiceId ? 'View Invoice' : 'Create Invoice'}
                        >
                          <FileText size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
            ) : (
              <tr>
                <td colSpan={5} className="p-8 text-center text-sm text-brand-400">
                  No recent orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {orders.length > orderPageSize && (
        <div
          className={
            'flex items-center justify-between border-t border-brand-100 ' +
            'px-5 py-3 text-xs bg-brand-50/30'
          }
        >
          <span className="font-semibold text-brand-500">
            Showing {startRow}–{endRow} of {orders.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={orderPage <= 1}
              onClick={() => setOrderPage((p) => Math.max(1, (p as number) - 1))}
              className={
                'rounded-lg p-1.5 text-brand-500 hover:bg-brand-100 ' +
                'disabled:opacity-30'
              }
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-2 font-bold text-brand-700">
              {orderPage} / {totalPages}
            </span>
            <button
              disabled={orderPage >= totalPages}
              onClick={() => setOrderPage((p) => (p as number) + 1)}
              className={
                'rounded-lg p-1.5 text-brand-500 hover:bg-brand-100 ' +
                'disabled:opacity-30'
              }
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
