import { TrackingBanner } from './components/tracking-banner';
import { TrackingOrderDetails } from './components/tracking-order-details';
import { TrackingOrderHeader } from './components/tracking-order-header';
import { TrackingSearchBox } from './components/tracking-search-box';
import { TrackingTimeline } from './components/tracking-timeline';
import { usePublicTracking } from './hooks/use-public-tracking';

export default function PublicTrackingRoute() {
  const {
    inputCode,
    setInputCode,
    data,
    loading,
    error,
    copiedResi,
    handleSearch,
    handleSubmit,
    handleCopyResi,
  } = usePublicTracking();

  return (
    <div className="space-y-12 py-10">
      <TrackingBanner />

      <TrackingSearchBox
        inputCode={inputCode}
        setInputCode={setInputCode}
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
        onSelectSample={(sample) => {
          setInputCode(sample);
          handleSearch(sample);
        }}
      />

      {data && (
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8 animate-rise">
          <TrackingOrderHeader
            data={data}
            copiedResi={copiedResi}
            onCopyResi={handleCopyResi}
          />

          <TrackingTimeline timeline={data.timeline} />

          <TrackingOrderDetails data={data} />
        </div>
      )}
    </div>
  );
}
