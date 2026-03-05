import { Box, Container, Typography } from "@mui/material";
import PricingDetail from "./../../components/publicComponents/Pricing/PricingDetail";
import WhatEveryPlanGets from "./../../components/publicComponents/Pricing/WhatEveryPlanGets";
import FAQSection from "../../components/UI/FAQSection";
import Team from "./../../components/publicComponents/Pricing/Team";
import Hero from "./../../components/publicComponents/Pricing/Hero";

const Pricing = () => {
  const pricingFAQs = [
    {
      question: "Is the landing page really free?",
      answer:
        "Yes. Every business can create and publish a professional landing page for free, with no time limits or hidden costs.",
    },
    {
      question: "Do I need design or coding skills?",
      answer:
        "No. Your landing page is auto-generated and fully editable through a simple dashboard — no coding required.",
    },
    {
      question: "What can I add to my landing page?",
      answer:
        "You can add your business details, services, images, working hours, location, contact information, and social links.",
    },
    {
      question: "How does the business directory listing work?",
      answer:
        "Once your page is published, your business is automatically listed in our public directory so customers can discover you by category or location.",
    },
    {
      question: "Can I edit my landing page after publishing?",
      answer:
        "Yes. You can update your content anytime, and changes go live after a quick quality review.",
    },
    {
      question: "Are there any premium upgrade options available?",
      answer:
        "Yes. You can upgrade to access featured listings, enhanced visibility, advanced customization options, and additional promotional tools.",
    },
  ];

  return (
    <Box>
      <Hero />

      <WhatEveryPlanGets />

      <PricingDetail />

      <FAQSection title="Landing Page FAQ" items={pricingFAQs} />

      <Team />
    </Box>
  );
};

export default Pricing;
