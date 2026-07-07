import React, { memo, useRef, useState, useCallback } from "react";
import { Box, Container, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BeforeAfterContent {
  heading?: string;
  beforeImage?: string;
  afterImage?: string;
  beforeLabel?: string;
  afterLabel?: string;
  startPosition?: number;
  animationDuration?: number;
  animationDelay?: number;
  spacingPaddingTop?: string;
  spacingPaddingBottom?: string;
  spacingMarginTop?: string;
  spacingMarginBottom?: string;
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
// Draggable comparison slider
// ---------------------------------------------------------------------------

const DEFAULT_BEFORE =
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=1200&q=80";
const DEFAULT_AFTER =
  "https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=1200&q=80";

const BeforeAfterBlock = memo(function BeforeAfterBlock({
  block,
  headingColor = "#1e293b",
}: BeforeAfterBlockProps) {
  const { content } = block;

  const beforeImage = content.beforeImage || DEFAULT_BEFORE;
  const afterImage = content.afterImage || DEFAULT_AFTER;
  const beforeLabel = content.beforeLabel ?? "Before";
  const afterLabel = content.afterLabel ?? "After";
  const startPosition = content.startPosition ?? 50;
  const pairs = Array.isArray((content as any).pairs)
    ? (content as any).pairs
    : [
        {
          beforeImage,
          afterImage,
          beforeLabel,
          afterLabel,
          caption: (content as any).caption,
        },
      ];

  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<number>(startPosition);
  const isDragging = useRef<boolean>(false);

  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  const computePosition = useCallback(
    (clientX: number): number => {
      const container = containerRef.current;
      if (!container) return position;
      const rect = container.getBoundingClientRect();
      const relX = clientX - rect.left;
      return Math.min(100, Math.max(0, (relX / rect.width) * 100));
    },
    [position],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      isDragging.current = true;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      setPosition(computePosition(e.clientX));
    },
    [computePosition],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging.current) return;
      setPosition(computePosition(e.clientX));
    },
    [computePosition],
  );

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const clipPath = `inset(0 ${100 - position}% 0 0)`;

  const animationVariants = {
    hidden: { opacity: 0, y: 30 },
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

        {/* Comparison frames for each pair */}
        <Box sx={{ display: "grid", gap: 2.5, gridTemplateColumns: pairs.length > 1 ? "repeat(2, 1fr)" : "1fr" }}>
          {pairs.map((p: any, idx: number) => {
            const bImage = p.beforeImage || DEFAULT_BEFORE;
            const aImage = p.afterImage || DEFAULT_AFTER;
            const bLabel = p.beforeLabel ?? "Before";
            const aLabel = p.afterLabel ?? "After";
            const caption = p.caption;
            return (
              <Box
                key={idx}
                ref={containerRef}
                data-testid="slider-container"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                sx={{
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: "12px",
                  cursor: "col-resize",
                  userSelect: "none",
                  aspectRatio: "16/9",
                  touchAction: "none",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.14)",
                  bgcolor: "#e2e8f0",
                }}
              >
                <Box component="img" src={bImage} alt={bLabel} loading="lazy" sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none", userSelect: "none", display: "block" }} />
                <Box component="img" src={aImage} alt={aLabel} loading="lazy" sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", clipPath, pointerEvents: "none", userSelect: "none", display: "block" }} />

                {bLabel && (
                  <Box sx={{ position: "absolute", top: 14, left: 14, px: 1.5, py: 0.5, bgcolor: "rgba(255,255,255,0.9)", borderRadius: "6px", pointerEvents: "none", zIndex: 5, backdropFilter: "blur(6px)", boxShadow: "0 1px 6px rgba(0,0,0,0.1)" }}>
                    <Typography variant="caption" sx={{ color: "#1e293b", fontWeight: 700, fontSize: "0.78rem", letterSpacing: "0.02em" }}>{bLabel}</Typography>
                  </Box>
                )}

                {aLabel && (
                  <Box sx={{ position: "absolute", top: 14, right: 14, px: 1.5, py: 0.5, bgcolor: "rgba(255,255,255,0.9)", borderRadius: "6px", pointerEvents: "none", zIndex: 5, backdropFilter: "blur(6px)", boxShadow: "0 1px 6px rgba(0,0,0,0.1)" }}>
                    <Typography variant="caption" sx={{ color: "#1e293b", fontWeight: 700, fontSize: "0.78rem", letterSpacing: "0.02em" }}>{aLabel}</Typography>
                  </Box>
                )}

                <Box data-testid="slider-line" sx={{ position: "absolute", top: 0, bottom: 0, left: `${position}%`, transform: "translateX(-50%)", width: "2px", background: "#ffffff", cursor: "col-resize", zIndex: 10, boxShadow: "0 0 10px rgba(0,0,0,0.25)" }}>
                  <Box data-testid="slider-handle" sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 44, height: 44, borderRadius: "50%", background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 14px rgba(0,0,0,0.22)", cursor: "grab", userSelect: "none" as const, "&:active": { cursor: "grabbing" } }}>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M6 4L2 9L6 14" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M12 4L16 9L12 14" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Box>
                </Box>

                {caption && (
                  <Box sx={{ position: "relative", mt: 1 }}>
                    <Typography variant="caption" sx={{ color: "#475569" }}>{caption}</Typography>
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      </Container>
    </Box>
  );
});

BeforeAfterBlock.displayName = "BeforeAfterBlock";

export default BeforeAfterBlock;
