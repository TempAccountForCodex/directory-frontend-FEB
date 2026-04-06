/**
 * DealBanner — Step 10.36
 *
 * Sticky top bar displaying active promotional deals.
 *
 * Features:
 * - Gradient background using theme colors
 * - Live countdown timer (when deal ends within 7 days)
 * - 24h dismissal via localStorage (scoped to dealId + userId)
 * - Responsive: text clamps on mobile, CTA always visible
 * - Graceful degradation: hidden on error/loading/no deal
 * - Respects bannerConfig.showOnPages and bannerConfig.showOnFeatureGate
 */

import { useState, useEffect, useCallback, memo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { alpha } from '@mui/material/styles';
import { X as CloseIcon, Tag as PromoIcon } from 'lucide-react';
import { getDashboardColors } from '../../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../../context/ThemeContext';
import DashboardGradientButton from './DashboardGradientButton';
import { useNavigate, useLocation } from 'react-router-dom';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const DISMISS_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Build localStorage key for dismiss state, scoped to dealId + userId.
 */
function getDismissKey(dealId, userId) {
  return `tt_deal_dismissed_${dealId}_${userId || 'guest'}`;
}

/**
 * Check if the banner for a given deal has been dismissed (non-expired).
 */
function isDismissed(dealId, userId) {
  try {
    const key = getDismissKey(dealId, userId);
    const raw = localStorage.getItem(key);
    if (!raw) return false;
    const expiresAt = parseInt(raw, 10);
    if (Date.now() < expiresAt) return true;
    // Expired — remove the stale key
    localStorage.removeItem(key);
    return false;
  } catch {
    return false;
  }
}

/**
 * Write a dismiss entry that expires in 24h.
 */
function writeDismiss(dealId, userId) {
  try {
    const key = getDismissKey(dealId, userId);
    localStorage.setItem(key, String(Date.now() + DISMISS_DURATION_MS));
  } catch {
    // localStorage unavailable — no-op
  }
}

/**
 * Format a time remaining in milliseconds into "Xd Xh Xm" or similar.
 */
function formatCountdown(ms) {
  if (ms <= 0) return '0s';
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  return `${minutes}m ${seconds}s`;
}

/**
 * DealBanner renders the sticky promotion banner for a single active deal.
 * All hooks must be called unconditionally (before any early returns).
 */
const DealBanner = memo(({ deal, userId }) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);
  const navigate = useNavigate();
  const location = useLocation();

  // All hooks first — no early returns before this point
  const [dismissed, setDismissed] = useState(() => isDismissed(deal.id, userId));
  const [countdown, setCountdown] = useState(null);

  // Calculate time remaining until deal ends
  const endMs = new Date(deal.endAt).getTime();
  const showCountdown = deal.bannerConfig?.countdownEnabled !== false && (endMs - Date.now() <= SEVEN_DAYS_MS);

  // Countdown timer — updates every second
  useEffect(() => {
    if (!showCountdown) return;

    function updateCountdown() {
      const remaining = endMs - Date.now();
      setCountdown(remaining > 0 ? formatCountdown(remaining) : null);
    }

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [endMs, showCountdown]);

  const handleDismiss = useCallback(() => {
    writeDismiss(deal.id, userId);
    setDismissed(true);
  }, [deal.id, userId]);

  const handleCta = useCallback(() => {
    navigate(`/dashboard/settings?tab=billing&promo=${encodeURIComponent(deal.promoCode)}`);
  }, [navigate, deal.promoCode]);

  // ── Early returns AFTER all hooks ─────────────────────────────────────────

  // Dismissed: hide banner
  if (dismissed) return null;

  // Page visibility restriction
  const showOnPages = deal.bannerConfig?.showOnPages;
  if (showOnPages && showOnPages !== 'all') {
    const pages = Array.isArray(showOnPages) ? showOnPages : [showOnPages];
    const currentPath = location.pathname;
    const pageMatch = pages.some((p) => currentPath.includes(p));
    if (!pageMatch) return null;
  }

  // Format the discount label
  const discountLabel =
    deal.discountType === 'PERCENTAGE'
      ? `${deal.discountValue}% Off`
      : deal.discountType === 'FLAT_AMOUNT'
        ? `$${deal.discountValue} Off`
        : 'Free Month';

  const bannerText = deal.bannerConfig?.bannerText
    ? deal.bannerConfig.bannerText
    : `${deal.name} — ${discountLabel}`;

  return (
    <Box
      role="banner"
      aria-label={`Promotion: ${bannerText}`}
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        width: '100%',
        background: `linear-gradient(90deg, ${colors.primary} 0%, ${colors.primaryDark} 60%, ${alpha(colors.primaryDark, 0.85)} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: { xs: 1.5, sm: 3 },
        py: { xs: 0.75, sm: 1 },
        gap: 1,
        minHeight: 48,
        boxShadow: `0 2px 12px ${alpha(colors.primary, 0.35)}`,
        flexWrap: { xs: 'wrap', sm: 'nowrap' },
      }}
    >
      {/* Left: Promo icon + deal text */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          flex: 1,
          minWidth: 0,
        }}
      >
        <PromoIcon
          size={18}
          color="#FFFFFF"
          aria-hidden="true"
          style={{ flexShrink: 0 }}
        />
        <Typography
          variant="body2"
          sx={{
            color: '#FFFFFF',
            fontWeight: 600,
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: { xs: 'nowrap', sm: 'normal' },
          }}
        >
          {bannerText}
          {countdown && (
            <Box
              component="span"
              sx={{
                ml: 1.5,
                color: alpha('#FFFFFF', 0.85),
                fontWeight: 500,
                fontSize: { xs: '0.7rem', sm: '0.8rem' },
                display: { xs: 'block', sm: 'inline' },
                mt: { xs: 0.25, sm: 0 },
              }}
              aria-label={`Ends in ${countdown}`}
            >
              Ends in {countdown}
            </Box>
          )}
        </Typography>
      </Box>

      {/* Right: CTA + Dismiss */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 0.5, sm: 1 },
          flexShrink: 0,
        }}
      >
        <DashboardGradientButton
          size="small"
          onClick={handleCta}
          aria-label={`Apply promo code ${deal.promoCode}`}
          sx={{
            py: 0.5,
            px: { xs: 1.5, sm: 2 },
            fontSize: { xs: '0.7rem', sm: '0.8rem' },
            minWidth: 0,
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.4)',
            color: '#FFFFFF',
            backdropFilter: 'blur(4px)',
            '&:hover': {
              background: 'rgba(255,255,255,0.25)',
              transform: 'translateY(-1px)',
            },
          }}
        >
          Get Deal
        </DashboardGradientButton>

        <IconButton
          size="small"
          onClick={handleDismiss}
          aria-label="Dismiss promotion banner"
          sx={{
            color: alpha('#FFFFFF', 0.8),
            p: 1,
            minWidth: 44,
            minHeight: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            '&:hover': {
              color: '#FFFFFF',
              background: alpha('#FFFFFF', 0.15),
            },
          }}
        >
          <CloseIcon size={16} />
        </IconButton>
      </Box>
    </Box>
  );
});

DealBanner.displayName = 'DealBanner';

export default DealBanner;
