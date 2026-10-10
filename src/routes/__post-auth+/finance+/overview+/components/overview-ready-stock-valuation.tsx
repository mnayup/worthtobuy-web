import { useNavigate } from 'react-router-dom';
import { Boxes, ExternalLink, Search } from 'lucide-react';
import { money, number } from '~/lib/format';
import type { ReadyStockItem } from '../types';

interface OverviewReadyStockValuationProps {
  readyStock?: any;
  filteredStockItems: ReadyStockItem[];
  stockSearch: string;
  setStockSearch: (val: string) => void;
}

export function OverviewReadyStockValuation({
  readyStock,
  filteredStockItems,
  stockSearch,
  setStockSearch,
}: OverviewReadyStockValuationProps) {
  const navigate = useNavigate();

  return (
    <section className="card p-6">
      <div
        className={
          'flex flex-col gap-3 md:flex-row md:items-center ' +
          'md:justify-between border-b border-slate-100 pb-4'
        }
      >
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-indigo-50 p-2.5 text-indigo-600 ring-1 ring-indigo-200">
            <Boxes size={22} />
          </div>
          <div>
            <h2 className="section-title">
              Valuasi Inventaris Barang Ready Stock
            </h2>
            <p className="text-xs text-slate-500">
              Nilai kapital aset tersimpan pada stok siap kirim, potensi omzet, dan margin laba.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search
              className="absolute left-3 top-2.5 text-slate-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search SKU or item name..."
              className="input pl-9 pr-4 py-1.5 text-xs sm:w-64"
              value={stockSearch}
              onChange={(e) => setStockSearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => navigate('/products')}
            className="btn-secondary text-xs py-2"
          >
            Kelola Produk <ExternalLink size={14} />
          </button>
        </div>
      </div>

      {/* 4 Cards for Ready Stock Valuation */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div
          className={
            'rounded-2xl border border-slate-200 bg-gradient-to-br ' +
            'from-white to-slate-50 p-4 shadow-2xs'
          }
        >
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Total Modal Aset Stok
          </p>
          <p className="mt-2 text-2xl font-black text-slate-900">
            {money(readyStock?.totalCapitalValue || 0)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {number(readyStock?.totalUnits || 0)} unit fisik tercatat dalam gudang
          </p>
        </div>

        <div
          className={
            'rounded-2xl border border-indigo-200 bg-gradient-to-br ' +
            'from-indigo-50/40 to-indigo-100/20 p-4 shadow-2xs'
          }
        >
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-700">
            Modal Stok Siap Jual
          </p>
          <p className="mt-2 text-2xl font-black text-indigo-900">
            {money(readyStock?.availableCapitalValue || 0)}
          </p>
          <p className="mt-1 text-xs text-indigo-600">
            {number(readyStock?.availableUnits || 0)} unit belum terpesan (free stock)
          </p>
        </div>

        <div
          className={
            'rounded-2xl border border-emerald-200 bg-gradient-to-br ' +
            'from-emerald-50/40 to-emerald-100/20 p-4 shadow-2xs'
          }
        >
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Potensi Omzet Penjualan
          </p>
          <p className="mt-2 text-2xl font-black text-emerald-900">
            {money(readyStock?.totalPotentialSales || 0)}
          </p>
          <p className="mt-1 text-xs text-emerald-600">
            Estimasi total nilai jika seluruh stok terjual
          </p>
        </div>

        <div
          className={
            'rounded-2xl border border-honey-200 bg-gradient-to-br ' +
            'from-honey-50/40 to-amber-100/20 p-4 shadow-2xs'
          }
        >
          <p className="text-xs font-bold uppercase tracking-wider text-amber-800">
            Potensi Laba Kotor (Spread)
          </p>
          <p className="mt-2 text-2xl font-black text-amber-950">
            {money(readyStock?.potentialGrossProfit || 0)}
          </p>
          <span
            className={
              'mt-1 inline-block rounded-full bg-amber-200/70 px-2 py-0.5 ' +
              'text-[11px] font-black text-amber-800'
            }
          >
            Potensi Margin {readyStock?.potentialMargin?.toFixed(1) || 0}%
          </span>
        </div>
      </div>

      {/* Ready Stock Valuation Table */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="scrollbar-thin max-h-[380px] overflow-y-auto">
          <table className="w-full border-collapse">
            <thead className="table-head sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left">Produk & SKU</th>
                <th className="px-4 py-3 text-center">Unit Total</th>
                <th className="px-4 py-3 text-center">Tersedia</th>
                <th className="px-4 py-3 text-right">Modal Beli (Unit)</th>
                <th className="px-4 py-3 text-right">Harga Jual (Unit)</th>
                <th className="px-4 py-3 text-right">Total Nilai Modal</th>
                <th className="px-4 py-3 text-right">Potensi Omzet</th>
                <th className="px-4 py-3 text-right">Potensi Laba</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStockItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-sm text-slate-400">
                    Tidak ada produk ready stock yang cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredStockItems.map((item: ReadyStockItem) => (
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
            'border-t border-slate-200 bg-slate-50/70 p-3 px-4 flex flex-wrap ' +
            'items-center justify-between text-xs text-slate-500'
          }
        >
          <span>
            Menampilkan {filteredStockItems.length} dari {readyStock?.skuCount || 0} SKU
          </span>
          <span className="font-bold text-slate-700">
            Total Nilai Modal Gudang: {money(readyStock?.totalCapitalValue || 0)}
          </span>
        </div>
      </div>
    </section>
  );
}
