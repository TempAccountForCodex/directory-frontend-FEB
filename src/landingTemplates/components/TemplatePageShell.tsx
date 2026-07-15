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
      <Suspense fallback={<ShellLoader />}>
        {Header ? <Header data={data} mode={mode} /> : fallbackHeader}
      </Suspense>
      <Box component="main" sx={{ flex: "1 0 auto" }}>
        {children}
      </Box>
      <Suspense fallback={null}>
        {Footer ? <Footer data={data} mode={mode} /> : fallbackFooter}
      </Suspense>
    </Box>
  );
};

export default TemplatePageShell;

