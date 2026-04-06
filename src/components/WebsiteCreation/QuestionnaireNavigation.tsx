/**
 * QuestionnaireNavigation — Bottom navigation bar for AI Questionnaire
 *
 * Plan-gated "Generate with AI" button, "Skip AI" option, and back navigation.
 * Step 3.17.
 */

import React, { useEffect, useCallback, useMemo, useState } from "react";
import {
  Box,
  Tooltip,
  CircularProgress,
  Snackbar,
  Alert,
  alpha,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
// @ts-ignore
import {
  DashboardGradientButton,
  DashboardCancelButton,
  DashboardActionButton,
} from "../Dashboard/shared";
// @ts-ignore
import { getDashboardColors } from "../../styles/dashboardTheme";
import { useTheme as useCustomTheme } from "../../context/ThemeContext";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

interface UsageData {
  plan: string;
  used: number;
  limit: number;
  remaining: number;
}

interface QuestionnaireNavigationProps {
  isComplete: boolean;
  onBack: () => void;
  onGenerate: () => void;
  onSkip: () => void;
  submitting: boolean;
  errorMessage?: string;
  onClearError?: () => void;
}

export default function QuestionnaireNavigation({
  isComplete,
  onBack,
  onGenerate,
  onSkip,
  submitting,
  errorMessage: externalError,
  onClearError,
}: QuestionnaireNavigationProps) {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));

  const [usage, setUsage] = useState<UsageData | null>(null);
  const [usageLoading, setUsageLoading] = useState(true);
  const displayError = externalError || "";

  // Fetch usage data on mount
  useEffect(() => {
    let cancelled = false;
    const fetchUsage = async () => {
      try {
        const response = await axios.get(`${API_URL}/ai/usage`);
        if (!cancelled) {
          setUsage(response.data);
        }
      } catch {
        // Fallback: assume free plan if usage endpoint fails
        if (!cancelled) {
          setUsage({ plan: "website_free", used: 0, limit: 0, remaining: 0 });
        }
      } finally {
        if (!cancelled) setUsageLoading(false);
      }
    };
    fetchUsage();
    return () => {
      cancelled = true;
    };
  }, []);

  const isFree = usage?.plan === "website_free";
  const hasRemaining = usage
    ? usage.remaining > 0 || usage.plan === "website_agency"
    : false;

  const generateButtonText = useMemo(() => {
    if (submitting) return "Preparing...";
    if (usageLoading) return "Loading...";
    if (!usage) return "Generate with AI";

    switch (usage.plan) {
      case "website_free":
        return "Upgrade to Generate with AI";
      case "website_core":
        return `Generate with AI (${usage.remaining} of 3 remaining)`;
      case "website_growth":
        return `Generate with AI (${usage.remaining} of 10 remaining)`;
      case "website_agency":
        return "Generate with AI";
      default:
        return "Generate with AI";
    }
  }, [usage, usageLoading, submitting]);

  const generateDisabled =
    !isComplete ||
    usageLoading ||
    submitting ||
    (usage && !hasRemaining && !isFree);
  const tooltipText = !isComplete
    ? "Fill in required fields"
    : isFree
      ? "Upgrade your plan to use AI generation"
      : !hasRemaining
        ? "No AI generations remaining this month"
        : "";

  const handleGenerate = useCallback(() => {
    if (isFree) {
      window.location.href = "/dashboard/settings/billing";
      return;
    }
    onGenerate();
  }, [isFree, onGenerate]);

  return (
    <>
      <Box
        role="navigation"
        aria-label="Questionnaire actions"
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: "space-between",
          gap: 2,
          p: { xs: 2, md: 3 },
          mt: 3,
          bgcolor: alpha(colors.panelBg, 0.8),
          border: `1px solid ${alpha(colors.panelBorder || colors.border, 0.5)}`,
          borderRadius: 2,
          ...(isMobile && {
            position: "sticky",
            bottom: 0,
            zIndex: 10,
            borderRadius: 0,
            borderLeft: "none",
            borderRight: "none",
            borderBottom: "none",
            mt: 0,
            backdropFilter: "blur(8px)",
          }),
        }}
      >
        <DashboardCancelButton
          onClick={onBack}
          disabled={submitting}
          sx={{ minHeight: 44 }}
        >
          Back
        </DashboardCancelButton>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            flex: 1,
            justifyContent: "flex-end",
          }}
        >
          <DashboardActionButton
            variant="outlined"
            onClick={onSkip}
            disabled={submitting}
            sx={{ minHeight: 44 }}
          >
            Skip AI, Use Defaults
          </DashboardActionButton>

          <Tooltip
            title={tooltipText}
            disableHoverListener={!tooltipText}
            disableFocusListener={!tooltipText}
          >
            <span>
              <DashboardGradientButton
                onClick={handleGenerate}
                disabled={!!generateDisabled}
                startIcon={
                  submitting ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <AutoAwesomeIcon />
                  )
                }
                sx={{ minHeight: 44, minWidth: 200 }}
              >
                {generateButtonText}
              </DashboardGradientButton>
            </span>
          </Tooltip>
        </Box>
      </Box>

      {/* Error toast */}
      <Snackbar
        open={!!displayError}
        autoHideDuration={5000}
        onClose={onClearError}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={onClearError} severity="error" variant="filled">
          {displayError}
        </Alert>
      </Snackbar>
    </>
  );
}
