/**
 * BeforeAfterBlock — Step 2.29A.5
 *
 * Renders a Before/After image comparison slider block.
 * - CSS clip-path based slider — NO external library
 * - Pointer events for mouse + touch drag
 * - Supports horizontal and vertical orientations
 * - Multiple pairs in responsive grid
 * - SSR: both images side by side with labels
 * - Framer Motion entrance animation with useInView
 */

import React, { memo, useRef, useState, useCallback, useEffect } from "react";
import { Box, Container, Typography, Grid } from "@mui/material";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BeforeAfterPair {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  caption?: string;
}

interface BeforeAfterContent {
  heading?: string;
  pairs?: BeforeAfterPair[];
  orientation?: "horizontal" | "vertical";
  sliderColor?: string;
  startPosition?: number;
  // Standard styling fields
  spacingPaddingTop?: string;
  spacingPaddingBottom?: string;
  spacingMarginTop?: string;
  spacingMarginBottom?: string;
  backgroundType?: string;
  backgroundColor?: string;
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
  content: BeforeAfterContent;
  sortOrder: number;
}

interface BeforeAfterBlockProps {
  block: Block;
  primaryColor?: string;
  secondaryColor?: string;
  headingColor?: string;
  bodyColor?: string;
  onCtaClick?: (blockType: string, ctaText: string) => void;
}

// ---------------------------------------------------------------------------
// Single comparison pair component
// ---------------------------------------------------------------------------

interface ComparisonPairProps {
  pair: BeforeAfterPair;
  orientation: "horizontal" | "vertical";
  sliderColor: string;
  startPosition: number;
  primaryColor: string;
}

const ComparisonPair = memo(function ComparisonPair({
  pair,
  orientation,
  sliderColor,
  startPosition,
  primaryColor,
}: ComparisonPairProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<number>(startPosition);
  const isDragging = useRef<boolean>(false);

  const isHorizontal = orientation !== "vertical";

  /**
   * Compute slider position (0–100) from pointer coordinates
   * relative to the container bounding box.
   */
  const computePosition = useCallback(
    (clientX: number, clientY: number): number => {
      const container = containerRef.current;
      if (!container) return position;
      const rect = container.getBoundingClientRect();
      if (isHorizontal) {
        const relX = clientX - rect.left;
        return Math.min(100, Math.max(0, (relX / rect.width) * 100));
      } else {
        const relY = clientY - rect.top;
        return Math.min(100, Math.max(0, (relY / rect.height) * 100));
      }
    },
    [isHorizontal, position],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      isDragging.current = true;
      const el = e.currentTarget as HTMLElement;
      el.setPointerCapture(e.pointerId);
      setPosition(computePosition(e.clientX, e.clientY));
    },
    [computePosition],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging.current) return;
      setPosition(computePosition(e.clientX, e.clientY));
    },
    [computePosition],
  );

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  // Clip path for the "after" layer (revealed portion)
  const clipPath = isHorizontal
    ? `inset(0 ${100 - position}% 0 0)`
    : `inset(0 0 ${100 - position}% 0)`;

  // Slider line position
  const sliderStyle = isHorizontal
    ? {
        position: "absolute" as const,
        top: 0,
        bottom: 0,
        left: `${position}%`,
        transform: "translateX(-50%)",
        width: "3px",
        background: sliderColor,
        cursor: "col-resize",
        zIndex: 10,
      }
    : {
        position: "absolute" as const,
        left: 0,
        right: 0,
        top: `${position}%`,
        transform: "translateY(-50%)",
        height: "3px",
        background: sliderColor,
        cursor: "row-resize",
        zIndex: 10,
      };

  const handleStyle = isHorizontal
    ? {
        position: "absolute" as const,
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        background: sliderColor,
        border: `3px solid ${primaryColor}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
        cursor: "grab",
        userSelect: "none" as const,
      }
    : {
        position: "absolute" as const,
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%) rotate(90deg)",
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        background: sliderColor,
        border: `3px solid ${primaryColor}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
        cursor: "ns-resize",
        userSelect: "none" as const,
      };

  return (
    <Box>
      {/* Comparison container */}
      <Box
        ref={containerRef}
        data-testid="slider-container"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        sx={{
          position: "relative",
          overflow: "hidden",
          borderRadius: "8px",
          cursor: isHorizontal ? "col-resize" : "row-resize",
          userSelect: "none",
          // Aspect ratio
          aspectRatio: "16/9",
          touchAction: "none",
        }}
      >
        {/* Before image — full size, background */}
        <Box
          component="img"
          src={pair.beforeImage}
          alt={pair.beforeLabel || "Before"}
          loading="lazy"
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            pointerEvents: "none",
            userSelect: "none",
          }}
        />

        {/* After image — revealed by clip-path */}
        <Box
          component="img"
          src={pair.afterImage}
          alt={pair.afterLabel || "After"}
          loading="lazy"
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            clipPath,
            pointerEvents: "none",
            userSelect: "none",
          }}
        />

        {/* Before label */}
        {pair.beforeLabel && (
          <Box
            sx={{
              position: "absolute",
              top: 12,
              left: 12,
              px: 1.5,
              py: 0.5,
              bgcolor: "rgba(0,0,0,0.5)",
              borderRadius: "4px",
              pointerEvents: "none",
              zIndex: 5,
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: "#fff", fontWeight: 600 }}
            >
              {pair.beforeLabel}
            </Typography>
          </Box>
        )}

        {/* After label */}
        {pair.afterLabel && (
          <Box
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              px: 1.5,
              py: 0.5,
              bgcolor: "rgba(0,0,0,0.5)",
              borderRadius: "4px",
              pointerEvents: "none",
              zIndex: 5,
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: "#fff", fontWeight: 600 }}
            >
              {pair.afterLabel}
            </Typography>
          </Box>
        )}

        {/* Slider line */}
        <Box data-testid="slider-line" sx={sliderStyle}>
          {/* Handle */}
          <Box data-testid="slider-handle" sx={handleStyle}>
            <CompareArrowsIcon
              sx={{ fontSize: 20, color: primaryColor, pointerEvents: "none" }}
            />
          </Box>
        </Box>
      </Box>

      {/* Caption */}
      {pair.caption && (
        <Typography
          variant="caption"
          sx={{
            display: "block",
            textAlign: "center",
            mt: 1,
            color: "text.secondary",
            fontStyle: "italic",
          }}
        >
          {pair.caption}
        </Typography>
      )}
    </Box>
  );
});

// ---------------------------------------------------------------------------
// Main exported component
// ---------------------------------------------------------------------------

const BeforeAfterBlock = memo(function BeforeAfterBlock({
  block,
  primaryColor = "#2563eb",
  headingColor = "#1e293b",
}: BeforeAfterBlockProps) {
  const { content } = block;
  const pairs = content.pairs ?? [];
  const orientation = content.orientation ?? "horizontal";
  const sliderColor = content.sliderColor ?? "#ffffff";
  const startPosition = content.startPosition ?? 50;

  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  const animationVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: (content.animationDuration ?? 500) / 1000,
        delay: (content.animationDelay ?? 0) / 1000,
        ease: "easeOut",
      },
    },
  };

  return (
    <Box
      component={motion.div as any}
      ref={ref}
      variants={animationVariants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      sx={{ py: 6 }}
    >
      <Container maxWidth="lg">
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

        <Grid container spacing={3}>
          {pairs.map((pair, index) => (
            <Grid
              item
              xs={12}
              md={pairs.length === 1 ? 12 : pairs.length === 2 ? 6 : 4}
              key={index}
            >
              <ComparisonPair
                pair={pair}
                orientation={orientation}
                sliderColor={sliderColor}
                startPosition={startPosition}
                primaryColor={primaryColor}
              />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
});

BeforeAfterBlock.displayName = "BeforeAfterBlock";

export default BeforeAfterBlock;
