/**
 * Block Renderer - Renders individual blocks based on their type
 * This component displays the visual content for template blocks
 */

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  lazy,
  Suspense,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BlockWrapper } from "./BlockWrapper";
import { useCountUp } from "./hooks/useCountUp";

// Lazy-load FormBuilderBlock for code splitting (Step 2.29.2)
const FormBuilderBlock = lazy(() => import("./dynamic/FormBuilderBlock"));

// Lazy-load BlogFeedBlock for code splitting (Step 2.23)
const BlogFeedBlock = lazy(() => import("./dynamic/BlogFeedBlock"));

// Lazy-load BlogFeedStaticRenderer for code splitting (Step 17.5)
const BlogFeedStaticRenderer = lazy(
  () => import("./blocks/BlogFeedStaticRenderer"),
);

// Lazy-load BlogArticleBlock for code splitting (Step 2.24)
const BlogArticleBlock = lazy(() => import("./dynamic/BlogArticleBlock"));

// Split blog-page section blocks (BLOG_HERO / BLOG_FEATURED / BLOG_GRID)
const BlogHeroBlock = lazy(() => import("./dynamic/BlogHeroBlock"));
const BlogFeaturedBlock = lazy(() => import("./dynamic/BlogFeaturedBlock"));
const BlogGridBlock = lazy(() => import("./dynamic/BlogGridBlock"));

// Lazy-load ProductShowcaseBlock for code splitting (Step 2.26)
const ProductShowcaseBlock = lazy(
  () => import("./dynamic/ProductShowcaseBlock"),
);

// Lazy-load DirectoryListingBlock for code splitting (Step 2.27)
const DirectoryListingBlock = lazy(
  () => import("./dynamic/DirectoryListingBlock"),
);

// Lazy-load embed and menu display blocks for code splitting (Step 2.29B)
const SocialEmbedBlock = lazy(() => import("./blocks/SocialEmbedBlock"));
const EmbedBlock = lazy(() => import("./blocks/EmbedBlock"));
const MenuDisplayBlock = lazy(() => import("./blocks/MenuDisplayBlock"));
const WebsiteHeaderBlock = lazy(() => import("./blocks/WebsiteHeaderBlock"));
const CustomCodeBlock = lazy(() => import("./blocks/CustomCodeBlock"));

// Lazy-load newsletter and reviews blocks for code splitting (Step 2.28)
const NewsletterBlock = lazy(() => import("./blocks/NewsletterBlock"));
const ReviewsBlock = lazy(() => import("./dynamic/ReviewsBlock"));
// Lazy-load MapLocationBlock for code splitting (Step 2.28.1)
const MapLocationBlock = lazy(() => import("./blocks/MapLocationBlock"));

// Lazy-load EventsListBlock for code splitting (Step 2.29C)
const EventsListBlock = lazy(() => import("./dynamic/EventsListBlock"));

// Lazy-load CollageBlock for code splitting (Step 14.6)
const CollageBlock = lazy(() => import("./blocks/CollageBlock"));

// Block components (Step 10.1)
import HeroBlock from "./blocks/HeroBlock";
// Block components (Step 10.2)
import GalleryBlock from "./blocks/GalleryBlock";
// Block components (Step 10.3)
import FeaturesBlock from "./blocks/FeaturesBlock";
// Block components (Step 11.2)
import PortfolioGridBlock from "./blocks/PortfolioGridBlock";
// Block components (Step 11.1)
import MarqueeBlock from "./blocks/MarqueeBlock";
// Block components (Step 11.3)
import WorkingHoursBlock from "./blocks/WorkingHoursBlock";
// Block components (Step 11.4)
import ReservationFormBlock from "./blocks/ReservationFormBlock";
// Block components (Step 15.4)
import ContactBlock from "./blocks/ContactBlock";
// Block components (Step 15.8)
import StoryPanelBlock from "./blocks/StoryPanelBlock";
// Block components (Step 17.8)
import DecorativeBlock from "./blocks/DecorativeBlock";

// Block components (Step 2.29A)
import BeforeAfterBlock from "./blocks/BeforeAfterBlock";
import AnnouncementBarBlock from "./blocks/AnnouncementBarBlock";
import LogoCarouselBlock from "./blocks/LogoCarouselBlock";
import CountdownBlock from "./blocks/CountdownBlock";
// Block components (Step 2.29A.1-2, 2.29A.7)
import TabsBlock from "./blocks/TabsBlock";
import StepsProcessBlock from "./blocks/StepsProcessBlock";
import TableBlock from "./blocks/TableBlock";
// Block components (Step 10.6)
import FooterBlock from "./blocks/FooterBlock";
// Block components (Step 10.7)
import ImageTextSplitBlock from "./blocks/ImageTextSplitBlock";
// Block components (Step 10.5 / Step 14.10 — PublicWebsite-native with BlockWrapper)
import NavbarBlock from "./blocks/NavbarBlock";
// Step 14.1 — per-item stagger animation
import AnimatedList from "./utils/AnimatedList";
// Heading typography resolver (Step 14.2)
import {
  resolveHeadingTypographySx,
  resolveSubheadingTypographySx,
  resolveGradientTextSx,
  resolveTextStrokeSx,
} from "./utils/headingTypography";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  TextField,
  Alert,
} from "@mui/material";
import DOMPurify from "dompurify";

interface Block {
  id: number;
  blockType: string;
  content: any;
  sortOrder: number;
  variant?: string;
}

interface BlockRendererProps {
  block: Block;
  primaryColor?: string;
  secondaryColor?: string;
  headingColor?: string;
  bodyColor?: string;
  websiteId?: string | number;
  onCtaClick?: (blockType: string, ctaText: string) => void;
  onFormSubmit?: (formName: string, success: boolean) => void;
}

// ── TestimonialsStackedMUI — module-level (Step 10.4) ─────────────────────────

interface TestimonialsStackedMUIProps {
  heading?: string;
  items: any[];
  headingColor: string;
  bodyColor: string;
  fields: any;
}

const TestimonialsStackedMUI: React.FC<TestimonialsStackedMUIProps> = ({
  heading,
  items,
  headingColor,
  bodyColor,
  fields,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const count = items.length;

  const startInterval = useCallback(() => {
    if (count <= 1) return;
    intervalRef.current = setInterval(() => {
      setActiveIndex((i) => (i + 1) % count);
    }, 6000);
  }, [count]);

  const stopInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    startInterval();
    return () => stopInterval();
  }, [startInterval, stopInterval]);

  const goTo = useCallback(
    (idx: number) => {
      stopInterval();
      setActiveIndex(idx);
      startInterval();
    },
    [stopInterval, startInterval],
  );

  const goPrev = useCallback(() => {
    goTo((activeIndex - 1 + count) % count);
  }, [activeIndex, count, goTo]);

  const goNext = useCallback(() => {
    goTo((activeIndex + 1) % count);
  }, [activeIndex, count, goTo]);

  if (count === 0) {
    return (
      <BlockWrapper fields={fields}>
        <Box sx={{ bgcolor: "grey.50", py: 8, textAlign: "center" }}>
          <Typography color="text.secondary">No testimonials yet.</Typography>
        </Box>
      </BlockWrapper>
    );
  }

  const item = items[activeIndex];
  const starRating =
    item.rating != null
      ? Math.min(5, Math.max(1, Math.round(Number(item.rating))))
      : null;

  return (
    <BlockWrapper fields={fields}>
      <Box
        sx={{ bgcolor: "grey.50", py: 8 }}
        onMouseEnter={stopInterval}
        onMouseLeave={startInterval}
      >
        <Container maxWidth="md">
          <Typography
            variant="h3"
            component="h2"
            align="center"
            gutterBottom
            sx={{ mb: 6, fontWeight: 600, color: headingColor }}
          >
            {heading || "What Our Clients Say"}
          </Typography>

          <Box sx={{ position: "relative", minHeight: 260 }}>
            {/* Prev arrow */}
            {count > 1 && (
              <Box
                component="button"
                onClick={goPrev}
                aria-label="Previous testimonial"
                sx={{
                  position: "absolute",
                  left: -40,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  fontSize: "2rem",
                  cursor: "pointer",
                  color: headingColor,
                  opacity: 0.6,
                  "&:hover": { opacity: 1 },
                  zIndex: 1,
                }}
              >
                &#8249;
              </Box>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card elevation={2} sx={{ p: 4, textAlign: "center" }}>
                  <Avatar
                    src={item.photo || item.avatar}
                    alt={item.author || "Author"}
                    sx={{ width: 72, height: 72, mx: "auto", mb: 2 }}
                  >
                    {(item.author || "A").charAt(0).toUpperCase()}
                  </Avatar>
                  {starRating != null && (
                    <Box
                      aria-label={`${starRating} out of 5 stars`}
                      sx={{ color: "#f59e0b", fontSize: "1.2em", mb: 1 }}
                    >
                      {"★".repeat(starRating)}
                      {"☆".repeat(5 - starRating)}
                    </Box>
                  )}
                  <Typography
                    variant="body1"
                    sx={{
                      fontStyle: "italic",
                      color: bodyColor,
                      mb: 3,
                      fontSize: "1.1rem",
                    }}
                  >
                    &ldquo;{item.quote}&rdquo;
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, color: headingColor }}
                  >
                    {item.author}
                  </Typography>
                  {(item.position || item.role) && (
                    <Typography variant="body2" color="text.secondary">
                      {item.position || item.role}
                    </Typography>
                  )}
                </Card>
              </motion.div>
            </AnimatePresence>

            {/* Next arrow */}
            {count > 1 && (
              <Box
                component="button"
                onClick={goNext}
                aria-label="Next testimonial"
                sx={{
                  position: "absolute",
                  right: -40,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  fontSize: "2rem",
                  cursor: "pointer",
                  color: headingColor,
                  opacity: 0.6,
                  "&:hover": { opacity: 1 },
                  zIndex: 1,
                }}
              >
                &#8250;
              </Box>
            )}
          </Box>

          {/* Dot indicators */}
          {count > 1 && (
            <Box
              sx={{ display: "flex", justifyContent: "center", gap: 1, mt: 3 }}
              role="tablist"
              aria-label="Testimonial navigation"
            >
              {items.map((_, idx) => (
                <Box
                  key={idx}
                  component="button"
                  role="tab"
                  aria-selected={idx === activeIndex}
                  aria-label={`Go to testimonial ${idx + 1}`}
                  onClick={() => goTo(idx)}
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    border: "none",
                    cursor: "pointer",
                    p: 0,
                    background:
                      idx === activeIndex ? "#f59e0b" : "rgba(0,0,0,0.2)",
                    transition: "background 0.3s",
                  }}
                />
              ))}
            </Box>
          )}
        </Container>
      </Box>
    </BlockWrapper>
  );
};

// ── StatItem — scroll-triggered count-up animation (Step 16.2) ──────────────

interface StatItemProps {
  stat: { number: string; label: string; prefix?: string; suffix?: string };
  animateNumbers?: boolean;
  animationNumberDuration?: number;
}

const StatItem = React.memo<StatItemProps>(
  ({ stat, animateNumbers = false, animationNumberDuration = 2000 }) => {
    const { ref, displayValue } = useCountUp({
      target: stat.number,
      duration: animationNumberDuration,
      enabled: animateNumbers,
    });

    return (
      <Grid item xs={6} md={4} sx={{ textAlign: "center" }}>
        <Typography
          variant="h2"
          sx={{ fontWeight: 800, color: "white" }}
          ref={ref as React.Ref<HTMLElement>}
        >
          {stat.prefix || ""}
          {displayValue}
          {stat.suffix || ""}
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.85, color: "white" }}>
          {stat.label}
        </Typography>
      </Grid>
    );
  },
);

StatItem.displayName = "StatItem";

// ─────────────────────────────────────────────────────────────────────────────

const BlockRenderer: React.FC<BlockRendererProps> = ({
  block,
  primaryColor = "#2563eb",
  secondaryColor = "#64748b",
  headingColor = "#1e293b",
  bodyColor = "#475569",
  websiteId,
  onCtaClick,
  onFormSubmit,
}) => {
  const { blockType, content } = block;
  const navigate = useNavigate();
  const basePrimaryColor =
    primaryColor.length === 9 ? primaryColor.slice(0, 7) : primaryColor;

  /**
   * The backend block-type enum doesn't include the split blog-page sections
   * (BLOG_HERO / BLOG_FEATURED / BLOG_GRID), so they are persisted as BLOG_FEED
   * with a `_subType` discriminator (mirrors the WEBSITE_HEADER → NAVBAR remap).
   * Resolve back to the real type for rendering. In-editor blocks already carry
   * the real type and pass through unchanged.
   */
  const BLOG_FEED_SUBTYPES: Record<string, string> = {
    blog_hero: "BLOG_HERO",
    blog_featured: "BLOG_FEATURED",
    blog_grid: "BLOG_GRID",
  };
  const renderBlockType =
    blockType === "BLOG_FEED" && content?._subType
      ? BLOG_FEED_SUBTYPES[String(content._subType).toLowerCase()] || blockType
      : blockType;

  /**
   * Check if a URL is internal (relative or same domain)
   */
  const isInternalLink = (url: string): boolean => {
    if (!url) return false;
    // Relative paths are internal
    if (url.startsWith("/")) return true;
    // Hash links are internal
    if (url.startsWith("#")) return true;
    // External links start with http:// or https://
    if (url.startsWith("http://") || url.startsWith("https://")) return false;
    // Everything else is considered internal
    return true;
  };

  /**
   * Handle CTA button clicks - navigate for internal links, open in same tab for external
   */
  const handleCtaClick = (url: string, ctaText?: string) => {
    if (!url || url === "#") return;

    // Track CTA click if analytics is enabled
    if (onCtaClick && ctaText) {
      onCtaClick(blockType, ctaText);
    }

    if (isInternalLink(url)) {
      navigate(url);
    } else {
      window.location.href = url;
    }
  };

  switch (renderBlockType) {
    case "HERO":
      return (
        <HeroBlock
          content={content}
          variant={block.variant}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          headingColor={headingColor}
          bodyColor={bodyColor}
          onCtaClick={onCtaClick}
        />
      );

    case "FEATURES":
      return (
        <FeaturesBlock
          content={content}
          primaryColor={primaryColor}
          headingColor={headingColor}
          bodyColor={bodyColor}
        />
      );

    case "TESTIMONIALS": {
      const testimonialItems: any[] =
        content.testimonials || content.items || [];

      if ((content.variant || "cards") === "stacked") {
        return (
          <TestimonialsStackedMUI
            heading={content.heading}
            items={testimonialItems}
            headingColor={headingColor}
            bodyColor={bodyColor}
            fields={content}
          />
        );
      }

      // cards variant (default) — 2-column grid with star ratings
      return (
        <BlockWrapper fields={content}>
          <Box sx={{ bgcolor: "grey.50" }}>
            <Container maxWidth="lg">
              <Typography
                variant="h3"
                component="h2"
                align="center"
                gutterBottom
                sx={{ mb: 6, fontWeight: 600, color: headingColor }}
              >
                {content.heading || "What Our Clients Say"}
              </Typography>
              <Grid container spacing={4}>
                <AnimatedList
                  staggerMs={100}
                  wrapperStyle={{ display: "contents" }}
                >
                  {testimonialItems.map((testimonial: any, index: number) => {
                    const starRating =
                      testimonial.rating != null
                        ? Math.min(
                            5,
                            Math.max(1, Math.round(Number(testimonial.rating))),
                          )
                        : null;
                    return (
                      <Grid item xs={12} md={6} key={index}>
                        <Card elevation={1} sx={{ p: 3 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 2,
                            }}
                          >
                            <Avatar
                              src={testimonial.photo || testimonial.avatar}
                              alt={testimonial.author || "Author"}
                              sx={{ width: 40, height: 40, mr: 1.5 }}
                            >
                              {(testimonial.author || "A")
                                .charAt(0)
                                .toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography
                                variant="subtitle1"
                                sx={{
                                  fontWeight: 600,
                                  color: headingColor,
                                  lineHeight: 1.2,
                                }}
                              >
                                {testimonial.author}
                              </Typography>
                              {(testimonial.position || testimonial.role) && (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {testimonial.position || testimonial.role}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                          {starRating != null && (
                            <Box
                              aria-label={`${starRating} out of 5 stars`}
                              sx={{
                                color: "#f59e0b",
                                fontSize: "1.1em",
                                mb: 1,
                              }}
                            >
                              {"★".repeat(starRating)}
                              {"☆".repeat(5 - starRating)}
                            </Box>
                          )}
                          <Typography
                            variant="body1"
                            sx={{ fontStyle: "italic", color: bodyColor }}
                          >
                            &ldquo;{testimonial.quote}&rdquo;
                          </Typography>
                        </Card>
                      </Grid>
                    );
                  })}
                </AnimatedList>
              </Grid>
            </Container>
          </Box>
        </BlockWrapper>
      );
    }

    case "CTA": {
      const headingTypoSx = resolveHeadingTypographySx(content);
      const subheadingTypoSx = resolveSubheadingTypographySx(content);
      const ctaGradientTextSx = resolveGradientTextSx(content);
      const ctaTextStrokeSx = resolveTextStrokeSx(content);
      const ctaStatusBadge = content.statusBadge;
      return (
        <BlockWrapper fields={content}>
          <Box
            sx={{
              background: `linear-gradient(135deg, ${basePrimaryColor}ee 0%, ${primaryColor} 100%)`,
              color: "white",
              textAlign: "center",
            }}
          >
            <Container maxWidth="md">
              {ctaStatusBadge?.text && (
                <>
                  <style>{`
                  @keyframes statusPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
                  @keyframes statusGlow { 0%, 100% { box-shadow: 0 0 4px 1px currentColor; } 50% { box-shadow: 0 0 10px 4px currentColor; } }
                `}</style>
                  <Box
                    data-testid="status-badge"
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1.5,
                      justifyContent: "center",
                      width: "100%",
                    }}
                  >
                    <Box
                      data-testid="status-badge-dot"
                      data-animation={ctaStatusBadge.animation || "none"}
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        backgroundColor: ctaStatusBadge.color || "#22c55e",
                        flexShrink: 0,
                        ...(ctaStatusBadge.animation === "pulse"
                          ? { animation: "statusPulse 2s ease-in-out infinite" }
                          : ctaStatusBadge.animation === "glow"
                            ? {
                                animation: "statusGlow 2s ease-in-out infinite",
                                color: ctaStatusBadge.color || "#22c55e",
                              }
                            : {}),
                      }}
                    />
                    <Typography
                      component="span"
                      sx={{
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        color: "inherit",
                        letterSpacing: "0.02em",
                      }}
                    >
                      {ctaStatusBadge.text}
                    </Typography>
                  </Box>
                </>
              )}
              <Typography
                variant="h3"
                component="h2"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  mb: 3,
                  color: "white",
                  ...headingTypoSx,
                  ...ctaGradientTextSx,
                  ...ctaTextStrokeSx,
                }}
              >
                {content.heading || "Ready to Get Started?"}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  mb: 4,
                  color: "white",
                  ...subheadingTypoSx,
                  opacity: 0.95 * ((content.headingOpacity ?? 100) / 100),
                }}
              >
                {content.subheading ||
                  "Join us today and transform your business"}
              </Typography>
              {content.ctaText && (
                <Button
                  variant="contained"
                  size="large"
                  onClick={() =>
                    handleCtaClick(content.ctaLink, content.ctaText)
                  }
                  sx={{
                    bgcolor: "white",
                    color: primaryColor,
                    px: 5,
                    py: 2,
                    fontSize: "1.2rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.9)",
                    },
                  }}
                >
                  {content.ctaText}
                </Button>
              )}
            </Container>
          </Box>
        </BlockWrapper>
      );
    }

    case "CONTACT":
      return (
        <ContactBlock
          block={block}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          headingColor={headingColor}
          bodyColor={bodyColor}
          websiteId={websiteId}
          onFormSubmit={onFormSubmit}
        />
      );

    case "TEXT":
      return (
        <BlockWrapper fields={content}>
          <Box>
            <Container maxWidth="md">
              {content.heading && (
                <Typography
                  variant="h3"
                  component="h2"
                  gutterBottom
                  sx={{ mb: 4, fontWeight: 600, color: headingColor }}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(content.heading),
                  }}
                />
              )}
              <Typography
                variant="body1"
                sx={{
                  lineHeight: 1.8,
                  fontSize: "1.1rem",
                  color: bodyColor,
                }}
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(content.body || ""),
                }}
              />
            </Container>
          </Box>
        </BlockWrapper>
      );

    case "FORM_BUILDER":
      return (
        <BlockWrapper fields={content}>
          <Suspense
            fallback={
              <Box sx={{ py: 8 }}>
                <Container maxWidth="lg">
                  <Typography variant="body2" color="text.secondary">
                    Loading form…
                  </Typography>
                </Container>
              </Box>
            }
          >
            <FormBuilderBlock block={block} primaryColor={primaryColor} />
          </Suspense>
        </BlockWrapper>
      );

    case "WEBSITE_HEADER":
      return (
        <Suspense fallback={<Box sx={{ height: 68 }} />}>
          <WebsiteHeaderBlock
            block={block}
            primaryColor={primaryColor}
            headingColor={headingColor}
            websiteId={websiteId}
            onCtaClick={onCtaClick}
          />
        </Suspense>
      );

    case "BEFORE_AFTER":
      return (
        <BlockWrapper fields={content}>
          <BeforeAfterBlock
            block={block}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            headingColor={headingColor}
            bodyColor={bodyColor}
            onCtaClick={onCtaClick}
          />
        </BlockWrapper>
      );

    case "ANNOUNCEMENT_BAR":
      return (
        <BlockWrapper fields={content}>
          <AnnouncementBarBlock
            block={block}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            headingColor={headingColor}
            bodyColor={bodyColor}
            onCtaClick={onCtaClick}
          />
        </BlockWrapper>
      );

    case "LOGO_CAROUSEL":
      return (
        <BlockWrapper fields={content}>
          <LogoCarouselBlock
            block={block}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            headingColor={headingColor}
            bodyColor={bodyColor}
            onCtaClick={onCtaClick}
          />
        </BlockWrapper>
      );

    case "COUNTDOWN":
      return (
        <BlockWrapper fields={content}>
          <CountdownBlock
            block={block}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            headingColor={headingColor}
            bodyColor={bodyColor}
            onCtaClick={onCtaClick}
          />
        </BlockWrapper>
      );

    case "TABS":
      return (
        <BlockWrapper fields={content}>
          <TabsBlock
            block={block}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            headingColor={headingColor}
            bodyColor={bodyColor}
            onCtaClick={onCtaClick}
          />
        </BlockWrapper>
      );

    case "STEPS_PROCESS":
      return (
        <BlockWrapper fields={content}>
          <StepsProcessBlock
            block={block}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            headingColor={headingColor}
            bodyColor={bodyColor}
            onCtaClick={onCtaClick}
          />
        </BlockWrapper>
      );

    case "TABLE":
      return (
        <BlockWrapper fields={content}>
          <TableBlock
            block={block}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            headingColor={headingColor}
            bodyColor={bodyColor}
            onCtaClick={onCtaClick}
          />
        </BlockWrapper>
      );

    case "BLOG_FEED": {
      const staticPosts = content?.staticPosts;
      const useStaticWhenEmpty = content?.useStaticWhenEmpty !== false;
      const hasStaticPosts =
        Array.isArray(staticPosts) &&
        staticPosts.length > 0 &&
        useStaticWhenEmpty;

      return (
        <BlockWrapper fields={content}>
          <Suspense
            fallback={
              <Box sx={{ py: 8 }}>
                <Container maxWidth="lg">
                  <Typography variant="body2" color="text.secondary">
                    Loading blog feed…
                  </Typography>
                </Container>
              </Box>
            }
          >
            {hasStaticPosts ? (
              <BlogFeedStaticRenderer
                posts={staticPosts}
                columns={content?.staticPostColumns || "3"}
                showCategory={content?.showCategory !== false}
                showDate={content?.showDate !== false}
                showReadTime={content?.showReadTime !== false}
                showExcerpt={content?.showExcerpt !== false}
                heading={content?.heading}
                subheading={content?.subheading}
                primaryColor={primaryColor}
                headingColor={headingColor}
                bodyColor={bodyColor}
              />
            ) : (
              <BlogFeedBlock
                block={block}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                headingColor={headingColor}
                bodyColor={bodyColor}
                onCtaClick={onCtaClick}
                websiteId={websiteId}
              />
            )}
          </Suspense>
        </BlockWrapper>
      );
    }

    case "BLOG_HERO":
      return (
        <BlockWrapper fields={content}>
          <Suspense fallback={<Box sx={{ minHeight: 480, bgcolor: "#020303" }} />}>
            <BlogHeroBlock block={block} primaryColor={primaryColor} />
          </Suspense>
        </BlockWrapper>
      );

    case "BLOG_FEATURED":
      return (
        <BlockWrapper fields={content}>
          <Suspense
            fallback={
              <Box sx={{ py: 8, bgcolor: "#f7f5f3" }}>
                <Container maxWidth="lg">
                  <Typography variant="body2" color="text.secondary">
                    Loading featured article…
                  </Typography>
                </Container>
              </Box>
            }
          >
            <BlogFeaturedBlock
              block={block}
              websiteId={websiteId}
              primaryColor={primaryColor}
              onCtaClick={onCtaClick}
            />
          </Suspense>
        </BlockWrapper>
      );

    case "BLOG_GRID":
      return (
        <BlockWrapper fields={content}>
          <Suspense
            fallback={
              <Box sx={{ py: 8, bgcolor: "#f7f5f3" }}>
                <Container maxWidth="lg">
                  <Typography variant="body2" color="text.secondary">
                    Loading articles…
                  </Typography>
                </Container>
              </Box>
            }
          >
            <BlogGridBlock
              block={block}
              websiteId={websiteId}
              primaryColor={primaryColor}
              onCtaClick={onCtaClick}
            />
          </Suspense>
        </BlockWrapper>
      );

    case "BLOG_ARTICLE":
      return (
        <BlockWrapper fields={content}>
          <Suspense
            fallback={
              <Box sx={{ py: 8 }}>
                <Container maxWidth="lg">
                  <Typography variant="body2" color="text.secondary">
                    Loading article…
                  </Typography>
                </Container>
              </Box>
            }
          >
            <BlogArticleBlock
              block={block}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              headingColor={headingColor}
              bodyColor={bodyColor}
              onCtaClick={onCtaClick}
              websiteId={websiteId}
            />
          </Suspense>
        </BlockWrapper>
      );

    case "PRODUCT_SHOWCASE":
      return (
        <BlockWrapper fields={content}>
          <Suspense
            fallback={
              <Box sx={{ py: 8 }}>
                <Container maxWidth="lg">
                  <Typography variant="body2" color="text.secondary">
                    Loading products…
                  </Typography>
                </Container>
              </Box>
            }
          >
            <ProductShowcaseBlock
              block={block}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              headingColor={headingColor}
              bodyColor={bodyColor}
              onCtaClick={onCtaClick}
            />
          </Suspense>
        </BlockWrapper>
      );

    case "DIRECTORY_LISTING":
      return (
        <BlockWrapper fields={content}>
          <Suspense
            fallback={
              <Box sx={{ py: 8 }}>
                <Container maxWidth="lg">
                  <Typography variant="body2" color="text.secondary">
                    Loading directory…
                  </Typography>
                </Container>
              </Box>
            }
          >
            <DirectoryListingBlock
              block={block}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              headingColor={headingColor}
              bodyColor={bodyColor}
              onCtaClick={onCtaClick}
            />
          </Suspense>
        </BlockWrapper>
      );

    case "SOCIAL_EMBED":
      return (
        <BlockWrapper fields={content}>
          <Suspense
            fallback={
              <Box sx={{ py: 8 }}>
                <Container maxWidth="lg">
                  <Typography variant="body2" color="text.secondary">
                    Loading social embeds…
                  </Typography>
                </Container>
              </Box>
            }
          >
            <SocialEmbedBlock
              block={block}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              headingColor={headingColor}
              bodyColor={bodyColor}
              onCtaClick={onCtaClick}
            />
          </Suspense>
        </BlockWrapper>
      );

    case "CUSTOM_CODE":
      return (
        <Suspense fallback={null}>
          <CustomCodeBlock block={block} />
        </Suspense>
      );

    case "EMBED":
      return (
        <BlockWrapper fields={content}>
          <Suspense
            fallback={
              <Box sx={{ py: 8 }}>
                <Container maxWidth="lg">
                  <Typography variant="body2" color="text.secondary">
                    Loading embed…
                  </Typography>
                </Container>
              </Box>
            }
          >
            <EmbedBlock
              block={block}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              headingColor={headingColor}
              bodyColor={bodyColor}
              onCtaClick={onCtaClick}
            />
          </Suspense>
        </BlockWrapper>
      );

    case "MENU_DISPLAY":
      return (
        <BlockWrapper fields={content}>
          <Suspense
            fallback={
              <Box sx={{ py: 8 }}>
                <Container maxWidth="lg">
                  <Typography variant="body2" color="text.secondary">
                    Loading menu…
                  </Typography>
                </Container>
              </Box>
            }
          >
            <MenuDisplayBlock
              block={block}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              headingColor={headingColor}
              bodyColor={bodyColor}
              onCtaClick={onCtaClick}
            />
          </Suspense>
        </BlockWrapper>
      );

    case "EVENTS_LIST":
      return (
        <BlockWrapper fields={content}>
          <Suspense
            fallback={
              <Box sx={{ py: 8 }}>
                <Container maxWidth="lg">
                  <Typography variant="body2" color="text.secondary">
                    Loading events…
                  </Typography>
                </Container>
              </Box>
            }
          >
            <EventsListBlock
              block={block}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              headingColor={headingColor}
              bodyColor={bodyColor}
              onCtaClick={onCtaClick}
            />
          </Suspense>
        </BlockWrapper>
      );

    case "LOCATION":
    case "MAP_LOCATION":
      return (
        <BlockWrapper fields={content}>
          <Suspense
            fallback={
              <Box sx={{ py: 8 }}>
                <Container maxWidth="lg">
                  <Typography variant="body2" color="text.secondary">
                    Loading map…
                  </Typography>
                </Container>
              </Box>
            }
          >
            <MapLocationBlock
              block={block}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              headingColor={headingColor}
              bodyColor={bodyColor}
              onCtaClick={onCtaClick}
            />
          </Suspense>
        </BlockWrapper>
      );

    case "NEWSLETTER":
      return (
        <BlockWrapper fields={content}>
          <Suspense
            fallback={
              <Box sx={{ py: 8 }}>
                <Container maxWidth="lg">
                  <Typography variant="body2" color="text.secondary">
                    Loading newsletter…
                  </Typography>
                </Container>
              </Box>
            }
          >
            <NewsletterBlock
              block={block}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              headingColor={headingColor}
              bodyColor={bodyColor}
              onCtaClick={onCtaClick}
            />
          </Suspense>
        </BlockWrapper>
      );

    case "REVIEWS":
      return (
        <BlockWrapper fields={content}>
          <Suspense
            fallback={
              <Box sx={{ py: 8 }}>
                <Container maxWidth="lg">
                  <Typography variant="body2" color="text.secondary">
                    Loading reviews…
                  </Typography>
                </Container>
              </Box>
            }
          >
            <ReviewsBlock
              block={block}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              headingColor={headingColor}
              bodyColor={bodyColor}
              onCtaClick={onCtaClick}
            />
          </Suspense>
        </BlockWrapper>
      );

    case "IMAGE":
      return (
        <BlockWrapper fields={content}>
          <Box sx={{ textAlign: content.alignment || "center" }}>
            <Container maxWidth="lg">
              {content.heading && (
                <Typography
                  variant="h3"
                  component="h2"
                  gutterBottom
                  sx={{ fontWeight: 600, color: headingColor }}
                >
                  {content.heading}
                </Typography>
              )}
              {content.image ? (
                <Box
                  component="img"
                  src={content.image}
                  alt={content.alt || "Image"}
                  sx={{
                    maxWidth: "100%",
                    height: "auto",
                    borderRadius: 1,
                  }}
                />
              ) : (
                <Box
                  sx={{
                    py: 4,
                    bgcolor: "grey.100",
                    borderRadius: 1,
                    textAlign: "center",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    No image set
                  </Typography>
                </Box>
              )}
              {content.caption && (
                <Typography
                  variant="body2"
                  sx={{ mt: 1, color: bodyColor, fontStyle: "italic" }}
                >
                  {content.caption}
                </Typography>
              )}
            </Container>
          </Box>
        </BlockWrapper>
      );

    case "NAVBAR":
      if (content?._subType === "website_header") {
        return (
          <Suspense fallback={<Box sx={{ height: 68 }} />}>
            <WebsiteHeaderBlock
              block={{ ...block, blockType: "WEBSITE_HEADER" }}
              primaryColor={primaryColor}
              headingColor={headingColor}
              websiteId={websiteId}
              onCtaClick={onCtaClick}
            />
          </Suspense>
        );
      }
      return (
        <BlockWrapper fields={content}>
          <NavbarBlock
            block={
              block as unknown as {
                content?: Record<string, unknown>;
                [key: string]: unknown;
              }
            }
          />
        </BlockWrapper>
      );

    case "FOOTER":
      return (
        <BlockWrapper fields={content}>
          <FooterBlock content={content} />
        </BlockWrapper>
      );

    case "GALLERY":
      return (
        <GalleryBlock
          content={content}
          variant={block.variant}
          headingColor={headingColor}
        />
      );

    case "COLLAGE":
      return (
        <BlockWrapper fields={content}>
          <CollageBlock content={content} headingColor={headingColor} />
        </BlockWrapper>
      );

    case "PRICING":
      return (
        <BlockWrapper fields={content}>
          <Box sx={{ bgcolor: "grey.50" }}>
            <Container maxWidth="lg">
              {content.heading && (
                <Typography
                  variant="h3"
                  component="h2"
                  align="center"
                  gutterBottom
                  sx={{ mb: 6, fontWeight: 600, color: headingColor }}
                >
                  {content.heading}
                </Typography>
              )}
              <Grid container spacing={4} justifyContent="center">
                {content.plans?.map(
                  (
                    plan: {
                      name: string;
                      price: string;
                      features: string[];
                      ctaText?: string;
                      ctaLink?: string;
                      highlighted?: boolean;
                    },
                    idx: number,
                  ) => (
                    <Grid item xs={12} sm={6} md={4} key={idx}>
                      <Card
                        elevation={plan.highlighted ? 8 : 2}
                        sx={{
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          border: plan.highlighted
                            ? `2px solid ${primaryColor}`
                            : "none",
                          position: "relative",
                          overflow: "visible",
                        }}
                      >
                        {plan.highlighted && (
                          <Box
                            sx={{
                              position: "absolute",
                              top: -12,
                              left: "50%",
                              transform: "translateX(-50%)",
                              bgcolor: primaryColor,
                              color: "white",
                              px: 2,
                              py: 0.5,
                              borderRadius: 1,
                              fontSize: "0.75rem",
                              fontWeight: 700,
                            }}
                          >
                            Popular
                          </Box>
                        )}
                        <CardContent
                          sx={{
                            p: 4,
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          <Typography
                            variant="h5"
                            sx={{ fontWeight: 700, mb: 1, color: headingColor }}
                          >
                            {plan.name}
                          </Typography>
                          <Typography
                            variant="h4"
                            sx={{ fontWeight: 700, mb: 3, color: primaryColor }}
                          >
                            {plan.price}
                          </Typography>
                          <Box sx={{ flex: 1, mb: 3 }}>
                            {plan.features?.map((f: string, fIdx: number) => (
                              <Typography
                                key={fIdx}
                                variant="body2"
                                sx={{ py: 0.5, color: bodyColor }}
                              >
                                {f}
                              </Typography>
                            ))}
                          </Box>
                          {plan.ctaText && (
                            <Button
                              variant={
                                plan.highlighted ? "contained" : "outlined"
                              }
                              fullWidth
                              onClick={() =>
                                handleCtaClick(
                                  plan.ctaLink || "#",
                                  plan.ctaText,
                                )
                              }
                              sx={
                                plan.highlighted
                                  ? { bgcolor: primaryColor }
                                  : {
                                      borderColor: primaryColor,
                                      color: primaryColor,
                                    }
                              }
                            >
                              {plan.ctaText}
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ),
                )}
              </Grid>
            </Container>
          </Box>
        </BlockWrapper>
      );

    case "FAQ":
      return (
        <BlockWrapper fields={content}>
          <Box>
            <Container maxWidth="md">
              {content.heading && (
                <Typography
                  variant="h3"
                  component="h2"
                  align="center"
                  gutterBottom
                  sx={{ mb: 6, fontWeight: 600, color: headingColor }}
                >
                  {content.heading}
                </Typography>
              )}
              {content.items?.map(
                (item: { question: string; answer: string }, idx: number) => (
                  <Box
                    key={idx}
                    sx={{
                      mb: 3,
                      pb: 3,
                      borderBottom: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 600, mb: 1, color: headingColor }}
                    >
                      {item.question}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ color: bodyColor, lineHeight: 1.8 }}
                    >
                      {item.answer}
                    </Typography>
                  </Box>
                ),
              )}
            </Container>
          </Box>
        </BlockWrapper>
      );

    case "STATS":
      return (
        <BlockWrapper fields={content}>
          <Box sx={{ bgcolor: primaryColor, color: "white" }}>
            <Container maxWidth="lg">
              {content.heading && (
                <Typography
                  variant="h3"
                  component="h2"
                  align="center"
                  gutterBottom
                  sx={{ mb: 6, fontWeight: 700, color: "white" }}
                >
                  {content.heading}
                </Typography>
              )}
              <Grid container spacing={4} justifyContent="center">
                {content.stats?.map(
                  (
                    stat: {
                      number: string;
                      label: string;
                      prefix?: string;
                      suffix?: string;
                    },
                    idx: number,
                  ) => (
                    <StatItem
                      key={idx}
                      stat={stat}
                      animateNumbers={content.animateNumbers}
                      animationNumberDuration={content.animationNumberDuration}
                    />
                  ),
                )}
              </Grid>
            </Container>
          </Box>
        </BlockWrapper>
      );

    case "TEAM":
      return (
        <BlockWrapper fields={content}>
          <Box sx={{ bgcolor: "background.default" }}>
            <Container maxWidth="lg">
              {content.heading && (
                <Typography
                  variant="h3"
                  component="h2"
                  align="center"
                  gutterBottom
                  sx={{ mb: 6, fontWeight: 600, color: headingColor }}
                >
                  {content.heading}
                </Typography>
              )}
              <Grid container spacing={4} justifyContent="center">
                {content.members?.map(
                  (
                    member: {
                      name: string;
                      role: string;
                      bio?: string;
                      avatar?: string;
                    },
                    idx: number,
                  ) => (
                    <Grid item xs={12} sm={6} md={4} key={idx}>
                      <Card elevation={2} sx={{ textAlign: "center", p: 3 }}>
                        <Avatar
                          src={member.avatar || undefined}
                          sx={{
                            width: 80,
                            height: 80,
                            mx: "auto",
                            mb: 2,
                            bgcolor: primaryColor,
                            fontSize: "2rem",
                          }}
                        >
                          {!member.avatar && member.name?.[0]}
                        </Avatar>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 600, color: headingColor }}
                        >
                          {member.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: primaryColor, mb: 1 }}
                        >
                          {member.role}
                        </Typography>
                        {member.bio && (
                          <Typography variant="body2" sx={{ color: bodyColor }}>
                            {member.bio}
                          </Typography>
                        )}
                      </Card>
                    </Grid>
                  ),
                )}
              </Grid>
            </Container>
          </Box>
        </BlockWrapper>
      );

    case "VIDEO":
      return (
        <BlockWrapper fields={content}>
          <Box>
            <Container
              maxWidth={
                content.maxWidth === "small"
                  ? "sm"
                  : content.maxWidth === "medium"
                    ? "md"
                    : "lg"
              }
            >
              {content.heading && (
                <Typography
                  variant="h3"
                  component="h2"
                  align="center"
                  gutterBottom
                  sx={{ mb: 4, fontWeight: 600, color: headingColor }}
                >
                  {content.heading}
                </Typography>
              )}
              {content.videoUrl ? (
                <Box
                  sx={{
                    position: "relative",
                    paddingTop:
                      content.aspectRatio === "4:3"
                        ? "75%"
                        : content.aspectRatio === "1:1"
                          ? "100%"
                          : "56.25%",
                    overflow: "hidden",
                    borderRadius: 1,
                  }}
                >
                  {content.videoUrl.includes("youtube") ||
                  content.videoUrl.includes("vimeo") ? (
                    <Box
                      component="iframe"
                      src={content.videoUrl}
                      title={content.heading || "Video"}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        border: 0,
                      }}
                    />
                  ) : (
                    <Box
                      component="video"
                      src={content.videoUrl}
                      controls={content.showControls !== false}
                      autoPlay={content.autoplay || false}
                      muted={content.muted !== false}
                      loop={content.loop || false}
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  )}
                </Box>
              ) : (
                <Box
                  sx={{
                    py: 8,
                    bgcolor: "grey.100",
                    borderRadius: 1,
                    textAlign: "center",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    No video URL set
                  </Typography>
                </Box>
              )}
              {content.caption && (
                <Typography
                  variant="body2"
                  sx={{
                    mt: 1,
                    textAlign: "center",
                    color: bodyColor,
                    fontStyle: "italic",
                  }}
                >
                  {content.caption}
                </Typography>
              )}
            </Container>
          </Box>
        </BlockWrapper>
      );

    case "PORTFOLIO_GRID":
      return (
        <BlockWrapper fields={content}>
          <PortfolioGridBlock
            block={block}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            headingColor={headingColor}
            bodyColor={bodyColor}
            onCtaClick={onCtaClick}
          />
        </BlockWrapper>
      );

    case "WORKING_HOURS":
      return (
        <BlockWrapper fields={content}>
          <WorkingHoursBlock
            block={block}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            headingColor={headingColor}
            bodyColor={bodyColor}
            onCtaClick={onCtaClick}
          />
        </BlockWrapper>
      );

    case "STORY_PANEL":
      return (
        <BlockWrapper fields={content}>
          <StoryPanelBlock
            content={content}
            primaryColor={primaryColor}
            headingColor={headingColor}
            bodyColor={bodyColor}
          />
        </BlockWrapper>
      );

    case "RESERVATION_FORM":
      return (
        <BlockWrapper fields={content}>
          <ReservationFormBlock
            block={block}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            headingColor={headingColor}
            bodyColor={bodyColor}
            onFormSubmit={onFormSubmit}
          />
        </BlockWrapper>
      );

    case "MARQUEE":
      return (
        <BlockWrapper fields={content}>
          <MarqueeBlock
            block={block}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            headingColor={headingColor}
            bodyColor={bodyColor}
            onCtaClick={onCtaClick}
          />
        </BlockWrapper>
      );

    case "IMAGE_TEXT_SPLIT":
      return (
        <BlockWrapper fields={content}>
          <ImageTextSplitBlock
            content={content}
            primaryColor={primaryColor}
            headingColor={headingColor}
            bodyColor={bodyColor}
            onCtaClick={
              onCtaClick
                ? (link: string) => onCtaClick("IMAGE_TEXT_SPLIT", link)
                : undefined
            }
          />
        </BlockWrapper>
      );

    case "DECORATIVE":
      return (
        <BlockWrapper fields={content}>
          <DecorativeBlock content={content} />
        </BlockWrapper>
      );

    default:
      return (
        <Box sx={{ py: 4, bgcolor: "warning.light" }}>
          <Container>
            <Typography variant="body2">
              Unknown block type: {blockType}
            </Typography>
          </Container>
        </Box>
      );
  }
};

export default BlockRenderer;
