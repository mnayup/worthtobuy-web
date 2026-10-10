import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import clsx from 'clsx';

interface DataTablePaginationProps {
  page: number;
  total: number;
  limit: number;
  selectedCount?: number;
  onPage: (page: number) => void;
  onLimit?: (limit: number) => void;
}

export function DataTablePagination({
  page,
  total,
  limit,
  selectedCount = 0,
  onPage,
  onLimit,
}: DataTablePaginationProps) {
  const pages = Math.max(1, Math.ceil(total / limit));
  const startRow = total === 0 ? 0 : (page - 1) * limit + 1;
  const endRow = Math.min(page * limit, total);

  const getPageNumbers = () => {
    const list: (number | string)[] = [];
    if (pages <= 5) {
      for (let i = 1; i <= pages; i++) list.push(i);
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 4; i++) list.push(i);
        list.push('...');
        list.push(pages);
      } else if (page >= pages - 2) {
        list.push(1);
        list.push('...');
        for (let i = pages - 3; i <= pages; i++) list.push(i);
      } else {
        list.push(1);
        list.push('...');
        list.push(page - 1);
        list.push(page);
        list.push(page + 1);
        list.push('...');
        list.push(pages);
      }
    }
    return list;
  };

  return (
    <div className="flex flex-col gap-3 border-t border-brand-100 bg-brand-50/30 px-4 py-3.5 text-sm lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-3 text-brand-500">
        <span className="font-semibold text-brand-600">
          Showing {startRow.toLocaleString('id-ID')}–{endRow.toLocaleString('id-ID')} of{' '}
          {total.toLocaleString('id-ID')} records
          {selectedCount > 0 ? (
            <span className="ml-2 rounded-full bg-cherry-100 px-2 py-0.5 text-xs font-bold text-cherry-700">
              {selectedCount} selected
            </span>
          ) : null}
        </span>
        {onLimit && (
          <label className="flex items-center gap-2 font-semibold text-brand-600">
            Per page:
            <select
              className="rounded-lg border border-brand-200 bg-white px-2.5 py-1 text-xs font-bold text-brand-700 shadow-sm focus:border-cherry-400 focus:outline-none"
              value={limit}
              onChange={(event) => onLimit(Number(event.target.value))}
            >
              {[10, 25, 50, 100].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className="flex items-center gap-1.5 self-end lg:self-auto">
        <button
          className="btn-secondary !p-1.5 !rounded-lg"
          disabled={page <= 1}
          onClick={() => onPage(1)}
          title="First page"
        >
          <ChevronsLeft size={16} />
        </button>
        <button
          className="btn-secondary !p-1.5 !rounded-lg"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          title="Previous page"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((num, idx) =>
            num === '...' ? (
              <span key={`ellipsis-${idx}`} className="px-2 font-bold text-brand-300">
                ...
              </span>
            ) : (
              <button
                key={`page-${num}`}
                onClick={() => onPage(Number(num))}
                className={clsx(
                  'h-8 min-w-8 rounded-lg px-2 text-xs font-bold transition-all',
                  page === num
                    ? 'bg-gradient-to-r from-cherry-500 to-rose-600 text-white shadow-sm'
                    : 'text-brand-600 hover:bg-brand-100 hover:text-brand-900'
                )}
              >
                {num}
              </button>
            )
          )}
        </div>

        <button
          className="btn-secondary !p-1.5 !rounded-lg"
          disabled={page >= pages}
          onClick={() => onPage(page + 1)}
          title="Next page"
        >
          <ChevronRight size={16} />
        </button>
        <button
          className="btn-secondary !p-1.5 !rounded-lg"
          disabled={page >= pages}
          onClick={() => onPage(pages)}
          title="Last page"
        >
          <ChevronsRight size={16} />
        </button>
      </div>
    </div>
  );
}
