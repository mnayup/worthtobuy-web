import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2 } from 'lucide-react';
import type { FieldConfig } from '~/types';
import { SearchableSelect } from './SearchableSelect';
import { FileUploadInput } from './FileUploadInput';

export function FormModal({
  open,
  title,
  fields,
  initial,
  onClose,
  onSubmit,
  loading,
  entityType,
}: {
  open: boolean;
  title: string;
  fields: FieldConfig[];
  initial?: Record<string, any> | null;
  onClose: () => void;
  onSubmit: (data: Record<string, any>) => void;
  loading?: boolean;
  entityType?: string;
}) {
  const [form, setForm] = useState<Record<string, any>>({});

  useEffect(() => {
    if (open) {
      const defaults = Object.fromEntries(fields.map((field) => [field.name, typeof field.defaultValue === 'function' ? field.defaultValue() : (field.defaultValue ?? '')]));
      setForm({ ...defaults, ...(initial || {}) });
    }
  }, [open, initial, fields]);

  if (!open) return null;

  const set = (name: string, value: any) => setForm((current) => ({ ...current, [name]: value }));

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-brand-950/40 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl border border-brand-100">
        <div className="flex items-center justify-between border-b border-brand-100 px-6 py-4 bg-brand-50/40">
          <div>
            <h2 className="text-lg font-black text-brand-900">{title}</h2>
            <p className="text-xs text-brand-500">Fill in details and save changes.</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-brand-400 hover:bg-brand-100 hover:text-brand-700 transition"
          >
            <X size={20} />
          </button>
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit(form);
          }}
          className="flex max-h-[calc(92vh-82px)] flex-col"
        >
          <div className="scrollbar-thin overflow-y-auto p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {fields
                .filter((field) => !field.dependsOn || field.dependsOn(form))
                .map((field) => (
                  <div key={field.name} className={field.colSpan === 2 ? 'sm:col-span-2' : ''}>
                    <label className="label">
                      {field.label}
                      {field.required && <span className="text-rose-500"> *</span>}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea
                        className="input min-h-24"
                        required={field.required}
                        value={form[field.name] ?? ''}
                        onChange={(event) => set(field.name, event.target.value)}
                        placeholder={field.placeholder}
                      />
                    ) : field.type === 'select' && (field.searchable || field.loadOptions) ? (
                      <SearchableSelect
                        value={form[field.name]}
                        options={field.options}
                        loadOptions={field.loadOptions}
                        disabled={typeof field.disabled === 'function' ? field.disabled(form) : field.disabled}
                        onChange={(value, option) => {
                          set(field.name, value);
                          if (option) set(`${field.name}_option`, option);
                          if (field.onChange) field.onChange(value, option, set, form);
                        }}
                        placeholder={`Search ${field.label.toLowerCase()}...`}
                        form={form}
                      />
                    ) : field.type === 'select' ? (
                      <select
                        className="input"
                        required={field.required}
                        disabled={typeof field.disabled === 'function' ? field.disabled(form) : field.disabled}
                        value={form[field.name] ?? ''}
                        onChange={(event) => {
                          set(field.name, event.target.value);
                          if (field.onChange) field.onChange(event.target.value, undefined, set, form);
                        }}
                      >
                        <option value="">Select {field.label.toLowerCase()}</option>
                        {field.options?.map((option) => (
                          <option key={String(option.value)} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : field.type === 'toggle' ? (
                      <div className="flex h-[42px] items-center">
                        <button
                          type="button"
                          role="switch"
                          disabled={typeof field.disabled === 'function' ? field.disabled(form) : field.disabled}
                          aria-checked={Boolean(form[field.name])}
                          onClick={() => set(field.name, !form[field.name])}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-cherry-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                            form[field.name] ? 'bg-cherry-500' : 'bg-brand-200'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              form[field.name] ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                        <span className="ml-3 text-sm font-bold text-brand-700">
                          {form[field.name] ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    ) : field.type === 'datetimerange' ? (
                      <div className="flex flex-col sm:flex-row items-center gap-2">
                        <input
                          className="input"
                          type="datetime-local"
                          required={field.required}
                          disabled={typeof field.disabled === 'function' ? field.disabled(form) : field.disabled}
                          value={form[field.name]?.[0] ?? ''}
                          onChange={(event) => {
                            const range = form[field.name] || ['', ''];
                            set(field.name, [event.target.value, range[1]]);
                          }}
                        />
                        <span className="text-xs font-bold text-brand-400">TO</span>
                        <input
                          className="input"
                          type="datetime-local"
                          required={field.required}
                          disabled={typeof field.disabled === 'function' ? field.disabled(form) : field.disabled}
                          value={form[field.name]?.[1] ?? ''}
                          onChange={(event) => {
                            const range = form[field.name] || ['', ''];
                            set(field.name, [range[0], event.target.value]);
                          }}
                        />
                      </div>
                    ) : field.type === 'currency' ? (
                      <div className="relative">
                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm font-bold text-slate-400">
                          Rp.
                        </span>
                        <input
                          className="input !pl-10"
                          type="text"
                          required={field.required}
                          disabled={typeof field.disabled === 'function' ? field.disabled(form) : field.disabled}
                          value={form[field.name] != null ? String(form[field.name]).replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''}
                          onChange={(event) => {
                            let val = event.target.value.replace(/\./g, '');
                            if (val && !/^\d+$/.test(val)) return;
                            const numValue = val ? parseInt(val, 10) : '';
                            set(field.name, numValue);
                            if (field.onChange) {
                              field.onChange(numValue, undefined, set, form);
                            }
                          }}
                          placeholder={field.placeholder || '0'}
                        />
                      </div>
                    ) : field.type === 'file' || field.type === 'image' || field.type === 'document' || field.fileType ? (
                      <FileUploadInput
                        value={form[field.name] || ''}
                        onChange={(url) => {
                          set(field.name, url);
                          if (field.onChange) {
                            field.onChange(url, undefined, set, form);
                          }
                        }}
                        entityType={(field.entityType || entityType || 'misc') as any}
                        allowedType={field.fileType || (field.type === 'image' ? 'image' : field.type === 'document' ? 'document' : 'all')}
                        placeholder={field.placeholder}
                      />
                    ) : (
                      <input
                        className="input"
                        type={field.type || 'text'}
                        required={field.required}
                        disabled={typeof field.disabled === 'function' ? field.disabled(form) : field.disabled}
                        max={typeof field.max === 'function' ? field.max(form) : field.max}
                        value={form[field.name] ?? ''}
                        onChange={(event) => {
                          let val = event.target.value;
                          if (field.type === 'tel') {
                            val = val.replace(/[^\d+]/g, '');
                          }
                          set(field.name, val);
                          if (field.onChange) {
                            field.onChange(val, undefined, set, form);
                          }
                        }}
                        placeholder={field.placeholder}
                      />
                    )}
                  </div>
                ))}
            </div>
          </div>
          <div className="flex shrink-0 justify-end gap-2 border-t border-brand-100 bg-brand-50/50 p-6 sm:rounded-b-3xl">
            <button type="button" onClick={onClose} disabled={loading} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
