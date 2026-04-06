/**
 * BlogArticleBlock — Step 2.24.2 + 2.24.3
 *
 * Renders a single full blog post with:
 * - Back navigation button
 * - Hero image with gradient overlay
 * - Meta bar (category, author, date, reading time)
 * - Table of contents (auto-generated from headings array, sticky sidebar on desktop)
 * - Article body (headings array rendered as h2 + description paragraphs)
 * - Related posts (BlogCard components, same category)
 *
 * Post identifier resolution:
 *   - If postIdentifier is set in config → use it
 *   - Otherwise read slug from URL via useParams
 *
 * Reading time: Math.ceil(totalWordCount / 200)
 *
 * SEO: uses BlogArticleSeoContext to communicate loaded post data to PublicWebsite page.
 *
 * Performance: React.memo, useMemo, useCallback
 * Security: DOMPurify on all user content, javascript: rejected on all links
 * Accessibility: semantic HTML, aria-labels
 */

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useContext,
  createContext,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Grid,
  Link,
  Skeleton,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DOMPurify from "dompurify";
import useTenantUrl from "../../../hooks/useTenantUrl";
import useDynamicBlockData from "../../../hooks/useDynamicBlockData";
import BlogCard, {
  type BlogPost,
  type BlogCardConfig,
  type BlogCardColors,
} from "./BlogCard";

/* ===================== SEO Context ===================== */

export interface BlogArticleSeoData {
  title?: string;
  description?: string;
  image?: string;
  keywords?: string;
  publishedAt?: string;
  authorName?: string;
  canonicalUrl?: string;
  category?: string;
  slug?: string;
}

export interface BlogArticleSeoContextType {
  seoData: BlogArticleSeoData | null;
  setSeoData: (data: BlogArticleSeoData | null) => void;
}

export const BlogArticleSeoContext =
  createContext<BlogArticleSeoContextType | null>(null);

/* ===================== Types ===================== */

interface ArticleHeading {
  heading: string;
  description?: string[];
}

interface ArticlePost {
  id: number | string;
  title: string;
  slug: string;
  image?: string | null;
  category?: string | null;
  description?: string | null;
  headings?: ArticleHeading[];
  author?: { name: string } | null;
  publishedAt?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  keywords?: string | null;
  canonicalUrl?: string | null;
}

interface Block {
  id: number;
  blockType: string;
  content: BlogArticleContent;
  sortOrder: number;
}

interface BlogArticleContent {
  postIdentifier?: string;
  layout?: "standard" | "magazine" | "minimal";
  showAuthor?: boolean;
  showDate?: boolean;
  showImage?: boolean;
  showCategory?: boolean;
  showRelated?: boolean;
  relatedCount?: number;
  showTableOfContents?: boolean;
  showBackButton?: boolean;
  backButtonText?: string;
  backButtonLink?: string;
  // Resolved from dynamic data fetch
  post?: ArticlePost;
  relatedPosts?: BlogPost[];
}

interface BlogArticleBlockProps {
  block: Block;
  primaryColor?: string;
  secondaryColor?: string;
  headingColor?: string;
  bodyColor?: string;
  onCtaClick?: (blockType: string, ctaText: string) => void;
}

/* ===================== Constants ===================== */

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
const WORDS_PER_MINUTE = 200;

/* ===================== Helpers ===================== */

/**
 * Validate that a URL is safe (no javascript: protocol).
 * Returns the URL or a fallback if invalid.
 */
function safeUrl(url: string | undefined, fallback: string): string {
  if (!url) return fallback;
  const trimmed = url.trim().toLowerCase();
  if (trimmed.startsWith("javascript:")) return fallback;
  return url;
}

/**
 * Format a date string to locale string.
 */
function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

/**
 * Calculate reading time from headings array.
 * Counts words in all heading titles and descriptions.
 */
function calcReadingTime(
  headings: ArticleHeading[] | undefined,
  description: string | null | undefined,
): number {
  let wordCount = 0;
  if (headings && Array.isArray(headings)) {
    for (const h of headings) {
      if (h.heading) {
        wordCount += h.heading.trim().split(/\s+/).filter(Boolean).length;
      }
      if (Array.isArray(h.description)) {
        for (const d of h.description) {
          if (d) wordCount += d.trim().split(/\s+/).filter(Boolean).length;
        }
      }
    }
  }
  if (description) {
    wordCount += description.trim().split(/\s+/).filter(Boolean).length;
  }
  return Math.ceil(wordCount / WORDS_PER_MINUTE) || 1;
}

/**
 * Generate a slug-style anchor ID from a heading string.
 */
function headingToAnchor(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

/**
 * Sanitize text using DOMPurify (allows no HTML tags — plain text only).
 * Prevents XSS from user-generated content.
 */
function sanitizeText(text: string | null | undefined): string {
  if (!text) return "";
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}

/* ===================== Skeleton ===================== */

const BlogArticleSkeleton: React.FC = React.memo(() => (
  <Container maxWidth="lg" sx={{ py: 6 }}>
    <Skeleton variant="text" sx={{ fontSize: "1rem", width: 120, mb: 3 }} />
    <Skeleton
      variant="rectangular"
      height={400}
      sx={{ borderRadius: 2, mb: 4 }}
    />
    <Grid container spacing={4}>
      <Grid item xs={12} md={8}>
        <Skeleton variant="text" sx={{ fontSize: "2.5rem", mb: 1 }} />
        <Skeleton
          variant="text"
          sx={{ fontSize: "1rem", width: "60%", mb: 3 }}
        />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} variant="text" sx={{ fontSize: "1rem", mb: 1 }} />
        ))}
      </Grid>
      <Grid item xs={12} md={4}>
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 1 }} />
      </Grid>
    </Grid>
  </Container>
));

BlogArticleSkeleton.displayName = "BlogArticleSkeleton";

/* ===================== Table of Contents ===================== */

interface TocItem {
  id: string;
  heading: string;
}

interface TocProps {
  items: TocItem[];
  primaryColor: string;
}

const TableOfContents: React.FC<TocProps> = React.memo(
  ({ items, primaryColor }) => {
    if (!items.length) return null;

    const handleTocClick = (
      e: React.MouseEvent<HTMLAnchorElement>,
      id: string,
    ) => {
      e.preventDefault();
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };

    return (
      <Box
        component="nav"
        aria-label="Table of contents"
        sx={{
          position: { md: "sticky" },
          top: { md: 80 },
          bgcolor: "grey.50",
          borderRadius: 2,
          p: 3,
          border: "1px solid",
          borderColor: "grey.200",
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            mb: 2,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "text.secondary",
          }}
        >
          Table of Contents
        </Typography>
        <Box component="ol" sx={{ listStyle: "none", m: 0, p: 0 }}>
          {items.map((item, idx) => (
            <Box component="li" key={item.id} sx={{ mb: 0.75 }}>
              <Link
                href={`#${item.id}`}
                onClick={(e) => handleTocClick(e, item.id)}
                sx={{
                  color: primaryColor,
                  textDecoration: "none",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 1,
                  "&:hover": { textDecoration: "underline" },
                }}
                aria-label={`Jump to section: ${item.heading}`}
              >
                <Box
                  component="span"
                  sx={{
                    color: "text.disabled",
                    minWidth: 20,
                    fontSize: "0.8rem",
                    pt: 0.1,
                  }}
                >
                  {idx + 1}.
                </Box>
                {item.heading}
              </Link>
            </Box>
          ))}
        </Box>
      </Box>
    );
  },
);

TableOfContents.displayName = "TableOfContents";

/* ===================== Main Component ===================== */

const BlogArticleBlockBase: React.FC<BlogArticleBlockProps> = ({
  block,
  primaryColor = "#378C92",
  headingColor = "#252525",
  bodyColor = "#6A6F78",
  onCtaClick,
}) => {
  const { content } = block;
  const urlParams = useParams<Record<string, string>>();
  const navigate = useNavigate();
  const { buildUrl } = useTenantUrl();
  const seoContext = useContext(BlogArticleSeoContext);

  const {
    postIdentifier: configPostIdentifier = "",
    layout = "standard",
    showAuthor = true,
    showDate = true,
    showImage = true,
    showCategory = true,
    showRelated = true,
    relatedCount = 3,
    showTableOfContents = true,
    showBackButton = true,
    backButtonText = "Back to Blog",
    backButtonLink = "/blog",
  } = content;

  /* --- Resolve post identifier (config or URL slug) --- */
  const resolvedIdentifier = useMemo(() => {
    if (configPostIdentifier) return configPostIdentifier;
    // Try common URL params: slug, id, articleSlug, postSlug
    return (
      urlParams.slug ||
      urlParams.id ||
      urlParams.articleSlug ||
      urlParams.postSlug ||
      ""
    );
  }, [configPostIdentifier, urlParams]);

  /* --- Related posts state --- */
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const relatedFetchedRef = useRef(false);

  /* --- Fetch article data via useDynamicBlockData --- */
  const dataSource = useMemo(() => {
    if (!resolvedIdentifier) return null;
    return `blog-article?identifier=${encodeURIComponent(resolvedIdentifier)}`;
  }, [resolvedIdentifier]);

  const { data, loading, error, refresh } = useDynamicBlockData(
    block.id,
    block.blockType,
    dataSource,
  );

  /* --- Resolve post from data or prefetched SSR content --- */
  const post: ArticlePost | null = useMemo(() => {
    if (data?.post) return data.post as ArticlePost;
    if (content.post) return content.post as ArticlePost;
    return null;
  }, [data, content.post]);

  /* --- Compute reading time --- */
  const readingTime = useMemo(() => {
    if (!post) return 1;
    return calcReadingTime(post.headings, post.description);
  }, [post]);

  /* --- Build TOC items from headings --- */
  const tocItems: TocItem[] = useMemo(() => {
    if (!post?.headings || !Array.isArray(post.headings)) return [];
    return post.headings
      .filter((h) => h.heading && typeof h.heading === "string")
      .map((h) => ({
        id: headingToAnchor(h.heading),
        heading: sanitizeText(h.heading),
      }));
  }, [post]);

  /* --- Fetch related posts once post.category is known --- */
  useEffect(() => {
    if (!showRelated || !post?.category || relatedFetchedRef.current) return;
    relatedFetchedRef.current = true;

    let cancelled = false;
    const fetchRelated = async () => {
      try {
        const params = new URLSearchParams({
          category: post.category!,
          limit: String(relatedCount),
        });
        const res = await fetch(
          `${API_URL}/insights/public?${params.toString()}`,
        );
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled && Array.isArray(json.insights)) {
          // Exclude the current post
          const filtered = json.insights.filter(
            (p: BlogPost) =>
              String(p.id) !== String(post.id) && p.slug !== post.slug,
          );
          setRelatedPosts(filtered.slice(0, relatedCount));
        }
      } catch {
        // Silently ignore related posts fetch errors
      }
    };

    fetchRelated();
    return () => {
      cancelled = true;
    };
  }, [post?.category, post?.id, post?.slug, showRelated, relatedCount]);

  /* --- Sync SEO data via context --- */
  useEffect(() => {
    if (!seoContext || !post) return;
    seoContext.setSeoData({
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.description || undefined,
      image: post.image || undefined,
      keywords: post.keywords || undefined,
      publishedAt: post.publishedAt || undefined,
      authorName: post.author?.name,
      canonicalUrl: post.canonicalUrl || undefined,
      category: post.category || undefined,
      slug: post.slug,
    });
    return () => {
      seoContext.setSeoData(null);
    };
  }, [post, seoContext]);

  /* --- Handlers --- */
  const handleRetry = useCallback(() => {
    refresh();
  }, [refresh]);

  const handleBackClick = useCallback(() => {
    if (onCtaClick) onCtaClick(block.blockType, backButtonText);
    const safeLinkUrl = safeUrl(backButtonLink, "/blog");
    if (
      safeLinkUrl.startsWith("http://") ||
      safeLinkUrl.startsWith("https://")
    ) {
      window.location.href = safeLinkUrl;
    } else if (safeLinkUrl.startsWith("/")) {
      navigate(buildUrl(safeLinkUrl));
    } else {
      window.history.back();
    }
  }, [
    navigate,
    buildUrl,
    onCtaClick,
    block.blockType,
    backButtonText,
    backButtonLink,
  ]);

  const handleRelatedCardClick = useCallback(
    (relPost: BlogPost) => {
      navigate(buildUrl(`/blog/${encodeURIComponent(relPost.slug)}`));
    },
    [navigate, buildUrl],
  );

  /* --- Config for BlogCard --- */
  const relatedCardConfig: BlogCardConfig = useMemo(
    () => ({
      showImage: true,
      showAuthor: true,
      showDate: true,
      showExcerpt: true,
      excerptLength: 100,
      readMoreText: "Read Article",
    }),
    [],
  );

  const relatedCardColors: BlogCardColors = useMemo(
    () => ({ primaryColor, headingColor, bodyColor }),
    [primaryColor, headingColor, bodyColor],
  );

  /* ---- Render states ---- */

  if (loading && !post) {
    return <BlogArticleSkeleton />;
  }

  if (error && !post) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert
          severity="error"
          role="alert"
          action={
            <Button color="inherit" size="small" onClick={handleRetry}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Container>
    );
  }

  if (!post) {
    return (
      <Container sx={{ py: 8 }}>
        <Alert severity="info">
          {resolvedIdentifier
            ? "Article not found."
            : "No post identifier provided. Set the Post Identifier in block settings or navigate to a blog post URL."}
        </Alert>
      </Container>
    );
  }

  const formattedDate = formatDate(post.publishedAt);
  const isMinimal = layout === "minimal";
  const isMagazine = layout === "magazine";

  /* ---- Hero Image ---- */
  const heroImage =
    showImage && post.image && !isMinimal ? (
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: isMagazine
            ? { xs: 280, sm: 400, md: 520 }
            : { xs: 200, sm: 300, md: 380 },
          overflow: "hidden",
          borderRadius: isMagazine ? 0 : 2,
          mb: 4,
        }}
      >
        <Box
          component="img"
          src={post.image}
          alt={sanitizeText(post.title)}
          loading="lazy"
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
        {/* Gradient overlay */}
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "60%",
            background:
              "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)",
          }}
        />
      </Box>
    ) : null;

  /* ---- Meta bar ---- */
  const metaBar = (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 2,
        alignItems: "center",
        mb: 3,
      }}
      aria-label="Article metadata"
    >
      {showCategory && post.category && (
        <Chip
          label={sanitizeText(post.category)}
          size="small"
          sx={{
            bgcolor: `${primaryColor}1A`,
            color: primaryColor,
            fontWeight: 600,
            fontSize: "0.75rem",
          }}
        />
      )}
      {showAuthor && post.author?.name && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <PersonIcon sx={{ fontSize: "0.9rem", color: bodyColor }} />
          <Typography variant="caption" sx={{ color: bodyColor }}>
            {sanitizeText(post.author.name)}
          </Typography>
        </Box>
      )}
      {showDate && formattedDate && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <CalendarTodayIcon sx={{ fontSize: "0.9rem", color: bodyColor }} />
          <Typography variant="caption" sx={{ color: bodyColor }}>
            <time dateTime={post.publishedAt || ""}>{formattedDate}</time>
          </Typography>
        </Box>
      )}
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <AccessTimeIcon sx={{ fontSize: "0.9rem", color: bodyColor }} />
        <Typography variant="caption" sx={{ color: bodyColor }}>
          {readingTime} min read
        </Typography>
      </Box>
    </Box>
  );

  /* ---- Article body sections ---- */
  const articleBody = (
    <Box component="article" aria-label={sanitizeText(post.title)}>
      {post.headings &&
      Array.isArray(post.headings) &&
      post.headings.length > 0 ? (
        post.headings.map((section, idx) => {
          if (!section.heading) return null;
          const anchorId = headingToAnchor(section.heading);
          const safeHeading = sanitizeText(section.heading);

          return (
            <Box component="section" key={idx} sx={{ mb: 4 }}>
              <Typography
                id={anchorId}
                variant="h5"
                component="h2"
                sx={{
                  color: headingColor,
                  fontWeight: 700,
                  mb: 2,
                  scrollMarginTop: "80px",
                  fontSize: { xs: "1.25rem", md: "1.5rem" },
                }}
              >
                {safeHeading}
              </Typography>
              {Array.isArray(section.description) &&
                section.description.map((para, pIdx) => {
                  if (!para) return null;
                  const safePara = sanitizeText(para);
                  return (
                    <Typography
                      key={pIdx}
                      variant="body1"
                      component="p"
                      sx={{
                        color: bodyColor,
                        lineHeight: 1.8,
                        mb: 2,
                        fontSize: "1rem",
                      }}
                    >
                      {safePara}
                    </Typography>
                  );
                })}
            </Box>
          );
        })
      ) : post.description ? (
        /* Fallback: render description as a single paragraph if no headings */
        <Typography
          variant="body1"
          sx={{ color: bodyColor, lineHeight: 1.8, fontSize: "1rem" }}
        >
          {sanitizeText(post.description)}
        </Typography>
      ) : null}
    </Box>
  );

  /* ---- Related posts ---- */
  const relatedSection =
    showRelated && relatedPosts.length > 0 ? (
      <Box component="aside" aria-label="Related articles" sx={{ mt: 6 }}>
        <Divider sx={{ mb: 4 }} />
        <Typography
          variant="h5"
          component="h2"
          sx={{ fontWeight: 700, color: headingColor, mb: 3 }}
        >
          Related Articles
        </Typography>
        <Grid container spacing={3}>
          {relatedPosts.map((relPost) => (
            <Grid item xs={12} sm={6} md={4} key={relPost.id}>
              <BlogCard
                post={relPost}
                config={relatedCardConfig}
                colors={relatedCardColors}
                onClick={handleRelatedCardClick}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    ) : null;

  /* ---- Standard / Magazine Layout ---- */
  const mainContent = (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Back Button */}
      {showBackButton && (
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBackClick}
            sx={{ color: primaryColor, fontWeight: 600 }}
            aria-label={backButtonText}
          >
            {sanitizeText(backButtonText)}
          </Button>
        </Box>
      )}

      {/* Hero Image (non-magazine, inside container) */}
      {!isMagazine && heroImage}

      {/* Post Title */}
      <Typography
        variant="h3"
        component="h1"
        sx={{
          fontWeight: 800,
          color: headingColor,
          mb: 2,
          lineHeight: 1.2,
          fontSize: { xs: "1.75rem", sm: "2.25rem", md: "2.75rem" },
        }}
      >
        {sanitizeText(post.title)}
      </Typography>

      {/* Meta bar */}
      {metaBar}

      {/* Standard: two-column (article + TOC sidebar), Magazine/Minimal: full-width */}
      {layout === "standard" && showTableOfContents && tocItems.length > 0 ? (
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            {articleBody}
            {relatedSection}
          </Grid>
          <Grid item xs={12} md={4}>
            <TableOfContents items={tocItems} primaryColor={primaryColor} />
          </Grid>
        </Grid>
      ) : (
        <>
          {/* TOC at top for non-standard layouts */}
          {showTableOfContents && tocItems.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <TableOfContents items={tocItems} primaryColor={primaryColor} />
            </Box>
          )}
          {articleBody}
          {relatedSection}
        </>
      )}
    </Container>
  );

  return (
    <Box
      component="main"
      aria-label={`Blog article: ${sanitizeText(post.title)}`}
      sx={{ bgcolor: "background.default", minHeight: "60vh" }}
    >
      {/* Magazine: hero spans full width outside container */}
      {isMagazine && heroImage}
      {mainContent}
    </Box>
  );
};

BlogArticleBlockBase.displayName = "BlogArticleBlock";

const BlogArticleBlock = React.memo(BlogArticleBlockBase);
BlogArticleBlock.displayName = "BlogArticleBlock";

export default BlogArticleBlock;
