import React, { lazy } from "react";
import type { BusinessData } from "../types/BusinessData";

export type TemplateChromeMode = "full-template" | "page-shell" | "editor";

export interface TemplateChromeProps {
  data: BusinessData;
  mode?: TemplateChromeMode;
}

export interface TemplateChromeDefinition {
  Header?: React.ComponentType<TemplateChromeProps>;
  Footer?: React.ComponentType<TemplateChromeProps>;
}

const MinimalHeader = lazy(() =>
  import("../templates/minimal/MinimalTemplate").then((module) => ({
    default: module.MinimalTemplateHeader,
  })),
);
const MinimalFooter = lazy(() =>
  import("../templates/minimal/MinimalTemplate").then((module) => ({
    default: module.MinimalTemplateFooter,
  })),
);

const ModernHeader = lazy(() =>
  import("../templates/modern/ModernTemplate").then((module) => ({
    default: module.ModernTemplateHeader,
  })),
);
const ModernFooter = lazy(() =>
  import("../templates/modern/ModernTemplate").then((module) => ({
    default: module.ModernTemplateFooter,
  })),
);

const PremiumHeader = lazy(() =>
  import("../templates/premium/PremiumTemplate").then((module) => ({
    default: module.PremiumTemplateHeader,
  })),
);
const PremiumFooter = lazy(() =>
  import("../templates/premium/PremiumTemplate").then((module) => ({
    default: module.PremiumTemplateFooter,
  })),
);

const CompanyStudioHeader = lazy(() =>
  import("../templates/company/CompanyStudioTemplate").then((module) => ({
    default: module.CompanyStudioTemplateHeader,
  })),
);
const CompanyStudioFooter = lazy(() =>
  import("../templates/company/CompanyStudioTemplate").then((module) => ({
    default: module.CompanyStudioTemplateFooter,
  })),
);
const CompanyProHeader = lazy(() =>
  import("../templates/company/CompanyProTemplate").then((module) => ({
    default: module.CompanyProTemplateHeader,
  })),
);
const CompanyProFooter = lazy(() =>
  import("../templates/company/CompanyProTemplate").then((module) => ({
    default: module.CompanyProTemplateFooter,
  })),
);

const templateChromeRegistry: Record<string, TemplateChromeDefinition> = {
  minimal: {
    Header: MinimalHeader,
    Footer: MinimalFooter,
  },
  modern: {
    Header: ModernHeader,
    Footer: ModernFooter,
  },
  premium: {
    Header: PremiumHeader,
    Footer: PremiumFooter,
  },
  "company-executive": {
    Header: CompanyStudioHeader,
    Footer: CompanyStudioFooter,
  },
  "company-pro": {
    Header: CompanyProHeader,
    Footer: CompanyProFooter,
  },
};

export const getTemplateChrome = (
  templateId: string | null | undefined,
): TemplateChromeDefinition | undefined =>
  templateId ? templateChromeRegistry[templateId] : undefined;
