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
import ReactQuill, { Quill } from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
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
import { alpha } from "@mui/material/styles";
import { Globe, Image as ImageIcon, Sparkles, Trash2, Upload, X } from "lucide-react";
import { apiClient } from "../../api/client";
import { API_URL } from "@/config/api";
import {
  hasDirectoryListingIntent,
  clearDirectoryListingIntent,
} from "../../utils/directoryListingIntent";
import { useTheme as useCustomTheme } from "../../context/ThemeContext";
import { getDashboardColors } from "../../styles/dashboardTheme";
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

// Backend-decided directory eligibility (Website.aiContext.listingEligibility).
// The backend is the source of truth: the AI judges whether the website is a
// genuine business from its name + category + content at first opt-in.
type EligibilityStatus =
  | "NOT_CHECKED"
  | "ELIGIBLE"
  | "INELIGIBLE"
  | "UNDER_REVIEW";

interface ListingEligibility {
  status: EligibilityStatus;
  reason: string | null;
  canAppeal: boolean;
  checkedAt: string | null;
}

// Error code returned (HTTP 422) when the AI judges the site is not a business.
const NOT_A_BUSINESS_CODE = "NOT_A_BUSINESS";

// Rotating status lines shown while `extract` runs (pull content + AI eligibility
// check) — a multi-second round-trip, so we narrate it instead of just disabling
// the button. The last line holds once reached (no looping back).
const OPT_IN_STEPS = [
  "Pulling your website's content…",
  "Reviewing your listing details…",
  "Checking that it qualifies as a business…",
  "Almost there…",
];

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
  descriptionContent: string;
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
    descriptionContent?: string | null;
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
    listingEligibility?: ListingEligibility | null;
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
const MAX_SHORT_DESCRIPTION_LENGTH = 240;
const MIN_DESCRIPTION_WORDS = 250;
const MAX_DESCRIPTION_WORDS = 2000;
const MAX_DESCRIPTION_MEDIA = 2;
const MAX_DESCRIPTION_IMAGES = 2;
const MAX_DESCRIPTION_VIDEOS = 1;
const MIN_PUBLISH_COMPLETENESS = 60;

const BlockEmbed = Quill.import("blots/block/embed") as any;

class ListingVideoBlot extends BlockEmbed {
  static blotName = "listingVideo";
  static tagName = "video";

  static create(value: string) {
    const node = super.create(value);
    node.setAttribute("src", value);
    node.setAttribute("controls", "controls");
    return node;
  }

  static value(node: HTMLElement) {
    return node.getAttribute("src");
  }
}

Quill.register(ListingVideoBlot, true);

const countWords = (value: string) =>
  value
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

const stripHtml = (value = "") =>
  value
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

const createDescriptionContent = (text = "") =>
  text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${paragraph}</p>`)
    .join("") || "<p><br></p>";

const countDescriptionMedia = (html = "") => {
  const imageCount = (html.match(/<img\b/gi) || []).length;
  const videoCount = (html.match(/<video\b|<iframe\b/gi) || []).length;
  return {
    imageCount,
    videoCount,
    total: imageCount + videoCount,
  };
};

const getDescriptionMediaLimitError = ({
  imageCount,
  videoCount,
  total,
}: ReturnType<typeof countDescriptionMedia>) => {
  if (
    total > MAX_DESCRIPTION_MEDIA ||
    imageCount > MAX_DESCRIPTION_IMAGES ||
    videoCount > MAX_DESCRIPTION_VIDEOS ||
    (videoCount === 1 && imageCount > 1)
  ) {
    return "Description can include up to 2 images, or 1 image and 1 video.";
  }
  return "";
};

const DESCRIPTION_EDITOR_FORMATS = [
  "header",
  "bold",
  "italic",
  "underline",
  "list",
  "bullet",
  "blockquote",
  "link",
  "image",
  "video",
  "listingVideo",
];

const formatMissingFieldLabel = (field: string) =>
  field
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/^./, (char) => char.toUpperCase());

const FIELD_ERROR_ALIASES: Record<string, keyof FormData> = {
  contactEmail: "email",
  email: "email",
};

const normalizeFieldErrors = (fields?: unknown) => {
  const normalized: Record<string, string> = {};
  if (!fields || typeof fields !== "object" || Array.isArray(fields)) {
    return normalized;
  }

  Object.entries(fields as Record<string, unknown>).forEach(([field, value]) => {
    const key = FIELD_ERROR_ALIASES[field] || field;
    const message = Array.isArray(value)
      ? value.map((item) => stringifyApiMessage(item, "")).filter(Boolean).join(" ")
      : stringifyApiMessage(value, "");
    if (message) normalized[key] = message;
  });

  return normalized;
};

const stringifyApiMessage = (value: unknown, fallback = "Request failed"): string => {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    const joined = value.map((item) => stringifyApiMessage(item, "")).filter(Boolean).join(" ");
    return joined || fallback;
  }
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (typeof record.message === "string") return record.message;
    if (typeof record.error === "string") return record.error;
    if (typeof record.code === "string") return record.code;
    try {
      return JSON.stringify(value);
    } catch {
      return fallback;
    }
  }
  return fallback;
};

const getApiValidationErrors = (data?: any) =>
  normalizeFieldErrors(data?.fields || data?.errors || data?.fieldErrors);

const getApiErrorMessage = (data?: any, fallback = "Request failed") =>
  stringifyApiMessage(data?.error || data?.message, fallback);

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
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);
  const isLight = actualTheme === "light";
  const inputPalette = useMemo(
    () => ({
      fill: isLight ? "#ffffff" : colors.panelBg,
      border: isLight ? alpha("#111827", 0.16) : colors.panelBorder,
      text: isLight ? "#111827" : colors.panelText,
      muted: isLight ? "#111827" : colors.panelMuted,
      subtle: isLight ? alpha("#111827", 0.45) : colors.panelSubtle,
      accent: isLight ? "#111827" : colors.panelAccent,
      danger: colors.panelDanger,
      hoverBorder: isLight ? "#111827" : alpha(colors.panelAccent, 0.3),
      toolbarFill: isLight ? "#ffffff" : colors.panelBg,
    }),
    [colors, isLight],
  );

  const [form, setForm] = useState<FormData>({
    businessName: "",
    shortDescription: "",
    descriptionContent: "<p><br></p>",
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
  const [uploadingDescriptionMedia, setUploadingDescriptionMedia] =
    useState(false);
  const [listingImageUrl, setListingImageUrl] = useState("");
  const [extracted, setExtracted] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  // Backend-decided business eligibility. Seeded from websiteData and updated
  // whenever a write returns a NOT_A_BUSINESS block or an appeal succeeds.
  const [eligibility, setEligibility] = useState<ListingEligibility | null>(
    websiteData?.listingEligibility ?? null,
  );
  const [appealing, setAppealing] = useState(false);
  // Nudge for users who ticked "list my business" in the creation wizard but
  // haven't finished setup here yet (intent recorded client-side by the wizard).
  const [showIntentNudge, setShowIntentNudge] = useState(() =>
    hasDirectoryListingIntent(websiteId),
  );
  // Rotating status line index while the opt-in (extract + eligibility) runs.
  const [optInStep, setOptInStep] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const richEditorRef = useRef<ReactQuill | null>(null);

  // Keep local eligibility in sync if the parent reloads the website.
  useEffect(() => {
    if (websiteData?.listingEligibility) {
      setEligibility(websiteData.listingEligibility);
    }
  }, [websiteData?.listingEligibility]);

  // Advance the opt-in status line while extract runs; reset when it finishes.
  useEffect(() => {
    if (!optingIn) {
      setOptInStep(0);
      return;
    }
    const id = setInterval(() => {
      setOptInStep((step) => Math.min(step + 1, OPT_IN_STEPS.length - 1));
    }, 1800);
    return () => clearInterval(id);
  }, [optingIn]);

  const eligibilityStatus: EligibilityStatus =
    eligibility?.status ?? "NOT_CHECKED";
  const isIneligible = eligibilityStatus === "INELIGIBLE";
  const isUnderReview = eligibilityStatus === "UNDER_REVIEW";
  const listingBlocked = isIneligible || isUnderReview;

  // Detect the NOT_A_BUSINESS 422 and surface its verdict. Returns true if handled.
  // `persistVerdict` should only be true for the opt-in flow, where the backend
  // actually persists the INELIGIBLE verdict and the whole tab flips to the
  // blocked state. On save/publish/republish the backend rejects the write but
  // keeps the prior approved content live, so we only show the reason inline.
  const handleEligibilityBlock = useCallback(
    (data: any, persistVerdict = false): boolean => {
      if (data?.error?.code !== NOT_A_BUSINESS_CODE) return false;
      if (persistVerdict && data.listingEligibility) {
        setEligibility(data.listingEligibility);
      }
      setError(
        data.error?.reason ||
          data.error?.message ||
          "You cannot add this listing because your website isn't a business.",
      );
      return true;
    },
    [],
  );

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
        descriptionContent:
          websiteData.descriptionContent ||
          createDescriptionContent(websiteData.shortDescription || ""),
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

  const plainDescription = useMemo(
    () => stripHtml(form.descriptionContent),
    [form.descriptionContent],
  );

  const descriptionWordCount = useMemo(
    () => countWords(plainDescription),
    [plainDescription],
  );

  const shortDescriptionCharacterCount = useMemo(
    () => form.shortDescription.trim().length,
    [form.shortDescription],
  );

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

  const handleDescriptionContentChange = useCallback((value: string) => {
    const mediaError = getDescriptionMediaLimitError(countDescriptionMedia(value));
    setForm((prev) => ({
      ...prev,
      descriptionContent: value,
    }));
    setFormErrors((prev) => ({
      ...prev,
      descriptionContent: mediaError,
    }));
  }, []);

  const uploadDescriptionMedia = useCallback(
    async (kind: "image" | "video") => {
      const currentCounts = countDescriptionMedia(form.descriptionContent);
      const nextCounts = {
        imageCount: currentCounts.imageCount + (kind === "image" ? 1 : 0),
        videoCount: currentCounts.videoCount + (kind === "video" ? 1 : 0),
        total: currentCounts.total + 1,
      };
      const limitError = getDescriptionMediaLimitError(nextCounts);
      if (limitError) {
        setFormErrors((prev) => ({
          ...prev,
          descriptionContent: limitError,
        }));
        return;
      }

      const input = document.createElement("input");
      input.type = "file";
      input.accept =
        kind === "image"
          ? "image/jpeg,image/png,image/webp"
          : "video/mp4,video/webm,video/quicktime";

      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return;

        setUploadingDescriptionMedia(true);
        setError("");
        setSuccess("");
        setFormErrors((prev) => ({ ...prev, descriptionContent: "" }));

        try {
          const payload = new FormData();
          payload.append("file", file);

          const response = await apiClient.post(
            `/websites/${websiteId}/listing/description-media`,
            payload,
            { headers: { "Content-Type": "multipart/form-data" } },
          );
          const uploaded =
            response.data?.data ||
            response.data ||
            {};
          const url = uploaded.url || uploaded.fileUrl || "";
          const mediaType = uploaded.type || kind;
          if (!url) {
            throw new Error("Upload did not return a media URL");
          }

          const editor = richEditorRef.current?.getEditor();
          if (!editor) return;

          const range = editor.getSelection(true);
          const index = range?.index ?? editor.getLength();
          editor.insertEmbed(
            index,
            mediaType === "video" ? "listingVideo" : "image",
            url,
            "user",
          );
          editor.setSelection(index + 1, 0, "user");
        } catch (err: any) {
          setError(
            getApiErrorMessage(
              err.response?.data || err,
              `Failed to upload description ${kind}`,
            ),
          );
        } finally {
          setUploadingDescriptionMedia(false);
        }
      };

      input.click();
    },
    [form.descriptionContent, websiteId],
  );

  const descriptionEditorModules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [2, 3, false] }],
          ["bold", "italic", "underline"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["blockquote", "link", "image", "video"],
          ["clean"],
        ],
        handlers: {
          image: () => uploadDescriptionMedia("image"),
          video: () => uploadDescriptionMedia("video"),
        },
      },
    }),
    [uploadDescriptionMedia],
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
      setError(getApiErrorMessage(err.response?.data, "Failed to upload listing image"));
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
    const shortDescription = form.shortDescription.trim();
    if (!shortDescription) {
      errors.shortDescription = "Short description is required";
    } else if (shortDescription.length > MAX_SHORT_DESCRIPTION_LENGTH) {
      errors.shortDescription = `Short description must be ${MAX_SHORT_DESCRIPTION_LENGTH} characters or fewer. Current count: ${shortDescription.length}.`;
    }

    const descriptionWordCount = countWords(stripHtml(form.descriptionContent));
    if (descriptionWordCount < MIN_DESCRIPTION_WORDS) {
      errors.descriptionContent = `Description must be at least ${MIN_DESCRIPTION_WORDS} words. Current count: ${descriptionWordCount}.`;
    } else if (descriptionWordCount > MAX_DESCRIPTION_WORDS) {
      errors.descriptionContent = `Description must be ${MAX_DESCRIPTION_WORDS} words or fewer. Current count: ${descriptionWordCount}.`;
    }
    const mediaError = getDescriptionMediaLimitError(
      countDescriptionMedia(form.descriptionContent),
    );
    if (mediaError) {
      errors.descriptionContent = mediaError;
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [form.businessName, form.descriptionContent, form.shortDescription]);

  // Save
  const handleOptIn = useCallback(async () => {
    if (!isPaidPlan || listingBlocked) return;
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
      clearDirectoryListingIntent(websiteId);
      setShowIntentNudge(false);
      await fetchCompleteness();
      await refreshListingCaches({
        ...websiteData,
        ...updatedWebsite,
        directoryOptedIn: true,
      });
    } catch (err: any) {
      const data = err.response?.data;
      // Opt-in rejection persists the INELIGIBLE verdict → flip to blocked state.
      if (handleEligibilityBlock(data, true)) return;
      setError(getApiErrorMessage(data, "Failed to initialise directory listing"));
    } finally {
      setOptingIn(false);
    }
  }, [websiteId, isPaidPlan, listingBlocked, handleEligibilityBlock, fetchCompleteness, refreshListingCaches, websiteData]);

  const handleSave = useCallback(async () => {
    if (!validateForm()) return;
    setSaving(true);
    setError("");
    setSuccess("");
    setFormErrors({});
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
        descriptionContent: form.descriptionContent || createDescriptionContent(form.shortDescription),
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
      const data = err.response?.data;
      if (handleEligibilityBlock(data)) return;
      const validationErrors = getApiValidationErrors(data);
      if (Object.keys(validationErrors).length > 0) {
        setFormErrors(validationErrors);
      }
      setError(getApiErrorMessage(data, "Failed to save listing"));
    } finally {
      setSaving(false);
    }
  }, [form, websiteData, websiteId, validateForm, handleEligibilityBlock, fetchCompleteness, refreshListingCaches]);

  // Publish
  const handlePublish = useCallback(async () => {
    if (listingBlocked) return;
    if (!validateForm()) return;
    if (completeness && completeness.score < MIN_PUBLISH_COMPLETENESS) {
      setError(
        `Listing readiness must be at least ${MIN_PUBLISH_COMPLETENESS}% to publish. Please fill in the missing fields.`,
      );
      return;
    }
    setPublishing(true);
    setError("");
    setSuccess("");
    setFormErrors({});
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
      if (handleEligibilityBlock(data)) return;
      const validationErrors = getApiValidationErrors(data);
      if (Object.keys(validationErrors).length > 0) {
        setFormErrors(validationErrors);
      }
      if (data?.missing) {
        setError(`Cannot publish. Missing fields: ${data.missing.join(", ")}`);
      } else {
        setError(getApiErrorMessage(data, "Failed to publish listing"));
      }
    } finally {
      setPublishing(false);
    }
  }, [completeness, listingBlocked, handleEligibilityBlock, validateForm, websiteId, refreshListingCaches]);

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
      setError(getApiErrorMessage(err.response?.data, "Failed to unpublish listing"));
    } finally {
      setUnpublishing(false);
    }
  }, [websiteId, refreshListingCaches]);

  // Republish (from ARCHIVED state)
  const handleRepublish = useCallback(async () => {
    if (listingBlocked) return;
    if (!validateForm()) return;
    setPublishing(true);
    setError("");
    setSuccess("");
    try {
      await apiClient.post(`/websites/${websiteId}/listing/republish`);
      setSuccess("Listing republished to directory");
      await refreshListingCaches();
    } catch (err: any) {
      const data = err.response?.data;
      if (handleEligibilityBlock(data)) return;
      setError(getApiErrorMessage(data, "Failed to republish listing"));
    } finally {
      setPublishing(false);
    }
  }, [listingBlocked, handleEligibilityBlock, validateForm, websiteId, refreshListingCaches]);

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
      setError(getApiErrorMessage(err.response?.data, "Failed to archive listing"));
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
          descriptionContent:
            data.descriptionContent ||
            createDescriptionContent(data.shortDescription || prev.shortDescription),
          tags: data.tags || prev.tags,
        }));
        setSuccess("AI enhancement applied");
        await fetchCompleteness();
      }
    } catch (err: any) {
      setError(getApiErrorMessage(err.response?.data, "AI enhancement failed"));
    } finally {
      setEnhancing(false);
    }
  }, [websiteId, fetchCompleteness]);

  // Appeal an INELIGIBLE verdict for manual admin review.
  const handleAppeal = useCallback(async () => {
    setAppealing(true);
    setError("");
    setSuccess("");
    try {
      const res = await apiClient.post(
        `/websites/${websiteId}/listing/eligibility/appeal`,
        {},
      );
      const nextEligibility = res.data?.listingEligibility;
      if (nextEligibility) {
        setEligibility(nextEligibility);
      } else {
        // Fall back to an optimistic under-review state on a bare success.
        setEligibility((prev) =>
          prev
            ? { ...prev, status: "UNDER_REVIEW", canAppeal: false }
            : { status: "UNDER_REVIEW", reason: null, canAppeal: false, checkedAt: null },
        );
      }
      setSuccess("Your website has been submitted for review.");
    } catch (err: any) {
      setError(
        getApiErrorMessage(err.response?.data, "Failed to submit for review"),
      );
    } finally {
      setAppealing(false);
    }
  }, [websiteId]);

  const aiRemaining = aiGenerationsLimit - aiGenerationsUsed;
  const isAnyActionRunning =
    saving ||
    publishing ||
    unpublishing ||
    archiving ||
    enhancing ||
    uploadingDescriptionMedia;

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

  // Business-eligibility block: the AI judged this website isn't a business
  // (INELIGIBLE), or an appeal is pending (UNDER_REVIEW). This wins over the
  // opt-in prompt because an ineligible site is never opted in.
  if (listingBlocked) {
    return (
      <Box sx={{ py: 2 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}
        <DashboardCard icon={Globe} title="Directory Listing">
          {isUnderReview ? (
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Your website is under review. Our team is checking whether it
              qualifies for the Techietribe Directory, and we'll update this
              page once a decision is made.
            </Typography>
          ) : (
            <>
              <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
                The Techietribe Directory is for businesses only, and this
                website doesn't appear to be a business, so it can't be listed.
              </Typography>
              {eligibility?.reason && (
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", mb: 2, fontStyle: "italic" }}
                >
                  {eligibility.reason}
                </Typography>
              )}
              {eligibility?.canAppeal && (
                <DashboardGradientButton
                  onClick={handleAppeal}
                  disabled={appealing}
                  startIcon={appealing ? <CircularProgress size={16} color="inherit" /> : undefined}
                >
                  {appealing ? "Submitting…" : "Request Review"}
                </DashboardGradientButton>
              )}
            </>
          )}
        </DashboardCard>
      </Box>
    );
  }

  // Opt-in prompt for not-yet-listed websites (bypass if extract already ran this session)
  if (!websiteData?.directoryOptedIn && status === "NOT_LISTED" && !extracted) {
    return (
      <Box sx={{ py: 2 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
        <DashboardCard icon={Globe} title="Directory Listing">
          {optingIn ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                gap: 2,
                py: 4,
                px: 2,
              }}
            >
              <CircularProgress size={34} />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary" }}>
                  Setting up your directory listing…
                </Typography>
                <Typography
                  key={optInStep}
                  variant="body2"
                  sx={{
                    mt: 0.5,
                    color: "text.secondary",
                    animation: "listingOptInFade 300ms ease",
                    "@keyframes listingOptInFade": {
                      from: { opacity: 0 },
                      to: { opacity: 1 },
                    },
                  }}
                >
                  {OPT_IN_STEPS[optInStep]}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: "text.disabled" }}>
                This can take a few seconds — please keep this tab open.
              </Typography>
            </Box>
          ) : (
            <>
              {showIntentNudge && isPaidPlan && (
                <Alert severity="info" sx={{ mb: 2 }} onClose={() => setShowIntentNudge(false)}>
                  You chose to list this website when you created it. Finish setting
                  it up below — we'll pull your site's content and check it's a
                  business before it goes live.
                </Alert>
              )}
              <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
                List your business in the Techietribe Directory so customers can discover you.
                {!isPaidPlan && " Upgrade to a paid plan to unlock this feature."}
              </Typography>
              {isPaidPlan ? (
                <DashboardGradientButton onClick={handleOptIn}>
                  Set Up Directory Listing
                </DashboardGradientButton>
              ) : (
                <DashboardGradientButton href="/pricing">
                  Upgrade to Unlock
                </DashboardGradientButton>
              )}
            </>
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
                error={Boolean(formErrors.shortDescription)}
                helperText={formErrors.shortDescription}
                placeholder="Brief summary shown on directory cards"
                multiline
                rows={3}
                inputProps={{ maxLength: MAX_SHORT_DESCRIPTION_LENGTH }}
              />
              <Typography
                variant="caption"
                sx={{
                  color:
                    shortDescriptionCharacterCount > MAX_SHORT_DESCRIPTION_LENGTH
                      ? inputPalette.danger
                      : inputPalette.muted,
                  mt: 0.75,
                  display: "block",
                  textAlign: "right",
                  fontSize: "0.85rem",
                }}
                data-testid="short-description-counter"
              >
                {shortDescriptionCharacterCount}/{MAX_SHORT_DESCRIPTION_LENGTH}
              </Typography>
            </Box>

            <Box
              sx={{
                "&:focus-within .dashboard-input-label": {
                  color: inputPalette.accent,
                },
              }}
            >
              <Typography
                className="dashboard-input-label"
                variant="body2"
                sx={{
                  color: formErrors.descriptionContent
                    ? inputPalette.danger
                    : inputPalette.muted,
                  fontSize: "0.95rem",
                  fontWeight: 500,
                  mb: 1,
                  transition: "color 0.2s ease",
                }}
              >
                Business Description
              </Typography>
              <Box
                data-testid="description-rich-editor"
                sx={{
                  border: "1px solid",
                  borderColor: formErrors.descriptionContent
                    ? inputPalette.danger
                    : inputPalette.border,
                  borderRadius: "12px",
                  overflow: "hidden",
                  backgroundColor: `${inputPalette.fill} !important`,
                  boxShadow: "none",
                  transition: "border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease",
                  "& .quill": {
                    height: "100%",
                    backgroundColor: `${inputPalette.fill} !important`,
                  },
                  "& .ql-snow": {
                    backgroundColor: `${inputPalette.fill} !important`,
                  },
                  "&:hover": {
                    borderColor: formErrors.descriptionContent
                      ? inputPalette.danger
                      : inputPalette.hoverBorder,
                  },
                  "&:focus-within": {
                    borderColor: formErrors.descriptionContent
                      ? inputPalette.danger
                      : inputPalette.accent,
                    boxShadow: formErrors.descriptionContent
                      ? "none"
                      : `0 0 0 3px ${alpha(inputPalette.accent, isLight ? 0.14 : 0.22)}`,
                  },
                  "& .ql-toolbar": {
                    border: "0 !important",
                    borderBottom: "1px solid",
                    borderColor: `${inputPalette.border} !important`,
                    backgroundColor: `${inputPalette.toolbarFill} !important`,
                    px: 1.25,
                    py: 1,
                    fontFamily: "inherit",
                    "& .ql-picker": {
                      color: inputPalette.text,
                    },
                    "& .ql-picker.ql-expanded .ql-picker-label": {
                      color: `${inputPalette.accent} !important`,
                    },
                    "& .ql-picker-label": {
                      borderRadius: "8px",
                      color: `${inputPalette.text} !important`,
                      borderColor: "transparent",
                    },
                    "& .ql-picker-label:hover, & .ql-picker-label.ql-active": {
                      color: `${inputPalette.accent} !important`,
                    },
                    "& .ql-picker-item:hover, & .ql-picker-item.ql-selected": {
                      color: `${inputPalette.accent} !important`,
                    },
                    "& .ql-picker-options": {
                      backgroundColor: isLight ? "#ffffff" : colors.panelBg,
                      borderColor: inputPalette.border,
                      borderRadius: "10px",
                      boxShadow: colors.panelShadow,
                      color: inputPalette.text,
                    },
                    "& button": {
                      borderRadius: "8px",
                      color: `${inputPalette.muted} !important`,
                      mx: 0.15,
                    },
                    "& button:hover, & button.ql-active, & button:focus": {
                      backgroundColor: alpha(inputPalette.accent, isLight ? 0.08 : 0.14),
                      color: `${inputPalette.accent} !important`,
                    },
                    "& button:hover .ql-stroke, & button.ql-active .ql-stroke, & button:focus .ql-stroke, & .ql-picker-label:hover .ql-stroke, & .ql-picker.ql-expanded .ql-picker-label .ql-stroke": {
                      stroke: `${inputPalette.accent} !important`,
                    },
                    "& button:hover .ql-fill, & button.ql-active .ql-fill, & button:focus .ql-fill, & .ql-picker-label:hover .ql-fill, & .ql-picker.ql-expanded .ql-picker-label .ql-fill": {
                      fill: `${inputPalette.accent} !important`,
                    },
                    "& button .ql-stroke, & .ql-picker-label .ql-stroke": {
                      stroke: "currentColor !important",
                    },
                    "& button .ql-fill, & .ql-picker-label .ql-fill": {
                      fill: "currentColor !important",
                    },
                  },
                  "& .ql-toolbar.ql-snow": {
                    border: "0 !important",
                    borderBottom: `1px solid ${inputPalette.border} !important`,
                  },
                  "& .ql-container": {
                    border: "0 !important",
                    borderTop: "0 !important",
                    minHeight: 260,
                    fontFamily: "inherit",
                    fontSize: "1rem",
                    backgroundColor: `${inputPalette.fill} !important`,
                  },
                  "& .ql-container.ql-snow": {
                    border: "0 !important",
                    backgroundColor: `${inputPalette.fill} !important`,
                  },
                  "& .ql-editor": {
                    minHeight: 260,
                    backgroundColor: `${inputPalette.fill} !important`,
                    color: inputPalette.text,
                    caretColor: `${inputPalette.text} !important`,
                    lineHeight: 1.7,
                    px: 2,
                    py: 1.75,
                  },
                  "& .ql-editor.ql-blank::before": {
                    color: inputPalette.subtle,
                    fontStyle: "normal",
                    left: 16,
                    right: 16,
                  },
                  "& .ql-editor img": {
                    display: "block",
                    maxWidth: "100%",
                    maxHeight: 360,
                    my: 2,
                    borderRadius: "8px",
                  },
                  "& .ql-editor video": {
                    display: "block",
                    width: "100%",
                    maxHeight: 420,
                    my: 2,
                    borderRadius: "8px",
                    backgroundColor: "#000",
                  },
                }}
              >
                <ReactQuill
                  ref={richEditorRef}
                  theme="snow"
                  value={form.descriptionContent}
                  onChange={handleDescriptionContentChange}
                  modules={descriptionEditorModules}
                  formats={DESCRIPTION_EDITOR_FORMATS}
                  placeholder="Describe your business, services, audience, location, and value in detail. Add up to 2 images, or 1 image and 1 video."
                />
              </Box>
              {(formErrors.descriptionContent || uploadingDescriptionMedia) && (
                <Typography
                  variant="caption"
                  sx={{
                    color: uploadingDescriptionMedia
                      ? inputPalette.muted
                      : inputPalette.danger,
                    mt: 0.75,
                    display: "block",
                    fontSize: "0.85rem",
                  }}
                >
                  {uploadingDescriptionMedia
                    ? "Uploading description media..."
                    : formErrors.descriptionContent}
                </Typography>
              )}
              <Typography
                variant="caption"
                sx={{
                  color:
                    descriptionWordCount < MIN_DESCRIPTION_WORDS ||
                    descriptionWordCount > MAX_DESCRIPTION_WORDS
                      ? inputPalette.danger
                      : inputPalette.muted,
                  mt: 0.75,
                  display: "block",
                  textAlign: "right",
                  fontSize: "0.85rem",
                }}
                data-testid="word-counter"
              >
                {descriptionWordCount} words. Required: {MIN_DESCRIPTION_WORDS}-{MAX_DESCRIPTION_WORDS}.
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
                  error={Boolean(formErrors.businessCategory)}
                  helperText={formErrors.businessCategory}
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
              error={Boolean(formErrors.phone)}
              helperText={formErrors.phone}
            />

            <DashboardInput
              label="Email"
              value={form.email}
              onChange={handleFieldChange("email")}
              placeholder="contact@business.com"
              type="email"
              error={Boolean(formErrors.email)}
              helperText={formErrors.email}
            />

            <DashboardInput
              label="Full Address"
              value={form.fullAddress}
              onChange={handleFieldChange("fullAddress")}
              placeholder="123 Business St, City, State 12345"
              error={Boolean(formErrors.fullAddress)}
              helperText={formErrors.fullAddress}
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
                error={Boolean(formErrors.city)}
                helperText={formErrors.city}
              />
              <DashboardInput
                label="Region"
                value={form.region}
                onChange={handleFieldChange("region")}
                placeholder="State or region"
                error={Boolean(formErrors.region)}
                helperText={formErrors.region}
              />
              <DashboardInput
                label="Country"
                value={form.country}
                onChange={handleFieldChange("country")}
                placeholder="Country"
                error={Boolean(formErrors.country)}
                helperText={formErrors.country}
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
                error={Boolean(formErrors.tags)}
                helperText={formErrors.tags}
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
