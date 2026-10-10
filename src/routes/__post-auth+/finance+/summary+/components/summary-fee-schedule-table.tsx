import { ArrowUpDown, ReceiptText } from 'lucide-react';
import { money, number } from '~/lib/format';
import type { FeeRule } from '../types';

interface SummaryFeeScheduleTableProps {
  sortedRules: FeeRule[];
  onSort: (col: 'min' | 'fee') => void;
}

export function SummaryFeeScheduleTable({
  sortedRules,
  onSort,
}: SummaryFeeScheduleTableProps) {
  return (
    <section className="card overflow-hidden">
      <div
        className={
          'flex items-center justify-between border-b border-brand-100 ' +
          'p-5 bg-brand-50/40'
        }
      >
        <div>
          <h2 className="section-title">WORTHTOBUY Fee Schedule</h2>
          <p className="mt-0.5 text-xs font-medium text-brand-400">
            Configurable under System Settings.
          </p>
        </div>
        <ReceiptText className="text-brand-400" size={20} />
      </div>
      <div className="scrollbar-thin max-h-[500px] overflow-y-auto">
        <table className="w-full">
          <thead className="table-head sticky top-0">
            <tr>
              <th
                className="px-4 py-3 cursor-pointer hover:bg-brand-100 select-none group"
                onClick={() => onSort('min')}
              >
                <div className="inline-flex items-center gap-1.5">
                  <span>Price Range Tier</span>
                  <ArrowUpDown size={12} className="opacity-50 group-hover:opacity-100" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-right cursor-pointer hover:bg-brand-100 select-none group"
                onClick={() => onSort('fee')}
              >
                <div className="inline-flex items-center justify-end gap-1.5 w-full">
                  <span>Service Fee</span>
                  <ArrowUpDown size={12} className="opacity-50 group-hover:opacity-100" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-100">
            {sortedRules.map((rule, index) => (
              <tr key={rule.id} className="hover:bg-brand-50 transition-colors">
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <span
                      className={
                        'grid h-6 w-6 place-items-center rounded-full ' +
                        'bg-brand-100 text-xs font-black text-brand-600'
                      }
                    >
                      {index + 1}
                    </span>
                    <span className="text-sm font-bold text-brand-800">{rule.label}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-right text-sm font-black text-cherry-600">
                  {rule.type === 'PERCENT' ? `${number(rule.value)}%` : money(rule.value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
