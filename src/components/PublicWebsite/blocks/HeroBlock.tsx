/**
 * HeroBlock — Step 17.4 Carousel Variant
 *
 * Renders the HERO block in 6 variants:
 *   - centered    (default): gradient bg, text centered
 *   - left:       gradient bg, text left-aligned
 *   - full-bleed: 80vh, background image/overlay, centered text
 *   - split:      two-column grid — text left, hero image right
 *   - dual-image: CSS Grid 1.15fr/0.85fr — left image has gradient overlay + text
 *                 positioned bottom-left, right image is plain cover, mobile shows
 *                 only primary image
 *   - carousel:   multi-slide hero with auto-rotation, dot indicators, fade/slide
 *                 transitions, keyboard navigation, prefers-reduced-motion support
 */

import React, { useCallback, useEffect, useRef, useState, memo } from "react";
import { Box, Container, Typography, Button, Grid } from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { BlockWrapper } from "../BlockWrapper";
import {
  resolveHeadingTypographySx,
  resolveSubheadingTypographySx,
  resolveGradientTextSx,
  resolveTextStrokeSx,
} from "../utils/headingTypography";
import { useScrollParallax } from "../hooks";
import {
  useBlockAnimation,
  type TextRevealConfig,
} from "../hooks/useBlockAnimation";

// ── Types ──────────────────────────────────────────────────────────────────────

interface StatusBadgeData {
  text?: string;
  color?: string;
  animation?: "none" | "pulse" | "glow";
}

interface HeroBlockProps {
  content: any;
  variant?: string;
  primaryColor?: string;
  secondaryColor?: string;
  headingColor?: string;
  bodyColor?: string;
  onCtaClick?: (blockType: string, ctaText: string) => void;
}

// ── StatusBadge ───────────────────────────────────────────────────────────────

const statusBadgeKeyframes = `
@keyframes statusPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
@keyframes statusGlow {
  0%, 100% { box-shadow: 0 0 4px 1px currentColor; }
  50% { box-shadow: 0 0 10px 4px currentColor; }
}
`;

const StatusBadge: React.FC<{
  badge: StatusBadgeData;
  align?: "left" | "center";
}> = memo(({ badge, align = "left" }) => {
  if (!badge?.text) return null;

  const dotColor = badge.color || "#22c55e";
  const anim = badge.animation || "none";

  const dotAnimationSx: Record<string, any> =
    anim === "pulse"
      ? { animation: "statusPulse 2s ease-in-out infinite" }
      : anim === "glow"
        ? { animation: "statusGlow 2s ease-in-out infinite", color: dotColor }
        : {};

  return (
    <>
      <style>{statusBadgeKeyframes}</style>
      <Box
        data-testid="status-badge"
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 1,
          mb: 1.5,
          ...(align === "center"
            ? { justifyContent: "center", width: "100%" }
            : {}),
        }}
      >
        <Box
          data-testid="status-badge-dot"
          data-animation={anim}
          sx={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            backgroundColor: dotColor,
            flexShrink: 0,
            ...dotAnimationSx,
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
          {badge.text}
        </Typography>
      </Box>
    </>
  );
});

StatusBadge.displayName = "StatusBadge";

// ── Helpers ────────────────────────────────────────────────────────────────────

const isInternalLink = (url: string): boolean => {
  if (!url) return false;
  if (url.startsWith("/")) return true;
  if (url.startsWith("#")) return true;
  if (url.startsWith("http://") || url.startsWith("https://")) return false;
  return true;
};

// ── Height & Font Size Maps ────────────────────────────────────────────────────

const HERO_MIN_HEIGHT: Record<string, string> = {
  auto: "auto",
  small: "40vh",
  medium: "60vh",
  large: "80vh",
  full: "100vh",
};

export const resolveHeroMinHeight = (
  value: string | undefined,
  fallback: string,
): string => HERO_MIN_HEIGHT[value ?? ""] ?? fallback;

const HEADING_FONT_SIZE: Record<string, object> = {
  default: { xs: "2.5rem", md: "3.5rem" },
  large: { xs: "3rem", md: "4rem" },
  xl: { xs: "3rem", md: "4rem", lg: "5.5rem" },
  display: { xs: "3rem", md: "4.5rem", lg: "6rem", xl: "7.5rem" },
};

const HEADING_EXTRA_SX: Record<string, object> = {
  display: {
    lineHeight: 0.85,
    letterSpacing: "-0.04em",
    textTransform: "uppercase" as const,
  },
};

export const resolveHeadingFontSizeSx = (
  value: string | undefined,
  content?: any,
): object => {
  if (value === "custom" && content) {
    const fontSize: Record<string, string> = {};
    if (content.customFontSizeXs) fontSize.xs = content.customFontSizeXs;
    if (content.customFontSizeSm) fontSize.sm = content.customFontSizeSm;
    if (content.customFontSizeMd) fontSize.md = content.customFontSizeMd;
    if (content.customFontSizeLg) fontSize.lg = content.customFontSizeLg;
    return {
      fontSize:
        Object.keys(fontSize).length > 0 ? fontSize : HEADING_FONT_SIZE.default,
      ...(content.customLineHeight != null
        ? { lineHeight: content.customLineHeight }
        : {}),
      ...(content.customLetterSpacing
        ? { letterSpacing: content.customLetterSpacing }
        : {}),
    };
  }
  return {
    fontSize: HEADING_FONT_SIZE[value ?? ""] ?? HEADING_FONT_SIZE.default,
    ...(HEADING_EXTRA_SX[value ?? ""] ?? {}),
  };
};

const SUBHEADING_MAX_WIDTH: Record<string, string | undefined> = {
  narrow: "480px",
  medium: "640px",
  wide: "800px",
  full: undefined,
};

export const resolveSubheadingMaxWidth = (
  value: string | undefined,
): string | undefined =>
  value === "full"
    ? undefined
    : (SUBHEADING_MAX_WIDTH[value ?? ""] ?? SUBHEADING_MAX_WIDTH.medium);

// ── Carousel Sub-Component ────────────────────────────────────────────────────

interface SlideData {
  heading?: string;
  subheading?: string;
  image?: string;
  ctaText?: string;
  ctaLink?: string;
}

interface HeroCarouselProps {
  slides: SlideData[];
  isSingleSlide: boolean;
  autoRotate: boolean;
  slideInterval: number;
  showIndicators: boolean;
  transition: "fade" | "slide";
  minHeight: string;
  primaryColor: string;
  headingFontSizeSx: object;
  headingTypoSx: object;
  gradientTextSx: object;
  textStrokeSx: object;
  subheadingTypoSx: object;
  subheadingMaxW: string | undefined;
  headingOpacity?: number;
  onCtaClick: (url: string, ctaText?: string) => void;
  content: any;
}

const sanitizeSlideUrl = (url: string | undefined): string => {
  if (!url) return "";
  if (/^(https?:)?\/\//i.test(url) || !/^[a-z][a-z0-9+\-.]*:/i.test(url)) {
    return url.replace(/[()'"\\]/g, "");
  }
  return "";
};

const HeroCarousel: React.FC<HeroCarouselProps> = memo(
  ({
    slides,
    isSingleSlide,
    autoRotate,
    slideInterval,
    showIndicators,
    transition,
    minHeight,
    primaryColor,
    headingFontSizeSx,
    headingTypoSx,
    gradientTextSx,
    textStrokeSx,
    subheadingTypoSx,
    subheadingMaxW,
    headingOpacity,
    onCtaClick,
    content,
  }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const isPaused = useRef(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const autoRotateRef = useRef(autoRotate);
    autoRotateRef.current = autoRotate;

    const interval = Math.min(15000, Math.max(2000, slideInterval));

    // Check prefers-reduced-motion
    const prefersReducedMotion = useRef(
      typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
    );

    const goToSlide = useCallback(
      (index: number) => {
        setActiveIndex(index);
        // After manual navigation, pause auto-rotate briefly then restart
        if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
        isPaused.current = true;
        restartTimerRef.current = setTimeout(() => {
          isPaused.current = false;
        }, interval * 2);
      },
      [interval],
    );

    const goNext = useCallback(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, [slides.length]);

    const goPrev = useCallback(() => {
      setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
    }, [slides.length]);

    // Auto-rotation
    useEffect(() => {
      if (isSingleSlide || !autoRotate || prefersReducedMotion.current) return;
      const timer = setInterval(() => {
        if (isPaused.current) return;
        setActiveIndex((prev) => (prev + 1) % slides.length);
      }, interval);
      return () => clearInterval(timer);
    }, [autoRotate, interval, slides.length, isSingleSlide]);

    // Cleanup restart timer
    useEffect(() => {
      return () => {
        if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      };
    }, []);

    const handleMouseEnter = useCallback(() => {
      isPaused.current = true;
    }, []);
    const handleMouseLeave = useCallback(() => {
      isPaused.current = false;
    }, []);

    // Keyboard navigation
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          goPrev();
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          goNext();
        }
      },
      [goPrev, goNext],
    );

    const transitionDuration = prefersReducedMotion.current ? "0s" : "0.6s";

    return (
      <BlockWrapper fields={content}>
        <Box
          ref={containerRef}
          data-testid="hero-carousel"
          tabIndex={0}
          role="region"
          aria-roledescription="carousel"
          aria-label="Hero carousel"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onKeyDown={handleKeyDown}
          sx={{
            position: "relative",
            minHeight,
            overflow: "hidden",
            outline: "none",
            "&:focus-visible": {
              outline: `2px solid ${primaryColor}`,
              outlineOffset: -2,
            },
          }}
        >
          {/* Slides */}
          {transition === "fade" ? (
            // Fade transition: all slides stacked, opacity toggles
            slides.map((slide, index) => {
              const bgUrl = sanitizeSlideUrl(slide.image);
              const isActive = index === activeIndex;
              return (
                <Box
                  key={index}
                  data-testid={`carousel-slide-${index}`}
                  aria-hidden={!isActive}
                  sx={{
                    position: index === 0 ? "relative" : "absolute",
                    inset: index === 0 ? undefined : 0,
                    minHeight: index === 0 ? minHeight : undefined,
                    height: index === 0 ? undefined : "100%",
                    width: "100%",
                    opacity: isActive ? 1 : 0,
                    transition: `opacity ${transitionDuration} ease`,
                    pointerEvents: isActive ? "auto" : "none",
                    display: "flex",
                    alignItems: "center",
                    backgroundImage: bgUrl ? `url(${bgUrl})` : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundColor: bgUrl ? undefined : primaryColor,
                  }}
                >
                  {/* Dark overlay */}
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      bgcolor: "rgba(0,0,0,0.5)",
                    }}
                  />
                  <Container
                    maxWidth="lg"
                    sx={{ position: "relative", zIndex: 1 }}
                  >
                    <Typography
                      variant="h2"
                      component={isActive ? "h1" : "div"}
                      gutterBottom
                      sx={{
                        fontWeight: 700,
                        ...headingFontSizeSx,
                        color: "white",
                        textAlign: "center",
                        ...headingTypoSx,
                        ...gradientTextSx,
                        ...textStrokeSx,
                      }}
                    >
                      {slide.heading || "Welcome"}
                    </Typography>
                    {slide.subheading && (
                      <Typography
                        variant="h5"
                        sx={{
                          mb: 4,
                          color: "white",
                          textAlign: "center",
                          maxWidth: subheadingMaxW,
                          mx: "auto",
                          ...subheadingTypoSx,
                          opacity: 0.9 * ((headingOpacity ?? 100) / 100),
                        }}
                      >
                        {slide.subheading}
                      </Typography>
                    )}
                    {slide.ctaText && (
                      <Box sx={{ textAlign: "center" }}>
                        <Button
                          variant="contained"
                          size="large"
                          tabIndex={isActive ? 0 : -1}
                          onClick={() =>
                            onCtaClick(slide.ctaLink || "#", slide.ctaText)
                          }
                          sx={{
                            bgcolor: "white",
                            color: primaryColor,
                            px: 4,
                            py: 1.5,
                            fontSize: "1.1rem",
                            cursor: "pointer",
                            "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
                          }}
                        >
                          {slide.ctaText}
                        </Button>
                      </Box>
                    )}
                  </Container>
                </Box>
              );
            })
          ) : (
            // Slide transition: translateX-based horizontal movement
            <Box
              sx={{
                display: "flex",
                width: `${slides.length * 100}%`,
                transform: `translateX(-${(activeIndex * 100) / slides.length}%)`,
                transition: prefersReducedMotion.current
                  ? "none"
                  : `transform ${transitionDuration} ease`,
              }}
            >
              {slides.map((slide, index) => {
                const bgUrl = sanitizeSlideUrl(slide.image);
                const isActive = index === activeIndex;
                return (
                  <Box
                    key={index}
                    data-testid={`carousel-slide-${index}`}
                    aria-hidden={!isActive}
                    sx={{
                      width: `${100 / slides.length}%`,
                      flexShrink: 0,
                      minHeight,
                      display: "flex",
                      alignItems: "center",
                      position: "relative",
                      backgroundImage: bgUrl ? `url(${bgUrl})` : undefined,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundColor: bgUrl ? undefined : primaryColor,
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        bgcolor: "rgba(0,0,0,0.5)",
                      }}
                    />
                    <Container
                      maxWidth="lg"
                      sx={{ position: "relative", zIndex: 1 }}
                    >
                      <Typography
                        variant="h2"
                        component={isActive ? "h1" : "div"}
                        gutterBottom
                        sx={{
                          fontWeight: 700,
                          ...headingFontSizeSx,
                          color: "white",
                          textAlign: "center",
                          ...headingTypoSx,
                          ...gradientTextSx,
                          ...textStrokeSx,
                        }}
                      >
                        {slide.heading || "Welcome"}
                      </Typography>
                      {slide.subheading && (
                        <Typography
                          variant="h5"
                          sx={{
                            mb: 4,
                            color: "white",
                            textAlign: "center",
                            maxWidth: subheadingMaxW,
                            mx: "auto",
                            ...subheadingTypoSx,
                            opacity: 0.9 * ((headingOpacity ?? 100) / 100),
                          }}
                        >
                          {slide.subheading}
                        </Typography>
                      )}
                      {slide.ctaText && (
                        <Box sx={{ textAlign: "center" }}>
                          <Button
                            variant="contained"
                            size="large"
                            tabIndex={isActive ? 0 : -1}
                            onClick={() =>
                              onCtaClick(slide.ctaLink || "#", slide.ctaText)
                            }
                            sx={{
                              bgcolor: "white",
                              color: primaryColor,
                              px: 4,
                              py: 1.5,
                              fontSize: "1.1rem",
                              cursor: "pointer",
                              "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
                            }}
                          >
                            {slide.ctaText}
                          </Button>
                        </Box>
                      )}
                    </Container>
                  </Box>
                );
              })}
            </Box>
          )}

          {/* Dot indicators */}
          {showIndicators && (
            <Box
              data-testid="carousel-indicators"
              sx={{
                position: "absolute",
                bottom: 24,
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                gap: 1,
                zIndex: 2,
              }}
            >
              {slides.map((_, index) => (
                <Box
                  key={index}
                  data-testid={`carousel-dot-${index}`}
                  role="button"
                  aria-label={`Go to slide ${index + 1}`}
                  tabIndex={0}
                  onClick={() => goToSlide(index)}
                  onKeyDown={(e: React.KeyboardEvent) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      goToSlide(index);
                    }
                  }}
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    backgroundColor:
                      index === activeIndex
                        ? primaryColor
                        : "rgba(255,255,255,0.5)",
                    cursor: "pointer",
                    transition: prefersReducedMotion.current
                      ? "none"
                      : "background-color 0.3s ease",
                    "&:hover": {
                      backgroundColor:
                        index === activeIndex
                          ? primaryColor
                          : "rgba(255,255,255,0.8)",
                    },
                  }}
                />
              ))}
            </Box>
          )}
        </Box>
      </BlockWrapper>
    );
  },
);

HeroCarousel.displayName = "HeroCarousel";

// ── TextRevealHeading ────────────────────────────────────────────────────────

interface TextRevealHeadingProps {
  text: string;
  config: TextRevealConfig;
  sx?: Record<string, unknown>;
}

const TextRevealHeading: React.FC<TextRevealHeadingProps> = memo(
  ({ text, config, sx = {} }) => {
    const words = (text || "").split(/\s+/).filter(Boolean);
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced || words.length === 0) {
      return (
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 700, ...sx }}
        >
          {text}
        </Typography>
      );
    }

    return (
      <motion.div
        data-testid="text-reveal-heading"
        variants={config.parentVariants as any}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-10%" }}
        style={{ display: "flex", flexWrap: "wrap" }}
      >
        {words.map((word, i) => (
          <span
            key={i}
            style={{
              overflow: "hidden",
              display: "inline-block",
              marginRight: "0.3em",
            }}
          >
            <motion.span
              data-testid={`text-reveal-word-${i}`}
              variants={config.childVariants as any}
              style={{
                display: "inline-block",
                fontWeight: 700,
                ...(sx as any),
              }}
            >
              {word}
            </motion.span>
          </span>
        ))}
      </motion.div>
    );
  },
);

TextRevealHeading.displayName = "TextRevealHeading";

// ── Component ──────────────────────────────────────────────────────────────────

const HeroBlock: React.FC<HeroBlockProps> = memo(
  ({
    content,
    variant = "centered",
    primaryColor = "#2563eb",
    secondaryColor = "#64748b",
    headingColor = "#1e293b",
    bodyColor = "#475569",
    onCtaClick,
  }) => {
    const navigate = useNavigate();
    const basePrimaryColor =
      primaryColor.length === 9 ? primaryColor.slice(0, 7) : primaryColor;

    const handleCtaClick = useCallback(
      (url: string, ctaText?: string) => {
        if (!url || url === "#") return;

        if (onCtaClick && ctaText) {
          onCtaClick("HERO", ctaText);
        }

        if (isInternalLink(url)) {
          navigate(url);
        } else {
          window.location.href = url;
        }
      },
      [navigate, onCtaClick],
    );

    // ── Step 15.6: Scroll-driven parallax (full-bleed background image) ──────────
    const heroSectionRef = useRef<HTMLElement>(null);
    const { y: parallaxY, enabled: parallaxEnabled } = useScrollParallax(
      heroSectionRef,
      content.parallaxIntensity ?? "none",
    );

    // ── Typography field resolvers (computed once before variant branches) ─────────
    const headingTypoSx = resolveHeadingTypographySx(content);
    const subheadingTypoSx = resolveSubheadingTypographySx(content);
    const gradientTextSx = resolveGradientTextSx(content);
    const textStrokeSx = resolveTextStrokeSx(content);

    // ── Step 14.7: Height & font size control ─────────────────────────────────────
    const minHeightCentered = resolveHeroMinHeight(
      content.heroMinHeight,
      "60vh",
    );
    const minHeightFullBleed = resolveHeroMinHeight(
      content.heroMinHeight,
      "80vh",
    );
    const headingFontSizeSx = resolveHeadingFontSizeSx(
      content.headingFontSize,
      content,
    );
    const subheadingMaxW = resolveSubheadingMaxWidth(
      content.subheadingMaxWidth,
    );

    // ── Step 17.6: Text-reveal animation ──────────────────────────────────────────
    const { isTextReveal, textRevealConfig } = useBlockAnimation(content);

    // ── centered / left variants ─────────────────────────────────────────────────

    if (variant === "centered" || variant === "left") {
      const textAlign = variant === "left" ? "left" : "center";

      return (
        <BlockWrapper fields={content}>
          <Box
            data-minheight={minHeightCentered}
            sx={{
              minHeight: minHeightCentered,
              display: "flex",
              alignItems: "center",
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${basePrimaryColor}dd 100%)`,
              color: "white",
            }}
          >
            <Container maxWidth="lg">
              {content.statusBadge && (
                <StatusBadge
                  badge={content.statusBadge}
                  align={variant === "centered" ? "center" : "left"}
                />
              )}
              {isTextReveal && textRevealConfig ? (
                <TextRevealHeading
                  text={content.heading || "Welcome"}
                  config={textRevealConfig}
                  sx={{
                    ...headingFontSizeSx,
                    color: "white",
                    textAlign,
                    ...headingTypoSx,
                    ...gradientTextSx,
                    ...textStrokeSx,
                  }}
                />
              ) : (
                <Typography
                  variant="h2"
                  component="h1"
                  gutterBottom
                  sx={{
                    fontWeight: 700,
                    ...headingFontSizeSx,
                    color: "white",
                    textAlign,
                    ...headingTypoSx,
                    ...gradientTextSx,
                    ...textStrokeSx,
                  }}
                >
                  {content.heading || "Welcome"}
                </Typography>
              )}
              <Typography
                variant="h5"
                data-subheading-maxwidth={subheadingMaxW ?? "full"}
                sx={{
                  mb: 4,
                  maxWidth: subheadingMaxW,
                  color: "white",
                  textAlign,
                  mx: variant === "centered" ? "auto" : undefined,
                  ...subheadingTypoSx,
                  opacity: 0.9 * ((content.headingOpacity ?? 100) / 100),
                }}
              >
                {content.subheading || "Discover amazing content"}
              </Typography>
              {content.ctaText && (
                <Box sx={{ textAlign }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() =>
                      handleCtaClick(content.ctaLink, content.ctaText)
                    }
                    sx={{
                      bgcolor: "white",
                      color: primaryColor,
                      px: 4,
                      py: 1.5,
                      fontSize: "1.1rem",
                      cursor: "pointer",
                      "&:hover": {
                        bgcolor: "rgba(255,255,255,0.9)",
                      },
                    }}
                  >
                    {content.ctaText}
                  </Button>
                </Box>
              )}
            </Container>
          </Box>
        </BlockWrapper>
      );
    }

    // ── full-bleed variant ───────────────────────────────────────────────────────

    if (variant === "full-bleed") {
      const rawBgImage = content.heroImage || content.backgroundImage;
      // Sanitize: allow http/https/relative URLs only; reject data:/javascript: schemes;
      // strip CSS url() special chars to prevent injection.
      const bgImage = rawBgImage
        ? /^(https?:)?\/\//i.test(rawBgImage) ||
          !/^[a-z][a-z0-9+\-.]*:/i.test(rawBgImage)
          ? rawBgImage.replace(/[()'"\\]/g, "")
          : ""
        : "";

      return (
        <BlockWrapper fields={content}>
          {/* Step 15.6: ref tracked for scroll parallax; overflow:hidden clips parallax layer */}
          <Box
            ref={heroSectionRef as React.RefObject<HTMLDivElement>}
            data-bgimage={bgImage || undefined}
            data-minheight={minHeightFullBleed}
            sx={{
              minHeight: minHeightFullBleed,
              display: "flex",
              alignItems: "center",
              position: "relative",
              overflow: "hidden",
              backgroundColor: bgImage ? undefined : primaryColor,
            }}
          >
            {/* Parallax background image layer — extends ±25% beyond bounds for movement room */}
            {bgImage && (
              <motion.div
                data-testid="parallax-bg-layer"
                style={{
                  y: parallaxEnabled ? parallaxY : undefined,
                  position: "absolute",
                  top: "-25%",
                  left: 0,
                  right: 0,
                  bottom: "-25%",
                  backgroundImage: `url(${bgImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
            )}
            {/* Dark overlay */}
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                bgcolor: "rgba(0,0,0,0.5)",
              }}
            />
            <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
              {content.statusBadge && (
                <StatusBadge badge={content.statusBadge} align="center" />
              )}
              {isTextReveal && textRevealConfig ? (
                <TextRevealHeading
                  text={content.heading || "Welcome"}
                  config={textRevealConfig}
                  sx={{
                    ...headingFontSizeSx,
                    color: "white",
                    textAlign: "center",
                    ...headingTypoSx,
                    ...gradientTextSx,
                    ...textStrokeSx,
                  }}
                />
              ) : (
                <Typography
                  variant="h2"
                  component="h1"
                  gutterBottom
                  sx={{
                    fontWeight: 700,
                    ...headingFontSizeSx,
                    color: "white",
                    textAlign: "center",
                    ...headingTypoSx,
                    ...gradientTextSx,
                    ...textStrokeSx,
                  }}
                >
                  {content.heading || "Welcome"}
                </Typography>
              )}
              <Typography
                variant="h5"
                data-subheading-maxwidth={subheadingMaxW ?? "full"}
                sx={{
                  mb: 4,
                  color: "white",
                  textAlign: "center",
                  maxWidth: subheadingMaxW,
                  mx: "auto",
                  ...subheadingTypoSx,
                  opacity: 0.9 * ((content.headingOpacity ?? 100) / 100),
                }}
              >
                {content.subheading || "Discover amazing content"}
              </Typography>
              {content.ctaText && (
                <Box sx={{ textAlign: "center" }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() =>
                      handleCtaClick(content.ctaLink, content.ctaText)
                    }
                    sx={{
                      bgcolor: "white",
                      color: primaryColor,
                      px: 4,
                      py: 1.5,
                      fontSize: "1.1rem",
                      cursor: "pointer",
                      "&:hover": {
                        bgcolor: "rgba(255,255,255,0.9)",
                      },
                    }}
                  >
                    {content.ctaText}
                  </Button>
                </Box>
              )}
            </Container>
          </Box>
        </BlockWrapper>
      );
    }

    // ── dual-image variant ────────────────────────────────────────────────────────

    if (variant === "dual-image") {
      const rawPrimary = content.heroImage;
      const rawSecondary = content.heroImageSecondary;

      const sanitizeUrl = (url: string | undefined): string => {
        if (!url) return "";
        if (
          /^(https?:)?\/\//i.test(url) ||
          !/^[a-z][a-z0-9+\-.]*:/i.test(url)
        ) {
          return url.replace(/[()'"\\]/g, "");
        }
        return "";
      };

      const primaryUrl = sanitizeUrl(rawPrimary);
      const secondaryUrl = sanitizeUrl(rawSecondary);

      return (
        <BlockWrapper fields={content}>
          <Box
            data-testid="dual-image-hero"
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1.15fr 0.85fr" },
              minHeight: { xs: "50vh", md: "78vh" },
              overflow: "hidden",
            }}
          >
            {/* Left cell — primary image + gradient overlay + text */}
            <Box
              data-testid="dual-image-primary"
              sx={{
                position: "relative",
                minHeight: { xs: "50vh", md: "78vh" },
                backgroundImage: primaryUrl ? `url(${primaryUrl})` : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundColor: primaryUrl ? undefined : primaryColor,
              }}
            >
              {/* Gradient overlay */}
              <Box
                data-testid="dual-image-overlay"
                sx={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(90deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.1) 100%)",
                }}
              />
              {/* Text positioned bottom-left */}
              <Box
                sx={{
                  position: "absolute",
                  bottom: { xs: 32, md: 48 },
                  left: { xs: 24, md: 48 },
                  maxWidth: "60%",
                  zIndex: 1,
                }}
              >
                {content.statusBadge && (
                  <StatusBadge badge={content.statusBadge} />
                )}
                <Typography
                  variant="h2"
                  component="h1"
                  gutterBottom
                  sx={{
                    fontWeight: 700,
                    ...headingFontSizeSx,
                    color: "#fff",
                    ...headingTypoSx,
                    ...gradientTextSx,
                    ...textStrokeSx,
                  }}
                >
                  {content.heading || "Welcome"}
                </Typography>
                {content.subheading && (
                  <Typography
                    variant="h5"
                    sx={{
                      mb: 3,
                      color: "#fff",
                      ...subheadingTypoSx,
                      opacity: 0.9 * ((content.headingOpacity ?? 100) / 100),
                    }}
                  >
                    {content.subheading}
                  </Typography>
                )}
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
                      px: 4,
                      py: 1.5,
                      fontSize: "1.1rem",
                      cursor: "pointer",
                      "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
                    }}
                  >
                    {content.ctaText}
                  </Button>
                )}
              </Box>
            </Box>

            {/* Right cell — secondary image, plain cover, hidden on mobile */}
            <Box
              data-testid="dual-image-secondary"
              sx={{
                display: { xs: "none", md: "block" },
                minHeight: { md: "78vh" },
                overflow: "hidden",
              }}
            >
              {secondaryUrl && (
                <Box
                  component="img"
                  src={secondaryUrl}
                  alt=""
                  aria-hidden="true"
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              )}
            </Box>
          </Box>
        </BlockWrapper>
      );
    }

    // ── carousel variant ─────────────────────────────────────────────────────────

    if (variant === "carousel") {
      const slides: Array<{
        heading?: string;
        subheading?: string;
        image?: string;
        ctaText?: string;
        ctaLink?: string;
      }> =
        Array.isArray(content.slides) && content.slides.length > 0
          ? content.slides
          : [];

      // Fallback: empty or missing slides → render centered variant
      if (slides.length === 0) {
        return (
          <BlockWrapper fields={content}>
            <Box
              sx={{
                minHeight: minHeightCentered,
                display: "flex",
                alignItems: "center",
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${basePrimaryColor}dd 100%)`,
                color: "white",
              }}
            >
              <Container maxWidth="lg">
                <Typography
                  variant="h2"
                  component="h1"
                  gutterBottom
                  sx={{
                    fontWeight: 700,
                    ...headingFontSizeSx,
                    color: "white",
                    textAlign: "center",
                    ...headingTypoSx,
                    ...gradientTextSx,
                    ...textStrokeSx,
                  }}
                >
                  {content.heading || "Welcome"}
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    mb: 4,
                    color: "white",
                    textAlign: "center",
                    maxWidth: subheadingMaxW,
                    mx: "auto",
                    ...subheadingTypoSx,
                    opacity: 0.9,
                  }}
                >
                  {content.subheading || "Discover amazing content"}
                </Typography>
                {content.ctaText && (
                  <Box sx={{ textAlign: "center" }}>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() =>
                        handleCtaClick(content.ctaLink, content.ctaText)
                      }
                      sx={{
                        bgcolor: "white",
                        color: primaryColor,
                        px: 4,
                        py: 1.5,
                        fontSize: "1.1rem",
                        cursor: "pointer",
                        "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
                      }}
                    >
                      {content.ctaText}
                    </Button>
                  </Box>
                )}
              </Container>
            </Box>
          </BlockWrapper>
        );
      }

      const isSingleSlide = slides.length === 1;

      return (
        <HeroCarousel
          slides={slides}
          isSingleSlide={isSingleSlide}
          autoRotate={content.autoRotateSlides ?? true}
          slideInterval={content.slideInterval ?? 5000}
          showIndicators={
            (content.showSlideIndicators ?? true) && !isSingleSlide
          }
          transition={content.slideTransition ?? "fade"}
          minHeight={minHeightFullBleed}
          primaryColor={primaryColor}
          headingFontSizeSx={headingFontSizeSx}
          headingTypoSx={headingTypoSx}
          gradientTextSx={gradientTextSx}
          textStrokeSx={textStrokeSx}
          subheadingTypoSx={subheadingTypoSx}
          subheadingMaxW={subheadingMaxW}
          headingOpacity={content.headingOpacity}
          onCtaClick={handleCtaClick}
          content={content}
        />
      );
    }

    // ── split variant ────────────────────────────────────────────────────────────

    return (
      <BlockWrapper fields={content}>
        <Box
          data-minheight={minHeightCentered}
          sx={{
            minHeight: minHeightCentered,
            display: "flex",
            alignItems: "center",
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${basePrimaryColor}dd 100%)`,
            color: "white",
          }}
        >
          <Container maxWidth="lg">
            <Grid container spacing={4} alignItems="center">
              {/* Left column — text + CTA */}
              <Grid item md={6} xs={12}>
                {content.statusBadge && (
                  <StatusBadge badge={content.statusBadge} />
                )}
                {isTextReveal && textRevealConfig ? (
                  <TextRevealHeading
                    text={content.heading || "Welcome"}
                    config={textRevealConfig}
                    sx={{
                      ...headingFontSizeSx,
                      color: "white",
                      ...headingTypoSx,
                      ...gradientTextSx,
                      ...textStrokeSx,
                    }}
                  />
                ) : (
                  <Typography
                    variant="h2"
                    component="h1"
                    gutterBottom
                    sx={{
                      fontWeight: 700,
                      ...headingFontSizeSx,
                      color: "white",
                      ...headingTypoSx,
                      ...gradientTextSx,
                      ...textStrokeSx,
                    }}
                  >
                    {content.heading || "Welcome"}
                  </Typography>
                )}
                <Typography
                  variant="h5"
                  sx={{
                    mb: 4,
                    color: "white",
                    maxWidth: subheadingMaxW,
                    ...subheadingTypoSx,
                    opacity: 0.9 * ((content.headingOpacity ?? 100) / 100),
                  }}
                >
                  {content.subheading || "Discover amazing content"}
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
                      px: 4,
                      py: 1.5,
                      fontSize: "1.1rem",
                      cursor: "pointer",
                      "&:hover": {
                        bgcolor: "rgba(255,255,255,0.9)",
                      },
                    }}
                  >
                    {content.ctaText}
                  </Button>
                )}
              </Grid>

              {/* Right column — hero image */}
              <Grid item md={6} xs={12}>
                {content.heroImage && (
                  <Box
                    component="img"
                    src={content.heroImage}
                    alt={content.heading || "Hero image"}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: 2,
                    }}
                  />
                )}
              </Grid>
            </Grid>
          </Container>
        </Box>
      </BlockWrapper>
    );
  },
);

HeroBlock.displayName = "HeroBlock";

export default HeroBlock;
