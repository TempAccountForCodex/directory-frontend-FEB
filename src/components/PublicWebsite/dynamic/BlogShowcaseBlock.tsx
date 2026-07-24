/**
 * BlogShowcaseBlock — BLOG_SHOWCASE
 *
 * A promotional "from the blog" section for any page (home, about, …) other
 * than the blog index / article pages. Renders an editable eyebrow / heading /
 * description plus a themed grid of blog cards. Each card slot is either pinned
 * to a specific post (chosen in the editor) or left on "Auto", in which case it
 * fills with the most-recent post not already pinned.
 *
 * Reuses BlogInsightCard (the exact grid-card design) so the cards match the
 * blog page, and takes the website `primaryColor` as its accent so the section
 * blends into whatever template it lives in. Website-scoped via
 * useDynamicBlockData (`blog` datasource) — no backend changes required.
 */

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Grid, Typography } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import useTenantUrl from "../../../hooks/useTenantUrl";
import useDynamicBlockData from "../../../hooks/useDynamicBlockData";
import { API_URL } from "@/config/api";
import type { BlogPost } from "./BlogCard";
import {
  BlogInsightCard,
  BlogSplitCard,
  BlogCardSkeleton,
  BlogSplitCardSkeleton,
  blogHeroFont,
  blogStaticProps,
  resolveAccent,
  hexToRgba,
} from "./blogSectionShared";

interface ShowcaseCard {
  _id?: string;
  slug?: string;
}

interface BlogShowcaseContent {
  eyebrow?: string;
  heading?: string;
  description?: string;
  /** "grid" = equal card grid; "split" = one feature card + three stacked rows. */
  variant?: string;
  cards?: ShowcaseCard[];
  columns?: number;
  authorLabel?: string;
  readMoreLink?: string;
  emptyMessage?: string;
  ctaText?: string;
  ctaLink?: string;
  _subType?: string;
}

interface Block {
  id: number;
  blockType: string;
  content: BlogShowcaseContent;
  sortOrder: number;
}

interface BlogShowcaseBlockProps {
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

/**
 * Height of the "feature + list" row on md+. Matches the natural height of a
 * BlogInsightCard in the grid variant (220px image + content), so switching
 * layouts rearranges the cards without resizing the section.
 */
const SPLIT_ROW_HEIGHT = 480;

/** Column count → MUI lg grid width (12-based). */
function lgWidth(columns: number): 3 | 4 | 6 {
  if (columns >= 4) return 3;
  if (columns === 2) return 6;
  return 4;
}

const BlogShowcaseBlockBase: React.FC<BlogShowcaseBlockProps> = ({
  block,
  websiteId,
  primaryColor,
  onCtaClick,
}) => {
  const {
    eyebrow = "",
    heading = "",
    description = "",
    variant = "grid",
    cards = [],
    columns = 3,
    authorLabel,
    readMoreLink = "/blog/{slug}",
    emptyMessage = "No articles published yet — check back soon.",
    ctaText = "",
    ctaLink = "/blog",
  } = block.content || {};

  const accent = resolveAccent(primaryColor);
  const accentSoft = hexToRgba(accent, 0.06);
  const accentBorder = hexToRgba(accent, 0.14);

  const navigate = useNavigate();
  const { buildUrl } = useTenantUrl();

  const isSplit = String(variant).toLowerCase() === "split";

  /* --- Normalise the configured card slots ---
   * The split layout always has 4 positions (1 feature + 3 rows), so pad with
   * "Auto" slots when the owner has configured fewer. */
  const slots = useMemo<ShowcaseCard[]>(() => {
    const configured =
      Array.isArray(cards) && cards.length
        ? cards
        : [{ slug: "" }, { slug: "" }, { slug: "" }];
    if (!isSplit || configured.length >= 4) return configured;
    return [
      ...configured,
      ...Array.from({ length: 4 - configured.length }, () => ({ slug: "" })),
    ];
  }, [cards, isSplit]);

  const pinnedSlugs = useMemo(
    () => slots.map((slot) => (slot?.slug || "").trim()).filter(Boolean),
    [slots],
  );

  /* --- Latest-posts pool (covers the "Auto" slots + most pinned ones) --- */
  const poolLimit = Math.min(48, Math.max(12, slots.length + 6));
  const poolSource = useMemo(
    () => `blog?page=1&limit=${poolLimit}&sortBy=publishedAt&sortOrder=desc`,
    [poolLimit],
  );

  const { data, loading } = useDynamicBlockData(
    block.id,
    block.blockType,
    poolSource,
    { websiteId },
  );

  const pool: BlogPost[] = useMemo(() => {
    if (Array.isArray(data?.blogs)) return data.blogs;
    if (Array.isArray(data?.insights)) return data.insights;
    return [];
  }, [data]);

  /* --- Secondary fetch for pinned posts that fall outside the latest pool --- */
  const [extra, setExtra] = useState<Record<string, BlogPost | null>>({});

  useEffect(() => {
    const poolSlugs = new Set(pool.map((post) => post.slug));
    const missing = pinnedSlugs.filter(
      (slug) => !poolSlugs.has(slug) && extra[slug] === undefined,
    );
    if (missing.length === 0) return;

    const base = websiteId
      ? `${API_URL}/websites/${websiteId}/blogs/public`
      : `${API_URL}/blogs/public`;
    let cancelled = false;

    missing.forEach((slug) => {
      fetch(`${base}/${encodeURIComponent(slug)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (cancelled) return;
          const payload = json?.data ?? json;
          const post: BlogPost | null =
            payload?.blog ?? payload?.post ?? payload ?? null;
          setExtra((prev) => ({
            ...prev,
            [slug]: post && post.slug ? post : null,
          }));
        })
        .catch(() => {
          if (!cancelled) setExtra((prev) => ({ ...prev, [slug]: null }));
        });
    });

    return () => {
      cancelled = true;
    };
  }, [pinnedSlugs, pool, extra, websiteId]);

  /* --- Resolve each slot to a post (pinned → that post, else next latest) --- */
  const resolvedPosts = useMemo<BlogPost[]>(() => {
    const poolBySlug = new Map(pool.map((post) => [post.slug, post]));
    const findPinned = (slug: string) =>
      poolBySlug.get(slug) || extra[slug] || null;

    const usedSlugs = new Set(pinnedSlugs);
    const autoQueue = pool.filter((post) => !usedSlugs.has(post.slug));

    const result: BlogPost[] = [];
    slots.forEach((slot) => {
      const slug = (slot?.slug || "").trim();
      if (slug) {
        const post = findPinned(slug);
        if (post) result.push(post);
      } else {
        const next = autoQueue.shift();
        if (next) result.push(next);
      }
    });
    return result;
  }, [slots, pool, extra, pinnedSlugs]);

  const handleOpen = (post: BlogPost) => {
    if (onCtaClick) onCtaClick(block.blockType, post.title);
    const path = buildReadMorePath(readMoreLink, post.slug);
    if (path.startsWith("http://") || path.startsWith("https://")) {
      window.location.href = path;
    } else {
      navigate(buildUrl(path));
    }
  };

  const handleCta = () => {
    if (!ctaLink) return;
    if (onCtaClick) onCtaClick(block.blockType, ctaText || "View all");
    if (ctaLink.startsWith("http://") || ctaLink.startsWith("https://")) {
      window.location.href = ctaLink;
    } else {
      navigate(buildUrl(ctaLink));
    }
  };

  const lg = lgWidth(columns);
  const showInitialSkeleton = loading && resolvedPosts.length === 0;
  const isEmpty = !loading && resolvedPosts.length === 0;

  return (
    <Box
      component="section"
      {...blogStaticProps(block.id, "blog-showcase", "Blog section", "container")}
      sx={{
        width: "100%",
        padding: {
          xs: "56px 20px",
          md: "72px 64px",
          lg: "88px 120px",
        },
        position: "relative",
        background: accentSoft,
        borderTop: `1px solid ${accentBorder}`,
        borderBottom: `1px solid ${accentBorder}`,
        fontFamily: blogHeroFont,
        "& .MuiTypography-root, & .MuiButton-root": { fontFamily: blogHeroFont },
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: "auto" }}>
        {/* Header */}
        <Box
          {...blogStaticProps(
            block.id,
            "blog-showcase-header",
            "Section header",
            "container",
          )}
          sx={{ textAlign: "center", maxWidth: 720, mx: "auto", mb: { xs: 4, md: 6 } }}
        >
          {eyebrow && (
            <Typography
              {...blogStaticProps(
                block.id,
                "blog-showcase-eyebrow",
                "Section eyebrow",
                "text",
                "static.blog-showcase-eyebrow",
                "eyebrow",
              )}
              sx={{
                color: accent,
                fontWeight: 700,
                fontSize: "13px",
                letterSpacing: "1.4px",
                textTransform: "uppercase",
                mb: "12px",
              }}
            >
              {eyebrow}
            </Typography>
          )}
          {heading && (
            <Typography
              {...blogStaticProps(
                block.id,
                "blog-showcase-heading",
                "Section heading",
                "text",
                "static.blog-showcase-heading",
                "heading",
              )}
              variant="h3"
              sx={{
                color: "#0f172a",
                fontWeight: 800,
                fontSize: { xs: "28px", md: "38px" },
                lineHeight: 1.15,
                letterSpacing: "-0.6px",
                mb: description ? "14px" : 0,
              }}
            >
              {heading}
            </Typography>
          )}
          {description && (
            <Typography
              {...blogStaticProps(
                block.id,
                "blog-showcase-description",
                "Section description",
                "text",
                "static.blog-showcase-description",
                "description",
              )}
              sx={{
                color: "#475569",
                fontSize: { xs: "15px", md: "17px" },
                lineHeight: 1.7,
              }}
            >
              {description}
            </Typography>
          )}
        </Box>

        {/* Cards */}
        {showInitialSkeleton ? (
          isSplit ? (
            /* Mirrors the feature + list arrangement so nothing shifts on load */
            <Grid container spacing={{ xs: 2, md: 3 }} alignItems="stretch">
              <Grid
                item
                xs={12}
                md={7}
                sx={{
                  display: "flex",
                  height: { xs: "auto", md: SPLIT_ROW_HEIGHT },
                }}
              >
                <BlogSplitCardSkeleton layout="tall" />
              </Grid>
              <Grid
                item
                xs={12}
                md={5}
                sx={{ height: { xs: "auto", md: SPLIT_ROW_HEIGHT } }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: { xs: 2, md: 2 },
                    height: "100%",
                  }}
                >
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Box key={i} sx={{ flex: 1, minHeight: 0 }}>
                      <BlogSplitCardSkeleton layout="row" />
                    </Box>
                  ))}
                </Box>
              </Grid>
            </Grid>
          ) : (
            <Grid container spacing={{ xs: 2, md: 3, lg: 4 }}>
              {slots.map((slot, i) => (
                <Grid item xs={12} sm={6} lg={lg} key={slot._id || i}>
                  <BlogCardSkeleton />
                </Grid>
              ))}
            </Grid>
          )
        ) : isEmpty ? (
          <Box
            {...blogStaticProps(
              block.id,
              "blog-showcase-empty",
              "Empty state",
              "container",
            )}
            sx={{
              textAlign: "center",
              padding: "56px 24px",
              borderRadius: "16px",
              border: `1px dashed ${hexToRgba(accent, 0.35)}`,
              background: "#ffffff",
              color: "#64748b",
            }}
          >
            <Typography variant="h6" sx={{ color: "#334155", fontWeight: 700, mb: 1 }}>
              {emptyMessage}
            </Typography>
            <Typography variant="body2">
              Published blog posts will appear here automatically.
            </Typography>
          </Box>
        ) : isSplit ? (
          /* Feature + list: one large card on the left, three stacked rows right */
          <Grid container spacing={{ xs: 2, md: 3 }} alignItems="stretch">
            <Grid
              item
              xs={12}
              md={resolvedPosts.length > 1 ? 7 : 12}
              sx={{
                display: "flex",
                height: { xs: "auto", md: SPLIT_ROW_HEIGHT },
              }}
            >
              <BlogSplitCard
                post={resolvedPosts[0]}
                layout="tall"
                authorLabel={authorLabel}
                accent={accent}
                onOpen={handleOpen}
                blockId={block.id}
                staticPrefix="blog-showcase-feature"
              />
            </Grid>
            {resolvedPosts.length > 1 && (
              <Grid
                item
                xs={12}
                md={5}
                sx={{ height: { xs: "auto", md: SPLIT_ROW_HEIGHT } }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: { xs: 2, md: 2 },
                    height: "100%",
                  }}
                >
                  {resolvedPosts.slice(1, 4).map((post, index) => (
                    <Box key={post.id ?? index} sx={{ flex: 1, minHeight: 0 }}>
                      <BlogSplitCard
                        post={post}
                        layout="row"
                        authorLabel={authorLabel}
                        accent={accent}
                        onOpen={handleOpen}
                        blockId={block.id}
                        staticPrefix={`blog-showcase-row-${index + 1}`}
                      />
                    </Box>
                  ))}
                </Box>
              </Grid>
            )}
          </Grid>
        ) : (
          <Grid container spacing={{ xs: 2, md: 3, lg: 4 }}>
            {resolvedPosts.map((post, index) => (
              <Grid item xs={12} sm={6} lg={lg} key={post.id ?? index}>
                <BlogInsightCard
                  post={post}
                  authorLabel={authorLabel}
                  accent={accent}
                  onOpen={handleOpen}
                  blockId={block.id}
                  staticPrefix={`blog-showcase-card-${index + 1}`}
                />
              </Grid>
            ))}
          </Grid>
        )}

        {/* Optional CTA */}
        {ctaText && !isEmpty && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: { xs: 4, md: 6 } }}>
            <Button
              {...blogStaticProps(
                block.id,
                "blog-showcase-cta",
                "Section button",
                "text",
                "static.blog-showcase-cta",
                "ctaText",
              )}
              onClick={handleCta}
              endIcon={<ArrowForwardIcon />}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                fontSize: "15px",
                padding: "12px 28px",
                borderRadius: "100px",
                color: "#ffffff",
                background: accent,
                boxShadow: `0 10px 24px ${hexToRgba(accent, 0.28)}`,
                "&:hover": { background: accent, filter: "brightness(0.94)" },
              }}
            >
              {ctaText}
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

BlogShowcaseBlockBase.displayName = "BlogShowcaseBlock";

const BlogShowcaseBlock = React.memo(BlogShowcaseBlockBase);
BlogShowcaseBlock.displayName = "BlogShowcaseBlock";

export default BlogShowcaseBlock;
