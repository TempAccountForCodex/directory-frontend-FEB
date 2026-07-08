import React, { useState, useCallback, useEffect, useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Collapse from "@mui/material/Collapse";
import Alert from "@mui/material/Alert";
import Skeleton from "@mui/material/Skeleton";
import CircularProgress from "@mui/material/CircularProgress";
import MenuItem from "@mui/material/MenuItem";
import { ChevronDown, ChevronUp } from "lucide-react";
import { apiClient } from "../../api/client";
import DashboardInput from "../Dashboard/shared/DashboardInput";
import DashboardSelect from "../Dashboard/shared/DashboardSelect";
import DashboardGradientButton from "../Dashboard/shared/DashboardGradientButton";
import DashboardActionButton from "../Dashboard/shared/DashboardActionButton";
import PropertyItemCard from "../publicComponents/Listing/PropertyCardItem";

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
  const [expanded, setExpanded] = useState(false);
  const [shortDescription, setShortDescription] = useState("");
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
      try {
        await apiClient.post(`/websites/${websiteId}/listing/extract`);
      } catch {
        setError(
          "Directory listing extraction encountered an issue. Your saved details are still available in settings.",
        );
      }

      const patchPayload: Record<string, unknown> = {};
      if (shortDescription.trim()) patchPayload.shortDescription = shortDescription.trim();
      if (businessCategory) patchPayload.businessCategory = businessCategory;

      if (Object.keys(patchPayload).length > 0) {
        await apiClient.patch(`/websites/${websiteId}/listing`, patchPayload);
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
  }, [businessCategory, optedIn, shortDescription, websiteId, onComplete]);

  const previewData = useMemo(
    () => ({
      id: websiteId,
      businessName: websiteName,
      title: websiteName,
      category: businessCategory || "Business",
      businessCategory: businessCategory || "Business",
      shortDescription:
        shortDescription || "Your business description will appear here...",
      desc: shortDescription || "Your business description will appear here...",
      averageRating: 0,
      reviewCount: 0,
    }),
    [websiteId, websiteName, businessCategory, shortDescription],
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
          <Box data-testid="listing-preview" sx={{ mb: 2, maxWidth: 400 }}>
            <PropertyItemCard
              item={previewData}
              handleDeleteItem={() => undefined}
              previewMode
              totalPages={1}
              currentPage={1}
              setCurrentPage={() => undefined}
            />
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
                {businessCategory &&
                  !BUSINESS_CATEGORIES.includes(businessCategory) && (
                    <MenuItem value={businessCategory}>
                      {businessCategory}
                    </MenuItem>
                  )}
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
