import React from "react";
import {
  default as AboutStickyScrollData,
} from "./../../../utils/data/AboutPageData";
import ContentCard from "../../common/ContentCard";
import StickyLeftScrollableRightSection from "../../common/StickyLeftScrollableRightSection";

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

export default function AboutStickyBlock() {
  return (
    <StickyLeftScrollableRightSection
      title={sticky.title}
      subtitle={sticky.subtitle}
      callToActionText={sticky.callToActionText}
      callToActionLink={sticky.callToActionLink}
      rightContent={rightContent}
      speedFactor={1}
    />
  );
}
