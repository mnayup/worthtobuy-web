import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Boxes,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  LogOut,
  PackageSearch,
  Receipt,
  ShieldCheck,
  Truck,
  UserCheck,
  Wallet,
} from 'lucide-react';
import { dateTime, money } from '~/lib/format';
import { TrackingOrderHeader } from './tracking-order-header';
import { TrackingTimeline } from './tracking-timeline';
import { TrackingOrderDetails } from './tracking-order-details';

interface CustomerTrackingInvoiceListProps {
  result: any;
  selectedInvoice: any | null;
  onSelectInvoice: (inv: any | null) => void;
  onResetSession: () => void;
  copiedResi: boolean;
  onCopyResi: (resi: string) => void;
}

export function CustomerTrackingInvoiceList({
  result,
  selectedInvoice,
  onSelectInvoice,
  onResetSession,
  copiedResi,
  onCopyResi,
}: CustomerTrackingInvoiceListProps) {
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'UNPAID' | 'PAID'>('ALL');
  const [selectedOrderIdx, setSelectedOrderIdx] = useState(0);

  const customer = result.customer;
  const invoices: any[] = result.invoices || [];

  const filteredInvoices = invoices.filter((inv) => {
    if (filterStatus === 'PAID') return inv.status === 'PAID';
    if (filterStatus === 'UNPAID') return inv.status !== 'PAID' && inv.outstanding_amount > 0;
    return true;
  });

  // If user clicked into a specific invoice's public tracking view
  if (selectedInvoice) {
    const ordersTracking: any[] = selectedInvoice.orders_tracking || [];
    const activeTracking =
      ordersTracking[selectedOrderIdx] || selectedInvoice.tracking;

    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6 animate-rise">
        {/* Top bar to return to Invoice List or open Full Invoice Portal */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <button
            type="button"
            onClick={() => {
              onSelectInvoice(null);
              setSelectedOrderIdx(0);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3.5 py-2 text-xs font-black text-slate-800 hover:bg-rose-50 hover:text-rose-700 transition cursor-pointer self-start"
          >
            <ArrowLeft size={15} />
            <span>Kembali ke Daftar Invoice ({invoices.length})</span>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500">
              Invoice:{' '}
              <strong className="font-mono text-slate-900">
                {selectedInvoice.invoice_number}
              </strong>
            </span>
            <Link
              to={`/invoice/${encodeURIComponent(selectedInvoice.invoice_number)}?fromCustomer=${encodeURIComponent(customer.customer_code)}`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-black text-white shadow-xs hover:bg-rose-700 transition"
            >
              <FileText size={14} />
              <span>Buka Detail Invoice & Pembayaran</span>
              <ExternalLink size={12} />
            </Link>
          </div>
        </div>

        {/* If this invoice has multiple orders, allow switching between orders */}
        {ordersTracking.length > 1 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-2.5">
              Pilih Nomor Order pada Invoice {selectedInvoice.invoice_number} (
              {ordersTracking.length} Order):
            </p>
            <div className="flex flex-wrap gap-2">
              {ordersTracking.map((ordTrack, idx) => (
                <button
                  key={ordTrack.order_number || idx}
                  type="button"
                  onClick={() => setSelectedOrderIdx(idx)}
                  className={`rounded-xl px-3.5 py-2 text-xs font-black transition cursor-pointer border ${
                    selectedOrderIdx === idx
                      ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-2xs'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {ordTrack.order_number} • {ordTrack.period?.name || 'Jastip'}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTracking ? (
          <>
            <TrackingOrderHeader
              data={activeTracking}
              copiedResi={copiedResi}
              onCopyResi={onCopyResi}
            />
            <TrackingTimeline timeline={activeTracking.timeline} />
            <TrackingOrderDetails data={activeTracking} />
          </>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-xs font-bold text-slate-500">
            Data pelacakan pesanan untuk invoice ini belum tersedia.
          </div>
        )}
      </div>
    );
  }

  // Default: List View per Invoice for Verified Customer
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6 animate-rise">
      {/* Verified Customer Identity Card */}
      <div className="rounded-3xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/50 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm shrink-0">
              <UserCheck size={24} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-lg bg-emerald-100 px-2.5 py-0.5 font-mono text-xs font-black text-emerald-900 border border-emerald-200">
                  {customer.customer_code}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600/10 px-2.5 py-0.5 text-[10px] font-black uppercase text-emerald-700">
                  <ShieldCheck size={12} /> Terverifikasi
                </span>
                {customer.segment === 'PRIORITY' && (
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-black uppercase text-amber-800 border border-amber-200">
                    VIP Priority
                  </span>
                )}
              </div>
              <h2 className="mt-1.5 text-lg font-black text-slate-900">
                {customer.masked_name}
              </h2>
              <p className="text-xs font-semibold text-slate-500">
                WhatsApp: {customer.masked_phone} • {customer.destination_city}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
            {customer.deposit_balance > 0 && (
              <div className="flex items-center gap-1.5 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-black text-sky-800">
                <Wallet size={14} className="text-sky-600" />
                <span>Saldo Deposit: {money(customer.deposit_balance)}</span>
              </div>
            )}
            <button
              type="button"
              onClick={onResetSession}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 transition cursor-pointer"
            >
              <LogOut size={14} />
              <span>Ganti Customer ID</span>
            </button>
          </div>
        </div>

        {/* Summary Counters & Filter Tabs */}
        <div className="mt-5 pt-4 border-t border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs font-bold text-slate-600">
            Ditemukan <strong className="text-slate-900">{invoices.length} Invoice</strong> untuk akun Anda. Pilih invoice di bawah untuk melacak pengiriman atau pembayaran:
          </p>
          <div className="flex items-center gap-1.5">
            {[
              { key: 'ALL', label: `Semua (${invoices.length})` },
              {
                key: 'UNPAID',
                label: `Belum Lunas (${result.summary?.unpaid_invoices || 0})`,
              },
              {
                key: 'PAID',
                label: `Lunas (${result.summary?.paid_invoices || 0})`,
              },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilterStatus(tab.key as any)}
                className={`rounded-xl px-3 py-1.5 text-[11px] font-black transition cursor-pointer ${
                  filterStatus === tab.key
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Invoice Cards List */}
      {filteredInvoices.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center space-y-2">
          <Receipt size={32} className="mx-auto text-slate-300" />
          <p className="text-sm font-black text-slate-800">
            Tidak Ada Invoice pada Filter Ini
          </p>
          <p className="text-xs text-slate-500">
            Belum ada invoice yang sesuai dengan kategori status yang dipilih.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInvoices.map((inv) => {
            const isPaid = inv.status === 'PAID' || inv.outstanding_amount <= 0;
            const shipment = inv.shipment_summary;

            return (
              <div
                key={inv.id}
                className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs hover:border-rose-200 hover:shadow-md transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-xl bg-rose-50 px-3 py-1 font-mono text-xs font-black text-rose-700 border border-rose-200">
                        {inv.invoice_number}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase border ${
                          isPaid
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {isPaid ? (
                          <CheckCircle2 size={11} />
                        ) : (
                          <Clock size={11} />
                        )}
                        {isPaid ? 'LUNAS' : inv.status}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-slate-700">
                        Status Order: {inv.primary_order_status}
                      </span>
                    </div>

                    <h3 className="mt-2 text-base font-black text-slate-900">
                      {inv.events?.length > 0
                        ? inv.events.join(' • ')
                        : 'Pesanan Jastip Worthtobuy'}
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Calendar size={12} className="text-slate-400" />
                        {dateTime(inv.issue_date)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Boxes size={12} className="text-slate-400" />
                        {inv.order_count} Order ({inv.total_items_count} pcs)
                      </span>
                      {inv.order_numbers?.length > 0 && (
                        <span className="font-mono text-[11px] text-slate-400">
                          [{inv.order_numbers.join(', ')}]
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Financial summary box */}
                  <div className="rounded-2xl bg-slate-50 px-4 py-2.5 border border-slate-100 text-left sm:text-right shrink-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Total Tagihan
                    </p>
                    <p className="text-sm font-black text-slate-900">
                      {money(inv.total_bill)}
                    </p>
                    {inv.outstanding_amount > 0 ? (
                      <p className="text-[11px] font-bold text-rose-600">
                        Sisa: {money(inv.outstanding_amount)}
                      </p>
                    ) : (
                      <p className="text-[11px] font-bold text-emerald-600">
                        Terbayar Penuh
                      </p>
                    )}
                  </div>
                </div>

                {/* Bottom row: Shipment badge + Action buttons */}
                <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs">
                    {shipment ? (
                      <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-50/80 px-3 py-1.5 text-emerald-800 border border-emerald-200/70">
                        <Truck size={14} className="text-emerald-600 shrink-0" />
                        <span className="font-bold">
                          {shipment.courier || 'Kurir'} •{' '}
                          {shipment.tracking_number
                            ? `Resi: ${shipment.tracking_number}`
                            : shipment.status}
                        </span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-slate-400 font-semibold">
                        <Truck size={14} />
                        Belum ada nomor resi pengiriman
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to={`/invoice/${encodeURIComponent(inv.invoice_number)}?fromCustomer=${encodeURIComponent(customer.customer_code)}`}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-extrabold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition"
                    >
                      <FileText size={14} className="text-rose-500" />
                      <span>Lihat Invoice & Bayar</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        onSelectInvoice(inv);
                        setSelectedOrderIdx(0);
                      }}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 px-4 py-2.5 text-xs font-black text-white shadow-xs hover:from-rose-700 hover:to-pink-700 transition cursor-pointer"
                    >
                      <PackageSearch size={15} />
                      <span>Lacak Pesanan Ini</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

