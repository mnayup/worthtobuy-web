import { useEffect, useState } from 'react';
import { BookmarkPlus, Trash2 } from 'lucide-react';

type SavedView = { name: string; values: Record<string, string> };

type Props = {
  storageKey: string;
  values: Record<string, string>;
  onApply: (values: Record<string, string>) => void;
};

export function SavedFilterControls({ storageKey, values, onApply }: Props) {
  const [saved, setSaved] = useState<SavedView[]>([]);
  const [selected, setSelected] = useState('');

  useEffect(() => {
    try {
      setSaved(JSON.parse(localStorage.getItem(storageKey) || '[]'));
    } catch {
      setSaved([]);
    }
    setSelected('');
  }, [storageKey]);

  function persist(next: SavedView[]) {
    setSaved(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  }

  function save() {
    const name = window.prompt('Saved filter view name:')?.trim();
    if (!name) return;
    const next = [...saved.filter((item) => item.name !== name), { name, values }].slice(-12);
    persist(next);
    setSelected(name);
  }

  function apply(name: string) {
    setSelected(name);
    const item = saved.find((row) => row.name === name);
    if (item) onApply(item.values);
  }

  function remove() {
    if (!selected) return;
    persist(saved.filter((item) => item.name !== selected));
    setSelected('');
  }

  return (
    <div className="flex min-w-0 flex-wrap gap-2">
      {saved.length > 0 && (
        <select
          className="input min-w-44 flex-1 text-xs font-bold"
          value={selected}
          onChange={(event) => apply(event.target.value)}
        >
          <option value="">Saved Views</option>
          {saved.map((item) => (
            <option key={item.name} value={item.name}>
              {item.name}
            </option>
          ))}
        </select>
      )}
      <button type="button" className="btn-secondary whitespace-nowrap text-xs" onClick={save}>
        <BookmarkPlus size={15} className="text-brand-500" />
        Save View
      </button>
      {selected && (
        <button
          type="button"
          aria-label="Delete saved view"
          className="btn-secondary !px-2.5 text-xs text-rose-600 hover:bg-rose-50 hover:border-rose-200"
          onClick={remove}
        >
          <Trash2 size={15} />
        </button>
      )}
    </div>
  );
}
