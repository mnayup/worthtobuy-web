import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Boxes,
  CircleDollarSign,
  ClipboardList,
  FileText,
  PackageCheck,
  PackageSearch,
  ReceiptText,
  RotateCcw,
  ScrollText,
  Search,
  Truck,
  UserCog,
  Users,
  WalletCards,
  X,
} from 'lucide-react';
import { api, errorMessage } from '~/lib/api';
import { PageHeader } from '~/components/PageHeader';
import { useDebouncedValue } from '~/hooks/useDebouncedValue';
import type { SearchResponse } from './types';

const icons: Record<string, typeof Search> = {
  periods: ClipboardList,
  customers: Users,
  products: Boxes,
  orders: ReceiptText,
  invoices: FileText,
  items: PackageSearch,
  purchases: PackageCheck,
  payments: WalletCards,
  shipments: Truck,
  expenses: CircleDollarSign,
  refunds: RotateCcw,
  users: UserCog,
};

const browsePaths: Record<string, string> = {
  periods: '/periods',
  customers: '/customers',
  products: '/products',
  orders: '/orders',
  invoices: '/invoices',
  items: '/orders',
  purchases: '/purchases',
  payments: '/payments',
  shipments: '/shipments',
  expenses: '/expenses',
  refunds: '/refunds',
  users: '/users',
};

export async function loader(query: string): Promise<SearchResponse> {
  if (query.length < 2) {
    return { query, total: 0, groups: [] };
  }
  const response = await api.get<SearchResponse>(`/search?q=${encodeURIComponent(query)}`);
  return response.data;
}

export default function SearchRoute() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const debouncedQuery = useDebouncedValue(query.trim(), 350);
  const [data, setData] = useState<SearchResponse>({ query: '', total: 0, groups: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    if (debouncedQuery.length < 2) {
      setData({ query: debouncedQuery, total: 0, groups: [] });
      setError('');
      return;
    }
    setLoading(true);
    try {
      const result = await loader(debouncedQuery);
      setData(result);
      setError('');
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (debouncedQuery) next.set('q', debouncedQuery);
    else next.delete('q');
    if (next.toString() !== searchParams.toString()) setSearchParams(next, { replace: true });
    load();
  }, [debouncedQuery]);

  return (
    <div className="animate-rise space-y-6">
      <PageHeader
        title="Global Search"
        description="Search across orders, customers, products, invoices, tracking numbers, and financial logs."
      />

      <div className="card p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-400" size={19} />
            <input
              autoFocus
              className="input !pl-11 !pr-11"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by customer name, order number, product SKU, invoice, tracking..."
            />
            {query && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-brand-400 hover:bg-brand-50 hover:text-brand-700 transition"
              >
                <X size={17} />
              </button>
            )}
          </div>
        </div>
        <p className="mt-2.5 text-xs font-semibold text-brand-500">
          Enter at least 2 characters. Results update automatically as you type.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-cherry-200 bg-cherry-50 p-4 text-sm font-bold text-cherry-700 shadow-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid min-h-64 place-items-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-100 border-t-cherry-500" />
        </div>
      ) : debouncedQuery.length < 2 ? (
        <EmptyState
          title="Enter search keywords"
          description="Search across orders, customers, items, receipts, and shipments."
        />
      ) : data.groups.length ? (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-brand-600">
              Found <strong className="text-brand-900 font-black">{data.total}</strong> results for “{data.query}”.
            </p>
          </div>
          <div className="grid gap-5 xl:grid-cols-2">
            {data.groups.map((group) => {
              const Icon = icons[group.key] || Search;
              return (
                <section className="card overflow-hidden" key={group.key}>
                  <div className="flex items-center justify-between border-b border-brand-100 bg-brand-50/50 px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-white p-2.5 text-brand-700 shadow-xs border border-brand-100">
                        <Icon size={19} />
                      </div>
                      <div>
                        <h2 className="font-black text-brand-900">{group.label}</h2>
                        <p className="text-xs font-semibold text-brand-500">{group.items.length} top results</p>
                      </div>
                    </div>
                    {browsePaths[group.key] && (
                      <button
                        onClick={() => navigate(`${browsePaths[group.key]}?search=${encodeURIComponent(data.query)}`)}
                        className="text-xs font-black text-cherry-600 hover:text-cherry-700 transition"
                      >
                        View all
                      </button>
                    )}
                  </div>
                  <div className="divide-y divide-brand-50">
                    {group.items.map((item) => (
                      <button
                        key={`${group.key}-${item.id}`}
                        onClick={() => navigate(item.href)}
                        className="block w-full px-5 py-3.5 text-left transition hover:bg-brand-50/70"
                      >
                        <p className="text-sm font-bold text-brand-900">{item.title}</p>
                        <p className="mt-1 text-xs font-medium text-brand-500">{item.subtitle}</p>
                      </button>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </>
      ) : (
        <EmptyState
          title="No matching records found"
          description={`No records match “${debouncedQuery}”. Try a different keyword.`}
        />
      )}
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="card grid min-h-64 place-items-center p-8 text-center">
      <div>
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-400">
          <Search size={28} />
        </div>
        <p className="mt-4 font-black text-brand-800 text-base">{title}</p>
        <p className="mt-1 text-sm font-medium text-brand-500">{description}</p>
      </div>
    </div>
  );
}
