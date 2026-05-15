/**
 * EmbedBlock — Step 2.29B.2
 *
 * Generic iframe embed block for trusted platforms only.
 * - Domain allowlist security gate: only approved domains are embedded
 * - All non-allowlisted domains are rejected with an error message
 * - iframe rendered with sandbox attrs, loading=lazy, referrerPolicy
 * - Aspect ratio container with padding-top trick or custom height
 * - SSR: renders anchor link with 'Open in {platform}' text
 * - Framer Motion entrance animation
 */

import React, { memo, useMemo } from "react";
import { Box, Container, Typography, Alert } from "@mui/material";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

// ── Types ──────────────────────────────────────────────────────────────────────

type AspectRatio = "16:9" | "4:3" | "1:1" | "custom";

interface EmbedContent {
  heading?: string;
  url?: string;
  height?: number;
  aspectRatio?: AspectRatio;
  allowFullscreen?: boolean;
  lazyLoad?: boolean;
  // Standard styling fields
  spacingPaddingTop?: string;
  spacingPaddingBottom?: string;
  spacingMarginTop?: string;
  spacingMarginBottom?: string;
  backgroundType?: string;
  backgroundColor?: string;
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
  content: EmbedContent;
  sortOrder: number;
}

interface EmbedBlockProps {
  block: Block;
  primaryColor?: string;
  secondaryColor?: string;
  headingColor?: string;
  bodyColor?: string;
  onCtaClick?: (blockType: string, ctaText: string) => void;
}

// ── Domain allowlist ───────────────────────────────────────────────────────────

/**
 * Trusted domains allowed for generic iframe embedding.
 * Only these domains (and their subdomains) are permitted.
 */
const ALLOWED_DOMAINS: string[] = [
  "calendly.com",
  "docs.google.com",
  "airtable.com",
  "typeform.com",
  "figma.com",
  "canva.com",
  "loom.com",
  "miro.com",
  "notion.so",
  "codepen.io",
  "codesandbox.io",
];

/**
 * Validates that a URL's hostname matches an entry in the allowlist.
 * Supports exact match and subdomain match (e.g. embed.typeform.com matches typeform.com).
 * Returns the matched domain entry or null if not allowed.
 */
function getAllowedDomain(url: string): string | null {
  if (!url || url.trim() === "") return null;

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url.trim());
  } catch {
    return null;
  }

  // Must be https
  if (parsedUrl.protocol !== "https:") return null;

  const hostname = parsedUrl.hostname.toLowerCase();

  for (const domain of ALLOWED_DOMAINS) {
    // Exact match: calendly.com matches calendly.com
    if (hostname === domain) return domain;
    // Subdomain match: app.calendly.com matches calendly.com
    if (hostname.endsWith(`.${domain}`)) return domain;
  }

  return null;
}

/**
 * Extracts a human-readable platform name from the matched domain.
 * e.g. 'docs.google.com' → 'Google Docs'
 */
function getPlatformName(domain: string): string {
  const names: Record<string, string> = {
    "calendly.com": "Calendly",
    "docs.google.com": "Google Docs",
    "airtable.com": "Airtable",
    "typeform.com": "Typeform",
    "figma.com": "Figma",
    "canva.com": "Canva",
    "loom.com": "Loom",
    "miro.com": "Miro",
    "notion.so": "Notion",
    "codepen.io": "CodePen",
    "codesandbox.io": "CodeSandbox",
  };
  return names[domain] || domain;
}

// ── Aspect ratio padding map ───────────────────────────────────────────────────

const ASPECT_RATIO_PADDING: Record<AspectRatio, string> = {
  "16:9": "56.25%",
  "4:3": "75%",
  "1:1": "100%",
  custom: "0", // custom uses explicit height
};

// ── Spacing map ────────────────────────────────────────────────────────────────

const SPACING_MAP: Record<string, number> = {
  none: 0,
  sm: 2,
  md: 6,
  lg: 10,
  xl: 14,
};

// ── SSR check ─────────────────────────────────────────────────────────────────

const isSSR = typeof window === "undefined";

// ── Main component ─────────────────────────────────────────────────────────────

const EmbedBlock: React.FC<EmbedBlockProps> = ({
  block,
  primaryColor = "#2563eb",
  headingColor = "#1e293b",
}) => {
  const content = block.content || {};
  const {
    heading,
    url = "",
    height = 500,
    aspectRatio = "16:9",
    allowFullscreen = true,
    lazyLoad = true,
    spacingPaddingTop = "md",
    spacingPaddingBottom = "md",
    responsiveHideOnMobile = false,
    responsiveHideOnTablet = false,
    responsiveHideOnDesktop = false,
    animationDuration = 500,
    animationDelay = 0,
  } = content;

  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  const pt = SPACING_MAP[spacingPaddingTop] ?? 6;
  const pb = SPACING_MAP[spacingPaddingBottom] ?? 6;

  // Validate domain
  const allowedDomain = useMemo(() => {
    if (!url || url.trim() === "") return null;
    return getAllowedDomain(url);
  }, [url]);

  const platformName = useMemo(() => {
    if (!allowedDomain) return "";
    return getPlatformName(allowedDomain);
  }, [allowedDomain]);

  // Determine aspect ratio container style
  const isCustomAspect = aspectRatio === "custom";
  const paddingTop = isCustomAspect
    ? undefined
    : ASPECT_RATIO_PADDING[aspectRatio];

  const renderEmbed = () => {
    // Empty state
    if (!url || url.trim() === "") {
      return (
        <Box
          sx={{
            width: "100%",
            minHeight: 200,
            bgcolor: "grey.100",
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px dashed",
            borderColor: "grey.300",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Configure an embed URL in the block settings.
          </Typography>
        </Box>
      );
    }

    // SSR: render anchor link
    if (isSSR) {
      return (
        <Box>
          <Typography variant="body2">
            <Box
              component="a"
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: primaryColor }}
            >
              Open in {platformName || "external site"} →
            </Box>
          </Typography>
        </Box>
      );
    }

    // Domain not allowed
    if (!allowedDomain) {
      return (
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          Domain not allowed. Only the following platforms are supported for
          embedding: {ALLOWED_DOMAINS.join(", ")}.
        </Alert>
      );
    }

    // Render iframe
    const iframeEl = (
      <Box
        component="iframe"
        src={url}
        title={heading || `Embedded ${platformName} content`}
        loading={lazyLoad ? "lazy" : "eager"}
        referrerPolicy="no-referrer-when-downgrade"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        allowFullScreen={allowFullscreen}
        sx={
          isCustomAspect
            ? {
                width: "100%",
                height: `${height}px`,
                border: 0,
                borderRadius: 2,
                display: "block",
              }
            : {
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                border: 0,
                borderRadius: 2,
              }
        }
      />
    );

    if (isCustomAspect) {
      return iframeEl;
    }

    return (
      <Box
        sx={{
          position: "relative",
          width: "100%",
          paddingTop,
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        {iframeEl}
      </Box>
    );
  };

  return (
    <Box
      ref={ref}
      component={motion.div as any}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{
        duration: animationDuration / 1000,
        delay: animationDelay / 1000,
      }}
      sx={{
        py: { xs: pt / 2 + 2, md: pt },
        pb: { xs: pb / 2 + 2, md: pb },
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
            variant="h3"
            component="h2"
            gutterBottom
            sx={{
              fontWeight: 700,
              color: headingColor,
              mb: 4,
              textAlign: "center",
            }}
          >
            {heading}
          </Typography>
        )}

        {renderEmbed()}

        {/* SSR anchor link fallback shown below iframe for non-JS users */}
        {!isSSR && allowedDomain && url && (
          <Typography
            variant="caption"
            sx={{
              mt: 1,
              display: "block",
              textAlign: "right",
              color: "text.secondary",
            }}
          >
            Embedded from{" "}
            <Box
              component="a"
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: primaryColor }}
            >
              {platformName}
            </Box>
          </Typography>
        )}
      </Container>
    </Box>
  );
};

EmbedBlock.displayName = "EmbedBlock";

export default memo(EmbedBlock);

// Export helpers for testing
export { getAllowedDomain, getPlatformName, ALLOWED_DOMAINS };
