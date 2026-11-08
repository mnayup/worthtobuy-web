import { CustomerPinModal } from './components/customer-pin-modal';
import { CustomerTrackingInvoiceList } from './components/customer-tracking-invoice-list';
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
    pinModalOpen,
    setPinModalOpen,
    pendingCustomerCode,
    phoneLast5,
    setPhoneLast5,
    pinLoading,
    pinError,
    handlePinSubmit,
    customerResult,
    selectedCustomerInvoice,
    setSelectedCustomerInvoice,
    handleResetCustomerSession,
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

      {/* Pop-up modal for Customer ID (CUST-...) 5-digit Phone Verification */}
      <CustomerPinModal
        open={pinModalOpen}
        customerCode={pendingCustomerCode}
        phoneLast5={phoneLast5}
        setPhoneLast5={setPhoneLast5}
        loading={pinLoading}
        error={pinError}
        onClose={() => setPinModalOpen(false)}
        onSubmit={handlePinSubmit}
      />

      {/* Customer Invoice List View (when verified via Customer ID + 5 last phone digits) */}
      {customerResult && (
        <CustomerTrackingInvoiceList
          result={customerResult}
          selectedInvoice={selectedCustomerInvoice}
          onSelectInvoice={setSelectedCustomerInvoice}
          onResetSession={handleResetCustomerSession}
          copiedResi={copiedResi}
          onCopyResi={handleCopyResi}
        />
      )}

      {/* Direct Single Order / Invoice / Resi Tracking View */}
      {data && !customerResult && (
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
