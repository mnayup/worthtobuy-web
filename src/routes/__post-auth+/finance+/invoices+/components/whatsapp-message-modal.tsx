import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Copy, ExternalLink, RefreshCw, Send, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api, errorMessage } from '~/lib/api';
import {
  DEFAULT_WHATSAPP_TEMPLATES,
  renderInvoiceWhatsappTemplate,
} from '../helpers/invoice-helpers';
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
  const [templatesMap, setTemplatesMap] = useState<Record<string, string>>(DEFAULT_WHATSAPP_TEMPLATES);
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

  // 1. Fetch DB saved templates on open
  useEffect(() => {
    if (!open) return;
    let active = true;

    const loadTemplates = async () => {
      try {
        const res = await api.get('/settings');
        const dbTemplates = res.data?.whatsapp_templates;
        if (active && dbTemplates && typeof dbTemplates === 'object') {
          setTemplatesMap((prev) => ({
            ...prev,
            ...dbTemplates,
          }));
        }
      } catch {
        // Fallback to default templates
      }
    };

    loadTemplates();
    return () => {
      active = false;
    };
  }, [open]);

  // 2. Select initial template type and populate rendered message
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

    const rawTemplate =
      templatesMap[defaultType] ||
      DEFAULT_WHATSAPP_TEMPLATES[defaultType] ||
      DEFAULT_WHATSAPP_TEMPLATES.BILLING;

    setMessage(
      renderInvoiceWhatsappTemplate({
        template: rawTemplate,
        invoice,
        templateType: defaultType,
        billingModel: model,
        eventValue: 'ALL',
      })
    );
    setError('');
  }, [open, invoice, templatesMap]);

  // Helper to re-generate message from template
  const generateMessage = (type: string, model: string, evt: string) => {
    const rawTemplate =
      templatesMap[type] ||
      DEFAULT_WHATSAPP_TEMPLATES[type] ||
      DEFAULT_WHATSAPP_TEMPLATES.BILLING;

    return renderInvoiceWhatsappTemplate({
      template: rawTemplate,
      invoice,
      templateType: type,
      billingModel: model,
      eventValue: evt,
    });
  };

  if (!open) return null;

  async function save(openWhatsapp: boolean) {
    if (!message.trim()) {
      setError('Pesan WhatsApp tidak boleh kosong.');
      return;
    }
    setSaving(true);
    setError('');
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
        // Using api.whatsapp.com directly prevents wa.me redirects from stripping 4-byte UTF-8 emojis
        window.open(
          `https://api.whatsapp.com/send/?phone=${phone}&text=${encoded}`,
          '_blank',
          'noopener,noreferrer'
        );
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
        {/* Header */}
        <div
          className={
            'flex items-center justify-between border-b border-brand-100 ' +
            'px-6 py-4 bg-brand-50/40'
          }
        >
          <div>
            <h2 className="font-black text-brand-900 text-lg">
              Kirim Notifikasi WhatsApp
            </h2>
            <p className="text-xs text-brand-500">
              Pilih jenis pesan di bawah. Pesan otomatis disesuaikan dengan data tagihan & link portal customer.
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

        {/* Body */}
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

          {/* Selectors */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label text-xs">Jenis Pesan (Template)</label>
              <select
                className="input text-xs"
                value={templateType}
                onChange={(e) => {
                  const val = e.target.value;
                  setTemplateType(val);
                  setMessage(generateMessage(val, billingModel, selectedEvent));
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
              <label className="label text-xs">Event / Batch</label>
              <select
                className="input text-xs"
                value={selectedEvent}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedEvent(val);
                  setMessage(generateMessage(templateType, billingModel, val));
                }}
              >
                <option value="ALL">Semua event pada invoice ini</option>
                {eventCodes.map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>
            </div>

            {templateType === 'BILLING' && (
              <div className="sm:col-span-2">
                <label className="label text-xs">Skema Billing</label>
                <select
                  className="input text-xs"
                  value={billingModel}
                  onChange={(e) => {
                    const val = e.target.value;
                    setBillingModel(val);
                    setMessage(generateMessage(templateType, val, selectedEvent));
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

          {/* Quick Regenerate & Settings Link */}
          <div className="flex items-center justify-between pt-1">
            <Link
              to="/system/settings"
              target="_blank"
              className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-500 hover:text-brand-800 transition"
              title="Buka pengaturan untuk mengedit susunan format kata template master"
            >
              <ExternalLink size={12} /> Kelola format template di Pengaturan
            </Link>

            <button
              type="button"
              className="btn-secondary text-xs py-1 px-2.5"
              onClick={() => setMessage(generateMessage(templateType, billingModel, selectedEvent))}
              title="Muat ulang teks sesuai template master"
            >
              <RefreshCw size={13} className="text-brand-500" /> Reset ke Template
            </button>
          </div>

          {/* Message Content Textarea */}
          <div>
            <label className="label text-xs">Isi Pesan WhatsApp</label>
            <textarea
              className="input min-h-64 whitespace-pre-wrap leading-relaxed font-mono text-xs w-full focus:ring-2 focus:ring-brand-500/20"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tuliskan pesan WhatsApp..."
            />
            <p className="mt-1 text-[11px] text-brand-400">
              Pesan ini otomatis memuat data invoice, tautan portal bukti transfer, dan icon emoji secara lengkap. Anda dapat menambahkan catatan khusus sebelum mengirim.
            </p>
          </div>

          {/* Footer Actions */}
          <div
            className={
              'flex flex-col-reverse gap-2 border-t border-brand-100 pt-4 ' +
              'sm:flex-row sm:justify-end'
            }
          >
            <button type="button" onClick={onClose} className="btn-secondary text-xs">
              Batal
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => save(false)}
              className="btn-secondary text-xs"
            >
              <Copy size={14} /> {saving ? 'Menyimpan...' : 'Simpan & Salin Teks'}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => save(true)}
              className="btn-primary text-xs"
            >
              <Send size={14} /> {saving ? 'Membuka WhatsApp...' : 'Simpan & Buka WhatsApp'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
