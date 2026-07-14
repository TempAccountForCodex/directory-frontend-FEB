import React from "react";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Container,
  FormControl,
  FormControlLabel,
  FormLabel,
  Stack,
  Radio,
  RadioGroup,
  MenuItem,
  TextField,
  Typography,
  Grid,
  Paper,
} from "@mui/material";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import EastIcon from "@mui/icons-material/East";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import type { Variants } from "framer-motion";
import type { TemplateProps } from "../../templateEngine/types";
import { useTemplateContactForm } from "../../utils/useTemplateContactForm";
import { normalizeContactFormFields } from "../../../api/formSubmissions";
import TemplateNavbarHeader from "../../components/TemplateNavbarHeader";
import {
  getEditableImageProps,
  getEditableSectionProps,
  getEditableTextProps,
} from "../../utils/editableProps";
import { renderEditableMedia } from "../../utils/editableComponents";
import {
  getSectionStyleDomProps,
  getSectionStyleSx,
} from "../../utils/sectionStyle";
import {
  buildEditorSharedSurfaceStyles,
  getEditorBlockEstimatedHeight,
  getEditorBlockResponsivePriority,
  getEditorBlockTransform,
  getEditorSharedNestedValue,
  getEditorSharedTypographyStyleKey,
  humanizeEditorBlockKey,
  renderEditorSharedBlock,
} from "../../blocks";

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

const smoothEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32, filter: "blur(10px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.85, ease: smoothEase },
  },
};

const sectionReveal = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.75, ease: smoothEase },
} as const;

/* Moved to shared block renderer: src/landingTemplates/blocks/EditorSharedBlockRenderer.tsx
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
  headingStyle?: Record<string, any>;
  questionStyle?: Record<string, any>;
  answerStyle?: Record<string, any>;
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
  headingStyle,
  questionStyle,
  answerStyle,
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
          ...(headingStyle || {}),
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
                  sx={{
                    color: textColor,
                    fontWeight: 700,
                    pr: 2,
                    ...(questionStyle || {}),
                  }}
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
                    ...(answerStyle || {}),
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
*/

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

const normalizeCustomHeight = (
  value?: string | number,
): string | number | undefined => {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return `${value}px`;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    // Bare number → px; anything with an explicit unit (px/vh/%…) passes through.
    return /^\d+(\.\d+)?$/.test(trimmed) ? `${trimmed}px` : trimmed;
  }
  return undefined;
};

const getImageHeightPresetSx = (
  preset?: string,
  customHeight?: string | number,
) => {
  switch (preset) {
    case "small":
      return { height: { xs: 220, md: 300 } };
    case "medium":
      return { height: { xs: 320, md: 420 } };
    case "large":
      return { height: { xs: 420, md: 560 } };
    case "custom": {
      const normalized = normalizeCustomHeight(customHeight);
      return normalized ? { height: normalized } : {};
    }
    default:
      return {};
  }
};

/* Moved to shared block renderer: src/landingTemplates/blocks/EditorSharedBlockRenderer.tsx
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
*/

const CompanyStudioTemplate: React.FC<TemplateProps> = ({ data }) => {
  const templateContent =
    (data.templateContent as Record<string, any> | undefined) || {};
  const navbarContent = templateContent.navbar || {};
  const homeContent = templateContent.home || {};
  const featuresContent = templateContent.features || {};
  const aboutContent = templateContent.about || {};
  const processContent = templateContent.process || {};
  const testimonialsContent = templateContent.testimonials || {};
  const contactContent = templateContent.contact || {};
  const companyContactFields = React.useMemo(
    () =>
      normalizeContactFormFields(contactContent.formFields, contactContent).map(
        (field) => ({
          label: field.label,
          required: field.required,
          fieldType: field.fieldType,
          placeholder: field.placeholder,
          options: field.options,
          key: field.key,
        }),
      ),
    [contactContent],
  );
  const {
    status: contactStatus,
    errorMessage: contactError,
    getFieldProps: getContactFieldProps,
    handleSubmit: handleContactSubmit,
  } = useTemplateContactForm(
    companyContactFields,
    data.websiteId,
    "company-contact-form",
    {
      formId: (data.templateContent?.contact as any)?.blockId,
      formName:
        (data.templateContent?.contact as any)?.heading || "Contact form",
    },
  );
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
  const renderCompanyContactField = (
    field: (typeof companyContactFields)[number],
  ) => {
    const commonTextFieldSx = {
      "& .MuiInputBase-root": {
        color: palette.white,
        pb: 1,
        borderBottom: "1px solid rgba(255,255,255,0.18)",
      },
    };
    const fieldProps = getContactFieldProps(field.label);
    const placeholder = field.placeholder || field.label;

    if (field.fieldType === "select") {
      return (
        <TextField
          key={field.key || field.label}
          select
          size="small"
          fullWidth
          variant="standard"
          required={field.required}
          SelectProps={{ displayEmpty: true }}
          {...fieldProps}
          InputProps={{ disableUnderline: true }}
          sx={commonTextFieldSx}
        >
          <MenuItem value="">
            <em>{placeholder}</em>
          </MenuItem>
          {(field.options || []).map((option) => (
            <MenuItem key={`${field.label}-${option}`} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
      );
    }

    if (field.fieldType === "checkbox") {
      return (
        <FormControlLabel
          key={field.key || field.label}
          control={
            <Checkbox
              checked={Boolean(fieldProps.value)}
              disabled={fieldProps.disabled}
              onChange={(event) =>
                fieldProps.onChange({
                  target: { value: event.target.checked ? "Yes" : "" },
                } as React.ChangeEvent<HTMLInputElement>)
              }
              sx={{
                color: palette.white,
                "&.Mui-checked": { color: themeColor },
              }}
            />
          }
          label={placeholder}
          sx={{ color: palette.white, ml: 0 }}
        />
      );
    }

    if (field.fieldType === "radio") {
      return (
        <FormControl
          key={field.key || field.label}
          disabled={fieldProps.disabled}
        >
          <FormLabel sx={{ color: palette.white, mb: 1 }}>
            {field.label}
          </FormLabel>
          <RadioGroup
            value={fieldProps.value || ""}
            onChange={(event) =>
              fieldProps.onChange(
                event as React.ChangeEvent<
                  HTMLInputElement | HTMLTextAreaElement
                >,
              )
            }
          >
            {(field.options || []).map((option) => (
              <FormControlLabel
                key={`${field.label}-${option}`}
                value={option}
                control={
                  <Radio
                    sx={{
                      color: palette.white,
                      "&.Mui-checked": { color: themeColor },
                    }}
                  />
                }
                label={option}
                sx={{ color: palette.white }}
              />
            ))}
          </RadioGroup>
        </FormControl>
      );
    }

    return (
      <TextField
        key={field.key || field.label}
        placeholder={placeholder}
        size="small"
        fullWidth
        multiline={field.fieldType === "textarea"}
        minRows={field.fieldType === "textarea" ? 6 : undefined}
        variant="standard"
        type={
          field.fieldType === "email" ||
          field.fieldType === "tel" ||
          field.fieldType === "number" ||
          field.fieldType === "date"
            ? field.fieldType
            : "text"
        }
        required={field.required}
        {...fieldProps}
        InputProps={{ disableUnderline: true }}
        sx={commonTextFieldSx}
      />
    );
  };
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
  const heroImageHeightSx = getImageHeightPresetSx(
    heroImageStyle.heightPreset,
    heroImageStyle.customHeight,
  );
  const overviewInnerBlocks = Array.isArray(homeContent.innerBlocks)
    ? homeContent.innerBlocks
    : [];
  const aboutImage =
    aboutContent.image || aboutContent.imageUrl || visualSet.strategy;
  const aboutImageStyle = aboutContent.imageStyle || {};
  const aboutImageFit = aboutImageStyle.objectFit || "cover";
  const aboutImageHeightSx = getImageHeightPresetSx(
    aboutImageStyle.heightPreset,
    aboutImageStyle.customHeight,
  );
  const whyUsImage =
    featuresContent.image || featuresContent.imageUrl || visualSet.office;
  const whyUsImageStyle = featuresContent.imageStyle || {};
  const whyUsImageFit = whyUsImageStyle.objectFit || "cover";
  const whyUsImageHeightSx = getImageHeightPresetSx(
    whyUsImageStyle.heightPreset,
    whyUsImageStyle.customHeight,
  );
  const processImage =
    processContent.image || processContent.imageUrl || visualSet.team;
  const processImageStyle = processContent.imageStyle || {};
  const processImageFit = processImageStyle.objectFit || "cover";
  const processImageHeightSx = getImageHeightPresetSx(
    processImageStyle.heightPreset,
    processImageStyle.customHeight,
  );
  const aboutBlockId = aboutContent.blockId;
  const whyUsBlockId = featuresContent.blockId;
  const processBlockId = processContent.blockId;
  const contactBlockId = contactContent.blockId;
  const processItems = (
    (processContent.items as Array<Record<string, unknown>> | undefined) ||
    (testimonialsContent.items as
      Array<Record<string, unknown>> | undefined) || [
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
      Array<{ title?: string; items?: string[] }> | undefined) || [
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
            humanizeEditorBlockKey(key),
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
        (navbarContent.navLabels as Record<string, string> | undefined)?.[
          key
        ] ||
        homeContent.navLabels?.[key] ||
        homeContent.navigationLabels?.[key] ||
        defaultLabel,
      id: customSectionMap.has(key) ? key : key === "process" ? "work" : key,
      fieldPath: `navLabels.${key}`,
    };
  });
  const pageNavItems = Array.isArray(data.pages)
    ? data.pages
        .filter((page) => {
          const path = String(page.path || "").trim();
          return (
            path && path !== "/" && !page.isHome && page.isPublished !== false
          );
        })
        .map((page) => ({
          label: page.title || "Page",
          id: `page-${String(page.id ?? page.path)}`,
          target: page.path,
        }))
    : [];
  const headerNavItems = [...navItems, ...pageNavItems];

  const scrollToSection = (sectionId: string) => {
    const target = document.getElementById(sectionId);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const overviewBlockId = homeContent.blockId;
  const navbarBlockId = navbarContent.blockId ?? overviewBlockId;
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
    const wrapperBlockType = String(
      section?.editorBlockType || "",
    ).toLowerCase();
    const rawBlockType = String(
      block.type || block.blockType || "text",
    ).toLowerCase();
    const blockType = rawBlockType;
    const wrapperContent =
      wrapperBlockType &&
      wrapperBlockType === rawBlockType &&
      index === 0 &&
      section &&
      typeof section === "object"
        ? Object.fromEntries(
            Object.entries(section).filter(
              ([key]) =>
                key !== "innerBlocks" &&
                key !== "blockId" &&
                key !== "editorBlockType" &&
                key !== "editorLabel",
            ),
          )
        : null;
    const normalizedBlock =
      wrapperContent && typeof block?.content === "object"
        ? {
            ...block,
            content: {
              ...(block.content || {}),
              ...wrapperContent,
            },
          }
        : { ...block, type: blockType, content: block.content || {} };
    const tone = options?.tone || "dark";
    const textColor = tone === "light" ? palette.white : palette.ink;
    const mutedTextColor =
      tone === "light" ? "rgba(255,255,255,0.78)" : palette.muted;
    const lineColor =
      tone === "light" ? "rgba(255,255,255,0.22)" : rgba(themeColor, 0.22);
    const blockMaxWidth = options?.maxWidth || 880;
    const rawTextStyle = normalizedBlock.content?.textStyle || {};
    const rawHeadingStyle =
      normalizedBlock.content?.headingStyle || rawTextStyle;
    const rawBodyStyle = normalizedBlock.content?.bodyStyle || rawTextStyle;
    const rawEyebrowStyle =
      normalizedBlock.content?.eyebrowStyle || rawTextStyle;
    const rawButtonStyle =
      normalizedBlock.content?.buttonTextStyle || rawTextStyle;
    const rawImageStyle = normalizedBlock.content?.imageStyle || {};
    const rawCardStyle = normalizedBlock.content?.cardStyle || {};
    const rawSectionStyle = normalizedBlock.content?.sectionStyle || {};
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
      getSectionStyleSx({ cardStyle: rawCardStyle }, "cardStyle") as Record<
        string,
        any
      >,
      { keepWidth: true, keepHeight: true },
    );
    const resolvedSectionStyle = getFlowSafeStyle(
      getSectionStyleSx({ sectionStyle: rawSectionStyle }) as Record<
        string,
        any
      >,
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
    const getEditableFieldStyle = (
      fieldPath: string,
      fallbackStyle: Record<string, any> = {},
    ) => {
      const styleKey = getEditorSharedTypographyStyleKey(fieldPath);
      const resolvedStyle = styleKey.includes(".")
        ? getEditorSharedNestedValue(block.content || {}, styleKey)
        : block.content?.[styleKey];
      const styleSource =
        resolvedStyle && typeof resolvedStyle === "object"
          ? resolvedStyle
          : fallbackStyle;
      return getFlowSafeStyle(styleSource);
    };
    const { compoundCardSx, compoundVisualShellSx } =
      buildEditorSharedSurfaceStyles({
        blockType,
        tone,
        themeColor,
        canvas,
        canvasBaseSx,
        cardStyle,
        sectionStyle,
        resolvedCardStyle,
        resolvedSectionStyle,
        getCanvasWidth,
        getCanvasMaxWidth,
        getCanvasTransform,
        rgba,
      });
    const compoundBlockSelectionProps = {
      ...getEditableTextProps(section.blockId, `${blockPath}.__card`, "single"),
      "data-preview-section": "true",
      "data-preview-label": block.label || humanizeEditorBlockKey(blockType),
      "data-preview-block-id": section.blockId,
      "data-preview-style-key": `${blockPath}.cardStyle`,
    };
    const compoundBlockLabel = block.label || humanizeEditorBlockKey(blockType);

    const sharedEditorBlock = renderEditorSharedBlock({
      section,
      block: normalizedBlock,
      index,
      blockPath,
      tone,
      textColor,
      mutedTextColor,
      lineColor,
      themeColor,
      headingFont,
      headingStyle,
      bodyStyle,
      textStyle,
      buttonStyle,
      eyebrowStyle,
      imageStyle,
      cardStyle,
      sectionStyle,
      rawCardStyle,
      resolvedCardStyle,
      rawSectionStyle,
      resolvedSectionStyle,
      blockMaxWidth,
      canvas,
      canvasBaseSx,
      compoundBlockSelectionProps,
      compoundBlockLabel,
      compoundCardSx,
      fallbackImageSrc: visualSet.office,
      accentSoftColor: palette.accentSoft,
      whiteColor: palette.white,
      getCanvasWidth,
      getCanvasMaxWidth,
      getCanvasTransform,
      getEditableFieldStyle,
      websiteId: data.websiteId,
    });
    if (sharedEditorBlock) {
      return compoundVisualShellSx ? (
        <Box
          key={`shell-${String(block.id || `${blockType}-${index}`)}`}
          sx={compoundVisualShellSx}
        >
          {sharedEditorBlock}
        </Box>
      ) : (
        sharedEditorBlock
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
    options?: {
      tone?: "light" | "dark";
      maxWidth?: number | string;
      mt?: any;
      canvas?: boolean;
    },
  ) => {
    const innerBlocks = Array.isArray(section.innerBlocks)
      ? section.innerBlocks
      : [];
    const isFooterOnlySection =
      innerBlocks.length === 1 &&
      String(innerBlocks[0]?.type || "").toLowerCase() === "footer";

    const getInnerBlockTransform = (block: Record<string, any>) => {
      return getEditorBlockTransform(block);
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
    ) => getEditorBlockEstimatedHeight(entry.block);

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

    const getResponsivePriority = (entry: (typeof innerBlockEntries)[number]) =>
      getEditorBlockResponsivePriority(entry.block);

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
            const transformValue = getEditorBlockTransform(block) || "none";
            const match =
              typeof transformValue === "string"
                ? /translate(?:3d)?\(\s*(-?\d+(?:\.\d+)?)px(?:,\s*|\s+)(-?\d+(?:\.\d+)?)px/i.exec(
                    transformValue,
                  )
                : null;
            const y = match ? Number(match[2]) || 0 : 0;
            const estimatedHeight = getEditorBlockEstimatedHeight(block);
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
    const rawSectionSx = getSectionStyleSx(section) as Record<string, unknown>;
    const sectionContentSx: Record<string, unknown> = { ...rawSectionSx };
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
          backgroundColor: "transparent",
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
            px: 0,
            py: 0,
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

    const nodes: React.ReactNode[] = [];
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
      <Box {...getEditableSectionProps(navbarBlockId, "Header")}>
        <TemplateNavbarHeader
          navbarContent={navbarContent}
          fallbackName={data.name}
          sectionNavItems={headerNavItems}
          onScrollToSection={scrollToSection}
          themeColor={themeColor}
          headingFont={headingFont}
          bgColor={headerBackground}
          borderColor={rgba(themeColor, 0.14)}
          websiteId={data.websiteId}
        />
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
                  data-static-selectable="true"
                  data-static-style-only="true"
                  data-static-id="hero-social-proof"
                  data-preview-section="true"
                  data-preview-label="Social proof"
                  data-preview-block-id={overviewBlockId}
                  data-preview-style-key="static.socialProofStyle"
                  variants={fadeUp}
                  sx={{
                    mt: { xs: 4, md: 7 },
                    display: "flex",
                    alignItems: "center",
                    gap: 1.6,
                    flexWrap: "wrap",
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={-1.2}
                    data-static-selectable="true"
                    data-static-style-only="true"
                    data-static-id="hero-avatar-group"
                    data-preview-section="true"
                    data-preview-label="Avatar group"
                    data-preview-block-id={overviewBlockId}
                    data-preview-style-key="static.avatarGroupStyle"
                  >
                    {[
                      visualSet.avatarOne,
                      visualSet.avatarTwo,
                      visualSet.avatarThree,
                      visualSet.avatarOne,
                    ].map((avatar, index) => (
                      <Box
                        key={`${avatar}-${index}`}
                        component="img"
                        data-static-selectable="true"
                        data-static-style-only="true"
                        data-static-id={`hero-avatar-${index}`}
                        data-preview-section="true"
                        data-preview-label={`Avatar ${index + 1}`}
                        data-preview-block-id={overviewBlockId}
                        data-preview-style-key={`static.avatar.${index}`}
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

                  <Box
                    data-static-selectable="true"
                    data-static-style-only="true"
                    data-static-id="hero-review-text-group"
                    data-preview-section="true"
                    data-preview-label="Review text group"
                    data-preview-block-id={overviewBlockId}
                    data-preview-style-key="static.reviewTextGroupStyle"
                  >
                    <Typography
                      data-static-selectable="true"
                      data-static-style-only="true"
                      data-static-id="hero-star-row"
                      data-preview-section="true"
                      data-preview-label="Star row"
                      data-preview-block-id={overviewBlockId}
                      data-preview-style-key="static.starRowStyle"
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
                      <Box
                        component="span"
                        data-static-selectable="true"
                        data-static-style-only="true"
                        data-static-id="hero-customer-count"
                        data-preview-section="true"
                        data-preview-label="Customer count"
                        data-preview-block-id={overviewBlockId}
                        data-preview-style-key="static.customerCountStyle"
                      >
                        100+ happy customers.
                      </Box>
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

              {renderEditableMedia({
                blockId: homeContent.blockId,
                field: "heroImage",
                label: "Hero Image",
                src: heroImage,
                alt: "Executive portrait",
                style: heroImageStyle,
                imageComponent: motion.img,
                imageProps: {
                  initial: { opacity: 0, y: 40, scale: 0.96 },
                  animate: { opacity: 1, y: 0, scale: 1 },
                  transition: { duration: 0.9, ease: smoothEase, delay: 0.16 },
                },
                sx: {
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
                },
              })}
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
                  {renderEditableMedia({
                    blockId: aboutBlockId,
                    field: "image",
                    label: "About Image",
                    src: aboutImage,
                    alt: "Business collaboration",
                    style: aboutImageStyle,
                    sx: {
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
                    },
                  })}
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
                              ease: smoothEase,
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
                      data-static-selectable="true"
                      data-static-style-only="true"
                      data-static-id="about-badge"
                      data-preview-section="true"
                      data-preview-label="About badge"
                      data-preview-block-id={aboutBlockId}
                      data-preview-style-key="static.aboutBadgeStyle"
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
                  {renderEditableMedia({
                    blockId: whyUsBlockId,
                    field: "image",
                    label: "Why Choose Us Image",
                    src: whyUsImage,
                    alt: "Business meeting room",
                    style: whyUsImageStyle,
                    imageComponent: motion.img,
                    imageProps: { style: { scale: whyChooseImageScale } },
                    sx: {
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
                    },
                  })}
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
                  {renderEditableMedia({
                    blockId: processBlockId,
                    field: "image",
                    label: "Process Image",
                    src: processImage,
                    alt: "Company team",
                    style: processImageStyle,
                    sx: {
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
                    },
                  })}
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
                    {companyContactFields.map((field) => (
                      <Box key={field.key || field.label}>
                        {renderCompanyContactField(field)}
                      </Box>
                    ))}
                    <Button
                      variant="contained"
                      type="button"
                      disabled={contactStatus === "loading"}
                      onClick={handleContactSubmit}
                      endIcon={<EastIcon />}
                      {...getEditableTextProps(
                        contactBlockId,
                        "buttonLabel",
                        "single",
                      )}
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
                      {contactStatus === "loading"
                        ? "Sending…"
                        : contactContent.buttonLabel ||
                          contactContent.ctaText ||
                          "Send message"}
                    </Button>
                    {contactStatus === "success" && (
                      <Typography sx={{ color: "#8fe28f", fontWeight: 600 }}>
                        Thanks! Your message has been sent.
                      </Typography>
                    )}
                    {contactStatus === "error" && (
                      <Typography sx={{ color: "#ffb4a2", fontWeight: 600 }}>
                        {contactError}
                      </Typography>
                    )}
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
