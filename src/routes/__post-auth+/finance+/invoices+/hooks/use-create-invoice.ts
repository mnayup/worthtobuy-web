import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, errorMessage } from '~/lib/api';
import { useDebouncedValue } from '~/hooks/useDebouncedValue';

interface UseCreateInvoiceProps {
  open: boolean;
  onCreated: (id: number) => void;
  initialOrderId?: number | null;
}

export function useCreateInvoice({
  open,
  onCreated,
  initialOrderId,
}: UseCreateInvoiceProps) {
  const [searchParams] = useSearchParams();
  const [customers, setCustomers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [customerId, setCustomerId] = useState('');
  const [selected, setSelected] = useState<number[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<Record<number, any>>({});
  const [orderSearch, setOrderSearch] = useState('');
  const debouncedOrderSearch = useDebouncedValue(orderSearch.trim(), 300);
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [billingModel, setBillingModel] = useState<'DP' | 'FULL_PAYMENT'>('DP');
  const [dpPercent, setDpPercent] = useState<number>(50);
  const [dpAmount, setDpAmount] = useState<number>(0);
  const [dpSettlementNote, setDpSettlementNote] = useState(
    'when products are ready to ship'
  );
  const [isManualDp, setIsManualDp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [availableDeposit, setAvailableDeposit] = useState<number>(0);
  const [useDeposit, setUseDeposit] = useState<boolean>(false);
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [depositLoading, setDepositLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!customerId) {
      setAvailableDeposit(0);
      setUseDeposit(false);
      setDepositAmount(0);
      return;
    }
    let active = true;
    setDepositLoading(true);
    api
      .get(`/customers/${customerId}/deposit-balance`)
      .then((res) => {
        if (!active) return;
        const bal = Number(res.data?.availableDeposit || 0);
        setAvailableDeposit(bal);
        setUseDeposit(false);
        setDepositAmount(0);
      })
      .catch(() => {
        if (active) setAvailableDeposit(0);
      })
      .finally(() => {
        if (active) setDepositLoading(false);
      });
    return () => {
      active = false;
    };
  }, [customerId]);

  async function loadBase() {
    setLoading(true);
    try {
      const customerResponse = await api.get('/customers?limit=25');
      setCustomers(customerResponse.data.data || []);
      const preselectedId =
        initialOrderId || Number(searchParams.get('orderId'));
      if (preselectedId) {
        const orderResponse = await api.get(
          `/invoices/available-orders?orderId=${preselectedId}`
        );
        const preselectedOrder = (orderResponse.data || [])[0];
        if (preselectedOrder) {
          setCustomerId(String(preselectedOrder.customerId));
          setSelected([preselectedOrder.id]);
          setSelectedOrders({ [preselectedOrder.id]: preselectedOrder });
        }
      }
      setError('');
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setLoading(false);
    }
  }

  async function loadAvailableOrders() {
    if (!customerId) {
      setOrders([]);
      return;
    }
    setLoading(true);
    try {
      const query = new URLSearchParams({ customerId });
      if (debouncedOrderSearch) query.set('search', debouncedOrderSearch);
      const response = await api.get(`/invoices/available-orders?${query}`);
      setOrders(response.data || []);
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setLoading(false);
    }
  }

  async function loadCustomerOptions(query: string) {
    const encoded = encodeURIComponent(query);
    const response = await api.get(`/customers?limit=25&search=${encoded}`);
    return (response.data.data || []).map((customer: any) => ({
      value: customer.id,
      label: `${customer.customerCode} • ${customer.fullName} • ${customer.whatsapp}`,
    }));
  }

  useEffect(() => {
    if (open) loadBase();
  }, [open]);

  useEffect(() => {
    if (open) loadAvailableOrders();
  }, [open, customerId, debouncedOrderSearch]);

  const selectedRows = selected
    .map((id) => selectedOrders[id] || orders.find((order) => order.id === id))
    .filter(Boolean);
  const total = selectedRows.reduce(
    (sum, row) => sum + Number(row.totalBill),
    0
  );
  const calculatedDpFromPercent = Math.round((total * (dpPercent || 0)) / 100);

  const handleToggleDeposit = (checked: boolean) => {
    setUseDeposit(checked);
    if (checked) {
      setDepositAmount(Math.min(availableDeposit, total));
    } else {
      setDepositAmount(0);
    }
  };

  useEffect(() => {
    if (!isManualDp) {
      setDpAmount(Math.round((total * (dpPercent || 0)) / 100));
    }
  }, [total, dpPercent, isManualDp]);

  useEffect(() => {
    if (useDeposit) {
      setDepositAmount((prev) =>
        Math.min(prev || availableDeposit, availableDeposit, total)
      );
    }
  }, [total, availableDeposit, useDeposit]);

  const toggleOrder = (order: any) => {
    const checked = selected.includes(order.id);
    setSelected((value) =>
      checked ? value.filter((id) => id !== order.id) : [...value, order.id]
    );
    setSelectedOrders((value) => {
      const next = { ...value };
      if (checked) delete next[order.id];
      else next[order.id] = order;
      return next;
    });
  };

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!customerId || !selected.length) {
      setError('Please select a customer and at least one order.');
      return;
    }
    if (!dueDate) {
      setError('Due date is required.');
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        customerId: Number(customerId),
        orderIds: selected,
        dueDate: new Date(dueDate).toISOString(),
        notes: notes || null,
        billingModel,
      };

      if (billingModel === 'DP') {
        payload.dpPercent = Number(dpPercent || 0);
        payload.dpAmount = Number(dpAmount || 0);
        payload.dpSettlementNote =
          dpSettlementNote.trim() || 'when products are ready to ship';
      }

      if (useDeposit && depositAmount > 0) {
        payload.useDeposit = true;
        payload.depositAmount = Number(depositAmount);
      }

      const response = await api.post('/invoices', payload);
      const selectedCustomer = customers.find(
        (c) => String(c.id) === String(customerId)
      );
      const isPriority = selectedCustomer?.segment === 'PRIORITY';

      await Promise.all(
        selected.map((id) =>
          api.put(`/orders/${id}`, {
            status: isPriority
              ? 'WAITING_PURCHASE'
              : billingModel === 'DP'
                ? 'WAITING_DP'
                : 'WAITING_PURCHASE',
          })
        )
      );
      onCreated(response.data.id);
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setSaving(false);
    }
  }

  return {
    searchParams,
    customers,
    orders,
    customerId,
    setCustomerId,
    selected,
    setSelected,
    setSelectedOrders,
    orderSearch,
    setOrderSearch,
    dueDate,
    setDueDate,
    notes,
    setNotes,
    billingModel,
    setBillingModel,
    dpPercent,
    setDpPercent,
    dpAmount,
    setDpAmount,
    dpSettlementNote,
    setDpSettlementNote,
    isManualDp,
    setIsManualDp,
    loading,
    saving,
    error,
    availableDeposit,
    useDeposit,
    depositAmount,
    setDepositAmount,
    depositLoading,
    total,
    calculatedDpFromPercent,
    loadCustomerOptions,
    handleToggleDeposit,
    toggleOrder,
    submit,
  };
}
