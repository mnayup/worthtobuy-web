import React from 'react';
import {
  Weight,
  DollarSign,
  Calendar,
  Image,
  Truck,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
} from 'lucide-react';
import { FileUploadInput } from '~/components/FileUploadInput';

interface SetTrackingAdditionalFieldsProps {
  weightKg: string;
  setWeightKg: (val: string) => void;
  estimatedCost: number;
  actualShippingCost: string;
  setActualShippingCost: (val: string) => void;
  shippedAt: string;
  setShippedAt: (val: string) => void;
  proofUrl: string;
  setProofUrl: (val: string) => void;
  notes: string;
  setNotes: (val: string) => void;
  orderNumber?: string;
  saving: boolean;
  fullyPaid: boolean;
  trackingNumber: string;
  onClose: () => void;
}

export function SetTrackingAdditionalFields({
  weightKg,
  setWeightKg,
  estimatedCost,
  actualShippingCost,
  setActualShippingCost,
  shippedAt,
  setShippedAt,
  proofUrl,
  setProofUrl,
  notes,
  setNotes,
  orderNumber,
  saving,
  fullyPaid,
  trackingNumber,
  onClose,
}: SetTrackingAdditionalFieldsProps) {
  const actualNum = actualShippingCost ? Number(actualShippingCost) : null;
  const diff = actualNum !== null ? actualNum - estimatedCost : null;

  return (
    <>
      {/* Weight, Estimated Cost & Actual Cost Grid */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-brand-700 flex items-center gap-1">
            <Weight size={12} className="text-brand-400" />
            Weight (kg)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            className="input !h-9 text-xs"
            placeholder="e.g. 1.5"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-brand-700 flex items-center gap-1">
            <DollarSign size={12} className="text-brand-400" />
            Estimasi Ongkir (Customer)
          </label>
          <input
            type="text"
            readOnly
            disabled
            className="input !h-9 text-xs bg-slate-100 text-slate-700 font-bold cursor-not-allowed"
            value={`Rp${Number(estimatedCost || 0).toLocaleString('id-ID')}`}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-black text-brand-900 flex items-center gap-1">
            <DollarSign size={12} className="text-indigo-600" />
            Aktual Ongkir (Resi / Kurir)
          </label>
          <input
            type="number"
            min="0"
            className="input !h-9 text-xs font-bold border-indigo-300 focus:border-indigo-600"
            placeholder="e.g. 25000"
            value={actualShippingCost}
            onChange={(e) => setActualShippingCost(e.target.value)}
            required
          />
        </div>
      </div>

      {/* Difference Indicator Banner */}
      {diff !== null && (
        <div>
          {diff > 0 ? (
            <div
              className={
                'rounded-2xl border border-amber-300 bg-amber-50 p-3.5 ' +
                'text-xs text-amber-900 flex items-start gap-2.5'
              }
            >
              <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block text-sm text-amber-950">
                  Ongkir Kurang: +Rp{diff.toLocaleString('id-ID')}
                </strong>
                <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                  Aktual ongkir lebih besar dari estimasi. Pesanan otomatis dialihkan ke status{' '}
                  <strong className="font-bold underline">WAITING_SETTLEMENT</strong> agar
                  customer membayar kekurangan ongkir sebelum pelunasan selesai.
                </p>
              </div>
            </div>
          ) : diff < 0 ? (
            <div
              className={
                'rounded-2xl border border-emerald-300 bg-emerald-50 p-3.5 ' +
                'text-xs text-emerald-900 flex items-start gap-2.5'
              }
            >
              <RotateCcw size={18} className="text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block text-sm text-emerald-950">
                  Ongkir Lebih: -Rp{Math.abs(diff).toLocaleString('id-ID')} (Menjadi Refund)
                </strong>
                <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                  Aktual ongkir lebih hemat dari estimasi. Selisih kelebihan ini otomatis dicatat
                  sebagai <strong className="font-bold underline">Refund Pelanggan</strong>, dan
                  status pengiriman langsung menjadi Sedang Dikirim (IN_TRANSIT).
                </p>
              </div>
            </div>
          ) : (
            <div
              className={
                'rounded-2xl border border-sky-300 bg-sky-50 p-3 ' +
                'text-xs text-sky-900 flex items-center gap-2'
              }
            >
              <CheckCircle size={16} className="text-sky-600 shrink-0" />
              <span>
                Ongkir pas sesuai estimasi. Pengiriman langsung menjadi Sedang Dikirim
                (IN_TRANSIT).
              </span>
            </div>
          )}
        </div>
      )}

      {/* Shipment Date */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-brand-700 flex items-center gap-1">
            <Calendar size={12} className="text-brand-400" />
            Tanggal Kirim
          </label>
          <input
            type="datetime-local"
            className="input !h-9 text-xs"
            value={shippedAt}
            onChange={(e) => setShippedAt(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-brand-700">Catatan Logistik</label>
          <input
            type="text"
            className="input !h-9 text-xs"
            placeholder="e.g. Dititipkan drop point, stiker fragile"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>

      {/* Evidence After Packing Photo (Foto Paket Tersegel & Resi) */}
      <div className="rounded-2xl border border-brand-200 bg-brand-50/30 p-3.5 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-brand-900 flex items-center gap-1">
            <Image size={13} className="text-indigo-600" />
            Foto Bukti Setelah Packing & Resi (Evidence After Packing)
          </label>
          <span className="text-[10px] text-brand-500 font-medium">Foto paket siap kirim</span>
        </div>
        <FileUploadInput
          value={proofUrl}
          onChange={setProofUrl}
          entityType="shipments"
          allowedType="image"
          placeholder="Upload foto paket tersegel dengan resi..."
        />
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
          disabled={saving || !trackingNumber.trim() || !fullyPaid || actualShippingCost === ''}
          className={
            'btn-primary !py-2.5 !px-6 text-xs font-bold flex items-center gap-2 ' +
            (!fullyPaid || !trackingNumber.trim() || actualShippingCost === ''
              ? '!bg-slate-200 !text-slate-400 !border-transparent opacity-60 ' +
                'cursor-not-allowed shadow-none'
              : '!bg-indigo-600 hover:!bg-indigo-700 shadow-md shadow-indigo-600/30 cursor-pointer')
          }
        >
          <Truck size={16} />
          {saving ? 'Menyimpan...' : 'Simpan Resi & Proses Pengiriman'}
        </button>
      </div>
    </>
  );
}
