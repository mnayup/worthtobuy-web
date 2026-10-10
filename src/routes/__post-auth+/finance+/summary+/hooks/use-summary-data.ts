import { useEffect, useMemo, useState } from 'react';
import { api, errorMessage } from '~/lib/api';
import { fallbackRules, type FeeRule } from '../types';

export async function fetchSummaryData() {
  const [dashboard, orderResponse, settings] = await Promise.all([
    api.get('/dashboard'),
    api.get('/orders?limit=25'),
    api.get('/settings'),
  ]);
  return {
    dashboard: dashboard.data,
    orders: orderResponse.data.data || [],
    feeRules: Array.isArray(settings.data.feeRules)
      ? settings.data.feeRules
      : fallbackRules,
  };
}

export type OrderSortCol =
  | 'orderNumber'
  | 'customer'
  | 'total'
  | 'status'
  | null;

export function useSummaryData() {
  const [data, setData] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [orderPage, setOrderPage] = useState(1);
  const orderPageSize = 5;
  const [rules, setRules] = useState<FeeRule[]>(fallbackRules);
  const [amount, setAmount] = useState(250000);
  const [mode, setMode] = useState<'AUTO' | 'MANUAL'>('AUTO');
  const [manualFee, setManualFee] = useState(15000);
  const [specialNote, setSpecialNote] = useState('');
  const [error, setError] = useState('');

  const [orderSortCol, setOrderSortCol] = useState<OrderSortCol>(null);
  const [orderSortDir, setOrderSortDir] = useState<'asc' | 'desc' | null>(null);

  const [ruleSortCol, setRuleSortCol] = useState<'min' | 'fee' | null>(null);
  const [ruleSortDir, setRuleSortDir] = useState<'asc' | 'desc' | null>(null);

  useEffect(() => {
    fetchSummaryData()
      .then((res) => {
        setData(res.dashboard);
        setOrders(res.orders);
        if (res.feeRules?.length) setRules(res.feeRules);
      })
      .catch((caught) => setError(errorMessage(caught)));
  }, []);

  const calculation = useMemo(() => {
    const active = rules
      .filter((rule) => rule.active !== false)
      .sort((a, b) => Number(a.min) - Number(b.min));
    const matched =
      active.find(
        (rule) =>
          amount >= Number(rule.min) &&
          (rule.max === null || amount <= Number(rule.max))
      ) || active[active.length - 1];
    const automatic = matched
      ? matched.type === 'PERCENT'
        ? amount * (Number(matched.value) / 100)
        : Number(matched.value)
      : 0;
    return {
      fee: mode === 'MANUAL' ? Number(manualFee || 0) : Math.round(automatic),
      rule: matched,
    };
  }, [amount, mode, manualFee, rules]);

  const stats = data?.kpi || data?.stats || {};

  const handleOrderSort = (col: NonNullable<OrderSortCol>) => {
    if (orderSortCol === col) {
      if (orderSortDir === 'asc') setOrderSortDir('desc');
      else if (orderSortDir === 'desc') {
        setOrderSortCol(null);
        setOrderSortDir(null);
      } else setOrderSortDir('asc');
    } else {
      setOrderSortCol(col);
      setOrderSortDir('asc');
    }
  };

  const handleRuleSort = (col: 'min' | 'fee') => {
    if (ruleSortCol === col) {
      setRuleSortDir(ruleSortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setRuleSortCol(col);
      setRuleSortDir('asc');
    }
  };

  const sortedOrders = useMemo(() => {
    if (!orderSortCol || !orderSortDir) return orders;
    const factor = orderSortDir === 'asc' ? 1 : -1;
    return [...orders].sort((a, b) => {
      let valA: any = '';
      let valB: any = '';
      if (orderSortCol === 'orderNumber') {
        valA = a.orderNumber || '';
        valB = b.orderNumber || '';
      } else if (orderSortCol === 'customer') {
        valA = a.customer?.fullName || '';
        valB = b.customer?.fullName || '';
      } else if (orderSortCol === 'total') {
        return (Number(a.totalBill || 0) - Number(b.totalBill || 0)) * factor;
      } else if (orderSortCol === 'status') {
        valA = a.status || '';
        valB = b.status || '';
      }
      return (
        String(valA).localeCompare(String(valB), undefined, {
          numeric: true,
          sensitivity: 'base',
        }) * factor
      );
    });
  }, [orders, orderSortCol, orderSortDir]);

  const sortedRules = useMemo(() => {
    const list = rules.filter((rule) => rule.active !== false);
    if (!ruleSortCol || !ruleSortDir) return list;
    const factor = ruleSortDir === 'asc' ? 1 : -1;
    return [...list].sort((a, b) => {
      if (ruleSortCol === 'min') {
        return (Number(a.min) - Number(b.min)) * factor;
      }
      if (ruleSortCol === 'fee') {
        return (Number(a.value) - Number(b.value)) * factor;
      }
      return 0;
    });
  }, [rules, ruleSortCol, ruleSortDir]);

  return {
    stats,
    orders,
    orderPage,
    setOrderPage,
    orderPageSize,
    amount,
    setAmount,
    mode,
    setMode,
    manualFee,
    setManualFee,
    specialNote,
    setSpecialNote,
    error,
    calculation,
    orderSortCol,
    orderSortDir,
    ruleSortCol,
    ruleSortDir,
    sortedOrders,
    sortedRules,
    handleOrderSort,
    handleRuleSort,
  };
}
