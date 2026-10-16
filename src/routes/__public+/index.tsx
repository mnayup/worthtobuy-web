import { useState } from 'react';
import { HomeCtaSection } from './components/home-cta-section';
import { HomeEventsSection } from './components/home-events-section';
import { HomeFaqSection } from './components/home-faq-section';
import { HomeHeroSection } from './components/home-hero-section';
import { HomeHowItWorksSection } from './components/home-how-it-works-section';
import { HomeInstagramSection } from './components/home-instagram-section';
import { HomePillarsSection } from './components/home-pillars-section';
import { HomeReadyStockSection } from './components/home-ready-stock-section';
import { ReadyStockDetailModal } from './components/ready-stock-detail-modal';
import { usePublicHome } from './hooks/use-public-home';

export default function CustomerHomeRoute() {
  const {
    overview,
    events,
    readyProducts,
    trackingCode,
    setTrackingCode,
    handleQuickTrack,
    openFaq,
    setOpenFaq,
  } = usePublicHome();

  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  return (
    <div className="space-y-20 pb-20">
      <HomeHeroSection
        trackingCode={trackingCode}
        setTrackingCode={setTrackingCode}
        onQuickTrack={handleQuickTrack}
      />

      <HomeEventsSection events={events} />

      <HomeReadyStockSection
        products={readyProducts}
        onSelectProduct={setSelectedProduct}
        brandWhatsApp={overview?.brand?.whatsapp}
      />

      <HomePillarsSection />

      <HomeHowItWorksSection />

      <HomeInstagramSection brand={overview?.brand} />

      <HomeFaqSection openFaq={openFaq} setOpenFaq={setOpenFaq} />

      <HomeCtaSection />

      {selectedProduct && (
        <ReadyStockDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
