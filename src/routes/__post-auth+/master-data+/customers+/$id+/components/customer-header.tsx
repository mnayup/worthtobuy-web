import { ArrowLeft, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CustomerHeaderProps {
  fullName: string;
  customerCode: string;
  whatsapp?: string;
  city?: string;
  phone: string;
}

export function CustomerHeader({
  fullName,
  customerCode,
  whatsapp,
  city,
  phone,
}: CustomerHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <button
          onClick={() => navigate('/customers')}
          className={
            'mb-3 inline-flex items-center gap-2 text-sm font-extrabold ' +
            'text-brand-500 hover:text-brand-900 transition'
          }
        >
          <ArrowLeft size={17} /> Back to Customers
        </button>
        <h1 className="text-3xl font-black text-brand-900 tracking-tight">{fullName}</h1>
        <p className="mt-1 text-sm font-semibold text-brand-500">
          {customerCode} • {whatsapp || 'No WhatsApp'} • {city || 'City not specified'}
        </p>
      </div>
      <div className="flex flex-wrap gap-2.5">
        <a
          className={
            'btn-secondary !bg-white hover:!bg-emerald-50 hover:!text-emerald-700 ' +
            'hover:!border-emerald-200 transition'
          }
          href={`https://wa.me/${phone}`}
          target="_blank"
          rel="noreferrer"
        >
          <MessageCircle size={17} className="text-emerald-500" /> WhatsApp
        </a>
        <button
          className="btn-primary"
          onClick={() => navigate(`/orders?search=${encodeURIComponent(customerCode)}`)}
        >
          View Orders
        </button>
      </div>
    </div>
  );
}
