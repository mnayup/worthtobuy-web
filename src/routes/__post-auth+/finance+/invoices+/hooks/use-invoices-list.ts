import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, errorMessage } from '~/lib/api';
import { runBulkAction } from '~/lib/bulk';
import { useAuth } from '~/context/AuthContext';
import { useDebouncedValue } from '~/hooks/useDebouncedValue';
import { type Invoice } from '../types';
import {
  sortInvoices,
  type SortColumn,
  type SortDirection,
} from '../helpers/invoice-sort.helper';
import { exportInvoicesToExcel } from '../helpers/invoice-export.helper';

export async function invoiceListLoader(params?: {
  search?: string;
  status?: string;
  billingModel?: string;
  overdue?: string;
  outstanding?: string;
  page?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.search) query.set('search', params.search);
  if (params?.status) query.set('status', params.status);
  if (params?.billingModel) query.set('billingModel', params.billingModel);
  if (params?.overdue === '1') query.set('overdue', '1');
  if (params?.outstanding === '1') query.set('outstanding', '1');
  const response = await api.get(`/invoices?${query}`);
  return response.data;
}

export function useInvoicesList() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const debouncedSearch = useDebouncedValue(search.trim(), 350);
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [billingModel, setBillingModel] = useState(
    searchParams.get('billingModel') || ''
  );
  const [page, setPage] = useState(Number(searchParams.get('page') || 1));
  const [limit, setLimit] = useState(Number(searchParams.get('limit') || 25));
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [sortCol, setSortCol] = useState<SortColumn | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);
  const [activeTab, setActiveTab] = useState('');

  const [deleting, setDeleting] = useState<any | null>(null);
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<number[]>([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [savingDelete, setSavingDelete] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    title?: string;
  } | null>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await invoiceListLoader({
        search: debouncedSearch,
        status,
        billingModel: billingModel || undefined,
        overdue: searchParams.get('overdue') || undefined,
        outstanding: searchParams.get('outstanding') || undefined,
        page,
        limit,
      });
      setInvoices(data.data || []);
      setTotal(Number(data.total || 0));
      setSelectedInvoiceIds([]);
      setError('');
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setPage(1);
  }, [
    debouncedSearch,
    status,
    billingModel,
    searchParams.get('overdue'),
    searchParams.get('outstanding'),
  ]);

  useEffect(() => {
    load();
  }, [searchParams, debouncedSearch, status, billingModel, page, limit]);

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

  const sortedInvoices = useMemo(() => {
    let list = invoices;
    if (activeTab === 'DP') {
      list = list.filter(
        (inv) =>
          inv.billingModel === 'DP' ||
          (inv.dpAmount && Number(inv.dpAmount) > 0)
      );
    } else if (activeTab === 'SETTLEMENT') {
      list = list.filter(
        (inv) =>
          Number(inv.paidAmount || 0) > 0 &&
          Number(inv.outstandingAmount || 0) > 0
      );
    } else if (activeTab === 'PAID') {
      list = list.filter(
        (inv) =>
          Number(inv.outstandingAmount || 0) === 0 &&
          Number(inv.paidAmount || 0) > 0
      );
    }
    return sortInvoices(list, sortCol, sortDir);
  }, [invoices, activeTab, sortCol, sortDir]);

  async function removeInvoice() {
    if (!deleting) return;
    setSavingDelete(true);
    try {
      await api.delete(`/invoices/${deleting.id}`);
      setDeleting(null);
      setToast({
        message: 'Invoice moved to Trash and can be restored.',
        type: 'success',
        title: 'Invoice Deleted',
      });
      await load();
    } catch (caught) {
      setToast({
        message: errorMessage(caught),
        type: 'error',
        title: 'Failed to Delete Invoice',
      });
    } finally {
      setSavingDelete(false);
    }
  }

  async function removeSelectedInvoices() {
    if (!selectedInvoiceIds.length) return;
    setSavingDelete(true);
    const ids = [...selectedInvoiceIds];
    try {
      const results = await runBulkAction(ids, (id: number) =>
        api.delete(`/invoices/${id}`)
      );
      const succeeded = results.succeeded.length;
      const failed = results.failed.length;
      setBulkDeleteOpen(false);
      setSelectedInvoiceIds([]);
      setToast({
        message: failed
          ? `${succeeded} invoices moved to Trash, but ${failed} failed.`
          : `${succeeded} invoices moved to Trash successfully.`,
        type: failed ? 'warning' : 'success',
        title: failed ? 'Partial Delete Warning' : 'Invoices Moved to Trash',
      });
      await load();
    } catch (caught) {
      setToast({
        message: errorMessage(caught),
        type: 'error',
        title: 'Failed to Delete Selected Invoices',
      });
    } finally {
      setSavingDelete(false);
    }
  }

  const canDeleteInvoices = user?.role === 'OWNER';
  const allInvoicesSelected =
    canDeleteInvoices &&
    sortedInvoices.length > 0 &&
    sortedInvoices.every((invoice) =>
      selectedInvoiceIds.includes(invoice.id)
    );
  const someInvoicesSelected =
    canDeleteInvoices &&
    sortedInvoices.some((invoice) =>
      selectedInvoiceIds.includes(invoice.id)
    );

  function toggleAllInvoices(checked: boolean) {
    setSelectedInvoiceIds(
      checked ? sortedInvoices.map((invoice) => invoice.id) : []
    );
  }

  function toggleInvoice(id: number, checked: boolean) {
    setSelectedInvoiceIds((current) =>
      checked
        ? [...new Set([...current, id])]
        : current.filter((value) => value !== id)
    );
  }

  return {
    invoices,
    total,
    loading,
    error,
    search,
    setSearch,
    status,
    setStatus,
    billingModel,
    setBillingModel,
    page,
    setPage,
    limit,
    setLimit,
    sortCol,
    sortDir,
    activeTab,
    setActiveTab,
    deleting,
    setDeleting,
    selectedInvoiceIds,
    setSelectedInvoiceIds,
    bulkDeleteOpen,
    setBulkDeleteOpen,
    savingDelete,
    toast,
    setToast,
    sortedInvoices,
    canDeleteInvoices,
    allInvoicesSelected,
    someInvoicesSelected,
    handleSortToggle,
    removeInvoice,
    removeSelectedInvoices,
    toggleAllInvoices,
    toggleInvoice,
    exportInvoicesExcel: () => exportInvoicesToExcel(sortedInvoices),
  };
}
