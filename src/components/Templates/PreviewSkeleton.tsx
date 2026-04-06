/**
 * Step 4.6.5 — Preview Skeleton & Error States
 *
 * Loading skeleton matching preview card layout,
 * error state with retry, and timeout warning.
 */
import React from "react";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import { AlertTriangle, RefreshCw, WifiOff, ImageOff } from "lucide-react";
import { getDashboardColors } from "../../styles/dashboardTheme";
import { useTheme as useCustomTheme } from "../../context/ThemeContext";

// ===================================================================
// PreviewCardSkeleton — Matches TemplateCard layout
// ===================================================================

export const PreviewCardSkeleton = React.memo(function PreviewCardSkeleton() {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);

  return (
    <Box
      sx={{
        borderRadius: "16px",
        border: `1px solid ${colors.border}`,
        backgroundColor: colors.panelBg,
        overflow: "hidden",
      }}
    >
      <Skeleton
        variant="rectangular"
        height={180}
        sx={{ borderRadius: "16px 16px 0 0" }}
      />
      <Box sx={{ p: 2 }}>
        <Skeleton
          variant="rounded"
          width={70}
          height={22}
          sx={{ mb: 1, borderRadius: "11px" }}
        />
        <Skeleton variant="text" width="80%" height={24} sx={{ mb: 0.5 }} />
        <Skeleton variant="text" width="60%" height={18} />
      </Box>
      <Box
        sx={{ px: 2, pb: 2, display: "flex", justifyContent: "space-between" }}
      >
        <Skeleton
          variant="rounded"
          width={80}
          height={32}
          sx={{ borderRadius: "8px" }}
        />
        <Skeleton
          variant="rounded"
          width={100}
          height={32}
          sx={{ borderRadius: "8px" }}
        />
      </Box>
    </Box>
  );
});

// ===================================================================
// PreviewImageError — Error state for failed image loads
// ===================================================================

interface PreviewImageErrorProps {
  onRetry?: () => void;
  message?: string;
}

export const PreviewImageError = React.memo(function PreviewImageError({
  onRetry,
  message = "Failed to load preview",
}: PreviewImageErrorProps) {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1.5,
        p: 3,
        minHeight: 200,
        backgroundColor: colors.bgCard || colors.panelBg,
        borderRadius: 2,
      }}
      role="alert"
      aria-label={message}
    >
      <ImageOff size={40} color={colors.textSecondary} />
      <Typography
        variant="body2"
        sx={{ color: colors.textSecondary, textAlign: "center" }}
      >
        {message}
      </Typography>
      {onRetry && (
        <Button
          size="small"
          variant="outlined"
          onClick={onRetry}
          startIcon={<RefreshCw size={14} />}
          sx={{
            textTransform: "none",
            color: colors.textSecondary,
            borderColor: colors.border,
            minHeight: 44,
            "&:hover": { borderColor: "#378C92", color: "#378C92" },
          }}
        >
          Retry
        </Button>
      )}
    </Box>
  );
});

// ===================================================================
// PreviewTimeoutWarning — Shown after 5s of loading
// ===================================================================

interface PreviewTimeoutWarningProps {
  visible: boolean;
}

export const PreviewTimeoutWarning = React.memo(function PreviewTimeoutWarning({
  visible,
}: PreviewTimeoutWarningProps) {
  if (!visible) return null;

  return (
    <Alert severity="warning" icon={<AlertTriangle size={18} />} sx={{ mt: 1 }}>
      Preview is taking longer than expected. This may be due to a slow
      connection.
    </Alert>
  );
});

// ===================================================================
// PreviewNetworkError — Offline/network error
// ===================================================================

interface PreviewNetworkErrorProps {
  onRetry?: () => void;
}

export const PreviewNetworkError = React.memo(function PreviewNetworkError({
  onRetry,
}: PreviewNetworkErrorProps) {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1.5,
        p: 4,
        minHeight: 300,
      }}
      role="alert"
      aria-label="Network error"
    >
      <WifiOff size={48} color={colors.textSecondary} />
      <Typography variant="h6" sx={{ color: colors.text }}>
        Unable to connect
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: colors.textSecondary, textAlign: "center", maxWidth: 300 }}
      >
        Please check your internet connection and try again.
      </Typography>
      {onRetry && (
        <Button
          variant="outlined"
          onClick={onRetry}
          startIcon={<RefreshCw size={16} />}
          sx={{
            mt: 1,
            textTransform: "none",
            minHeight: 44,
            color: "#378C92",
            borderColor: "#378C92",
            "&:hover": { backgroundColor: "rgba(55,140,146,0.08)" },
          }}
        >
          Try Again
        </Button>
      )}
    </Box>
  );
});

// ===================================================================
// usePreviewTimeout — Hook for timeout warning
// ===================================================================

export function usePreviewTimeout(
  loading: boolean,
  timeoutMs: number = 5000,
): boolean {
  const [timedOut, setTimedOut] = React.useState(false);

  React.useEffect(() => {
    if (!loading) {
      setTimedOut(false);
      return;
    }

    const timer = setTimeout(() => setTimedOut(true), timeoutMs);
    return () => clearTimeout(timer);
  }, [loading, timeoutMs]);

  return timedOut;
}

export default PreviewCardSkeleton;
