/**
 * BlogFeedBlock — Step 2.23.3 + 2.23.4
 *
 * Main renderer component for BLOG_FEED block type.
 * Registered in BlockRenderer.tsx switch statement.
 *
 * Features:
 * - Dynamic data fetching via useDynamicBlockData
 * - Search bar (debounced 300ms)
 * - Category filter chips (fetched from /api/insights/categories)
 * - Grid / List / Featured layouts
 * - MUI Pagination
 * - Blog card click navigation (internal: React Router, external: window.location.href)
 *
 * Performance: React.memo
 * Accessibility: aria-labels, semantic HTML
 * Security: no dangerouslySetInnerHTML
 */

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import useTenantUrl from "../../../hooks/useTenantUrl";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Container,
  Grid,
  InputAdornment,
  Pagination,
  Skeleton,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import useDynamicBlockData from "../../../hooks/useDynamicBlockData";
import BlogCard, {
  type BlogPost,
  type BlogCardConfig,
  type BlogCardColors,
} from "./BlogCard";

/* ===================== Types ===================== */

interface Block {
  id: number;
  blockType: string;
  content: BlogFeedContent;
  sortOrder: number;
}

interface BlogFeedContent {
  heading?: string;
  subheading?: string;
  layout?: "grid" | "list" | "featured";
  columns?: number;
  postsPerPage?: number;
  showSearch?: boolean;
  showCategories?: boolean;
  showPagination?: boolean;
  showAuthor?: boolean;
  showDate?: boolean;
  showExcerpt?: boolean;
  showImage?: boolean;
  excerptLength?: number;
  categoryFilter?: string;
  sortBy?: string;
  sortOrder?: string;
  scope?: string;
  emptyMessage?: string;
  readMoreText?: string;
  readMoreLink?: string;
  // Dynamic data fields (merged in by DynamicBlockInner)
  insights?: BlogPost[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
    hasPrevious: boolean;
  };
}

interface BlogFeedBlockProps {
  block: Block;
  primaryColor?: string;
  secondaryColor?: string;
  headingColor?: string;
  bodyColor?: string;
  onCtaClick?: (blockType: string, ctaText: string) => void;
  onFormSubmit?: (formName: string, success: boolean) => void;
}

/* ===================== Constants ===================== */

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
const DEBOUNCE_MS = 300;

/* ===================== Helpers ===================== */

function buildReadMorePath(
  readMoreLink: string | undefined,
  slug: string,
): string {
  if (!readMoreLink) return `/blog/${slug}`;
  if (readMoreLink.includes("{slug}")) {
    return readMoreLink.replace("{slug}", slug);
  }
  return `/blog/${slug}`;
}

/* ===================== Skeleton ===================== */

const BlogFeedSkeleton: React.FC<{ columns: number }> = React.memo(
  ({ columns }) => {
    const count = Math.min(columns * 3, 9);
    const mdCols = Math.floor(12 / columns) as 1 | 2 | 3 | 4 | 6 | 12;

    return (
      <Container sx={{ py: 6 }}>
        <Skeleton
          variant="text"
          sx={{ fontSize: "2rem", mb: 1, width: "40%", mx: "auto" }}
        />
        <Skeleton
          variant="text"
          sx={{ fontSize: "1rem", mb: 4, width: "60%", mx: "auto" }}
        />
        <Grid container spacing={3}>
          {Array.from({ length: count }).map((_, i) => (
            <Grid item xs={12} sm={6} md={mdCols} key={i}>
              <Skeleton
                variant="rectangular"
                height={250}
                sx={{ borderRadius: 2 }}
              />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  },
);

BlogFeedSkeleton.displayName = "BlogFeedSkeleton";

/* ===================== Main Component ===================== */

const BlogFeedBlockBase: React.FC<BlogFeedBlockProps> = ({
  block,
  primaryColor = "#378C92",
  headingColor = "#252525",
  bodyColor = "#6A6F78",
  onCtaClick,
}) => {
  const { content } = block;

  const {
    heading = "",
    subheading = "",
    layout = "grid",
    columns = 3,
    postsPerPage = 9,
    showSearch = true,
    showCategories = true,
    showPagination = true,
    showAuthor = true,
    showDate = true,
    showExcerpt = true,
    showImage = true,
    excerptLength = 150,
    sortBy = "publishedAt",
    sortOrder: configSortOrder = "desc",
    emptyMessage = "No articles found.",
    readMoreText = "Read More",
    readMoreLink = "/blog/{slug}",
  } = content;

  /* --- Local state --- */
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState<string[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  /* --- Debounce search --- */
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchQuery(value);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        setDebouncedSearch(value);
        setCurrentPage(1);
      }, DEBOUNCE_MS);
    },
    [],
  );

  /* --- Dynamic data source (query string) --- */
  const dataSource = useMemo(() => {
    const params = new URLSearchParams({
      page: String(currentPage),
      limit: String(postsPerPage),
      sortBy,
      sortOrder: configSortOrder,
    });
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (selectedCategory) params.set("category", selectedCategory);
    return `blog?${params.toString()}`;
  }, [
    currentPage,
    postsPerPage,
    sortBy,
    configSortOrder,
    debouncedSearch,
    selectedCategory,
  ]);

  /* --- Fetch data via useDynamicBlockData --- */
  const { data, loading, error } = useDynamicBlockData(
    block.id,
    block.blockType,
    dataSource,
  );

  /* --- Resolve posts and pagination from data or content (initial SSR) --- */
  const posts: BlogPost[] = useMemo(() => {
    if (data?.insights) return data.insights;
    if (content.insights) return content.insights;
    return [];
  }, [data, content.insights]);

  const pagination = useMemo(() => {
    if (data?.pagination) return data.pagination;
    if (content.pagination) return content.pagination;
    return null;
  }, [data, content.pagination]);

  /* --- Fetch categories --- */
  useEffect(() => {
    if (!showCategories) return;
    let cancelled = false;
    setCategoriesLoading(true);
    fetch(`${API_URL}/insights/categories`)
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled && json.categories) {
          setCategories(json.categories);
        }
      })
      .catch(() => {
        // Silently ignore category fetch errors
      })
      .finally(() => {
        if (!cancelled) setCategoriesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [showCategories]);

  /* --- Cleanup debounce on unmount --- */
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  /* --- Navigation --- */
  const navigate = useNavigate();
  const { buildUrl } = useTenantUrl();

  const handleCardClick = useCallback(
    (post: BlogPost) => {
      // Fire analytics callback
      if (onCtaClick) {
        onCtaClick(block.blockType, post.title);
      }

      const path = buildReadMorePath(readMoreLink, post.slug);

      // External links (http/https) use window.location.href
      if (path.startsWith("http://") || path.startsWith("https://")) {
        window.location.href = path;
      } else {
        navigate(buildUrl(path));
      }
    },
    [navigate, buildUrl, onCtaClick, block.blockType, readMoreLink],
  );

  /* --- Category chip click --- */
  const handleCategoryClick = useCallback((category: string) => {
    setSelectedCategory((prev) => (prev === category ? "" : category));
    setCurrentPage(1);
  }, []);

  /* --- Page change --- */
  const handlePageChange = useCallback(
    (_: React.ChangeEvent<unknown>, page: number) => {
      setCurrentPage(page);
    },
    [],
  );

  /* --- Config for BlogCard --- */
  const cardConfig: BlogCardConfig = useMemo(
    () => ({
      showImage,
      showAuthor,
      showDate,
      showExcerpt,
      excerptLength,
      readMoreText,
      readMoreLink,
    }),
    [
      showImage,
      showAuthor,
      showDate,
      showExcerpt,
      excerptLength,
      readMoreText,
      readMoreLink,
    ],
  );

  const cardColors: BlogCardColors = useMemo(
    () => ({ primaryColor, headingColor, bodyColor }),
    [primaryColor, headingColor, bodyColor],
  );

  /* --- Responsive grid columns --- */
  const mdCols = useMemo(
    () => Math.floor(12 / columns) as 1 | 2 | 3 | 4 | 6 | 12,
    [columns],
  );

  /* --- Render --- */

  // Loading state
  if (loading && !posts.length) {
    return <BlogFeedSkeleton columns={columns} />;
  }

  // Error state
  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error" role="alert">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Box
      component="section"
      aria-label={heading || "Blog Feed"}
      sx={{ py: 8, bgcolor: "background.default" }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        {(heading || subheading) && (
          <Box sx={{ textAlign: "center", mb: 4 }}>
            {heading && (
              <Typography
                variant="h3"
                component="h2"
                gutterBottom
                sx={{ fontWeight: 700, color: headingColor }}
              >
                {heading}
              </Typography>
            )}
            {subheading && (
              <Typography
                variant="h6"
                sx={{
                  color: bodyColor,
                  fontWeight: 400,
                  maxWidth: 600,
                  mx: "auto",
                }}
              >
                {subheading}
              </Typography>
            )}
          </Box>
        )}

        {/* Search Bar */}
        {showSearch && (
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={handleSearchChange}
              inputProps={{ "aria-label": "Search articles" }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: bodyColor }} />
                  </InputAdornment>
                ),
              }}
              sx={{ maxWidth: 480, display: "block", mx: "auto" }}
            />
          </Box>
        )}

        {/* Category Filter */}
        {showCategories && (categories.length > 0 || categoriesLoading) && (
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              justifyContent: "center",
              mb: 3,
            }}
            role="group"
            aria-label="Category filter"
          >
            {categoriesLoading ? (
              <CircularProgress size={20} />
            ) : (
              categories.map((cat) => (
                <Chip
                  key={cat}
                  label={cat}
                  clickable
                  variant={selectedCategory === cat ? "filled" : "outlined"}
                  onClick={() => handleCategoryClick(cat)}
                  aria-pressed={selectedCategory === cat}
                  sx={{
                    borderColor: primaryColor,
                    color: selectedCategory === cat ? "white" : primaryColor,
                    bgcolor:
                      selectedCategory === cat ? primaryColor : "transparent",
                    "&:hover": {
                      bgcolor:
                        selectedCategory === cat
                          ? primaryColor
                          : `${primaryColor}1A`,
                    },
                  }}
                />
              ))
            )}
          </Box>
        )}

        {/* Loading indicator for subsequent loads (search/filter/page change) */}
        {loading && posts.length > 0 && (
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {/* Posts Grid */}
        {posts.length === 0 ? (
          <Box
            sx={{ textAlign: "center", py: 8 }}
            role="status"
            aria-label="No posts found"
          >
            <Typography variant="body1" sx={{ color: bodyColor }}>
              {emptyMessage}
            </Typography>
          </Box>
        ) : layout === "featured" ? (
          /* Featured Layout: first post large + rest in grid */
          <Box>
            {posts[0] && (
              <Box sx={{ mb: 3 }}>
                <BlogCard
                  post={posts[0]}
                  config={cardConfig}
                  colors={cardColors}
                  onClick={handleCardClick}
                />
              </Box>
            )}
            {posts.length > 1 && (
              <Grid container spacing={3}>
                {posts.slice(1).map((post) => (
                  <Grid item xs={12} sm={6} md={mdCols} key={post.id}>
                    <BlogCard
                      post={post}
                      config={cardConfig}
                      colors={cardColors}
                      onClick={handleCardClick}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        ) : layout === "list" ? (
          /* List Layout: single column stacked */
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {posts.map((post) => (
              <BlogCard
                key={post.id}
                post={post}
                config={cardConfig}
                colors={cardColors}
                onClick={handleCardClick}
              />
            ))}
          </Box>
        ) : (
          /* Grid Layout (default) */
          <Grid container spacing={3}>
            {posts.map((post) => (
              <Grid item xs={12} sm={6} md={mdCols} key={post.id}>
                <BlogCard
                  post={post}
                  config={cardConfig}
                  colors={cardColors}
                  onClick={handleCardClick}
                />
              </Grid>
            ))}
          </Grid>
        )}

        {/* Pagination */}
        {showPagination && pagination && pagination.totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <Pagination
              count={pagination.totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              aria-label="Blog pagination"
            />
          </Box>
        )}
      </Container>
    </Box>
  );
};

BlogFeedBlockBase.displayName = "BlogFeedBlock";

const BlogFeedBlock = React.memo(BlogFeedBlockBase);
BlogFeedBlock.displayName = "BlogFeedBlock";

export default BlogFeedBlock;
