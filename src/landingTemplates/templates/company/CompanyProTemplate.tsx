import React from "react";
import {
  Box,
  Button,
  Container,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  Quote,
  Star,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
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
import { companyProAssets } from "../../assets/company/company-pro";
import { buildCompanyTheme, rgba } from "./theme";
import { buildSharedHeaderTheme } from "../../utils/headerTheme";

const buildCompanyProTheme = (data: TemplateProps["data"]) => {
  const theme = buildCompanyTheme({
    data,
    defaultPrimary: "#12100f",
    defaultSecondary: "#bd5d3f",
    defaultHeadingFont: '"Cormorant Garamond", "Times New Roman", serif',
    defaultBodyFont: '"Space Grotesk", "Trebuchet MS", sans-serif',
  });

  return {
    ...theme,
    paper: theme.lightPanel,
    lavender: theme.highlight,
    yellow: theme.secondary,
    rust: theme.accent,
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

const sectionEyebrowSx = (bodyFont: string) => ({
  fontFamily: bodyFont,
  fontSize: "0.7rem",
  fontWeight: 800,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
});

export const CompanyProTemplateHeader: React.FC<TemplateChromeProps> = ({
  data,
}) => {
  const { headingFont } = buildCompanyProTheme(data);
  const content = asRecord(data.templateContent);
  const navbar = asRecord(content.navbar);
  const blockId = navbar.blockId;
  const navItems = asArray(navbar.navigationItems, [
    { label: "About", link: "#about", id: "about" },
    { label: "Services", link: "#services", id: "services" },
    { label: "Process", link: "#process", id: "process" },
    { label: "Contact", link: "#contact", id: "contact" },
  ]);
  const brandName =
    typeof navbar.brandName === "string" &&
    navbar.brandName.trim() &&
    navbar.brandName.trim() !== "Your Headline"
      ? navbar.brandName.trim()
      : data.name || "Alder & Co.";

  // Shared, theme-aware Header colors: background follows the active palette
  // primary (manual editor override wins), text flips for readability.
  const headerTheme = buildSharedHeaderTheme(data, navbar, {
    defaultPrimary: "#12100f",
  });

  return (
    <Box {...getEditableSectionProps(blockId, "Header", "sectionStyle")}>
      <TemplateNavbarHeader
        navbarContent={{
          ...navbar,
          brandName,
          ctaText: navbar.ctaText || "Book a session",
          ctaUrl: navbar.ctaLink || "#contact",
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
        onScrollToSection={(id) =>
          document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
        }
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

export const CompanyProTemplateFooter: React.FC<TemplateChromeProps> = ({
  data,
}) => {
  const { ink, paper, yellow, light, headingFont, bodyFont } =
    buildCompanyProTheme(data);
  const content = asRecord(data.templateContent);
  const footer = asRecord(content.footer);
  const blockId = footer.blockId;
  const footerLogo =
    typeof footer.logo === "string" &&
    footer.logo.trim() &&
    /^(?:https?:\/\/|\/)/i.test(footer.logo.trim())
      ? footer.logo
      : "";
  const footerLogoText =
    typeof footer.logoText === "string" && footer.logoText.trim()
      ? footer.logoText.trim()
      : data.name || "Alder & Co.";
  const columns = asArray(footer.columns, [
    {
      title: "Company",
      links: [
        { label: "About", url: "#about" },
        { label: "Services", url: "#services" },
      ],
    },
    {
      title: "Connect",
      links: [
        { label: "Contact", url: "#contact" },
        { label: "LinkedIn", url: "#" },
      ],
    },
  ]);

  return (
    <Box
      component="footer"
      {...getEditableSectionProps(blockId, "Footer", "sectionStyle")}
      sx={{ bgcolor: ink, color: paper, py: { xs: 6, md: 8 } }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.4fr 1fr" },
            gap: 6,
          }}
        >
          {footerLogo ? (
            renderEditableMedia({
              blockId,
              field: "logo",
              label: "Footer logo",
              src: footerLogo,
              alt: data.name || "Alder & Co.",
              sx: {
                width: "min(240px, 100%)",
                height: 72,
                objectFit: "contain",
                objectPosition: "left center",
              },
            })
          ) : (
            <Typography
              {...getEditableTextProps(blockId, "logoText", "single")}
              sx={{
                fontFamily: headingFont,
                fontSize: { xs: "3rem", md: "4.4rem" },
                lineHeight: 0.85,
              }}
            >
              {footerLogoText}
            </Typography>
          )}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 3,
            }}
          >
            {columns.map((column: Record<string, any>, columnIndex: number) => (
              <Stack key={`${column.title}-${columnIndex}`} spacing={1.2}>
                <Typography
                  {...getEditableTextProps(
                    blockId,
                    `columns.${columnIndex}.title`,
                    "single",
                  )}
                  sx={{ ...sectionEyebrowSx(bodyFont), color: yellow }}
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
                      sx={{ color: rgba(paper, 0.72), textDecoration: "none" }}
                    >
                      {link.label}
                    </Box>
                  ),
                )}
              </Stack>
            ))}
          </Box>
        </Box>
        <Typography
          {...getEditableTextProps(blockId, "copyright", "single")}
          sx={{
            mt: 7,
            pt: 3,
            borderTop: `1px solid ${rgba(light, 0.18)}`,
            color: rgba(paper, 0.54),
            fontSize: "0.78rem",
          }}
        >
          {footer.copyright ||
            `(c) 2026 ${data.name || "Alder & Co."}. All rights reserved.`}
        </Typography>
      </Container>
    </Box>
  );
};

const CompanyProTemplate: React.FC<TemplateProps> = ({ data }) => {
  const { ink, paper, lavender, yellow, rust, headingFont, bodyFont } =
    buildCompanyProTheme(data);
  const content = asRecord(data.templateContent);
  const hero = asRecord(content.hero || content.home);
  const statsContent = asRecord(content.stats);
  const about = asRecord(content.about);
  const showcase = asRecord(content.showcase);
  const services = asRecord(content.services || content.features);
  const process = asRecord(content.process);
  const testimonials = asRecord(content.testimonials);
  const contact = asRecord(content.contact);
  const accent = rust;

  const stats = asArray(statsContent.stats, [
    { number: "12", suffix: "+", label: "Years of focused delivery" },
    { number: "94", suffix: "%", label: "Long-term client retention" },
    { number: "160", suffix: "+", label: "Programs launched" },
  ]);
  const serviceItems = asArray(services.features, [
    {
      icon: "01",
      title: "Strategy systems",
      description:
        "Clear priorities, operating models, and measurable roadmaps.",
    },
    {
      icon: "02",
      title: "Experience design",
      description:
        "Useful digital experiences that feel coherent at every touchpoint.",
    },
    {
      icon: "03",
      title: "Delivery partnership",
      description:
        "Senior guidance and practical execution from direction to launch.",
    },
  ]);
  const processItems = asArray(process.features, [
    {
      icon: "01",
      title: "Frame the opportunity",
      description:
        "Align the team around the decision, outcome, and evidence that matter.",
    },
    {
      icon: "02",
      title: "Build the system",
      description:
        "Turn direction into a focused operating and experience model.",
    },
    {
      icon: "03",
      title: "Launch and learn",
      description:
        "Deliver, measure, and improve with clear ownership after launch.",
    },
  ]);
  const reviews = asArray(testimonials.testimonials || testimonials.items, [
    {
      quote:
        "Alder turned a difficult transformation into a system we can keep using.",
      author: "Maya Chen",
      position: "Chief Operating Officer",
      photo: companyProAssets.workspace,
      rating: 5,
    },
    {
      quote:
        "Strategic and practical in equal measure. The result feels premium without being performative.",
      author: "Owen Brooks",
      position: "VP, Commercial Growth",
      photo: companyProAssets.hero,
      rating: 5,
    },
  ]);
  const isCompactTestimonials = useMediaQuery("(max-width:900px)");
  const testimonialsPerView = isCompactTestimonials ? 1 : 2;
  const [testimonialStartIndex, setTestimonialStartIndex] = React.useState(0);
  const [testimonialDirection, setTestimonialDirection] = React.useState(1);
  const [testimonialsPaused, setTestimonialsPaused] = React.useState(false);
  const maxTestimonialStartIndex = Math.max(
    0,
    reviews.length - testimonialsPerView,
  );
  const visibleReviews = reviews.slice(
    testimonialStartIndex,
    testimonialStartIndex + testimonialsPerView,
  );
  const hasTestimonialNavigation = reviews.length > testimonialsPerView;
  const moveTestimonials = (direction: number) => {
    setTestimonialDirection(direction);
    setTestimonialStartIndex((current) => {
      const next = current + direction;
      return next < 0
        ? maxTestimonialStartIndex
        : next > maxTestimonialStartIndex
          ? 0
          : next;
    });
  };
  React.useEffect(() => {
    setTestimonialStartIndex((current) =>
      Math.min(current, maxTestimonialStartIndex),
    );
  }, [maxTestimonialStartIndex]);
  React.useEffect(() => {
    if (!hasTestimonialNavigation || testimonialsPaused) {
      return undefined;
    }

    const timer = window.setInterval(() => moveTestimonials(1), 6500);
    return () => window.clearInterval(timer);
  }, [hasTestimonialNavigation, testimonialsPaused, maxTestimonialStartIndex]);
  const detailGroups = asArray(about.detailGroups, [
    {
      title: "Senior partnership",
      items: ["Direct access", "Clear ownership", "Fast decisions"],
    },
    {
      title: "Built to last",
      items: ["Reusable systems", "Measured outcomes", "Knowledge transfer"],
    },
  ]);
  const socialProof = asRecord(hero.socialProof);
  const avatars = asArray(
    socialProof.avatars,
    companyProAssets.avatars.map((image, index) => ({
      image,
      alt: `Client ${index + 1}`,
    })),
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
        sx={{ bgcolor: paper, py: { xs: 4, md: 8 }, overflow: "hidden" }}
      >
        <TemplateInnerContainer>
          <Box
            {...containerProps(
              hero.blockId,
              "hero.editorial-layout",
              "Hero editorial layout",
            )}
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "0.86fr 1.14fr" },
              gap: { xs: 4, lg: 6 },
              minHeight: { lg: 690 },
              alignItems: "stretch",
            }}
          >
            <Stack
              justifyContent="space-between"
              spacing={5}
              sx={{ py: { md: 3 } }}
            >
              <Box>
                <Typography
                  {...getEditableTextProps(
                    hero.blockId,
                    "eyebrow",
                    "single",
                    "eyebrowStyle",
                  )}
                  sx={{ ...sectionEyebrowSx(bodyFont), mb: 4 }}
                >
                  {hero.eyebrow || "Independent strategy and design practice"}
                </Typography>
                <Typography
                  {...getEditableTextProps(hero.blockId, "heading", "multi")}
                  sx={{
                    fontFamily: headingFont,
                    fontSize: { xs: "4rem", sm: "5.6rem", md: "7.2rem" },
                    fontWeight: 500,
                    letterSpacing: "-0.075em",
                    lineHeight: 0.78,
                    maxWidth: 720,
                    ...(hero.headingStyle || {}),
                  }}
                >
                  {hero.heading || "Clarity for companies in motion."}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1.2fr 0.8fr" },
                  gap: 3,
                  alignItems: "end",
                }}
              >
                <Typography
                  {...getEditableTextProps(hero.blockId, "subheading", "multi")}
                  sx={{
                    fontSize: "1.05rem",
                    lineHeight: 1.65,
                    maxWidth: 520,
                    ...(hero.subheadingStyle || {}),
                  }}
                >
                  {hero.subheading ||
                    "Strategy, identity, and delivery systems for leadership teams building their next chapter."}
                </Typography>
                <Button
                  href={hero.ctaLink || "#contact"}
                  {...getEditableTextProps(
                    hero.blockId,
                    "ctaText",
                    "single",
                    "ctaTextStyle",
                  )}
                  endIcon={<ArrowUpRight size={17} />}
                  sx={{
                    justifySelf: { sm: "end" },
                    border: `1px solid ${ink}`,
                    color: ink,
                    borderRadius: 999,
                    px: 3,
                    py: 1.25,
                    fontWeight: 800,
                    textTransform: "none",
                  }}
                >
                  {hero.ctaText || "Start a conversation"}
                </Button>
              </Box>
            </Stack>
            <Box
              {...containerProps(
                hero.blockId,
                "hero.portrait",
                "Hero portrait",
              )}
              sx={{
                position: "relative",
                minHeight: { xs: 520, md: 690 },
                bgcolor: lavender,
                overflow: "hidden",
              }}
            >
              {renderEditableMedia({
                blockId: hero.blockId,
                field: "heroImage",
                label: "Hero image",
                src: hero.heroImage || companyProAssets.hero,
                alt: "Company Pro advisor portrait",
                style: hero.heroImageStyle,
                sx: {
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                },
              })}
              <Box
                {...containerProps(
                  hero.blockId,
                  "hero.social-proof",
                  "Hero social proof",
                )}
                sx={{
                  position: "absolute",
                  left: { xs: 18, md: 30 },
                  right: { xs: 18, md: 30 },
                  bottom: { xs: 18, md: 28 },
                  bgcolor: rgba(paper, 0.94),
                  color: ink,
                  px: 2.5,
                  py: 2,
                  display: "grid",
                  gridTemplateColumns: "auto 1fr",
                  gap: 2,
                  alignItems: "center",
                }}
              >
                <Stack direction="row" spacing={-1.1}>
                  {avatars
                    .slice(0, 4)
                    .map((avatar: Record<string, any>, index: number) => (
                      <Box key={index}>
                        {renderEditableMedia({
                          blockId: hero.blockId,
                          field: `socialProof.avatars.${index}.image`,
                          label: `Client avatar ${index + 1}`,
                          src: avatar.image,
                          alt: avatar.alt || `Client ${index + 1}`,
                          sx: {
                            width: 44,
                            height: 44,
                            borderRadius: "50%",
                            border: `2px solid ${paper}`,
                            objectFit: "cover",
                          },
                        })}
                      </Box>
                    ))}
                </Stack>
                <Box>
                  <Typography
                    {...getEditableTextProps(
                      hero.blockId,
                      "socialProof.label",
                      "single",
                    )}
                    sx={{ ...sectionEyebrowSx(bodyFont), fontSize: "0.58rem" }}
                  >
                    {socialProof.label || "Client partnership"}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography
                      {...getEditableTextProps(
                        hero.blockId,
                        "socialProof.value",
                        "single",
                      )}
                      sx={{
                        fontFamily: headingFont,
                        fontSize: "1.25rem",
                        lineHeight: 1,
                      }}
                    >
                      {socialProof.value ||
                        "Trusted by ambitious teams worldwide."}
                    </Typography>
                    <Typography sx={{ fontSize: "0.72rem", fontWeight: 800 }}>
                      <Box
                        component="span"
                        {...getEditableTextProps(
                          hero.blockId,
                          "socialProof.rating",
                          "single",
                        )}
                      >
                        {socialProof.rating || 5}
                      </Box>
                      /5
                    </Typography>
                  </Stack>
                </Box>
              </Box>
            </Box>
          </Box>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>
    ),
    stats: (
      <TemplateSectionBoundary
        key="stats"
        blockId={statsContent.blockId}
        label="Trust and statistics"
        sectionKey="stats"
        content={statsContent}
        id="stats"
        sx={{ bgcolor: paper, py: { xs: 3, md: 5 } }}
      >
        <TemplateInnerContainer>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "0.75fr repeat(3, 1fr)" },
              borderTop: `1px solid ${ink}`,
              borderBottom: `1px solid ${ink}`,
            }}
          >
            <Typography
              {...getEditableTextProps(
                statsContent.blockId,
                "heading",
                "single",
              )}
              sx={{ ...sectionEyebrowSx(bodyFont), py: 3, pr: 3 }}
            >
              {statsContent.heading || "Proof in the progress"}
            </Typography>
            {stats
              .slice(0, 3)
              .map((stat: Record<string, any>, index: number) => (
                <Box
                  key={index}
                  {...containerProps(
                    statsContent.blockId,
                    `stats.card.${index}`,
                    `Statistic ${index + 1}`,
                    "card",
                  )}
                  sx={{
                    py: 3,
                    px: { xs: 0, md: 3 },
                    borderLeft: { md: `1px solid ${ink}` },
                    display: "grid",
                    gridTemplateColumns: "auto 1fr",
                    gap: 2,
                    alignItems: "baseline",
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: headingFont,
                      fontSize: "2.6rem",
                      lineHeight: 1,
                    }}
                  >
                    <Box
                      component="span"
                      {...getEditableTextProps(
                        statsContent.blockId,
                        `stats.${index}.prefix`,
                        "single",
                      )}
                    >
                      {stat.prefix || ""}
                    </Box>
                    <Box
                      component="span"
                      {...getEditableTextProps(
                        statsContent.blockId,
                        `stats.${index}.number`,
                        "single",
                      )}
                    >
                      {stat.number}
                    </Box>
                    <Box
                      component="span"
                      {...getEditableTextProps(
                        statsContent.blockId,
                        `stats.${index}.suffix`,
                        "single",
                      )}
                    >
                      {stat.suffix || ""}
                    </Box>
                  </Typography>
                  <Typography
                    {...getEditableTextProps(
                      statsContent.blockId,
                      `stats.${index}.label`,
                      "single",
                    )}
                    sx={{ fontSize: "0.8rem", lineHeight: 1.3 }}
                  >
                    {stat.label}
                  </Typography>
                </Box>
              ))}
          </Box>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>
    ),
    about: (
      <TemplateSectionBoundary
        key="about"
        blockId={about.blockId}
        label="About"
        sectionKey="about"
        content={about}
        id="about"
        sx={{ bgcolor: paper, py: { xs: 8, md: 13 } }}
      >
        <TemplateInnerContainer>
          <Box
            {...containerProps(
              about.blockId,
              "about.editorial-copy",
              "About editorial copy",
            )}
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "0.42fr 1.58fr" },
              gap: { xs: 3, md: 7 },
              borderTop: `1px solid ${ink}`,
              pt: 3,
            }}
          >
            <Typography
              {...getEditableTextProps(
                about.blockId,
                "eyebrow",
                "single",
                "eyebrowStyle",
              )}
              sx={sectionEyebrowSx(bodyFont)}
            >
              {about.eyebrow || "About Alder"}
            </Typography>
            <Box>
              <Typography
                {...getEditableTextProps(about.blockId, "heading", "multi")}
                sx={{
                  fontFamily: headingFont,
                  fontSize: { xs: "2.8rem", md: "4.7rem" },
                  lineHeight: 0.95,
                  letterSpacing: "-0.04em",
                  maxWidth: 980,
                  ...(about.headingStyle || {}),
                }}
              >
                {about.heading || "Capability that turns into momentum."}
              </Typography>
              <Typography
                {...getEditableTextProps(about.blockId, "body", "multi")}
                sx={{
                  mt: 4,
                  maxWidth: 820,
                  fontSize: { xs: "1.05rem", md: "1.35rem" },
                  lineHeight: 1.5,
                  ...(about.bodyStyle || {}),
                }}
              >
                {about.body ||
                  "We work beside leadership teams to turn complex ambitions into clear systems, useful experiences, and measurable progress."}
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              mt: 7,
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
              gap: 3,
              ml: { md: "26%" },
            }}
          >
            {detailGroups
              .slice(0, 2)
              .map((group: Record<string, any>, groupIndex: number) => (
                <Box
                  key={groupIndex}
                  {...containerProps(
                    about.blockId,
                    `about.detail.${groupIndex}`,
                    `About detail ${groupIndex + 1}`,
                    "card",
                  )}
                  sx={{ borderTop: `1px solid ${ink}`, pt: 2 }}
                >
                  <Typography
                    {...getEditableTextProps(
                      about.blockId,
                      `detailGroups.${groupIndex}.title`,
                      "single",
                    )}
                    sx={{ fontFamily: headingFont, fontSize: "1.7rem" }}
                  >
                    {group.title}
                  </Typography>
                  <Stack spacing={1.1} sx={{ mt: 2 }}>
                    {asArray<string>(group.items, []).map((item, itemIndex) => (
                      <Stack
                        key={itemIndex}
                        direction="row"
                        spacing={1.2}
                        alignItems="center"
                      >
                        <Check size={15} color={rust} />
                        <Typography
                          {...getEditableTextProps(
                            about.blockId,
                            `detailGroups.${groupIndex}.items.${itemIndex}`,
                            "single",
                          )}
                        >
                          {item}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Box>
              ))}
          </Box>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>
    ),
    showcase: (
      <TemplateSectionBoundary
        key="showcase"
        blockId={showcase.blockId}
        label="Leadership portrait"
        sectionKey="showcase"
        content={showcase}
        id="showcase"
        sx={{ bgcolor: paper, pb: { xs: 9, md: 14 } }}
      >
        <TemplateInnerContainer>
          <Box
            {...containerProps(
              showcase.blockId,
              "showcase.editorial-image",
              "Leadership editorial image",
            )}
            sx={{ width: { xs: "100%", md: "72%" }, ml: { md: "auto" } }}
          >
            {renderEditableMedia({
              blockId: showcase.blockId,
              field: "image",
              label: "Leadership image",
              src: showcase.image || companyProAssets.about,
              alt: showcase.alt || "Company Pro team collaborating",
              style: showcase.imageStyle,
              sx: {
                width: "100%",
                aspectRatio: { xs: "4 / 3", md: "16 / 9" },
                objectFit: "cover",
                display: "block",
              },
            })}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "0.3fr 1fr" },
                gap: 2,
                mt: 1.5,
              }}
            >
              <Typography
                {...getEditableTextProps(showcase.blockId, "alt", "single")}
                sx={{ ...sectionEyebrowSx(bodyFont), fontSize: "0.58rem" }}
              >
                {showcase.alt || "Leadership team"}
              </Typography>
              <Typography
                {...getEditableTextProps(showcase.blockId, "caption", "multi")}
                sx={{
                  fontFamily: headingFont,
                  fontSize: { xs: "1.45rem", md: "2rem" },
                  lineHeight: 1.05,
                }}
              >
                {showcase.caption ||
                  "Senior operators, designers, and strategists working as one accountable team."}
              </Typography>
            </Box>
          </Box>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>
    ),
    services: (
      <TemplateSectionBoundary
        key="services"
        blockId={services.blockId}
        label="Services"
        sectionKey="services"
        content={services}
        id="services"
        sx={{ bgcolor: paper, py: { xs: 8, md: 13 } }}
      >
        <TemplateInnerContainer>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "0.42fr 1.58fr" },
              gap: { xs: 3, md: 7 },
            }}
          >
            <Box>
              <Typography
                {...getEditableTextProps(
                  services.blockId,
                  "eyebrow",
                  "single",
                  "eyebrowStyle",
                )}
                sx={sectionEyebrowSx(bodyFont)}
              >
                {services.eyebrow || "Services"}
              </Typography>
            </Box>
            <Box>
              <Typography
                {...getEditableTextProps(services.blockId, "heading", "multi")}
                sx={{
                  fontFamily: headingFont,
                  fontSize: { xs: "3rem", md: "5rem" },
                  lineHeight: 0.9,
                  mb: 6,
                }}
              >
                {services.heading || "Expertise for meaningful change."}
              </Typography>
              {serviceItems
                .slice(0, 6)
                .map((item: Record<string, any>, index: number) => (
                  <Box
                    key={index}
                    {...containerProps(
                      services.blockId,
                      `services.row.${index}`,
                      `Service ${index + 1}`,
                      "card",
                    )}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "auto 1fr",
                        md: "0.22fr 0.78fr 1fr",
                      },
                      gap: 2,
                      py: 3,
                      borderTop: `1px solid ${ink}`,
                      alignItems: "start",
                    }}
                  >
                    <Typography
                      {...getEditableTextProps(
                        services.blockId,
                        `features.${index}.icon`,
                        "single",
                      )}
                      sx={sectionEyebrowSx(bodyFont)}
                    >
                      {item.icon || String(index + 1).padStart(2, "0")}
                    </Typography>
                    <Typography
                      {...getEditableTextProps(
                        services.blockId,
                        `features.${index}.title`,
                        "single",
                      )}
                      sx={{
                        fontFamily: headingFont,
                        fontSize: { xs: "1.6rem", md: "2rem" },
                        lineHeight: 1,
                      }}
                    >
                      {item.title}
                    </Typography>
                    <Typography
                      {...getEditableTextProps(
                        services.blockId,
                        `features.${index}.description`,
                        "multi",
                      )}
                      sx={{ lineHeight: 1.55, color: rgba(ink, 0.7) }}
                    >
                      {item.description}
                    </Typography>
                  </Box>
                ))}
            </Box>
          </Box>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>
    ),
    process: (
      <TemplateSectionBoundary
        key="process"
        blockId={process.blockId}
        label="Process"
        sectionKey="process"
        content={process}
        id="process"
        sx={{ bgcolor: yellow, py: { xs: 8, md: 13 } }}
      >
        <TemplateInnerContainer>
          <Typography
            {...getEditableTextProps(
              process.blockId,
              "eyebrow",
              "single",
              "eyebrowStyle",
            )}
            sx={sectionEyebrowSx(bodyFont)}
          >
            {process.eyebrow || "How we work"}
          </Typography>
          <Typography
            {...getEditableTextProps(process.blockId, "heading", "multi")}
            sx={{
              mt: 3,
              fontFamily: headingFont,
              fontSize: { xs: "3.5rem", md: "6.2rem" },
              lineHeight: 0.82,
              letterSpacing: "-0.055em",
              maxWidth: 1000,
            }}
          >
            {process.heading || "A clear path from ambition to action."}
          </Typography>
          <Box
            sx={{
              mt: 8,
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
              gap: 2,
            }}
          >
            {processItems
              .slice(0, 3)
              .map((item: Record<string, any>, index: number) => (
                <Box
                  key={index}
                  {...containerProps(
                    process.blockId,
                    `process.card.${index}`,
                    `Process step ${index + 1}`,
                    "card",
                  )}
                  sx={{
                    bgcolor: paper,
                    p: { xs: 3, md: 4 },
                    minHeight: 320,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography
                    {...getEditableTextProps(
                      process.blockId,
                      `features.${index}.icon`,
                      "single",
                    )}
                    sx={{
                      fontFamily: headingFont,
                      fontSize: "4rem",
                      lineHeight: 1,
                      color: accent,
                    }}
                  >
                    {item.icon}
                  </Typography>
                  <Box>
                    <Typography
                      {...getEditableTextProps(
                        process.blockId,
                        `features.${index}.title`,
                        "single",
                      )}
                      sx={{
                        fontFamily: headingFont,
                        fontSize: "1.8rem",
                        lineHeight: 1,
                      }}
                    >
                      {item.title}
                    </Typography>
                    <Typography
                      {...getEditableTextProps(
                        process.blockId,
                        `features.${index}.description`,
                        "multi",
                      )}
                      sx={{ mt: 1.5, lineHeight: 1.55 }}
                    >
                      {item.description}
                    </Typography>
                  </Box>
                </Box>
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
        sx={{ bgcolor: ink, color: paper, py: { xs: 8, md: 13 } }}
      >
        <TemplateInnerContainer>
          <Typography
            {...getEditableTextProps(testimonials.blockId, "heading", "multi")}
            sx={{
              fontFamily: headingFont,
              fontSize: { xs: "3.1rem", md: "5.4rem" },
              lineHeight: 0.9,
              maxWidth: 900,
            }}
          >
            {testimonials.heading || "Trusted when the work matters."}
          </Typography>
          <Box
            sx={{ mt: 7, overflow: "hidden" }}
            onMouseEnter={() => setTestimonialsPaused(true)}
            onMouseLeave={() => setTestimonialsPaused(false)}
            onFocusCapture={() => setTestimonialsPaused(true)}
            onBlurCapture={() => setTestimonialsPaused(false)}
          >
            <AnimatePresence mode="wait" initial={false}>
              <Box
                key={`testimonial-page-${testimonialStartIndex}`}
                component={motion.div}
                initial={{ opacity: 0, x: testimonialDirection * 28 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: testimonialDirection * -20 }}
                transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    md:
                      visibleReviews.length > 1
                        ? "1.3fr 0.7fr"
                        : "minmax(0, 1fr)",
                  },
                  gap: 3,
                  alignItems: "stretch",
                }}
              >
                {visibleReviews.map(
                  (item: Record<string, any>, visibleIndex: number) => {
                    const index = testimonialStartIndex + visibleIndex;
                    const author = item.author ?? item.name ?? "";
                    const quote = item.quote ?? item.text ?? "";
                    return (
                      <Box
                        key={`${index}-${author}`}
                        {...containerProps(
                          testimonials.blockId,
                          `testimonials.card.${index}`,
                          `Testimonial ${index + 1}`,
                          "card",
                        )}
                        sx={{
                          bgcolor: visibleIndex === 0 ? lavender : rust,
                          color: ink,
                          p: { xs: 3, md: 5 },
                          minHeight: visibleIndex === 0 ? 470 : 360,
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                        }}
                      >
                        <Box>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <Quote size={25} />
                            <Star size={16} fill="currentColor" />
                            <Typography sx={{ fontWeight: 800 }}>
                              <Box
                                component="span"
                                {...getEditableTextProps(
                                  testimonials.blockId,
                                  `testimonials.${index}.rating`,
                                  "single",
                                )}
                              >
                                {item.rating ?? 5}
                              </Box>
                              /5
                            </Typography>
                          </Stack>
                          <Typography
                            {...getEditableTextProps(
                              testimonials.blockId,
                              `testimonials.${index}.quote`,
                              "multi",
                            )}
                            sx={{
                              mt: 4,
                              fontFamily: headingFont,
                              fontSize: {
                                xs: "2rem",
                                md: visibleIndex === 0 ? "3.1rem" : "2.15rem",
                              },
                              lineHeight: 0.98,
                            }}
                          >
                            {quote}
                          </Typography>
                        </Box>
                        <Stack
                          direction="row"
                          spacing={2}
                          alignItems="center"
                          sx={{ mt: 5 }}
                        >
                          {renderEditableMedia({
                            blockId: testimonials.blockId,
                            field: `testimonials.${index}.photo`,
                            label: `Testimonial photo ${index + 1}`,
                            src:
                              item.photo ||
                              item.avatar ||
                              item.image ||
                              companyProAssets.avatars[
                                index % companyProAssets.avatars.length
                              ],
                            alt: author,
                            sx: {
                              width: 58,
                              height: 58,
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
                              sx={{ fontWeight: 900 }}
                            >
                              {author}
                            </Typography>
                            <Typography
                              {...getEditableTextProps(
                                testimonials.blockId,
                                `testimonials.${index}.role`,
                                "single",
                              )}
                              sx={{ fontSize: "0.8rem" }}
                            >
                              {item.role ?? item.position ?? ""}
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>
                    );
                  },
                )}
              </Box>
            </AnimatePresence>
            {hasTestimonialNavigation ? (
              <Stack
                direction="row"
                spacing={1}
                justifyContent="flex-end"
                sx={{ mt: 2 }}
              >
                <Button
                  aria-label="Previous testimonials"
                  onClick={() => moveTestimonials(-1)}
                  sx={{
                    minWidth: 42,
                    width: 42,
                    height: 42,
                    p: 0,
                    color: paper,
                    border: `1px solid ${rgba(paper, 0.28)}`,
                    borderRadius: "50%",
                  }}
                >
                  <ArrowLeft size={18} />
                </Button>
                <Button
                  aria-label="Next testimonials"
                  onClick={() => moveTestimonials(1)}
                  sx={{
                    minWidth: 42,
                    width: 42,
                    height: 42,
                    p: 0,
                    color: paper,
                    border: `1px solid ${rgba(paper, 0.28)}`,
                    borderRadius: "50%",
                  }}
                >
                  <ArrowRight size={18} />
                </Button>
              </Stack>
            ) : null}
          </Box>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>
    ),
    contact: (
      <TemplateSectionBoundary
        key="contact"
        blockId={contact.blockId}
        label="Contact"
        sectionKey="contact"
        content={contact}
        id="contact"
        sx={{ bgcolor: yellow, py: { xs: 8, md: 12 }, overflow: "hidden" }}
      >
        <TemplateInnerContainer>
          <Box
            {...containerProps(
              contact.blockId,
              "contact.editorial-cta",
              "Contact call to action",
            )}
            sx={{ textAlign: "center" }}
          >
            <Typography
              {...getEditableTextProps(
                contact.blockId,
                "eyebrow",
                "single",
                "eyebrowStyle",
              )}
              sx={sectionEyebrowSx(bodyFont)}
            >
              {contact.eyebrow || "Let us create together"}
            </Typography>
            <Typography
              {...getEditableTextProps(contact.blockId, "heading", "multi")}
              sx={{
                mt: 3,
                fontFamily: headingFont,
                fontSize: { xs: "4rem", md: "8rem" },
                lineHeight: 0.78,
                letterSpacing: "-0.07em",
              }}
            >
              {contact.heading || "Ready to move with clarity?"}
            </Typography>
            <Typography
              {...getEditableTextProps(contact.blockId, "description", "multi")}
              sx={{ mt: 4, mx: "auto", maxWidth: 640, lineHeight: 1.6 }}
            >
              {contact.description ||
                data.contact.email ||
                "Tell us what you are building and where you need momentum."}
            </Typography>
            <Button
              href={`mailto:${contact.email || data.contact.email || "hello@alderandco.com"}`}
              {...getEditableTextProps(
                contact.blockId,
                "buttonLabel",
                "single",
                "buttonTextStyle",
              )}
              endIcon={<ArrowUpRight size={17} />}
              sx={{
                mt: 4,
                border: `1px solid ${ink}`,
                color: ink,
                borderRadius: 999,
                px: 4,
                py: 1.35,
                fontWeight: 900,
                textTransform: "none",
              }}
            >
              {contact.buttonLabel || "Start a project"}
            </Button>
          </Box>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>
    ),
  };

  const defaultOrder = [
    "hero",
    "stats",
    "about",
    "showcase",
    "services",
    "process",
    "testimonials",
    "contact",
  ];
  const requestedOrder = asArray<string>(content.sectionOrder, defaultOrder);
  const order = [
    ...requestedOrder.filter((key) => sectionMap[key]),
    ...defaultOrder.filter((key) => !requestedOrder.includes(key)),
  ];

  return (
    <TemplatePageShell templateId="company-pro" data={data}>
      <Box sx={{ fontFamily: bodyFont, color: ink, bgcolor: paper }}>
        {order.map((key) => sectionMap[key])}
      </Box>
    </TemplatePageShell>
  );
};

export default CompanyProTemplate;
