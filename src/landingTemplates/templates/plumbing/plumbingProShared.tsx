import React from "react";
import { motion } from "framer-motion";
import { Box } from "@mui/material";
import {
  CircleDollarSign,
  Clock,
  ShieldCheck,
  Truck,
  UserRound,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { TemplateProps } from "../../templateEngine/types";
import { getStaticSelectableProps } from "../../utils/editableProps";
import { buildCompanyTheme } from "../company/theme";
import { resolveTemplateInternalLink } from "../../utils/resolveTemplateLink";

export const PLUMBING_PRO_BLUE = "#1D7BFF";
export const PLUMBING_PRO_YELLOW = "#F5C518";
export const PLUMBING_PRO_NAVY = "#0F172A";

/** Sticky header height — heroes/banners pull under the transparent default. */
export const PLUMBING_PRO_HEADER_OFFSET = { xs: 60, md: 74 } as const;

/** Pull first-page hero/banner under the shared transparent header. */
export const plumbingProUnderHeaderSx = {
  mt: {
    xs: `-${PLUMBING_PRO_HEADER_OFFSET.xs}px`,
    md: `-${PLUMBING_PRO_HEADER_OFFSET.md}px`,
  },
  pt: {
    xs: `${PLUMBING_PRO_HEADER_OFFSET.xs}px`,
    md: `${PLUMBING_PRO_HEADER_OFFSET.md}px`,
  },
} as const;

export const buildPlumbingProTheme = (data: TemplateProps["data"]) => {
  const theme = buildCompanyTheme({
    data,
    defaultPrimary: PLUMBING_PRO_BLUE,
    defaultSecondary: PLUMBING_PRO_YELLOW,
    defaultHeadingFont: '"Montserrat", "Segoe UI", sans-serif',
    defaultBodyFont: '"Inter", "Segoe UI", sans-serif',
  });

  return {
    ...theme,
    blue: theme.primary,
    yellow: theme.secondary,
    navy: PLUMBING_PRO_NAVY,
    softGray: "#F3F5F9",
  };
};

export type PlumbingProTheme = ReturnType<typeof buildPlumbingProTheme>;

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

export const resolveLink = (
  target: string | null | undefined,
  siteSlug?: string | null,
) => resolveTemplateInternalLink(target, { siteSlug });

export const MotionBox = motion(Box);

export const revealProps = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] as const },
});

export const heroReveal = (delay = 0) => ({
  initial: { opacity: 0, y: 36 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
});

export const liftHover = {
  y: -8,
  transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const },
};

export const scaleHover = {
  scale: 1.02,
  y: -6,
  transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const },
};

export const pillSx = (bg: string, color: string, bodyFont: string) => ({
  display: "inline-flex",
  alignItems: "center",
  px: 1.75,
  py: 0.65,
  borderRadius: 999,
  bgcolor: bg,
  color,
  fontFamily: bodyFont,
  fontSize: "0.72rem",
  fontWeight: 800,
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
  boxShadow: `0 8px 20px ${bg}33`,
});

export const eyebrowSx = (color: string, bodyFont: string) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 0.8,
  fontFamily: bodyFont,
  fontSize: "0.75rem",
  fontWeight: 800,
  letterSpacing: "0.14em",
  textTransform: "uppercase" as const,
  color,
});

export const premiumCtaSx = (yellow: string, navy: string) => ({
  bgcolor: yellow,
  color: navy,
  borderRadius: 999,
  px: 3.25,
  py: 1.45,
  fontWeight: 800,
  textTransform: "none" as const,
  fontSize: "0.98rem",
  boxShadow: `0 14px 32px ${yellow}55`,
  transition: "transform 0.25s ease, box-shadow 0.25s ease, opacity 0.2s ease",
  "&:hover": {
    bgcolor: yellow,
    opacity: 0.96,
    transform: "translateY(-2px)",
    boxShadow: `0 18px 40px ${yellow}66`,
  },
});

export const premiumBlueCtaSx = (blue: string) => ({
  bgcolor: blue,
  color: "#fff",
  borderRadius: 999,
  px: 3,
  py: 1.35,
  fontWeight: 800,
  textTransform: "none" as const,
  boxShadow: `0 12px 28px ${blue}44`,
  transition: "transform 0.25s ease, box-shadow 0.25s ease",
  "&:hover": {
    bgcolor: blue,
    opacity: 0.95,
    transform: "translateY(-2px)",
    boxShadow: `0 16px 36px ${blue}55`,
  },
});

export const cardSurfaceSx = {
  borderRadius: "22px",
  overflow: "hidden" as const,
  bgcolor: "#fff",
  boxShadow: "0 18px 48px rgba(15,23,42,0.08)",
  border: "1px solid rgba(15,23,42,0.04)",
  transition: "box-shadow 0.3s ease",
};

const FEATURE_ICON_MAP: Record<string, LucideIcon> = {
  experience: Users,
  team: UserRound,
  users: Users,
  delivery: Truck,
  truck: Truck,
  time: Clock,
  clock: Clock,
  ontime: Clock,
  shield: ShieldCheck,
  certified: ShieldCheck,
  wrench: Wrench,
  repair: Wrench,
  pricing: CircleDollarSign,
  price: CircleDollarSign,
  dollar: CircleDollarSign,
};

const FEATURE_ICON_FALLBACKS: LucideIcon[] = [
  Users,
  Clock,
  Truck,
  ShieldCheck,
  Wrench,
];

/**
 * Resolve a decorative Lucide icon for Why Choose / feature rows.
 * Prefers an optional `icon` token on the feature record; otherwise uses index.
 */
export const resolvePlumbingFeatureIcon = (
  feature: { icon?: string | null; title?: string | null } | null | undefined,
  index = 0,
): LucideIcon => {
  const token = String(feature?.icon || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
  if (token && FEATURE_ICON_MAP[token]) return FEATURE_ICON_MAP[token];

  const titleToken = String(feature?.title || "")
    .trim()
    .toLowerCase();
  if (titleToken.includes("experience") || titleToken.includes("team")) {
    return Users;
  }
  if (
    titleToken.includes("delivery") ||
    titleToken.includes("on-time") ||
    titleToken.includes("ontime")
  ) {
    return Truck;
  }
  if (titleToken.includes("time") || titleToken.includes("clock")) {
    return Clock;
  }
  if (titleToken.includes("price") || titleToken.includes("pricing")) {
    return CircleDollarSign;
  }
  if (titleToken.includes("insured") || titleToken.includes("professional")) {
    return UserRound;
  }
  return FEATURE_ICON_FALLBACKS[index % FEATURE_ICON_FALLBACKS.length];
};
