import type { ColumnConfig } from '~/types';

export type SortDirection = 'asc' | 'desc' | null;

export function sortRows<T extends Record<string, any>>(
  rows: T[],
  activeSortKey: string | null,
  activeSortDir: SortDirection,
  columns: ColumnConfig[]
): T[] {
  if (!activeSortKey || !activeSortDir || !rows.length) return rows;
  const col = columns.find((c) => c.key === activeSortKey);
  const multiplier = activeSortDir === 'asc' ? 1 : -1;

  return [...rows].sort((a, b) => {
    if (col?.sortFn) {
      return col.sortFn(a, b) * multiplier;
    }
    const rawA = a[col?.sortKey || activeSortKey];
    const rawB = b[col?.sortKey || activeSortKey];

    if (rawA === rawB) return 0;
    if (rawA === undefined || rawA === null || rawA === '') return 1;
    if (rawB === undefined || rawB === null || rawB === '') return -1;

    // Numbers
    if (typeof rawA === 'number' && typeof rawB === 'number') {
      return (rawA - rawB) * multiplier;
    }

    // Currency or numeric string checks
    if (typeof rawA === 'string' && typeof rawB === 'string') {
      const isCurr =
        /^[Rp$\s\d.,-]+$/i.test(rawA.trim()) && /^[Rp$\s\d.,-]+$/i.test(rawB.trim());
      if (isCurr) {
        const numA = parseFloat(rawA.replace(/[^0-9.-]+/g, ''));
        const numB = parseFloat(rawB.replace(/[^0-9.-]+/g, ''));
        if (!isNaN(numA) && !isNaN(numB)) {
          return (numA - numB) * multiplier;
        }
      }

      // ISO dates
      const timeA = Date.parse(rawA);
      const timeB = Date.parse(rawB);
      if (!isNaN(timeA) && !isNaN(timeB) && rawA.includes('-') && rawB.includes('-')) {
        return (timeA - timeB) * multiplier;
      }

      return (
        rawA.localeCompare(rawB, undefined, { numeric: true, sensitivity: 'base' }) *
        multiplier
      );
    }

    return (rawA > rawB ? 1 : -1) * multiplier;
  });
}
