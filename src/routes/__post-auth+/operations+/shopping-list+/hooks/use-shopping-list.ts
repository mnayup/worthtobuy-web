import { useState, useEffect, useMemo } from 'react';
import { api, errorMessage } from '~/lib/api';
import { titleCase } from '~/lib/format';
import { exportToExcel } from '~/lib/excel';
import { useDebouncedValue } from '~/hooks/useDebouncedValue';
import type { ShoppingListItem } from '../types';

export async function fetchShoppingList(params?: {
  periodId?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();
  if (params?.periodId) query.set('periodId', params.periodId);
  if (params?.status) query.set('status', params.status);
  if (params?.search) query.set('search', params.search);
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  const response = await api.get(`/shopping-list?${query}`);
  return response.data;
}

export async function updateShoppingItemStatus(id: number, purchaseStatus: string) {
  return api.patch(`/shopping-list/${id}/status`, { purchaseStatus });
}

export function useShoppingList() {
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [periods, setPeriods] = useState<any[]>([]);
  const [periodId, setPeriodId] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState(
    new URLSearchParams(window.location.search).get('search') || ''
  );
  const debouncedSearch = useDebouncedValue(search.trim(), 350);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    title?: string;
  } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchShoppingList({
        periodId,
        status,
        search: debouncedSearch,
        page,
        limit,
      });
      setItems(data.data || []);
      setTotal(Number(data.total || 0));
    } catch (caught) {
      setToast({ message: errorMessage(caught), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api
      .get('/periods?limit=100')
      .then((response) => setPeriods(response.data.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, periodId, status]);

  useEffect(() => {
    load();
  }, [debouncedSearch, periodId, status, page, limit]);

  const setItemStatus = async (id: number, purchaseStatus: string) => {
    try {
      await updateShoppingItemStatus(id, purchaseStatus);
      setItems((value) =>
        value.map((row) => (row.id === id ? { ...row, purchaseStatus } : row))
      );
      setToast({
        message: `Status updated to ${titleCase(purchaseStatus)}.`,
        type: 'success',
      });
    } catch (caught) {
      setToast({ message: errorMessage(caught), type: 'error' });
    }
  };

  const groups = useMemo(
    () =>
      Object.entries(
        items.reduce(
          (result: Record<string, ShoppingListItem[]>, item: ShoppingListItem) => {
            const key = item.product?.brandName || item.brandName || 'Unspecified Brand';
            (result[key] ??= []).push(item);
            return result;
          },
          {}
        )
      ),
    [items]
  );

  const exportShoppingListExcel = () => {
    const headers = [
      'Brand',
      'Product',
      'Order #',
      'Customer',
      'Event Code',
      'Quantity',
      'Target Price (IDR)',
      'Status',
      'Store Location',
      'Notes',
    ];
    const rows = items.map((item) => [
      item.product?.brandName || item.brandName || '-',
      item.product?.name || item.manualProductName || 'Custom Item',
      item.order?.orderNumber || '-',
      item.order?.customer?.fullName || '-',
      item.order?.period?.code || '-',
      Number(item.quantity || 1),
      Number(item.targetPriceIdr || 0),
      item.purchaseStatus,
      item.product?.storeLocation || '-',
      item.purchaseNotes || '-',
    ]);
    exportToExcel(
      `shopping-list-${new Date().toISOString().slice(0, 10)}.xlsx`,
      'ShoppingList',
      headers,
      rows
    );
  };

  return {
    items,
    periods,
    periodId,
    setPeriodId,
    status,
    setStatus,
    search,
    setSearch,
    page,
    setPage,
    limit,
    setLimit,
    total,
    loading,
    toast,
    setToast,
    groups,
    setItemStatus,
    exportShoppingListExcel,
  };
}
