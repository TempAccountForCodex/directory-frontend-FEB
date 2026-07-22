import React from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import {
  ArrowRight,
  Check,
  Quote,
  Star,
  GraduationCap,
  Clock,
  MapPin,
  Phone,
  PlayCircle,
  Search,
  Languages,
  Cpu,
  Code2,
  Briefcase,
  Camera,
  Megaphone,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from "lucide-react";
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
import { educationProAssets } from "../../assets/education/education-pro";
import { buildCompanyTheme, rgba } from "../company/theme";
import { buildSharedHeaderTheme } from "../../utils/headerTheme";
import { useTemplateContactForm } from "../../utils/useTemplateContactForm";

const buildEducationProTheme = (data: TemplateProps["data"]) => {
  const theme = buildCompanyTheme({
    data,
    defaultPrimary: "#0f9c8f",
    defaultSecondary: "#eaf7f4",
    defaultHeadingFont: '"Poppins", "Segoe UI", sans-serif',
    defaultBodyFont: '"Inter", "Segoe UI", sans-serif',
  });

  return {
    ...theme,
    teal: theme.primary,
    navy: theme.dark,
    navyDeep: theme.darkest,
    soft: theme.lightPanel,
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

const eyebrowSx = (color: string, bodyFont: string) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 0.8,
  fontFamily: bodyFont,
  fontSize: "0.72rem",
  fontWeight: 800,
  letterSpacing: "0.12em",
  textTransform: "uppercase" as const,
  color,
});

// Pill-shaped eyebrow badge used across dark/premium sections (categories,
// promo, course-request) to match the reference design's rounded chip label.
const pillEyebrowSx = (bg: string, color: string, bodyFont: string) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 0.8,
  fontFamily: bodyFont,
  fontSize: "0.7rem",
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
  color,
  bgcolor: bg,
  borderRadius: 999,
  px: 2,
  py: 0.6,
});

const CATEGORY_ICONS = [Languages, Cpu, Code2, Briefcase, Camera, Megaphone];
const SOCIAL_ICONS = [Facebook, Twitter, Instagram, Linkedin];

// Lightweight scroll-reveal + hover-lift animation helpers shared across
// every section/card in this template. Purely presentational: they never
// touch the editable/selectable data-* attributes already spread onto
// elements, so save/select/hide/delete behaviour is unaffected.
const MotionBox = motion(Box);

const revealProps = (delay = 0) => ({
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] as const },
});

const liftHover = { y: -6, transition: { duration: 0.25 } };

export const EducationProTemplateHeader: React.FC<TemplateChromeProps> = ({
  data,
}) => {
  const { headingFont } = buildEducationProTheme(data);
  const content = asRecord(data.templateContent);
  const navbar = asRecord(content.navbar);
  const blockId = navbar.blockId;
  const navItems = asArray(navbar.navigationItems, [
    { label: "Home", link: "/" },
    { label: "About", link: "/about" },
    { label: "Courses", link: "/courses" },
    { label: "Contact", link: "/contact" },
  ]);
  const brandName =
    typeof navbar.brandName === "string" &&
    navbar.brandName.trim() &&
    navbar.brandName.trim() !== "Your Headline"
      ? navbar.brandName.trim()
      : data.name || "EdCare";

  // Shared, theme-aware Header colors. Background follows the active palette's
  // primary color (manual editor override wins) so palette switches show in the
  // header immediately, with nav/CTA text flipping for readability.
  const headerTheme = buildSharedHeaderTheme(data, navbar, {
    defaultPrimary: "#0f9c8f",
  });

  return (
    <Box {...getEditableSectionProps(blockId, "Header", "sectionStyle")}>
      <TemplateNavbarHeader
        navbarContent={{
          ...navbar,
          brandName,
          ctaText: navbar.ctaText || "Start Free Trial",
          ctaUrl: navbar.ctaLink || "/courses",
          navigationItems: navItems,
          navLinkColor: navbar.navLinkColor || headerTheme.navLinkColor,
          ctaColor: navbar.ctaColor || headerTheme.ctaColor,
        }}
        fallbackName={data.name}
        sectionNavItems={navItems.map((item: Record<string, any>) => ({
          label: item.label,
          id: String(item.id || item.label || "").toLowerCase(),
          target: item.link || item.target || "",
        }))}
        themeColor={headerTheme.themeColor}
        headingFont={headingFont}
        bgColor={headerTheme.bgColor}
        borderColor={headerTheme.borderColor}
        websiteId={data.websiteId}
        ctaHoverTextColor={headerTheme.ctaHoverTextColor}
        mobileCtaColor={headerTheme.mobileCtaColor}
        mobileCtaHoverTextColor={headerTheme.mobileCtaHoverTextColor}
      />
    </Box>
  );
};

export const EducationProTemplateFooter: React.FC<TemplateChromeProps> = ({
  data,
}) => {
  const { teal, navyDeep, headingFont, bodyFont } =
    buildEducationProTheme(data);
  const content = asRecord(data.templateContent);
  const footer = asRecord(content.footer);
  const blockId = footer.blockId;
  const {
    status: newsletterStatus,
    errorMessage: newsletterError,
    getFieldProps: getNewsletterFieldProps,
    handleSubmit: handleNewsletterSubmit,
  } = useTemplateContactForm(
    [{ label: "Email", fieldType: "email", required: true }],
    data.websiteId,
    "footer-newsletter-form",
    { formId: blockId, formName: footer.heading || "Footer newsletter" },
  );
  const footerLogo =
    typeof footer.logo === "string" &&
    footer.logo.trim() &&
    /^(?:https?:\/\/|\/)/i.test(footer.logo.trim())
      ? footer.logo
      : "";
  const footerLogoText =
    typeof footer.logoText === "string" && footer.logoText.trim()
      ? footer.logoText.trim()
      : data.name || "EdCare";
  const columns = asArray(footer.columns, [
    {
      title: "Company Info",
      links: [
        { label: "About Us", url: "/about" },
        { label: "All Courses", url: "/courses" },
      ],
    },
    {
      title: "Useful Links",
      links: [
        { label: "Contact", url: "/contact" },
        { label: "All Courses", url: "/courses" },
      ],
    },
  ]);

  return (
    <Box
      component="footer"
      {...getEditableSectionProps(blockId, "Footer", "sectionStyle")}
      sx={{ bgcolor: navyDeep, color: "#eef6f4" }}
    >
      <Container maxWidth="xl" sx={{ px: { xs: 2, md: 4 } }}>
        <Box
          {...containerProps(
            blockId,
            "footer.newsletter",
            "Newsletter row",
            "card",
          )}
          sx={{
            py: { xs: 5, md: 6 },
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr auto" },
            gap: 3,
            alignItems: "center",
            borderBottom: `1px solid ${rgba("#ffffff", 0.1)}`,
          }}
        >
          <Typography
            {...getEditableTextProps(blockId, "heading", "multi")}
            sx={{
              fontFamily: headingFont,
              fontWeight: 700,
              fontSize: { xs: "1.5rem", md: "1.9rem" },
              maxWidth: 480,
            }}
          >
            {footer.heading || "Subscribe Our Newsletter For Latest Updates"}
          </Typography>
          <Box
            component="form"
            onSubmit={handleNewsletterSubmit}
            sx={{ width: "100%" }}
          >
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <Box
                component="input"
                type="email"
                placeholder="Enter Your E-mail"
                {...getNewsletterFieldProps("Email")}
                sx={{
                  bgcolor: rgba("#ffffff", 0.08),
                  border: `1px solid ${rgba("#ffffff", 0.16)}`,
                  borderRadius: 999,
                  px: 2.5,
                  py: 1.1,
                  minWidth: { sm: 240 },
                  color: "#fff",
                  fontSize: "0.85rem",
                  fontFamily: bodyFont,
                  outline: "none",
                  "&::placeholder": { color: rgba("#ffffff", 0.55) },
                  "&:focus": { borderColor: rgba(teal, 0.6) },
                }}
              />
              <Button
                type="submit"
                disabled={newsletterStatus === "loading"}
                {...getEditableTextProps(blockId, "ctaText", "single")}
                sx={{
                  bgcolor: teal,
                  color: "#fff",
                  borderRadius: 999,
                  px: 3,
                  fontWeight: 700,
                  textTransform: "none",
                  whiteSpace: "nowrap",
                  "&:hover": { bgcolor: teal, opacity: 0.9 },
                }}
              >
                {newsletterStatus === "loading"
                  ? "Subscribing…"
                  : footer.ctaText || "Subscribe Now"}
              </Button>
            </Stack>
            {newsletterStatus === "success" && (
              <Typography sx={{ mt: 1.2, color: "#8fe3d6", fontSize: "0.82rem", fontWeight: 600 }}>
                Thanks for subscribing!
              </Typography>
            )}
            {newsletterStatus === "error" && (
              <Typography sx={{ mt: 1.2, color: "#ffb4a8", fontSize: "0.82rem", fontWeight: 600 }}>
                {newsletterError}
              </Typography>
            )}
          </Box>
        </Box>

        <Box
          sx={{
            py: { xs: 5, md: 6 },
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.4fr repeat(2, 1fr)" },
            gap: 4,
          }}
        >
          <Box>
            {footerLogo ? (
              renderEditableMedia({
                blockId,
                field: "logo",
                label: "Footer logo",
                src: footerLogo,
                alt: data.name || "EdCare",
                sx: {
                  width: "min(180px, 100%)",
                  height: 44,
                  objectFit: "contain",
                },
              })
            ) : (
              <Typography
                {...getEditableTextProps(blockId, "logoText", "single")}
                sx={{
                  fontFamily: headingFont,
                  fontWeight: 800,
                  fontSize: "1.6rem",
                  color: "#fff",
                }}
              >
                {footerLogoText}
              </Typography>
            )}
            <Typography
              {...getEditableTextProps(blockId, "description", "multi")}
              sx={{
                mt: 1.5,
                color: rgba("#ffffff", 0.6),
                lineHeight: 1.7,
                maxWidth: 320,
              }}
            >
              {footer.description ||
                "A modern learning community built around expert instructors and flexible courses."}
            </Typography>
          </Box>
          {columns.map((column: Record<string, any>, columnIndex: number) => (
            <Stack key={`${column.title}-${columnIndex}`} spacing={1.3}>
              <Typography
                {...getEditableTextProps(
                  blockId,
                  `columns.${columnIndex}.title`,
                  "single",
                )}
                sx={{
                  fontFamily: headingFont,
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  color: "#fff",
                }}
              >
                {column.title}
              </Typography>
              {asArray<Record<string, any>>(column.links, []).map(
                (link, linkIndex) => (
                  <Box
                    key={`${link.label}-${linkIndex}`}
                    component="a"
                    href={link.url || link.link || "#"}
                    {...getEditableTextProps(
                      blockId,
                      `columns.${columnIndex}.links.${linkIndex}.label`,
                      "single",
                    )}
                    sx={{
                      color: rgba("#ffffff", 0.6),
                      textDecoration: "none",
                      fontSize: "0.9rem",
                      "&:hover": { color: teal },
                    }}
                  >
                    {link.label}
                  </Box>
                ),
              )}
            </Stack>
          ))}
        </Box>

        <Typography
          {...getEditableTextProps(blockId, "copyright", "single")}
          sx={{
            py: 3,
            borderTop: `1px solid ${rgba("#ffffff", 0.1)}`,
            color: rgba("#ffffff", 0.45),
            fontSize: "0.8rem",
            textAlign: "center",
            fontFamily: bodyFont,
          }}
        >
          {footer.copyright ||
            `© 2026 ${data.name || "EdCare"}. All Rights Reserved.`}
        </Typography>
      </Container>
    </Box>
  );
};

const EducationProTemplate: React.FC<TemplateProps> = ({ data }) => {
  const { teal, navy, navyDeep, soft, ink, inkSoft, headingFont, bodyFont } =
    buildEducationProTheme(data);
  const content = asRecord(data.templateContent);
  const pageBodies = asRecord(content.pageBodies);
  const home = asRecord(pageBodies.home);
  const hero = asRecord(home.hero || content.hero);
  const categories = asRecord(home.categories || content.categories);
  const intro = asRecord(home.intro || content.intro);
  const courses = asRecord(home.courses || content.courses);
  const promo = asRecord(home.promo || content.promo);
  const instructors = asRecord(home.instructors || content.instructors);
  const courseRequest = asRecord(home.courseRequest || content.courseRequest);
  const testimonials = asRecord(home.testimonials || content.testimonials);
  const stats = asRecord(home.stats || content.stats);
  const about = asRecord(pageBodies.about);
  const aboutBanner = asRecord(about.banner);
  const aboutIntro = asRecord(about.intro);
  const aboutFeatures = asRecord(about.features);
  const aboutStats = asRecord(about.stats);
  const aboutMembers = asRecord(about.members);
  const aboutShowcase = asRecord(about.showcase);
  const coursesPage = asRecord(pageBodies.courses);
  const coursesBanner = asRecord(coursesPage.banner);
  const coursesFeatures = asRecord(coursesPage.features);
  const contactBody = asRecord(pageBodies.contact);
  const contactBanner = asRecord(contactBody.banner);
  const contactPage = asRecord(contactBody.contact || content.contact);

  // Real, backend-connected contact form (Contact page "Leave A Reply" card).
  // Must stay wired through useTemplateContactForm — a static styled Box is
  // not an acceptable substitute (see PRD §9.1).
  const {
    status: contactPageStatus,
    errorMessage: contactPageError,
    getFieldProps: getContactPageFieldProps,
    handleSubmit: handleContactPageSubmit,
  } = useTemplateContactForm(
    [
      { label: "Your Name" },
      { label: "Your Email" },
      { label: "Subject", required: false },
      { label: "Message" },
    ],
    data.websiteId,
    "contact-page-form",
    {
      formId: contactPage.blockId,
      formName: contactPage.heading || "Contact page form",
    },
  );

  const heroStats = asArray(hero.items, [
    { value: "9.5K+", heading: "Enrolled Students" },
    { value: "15.5K+", heading: "Classes Completed" },
    { value: "7.6K+", heading: "Certified Members" },
  ]);
  const categoryItems = asArray(categories.features, [
    { icon: "01", title: "Language Learning" },
    { icon: "02", title: "IT & Software" },
    { icon: "03", title: "Web Development" },
    { icon: "04", title: "Business Management" },
    { icon: "05", title: "Photography" },
    { icon: "06", title: "Digital Marketing" },
  ]);
  const introItems = asArray(intro.items, [
    { heading: "Instructor-led online classes" },
    { heading: "Flexible, self-paced access" },
    { heading: "Personalized learning progress" },
  ]);
  const courseItems = asArray(courses.features, [
    {
      icon: "Culinary",
      title: "The Complete Beginner's Guide to Cooking",
      description: "12 lessons · 5 students",
      image: educationProAssets.scienceLab,
    },
    {
      icon: "Programming",
      title: "Getting Started With PHP And MySQL",
      description: "18 lessons · 8 students",
      image: educationProAssets.onlineClass,
    },
    {
      icon: "Programming",
      title: "Advanced Java Programming With Eclipse",
      description: "12 lessons · 3 students",
      image: educationProAssets.groupStudy,
    },
  ]);
  const instructorItems = asArray(instructors.members, [
    {
      name: "Noah C. Logan",
      role: "Programming",
      photo: educationProAssets.instructorNora,
    },
    {
      name: "Scarlett Foster",
      role: "Marketing",
      photo: educationProAssets.instructorScarlet,
    },
    {
      name: "Chloe Smith",
      role: "Design",
      photo: educationProAssets.instructorChloe,
    },
    {
      name: "Madison Chloe",
      role: "Business",
      photo: educationProAssets.instructorMelanie,
    },
  ]);
  const testimonialItems = asArray(
    testimonials.testimonials || testimonials.items,
    [
      {
        quote:
          "The instructors made every lesson feel practical. I finished the program with skills I actually use every day.",
        author: "Michael Thomas",
        role: "Web Development student",
        photo: educationProAssets.instructorNora,
        rating: 5,
      },
      {
        quote:
          "Flexible scheduling and genuinely caring mentors. This is the most supportive learning community I've found.",
        author: "Mathew White",
        role: "Business Management student",
        photo: educationProAssets.instructorChloe,
        rating: 5,
      },
    ],
  );
  const statItems = asArray(stats.stats, [
    { value: "5,192+", label: "Registered Students" },
    { value: "15,485+", label: "Classes Completed" },
    { value: "97.55%", label: "Satisfaction Rate" },
    { value: "97.55%", label: "Course Completion" },
  ]);
  const aboutFeatureItems = asArray(aboutFeatures.features, []);
  const aboutStatItems = asArray(aboutStats.stats, []);
  const aboutMemberItems = asArray(aboutMembers.members, []);
  const aboutShowcaseItems = asArray(aboutShowcase.features, []);

  // Resolve page-specific bodies in both the gallery preview and the real
  // public-site route. Without the `/site/:slug/:page` match, changing a real
  // site's URL to `/about` still rendered Education Pro's Home composition.
  const location = useLocation();
  const previewPageMatch = location.pathname.match(
    /^\/landing-preview\/[^/]+\/([^/?#]+)/,
  );
  const publicSitePageMatch = location.pathname.match(
    /^\/site\/[^/]+\/([^/?#]+)/,
  );
  const editorPagePath =
    typeof content.__activePagePath === "string"
      ? content.__activePagePath.replace(/^\/+|\/+$/g, "")
      : "";
  const requestedPage =
    editorPagePath ||
    previewPageMatch?.[1] ||
    publicSitePageMatch?.[1] ||
    "home";
  const activePage = (
    ["about", "courses", "contact"].includes(requestedPage)
      ? requestedPage
      : "home"
  ) as
    "home" | "about" | "courses" | "contact";

  const breadcrumbHero = (
    pageKey: string,
    heroContent: Record<string, any>,
    fallbackTitle: string,
    fallbackImage: string,
    fallbackEyebrow: string,
  ) => (
    <TemplateSectionBoundary
      blockId={heroContent.blockId}
      label={`${fallbackTitle} banner`}
      sectionKey={`${pageKey}-hero`}
      content={heroContent}
      sx={{
        position: "relative",
        py: { xs: 8, md: 11 },
        overflow: "hidden",
        color: "#fff",
        // Default banner background. The editor's "Replace Background → Image"
        // persists to sectionStyle/outerSectionStyle.backgroundImageUrl, which
        // TemplateSectionBoundary applies via getSectionStyleSx AFTER this sx
        // and therefore overrides it. Priority: saved section background image
        // > content.image > template default asset. Rendering the image as a
        // CSS background (instead of an absolutely positioned <img>) is what
        // lets the editor replacement actually show in canvas/public.
        backgroundImage: `url(${heroContent.image || fallbackImage})`,
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
          background: `linear-gradient(115deg, ${rgba(navyDeep, 0.92)} 0%, ${rgba(navy, 0.82)} 45%, ${rgba(navyDeep, 0.7)} 100%)`,
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: -70,
          right: -70,
          width: 220,
          height: 220,
          borderRadius: "50%",
          border: `1px dashed ${rgba(teal, 0.4)}`,
          pointerEvents: "none",
        }}
      />
      <TemplateInnerContainer sx={{ position: "relative" }}>
        <MotionBox {...revealProps()}>
          <Typography
            {...getEditableTextProps(heroContent.blockId, "eyebrow", "single")}
            sx={{ ...pillEyebrowSx(rgba(teal, 0.18), "#8fe3d6", bodyFont), display: "inline-flex" }}
          >
            {heroContent.eyebrow || fallbackEyebrow}
          </Typography>
          <Typography
            {...getEditableTextProps(heroContent.blockId, "heading", "single")}
            sx={{
              mt: 2,
              fontFamily: headingFont,
              fontWeight: 700,
              fontSize: { xs: "2.2rem", md: "2.9rem" },
              color: "#fff",
            }}
          >
            {heroContent.heading || fallbackTitle}
          </Typography>
          <Typography sx={{ mt: 1, color: rgba("#ffffff", 0.65), fontSize: "0.9rem" }}>
            Home /{" "}
            <Box component="span" sx={{ color: "#8fe3d6", fontWeight: 600 }}>
              {heroContent.heading || fallbackTitle}
            </Box>
          </Typography>
        </MotionBox>
      </TemplateInnerContainer>
    </TemplateSectionBoundary>
  );

  const coursesPageItems = asArray(coursesFeatures.features, [
    ...courseItems,
    {
      icon: "Programming",
      title: "The Complete Python Bootcamp From Zero",
      description: "16 lessons · 2 students",
      image: educationProAssets.studentLearning,
    },
    {
      icon: "Culinary",
      title: "Practical Cooking Course for Students",
      description: "11 lessons · 2 students",
      image: educationProAssets.studentTutoring,
    },
    {
      icon: "Culinary",
      title: "A Step-by-Step Course for Busy People",
      description: "12 lessons · 1 student",
      image: educationProAssets.groupStudy,
    },
  ]);

  const renderAboutPage = () => (
    <>
      {breadcrumbHero(
        "about",
        aboutBanner,
        "About Us",
        educationProAssets.studentTutoring,
        "Get to know EdCare",
      )}
      <TemplateSectionBoundary
        blockId={aboutIntro.blockId}
        label="Our story"
        sectionKey="about-story"
        content={aboutIntro}
        sx={{ bgcolor: "#fff", py: { xs: 7, md: 10 } }}
      >
        <TemplateInnerContainer>
          <MotionBox
            {...revealProps()}
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "0.9fr 1.1fr" },
              gap: { xs: 5, md: 7 },
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1.2fr 1fr",
                gap: 1.5,
              }}
            >
              <Box sx={{ position: "relative" }}>
                {renderEditableMedia({
                  blockId: aboutIntro.blockId,
                  field: "image",
                  label: "Story image",
                  src: aboutIntro.image || educationProAssets.groupStudy,
                  alt: "Students in a video lesson",
                  sx: {
                    width: "100%",
                    aspectRatio: "3 / 4",
                    objectFit: "cover",
                    borderRadius: "20px",
                  },
                })}
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <Box
                    sx={{
                      width: 46,
                      height: 46,
                      borderRadius: "50%",
                      bgcolor: "rgba(255,255,255,0.9)",
                      display: "grid",
                      placeItems: "center",
                      color: teal,
                    }}
                  >
                    <PlayCircle size={22} />
                  </Box>
                </Box>
              </Box>
              {renderEditableMedia({
                blockId: aboutIntro.blockId,
                field: "image",
                label: "Story image",
                src: aboutIntro.image || educationProAssets.scienceLab,
                alt: "Students studying together",
                sx: {
                  width: "100%",
                  aspectRatio: "3 / 4",
                  objectFit: "cover",
                  borderRadius: "20px",
                  alignSelf: "end",
                },
              })}
            </Box>
            <Box>
              <Typography
                {...getEditableTextProps(aboutIntro.blockId, "eyebrow", "single")}
                sx={eyebrowSx(teal, bodyFont)}
              >
                {aboutIntro.eyebrow || "Our Speciality"}
              </Typography>
              <Typography
                {...getEditableTextProps(aboutIntro.blockId, "heading", "single")}
                sx={{
                  mt: 1.5,
                  fontFamily: headingFont,
                  fontWeight: 700,
                  fontSize: { xs: "1.9rem", md: "2.4rem" },
                  color: ink,
                  lineHeight: 1.2,
                }}
              >
                {aboutIntro.heading ||
                  "Over 10 Years in Distant Learning for Skill Development"}
              </Typography>
              <Typography
                {...getEditableTextProps(aboutIntro.blockId, "body", "multi")}
                sx={{ mt: 2, color: inkSoft, lineHeight: 1.8 }}
              >
                {aboutIntro.body || aboutIntro.description || ""}
              </Typography>
              <Box
                sx={{
                  mt: 3,
                  display: "grid",
                  gridTemplateColumns: "repeat(2, auto)",
                  gap: 4,
                }}
              >
                {asArray(aboutIntro.items, [])
                  .slice(0, 2)
                  .map((stat: Record<string, any>, index: number) => (
                    <Box key={index}>
                      <Typography
                        {...getEditableTextProps(
                          aboutIntro.blockId,
                          `items.${index}.value`,
                          "single",
                        )}
                        sx={{
                          fontFamily: headingFont,
                          fontWeight: 700,
                          fontSize: "1.4rem",
                          color: ink,
                        }}
                      >
                        {stat.value || ""}
                      </Typography>
                      <Typography
                        {...getEditableTextProps(
                          aboutIntro.blockId,
                          `items.${index}.heading`,
                          "single",
                        )}
                        sx={{ fontSize: "0.8rem", color: inkSoft }}
                      >
                        {stat.heading || ""}
                      </Typography>
                    </Box>
                  ))}
              </Box>
              <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
                sx={{ mt: 3.5 }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    bgcolor: rgba(teal, 0.14),
                    color: teal,
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <Phone size={18} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: "0.75rem", color: inkSoft }}>
                    Call Anytime
                  </Typography>
                  <Typography sx={{ fontWeight: 700, color: ink }}>
                    +256 214 203 215
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </MotionBox>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>

      <TemplateSectionBoundary
        blockId={aboutFeatures.blockId}
        label="Why choose us"
        sectionKey="about-features"
        content={aboutFeatures}
        sx={{ bgcolor: soft, py: { xs: 6, md: 9 } }}
      >
        <TemplateInnerContainer>
          <MotionBox {...revealProps()}>
            <Typography
              {...getEditableTextProps(aboutFeatures.blockId, "eyebrow", "single")}
              sx={{
                ...eyebrowSx(teal, bodyFont),
                justifyContent: "center",
                display: "flex",
              }}
            >
              {aboutFeatures.eyebrow || "Our Feature"}
            </Typography>
            <Typography
              {...getEditableTextProps(aboutFeatures.blockId, "heading", "single")}
              sx={{
                mt: 1.5,
                textAlign: "center",
                fontFamily: headingFont,
                fontWeight: 700,
                fontSize: { xs: "1.7rem", md: "2.1rem" },
                color: ink,
              }}
            >
              {aboutFeatures.heading || "Online Education That Improves You"}
            </Typography>
          </MotionBox>
          <Box
            sx={{
              mt: 5,
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
              gap: 3,
            }}
          >
            {aboutFeatureItems.map((item: Record<string, any>, index: number) => (
              <MotionBox
                key={index}
                {...revealProps(index * 0.08)}
                whileHover={liftHover}
                sx={{
                  bgcolor: "#fff",
                  borderRadius: "18px",
                  p: 3,
                  textAlign: "center",
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    mx: "auto",
                    mb: 1.6,
                    borderRadius: "14px",
                    bgcolor: rgba(teal, 0.14),
                    color: teal,
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <GraduationCap size={22} />
                </Box>
                <Typography
                  {...getEditableTextProps(
                    aboutFeatures.blockId,
                    `features.${index}.title`,
                    "single",
                  )}
                  sx={{ fontWeight: 600, color: ink, fontSize: "0.95rem" }}
                >
                  {item.title || ""}
                </Typography>
                <Typography
                  {...getEditableTextProps(
                    aboutFeatures.blockId,
                    `features.${index}.description`,
                    "multi",
                  )}
                  sx={{ mt: 0.8, color: inkSoft, fontSize: "0.8rem" }}
                >
                  {item.description || ""}
                </Typography>
              </MotionBox>
            ))}
          </Box>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>

      <TemplateSectionBoundary
        blockId={aboutStats.blockId}
        label="Outcomes"
        sectionKey="about-stats"
        content={aboutStats}
        sx={{ bgcolor: teal, py: { xs: 5, md: 6 } }}
      >
        <TemplateInnerContainer>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, 1fr)",
                md: `repeat(${Math.max(aboutStatItems.length, 1)}, 1fr)`,
              },
              gap: 3,
            }}
          >
            {aboutStatItems.map((stat: Record<string, any>, index: number) => (
              <MotionBox
                key={index}
                {...revealProps(index * 0.06)}
                sx={{ textAlign: "center" }}
              >
                <Typography
                  {...getEditableTextProps(
                    aboutStats.blockId,
                    `stats.${index}.number`,
                    "single",
                  )}
                  sx={{
                    fontFamily: headingFont,
                    fontWeight: 700,
                    fontSize: { xs: "1.5rem", md: "2rem" },
                    color: "#fff",
                  }}
                >
                  {stat.number ?? stat.value ?? ""}
                  {stat.suffix ?? ""}
                </Typography>
                <Typography
                  {...getEditableTextProps(
                    aboutStats.blockId,
                    `stats.${index}.label`,
                    "single",
                  )}
                  sx={{
                    color: rgba("#ffffff", 0.85),
                    fontSize: "0.82rem",
                    mt: 0.5,
                  }}
                >
                  {stat.label}
                </Typography>
              </MotionBox>
            ))}
          </Box>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>

      <TemplateSectionBoundary
        blockId={aboutMembers.blockId}
        label="Expert instructors"
        sectionKey="about-instructors"
        content={aboutMembers}
        sx={{ bgcolor: "#fff", py: { xs: 7, md: 10 } }}
      >
        <TemplateInnerContainer>
          <MotionBox {...revealProps()}>
            <Typography
              {...getEditableTextProps(aboutMembers.blockId, "heading", "single")}
              sx={{
                textAlign: "center",
                fontFamily: headingFont,
                fontWeight: 700,
                fontSize: { xs: "1.7rem", md: "2.1rem" },
                color: ink,
              }}
            >
              {aboutMembers.heading || "Meet Our Expert Instructor"}
            </Typography>
          </MotionBox>
          <Box
            sx={{
              mt: 5,
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, 1fr)",
                md: `repeat(${Math.max(aboutMemberItems.length, 1)}, 1fr)`,
              },
              gap: 3,
            }}
          >
            {aboutMemberItems.map(
              (member: Record<string, any>, index: number) => (
                <MotionBox
                  key={index}
                  {...revealProps(index * 0.08)}
                  whileHover={liftHover}
                  sx={{ textAlign: "center" }}
                >
                  {renderEditableMedia({
                    blockId: aboutMembers.blockId,
                    field: `members.${index}.photo`,
                    label: `Instructor photo ${index + 1}`,
                    src: member.photo,
                    alt: member.name,
                    sx: {
                      width: "100%",
                      aspectRatio: "1 / 1",
                      objectFit: "cover",
                      borderRadius: "18px",
                      mb: 1.6,
                    },
                  })}
                  <Typography
                    {...getEditableTextProps(
                      aboutMembers.blockId,
                      `members.${index}.name`,
                      "single",
                    )}
                    sx={{
                      fontFamily: headingFont,
                      fontWeight: 600,
                      color: ink,
                      fontSize: "0.95rem",
                    }}
                  >
                    {member.name}
                  </Typography>
                  <Typography
                    {...getEditableTextProps(
                      aboutMembers.blockId,
                      `members.${index}.role`,
                      "single",
                    )}
                    sx={{ color: teal, fontSize: "0.8rem", fontWeight: 600 }}
                  >
                    {member.role}
                  </Typography>
                </MotionBox>
              ),
            )}
          </Box>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>

      <TemplateSectionBoundary
        blockId={aboutShowcase.blockId}
        label="Leadership"
        sectionKey="about-showcase"
        content={aboutShowcase}
        sx={{ bgcolor: soft, py: { xs: 7, md: 10 } }}
      >
        <TemplateInnerContainer>
          <MotionBox {...revealProps()}>
            <Typography
              {...getEditableTextProps(aboutShowcase.blockId, "heading", "multi")}
              sx={{
                textAlign: "center",
                fontFamily: headingFont,
                fontWeight: 700,
                fontSize: { xs: "1.7rem", md: "2.1rem" },
                color: ink,
                maxWidth: 620,
                mx: "auto",
              }}
            >
              {aboutShowcase.heading ||
                "Founded by Industry Leaders With Large Scale Business"}
            </Typography>
          </MotionBox>
          <Box
            sx={{
              mt: 5,
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
              gap: 3,
            }}
          >
            {aboutShowcaseItems.map((item: Record<string, any>, index: number) => (
              <MotionBox
                key={index}
                {...revealProps(index * 0.1)}
                whileHover={liftHover}
                sx={{
                  position: "relative",
                  borderRadius: "20px",
                  overflow: "hidden",
                }}
              >
                {renderEditableMedia({
                  blockId: aboutShowcase.blockId,
                  field: `features.${index}.image`,
                  label: `Showcase image ${index + 1}`,
                  src: item.image || educationProAssets.onlineClass,
                  alt: item.title || "Career opportunities in EdCare",
                  sx: {
                    width: "100%",
                    aspectRatio: "16 / 10",
                    objectFit: "cover",
                    display: "block",
                  },
                })}
                <Box
                  sx={{
                    position: "absolute",
                    left: 16,
                    bottom: 16,
                    bgcolor: "rgba(15,23,23,0.75)",
                    color: "#fff",
                    px: 2,
                    py: 1,
                    borderRadius: "10px",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                  }}
                >
                  <Typography
                    {...getEditableTextProps(
                      aboutShowcase.blockId,
                      `features.${index}.title`,
                      "single",
                    )}
                    sx={{ fontSize: "inherit", fontWeight: "inherit" }}
                  >
                    {item.title || ""}
                  </Typography>
                </Box>
              </MotionBox>
            ))}
          </Box>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>
    </>
  );

  const renderCoursesPage = () => (
    <>
      {breadcrumbHero(
        "courses",
        coursesBanner,
        "All Courses",
        educationProAssets.studentLearning,
        "Browse our catalog",
      )}
      <TemplateSectionBoundary
        blockId={coursesFeatures.blockId}
        label="All courses"
        sectionKey="courses-grid"
        content={coursesFeatures}
        sx={{ bgcolor: "#fff", py: { xs: 7, md: 10 } }}
      >
        <TemplateInnerContainer>
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
            {coursesPageItems.map(
              (item: Record<string, any>, index: number) => (
                <MotionBox
                  key={index}
                  {...revealProps((index % 3) * 0.08)}
                  whileHover={liftHover}
                  sx={{
                    bgcolor: "#fff",
                    borderRadius: "20px",
                    overflow: "hidden",
                    boxShadow: `0 20px 40px ${rgba(navy, 0.08)}`,
                  }}
                >
                  {renderEditableMedia({
                    blockId: coursesFeatures.blockId,
                    field: `features.${index}.image`,
                    label: `Course image ${index + 1}`,
                    src: item.image,
                    alt: item.title,
                    sx: {
                      width: "100%",
                      height: 190,
                      objectFit: "cover",
                      display: "block",
                    },
                  })}
                  <Box sx={{ p: 2.6 }}>
                    <Typography
                      {...getEditableTextProps(
                        coursesFeatures.blockId,
                        `features.${index}.icon`,
                        "single",
                      )}
                      sx={{
                        display: "inline-block",
                        bgcolor: rgba(teal, 0.12),
                        color: teal,
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        borderRadius: 999,
                        px: 1.4,
                        py: 0.4,
                        mb: 1.4,
                      }}
                    >
                      {item.icon}
                    </Typography>
                    <Typography
                      {...getEditableTextProps(
                        coursesFeatures.blockId,
                        `features.${index}.title`,
                        "single",
                      )}
                      sx={{
                        fontFamily: headingFont,
                        fontWeight: 600,
                        fontSize: "1.05rem",
                        color: ink,
                        lineHeight: 1.3,
                      }}
                    >
                      {item.title}
                    </Typography>
                    <Typography
                      {...getEditableTextProps(
                        coursesFeatures.blockId,
                        `features.${index}.description`,
                        "single",
                      )}
                      sx={{ mt: 1, color: inkSoft, fontSize: "0.85rem" }}
                    >
                      {item.description}
                    </Typography>
                  </Box>
                </MotionBox>
              ),
            )}
          </Box>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>
    </>
  );

  const renderContactPage = () => (
    <>
      {breadcrumbHero(
        "contact",
        contactBanner,
        "Contact",
        educationProAssets.groupStudy,
        "We'd love to hear from you",
      )}
      <TemplateSectionBoundary
        blockId={contactPage.blockId}
        label="Contact"
        sectionKey="contact-body"
        content={contactPage}
        sx={{ bgcolor: "#fff", py: { xs: 7, md: 10 } }}
      >
        <TemplateInnerContainer>
          <MotionBox
            {...revealProps()}
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1.3fr 1fr" },
              gap: 4,
            }}
          >
            <Box
              component="form"
              onSubmit={handleContactPageSubmit}
              sx={{ bgcolor: soft, borderRadius: "20px", p: { xs: 3, md: 4 } }}
            >
              <Typography
                {...getEditableTextProps(contactPage.blockId, "heading", "single")}
                sx={{
                  fontFamily: headingFont,
                  fontWeight: 700,
                  fontSize: "1.5rem",
                  color: ink,
                }}
              >
                {contactPage.heading || "Leave A Reply"}
              </Typography>
              <Typography
                {...getEditableTextProps(contactPage.blockId, "description", "multi")}
                sx={{ mt: 0.5, color: inkSoft, fontSize: "0.9rem" }}
              >
                {contactPage.description ||
                  "Fill-up the form and message us of your amazing question"}
              </Typography>
              <Box
                sx={{
                  mt: 3,
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 2,
                }}
              >
                {(["Your Name", "Your Email"] as const).map((label) => (
                  <Box
                    key={label}
                    component="input"
                    type={label === "Your Email" ? "email" : "text"}
                    placeholder={label}
                    {...getContactPageFieldProps(label)}
                    sx={{
                      bgcolor: "#fff",
                      border: `1px solid ${rgba(navy, 0.1)}`,
                      borderRadius: "10px",
                      px: 2,
                      py: 1.4,
                      color: ink,
                      fontSize: "0.9rem",
                      fontFamily: bodyFont,
                      outline: "none",
                      "&::placeholder": { color: inkSoft },
                      "&:focus": { borderColor: rgba(teal, 0.5) },
                    }}
                  />
                ))}
              </Box>
              <Box
                component="input"
                type="text"
                placeholder="Subject"
                {...getContactPageFieldProps("Subject")}
                sx={{
                  mt: 2,
                  width: "100%",
                  bgcolor: "#fff",
                  border: `1px solid ${rgba(navy, 0.1)}`,
                  borderRadius: "10px",
                  px: 2,
                  py: 1.4,
                  color: ink,
                  fontSize: "0.9rem",
                  fontFamily: bodyFont,
                  outline: "none",
                  "&::placeholder": { color: inkSoft },
                  "&:focus": { borderColor: rgba(teal, 0.5) },
                }}
              />
              <Box
                component="textarea"
                placeholder="Message"
                {...getContactPageFieldProps("Message")}
                sx={{
                  mt: 2,
                  width: "100%",
                  bgcolor: "#fff",
                  border: `1px solid ${rgba(navy, 0.1)}`,
                  borderRadius: "10px",
                  px: 2,
                  py: 1.4,
                  color: ink,
                  fontSize: "0.9rem",
                  fontFamily: bodyFont,
                  minHeight: 96,
                  outline: "none",
                  resize: "vertical",
                  "&::placeholder": { color: inkSoft },
                  "&:focus": { borderColor: rgba(teal, 0.5) },
                }}
              />
              {contactPageStatus === "success" && (
                <Typography sx={{ mt: 1.5, color: teal, fontSize: "0.85rem", fontWeight: 600 }}>
                  Thanks! Your message has been sent.
                </Typography>
              )}
              {contactPageStatus === "error" && (
                <Typography sx={{ mt: 1.5, color: "#c0392b", fontSize: "0.85rem", fontWeight: 600 }}>
                  {contactPageError}
                </Typography>
              )}
              <Button
                {...getEditableTextProps(contactPage.blockId, "buttonLabel", "single")}
                type="submit"
                disabled={contactPageStatus === "loading"}
                sx={{
                  mt: 2.5,
                  width: "100%",
                  bgcolor: teal,
                  color: "#fff",
                  borderRadius: 999,
                  py: 1.3,
                  fontWeight: 700,
                  textTransform: "none",
                  "&:hover": { bgcolor: teal, opacity: 0.9 },
                }}
              >
                {contactPageStatus === "loading"
                  ? "Sending…"
                  : contactPage.buttonLabel || "Submit Message"}
              </Button>
            </Box>
            <Box>
              <Typography
                sx={{
                  fontFamily: headingFont,
                  fontWeight: 700,
                  fontSize: "1.5rem",
                  color: ink,
                }}
              >
                Office Information
              </Typography>
              <Typography sx={{ mt: 0.5, color: inkSoft, fontSize: "0.9rem" }}>
                Reach out any time — our team typically responds within one
                business day.
              </Typography>
              <Stack spacing={2.5} sx={{ mt: 3 }}>
                {asArray(contactPage.detailGroups, []).map((row: Record<string, any>, index: number) => (
                  <Stack
                    key={index}
                    direction="row"
                    spacing={1.5}
                    alignItems="flex-start"
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        bgcolor: rgba(teal, 0.14),
                        color: teal,
                        display: "grid",
                        placeItems: "center",
                        flexShrink: 0,
                      }}
                    >
                      {row.icon}
                    </Box>
                    <Box>
                      <Typography
                        {...getEditableTextProps(
                          contactPage.blockId,
                          `detailGroups.${index}.title`,
                          "single",
                        )}
                        sx={{
                          fontWeight: 700,
                          color: ink,
                          fontSize: "0.92rem",
                        }}
                      >
                        {row.title}
                      </Typography>
                      <Typography
                        {...getEditableTextProps(
                          contactPage.blockId,
                          `detailGroups.${index}.items.0`,
                          "single",
                        )}
                        sx={{ color: inkSoft, fontSize: "0.85rem", mt: 0.3 }}
                      >
                        {asArray(row.items, []).join(" · ")}
                      </Typography>
                    </Box>
                  </Stack>
                ))}
              </Stack>
            </Box>
          </MotionBox>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>
    </>
  );

  const sectionMap: Record<string, React.ReactNode> = {
    hero: (
      <TemplateSectionBoundary
        key="hero"
        blockId={hero.blockId}
        label="Hero"
        sectionKey="hero"
        content={hero}
        id="hero"
        sx={{
          position: "relative",
          background: `radial-gradient(circle at 14% 18%, ${rgba(teal, 0.1)} 0%, transparent 42%), linear-gradient(160deg, ${soft} 0%, #ffffff 62%)`,
          py: { xs: 7, md: 11 },
          overflow: "hidden",
        }}
      >
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            top: { xs: -60, md: -40 },
            left: { xs: -60, md: -20 },
            width: 260,
            height: 260,
            borderRadius: "50%",
            background: `repeating-radial-gradient(circle, ${rgba(teal, 0.14)} 0px, ${rgba(teal, 0.14)} 1px, transparent 1px, transparent 14px)`,
            opacity: 0.6,
            pointerEvents: "none",
          }}
        />
        <TemplateInnerContainer sx={{ position: "relative" }}>
          <MotionBox
            {...revealProps()}
            {...containerProps(hero.blockId, "hero.layout", "Hero layout")}
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "1fr 0.86fr" },
              gap: { xs: 5, lg: 6 },
              alignItems: "center",
            }}
          >
            <Box>
              <Typography
                {...getEditableTextProps(
                  hero.blockId,
                  "eyebrow",
                  "single",
                  "eyebrowStyle",
                )}
                sx={eyebrowSx(teal, bodyFont)}
              >
                <GraduationCap size={15} />
                {hero.eyebrow || "#1 Platform for online learning"}
              </Typography>
              <Typography
                {...getEditableTextProps(hero.blockId, "heading", "multi")}
                sx={{
                  mt: 2.5,
                  fontFamily: headingFont,
                  fontWeight: 700,
                  fontSize: { xs: "2.6rem", sm: "3.4rem", md: "4rem" },
                  lineHeight: 1.05,
                  color: ink,
                  maxWidth: 620,
                  ...(hero.headingStyle || {}),
                }}
              >
                {hero.heading || "Start learning from the world's best sites."}
              </Typography>
              <Typography
                {...getEditableTextProps(hero.blockId, "subheading", "multi")}
                sx={{
                  mt: 2.5,
                  color: inkSoft,
                  fontSize: "1.05rem",
                  lineHeight: 1.7,
                  maxWidth: 520,
                  ...(hero.subheadingStyle || {}),
                }}
              >
                {hero.subheading ||
                  "A modern learning experience built around expert instructors, flexible courses, and a supportive student community."}
              </Typography>
              <Button
                href={hero.ctaLink || "/courses"}
                {...getEditableTextProps(
                  hero.blockId,
                  "ctaText",
                  "single",
                  "ctaTextStyle",
                )}
                endIcon={<ArrowRight size={16} />}
                sx={{
                  mt: 4,
                  bgcolor: teal,
                  color: "#fff",
                  borderRadius: 999,
                  px: 3.5,
                  py: 1.35,
                  fontWeight: 700,
                  textTransform: "none",
                  "&:hover": { bgcolor: teal, opacity: 0.9 },
                }}
              >
                {hero.ctaText || "Get Started Now"}
              </Button>

              <Box
                {...containerProps(
                  hero.blockId,
                  "hero.stats-row",
                  "Hero stat row",
                )}
                sx={{
                  mt: 5,
                  display: "grid",
                  gridTemplateColumns: `repeat(${Math.max(heroStats.length, 1)}, auto)`,
                  gap: { xs: 3, sm: 4 },
                }}
              >
                {heroStats.map((stat: Record<string, any>, index: number) => (
                  <Box key={index}>
                    <Typography
                      {...getEditableTextProps(
                        hero.blockId,
                        `items.${index}.value`,
                        "single",
                      )}
                      sx={{
                        fontFamily: headingFont,
                        fontWeight: 700,
                        fontSize: "1.5rem",
                        color: ink,
                      }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography
                      {...getEditableTextProps(
                        hero.blockId,
                        `items.${index}.heading`,
                        "single",
                      )}
                      sx={{ fontSize: "0.8rem", color: inkSoft }}
                    >
                      {stat.heading}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
            <Box
              {...containerProps(
                hero.blockId,
                "hero.image",
                "Hero image",
                "card",
              )}
              sx={{ position: "relative" }}
            >
              {renderEditableMedia({
                blockId: hero.blockId,
                field: "image",
                label: "Hero image",
                src: hero.image || educationProAssets.studentLearning,
                alt: "Student learning online",
                style: hero.imageStyle,
                sx: {
                  width: "100%",
                  aspectRatio: "5 / 5",
                  objectFit: "cover",
                  borderRadius: "28px",
                  boxShadow: `0 32px 60px ${rgba(navy, 0.18)}`,
                },
              })}
              <Box
                sx={{
                  position: "absolute",
                  top: -28,
                  right: { xs: -12, md: -28 },
                  width: 110,
                  height: 110,
                  borderRadius: "50%",
                  border: `2px dashed ${rgba(teal, 0.4)}`,
                  display: { xs: "none", sm: "block" },
                }}
              />
              <MotionBox
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                sx={{
                  position: "absolute",
                  left: { xs: 12, md: -32 },
                  bottom: { xs: 12, md: 28 },
                  bgcolor: "#fff",
                  borderRadius: "16px",
                  px: 2.2,
                  py: 1.4,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.2,
                  boxShadow: `0 20px 44px ${rgba(navy, 0.18)}`,
                }}
              >
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    bgcolor: rgba(teal, 0.14),
                    color: teal,
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <GraduationCap size={18} />
                </Box>
                <Box>
                  <Typography
                    sx={{
                      fontFamily: headingFont,
                      fontWeight: 700,
                      fontSize: "1.05rem",
                      color: ink,
                      lineHeight: 1.1,
                    }}
                  >
                    {heroStats[0]?.value || "9.5K+"}
                  </Typography>
                  <Typography sx={{ fontSize: "0.72rem", color: inkSoft }}>
                    {heroStats[0]?.heading || "Enrolled Students"}
                  </Typography>
                </Box>
              </MotionBox>
            </Box>
          </MotionBox>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>
    ),
    categories: (
      <TemplateSectionBoundary
        key="categories"
        blockId={categories.blockId}
        label="Explore top categories"
        sectionKey="categories"
        content={categories}
        id="categories"
        sx={{
          position: "relative",
          background: `linear-gradient(155deg, ${navyDeep} 0%, ${navy} 100%)`,
          py: { xs: 8, md: 11 },
          overflow: "hidden",
        }}
      >
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            top: -80,
            right: -80,
            width: 260,
            height: 260,
            borderRadius: "50%",
            border: `1px solid ${rgba(teal, 0.16)}`,
            pointerEvents: "none",
          }}
        />
        <TemplateInnerContainer sx={{ position: "relative" }}>
          <MotionBox {...revealProps()} sx={{ textAlign: "center" }}>
            <Typography
              {...getEditableTextProps(
                categories.blockId,
                "eyebrow",
                "single",
                "eyebrowStyle",
              )}
              sx={{
                ...pillEyebrowSx(rgba(teal, 0.16), "#8fe3d6", bodyFont),
                display: "inline-flex",
              }}
            >
              {categories.eyebrow || "Popular categories"}
            </Typography>
            <Typography
              {...getEditableTextProps(categories.blockId, "heading", "single")}
              sx={{
                mt: 2,
                fontFamily: headingFont,
                fontWeight: 700,
                fontSize: { xs: "1.9rem", md: "2.5rem" },
                color: "#fff",
              }}
            >
              {categories.heading || "Explore Top Categories"}
            </Typography>
          </MotionBox>
          <Box
            sx={{
              mt: { xs: 5, md: 7 },

              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
              },
            }}
          >
            {categoryItems.map((item: Record<string, any>, index: number) => {
              const CategoryIcon =
                CATEGORY_ICONS[index % CATEGORY_ICONS.length];
              return (
                <MotionBox
                  key={index}
                  {...revealProps((index % 3) * 0.08)}
                  {...containerProps(
                    categories.blockId,
                    `categories.card.${index}`,
                    `Category ${index + 1}`,
                    "card",
                  )}
                  sx={{
                    textAlign: "center",
                    px: { xs: 1, md: 2 },
                    py: { xs: 1, md: 8 },
                    position: "relative",

                    "&::after": {
                      content: '""',
                      position: "absolute",
                      right: 0,
                      top: { xs: "auto", md: 0 },
                      bottom: { xs: -18, md: "auto" },
                      width: { xs: "100%", md: "1px" },
                      height: { xs: "1px", md: "100%" },
                      backgroundColor: rgba("#ffffff", 0.08),
                      display: {
                        xs: index < categoryItems.length - 1 ? "none" : "none",
                        md: index % 3 === 2 ? "block" : "none",
                        xl: "block",
                      },
                    },

                    "&::before": {
                      content: '""',
                      position: "absolute",
                      left: 0,
                      bottom: -24,
                      width: "100%",
                      height: "1px",
                      backgroundColor: rgba("#ffffff", 0.08),
                      display: {
                        xs: "none",
                        md: index < categoryItems.length - 3 ? "block" : "none",
                        xl: index < categoryItems.length - 3 ? "block" : "none",
                      },
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 68,
                      height: 68,
                      mx: "auto",
                      mb: 2.2,
                      borderRadius: "50%",
                      border: `1px solid ${rgba(teal, 0.35)}`,
                      bgcolor: rgba(teal, 0.1),
                      color: "#8fe3d6",
                      display: "grid",
                      placeItems: "center",
                      transition:
                        "background-color 200ms ease, border-color 200ms ease",
                      "&:hover": {
                        bgcolor: teal,
                        color: "#fff",
                        borderColor: teal,
                      },
                    }}
                  >
                    <CategoryIcon size={26} />
                  </Box>
                  <Typography
                    {...getEditableTextProps(
                      categories.blockId,
                      `features.${index}.title`,
                      "single",
                    )}
                    sx={{
                      fontFamily: headingFont,
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: "1.02rem",
                    }}
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    {...getEditableTextProps(
                      categories.blockId,
                      `features.${index}.description`,
                      "multi",
                    )}
                    sx={{
                      mt: 0.8,
                      color: rgba("#ffffff", 0.55),
                      fontSize: "0.85rem",
                      lineHeight: 1.6,
                      maxWidth: 260,
                      mx: "auto",
                    }}
                  >
                    {item.description ||
                      "Guided lessons taught by subject experts."}
                  </Typography>
                </MotionBox>
              );
            })}
          </Box>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>
    ),
    intro: (
      <TemplateSectionBoundary
        key="intro"
        blockId={intro.blockId}
        label="About the academy"
        sectionKey="intro"
        content={intro}
        id="intro"
        sx={{ bgcolor: "#fff", py: { xs: 7, md: 11 } }}
      >
        <TemplateInnerContainer>
          <MotionBox
            {...revealProps()}
            {...containerProps(intro.blockId, "intro.layout", "Intro layout")}
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "0.9fr 1.1fr" },
              gap: { xs: 5, md: 7 },
              alignItems: "center",
            }}
          >
            <Box sx={{ position: "relative", pb: { xs: 3, md: 0 } }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1.15fr 0.85fr",
                  gap: 1.6,
                }}
              >
                {renderEditableMedia({
                  blockId: intro.blockId,
                  field: "image",
                  label: "About image",
                  src: intro.image || educationProAssets.groupStudy,
                  alt: intro.alt || "Students learning together",
                  style: intro.imageStyle,
                  sx: {
                    width: "100%",
                    aspectRatio: "3 / 4",
                    objectFit: "cover",
                    borderRadius: "22px",
                  },
                })}
                <Stack spacing={1.6} sx={{ mt: { xs: 0, sm: 4 } }}>
                  <Box
                    component="img"
                    src={educationProAssets.onlineClass}
                    alt="Instructor mentoring a student"
                    sx={{
                      width: "100%",
                      aspectRatio: "1 / 1",
                      objectFit: "cover",
                      borderRadius: "20px",
                      display: "block",
                    }}
                  />
                </Stack>
              </Box>
              <MotionBox
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.25 }}
                sx={{
                  position: "absolute",
                  left: { xs: 8, md: -28 },
                  bottom: { xs: -8, md: 24 },
                  bgcolor: "#fff",
                  borderRadius: "16px",
                  px: 2.4,
                  py: 1.6,
                  display: "flex",
                  gap: 3,
                  boxShadow: `0 22px 46px ${rgba(navy, 0.16)}`,
                }}
              >
                {heroStats
                  .slice(0, 2)
                  .map((stat: Record<string, any>, index: number) => (
                    <Box key={index}>
                      <Typography
                        sx={{
                          fontFamily: headingFont,
                          fontWeight: 700,
                          fontSize: "1.2rem",
                          color: teal,
                        }}
                      >
                        {stat.value}
                      </Typography>
                      <Typography sx={{ fontSize: "0.72rem", color: inkSoft }}>
                        {stat.heading}
                      </Typography>
                    </Box>
                  ))}
              </MotionBox>
            </Box>
            <Box>
              <Typography
                {...getEditableTextProps(
                  intro.blockId,
                  "eyebrow",
                  "single",
                  "eyebrowStyle",
                )}
                sx={eyebrowSx(teal, bodyFont)}
              >
                {intro.eyebrow || "Why choose us"}
              </Typography>
              <Typography
                {...getEditableTextProps(intro.blockId, "heading", "multi")}
                sx={{
                  mt: 1.5,
                  fontFamily: headingFont,
                  fontWeight: 700,
                  fontSize: { xs: "2rem", md: "2.6rem" },
                  color: ink,
                  lineHeight: 1.15,
                }}
              >
                {intro.heading || "We Care About Your Life For Better Future"}
              </Typography>
              <Typography
                {...getEditableTextProps(intro.blockId, "body", "multi")}
                sx={{ mt: 2, color: inkSoft, lineHeight: 1.8 }}
              >
                {intro.body ||
                  "We combine expert instruction, practical projects, and close mentorship so every student can build lasting confidence and real skills."}
              </Typography>
              <Box
                sx={{
                  mt: 3,
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: 1.6,
                }}
              >
                {introItems.map((item: Record<string, any>, index: number) => (
                  <Stack
                    key={index}
                    direction="row"
                    spacing={1.2}
                    alignItems="center"
                    sx={{
                      bgcolor: soft,
                      borderRadius: "14px",
                      px: 1.6,
                      py: 1.2,
                    }}
                  >
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        bgcolor: rgba(teal, 0.16),
                        color: teal,
                        display: "grid",
                        placeItems: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Check size={14} />
                    </Box>
                    <Typography
                      {...getEditableTextProps(
                        intro.blockId,
                        `items.${index}.heading`,
                        "single",
                      )}
                      sx={{ color: ink, fontWeight: 600, fontSize: "0.85rem" }}
                    >
                      {item.heading}
                    </Typography>
                  </Stack>
                ))}
              </Box>
              <Button
                href={intro.ctaLink || "/about"}
                {...getEditableTextProps(
                  intro.blockId,
                  "ctaText",
                  "single",
                  "ctaTextStyle",
                )}
                endIcon={<ArrowRight size={16} />}
                sx={{
                  mt: 4,
                  border: `1.5px solid ${teal}`,
                  color: teal,
                  borderRadius: 999,
                  px: 3,
                  py: 1.1,
                  fontWeight: 700,
                  textTransform: "none",
                  "&:hover": { bgcolor: teal, color: "#fff" },
                }}
              >
                {intro.ctaText || "Learn More"}
              </Button>
            </Box>
          </MotionBox>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>
    ),
    courses: (
      <TemplateSectionBoundary
        key="courses"
        blockId={courses.blockId}
        label="Featured courses"
        sectionKey="courses"
        content={courses}
        id="courses"
        sx={{ bgcolor: soft, py: { xs: 7, md: 11 } }}
      >
        <TemplateInnerContainer>
          <MotionBox {...revealProps()}>
            <Typography
              {...getEditableTextProps(
                courses.blockId,
                "eyebrow",
                "single",
                "eyebrowStyle",
              )}
              sx={{
                ...eyebrowSx(teal, bodyFont),
                justifyContent: "center",
                display: "flex",
              }}
            >
              {courses.eyebrow || "Top courses"}
            </Typography>

            <Typography
              {...getEditableTextProps(courses.blockId, "heading", "single")}
              sx={{
                mt: 1.5,
                textAlign: "center",
                fontFamily: headingFont,
                fontWeight: 800,
                fontSize: { xs: "2rem", md: "2.65rem" },
                letterSpacing: "-0.04em",
                color: ink,
              }}
            >
              {courses.heading || "Explore Featured Courses"}
            </Typography>
          </MotionBox>

          <Box
            sx={{
              mt: { xs: 4.5, md: 5.5 },
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
            {courseItems.map((item: Record<string, any>, index: number) => (
              <MotionBox
                key={index}
                {...revealProps(index * 0.08)}
                whileHover={liftHover}
                {...containerProps(
                  courses.blockId,
                  `courses.card.${index}`,
                  `Course ${index + 1}`,
                  "card",
                )}
                sx={{
                  height: "100%",
                  bgcolor: "#ffffff",
                  borderRadius: "28px",
                  overflow: "hidden",
                  border: `1px solid ${rgba(navy, 0.08)}`,
                  boxShadow: `0 18px 55px ${rgba(navy, 0.07)}`,
                  display: "flex",
                  flexDirection: "column",
                  p: 1.15,
                  transition:
                    "transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease",
                  "&:hover": {
                    borderColor: rgba(teal, 0.32),
                    boxShadow: `0 28px 70px ${rgba(navy, 0.13)}`,
                  },
                  "&:hover .course-card-media": {
                    transform: "scale(1.045)",
                  },
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    height: { xs: 210, md: 320 },
                    borderRadius: "22px",
                    overflow: "hidden",
                    bgcolor: rgba(navy, 0.04),
                    flexShrink: 0,
                  }}
                >
                  {renderEditableMedia({
                    blockId: courses.blockId,
                    field: `features.${index}.image`,
                    label: `Course image ${index + 1}`,
                    src: item.image || educationProAssets.onlineClass,
                    alt: item.title || `Course ${index + 1}`,
                    sx: {
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                      transition: "transform 380ms ease",
                    },
                  })}

                  <Box
                    className="course-card-media"
                    aria-hidden
                    sx={{
                      position: "absolute",
                      inset: 0,
                      pointerEvents: "none",
                      transition: "transform 380ms ease",
                      background: `linear-gradient(180deg, ${rgba(
                        navy,
                        0,
                      )} 38%, ${rgba(navy, 0.18)} 100%)`,
                    }}
                  />
                </Box>

                <Box
                  sx={{
                    px: { xs: 1.5, md: 1.7 },
                    pt: 2,
                    pb: 1.7,
                    display: "flex",
                    flexDirection: "column",
                    flexGrow: 1,
                  }}
                >
                  <Typography
                    {...getEditableTextProps(
                      courses.blockId,
                      `features.${index}.icon`,
                      "single",
                    )}
                    sx={{
                      alignSelf: "flex-start",
                      display: "inline-flex",
                      alignItems: "center",
                      bgcolor: rgba(teal, 0.1),
                      color: teal,
                      fontSize: "0.72rem",
                      fontWeight: 800,
                      borderRadius: 999,
                      px: 1.35,
                      py: 0.45,
                      mb: 1.35,
                      lineHeight: 1,
                      border: `1px solid ${rgba(teal, 0.16)}`,
                    }}
                  >
                    {item.icon || "Course"}
                  </Typography>

                  <Typography
                    {...getEditableTextProps(
                      courses.blockId,
                      `features.${index}.title`,
                      "multi",
                    )}
                    sx={{
                      fontFamily: headingFont,
                      fontWeight: 800,
                      fontSize: { xs: "1.05rem", md: "1.12rem" },
                      color: ink,
                      lineHeight: 1.25,
                      letterSpacing: "-0.025em",
                    }}
                  >
                    {item.title}
                  </Typography>

                  <Typography
                    {...getEditableTextProps(
                      courses.blockId,
                      `features.${index}.description`,
                      "single",
                    )}
                    sx={{
                      mt: 1,
                      color: inkSoft,
                      fontSize: "0.88rem",
                      lineHeight: 1.55,
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
    ),
    promo: (
      <TemplateSectionBoundary
        key="promo"
        blockId={promo.blockId}
        label="Enrollment offer"
        sectionKey="promo"
        content={promo}
        id="promo"
        sx={{
          position: "relative",
          background: `linear-gradient(150deg, ${navyDeep} 0%, ${navy} 100%)`,
          py: { xs: 7, md: 10 },
          overflow: "hidden",
        }}
      >
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            bottom: -100,
            right: "18%",
            width: 220,
            height: 220,
            borderRadius: "50%",
            border: `1px dashed ${rgba(teal, 0.25)}`,
            pointerEvents: "none",
          }}
        />
        <TemplateInnerContainer sx={{ position: "relative" }}>
          <MotionBox
            {...revealProps()}
            {...containerProps(promo.blockId, "promo.layout", "Promo layout")}
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1.1fr 0.9fr" },
              gap: { xs: 4, md: 6 },
              alignItems: "center",
            }}
          >
            <Box>
              <Typography
                {...getEditableTextProps(
                  promo.blockId,
                  "eyebrow",
                  "single",
                  "eyebrowStyle",
                )}
                sx={pillEyebrowSx(rgba("#8fe3d6", 0.14), "#8fe3d6", bodyFont)}
              >
                {promo.eyebrow || "Limited seats available"}
              </Typography>
              <Typography
                {...getEditableTextProps(promo.blockId, "heading", "multi")}
                sx={{
                  mt: 1.5,
                  fontFamily: headingFont,
                  fontWeight: 700,
                  fontSize: { xs: "2rem", md: "2.7rem" },
                  color: "#fff",
                  lineHeight: 1.15,
                  maxWidth: 480,
                }}
              >
                {promo.heading ||
                  "50% Off For Very First 50 Students & Members"}
              </Typography>
              <Typography
                {...getEditableTextProps(promo.blockId, "body", "multi")}
                sx={{
                  mt: 2,
                  color: rgba("#ffffff", 0.68),
                  lineHeight: 1.8,
                  maxWidth: 460,
                }}
              >
                {promo.body ||
                  "Join now with a focused learning program, dedicated mentor support, and a community that keeps you moving forward."}
              </Typography>
              <Button
                href={promo.ctaLink || "/courses"}
                {...getEditableTextProps(
                  promo.blockId,
                  "ctaText",
                  "single",
                  "ctaTextStyle",
                )}
                endIcon={<ArrowRight size={16} />}
                sx={{
                  mt: 4,
                  bgcolor: "#fff",
                  color: navyDeep,
                  borderRadius: 999,
                  px: 3.5,
                  py: 1.3,
                  fontWeight: 700,
                  textTransform: "none",
                  "&:hover": { bgcolor: "#fff", opacity: 0.9 },
                }}
              >
                {promo.ctaText || "Enroll Now"}
              </Button>
            </Box>
            <Box
              {...containerProps(
                promo.blockId,
                "promo.image",
                "Promo image",
                "card",
              )}
              sx={{ position: "relative" }}
            >
              {renderEditableMedia({
                blockId: promo.blockId,
                field: "image",
                label: "Promo image",
                src: promo.image || educationProAssets.studentTutoring,
                alt: "Student studying",
                style: promo.imageStyle,
                sx: {
                  width: "100%",
                  aspectRatio: "4 / 3",
                  objectFit: "cover",
                  borderRadius: "24px",
                  boxShadow: `0 30px 60px ${rgba("#000000", 0.35)}`,
                },
              })}
              <Box
                sx={{
                  position: "absolute",
                  top: -18,
                  left: -18,
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  bgcolor: teal,
                  display: { xs: "none", sm: "grid" },
                  placeItems: "center",
                  color: "#fff",
                  boxShadow: `0 14px 28px ${rgba(teal, 0.4)}`,
                }}
              >
                <GraduationCap size={26} />
              </Box>
            </Box>
          </MotionBox>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>
    ),
    instructors: (
      <TemplateSectionBoundary
        key="instructors"
        blockId={instructors.blockId}
        label="Expert instructors"
        sectionKey="instructors"
        content={instructors}
        id="instructors"
        sx={{ bgcolor: "#fff", py: { xs: 7, md: 11 } }}
      >
        <TemplateInnerContainer>
          <MotionBox {...revealProps()}>
            <Typography
              {...getEditableTextProps(
                instructors.blockId,
                "eyebrow",
                "single",
                "eyebrowStyle",
              )}
              sx={{
                ...eyebrowSx(teal, bodyFont),
                justifyContent: "center",
                display: "flex",
              }}
            >
              {instructors.eyebrow || "Our mentors"}
            </Typography>

            <Typography
              {...getEditableTextProps(
                instructors.blockId,
                "heading",
                "single",
              )}
              sx={{
                mt: 1.5,
                textAlign: "center",
                fontFamily: headingFont,
                fontWeight: 800,
                fontSize: { xs: "2rem", md: "2.65rem" },
                letterSpacing: "-0.04em",
                color: ink,
              }}
            >
              {instructors.heading || "Meet Our Expert Instructor"}
            </Typography>
          </MotionBox>

          <Box
            sx={{
              mt: { xs: 4.5, md: 5.5 },
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                md: `repeat(${Math.min(instructorItems.length, 4)}, minmax(0, 1fr))`,
              },
              gap: { xs: 2.4, md: 3 },
              alignItems: "stretch",
            }}
          >
            {instructorItems.map(
              (member: Record<string, any>, index: number) => (
                <MotionBox
                  key={index}
                  {...revealProps(index * 0.08)}
                  whileHover={liftHover}
                  {...containerProps(
                    instructors.blockId,
                    `instructors.card.${index}`,
                    `Instructor ${index + 1}`,
                    "card",
                  )}
                  sx={{
                    height: "100%",
                    bgcolor: soft,
                    borderRadius: "28px",
                    overflow: "hidden",
                    border: `1px solid ${rgba(navy, 0.08)}`,
                    boxShadow: `0 18px 55px ${rgba(navy, 0.06)}`,
                    p: 1.1,
                    display: "flex",
                    flexDirection: "column",
                    transition:
                      "transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease",
                    "&:hover": {
                      borderColor: rgba(teal, 0.28),
                      boxShadow: `0 26px 68px ${rgba(navy, 0.12)}`,
                    },
                    "&:hover .instructor-media-wrap": {
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  <Box
                    className="instructor-media-wrap"
                    sx={{
                      position: "relative",
                      width: "100%",
                      aspectRatio: "1 / 1",
                      borderRadius: "23px",
                      overflow: "hidden",
                      bgcolor: rgba(navy, 0.04),
                      flexShrink: 0,
                      transition: "transform 240ms ease",
                    }}
                  >
                    {renderEditableMedia({
                      blockId: instructors.blockId,
                      field: `members.${index}.photo`,
                      label: `Instructor photo ${index + 1}`,
                      src:
                        member.photo ||
                        educationProAssets.avatars[
                          index % educationProAssets.avatars.length
                        ],
                      alt: member.name || `Instructor ${index + 1}`,
                      sx: {
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                        borderRadius: "inherit",
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
                        )} 48%, ${rgba(navy, 0.16)} 100%)`,
                      }}
                    />
                  </Box>

                  <Box
                    sx={{
                      px: { xs: 1.4, md: 1.5 },
                      pt: 1.7,
                      pb: 1.4,
                      textAlign: "center",
                      flexGrow: 1,
                    }}
                  >
                    <Typography
                      {...getEditableTextProps(
                        instructors.blockId,
                        `members.${index}.name`,
                        "single",
                      )}
                      sx={{
                        fontFamily: headingFont,
                        fontWeight: 800,
                        color: ink,
                        fontSize: { xs: "1rem", md: "1.05rem" },
                        lineHeight: 1.25,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {member.name}
                    </Typography>

                    <Typography
                      {...getEditableTextProps(
                        instructors.blockId,
                        `members.${index}.role`,
                        "single",
                      )}
                      sx={{
                        mt: 0.45,
                        color: teal,
                        fontSize: "0.84rem",
                        fontWeight: 700,
                        lineHeight: 1.4,
                      }}
                    >
                      {member.role}
                    </Typography>

                    <Stack
                      direction="row"
                      spacing={0.8}
                      justifyContent="center"
                      sx={{ mt: 1.2 }}
                    />
                  </Box>
                </MotionBox>
              ),
            )}
          </Box>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>
    ),
    courseRequest: (
      <TemplateSectionBoundary
        key="courseRequest"
        blockId={courseRequest.blockId}
        label="Find your best course"
        sectionKey="courseRequest"
        content={courseRequest}
        id="course-request"
        sx={{
          background: `linear-gradient(135deg, ${navyDeep} 0%, ${navy} 100%)`,
          py: { xs: 7, md: 9 },
          overflow: "hidden",
        }}
      >
        <TemplateInnerContainer>
          <MotionBox
            {...revealProps()}
            {...containerProps(
              courseRequest.blockId,
              "courseRequest.layout",
              "Course request layout",
            )}
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "0.85fr 1.15fr" },
              gap: { xs: 4, md: 6 },
              alignItems: "center",
            }}
          >
            <Box
              {...containerProps(
                courseRequest.blockId,
                "courseRequest.image",
                "Course request image",
                "card",
              )}
              sx={{ position: "relative" }}
            >
              {renderEditableMedia({
                blockId: courseRequest.blockId,
                field: "image",
                label: "Course request image",
                src: courseRequest.image || educationProAssets.onlineClass,
                alt: "Students finding the right course",
                style: courseRequest.imageStyle,
                sx: {
                  width: "100%",
                  aspectRatio: "5 / 4",
                  objectFit: "cover",
                  borderRadius: "22px",
                },
              })}
            </Box>
            <Box>
              <Typography
                {...getEditableTextProps(
                  courseRequest.blockId,
                  "eyebrow",
                  "single",
                  "eyebrowStyle",
                )}
                sx={pillEyebrowSx(rgba(teal, 0.16), "#8fe3d6", bodyFont)}
              >
                {courseRequest.eyebrow || "Get started today"}
              </Typography>
              <Typography
                {...getEditableTextProps(
                  courseRequest.blockId,
                  "heading",
                  "multi",
                )}
                sx={{
                  mt: 1.5,
                  fontFamily: headingFont,
                  fontWeight: 700,
                  fontSize: { xs: "1.9rem", md: "2.5rem" },
                  color: "#fff",
                  lineHeight: 1.2,
                  maxWidth: 460,
                }}
              >
                {courseRequest.heading || "Find Your Best Course With Us"}
              </Typography>
              <Typography
                {...getEditableTextProps(
                  courseRequest.blockId,
                  "body",
                  "multi",
                )}
                sx={{
                  mt: 2,
                  color: rgba("#ffffff", 0.65),
                  lineHeight: 1.8,
                  maxWidth: 440,
                }}
              >
                {courseRequest.body ||
                  "Talk with an academic advisor to build a learning path suited to your goals and schedule."}
              </Typography>
              <Button
                href={courseRequest.ctaLink || "/courses"}
                {...getEditableTextProps(
                  courseRequest.blockId,
                  "ctaText",
                  "single",
                  "ctaTextStyle",
                )}
                endIcon={<ArrowRight size={16} />}
                sx={{
                  mt: 4,
                  bgcolor: teal,
                  color: "#fff",
                  borderRadius: 999,
                  px: 3.5,
                  py: 1.3,
                  fontWeight: 700,
                  textTransform: "none",
                  "&:hover": { bgcolor: teal, opacity: 0.9 },
                }}
              >
                {courseRequest.ctaText || "Get Started Now"}
              </Button>
            </Box>
          </MotionBox>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>
    ),
    testimonials: (
      <TemplateSectionBoundary
        key="testimonials"
        blockId={testimonials.blockId}
        label="Student feedback"
        sectionKey="testimonials"
        content={testimonials}
        id="testimonials"
        sx={{ bgcolor: soft, py: { xs: 7, md: 11 } }}
      >
        <TemplateInnerContainer>
          <MotionBox {...revealProps()}>
            <Typography
              {...getEditableTextProps(
                testimonials.blockId,
                "eyebrow",
                "single",
                "eyebrowStyle",
              )}
              sx={{
                ...eyebrowSx(teal, bodyFont),
                justifyContent: "center",
                display: "flex",
              }}
            >
              {testimonials.eyebrow || "Testimonials"}
            </Typography>
            <Typography
              {...getEditableTextProps(
                testimonials.blockId,
                "heading",
                "single",
              )}
              sx={{
                mt: 1.5,
                textAlign: "center",
                fontFamily: headingFont,
                fontWeight: 700,
                fontSize: { xs: "1.9rem", md: "2.4rem" },
                color: ink,
              }}
            >
              {testimonials.heading || "Feedback From Our Students"}
            </Typography>
          </MotionBox>
          <Box
            sx={{
              mt: 5,
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(auto-fit, minmax(320px, 1fr))",
              },
              gap: 3,
            }}
          >
            {testimonialItems.map(
              (item: Record<string, any>, index: number) => {
                const author = item.author ?? item.name ?? "";
                const quote = item.quote ?? item.text ?? "";
                return (
                  <MotionBox
                    key={index}
                    {...revealProps(index * 0.08)}
                    whileHover={liftHover}
                    {...containerProps(
                      testimonials.blockId,
                      `testimonials.card.${index}`,
                      `Testimonial ${index + 1}`,
                      "card",
                    )}
                    sx={{
                      bgcolor: "#fff",
                      borderRadius: "20px",
                      p: { xs: 3, md: 4 },
                    }}
                  >
                    <Quote size={26} color={teal} />
                    <Stack direction="row" spacing={0.4} sx={{ mt: 1.5 }}>
                      {Array.from({ length: 5 }).map((_, starIndex) => (
                        <Star
                          key={starIndex}
                          size={15}
                          color="#f4b400"
                          fill={
                            starIndex < Number(item.rating ?? 5)
                              ? "#f4b400"
                              : "none"
                          }
                        />
                      ))}
                    </Stack>
                    <Typography
                      {...getEditableTextProps(
                        testimonials.blockId,
                        `testimonials.${index}.quote`,
                        "multi",
                      )}
                      sx={{ mt: 2, color: ink, lineHeight: 1.75 }}
                    >
                      {quote}
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1.5}
                      alignItems="center"
                      sx={{ mt: 3 }}
                    >
                      {renderEditableMedia({
                        blockId: testimonials.blockId,
                        field: `testimonials.${index}.photo`,
                        label: `Testimonial photo ${index + 1}`,
                        src:
                          item.photo ||
                          item.avatar ||
                          educationProAssets.avatars[
                            index % educationProAssets.avatars.length
                          ],
                        alt: author,
                        sx: {
                          width: 46,
                          height: 46,
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
                          sx={{
                            fontWeight: 700,
                            color: ink,
                            fontSize: "0.9rem",
                          }}
                        >
                          {author}
                        </Typography>
                        <Typography
                          {...getEditableTextProps(
                            testimonials.blockId,
                            `testimonials.${index}.role`,
                            "single",
                          )}
                          sx={{ fontSize: "0.78rem", color: inkSoft }}
                        >
                          {item.role ?? item.position ?? ""}
                        </Typography>
                      </Box>
                    </Stack>
                  </MotionBox>
                );
              },
            )}
          </Box>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>
    ),
    stats: (
      <TemplateSectionBoundary
        key="stats"
        blockId={stats.blockId}
        label="Outcomes"
        sectionKey="stats"
        content={stats}
        id="stats"
        sx={{ bgcolor: teal, py: { xs: 5, md: 6 } }}
      >
        <TemplateInnerContainer>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, 1fr)",
                md: `repeat(${Math.max(statItems.length, 1)}, 1fr)`,
              },
              gap: 3,
            }}
          >
            {statItems.map((stat: Record<string, any>, index: number) => (
              <MotionBox
                key={index}
                {...revealProps(index * 0.06)}
                {...containerProps(
                  stats.blockId,
                  `stats.card.${index}`,
                  `Statistic ${index + 1}`,
                  "card",
                )}
                sx={{ textAlign: "center" }}
              >
                <Typography
                  {...getEditableTextProps(
                    stats.blockId,
                    `stats.${index}.number`,
                    "single",
                  )}
                  sx={{
                    fontFamily: headingFont,
                    fontWeight: 700,
                    fontSize: { xs: "1.5rem", md: "2rem" },
                    color: "#fff",
                  }}
                >
                  {stat.number ?? stat.value ?? ""}
                  {stat.suffix ?? ""}
                </Typography>
                <Typography
                  {...getEditableTextProps(
                    stats.blockId,
                    `stats.${index}.label`,
                    "single",
                  )}
                  sx={{
                    color: rgba("#ffffff", 0.85),
                    fontSize: "0.82rem",
                    mt: 0.5,
                  }}
                >
                  {stat.label}
                </Typography>
              </MotionBox>
            ))}
          </Box>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>
    ),
  };

  const defaultOrder = [
    "hero",
    "categories",
    "intro",
    "courses",
    "promo",
    "instructors",
    "courseRequest",
    "testimonials",
    "stats",
  ];
  const requestedOrder = asArray<string>(content.sectionOrder, defaultOrder);
  const order = [
    ...requestedOrder.filter((key) => sectionMap[key]),
    ...defaultOrder.filter((key) => !requestedOrder.includes(key)),
  ];

  const pageContent =
    activePage === "about"
      ? renderAboutPage()
      : activePage === "courses"
        ? renderCoursesPage()
        : activePage === "contact"
          ? renderContactPage()
          : order.map((key) => sectionMap[key]);

  return (
    <TemplatePageShell templateId="education-pro" data={data}>
      <Box sx={{ fontFamily: bodyFont, color: ink, bgcolor: "#fff" }}>
        {pageContent}
      </Box>
    </TemplatePageShell>
  );
};

export default EducationProTemplate;
