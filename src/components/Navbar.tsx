import { useEffect, useMemo, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
import {
  ArrowRight,
  BookOpen,
  LayoutTemplate,
  List,
  Rocket,
  Sparkles,
  Store,
  type LucideIcon,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const WhiteLogo = "/WhiteLogo.png";
const NAV_ACCENT = "#47aab6";
const NAV_ACCENT_DARK = "#2d7a85";
const NAV_ACCENT_SOFT = "rgba(71,170,182,0.12)";

const tabs = [
  { label: "Templates", path: "/templates" },
  { label: "Listings", path: "/listings" },
  { label: "Blog", path: "/blog" },
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
    navigate(auth.user ? "/dashboard" : "/auth");
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
              {auth.user ? "Dashboard" : "Get Started"}
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
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(8px)",
              border: "none",
              zIndex: 350,
            }}
          />

          <aside
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "min(85vw, 320px)",
              height: "100vh",
              zIndex: 360,
              background:
                "linear-gradient(160deg, #0d1117 0%, #0f1e22 60%, #0a1a1f 100%)",
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
                top: -60,
                left: -60,
                width: 200,
                height: 200,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(71,170,182,0.18) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 80,
                right: -80,
                width: 250,
                height: 250,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(71,170,182,0.1) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />

            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "20px 20px 16px",
                borderBottom: "1px solid rgba(71,170,182,0.15)",
                position: "relative",
              }}
            >
              <Link to="/" onClick={() => setMobileOpen(false)}>
                <img
                  src={WhiteLogo}
                  alt="logo"
                  style={{ width: 150, height: "auto" }}
                  decoding="async"
                />
              </Link>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                style={{
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.06)",
                  color: "#fff",
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  fontSize: 18,
                  lineHeight: 1,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>

            {/* Nav items */}
            <div
              style={{
                padding: "20px 0 0",
                display: "flex",
                flexDirection: "column",
                position: "relative",
              }}
            >
              <button
                type="button"
                onClick={() => setMobileDocsOpen((open) => !open)}
                aria-expanded={mobileDocsOpen}
                style={{
                  border: "none",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  textAlign: "left",
                  padding: "18px 24px",
                  background: isDocsActive
                    ? "rgba(71,170,182,0.08)"
                    : "transparent",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 14,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: isDocsActive ? "#47aab6" : "rgba(255,255,255,0.2)",
                      letterSpacing: "0.08em",
                      minWidth: 20,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    01
                  </span>
                  <span
                    style={{
                      fontSize: 22,
                      fontWeight: 700,
                      color: isDocsActive ? "#fff" : "rgba(255,255,255,0.55)",
                      letterSpacing: "-0.3px",
                      lineHeight: 1,
                    }}
                  >
                    Docs
                  </span>
                </span>

                <span
                  style={{
                    color: isDocsActive ? "#47aab6" : "rgba(255,255,255,0.35)",
                    fontSize: 20,
                    lineHeight: 1,
                    transform: mobileDocsOpen
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                    transition: "transform 0.18s ease",
                  }}
                >
                  ↓
                </span>
              </button>

              {mobileDocsOpen && (
                <div
                  style={{
                    padding: "8px 18px 14px 58px",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    background: "rgba(0,0,0,0.14)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                  }}
                >
                  {docsMenuItems.map((item) => (
                    <button
                      key={item.path}
                      type="button"
                      onClick={() => onNavClick(item.path)}
                      style={{
                        border: "none",
                        background: "transparent",
                        color:
                          activePath === item.path
                            ? "#fff"
                            : "rgba(255,255,255,0.6)",
                        cursor: "pointer",
                        fontSize: 14,
                        fontWeight: activePath === item.path ? 700 : 500,
                        lineHeight: 1.35,
                        padding: "10px 0",
                        textAlign: "left",
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}

              {tabs.map((item, i) => {
                const isActive = activePath === item.path;
                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => onNavClick(item.path)}
                    style={{
                      border: "none",
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                      textAlign: "left",
                      padding: "18px 24px",
                      background: "transparent",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    {/* Left: number + label */}
                    <span
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: 14,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: isActive ? "#47aab6" : "rgba(255,255,255,0.2)",
                          letterSpacing: "0.08em",
                          minWidth: 20,
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {String(i + 2).padStart(2, "0")}
                      </span>
                      <span
                        style={{
                          fontSize: 22,
                          fontWeight: 700,
                          color: isActive ? "#fff" : "rgba(255,255,255,0.55)",
                          letterSpacing: "-0.3px",
                          lineHeight: 1,
                        }}
                      >
                        {item.label}
                      </span>
                    </span>

                    {/* Right: arrow */}
                    <span
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        border: isActive
                          ? "1px solid #47aab6"
                          : "1px solid rgba(255,255,255,0.1)",
                        background: isActive
                          ? "rgba(71,170,182,0.15)"
                          : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        color: isActive ? "#47aab6" : "rgba(255,255,255,0.3)",
                        fontSize: 14,
                      }}
                    >
                      →
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Bottom CTA */}
            <div
              style={{
                marginTop: "auto",
                padding: "20px 16px",
                position: "relative",
              }}
            >
              {/* Thin divider */}
              <div
                style={{
                  height: 1,
                  background:
                    "linear-gradient(90deg, transparent, rgba(71,170,182,0.3), transparent)",
                  marginBottom: 20,
                }}
              />

              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  handleSignIn();
                }}
                style={{
                  width: "100%",
                  border: "none",
                  borderRadius: 12,
                  background:
                    "linear-gradient(135deg, #47aab6 0%, #2d7a85 100%)",
                  color: "#fff",
                  padding: "15px 14px",
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  boxShadow: "0 4px 24px rgba(71,170,182,0.3)",
                }}
              >
                {auth.user ? "Go to Dashboard" : "Get Started →"}
              </button>

              <p
                style={{
                  textAlign: "center",
                  fontSize: 11,
                  color: "rgba(255,255,255,0.3)",
                  marginTop: 12,
                  marginBottom: 0,
                }}
              >
                No credit card required
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
      `}</style>
    </>
  );
}

export default Navbar;
