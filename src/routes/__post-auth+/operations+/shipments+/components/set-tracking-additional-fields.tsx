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
  ShoppingBag,
} from 'lucide-react';
import { FileUploadInput } from '~/components/FileUploadInput';

interface SetTrackingAdditionalFieldsProps {
  weightKg: string;
  setWeightKg: (val: string) => void;
  estimatedCost: number;
  actualShippingCost: string;
  setActualShippingCost: (val: string) => void;
  isShopee?: boolean;
  shopeeRefundAmount: string;
  setShopeeRefundAmount: (val: string) => void;
  shopeeUsername?: string;
  totalBill?: number;
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
  isShopee = false,
  shopeeRefundAmount,
  setShopeeRefundAmount,
  shopeeUsername,
  totalBill = 0,
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

        {isShopee ? (
          <div className="space-y-1.5">
            <label className="text-xs font-black text-orange-950 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <RotateCcw size={12} className="text-orange-600" />
                Nominal Refund Shopee
              </span>
              <span className="text-[10px] font-bold text-orange-700 bg-orange-100 px-1.5 py-0.5 rounded">
                Shopee CO
              </span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-orange-700">
                Rp
              </span>
              <input
                type="text"
                className="input !h-9 pl-9 text-xs font-black text-orange-900 border-orange-300 bg-orange-50/50 focus:border-orange-500"
                placeholder="0"
                value={
                  shopeeRefundAmount
                    ? Number(shopeeRefundAmount).toLocaleString('id-ID')
                    : ''
                }
                onChange={(e) => setShopeeRefundAmount(e.target.value.replace(/\D/g, ''))}
              />
            </div>
          </div>
        ) : (
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
        )}
      </div>

      {/* Difference Indicator Banner or Shopee Refund Banner */}
      {isShopee ? (
        <div className="rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50 via-amber-50/60 to-orange-50 p-4 space-y-2.5">
          <div className="flex items-start gap-2.5">
            <div className="grid h-7 w-7 place-items-center rounded-xl bg-orange-500 text-white shrink-0 mt-0.5 shadow-xs">
              <ShoppingBag size={14} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <strong className="font-bold text-sm text-orange-950">
                  Pengiriman via Shopee (Checkout Shopee)
                </strong>
                {shopeeUsername && (
                  <span className="text-[10px] font-bold text-orange-800 bg-orange-200/80 px-2 py-0.5 rounded-md">
                    Akun: {shopeeUsername}
                  </span>
                )}
              </div>
              <p className="text-xs text-orange-800 leading-relaxed">
                Customer checkout mandiri di Shopee. Karena customer sudah membayar pesanan ini sebelumnya, masukkan nominal yang harus <strong>dikembalikan (Refund)</strong> ke customer.
              </p>
            </div>
          </div>

          {Number(shopeeRefundAmount || 0) > 0 ? (
            <div className="rounded-xl bg-white border border-orange-200 p-2.5 text-xs text-orange-950 flex items-center justify-between">
              <span className="font-medium text-orange-800">
                Tiket Refund Otomatis: <strong>Rp{Number(shopeeRefundAmount).toLocaleString('id-ID')}</strong>
              </span>
              <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                ✓ Otomatis Masuk Menu Refund
              </span>
            </div>
          ) : (
            <p className="text-[11px] text-orange-700/80 italic">
              * Masukkan nominal refund di atas jika ada dana pesanan yang harus dikembalikan ke customer. Tiket akan otomatis dibuat di menu <strong>Finance &gt; Refund</strong> saat disimpan.
            </p>
          )}

          {totalBill > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-orange-200/60">
              <span className="text-[11px] text-orange-800 font-bold">Quick Isi:</span>
              <button
                type="button"
                onClick={() => setShopeeRefundAmount(String(totalBill))}
                className="text-[10px] font-bold bg-white hover:bg-orange-100 text-orange-800 border border-orange-300 px-2 py-0.5 rounded transition cursor-pointer"
              >
                Total Pesanan (Rp{Number(totalBill).toLocaleString('id-ID')})
              </button>
              {estimatedCost > 0 && (
                <button
                  type="button"
                  onClick={() => setShopeeRefundAmount(String(estimatedCost))}
                  className="text-[10px] font-bold bg-white hover:bg-orange-100 text-orange-800 border border-orange-300 px-2 py-0.5 rounded transition cursor-pointer"
                >
                  Ongkir Awal (Rp{Number(estimatedCost).toLocaleString('id-ID')})
                </button>
              )}
              <button
                type="button"
                onClick={() => setShopeeRefundAmount('0')}
                className="text-[10px] font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-2 py-0.5 rounded transition cursor-pointer"
              >
                Rp 0
              </button>
            </div>
          )}
        </div>
      ) : (
        diff !== null && (
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
        )
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
          disabled={
            saving ||
            !trackingNumber.trim() ||
            !fullyPaid ||
            (!isShopee && actualShippingCost === '')
          }
          className={
            'btn-primary !py-2.5 !px-6 text-xs font-bold flex items-center gap-2 ' +
            (!fullyPaid || !trackingNumber.trim() || (!isShopee && actualShippingCost === '')
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
