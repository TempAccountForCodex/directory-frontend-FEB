/**
 * NavbarBlock — Preview Renderer
 *
 * Renders a global navbar in the live preview iframe.
 * Matches the HTML structure and CSS classes emitted by previewInjector.ts.
 *
 * Supports both new schema (brandName/navigationItems) and legacy (logo/links).
 * All user-supplied URLs are passed through sanitizeUrl to block javascript: protocol.
 */

import React from "react";
import type { BlockRendererProps } from "../types";
import { escapeHtml, sanitizeUrl } from "../utils";

interface NavItem {
  label?: unknown;
  link?: unknown;
}

interface NavbarContent {
  brandName?: unknown;
  logo?: unknown;
  navigationItems?: unknown[];
  links?: unknown[];
  ctaText?: unknown;
  ctaLink?: unknown;
  sticky?: unknown;
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

  // Show logo image only for http/https URLs (not legacy brandName text)
  const logoSrc =
    c.logo && typeof c.logo === "string" && c.logo.startsWith("http")
      ? sanitizeUrl(c.logo)
      : null;

  return (
    <nav
      data-block-type="NAVBAR"
      data-global-component="navbar"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 24px",
        background: "var(--color-primary, #378C92)",
        color: "#fff",
        ...(isSticky ? { position: "sticky", top: 0, zIndex: 1000 } : {}),
      }}
    >
      {/* Brand */}
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

      {/* Navigation links + CTA */}
      <div style={{ display: "flex", alignItems: "center" }}>
        {navItems.map((item, idx) => (
          <a
            key={idx}
            href={sanitizeUrl(item.link)}
            style={{
              color: "inherit",
              textDecoration: "none",
              margin: "0 12px",
            }}
          >
            {escapeHtml(item.label)}
          </a>
        ))}
        {ctaText && (
          <a
            href={ctaLink}
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
    </nav>
  );
};

export default React.memo(NavbarBlock);
