import { Calendar } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { money } from '~/lib/format';
import type { PeriodPerformance } from '../types';

interface ReportPerformanceTabProps {
  performance: PeriodPerformance[];
}

export function ReportPerformanceTab({
  performance,
}: ReportPerformanceTabProps) {
  return (
    <div className="space-y-6">
      {/* Event Performance Chart */}
      <section className="card p-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="section-title">Perbandingan Omzet & Laba per Event</h2>
            <p className="text-xs text-slate-500">
              Evaluasi performa finansial antar periode shopping trip.
            </p>
          </div>
          <Calendar size={18} className="text-slate-400" />
        </div>
        <div className="mt-6 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={performance}
              margin={{ top: 10, right: 30, left: 10, bottom: 20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />
              <XAxis dataKey="code" tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis
                tickFormatter={(v) => `${Math.round(v / 1000000)}M`}
                tick={{ fill: '#64748b', fontSize: 12 }}
              />
              <Tooltip formatter={(v: any) => money(v)} />
              <Legend />
              <Bar
                dataKey="omzet"
                name="Total Omzet"
                fill="#6366f1"
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey="serviceFeeIncome"
                name="Pendapatan Fee Jastip"
                fill="#0ea5e9"
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey="netProfit"
                name="Laba Bersih"
                fill="#10b981"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Event Performance Detailed Table */}
      <section className="card p-6">
        <h2 className="section-title mb-4">Tabel Rekap Finansial per Event</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="table-head">
              <tr>
                <th className="px-4 py-3 text-left">Kode & Nama Event</th>
                <th className="px-4 py-3 text-center">Orders</th>
                <th className="px-4 py-3 text-right">Total Omzet</th>
                <th className="px-4 py-3 text-right">Penjualan Barang</th>
                <th className="px-4 py-3 text-right">Fee Jastip (Income)</th>
                <th className="px-4 py-3 text-right">Modal Belanja (Actual)</th>
                <th className="px-4 py-3 text-right">Selisih Belanja</th>
                <th className="px-4 py-3 text-right">Biaya Operasional</th>
                <th className="px-4 py-3 text-right">Laba Bersih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {performance.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="py-8 text-center text-sm text-slate-400"
                  >
                    Belum ada riwayat event yang selesai.
                  </td>
                </tr>
              ) : (
                performance.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="table-cell">
                      <p className="font-bold text-slate-900">{item.code}</p>
                      <p className="text-xs text-slate-500">
                        {item.name} ({item.location})
                      </p>
                    </td>
                    <td className="table-cell text-center font-bold text-slate-800">
                      {item.orders}
                    </td>
                    <td className="table-cell text-right font-extrabold text-slate-900">
                      {money(item.omzet)}
                    </td>
                    <td className="table-cell text-right font-medium text-slate-700">
                      {money(item.goodsRevenue || 0)}
                    </td>
                    <td className="table-cell text-right font-bold text-sky-700">
                      {money(item.serviceFeeIncome || 0)}
                    </td>
                    <td className="table-cell text-right font-medium text-amber-800">
                      {money(item.actualBuyPrice || item.modal)}
                    </td>
                    <td className="table-cell text-right">
                      <span
                        className={`text-xs font-bold ${
                          (item.shoppingVariance || 0) >= 0
                            ? 'text-emerald-700'
                            : 'text-rose-700'
                        }`}
                      >
                        {(item.shoppingVariance || 0) >= 0 ? '+' : ''}
                        {money(item.shoppingVariance || 0)}
                      </span>
                    </td>
                    <td className="table-cell text-right font-medium text-rose-700">
                      {money(item.expenses)}
                    </td>
                    <td className="table-cell text-right">
                      <span
                        className={`font-black ${
                          item.netProfit >= 0
                            ? 'text-emerald-600'
                            : 'text-rose-600'
                        }`}
                      >
                        {money(item.netProfit)}
                      </span>
                      <p className="text-[10px] text-slate-400 font-bold">
                        {Number(item.margin || 0).toFixed(1)}%
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
