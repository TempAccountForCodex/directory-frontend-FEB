import React, { Suspense, lazy, useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import { ABOUT_HERO } from "./../../utils/data/AboutPageData";
import AboutModern from "../../components/publicComponents/About/AboutHeroModern";
import WhyChooseUs from "../../components/publicComponents/About/WhyChooseUs";
const CTASection = lazy(
  () => import("../../components/publicComponents/About/CTASection"),
);
const CTAVideo = lazy(
  () => import("../../components/publicComponents/About/CTAVideo"),
);
const FeaturePromo = lazy(
  () => import("../../components/publicComponents/About/FeaturePromo"),
);
const AboutStickyBlock = lazy(
  () => import("../../components/publicComponents/About/AboutStickyBlock"),
);
const DarkMinimalistRibbon = lazy(
  () => import("../../components/publicComponents/About/DarkMinimalistRibbon"),
);
const WhyWeBuiltThis = lazy(
  () => import("../../components/publicComponents/About/WhyWeBuiltThis"),
);
const FounderSection = lazy(
  () => import("../../components/publicComponents/About/FounderSection"),
);
const ReachOut = lazy(
  () => import("../../components/publicComponents/About/ReachOut"),
);

const DeferredSection = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "60px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Box
      ref={ref}
      sx={{
        overflow: "clip",
      }}
    >
      {visible ? <Suspense fallback={null}>{children}</Suspense> : null}
    </Box>
  );
};

export default function About() {
  return (
    <Box sx={{}}>
      <AboutModern {...ABOUT_HERO} />

      <WhyChooseUs />

      <DeferredSection minHeight="90vh">
        <CTASection />
      </DeferredSection>

      <DeferredSection>
        <CTAVideo />
      </DeferredSection>

      <DeferredSection minHeight="70vh">
        <FeaturePromo />
      </DeferredSection>

      <Box id="ABOUT_STICKY_SCROLL">
        <DeferredSection>
          <AboutStickyBlock />
        </DeferredSection>
      </Box>

      <DeferredSection>
        <DarkMinimalistRibbon />
      </DeferredSection>

      <DeferredSection minHeight="80vh">
        <WhyWeBuiltThis />
      </DeferredSection>

      <DeferredSection minHeight="70vh">
        <FounderSection />
      </DeferredSection>

      <DeferredSection minHeight="80vh">
        <ReachOut />
      </DeferredSection>
    </Box>
  );
}
