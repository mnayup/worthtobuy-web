import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface TopProductsCardProps {
  topProducts?: Array<{ name: string; quantity: number }>;
}

export function TopProductsCard({ topProducts = [] }: TopProductsCardProps) {
  return (
    <section className="card p-5 sm:p-6">
      <h2 className="section-title">Top Requested Items</h2>
      <p className="mb-4 mt-1 text-sm font-medium text-slate-400">
        Ranked by quantities ordered.
      </p>
      <div className="h-[290px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={topProducts}
            layout="vertical"
            margin={{ left: 5, right: 12 }}
          >
            <CartesianGrid
              strokeDasharray="4 4"
              horizontal={false}
              stroke="#E2E8F0"
            />
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#64748B' }}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={110}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#1E293B' }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 14,
                border: '1px solid #CBD5E1',
              }}
            />
            <Bar
              dataKey="quantity"
              fill="#F43F5E"
              radius={[0, 8, 8, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
