/**
 * DocsHome — Public documentation homepage (Step 10.9.7)
 *
 * Shows 4 section cards: Getting Started, Features, Troubleshooting, API.
 * Fetches sections from GET /api/docs/sections.
 * Navigates to /docs/category/:slug on click.
 */

import React, { memo, useState, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActionArea from "@mui/material/CardActionArea";
import Skeleton from "@mui/material/Skeleton";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import { BookOpen, Zap, AlertCircle, Code2, ChevronRight } from "lucide-react";
import axios from "axios";
import { Link } from "react-router-dom";
import DocSearch from "../../components/Docs/DocSearch";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DocSection {
  slug: string;
  title: string;
  description: string;
  articleCount: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const SECTION_ICONS: Record<string, React.ReactNode> = {
  "getting-started": <BookOpen size={28} />,
  features: <Zap size={28} />,
  troubleshooting: <AlertCircle size={28} />,
  api: <Code2 size={28} />,
};

const SECTION_COLORS: Record<string, string> = {
  "getting-started": "#3b82f6",
  features: "#8b5cf6",
  troubleshooting: "#f59e0b",
  api: "#10b981",
};

const DEFAULT_SECTIONS: DocSection[] = [
  {
    slug: "getting-started",
    title: "Getting Started",
    description: "New to the platform? Start here to learn the basics.",
    articleCount: 0,
  },
  {
    slug: "features",
    title: "Features",
    description: "Explore all platform features and capabilities.",
    articleCount: 0,
  },
  {
    slug: "troubleshooting",
    title: "Troubleshooting",
    description: "Having issues? Find solutions to common problems.",
    articleCount: 0,
  },
  {
    slug: "api",
    title: "API Reference",
    description: "Technical documentation for developers.",
    articleCount: 0,
  },
];

// ---------------------------------------------------------------------------
// SectionCard
// ---------------------------------------------------------------------------

interface SectionCardProps {
  section: DocSection;
}

const SectionCard = memo<SectionCardProps>(({ section }) => {
  const icon = SECTION_ICONS[section.slug] || <BookOpen size={28} />;
  const color = SECTION_COLORS[section.slug] || "#6b7280";

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
        transition: "box-shadow 0.2s, transform 0.2s",
        "&:hover": {
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          transform: "translateY(-2px)",
        },
      }}
    >
      <CardActionArea
        component={Link}
        to={`/docs/category/${section.slug}`}
        sx={{ height: "100%", p: 0 }}
      >
        <CardContent
          sx={{
            p: 3,
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 2,
              bgcolor: `${color}20`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color,
              mb: 2,
            }}
          >
            {icon}
          </Box>

          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: "text.primary", mb: 0.5 }}
          >
            {section.title}
          </Typography>

          <Typography
            variant="body2"
            sx={{ color: "text.secondary", mb: 2, flex: 1, lineHeight: 1.6 }}
          >
            {section.description}
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Chip
              label={`${section.articleCount} articles`}
              size="small"
              sx={{
                bgcolor: `${color}15`,
                color,
                fontWeight: 600,
                fontSize: "0.7rem",
              }}
            />
            <ChevronRight size={16} color={color} />
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
});

SectionCard.displayName = "SectionCard";

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

const SectionSkeleton = memo(() => (
  <Card
    elevation={0}
    sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3, p: 3 }}
  >
    <Skeleton
      variant="rectangular"
      width={52}
      height={52}
      sx={{ borderRadius: 2, mb: 2 }}
    />
    <Skeleton variant="text" width="60%" height={28} sx={{ mb: 1 }} />
    <Skeleton variant="text" width="100%" />
    <Skeleton variant="text" width="80%" sx={{ mb: 2 }} />
    <Skeleton
      variant="rectangular"
      width={80}
      height={24}
      sx={{ borderRadius: 2 }}
    />
  </Card>
));

SectionSkeleton.displayName = "SectionSkeleton";

// ---------------------------------------------------------------------------
// DocsHome
// ---------------------------------------------------------------------------

const DocsHome = memo(() => {
  const [sections, setSections] = useState<DocSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSections = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await axios.get(`${API_URL}/docs/sections`);
      const data: DocSection[] =
        resp.data?.sections ?? resp.data ?? DEFAULT_SECTIONS;
      setSections(
        data.length >= 4
          ? data
          : DEFAULT_SECTIONS.map((d, i) => ({
              ...d,
              ...(data[i] || {}),
            })),
      );
    } catch {
      // Fall back to default sections on error
      setSections(DEFAULT_SECTIONS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
      {/* Hero */}
      <Box sx={{ textAlign: "center", mb: { xs: 4, md: 6 } }}>
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 64,
            height: 64,
            borderRadius: 4,
            bgcolor: "primary.main",
            color: "primary.contrastText",
            mb: 2,
          }}
        >
          <BookOpen size={32} />
        </Box>

        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 800,
            color: "text.primary",
            mb: 1.5,
            fontSize: { xs: "1.75rem", md: "2.5rem" },
          }}
        >
          Help Center
        </Typography>

        <Typography
          variant="subtitle1"
          sx={{ color: "text.secondary", mb: 3, maxWidth: 480, mx: "auto" }}
        >
          Find guides, tutorials, and API references to help you get the most
          out of the platform.
        </Typography>

        {/* Search bar */}
        <Box sx={{ maxWidth: 480, mx: "auto" }}>
          <DocSearch placeholder="Search help articles..." fullWidth />
        </Box>
      </Box>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Section cards */}
      <Grid container spacing={3}>
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <SectionSkeleton />
              </Grid>
            ))
          : sections.map((section) => (
              <Grid item xs={12} sm={6} md={3} key={section.slug}>
                <SectionCard section={section} />
              </Grid>
            ))}
      </Grid>
    </Container>
  );
});

DocsHome.displayName = "DocsHome";

export default DocsHome;
