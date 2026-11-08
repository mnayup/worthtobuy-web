import { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  CheckCircle2,
  PackageCheck,
  Truck,
  Receipt,
  Clock,
  ShieldAlert,
  X,
  Sparkles,
} from 'lucide-react';
import { api, errorMessage } from '~/lib/api';
import { money } from '~/lib/format';

interface ChangeStatusModalProps {
  open: boolean;
  order: any | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface StatusCardOption {
  value: string;
  label: string;
  badge: string;
  description: string;
  icon: any;
  colorScheme: {
    activeBorder: string;
    activeBg: string;
    activeRing: string;
    iconActive: string;
    iconDefault: string;
    badgeCls: string;
  };
}

const STATUS_OPTIONS: StatusCardOption[] = [
  {
    value: 'READY_TO_SHIP',
    label: 'Ready to Ship',
    badge: 'Direkomendasikan',
    description: 'Barang sudah tiba & dipilah. Otomatis membuat antrean pengiriman / bundling ke shipment.',
    icon: PackageCheck,
    colorScheme: {
      activeBorder: 'border-cyan-600',
      activeBg: 'bg-cyan-50/50',
      activeRing: 'ring-cyan-600/10',
      iconActive: 'bg-cyan-600 text-white border-cyan-400',
      iconDefault: 'bg-cyan-100 text-cyan-700 border-cyan-200',
      badgeCls: 'bg-cyan-100 text-cyan-800',
    },
  },
  {
    value: 'SHIPPED',
    label: 'Shipped',
    badge: 'Dalam Pengiriman',
    description: 'Pesanan sudah dikirim ke kurir ekspedisi atau diserahkan kepada pelanggan.',
    icon: Truck,
    colorScheme: {
      activeBorder: 'border-sky-600',
      activeBg: 'bg-sky-50/50',
      activeRing: 'ring-sky-600/10',
      iconActive: 'bg-sky-600 text-white border-sky-400',
      iconDefault: 'bg-sky-100 text-sky-700 border-sky-200',
      badgeCls: 'bg-sky-100 text-sky-800',
    },
  },
  {
    value: 'COMPLETED',
    label: 'Completed',
    badge: 'Selesai',
    description: 'Seluruh proses pesanan dan pengiriman telah diterima dengan sukses oleh pelanggan.',
    icon: CheckCircle2,
    colorScheme: {
      activeBorder: 'border-emerald-600',
      activeBg: 'bg-emerald-50/50',
      activeRing: 'ring-emerald-600/10',
      iconActive: 'bg-emerald-600 text-white border-emerald-400',
      iconDefault: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      badgeCls: 'bg-emerald-100 text-emerald-800',
    },
  },
  {
    value: 'WAITING_SETTLEMENT',
    label: 'Waiting Settlement',
    badge: 'Menunggu Pelunasan',
    description: 'Menahan status pengiriman hingga ongkir riil / penyesuaian akhir diselesaikan.',
    icon: Receipt,
    colorScheme: {
      activeBorder: 'border-orange-600',
      activeBg: 'bg-orange-50/50',
      activeRing: 'ring-orange-600/10',
      iconActive: 'bg-orange-600 text-white border-orange-400',
      iconDefault: 'bg-orange-100 text-orange-700 border-orange-200',
      badgeCls: 'bg-orange-100 text-orange-800',
    },
  },
];

export function ChangeOrderStatusModal({
  open,
  order,
  onClose,
  onSuccess,
}: ChangeStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('READY_TO_SHIP');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!open || !order) return null;

  const orderNumber = order.order_number || order.orderNumber || `#${order.id}`;
  const totalBill = Number(order.total_bill ?? order.totalBill ?? 0);
  const outstandingAmount = Number(order.outstanding_amount ?? order.outstandingAmount ?? 0);

  const activeInvoiceLink = (order.invoice_links || order.invoiceLinks || []).find(
    (l: any) => l.invoice && !l.invoice.deleted_at && l.invoice.status !== 'CANCELLED'
  );
  const invoice = activeInvoiceLink?.invoice;
  const invoiceNumber = invoice?.invoice_number || invoice?.invoiceNumber || '-';
  const invoiceStatus = invoice?.status || '-';
  const invoiceOutstanding = Number(invoice?.outstanding_amount ?? invoice?.outstandingAmount ?? 0);

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      await api.patch(`/orders/${order.id}/status`, { status: selectedStatus });
      onSuccess();
      onClose();
    } catch (caught: any) {
      setError(errorMessage(caught));
    } finally {
      setSaving(false);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-brand-950/45 backdrop-blur-xs sm:items-center p-3 sm:p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl border border-brand-200 animate-in fade-in-50 duration-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-brand-100 px-6 py-4 bg-brand-50/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded-md">
                <Sparkles size={12} className="text-emerald-600" />
                Full Payment Verified
              </span>
              <span className="text-xs font-mono font-bold text-brand-500">
                {orderNumber}
              </span>
            </div>
            <h2 className="text-base font-black text-brand-950 mt-1">
              Ubah Status Pesanan
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-brand-400 hover:bg-brand-100 hover:text-brand-700 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <form onSubmit={handleConfirm} className="scrollbar-thin overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="rounded-2xl bg-cherry-50 border border-cherry-200 p-3.5 text-xs font-bold text-cherry-700 flex items-center gap-2">
              <ShieldAlert size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Context box */}
          <div className="rounded-2xl border border-brand-200 bg-brand-50/60 p-4 space-y-2.5 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-brand-500 font-semibold text-[11px]">Nomor Pesanan</p>
                <p className="font-mono font-extrabold text-brand-900 mt-0.5">{orderNumber}</p>
              </div>
              <div>
                <p className="text-brand-500 font-semibold text-[11px]">Status Saat Ini</p>
                <span className="inline-block font-extrabold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded text-[11px] mt-0.5">
                  {order.status}
                </span>
              </div>
            </div>

            {invoice && (
              <div className="border-t border-brand-200/70 pt-2.5 grid grid-cols-2 gap-2">
                <div>
                  <p className="text-brand-500 font-semibold text-[11px]">Invoice Terkait</p>
                  <p className="font-mono font-bold text-brand-900 mt-0.5">{invoiceNumber}</p>
                </div>
                <div>
                  <p className="text-brand-500 font-semibold text-[11px]">Status & Sisa Invoice</p>
                  <p className="font-bold text-brand-900 mt-0.5">
                    {invoiceStatus} • Sisa {money(invoiceOutstanding)}
                  </p>
                </div>
              </div>
            )}

            <div className="border-t border-brand-200/70 pt-2.5 flex items-center justify-between">
              <span className="text-brand-600 font-semibold">Total Tagihan Pesanan:</span>
              <span className="font-black text-brand-950 text-sm">
                {money(totalBill)}
              </span>
            </div>
          </div>

          {/* Interactive Card Selection for New Status */}
          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-wider text-brand-700 flex items-center justify-between">
              <span>Pilih Status Tujuan:</span>
              <span className="text-[11px] font-semibold text-brand-400 normal-case">
                Klik kartu pilihan
              </span>
            </label>

            <div className="space-y-2.5">
              {STATUS_OPTIONS.map((opt) => {
                const IconComponent = opt.icon;
                const isSelected = selectedStatus === opt.value;
                const cs = opt.colorScheme;

                return (
                  <div
                    key={opt.value}
                    onClick={() => setSelectedStatus(opt.value)}
                    className={`cursor-pointer rounded-2xl border-2 p-3.5 transition-all duration-150 ${
                      isSelected
                        ? `${cs.activeBorder} ${cs.activeBg} shadow-sm ring-2 ${cs.activeRing}`
                        : 'border-brand-200 bg-white hover:border-brand-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border transition-colors ${
                          isSelected ? cs.iconActive : cs.iconDefault
                        }`}
                      >
                        <IconComponent size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-black text-brand-950">
                            {opt.label}
                          </span>
                          <span className={`rounded-md px-2 py-0.5 text-[10px] font-black ${cs.badgeCls}`}>
                            {opt.badge}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-brand-600 leading-relaxed">
                          {opt.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {selectedStatus === 'READY_TO_SHIP' && (
            <div className="rounded-xl border border-cyan-200 bg-cyan-50/70 p-3 text-xs text-cyan-900 leading-relaxed">
              <strong>Info Pengiriman:</strong> Memilih <em>Ready to Ship</em> akan otomatis mendaftarkan order ini ke tabel Pengiriman (<em>Shipments</em>) atau menggabungkannya ke pengiriman aktif milik customer yang sama.
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-100">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="btn-secondary text-xs"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-2 cursor-pointer shadow-sm px-4 py-2 rounded-xl"
            >
              <CheckCircle2 size={16} />
              <span>{saving ? 'Memperbarui...' : 'Simpan Status Baru'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

