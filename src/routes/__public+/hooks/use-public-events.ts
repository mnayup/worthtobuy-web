import { useEffect, useMemo, useState } from 'react';
import { api } from '~/lib/api';

export type EventTab = 'ALL' | 'OPEN' | 'LOCAL' | 'OVERSEAS';

export function usePublicEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<EventTab>('ALL');

  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true);
        const res = await api.get('/public/events');
        setEvents(res.data || []);
      } catch (err) {
        console.error('Failed to load events', err);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      const term = search.toLowerCase().trim();
      const matchesSearch =
        !term ||
        evt.name?.toLowerCase().includes(term) ||
        evt.city?.toLowerCase().includes(term) ||
        evt.country?.toLowerCase().includes(term) ||
        evt.code?.toLowerCase().includes(term);

      if (!matchesSearch) return false;

      if (activeTab === 'OPEN') return evt.isOpenPO || evt.status === 'OPEN';
      if (activeTab === 'LOCAL') return evt.type === 'LOCAL';
      if (activeTab === 'OVERSEAS') return evt.type === 'OVERSEAS';
      return true;
    });
  }, [events, search, activeTab]);

  return {
    events,
    filteredEvents,
    loading,
    search,
    setSearch,
    activeTab,
    setActiveTab,
  };
}
