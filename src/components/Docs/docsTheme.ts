/**
 * Self-contained docs theme (light/dark) driven by CSS variables.
 *
 * The docs deliberately do NOT use the app's MUI theme tokens (its
 * `text.secondary` is white and `primary.main` a near-white cream, which render
 * invisible on docs surfaces). Instead we define an explicit, cohesive palette
 * here and expose it as CSS custom properties so a single `data-docs-theme`
 * attribute on the document root switches the whole docs UI — including content
 * rendered in portals (mobile drawer, search dropdown) — between light and dark.
 *
 * Components keep referencing the `DOCS` tokens unchanged; each token is a
 * `var(--docs-*)` with a dark fallback so colors are correct even before the
 * attribute is applied. Code blocks stay dark in both modes (Clerk-style).
 */

export type DocsMode = "light" | "dark";

export const DOCS_THEME_STORAGE_KEY = "docs-theme";

// --- Concrete palettes (used to generate the CSS variables) ----------------

const DARK = {
  bg: "#0b0c0e",
  topbar: "rgba(11,12,14,0.72)",
  surface: "#15161a",
  surfaceHover: "#1c1d22",
  border: "rgba(255,255,255,0.08)",
  borderStrong: "rgba(255,255,255,0.16)",
  text: "#e9e9ec",
  textMuted: "#a1a1ad",
  textFaint: "#71717a",
  accent: "#378C92",
  accentHover: "#5FB9BF",
  accentSoft: "rgba(55,140,146,0.16)",
};

const LIGHT = {
  bg: "#ffffff",
  topbar: "rgba(255,255,255,0.8)",
  surface: "#f7f8f9",
  surfaceHover: "#eef0f2",
  border: "rgba(0,0,0,0.10)",
  borderStrong: "rgba(0,0,0,0.20)",
  text: "#15181c",
  textMuted: "#566069",
  textFaint: "#8a939c",
  accent: "#378C92",
  accentHover: "#2c7077",
  accentSoft: "rgba(55,140,146,0.10)",
};

// Code surfaces stay dark in both modes.
const CODE = { bg: "#121317", text: "#e4e4ef" };

// --- CSS variable tokens (what components consume) -------------------------

export const DOCS = {
  bg: "var(--docs-bg, #0b0c0e)",
  topbarBg: "var(--docs-topbar, rgba(11,12,14,0.72))",
  surface: "var(--docs-surface, #15161a)",
  surfaceHover: "var(--docs-surface-hover, #1c1d22)",
  border: "var(--docs-border, rgba(255,255,255,0.08))",
  borderStrong: "var(--docs-border-strong, rgba(255,255,255,0.16))",
  text: "var(--docs-text, #e9e9ec)",
  textMuted: "var(--docs-text-muted, #a1a1ad)",
  textFaint: "var(--docs-text-faint, #71717a)",
  accent: "var(--docs-accent, #378C92)",
  accentHover: "var(--docs-accent-hover, #5FB9BF)",
  accentSoftBg: "var(--docs-accent-soft, rgba(55,140,146,0.16))",
  codeBg: "var(--docs-code-bg, #121317)",
  codeText: "var(--docs-code-text, #e4e4ef)",
} as const;

export type DocsPalette = typeof DOCS;

// --- Stylesheet that maps data-docs-theme -> variable values ---------------

function toVars(p: typeof DARK): string {
  return [
    `--docs-bg:${p.bg}`,
    `--docs-topbar:${p.topbar}`,
    `--docs-surface:${p.surface}`,
    `--docs-surface-hover:${p.surfaceHover}`,
    `--docs-border:${p.border}`,
    `--docs-border-strong:${p.borderStrong}`,
    `--docs-text:${p.text}`,
    `--docs-text-muted:${p.textMuted}`,
    `--docs-text-faint:${p.textFaint}`,
    `--docs-accent:${p.accent}`,
    `--docs-accent-hover:${p.accentHover}`,
    `--docs-accent-soft:${p.accentSoft}`,
    `--docs-code-bg:${CODE.bg}`,
    `--docs-code-text:${CODE.text}`,
  ].join(";");
}

export const DOCS_THEME_CSS = `
[data-docs-theme="dark"]{${toVars(DARK)};color-scheme:dark;}
[data-docs-theme="light"]{${toVars(LIGHT)};color-scheme:light;}
`;

/** Read the persisted docs theme (defaults to dark). Safe on the server. */
export function readDocsMode(): DocsMode {
  if (typeof window === "undefined") return "dark";
  const stored = window.localStorage?.getItem(DOCS_THEME_STORAGE_KEY);
  return stored === "light" ? "light" : "dark";
}
