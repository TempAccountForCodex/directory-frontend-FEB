/**
 * ImageTextSplitBlock — Step 10.7 + 14.8
 *
 * Two-column zigzag layout block: image on one side, text + optional CTA on the other.
 * Image position (left/right) is controlled by content.imagePosition.
 * On mobile, both columns stack vertically with image on top.
 *
 * Step 14.8 adds 'overlap' variant: image extends 40px into the text column via
 * negative margin + box shadow + slide-in animation. Mobile degrades to normal stacking.
 */

import React, { useRef, memo } from "react";
import { Box, Container, Typography, Grid, Button } from "@mui/material";
import { motion } from "framer-motion";
import { BlockWrapper } from "../BlockWrapper";
import DOMPurify from "dompurify";
import { useScrollParallax, type ParallaxIntensity } from "../hooks";

// ── Types ──────────────────────────────────────────────────────────────────────

interface ImageTextSplitBlockProps {
  content: {
    heading?: string;
    body?: string;
    image?: string;
    imageAlt?: string;
    imagePosition?: "left" | "right";
    ctaText?: string;
    ctaLink?: string;
    variant?: string;
    /** Step 15.6: scroll-driven parallax intensity on the image column */
    parallaxIntensity?: ParallaxIntensity;
  };
  primaryColor?: string;
  headingColor?: string;
  bodyColor?: string;
  onCtaClick?: (link: string) => void;
}

// ── Main component ─────────────────────────────────────────────────────────────

const ImageTextSplitBlock: React.FC<ImageTextSplitBlockProps> = memo(
  ({
    content,
    primaryColor = "#2563eb",
    headingColor = "#1e293b",
    bodyColor = "#475569",
    onCtaClick,
  }) => {
    const imagePosition = content.imagePosition ?? "left";
    const variant = content.variant ?? "default";
    const isOverlap = variant === "overlap";
    const sanitizedBody = DOMPurify.sanitize(content.body || "");

    // ── Step 15.6: Scroll-driven parallax on the image ────────────────────────────
    const imageRef = useRef<HTMLElement>(null);
    const { y: parallaxY, enabled: parallaxEnabled } = useScrollParallax(
      imageRef,
      content.parallaxIntensity ?? "none",
    );

    // Column order logic:
    // imagePosition='left'  → image order: xs=1 md=1, text order: xs=2 md=2
    // imagePosition='right' → image order: xs=1 md=2, text order: xs=2 md=1
    // On mobile (xs) image always comes first (order 1).
    const imageOrder = { xs: 1, md: imagePosition === "left" ? 1 : 2 };
    const textOrder = { xs: 2, md: imagePosition === "left" ? 2 : 1 };

    const handleCtaClick = () => {
      if (onCtaClick && content.ctaLink) {
        onCtaClick(content.ctaLink);
      }
    };

    // Overlap variant styles
    const overlapImageSx = isOverlap
      ? {
          marginRight: imagePosition === "left" ? { xs: 0, md: "-40px" } : 0,
          marginLeft: imagePosition === "right" ? { xs: 0, md: "-40px" } : 0,
          zIndex: 1,
          boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
          position: "relative" as const,
        }
      : {};

    const overlapTextSx = isOverlap
      ? {
          paddingLeft: imagePosition === "left" ? { xs: 0, md: "56px" } : 0,
          paddingRight: imagePosition === "right" ? { xs: 0, md: "56px" } : 0,
        }
      : {};

    // Slide-in direction for overlap animation
    const slideX = imagePosition === "left" ? -60 : 60;

    const imageElement = content.image ? (
      <Box
        component="img"
        src={content.image}
        alt={content.imageAlt || ""}
        sx={{
          width: "100%",
          height: "auto",
          borderRadius: 2,
          objectFit: "cover",
          display: "block",
          ...overlapImageSx,
        }}
      />
    ) : (
      <Box
        sx={{
          width: "100%",
          height: 320,
          borderRadius: 2,
          bgcolor: "grey.200",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          ...overlapImageSx,
        }}
        data-testid="image-placeholder"
      >
        <Typography variant="body2" color="text.secondary">
          No image provided
        </Typography>
      </Box>
    );

    // Step 15.6: Wrap image in parallax motion container when enabled
    const parallaxWrappedImage = parallaxEnabled ? (
      <motion.div data-testid="parallax-image-wrapper" style={{ y: parallaxY }}>
        {imageElement}
      </motion.div>
    ) : (
      imageElement
    );

    return (
      <BlockWrapper
        fields={
          content as unknown as import("../BlockWrapper").BlockWrapperFields
        }
      >
        <Box sx={{ bgcolor: "background.default" }}>
          <Container maxWidth="lg">
            <Grid container spacing={6} alignItems="center">
              {/* Image column */}
              <Grid
                item
                xs={12}
                md={6}
                ref={imageRef as React.RefObject<HTMLDivElement>}
                sx={{
                  order: imageOrder,
                  overflow: parallaxEnabled ? "hidden" : undefined,
                }}
                data-testid="image-column"
              >
                {isOverlap ? (
                  <motion.div
                    initial={{ x: slideX, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                  >
                    {parallaxWrappedImage}
                  </motion.div>
                ) : (
                  parallaxWrappedImage
                )}
              </Grid>

              {/* Text column */}
              <Grid
                item
                xs={12}
                md={6}
                sx={{ order: textOrder, ...overlapTextSx }}
                data-testid="text-column"
              >
                <Typography
                  variant="h3"
                  component="h2"
                  gutterBottom
                  sx={{ fontWeight: 700, color: headingColor }}
                >
                  {content.heading || "Why Choose Us"}
                </Typography>

                {sanitizedBody && (
                  <Typography
                    component="div"
                    variant="body1"
                    sx={{ color: bodyColor, mb: content.ctaText ? 4 : 0 }}
                    dangerouslySetInnerHTML={{ __html: sanitizedBody }}
                  />
                )}

                {content.ctaText && (
                  <Button
                    variant="contained"
                    href={onCtaClick ? undefined : content.ctaLink || "#"}
                    onClick={onCtaClick ? handleCtaClick : undefined}
                    sx={{
                      mt: sanitizedBody ? 0 : 2,
                      bgcolor: primaryColor,
                      color: "#ffffff",
                      "&:hover": {
                        bgcolor: primaryColor,
                        filter: "brightness(0.9)",
                      },
                    }}
                  >
                    {content.ctaText}
                  </Button>
                )}
              </Grid>
            </Grid>
          </Container>
        </Box>
      </BlockWrapper>
    );
  },
);

ImageTextSplitBlock.displayName = "ImageTextSplitBlock";

export default ImageTextSplitBlock;
