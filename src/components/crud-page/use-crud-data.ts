import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, errorMessage } from '~/lib/api';
import { runBulkAction } from '~/lib/bulk';
import { useDebouncedValue } from '~/hooks/useDebouncedValue';
import type { BulkStatusConfig, FieldConfig, Paginated } from '~/types';

interface UseCrudDataProps {
  endpoint: string;
  fields: FieldConfig[];
  prepareSubmit?: (form: Record<string, any>) => Record<string, any>;
  extraQuery?: Record<string, string | number | undefined>;
  bulkStatus?: BulkStatusConfig;
}

export function useCrudData({
  endpoint,
  fields,
  prepareSubmit,
  extraQuery,
  bulkStatus,
}: UseCrudDataProps) {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(Math.max(1, Number(searchParams.get('page') || 1)));
  const [limit, setLimit] = useState(
    [10, 25, 50, 100].includes(Number(searchParams.get('limit')))
      ? Number(searchParams.get('limit'))
      : 10
  );
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const debouncedSearch = useDebouncedValue(search.trim(), 350);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const [key, val] of searchParams.entries()) {
      if (key !== 'page' && key !== 'limit' && key !== 'search' && val) {
        initial[key] = val;
      }
    }
    return initial;
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [deleting, setDeleting] = useState<any | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkValue, setBulkValue] = useState('');
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title?: string;
  } | null>(null);

  async function load() {
    setLoading(true);
    try {
      const query = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (debouncedSearch) query.set('search', debouncedSearch);
      Object.entries(columnFilters).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '' && v !== 'ALL') {
          query.set(k, String(v));
        }
      });
      if (extraQuery) {
        Object.entries(extraQuery).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== '') query.set(k, String(v));
        });
      }
      const response = await api.get<Paginated<any>>(`${endpoint}?${query}`);
      setData(response.data.data);
      setTotal(response.data.total);
      setSelectedIds([]);
    } catch (caught) {
      setToast({
        message: errorMessage(caught),
        type: 'error',
        title: 'Failed to Load Data',
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, JSON.stringify(columnFilters), JSON.stringify(extraQuery || {})]);

  useEffect(() => {
    load();
  }, [
    debouncedSearch,
    JSON.stringify(columnFilters),
    page,
    limit,
    endpoint,
    JSON.stringify(extraQuery || {}),
  ]);

  async function save(form: Record<string, any>) {
    setSaving(true);
    try {
      const cleanForm: Record<string, any> = {};
      for (const field of fields) {
        let val = form[field.name];
        if (val !== undefined) {
          if (
            val === '' &&
            (field.type === 'date' ||
              field.type === 'datetime-local' ||
              field.type === 'number')
          ) {
            val = null;
          } else if (
            val !== null &&
            val !== '' &&
            (field.type === 'date' || field.type === 'datetime-local')
          ) {
            try {
              const d = new Date(val);
              if (!isNaN(d.getTime())) val = d.toISOString();
            } catch {
              // ignore
            }
          }
          cleanForm[field.name] = val;
        }
        if (field.type === 'select' && form[`${field.name}_option`] !== undefined) {
          cleanForm[`${field.name}_option`] = form[`${field.name}_option`];
        }
      }
      const rawPayload = prepareSubmit ? prepareSubmit(cleanForm) : cleanForm;
      const payload: Record<string, any> = {};
      for (const [k, v] of Object.entries(rawPayload)) {
        if (!k.endsWith('_option')) payload[k] = v;
      }
      if (editing) {
        await api.put(`${endpoint}/${editing.id}`, payload);
        setToast({
          message: 'Record updated successfully.',
          type: 'success',
          title: 'Changes Saved',
        });
      } else {
        await api.post(endpoint, payload);
        setToast({
          message: 'New record created successfully.',
          type: 'success',
          title: 'Created',
        });
      }
      setModal(false);
      setEditing(null);
      await load();
    } catch (caught) {
      setToast({
        message: errorMessage(caught),
        type: 'error',
        title: 'Failed to Save Data',
      });
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!deleting) return;
    setSaving(true);
    try {
      await api.delete(`${endpoint}/${deleting.id}`);
      setDeleting(null);
      setToast({
        message: 'Item moved to Trash and can be restored anytime.',
        type: 'success',
        title: 'Moved to Trash',
      });
      await load();
    } catch (caught) {
      setToast({
        message: errorMessage(caught),
        type: 'error',
        title: 'Failed to Delete Data',
      });
    } finally {
      setSaving(false);
    }
  }

  async function removeSelected() {
    if (!selectedIds.length) return;
    setSaving(true);
    try {
      const results = await runBulkAction(selectedIds, (id) =>
        api.delete(`${endpoint}/${id}`)
      );
      setBulkDeleteOpen(false);
      setSelectedIds([]);
      setToast({
        message: `${results.succeeded.length} items moved to Trash.`,
        type: results.failed.length ? 'warning' : 'success',
        title: results.failed.length ? 'Some Items Failed' : 'Items Moved to Trash',
      });
      await load();
    } catch (caught) {
      setToast({
        message: errorMessage(caught),
        type: 'error',
        title: 'Failed to Delete Items',
      });
    } finally {
      setSaving(false);
    }
  }

  async function applyBulkStatus() {
    if (!bulkStatus || !selectedIds.length || !bulkValue) return;
    setSaving(true);
    try {
      const results = await runBulkAction(selectedIds, (id) =>
        bulkStatus.apply(id, bulkValue)
      );
      setSelectedIds([]);
      setBulkValue('');
      setToast({
        message: `${results.succeeded.length} items updated successfully.`,
        type: results.failed.length ? 'warning' : 'success',
        title: 'Status Updated',
      });
      await load();
    } catch (caught) {
      setToast({
        message: errorMessage(caught),
        type: 'error',
        title: 'Failed to Update Status',
      });
    } finally {
      setSaving(false);
    }
  }

  return {
    data,
    total,
    page,
    setPage,
    limit,
    setLimit,
    search,
    setSearch,
    columnFilters,
    setColumnFilters,
    loading,
    saving,
    setSaving,
    modal,
    setModal,
    editing,
    setEditing,
    deleting,
    setDeleting,
    selectedIds,
    setSelectedIds,
    bulkDeleteOpen,
    setBulkDeleteOpen,
    bulkValue,
    setBulkValue,
    toast,
    setToast,
    load,
    save,
    remove,
    removeSelected,
    applyBulkStatus,
  };
}
