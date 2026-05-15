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

const isLightColor = (hex: string) => {
  const { r, g, b } = hexToRgb(hex);
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance > 0.72;
};

type StoreThemeConfig = {
  data: BusinessData;
  defaultPrimary: string;
  defaultSecondary: string;
  defaultHeadingFont: string;
  defaultBodyFont: string;
};

export const buildStoreTheme = ({
  data,
  defaultPrimary,
  defaultSecondary,
  defaultHeadingFont,
  defaultBodyFont,
}: StoreThemeConfig) => {
  const primary =
    data.themeSettings?.primaryColor || data.primaryColor || defaultPrimary;
  const rawSecondary =
    data.themeSettings?.secondaryColor ||
    data.secondaryColor ||
    defaultSecondary;
  const secondary = rawSecondary.startsWith("#")
    ? rawSecondary
    : defaultSecondary;
  const headingFont = data.themeSettings?.headingFont || defaultHeadingFont;
  const bodyFont = data.themeSettings?.bodyFont || defaultBodyFont;

  const secondaryIsLight = isLightColor(secondary);
  const ink = secondaryIsLight ? blendHex(primary, "#111111", 0.86) : "#f8f4ee";
  const page = secondaryIsLight
    ? blendHex(secondary, "#ffffff", 0.08)
    : blendHex(primary, "#050505", 0.84);
  const card = secondaryIsLight
    ? blendHex(secondary, "#ffffff", 0.3)
    : blendHex(primary, "#111111", 0.72);
  const panel = secondaryIsLight
    ? blendHex(secondary, "#ffffff", 0.16)
    : blendHex(primary, "#0a0a0a", 0.78);
  const border = secondaryIsLight ? rgba(primary, 0.12) : rgba("#ffffff", 0.1);
  const muted = secondaryIsLight ? rgba(ink, 0.68) : rgba("#f8f4ee", 0.68);
  const light = secondaryIsLight ? "#fffdf9" : "#f8f4ee";
  const contrast = secondaryIsLight ? "#111111" : "#ffffff";
  const accentSoft = secondaryIsLight
    ? blendHex(primary, "#ffffff", 0.78)
    : rgba(light, 0.12);

  return {
    primary,
    secondary,
    headingFont,
    bodyFont,
    page,
    card,
    panel,
    ink,
    muted,
    border,
    light,
    contrast,
    accentSoft,
  };
};
