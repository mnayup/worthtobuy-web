import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { StatusBadge } from '~/components/StatusBadge';
import { titleCase } from '~/lib/format';
import { pieColors } from '../helpers/dashboard-helpers';

interface OrderStatusCardProps {
  statusGroups?: Array<{ status: string; _count: { _all: number } }>;
}

export function OrderStatusCard({ statusGroups = [] }: OrderStatusCardProps) {
  return (
    <section className="card p-5 sm:p-6">
      <h2 className="section-title">Order Statuses</h2>
      <p className="mt-1 text-sm font-medium text-slate-400">
        Active distribution by workflow state.
      </p>
      <div className="h-60 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={statusGroups}
              dataKey="_count._all"
              nameKey="status"
              innerRadius={58}
              outerRadius={86}
              paddingAngle={3}
            >
              {statusGroups.map((_, index) => (
                <Cell key={index} fill={pieColors[index % pieColors.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: any, _name: any, payload: any) => [
                value,
                titleCase(payload.payload.status),
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-2">
        {statusGroups.slice(0, 6).map((row) => (
          <StatusBadge key={row.status} value={row.status} />
        ))}
      </div>
    </section>
  );
}
