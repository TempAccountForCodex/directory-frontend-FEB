/**
 * BlockRenderer Utilities
 *
 * HTML escaping and URL sanitization matching backend renderer helpers.
 */

/** Escape HTML special characters to prevent XSS */
export function escapeHtml(str: unknown): string {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Escape attribute values (same as escapeHtml + single quotes) */
export function escapeAttr(str: unknown): string {
  return escapeHtml(str).replace(/'/g, "&#39;");
}

/** Sanitize URL — block javascript:, data:, and vbscript: protocols */
export function sanitizeUrl(url: unknown): string {
  const str = String(url ?? "").trim();
  if (!str) return "#";
  const lower = str.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("vbscript:")
  ) {
    return "#";
  }
  return str;
}

/** Sanitize rich text HTML — allow safe formatting tags only */
const ALLOWED_TAGS = new Set([
  "b",
  "i",
  "em",
  "strong",
  "p",
  "br",
  "ul",
  "ol",
  "li",
  "a",
  "h3",
  "h4",
]);

export function sanitizeRichText(html: unknown): string {
  const str = String(html ?? "");
  // Strip all tags except allowed ones
  return str.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/gi, (match, tag) => {
    const lower = tag.toLowerCase();
    if (!ALLOWED_TAGS.has(lower)) return "";
    // For anchor tags, add rel attribute
    if (lower === "a" && match.startsWith("<a")) {
      return match.replace(/<a\s/i, '<a rel="noopener noreferrer" ');
    }
    return match;
  });
}
