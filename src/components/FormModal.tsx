import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2 } from 'lucide-react';
import type { FieldConfig } from '~/types';
import { FormModalField } from './FormModalField';

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
      const defaults = Object.fromEntries(
        fields.map((field) => [
          field.name,
          typeof field.defaultValue === 'function'
            ? field.defaultValue()
            : (field.defaultValue ?? ''),
        ])
      );
      setForm({ ...defaults, ...(initial || {}) });
    }
  }, [open, initial, fields]);

  if (!open) return null;

  const set = (name: string, value: any) =>
    setForm((current) => ({ ...current, [name]: value }));

  return createPortal(
    <div
      className={
        'fixed inset-0 z-[100] flex items-end justify-center ' +
        'bg-brand-950/40 p-0 backdrop-blur-sm sm:items-center sm:p-4'
      }
    >
      <div
        className={
          'max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-t-3xl ' +
          'bg-white shadow-2xl sm:rounded-3xl border border-brand-100'
        }
      >
        <div
          className={
            'flex items-center justify-between border-b border-brand-100 ' +
            'px-6 py-4 bg-brand-50/40'
          }
        >
          <div>
            <h2 className="text-lg font-black text-brand-900">{title}</h2>
            <p className="text-xs text-brand-500">Fill in details and save changes.</p>
          </div>
          <button
            onClick={onClose}
            className={
              'rounded-xl p-2 text-brand-400 hover:bg-brand-100 ' +
              'hover:text-brand-700 transition'
            }
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
                  <div
                    key={field.name}
                    className={field.colSpan === 2 ? 'sm:col-span-2' : ''}
                  >
                    <label className="label">
                      {field.label}
                      {field.required && <span className="text-rose-500"> *</span>}
                    </label>
                    <FormModalField
                      field={field}
                      form={form}
                      set={set}
                      entityType={entityType}
                    />
                  </div>
                ))}
            </div>
          </div>
          <div
            className={
              'flex shrink-0 justify-end gap-2 border-t border-brand-100 ' +
              'bg-brand-50/50 p-6 sm:rounded-b-3xl'
            }
          >
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center gap-2"
            >
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
