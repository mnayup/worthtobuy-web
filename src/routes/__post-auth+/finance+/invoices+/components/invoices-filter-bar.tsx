import { Filter, RotateCcw, Search, Trash2, X } from 'lucide-react';
import clsx from 'clsx';
import { titleCase } from '~/lib/format';
import { SavedFilterControls } from '~/components/SavedFilterControls';
import { SearchableFilterSelect } from '~/components/crud-page/SearchableFilterSelect';
import { invoiceStatuses } from '../types';

interface InvoicesFilterBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  search: string;
  setSearch: (value: string) => void;
  status: string;
  setStatus: (value: string) => void;
  billingModel: string;
  setBillingModel: (value: string) => void;
  setPage: (page: number) => void;
  total: number;
  canDeleteInvoices?: boolean;
  selectedCount: number;
  onClearSelection: () => void;
  onOpenBulkDelete: () => void;
}

const TABS = [
  { id: 'ALL', label: 'All Invoices' },
  { id: 'DP', label: 'Pre-Order (DP)' },
  { id: 'SETTLEMENT', label: 'Waiting Settlement' },
  { id: 'PAID', label: 'Paid' },
];

export function InvoicesFilterBar({
  activeTab,
  setActiveTab,
  search,
  setSearch,
  status,
  setStatus,
  billingModel,
  setBillingModel,
  setPage,
  total,
  canDeleteInvoices,
  selectedCount,
  onClearSelection,
  onOpenBulkDelete,
}: InvoicesFilterBarProps) {
  const hasFilter = Boolean(search || status || billingModel);

  return (
    <>
      <div
        className={
          'flex border-b border-brand-100 bg-brand-50/50 px-4 pt-2.5 ' +
          'overflow-x-auto scrollbar-thin'
        }
      >
        <div className="flex gap-2">
          {TABS.map((tab) => {
            const isActive =
              (tab.id === 'ALL' && !activeTab) || activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id === 'ALL' ? '' : tab.id)}
                className={clsx(
                  'rounded-t-xl px-4 py-2 text-xs font-black transition border-b-2',
                  isActive
                    ? 'border-cherry-600 bg-white text-cherry-600 shadow-2xs'
                    : 'border-transparent text-brand-600 hover:text-brand-900 ' +
                        'hover:bg-brand-100/50'
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-b border-brand-100 p-4 space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 min-w-[240px] max-w-xl">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-400"
              size={17}
            />
            <input
              className={
                'input !pl-10 !pr-10 !h-10 text-sm bg-brand-50/40 border-brand-200 ' +
                'focus:bg-white placeholder:text-brand-400 transition'
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search invoice number, customer, order, items..."
            />
            {search && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearch('')}
                className={
                  'absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 ' +
                  'text-brand-400 hover:bg-brand-100 hover:text-brand-700 transition'
                }
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <SearchableFilterSelect
              label="Invoice Status"
              placeholder="All Invoice Status"
              options={invoiceStatuses.map((value) => ({
                value,
                label: titleCase(value),
              }))}
              value={status}
              onChange={(val) => {
                setStatus(val || '');
                setPage(1);
              }}
            />

            <SearchableFilterSelect
              label="Billing Model"
              placeholder="All Billing Models"
              options={[
                { value: 'FULL', label: 'Full Payment' },
                { value: 'DP', label: 'Deposit (DP)' },
              ]}
              value={billingModel}
              onChange={(val) => {
                setBillingModel(val || '');
                setPage(1);
              }}
            />

            {hasFilter && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setStatus('');
                  setBillingModel('');
                  setPage(1);
                }}
                className={
                  'btn-secondary !h-9 !px-3 text-xs !rounded-xl text-cherry-600 ' +
                  'hover:bg-cherry-50 hover:border-cherry-200 transition'
                }
                title="Clear all filters and search"
              >
                <RotateCcw size={13} className="mr-1 inline" />
                Reset
              </button>
            )}

            <SavedFilterControls
              storageKey="wtb_saved_invoice_filters"
              values={{ search, status, billingModel }}
              onApply={(values: Record<string, string>) => {
                setSearch(values.search || '');
                setStatus(values.status || '');
                setBillingModel(values.billingModel || '');
                setPage(1);
              }}
            />
          </div>
        </div>

        {hasFilter && (
          <div
            className={
              'flex flex-wrap items-center gap-2 border-t border-brand-100 ' +
              'pt-2.5 text-xs'
            }
          >
            <span className="inline-flex items-center gap-1 font-bold text-brand-500">
              <Filter size={12} className="text-cherry-500" /> Active Filters:
            </span>
            {search && (
              <span
                className={
                  'inline-flex items-center gap-1.5 rounded-lg border ' +
                  'border-brand-200 bg-brand-50 px-2.5 py-1 font-semibold text-brand-800'
                }
              >
                <span className="text-brand-400">Keyword:</span> "{search}"
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="rounded hover:bg-brand-200 text-brand-500 p-0.5"
                >
                  <X size={11} />
                </button>
              </span>
            )}
            {status && (
              <span
                className={
                  'inline-flex items-center gap-1.5 rounded-lg border ' +
                  'border-cherry-200 bg-cherry-50 px-2.5 py-1 font-bold text-cherry-900'
                }
              >
                <span className="text-cherry-500 font-medium">Status:</span> {titleCase(status)}
                <button
                  type="button"
                  onClick={() => setStatus('')}
                  className="rounded hover:bg-cherry-200 text-cherry-500 p-0.5"
                >
                  <X size={11} />
                </button>
              </span>
            )}
            {billingModel && (
              <span
                className={
                  'inline-flex items-center gap-1.5 rounded-lg border ' +
                  'border-cherry-200 bg-cherry-50 px-2.5 py-1 font-bold text-cherry-900'
                }
              >
                <span className="text-cherry-500 font-medium">Model:</span>{' '}
                {billingModel === 'FULL' ? 'Full Payment' : 'Deposit (DP)'}
                <button
                  type="button"
                  onClick={() => setBillingModel('')}
                  className="rounded hover:bg-cherry-200 text-cherry-500 p-0.5"
                >
                  <X size={11} />
                </button>
              </span>
            )}
            <span className="ml-auto text-xs font-semibold text-brand-400">
              Found <strong className="text-brand-700">{total.toLocaleString('en-US')}</strong>
              {' '}invoices
            </span>
          </div>
        )}
      </div>

      {canDeleteInvoices && selectedCount > 0 && (
        <div
          className={
            'flex flex-col gap-3 border-b border-cherry-200 bg-cherry-50/80 p-4 ' +
            'sm:flex-row sm:items-center sm:justify-between shadow-2xs'
          }
        >
          <div>
            <p className="font-extrabold text-cherry-800">
              {selectedCount} invoices selected
            </p>
            <p className="text-xs font-semibold text-cherry-600">
              Selected invoices can be moved to Trash together.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="btn-secondary !bg-white" onClick={onClearSelection}>
              <X size={15} /> Clear selection
            </button>
            <button
              className="btn bg-rose-600 text-white hover:bg-rose-700 shadow-sm"
              onClick={onOpenBulkDelete}
            >
              <Trash2 size={15} /> Move to Trash
            </button>
          </div>
        </div>
      )}
    </>
  );
}
