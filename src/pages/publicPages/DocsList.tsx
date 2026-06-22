/**
 * DocsList — Clerk-style category index (dark, self-contained) at
 * /docs/category/:category.
 *
 * Breadcrumbs, category heading, an in-page filter, and a clean list of article
 * rows. Fetches from GET /api/docs?category=&page= with a static-seed fallback.
 * Colors come from the explicit docs palette, not the app theme.
 */

import React, { memo, useState, useEffect, useCallback, useMemo } from "react";
import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Skeleton from "@mui/material/Skeleton";
import Alert from "@mui/material/Alert";
import Pagination from "@mui/material/Pagination";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import { Search as SearchIcon, ChevronRight, ArrowRight } from "lucide-react";
import { apiClient } from "../../api/client";
import { Link, useParams, useSearchParams } from "react-router-dom";
import DocsLayout from "../../components/Docs/DocsLayout";
import { getSeedArticlesByCategory, getCategoryLabel } from "../../data/docs";
import { DOCS } from "../../components/Docs/docsTheme";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Article {
  id: string;
  title: string;
  slug: string;
  category: string;
  content: string;
  views: number;
  updatedAt: string;
  tags: string[];
  isPublished: boolean;
  description?: string;
}

const PAGE_SIZE = 10;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const getExcerpt = (article: Article, maxLen = 160): string => {
  if (article.description) return article.description;
  const plain = (article.content || "")
    .replace(/#+\s/g, "")
    .replace(/[*_`>]/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\n+/g, " ")
    .trim();
  return plain.length > maxLen ? plain.slice(0, maxLen) + "…" : plain;
};

// ---------------------------------------------------------------------------
// ArticleRow
// ---------------------------------------------------------------------------

const ArticleRow = memo<{ article: Article }>(({ article }) => (
  <Box
    component={Link}
    to={`/docs/${article.slug}`}
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 2,
      px: 2,
      py: 2,
      textDecoration: "none",
      transition: "background-color 0.12s",
      "&:hover": { bgcolor: DOCS.surfaceHover },
      "&:hover .docs-row-arrow": { opacity: 1, transform: "translateX(2px)" },
    }}
  >
    <Box sx={{ minWidth: 0 }}>
      <Box sx={{ fontWeight: 650, color: DOCS.text, mb: 0.25 }}>
        {article.title}
      </Box>
      <Box sx={{ color: DOCS.textMuted, fontSize: "0.875rem", lineHeight: 1.5 }}>
        {getExcerpt(article)}
      </Box>
    </Box>
    <Box
      className="docs-row-arrow"
      sx={{
        color: DOCS.textFaint,
        opacity: 0,
        transition: "opacity 0.12s, transform 0.12s",
        flexShrink: 0,
        display: "flex",
      }}
    >
      <ArrowRight size={16} />
    </Box>
  </Box>
));

ArticleRow.displayName = "ArticleRow";

// ---------------------------------------------------------------------------
// DocsList
// ---------------------------------------------------------------------------

const DocsList = memo(() => {
  const { category = "" } = useParams<{ category: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = parseInt(searchParams.get("page") || "1", 10);

  const [articles, setArticles] = useState<Article[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const categoryLabel = getCategoryLabel(category);

  const fetchArticles = useCallback(async () => {
    setError(null);
    // Show the compiled-in seed immediately (instant paint, no spinner), then
    // refresh from the API in the background and override only on success.
    const seed = getSeedArticlesByCategory(category, pageParam, PAGE_SIZE);
    setArticles(seed.articles as unknown as Article[]);
    setTotal(seed.total);
    setTotalPages(seed.totalPages);
    try {
      const resp = await apiClient.get(`/docs`, {
        params: { category, page: pageParam, limit: PAGE_SIZE },
      });
      const data = resp.data;
      if (Array.isArray(data?.articles)) {
        setArticles(data.articles);
        setTotal(data?.total ?? data.articles.length);
        setTotalPages(data?.totalPages ?? 1);
      }
    } catch (err) {
      // No backend reachable — keep the seed already on screen.
    }
  }, [category, pageParam]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const filteredArticles = useMemo(() => {
    if (!searchQuery.trim()) return articles;
    const q = searchQuery.toLowerCase();
    return articles.filter((a) => a.title.toLowerCase().includes(q));
  }, [articles, searchQuery]);

  const handlePageChange = useCallback(
    (_: React.ChangeEvent<unknown>, page: number) => {
      setSearchParams({ page: String(page) });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [setSearchParams],
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value),
    [],
  );

  return (
    <DocsLayout>
      <Box sx={{ maxWidth: 820, mx: "auto", px: { xs: 2.5, md: 6 }, py: { xs: 4, md: 6 } }}>
        {/* Breadcrumbs */}
        <Breadcrumbs separator={<ChevronRight size={13} color={DOCS.textFaint} />} sx={{ mb: 2 }}>
          <Box
            component={Link}
            to="/docs"
            sx={{
              color: DOCS.textMuted,
              textDecoration: "none",
              fontSize: "0.8rem",
              "&:hover": { color: DOCS.text },
            }}
          >
            Docs
          </Box>
          <Box component="span" sx={{ color: DOCS.text, fontWeight: 600, fontSize: "0.8rem" }}>
            {categoryLabel}
          </Box>
        </Breadcrumbs>

        {/* Header */}
        <Box
          component="h1"
          sx={{
            fontWeight: 800,
            color: DOCS.text,
            m: 0,
            mb: 0.5,
            fontSize: { xs: "1.7rem", md: "2.1rem" },
            letterSpacing: "-0.02em",
          }}
        >
          {categoryLabel}
        </Box>
        <Box sx={{ color: DOCS.textMuted, mb: 3, fontSize: "0.9rem" }}>
          {total > 0 ? `${total} articles` : "No articles yet"}
        </Box>

        {/* Filter */}
        <Box sx={{ mb: 2, maxWidth: 360 }}>
          <TextField
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Filter in this category…"
            size="small"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon size={16} color={DOCS.textFaint} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
                bgcolor: DOCS.surface,
                color: DOCS.text,
                fontSize: "0.875rem",
                "& fieldset": { borderColor: DOCS.border },
                "&:hover fieldset": { borderColor: DOCS.borderStrong },
                "&.Mui-focused fieldset": { borderColor: DOCS.accent },
              },
              "& .MuiOutlinedInput-input::placeholder": {
                color: DOCS.textFaint,
                opacity: 1,
              },
            }}
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Loading */}
        {loading && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                height={68}
                sx={{ borderRadius: "10px", bgcolor: DOCS.surface }}
              />
            ))}
          </Box>
        )}

        {/* Empty */}
        {!loading && !error && filteredArticles.length === 0 && (
          <Box sx={{ textAlign: "center", py: 8, color: DOCS.textMuted }}>
            {searchQuery
              ? `No articles match "${searchQuery}"`
              : "No articles in this category yet."}
          </Box>
        )}

        {/* List */}
        {!loading && !error && filteredArticles.length > 0 && (
          <Box
            sx={{
              border: `1px solid ${DOCS.border}`,
              borderRadius: "12px",
              overflow: "hidden",
              bgcolor: DOCS.surface,
              "& > a:not(:last-of-type)": {
                borderBottom: `1px solid ${DOCS.border}`,
              },
            }}
          >
            {filteredArticles.map((article) => (
              <ArticleRow key={article.id} article={article} />
            ))}
          </Box>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mt: 4,
              "& .MuiPaginationItem-root": { color: DOCS.textMuted },
              "& .Mui-selected": {
                bgcolor: `${DOCS.accentSoftBg} !important`,
                color: DOCS.accent,
              },
            }}
          >
            <Pagination
              count={totalPages}
              page={pageParam}
              onChange={handlePageChange}
              shape="rounded"
            />
          </Box>
        )}
      </Box>
    </DocsLayout>
  );
});

DocsList.displayName = "DocsList";

export default DocsList;
