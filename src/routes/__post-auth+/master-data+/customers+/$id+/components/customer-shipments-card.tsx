import { Truck } from 'lucide-react';
import { StatusBadge } from '~/components/StatusBadge';

interface CustomerShipmentsCardProps {
  shipments: any[];
}

export function CustomerShipmentsCard({ shipments }: CustomerShipmentsCardProps) {
  return (
    <section className="card overflow-hidden">
      <div
        className={
          'flex items-center gap-2 border-b border-brand-100 ' +
          'px-5 py-4 bg-brand-50/20'
        }
      >
        <Truck size={18} className="text-cherry-500" />
        <h2 className="font-black text-brand-900">Shipments</h2>
      </div>
      <div className="divide-y divide-brand-50">
        {shipments.length ? (
          shipments.map((shipment: any) => (
            <div key={shipment.id} className="px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-black text-brand-900">
                  {shipment.trackingNumber || 'No tracking yet'}
                </p>
                <StatusBadge value={shipment.status} />
              </div>
              <p className="mt-1 text-xs text-brand-500">
                {shipment.courier} • {shipment.order?.orderNumber}
              </p>
            </div>
          ))
        ) : (
          <p className="p-8 text-center text-sm font-medium text-brand-400">
            No shipments found.
          </p>
        )}
      </div>
    </section>
  );
}
