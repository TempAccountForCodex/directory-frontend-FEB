/**
 * ListingSettingsCard (Step 10.7.8)
 *
 * DashboardCard with Globe icon for website settings.
 * Toggle 'Include in Directory' with completeness display + AI enhance.
 * Free plan users see disabled toggle with upgrade CTA.
 */

import React, { useState, useCallback, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Switch from "@mui/material/Switch";
import LinearProgress from "@mui/material/LinearProgress";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import Alert from "@mui/material/Alert";
import Skeleton from "@mui/material/Skeleton";
import CircularProgress from "@mui/material/CircularProgress";
import { Globe, Sparkles } from "lucide-react";
import axios from "axios";
import DashboardCard from "./shared/DashboardCard";
import DashboardGradientButton from "./shared/DashboardGradientButton";
import { ConfirmationDialog } from "./shared";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const PAID_PLANS = ["website_core", "website_growth", "website_agency"];

interface CompletenessData {
  score: number;
  missing: string[];
  suggestions?: string[];
}

export interface ListingSettingsCardProps {
  websiteId: number;
  directoryOptedIn: boolean;
  planCode: string;
  aiGenerationsUsed?: number;
  aiGenerationsLimit?: number;
  onUpdate?: () => void;
}

const ListingSettingsCard = React.memo(function ListingSettingsCard({
  websiteId,
  directoryOptedIn: initialOptedIn,
  planCode,
  aiGenerationsUsed = 0,
  aiGenerationsLimit = 10,
  onUpdate,
}: ListingSettingsCardProps) {
  const isPaidPlan = PAID_PLANS.includes(planCode);

  const [optedIn, setOptedIn] = useState(initialOptedIn);
  const [completeness, setCompleteness] = useState<CompletenessData | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState("");
  const [showConfirmOff, setShowConfirmOff] = useState(false);

  // Fetch completeness on mount if already opted in
  useEffect(() => {
    if (optedIn && isPaidPlan) {
      fetchCompleteness();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchCompleteness = useCallback(async () => {
    try {
      const res = await axios.get(
        `${API_URL}/websites/${websiteId}/listing/completeness`,
      );
      if (res.data?.success) {
        setCompleteness(res.data.data);
      }
    } catch {
      // Silently fail — completeness is supplemental
    }
  }, [websiteId]);

  const handleToggleOn = useCallback(async () => {
    setToggling(true);
    setError("");
    try {
      // Patch directoryOptedIn
      await axios.patch(`${API_URL}/websites/${websiteId}/listing`, {
        directoryOptedIn: true,
      });

      // Extract listing data
      try {
        await axios.post(`${API_URL}/websites/${websiteId}/listing/extract`);
      } catch {
        // Non-blocking
      }

      // Fetch completeness
      await fetchCompleteness();

      setOptedIn(true);
      onUpdate?.();
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to enable directory listing",
      );
    } finally {
      setToggling(false);
    }
  }, [websiteId, fetchCompleteness, onUpdate]);

  const handleToggleOff = useCallback(async () => {
    setToggling(true);
    setError("");
    try {
      await axios.patch(`${API_URL}/websites/${websiteId}/listing`, {
        directoryOptedIn: false,
      });
      setOptedIn(false);
      setCompleteness(null);
      setShowConfirmOff(false);
      onUpdate?.();
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to disable directory listing",
      );
    } finally {
      setToggling(false);
    }
  }, [websiteId, onUpdate]);

  const handleToggleChange = useCallback(
    (_e: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
      if (checked) {
        handleToggleOn();
      } else {
        setShowConfirmOff(true);
      }
    },
    [handleToggleOn],
  );

  const handleConfirmOff = useCallback(() => {
    handleToggleOff();
  }, [handleToggleOff]);

  const handleCancelOff = useCallback(() => {
    setShowConfirmOff(false);
  }, []);

  const handleEnhance = useCallback(async () => {
    setEnhancing(true);
    setError("");
    try {
      await axios.post(`${API_URL}/websites/${websiteId}/listing/enhance`);
      await fetchCompleteness();
      onUpdate?.();
    } catch (err: any) {
      setError(err.response?.data?.message || "AI enhancement failed");
    } finally {
      setEnhancing(false);
    }
  }, [websiteId, fetchCompleteness, onUpdate]);

  const aiRemaining = aiGenerationsLimit - aiGenerationsUsed;

  // Loading state
  if (loading) {
    return (
      <DashboardCard icon={Globe} title="Directory Listing">
        <Skeleton
          variant="rectangular"
          height={40}
          sx={{ mb: 1, borderRadius: 1 }}
        />
        <Skeleton variant="rectangular" height={20} sx={{ borderRadius: 1 }} />
      </DashboardCard>
    );
  }

  // Free plan — locked
  if (!isPaidPlan) {
    return (
      <DashboardCard
        icon={Globe}
        title="Directory Listing"
        subtitle="Available on Core plan and above"
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Switch disabled checked={false} data-testid="listing-toggle" />
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Include in Directory
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
          Upgrade to a paid plan to list your business in the Techietribe
          Directory.
        </Typography>
        <DashboardGradientButton href="/pricing" data-testid="upgrade-cta">
          Upgrade to Unlock
        </DashboardGradientButton>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard icon={Globe} title="Directory Listing">
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Toggle */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        <Switch
          checked={optedIn}
          onChange={handleToggleChange}
          disabled={toggling}
          data-testid="listing-toggle"
          inputProps={{ "aria-label": "Include in Directory" }}
        />
        <Typography
          variant="body2"
          sx={{ color: "text.primary", fontWeight: 500 }}
        >
          Include in Directory
        </Typography>
        {toggling && <CircularProgress size={16} />}
      </Box>

      {/* Completeness */}
      {optedIn && completeness && (
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Completeness
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "text.primary", fontWeight: 600 }}
              data-testid="completeness-score"
            >
              {completeness.score}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={completeness.score}
            sx={{
              height: 8,
              borderRadius: 4,
              mb: 1,
              bgcolor: "action.hover",
              "& .MuiLinearProgress-bar": {
                borderRadius: 4,
                bgcolor:
                  completeness.score >= 80
                    ? "success.main"
                    : completeness.score >= 60
                      ? "warning.main"
                      : "error.main",
              },
            }}
            data-testid="completeness-bar"
          />
          {completeness.missing.length > 0 && (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {completeness.missing.map((field) => (
                <Chip
                  key={field}
                  label={field}
                  size="small"
                  sx={{
                    bgcolor: "warning.light",
                    color: "warning.dark",
                    fontSize: "0.75rem",
                  }}
                  data-testid="missing-field-chip"
                />
              ))}
            </Box>
          )}
        </Box>
      )}

      {/* AI Enhance */}
      {optedIn && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Tooltip
            title={
              !isPaidPlan
                ? "AI enhancement is available on paid plans"
                : aiRemaining <= 0
                  ? "AI generation limit reached"
                  : ""
            }
          >
            <span>
              <DashboardGradientButton
                onClick={handleEnhance}
                disabled={enhancing || !isPaidPlan || aiRemaining <= 0}
                startIcon={
                  enhancing ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <Sparkles size={16} />
                  )
                }
                data-testid="enhance-btn"
                sx={{ minWidth: { xs: "100%", sm: "auto" } }}
              >
                Enhance with AI
              </DashboardGradientButton>
            </span>
          </Tooltip>
          {isPaidPlan && (
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {aiRemaining} of {aiGenerationsLimit} AI generations remaining
            </Typography>
          )}
        </Box>
      )}

      {/* Confirm toggle OFF dialog */}
      <ConfirmationDialog
        open={showConfirmOff}
        onConfirm={handleConfirmOff}
        onCancel={handleCancelOff}
        title="Remove from Directory?"
        message="Your business listing will no longer appear in the Techietribe Directory. You can re-enable it at any time."
        confirmLabel="Remove"
        cancelLabel="Keep Listed"
        variant="warning"
        loading={toggling}
      />
    </DashboardCard>
  );
});

export default ListingSettingsCard;
