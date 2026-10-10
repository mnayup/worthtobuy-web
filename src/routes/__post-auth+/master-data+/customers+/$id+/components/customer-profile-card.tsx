import { StatusBadge } from '~/components/StatusBadge';

interface CustomerProfileCardProps {
  email?: string;
  address?: string;
  postalCode?: string;
  socialUsername?: string;
  segment: string;
  notes?: string;
}

export function CustomerProfileCard({
  email,
  address,
  postalCode,
  socialUsername,
  segment,
  notes,
}: CustomerProfileCardProps) {
  return (
    <section className="card p-5">
      <h2 className="font-black text-brand-900 text-lg">Customer Profile</h2>
      <dl className="mt-4 space-y-3.5 text-sm">
        <div className="flex justify-between items-baseline border-b border-brand-50 pb-2">
          <dt className="font-bold text-brand-400">Email</dt>
          <dd className="font-semibold text-brand-800">{email || '-'}</dd>
        </div>
        <div className="border-b border-brand-50 pb-2">
          <dt className="font-bold text-brand-400 mb-1">Address</dt>
          <dd className="font-semibold text-brand-800 leading-relaxed">
            {address || '-'} {postalCode ? `(${postalCode})` : ''}
          </dd>
        </div>
        <div className="flex justify-between items-baseline border-b border-brand-50 pb-2">
          <dt className="font-bold text-brand-400">Social Media</dt>
          <dd className="font-semibold text-brand-800">{socialUsername || '-'}</dd>
        </div>
        <div className="flex justify-between items-center border-b border-brand-50 pb-2">
          <dt className="font-bold text-brand-400">Segment</dt>
          <dd>
            <StatusBadge value={segment} />
          </dd>
        </div>
        <div>
          <dt className="font-bold text-brand-400 mb-1">Notes</dt>
          <dd
            className={
              'whitespace-pre-wrap font-semibold text-brand-800 bg-brand-50/50 ' +
              'p-3 rounded-xl border border-brand-100'
            }
          >
            {notes || '-'}
          </dd>
        </div>
      </dl>
    </section>
  );
}
