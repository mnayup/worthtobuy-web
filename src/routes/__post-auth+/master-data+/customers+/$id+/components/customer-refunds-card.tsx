import { WalletCards } from 'lucide-react';
import { StatusBadge } from '~/components/StatusBadge';
import { money } from '~/lib/format';

interface CustomerRefundsCardProps {
  refunds: any[];
}

export function CustomerRefundsCard({ refunds }: CustomerRefundsCardProps) {
  return (
    <section className="card overflow-hidden">
      <div
        className={
          'flex items-center gap-2 border-b border-brand-100 ' +
          'px-5 py-4 bg-brand-50/20'
        }
      >
        <WalletCards size={18} className="text-cherry-500" />
        <h2 className="font-black text-brand-900">Refunds</h2>
      </div>
      <div className="divide-y divide-brand-50">
        {refunds.length ? (
          refunds.map((refund: any) => (
            <div key={refund.id} className="px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-black text-brand-900">
                  {refund.refund_number || refund.refundNumber}
                </p>
                <p className="font-black text-brand-900">{money(refund.amount)}</p>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <p className="text-xs text-brand-500">{refund.reason}</p>
                <StatusBadge value={refund.status} />
              </div>
            </div>
          ))
        ) : (
          <p className="p-8 text-center text-sm font-medium text-brand-400">
            No refunds found.
          </p>
        )}
      </div>
    </section>
  );
}
