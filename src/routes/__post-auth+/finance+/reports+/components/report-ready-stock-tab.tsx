import { Search } from 'lucide-react';
import { money, number } from '~/lib/format';
import type { ReadyStockItem } from '../../overview+/types';

interface ReportReadyStockTabProps {
  readyStock?: any;
  filteredStock: ReadyStockItem[];
  stockSearch: string;
  setStockSearch: (val: string) => void;
}

export function ReportReadyStockTab({
  readyStock,
  filteredStock,
  stockSearch,
  setStockSearch,
}: ReportReadyStockTabProps) {
  return (
    <section className="card p-6 space-y-6">
      <div
        className={
          'flex flex-col gap-3 md:flex-row md:items-center ' +
          'md:justify-between border-b border-slate-100 pb-4'
        }
      >
        <div>
          <h2 className="section-title">
            Valuasi Detail Aset Barang Ready Stock
          </h2>
          <p className="text-xs text-slate-500">
            Nilai modal riil tertanam, harga jual, estimasi omzet, dan margin stok toko.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search
              className="absolute left-3 top-2.5 text-slate-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search SKU or product name..."
              className="input pl-9 pr-4 py-1.5 text-xs sm:w-72"
              value={stockSearch}
              onChange={(e) => setStockSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Ready Stock Valuation KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Total Modal Aset Gudang
          </p>
          <p className="mt-1 text-2xl font-black text-slate-900">
            {money(readyStock?.totalCapitalValue || 0)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {number(readyStock?.totalUnits || 0)} total unit stok
          </p>
        </div>

        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-700">
            Modal Stok Belum Terpesan
          </p>
          <p className="mt-1 text-2xl font-black text-indigo-900">
            {money(readyStock?.availableCapitalValue || 0)}
          </p>
          <p className="mt-1 text-xs text-indigo-600">
            {number(readyStock?.availableUnits || 0)} unit siap jual
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Potensi Omzet Penjualan
          </p>
          <p className="mt-1 text-2xl font-black text-emerald-900">
            {money(readyStock?.totalPotentialSales || 0)}
          </p>
          <p className="mt-1 text-xs text-emerald-600">Jika 100% stok terjual habis</p>
        </div>

        <div className="rounded-2xl border border-honey-200 bg-amber-50/40 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-800">
            Potensi Laba Kotor (Spread)
          </p>
          <p className="mt-1 text-2xl font-black text-amber-950">
            {money(readyStock?.potentialGrossProfit || 0)}
          </p>
          <span
            className={
              'mt-1 inline-block rounded-full bg-amber-200/80 px-2 py-0.5 ' +
              'text-[11px] font-black text-amber-800'
            }
          >
            Potensi Margin {readyStock?.potentialMargin?.toFixed(1) || 0}%
          </span>
        </div>
      </div>

      {/* Ready Stock Valuation Full Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="scrollbar-thin max-h-[500px] overflow-y-auto">
          <table className="w-full border-collapse">
            <thead className="table-head sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left">Produk & SKU</th>
                <th className="px-4 py-3 text-center">Total Unit</th>
                <th className="px-4 py-3 text-center">Tersedia</th>
                <th className="px-4 py-3 text-right">Modal Beli / Unit</th>
                <th className="px-4 py-3 text-right">Harga Jual / Unit</th>
                <th className="px-4 py-3 text-right">Total Nilai Modal</th>
                <th className="px-4 py-3 text-right">Potensi Omzet</th>
                <th className="px-4 py-3 text-right">Potensi Laba</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStock.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-sm text-slate-400">
                    Tidak ada produk ready stock yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredStock.map((item: ReadyStockItem) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="table-cell">
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{item.name}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span className="font-mono text-slate-500 font-semibold">
                            {item.sku}
                          </span>
                          {item.brandName && item.brandName !== '-' && (
                            <>
                              <span>•</span>
                              <span>{item.brandName}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="table-cell text-center">
                      <span className="font-black text-slate-900">
                        {item.stockQuantity}
                      </span>
                    </td>
                    <td className="table-cell text-center">
                      <span
                        className={
                          'inline-flex items-center rounded-full px-2 py-0.5 ' +
                          'text-xs font-bold ' +
                          (item.availableQuantity > 0
                            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                            : 'bg-rose-50 text-rose-700 ring-1 ring-rose-200')
                        }
                      >
                        {item.availableQuantity}
                      </span>
                      {item.reservedQuantity > 0 && (
                        <span className="ml-1 text-[11px] text-slate-400">
                          ({item.reservedQuantity} rsv)
                        </span>
                      )}
                    </td>
                    <td className="table-cell text-right font-medium text-slate-600">
                      {money(item.buyPrice)}
                    </td>
                    <td className="table-cell text-right font-bold text-slate-900">
                      {money(item.sellingPrice)}
                    </td>
                    <td className="table-cell text-right font-bold text-slate-800">
                      {money(item.totalCapitalValue)}
                    </td>
                    <td className="table-cell text-right font-bold text-indigo-700">
                      {money(item.totalPotentialSales)}
                    </td>
                    <td className="table-cell text-right">
                      <span className="font-black text-emerald-700">
                        {money(item.potentialProfit)}
                      </span>
                      <p className="text-[10px] text-slate-400 font-bold">
                        {item.marginPercent.toFixed(1)}%
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div
          className={
            'border-t border-slate-200 bg-slate-50 p-3.5 px-4 flex flex-wrap ' +
            'items-center justify-between text-xs text-slate-600'
          }
        >
          <span>
            Menampilkan {filteredStock.length} dari {readyStock?.skuCount || 0} SKU aktif
          </span>
          <div className="flex gap-4 font-bold">
            <span>Total Modal: {money(readyStock?.totalCapitalValue || 0)}</span>
            <span className="text-emerald-700">
              Potensi Omzet: {money(readyStock?.totalPotentialSales || 0)}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
