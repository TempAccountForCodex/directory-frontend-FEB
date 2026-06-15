/**
 * ListingEditTab (Step 10.7.9)
 *
 * Full listing management UI tab for the website dashboard.
 * Contains: status header, completeness bar, edit form with live preview,
 * action buttons (save, publish, unpublish, archive, AI enhance).
 */

import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import Alert from "@mui/material/Alert";
import Skeleton from "@mui/material/Skeleton";
import CircularProgress from "@mui/material/CircularProgress";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import TextField from "@mui/material/TextField";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import { Globe, Image as ImageIcon, Sparkles, Trash2, Upload, X } from "lucide-react";
import { apiClient } from "../../api/client";
import { API_URL } from "@/config/api";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../api/queryKeys";
import PropertyItemCard from "../publicComponents/Listing/PropertyCardItem";
import DashboardInput from "./shared/DashboardInput";
import DashboardSelect from "./shared/DashboardSelect";
import DashboardActionButton from "./shared/DashboardActionButton";
import DashboardGradientButton from "./shared/DashboardGradientButton";
import DashboardConfirmButton from "./shared/DashboardConfirmButton";
import DashboardCard from "./shared/DashboardCard";
import { EmptyState, ConfirmationDialog } from "./shared";

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

const PRICE_LEVELS = [
  { value: "$", label: "$ - Budget" },
  { value: "$$", label: "$$ - Moderate" },
  { value: "$$$", label: "$$$ - Premium" },
  { value: "$$$$", label: "$$$$ - Luxury" },
];

type ListingStatus =
  | "NOT_LISTED"
  | "DRAFT"
  | "NEEDS_COMPLETION"
  | "PUBLISHED"
  | "ARCHIVED";

const STATUS_CONFIG: Record<
  ListingStatus,
  { label: string; color: string; bgColor: string }
> = {
  NOT_LISTED: {
    label: "Not Listed",
    color: "text.secondary",
    bgColor: "action.hover",
  },
  DRAFT: { label: "Draft", color: "warning.dark", bgColor: "warning.light" },
  NEEDS_COMPLETION: {
    label: "Needs completion",
    color: "error.dark",
    bgColor: "error.light",
  },
  PUBLISHED: {
    label: "Published",
    color: "success.dark",
    bgColor: "success.light",
  },
  ARCHIVED: { label: "Archived", color: "warning.dark", bgColor: "#fff3e0" },
};

interface FormData {
  businessName: string;
  shortDescription: string;
  businessCategory: string;
  priceLevel: string;
  phone: string;
  email: string;
  fullAddress: string;
  city: string;
  region: string;
  country: string;
  tags: string[];
}

interface CompletenessData {
  score: number;
  missing: string[];
  suggestions?: Record<string, string> | string[];
}

export interface ListingEditTabProps {
  websiteId: number;
  websiteData?: {
    name?: string;
    businessName?: string;
    shortDescription?: string;
    businessCategory?: string;
    priceLevel?: string;
    phone?: string;
    contactEmail?: string;
    fullAddress?: string;
    city?: string | null;
    region?: string | null;
    country?: string | null;
    tags?: string[];
    businessLogo?: string | null;
    logoUrl?: string | null;
    logo?: string | null;
    image?: string | null;
    directoryOptedIn?: boolean;
    isPublic?: boolean;
    isDirectoryArchived?: boolean;
  } | null;
  planCode: string;
  aiGenerationsUsed?: number;
  aiGenerationsLimit?: number;
  onUpdate?: (updatedWebsite?: any) => void;
}

function deriveStatus(
  data: ListingEditTabProps["websiteData"],
  completeness?: CompletenessData | null,
): ListingStatus {
  if (!data?.directoryOptedIn) return "NOT_LISTED";
  if (data.isDirectoryArchived) return "ARCHIVED";
  if (
    completeness &&
    completeness.score < MIN_PUBLISH_COMPLETENESS &&
    completeness.missing.length > 0
  ) {
    return "NEEDS_COMPLETION";
  }
  if (data.isPublic) return "PUBLISHED";
  return "DRAFT";
}

const MAX_TAGS = 10;
const MAX_DESC = 500;
const MIN_PUBLISH_COMPLETENESS = 60;

const formatMissingFieldLabel = (field: string) =>
  field
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/^./, (char) => char.toUpperCase());

const ListingEditTab = React.memo(function ListingEditTab({
  websiteId,
  websiteData,
  planCode,
  aiGenerationsUsed = 0,
  aiGenerationsLimit = 10,
  onUpdate,
}: ListingEditTabProps) {
  const isPaidPlan = PAID_PLANS.includes(planCode);
  const queryClient = useQueryClient();

  const [form, setForm] = useState<FormData>({
    businessName: "",
    shortDescription: "",
    businessCategory: "",
    priceLevel: "",
    phone: "",
    email: "",
    fullAddress: "",
    city: "",
    region: "",
    country: "",
    tags: [],
  });
  const [tagInput, setTagInput] = useState("");
  const [completeness, setCompleteness] = useState<CompletenessData | null>(
    null,
  );
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [unpublishing, setUnpublishing] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [optingIn, setOptingIn] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [listingImageUrl, setListingImageUrl] = useState("");
  const [extracted, setExtracted] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const status = useMemo(
    () => deriveStatus(websiteData, completeness),
    [websiteData, completeness],
  );
  const statusConfig = STATUS_CONFIG[status];
  const currentWebsiteImage =
    websiteData?.businessLogo ||
    websiteData?.logoUrl ||
    websiteData?.logo ||
    websiteData?.image ||
    "";

  // Load form data from websiteData
  useEffect(() => {
    if (websiteData) {
      setForm({
        businessName: websiteData.businessName || websiteData.name || "",
        shortDescription: websiteData.shortDescription || "",
        businessCategory: websiteData.businessCategory || "",
        priceLevel: websiteData.priceLevel || "",
        phone: websiteData.phone || "",
        email: websiteData.contactEmail || "",
        fullAddress: websiteData.fullAddress || "",
        city: websiteData.city || "",
        region: websiteData.region || "",
        country: websiteData.country || "",
        tags: websiteData.tags || [],
      });
      setListingImageUrl(currentWebsiteImage);
      setPageLoading(false);
    }
  }, [websiteData, currentWebsiteImage]);

  // Fetch completeness
  const fetchCompleteness = useCallback(async () => {
    try {
      const res = await apiClient.get(
        `/websites/${websiteId}/listing/completeness`,
      );
      if (res.data?.success) {
        setCompleteness(res.data.data);
      }
    } catch {
      // Silently fail
    }
  }, [websiteId]);

  const refreshListingCaches = useCallback(async (updatedWebsite?: any) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.websites.all() }),
      queryClient.invalidateQueries({ queryKey: ["content", "listings"] }),
    ]);
    onUpdate?.(updatedWebsite);
  }, [onUpdate, queryClient]);

  useEffect(() => {
    if (websiteData?.directoryOptedIn) {
      fetchCompleteness();
    } else {
      setPageLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced preview update: preview data is derived from form state, already reactive
  const previewData = useMemo(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    return {
      id: websiteId,
      businessName: form.businessName || "Your Business",
      title: form.businessName || "Your Business",
      category: form.businessCategory || "Category",
      businessCategory: form.businessCategory || "Category",
      shortDescription:
        form.shortDescription || "A brief description of your business...",
      desc: form.shortDescription || "A brief description of your business...",
      tags: form.tags,
      businessLogo: listingImageUrl,
      businessBanner: listingImageUrl,
      image: listingImageUrl,
      image1: listingImageUrl,
      city: form.city,
      region: form.region,
      country: form.country,
      averageRating: 0,
      reviewCount: 0,
    };
  }, [
    websiteId,
    form.businessName,
    form.businessCategory,
    form.shortDescription,
    form.tags,
    form.city,
    form.region,
    form.country,
    listingImageUrl,
  ]);

  const displayCompleteness = useMemo(() => {
    if (!completeness) return null;

    const hasContact = Boolean(form.phone.trim() || form.email.trim());
    const hasLocation = Boolean(
      form.city.trim() && form.country.trim(),
    );
    const missing = completeness.missing.filter((field) => {
      const normalized = field.toLowerCase();
      if (normalized === "contact" && hasContact) return false;
      if (normalized === "location" && hasLocation) return false;
      return true;
    });

    return {
      ...completeness,
      missing,
    };
  }, [completeness, form.phone, form.email, form.city, form.country]);

  // Field change handler
  const handleFieldChange = useCallback(
    (field: keyof FormData) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = e.target.value;
        setForm((prev) => ({ ...prev, [field]: value }));
        setFormErrors((prev) => ({ ...prev, [field]: "" }));
      },
    [],
  );

  const handleSelectChange = useCallback(
    (field: keyof FormData) => (e: any) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value as string }));
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    },
    [],
  );

  const resolveAssetUrl = useCallback((value?: string | null) => {
    if (!value) return "";
    if (/^https?:\/\//i.test(value) || value.startsWith("data:")) return value;
    const apiRoot = API_URL.replace(/\/api\/?$/, "");
    return `${apiRoot}${value.startsWith("/") ? value : `/${value}`}`;
  }, []);

  const handleUseWebsiteImage = useCallback(() => {
    setListingImageUrl(currentWebsiteImage);
  }, [currentWebsiteImage]);

  const handleRemoveListingImage = useCallback(() => {
    setListingImageUrl("");
  }, []);

  const handleListingImageUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file) return;

      setUploadingImage(true);
      setError("");
      setSuccess("");
      try {
        const payload = new FormData();
        payload.append("logo", file);
        const response = await apiClient.post(`/websites/${websiteId}/logo`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        const logoUrl =
          response.data?.data?.logoUrl ||
          response.data?.logoUrl ||
          response.data?.data?.url ||
          response.data?.url ||
          "";
        setListingImageUrl(logoUrl);
        setSuccess("Listing image updated");
        await refreshListingCaches();
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to upload listing image");
      } finally {
        setUploadingImage(false);
      }
    },
    [refreshListingCaches, websiteId],
  );

  // Tag handling
  const handleTagInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTagInput(e.target.value);
    },
    [],
  );

  const handleTagKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const trimmed = tagInput.trim();
        if (!trimmed) return;

        setForm((prev) => {
          if (prev.tags.length >= MAX_TAGS) return prev;
          if (prev.tags.includes(trimmed)) return prev;
          return { ...prev, tags: [...prev.tags, trimmed] };
        });
        setTagInput("");
      }
    },
    [tagInput],
  );

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }));
  }, []);

  // Validate form
  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    if (!form.businessName.trim()) {
      errors.businessName = "Business name is required";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [form.businessName]);

  // Save
  const handleOptIn = useCallback(async () => {
    if (!isPaidPlan) return;
    setOptingIn(true);
    setError("");
    try {
      const extractResponse = await apiClient.post(`/websites/${websiteId}/listing/extract`);
      const updatedWebsite =
        extractResponse.data?.data ||
        extractResponse.data?.website ||
        extractResponse.data ||
        {};
      setExtracted(true);
      setPageLoading(false);
      await fetchCompleteness();
      await refreshListingCaches({
        ...websiteData,
        ...updatedWebsite,
        directoryOptedIn: true,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to initialise directory listing");
    } finally {
      setOptingIn(false);
    }
  }, [websiteId, isPaidPlan, fetchCompleteness, refreshListingCaches, websiteData]);

  const handleSave = useCallback(async () => {
    if (!validateForm()) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const preserveString = (
        value: string,
        fallback?: string | null,
      ) => {
        const trimmed = value.trim();
        return trimmed || fallback || "";
      };
      const preserveTags = (value: string[], fallback?: string[] | null) =>
        value.length > 0 ? value : fallback || [];

      const payload = {
        businessName: preserveString(form.businessName, websiteData?.businessName || websiteData?.name),
        shortDescription: preserveString(form.shortDescription, websiteData?.shortDescription),
        businessCategory: preserveString(form.businessCategory, websiteData?.businessCategory),
        priceLevel: preserveString(form.priceLevel, websiteData?.priceLevel),
        phone: preserveString(form.phone, websiteData?.phone),
        contactEmail: preserveString(form.email, websiteData?.contactEmail),
        fullAddress: preserveString(form.fullAddress, websiteData?.fullAddress),
        city: preserveString(form.city, websiteData?.city),
        region: preserveString(form.region, websiteData?.region),
        country: preserveString(form.country, websiteData?.country),
        tags: preserveTags(form.tags, websiteData?.tags),
      };
      const response = await apiClient.patch(`/websites/${websiteId}/listing`, payload);
      const updatedWebsite =
        response.data?.data ||
        response.data?.website ||
        response.data ||
        {};
      setSuccess("Listing saved successfully");
      await fetchCompleteness();
      await refreshListingCaches({
        ...websiteData,
        ...payload,
        ...updatedWebsite,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save listing");
    } finally {
      setSaving(false);
    }
  }, [form, websiteData, websiteId, validateForm, fetchCompleteness, refreshListingCaches]);

  // Publish
  const handlePublish = useCallback(async () => {
    if (completeness && completeness.score < MIN_PUBLISH_COMPLETENESS) {
      setError(
        `Listing readiness must be at least ${MIN_PUBLISH_COMPLETENESS}% to publish. Please fill in the missing fields.`,
      );
      return;
    }
    setPublishing(true);
    setError("");
    setSuccess("");
    try {
      const res = await apiClient.post(
        `/websites/${websiteId}/listing/publish`,
      );
      if (res.data?.success) {
        setSuccess("Listing published to directory");
        await refreshListingCaches();
      }
    } catch (err: any) {
      const data = err.response?.data;
      if (data?.missing) {
        setError(`Cannot publish. Missing fields: ${data.missing.join(", ")}`);
      } else {
        setError(data?.error || data?.message || "Failed to publish listing");
      }
    } finally {
      setPublishing(false);
    }
  }, [completeness, websiteId, refreshListingCaches]);

  // Unpublish (uses archive endpoint)
  const handleUnpublish = useCallback(async () => {
    setUnpublishing(true);
    setError("");
    setSuccess("");
    try {
      await apiClient.post(`/websites/${websiteId}/listing/archive`, {
        reason: "Unpublished by owner",
      });
      setSuccess("Listing unpublished");
      await refreshListingCaches();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to unpublish listing");
    } finally {
      setUnpublishing(false);
    }
  }, [websiteId, refreshListingCaches]);

  // Republish (from ARCHIVED state)
  const handleRepublish = useCallback(async () => {
    setPublishing(true);
    setError("");
    setSuccess("");
    try {
      await apiClient.post(`/websites/${websiteId}/listing/republish`);
      setSuccess("Listing republished to directory");
      await refreshListingCaches();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to republish listing");
    } finally {
      setPublishing(false);
    }
  }, [websiteId, refreshListingCaches]);

  // Archive
  const handleArchive = useCallback(async () => {
    setArchiving(true);
    setError("");
    setSuccess("");
    try {
      await apiClient.post(`/websites/${websiteId}/listing/archive`);
      setSuccess("Listing archived");
      setShowArchiveConfirm(false);
      await refreshListingCaches();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to archive listing");
    } finally {
      setArchiving(false);
    }
  }, [websiteId, refreshListingCaches]);

  // AI Enhance
  const handleEnhance = useCallback(async () => {
    setEnhancing(true);
    setError("");
    setSuccess("");
    try {
      const res = await apiClient.post(
        `/websites/${websiteId}/listing/enhance`,
      );
      if (res.data?.success) {
        const data = res.data.data;
        setForm((prev) => ({
          ...prev,
          shortDescription: data.shortDescription || prev.shortDescription,
          tags: data.tags || prev.tags,
        }));
        setSuccess("AI enhancement applied");
        await fetchCompleteness();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "AI enhancement failed");
    } finally {
      setEnhancing(false);
    }
  }, [websiteId, fetchCompleteness]);

  const aiRemaining = aiGenerationsLimit - aiGenerationsUsed;
  const isAnyActionRunning =
    saving || publishing || unpublishing || archiving || enhancing;

  // Loading skeleton
  if (pageLoading) {
    return (
      <Box sx={{ py: 2 }}>
        <Skeleton
          variant="rectangular"
          height={48}
          sx={{ mb: 2, borderRadius: 1 }}
        />
        <Skeleton
          variant="rectangular"
          height={32}
          sx={{ mb: 2, borderRadius: 1 }}
        />
        <Skeleton
          variant="rectangular"
          height={200}
          sx={{ mb: 2, borderRadius: 1 }}
        />
        <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 1 }} />
      </Box>
    );
  }

  // Opt-in prompt for not-yet-listed websites (bypass if extract already ran this session)
  if (!websiteData?.directoryOptedIn && status === "NOT_LISTED" && !extracted) {
    return (
      <Box sx={{ py: 2 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
        <DashboardCard icon={Globe} title="Directory Listing">
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
            List your business in the Techietribe Directory so customers can discover you.
            {!isPaidPlan && " Upgrade to a paid plan to unlock this feature."}
          </Typography>
          {isPaidPlan ? (
            <DashboardGradientButton
              onClick={handleOptIn}
              disabled={optingIn}
              startIcon={optingIn ? <CircularProgress size={16} color="inherit" /> : undefined}
            >
              {optingIn ? "Setting up…" : "Set Up Directory Listing"}
            </DashboardGradientButton>
          ) : (
            <DashboardGradientButton href="/pricing">
              Upgrade to Unlock
            </DashboardGradientButton>
          )}
        </DashboardCard>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 1 }}>
      {/* Status header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: 3,
          flexWrap: "wrap",
        }}
      >
        <Typography
          variant="h6"
          sx={{ color: "text.primary", fontWeight: 600 }}
        >
          Directory Listing
        </Typography>
        <Chip
          label={statusConfig.label}
          size="small"
          data-testid="status-badge"
          sx={{
            bgcolor: statusConfig.bgColor,
            color: statusConfig.color,
            fontWeight: 600,
            fontSize: "0.75rem",
          }}
        />
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      {/* Completeness bar */}
      {displayCompleteness && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Completeness
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "text.primary", fontWeight: 600 }}
              data-testid="completeness-score"
            >
              {displayCompleteness.score}%
            </Typography>
            <Chip
              size="small"
              label={
                status === "PUBLISHED" && displayCompleteness.score < MIN_PUBLISH_COMPLETENESS
                  ? "Improve readiness"
                  : displayCompleteness.score >= MIN_PUBLISH_COMPLETENESS
                  ? "Ready to publish"
                  : `${MIN_PUBLISH_COMPLETENESS}% required`
              }
              color={
                displayCompleteness.score >= MIN_PUBLISH_COMPLETENESS
                  ? "success"
                  : "warning"
              }
              variant="outlined"
            />
          </Box>
          <LinearProgress
            variant="determinate"
            value={displayCompleteness.score}
            sx={{
              height: 8,
              borderRadius: 4,
              mb: 1,
              bgcolor: "action.hover",
              "& .MuiLinearProgress-bar": {
                borderRadius: 4,
                bgcolor:
                  displayCompleteness.score >= 80
                    ? "success.main"
                    : displayCompleteness.score >= MIN_PUBLISH_COMPLETENESS
                      ? "warning.main"
                      : "error.main",
              },
            }}
            data-testid="completeness-bar"
          />
          {displayCompleteness.missing.length > 0 && (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {displayCompleteness.missing.map((field) => (
                <Chip
                  key={field}
                  label={formatMissingFieldLabel(field)}
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
          {displayCompleteness.missing.length > 0 && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Complete these fields to improve readiness:
              </Typography>
              <List
                dense
                disablePadding
                sx={{
                  mt: 0.75,
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.5,
                }}
              >
                {displayCompleteness.missing.slice(0, 4).map((field) => {
                  const suggestions = displayCompleteness.suggestions;
                  const suggestion =
                    suggestions && !Array.isArray(suggestions)
                      ? suggestions[field]
                      : undefined;
                  return (
                    <ListItem
                      key={field}
                      disableGutters
                      sx={{
                        alignItems: "flex-start",
                        py: 0,
                        color: "text.secondary",
                      }}
                    >
                      <Box
                        component="span"
                        sx={{
                          width: 5,
                          height: 5,
                          borderRadius: "50%",
                          bgcolor: "warning.main",
                          flexShrink: 0,
                          mt: "0.55em",
                          mr: 1,
                        }}
                      />
                      <ListItemText
                        primary={formatMissingFieldLabel(field)}
                        secondary={suggestion || "Add this information before publishing."}
                        primaryTypographyProps={{
                          variant: "caption",
                          sx: {
                            color: "text.primary",
                            fontWeight: 600,
                            textTransform: "capitalize",
                            lineHeight: 1.4,
                          },
                        }}
                        secondaryTypographyProps={{
                          variant: "caption",
                          sx: {
                            color: "text.secondary",
                            display: "block",
                            lineHeight: 1.4,
                          },
                        }}
                        sx={{ my: 0 }}
                      />
                    </ListItem>
                  );
                })}
              </List>
            </Box>
          )}
        </Box>
      )}

      {/* Main content: form + preview */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 3,
        }}
      >
        {/* Edit form */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <DashboardInput
              label="Business Name"
              value={form.businessName}
              onChange={handleFieldChange("businessName")}
              error={Boolean(formErrors.businessName)}
              helperText={formErrors.businessName}
              placeholder="Enter your business name"
            />

            <Box>
              <DashboardInput
                label="Short Description"
                value={form.shortDescription}
                onChange={handleFieldChange("shortDescription")}
                multiline
                rows={3}
                placeholder="Describe your business in a few sentences"
                inputProps={{ maxLength: MAX_DESC }}
              />
              <Typography
                variant="caption"
                sx={{
                  color:
                    form.shortDescription.length >= MAX_DESC
                      ? "error.main"
                      : "text.secondary",
                  mt: 0.5,
                  display: "block",
                  textAlign: "right",
                }}
                data-testid="char-counter"
              >
                {form.shortDescription.length}/{MAX_DESC}
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 2,
              }}
            >
              <Box sx={{ flex: 1 }}>
                <DashboardSelect
                  label="Business Category"
                  value={form.businessCategory}
                  onChange={handleSelectChange("businessCategory")}
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
              <Box sx={{ flex: 1 }}>
                <DashboardSelect
                  label="Price Level"
                  value={form.priceLevel}
                  onChange={handleSelectChange("priceLevel")}
                  name="priceLevel"
                >
                  <MenuItem value="">
                    <em>Select price level</em>
                  </MenuItem>
                  {PRICE_LEVELS.map((pl) => (
                    <MenuItem key={pl.value} value={pl.value}>
                      {pl.label}
                    </MenuItem>
                  ))}
                </DashboardSelect>
              </Box>
            </Box>

            <DashboardInput
              label="Phone"
              value={form.phone}
              onChange={handleFieldChange("phone")}
              placeholder="+1 (555) 000-0000"
              type="tel"
            />

            <DashboardInput
              label="Email"
              value={form.email}
              onChange={handleFieldChange("email")}
              placeholder="contact@business.com"
              type="email"
            />

            <DashboardInput
              label="Full Address"
              value={form.fullAddress}
              onChange={handleFieldChange("fullAddress")}
              placeholder="123 Business St, City, State 12345"
            />

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(3, minmax(0, 1fr))",
                },
                gap: 2,
              }}
            >
              <DashboardInput
                label="City"
                value={form.city}
                onChange={handleFieldChange("city")}
                placeholder="City"
              />
              <DashboardInput
                label="Region"
                value={form.region}
                onChange={handleFieldChange("region")}
                placeholder="State or region"
              />
              <DashboardInput
                label="Country"
                value={form.country}
                onChange={handleFieldChange("country")}
                placeholder="Country"
              />
            </Box>

            <Box>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", fontWeight: 500, mb: 1 }}
              >
                Listing Image
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 1,
                  alignItems: { xs: "stretch", sm: "center" },
                }}
              >
                <DashboardActionButton
                  component="label"
                  disabled={uploadingImage}
                  startIcon={
                    uploadingImage ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <Upload size={16} />
                    )
                  }
                >
                  {uploadingImage ? "Uploading..." : "Upload Image"}
                  <input
                    type="file"
                    hidden
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleListingImageUpload}
                  />
                </DashboardActionButton>
                <DashboardActionButton
                  variant="outlined"
                  disabled={!currentWebsiteImage || uploadingImage}
                  onClick={handleUseWebsiteImage}
                  startIcon={<ImageIcon size={16} />}
                >
                  Use Website Image
                </DashboardActionButton>
                <DashboardActionButton
                  variant="outlined"
                  disabled={!listingImageUrl || uploadingImage}
                  onClick={handleRemoveListingImage}
                  startIcon={<Trash2 size={16} />}
                >
                  Remove Image
                </DashboardActionButton>
              </Box>
              <Typography
                variant="caption"
                sx={{ color: "text.secondary", display: "block", mt: 0.75 }}
              >
                Upload a new image, reuse the website image, or remove the selected image from this listing preview.
              </Typography>
            </Box>

            {/* Tags */}
            <Box>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", fontWeight: 500, mb: 1 }}
              >
                Tags ({form.tags.length}/{MAX_TAGS})
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1 }}>
                {form.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    onDelete={() => handleRemoveTag(tag)}
                    deleteIcon={
                      <IconButton
                        size="small"
                        aria-label={`Remove tag ${tag}`}
                        sx={{ p: 0 }}
                      >
                        <X size={14} />
                      </IconButton>
                    }
                    sx={{ bgcolor: "primary.light", color: "primary.dark" }}
                    data-testid="tag-chip"
                  />
                ))}
              </Box>
              <TextField
                size="small"
                placeholder={
                  form.tags.length >= MAX_TAGS
                    ? "Maximum 10 tags reached"
                    : "Type a tag and press Enter"
                }
                value={tagInput}
                onChange={handleTagInputChange}
                onKeyDown={handleTagKeyDown}
                disabled={form.tags.length >= MAX_TAGS}
                fullWidth
                data-testid="tag-input"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                  },
                }}
              />
              {form.tags.length >= MAX_TAGS && (
                <Typography
                  variant="caption"
                  sx={{ color: "warning.main", mt: 0.5 }}
                >
                  Maximum of {MAX_TAGS} tags reached
                </Typography>
              )}
            </Box>
          </Box>
        </Box>

        {/* Live preview */}
        <Box
          sx={{
            width: { xs: "100%", md: 430 },
            flexShrink: 0,
          }}
        >
          <DashboardCard icon={Globe} title="Preview">
            <Box
              sx={{
                width: "100%",
                maxWidth: 400,
                mx: "auto",
              }}
              data-testid="listing-preview"
            >
              <PropertyItemCard
                item={{
                  ...previewData,
                  businessLogo: resolveAssetUrl(previewData.businessLogo),
                  businessBanner: resolveAssetUrl(previewData.businessBanner),
                  image: resolveAssetUrl(previewData.image),
                  image1: resolveAssetUrl(previewData.image1),
                }}
                handleDeleteItem={() => undefined}
                previewMode
                totalPages={1}
                currentPage={1}
                setCurrentPage={() => undefined}
              />
            </Box>
          </DashboardCard>
        </Box>
      </Box>

      {/* Action buttons */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 1.5,
          mt: 3,
          flexWrap: "wrap",
        }}
      >
        <DashboardActionButton
          onClick={handleSave}
          disabled={isAnyActionRunning}
          data-testid="save-btn"
          startIcon={
            saving ? <CircularProgress size={16} color="inherit" /> : undefined
          }
        >
          Save Changes
        </DashboardActionButton>

        {status !== "PUBLISHED" && status !== "ARCHIVED" && (
          <DashboardGradientButton
            onClick={handlePublish}
            disabled={isAnyActionRunning}
            data-testid="publish-btn"
            startIcon={
              publishing ? (
                <CircularProgress size={16} color="inherit" />
              ) : undefined
            }
          >
            Publish to Directory
          </DashboardGradientButton>
        )}

        {status === "ARCHIVED" && (
          <DashboardGradientButton
            onClick={handleRepublish}
            disabled={isAnyActionRunning}
            data-testid="republish-btn"
            startIcon={
              publishing ? (
                <CircularProgress size={16} color="inherit" />
              ) : undefined
            }
          >
            Republish to Directory
          </DashboardGradientButton>
        )}

        {status === "PUBLISHED" && (
          <DashboardActionButton
            onClick={handleUnpublish}
            disabled={isAnyActionRunning}
            variant="outlined"
            data-testid="unpublish-btn"
            startIcon={
              unpublishing ? (
                <CircularProgress size={16} color="inherit" />
              ) : undefined
            }
          >
            Unpublish
          </DashboardActionButton>
        )}

        <DashboardConfirmButton
          onClick={() => setShowArchiveConfirm(true)}
          disabled={isAnyActionRunning}
          tone="danger"
          data-testid="archive-btn"
        >
          Archive Listing
        </DashboardConfirmButton>

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
              disabled={isAnyActionRunning || !isPaidPlan || aiRemaining <= 0}
              startIcon={
                enhancing ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <Sparkles size={16} />
                )
              }
              data-testid="enhance-btn"
            >
              Enhance with AI
            </DashboardGradientButton>
          </span>
        </Tooltip>
      </Box>

      {/* Archive confirmation dialog */}
      <ConfirmationDialog
        open={showArchiveConfirm}
        onConfirm={handleArchive}
        onCancel={() => setShowArchiveConfirm(false)}
        title="Archive Listing?"
        message="This will remove your listing from the directory. You can republish it later."
        confirmLabel="Archive"
        cancelLabel="Cancel"
        variant="danger"
        loading={archiving}
      />
    </Box>
  );
});

export default ListingEditTab;
