import { money } from '~/lib/format';
import { type Invoice } from '../types';

interface InvoicesInfoCardsProps {
  total: number;
  invoices: Invoice[];
}

function InfoCard({
  label,
  value,
  caption,
}: {
  label: string;
  value: string;
  caption: string;
}) {
  return (
    <div className="card p-5">
      <p className="text-xs font-bold uppercase tracking-wider text-brand-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-black text-brand-900">{value}</p>
      <p className="mt-1 text-xs font-semibold text-brand-400">{caption}</p>
    </div>
  );
}

export function InvoicesInfoCards({ total, invoices }: InvoicesInfoCardsProps) {
  const unpaidBalance = invoices.reduce(
    (sum, row) => sum + Number(row.outstandingAmount ?? row.outstanding_amount ?? 0),
    0
  );
  const refundsDueCount = invoices.filter(
    (row) => row.status === 'REFUND_DUE'
  ).length;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <InfoCard
        label="Total Invoices"
        value={String(total)}
        caption="Invoices matching filter"
      />
      <InfoCard
        label="Unpaid Balance"
        value={money(unpaidBalance)}
        caption="Accumulated pending payments"
      />
      <InfoCard
        label="Refunds Due"
        value={String(refundsDueCount)}
        caption="Overpayments / unavailable items"
      />
    </div>
  );
}
