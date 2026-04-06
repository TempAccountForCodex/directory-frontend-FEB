import type { TemplateTheme } from "../../templateEngine/types";

export const buildModernTheme = (
  primaryColor: string,
  secondaryColor?: string,
): TemplateTheme => ({
  primaryColor,
  secondaryColor: secondaryColor ?? "#D3EB63",
  accentColor: secondaryColor ?? "#D3EB63",
  headingColor: "#1a202c",
  bodyColor: "#4a5568",
  bgPrimary: "#ffffff",
  bgSecondary: "#f7fafc",
  surfaceColor: "#ffffff",
  borderColor: "#e2e8f0",
  bgWhite: "#ffffff",
  fontFamily:
    "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
});
