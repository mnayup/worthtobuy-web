import { MessageCircle, ExternalLink } from 'lucide-react';
import { StatusBadge } from '~/components/StatusBadge';

interface CustomerProfileCardProps {
  email?: string;
  address?: string;
  postalCode?: string;
  socialUsername?: string;
  segment: string;
  notes?: string;
  whatsappGroup?: {
    id: number;
    name: string;
    url?: string;
  } | null;
}

export function CustomerProfileCard({
  email,
  address,
  postalCode,
  socialUsername,
  segment,
  notes,
  whatsappGroup,
}: CustomerProfileCardProps) {
  return (
    <section className="card p-5">
      <h2 className="font-black text-brand-900 text-lg">Customer Profile</h2>
      <dl className="mt-4 space-y-3.5 text-sm">
        <div className="flex justify-between items-center border-b border-brand-50 pb-2">
          <dt className="font-bold text-brand-400">WhatsApp Group</dt>
          <dd>
            {whatsappGroup ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <MessageCircle size={12} className="text-emerald-500" />
                {whatsappGroup.name}
                {whatsappGroup.url && (
                  <a
                    href={whatsappGroup.url}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-1 text-emerald-600 hover:text-emerald-800"
                    title="Open WA Group"
                  >
                    <ExternalLink size={11} />
                  </a>
                )}
              </span>
            ) : (
              <span className="text-brand-300 font-semibold text-xs italic">Unassigned</span>
            )}
          </dd>
        </div>
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
