import { Boxes, MessageCircle, ReceiptText } from 'lucide-react';
import { money } from '~/lib/format';
import { buildWhatsAppUrl } from '~/lib/whatsapp';

interface TrackingOrderDetailsProps {
  data: any;
}

export function TrackingOrderDetails({ data }: TrackingOrderDetailsProps) {
  const orderNumber = data.order_number ?? data.orderNumber;
  const invoiceNumber = data.invoice?.invoice_number ?? data.invoice?.invoiceNumber;
  const totalBill = data.invoice?.total_bill ?? data.invoice?.totalBill;
  const paidAmount = data.invoice?.paid_amount ?? data.invoice?.paidAmount;
  const outstandingAmount =
    data.invoice?.outstanding_amount ?? data.invoice?.outstandingAmount;

  const waUrl = buildWhatsAppUrl(
    `Halo Admin Worthtobuy, saya mau menanyakan progress pesanan nomor *${orderNumber}* (${
      invoiceNumber || ''
    }).`
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div
          className={
            'flex items-center justify-between gap-2 border-b ' +
            'border-slate-100 pb-4 mb-4'
          }
        >
          <div className="flex items-center gap-2">
            <Boxes size={18} className="text-amber-500" />
            <h4 className="text-sm font-black text-slate-900">
              Daftar Barang ({data.items.length})
            </h4>
          </div>
        </div>

        <div className="space-y-3">
          {data.items.map((item: any) => (
            <div
              key={item.id}
              className={
                'flex items-center justify-between gap-3 rounded-2xl bg-slate-50 ' +
                'p-3 text-xs border border-slate-100'
              }
            >
              <div>
                <span
                  className={
                    'rounded bg-slate-200/80 px-1.5 py-0.5 text-[10px] ' +
                    'font-black text-slate-700 uppercase'
                  }
                >
                  {item.brand}
                </span>
                <p className="mt-1 font-bold text-slate-900">{item.name}</p>
                {(item.variation || item.size || item.color) && (
                  <p className="text-[11px] text-slate-500">
                    {item.variation || item.size || item.color}
                  </p>
                )}
              </div>

              <div className="text-right shrink-0">
                <span className="font-extrabold text-slate-800">
                  x{item.quantity}
                </span>
                <div className="mt-1">
                  <span
                    className={
                      'rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] ' +
                      'font-black text-emerald-800 uppercase'
                    }
                  >
                    {item.fulfillment_status ?? item.fulfillmentStatus}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        className={
          'rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ' +
          'flex flex-col justify-between'
        }
      >
        <div>
          <div
            className={
              'flex items-center justify-between gap-2 border-b ' +
              'border-slate-100 pb-4 mb-4'
            }
          >
            <div className="flex items-center gap-2">
              <ReceiptText size={18} className="text-rose-500" />
              <h4 className="text-sm font-black text-slate-900">Status Pembayaran</h4>
            </div>
            {data.invoice && (
              <span
                className={
                  'rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ' +
                  (data.invoice.status === 'PAID'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800')
                }
              >
                {data.invoice.status === 'PAID' ? 'LUNAS' : data.invoice.status}
              </span>
            )}
          </div>

          {data.invoice ? (
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Total Tagihan:</span>
                <span className="font-black text-slate-900">
                  {money(totalBill)}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span>Pembayaran Diterima:</span>
                <span className="font-extrabold text-emerald-600">
                  {money(paidAmount)}
                </span>
              </div>

              <div
                className={
                  'flex items-center justify-between border-t ' +
                  'border-slate-100 pt-2 text-slate-600'
                }
              >
                <span>Sisa Tagihan:</span>
                <span className="font-black text-rose-600">
                  {money(outstandingAmount)}
                </span>
              </div>

              {/* Detail Refund & Bukti Transfer jika ada */}
              {Array.isArray(data.invoice.refunds) && data.invoice.refunds.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                  <span className="text-[11px] font-black uppercase text-sky-700 tracking-wider block">
                    Detail Refund ({data.invoice.refunds.length})
                  </span>
                  {data.invoice.refunds.map((ref: any) => {
                    const isDep = ref.refund_type === 'CUSTOMER_DEPOSIT';
                    return (
                      <div
                        key={ref.id}
                        className="rounded-xl border border-sky-100 bg-sky-50/50 p-2.5 text-[11px] space-y-1"
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span className="text-slate-900">{ref.refund_number}</span>
                          <span className="text-sky-700">{money(ref.amount)}</span>
                        </div>
                        <p className="text-slate-600">Alasan: {ref.reason}</p>
                        {!isDep && (ref.bank_name || ref.account_number) && (
                          <p className="text-slate-600">
                            Tujuan: {ref.bank_name} {ref.account_number ? `(${ref.account_number})` : ''} {ref.account_holder ? `a/n ${ref.account_holder}` : ''}
                          </p>
                        )}
                        {ref.proof_url && (
                          <div className="pt-1">
                            <a
                              href={ref.proof_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 font-bold text-sky-700 hover:text-sky-900 underline"
                            >
                              Lihat Bukti Transfer Refund
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              Invoice dalam proses pembuatan admin.
            </p>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={
              'flex w-full items-center justify-center gap-2 rounded-xl ' +
              'bg-slate-900 py-3 text-xs font-black text-white hover:bg-emerald-600 ' +
              'transition shadow-sm'
            }
          >
            <MessageCircle size={15} />
            <span>Tanya Admin Mengenai Pesanan Ini</span>
          </a>
        </div>
      </div>
    </div>
  );
}
