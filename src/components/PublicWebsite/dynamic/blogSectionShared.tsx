/**
 * blogSectionShared — Shared helpers + card for the split blog page blocks.
 *
 * Powers BLOG_HERO / BLOG_FEATURED / BLOG_GRID, which reproduce the polished
 * public /blog (InsightsPage) design as independent, movable editor sections.
 * All three consume website-scoped blog data (via useDynamicBlockData with a
 * `blog` datasource) so each tenant site shows its own posts.
 */

import React, { useEffect, useRef, useState } from "react";
import { Box, Typography, Skeleton } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import type { BlogPost } from "./BlogCard";

type StaticTargetType = "container" | "text" | "media" | "icon";

export function blogStaticProps(
  blockId: string | number,
  staticId: string,
  label: string,
  type: StaticTargetType = "text",
  styleKey = `static.${staticId}`,
  contentPath?: string,
) {
  return {
    "data-static-selectable": "true",
    "data-static-id": staticId,
    "data-static-label": label,
    "data-static-type": type,
    "data-preview-target-kind": "static",
    "data-preview-section": "true",
    "data-preview-block-id": String(blockId),
    "data-preview-style-key": styleKey,
    "data-preview-label": label,
    ...(contentPath ? { "data-content-path": contentPath } : {}),
    ...(type === "container"
      ? {
          "data-container-style-id": staticId,
          "data-editor-container": "true",
          "data-parent-section": String(blockId),
        }
      : {}),
    ...(type === "media" ? { "data-fallback-media": "true" } : {}),
  };
}

/* ===================== FadeInImage ===================== */

/**
 * Blur-up image that fades/scales in on load — mirrors the FadeInImage from the
 * public /blog page so the cards reveal identically on any tenant site.
 */
export const FadeInImage: React.FC<{
  src: string;
  alt: string;
  eager?: boolean;
  sizes?: string;
  onLoadedChange?: (loaded: boolean) => void;
}> = ({ src, alt, eager = false, sizes, onLoadedChange }) => {
  const [loaded, setLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    setLoaded(false);
  }, [src]);

  useEffect(() => {
    const node = imageRef.current;
    if (node?.complete && node.naturalWidth > 0) setLoaded(true);
  }, [src]);

  useEffect(() => {
    onLoadedChange?.(loaded);
  }, [loaded, onLoadedChange]);

  return (
    <Box
      component="img"
      ref={imageRef}
      src={src}
      alt={alt}
      sizes={sizes || "(max-width: 780px) 100vw, (max-width: 1024px) 50vw, 33vw"}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      width="1200"
      height="760"
      onLoad={() => setLoaded(true)}
      onError={() => setLoaded(true)}
      sx={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block",
        opacity: loaded ? 1 : 0,
        transform: loaded ? "scale(1)" : "scale(1.035)",
        filter: loaded ? "blur(0) saturate(1)" : "blur(6px) saturate(0.92)",
        transition:
          "opacity 820ms cubic-bezier(0.22, 1, 0.36, 1), transform 1100ms cubic-bezier(0.22, 1, 0.36, 1), filter 900ms cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    />
  );
};

/* ===================== Shared theme tokens ===================== */

export const BLOG_ACCENT = "#048e84";
export const BLOG_ACCENT_STRONG = "#1c666b";

export const blogHeroFont =
  "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

/* ===================== Color helpers ===================== */

/** Strip an 8-digit (#RRGGBBAA) hex down to #RRGGBB. */
export function normalizeHex(color?: string | null): string {
  const c = String(color || "").trim();
  return c.length === 9 ? c.slice(0, 7) : c;
}

/**
 * Convert a hex color to an rgba() string. Falls back to the input untouched
 * when it isn't a 6-digit hex (e.g. already an rgb()/named color).
 */
export function hexToRgba(color: string | undefined, alpha: number): string {
  const c = normalizeHex(color).replace("#", "");
  if (c.length !== 6 || /[^0-9a-fA-F]/.test(c)) return color || "";
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

type RgbColor = { r: number; g: number; b: number };

function hexToRgb(color?: string | null): RgbColor | null {
  const c = normalizeHex(color).replace("#", "");
  if (c.length !== 6 || /[^0-9a-fA-F]/.test(c)) return null;
  return {
    r: parseInt(c.slice(0, 2), 16),
    g: parseInt(c.slice(2, 4), 16),
    b: parseInt(c.slice(4, 6), 16),
  };
}

function rgbToHex({ r, g, b }: RgbColor): string {
  const toHex = (value: number) =>
    Math.max(0, Math.min(255, Math.round(value)))
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function rgbToHsl({ r, g, b }: RgbColor) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn:
        h = (gn - bn) / d + (gn < bn ? 6 : 0);
        break;
      case gn:
        h = (bn - rn) / d + 2;
        break;
      default:
        h = (rn - gn) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToRgb(h: number, s: number, l: number): RgbColor {
  const hn = (((h % 360) + 360) % 360) / 360;
  const sn = Math.max(0, Math.min(100, s)) / 100;
  const ln = Math.max(0, Math.min(100, l)) / 100;

  if (sn === 0) {
    const value = ln * 255;
    return { r: value, g: value, b: value };
  }

  const hueToRgb = (p: number, q: number, tValue: number) => {
    let t = tValue;
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
  const p = 2 * ln - q;
  return {
    r: hueToRgb(p, q, hn + 1 / 3) * 255,
    g: hueToRgb(p, q, hn) * 255,
    b: hueToRgb(p, q, hn - 1 / 3) * 255,
  };
}

function tuneHeroGlowColor(
  color: string,
  options: { minLightness: number; maxLightness: number; saturationBoost: number; hueShift?: number },
) {
  const rgb = hexToRgb(color);
  if (!rgb) return color;
  const hsl = rgbToHsl(rgb);
  return rgbToHex(
    hslToRgb(
      hsl.h + (options.hueShift || 0),
      Math.min(92, Math.max(34, hsl.s * options.saturationBoost)),
      Math.min(options.maxLightness, Math.max(options.minLightness, hsl.l)),
    ),
  );
}

export function resolveBlogHeroGlow(primaryColor?: string | null) {
  const accent = resolveAccent(primaryColor);
  const primaryGlowColor = tuneHeroGlowColor(accent, {
    minLightness: 40,
    maxLightness: 62,
    saturationBoost: 1.08,
  });
  const highlightGlowColor = tuneHeroGlowColor(accent, {
    minLightness: 58,
    maxLightness: 70,
    saturationBoost: 1.25,
    hueShift: 8,
  });

  return {
    primary: hexToRgba(primaryGlowColor, 0.4),
    highlight: hexToRgba(highlightGlowColor, 0.28),
  };
}

/** Resolve a usable accent, defaulting to the blog teal when none is provided. */
export function resolveAccent(color?: string | null): string {
  const c = normalizeHex(color);
  return c || BLOG_ACCENT;
}

/* ===================== Helpers ===================== */

/** Resolve a post image to a usable URL, tolerating relative asset paths. */
export function resolveBlogImage(imagePath?: string | null): string {
  if (!imagePath) return "";
  if (imagePath.startsWith("http") || imagePath.startsWith("/assets")) {
    return imagePath;
  }
  return imagePath;
}

export function formatBlogDate(dateString?: string | null): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function blogExcerpt(text?: string | null, max = 160): string {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max).trim()}...` : text;
}

export function estimateReadTime(
  content?: string | null,
  description?: string | null,
): string {
  const source = content || description || "";
  const words = source.split(/\s+/).filter(Boolean).length;
  const mins = Math.max(3, Math.round(words / 200));
  return `${mins} min read`;
}

export function resolveAuthorName(
  post: BlogPost,
  fallback = "Editorial",
): string {
  return post.author?.displayName || post.author?.name || fallback;
}

/* ===================== Insight card ===================== */

export interface BlogInsightCardProps {
  post: BlogPost;
  /** Large horizontal hero card when true; standard vertical card otherwise. */
  featured?: boolean;
  authorLabel?: string;
  /** Accent color (website primary). Defaults to the blog teal. */
  accent?: string;
  onOpen?: (post: BlogPost) => void;
  blockId?: string | number;
  staticPrefix?: string;
}

/**
 * The card used by BLOG_FEATURED (featured) and BLOG_GRID (grid). Mirrors the
 * ArticleCard styling from the public /blog page.
 */
export const BlogInsightCard: React.FC<BlogInsightCardProps> = ({
  post,
  featured = false,
  authorLabel,
  accent,
  onOpen,
  blockId,
  staticPrefix = featured ? "featured-card" : `blog-card-${post.id}`,
}) => {
  const author = authorLabel || resolveAuthorName(post);
  const image = resolveBlogImage(post.image);
  const handleOpen = () => onOpen?.(post);

  const accentColor = resolveAccent(accent);
  const accentHoverBorder = hexToRgba(accentColor, 0.45);
  const accentHoverShadow = hexToRgba(accentColor, 0.14);

  if (featured) {
    return (
      <Box
        {...(blockId
          ? blogStaticProps(blockId, staticPrefix, "Featured article card", "container")
          : {})}
        onClick={handleOpen}
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          height: { xs: "auto", md: "clamp(280px, 24vw, 370px)" },
          minHeight: { xs: "auto", md: "280px" },
          border: "1px solid #d7e2ec",
          borderRadius: "16px",
          cursor: onOpen ? "pointer" : "default",
          background: "#ffffff",
          transition:
            "border-color 0.28s ease, transform 0.28s ease, box-shadow 0.28s ease",
          position: "relative",
          isolation: "isolate",
          overflow: "hidden",
          boxShadow: "0 8px 18px rgba(12, 28, 45, 0.08)",
          "&:hover": {
            borderColor: accentHoverBorder,
            transform: "translateY(-6px)",
            boxShadow: `0 18px 34px rgba(12, 28, 45, 0.18), 0 0 0 1px ${accentHoverShadow}`,
          },
        }}
      >
        <Box
          {...(blockId
            ? blogStaticProps(blockId, `${staticPrefix}-image`, "Featured article image", "media")
            : {})}
          sx={{
            flex: { xs: "none", md: "0 0 45%" },
            height: { xs: "clamp(200px, 38vw, 280px)", md: "100%" },
            position: "relative",
            background: "#0a1825",
          }}
        >
          {image && (
            <FadeInImage
              src={image}
              alt={post.title}
              eager
              sizes="(max-width: 1024px) 100vw, 45vw"
            />
          )}
          {post.category && (
            <Box
              {...(blockId
                ? blogStaticProps(blockId, `${staticPrefix}-category`, "Featured article category")
                : {})}
              sx={{
                position: "absolute",
                bottom: "16px",
                left: "16px",
                background: accentColor,
                color: "#ffffffea",
                fontSize: "12px",
                fontWeight: 700,
                padding: "4px 10px",
                borderRadius: "100px",
                letterSpacing: "0.6px",
                zIndex: 1,
              }}
            >
              {post.category}
            </Box>
          )}
        </Box>

        <Box
          sx={{
            flex: 1,
            padding: { xs: "24px", md: "38px 42px 36px" },
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: "8px",
            color: "#0f172a",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <Box
              {...(blockId
                ? blogStaticProps(blockId, `${staticPrefix}-meta`, "Featured article meta")
                : {})}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                mb: "12px",
                color: "#64748b",
                fontSize: "12px",
              }}
            >
              <Typography variant="body2">
                {formatBlogDate(post.publishedAt)}
              </Typography>
              <Typography variant="body2">|</Typography>
              <Typography variant="body2">
                {estimateReadTime(post.excerpt, post.description)}
              </Typography>
            </Box>
            <Typography
              {...(blockId
                ? blogStaticProps(blockId, `${staticPrefix}-title`, "Featured article title")
                : {})}
              variant="h4"
              sx={{
                color: "#0f172a",
                fontSize: { xs: "22px", md: "27px" },
                fontWeight: 700,
                lineHeight: 1.3,
                mb: "14px",
                letterSpacing: "-0.4px",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {post.title}
            </Typography>
            <Typography
              {...(blockId
                ? blogStaticProps(blockId, `${staticPrefix}-excerpt`, "Featured article excerpt")
                : {})}
              variant="body1"
              sx={{
                color: "#475569",
                fontSize: "15px",
                lineHeight: 1.7,
                mb: "24px",
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {blogExcerpt(post.description || post.excerpt, 230)}
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mt: "auto",
                pt: "16px",
                borderTop: "1px solid #e2e8f0",
                color: "#64748b",
                fontSize: "12px",
              }}
            >
              <Typography variant="body2">{author}</Typography>
              <Box
                {...(blockId
                  ? blogStaticProps(blockId, `${staticPrefix}-read-link`, "Featured article link")
                  : {})}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  color: accentColor,
                  fontWeight: 600,
                  letterSpacing: "1px",
                }}
              >
                Read Article <ArrowForwardIcon sx={{ fontSize: "1rem" }} />
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      {...(blockId
        ? blogStaticProps(blockId, staticPrefix, "Article card", "container")
        : {})}
      onClick={handleOpen}
      sx={{
        border: "1px solid #d7e2ec",
        borderRadius: "14px",
        cursor: onOpen ? "pointer" : "default",
        transition:
          "border-color 0.28s ease, transform 0.28s ease, box-shadow 0.28s ease",
        display: "flex",
        flexDirection: "column",
        background: "#ffffff",
        position: "relative",
        isolation: "isolate",
        overflow: "hidden",
        boxShadow: "0 6px 14px rgba(12, 28, 45, 0.07)",
        height: "100%",
        "&:hover": {
          borderColor: accentHoverBorder,
          transform: "translateY(-6px)",
          boxShadow: `0 16px 30px rgba(12, 28, 45, 0.16), 0 0 0 1px ${accentHoverShadow}`,
        },
      }}
    >
      <Box
        {...(blockId
          ? blogStaticProps(blockId, `${staticPrefix}-image`, "Article card image", "media")
          : {})}
        sx={{ height: "220px", position: "relative", background: "#0a1825" }}
      >
        {image && <FadeInImage src={image} alt={post.title} />}
        {post.category && (
          <Box
            {...(blockId
              ? blogStaticProps(blockId, `${staticPrefix}-category`, "Article card category")
              : {})}
            sx={{
              position: "absolute",
              bottom: "12px",
              left: "12px",
              background: accentColor,
              border: `1px solid ${accentColor}`,
              color: "#ffffffea",
              fontSize: "11px",
              fontWeight: 700,
              padding: "3px 10px",
              borderRadius: "100px",
              letterSpacing: "0.6px",
              zIndex: 1,
            }}
          >
            {post.category}
          </Box>
        )}
      </Box>

      <Box
        sx={{
          padding: "22px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          color: "#0f172a",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            mb: "12px",
            color: "#64748b",
            fontSize: "12px",
          }}
        >
          <Typography variant="body2">
            {formatBlogDate(post.publishedAt)}
          </Typography>
          <Typography variant="body2">|</Typography>
          <Typography variant="body2">
            {estimateReadTime(post.excerpt, post.description)}
          </Typography>
        </Box>
        <Typography
          {...(blockId
            ? blogStaticProps(blockId, `${staticPrefix}-title`, "Article card title")
            : {})}
          variant="h6"
          sx={{
            color: "#1e293b",
            fontSize: "18px",
            fontWeight: 700,
            lineHeight: 1.35,
            mb: "10px",
            letterSpacing: "-0.2px",
          }}
        >
          {post.title}
        </Typography>
        <Typography
          {...(blockId
            ? blogStaticProps(blockId, `${staticPrefix}-excerpt`, "Article card excerpt")
            : {})}
          variant="body2"
          sx={{
            color: "#475569",
            fontSize: "14px",
            lineHeight: 1.62,
            mb: "auto",
          }}
        >
          {blogExcerpt(post.description || post.excerpt, 125)}
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mt: "20px",
            pt: "16px",
            borderTop: "1px solid #e2e8f0",
            color: "#64748b",
            fontSize: "12px",
          }}
        >
          <Typography variant="body2">{author}</Typography>
          <Box
            {...(blockId
              ? blogStaticProps(blockId, `${staticPrefix}-read-link`, "Article card link")
              : {})}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              color: accentColor,
              fontWeight: 600,
              letterSpacing: "1px",
            }}
          >
            Read <ArrowForwardIcon sx={{ fontSize: "1rem" }} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

/** Skeleton placeholder matching the small card footprint. */
export const BlogCardSkeleton: React.FC = () => (
  <Box
    sx={{
      border: "1px solid #d7e2ec",
      borderRadius: "14px",
      overflow: "hidden",
      background: "#ffffff",
      height: "100%",
    }}
  >
    <Skeleton variant="rectangular" height={220} />
    <Box sx={{ p: "22px" }}>
      <Skeleton variant="text" width="40%" height={14} />
      <Skeleton variant="text" width="90%" height={26} />
      <Skeleton variant="text" width="100%" height={16} />
      <Skeleton variant="text" width="70%" height={16} />
    </Box>
  </Box>
);
