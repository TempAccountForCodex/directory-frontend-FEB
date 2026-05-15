/**
 * SocialEmbedBlock — Step 2.29B.1
 *
 * Renders social media embeds for YouTube, Instagram, Twitter, Facebook, TikTok.
 * - Platform-specific URL parsing with regex per platform
 * - YouTube: iframe with embed URL, sandbox attrs, loading=lazy
 * - Twitter/TikTok: blockquote placeholder with link to original
 * - Instagram/Facebook: placeholder card with link to original
 * - SSR: anchor links with platform name text (no iframes/scripts)
 * - Lazy loading via react-intersection-observer useInView
 * - Responsive: grid/masonry collapse to single column on mobile
 * - Framer Motion entrance animation with whileInView
 */

import React, { memo, useMemo } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Alert,
} from "@mui/material";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

// ── Types ──────────────────────────────────────────────────────────────────────

type Platform = "youtube" | "instagram" | "twitter" | "facebook" | "tiktok";

interface EmbedItem {
  platform?: Platform;
  url?: string;
  caption?: string;
}

interface SocialEmbedContent {
  heading?: string;
  embeds?: EmbedItem[];
  layout?: "single" | "grid" | "masonry";
  columns?: 1 | 2 | 3;
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
  content: SocialEmbedContent;
  sortOrder: number;
}

interface SocialEmbedBlockProps {
  block: Block;
  primaryColor?: string;
  secondaryColor?: string;
  headingColor?: string;
  bodyColor?: string;
  onCtaClick?: (blockType: string, ctaText: string) => void;
}

// ── Platform URL validation ────────────────────────────────────────────────────

const PLATFORM_PATTERNS: Record<Platform, RegExp[]> = {
  youtube: [
    /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/,
    /^https?:\/\/(www\.)?youtube\.com\/embed\/[\w-]+/,
    /^https?:\/\/youtu\.be\/[\w-]+/,
    /^https?:\/\/(www\.)?youtube\.com\/shorts\/[\w-]+/,
  ],
  instagram: [/^https?:\/\/(www\.)?instagram\.com\/(p|reel|tv)\/[\w-]+/],
  twitter: [/^https?:\/\/(www\.)?(twitter|x)\.com\/\w+\/status\/\d+/],
  facebook: [
    /^https?:\/\/(www\.)?facebook\.com\/(watch\/\?v=\d+|.*\/posts\/.*|.*\/videos\/.*)/,
    /^https?:\/\/(www\.)?fb\.watch\//,
  ],
  tiktok: [
    /^https?:\/\/(www\.)?tiktok\.com\/@[\w.]+\/video\/\d+/,
    /^https?:\/\/vm\.tiktok\.com\/[\w]+/,
  ],
};

/**
 * Validates that a URL matches the expected platform's pattern.
 * Returns false if url is empty or doesn't match any pattern for the platform.
 */
function isValidPlatformUrl(platform: Platform, url: string): boolean {
  if (!url || url.trim() === "") return false;
  const patterns = PLATFORM_PATTERNS[platform];
  if (!patterns) return false;
  return patterns.some((pattern) => pattern.test(url.trim()));
}

/**
 * Converts a YouTube watch URL to an embed URL.
 * e.g. https://www.youtube.com/watch?v=abc123 → https://www.youtube-nocookie.com/embed/abc123
 */
function getYouTubeEmbedUrl(url: string): string | null {
  // Extract video ID from various YouTube URL formats
  const patterns = [
    /[?&]v=([\w-]{11})/,
    /youtu\.be\/([\w-]{11})/,
    /\/embed\/([\w-]{11})/,
    /\/shorts\/([\w-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return `https://www.youtube-nocookie.com/embed/${match[1]}`;
    }
  }
  return null;
}

/**
 * Get human-readable platform label.
 */
function getPlatformLabel(platform: Platform): string {
  const labels: Record<Platform, string> = {
    youtube: "YouTube",
    instagram: "Instagram",
    twitter: "Twitter",
    facebook: "Facebook",
    tiktok: "TikTok",
  };
  return labels[platform] || platform;
}

// ── Spacing map ────────────────────────────────────────────────────────────────

const SPACING_MAP: Record<string, number> = {
  none: 0,
  sm: 2,
  md: 6,
  lg: 10,
  xl: 14,
};

// ── Single embed renderers ─────────────────────────────────────────────────────

const isSSR = typeof window === "undefined";

interface EmbedRendererProps {
  embed: EmbedItem;
  primaryColor: string;
}

const EmbedRenderer: React.FC<EmbedRendererProps> = memo(
  ({ embed, primaryColor }) => {
    const { platform = "youtube", url = "", caption } = embed;

    // SSR: render anchor link only
    if (isSSR) {
      return (
        <Box
          component="a"
          href={url || "#"}
          target="_blank"
          rel="noopener noreferrer"
        >
          {getPlatformLabel(platform)}
          {caption ? `: ${caption}` : ""}
        </Box>
      );
    }

    if (!url || url.trim() === "") {
      return (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          No URL provided for this {getPlatformLabel(platform)} embed.
        </Alert>
      );
    }

    if (!isValidPlatformUrl(platform, url)) {
      return (
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          Invalid {getPlatformLabel(platform)} URL. Please check the URL format.
        </Alert>
      );
    }

    // YouTube: render iframe with embed URL
    if (platform === "youtube") {
      const embedUrl = getYouTubeEmbedUrl(url);
      if (!embedUrl) {
        return (
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            Could not extract YouTube video ID from URL.
          </Alert>
        );
      }

      return (
        <Box sx={{ width: "100%" }}>
          <Box
            sx={{
              position: "relative",
              width: "100%",
              paddingTop: "56.25%", // 16:9 aspect ratio
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <Box
              component="iframe"
              src={embedUrl}
              title={caption || "YouTube video"}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                border: 0,
                borderRadius: 2,
              }}
            />
          </Box>
          {caption && (
            <Typography
              variant="caption"
              sx={{
                mt: 1,
                display: "block",
                color: "text.secondary",
                textAlign: "center",
              }}
            >
              {caption}
            </Typography>
          )}
        </Box>
      );
    }

    // Twitter / X: blockquote placeholder with link
    if (platform === "twitter") {
      return (
        <Card
          variant="outlined"
          sx={{ borderRadius: 2, borderColor: "#1DA1F2" }}
        >
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Chip
                label="Twitter / X"
                size="small"
                sx={{ bgcolor: "#1DA1F2", color: "white", fontWeight: 600 }}
              />
            </Box>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
              Tweet embedded from Twitter/X. JavaScript must be enabled to view
              the full tweet.
            </Typography>
            {caption && (
              <Typography variant="body2" sx={{ fontStyle: "italic", mb: 1 }}>
                {caption}
              </Typography>
            )}
            <Box
              component="a"
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: primaryColor,
                fontSize: "0.85rem",
                textDecoration: "none",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              View on Twitter →
            </Box>
          </CardContent>
        </Card>
      );
    }

    // TikTok: blockquote placeholder with link
    if (platform === "tiktok") {
      return (
        <Card
          variant="outlined"
          sx={{ borderRadius: 2, borderColor: "#010101" }}
        >
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Chip
                label="TikTok"
                size="small"
                sx={{ bgcolor: "#010101", color: "white", fontWeight: 600 }}
              />
            </Box>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
              TikTok video embedded. JavaScript must be enabled to view this
              content.
            </Typography>
            {caption && (
              <Typography variant="body2" sx={{ fontStyle: "italic", mb: 1 }}>
                {caption}
              </Typography>
            )}
            <Box
              component="a"
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: primaryColor,
                fontSize: "0.85rem",
                textDecoration: "none",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              View on TikTok →
            </Box>
          </CardContent>
        </Card>
      );
    }

    // Instagram: placeholder card with link
    if (platform === "instagram") {
      return (
        <Card
          variant="outlined"
          sx={{ borderRadius: 2, borderColor: "#E1306C" }}
        >
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Chip
                label="Instagram"
                size="small"
                sx={{ bgcolor: "#E1306C", color: "white", fontWeight: 600 }}
              />
            </Box>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
              Instagram post. Click the link below to view on Instagram.
            </Typography>
            {caption && (
              <Typography variant="body2" sx={{ fontStyle: "italic", mb: 1 }}>
                {caption}
              </Typography>
            )}
            <Box
              component="a"
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: primaryColor,
                fontSize: "0.85rem",
                textDecoration: "none",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              View on Instagram →
            </Box>
          </CardContent>
        </Card>
      );
    }

    // Facebook: placeholder card with link
    if (platform === "facebook") {
      return (
        <Card
          variant="outlined"
          sx={{ borderRadius: 2, borderColor: "#1877F2" }}
        >
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Chip
                label="Facebook"
                size="small"
                sx={{ bgcolor: "#1877F2", color: "white", fontWeight: 600 }}
              />
            </Box>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
              Facebook post. Click the link below to view on Facebook.
            </Typography>
            {caption && (
              <Typography variant="body2" sx={{ fontStyle: "italic", mb: 1 }}>
                {caption}
              </Typography>
            )}
            <Box
              component="a"
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: primaryColor,
                fontSize: "0.85rem",
                textDecoration: "none",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              View on Facebook →
            </Box>
          </CardContent>
        </Card>
      );
    }

    // Fallback
    return <Alert severity="warning">Unknown platform: {platform}</Alert>;
  },
);

EmbedRenderer.displayName = "EmbedRenderer";

// ── Lazy embed wrapper ─────────────────────────────────────────────────────────

const LazyEmbedWrapper: React.FC<EmbedRendererProps> = memo(
  ({ embed, primaryColor }) => {
    const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

    return (
      <Box ref={ref}>
        {inView ? (
          <EmbedRenderer embed={embed} primaryColor={primaryColor} />
        ) : (
          <Box
            sx={{
              width: "100%",
              minHeight: 200,
              bgcolor: "grey.100",
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Loading embed…
            </Typography>
          </Box>
        )}
      </Box>
    );
  },
);

LazyEmbedWrapper.displayName = "LazyEmbedWrapper";

// ── Main component ─────────────────────────────────────────────────────────────

const SocialEmbedBlock: React.FC<SocialEmbedBlockProps> = ({
  block,
  primaryColor = "#2563eb",
  headingColor = "#1e293b",
  bodyColor = "#475569",
}) => {
  const content = block.content || {};
  const {
    heading,
    embeds = [],
    layout = "single",
    columns = 2,
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

  // Determine grid columns — always single column on mobile
  const gridColumns = useMemo(() => {
    if (layout === "single") return 1;
    return Math.min(Math.max(columns, 1), 3);
  }, [layout, columns]);

  const mdColumns = layout === "single" ? 12 : Math.floor(12 / gridColumns);

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

        {embeds.length === 0 ? (
          <Alert severity="info">No embeds configured.</Alert>
        ) : (
          <Grid container spacing={3}>
            {embeds.map((embed, index) => (
              <Grid item xs={12} md={mdColumns} key={`embed-${index}`}>
                <LazyEmbedWrapper embed={embed} primaryColor={primaryColor} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

SocialEmbedBlock.displayName = "SocialEmbedBlock";

export default memo(SocialEmbedBlock);

// Export validation helpers for testing
export { isValidPlatformUrl, getYouTubeEmbedUrl };
