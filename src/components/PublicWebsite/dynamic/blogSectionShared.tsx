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

export function resolveBlogCommentPalette(primaryColor?: string | null) {
  const accent = resolveAccent(primaryColor);
  const rgb = hexToRgb(accent);
  const hsl = rgb ? rgbToHsl(rgb) : { h: 175, s: 55, l: 40 };
  const hue = Math.round(hsl.h);
  const saturation = Math.round(Math.min(78, Math.max(42, hsl.s * 1.08)));
  const actionLightness = Math.round(
    Math.min(52, Math.max(38, hsl.l < 42 ? hsl.l + 12 : hsl.l - 4)),
  );
  const textLightness = Math.round(Math.min(32, Math.max(18, hsl.l * 0.62)));

  const hslColor = (lightness: number, alpha?: number, sat = saturation) =>
    alpha == null
      ? `hsl(${hue}, ${sat}%, ${lightness}%)`
      : `hsla(${hue}, ${sat}%, ${lightness}%, ${alpha})`;

  return {
    hue,
    accent,
    action: hslColor(actionLightness),
    actionHover: hslColor(Math.max(30, actionLightness - 5)),
    text: hslColor(textLightness, undefined, Math.max(36, saturation - 8)),
    muted: hslColor(48, undefined, Math.max(24, saturation - 28)),
    surface: hslColor(99, 0.94, Math.max(22, saturation - 34)),
    surfaceSoft: hslColor(97, 0.9, Math.max(24, saturation - 30)),
    surfaceMuted: hslColor(95, 0.74, Math.max(18, saturation - 38)),
    border: hslColor(88, 0.92, Math.max(24, saturation - 34)),
    borderStrong: hslColor(74, 0.86, Math.max(32, saturation - 24)),
    ring: hslColor(92, 0.95, Math.max(38, saturation - 12)),
    avatarBg: `linear-gradient(135deg, ${hslColor(76, undefined, saturation)} 0%, ${hslColor(66, undefined, Math.max(38, saturation - 4))} 100%)`,
    avatarText: hslColor(22, undefined, Math.max(34, saturation - 18)),
    danger: "#dc2626",
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
              <Typography
                {...(blockId
                  ? blogStaticProps(
                      blockId,
                      `${staticPrefix}-author`,
                      "Featured article author",
                    )
                  : {})}
                variant="body2"
              >
                {author}
              </Typography>
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
          {...(blockId
            ? blogStaticProps(blockId, `${staticPrefix}-meta`, "Article card meta")
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
          <Typography
            {...(blockId
              ? blogStaticProps(
                  blockId,
                  `${staticPrefix}-author`,
                  "Article card author",
                )
              : {})}
            variant="body2"
          >
            {author}
          </Typography>
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

/* ===================== Split-layout cards ===================== */

export interface BlogSplitCardProps {
  post: BlogPost;
  /** "tall" = large feature card filling a column; "row" = compact horizontal card. */
  layout: "tall" | "row";
  authorLabel?: string;
  accent?: string;
  onOpen?: (post: BlogPost) => void;
  blockId?: string | number;
  staticPrefix: string;
}

/**
 * The cards used by the BLOG_SHOWCASE "feature + list" variant. Shares the
 * visual language of BlogInsightCard (border, radius, shadow, accent category
 * pill, hover lift) but in two shapes: a tall feature card that fills the left
 * column, and a compact row card for the stacked right column.
 */
export const BlogSplitCard: React.FC<BlogSplitCardProps> = ({
  post,
  layout,
  authorLabel,
  accent,
  onOpen,
  blockId,
  staticPrefix,
}) => {
  const author = authorLabel || resolveAuthorName(post);
  const image = resolveBlogImage(post.image);
  const accentColor = resolveAccent(accent);
  const accentHoverBorder = hexToRgba(accentColor, 0.45);
  const accentHoverShadow = hexToRgba(accentColor, 0.14);
  const isTall = layout === "tall";

  const shellProps = blockId
    ? blogStaticProps(
        blockId,
        staticPrefix,
        isTall ? "Feature article card" : "Article row card",
        "container",
      )
    : {};

  return (
    <Box
      {...shellProps}
      onClick={() => onOpen?.(post)}
      sx={{
        display: "flex",
        flexDirection: isTall ? "column" : "row",
        height: "100%",
        border: "1px solid #d7e2ec",
        borderRadius: isTall ? "16px" : "14px",
        cursor: onOpen ? "pointer" : "default",
        background: "#ffffff",
        position: "relative",
        isolation: "isolate",
        overflow: "hidden",
        boxShadow: "0 6px 14px rgba(12, 28, 45, 0.07)",
        transition:
          "border-color 0.28s ease, transform 0.28s ease, box-shadow 0.28s ease",
        "&:hover": {
          borderColor: accentHoverBorder,
          transform: "translateY(-4px)",
          boxShadow: `0 16px 30px rgba(12, 28, 45, 0.16), 0 0 0 1px ${accentHoverShadow}`,
        },
      }}
    >
      <Box
        {...(blockId
          ? blogStaticProps(
              blockId,
              `${staticPrefix}-image`,
              isTall ? "Feature article image" : "Article row image",
              "media",
            )
          : {})}
        sx={
          isTall
            ? {
                // Absorbs all slack so the card matches the section height
                // instead of growing to the image's natural aspect ratio.
                flex: "1 1 0",
                minHeight: { xs: 200, md: 0 },
                position: "relative",
                background: "#0a1825",
              }
            : {
                flex: "0 0 auto",
                width: { xs: 108, sm: 132 },
                position: "relative",
                background: "#0a1825",
              }
        }
      >
        {image && <FadeInImage src={image} alt={post.title} eager={isTall} />}
        {isTall && post.category && (
          <Box
            {...(blockId
              ? blogStaticProps(
                  blockId,
                  `${staticPrefix}-category`,
                  "Feature article category",
                )
              : {})}
            sx={{
              position: "absolute",
              bottom: "14px",
              left: "14px",
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
          // Tall: sit at natural height so the image takes the slack (no blank
          // gap). Row: grow horizontally beside the thumbnail and centre.
          flex: isTall ? "0 0 auto" : "1 1 auto",
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: isTall ? "flex-start" : "center",
          padding: isTall ? { xs: "20px", md: "22px 26px" } : "12px 16px",
          color: "#0f172a",
        }}
      >
        <Box
          {...(blockId
            ? blogStaticProps(
                blockId,
                `${staticPrefix}-meta`,
                isTall ? "Feature article meta" : "Article row meta",
              )
            : {})}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            mb: isTall ? "12px" : "6px",
            color: "#64748b",
            fontSize: isTall ? "12px" : "11px",
          }}
        >
          <Typography variant="body2" sx={{ fontSize: "inherit" }}>
            {formatBlogDate(post.publishedAt)}
          </Typography>
          <Typography variant="body2" sx={{ fontSize: "inherit" }}>
            |
          </Typography>
          <Typography variant="body2" sx={{ fontSize: "inherit" }}>
            {estimateReadTime(post.excerpt, post.description)}
          </Typography>
        </Box>

        <Typography
          {...(blockId
            ? blogStaticProps(
                blockId,
                `${staticPrefix}-title`,
                isTall ? "Feature article title" : "Article row title",
              )
            : {})}
          sx={{
            color: "#1e293b",
            fontSize: isTall ? { xs: "20px", md: "24px" } : "15px",
            fontWeight: 700,
            lineHeight: 1.3,
            letterSpacing: isTall ? "-0.3px" : "-0.1px",
            mb: isTall ? "10px" : 0,
            display: "-webkit-box",
            WebkitLineClamp: isTall ? 3 : 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {post.title}
        </Typography>

        {isTall && (
          <Typography
            {...(blockId
              ? blogStaticProps(
                  blockId,
                  `${staticPrefix}-excerpt`,
                  "Feature article excerpt",
                )
              : {})}
            sx={{
              color: "#475569",
              fontSize: "14px",
              lineHeight: 1.65,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {blogExcerpt(post.description || post.excerpt, 180)}
          </Typography>
        )}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "8px",
            mt: isTall ? "14px" : "8px",
            pt: isTall ? "14px" : 0,
            ...(isTall ? { borderTop: "1px solid #e2e8f0" } : {}),
            color: "#64748b",
            fontSize: isTall ? "12px" : "11px",
          }}
        >
          <Typography
            {...(blockId
              ? blogStaticProps(
                  blockId,
                  `${staticPrefix}-author`,
                  isTall ? "Feature article author" : "Article row author",
                )
              : {})}
            variant="body2"
            noWrap
            sx={{ fontSize: "inherit" }}
          >
            {author}
          </Typography>
          <Box
            {...(blockId
              ? blogStaticProps(
                  blockId,
                  `${staticPrefix}-read-link`,
                  isTall ? "Feature article link" : "Article row link",
                )
              : {})}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              color: accentColor,
              fontWeight: 600,
              letterSpacing: "0.6px",
              whiteSpace: "nowrap",
            }}
          >
            Read <ArrowForwardIcon sx={{ fontSize: isTall ? "1rem" : "0.85rem" }} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

/**
 * Loading placeholder for BlogSplitCard — mirrors the real card's shell, image
 * proportions and text rhythm so the layout doesn't shift when posts arrive.
 */
export const BlogSplitCardSkeleton: React.FC<{ layout: "tall" | "row" }> = ({
  layout,
}) => {
  const isTall = layout === "tall";

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: isTall ? "column" : "row",
        height: "100%",
        width: "100%",
        border: "1px solid #d7e2ec",
        borderRadius: isTall ? "16px" : "14px",
        background: "#ffffff",
        overflow: "hidden",
        boxShadow: "0 6px 14px rgba(12, 28, 45, 0.07)",
      }}
    >
      <Skeleton
        variant="rectangular"
        sx={
          isTall
            ? { flex: "1 1 0", minHeight: { xs: 200, md: 0 }, width: "100%" }
            : { flex: "0 0 auto", width: { xs: 108, sm: 132 }, height: "100%" }
        }
      />

      <Box
        sx={{
          flex: isTall ? "0 0 auto" : "1 1 auto",
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: isTall ? "flex-start" : "center",
          padding: isTall ? { xs: "20px", md: "22px 26px" } : "12px 16px",
        }}
      >
        <Skeleton variant="text" width="45%" height={isTall ? 16 : 13} />
        <Skeleton variant="text" width="95%" height={isTall ? 30 : 20} />
        <Skeleton variant="text" width="70%" height={isTall ? 30 : 20} />
        {isTall && (
          <>
            <Skeleton variant="text" width="100%" height={18} />
            <Skeleton variant="text" width="82%" height={18} />
          </>
        )}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mt: isTall ? "14px" : "8px",
            pt: isTall ? "14px" : 0,
            ...(isTall ? { borderTop: "1px solid #e2e8f0" } : {}),
          }}
        >
          <Skeleton variant="text" width={isTall ? 78 : 56} height={isTall ? 16 : 13} />
          <Skeleton variant="text" width={isTall ? 52 : 40} height={isTall ? 16 : 13} />
        </Box>
      </Box>
    </Box>
  );
};

/** Skeleton placeholder matching the small card footprint. */
export const BlogCardSkeleton: React.FC = () => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      border: "1px solid #d7e2ec",
      borderRadius: "14px",
      overflow: "hidden",
      background: "#ffffff",
      boxShadow: "0 6px 14px rgba(12, 28, 45, 0.07)",
      height: "100%",
    }}
  >
    <Skeleton variant="rectangular" height={220} sx={{ flex: "0 0 auto" }} />
    <Box
      sx={{ p: "22px", flex: 1, display: "flex", flexDirection: "column" }}
    >
      <Skeleton variant="text" width="40%" height={14} />
      <Skeleton variant="text" width="90%" height={26} />
      <Skeleton variant="text" width="100%" height={16} />
      <Skeleton variant="text" width="70%" height={16} />
      {/* Footer — mirrors the card's author + "Read" row and its divider. */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mt: "auto",
          pt: "16px",
          borderTop: "1px solid #e2e8f0",
        }}
      >
        <Skeleton variant="text" width={72} height={14} />
        <Skeleton variant="text" width={46} height={14} />
      </Box>
    </Box>
  </Box>
);
