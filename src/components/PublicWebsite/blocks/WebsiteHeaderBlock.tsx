import React, { memo, useState, useEffect, useCallback } from "react";
import { apiClient } from "../../../api/client";
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Drawer,
  IconButton,
  Divider,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Menu as MenuIcon, X as CloseIcon } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

interface MenuItem {
  id?: string | number;
  label: string;
  target: string;
  type?: "page" | "section" | "custom";
}

interface HeaderContent {
  logoType?: "text" | "image";
  logoText?: string;
  logoImage?: string;
  menuItems?: MenuItem[];
  ctaText?: string;
  ctaUrl?: string;
  sticky?: boolean;
  transparent?: boolean;
  primaryColor?: string;
  headingColor?: string;
}

interface WebsiteHeaderBlockProps {
  block: {
    id: number;
    blockType: string;
    content: HeaderContent;
    sortOrder: number;
  };
  primaryColor?: string;
  headingColor?: string;
  bodyColor?: string;
  websiteId?: string | number;
  onCtaClick?: (blockType: string, ctaText: string) => void;
}

// ── Smooth-scroll helper ──────────────────────────────────────────────────────
const handleNavClick = (
  e: React.MouseEvent,
  target: string,
  type?: string,
) => {
  if (type === "section" || target.startsWith("#")) {
    e.preventDefault();
    const id = target.replace(/^#/, "");
    const el = document.getElementById(id) || document.querySelector(`[data-section="${id}"]`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
};

// ── Component ─────────────────────────────────────────────────────────────────

const WebsiteHeaderBlock = memo(function WebsiteHeaderBlock({
  block,
  primaryColor = "#6366f1",
  headingColor = "#0f172a",
  websiteId,
  onCtaClick,
}: WebsiteHeaderBlockProps) {
  const { content } = block;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [fetchedMenuItems, setFetchedMenuItems] = useState<MenuItem[]>([]);

  const logoType = content.logoType ?? "text";
  const logoText = content.logoText || "Brand";
  const logoImage = content.logoImage || "";
  const menuId = content.menuId || "";
  const ctaUrl = content.ctaUrl || "#contact";
  const sticky = content.sticky !== false;
  const transparent = content.transparent === true;

  useEffect(() => {
    if (!menuId || !websiteId) { setFetchedMenuItems([]); return; }
    let cancelled = false;
    apiClient.get(`/websites/${websiteId}/menus`)
      .then((res) => {
        if (cancelled) return;
        const raw = res.data?.data ?? res.data ?? [];
        const menus = Array.isArray(raw) ? raw : [];
        const found = menus.find(
          (m: any) => String(m.id) === String(menuId) || m.handle === menuId,
        );
        setFetchedMenuItems(Array.isArray(found?.items) ? found.items : []);
      })
      .catch(() => { if (!cancelled) setFetchedMenuItems([]); });
    return () => { cancelled = true; };
  }, [menuId, websiteId]);

  const menuItems: MenuItem[] = fetchedMenuItems.length > 0
    ? fetchedMenuItems
    : Array.isArray(content.menuItems) ? content.menuItems : [];

  const accent = content.primaryColor || primaryColor;
  const textCol = content.headingColor || headingColor;

  useEffect(() => {
    if (!transparent) return;
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [transparent]);

  const bgColor = transparent && !scrolled ? "transparent" : "#ffffff";
  const shadow =
    transparent && !scrolled ? "none" : "0 1px 12px rgba(0,0,0,0.08)";

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const Logo = (
    <Box
      component={ctaUrl ? "a" : "div"}
      href="/"
      sx={{
        textDecoration: "none",
        display: "flex",
        alignItems: "center",
        flexShrink: 0,
        cursor: "pointer",
      }}
    >
      {logoType === "image" && logoImage ? (
        <Box
          component="img"
          src={logoImage}
          alt={logoText || "Logo"}
          sx={{ height: 36, width: "auto", maxWidth: 140, objectFit: "contain" }}
        />
      ) : (
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: "1.1rem",
            color: transparent && !scrolled ? "#fff" : textCol,
            letterSpacing: "0.02em",
            textTransform: "uppercase",
            lineHeight: 1,
          }}
        >
          {logoText}
        </Typography>
      )}
    </Box>
  );

  const NavLinks = ({ vertical = false }: { vertical?: boolean }) => (
    <Stack
      direction={vertical ? "column" : "row"}
      spacing={0}
      alignItems={vertical ? "stretch" : "center"}
    >
      {menuItems.map((item, idx) => (
        <Box
          key={item.id ?? idx}
          component="a"
          href={item.target}
          onClick={(e) => handleNavClick(e, item.target, item.type)}
          sx={{
            textDecoration: "none",
            color: vertical
              ? textCol
              : transparent && !scrolled
              ? "rgba(255,255,255,0.8)"
              : "#4b5563",
            fontSize: vertical ? "0.95rem" : "0.78rem",
            fontWeight: 500,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            px: vertical ? 1.5 : 1.8,
            py: vertical ? 1.1 : 0.6,
            borderRadius: vertical ? "10px" : 0,
            display: "block",
            transition: "color 0.15s",
            "&:hover": {
              color: accent,
              bgcolor: vertical ? "rgba(0,0,0,0.04)" : "transparent",
            },
          }}
        >
          {item.label}
        </Box>
      ))}
    </Stack>
  );

  const CtaButton = ({ fullWidth = false }: { fullWidth?: boolean }) =>
    ctaText ? (
      <Button
        component="a"
        href={ctaUrl}
        onClick={(e: React.MouseEvent) => {
          handleNavClick(e, ctaUrl);
          onCtaClick?.("WEBSITE_HEADER", ctaText);
        }}
        variant="outlined"
        fullWidth={fullWidth}
        sx={{
          borderColor: accent,
          color: accent,
          fontWeight: 600,
          textTransform: "uppercase",
          fontSize: "0.78rem",
          letterSpacing: "0.04em",
          borderRadius: "100px",
          px: 2.5,
          py: 0.8,
          boxShadow: "none",
          flexShrink: 0,
          "&:hover": {
            bgcolor: accent,
            color: "#fff",
            borderColor: accent,
            boxShadow: "none",
          },
        }}
      >
        {ctaText}
      </Button>
    ) : null;

  return (
    <Box
      component="header"
      sx={{
        position: sticky ? "sticky" : "relative",
        top: 0,
        zIndex: 1100,
        width: "100%",
        bgcolor: bgColor,
        boxShadow: shadow,
        transition: "background-color 0.3s, box-shadow 0.3s",
        backdropFilter: transparent && !scrolled ? "none" : "blur(12px)",
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: { xs: 60, md: 68 },
            gap: 2,
          }}
        >
          {/* Logo */}
          {Logo}

          {/* Center nav — desktop only */}
          {!isMobile && menuItems.length > 0 && (
            <Box
              sx={{
                flex: 1,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <NavLinks />
            </Box>
          )}

          {/* Right actions */}
          <Stack direction="row" alignItems="center" spacing={1} sx={{ flexShrink: 0 }}>
            {!isMobile && <CtaButton />}

            {/* Hamburger — mobile only */}
            {isMobile && (
              <IconButton
                onClick={() => setDrawerOpen(true)}
                aria-label="Open menu"
                sx={{
                  color:
                    transparent && !scrolled ? "#fff" : textCol,
                  border: `1.5px solid ${transparent && !scrolled ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.1)"}`,
                  borderRadius: "10px",
                  p: "7px",
                }}
              >
                <MenuIcon size={20} />
              </IconButton>
            )}
          </Stack>
        </Box>
      </Container>

      {/* Mobile drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={closeDrawer}
        PaperProps={{
          sx: {
            width: 280,
            p: 2.5,
            bgcolor: "#fff",
          },
        }}
      >
        {/* Drawer header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          {Logo}
          <IconButton onClick={closeDrawer} size="small" sx={{ color: textCol }}>
            <CloseIcon size={18} />
          </IconButton>
        </Stack>

        <Divider sx={{ mb: 2 }} />

        {/* Nav links */}
        {menuItems.length > 0 && (
          <Box onClick={closeDrawer}>
            <NavLinks vertical />
          </Box>
        )}

        {/* CTA */}
        {ctaText && (
          <Box sx={{ mt: 2.5 }}>
            <CtaButton fullWidth />
          </Box>
        )}
      </Drawer>
    </Box>
  );
});

WebsiteHeaderBlock.displayName = "WebsiteHeaderBlock";
export default WebsiteHeaderBlock;
