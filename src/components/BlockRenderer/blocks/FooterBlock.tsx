/**
 * FooterBlock — Preview Renderer
 *
 * Renders a global footer in the live preview iframe.
 * Matches the HTML structure and CSS classes emitted by previewInjector.ts.
 *
 * Supports both new schema (copyright/columns/socialLinks) and legacy (links).
 * All user-supplied URLs are passed through sanitizeUrl to block javascript: protocol.
 */

import React from "react";
import type { BlockRendererProps } from "../types";
import { escapeHtml, sanitizeUrl } from "../utils";

const PLATFORM_LABELS: Record<string, string> = {
  facebook: "FB",
  twitter: "TW",
  instagram: "IG",
  linkedin: "LI",
  youtube: "YT",
};

interface ColLink {
  label?: unknown;
  url?: unknown;
}

interface FooterColumn {
  title?: unknown;
  links?: unknown[];
}

interface SocialLink {
  platform?: unknown;
  url?: unknown;
}

interface LegacyLink {
  text?: unknown;
  label?: unknown;
  url?: unknown;
}

interface FooterContent {
  copyright?: unknown;
  logo?: unknown;
  columns?: unknown[];
  socialLinks?: unknown[];
  links?: unknown[];
  style?: unknown;
}

const FooterBlock: React.FC<BlockRendererProps> = ({ block }) => {
  const c = (block.content || {}) as FooterContent;

  const copyright = c.copyright ? String(c.copyright) : "";

  // Logo
  const logoSrc =
    c.logo && typeof c.logo === "string" ? sanitizeUrl(c.logo) : null;

  // Columns (new schema, max 4)
  const columns = Array.isArray(c.columns)
    ? (c.columns as FooterColumn[]).slice(0, 4)
    : [];

  // Social links (max 5)
  const socialLinks = Array.isArray(c.socialLinks)
    ? (c.socialLinks as SocialLink[]).slice(0, 5)
    : [];

  // Legacy links (old schema: content.links with text/url)
  const legacyLinks = Array.isArray(c.links) ? (c.links as LegacyLink[]) : [];

  return (
    <footer
      data-block-type="FOOTER"
      data-global-component="footer"
      style={{
        padding: 24,
        background: "#222",
        color: "#ccc",
        fontSize: "0.9rem",
      }}
    >
      {/* Logo */}
      {logoSrc && logoSrc !== "#" && (
        <img
          src={logoSrc}
          alt="Logo"
          style={{ height: 40, marginBottom: 12, display: "block" }}
        />
      )}

      {/* Columns */}
      {columns.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: 24,
            marginBottom: 16,
            flexWrap: "wrap",
          }}
        >
          {columns.map((col, idx) => {
            const colLinks = Array.isArray(col.links)
              ? (col.links as ColLink[]).slice(0, 8)
              : [];
            return (
              <div key={idx} style={{ flex: 1, minWidth: 120 }}>
                {col.title ? (
                  <h4 style={{ margin: "0 0 8px 0", fontSize: "0.95rem" }}>
                    {escapeHtml(col.title)}
                  </h4>
                ) : null}
                {colLinks.map((link, lIdx) => (
                  <a
                    key={lIdx}
                    href={sanitizeUrl(link.url)}
                    style={{
                      color: "inherit",
                      textDecoration: "none",
                      display: "block",
                      margin: "4px 0",
                    }}
                  >
                    {escapeHtml(link.label)}
                  </a>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* Legacy links */}
      {legacyLinks.length > 0 && (
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          {legacyLinks.map((link, idx) => (
            <a
              key={idx}
              href={sanitizeUrl(link.url)}
              style={{ color: "inherit", margin: "0 8px" }}
            >
              {escapeHtml(link.text || link.label)}
            </a>
          ))}
        </div>
      )}

      {/* Social links */}
      {socialLinks.length > 0 && (
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          {socialLinks.map((s, idx) => {
            const platform = String(s.platform || "");
            const label = PLATFORM_LABELS[platform] || escapeHtml(platform);
            return (
              <a
                key={idx}
                href={sanitizeUrl(s.url)}
                style={{
                  color: "inherit",
                  margin: "0 6px",
                  textDecoration: "none",
                }}
                target="_blank"
                rel="noopener noreferrer"
              >
                {label}
              </a>
            );
          })}
        </div>
      )}

      {/* Copyright */}
      {copyright && (
        <p
          data-editable="copyright"
          data-edit-type="single"
          style={{ margin: 0, textAlign: "center", opacity: 0.7 }}
        >
          {escapeHtml(copyright)}
        </p>
      )}
    </footer>
  );
};

export default React.memo(FooterBlock);
