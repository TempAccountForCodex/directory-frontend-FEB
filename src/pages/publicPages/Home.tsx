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
  delayMs = 0,
}: {
  children: React.ReactNode;
  delayMs?: number;
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 900px)").matches;
    if (isMobile) {
      // Defer non-critical home sections on mobile so above-the-fold content
      // stays fast without changing the desktop rendering path.
      const timer = window.setTimeout(() => setVisible(true), delayMs);
      return () => window.clearTimeout(timer);
    }

    const effectiveDelay = delayMs + 500;
    const timer = window.setTimeout(() => setVisible(true), effectiveDelay);
    return () => window.clearTimeout(timer);
  }, [delayMs]);

  return visible ? <>{children}</> : null;
};

const Home: React.FC = () => {
  const location = useLocation();

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

      <DeferredSection delayMs={600}>
        <Suspense fallback={null}>
          <WhatMakesUsDifferentV2 />
        </Suspense>
      </DeferredSection>

      <DeferredSection delayMs={500}>
        <Suspense fallback={null}>
          <WhyChooseUs />
        </Suspense>
      </DeferredSection>

      <section id="how-it-works">
        <DeferredSection delayMs={1800}>
          <Suspense fallback={null}>
            <HowItWorks />
          </Suspense>
        </DeferredSection>
      </section>

      <DeferredSection delayMs={2400}>
        <Suspense fallback={null}>
          <DirectoryFeatures />
        </Suspense>
      </DeferredSection>

      <DeferredSection delayMs={3200}>
        <Suspense fallback={null}>
          <SearchDiscoverSection />
        </Suspense>
      </DeferredSection>

      <DeferredSection delayMs={4200}>
        <Suspense fallback={null}>
          <TemplatesStackSlider />
        </Suspense>
      </DeferredSection>
      <section id="pricing">
        <DeferredSection delayMs={5200}>
          <Suspense fallback={null}>
            <PricingSection />
          </Suspense>
        </DeferredSection>
      </section>

      <section id="explore-listings">
        <DeferredSection delayMs={6200}>
          <Suspense fallback={null}>
            <FeatureListing />
          </Suspense>
        </DeferredSection>
      </section>

      <section id="ai-tools">
        <DeferredSection delayMs={7200}>
          <Suspense fallback={null}>
            <WebsiteWorksSection />
          </Suspense>
        </DeferredSection>
      </section>

      <DeferredSection delayMs={8200}>
        <Suspense fallback={null}>
          <TestimonialSlider />
        </Suspense>
      </DeferredSection>

      <section id="faq">
        <DeferredSection delayMs={9200}>
          <Suspense fallback={null}>
            <FAQSection
              title="Frequently Asked Questions"
              items={homeFAQs}
            />{" "}
          </Suspense>
        </DeferredSection>
      </section>

      <DeferredSection delayMs={10200}>
        <Suspense fallback={null}>
          <HighPerformanceSection />
        </Suspense>
      </DeferredSection>
    </>
  );
};

export default Home;
