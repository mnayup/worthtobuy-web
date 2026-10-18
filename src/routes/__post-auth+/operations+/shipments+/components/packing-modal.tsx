import React, { useState, useEffect, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { X, PackageCheck, MapPin, Image, AlertCircle, CheckCircle, Truck } from 'lucide-react';
import { api, errorMessage } from '~/lib/api';
import { FileUploadInput } from '~/components/FileUploadInput';
import { SearchableSelect } from '~/components/SearchableSelect';
import type { Option } from '~/types';
import { isShipmentFullyPaid, type Shipment, type ShippingCounter } from '../types';
import { ShippingLabelPreview } from './shipping-label-preview';
import type { LabelItem } from '../helpers/shipping-label-printer.helper';

interface PackingModalProps {
  open: boolean;
  shipment: Shipment | null;
  onClose: () => void;
  onSaved: () => void;
}

export function PackingModal({
  open,
  shipment,
  onClose,
  onSaved,
}: PackingModalProps) {
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [proofBeforeUrl, setProofBeforeUrl] = useState('');
  const [courier, setCourier] = useState('JNE');
  const [customCourier, setCustomCourier] = useState('');
  const [serviceType, setServiceType] = useState('Regular (REG)');
  const [shippingCounters, setShippingCounters] = useState<ShippingCounter[]>([]);
  const [shippingCounterId, setShippingCounterId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      api
        .get('/shipping-counters?limit=200')
        .then((res) => {
          const items = res.data?.data || res.data || [];
          setShippingCounters(items);
        })
        .catch(() => {});
    }
  }, [open]);

  useEffect(() => {
    if (open && shipment) {
      setAddress(shipment.address || shipment.customer?.address || '');
      setNotes(shipment.notes || '');
      setProofBeforeUrl(shipment.proof_before_url || shipment.proofBeforeUrl || '');
      setCourier(shipment.courier || 'JNE');
      setServiceType(shipment.service_type || shipment.serviceType || 'Regular (REG)');
      const rawCounterId = shipment.shipping_counter_id ?? shipment.shippingCounterId;
      setShippingCounterId(rawCounterId ? Number(rawCounterId) : null);
      setError('');
    }
  }, [open, shipment]);

  if (!open || !shipment) return null;

  const labelItems: LabelItem[] = (shipment.order?.items || []).map((item) => ({
    name: item.product?.name || item.manual_product_name || item.manualProductName || 'Item',
    variant: item.variation || null,
    size: item.size || null,
    color: item.color || null,
    quantity: Number(item.quantity || 1),
  }));

  const fullyPaid = isShipmentFullyPaid(shipment);
  const effectiveCourier = courier === 'Other' ? customCourier.trim() : courier;

  const defaultCouriers = [
    'JNE',
    'J&T Express',
    'SiCepat',
    'Paxel',
    'Lion Parcel',
    'Anteraja',
    'POS Indonesia',
    'TIKI',
    'Ninja Xpress',
    'GoSend',
    'GrabExpress',
  ];

  const courierOptions: Option[] = [
    ...(shippingCounters.length > 0
      ? shippingCounters.map((sc) => ({
          label: `${sc.name}${sc.code && sc.code !== sc.name ? ` (${sc.code})` : ''}`,
          value: sc.name,
        }))
      : defaultCouriers.map((c) => ({ label: c, value: c }))),
    ...(courier &&
    courier !== 'Other' &&
    !shippingCounters.some((c) => c.name === courier) &&
    !defaultCouriers.includes(courier)
      ? [{ label: courier, value: courier }]
      : []),
    { label: 'Other / Custom...', value: 'Other' },
  ];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!shipment) return;

    if (!fullyPaid) {
      setError('Pesanan belum lunas. Proses packing hanya dapat dilakukan jika pesanan lunas.');
      return;
    }

    if (!address.trim() || address.trim() === '-') {
      setError('Alamat pengiriman wajib diisi lengkap sebelum memproses packing.');
      return;
    }

    if (!effectiveCourier) {
      setError('Silakan pilih kurir / ekspedisi pengiriman.');
      return;
    }

    if (!proofBeforeUrl.trim()) {
      setError('Wajib mengunggah foto bukti barang sebelum packing.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await api.put(`/shipments/${shipment.id}`, {
        address: address.trim(),
        courier: effectiveCourier,
        shippingCounterId: shippingCounterId || null,
        shipping_counter_id: shippingCounterId || null,
        serviceType: serviceType.trim() || null,
        notes: notes.trim() || null,
        proofBeforeUrl: proofBeforeUrl.trim(),
        status: 'PACKED',
        packedAt: new Date().toISOString(),
      });
      onSaved();
      onClose();
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setSaving(false);
    }
  };

  const outerCls =
    'fixed inset-0 z-[100] flex items-end justify-center ' +
    'bg-brand-900/50 backdrop-blur-sm sm:items-center sm:p-4';
  const modalCls =
    'w-full max-w-3xl max-h-[92vh] flex flex-col rounded-t-3xl bg-white ' +
    'shadow-2xl sm:rounded-3xl overflow-hidden border border-brand-100 ' +
    'animate-in fade-in-0 zoom-in-95 duration-200';
  const headerCls =
    'flex items-center justify-between border-b border-brand-100 px-6 py-4 ' +
    'bg-gradient-to-r from-amber-50/80 via-white to-amber-50/40';

  return createPortal(
    <div className={outerCls}>
      <div className={modalCls}>
        {/* Header */}
        <div className={headerCls}>
          <div className="flex items-center gap-3">
            <div
              className={
                'flex h-11 w-11 items-center justify-center rounded-2xl ' +
                'bg-amber-500 text-white shadow-md shadow-amber-500/25'
              }
            >
              <PackageCheck size={22} />
            </div>
            <div>
              <h2 className="font-black text-brand-900 text-lg tracking-tight">
                Packing & Shipping Label (Proses Packing)
              </h2>
              <p className="text-xs text-brand-500 font-medium">
                Order{' '}
                <strong className="font-bold text-brand-800">
                  {shipment.order?.orderNumber || shipment.order?.order_number || '-'}
                </strong>{' '}
                • Customer{' '}
                <strong className="font-bold text-brand-800">
                  {shipment.customer?.fullName || shipment.customer?.full_name || '-'}
                </strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-brand-400 hover:bg-brand-100
              hover:text-brand-700 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div
              className="rounded-2xl bg-cherry-50 border border-cherry-200/80 p-3.5
                text-sm font-semibold text-cherry-700 flex items-center gap-2.5 shadow-xs"
            >
              <AlertCircle size={18} className="shrink-0 text-cherry-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Address & Courier Selection */}
          <div className="rounded-2xl border border-brand-200 bg-brand-50/30 p-4 space-y-3.5">
            <div className="flex items-center justify-between">
              <label
                className={
                  'text-xs font-black text-brand-900 flex items-center ' +
                  'gap-1.5 uppercase tracking-wider'
                }
              >
                <MapPin size={14} className="text-amber-600" />
                1. Alamat Pengiriman & Kurir Ekspedisi
              </label>
              <span className="text-[11px] text-brand-500 font-medium">
                Pilih ekspedisi & pastikan alamat lengkap
              </span>
            </div>

            {/* Courier & Service Selection */}
            <div className="grid gap-3 sm:grid-cols-2 bg-white rounded-xl p-3 border border-brand-200/80 shadow-2xs">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-brand-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Truck size={13} className="text-indigo-600" />
                    Ekspedisi / Kurir <span className="text-cherry-500">*</span>
                  </span>
                  {shippingCounters.length > 0 && (
                    <span className="text-[9px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded">
                      Master Data
                    </span>
                  )}
                </label>
                <SearchableSelect
                  value={courier}
                  placeholder="Cari atau pilih ekspedisi..."
                  options={courierOptions}
                  onChange={(val) => {
                    const strVal = String(val || '');
                    setCourier(strVal);
                    const found = shippingCounters.find((c) => c.name === strVal);
                    setShippingCounterId(found ? found.id : null);
                  }}
                />
                {courier === 'Other' && (
                  <input
                    type="text"
                    required
                    className="input !h-8 text-xs mt-1"
                    placeholder="Ketik nama ekspedisi custom..."
                    value={customCourier}
                    onChange={(e) => setCustomCourier(e.target.value)}
                  />
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-brand-700">Layanan / Service Type</label>
                <input
                  type="text"
                  list="packing-service-suggestions"
                  className="input !h-9 text-xs"
                  placeholder="e.g. Regular (REG), Express, Cargo"
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                />
                <datalist id="packing-service-suggestions">
                  <option value="Regular (REG)" />
                  <option value="Next Day / Express (YES / BEST)" />
                  <option value="Cargo / JTR" />
                  <option value="Same Day" />
                  <option value="Instant" />
                  <option value="Economy (ECO)" />
                </datalist>
              </div>
            </div>

            <textarea
              rows={2}
              className="input !h-auto py-2 text-xs leading-relaxed"
              placeholder="Alamat lengkap tujuan pengiriman (Nama Jalan, No. Rumah, RT/RW, Kota, Kode Pos)..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
            <div className="flex items-center gap-2">
              <input
                type="text"
                className="input !h-8 text-xs flex-1"
                placeholder="Catatan packing (misal: bungkus bubble tebal, label fragile)..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          {/* Section 2: Label Generator & Preview */}
          <div className="rounded-2xl border border-brand-200 bg-white p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-brand-100 pb-2">
              <label
                className={
                  'text-xs font-black text-brand-900 flex items-center ' +
                  'gap-1.5 uppercase tracking-wider'
                }
              >
                <PackageCheck size={14} className="text-indigo-600" />
                2. Buat & Cetak Label Pengiriman
              </label>
              <span
                className={
                  'text-[11px] text-indigo-700 font-semibold bg-indigo-50 ' +
                  'px-2 py-0.5 rounded-md'
                }
              >
                10x15 cm Thermal & A4 Support
              </span>
            </div>
            <ShippingLabelPreview
              orderNumber={shipment.order?.orderNumber || shipment.order?.order_number || '-'}
              shipmentId={shipment.id}
              recipientName={
                shipment.customer?.fullName || shipment.customer?.full_name || 'Customer'
              }
              recipientPhone={shipment.customer?.whatsapp || '-'}
              recipientAddress={address}
              courier={effectiveCourier}
              serviceType={serviceType}
              items={labelItems}
              notes={notes}
            />
          </div>

          {/* Section 3: Evidence Before Packing Upload */}
          <div className="rounded-2xl border border-brand-200 bg-brand-50/30 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label
                className={
                  'text-xs font-black text-brand-900 flex items-center ' +
                  'gap-1.5 uppercase tracking-wider'
                }
              >
                <Image size={14} className="text-emerald-600" />
                3. Foto Bukti Sebelum Packing (Evidence Before Packing)
              </label>
              <span
                className={
                  'text-[11px] font-bold text-amber-700 bg-amber-100/70 ' +
                  'px-2 py-0.5 rounded'
                }
              >
                Wajib Upload
              </span>
            </div>
            <FileUploadInput
              allowedType="image"
              entityType="shipments"
              value={proofBeforeUrl}
              onChange={(url) => setProofBeforeUrl(url || '')}
              placeholder="Upload foto kondisi barang pesanan sebelum dipacking..."
            />
            <p className="text-[11px] text-brand-500 font-medium">
              Upload foto kondisi barang pesanan sebelum dimasukkan ke dalam paket / kardus.
            </p>
          </div>

          {/* Modal Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-100">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="btn-secondary !py-2.5 !px-5 text-xs font-bold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving || !fullyPaid || !proofBeforeUrl.trim()}
              className={
                'btn-primary !bg-amber-600 hover:!bg-amber-700 !py-2.5 !px-6 ' +
                'text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-600/25 ' +
                (saving || !fullyPaid || !proofBeforeUrl.trim()
                  ? 'opacity-50 cursor-not-allowed'
                  : 'cursor-pointer')
              }
            >
              {saving ? (
                <>
                  <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Menyimpan Packing...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  <span>Selesai Packing & Siap Kirim</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
