/**
 * NavbarBlock — Preview Renderer
 *
 * Renders a global navbar in the live preview iframe.
 * Matches the HTML structure and CSS classes emitted by previewInjector.ts.
 *
 * Supports both new schema (brandName/navigationItems) and legacy (logo/links).
 * All user-supplied URLs are passed through sanitizeUrl to block javascript: protocol.
 *
 * Variants: solid | transparent | centered | left-aligned
 * Features: anchor scroll, mobile hamburger drawer, backdropBlur
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import type { BlockRendererProps } from "../types";
import { escapeHtml, sanitizeUrl } from "../utils";

interface NavItem {
  label?: unknown;
  link?: unknown;
}

const BLUR_MAP: Record<string, string> = { sm: "4px", md: "8px", lg: "16px" };

interface NavbarContent {
  brandName?: unknown;
  logo?: unknown;
  navigationItems?: unknown[];
  links?: unknown[];
  ctaText?: unknown;
  ctaLink?: unknown;
  sticky?: unknown;
  backdropBlur?: unknown;
  variant?: unknown; // 'solid' | 'transparent' | 'centered' | 'left-aligned'
}

const NavbarBlock: React.FC<BlockRendererProps> = ({ block }) => {
  const c = (block.content || {}) as NavbarContent;

  // Support both new schema (brandName/navigationItems) and legacy (logo/links)
  const brandName = String(c.brandName || c.logo || "My Brand");

  const rawItems: NavItem[] = Array.isArray(c.navigationItems)
    ? (c.navigationItems as NavItem[])
    : Array.isArray(c.links)
      ? (c.links as unknown[]).map((l) => {
          const link = l as Record<string, unknown>;
          return { label: link.text, link: link.url };
        })
      : [];

  const navItems = rawItems.slice(0, 8);

  const ctaText = c.ctaText ? String(c.ctaText) : "";
  const ctaLink = c.ctaLink ? sanitizeUrl(String(c.ctaLink)) : "#";

  const isSticky = Boolean(c.sticky);

  const blurLevel =
    c.backdropBlur && c.backdropBlur !== "none" ? String(c.backdropBlur) : null;
  const blurPx = blurLevel ? BLUR_MAP[blurLevel] : null;

  const variant = c.variant ? String(c.variant) : "solid";

  // Show logo image only for http/https URLs (not legacy brandName text)
  const logoSrc =
    c.logo && typeof c.logo === "string" && c.logo.startsWith("http")
      ? sanitizeUrl(c.logo)
      : null;

  // ── Dynamic height measurement ────────────────────────────────────────────
  const navRef = useRef<HTMLElement>(null);
  const [navHeight, setNavHeight] = useState(64);

  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const h = entries[0]?.contentRect.height;
      if (h) setNavHeight(Math.round(h));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ── Transparent variant scroll state ──────────────────────────────────────
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (variant !== "transparent") return;
    const handler = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => {
      window.removeEventListener("scroll", handler);
    };
  }, [variant]);

  // ── Mobile state ──────────────────────────────────────────────────────────
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // ── Anchor scroll handler ─────────────────────────────────────────────────
  const handleNavClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, link: string) => {
      if (link.startsWith("#")) {
        e.preventDefault();
        const target = document.querySelector(link);
        if (target) {
          const top =
            target.getBoundingClientRect().top + window.scrollY - navHeight;
          window.scrollTo({ top, behavior: "smooth" });
        }
      }
    },
    [navHeight],
  );

  const closeMobileDrawer = useCallback(() => setMobileOpen(false), []);
  const openMobileDrawer = useCallback(() => setMobileOpen(true), []);

  // ── Background style per variant ──────────────────────────────────────────
  const getNavBackground = (): React.CSSProperties => {
    if (blurPx) {
      // backdropBlur overrides background
      return {
        background: "rgba(255,255,255,0.7)",
        backdropFilter: `blur(${blurPx})`,
        WebkitBackdropFilter: `blur(${blurPx})`,
      };
    }
    if (variant === "transparent") {
      return {
        background: scrolled ? "rgba(255,255,255,0.95)" : "rgba(0,0,0,0)",
        color: scrolled ? "#333" : "#fff",
        boxShadow: scrolled ? "0 2px 12px rgba(0,0,0,0.08)" : "none",
        transition:
          "background 0.3s ease, color 0.3s ease, box-shadow 0.3s ease",
      };
    }
    return {
      background: "var(--color-primary, #378C92)",
      ...(isSticky ? { boxShadow: "0 2px 8px rgba(0,0,0,0.12)" } : {}),
    };
  };

  // ── Layout style per variant ───────────────────────────────────────────────
  const getNavLayout = (): React.CSSProperties => {
    if (variant === "centered") {
      return {
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
      };
    }
    if (variant === "left-aligned") {
      return {
        justifyContent: "flex-start",
        gap: 24,
      };
    }
    // solid (default) + transparent
    return {
      justifyContent: "space-between",
    };
  };

  const bgStyle = getNavBackground();
  const layoutStyle = getNavLayout();

  // ── Render nav links (shared between desktop and mobile drawer) ───────────
  const renderNavLinks = (inDrawer = false) =>
    navItems.map((item, idx) => {
      const href = sanitizeUrl(item.link);
      const label = escapeHtml(item.label);
      return (
        <a
          key={idx}
          href={href}
          onClick={(e) => {
            handleNavClick(e, href);
            if (inDrawer) closeMobileDrawer();
          }}
          style={{
            color: inDrawer ? "#333" : "inherit",
            textDecoration: "none",
            ...(inDrawer
              ? { padding: "8px 0", fontSize: "1rem", fontWeight: 500 }
              : { margin: variant === "left-aligned" ? "0 8px" : "0 12px" }),
          }}
        >
          {label}
        </a>
      );
    });

  return (
    <>
      <nav
        ref={navRef}
        data-block-type="NAVBAR"
        data-global-component="navbar"
        data-variant={variant}
        {...(blurPx ? { "data-backdrop-blur": blurLevel! } : {})}
        style={{
          display: "flex",
          alignItems: "center",
          padding: "16px 24px",
          color: "#fff",
          ...bgStyle,
          ...layoutStyle,
          ...(isSticky ? { position: "sticky", top: 0, zIndex: 1000 } : {}),
        }}
      >
        {/* ── centered: brand row ─────────────────────────────────────────── */}
        {variant === "centered" ? (
          <>
            {/* Brand — centered on top row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
              }}
            >
              {logoSrc && logoSrc !== "#" && (
                <img
                  src={logoSrc}
                  alt={escapeHtml(brandName)}
                  style={{ height: 32, marginRight: 8 }}
                />
              )}
              <strong
                data-editable="brandName"
                data-edit-type="single"
                style={{
                  fontFamily: "var(--font-heading, sans-serif)",
                  fontSize: "1.2rem",
                }}
              >
                {escapeHtml(brandName)}
              </strong>
            </div>

            {/* Nav links row — centered */}
            {!isMobile && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  width: "100%",
                }}
              >
                {renderNavLinks()}
                {ctaText && (
                  <a
                    href={ctaLink}
                    onClick={(e) => handleNavClick(e, ctaLink)}
                    style={{
                      background: "#fff",
                      color: "var(--color-primary, #378C92)",
                      padding: "8px 16px",
                      borderRadius: 4,
                      textDecoration: "none",
                      fontWeight: 600,
                      margin: "0 12px",
                    }}
                  >
                    {escapeHtml(ctaText)}
                  </a>
                )}
              </div>
            )}

            {/* Mobile hamburger for centered variant */}
            {isMobile && (
              <button
                aria-label="Open menu"
                onClick={openMobileDrawer}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1.5rem",
                  color: "inherit",
                  padding: 4,
                }}
              >
                ☰
              </button>
            )}
          </>
        ) : (
          <>
            {/* ── Brand (left) ─────────────────────────────────────────────── */}
            <div style={{ display: "flex", alignItems: "center" }}>
              {logoSrc && logoSrc !== "#" && (
                <img
                  src={logoSrc}
                  alt={escapeHtml(brandName)}
                  style={{ height: 32, marginRight: 8 }}
                />
              )}
              <strong
                data-editable="brandName"
                data-edit-type="single"
                style={{
                  fontFamily: "var(--font-heading, sans-serif)",
                  fontSize: "1.2rem",
                }}
              >
                {escapeHtml(brandName)}
              </strong>
            </div>

            {/* ── Desktop nav links + CTA ──────────────────────────────────── */}
            {!isMobile && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  ...(variant === "left-aligned" ? { gap: 16 } : {}),
                }}
              >
                {renderNavLinks()}
                {ctaText && (
                  <a
                    href={ctaLink}
                    onClick={(e) => handleNavClick(e, ctaLink)}
                    style={{
                      background: "#fff",
                      color: "var(--color-primary, #378C92)",
                      padding: "8px 16px",
                      borderRadius: 4,
                      textDecoration: "none",
                      fontWeight: 600,
                    }}
                  >
                    {escapeHtml(ctaText)}
                  </a>
                )}
              </div>
            )}

            {/* ── Mobile hamburger ─────────────────────────────────────────── */}
            {isMobile && (
              <button
                aria-label="Open menu"
                onClick={openMobileDrawer}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1.5rem",
                  color: "inherit",
                  padding: 4,
                }}
              >
                ☰
              </button>
            )}
          </>
        )}
      </nav>

      {/* ── Mobile Drawer ────────────────────────────────────────────────────── */}
      {mobileOpen && (
        <div
          data-testid="mobile-drawer"
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            height: "100vh",
            width: 280,
            background: "#fff",
            color: "#333",
            zIndex: 2000,
            padding: "24px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
            boxShadow: "-4px 0 16px rgba(0,0,0,0.15)",
          }}
        >
          {/* Close button */}
          <button
            aria-label="Close menu"
            onClick={closeMobileDrawer}
            style={{
              alignSelf: "flex-end",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "1.25rem",
              color: "#333",
              padding: 4,
            }}
          >
            ✕
          </button>

          {/* Nav items stacked vertically */}
          {renderNavLinks(true)}

          {/* CTA in drawer */}
          {ctaText && (
            <a
              href={ctaLink}
              onClick={(e) => {
                handleNavClick(e, ctaLink);
                closeMobileDrawer();
              }}
              style={{
                background: "var(--color-primary, #378C92)",
                color: "#fff",
                padding: "10px 16px",
                borderRadius: 4,
                textDecoration: "none",
                fontWeight: 600,
                textAlign: "center",
                marginTop: 8,
              }}
            >
              {escapeHtml(ctaText)}
            </a>
          )}
        </div>
      )}
    </>
  );
};

export default React.memo(NavbarBlock);
