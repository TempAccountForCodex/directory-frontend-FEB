import Hero from "../../components/publicComponents/Contact/Hero";
import CTASection from "../../components/publicComponents/Contact/CtaSection";
import FollowUs from "../../components/publicComponents/careers/FollowUs";
import Map from "./../../components/publicComponents/contact/Map";
import SocialInfo from "../../components/publicComponents/Contact/SocialInfo";
import FAQSection from "../../components/UI/FAQSection";
import FormSection from "./../../components/publicComponents/Contact/FormSection";
import Faq from "./../../components/publicComponents/Contact/Faq";

const contactFAQs = [
  {
    question: "How can I contact your team?",
    answer:
      "You can reach us via live chat, email, or phone. Choose the option that’s most convenient for you and our team will assist you.",
  },
  {
    question: "What is the fastest way to get support?",
    answer:
      "Live chat is the quickest way to get help for most questions. For detailed inquiries, email support is also available.",
  },
  {
    question: "What are your support hours?",
    answer:
      "Our support team is available during regular business hours, Monday to Friday. Messages received outside these hours are answered as soon as possible.",
  },
  {
    question: "Can you help me set up or update my business page?",
    answer:
      "Yes. Our team can guide you through creating, editing, or updating your business landing page and listing.",
  },
  {
    question: "How long does it take to get a response?",
    answer:
      "We aim to respond to most inquiries within a few hours during business hours.",
  },
  {
    question: "Is my information safe when I contact you?",
    answer:
      "Yes. Your information is kept private and is only used to respond to your inquiry.",
  },
];

const ContactUs = () => {
  return (
    <>
      <Hero />

      <CTASection />

      <SocialInfo />

      {/* <FAQSection
        title="Contact & Support FAQ"
        items={contactFAQs}
        defaultOpenIndex={0}
      /> */}

      <Faq />

      <Map />

      <FormSection />

      <FollowUs />
    </>
  );
};

export default ContactUs;
