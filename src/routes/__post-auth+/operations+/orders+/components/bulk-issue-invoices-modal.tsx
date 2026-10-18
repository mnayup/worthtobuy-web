import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { FileText, X, AlertCircle, CheckCircle2, ArrowRight, Layers, Percent, Loader2, Sparkles, ExternalLink } from 'lucide-react';
import { api, errorMessage } from '~/lib/api';
import { money } from '~/lib/format';

interface BulkIssueInvoicesModalProps {
  open: boolean;
  onClose: () => void;
  selectedOrderIds: (string | number)[];
  selectedOrders: any[];
  onSuccess: (result: { invoiceIds: number[]; count: number }) => void;
}

export function BulkIssueInvoicesModal({
  open,
  onClose,
  selectedOrderIds,
  selectedOrders,
  onSuccess,
}: BulkIssueInvoicesModalProps) {
  const [billingModel, setBillingModel] = useState<'FULL_PAYMENT' | 'DP'>('DP');
  const [dpPercent, setDpPercent] = useState<number>(50);
  const [isManualDpPercent, setIsManualDpPercent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only orders with NEW status can be invoiced
  const newOrders = useMemo(() => {
    return selectedOrders.filter((order) => order.status === 'NEW');
  }, [selectedOrders]);

  // Group selected NEW orders by customer
  const customerGroups = useMemo(() => {
    const map = new Map<number, { customer: any; orders: any[]; totalAmount: number }>();
    for (const order of newOrders) {
      const custId = order.customer_id || order.customerId || order.customer?.id || 0;
      const group = map.get(custId) || {
        customer: order.customer || { id: custId, full_name: 'Customer #' + custId },
        orders: [],
        totalAmount: 0,
      };
      group.orders.push(order);
      group.totalAmount += Number(order.total_bill ?? order.totalBill ?? 0);
      map.set(custId, group);
    }
    return Array.from(map.values());
  }, [newOrders]);

  const [customerUnpackedMap, setCustomerUnpackedMap] = useState<Record<number, any[]>>({});
  const [customerModeMap, setCustomerModeMap] = useState<Record<number, 'NEW' | 'EXISTING'>>({});
  const [customerSelectedInvMap, setCustomerSelectedInvMap] = useState<Record<number, string>>({});

  const custIdsKey = useMemo(() => {
    return customerGroups.map((g) => g.customer.id).filter(Boolean).sort().join(',');
  }, [customerGroups]);

  // Fetch unpacked invoices for all customer groups when modal opens or custIdsKey changes
  useEffect(() => {
    if (!open) return;
    let active = true;

    const custIds = customerGroups.map((g) => g.customer.id).filter(Boolean);
    if (!custIds.length) return;

    Promise.all(
      custIds.map(async (cid) => {
        try {
          const res = await api.get(`/invoices/unpacked-invoices?customerId=${cid}`);
          return { cid, list: res.data || [] };
        } catch {
          return { cid, list: [] };
        }
      })
    ).then((results) => {
      if (!active) return;
      const uMap: Record<number, any[]> = {};
      const sMap: Record<number, string> = {};

      results.forEach(({ cid, list }) => {
        uMap[cid] = list;
        if (list.length > 0) {
          sMap[cid] = String(list[0].id);
        }
      });

      setCustomerUnpackedMap(uMap);
      setCustomerModeMap((prev) => {
        const next = { ...prev };
        results.forEach(({ cid }) => {
          if (!next[cid]) next[cid] = 'NEW';
        });
        return next;
      });
      setCustomerSelectedInvMap((prev) => {
        const next = { ...prev };
        results.forEach(({ cid, list }) => {
          if (!next[cid] && list.length > 0) {
            next[cid] = String(list[0].id);
          }
        });
        return next;
      });
    });

    return () => {
      active = false;
    };
  }, [open, custIdsKey]);

  const grandTotal = useMemo(() => {
    return customerGroups.reduce((sum, g) => sum + g.totalAmount, 0);
  }, [customerGroups]);

  const calculatedDpAmount = useMemo(() => {
    return Math.round((grandTotal * dpPercent) / 100);
  }, [grandTotal, dpPercent]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetOrderIds = newOrders.length ? newOrders.map((o) => o.id) : selectedOrderIds;
    if (!targetOrderIds.length) {
      setError('Please select at least one order with NEW status.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Build customer invoice mapping where mode is EXISTING
      const custInvoiceMapPayload: Record<number, string> = {};
      for (const [cid, mode] of Object.entries(customerModeMap)) {
        if (mode === 'EXISTING' && customerSelectedInvMap[Number(cid)]) {
          custInvoiceMapPayload[Number(cid)] = customerSelectedInvMap[Number(cid)];
        }
      }

      const res = await api.post('/invoices/bulk-issue', {
        orderIds: targetOrderIds.map(Number),
        billingModel,
        dpPercent: billingModel === 'DP' ? dpPercent : null,
        customerInvoiceMap: custInvoiceMapPayload,
      });

      const data = res.data;
      onSuccess({ invoiceIds: data.invoiceIds || [], count: data.count || 0 });
      onClose();
    } catch (err) {
      setError(errorMessage(err) || 'Failed to issue bulk invoices.');
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-brand-950/45 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="max-h-[94vh] w-full max-w-2xl overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl border border-brand-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-brand-100 px-6 py-4 bg-brand-50/50">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-honey-100 text-honey-700">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="text-base font-black text-brand-900">
                Bulk Issue Invoices
              </h2>
              <p className="text-xs text-brand-500">
                Issue consolidated invoices for {selectedOrderIds.length} selected orders across {customerGroups.length} customer(s).
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-brand-400 hover:bg-brand-100 hover:text-brand-700 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <form onSubmit={handleSubmit} className="scrollbar-thin flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="flex items-start gap-2.5 rounded-2xl bg-cherry-50 border border-cherry-200 p-3.5 text-xs font-bold text-cherry-700">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-cherry-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Customer Grouping Overview */}
          <div className="rounded-2xl border border-brand-200/80 bg-brand-50/40 p-4">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-brand-600 flex items-center gap-1.5">
                <Layers size={14} /> Orders Grouped by Customer ({customerGroups.length})
              </span>
              <span className="text-xs font-black text-brand-900">
                Total: {money(grandTotal)}
              </span>
            </div>

            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {customerGroups.map((group, idx) => {
                const cid = group.customer.id;
                const unpacked = customerUnpackedMap[cid] || [];
                const currentMode = customerModeMap[cid] || 'NEW';
                const currentInvId = customerSelectedInvMap[cid] || '';

                return (
                  <div
                    key={idx}
                    className="rounded-xl bg-white border border-brand-100 p-3.5 text-xs shadow-sm space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 pr-2">
                        <p className="font-extrabold text-brand-900 truncate">
                          {group.customer.full_name || group.customer.fullName || 'Unknown Customer'}
                        </p>
                        <p className="text-[11px] text-brand-400">
                          {group.orders.length} order(s): {group.orders.map((o) => o.order_number || o.orderNumber).join(', ')}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-black text-brand-900">{money(group.totalAmount)}</p>
                        <span
                          className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold ${
                            currentMode === 'EXISTING'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-honey-100 text-honey-800'
                          }`}
                        >
                          {currentMode === 'EXISTING' ? 'Add to Existing' : 'New Invoice'}
                        </span>
                      </div>
                    </div>

                    {unpacked.length > 0 && (
                      <div className="rounded-xl bg-brand-50/70 border border-brand-200/70 p-2.5 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <span className="text-[11px] font-bold text-brand-700">
                            Customer has unpacked invoice:
                          </span>
                          <div className="inline-flex rounded-lg bg-white p-0.5 border border-brand-200 shadow-xs shrink-0">
                            <button
                              type="button"
                              onClick={() =>
                                setCustomerModeMap((prev) => ({ ...prev, [cid]: 'NEW' }))
                              }
                              className={`rounded-md px-2 py-1 text-[10px] font-bold transition ${
                                currentMode === 'NEW'
                                  ? 'bg-brand-900 text-white shadow-xs'
                                  : 'text-brand-600 hover:text-brand-900'
                              }`}
                            >
                              New Invoice
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setCustomerModeMap((prev) => ({ ...prev, [cid]: 'EXISTING' }))
                              }
                              className={`rounded-md px-2 py-1 text-[10px] font-bold transition ${
                                currentMode === 'EXISTING'
                                  ? 'bg-honey-500 text-brand-950 shadow-xs'
                                  : 'text-brand-600 hover:text-brand-900'
                              }`}
                            >
                              Add to Existing
                            </button>
                          </div>
                        </div>

                        {currentMode === 'EXISTING' && (
                          <div className="pt-1">
                            <select
                              className="input bg-white !py-1 !px-2 !text-[11px] font-semibold w-full"
                              value={currentInvId}
                              onChange={(e) =>
                                setCustomerSelectedInvMap((prev) => ({
                                  ...prev,
                                  [cid]: e.target.value,
                                }))
                              }
                            >
                              {unpacked.map((inv) => (
                                <option key={inv.id} value={inv.id}>
                                  {inv.invoice_number} ({inv.order_count} orders) • {money(inv.total_bill)} • Status: {inv.status}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment Scheme Selection */}
          <div className="space-y-2.5">
            <label className="text-xs font-black uppercase tracking-wider text-brand-700">
              Payment Scheme Selection (Skema Pembayaran)
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              {/* DP Option */}
              <div
                onClick={() => setBillingModel('DP')}
                className={`cursor-pointer rounded-2xl border-2 p-4 transition-all ${
                  billingModel === 'DP'
                    ? 'border-cherry-600 bg-white shadow-md ring-2 ring-cherry-600/10'
                    : 'border-brand-200 bg-white hover:border-brand-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-brand-900 text-sm">
                        Down Payment (DP)
                      </span>
                      <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-black text-amber-800">
                        Pre-Order
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-brand-500 leading-relaxed">
                      Bill down payment percentage first; customer settles balance upon fulfillment.
                    </p>
                  </div>
                  <div
                    className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition ${
                      billingModel === 'DP' ? 'border-cherry-600 bg-cherry-600' : 'border-brand-300'
                    }`}
                  >
                    {billingModel === 'DP' && <div className="h-2 w-2 rounded-full bg-white" />}
                  </div>
                </div>
              </div>

              {/* Full Payment Option */}
              <div
                onClick={() => setBillingModel('FULL_PAYMENT')}
                className={`cursor-pointer rounded-2xl border-2 p-4 transition-all ${
                  billingModel === 'FULL_PAYMENT'
                    ? 'border-cherry-600 bg-white shadow-md ring-2 ring-cherry-600/10'
                    : 'border-brand-200 bg-white hover:border-brand-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-brand-900 text-sm">
                        Direct Full Payment
                      </span>
                      <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-black text-emerald-800">
                        100% Upfront
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-brand-500 leading-relaxed">
                      Bill total order amount upfront in full with no installment.
                    </p>
                  </div>
                  <div
                    className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition ${
                      billingModel === 'FULL_PAYMENT' ? 'border-cherry-600 bg-cherry-600' : 'border-brand-300'
                    }`}
                  >
                    {billingModel === 'FULL_PAYMENT' && <div className="h-2 w-2 rounded-full bg-white" />}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* If DP is selected, show Preset DP Percent options */}
          {billingModel === 'DP' && (
            <div className="rounded-2xl border border-brand-200 bg-brand-50/50 p-4 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-brand-800 flex items-center gap-1.5">
                  <Percent size={14} className="text-cherry-600" /> Preset DP Percentage
                </span>
                <span className="text-xs font-extrabold text-cherry-700">
                  {dpPercent}% DP = {money(calculatedDpAmount)}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {[20, 30, 50, 70, 75].map((pct) => (
                  <button
                    type="button"
                    key={pct}
                    onClick={() => {
                      setDpPercent(pct);
                      setIsManualDpPercent(false);
                    }}
                    className={`rounded-xl px-3.5 py-1.5 text-xs font-black transition ${
                      dpPercent === pct && !isManualDpPercent
                        ? 'bg-cherry-600 text-white shadow-md shadow-cherry-600/20'
                        : 'bg-white border border-brand-200 text-brand-700 hover:bg-brand-50'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}

                <div className="flex items-center gap-1 ml-auto">
                  <span className="text-[11px] font-bold text-brand-500">Custom:</span>
                  <div className="relative w-20">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={dpPercent || ''}
                      onChange={(e) => {
                        const val = Math.max(1, Math.min(100, Number(e.target.value) || 0));
                        setDpPercent(val);
                        setIsManualDpPercent(true);
                      }}
                      className="input !py-1 !px-2 text-center text-xs font-black pr-6"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-brand-400">
                      %
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div className="rounded-xl bg-white border border-brand-100 p-2.5">
                  <span className="text-[11px] text-brand-500 font-semibold">Estimated DP Bill:</span>
                  <p className="text-sm font-black text-cherry-700">{money(calculatedDpAmount)}</p>
                </div>
                <div className="rounded-xl bg-white border border-brand-100 p-2.5">
                  <span className="text-[11px] text-brand-500 font-semibold">Remaining Balance:</span>
                  <p className="text-sm font-black text-brand-900">
                    {money(Math.max(0, grandTotal - calculatedDpAmount))}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Informative Note pointing to Invoice Detail */}
          <div className="flex items-start gap-2.5 rounded-2xl bg-honey-50 border border-honey-200 p-3.5 text-xs text-honey-900">
            <Sparkles size={16} className="text-honey-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Quick Issuance:</strong> Invoices will be generated immediately with the selected scheme.
              All other details (shipping destination & cost, deposit deduction, manual fee adjustments, notes, or payment verification)
              can be configured anytime on the invoice detail page.
            </p>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-brand-100 bg-brand-50/40 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="btn-secondary text-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !selectedOrderIds.length}
            className="btn-primary text-xs flex items-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Issuing Invoices...
              </>
            ) : (
              <>
                <FileText size={15} />
                Issue {customerGroups.length} Invoice{customerGroups.length > 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
