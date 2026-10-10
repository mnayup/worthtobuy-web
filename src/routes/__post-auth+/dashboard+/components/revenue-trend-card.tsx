import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { money, number } from '~/lib/format';

interface RevenueTrendCardProps {
  data: Array<{ date: string; omzet: number; orders: number }>;
  invoiceCount?: number;
}

export function RevenueTrendCard({ data, invoiceCount }: RevenueTrendCardProps) {
  return (
    <section className="card p-5 sm:p-6">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="section-title">Revenue Trends</h2>
          <p className="mt-1 text-sm font-medium text-slate-400">
            Invoice amounts by issue date.
          </p>
        </div>
        <span className="pill">{number(invoiceCount)} active invoices</span>
      </div>
      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data || []}>
            <defs>
              <linearGradient id="wtbFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.28} />
                <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#E2E8F0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#64748B' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(val) => `${Math.round(val / 1_000_000)}M`}
              tick={{ fontSize: 11, fill: '#64748B' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 16,
                border: '1px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
                boxShadow: '0 10px 25px -3px rgba(0,0,0,0.1)',
              }}
              formatter={(value: any, name) => [
                name === 'omzet' ? money(value) : number(value),
                name === 'omzet' ? 'Revenue' : 'Orders',
              ]}
            />
            <Area
              type="monotone"
              dataKey="omzet"
              stroke="#F43F5E"
              fill="url(#wtbFill)"
              strokeWidth={3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
