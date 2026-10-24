import { Check, ChevronDown, LoaderCircle, Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Option } from '~/types';
import { useDebouncedValue } from '~/hooks/useDebouncedValue';

type Props = {
  value: string | number | null | undefined;
  options?: Option[];
  loadOptions?: (search: string, form?: Record<string, any>) => Promise<Option[]>;
  onChange: (value: string | number | '', option?: Option) => void;
  placeholder: string;
  disabled?: boolean;
  form?: Record<string, any>;
  allowCustom?: boolean;
};

export function SearchableSelect({
  value,
  options = [],
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
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebouncedValue(query.trim(), 250);

  useEffect(() => {
    function outside(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', outside);
    return () => document.removeEventListener('mousedown', outside);
  }, []);

  useEffect(() => {
    if (!loadOptions) return;
    if (!open && !value) return;

    let active = true;
    setLoading(true);
    loadOptions(debouncedQuery, form)
      .then((rows) => {
        if (active) setRemote(rows);
      })
      .catch(() => {
        if (active) setRemote([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [open, debouncedQuery, loadOptions, form]);

  const merged = useMemo(() => {
    const map = new Map<string, Option>();
    for (const option of [...options, ...remote]) map.set(String(option.value), option);
    const rows = [...map.values()];
    if (loadOptions) return rows;
    const normalized = query.toLowerCase();
    return normalized ? rows.filter((option) => option.label.toLowerCase().includes(normalized)) : rows;
  }, [options, remote, query, loadOptions]);

  const selected = useMemo(
    () => [...options, ...remote].find((option) => String(option.value) === String(value ?? '')),
    [options, remote, value]
  );

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-400" size={16} />
        <input
          className="input !pl-10 !pr-18"
          style={{ paddingLeft: '2.5rem', paddingRight: '4.5rem' }}
          disabled={disabled}
          value={open ? query : selected?.label || (value ? (allowCustom ? String(value) : `ID ${value}`) : '')}
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
        <div className="absolute z-[90] mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-brand-200 bg-white p-1 shadow-2xl scrollbar-thin">
          {loading && (
            <div className="flex items-center gap-2 px-3 py-3 text-sm font-semibold text-brand-500">
              <LoaderCircle className="animate-spin text-cherry-500" size={16} />
              Searching options...
            </div>
          )}
          {!loading && merged.length ? (
            merged.map((option) => {
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
                  <span className="truncate">{option.label}</span>
                  {active && <Check size={16} className="shrink-0 text-cherry-600" />}
                </button>
              );
            })
          ) : (
            !loading && <p className="px-3 py-4 text-center text-sm text-brand-400">No matching options found.</p>
          )}
        </div>
      )}
    </div>
  );
}
