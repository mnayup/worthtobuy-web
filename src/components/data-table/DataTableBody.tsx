import { Edit3, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import clsx from 'clsx';
import type { ColumnConfig } from '~/types';

interface DataTableBodyProps {
  columns: ColumnConfig[];
  rows: any[];
  loading?: boolean;
  limit: number;
  selectable?: boolean;
  hasActions?: boolean;
  selected: Set<string>;
  emptyText: string;
  canEditRow?: (row: any) => boolean;
  canDeleteRow?: (row: any) => boolean;
  canSelectRow?: (row: any) => boolean;
  getSelectDisabledReason?: (row: any) => string | undefined;
  renderActions?: (row: any) => ReactNode;
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  onToggleRow: (id: string, checked: boolean) => void;
}

export function DataTableBody({
  columns,
  rows,
  loading,
  limit,
  selectable,
  hasActions,
  selected,
  emptyText,
  canEditRow,
  canDeleteRow,
  canSelectRow,
  getSelectDisabledReason,
  renderActions,
  onEdit,
  onDelete,
  onToggleRow,
}: DataTableBodyProps) {
  if (loading) {
    return (
      <tbody className="divide-y divide-brand-100/70 bg-white">
        {Array.from({ length: Math.min(limit, 5) }).map((_, index) => (
          <tr key={index} className="animate-pulse">
            {selectable && (
              <td className="px-4 py-4">
                <div className="mx-auto h-4 w-4 rounded bg-brand-100" />
              </td>
            )}
            {columns.map((column) => (
              <td key={column.key} className="px-4 py-4">
                <div className="h-4 w-28 rounded-md bg-brand-100" />
              </td>
            ))}
            {hasActions && (
              <td className="px-4 py-4">
                <div className="ml-auto h-8 w-16 rounded-xl bg-brand-100" />
              </td>
            )}
          </tr>
        ))}
      </tbody>
    );
  }

  if (!rows.length) {
    return (
      <tbody className="divide-y divide-brand-100/70 bg-white">
        <tr>
          <td
            colSpan={columns.length + (hasActions ? 1 : 0) + (selectable ? 1 : 0)}
            className="px-6 py-14 text-center text-sm font-medium text-brand-400"
          >
            {emptyText}
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody className="divide-y divide-brand-100/70 bg-white">
      {rows.map((row, index) => {
        const id = String(row.id ?? index);
        const isSelected = selected.has(id);
        const canSelect = !canSelectRow || canSelectRow(row);
        return (
          <tr
            key={id}
            className={clsx(
              'transition-colors duration-100',
              isSelected
                ? 'bg-cherry-50/60 hover:bg-cherry-50/80'
                : 'hover:bg-brand-50/80'
            )}
          >
            {selectable && (
              <td className="w-12 px-4 py-3 text-center">
                <input
                  type="checkbox"
                  disabled={!canSelect}
                  className={clsx(
                    'h-4 w-4 rounded border-brand-300 accent-cherry-500 transition focus:ring-2 focus:ring-cherry-400',
                    canSelect ? 'cursor-pointer' : 'cursor-not-allowed opacity-25'
                  )}
                  title={
                    !canSelect
                      ? (getSelectDisabledReason ? getSelectDisabledReason(row) : undefined)
                      : undefined
                  }
                  aria-label={`Select item ${id}`}
                  checked={isSelected}
                  onChange={(event) => canSelect && onToggleRow(id, event.target.checked)}
                />
              </td>
            )}
            {columns.map((column) => (
              <td key={column.key} className="table-cell">
                {column.render ? column.render(row) : String(row[column.key] ?? '-')}
              </td>
            ))}
            {hasActions && (
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-1.5">
                  {renderActions?.(row)}
                  {onEdit && (!canEditRow || canEditRow(row)) && (
                    <button
                      onClick={() => onEdit(row)}
                      className="inline-flex items-center justify-center px-2.5 py-1.5 h-8 min-w-[34px] rounded-xl border border-brand-200 bg-white text-brand-600 shadow-2xs transition hover:bg-brand-50 hover:text-brand-900 hover:border-brand-300 cursor-pointer"
                      title="Edit item"
                      aria-label="Edit item"
                    >
                      <Edit3 size={15} />
                    </button>
                  )}
                  {onDelete && (!canDeleteRow || canDeleteRow(row)) && (
                    <button
                      onClick={() => onDelete(row)}
                      className="inline-flex items-center justify-center px-2.5 py-1.5 h-8 min-w-[34px] rounded-xl border border-rose-200 bg-rose-50/50 text-rose-600 shadow-2xs transition hover:bg-rose-100 hover:text-rose-700 hover:border-rose-300 cursor-pointer"
                      title="Delete item"
                      aria-label="Delete item"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </td>
            )}
          </tr>
        );
      })}
    </tbody>
  );
}
