import type { BusinessData } from "../types/BusinessData";
import { blendHex, isLightColor, rgba } from "../templates/company/theme";

/**
 * Shared, theme-aware Header color resolver used by every template that renders
 * the shared `TemplateNavbarHeader`. It centralizes the logic proven on
 * Education Pro: the header background follows the active palette's primary
 * color (the same token driving buttons/CTAs), and nav/CTA text colors flip
 * to stay readable on light vs. dark backgrounds.
 *
 * Style priority (highest → lowest):
 *   1. saved manual header style — `sectionStyle`/`outerSectionStyle`/
 *      `containerStyles` `backgroundColor` persisted from the editor
 *   2. saved themeSettings palette color (`themeSettings.primaryColor` /
 *      `primaryColor`)
 *   3. the template's default primary color
 *
 * Keeping this in one helper means palette changes update the Header
 * consistently across all templates, while a manual editor override still wins.
 */

const asRecord = (value: unknown): Record<string, any> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, any>)
    : {};

export interface SharedHeaderThemeOptions {
  /** Template default primary, used only when no palette/theme color exists. */
  defaultPrimary?: string;
}

export interface SharedHeaderTheme {
  /** Resolved primary palette color (theme-driven). */
  primary: string;
  /** Header bar background (manual override → primary → default). */
  bgColor: string;
  /** True when the resolved background is light and needs dark text. */
  isLightHeader: boolean;
  /** Nav link / logo text color, readable on `bgColor`. */
  navLinkColor: string;
  /** CTA border/text color (matches nav text). */
  ctaColor: string;
  /** Nav link hover color + CTA fallback. */
  themeColor: string;
  /** Header bottom border color. */
  borderColor: string;
  /** Text color on the filled CTA hover state. */
  ctaHoverTextColor: string;
  /** CTA color inside the always-white mobile drawer. */
  mobileCtaColor: string;
  /** Filled CTA hover text color inside the mobile drawer. */
  mobileCtaHoverTextColor: string;
  /** Text color inside the always-white mobile drawer. */
  mobileTextColor: string;
}

const readManualHeaderBackground = (navbar: Record<string, any>): string => {
  const candidates = [
    asRecord(navbar.sectionStyle).backgroundColor,
    asRecord(navbar.outerSectionStyle).backgroundColor,
    asRecord(navbar.containerStyles).backgroundColor,
  ];
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }
  return "";
};

export const resolveHeaderPrimaryColor = (
  data: BusinessData,
  defaultPrimary = "#0f9c8f",
): string =>
  (data.themeSettings?.primaryColor as string | undefined) ||
  (data.primaryColor as string | undefined) ||
  defaultPrimary;

export const buildSharedHeaderTheme = (
  data: BusinessData,
  navbar: Record<string, any> = {},
  options: SharedHeaderThemeOptions = {},
): SharedHeaderTheme => {
  const primary = resolveHeaderPrimaryColor(data, options.defaultPrimary);
  const manualBg = readManualHeaderBackground(navbar);
  const bgColor = manualBg || primary;
  const isLightHeader = isLightColor(bgColor);
  const contrastDark = blendHex(primary, "#050505", 0.84);
  const navLinkColor = isLightHeader ? contrastDark : "#ffffff";

  return {
    primary,
    bgColor,
    isLightHeader,
    navLinkColor,
    ctaColor: navLinkColor,
    themeColor: isLightHeader ? primary : contrastDark,
    borderColor: rgba(
      isLightHeader ? "#000000" : "#ffffff",
      isLightHeader ? 0.1 : 0.16,
    ),
    ctaHoverTextColor: isLightHeader ? "#ffffff" : contrastDark,
    mobileCtaColor: contrastDark,
    mobileCtaHoverTextColor: isLightHeader ? contrastDark : "#ffffff",
    mobileTextColor: "#15110f",
  };
};
