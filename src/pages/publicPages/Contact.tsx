import { Suspense, lazy, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import Hero from "../../components/publicComponents/Contact/Hero";

const CTASection = lazy(
  () => import("../../components/publicComponents/Contact/CtaSection"),
);
const FollowUs = lazy(
  () => import("../../components/publicComponents/careers/FollowUs"),
);
const Map = lazy(() => import("../../components/publicComponents/Contact/Map"));
const SocialInfo = lazy(
  () => import("../../components/publicComponents/Contact/SocialInfo"),
);
const FormSection = lazy(
  () => import("../../components/publicComponents/Contact/FormSection"),
);
const Faq = lazy(() => import("../../components/publicComponents/Contact/Faq"));

type DeferredSectionProps = {
  children: ReactNode;
  minHeight: string;
  rootMargin?: string;
};

const DeferredSection = ({
  children,
  minHeight,
  rootMargin = "250px 0px",
}: DeferredSectionProps) => {
  const [visible, setVisible] = useState(false);
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (visible || !mountRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(mountRef.current);

    return () => observer.disconnect();
  }, [rootMargin, visible]);

  return (
    <div ref={mountRef} style={{ minHeight: visible ? undefined : minHeight }}>
      {visible ? <Suspense fallback={null}>{children}</Suspense> : null}
    </div>
  );
};

const ContactUs = () => {
  return (
    <>
      <Hero />

      <DeferredSection minHeight="72vh">
        <CTASection />
      </DeferredSection>

      <DeferredSection minHeight="58vh">
        <SocialInfo />
      </DeferredSection>

      <DeferredSection minHeight="85vh">
        <Faq />
      </DeferredSection>

      <DeferredSection minHeight="70vh" rootMargin="300px 0px">
        <Map />
      </DeferredSection>

      <DeferredSection minHeight="82vh" rootMargin="300px 0px">
        <FormSection />
      </DeferredSection>

      <DeferredSection minHeight="54vh" rootMargin="300px 0px">
        <FollowUs />
      </DeferredSection>
    </>
  );
};

export default ContactUs;
