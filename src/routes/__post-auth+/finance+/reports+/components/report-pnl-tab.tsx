import { money } from '~/lib/format';
import type { ProfitLossReport } from '../types';
import { ReportCashFlowSidePanel } from './report-cash-flow-side-panel';
import { ReportPnlExpensesSection } from './report-pnl-expenses-section';

interface ReportPnlTabProps {
  report: ProfitLossReport;
  selectedPeriod?: { code: string; name: string };
  onGoToReadyStock: () => void;
}

export function ReportPnlTab({
  report,
  selectedPeriod,
  onGoToReadyStock,
}: ReportPnlTabProps) {
  const periodCaption = selectedPeriod
    ? `Periode Event: ${selectedPeriod.code} • ${selectedPeriod.name}`
    : 'Konsolidasi Seluruh Shopping Event & Inventaris Ready Stock';

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <section className="card p-6 lg:col-span-8">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="section-title">Comprehensive Profit & Loss Report</h2>
            <p className="text-xs text-slate-500">{periodCaption}</p>
          </div>
          <span
            className={
              'rounded-full bg-slate-100 px-3 py-1 text-xs font-bold ' +
              'text-slate-700 border border-slate-200'
            }
          >
            IDR (Rupiah)
          </span>
        </div>

        <div className="mt-5 space-y-6">
          {/* I. Pendapatan */}
          <div>
            <div
              className={
                'flex items-center justify-between bg-slate-100/80 px-4 py-2 ' +
                'rounded-xl text-xs font-black uppercase tracking-wider text-slate-700'
              }
            >
              <span>I. PENDAPATAN & PENJUALAN</span>
              <span>JUMLAH</span>
            </div>
            <div className="divide-y divide-slate-100 px-2">
              <div className="flex justify-between py-2.5 text-sm text-slate-700">
                <div>
                  <p className="font-semibold">Penjualan Barang (Goods Revenue)</p>
                  <p className="text-xs text-slate-400">
                    Subtotal barang pesanan dan ready stock
                  </p>
                </div>
                <span className="font-bold text-slate-900">
                  {money(report.goodsRevenue)}
                </span>
              </div>

              <div className="flex justify-between py-2.5 text-sm text-slate-700">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sky-900">
                      Pendapatan Fee Jasa Titip (Service Fee)
                    </p>
                    <span
                      className={
                        'rounded-full bg-sky-100 px-2 py-0.5 text-[10px] ' +
                        'font-black text-sky-800'
                      }
                    >
                      Fee Murni
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Komisi concierge jasa titip murni</p>
                </div>
                <span className="font-bold text-sky-900">
                  {money(report.serviceFeeIncome)}
                </span>
              </div>

              <div className="flex justify-between py-2.5 text-sm text-slate-700">
                <div>
                  <p className="font-semibold">
                    Pendapatan Ongkos Kirim & Layanan Tambahan
                  </p>
                  <p className="text-xs text-slate-400">
                    Shipping domestik, internasional, dan biaya handling
                  </p>
                </div>
                <span className="font-bold text-slate-900">
                  {money(report.otherFeeIncome)}
                </span>
              </div>

              {report.discountTotal > 0 && (
                <div className="flex justify-between py-2.5 text-sm text-rose-600">
                  <div>
                    <p className="font-semibold">Potongan Diskon Penjualan</p>
                    <p className="text-xs text-rose-400">Diskon kupon & promo</p>
                  </div>
                  <span className="font-bold">-{money(report.discountTotal)}</span>
                </div>
              )}

              <div
                className={
                  'flex justify-between py-3 text-sm font-black ' +
                  'bg-slate-50/50 px-2 rounded-lg text-slate-900'
                }
              >
                <span>TOTAL PENDAPATAN BRUTO (OMZET)</span>
                <span>{money(report.omzet)}</span>
              </div>
            </div>
          </div>

          {/* II. Modal Belanja */}
          <div>
            <div
              className={
                'flex items-center justify-between bg-amber-50 px-4 py-2 ' +
                'rounded-xl text-xs font-black uppercase tracking-wider text-amber-900'
              }
            >
              <span>II. MODAL BELANJA / HARGA POKOK PENJUALAN (COGS)</span>
              <span>JUMLAH</span>
            </div>
            <div className="divide-y divide-slate-100 px-2">
              <div className="flex justify-between py-2.5 text-sm text-slate-600">
                <div>
                  <p className="font-medium">
                    Estimasi Awal Modal Belanja (Target Price)
                  </p>
                  <p className="text-xs text-slate-400">
                    Perkiraan modal belanja saat pesanan dibuat
                  </p>
                </div>
                <span className="text-slate-600 font-semibold">
                  {money(report.estimatedBuyPrice)}
                </span>
              </div>

              <div className="flex justify-between py-2.5 text-sm text-amber-900">
                <div>
                  <p className="font-bold">
                    Realisasi Modal Belanja Aktual di Kasir
                  </p>
                  <p className="text-xs text-amber-700">
                    Uang keluar riil yang dibelanjakan di toko
                  </p>
                </div>
                <span className="font-bold">-{money(report.actualBuyPrice)}</span>
              </div>

              <div className="flex justify-between py-2.5 text-xs">
                <span className="text-slate-500 font-medium">Selisih Belanja / Variance:</span>
                <span
                  className={`font-bold ${
                    report.shoppingVariance >= 0
                      ? 'text-emerald-700'
                      : 'text-rose-700'
                  }`}
                >
                  {report.shoppingVariance >= 0
                    ? `Hemat +${money(report.shoppingVariance)} ` +
                      `(+${report.shoppingEfficiency.toFixed(1)}%)`
                    : `Over-Budget -${money(Math.abs(report.shoppingVariance))} ` +
                      `(${report.shoppingEfficiency.toFixed(1)}%)`}
                </span>
              </div>

              <div
                className={
                  'flex justify-between py-3 text-sm font-black ' +
                  'bg-amber-50/40 px-2 rounded-lg text-amber-950'
                }
              >
                <span>TOTAL MODAL BELANJA AKTUAL</span>
                <span>-{money(report.actualBuyPrice)}</span>
              </div>
            </div>
          </div>

          {/* III. Laba Kotor */}
          <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4">
            <div className="flex items-center justify-between text-base font-black text-indigo-950">
              <div>
                <span>III. LABA KOTOR KESELURUHAN (GROSS PROFIT)</span>
                <p className="text-xs font-semibold text-indigo-700 mt-0.5">
                  Spread: {money(report.goodsMargin)} ({report.goodsMarginPercent.toFixed(1)}%) +
                  {' '}Fee {money(report.serviceFeeIncome)}
                </p>
              </div>
              <span className="text-xl">{money(report.grossProfit)}</span>
            </div>
          </div>

          <ReportPnlExpensesSection report={report} />
        </div>
      </section>

      <ReportCashFlowSidePanel
        report={report}
        onGoToReadyStock={onGoToReadyStock}
      />
    </div>
  );
}
