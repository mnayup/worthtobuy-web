import React, { useMemo, useRef, useState } from 'react';
import {
  AVAILABLE_TEMPLATE_VARIABLES,
  DEFAULT_WHATSAPP_TEMPLATES,
  renderInvoiceWhatsappTemplate,
} from '~/routes/__post-auth+/finance+/invoices+/helpers/invoice-helpers';
import { Info, MessageSquare, RotateCcw, Sparkles } from 'lucide-react';

interface Props {
  templates: Record<string, string>;
  setTemplates: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

const TEMPLATE_OPTIONS = [
  { id: 'DP', label: 'Down Payment Bill (Tagihan DP)' },
  { id: 'SETTLEMENT', label: 'Settlement Billing (Tagihan Pelunasan)' },
  { id: 'FULL_PAYMENT', label: 'Payment in Full (Konfirmasi Lunas)' },
  { id: 'BILLING', label: 'General Billing Statement (Tagihan Umum)' },
  { id: 'OVERDUE', label: 'Overdue Reminder (Pengingat Jatuh Tempo)' },
  { id: 'PAYMENT_CONFIRMATION', label: 'Payment Receipt Confirmation' },
  { id: 'UNAVAILABLE_ITEM', label: 'Unavailable Item Notice (Barang Kosong)' },
  { id: 'READY_TO_SHIP', label: 'Ready to Ship Notice (Barang Siap Kirim)' },
  { id: 'TRACKING', label: 'Shipping & Tracking Info (Resi Pengiriman)' },
];

export function SettingsWhatsappSection({ templates, setTemplates }: Props) {
  const [selectedType, setSelectedType] = useState('DP');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentTemplate =
    templates[selectedType] ||
    DEFAULT_WHATSAPP_TEMPLATES[selectedType] ||
    DEFAULT_WHATSAPP_TEMPLATES.BILLING;

  // Realistic sample invoice data for live preview
  const sampleInvoice = useMemo(
    () => ({
      id: 991,
      invoiceNumber: 'WTB-INV-2026-0089',
      customer: {
        fullName: 'Sarah Amalia',
        whatsapp: '081234567890',
      },
      orders: [
        {
          order: {
            orderNumber: 'ORD-8821',
            period: { code: 'BKK APR 2' },
            items: [
              { manualProductName: 'Gentle Woman Canvas Bag (Black)', fulfillmentStatus: 'READY_TO_SHIP' },
              { manualProductName: 'Care Bears Keychain Rainbow', fulfillmentStatus: 'UNAVAILABLE' },
            ],
            shipments: [
              { courier: 'JNE Express', trackingNumber: 'JNE8899221100' },
            ],
          },
        },
      ],
      totalBill: 450000,
      paidAmount: 225000,
      outstandingAmount: 225000,
      dueDate: new Date(Date.now() + 3 * 86400000).toISOString(),
      dpPercent: 50,
      dpAmount: 225000,
      dpSettlementNote: 'saat produk tiba di Indonesia',
      depositAmount: 25000,
    }),
    []
  );

  const samplePreview = useMemo(() => {
    return renderInvoiceWhatsappTemplate({
      template: currentTemplate,
      invoice: sampleInvoice,
      templateType: selectedType,
      billingModel: selectedType === 'DP' ? 'DP' : 'FLEXIBLE',
      eventValue: 'BKK APR 2',
    });
  }, [currentTemplate, sampleInvoice, selectedType]);

  const handleTextChange = (val: string) => {
    setTemplates((prev) => ({
      ...prev,
      [selectedType]: val,
    }));
  };

  const handleInsertVariable = (key: string) => {
    const token = `{{${key}}}`;
    const textarea = textareaRef.current;
    if (!textarea) {
      handleTextChange(currentTemplate + ' ' + token);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = currentTemplate.substring(0, start);
    const after = currentTemplate.substring(end);
    const nextVal = before + token + after;
    handleTextChange(nextVal);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + token.length, start + token.length);
    }, 50);
  };

  const handleResetCurrent = () => {
    const defaultVal =
      DEFAULT_WHATSAPP_TEMPLATES[selectedType] || DEFAULT_WHATSAPP_TEMPLATES.BILLING;
    setTemplates((prev) => ({
      ...prev,
      [selectedType]: defaultVal,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header Info Banner */}
      <div className="card p-6 border border-brand-100 bg-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                <MessageSquare size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-brand-900">
                  Master Format Template WhatsApp
                </h3>
                <p className="text-xs text-brand-500">
                  Atur susunan kata, sapaan, dan format pesan WhatsApp untuk setiap kondisi invoice.
                </p>
              </div>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-xs font-semibold text-brand-700">
            <Sparkles size={14} className="text-brand-500" />
            Tersimpan di Database
          </div>
        </div>
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Template Selector & Editor (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="card p-6 border border-brand-100 space-y-4 bg-white">
            {/* Template Type Picker */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-brand-800">
                  Pilih Jenis Pesan / Kondisi Invoice
                </label>
                <button
                  type="button"
                  onClick={handleResetCurrent}
                  className="text-xs text-brand-500 hover:text-brand-800 flex items-center gap-1 transition"
                  title="Kembalikan template ini ke format standar awal"
                >
                  <RotateCcw size={12} /> Reset ke Format Standar
                </button>
              </div>
              <select
                className="input text-xs w-full font-medium"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                {TEMPLATE_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Dynamic Variables Tool Bar */}
            <div className="rounded-xl border border-brand-100 bg-brand-50/40 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-brand-800 flex items-center gap-1.5">
                  <Info size={13} className="text-brand-500" /> Variabel Dinamis (Klik untuk Menambahkan)
                </span>
                <span className="text-[10px] text-brand-400">
                  Otomatis terisi dari data invoice
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto scrollbar-thin py-1">
                {AVAILABLE_TEMPLATE_VARIABLES.map((v) => (
                  <button
                    key={v.key}
                    type="button"
                    onClick={() => handleInsertVariable(v.key)}
                    title={`${v.description} (klik untuk insert {{${v.key}}})`}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-brand-200 text-[11px] font-medium text-brand-700 hover:bg-brand-100 hover:border-brand-300 transition shadow-2xs cursor-pointer"
                  >
                    <span className="text-brand-400 font-bold">+</span>
                    <span>{v.label}</span>
                    <code className="text-[9px] text-brand-400 bg-brand-50 px-1 py-0.5 rounded font-mono">
                      {`{{${v.key}}}`}
                    </code>
                  </button>
                ))}
              </div>
            </div>

            {/* Editor Textarea */}
            <div>
              <label className="text-xs font-bold text-brand-800 mb-1 block">
                Format Pesan ({selectedType})
              </label>
              <textarea
                ref={textareaRef}
                className="input min-h-[340px] whitespace-pre-wrap leading-relaxed font-mono text-xs w-full focus:ring-2 focus:ring-brand-500/20"
                value={currentTemplate}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder="Tuliskan format template WhatsApp..."
              />
              <p className="mt-1 text-[11px] text-brand-400">
                Gunakan tag seperti <code className="bg-brand-50 px-1 rounded font-mono font-bold text-brand-700">&#123;&#123;customerName&#125;&#125;</code> untuk data dinamis. Format WhatsApp seperti <code className="font-mono text-brand-700">*tebal*</code> dan <code className="font-mono text-brand-700">_miring_</code> didukung penuh.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Live Realistic Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="card p-6 border border-brand-100 bg-white space-y-3 sticky top-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-brand-800 flex items-center gap-1.5">
                <MessageSquare size={14} className="text-emerald-600" />
                Live Preview WhatsApp
              </h4>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Sample Customer
              </span>
            </div>

            <p className="text-[11px] text-brand-500">
              Berikut simulasi pesan yang akan langsung tampil saat staf membuka modal invoice:
            </p>

            {/* WhatsApp Chat Bubble Mockup */}
            <div className="rounded-2xl border border-brand-200 bg-[#eae6df] p-4 shadow-inner">
              <div className="rounded-2xl rounded-tl-xs bg-white p-4 shadow-sm space-y-2 text-xs text-brand-900 leading-relaxed font-sans whitespace-pre-wrap border border-black/5">
                {samplePreview}
                <div className="flex justify-end pt-1">
                  <span className="text-[10px] text-brand-400">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ✓✓
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-amber-50/60 border border-amber-200 p-3 text-xs text-amber-900 flex items-start gap-2">
              <Info size={15} className="text-amber-600 shrink-0 mt-0.5" />
              <span>
                Jangan lupa klik tombol <strong>"Save Changes"</strong> di pojok kanan atas halaman Settings ini setelah selesai mengubah template.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
