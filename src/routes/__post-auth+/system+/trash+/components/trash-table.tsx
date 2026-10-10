import React from 'react';
import {
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import clsx from 'clsx';
import { dateTime, titleCase } from '~/lib/format';
import { rowKey, typeLabels, type TrashItem } from '../types';
import type { SortColumn, SortDirection } from '../hooks/use-trash';

interface TrashTableProps {
  filtered: TrashItem[];
  loading: boolean;
  processing: boolean;
  selectedKeys: string[];
  allFilteredSelected: boolean;
  someFilteredSelected: boolean;
  sortCol: SortColumn | null;
  sortDir: SortDirection;
  onSortToggle: (col: SortColumn) => void;
  onToggleAll: (checked: boolean) => void;
  onToggleRow: (row: any, checked: boolean) => void;
  onRestoreItem: (row: any) => void;
  onPermanentDelete: (row: any) => void;
}

export function TrashTable({
  filtered,
  loading,
  processing,
  selectedKeys,
  allFilteredSelected,
  someFilteredSelected,
  sortCol,
  sortDir,
  onSortToggle,
  onToggleAll,
  onToggleRow,
  onRestoreItem,
  onPermanentDelete,
}: TrashTableProps) {
  const renderSortIndicator = (col: SortColumn) => {
    const isActive = sortCol === col && Boolean(sortDir);
    return (
      <span
        className={clsx(
          'inline-flex items-center justify-center rounded p-0.5 transition-all',
          isActive
            ? 'text-cherry-600 bg-cherry-50'
            : 'text-brand-300 opacity-60 group-hover:opacity-100 group-hover:text-brand-600'
        )}
      >
        {sortCol === col && sortDir === 'asc' ? (
          <ArrowUp size={13} className="stroke-[2.5]" />
        ) : sortCol === col && sortDir === 'desc' ? (
          <ArrowDown size={13} className="stroke-[2.5]" />
        ) : (
          <ArrowUpDown size={13} />
        )}
      </span>
    );
  };

  const columns: { key: SortColumn; label: string }[] = [
    { key: 'entityType', label: 'Kind / Type' },
    { key: 'code', label: 'Code / Number' },
    { key: 'name', label: 'Description' },
    { key: 'deletedAt', label: 'Deleted At' },
    { key: 'deletedByName', label: 'Deleted By' },
  ];

  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="min-w-full divide-y divide-brand-100">
        <thead className="table-head">
          <tr>
            <th className="w-12 px-4 py-3.5 text-center">
              <input
                type="checkbox"
                className={
                  'h-4 w-4 cursor-pointer rounded border-brand-300 ' +
                  'accent-cherry-500 transition focus:ring-2 focus:ring-cherry-400'
                }
                aria-label="Select all items in filtered trash"
                checked={allFilteredSelected}
                ref={(input) => {
                  if (input) {
                    input.indeterminate = someFilteredSelected && !allFilteredSelected;
                  }
                }}
                onChange={(e) => onToggleAll(e.target.checked)}
                disabled={loading || filtered.length === 0}
              />
            </th>
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => onSortToggle(col.key)}
                className={
                  'px-4 py-3.5 text-left font-bold cursor-pointer ' +
                  'hover:bg-brand-100/80 select-none group'
                }
                title={`Click to sort by ${col.label}`}
              >
                <div className="inline-flex items-center gap-1.5">
                  <span
                    className={clsx(
                      sortCol === col.key && sortDir
                        ? 'text-cherry-600 font-extrabold'
                        : ''
                    )}
                  >
                    {col.label}
                  </span>
                  {renderSortIndicator(col.key)}
                </div>
              </th>
            ))}
            <th className="px-4 py-3.5 text-right font-bold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-100/70 bg-white">
          {loading ? (
            Array.from({ length: 5 }).map((_, idx) => (
              <tr key={idx} className="animate-pulse">
                {Array.from({ length: 7 }).map((__, cell) => (
                  <td key={cell} className="px-4 py-4">
                    <div className="h-4 w-24 rounded-md bg-brand-100" />
                  </td>
                ))}
              </tr>
            ))
          ) : filtered.length ? (
            filtered.map((row) => {
              const selected = selectedKeys.includes(rowKey(row));
              return (
                <tr
                  key={rowKey(row)}
                  className={clsx(
                    'transition-colors duration-100',
                    selected
                      ? 'bg-cherry-50/60 hover:bg-cherry-50/80'
                      : 'hover:bg-brand-50/80'
                  )}
                >
                  <td className="w-12 px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      className={
                        'h-4 w-4 cursor-pointer rounded border-brand-300 ' +
                        'accent-cherry-500 transition focus:ring-2 focus:ring-cherry-400'
                      }
                      aria-label={`Select ${row.code}`}
                      checked={selected}
                      onChange={(e) => onToggleRow(row, e.target.checked)}
                    />
                  </td>
                  <td className="table-cell">
                    <span className="pill text-[11px]">
                      {typeLabels[row.entityType] || titleCase(row.entityType)}
                    </span>
                  </td>
                  <td className="table-cell font-extrabold text-brand-900">{row.code}</td>
                  <td className="table-cell text-brand-700">{row.name}</td>
                  <td className="table-cell whitespace-nowrap text-brand-600">
                    {dateTime(row.deletedAt)}
                  </td>
                  <td className="table-cell text-brand-500">{row.deletedByName || '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        disabled={processing}
                        onClick={() => onRestoreItem(row)}
                        className="btn-secondary !px-2.5 !py-1.5 text-xs cursor-pointer"
                        title="Restore"
                      >
                        <RotateCcw size={14} className="text-brand-500" /> Restore
                      </button>
                      <button
                        disabled={processing}
                        onClick={() => onPermanentDelete(row)}
                        className={
                          'btn bg-rose-600 !px-2.5 !py-1.5 text-xs text-white ' +
                          'hover:bg-rose-700 shadow-2xs cursor-pointer'
                        }
                        title="Purge Permanently"
                      >
                        <Trash2 size={14} /> Purge
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td
                colSpan={7}
                className="px-6 py-16 text-center text-sm font-medium text-brand-400"
              >
                Trash is empty or no records match your filter.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
