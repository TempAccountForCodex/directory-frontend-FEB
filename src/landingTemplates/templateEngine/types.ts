import { ComponentType } from "react";
import { BusinessData } from "../types/BusinessData";

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
  bgWhite: string;
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
