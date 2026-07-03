import React, { Suspense, lazy, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Hero from "../../components/publicComponents/Home/Hero";
const FAQSection = lazy(() => import("./../../components/UI/FAQSection"));

const loadWhatMakesUsDifferentV2 = () =>
  import("../../components/publicComponents/Home/WhatMakeUsDifferentV2");
const WhatMakesUsDifferentV2 = lazy(loadWhatMakesUsDifferentV2);
const WhyChooseUs = lazy(
  () => import("../../components/publicComponents/Home/WhyChooseUs"),
);
const HowItWorks = lazy(
  () => import("../../components/publicComponents/Home/HowItWorks"),
);
const DirectoryFeatures = lazy(
  () => import("../../components/publicComponents/Home/DirectoryFeatures"),
);
const SearchDiscoverSection = lazy(
  () => import("../../components/publicComponents/Home/ListingSearch"),
);
const TemplatesStackSlider = lazy(
  () => import("../../components/publicComponents/Home/TemplatesStackSlider"),
);
const PricingSection = lazy(
  () => import("../../components/publicComponents/Home/PricingSection"),
);
const FeatureListing = lazy(
  () => import("../../components/publicComponents/Home/FeaturedListing"),
);
const WebsiteWorksSection = lazy(
  () => import("../../components/publicComponents/Home/WebsiteWorksSection"),
);
const TestimonialSlider = lazy(
  () => import("../../components/publicComponents/Home/TestimonialSlider"),
);
const HighPerformanceSection = lazy(
  () => import("../../components/publicComponents/Home/HighPerformanceSection"),
);

import { homeFAQs } from "../../utils/data/Home";

const SectionFallback = ({
  minHeight,
  background = "#000",
}: {
  minHeight: string;
  background?: string;
}) => (
  <div
    aria-hidden="true"
    style={{
      minHeight,
      background,
    }}
  />
);

/**
 * Renders a cheap placeholder div (matching the section's height/background)
 * from first paint until the section is enabled AND its lazy chunk has loaded.
 * This keeps the page at its full height so a fast scroll never lands on a
 * blank gap or the footer, while still deferring all JS below the fold.
 */
const DeferredSection = ({
  children,
  enabled = true,
  fallback,
}: {
  children: React.ReactNode;
  enabled?: boolean;
  fallback: React.ReactNode;
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (enabled) setVisible(true);
  }, [enabled]);

  return visible ? (
    <Suspense fallback={fallback}>{children}</Suspense>
  ) : (
    <>{fallback}</>
  );
};

const Home: React.FC = () => {
  const location = useLocation();
  const [enableBelowFoldSections, setEnableBelowFoldSections] = useState(false);

  useEffect(() => {
    // Hash-based deep links must render all content immediately.
    if (location.hash) {
      setEnableBelowFoldSections(true);
      return;
    }

    const unlock = () => setEnableBelowFoldSections(true);

    window.addEventListener("scroll", unlock, { passive: true, once: true });
    window.addEventListener("wheel", unlock, { passive: true, once: true });
    window.addEventListener("touchstart", unlock, {
      passive: true,
      once: true,
    });
    window.addEventListener("keydown", unlock, { once: true });

    return () => {
      window.removeEventListener("scroll", unlock);
      window.removeEventListener("wheel", unlock);
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, [location.hash]);

  // Warm the first below-fold section (JS chunk + its images) during idle
  // time so it renders instantly on the first scroll. It stays render-gated
  // on interaction, so initial-load metrics are unaffected.
  useEffect(() => {
    const warm = () => {
      loadWhatMakesUsDifferentV2();
      [
        "/assets/publicAssets/images/common/star.svg",
        "/assets/publicAssets/images/home/platform.webp",
      ].forEach((src) => {
        const img = new Image();
        img.src = src;
      });
    };

    if (typeof window.requestIdleCallback === "function") {
      const idleId = window.requestIdleCallback(warm, { timeout: 3000 });
      return () => window.cancelIdleCallback(idleId);
    }
    const timeoutId = window.setTimeout(warm, 1500);
    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const element = document.getElementById(id);

      if (element) {
        setTimeout(() => {
          const yOffset = -80;
          const y =
            element.getBoundingClientRect().top + window.pageYOffset + yOffset;

          window.scrollTo({ top: y, behavior: "smooth" });
        }, 100);
      }
    }
  }, [location]);

  return (
    <>
      <Hero />

      <DeferredSection
        enabled={enableBelowFoldSections}
        fallback={<SectionFallback minHeight="100vh" />}
      >
        <WhatMakesUsDifferentV2 />
      </DeferredSection>

      <DeferredSection
        enabled={enableBelowFoldSections}
        fallback={<SectionFallback minHeight="980px" background="#fff" />}
      >
        <WhyChooseUs />
      </DeferredSection>

      <section id="how-it-works">
        <DeferredSection
          enabled={enableBelowFoldSections}
          fallback={<SectionFallback minHeight="90vh" background="#041e18" />}
        >
          <HowItWorks />
        </DeferredSection>
      </section>

      <DeferredSection
        enabled={enableBelowFoldSections}
        fallback={<SectionFallback minHeight="90vh" background="#f7f5f3" />}
      >
        <DirectoryFeatures />
      </DeferredSection>

      <DeferredSection
        enabled={enableBelowFoldSections}
        fallback={<SectionFallback minHeight="90vh" background="#041e18" />}
      >
        <SearchDiscoverSection />
      </DeferredSection>

      <DeferredSection
        enabled={enableBelowFoldSections}
        fallback={<SectionFallback minHeight="90vh" background="#fff" />}
      >
        <TemplatesStackSlider />
      </DeferredSection>
      <section id="pricing">
        <DeferredSection
          enabled={enableBelowFoldSections}
          fallback={<SectionFallback minHeight="90vh" background="#030303" />}
        >
          <PricingSection />
        </DeferredSection>
      </section>

      <section id="explore-listings">
        <DeferredSection
          enabled={enableBelowFoldSections}
          fallback={<SectionFallback minHeight="90vh" background="#fff" />}
        >
          <FeatureListing />
        </DeferredSection>
      </section>

      <section id="ai-tools">
        <DeferredSection
          enabled={enableBelowFoldSections}
          fallback={<SectionFallback minHeight="90vh" background="#101010" />}
        >
          <WebsiteWorksSection />
        </DeferredSection>
      </section>

      <DeferredSection
        enabled={enableBelowFoldSections}
        fallback={<SectionFallback minHeight="80vh" background="#041e18" />}
      >
        <TestimonialSlider />
      </DeferredSection>

      <section id="faq">
        <DeferredSection
          enabled={enableBelowFoldSections}
          fallback={<SectionFallback minHeight="80vh" background="#fff" />}
        >
          <FAQSection title="Frequently Asked Questions" items={homeFAQs} />
        </DeferredSection>
      </section>

      <DeferredSection
        enabled={enableBelowFoldSections}
        fallback={<SectionFallback minHeight="80vh" background="#080808" />}
      >
        <HighPerformanceSection />
      </DeferredSection>
    </>
  );
};

export default Home;
