/**
 * AnnouncementBarBlock — Step 2.29A.6
 *
 * Renders a dismissible announcement banner.
 * - Fixed top bar (position: 'top') or inline banner (position: 'inline')
 * - Dismissible: sessionStorage keyed by `announcement-dismissed-${block.id}`
 * - Framer Motion AnimatePresence for dismiss animation
 * - Icon from getIconComponent() when provided
 * - Link opens in new tab (target=_blank, rel=noopener noreferrer)
 * - Text as text node (NOT dangerouslySetInnerHTML) for XSS safety
 * - SSR: renders visible banner with close button
 */

import React, { memo, useState, useCallback } from "react";
import { Box, Container, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
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
import { motion, AnimatePresence } from "framer-motion";

// ---------------------------------------------------------------------------
// Icon helper (mirrors getIconComponent from BlockRenderer)
// ---------------------------------------------------------------------------

const getIconComponent = (iconName: string): React.ComponentType<any> => {
  const iconMap: Record<string, React.ComponentType<any>> = {
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
    star: StarIcon,
    campaign: AdsIcon,
    announcement: AdsIcon,
  };
  return iconMap[iconName.toLowerCase()] ?? StarIcon;
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AnnouncementBarContent {
  text?: string;
  linkText?: string;
  linkUrl?: string;
  backgroundColor?: string;
  textColor?: string;
  dismissible?: boolean;
  position?: "top" | "inline";
  icon?: string;
  // Standard styling fields
  spacingPaddingTop?: string;
  spacingPaddingBottom?: string;
  spacingMarginTop?: string;
  spacingMarginBottom?: string;
  animationEntranceType?: string;
  animationDuration?: number;
  animationDelay?: number;
  animationScrollTriggered?: boolean;
  responsiveHideOnMobile?: boolean;
  responsiveHideOnTablet?: boolean;
  responsiveHideOnDesktop?: boolean;
}

interface Block {
  id: number;
  blockType: string;
  content: AnnouncementBarContent;
  sortOrder: number;
}

interface AnnouncementBarBlockProps {
  block: Block;
  primaryColor?: string;
  secondaryColor?: string;
  headingColor?: string;
  bodyColor?: string;
  onCtaClick?: (blockType: string, ctaText: string) => void;
}

// ---------------------------------------------------------------------------
// Main exported component
// ---------------------------------------------------------------------------

const AnnouncementBarBlock = memo(function AnnouncementBarBlock({
  block,
  primaryColor = "#2563eb",
}: AnnouncementBarBlockProps) {
  const { id, content } = block;

  const dismissKey = `announcement-dismissed-${id}`;

  // Check if already dismissed in this session
  const isAlreadyDismissed =
    typeof window !== "undefined" && sessionStorage.getItem(dismissKey) === "1";

  const [visible, setVisible] = useState<boolean>(!isAlreadyDismissed);

  const handleDismiss = useCallback(() => {
    sessionStorage.setItem(dismissKey, "1");
    setVisible(false);
  }, [dismissKey]);

  const backgroundColor = content.backgroundColor ?? primaryColor;
  const textColor = content.textColor ?? "#ffffff";
  const dismissible = content.dismissible !== false; // default true
  const position = content.position ?? "inline";
  const iconName = content.icon;
  const text = content.text ?? "";
  const linkText = content.linkText ?? "";
  const linkUrl = content.linkUrl ?? "";

  const positionStyles =
    position === "top"
      ? {
          position: "fixed" as const,
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1300,
        }
      : {
          position: "relative" as const,
        };

  const bannerMotionVariants = {
    visible: { opacity: 1, height: "auto", scaleY: 1 },
    hidden: { opacity: 0, height: 0, scaleY: 0 },
  };

  const IconComponent = iconName ? getIconComponent(iconName) : null;

  return (
    <AnimatePresence>
      {visible && (
        <Box
          component={motion.div as any}
          key={`announcement-${id}`}
          variants={bannerMotionVariants}
          initial="visible"
          exit="hidden"
          transition={{ duration: 0.25, ease: "easeInOut" }}
          sx={{
            ...positionStyles,
            backgroundColor,
            color: textColor,
            overflow: "hidden",
            transformOrigin: "top",
          }}
          role="banner"
          aria-label="Announcement"
        >
          <Container maxWidth="lg">
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                py: 1,
                gap: 1,
                flexWrap: "wrap",
                position: "relative",
              }}
            >
              {/* Icon */}
              {IconComponent && (
                <IconComponent
                  sx={{ fontSize: 18, color: textColor, flexShrink: 0 }}
                />
              )}

              {/* Text — rendered as text node for XSS safety */}
              <Typography
                variant="body2"
                component="span"
                sx={{
                  color: textColor,
                  fontWeight: 500,
                  lineHeight: 1.4,
                  textAlign: "center",
                }}
              >
                {text}
              </Typography>

              {/* CTA Link */}
              {linkText && linkUrl && (
                <Typography
                  component="a"
                  href={linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="body2"
                  sx={{
                    color: textColor,
                    fontWeight: 700,
                    textDecoration: "underline",
                    cursor: "pointer",
                    flexShrink: 0,
                    "&:hover": { opacity: 0.85 },
                  }}
                >
                  {linkText}
                </Typography>
              )}

              {/* Dismiss button */}
              {dismissible && (
                <IconButton
                  size="small"
                  onClick={handleDismiss}
                  aria-label="Dismiss announcement"
                  sx={{
                    color: textColor,
                    p: 0.5,
                    flexShrink: 0,
                    "&:hover": { bgcolor: "rgba(255,255,255,0.15)" },
                  }}
                >
                  <CloseIcon sx={{ fontSize: 16 }} />
                </IconButton>
              )}
            </Box>
          </Container>
        </Box>
      )}
    </AnimatePresence>
  );
});

AnnouncementBarBlock.displayName = "AnnouncementBarBlock";

export default AnnouncementBarBlock;
