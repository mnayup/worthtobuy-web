import React, { useState, useEffect } from 'react';
import { Truck, ShoppingBag, Check, Lock, Loader2, Info } from 'lucide-react';

interface PublicInvoiceShippingMethodCardProps {
  currentMethod: 'MANUAL' | 'SHOPEE';
  currentShopeeUsername?: string;
  isFirstProof: boolean;
  onUpdateShippingMethod: (method: 'MANUAL' | 'SHOPEE', username?: string) => Promise<boolean>;
}

export function PublicInvoiceShippingMethodCard({
  currentMethod,
  currentShopeeUsername = '',
  isFirstProof,
  onUpdateShippingMethod,
}: PublicInvoiceShippingMethodCardProps) {
  const [selectedMethod, setSelectedMethod] = useState<'MANUAL' | 'SHOPEE'>(currentMethod || 'MANUAL');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    setSelectedMethod(currentMethod || 'MANUAL');
  }, [currentMethod]);

  const hasChanged = selectedMethod !== currentMethod;

  const handleSave = async () => {
    setErrorMsg('');
    setSaving(true);
    const ok = await onUpdateShippingMethod(selectedMethod);
    setSaving(false);
    if (ok) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  const isShopee = selectedMethod === 'SHOPEE';

  // Read-only view for customers who already completed payments and cannot change anymore
  if (!isFirstProof) {
    const isSavedShopee = currentMethod === 'SHOPEE';
    return (
      <div className="rounded-3xl border border-brand-200/90 bg-white p-5 sm:p-6 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-900 text-white font-black text-xs">
              🚚
            </span>
            <h2 className="text-sm font-black text-brand-950 uppercase tracking-wider">
              Metode Pengiriman Terpilih (Shipment Method)
            </h2>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] bg-brand-100 text-brand-700 font-bold px-2.5 py-1 rounded-lg">
            <Lock size={11} /> Hanya Lihat
          </span>
        </div>

        <div
          className={`rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            isSavedShopee
              ? 'border-orange-200 bg-gradient-to-r from-orange-50 via-amber-50/40 to-orange-50 text-orange-950'
              : 'border-brand-200 bg-brand-50/40 text-brand-900'
          }`}
        >
          <div className="flex items-start sm:items-center gap-3">
            <div
              className={`grid h-10 w-10 place-items-center rounded-xl shrink-0 ${
                isSavedShopee ? 'bg-orange-500 text-white shadow-xs' : 'bg-brand-900 text-white'
              }`}
            >
              {isSavedShopee ? <ShoppingBag size={20} /> : <Truck size={20} />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-xs font-black">
                  {isSavedShopee
                    ? 'Kirim via Shopee (Checkout Shopee)'
                    : 'Manual Shipment (JNE / J&T / SiCepat / dll)'}
                </p>
              </div>
              <p className="text-[11px] text-brand-600 mt-0.5">
                {isSavedShopee
                  ? 'Pesanan akan dikirimkan melalui checkout Shopee untuk promo gratis ongkir. Admin akan menghubungi Anda via WhatsApp setelah barang siap dikirim.'
                  : 'Pesanan akan dikirimkan langsung menggunakan kurir ekspedisi standar ke alamat tujuan Anda.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Editable view (Before First Payment)
  return (
    <div className="rounded-3xl border border-brand-200/90 bg-white p-5 sm:p-7 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-cherry-600 text-white font-black text-xs">
            📦
          </span>
          <div>
            <h2 className="text-sm font-black text-brand-950 uppercase tracking-wider">
              Pilih Metode Pengiriman (Shipment Method)
            </h2>
            <p className="text-xs text-brand-500 mt-0.5">
              Tentukan bagaimana Anda ingin barang ini dikirimkan setelah tiba:
            </p>
          </div>
        </div>

        {savedSuccess && (
          <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full animate-in fade-in">
            <Check size={13} /> Pilihan tersimpan!
          </span>
        )}
      </div>

      {errorMsg && (
        <div className="rounded-xl border border-cherry-200 bg-cherry-50 p-3 text-xs font-bold text-cherry-700">
          {errorMsg}
        </div>
      )}

      {/* Method Selection Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Option 1: Manual Shipment */}
        <button
          type="button"
          onClick={() => {
            setSelectedMethod('MANUAL');
            setErrorMsg('');
          }}
          className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition cursor-pointer ${
            !isShopee
              ? 'border-brand-900 bg-brand-900 text-white shadow-md shadow-brand-950/15'
              : 'border-brand-200 bg-white text-brand-800 hover:bg-brand-50 hover:border-brand-300'
          }`}
        >
          <div
            className={`grid h-9 w-9 place-items-center rounded-xl shrink-0 mt-0.5 ${
              !isShopee ? 'bg-white/15 text-white' : 'bg-brand-100 text-brand-700'
            }`}
          >
            <Truck size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-black">Manual Shipment (Reguler)</p>
            </div>
            <p className={`text-[11px] mt-1 leading-relaxed ${!isShopee ? 'text-brand-200' : 'text-brand-500'}`}>
              Pengiriman standar via ekspedisi (JNE, J&T, SiCepat, Lion Parcel, dll) langsung ke alamat Anda.
            </p>
          </div>
        </button>

        {/* Option 2: Kirim via Shopee */}
        <button
          type="button"
          onClick={() => {
            setSelectedMethod('SHOPEE');
            setErrorMsg('');
          }}
          className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition cursor-pointer ${
            isShopee
              ? 'border-orange-500 bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/20'
              : 'border-brand-200 bg-white text-brand-800 hover:bg-orange-50/50 hover:border-orange-300'
          }`}
        >
          <div
            className={`grid h-9 w-9 place-items-center rounded-xl shrink-0 mt-0.5 ${
              isShopee ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-600'
            }`}
          >
            <ShoppingBag size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-xs font-black">Kirim via Shopee</p>
              <span
                className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                  isShopee ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-700'
                }`}
              >
                Gratis Ongkir / Voucher
              </span>
            </div>
            <p className={`text-[11px] mt-1 leading-relaxed ${isShopee ? 'text-orange-100' : 'text-brand-500'}`}>
              Checkout via Shopee agar mendapatkan promo gratis ongkir Shopee. Admin akan memberikan link checkout.
            </p>
          </div>
        </button>
      </div>

      {/* Shopee Notification Banner (No Username required) */}
      {isShopee && (
        <div className="rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50/60 p-4 space-y-2 animate-in fade-in-50 duration-200 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-orange-500 text-white shrink-0 mt-0.5 shadow-xs">
              <Info size={17} />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-black text-orange-950 uppercase tracking-wide">
                Informasi Pengiriman via Shopee
              </h4>
              <p className="text-xs text-orange-900 leading-relaxed">
                Anda memilih pengiriman via Shopee untuk memanfaatkan voucher gratis ongkir Shopee.
              </p>
              <p className="text-[11px] text-orange-800 leading-relaxed font-medium">
                Setelah barang pesanan Anda tiba dan siap dikemas, Admin kami akan secara otomatis menghubungi Anda melalui WhatsApp untuk mengirimkan link checkout produk di Shopee beserta rincian refund dana Anda. Tidak perlu input username akun sekarang.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Save Button if changed */}
      {hasChanged && (
        <div className="flex items-center justify-end pt-1">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="btn-primary !bg-brand-900 hover:!bg-brand-800 !py-2 !px-4 text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Check size={13} />
                <span>Simpan Metode Pengiriman</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
