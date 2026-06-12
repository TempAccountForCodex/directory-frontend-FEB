import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Container,
  Drawer,
  IconButton,
  Stack,
  Typography,
  Divider,
} from "@mui/material";
import { Menu as MenuIcon, X as CloseIcon } from "lucide-react";
import { apiClient } from "../../api/client";

// Resolve relative nav targets to the current site's base path (/site/:slug)
const siteBase = (() => {
  if (typeof window === "undefined") return "";
  const m = window.location.pathname.match(/^(\/site\/[^/]+)/);
  return m ? m[1] : "";
})();
const resolveTarget = (target: string): string => {
  if (!target || target.startsWith("#") || target.startsWith("http") || target.startsWith("//"))
    return target;
  return siteBase
    ? `${siteBase}${target.startsWith("/") ? target : `/${target}`}`
    : target;
};

export interface NavbarContentFields {
  blockId?: string | number;
  logoType?: string;
  logoText?: string;
  logoImage?: string;
  menuId?: string;
  ctaText?: string;
  ctaUrl?: string;
  sticky?: boolean;
  navLinkColor?: string;
  ctaColor?: string;
  [key: string]: unknown;
}

export interface SectionNavItem {
  label: string;
  id: string;
}

interface Props {
  navbarContent: NavbarContentFields;
  fallbackName?: string;
  sectionNavItems?: SectionNavItem[];
  onScrollToSection?: (id: string) => void;
  themeColor?: string;
  headingFont?: string;
  bgColor?: string;
  borderColor?: string;
  websiteId?: string | number;
}

const TemplateNavbarHeader: React.FC<Props> = ({
  navbarContent,
  fallbackName = "Brand",
  sectionNavItems = [],
  onScrollToSection,
  themeColor = "#124d4e",
  headingFont,
  bgColor,
  borderColor,
  websiteId,
}) => {
  const menuId: string = navbarContent.menuId || "";
  const [fetchedItems, setFetchedItems] = useState<
    Array<{ label: string; target: string; type?: string }>
  >([]);
  const [isMobile, setIsMobile] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const headerRef = React.useRef<HTMLElement>(null);

  // Fetch custom menu items when menuId is set
  useEffect(() => {
    if (!menuId || !websiteId) {
      setFetchedItems([]);
      return;
    }
    let cancelled = false;
    apiClient
      .get(`/websites/${websiteId}/menus`)
      .then((res) => {
        if (cancelled) return;
        const raw = res.data?.data ?? res.data ?? [];
        const menus = Array.isArray(raw) ? raw : [];
        const found = menus.find(
          (m: any) => String(m.id) === String(menuId) || m.handle === menuId,
        );
        setFetchedItems(Array.isArray(found?.items) ? found.items : []);
      })
      .catch(() => {
        if (!cancelled) setFetchedItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, [menuId, websiteId]);

  // Container-width responsive (works inside editor canvas too)
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setIsMobile(entry.contentRect.width < 768);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const sticky = navbarContent.sticky !== false;
  const navLinkColor = navbarContent.navLinkColor || "#15110f";
  const ctaColor = navbarContent.ctaColor || themeColor;
  const ctaText = navbarContent.ctaText || "";
  const ctaUrl = navbarContent.ctaUrl || "#contact";
  const logoText = navbarContent.logoText || fallbackName;
  const logoType = navbarContent.logoType || "text";
  const logoImage = navbarContent.logoImage || "";

  // Determine which nav items to show
  const hasCustomMenu = fetchedItems.length > 0;
  const displayNavItems = hasCustomMenu ? fetchedItems : sectionNavItems;

  const handleNavClick = (item: { label: string; target?: string; id?: string }) => {
    if (hasCustomMenu) {
      const target = (item as any).target || "";
      if (target.startsWith("#")) {
        onScrollToSection?.(target.replace(/^#/, ""));
      }
    } else {
      onScrollToSection?.((item as any).id || "");
    }
  };

  const Logo = (
    <Box
      component="a"
      href="/"
      sx={{ textDecoration: "none", display: "flex", alignItems: "center", flexShrink: 0 }}
    >
      {logoType === "image" && logoImage ? (
        <Box
          component="img"
          src={logoImage}
          alt={logoText}
          sx={{ height: 36, width: "auto", maxWidth: 140, objectFit: "contain" }}
        />
      ) : (
        <Typography
          sx={{
            fontFamily: headingFont,
            fontSize: { xs: "1.3rem", md: "1.7rem" },
            fontWeight: 800,
            letterSpacing: "-0.04em",
            color: navLinkColor,
            lineHeight: 1,
          }}
        >
          {logoText}
        </Typography>
      )}
    </Box>
  );

  return (
    <Box
      ref={headerRef}
      component="header"
      sx={{
        position: sticky ? "sticky" : "relative",
        top: 0,
        zIndex: 1200,
        backdropFilter: "blur(18px)",
        bgcolor: bgColor || "rgba(255,255,255,0.85)",
        borderBottom: `1px solid ${borderColor || "rgba(0,0,0,0.08)"}`,
        width: "100%",
      }}
    >
      <Container maxWidth="xl" sx={{ px: { xs: 2, md: 4 } }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ minHeight: { xs: 60, md: 74 } }}
        >
          {Logo}

          {/* Desktop nav */}
          {!isMobile && displayNavItems.length > 0 && (
            <Stack direction="row" spacing={0} alignItems="center" sx={{ flex: 1, justifyContent: "center" }}>
              {displayNavItems.map((item, idx) => (
                <Box
                  key={(item as any).id ?? idx}
                  component={hasCustomMenu ? "a" : "span"}
                  href={hasCustomMenu ? resolveTarget((item as any).target) : undefined}
                  onClick={() => !hasCustomMenu && handleNavClick(item)}
                  sx={{
                    px: 2,
                    py: 0.5,
                    fontSize: "0.82rem",
                    fontWeight: 500,
                    letterSpacing: "0.03em",
                    color: navLinkColor,
                    textDecoration: "none",
                    cursor: "pointer",
                    transition: "color 160ms ease",
                    "&:hover": { color: themeColor },
                  }}
                >
                  {item.label}
                </Box>
              ))}
            </Stack>
          )}

          {/* Desktop CTA + mobile hamburger */}
          <Stack direction="row" alignItems="center" spacing={1} sx={{ flexShrink: 0 }}>
            {!isMobile && ctaText && (
              <Button
                component="a"
                href={resolveTarget(ctaUrl)}
                onClick={(e: React.MouseEvent) => {
                  if (!navbarContent.ctaUrl || ctaUrl.startsWith("#")) {
                    e.preventDefault();
                    onScrollToSection?.(ctaUrl.replace(/^#/, "") || "contact");
                  }
                }}
                variant="outlined"
                sx={{
                  borderColor: ctaColor,
                  color: ctaColor,
                  fontWeight: 600,
                  textTransform: "none",
                  fontSize: "0.82rem",
                  borderRadius: 999,
                  px: 2.5,
                  py: 0.7,
                  boxShadow: "none",
                  "&:hover": { bgcolor: ctaColor, color: "#fff", borderColor: ctaColor, boxShadow: "none" },
                }}
              >
                {ctaText}
              </Button>
            )}

            {isMobile && (
              <IconButton
                onClick={() => setDrawerOpen(true)}
                aria-label="Open menu"
                sx={{ color: navLinkColor, border: "1.5px solid rgba(0,0,0,0.12)", borderRadius: "10px", p: "7px" }}
              >
                <MenuIcon size={20} />
              </IconButton>
            )}
          </Stack>
        </Stack>
      </Container>

      {/* Mobile drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={closeDrawer}
        PaperProps={{ sx: { width: 280, p: 2.5, bgcolor: "#fff" } }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          {Logo}
          <IconButton onClick={closeDrawer} size="small" sx={{ color: navLinkColor }}>
            <CloseIcon size={18} />
          </IconButton>
        </Stack>
        <Divider sx={{ mb: 2 }} />
        {displayNavItems.map((item, idx) => (
          <Box
            key={(item as any).id ?? idx}
            component={hasCustomMenu ? "a" : "span"}
            href={hasCustomMenu ? resolveTarget((item as any).target) : undefined}
            onClick={() => { handleNavClick(item); closeDrawer(); }}
            sx={{
              display: "block",
              px: 1.5,
              py: 1.1,
              fontSize: "0.95rem",
              fontWeight: 500,
              color: navLinkColor,
              textDecoration: "none",
              borderRadius: "10px",
              cursor: "pointer",
              "&:hover": { color: themeColor, bgcolor: "rgba(0,0,0,0.04)" },
            }}
          >
            {item.label}
          </Box>
        ))}
        {ctaText && (
          <Box sx={{ mt: 2.5 }}>
            <Button
              component="a"
              href={resolveTarget(ctaUrl)}
              onClick={(e: React.MouseEvent) => {
                if (!navbarContent.ctaUrl || ctaUrl.startsWith("#")) {
                  e.preventDefault();
                  onScrollToSection?.(ctaUrl.replace(/^#/, "") || "contact");
                }
                closeDrawer();
              }}
              variant="outlined"
              fullWidth
              sx={{
                borderColor: ctaColor,
                color: ctaColor,
                fontWeight: 600,
                borderRadius: 999,
                textTransform: "none",
                "&:hover": { bgcolor: ctaColor, color: "#fff", borderColor: ctaColor },
              }}
            >
              {ctaText}
            </Button>
          </Box>
        )}
      </Drawer>
    </Box>
  );
};

export default TemplateNavbarHeader;
