import React, { type Dispatch, type SetStateAction } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ShoppingPaginationBarProps {
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  limit: number;
  setLimit: (limit: number) => void;
  total: number;
}

export function ShoppingPaginationBar({
  page,
  setPage,
  limit,
  setLimit,
  total,
}: ShoppingPaginationBarProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const fromRecord = (page - 1) * limit + 1;
  const toRecord = Math.min(page * limit, total);

  return (
    <div
      className={
        'flex flex-col gap-3 rounded-2xl border border-brand-100 bg-white ' +
        'px-4 py-3 sm:flex-row sm:items-center sm:justify-between shadow-xs'
      }
    >
      <p className="text-sm font-semibold text-brand-500">
        Showing {fromRecord}–{toRecord} of {total} items
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <select
          className="input !w-auto !py-2 text-xs font-medium"
          value={limit}
          onChange={(e) => {
            setLimit(Number(e.target.value));
            setPage(1);
          }}
        >
          {[10, 25, 50, 100].map((val) => (
            <option key={val} value={val}>
              {val} / page
            </option>
          ))}
        </select>
        <button
          className="btn-secondary !px-3 !py-2 text-xs font-bold cursor-pointer"
          disabled={page <= 1}
          onClick={() => setPage((val) => Math.max(1, val - 1))}
        >
          <ChevronLeft size={16} /> Previous
        </button>
        <span className="pill bg-brand-50 text-brand-700 font-bold text-xs">
          Page {page} of {totalPages}
        </span>
        <button
          className="btn-secondary !px-3 !py-2 text-xs font-bold cursor-pointer"
          disabled={page >= totalPages}
          onClick={() => setPage((val) => val + 1)}
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
