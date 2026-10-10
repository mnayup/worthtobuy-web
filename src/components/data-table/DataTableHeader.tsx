import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import clsx from 'clsx';
import type { ColumnConfig } from '~/types';
import type { SortDirection } from './data-table-sorter';

interface DataTableHeaderProps {
  columns: ColumnConfig[];
  selectable?: boolean;
  hasActions?: boolean;
  allVisibleSelected: boolean;
  someVisibleSelected: boolean;
  loading?: boolean;
  rowsCount: number;
  activeSortKey: string | null;
  activeSortDir: SortDirection;
  onToggleAllVisible: (checked: boolean) => void;
  onSortToggle: (key: string) => void;
}

export function DataTableHeader({
  columns,
  selectable,
  hasActions,
  allVisibleSelected,
  someVisibleSelected,
  loading,
  rowsCount,
  activeSortKey,
  activeSortDir,
  onToggleAllVisible,
  onSortToggle,
}: DataTableHeaderProps) {
  return (
    <thead className="table-head">
      <tr>
        {selectable && (
          <th className="w-12 px-4 py-3.5 text-center">
            <input
              type="checkbox"
              className="h-4 w-4 cursor-pointer rounded border-brand-300 accent-cherry-500 transition focus:ring-2 focus:ring-cherry-400"
              aria-label="Select all items on this page"
              checked={allVisibleSelected}
              ref={(input) => {
                if (input) {
                  input.indeterminate = someVisibleSelected && !allVisibleSelected;
                }
              }}
              onChange={(event) => onToggleAllVisible(event.target.checked)}
              disabled={loading || rowsCount === 0}
            />
          </th>
        )}
        {columns.map((column) => {
          const isSortable = column.sortable !== false;
          const isSorted = activeSortKey === column.key && Boolean(activeSortDir);

          return (
            <th
              key={column.key}
              onClick={() => isSortable && onSortToggle(column.key)}
              className={clsx(
                'px-4 py-3.5 text-left font-bold transition-colors select-none',
                isSortable && 'cursor-pointer hover:bg-brand-100/80 group'
              )}
              role={isSortable ? 'button' : undefined}
              tabIndex={isSortable ? 0 : undefined}
              onKeyDown={(e) => {
                if (isSortable && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  onSortToggle(column.key);
                }
              }}
              aria-sort={
                activeSortKey === column.key
                  ? activeSortDir === 'asc'
                    ? 'ascending'
                    : activeSortDir === 'desc'
                    ? 'descending'
                    : 'none'
                  : undefined
              }
              title={isSortable ? `Click to sort by ${column.label}` : undefined}
            >
              <div className="inline-flex items-center gap-1.5">
                <span
                  className={clsx(
                    isSorted ? 'text-cherry-600 font-extrabold' : 'text-brand-600'
                  )}
                >
                  {column.label}
                </span>
                {isSortable && (
                  <span
                    className={clsx(
                      'inline-flex items-center justify-center rounded p-0.5 transition-all',
                      isSorted
                        ? 'text-cherry-600 bg-cherry-50'
                        : 'text-brand-300 opacity-60 group-hover:opacity-100 group-hover:text-brand-600'
                    )}
                  >
                    {activeSortKey === column.key && activeSortDir === 'asc' ? (
                      <ArrowUp size={13} className="stroke-[2.5]" />
                    ) : activeSortKey === column.key && activeSortDir === 'desc' ? (
                      <ArrowDown size={13} className="stroke-[2.5]" />
                    ) : (
                      <ArrowUpDown size={13} />
                    )}
                  </span>
                )}
              </div>
            </th>
          );
        })}
        {hasActions && (
          <th className="px-4 py-3.5 text-right font-bold">Actions</th>
        )}
      </tr>
    </thead>
  );
}
