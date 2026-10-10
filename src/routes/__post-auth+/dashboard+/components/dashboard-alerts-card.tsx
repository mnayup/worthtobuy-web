import { AlertTriangle, ShoppingBag, Truck, WalletCards } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AlertItem } from './alert-item';

interface DashboardAlertsCardProps {
  alerts?: {
    overduePayments?: any[];
    unpurchased?: any[];
    lateShipments?: any[];
  };
}

export function DashboardAlertsCard({ alerts }: DashboardAlertsCardProps) {
  const navigate = useNavigate();

  return (
    <section className="card p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <AlertTriangle className="text-amber-500" size={20} />
        <h2 className="section-title">Requires Attention</h2>
      </div>
      <div className="mt-4 space-y-3">
        <AlertItem
          icon={WalletCards}
          label="Overdue Invoices"
          value={alerts?.overduePayments?.length || 0}
          onClick={() => navigate('/invoices?overdue=1')}
        />
        <AlertItem
          icon={ShoppingBag}
          label="Unpurchased Order Items"
          value={alerts?.unpurchased?.length || 0}
          onClick={() => navigate('/shopping-list')}
        />
        <AlertItem
          icon={Truck}
          label="Delayed Shipments"
          value={alerts?.lateShipments?.length || 0}
          onClick={() => navigate('/shipments')}
        />
      </div>
    </section>
  );
}
