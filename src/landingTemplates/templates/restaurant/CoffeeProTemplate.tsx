/**
 * Coffee Pro — premium dark single-page cafe template (slug: coffee-pro).
 * Home `/` only. Section-anchor nav. Editable menu cards via FEATURES.features[].
 */
import React, { useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import {
  Bean,
  Check,
  Flame,
  Minus,
  Plus,
  Sofa,
  Star,
} from "lucide-react";
import { motion } from "framer-motion";
import type { TemplateProps } from "../../templateEngine/types";
import type { TemplateChromeProps } from "../../templateEngine/templateChromeRegistry";
import TemplatePageShell from "../../components/TemplatePageShell";
import TemplateNavbarHeader from "../../components/TemplateNavbarHeader";
import {
  TemplateInnerContainer,
  TemplateSectionBoundary,
} from "../../components/TemplateSectionLayout";
import {
  getEditableSectionProps,
  getEditableTextProps,
  getStaticSelectableProps,
} from "../../utils/editableProps";
import { renderEditableMedia } from "../../utils/editableComponents";
import { coffeeProAssets } from "../../assets/restaurant/coffee-pro";
import { buildCompanyTheme, rgba } from "../company/theme";
import { buildSharedHeaderTheme } from "../../utils/headerTheme";
import {
  footerHasCanonicalLinks,
  normalizeFooterLinks,
} from "../../utils/footerLinks";
import { resolveTemplateInternalLink } from "../../utils/resolveTemplateLink";
import { useTemplateContactForm } from "../../utils/useTemplateContactForm";
import { isBlockElementHidden } from "../../utils/hiddenElements";

const GOLD = "#D48B31";
const INK = "#050505";
const PAPER = "#F7F1E8";

const buildCoffeeProTheme = (data: TemplateProps["data"]) => {
  const theme = buildCompanyTheme({
    data,
    defaultPrimary: INK,
    defaultSecondary: GOLD,
    defaultHeadingFont: '"Cormorant Garamond", "Playfair Display", Georgia, serif',
    defaultBodyFont: '"DM Sans", "Segoe UI", sans-serif',
  });
  return {
    ...theme,
    gold: theme.secondary || GOLD,
    ink: theme.primary || INK,
    paper: PAPER,
  };
};

const asRecord = (value: unknown): Record<string, any> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, any>)
    : {};

const asArray = <T,>(value: unknown, fallback: T[]): T[] =>
  Array.isArray(value) && value.length ? (value as T[]) : fallback;

const containerProps = (
  blockId: string | number | undefined,
  id: string,
  label: string,
  type: "container" | "card" = "container",
) => getStaticSelectableProps(blockId, label, id, "containerStyles", type);

const eyebrowSx = (bodyFont: string, gold: string) => ({
  fontFamily: bodyFont,
  fontSize: "0.72rem",
  fontWeight: 700,
  letterSpacing: "0.16em",
  textTransform: "uppercase" as const,
  color: gold,
});

const WHY_ICONS = [Bean, Flame, Sofa];

// Presentational only — never strips editable/selectable data-* attributes.
const MotionBox = motion(Box);

const revealProps = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.18 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
});

const liftHover = { y: -8, transition: { duration: 0.25 } };

const softFade = (delay = 0) => ({
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.7, delay },
});

export const CoffeeProTemplateHeader: React.FC<TemplateChromeProps> = ({
  data,
}) => {
  const { headingFont, gold } = buildCoffeeProTheme(data);
  const content = asRecord(data.templateContent);
  const navbar = asRecord(content.navbar);
  const blockId = navbar.blockId;
  const navItems = asArray(navbar.navigationItems, [
    { label: "Home", link: "#home" },
    { label: "About", link: "#about" },
    { label: "Menu", link: "#menu" },
    { label: "Gallery", link: "#gallery" },
    { label: "FAQ", link: "#faq" },
  ]);
  const brandName =
    typeof navbar.brandName === "string" && navbar.brandName.trim()
      ? navbar.brandName.trim()
      : data.name || "Caffino";

  const headerTheme = buildSharedHeaderTheme(data, navbar, {
    defaultPrimary: INK,
    defaultBackground: "transparent",
    transparentText: "light",
  });
  const overlayActive = !headerTheme.hasManualBackground;
  const headerBg = overlayActive ? "transparent" : headerTheme.bgColor;
  const linkColor = overlayActive
    ? PAPER
    : headerTheme.navLinkColor || PAPER;

  return (
    <Box
      {...getEditableSectionProps(blockId, "Header", "sectionStyle")}
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        bgcolor: headerBg,
        borderBottom: overlayActive
          ? "none"
          : `1px solid ${headerTheme.borderColor}`,
        "& header": {
          backdropFilter: overlayActive ? "none !important" : undefined,
          bgcolor: overlayActive ? "transparent !important" : undefined,
          borderBottom: overlayActive ? "none !important" : undefined,
        },
      }}
    >
      <TemplateNavbarHeader
        navbarContent={{
          ...navbar,
          sticky: false,
          brandName,
          ctaText: navbar.ctaText || "Book Now",
          ctaUrl: navbar.ctaLink || "#contact",
          navigationItems: navItems,
          navLinkColor: navbar.navLinkColor || linkColor,
          ctaColor: navbar.ctaColor || gold,
        }}
        fallbackName={data.name}
        sectionNavItems={navItems.map((item: Record<string, any>) => ({
          label: item.label,
          id: String(item.link || item.id || item.label || "")
            .replace(/^#/, "")
            .toLowerCase(),
          target: item.link || item.target || "",
        }))}
        onScrollToSection={(id) =>
          document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
        }
        themeColor={headerTheme.themeColor}
        headingFont={headingFont}
        bgColor={headerBg}
        borderColor={overlayActive ? "transparent" : headerTheme.borderColor}
        websiteId={data.websiteId}
        ctaHoverTextColor={INK}
        mobileCtaColor={gold}
        mobileCtaHoverTextColor={INK}
      />
    </Box>
  );
};

export const CoffeeProTemplateFooter: React.FC<TemplateChromeProps> = ({
  data,
}) => {
  const { ink, gold, headingFont, bodyFont } = buildCoffeeProTheme(data);
  const content = asRecord(data.templateContent);
  const footer = asRecord(content.footer);
  const blockId = footer.blockId;
  const siteSlug =
    typeof content.__siteSlug === "string" ? content.__siteSlug : undefined;
  const footerLinks = normalizeFooterLinks(footer);
  const canonicalLinks = footerHasCanonicalLinks(footer);
  const brand =
    typeof footer.logoText === "string" && footer.logoText.trim()
      ? footer.logoText.trim()
      : data.name || "Caffino";

  return (
    <Box
      component="footer"
      {...getEditableSectionProps(blockId, "Footer", "sectionStyle")}
      sx={{ bgcolor: ink, color: PAPER, pt: { xs: 8, md: 10 }, pb: 3 }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.4fr 1fr 1fr 1.2fr" },
            gap: 4,
            mb: 6,
          }}
        >
          <Box {...containerProps(blockId, "footer.brand", "Footer brand", "card")}>
            <Typography
              {...getEditableTextProps(blockId, "logoText", "single")}
              sx={{
                fontFamily: headingFont,
                fontSize: "1.8rem",
                color: gold,
                mb: 1.5,
              }}
            >
              {brand}
            </Typography>
            <Typography
              {...getEditableTextProps(blockId, "body", "multi")}
              sx={{
                fontFamily: bodyFont,
                color: rgba(PAPER, 0.7),
                lineHeight: 1.7,
                fontSize: "0.92rem",
                maxWidth: 280,
              }}
            >
              {footer.body ||
                "Handcrafted coffee, warm hospitality, and a daily ritual worth savoring."}
            </Typography>
          </Box>
          <Box {...containerProps(blockId, "footer.links", "Footer links", "card")}>
            <Typography
              {...getEditableTextProps(blockId, "eyebrow", "single")}
              sx={{
                fontFamily: bodyFont,
                fontWeight: 700,
                fontSize: "0.78rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: gold,
                mb: 1.5,
              }}
            >
              {footer.eyebrow || "Quick Links"}
            </Typography>
            <Stack spacing={1}>
              {footerLinks.slice(0, 4).map((link, linkIndex) => (
                <Box
                  key={`${link.label}-${linkIndex}`}
                  component="a"
                  href={resolveTemplateInternalLink(link.url, { siteSlug })}
                  {...(canonicalLinks
                    ? getEditableTextProps(
                        blockId,
                        `links.${linkIndex}.label`,
                        "single",
                      )
                    : {})}
                  sx={{
                    color: rgba(PAPER, 0.72),
                    textDecoration: "none",
                    fontSize: "0.92rem",
                    "&:hover": { color: gold },
                  }}
                >
                  {link.label}
                </Box>
              ))}
            </Stack>
          </Box>
          <Box {...containerProps(blockId, "footer.visit", "Footer visit", "card")}>
            <Typography
              {...getEditableTextProps(blockId, "subheading", "single")}
              sx={{
                fontFamily: bodyFont,
                fontWeight: 700,
                fontSize: "0.78rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: gold,
                mb: 1.5,
              }}
            >
              {footer.subheading || "Visit"}
            </Typography>
            <Typography
              {...getEditableTextProps(blockId, "description", "multi")}
              sx={{
                color: rgba(PAPER, 0.72),
                fontSize: "0.92rem",
                lineHeight: 1.7,
                whiteSpace: "pre-line",
              }}
            >
              {footer.description ||
                "Dine In\nTakeaway\nDelivery\nPrivate Events"}
            </Typography>
          </Box>
          <Box {...containerProps(blockId, "footer.contact", "Footer contact", "card")}>
            <Typography
              {...getEditableTextProps(blockId, "buttonLabel", "single")}
              sx={{
                fontFamily: bodyFont,
                fontWeight: 700,
                fontSize: "0.78rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: gold,
                mb: 1.5,
              }}
            >
              {footer.buttonLabel || "Contact"}
            </Typography>
            <Stack spacing={0.75}>
              <Typography
                {...getEditableTextProps(blockId, "address", "single")}
                sx={{ color: rgba(PAPER, 0.72), fontSize: "0.92rem" }}
              >
                {footer.address ||
                  data.contact?.address ||
                  "128 Roast Avenue, Portland"}
              </Typography>
              <Typography
                {...getEditableTextProps(blockId, "phone", "single")}
                sx={{ color: rgba(PAPER, 0.72), fontSize: "0.92rem" }}
              >
                {footer.phone || data.contact?.phone || "(555) 214-9088"}
              </Typography>
              <Typography
                {...getEditableTextProps(blockId, "email", "single")}
                sx={{ color: rgba(PAPER, 0.72), fontSize: "0.92rem" }}
              >
                {footer.email || data.contact?.email || "hello@caffino.cafe"}
              </Typography>
            </Stack>
          </Box>
        </Box>

        <Typography
          {...getEditableTextProps(blockId, "heading", "single")}
          sx={{
            fontFamily: headingFont,
            fontSize: { xs: "4.5rem", sm: "7rem", md: "9.5rem" },
            lineHeight: 0.85,
            letterSpacing: "-0.04em",
            textAlign: "center",
            background: `linear-gradient(180deg, ${gold} 0%, ${rgba(gold, 0.35)} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: 4,
          }}
        >
          {footer.heading || brand}
        </Typography>

        <Typography
          {...getEditableTextProps(blockId, "copyright", "single")}
          sx={{
            borderTop: `1px solid ${rgba(PAPER, 0.12)}`,
            pt: 2.5,
            color: rgba(PAPER, 0.5),
            fontSize: "0.78rem",
            textAlign: "center",
          }}
        >
          {footer.copyright ||
            `(c) 2026 ${brand}. All rights reserved.`}
        </Typography>
      </Container>
    </Box>
  );
};

const CoffeeProTemplate: React.FC<TemplateProps> = ({ data }) => {
  const { ink, gold, headingFont, bodyFont } = buildCoffeeProTheme(data);
  const content = asRecord(data.templateContent);
  const hiddenMap = asRecord(content.__hiddenElements) as Record<
    string,
    Record<string, boolean>
  >;
  const isHidden = (
    blockId: string | number | undefined,
    path: string,
  ) => isBlockElementHidden(hiddenMap, blockId, path);
  const hero = asRecord(content.hero);
  const whyUs = asRecord(content["why-us"] || content.whyUs);
  const ritual = asRecord(content.ritual);
  const craft = asRecord(content.craft);
  const menu = asRecord(content.menu);
  const testimonials = asRecord(content.testimonials);
  const gallery = asRecord(content.gallery);
  const faq = asRecord(content.faq);
  const contact = asRecord(content.contact);
  const [faqOpen, setFaqOpen] = useState<number | false>(0);

  const contactFields = [
    { label: "Name", required: true },
    { label: "Email", required: true },
    { label: "Party size", required: false },
    { label: "Message", required: false },
  ];
  const { status, errorMessage, getFieldProps, handleSubmit } =
    useTemplateContactForm(contactFields, data.websiteId, "coffee-pro-book", {
      formId: contact.blockId,
      formName: String(contact.heading || "Book a table"),
    });

  const whyItems = asArray(whyUs.features, [
    {
      icon: "01",
      title: "Premium Beans",
      description: "Single-origin lots roasted for sweetness, clarity, and depth.",
    },
    {
      icon: "02",
      title: "Expert Roasting",
      description: "Small batches tuned daily so every cup tastes intentional.",
    },
    {
      icon: "03",
      title: "Cozy Space",
      description: "A warm room built for lingering conversations and quiet focus.",
    },
  ]);

  const ritualGroups = asArray(ritual.detailGroups, [
    {
      title: "Crafted daily",
      items: ["Freshly roasted", "Handcrafted drinks", "Seasonal syrups"],
    },
    {
      title: "Hospitality",
      items: ["Expert baristas", "Thoughtful service", "Calm atmosphere"],
    },
  ]);

  const craftGroups = asArray(craft.detailGroups, [
    {
      title: "Precision",
      items: ["Dialed recipes", "Consistent extraction", "Clean equipment"],
    },
    {
      title: "Flavor",
      items: ["Balanced sweetness", "Rich crema", "Memorable finish"],
    },
  ]);

  const menuItems = asArray(menu.features, [
    {
      icon: "Latte",
      title: "Classic Latte Art",
      description: "Silky microfoam over espresso with seasonal latte art.",
      price: "$6.50",
      image: coffeeProAssets.menuLatte,
    },
    {
      icon: "Cappuccino",
      title: "Velvet Cappuccino",
      description: "Equal parts espresso, steamed milk, and airy foam.",
      price: "$5.75",
      image: coffeeProAssets.menuCappuccino,
    },
    {
      icon: "Mocha",
      title: "Dark Mocha",
      description: "Espresso with melted chocolate and soft milk foam.",
      price: "$6.95",
      image: coffeeProAssets.menuMocha,
    },
    {
      icon: "Flat White",
      title: "Studio Flat White",
      description: "Ristretto-forward cup with velvety microfoam.",
      price: "$6.25",
      image: coffeeProAssets.menuFlatwhite,
    },
    {
      icon: "Americano",
      title: "Slow Americano",
      description: "Long black clarity with a smooth chocolate finish.",
      price: "$4.50",
      image: coffeeProAssets.menuAmericano,
    },
    {
      icon: "Espresso",
      title: "Double Espresso",
      description: "Bright crema shot roasted for intensity and sweetness.",
      price: "$3.75",
      image: coffeeProAssets.menuEspresso,
    },
  ]);

  const reviewItems = asArray(testimonials.testimonials, [
    {
      quote:
        "The latte is consistently perfect and the room always feels calm and elevated.",
      author: "Maya Ellis",
      position: "Coffee Blogger",
      photo: coffeeProAssets.avatars[0],
      rating: 5,
    },
    {
      quote:
        "A daily ritual worth protecting. Warm service and beautiful espresso.",
      author: "Jordan Blake",
      position: "Designer",
      photo: coffeeProAssets.avatars[1],
      rating: 5,
    },
    {
      quote:
        "From the beans to the seating, everything feels thoughtfully crafted.",
      author: "Priya Shah",
      position: "Local Guest",
      photo: coffeeProAssets.avatars[2],
      rating: 5,
    },
  ]);

  const galleryItems = asArray(gallery.items, [
    { url: coffeeProAssets.gallery[0], caption: "Beans" },
    { url: coffeeProAssets.gallery[1], caption: "Cup in hand" },
    { url: coffeeProAssets.gallery[2], caption: "Cafe interior" },
    { url: coffeeProAssets.gallery[3], caption: "Latte art" },
    { url: coffeeProAssets.gallery[4], caption: "Brewing" },
  ]);

  const faqItems = asArray(faq.features, [
    {
      title: "Do you take reservations?",
      description:
        "Yes — book a table online or walk in for counter service during open hours.",
    },
    {
      title: "Are dairy alternatives available?",
      description:
        "We offer oat, almond, and coconut milk with every espresso drink.",
    },
    {
      title: "Do you roast your own beans?",
      description:
        "We roast weekly in small batches and brew our house espresso daily.",
    },
    {
      title: "Is there seating for remote work?",
      description:
        "Yes — quiet tables, strong Wi‑Fi, and outlets throughout the cafe.",
    },
  ]);

  const sectionMap: Record<string, React.ReactNode> = {
    hero: (
      <TemplateSectionBoundary
        key="hero"
        blockId={hero.blockId}
        label="Hero"
        sectionKey="hero"
        content={hero}
        styleKey="sectionStyle"
        id="home"
        sx={{
          position: "relative",
          minHeight: { xs: "92vh", md: "100vh" },
          color: PAPER,
          overflow: "hidden",
          backgroundColor: ink,
          backgroundImage: `linear-gradient(90deg, ${rgba(ink, 0.94)} 0%, ${rgba(ink, 0.78)} 34%, ${rgba(ink, 0.28)} 58%, ${rgba(ink, 0.45)} 100%), url(${hero.heroImage || coffeeProAssets.hero})`,
          backgroundSize: "cover",
          backgroundPosition: "center right",
          backgroundRepeat: "no-repeat",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            width: 0,
            height: 0,
            overflow: "hidden",
            opacity: 0,
          }}
          aria-hidden
        >
          {renderEditableMedia({
            blockId: hero.blockId,
            field: "heroImage",
            label: "Hero background image",
            src: hero.heroImage || coffeeProAssets.hero,
            alt: "Signature latte",
            style: hero.heroImageStyle || hero.imageStyle,
            sx: { width: 1, height: 1 },
          })}
        </Box>
        <TemplateInnerContainer
          sx={{
            position: "relative",
            zIndex: 1,
            minHeight: { xs: "92vh", md: "100vh" },
            display: "flex",
            alignItems: "center",
            pt: { xs: 12, md: 14 },
            pb: { xs: 8, md: 10 },
          }}
        >
          <MotionBox
            {...revealProps(0.05)}
            {...containerProps(hero.blockId, "hero.copy", "Hero copy")}
            sx={{ maxWidth: { xs: "100%", md: 560 } }}
          >
            {!isHidden(hero.blockId, "eyebrow") ? (
              <Typography
                {...getEditableTextProps(hero.blockId, "eyebrow", "single", "eyebrowStyle")}
                sx={eyebrowSx(bodyFont, gold)}
              >
                {hero.eyebrow || "Welcome to Caffino"}
              </Typography>
            ) : null}
            {!isHidden(hero.blockId, "heading") ? (
              <Typography
                {...getEditableTextProps(hero.blockId, "heading", "multi")}
                sx={{
                  mt: 2.5,
                  fontFamily: headingFont,
                  fontSize: { xs: "3rem", md: "4.6rem" },
                  lineHeight: 0.95,
                  letterSpacing: "-0.03em",
                  ...(hero.headingStyle || {}),
                }}
              >
                {hero.heading || "Your Perfect Coffee Moment Starts Here"}
              </Typography>
            ) : null}
            {!isHidden(hero.blockId, "subheading") ? (
              <Typography
                {...getEditableTextProps(hero.blockId, "subheading", "multi")}
                sx={{
                  mt: 3,
                  maxWidth: 460,
                  color: rgba(PAPER, 0.82),
                  lineHeight: 1.7,
                  fontSize: "1.05rem",
                  ...(hero.subheadingStyle || {}),
                }}
              >
                {hero.subheading ||
                  "Slow mornings, rich espresso, and a warm room made for lingering."}
              </Typography>
            ) : null}
            {!isHidden(hero.blockId, "ctaText") ? (
              <Button
                href={hero.ctaLink || "#menu"}
                {...getEditableTextProps(
                  hero.blockId,
                  "ctaText",
                  "single",
                  "buttonTextStyle",
                )}
                sx={{
                  mt: 4,
                  bgcolor: gold,
                  color: ink,
                  borderRadius: 1,
                  px: 3.5,
                  py: 1.35,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  fontSize: "0.78rem",
                  "&:hover": { bgcolor: rgba(gold, 0.88) },
                }}
              >
                {hero.ctaText || "Explore Menu"}
              </Button>
            ) : null}
          </MotionBox>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>
    ),
    "why-us": (
      <TemplateSectionBoundary
        key="why-us"
        blockId={whyUs.blockId}
        label="Why choose us"
        sectionKey="why-us"
        content={whyUs}
        id="why-us"
        sx={{ bgcolor: ink, color: PAPER, py: { xs: 8, md: 11 } }}
      >
        <TemplateInnerContainer>
          <MotionBox {...revealProps()} sx={{ textAlign: "center", mb: 6 }}>
            {!isHidden(whyUs.blockId, "eyebrow") ? (
              <Typography
                {...getEditableTextProps(whyUs.blockId, "eyebrow", "single", "eyebrowStyle")}
                sx={eyebrowSx(bodyFont, gold)}
              >
                {whyUs.eyebrow || "Why coffee lovers choose us"}
              </Typography>
            ) : null}
            {!isHidden(whyUs.blockId, "heading") ? (
              <Typography
                {...getEditableTextProps(whyUs.blockId, "heading", "multi")}
                sx={{
                  mt: 2,
                  fontFamily: headingFont,
                  fontSize: { xs: "2.4rem", md: "3.4rem" },
                  lineHeight: 1.05,
                  ...(whyUs.headingStyle || {}),
                }}
              >
                {whyUs.heading || "Crafted for people who care about every cup"}
              </Typography>
            ) : null}
          </MotionBox>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
              gap: 4,
            }}
          >
            {whyItems.map((item: Record<string, any>, index: number) => {
              const Icon = WHY_ICONS[index % WHY_ICONS.length];
              return (
                <MotionBox
                  key={index}
                  {...revealProps(0.08 * index)}
                  whileHover={liftHover}
                  {...containerProps(
                    whyUs.blockId,
                    `why-us.feature.${index}`,
                    `Feature ${index + 1}`,
                    "card",
                  )}
                  sx={{ textAlign: "center", px: 2 }}
                >
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      mx: "auto",
                      mb: 2,
                      borderRadius: "50%",
                      display: "grid",
                      placeItems: "center",
                      bgcolor: rgba(gold, 0.12),
                      color: gold,
                      boxShadow: `0 0 24px ${rgba(gold, 0.25)}`,
                    }}
                  >
                    <Icon size={22} />
                  </Box>
                  <Typography
                    {...getEditableTextProps(
                      whyUs.blockId,
                      `features.${index}.title`,
                      "single",
                    )}
                    sx={{ fontFamily: headingFont, fontSize: "1.55rem", mb: 1 }}
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    {...getEditableTextProps(
                      whyUs.blockId,
                      `features.${index}.description`,
                      "multi",
                    )}
                    sx={{ color: rgba(PAPER, 0.68), lineHeight: 1.7 }}
                  >
                    {item.description}
                  </Typography>
                </MotionBox>
              );
            })}
          </Box>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>
    ),
    ritual: (
      <TemplateSectionBoundary
        key="ritual"
        blockId={ritual.blockId}
        label="Daily ritual"
        sectionKey="ritual"
        content={ritual}
        id="about"
        sx={{ bgcolor: ink, color: PAPER, py: { xs: 8, md: 12 } }}
      >
        <TemplateInnerContainer>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "0.95fr 1.05fr" },
              gap: { xs: 4, md: 7 },
              alignItems: "center",
            }}
          >
            <MotionBox
              {...revealProps()}
              {...containerProps(ritual.blockId, "ritual.media", "Ritual image", "card")}
              sx={{ borderRadius: 2, overflow: "hidden" }}
            >
              {renderEditableMedia({
                blockId: ritual.blockId,
                field: "image",
                label: "Ritual image",
                src: ritual.image || coffeeProAssets.ritual,
                alt: "Coffee pour ritual",
                sx: {
                  width: "100%",
                  height: { xs: 320, md: 520 },
                  objectFit: "cover",
                  display: "block",
                },
              })}
            </MotionBox>
            <MotionBox {...revealProps(0.12)}>
              {!isHidden(ritual.blockId, "eyebrow") ? (
                <Typography
                  {...getEditableTextProps(ritual.blockId, "eyebrow", "single", "eyebrowStyle")}
                  sx={eyebrowSx(bodyFont, gold)}
                >
                  {ritual.eyebrow || "Our story"}
                </Typography>
              ) : null}
              {!isHidden(ritual.blockId, "heading") ? (
                <Typography
                  {...getEditableTextProps(ritual.blockId, "heading", "multi")}
                  sx={{
                    mt: 2,
                    fontFamily: headingFont,
                    fontSize: { xs: "2.5rem", md: "3.4rem" },
                    lineHeight: 1.05,
                    ...(ritual.headingStyle || {}),
                  }}
                >
                  {ritual.heading || "More Than Coffee, A Daily Ritual."}
                </Typography>
              ) : null}
              {!isHidden(ritual.blockId, "body") ? (
                <Typography
                  {...getEditableTextProps(ritual.blockId, "body", "multi")}
                  sx={{
                    mt: 2.5,
                    color: rgba(PAPER, 0.7),
                    lineHeight: 1.75,
                    maxWidth: 520,
                  }}
                >
                  {ritual.body ||
                    "We believe a great cup can reset the day — roasted with care, poured with intention, and served in a space that feels like home."}
                </Typography>
              ) : null}
              <Box
                sx={{
                  mt: 4,
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 2.5,
                }}
              >
                {ritualGroups.slice(0, 2).map((group: Record<string, any>, groupIndex: number) => (
                  <MotionBox
                    key={groupIndex}
                    {...revealProps(0.08 * groupIndex)}
                    {...containerProps(
                      ritual.blockId,
                      `ritual.detail.${groupIndex}`,
                      `Ritual detail ${groupIndex + 1}`,
                      "card",
                    )}
                  >
                    <Typography
                      {...getEditableTextProps(
                        ritual.blockId,
                        `detailGroups.${groupIndex}.title`,
                        "single",
                      )}
                      sx={{ fontFamily: headingFont, fontSize: "1.35rem", mb: 1.25 }}
                    >
                      {group.title}
                    </Typography>
                    <Stack spacing={1}>
                      {asArray<string>(group.items, []).map((item, itemIndex) => (
                        <Stack key={itemIndex} direction="row" spacing={1} alignItems="center">
                          <Check size={15} color={gold} />
                          <Typography
                            {...getEditableTextProps(
                              ritual.blockId,
                              `detailGroups.${groupIndex}.items.${itemIndex}`,
                              "single",
                            )}
                            sx={{ fontSize: "0.95rem", color: rgba(PAPER, 0.8) }}
                          >
                            {item}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </MotionBox>
                ))}
              </Box>
            </MotionBox>
          </Box>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>
    ),
    craft: (
      <TemplateSectionBoundary
        key="craft"
        blockId={craft.blockId}
        label="Crafting excellence"
        sectionKey="craft"
        content={craft}
        id="craft"
        sx={{ bgcolor: ink, color: PAPER, py: { xs: 8, md: 12 } }}
      >
        <TemplateInnerContainer>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1.05fr 0.95fr" },
              gap: { xs: 4, md: 7 },
              alignItems: "center",
            }}
          >
            <MotionBox {...revealProps(0.08)} sx={{ order: { xs: 2, md: 1 } }}>
              {!isHidden(craft.blockId, "eyebrow") ? (
                <Typography
                  {...getEditableTextProps(craft.blockId, "eyebrow", "single", "eyebrowStyle")}
                  sx={eyebrowSx(bodyFont, gold)}
                >
                  {craft.eyebrow || "The craft"}
                </Typography>
              ) : null}
              {!isHidden(craft.blockId, "heading") ? (
                <Typography
                  {...getEditableTextProps(craft.blockId, "heading", "multi")}
                  sx={{
                    mt: 2,
                    fontFamily: headingFont,
                    fontSize: { xs: "2.5rem", md: "3.4rem" },
                    lineHeight: 1.05,
                    ...(craft.headingStyle || {}),
                  }}
                >
                  {craft.heading || "Crafting Excellence In Every Drop"}
                </Typography>
              ) : null}
              {!isHidden(craft.blockId, "body") ? (
                <Typography
                  {...getEditableTextProps(craft.blockId, "body", "multi")}
                  sx={{
                    mt: 2.5,
                    color: rgba(PAPER, 0.7),
                    lineHeight: 1.75,
                    maxWidth: 520,
                  }}
                >
                  {craft.body ||
                    "From dial-in to pour, every detail is measured so sweetness, body, and aroma land exactly where they should."}
                </Typography>
              ) : null}
              <Box
                sx={{
                  mt: 4,
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 2.5,
                }}
              >
                {craftGroups.slice(0, 2).map((group: Record<string, any>, groupIndex: number) => (
                  <MotionBox
                    key={groupIndex}
                    {...revealProps(0.08 * groupIndex)}
                    {...containerProps(
                      craft.blockId,
                      `craft.detail.${groupIndex}`,
                      `Craft detail ${groupIndex + 1}`,
                      "card",
                    )}
                  >
                    <Typography
                      {...getEditableTextProps(
                        craft.blockId,
                        `detailGroups.${groupIndex}.title`,
                        "single",
                      )}
                      sx={{ fontFamily: headingFont, fontSize: "1.35rem", mb: 1.25 }}
                    >
                      {group.title}
                    </Typography>
                    <Stack spacing={1}>
                      {asArray<string>(group.items, []).map((item, itemIndex) => (
                        <Stack key={itemIndex} direction="row" spacing={1} alignItems="center">
                          <Check size={15} color={gold} />
                          <Typography
                            {...getEditableTextProps(
                              craft.blockId,
                              `detailGroups.${groupIndex}.items.${itemIndex}`,
                              "single",
                            )}
                            sx={{ fontSize: "0.95rem", color: rgba(PAPER, 0.8) }}
                          >
                            {item}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </MotionBox>
                ))}
              </Box>
            </MotionBox>
            <MotionBox
              {...revealProps()}
              {...containerProps(craft.blockId, "craft.media", "Craft image", "card")}
              sx={{ borderRadius: 2, overflow: "hidden", order: { xs: 1, md: 2 } }}
            >
              {renderEditableMedia({
                blockId: craft.blockId,
                field: "image",
                label: "Craft image",
                src: craft.image || coffeeProAssets.craft,
                alt: "Espresso extraction",
                sx: {
                  width: "100%",
                  height: { xs: 320, md: 520 },
                  objectFit: "cover",
                  display: "block",
                },
              })}
            </MotionBox>
          </Box>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>
    ),
    menu: (
      <TemplateSectionBoundary
        key="menu"
        blockId={menu.blockId}
        label="Menu"
        sectionKey="menu"
        content={menu}
        id="menu"
        sx={{ bgcolor: ink, color: PAPER, py: { xs: 8, md: 12 } }}
      >
        <TemplateInnerContainer>
          <MotionBox {...revealProps()} sx={{ textAlign: "center", mb: 6 }}>
            {!isHidden(menu.blockId, "eyebrow") ? (
              <Typography
                {...getEditableTextProps(menu.blockId, "eyebrow", "single", "eyebrowStyle")}
                sx={eyebrowSx(bodyFont, gold)}
              >
                {menu.eyebrow || "Our menu"}
              </Typography>
            ) : null}
            {!isHidden(menu.blockId, "heading") ? (
              <Typography
                {...getEditableTextProps(menu.blockId, "heading", "multi")}
                sx={{
                  mt: 2,
                  fontFamily: headingFont,
                  fontSize: { xs: "2.4rem", md: "3.4rem" },
                  lineHeight: 1.05,
                  ...(menu.headingStyle || {}),
                }}
              >
                {menu.heading || "Handcrafted Coffee For Every Taste"}
              </Typography>
            ) : null}
          </MotionBox>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
              },
              gap: 3,
            }}
          >
            {menuItems.map((item: Record<string, any>, index: number) => (
              <MotionBox
                key={index}
                {...revealProps(0.06 * index)}
                whileHover={liftHover}
                {...containerProps(
                  menu.blockId,
                  `menu.item.${index}`,
                  `Menu item ${index + 1}`,
                  "card",
                )}
                sx={{
                  bgcolor: rgba(PAPER, 0.03),
                  border: `1px solid ${rgba(gold, 0.16)}`,
                  borderRadius: 2,
                  overflow: "hidden",
                  p: 2,
                }}
              >
                <Typography
                  {...getEditableTextProps(
                    menu.blockId,
                    `features.${index}.icon`,
                    "single",
                  )}
                  sx={{
                    display: "inline-block",
                    mb: 1.5,
                    px: 1.25,
                    py: 0.4,
                    borderRadius: 999,
                    bgcolor: rgba(gold, 0.14),
                    color: gold,
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  {item.icon || "Coffee"}
                </Typography>
                {renderEditableMedia({
                  blockId: menu.blockId,
                  field: `features.${index}.image`,
                  label: `Menu image ${index + 1}`,
                  src: item.image || coffeeProAssets.menuLatte,
                  alt: item.title || "Menu item",
                  sx: {
                    width: "100%",
                    height: 180,
                    objectFit: "cover",
                    borderRadius: 1.5,
                    display: "block",
                    mb: 2,
                  },
                })}
                <Typography
                  {...getEditableTextProps(
                    menu.blockId,
                    `features.${index}.title`,
                    "single",
                  )}
                  sx={{ fontFamily: headingFont, fontSize: "1.45rem", mb: 0.75 }}
                >
                  {item.title}
                </Typography>
                <Typography
                  {...getEditableTextProps(
                    menu.blockId,
                    `features.${index}.description`,
                    "multi",
                  )}
                  sx={{ color: rgba(PAPER, 0.65), fontSize: "0.9rem", lineHeight: 1.6, mb: 1.5 }}
                >
                  {item.description}
                </Typography>
                <Typography
                  {...getEditableTextProps(
                    menu.blockId,
                    `features.${index}.price`,
                    "single",
                  )}
                  sx={{ color: gold, fontWeight: 700, fontSize: "1.05rem" }}
                >
                  {item.price || ""}
                </Typography>
              </MotionBox>
            ))}
          </Box>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>
    ),
    testimonials: (
      <TemplateSectionBoundary
        key="testimonials"
        blockId={testimonials.blockId}
        label="Testimonials"
        sectionKey="testimonials"
        content={testimonials}
        id="testimonials"
        sx={{ bgcolor: ink, color: PAPER, py: { xs: 8, md: 12 } }}
      >
        <TemplateInnerContainer>
          <MotionBox {...revealProps()} sx={{ textAlign: "center", mb: 6 }}>
            {!isHidden(testimonials.blockId, "eyebrow") ? (
              <Typography
                {...getEditableTextProps(
                  testimonials.blockId,
                  "eyebrow",
                  "single",
                  "eyebrowStyle",
                )}
                sx={eyebrowSx(bodyFont, gold)}
              >
                {testimonials.eyebrow || "Guest love"}
              </Typography>
            ) : null}
            {!isHidden(testimonials.blockId, "heading") ? (
              <Typography
                {...getEditableTextProps(testimonials.blockId, "heading", "multi")}
                sx={{
                  mt: 2,
                  fontFamily: headingFont,
                  fontSize: { xs: "2.4rem", md: "3.4rem" },
                  lineHeight: 1.05,
                }}
              >
                {testimonials.heading || "Loved By Coffee Enthusiasts"}
              </Typography>
            ) : null}
          </MotionBox>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
              gap: 3,
            }}
          >
            {reviewItems.map((item: Record<string, any>, index: number) => (
              <MotionBox
                key={index}
                {...revealProps(0.08 * index)}
                whileHover={liftHover}
                {...containerProps(
                  testimonials.blockId,
                  `testimonials.card.${index}`,
                  `Testimonial ${index + 1}`,
                  "card",
                )}
                sx={{
                  bgcolor: rgba(PAPER, 0.03),
                  border: `1px solid ${rgba(gold, 0.14)}`,
                  borderRadius: 2,
                  p: 3,
                }}
              >
                <Stack direction="row" spacing={0.4} sx={{ mb: 2, color: gold }}>
                  {Array.from({ length: Math.max(1, Number(item.rating) || 5) }).map(
                    (_, starIndex) => (
                      <Star key={starIndex} size={14} fill={gold} color={gold} />
                    ),
                  )}
                </Stack>
                <Typography
                  {...getEditableTextProps(
                    testimonials.blockId,
                    `testimonials.${index}.quote`,
                    "multi",
                  )}
                  sx={{
                    fontFamily: headingFont,
                    fontSize: "1.2rem",
                    lineHeight: 1.45,
                    mb: 3,
                    minHeight: 96,
                  }}
                >
                  {item.quote}
                </Typography>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  {renderEditableMedia({
                    blockId: testimonials.blockId,
                    field: `testimonials.${index}.photo`,
                    label: `Guest photo ${index + 1}`,
                    src: item.photo || coffeeProAssets.avatars[index % 3],
                    alt: item.author || "Guest",
                    sx: {
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      objectFit: "cover",
                    },
                  })}
                  <Box>
                    <Typography
                      {...getEditableTextProps(
                        testimonials.blockId,
                        `testimonials.${index}.author`,
                        "single",
                      )}
                      sx={{ fontWeight: 700, color: gold }}
                    >
                      {item.author}
                    </Typography>
                    <Typography
                      {...getEditableTextProps(
                        testimonials.blockId,
                        `testimonials.${index}.position`,
                        "single",
                      )}
                      sx={{ fontSize: "0.82rem", color: rgba(PAPER, 0.6) }}
                    >
                      {item.position}
                    </Typography>
                  </Box>
                </Stack>
              </MotionBox>
            ))}
          </Box>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>
    ),
    gallery: (
      <TemplateSectionBoundary
        key="gallery"
        blockId={gallery.blockId}
        label="Gallery"
        sectionKey="gallery"
        content={gallery}
        id="gallery"
        sx={{ bgcolor: ink, color: PAPER, py: { xs: 8, md: 12 } }}
      >
        <TemplateInnerContainer>
          <MotionBox {...revealProps()} sx={{ textAlign: "center", mb: 5 }}>
            {!isHidden(gallery.blockId, "eyebrow") ? (
              <Typography
                {...getEditableTextProps(gallery.blockId, "eyebrow", "single", "eyebrowStyle")}
                sx={eyebrowSx(bodyFont, gold)}
              >
                {gallery.eyebrow || "Experience"}
              </Typography>
            ) : null}
            {!isHidden(gallery.blockId, "heading") ? (
              <Typography
                {...getEditableTextProps(gallery.blockId, "heading", "multi")}
                sx={{
                  mt: 2,
                  fontFamily: headingFont,
                  fontSize: { xs: "2.3rem", md: "3.2rem" },
                  lineHeight: 1.05,
                }}
              >
                {gallery.heading || "A Glimpse Into The Caffino Experience"}
              </Typography>
            ) : null}
          </MotionBox>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr 1fr", md: "1.2fr 0.9fr 1.1fr" },
              gridAutoRows: { xs: 140, md: 180 },
              gap: 1.5,
            }}
          >
            {galleryItems.map((item: Record<string, any>, index: number) => (
              <MotionBox
                key={index}
                {...softFade(0.05 * index)}
                whileHover={{ scale: 1.015, transition: { duration: 0.25 } }}
                {...containerProps(
                  gallery.blockId,
                  `gallery.item.${index}`,
                  `Gallery image ${index + 1}`,
                  "card",
                )}
                sx={{
                  gridRow: index === 0 || index === 2 ? "span 2" : "span 1",
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                {renderEditableMedia({
                  blockId: gallery.blockId,
                  field: `items.${index}.url`,
                  label: `Gallery image ${index + 1}`,
                  src: item.url || coffeeProAssets.gallery[index % 5],
                  alt: item.caption || `Gallery ${index + 1}`,
                  sx: {
                    width: "100%",
                    height: "100%",
                    minHeight: index === 0 || index === 2 ? 320 : 160,
                    objectFit: "cover",
                    display: "block",
                  },
                })}
              </MotionBox>
            ))}
          </Box>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>
    ),
    faq: (
      <TemplateSectionBoundary
        key="faq"
        blockId={faq.blockId}
        label="FAQ"
        sectionKey="faq"
        content={faq}
        id="faq"
        sx={{ bgcolor: ink, color: PAPER, py: { xs: 8, md: 12 } }}
      >
        <TemplateInnerContainer>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "0.9fr 1.1fr" },
              gap: { xs: 4, md: 8 },
            }}
          >
            <MotionBox {...revealProps()}>
              {!isHidden(faq.blockId, "heading") ? (
                <Typography
                  {...getEditableTextProps(faq.blockId, "heading", "multi")}
                  sx={{
                    fontFamily: headingFont,
                    fontSize: { xs: "2.5rem", md: "3.6rem" },
                    lineHeight: 1.05,
                    maxWidth: 360,
                  }}
                >
                  {faq.heading || "Frequently Asked Questions"}
                </Typography>
              ) : null}
            </MotionBox>
            <MotionBox {...revealProps(0.1)}>
              {faqItems.map((item: Record<string, any>, index: number) => (
                <Accordion
                  key={index}
                  disableGutters
                  elevation={0}
                  expanded={faqOpen === index}
                  onChange={(_, expanded) => setFaqOpen(expanded ? index : false)}
                  {...containerProps(
                    faq.blockId,
                    `faq.item.${index}`,
                    `FAQ ${index + 1}`,
                    "card",
                  )}
                  sx={{
                    bgcolor: "transparent",
                    color: PAPER,
                    borderBottom: `1px solid ${rgba(PAPER, 0.14)}`,
                    "&:before": { display: "none" },
                  }}
                >
                  <AccordionSummary
                    expandIcon={
                      faqOpen === index ? (
                        <Minus size={16} color={gold} />
                      ) : (
                        <Plus size={16} color={gold} />
                      )
                    }
                    sx={{ px: 0, py: 0.5 }}
                  >
                    <Typography
                      {...getEditableTextProps(
                        faq.blockId,
                        `features.${index}.title`,
                        "single",
                      )}
                      sx={{ fontFamily: headingFont, fontSize: "1.25rem" }}
                    >
                      {item.title}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 0, pb: 2.5 }}>
                    <Typography
                      {...getEditableTextProps(
                        faq.blockId,
                        `features.${index}.description`,
                        "multi",
                      )}
                      sx={{ color: rgba(PAPER, 0.68), lineHeight: 1.7 }}
                    >
                      {item.description}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </MotionBox>
          </Box>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>
    ),
    contact: (
      <TemplateSectionBoundary
        key="contact"
        blockId={contact.blockId}
        label="Reservation"
        sectionKey="contact"
        content={contact}
        id="contact"
        sx={{ bgcolor: ink, color: PAPER, py: { xs: 8, md: 12 } }}
      >
        <TemplateInnerContainer>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 5,
              alignItems: "start",
            }}
          >
            <MotionBox {...revealProps()}>
              {!isHidden(contact.blockId, "eyebrow") ? (
                <Typography
                  {...getEditableTextProps(contact.blockId, "eyebrow", "single", "eyebrowStyle")}
                  sx={eyebrowSx(bodyFont, gold)}
                >
                  {contact.eyebrow || "Reservations"}
                </Typography>
              ) : null}
              {!isHidden(contact.blockId, "heading") ? (
                <Typography
                  {...getEditableTextProps(contact.blockId, "heading", "multi")}
                  sx={{
                    mt: 2,
                    fontFamily: headingFont,
                    fontSize: { xs: "2.5rem", md: "3.4rem" },
                    lineHeight: 1.05,
                  }}
                >
                  {contact.heading || "Book Your Coffee Moment"}
                </Typography>
              ) : null}
              {!isHidden(contact.blockId, "description") ? (
                <Typography
                  {...getEditableTextProps(contact.blockId, "description", "multi")}
                  sx={{ mt: 2.5, color: rgba(PAPER, 0.7), lineHeight: 1.7, maxWidth: 440 }}
                >
                  {contact.description ||
                    "Reserve a table or ask about private gatherings — we will get back to you shortly."}
                </Typography>
              ) : null}
            </MotionBox>
            <MotionBox
              component="form"
              onSubmit={handleSubmit}
              {...revealProps(0.12)}
              {...containerProps(contact.blockId, "contact.form", "Booking form", "card")}
              sx={{
                display: "grid",
                gap: 1.5,
                p: 3,
                borderRadius: 2,
                border: `1px solid ${rgba(gold, 0.2)}`,
                bgcolor: rgba(PAPER, 0.03),
              }}
            >
              {contactFields.map((field) => (
                <Box
                  key={field.label}
                  component={field.label === "Message" ? "textarea" : "input"}
                  {...getFieldProps(field.label)}
                  placeholder={field.label}
                  rows={field.label === "Message" ? 4 : undefined}
                  sx={{
                    width: "100%",
                    bgcolor: rgba(PAPER, 0.06),
                    border: `1px solid ${rgba(PAPER, 0.14)}`,
                    borderRadius: 1,
                    color: PAPER,
                    px: 1.5,
                    py: 1.25,
                    fontFamily: bodyFont,
                    fontSize: "0.95rem",
                    resize: "vertical",
                    outline: "none",
                    "&:focus": { borderColor: gold },
                  }}
                />
              ))}
              <Button
                type="submit"
                disabled={status === "loading"}
                {...getEditableTextProps(
                  contact.blockId,
                  "buttonLabel",
                  "single",
                  "buttonTextStyle",
                )}
                sx={{
                  mt: 1,
                  bgcolor: gold,
                  color: ink,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  py: 1.25,
                  "&:hover": { bgcolor: rgba(gold, 0.88) },
                }}
              >
                {contact.buttonLabel || "Book Now"}
              </Button>
              {status === "success" ? (
                <Typography sx={{ color: gold, fontSize: "0.85rem" }}>
                  Request sent — we will confirm shortly.
                </Typography>
              ) : null}
              {status === "error" ? (
                <Typography sx={{ color: "#f87171", fontSize: "0.85rem" }}>
                  {errorMessage || "Something went wrong. Please try again."}
                </Typography>
              ) : null}
            </MotionBox>
          </Box>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>
    ),
  };

  const defaultOrder = [
    "hero",
    "why-us",
    "ritual",
    "craft",
    "menu",
    "testimonials",
    "gallery",
    "faq",
    "contact",
  ];
  const requestedOrder = asArray<string>(content.sectionOrder, defaultOrder);
  const order = [
    ...requestedOrder.filter((key) => sectionMap[key]),
    ...defaultOrder.filter((key) => !requestedOrder.includes(key)),
  ];

  return (
    <TemplatePageShell templateId="coffee-pro" data={data}>
      <Box sx={{ fontFamily: bodyFont, color: PAPER, bgcolor: ink }}>
        {order.map((key) => sectionMap[key])}
      </Box>
    </TemplatePageShell>
  );
};

export default CoffeeProTemplate;
