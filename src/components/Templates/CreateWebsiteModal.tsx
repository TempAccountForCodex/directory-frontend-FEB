/**
 * CreateWebsiteModal (Step 3.5.2 + 10.7.7)
 *
 * Three-step website creation wizard using the existing creation and listing flows.
 * Steps: 1) Name & Domain  2) AI Content  3) Directory Listing
 */

import React, { useState, useCallback, useEffect, useRef } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Autocomplete, {
  createFilterOptions,
} from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import Fade from "@mui/material/Fade";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { alpha } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import {
  X,
  Check,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Sun,
  Moon,
} from "lucide-react";
import { apiClient } from "../../api/client";
import { type TemplateSummary } from "../../templates/templateApi";
import { useTheme as useCustomTheme } from "../../context/ThemeContext";
import DashboardInput from "../Dashboard/shared/DashboardInput";
import ListingOptInStep from "../WebsiteEditor/ListingOptInStep";
import CategorySelect from "./CategorySelect";
import { storeWebsiteFrontendTemplateId } from "../../templates/frontendTemplatePersistence";
import {
  buildFrontendTemplateEditorPages,
  supportsFrontendTemplateEditor,
  type TemplateEditorBlock,
  type TemplateEditorPage,
} from "../../templates/frontendTemplateEditorSupport";
import { buildFrontendTemplateBusinessData } from "../../templates/frontendTemplateSiteData";

const AI_TONES = [
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly" },
  { value: "luxury", label: "Luxury" },
  { value: "bold", label: "Bold" },
  { value: "playful", label: "Playful" },
];

const AI_GOALS = [
  { value: "leads", label: "Get leads / enquiries" },
  { value: "calls", label: "Drive phone calls" },
  { value: "bookings", label: "Take bookings" },
  { value: "sales", label: "Sell products" },
  { value: "portfolio", label: "Showcase a portfolio" },
];

const TARGET_AUDIENCE_OPTIONS = [
  "Local families",
  "Young professionals",
  "Small businesses",
  "Students",
  "Parents",
  "Homeowners",
  "Entrepreneurs",
  "Corporate teams",
  "Online shoppers",
  "Tourists and visitors",
];

const targetAudienceFilter = createFilterOptions<string>();
const ADD_AUDIENCE_PREFIX = "__add_target_audience__";

const STEPS = [
  "Name & Domain",
  "AI Content",
  "Directory Listing",
];

const ACCENT = "#378C92";
const ACCENT_LIGHT = "#4FA8AE";
const ACCENT_BRIGHT = "#5BB8BE";
const ACCENT_DARK = "#2C6F74";
const REQUIRED_COLOR = "#ff6b6b";

const requiredLabel = (label: string) => (
  <>
    {label}{" "}
    <Box component="span" sx={{ color: REQUIRED_COLOR }}>
      *
    </Box>
  </>
);

const getModalColors = (mode: "light" | "dark") =>
  mode === "dark"
    ? {
        paperBg: "rgba(18,20,21,0.88)",
        paperBlur: "blur(30px)",
        paperBorder: "rgba(255,255,255,0.1)",
        paperShadow:
          "0 25px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.05)",
        headerBg: "rgba(24,24,27,0.76)",
        bodyBg: "rgba(10,18,19,0.88)",
        line: "rgba(255,255,255,0.11)",
        stepperBg: "rgba(18,20,21,0.84)",
        stepConnector: "rgba(255,255,255,0.08)",
        inactiveBg: "#18181b",
        inactiveBorder: "rgba(255,255,255,0.1)",
        inactiveText: "rgba(255,255,255,0.3)",
        text: "#fff",
        textSecondary: "rgba(255,255,255,0.9)",
        textMuted: "rgba(255,255,255,0.5)",
        inputPlaceholder: "rgba(255,255,255,0.35)",
        textDim: "rgba(255,255,255,0.6)",
        inputBg: "#202627",
        inputBorder: "rgba(255,255,255,0.13)",
        inputHover: "rgba(255,255,255,0.2)",
        panelBg: `linear-gradient(135deg, ${alpha(ACCENT, 0.15)}, ${alpha(ACCENT, 0.03)})`,
        panelBorder: alpha(ACCENT, 0.3),
        footerBg: "rgba(8,10,11,0.86)",
        softButton: "rgba(255,255,255,0.05)",
        softButtonBorder: "rgba(255,255,255,0.1)",
        chipBg: "rgba(255,255,255,0.05)",
        chipBorder: "rgba(255,255,255,0.1)",
        hexBg: "rgba(255,255,255,0.05)",
      }
    : {
        paperBg: "rgba(255,255,255,0.96)",
        paperBlur: "blur(20px)",
        paperBorder: "rgba(0,0,0,0.08)",
        paperShadow: "0 25px 80px rgba(0,0,0,0.12)",
        headerBg: "rgba(255,255,255,0.7)",
        bodyBg: "rgba(255,255,255,0.96)",
        line: "rgba(0,0,0,0.07)",
        stepperBg: "rgba(248,250,250,0.8)",
        stepConnector: "rgba(0,0,0,0.1)",
        inactiveBg: "#fff",
        inactiveBorder: "rgba(0,0,0,0.15)",
        inactiveText: "rgba(0,0,0,0.35)",
        text: "#111",
        textSecondary: "#1a1a1a",
        textMuted: "rgba(0,0,0,0.5)",
        inputPlaceholder: "rgba(0,0,0,0.35)",
        textDim: "rgba(0,0,0,0.55)",
        inputBg: "rgba(0,0,0,0.04)",
        inputBorder: "rgba(0,0,0,0.15)",
        inputHover: "rgba(0,0,0,0.3)",
        panelBg: `linear-gradient(135deg, ${alpha(ACCENT, 0.08)}, ${alpha(ACCENT, 0.02)})`,
        panelBorder: alpha(ACCENT, 0.25),
        footerBg: "rgba(248,250,250,0.9)",
        softButton: "rgba(0,0,0,0.04)",
        softButtonBorder: "rgba(0,0,0,0.1)",
        chipBg: alpha(ACCENT, 0.08),
        chipBorder: alpha(ACCENT, 0.2),
        hexBg: alpha(ACCENT, 0.08),
      };

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const HERO_SUBHEADING_MAX_LENGTH = 160;

const resolveFrontendTemplateId = (templateId: string): string => {
  if (supportsFrontendTemplateEditor(templateId)) return templateId;

  const catalogId = templateId.startsWith("static-")
    ? templateId.slice("static-".length)
    : templateId;

  return supportsFrontendTemplateEditor(catalogId) ? catalogId : templateId;
};

const TEMPLATE_MEDIA_FIELD_NAMES = new Set([
  "backgroundImage",
  "backgroundImageUrl",
  "backgroundVideo",
  "backgroundVideoUrl",
  "contactImage",
  "heroImage",
  "heroImageSecondary",
  "image",
  "imageUrl",
  "logo",
  "photo",
  "poster",
  "videoPoster",
  "videoUrl",
]);

const normalizeTemplateMediaUrl = (value: unknown): unknown => {
  if (typeof value !== "string") return value;

  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  if (
    !/^(?:\/|\.\/|\.\.\/)/.test(trimmed) ||
    typeof window === "undefined"
  ) return undefined;

  return new URL(trimmed, window.location.origin).href;
};

const normalizeTemplateMediaUrls = (
  value: unknown,
  fieldName = "",
): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeTemplateMediaUrls(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .map(([key, nested]) => [
          key,
          normalizeTemplateMediaUrls(nested, key),
        ] as const)
        .filter(([, nested]) => nested !== undefined),
    );
  }

  return TEMPLATE_MEDIA_FIELD_NAMES.has(fieldName)
    ? normalizeTemplateMediaUrl(value)
    : value;
};

const clampText = (value: unknown, maxLength: number) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }
  return trimmed.slice(0, maxLength).trimEnd();
};

const normalizeCreationBlockContent = (
  blockType: string,
  content: Record<string, unknown>,
) => {
  const normalizedContent = normalizeTemplateMediaUrls(
    content,
  ) as Record<string, unknown>;

  if (blockType !== "HERO") {
    return normalizedContent;
  }

  return {
    ...normalizedContent,
    subheading: clampText(
      normalizedContent.subheading,
      HERO_SUBHEADING_MAX_LENGTH,
    ),
  };
};

/** Slugify a name for subdomain use */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 63);
}

const hasValidGalleryImages = (content: Record<string, unknown>): boolean => {
  const images = content?.images;
  return (
    Array.isArray(images) &&
    images.length > 0 &&
    images.some(
      (img: unknown) =>
        typeof (img as any)?.image === "string" &&
        (img as any).image.trim() !== "",
    )
  );
};

const serializeTemplatePagesForCreation = (pages: TemplateEditorPage[]) =>
  pages.map((page, pageIndex) => ({
    title: page.title,
    path: page.path,
    isHome: page.isHome,
    sortOrder: page.sortOrder ?? pageIndex,
    isPublished: page.isPublished ?? true,
    blocks: (page.blocks || [])
      .filter((block) => {
        if (block.blockType === "GALLERY") {
          return hasValidGalleryImages(block.content || {});
        }
        return true;
      })
      .map((block, blockIndex) => ({
        blockType: block.blockType,
        type: block.blockType,
        content: normalizeCreationBlockContent(
          block.blockType,
          (block.content || {}) as Record<string, unknown>,
        ),
        sortOrder: block.sortOrder ?? blockIndex,
        isVisible: block.isVisible ?? true,
      })),
  }));

const buildFallbackFrontendTemplatePages = (
  templateId: string,
  websiteName: string,
  primaryColor: string,
): TemplateEditorPage[] => {
  const data = buildFrontendTemplateBusinessData(templateId, {
    name: websiteName,
    businessName: websiteName,
    primaryColor,
    themeSettings: { primaryColor },
  });

  if (!data) {
    return [];
  }

  const featureItems =
    (data.features || []).slice(0, 6).map((feature, index) => ({
      title: feature?.title || `Feature ${index + 1}`,
      description: feature?.description || "",
      icon: feature?.icon || `feature-${index + 1}`,
    })) || [];

  const serviceItems =
    (data.services || []).slice(0, 6).map((service, index) => ({
      title: service?.name || `Service ${index + 1}`,
      description: service?.description || "",
      icon: `service-${index + 1}`,
    })) || [];

  const productItems =
    (data.products || []).slice(0, 6).map((product, index) => ({
      title: product?.name || `Product ${index + 1}`,
      description:
        product?.description || product?.price || product?.category || "",
      icon: `product-${index + 1}`,
    })) || [];

  const articleItems =
    (data.blogPosts || []).slice(0, 6).map((post, index) => ({
      title: post?.title || `Article ${index + 1}`,
      description: post?.description || "",
      icon: post?.category || `article-${index + 1}`,
    })) || [];

  const galleryImages =
    (data.portfolioItems || []).slice(0, 6).map((item, index) => ({
      image: item?.image || "",
      alt: item?.title || `Gallery image ${index + 1}`,
      caption: item?.description || item?.category || "",
    })) || [];

  const testimonialItems =
    (data.reviews || []).slice(0, 3).map((review, index) => ({
      quote: review?.text || review?.comment || "",
      author: review?.author || review?.name || `Client ${index + 1}`,
      position: review?.role || "",
    })) || [];

  const statsItems =
    (data.stats || []).slice(0, 4).map((stat, index) => ({
      value: stat?.value || "",
      label: stat?.label || `Metric ${index + 1}`,
    })) || [];

  const blocks: TemplateEditorBlock[] = [
    {
      id: `${templateId}-home-hero`,
      blockType: "HERO",
      sortOrder: 0,
      isVisible: true,
      content: {
        editorLabel: "Hero",
        heading: data.tagline || data.name || websiteName,
        body: data.description || "",
        buttonText: "Get started",
      },
    },
  ];

  const supportingItems =
    featureItems.length > 0
      ? featureItems
      : serviceItems.length > 0
        ? serviceItems
        : productItems.length > 0
          ? productItems
          : articleItems;

  if (supportingItems.length > 0) {
    blocks.push({
      id: `${templateId}-home-features`,
      blockType: "FEATURES",
      sortOrder: blocks.length,
      isVisible: true,
      content: {
        editorLabel: "Highlights",
        heading: "Highlights",
        features: supportingItems,
      },
    });
  }

  if (galleryImages.some((item) => item.image)) {
    blocks.push({
      id: `${templateId}-home-gallery`,
      blockType: "GALLERY",
      sortOrder: blocks.length,
      isVisible: true,
      content: {
        editorLabel: "Gallery",
        heading: "Gallery",
        images: galleryImages.filter((item) => item.image),
      },
    });
  }

  if (statsItems.length > 0) {
    blocks.push({
      id: `${templateId}-home-stats`,
      blockType: "STATS",
      sortOrder: blocks.length,
      isVisible: true,
      content: {
        editorLabel: "Stats",
        heading: "Key numbers",
        items: statsItems,
      },
    });
  }

  if (testimonialItems.length > 0) {
    blocks.push({
      id: `${templateId}-home-testimonials`,
      blockType: "TESTIMONIALS",
      sortOrder: blocks.length,
      isVisible: true,
      content: {
        editorLabel: "Testimonials",
        heading: "What clients say",
        testimonials: testimonialItems,
      },
    });
  }

  blocks.push({
    id: `${templateId}-home-contact`,
    blockType: "CONTACT",
    sortOrder: blocks.length,
    isVisible: true,
    content: {
      editorLabel: "Contact",
      heading: "Get in touch",
      body:
        data.description || "Reach out and we will get back to you shortly.",
      email: data.contact?.email || "hello@yourcompany.com",
      phone: data.contact?.phone || "",
      address: data.contact?.address || data.location?.address || "",
      formTitle: "Send a message",
      fullNamePlaceholder: "Full name",
      emailPlaceholder: "Email address",
      messagePlaceholder: "Message",
      buttonText: "Contact us",
    },
  });

  return [
    {
      id: `${templateId}-page-home`,
      title: "Home",
      path: "/",
      isHome: true,
      sortOrder: 0,
      isPublished: true,
      localOnly: true,
      blocks,
    },
  ];
};

const buildFrontendTemplateCreationPages = (
  templateId: string,
  websiteName: string,
  primaryColor: string,
): TemplateEditorPage[] => {
  const seededPages = buildFrontendTemplateEditorPages(templateId, {
    name: websiteName,
    businessName: websiteName,
    primaryColor,
    themeSettings: { primaryColor },
  });

  return seededPages.length > 0
    ? seededPages
    : buildFallbackFrontendTemplatePages(templateId, websiteName, primaryColor);
};

type SubdomainStatus =
  | "idle"
  | "checking"
  | "available"
  | "taken"
  | "invalid"
  | "error";

/** Questionnaire the modal hands to the editor's AI draft flow. */
export interface CreateWebsiteAIDraftIntent {
  aiDraft: true;
  questionnaireData: Record<string, unknown>;
}

interface CreateWebsiteModalProps {
  open: boolean;
  template: TemplateSummary | null;
  onClose: () => void;
  /**
   * Called after creation completes. When the user chose "Generate with AI",
   * `intent.aiDraft` is true and `intent.questionnaireData` carries the answers
   * so the parent can route into the editor's AI draft flow.
   */
  onSuccess: (websiteId: number, intent?: CreateWebsiteAIDraftIntent) => void;
  planCode?: string;
}

const CreateWebsiteModal = React.memo(function CreateWebsiteModal({
  open,
  template,
  onClose,
  onSuccess,
  planCode = "website_free",
}: CreateWebsiteModalProps) {
  const muiTheme = useTheme();
  const { actualTheme } = useCustomTheme();
  const [modalMode, setModalMode] = useState<"light" | "dark">(actualTheme);
  const modalColors = getModalColors(modalMode);
  const isFullScreen = useMediaQuery(muiTheme.breakpoints.down("sm"));

  // Wizard state
  const [activeStep, setActiveStep] = useState(0);
  const [websiteName, setWebsiteName] = useState("");
  const [businessCategory, setBusinessCategory] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [subdomainStatus, setSubdomainStatus] =
    useState<SubdomainStatus>("idle");
  const [subdomainError, setSubdomainError] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#378C92");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [createdWebsiteId, setCreatedWebsiteId] = useState<number | null>(null);

  // AI draft questionnaire (optional). Filled on the Customize step; used only
  // when the user creates with "Generate with AI".
  const [aiShortDescription, setAiShortDescription] = useState("");
  const [aiServices, setAiServices] = useState("");
  const [aiTone, setAiTone] = useState("");
  const [aiGoal, setAiGoal] = useState("leads");
  const [aiTargetAudience, setAiTargetAudience] = useState<string[]>([]);
  const [aiContactInfo, setAiContactInfo] = useState("");
  const [aiLocation, setAiLocation] = useState("");
  const [aiInstructions, setAiInstructions] = useState("");
  // Remembers whether the current create was launched via "Generate with AI" so
  // the post-creation handoff routes into the editor draft flow.
  const aiRequestedRef = useRef(false);

  // Debounce timer ref
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (open) {
      setModalMode(actualTheme);
      setActiveStep(0);
      setWebsiteName("");
      setBusinessCategory("");
      setSubdomain("");
      setSubdomainStatus("idle");
      setSubdomainError("");
      setPrimaryColor("#378C92");
      setCreating(false);
      setError("");
      setCreatedWebsiteId(null);
      setAiShortDescription("");
      setAiServices("");
      setAiTone("");
      setAiGoal("leads");
      setAiTargetAudience([]);
      setAiContactInfo("");
      setAiLocation("");
      setAiInstructions("");
      aiRequestedRef.current = false;
    }
  }, [actualTheme, open]);

  // Subdomain validation regex
  const subdomainRegex = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
  const isValidSubdomain = (val: string) =>
    val.length >= 3 && val.length <= 63 && subdomainRegex.test(val);

  // Check subdomain availability
  const checkSubdomain = useCallback(async (value: string) => {
    if (!value || value.length < 3) {
      setSubdomainStatus("idle");
      setSubdomainError("");
      return;
    }
    if (!isValidSubdomain(value)) {
      setSubdomainStatus("invalid");
      setSubdomainError(
        "Only lowercase letters, numbers, and hyphens (3-63 chars)",
      );
      return;
    }
    setSubdomainStatus("checking");
    setSubdomainError("");
    try {
      const res = await apiClient.get(
        `/domains/check-availability?subdomain=${encodeURIComponent(value)}`,
      );

      const payload =
        res.data && typeof res.data === "object" && "data" in res.data
          ? (res.data.data as { available?: boolean } | null)
          : (res.data as { available?: boolean } | null);

      if (payload?.available === true) {
        setSubdomainStatus("available");
        setSubdomainError("");
      } else if (payload?.available === false) {
        setSubdomainStatus("taken");
        setSubdomainError(`${value}.techietribe.app is taken`);
      } else {
        setSubdomainStatus("error");
        setSubdomainError(
          "Could not verify availability right now. Please try again.",
        );
      }
    } catch {
      setSubdomainStatus("error");
      setSubdomainError("Unable to verify availability. Please try again.");
    }
  }, []);

  // Debounced subdomain check
  const handleSubdomainChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
      setSubdomain(val);
      setSubdomainStatus("idle");

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        checkSubdomain(val);
      }, 500);
    },
    [checkSubdomain],
  );

  // Auto-generate subdomain from name
  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setWebsiteName(val);
      const slug = slugify(val);
      setSubdomain(slug);
      setSubdomainStatus("idle");

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        checkSubdomain(slug);
      }, 500);
    },
    [checkSubdomain],
  );

  // Step 1 -> Step 2. Availability is already kept current by the debounced check.
  const handleNext = useCallback(() => {
    setActiveStep((prev) => prev + 1);
  }, []);

  const handleBack = useCallback(() => {
    setActiveStep((prev) => prev - 1);
  }, []);

  // Create website. `useAI` records whether to run the AI draft after creation.
  const handleCreate = useCallback(
    async (useAI = false) => {
      aiRequestedRef.current = useAI;
      if (!template) return;
      if (subdomainStatus !== "available") {
        setError("Please verify subdomain availability before creating.");
        return;
      }
      setCreating(true);
      setError("");

      try {
        const isDbTemplateId = UUID_REGEX.test(template.id);
        const frontendTemplateId = resolveFrontendTemplateId(template.id);
        let res;

        if (isDbTemplateId) {
          res = await apiClient.post(`/websites/from-template`, {
            templateId: template.id,
            name: websiteName.trim(),
            subdomain: subdomain.trim(),
            customization: {
              primaryColor,
            },
          });
        } else if (supportsFrontendTemplateEditor(frontendTemplateId)) {
          const creationPages = buildFrontendTemplateCreationPages(
            frontendTemplateId,
            websiteName.trim(),
            primaryColor,
          );

          if (creationPages.length === 0) {
            setError(
              "Selected template is missing frontend setup. Please choose another template.",
            );
            return;
          }

          const customPages = serializeTemplatePagesForCreation(creationPages);

          res = await apiClient.post(`/websites`, {
            name: websiteName.trim(),
            slug: subdomain.trim(),
            primaryColor,
            isPublic: true,
            frontendTemplateId,
            customPages,
            templateSnapshot: {
              templateId: frontendTemplateId,
              version: 1,
              themeSettings: {
                primaryColor,
              },
              pages: customPages,
            },
          });
        } else {
          try {
            res = await apiClient.post(`/websites/from-template`, {
              frontendTemplateId: template.id,
              name: websiteName.trim(),
              subdomain: subdomain.trim(),
              customization: {
                primaryColor,
              },
            });
          } catch (err: any) {
            const backendMessage =
              err?.response?.data?.message || err?.message || "";
            const shouldUseFrontendFallback =
              /frontend template not found/i.test(String(backendMessage));

            if (!shouldUseFrontendFallback) {
              throw err;
            }

            const creationPages = buildFrontendTemplateCreationPages(
              frontendTemplateId,
              websiteName.trim(),
              primaryColor,
            );

            if (creationPages.length === 0) {
              setError(
                "Selected template is missing frontend setup. Please choose another template.",
              );
              return;
            }

            const customPages =
              serializeTemplatePagesForCreation(creationPages);

            res = await apiClient.post(`/websites`, {
              name: websiteName.trim(),
              slug: subdomain.trim(),
              primaryColor,
              isPublic: true,
              frontendTemplateId,
              customPages,
              templateSnapshot: {
                templateId: frontendTemplateId,
                version: 1,
                themeSettings: {
                  primaryColor,
                },
                pages: customPages,
              },
            });
          }
        }

        const createdWebsiteId =
          res?.data?.data?.id || res?.data?.website?.id || null;

        if (res?.data?.success !== false && createdWebsiteId) {
          if (!isDbTemplateId) {
            storeWebsiteFrontendTemplateId(
              createdWebsiteId,
              frontendTemplateId,
            );
          }
          setCreatedWebsiteId(createdWebsiteId);
        setActiveStep(2);
        } else {
          setError(res?.data?.message || "Failed to create website");
        }
      } catch (err: any) {
        const msg =
          err.response?.data?.message ||
          err.message ||
          "Failed to create website";
        setError(msg);
      } finally {
        setCreating(false);
      }
    },
    [
      template,
      websiteName,
      businessCategory,
      subdomain,
      primaryColor,
      subdomainStatus,
    ],
  );

  // Called after the directory listing opt-in step finishes (complete or skip).
  const finishCreation = useCallback(async () => {
    if (createdWebsiteId == null) return;

    // AI path: hand the questionnaire up so the parent routes into the editor,
    // which runs the preview-only AI draft (nothing persists until the user saves).
    if (aiRequestedRef.current) {
      const trimmedServices = aiServices.trim();
      const servicesArray = trimmedServices
        ? trimmedServices
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

      const questionnaireData = {
        businessName: websiteName.trim(),
        category: businessCategory,
        primaryGoal: aiGoal || "leads",
        contactInfo: aiContactInfo.trim() || undefined,
        location: aiLocation.trim() || undefined,
        shortDescription: aiShortDescription.trim() || undefined,
        targetAudience:
          aiTargetAudience.length > 0
            ? aiTargetAudience.join(", ")
            : undefined,
        servicesOrProducts: servicesArray.length ? servicesArray : undefined,
        tone: aiTone || undefined,
        preferredColorsOrStyleNotes: `Primary brand color ${primaryColor}`,
        aiInstructions: aiInstructions.trim() || undefined,
      };
      onSuccess(createdWebsiteId, { aiDraft: true, questionnaireData });
      return;
    }

    onSuccess(createdWebsiteId);
  }, [
    createdWebsiteId,
    onSuccess,
    websiteName,
    businessCategory,
    aiShortDescription,
    aiServices,
    aiTone,
    aiGoal,
    aiTargetAudience,
    aiContactInfo,
    aiLocation,
    aiInstructions,
    primaryColor,
  ]);

  // Validation
  const nameValid = websiteName.trim().length >= 3;
  const categoryValid = businessCategory.trim().length > 0;
  const subdomainReady = subdomainStatus === "available";
  const canProceedStep0 = nameValid && categoryValid && subdomainReady;

  // Subdomain adornment icon
  const subdomainIcon = (() => {
    switch (subdomainStatus) {
      case "checking":
        return <CircularProgress size={16} />;
      case "available":
        return <CheckCircle size={16} color="#16a34a" />;
      case "taken":
        return <XCircle size={16} color="#dc2626" />;
      case "invalid":
        return <AlertTriangle size={16} color="#f59e0b" />;
      case "error":
        return <AlertTriangle size={16} color="#f59e0b" />;
      default:
        return null;
    }
  })();

  // Suggestion chips when taken
  const suggestions =
    subdomainStatus === "taken"
      ? [`${subdomain}2`, `${subdomain}-app`, `${subdomain}-site`]
      : [];

  const fieldStyles = {
    "& .MuiOutlinedInput-root": {
      backgroundColor: `${modalColors.inputBg} !important`,
      borderRadius: "10px",
      color: `${modalColors.text} !important`,
      "& fieldset": { borderColor: `${modalColors.inputBorder} !important` },
      "&:hover fieldset": {
        borderColor: `${modalColors.inputHover} !important`,
      },
      "&.Mui-focused fieldset": {
        borderColor: `${ACCENT_LIGHT} !important`,
        boxShadow: `0 0 0 3px ${alpha(ACCENT, 0.2)}`,
      },
    },
    "& label, & .dashboard-input-label, & .MuiFormLabel-root, & .MuiInputLabel-root": {
      color: `${modalColors.textSecondary} !important`,
    },
    "& .MuiInputBase-input, & textarea": {
      color: `${modalColors.text} !important`,
      WebkitTextFillColor: `${modalColors.text} !important`,
    },
    "& .MuiInputBase-input::placeholder, & textarea::placeholder": {
      color: `${modalColors.inputPlaceholder} !important`,
      WebkitTextFillColor: `${modalColors.inputPlaceholder} !important`,
      opacity: "1 !important",
    },
    "& .MuiAutocomplete-popupIndicator, & .MuiAutocomplete-clearIndicator, & .MuiSelect-icon": {
      color: `${modalColors.textMuted} !important`,
    },
    "& .MuiFormHelperText-root": { ml: 0 },
  };

  const selectMenuProps = {
    PaperProps: {
      sx: {
        mt: 0.75,
        bgcolor: modalMode === "dark" ? "#142021" : "#ffffff",
        backgroundImage: "none",
        border: `1px solid ${modalColors.inputBorder}`,
        borderRadius: "10px",
        boxShadow: modalColors.paperShadow,
        color: modalColors.textSecondary,
        "& .MuiMenuItem-root": {
          minHeight: 40,
          fontSize: "0.92rem",
          "&:hover": { bgcolor: alpha(ACCENT, 0.16) },
          "&.Mui-selected": {
            bgcolor: alpha(ACCENT, 0.22),
            color: ACCENT_BRIGHT,
            "&:hover": { bgcolor: alpha(ACCENT, 0.28) },
          },
        },
      },
    },
  };

  const softButtonSx = {
    color: modalColors.text,
    bgcolor: modalColors.softButton,
    border: `1px solid ${modalColors.softButtonBorder}`,
    borderRadius: "10px",
    px: 2,
    textTransform: "none",
    fontWeight: 600,
    "&:hover": {
      bgcolor: alpha(ACCENT, 0.12),
      borderColor: alpha(ACCENT, 0.3),
    },
  };

  const primaryButtonSx = {
    color: "#fff",
    borderRadius: "10px",
    px: 2.25,
    textTransform: "none",
    fontWeight: 600,
    background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT_DARK})`,
    boxShadow: `0 0 20px ${alpha(ACCENT, 0.35)}`,
    "&:hover": {
      background: `linear-gradient(90deg, ${ACCENT_LIGHT}, ${ACCENT})`,
      boxShadow: `0 0 30px ${alpha(ACCENT, 0.55)}`,
    },
    "&.Mui-disabled": {
      color: alpha("#fff", 0.5),
      background: alpha(ACCENT, 0.35),
      boxShadow: "none",
    },
  };

  const CustomStepIcon = ({ active, completed, icon }: any) => (
    <Box
      sx={{
        width: 40,
        height: 40,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 600,
        fontSize: 15,
        border: "2px solid",
        transition: "all 0.3s ease",
        ...(completed
          ? {
              background: `linear-gradient(135deg, ${ACCENT_LIGHT}, ${ACCENT_DARK})`,
              borderColor: "transparent",
              color: "#fff",
              boxShadow: `0 0 16px ${alpha(ACCENT, 0.35)}`,
            }
          : active
            ? {
                bgcolor: modalColors.inactiveBg,
                borderColor: ACCENT_LIGHT,
                color: ACCENT_BRIGHT,
                boxShadow: `0 0 15px ${alpha(ACCENT, 0.45)}`,
              }
            : {
                bgcolor: modalColors.inactiveBg,
                borderColor: modalColors.inactiveBorder,
                color: modalColors.inactiveText,
              }),
      }}
    >
      {completed ? <Check size={20} /> : icon}
    </Box>
  );

  return (
    <Dialog
      open={open}
      onClose={creating ? undefined : onClose}
      maxWidth={false}
      fullWidth
      fullScreen={isFullScreen}
      TransitionComponent={Fade}
      aria-labelledby="create-website-title"
      PaperProps={{
        sx: {
          width: "100%",
          maxWidth: 720,
          height: { xs: "100%", sm: 730 },
          maxHeight: { xs: "100%", sm: "calc(100vh - 48px)" },
          m: { xs: 0, sm: 3 },
          display: "flex",
          flexDirection: "column",
          backgroundColor: modalColors.paperBg,
          backgroundImage: "none",
          border: `1px solid ${modalColors.paperBorder}`,
          borderRadius: { xs: 0, sm: "18px" },
          backdropFilter: modalColors.paperBlur,
          WebkitBackdropFilter: modalColors.paperBlur,
          boxShadow: modalColors.paperShadow,
          isolation: "isolate",
          overflow: "hidden",
        },
      }}
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor:
              modalMode === "dark"
                ? "rgba(4,8,9,0.68)"
                : "rgba(238,242,243,0.88)",
            backdropFilter: "blur(10px)",
          },
        },
      }}
    >
      <DialogTitle
        id="create-website-title"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: { xs: 3, sm: 4 },
          py: 2.5,
          color: modalColors.text,
          bgcolor: modalColors.headerBg,
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${modalColors.line}`,
          flex: "0 0 auto",
        }}
      >
        <Stack direction="row" alignItems="center" gap={1.5}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              background: `linear-gradient(135deg, ${ACCENT_LIGHT}, ${ACCENT_DARK})`,
              boxShadow: `0 0 14px ${alpha(ACCENT, 0.4)}`,
            }}
          >
            <AutoAwesomeIcon sx={{ fontSize: 16, color: "#fff" }} />
          </Box>
          <Typography variant="h6" fontWeight={600} sx={{ letterSpacing: 0 }}>
            Create Website
          </Typography>
        </Stack>
        <Stack direction="row" alignItems="center" gap={0.5}>
          <IconButton
            aria-label="toggle modal theme"
            onClick={() =>
              setModalMode((mode) => (mode === "dark" ? "light" : "dark"))
            }
            size="small"
            sx={{
              color: modalColors.textMuted,
              bgcolor: modalColors.softButton,
              width: 32,
              height: 32,
              "&:hover": { color: ACCENT_BRIGHT },
            }}
          >
            {modalMode === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </IconButton>
          <IconButton
            aria-label="close"
            onClick={onClose}
            disabled={creating}
            size="small"
            sx={{ color: modalColors.textMuted, width: 32, height: 32 }}
          >
            <X size={18} />
          </IconButton>
        </Stack>
      </DialogTitle>

      <Box
        sx={{
          px: { xs: 2, sm: 4 },
          py: 3,
          bgcolor: modalColors.stepperBg,
          backdropFilter: "blur(10px)",
          borderBottom: `1px solid ${modalColors.line}`,
          overflowX: "auto",
          flex: "0 0 auto",
        }}
      >
        <Stepper
          activeStep={activeStep}
          alternativeLabel
          sx={{
            minWidth: 420,
            "& .MuiStepConnector-line": {
              borderColor: modalColors.stepConnector,
              borderTopWidth: 2,
            },
            "& .MuiStepConnector-root.Mui-active .MuiStepConnector-line, & .MuiStepConnector-root.Mui-completed .MuiStepConnector-line":
              { borderColor: alpha(ACCENT, 0.4) },
            "& .MuiStepLabel-label": {
              color: modalColors.inactiveText,
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              mt: 1.2,
            },
            "& .MuiStepLabel-label.Mui-active": { color: ACCENT_BRIGHT },
            "& .MuiStepLabel-label.Mui-completed": {
              color: modalColors.textSecondary,
            },
          }}
        >
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel StepIconComponent={CustomStepIcon}>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <DialogContent
        sx={{
          flex: "1 1 auto",
          overflowY: "auto",
          p: { xs: 2.5, sm: 3 },
          color: modalColors.text,
          bgcolor: modalColors.bodyBg,
          backdropFilter: "blur(8px)",
        }}
      >
        <Box sx={{ maxWidth: 560, mx: "auto", ...fieldStyles }}>
          {activeStep === 0 && (
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              flexWrap="wrap"
              gap={1.5}
              mb={2.5}
            >
              <Chip
                icon={
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      bgcolor: ACCENT_BRIGHT,
                      boxShadow: `0 0 8px ${alpha(ACCENT_BRIGHT, 0.8)}`,
                      ml: 1,
                    }}
                  />
                }
                label={`Template: ${template?.name || "Selected template"}`}
                sx={{
                  bgcolor: modalColors.chipBg,
                  border: `1px solid ${modalColors.chipBorder}`,
                  color: ACCENT_BRIGHT,
                  fontWeight: 500,
                  fontSize: 12,
                  height: 30,
                }}
              />
              <Stack direction="row" alignItems="center" gap={1}>
                <Typography
                  variant="body2"
                  fontWeight={500}
                  sx={{ fontSize: 12, color: modalColors.textDim }}
                >
                  Primary Color
                </Typography>
                <Box
                  component="label"
                  sx={{
                    width: 26,
                    height: 26,
                    borderRadius: "8px",
                    bgcolor: primaryColor,
                    border: `2px solid ${modalColors.inputBorder}`,
                    overflow: "hidden",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(event) => setPrimaryColor(event.target.value)}
                    aria-label="Primary color"
                    style={{ opacity: 0, width: 32, height: 32 }}
                  />
                </Box>
                <Box
                  sx={{
                    px: 1.25,
                    py: 0.5,
                    bgcolor: modalColors.hexBg,
                    border: `1px solid ${modalColors.chipBorder}`,
                    borderRadius: "8px",
                    fontFamily: "monospace",
                    fontSize: 12,
                    color: modalColors.textSecondary,
                  }}
                >
                  {primaryColor.toUpperCase()}
                </Box>
              </Stack>
            </Stack>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          {/* Step 1: Name */}
          {activeStep === 0 && (
            <Stack gap={2}>
              <DashboardInput
                label={requiredLabel("Website Name")}
                placeholder="My Awesome Business"
                value={websiteName}
                onChange={handleNameChange}
                error={websiteName.length > 0 && !nameValid}
                helperText={
                  websiteName.length > 0 && !nameValid
                    ? "Name must be at least 3 characters"
                    : ""
                }
                autoFocus
              />
              <Box>
                <CategorySelect
                  value={businessCategory}
                  onChange={(val) => setBusinessCategory(val)}
                  required
                />
              </Box>

              <DashboardInput
                label={requiredLabel("Subdomain")}
                placeholder="my-business"
                value={subdomain}
                onChange={handleSubdomainChange}
                error={
                  subdomainStatus === "taken" ||
                  subdomainStatus === "invalid" ||
                  subdomainStatus === "error"
                }
                helperText={
                  subdomainStatus === "taken" ||
                  subdomainStatus === "invalid" ||
                  subdomainStatus === "error"
                    ? subdomainError
                    : ""
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        {subdomainIcon}
                        <Typography
                          variant="caption"
                          sx={{
                            color: modalColors.textMuted,
                            whiteSpace: "nowrap",
                          }}
                        >
                          .techietribe.app
                        </Typography>
                      </Box>
                    </InputAdornment>
                  ),
                }}
              />
              {subdomainStatus === "available" && (
                <Stack direction="row" alignItems="center" gap={0.75} mt={-1}>
                  <Check size={16} color="#22c55e" />
                  <Typography variant="body2" sx={{ color: "#22c55e" }}>
                    {subdomain}.techietribe.app is available
                  </Typography>
                </Stack>
              )}
              {suggestions.length > 0 && (
                <Stack direction="row" gap={0.75} flexWrap="wrap">
                  {suggestions.map((suggestion) => (
                    <Chip
                      key={suggestion}
                      label={suggestion}
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        setSubdomain(suggestion);
                        setSubdomainStatus("idle");
                        checkSubdomain(suggestion);
                      }}
                      sx={{
                        color: ACCENT_BRIGHT,
                        borderColor: alpha(ACCENT, 0.4),
                      }}
                    />
                  ))}
                </Stack>
              )}
              <Typography
                variant="caption"
                sx={{ color: modalColors.textMuted }}
              >
                <Box component="span" sx={{ color: REQUIRED_COLOR }}>
                  *
                </Box>{" "}
                Required fields
              </Typography>
            </Stack>
          )}

          {/* Step 2: AI content */}
          {activeStep === 1 && (
            <Box
              sx={{
                position: "relative",
                overflow: "hidden",
                borderRadius: "14px",
                border: `1px solid ${modalColors.panelBorder}`,
                background: modalColors.panelBg,
                p: { xs: 2.5, sm: 3 },
              }}
            >
              <AutoAwesomeIcon
                sx={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  fontSize: 96,
                  color: alpha(ACCENT_BRIGHT, 0.15),
                }}
              />
              <Box sx={{ position: "relative", zIndex: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 0.5,
                  }}
                >
                  <AutoAwesomeIcon
                    sx={{ fontSize: 20, color: ACCENT_BRIGHT }}
                  />
                  <Typography
                    variant="subtitle1"
                    sx={{ color: ACCENT_BRIGHT, fontWeight: 600 }}
                  >
                    Help AI draft your content (optional)
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{ color: modalColors.textDim, mb: 3, display: "block" }}
                >
                  The more you share, the better the draft. You can skip this
                  and create from the template defaults instead.
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 3,
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "rgba(5,13,14,0.58) !important",
                    },
                  }}
                >
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{ color: modalColors.textSecondary, mb: 1 }}
                    >
                      Short description
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      placeholder="What does your business do, in a sentence or two?"
                      value={aiShortDescription}
                      onChange={(event) =>
                        setAiShortDescription(event.target.value)
                      }
                      sx={{
                        "& .MuiInputBase-root": {
                          minHeight: 92,
                          alignItems: "flex-start",
                        },
                        "& textarea": { padding: "2px 0" },
                      }}
                    />
                  </Box>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{ color: modalColors.textSecondary, mb: 1 }}
                    >
                      Main services or products
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      placeholder="e.g. Bridal makeup, hair styling, spa packages"
                      value={aiServices}
                      onChange={(event) => setAiServices(event.target.value)}
                      sx={{
                        "& .MuiInputBase-root": {
                          minHeight: 92,
                          alignItems: "flex-start",
                        },
                        "& textarea": { padding: "2px 0" },
                      }}
                    />
                  </Box>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{ color: modalColors.textSecondary, mb: 1 }}
                    >
                      Target audience
                    </Typography>
                    <Autocomplete<string, true, false, true>
                      multiple
                      freeSolo
                      filterSelectedOptions
                      options={TARGET_AUDIENCE_OPTIONS}
                      value={aiTargetAudience}
                      onChange={(_event, values) => {
                        const normalizedValues = values
                          .map((value) =>
                            value.startsWith(ADD_AUDIENCE_PREFIX)
                              ? value.slice(ADD_AUDIENCE_PREFIX.length)
                              : value,
                          )
                          .map((value) => value.trim())
                          .filter(
                            (value, index, allValues) =>
                              value.length > 0 &&
                              allValues.indexOf(value) === index,
                          );
                        setAiTargetAudience(normalizedValues);
                      }}
                      filterOptions={(options, params) => {
                        const filtered = targetAudienceFilter(options, params);
                        const inputValue = params.inputValue.trim();
                        const alreadyExists = [
                          ...options,
                          ...aiTargetAudience,
                        ].some(
                          (option) =>
                            option.toLowerCase() === inputValue.toLowerCase(),
                        );

                        if (inputValue && !alreadyExists) {
                          filtered.push(`${ADD_AUDIENCE_PREFIX}${inputValue}`);
                        }

                        return filtered;
                      }}
                      getOptionLabel={(option) =>
                        option.startsWith(ADD_AUDIENCE_PREFIX)
                          ? `Add "${option.slice(ADD_AUDIENCE_PREFIX.length)}"`
                          : option
                      }
                      renderOption={(props, option) => (
                        <Box
                          component="li"
                          {...props}
                          key={option}
                          sx={{
                            color: option.startsWith(ADD_AUDIENCE_PREFIX)
                              ? ACCENT_BRIGHT
                              : modalColors.textSecondary,
                          }}
                        >
                          {option.startsWith(ADD_AUDIENCE_PREFIX)
                            ? `Add "${option.slice(ADD_AUDIENCE_PREFIX.length)}"`
                            : option}
                        </Box>
                      )}
                      renderTags={(values, getTagProps) =>
                        values.map((value, index) => {
                          const { key, ...tagProps } = getTagProps({ index });
                          return (
                            <Chip
                              key={key}
                              label={value}
                              size="small"
                              {...tagProps}
                              sx={{
                                bgcolor: alpha(ACCENT, 0.18),
                                border: `1px solid ${alpha(ACCENT_BRIGHT, 0.32)}`,
                                color: modalColors.textSecondary,
                                "& .MuiChip-deleteIcon": {
                                  color: modalColors.textMuted,
                                  "&:hover": { color: REQUIRED_COLOR },
                                },
                              }}
                            />
                          );
                        })
                      }
                      componentsProps={{
                        paper: {
                          sx: {
                            bgcolor:
                              modalMode === "dark" ? "#142021" : "#ffffff",
                            border: `1px solid ${modalColors.inputBorder}`,
                            color: modalColors.textSecondary,
                            "& .MuiAutocomplete-option:hover": {
                              bgcolor: alpha(ACCENT, 0.16),
                            },
                            "& .MuiAutocomplete-option[aria-selected='true']": {
                              bgcolor: alpha(ACCENT, 0.22),
                              color: ACCENT_BRIGHT,
                            },
                          },
                        },
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder={
                            aiTargetAudience.length === 0
                              ? "Select or add target audiences"
                              : "Add another audience"
                          }
                        />
                      )}
                    />
                  </Box>
                  <DashboardInput
                    label={requiredLabel("Contact info")}
                    placeholder="e.g. hello@yourbusiness.com / (555) 123-4567"
                    value={aiContactInfo}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setAiContactInfo(e.target.value)
                    }
                    required
                  />
                  <DashboardInput
                    label="Location"
                    placeholder="e.g. Houston, TX"
                    value={aiLocation}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setAiLocation(e.target.value)
                    }
                  />
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{ color: modalColors.textSecondary, mb: 1 }}
                    >
                      Additional AI instructions
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      placeholder="Any specific requests for the AI generation?"
                      value={aiInstructions}
                      onChange={(event) =>
                        setAiInstructions(event.target.value)
                      }
                      sx={{
                        "& .MuiInputBase-root": {
                          minHeight: 92,
                          alignItems: "flex-start",
                        },
                        "& textarea": {
                          padding: "2px 0",
                        },
                      }}
                    />
                  </Box>
                  <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                    <Box sx={{ flex: 1, minWidth: 160 }}>
                      <Typography
                        variant="body2"
                        sx={{ color: modalColors.textSecondary, mb: 1 }}
                      >
                        Tone
                      </Typography>
                      <TextField
                        select
                        fullWidth
                        value={aiTone}
                        onChange={(event) => setAiTone(event.target.value)}
                        SelectProps={{
                          displayEmpty: true,
                          MenuProps: selectMenuProps,
                        }}
                        sx={{
                          "& .MuiSelect-select": {
                            py: 1.75,
                            ...(aiTone === "" && {
                              color: `${modalColors.inputPlaceholder} !important`,
                              WebkitTextFillColor: `${modalColors.inputPlaceholder} !important`,
                            }),
                          },
                        }}
                      >
                        <MenuItem value="">Default</MenuItem>
                        {AI_TONES.map((t) => (
                          <MenuItem key={t.value} value={t.value}>
                            {t.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 160 }}>
                      <Typography
                        variant="body2"
                        sx={{ color: modalColors.textSecondary, mb: 1 }}
                      >
                        {requiredLabel("Primary goal")}
                      </Typography>
                      <TextField
                        select
                        fullWidth
                        value={aiGoal}
                        onChange={(event) => setAiGoal(event.target.value)}
                        SelectProps={{ MenuProps: selectMenuProps }}
                        sx={{
                          "& .MuiSelect-select": {
                            py: 1.75,
                            ...(aiGoal === "leads" && {
                              color: `${modalColors.inputPlaceholder} !important`,
                              WebkitTextFillColor: `${modalColors.inputPlaceholder} !important`,
                            }),
                          },
                        }}
                      >
                        {AI_GOALS.map((g) => (
                          <MenuItem key={g.value} value={g.value}>
                            {g.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Box>
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{ color: modalColors.textMuted, mt: 1 }}
                  >
                    <Box component="span" sx={{ color: REQUIRED_COLOR }}>
                      *
                    </Box>{" "}
                    Required fields
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

          {/* Step 3: Directory listing */}
          {activeStep === 2 && createdWebsiteId && (
            <Box
              sx={{
                // Theme the step's own chrome text to match the modal mode...
                "& .MuiTypography-root": { color: modalColors.text },
                // ...but hand the listing preview card back its own styling so it
                // renders and hovers exactly like the real directory card. The
                // card title/description inherit their color from the Card (white
                // by default, dark on hover), and the rating keeps its accent.
                "& [data-testid='listing-preview'] .MuiTypography-root": {
                  color: "inherit",
                },
                "& [data-testid='listing-preview'] .listing-card-rating .MuiTypography-root":
                  {
                    color: "#378b91",
                  },
                // Stretch the preview card to fill the modal width (the real card
                // caps at 400px inside its grid cell).
                "& [data-testid='listing-preview']": {
                  maxWidth: "none !important",
                  "& > *": {
                    maxWidth: "none !important",
                    scale: 0.9,
                  },
                },
              }}
            >
              <ListingOptInStep
                websiteId={createdWebsiteId}
                websiteName={websiteName}
                defaultBusinessCategory={businessCategory}
                planCode={planCode}
                onComplete={finishCreation}
                onSkip={finishCreation}
              />
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: { xs: 2.5, sm: 3 },
          py: { xs: 2.5, sm: 3 },
          gap: 1.5,
          flexWrap: "wrap",
          display: activeStep === 2 ? "none" : "flex",
          borderTop: `1px solid ${modalColors.line}`,
          bgcolor: modalColors.footerBg,
          backdropFilter: "blur(8px)",
        }}
      >
        <Button
          onClick={onClose}
          disabled={creating}
          sx={{
            color: modalColors.textMuted,
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Cancel
        </Button>

        <Box sx={{ flex: 1 }} />

        {activeStep > 0 && (
          <Button onClick={handleBack} disabled={creating} sx={softButtonSx}>
            Back
          </Button>
        )}

        {activeStep === 0 && (
          <Button
            onClick={handleNext}
            disabled={!canProceedStep0}
            sx={primaryButtonSx}
          >
            Next
          </Button>
        )}

        {activeStep === 1 && (
          <>
            <Button
              onClick={() => handleCreate(false)}
              disabled={creating}
              sx={softButtonSx}
            >
              Create without AI
            </Button>
            <Button
              onClick={() => handleCreate(true)}
              disabled={creating}
              startIcon={
                creating ? undefined : (
                  <AutoAwesomeIcon sx={{ fontSize: 16, color: "#fff" }} />
                )
              }
              sx={primaryButtonSx}
            >
              {creating ? (
                <CircularProgress size={20} sx={{ color: "#fff" }} />
              ) : (
                "Generate with AI"
              )}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
});

export default CreateWebsiteModal;
