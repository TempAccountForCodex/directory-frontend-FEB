/**
 * BlogGridBlock — BLOG_GRID
 *
 * The smaller-card grid from the public /blog page, as a standalone movable
 * block: search bar + category filter pills + paginated card grid. Owns all the
 * blog filtering UI (the BLOG_HERO block above it is purely presentational).
 * Website-scoped via useDynamicBlockData (`blog` datasource).
 */

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  InputAdornment,
  Pagination,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import useTenantUrl from "../../../hooks/useTenantUrl";
import useDynamicBlockData from "../../../hooks/useDynamicBlockData";
import { API_URL } from "@/config/api";
import type { BlogPost } from "./BlogCard";
import {
  BlogInsightCard,
  BlogCardSkeleton,
  blogHeroFont,
  blogStaticProps,
  resolveAccent,
  hexToRgba,
} from "./blogSectionShared";

const DEBOUNCE_MS = 300;

interface BlogGridContent {
  heading?: string;
  columns?: number;
  postsPerPage?: number;
  showSearch?: boolean;
  showCategories?: boolean;
  showPagination?: boolean;
  authorLabel?: string;
  sortBy?: string;
  sortOrder?: string;
  emptyMessage?: string;
  readMoreLink?: string;
}

interface Block {
  id: number;
  blockType: string;
  content: BlogGridContent;
  sortOrder: number;
}

interface BlogGridBlockProps {
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

const BlogGridBlockBase: React.FC<BlogGridBlockProps> = ({
  block,
  websiteId,
  primaryColor,
  onCtaClick,
}) => {
  const accent = resolveAccent(primaryColor);
  const accentSoft = hexToRgba(accent, 0.1);
  const {
    heading = "",
    columns = 3,
    postsPerPage = 9,
    showSearch = true,
    showCategories = true,
    showPagination = true,
    authorLabel,
    sortBy = "publishedAt",
    sortOrder: configSortOrder = "desc",
    emptyMessage = "No articles found in this category yet.",
    readMoreLink = "/blog/{slug}",
  } = block.content || {};

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState<string[]>([]);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  useEffect(
    () => () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    },
    [],
  );

  /* --- Data source --- */
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

  const { data, loading } = useDynamicBlockData(
    block.id,
    block.blockType,
    dataSource,
    { websiteId },
  );

  const posts: BlogPost[] = useMemo(() => {
    if (Array.isArray(data?.blogs)) return data.blogs;
    if (Array.isArray(data?.insights)) return data.insights;
    return [];
  }, [data]);

  const pagination = data?.pagination ?? null;

  /* --- Categories (website-scoped when in a tenant site) --- */
  useEffect(() => {
    if (!showCategories) return;
    let cancelled = false;
    const url = websiteId
      ? `${API_URL}/websites/${websiteId}/blogs/public/categories`
      : `${API_URL}/insights/categories`;
    fetch(url)
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled && Array.isArray(json.categories)) {
          setCategories(json.categories);
        }
      })
      .catch(() => {
        /* silently ignore */
      });
    return () => {
      cancelled = true;
    };
  }, [showCategories, websiteId]);

  const navigate = useNavigate();
  const { buildUrl } = useTenantUrl();

  const handleOpen = useCallback(
    (post: BlogPost) => {
      if (onCtaClick) onCtaClick(block.blockType, post.title);
      const path = buildReadMorePath(readMoreLink, post.slug);
      if (path.startsWith("http://") || path.startsWith("https://")) {
        window.location.href = path;
      } else {
        navigate(buildUrl(path));
      }
    },
    [navigate, buildUrl, onCtaClick, block.blockType, readMoreLink],
  );

  const handleCategoryClick = useCallback((category: string) => {
    setSelectedCategory((prev) => (prev === category ? "" : category));
    setCurrentPage(1);
  }, []);

  const lgCols = useMemo(
    () => (Math.floor(12 / columns) as 1 | 2 | 3 | 4 | 6 | 12) || 4,
    [columns],
  );

  const categoryOptions = useMemo(() => ["All", ...categories], [categories]);
  const showInitialSkeleton = loading && posts.length === 0;

  return (
    <Box
      component="section"
      sx={{
        width: "100%",
        padding: {
          xs: "24px 20px 64px",
          md: "28px 96px 76px",
          lg: "32px 200px 90px",
        },
        position: "relative",
        isolation: "isolate",
        overflow: "hidden",
        backgroundColor: "#f7f5f3",
        fontFamily: blogHeroFont,
        "& .MuiTypography-root, & .MuiButton-root": { fontFamily: blogHeroFont },
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
      <Box sx={{ position: "relative", zIndex: 1 }}>
        {heading && (
          <Typography
            {...blogStaticProps(block.id, "blog-grid-heading", "Blog grid heading")}
            variant="h4"
            sx={{
              fontWeight: 700,
              color: "#0f172a",
              mb: "20px",
              letterSpacing: "-0.4px",
              fontSize: { xs: "22px", md: "26px" },
            }}
          >
            {heading}
          </Typography>
        )}

        {/* Search */}
        {showSearch && (
          <Box
            {...blogStaticProps(block.id, "blog-grid-search", "Blog search field", "container")}
            sx={{ mb: "20px", maxWidth: 520 }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={handleSearchChange}
              inputProps={{ "aria-label": "Search articles" }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#64748b" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#ffffff",
                  borderRadius: "100px",
                  "& fieldset": { borderColor: "#d7e2ec" },
                  "&:hover fieldset": { borderColor: accent },
                  "&.Mui-focused fieldset": { borderColor: accent },
                },
              }}
            />
          </Box>
        )}

        {/* Category filter pills */}
        {showCategories && categories.length > 0 && (
          <Box
            {...blogStaticProps(block.id, "blog-grid-categories", "Blog category filters", "container")}
            sx={{ display: "flex", flexWrap: "wrap", gap: "8px", mb: "28px" }}
            role="group"
            aria-label="Category filter"
          >
            {categoryOptions.map((category) => {
              const isActive =
                category === "All"
                  ? selectedCategory === ""
                  : selectedCategory === category;
              return (
                <Button
                  key={category}
                  variant="outlined"
                  onClick={() =>
                    handleCategoryClick(category === "All" ? "" : category)
                  }
                  aria-pressed={isActive}
                  sx={{
                    padding: "6px 18px",
                    borderRadius: "100px",
                    fontSize: "13px",
                    fontWeight: 600,
                    textTransform: "none",
                    border: isActive
                      ? `1.5px solid ${accent}`
                      : "1.5px solid #d7e2ec",
                    background: isActive ? accentSoft : "#ffffff",
                    color: isActive ? accent : "#475569",
                    "&:hover": {
                      borderColor: accent,
                      background: accentSoft,
                      color: accent,
                    },
                  }}
                >
                  {category}
                </Button>
              );
            })}
          </Box>
        )}

        {/* Subsequent-load spinner */}
        {loading && posts.length > 0 && (
          <Box sx={{ display: "flex", justifyContent: "center", mb: "16px" }}>
            <CircularProgress size={24} sx={{ color: accent }} />
          </Box>
        )}

        {/* Grid */}
        {showInitialSkeleton ? (
          <Grid container spacing={{ xs: 2, md: 3, lg: 4 }}>
            {Array.from({ length: Math.min(postsPerPage, 6) }).map((_, i) => (
              <Grid item xs={12} sm={6} lg={lgCols} key={i}>
                <BlogCardSkeleton />
              </Grid>
            ))}
          </Grid>
        ) : posts.length === 0 ? (
          <Box sx={{ textAlign: "center", padding: "80px 0", color: "#64748b" }}>
            <Typography variant="h6">{emptyMessage}</Typography>
          </Box>
        ) : (
          <Grid container spacing={{ xs: 2, md: 3, lg: 4 }}>
            {posts.map((post, index) => (
              <Grid item xs={12} sm={6} lg={lgCols} key={post.id}>
                <BlogInsightCard
                  post={post}
                  authorLabel={authorLabel}
                  accent={accent}
                  onOpen={handleOpen}
                  blockId={block.id}
                  staticPrefix={`blog-card-${index + 1}`}
                />
              </Grid>
            ))}
          </Grid>
        )}

        {/* Pagination */}
        {showPagination && pagination && pagination.totalPages > 1 && (
          <Box
            {...blogStaticProps(block.id, "blog-grid-pagination", "Blog pagination", "container")}
            sx={{ display: "flex", justifyContent: "center", mt: "40px" }}
          >
            <Pagination
              count={pagination.totalPages}
              page={currentPage}
              onChange={(_, page) => setCurrentPage(page)}
              aria-label="Blog pagination"
              sx={{
                "& .Mui-selected": {
                  backgroundColor: `${accent} !important`,
                  color: "#ffffff",
                },
              }}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

BlogGridBlockBase.displayName = "BlogGridBlock";

const BlogGridBlock = React.memo(BlogGridBlockBase);
BlogGridBlock.displayName = "BlogGridBlock";

export default BlogGridBlock;
