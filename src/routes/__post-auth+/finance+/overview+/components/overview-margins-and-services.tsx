import { PiggyBank, ShoppingBag } from 'lucide-react';
import { money } from '~/lib/format';
import type { ProfitLossReport } from '../../reports+/types';

interface OverviewMarginsAndServicesProps {
  report: ProfitLossReport;
}

export function OverviewMarginsAndServices({
  report,
}: OverviewMarginsAndServicesProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Box 1: Selling Price vs Actual Buy Price */}
      <section className="card p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600 ring-1 ring-indigo-200">
              <ShoppingBag size={20} />
            </div>
            <div>
              <h2 className="section-title">Margin Penjualan Barang</h2>
              <p className="text-xs text-slate-500">
                Harga Jual Barang vs Modal Belanja Aktual
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <div
              className={
                'flex items-center justify-between rounded-xl border ' +
                'border-slate-100 bg-slate-50/80 p-3.5'
              }
            >
              <div>
                <p className="text-xs font-bold text-slate-500">
                  Harga Jual Barang (Product Subtotal)
                </p>
                <p className="text-xs text-slate-400">
                  Nilai barang yang ditagihkan ke pembeli
                </p>
              </div>
              <strong className="text-base font-extrabold text-slate-900">
                {money(report.goodsRevenue)}
              </strong>
            </div>

            <div
              className={
                'flex items-center justify-between rounded-xl border ' +
                'border-amber-100 bg-amber-50/50 p-3.5'
              }
            >
              <div>
                <p className="text-xs font-bold text-amber-700">
                  Modal Belanja Aktual (Cost of Goods)
                </p>
                <p className="text-xs text-amber-600">
                  Modal riil pembelian barang di kasir
                </p>
              </div>
              <strong className="text-base font-extrabold text-amber-900">
                -{money(report.actualBuyPrice)}
              </strong>
            </div>

            <div
              className={
                'flex items-center justify-between rounded-xl border ' +
                'border-indigo-200 bg-indigo-50/70 p-4'
              }
            >
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-indigo-800">
                  Spread / Laba Kotor Barang
                </p>
                <p className="text-xs text-indigo-600">
                  Selisih harga jual terhadap modal riil
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-black text-indigo-950">
                  {money(report.goodsMargin)}
                </p>
                <span
                  className={
                    'inline-block rounded-full bg-indigo-200/80 px-2 py-0.5 ' +
                    'text-[11px] font-black text-indigo-800'
                  }
                >
                  Margin {report.goodsMarginPercent.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div
          className={
            'mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-500 ' +
            'border border-slate-200/60'
          }
        >
          <span className="font-bold text-slate-700">Catatan:</span> Spread laba kotor
          barang adalah margin tambahan bila harga jual yang ditetapkan di order
          memiliki selisih di atas harga beli riil.
        </div>
      </section>

      {/* Box 2: Fee Jastip sebagai Pendapatan Murni */}
      <section className="card p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <div className="rounded-xl bg-sky-50 p-2 text-sky-600 ring-1 ring-sky-200">
              <PiggyBank size={20} />
            </div>
            <div>
              <h2 className="section-title">Pendapatan Jasa & Biaya Layanan</h2>
              <p className="text-xs text-slate-500">
                Jastip Concierge Fee sebagai pendapatan jasa murni
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <div
              className={
                'flex items-center justify-between rounded-xl border ' +
                'border-sky-200 bg-sky-50/60 p-4'
              }
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-black uppercase tracking-wider text-sky-900">
                    Pendapatan Fee Jastip (Service Fee)
                  </p>
                  <span
                    className={
                      'rounded-full bg-sky-200 px-2 py-0.5 text-[10px] ' +
                      'font-black text-sky-800'
                    }
                  >
                    100% Pure Income
                  </span>
                </div>
                <p className="text-xs text-sky-700">
                  Komisi jasa titip murni tanpa pemotongan modal barang
                </p>
              </div>
              <strong className="text-xl font-black text-sky-950">
                {money(report.serviceFeeIncome)}
              </strong>
            </div>

            <div
              className={
                'flex items-center justify-between rounded-xl border ' +
                'border-slate-100 bg-slate-50/80 p-3.5'
              }
            >
              <div>
                <p className="text-xs font-bold text-slate-500">
                  Pendapatan Ongkir & Handling
                </p>
                <p className="text-xs text-slate-400">
                  Ongkir lokal, internasional, & biaya admin
                </p>
              </div>
              <strong className="text-base font-extrabold text-slate-900">
                +{money(report.otherFeeIncome)}
              </strong>
            </div>

            <div
              className={
                'flex items-center justify-between rounded-xl border ' +
                'border-slate-100 bg-slate-50/80 p-3.5'
              }
            >
              <div>
                <p className="text-xs font-bold text-slate-500">
                  Potongan Diskon Penjualan
                </p>
                <p className="text-xs text-slate-400">
                  Diskon kupon & promo pelanggan
                </p>
              </div>
              <strong className="text-base font-extrabold text-rose-600">
                {report.discountTotal > 0
                  ? `-${money(report.discountTotal)}`
                  : 'Rp 0'}
              </strong>
            </div>

            <div
              className={
                'flex items-center justify-between rounded-xl border ' +
                'border-slate-200 bg-slate-100/80 p-3.5'
              }
            >
              <div>
                <p className="text-xs font-bold text-slate-700">
                  Total Invoice Revenue Keseluruhan
                </p>
                <p className="text-xs text-slate-500">
                  Subtotal Barang + Jasa + Ongkir - Diskon
                </p>
              </div>
              <strong className="text-lg font-black text-slate-900">
                {money(report.omzet)}
              </strong>
            </div>
          </div>
        </div>

        <div
          className={
            'mt-4 rounded-xl bg-sky-50/70 p-3 text-xs text-sky-800 ' +
            'border border-sky-200/60'
          }
        >
          <span className="font-bold">Info Keuangan:</span> Pendapatan jastip tidak
          membutuhkan modal pokok barang. Seluruh service fee yang tertagih langsung
          menjadi pendapatan bruto bisnis.
        </div>
      </section>
    </div>
  );
}
