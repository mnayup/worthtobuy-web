import { Check, ChevronDown, LoaderCircle, Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Option } from '~/types';
import { useDebouncedValue } from '~/hooks/useDebouncedValue';

type Props = {
  name?: string;
  value: string | number | null | undefined;
  options?: Option[];
  selectedOption?: Option | null;
  loadOptions?: (search: string, form?: Record<string, any>, page?: number) => Promise<Option[]>;
  onChange: (value: string | number | '', option?: Option) => void;
  placeholder: string;
  disabled?: boolean;
  form?: Record<string, any>;
  allowCustom?: boolean;
};

export function SearchableSelect({
  name,
  value,
  options = [],
  selectedOption,
  loadOptions,
  onChange,
  placeholder,
  disabled,
  form,
  allowCustom,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [remote, setRemote] = useState<Option[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebouncedValue(query.trim(), 250);

  useEffect(() => {
    function outside(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', outside);
    return () => document.removeEventListener('mousedown', outside);
  }, []);

  // Initial / Query changed fetch (Page 1)
  useEffect(() => {
    if (!loadOptions) return;
    if (!open && !value) return;

    let active = true;
    setLoading(true);
    setPage(1);
    setHasMore(true);

    loadOptions(debouncedQuery, form, 1)
      .then((rows) => {
        if (active) {
          setRemote(rows);
          // If rows returned is less than 10, no more pages
          setHasMore(rows.length >= 10);
        }
      })
      .catch(() => {
        if (active) {
          setRemote([]);
          setHasMore(false);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [open, debouncedQuery, loadOptions, form]);

  // Load next page on scroll to bottom
  const handleScroll = () => {
    if (!scrollContainerRef.current || !loadOptions || loading || loadingMore || !hasMore) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 30) {
      const nextPage = page + 1;
      setLoadingMore(true);
      loadOptions(debouncedQuery, form, nextPage)
        .then((nextRows) => {
          if (!nextRows || nextRows.length === 0) {
            setHasMore(false);
          } else {
            setRemote((prev) => {
              const existingValues = new Set(prev.map((r) => String(r.value)));
              const newUnique = nextRows.filter((r) => !existingValues.has(String(r.value)));
              return [...prev, ...newUnique];
            });
            setPage(nextPage);
            setHasMore(nextRows.length >= 10);
          }
        })
        .catch(() => {
          setHasMore(false);
        })
        .finally(() => {
          setLoadingMore(false);
        });
    }
  };

  const merged = useMemo(() => {
    const map = new Map<string, Option>();
    for (const option of [...options, ...remote]) map.set(String(option.value), option);
    const rows = [...map.values()];
    if (loadOptions) return rows;
    const normalized = query.toLowerCase();
    return normalized
      ? rows.filter(
          (option) =>
            option.label.toLowerCase().includes(normalized) ||
            option.subLabel?.toLowerCase().includes(normalized)
        )
      : rows;
  }, [options, remote, query, loadOptions]);

  const selected = useMemo(() => {
    // 1. Direct selectedOption prop if passed and matching value
    if (selectedOption && String(selectedOption.value) === String(value ?? '')) {
      return selectedOption;
    }

    const list = [...options, ...remote];
    const found = list.find((option) => String(option.value) === String(value ?? ''));
    if (found) return found;

    // Check if form contains pre-populated option for this field
    if (name && form?.[`${name}_option`]) {
      const formOption = form[`${name}_option`];
      if (String(formOption.value) === String(value ?? '')) {
        return formOption;
      }
    }

    // Check if selectedOption has label even if value mismatch due to type conversion
    if (selectedOption?.label && value) {
      return selectedOption;
    }

    return undefined;
  }, [options, remote, value, name, form, selectedOption]);

  const displayValue = useMemo(() => {
    if (open) return query;
    if (selected?.label) return selected.label;
    if (selectedOption?.label) return selectedOption.label;
    if (!value) return '';
    if (allowCustom) return String(value);
    if (loading) return 'Loading...';
    return '';
  }, [open, query, selected, selectedOption, value, allowCustom, loading]);

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-400" size={16} />
        <input
          className="input !pl-10 !pr-18"
          style={{ paddingLeft: '2.5rem', paddingRight: '4.5rem' }}
          disabled={disabled}
          value={displayValue}
          onFocus={() => {
            setOpen(true);
            setQuery(allowCustom && value ? String(value) : '');
          }}
          onChange={(event) => {
            const next = event.target.value;
            setQuery(next);
            setOpen(true);
            if (allowCustom) {
              onChange(next);
            }
          }}
          placeholder={placeholder}
          autoComplete="off"
        />
        {value !== '' && value !== null && value !== undefined ? (
          <button
            type="button"
            disabled={disabled}
            aria-label="Clear selection"
            className="absolute right-9 top-1/2 -translate-y-1/2 rounded-full p-1 text-brand-400 hover:bg-brand-100/70 hover:text-brand-700 transition disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => {
              onChange('');
              setQuery('');
            }}
          >
            <X size={14} />
          </button>
        ) : null}
        <button
          type="button"
          disabled={disabled}
          aria-label="Open options"
          className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-brand-400 hover:bg-brand-50 hover:text-brand-600 transition disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => {
            setOpen((current) => !current);
            setQuery(allowCustom && value ? String(value) : '');
          }}
        >
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${open ? 'rotate-180 text-brand-700' : ''}`}
          />
        </button>
      </div>
      {open && (
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="absolute z-[90] mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-brand-200 bg-white p-1 shadow-2xl scrollbar-thin"
        >
          {loading && (
            <div className="flex items-center gap-2 px-3 py-3 text-sm font-semibold text-brand-500">
              <LoaderCircle className="animate-spin text-cherry-500" size={16} />
              Searching options...
            </div>
          )}
          {!loading && merged.length ? (
            <>
              {merged.map((option) => {
                const active = String(option.value) === String(value ?? '');
                return (
                  <button
                    type="button"
                    key={String(option.value)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-semibold transition ${
                      active ? 'bg-cherry-50 text-cherry-700 font-bold' : 'text-brand-700 hover:bg-brand-50'
                    }`}
                    onClick={() => {
                      onChange(option.value, option);
                      setOpen(false);
                      setQuery('');
                    }}
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="truncate">{option.label}</span>
                        {option.tag && (
                          <span
                            className={`rounded px-1.5 py-0.2 text-[9px] font-black uppercase tracking-wider shrink-0 flex items-center gap-1 border ${
                              option.tagColor || 'bg-amber-100 text-amber-800 border-amber-300/80'
                            }`}
                          >
                            {option.tagIcon || (!option.tagColor && <span className="text-amber-500">✨</span>)} {option.tag}
                          </span>
                        )}
                      </div>
                      {option.subLabel && (
                        <span className="text-[11px] font-mono text-brand-400 font-normal truncate">
                          {option.subLabel}
                        </span>
                      )}
                    </div>
                    {active && <Check size={16} className="shrink-0 text-cherry-600" />}
                  </button>
                );
              })}
              {loadingMore && (
                <div className="flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-brand-400">
                  <LoaderCircle className="animate-spin text-cherry-500" size={14} />
                  Loading more items...
                </div>
              )}
            </>
          ) : (
            !loading && <p className="px-3 py-4 text-center text-sm text-brand-400">No matching options found.</p>
          )}
        </div>
      )}
    </div>
  );
}
