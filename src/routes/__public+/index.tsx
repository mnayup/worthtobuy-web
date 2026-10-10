import { HomeCtaSection } from './components/home-cta-section';
import { HomeEventsSection } from './components/home-events-section';
import { HomeFaqSection } from './components/home-faq-section';
import { HomeHeroSection } from './components/home-hero-section';
import { HomeHowItWorksSection } from './components/home-how-it-works-section';
import { HomeInstagramSection } from './components/home-instagram-section';
import { HomePillarsSection } from './components/home-pillars-section';
import { HomeReadyStockSection } from './components/home-ready-stock-section';
import { usePublicHome } from './hooks/use-public-home';

export default function CustomerHomeRoute() {
  const {
    events,
    readyProducts,
    trackingCode,
    setTrackingCode,
    handleQuickTrack,
    openFaq,
    setOpenFaq,
  } = usePublicHome();

  return (
    <div className="space-y-20 pb-20">
      <HomeHeroSection
        trackingCode={trackingCode}
        setTrackingCode={setTrackingCode}
        onQuickTrack={handleQuickTrack}
      />

      <HomeEventsSection events={events} />

      <HomeReadyStockSection products={readyProducts} />

      <HomePillarsSection />

      <HomeHowItWorksSection />

      <HomeInstagramSection />

      <HomeFaqSection openFaq={openFaq} setOpenFaq={setOpenFaq} />

      <HomeCtaSection />
    </div>
  );
}
