/**
 * FeaturesBlock — Step 10.3: Stacked & 4-Column Variants
 *
 * Renders the FEATURES block in 3 variants controlled by content.variant:
 *   - default:   3-column card grid with hover lift (original behavior)
 *   - 4-column:  compact 4-column card grid, smaller avatars & tighter spacing
 *   - stacked:   horizontal rows — icon on left, title + description on right
 */

import React, { memo } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Stack,
} from "@mui/material";
import { BlockWrapper } from "../BlockWrapper";
import { getIconComponent } from "../utils/iconMap";
import AnimatedList from "../utils/AnimatedList";

// ── Types ──────────────────────────────────────────────────────────────────────

interface Feature {
  icon?: string;
  title?: string;
  description?: string;
}

interface FeaturesBlockProps {
  content: {
    heading?: string;
    features?: Feature[];
    variant?: "default" | "4-column" | "stacked" | "badges";
    badgeBackgroundColor?: string;
    badgeSpacing?: "compact" | "normal" | "wide";
  };
  primaryColor?: string;
  headingColor?: string;
  bodyColor?: string;
}

// ── Sub-components ─────────────────────────────────────────────────────────────

/**
 * FeatureIcon — renders a coloured avatar with the mapped MUI icon.
 * Returns null when no icon name is provided.
 */
const FeatureIcon: React.FC<{
  icon?: string;
  bgcolor: string;
  size: number;
  mb?: number;
}> = memo(({ icon, bgcolor, size, mb = 2 }) => {
  if (!icon) return null;
  const IconComponent = getIconComponent(icon);
  return (
    <Avatar
      sx={{
        bgcolor,
        width: size,
        height: size,
        mb,
        flexShrink: 0,
      }}
    >
      <IconComponent />
    </Avatar>
  );
});
FeatureIcon.displayName = "FeatureIcon";

// ── Variant renderers ──────────────────────────────────────────────────────────

/**
 * DefaultVariant — 3-column card grid with hover lift.
 */
const DefaultVariant: React.FC<{
  features: Feature[];
  primaryColor: string;
  headingColor: string;
  bodyColor: string;
}> = memo(({ features, primaryColor, headingColor, bodyColor }) => (
  <Grid container spacing={4}>
    <AnimatedList staggerMs={80} wrapperStyle={{ display: "contents" }}>
      {features.map((feature, index) => (
        <Grid item xs={12} md={4} key={index}>
          <Card
            elevation={2}
            sx={{
              height: "100%",
              transition: "transform 0.3s ease",
              "&:hover": {
                transform: "translateY(-8px)",
                boxShadow: 4,
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <FeatureIcon
                icon={feature.icon}
                bgcolor={primaryColor}
                size={56}
                mb={2}
              />
              <Typography
                variant="h5"
                component="h3"
                gutterBottom
                sx={{ color: primaryColor, fontWeight: 600 }}
              >
                {feature.title}
              </Typography>
              <Typography variant="body1" sx={{ color: bodyColor }}>
                {feature.description}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </AnimatedList>
  </Grid>
));
DefaultVariant.displayName = "DefaultVariant";

/**
 * FourColumnVariant — compact 4-column card grid.
 * Smaller avatar (44x44), tighter padding (p:2), h6 titles, spacing={3}.
 */
const FourColumnVariant: React.FC<{
  features: Feature[];
  primaryColor: string;
  headingColor: string;
  bodyColor: string;
}> = memo(({ features, primaryColor, headingColor, bodyColor }) => (
  <Grid container spacing={3} data-testid="four-column-grid">
    <AnimatedList staggerMs={80} wrapperStyle={{ display: "contents" }}>
      {features.map((feature, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card
            elevation={2}
            sx={{
              height: "100%",
              transition: "transform 0.3s ease",
              "&:hover": {
                transform: "translateY(-6px)",
                boxShadow: 4,
              },
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <FeatureIcon
                icon={feature.icon}
                bgcolor={primaryColor}
                size={44}
                mb={1.5}
              />
              <Typography
                variant="h6"
                component="h3"
                gutterBottom
                sx={{
                  color: primaryColor,
                  fontWeight: 600,
                  fontSize: "0.95rem",
                }}
              >
                {feature.title}
              </Typography>
              <Typography variant="body2" sx={{ color: bodyColor }}>
                {feature.description}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </AnimatedList>
  </Grid>
));
FourColumnVariant.displayName = "FourColumnVariant";

/**
 * StackedVariant — horizontal rows: icon on left, title + description on right.
 * Clean feature list style — no card elevation, subtle border separator.
 */
const StackedVariant: React.FC<{
  features: Feature[];
  primaryColor: string;
  headingColor: string;
  bodyColor: string;
}> = memo(({ features, primaryColor, headingColor, bodyColor }) => (
  <Box sx={{ maxWidth: 800, mx: "auto" }} data-testid="stacked-list">
    <AnimatedList staggerMs={80}>
      {features.map((feature, index) => (
        <Box
          key={index}
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: 3,
            py: 3,
            borderBottom: index < features.length - 1 ? "1px solid" : "none",
            borderColor: "divider",
          }}
          data-testid="stacked-row"
        >
          <FeatureIcon
            icon={feature.icon}
            bgcolor={primaryColor}
            size={52}
            mb={0}
          />
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h6"
              component="h3"
              gutterBottom
              sx={{ color: headingColor, fontWeight: 600, mb: 0.5 }}
            >
              {feature.title}
            </Typography>
            <Typography variant="body1" sx={{ color: bodyColor }}>
              {feature.description}
            </Typography>
          </Box>
        </Box>
      ))}
    </AnimatedList>
  </Box>
));
StackedVariant.displayName = "StackedVariant";

/**
 * BadgesVariant — compact horizontal icon + label strip for trust badges.
 * Deliberately omits description — renders title only.
 */
const BADGE_SPACING_MAP = { compact: 1, normal: 3, wide: 5 } as const;

const BadgesVariant: React.FC<{
  features: Feature[];
  primaryColor: string;
  headingColor: string;
  badgeBackgroundColor?: string;
  badgeSpacing?: "compact" | "normal" | "wide";
}> = memo(
  ({
    features,
    primaryColor,
    headingColor,
    badgeBackgroundColor,
    badgeSpacing = "normal",
  }) => {
    const gap = BADGE_SPACING_MAP[badgeSpacing] ?? 3;
    return (
      <Box
        data-testid="badges-strip"
        sx={{
          ...(badgeBackgroundColor
            ? { bgcolor: badgeBackgroundColor, borderRadius: 2, py: 2, px: 3 }
            : {}),
        }}
      >
        <Stack
          direction="row"
          sx={{
            flexWrap: "wrap",
            justifyContent: { xs: "center", md: "space-evenly" },
            gap,
          }}
        >
          <AnimatedList staggerMs={60} wrapperStyle={{ display: "contents" }}>
            {features.map((feature, index) => (
              <Stack
                key={index}
                direction="row"
                alignItems="center"
                spacing={1}
                data-testid="badge-item"
                sx={{
                  minWidth: { xs: "40%", sm: "auto" },
                  justifyContent: "center",
                }}
              >
                {feature.icon &&
                  (() => {
                    const IconComponent = getIconComponent(feature.icon);
                    return (
                      <IconComponent
                        sx={{ fontSize: 20, color: primaryColor }}
                      />
                    );
                  })()}
                <Typography
                  variant="body2"
                  component="span"
                  sx={{
                    color: headingColor,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                  }}
                >
                  {feature.title}
                </Typography>
              </Stack>
            ))}
          </AnimatedList>
        </Stack>
      </Box>
    );
  },
);
BadgesVariant.displayName = "BadgesVariant";

// ── Main component ─────────────────────────────────────────────────────────────

const FeaturesBlock: React.FC<FeaturesBlockProps> = memo(
  ({
    content,
    primaryColor = "#2563eb",
    headingColor = "#1e293b",
    bodyColor = "#475569",
  }) => {
    const features = content.features ?? [];
    const variant = content.variant ?? "default";

    const renderVariant = () => {
      switch (variant) {
        case "4-column":
          return (
            <FourColumnVariant
              features={features}
              primaryColor={primaryColor}
              headingColor={headingColor}
              bodyColor={bodyColor}
            />
          );
        case "stacked":
          return (
            <StackedVariant
              features={features}
              primaryColor={primaryColor}
              headingColor={headingColor}
              bodyColor={bodyColor}
            />
          );
        case "badges":
          return (
            <BadgesVariant
              features={features}
              primaryColor={primaryColor}
              headingColor={headingColor}
              badgeBackgroundColor={content.badgeBackgroundColor}
              badgeSpacing={content.badgeSpacing}
            />
          );
        case "default":
        default:
          return (
            <DefaultVariant
              features={features}
              primaryColor={primaryColor}
              headingColor={headingColor}
              bodyColor={bodyColor}
            />
          );
      }
    };

    return (
      <BlockWrapper
        fields={
          content as unknown as import("../BlockWrapper").BlockWrapperFields
        }
      >
        <Box sx={{ bgcolor: "background.default" }}>
          <Container maxWidth="lg">
            <Typography
              variant="h3"
              component="h2"
              align="center"
              gutterBottom
              sx={{ mb: 6, fontWeight: 600, color: headingColor }}
            >
              {content.heading || "Features"}
            </Typography>
            {renderVariant()}
          </Container>
        </Box>
      </BlockWrapper>
    );
  },
);

FeaturesBlock.displayName = "FeaturesBlock";

export default FeaturesBlock;
