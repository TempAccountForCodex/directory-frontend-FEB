/**
 * DocsLayout — Clerk-style, self-contained dark documentation shell.
 *
 * - Sticky top bar with brand, search, and a link back to the site.
 * - Left sidebar with the full nested navigation tree (section groups +
 *   their articles), persistent on desktop and a drawer on mobile.
 * - Main content area rendered as children.
 *
 * Uses an explicit dark palette (see docsTheme) rather than the app's MUI theme
 * tokens, which render invisible on these surfaces.
 */

import React, { memo, useState, useCallback, useEffect } from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import {
  Menu as MenuIcon,
  ArrowUpRight,
  Sun,
  Moon,
  Search as SearchIcon,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import DocSearch from "./DocSearch";
import { getSeedSections, SEED_ARTICLES } from "../../data/docs";
import LightDocsLogo from "../../assets/images/BlackLogo.webp";
import CompactDocsLogo from "../../assets/images/navbar/collapsedLogo.png";
import {
  DOCS,
  DOCS_THEME_CSS,
  DOCS_THEME_STORAGE_KEY,
  readDocsMode,
  type DocsMode,
} from "./docsTheme";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DocSection {
  slug: string;
  title: string;
  articleCount?: number;
}

interface DocsLayoutProps {
  children: React.ReactNode;
  sections?: DocSection[];
}

interface NavArticle {
  slug: string;
  title: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SIDEBAR_WIDTH = 280;
const TOPBAR_HEIGHT = 56;

const DEFAULT_SECTIONS: DocSection[] = getSeedSections().map(
  ({ slug, title, articleCount }) => ({ slug, title, articleCount }),
);

/** section slug -> ordered articles, from the static seed */
const ARTICLES_BY_CATEGORY: Record<string, NavArticle[]> = SEED_ARTICLES.reduce(
  (acc, article) => {
    (acc[article.category] ??= []).push({
      slug: article.slug,
      title: article.title,
    });
    return acc;
  },
  {} as Record<string, NavArticle[]>,
);

// ---------------------------------------------------------------------------
// Sidebar navigation tree
// ---------------------------------------------------------------------------

interface SidebarContentProps {
  sections: DocSection[];
  currentPath: string;
  onClose?: () => void;
}

const SidebarContent = memo<SidebarContentProps>(
  ({ sections, currentPath, onClose }) => (
    <Box
      data-testid="docs-sidebar"
      sx={{
        width: SIDEBAR_WIDTH,
        height: "100%",
        overflowY: "auto",
        bgcolor: DOCS.bg,
        borderRight: `1px solid ${DOCS.border}`,
        px: 2,
        py: 3,
        "&::-webkit-scrollbar": { width: 8 },
        "&::-webkit-scrollbar-thumb": {
          bgcolor: DOCS.border,
          borderRadius: 4,
        },
      }}
    >
      <Box
        component="nav"
        data-testid="docs-nav"
        aria-label="Documentation navigation"
      >
        {sections.map((section) => {
          const articles = ARTICLES_BY_CATEGORY[section.slug] ?? [];
          const sectionActive =
            currentPath === `/docs/category/${section.slug}`;
          return (
            <Box key={section.slug} sx={{ mb: 2.5 }}>
              {/* Group header */}
              <Box
                component={Link}
                to={`/docs/category/${section.slug}`}
                onClick={onClose}
                sx={{
                  display: "block",
                  px: 1.25,
                  mb: 0.75,
                  textDecoration: "none",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  letterSpacing: 0.2,
                  color: sectionActive ? DOCS.accent : DOCS.text,
                  "&:hover": { color: DOCS.accent },
                }}
              >
                {section.title}
              </Box>

              {/* Article links */}
              <Box sx={{ borderLeft: `1px solid ${DOCS.border}`, ml: 1.25 }}>
                {articles.map((article) => {
                  const isActive = currentPath === `/docs/${article.slug}`;
                  return (
                    <Box
                      key={article.slug}
                      component={Link}
                      to={`/docs/${article.slug}`}
                      onClick={onClose}
                      aria-current={isActive ? "page" : undefined}
                      sx={{
                        display: "block",
                        pl: 1.75,
                        pr: 1,
                        py: 0.55,
                        ml: "-1px",
                        borderLeft: "2px solid",
                        borderColor: isActive ? DOCS.accent : "transparent",
                        textDecoration: "none",
                        fontSize: "0.84rem",
                        lineHeight: 1.4,
                        fontWeight: isActive ? 600 : 400,
                        color: isActive ? DOCS.accent : DOCS.textMuted,
                        transition: "color 0.12s",
                        "&:hover": { color: DOCS.text },
                      }}
                    >
                      {article.title}
                    </Box>
                  );
                })}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  ),
);

SidebarContent.displayName = "SidebarContent";

// ---------------------------------------------------------------------------
// Top bar
// ---------------------------------------------------------------------------

interface TopBarProps {
  onOpenNav: () => void;
  isMobile: boolean;
  mode: DocsMode;
  onToggleMode: () => void;
}

const TopBar = memo<TopBarProps>(
  ({ onOpenNav, isMobile, mode, onToggleMode }) => {
    const [searchOpen, setSearchOpen] = useState(false);
    const handleOpenSearch = useCallback(() => setSearchOpen(true), []);
    const handleCloseSearch = useCallback(() => setSearchOpen(false), []);

    return (
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 1100,
          minHeight: TOPBAR_HEIGHT,
          display: "flex",
          alignItems: "center",
          gap: { xs: 1, sm: 1.5 },
          px: { xs: 1.5, md: 2.5 },
          py: 0,
          bgcolor: DOCS.topbarBg,
          backdropFilter: "blur(10px)",
          borderBottom: `1px solid ${DOCS.border}`,
        }}
      >
        {isMobile && (
          <IconButton
            aria-label="Open documentation navigation"
            onClick={onOpenNav}
            sx={{ color: DOCS.text }}
          >
            <MenuIcon size={20} />
          </IconButton>
        )}

        <Box
          component={Link}
          to="/docs"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            textDecoration: "none",
            color: DOCS.text,
            flexShrink: 0,
            minWidth: 0,
            mr: { xs: "auto", md: 0 },
          }}
        >
          <Box
            component="img"
            src={mode === "light" ? LightDocsLogo : "/WhiteLogo.png"}
            alt="Techietribe"
            sx={{
              height: 26,
              width: "auto",
              maxWidth: { xs: 190, md: 240 },
              display: { xs: "none", sm: "block" },
            }}
          />
          <Box
            component="img"
            src={CompactDocsLogo}
            alt="Techietribe"
            sx={{
              height: 32,
              width: 32,
              objectFit: "contain",
              display: { xs: "block", sm: "none" },
            }}
          />
          <Box
            component="span"
            sx={{
              fontWeight: 600,
              fontSize: "0.95rem",
              color: DOCS.textMuted,
              borderLeft: `1px solid ${DOCS.border}`,
              pl: 1,
              display: { xs: "none", sm: "block" },
            }}
          >
            Docs
          </Box>
        </Box>

        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: { xs: "none", md: "flex" },
            justifyContent: "center",
            px: { md: 2 },
          }}
        >
          <Box sx={{ width: "100%", maxWidth: 420 }}>
            <DocSearch placeholder="Search documentation…" />
          </Box>
        </Box>

        <Tooltip title="Search docs">
          <IconButton
            onClick={handleOpenSearch}
            aria-label="Search documentation"
            sx={{
              display: { xs: "inline-flex", md: "none" },
              color: DOCS.textMuted,
              border: `1px solid ${DOCS.border}`,
              borderRadius: "8px",
              p: 0.75,
              flexShrink: 0,
              "&:hover": { color: DOCS.text, borderColor: DOCS.borderStrong },
            }}
          >
            <SearchIcon size={17} />
          </IconButton>
        </Tooltip>

        <Dialog
          open={searchOpen}
          onClose={handleCloseSearch}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              m: { xs: 1.5, sm: 3 },
              width: { xs: "calc(100% - 24px)", sm: "100%" },
              maxWidth: 560,
              overflow: "visible",
              borderRadius: "14px",
              bgcolor: DOCS.bg,
              border: `1px solid ${DOCS.border}`,
              boxShadow: "0 24px 70px rgba(0,0,0,0.35)",
            },
          }}
        >
          <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
            <DocSearch
              placeholder="Search documentation…"
              autoFocus
              onResultClick={handleCloseSearch}
            />
          </Box>
        </Dialog>

        <Tooltip title={mode === "dark" ? "Light mode" : "Dark mode"}>
          <IconButton
            onClick={onToggleMode}
            aria-label="Toggle docs theme"
            sx={{
              color: DOCS.textMuted,
              border: `1px solid ${DOCS.border}`,
              borderRadius: "8px",
              p: 0.75,
              flexShrink: 0,
              "&:hover": { color: DOCS.text, borderColor: DOCS.borderStrong },
            }}
          >
            {mode === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          </IconButton>
        </Tooltip>

        {!isMobile && (
          <Box
            component={Link}
            to="/"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              textDecoration: "none",
              color: DOCS.textMuted,
              fontSize: "0.85rem",
              fontWeight: 500,
              flexShrink: 0,
              "&:hover": { color: DOCS.text },
            }}
          >
            Visit site
            <ArrowUpRight size={14} />
          </Box>
        )}
      </Box>
    );
  },
);

TopBar.displayName = "TopBar";

// ---------------------------------------------------------------------------
// Main Layout
// ---------------------------------------------------------------------------

const DocsLayout = memo<DocsLayoutProps>(
  ({ children, sections = DEFAULT_SECTIONS }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const location = useLocation();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [mode, setMode] = useState<DocsMode>(readDocsMode);

    const handleOpenDrawer = useCallback(() => setDrawerOpen(true), []);
    const handleCloseDrawer = useCallback(() => setDrawerOpen(false), []);
    const handleToggleMode = useCallback(
      () => setMode((m) => (m === "dark" ? "light" : "dark")),
      [],
    );

    // Apply the theme to the document root so portalled content (mobile drawer,
    // search dropdown) is themed too, and persist the choice. The attribute is
    // left in place across navigation (the --docs-* vars are unused elsewhere),
    // which avoids a flash when moving between docs pages.
    useEffect(() => {
      document.documentElement.setAttribute("data-docs-theme", mode);
      try {
        window.localStorage.setItem(DOCS_THEME_STORAGE_KEY, mode);
      } catch {
        /* storage unavailable — non-fatal */
      }
    }, [mode]);

    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: DOCS.bg,
          color: DOCS.text,
        }}
      >
        <style>{DOCS_THEME_CSS}</style>
        <TopBar
          onOpenNav={handleOpenDrawer}
          isMobile={isMobile}
          mode={mode}
          onToggleMode={handleToggleMode}
        />

        <Box sx={{ display: "flex", alignItems: "flex-start" }}>
          {/* Desktop sidebar */}
          {!isMobile && (
            <Box
              sx={{
                flexShrink: 0,
                width: SIDEBAR_WIDTH,
                position: "sticky",
                top: TOPBAR_HEIGHT,
                height: `calc(100vh - ${TOPBAR_HEIGHT}px)`,
              }}
            >
              <SidebarContent
                sections={sections}
                currentPath={location.pathname}
              />
            </Box>
          )}

          {/* Mobile drawer */}
          {isMobile && (
            <Drawer
              open={drawerOpen}
              onClose={handleCloseDrawer}
              variant="temporary"
              ModalProps={{ keepMounted: true }}
              PaperProps={{ sx: { width: SIDEBAR_WIDTH, bgcolor: DOCS.bg } }}
            >
              <SidebarContent
                sections={sections}
                currentPath={location.pathname}
                onClose={handleCloseDrawer}
              />
            </Drawer>
          )}

          {/* Main content */}
          <Box component="main" sx={{ flex: 1, minWidth: 0 }}>
            {children}
          </Box>
        </Box>
      </Box>
    );
  },
);

DocsLayout.displayName = "DocsLayout";

export default DocsLayout;
