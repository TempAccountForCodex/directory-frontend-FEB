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
 *   2. template `defaultBackground` when provided (e.g. transparent overlay)
 *   3. saved themeSettings palette color (`themeSettings.primaryColor` /
 *      `primaryColor`) / template default primary
 *
 * Keeping this in one helper means palette changes update the Header
 * consistently across all templates, while a manual editor override still wins.
 * Templates may opt into a transparent default via `defaultBackground` without
 * changing other templates' solid primary behavior.
 */

const asRecord = (value: unknown): Record<string, any> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, any>)
    : {};

export interface SharedHeaderThemeOptions {
  /** Template default primary, used only when no palette/theme color exists. */
  defaultPrimary?: string;
  /**
   * Template-specific default header background when no manual editor
   * background is saved. Use `"transparent"` for overlays (e.g. Plumbing Pro).
   * When unset, the resolved primary/theme color is used (existing behavior).
   */
  defaultBackground?: string;
  /**
   * When the resolved background is transparent, which text contrast to use:
   * `"light"` = white nav/CTA (dark hero imagery), `"dark"` = dark nav.
   */
  transparentText?: "light" | "dark";
}

export interface SharedHeaderTheme {
  /** Resolved primary palette color (theme-driven). */
  primary: string;
  /** Header bar background (manual → defaultBackground → primary). */
  bgColor: string;
  /** True when a manual editor backgroundColor is persisted on the header. */
  hasManualBackground: boolean;
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

export const readManualHeaderBackground = (
  navbar: Record<string, any>,
): string => {
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

const isTransparentBackground = (value: string): boolean => {
  const normalized = value.trim().toLowerCase();
  return (
    !normalized ||
    normalized === "transparent" ||
    normalized === "rgba(0,0,0,0)" ||
    normalized === "rgba(0, 0, 0, 0)"
  );
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
  const hasManualBackground = Boolean(manualBg);
  // Priority: manual editor bg → template defaultBackground → theme primary.
  const bgColor = manualBg || options.defaultBackground || primary;
  const transparentOverlay = isTransparentBackground(bgColor);
  const isLightHeader = transparentOverlay
    ? options.transparentText === "dark"
    : isLightColor(bgColor);
  const contrastDark = blendHex(primary, "#050505", 0.84);
  const navLinkColor = isLightHeader ? contrastDark : "#ffffff";

  return {
    primary,
    bgColor,
    hasManualBackground,
    isLightHeader,
    navLinkColor,
    ctaColor: navLinkColor,
    themeColor: isLightHeader ? primary : contrastDark,
    borderColor: transparentOverlay
      ? "transparent"
      : rgba(isLightHeader ? "#000000" : "#ffffff", isLightHeader ? 0.1 : 0.16),
    ctaHoverTextColor: isLightHeader ? "#ffffff" : contrastDark,
    mobileCtaColor: contrastDark,
    mobileCtaHoverTextColor: isLightHeader ? contrastDark : "#ffffff",
    mobileTextColor: "#15110f",
  };
};
