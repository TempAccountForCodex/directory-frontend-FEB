import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { ArrowRight } from "lucide-react";
import {
  TemplateInnerContainer,
  TemplateSectionBoundary,
} from "../../../components/TemplateSectionLayout";
import { getEditableTextProps } from "../../../utils/editableProps";
import { renderEditableMedia } from "../../../utils/editableComponents";
import { gardeningProAssets } from "../../../assets/gardening/gardening-pro";
import { rgba } from "../../company/theme";
import {
  AccentHeading,
  asArray,
  asRecord,
  containerProps,
  eyebrowSx,
  liftHover,
  MotionBox,
  resolveLink,
  revealProps,
  type GardeningProTheme,
} from "../gardeningProShared";

type ServicesPageProps = {
  theme: GardeningProTheme;
  services: Record<string, any>;
  siteSlug?: string;
};

const ServicesPage: React.FC<ServicesPageProps> = ({
  theme,
  services,
  siteSlug,
}) => {
  const {
    forest,
    forestDeep,
    cream,
    creamSoft,
    lime,
    ink,
    inkSoft,
    headingFont,
    bodyFont,
  } = theme;

  const intro = asRecord(services.intro);
  const features = asRecord(services.features);
  const cta = asRecord(services.cta);

  const serviceCards = asArray(features.features || features.items, [
    {
      title: "Garden Design",
      description:
        "Concept-to-planting plans that balance structure, bloom, and the way you move through the space.",
      image: gardeningProAssets.serviceSoil,
    },
    {
      title: "Landscape Lighting",
      description:
        "Subtle evening light that reveals form, path, and canopy without overpowering the night.",
      image: gardeningProAssets.serviceLighting,
    },
    {
      title: "Ongoing Maintenance",
      description:
        "Seasonal care programs — pruning, soil health, and lawn work that protect your investment.",
      image: gardeningProAssets.serviceMaintenance,
    },
    {
      title: "Hardscape Construction",
      description:
        "Terraces, paths, and outdoor rooms built in stone and timber to feel inevitable on site.",
      image: gardeningProAssets.serviceHardscape,
    },
    {
      title: "Tree Care",
      description:
        "Specimen selection, planting, and long-term canopy care for shade and structure.",
      image: gardeningProAssets.serviceTree,
    },
    {
      title: "Planting & Borders",
      description:
        "Layered perennial and shrub compositions that evolve gracefully through every season.",
      image: gardeningProAssets.servicePlanting,
    },
  ]);

  return (
    <>
      {/* ── Services intro ── */}
      <TemplateSectionBoundary
        blockId={intro.blockId}
        label="Services intro"
        sectionKey="services-intro"
        content={intro}
        sx={{ bgcolor: cream, pt: { xs: 10, md: 14 }, pb: { xs: 5, md: 6 } }}
      >
        <TemplateInnerContainer>
          <MotionBox {...revealProps()} sx={{ maxWidth: 720 }}>
            <Typography
              {...getEditableTextProps(intro.blockId, "eyebrow", "single")}
              sx={eyebrowSx(forest, bodyFont)}
            >
              {intro.eyebrow || "What we cultivate"}
            </Typography>
            <AccentHeading
              blockId={intro.blockId}
              heading={intro.heading}
              accent={intro.headingAccent}
              fallbackHeading="Services shaped for"
              fallbackAccent="living landscapes"
              headingFont={headingFont}
              accentColor={forest}
              component="h1"
              sx={{
                mt: 2,
                fontSize: { xs: "2.5rem", md: "3.6rem" },
                color: ink,
              }}
            />
            <Typography
              {...getEditableTextProps(intro.blockId, "body", "multi")}
              sx={{
                mt: 2.5,
                color: inkSoft,
                fontSize: "1.05rem",
                lineHeight: 1.8,
                maxWidth: 540,
              }}
            >
              {intro.body ||
                "Whether you need a full redesign or quiet seasonal care, every Greenth service is delivered by the same studio that designed your garden."}
            </Typography>
            <Typography sx={{ mt: 2, color: rgba(forest, 0.5), fontSize: "0.88rem" }}>
              Home /{" "}
              <Box component="span" sx={{ color: forest, fontWeight: 600 }}>
                Services
              </Box>
            </Typography>
          </MotionBox>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>

      {/* ── 6 service cards ── */}
      <TemplateSectionBoundary
        blockId={features.blockId}
        label="Service cards"
        sectionKey="services-grid"
        content={features}
        sx={{ bgcolor: creamSoft, py: { xs: 6, md: 10 } }}
      >
        <TemplateInnerContainer>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                lg: "repeat(3, 1fr)",
              },
              gap: 2.5,
            }}
          >
            {serviceCards.map((item: Record<string, any>, index: number) => (
              <MotionBox
                key={index}
                {...revealProps((index % 3) * 0.08)}
                whileHover={liftHover}
                {...containerProps(
                  features.blockId,
                  `services.card-${index}`,
                  `Service card ${index + 1}`,
                  "card",
                )}
                sx={{
                  bgcolor: "#fff",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  border: `1px solid ${rgba(forest, 0.08)}`,
                }}
              >
                {renderEditableMedia({
                  blockId: features.blockId,
                  field: `features.${index}.image`,
                  label: `Service image ${index + 1}`,
                  src: item.image,
                  alt: item.title,
                  sx: {
                    width: "100%",
                    height: 210,
                    objectFit: "cover",
                    display: "block",
                  },
                })}
                <Box sx={{ p: 3, flex: 1, display: "flex", flexDirection: "column" }}>
                  <Typography
                    sx={{
                      fontFamily: headingFont,
                      fontStyle: "italic",
                      color: lime,
                      fontSize: "0.95rem",
                      mb: 1,
                    }}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </Typography>
                  <Typography
                    {...getEditableTextProps(
                      features.blockId,
                      `features.${index}.title`,
                      "single",
                    )}
                    sx={{
                      fontFamily: headingFont,
                      fontSize: "1.3rem",
                      color: ink,
                      fontWeight: 500,
                      lineHeight: 1.3,
                    }}
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    {...getEditableTextProps(
                      features.blockId,
                      `features.${index}.description`,
                      "multi",
                    )}
                    sx={{
                      mt: 1.2,
                      color: inkSoft,
                      fontSize: "0.9rem",
                      lineHeight: 1.7,
                      flex: 1,
                    }}
                  >
                    {item.description}
                  </Typography>
                </Box>
              </MotionBox>
            ))}
          </Box>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>

      {/* ── Mid CTA banner ── */}
      <TemplateSectionBoundary
        blockId={cta.blockId}
        label="Services CTA"
        sectionKey="services-cta"
        content={cta}
        sx={{
          position: "relative",
          py: { xs: 9, md: 12 },
          color: "#fff",
          overflow: "hidden",
          backgroundImage: `url(${cta.image || gardeningProAssets.servicesCta})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(100deg, ${rgba(forestDeep, 0.9)} 0%, ${rgba(forest, 0.65)} 100%)`,
          }}
        />
        <TemplateInnerContainer sx={{ position: "relative" }}>
          <MotionBox
            {...revealProps()}
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1.2fr auto" },
              gap: 3,
              alignItems: "center",
            }}
          >
            <Box>
              <AccentHeading
                blockId={cta.blockId}
                heading={cta.heading}
                accent={cta.headingAccent}
                fallbackHeading="Not sure where to"
                fallbackAccent="begin?"
                headingFont={headingFont}
                accentColor={lime}
                sx={{
                  fontSize: { xs: "2.1rem", md: "2.8rem" },
                  color: "#fff",
                }}
              />
              <Typography
                {...getEditableTextProps(cta.blockId, "body", "multi")}
                sx={{
                  mt: 1.5,
                  color: rgba("#ffffff", 0.72),
                  fontSize: "1rem",
                  lineHeight: 1.7,
                  maxWidth: 480,
                }}
              >
                {cta.body ||
                  "Book a complimentary site walk. We'll map the opportunities in your light, soil, and outdoor rooms."}
              </Typography>
            </Box>
            <Button
              href={resolveLink(cta.ctaLink || "/contact", siteSlug)}
              {...getEditableTextProps(cta.blockId, "ctaText", "single")}
              endIcon={<ArrowRight size={16} />}
              sx={{
                bgcolor: lime,
                color: forestDeep,
                borderRadius: 0,
                px: 3.5,
                py: 1.5,
                fontWeight: 700,
                textTransform: "none",
                whiteSpace: "nowrap",
                justifySelf: { md: "end" },
                "&:hover": { bgcolor: lime, opacity: 0.9 },
              }}
            >
              {cta.ctaText || "Request a Visit"}
            </Button>
          </MotionBox>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>
    </>
  );
};

export default ServicesPage;
