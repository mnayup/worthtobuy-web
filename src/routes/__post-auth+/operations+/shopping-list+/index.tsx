import React from 'react';
import { Download } from 'lucide-react';
import { PageHeader } from '~/components/PageHeader';
import { Toast } from '~/components/Toast';
import {
  useShoppingList,
  fetchShoppingList,
  updateShoppingItemStatus,
} from './hooks/use-shopping-list';
import { ShoppingFilterBar } from './components/shopping-filter-bar';
import { ShoppingBrandGroup } from './components/shopping-brand-group';
import { ShoppingPaginationBar } from './components/shopping-pagination-bar';

export async function loader(params?: {
  periodId?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  return fetchShoppingList(params);
}

export async function action(data: { id: number; purchaseStatus: string }) {
  return updateShoppingItemStatus(data.id, data.purchaseStatus);
}

export default function ShoppingListRoute() {
  const {
    periods,
    periodId,
    setPeriodId,
    status,
    setStatus,
    search,
    setSearch,
    page,
    setPage,
    limit,
    setLimit,
    total,
    loading,
    toast,
    setToast,
    groups,
    setItemStatus,
    exportShoppingListExcel,
  } = useShoppingList();

  return (
    <div className="animate-rise space-y-6">
      <PageHeader
        title="Shopper Shopping List"
        description={
          'Shopper operational view grouped by brand, combining both catalog ' +
          'pre-orders and on-site request items.'
        }
        actions={
          <button
            className="btn-secondary !bg-white cursor-pointer"
            onClick={exportShoppingListExcel}
          >
            <Download size={17} /> Export Excel
          </button>
        }
      />

      <ShoppingFilterBar
        search={search}
        setSearch={setSearch}
        periodId={periodId}
        setPeriodId={setPeriodId}
        status={status}
        setStatus={setStatus}
        periods={periods}
        setPage={setPage}
      />

      {loading ? (
        <div className="grid min-h-72 place-items-center">
          <div
            className={
              'h-9 w-9 animate-spin rounded-full border-4 ' +
              'border-brand-100 border-t-cherry-500'
            }
          />
        </div>
      ) : groups.length ? (
        <div className="space-y-5">
          {groups.map(([brandName, rows]) => (
            <ShoppingBrandGroup
              key={brandName}
              brandName={brandName}
              rows={rows}
              onSetStatus={setItemStatus}
            />
          ))}
        </div>
      ) : (
        <div
          className={
            'card grid min-h-72 place-items-center p-8 ' +
            'text-sm font-semibold text-brand-400'
          }
        >
          No shopping items found matching this filter.
        </div>
      )}

      {!loading && total > 0 && (
        <ShoppingPaginationBar
          page={page}
          setPage={setPage}
          limit={limit}
          setLimit={setLimit}
          total={total}
        />
      )}

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
