/**
 * DocsHome — Clerk-style documentation landing (dark, self-contained).
 *
 * Inside the docs shell: a restrained hero, "I am a…" role paths, popular
 * quick links, and a flat bordered grid of category cards. Sections come from
 * GET /api/docs/sections with a static-seed fallback. Colors come from the
 * explicit docs palette, not the app theme.
 */

import React, { memo, useState, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Alert from "@mui/material/Alert";
import {
  BookOpen,
  Zap,
  AlertCircle,
  Code2,
  ArrowRight,
  Boxes,
  Palette,
  Sparkles,
  History,
  Rocket,
  MapPin,
  ShoppingBag,
} from "lucide-react";
import { apiClient } from "../../api/client";
import { Link } from "react-router-dom";
import DocsLayout from "../../components/Docs/DocsLayout";
import { getSeedSections } from "../../data/docs";
import { DOCS } from "../../components/Docs/docsTheme";

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

const ICON_SIZE = 18;

const SECTION_ICONS: Record<string, React.ReactNode> = {
  "getting-started": <BookOpen size={ICON_SIZE} />,
  guides: <Zap size={ICON_SIZE} />,
  features: <Zap size={ICON_SIZE} />,
  api: <Code2 size={ICON_SIZE} />,
  components: <Boxes size={ICON_SIZE} />,
  customization: <Palette size={ICON_SIZE} />,
  troubleshooting: <AlertCircle size={ICON_SIZE} />,
  "ai-prompts": <Sparkles size={ICON_SIZE} />,
  changelog: <History size={ICON_SIZE} />,
};

const ROLE_PATHS = [
  {
    icon: <Rocket size={18} />,
    label: "Build a website",
    description: "Start from a template and publish your own site.",
    to: "/docs/create-your-first-website",
  },
  {
    icon: <MapPin size={18} />,
    label: "Publish a listing",
    description: "Get your business into the public directory.",
    to: "/docs/publish-your-first-listing",
  },
  {
    icon: <ShoppingBag size={18} />,
    label: "Set up a store",
    description: "Commerce tools are planned and not available yet.",
    to: "/docs/stores",
    comingSoon: true,
  },
];

const QUICK_LINKS = [
  { label: "What is Techietribe Directory?", to: "/docs/what-is-techietribe-directory" },
  { label: "Publish your first listing", to: "/docs/publish-your-first-listing" },
  { label: "Listing lifecycle", to: "/docs/directory-listings" },
  { label: "Launch checklist", to: "/docs/launch-checklist" },
];

// ---------------------------------------------------------------------------
// SectionCard
// ---------------------------------------------------------------------------

const SectionCard = memo<{ section: DocSection }>(({ section }) => {
  const icon = SECTION_ICONS[section.slug] || <BookOpen size={ICON_SIZE} />;

  return (
    <Box
      component={Link}
      to={`/docs/category/${section.slug}`}
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        p: 2.5,
        textDecoration: "none",
        border: `1px solid ${DOCS.border}`,
        borderRadius: "12px",
        bgcolor: DOCS.surface,
        transition: "border-color 0.15s, transform 0.15s",
        "&:hover": { borderColor: DOCS.accent, transform: "translateY(-2px)" },
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: "9px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: DOCS.accent,
          bgcolor: DOCS.accentSoftBg,
          mb: 1.5,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ fontWeight: 650, color: DOCS.text, mb: 0.5, fontSize: "1rem" }}>
        {section.title}
      </Box>
      <Box
        sx={{
          color: DOCS.textMuted,
          fontSize: "0.875rem",
          lineHeight: 1.55,
          flex: 1,
          mb: 1.5,
        }}
      >
        {section.description}
      </Box>
      <Box sx={{ color: DOCS.textFaint, fontSize: "0.78rem", fontWeight: 500 }}>
        {section.articleCount} articles
      </Box>
    </Box>
  );
});

SectionCard.displayName = "SectionCard";

// ---------------------------------------------------------------------------
// DocsHome
// ---------------------------------------------------------------------------

const DocsHome = memo(() => {
  // Render the compiled-in seed immediately (instant paint), then refresh from
  // the API in the background and override only if it returns real sections.
  const [sections, setSections] = useState<DocSection[]>(() => getSeedSections());
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  const fetchSections = useCallback(async () => {
    try {
      const resp = await apiClient.get(`/docs/sections`);
      const data: DocSection[] = resp.data?.sections ?? resp.data ?? [];
      if (Array.isArray(data) && data.length >= 4) {
        setSections(data);
      }
    } catch {
      // No backend reachable — keep the seed already on screen.
    }
  }, []);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  return (
    <DocsLayout>
      <Box sx={{ maxWidth: 960, mx: "auto", px: { xs: 2.5, md: 6 }, py: { xs: 5, md: 8 } }}>
        {/* Hero */}
        <Box
          component="h1"
          sx={{
            fontWeight: 800,
            color: DOCS.text,
            fontSize: { xs: "2rem", md: "2.6rem" },
            letterSpacing: "-0.02em",
            m: 0,
            mb: 1.5,
          }}
        >
          Welcome to the docs
        </Box>
        <Box
          sx={{
            color: DOCS.textMuted,
            fontSize: "1.05rem",
            lineHeight: 1.6,
            mb: 4,
            maxWidth: 640,
          }}
        >
          Guides and troubleshooting to help you build websites, publish
          directory listings, manage favorites and reviews. Store setup is
          coming soon.
        </Box>

        {/* Popular links */}
        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1, mb: 6 }}>
          <Box sx={{ color: DOCS.textFaint, fontSize: "0.8rem", mr: 0.5 }}>
            Popular:
          </Box>
          {QUICK_LINKS.map((link) => (
            <Box
              key={link.to}
              component={Link}
              to={link.to}
              sx={{
                color: DOCS.textMuted,
                fontSize: "0.8rem",
                textDecoration: "none",
                border: `1px solid ${DOCS.border}`,
                borderRadius: 999,
                px: 1.5,
                py: 0.5,
                transition: "border-color 0.15s, color 0.15s",
                "&:hover": { borderColor: DOCS.accent, color: DOCS.text },
              }}
            >
              {link.label}
            </Box>
          ))}
        </Box>

        {/* Role paths */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
            gap: 2,
            mb: 6,
          }}
        >
          {ROLE_PATHS.map((role) => (
            <Box
              key={role.to}
              component={Link}
              to={role.to}
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 1.5,
                p: 2,
                textDecoration: "none",
                border: `1px solid ${DOCS.border}`,
                borderRadius: "12px",
                bgcolor: DOCS.surface,
                transition: "border-color 0.15s",
                "&:hover": { borderColor: DOCS.accent },
              }}
            >
              <Box sx={{ color: DOCS.accent, mt: 0.25 }}>{role.icon}</Box>
              <Box>
                <Box
                  sx={{
                    fontWeight: 650,
                    fontSize: "0.9rem",
                    color: DOCS.text,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.75,
                    mb: 0.25,
                  }}
                >
                  {role.label}
                  {role.comingSoon ? (
                    <Box
                      component="span"
                      sx={{
                        border: `1px solid ${DOCS.accentSoftBg}`,
                        borderRadius: 999,
                        color: DOCS.accent,
                        fontSize: "0.58rem",
                        fontWeight: 750,
                        letterSpacing: "0.06em",
                        lineHeight: 1,
                        px: 0.8,
                        py: 0.45,
                        textTransform: "uppercase",
                      }}
                    >
                      Coming soon
                    </Box>
                  ) : (
                    <ArrowRight size={13} />
                  )}
                </Box>
                <Box sx={{ color: DOCS.textMuted, fontSize: "0.78rem" }}>
                  {role.description}
                </Box>
              </Box>
            </Box>
          ))}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Browse by category */}
        <Box sx={{ fontWeight: 700, color: DOCS.text, fontSize: "1.15rem", mb: 2 }}>
          Browse by category
        </Box>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)" },
            gap: 2,
          }}
        >
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Skeleton
                  key={i}
                  variant="rectangular"
                  height={150}
                  sx={{ borderRadius: "12px", bgcolor: DOCS.surface }}
                />
              ))
            : sections.map((section) => (
                <SectionCard key={section.slug} section={section} />
              ))}
        </Box>
      </Box>
    </DocsLayout>
  );
});

DocsHome.displayName = "DocsHome";

export default DocsHome;
