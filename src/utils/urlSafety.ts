/**
 * Step 4.14 — URL Safety Utilities
 *
 * Shared URL validation for preview images.
 * Accepts http/https absolute URLs and same-origin relative paths.
 * Rejects javascript:, data:, and other dangerous protocols.
 */

/** Accept http/https absolute URLs and same-origin relative paths. Reject javascript:/data:/etc. */
export function isSafePreviewUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  // Accept same-origin relative paths (e.g. /template-previews/foo.png)
  if (url.startsWith("/")) return true;
  // Accept absolute http/https URLs
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}
