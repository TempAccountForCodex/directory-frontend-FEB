import React from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import { ArrowRight, Check, Leaf } from "lucide-react";
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

type HomePageProps = {
  theme: GardeningProTheme;
  home: Record<string, any>;
  content: Record<string, any>;
};

const HomePage: React.FC<HomePageProps> = ({ theme, home, content }) => {
  const siteSlug =
    typeof content.__siteSlug === "string" ? content.__siteSlug : undefined;
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

  const hero = asRecord(home.hero || content.hero);
  const trust = asRecord(home.trust || content.trust);
  const intro = asRecord(home.intro || content.intro);
  const stats = asRecord(home.stats || content.stats);
  const servicesList = asRecord(home.servicesList || content.servicesList);
  const projects = asRecord(home.projects || content.projects);
  const success = asRecord(home.success || content.success);
  const features = asRecord(home.features || content.features);
  const cta = asRecord(home.cta || content.cta);

  const trustItems = asArray(trust.features || trust.items, [
    { title: "Garden & Co" },
    { title: "Verdant Homes" },
    { title: "Estate Living" },
    { title: "Bloom Studio" },
    { title: "Root & Branch" },
  ]);

  const statsItems = asArray(stats.items, [
    { value: "850+", heading: "Gardens Designed" },
    { value: "12yr", heading: "Craft Experience" },
    { value: "98%", heading: "Client Retention" },
    { value: "40+", heading: "Landscape Artists" },
  ]);

  const serviceItems = asArray(servicesList.features || servicesList.items, [
    {
      title: "Garden Design",
      description:
        "Bespoke outdoor compositions shaped around light, soil, and the way you live.",
      image: gardeningProAssets.serviceList1,
    },
    {
      title: "Seasonal Care",
      description:
        "Year-round maintenance that keeps every bed, lawn, and border quietly thriving.",
      image: gardeningProAssets.serviceList2,
    },
    {
      title: "Hardscape Build",
      description:
        "Stone paths, terraces, and outdoor rooms built to feel inevitable and lasting.",
      image: gardeningProAssets.serviceList3,
    },
    {
      title: "Tree & Planting",
      description:
        "Specimen trees and layered planting plans that grow more beautiful each season.",
      image: gardeningProAssets.serviceList4,
    },
  ]);

  const projectItems = asArray(projects.features || projects.items, [
    {
      title: "Hedgerow Estate",
      description: "Formal hedges · Private residence",
      image: gardeningProAssets.projectHedge,
    },
    {
      title: "Courtyard House",
      description: "Stone & softscape · Urban retreat",
      image: gardeningProAssets.projectHouse,
    },
    {
      title: "Sunset Terrace",
      description: "Evening garden · Entertaining",
      image: gardeningProAssets.projectSunset,
    },
  ]);

  const featureItems = asArray(features.features || features.items, [
    { title: "Site-first planting plans rooted in soil science" },
    { title: "Quiet craftsmanship with lasting hardscape detail" },
    { title: "Seasonal care programs that protect your investment" },
    { title: "Transparent timelines from concept to first bloom" },
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
          position: "relative",
          minHeight: { xs: "88vh", md: "92vh" },
          display: "flex",
          alignItems: "flex-end",
          color: "#fff",
          overflow: "hidden",
          backgroundImage: `url(${hero.image || gardeningProAssets.heroEstate})`,
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
            background: `linear-gradient(180deg, ${rgba(forestDeep, 0.25)} 0%, ${rgba(forestDeep, 0.55)} 45%, ${rgba(forestDeep, 0.88)} 100%)`,
          }}
        />
        <TemplateInnerContainer sx={{ position: "relative", pb: { xs: 7, md: 10 }, pt: { xs: 16, md: 20 } }}>
          <MotionBox
            {...revealProps()}
            {...containerProps(hero.blockId, "hero.layout", "Hero layout")}
            sx={{ maxWidth: 720 }}
          >
            <Typography
              {...getEditableTextProps(hero.blockId, "eyebrow", "single", "eyebrowStyle")}
              sx={{ ...eyebrowSx(lime, bodyFont), color: lime }}
            >
              <Leaf size={14} />
              {hero.eyebrow || "Landscape studio · Est. 2012"}
            </Typography>
            <AccentHeading
              blockId={hero.blockId}
              heading={hero.heading}
              accent={hero.headingAccent}
              fallbackHeading="Gardens shaped with"
              fallbackAccent="quiet intention"
              headingFont={headingFont}
              accentColor={lime}
              component="h1"
              sx={{
                mt: 2.5,
                fontSize: { xs: "2.8rem", sm: "3.6rem", md: "4.6rem" },
                color: "#fff",
                maxWidth: 680,
                ...(hero.headingStyle || {}),
              }}
            />
            <Typography
              {...getEditableTextProps(hero.blockId, "subheading", "multi")}
              sx={{
                mt: 2.5,
                color: rgba("#ffffff", 0.78),
                fontSize: { xs: "1rem", md: "1.1rem" },
                lineHeight: 1.75,
                maxWidth: 480,
                fontFamily: bodyFont,
                ...(hero.subheadingStyle || {}),
              }}
            >
              {hero.subheading ||
                "We design and care for outdoor spaces that feel settled from day one — layered planting, honest materials, and seasons that unfold beautifully."}
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.8} sx={{ mt: 4 }}>
              <Button
                href={resolveLink(hero.ctaLink || "/contact", siteSlug)}
                {...getEditableTextProps(hero.blockId, "ctaText", "single", "ctaTextStyle")}
                endIcon={<ArrowRight size={16} />}
                sx={{
                  bgcolor: lime,
                  color: forestDeep,
                  borderRadius: 0,
                  px: 3.5,
                  py: 1.45,
                  fontWeight: 700,
                  textTransform: "none",
                  fontFamily: bodyFont,
                  fontSize: "0.92rem",
                  "&:hover": { bgcolor: lime, opacity: 0.92 },
                }}
              >
                {hero.ctaText || "Plan Your Garden"}
              </Button>
              <Button
                href={resolveLink(hero.secondaryCtaLink || "/services", siteSlug)}
                {...getEditableTextProps(hero.blockId, "secondaryCtaText", "single")}
                sx={{
                  color: "#fff",
                  borderRadius: 0,
                  px: 3,
                  py: 1.45,
                  fontWeight: 600,
                  textTransform: "none",
                  fontFamily: bodyFont,
                  borderBottom: `1px solid ${rgba("#ffffff", 0.45)}`,
                  "&:hover": { bgcolor: "transparent", borderColor: lime, color: lime },
                }}
              >
                {hero.secondaryCtaText || "Explore Services"}
              </Button>
            </Stack>
          </MotionBox>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>

      {/* ── Trust bar ── */}
      <TemplateSectionBoundary
        blockId={trust.blockId}
        label="Trusted by"
        sectionKey="trust"
        content={trust}
        id="trust"
        sx={{ bgcolor: creamSoft, py: { xs: 3.5, md: 4 }, borderBottom: `1px solid ${rgba(forest, 0.08)}` }}
      >
        <TemplateInnerContainer>
          <MotionBox
            {...revealProps()}
            sx={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "center",
              gap: { xs: 3, md: 5 },
            }}
          >
            <Typography
              {...getEditableTextProps(trust.blockId, "eyebrow", "single")}
              sx={{ ...eyebrowSx(rgba(forest, 0.55), bodyFont), mr: { md: 2 } }}
            >
              {trust.eyebrow || "Trusted by estates & studios"}
            </Typography>
            {trustItems.map((item: Record<string, any>, index: number) => (
              <Typography
                key={index}
                {...getEditableTextProps(trust.blockId, `features.${index}.title`, "single")}
                sx={{
                  fontFamily: headingFont,
                  fontStyle: "italic",
                  fontSize: { xs: "1.05rem", md: "1.2rem" },
                  color: rgba(forest, 0.55),
                  fontWeight: 500,
                }}
              >
                {item.title || item.label || item.heading}
              </Typography>
            ))}
            {renderEditableMedia({
              blockId: trust.blockId,
              field: "image",
              label: "Trust avatar",
              src: trust.image || gardeningProAssets.trustAvatar,
              alt: "Client",
              sx: {
                width: 40,
                height: 40,
                borderRadius: "50%",
                objectFit: "cover",
                display: { xs: "none", sm: "block" },
              },
            })}
          </MotionBox>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>

      {/* ── Intro / purpose ── */}
      <TemplateSectionBoundary
        blockId={intro.blockId}
        label="Our purpose"
        sectionKey="intro"
        content={intro}
        id="intro"
        sx={{ bgcolor: cream, py: { xs: 8, md: 12 } }}
      >
        <TemplateInnerContainer>
          <MotionBox
            {...revealProps()}
            {...containerProps(intro.blockId, "intro.layout", "Intro layout")}
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1.05fr 0.95fr" },
              gap: { xs: 5, md: 8 },
              alignItems: "center",
            }}
          >
            <Box>
              <Typography
                {...getEditableTextProps(intro.blockId, "eyebrow", "single")}
                sx={eyebrowSx(forest, bodyFont)}
              >
                {intro.eyebrow || "Why we garden"}
              </Typography>
              <AccentHeading
                blockId={intro.blockId}
                heading={intro.heading}
                accent={intro.headingAccent}
                fallbackHeading="Outdoor rooms that feel"
                fallbackAccent="lived-in"
                headingFont={headingFont}
                accentColor={forest}
                sx={{
                  mt: 2,
                  fontSize: { xs: "2.2rem", md: "3rem" },
                  color: ink,
                  maxWidth: 480,
                }}
                accentSx={{ color: forest, fontStyle: "italic" }}
              />
              <Typography
                {...getEditableTextProps(intro.blockId, "body", "multi")}
                sx={{
                  mt: 2.5,
                  color: inkSoft,
                  fontSize: "1.02rem",
                  lineHeight: 1.8,
                  maxWidth: 460,
                  fontFamily: bodyFont,
                }}
              >
                {intro.body ||
                  "Greenth began as a small crew with shears and a sketchbook. Today we still design the same way — walk the land, listen closely, then compose planting and stone that belong to the place."}
              </Typography>
              <Button
                href={resolveLink(intro.ctaLink || "/about", siteSlug)}
                {...getEditableTextProps(intro.blockId, "ctaText", "single")}
                endIcon={<ArrowRight size={15} />}
                sx={{
                  mt: 3.5,
                  bgcolor: forest,
                  color: cream,
                  borderRadius: 0,
                  px: 3,
                  py: 1.3,
                  fontWeight: 700,
                  textTransform: "none",
                  "&:hover": { bgcolor: forestDeep },
                }}
              >
                {intro.ctaText || "Our Story"}
              </Button>
            </Box>
            <Box
              {...containerProps(intro.blockId, "intro.image", "Intro image", "card")}
              sx={{ position: "relative" }}
            >
              {renderEditableMedia({
                blockId: intro.blockId,
                field: "image",
                label: "Intro image",
                src: intro.image || gardeningProAssets.aboutMower,
                alt: "Gardener at work",
                style: intro.imageStyle,
                sx: {
                  width: "100%",
                  aspectRatio: "4 / 5",
                  objectFit: "cover",
                  display: "block",
                },
              })}
              <Box
                sx={{
                  position: "absolute",
                  left: { xs: 12, md: -24 },
                  bottom: { xs: 12, md: 28 },
                  bgcolor: lime,
                  color: forestDeep,
                  px: 2.4,
                  py: 1.6,
                  maxWidth: 200,
                }}
              >
                <Typography
                  {...getEditableTextProps(intro.blockId, "badgeValue", "single")}
                  sx={{ fontFamily: headingFont, fontWeight: 600, fontSize: "1.6rem", lineHeight: 1 }}
                >
                  {intro.badgeValue || "12+"}
                </Typography>
                <Typography
                  {...getEditableTextProps(intro.blockId, "badgeLabel", "single")}
                  sx={{ mt: 0.4, fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.04em" }}
                >
                  {intro.badgeLabel || "Years cultivating places"}
                </Typography>
              </Box>
            </Box>
          </MotionBox>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>

      {/* ── Stats ── */}
      <TemplateSectionBoundary
        blockId={stats.blockId}
        label="Growing Together"
        sectionKey="stats"
        content={stats}
        id="stats"
        sx={{ bgcolor: forestDeep, color: "#fff", py: { xs: 7, md: 9 } }}
      >
        <TemplateInnerContainer>
          <MotionBox {...revealProps()} sx={{ textAlign: "center", mb: { xs: 5, md: 6 } }}>
            <Typography
              {...getEditableTextProps(stats.blockId, "eyebrow", "single")}
              sx={{ ...eyebrowSx(lime, bodyFont), color: lime }}
            >
              {stats.eyebrow || "Growing Together"}
            </Typography>
            <AccentHeading
              blockId={stats.blockId}
              heading={stats.heading}
              accent={stats.headingAccent}
              fallbackHeading="Numbers that grow"
              fallbackAccent="with care"
              headingFont={headingFont}
              accentColor={lime}
              sx={{
                mt: 1.5,
                fontSize: { xs: "2rem", md: "2.6rem" },
                color: "#fff",
              }}
            />
          </MotionBox>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr 1fr", md: `repeat(${Math.min(statsItems.length, 4)}, 1fr)` },
              gap: { xs: 3, md: 4 },
            }}
          >
            {statsItems.map((item: Record<string, any>, index: number) => (
              <MotionBox
                key={index}
                {...revealProps(index * 0.08)}
                sx={{
                  textAlign: "center",
                  py: 2,
                  borderTop: `1px solid ${rgba("#ffffff", 0.12)}`,
                }}
              >
                <Typography
                  {...getEditableTextProps(stats.blockId, `items.${index}.value`, "single")}
                  sx={{
                    fontFamily: headingFont,
                    fontSize: { xs: "2.4rem", md: "3.2rem" },
                    fontWeight: 500,
                    color: lime,
                    lineHeight: 1,
                  }}
                >
                  {item.value}
                </Typography>
                <Typography
                  {...getEditableTextProps(stats.blockId, `items.${index}.heading`, "single")}
                  sx={{
                    mt: 1.2,
                    fontSize: "0.85rem",
                    color: rgba("#ffffff", 0.65),
                    letterSpacing: "0.04em",
                    fontFamily: bodyFont,
                  }}
                >
                  {item.heading}
                </Typography>
              </MotionBox>
            ))}
          </Box>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>

      {/* ── Dark services list ── */}
      <TemplateSectionBoundary
        blockId={servicesList.blockId}
        label="Services list"
        sectionKey="services-list"
        content={servicesList}
        id="services-list"
        sx={{ bgcolor: forest, color: "#fff", py: { xs: 8, md: 11 } }}
      >
        <TemplateInnerContainer>
          <MotionBox
            {...revealProps()}
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "0.85fr 1.15fr" },
              gap: { xs: 4, md: 7 },
              mb: { xs: 5, md: 7 },
              alignItems: "end",
            }}
          >
            <Box>
              <Typography
                {...getEditableTextProps(servicesList.blockId, "eyebrow", "single")}
                sx={{ ...eyebrowSx(lime, bodyFont), color: lime }}
              >
                {servicesList.eyebrow || "What we offer"}
              </Typography>
              <AccentHeading
                blockId={servicesList.blockId}
                heading={servicesList.heading}
                accent={servicesList.headingAccent}
                fallbackHeading="Craft for every"
                fallbackAccent="season"
                headingFont={headingFont}
                accentColor={lime}
                sx={{
                  mt: 1.5,
                  fontSize: { xs: "2.2rem", md: "3rem" },
                  color: "#fff",
                }}
              />
            </Box>
            <Typography
              {...getEditableTextProps(servicesList.blockId, "body", "multi")}
              sx={{
                color: rgba("#ffffff", 0.62),
                fontSize: "1rem",
                lineHeight: 1.75,
                maxWidth: 420,
                justifySelf: { md: "end" },
              }}
            >
              {servicesList.body ||
                "From first sketch to seasonal pruning, every service is delivered by the same hands that designed your garden."}
            </Typography>
          </MotionBox>

          <Stack spacing={0}>
            {serviceItems.map((item: Record<string, any>, index: number) => (
              <MotionBox
                key={index}
                {...revealProps(index * 0.06)}
                whileHover={liftHover}
                {...containerProps(
                  servicesList.blockId,
                  `services-list.item-${index}`,
                  `Service ${index + 1}`,
                  "card",
                )}
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "72px 1fr auto" },
                  gap: { xs: 2, sm: 3 },
                  alignItems: "center",
                  py: { xs: 2.5, md: 3 },
                  borderTop: `1px solid ${rgba("#ffffff", 0.1)}`,
                  "&:last-of-type": {
                    borderBottom: `1px solid ${rgba("#ffffff", 0.1)}`,
                  },
                }}
              >
                <Typography
                  sx={{
                    fontFamily: headingFont,
                    fontStyle: "italic",
                    color: lime,
                    fontSize: "1.4rem",
                  }}
                >
                  {String(index + 1).padStart(2, "0")}
                </Typography>
                <Box>
                  <Typography
                    {...getEditableTextProps(
                      servicesList.blockId,
                      `features.${index}.title`,
                      "single",
                    )}
                    sx={{
                      fontFamily: headingFont,
                      fontSize: { xs: "1.25rem", md: "1.45rem" },
                      color: "#fff",
                      fontWeight: 500,
                    }}
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    {...getEditableTextProps(
                      servicesList.blockId,
                      `features.${index}.description`,
                      "multi",
                    )}
                    sx={{
                      mt: 0.6,
                      color: rgba("#ffffff", 0.58),
                      fontSize: "0.92rem",
                      lineHeight: 1.65,
                      maxWidth: 480,
                    }}
                  >
                    {item.description}
                  </Typography>
                </Box>
                {renderEditableMedia({
                  blockId: servicesList.blockId,
                  field: `features.${index}.image`,
                  label: `Service image ${index + 1}`,
                  src: item.image,
                  alt: item.title,
                  sx: {
                    width: { xs: "100%", sm: 120 },
                    height: { xs: 160, sm: 88 },
                    objectFit: "cover",
                    display: "block",
                  },
                })}
              </MotionBox>
            ))}
          </Stack>

          <Button
            href={resolveLink(servicesList.ctaLink || "/services", siteSlug)}
            {...getEditableTextProps(servicesList.blockId, "ctaText", "single")}
            endIcon={<ArrowRight size={15} />}
            sx={{
              mt: 5,
              bgcolor: lime,
              color: forestDeep,
              borderRadius: 0,
              px: 3.2,
              py: 1.35,
              fontWeight: 700,
              textTransform: "none",
              "&:hover": { bgcolor: lime, opacity: 0.9 },
            }}
          >
            {servicesList.ctaText || "View All Services"}
          </Button>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>

      {/* ── Featured projects masonry ── */}
      <TemplateSectionBoundary
        blockId={projects.blockId}
        label="Featured projects"
        sectionKey="projects"
        content={projects}
        id="projects"
        sx={{ bgcolor: creamSoft, py: { xs: 8, md: 12 } }}
      >
        <TemplateInnerContainer>
          <MotionBox {...revealProps()} sx={{ mb: { xs: 5, md: 6 }, maxWidth: 560 }}>
            <Typography
              {...getEditableTextProps(projects.blockId, "eyebrow", "single")}
              sx={eyebrowSx(forest, bodyFont)}
            >
              {projects.eyebrow || "Selected work"}
            </Typography>
            <AccentHeading
              blockId={projects.blockId}
              heading={projects.heading}
              accent={projects.headingAccent}
              fallbackHeading="Gardens we have"
              fallbackAccent="grown"
              headingFont={headingFont}
              accentColor={forest}
              sx={{
                mt: 1.5,
                fontSize: { xs: "2.2rem", md: "3rem" },
                color: ink,
              }}
            />
          </MotionBox>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1.15fr 0.85fr" },
              gap: 2,
            }}
          >
            {projectItems.slice(0, 1).map((item: Record<string, any>, index: number) => (
              <MotionBox
                key={index}
                {...revealProps()}
                whileHover={liftHover}
                {...containerProps(
                  projects.blockId,
                  `projects.item-${index}`,
                  `Project ${index + 1}`,
                  "card",
                )}
                sx={{ position: "relative", overflow: "hidden", gridRow: { md: "span 2" } }}
              >
                {renderEditableMedia({
                  blockId: projects.blockId,
                  field: `features.${index}.image`,
                  label: `Project image ${index + 1}`,
                  src: item.image,
                  alt: item.title,
                  sx: {
                    width: "100%",
                    height: { xs: 320, md: "100%" },
                    minHeight: { md: 560 },
                    objectFit: "cover",
                    display: "block",
                  },
                })}
                <Box
                  sx={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    p: 3,
                    background: `linear-gradient(transparent, ${rgba(forestDeep, 0.85)})`,
                    color: "#fff",
                  }}
                >
                  <Typography
                    {...getEditableTextProps(projects.blockId, `features.${index}.title`, "single")}
                    sx={{ fontFamily: headingFont, fontSize: "1.5rem", fontWeight: 500 }}
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    {...getEditableTextProps(
                      projects.blockId,
                      `features.${index}.description`,
                      "single",
                    )}
                    sx={{ mt: 0.5, fontSize: "0.85rem", color: rgba("#ffffff", 0.7) }}
                  >
                    {item.description}
                  </Typography>
                </Box>
              </MotionBox>
            ))}

            <Box sx={{ display: "grid", gap: 2 }}>
              {projectItems.slice(1, 4).map((item: Record<string, any>, i: number) => {
                const index = i + 1;
                return (
                  <MotionBox
                    key={index}
                    {...revealProps(i * 0.08)}
                    whileHover={liftHover}
                    {...containerProps(
                      projects.blockId,
                      `projects.item-${index}`,
                      `Project ${index + 1}`,
                      "card",
                    )}
                    sx={{
                      position: "relative",
                      overflow: "hidden",
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                      bgcolor: cream,
                    }}
                  >
                    {renderEditableMedia({
                      blockId: projects.blockId,
                      field: `features.${index}.image`,
                      label: `Project image ${index + 1}`,
                      src: item.image,
                      alt: item.title,
                      sx: {
                        width: "100%",
                        height: { xs: 200, sm: 180 },
                        objectFit: "cover",
                        display: "block",
                      },
                    })}
                    <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                      <Typography
                        {...getEditableTextProps(
                          projects.blockId,
                          `features.${index}.title`,
                          "single",
                        )}
                        sx={{
                          fontFamily: headingFont,
                          fontSize: "1.2rem",
                          color: ink,
                          fontWeight: 500,
                        }}
                      >
                        {item.title}
                      </Typography>
                      <Typography
                        {...getEditableTextProps(
                          projects.blockId,
                          `features.${index}.description`,
                          "single",
                        )}
                        sx={{ mt: 0.6, fontSize: "0.82rem", color: inkSoft }}
                      >
                        {item.description}
                      </Typography>
                    </Box>
                  </MotionBox>
                );
              })}
            </Box>
          </Box>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>

      {/* ── Success banner ── */}
      <TemplateSectionBoundary
        blockId={success.blockId}
        label="Success banner"
        sectionKey="success"
        content={success}
        id="success"
        sx={{
          position: "relative",
          py: { xs: 10, md: 14 },
          color: "#fff",
          overflow: "hidden",
          backgroundImage: `url(${success.image || gardeningProAssets.promoShears})`,
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
            background: `linear-gradient(105deg, ${rgba(forestDeep, 0.92)} 0%, ${rgba(forestDeep, 0.7)} 55%, ${rgba(forest, 0.45)} 100%)`,
          }}
        />
        <TemplateInnerContainer sx={{ position: "relative" }}>
          <MotionBox {...revealProps()} sx={{ maxWidth: 560 }}>
            <AccentHeading
              blockId={success.blockId}
              heading={success.heading}
              accent={success.headingAccent}
              fallbackHeading="Plant once."
              fallbackAccent="Thrive for years."
              headingFont={headingFont}
              accentColor={lime}
              sx={{
                fontSize: { xs: "2.4rem", md: "3.4rem" },
                color: "#fff",
              }}
            />
            <Typography
              {...getEditableTextProps(success.blockId, "body", "multi")}
              sx={{
                mt: 2.5,
                color: rgba("#ffffff", 0.75),
                fontSize: "1.05rem",
                lineHeight: 1.75,
                maxWidth: 440,
              }}
            >
              {success.body ||
                "Our clients return season after season — not because gardens need fixing, but because great landscapes keep evolving with care."}
            </Typography>
            <Button
              href={resolveLink(success.ctaLink || "/contact", siteSlug)}
              {...getEditableTextProps(success.blockId, "ctaText", "single")}
              endIcon={<ArrowRight size={15} />}
              sx={{
                mt: 4,
                bgcolor: lime,
                color: forestDeep,
                borderRadius: 0,
                px: 3.2,
                py: 1.4,
                fontWeight: 700,
                textTransform: "none",
                "&:hover": { bgcolor: lime, opacity: 0.9 },
              }}
            >
              {success.ctaText || "Start a Conversation"}
            </Button>
          </MotionBox>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>

      {/* ── Features checklist + portrait ── */}
      <TemplateSectionBoundary
        blockId={features.blockId}
        label="Features"
        sectionKey="features"
        content={features}
        id="features"
        sx={{ bgcolor: cream, py: { xs: 8, md: 12 } }}
      >
        <TemplateInnerContainer>
          <MotionBox
            {...revealProps()}
            {...containerProps(features.blockId, "features.layout", "Features layout")}
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 0.9fr" },
              gap: { xs: 5, md: 8 },
              alignItems: "center",
            }}
          >
            <Box>
              <Typography
                {...getEditableTextProps(features.blockId, "eyebrow", "single")}
                sx={eyebrowSx(forest, bodyFont)}
              >
                {features.eyebrow || "The Greenth way"}
              </Typography>
              <AccentHeading
                blockId={features.blockId}
                heading={features.heading}
                accent={features.headingAccent}
                fallbackHeading="Detail that makes a garden"
                fallbackAccent="feel complete"
                headingFont={headingFont}
                accentColor={forest}
                sx={{
                  mt: 1.5,
                  fontSize: { xs: "2.1rem", md: "2.8rem" },
                  color: ink,
                  maxWidth: 460,
                }}
              />
              <Stack spacing={2} sx={{ mt: 4 }}>
                {featureItems.map((item: Record<string, any>, index: number) => (
                  <Box
                    key={index}
                    sx={{ display: "flex", gap: 1.8, alignItems: "flex-start" }}
                  >
                    <Box
                      sx={{
                        mt: 0.3,
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        bgcolor: rgba(lime, 0.45),
                        color: forestDeep,
                        display: "grid",
                        placeItems: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Check size={14} strokeWidth={2.5} />
                    </Box>
                    <Typography
                      {...getEditableTextProps(
                        features.blockId,
                        `features.${index}.title`,
                        "single",
                      )}
                      sx={{
                        fontFamily: headingFont,
                        fontSize: "1.15rem",
                        color: ink,
                        lineHeight: 1.45,
                        fontWeight: 500,
                      }}
                    >
                      {item.title || item.heading}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
            <Box
              {...containerProps(
                features.blockId,
                "features.portrait",
                "Features portrait",
                "card",
              )}
            >
              {renderEditableMedia({
                blockId: features.blockId,
                field: "image",
                label: "Features portrait",
                src: features.image || gardeningProAssets.featuresPortrait,
                alt: "Gardener portrait",
                style: features.imageStyle,
                sx: {
                  width: "100%",
                  aspectRatio: "4 / 5",
                  objectFit: "cover",
                  display: "block",
                },
              })}
            </Box>
          </MotionBox>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>

      {/* ── CTA banner ── */}
      <TemplateSectionBoundary
        blockId={cta.blockId}
        label="CTA banner"
        sectionKey="cta"
        content={cta}
        id="cta"
        sx={{
          position: "relative",
          py: { xs: 9, md: 12 },
          color: "#fff",
          overflow: "hidden",
          backgroundImage: `url(${cta.image || gardeningProAssets.ctaMower})`,
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
            bgcolor: rgba(forestDeep, 0.78),
          }}
        />
        <TemplateInnerContainer sx={{ position: "relative" }}>
          <MotionBox
            {...revealProps()}
            sx={{
              textAlign: "center",
              maxWidth: 640,
              mx: "auto",
            }}
          >
            <AccentHeading
              blockId={cta.blockId}
              heading={cta.heading}
              accent={cta.headingAccent}
              fallbackHeading="Ready to grow something"
              fallbackAccent="remarkable?"
              headingFont={headingFont}
              accentColor={lime}
              sx={{
                fontSize: { xs: "2.2rem", md: "3.2rem" },
                color: "#fff",
              }}
            />
            <Typography
              {...getEditableTextProps(cta.blockId, "body", "multi")}
              sx={{
                mt: 2,
                color: rgba("#ffffff", 0.72),
                fontSize: "1.05rem",
                lineHeight: 1.7,
              }}
            >
              {cta.body ||
                "Tell us about your land, your light, and how you want to live outdoors. We'll bring the rest."}
            </Typography>
            <Button
              href={resolveLink(cta.ctaLink || "/contact", siteSlug)}
              {...getEditableTextProps(cta.blockId, "ctaText", "single")}
              endIcon={<ArrowRight size={16} />}
              sx={{
                mt: 4,
                bgcolor: lime,
                color: forestDeep,
                borderRadius: 0,
                px: 4,
                py: 1.5,
                fontWeight: 700,
                textTransform: "none",
                fontSize: "0.95rem",
                "&:hover": { bgcolor: lime, opacity: 0.9 },
              }}
            >
              {cta.ctaText || "Book a Site Visit"}
            </Button>
          </MotionBox>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>
    </>
  );
};

export default HomePage;
