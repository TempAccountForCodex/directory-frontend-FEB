import React, { Suspense, lazy, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Hero from "../../components/publicComponents/Home/Hero";
const WhatMakesUsDifferentV2 = lazy(
  () => import("../../components/publicComponents/Home/WhatMakeUsDifferentV2"),
);
const FAQSection = lazy(() => import("./../../components/UI/FAQSection"));

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

const DeferredSection = ({
  children,
  enabled = true,
}: {
  children: React.ReactNode;
  enabled?: boolean;
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setVisible(false);
      return;
    }

    setVisible(true);
  }, [enabled]);

  return visible ? <>{children}</> : null;
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

      <DeferredSection enabled={true}>
        <Suspense fallback={null}>
          <WhatMakesUsDifferentV2 />
        </Suspense>
      </DeferredSection>

      <DeferredSection enabled={true}>
        <Suspense fallback={null}>
          <WhyChooseUs />
        </Suspense>
      </DeferredSection>

      <section id="how-it-works">
        <DeferredSection enabled={enableBelowFoldSections}>
          <Suspense fallback={null}>
            <HowItWorks />
          </Suspense>
        </DeferredSection>
      </section>

      <DeferredSection enabled={enableBelowFoldSections}>
        <Suspense fallback={null}>
          <DirectoryFeatures />
        </Suspense>
      </DeferredSection>

      <DeferredSection enabled={enableBelowFoldSections}>
        <Suspense fallback={null}>
          <SearchDiscoverSection />
        </Suspense>
      </DeferredSection>

      <DeferredSection enabled={enableBelowFoldSections}>
        <Suspense fallback={null}>
          <TemplatesStackSlider />
        </Suspense>
      </DeferredSection>
      <section id="pricing">
        <DeferredSection enabled={enableBelowFoldSections}>
          <Suspense fallback={null}>
            <PricingSection />
          </Suspense>
        </DeferredSection>
      </section>

      <section id="explore-listings">
        <DeferredSection enabled={enableBelowFoldSections}>
          <Suspense fallback={null}>
            <FeatureListing />
          </Suspense>
        </DeferredSection>
      </section>

      <section id="ai-tools">
        <DeferredSection enabled={enableBelowFoldSections}>
          <Suspense fallback={null}>
            <WebsiteWorksSection />
          </Suspense>
        </DeferredSection>
      </section>

      <DeferredSection enabled={enableBelowFoldSections}>
        <Suspense fallback={null}>
          <TestimonialSlider />
        </Suspense>
      </DeferredSection>

      <section id="faq">
        <DeferredSection enabled={enableBelowFoldSections}>
          <Suspense fallback={null}>
            <FAQSection
              title="Frequently Asked Questions"
              items={homeFAQs}
            />{" "}
          </Suspense>
        </DeferredSection>
      </section>

      <DeferredSection enabled={enableBelowFoldSections}>
        <Suspense fallback={null}>
          <HighPerformanceSection />
        </Suspense>
      </DeferredSection>
    </>
  );
};

export default Home;
