import ScrollToTopButton from "../../utils/commons/ScrollToTopBtn";
import HeroImageSectionV2 from "../../utils/commons/HeroSectionInsightsV2";

import InsightCardsLayout from "../../components/publicComponents/insights/InsightCardsLayout";

import { BlogHeroData } from "./../../utils/data/Insights";

const InsightsPage = () => {
  return (
    <>
      <ScrollToTopButton />

      <HeroImageSectionV2 eyebrow={undefined} {...BlogHeroData} />

      <InsightCardsLayout />
    </>
  );
};

export default InsightsPage;
