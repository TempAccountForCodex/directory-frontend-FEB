/**
 * MarqueeBlock — Infinite scrolling text or logo marquee banner
 * Step 11.1
 *
 * Pattern: follows LogoCarouselBlock.tsx — MUI keyframes, duplicate array,
 * animationPlayState paused on hover, maskImage fade edges.
 * Supports both text items (string[]) and logo items ({imageUrl, altText}[]).
 */

import React, { useState, memo } from "react";
import { Box, Container, Typography } from "@mui/material";
import { keyframes } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

// ── Types ──────────────────────────────────────────────────────────────────────

interface LogoItem {
  imageUrl: string;
  altText: string;
}

type MarqueeItem = string | LogoItem;

interface MarqueeContent {
  heading?: string;
  items?: MarqueeItem[];
  speed?: "slow" | "medium" | "fast";
  direction?: "left" | "right";
  pauseOnHover?: boolean;
  separator?: string;
  // Standard styling fields
  spacingPaddingTop?: string;
  spacingPaddingBottom?: string;
  spacingMarginTop?: string;
  spacingMarginBottom?: string;
  backgroundType?: string;
  backgroundColor?: string;
  backgroundGradientStart?: string;
  backgroundGradientEnd?: string;
  backgroundGradientDirection?: string;
  backgroundImage?: string;
  backgroundOverlayEnabled?: boolean;
  backgroundOverlayColor?: string;
  backgroundOverlayOpacity?: number;
  effectsShadow?: string;
  effectsBorderWidth?: string;
  effectsBorderColor?: string;
  effectsBorderRadius?: string;
  animationEntranceType?: string;
  animationDuration?: number;
  animationDelay?: number;
  animationScrollTriggered?: boolean;
  responsiveHideOnMobile?: boolean;
  responsiveHideOnTablet?: boolean;
  responsiveHideOnDesktop?: boolean;
}

interface Block {
  id: number;
  blockType: string;
  content: MarqueeContent;
  sortOrder: number;
}

interface MarqueeBlockProps {
  block: Block;
  primaryColor?: string;
  secondaryColor?: string;
  headingColor?: string;
  bodyColor?: string;
  onCtaClick?: (blockType: string, ctaText: string) => void;
}

// ── Speed mapping ──────────────────────────────────────────────────────────────

const SPEED_MAP: Record<string, string> = {
  slow: "40s",
  medium: "28s",
  fast: "16s",
};

// ── Spacing map ────────────────────────────────────────────────────────────────

const SPACING_MAP: Record<string, number> = {
  none: 0,
  sm: 2,
  md: 6,
  lg: 10,
  xl: 14,
};

// ── CSS Keyframes ──────────────────────────────────────────────────────────────

const scrollLoop = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
`;

const scrollLoopReverse = keyframes`
  0% { transform: translateX(-50%); }
  100% { transform: translateX(0); }
`;

// ── Helper: detect variant from items ─────────────────────────────────────────

function isLogoItem(item: MarqueeItem): item is LogoItem {
  return typeof item === "object" && item !== null && "imageUrl" in item;
}

function detectVariant(items: MarqueeItem[]): "text" | "logos" {
  if (items.length === 0) return "text";
  return isLogoItem(items[0]) ? "logos" : "text";
}

// ── MarqueeTrack — the animated scrolling row ─────────────────────────────────

interface MarqueeTrackProps {
  items: MarqueeItem[];
  duration: string;
  direction: "left" | "right";
  pauseOnHover: boolean;
  separator: string;
  variant: "text" | "logos";
  isVisible: boolean;
  primaryColor: string;
  bodyColor: string;
}

const MarqueeTrack: React.FC<MarqueeTrackProps> = ({
  items,
  duration,
  direction,
  pauseOnHover,
  separator,
  variant,
  isVisible,
  primaryColor,
  bodyColor,
}) => {
  const [hovered, setHovered] = useState(false);

  // Duplicate array for seamless infinite loop
  const doubled = [...items, ...items];

  const chosenKeyframe = direction === "right" ? scrollLoopReverse : scrollLoop;

  // Use inline style for animationPlayState so tests can inspect it via element.style
  // MUI sx animationPlayState is compiled into a CSS class which is not inspectable via element.style
  const trackStyle: React.CSSProperties = {
    animationPlayState: hovered ? "paused" : "running",
  };

  return (
    <Box
      sx={{
        overflow: "hidden",
        maskImage:
          "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
      }}
    >
      <Box
        component="div"
        data-testid="marquee-track"
        data-direction={direction}
        data-duration={duration}
        style={trackStyle}
        onMouseEnter={() => pauseOnHover && setHovered(true)}
        onMouseLeave={() => pauseOnHover && setHovered(false)}
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: variant === "logos" ? 6 : 0,
          width: "max-content",
          animation: isVisible
            ? `${chosenKeyframe} ${duration} linear infinite`
            : "none",
        }}
      >
        {doubled.map((item, i) => {
          if (variant === "logos" && isLogoItem(item)) {
            return (
              <Box
                key={`logo-${i}`}
                component="img"
                src={item.imageUrl}
                alt={item.altText}
                loading="lazy"
                sx={{
                  height: 48,
                  maxWidth: 120,
                  objectFit: "contain",
                  userSelect: "none",
                  flexShrink: 0,
                }}
              />
            );
          }

          // Text variant
          const text = typeof item === "string" ? item : "";
          const isLast = i === doubled.length - 1;
          return (
            <React.Fragment key={`text-${i}`}>
              <Typography
                component="span"
                sx={{
                  color: bodyColor,
                  fontWeight: 500,
                  fontSize: { xs: "0.95rem", md: "1rem" },
                  whiteSpace: "nowrap",
                  px: 1,
                  userSelect: "none",
                }}
              >
                {text}
              </Typography>
              {!isLast && separator && (
                <Typography
                  component="span"
                  aria-hidden="true"
                  sx={{
                    color: primaryColor,
                    fontWeight: 700,
                    mx: 1,
                    userSelect: "none",
                    flexShrink: 0,
                  }}
                >
                  {separator}
                </Typography>
              )}
            </React.Fragment>
          );
        })}
      </Box>
    </Box>
  );
};

// ── Main component ─────────────────────────────────────────────────────────────

const MarqueeBlock: React.FC<MarqueeBlockProps> = ({
  block,
  primaryColor = "#2563eb",
  headingColor = "#1e293b",
  bodyColor = "#334155",
}) => {
  const content = block.content || {};
  const {
    heading,
    items = [],
    speed = "medium",
    direction = "left",
    pauseOnHover = true,
    separator = "•",
    spacingPaddingTop = "md",
    spacingPaddingBottom = "md",
    responsiveHideOnMobile = false,
    responsiveHideOnTablet = false,
    responsiveHideOnDesktop = false,
  } = content;

  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  const duration = SPEED_MAP[speed] || SPEED_MAP.medium;
  const pt = SPACING_MAP[spacingPaddingTop] ?? 6;
  const pb = SPACING_MAP[spacingPaddingBottom] ?? 6;

  const variant = detectVariant(items);

  // SSR fallback: static display (no animation)
  const isSSR = typeof window === "undefined";

  // Empty state
  if (items.length === 0) {
    return (
      <Box
        data-testid="marquee-empty"
        sx={{
          py: { xs: 4, md: 6 },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Add items to display in the marquee.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      ref={ref}
      component={motion.div}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.5 }}
      sx={{
        py: { xs: pt / 2 + 2, md: pt },
        pb: { xs: pb / 2 + 2, md: pb },
        overflow: "hidden",
        display: {
          xs: responsiveHideOnMobile ? "none" : "block",
          sm: responsiveHideOnTablet ? "none" : "block",
          lg: responsiveHideOnDesktop ? "none" : "block",
        },
      }}
    >
      <Container maxWidth="lg">
        {heading && (
          <Typography
            variant="h4"
            component="h2"
            align="center"
            sx={{
              fontWeight: 600,
              mb: 4,
              color: headingColor,
            }}
          >
            {heading}
          </Typography>
        )}

        {isSSR ? (
          // SSR: static layout — no animation
          <Box
            data-testid="marquee-ssr"
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {items.map((item, i) => {
              if (isLogoItem(item)) {
                return (
                  <Box
                    key={i}
                    component="img"
                    src={item.imageUrl}
                    alt={item.altText}
                    sx={{ height: 48, maxWidth: 120, objectFit: "contain" }}
                  />
                );
              }
              return (
                <Typography
                  key={i}
                  component="span"
                  sx={{ color: bodyColor, whiteSpace: "nowrap" }}
                >
                  {item as string}
                </Typography>
              );
            })}
          </Box>
        ) : (
          <MarqueeTrack
            items={items}
            duration={duration}
            direction={direction}
            pauseOnHover={pauseOnHover}
            separator={separator}
            variant={variant}
            isVisible={inView}
            primaryColor={primaryColor}
            bodyColor={bodyColor}
          />
        )}
      </Container>
    </Box>
  );
};

MarqueeBlock.displayName = "MarqueeBlock";

export default memo(MarqueeBlock);
