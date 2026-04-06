/**
 * DocsLayout — Sidebar navigation wrapper for documentation pages (Step 10.9.7)
 *
 * Layout with:
 * - Sidebar: sections + articles navigation tree
 * - Main content area
 * - Mobile: sidebar collapses to a drawer
 */

import React, { memo, useState, useCallback, useMemo } from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import Container from "@mui/material/Container";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import {
  Menu as MenuIcon,
  BookOpen as BookOpenIcon,
  ChevronRight,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import DocSearch from "./DocSearch";

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

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SIDEBAR_WIDTH = 260;

const DEFAULT_SECTIONS: DocSection[] = [
  { slug: "getting-started", title: "Getting Started" },
  { slug: "features", title: "Features" },
  { slug: "troubleshooting", title: "Troubleshooting" },
  { slug: "api", title: "API Reference" },
];

// ---------------------------------------------------------------------------
// SidebarContent
// ---------------------------------------------------------------------------

interface SidebarContentProps {
  sections: DocSection[];
  currentPath: string;
  onClose?: () => void;
}

const SidebarContent = memo<SidebarContentProps>(
  ({ sections, currentPath, onClose }) => {
    return (
      <Box
        data-testid="docs-sidebar"
        sx={{
          width: SIDEBAR_WIDTH,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          bgcolor: "background.paper",
          borderRight: "1px solid",
          borderColor: "divider",
        }}
      >
        {/* Brand */}
        <Box
          sx={{
            px: 2.5,
            py: 2,
            display: "flex",
            alignItems: "center",
            gap: 1,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <BookOpenIcon size={20} />
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700, color: "text.primary" }}
          >
            Help Center
          </Typography>
        </Box>

        {/* Search */}
        <Box sx={{ px: 2, py: 1.5 }}>
          <DocSearch placeholder="Search docs..." />
        </Box>

        <Divider />

        {/* Navigation */}
        <Box sx={{ overflowY: "auto", flex: 1 }}>
          <nav data-testid="docs-nav" aria-label="Documentation navigation">
            <Typography
              variant="overline"
              sx={{
                px: 2.5,
                pt: 2,
                pb: 0.5,
                display: "block",
                color: "text.secondary",
                fontWeight: 700,
                letterSpacing: 1,
                fontSize: "0.7rem",
              }}
            >
              Categories
            </Typography>

            <List dense disablePadding>
              {sections.map((section) => {
                const isActive = currentPath.includes(
                  `/docs/category/${section.slug}`,
                );
                return (
                  <ListItemButton
                    key={section.slug}
                    component={Link}
                    to={`/docs/category/${section.slug}`}
                    selected={isActive}
                    onClick={onClose}
                    sx={{
                      px: 2.5,
                      py: 0.75,
                      borderRadius: 1,
                      mx: 1,
                      mb: 0.25,
                      "&.Mui-selected": {
                        bgcolor: "primary.main",
                        color: "primary.contrastText",
                        "&:hover": { bgcolor: "primary.dark" },
                      },
                    }}
                  >
                    <ListItemText
                      primary={section.title}
                      secondary={
                        section.articleCount !== undefined
                          ? `${section.articleCount} articles`
                          : undefined
                      }
                      primaryTypographyProps={{
                        variant: "body2",
                        fontWeight: isActive ? 700 : 500,
                      }}
                      secondaryTypographyProps={{
                        variant: "caption",
                        sx: {
                          color: isActive
                            ? "primary.contrastText"
                            : "text.secondary",
                          opacity: 0.8,
                        },
                      }}
                    />
                    <ChevronRight size={14} />
                  </ListItemButton>
                );
              })}
            </List>
          </nav>
        </Box>

        {/* Footer link */}
        <Box
          sx={{
            p: 2,
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography
            component={Link}
            to="/docs"
            variant="caption"
            sx={{
              color: "text.secondary",
              textDecoration: "none",
              "&:hover": { color: "text.primary" },
            }}
          >
            ← Back to all docs
          </Typography>
        </Box>
      </Box>
    );
  },
);

SidebarContent.displayName = "SidebarContent";

// ---------------------------------------------------------------------------
// Main Layout
// ---------------------------------------------------------------------------

const DocsLayout = memo<DocsLayoutProps>(
  ({ children, sections = DEFAULT_SECTIONS }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const location = useLocation();
    const [drawerOpen, setDrawerOpen] = useState(false);

    const handleOpenDrawer = useCallback(() => setDrawerOpen(true), []);
    const handleCloseDrawer = useCallback(() => setDrawerOpen(false), []);

    return (
      <Box
        sx={{
          display: "flex",
          minHeight: "100vh",
          bgcolor: "background.default",
        }}
      >
        {/* Mobile hamburger */}
        {isMobile && (
          <Box
            sx={{
              position: "fixed",
              top: 70,
              left: 8,
              zIndex: 1200,
            }}
          >
            <IconButton
              aria-label="Open documentation navigation"
              onClick={handleOpenDrawer}
              sx={{
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                boxShadow: 1,
              }}
            >
              <MenuIcon size={20} />
            </IconButton>
          </Box>
        )}

        {/* Desktop sidebar */}
        {!isMobile && (
          <Box sx={{ flexShrink: 0, width: SIDEBAR_WIDTH }}>
            <Box
              sx={{
                position: "fixed",
                top: 64,
                height: "calc(100vh - 64px)",
                overflowY: "auto",
              }}
            >
              <SidebarContent
                sections={sections}
                currentPath={location.pathname}
              />
            </Box>
          </Box>
        )}

        {/* Mobile drawer */}
        {isMobile && (
          <Drawer
            open={drawerOpen}
            onClose={handleCloseDrawer}
            variant="temporary"
            ModalProps={{ keepMounted: true }}
            PaperProps={{ sx: { width: SIDEBAR_WIDTH } }}
          >
            <SidebarContent
              sections={sections}
              currentPath={location.pathname}
              onClose={handleCloseDrawer}
            />
          </Drawer>
        )}

        {/* Main content */}
        <Box
          component="main"
          sx={{
            flex: 1,
            ml: { md: 0 },
            pl: { xs: 2, sm: 3, md: 4 },
            pr: { xs: 2, sm: 3, md: 4 },
            pt: { xs: 7, md: 4 },
            pb: 8,
            maxWidth: "100%",
            overflowX: "hidden",
          }}
        >
          {children}
        </Box>
      </Box>
    );
  },
);

DocsLayout.displayName = "DocsLayout";

export default DocsLayout;
