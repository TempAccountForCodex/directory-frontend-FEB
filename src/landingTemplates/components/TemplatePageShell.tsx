import React, { Suspense } from "react";
import { Box, CircularProgress } from "@mui/material";
import type { BusinessData } from "../types/BusinessData";
import {
  getTemplateChrome,
  type TemplateChromeMode,
} from "../templateEngine/templateChromeRegistry";

interface TemplatePageShellProps {
  templateId?: string | null;
  data: BusinessData;
  mode?: TemplateChromeMode;
  children: React.ReactNode;
  fallbackHeader?: React.ReactNode;
  fallbackFooter?: React.ReactNode;
}

interface TemplateChromeWrapperProps {
  children: React.ReactNode;
}

export const TemplateHeaderWrapper: React.FC<TemplateChromeWrapperProps> = ({
  children,
}) => (
  <Box
    data-template-shared-header="true"
    sx={{ flex: "0 0 auto", position: "relative", zIndex: 20 }}
  >
    {children}
  </Box>
);

export const TemplateFooterWrapper: React.FC<TemplateChromeWrapperProps> = ({
  children,
}) => (
  <Box data-template-shared-footer="true" sx={{ flex: "0 0 auto" }}>
    {children}
  </Box>
);

const ShellLoader = () => (
  <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
    <CircularProgress size={24} />
  </Box>
);

const TemplatePageShell: React.FC<TemplatePageShellProps> = ({
  templateId,
  data,
  mode = "page-shell",
  children,
  fallbackHeader,
  fallbackFooter,
}) => {
  const chrome = getTemplateChrome(templateId);
  const Header = chrome?.Header;
  const Footer = chrome?.Footer;

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <TemplateHeaderWrapper>
        <Suspense fallback={<ShellLoader />}>
          {Header ? <Header data={data} mode={mode} /> : fallbackHeader}
        </Suspense>
      </TemplateHeaderWrapper>
      <Box component="main" sx={{ flex: "1 0 auto" }}>
        {children}
      </Box>
      <TemplateFooterWrapper>
        <Suspense fallback={null}>
          {Footer ? <Footer data={data} mode={mode} /> : fallbackFooter}
        </Suspense>
      </TemplateFooterWrapper>
    </Box>
  );
};

export default TemplatePageShell;

