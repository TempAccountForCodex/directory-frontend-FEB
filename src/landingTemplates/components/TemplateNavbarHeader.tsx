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
import {
  getEditableImageProps,
  getEditableTextProps,
} from "../utils/editableProps";

// Resolve relative nav targets to the current site's base path (/site/:slug)
// or, when browsing the template gallery, to the landing-preview base path
// (/landing-preview/:templateId) so internal page links don't 404 to a bare
// "/about" style route.
const siteBase = (() => {
  if (typeof window === "undefined") return "";
  const m = window.location.pathname.match(/^(\/site\/[^/]+)/);
  return m ? m[1] : "";
})();
const previewBase = (() => {
  if (typeof window === "undefined") return "";
  const m = window.location.pathname.match(/^(\/landing-preview\/[^/]+)/);
  return m ? m[1] : "";
})();
const previewSearch =
  typeof window !== "undefined" && previewBase ? window.location.search : "";
const resolveTarget = (target: string): string => {
  if (!target || target.startsWith("#") || target.startsWith("http") || target.startsWith("//"))
    return target;
  const suffix = target.startsWith("/") ? target : `/${target}`;
  if (siteBase) return `${siteBase}${suffix}`;
  if (previewBase) return `${previewBase}${suffix}${previewSearch}`;
  return target;
};

export interface NavbarContentFields {
  blockId?: string | number;
  brandName?: string;
  logo?: string;
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
  target?: string;
  link?: string;
  url?: string;
  type?: string;
}

type TemplateNavItem = SectionNavItem & {
  target?: string;
  link?: string;
  url?: string;
  type?: string;
};

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
  /**
   * Text/logo color used inside the mobile drawer, which always renders on a
   * white surface regardless of the desktop bar's background. Defaults to the
   * same dark tone the desktop bar used before colored headers existed, so
   * templates that never pass this see zero behavior change. Templates with a
   * dark/colored desktop `bgColor` (and therefore a light `navLinkColor`)
   * should leave this at its dark default rather than reusing `navLinkColor`.
   */
  mobileTextColor?: string;
  /**
   * Text color used on the CTA button once hovered/filled with `ctaColor`.
   * Defaults to white, which is correct when `ctaColor` is a dark/mid tone.
   * If a template sets `ctaColor` to a light color (e.g. to match a light
   * `navLinkColor` on a dark header), pass a dark color here so the filled
   * hover state stays readable instead of light-text-on-light-bg.
   */
  ctaHoverTextColor?: string;
  /**
   * CTA border/text color used inside the mobile drawer's white panel.
   * Defaults to `ctaColor` (previous behavior). Override when `ctaColor` is
   * a light color meant for a dark desktop header, since that same light
   * color would be invisible on the drawer's white background.
   */
  mobileCtaColor?: string;
  /**
   * Text color used on the mobile drawer's CTA button once hovered/filled
   * with `mobileCtaColor`. Defaults to white. Override when `mobileCtaColor`
   * is a light color.
   */
  mobileCtaHoverTextColor?: string;
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
  mobileTextColor = "#15110f",
  ctaHoverTextColor = "#fff",
  mobileCtaColor,
  mobileCtaHoverTextColor = "#fff",
}) => {
  const menuId: string = navbarContent.menuId || "";
  const [fetchedItems, setFetchedItems] = useState<
    TemplateNavItem[]
  >([]);
  const [isMobile, setIsMobile] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const headerRef = React.useRef<HTMLElement>(null);

  // Fetch custom menu items. If this template has no explicit menu selected,
  // use the first website menu as supplemental page links.
  useEffect(() => {
    if (!websiteId) {
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
        const found = menuId
          ? menus.find(
              (m: any) => String(m.id) === String(menuId) || m.handle === menuId,
            )
          : menus[0];
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
  const drawerCtaColor = mobileCtaColor || ctaColor;
  const ctaText = navbarContent.ctaText || "";
  const ctaUrl = navbarContent.ctaUrl || "#contact";
  const logoText =
    navbarContent.brandName || navbarContent.logoText || fallbackName;
  const logoImage = navbarContent.logoImage || navbarContent.logo || "";
  const logoTextField =
    typeof navbarContent.brandName === "string" ? "brandName" : "logoText";
  const logoImageField =
    typeof navbarContent.logoImage === "string" ? "logoImage" : "logo";
  const hasLogoImage =
    typeof logoImage === "string" &&
    /^(?:https?:\/\/|\/)/i.test(logoImage.trim());

  // Determine which nav items to show
  const configuredNavItems = Array.isArray(navbarContent.navigationItems)
    ? (navbarContent.navigationItems as TemplateNavItem[])
    : Array.isArray(navbarContent.menuItems)
      ? (navbarContent.menuItems as TemplateNavItem[])
      : [];
  const getNavTarget = (item: TemplateNavItem) =>
    item.target || item.link || item.url || "";
  const normalizeNavTarget = (target: string) =>
    target ? target : "";
  const dedupeNavItems = (items: TemplateNavItem[]) => {
    const seen = new Set<string>();
    return items.filter((item) => {
      const key = normalizeNavTarget(getNavTarget(item)) || item.id || item.label;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };
  const hasExplicitMenu = Boolean(menuId && fetchedItems.length > 0);
  const sectionPageItems = sectionNavItems.filter((item) => {
    const target = getNavTarget(item);
    return target && !target.startsWith("#");
  });
  const sectionKeys = new Set(
    sectionNavItems.flatMap((item) => [
      item.id,
      item.label?.toLowerCase(),
      getNavTarget(item).replace(/^#/, ""),
    ]).filter(Boolean),
  );
  const pageOnlyItems = (items: TemplateNavItem[]) =>
    items.filter((item) => {
      const target = getNavTarget(item);
      if (!target || target === "/" || target.startsWith("#")) return false;
      if (!target.startsWith("/")) return false;
      const label = item.label?.toLowerCase();
      return !sectionKeys.has(label) && !sectionKeys.has(target.replace(/^\//, ""));
    });
  const supplementalItems = pageOnlyItems(
    configuredNavItems.length ? configuredNavItems : !menuId ? fetchedItems : [],
  );
  const displayNavItems = hasExplicitMenu
    ? dedupeNavItems([...fetchedItems, ...sectionPageItems])
    : dedupeNavItems([...sectionNavItems, ...supplementalItems]);

  const handleNavClick = (
    event: React.MouseEvent,
    item: TemplateNavItem,
  ) => {
    const target = getNavTarget(item);
    if (target.startsWith("#")) {
      event.preventDefault();
      onScrollToSection?.(target.replace(/^#/, ""));
      return;
    }
    if (!target && item.id) {
      event.preventDefault();
      onScrollToSection?.(item.id);
    }
  };

  // Logo text color must match whichever surface it renders on: the desktop
  // bar's own background (navLinkColor) vs. the mobile drawer, which is
  // always a white panel (mobileTextColor) regardless of the desktop bar's
  // color scheme.
  const renderLogo = (textColor: string) => (
    <Box
      component="a"
      href={resolveTarget("/")}
      sx={{ textDecoration: "none", display: "flex", alignItems: "center", flexShrink: 0 }}
    >
      {hasLogoImage ? (
        <Box
          component="img"
          {...getEditableImageProps(
            navbarContent.blockId,
            logoImageField,
            "Header logo",
          )}
          src={logoImage}
          alt={logoText}
          sx={{ height: 36, width: "auto", maxWidth: 140, objectFit: "contain" }}
        />
      ) : (
        <Typography
          {...getEditableTextProps(
            navbarContent.blockId,
            logoTextField,
            "single",
          )}
          sx={{
            fontFamily: headingFont,
            fontSize: { xs: "1.3rem", md: "1.7rem" },
            fontWeight: 800,
            letterSpacing: "-0.04em",
            color: textColor,
            lineHeight: 1,
          }}
        >
          {logoText}
        </Typography>
      )}
    </Box>
  );
  const Logo = renderLogo(navLinkColor);

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
              {displayNavItems.map((item, idx) => {
                const target = getNavTarget(item);
                return (
                  <Box
                    key={item.id ?? `${item.label}-${idx}`}
                    component={target ? "a" : "span"}
                    href={target ? resolveTarget(target) : undefined}
                    onClick={(event: React.MouseEvent) =>
                      handleNavClick(event, item)
                    }
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
                );
              })}
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
                  "&:hover": { bgcolor: ctaColor, color: ctaHoverTextColor, borderColor: ctaColor, boxShadow: "none" },
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
          {renderLogo(mobileTextColor)}
          <IconButton onClick={closeDrawer} size="small" sx={{ color: mobileTextColor }}>
            <CloseIcon size={18} />
          </IconButton>
        </Stack>
        <Divider sx={{ mb: 2 }} />
        {displayNavItems.map((item, idx) => {
          const target = getNavTarget(item);
          return (
            <Box
              key={item.id ?? `${item.label}-${idx}`}
              component={target ? "a" : "span"}
              href={target ? resolveTarget(target) : undefined}
              onClick={(event: React.MouseEvent) => {
                handleNavClick(event, item);
                closeDrawer();
              }}
              sx={{
                display: "block",
                px: 1.5,
                py: 1.1,
                fontSize: "0.95rem",
                fontWeight: 500,
                color: mobileTextColor,
                textDecoration: "none",
                borderRadius: "10px",
                cursor: "pointer",
                "&:hover": { color: themeColor, bgcolor: "rgba(0,0,0,0.04)" },
              }}
            >
              {item.label}
            </Box>
          );
        })}
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
                borderColor: drawerCtaColor,
                color: drawerCtaColor,
                fontWeight: 600,
                borderRadius: 999,
                textTransform: "none",
                "&:hover": { bgcolor: drawerCtaColor, color: mobileCtaHoverTextColor, borderColor: drawerCtaColor },
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
