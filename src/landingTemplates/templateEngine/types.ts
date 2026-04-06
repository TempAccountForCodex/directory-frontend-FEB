import type { ComponentType } from "react";
import type { BusinessData } from "../types/BusinessData";

export interface TemplateTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  headingColor: string;
  bodyColor: string;
  bgPrimary: string;
  bgSecondary: string;
  surfaceColor: string;
  borderColor: string;
  fontFamily: string;
  bgWhite?: string;
}

export interface TemplateProps {
  data: BusinessData;
}

export interface TemplateDefinition {
  id: string;
  name: string;
  description: string;
  tags: string[];
  component: ComponentType<TemplateProps>;
}

// Runtime compatibility exports for any stale dev-server value imports.
export const TemplateTheme = undefined;
export const TemplateProps = undefined;
export const TemplateDefinition = undefined;
