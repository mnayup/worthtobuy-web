import React, { useState } from 'react';
import { Printer, FileText, Plus, Minus } from 'lucide-react';
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
  items: LabelItem[];
  notes?: string | null;
}

export function ShippingLabelPreview({
  orderNumber,
  shipmentId,
  recipientName,
  recipientPhone,
  recipientAddress,
  items,
  notes,
}: ShippingLabelPreviewProps) {
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
  const [itemsPerSheet, setItemsPerSheet] = useState<number>(() => {
    return items.length > 4 ? 3 : Math.max(1, items.length);
  });

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
      senderName: 'Worthtobuy Official',
      senderPhone: '0812-3456-7890',
      items: items.slice(start, end),
      notes,
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
          className="w-full max-w-[340px] bg-white rounded-xl border-2 border-slate-900 p-4
            shadow-md text-[11px] font-sans flex flex-col space-y-2.5"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-1.5">
            <span className="font-black tracking-tight text-slate-900 text-base">
              WORTHTOBUY
            </span>
            <span className="rounded bg-slate-900 px-1.5 py-0.5 text-[9px] font-bold text-white">
              LABEL {currentSheet.sheetIndex} / {currentSheet.totalSheets}
            </span>
          </div>

          <div className="flex justify-between text-[10px] text-slate-600">
            <span>
              Order: <strong className="text-slate-900">{orderNumber}</strong>
            </span>
            <span>
              Shipment: <strong className="text-slate-900">#{shipmentId}</strong>
            </span>
          </div>

          {/* Recipient Box */}
          <div className="rounded border border-slate-800 p-2 space-y-0.5">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
              Penerima / Recipient
            </span>
            <div className="font-black text-slate-900 text-xs">{recipientName}</div>
            <div className="font-bold text-slate-700 text-[10px]">{recipientPhone}</div>
            <div className="text-[10px] text-slate-800 leading-tight pt-1">
              {recipientAddress || '-'}
            </div>
          </div>

          {/* Sender Box */}
          <div className="rounded border border-slate-300 bg-slate-50 p-1.5 text-[9px]">
            <span className="font-bold text-slate-500 uppercase tracking-wider block text-[8px]">
              Pengirim / Sender
            </span>
            <span className="font-bold text-slate-800">Worthtobuy Official</span> • 0812-3456-7890
            (Jakarta)
          </div>

          {/* Items Preview Table */}
          <div className="border-t border-slate-300 pt-1.5 space-y-1">
            <div className="flex justify-between font-bold text-[10px] text-slate-700">
              <span>Detail Barang ({currentSheet.items.length} items)</span>
              <span>
                Qty:{' '}
                {currentSheet.items.reduce((s, i) => s + i.quantity, 0)}
              </span>
            </div>
            <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
              {currentSheet.items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start justify-between text-[10px] border-b
                    border-dashed border-slate-200 pb-1"
                >
                  <div className="pr-2">
                    <span className="font-bold text-slate-900 block">{item.name}</span>
                    <span className="text-[9px] text-slate-500">
                      {[item.variant, item.size, item.color].filter(Boolean).join(' • ') || '-'}
                    </span>
                  </div>
                  <span className="font-black text-slate-900 shrink-0">{item.quantity}x</span>
                </div>
              ))}
            </div>
          </div>

          {notes && (
            <div
              className={
                'text-[9px] text-slate-500 bg-amber-50/50 p-1 rounded ' +
                'border border-amber-200/50'
              }
            >
              <strong className="text-amber-800">Catatan:</strong> {notes}
            </div>
          )}

          {/* Footer Barcode look */}
          <div
            className={
              'pt-2 border-t border-slate-900 flex items-center justify-between ' +
              'text-[9px] font-bold text-slate-600'
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
