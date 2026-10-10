import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '~/lib/api';

export function usePublicHome() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [readyProducts, setReadyProducts] = useState<any[]>([]);
  const [trackingCode, setTrackingCode] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [overviewRes, eventsRes, productsRes] = await Promise.all([
          api.get('/public/overview'),
          api.get('/public/events'),
          api.get('/public/products/ready-stock?limit=4'),
        ]);

        setOverview(overviewRes.data);
        setEvents(eventsRes.data.slice(0, 3));
        setReadyProducts(productsRes.data.items?.slice(0, 4) || []);
      } catch (err) {
        console.error('Failed to load public data', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  function handleQuickTrack(e: React.FormEvent) {
    e.preventDefault();
    if (trackingCode.trim()) {
      navigate(`/track?q=${encodeURIComponent(trackingCode.trim())}`);
    }
  }

  return {
    overview,
    events,
    readyProducts,
    loading,
    trackingCode,
    setTrackingCode,
    handleQuickTrack,
    openFaq,
    setOpenFaq,
  };
}
