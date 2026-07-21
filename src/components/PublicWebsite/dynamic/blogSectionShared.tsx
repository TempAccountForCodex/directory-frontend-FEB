/**
 * blogSectionShared — Shared helpers + card for the split blog page blocks.
 *
 * Powers BLOG_HERO / BLOG_FEATURED / BLOG_GRID, which reproduce the polished
 * public /blog (InsightsPage) design as independent, movable editor sections.
 * All three consume website-scoped blog data (via useDynamicBlockData with a
 * `blog` datasource) so each tenant site shows its own posts.
 */

import React from "react";
import { Box, Typography, Skeleton } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import type { BlogPost } from "./BlogCard";

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
          sx={{
            flex: { xs: "none", md: "0 0 45%" },
            height: { xs: "clamp(200px, 38vw, 280px)", md: "100%" },
            position: "relative",
            background: "#0a1825",
          }}
        >
          {image && (
            <Box
              component="img"
              src={image}
              alt={post.title}
              sx={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          )}
          {post.category && (
            <Box
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
      <Box sx={{ height: "220px", position: "relative", background: "#0a1825" }}>
        {image && (
          <Box
            component="img"
            src={image}
            alt={post.title}
            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        )}
        {post.category && (
          <Box
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
