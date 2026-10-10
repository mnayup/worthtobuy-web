import { Check, Copy, Truck } from 'lucide-react';
import { dateTime } from '~/lib/format';

interface TrackingOrderHeaderProps {
  data: any;
  copiedResi: boolean;
  onCopyResi: (resi: string) => void;
}

export function TrackingOrderHeader({
  data,
  copiedResi,
  onCopyResi,
}: TrackingOrderHeaderProps) {
  const orderNumber = data.order_number ?? data.orderNumber;
  const invoiceNumber = data.invoice?.invoice_number ?? data.invoice?.invoiceNumber;
  const orderDate = data.order_date ?? data.orderDate;
  const trackingNumber = data.shipment?.tracking_number ?? data.shipment?.trackingNumber;
  const serviceType = data.shipment?.service_type ?? data.shipment?.serviceType;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
      <div
        className={
          'flex flex-col sm:flex-row sm:items-center justify-between ' +
          'gap-4 border-b border-slate-100 pb-6'
        }
      >
        <div>
          <div className="flex items-center gap-2">
            <span
              className={
                'rounded-full bg-slate-100 px-3 py-1 text-xs font-mono ' +
                'font-black text-slate-800 border border-slate-200'
              }
            >
              {orderNumber}
            </span>
            {data.invoice && (
              <span
                className={
                  'rounded-full bg-rose-50 px-3 py-1 text-xs font-mono ' +
                  'font-black text-rose-700 border border-rose-200'
                }
              >
                {invoiceNumber}
              </span>
            )}
          </div>

          <h2 className="mt-3 text-2xl font-black text-slate-900">
            {data.period?.name || 'Pesanan Jastip'}
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Didaftarkan pada: {dateTime(orderDate)}
          </p>
        </div>

        <div className="text-left sm:text-right">
          <span
            className={
              'inline-flex items-center gap-1.5 rounded-full bg-emerald-50 ' +
              'px-4 py-1.5 text-xs font-black uppercase text-emerald-700 ' +
              'border border-emerald-200'
            }
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            {data.status}
          </span>

          <p className="mt-2 text-xs font-bold text-slate-500">
            Tujuan: {data.customer.destinationCity}
          </p>
          <p className="text-[11px] text-slate-400 font-medium">
            Atas Nama: {data.customer.maskedName}
          </p>
        </div>
      </div>

      {data.shipment && (
        <div
          className={
            'mt-6 rounded-2xl bg-gradient-to-r from-emerald-50/80 via-white ' +
            'to-teal-50/80 p-5 border border-emerald-200/80 flex flex-col ' +
            'sm:flex-row sm:items-center justify-between gap-4'
          }
        >
          <div className="flex items-center gap-3.5">
            <div
              className={
                'flex h-12 w-12 items-center justify-center rounded-xl ' +
                'bg-emerald-600 text-white shadow-sm shrink-0'
              }
            >
              <Truck size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-slate-900">
                  {data.shipment.courier}
                </span>
                {serviceType && (
                  <span
                    className={
                      'rounded bg-emerald-100 px-2 py-0.5 text-[10px] ' +
                      'font-black uppercase text-emerald-800'
                    }
                  >
                    {serviceType}
                  </span>
                )}
              </div>
              <p className="mt-1 font-mono text-sm font-black text-emerald-800">
                Resi: {trackingNumber || '-'}
              </p>
            </div>
          </div>

          {trackingNumber && (
            <button
              type="button"
              onClick={() => onCopyResi(trackingNumber)}
              className={
                'inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 ' +
                'bg-white px-3.5 py-2 text-xs font-bold text-emerald-700 ' +
                'hover:bg-emerald-50 transition shadow-2xs cursor-pointer ' +
                'self-start sm:self-center'
              }
            >
              {copiedResi ? (
                <Check size={14} className="text-emerald-600" />
              ) : (
                <Copy size={14} />
              )}
              <span>{copiedResi ? 'Tersalin!' : 'Salin Resi'}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
