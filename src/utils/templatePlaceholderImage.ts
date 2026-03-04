/**
 * Template Placeholder Image Generator
 *
 * Generates SVG placeholder images for templates until actual preview images are created.
 * Each placeholder is customized with the template's primary color and name.
 */

/**
 * Generates an SVG data URL placeholder for a template
 * @param templateName - Name of the template
 * @param primaryColor - Primary color of the template (hex)
 * @param category - Template category
 * @returns Data URL for SVG placeholder
 */
export function generateTemplatePlaceholder(
  templateName: string,
  primaryColor: string = "#2563eb",
  category: string = "template",
): string {
  // Create gradient colors from primary color
  const color1 = primaryColor;
  const color2 = adjustBrightness(primaryColor, 30);

  const svg = `
    <svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="600" height="400" fill="url(#grad)"/>
      <rect x="40" y="40" width="520" height="320" fill="white" opacity="0.1" rx="8"/>
      <text x="300" y="180" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="white" text-anchor="middle" opacity="0.9">
        ${escapeXml(templateName)}
      </text>
      <text x="300" y="220" font-family="Arial, sans-serif" font-size="18" fill="white" text-anchor="middle" opacity="0.7">
        ${escapeXml(category.toUpperCase())}
      </text>
      <text x="300" y="260" font-family="Arial, sans-serif" font-size="14" fill="white" text-anchor="middle" opacity="0.5">
        Preview Coming Soon
      </text>
    </svg>
  `;

  // Convert SVG to data URL
  const encodedSvg = encodeURIComponent(svg.trim());
  return `data:image/svg+xml,${encodedSvg}`;
}

/**
 * Escapes XML special characters
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Adjusts brightness of a hex color
 * @param hex - Hex color (e.g., "#2563eb")
 * @param percent - Brightness adjustment (-100 to 100)
 * @returns Adjusted hex color
 */
function adjustBrightness(hex: string, percent: number): string {
  // Remove # if present
  hex = hex.replace("#", "");

  // Parse RGB components
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Adjust brightness
  const adjust = (value: number) => {
    const adjusted = value + (value * percent) / 100;
    return Math.max(0, Math.min(255, Math.round(adjusted)));
  };

  const newR = adjust(r);
  const newG = adjust(g);
  const newB = adjust(b);

  // Convert back to hex
  const toHex = (value: number) => value.toString(16).padStart(2, "0");

  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
}

/**
 * Checks if a preview image path points to a real file or needs a placeholder
 * @param imagePath - Path to the image
 * @returns True if it's a placeholder path
 */
export function isPlaceholderPath(imagePath: string): boolean {
  return imagePath.startsWith("/templates/") && imagePath.endsWith(".png");
}
