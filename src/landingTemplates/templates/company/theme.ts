import type { BusinessData } from "../../types/BusinessData";

const hexToRgb = (hex: string) => {
  const normalized = hex.replace("#", "");
  const value =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => char + char)
          .join("")
      : normalized;

  const int = Number.parseInt(value, 16);
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
};

export const rgba = (hex: string, alpha: number) => {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const blendHex = (base: string, target: string, amount: number) => {
  const from = hexToRgb(base);
  const to = hexToRgb(target);
  const mix = (start: number, end: number) =>
    Math.round(start + (end - start) * amount)
      .toString(16)
      .padStart(2, "0");

  return `#${mix(from.r, to.r)}${mix(from.g, to.g)}${mix(from.b, to.b)}`;
};

export const isLightColor = (hex: string) => {
  const { r, g, b } = hexToRgb(hex);
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance > 0.72;
};

type CompanyThemeConfig = {
  data: BusinessData;
  defaultPrimary: string;
  defaultSecondary: string;
  defaultHeadingFont: string;
  defaultBodyFont: string;
};

export const buildCompanyTheme = ({
  data,
  defaultPrimary,
  defaultSecondary,
  defaultHeadingFont,
  defaultBodyFont,
}: CompanyThemeConfig) => {
  const primary =
    data.themeSettings?.primaryColor || data.primaryColor || defaultPrimary;
  const rawSecondary =
    data.themeSettings?.secondaryColor ||
    data.secondaryColor ||
    defaultSecondary;
  const secondary = isLightColor(rawSecondary)
    ? rawSecondary
    : blendHex(rawSecondary, "#ffffff", 0.78);
  const headingFont = data.themeSettings?.headingFont || defaultHeadingFont;
  const bodyFont = data.themeSettings?.bodyFont || defaultBodyFont;

  const ink = blendHex(primary, "#111111", 0.9);
  const inkSoft = rgba(ink, 0.72);
  const line = rgba(primary, 0.14);
  const light = "#fffdf9";
  const pageBackground = `linear-gradient(180deg, ${rgba(
    secondary,
    0.82,
  )} 0%, ${secondary} 100%)`;
  const surface = blendHex(secondary, "#ffffff", 0.38);
  const surfaceStrong = blendHex(secondary, "#ffffff", 0.18);
  const lightPanel = blendHex(secondary, "#ffffff", 0.54);
  const lightPanelStrong = blendHex(secondary, "#ffffff", 0.22);
  const dark = blendHex(primary, "#101010", 0.72);
  const darkest = blendHex(primary, "#050505", 0.84);
  const darkSoft = rgba(dark, 0.86);
  const accent = blendHex(primary, "#ffffff", 0.12);
  const highlight = blendHex(primary, "#ffffff", 0.26);

  return {
    primary,
    secondary,
    headingFont,
    bodyFont,
    ink,
    inkSoft,
    line,
    light,
    pageBackground,
    surface,
    surfaceStrong,
    lightPanel,
    lightPanelStrong,
    dark,
    darkest,
    darkSoft,
    accent,
    highlight,
  };
};
