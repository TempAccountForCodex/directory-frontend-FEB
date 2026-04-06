import type { TemplateTheme } from "../../templateEngine/types";

export const buildPremiumTheme = (
  primaryColor: string,
  secondaryColor?: string,
): TemplateTheme => ({
  primaryColor,
  secondaryColor: secondaryColor || primaryColor,
  accentColor: secondaryColor || "#C9A84C",
  headingColor: "#F0EDE8",
  bodyColor: "#9A9590",
  bgPrimary: "#0a0a0f",
  bgSecondary: "#10131a",
  bgWhite: "#fff",
  surfaceColor: "rgba(255,255,255,0.04)",
  borderColor: "rgba(255,255,255,0.1)",
  fontFamily: "'Plus Jakarta Sans', 'Inter', 'Barlow', 'Segoe UI', sans-serif",
});
