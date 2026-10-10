import { ArrowRight, Boxes, Coins, Receipt } from 'lucide-react';
import { money, number } from '~/lib/format';
import type { ProfitLossReport } from '../types';

interface ReportCashFlowSidePanelProps {
  report: ProfitLossReport;
  onGoToReadyStock: () => void;
}

export function ReportCashFlowSidePanel({
  report,
  onGoToReadyStock,
}: ReportCashFlowSidePanelProps) {
  const readyStock = report.readyStock;

  return (
    <div className="space-y-6 lg:col-span-4">
      {/* Cash Flow Summary */}
      <section className="card p-5">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Coins size={18} className="text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900">
            Ringkasan Arus Kas (Cash Flow)
          </h3>
        </div>
        <div className="mt-4 space-y-3">
          <div
            className={
              'flex justify-between items-center rounded-xl bg-emerald-50/60 ' +
              'p-3 border border-emerald-100'
            }
          >
            <div>
              <p className="text-xs font-bold text-emerald-800">Kas Masuk Riil</p>
              <p className="text-[11px] text-emerald-600">Pembayaran terverifikasi</p>
            </div>
            <strong className="text-base font-black text-emerald-900">
              {money(report.verifiedCashIn)}
            </strong>
          </div>

          <div
            className={
              'flex justify-between items-center rounded-xl bg-rose-50/60 ' +
              'p-3 border border-rose-100'
            }
          >
            <div>
              <p className="text-xs font-bold text-rose-800">Total Kas Keluar</p>
              <p className="text-[11px] text-rose-600">Modal + Biaya + Refund</p>
            </div>
            <strong className="text-base font-black text-rose-900">
              -{money(report.cashOutflow)}
            </strong>
          </div>

          <div
            className={`flex justify-between items-center rounded-xl p-3.5 border ${
              report.netCashFlow >= 0
                ? 'bg-sky-50 border-sky-200'
                : 'bg-amber-50 border-amber-200'
            }`}
          >
            <div>
              <p
                className={`text-xs font-black uppercase tracking-wider ${
                  report.netCashFlow >= 0 ? 'text-sky-900' : 'text-amber-900'
                }`}
              >
                Arus Kas Bersih
              </p>
              <p className="text-[11px] text-slate-500">
                Saldo kas periode berjalan
              </p>
            </div>
            <strong
              className={`text-lg font-black ${
                report.netCashFlow >= 0 ? 'text-sky-950' : 'text-amber-950'
              }`}
            >
              {money(report.netCashFlow)}
            </strong>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-3.5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                Piutang Pelanggan
              </span>
              <Receipt className="text-amber-600" size={16} />
            </div>
            <p className="mt-1 text-xl font-black text-amber-950">
              {money(report.receivables)}
            </p>
            <p className="mt-0.5 text-[11px] text-amber-700">
              Tagihan invoice berstatus UNPAID / PARTIAL yang belum lunas.
            </p>
          </div>
        </div>
      </section>

      {/* Ready Stock Valuation Quick Card */}
      <section className="card p-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Boxes size={18} className="text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Valuasi Ready Stock
            </h3>
          </div>
          <button
            onClick={onGoToReadyStock}
            className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
          >
            Lihat Rincian <ArrowRight size={13} />
          </button>
        </div>
        <div className="mt-4 space-y-3">
          <div className="flex justify-between text-xs py-1">
            <span className="text-slate-500">Total Modal Aset Tertanam:</span>
            <strong className="text-slate-800">
              {money(readyStock?.totalCapitalValue || 0)}
            </strong>
          </div>
          <div className="flex justify-between text-xs py-1">
            <span className="text-slate-500">Modal Stok Siap Jual:</span>
            <strong className="text-indigo-700">
              {money(readyStock?.availableCapitalValue || 0)}
            </strong>
          </div>
          <div className="flex justify-between text-xs py-1">
            <span className="text-slate-500">Estimasi Potensi Omzet:</span>
            <strong className="text-emerald-700">
              {money(readyStock?.totalPotentialSales || 0)}
            </strong>
          </div>
          <div
            className={
              'flex justify-between text-xs py-1 border-t ' +
              'border-slate-100 pt-2 font-bold'
            }
          >
            <span className="text-slate-700">Potensi Laba Kotor (Spread):</span>
            <span className="text-emerald-700">
              {money(readyStock?.potentialGrossProfit || 0)}
            </span>
          </div>
          <div className="rounded-xl bg-slate-50 p-2.5 text-center text-xs text-slate-500">
            {number(readyStock?.totalUnits || 0)} unit fisik tercatat
            {` (${readyStock?.skuCount || 0} SKU)`}
          </div>
        </div>
      </section>
    </div>
  );
}
