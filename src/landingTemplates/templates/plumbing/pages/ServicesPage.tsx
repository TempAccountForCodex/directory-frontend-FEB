import React from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import { Phone } from "lucide-react";
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
  containerProps,
  eyebrowSx,
  plumbingProUnderHeaderSx,
  resolveLink,
  resolvePlumbingFeatureIcon,
  type PlumbingProTheme,
} from "../plumbingProShared";

type ServicesPageProps = {
  theme: PlumbingProTheme;
  services: Record<string, any>;
  siteSlug?: string;
};

const ServicesPage: React.FC<ServicesPageProps> = ({
  theme,
  services,
  siteSlug,
}) => {
  const { blue, yellow, navy, softGray, ink, inkSoft, headingFont, bodyFont } =
    theme;

  const banner = asRecord(services.banner);
  const why = asRecord(services.why);
  const features = asRecord(services.features);
  const cta = asRecord(services.cta);

  const whyFeatures = asArray(why.features || why.items, [
    {
      icon: "experience",
      title: "Experience Team",
      description:
        "Our plumbers handle a wide range of residential and commercial tasks with care.",
    },
    {
      icon: "delivery",
      title: "On-time Delivery",
      description:
        "Methodical scheduling and clear communication keep every project on track.",
    },
  ]);

  const serviceCards = asArray(features.features || features.items, [
    {
      title: "Repair & Install",
      description:
        "Leak fixes, fixture installs, and reliable part replacements.",
      image: plumbingProAssets.service1,
    },
    {
      title: "Commercial Plumbing",
      description:
        "Scalable plumbing support for offices, retail, and facilities.",
      image: plumbingProAssets.service2,
    },
    {
      title: "Residential Boiler",
      description:
        "Boiler inspection, repair, and efficient home heating support.",
      image: plumbingProAssets.service3,
    },
    {
      title: "All Drain Cleaning",
      description:
        "Powerful drain clearing that restores flow and prevents backups.",
      image: plumbingProAssets.service4,
    },
    {
      title: "Kitchen Plumbing",
      description:
        "Sink, disposal, and supply-line work done cleanly and quickly.",
      image: plumbingProAssets.service5,
    },
    {
      title: "Bathroom Fitting",
      description:
        "Faucet, shower, and bathroom fixture fitting with tidy finish work.",
      image: plumbingProAssets.service6,
    },
  ]);

  return (
    <>
      <TemplateSectionBoundary
        blockId={banner.blockId}
        label="Services banner"
        sectionKey="banner"
        content={banner}
        sx={{
          ...plumbingProUnderHeaderSx,
          bgcolor: blue,
          color: "#fff",
          py: { xs: 7, md: 9 },
          textAlign: "center",
        }}
      >
        <TemplateInnerContainer sx={{ maxWidth: 720 }}>
          <Typography
            component="h1"
            {...getEditableTextProps(banner.blockId, "heading", "multi")}
            sx={{
              fontFamily: headingFont,
              fontWeight: 800,
              fontSize: { xs: "2.2rem", md: "3rem" },
              mb: 1.5,
            }}
          >
            {banner.heading || "Our Services"}
          </Typography>
          <Typography
            {...getEditableTextProps(banner.blockId, "body", "multi")}
            sx={{ color: rgba("#fff", 0.9), lineHeight: 1.7 }}
          >
            {banner.body ||
              "Reliable, trustworthy, and affordable plumbing solutions for your home or business"}
          </Typography>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>

      <TemplateSectionBoundary
        blockId={why.blockId}
        label="Why choose us"
        sectionKey="why"
        content={why}
        sx={{ bgcolor: "#fff", py: { xs: 6, md: 9 } }}
      >
        <TemplateInnerContainer
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: { xs: 4, md: 6 },
            alignItems: "center",
          }}
        >
          {renderEditableMedia({
            blockId: why.blockId,
            field: "image",
            label: "Why image",
            src: why.image || plumbingProAssets.servicesWhy,
            alt: "Plumber at sink",
            sx: {
              width: "100%",
              height: { xs: 280, md: 420 },
              objectFit: "cover",
              borderRadius: "20px",
            },
          })}
          <Box>
            <Typography
              {...getEditableTextProps(why.blockId, "eyebrow", "single")}
              sx={{ ...eyebrowSx(blue, bodyFont), mb: 1.5 }}
            >
              {why.eyebrow || "— WHY CHOOSE US"}
            </Typography>
            <Typography
              component="h2"
              {...getEditableTextProps(why.blockId, "heading", "multi")}
              sx={{
                fontFamily: headingFont,
                fontWeight: 800,
                fontSize: { xs: "1.7rem", md: "2.1rem" },
                mb: 3,
                color: ink,
              }}
            >
              {why.heading ||
                "We’re experience of 24 years in plumbing service"}
            </Typography>
            <Stack spacing={2.5}>
              {whyFeatures.map((feature, index) => {
                const FeatureIcon = resolvePlumbingFeatureIcon(feature, index);
                return (
                  <Stack
                    key={index}
                    direction="row"
                    spacing={1.5}
                    alignItems="flex-start"
                  >
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: "50%",
                        bgcolor: blue,
                        flexShrink: 0,
                        display: "grid",
                        placeItems: "center",
                        color: "#fff",
                        boxShadow: `0 8px 18px ${rgba(blue, 0.35)}`,
                      }}
                    >
                      <FeatureIcon size={20} strokeWidth={2.25} />
                    </Box>
                    <Box>
                      <Typography
                        {...getEditableTextProps(
                          why.blockId,
                          `features.${index}.title`,
                          "single",
                        )}
                        sx={{ fontWeight: 800, mb: 0.5 }}
                      >
                        {feature.title}
                      </Typography>
                      <Typography
                        {...getEditableTextProps(
                          why.blockId,
                          `features.${index}.description`,
                          "multi",
                        )}
                        sx={{ color: inkSoft, lineHeight: 1.6 }}
                      >
                        {feature.description}
                      </Typography>
                    </Box>
                  </Stack>
                );
              })}
            </Stack>
          </Box>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>

      <TemplateSectionBoundary
        blockId={features.blockId}
        label="Service cards"
        sectionKey="features"
        content={features}
        sx={{ bgcolor: softGray, py: { xs: 6, md: 9 } }}
      >
        <TemplateInnerContainer>
          <Box sx={{ mb: { xs: 3.5, md: 4.5 } }}>
            <Typography
              {...getEditableTextProps(features.blockId, "eyebrow", "single")}
              sx={{ ...eyebrowSx(blue, bodyFont), mb: 1.5 }}
            >
              {features.eyebrow || "— SERVICES"}
            </Typography>

            <Typography
              component="h2"
              {...getEditableTextProps(features.blockId, "heading", "multi")}
              sx={{
                fontFamily: headingFont,
                fontWeight: 800,
                fontSize: { xs: "1.7rem", md: "2.2rem" },
                color: ink,
                letterSpacing: "-0.035em",
                lineHeight: 1.08,
                maxWidth: 720,
              }}
            >
              {features.heading || "We are expert in all plumber solution"}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
                md: "repeat(3, minmax(0, 1fr))",
              },
              gap: { xs: 2.4, md: 3 },
              alignItems: "stretch",
            }}
          >
            {serviceCards.map((card, index) => (
              <Box
                key={index}
                {...containerProps(
                  features.blockId,
                  `features.features.${index}`,
                  card.title || "Service",
                  "card",
                )}
                sx={{
                  height: "100%",
                  bgcolor: "#fff",
                  borderRadius: "28px",
                  overflow: "hidden",
                  border: "1px solid rgba(15,23,42,0.07)",
                  boxShadow: "0 18px 50px rgba(15,23,42,0.08)",
                  display: "flex",
                  flexDirection: "column",
                  p: 1.1,
                  transition:
                    "transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    borderColor: "rgba(15,23,42,0.12)",
                    boxShadow: "0 28px 70px rgba(15,23,42,0.14)",
                  },
                  "&:hover .service-card-media": {
                    transform: "scale(1.045)",
                  },
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    height: { xs: 210, md: 230 },
                    borderRadius: "22px",
                    overflow: "hidden",
                    bgcolor: "rgba(15,23,42,0.04)",
                    flexShrink: 0,
                  }}
                >
                  {renderEditableMedia({
                    blockId: features.blockId,
                    field: `features.${index}.image`,
                    label: "Service image",
                    src: card.image || plumbingProAssets.service1,
                    alt: card.title || "Service",
                    sx: {
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "center",
                      display: "block",
                      transition: "transform 360ms ease",
                    },
                  })}

                  <Box
                    className="service-card-media"
                    aria-hidden
                    sx={{
                      position: "absolute",
                      inset: 0,
                      pointerEvents: "none",
                      transition: "transform 360ms ease",
                      background:
                        "linear-gradient(180deg, rgba(15,23,42,0) 42%, rgba(15,23,42,0.2) 100%)",
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
                      color: ink,
                      display: "grid",
                      placeItems: "center",
                      fontFamily: headingFont,
                      fontWeight: 900,
                      fontSize: "0.84rem",
                      boxShadow: "0 12px 28px rgba(15,23,42,0.16)",
                    }}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </Box>
                </Box>

                <Box
                  sx={{
                    p: { xs: 2.1, md: 2.3 },
                    display: "flex",
                    flexDirection: "column",
                    flexGrow: 1,
                  }}
                >
                  <Typography
                    {...getEditableTextProps(
                      features.blockId,
                      `features.${index}.title`,
                      "single",
                    )}
                    sx={{
                      fontFamily: headingFont,
                      fontWeight: 850,
                      mb: 1,
                      color: ink,
                      fontSize: { xs: "1.05rem", md: "1.15rem" },
                      lineHeight: 1.2,
                      letterSpacing: "-0.025em",
                    }}
                  >
                    {card.title}
                  </Typography>

                  <Typography
                    {...getEditableTextProps(
                      features.blockId,
                      `features.${index}.description`,
                      "multi",
                    )}
                    sx={{
                      color: inkSoft,
                      fontSize: "0.92rem",
                      lineHeight: 1.65,
                    }}
                  >
                    {card.description}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>

      <TemplateSectionBoundary
        blockId={cta.blockId}
        label="Services CTA"
        sectionKey="cta"
        content={cta}
        sx={{ bgcolor: navy, color: "#fff" }}
      >
        <TemplateInnerContainer
          sx={{
            py: { xs: 4, md: 5 },
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 3,
            justifyContent: "space-between",
            alignItems: { md: "center" },
          }}
        >
          <Typography
            {...getEditableTextProps(cta.blockId, "heading", "multi")}
            sx={{
              fontFamily: headingFont,
              fontWeight: 800,
              fontSize: { xs: "1.5rem", md: "2rem" },
              maxWidth: 480,
            }}
          >
            {cta.heading || "Looking for a reliable plumbing service?"}
          </Typography>
          <Button
            href={resolveLink(
              cta.ctaLink || `tel:${cta.phone || "+13945984958"}`,
              siteSlug,
            )}
            startIcon={<Phone size={18} />}
            {...getEditableTextProps(cta.blockId, "ctaText", "single")}
            sx={{
              bgcolor: yellow,
              color: navy,
              borderRadius: 999,
              px: 3,
              py: 1.4,
              fontWeight: 800,
              textTransform: "none",
              "&:hover": { bgcolor: yellow, opacity: 0.92 },
            }}
          >
            {cta.ctaText || cta.phone || "BOOK A FREE VISITING"}
          </Button>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>
    </>
  );
};

export default ServicesPage;
