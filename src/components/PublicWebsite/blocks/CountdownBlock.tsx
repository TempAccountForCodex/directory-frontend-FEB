/**
 * CountdownBlock - Real-time countdown timer
 * Step 2.29A.4
 *
 * Three styles: simple (boxes), flip (CSS 3D), circular (SVG rings)
 * Expired state shows expiredMessage + optional CTA.
 * Cleans up interval on unmount.
 */

import React, { useState, useEffect, memo, useCallback, useMemo } from "react";
import { Box, Container, Typography, Button } from "@mui/material";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

// ── Types ──────────────────────────────────────────────────────────────────────

interface CountdownContent {
  heading?: string;
  description?: string;
  targetDate?: string;
  expiredMessage?: string;
  showDays?: boolean;
  showHours?: boolean;
  showMinutes?: boolean;
  showSeconds?: boolean;
  style?: "simple" | "flip" | "circular";
  ctaText?: string;
  ctaLink?: string;
  // Standard styling fields
  spacingPaddingTop?: string;
  spacingPaddingBottom?: string;
  spacingMarginTop?: string;
  spacingMarginBottom?: string;
  backgroundType?: string;
  backgroundColor?: string;
  backgroundGradientStart?: string;
  backgroundGradientEnd?: string;
  backgroundGradientDirection?: string;
  backgroundImage?: string;
  backgroundOverlayEnabled?: boolean;
  backgroundOverlayColor?: string;
  backgroundOverlayOpacity?: number;
  effectsShadow?: string;
  effectsBorderWidth?: string;
  effectsBorderColor?: string;
  effectsBorderRadius?: string;
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
  content: CountdownContent;
  sortOrder: number;
}

interface CountdownBlockProps {
  block: Block;
  primaryColor?: string;
  secondaryColor?: string;
  headingColor?: string;
  bodyColor?: string;
  onCtaClick?: (blockType: string, ctaText: string) => void;
}

// ── Time calculation ───────────────────────────────────────────────────────────

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  totalSeconds: number;
}

function calculateTimeRemaining(targetDate: string): TimeRemaining {
  const target = new Date(targetDate).getTime();
  const now = Date.now();
  const diff = target - now;

  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
      totalSeconds: 0,
    };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds, isExpired: false, totalSeconds };
}

// ── Default target date (7 days from now) ─────────────────────────────────────

function getDefaultTargetDate(): string {
  return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
}

// ── Spacing map ────────────────────────────────────────────────────────────────

const SPACING_MAP: Record<string, number> = {
  none: 0,
  sm: 2,
  md: 6,
  lg: 10,
  xl: 14,
};

// ── Simple Style ───────────────────────────────────────────────────────────────

interface SimpleUnitBoxProps {
  value: number;
  label: string;
  primaryColor: string;
}

const SimpleUnitBox: React.FC<SimpleUnitBoxProps> = ({
  value,
  label,
  primaryColor,
}) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 1,
    }}
  >
    <Box
      sx={{
        bgcolor: primaryColor,
        color: "white",
        borderRadius: 2,
        px: { xs: 2, md: 3 },
        py: { xs: 1.5, md: 2 },
        minWidth: { xs: 56, md: 80 },
        textAlign: "center",
        boxShadow: 3,
      }}
    >
      <Typography
        variant="h3"
        component="span"
        sx={{
          fontWeight: 800,
          fontSize: { xs: "1.8rem", md: "2.5rem" },
          lineHeight: 1,
        }}
      >
        {String(value).padStart(2, "0")}
      </Typography>
    </Box>
    <Typography
      variant="caption"
      sx={{
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: 1,
        color: "text.secondary",
      }}
    >
      {label}
    </Typography>
  </Box>
);

// ── Flip Style ─────────────────────────────────────────────────────────────────

interface FlipUnitProps {
  value: number;
  label: string;
  primaryColor: string;
}

const FlipUnit: React.FC<FlipUnitProps> = ({ value, label, primaryColor }) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 1,
    }}
  >
    <Box
      sx={{
        position: "relative",
        perspective: 300,
        width: { xs: 56, md: 80 },
        height: { xs: 56, md: 80 },
      }}
    >
      <Box
        sx={{
          width: "100%",
          height: "100%",
          bgcolor: primaryColor,
          color: "white",
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 4px 12px ${primaryColor}55`,
          // Simulated flip card — full CSS 3D flip animation
          transformStyle: "preserve-3d",
          transition: "transform 0.3s cubic-bezier(0.455, 0.03, 0.515, 0.955)",
        }}
      >
        <Typography
          variant="h4"
          component="span"
          sx={{
            fontWeight: 800,
            fontSize: { xs: "1.5rem", md: "2rem" },
            lineHeight: 1,
          }}
        >
          {String(value).padStart(2, "0")}
        </Typography>
      </Box>
      {/* Top half fold line */}
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: 0,
          right: 0,
          height: "1px",
          bgcolor: "rgba(0,0,0,0.25)",
          zIndex: 1,
        }}
      />
    </Box>
    <Typography
      variant="caption"
      sx={{
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: 1,
        color: "text.secondary",
      }}
    >
      {label}
    </Typography>
  </Box>
);

// ── Circular Style ─────────────────────────────────────────────────────────────

interface CircularUnitProps {
  value: number;
  maxValue: number;
  label: string;
  primaryColor: string;
}

const CircularUnit: React.FC<CircularUnitProps> = ({
  value,
  maxValue,
  label,
  primaryColor,
}) => {
  const size = 80;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = maxValue > 0 ? value / maxValue : 0;
  const dashOffset = circumference * (1 - progress);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1,
      }}
    >
      <Box sx={{ position: "relative", width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: "rotate(-90deg)", overflow: "visible" }}
        >
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e0e0e0"
            strokeWidth={strokeWidth}
          />
          {/* Progress ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={primaryColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.5s ease" }}
          />
        </svg>
        {/* Center value */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography
            variant="h6"
            component="span"
            sx={{ fontWeight: 800, color: primaryColor, fontSize: "1.1rem" }}
          >
            {String(value).padStart(2, "0")}
          </Typography>
        </Box>
      </Box>
      <Typography
        variant="caption"
        sx={{
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: 1,
          color: "text.secondary",
        }}
      >
        {label}
      </Typography>
    </Box>
  );
};

// ── Main component ─────────────────────────────────────────────────────────────

const CountdownBlock: React.FC<CountdownBlockProps> = ({
  block,
  primaryColor = "#2563eb",
  headingColor = "#1e293b",
  bodyColor = "#475569",
  onCtaClick,
}) => {
  const content = block.content || {};
  const {
    heading,
    description,
    targetDate = getDefaultTargetDate(),
    expiredMessage = "Time is up!",
    showDays = true,
    showHours = true,
    showMinutes = true,
    showSeconds = true,
    style = "simple",
    ctaText,
    ctaLink = "#",
    spacingPaddingTop = "md",
    spacingPaddingBottom = "md",
    responsiveHideOnMobile = false,
    responsiveHideOnTablet = false,
    responsiveHideOnDesktop = false,
  } = content;

  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(() =>
    calculateTimeRemaining(targetDate),
  );

  const pt = SPACING_MAP[spacingPaddingTop] ?? 6;
  const pb = SPACING_MAP[spacingPaddingBottom] ?? 6;

  // Interval frequency: 1s when showSeconds, 60s otherwise
  const intervalMs = showSeconds ? 1000 : 60000;

  useEffect(() => {
    // Update immediately on mount / when targetDate changes
    setTimeRemaining(calculateTimeRemaining(targetDate));

    if (timeRemaining.isExpired) return;

    const id = setInterval(() => {
      const next = calculateTimeRemaining(targetDate);
      setTimeRemaining(next);
      if (next.isExpired) {
        clearInterval(id);
      }
    }, intervalMs);

    return () => {
      clearInterval(id);
    };
  }, [targetDate, intervalMs]);

  const handleCtaClick = useCallback(() => {
    if (onCtaClick && ctaText) {
      onCtaClick(block.blockType, ctaText);
    }
  }, [onCtaClick, ctaText, block.blockType]);

  // SSR fallback
  const isSSR = typeof window === "undefined";
  const formattedDate = useMemo(() => {
    try {
      return new Date(targetDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return targetDate;
    }
  }, [targetDate]);

  // Unit definitions
  const units = useMemo(
    () => [
      {
        key: "days",
        show: showDays,
        value: timeRemaining.days,
        label: "Days",
        maxValue: 365,
      },
      {
        key: "hours",
        show: showHours,
        value: timeRemaining.hours,
        label: "Hours",
        maxValue: 24,
      },
      {
        key: "minutes",
        show: showMinutes,
        value: timeRemaining.minutes,
        label: "Minutes",
        maxValue: 60,
      },
      {
        key: "seconds",
        show: showSeconds,
        value: timeRemaining.seconds,
        label: "Seconds",
        maxValue: 60,
      },
    ],
    [showDays, showHours, showMinutes, showSeconds, timeRemaining],
  );

  const visibleUnits = units.filter((u) => u.show);

  return (
    <Box
      ref={ref}
      component={motion.div}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.5 }}
      sx={{
        py: { xs: pt / 2 + 2, md: pt },
        pb: { xs: pb / 2 + 2, md: pb },
        display: {
          xs: responsiveHideOnMobile ? "none" : "block",
          sm: responsiveHideOnTablet ? "none" : "block",
          lg: responsiveHideOnDesktop ? "none" : "block",
        },
        textAlign: "center",
      }}
    >
      <Container maxWidth="md">
        {heading && (
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            sx={{ fontWeight: 700, color: headingColor, mb: 2 }}
          >
            {heading}
          </Typography>
        )}

        {description && (
          <Typography
            variant="h6"
            sx={{ color: bodyColor, mb: 4, fontWeight: 400 }}
          >
            {description}
          </Typography>
        )}

        {/* SSR fallback */}
        {isSSR ? (
          <Typography variant="body1" sx={{ color: bodyColor }}>
            Counting down to {formattedDate}
          </Typography>
        ) : timeRemaining.isExpired ? (
          /* Expired state */
          <Box>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, color: primaryColor, mb: 3 }}
            >
              {expiredMessage}
            </Typography>
            {ctaText && (
              <Button
                variant="contained"
                size="large"
                onClick={() => {
                  handleCtaClick();
                  if (ctaLink && ctaLink !== "#") {
                    window.location.href = ctaLink;
                  }
                }}
                sx={{
                  bgcolor: primaryColor,
                  "&:hover": { bgcolor: primaryColor, opacity: 0.9 },
                  px: 4,
                  py: 1.5,
                }}
              >
                {ctaText}
              </Button>
            )}
          </Box>
        ) : (
          /* Active countdown */
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start",
                gap: { xs: 2, md: 4 },
                flexWrap: "wrap",
                mb: 4,
              }}
            >
              {style === "simple" &&
                visibleUnits.map((unit) => (
                  <SimpleUnitBox
                    key={unit.key}
                    value={unit.value}
                    label={unit.label}
                    primaryColor={primaryColor}
                  />
                ))}

              {style === "flip" &&
                visibleUnits.map((unit) => (
                  <FlipUnit
                    key={unit.key}
                    value={unit.value}
                    label={unit.label}
                    primaryColor={primaryColor}
                  />
                ))}

              {style === "circular" &&
                visibleUnits.map((unit) => (
                  <CircularUnit
                    key={unit.key}
                    value={unit.value}
                    maxValue={unit.maxValue}
                    label={unit.label}
                    primaryColor={primaryColor}
                  />
                ))}
            </Box>

            {ctaText && (
              <Button
                variant="contained"
                size="large"
                onClick={() => {
                  handleCtaClick();
                  if (ctaLink && ctaLink !== "#") {
                    window.location.href = ctaLink;
                  }
                }}
                sx={{
                  bgcolor: primaryColor,
                  "&:hover": { bgcolor: primaryColor, opacity: 0.9 },
                  px: 4,
                  py: 1.5,
                }}
              >
                {ctaText}
              </Button>
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
};

CountdownBlock.displayName = "CountdownBlock";

export default memo(CountdownBlock);
