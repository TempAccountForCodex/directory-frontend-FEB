/**
 * sectionColors — Step 10.8
 *
 * Maps sectionColorMode to concrete background + text color values.
 *
 * Modes:
 *   default  — no change (returns empty sx; BlockWrapper applies nothing)
 *   light    — white background / dark text  (#ffffff / #1a1a1a)
 *   dark     — dark background / light text  (#1a1a1a / #ffffff)
 *   custom   — caller-supplied sectionTextColor; no bg override
 */

export type SectionColorMode = "default" | "light" | "dark" | "custom";

export interface SectionColorResult {
  /** CSS background-color value, or undefined when no override */
  backgroundColor?: string;
  /** CSS color value, or undefined when no override */
  color?: string;
}

const LIGHT: SectionColorResult = {
  backgroundColor: "#ffffff",
  color: "#1a1a1a",
};

const DARK: SectionColorResult = {
  backgroundColor: "#1a1a1a",
  color: "#ffffff",
};

/**
 * Returns the concrete background / text color pair for a given mode.
 *
 * @param mode           - Value of the sectionColorMode field.
 * @param sectionTextColor - Optional hex color used when mode === 'custom'.
 */
export function resolveSectionColors(
  mode: SectionColorMode | string | undefined,
  sectionTextColor?: string,
): SectionColorResult {
  switch (mode) {
    case "light":
      return LIGHT;
    case "dark":
      return DARK;
    case "custom":
      return sectionTextColor ? { color: sectionTextColor } : {};
    case "default":
    default:
      return {};
  }
}

/**
 * Returns a boolean indicating whether the mode is anything other than default.
 */
export function hasSectionColorOverride(
  mode: SectionColorMode | string | undefined,
): boolean {
  return mode !== undefined && mode !== "default";
}
