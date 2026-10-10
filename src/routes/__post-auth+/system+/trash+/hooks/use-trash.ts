import { useState, useEffect, useMemo } from 'react';
import { api, errorMessage } from '~/lib/api';
import { runBulkAction } from '~/lib/bulk';
import { exportToExcel } from '~/lib/excel';
import { dateTime } from '~/lib/format';
import { useDebouncedValue } from '~/hooks/useDebouncedValue';
import { rowKey, typeLabels, type TrashItem } from '../types';

export type SortColumn = 'entityType' | 'code' | 'name' | 'deletedAt' | 'deletedByName';
export type SortDirection = 'asc' | 'desc' | null;

export async function fetchTrashLoader(params?: {
  search?: string;
  type?: string;
  page?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.search) query.set('search', params.search);
  if (params?.type) query.set('type', params.type);
  const response = await api.get(`/trash?${query}`);
  return response.data;
}

export async function trashAction(data: {
  intent: 'restore' | 'delete';
  entityType: string;
  id: string | number;
}) {
  if (data.intent === 'restore') {
    return api.post(`/trash/${data.entityType}/${data.id}/restore`);
  }
  if (data.intent === 'delete') {
    return api.delete(`/trash/${data.entityType}/${data.id}`);
  }
  return null;
}

export function useTrash() {
  const [rows, setRows] = useState<TrashItem[]>([]);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const debouncedSearch = useDebouncedValue(search.trim(), 350);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState({ all: 0, invoice: 0, transaction: 0 });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [permanent, setPermanent] = useState<any | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [bulkPermanentOpen, setBulkPermanentOpen] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    title?: string;
  } | null>(null);

  const [sortCol, setSortCol] = useState<SortColumn | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchTrashLoader({ search: debouncedSearch, type, page, limit });
      setRows(data.data || []);
      setTotal(Number(data.total || 0));
      setCounts(data.counts || { all: 0, invoice: 0, transaction: 0 });
      setSelectedKeys([]);
    } catch (caught) {
      setToast({ message: errorMessage(caught), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    setSelectedKeys([]);
  }, [debouncedSearch, type]);

  useEffect(() => {
    load();
  }, [debouncedSearch, type, page, limit]);

  const handleSortToggle = (col: SortColumn) => {
    if (sortCol === col) {
      if (sortDir === 'asc') setSortDir('desc');
      else if (sortDir === 'desc') {
        setSortCol(null);
        setSortDir(null);
      } else {
        setSortDir('asc');
      }
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
  };

  const sortedRows = useMemo(() => {
    if (!sortCol || !sortDir || !rows.length) return rows;
    const factor = sortDir === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      let valA: any = a[sortCol] || '';
      let valB: any = b[sortCol] || '';

      if (sortCol === 'deletedAt') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
        return (valA - valB) * factor;
      }

      return (
        String(valA).localeCompare(String(valB), undefined, {
          numeric: true,
          sensitivity: 'base',
        }) * factor
      );
    });
  }, [rows, sortCol, sortDir]);

  const filtered = sortedRows;
  const selectedRows = useMemo(
    () => rows.filter((row) => selectedKeys.includes(rowKey(row))),
    [rows, selectedKeys]
  );
  const allFilteredSelected =
    filtered.length > 0 && filtered.every((row) => selectedKeys.includes(rowKey(row)));
  const someFilteredSelected = filtered.some((row) => selectedKeys.includes(rowKey(row)));

  const toggleAllFiltered = (checked: boolean) => {
    const filteredKeys = filtered.map(rowKey);
    setSelectedKeys((current) => {
      const next = new Set(current);
      for (const key of filteredKeys) checked ? next.add(key) : next.delete(key);
      return [...next];
    });
  };

  const toggleRow = (row: any, checked: boolean) => {
    const key = rowKey(row);
    setSelectedKeys((current) =>
      checked ? [...new Set([...current, key])] : current.filter((val) => val !== key)
    );
  };

  const restoreItem = async (row: any) => {
    setProcessing(true);
    try {
      await trashAction({ intent: 'restore', entityType: row.entityType, id: row.id });
      setToast({
        message: `${typeLabels[row.entityType] || row.entityType} restored successfully.`,
        type: 'success',
      });
      await load();
    } catch (caught) {
      setToast({ message: errorMessage(caught), type: 'error' });
    } finally {
      setProcessing(false);
    }
  };

  const restoreSelected = async () => {
    if (!selectedRows.length) return;
    setProcessing(true);
    const items = [...selectedRows];
    try {
      const results = await runBulkAction(items, (row) =>
        trashAction({ intent: 'restore', entityType: row.entityType, id: row.id })
      );
      const succeeded = results.succeeded.length;
      const failed = results.failed.length;
      setToast({
        message: failed
          ? `${succeeded} items restored, but ${failed} failed.`
          : `${succeeded} items restored successfully.`,
        type: failed ? 'warning' : 'success',
        title: failed ? 'Partial Restore Warning' : 'Restored',
      });
      await load();
    } catch (caught) {
      setToast({
        message: errorMessage(caught),
        type: 'error',
        title: 'Failed to Restore Items',
      });
    } finally {
      setProcessing(false);
    }
  };

  const removePermanent = async () => {
    if (!permanent) return;
    setProcessing(true);
    try {
      await trashAction({ intent: 'delete', entityType: permanent.entityType, id: permanent.id });
      setToast({ message: 'Item permanently deleted.', type: 'success', title: 'Purged' });
      setPermanent(null);
      await load();
    } catch (caught) {
      setToast({
        message: errorMessage(caught),
        type: 'error',
        title: 'Failed to Delete Permanently',
      });
    } finally {
      setProcessing(false);
    }
  };

  const removeSelectedPermanent = async () => {
    if (!selectedRows.length) return;
    setProcessing(true);
    const items = [...selectedRows];
    try {
      const results = await runBulkAction(items, (row) =>
        trashAction({ intent: 'delete', entityType: row.entityType, id: row.id })
      );
      const succeeded = results.succeeded.length;
      const failed = results.failed.length;
      setBulkPermanentOpen(false);
      setSelectedKeys([]);
      setToast({
        message: failed
          ? `${succeeded} items permanently deleted, but ${failed} failed.`
          : `${succeeded} items permanently deleted.`,
        type: failed ? 'warning' : 'success',
        title: failed ? 'Partial Delete Warning' : 'Items Purged',
      });
      await load();
    } catch (caught) {
      setToast({
        message: errorMessage(caught),
        type: 'error',
        title: 'Failed to Delete Items',
      });
    } finally {
      setProcessing(false);
    }
  };

  const exportTrashExcel = () => {
    const headers = ['Kind', 'Code / Number', 'Description', 'Deleted At', 'Deleted By'];
    const dataRows = filtered.map((row) => [
      typeLabels[row.entityType] || row.entityType,
      row.code,
      row.name,
      dateTime(row.deletedAt),
      row.deletedByName || '-',
    ]);
    exportToExcel(
      `trash-records-${new Date().toISOString().slice(0, 10)}.xlsx`,
      'Trash',
      headers,
      dataRows
    );
  };

  return {
    rows,
    search,
    setSearch,
    type,
    setType,
    page,
    setPage,
    limit,
    setLimit,
    total,
    counts,
    loading,
    processing,
    permanent,
    setPermanent,
    selectedKeys,
    setSelectedKeys,
    bulkPermanentOpen,
    setBulkPermanentOpen,
    toast,
    setToast,
    sortCol,
    sortDir,
    handleSortToggle,
    filtered,
    selectedRows,
    allFilteredSelected,
    someFilteredSelected,
    toggleAllFiltered,
    toggleRow,
    restoreItem,
    restoreSelected,
    removePermanent,
    removeSelectedPermanent,
    exportTrashExcel,
  };
}
