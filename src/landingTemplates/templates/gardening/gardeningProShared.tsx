import React from "react";
import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";
import type { TemplateProps } from "../../templateEngine/types";
import {
  getEditableTextProps,
  getStaticSelectableProps,
} from "../../utils/editableProps";
import { buildCompanyTheme } from "../company/theme";
import { resolveTemplateInternalLink } from "../../utils/resolveTemplateLink";

export const buildGardeningProTheme = (data: TemplateProps["data"]) => {
  const theme = buildCompanyTheme({
    data,
    defaultPrimary: "#2D3E2F",
    defaultSecondary: "#F5F2EB",
    defaultHeadingFont: '"Playfair Display", Georgia, serif',
    defaultBodyFont: '"Inter", "Segoe UI", sans-serif',
  });

  return {
    ...theme,
    forest: theme.primary,
    forestDeep: "#1B2E1D",
    cream: theme.secondary,
    creamSoft: "#F9F9F7",
    lime: "#D4E157",
    limeBright: "#E6FF40",
  };
};

export type GardeningProTheme = ReturnType<typeof buildGardeningProTheme>;

export const asRecord = (value: unknown): Record<string, any> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, any>)
    : {};

export const asArray = <T,>(value: unknown, fallback: T[]): T[] =>
  Array.isArray(value) && value.length ? (value as T[]) : fallback;

export const containerProps = (
  blockId: string | number | undefined,
  id: string,
  label: string,
  type: "container" | "card" = "container",
) => getStaticSelectableProps(blockId, label, id, "containerStyles", type);

/** Template page CTAs must use website/preview bases, never platform /about. */
export const resolveLink = (
  target: string | null | undefined,
  siteSlug?: string | null,
) => resolveTemplateInternalLink(target, { siteSlug });

export const MotionBox = motion(Box);

export const revealProps = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
});

export const liftHover = { y: -6, transition: { duration: 0.25 } };

export const eyebrowSx = (color: string, bodyFont: string) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 0.8,
  fontFamily: bodyFont,
  fontSize: "0.72rem",
  fontWeight: 700,
  letterSpacing: "0.14em",
  textTransform: "uppercase" as const,
  color,
});

/** Heading with an editable italic lime accent word (GREENTH signature). */
export function AccentHeading({
  blockId,
  heading,
  accent,
  fallbackHeading,
  fallbackAccent,
  headingFont,
  accentColor,
  sx,
  accentSx,
  component = "h2",
}: {
  blockId: string | number | undefined;
  heading?: string;
  accent?: string;
  fallbackHeading: string;
  fallbackAccent?: string;
  headingFont: string;
  accentColor: string;
  sx?: Record<string, unknown>;
  accentSx?: Record<string, unknown>;
  component?: React.ElementType;
}) {
  const accentText = accent || fallbackAccent;
  return (
    <Typography
      component={component}
      sx={{
        fontFamily: headingFont,
        fontWeight: 500,
        lineHeight: 1.15,
        ...sx,
      }}
    >
      <Box
        component="span"
        {...getEditableTextProps(blockId, "heading", "multi")}
      >
        {heading || fallbackHeading}
      </Box>
      {accentText ? (
        <>
          {" "}
          <Box
            component="em"
            {...getEditableTextProps(blockId, "headingAccent", "single")}
            sx={{
              fontStyle: "italic",
              fontFamily: headingFont,
              fontWeight: 500,
              color: accentColor,
              ...accentSx,
            }}
          >
            {accentText}
          </Box>
        </>
      ) : null}
    </Typography>
  );
}
