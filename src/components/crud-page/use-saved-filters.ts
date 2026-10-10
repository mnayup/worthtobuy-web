import { useState } from 'react';
import type { SavedFilter } from './crud-filters.helper';

export function useSavedFilters(endpoint: string) {
  const storageKey = `wtb_saved_filters_${endpoint.replaceAll('/', '_')}`;
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || '[]');
    } catch {
      return [];
    }
  });

  const saveFilter = (search: string, columnFilters: Record<string, string>) => {
    const name = prompt('Saved filter name:');
    if (!name?.trim()) return;
    const next = [
      ...savedFilters.filter((item) => item.name !== name.trim()),
      { name: name.trim(), search, filters: columnFilters },
    ];
    setSavedFilters(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  };

  const deleteFilter = (name: string) => {
    const next = savedFilters.filter((item) => item.name !== name);
    setSavedFilters(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  };

  return { savedFilters, saveFilter, deleteFilter };
}
