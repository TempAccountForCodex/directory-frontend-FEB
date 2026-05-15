/**
 * BlogCard — Step 2.23.2
 *
 * Reusable card component for a single blog post, used in grid and list layouts.
 * Displays: featured image, title, author, date, excerpt, category chip, read more link.
 *
 * Performance: wrapped in React.memo
 * Accessibility: role="article", aria-labels
 * Responsive: full-width on mobile
 */

import React, { useCallback } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  Box,
  Link,
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PersonIcon from "@mui/icons-material/Person";

/* ===================== Types ===================== */

export interface BlogPost {
  id: number | string;
  title: string;
  slug: string;
  image?: string | null;
  category?: string | null;
  description?: string | null;
  author?: { name: string } | null;
  publishedAt?: string | null;
}

export interface BlogCardConfig {
  showImage: boolean;
  showAuthor: boolean;
  showDate: boolean;
  showExcerpt: boolean;
  excerptLength: number;
  readMoreText: string;
  readMoreLink?: string;
}

export interface BlogCardColors {
  primaryColor: string;
  headingColor: string;
  bodyColor: string;
}

export interface BlogCardProps {
  post: BlogPost;
  config: BlogCardConfig;
  colors: BlogCardColors;
  onClick?: (post: BlogPost) => void;
}

/* ===================== Helpers ===================== */

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function truncate(text: string | null | undefined, maxLength: number): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

/* ===================== Component ===================== */

const BlogCard: React.FC<BlogCardProps> = ({
  post,
  config,
  colors,
  onClick,
}) => {
  const {
    showImage,
    showAuthor,
    showDate,
    showExcerpt,
    excerptLength,
    readMoreText,
  } = config;

  const { primaryColor, headingColor, bodyColor } = colors;

  const handleClick = useCallback(() => {
    if (onClick) {
      onClick(post);
    }
  }, [onClick, post]);

  const formattedDate = formatDate(post.publishedAt);
  const excerpt = truncate(post.description, excerptLength);

  return (
    <Card
      component="article"
      role="article"
      aria-label={`Blog post: ${post.title}`}
      onClick={handleClick}
      elevation={2}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        cursor: onClick ? "pointer" : "default",
        transition: "transform 0.25s ease, box-shadow 0.25s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 6,
        },
      }}
    >
      {/* Featured Image */}
      {showImage && post.image ? (
        <CardMedia
          component="img"
          image={post.image}
          alt={post.title}
          loading="lazy"
          sx={{
            height: 200,
            objectFit: "cover",
            aspectRatio: "16/9",
          }}
        />
      ) : showImage ? (
        /* Fallback placeholder when showImage=true but no image available */
        <Box
          data-testid="blog-card-image-placeholder"
          sx={{
            height: 200,
            bgcolor: "grey.100",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-label="No image available"
        >
          <Typography variant="caption" color="text.disabled">
            No image
          </Typography>
        </Box>
      ) : null}

      <CardContent
        sx={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: 1 }}
      >
        {/* Category Chip */}
        {post.category && (
          <Box>
            <Chip
              label={post.category}
              size="small"
              sx={{
                bgcolor: `${primaryColor}1A`,
                color: primaryColor,
                fontWeight: 600,
                fontSize: "0.7rem",
              }}
            />
          </Box>
        )}

        {/* Title */}
        <Typography
          variant="h6"
          component="h3"
          sx={{
            color: headingColor,
            fontWeight: 700,
            lineHeight: 1.3,
            fontSize: { xs: "1rem", sm: "1.1rem" },
          }}
        >
          {post.title}
        </Typography>

        {/* Meta: Author + Date */}
        {(showAuthor && post.author?.name) || (showDate && formattedDate) ? (
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1.5,
              alignItems: "center",
            }}
          >
            {showAuthor && post.author?.name && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <PersonIcon sx={{ fontSize: "0.875rem", color: bodyColor }} />
                <Typography variant="caption" sx={{ color: bodyColor }}>
                  {post.author.name}
                </Typography>
              </Box>
            )}
            {showDate && formattedDate && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <CalendarTodayIcon
                  sx={{ fontSize: "0.875rem", color: bodyColor }}
                />
                <Typography variant="caption" sx={{ color: bodyColor }}>
                  {formattedDate}
                </Typography>
              </Box>
            )}
          </Box>
        ) : null}

        {/* Excerpt */}
        {showExcerpt && excerpt && (
          <Typography
            variant="body2"
            data-testid="blog-card-excerpt"
            sx={{ color: bodyColor, lineHeight: 1.6, flexGrow: 1 }}
          >
            {excerpt}
          </Typography>
        )}

        {/* Read More Link */}
        {readMoreText && (
          <Box sx={{ mt: "auto", pt: 1 }}>
            <Link
              component="span"
              sx={{
                color: primaryColor,
                fontWeight: 600,
                fontSize: "0.875rem",
                textDecoration: "none",
                cursor: "pointer",
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
              aria-label={`Read more about ${post.title}`}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                if (onClick) onClick(post);
              }}
            >
              {readMoreText} →
            </Link>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

BlogCard.displayName = "BlogCard";

export default React.memo(BlogCard);
