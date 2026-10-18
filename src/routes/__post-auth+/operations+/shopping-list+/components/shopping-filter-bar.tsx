import React from 'react';
import { Search, X } from 'lucide-react';
import { titleCase } from '~/lib/format';
import { SavedFilterControls } from '~/components/SavedFilterControls';
import { SearchableFilterSelect } from '~/components/crud-page/SearchableFilterSelect';
import { shoppingStatuses } from '../types';

interface ShoppingFilterBarProps {
  search: string;
  setSearch: (val: string) => void;
  periodId: string;
  setPeriodId: (val: string) => void;
  status: string;
  setStatus: (val: string) => void;
  periods: any[];
  setPage: (val: number) => void;
}

export function ShoppingFilterBar({
  search,
  setSearch,
  periodId,
  setPeriodId,
  status,
  setStatus,
  periods,
  setPage,
}: ShoppingFilterBarProps) {
  return (
    <div className="card p-4">
      <div className="grid gap-3 md:grid-cols-3">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-400"
            size={18}
          />
          <input
            className="input !pl-10 !pr-10"
            placeholder="Search product, brand, customer, order..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setSearch('')}
              className={
                'absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 ' +
                'text-brand-400 hover:bg-brand-50 hover:text-brand-700 transition cursor-pointer'
              }
            >
              <X size={16} />
            </button>
          )}
        </div>
        <SearchableFilterSelect
          label="Event"
          placeholder="All Events"
          options={periods.map((period) => ({
            value: period.id,
            label: `${period.code} • ${period.name}`,
          }))}
          value={periodId}
          onChange={(val) => {
            setPeriodId(val || '');
            setPage(1);
          }}
        />
        <SearchableFilterSelect
          label="Status"
          placeholder="All Statuses"
          options={shoppingStatuses.map((val) => ({
            value: val,
            label: titleCase(val),
          }))}
          value={status}
          onChange={(val) => {
            setStatus(val || '');
            setPage(1);
          }}
        />
      </div>
      <div className="mt-3 flex justify-end">
        <SavedFilterControls
          storageKey="wtb_saved_shopping_filters"
          values={{ search, periodId, status }}
          onApply={(values) => {
            setSearch(values.search || '');
            setPeriodId(values.periodId || '');
            setStatus(values.status || '');
            setPage(1);
          }}
        />
      </div>
    </div>
  );
}
