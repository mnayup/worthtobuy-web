import { useState, useEffect, useMemo } from 'react';
import {
  Archive,
  Users,
  Clock,
  AlertTriangle,
  AlertCircle,
  Truck,
  Search,
  RefreshCw,
  MessageCircle,
  MapPin,
  ExternalLink,
  CheckCircle2,
  Package,
} from 'lucide-react';
import { api, errorMessage } from '~/lib/api';
import { Toast } from '~/components/Toast';
import { ConfirmDialog } from '~/components/ConfirmDialog';
import { money } from '~/lib/format';

interface KeptItem {
  id: number;
  order_item_id: number;
  product_id?: number | null;
  product_name: string;
  brand_name?: string | null;
  image_url?: string | null;
  variation?: string | null;
  size?: string | null;
  color?: string | null;
  quantity: number;
  unit_price_foreign: number;
  order_id: number;
  order_number: string;
  order_date: string;
  period_name: string;
  period_code: string;
  kept_until: string;
  remaining_days: number;
  fulfillment_status: string;
}

interface KeptCustomer {
  id: number;
  full_name: string;
  whatsapp: string;
  segment: string;
  address: string;
  total_kept_quantity: number;
  items: KeptItem[];
}

interface KeptDataResponse {
  customers: KeptCustomer[];
  summary: {
    totalCustomers: number;
    totalItems: number;
    expiringSoonCount: number;
    expiredCount: number;
  };
}

export default function KeepItemsRoute() {
  const [data, setData] = useState<KeptDataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('ALL');
  const [movingIds, setMovingIds] = useState<number[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    itemIds: number[];
  }>({
    open: false,
    title: '',
    message: '',
    itemIds: [],
  });
  const [toast, setToast] = useState<{
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    title?: string;
  } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (urgencyFilter !== 'ALL') params.set('urgency', urgencyFilter);

      const res = await api.get(`/order-items/kept-customers?${params.toString()}`);
      setData(res.data);
    } catch (caught) {
      setToast({
        title: 'Error loading kept items',
        message: errorMessage(caught),
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [urgencyFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const handleMoveToShipment = async (itemIds: number[]) => {
    if (!itemIds.length) return;
    setMovingIds(itemIds);
    try {
      const res = await api.post('/order-items/move-to-shipment', { itemIds });
      setToast({
        title: 'Dipindahkan ke Pengiriman',
        message: `${res.data?.count || itemIds.length} barang berhasil dipindahkan ke status Pengiriman (READY_TO_SHIP).`,
        type: 'success',
      });
      fetchData();
    } catch (caught) {
      setToast({
        title: 'Gagal memindahkan barang',
        message: errorMessage(caught),
        type: 'error',
      });
    } finally {
      setMovingIds([]);
      setConfirmDialog((prev) => ({ ...prev, open: false }));
    }
  };

  const customers = data?.customers || [];
  const summary = data?.summary || {
    totalCustomers: 0,
    totalItems: 0,
    expiringSoonCount: 0,
    expiredCount: 0,
  };

  return (
    <div className="space-y-6 animate-rise">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 shadow-xs">
              <Archive size={22} />
            </div>
            <div>
              <h1 className="text-xl font-black text-brand-900 tracking-tight">
                Keep Items (Titip Simpan)
              </h1>
              <p className="text-xs text-brand-500 font-medium">
                Daftar barang titip simpan pelanggan di warehouse. Kelola batas waktu dan pindahkan ke pengiriman.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => fetchData()}
          disabled={loading}
          className="btn-secondary !py-2 !px-3.5 text-xs font-bold self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-indigo-100 bg-white p-4 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-indigo-600">
            <span className="text-[11px] font-black uppercase tracking-wider text-brand-500">
              Total Barang Dititip
            </span>
            <Archive size={16} />
          </div>
          <p className="text-2xl font-black text-brand-900">
            {summary.totalItems}{' '}
            <span className="text-xs font-bold text-brand-400">pcs</span>
          </p>
        </div>

        <div className="rounded-2xl border border-violet-100 bg-white p-4 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-violet-600">
            <span className="text-[11px] font-black uppercase tracking-wider text-brand-500">
              Pelanggan Penitip
            </span>
            <Users size={16} />
          </div>
          <p className="text-2xl font-black text-brand-900">
            {summary.totalCustomers}{' '}
            <span className="text-xs font-bold text-brand-400">orang</span>
          </p>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-white p-4 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-[11px] font-black uppercase tracking-wider text-brand-500">
              Mendekati Batas (≤ 7 Hari)
            </span>
            <AlertTriangle size={16} />
          </div>
          <p className="text-2xl font-black text-amber-700">
            {summary.expiringSoonCount}{' '}
            <span className="text-xs font-bold text-brand-400">pcs</span>
          </p>
        </div>

        <div className="rounded-2xl border border-rose-100 bg-white p-4 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-rose-600">
            <span className="text-[11px] font-black uppercase tracking-wider text-brand-500">
              Melebihi Batas Waktu
            </span>
            <AlertCircle size={16} />
          </div>
          <p className="text-2xl font-black text-rose-700">
            {summary.expiredCount}{' '}
            <span className="text-xs font-bold text-brand-400">pcs</span>
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-brand-200/80 bg-white p-3.5 sm:flex-row sm:items-center sm:justify-between shadow-xs">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-400"
          />
          <input
            type="text"
            className="input !py-2 !pl-10 !pr-4 text-xs font-medium w-full"
            placeholder="Cari nama pelanggan, nomor WA, produk, brand, order #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: 'Semua' },
            { id: 'ACTIVE', label: 'Aktif (> 7 Hari)' },
            { id: 'EXPIRING_SOON', label: '≤ 7 Hari Lagi' },
            { id: 'EXPIRED', label: 'Kedaluwarsa' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setUrgencyFilter(tab.id)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold whitespace-nowrap transition ${
                urgencyFilter === tab.id
                  ? 'bg-brand-900 text-white shadow-xs'
                  : 'bg-brand-50/70 text-brand-700 hover:bg-brand-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Kept Groups List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
        </div>
      ) : customers.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-brand-200 bg-white p-12 text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Archive size={28} />
          </div>
          <div>
            <h3 className="text-base font-black text-brand-900">
              Tidak Ada Barang Titip Simpan
            </h3>
            <p className="text-xs text-brand-500 max-w-sm mx-auto mt-1 font-medium">
              Saat ini tidak ada barang pesanan pelanggan yang berstatus Titip Simpan (KEPT) sesuai kriteria pencarian.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {customers.map((customer) => {
            const customerItemIds = customer.items.map((i) => i.id);
            const isAllMoving = customerItemIds.every((id) =>
              movingIds.includes(id)
            );
            const cleanWa = customer.whatsapp.replace(/\D/g, '');
            const waUrl = cleanWa
              ? `https://wa.me/${cleanWa.startsWith('0') ? '62' + cleanWa.slice(1) : cleanWa}`
              : null;

            return (
              <div
                key={customer.id}
                className="rounded-3xl border border-brand-200/90 bg-white shadow-sm overflow-hidden"
              >
                {/* Customer Card Header */}
                <div className="flex flex-col gap-3 border-b border-brand-100/80 bg-gradient-to-r from-brand-50/50 via-white to-brand-50/30 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-900 text-white font-black text-sm shadow-xs shrink-0">
                      {customer.full_name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-brand-950 text-base leading-none">
                          {customer.full_name}
                        </h3>
                        {customer.segment === 'PRIORITY' && (
                          <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-black text-amber-800 uppercase">
                            VIP
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 rounded-md bg-indigo-100 text-indigo-800 px-2 py-0.5 text-[11px] font-black">
                          {customer.total_kept_quantity} pcs dititip
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-brand-500 mt-1.5 font-medium">
                        {waUrl && (
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-bold"
                          >
                            <MessageCircle size={13} /> {customer.whatsapp}
                            <ExternalLink size={10} />
                          </a>
                        )}
                        {customer.address && customer.address !== '-' && (
                          <span
                            className="inline-flex items-center gap-1 truncate max-w-[280px]"
                            title={customer.address}
                          >
                            <MapPin size={12} className="shrink-0" />{' '}
                            {customer.address}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={isAllMoving}
                      onClick={() =>
                        setConfirmDialog({
                          open: true,
                          title: `Kirim Semua Barang (${customer.full_name})`,
                          message: `Apakah Anda yakin ingin memindahkan seluruh (${customer.items.length}) barang milik ${customer.full_name} ke antrean Pengiriman (Shipments)?`,
                          itemIds: customerItemIds,
                        })
                      }
                      className="btn-primary !bg-indigo-600 hover:!bg-indigo-700 !py-2 !px-3.5 text-xs font-black shadow-xs flex items-center gap-1.5"
                    >
                      <Truck size={14} />
                      {isAllMoving ? 'Memproses...' : 'Kirim Semua ke Ekspedisi'}
                    </button>
                  </div>
                </div>

                {/* Items Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-brand-100/70 bg-brand-50/30 text-[10px] font-black uppercase tracking-wider text-brand-500">
                        <th className="py-2.5 px-4">Produk / Barang</th>
                        <th className="py-2.5 px-3">Order & Event</th>
                        <th className="py-2.5 px-3 text-center">Qty</th>
                        <th className="py-2.5 px-3">Batas Waktu Titip</th>
                        <th className="py-2.5 px-3">Sisa Waktu</th>
                        <th className="py-2.5 px-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-100/60">
                      {customer.items.map((item) => {
                        const isMoving = movingIds.includes(item.id);
                        const keptDate = new Date(item.kept_until);
                        const days = item.remaining_days;

                        return (
                          <tr
                            key={item.id}
                            className="hover:bg-brand-50/20 transition"
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                {item.image_url ? (
                                  <img
                                    src={item.image_url}
                                    alt={item.product_name}
                                    className="h-9 w-9 rounded-xl object-cover border border-brand-100 shrink-0"
                                  />
                                ) : (
                                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 text-brand-600 shrink-0">
                                    <Package size={16} />
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <p className="font-bold text-brand-950 truncate max-w-xs">
                                    {item.product_name}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-[10px] text-brand-500 font-semibold">
                                    {item.brand_name && (
                                      <span className="bg-brand-100/80 px-1.5 py-0.2 rounded text-brand-700">
                                        {item.brand_name}
                                      </span>
                                    )}
                                    {item.variation && (
                                      <span className="text-indigo-700">
                                        Var: {item.variation}
                                      </span>
                                    )}
                                    {item.size && <span>Size: {item.size}</span>}
                                    {item.color && (
                                      <span>Color: {item.color}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-3">
                              <div className="space-y-0.5">
                                <span className="font-mono font-bold text-brand-900 block">
                                  {item.order_number}
                                </span>
                                <span className="text-[11px] text-brand-500">
                                  {item.period_name}
                                </span>
                              </div>
                            </td>

                            <td className="py-3 px-3 text-center">
                              <span className="font-black text-brand-900 text-xs">
                                {item.quantity} pcs
                              </span>
                            </td>

                            <td className="py-3 px-3 font-semibold text-brand-700">
                              {keptDate.toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </td>

                            <td className="py-3 px-3">
                              {days < 0 ? (
                                <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 border border-rose-200 px-2 py-0.5 text-[11px] font-black text-rose-700">
                                  <AlertCircle size={12} />
                                  Lewat {Math.abs(days)} hari
                                </span>
                              ) : days <= 7 ? (
                                <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 border border-amber-300 px-2 py-0.5 text-[11px] font-black text-amber-800">
                                  <AlertTriangle size={12} />
                                  {days === 0
                                    ? 'Hari ini'
                                    : `${days} hari lagi`}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-black text-emerald-700">
                                  <Clock size={12} />
                                  {days} hari lagi
                                </span>
                              )}
                            </td>

                            <td className="py-3 px-4 text-right">
                              <button
                                type="button"
                                disabled={isMoving}
                                onClick={() =>
                                  setConfirmDialog({
                                    open: true,
                                    title: 'Pindahkan ke Pengiriman',
                                    message: `Pindahkan "${item.product_name}" (${item.quantity} pcs) milik ${customer.full_name} ke antrean Pengiriman?`,
                                    itemIds: [item.id],
                                  })
                                }
                                className="btn-secondary !py-1.5 !px-3 text-xs font-bold hover:!bg-emerald-50 hover:!text-emerald-700 hover:!border-emerald-300 transition"
                              >
                                <Truck size={13} />
                                {isMoving ? 'Memproses...' : 'Kirim'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText="Ya, Pindahkan ke Pengiriman"
        cancelText="Batal"
        onConfirm={() => handleMoveToShipment(confirmDialog.itemIds)}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
      />

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          title={toast.title}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
