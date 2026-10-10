import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

interface InvoicesPaginationBarProps {
  page: number;
  limit: number;
  total: number;
  setPage: (page: number | ((prev: number) => number)) => void;
  setLimit: (limit: number) => void;
}

export function InvoicesPaginationBar({
  page,
  limit,
  total,
  setPage,
  setLimit,
}: InvoicesPaginationBarProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const fromRecord = ((page - 1) * limit + 1).toLocaleString('id-ID');
  const toRecord = Math.min(page * limit, total).toLocaleString('id-ID');

  return (
    <div
      className={
        'flex flex-col gap-3 border-t border-brand-100 bg-brand-50/30 ' +
        'px-4 py-3.5 text-sm sm:flex-row sm:items-center sm:justify-between'
      }
    >
      <p className="font-semibold text-brand-600">
        Showing {fromRecord}–{toRecord} of {total.toLocaleString('id-ID')} invoices
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-1.5 text-xs font-semibold text-brand-600">
          Per page:
          <select
            className={
              'rounded-lg border border-brand-200 bg-white px-2.5 py-1 text-xs ' +
              'font-bold text-brand-700 shadow-2xs focus:border-cherry-400 focus:outline-none'
            }
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
          >
            {[10, 25, 50, 100].map((val) => (
              <option key={val} value={val}>
                {val}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-1.5">
          <button
            className="btn-secondary !p-1.5 !rounded-lg"
            disabled={page <= 1}
            onClick={() => setPage(1)}
            title="First page"
          >
            <ChevronsLeft size={16} />
          </button>
          <button
            className="btn-secondary !p-1.5 !rounded-lg"
            disabled={page <= 1}
            onClick={() => setPage((val) => Math.max(1, val - 1))}
            title="Previous page"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="pill px-2.5 py-1 text-xs font-bold text-brand-700">
            Page {page} of {totalPages}
          </span>
          <button
            className="btn-secondary !p-1.5 !rounded-lg"
            disabled={page >= totalPages}
            onClick={() => setPage((val) => val + 1)}
            title="Next page"
          >
            <ChevronRight size={16} />
          </button>
          <button
            className="btn-secondary !p-1.5 !rounded-lg"
            disabled={page >= totalPages}
            onClick={() => setPage(totalPages)}
            title="Last page"
          >
            <ChevronsRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
