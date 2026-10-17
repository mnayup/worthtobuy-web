import React, { useState } from 'react';
import { Archive, Package, Calendar, Check, Clock } from 'lucide-react';

interface InvoiceKeepItemsSectionProps {
  invoice: any;
  updatingScheme: boolean;
  updateKeepItems?: (keep: boolean, customDate?: string) => Promise<void>;
}

export function InvoiceKeepItemsSection({
  invoice,
  updatingScheme,
  updateKeepItems,
}: InvoiceKeepItemsSectionProps) {
  const isKept = (invoice.orders || []).some((link: any) =>
    (link.order?.items || []).some(
      (it: any) => it.kept_until || it.fulfillment_status === 'KEPT'
    )
  );

  const keptUntilRaw = (invoice.orders || []).flatMap((link: any) =>
    (link.order?.items || []).map((it: any) => it.kept_until).filter(Boolean)
  )[0];

  const keptUntilDate = keptUntilRaw ? new Date(keptUntilRaw) : null;
  const remainingDays = keptUntilDate
    ? Math.ceil((keptUntilDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const default1MonthStr = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const [customDate, setCustomDate] = useState(
    keptUntilDate ? keptUntilDate.toISOString().slice(0, 10) : default1MonthStr
  );
  const [editingDate, setEditingDate] = useState(false);

  const handleToggle = async (keep: boolean) => {
    if (!updateKeepItems) return;
    await updateKeepItems(keep, keep ? customDate : undefined);
    setEditingDate(false);
  };

  const handleApplyCustomDate = async () => {
    if (!updateKeepItems || !customDate) return;
    await updateKeepItems(true, customDate);
    setEditingDate(false);
  };

  return (
    <div className="rounded-xl border border-brand-200/80 bg-white p-3.5 space-y-3 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-brand-800">
              Titip Simpan Barang (Storage & Hold Option)
            </span>
            {isKept ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-black text-indigo-700 border border-indigo-200">
                <Archive size={11} /> Titip Simpan Aktif
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-md bg-brand-100/70 px-2 py-0.5 text-[10px] font-bold text-brand-700">
                <Package size={11} /> Kirim Langsung
              </span>
            )}
          </div>
          <p className="text-xs text-brand-500 font-medium">
            {isKept
              ? `Barang disimpan di warehouse hingga ${keptUntilDate?.toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })} ${
                  remainingDays !== null
                    ? remainingDays >= 0
                      ? `(${remainingDays} hari tersisa)`
                      : '(Kedaluwarsa)'
                    : ''
                }`
              : 'Barang tidak dititip simpan dan akan langsung masuk antrean pengiriman.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isKept ? (
            <>
              <button
                type="button"
                disabled={updatingScheme}
                onClick={() => setEditingDate((v) => !v)}
                className="btn-secondary !py-1.5 !px-3 text-xs font-bold"
              >
                <Calendar size={13} /> {editingDate ? 'Tutup' : 'Ubah Tanggal'}
              </button>
              <button
                type="button"
                disabled={updatingScheme}
                onClick={() => handleToggle(false)}
                className="rounded-lg bg-rose-50 border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition shadow-xs"
              >
                Batalkan Titip
              </button>
            </>
          ) : (
            <button
              type="button"
              disabled={updatingScheme}
              onClick={() => handleToggle(true)}
              className="rounded-lg bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 text-xs font-black text-white transition shadow-xs flex items-center gap-1.5"
            >
              <Archive size={13} /> Set Titip Simpan (1 Bulan)
            </button>
          )}
        </div>
      </div>

      {isKept && editingDate && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-brand-100 text-xs">
          <label className="font-bold text-brand-700 flex items-center gap-1">
            <Clock size={13} className="text-brand-400" /> Tanggal Batas Titip:
          </label>
          <input
            type="date"
            className="input !py-1 !px-2.5 text-xs w-auto font-bold"
            value={customDate}
            onChange={(e) => setCustomDate(e.target.value)}
          />
          <button
            type="button"
            disabled={updatingScheme || !customDate}
            onClick={handleApplyCustomDate}
            className="btn-primary !py-1 !px-3 text-xs"
          >
            <Check size={13} /> Simpan Tanggal
          </button>
        </div>
      )}
    </div>
  );
}
