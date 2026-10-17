import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, errorMessage } from '~/lib/api';
import { useDebouncedValue } from '~/hooks/useDebouncedValue';

interface UseCreateInvoiceProps {
  open: boolean;
  onCreated: (id: number) => void;
  initialOrderId?: number | null;
}

export function useCreateInvoice({ open, onCreated, initialOrderId }: UseCreateInvoiceProps) {
  const [searchParams] = useSearchParams();
  const [customers, setCustomers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [customerId, setCustomerId] = useState('');
  const [selected, setSelected] = useState<number[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<Record<number, any>>({});
  const [orderShippingMap, setOrderShippingMap] = useState<Record<number, number>>({});
  const [orderSearch, setOrderSearch] = useState('');
  const debouncedOrderSearch = useDebouncedValue(orderSearch.trim(), 300);
  const getTodayDateString = () => new Date().toISOString().slice(0, 10);
  const [dueDate, setDueDate] = useState<string>(getTodayDateString);
  const [notes, setNotes] = useState('');
  const [billingModel, setBillingModel] = useState<'DP' | 'FULL_PAYMENT'>('DP');
  const [dpPercent, setDpPercent] = useState<number>(50);
  const [dpAmount, setDpAmount] = useState<number>(0);
  const [dpSettlementNote, setDpSettlementNote] = useState('when products are ready to ship');
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
    api.get(`/customers/${customerId}/deposit-balance`)
      .then((res) => {
        if (!active) return;
        setAvailableDeposit(Number(res.data?.availableDeposit || 0));
        setUseDeposit(false);
        setDepositAmount(0);
      })
      .catch(() => {
        if (active) setAvailableDeposit(0);
      })
      .finally(() => {
        if (active) setDepositLoading(false);
      });
    return () => { active = false; };
  }, [customerId]);

  async function loadBase() {
    setLoading(true);
    try {
      const customerRes = await api.get('/customers?limit=25');
      setCustomers(customerRes.data.data || []);
      const preselectedId = initialOrderId || Number(searchParams.get('orderId'));
      if (preselectedId) {
        const orderRes = await api.get(`/invoices/available-orders?orderId=${preselectedId}`);
        const preselected = (orderRes.data || [])[0];
        if (preselected) {
          const cId = preselected.customer_id ?? preselected.customerId ?? preselected.customer?.id;
          if (cId) setCustomerId(String(cId));
          setSelected([preselected.id]);
          setSelectedOrders({ [preselected.id]: preselected });
          const ship = Number(preselected.customer_shipping ?? preselected.customerShipping ?? 0);
          setOrderShippingMap({ [preselected.id]: ship });
          if (preselected.customer) {
            setCustomers((prev) => prev.some((c) => String(c.id) === String(cId)) ? prev : [preselected.customer, ...prev]);
          }
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
    if (!customerId) { setOrders([]); return; }
    setLoading(true);
    try {
      const query = new URLSearchParams({ customerId });
      if (debouncedOrderSearch) query.set('search', debouncedOrderSearch);
      const res = await api.get(`/invoices/available-orders?${query}`);
      setOrders(res.data || []);
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setLoading(false);
    }
  }

  async function loadCustomerOptions(query: string) {
    const res = await api.get(`/customers?limit=25&search=${encodeURIComponent(query)}`);
    return (res.data.data || []).map((c: any) => ({
      value: c.id,
      label: [c.customer_code || c.customerCode, c.full_name || c.fullName, c.whatsapp || c.phone].filter(Boolean).join(' • ') || `Customer #${c.id}`,
    }));
  }

  useEffect(() => {
    if (open) {
      setDueDate(getTodayDateString());
      loadBase();
    }
  }, [open]);
  useEffect(() => { if (open) loadAvailableOrders(); }, [open, customerId, debouncedOrderSearch]);

  const selectedRows = selected
    .map((id) => selectedOrders[id] || orders.find((o) => o.id === id))
    .filter(Boolean);

  const setOrderShipping = (orderId: number, amount: number) => {
    setOrderShippingMap((prev) => ({ ...prev, [orderId]: amount }));
  };

  const getShipping = (row: any) =>
    orderShippingMap[row.id] !== undefined
      ? orderShippingMap[row.id]
      : Number(row.customer_shipping ?? row.customerShipping ?? row.local_shipping ?? row.localShipping ?? 0);

  const totalShipping = selectedRows.reduce((sum, row) => sum + getShipping(row), 0);

  const total = selectedRows.reduce((sum, row) => {
    const initShip = Number(row.customer_shipping ?? row.customerShipping ?? row.local_shipping ?? row.localShipping ?? 0);
    const base = Math.max(0, Number(row.total_bill ?? row.totalBill ?? 0) - initShip);
    return sum + base + getShipping(row);
  }, 0);

  const totalServiceFee = selectedRows.reduce((sum, r) => sum + Number(r.service_fee ?? r.serviceFee ?? 0), 0);
  const calculatedDpFromPercent = Math.round((total * (dpPercent || 0)) / 100);

  const handleToggleDeposit = (checked: boolean) => {
    setUseDeposit(checked);
    setDepositAmount(checked ? Math.min(availableDeposit, total) : 0);
  };

  useEffect(() => {
    if (!isManualDp) setDpAmount(Math.round((total * (dpPercent || 0)) / 100));
  }, [total, dpPercent, isManualDp]);

  useEffect(() => {
    if (useDeposit) {
      setDepositAmount((prev) => Math.min(prev || availableDeposit, availableDeposit, total));
    }
  }, [total, availableDeposit, useDeposit]);

  const toggleOrder = (order: any) => {
    const checked = selected.includes(order.id);
    setSelected((prev) => (checked ? prev.filter((id) => id !== order.id) : [...prev, order.id]));
    setSelectedOrders((prev) => {
      const next = { ...prev };
      if (checked) delete next[order.id];
      else next[order.id] = order;
      return next;
    });
    if (!checked && orderShippingMap[order.id] === undefined) {
      const ship = Number(order.customer_shipping ?? order.customerShipping ?? 0);
      setOrderShippingMap((prev) => ({ ...prev, [order.id]: ship }));
    }
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
      await Promise.all(
        selected.map(async (id) => {
          if (orderShippingMap[id] !== undefined) {
            await api.put(`/orders/${id}`, {
              customerShipping: orderShippingMap[id],
              customer_shipping: orderShippingMap[id],
            });
          }
        })
      );

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
        payload.dpSettlementNote = dpSettlementNote.trim() || 'when products are ready to ship';
      }

      if (useDeposit && depositAmount > 0) {
        payload.useDeposit = true;
        payload.depositAmount = Number(depositAmount);
      }

      const res = await api.post('/invoices', payload);
      const isPriority = customers.find((c) => String(c.id) === String(customerId))?.segment === 'PRIORITY';

      await Promise.all(
        selected.map((id) =>
          api.put(`/orders/${id}`, {
            status: isPriority ? 'WAITING_PURCHASE' : billingModel === 'DP' ? 'WAITING_DP' : 'WAITING_PURCHASE',
          })
        )
      );
      onCreated(res.data.id);
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setSaving(false);
    }
  }

  return {
    searchParams, customers, orders, customerId, setCustomerId,
    selected, setSelected, selectedRows, setSelectedOrders,
    orderShippingMap, setOrderShipping, orderSearch, setOrderSearch,
    dueDate, setDueDate, notes, setNotes, billingModel, setBillingModel,
    dpPercent, setDpPercent, dpAmount, setDpAmount,
    dpSettlementNote, setDpSettlementNote, isManualDp, setIsManualDp,
    loading, saving, error, availableDeposit, useDeposit,
    depositAmount, setDepositAmount, depositLoading, total,
    totalShipping, totalServiceFee, calculatedDpFromPercent,
    loadCustomerOptions, handleToggleDeposit, toggleOrder, submit,
  };
}
