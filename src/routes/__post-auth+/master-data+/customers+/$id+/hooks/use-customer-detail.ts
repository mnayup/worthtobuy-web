import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, errorMessage } from '~/lib/api';
import type { CustomerOverviewData } from '~/routes/__post-auth+/master-data+/customers+/types';

export async function loader(customerId: string): Promise<CustomerOverviewData> {
  const response = await api.get(`/customers/${customerId}/overview`);
  return response.data;
}

export function useCustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<CustomerOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [invoicePage, setInvoicePage] = useState(1);
  const [orderPage, setOrderPage] = useState(1);
  const pageSize = 5;

  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);

  const toggleSort = (key: string) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDirection('asc');
    } else if (sortDirection === 'asc') {
      setSortDirection('desc');
    } else {
      setSortKey(null);
      setSortDirection(null);
    }
  };

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    loader(id)
      .then((response) => {
        setData(response);
        setError('');
      })
      .catch((caught) => setError(errorMessage(caught)))
      .finally(() => setLoading(false));
  }, [id]);

  const customer = data?.customer;
  const summary = data?.summary;
  const refunds = data?.refunds || [];

  const derivedSegment = useMemo(() => {
    if (!customer) return 'REGULAR';
    let seg = customer.segment;
    const orderCount = summary?.totalOrders || customer.orders?.length || 0;
    if (seg === 'REGULAR' && orderCount >= 24) {
      seg = 'PRIORITY';
    }
    return seg;
  }, [customer, summary]);

  const phone = useMemo(() => {
    return String(customer?.whatsapp || '').replace(/\D/g, '');
  }, [customer?.whatsapp]);

  const rawInvoices = useMemo(() => {
    return customer?.invoices || [];
  }, [customer?.invoices]);

  const sortedInvoices = useMemo(() => {
    return [...rawInvoices].sort((a: any, b: any) => {
      if (!sortKey || !sortDirection) return 0;
      const valA = a[sortKey];
      const valB = b[sortKey];
      if (valA == null && valB == null) return 0;
      if (valA == null) return 1;
      if (valB == null) return -1;

      let comparison = 0;
      if (typeof valA === 'number' && typeof valB === 'number') {
        comparison = valA - valB;
      } else {
        comparison = String(valA).localeCompare(String(valB), undefined, {
          numeric: true,
          sensitivity: 'base',
        });
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [rawInvoices, sortKey, sortDirection]);

  const invoicePages = Math.max(1, Math.ceil(sortedInvoices.length / pageSize));
  const paginatedInvoices = useMemo(() => {
    return sortedInvoices.slice((invoicePage - 1) * pageSize, invoicePage * pageSize);
  }, [sortedInvoices, invoicePage, pageSize]);

  const orders = useMemo(() => {
    return customer?.orders || [];
  }, [customer?.orders]);

  const orderPages = Math.max(1, Math.ceil(orders.length / pageSize));
  const paginatedOrders = useMemo(() => {
    return orders.slice((orderPage - 1) * pageSize, orderPage * pageSize);
  }, [orders, orderPage, pageSize]);

  return {
    id,
    data,
    customer,
    summary,
    refunds,
    loading,
    error,
    derivedSegment,
    phone,
    invoicePage,
    setInvoicePage,
    invoicePages,
    paginatedInvoices,
    rawInvoices,
    sortedInvoices,
    orderPage,
    setOrderPage,
    orderPages,
    orders,
    paginatedOrders,
    pageSize,
    sortKey,
    sortDirection,
    toggleSort,
  };
}
