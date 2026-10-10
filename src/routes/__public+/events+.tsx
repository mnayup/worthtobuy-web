import { Calendar } from 'lucide-react';
import { EventCard } from './components/event-card';
import { EventsBanner } from './components/events-banner';
import { EventsCustomRequest } from './components/events-custom-request';
import { EventsFilterBar } from './components/events-filter-bar';
import { usePublicEvents } from './hooks/use-public-events';

export default function PublicEventsRoute() {
  const {
    filteredEvents,
    loading,
    search,
    setSearch,
    activeTab,
    setActiveTab,
  } = usePublicEvents();

  return (
    <div className="space-y-12 py-10">
      <EventsBanner />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <EventsFilterBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          search={search}
          onSearchChange={setSearch}
        />

        <div className="mt-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-80 rounded-3xl bg-slate-100 animate-pulse border border-slate-200"
                />
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div
              className={
                'rounded-3xl border border-dashed border-slate-300 ' +
                'p-12 text-center bg-white'
              }
            >
              <Calendar size={40} className="mx-auto text-slate-400" />
              <p className="mt-3 text-base font-bold text-slate-800">
                Tidak ada event yang sesuai dengan pencarian
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Coba ubah kata kunci pencarian atau reset filter di atas.
              </p>
              <button
                onClick={() => {
                  setSearch('');
                  setActiveTab('ALL');
                }}
                className={
                  'mt-4 inline-flex items-center gap-1.5 rounded-xl ' +
                  'bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800'
                }
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map((evt) => (
                <EventCard key={evt.id} evt={evt} />
              ))}
            </div>
          )}
        </div>
      </div>

      <EventsCustomRequest />
    </div>
  );
}
