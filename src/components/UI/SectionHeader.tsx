import React from "react";
import PropTypes from "prop-types";
import { Box, Typography } from "@mui/material";
import type { TypographyProps } from "@mui/material";

interface SectionHeaderProps extends Omit<
  TypographyProps,
  "variant" | "align"
> {
  text: string;
  subtext?: string;
  variant?: "sm" | "md" | "lg" | "xl";
  subVariant?: "xs" | "sm" | "md" | "lg" | "xl";
  align?: "left" | "center" | "right";
  showAccent?: boolean;
  accentColor?: string;
  sx?: any;
  titleSx?: any;
  subtextSx?: any;
}

const variantMap = {
  sm: { variant: "h6" as const, fontSize: { xs: 16, md: 18 }, fontWeight: 600 },
  md: { variant: "h5" as const, fontSize: { xs: 20, md: 24 }, fontWeight: 700 },
  lg: { variant: "h3" as const, fontSize: { xs: 28, md: 40 }, fontWeight: 800 },
  xl: { variant: "h2" as const, fontSize: { xs: 36, md: 56 }, fontWeight: 800 },
};

// ✅ subtext size variants
const subVariantMap = {
  xs: { fontSize: { xs: 12, md: 15 }, lineHeight: 1.4 },
  sm: { fontSize: { xs: 14, md: 16 }, lineHeight: 1.6 },
  md: { fontSize: { xs: 16, md: 18 }, lineHeight: 1.7 }, // default
  lg: { fontSize: { xs: 18, md: 20 }, lineHeight: 1.8 },
  xl: { fontSize: { xs: 20, md: 22 }, lineHeight: 1.9 },
};

const SectionHeader = React.forwardRef<HTMLDivElement, SectionHeaderProps>(
  (
    {
      text,
      subtext,
      variant = "lg",
      subVariant = "md",
      align = "center",
      showAccent = false,
      accentColor,
      sx,
      titleSx,
      subtextSx,
      ...typographyProps
    },
    ref,
  ) => {
    const cfg = variantMap[variant] ?? variantMap.lg;
    const subCfg = subVariantMap[subVariant] ?? subVariantMap.md;

    return (
      <Box sx={{ textAlign: align, ...sx }} ref={ref}>
        <Box sx={{ display: "inline-flex", gap: 2, alignItems: "flex-start" }}>
          {showAccent && (
            <Box
              sx={{
                width: 4,
                height: { xs: 20, md: 28 },
                bgcolor: accentColor || "primary.main",
                mt: 0.5,
                flex: "0 0 auto",
              }}
            />
          )}

          <Box>
            <Typography
              variant={cfg.variant}
              sx={{
                fontSize: cfg.fontSize,
                fontWeight: cfg.fontWeight,
                lineHeight: 1.2,
                ...titleSx,
                color: subtextSx?.color,
              }}
              {...typographyProps}
            >
              {text}
            </Typography>

            {subtext && (
              <Typography
                variant="body1"
                sx={{
                  mt: 1,
                  color: "text.secondary",
                  maxWidth: 900,
                  mx: align === "center" ? "auto" : 0,
                  fontSize: subCfg.fontSize, // 👈 apply subVariant size
                  lineHeight: subCfg.lineHeight, // 👈 apply subVariant line-height
                  ...subtextSx,
                }}
              >
                {subtext}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    );
  },
);

SectionHeader.displayName = "SectionHeader";

SectionHeader.propTypes = {
  text: PropTypes.string.isRequired,
  subtext: PropTypes.string,
  variant: PropTypes.oneOf(["sm", "md", "lg", "xl"]),
  subVariant: PropTypes.oneOf(["sm", "md", "lg", "xl"]), // 👈 NEW
  align: PropTypes.oneOf(["left", "center", "right"]),
  showAccent: PropTypes.bool,
  accentColor: PropTypes.string,
  sx: PropTypes.object,
  titleSx: PropTypes.object,
  subtextSx: PropTypes.object,
};

export default SectionHeader;
