/**
 * DocsList — Article list page at /docs/category/:category (Step 10.9.7)
 *
 * Shows breadcrumbs, search, article cards, and pagination.
 * Fetches from GET /api/docs?category=X&page=N.
 */

import React, { memo, useState, useEffect, useCallback, useMemo } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActionArea from "@mui/material/CardActionArea";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import Alert from "@mui/material/Alert";
import Pagination from "@mui/material/Pagination";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import {
  Search as SearchIcon,
  ChevronRight,
  Eye as ViewIcon,
  Calendar,
} from "lucide-react";
import axios from "axios";
import { Link, useParams, useSearchParams } from "react-router-dom";
import DocsLayout from "../../components/Docs/DocsLayout";

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
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const CATEGORY_LABELS: Record<string, string> = {
  "getting-started": "Getting Started",
  features: "Features",
  troubleshooting: "Troubleshooting",
  api: "API Reference",
};

const PAGE_SIZE = 10;

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

const formatDate = (iso: string): string => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getExcerpt = (content: string, maxLen = 150): string => {
  // Strip markdown syntax for excerpt
  const plain = content
    .replace(/#+\s/g, "")
    .replace(/[*_`]/g, "")
    .replace(/\n/g, " ");
  return plain.length > maxLen ? plain.slice(0, maxLen) + "…" : plain;
};

// ---------------------------------------------------------------------------
// ArticleCard
// ---------------------------------------------------------------------------

interface ArticleCardProps {
  article: Article;
}

const ArticleCard = memo<ArticleCardProps>(({ article }) => {
  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        transition: "box-shadow 0.2s",
        "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,0.08)" },
      }}
    >
      <CardActionArea component={Link} to={`/docs/${article.slug}`}>
        <CardContent sx={{ p: 2.5 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              mb: 1,
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, color: "text.primary", flex: 1, mr: 1 }}
            >
              {article.title}
            </Typography>
            <Chip
              label={CATEGORY_LABELS[article.category] || article.category}
              size="small"
              sx={{ fontSize: "0.65rem", height: 20, flexShrink: 0 }}
            />
          </Box>

          <Typography
            variant="body2"
            sx={{ color: "text.secondary", mb: 1.5, lineHeight: 1.6 }}
          >
            {getExcerpt(article.content)}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <ViewIcon size={12} />
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {(article.views || 0).toLocaleString()} views
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Calendar size={12} />
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {formatDate(article.updatedAt)}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
});

ArticleCard.displayName = "ArticleCard";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const categoryLabel = CATEGORY_LABELS[category] || category;

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await axios.get(`${API_URL}/docs`, {
        params: { category, page: pageParam, limit: PAGE_SIZE },
      });
      const data = resp.data;
      setArticles(Array.isArray(data?.articles) ? data.articles : []);
      setTotal(data?.total ?? 0);
      setTotalPages(data?.totalPages ?? 1);
    } catch (err) {
      setError("Failed to load articles.");
    } finally {
      setLoading(false);
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
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    [],
  );

  return (
    <DocsLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs
          separator={<ChevronRight size={14} />}
          sx={{ mb: 3, color: "text.secondary" }}
        >
          <Typography
            component={Link}
            to="/docs"
            variant="body2"
            sx={{
              color: "text.secondary",
              textDecoration: "none",
              "&:hover": { color: "text.primary" },
            }}
          >
            Docs
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "text.primary", fontWeight: 600 }}
          >
            {categoryLabel}
          </Typography>
        </Breadcrumbs>

        {/* Header */}
        <Typography
          variant="h4"
          component="h1"
          sx={{ fontWeight: 800, color: "text.primary", mb: 1 }}
        >
          {categoryLabel}
        </Typography>
        <Typography variant="body1" sx={{ color: "text.secondary", mb: 3 }}>
          {total > 0 ? `${total} articles` : "No articles yet"}
        </Typography>

        {/* Search within category */}
        <Box sx={{ mb: 3, maxWidth: 400 }}>
          <TextField
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search in this category..."
            size="small"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon size={16} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Error */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Loading */}
        {loading && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                height={120}
                sx={{ borderRadius: 2 }}
              />
            ))}
          </Box>
        )}

        {/* Empty state */}
        {!loading && !error && filteredArticles.length === 0 && (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="h6" sx={{ color: "text.secondary" }}>
              {searchQuery
                ? `No articles match "${searchQuery}"`
                : "No articles in this category yet."}
            </Typography>
          </Box>
        )}

        {/* Article list */}
        {!loading && !error && filteredArticles.length > 0 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {filteredArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </Box>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <Pagination
              count={totalPages}
              page={pageParam}
              onChange={handlePageChange}
              color="primary"
              showFirstButton
              showLastButton
            />
          </Box>
        )}
      </Container>
    </DocsLayout>
  );
});

DocsList.displayName = "DocsList";

export default DocsList;
