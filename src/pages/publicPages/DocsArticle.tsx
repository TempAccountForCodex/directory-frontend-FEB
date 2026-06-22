/**
 * DocsArticle — Clerk-style article page (dark, self-contained) at /docs/:slug.
 *
 * Main prose column with breadcrumbs, title + meta, refined Markdown typography
 * and dark copyable code blocks, a "copy page as Markdown" action, related
 * links, feedback, and a sticky "On this page" table of contents. Colors come
 * from the explicit docs palette, not the app theme.
 */

import React, { memo, useState, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Skeleton from "@mui/material/Skeleton";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import {
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  Copy,
  Check,
  ArrowRight,
} from "lucide-react";
import { apiClient } from "../../api/client";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import DocsLayout from "../../components/Docs/DocsLayout";
import TableOfContents from "../../components/Docs/TableOfContents";
import CodeBlock from "../../components/Docs/CodeBlock";
import { DOCS } from "../../components/Docs/docsTheme";
import {
  getSeedArticle,
  getSeedArticlesBySlugs,
  getCategoryLabel,
} from "../../data/docs";

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

const isDocArticle = (value: unknown): value is DocArticle => {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<DocArticle>;
  return (
    typeof candidate.title === "string" &&
    typeof candidate.slug === "string" &&
    typeof candidate.category === "string" &&
    typeof candidate.content === "string"
  );
};

// ---------------------------------------------------------------------------
// Markdown helpers
// ---------------------------------------------------------------------------

const slugifyHeading = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();

const createHeadingComponent = (level: 1 | 2 | 3 | 4 | 5 | 6) =>
  memo<{ children?: React.ReactNode }>(({ children }) => {
    const id = slugifyHeading(String(children ?? ""));
    return React.createElement(
      `h${level}`,
      { id, style: { scrollMarginTop: "80px" } },
      children,
    );
  });

/** Recursively flatten a React node tree to its text content. */
const nodeToText = (node: React.ReactNode): string => {
  if (node == null || node === false) return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(nodeToText).join("");
  if (React.isValidElement(node)) {
    return nodeToText((node.props as { children?: React.ReactNode }).children);
  }
  return "";
};

const markdownComponents = {
  h1: createHeadingComponent(1),
  h2: createHeadingComponent(2),
  h3: createHeadingComponent(3),
  h4: createHeadingComponent(4),
  pre: memo<{ children?: React.ReactNode }>(({ children }) => {
    const child = React.Children.toArray(children)[0] as
      | React.ReactElement<{ className?: string; children?: React.ReactNode }>
      | undefined;
    const className = child?.props?.className ?? "";
    const language = /language-(\w+)/.exec(className)?.[1];
    const code = nodeToText(child?.props?.children).replace(/\n$/, "");
    return <CodeBlock code={code} language={language} />;
  }),
  code: memo<{ children?: React.ReactNode; className?: string }>(
    ({ children, className }) =>
      className ? (
        <code className={className}>{children}</code>
      ) : (
        <Box
          component="code"
          sx={{
            px: 0.5,
            py: 0.15,
            mx: "1px",
            borderRadius: "5px",
            bgcolor: DOCS.surface,
            border: `1px solid ${DOCS.border}`,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: "0.83em",
            color: DOCS.accentHover,
          }}
        >
          {children}
        </Box>
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
      <Box sx={{ color: DOCS.textMuted, fontSize: "0.9rem" }}>
        {feedback === "yes"
          ? "Thanks for the feedback!"
          : "Thanks — we'll work on improving this."}
      </Box>
    );
  }

  const btnSx = {
    borderRadius: "8px",
    textTransform: "none",
    color: DOCS.textMuted,
    borderColor: DOCS.border,
    "&:hover": { borderColor: DOCS.accent, color: DOCS.text },
  } as const;

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <Box sx={{ color: DOCS.textMuted, fontWeight: 500, fontSize: "0.9rem" }}>
        Was this helpful?
      </Box>
      <Button
        size="small"
        variant="outlined"
        onClick={handleYes}
        startIcon={<ThumbsUp size={14} />}
        sx={btnSx}
      >
        Yes
      </Button>
      <Button
        size="small"
        variant="outlined"
        onClick={handleNo}
        startIcon={<ThumbsDown size={14} />}
        sx={btnSx}
      >
        No
      </Button>
    </Box>
  );
});

WasThisHelpful.displayName = "WasThisHelpful";

// ---------------------------------------------------------------------------
// CopyPageButton — "copy as Markdown" for AI / dev workflows.
// ---------------------------------------------------------------------------

const CopyPageButton = memo<{ title: string; content: string }>(
  ({ title, content }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = useCallback(() => {
      const markdown = `# ${title}\n\n${content}`;
      Promise.resolve(navigator?.clipboard?.writeText?.(markdown))
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        })
        .catch(() => {});
    }, [title, content]);

    return (
      <Button
        size="small"
        variant="outlined"
        onClick={handleCopy}
        startIcon={copied ? <Check size={14} /> : <Copy size={14} />}
        sx={{
          borderRadius: "8px",
          textTransform: "none",
          color: DOCS.textMuted,
          borderColor: DOCS.border,
          fontSize: "0.8rem",
          "&:hover": { borderColor: DOCS.accent, color: DOCS.text },
        }}
      >
        {copied ? "Copied" : "Copy page"}
      </Button>
    );
  },
);

CopyPageButton.displayName = "CopyPageButton";

// ---------------------------------------------------------------------------
// Breadcrumb link helper
// ---------------------------------------------------------------------------

const crumbSx = {
  color: DOCS.textMuted,
  textDecoration: "none",
  fontSize: "0.8rem",
  "&:hover": { color: DOCS.text },
} as const;

// ---------------------------------------------------------------------------
// DocsArticle
// ---------------------------------------------------------------------------

const DocsArticle = memo(() => {
  const { slug = "" } = useParams<{ slug: string }>();

  const [article, setArticle] = useState<DocArticle | null>(
    () => getSeedArticle(slug) as unknown as DocArticle | null,
  );
  // Only block on a spinner when the slug isn't in the compiled-in seed.
  const [loading, setLoading] = useState(() => getSeedArticle(slug) == null);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const fetchArticle = useCallback(async () => {
    if (!slug) return;
    // Show the seed article immediately (instant paint), then refresh from the
    // API in the background. Only wait/spin when there is no seed for the slug.
    const seed = getSeedArticle(slug);
    setError(null);
    setNotFound(false);
    if (seed) {
      setArticle(seed as unknown as DocArticle);
      setLoading(false);
    } else {
      setLoading(true);
    }
    try {
      const resp = await apiClient.get(`/docs/${slug}`);
      const data = resp.data?.article ?? resp.data;
      if (isDocArticle(data)) {
        setArticle(data);
      } else if (!seed) {
        setArticle(null);
        setNotFound(true);
      }
    } catch {
      if (!seed) {
        setArticle(null);
        setNotFound(true);
      }
      // If we have a seed article, keep it on screen.
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);

  const categoryLabel = article ? getCategoryLabel(article.category) : "";
  const seedMeta = article ? getSeedArticle(article.slug) : null;
  const related = seedMeta ? getSeedArticlesBySlugs(seedMeta.relatedSlugs) : [];

  // -------------------------------------------------------------------------
  // Render states
  // -------------------------------------------------------------------------

  if (loading) {
    return (
      <DocsLayout>
        <Box sx={{ maxWidth: 760, mx: "auto", px: { xs: 2.5, md: 6 }, py: 6 }}>
          <Skeleton variant="text" width={220} height={20} sx={{ mb: 2, bgcolor: DOCS.surface }} />
          <Skeleton variant="text" width="60%" height={44} sx={{ mb: 2, bgcolor: DOCS.surface }} />
          <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2, bgcolor: DOCS.surface }} />
        </Box>
      </DocsLayout>
    );
  }

  if (notFound) {
    return (
      <DocsLayout>
        <Box sx={{ maxWidth: 760, mx: "auto", px: 3, py: 10, textAlign: "center" }}>
          <Box sx={{ color: DOCS.text, fontSize: "1.4rem", fontWeight: 700, mb: 2 }}>
            Article not found
          </Box>
          <Box sx={{ color: DOCS.textMuted, mb: 3 }}>
            The article you are looking for does not exist or has been removed.
          </Box>
          <Button
            component={Link}
            to="/docs"
            variant="contained"
            sx={{ bgcolor: DOCS.accent, color: "#06201d", "&:hover": { bgcolor: DOCS.accentHover } }}
          >
            Back to Docs
          </Button>
        </Box>
      </DocsLayout>
    );
  }

  if (error) {
    return (
      <DocsLayout>
        <Box sx={{ maxWidth: 760, mx: "auto", px: 3, py: 6 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </DocsLayout>
    );
  }

  if (!article) return null;

  return (
    <DocsLayout>
      <Box
        sx={{
          display: "flex",
          gap: 5,
          maxWidth: 1080,
          mx: "auto",
          px: { xs: 2.5, md: 6 },
          py: { xs: 4, md: 6 },
        }}
      >
        {/* Main column */}
        <Box sx={{ flex: 1, minWidth: 0, maxWidth: 760 }}>
          {/* Breadcrumbs */}
          <Breadcrumbs
            separator={<ChevronRight size={13} color={DOCS.textFaint} />}
            sx={{ mb: 2.5 }}
          >
            <Box component={Link} to="/docs" sx={crumbSx}>
              Docs
            </Box>
            <Box component={Link} to={`/docs/category/${article.category}`} sx={crumbSx}>
              {categoryLabel}
            </Box>
            <Box component="span" sx={{ color: DOCS.text, fontWeight: 600, fontSize: "0.8rem" }}>
              {article.title}
            </Box>
          </Breadcrumbs>

          {/* Title */}
          <Box
            component="h1"
            sx={{
              fontWeight: 800,
              color: DOCS.text,
              m: 0,
              mb: 1.5,
              fontSize: { xs: "1.85rem", md: "2.3rem" },
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
            }}
          >
            {article.title}
          </Box>

          {/* Meta row + copy page */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 1.5,
              mb: 4,
              pb: 3,
              borderBottom: `1px solid ${DOCS.border}`,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: DOCS.textFaint }}>
              <Calendar size={13} />
              <Box sx={{ fontSize: "0.78rem" }}>
                Updated{" "}
                {new Date(article.updatedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Box>
            </Box>
            <CopyPageButton title={article.title} content={article.content} />
          </Box>

          {/* Prose */}
          <Box
            sx={{
              fontSize: "0.95rem",
              color: DOCS.textMuted,
              "& h1, & h2, & h3, & h4": {
                color: DOCS.text,
                fontWeight: 700,
                letterSpacing: "-0.01em",
                scrollMarginTop: "80px",
              },
              "& h2": {
                mt: 5,
                mb: 1.5,
                fontSize: "1.35rem",
                pb: 0.75,
                borderBottom: `1px solid ${DOCS.border}`,
              },
              "& h3": { mt: 3.5, mb: 1, fontSize: "1.1rem" },
              "& h4": { mt: 3, mb: 1, fontSize: "1rem" },
              "& p": { color: DOCS.textMuted, lineHeight: 1.75, my: 1.5 },
              "& ul, & ol": { pl: 3, color: DOCS.textMuted, my: 1.5 },
              "& li": { mb: 0.6, lineHeight: 1.7 },
              "& li::marker": { color: DOCS.textFaint },
              "& a": {
                color: DOCS.accent,
                textDecoration: "none",
                fontWeight: 500,
                "&:hover": { color: DOCS.accentHover, textDecoration: "underline" },
              },
              "& strong": { color: DOCS.text, fontWeight: 650 },
              "& blockquote": {
                m: 0,
                my: 2.5,
                pl: 2,
                py: 0.5,
                borderLeft: `3px solid ${DOCS.accent}`,
                bgcolor: DOCS.surface,
                borderRadius: "0 8px 8px 0",
                "& p": { color: DOCS.text, my: 0.75 },
              },
              "& table": {
                borderCollapse: "collapse",
                width: "100%",
                my: 2.5,
                fontSize: "0.875rem",
                display: "block",
                overflowX: "auto",
              },
              "& th, & td": {
                border: `1px solid ${DOCS.border}`,
                p: 1.25,
                textAlign: "left",
              },
              "& th": { bgcolor: DOCS.surface, fontWeight: 700, color: DOCS.text },
              "& td": { color: DOCS.textMuted },
              "& img": { maxWidth: "100%", borderRadius: "10px", my: 2 },
              "& hr": { border: "none", borderTop: `1px solid ${DOCS.border}`, my: 4 },
            }}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {article.content}
            </ReactMarkdown>
          </Box>

          {/* Related */}
          {related.length > 0 && (
            <Box sx={{ mt: 6 }}>
              <Box sx={{ fontWeight: 700, color: DOCS.text, mb: 1.5 }}>Related</Box>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 1.5,
                }}
              >
                {related.map((rel) => (
                  <Box
                    key={rel.slug}
                    component={Link}
                    to={`/docs/${rel.slug}`}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 1,
                      p: 1.75,
                      border: `1px solid ${DOCS.border}`,
                      borderRadius: "10px",
                      bgcolor: DOCS.surface,
                      textDecoration: "none",
                      transition: "border-color 0.15s",
                      "&:hover": { borderColor: DOCS.accent },
                    }}
                  >
                    <Box>
                      <Box sx={{ fontWeight: 600, fontSize: "0.875rem", color: DOCS.text }}>
                        {rel.title}
                      </Box>
                      <Box sx={{ color: DOCS.textMuted, fontSize: "0.78rem" }}>
                        {rel.description}
                      </Box>
                    </Box>
                    <ArrowRight size={15} color={DOCS.textFaint} style={{ flexShrink: 0 }} />
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* Feedback */}
          <Box sx={{ mt: 5, pt: 4, borderTop: `1px solid ${DOCS.border}` }}>
            <WasThisHelpful />
          </Box>
        </Box>

        {/* Right TOC */}
        <Box sx={{ display: { xs: "none", lg: "block" }, width: 220, flexShrink: 0 }}>
          <TableOfContents content={article.content} />
        </Box>
      </Box>
    </DocsLayout>
  );
});

DocsArticle.displayName = "DocsArticle";

export default DocsArticle;
