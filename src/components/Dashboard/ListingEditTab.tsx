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
import { Globe, Sparkles, X } from "lucide-react";
import axios from "axios";
import DashboardInput from "./shared/DashboardInput";
import DashboardSelect from "./shared/DashboardSelect";
import DashboardActionButton from "./shared/DashboardActionButton";
import DashboardGradientButton from "./shared/DashboardGradientButton";
import DashboardConfirmButton from "./shared/DashboardConfirmButton";
import DashboardCard from "./shared/DashboardCard";
import { EmptyState, ConfirmationDialog } from "./shared";

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

const PRICE_LEVELS = [
  { value: "$", label: "$ - Budget" },
  { value: "$$", label: "$$ - Moderate" },
  { value: "$$$", label: "$$$ - Premium" },
  { value: "$$$$", label: "$$$$ - Luxury" },
];

type ListingStatus = "NOT_LISTED" | "DRAFT" | "PUBLISHED" | "ARCHIVED";

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
  tags: string[];
}

interface CompletenessData {
  score: number;
  missing: string[];
  suggestions?: string[];
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
    tags?: string[];
    directoryOptedIn?: boolean;
    isPublic?: boolean;
    isDirectoryArchived?: boolean;
  } | null;
  planCode: string;
  aiGenerationsUsed?: number;
  aiGenerationsLimit?: number;
  onUpdate?: () => void;
}

function deriveStatus(data: ListingEditTabProps["websiteData"]): ListingStatus {
  if (!data?.directoryOptedIn) return "NOT_LISTED";
  if (data.isDirectoryArchived) return "ARCHIVED";
  if (data.isPublic) return "PUBLISHED";
  return "DRAFT";
}

const MAX_TAGS = 10;
const MAX_DESC = 500;

const ListingEditTab = React.memo(function ListingEditTab({
  websiteId,
  websiteData,
  planCode,
  aiGenerationsUsed = 0,
  aiGenerationsLimit = 10,
  onUpdate,
}: ListingEditTabProps) {
  const isPaidPlan = PAID_PLANS.includes(planCode);

  const [form, setForm] = useState<FormData>({
    businessName: "",
    shortDescription: "",
    businessCategory: "",
    priceLevel: "",
    phone: "",
    email: "",
    fullAddress: "",
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
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const status = useMemo(() => deriveStatus(websiteData), [websiteData]);
  const statusConfig = STATUS_CONFIG[status];

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
        tags: websiteData.tags || [],
      });
      setPageLoading(false);
    }
  }, [websiteData]);

  // Fetch completeness
  const fetchCompleteness = useCallback(async () => {
    try {
      const res = await axios.get(
        `${API_URL}/websites/${websiteId}/listing/completeness`,
      );
      if (res.data?.success) {
        setCompleteness(res.data.data);
      }
    } catch {
      // Silently fail
    }
  }, [websiteId]);

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
      businessName: form.businessName || "Your Business",
      category: form.businessCategory || "Category",
      shortDescription:
        form.shortDescription || "A brief description of your business...",
      tags: form.tags,
    };
  }, [
    form.businessName,
    form.businessCategory,
    form.shortDescription,
    form.tags,
  ]);

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
  const handleSave = useCallback(async () => {
    if (!validateForm()) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await axios.patch(`${API_URL}/websites/${websiteId}/listing`, {
        businessName: form.businessName,
        shortDescription: form.shortDescription,
        businessCategory: form.businessCategory,
        priceLevel: form.priceLevel,
        phone: form.phone,
        contactEmail: form.email,
        fullAddress: form.fullAddress,
        tags: form.tags,
      });
      setSuccess("Listing saved successfully");
      await fetchCompleteness();
      onUpdate?.();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save listing");
    } finally {
      setSaving(false);
    }
  }, [form, websiteId, validateForm, fetchCompleteness, onUpdate]);

  // Publish
  const handlePublish = useCallback(async () => {
    if (completeness && completeness.score < 60) {
      setError(
        "Listing completeness must be at least 60% to publish. Please fill in the missing fields.",
      );
      return;
    }
    setPublishing(true);
    setError("");
    setSuccess("");
    try {
      const res = await axios.post(
        `${API_URL}/websites/${websiteId}/listing/publish`,
      );
      if (res.data?.success) {
        setSuccess("Listing published to directory");
        onUpdate?.();
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
  }, [completeness, websiteId, onUpdate]);

  // Unpublish (uses archive endpoint)
  const handleUnpublish = useCallback(async () => {
    setUnpublishing(true);
    setError("");
    setSuccess("");
    try {
      await axios.post(`${API_URL}/websites/${websiteId}/listing/archive`, {
        reason: "Unpublished by owner",
      });
      setSuccess("Listing unpublished");
      onUpdate?.();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to unpublish listing");
    } finally {
      setUnpublishing(false);
    }
  }, [websiteId, onUpdate]);

  // Republish (from ARCHIVED state)
  const handleRepublish = useCallback(async () => {
    setPublishing(true);
    setError("");
    setSuccess("");
    try {
      await axios.post(`${API_URL}/websites/${websiteId}/listing/republish`);
      setSuccess("Listing republished to directory");
      onUpdate?.();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to republish listing");
    } finally {
      setPublishing(false);
    }
  }, [websiteId, onUpdate]);

  // Archive
  const handleArchive = useCallback(async () => {
    setArchiving(true);
    setError("");
    setSuccess("");
    try {
      await axios.post(`${API_URL}/websites/${websiteId}/listing/archive`);
      setSuccess("Listing archived");
      setShowArchiveConfirm(false);
      onUpdate?.();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to archive listing");
    } finally {
      setArchiving(false);
    }
  }, [websiteId, onUpdate]);

  // AI Enhance
  const handleEnhance = useCallback(async () => {
    setEnhancing(true);
    setError("");
    setSuccess("");
    try {
      const res = await axios.post(
        `${API_URL}/websites/${websiteId}/listing/enhance`,
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

  // Empty state for not opted-in
  if (!websiteData?.directoryOptedIn && status === "NOT_LISTED") {
    return (
      <EmptyState
        icon={<Globe size={40} />}
        title="No Directory Listing"
        subtitle="Enable directory listing in your website settings to manage your listing here."
      />
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
      {completeness && (
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
            width: { xs: "100%", md: 320 },
            flexShrink: 0,
          }}
        >
          <DashboardCard icon={Globe} title="Preview">
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
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
                sx={{ color: "text.secondary", mt: 0.5, mb: 1 }}
              >
                {previewData.shortDescription}
              </Typography>
              {previewData.tags.length > 0 && (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {previewData.tags.slice(0, 5).map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: "0.7rem" }}
                    />
                  ))}
                  {previewData.tags.length > 5 && (
                    <Chip
                      label={`+${previewData.tags.length - 5}`}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: "0.7rem" }}
                    />
                  )}
                </Box>
              )}
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
