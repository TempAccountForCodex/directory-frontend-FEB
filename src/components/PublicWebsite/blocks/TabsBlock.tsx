/**
 * TabsBlock — TABS block renderer (Step 2.29A.1)
 *
 * Renders a tabbed content block with:
 * - MUI Tabs/Tab components with 3 variants (standard, outlined, pills)
 * - AnimatePresence for panel transitions
 * - DOMPurify on all tab content (XSS protection)
 * - Framer Motion entrance animation with useInView
 * - Vertical orientation support (desktop only, stacks to horizontal on mobile)
 * - SSR: all tab panels rendered (JS controls active state)
 * - React.memo for performance
 */

import React, { useState } from "react";
import { Box, Container, Tab, Tabs, Typography } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import DOMPurify from "dompurify";
import {
  Business as BusinessIcon,
  Build as BuildIcon,
  Support as SupportIcon,
  Verified as VerifiedIcon,
  Public as GlobalIcon,
  Lightbulb as InnovationIcon,
  Assessment as AnalyticsIcon,
  Computer as TechnologyIcon,
  School as TrainingIcon,
  Code as CodeIcon,
  Palette as PaletteIcon,
  Videocam as VideoIcon,
  TrendingUp as ChartIcon,
  Campaign as AdsIcon,
  Share as SocialIcon,
  Restaurant as ChefIcon,
  Home as HomeIcon,
  FitnessCenter as FitnessCenterIcon,
  MenuBook as CertIcon,
  Web as WebIcon,
  Star as StarIcon,
} from "@mui/icons-material";

// ---- Types ----

interface TabItem {
  label: string;
  content: string;
  icon?: string;
}

interface TabsBlockContent {
  heading?: string;
  tabs?: TabItem[];
  variant?: "standard" | "outlined" | "pills";
  orientation?: "horizontal" | "vertical";
  defaultTab?: number;
}

interface Block {
  id: number;
  blockType: string;
  content: TabsBlockContent;
  sortOrder: number;
}

interface TabsBlockProps {
  block: Block;
  primaryColor?: string;
  secondaryColor?: string;
  headingColor?: string;
  bodyColor?: string;
  onCtaClick?: (blockType: string, ctaText: string) => void;
}

// ---- Icon map (mirrors BlockRenderer) ----

const getIconComponent = (iconName: string) => {
  const iconMap: Record<string, React.ComponentType> = {
    business: BusinessIcon,
    build: BuildIcon,
    support: SupportIcon,
    verified: VerifiedIcon,
    global: GlobalIcon,
    innovation: InnovationIcon,
    analytics: AnalyticsIcon,
    technology: TechnologyIcon,
    training: TrainingIcon,
    code: CodeIcon,
    palette: PaletteIcon,
    video: VideoIcon,
    chart: ChartIcon,
    ads: AdsIcon,
    social: SocialIcon,
    chef: ChefIcon,
    home: HomeIcon,
    fitness: FitnessCenterIcon,
    cert: CertIcon,
    web: WebIcon,
    star: StarIcon,
    integrity: VerifiedIcon,
    excellence: StarIcon,
    consulting: BusinessIcon,
    strategy: AnalyticsIcon,
    design: PaletteIcon,
    local: HomeIcon,
    ambiance: StarIcon,
    rent: HomeIcon,
    invest: ChartIcon,
    class: FitnessCenterIcon,
    nutrition: FitnessCenterIcon,
    expert: StarIcon,
    flexible: StarIcon,
    automation: BuildIcon,
    integration: TechnologyIcon,
  };
  return iconMap[iconName.toLowerCase()] || StarIcon;
};

// ---- TabPanel helper ----

interface TabPanelProps {
  children: React.ReactNode;
  index: number;
  value: number;
  orientation: "horizontal" | "vertical";
}

const TabPanel: React.FC<TabPanelProps> = ({
  children,
  index,
  value,
  orientation,
}) => {
  const isActive = value === index;
  return (
    <Box
      role="tabpanel"
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      sx={{
        flex: 1,
        // SSR: always in DOM; JS toggles visibility
        display: isActive ? "block" : "none",
        pt: orientation === "horizontal" ? 3 : 0,
        pl: orientation === "vertical" ? 3 : 0,
      }}
    >
      {children}
    </Box>
  );
};

// ---- Main component ----

const TabsBlock: React.FC<TabsBlockProps> = ({
  block,
  primaryColor = "#2563eb",
  headingColor = "#1e293b",
  bodyColor = "#475569",
}) => {
  const { content } = block;
  const tabs = content.tabs || [];
  const variant = content.variant || "standard";
  const orientation = content.orientation || "horizontal";
  const defaultTab = content.defaultTab ?? 0;
  const safeDefault = Math.max(0, Math.min(defaultTab, tabs.length - 1));

  const [activeTab, setActiveTab] = useState(safeDefault);

  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // ---- Variant-specific tab styles ----
  const getTabsSx = () => {
    const base = {
      borderBottom: orientation === "horizontal" ? 1 : "none",
      borderRight: orientation === "vertical" ? 1 : "none",
      borderColor: "divider",
      minWidth: orientation === "vertical" ? 160 : "auto",
    };

    if (variant === "outlined") {
      return {
        ...base,
        "& .MuiTab-root": {
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          mr: 0.5,
          mb: orientation === "horizontal" ? 0.5 : 0.5,
          "&.Mui-selected": {
            borderColor: primaryColor,
            color: primaryColor,
            bgcolor: `${primaryColor}10`,
          },
        },
        "& .MuiTabs-indicator": { display: "none" },
      };
    }

    if (variant === "pills") {
      return {
        ...base,
        borderBottom: "none",
        borderRight: "none",
        "& .MuiTab-root": {
          borderRadius: "9999px",
          mr: 0.5,
          mb: 0.5,
          px: 2.5,
          py: 1,
          minHeight: 36,
          "&.Mui-selected": {
            bgcolor: primaryColor,
            color: "white",
          },
          "&:hover": {
            bgcolor: `${primaryColor}20`,
          },
        },
        "& .MuiTabs-indicator": { display: "none" },
      };
    }

    // standard
    return {
      ...base,
      "& .MuiTab-root.Mui-selected": { color: primaryColor },
      "& .MuiTabs-indicator": { backgroundColor: primaryColor },
    };
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          {content.heading && (
            <Typography
              variant="h3"
              component="h2"
              align="center"
              gutterBottom
              sx={{ mb: 5, fontWeight: 600, color: headingColor }}
            >
              {content.heading}
            </Typography>
          )}

          <Box
            sx={{
              display: "flex",
              flexDirection: {
                xs: "column",
                md: orientation === "vertical" ? "row" : "column",
              },
            }}
          >
            {/* Tabs navigation */}
            <Tabs
              value={activeTab}
              onChange={handleChange}
              orientation={
                orientation === "vertical"
                  ? ("vertical" as const)
                  : ("horizontal" as const)
              }
              variant="scrollable"
              scrollButtons="auto"
              aria-label="content tabs"
              sx={getTabsSx()}
            >
              {tabs.map((tab, index) => {
                const IconComponent = tab.icon
                  ? getIconComponent(tab.icon)
                  : null;
                return (
                  <Tab
                    key={index}
                    id={`tab-${index}`}
                    aria-controls={`tabpanel-${index}`}
                    label={tab.label}
                    icon={IconComponent ? <IconComponent /> : undefined}
                    iconPosition="start"
                    sx={{ textTransform: "none", fontWeight: 500 }}
                  />
                );
              })}
            </Tabs>

            {/* Tab panels */}
            <AnimatePresence mode="wait">
              {tabs.map((tab, index) => (
                <TabPanel
                  key={index}
                  index={index}
                  value={activeTab}
                  orientation={orientation}
                >
                  <motion.div
                    key={
                      activeTab === index
                        ? `active-${index}`
                        : `inactive-${index}`
                    }
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Typography
                      variant="body1"
                      component="div"
                      sx={{ color: bodyColor, lineHeight: 1.8 }}
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(tab.content || ""),
                      }}
                    />
                  </motion.div>
                </TabPanel>
              ))}
            </AnimatePresence>
          </Box>
        </Container>
      </Box>
    </motion.div>
  );
};

export default React.memo(TabsBlock);
