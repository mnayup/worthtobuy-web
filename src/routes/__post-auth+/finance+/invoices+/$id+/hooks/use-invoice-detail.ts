import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, errorMessage } from '~/lib/api';
import type { Invoice } from '~/routes/__post-auth+/finance+/invoices+/types';
import type {
  PaymentSortCol,
  PreviewStage,
  PrintFormat,
  RefundSortCol,
  SortDir,
  StageMode,
} from '../types';

export async function loader(id: string | number) {
  const [invoiceResponse, settingResponse] = await Promise.all([
    api.get(`/invoices/${id}`),
    api.get('/settings'),
  ]);
  return {
    invoice: invoiceResponse.data as Invoice,
    settings: settingResponse.data,
  };
}

export function useInvoiceDetail(id?: string) {
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<any>(null);
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingScheme, setUpdatingScheme] = useState(false);

  // Modals state
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [whatsappOpen, setWhatsappOpen] = useState(false);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteSaving, setDeleteSaving] = useState(false);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState<any | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    title?: string;
  } | null>(null);

  function openVerifyModal(payment: any) {
    setVerifyingPayment(payment);
    setVerifyModalOpen(true);
  }

  function closeVerifyModal() {
    setVerifyingPayment(null);
    setVerifyModalOpen(false);
  }

  // Sorting
  const [paymentSortCol, setPaymentSortCol] = useState<PaymentSortCol>(null);
  const [paymentSortDir, setPaymentSortDir] = useState<SortDir>('desc');
  const [refundSortCol, setRefundSortCol] = useState<RefundSortCol>(null);
  const [refundSortDir, setRefundSortDir] = useState<SortDir>('desc');

  // Preview & Print
  const [previewStage, setPreviewStage] = useState<PreviewStage>('AUTO');
  const [printFormat, setPrintFormat] = useState<PrintFormat>('A4');
  const [paymentInitialAmount, setPaymentInitialAmount] = useState<number | undefined>();
  const [paymentInitialNotes, setPaymentInitialNotes] = useState<string | undefined>();

  function openPaymentWith(amount?: number, notes?: string) {
    setPaymentInitialAmount(amount);
    setPaymentInitialNotes(notes);
    setPaymentOpen(true);
  }

  async function updatePaymentScheme(model: 'DP' | 'FULL_PAYMENT', percent?: number) {
    if (!invoice) return;
    setUpdatingScheme(true);
    try {
      const payload: any = { billingModel: model };
      const currentTotal = Number(invoice.total_bill ?? invoice.totalBill ?? 0);
      if (model === 'DP') {
        const pct = percent || invoice.dp_percent || invoice.dpPercent || 50;
        payload.dpPercent = pct;
        payload.dpAmount = Math.round((currentTotal * pct) / 100);
        payload.dpSettlementNote =
          invoice.dp_settlement_note ||
          invoice.dpSettlementNote ||
          'when products are ready to ship';
      } else {
        payload.dpPercent = null;
        payload.dpAmount = null;
      }

      setInvoice((prev: any) => ({
        ...prev,
        ...payload,
        dp_percent: payload.dpPercent,
        dp_amount: payload.dpAmount,
        dp_settlement_note: payload.dpSettlementNote,
      }));
      await api.put(`/invoices/${invoice.id}`, payload);
    } catch (caught) {
      setToast({ message: errorMessage(caught), type: 'error' });
      load();
    } finally {
      setUpdatingScheme(false);
    }
  }

  async function updateShippingCost(orderId: number, shippingCost: number) {
    if (!invoice) return;
    setUpdatingScheme(true);
    try {
      await api.put(`/orders/${orderId}`, {
        customerShipping: shippingCost,
        customer_shipping: shippingCost,
      });
      setToast({
        message: 'Estimated shipping cost updated successfully.',
        type: 'success',
      });
      await load();
    } catch (caught) {
      setToast({ message: errorMessage(caught), type: 'error' });
    } finally {
      setUpdatingScheme(false);
    }
  }

  async function updateKeepItems(keep: boolean, customDate?: string) {
    if (!invoice) return;
    setUpdatingScheme(true);
    try {
      const payload: any = {
        keepItems: keep,
        keptUntil: keep
          ? (customDate ? new Date(customDate).toISOString() : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString())
          : null,
      };
      await api.put(`/invoices/${invoice.id}`, payload);
      setToast({
        message: keep
          ? 'Status pesanan berhasil diset ke Titip Simpan (1 bulan).'
          : 'Status pesanan berhasil diubah ke Kirim Langsung.',
        type: 'success',
      });
      await load();
    } catch (caught) {
      setToast({ message: errorMessage(caught), type: 'error' });
    } finally {
      setUpdatingScheme(false);
    }
  }

  async function load() {
    if (!id) return;
    setLoading(true);
    try {
      const data = await loader(id);
      setInvoice(data.invoice);
      setSettings(data.settings);
      setError('');
      if (new URLSearchParams(window.location.search).get('print') === '1') {
        setTimeout(() => window.print(), 450);
      }
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [id]);

  const sortedPayments = useMemo(() => {
    if (!invoice?.payments) return [];
    const list = [...invoice.payments];
    if (!paymentSortCol) return list;
    const factor = paymentSortDir === 'asc' ? 1 : -1;
    return list.sort((a, b) => {
      if (paymentSortCol === 'date') {
        const timeA = new Date(a.payment_date || a.paymentDate).getTime();
        const timeB = new Date(b.payment_date || b.paymentDate).getTime();
        return (timeA - timeB) * factor;
      }
      if (paymentSortCol === 'method') {
        const metA = String(a.payment_method || a.method || '');
        const metB = String(b.payment_method || b.method || '');
        return metA.localeCompare(metB) * factor;
      }
      if (paymentSortCol === 'amount') {
        return (Number(a.amount || 0) - Number(b.amount || 0)) * factor;
      }
      if (paymentSortCol === 'status') {
        return String(a.status || '').localeCompare(String(b.status || '')) * factor;
      }
      return 0;
    });
  }, [invoice?.payments, paymentSortCol, paymentSortDir]);

  const sortedRefunds = useMemo(() => {
    if (!invoice?.refunds) return [];
    const list = [...invoice.refunds];
    if (!refundSortCol) return list;
    const factor = refundSortDir === 'asc' ? 1 : -1;
    return list.sort((a, b) => {
      if (refundSortCol === 'number') {
        const numA = String(a.refund_number || a.refundNumber || '');
        const numB = String(b.refund_number || b.refundNumber || '');
        return numA.localeCompare(numB) * factor;
      }
      if (refundSortCol === 'reason') {
        return String(a.reason || '').localeCompare(String(b.reason || '')) * factor;
      }
      if (refundSortCol === 'amount') {
        return (Number(a.amount || 0) - Number(b.amount || 0)) * factor;
      }
      if (refundSortCol === 'status') {
        return String(a.status || '').localeCompare(String(b.status || '')) * factor;
      }
      return 0;
    });
  }, [invoice?.refunds, refundSortCol, refundSortDir]);

  const isDpScheme =
    invoice?.billingModel === 'DP' || invoice?.billing_model === 'DP' ||
    Number(invoice?.dpAmount ?? invoice?.dp_amount ?? 0) > 0;
  const totalBill = Number(invoice?.totalBill ?? invoice?.total_bill ?? 0);
  const paidAmount = Number(invoice?.paidAmount ?? invoice?.paid_amount ?? 0);
  const outstandingAmount = Number(invoice?.outstandingAmount ?? invoice?.outstanding_amount ?? 0);
  const rawDpAmount = Number(invoice?.dpAmount ?? invoice?.dp_amount ?? 0);
  const dpPercentValue = Number(invoice?.dpPercent ?? invoice?.dp_percent ?? 50);
  const dpAmount = isDpScheme
    ? rawDpAmount > 0 && !invoice?.dp_percent && !invoice?.dpPercent
      ? rawDpAmount
      : Math.round((totalBill * dpPercentValue) / 100)
    : 0;

  const currentStage: 'DP' | 'SETTLEMENT' | 'PAID' | 'FULL_UNPAID' = useMemo(() => {
    if (!invoice) return 'FULL_UNPAID';
    if ((outstandingAmount <= 0 && paidAmount > 0) || invoice?.status === 'PAID') return 'PAID';
    if (isDpScheme) return paidAmount > 0 ? 'SETTLEMENT' : 'DP';
    if (paidAmount > 0) return 'SETTLEMENT';
    return 'FULL_UNPAID';
  }, [invoice, isDpScheme, outstandingAmount, paidAmount]);

  const activeDisplayMode: StageMode = useMemo(() => {
    if (previewStage !== 'AUTO') return previewStage;
    if (currentStage === 'DP') return 'DP';
    if (currentStage === 'SETTLEMENT') return 'SETTLEMENT';
    if (currentStage === 'PAID') return 'PAID';
    return 'FULL';
  }, [previewStage, currentStage]);

  const paymentsChronological = useMemo(() => {
    return [...(invoice?.payments || [])].sort((left: any, right: any) => {
      const leftDate = new Date(left.payment_date || left.paymentDate).getTime();
      const rightDate = new Date(right.payment_date || right.paymentDate).getTime();
      return leftDate - rightDate || Number(left.id || 0) - Number(right.id || 0);
    });
  }, [invoice?.payments]);

  async function removeInvoice() {
    setDeleteSaving(true);
    try {
      await api.delete(`/invoices/${invoice.id}`);
      navigate('/trash');
    } catch (caught) {
      setToast({ message: errorMessage(caught), type: 'error' });
      setDeleteOpen(false);
    } finally {
      setDeleteSaving(false);
    }
  }

  function handleSortPayment(col: NonNullable<PaymentSortCol>) {
    if (paymentSortCol === col) {
      setPaymentSortDir(paymentSortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setPaymentSortCol(col);
      setPaymentSortDir('desc');
    }
  }

  function handleSortRefund(col: NonNullable<RefundSortCol>) {
    if (refundSortCol === col) {
      setRefundSortDir(refundSortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setRefundSortCol(col);
      setRefundSortDir('desc');
    }
  }

  const pendingPayments = useMemo(() => {
    return (invoice?.payments || []).filter((p: any) => p.status === 'PENDING');
  }, [invoice?.payments]);

  return {
    invoice, settings, loading, error, updatingScheme,
    paymentOpen, setPaymentOpen, whatsappOpen, setWhatsappOpen,
    depositModalOpen, setDepositModalOpen, deleteOpen, setDeleteOpen,
    deleteSaving, toast, setToast, paymentSortCol, paymentSortDir,
    handleSortPayment, refundSortCol, refundSortDir, handleSortRefund,
    previewStage, setPreviewStage, printFormat, setPrintFormat,
    paymentInitialAmount, setPaymentInitialAmount, paymentInitialNotes,
    setPaymentInitialNotes, openPaymentWith, updatePaymentScheme,
    updateShippingCost, updateKeepItems, load, sortedPayments, sortedRefunds,
    isDpScheme, totalBill, paidAmount, outstandingAmount,
    dpAmount, currentStage, activeDisplayMode, paymentsChronological,
    removeInvoice, verifyModalOpen, setVerifyModalOpen,
    verifyingPayment, openVerifyModal, closeVerifyModal,
    pendingPayments,
  };
}
