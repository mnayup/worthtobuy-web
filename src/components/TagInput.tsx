import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface TagInputProps {
  value?: string | string[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function TagInput({
  value,
  onChange,
  placeholder = 'Add option...',
  disabled = false,
}: TagInputProps) {
  const [inputVal, setInputVal] = useState('');

  const tags: string[] = React.useMemo(() => {
    if (Array.isArray(value)) {
      return value.map((s) => String(s).trim()).filter(Boolean);
    }
    if (typeof value === 'string' && value.trim()) {
      return value
        .split(/[,;\n]/)
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [];
  }, [value]);

  const addTag = (text: string) => {
    const rawItems = text
      .split(/[,;\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!rawItems.length) return;

    const newTags = [...tags];
    for (const item of rawItems) {
      if (!newTags.some((t) => t.toLowerCase() === item.toLowerCase())) {
        newTags.push(item);
      }
    }
    onChange(newTags.join(', '));
    setInputVal('');
  };

  const removeTag = (idx: number) => {
    const newTags = tags.filter((_, i) => i !== idx);
    onChange(newTags.join(', '));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputVal);
    } else if (e.key === 'Backspace' && !inputVal && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  return (
    <div
      className={
        'min-h-[42px] w-full rounded-xl border border-brand-200 bg-white p-1.5 ' +
        'transition focus-within:border-cherry-500 focus-within:ring-2 ' +
        'focus-within:ring-cherry-100 flex flex-wrap items-center gap-1.5'
      }
    >
      {tags.map((tag, idx) => (
        <span
          key={`${tag}-${idx}`}
          className={
            'inline-flex items-center gap-1 rounded-lg bg-cherry-50 border ' +
            'border-cherry-200 px-2 py-1 text-xs font-bold text-cherry-800 ' +
            'shadow-xs animate-in fade-in zoom-in-95 duration-100'
          }
        >
          <span>{tag}</span>
          {!disabled && (
            <button
              type="button"
              onClick={() => removeTag(idx)}
              className={
                'rounded p-0.5 text-cherry-500 hover:bg-cherry-100 ' +
                'hover:text-cherry-800 transition cursor-pointer'
              }
              title="Remove bubble"
            >
              <X size={12} />
            </button>
          )}
        </span>
      ))}

      {!disabled && (
        <div className="flex items-center flex-1 min-w-[140px] gap-1">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              if (inputVal.trim()) addTag(inputVal);
            }}
            placeholder={tags.length === 0 ? placeholder : 'Type & press Enter...'}
            className={
              'w-full bg-transparent px-2 py-1 text-xs font-medium text-brand-900 ' +
              'placeholder:text-brand-300 focus:outline-none'
            }
          />
          {inputVal.trim() && (
            <button
              type="button"
              onClick={() => addTag(inputVal)}
              className={
                'shrink-0 rounded-lg bg-cherry-600 px-2 py-1 text-[11px] ' +
                'font-bold text-white hover:bg-cherry-700 transition cursor-pointer'
              }
            >
              <Plus size={12} className="inline mr-0.5" />
              Add
            </button>
          )}
        </div>
      )}
    </div>
  );
}
