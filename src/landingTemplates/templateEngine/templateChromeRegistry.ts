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
const EducationProHeader = lazy(() =>
  import("../templates/education/EducationProTemplate").then((module) => ({
    default: module.EducationProTemplateHeader,
  })),
);
const EducationProFooter = lazy(() =>
  import("../templates/education/EducationProTemplate").then((module) => ({
    default: module.EducationProTemplateFooter,
  })),
);
const GardeningProHeader = lazy(() =>
  import("../templates/gardening/GardeningProTemplate").then((module) => ({
    default: module.GardeningProTemplateHeader,
  })),
);
const GardeningProFooter = lazy(() =>
  import("../templates/gardening/GardeningProTemplate").then((module) => ({
    default: module.GardeningProTemplateFooter,
  })),
);
const PlumbingProHeader = lazy(() =>
  import("../templates/plumbing/PlumbingProTemplate").then((module) => ({
    default: module.PlumbingProTemplateHeader,
  })),
);
const PlumbingProFooter = lazy(() =>
  import("../templates/plumbing/PlumbingProTemplate").then((module) => ({
    default: module.PlumbingProTemplateFooter,
  })),
);
const PhotoStudioProHeader = lazy(() =>
  import("../templates/portfolio/PhotoStudioProTemplate").then((module) => ({
    default: module.PhotoStudioProTemplateHeader,
  })),
);
const PhotoStudioProFooter = lazy(() =>
  import("../templates/portfolio/PhotoStudioProTemplate").then((module) => ({
    default: module.PhotoStudioProTemplateFooter,
  })),
);
const LinkHubProHeader = lazy(() =>
  import("../templates/linkHub/LinkHubProTemplate").then((module) => ({
    default: module.LinkHubProTemplateHeader,
  })),
);
const LinkHubProFooter = lazy(() =>
  import("../templates/linkHub/LinkHubProTemplate").then((module) => ({
    default: module.LinkHubProTemplateFooter,
  })),
);
const LinkHubDarkProHeader = lazy(() =>
  import("../templates/linkHub/LinkHubDarkProTemplate").then((module) => ({
    default: module.LinkHubDarkProTemplateHeader,
  })),
);
const LinkHubDarkProFooter = lazy(() =>
  import("../templates/linkHub/LinkHubDarkProTemplate").then((module) => ({
    default: module.LinkHubDarkProTemplateFooter,
  })),
);
const BeautyLinkHubProHeader = lazy(() =>
  import("../templates/linkHub/BeautyLinkHubProTemplate").then((module) => ({
    default: module.BeautyLinkHubProTemplateHeader,
  })),
);
const BeautyLinkHubProFooter = lazy(() =>
  import("../templates/linkHub/BeautyLinkHubProTemplate").then((module) => ({
    default: module.BeautyLinkHubProTemplateFooter,
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
  "education-pro": {
    Header: EducationProHeader,
    Footer: EducationProFooter,
  },
  "gardening-pro": {
    Header: GardeningProHeader,
    Footer: GardeningProFooter,
  },
  "plumbing-pro": {
    Header: PlumbingProHeader,
    Footer: PlumbingProFooter,
  },
  "photo-studio-pro": {
    Header: PhotoStudioProHeader,
    Footer: PhotoStudioProFooter,
  },
  "link-hub-pro": {
    Header: LinkHubProHeader,
    Footer: LinkHubProFooter,
  },
  "link-hub-dark-pro": {
    Header: LinkHubDarkProHeader,
    Footer: LinkHubDarkProFooter,
  },
  "beauty-link-hub-pro": {
    Header: BeautyLinkHubProHeader,
    Footer: BeautyLinkHubProFooter,
  },
};

export const getTemplateChrome = (
  templateId: string | null | undefined,
): TemplateChromeDefinition | undefined =>
  templateId ? templateChromeRegistry[templateId] : undefined;
