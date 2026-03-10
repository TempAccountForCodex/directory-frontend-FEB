import { TemplateTheme } from "../../templateEngine/types";

export const buildPremiumTheme = (
  primaryColor: string,
  _secondaryColor?: string,
): TemplateTheme => ({
  primaryColor,
  secondaryColor: primaryColor,
  accentColor: "#C9A84C",
  headingColor: "#F0EDE8",
  bodyColor: "#9A9590",
  bgPrimary: "#0a0a0f",
  bgSecondary: "#0f0f18",
  bgWhite: "#fff",
  surfaceColor: "rgba(255,255,255,0.04)",
  borderColor: "rgba(255,255,255,0.1)",
  fontFamily: "'Cormorant Garamond', Georgia, serif",
});
