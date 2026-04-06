/**
 * DocsArticle — Article detail page at /docs/:slug (Step 10.9.7)
 *
 * Shows breadcrumbs, article title, last updated, category chip, tags,
 * rendered Markdown content, TOC sidebar, and feedback buttons.
 */

import React, { memo, useState, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import { ChevronRight, ThumbsUp, ThumbsDown, Calendar } from "lucide-react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import DocsLayout from "../../components/Docs/DocsLayout";
import TableOfContents from "../../components/Docs/TableOfContents";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DocArticle {
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

// ---------------------------------------------------------------------------
// Markdown component overrides (add heading IDs for TOC scroll)
// ---------------------------------------------------------------------------

const createHeadingComponent = (level: 1 | 2 | 3 | 4 | 5 | 6) =>
  memo<{ children?: React.ReactNode }>(({ children }) => {
    const text = String(children ?? "");
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
    return React.createElement(
      `h${level}`,
      { id, style: { scrollMarginTop: "88px" } },
      children,
    );
  });

const markdownComponents = {
  h1: createHeadingComponent(1),
  h2: createHeadingComponent(2),
  h3: createHeadingComponent(3),
  h4: createHeadingComponent(4),
  pre: memo<{ children?: React.ReactNode }>(({ children }) => (
    <Box
      component="pre"
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: "grey.900",
        color: "grey.100",
        overflowX: "auto",
        fontSize: "0.875rem",
        lineHeight: 1.6,
        fontFamily: "monospace",
        my: 2,
      }}
    >
      {children}
    </Box>
  )),
  code: memo<{ children?: React.ReactNode; inline?: boolean }>(
    ({ children, inline }) =>
      inline ? (
        <Box
          component="code"
          sx={{
            px: 0.5,
            py: 0.25,
            borderRadius: 0.5,
            bgcolor: "action.selected",
            fontFamily: "monospace",
            fontSize: "0.85em",
          }}
        >
          {children}
        </Box>
      ) : (
        <code>{children}</code>
      ),
  ),
};

// ---------------------------------------------------------------------------
// WasThisHelpful
// ---------------------------------------------------------------------------

type FeedbackState = "idle" | "yes" | "no";

const WasThisHelpful = memo(() => {
  const [feedback, setFeedback] = useState<FeedbackState>("idle");

  const handleYes = useCallback(() => setFeedback("yes"), []);
  const handleNo = useCallback(() => setFeedback("no"), []);

  if (feedback !== "idle") {
    return (
      <Typography
        variant="body2"
        sx={{ color: "text.secondary", fontStyle: "italic" }}
      >
        {feedback === "yes"
          ? "Thanks for the feedback! 🎉"
          : "Thanks — we will work on improving this."}
      </Typography>
    );
  }

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <Typography
        variant="body2"
        sx={{ color: "text.secondary", fontWeight: 500 }}
      >
        Was this helpful?
      </Typography>
      <Button
        size="small"
        variant="outlined"
        onClick={handleYes}
        startIcon={<ThumbsUp size={14} />}
        sx={{ borderRadius: 2, textTransform: "none" }}
      >
        Yes
      </Button>
      <Button
        size="small"
        variant="outlined"
        onClick={handleNo}
        startIcon={<ThumbsDown size={14} />}
        sx={{ borderRadius: 2, textTransform: "none" }}
        color="inherit"
      >
        No
      </Button>
    </Box>
  );
});

WasThisHelpful.displayName = "WasThisHelpful";

// ---------------------------------------------------------------------------
// DocsArticle
// ---------------------------------------------------------------------------

const DocsArticle = memo(() => {
  const { slug = "" } = useParams<{ slug: string }>();

  const [article, setArticle] = useState<DocArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const fetchArticle = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const resp = await axios.get(`${API_URL}/docs/${slug}`);
      setArticle(resp.data?.article ?? resp.data);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status: number } };
      if (axiosErr?.response?.status === 404) {
        setNotFound(true);
      } else {
        setError("Failed to load article. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);

  const categoryLabel = article
    ? CATEGORY_LABELS[article.category] || article.category
    : "";

  // ---------------------------------------------------------------------------
  // Render states
  // ---------------------------------------------------------------------------

  if (loading) {
    return (
      <DocsLayout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Skeleton variant="text" width={200} height={20} sx={{ mb: 2 }} />
          <Skeleton variant="text" width="60%" height={40} sx={{ mb: 2 }} />
          <Skeleton
            variant="rectangular"
            height={400}
            sx={{ borderRadius: 2 }}
          />
        </Container>
      </DocsLayout>
    );
  }

  if (notFound) {
    return (
      <DocsLayout>
        <Container maxWidth="lg" sx={{ py: 8, textAlign: "center" }}>
          <Typography variant="h5" sx={{ color: "text.primary", mb: 2 }}>
            Article not found
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary", mb: 3 }}>
            The article you are looking for does not exist or has been removed.
          </Typography>
          <Button component={Link} to="/docs" variant="contained">
            Back to Docs
          </Button>
        </Container>
      </DocsLayout>
    );
  }

  if (error) {
    return (
      <DocsLayout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error">{error}</Alert>
        </Container>
      </DocsLayout>
    );
  }

  if (!article) return null;

  return (
    <DocsLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          {/* Main article */}
          <Grid item xs={12} md={8}>
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
                component={Link}
                to={`/docs/category/${article.category}`}
                variant="body2"
                sx={{
                  color: "text.secondary",
                  textDecoration: "none",
                  "&:hover": { color: "text.primary" },
                }}
              >
                {categoryLabel}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "text.primary", fontWeight: 600 }}
              >
                {article.title}
              </Typography>
            </Breadcrumbs>

            {/* Category + last updated */}
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}
            >
              <Chip
                label={categoryLabel}
                size="small"
                color="primary"
                sx={{ fontSize: "0.7rem" }}
              />
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Calendar size={12} />
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Updated{" "}
                  {new Date(article.updatedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Typography>
              </Box>
            </Box>

            {/* Title */}
            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontWeight: 800,
                color: "text.primary",
                mb: 2,
                fontSize: { xs: "1.75rem", md: "2.25rem" },
                lineHeight: 1.3,
              }}
            >
              {article.title}
            </Typography>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <Stack
                direction="row"
                spacing={0.75}
                sx={{ mb: 3, flexWrap: "wrap", gap: 0.75 }}
              >
                {article.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: "0.65rem", height: 20 }}
                  />
                ))}
              </Stack>
            )}

            {/* Article content */}
            <Box
              sx={{
                "& h1, & h2, & h3, & h4": {
                  color: "text.primary",
                  mt: 3,
                  mb: 1.5,
                },
                "& p": { color: "text.secondary", lineHeight: 1.8, mb: 1.5 },
                "& ul, & ol": { pl: 3, color: "text.secondary" },
                "& li": { mb: 0.5 },
                "& a": {
                  color: "primary.main",
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" },
                },
                "& blockquote": {
                  pl: 2,
                  borderLeft: "4px solid",
                  borderColor: "primary.main",
                  bgcolor: "action.hover",
                  py: 1,
                  borderRadius: "0 8px 8px 0",
                  my: 2,
                },
                "& table": { borderCollapse: "collapse", width: "100%", my: 2 },
                "& th, & td": {
                  border: "1px solid",
                  borderColor: "divider",
                  p: 1,
                  fontSize: "0.875rem",
                },
                "& th": { bgcolor: "action.selected", fontWeight: 700 },
                "& img": { maxWidth: "100%", borderRadius: 2 },
              }}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={markdownComponents}
              >
                {article.content}
              </ReactMarkdown>
            </Box>

            {/* Feedback */}
            <Divider sx={{ my: 4 }} />
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
              }}
            >
              <WasThisHelpful />
            </Paper>
          </Grid>

          {/* TOC sidebar */}
          <Grid
            item
            xs={12}
            md={4}
            sx={{ display: { xs: "none", md: "block" } }}
          >
            <TableOfContents content={article.content} />
          </Grid>
        </Grid>
      </Container>
    </DocsLayout>
  );
});

DocsArticle.displayName = "DocsArticle";

export default DocsArticle;
