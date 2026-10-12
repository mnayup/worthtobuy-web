import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { api, errorMessage } from '~/lib/api';

export function usePublicInvoice() {
  const { invoiceNumber } = useParams<{ invoiceNumber: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadInvoice = useCallback(async () => {
    if (!invoiceNumber) return;
    setLoading(true);
    try {
      const res = await api.get(`/public/invoices/${invoiceNumber}`);
      setData(res.data);
      setError('');
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setLoading(false);
    }
  }, [invoiceNumber]);

  useEffect(() => {
    loadInvoice();
  }, [loadInvoice]);

  const invoice = data?.invoice || null;
  const bankSettings = data?.bankSettings || {};

  const totalBill = Number(invoice?.total_bill ?? invoice?.totalBill ?? 0);
  const paidAmount = Number(invoice?.paid_amount ?? invoice?.paidAmount ?? 0);
  const outstandingAmount = Number(
    invoice?.outstanding_amount ?? invoice?.outstandingAmount ?? 0
  );
  const rawDpAmount = Number(invoice?.dp_amount ?? invoice?.dpAmount ?? 0);
  const dpPercentValue = Number(invoice?.dp_percent ?? invoice?.dpPercent ?? 50);

  const isDpScheme =
    invoice?.billing_model === 'DP' ||
    invoice?.billingModel === 'DP' ||
    rawDpAmount > 0;

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

  const payments = useMemo(() => {
    return (invoice?.payments || []).sort(
      (a: any, b: any) =>
        new Date(b.payment_date || b.paymentDate).getTime() -
        new Date(a.payment_date || a.paymentDate).getTime()
    );
  }, [invoice?.payments]);

  const pendingPayments = useMemo(() => {
    return payments.filter((p: any) => p.status === 'PENDING');
  }, [payments]);

  const isOrdersWaitingSettlement = useMemo(() => {
    const list = invoice?.orders || [];
    return list.some((link: any) => link.order?.status === 'WAITING_SETTLEMENT');
  }, [invoice?.orders]);

  const hasPendingProof = pendingPayments.length > 0;
  const isFullyPaid =
    currentStage === 'PAID' || (outstandingAmount <= 0 && paidAmount > 0);
  const canUploadProof =
    !isFullyPaid &&
    !hasPendingProof &&
    (paidAmount === 0 || isOrdersWaitingSettlement);

  const submitProof = async (formData: {
    amount: number;
    method: string;
    destinationAccount?: string;
    proofUrl: string;
    notes?: string;
  }) => {
    if (!invoiceNumber) return false;
    setSubmitting(true);
    setSuccessMsg('');
    setError('');
    try {
      const res = await api.post(`/public/invoices/${invoiceNumber}/payments`, {
        amount: formData.amount,
        method: formData.method,
        destination_account: formData.destinationAccount || null,
        proof_url: formData.proofUrl,
        notes: formData.notes || null,
      });
      setSuccessMsg(
        res.data?.message ||
          'Payment proof uploaded successfully! Awaiting admin verification.'
      );
      await loadInvoice();
      return true;
    } catch (caught) {
      setError(errorMessage(caught));
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    invoiceNumber,
    invoice,
    bankSettings,
    loading,
    submitting,
    error,
    setError,
    successMsg,
    setSuccessMsg,
    totalBill,
    paidAmount,
    outstandingAmount,
    dpAmount,
    dpPercentValue,
    isDpScheme,
    currentStage,
    payments,
    pendingPayments,
    isOrdersWaitingSettlement,
    hasPendingProof,
    canUploadProof,
    loadInvoice,
    submitProof,
  };
}
