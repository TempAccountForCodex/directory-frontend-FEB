import React from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import { ArrowRight, Check, Phone, Play, Quote, Star } from "lucide-react";
import {
  TemplateInnerContainer,
  TemplateSectionBoundary,
} from "../../../components/TemplateSectionLayout";
import { getEditableTextProps } from "../../../utils/editableProps";
import { renderEditableMedia } from "../../../utils/editableComponents";
import { plumbingProAssets } from "../../../assets/plumbing/plumbing-pro";
import { rgba } from "../../company/theme";
import {
  asArray,
  asRecord,
  cardSurfaceSx,
  containerProps,
  heroReveal,
  liftHover,
  MotionBox,
  pillSx,
  plumbingProUnderHeaderSx,
  premiumBlueCtaSx,
  premiumCtaSx,
  resolveLink,
  resolvePlumbingFeatureIcon,
  revealProps,
  scaleHover,
  type PlumbingProTheme,
} from "../plumbingProShared";

type HomePageProps = {
  theme: PlumbingProTheme;
  home: Record<string, any>;
  content: Record<string, any>;
};

const HomePage: React.FC<HomePageProps> = ({ theme, home, content }) => {
  const siteSlug =
    typeof content.__siteSlug === "string" ? content.__siteSlug : undefined;
  const { blue, yellow, navy, softGray, ink, inkSoft, headingFont, bodyFont } =
    theme;

  const hero = asRecord(home.hero || content.hero);
  const trust = asRecord(home.trust || content.trust);
  const servicesList = asRecord(home.servicesList || content.servicesList);
  const intro = asRecord(home.intro || content.intro);
  const whyChoose = asRecord(home.whyChoose || content.whyChoose);
  const members = asRecord(home.members || content.members);
  const promo = asRecord(home.promo || content.promo);
  const testimonials = asRecord(home.testimonials || content.testimonials);
  const contactStrip = asRecord(home.contactStrip || content.contactStrip);

  const serviceItems = asArray(servicesList.features || servicesList.items, [
    {
      icon: "01",
      title: "Repair & Install",
      image: plumbingProAssets.service1,
    },
    {
      icon: "02",
      title: "Commercial Plumbing",
      image: plumbingProAssets.service2,
    },
    {
      icon: "03",
      title: "Residential Boiler",
      image: plumbingProAssets.service3,
    },
  ]);

  const checklist = asArray(intro.features || intro.items, [
    { title: "Fastest Repair Service" },
    { title: "Licensed & Certified" },
    { title: "24/7 Emergency Support" },
  ]);

  const whyChooseFeatures = asArray(whyChoose.features || whyChoose.items, [
    {
      icon: "team",
      title: "Insured Professionals",
      description:
        "Our plumbers are trained experts who follow industry standards on every job.",
    },
    {
      icon: "pricing",
      title: "Transparent Pricing",
      description:
        "We believe in honesty. Every service comes with upfront pricing before work begins.",
    },
  ]);
  const whyChooseDetailGroups = asArray(whyChoose.detailGroups, [
    {
      heading: "Work Backed by Customer Satisfaction",
      description:
        "We ensure everything works perfectly and you're completely satisfied before we leave.",
    },
  ]);
  const whyChooseCta = asRecord(whyChooseDetailGroups[0]);

  const memberItems = asArray(members.members || members.items, [
    { name: "Sonu Maahi", role: "Plumber", photo: plumbingProAssets.member1 },
    {
      name: "Alex Rivera",
      role: "Chief Plumber",
      photo: plumbingProAssets.member2,
    },
    {
      name: "Jordan Lee",
      role: "Technician",
      photo: plumbingProAssets.member3,
    },
    {
      name: "Morgan Blake",
      role: "Installer",
      photo: plumbingProAssets.founder,
    },
  ]);

  const promoItems = asArray(promo.items || promo.features, [
    { title: "Best Response" },
    { title: "Expert Team" },
    { title: "Satisfaction Guaranteed" },
  ]);

  const reviewItems = asArray(testimonials.testimonials || testimonials.items, [
    {
      name: "Leslie Alexander",
      role: "Homeowner",
      quote:
        "I had a great QuickFix team! Fast, friendly, and the leak was fixed the same day.",
      photo: plumbingProAssets.clientAlex,
    },
    {
      name: "Cameron West",
      role: "Business Owner",
      quote:
        "Professional plumbers who explained every step. Highly recommend QuickFix.",
      photo: plumbingProAssets.clientJordan,
    },
  ]);

  const stripStats = asArray(contactStrip.items || contactStrip.stats, [
    { value: "125k+", heading: "Completed Project" },
    { value: "324k+", heading: "Work Per Month" },
    { value: "250+", heading: "Expert Plumbers" },
  ]);

  return (
    <>
      {/* ── Hero ── */}
      <TemplateSectionBoundary
        blockId={hero.blockId}
        label="Hero"
        sectionKey="hero"
        content={hero}
        id="hero"
        sx={{
          ...plumbingProUnderHeaderSx,
          position: "relative",
          minHeight: { xs: "82vh", md: "94vh" },
          display: "flex",
          alignItems: "center",
          color: "#fff",
          overflow: "hidden",
          backgroundImage: `url(${hero.image || plumbingProAssets.hero})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(105deg, ${rgba(navy, 0.88)} 0%, ${rgba(navy, 0.55)} 48%, ${rgba(blue, 0.28)} 100%)`,
          }}
        />
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            right: { md: "-8%" },
            bottom: { md: "-18%" },
            width: { xs: 220, md: 420 },
            height: { xs: 220, md: 420 },
            borderRadius: "50%",
            background: `radial-gradient(circle, ${rgba(yellow, 0.28)} 0%, transparent 68%)`,
            pointerEvents: "none",
          }}
        />
        <TemplateInnerContainer
          sx={{ position: "relative", zIndex: 1, py: { xs: 9, md: 14 } }}
        >
          <Box sx={{ maxWidth: 680 }}>
            <MotionBox {...heroReveal(0.05)}>
              <Typography
                {...getEditableTextProps(hero.blockId, "eyebrow", "single")}
                sx={{ ...pillSx(yellow, navy, bodyFont), mb: 3 }}
              >
                {hero.eyebrow || "24/7 Plumber Service"}
              </Typography>
            </MotionBox>
            <MotionBox {...heroReveal(0.15)}>
              <Typography
                component="h1"
                {...getEditableTextProps(hero.blockId, "heading", "multi")}
                sx={{
                  fontFamily: headingFont,
                  fontWeight: 800,
                  fontSize: { xs: "2.55rem", sm: "3.2rem", md: "4.15rem" },
                  lineHeight: 1.05,
                  mb: 2.25,
                  letterSpacing: "-0.03em",
                  textShadow: "0 12px 40px rgba(0,0,0,0.28)",
                }}
              >
                {hero.heading || "Your affordable plumbing service"}
              </Typography>
            </MotionBox>
            <MotionBox {...heroReveal(0.28)}>
              <Typography
                {...getEditableTextProps(hero.blockId, "subheading", "multi")}
                sx={{
                  color: rgba("#ffffff", 0.9),
                  fontSize: { xs: "1.02rem", md: "1.15rem" },
                  lineHeight: 1.75,
                  maxWidth: 510,
                  mb: 4,
                }}
              >
                {hero.subheading ||
                  "High-quality, cost-effective plumbing for homes and businesses — licensed techs, fair pricing, same-day response."}
              </Typography>
            </MotionBox>
            <MotionBox {...heroReveal(0.4)}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems={{ sm: "center" }}
              >
                <Button
                  href={resolveLink(
                    hero.ctaLink || `tel:${hero.phone || "+12345678910"}`,
                    siteSlug,
                  )}
                  startIcon={<Phone size={18} />}
                  {...getEditableTextProps(hero.blockId, "ctaText", "single")}
                  sx={premiumCtaSx(yellow, navy)}
                >
                  {hero.ctaText || hero.phone || "+1 234 567 8910"}
                </Button>
                <Button
                  href={resolveLink(
                    hero.ctaSecondaryLink || "/contact",
                    siteSlug,
                  )}
                  endIcon={<ArrowRight size={16} />}
                  {...getEditableTextProps(
                    hero.blockId,
                    "ctaSecondaryText",
                    "single",
                  )}
                  sx={{
                    color: "#fff",
                    textTransform: "none",
                    fontWeight: 700,
                    px: 1.5,
                    transition: "transform 0.25s ease, background 0.25s ease",
                    "&:hover": {
                      bgcolor: rgba("#fff", 0.1),
                      transform: "translateX(4px)",
                    },
                  }}
                >
                  {hero.ctaSecondaryText || "Work with us"}
                </Button>
              </Stack>
            </MotionBox>
          </Box>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>

      {/* ── Trust ── */}
      <TemplateSectionBoundary
        blockId={trust.blockId}
        label="Trust bar"
        sectionKey="trust"
        content={trust}
        sx={{
          position: "relative",
          overflow: "hidden",
          bgcolor: blue,
          color: "#fff",
          backgroundColor: blue,
          backgroundImage: `
      radial-gradient(circle at 10% 20%, ${rgba(yellow, 0.22)} 0%, transparent 24%),
      radial-gradient(circle at 88% 18%, ${rgba("#ffffff", 0.14)} 0%, transparent 28%),
      radial-gradient(circle at 50% 120%, ${rgba(navy, 0.62)} 0%, transparent 42%),
      linear-gradient(135deg, ${rgba(blue, 1)} 0%, ${rgba(navy, 0.96)} 100%)
    `,
          boxShadow: `0 22px 60px ${rgba(blue, 0.28)}`,

          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            opacity: 0.2,
            pointerEvents: "none",
            backgroundImage: `
        linear-gradient(135deg, ${rgba("#ffffff", 0.12)} 25%, transparent 25%),
        linear-gradient(225deg, ${rgba("#ffffff", 0.08)} 25%, transparent 25%)
      `,
            backgroundSize: "72px 72px",
            backgroundPosition: "0 0, 36px 36px",
          },

          "&::after": {
            content: '""',
            position: "absolute",
            inset: "1px",
            pointerEvents: "none",
            background: `linear-gradient(90deg, transparent 0%, ${rgba(
              "#ffffff",
              0.1,
            )} 50%, transparent 100%)`,
            opacity: 0.5,
          },
        }}
      >
        <TemplateInnerContainer
          sx={{
            position: "relative",
            zIndex: 1,
            py: { xs: 4, md: 4.8 },
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.05fr 0.95fr" },
            gap: { xs: 2.5, md: 4 },
            alignItems: "center",
          }}
        >
          <MotionBox {...revealProps(0)}>
            <Typography
              {...getEditableTextProps(trust.blockId, "heading", "multi")}
              sx={{
                fontFamily: headingFont,
                fontWeight: 900,
                fontSize: { xs: "1.65rem", md: "2.35rem" },
                lineHeight: 1.05,
                letterSpacing: "-0.055em",
                color: "#ffffff",
                textShadow: `0 14px 32px ${rgba(navy, 0.28)}`,
                maxWidth: 620,
              }}
            >
              {trust.heading || "325k+ Happy Customers in USA"}
            </Typography>
          </MotionBox>

          <MotionBox {...revealProps(0.12)}>
            <Stack
              direction="row"
              spacing={1.55}
              alignItems="center"
              sx={{
                position: "relative",
                overflow: "hidden",
                bgcolor: rgba("#ffffff", 0.12),
                border: `1px solid ${rgba("#ffffff", 0.22)}`,
                borderRadius: "24px",
                px: { xs: 1.6, md: 2 },
                py: { xs: 1.5, md: 1.65 },
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                boxShadow: `inset 0 1px 0 ${rgba(
                  "#ffffff",
                  0.16,
                )}, 0 18px 44px ${rgba(navy, 0.24)}`,

                "&::before": {
                  content: '""',
                  position: "absolute",
                  inset: 0,
                  pointerEvents: "none",
                  background: `linear-gradient(135deg, ${rgba(
                    "#ffffff",
                    0.16,
                  )} 0%, transparent 42%, ${rgba(yellow, 0.1)} 100%)`,
                },
              }}
            >
              <Box sx={{ position: "relative", flexShrink: 0 }}>
                {renderEditableMedia({
                  blockId: trust.blockId,
                  field: "image",
                  label: "Trust avatar",
                  src: trust.image || plumbingProAssets.trustAvatar,
                  alt: "Customer",
                  sx: {
                    width: 62,
                    height: 62,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: `2px solid ${rgba("#ffffff", 0.92)}`,
                    boxShadow: `0 12px 26px ${rgba(navy, 0.28)}`,
                    display: "block",
                  },
                })}

                <Box
                  aria-hidden
                  sx={{
                    position: "absolute",
                    inset: -4,
                    borderRadius: "50%",
                    border: `1px solid ${rgba(yellow, 0.72)}`,
                    pointerEvents: "none",
                  }}
                />
              </Box>

              <Box sx={{ position: "relative", minWidth: 0 }}>
                <Stack direction="row" spacing={0.35} sx={{ mb: 0.55 }}>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star key={i} size={15} fill={yellow} color={yellow} />
                  ))}
                </Stack>

                <Typography
                  {...getEditableTextProps(trust.blockId, "quote", "multi")}
                  sx={{
                    fontSize: { xs: "0.9rem", md: "0.95rem" },
                    color: rgba("#fff", 0.95),
                    lineHeight: 1.55,
                    fontWeight: 650,
                  }}
                >
                  {trust.quote ||
                    "I had great QuickFix team! Fast, friendly, and reliable."}
                </Typography>
              </Box>
            </Stack>
          </MotionBox>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>

      {/* ── Services ── */}
      <TemplateSectionBoundary
        blockId={servicesList.blockId}
        label="Services overview"
        sectionKey="servicesList"
        content={servicesList}
        sx={{
          bgcolor: "#fff",
          py: { xs: 7, md: 11 },
          backgroundImage: `radial-gradient(circle at top right, ${rgba(
            blue,
            0.06,
          )} 0%, transparent 42%)`,
        }}
      >
        <TemplateInnerContainer>
          <MotionBox {...revealProps(0)}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              spacing={2.5}
              sx={{ mb: { xs: 4, md: 5.5 } }}
            >
              <Box>
                <Typography
                  {...getEditableTextProps(
                    servicesList.blockId,
                    "eyebrow",
                    "single",
                  )}
                  sx={{
                    ...pillSx(rgba(blue, 0.12), blue, bodyFont),
                    mb: 1.75,
                  }}
                >
                  {servicesList.eyebrow || "Services"}
                </Typography>

                <Typography
                  component="h2"
                  {...getEditableTextProps(
                    servicesList.blockId,
                    "heading",
                    "multi",
                  )}
                  sx={{
                    fontFamily: headingFont,
                    fontWeight: 850,
                    fontSize: { xs: "1.9rem", md: "2.75rem" },
                    color: ink,
                    maxWidth: 520,
                    letterSpacing: "-0.045em",
                    lineHeight: 1.05,
                  }}
                >
                  {servicesList.heading ||
                    "We are expert in all plumber solution"}
                </Typography>
              </Box>

              <Typography
                {...getEditableTextProps(servicesList.blockId, "body", "multi")}
                sx={{
                  color: inkSoft,
                  maxWidth: 420,
                  lineHeight: 1.75,
                  alignSelf: { md: "flex-end" },
                  fontSize: "1.02rem",
                }}
              >
                {servicesList.body ||
                  "From emergency repairs to full installs, our licensed plumbers deliver clean workmanship every visit."}
              </Typography>
            </Stack>
          </MotionBox>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                md: "repeat(3, minmax(0, 1fr))",
              },
              gap: { xs: 2.5, md: 3 },
              alignItems: "stretch",
            }}
          >
            {serviceItems.map((item, index) => (
              <MotionBox
                key={`${item.title}-${index}`}
                {...revealProps(0.08 * index)}
                whileHover={scaleHover}
                {...containerProps(
                  servicesList.blockId,
                  `servicesList.features.${index}`,
                  item.title || "Service",
                  "card",
                )}
                sx={{
                  height: "100%",
                  bgcolor: "#ffffff",
                  borderRadius: "28px",
                  overflow: "hidden",
                  border: `1px solid ${rgba(navy, 0.08)}`,
                  boxShadow: `0 18px 50px ${rgba(navy, 0.08)}`,
                  display: "flex",
                  flexDirection: "column",
                  p: 1.1,
                  cursor: "default",
                  transition:
                    "transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease",
                  "&:hover": {
                    borderColor: rgba(blue, 0.24),
                    boxShadow: `0 28px 70px ${rgba(blue, 0.16)}`,
                  },
                  "&:hover .service-list-media-overlay": {
                    opacity: 1,
                  },
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    height: { xs: 210, md: 230 },
                    borderRadius: "22px",
                    overflow: "hidden",
                    bgcolor: rgba(navy, 0.04),
                    flexShrink: 0,
                  }}
                >
                  {renderEditableMedia({
                    blockId: servicesList.blockId,
                    field: `features.${index}.image`,
                    label: `${item.title || "Service"} image`,
                    src: item.image || plumbingProAssets.service1,
                    alt: item.title || "Service",
                    sx: {
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "center",
                      display: "block",
                      transition: "transform 0.45s ease",
                      ".MuiBox-root:hover &": { transform: "scale(1.04)" },
                    },
                  })}

                  <Box
                    className="service-list-media-overlay"
                    aria-hidden
                    sx={{
                      position: "absolute",
                      inset: 0,
                      pointerEvents: "none",
                      opacity: 0.85,
                      transition: "opacity 220ms ease",
                      background: `linear-gradient(180deg, ${rgba(
                        navy,
                        0,
                      )} 42%, ${rgba(navy, 0.24)} 100%)`,
                    }}
                  />

                  <Box
                    sx={{
                      position: "absolute",
                      top: 14,
                      left: 14,
                      minWidth: 42,
                      height: 34,
                      px: 1.15,
                      borderRadius: "999px",
                      bgcolor: "#ffffff",
                      color: navy,
                      display: "grid",
                      placeItems: "center",
                      fontFamily: headingFont,
                      fontWeight: 900,
                      fontSize: "0.84rem",
                      boxShadow: `0 12px 28px ${rgba(navy, 0.16)}`,
                    }}
                  >
                    <Typography
                      component="span"
                      {...getEditableTextProps(
                        servicesList.blockId,
                        `features.${index}.icon`,
                        "single",
                      )}
                      sx={{
                        fontWeight: 900,
                        fontSize: "0.84rem",
                        color: navy,
                        lineHeight: 1,
                      }}
                    >
                      {item.icon || String(index + 1).padStart(2, "0")}
                    </Typography>
                  </Box>
                </Box>

                <Box
                  sx={{
                    px: { xs: 2.1, md: 2.35 },
                    py: { xs: 2.1, md: 2.35 },
                    display: "flex",
                    flexDirection: "column",
                    flexGrow: 1,
                    backgroundImage: `linear-gradient(180deg, #ffffff 0%, ${rgba(
                      blue,
                      0.045,
                    )} 100%)`,
                    borderRadius: "0 0 22px 22px",
                  }}
                >
                  <Typography
                    {...getEditableTextProps(
                      servicesList.blockId,
                      `features.${index}.title`,
                      "single",
                    )}
                    sx={{
                      fontFamily: headingFont,
                      fontWeight: 850,
                      color: ink,
                      fontSize: { xs: "1.05rem", md: "1.16rem" },
                      lineHeight: 1.2,
                      letterSpacing: "-0.025em",
                    }}
                  >
                    {item.title}
                  </Typography>
                </Box>
              </MotionBox>
            ))}
          </Box>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>

      {/* ── About teaser ── */}
      <TemplateSectionBoundary
        blockId={intro.blockId}
        label="About teaser"
        sectionKey="intro"
        content={intro}
        sx={{
          bgcolor: softGray,
          py: { xs: 7, md: 11 },
          backgroundImage: `
      radial-gradient(circle at 12% 18%, ${rgba(blue, 0.07)} 0%, transparent 34%),
      radial-gradient(circle at 88% 72%, ${rgba(yellow, 0.18)} 0%, transparent 34%),
      linear-gradient(180deg, ${softGray} 0%, #fff 100%)
    `,
          overflow: "hidden",
        }}
      >
        <TemplateInnerContainer
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "0.9fr 1.1fr" },
            gap: { xs: 4.5, md: 7 },
            alignItems: "center",
          }}
        >
          <MotionBox
            {...revealProps(0)}
            sx={{
              maxWidth: { xs: "100%", md: 560 },
            }}
          >
            <Typography
              {...getEditableTextProps(intro.blockId, "eyebrow", "single")}
              sx={{
                ...pillSx(rgba(blue, 0.12), blue, bodyFont),
                mb: 1.75,
              }}
            >
              {intro.eyebrow || "About Us"}
            </Typography>

            <Typography
              component="h2"
              {...getEditableTextProps(intro.blockId, "heading", "multi")}
              sx={{
                fontFamily: headingFont,
                fontWeight: 850,
                fontSize: { xs: "2rem", md: "3rem" },
                mb: 2.4,
                color: ink,
                letterSpacing: "-0.055em",
                lineHeight: 1.04,
              }}
            >
              {intro.heading || "Smart plumber solution for you 24/7 hours."}
            </Typography>

            <Stack
              spacing={1.15}
              sx={{
                mb: 3.5,
                maxWidth: 460,
              }}
            >
              {checklist.map((item, index) => (
                <Stack
                  key={index}
                  direction="row"
                  spacing={1.25}
                  alignItems="center"
                  sx={{
                    p: 1,
                    pr: 1.4,
                    borderRadius: "999px",
                    bgcolor: "#ffffff",
                    border: `1px solid ${rgba(navy, 0.06)}`,
                    boxShadow: `0 10px 30px ${rgba(navy, 0.05)}`,
                    width: "fit-content",
                    maxWidth: "100%",
                  }}
                >
                  <Box
                    sx={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      bgcolor: blue,
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0,
                      boxShadow: `0 10px 22px ${rgba(blue, 0.3)}`,
                    }}
                  >
                    <Check size={14} color="#fff" strokeWidth={3} />
                  </Box>

                  <Typography
                    {...getEditableTextProps(
                      intro.blockId,
                      `features.${index}.title`,
                      "single",
                    )}
                    sx={{
                      fontWeight: 800,
                      color: ink,
                      fontSize: "0.98rem",
                      lineHeight: 1.35,
                    }}
                  >
                    {item.title}
                  </Typography>
                </Stack>
              ))}
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.35}>
              <Button
                href={resolveLink(intro.ctaLink || "/about", siteSlug)}
                {...getEditableTextProps(intro.blockId, "ctaText", "single")}
                sx={{
                  ...premiumCtaSx(yellow, navy),
                  minHeight: 50,
                  px: 3,
                  borderRadius: "999px",
                  boxShadow: `0 16px 34px ${rgba(yellow, 0.22)}`,
                }}
              >
                {intro.ctaText || "Read More"}
              </Button>

              <Button
                href={resolveLink(
                  intro.ctaSecondaryLink ||
                    `tel:${intro.phone || "+12345678910"}`,
                  siteSlug,
                )}
                startIcon={<Phone size={16} />}
                {...getEditableTextProps(
                  intro.blockId,
                  "ctaSecondaryText",
                  "single",
                )}
                sx={{
                  ...premiumBlueCtaSx(blue),
                  minHeight: 50,
                  px: 3,
                  borderRadius: "999px",
                  boxShadow: `0 16px 34px ${rgba(blue, 0.22)}`,
                }}
              >
                {intro.ctaSecondaryText || intro.phone || "Call Anytime"}
              </Button>
            </Stack>
          </MotionBox>

          <MotionBox
            {...revealProps(0.15)}
            whileHover={liftHover}
            sx={{
              position: "relative",
            }}
          >
            <Box
              aria-hidden
              sx={{
                position: "absolute",
                inset: { xs: 18, md: 24 },
                borderRadius: "34px",
                bgcolor: rgba(blue, 0.1),
                transform: "rotate(-3deg)",
                pointerEvents: "none",
              }}
            />

            <Box
              sx={{
                position: "relative",
                borderRadius: { xs: "28px", md: "36px" },
                overflow: "hidden",
                boxShadow: `0 30px 80px ${rgba(navy, 0.18)}`,
                border: `1px solid ${rgba(blue, 0.12)}`,
                bgcolor: "#ffffff",
                p: 1.15,
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  borderRadius: { xs: "22px", md: "30px" },
                  overflow: "hidden",
                  bgcolor: rgba(navy, 0.04),
                }}
              >
                {renderEditableMedia({
                  blockId: intro.blockId,
                  field: "image",
                  label: "About image",
                  src: intro.image || plumbingProAssets.aboutImage,
                  alt: "Plumbing team",
                  sx: {
                    width: "100%",
                    height: { xs: 320, md: 480 },
                    objectFit: "cover",
                    objectPosition: "center",
                    display: "block",
                  },
                })}

                <Box
                  aria-hidden
                  sx={{
                    position: "absolute",
                    inset: 0,
                    background: `linear-gradient(180deg, transparent 50%, ${rgba(
                      navy,
                      0.22,
                    )} 100%)`,
                    pointerEvents: "none",
                  }}
                />
              </Box>
            </Box>
          </MotionBox>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>

      {/* ── Team ── */}
      <TemplateSectionBoundary
        blockId={members.blockId}
        label="Team"
        sectionKey="members"
        content={members}
        sx={{
          bgcolor: "#fff",
          py: { xs: 7, md: 11 },
          backgroundImage: `radial-gradient(circle at bottom left, ${rgba(
            yellow,
            0.12,
          )} 0%, transparent 40%)`,
        }}
      >
        <TemplateInnerContainer>
          <MotionBox {...revealProps(0)}>
            <Box sx={{ textAlign: "center", mb: { xs: 4, md: 5.5 } }}>
              <Typography
                {...getEditableTextProps(members.blockId, "eyebrow", "single")}
                sx={{ ...pillSx(rgba(blue, 0.12), blue, bodyFont), mb: 1.75 }}
              >
                {members.eyebrow || "Plumber Team"}
              </Typography>

              <Typography
                component="h2"
                {...getEditableTextProps(members.blockId, "heading", "multi")}
                sx={{
                  fontFamily: headingFont,
                  fontWeight: 850,
                  fontSize: { xs: "1.9rem", md: "2.65rem" },
                  color: ink,
                  letterSpacing: "-0.045em",
                  lineHeight: 1.05,
                }}
              >
                {members.heading || "Our hard working members"}
              </Typography>
            </Box>
          </MotionBox>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                md: "repeat(4, minmax(0, 1fr))",
              },
              gap: { xs: 2.4, md: 2.75 },
              alignItems: "stretch",
            }}
          >
            {memberItems.map((member, index) => (
              <MotionBox
                key={`${member.name}-${index}`}
                {...revealProps(0.08 * index)}
                whileHover={liftHover}
                {...containerProps(
                  members.blockId,
                  `members.members.${index}`,
                  member.name || "Member",
                  "card",
                )}
                sx={{
                  height: "100%",
                  bgcolor: "#ffffff",
                  borderRadius: "28px",
                  overflow: "hidden",
                  border: `1px solid ${rgba(navy, 0.08)}`,
                  boxShadow: `0 18px 50px ${rgba(navy, 0.08)}`,
                  display: "flex",
                  flexDirection: "column",
                  p: 1.1,
                  textAlign: "center",
                  transition:
                    "transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease",
                  "&:hover": {
                    borderColor: rgba(blue, 0.24),
                    boxShadow: `0 28px 70px ${rgba(blue, 0.15)}`,
                  },
                  "&:hover .member-card-media-overlay": {
                    opacity: 1,
                  },
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    height: { xs: 260, sm: 245, md: 230 },
                    borderRadius: "22px",
                    overflow: "hidden",
                    bgcolor: rgba(blue, 0.06),
                    flexShrink: 0,
                    backgroundImage: `linear-gradient(180deg, ${rgba(
                      blue,
                      0.1,
                    )} 0%, ${rgba(blue, 0.03)} 100%)`,
                  }}
                >
                  {renderEditableMedia({
                    blockId: members.blockId,
                    field: `members.${index}.photo`,
                    label: `${member.name || "Member"} photo`,
                    src: member.photo || plumbingProAssets.member1,
                    alt: member.name || "Team member",
                    sx: {
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "top center",
                      display: "block",
                      transition: "transform 360ms ease",
                    },
                  })}

                  <Box
                    className="member-card-media-overlay"
                    aria-hidden
                    sx={{
                      position: "absolute",
                      inset: 0,
                      pointerEvents: "none",
                      opacity: 0.85,
                      transition: "opacity 220ms ease",
                      background: `linear-gradient(180deg, ${rgba(
                        navy,
                        0,
                      )} 45%, ${rgba(navy, 0.18)} 100%)`,
                    }}
                  />
                </Box>

                <Box
                  sx={{
                    px: { xs: 1.8, md: 1.6 },
                    py: { xs: 2.1, md: 2 },
                    display: "flex",
                    flexDirection: "column",
                    flexGrow: 1,
                    justifyContent: "center",
                    borderRadius: "0 0 22px 22px",
                    backgroundImage: `linear-gradient(180deg, #ffffff 0%, ${rgba(
                      blue,
                      0.04,
                    )} 100%)`,
                  }}
                >
                  <Typography
                    {...getEditableTextProps(
                      members.blockId,
                      `members.${index}.name`,
                      "single",
                    )}
                    sx={{
                      fontFamily: headingFont,
                      fontWeight: 850,
                      color: ink,
                      fontSize: { xs: "1.05rem", md: "1rem" },
                      lineHeight: 1.2,
                      letterSpacing: "-0.025em",
                    }}
                  >
                    {member.name}
                  </Typography>

                  <Typography
                    {...getEditableTextProps(
                      members.blockId,
                      `members.${index}.role`,
                      "single",
                    )}
                    sx={{
                      color: blue,
                      fontSize: "0.86rem",
                      mt: 0.55,
                      fontWeight: 800,
                      lineHeight: 1.35,
                    }}
                  >
                    {member.role}
                  </Typography>
                </Box>
              </MotionBox>
            ))}
          </Box>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>

      {/* ── Why choose us ── */}
      <TemplateSectionBoundary
        blockId={whyChoose.blockId}
        label="Why choose us"
        sectionKey="whyChoose"
        content={whyChoose}
        sx={{
          bgcolor: softGray,
          py: { xs: 7, md: 11 },
        }}
      >
        <TemplateInnerContainer
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.05fr 0.95fr" },
            gap: { xs: 4, md: 5 },
            alignItems: "stretch",
          }}
        >
          <MotionBox {...revealProps(0)}>
            <Typography
              {...getEditableTextProps(whyChoose.blockId, "eyebrow", "single")}
              sx={{ ...pillSx(rgba(blue, 0.12), blue, bodyFont), mb: 1.75 }}
            >
              {whyChoose.eyebrow || "Why Choose Us"}
            </Typography>
            <Typography
              component="h2"
              {...getEditableTextProps(whyChoose.blockId, "heading", "multi")}
              sx={{
                fontFamily: headingFont,
                fontWeight: 800,
                fontSize: { xs: "1.9rem", md: "2.6rem" },
                color: ink,
                letterSpacing: "-0.03em",
                lineHeight: 1.12,
                mb: 1.5,
                maxWidth: 420,
              }}
            >
              {whyChoose.heading || "Why choose our Services"}
            </Typography>
            <Typography
              {...getEditableTextProps(whyChoose.blockId, "body", "multi")}
              sx={{
                color: inkSoft,
                lineHeight: 1.7,
                fontSize: "1.02rem",
                mb: 3,
                maxWidth: 480,
              }}
            >
              {whyChoose.body ||
                "We combine expertise, reliability, and care to deliver the best experience every time."}
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 2,
                mb: 2,
              }}
            >
              {whyChooseFeatures.map((feature, index) => {
                const FeatureIcon = resolvePlumbingFeatureIcon(feature, index);
                return (
                  <MotionBox
                    key={`${feature.title}-${index}`}
                    {...revealProps(0.08 * (index + 1))}
                    whileHover={liftHover}
                    {...containerProps(
                      whyChoose.blockId,
                      `whyChoose.features.${index}`,
                      feature.title || "Feature",
                      "card",
                    )}
                    sx={{
                      borderRadius: "18px",
                      border: `1px solid ${rgba(navy, 0.1)}`,
                      bgcolor: "#fff",
                      p: 2.5,
                      minHeight: 180,
                    }}
                  >
                    <Box sx={{ color: ink, mb: 1.75 }}>
                      <FeatureIcon size={28} strokeWidth={1.75} />
                    </Box>
                    <Typography
                      {...getEditableTextProps(
                        whyChoose.blockId,
                        `features.${index}.title`,
                        "single",
                      )}
                      sx={{
                        fontFamily: headingFont,
                        fontWeight: 800,
                        color: ink,
                        mb: 1,
                        fontSize: "1.05rem",
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      {...getEditableTextProps(
                        whyChoose.blockId,
                        `features.${index}.description`,
                        "multi",
                      )}
                      sx={{
                        color: inkSoft,
                        lineHeight: 1.65,
                        fontSize: "0.92rem",
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </MotionBox>
                );
              })}
            </Box>

            <MotionBox
              {...revealProps(0.2)}
              {...containerProps(
                whyChoose.blockId,
                "whyChoose.detailGroups.0",
                "Satisfaction CTA",
                "card",
              )}
              sx={{
                bgcolor: navy,
                color: "#fff",
                borderRadius: "20px",
                p: { xs: 2.75, md: 3.25 },
              }}
            >
              <Typography
                {...getEditableTextProps(
                  whyChoose.blockId,
                  "detailGroups.0.heading",
                  "multi",
                )}
                sx={{
                  fontFamily: headingFont,
                  fontWeight: 800,
                  fontSize: { xs: "1.15rem", md: "1.3rem" },
                  mb: 1,
                  lineHeight: 1.25,
                }}
              >
                {whyChooseCta.heading || "Work Backed by Customer Satisfaction"}
              </Typography>
              <Typography
                {...getEditableTextProps(
                  whyChoose.blockId,
                  "detailGroups.0.description",
                  "multi",
                )}
                sx={{
                  color: rgba("#fff", 0.72),
                  lineHeight: 1.65,
                  mb: 2.5,
                  fontSize: "0.95rem",
                  maxWidth: 460,
                }}
              >
                {whyChooseCta.description ||
                  "We ensure everything works perfectly and you're completely satisfied before we leave."}
              </Typography>
              <Button
                href={resolveLink(whyChoose.ctaLink || "/services", siteSlug)}
                endIcon={
                  <Box
                    sx={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      bgcolor: navy,
                      color: "#fff",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <ArrowRight size={12} />
                  </Box>
                }
                {...getEditableTextProps(
                  whyChoose.blockId,
                  "ctaText",
                  "single",
                )}
                sx={{
                  bgcolor: "#fff",
                  color: navy,
                  borderRadius: 999,
                  px: 2.25,
                  py: 1,
                  fontWeight: 700,
                  textTransform: "none",
                  fontSize: "0.92rem",
                  transition: "transform 0.25s ease, box-shadow 0.25s ease",
                  "&:hover": {
                    bgcolor: "#fff",
                    transform: "translateY(-2px)",
                    boxShadow: `0 12px 28px ${rgba(navy, 0.25)}`,
                  },
                }}
              >
                {whyChoose.ctaText || "Explore all our services"}
              </Button>
            </MotionBox>
          </MotionBox>

          <MotionBox {...revealProps(0.12)} whileHover={liftHover}>
            <Box
              {...containerProps(
                whyChoose.blockId,
                "whyChoose.imageWrap",
                "Why choose image",
                "card",
              )}
              sx={{
                height: "100%",
                minHeight: { xs: 320, md: 560 },
                borderRadius: "24px",
                overflow: "hidden",
                boxShadow: `0 24px 56px ${rgba(navy, 0.14)}`,
              }}
            >
              {renderEditableMedia({
                blockId: whyChoose.blockId,
                field: "image",
                label: "Why choose image",
                src: whyChoose.image || plumbingProAssets.plumberService,
                alt: whyChoose.heading || "Why choose us",
                sx: {
                  width: "100%",
                  height: "100%",
                  minHeight: { xs: 320, md: 560 },
                  objectFit: "cover",
                  objectPosition: "center top",
                  display: "block",
                },
              })}
            </Box>
          </MotionBox>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>

      {/* ── Promo ── */}
      <TemplateSectionBoundary
        blockId={promo.blockId}
        label="Promo video"
        sectionKey="promo"
        content={promo}
        sx={{
          bgcolor: blue,
          color: "#fff",
          position: "relative",
          overflow: "hidden",
          backgroundImage: `linear-gradient(135deg, ${blue} 0%, ${rgba(navy, 0.92)} 100%)`,
        }}
      >
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            left: "-10%",
            top: "-20%",
            width: 360,
            height: 360,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${rgba(yellow, 0.22)} 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />
        <TemplateInnerContainer
          sx={{
            py: { xs: 7, md: 9 },
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 4.5,
            alignItems: "center",
            position: "relative",
            zIndex: 1,
          }}
        >
          <MotionBox {...revealProps(0)}>
            {renderEditableMedia({
              blockId: promo.blockId,
              field: "image",
              label: "Promo image",
              src: promo.image || plumbingProAssets.promoImage,
              alt: "Plumber with customer",
              sx: {
                width: "100%",
                maxHeight: 380,
                objectFit: "contain",
                objectPosition: "bottom",
                filter: "drop-shadow(0 24px 40px rgba(0,0,0,0.28))",
              },
            })}
          </MotionBox>
          <MotionBox {...revealProps(0.12)}>
            <Typography
              component="h2"
              {...getEditableTextProps(promo.blockId, "heading", "multi")}
              sx={{
                fontFamily: headingFont,
                fontWeight: 800,
                fontSize: { xs: "1.85rem", md: "2.55rem" },
                mb: 3.25,
                letterSpacing: "-0.02em",
                lineHeight: 1.15,
              }}
            >
              {promo.heading || "Perfect solution for all plumbing service"}
            </Typography>
            <Button
              href={resolveLink(promo.ctaLink || "/contact", siteSlug)}
              startIcon={<Play size={16} />}
              {...getEditableTextProps(promo.blockId, "ctaText", "single")}
              sx={{
                border: "2px solid #fff",
                color: "#fff",
                borderRadius: 999,
                px: 3.25,
                py: 1.25,
                textTransform: "none",
                fontWeight: 800,
                transition: "transform 0.25s ease, background 0.25s ease",
                "&:hover": {
                  bgcolor: rgba("#fff", 0.12),
                  transform: "translateY(-2px)",
                },
              }}
            >
              {promo.ctaText || "Watch Video"}
            </Button>
          </MotionBox>
        </TemplateInnerContainer>
        <Box
          sx={{
            bgcolor: yellow,
            color: navy,
            boxShadow: `0 -8px 28px ${rgba(navy, 0.12)}`,
          }}
        >
          <TemplateInnerContainer
            sx={{
              py: 2.75,
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
              gap: 2,
              textAlign: "center",
            }}
          >
            {promoItems.map((item, index) => (
              <MotionBox key={index} {...revealProps(0.06 * index)}>
                <Typography
                  {...getEditableTextProps(
                    promo.blockId,
                    `items.${index}.title`,
                    "single",
                  )}
                  sx={{
                    fontFamily: headingFont,
                    fontWeight: 800,
                    fontSize: { xs: "1rem", md: "1.08rem" },
                  }}
                >
                  {item.title}
                </Typography>
              </MotionBox>
            ))}
          </TemplateInnerContainer>
        </Box>
      </TemplateSectionBoundary>

      {/* ── Testimonials ── */}
      <TemplateSectionBoundary
        blockId={testimonials.blockId}
        label="Testimonials"
        sectionKey="testimonials"
        content={testimonials}
        sx={{
          bgcolor: softGray,
          py: { xs: 7, md: 11 },
          backgroundImage: `radial-gradient(circle at top left, ${rgba(blue, 0.07)} 0%, transparent 45%)`,
        }}
      >
        <TemplateInnerContainer>
          <MotionBox {...revealProps(0)}>
            <Box sx={{ mb: 5 }}>
              <Typography
                {...getEditableTextProps(
                  testimonials.blockId,
                  "eyebrow",
                  "single",
                )}
                sx={{ ...pillSx(rgba(blue, 0.12), blue, bodyFont), mb: 1.75 }}
              >
                {testimonials.eyebrow || "Customer Says"}
              </Typography>
              <Typography
                component="h2"
                {...getEditableTextProps(
                  testimonials.blockId,
                  "heading",
                  "multi",
                )}
                sx={{
                  fontFamily: headingFont,
                  fontWeight: 800,
                  fontSize: { xs: "1.85rem", md: "2.45rem" },
                  color: ink,
                  letterSpacing: "-0.02em",
                }}
              >
                {testimonials.heading || "315k+ Positive Reviews"}
              </Typography>
            </Box>
          </MotionBox>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 3,
            }}
          >
            {reviewItems.map((review, index) => (
              <MotionBox
                key={index}
                {...revealProps(0.1 * index)}
                whileHover={liftHover}
                {...containerProps(
                  testimonials.blockId,
                  `testimonials.testimonials.${index}`,
                  review.name || "Review",
                  "card",
                )}
                sx={{
                  ...cardSurfaceSx,
                  p: { xs: 3, md: 3.5 },
                  position: "relative",
                  bgcolor: "#fff",
                  "&:hover": {
                    boxShadow: `0 24px 52px ${rgba(blue, 0.14)}`,
                  },
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: 18,
                    right: 18,
                    width: 42,
                    height: 42,
                    borderRadius: "14px",
                    bgcolor: rgba(blue, 0.1),
                    display: "grid",
                    placeItems: "center",
                    color: blue,
                  }}
                >
                  <Quote size={18} />
                </Box>
                <Stack
                  direction="row"
                  spacing={1.6}
                  alignItems="center"
                  sx={{ mb: 2.25 }}
                >
                  {renderEditableMedia({
                    blockId: testimonials.blockId,
                    field: `testimonials.${index}.photo`,
                    label: "Avatar",
                    src: review.photo || plumbingProAssets.clientAlex,
                    alt: review.name || "Customer",
                    sx: {
                      width: 54,
                      height: 54,
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: `2px solid ${rgba(blue, 0.2)}`,
                    },
                  })}
                  <Box>
                    <Typography
                      {...getEditableTextProps(
                        testimonials.blockId,
                        `testimonials.${index}.name`,
                        "single",
                      )}
                      sx={{ fontWeight: 800, color: ink, fontSize: "1.05rem" }}
                    >
                      {review.name}
                    </Typography>
                    <Typography
                      {...getEditableTextProps(
                        testimonials.blockId,
                        `testimonials.${index}.role`,
                        "single",
                      )}
                      sx={{
                        fontSize: "0.84rem",
                        color: inkSoft,
                        fontWeight: 600,
                      }}
                    >
                      {review.role}
                    </Typography>
                  </Box>
                </Stack>
                <Typography
                  {...getEditableTextProps(
                    testimonials.blockId,
                    `testimonials.${index}.quote`,
                    "multi",
                  )}
                  sx={{
                    color: inkSoft,
                    lineHeight: 1.75,
                    mb: 2,
                    fontSize: "1.02rem",
                  }}
                >
                  {review.quote}
                </Typography>
                <Stack direction="row" spacing={0.35}>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star key={i} size={15} fill={yellow} color={yellow} />
                  ))}
                </Stack>
              </MotionBox>
            ))}
          </Box>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>

      {/* ── Contact strip ── */}
      <TemplateSectionBoundary
        blockId={contactStrip.blockId}
        label="Contact strip"
        sectionKey="contactStrip"
        content={contactStrip}
        sx={{
          bgcolor: "#fff",
          py: { xs: 7, md: 10 },
          backgroundImage: `
      radial-gradient(circle at 12% 18%, ${rgba(blue, 0.08)} 0%, transparent 32%),
      radial-gradient(circle at 88% 72%, ${rgba(yellow, 0.22)} 0%, transparent 34%),
      linear-gradient(180deg, #fff 0%, ${softGray} 100%)
    `,
          overflow: "hidden",
        }}
      >
        <TemplateInnerContainer>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "0.92fr 1.08fr" },
              gap: { xs: 2.5, md: 3 },
              alignItems: "stretch",
            }}
          >
            <MotionBox
              {...revealProps(0)}
              sx={{
                position: "relative",
                overflow: "hidden",
                bgcolor: blue,
                color: "#fff",
                p: { xs: 3, sm: 4, md: 5 },
                borderRadius: { xs: 4, md: 5 },
                minHeight: { xs: "auto", md: 520 },
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                backgroundImage: `
            radial-gradient(circle at 12% 12%, ${rgba("#ffffff", 0.12)} 0%, transparent 32%),
            linear-gradient(145deg, ${blue} 0%, ${rgba(navy, 0.96)} 100%)
          `,
                boxShadow: `0 24px 70px ${rgba(navy, 0.16)}`,
              }}
            >
              <Box
                aria-hidden
                sx={{
                  position: "absolute",
                  right: -64,
                  top: -64,
                  width: 190,
                  height: 190,
                  borderRadius: "50%",
                  border: `1px solid ${rgba("#ffffff", 0.12)}`,
                  pointerEvents: "none",
                }}
              />

              <Stack
                spacing={{ xs: 3, md: 3.4 }}
                sx={{ position: "relative", zIndex: 1 }}
              >
                <Box>
                  <Typography
                    {...getEditableTextProps(
                      contactStrip.blockId,
                      "addressHeading",
                      "single",
                    )}
                    sx={{
                      fontFamily: headingFont,
                      fontWeight: 850,
                      mb: 1,
                      fontSize: { xs: "1rem", md: "1.08rem" },
                      letterSpacing: "-0.02em",
                      color: "#fff",
                    }}
                  >
                    {contactStrip.addressHeading || "Our Address"}
                  </Typography>

                  <Typography
                    {...getEditableTextProps(
                      contactStrip.blockId,
                      "address",
                      "multi",
                    )}
                    sx={{
                      color: rgba("#fff", 0.84),
                      lineHeight: 1.7,
                      fontSize: "0.98rem",
                      maxWidth: 420,
                    }}
                  >
                    {contactStrip.address ||
                      "455 West Orchard Street, Light City, UK"}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    {...getEditableTextProps(
                      contactStrip.blockId,
                      "contactHeading",
                      "single",
                    )}
                    sx={{
                      fontFamily: headingFont,
                      fontWeight: 850,
                      mb: 1,
                      fontSize: { xs: "1rem", md: "1.08rem" },
                      letterSpacing: "-0.02em",
                      color: "#fff",
                    }}
                  >
                    {contactStrip.contactHeading || "Contact Info"}
                  </Typography>

                  <Typography
                    {...getEditableTextProps(
                      contactStrip.blockId,
                      "phone",
                      "single",
                    )}
                    sx={{
                      mb: 0.6,
                      color: rgba("#fff", 0.9),
                      fontWeight: 700,
                      lineHeight: 1.55,
                    }}
                  >
                    {contactStrip.phone || "+1 234 567 8910"}
                  </Typography>

                  <Typography
                    {...getEditableTextProps(
                      contactStrip.blockId,
                      "email",
                      "single",
                    )}
                    sx={{
                      color: rgba("#fff", 0.9),
                      fontWeight: 700,
                      lineHeight: 1.55,
                      wordBreak: "break-word",
                    }}
                  >
                    {contactStrip.email || "hello@quickfix.com"}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    {...getEditableTextProps(
                      contactStrip.blockId,
                      "hoursHeading",
                      "single",
                    )}
                    sx={{
                      fontFamily: headingFont,
                      fontWeight: 850,
                      mb: 1,
                      fontSize: { xs: "1rem", md: "1.08rem" },
                      letterSpacing: "-0.02em",
                      color: "#fff",
                    }}
                  >
                    {contactStrip.hoursHeading || "Opening Hours"}
                  </Typography>

                  <Typography
                    {...getEditableTextProps(
                      contactStrip.blockId,
                      "hours",
                      "multi",
                    )}
                    sx={{
                      color: rgba("#fff", 0.88),
                      fontWeight: 650,
                      lineHeight: 1.6,
                    }}
                  >
                    {contactStrip.hours || "Mon - Sat 8am - 10pm"}
                  </Typography>
                </Box>
              </Stack>
            </MotionBox>

            <MotionBox
              {...revealProps(0.12)}
              sx={{
                position: "relative",
                minHeight: { xs: 320, md: 520 },
                borderRadius: { xs: 4, md: 5 },
                overflow: "hidden",
                boxShadow: `0 24px 70px ${rgba(navy, 0.14)}`,
                bgcolor: rgba(navy, 0.04),
              }}
            >
              {renderEditableMedia({
                blockId: contactStrip.blockId,
                field: "image",
                label: "Contact image",
                src: contactStrip.image || plumbingProAssets.contactImage,
                alt: "Plumber at work",
                sx: {
                  width: "100%",
                  height: "100%",
                  minHeight: { xs: 320, md: 520 },
                  objectFit: "cover",
                  objectPosition: "center",
                  display: "block",
                },
              })}

              <Box
                aria-hidden
                sx={{
                  position: "absolute",
                  inset: 0,
                  pointerEvents: "none",
                  background: `linear-gradient(180deg, ${rgba(
                    navy,
                    0,
                  )} 45%, ${rgba(navy, 0.18)} 100%)`,
                }}
              />
            </MotionBox>
          </Box>

          <Box
            sx={{
              mt: { xs: 2.5, md: 3 },
              bgcolor: yellow,
              color: navy,
              borderRadius: { xs: 4, md: 5 },
              boxShadow: `0 18px 54px ${rgba(navy, 0.1)}`,
              overflow: "hidden",
              backgroundImage: `linear-gradient(135deg, ${yellow} 0%, ${rgba(
                yellow,
                0.82,
              )} 100%)`,
            }}
          >
            <Box
              sx={{
                py: { xs: 3, md: 3.5 },
                px: { xs: 2.5, md: 4 },
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
                gap: { xs: 2.5, md: 3 },
                textAlign: "center",
              }}
            >
              {stripStats.map((stat, index) => (
                <MotionBox
                  key={index}
                  {...revealProps(0.08 * index)}
                  sx={{
                    position: "relative",
                    px: { xs: 0, sm: 2 },
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      right: 0,
                      top: "12%",
                      width: "1px",
                      height: "76%",
                      bgcolor: rgba(navy, 0.14),
                      display: {
                        xs: "none",
                        sm: index === stripStats.length - 1 ? "none" : "block",
                      },
                    },
                  }}
                >
                  <Typography
                    {...getEditableTextProps(
                      contactStrip.blockId,
                      `items.${index}.value`,
                      "single",
                    )}
                    sx={{
                      fontFamily: headingFont,
                      fontWeight: 900,
                      fontSize: { xs: "1.8rem", md: "2.2rem" },
                      letterSpacing: "-0.04em",
                      lineHeight: 1,
                    }}
                  >
                    {stat.value}
                  </Typography>

                  <Typography
                    {...getEditableTextProps(
                      contactStrip.blockId,
                      `items.${index}.heading`,
                      "single",
                    )}
                    sx={{
                      fontWeight: 800,
                      fontSize: "0.92rem",
                      mt: 0.65,
                      color: rgba(navy, 0.86),
                    }}
                  >
                    {stat.heading}
                  </Typography>
                </MotionBox>
              ))}
            </Box>
          </Box>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>
    </>
  );
};

export default HomePage;
