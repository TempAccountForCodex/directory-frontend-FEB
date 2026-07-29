import { Box, Container, Typography } from "@mui/material";
import PricingDetail from "./../../components/publicComponents/Pricing/PricingDetail";
import WhatEveryPlanGets from "./../../components/publicComponents/Pricing/WhatEveryPlanGets";
import FAQSection from "../../components/UI/FAQSection";
import Team from "./../../components/publicComponents/Pricing/Team";
import Hero from "./../../components/publicComponents/Pricing/Hero";

const Pricing = () => {
  const pricingFAQs = [
    {
      question: "Is the Free plan really free?",
      answer:
        "Yes. Free includes one single-page landing site, one built-in form, 50 submissions per month, 5 blog posts, 50 MB storage, and a techietribe.app subdomain.",
    },
    {
      question: "Can I buy only one website?",
      answer:
        "Yes. Paid plans start at 1 website. You can scale through 1, 5, 10, 20, 25, 50, 100, 150, 200, and 250 websites.",
    },
    {
      question: "What is included in Pro?",
      answer:
        "Pro adds custom domains, directory listings for each site, premium templates, SEO tools, custom code and embeds, basic analytics, and 2 collaborators per website.",
    },
    {
      question: "What does Business add?",
      answer:
        "Business adds enhanced directory visibility, advanced integrations, higher AI and storage limits, moderation controls, conversion analytics, 10 collaborators per website, priority support, and light shop/catalog or payment-link features.",
    },
    {
      question: "What happens when I need more websites?",
      answer:
        "You can increase your site count from the pricing page or account billing area. Pricing scales by website, so you only pay for the number of sites you choose.",
    },
    {
      question: "Can I change plans later?",
      answer:
        "Yes. You can start free, upgrade when you need more websites or advanced features, and manage plan changes from your account once billing is connected.",
    },
  ];

  return (
    <Box>
      <Hero />

      <WhatEveryPlanGets />

      <PricingDetail />

      <FAQSection title="Pricing FAQ" items={pricingFAQs} />

      <Team />
    </Box>
  );
};

export default Pricing;
