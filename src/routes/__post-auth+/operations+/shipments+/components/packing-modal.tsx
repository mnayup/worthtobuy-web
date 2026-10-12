import React, { useState, useEffect, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { X, PackageCheck, MapPin, Image, AlertCircle, CheckCircle } from 'lucide-react';
import { api, errorMessage } from '~/lib/api';
import { FileUploadInput } from '~/components/FileUploadInput';
import { isShipmentFullyPaid, type Shipment } from '../types';
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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && shipment) {
      setAddress(shipment.address || shipment.customer?.address || '');
      setNotes(shipment.notes || '');
      setProofBeforeUrl(shipment.proof_before_url || shipment.proofBeforeUrl || '');
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

    if (!proofBeforeUrl.trim()) {
      setError('Wajib mengunggah foto bukti barang sebelum packing.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await api.put(`/shipments/${shipment.id}`, {
        address: address.trim(),
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

          {/* Section 1: Address Input */}
          <div className="rounded-2xl border border-brand-200 bg-brand-50/30 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label
                className={
                  'text-xs font-black text-brand-900 flex items-center ' +
                  'gap-1.5 uppercase tracking-wider'
                }
              >
                <MapPin size={14} className="text-amber-600" />
                1. Alamat Pengiriman (Recipient Address)
              </label>
              <span className="text-[11px] text-brand-500 font-medium">
                Pastikan alamat lengkap sebelum cetak label
              </span>
            </div>
            <textarea
              rows={3}
              className="input !h-auto py-2 text-xs leading-relaxed"
              placeholder="Nama Jalan, No. Rumah, RT/RW, Kelurahan, Kecamatan, Kota, Kode Pos..."
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
            <p className="text-xs text-brand-600">
              Foto semua barang yang telah disiapkan bersama cetakan label pengiriman sebelum
              dibungkus/disegel.
            </p>
            <FileUploadInput
              value={proofBeforeUrl}
              onChange={setProofBeforeUrl}
              entityType="shipments"
              allowedType="image"
              placeholder="Upload foto bukti sebelum packing (JPG/PNG)..."
            />
            {proofBeforeUrl && (
              <div
                className={
                  'flex items-center gap-2 text-xs font-semibold text-emerald-700 ' +
                  'bg-emerald-50 p-2 rounded-xl border border-emerald-200'
                }
              >
                <CheckCircle size={14} className="text-emerald-600 shrink-0" />
                <span>Foto bukti sebelum packing siap disimpan.</span>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-brand-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="btn-secondary !py-2.5 !px-4 text-xs font-bold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving || !address.trim() || !proofBeforeUrl.trim()}
              className={
                'btn-primary !bg-amber-600 hover:!bg-amber-700 !py-2.5 !px-6 ' +
                'text-xs font-bold flex items-center gap-2 shadow-md shadow-amber-600/20 ' +
                (!address.trim() || !proofBeforeUrl.trim()
                  ? 'opacity-50 cursor-not-allowed'
                  : 'cursor-pointer')
              }
            >
              <PackageCheck size={16} />
              <span>{saving ? 'Menyimpan...' : 'Konfirmasi Selesai Pack (PACKED)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
