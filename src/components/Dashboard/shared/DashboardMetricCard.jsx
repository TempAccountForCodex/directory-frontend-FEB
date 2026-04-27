import { useEffect, useRef, useState } from 'react';
import { Box, Card, CardContent, LinearProgress, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import { getDashboardColors } from '../../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../../context/ThemeContext';

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

// Ease-out cubic for smooth deceleration
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

/**
 * Parses a value and extracts numeric value with formatting info
 */
const parseValueFormat = (value) => {
  if (typeof value === 'number') {
    return { numericValue: value, prefix: '', suffix: '', hasCommas: false, decimals: 0 };
  }
  if (typeof value !== 'string') {
    return { numericValue: null, prefix: '', suffix: '', hasCommas: false, decimals: 0 };
  }

  const prefixMatch = value.match(/^([^0-9.-]*)/);
  const prefix = prefixMatch ? prefixMatch[1] : '';
  const suffixMatch = value.match(/([^0-9.,]*)$/);
  const suffix = suffixMatch ? suffixMatch[1] : '';
  const hasCommas = value.includes(',');
  const numericString = value.replace(prefix, '').replace(suffix, '').replace(/,/g, '');
  const numericValue = parseFloat(numericString);
  const decimalMatch = numericString.match(/\.(\d+)/);
  const decimals = decimalMatch ? decimalMatch[1].length : 0;

  return {
    numericValue: isNaN(numericValue) ? null : numericValue,
    prefix,
    suffix,
    hasCommas,
    decimals,
  };
};

/**
 * Formats a number back to the original format
 */
const formatValue = (num, { prefix, suffix, hasCommas, decimals }) => {
  if (num === null || num === undefined || isNaN(num)) return `${prefix}0${suffix}`;
  let formatted = decimals > 0 ? num.toFixed(decimals) : Math.round(num).toString();
  if (hasCommas) {
    const parts = formatted.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    formatted = parts.join('.');
  }
  return `${prefix}${formatted}${suffix}`;
};

/**
 * Lightweight animated counter using requestAnimationFrame
 */
const AnimatedCounter = ({ value }) => {
  const parsed = parseValueFormat(value);
  const { numericValue, ...format } = parsed;
  const formatRef = useRef(format);
  formatRef.current = format;

  const [display, setDisplay] = useState(() => formatValue(0, format));
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (numericValue === null) {
      setDisplay(String(value));
      return;
    }

    // Reset for new values
    hasAnimated.current = false;
    setDisplay(formatValue(0, formatRef.current));

    const animate = () => {
      const startTime = performance.now();
      const fmt = formatRef.current;
      const end = numericValue;

      const tick = (now) => {
        const progress = Math.min((now - startTime) / 1000, 1);
        const current = end * easeOutCubic(progress);
        setDisplay(formatValue(current, fmt));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          animate();
        }
      },
      { threshold: 0.1 },
    );

    const el = ref.current;
    if (el) {
      observer.observe(el);
      // Check if already visible on mount
      const rect = el.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
      if (isVisible && !hasAnimated.current) {
        hasAnimated.current = true;
        animate();
      }
    }

    return () => observer.disconnect();
  }, [numericValue, value]);

  if (numericValue === null) return <span>{value}</span>;
  return <span ref={ref}>{display}</span>;
};

/**
 * DashboardMetricCard
 *
 * Reusable stat card (same style as your StatCard)
 * - value can be "$123", "45%", 123, etc.
 * - diff section is optional + hideable
 * - progress section is optional + hideable (and replaces diff if enabled)
 */
const DashboardMetricCard = ({
  title,
  value,
  icon: Icon,

  // Diff / trend section (optional)
  diff,
  diffLabel,
  trendDirection,
  showDiff, // if undefined: shows only when diff exists

  // Progress section (optional)
  showProgress = false, // only renders progress when true AND progress is provided
  progress,
  progressLabel,
  progressColor = 'primary',

  sx,
}) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);
  const isDark = actualTheme === 'dark';

  const hasDiff = diff !== undefined && diff !== null;
  const hasProgress = showProgress && progress !== undefined && progress !== null;

  // Progress takes precedence if enabled + provided
  const shouldShowDiff = !hasProgress && hasDiff && showDiff !== false;

  const parsedDiff =
    typeof diff === 'number'
      ? diff
      : typeof diff === 'string'
        ? Number.parseFloat(diff)
        : Number.NaN;

  const hasNumericDiff = Number.isFinite(parsedDiff);

  const resolvedDirection =
    trendDirection ||
    (hasNumericDiff ? (parsedDiff > 0 ? 'up' : parsedDiff < 0 ? 'down' : 'flat') : 'flat');

  const TrendIcon =
    resolvedDirection === 'up'
      ? TrendingUpIcon
      : resolvedDirection === 'down'
        ? TrendingDownIcon
        : TrendingFlatIcon;

  const trendUpColor = isDark ? '#2ad1c8' : colors.panelAccent;
  const trendColor =
    resolvedDirection === 'up'
      ? trendUpColor
      : resolvedDirection === 'down'
        ? '#f87171'
        : colors.textSecondary;

  const diffValue = hasNumericDiff ? `${Math.abs(parsedDiff)}%` : diff;

  const diffText =
    diffLabel ||
    (resolvedDirection === 'up'
      ? 'increase vs last month'
      : resolvedDirection === 'down'
        ? 'decrease vs last month'
        : 'no change vs last month');

  const iconShadow = isDark
    ? `0 10px 24px ${alpha('#000', 0.5)}, inset 0 4px 0 ${alpha('#fff', 0.04)}`
    : `0 4px 12px ${alpha('#000', 0.1)}`;

  const safeProgress = hasProgress ? clamp(Number(progress) || 0, 0, 100) : 0;
  const showFooter = hasProgress || shouldShowDiff;
  const valueIsNumeric = parseValueFormat(value).numericValue !== null;

  const baseCardSx = {
    position: 'relative',
    height: '100%',
    minHeight: 160,
    borderRadius: '18px',
    background: colors.panelBg,
    transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease',
    '&:hover': {
      transform: 'translateY(-3px)',
    },
  };

  return (
    <Card sx={{ ...baseCardSx, ...(sx || {}) }}>
      <CardContent
        sx={{
          height: '100%',
          minHeight: 160,
          p: { xs: '20px', sm: '22px' },
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          '&:last-child': { pb: { xs: '20px', sm: '22px' } },
        }}
      >
        <Box
          display="flex"
          alignItems="flex-start"
          gap={{ xs: '14px', sm: '16px' }}
          sx={{ minWidth: 0 }}
        >
          <Box
            sx={{
              width: { xs: 48, sm: 52 },
              height: { xs: 48, sm: 52 },
              minWidth: { xs: 48, sm: 52 },
              minHeight: { xs: 48, sm: 52 },
              flexShrink: 0,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: iconShadow,
              '&:hover': {
                background: `radial-gradient(circle at 30% 30%, ${alpha(colors.panelAccent || colors.primary, 0.22)} 0%, ${alpha('#000', 0.0)} 55%)`,
                border: `1px solid ${alpha(colors.panelAccent || colors.primary, 0.18)}`,
                boxShadow: `0 10px 26px ${alpha(colors.panelAccent || colors.primary, 0.14)}, inset 0 1px 0 ${alpha('#fff', 0.05)}`,
              },
            }}
          >
            <Icon
              size={22}
              sx={{ fontSize: 22, color: colors.text }}
              style={{ width: 22, height: 22, color: colors.text }}
            />
          </Box>

          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="body2"
              sx={{
                color: alpha(colors.text, 0.65),
                letterSpacing: 0,
                fontSize: '0.82rem',
                fontWeight: 600,
                lineHeight: 1.2,
                mb: '4px',
                textTransform: hasDiff || hasProgress ? 'none' : 'uppercase',
                overflowWrap: 'anywhere',
              }}
            >
              {title}
            </Typography>

            <Typography
              sx={{
                color: colors.text,
                fontSize: valueIsNumeric
                  ? {
                      xs: '2rem',
                      sm: '1.75rem',
                      lg: '1.5rem',
                      xl: '1.7rem',
                    }
                  : {
                      xs: '1.45rem',
                      sm: '1.35rem',
                      lg: '1.15rem',
                      xl: '1.25rem',
                    },
                fontWeight: 600,
                lineHeight: valueIsNumeric ? 1.05 : 1.12,
                overflowWrap: 'anywhere',
              }}
            >
              <AnimatedCounter value={value} />
            </Typography>
          </Box>
        </Box>

        {showFooter && (
          <>
            <Box sx={{ flex: 1, minHeight: 18 }} />

            {hasProgress ? (
              <Box sx={{ borderTop: `1px solid ${colors.panelBorder}`, pt: 1.6 }}>
                {progressLabel ? (
                  <Typography
                    variant="body2"
                    sx={{
                      color: colors.textSecondary,
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      mb: 1,
                    }}
                  >
                    {progressLabel}
                  </Typography>
                ) : null}

                <LinearProgress
                  variant="determinate"
                  value={safeProgress}
                  color={progressColor === 'inherit' ? undefined : progressColor}
                  sx={{
                    height: 8,
                    borderRadius: 999,
                    backgroundColor: alpha(colors.text, 0.12),
                    '& .MuiLinearProgress-bar': { borderRadius: 999 },
                  }}
                />

                <Typography
                  variant="caption"
                  sx={{
                    color: colors.textSecondary,
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    mt: 1,
                  }}
                >
                  <Box component="span" sx={{ color: colors.text, fontWeight: 600 }}>
                    {safeProgress}%
                  </Box>
                  <Box component="span" sx={{ ml: 0.75 }}>
                    complete
                  </Box>
                </Typography>
              </Box>
            ) : null}

            {shouldShowDiff ? (
              <Box
                display="flex"
                alignItems="center"
                gap={1}
                sx={{ borderTop: `1px solid ${colors.panelBorder}`, pt: 1.4 }}
              >
                <TrendIcon sx={{ fontSize: 14, color: trendColor }} />
                <Typography
                  variant="body2"
                  sx={{
                    color: colors.textSecondary,
                    fontSize: '0.875rem',
                    fontWeight: 500,
                  }}
                >
                  <Box component="span" sx={{ color: trendColor, fontWeight: 600 }}>
                    {diffValue}
                  </Box>
                  <Box component="span" sx={{ ml: 0.75 }}>
                    {diffText}
                  </Box>
                </Typography>
              </Box>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardMetricCard;
