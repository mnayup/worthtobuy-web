import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Copy, RefreshCw, Send, X } from 'lucide-react';
import { api, errorMessage } from '~/lib/api';
import { createInvoiceWhatsappTemplate } from '../helpers/invoice-helpers';
import { WhatsappInvoiceLinkCard } from './WhatsappInvoiceLinkCard';

interface Props {
  open: boolean;
  invoice: any;
  onClose: () => void;
  onSaved: (opened: boolean) => void;
}

export function WhatsappMessageModal({ open, invoice, onClose, onSaved }: Props) {
  const eventCodes = [
    ...new Set<string>(
      (invoice?.orders || [])
        .map((link: any) => String(link.order?.period?.code || ''))
        .filter(Boolean)
    ),
  ];
  const [templateType, setTemplateType] = useState('BILLING');
  const [billingModel, setBillingModel] = useState('FLEXIBLE');
  const [selectedEvent, setSelectedEvent] = useState('ALL');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const invoiceNum =
    invoice?.invoice_number ||
    invoice?.invoiceNumber ||
    (invoice?.id ? String(invoice.id) : '');
  const origin =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : 'https://worthtobuy.id';
  const publicInvoiceUrl = invoiceNum ? `${origin}/invoice/${invoiceNum}` : '';

  useEffect(() => {
    if (!open) return;
    const model = invoice?.billingModel || invoice?.billing_model || 'FLEXIBLE';
    let defaultType = 'BILLING';
    const paid = Number(invoice?.paidAmount ?? invoice?.paid_amount ?? 0);
    const outstanding = Number(invoice?.outstandingAmount ?? invoice?.outstanding_amount ?? 0);

    if (model === 'DP' && paid === 0) {
      defaultType = 'DP';
    } else if (paid > 0 && outstanding > 0) {
      defaultType = 'SETTLEMENT';
    } else if (outstanding === 0 && paid > 0) {
      defaultType = 'FULL_PAYMENT';
    }

    setTemplateType(defaultType);
    setBillingModel(model);
    setSelectedEvent('ALL');
    setMessage(
      createInvoiceWhatsappTemplate({
        invoice,
        templateType: defaultType,
        billingModel: model,
        eventValue: 'ALL',
      })
    );
    setError('');
  }, [open, invoice]);

  if (!open) return null;

  async function save(openWhatsapp: boolean) {
    if (!message.trim()) {
      setError('WhatsApp message cannot be empty.');
      return;
    }
    setSaving(true);
    try {
      await api.put(`/invoices/${invoice.id}`, {
        billingModel,
        whatsappMessage: message.trim(),
      });
      await navigator.clipboard.writeText(message.trim());
      if (openWhatsapp) {
        let phone = String(invoice.customer?.whatsapp || '').replace(/\D/g, '');
        if (phone.startsWith('0')) phone = `62${phone.slice(1)}`;
        else if (phone.startsWith('8')) phone = `62${phone}`;
        const encoded = encodeURIComponent(message.trim());
        window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank', 'noopener,noreferrer');
      }
      onSaved(openWhatsapp);
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setSaving(false);
    }
  }

  return createPortal(
    <div
      className={
        'fixed inset-0 z-[100] flex items-end justify-center bg-brand-950/40 ' +
        'backdrop-blur-sm sm:items-center sm:p-4'
      }
    >
      <div
        className={
          'max-h-[94vh] w-full max-w-2xl overflow-hidden rounded-t-3xl bg-white ' +
          'shadow-2xl sm:rounded-3xl border border-brand-100 flex flex-col'
        }
      >
        <div
          className={
            'flex items-center justify-between border-b border-brand-100 ' +
            'px-6 py-4 bg-brand-50/40'
          }
        >
          <div>
            <h2 className="font-black text-brand-900 text-lg">
              WhatsApp Notification Template
            </h2>
            <p className="text-xs text-brand-500">
              Includes embedded public invoice & proof upload portal link for customer.
            </p>
          </div>
          <button
            onClick={onClose}
            className={
              'rounded-xl p-2 text-brand-400 hover:bg-brand-100 ' +
              'hover:text-brand-700 transition'
            }
          >
            <X size={20} />
          </button>
        </div>

        <div className="scrollbar-thin overflow-y-auto p-6 space-y-4">
          {error && (
            <div
              className={
                'rounded-xl bg-cherry-50 border border-cherry-200 p-3 ' +
                'text-sm font-bold text-cherry-700'
              }
            >
              {error}
            </div>
          )}

          {/* Customer Public Invoice Portal Link Card */}
          <WhatsappInvoiceLinkCard publicInvoiceUrl={publicInvoiceUrl} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Message Type</label>
              <select
                className="input"
                value={templateType}
                onChange={(e) => {
                  const val = e.target.value;
                  setTemplateType(val);
                  setMessage(
                    createInvoiceWhatsappTemplate({
                      invoice,
                      templateType: val,
                      billingModel,
                      eventValue: selectedEvent,
                    })
                  );
                }}
              >
                <option value="DP">Down Payment Bill (Tagihan DP)</option>
                <option value="SETTLEMENT">Settlement Billing (Tagihan Pelunasan)</option>
                <option value="FULL_PAYMENT">Payment in Full (Konfirmasi Lunas)</option>
                <option value="BILLING">General Billing Statement (Tagihan Umum)</option>
                <option value="OVERDUE">Overdue Reminder (Pengingat Jatuh Tempo)</option>
                <option value="PAYMENT_CONFIRMATION">Payment Receipt Confirmation</option>
                <option value="UNAVAILABLE_ITEM">Unavailable Item Notice (Barang Kosong)</option>
                <option value="READY_TO_SHIP">Ready to Ship Notice (Barang Siap Kirim)</option>
                <option value="TRACKING">Shipping & Tracking Info (Resi Pengiriman)</option>
              </select>
            </div>
            <div>
              <label className="label">Event</label>
              <select
                className="input"
                value={selectedEvent}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedEvent(val);
                  setMessage(
                    createInvoiceWhatsappTemplate({
                      invoice,
                      templateType,
                      billingModel,
                      eventValue: val,
                    })
                  );
                }}
              >
                <option value="ALL">All events on this invoice</option>
                {eventCodes.map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>
            </div>
            {templateType === 'BILLING' && (
              <div className="sm:col-span-2">
                <label className="label">Billing Scheme</label>
                <select
                  className="input"
                  value={billingModel}
                  onChange={(e) => {
                    const val = e.target.value;
                    setBillingModel(val);
                    setMessage(
                      createInvoiceWhatsappTemplate({
                        invoice,
                        templateType,
                        billingModel: val,
                        eventValue: selectedEvent,
                      })
                    );
                  }}
                >
                  <option value="FLEXIBLE">Flexible / Custom</option>
                  <option value="DP">Deposit (DP)</option>
                  <option value="INSTALLMENT">Installments</option>
                  <option value="SETTLEMENT">Final Settlement</option>
                  <option value="FULL_PAYMENT">Full Payment</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              className="btn-secondary text-xs"
              onClick={() =>
                setMessage(
                  createInvoiceWhatsappTemplate({
                    invoice,
                    templateType,
                    billingModel,
                    eventValue: selectedEvent,
                  })
                )
              }
            >
              <RefreshCw size={14} className="text-brand-500" /> Regenerate Template
            </button>
          </div>

          <div>
            <label className="label">Message Content</label>
            <textarea
              className="input min-h-64 whitespace-pre-wrap leading-relaxed font-mono text-xs"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write WhatsApp message..."
            />
            <p className="mt-1.5 text-xs font-medium text-brand-400">
              The public invoice & proof upload link is embedded above.
            </p>
          </div>

          <div
            className={
              'flex flex-col-reverse gap-2 border-t border-brand-100 pt-4 ' +
              'sm:flex-row sm:justify-end'
            }
          >
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => save(false)}
              className="btn-secondary"
            >
              <Copy size={15} /> {saving ? 'Saving...' : 'Save & Copy Text'}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => save(true)}
              className="btn-primary"
            >
              <Send size={15} /> {saving ? 'Opening...' : 'Save & Open WhatsApp'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
