/**
 * StepsProcessBlock — STEPS_PROCESS block renderer (Step 2.29A.2)
 *
 * Renders a process steps block with:
 * - Auto-numbered circles (1, 2, 3...)
 * - 3 layouts: horizontal (flexbox), vertical (timeline), alternating (zigzag)
 * - Connector lines/arrows between steps when showConnectors is true
 * - Staggered entrance animation (delay: index * 0.15s) with whileInView
 * - Icon support via getIconComponent
 * - Responsive: horizontal collapses to vertical on mobile
 * - SSR: renders as ordered list with step numbers
 * - React.memo for performance
 */

import React from "react";
import { Box, Container, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
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

interface Step {
  title: string;
  description: string;
  icon?: string;
}

interface StepsProcessContent {
  heading?: string;
  description?: string;
  steps?: Step[];
  layout?: "horizontal" | "vertical" | "alternating";
  showConnectors?: boolean;
  accentColor?: string;
}

interface Block {
  id: number;
  blockType: string;
  content: StepsProcessContent;
  sortOrder: number;
}

interface StepsProcessBlockProps {
  block: Block;
  primaryColor?: string;
  secondaryColor?: string;
  headingColor?: string;
  bodyColor?: string;
  onCtaClick?: (blockType: string, ctaText: string) => void;
}

// ---- Icon map ----

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

// ---- Step Circle component ----

interface StepCircleProps {
  number: number;
  accentColor: string;
  icon?: string;
}

const StepCircle: React.FC<StepCircleProps> = ({
  number,
  accentColor,
  icon,
}) => {
  const IconComponent = icon ? getIconComponent(icon) : null;
  return (
    <Box
      sx={{
        width: 56,
        height: 56,
        borderRadius: "50%",
        bgcolor: accentColor,
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        fontWeight: 700,
        fontSize: "1.25rem",
        boxShadow: `0 4px 14px ${accentColor}60`,
        zIndex: 1,
      }}
    >
      {IconComponent ? <IconComponent /> : <span>{number}</span>}
    </Box>
  );
};

// ---- Connector ----

interface ConnectorProps {
  orientation: "horizontal" | "vertical";
  accentColor: string;
}

const Connector: React.FC<ConnectorProps> = ({ orientation, accentColor }) => {
  if (orientation === "horizontal") {
    return (
      <Box
        sx={{
          flex: 1,
          height: 2,
          bgcolor: `${accentColor}40`,
          alignSelf: "center",
          mx: 1,
          display: { xs: "none", md: "block" },
        }}
      />
    );
  }
  return (
    <Box
      sx={{
        width: 2,
        height: 40,
        bgcolor: `${accentColor}40`,
        ml: "27px", // center with 56px circle
        my: 0,
      }}
    />
  );
};

// ---- Single step card ----

interface StepCardProps {
  step: Step;
  index: number;
  accentColor: string;
  headingColor: string;
  bodyColor: string;
  inView: boolean;
  layout: "horizontal" | "vertical" | "alternating";
  isLast: boolean;
  showConnectors: boolean;
}

const StepCard: React.FC<StepCardProps> = ({
  step,
  index,
  accentColor,
  headingColor,
  bodyColor,
  inView,
  layout,
  isLast,
  showConnectors,
}) => {
  const isAlternatingRight = layout === "alternating" && index % 2 === 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay: index * 0.15, ease: "easeOut" }}
      style={{ display: "contents" }}
    >
      {layout === "horizontal" ? (
        // Horizontal layout: stacks to column on mobile
        <Box
          component="li"
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            flex: 1,
            minWidth: { xs: "100%", md: 0 },
            listStyle: "none",
          }}
        >
          <StepCircle
            number={index + 1}
            accentColor={accentColor}
            icon={step.icon}
          />
          <Typography
            variant="h6"
            component="h3"
            sx={{ mt: 2, mb: 1, fontWeight: 600, color: headingColor }}
          >
            {step.title}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: bodyColor, lineHeight: 1.7 }}
          >
            {step.description}
          </Typography>
        </Box>
      ) : layout === "vertical" ? (
        // Vertical layout: timeline style
        <Box component="li" sx={{ display: "flex", gap: 2, listStyle: "none" }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <StepCircle
              number={index + 1}
              accentColor={accentColor}
              icon={step.icon}
            />
            {!isLast && showConnectors && (
              <Connector orientation="vertical" accentColor={accentColor} />
            )}
          </Box>
          <Box sx={{ pb: 3, pt: 0.5 }}>
            <Typography
              variant="h6"
              component="h3"
              sx={{ mb: 0.5, fontWeight: 600, color: headingColor }}
            >
              {step.title}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: bodyColor, lineHeight: 1.7 }}
            >
              {step.description}
            </Typography>
          </Box>
        </Box>
      ) : (
        // Alternating layout: zigzag
        <Box
          component="li"
          sx={{
            display: "flex",
            flexDirection: {
              xs: "column",
              md: isAlternatingRight ? "row-reverse" : "row",
            },
            alignItems: { xs: "flex-start", md: "center" },
            gap: 3,
            listStyle: "none",
            mb: 4,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <StepCircle
              number={index + 1}
              accentColor={accentColor}
              icon={step.icon}
            />
          </Box>
          <Box
            sx={{
              flex: 1,
              textAlign: {
                xs: "left",
                md: isAlternatingRight ? "right" : "left",
              },
            }}
          >
            <Typography
              variant="h6"
              component="h3"
              sx={{ mb: 0.5, fontWeight: 600, color: headingColor }}
            >
              {step.title}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: bodyColor, lineHeight: 1.7 }}
            >
              {step.description}
            </Typography>
          </Box>
        </Box>
      )}
    </motion.div>
  );
};

// ---- Main component ----

const StepsProcessBlock: React.FC<StepsProcessBlockProps> = ({
  block,
  primaryColor = "#2563eb",
  headingColor = "#1e293b",
  bodyColor = "#475569",
}) => {
  const { content } = block;
  const steps = content.steps || [];
  const layout = content.layout || "horizontal";
  const showConnectors = content.showConnectors !== false;
  const accentColor = content.accentColor || primaryColor;

  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  // Layout for horizontal: flex-row on desktop, column on mobile
  const listSx =
    layout === "horizontal"
      ? {
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "flex-start", md: "flex-start" },
          gap: 0,
          p: 0,
          m: 0,
        }
      : { p: 0, m: 0 };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          {/* Header */}
          {content.heading && (
            <Typography
              variant="h3"
              component="h2"
              align="center"
              gutterBottom
              sx={{ mb: 2, fontWeight: 600, color: headingColor }}
            >
              {content.heading}
            </Typography>
          )}
          {content.description && (
            <Typography
              variant="h6"
              align="center"
              sx={{ mb: 6, color: bodyColor, fontWeight: 400 }}
            >
              {content.description}
            </Typography>
          )}

          {/* Steps as ordered list (SSR-friendly) */}
          <Box component="ol" sx={listSx}>
            {steps.map((step, index) => {
              const isLast = index === steps.length - 1;

              return (
                <React.Fragment key={index}>
                  <StepCard
                    step={step}
                    index={index}
                    accentColor={accentColor}
                    headingColor={headingColor}
                    bodyColor={bodyColor}
                    inView={inView}
                    layout={layout}
                    isLast={isLast}
                    showConnectors={showConnectors}
                  />
                  {/* Connector between steps (horizontal layout only) */}
                  {layout === "horizontal" && !isLast && showConnectors && (
                    <Connector
                      orientation="horizontal"
                      accentColor={accentColor}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </Box>
        </Container>
      </Box>
    </motion.div>
  );
};

export default React.memo(StepsProcessBlock);
