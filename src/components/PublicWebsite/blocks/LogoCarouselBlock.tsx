/**
 * LogoCarouselBlock - Infinite scrolling logo carousel
 * Step 2.29A.3
 *
 * Pattern: follows TestimonialSlider.tsx — MUI keyframes, duplicate array,
 * animationPlayState paused on hover, maskImage fade edges.
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
  linkUrl?: string;
}

interface LogoCarouselContent {
  heading?: string;
  logos?: LogoItem[];
  speed?: "slow" | "medium" | "fast";
  pauseOnHover?: boolean;
  grayscale?: boolean;
  rows?: number;
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
  content: LogoCarouselContent;
  sortOrder: number;
}

interface LogoCarouselBlockProps {
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

// ── CSS Keyframes ──────────────────────────────────────────────────────────────

const scrollLoop = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
`;

// ── Spacing map ────────────────────────────────────────────────────────────────

const SPACING_MAP: Record<string, number> = {
  none: 0,
  sm: 2,
  md: 6,
  lg: 10,
  xl: 14,
};

// ── Placeholder logo slot ──────────────────────────────────────────────────────

const PlaceholderLogo: React.FC<{ primaryColor: string }> = ({
  primaryColor,
}) => (
  <Box
    sx={{
      width: 100,
      height: 48,
      borderRadius: 1,
      bgcolor: "grey.200",
      border: `1px dashed ${primaryColor}44`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <Typography variant="caption" color="text.disabled">
      Logo
    </Typography>
  </Box>
);

// ── Logo image component ───────────────────────────────────────────────────────

interface LogoImgProps {
  logo: LogoItem;
  grayscale: boolean;
  primaryColor: string;
}

const LogoImg: React.FC<LogoImgProps> = ({ logo, grayscale, primaryColor }) => {
  const img = (
    <Box
      component="img"
      src={logo.imageUrl}
      alt={logo.altText}
      loading="lazy"
      sx={{
        height: 48,
        maxWidth: 120,
        objectFit: "contain",
        filter: grayscale ? "grayscale(1)" : "none",
        opacity: grayscale ? 0.6 : 1,
        transition: "filter 0.3s ease, opacity 0.3s ease",
        "&:hover": {
          filter: "grayscale(0)",
          opacity: 1,
        },
        userSelect: "none",
        flexShrink: 0,
      }}
    />
  );

  if (logo.linkUrl) {
    return (
      <a
        href={logo.linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: "inline-flex", alignItems: "center" }}
      >
        {img}
      </a>
    );
  }

  return <>{img}</>;
};

// ── Single carousel row ────────────────────────────────────────────────────────

interface CarouselRowProps {
  logos: LogoItem[];
  duration: string;
  pauseOnHover: boolean;
  grayscale: boolean;
  primaryColor: string;
  isVisible: boolean;
}

const CarouselRow: React.FC<CarouselRowProps> = ({
  logos,
  duration,
  pauseOnHover,
  grayscale,
  primaryColor,
  isVisible,
}) => {
  const [hovered, setHovered] = useState(false);

  // Duplicate array for seamless infinite loop
  const doubled = [...logos, ...logos];

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
        onMouseEnter={() => pauseOnHover && setHovered(true)}
        onMouseLeave={() => pauseOnHover && setHovered(false)}
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          width: "max-content",
          animation: isVisible
            ? `${scrollLoop} ${duration} linear infinite`
            : "none",
          animationPlayState: hovered ? "paused" : "running",
        }}
      >
        {doubled.map((logo, i) => (
          <LogoImg
            key={`${logo.imageUrl}-${i}`}
            logo={logo}
            grayscale={grayscale}
            primaryColor={primaryColor}
          />
        ))}
      </Box>
    </Box>
  );
};

// ── Main component ─────────────────────────────────────────────────────────────

const LogoCarouselBlock: React.FC<LogoCarouselBlockProps> = ({
  block,
  primaryColor = "#2563eb",
  headingColor = "#1e293b",
}) => {
  const content = block.content || {};
  const {
    heading,
    logos = [],
    speed = "medium",
    pauseOnHover = true,
    grayscale = true,
    rows = 1,
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

  // Provide placeholder logos if none are set
  const effectiveLogos: LogoItem[] =
    logos.length > 0
      ? logos
      : [
          { imageUrl: "", altText: "Logo 1", linkUrl: "" },
          { imageUrl: "", altText: "Logo 2", linkUrl: "" },
          { imageUrl: "", altText: "Logo 3", linkUrl: "" },
          { imageUrl: "", altText: "Logo 4", linkUrl: "" },
          { imageUrl: "", altText: "Logo 5", linkUrl: "" },
          { imageUrl: "", altText: "Logo 6", linkUrl: "" },
        ];

  // SSR fallback: static grid (no animation)
  const isSSR = typeof window === "undefined";

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
          // SSR: static grid of logos
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 4,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {effectiveLogos.map((logo, i) =>
              logo.imageUrl ? (
                <LogoImg
                  key={i}
                  logo={logo}
                  grayscale={grayscale}
                  primaryColor={primaryColor}
                />
              ) : (
                <PlaceholderLogo key={i} primaryColor={primaryColor} />
              ),
            )}
          </Box>
        ) : (
          // Animated carousel rows
          <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {Array.from({ length: Math.max(1, rows || 1) }).map(
              (_, rowIndex) => {
                // Split logos across rows if rows > 1
                const rowLogos =
                  rows > 1
                    ? effectiveLogos.filter((_, idx) => idx % rows === rowIndex)
                    : effectiveLogos;

                const activeLogos =
                  rowLogos.length > 0 ? rowLogos : effectiveLogos;

                return (
                  <CarouselRow
                    key={rowIndex}
                    logos={activeLogos}
                    duration={duration}
                    pauseOnHover={pauseOnHover}
                    grayscale={grayscale}
                    primaryColor={primaryColor}
                    isVisible={inView}
                  />
                );
              },
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
};

LogoCarouselBlock.displayName = "LogoCarouselBlock";

export default memo(LogoCarouselBlock);
