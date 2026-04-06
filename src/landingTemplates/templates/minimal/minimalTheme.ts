import type { TemplateTheme } from "../../templateEngine/types";

export const buildMinimalTheme = (
  primaryColor: string,
  secondaryColor?: string,
): TemplateTheme => ({
  primaryColor,
  secondaryColor: secondaryColor ?? primaryColor,
  accentColor: primaryColor,
  headingColor: "#111111",
  bodyColor: "#555555",
  bgPrimary: "#ffffff",
  bgSecondary: "#fafafa",
  surfaceColor: "#ffffff",
  borderColor: "#ebebeb",
  bgWhite: "#ffffff",
  fontFamily: "'Georgia', 'Times New Roman', serif",
});
