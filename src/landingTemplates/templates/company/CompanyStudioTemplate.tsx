import React from "react";
import {
  Box,
  Button,
  Chip,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import EastIcon from "@mui/icons-material/East";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import type { TemplateProps } from "../../templateEngine/types";
import {
  getEditableImageProps,
  getEditableSectionProps,
  getEditableTextProps,
} from "../../utils/editableProps";
import {
  getSectionStyleDomProps,
  getSectionStyleSx,
} from "../../utils/sectionStyle";

const palette = {
  bg: "#f4efe7",
  surface: "#fbf7f1",
  surfaceAlt: "#efe6da",
  ink: "#15110f",
  muted: "rgba(21,17,15,0.62)",
  line: "rgba(21,17,15,0.1)",
  accent: "#14483f",
  accentSoft: "rgba(20,72,63,0.12)",
  dark: "#071f1f",
  white: "#fffdf9",
};

const defaultHeadingFont = '"Plus Jakarta Sans", "Inter", sans-serif';
const defaultBodyFont = '"Inter", "Segoe UI", sans-serif';
const defaultSectionOrder = [
  "overview",
  "about",
  "why-us",
  "process",
  "contact",
] as const;

const humanizeSectionKey = (value: string) =>
  value
    .replace(/^plan[-_]?/i, "Plan ")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const visualSet = {
  heroPortrait:
    "https://themejunction.net/html/bexon/demo/assets/images/hero/h7-hero-banner.webp",
  strategy:
    "https://themejunction.net/html/bexon/demo/assets/images/about/about-5.webp",
  team: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=80",
  office:
    "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1400&q=80",
  boardroom:
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80",
  avatarOne:
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80",
  avatarTwo:
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=240&q=80",
  avatarThree:
    "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?auto=format&fit=crop&w=240&q=80",
  avatarFour:
    "https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=240&q=80",
};

const heroStagger = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 32, filter: "blur(10px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] },
  },
};

const sectionReveal = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
} as const;

const EditorFaqAccordionCard: React.FC<{
  blockId?: string | number;
  blockPath: string;
  heading?: string;
  items: Array<{ question?: string; answer?: string }>;
  textColor: string;
  mutedTextColor: string;
  themeColor: string;
  headingFont: string;
  tone: "light" | "dark";
}> = ({
  blockId,
  blockPath,
  heading,
  items,
  textColor,
  mutedTextColor,
  themeColor,
  headingFont,
  tone,
}) => {
  const [openIndex, setOpenIndex] = React.useState(0);

  React.useEffect(() => {
    if (items.length === 0) {
      setOpenIndex(-1);
      return;
    }

    setOpenIndex((prev) => {
      if (prev < 0 || prev >= items.length) {
        return 0;
      }
      return prev;
    });
  }, [items]);

  return (
    <Stack spacing={2} sx={{ width: "100%" }}>
      <Typography
        {...getEditableTextProps(blockId, `${blockPath}.heading`, "multi")}
        sx={{
          color: textColor,
          fontFamily: headingFont,
          fontSize: { xs: "1.45rem", md: "2rem" },
          fontWeight: 800,
          letterSpacing: "-0.03em",
        }}
      >
        {heading || "Frequently asked questions"}
      </Typography>
      <Stack spacing={1.15} sx={{ width: "100%" }}>
        {items.map((item, itemIndex) => {
          const isOpen = itemIndex === openIndex;
          return (
            <Box
              key={`faq-${itemIndex}`}
              sx={{
                borderRadius: "20px",
                overflow: "hidden",
                border: `1px solid ${rgba(themeColor, 0.14)}`,
                bgcolor:
                  tone === "light" ? "rgba(255,255,255,0.08)" : "#ffffff",
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  px: 2,
                  py: 1.6,
                  borderBottom: isOpen
                    ? `1px solid ${rgba(themeColor, 0.08)}`
                    : "none",
                }}
              >
                <Typography
                  {...getEditableTextProps(
                    blockId,
                    `${blockPath}.items.${itemIndex}.question`,
                    "single",
                  )}
                  sx={{ color: textColor, fontWeight: 700, pr: 2 }}
                >
                  {item?.question || `Question ${itemIndex + 1}`}
                </Typography>
                <Box
                  component="button"
                  type="button"
                  aria-label={isOpen ? "Collapse answer" : "Expand answer"}
                  data-open={isOpen ? "true" : "false"}
                  onClick={() =>
                    setOpenIndex((prev) =>
                      prev === itemIndex ? -1 : itemIndex,
                    )
                  }
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius: "999px",
                    border: "none",
                    bgcolor: rgba(themeColor, 0.1),
                    color: themeColor,
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 800,
                    fontSize: 0,
                    lineHeight: 1,
                    flexShrink: 0,
                    cursor: "pointer",
                    "&::before": {
                      content: '"+"',
                      fontSize: "1rem",
                      lineHeight: 1,
                      color: themeColor,
                    },
                    '&[data-open="true"]::before': {
                      content: '"-"',
                    },
                  }}
                >
                  {isOpen ? "−" : "+"}
                </Box>
              </Stack>
              {isOpen ? (
                <Typography
                  {...getEditableTextProps(
                    blockId,
                    `${blockPath}.items.${itemIndex}.answer`,
                    "multi",
                  )}
                  sx={{
                    px: 2,
                    py: 1.7,
                    color: mutedTextColor,
                    lineHeight: 1.75,
                    fontSize: "0.96rem",
                  }}
                >
                  {item?.answer || "Add the answer from the editor."}
                </Typography>
              ) : null}
            </Box>
          );
        })}
      </Stack>
    </Stack>
  );
};

const hexToRgb = (hex: string) => {
  const normalized = hex.replace("#", "");
  const value =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => char + char)
          .join("")
      : normalized;

  const int = Number.parseInt(value, 16);
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
};

const rgba = (hex: string, alpha: number) => {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const blendHex = (base: string, target: string, amount: number) => {
  const from = hexToRgb(base);
  const to = hexToRgb(target);
  const mix = (start: number, end: number) =>
    Math.round(start + (end - start) * amount)
      .toString(16)
      .padStart(2, "0");

  return `#${mix(from.r, to.r)}${mix(from.g, to.g)}${mix(from.b, to.b)}`;
};

const isLightColor = (hex: string) => {
  const { r, g, b } = hexToRgb(hex);
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance > 0.72;
};

const getImageHeightPresetSx = (preset?: string) => {
  switch (preset) {
    case "small":
      return { height: { xs: 220, md: 300 } };
    case "medium":
      return { height: { xs: 320, md: 420 } };
    case "large":
      return { height: { xs: 420, md: 560 } };
    default:
      return {};
  }
};

const getVideoHeightPresetSx = (preset?: string) => {
  switch (preset) {
    case "small":
      return { height: { xs: 240, md: 320 } };
    case "medium":
      return { height: { xs: 320, md: 460 } };
    case "large":
      return { height: { xs: 420, md: 640 } };
    case "fullscreen":
      return { height: { xs: "72vh", md: "100vh" } };
    case "auto":
      return { minHeight: { xs: 240, md: 360 } };
    default:
      return { height: { xs: "72vh", md: "100vh" } };
  }
};

const CompanyStudioTemplate: React.FC<TemplateProps> = ({ data }) => {
  const templateContent =
    (data.templateContent as Record<string, any> | undefined) || {};
  const homeContent = templateContent.home || {};
  const featuresContent = templateContent.features || {};
  const aboutContent = templateContent.about || {};
  const processContent = templateContent.process || {};
  const testimonialsContent = templateContent.testimonials || {};
  const contactContent = templateContent.contact || {};
  const headingFont = data.themeSettings?.headingFont || defaultHeadingFont;
  const bodyFont = data.themeSettings?.bodyFont || defaultBodyFont;
  const features = (
    (featuresContent.items as typeof data.features) ||
    data.features ||
    []
  ).slice(0, 4);
  const stats = (data.stats || []).slice(0, 3);
  const team = (data.team || []).slice(0, 2);
  const reviews = (data.reviews || []).slice(0, 1);
  const heroHeading =
    homeContent.heading ||
    homeContent.heroHeading ||
    data.tagline ||
    "Delivering Trusted Solutions";
  const heroSubheading =
    homeContent.subheading ||
    homeContent.heroDescription ||
    "Built to showcase business services, executive credibility, and client confidence in a clearer and more professional way.";
  const heroPrimaryCta =
    homeContent.primaryCtaText ||
    homeContent.ctaText ||
    homeContent.heroCtaText ||
    "Explore services";
  const heroSecondaryCta =
    homeContent.secondaryCtaText ||
    contactContent.ctaText ||
    contactContent.buttonLabel ||
    "Contact";
  const aboutHeading =
    aboutContent.heading ||
    "Driving innovation and excellence for corporate success worldwide.";
  const aboutBody =
    aboutContent.body ||
    "Built to showcase business services, executive credibility, and client confidence in a clearer and more professional way.";
  const whyHeading =
    featuresContent.heading ||
    "Built for business trust, clarity, and conversion.";
  const contactPrimary =
    contactContent.heading ||
    contactContent.buttonLabel ||
    contactContent.ctaText ||
    "Contact Us";
  const whyBody = featuresContent.description || aboutBody;
  const whyImageEyebrow =
    featuresContent.imageEyebrowText || "Business presentation";
  const whyImageHeading =
    featuresContent.imageHeading ||
    "Professional presentation for modern businesses.";
  const processHeading =
    processContent.heading || testimonialsContent.heading || "How it works.";
  const processDescription =
    processContent.subheading ||
    "A simple executive flow built to move from strategy to launch with clarity.";
  const processCtaText = processContent.ctaText || contactPrimary;
  const teamMembers =
    (processContent.teamMembers as Array<{ name?: string }> | undefined) ||
    team ||
    [];
  const processReviewText =
    processContent.reviewText ||
    reviews[0]?.text ||
    "Built to feel sharp, premium, and easy to scan.";
  const heroImage =
    homeContent.heroImage || homeContent.image || visualSet.heroPortrait;
  const heroImageStyle =
    homeContent.heroImageStyle || homeContent.imageStyle || {};
  const heroImageFit = heroImageStyle.objectFit || "contain";
  const heroImageHeightSx = getImageHeightPresetSx(heroImageStyle.heightPreset);
  const overviewInnerBlocks = Array.isArray(homeContent.innerBlocks)
    ? homeContent.innerBlocks
    : [];
  const aboutImage =
    aboutContent.image || aboutContent.imageUrl || visualSet.strategy;
  const aboutImageStyle = aboutContent.imageStyle || {};
  const aboutImageFit = aboutImageStyle.objectFit || "cover";
  const aboutImageHeightSx = getImageHeightPresetSx(
    aboutImageStyle.heightPreset,
  );
  const whyUsImage =
    featuresContent.image || featuresContent.imageUrl || visualSet.office;
  const whyUsImageStyle = featuresContent.imageStyle || {};
  const whyUsImageFit = whyUsImageStyle.objectFit || "cover";
  const whyUsImageHeightSx = getImageHeightPresetSx(
    whyUsImageStyle.heightPreset,
  );
  const processImage =
    processContent.image || processContent.imageUrl || visualSet.team;
  const processImageStyle = processContent.imageStyle || {};
  const processImageFit = processImageStyle.objectFit || "cover";
  const processImageHeightSx = getImageHeightPresetSx(
    processImageStyle.heightPreset,
  );
  const aboutBlockId = aboutContent.blockId;
  const whyUsBlockId = featuresContent.blockId;
  const processBlockId = processContent.blockId;
  const contactBlockId = contactContent.blockId;
  const processItems = (
    (processContent.items as Array<Record<string, unknown>> | undefined) ||
    (testimonialsContent.items as
      | Array<Record<string, unknown>>
      | undefined) || [
      {
        icon: "01",
        title: "Discovery & planning",
        description:
          "We define the brand story, service positioning, and the sections that matter most for a professional company site.",
      },
      {
        icon: "02",
        title: "Structure & delivery",
        description:
          "The design system, imagery, and motion are shaped into a clear website flow built for trust and executive presence.",
      },
      {
        icon: "03",
        title: "Review & support",
        description:
          "The final experience is refined for readability, conversion, and easy reuse across different client brands.",
      },
    ]
  ).slice(0, 3);
  const aboutDetailGroups = (
    (aboutContent.detailGroups as
      | Array<{ title?: string; items?: string[] }>
      | undefined) || [
      {
        title: "What we build",
        items: ["Clear systems", "Premium visuals", "Business growth"],
      },
      {
        title: "How we work",
        items: ["Fast collaboration", "Focused delivery", "Global support"],
      },
    ]
  ).slice(0, 2);
  const themeColor =
    data.themeSettings?.primaryColor || data.primaryColor || "#124d4e";
  const rawSecondaryColor =
    data.themeSettings?.secondaryColor ||
    data.secondaryColor ||
    palette.surfaceAlt;
  const themeSecondary = isLightColor(rawSecondaryColor)
    ? rawSecondaryColor
    : palette.surfaceAlt;
  const themeSoft = rgba(themeColor, 0.12);
  const themeMuted = rgba(themeColor, 0.16);
  const themeBorder = rgba(themeColor, 0.2);
  const themeGlow = rgba(themeColor, 0.08);
  const themeStrong = rgba(themeColor, 0.9);
  const themeHeroBase = rgba(themeColor, 0.96);
  const themeHeroMid = rgba(themeColor, 0.68);
  const themeHeroEnd = blendHex(themeColor, "#041012", 0.72);
  const themeDeep = blendHex(themeColor, "#071213", 0.58);
  const themeDeepest = blendHex(themeColor, "#020606", 0.8);
  const themeHighlight = blendHex(themeColor, "#ffffff", 0.32);
  const themeSurface = blendHex(themeSecondary, "#ffffff", 0.58);
  const themeSurfaceStrong = blendHex(themeSecondary, "#ffffff", 0.34);
  const themeLine = rgba(themeColor, 0.12);
  const pageBackground = `linear-gradient(180deg, ${rgba(themeSecondary, 0.22)} 0%, ${palette.bg} 20%, ${palette.bg} 100%)`;
  const headerBackground = rgba(themeSecondary, 0.72);
  const customSections = Array.isArray(templateContent.customSections)
    ? templateContent.customSections
    : [];
  const customSectionMap = new Map(
    customSections
      .filter(
        (section) =>
          section &&
          typeof section === "object" &&
          typeof section.sectionKey === "string" &&
          section.sectionKey.trim(),
      )
      .map((section) => [section.sectionKey, section]),
  );
  const whyChooseImageRef = React.useRef<HTMLDivElement | null>(null);
  const { scrollYProgress: whyChooseImageProgress } = useScroll({
    target: whyChooseImageRef,
    offset: ["start end", "end start"],
  });
  const whyChooseImageScale = useTransform(
    whyChooseImageProgress,
    [0, 0.5, 1],
    [1.16, 1.03, 1.16],
  );

  const socialIcons = [
    { key: "instagram", icon: Instagram },
    { key: "linkedin", icon: Linkedin },
    { key: "twitter", icon: Twitter },
    { key: "facebook", icon: Facebook },
  ].filter((item) =>
    Boolean(data.socialLinks?.[item.key as keyof typeof data.socialLinks]),
  );

  const orderedSectionKeys = (
    Array.isArray(templateContent.sectionOrder)
      ? templateContent.sectionOrder
      : defaultSectionOrder
  ).filter((key, index, collection) => {
    const normalizedKey = String(key);
    return (
      (defaultSectionOrder.includes(
        normalizedKey as (typeof defaultSectionOrder)[number],
      ) ||
        customSectionMap.has(normalizedKey)) &&
      collection.indexOf(key) === index
    );
  });
  const resolvedSectionOrder = orderedSectionKeys.length
    ? [
        ...orderedSectionKeys,
        ...defaultSectionOrder.filter(
          (key) => !orderedSectionKeys.includes(key),
        ),
        ...customSections
          .map((section) => section.sectionKey)
          .filter((key) => key && !orderedSectionKeys.includes(key)),
      ]
    : [
        ...defaultSectionOrder,
        ...customSections.map((section) => section.sectionKey).filter(Boolean),
      ];
  const sectionPosition = Object.fromEntries(
    resolvedSectionOrder.map((key, index) => [key, index + 1]),
  ) as Record<string, number>;
  const navItems = defaultSectionOrder.map((key) => {
    const defaultLabel = customSectionMap.has(key)
      ? String(
          customSectionMap.get(key)?.label ||
            customSectionMap.get(key)?.heading ||
            humanizeSectionKey(key),
        )
      : key === "overview"
        ? "Overview"
        : key === "about"
          ? "About"
          : key === "why-us"
            ? "Why Us"
            : key === "process"
              ? "Process"
              : "Contact";

    return {
      label:
        homeContent.navLabels?.[key] ||
        homeContent.navigationLabels?.[key] ||
        defaultLabel,
      id: customSectionMap.has(key) ? key : key === "process" ? "work" : key,
      fieldPath: `navLabels.${key}`,
    };
  });

  const scrollToSection = (sectionId: string) => {
    const target = document.getElementById(sectionId);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const overviewBlockId = homeContent.blockId;
  const renderCustomInnerBlock = (
    section: Record<string, any>,
    block: Record<string, any>,
    index: number,
    options?: {
      tone?: "light" | "dark";
      maxWidth?: number | string;
      canvas?: boolean;
    },
  ) => {
    const blockPath = `innerBlocks.${index}.content`;
    const blockType = String(block.type || "text").toLowerCase();
    const tone = options?.tone || "dark";
    const textColor = tone === "light" ? palette.white : palette.ink;
    const mutedTextColor =
      tone === "light" ? "rgba(255,255,255,0.78)" : palette.muted;
    const lineColor =
      tone === "light" ? "rgba(255,255,255,0.22)" : rgba(themeColor, 0.22);
    const blockMaxWidth = options?.maxWidth || 880;
    const rawTextStyle = block.content?.textStyle || {};
    const rawHeadingStyle = block.content?.headingStyle || rawTextStyle;
    const rawBodyStyle = block.content?.bodyStyle || rawTextStyle;
    const rawEyebrowStyle = block.content?.eyebrowStyle || rawTextStyle;
    const rawButtonStyle = block.content?.buttonTextStyle || rawTextStyle;
    const rawImageStyle = block.content?.imageStyle || {};
    const rawCardStyle = block.content?.cardStyle || {};
    const rawSectionStyle = block.content?.sectionStyle || {};
    const canvas = options?.canvas === true;
    const getFlowSafeStyle = (
      style: Record<string, any>,
      options?: { keepWidth?: boolean; keepHeight?: boolean },
    ) => {
      if (canvas || !style || typeof style !== "object") {
        return style;
      }
      const nextStyle = { ...style };
      delete nextStyle.transform;
      delete nextStyle.position;
      delete nextStyle.top;
      delete nextStyle.left;
      delete nextStyle.right;
      delete nextStyle.bottom;
      if (!options?.keepWidth) {
        delete nextStyle.width;
        delete nextStyle.maxWidth;
        delete nextStyle.minWidth;
      }
      if (!options?.keepHeight) {
        delete nextStyle.height;
        delete nextStyle.maxHeight;
        delete nextStyle.minHeight;
      }
      return nextStyle;
    };
    const textStyle = getFlowSafeStyle(rawTextStyle);
    const headingStyle = getFlowSafeStyle(rawHeadingStyle);
    const bodyStyle = getFlowSafeStyle(rawBodyStyle);
    const eyebrowStyle = getFlowSafeStyle(rawEyebrowStyle);
    const buttonStyle = getFlowSafeStyle(rawButtonStyle);
    const imageStyle = getFlowSafeStyle(rawImageStyle);
    const cardStyle = getFlowSafeStyle(rawCardStyle, {
      keepWidth: true,
      keepHeight: true,
    });
    const sectionStyle = getFlowSafeStyle(rawSectionStyle, {
      keepWidth: true,
      keepHeight: true,
    });
    const resolvedCardStyle = getFlowSafeStyle(
      getSectionStyleSx({ cardStyle: rawCardStyle }, "cardStyle"),
      { keepWidth: true, keepHeight: true },
    );
    const resolvedSectionStyle = getFlowSafeStyle(
      getSectionStyleSx({ sectionStyle: rawSectionStyle }),
      { keepWidth: true, keepHeight: true },
    );
    const canvasBaseSx = canvas
      ? {
          position: { xs: "relative", md: "absolute" } as const,
          top: { md: 0 },
          left: { md: 0 },
          margin: 0,
        }
      : null;
    const getCanvasWidth = (desktopWidth: any, fallbackWidth = "100%") =>
      canvas
        ? { xs: "100%", md: desktopWidth || fallbackWidth }
        : fallbackWidth;
    const getCanvasMaxWidth = (
      desktopWidth: any,
      fallbackWidth: any = blockMaxWidth,
    ) =>
      canvas
        ? { xs: "100%", md: desktopWidth || fallbackWidth }
        : fallbackWidth;
    const getCanvasTransform = (desktopTransform: any) =>
      canvas ? { xs: "none", md: desktopTransform || "none" } : undefined;
    const defaultCompoundCardWidth = canvas
      ? blockType === "video"
        ? "calc(100% - 112px)"
        : "640px"
      : "100%";
    const hasExplicitWidth =
      cardStyle.width !== undefined || resolvedCardStyle.width !== undefined;
    const resolvedCardWidth =
      cardStyle.width ?? resolvedCardStyle.width ?? defaultCompoundCardWidth;
    const resolvedCardMaxWidth =
      cardStyle.maxWidth ??
      resolvedCardStyle.maxWidth ??
      (hasExplicitWidth ? "none" : defaultCompoundCardWidth);
    const hasCustomBackground =
      resolvedCardStyle.backgroundColor !== undefined ||
      resolvedCardStyle.backgroundImage !== undefined ||
      cardStyle.backgroundColor !== undefined ||
      cardStyle.backgroundImage !== undefined;
    const hasCustomBorder =
      resolvedCardStyle.border !== undefined ||
      resolvedCardStyle.borderStyle !== undefined ||
      cardStyle.border !== undefined ||
      cardStyle.borderStyle !== undefined;
    const hasCustomShadow =
      resolvedCardStyle.boxShadow !== undefined ||
      cardStyle.boxShadow !== undefined;
    const compoundCardSx = {
      p: { xs: 2.25, md: 3 },
      boxSizing: "border-box",
      borderRadius: "28px",
      ...(hasCustomBorder
        ? {}
        : {
            border: `1px solid ${tone === "light" ? "rgba(255,255,255,0.16)" : rgba(themeColor, 0.14)}`,
          }),
      ...(hasCustomBackground
        ? {}
        : tone === "light"
          ? {
              backgroundColor: "rgba(255,255,255,0.08)",
            }
          : {
              backgroundColor: "rgba(255,255,255,0.96)",
              backgroundImage:
                "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(248,250,252,0.98) 100%)",
            }),
      ...(hasCustomShadow
        ? {}
        : {
            boxShadow:
              tone === "light"
                ? "0 24px 48px rgba(0,0,0,0.16)"
                : "0 24px 48px rgba(15,23,42,0.08)",
          }),
      backdropFilter: "blur(12px)",
      ...canvasBaseSx,
      ...resolvedSectionStyle,
      ...resolvedCardStyle,
      ...sectionStyle,
      ...cardStyle,
      width: getCanvasWidth(resolvedCardWidth, resolvedCardWidth),
      maxWidth: getCanvasMaxWidth(resolvedCardMaxWidth, resolvedCardMaxWidth),
      transform: getCanvasTransform(cardStyle.transform),
      ...(canvas
        ? {}
        : resolvedCardStyle.minHeight === undefined &&
            resolvedCardStyle.height === undefined &&
            cardStyle.minHeight === undefined &&
            cardStyle.height === undefined
          ? {
              minHeight: "auto",
              height: "auto",
            }
          : {}),
    };
    const compoundBlockSelectionProps = {
      ...getEditableTextProps(section.blockId, `${blockPath}.__card`, "single"),
      "data-preview-section": "true",
      "data-preview-label": block.label || humanizeSectionKey(blockType),
      "data-preview-block-id": section.blockId,
      "data-preview-style-key": `${blockPath}.cardStyle`,
    };
    const compoundBlockLabel = block.label || humanizeSectionKey(blockType);

    if (blockType === "heading") {
      return (
        <Typography
          key={String(block.id || `${blockType}-${index}`)}
          {...getEditableTextProps(
            section.blockId,
            `${blockPath}.text`,
            "multi",
          )}
          sx={{
            maxWidth: blockMaxWidth,
            fontFamily: headingFont,
            fontSize: { xs: "2rem", md: "3.2rem" },
            lineHeight: 0.98,
            letterSpacing: "-0.05em",
            fontWeight: 800,
            color: textColor,
            ...(canvas
              ? {
                  width: { xs: "100%", md: "min(540px, calc(100% - 112px))" },
                  maxWidth: { xs: "100%", md: "540px" },
                }
              : {}),
            ...canvasBaseSx,
            ...headingStyle,
            transform: getCanvasTransform(headingStyle.transform),
            ...(canvas
              ? {}
              : {
                  width: "100%",
                  maxWidth: "100%",
                  fontSize: {
                    xs: "clamp(1.8rem, 8vw, 2.7rem)",
                    sm: "clamp(2.1rem, 6vw, 3.1rem)",
                  },
                  lineHeight: 1.05,
                  letterSpacing: "-0.04em",
                }),
          }}
        >
          {block.content?.text || "New section heading"}
        </Typography>
      );
    }

    if (blockType === "eyebrow") {
      return (
        <Chip
          key={String(block.id || `${blockType}-${index}`)}
          label={block.content?.text || "Section label"}
          {...getEditableTextProps(
            section.blockId,
            `${blockPath}.text`,
            "single",
          )}
          sx={{
            alignSelf: "flex-start",
            bgcolor:
              tone === "light" ? "rgba(255,255,255,0.14)" : palette.accentSoft,
            color: textColor,
            backdropFilter: "blur(10px)",
            border:
              tone === "light"
                ? "1px solid rgba(255,255,255,0.22)"
                : `1px solid ${rgba(themeColor, 0.14)}`,
            fontWeight: 700,
            ...canvasBaseSx,
            ...textStyle,
            transform: getCanvasTransform(textStyle.transform),
          }}
        />
      );
    }

    if (blockType === "image") {
      return (
        <Box
          key={String(block.id || `${blockType}-${index}`)}
          component="img"
          src={block.content?.src || visualSet.office}
          alt={block.content?.alt || "Section image"}
          {...getEditableImageProps(
            section.blockId,
            `${blockPath}.src`,
            block.label || "Section Image",
          )}
          sx={{
            height: imageStyle.height || { xs: 220, md: 360 },
            objectFit: imageStyle.objectFit || "cover",
            borderRadius: "24px",
            display: "block",
            cursor: "pointer",
            borderWidth: imageStyle.borderWidth,
            borderColor: imageStyle.borderColor,
            borderStyle: imageStyle.borderWidth ? "solid" : undefined,
            ...canvasBaseSx,
            ...imageStyle,
            width: getCanvasWidth(imageStyle.width || "320px"),
            maxWidth: getCanvasMaxWidth(imageStyle.width || "320px"),
            transform: getCanvasTransform(imageStyle.transform),
            ...(canvas
              ? {}
              : {
                  height: "auto",
                  minHeight: 0,
                  maxHeight: 420,
                }),
          }}
        />
      );
    }

    if (blockType === "button") {
      return (
        <Button
          key={String(block.id || `${blockType}-${index}`)}
          variant="contained"
          {...getEditableTextProps(
            section.blockId,
            `${blockPath}.text`,
            "single",
          )}
          sx={{
            alignSelf: "flex-start",
            bgcolor: themeColor,
            color: palette.white,
            borderRadius: "16px",
            textTransform: "none",
            px: 2.8,
            py: 1.2,
            fontWeight: 700,
            boxShadow: "none",
            ...canvasBaseSx,
            ...buttonStyle,
            transform: getCanvasTransform(buttonStyle.transform),
            ...(canvas
              ? {}
              : {
                  width: "auto",
                  maxWidth: "100%",
                  minWidth: 0,
                  whiteSpace: "normal",
                }),
            "&:hover": {
              bgcolor: themeColor,
              boxShadow: "none",
              opacity: 0.94,
            },
          }}
        >
          {block.content?.text || "Button"}
        </Button>
      );
    }

    if (blockType === "divider") {
      return (
        <Box
          key={String(block.id || `${blockType}-${index}`)}
          sx={{
            width: getCanvasWidth(textStyle.width || "420px"),
            maxWidth: getCanvasMaxWidth(textStyle.width || "420px"),
            height: 1,
            backgroundColor: lineColor,
            ...canvasBaseSx,
            transform: getCanvasTransform(textStyle.transform),
          }}
        />
      );
    }

    if (blockType === "spacer") {
      return (
        <Box
          key={String(block.id || `${blockType}-${index}`)}
          sx={{
            width: "100%",
            maxWidth: blockMaxWidth,
            height: block.content?.height || "24px",
            flexShrink: 0,
            ...canvasBaseSx,
            transform: getCanvasTransform(textStyle.transform),
          }}
        />
      );
    }

    if (blockType === "marquee") {
      const marqueeText =
        block.content?.text ||
        "We make things that work better and last longer.";
      const marqueeItems = Array.from({ length: 8 }, (_, itemIndex) => ({
        id: `marquee-${itemIndex}`,
        text: marqueeText,
      }));

      return (
        <Box
          key={String(block.id || `${blockType}-${index}`)}
          {...compoundBlockSelectionProps}
          data-preview-label={compoundBlockLabel}
          sx={{
            width: "100%",
            overflow: "hidden",
            borderTop: `1px solid ${rgba(themeColor, 0.16)}`,
            borderBottom: `1px solid ${rgba(themeColor, 0.16)}`,
            backgroundColor:
              tone === "light" ? "rgba(255,255,255,0.08)" : "#ffffff",
            ...canvasBaseSx,
            ...sectionStyle,
            ...cardStyle,
            transform: getCanvasTransform(cardStyle.transform),
            ...(canvas
              ? {}
              : {
                  minHeight: "auto",
                  height: "auto",
                }),
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 4, md: 6 },
              py: { xs: 1.6, md: 2 },
              width: "max-content",
              minWidth: "100%",
              animation: "companyMarqueeSlide 42s linear infinite",
              "@keyframes companyMarqueeSlide": {
                "0%": { transform: "translateX(0)" },
                "100%": { transform: "translateX(-50%)" },
              },
            }}
          >
            {[...marqueeItems, ...marqueeItems].map((item, itemIndex) => (
              <Typography
                key={`${item.id}-${itemIndex}`}
                {...getEditableTextProps(
                  section.blockId,
                  `${blockPath}.text`,
                  "single",
                )}
                sx={{
                  color: textColor,
                  fontFamily: headingFont,
                  fontSize: { xs: "1rem", md: "1.1rem" },
                  fontWeight: 600,
                  letterSpacing: "0.01em",
                  whiteSpace: "nowrap",
                  ...textStyle,
                }}
              >
                {item.text}
              </Typography>
            ))}
          </Box>
        </Box>
      );
    }

    if (blockType === "announcement_bar") {
      return (
        <Stack
          key={String(block.id || `${blockType}-${index}`)}
          direction={{ xs: "column", md: "row" }}
          spacing={1.5}
          alignItems={{ xs: "flex-start", md: "center" }}
          justifyContent="space-between"
          {...compoundBlockSelectionProps}
          data-preview-label={compoundBlockLabel}
          sx={compoundCardSx}
        >
          <Typography
            {...getEditableTextProps(
              section.blockId,
              `${blockPath}.text`,
              "single",
            )}
            sx={{ color: textColor, fontWeight: 700, ...textStyle }}
          >
            {block.content?.text || "Special announcement for this section."}
          </Typography>
          <Button
            variant="contained"
            {...getEditableTextProps(
              section.blockId,
              `${blockPath}.buttonText`,
              "single",
            )}
            sx={{
              bgcolor: themeColor,
              color: palette.white,
              borderRadius: "999px",
              textTransform: "none",
              px: 2.2,
              py: 0.95,
              boxShadow: "none",
              ...buttonStyle,
            }}
          >
            {block.content?.buttonText || "Learn more"}
          </Button>
        </Stack>
      );
    }

    if (
      blockType === "cta" ||
      blockType === "newsletter" ||
      blockType === "contact" ||
      blockType === "form_builder" ||
      blockType === "reservation_form" ||
      blockType === "generic_card"
    ) {
      const fields = Array.isArray(block.content?.fields)
        ? block.content.fields
        : [];
      return (
        <Stack
          key={String(block.id || `${blockType}-${index}`)}
          spacing={2}
          alignItems="flex-start"
          {...compoundBlockSelectionProps}
          data-preview-label={compoundBlockLabel}
          sx={compoundCardSx}
        >
          <Box sx={{ width: "100%" }}>
            <Typography
              {...getEditableTextProps(
                section.blockId,
                `${blockPath}.heading`,
                "multi",
              )}
              sx={{
                color: textColor,
                fontFamily: headingFont,
                fontSize: { xs: "1.45rem", md: "2.15rem" },
                lineHeight: 1.05,
                fontWeight: 800,
                letterSpacing: "-0.04em",
                ...headingStyle,
              }}
            >
              {block.content?.heading || block.label || "Section block"}
            </Typography>
            <Typography
              {...getEditableTextProps(
                section.blockId,
                `${blockPath}.body`,
                "multi",
              )}
              sx={{
                mt: 1,
                color: mutedTextColor,
                fontSize: "1rem",
                lineHeight: 1.75,
                ...bodyStyle,
              }}
            >
              {block.content?.body || "Add supporting copy for this block."}
            </Typography>
          </Box>

          {blockType === "newsletter" ? (
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={1.25}
              sx={{ width: "100%" }}
            >
              <TextField
                size="small"
                fullWidth
                placeholder={block.content?.placeholder || "Enter your email"}
                sx={{
                  "& .MuiInputBase-root": {
                    color: textColor,
                    bgcolor:
                      tone === "light" ? "rgba(255,255,255,0.08)" : "#ffffff",
                    borderRadius: 999,
                  },
                }}
              />
              <Button
                variant="contained"
                {...getEditableTextProps(
                  section.blockId,
                  `${blockPath}.buttonText`,
                  "single",
                )}
                sx={{
                  bgcolor: themeColor,
                  color: palette.white,
                  borderRadius: "999px",
                  textTransform: "none",
                  px: 2.6,
                  py: 1.05,
                  whiteSpace: "nowrap",
                  boxShadow: "none",
                  ...buttonStyle,
                }}
              >
                {block.content?.buttonText || "Subscribe"}
              </Button>
            </Stack>
          ) : fields.length ? (
            <Stack spacing={1.1} sx={{ width: "100%" }}>
              {fields.map((field: string, fieldIndex: number) => (
                <TextField
                  key={`${field}-${fieldIndex}`}
                  size="small"
                  fullWidth
                  placeholder={field}
                  sx={{
                    "& .MuiInputBase-root": {
                      color: textColor,
                      bgcolor:
                        tone === "light" ? "rgba(255,255,255,0.08)" : "#ffffff",
                      borderRadius: 2.5,
                    },
                  }}
                />
              ))}
              <Button
                variant="contained"
                {...getEditableTextProps(
                  section.blockId,
                  `${blockPath}.buttonText`,
                  "single",
                )}
                sx={{
                  alignSelf: "flex-start",
                  bgcolor: themeColor,
                  color: palette.white,
                  borderRadius: "16px",
                  textTransform: "none",
                  px: 2.6,
                  py: 1.05,
                  boxShadow: "none",
                  ...buttonStyle,
                }}
              >
                {block.content?.buttonText || "Submit"}
              </Button>
            </Stack>
          ) : (
            <Button
              variant="contained"
              {...getEditableTextProps(
                section.blockId,
                `${blockPath}.buttonText`,
                "single",
              )}
              sx={{
                bgcolor: themeColor,
                color: palette.white,
                borderRadius: "16px",
                textTransform: "none",
                px: 2.7,
                py: 1.1,
                boxShadow: "none",
                ...buttonStyle,
              }}
            >
              {block.content?.buttonText || "Get started"}
            </Button>
          )}
        </Stack>
      );
    }

    if (blockType === "hero" || blockType === "image_text_split") {
      return (
        <Stack
          key={String(block.id || `${blockType}-${index}`)}
          direction={{ xs: "column", md: "row" }}
          spacing={2.5}
          alignItems="stretch"
          {...compoundBlockSelectionProps}
          data-preview-label={compoundBlockLabel}
          sx={compoundCardSx}
        >
          <Stack spacing={1.35} sx={{ flex: 1, minWidth: 0 }}>
            <Chip
              label={block.content?.eyebrow || "Feature block"}
              {...getEditableTextProps(
                section.blockId,
                `${blockPath}.eyebrow`,
                "single",
              )}
              sx={{
                alignSelf: "flex-start",
                bgcolor:
                  tone === "light"
                    ? "rgba(255,255,255,0.14)"
                    : palette.accentSoft,
                color: textColor,
                fontWeight: 700,
                ...eyebrowStyle,
              }}
            />
            <Typography
              {...getEditableTextProps(
                section.blockId,
                `${blockPath}.heading`,
                "multi",
              )}
              sx={{
                color: textColor,
                fontFamily: headingFont,
                fontSize: { xs: "1.55rem", md: "2.3rem" },
                lineHeight: 1.02,
                fontWeight: 800,
                letterSpacing: "-0.04em",
                ...headingStyle,
              }}
            >
              {block.content?.heading || "Image and text split"}
            </Typography>
            <Typography
              {...getEditableTextProps(
                section.blockId,
                `${blockPath}.body`,
                "multi",
              )}
              sx={{
                color: mutedTextColor,
                fontSize: "1rem",
                lineHeight: 1.75,
                ...bodyStyle,
              }}
            >
              {block.content?.body ||
                "Pair an image with a supporting message and CTA."}
            </Typography>
            <Button
              variant="contained"
              {...getEditableTextProps(
                section.blockId,
                `${blockPath}.buttonText`,
                "single",
              )}
              sx={{
                alignSelf: "flex-start",
                bgcolor: themeColor,
                color: palette.white,
                borderRadius: "16px",
                textTransform: "none",
                px: 2.6,
                py: 1.05,
                boxShadow: "none",
                ...buttonStyle,
              }}
            >
              {block.content?.buttonText || "Explore more"}
            </Button>
          </Stack>
          <Box
            component="img"
            src={block.content?.image || visualSet.office}
            alt={block.content?.heading || "Split image"}
            {...getEditableImageProps(
              section.blockId,
              `${blockPath}.image`,
              block.label || "Split Image",
            )}
            sx={{
              width: { xs: "100%", md: 260 },
              minWidth: { md: 260 },
              height: { xs: 220, md: 280 },
              objectFit: imageStyle.objectFit || "cover",
              borderRadius: "22px",
              display: "block",
              ...imageStyle,
            }}
          />
        </Stack>
      );
    }

    if (blockType === "video") {
      const videoUrl = String(block.content?.videoUrl || "");
      const isEmbed =
        videoUrl.includes("youtube.com") ||
        videoUrl.includes("youtu.be") ||
        videoUrl.includes("vimeo.com");
      const desktopVideoWidth = Math.min(
        100,
        Math.max(20, Number(block.content?.width) || 100),
      );
      const mobileVideoWidth = Math.min(
        100,
        Math.max(20, Number(block.content?.mobileWidth) || 100),
      );
      const videoHeightPreset = String(
        block.content?.heightPreset || "fullscreen",
      );
      const videoHeightSx = getVideoHeightPresetSx(videoHeightPreset);
      const videoObjectFit = String(block.content?.objectFit || "contain");
      return (
        <Stack
          key={String(block.id || `${blockType}-${index}`)}
          {...compoundBlockSelectionProps}
          data-preview-label={compoundBlockLabel}
          sx={{
            ...compoundCardSx,
            width: {
              xs: mobileVideoWidth >= 100 ? "100%" : `${mobileVideoWidth}%`,
              md: desktopVideoWidth >= 100 ? "100%" : `${desktopVideoWidth}%`,
            },
            maxWidth: "100%",
            mx: "auto",
            alignSelf: "center",
          }}
        >
          <Box
            sx={{
              position: "relative",
              width: "100%",
              borderRadius: "24px",
              overflow: "hidden",
              bgcolor: tone === "light" ? "rgba(255,255,255,0.1)" : "#ffffff",
              border: `1px solid ${rgba(themeColor, 0.12)}`,
              ...videoHeightSx,
            }}
          >
            {videoUrl ? (
              isEmbed ? (
                <Box
                  component="iframe"
                  src={videoUrl}
                  title={block.label || "Video"}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  sx={{ width: "100%", height: "100%", border: 0 }}
                />
              ) : (
                <Box
                  component="video"
                  src={videoUrl}
                  controls={block.content?.showControls !== false}
                  muted={block.content?.muted !== false}
                  autoPlay={Boolean(block.content?.autoplay)}
                  loop={Boolean(block.content?.loop)}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: videoObjectFit,
                    display: "block",
                    backgroundColor: "#000000",
                  }}
                />
              )
            ) : (
              <Stack
                spacing={1}
                alignItems="center"
                justifyContent="center"
                sx={{ width: "100%", height: "100%" }}
              >
                <Box
                  sx={{
                    width: 72,
                    height: 72,
                    borderRadius: "999px",
                    bgcolor: rgba(themeColor, 0.12),
                    display: "grid",
                    placeItems: "center",
                    color: themeColor,
                    fontSize: "1.8rem",
                    fontWeight: 800,
                  }}
                >
                  ▶
                </Box>
                <Typography sx={{ color: mutedTextColor }}>
                  Add a video URL from the editor.
                </Typography>
              </Stack>
            )}
          </Box>
        </Stack>
      );
    }

    if (blockType === "features") {
      const items = Array.isArray(block.content?.items)
        ? block.content.items
        : [];
      return (
        <Stack
          key={String(block.id || `${blockType}-${index}`)}
          spacing={2}
          {...compoundBlockSelectionProps}
          data-preview-label={compoundBlockLabel}
          sx={compoundCardSx}
        >
          <Typography
            {...getEditableTextProps(
              section.blockId,
              `${blockPath}.heading`,
              "multi",
            )}
            sx={{
              color: textColor,
              fontFamily: headingFont,
              fontSize: { xs: "1.4rem", md: "2rem" },
              fontWeight: 800,
              letterSpacing: "-0.03em",
              ...headingStyle,
            }}
          >
            {block.content?.heading || "Core features"}
          </Typography>
          <Typography
            {...getEditableTextProps(
              section.blockId,
              `${blockPath}.body`,
              "multi",
            )}
            sx={{ color: mutedTextColor, lineHeight: 1.75, ...bodyStyle }}
          >
            {block.content?.body ||
              "Highlight the strongest benefits of this section."}
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(3, minmax(0, 1fr))",
              },
              gap: 1.35,
              width: "100%",
            }}
          >
            {items.map((item: Record<string, any>, itemIndex: number) => (
              <Box
                key={`feature-${itemIndex}`}
                sx={{
                  p: 2,
                  borderRadius: "18px",
                  border: `1px solid ${rgba(themeColor, 0.12)}`,
                  bgcolor:
                    tone === "light" ? "rgba(255,255,255,0.08)" : "#ffffff",
                }}
              >
                <Typography
                  {...getEditableTextProps(
                    section.blockId,
                    `${blockPath}.items.${itemIndex}.title`,
                    "single",
                  )}
                  sx={{ color: textColor, fontWeight: 700 }}
                >
                  {item?.title || `Feature ${itemIndex + 1}`}
                </Typography>
                <Typography
                  {...getEditableTextProps(
                    section.blockId,
                    `${blockPath}.items.${itemIndex}.description`,
                    "multi",
                  )}
                  sx={{
                    mt: 0.6,
                    color: mutedTextColor,
                    fontSize: "0.94rem",
                    lineHeight: 1.65,
                  }}
                >
                  {item?.description || "Describe this feature here."}
                </Typography>
              </Box>
            ))}
          </Box>
        </Stack>
      );
    }

    if (blockType === "faq") {
      const items = Array.isArray(block.content?.items)
        ? block.content.items
        : [];
      return (
        <Stack
          key={String(block.id || `${blockType}-${index}`)}
          spacing={2}
          {...compoundBlockSelectionProps}
          data-preview-label={compoundBlockLabel}
          sx={compoundCardSx}
        >
          <EditorFaqAccordionCard
            blockId={section.blockId}
            blockPath={blockPath}
            heading={block.content?.heading as string}
            items={items}
            textColor={textColor}
            mutedTextColor={mutedTextColor}
            themeColor={themeColor}
            headingFont={headingFont}
            tone={tone}
          />
        </Stack>
      );
    }

    if (blockType === "tabs") {
      const tabs = Array.isArray(block.content?.tabs) ? block.content.tabs : [];
      const activeTab = tabs[0];
      return (
        <Stack
          key={String(block.id || `${blockType}-${index}`)}
          spacing={2}
          {...compoundBlockSelectionProps}
          data-preview-label={compoundBlockLabel}
          sx={compoundCardSx}
        >
          <Typography
            {...getEditableTextProps(
              section.blockId,
              `${blockPath}.heading`,
              "single",
            )}
            sx={{
              color: textColor,
              fontFamily: headingFont,
              fontWeight: 800,
              fontSize: { xs: "1.4rem", md: "2rem" },
              ...headingStyle,
            }}
          >
            {block.content?.heading || "Explore the details"}
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {tabs.map((tab: Record<string, any>, tabIndex: number) => (
              <Chip
                key={`tab-${tabIndex}`}
                label={tab?.label || `Tab ${tabIndex + 1}`}
                {...getEditableTextProps(
                  section.blockId,
                  `${blockPath}.tabs.${tabIndex}.label`,
                  "single",
                )}
                sx={{
                  bgcolor:
                    tabIndex === 0
                      ? themeColor
                      : tone === "light"
                        ? "rgba(255,255,255,0.08)"
                        : "#ffffff",
                  color: tabIndex === 0 ? palette.white : textColor,
                  border: `1px solid ${rgba(themeColor, 0.12)}`,
                  fontWeight: 700,
                }}
              />
            ))}
          </Stack>
          <Box
            sx={{
              p: 2.2,
              borderRadius: "20px",
              bgcolor: tone === "light" ? "rgba(255,255,255,0.08)" : "#ffffff",
              border: `1px solid ${rgba(themeColor, 0.12)}`,
            }}
          >
            <Typography
              {...getEditableTextProps(
                section.blockId,
                `${blockPath}.tabs.0.label`,
                "single",
              )}
              sx={{ color: textColor, fontWeight: 700 }}
            >
              {activeTab?.label || "Tab content"}
            </Typography>
            <Typography
              {...getEditableTextProps(
                section.blockId,
                `${blockPath}.tabs.0.content`,
                "multi",
              )}
              sx={{ mt: 0.8, color: mutedTextColor, lineHeight: 1.75 }}
            >
              {activeTab?.content || "Add tab content from the editor."}
            </Typography>
          </Box>
        </Stack>
      );
    }

    if (blockType === "navigation_bar") {
      const links = Array.isArray(block.content?.links)
        ? block.content.links
        : [];
      return (
        <Stack
          key={String(block.id || `${blockType}-${index}`)}
          direction={{ xs: "column", md: "row" }}
          spacing={1.5}
          alignItems={{ xs: "flex-start", md: "center" }}
          justifyContent="space-between"
          {...compoundBlockSelectionProps}
          data-preview-label={compoundBlockLabel}
          sx={compoundCardSx}
        >
          <Typography
            {...getEditableTextProps(
              section.blockId,
              `${blockPath}.logoText`,
              "single",
            )}
            sx={{
              color: textColor,
              fontFamily: headingFont,
              fontWeight: 800,
              fontSize: "1.15rem",
              ...headingStyle,
            }}
          >
            {block.content?.logoText || block.content?.heading || "Your Brand"}
          </Typography>
          {links.length ? (
            <Stack direction="row" spacing={2} flexWrap="wrap">
              {links.map((link: string, linkIndex: number) => (
                <Typography
                  key={`${link}-${linkIndex}`}
                  sx={{ color: mutedTextColor, fontWeight: 600 }}
                >
                  {link}
                </Typography>
              ))}
            </Stack>
          ) : (
            <Typography
              {...getEditableTextProps(
                section.blockId,
                `${blockPath}.copyright`,
                "single",
              )}
              sx={{ color: mutedTextColor, ...bodyStyle }}
            >
              {block.content?.copyright ||
                "(c) 2026 Your company. All rights reserved."}
            </Typography>
          )}
        </Stack>
      );
    }

    if (blockType === "footer") {
      const footerLinks = Array.isArray(block.content?.links)
        ? block.content.links
            .map((link: any) =>
              typeof link === "string"
                ? { label: link, url: "#" }
                : {
                    label: String(link?.label || link?.text || "").trim(),
                    url: String(link?.url || link?.href || "#").trim() || "#",
                  },
            )
            .filter((link: { label: string }) => link.label)
        : [];
      const footerSocialLinks = Array.isArray(block.content?.socialLinks)
        ? block.content.socialLinks
            .map((item: any) => ({
              platform: String(item?.platform || item?.label || "").trim(),
              url: String(item?.url || item?.href || "").trim(),
            }))
            .filter((item: { platform: string; url: string }) => item.platform && item.url)
        : [];
      const footerLayoutWidth =
        rawCardStyle.layoutWidth || rawSectionStyle.layoutWidth || "page";
      const footerInnerContainerSx =
        footerLayoutWidth === "full"
          ? { width: "100%", maxWidth: "none", alignSelf: "stretch" }
          : { width: "100%", maxWidth: "1200px", mx: "auto", alignSelf: "center" };
      const footerTextColor = "#f8fafc";
      const footerMutedColor = "rgba(248,250,252,0.72)";
      const footerLineColor = "rgba(248,250,252,0.14)";
      const resolveSocialIcon = (platform: string) => {
        const normalized = String(platform || "").trim().toLowerCase();
        if (normalized.includes("instagram")) return Instagram;
        if (normalized.includes("linkedin")) return Linkedin;
        if (normalized.includes("facebook")) return Facebook;
        return Twitter;
      };
      const resolveFooterHref = (url: string) => {
        const trimmed = String(url || "").trim();
        if (!trimmed) return "#";
        if (
          trimmed.startsWith("#") ||
          trimmed.startsWith("http://") ||
          trimmed.startsWith("https://") ||
          trimmed.startsWith("mailto:") ||
          trimmed.startsWith("tel:")
        ) {
          return trimmed;
        }
        if (!trimmed.startsWith("/")) {
          return trimmed;
        }
        if (typeof window === "undefined") {
          return trimmed;
        }

        const pathMatch = window.location.pathname.match(/^\/site\/([^/]+)/);
        if (!pathMatch) {
          return trimmed;
        }

        const siteBase = `/site/${pathMatch[1]}`;
        if (trimmed === siteBase || trimmed.startsWith(`${siteBase}/`)) {
          return trimmed;
        }

        return `${siteBase}${trimmed}`;
      };

      return (
        <Stack
          key={String(block.id || `${blockType}-${index}`)}
          spacing={2.4}
          alignItems="stretch"
          {...compoundBlockSelectionProps}
          data-preview-label={compoundBlockLabel}
          sx={{
            ...compoundCardSx,
            backgroundColor: rawCardStyle.backgroundColor || "#0f1115",
            backgroundImage:
              rawCardStyle.backgroundImage || rawCardStyle.backgroundImageUrl
                ? compoundCardSx.backgroundImage
                : "linear-gradient(180deg, rgba(15,17,21,0.98) 0%, rgba(18,23,31,0.98) 100%)",
            borderColor: rawCardStyle.borderColor || "rgba(255,255,255,0.12)",
            boxShadow: rawCardStyle.boxShadow || "none",
            ...(rawCardStyle.paddingLeft === undefined &&
            rawCardStyle.paddingRight === undefined
              ? { px: { xs: 2, md: 2.75 } }
              : {}),
            ...(rawCardStyle.paddingTop === undefined &&
            rawCardStyle.paddingBottom === undefined
              ? { py: { xs: 2.4, md: 3 } }
              : {}),
            ...(rawCardStyle.minHeight === undefined &&
            rawCardStyle.height === undefined &&
            resolvedCardStyle.minHeight === undefined &&
            resolvedCardStyle.height === undefined
              ? {
                  minHeight: "auto",
                  height: "auto",
                }
              : {}),
            ...(rawCardStyle.layoutGap === undefined &&
            resolvedCardStyle.gap === undefined
              ? { gap: 0 }
              : {}),
            ...(rawCardStyle.borderRadius === undefined &&
            resolvedCardStyle.borderRadius === undefined
              ? { borderRadius: 0 }
              : {}),
          }}
        >
          <Box sx={footerInnerContainerSx}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1.2fr 0.9fr 1fr 1.1fr" },
                gap: { xs: 2.4, md: 3 },
                alignItems: "start",
              }}
            >
              <Stack spacing={1.2}>
                <Typography
                  {...getEditableTextProps(
                    section.blockId,
                    `${blockPath}.logoText`,
                    "single",
                  )}
                  sx={{
                    color: footerTextColor,
                    fontFamily: headingFont,
                    fontWeight: 800,
                    fontSize: { xs: "1.3rem", md: "1.55rem" },
                    letterSpacing: "-0.03em",
                    ...headingStyle,
                  }}
                >
                  {block.content?.logoText || block.content?.heading || "LOGO"}
                </Typography>
                <Typography
                  {...getEditableTextProps(
                    section.blockId,
                    `${blockPath}.description`,
                    "multi",
                  )}
                  sx={{
                    color: footerMutedColor,
                    maxWidth: 320,
                    lineHeight: 1.8,
                    fontSize: "0.96rem",
                    ...bodyStyle,
                  }}
                >
                  {block.content?.description ||
                    "A modern business footer with direct contact details, useful navigation, and a simple subscribe form."}
                </Typography>
                {footerSocialLinks.length ? (
                  <Stack direction="row" spacing={1}>
                    {footerSocialLinks.map(
                      (
                        item: { platform: string; url: string },
                        socialIndex: number,
                      ) => {
                        const Icon = resolveSocialIcon(item.platform);
                        return (
                          <Box
                            key={`${item.platform}-${socialIndex}`}
                            component="a"
                            href={resolveFooterHref(item.url)}
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: "999px",
                              display: "grid",
                              placeItems: "center",
                              color: footerTextColor,
                              border: "1px solid rgba(248,250,252,0.16)",
                              bgcolor: "rgba(255,255,255,0.04)",
                              transition: "background-color 160ms ease, border-color 160ms ease",
                              "&:hover": {
                                bgcolor: "rgba(255,255,255,0.08)",
                                borderColor: "rgba(248,250,252,0.28)",
                              },
                            }}
                          >
                            <Icon size={18} />
                          </Box>
                        );
                      },
                    )}
                  </Stack>
                ) : null}
              </Stack>

              <Stack spacing={1.1}>
                <Typography
                  sx={{
                    color: footerTextColor,
                    fontWeight: 700,
                    letterSpacing: "0.01em",
                  }}
                >
                  Navigation
                </Typography>
                <Stack spacing={0.9}>
                  {footerLinks.map(
                    (link: { label: string; url: string }, linkIndex: number) => (
                      <Box
                        key={`${link.label}-${linkIndex}`}
                        component="a"
                        href={resolveFooterHref(link.url)}
                        {...getEditableTextProps(
                          section.blockId,
                          `${blockPath}.links.${linkIndex}.label`,
                          "single",
                        )}
                        sx={{
                          color: footerMutedColor,
                          fontWeight: 500,
                          fontSize: "0.95rem",
                          textDecoration: "none",
                          transition: "color 160ms ease",
                          "&:hover": {
                            color: footerTextColor,
                          },
                        }}
                      >
                        {link.label}
                      </Box>
                    ),
                  )}
                </Stack>
              </Stack>

              <Stack spacing={1.1}>
                <Typography
                  sx={{
                    color: footerTextColor,
                    fontWeight: 700,
                    letterSpacing: "0.01em",
                  }}
                >
                  Contact
                </Typography>
                <Typography
                  {...getEditableTextProps(
                    section.blockId,
                    `${blockPath}.contactEmail`,
                    "single",
                  )}
                  sx={{ color: footerMutedColor, lineHeight: 1.8 }}
                >
                  {block.content?.contactEmail || "hello@yourcompany.com"}
                </Typography>
                <Typography
                  {...getEditableTextProps(
                    section.blockId,
                    `${blockPath}.contactPhone`,
                    "single",
                  )}
                  sx={{ color: footerMutedColor, lineHeight: 1.8 }}
                >
                  {block.content?.contactPhone || "+1 (555) 123-4567"}
                </Typography>
                <Typography
                  {...getEditableTextProps(
                    section.blockId,
                    `${blockPath}.contactAddress`,
                    "multi",
                  )}
                  sx={{ color: footerMutedColor, lineHeight: 1.8 }}
                >
                  {block.content?.contactAddress ||
                    "123 Business Avenue, New York, NY 10001"}
                </Typography>
              </Stack>

              <Stack spacing={1.2}>
                <Typography
                  sx={{
                    color: footerTextColor,
                    fontWeight: 700,
                    letterSpacing: "0.01em",
                  }}
                >
                  Stay updated
                </Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.05}>
                  <TextField
                    size="small"
                    fullWidth
                    placeholder={block.content?.placeholder || "Enter your email"}
                    sx={{
                      "& .MuiInputBase-root": {
                        color: footerTextColor,
                        bgcolor: "rgba(255,255,255,0.04)",
                        borderRadius: "999px",
                        pr: 0.5,
                      },
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(248,250,252,0.14)",
                      },
                      "& .MuiInputBase-input::placeholder": {
                        color: "rgba(248,250,252,0.48)",
                        opacity: 1,
                      },
                    }}
                  />
                  <Button
                    variant="contained"
                    {...getEditableTextProps(
                      section.blockId,
                      `${blockPath}.buttonText`,
                      "single",
                    )}
                    sx={{
                      bgcolor: "#ffffff",
                      color: "#0f1115",
                      borderRadius: "999px",
                      textTransform: "none",
                      px: 2.8,
                      py: 1.05,
                      whiteSpace: "nowrap",
                      boxShadow: "none",
                      minWidth: "fit-content",
                      fontWeight: 700,
                      ...buttonStyle,
                    }}
                  >
                    {block.content?.buttonText || "Subscribe"}
                  </Button>
                </Stack>
              </Stack>
            </Box>

            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={{ xs: 1.2, md: 2 }}
              alignItems={{ xs: "flex-start", md: "center" }}
              justifyContent="space-between"
              sx={{
                width: "100%",
                mt: { xs: 2.5, md: 3 },
                pt: 1.8,
                borderTop: `1px solid ${footerLineColor}`,
              }}
            >
              <Typography sx={{ color: footerMutedColor, fontSize: "0.92rem" }}>
                Built for modern company websites.
              </Typography>
              <Typography
                {...getEditableTextProps(
                  section.blockId,
                  `${blockPath}.copyright`,
                  "single",
                )}
                sx={{
                  color: footerMutedColor,
                  fontSize: "0.92rem",
                  lineHeight: 1.6,
                  textAlign: { xs: "left", md: "right" },
                  whiteSpace: "normal",
                  ...bodyStyle,
                }}
              >
                {block.content?.copyright ||
                  "(c) 2026 Your company. All rights reserved."}
              </Typography>
            </Stack>
          </Box>
        </Stack>
      );
    }

    if (blockType === "pricing") {
      const plans = Array.isArray(block.content?.plans)
        ? block.content.plans
        : [];
      return (
        <Stack
          key={String(block.id || `${blockType}-${index}`)}
          spacing={2}
          {...compoundBlockSelectionProps}
          data-preview-label={compoundBlockLabel}
          sx={compoundCardSx}
        >
          <Typography
            {...getEditableTextProps(
              section.blockId,
              `${blockPath}.heading`,
              "multi",
            )}
            sx={{
              color: textColor,
              fontFamily: headingFont,
              fontWeight: 800,
              fontSize: { xs: "1.4rem", md: "2rem" },
              ...headingStyle,
            }}
          >
            {block.content?.heading || "Simple pricing"}
          </Typography>
          <Typography
            {...getEditableTextProps(
              section.blockId,
              `${blockPath}.body`,
              "multi",
            )}
            sx={{ color: mutedTextColor, lineHeight: 1.75, ...bodyStyle }}
          >
            {block.content?.body ||
              "Choose a plan that fits your business stage."}
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, minmax(0, 1fr))",
              },
              gap: 1.5,
            }}
          >
            {plans.map((plan: Record<string, any>, planIndex: number) => (
              <Box
                key={`plan-${planIndex}`}
                sx={{
                  p: 2.2,
                  borderRadius: "20px",
                  bgcolor:
                    tone === "light" ? "rgba(255,255,255,0.08)" : "#ffffff",
                  border: `1px solid ${rgba(themeColor, 0.12)}`,
                }}
              >
                <Typography sx={{ color: textColor, fontWeight: 700 }}>
                  {plan?.name || `Plan ${planIndex + 1}`}
                </Typography>
                <Typography
                  sx={{
                    mt: 0.4,
                    color: themeColor,
                    fontFamily: headingFont,
                    fontSize: "1.6rem",
                    fontWeight: 800,
                  }}
                >
                  {plan?.price || "$49"}
                </Typography>
                <Stack spacing={0.5} sx={{ mt: 1.1 }}>
                  {(Array.isArray(plan?.features) ? plan.features : []).map(
                    (feature: string, featureIndex: number) => (
                      <Typography
                        key={`${feature}-${featureIndex}`}
                        sx={{ color: mutedTextColor, fontSize: "0.94rem" }}
                      >
                        • {feature}
                      </Typography>
                    ),
                  )}
                </Stack>
              </Box>
            ))}
          </Box>
        </Stack>
      );
    }

    if (blockType === "countdown") {
      return (
        <Stack
          key={String(block.id || `${blockType}-${index}`)}
          spacing={2}
          {...compoundBlockSelectionProps}
          data-preview-label={compoundBlockLabel}
          sx={compoundCardSx}
        >
          <Typography
            {...getEditableTextProps(
              section.blockId,
              `${blockPath}.heading`,
              "multi",
            )}
            sx={{
              color: textColor,
              fontFamily: headingFont,
              fontWeight: 800,
              fontSize: { xs: "1.4rem", md: "2rem" },
              ...headingStyle,
            }}
          >
            {block.content?.heading || "Launch countdown"}
          </Typography>
          <Typography
            {...getEditableTextProps(
              section.blockId,
              `${blockPath}.body`,
              "multi",
            )}
            sx={{ color: mutedTextColor, lineHeight: 1.75, ...bodyStyle }}
          >
            {block.content?.body ||
              "Build urgency for your upcoming launch or event."}
          </Typography>
          <Stack direction="row" spacing={1.2} flexWrap="wrap">
            {[
              { label: "Days", value: block.content?.days || "12" },
              { label: "Hours", value: block.content?.hours || "08" },
              { label: "Minutes", value: block.content?.minutes || "44" },
            ].map((part) => (
              <Box
                key={part.label}
                sx={{
                  minWidth: 104,
                  p: 1.6,
                  borderRadius: "18px",
                  bgcolor:
                    tone === "light" ? "rgba(255,255,255,0.08)" : "#ffffff",
                  border: `1px solid ${rgba(themeColor, 0.12)}`,
                  textAlign: "center",
                }}
              >
                <Typography
                  sx={{
                    color: textColor,
                    fontFamily: headingFont,
                    fontWeight: 800,
                    fontSize: "1.6rem",
                  }}
                >
                  {part.value}
                </Typography>
                <Typography
                  sx={{
                    color: mutedTextColor,
                    fontSize: "0.82rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  {part.label}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Stack>
      );
    }

    if (blockType === "testimonials" || blockType === "reviews") {
      return (
        <Stack
          key={String(block.id || `${blockType}-${index}`)}
          spacing={1.35}
          {...compoundBlockSelectionProps}
          data-preview-label={compoundBlockLabel}
          sx={compoundCardSx}
        >
          <Typography
            {...getEditableTextProps(
              section.blockId,
              `${blockPath}.heading`,
              "single",
            )}
            sx={{ color: textColor, fontWeight: 700, ...headingStyle }}
          >
            {block.content?.heading || "What clients say"}
          </Typography>
          <Typography
            {...getEditableTextProps(
              section.blockId,
              `${blockPath}.quote`,
              "multi",
            )}
            sx={{
              color: textColor,
              fontFamily: headingFont,
              fontSize: { xs: "1.3rem", md: "1.8rem" },
              lineHeight: 1.25,
              fontWeight: 700,
              ...bodyStyle,
            }}
          >
            {block.content?.quote ||
              "Share a strong testimonial or review here."}
          </Typography>
          <Typography
            {...getEditableTextProps(
              section.blockId,
              `${blockPath}.author`,
              "single",
            )}
            sx={{ color: mutedTextColor, fontWeight: 600, ...textStyle }}
          >
            {block.content?.author || "A satisfied client"}
            {block.content?.role ? `, ${block.content.role}` : ""}
          </Typography>
        </Stack>
      );
    }

    if (blockType === "stats") {
      const items = Array.isArray(block.content?.items)
        ? block.content.items
        : [];
      return (
        <Stack
          key={String(block.id || `${blockType}-${index}`)}
          spacing={2}
          {...compoundBlockSelectionProps}
          data-preview-label={compoundBlockLabel}
          sx={compoundCardSx}
        >
          <Typography
            {...getEditableTextProps(
              section.blockId,
              `${blockPath}.heading`,
              "single",
            )}
            sx={{ color: textColor, fontWeight: 700, ...headingStyle }}
          >
            {block.content?.heading || "Key numbers"}
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, minmax(0, 1fr))",
                md: "repeat(3, minmax(0, 1fr))",
              },
              gap: 1.25,
            }}
          >
            {items.map((item: Record<string, any>, itemIndex: number) => (
              <Box
                key={`stat-${itemIndex}`}
                sx={{
                  p: 1.8,
                  borderRadius: "18px",
                  bgcolor:
                    tone === "light" ? "rgba(255,255,255,0.08)" : "#ffffff",
                  border: `1px solid ${rgba(themeColor, 0.12)}`,
                }}
              >
                <Typography
                  sx={{
                    color: textColor,
                    fontFamily: headingFont,
                    fontSize: "1.55rem",
                    fontWeight: 800,
                  }}
                >
                  {item?.value || "100+"}
                </Typography>
                <Typography sx={{ color: mutedTextColor, fontSize: "0.92rem" }}>
                  {item?.label || "Metric"}
                </Typography>
              </Box>
            ))}
          </Box>
        </Stack>
      );
    }

    if (blockType === "logo_carousel") {
      const items = Array.isArray(block.content?.items)
        ? block.content.items
        : [];
      return (
        <Stack
          key={String(block.id || `${blockType}-${index}`)}
          spacing={1.4}
          {...compoundBlockSelectionProps}
          data-preview-label={compoundBlockLabel}
          sx={compoundCardSx}
        >
          <Typography
            {...getEditableTextProps(
              section.blockId,
              `${blockPath}.heading`,
              "single",
            )}
            sx={{ color: textColor, fontWeight: 700, ...headingStyle }}
          >
            {block.content?.heading || "Trusted by modern teams"}
          </Typography>
          <Stack direction="row" spacing={1.1} flexWrap="wrap">
            {items.map((logo: string, logoIndex: number) => (
              <Chip
                key={`${logo}-${logoIndex}`}
                label={logo}
                sx={{
                  bgcolor:
                    tone === "light" ? "rgba(255,255,255,0.12)" : "#ffffff",
                  color: textColor,
                  border: `1px solid ${rgba(themeColor, 0.12)}`,
                  fontWeight: 700,
                }}
              />
            ))}
          </Stack>
        </Stack>
      );
    }

    if (blockType === "map_location" || blockType === "menu_display") {
      const items = Array.isArray(block.content?.locations)
        ? block.content.locations
        : Array.isArray(block.content?.items)
          ? block.content.items
          : [];
      return (
        <Stack
          key={String(block.id || `${blockType}-${index}`)}
          spacing={2}
          {...compoundBlockSelectionProps}
          data-preview-label={compoundBlockLabel}
          sx={compoundCardSx}
        >
          <Typography
            {...getEditableTextProps(
              section.blockId,
              `${blockPath}.heading`,
              "single",
            )}
            sx={{
              color: textColor,
              fontFamily: headingFont,
              fontWeight: 800,
              fontSize: { xs: "1.35rem", md: "1.9rem" },
              ...headingStyle,
            }}
          >
            {block.content?.heading || block.label || "Block content"}
          </Typography>
          {block.content?.body ? (
            <Typography
              {...getEditableTextProps(
                section.blockId,
                `${blockPath}.body`,
                "multi",
              )}
              sx={{ color: mutedTextColor, lineHeight: 1.75, ...bodyStyle }}
            >
              {block.content?.body}
            </Typography>
          ) : null}
          <Stack spacing={1}>
            {items.map((entry: any, entryIndex: number) => (
              <Box
                key={`entry-${entryIndex}`}
                sx={{
                  p: 1.5,
                  borderRadius: "16px",
                  bgcolor:
                    tone === "light" ? "rgba(255,255,255,0.08)" : "#ffffff",
                  border: `1px solid ${rgba(themeColor, 0.12)}`,
                }}
              >
                <Typography sx={{ color: textColor, fontWeight: 700 }}>
                  {typeof entry === "string"
                    ? entry
                    : entry?.name || `Item ${entryIndex + 1}`}
                </Typography>
                {typeof entry === "object" && entry?.price ? (
                  <Typography
                    sx={{ color: mutedTextColor, fontSize: "0.92rem" }}
                  >
                    {entry.price}
                  </Typography>
                ) : null}
              </Box>
            ))}
          </Stack>
        </Stack>
      );
    }

    if (blockType === "story_panel") {
      const stories = Array.isArray(block.content?.stories)
        ? block.content.stories
        : [];
      const activeStory = stories[0];
      return (
        <Stack
          key={String(block.id || `${blockType}-${index}`)}
          spacing={2}
          {...compoundBlockSelectionProps}
          data-preview-label={compoundBlockLabel}
          sx={compoundCardSx}
        >
          <Typography
            {...getEditableTextProps(
              section.blockId,
              `${blockPath}.heading`,
              "single",
            )}
            sx={{
              color: textColor,
              fontFamily: headingFont,
              fontWeight: 800,
              fontSize: { xs: "1.4rem", md: "2rem" },
              ...headingStyle,
            }}
          >
            {block.content?.heading || "Stories that explain the offer"}
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "220px 1fr" },
              gap: 1.5,
            }}
          >
            <Stack spacing={1}>
              {stories.map((story: Record<string, any>, storyIndex: number) => (
                <Box
                  key={`story-${storyIndex}`}
                  sx={{
                    p: 1.5,
                    borderRadius: "16px",
                    bgcolor:
                      storyIndex === 0
                        ? rgba(themeColor, 0.12)
                        : tone === "light"
                          ? "rgba(255,255,255,0.08)"
                          : "#ffffff",
                    border: `1px solid ${rgba(themeColor, 0.12)}`,
                  }}
                >
                  <Typography sx={{ color: textColor, fontWeight: 700 }}>
                    {story?.title || `Story ${storyIndex + 1}`}
                  </Typography>
                  {story?.subtitle ? (
                    <Typography
                      sx={{
                        mt: 0.35,
                        color: mutedTextColor,
                        fontSize: "0.88rem",
                      }}
                    >
                      {story.subtitle}
                    </Typography>
                  ) : null}
                </Box>
              ))}
            </Stack>
            <Box
              sx={{
                p: 2,
                borderRadius: "20px",
                bgcolor:
                  tone === "light" ? "rgba(255,255,255,0.08)" : "#ffffff",
                border: `1px solid ${rgba(themeColor, 0.12)}`,
              }}
            >
              {activeStory?.image ? (
                <Box
                  component="img"
                  src={activeStory.image}
                  alt={activeStory?.title || "Story image"}
                  sx={{
                    width: "100%",
                    height: 220,
                    objectFit: "cover",
                    borderRadius: "16px",
                    mb: 1.5,
                  }}
                />
              ) : null}
              <Typography
                sx={{ color: textColor, fontWeight: 700, fontSize: "1.1rem" }}
              >
                {activeStory?.title || "Story highlight"}
              </Typography>
              {activeStory?.body ? (
                <Typography
                  sx={{ mt: 0.8, color: mutedTextColor, lineHeight: 1.75 }}
                >
                  {activeStory.body}
                </Typography>
              ) : null}
            </Box>
          </Box>
        </Stack>
      );
    }

    if (blockType === "working_hours") {
      const hours = Array.isArray(block.content?.hours)
        ? block.content.hours
        : [];
      return (
        <Stack
          key={String(block.id || `${blockType}-${index}`)}
          spacing={2}
          {...compoundBlockSelectionProps}
          data-preview-label={compoundBlockLabel}
          sx={compoundCardSx}
        >
          <Typography
            {...getEditableTextProps(
              section.blockId,
              `${blockPath}.heading`,
              "single",
            )}
            sx={{
              color: textColor,
              fontFamily: headingFont,
              fontWeight: 800,
              fontSize: { xs: "1.35rem", md: "1.9rem" },
              ...headingStyle,
            }}
          >
            {block.content?.heading || "Working hours"}
          </Typography>
          <Stack spacing={1}>
            {hours.map((entry: Record<string, any>, entryIndex: number) => (
              <Stack
                key={`hours-${entryIndex}`}
                direction="row"
                justifyContent="space-between"
                sx={{
                  p: 1.4,
                  borderRadius: "16px",
                  bgcolor:
                    tone === "light" ? "rgba(255,255,255,0.08)" : "#ffffff",
                  border: `1px solid ${rgba(themeColor, 0.12)}`,
                }}
              >
                <Typography sx={{ color: textColor, fontWeight: 700 }}>
                  {entry?.day || `Day ${entryIndex + 1}`}
                </Typography>
                <Typography sx={{ color: mutedTextColor }}>
                  {entry?.isClosed
                    ? "Closed"
                    : `${entry?.openTime || "--:--"} - ${entry?.closeTime || "--:--"}`}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Stack>
      );
    }

    if (blockType === "social_embed" || blockType === "embed") {
      const embeds =
        blockType === "social_embed" && Array.isArray(block.content?.embeds)
          ? block.content.embeds
          : [
              {
                platform: "embed",
                url: block.content?.url,
                caption: block.content?.heading,
              },
            ];
      return (
        <Stack
          key={String(block.id || `${blockType}-${index}`)}
          spacing={2}
          {...compoundBlockSelectionProps}
          data-preview-label={compoundBlockLabel}
          sx={compoundCardSx}
        >
          <Typography
            {...getEditableTextProps(
              section.blockId,
              `${blockPath}.heading`,
              "single",
            )}
            sx={{
              color: textColor,
              fontFamily: headingFont,
              fontWeight: 800,
              fontSize: { xs: "1.35rem", md: "1.9rem" },
              ...headingStyle,
            }}
          >
            {block.content?.heading || "Embedded content"}
          </Typography>
          <Stack spacing={1}>
            {embeds.map((embed: Record<string, any>, embedIndex: number) => (
              <Box
                key={`embed-${embedIndex}`}
                sx={{
                  p: 2,
                  borderRadius: "18px",
                  bgcolor:
                    tone === "light" ? "rgba(255,255,255,0.08)" : "#ffffff",
                  border: `1px solid ${rgba(themeColor, 0.12)}`,
                }}
              >
                <Typography
                  sx={{
                    color: textColor,
                    fontWeight: 700,
                    textTransform: "capitalize",
                  }}
                >
                  {embed?.platform || "Embed"}
                </Typography>
                <Typography
                  sx={{
                    mt: 0.5,
                    color: mutedTextColor,
                    wordBreak: "break-all",
                  }}
                >
                  {embed?.url || "Add a valid URL from the editor."}
                </Typography>
                {embed?.caption ? (
                  <Typography
                    sx={{ mt: 0.8, color: mutedTextColor, fontSize: "0.92rem" }}
                  >
                    {embed.caption}
                  </Typography>
                ) : null}
              </Box>
            ))}
          </Stack>
        </Stack>
      );
    }

    return (
      <Typography
        key={String(block.id || `${blockType}-${index}`)}
        {...getEditableTextProps(section.blockId, `${blockPath}.text`, "multi")}
        sx={{
          maxWidth: blockMaxWidth,
          fontSize: { xs: "1rem", md: "1.1rem" },
          lineHeight: 1.8,
          color: mutedTextColor,
          ...(canvas
            ? {
                width: "min(520px, calc(100% - 112px))",
                maxWidth: "520px",
              }
            : {}),
          ...canvasBaseSx,
          ...textStyle,
          transform: getCanvasTransform(textStyle.transform),
          ...(canvas
            ? {}
            : {
                width: "100%",
                maxWidth: "100%",
                fontSize: { xs: "1rem", sm: "1.05rem" },
                lineHeight: 1.8,
              }),
        }}
      >
        {block.content?.text || "Add your text here."}
      </Typography>
    );
  };
  const renderSectionInnerBlocks = (
    section: Record<string, any>,
    options?: { tone?: "light" | "dark"; maxWidth?: number | string; mt?: any },
  ) => {
    const innerBlocks = Array.isArray(section.innerBlocks)
      ? section.innerBlocks
      : [];
    const isFooterOnlySection =
      innerBlocks.length === 1 &&
      String(innerBlocks[0]?.type || "").toLowerCase() === "footer";

    const getInnerBlockTransform = (block: Record<string, any>) => {
      const blockType = String(block?.type || "text").toLowerCase();
      if (blockType === "heading")
        return block?.content?.headingStyle?.transform;
      if (blockType === "button")
        return block?.content?.buttonTextStyle?.transform;
      if (blockType === "image") return block?.content?.imageStyle?.transform;
      if (
        blockType === "cta" ||
        blockType === "newsletter" ||
        blockType === "contact" ||
        blockType === "form_builder" ||
        blockType === "reservation_form" ||
        blockType === "generic_card" ||
        blockType === "hero" ||
        blockType === "image_text_split" ||
        blockType === "features" ||
        blockType === "faq" ||
        blockType === "navigation_bar" ||
        blockType === "footer" ||
        blockType === "pricing" ||
        blockType === "countdown" ||
        blockType === "testimonials" ||
        blockType === "reviews" ||
        blockType === "stats" ||
        blockType === "logo_carousel" ||
        blockType === "map_location" ||
        blockType === "menu_display" ||
        blockType === "announcement_bar"
      ) {
        return block?.content?.cardStyle?.transform;
      }
      return block?.content?.textStyle?.transform;
    };

    const getTransformPoint = (transformValue: any) => {
      if (typeof transformValue !== "string") {
        return { x: 0, y: 0 };
      }
      const match =
        /translate(?:3d)?\(\s*(-?\d+(?:\.\d+)?)px(?:,\s*|\s+)(-?\d+(?:\.\d+)?)px/i.exec(
          transformValue,
        );
      if (!match) {
        return { x: 0, y: 0 };
      }
      return {
        x: Number(match[1]) || 0,
        y: Number(match[2]) || 0,
      };
    };

    const innerBlockEntries = innerBlocks.map((block, index) => ({
      block,
      index,
      point: getTransformPoint(getInnerBlockTransform(block)),
    }));

    const getInnerBlockEstimatedHeight = (
      entry: (typeof innerBlockEntries)[number],
    ) => {
      const type = String(entry.block?.type || "text").toLowerCase();
      const cardHeight = Number(entry.block?.content?.cardStyle?.height);
      const imageHeight = Number(entry.block?.content?.imageStyle?.height);
      const textHeight = Number(entry.block?.content?.textStyle?.height);

      if (Number.isFinite(cardHeight) && cardHeight > 0) {
        return cardHeight;
      }
      if (Number.isFinite(imageHeight) && imageHeight > 0) {
        return imageHeight;
      }
      if (Number.isFinite(textHeight) && textHeight > 0) {
        return textHeight;
      }

      if (type === "heading") return 120;
      if (type === "text" || type === "paragraph" || type === "label")
        return 110;
      if (type === "button") return 64;
      if (type === "image") return 320;
      if (type === "video") return 420;
      if (
        type === "cta" ||
        type === "newsletter" ||
        type === "contact" ||
        type === "form_builder" ||
        type === "reservation_form" ||
        type === "generic_card" ||
        type === "hero" ||
        type === "image_text_split" ||
        type === "features" ||
        type === "faq" ||
        type === "navigation_bar" ||
        type === "footer" ||
        type === "pricing" ||
        type === "countdown" ||
        type === "testimonials" ||
        type === "reviews" ||
        type === "stats" ||
        type === "logo_carousel" ||
        type === "map_location" ||
        type === "menu_display" ||
        type === "announcement_bar"
      ) {
        return 180;
      }
      if (type === "divider" || type === "spacer") return 32;
      return 120;
    };

    const xValues = innerBlockEntries.map((entry) => entry.point.x);
    const minX = xValues.length ? Math.min(...xValues) : 0;
    const maxX = xValues.length ? Math.max(...xValues) : 0;
    const splitX = minX + (maxX - minX) * 0.46;
    const isLikelyMultiColumn = maxX - minX > 220;
    const canvasAutoMinHeight = innerBlockEntries.length
      ? Math.max(
          220,
          ...innerBlockEntries.map(
            (entry) => entry.point.y + getInnerBlockEstimatedHeight(entry) + 80,
          ),
        )
      : 360;

    const sortByPoint = (
      left: (typeof innerBlockEntries)[number],
      right: (typeof innerBlockEntries)[number],
    ) => {
      if (Math.abs(left.point.y - right.point.y) > 20) {
        return left.point.y - right.point.y;
      }
      return left.point.x - right.point.x;
    };

    const getResponsivePriority = (
      entry: (typeof innerBlockEntries)[number],
    ) => {
      const type = String(entry.block?.type || "text").toLowerCase();
      if (type === "eyebrow") {
        return -1;
      }
      if (type === "heading") {
        return 0;
      }
      if (type === "text" || type === "paragraph" || type === "label") {
        return 1;
      }
      if (
        type === "button" ||
        type === "announcement_bar" ||
        type === "cta" ||
        type === "contact" ||
        type === "newsletter" ||
        type === "form_builder" ||
        type === "reservation_form" ||
        type === "pricing" ||
        type === "countdown" ||
        type === "testimonials" ||
        type === "reviews" ||
        type === "stats" ||
        type === "features" ||
        type === "faq" ||
        type === "navigation_bar" ||
        type === "footer" ||
        type === "logo_carousel" ||
        type === "map_location" ||
        type === "menu_display" ||
        type === "generic_card"
      ) {
        return 2;
      }
      if (
        type === "image" ||
        type === "hero" ||
        type === "image_text_split" ||
        type === "split_text_image" ||
        type === "image_split_text" ||
        type === "video"
      ) {
        return 3;
      }
      if (type === "divider" || type === "spacer") {
        return 4;
      }
      return 5;
    };

    const sortByResponsiveFlow = (
      left: (typeof innerBlockEntries)[number],
      right: (typeof innerBlockEntries)[number],
    ) => {
      const priorityDelta =
        getResponsivePriority(left) - getResponsivePriority(right);
      if (priorityDelta !== 0) {
        return priorityDelta;
      }
      if (Math.abs(left.point.y - right.point.y) > 20) {
        return left.point.y - right.point.y;
      }
      if (Math.abs(left.point.x - right.point.x) > 20) {
        return left.point.x - right.point.x;
      }
      return left.index - right.index;
    };

    const orderedInnerBlocks = options?.canvas
      ? innerBlocks
      : isLikelyMultiColumn
        ? [...innerBlockEntries].sort(sortByResponsiveFlow)
        : [...innerBlockEntries].sort(sortByResponsiveFlow);

    if (!innerBlocks.length) {
      return null;
    }

    return (
      <Box
        sx={{
          width: "100%",
          mt: options?.mt ?? (isFooterOnlySection ? 0 : { xs: 2.5, md: 3 }),
          display: options?.canvas ? "block" : "flex",
          flexDirection: options?.canvas ? undefined : "column",
          alignItems: options?.canvas ? undefined : "flex-start",
          gap: options?.canvas ? undefined : 2,
          position: options?.canvas ? "relative" : "static",
          minHeight: options?.canvas ? "inherit" : undefined,
        }}
      >
        {orderedInnerBlocks.map((entry, orderedIndex) =>
          renderCustomInnerBlock(
            section,
            options?.canvas ? entry : entry.block,
            options?.canvas ? orderedIndex : entry.index,
            options,
          ),
        )}
      </Box>
    );
  };
  const customSectionNodes = customSections.map((section, index) => {
    const sectionKey = String(section.sectionKey || `plan-${index + 1}`);
    const blockId = section.blockId;
    const innerBlocks = Array.isArray(section.innerBlocks)
      ? section.innerBlocks
      : [];
    const isFooterOnlySection =
      innerBlocks.length === 1 &&
      String(innerBlocks[0]?.type || "").toLowerCase() === "footer";
    const isCompactFlowSection =
      innerBlocks.length > 0 &&
      innerBlocks.every(
        (block) => String(block?.type || "").toLowerCase() === "marquee",
      );
    const customSectionCanvasAutoMinHeight = innerBlocks.length
      ? Math.max(
          140,
          ...innerBlocks.map((block) => {
            const transformValue =
              block?.content?.cardStyle?.transform ||
              block?.content?.imageStyle?.transform ||
              block?.content?.headingStyle?.transform ||
              block?.content?.textStyle?.transform ||
              block?.content?.buttonTextStyle?.transform ||
              "none";
            const match =
              typeof transformValue === "string"
                ? /translate(?:3d)?\(\s*(-?\d+(?:\.\d+)?)px(?:,\s*|\s+)(-?\d+(?:\.\d+)?)px/i.exec(
                    transformValue,
                  )
                : null;
            const y = match ? Number(match[2]) || 0 : 0;
            const type = String(block?.type || "text").toLowerCase();
            const cardHeight = Number(block?.content?.cardStyle?.height);
            const imageHeight = Number(block?.content?.imageStyle?.height);
            const textHeight = Number(block?.content?.textStyle?.height);
            let estimatedHeight = 120;
            if (Number.isFinite(cardHeight) && cardHeight > 0) {
              estimatedHeight = cardHeight;
            } else if (Number.isFinite(imageHeight) && imageHeight > 0) {
              estimatedHeight = imageHeight;
            } else if (Number.isFinite(textHeight) && textHeight > 0) {
              estimatedHeight = textHeight;
            } else if (type === "button") {
              estimatedHeight = 64;
            } else if (type === "image") {
              estimatedHeight = 320;
            } else if (type === "video") {
              estimatedHeight = 420;
            } else if (type === "marquee") {
              estimatedHeight = 64;
            } else if (
              type === "cta" ||
              type === "newsletter" ||
              type === "contact" ||
              type === "form_builder" ||
              type === "reservation_form" ||
              type === "generic_card" ||
              type === "hero" ||
              type === "image_text_split" ||
              type === "features" ||
              type === "faq" ||
              type === "navigation_bar" ||
              type === "footer" ||
              type === "pricing" ||
              type === "countdown" ||
              type === "testimonials" ||
              type === "reviews" ||
              type === "stats" ||
              type === "logo_carousel" ||
              type === "map_location" ||
              type === "menu_display" ||
              type === "announcement_bar"
            ) {
              estimatedHeight = 180;
            } else if (type === "divider" || type === "spacer") {
              estimatedHeight = 32;
            } else if (type === "heading") {
              estimatedHeight = 120;
            } else if (
              type === "text" ||
              type === "paragraph" ||
              type === "label"
            ) {
              estimatedHeight = 110;
            }
            return Math.max(estimatedHeight + 24, y + estimatedHeight + 24);
          }),
        )
      : 360;
    const isAutoHeightSection =
      section.sectionStyle?.heightPreset === "auto" ||
      !section.sectionStyle?.heightPreset;
    const useDesktopCanvas =
      innerBlocks.length > 0 && !isCompactFlowSection && !isAutoHeightSection;
    const sectionLayoutWidth = section.sectionStyle?.layoutWidth || "full";
    const rawSectionSx = getSectionStyleSx(section);
    const sectionContentSx = { ...rawSectionSx };
    const sectionShellSx: Record<string, unknown> = {};

    if (sectionLayoutWidth === "page") {
      if (sectionContentSx.backgroundColor !== undefined) {
        sectionShellSx.backgroundColor = sectionContentSx.backgroundColor;
        delete sectionContentSx.backgroundColor;
      }
      if (sectionContentSx.backgroundImage !== undefined) {
        sectionShellSx.backgroundImage = sectionContentSx.backgroundImage;
        delete sectionContentSx.backgroundImage;
      }
      if (sectionContentSx.backgroundSize !== undefined) {
        sectionShellSx.backgroundSize = sectionContentSx.backgroundSize;
        delete sectionContentSx.backgroundSize;
      }
      if (sectionContentSx.backgroundPosition !== undefined) {
        sectionShellSx.backgroundPosition = sectionContentSx.backgroundPosition;
        delete sectionContentSx.backgroundPosition;
      }
      if (sectionContentSx.backgroundRepeat !== undefined) {
        sectionShellSx.backgroundRepeat = sectionContentSx.backgroundRepeat;
        delete sectionContentSx.backgroundRepeat;
      }
      if (sectionContentSx.backgroundAttachment !== undefined) {
        sectionShellSx.backgroundAttachment =
          sectionContentSx.backgroundAttachment;
        delete sectionContentSx.backgroundAttachment;
      }
      if (sectionContentSx.backgroundPositionY !== undefined) {
        sectionShellSx.backgroundPositionY =
          sectionContentSx.backgroundPositionY;
        delete sectionContentSx.backgroundPositionY;
      }
    }

    const sectionContentNode = (
      <Box
        id={sectionKey}
        data-preview-section="true"
        data-preview-label={section.label || "Plan Section"}
        data-preview-block-id={blockId}
        data-preview-style-key="sectionStyle"
        data-preview-accepts-inner-blocks="true"
        {...getSectionStyleDomProps(section)}
        sx={{
          width: "100%",
          minHeight: isAutoHeightSection
            ? "auto"
            : isCompactFlowSection
              ? "auto"
              : innerBlocks.length > 0
                ? { xs: "auto", md: 520 }
                : { xs: 360, md: 520 },
          backgroundColor:
            sectionLayoutWidth === "page" ? "transparent" : "#ffffff",
          display: "flex",
          alignItems: {
            xs: "stretch",
            md: isAutoHeightSection ? "stretch" : "center",
          },
          justifyContent: {
            xs: "flex-start",
            md: isAutoHeightSection ? "flex-start" : "center",
          },
          overflow: isAutoHeightSection ? "visible" : "hidden",
          ...sectionContentSx,
        }}
      >
        <Box
          sx={{
            width: "100%",
            minHeight: {
              xs: "auto",
              md: isAutoHeightSection ? "auto" : "inherit",
            },
            px: isFooterOnlySection ? 0 : { xs: 2, md: 4 },
            py: isFooterOnlySection
              ? 0
              : isCompactFlowSection
                ? { xs: 0.5, md: 0.75 }
                : innerBlocks.length > 0 && isAutoHeightSection
                  ? { xs: 2, md: 3 }
                  : { xs: 4, md: 6 },
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: {
              xs: "flex-start",
              md: isCompactFlowSection ? "flex-start" : "center",
            },
            gap: 2,
          }}
        >
          {innerBlocks.length > 0 ? (
            <>
              <Box
                sx={{
                  display: {
                    xs: "flex",
                    md: useDesktopCanvas ? "none" : "flex",
                  },
                  width: "100%",
                }}
              >
                {renderSectionInnerBlocks(section, {
                  tone: "dark",
                  maxWidth: "100%",
                  mt:
                    isCompactFlowSection || isAutoHeightSection ? 0 : undefined,
                })}
              </Box>
              <Box
                sx={{
                  display: {
                    xs: "none",
                    md: useDesktopCanvas ? "block" : "none",
                  },
                  width: "100%",
                  minHeight: "inherit",
                  position: "relative",
                }}
              >
                {innerBlocks.map((block, blockIndex) =>
                  renderCustomInnerBlock(section, block, blockIndex, {
                    canvas: true,
                  }),
                )}
              </Box>
            </>
          ) : (
            <>
              <Typography
                {...getEditableTextProps(blockId, "heading", "single")}
                sx={{
                  fontFamily: headingFont,
                  fontSize: { xs: "2rem", md: "3.6rem" },
                  lineHeight: 0.96,
                  letterSpacing: "-0.06em",
                  fontWeight: 800,
                  color: palette.ink,
                  maxWidth: 880,
                  ...(section.headingStyle || {}),
                }}
              >
                {section.heading}
              </Typography>
              <Typography
                {...getEditableTextProps(blockId, "subheading", "multi")}
                sx={{
                  maxWidth: 780,
                  color: palette.muted,
                  fontSize: { xs: "1rem", md: "1.08rem" },
                  lineHeight: 1.8,
                  ...(section.subheadingStyle || {}),
                }}
              >
                {section.subheading}
              </Typography>
              {section.buttonText ? (
                <Button
                  variant="contained"
                  {...getEditableTextProps(blockId, "buttonText", "single")}
                  sx={{
                    mt: 0.5,
                    bgcolor: themeColor,
                    color: palette.white,
                    borderRadius: "16px",
                    textTransform: "none",
                    px: 2.8,
                    py: 1.2,
                    fontWeight: 700,
                    boxShadow: "none",
                    ...(section.buttonTextStyle || {}),
                  }}
                >
                  {section.buttonText}
                </Button>
              ) : null}
            </>
          )}
        </Box>
      </Box>
    );

    return (
      <Box
        key={sectionKey}
        data-preview-section="true"
        data-preview-label={section.label || "Plan Section"}
        data-preview-block-id={blockId}
        data-preview-style-key="outerSectionStyle"
        {...getSectionStyleDomProps(section, "outerSectionStyle")}
        sx={{
          order:
            sectionPosition[sectionKey] ??
            defaultSectionOrder.length + index + 1,
          ...getSectionStyleSx(section, "outerSectionStyle"),
          ...sectionShellSx,
        }}
      >
        {sectionLayoutWidth === "page" ? (
          <Container maxWidth="xl" sx={{ px: { xs: 2, md: 4 } }}>
            {sectionContentNode}
          </Container>
        ) : (
          sectionContentNode
        )}
      </Box>
    );
  });
  const customSectionNodeMap = new Map(
    customSections.map((section, index) => [
      String(section.sectionKey || `plan-${index + 1}`),
      customSectionNodes[index],
    ]),
  );
  const renderCustomSectionsBefore = (anchorKey: string) => {
    const anchorIndex = resolvedSectionOrder.indexOf(anchorKey);
    if (anchorIndex <= 0) {
      return null;
    }

    const nodes = [];
    for (let index = anchorIndex - 1; index >= 0; index -= 1) {
      const key = resolvedSectionOrder[index];
      if (
        defaultSectionOrder.includes(
          key as (typeof defaultSectionOrder)[number],
        )
      ) {
        break;
      }
      const node = customSectionNodeMap.get(key);
      if (node) {
        nodes.unshift(node);
      }
    }

    return nodes;
  };
  const renderCustomSectionsAfterLastDefault = () => {
    let lastDefaultIndex = -1;
    resolvedSectionOrder.forEach((key, index) => {
      if (
        defaultSectionOrder.includes(
          key as (typeof defaultSectionOrder)[number],
        )
      ) {
        lastDefaultIndex = index;
      }
    });

    return resolvedSectionOrder
      .slice(lastDefaultIndex + 1)
      .filter(
        (key) =>
          !defaultSectionOrder.includes(
            key as (typeof defaultSectionOrder)[number],
          ),
      )
      .map((key) => customSectionNodeMap.get(key))
      .filter(Boolean);
  };

  return (
    <Box
      sx={{
        background: pageBackground,
        color: palette.ink,
        fontFamily: bodyFont,
        minHeight: "100vh",
        overflowX: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        component="header"
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          backdropFilter: "blur(18px)",
          bgcolor: headerBackground,
          borderBottom: `1px solid ${rgba(themeColor, 0.14)}`,
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 2, md: 4 } }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ minHeight: 82 }}
          >
            <Typography
              sx={{
                fontFamily: headingFont,
                fontSize: { xs: "1.45rem", md: "1.8rem" },
                fontWeight: 800,
                letterSpacing: "-0.05em",
              }}
            >
              {data.name}
            </Typography>

            <Stack
              direction="row"
              spacing={3.5}
              sx={{ display: { xs: "none", md: "flex" } }}
            >
              {navItems.map((item) => (
                <Typography
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  {...getEditableTextProps(
                    overviewBlockId,
                    item.fieldPath,
                    "single",
                  )}
                  sx={{
                    cursor: "pointer",
                    color: palette.ink,
                    fontWeight: 500,
                    transition: "color 180ms ease",
                    "&:hover": { color: themeColor },
                  }}
                >
                  {item.label}
                </Typography>
              ))}
            </Stack>

            <Button
              onClick={() => scrollToSection("contact")}
              endIcon={<ArrowOutwardIcon />}
              {...getEditableTextProps(
                overviewBlockId,
                "contactPrimaryText",
                "single",
              )}
              sx={{
                color: palette.ink,
                textTransform: "none",
                fontWeight: 700,
                borderRadius: 999,
              }}
            >
              {homeContent.contactPrimaryText || contactPrimary}
            </Button>
          </Stack>
        </Container>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column" }}>
        {renderCustomSectionsBefore("overview")}
        <Box
          id="overview"
          {...getEditableSectionProps(overviewBlockId, "Overview")}
          data-preview-accepts-inner-blocks="true"
          {...getSectionStyleDomProps(homeContent)}
          sx={{
            order: sectionPosition["overview"] ?? 1,
            position: "relative",
            overflow: "hidden",
            bgcolor: themeColor,
            minHeight: { xs: 700, md: 760 },
            ...getSectionStyleSx(homeContent),
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background: `radial-gradient(circle at 12% 78%, ${rgba(
                themeColor,
                0.52,
              )}, transparent 30%), radial-gradient(circle at 78% 24%, ${rgba(
                themeColor,
                0.32,
              )}, transparent 24%), linear-gradient(135deg, ${themeHeroBase} 0%, ${themeHeroMid} 58%, ${themeHeroEnd} 100%)`,
            }}
          />

          <Box
            sx={{
              position: "absolute",
              inset: 0,
              opacity: 0.28,
              backgroundImage:
                "linear-gradient(135deg, rgba(255,255,255,0.08) 25%, transparent 25%), linear-gradient(225deg, rgba(255,255,255,0.08) 25%, transparent 25%)",
              backgroundSize: "260px 260px",
              backgroundPosition: "0 0, 130px 130px",
            }}
          />

          <Container
            maxWidth="xl"
            sx={{
              position: "relative",
              zIndex: 2,
              minHeight: { xs: 700, md: 760 },
              px: { xs: 2, md: 4 },
              pt: { xs: 4, md: 5 },
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "6fr 6fr" },
              alignItems: "center",
              gap: { xs: 4, md: 3 },
            }}
          >
            {/* Left content */}
            <Box
              component={motion.div}
              variants={heroStagger}
              initial="hidden"
              animate="show"
              sx={{
                position: "relative",
                zIndex: 3,
                width: "100%",
                pt: { xs: 8, md: 4 },
              }}
            >
              <Stack
                spacing={1.2}
                sx={{
                  maxWidth: { xs: "100%", md: 760 },
                }}
              >
                <Box component={motion.div} variants={fadeUp}>
                  <Chip
                    label={
                      homeContent.eyebrowText || "Trusted business partner"
                    }
                    data-editable="eyebrowText"
                    data-edit-type="single"
                    data-block-id={overviewBlockId}
                    sx={{
                      bgcolor: "rgba(255,255,255,0.14)",
                      color: palette.white,
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255,255,255,0.22)",
                      fontWeight: 700,
                    }}
                  />
                </Box>

                <Typography
                  component={motion.h1}
                  variants={fadeUp}
                  data-editable="heading"
                  data-edit-type="single"
                  data-block-id={overviewBlockId}
                  sx={{
                    fontFamily: headingFont,
                    fontSize: { xs: "3rem", md: "6.7rem" },
                    lineHeight: { xs: 0.94, md: 0.88 },
                    letterSpacing: "-0.08em",
                    fontWeight: 800,
                    color: palette.white,
                    maxWidth: 880,
                    ...(homeContent.headingStyle || {}),
                  }}
                >
                  {heroHeading}
                </Typography>

                <Stack
                  component={motion.div}
                  variants={fadeUp}
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.4}
                  sx={{ pt: 1.6 }}
                >
                  <Button
                    onClick={() => scrollToSection("about")}
                    variant="contained"
                    data-editable="ctaText"
                    data-edit-type="single"
                    data-block-id={overviewBlockId}
                    sx={{
                      bgcolor: palette.white,
                      color: palette.dark,
                      borderRadius: 999,
                      textTransform: "none",
                      px: 2.8,
                      py: 1.15,
                      fontWeight: 800,
                      boxShadow: "none",
                      ...(homeContent.ctaTextStyle || {}),
                      "&:hover": {
                        bgcolor: palette.white,
                        boxShadow: "none",
                        opacity: 0.92,
                      },
                    }}
                  >
                    {heroPrimaryCta}
                  </Button>

                  <Button
                    onClick={() => scrollToSection("contact")}
                    variant="outlined"
                    data-editable="primaryCtaText"
                    data-edit-type="single"
                    data-block-id={overviewBlockId}
                    sx={{
                      color: palette.white,
                      borderColor: "rgba(255,255,255,0.32)",
                      borderRadius: 999,
                      textTransform: "none",
                      px: 2.8,
                      py: 1.15,
                      fontWeight: 700,
                      ...(homeContent.ctaTextStyle || {}),
                    }}
                  >
                    {heroSecondaryCta}
                  </Button>
                </Stack>

                <Box
                  component={motion.div}
                  variants={fadeUp}
                  sx={{
                    mt: { xs: 4, md: 7 },
                    display: "flex",
                    alignItems: "center",
                    gap: 1.6,
                    flexWrap: "wrap",
                  }}
                >
                  <Stack direction="row" spacing={-1.2}>
                    {[
                      visualSet.avatarOne,
                      visualSet.avatarTwo,
                      visualSet.avatarThree,
                      visualSet.avatarOne,
                    ].map((avatar, index) => (
                      <Box
                        key={`${avatar}-${index}`}
                        component="img"
                        src={avatar}
                        alt={`Client ${index + 1}`}
                        sx={{
                          width: 54,
                          height: 54,
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: "2px solid rgba(255,255,255,0.92)",
                          boxShadow: "0 12px 24px rgba(0,0,0,0.24)",
                        }}
                      />
                    ))}
                  </Stack>

                  <Box>
                    <Typography
                      sx={{
                        color: themeHighlight,
                        fontWeight: 800,
                        letterSpacing: "0.16em",
                        fontSize: "0.95rem",
                      }}
                    >
                      ★★★★★
                    </Typography>

                    <Typography
                      sx={{
                        color: "rgba(255,255,255,0.92)",
                        fontSize: { xs: "1rem", md: "1.1rem" },
                        fontWeight: 700,
                      }}
                    >
                      100+ happy customers.
                    </Typography>
                  </Box>
                </Box>
                {overviewInnerBlocks.length
                  ? renderSectionInnerBlocks(homeContent, {
                      tone: "light",
                      maxWidth: 560,
                      mt: { xs: 3, md: 4 },
                    })
                  : null}
              </Stack>
            </Box>

            {/* Right image */}
            <Box
              sx={{
                position: "relative",
                zIndex: 3,
                width: "100%",
                height: { xs: 420, sm: 520, md: 700 },
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                overflow: "visible",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  left: { xs: "50%", md: "4%" },
                  top: { xs: 28, md: "38%" },
                  transform: "translate(-50%, -50%)",
                  zIndex: 4,
                  pointerEvents: "none",
                }}
              >
                <Box
                  component={motion.div}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.7, delay: 0.45 }}
                  sx={{
                    width: { xs: 80, md: 104 },
                    height: { xs: 80, md: 104 },
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    bgcolor: themeMuted,
                    border: `1px solid ${themeBorder}`,
                    boxShadow: `0 0 0 14px ${themeGlow}`,
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <VerifiedUserRoundedIcon
                    sx={{ color: palette.white, fontSize: { xs: 34, md: 44 } }}
                  />
                </Box>
              </Box>

              <Box
                component={motion.img}
                initial={{ opacity: 0, y: 40, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.9,
                  ease: [0.22, 1, 0.36, 1],
                  delay: 0.16,
                }}
                src={heroImage}
                alt="Executive portrait"
                {...getEditableImageProps(
                  homeContent.blockId,
                  "heroImage",
                  "Hero Image",
                )}
                sx={{
                  position: "relative",
                  zIndex: 3,
                  width: "100%",
                  height: "100%",
                  ...heroImageHeightSx,
                  objectFit: heroImageFit,
                  objectPosition: "bottom center",
                  filter: "drop-shadow(0 30px 80px rgba(0,0,0,0.35))",
                  cursor: "pointer",
                  pointerEvents: "auto",
                  borderRadius: heroImageStyle.borderRadius,
                  borderWidth: heroImageStyle.borderWidth,
                  borderColor: heroImageStyle.borderColor,
                  borderStyle: heroImageStyle.borderWidth ? "solid" : undefined,
                }}
              />
            </Box>
          </Container>
        </Box>

        {renderCustomSectionsBefore("about")}
        <Box
          data-preview-section="true"
          data-preview-label="About Parent"
          data-preview-block-id={aboutBlockId}
          data-preview-style-key="outerSectionStyle"
          {...getSectionStyleDomProps(aboutContent, "outerSectionStyle")}
          sx={{
            order: sectionPosition["about"] ?? 2,
            ...getSectionStyleSx(aboutContent, "outerSectionStyle"),
          }}
        >
          <Container maxWidth="xl" sx={{ px: { xs: 2, md: 4 } }}>
            <Box
              id="about"
              data-preview-section="true"
              data-preview-label="About"
              data-preview-block-id={aboutBlockId}
              data-preview-style-key="sectionStyle"
              data-preview-accepts-inner-blocks="true"
              {...getSectionStyleDomProps(aboutContent)}
              sx={{ py: { xs: 4, md: 6 }, ...getSectionStyleSx(aboutContent) }}
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "0.95fr 1.05fr" },
                  gap: { xs: 2, md: 3 },
                  alignItems: "stretch",
                }}
              >
                <Box
                  component={motion.div}
                  {...sectionReveal}
                  sx={{
                    position: "relative",
                    overflow: "hidden",
                    borderRadius: "34px",
                    minHeight: { xs: 420, md: 660 },
                  }}
                >
                  <Box
                    component="img"
                    src={aboutImage}
                    alt="Business collaboration"
                    data-edit-image="image"
                    data-image-label="About Image"
                    data-block-id={aboutBlockId}
                    sx={{
                      width: "100%",
                      height: "100%",
                      ...aboutImageHeightSx,
                      objectFit: aboutImageFit,
                      display: "block",
                      borderRadius: aboutImageStyle.borderRadius,
                      borderWidth: aboutImageStyle.borderWidth,
                      borderColor: aboutImageStyle.borderColor,
                      borderStyle: aboutImageStyle.borderWidth
                        ? "solid"
                        : undefined,
                    }}
                  />
                  <Box
                    component={motion.div}
                    {...sectionReveal}
                    sx={{
                      position: "absolute",
                      left: 20,
                      right: { xs: 20, md: "42%" },
                      bottom: 20,
                      p: { xs: 2, md: 2.3 },
                      borderRadius: "20px",
                      bgcolor: rgba(themeDeepest, 0.66),
                      color: palette.white,
                      backdropFilter: "blur(16px)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: headingFont,
                        fontSize: { xs: "1.35rem", md: "1.7rem" },
                        fontWeight: 800,
                        letterSpacing: "-0.04em",
                        mb: 1.5,
                      }}
                    >
                      Business progress
                    </Typography>

                    {[
                      { label: "Revenue", value: "82%" },
                      { label: "Satisfaction", value: "90%" },
                    ].map((item) => (
                      <Box key={item.label} sx={{ mb: 1.5 }}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          sx={{ mb: 0.5 }}
                        >
                          <Typography sx={{ color: "rgba(255,255,255,0.84)" }}>
                            {item.label}
                          </Typography>
                          <Typography sx={{ fontWeight: 700 }}>
                            {item.value}
                          </Typography>
                        </Stack>
                        <Box
                          sx={{
                            height: 4,
                            borderRadius: 999,
                            bgcolor: "rgba(255,255,255,0.14)",
                            overflow: "hidden",
                          }}
                        >
                          <Box
                            component={motion.div}
                            initial={{ width: 0 }}
                            whileInView={{ width: item.value }}
                            viewport={{ once: true, amount: 0.8 }}
                            transition={{
                              duration: 1,
                              delay: item.label === "Revenue" ? 0.15 : 0.3,
                              ease: [0.22, 1, 0.36, 1],
                            }}
                            sx={{
                              height: "100%",
                              bgcolor: themeColor,
                              borderRadius: 999,
                            }}
                          />
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    paddingRight: "20px",
                  }}
                >
                  <Box component={motion.div} {...sectionReveal}>
                    <Chip
                      label="Get to know us"
                      sx={{
                        bgcolor: themeColor,
                        color: palette.white,
                        borderRadius: "10px",
                        fontWeight: 700,
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                      }}
                    />

                    <Typography
                      data-editable="heading"
                      data-edit-type="single"
                      data-block-id={aboutBlockId}
                      sx={{
                        mt: 2.3,
                        fontFamily: headingFont,
                        fontSize: { xs: "2.35rem", md: "4.1rem" },
                        lineHeight: 0.96,
                        letterSpacing: "-0.07em",
                        fontWeight: 800,
                        maxWidth: 620,
                        ...(aboutContent.headingStyle || {}),
                      }}
                    >
                      {aboutHeading}
                    </Typography>

                    <Box
                      sx={{
                        mt: 2.5,
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                        gap: 1.5,
                      }}
                    >
                      {aboutDetailGroups.map((group, index) => (
                        <Box
                          key={group.title}
                          component={motion.div}
                          {...sectionReveal}
                          transition={{
                            ...sectionReveal.transition,
                            delay: index * 0.08,
                          }}
                          sx={{
                            p: { xs: 2.2, md: 2.6 },
                            borderRadius: "22px",
                            bgcolor: themeSurface,
                            border: `1px solid ${themeLine}`,
                          }}
                        >
                          <Typography
                            data-editable={`detailGroups.${index}.title`}
                            data-edit-type="single"
                            data-block-id={aboutBlockId}
                            sx={{
                              fontFamily: headingFont,
                              fontSize: { xs: "1.3rem", md: "1.6rem" },
                              fontWeight: 800,
                              letterSpacing: "-0.04em",
                            }}
                          >
                            {group.title}
                          </Typography>

                          <Stack spacing={0.9} sx={{ mt: 1.7 }}>
                            {(group.items || []).map((item, itemIndex) => (
                              <Stack
                                key={item}
                                direction="row"
                                spacing={1}
                                alignItems="center"
                              >
                                <Box
                                  sx={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: "50%",
                                    bgcolor: themeColor,
                                    flexShrink: 0,
                                  }}
                                />
                                <Typography
                                  data-editable={`detailGroups.${index}.items.${itemIndex}`}
                                  data-edit-type="single"
                                  data-block-id={aboutBlockId}
                                  sx={{ color: palette.muted }}
                                >
                                  {item}
                                </Typography>
                              </Stack>
                            ))}
                          </Stack>
                        </Box>
                      ))}
                    </Box>

                    <Button
                      variant="contained"
                      endIcon={<ArrowOutwardIcon />}
                      data-editable="ctaText"
                      data-edit-type="single"
                      data-block-id={aboutBlockId}
                      sx={{
                        mt: 2.2,
                        bgcolor: themeColor,
                        color: palette.white,
                        borderRadius: "16px",
                        textTransform: "none",
                        px: 2.6,
                        py: 1.15,
                        fontWeight: 700,
                        boxShadow: "none",
                        ...(aboutContent.buttonTextStyle ||
                          aboutContent.ctaTextStyle ||
                          {}),
                        "&:hover": {
                          bgcolor: themeColor,
                          boxShadow: "none",
                          opacity: 0.94,
                        },
                      }}
                    >
                      {heroPrimaryCta}
                    </Button>
                  </Box>
                </Box>
              </Box>
              {renderSectionInnerBlocks(aboutContent)}
            </Box>
          </Container>
        </Box>

        {renderCustomSectionsBefore("why-us")}
        <Box
          data-preview-section="true"
          data-preview-label="Why Choose Us Parent"
          data-preview-block-id={whyUsBlockId}
          data-preview-style-key="outerSectionStyle"
          {...getSectionStyleDomProps(featuresContent, "outerSectionStyle")}
          sx={{
            order: sectionPosition["why-us"] ?? 3,
            ...getSectionStyleSx(featuresContent, "outerSectionStyle"),
          }}
        >
          <Container maxWidth="xl" sx={{ px: { xs: 2, md: 4 } }}>
            <Box
              id="why-us"
              data-preview-section="true"
              data-preview-label="Why Choose Us"
              data-preview-block-id={whyUsBlockId}
              data-preview-style-key="sectionStyle"
              data-preview-accepts-inner-blocks="true"
              {...getSectionStyleDomProps(featuresContent)}
              sx={{
                py: { xs: 2, md: 3 },
                px: { xs: 2, md: 3 },
                mt: { xs: 1, md: 6 },
                mb: { xs: 1, md: 12 },
                borderRadius: "36px",
                bgcolor: themeColor,
                color: palette.white,
                overflow: "hidden",
                ...getSectionStyleSx(featuresContent),
              }}
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "0.95fr 1.05fr" },
                  gap: 2.2,
                  alignItems: "stretch",
                }}
              >
                <Box
                  component={motion.div}
                  {...sectionReveal}
                  sx={{
                    p: { xs: 2.5, md: 4 },
                    borderRadius: "34px",
                    bgcolor: "rgba(255,255,255,0.06)",
                    color: palette.white,
                    minHeight: 420,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    border: "1px solid rgba(255,255,255,0.12)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <Box>
                    <Typography
                      data-editable="eyebrowText"
                      data-edit-type="single"
                      data-block-id={whyUsBlockId}
                      sx={{ color: "rgba(255,255,255,0.66)", mb: 1 }}
                    >
                      {featuresContent.eyebrowText || "Why choose us"}
                    </Typography>
                    <Typography
                      data-editable="heading"
                      data-edit-type="single"
                      data-block-id={whyUsBlockId}
                      sx={{
                        fontFamily: headingFont,
                        fontSize: { xs: "2.1rem", md: "3.9rem" },
                        lineHeight: 0.96,
                        letterSpacing: "-0.07em",
                        fontWeight: 800,
                        maxWidth: 480,
                        ...(featuresContent.headingStyle || {}),
                      }}
                    >
                      {whyHeading}
                    </Typography>
                  </Box>

                  <Typography
                    data-editable="description"
                    data-edit-type="multi"
                    data-block-id={whyUsBlockId}
                    sx={{
                      mt: 3,
                      maxWidth: 420,
                      color: "rgba(255,255,255,0.72)",
                      lineHeight: 1.8,
                      fontSize: { xs: "1rem", md: "1.08rem" },
                      ...(featuresContent.descriptionStyle || {}),
                    }}
                  >
                    {whyBody}
                  </Typography>
                </Box>

                <Box
                  component={motion.div}
                  {...sectionReveal}
                  whileHover={{ y: -8 }}
                  ref={whyChooseImageRef}
                  {...getEditableImageProps(
                    whyUsBlockId,
                    "image",
                    "Why Choose Us Image",
                  )}
                  sx={{
                    overflow: "hidden",
                    borderRadius: "34px",
                    minHeight: 420,
                    border: "1px solid rgba(255,255,255,0.12)",
                    position: "relative",
                  }}
                >
                  <Box
                    component={motion.img}
                    src={whyUsImage}
                    alt="Business meeting room"
                    data-edit-image="image"
                    data-image-label="Why Choose Us Image"
                    data-block-id={whyUsBlockId}
                    style={{ scale: whyChooseImageScale }}
                    sx={{
                      width: "100%",
                      height: "100%",
                      ...whyUsImageHeightSx,
                      objectFit: whyUsImageFit,
                      display: "block",
                      transformOrigin: "center center",
                      borderRadius: whyUsImageStyle.borderRadius,
                      borderWidth: whyUsImageStyle.borderWidth,
                      borderColor: whyUsImageStyle.borderColor,
                      borderStyle: whyUsImageStyle.borderWidth
                        ? "solid"
                        : undefined,
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(180deg, rgba(0,0,0,0.04), rgba(0,0,0,0.32))",
                      pointerEvents: "none",
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      left: 24,
                      right: 24,
                      bottom: 24,
                      pointerEvents: "none",
                    }}
                  >
                    <Typography
                      data-editable="imageEyebrowText"
                      data-edit-type="single"
                      data-block-id={whyUsBlockId}
                      sx={{
                        color: "rgba(255,255,255,0.72)",
                        mb: 0.8,
                        pointerEvents: "auto",
                      }}
                    >
                      {whyImageEyebrow}
                    </Typography>
                    <Typography
                      data-editable="imageHeading"
                      data-edit-type="multi"
                      data-block-id={whyUsBlockId}
                      sx={{
                        fontFamily: headingFont,
                        fontSize: { xs: "1.55rem", md: "2.15rem" },
                        lineHeight: 1,
                        letterSpacing: "-0.04em",
                        fontWeight: 800,
                        color: palette.white,
                        maxWidth: 340,
                        pointerEvents: "auto",
                      }}
                    >
                      {whyImageHeading}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              {renderSectionInnerBlocks(featuresContent, {
                tone: "light",
                maxWidth: 680,
              })}
            </Box>
          </Container>
        </Box>

        {renderCustomSectionsBefore("process")}
        <Box
          sx={{
            order: sectionPosition["process"] ?? 4,
            ...getSectionStyleSx(processContent, "outerSectionStyle"),
          }}
          data-preview-section="true"
          data-preview-label="Work Parent"
          data-preview-block-id={processBlockId}
          data-preview-style-key="outerSectionStyle"
          {...getSectionStyleDomProps(processContent, "outerSectionStyle")}
        >
          <Container maxWidth="xl" sx={{ px: { xs: 2, md: 4 } }}>
            <Box
              id="work"
              data-preview-section="true"
              data-preview-label="Work"
              data-preview-block-id={processBlockId}
              data-preview-style-key="sectionStyle"
              data-preview-accepts-inner-blocks="true"
              {...getSectionStyleDomProps(processContent)}
              sx={{
                py: { xs: 5, md: 15 },
                px: { xs: 2, md: 4 },
                mx: { xs: -2, md: "calc(-50vw + 50%)" },
                mt: { xs: 2, md: 3 },
                background: `linear-gradient(180deg, ${themeDeep} 0%, ${themeDeepest} 100%)`,
                color: palette.white,
                overflow: "hidden",
                position: "relative",
                ...getSectionStyleSx(processContent),
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  opacity: 0.16,
                  backgroundImage:
                    "linear-gradient(100deg, rgba(255,255,255,0.08) 0 2px, transparent 2px 16px)",
                  backgroundSize: "18px 100%",
                  backgroundPosition: "left top",
                  pointerEvents: "none",
                }}
              />
              <Box
                sx={{
                  position: "relative",
                  zIndex: 1,
                  maxWidth: "1320px",
                  mx: "auto",
                }}
              >
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", md: "center" }}
                  spacing={2}
                  sx={{ mb: 3.2 }}
                >
                  <Box component={motion.div} {...sectionReveal}>
                    <Chip
                      label="Our process"
                      sx={{
                        bgcolor: rgba(themeColor, 0.18),
                        color: palette.white,
                        borderRadius: "10px",
                        fontWeight: 800,
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                        mb: 2.1,
                      }}
                    />
                    <Typography
                      data-editable="heading"
                      data-edit-type="single"
                      data-block-id={processBlockId}
                      sx={{
                        fontFamily: headingFont,
                        fontSize: { xs: "2.45rem", md: "4.5rem" },
                        lineHeight: 0.95,
                        letterSpacing: "-0.07em",
                        fontWeight: 800,
                        maxWidth: 680,
                        ...(processContent.headingStyle || {}),
                      }}
                    >
                      {processHeading}
                    </Typography>
                  </Box>

                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={2}
                    alignItems={{ xs: "flex-start", md: "center" }}
                  >
                    <Typography
                      component={motion.p}
                      {...sectionReveal}
                      data-editable="subheading"
                      data-edit-type="multi"
                      data-block-id={processBlockId}
                      sx={{
                        maxWidth: 360,
                        color: "rgba(255,255,255,0.7)",
                        lineHeight: 1.7,
                        ...(processContent.subheadingStyle ||
                          processContent.descriptionStyle ||
                          {}),
                      }}
                    >
                      {processDescription}
                    </Typography>

                    <Button
                      variant="contained"
                      endIcon={<ArrowOutwardIcon />}
                      data-editable="ctaText"
                      data-edit-type="single"
                      data-block-id={processBlockId}
                      sx={{
                        bgcolor: themeColor,
                        color: palette.white,
                        borderRadius: 999,
                        textTransform: "none",
                        px: 2.6,
                        py: 1.15,
                        fontWeight: 800,
                        boxShadow: "none",
                        ...(processContent.ctaTextStyle ||
                          processContent.buttonTextStyle ||
                          {}),
                        "&:hover": {
                          bgcolor: themeColor,
                          boxShadow: "none",
                          opacity: 0.94,
                        },
                      }}
                    >
                      {processCtaText}
                    </Button>
                  </Stack>
                </Stack>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
                    gap: 1.5,
                    alignItems: "stretch",
                    mt: 10.5,
                  }}
                >
                  {processItems.map((item, index) => (
                    <Box
                      key={`${String(item.icon || index)}-${String(item.title || "")}`}
                      component={motion.div}
                      {...sectionReveal}
                      transition={{
                        ...sectionReveal.transition,
                        delay: index * 0.08,
                      }}
                      sx={{
                        borderRadius: "28px",
                        minHeight: { xs: 240, md: 320 },
                        bgcolor: themeSurfaceStrong,
                        color: palette.ink,
                        p: { xs: 2.3, md: 2.6 },
                        position: "relative",
                        border: `1px solid ${themeLine}`,
                      }}
                    >
                      <Typography
                        data-editable={`items.${index}.icon`}
                        data-edit-type="single"
                        data-block-id={processBlockId}
                        sx={{
                          fontFamily: headingFont,
                          fontSize: { xs: "4rem", md: "5.4rem" },
                          lineHeight: 0.88,
                          letterSpacing: "-0.08em",
                          fontWeight: 800,
                          color: rgba(themeColor, 0.38),
                          mb: 2.2,
                        }}
                      >
                        {String(item.icon || `0${index + 1}`)}
                      </Typography>
                      <Typography
                        data-editable={`items.${index}.title`}
                        data-edit-type="single"
                        data-block-id={processBlockId}
                        sx={{
                          fontFamily: headingFont,
                          fontSize: { xs: "1.55rem", md: "1.85rem" },
                          lineHeight: 1.02,
                          letterSpacing: "-0.04em",
                          fontWeight: 800,
                          maxWidth: 280,
                        }}
                      >
                        {String(item.title || `Step ${index + 1}`)}
                      </Typography>
                      <Typography
                        data-editable={`items.${index}.description`}
                        data-edit-type="multi"
                        data-block-id={processBlockId}
                        sx={{
                          mt: 1.6,
                          color: palette.muted,
                          lineHeight: 1.65,
                          maxWidth: 320,
                        }}
                      >
                        {String(item.description || "")}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
              {renderSectionInnerBlocks(processContent, {
                tone: "light",
                maxWidth: 760,
              })}
            </Box>

            <Box sx={{ py: { xs: 4, md: 12 } }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1.05fr 0.95fr" },
                  gap: 2,
                }}
              >
                <Box
                  component={motion.div}
                  {...sectionReveal}
                  sx={{
                    overflow: "hidden",
                    borderRadius: "34px",
                    minHeight: { xs: 320, md: 560 },
                  }}
                >
                  <Box
                    component="img"
                    src={processImage}
                    alt="Company team"
                    data-edit-image="image"
                    data-image-label="Process Image"
                    data-block-id={processBlockId}
                    sx={{
                      width: "100%",
                      height: "100%",
                      ...processImageHeightSx,
                      objectFit: processImageFit,
                      display: "block",
                      borderRadius: processImageStyle.borderRadius,
                      borderWidth: processImageStyle.borderWidth,
                      borderColor: processImageStyle.borderColor,
                      borderStyle: processImageStyle.borderWidth
                        ? "solid"
                        : undefined,
                    }}
                  />
                </Box>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateRows: { xs: "auto auto", md: "1fr 1fr" },
                    gap: 1.5,
                  }}
                >
                  <Box
                    component={motion.div}
                    {...sectionReveal}
                    sx={{
                      p: { xs: 2.4, md: 3.2 },
                      borderRadius: "30px",
                      bgcolor: themeSurface,
                      border: `1px solid ${themeLine}`,
                    }}
                  >
                    <Typography
                      data-editable="teamLabel"
                      data-edit-type="single"
                      data-block-id={processBlockId}
                      sx={{ color: palette.muted, mb: 1 }}
                    >
                      {processContent.teamLabel || "Team"}
                    </Typography>
                    <Typography
                      data-editable="teamHeading"
                      data-edit-type="single"
                      data-block-id={processBlockId}
                      sx={{
                        fontFamily: headingFont,
                        fontSize: { xs: "2rem", md: "3.4rem" },
                        lineHeight: 0.96,
                        letterSpacing: "-0.06em",
                        fontWeight: 800,
                        maxWidth: 420,
                      }}
                    >
                      {processContent.teamHeading ||
                        "Strong visuals for trust and leadership."}
                    </Typography>
                    <Stack spacing={1} sx={{ mt: 2.4 }}>
                      {(teamMembers.length
                        ? teamMembers
                        : [{ name: "Leadership" }, { name: "Operations" }]
                      ).map((member, index) => (
                        <Typography
                          key={member.name}
                          data-editable={`teamMembers.${index}.name`}
                          data-edit-type="single"
                          data-block-id={processBlockId}
                          sx={{ color: palette.muted }}
                        >
                          {member.name}
                        </Typography>
                      ))}
                    </Stack>
                  </Box>

                  <Box
                    component={motion.div}
                    {...sectionReveal}
                    sx={{
                      p: { xs: 2.4, md: 3.2 },
                      borderRadius: "30px",
                      background: `linear-gradient(180deg, ${themeDeep} 0%, ${themeDeepest} 100%)`,
                      color: palette.white,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography
                      data-editable="reviewText"
                      data-edit-type="multi"
                      data-block-id={processBlockId}
                      sx={{
                        fontFamily: headingFont,
                        fontSize: { xs: "1.5rem", md: "2.25rem" },
                        lineHeight: 1.05,
                        letterSpacing: "-0.04em",
                        fontWeight: 700,
                        maxWidth: 420,
                      }}
                    >
                      {processReviewText}
                    </Typography>
                    <Typography
                      data-editable="reviewAuthor"
                      data-edit-type="single"
                      data-block-id={processBlockId}
                      sx={{ mt: 2, color: "rgba(255,255,255,0.68)" }}
                    >
                      {processContent.reviewAuthor ||
                        reviews[0]?.author ||
                        "Executive team"}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Container>
        </Box>

        {renderCustomSectionsBefore("contact")}
        <Container
          maxWidth="xl"
          data-preview-section="true"
          data-preview-label="Contact Parent"
          data-preview-block-id={contactBlockId}
          data-preview-style-key="outerSectionStyle"
          {...getSectionStyleDomProps(contactContent, "outerSectionStyle")}
          sx={{
            px: { xs: 2, md: 4 },
            order: sectionPosition["contact"] ?? 5,
            ...getSectionStyleSx(contactContent, "outerSectionStyle"),
          }}
        >
          <Box
            id="contact"
            data-preview-section="true"
            data-preview-label="Contact"
            data-preview-block-id={contactBlockId}
            data-preview-style-key="sectionStyle"
            data-preview-accepts-inner-blocks="true"
            {...getSectionStyleDomProps(contactContent)}
            sx={{
              py: { xs: 5, md: 7 },
              px: { xs: 2, md: 4 },
              mx: { xs: -2, md: "calc(-50vw + 50%)" },
              mt: { xs: 2, md: 3 },
              background: `linear-gradient(180deg, ${themeDeep} 0%, ${themeDeepest} 100%)`,
              color: palette.white,
              overflow: "hidden",
              position: "relative",
              ...getSectionStyleSx(contactContent),
            }}
          >
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                opacity: 0.18,
                backgroundImage:
                  "linear-gradient(100deg, rgba(255,255,255,0.08) 0 2px, transparent 2px 16px)",
                backgroundSize: "18px 100%",
                backgroundPosition: "left top",
                pointerEvents: "none",
              }}
            />
            <Box
              sx={{
                position: "relative",
                zIndex: 1,
                maxWidth: "1320px",
                mx: "auto",
              }}
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1fr 0.9fr" },
                  gap: { xs: 2.5, md: 3 },
                  alignItems: "stretch",
                }}
              >
                <Box
                  component={motion.div}
                  {...sectionReveal}
                  sx={{
                    minHeight: { xs: 360, md: 720 },
                    borderRadius: "36px",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      bgcolor: rgba(themeHighlight, 0.48),
                      opacity: 0.42,
                      backgroundImage:
                        "url(https://themejunction.net/html/bexon/demo/assets/images/bg/map.svg)",
                      maskImage:
                        "url(https://themejunction.net/html/bexon/demo/assets/images/bg/map.svg)",
                      WebkitMaskRepeat: "no-repeat",
                      maskRepeat: "no-repeat",
                      WebkitMaskPosition: "center",
                      maskPosition: "center",
                      WebkitMaskSize: "100% auto",
                      maskSize: "100% auto",
                    }}
                  />

                  <Box
                    sx={{
                      position: "absolute",
                      left: { xs: "26%", md: "28%" },
                      top: { xs: "42%", md: "38%" },
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      bgcolor: palette.white,
                      boxShadow: "0 0 0 6px rgba(255,255,255,0.18)",
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      left: { xs: "56%", md: "58%" },
                      top: { xs: "33%", md: "36%" },
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      bgcolor: palette.white,
                      boxShadow: "0 0 0 6px rgba(255,255,255,0.18)",
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      left: { xs: "42%", md: "43%" },
                      bottom: { xs: "24%", md: "18%" },
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      bgcolor: palette.white,
                      boxShadow: "0 0 0 6px rgba(255,255,255,0.18)",
                    }}
                  />
                </Box>

                <Box
                  component={motion.div}
                  {...sectionReveal}
                  sx={{
                    p: { xs: 2.4, md: 3.2 },
                    borderRadius: "26px",
                    bgcolor: "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    backdropFilter: "blur(16px)",
                    alignSelf: { md: "center" },
                  }}
                >
                  <Chip
                    label="Get in touch"
                    sx={{
                      bgcolor: "rgba(255,255,255,0.08)",
                      color: palette.white,
                      borderRadius: "10px",
                      fontWeight: 700,
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                      mb: 2.2,
                    }}
                  />

                  <Typography
                    data-editable="heading"
                    data-edit-type="single"
                    data-block-id={contactBlockId}
                    sx={{
                      fontFamily: headingFont,
                      fontSize: { xs: "2.1rem", md: "3.5rem" },
                      lineHeight: 0.96,
                      letterSpacing: "-0.07em",
                      fontWeight: 800,
                      mb: 2.5,
                      ...(contactContent.headingStyle || {}),
                    }}
                  >
                    {contactContent.heading || "Drop us a line."}
                  </Typography>

                  <Typography
                    data-editable="description"
                    data-edit-type="multi"
                    data-block-id={contactBlockId}
                    sx={{
                      mb: 2.5,
                      color: "rgba(255,255,255,0.74)",
                      lineHeight: 1.7,
                      ...(contactContent.descriptionStyle || {}),
                    }}
                  >
                    {contactContent.description ||
                      contactContent.subheading ||
                      "Share your goals and we will follow up with the right next step."}
                  </Typography>

                  <Stack spacing={1.6}>
                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      spacing={1.6}
                    >
                      <TextField
                        placeholder="Full name *"
                        size="small"
                        fullWidth
                        variant="standard"
                        InputProps={{ disableUnderline: true }}
                        sx={{
                          "& .MuiInputBase-root": {
                            color: palette.white,
                            pb: 1,
                            borderBottom: "1px solid rgba(255,255,255,0.18)",
                          },
                        }}
                      />
                      <TextField
                        placeholder="Email address *"
                        size="small"
                        fullWidth
                        variant="standard"
                        InputProps={{ disableUnderline: true }}
                        sx={{
                          "& .MuiInputBase-root": {
                            color: palette.white,
                            pb: 1,
                            borderBottom: "1px solid rgba(255,255,255,0.18)",
                          },
                        }}
                      />
                    </Stack>

                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      spacing={1.6}
                    >
                      <TextField
                        placeholder="Phone number *"
                        size="small"
                        fullWidth
                        variant="standard"
                        InputProps={{ disableUnderline: true }}
                        sx={{
                          "& .MuiInputBase-root": {
                            color: palette.white,
                            pb: 1,
                            borderBottom: "1px solid rgba(255,255,255,0.18)",
                          },
                        }}
                      />
                    </Stack>

                    <TextField
                      placeholder="Type message *"
                      size="small"
                      fullWidth
                      multiline
                      minRows={6}
                      variant="standard"
                      InputProps={{ disableUnderline: true }}
                      sx={{
                        "& .MuiInputBase-root": {
                          color: palette.white,
                          pb: 1,
                          borderBottom: "1px solid rgba(255,255,255,0.18)",
                        },
                      }}
                    />
                    <Button
                      variant="contained"
                      endIcon={<EastIcon />}
                      data-editable="buttonText"
                      data-edit-type="single"
                      data-block-id={contactBlockId}
                      sx={{
                        alignSelf: "flex-start",
                        bgcolor: themeColor,
                        color: palette.white,
                        borderRadius: 999,
                        textTransform: "none",
                        px: 2.6,
                        py: 1.15,
                        fontWeight: 800,
                        boxShadow: "none",
                        ...(contactContent.buttonTextStyle ||
                          contactContent.ctaTextStyle ||
                          {}),
                        "&:hover": {
                          bgcolor: themeColor,
                          boxShadow: "none",
                          opacity: 0.94,
                        },
                      }}
                    >
                      {contactContent.buttonLabel ||
                        contactContent.ctaText ||
                        "Send message"}
                    </Button>
                  </Stack>
                </Box>
              </Box>

              <Box
                sx={{
                  mt: 3,
                  pt: 2.2,
                  borderTop: "1px solid rgba(255,255,255,0.1)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: { xs: "flex-start", md: "center" },
                  flexDirection: { xs: "column", md: "row" },
                  gap: 1.5,
                }}
              >
                <Typography sx={{ color: "rgba(255,255,255,0.68)" }}>
                  © 2026 {data.name}. Global business presence.
                </Typography>
                {socialIcons.length ? (
                  <Stack direction="row" spacing={1}>
                    {socialIcons.map(({ key, icon: Icon }) => (
                      <Box
                        key={key}
                        sx={{
                          width: 40,
                          height: 40,
                          display: "grid",
                          placeItems: "center",
                          borderRadius: "50%",
                          border: "1px solid rgba(255,255,255,0.12)",
                          color: palette.white,
                        }}
                      >
                        <Icon size={16} />
                      </Box>
                    ))}
                  </Stack>
                ) : null}
              </Box>
              {renderSectionInnerBlocks(contactContent, {
                tone: "light",
                maxWidth: 760,
              })}
            </Box>
          </Box>
        </Container>
      </Box>
      {renderCustomSectionsAfterLastDefault()}
    </Box>
  );
};

export default CompanyStudioTemplate;
