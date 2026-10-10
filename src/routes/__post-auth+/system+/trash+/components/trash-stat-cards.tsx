import React from 'react';

interface TrashStatCardsProps {
  counts: { all: number; invoice: number; transaction: number };
}

export function TrashStatCards({ counts }: TrashStatCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="card p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-400">
          Total in Trash
        </p>
        <p className="mt-2 text-3xl font-black text-brand-900">{counts.all}</p>
      </div>
      <div className="card p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-400">
          Invoices
        </p>
        <p className="mt-2 text-3xl font-black text-brand-900">{counts.invoice}</p>
      </div>
      <div className="card p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-400">
          Other Transactions
        </p>
        <p className="mt-2 text-3xl font-black text-brand-900">
          {counts.transaction}
        </p>
      </div>
    </div>
  );
}
