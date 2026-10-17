import React from 'react';
import type { FieldConfig } from '~/types';
import { SearchableSelect } from './SearchableSelect';
import { FileUploadInput } from './FileUploadInput';
import { MultiImageUploadInput } from './MultiImageUploadInput';
import { OrderVariantQuantitySelector } from './OrderVariantQuantitySelector';
import { AdditionalFeesSelector } from './AdditionalFeesSelector';
import { TagInput } from './TagInput';

interface FormModalFieldProps {
  field: FieldConfig;
  form: Record<string, any>;
  set: (name: string, value: any) => void;
  entityType?: string;
}

const isFieldDisabled = (f: FieldConfig, state: any) =>
  typeof f.disabled === 'function' ? f.disabled(state) : f.disabled;

const formatCurrency = (val: any) =>
  val != null ? String(val).replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '';

export function FormModalField({ field, form, set, entityType }: FormModalFieldProps) {
  const disabled = isFieldDisabled(field, form);

  if (field.type === 'textarea') {
    return (
      <textarea
        className="input min-h-24"
        required={field.required}
        value={form[field.name] ?? ''}
        onChange={(event) => set(field.name, event.target.value)}
        placeholder={field.placeholder}
      />
    );
  }

  if (field.type === 'select' && (field.searchable || field.loadOptions)) {
    return (
      <SearchableSelect
        value={form[field.name]}
        options={field.options}
        loadOptions={field.loadOptions}
        disabled={disabled}
        onChange={(value, option) => {
          set(field.name, value);
          if (option) set(`${field.name}_option`, option);
          if (field.onChange) field.onChange(value, option, set, form);
        }}
        placeholder={`Search ${field.label.toLowerCase()}...`}
        form={form}
      />
    );
  }

  if (field.type === 'select') {
    return (
      <select
        className="input"
        required={field.required}
        disabled={disabled}
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
    );
  }

  if (field.type === 'toggle') {
    return (
      <div className="flex h-[42px] items-center">
        <button
          type="button"
          role="switch"
          disabled={disabled}
          aria-checked={Boolean(form[field.name])}
          onClick={() => set(field.name, !form[field.name])}
          className={
            'relative inline-flex h-6 w-11 shrink-0 cursor-pointer ' +
            'items-center rounded-full border-2 border-transparent ' +
            'transition-colors duration-200 ease-in-out ' +
            'focus:outline-none focus:ring-2 focus:ring-cherry-500 ' +
            'disabled:cursor-not-allowed disabled:opacity-50 ' +
            (form[field.name] ? 'bg-cherry-500' : 'bg-brand-200')
          }
        >
          <span
            className={
              'pointer-events-none inline-block h-5 w-5 transform ' +
              'rounded-full bg-white shadow ring-0 transition ' +
              'duration-200 ease-in-out ' +
              (form[field.name] ? 'translate-x-5' : 'translate-x-0')
            }
          />
        </button>
        <span className="ml-3 text-sm font-bold text-brand-700">
          {form[field.name] ? 'Active' : 'Inactive'}
        </span>
      </div>
    );
  }

  if (field.type === 'datetimerange') {
    return (
      <div className="flex flex-col sm:flex-row items-center gap-2">
        <input
          className="input"
          type="datetime-local"
          required={field.required}
          disabled={disabled}
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
          disabled={disabled}
          value={form[field.name]?.[1] ?? ''}
          onChange={(event) => {
            const range = form[field.name] || ['', ''];
            set(field.name, [range[0], event.target.value]);
          }}
        />
      </div>
    );
  }

  if (field.type === 'currency') {
    return (
      <div className="relative">
        <span
          className={
            'pointer-events-none absolute inset-y-0 left-0 flex ' +
            'items-center pl-3 text-sm font-bold text-slate-400'
          }
        >
          Rp.
        </span>
        <input
          className="input !pl-10"
          type="text"
          required={field.required}
          disabled={disabled}
          value={formatCurrency(form[field.name])}
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
    );
  }

  if (field.type === 'images') {
    return (
      <MultiImageUploadInput
        value={form[field.name]}
        onChange={(urls) => {
          set(field.name, urls);
          if (field.onChange) {
            field.onChange(urls, undefined, set, form);
          }
        }}
        entityType={(field.entityType || entityType || 'products') as any}
        placeholder={field.placeholder}
        disabled={disabled}
      />
    );
  }

  if (field.type === 'variant-quantities') {
    return (
      <OrderVariantQuantitySelector
        value={form[field.name]}
        onChange={(items) => {
          set(field.name, items);
          if (field.onChange) {
            field.onChange(items, undefined, set, form);
          }
        }}
        form={form}
        disabled={disabled}
      />
    );
  }

  if (field.type === 'additional-fees') {
    return (
      <AdditionalFeesSelector
        value={form[field.name]}
        onChange={(items) => {
          set(field.name, items);
          if (field.onChange) {
            field.onChange(items, undefined, set, form);
          }
        }}
        disabled={disabled}
      />
    );
  }

  if (field.type === 'tags') {
    return (
      <TagInput
        value={form[field.name]}
        onChange={(val) => {
          set(field.name, val);
          if (field.onChange) {
            field.onChange(val, undefined, set, form);
          }
        }}
        placeholder={field.placeholder}
        disabled={disabled}
      />
    );
  }

  const isUploadField =
    field.type === 'file' ||
    field.type === 'image' ||
    field.type === 'document' ||
    Boolean(field.fileType);

  if (isUploadField) {
    const allowedType =
      field.fileType ||
      (field.type === 'image'
        ? 'image'
        : field.type === 'document'
        ? 'document'
        : 'all');
    return (
      <FileUploadInput
        value={form[field.name] || ''}
        onChange={(url) => {
          set(field.name, url);
          if (field.onChange) {
            field.onChange(url, undefined, set, form);
          }
        }}
        entityType={(field.entityType || entityType || 'misc') as any}
        allowedType={allowedType}
        placeholder={field.placeholder}
      />
    );
  }

  return (
    <input
      className="input"
      type={field.type || 'text'}
      required={field.required}
      disabled={disabled}
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
  );
}
