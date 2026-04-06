/**
 * ListingOptInStep (Step 10.7.7)
 *
 * Wizard opt-in step shown after website creation for paid plan users.
 * Free plan users see a locked upgrade CTA.
 * On completion with opt-in checked, calls POST /api/websites/:id/listing/extract.
 */

import React, { useState, useCallback, useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Collapse from "@mui/material/Collapse";
import Alert from "@mui/material/Alert";
import Skeleton from "@mui/material/Skeleton";
import CircularProgress from "@mui/material/CircularProgress";
import MenuItem from "@mui/material/MenuItem";
import { Lock, ChevronDown, ChevronUp } from "lucide-react";
import axios from "axios";
import DashboardInput from "../Dashboard/shared/DashboardInput";
import DashboardSelect from "../Dashboard/shared/DashboardSelect";
import DashboardCard from "../Dashboard/shared/DashboardCard";
import DashboardGradientButton from "../Dashboard/shared/DashboardGradientButton";
import DashboardActionButton from "../Dashboard/shared/DashboardActionButton";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const PAID_PLANS = ["website_core", "website_growth", "website_agency"];

const BUSINESS_CATEGORIES = [
  "Restaurant",
  "Retail",
  "Professional Services",
  "Health & Wellness",
  "Technology",
  "Education",
  "Real Estate",
  "Automotive",
  "Home Services",
  "Entertainment",
  "Other",
];

export interface ListingOptInStepProps {
  websiteId: number;
  websiteName: string;
  planCode: string;
  onComplete: () => void;
  onSkip: () => void;
}

const ListingOptInStep = React.memo(function ListingOptInStep({
  websiteId,
  websiteName,
  planCode,
  onComplete,
  onSkip,
}: ListingOptInStepProps) {
  const isPaidPlan = PAID_PLANS.includes(planCode);

  const [optedIn, setOptedIn] = useState(isPaidPlan);
  const [expanded, setExpanded] = useState(false);
  const [shortDescription, setShortDescription] = useState("");
  const [businessCategory, setBusinessCategory] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState("");

  const handleOptInChange = useCallback(
    (_e: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
      setOptedIn(checked);
    },
    [],
  );

  const handleToggleExpand = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  const handleShortDescChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setShortDescription(e.target.value);
    },
    [],
  );

  const handleCategoryChange = useCallback((e: any) => {
    setBusinessCategory(e.target.value as string);
  }, []);

  const handleComplete = useCallback(async () => {
    if (!optedIn) {
      onComplete();
      return;
    }

    setExtracting(true);
    setError("");

    try {
      await axios.post(`${API_URL}/websites/${websiteId}/listing/extract`);
    } catch {
      // Non-blocking: extraction failure should not prevent wizard completion
      setError(
        "Directory listing extraction encountered an issue. You can configure it later in settings.",
      );
    } finally {
      setExtracting(false);
      onComplete();
    }
  }, [optedIn, websiteId, onComplete]);

  const previewData = useMemo(
    () => ({
      businessName: websiteName,
      category: businessCategory || "Business",
      shortDescription:
        shortDescription || "Your business description will appear here...",
    }),
    [websiteName, businessCategory, shortDescription],
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

  // Free plan users see locked upgrade CTA
  if (!isPaidPlan) {
    return (
      <DashboardCard
        icon={Lock}
        title="Directory Listing"
        subtitle="Available on Core plan and above"
      >
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
          List your business in the Techietribe Directory to reach more
          customers. Upgrade to a paid plan to unlock directory listings.
        </Typography>
        <DashboardGradientButton href="/pricing" data-testid="upgrade-cta">
          Upgrade to Unlock
        </DashboardGradientButton>
      </DashboardCard>
    );
  }

  return (
    <Box sx={{ py: 1 }}>
      {error && (
        <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

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
        sx={{ mb: 2 }}
      />

      {optedIn && (
        <>
          {/* Preview card */}
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              mb: 2,
              bgcolor: "background.paper",
            }}
            data-testid="listing-preview"
          >
            <Typography
              variant="subtitle1"
              sx={{ color: "text.primary", fontWeight: 600 }}
            >
              {previewData.businessName}
            </Typography>
            <Typography variant="caption" sx={{ color: "primary.main" }}>
              {previewData.category}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", mt: 0.5 }}
            >
              {previewData.shortDescription}
            </Typography>
          </Box>

          {/* Expandable customize section */}
          <Box
            onClick={handleToggleExpand}
            sx={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              mb: 1,
              userSelect: "none",
            }}
            role="button"
            tabIndex={0}
            aria-expanded={expanded}
            aria-label="Customize Listing Details"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleToggleExpand();
              }
            }}
          >
            <Typography
              variant="body2"
              sx={{ color: "primary.main", fontWeight: 500, mr: 0.5 }}
            >
              Customize Listing Details
            </Typography>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </Box>

          <Collapse in={expanded}>
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}
            >
              <DashboardInput
                label="Short Description"
                placeholder="A brief description of your business"
                value={shortDescription}
                onChange={handleShortDescChange}
                multiline
                rows={2}
                inputProps={{ maxLength: 500 }}
              />
              <DashboardSelect
                label="Business Category"
                value={businessCategory}
                onChange={handleCategoryChange}
                name="businessCategory"
              >
                <MenuItem value="">
                  <em>Select a category</em>
                </MenuItem>
                {BUSINESS_CATEGORIES.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </DashboardSelect>
            </Box>
          </Collapse>
        </>
      )}

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 3 }}>
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
  );
});

export default ListingOptInStep;
