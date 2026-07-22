/**
 * BlogFeaturedBlock — BLOG_FEATURED
 *
 * Renders a single large "featured" blog card, mirroring the featured card on
 * the public /blog page. The owner picks the highlighted post by slug in the
 * editor; when no slug is set it falls back to the most recent published post.
 * Website-scoped via useDynamicBlockData (`blog` / `blog-article` datasource).
 */

import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import useTenantUrl from "../../../hooks/useTenantUrl";
import useDynamicBlockData from "../../../hooks/useDynamicBlockData";
import type { BlogPost } from "./BlogCard";
import {
  BlogInsightCard,
  BlogCardSkeleton,
  blogHeroFont,
  blogStaticProps,
} from "./blogSectionShared";

interface BlogFeaturedContent {
  heading?: string;
  postSlug?: string;
  authorLabel?: string;
  readMoreLink?: string;
  emptyMessage?: string;
}

interface Block {
  id: number;
  blockType: string;
  content: BlogFeaturedContent;
  sortOrder: number;
}

interface BlogFeaturedBlockProps {
  block: Block;
  websiteId?: string | number;
  primaryColor?: string;
  onCtaClick?: (blockType: string, ctaText: string) => void;
}

function buildReadMorePath(
  readMoreLink: string | undefined,
  slug: string,
): string {
  if (!readMoreLink) return `/blog/${slug}`;
  if (readMoreLink.includes("{slug}")) return readMoreLink.replace("{slug}", slug);
  return `/blog/${slug}`;
}

const SectionShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box
    component="section"
    sx={{
      width: "100%",
      padding: {
        xs: "42px 20px 8px",
        md: "52px 96px 12px",
        lg: "64px 200px 16px",
      },
      position: "relative",
      isolation: "isolate",
      overflow: "hidden",
      backgroundColor: "#f7f5f3",
      fontFamily: blogHeroFont,
      "&::before": {
        content: '""',
        position: "absolute",
        inset: 0,
        backgroundImage: "url('/assets/images/insights/bg-1.webp')",
        backgroundRepeat: "repeat",
        backgroundPosition: "left top",
        zIndex: 0,
        pointerEvents: "none",
      },
    }}
  >
    <Box sx={{ position: "relative", zIndex: 1 }}>{children}</Box>
  </Box>
);

const BlogFeaturedBlockBase: React.FC<BlogFeaturedBlockProps> = ({
  block,
  websiteId,
  primaryColor,
  onCtaClick,
}) => {
  const {
    heading = "",
    postSlug = "",
    authorLabel,
    readMoreLink = "/blog/{slug}",
    emptyMessage = "No featured article yet.",
  } = block.content || {};

  const navigate = useNavigate();
  const { buildUrl } = useTenantUrl();

  /* When a slug is pinned we fetch that exact post; otherwise the latest one. */
  const dataSource = useMemo(() => {
    const slug = postSlug.trim();
    if (slug) return `blog-article?identifier=${encodeURIComponent(slug)}`;
    return `blog?page=1&limit=1&sortBy=publishedAt&sortOrder=desc`;
  }, [postSlug]);

  const { data, loading } = useDynamicBlockData(
    block.id,
    block.blockType,
    dataSource,
    { websiteId },
  );

  const post: BlogPost | null = useMemo(() => {
    if (data?.blog) return data.blog as BlogPost;
    if (data?.post) return data.post as BlogPost;
    if (Array.isArray(data?.blogs) && data.blogs.length) return data.blogs[0];
    if (Array.isArray(data?.insights) && data.insights.length)
      return data.insights[0];
    return null;
  }, [data]);

  const handleOpen = (target: BlogPost) => {
    if (onCtaClick) onCtaClick(block.blockType, target.title);
    const path = buildReadMorePath(readMoreLink, target.slug);
    if (path.startsWith("http://") || path.startsWith("https://")) {
      window.location.href = path;
    } else {
      navigate(buildUrl(path));
    }
  };

  if (loading && !post) {
    return (
      <SectionShell>
        <BlogCardSkeleton />
      </SectionShell>
    );
  }

  if (!post) {
    return (
      <SectionShell>
        <Box sx={{ textAlign: "center", py: "40px", color: "#64748b" }}>
          <Typography variant="h6">{emptyMessage}</Typography>
        </Box>
      </SectionShell>
    );
  }

  return (
    <SectionShell>
      {heading && (
        <Typography
          {...blogStaticProps(block.id, "featured-section-heading", "Featured section heading")}
          variant="h4"
          sx={{
            fontWeight: 700,
            color: "#0f172a",
            mb: "24px",
            letterSpacing: "-0.4px",
            fontSize: { xs: "22px", md: "26px" },
          }}
        >
          {heading}
        </Typography>
      )}
      <BlogInsightCard
        post={post}
        featured
        authorLabel={authorLabel}
        accent={primaryColor}
        onOpen={handleOpen}
        blockId={block.id}
        staticPrefix="featured-card"
      />
    </SectionShell>
  );
};

BlogFeaturedBlockBase.displayName = "BlogFeaturedBlock";

const BlogFeaturedBlock = React.memo(BlogFeaturedBlockBase);
BlogFeaturedBlock.displayName = "BlogFeaturedBlock";

export default BlogFeaturedBlock;
