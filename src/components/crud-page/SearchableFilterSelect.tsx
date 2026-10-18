import { Check, ChevronDown, Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import type { TableFilterOption } from '~/types';

interface SearchableFilterSelectProps {
  label: string;
  placeholder?: string;
  options: TableFilterOption[];
  value: string;
  onChange: (value: string | undefined) => void;
  className?: string;
}

export function SearchableFilterSelect({
  label,
  placeholder,
  options,
  value,
  onChange,
  className,
}: SearchableFilterSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isActive = Boolean(value && value !== 'ALL');

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const selectedOption = useMemo(() => {
    if (!value || value === 'ALL') return null;
    return options.find((opt) => String(opt.value) === String(value));
  }, [options, value]);

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((opt) => opt.label.toLowerCase().includes(q));
  }, [options, query]);

  const defaultPlaceholder = placeholder || `All ${label}`;

  return (
    <div ref={wrapperRef} className={clsx('relative min-w-[145px] sm:min-w-[165px]', className)}>
      <div
        onClick={() => {
          setOpen((prev) => !prev);
          if (!open) {
            setTimeout(() => inputRef.current?.focus(), 50);
          }
        }}
        className={clsx(
          'group flex items-center justify-between gap-1.5 cursor-pointer rounded-xl border px-3 py-2 text-xs font-bold transition shadow-2xs select-none',
          isActive
            ? 'border-cherry-400 bg-cherry-50/70 text-cherry-900 hover:bg-cherry-100/70 focus-within:ring-2 focus-within:ring-cherry-300'
            : 'border-brand-200 bg-white text-brand-700 hover:border-brand-300 hover:bg-brand-50/50 focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-200'
        )}
      >
        <span className="truncate max-w-[180px]">
          {selectedOption ? selectedOption.label : defaultPlaceholder}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {isActive ? (
            <button
              type="button"
              aria-label="Clear filter"
              onClick={(e) => {
                e.stopPropagation();
                onChange(undefined);
              }}
              className="rounded p-0.5 text-cherry-600 hover:bg-cherry-200/60 transition"
              title="Clear selection"
            >
              <X size={13} />
            </button>
          ) : null}
          <ChevronDown
            size={14}
            className={clsx(
              'transition-transform duration-150',
              open && 'rotate-180',
              isActive ? 'text-cherry-600' : 'text-brand-400 group-hover:text-brand-600'
            )}
          />
        </div>
      </div>

      {open && (
        <div className="absolute left-0 top-full z-[100] mt-1.5 w-64 max-w-[90vw] rounded-2xl border border-brand-200 bg-white p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-100">
          <div className="relative mb-2">
            <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-brand-400" />
            <input
              ref={inputRef}
              type="text"
              className="w-full rounded-xl border border-brand-200 bg-brand-50/40 pl-8 pr-7 py-1.5 text-xs font-semibold text-brand-900 placeholder:text-brand-400 focus:border-cherry-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cherry-100"
              placeholder={`Search ${label.toLowerCase()}...`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-brand-400 hover:text-brand-700"
              >
                <X size={12} />
              </button>
            )}
          </div>

          <div className="max-h-56 overflow-y-auto space-y-0.5 scrollbar-thin pr-0.5">
            {/* "All" reset option */}
            <button
              type="button"
              onClick={() => {
                onChange(undefined);
                setOpen(false);
                setQuery('');
              }}
              className={clsx(
                'flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-xs font-bold transition',
                !isActive ? 'bg-brand-100 text-brand-900' : 'text-brand-600 hover:bg-brand-50'
              )}
            >
              <span>{defaultPlaceholder}</span>
              {!isActive && <Check size={14} className="text-brand-700 shrink-0" />}
            </button>

            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <button
                    type="button"
                    key={String(opt.value)}
                    onClick={() => {
                      onChange(String(opt.value));
                      setOpen(false);
                      setQuery('');
                    }}
                    className={clsx(
                      'flex w-full items-center justify-between gap-2 rounded-xl px-2.5 py-1.5 text-left text-xs font-semibold transition',
                      isSelected
                        ? 'bg-cherry-50 text-cherry-900 font-bold'
                        : 'text-brand-800 hover:bg-brand-50'
                    )}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && <Check size={14} className="text-cherry-600 shrink-0" />}
                  </button>
                );
              })
            ) : (
              <p className="py-4 text-center text-xs text-brand-400 font-medium">
                No results for "{query}"
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
