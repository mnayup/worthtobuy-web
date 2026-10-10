import {
  BookmarkPlus,
  ChevronDown,
  Filter,
  RotateCcw,
  Search,
  X,
} from 'lucide-react';
import clsx from 'clsx';
import type { TableFilterConfig } from '~/types';
import type { SavedFilter } from './crud-filters.helper';

interface CrudFilterBarProps {
  title: string;
  searchPlaceholder?: string;
  search: string;
  onSearchChange: (value: string) => void;
  columnFilters: Record<string, string>;
  onColumnFilterChange: (key: string, value?: string) => void;
  resolvedFilters: TableFilterConfig[];
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  onSaveFilter: () => void;
  savedFilters: SavedFilter[];
  onApplySavedFilter: (filter: SavedFilter) => void;
  onDeleteSavedFilter: (name: string) => void;
  total: number;
}

export function CrudFilterBar({
  title,
  searchPlaceholder,
  search,
  onSearchChange,
  columnFilters,
  onColumnFilterChange,
  resolvedFilters,
  hasActiveFilters,
  onResetFilters,
  onSaveFilter,
  savedFilters,
  onApplySavedFilter,
  onDeleteSavedFilter,
  total,
}: CrudFilterBarProps) {
  return (
    <div className="card border-brand-100 p-4 shadow-xs space-y-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1 min-w-[240px] max-w-xl">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-400"
            size={17}
          />
          <input
            type="text"
            className="input !pl-10 !pr-10 !h-10 text-sm bg-brand-50/40 border-brand-200 focus:bg-white placeholder:text-brand-400 transition"
            placeholder={searchPlaceholder || `Search ${title.toLowerCase()}...`}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {search && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-brand-400 hover:bg-brand-100 hover:text-brand-700 transition"
              title="Clear search keyword"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {resolvedFilters.map((filter) => {
            const currentValue = columnFilters[filter.key] || '';
            const isActive = currentValue !== '' && currentValue !== 'ALL';
            return (
              <div key={filter.key} className="relative min-w-[135px] sm:min-w-[155px]">
                <select
                  className={clsx(
                    'w-full appearance-none rounded-xl border px-3 py-2 pr-8 text-xs font-bold transition shadow-2xs focus:outline-none focus:ring-2',
                    isActive
                      ? 'border-cherry-400 bg-cherry-50/70 text-cherry-900 focus:ring-cherry-300'
                      : 'border-brand-200 bg-white text-brand-700 hover:border-brand-300 focus:border-brand-400 focus:ring-brand-200'
                  )}
                  value={currentValue}
                  onChange={(e) => {
                    const val = e.target.value;
                    onColumnFilterChange(filter.key, val && val !== 'ALL' ? val : undefined);
                  }}
                >
                  <option value="">{filter.placeholder || `All ${filter.label}`}</option>
                  {filter.options.map((opt) => (
                    <option key={String(opt.value)} value={String(opt.value)}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className={clsx(
                    'pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2',
                    isActive ? 'text-cherry-600' : 'text-brand-400'
                  )}
                />
              </div>
            );
          })}

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="btn-secondary !h-9 !px-3 text-xs !rounded-xl text-cherry-600 hover:bg-cherry-50 hover:border-cherry-200 transition"
              title="Clear all filters and search"
            >
              <RotateCcw size={13} className="mr-1 inline" />
              Reset
            </button>
          )}

          <button
            type="button"
            className="btn-secondary !h-9 !px-3 text-xs !rounded-xl"
            onClick={onSaveFilter}
            title="Save current filter preset"
          >
            <BookmarkPlus size={14} className="text-brand-500 mr-1 inline" />
            Save
          </button>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 border-t border-brand-100 pt-2.5 text-xs">
          <span className="inline-flex items-center gap-1 font-bold text-brand-500">
            <Filter size={12} className="text-cherry-500" /> Active Filters:
          </span>

          {search && (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-2.5 py-1 font-semibold text-brand-800">
              <span className="text-brand-400">Keyword:</span> "{search}"
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="rounded hover:bg-brand-200 text-brand-500 hover:text-brand-900 p-0.5"
                title="Clear keyword"
              >
                <X size={11} />
              </button>
            </span>
          )}

          {Object.entries(columnFilters).map(([k, val]) => {
            if (!val || val === 'ALL') return null;
            const filterDef = resolvedFilters.find((f) => f.key === k);
            const opt = filterDef?.options.find((o) => String(o.value) === String(val));
            const displayLabel = opt?.label || val;
            return (
              <span
                key={k}
                className="inline-flex items-center gap-1.5 rounded-lg border border-cherry-200 bg-cherry-50 px-2.5 py-1 font-bold text-cherry-900"
              >
                <span className="text-cherry-500 font-medium">{filterDef?.label || k}:</span>
                {displayLabel}
                <button
                  type="button"
                  onClick={() => onColumnFilterChange(k, undefined)}
                  className="rounded hover:bg-cherry-200 text-cherry-500 hover:text-cherry-900 p-0.5"
                  title={`Clear filter ${filterDef?.label || k}`}
                >
                  <X size={11} />
                </button>
              </span>
            );
          })}

          <span className="ml-auto text-xs font-semibold text-brand-400">
            Found <strong className="text-brand-700">{total.toLocaleString('en-US')}</strong> records
          </span>
        </div>
      )}

      {savedFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-t border-brand-100/70 pt-2.5 text-xs">
          <span className="font-bold text-brand-400">Saved presets:</span>
          {savedFilters.map((f) => (
            <span
              key={f.name}
              className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-white px-3 py-1 font-bold text-brand-700 shadow-2xs transition hover:bg-brand-50"
            >
              <button
                type="button"
                onClick={() => onApplySavedFilter(f)}
                title={`Apply preset ${f.name}`}
              >
                {f.name}
              </button>
              <button
                type="button"
                aria-label={`Remove filter ${f.name}`}
                onClick={() => onDeleteSavedFilter(f.name)}
                className="rounded-full p-0.5 text-brand-400 hover:bg-brand-100 hover:text-brand-700"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
