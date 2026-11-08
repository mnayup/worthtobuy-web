import React, { useState, useEffect } from 'react';
import { Printer, FileText, Plus, Minus } from 'lucide-react';
import { api } from '~/lib/api';
import { ADMIN_WA_NUMBER } from '~/lib/whatsapp';
import {
  printShippingLabels,
  type LabelItem,
  type ShippingLabelSheet,
} from '../helpers/shipping-label-printer.helper';

interface ShippingLabelPreviewProps {
  orderNumber: string;
  shipmentId: number;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  courier?: string | null;
  serviceType?: string | null;
  items: LabelItem[];
  notes?: string | null;
  senderName?: string;
  senderPhone?: string;
  isShopee?: boolean;
}

export function ShippingLabelPreview({
  orderNumber,
  shipmentId,
  recipientName,
  recipientPhone,
  recipientAddress,
  courier,
  serviceType,
  items,
  notes,
  senderName: propSenderName,
  senderPhone: propSenderPhone,
  isShopee,
}: ShippingLabelPreviewProps) {
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
  const [itemsPerSheet, setItemsPerSheet] = useState<number>(() => {
    return items.length > 4 ? 3 : Math.max(1, items.length);
  });
  const [senderInfo, setSenderInfo] = useState<{ name: string; phone: string }>({
    name: propSenderName || 'Worthtobuy Official',
    phone: propSenderPhone || ADMIN_WA_NUMBER,
  });

  useEffect(() => {
    if (propSenderName && propSenderPhone) {
      setSenderInfo({ name: propSenderName, phone: propSenderPhone });
      return;
    }

    let isMounted = true;
    api
      .get('/settings')
      .then((res) => {
        if (!isMounted) return;
        const brand = res.data?.brand;
        const invoice = res.data?.invoice;
        const name =
          propSenderName ||
          brand?.name ||
          invoice?.businessName ||
          'Worthtobuy Official';
        const phone =
          propSenderPhone ||
          brand?.whatsapp ||
          invoice?.whatsapp ||
          ADMIN_WA_NUMBER;

        setSenderInfo({ name, phone });
      })
      .catch(() => {
        // Fallback to public overview if /settings is restricted
        api
          .get('/public/overview')
          .then((res) => {
            if (!isMounted) return;
            const brand = res.data?.brand;
            setSenderInfo({
              name: propSenderName || brand?.name || 'Worthtobuy Official',
              phone: propSenderPhone || brand?.whatsapp || ADMIN_WA_NUMBER,
            });
          })
          .catch(() => {});
      });

    return () => {
      isMounted = false;
    };
  }, [propSenderName, propSenderPhone]);

  const totalSheets = Math.max(1, Math.ceil(items.length / itemsPerSheet));

  const sheets: ShippingLabelSheet[] = Array.from({ length: totalSheets }).map((_, idx) => {
    const start = idx * itemsPerSheet;
    const end = start + itemsPerSheet;
    return {
      sheetIndex: idx + 1,
      totalSheets,
      orderNumber,
      shipmentId,
      recipientName,
      recipientPhone,
      recipientAddress,
      senderName: senderInfo.name,
      senderPhone: senderInfo.phone,
      courier,
      serviceType,
      items: items.slice(start, end),
      notes,
      isShopee,
    };
  });

  const currentSheet = sheets[activeSheetIndex] || sheets[0];

  const handlePrint = (format: '10x15' | 'A4') => {
    printShippingLabels(sheets, format);
  };

  return (
    <div className="space-y-4">
      {/* Label Controls & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-brand-700">Total Labels:</span>
          <span className="rounded-lg bg-brand-100 px-2 py-0.5 font-black text-brand-900">
            {totalSheets} {totalSheets > 1 ? 'Labels' : 'Label'}
          </span>
          {items.length > 1 && (
            <div className="flex items-center gap-1 ml-2">
              <span className="text-brand-500 text-xs">Items/Label:</span>
              <button
                type="button"
                onClick={() => setItemsPerSheet((prev) => Math.max(1, prev - 1))}
                disabled={itemsPerSheet <= 1}
                className="h-6 w-6 rounded border border-brand-200 bg-white font-bold
                  hover:bg-brand-50 disabled:opacity-40 cursor-pointer flex items-center
                  justify-center"
                title="Fewer items per label (Creates more labels)"
              >
                <Minus size={12} />
              </button>
              <span className="font-bold text-xs w-4 text-center">{itemsPerSheet}</span>
              <button
                type="button"
                onClick={() => setItemsPerSheet((prev) => Math.min(items.length, prev + 1))}
                disabled={itemsPerSheet >= items.length}
                className="h-6 w-6 rounded border border-brand-200 bg-white font-bold
                  hover:bg-brand-50 disabled:opacity-40 cursor-pointer flex items-center
                  justify-center"
                title="More items per label (Fewer labels)"
              >
                <Plus size={12} />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handlePrint('10x15')}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-1.5
              text-xs font-bold text-white hover:bg-slate-800 transition shadow-xs cursor-pointer"
          >
            <Printer size={14} />
            <span>Print 10x15 cm (Thermal)</span>
          </button>
          <button
            type="button"
            onClick={() => handlePrint('A4')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-brand-200
              bg-white px-3 py-1.5 text-xs font-bold text-brand-800 hover:bg-brand-50
              transition shadow-2xs cursor-pointer"
          >
            <FileText size={14} className="text-brand-600" />
            <span>Print A4</span>
          </button>
        </div>
      </div>

      {/* Pagination tabs if multiple sheets */}
      {totalSheets > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {sheets.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveSheetIndex(idx)}
              className={
                'rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ' +
                (activeSheetIndex === idx
                  ? 'bg-brand-900 text-white'
                  : 'bg-brand-50 text-brand-600 hover:bg-brand-100')
              }
            >
              Label {idx + 1} of {totalSheets}
            </button>
          ))}
        </div>
      )}

      {/* Thermal Label Mock Preview (10x15 cm aspect ratio) */}
      <div className="flex justify-center p-2 bg-slate-100/70 rounded-2xl border border-slate-200">
        <div
          className="w-full max-w-[360px] bg-white rounded-xl border-2 border-slate-900 p-4
            shadow-md text-xs font-sans flex flex-col space-y-2.5"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-1.5">
            <span className="font-black tracking-tight text-slate-950 text-lg">
              WORTHTOBUY
            </span>
            <span className="rounded bg-slate-900 px-2 py-0.5 text-[11px] font-black text-white">
              LABEL {currentSheet.sheetIndex} / {currentSheet.totalSheets}
            </span>
          </div>

          <div className="flex justify-between text-xs font-extrabold text-slate-900">
            <span>
              Order: <strong className="font-black text-slate-950">{orderNumber}</strong>
            </span>
            <span>
              Shipment: <strong className="font-black text-slate-950">#{shipmentId}</strong>
            </span>
          </div>

          {/* Courier Box on Label (Omitted on Shopee) */}
          {isShopee ? (
            <div className="rounded border-2 border-amber-600 bg-amber-50 px-2.5 py-2 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider">
                Metode Pengiriman
              </span>
              <span className="text-xs font-black text-amber-900 tracking-wide">
                Checkout Shopee (Packing List)
              </span>
            </div>
          ) : (
            <>
              <div className="rounded border-2 border-slate-900 bg-slate-50 px-2.5 py-2 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-slate-900 tracking-wider">
                  Ekspedisi / Kurir
                </span>
                <span className="text-sm font-black text-slate-950 tracking-wide">
                  {courier || 'JNE'}{serviceType ? ` • ${serviceType}` : ''}
                </span>
              </div>

              {/* Recipient Box */}
              <div className="rounded border-2 border-slate-900 p-2.5 space-y-0.5">
                <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider block">
                  Penerima / Recipient
                </span>
                <div className="font-black text-slate-950 text-sm">{recipientName}</div>
                <div className="font-black text-slate-900 text-xs">{recipientPhone}</div>
                <div className="text-xs font-bold text-slate-900 leading-snug pt-1">
                  {recipientAddress || '-'}
                </div>
              </div>

              {/* Sender Box */}
              <div className="rounded border-2 border-slate-900 bg-slate-50 p-2 text-[11px] font-extrabold text-slate-900">
                <span className="font-black text-slate-800 uppercase tracking-wider block text-[10px]">
                  Pengirim / Sender
                </span>
                <span className="font-black text-slate-950">{senderInfo.name}</span> •{' '}
                {senderInfo.phone} (Jakarta)
              </div>
            </>
          )}

          {/* Items Preview Table */}
          <div className="border-t-2 border-slate-900 pt-2 space-y-1.5">
            <div className="flex justify-between font-black text-xs text-slate-950">
              <span>Detail Barang ({currentSheet.items.length} items)</span>
              <span>
                Qty:{' '}
                {currentSheet.items.reduce((s, i) => s + i.quantity, 0)}
              </span>
            </div>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {currentSheet.items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start justify-between text-xs border-b
                    border-dashed border-slate-400 pb-1"
                >
                  <div className="pr-2">
                    <span className="font-black text-slate-950 block">{item.name}</span>
                    <span className="text-[11px] font-extrabold text-slate-800">
                      {[item.variant, item.size, item.color].filter(Boolean).join(' • ') || '-'}
                    </span>
                  </div>
                  <span className="font-black text-sm text-slate-950 shrink-0">{item.quantity}x</span>
                </div>
              ))}
            </div>
          </div>

          {notes && (
            <div
              className={
                'text-[11px] font-bold text-slate-900 bg-amber-50 p-1.5 rounded ' +
                'border border-amber-300'
              }
            >
              <strong className="font-black text-amber-950">Catatan:</strong> {notes}
            </div>
          )}

          {/* Wajib Video Unboxing Warning Box */}
          <div className="rounded-md border-[2.5px] border-slate-950 p-2.5 text-center bg-white space-y-1.5 shadow-xs mt-auto">
            <div className="text-xs font-black tracking-tight text-slate-950 uppercase leading-snug">
              <u>WAJIB VIDEO UNBOXING. TIDAK TERIMA COMPLAIN TANPA VIDEO UNBOXING.</u>
            </div>
            <div className="text-[10.5px] font-extrabold text-slate-950 leading-snug space-y-0.5">
              <div>Rekam jelas proses sebelum membuka paket hingga kelihatan barang yang diterima. Video tidak putus-putus (no edit).</div>
              <div>Max complain 1x24 jam setelah barang diterima.</div>
              <div className="pt-0.5">Terimakasih atas ordernya. Ditunggu next ordernya yaa ❤️</div>
            </div>
          </div>

          {/* Footer Barcode look */}
          <div
            className={
              'pt-1.5 border-t-2 border-slate-900 flex items-center justify-between ' +
              'text-[10px] font-black text-slate-950'
            }
          >
            <span>WORTH TO BUY JASTIP</span>
            <span>
              PAGE {currentSheet.sheetIndex} OF {currentSheet.totalSheets}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
