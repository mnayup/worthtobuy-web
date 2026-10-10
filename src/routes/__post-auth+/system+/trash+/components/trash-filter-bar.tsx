import React from 'react';
import { Search, X, RotateCcw, Trash2 } from 'lucide-react';
import { SavedFilterControls } from '~/components/SavedFilterControls';
import { typeLabels } from '../types';

interface TrashFilterBarProps {
  search: string;
  setSearch: (val: string) => void;
  type: string;
  setType: (val: string) => void;
  setPage: (val: number) => void;
  selectedKeys: string[];
  setSelectedKeys: (val: string[]) => void;
  processing: boolean;
  onRestoreSelected: () => void;
  onBulkPermanentOpen: () => void;
}

export function TrashFilterBar({
  search,
  setSearch,
  type,
  setType,
  setPage,
  selectedKeys,
  setSelectedKeys,
  processing,
  onRestoreSelected,
  onBulkPermanentOpen,
}: TrashFilterBarProps) {
  return (
    <>
      <div
        className={
          'grid gap-3 border-b border-brand-100 p-4 ' +
          'xl:grid-cols-[1fr_220px_minmax(260px,auto)]'
        }
      >
        <div className="relative">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-400"
            size={17}
          />
          <input
            className="input !pl-10 !pr-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search code, description, entity type..."
          />
          {search && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setSearch('')}
              className={
                'absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 ' +
                'text-brand-400 hover:bg-brand-50 hover:text-brand-700 cursor-pointer'
              }
            >
              <X size={15} />
            </button>
          )}
        </div>

        <select
          className="input"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="">All Types</option>
          {Object.entries(typeLabels).map(([val, label]) => (
            <option key={val} value={val}>
              {label}
            </option>
          ))}
        </select>

        <SavedFilterControls
          storageKey="wtb_saved_trash_filters"
          values={{ search, type }}
          onApply={(values) => {
            setSearch(values.search || '');
            setType(values.type || '');
            setPage(1);
          }}
        />
      </div>

      {selectedKeys.length > 0 && (
        <div
          className={
            'flex flex-col gap-3 border-b border-cherry-200 bg-cherry-50/80 ' +
            'p-4 sm:flex-row sm:items-center sm:justify-between shadow-2xs'
          }
        >
          <div>
            <p className="font-extrabold text-cherry-800">
              {selectedKeys.length} items selected
            </p>
            <p className="text-xs font-semibold text-cherry-600">
              Batch restore or permanently delete all selected records.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              disabled={processing}
              className="btn-secondary !bg-white cursor-pointer"
              onClick={() => setSelectedKeys([])}
            >
              <X size={15} /> Clear selection
            </button>
            <button
              disabled={processing}
              className="btn-secondary !bg-white cursor-pointer"
              onClick={onRestoreSelected}
            >
              <RotateCcw size={15} /> Restore Selected
            </button>
            <button
              disabled={processing}
              className={
                'btn bg-rose-600 text-white hover:bg-rose-700 ' +
                'shadow-sm cursor-pointer'
              }
              onClick={onBulkPermanentOpen}
            >
              <Trash2 size={15} /> Purge Permanently
            </button>
          </div>
        </div>
      )}
    </>
  );
}
