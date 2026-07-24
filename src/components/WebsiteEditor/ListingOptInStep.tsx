import React, { useState, useCallback, useEffect, useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import { Info } from "lucide-react";
import { setDirectoryListingIntent } from "../../utils/directoryListingIntent";
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

  const handleComplete = useCallback(() => {
    // Intent only — the listing is NOT set up or validated here. At this point
    // the site has only template placeholder content, so running eligibility now
    // would judge the template, not the user's real business. We just record the
    // intent and nudge the user to finish setup from the dashboard Listing tab,
    // where `extract` pulls the real content and the AI eligibility check runs.
    if (optedIn) {
      setDirectoryListingIntent(websiteId);
    }
    onComplete();
  }, [optedIn, websiteId, onComplete]);

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

  return (
    <Box sx={{ py: 1 }}>
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
              We'll remember this. Once your site content is ready, finish
              setting up your listing from your dashboard under
              <br />
              <Box
                component="span"
                sx={{ color: "text.primary", fontWeight: 600 }}
              >
                Websites → Manage → Listing
              </Box>
              {" "}— we'll check that it's a business before it goes live.
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
          <DashboardActionButton onClick={onSkip}>
            Skip
          </DashboardActionButton>
          <DashboardGradientButton
            onClick={handleComplete}
            data-testid="complete-btn"
          >
            Continue
          </DashboardGradientButton>
        </Box>
      </Box>
    </Box>
  );
});

export default ListingOptInStep;
