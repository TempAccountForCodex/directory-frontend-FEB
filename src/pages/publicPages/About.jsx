import React from "react";
import { Box } from "@mui/material";
import {
  ABOUT_HERO,
  default as AboutStickyScrollData,
} from "./../../utils/data/AboutPageData";
import ContentCard from "../../components/common/ContentCard";
import StickyLeftScrollableRightSection from "../../components/common/StickyLeftScrollableRightSection";
import AboutModern from "../../components/publicComponents/About/AboutHeroModern";
import CTASection from "../../components/publicComponents/About/CTASection";
import CTAVideo from "../../components/publicComponents/About/CTAVideo";
import FeaturePromo from "../../components/publicComponents/About/FeaturePromo";
import FounderSection from "../../components/publicComponents/About/FounderSection";
import WhyWeBuiltThis from "../../components/publicComponents/About/WhyWeBuiltThis";
import ReachOut from "../../components/publicComponents/About/ReachOut";
import WhyChooseUs from "../../components/publicComponents/About/WhyChooseUs";
import DarkMinimalistRibbon from "../../components/publicComponents/About/DarkMinimalistRibbon";

const sticky = AboutStickyScrollData;

const rightContent = sticky.processContentData.map((item, index) => (
  <ContentCard
    key={index}
    title={item.title}
    icon={sticky.ICONS[item.title]}
    isLast={index === sticky.processContentData.length - 1}
    accentColor="#378C92"
  >
    {item.description}
  </ContentCard>
));

export default function About() {
  return (
    <Box sx={{}}>
      <AboutModern {...ABOUT_HERO} />

      <WhyChooseUs />

      <CTASection />

      <CTAVideo />

      <FeaturePromo />

      <Box id="ABOUT_STICKY_SCROLL">
        <StickyLeftScrollableRightSection
          title={sticky.title}
          subtitle={sticky.subtitle}
          callToActionText={sticky.callToActionText}
          callToActionLink={sticky.callToActionLink}
          rightContent={rightContent}
          speedFactor={1}
        />
      </Box>

      <DarkMinimalistRibbon />

      <WhyWeBuiltThis />

      <FounderSection />

      <ReachOut />
    </Box>
  );
}
