import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ItemTrackingRoute() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/orders', { replace: true });
  }, [navigate]);

  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="rounded-2xl border border-brand-100 bg-white p-8 text-center shadow-xs">
        <p className="text-sm font-bold text-brand-900">Redirecting to Orders...</p>
        <p className="mt-1 text-xs text-brand-400">Item status is now managed directly through Orders and Purchases.</p>
      </div>
    </div>
  );
}
