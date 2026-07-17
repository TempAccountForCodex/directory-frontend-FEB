import { useEffect, useMemo, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
import {
  ArrowRight,
  BookOpen,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LayoutTemplate,
  List,
  Mail,
  Newspaper,
  Rocket,
  Sparkles,
  Store,
  Tag,
  type LucideIcon,
} from "lucide-react";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import PinterestIcon from "@mui/icons-material/Pinterest";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const WhiteLogo = "/WhiteLogo.png";
const NAV_ACCENT = "#47aab6";
const NAV_ACCENT_DARK = "#2d7a85";
const NAV_ACCENT_SOFT = "rgba(71,170,182,0.12)";

const tabs = [
  { label: "Templates", path: "/templates" },
  { label: "Listings", path: "/listings" },
  // { label: "Blog", path: "/blog" },
  { label: "About", path: "/about" },
  { label: "Pricing", path: "/pricing" },
  { label: "Contact", path: "/contact" },
];

const docsMenuItems = [
  { label: "Getting Started", path: "/docs/category/getting-started" },
  {
    label: "Create your first website",
    path: "/docs/create-your-first-website",
  },
  {
    label: "Publish your first listing",
    path: "/docs/publish-your-first-listing",
  },
  { label: "Website Builder", path: "/docs/website-builder" },
  { label: "Directory listings", path: "/docs/directory-listings" },
  { label: "Troubleshooting", path: "/docs/category/troubleshooting" },
  { label: "What's New", path: "/docs/changelog" },
];

type DocsMenuLink = {
  label: string;
  path: string;
  icon?: LucideIcon;
};

const docsMenuGroups: {
  title: string;
  span?: number;
  items: DocsMenuLink[];
}[] = [
  {
    title: "Get Started",
    items: [
      {
        label: "Getting Started",
        path: "/docs/category/getting-started",
        icon: Rocket,
      },
      {
        label: "Create your first website",
        path: "/docs/create-your-first-website",
        icon: LayoutTemplate,
      },
    ],
  },
  {
    title: "Build",
    items: [
      {
        label: "Website Builder",
        path: "/docs/website-builder",
        icon: BookOpen,
      },
      {
        label: "Directory listings",
        path: "/docs/directory-listings",
        icon: List,
      },
    ],
  },
  {
    title: "Manage & Updates",
    span: 2,
    items: [
      {
        label: "Publish your first listing",
        path: "/docs/publish-your-first-listing",
      },
      {
        label: "Troubleshooting",
        path: "/docs/category/troubleshooting",
      },
      { label: "What's New", path: "/docs/changelog", icon: Sparkles },
    ],
  },
];

const docsQuickStartItems: (DocsMenuLink & {
  iconBg: string;
  iconColor: string;
})[] = [
  {
    label: "Build a website",
    path: "/docs/create-your-first-website",
    icon: LayoutTemplate,
    iconBg: NAV_ACCENT_SOFT,
    iconColor: NAV_ACCENT,
  },
  {
    label: "Publish a listing",
    path: "/docs/publish-your-first-listing",
    icon: List,
    iconBg: NAV_ACCENT_SOFT,
    iconColor: NAV_ACCENT,
  },
  {
    label: "Set up a store",
    path: "/docs/stores",
    icon: Store,
    iconBg: NAV_ACCENT_SOFT,
    iconColor: NAV_ACCENT,
  },
];

const mobileNavIcons: Record<string, LucideIcon> = {
  Templates: LayoutTemplate,
  Listings: List,
  Blog: Newspaper,
  About: Building2,
  Pricing: Tag,
  Contact: Mail,
};

const mobileSocialLinks = [
  {
    label: "Facebook",
    Icon: FacebookIcon,
    href: "https://www.facebook.com/thetechietribe.official",
  },
  {
    label: "Instagram",
    Icon: InstagramIcon,
    href: "https://www.instagram.com/thetechietribe_/",
  },
  {
    label: "LinkedIn",
    Icon: LinkedInIcon,
    href: "https://www.linkedin.com/company/techietribe",
  },
  {
    label: "Pinterest",
    Icon: PinterestIcon,
    href: "https://www.pinterest.com/thetechietribe_/",
  },
];

function Navbar() {
  const auth = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [docsMenuOpen, setDocsMenuOpen] = useState(false);
  const [mobileDocsOpen, setMobileDocsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const docsMenuRef = useRef<HTMLDivElement | null>(null);
  const docsCloseTimerRef = useRef<number | null>(null);

  const activePath = useMemo(() => {
    if (location.pathname.startsWith("/listings/")) return "/listings";
    return location.pathname;
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  useEffect(() => {
    setDocsMenuOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!docsMenuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!docsMenuRef.current?.contains(event.target as Node)) {
        setDocsMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDocsMenuOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [docsMenuOpen]);

  useEffect(() => {
    return () => {
      if (docsCloseTimerRef.current) {
        window.clearTimeout(docsCloseTimerRef.current);
      }
    };
  }, []);

  const isDashboardRoute = location.pathname.startsWith("/dashboard");
  if (
    location.pathname === "/dashboard" ||
    /^\/business\//.test(location.pathname) ||
    isDashboardRoute
  ) {
    return null;
  }

  const handleSignIn = () => {
    // navigate(auth.user ? "/dashboard" : "/auth");
    navigate(auth.user ? "/dashboard" : "/early-access");;
  };

  const onNavClick = (path: string) => {
    setMobileOpen(false);
    setDocsMenuOpen(false);
    navigate(path);
  };

  const openDocsMenu = () => {
    if (docsCloseTimerRef.current) {
      window.clearTimeout(docsCloseTimerRef.current);
      docsCloseTimerRef.current = null;
    }
    setDocsMenuOpen(true);
  };

  const closeDocsMenuSoon = () => {
    if (docsCloseTimerRef.current) {
      window.clearTimeout(docsCloseTimerRef.current);
    }
    docsCloseTimerRef.current = window.setTimeout(() => {
      setDocsMenuOpen(false);
      docsCloseTimerRef.current = null;
    }, 180);
  };

  const isDocsActive =
    activePath === "/docs" || activePath.startsWith("/docs/");

  const renderDesktopTab = (item: (typeof tabs)[number]) => {
    const isActive = activePath === item.path;
    return (
      <button
        key={item.path}
        type="button"
        onClick={() => onNavClick(item.path)}
        style={{
          border: "none",
          background: "transparent",
          color: isActive ? NAV_ACCENT : "#fff",
          cursor: "pointer",
          fontSize: 16,
          fontWeight: 400,
          letterSpacing: "0.3px",
          padding: "8px 6px",
          whiteSpace: "nowrap",
        }}
      >
        {item.label}
      </button>
    );
  };

  const renderDrawerItem = ({
    label,
    Icon,
    active,
    onClick,
    chevron,
    expanded,
  }: {
    label: string;
    Icon: LucideIcon;
    active: boolean;
    onClick: () => void;
    chevron?: "right" | "down";
    expanded?: boolean;
  }) => (
    <Box
      key={label}
      component="button"
      type="button"
      onClick={onClick}
      aria-expanded={chevron === "down" ? expanded : undefined}
      sx={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: "11px",
        padding: "11px 14px",
        marginBottom: "4px",
        borderRadius: "10px",
        textAlign: "left",
        cursor: "pointer",
        fontFamily: "inherit",
        border: `1px solid ${active ? "rgba(71,170,182,0.28)" : "transparent"}`,
        background: active
          ? "linear-gradient(90deg, rgba(71,170,182,0.16) 0%, rgba(71,170,182,0.06) 100%)"
          : "transparent",
        color: active ? "#fff" : "rgba(255,255,255,0.68)",
        transition:
          "background-color 0.16s ease, border-color 0.16s ease, color 0.16s ease",
        "&:hover": {
          backgroundColor: active
            ? "rgba(71,170,182,0.16)"
            : "rgba(255,255,255,0.045)",
          borderColor: active
            ? "rgba(71,170,182,0.34)"
            : "rgba(255,255,255,0.07)",
          color: "#fff",
          "& .nav-drawer-chevron": {
            transform: active ? "none" : "translateX(2px)",
          },
        },
      }}
    >
      <Box
        component="span"
        sx={{
          width: 28,
          height: 28,
          borderRadius: "8px",
          flexShrink: 0,
          display: "grid",
          placeItems: "center",
          color: active ? NAV_ACCENT : "rgba(255,255,255,0.72)",
          backgroundColor: active
            ? "rgba(71,170,182,0.2)"
            : "rgba(255,255,255,0.045)",
        }}
      >
        <Icon size={16} />
      </Box>
      <span
        style={{
          flex: 1,
          minWidth: 0,
          fontSize: 13.5,
          fontWeight: active ? 700 : 500,
          letterSpacing: 0.1,
          lineHeight: 1.2,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
      {chevron === "right" && (
        <ChevronRight
          className="nav-drawer-chevron"
          size={17}
          style={{
            color: active ? NAV_ACCENT : "rgba(255,255,255,0.28)",
            flexShrink: 0,
            transition: "transform 0.16s ease, color 0.16s ease",
          }}
        />
      )}
      {chevron === "down" && (
        <ChevronDown
          size={17}
          style={{
            color: active ? NAV_ACCENT : "rgba(255,255,255,0.28)",
            flexShrink: 0,
            transform: expanded ? "rotate(180deg)" : "none",
            transition: "transform 0.18s ease, color 0.16s ease",
          }}
        />
      )}
    </Box>
  );

  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 70,
          zIndex: 300,
          display: "flex",
          alignItems: "center",
          background: scrolled ? "#0b0f10" : "transparent",
          transition: "background-color 0.35s ease",
          padding: "0 16px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 1280,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "center",
            gap: 12,
          }}
        >
          {/* Col 1: hamburger (mobile) | logo (desktop) */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Hamburger — mobile only */}
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 42,
                height: 42,
                borderRadius: 10,
                border: "none",
                background: "transparent",
                color: "#fff",
                cursor: "pointer",
              }}
              className="nav-mobile-btn"
            >
              <span style={{ fontSize: 28, lineHeight: 1 }}>☰</span>
            </button>

            {/* Logo — desktop left */}
            <Link
              to="/"
              className="nav-logo-desktop"
              style={{ display: "none" }}
            >
              <img
                src={WhiteLogo}
                alt="Techietribe"
                width={180}
                height={35}
                style={{ width: "clamp(145px, 15vw, 180px)", height: "auto" }}
                loading="eager"
                decoding="async"
              />
            </Link>
          </div>

          {/* Col 2: logo center (mobile) | nav links center (desktop) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Logo — mobile center */}
            <Link
              to="/"
              className="nav-logo-mobile"
              style={{ display: "inline-flex" }}
            >
              <img
                src={WhiteLogo}
                alt="Techietribe"
                width={180}
                height={35}
                style={{ width: "clamp(145px, 15vw, 180px)", height: "auto" }}
                loading="eager"
                decoding="async"
              />
            </Link>

            {/* Nav links — desktop center */}
            <nav className="nav-desktop" aria-label="Main navigation">
              {tabs.slice(0, 3).map(renderDesktopTab)}

              <div
                ref={docsMenuRef}
                className="nav-docs-menu"
                onMouseEnter={openDocsMenu}
                onMouseLeave={closeDocsMenuSoon}
              >
                <button
                  className="nav-docs-trigger"
                  type="button"
                  aria-expanded={docsMenuOpen}
                  aria-haspopup="menu"
                  onClick={() => setDocsMenuOpen((open) => !open)}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: isDocsActive ? NAV_ACCENT : "#fff",
                    cursor: "pointer",
                    fontSize: 16,
                    fontWeight: isDocsActive ? 600 : 400,
                    letterSpacing: "0.3px",
                    padding: "8px 6px",
                    whiteSpace: "nowrap",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                  }}
                >
                  Docs
                  <span
                    aria-hidden="true"
                    style={{
                      width: 8,
                      height: 8,
                      borderRight: "2px solid currentColor",
                      borderBottom: "2px solid currentColor",
                      transform: docsMenuOpen
                        ? "rotate(225deg)"
                        : "rotate(45deg)",
                      marginTop: docsMenuOpen ? 5 : -3,
                      transition: "transform 0.18s ease, margin 0.18s ease",
                    }}
                  />
                </button>

                {docsMenuOpen && (
                  <Box
                    role="menu"
                    aria-label="Featured docs"
                    className="nav-docs-dropdown"
                    sx={{
                      position: "absolute",
                      top: "calc(100% + 16px)",
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 580,
                      maxWidth: "calc(100vw - 32px)",
                      overflow: "visible",
                      border: "1px solid #f3f4f6",
                      borderRadius: "8px",
                      bgcolor: "#fff",
                      boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
                      color: "#111827",
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        left: 0,
                        right: 0,
                        top: -18,
                        height: 20,
                        background: "transparent",
                      },
                    }}
                  >
                    <Box sx={{ display: "flex" }}>
                      <Box
                        sx={{
                          flex: 1,
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          columnGap: 4,
                          rowGap: 3,
                          p: 3,
                          pr: 2,
                          borderRight: "1px solid #f3f4f6",
                        }}
                      >
                        {docsMenuGroups.map((group) => (
                          <Box
                            key={group.title}
                            sx={{
                              gridColumn: group.span
                                ? `span ${group.span}`
                                : "auto",
                            }}
                          >
                            <Typography
                              component="h3"
                              sx={{
                                mb: 1.5,
                                color: "#6b7280",
                                fontSize: 12,
                                fontWeight: 700,
                                letterSpacing: "0.08em",
                                lineHeight: 1.2,
                                textTransform: "uppercase",
                              }}
                            >
                              {group.title}
                            </Typography>
                            <Box
                              component="ul"
                              sx={{
                                display: "grid",
                                gridTemplateColumns:
                                  group.span === 2 ? "1fr 1fr" : "1fr",
                                columnGap: 4,
                                rowGap: 1.25,
                                p: 0,
                                m: 0,
                                listStyle: "none",
                              }}
                            >
                              {group.items.map((item) => {
                                const Icon = item.icon;
                                return (
                                  <Box component="li" key={item.path}>
                                    <Box
                                      component="button"
                                      type="button"
                                      role="menuitem"
                                      onClick={() => onNavClick(item.path)}
                                      sx={{
                                        width: "100%",
                                        border: "none",
                                        background: "transparent",
                                        color: "#374151",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: Icon ? 1.25 : 0,
                                        p: 0,
                                        fontFamily: "inherit",
                                        fontSize: 14,
                                        fontWeight: 500,
                                        lineHeight: 1.45,
                                        textAlign: "left",
                                        transition: "color 0.16s ease",
                                        "&:hover, &:focus-visible": {
                                          color: NAV_ACCENT,
                                          outline: "none",
                                        },
                                        "&:hover .docs-menu-link-icon, &:focus-visible .docs-menu-link-icon":
                                          {
                                            color: NAV_ACCENT,
                                          },
                                      }}
                                    >
                                      {Icon && (
                                        <Icon
                                          className="docs-menu-link-icon"
                                          size={16}
                                          style={{
                                            color:
                                              item.label === "What's New"
                                                ? NAV_ACCENT
                                                : "#9ca3af",
                                            flexShrink: 0,
                                            transition: "color 0.16s ease",
                                          }}
                                        />
                                      )}
                                      <span>{item.label}</span>
                                    </Box>
                                  </Box>
                                );
                              })}
                            </Box>
                          </Box>
                        ))}
                      </Box>

                      <Box
                        sx={{
                          width: 185,
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          gap: 1,
                          p: 2.5,
                          bgcolor: "rgba(249, 250, 251, 0.5)",
                        }}
                      >
                        <Typography
                          component="h3"
                          sx={{
                            px: 0.5,
                            mb: 0.5,
                            color: "#9ca3af",
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: "0.12em",
                            lineHeight: 1.2,
                            textTransform: "uppercase",
                          }}
                        >
                          Quick Start
                        </Typography>
                        {docsQuickStartItems.map((item) => {
                          const Icon = item.icon;
                          return (
                            <Box
                              key={item.path}
                              component="button"
                              type="button"
                              role="menuitem"
                              onClick={() => onNavClick(item.path)}
                              sx={{
                                width: "100%",
                                border: "1px solid #e5e7eb",
                                borderRadius: "6px",
                                bgcolor: "#fff",
                                color: "#374151",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: 1.25,
                                px: 1.5,
                                py: 1.25,
                                fontFamily: "inherit",
                                textAlign: "left",
                                transition:
                                  "border-color 0.16s ease, box-shadow 0.16s ease, color 0.16s ease",
                                "&:hover, &:focus-visible": {
                                  borderColor: "rgba(71,170,182,0.35)",
                                  boxShadow: "0 1px 4px rgba(15, 23, 42, 0.08)",
                                  color: NAV_ACCENT,
                                  outline: "none",
                                },
                              }}
                            >
                              <Box
                                component="span"
                                sx={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: "4px",
                                  bgcolor: item.iconBg,
                                  color: item.iconColor,
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                }}
                              >
                                {Icon && <Icon size={12} />}
                              </Box>
                              <Typography
                                component="span"
                                sx={{
                                  color: "inherit",
                                  fontSize: 12,
                                  fontWeight: 600,
                                  lineHeight: 1.25,
                                }}
                              >
                                {item.label}
                              </Typography>
                            </Box>
                          );
                        })}
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        borderTop: "1px solid #f3f4f6",
                        px: 2.5,
                        py: 1.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 2,
                      }}
                    >
                      <Typography
                        component="span"
                        sx={{
                          color: "#9ca3af",
                          fontSize: 12,
                          fontWeight: 500,
                          lineHeight: 1.2,
                        }}
                      >
                        Techietribe Docs
                      </Typography>
                      <Box
                        component="button"
                        type="button"
                        role="menuitem"
                        onClick={() => onNavClick("/docs")}
                        sx={{
                          border: "none",
                          background: "transparent",
                          color: "#4b5563",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 0.75,
                          p: 0,
                          fontFamily: "inherit",
                          fontSize: 14,
                          fontWeight: 600,
                          lineHeight: 1.2,
                          transition: "color 0.16s ease",
                          "&:hover, &:focus-visible": {
                            color: NAV_ACCENT_DARK,
                            outline: "none",
                          },
                        }}
                      >
                        Go to Docs
                        <ArrowRight size={14} />
                      </Box>
                    </Box>
                  </Box>
                )}
              </div>

              {tabs.slice(3).map(renderDesktopTab)}
            </nav>
          </div>

          {/* Col 3: CTA button right (desktop only) */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={handleSignIn}
              className="nav-cta"
              style={{
                border: "none",
                borderRadius: 999,
                padding: "12px 24px",
                background: "#fff",
                color: "#000",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              {auth.user ? "Dashboard" : "Get Early Access"}
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <>
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close menu overlay"
            onClick={() => setMobileOpen(false)}
            className="nav-drawer-backdrop"
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(8px)",
              border: "none",
              zIndex: 350,
              cursor: "pointer",
            }}
          />

          <aside
            className="nav-drawer"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "min(85vw, 320px)",
              height: "100dvh",
              zIndex: 360,
              background: "#0d1417",
              color: "#fff",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Decorative glow orbs */}
            <div
              style={{
                position: "absolute",
                top: -80,
                left: -80,
                width: 280,
                height: 280,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(71,170,182,0.12) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 60,
                right: -60,
                width: 200,
                height: 200,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(71,170,182,0.08) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />

            {/* Header */}
            <div
              style={{
                position: "relative",
                zIndex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "22px 18px 18px",
              }}
            >
              <Link to="/" onClick={() => setMobileOpen(false)}>
                <img
                  src={WhiteLogo}
                  alt="Techietribe"
                  style={{ width: 150, height: "auto", display: "block" }}
                  decoding="async"
                />
              </Link>
              <Box
                component="button"
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: "8px",
                  display: "grid",
                  placeItems: "center",
                  padding: 0,
                  cursor: "pointer",
                  color: "rgba(255,255,255,0.7)",
                  backgroundColor: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  transition: "background-color 0.16s ease, color 0.16s ease",
                  "&:hover": {
                    color: "#fff",
                    backgroundColor: "rgba(255,255,255,0.08)",
                  },
                }}
              >
                <ChevronLeft size={20} />
              </Box>
            </div>

            <div
              style={{
                margin: "0 18px",
                height: 1,
                background: "rgba(255,255,255,0.06)",
              }}
            />

            <p
              style={{
                position: "relative",
                zIndex: 1,
                margin: 0,
                padding: "14px 22px 6px",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 1.2,
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.28)",
              }}
            >
              Navigation
            </p>

            {/* Nav items */}
            <nav
              className="nav-drawer-level"
              style={{
                position: "relative",
                zIndex: 1,
                flex: 1,
                overflowY: "auto",
                padding: "4px 10px 16px",
              }}
            >
              {renderDrawerItem({
                label: "Docs",
                Icon: BookOpen,
                active: isDocsActive,
                chevron: "down",
                expanded: mobileDocsOpen,
                onClick: () => setMobileDocsOpen((open) => !open),
              })}

              {mobileDocsOpen && (
                <div
                  className="nav-drawer-sub"
                  style={{
                    margin: "2px 6px 8px 20px",
                    paddingLeft: 14,
                    borderLeft: "1px solid rgba(71,170,182,0.22)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                  }}
                >
                  {docsMenuItems.map((item) => {
                    const isActive = activePath === item.path;
                    return (
                      <Box
                        key={item.path}
                        component="button"
                        type="button"
                        onClick={() => onNavClick(item.path)}
                        sx={{
                          border: "none",
                          borderRadius: "8px",
                          padding: "9px 10px",
                          textAlign: "left",
                          cursor: "pointer",
                          fontFamily: "inherit",
                          fontSize: 13,
                          lineHeight: 1.35,
                          fontWeight: isActive ? 700 : 500,
                          color: isActive ? "#fff" : "rgba(255,255,255,0.55)",
                          background: isActive
                            ? "rgba(71,170,182,0.12)"
                            : "transparent",
                          transition:
                            "background-color 0.16s ease, color 0.16s ease",
                          "&:hover": {
                            color: "#fff",
                            backgroundColor: isActive
                              ? "rgba(71,170,182,0.12)"
                              : "rgba(255,255,255,0.045)",
                          },
                        }}
                      >
                        {item.label}
                      </Box>
                    );
                  })}
                </div>
              )}

              {tabs.map((item) =>
                renderDrawerItem({
                  label: item.label,
                  Icon: mobileNavIcons[item.label] ?? ChevronRight,
                  active: activePath === item.path,
                  chevron: "right",
                  onClick: () => onNavClick(item.path),
                }),
              )}
            </nav>

            {/* Bottom: socials + CTA */}
            <div
              style={{
                position: "relative",
                zIndex: 1,
                padding: "0 14px 24px",
              }}
            >
              <div
                style={{
                  height: 1,
                  background: "rgba(255,255,255,0.06)",
                  marginBottom: 14,
                }}
              />

              <div
                style={{
                  display: "flex",
                  gap: 8,
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                {mobileSocialLinks.map(({ label, Icon, href }) => (
                  <Box
                    key={label}
                    component="a"
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Techietribe on ${label}`}
                    title={`Techietribe on ${label}`}
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "8px",
                      display: "grid",
                      placeItems: "center",
                      color: "rgba(71,170,182,0.8)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      backgroundColor: "rgba(255,255,255,0.025)",
                      textDecoration: "none",
                      transition:
                        "background-color 0.16s ease, border-color 0.16s ease, color 0.16s ease, transform 0.16s ease",
                      "&:hover": {
                        color: NAV_ACCENT,
                        backgroundColor: "rgba(71,170,182,0.08)",
                        borderColor: "rgba(71,170,182,0.24)",
                        transform: "translateY(-1px)",
                      },
                      "& svg": { fontSize: 18 },
                    }}
                  >
                    <Icon aria-hidden="true" />
                  </Box>
                ))}
              </div>

              <Box
                component="button"
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  handleSignIn();
                }}
                sx={{
                  width: "100%",
                  border: "none",
                  borderRadius: "11px",
                  padding: "13px 20px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  color: "#fff",
                  fontSize: 13.5,
                  fontWeight: 800,
                  letterSpacing: 0.3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  background: `linear-gradient(135deg, ${NAV_ACCENT} 0%, rgba(71,170,182,0.78) 100%)`,
                  boxShadow:
                    "0 6px 24px rgba(71,170,182,0.24), 0 2px 6px rgba(0,0,0,0.3)",
                  transition: "transform 0.16s ease, background 0.16s ease",
                  "&:hover": {
                    background: NAV_ACCENT,
                    transform: "translateY(-1px)",
                  },
                }}
              >
                {auth.user ? "Go to Dashboard" : "Get Started"}
                <ChevronRight size={16} />
              </Box>

              <p
                style={{
                  marginTop: 14,
                  marginBottom: 0,
                  textAlign: "center",
                  fontSize: 10,
                  letterSpacing: 0.4,
                  color: "rgba(255,255,255,0.24)",
                }}
              >
                © {new Date().getFullYear()} Techietribe. All rights reserved.
              </p>
            </div>
          </aside>
        </>
      )}

      <style>{`
        /* Mobile defaults */
        .nav-desktop { display: none; }
        .nav-cta { display: none; }
        .nav-logo-desktop { display: none !important; }
        .nav-logo-mobile { display: inline-flex; }

        /* Desktop (≥900px): logo left, nav center, CTA right */
        @media (min-width: 900px) {
          .nav-mobile-btn { display: none !important; }
          .nav-logo-mobile { display: none !important; }
          .nav-logo-desktop { display: inline-flex !important; }
          .nav-desktop {
            display: flex;
            align-items: center;
            gap: 14px;
          }
          .nav-cta { display: inline-flex; }
        }

        .nav-docs-menu {
          position: relative;
          display: inline-flex;
          align-items: center;
        }

        .nav-docs-trigger:hover,
        .nav-docs-trigger:focus-visible {
          color: ${NAV_ACCENT} !important;
          outline: none;
        }

        @keyframes navDrawerIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        @keyframes navBackdropIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes navDrawerLevelIn {
          from { opacity: 0; transform: translateX(8px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .nav-drawer {
          animation: navDrawerIn 260ms cubic-bezier(.22,.61,.36,1) both;
        }
        .nav-drawer-backdrop {
          animation: navBackdropIn 240ms ease both;
        }
        .nav-drawer-level,
        .nav-drawer-sub {
          animation: navDrawerLevelIn 220ms ease both;
        }
        @media (prefers-reduced-motion: reduce) {
          .nav-drawer,
          .nav-drawer-backdrop,
          .nav-drawer-level,
          .nav-drawer-sub {
            animation: none;
          }
        }
      `}</style>
    </>
  );
}

export default Navbar;
