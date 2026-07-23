import React from "react";
import { Box, Typography } from "@mui/material";
import { Quote } from "lucide-react";
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
  revealProps,
  type GardeningProTheme,
} from "../gardeningProShared";

type AboutPageProps = {
  theme: GardeningProTheme;
  about: Record<string, any>;
};

const AboutPage: React.FC<AboutPageProps> = ({ theme, about }) => {
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

  const banner = asRecord(about.banner);
  const vision = asRecord(about.vision);
  const stats = asRecord(about.stats);
  const founder = asRecord(about.founder);
  const values = asRecord(about.values);
  const members = asRecord(about.members);

  const statsItems = asArray(stats.items, [
    { value: "850+", heading: "Projects completed" },
    { value: "40+", heading: "Team members" },
    { value: "12", heading: "Years of craft" },
    { value: "6", heading: "Regions served" },
  ]);

  const visionItems = asArray(vision.items, [
    { image: gardeningProAssets.vision1, title: "Quiet structure" },
    { image: gardeningProAssets.vision2, title: "Seasonal colour" },
    { image: gardeningProAssets.vision3, title: "Lived-in outdoor rooms" },
  ]);

  const teamItems = asArray(members.members, [
    {
      name: "Elena Marsh",
      role: "Lead Landscape Designer",
      photo: gardeningProAssets.member1,
    },
    {
      name: "James Whitfield",
      role: "Horticulture Director",
      photo: gardeningProAssets.member2,
    },
    {
      name: "Sofia Reyes",
      role: "Hardscape Specialist",
      photo: gardeningProAssets.member3,
    },
  ]);

  return (
    <>
      {/* ── About hero banner ── */}
      <TemplateSectionBoundary
        blockId={banner.blockId}
        label="About banner"
        sectionKey="about-hero"
        content={banner}
        sx={{
          position: "relative",
          py: { xs: 10, md: 14 },
          color: "#fff",
          overflow: "hidden",
          backgroundImage: `url(${banner.image || gardeningProAssets.aboutHero})`,
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
            background: `linear-gradient(115deg, ${rgba(forestDeep, 0.88)} 0%, ${rgba(forest, 0.72)} 55%, ${rgba(forestDeep, 0.55)} 100%)`,
          }}
        />
        <TemplateInnerContainer sx={{ position: "relative" }}>
          <MotionBox {...revealProps()}>
            <Typography
              {...getEditableTextProps(banner.blockId, "eyebrow", "single")}
              sx={{ ...eyebrowSx(lime, bodyFont), color: lime }}
            >
              {banner.eyebrow || "About Greenth"}
            </Typography>
            <AccentHeading
              blockId={banner.blockId}
              heading={banner.heading}
              accent={banner.headingAccent}
              fallbackHeading="A studio rooted in"
              fallbackAccent="the land"
              headingFont={headingFont}
              accentColor={lime}
              component="h1"
              sx={{
                mt: 2,
                fontSize: { xs: "2.6rem", md: "3.8rem" },
                color: "#fff",
                maxWidth: 640,
              }}
            />
            <Typography sx={{ mt: 1.5, color: rgba("#ffffff", 0.6), fontSize: "0.9rem" }}>
              Home /{" "}
              <Box component="span" sx={{ color: lime, fontWeight: 600 }}>
                About
              </Box>
            </Typography>
          </MotionBox>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>

      {/* ── Vision + 3 images ── */}
      <TemplateSectionBoundary
        blockId={vision.blockId}
        label="Our vision"
        sectionKey="about-vision"
        content={vision}
        sx={{ bgcolor: cream, py: { xs: 8, md: 12 } }}
      >
        <TemplateInnerContainer>
          <MotionBox
            {...revealProps()}
            {...containerProps(vision.blockId, "vision.layout", "Vision layout")}
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1.1fr" },
              gap: { xs: 5, md: 7 },
              alignItems: "center",
            }}
          >
            <Box>
              <Typography
                {...getEditableTextProps(vision.blockId, "eyebrow", "single")}
                sx={eyebrowSx(forest, bodyFont)}
              >
                {vision.eyebrow || "Our vision"}
              </Typography>
              <AccentHeading
                blockId={vision.blockId}
                heading={vision.heading}
                accent={vision.headingAccent}
                fallbackHeading="Gardens that belong to"
                fallbackAccent="their place"
                headingFont={headingFont}
                accentColor={forest}
                sx={{
                  mt: 1.5,
                  fontSize: { xs: "2.1rem", md: "2.8rem" },
                  color: ink,
                }}
              />
              <Typography
                {...getEditableTextProps(vision.blockId, "body", "multi")}
                sx={{
                  mt: 2.5,
                  color: inkSoft,
                  fontSize: "1.02rem",
                  lineHeight: 1.8,
                  maxWidth: 460,
                }}
              >
                {vision.body ||
                  "We believe a great garden never shouts. It settles into the soil, frames the light, and becomes the quiet backdrop for every season of living outdoors."}
              </Typography>
            </Box>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1.2fr 1fr",
                gridTemplateRows: "1fr 1fr",
                gap: 1.5,
                minHeight: { xs: 360, md: 480 },
              }}
            >
              {visionItems.slice(0, 3).map((item: Record<string, any>, index: number) =>
                renderEditableMedia({
                  blockId: vision.blockId,
                  field: `items.${index}.image`,
                  label: `Vision image ${index + 1}`,
                  src:
                    item.image ||
                    (index === 0
                      ? gardeningProAssets.vision1
                      : index === 1
                        ? gardeningProAssets.vision2
                        : gardeningProAssets.vision3),
                  alt: item.title || item.caption || `Vision ${index + 1}`,
                  sx: {
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    gridRow: index === 0 ? "1 / 3" : undefined,
                    display: "block",
                    minHeight: index === 0 ? 360 : 170,
                  },
                }),
              )}
            </Box>
          </MotionBox>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>

      {/* ── Stats strip ── */}
      <TemplateSectionBoundary
        blockId={stats.blockId}
        label="About stats"
        sectionKey="about-stats"
        content={stats}
        sx={{ bgcolor: forestDeep, py: { xs: 5, md: 6 } }}
      >
        <TemplateInnerContainer>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr 1fr",
                md: `repeat(${Math.min(statsItems.length, 4)}, 1fr)`,
              },
              gap: 3,
            }}
          >
            {statsItems.map((item: Record<string, any>, index: number) => (
              <MotionBox
                key={index}
                {...revealProps(index * 0.07)}
                sx={{ textAlign: "center", color: "#fff" }}
              >
                <Typography
                  {...getEditableTextProps(stats.blockId, `items.${index}.value`, "single")}
                  sx={{
                    fontFamily: headingFont,
                    fontSize: { xs: "2rem", md: "2.6rem" },
                    color: lime,
                    fontWeight: 500,
                    lineHeight: 1,
                  }}
                >
                  {item.value}
                </Typography>
                <Typography
                  {...getEditableTextProps(
                    stats.blockId,
                    `items.${index}.heading`,
                    "single",
                  )}
                  sx={{
                    mt: 1,
                    fontSize: "0.82rem",
                    color: rgba("#ffffff", 0.6),
                    letterSpacing: "0.03em",
                  }}
                >
                  {item.heading}
                </Typography>
              </MotionBox>
            ))}
          </Box>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>

      {/* ── Founder letter ── */}
      <TemplateSectionBoundary
        blockId={founder.blockId}
        label="Founder letter"
        sectionKey="about-founder"
        content={founder}
        sx={{ bgcolor: creamSoft, py: { xs: 8, md: 12 } }}
      >
        <TemplateInnerContainer>
          <MotionBox
            {...revealProps()}
            {...containerProps(founder.blockId, "founder.layout", "Founder layout")}
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "0.85fr 1.15fr" },
              gap: { xs: 5, md: 7 },
              alignItems: "center",
            }}
          >
            <Box
              {...containerProps(
                founder.blockId,
                "founder.portrait",
                "Founder portrait",
                "card",
              )}
            >
              {renderEditableMedia({
                blockId: founder.blockId,
                field: "image",
                label: "Founder portrait",
                src: founder.image || gardeningProAssets.founder,
                alt: founder.name || "Founder",
                style: founder.imageStyle,
                sx: {
                  width: "100%",
                  aspectRatio: "4 / 5",
                  objectFit: "cover",
                  display: "block",
                },
              })}
            </Box>
            <Box>
              <Typography
                {...getEditableTextProps(founder.blockId, "eyebrow", "single")}
                sx={eyebrowSx(forest, bodyFont)}
              >
                {founder.eyebrow || "A letter from our founder"}
              </Typography>
              <AccentHeading
                blockId={founder.blockId}
                heading={founder.heading}
                accent={founder.headingAccent}
                fallbackHeading="We still start with"
                fallbackAccent="a walk"
                headingFont={headingFont}
                accentColor={forest}
                sx={{
                  mt: 1.5,
                  fontSize: { xs: "2rem", md: "2.6rem" },
                  color: ink,
                }}
              />
              <Box sx={{ mt: 2.5, color: lime }}>
                <Quote size={28} />
              </Box>
              <Typography
                {...getEditableTextProps(founder.blockId, "body", "multi")}
                sx={{
                  mt: 1.5,
                  color: inkSoft,
                  fontSize: "1.05rem",
                  lineHeight: 1.85,
                  fontFamily: headingFont,
                  fontStyle: "italic",
                  maxWidth: 520,
                }}
              >
                {founder.body ||
                  "Every Greenth garden begins the same way — boots on soil, notebook in hand. We listen to the wind, the slope, the way morning light finds a wall. Design is what follows when the land has already spoken."}
              </Typography>
              <Box sx={{ mt: 3.5 }}>
                <Typography
                  {...getEditableTextProps(founder.blockId, "name", "single")}
                  sx={{
                    fontFamily: headingFont,
                    fontWeight: 600,
                    fontSize: "1.15rem",
                    color: ink,
                  }}
                >
                  {founder.name || "Margaret Hale"}
                </Typography>
                <Typography
                  {...getEditableTextProps(founder.blockId, "role", "single")}
                  sx={{ mt: 0.3, fontSize: "0.85rem", color: inkSoft }}
                >
                  {founder.role || "Founder & Creative Director"}
                </Typography>
              </Box>
            </Box>
          </MotionBox>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>

      {/* ── Values banner ── */}
      <TemplateSectionBoundary
        blockId={values.blockId}
        label="Values banner"
        sectionKey="about-values"
        content={values}
        sx={{
          position: "relative",
          py: { xs: 10, md: 13 },
          color: "#fff",
          overflow: "hidden",
          backgroundImage: `url(${values.image || gardeningProAssets.valuesGate})`,
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
            bgcolor: rgba(forestDeep, 0.72),
          }}
        />
        <TemplateInnerContainer sx={{ position: "relative" }}>
          <MotionBox {...revealProps()} sx={{ maxWidth: 620, mx: "auto", textAlign: "center" }}>
            <AccentHeading
              blockId={values.blockId}
              heading={values.heading}
              accent={values.headingAccent}
              fallbackHeading="Craft. Patience."
              fallbackAccent="Belonging."
              headingFont={headingFont}
              accentColor={lime}
              sx={{
                fontSize: { xs: "2.3rem", md: "3.2rem" },
                color: "#fff",
              }}
            />
            <Typography
              {...getEditableTextProps(values.blockId, "body", "multi")}
              sx={{
                mt: 2.5,
                color: rgba("#ffffff", 0.75),
                fontSize: "1.05rem",
                lineHeight: 1.75,
              }}
            >
              {values.body ||
                "These are the values we plant into every project — quiet enough to notice, strong enough to last."}
            </Typography>
          </MotionBox>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>

      {/* ── Team members ── */}
      <TemplateSectionBoundary
        blockId={members.blockId}
        label="Team members"
        sectionKey="about-members"
        content={members}
        sx={{ bgcolor: cream, py: { xs: 8, md: 12 } }}
      >
        <TemplateInnerContainer>
          <MotionBox {...revealProps()} sx={{ textAlign: "center", mb: { xs: 5, md: 7 } }}>
            <Typography
              {...getEditableTextProps(members.blockId, "eyebrow", "single")}
              sx={{ ...eyebrowSx(forest, bodyFont), justifyContent: "center" }}
            >
              {members.eyebrow || "The people behind the planting"}
            </Typography>
            <AccentHeading
              blockId={members.blockId}
              heading={members.heading}
              accent={members.headingAccent}
              fallbackHeading="Meet the"
              fallbackAccent="studio"
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
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
              gap: 3,
            }}
          >
            {teamItems.map((item: Record<string, any>, index: number) => (
              <MotionBox
                key={index}
                {...revealProps(index * 0.08)}
                whileHover={liftHover}
                {...containerProps(
                  members.blockId,
                  `members.item-${index}`,
                  `Team member ${index + 1}`,
                  "card",
                )}
                sx={{ bgcolor: creamSoft, overflow: "hidden" }}
              >
                {renderEditableMedia({
                  blockId: members.blockId,
                  field: `members.${index}.photo`,
                  label: `Member ${index + 1}`,
                  src: item.photo || item.image,
                  alt: item.name || item.title || `Member ${index + 1}`,
                  sx: {
                    width: "100%",
                    aspectRatio: "4 / 5",
                    objectFit: "cover",
                    display: "block",
                  },
                })}
                <Box sx={{ p: 2.8 }}>
                  <Typography
                    {...getEditableTextProps(
                      members.blockId,
                      `members.${index}.name`,
                      "single",
                    )}
                    sx={{
                      fontFamily: headingFont,
                      fontSize: "1.25rem",
                      color: ink,
                      fontWeight: 500,
                    }}
                  >
                    {item.name || item.title}
                  </Typography>
                  <Typography
                    {...getEditableTextProps(
                      members.blockId,
                      `members.${index}.role`,
                      "single",
                    )}
                    sx={{ mt: 0.5, fontSize: "0.88rem", color: inkSoft }}
                  >
                    {item.role || item.description}
                  </Typography>
                </Box>
              </MotionBox>
            ))}
          </Box>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>
    </>
  );
};

export default AboutPage;
