import React, { useState, useCallback, useEffect, useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Alert from "@mui/material/Alert";
import Skeleton from "@mui/material/Skeleton";
import CircularProgress from "@mui/material/CircularProgress";
import { Info } from "lucide-react";
import { apiClient } from "../../api/client";
import DashboardGradientButton from "../Dashboard/shared/DashboardGradientButton";
import DashboardActionButton from "../Dashboard/shared/DashboardActionButton";
import PropertyItemCard from "../publicComponents/Listing/PropertyCardItem";

export interface ListingOptInStepProps {
  websiteId: number;
  websiteName: string;
  defaultBusinessCategory?: string;
  planCode?: string;
  onComplete: () => void;
  onSkip: () => void;
}

const ListingOptInStep = React.memo(function ListingOptInStep({
  websiteId,
  websiteName,
  defaultBusinessCategory,
  onComplete,
  onSkip,
}: ListingOptInStepProps) {
  const [optedIn, setOptedIn] = useState(true);
  const [businessCategory, setBusinessCategory] = useState(
    defaultBusinessCategory || "",
  );
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState("");

  const handleOptInChange = useCallback(
    (_e: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
      setOptedIn(checked);
    },
    [],
  );

  useEffect(() => {
    if (!businessCategory && defaultBusinessCategory) {
      setBusinessCategory(defaultBusinessCategory);
    }
  }, [businessCategory, defaultBusinessCategory]);

  const handleComplete = useCallback(async () => {
    if (!optedIn) {
      onComplete();
      return;
    }

    setExtracting(true);
    setError("");

    try {
      try {
        await apiClient.post(`/websites/${websiteId}/listing/extract`);
      } catch {
        setError(
          "Directory listing extraction encountered an issue. Your saved details are still available in settings.",
        );
      }

      if (businessCategory) {
        await apiClient.patch(`/websites/${websiteId}/listing`, {
          businessCategory,
        });
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Directory listing setup encountered an issue. You can configure it later in settings.",
      );
    } finally {
      setExtracting(false);
      onComplete();
    }
  }, [businessCategory, optedIn, websiteId, onComplete]);

  const previewData = useMemo(
    () => ({
      id: websiteId,
      businessName: websiteName,
      title: websiteName,
      category: businessCategory || "Business",
      businessCategory: businessCategory || "Business",
      shortDescription: "Your business description will appear here...",
      desc: "Your business description will appear here...",
      averageRating: 0,
      reviewCount: 0,
    }),
    [websiteId, websiteName, businessCategory],
  );

  if (extracting) {
    return (
      <Box sx={{ py: 4 }}>
        <Skeleton
          variant="rectangular"
          height={40}
          sx={{ mb: 2, borderRadius: 1 }}
        />
        <Skeleton
          variant="rectangular"
          height={80}
          sx={{ mb: 2, borderRadius: 1 }}
        />
        <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2 }}>
          <CircularProgress size={16} />
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Extracting listing data from your website...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 1 }}>
      {error && (
        <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {optedIn && (
        <>
          {/* Preview card */}
          <Box data-testid="listing-preview" sx={{ mb: 0, maxWidth: 280 }}>
            <PropertyItemCard
              item={previewData}
              handleDeleteItem={() => undefined}
              previewMode
              totalPages={1}
              currentPage={1}
              setCurrentPage={() => undefined}
            />
          </Box>

          {/* Reassurance that listing details stay editable later */}
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              gap: 1,
              mb: 1,
            }}
          >
            <Box
              sx={{
                color: "primary.main",
                mt: "2px",
                flexShrink: 0,
                display: "flex",
              }}
            >
              <Info size={16} />
            </Box>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              You can customize your listing details anytime <br /> edit the
              description, category, photos and more from your dashboard under
              <br />
              <Box
                component="span"
                sx={{ color: "text.primary", fontWeight: 600 }}
              >
                Websites → Manage → Listing
              </Box>
              .
            </Typography>
          </Box>
        </>
      )}

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          mt: 0,
          flexWrap: "wrap",
        }}
      >
        <FormControlLabel
          control={
            <Checkbox
              checked={optedIn}
              onChange={handleOptInChange}
              data-testid="opt-in-checkbox"
              sx={{
                color: "primary.main",
                "&.Mui-checked": { color: "primary.main" },
              }}
            />
          }
          label={
            <Typography
              variant="body1"
              sx={{ color: "text.primary", fontWeight: 500 }}
            >
              List my business in the Techietribe Directory
            </Typography>
          }
          sx={{ m: 0 }}
        />
        <Box sx={{ display: "flex", gap: 1, scale: 0.9 }}>
          <DashboardActionButton onClick={onSkip} disabled={extracting}>
            Skip
          </DashboardActionButton>
          <DashboardGradientButton
            onClick={handleComplete}
            disabled={extracting}
            data-testid="complete-btn"
          >
            {extracting ? (
              <CircularProgress size={16} sx={{ color: "inherit" }} />
            ) : (
              "Continue"
            )}
          </DashboardGradientButton>
        </Box>
      </Box>
    </Box>
  );
});

export default ListingOptInStep;
