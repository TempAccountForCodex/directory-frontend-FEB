import { useState, useEffect, useRef, useCallback, useMemo } from "react";

import { useDebouncedValue } from "../../hooks/useDebouncedValue";

import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  IconButton,
  alpha,
  Skeleton,
  Tooltip,
} from "@mui/material";

import {
  ArrowLeft,
  ChartBar,
  CircleCheck,
  Clock,
  Copy,
  Eye,
  EyeOff,
  Globe,
  LayoutTemplate,
  Pencil,
  Plus,
  RotateCcw,
  Settings,
  SlidersHorizontal,
  Trash,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react";

import { useNavigate, useSearchParams } from "react-router-dom";

import { getDashboardColors } from "../../styles/dashboardTheme";

import { useTheme as useCustomTheme } from "../../context/ThemeContext";

import WebsiteAnalytics from "./WebsiteAnalytics";

import CollaboratorModal from "./CollaboratorModal";

import { useStoreWebsiteCreation } from "../../hooks/useStoreWebsiteCreation";

import {
  getWebsiteTemplates,
  getStoreTemplates,
  refreshTemplateCache,
} from "../../templates/templateApi";

import {
  FRONTEND_TEMPLATE_CATALOG,
  getFrontendTemplatePreviewImage,
} from "../../templates/frontendTemplateCatalog";
import ColorPickerWithAlpha from "../UI/ColorPickerWithAlpha";

import {
  DashboardActionButton,
  DashboardInput,
  DashboardSelect,
  PageHeader,
  DashboardMetricCard,
  EmptyState,
  SearchBar,
  getTrendProps,
} from "./shared";

import {
  ROLE_PERMISSIONS,
  WEBSITE_ACTIONS,
} from "../../context/PermissionContext";

import LanguageIcon from "@mui/icons-material/Language";

import VisibilityIcon from "@mui/icons-material/Visibility";

import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

import StorefrontIcon from "@mui/icons-material/Storefront";

import PeopleIcon from "@mui/icons-material/People";

import { API_URL } from "@/config/api";
import { apiClient } from "@/api/client";

// -- Role badge colors (Step 7.4.2) ------------------------------------------

const ROLE_COLORS = {
  OWNER: "#d4a017",
  ADMIN: "#2196f3",
  EDITOR: "#4caf50",
  VIEWER: "#9e9e9e",
};

const WEBSITE_CARD_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80";

const stripHtml = (value) =>
  String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const escapeCssUrl = (value) => String(value || "").replace(/"/g, '\\"');

const getWebsiteCategoryLabel = (website) =>
  website?.category?.name ||
  website?.categoryName ||
  website?.businessCategory ||
  website?.industry ||
  website?.type ||
  "Website";

const getWebsiteDescription = (website) =>
  stripHtml(
    website?.shortDescription ||
      website?.metaDescription ||
      website?.description ||
      website?.website?.shortDescription ||
      website?.website?.metaDescription,
  ) || "Build, publish, and manage this website from your dashboard.";

const getOwnerLabel = (website, websiteRole) =>
  website?.owner?.name ||
  website?.ownerName ||
  website?.createdBy?.name ||
  (websiteRole === "OWNER" ? "Owner" : websiteRole);

const getWebsitePageCountLabel = (website) => {
  const pageCount = Number(
    website?.pageCount ?? website?.pagesCount ?? website?.website?.pageCount ?? 0,
  );

  if (!Number.isFinite(pageCount) || pageCount <= 0) {
    return "1 page";
  }

  return `${pageCount} page${pageCount === 1 ? "" : "s"}`;
};

const formatWebsiteUpdatedAt = (value) => {
  const date = value ? new Date(value) : null;

  if (!date || Number.isNaN(date.getTime())) {
    return "Updated recently";
  }

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMinutes < 1) return "Updated just now";
  if (diffMinutes < 60) {
    return `Updated ${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `Updated ${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) {
    return `Updated ${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  }

  return `Updated ${date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: date.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
  })}`;
};

const getWebsiteTemplateLabel = (website, websiteTemplates = [], storeTemplates = []) => {
  const directTemplateName =
    website?.template?.name ||
    website?.templateName ||
    website?.template_name ||
    website?.website?.template?.name ||
    website?.website?.templateName;

  if (directTemplateName) return directTemplateName;

  const frontendTemplateId =
    website?.frontendTemplateId ||
    website?.frontend_template_id ||
    website?.website?.frontendTemplateId ||
    website?.website?.frontend_template_id;

  if (frontendTemplateId) {
    const frontendTemplate = FRONTEND_TEMPLATE_CATALOG.find(
      (template) => template.id === frontendTemplateId,
    );
    if (frontendTemplate?.name) return frontendTemplate.name;
  }

  const templateId =
    website?.templateId ||
    website?.template_id ||
    website?.website?.templateId ||
    website?.website?.template_id;

  if (templateId) {
    const template = [...websiteTemplates, ...storeTemplates].find(
      (item) => String(item.id) === String(templateId),
    );
    if (template?.name) return template.name;
  }

  return null;
};

/**

 * Check if a given role can perform a specific action.

 * Uses ROLE_PERMISSIONS from PermissionContext (frontend mirror of backend permissions).

 */

const canPerformAction = (role, action) => {
  if (!role || !action) return false;

  const perms = ROLE_PERMISSIONS[role];

  return perms ? perms.has(action) : false;
};

// Legacy wizard imports removed (Step 4.15 — creation flow unification)

// CreateWebsiteWizard, CustomizeWebsite, and AIQuestionnairePage are no longer used.

// All website creation flows now go through Template Gallery -> CreateWebsiteModal.

const getWebsiteId = (website) =>
  website?.id ??
  website?.websiteId ??
  website?.website_id ??
  website?.websiteID ??
  website?.website?.id ??
  website?.website?.websiteId ??
  website?.website?.website_id;

const isSameWebsiteId = (left, right) => String(left) === String(right);

const slugifyWebsiteValue = (value = "") =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const buildCloneDefaults = (website, existingWebsites = []) => {
  const existingNames = new Set(
    existingWebsites
      .map((item) => item?.name?.trim().toLowerCase())
      .filter(Boolean),
  );
  const existingSlugs = new Set(
    existingWebsites
      .map((item) => item?.slug?.trim().toLowerCase())
      .filter(Boolean),
  );

  const baseName = `${website?.name || "Website"} Copy`;
  const baseSlug =
    slugifyWebsiteValue(
      `${website?.slug || website?.name || "website"}-copy`,
    ) || "website-copy";

  let nextName = baseName;
  let nextSlug = baseSlug;
  let suffix = 2;

  while (
    existingNames.has(nextName.trim().toLowerCase()) ||
    existingSlugs.has(nextSlug.toLowerCase())
  ) {
    nextName = `${baseName} ${suffix}`;
    nextSlug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return { name: nextName, slug: nextSlug };
};

const getApiErrorMessage = (err, fallbackMessage) => {
  const responseData = err?.response?.data;
  const nestedMessage =
    responseData?.message ||
    responseData?.error?.message ||
    responseData?.error?.details?.message;

  const validationErrors =
    responseData?.errors ||
    responseData?.error?.errors ||
    responseData?.details ||
    responseData?.error?.details;

  if (Array.isArray(validationErrors) && validationErrors.length > 0) {
    const firstError = validationErrors[0];
    if (typeof firstError === "string") {
      return firstError;
    }
    if (firstError?.msg) {
      return firstError.msg;
    }
    if (firstError?.message) {
      return firstError.message;
    }
  }

  if (typeof validationErrors === "string" && validationErrors.trim()) {
    return validationErrors;
  }

  return nestedMessage || err?.message || fallbackMessage;
};

const pickWebsiteClonePayload = (website, name, slug) => {
  const resolvedName = name.trim();
  const resolvedSlug = slug.trim();

  return {
    name: resolvedName,
    slug: resolvedSlug,
    websiteName: resolvedName,
    websiteSlug: resolvedSlug,
    title: resolvedName,
    primaryColor: website?.primaryColor || website?.primary_color || "#378C92",
    isPublic:
      typeof website?.isPublic === "boolean"
        ? website.isPublic
        : typeof website?.is_public === "boolean"
          ? website.is_public
          : true,
    templateId:
      website?.templateId ||
      website?.template_id ||
      website?.frontendTemplateId ||
      website?.frontend_template_id ||
      null,
    sourceWebsiteId:
      website?.id || website?.websiteId || website?.website_id || null,
  };
};

const extractWebsiteList = (payload) => {
  if (Array.isArray(payload)) return payload;

  if (Array.isArray(payload?.data)) return payload.data;

  if (Array.isArray(payload?.data?.websites)) return payload.data.websites;

  if (Array.isArray(payload?.websites)) return payload.websites;

  if (Array.isArray(payload?.items)) return payload.items;

  if (Array.isArray(payload?.results)) return payload.results;

  return [];
};

const resolveWebsiteIdForAction = async (website) => {
  if (
    website === null ||
    website === undefined ||
    typeof website !== "object"
  ) {
    return website;
  }

  return getWebsiteId(website);
};

const SkeletonCard = () => {
  const { actualTheme } = useCustomTheme();

  const colors = getDashboardColors(actualTheme);

  return (
    <Card
      sx={{
        aspectRatio: "16/10",

        position: "relative",

        overflow: "hidden",

        borderRadius: 2,

        border: `1px solid ${alpha(colors.border, 0.5)}`,
      }}
    >
      <Skeleton
        variant="rectangular"
        width="100%"
        height="100%"
        animation="wave"
        sx={{ bgcolor: alpha(colors.textSecondary, 0.1) }}
      />

      <Box
        sx={{
          position: "absolute",

          top: 12,

          right: 12,
        }}
      >
        <Skeleton
          variant="rectangular"
          width={80}
          height={24}
          animation="wave"
          sx={{ borderRadius: 3, bgcolor: alpha(colors.textSecondary, 0.2) }}
        />
      </Box>
    </Card>
  );
};

const Websites = ({ pageTitle, pageSubtitle, initialView }) => {
  const { actualTheme } = useCustomTheme();

  const colors = getDashboardColors(actualTheme);

  const navigate = useNavigate();

  const [websites, setWebsites] = useState([]);

  const [deletedWebsites, setDeletedWebsites] = useState([]);

  const [deletedStores, setDeletedStores] = useState([]);

  // Combined deleted items (websites + stores) with type property

  const deletedItems = useMemo(() => {
    const websiteItems = deletedWebsites.map((w) => ({
      ...w,
      itemType: "website",
    }));

    const storeItems = deletedStores.map((s) => ({ ...s, itemType: "store" }));

    return [...websiteItems, ...storeItems].sort(
      (a, b) => new Date(b.deletedAt) - new Date(a.deletedAt),
    );
  }, [deletedWebsites, deletedStores]);

  // Determine view mode from initialView prop (removed tabs)

  const viewMode = initialView === "deleted" ? "deleted" : "active";

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  // Stats with trends

  const [stats, setStats] = useState({
    total: 0,

    published: 0,

    draft: 0,

    withStore: 0,

    trends: {
      total: null,

      published: null,

      draft: null,

      withStore: null,
    },
  });

  // Pagination states

  const [activePage, setActivePage] = useState(1);

  const [activeHasMore, setActiveHasMore] = useState(true);

  const [activeLoadingMore, setActiveLoadingMore] = useState(false);

  const [deletedPage, setDeletedPage] = useState(1);

  const [deletedHasMore, setDeletedHasMore] = useState(true);

  const [deletedLoadingMore, setDeletedLoadingMore] = useState(false);

  const observerTarget = useRef(null);

  const PAGE_SIZE = 12;

  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",

    slug: "",

    primaryColor: "#378C92",

    isPublic: true,

    templateId: "",
  });

  const [formError, setFormError] = useState(null);

  const [submitting, setSubmitting] = useState(false);

  const [websiteTemplates, setWebsiteTemplates] = useState([]);

  const [storeTemplates, setStoreTemplates] = useState([]);

  const [templatesLoading, setTemplatesLoading] = useState(true);

  const [templatesError, setTemplatesError] = useState(null);

  // Store Website creation state

  const [createStoreDialogOpen, setCreateStoreDialogOpen] = useState(false);

  const [storeFormData, setStoreFormData] = useState({
    websiteName: "",

    websiteSlug: "",

    primaryColor: "#378C92",

    storeName: "",

    storeSlug: "",

    currency: "USD",

    templateId: "",
  });

  const {
    createStoreWebsite,

    loading: storeLoading,

    error: storeError,

    partialError,
  } = useStoreWebsiteCreation();

  const loadTemplates = useCallback((forceRefresh = false) => {
    let cancelled = false;

    setTemplatesLoading(true);

    const loader = forceRefresh ? refreshTemplateCache : null;

    const request = loader
      ? loader().then(() =>
          Promise.all([getWebsiteTemplates(), getStoreTemplates()]),
        )
      : Promise.all([getWebsiteTemplates(), getStoreTemplates()]);

    request

      .then(([websiteData, storeData]) => {
        if (!cancelled) {
          setWebsiteTemplates(websiteData);

          setStoreTemplates(storeData);

          setTemplatesError(null);
        }
      })

      .catch(() => {
        if (!cancelled) {
          setWebsiteTemplates([]);

          setStoreTemplates([]);

          setTemplatesError("Failed to load templates");
        }
      })

      .finally(() => {
        if (!cancelled) {
          setTemplatesLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => loadTemplates(), [loadTemplates]);

  useEffect(() => {
    const handleFocus = () => {
      loadTemplates(true);
    };

    window.addEventListener("focus", handleFocus);

    return () => window.removeEventListener("focus", handleFocus);
  }, [loadTemplates]);

  // Settings dialog state

  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);

  const [editingWebsite, setEditingWebsite] = useState(null);

  const [settingsFormData, setSettingsFormData] = useState({
    name: "",

    primaryColor: "",

    logoUrl: "",

    faviconUrl: "",

    metaTitle: "",

    metaDescription: "",
  });

  const [settingsError, setSettingsError] = useState(null);

  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [uploadingFavicon, setUploadingFavicon] = useState(false);

  // Analytics dialog state

  const [analyticsDialogOpen, setAnalyticsDialogOpen] = useState(false);

  const [selectedWebsiteForAnalytics, setSelectedWebsiteForAnalytics] =
    useState(null);

  // Upgrade dialog state

  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);

  const [planLimitMessage, setPlanLimitMessage] = useState("");

  // Delete confirmation state

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [websiteToDelete, setWebsiteToDelete] = useState(null);

  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const [deleting, setDeleting] = useState(false);

  // Clone / duplicate website state

  const [cloneDialogOpen, setCloneDialogOpen] = useState(false);

  const [websiteToClone, setWebsiteToClone] = useState(null);

  const [cloneFormData, setCloneFormData] = useState({ name: "", slug: "" });

  const [cloneError, setCloneError] = useState(null);

  const [cloning, setCloning] = useState(false);

  // Search state for server-side filtering

  const [searchQuery, setSearchQuery] = useState("");

  const debouncedSearch = useDebouncedValue(searchQuery, 300);

  // Role filter state (Step 7.4.1)

  const [roleFilter, setRoleFilter] = useState("all"); // 'all' | 'owned' | 'shared'

  // Collaborator modal state (Step 7.4.4)

  const [collaboratorModalOpen, setCollaboratorModalOpen] = useState(false);

  const [collaboratorWebsiteId, setCollaboratorWebsiteId] = useState(null);

  const [collaboratorWebsiteRole, setCollaboratorWebsiteRole] =
    useState("VIEWER");

  // Restore state

  const [restoring, setRestoring] = useState(false);

  // Permanent delete confirmation state

  const [permanentDeleteDialogOpen, setPermanentDeleteDialogOpen] =
    useState(false);

  const [websiteToPermanentlyDelete, setWebsiteToPermanentlyDelete] =
    useState(null);

  const [permanentDeleteConfirmText, setPermanentDeleteConfirmText] =
    useState("");

  const [permanentlyDeleting, setPermanentlyDeleting] = useState(false);

  const getWebsitePreviewImage = useCallback((website) => {
    const resolvedPreviewImage =
      website?.previewImage ||
      website?.preview_image ||
      website?.website?.previewImage ||
      website?.website?.preview_image;
    if (resolvedPreviewImage) return resolvedPreviewImage;

    const resolvedThumbnailUrl =
      website?.thumbnailUrl ||
      website?.thumbnail_url ||
      website?.website?.thumbnailUrl ||
      website?.website?.thumbnail_url;
    if (resolvedThumbnailUrl) return resolvedThumbnailUrl;

    const resolvedFrontendTemplateId =
      website?.frontendTemplateId ||
      website?.frontend_template_id ||
      website?.website?.frontendTemplateId ||
      website?.website?.frontend_template_id;
    if (resolvedFrontendTemplateId)
      return getFrontendTemplatePreviewImage(resolvedFrontendTemplateId);

    return null;
  }, []);

  useEffect(() => {
    // Reset pagination when view mode changes

    setActivePage(1);

    setDeletedPage(1);

    setWebsites([]);

    setDeletedWebsites([]);

    setActiveHasMore(true);

    setDeletedHasMore(true);

    // Skip fetching for create-template view

    if (initialView === "create-template") {
      setLoading(false);

      return;
    }

    if (viewMode === "active") {
      fetchWebsites(1, true);
    } else {
      fetchAllDeletedItems(1, true);
    }

    // Fetch stats on view mode change

    fetchStats();
  }, [viewMode, initialView]);

  const fetchWebsites = async (page = 1, reset = false) => {
    try {
      if (reset) {
        setLoading(true);
      } else {
        setActiveLoadingMore(true);
      }

      setError(null);

      const params = { page, limit: PAGE_SIZE };

      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();

      const response = await apiClient.get("/websites", { params });

      const newData = extractWebsiteList(response.data);

      if (reset) {
        setWebsites(newData);
      } else {
        setWebsites((prev) => [...prev, ...newData]);
      }

      setActiveHasMore(newData.length === PAGE_SIZE);

      setActivePage(page);
    } catch (err) {
      console.error("Error fetching websites:", err);

      setError(err.response?.data?.message || "Failed to load websites");
    } finally {
      setLoading(false);

      setActiveLoadingMore(false);
    }
  };

  // Re-fetch from page 1 when search changes

  useEffect(() => {
    if (viewMode === "active") {
      setActivePage(1);

      setWebsites([]);

      setActiveHasMore(true);

      fetchWebsites(1, true);
    }
  }, [debouncedSearch]);

  const fetchStats = async () => {
    try {
      const response = await apiClient.get("/websites/stats");

      if (response.data.success) {
        setStats({
          total: response.data.total || 0,

          published: response.data.published || 0,

          draft: response.data.draft || 0,

          withStore: response.data.withStore || 0,

          trends: {
            total: response.data.trends?.total ?? null,

            published: response.data.trends?.published ?? null,

            draft: response.data.trends?.draft ?? null,

            withStore: response.data.trends?.withStore ?? null,
          },
        });
      }
    } catch (err) {
      console.error("Error fetching website stats:", err);
    }
  };

  const fetchDeletedWebsites = async (page = 1, reset = false) => {
    try {
      if (reset) {
        setLoading(true);
      } else {
        setDeletedLoadingMore(true);
      }

      setError(null);

      const response = await apiClient.get("/websites", {
        params: { status: "archived", page, limit: PAGE_SIZE },
      });

      const newData = extractWebsiteList(response.data);

      if (reset) {
        setDeletedWebsites(newData);
      } else {
        setDeletedWebsites((prev) => [...prev, ...newData]);
      }

      setDeletedHasMore(newData.length === PAGE_SIZE);

      setDeletedPage(page);
    } catch (err) {
      console.error("Error fetching deleted websites:", err);

      setError(
        err.response?.data?.message || "Failed to load deleted websites",
      );
    } finally {
      setLoading(false);

      setDeletedLoadingMore(false);
    }
  };

  const fetchDeletedStores = async () => {
    try {
      const response = await apiClient.get("/stores", {
        params: { deleted: true },
      });

      setDeletedStores(response.data.data || []);
    } catch (err) {
      console.error("Error fetching deleted stores:", err);
    }
  };

  const fetchAllDeletedItems = async (page = 1, reset = false) => {
    await Promise.all([
      fetchDeletedWebsites(page, reset),
      fetchDeletedStores(),
    ]);
  };

  const loadMoreWebsites = useCallback(() => {
    if (activeLoadingMore || !activeHasMore) return;

    fetchWebsites(activePage + 1, false);
  }, [activePage, activeLoadingMore, activeHasMore]);

  const loadMoreDeletedWebsites = useCallback(() => {
    if (deletedLoadingMore || !deletedHasMore) return;

    fetchDeletedWebsites(deletedPage + 1, false);
  }, [deletedPage, deletedLoadingMore, deletedHasMore]);

  // Intersection Observer for infinite scroll

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          if (viewMode === "active") {
            loadMoreWebsites();
          } else {
            loadMoreDeletedWebsites();
          }
        }
      },

      { threshold: 0.1 },
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [viewMode, loadMoreWebsites, loadMoreDeletedWebsites]);

  const handleRestoreWebsite = async (websiteId) => {
    try {
      setRestoring(true);

      await apiClient.post(`/websites/${websiteId}/restore`, {});

      // Refresh deleted items list

      await fetchAllDeletedItems(1, true);

      // Also refresh active websites list

      await fetchWebsites();

      fetchStats();
    } catch (err) {
      console.error("Error restoring website:", err);

      alert(err.response?.data?.message || "Failed to restore website");
    } finally {
      setRestoring(false);
    }
  };

  const handleRestoreStore = async (storeId) => {
    try {
      setRestoring(true);

      await apiClient.post(`/stores/${storeId}/restore`, {});

      // Refresh deleted items list

      await fetchAllDeletedItems(1, true);

      fetchStats();
    } catch (err) {
      console.error("Error restoring store:", err);

      alert(err.response?.data?.message || "Failed to restore store");
    } finally {
      setRestoring(false);
    }
  };

  const handleRestoreItem = async (item) => {
    if (item.itemType === "store") {
      await handleRestoreStore(item.id);
    } else {
      await handleRestoreWebsite(getWebsiteId(item));
    }
  };

  const handleOpenPermanentDeleteDialog = (website) => {
    setWebsiteToPermanentlyDelete(website);

    setPermanentDeleteConfirmText("");

    setPermanentDeleteDialogOpen(true);
  };

  const handlePermanentlyDeleteWebsite = async () => {
    if (
      permanentDeleteConfirmText !== websiteToPermanentlyDelete?.name ||
      !websiteToPermanentlyDelete
    ) {
      return;
    }

    try {
      setPermanentlyDeleting(true);

      // Check if it's a store or website based on itemType

      if (websiteToPermanentlyDelete.itemType === "store") {
        await apiClient.delete(
          `/stores/${websiteToPermanentlyDelete.id}/permanent`,
        );

        setDeletedStores(
          deletedStores.filter((s) => s.id !== websiteToPermanentlyDelete.id),
        );
      } else {
        const websiteId = await resolveWebsiteIdForAction(
          websiteToPermanentlyDelete,
        );

        await apiClient.delete(`/websites/${websiteId}/permanent`);

        setDeletedWebsites(
          deletedWebsites.filter(
            (w) => !isSameWebsiteId(getWebsiteId(w), websiteId),
          ),
        );
      }

      setPermanentDeleteDialogOpen(false);

      setWebsiteToPermanentlyDelete(null);

      setPermanentDeleteConfirmText("");

      fetchStats();
    } catch (err) {
      console.error("Error permanently deleting item:", err);

      alert(err.response?.data?.message || "Failed to permanently delete item");
    } finally {
      setPermanentlyDeleting(false);
    }
  };

  const getDaysRemaining = (deletedAt) => {
    if (!deletedAt) return null; // Return null for websites without deletedAt

    const deleted = new Date(deletedAt);

    // Check for invalid date

    if (isNaN(deleted.getTime())) return null;

    const now = new Date();

    const msPerDay = 24 * 60 * 60 * 1000;

    const daysSinceDeletion = Math.floor((now - deleted) / msPerDay);

    const daysRemaining = 30 - daysSinceDeletion;

    return Math.max(0, daysRemaining);
  };

  const handleCreateWebsite = async () => {
    try {
      setSubmitting(true);

      setFormError(null);

      const response = await apiClient.post("/websites", formData);

      setWebsites([...websites, response.data.data]);

      setCreateDialogOpen(false);

      setFormData({
        name: "",
        slug: "",
        primaryColor: "#378C92",
        isPublic: true,
        templateId: "",
      });

      fetchStats();
    } catch (err) {
      console.error("Error creating website:", err);

      // Check if error is a plan limit error

      if (err.response?.data?.code === "PLAN_LIMIT_REACHED") {
        setCreateDialogOpen(false);

        setPlanLimitMessage(err.response.data.message);

        setUpgradeDialogOpen(true);
      } else {
        setFormError(err.response?.data?.message || "Failed to create website");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateStoreWebsite = async () => {
    try {
      const result = await createStoreWebsite(
        {
          name: storeFormData.websiteName,

          slug: storeFormData.websiteSlug,

          primaryColor: storeFormData.primaryColor,

          isPublic: true,
        },

        {
          name: storeFormData.storeName,

          slug: storeFormData.storeSlug,

          currency: storeFormData.currency,
        },
      );

      // Success - refresh websites list and close dialog

      await fetchWebsites();

      fetchStats();

      setCreateStoreDialogOpen(false);

      setStoreFormData({
        websiteName: "",

        websiteSlug: "",

        primaryColor: "#378C92",

        storeName: "",

        storeSlug: "",

        currency: "USD",

        templateId: "",
      });
    } catch (err) {
      console.error("Error creating store website:", err);

      // Check if error is a plan limit error

      if (err.code === "PLAN_LIMIT_REACHED") {
        setCreateStoreDialogOpen(false);

        setPlanLimitMessage(err.message);

        setUpgradeDialogOpen(true);
      }

      // Error is already set in the hook, it will be displayed in the dialog
    }
  };

  const handlePublish = async (website) => {
    try {
      const originalWebsiteId = getWebsiteId(website);

      const websiteId = await resolveWebsiteIdForAction(website);

      await apiClient.post(`/websites/${websiteId}/publish`, {});

      // Update website status in state

      setWebsites(
        websites.map((w) =>
          isSameWebsiteId(getWebsiteId(w), websiteId) ||
          isSameWebsiteId(getWebsiteId(w), originalWebsiteId)
            ? { ...w, status: "PUBLISHED" }
            : w,
        ),
      );

      fetchStats();
    } catch (err) {
      console.error("Error publishing website:", err);

      alert(err.response?.data?.message || "Failed to publish website");
    }
  };

  const handleUnpublish = async (website) => {
    try {
      const originalWebsiteId = getWebsiteId(website);

      const websiteId = await resolveWebsiteIdForAction(website);

      await apiClient.post(`/websites/${websiteId}/unpublish`, {});

      // Update website status in state

      setWebsites(
        websites.map((w) =>
          isSameWebsiteId(getWebsiteId(w), websiteId) ||
          isSameWebsiteId(getWebsiteId(w), originalWebsiteId)
            ? { ...w, status: "DRAFT" }
            : w,
        ),
      );

      fetchStats();
    } catch (err) {
      console.error("Error unpublishing website:", err);

      alert(err.response?.data?.message || "Failed to unpublish website");
    }
  };

  const handleOpenSettings = (website) => {
    setEditingWebsite(website);

    setSettingsFormData({
      name: website.name || "",

      primaryColor: website.primaryColor || "#378C92",

      logoUrl: website.logoUrl || "",

      faviconUrl: website.faviconUrl || "",

      metaTitle: website.metaTitle || "",

      metaDescription: website.metaDescription || "",
    });

    setSettingsError(null);

    setSettingsDialogOpen(true);
  };

  const handleSaveSettings = async () => {
    try {
      setSubmitting(true);

      setSettingsError(null);

      const originalWebsiteId = getWebsiteId(editingWebsite);

      const websiteId = await resolveWebsiteIdForAction(editingWebsite);

      await apiClient.put(`/websites/${websiteId}`, settingsFormData);

      // Update website in state

      setWebsites(
        websites.map((w) =>
          isSameWebsiteId(getWebsiteId(w), websiteId) ||
          isSameWebsiteId(getWebsiteId(w), originalWebsiteId)
            ? { ...w, ...settingsFormData }
            : w,
        ),
      );

      setSettingsDialogOpen(false);

      setEditingWebsite(null);
    } catch (err) {
      console.error("Error updating website settings:", err);

      setSettingsError(
        err.response?.data?.message || "Failed to update website settings",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadLogo = async (event) => {
    const file = event.target.files[0];

    if (!file) return;

    // Validate file type

    if (!file.type.startsWith("image/")) {
      setSettingsError("Please select a valid image file");

      return;
    }

    // Validate file size (5MB limit)

    if (file.size > 5 * 1024 * 1024) {
      setSettingsError("File size must be less than 5MB");

      return;
    }

    try {
      setUploadingLogo(true);

      setSettingsError(null);

      const formData = new FormData();

      formData.append("logo", file);

      const websiteId = await resolveWebsiteIdForAction(editingWebsite);

      const response = await apiClient.post(
        `/websites/${websiteId}/logo`,

        formData,

        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      // Update form data with new logo URL

      const logoUrl = `${API_URL.replace("/api", "")}${response.data.data.logoUrl}`;

      setSettingsFormData({ ...settingsFormData, logoUrl });
    } catch (err) {
      console.error("Error uploading logo:", err);

      setSettingsError(err.response?.data?.message || "Failed to upload logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleUploadFavicon = async (event) => {
    const file = event.target.files[0];

    if (!file) return;

    // Validate file type

    if (!file.type.startsWith("image/")) {
      setSettingsError("Please select a valid image file");

      return;
    }

    // Validate file size (5MB limit)

    if (file.size > 5 * 1024 * 1024) {
      setSettingsError("File size must be less than 5MB");

      return;
    }

    try {
      setUploadingFavicon(true);

      setSettingsError(null);

      const formData = new FormData();

      formData.append("favicon", file);

      const websiteId = await resolveWebsiteIdForAction(editingWebsite);

      const response = await apiClient.post(
        `/websites/${websiteId}/favicon`,

        formData,

        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      // Update form data with new favicon URL

      const faviconUrl = `${API_URL.replace("/api", "")}${response.data.data.faviconUrl}`;

      setSettingsFormData({ ...settingsFormData, faviconUrl });
    } catch (err) {
      console.error("Error uploading favicon:", err);

      setSettingsError(
        err.response?.data?.message || "Failed to upload favicon",
      );
    } finally {
      setUploadingFavicon(false);
    }
  };

  const handleOpenAnalytics = (website) => {
    setSelectedWebsiteForAnalytics(website);

    setAnalyticsDialogOpen(true);
  };

  const handleOpenCloneDialog = (website) => {
    const defaults = buildCloneDefaults(website, websites);

    setWebsiteToClone(website);

    setCloneFormData(defaults);

    setCloneError(null);

    setCloneDialogOpen(true);
  };

  const handleCloneWebsite = async () => {
    if (
      !websiteToClone ||
      !cloneFormData.name.trim() ||
      !cloneFormData.slug.trim()
    ) {
      return;
    }

    try {
      setCloning(true);

      setCloneError(null);

      const websiteId = await resolveWebsiteIdForAction(websiteToClone);
      const payload = pickWebsiteClonePayload(
        websiteToClone,
        cloneFormData.name,
        cloneFormData.slug,
      );
      const candidateEndpoints = [
        `/websites/${websiteId}/clone`,

        `/websites/${websiteId}/duplicate`,
      ];
      let response = null;
      let lastError = null;

      for (const endpoint of candidateEndpoints) {
        try {
          response = await apiClient.post(endpoint, payload);

          if (response?.data?.success === false) {
            throw new Error(
              response.data.message || "Clone request was rejected",
            );
          }

          break;
        } catch (err) {
          lastError = err;
          const status = err?.response?.status;

          if (status !== 404 && status !== 405) {
            throw err;
          }
        }
      }

      if (!response) {
        throw lastError || new Error("Clone endpoint not found");
      }

      const clonedWebsite =
        response?.data?.data || response?.data?.website || response?.data;

      setCloneDialogOpen(false);

      setWebsiteToClone(null);

      setCloneFormData({ name: "", slug: "" });

      await fetchWebsites(1, true);

      fetchStats();

      const clonedWebsiteId = getWebsiteId(clonedWebsite);

      if (clonedWebsiteId) {
        navigate(`/dashboard/websites/${clonedWebsiteId}/manage/overview`);
      }
    } catch (err) {
      console.error("Error cloning website:", err);

      setCloneError(getApiErrorMessage(err, "Failed to clone website"));
    } finally {
      setCloning(false);
    }
  };

  const handleOpenDeleteDialog = (website) => {
    setWebsiteToDelete(website);

    setDeleteConfirmText("");

    setDeleteDialogOpen(true);
  };

  const handleDeleteWebsite = async () => {
    if (deleteConfirmText !== websiteToDelete?.name || !websiteToDelete) {
      return;
    }

    try {
      setDeleting(true);

      const originalWebsiteId = getWebsiteId(websiteToDelete);

      const websiteId = await resolveWebsiteIdForAction(websiteToDelete);

      await apiClient.delete(`/websites/${websiteId}`);

      // Remove from list

      setWebsites(
        websites.filter(
          (w) =>
            !isSameWebsiteId(getWebsiteId(w), websiteId) &&
            !isSameWebsiteId(getWebsiteId(w), originalWebsiteId),
        ),
      );

      setDeleteDialogOpen(false);

      setWebsiteToDelete(null);

      setDeleteConfirmText("");

      fetchStats();
    } catch (err) {
      console.error("Error deleting website:", err);

      alert(err.response?.data?.message || "Failed to delete website");
    } finally {
      setDeleting(false);
    }
  };

  const handlePreviewWebsite = async (website) => {
    const websiteId = await resolveWebsiteIdForAction(website);

    const isPublished =
      String(website?.status || "").toUpperCase() === "PUBLISHED";

    if (isPublished && website?.slug) {
      window.open(`/site/${website.slug}`, "_blank");

      return;
    }

    window.open(`/dashboard/websites/${websiteId}/editor`, "_blank");
  };

  const handleCardClick = async (website) => {
    // Navigate to the supported management route; /dashboard/websites/:id is not a routed detail page.

    const websiteId = await resolveWebsiteIdForAction(website);

    navigate(`/dashboard/websites/${websiteId}/manage/overview`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PUBLISHED":
        return "#4ade80";

      case "DRAFT":
        return "#fbbf24";

      case "ARCHIVED":
        return "#9ca3af";

      default:
        return colors.textSecondary;
    }
  };

  // -- Multi-tenancy: filtered websites and stats (Step 7.4.1) --------------

  const filteredWebsites = useMemo(() => {
    if (roleFilter === "owned") {
      return websites.filter(
        (w) => (w.role || "VIEWER").toUpperCase() === "OWNER",
      );
    }

    if (roleFilter === "shared") {
      return websites.filter(
        (w) => (w.role || "VIEWER").toUpperCase() !== "OWNER",
      );
    }

    return websites;
  }, [websites, roleFilter]);

  // const websitelog = filteredWebsites()
  // console.log("Here are the websites data: ", filteredWebsites[0]);

  const ownershipStats = useMemo(() => {
    const owned = websites.filter(
      (w) => (w.role || "VIEWER").toUpperCase() === "OWNER",
    ).length;

    const shared = websites.filter(
      (w) => (w.role || "VIEWER").toUpperCase() !== "OWNER",
    ).length;

    return { owned, shared };
  }, [websites]);

  const handleOpenCollaboratorModal = useCallback((website) => {
    setCollaboratorWebsiteId(getWebsiteId(website));

    setCollaboratorWebsiteRole((website.role || "OWNER").toUpperCase());

    setCollaboratorModalOpen(true);
  }, []);

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ px: { xs: 0, sm: 0 } }}>
        <PageHeader title={pageTitle} subtitle={pageSubtitle} />

        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
        >
          <CircularProgress sx={{ color: colors.primary }} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 0, sm: 0 } }}>
      <PageHeader title={pageTitle} subtitle={pageSubtitle} />

      {/* Legacy wizard views removed (Step 4.15). All creation flows go through Template Gallery. */}

      {/* Create Template Empty State */}

      {initialView === "create-template" && (
        <Card
          sx={{
            background: `linear-gradient(135deg, ${alpha(colors.primary, 0.05)} 0%, ${alpha(colors.primaryDark, 0.02)} 100%)`,

            border: `1px solid ${alpha(colors.primary, 0.1)}`,

            borderRadius: 3,

            textAlign: "center",

            py: 8,
          }}
        >
          <CardContent>
            <Box sx={{ color: alpha(colors.textSecondary, 0.3), mb: 2 }}>
              <LayoutTemplate size={80} />
            </Box>

            <Typography
              variant="h5"
              sx={{ color: colors.text, fontWeight: 600, mb: 1 }}
            >
              Template Creation Coming Soon
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: colors.textSecondary,
                mb: 3,
                maxWidth: 500,
                mx: "auto",
              }}
            >
              The template creation feature is under development. Soon you'll be
              able to design and create custom website templates for your team.
            </Typography>

            <Box
              sx={{
                display: "flex",
                gap: 2,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Button
                variant="outlined"
                onClick={() => navigate("/dashboard/websites")}
                sx={{
                  borderColor: colors.primary,

                  color: colors.primary,

                  textTransform: "none",

                  fontWeight: 600,

                  "&:hover": {
                    borderColor: colors.primaryDark,

                    bgcolor: alpha(colors.primary, 0.1),
                  },
                }}
              >
                View All Websites
              </Button>

              <Button
                variant="outlined"
                onClick={() => navigate("/dashboard/websites/templates")}
                sx={{
                  borderColor: colors.primary,

                  color: colors.primary,

                  textTransform: "none",

                  fontWeight: 600,

                  "&:hover": {
                    borderColor: colors.primaryDark,

                    bgcolor: alpha(colors.primary, 0.1),
                  },
                }}
              >
                Create Website
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards */}

      {viewMode === "active" && !["create-template"].includes(initialView) && (
        <Grid
          container
          spacing={{ xs: 2, sm: 2, md: 2 }}
          sx={{ mb: { xs: 2, md: 3 } }}
        >
          <Grid item xs={12} sm={6} md={3}>
            <DashboardMetricCard
              title="Total Websites"
              value={stats.total}
              icon={LanguageIcon}
              {...getTrendProps(stats.total, stats.trends.total)}
              showProgress={false}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <DashboardMetricCard
              title="Published"
              value={stats.published}
              icon={VisibilityIcon}
              {...getTrendProps(stats.published, stats.trends.published)}
              showProgress={false}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <DashboardMetricCard
              title="Draft"
              value={stats.draft}
              icon={VisibilityOffIcon}
              {...getTrendProps(stats.draft, stats.trends.draft)}
              showProgress={false}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <DashboardMetricCard
              title="With Stores"
              value={stats.withStore}
              icon={StorefrontIcon}
              {...getTrendProps(stats.withStore, stats.trends.withStore)}
              showProgress={false}
            />
          </Grid>
        </Grid>
      )}

      {/* Role Filter Tabs & Ownership Stats (Step 7.4.2) */}

      {viewMode === "active" &&
        !["create-template"].includes(initialView) &&
        websites.length > 0 && (
          <Box
            sx={{
              display: "flex",

              alignItems: "center",

              justifyContent: "space-between",

              mb: 2,

              flexWrap: "wrap",

              gap: 1,
            }}
          >
            <Box sx={{ display: "flex", gap: 1 }}>
              {[
                { key: "all", label: "All" },

                { key: "owned", label: "Owned" },

                { key: "shared", label: "Shared with Me" },
              ].map(({ key, label }) => (
                <Chip
                  key={key}
                  label={label}
                  size="small"
                  onClick={() => setRoleFilter(key)}
                  data-testid={`filter-${key}`}
                  sx={{
                    fontWeight: 600,

                    cursor: "pointer",

                    bgcolor:
                      roleFilter === key
                        ? alpha(colors.primary, 0.15)
                        : alpha(colors.textSecondary, 0.08),

                    color:
                      roleFilter === key
                        ? colors.primary
                        : colors.textSecondary,

                    border:
                      roleFilter === key
                        ? `1px solid ${alpha(colors.primary, 0.4)}`
                        : "1px solid transparent",

                    "&:hover": {
                      bgcolor:
                        roleFilter === key
                          ? alpha(colors.primary, 0.2)
                          : alpha(colors.textSecondary, 0.12),
                    },
                  }}
                />
              ))}
            </Box>

            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <Typography
                variant="caption"
                sx={{ color: colors.textSecondary }}
              >
                Owned: {ownershipStats.owned}
              </Typography>

              {ownershipStats.shared > 0 && (
                <>
                  <Typography
                    variant="caption"
                    sx={{ color: colors.textSecondary }}
                  >
                    |
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{ color: colors.textSecondary }}
                  >
                    <Box
                      component="span"
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                    >
                      <PeopleIcon sx={{ fontSize: 14 }} /> Shared:{" "}
                      {ownershipStats.shared}
                    </Box>
                  </Typography>
                </>
              )}
            </Box>
          </Box>
        )}

      {error && !["create-template"].includes(initialView) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Search Bar */}

      {viewMode === "active" && !["create-template"].includes(initialView) && (
        <Box sx={{ mb: 3, maxWidth: { xs: "100%", md: 400 } }}>
          <SearchBar
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search websites..."
          />
        </Box>
      )}

      {/* Website Cards Grid */}

      {viewMode === "active" && !["create-template"].includes(initialView) && (
        <Grid container spacing={3}>
          {/* Create New Website Card */}

          <Grid item xs={12} sm={6} md={3}>
            <Card
              onClick={() => navigate("/dashboard/websites/templates")}
              sx={{
                minHeight: { xs: 430, sm: 462, md: 382, xl: 458 },
                position: "relative",
                overflow: "hidden",
                borderRadius: "16px",
                border: `1px dashed ${
                  actualTheme === "dark"
                    ? "rgba(255,255,255,0.16)"
                    : "rgba(15,23,42,0.16)"
                }`,
                bgcolor: actualTheme === "dark" ? colors.bgCard : "#ffffff",
                boxShadow:
                  actualTheme === "dark"
                    ? "0 26px 60px rgba(0,0,0,0.68), 0 8px 18px rgba(0,0,0,0.42), 0 0 0 1px rgba(255,255,255,0.03)"
                    : "0 3px 18px rgba(0,0,0,0.08)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                p: 0,
                cursor: "pointer",
                transition:
                  "transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease, background-color 0.22s ease",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  inset: { xs: 14, md: 10, xl: 14 },
                  borderRadius: "14px",
                  border: `1px dashed ${
                    actualTheme === "dark"
                      ? "rgba(255,255,255,0.10)"
                      : "rgba(15,23,42,0.10)"
                  }`,
                  pointerEvents: "none",
                },
                "&:hover": {
                  borderColor: colors.primary,
                  transform: "translateY(-3px)",
                  boxShadow:
                    actualTheme === "dark"
                      ? "0 34px 78px rgba(0,0,0,0.78), 0 14px 28px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)"
                      : "0 14px 38px rgba(15,23,42,0.16)",
                  "& .create-website-icon": {
                    bgcolor: colors.primary,
                    color: "#fff",
                    transform: "scale(1.04)",
                  },
                  "& .create-website-hover-grid": {
                    opacity: 1,
                    transform: "translateY(0)",
                  },
                  "& .create-website-idle-panel": {
                    opacity: 0,
                    transform: "translateY(-8px) scale(0.96)",
                  },
                },
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  zIndex: 1,
                  flex: "0 0 auto",
                  minHeight: { xs: 238, sm: 260, md: 206, xl: 276 },
                  px: { xs: 2.25, md: 1.5, xl: 2.25 },
                  pt: { xs: 2.25, md: 1.5, xl: 2.25 },
                  pb: { xs: 1.75, md: 1.25, xl: 1.75 },
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  background:
                    actualTheme === "dark"
                      ? "linear-gradient(145deg, rgba(55,140,146,0.18), rgba(255,255,255,0.035) 42%, rgba(0,0,0,0.16))"
                      : "linear-gradient(145deg, rgba(55,140,146,0.12), rgba(15,23,42,0.025) 44%, rgba(15,23,42,0.045))",
                  borderBottom: `1px solid ${
                    actualTheme === "dark"
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(15,23,42,0.08)"
                  }`,
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    opacity: actualTheme === "dark" ? 0.55 : 0.42,
                    background:
                      "radial-gradient(circle at 50% 42%, rgba(55,140,146,0.34), transparent 38%)",
                    pointerEvents: "none",
                  }}
                />

                <Box
                  sx={{
                    position: "relative",
                    zIndex: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1,
                    width: "100%",
                  }}
                >
                  <Box
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 0.75,
                      maxWidth: "calc(100% - 46px)",
                      px: { xs: 1.25, md: 1, xl: 1.35 },
                      py: { xs: 0.7, md: 0.55, xl: 0.75 },
                      borderRadius: "999px",
                      color: colors.text,
                      bgcolor:
                        actualTheme === "dark"
                          ? "rgba(255,255,255,0.08)"
                          : "rgba(255,255,255,0.72)",
                      border: `1px solid ${
                        actualTheme === "dark"
                          ? "rgba(255,255,255,0.1)"
                          : "rgba(15,23,42,0.09)"
                      }`,
                      boxShadow:
                        actualTheme === "dark"
                          ? "0 10px 24px rgba(0,0,0,0.24)"
                          : "0 10px 24px rgba(15,23,42,0.08)",
                    }}
                  >
                    <LayoutTemplate size={15} />
                    <Typography
                      sx={{
                        fontSize: {
                          xs: "0.82rem",
                          md: "0.66rem",
                          lg: "0.74rem",
                          xl: "0.86rem",
                        },
                        fontWeight: 800,
                        lineHeight: 1,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      Template Library
                    </Typography>
                  </Box>

                  <Box
                    className="create-website-icon"
                    sx={{
                      width: { xs: 42, md: 34, xl: 46 },
                      height: { xs: 42, md: 34, xl: 46 },
                      flexShrink: 0,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: colors.textSecondary,
                      bgcolor:
                        actualTheme === "dark"
                          ? "rgba(255,255,255,0.08)"
                          : "rgba(255,255,255,0.8)",
                      border: `1px solid ${
                        actualTheme === "dark"
                          ? "rgba(255,255,255,0.1)"
                          : "rgba(15,23,42,0.09)"
                      }`,
                      transition:
                        "transform 0.22s ease, background-color 0.22s ease, color 0.22s ease",
                    }}
                  >
                    <Plus size={actualTheme === "dark" ? 24 : 22} />
                  </Box>
                </Box>

                <Box
                  className="create-website-idle-panel"
                  sx={{
                    position: "relative",
                    zIndex: 2,
                    width: { xs: 96, md: 76, xl: 108 },
                    height: { xs: 96, md: 76, xl: 108 },
                    mx: "auto",
                    mt: { xs: 2, md: 1.2, xl: 2.4 },
                    mb: { xs: 1.2, md: 0.8, xl: 1.4 },
                    borderRadius: { xs: "22px", md: "18px", xl: "24px" },
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: colors.primary,
                    bgcolor:
                      actualTheme === "dark"
                        ? "rgba(8,12,18,0.42)"
                        : "rgba(255,255,255,0.64)",
                    border: `1px solid ${
                      actualTheme === "dark"
                        ? "rgba(255,255,255,0.1)"
                        : "rgba(15,23,42,0.08)"
                    }`,
                    boxShadow:
                      actualTheme === "dark"
                        ? "0 18px 36px rgba(0,0,0,0.26)"
                        : "0 18px 36px rgba(15,23,42,0.08)",
                    transition: "opacity 0.2s ease, transform 0.2s ease",
                  }}
                >
                  <Plus size={actualTheme === "dark" ? 42 : 40} />
                </Box>

                <Box
                  className="create-website-hover-grid"
                  sx={{
                    position: "absolute",
                    zIndex: 3,
                    left: { xs: 18, md: 12, xl: 18 },
                    right: { xs: 18, md: 12, xl: 18 },
                    bottom: { xs: 16, md: 12, xl: 16 },
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: { xs: 1, md: 0.75, xl: 1 },
                    opacity: 0,
                    transform: "translateY(8px)",
                    transition: "opacity 0.2s ease, transform 0.2s ease",
                    pointerEvents: "none",
                  }}
                >
                  {[
                    { label: "Landing", rows: [88, 68, 46] },
                    { label: "Store", rows: [72, 86, 54] },
                    { label: "Portfolio", rows: [58, 92, 62] },
                    { label: "Directory", rows: [82, 52, 76] },
                  ].map((item) => (
                    <Box
                      key={item.label}
                      sx={{
                        minWidth: 0,
                        borderRadius: { xs: "12px", md: "10px", xl: "12px" },
                        p: { xs: 1, md: 0.75, xl: 1 },
                        bgcolor:
                          actualTheme === "dark"
                            ? "rgba(8,12,18,0.44)"
                            : "rgba(255,255,255,0.58)",
                        border: `1px solid ${
                          actualTheme === "dark"
                            ? "rgba(255,255,255,0.08)"
                            : "rgba(15,23,42,0.07)"
                        }`,
                      }}
                    >
                      <Typography
                        sx={{
                          mb: 0.8,
                          color: colors.textSecondary,
                          fontSize: {
                            xs: "0.68rem",
                            md: "0.54rem",
                            lg: "0.6rem",
                            xl: "0.72rem",
                          },
                          fontWeight: 700,
                          lineHeight: 1,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {item.label}
                      </Typography>
                      {item.rows.map((width, index) => (
                        <Box
                          key={`${item.label}-${width}-${index}`}
                          sx={{
                            width: `${width}%`,
                            height: { xs: 5, md: 4, xl: 5 },
                            mb: index === item.rows.length - 1 ? 0 : 0.55,
                            borderRadius: "999px",
                            bgcolor:
                              index === 0
                                ? alpha(colors.primary, 0.65)
                                : actualTheme === "dark"
                                  ? "rgba(255,255,255,0.14)"
                                  : "rgba(15,23,42,0.14)",
                          }}
                        />
                      ))}
                    </Box>
                  ))}
                </Box>
              </Box>

              <Box
                sx={{
                  position: "relative",
                  zIndex: 1,
                  flex: 1,
                  width: "100%",
                  px: { xs: 2.5, md: 1.75, xl: 2.5 },
                  py: { xs: 2.35, md: 1.55, xl: 2.45 },
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: { xs: 1, md: 0.7, xl: 1 },
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    color: colors.text,
                    fontWeight: 800,
                    fontSize: {
                      xs: "1.08rem",
                      md: "0.9rem",
                      lg: "1rem",
                      xl: "1.16rem",
                    },
                    lineHeight: 1.18,
                  }}
                >
                  Create New Website
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: colors.textSecondary,
                    fontSize: {
                      xs: "0.82rem",
                      md: "0.7rem",
                      lg: "0.78rem",
                      xl: "0.9rem",
                    },
                    lineHeight: 1.45,
                  }}
                >
                  Choose a template and launch a new project from your
                  dashboard.
                </Typography>
              </Box>
            </Card>
          </Grid>

          {/* Loading Skeletons - Initial Load */}

          {loading &&
            [...Array(6)].map((_, index) => (
              <Grid item xs={12} sm={6} md={3} key={`skeleton-${index}`}>
                <SkeletonCard />
              </Grid>
            ))}

          {/* Existing Websites */}

          {!loading &&
            filteredWebsites.map((website) => {
              const websiteRole = (website.role || "VIEWER").toUpperCase();

              const canEdit = canPerformAction(
                websiteRole,
                WEBSITE_ACTIONS.EDIT_CONTENT,
              );

              const canEditSettings = canPerformAction(
                websiteRole,
                WEBSITE_ACTIONS.EDIT_SETTINGS,
              );

              const canPublish = canPerformAction(
                websiteRole,
                WEBSITE_ACTIONS.PUBLISH,
              );

              const canDelete = canPerformAction(
                websiteRole,
                WEBSITE_ACTIONS.DELETE,
              );

              const websitePreviewImage = getWebsitePreviewImage(website);
              const cardImage =
                websitePreviewImage || WEBSITE_CARD_FALLBACK_IMAGE;
              const categoryLabel = getWebsiteCategoryLabel(website);
              const ownerLabel = getOwnerLabel(website, websiteRole);
              const description = getWebsiteDescription(website);
              const templateLabel = getWebsiteTemplateLabel(
                website,
                websiteTemplates,
                storeTemplates,
              );
              const pageCountLabel = getWebsitePageCountLabel(website);
              const updatedAtLabel = formatWebsiteUpdatedAt(
                website.updatedAt || website.updated_at || website.createdAt,
              );
              const statusLabel = String(website.status || "DRAFT").toUpperCase();
              const isDarkCard = actualTheme === "dark";
              const teal = "#378C92";
              const cardBorder = isDarkCard
                ? colors.panelBorder
                : "#e4eaf2";
              const actionHover = isDarkCard
                ? "rgba(255,255,255,0.07)"
                : "rgba(55,140,146,0.09)";
              const cardBg = isDarkCard ? colors.bgCard : "#0f1418";
              const textSecondary = "rgba(226,232,240,0.72)";
              const canViewAnalytics = canPerformAction(
                websiteRole,
                WEBSITE_ACTIONS.VIEW_ANALYTICS,
              );

              const canManageCollaborators = canPerformAction(
                websiteRole,
                WEBSITE_ACTIONS.MANAGE_COLLABORATORS,
              );

              const isShared = websiteRole !== "OWNER";
              const stopCardAction = (handler) => async (e) => {
                e.stopPropagation();
                await handler(e);
              };
              const isPublished = website.status === "PUBLISHED";
              const actionItems = [
                {
                  label: "Edit",
                  Icon: Pencil,
                  disabled: !canEdit,
                  tooltip: canEdit ? "Edit" : "You need EDITOR role to edit",
                  onClick: stopCardAction(async () => {
                    const websiteId = await resolveWebsiteIdForAction(website);
                    navigate(`/dashboard/websites/${websiteId}/editor`);
                  }),
                },
                {
                  label: "Preview",
                  Icon: Eye,
                  onClick: stopCardAction(() => handlePreviewWebsite(website)),
                },
                {
                  label: "Analytics",
                  Icon: ChartBar,
                  visible: canViewAnalytics,
                  onClick: stopCardAction(() => handleOpenAnalytics(website)),
                },
                {
                  label: "Team",
                  Icon: Users,
                  visible: canManageCollaborators || websiteRole === "OWNER",
                  onClick: stopCardAction(() => handleOpenCollaboratorModal(website)),
                },
                {
                  label: "Clone",
                  Icon: Copy,
                  visible: websiteRole === "OWNER",
                  onClick: stopCardAction(() => handleOpenCloneDialog(website)),
                },
                {
                  label: isPublished ? "Unpublish" : "Publish",
                  Icon: isPublished ? EyeOff : Globe,
                  visible: canPublish,
                  onClick: stopCardAction(() =>
                    isPublished
                      ? handleUnpublish(website)
                      : handlePublish(website),
                  ),
                },
              ].filter((item) => item.visible !== false);
              const previewAction = actionItems.find(
                (item) => item.label === "Preview",
              );
              const secondaryActionItems = actionItems.filter(
                (item) => item.label !== "Preview",
              );

              return (
                <Grid item xs={12} sm={6} md={3} key={getWebsiteId(website)}>
                  <Card
                    elevation={0}
                    sx={{
                      width: "100%",
                      minHeight: { xs: 408, sm: 438, md: 358, xl: 430 },
                      position: "relative",
                      overflow: "hidden",
                      borderRadius: "16px",
                      border: `1px solid ${cardBorder}`,
                      bgcolor: cardBg,
                      color: "#eef2f8",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      boxShadow: isDarkCard
                        ? "0 26px 60px rgba(0,0,0,0.68), 0 8px 18px rgba(0,0,0,0.42), 0 0 0 1px rgba(255,255,255,0.03)"
                        : "0 3px 18px rgba(0,0,0,0.08)",
                      transition:
                        "transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease",
                      "&:hover": {
                        transform: "translateY(-3px)",
                        borderColor: teal,
                        boxShadow: isDarkCard
                          ? "0 34px 78px rgba(0,0,0,0.78), 0 14px 28px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)"
                          : "0 14px 38px rgba(15,23,42,0.16)",
                        "& .website-card-image": {
                          transform: {
                            xs: "translateY(-30px)",
                            md: "translateY(-18px)",
                            xl: "translateY(-36px)",
                          },
                        },
                        "& .website-card-action-tray": {
                          maxWidth: {
                            xs: 260,
                            md: 210,
                            lg: 240,
                            xl: 320,
                          },
                          opacity: 1,
                          transform: "translateX(0)",
                        },
                        "& .website-card-action-item": {
                          opacity: 1,
                          transform: "translateX(0)",
                        },
                        "& .website-card-preview-label": {
                          maxWidth: 0,
                          opacity: 0,
                          transform: "translateX(8px)",
                          marginLeft: 0,
                        },
                        "& .website-card-preview-button": {
                          minWidth: {
                            xs: 38,
                            md: 33,
                            lg: 36,
                            xl: 42,
                          },
                          paddingLeft: 0,
                          paddingRight: 0,
                        },
                      },
                      "&:focus-within": {
                        borderColor: teal,
                        "& .website-card-action-tray": {
                          maxWidth: {
                            xs: 260,
                            md: 210,
                            lg: 240,
                            xl: 320,
                          },
                          opacity: 1,
                          transform: "translateX(0)",
                        },
                        "& .website-card-action-item": {
                          opacity: 1,
                          transform: "translateX(0)",
                        },
                        "& .website-card-preview-label": {
                          maxWidth: 0,
                          opacity: 0,
                          transform: "translateX(8px)",
                          marginLeft: 0,
                        },
                        "& .website-card-preview-button": {
                          minWidth: {
                            xs: 38,
                            md: 33,
                            lg: 36,
                            xl: 42,
                          },
                          paddingLeft: 0,
                          paddingRight: 0,
                        },
                      },
                    }}
                    onClick={() => handleCardClick(website)}
                  >
                    <Box
                      component="img"
                      className="website-card-image"
                      src={cardImage}
                      alt={`${website.name || "Website"} preview`}
                      loading="lazy"
                      sx={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "118%",
                        objectFit: "cover",
                        objectPosition: websitePreviewImage
                          ? "center top"
                          : "center",
                        transform: "translateY(0)",
                        transition: "transform 2000ms ease-out",
                        pointerEvents: "none",
                      }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        pointerEvents: "none",
                        background:
                          "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.24) 24%, rgba(0,0,0,0.55) 54%, rgba(0,0,0,0.82) 75%, rgba(0,0,0,0.96) 100%), linear-gradient(90deg, rgba(0,0,0,0.22) 0%, transparent 46%, rgba(0,0,0,0.18) 100%)",
                      }}
                    />

                    <Box
                      sx={{
                        position: "relative",
                        zIndex: 1,
                        height: { xs: 232, sm: 256, md: 178, xl: 276 },
                        overflow: "hidden",
                      }}
                    >
                      <Chip
                        label={categoryLabel}
                        size="small"
                        sx={{
                          position: "absolute",
                          top: { xs: 10, lg: 12 },
                          left: { xs: 10, lg: 12 },
                          height: { xs: 26, md: 25, lg: 26, xl: 29 },
                          maxWidth: "44%",
                          px: 0.5,
                          fontSize: {
                            xs: "0.72rem",
                            md: "0.61rem",
                            xl: "0.81rem",
                          },
                          fontWeight: 700,
                          color: "#fff",
                          background:
                            "linear-gradient(135deg, #378C92, #2a6b70)",
                          backdropFilter: "blur(6px)",
                          // border: "1px solid rgba(255,255,255,0.14)",
                          borderRadius: "999px",
                          "& .MuiChip-label": {
                            px: 1,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          },
                        }}
                      />

                      <Chip
                        label={ownerLabel}
                        size="small"
                        data-testid={`role-badge-${getWebsiteId(website)}`}
                        sx={{
                          position: "absolute",
                          top: { xs: 10, lg: 12 },
                          right: { xs: 10, lg: 12 },
                          height: { xs: 26, md: 25, lg: 26, xl: 29 },
                          maxWidth: "44%",
                          px: 0.5,
                          fontSize: {
                            xs: "0.45rem",
                            md: "0.45rem",
                            xl: "0.61rem",
                          },
                          fontWeight: 800,
                          color: "#fff",
                          bgcolor:
                            websiteRole === "OWNER"
                              ? "#d97706"
                              : alpha(ROLE_COLORS[websiteRole] || teal, 0.95),
                          borderRadius: "999px",
                          textTransform: "uppercase",
                          "& .MuiChip-label": {
                            px: 1,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          },
                        }}
                      />

                      <Box
                        sx={{
                          position: "absolute",
                          bottom: { xs: 4, md: 5, xl: 7 },
                          left: 0,
                          right: 0,
                          px: { xs: 1.5, lg: 2 },
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 1,
                            mb: { xs: 0.55, md: 0.45, xl: 2 },
                          }}
                        >
                          <Box
                            sx={{
                              display: "inline-flex",
                              px: 1,
                              py: 0.25,
                              borderRadius: "999px",
                              bgcolor: "rgba(255,255,255,0.16)",
                              backdropFilter: "blur(4px)",
                              border: "1px solid rgba(255,255,255,0.2)",
                              flexShrink: 0,
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: {
                                  xs: "0.6rem",
                                  md: "0.5rem",
                                  xl: "0.6rem",
                                },
                                fontWeight: 800,
                                color: "#fff",
                                letterSpacing: "0.07em",
                              }}
                            >
                              {statusLabel}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "inline-flex",
                              alignItems: "center",
                              minWidth: 0,
                              maxWidth: "58%",
                              px: { xs: 1, lg: 1.15 },
                              py: 0.25,
                              borderRadius: "999px",
                              fontSize: {
                                xs: "0.58rem",
                                md: "0.5rem",
                                lg: "0.56rem",
                                xl: "0.64rem",
                              },
                              fontWeight: 700,
                              color: "rgba(255,255,255,0.74)",
                              bgcolor: "rgba(255,255,255,0.12)",
                              backdropFilter: "blur(8px)",
                              border: "1px solid rgba(255,255,255,0.16)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            Template{templateLabel ? ` · ${templateLabel}` : ""}
                          </Box>
                        </Box>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Typography
                            variant="h6"
                            sx={{
                              minWidth: 0,
                              fontSize: {
                                xs: "1.16rem",
                                sm: "1.22rem",
                                md: "0.88rem",
                                lg: "1.06rem",
                                xl: "1.4rem",
                              },
                              fontWeight: 800,
                              color: "#fff",
                              lineHeight: 1.2,
                              textShadow: "0 2px 6px rgba(0,0,0,0.5)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {website.name}
                          </Typography>
                          {isShared && (
                            <Chip
                              label="Shared"
                              size="small"
                              sx={{
                                height: 22,
                                bgcolor: "rgba(0,0,0,0.32)",
                                color: "#fff",
                                fontWeight: 700,
                                fontSize: "0.65rem",
                              }}
                            />
                          )}
                        </Box>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        position: "relative",
                        zIndex: 1,
                        height: { xs: 104, sm: 110, md: 96, xl: 114 },
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        className="website-card-meta"
                        sx={{
                          position: "absolute",
                          inset: 0,
                          px: { xs: 1.25, md: 1, lg: 1.2, xl: 1.8 },
                          pb: { xs: 0.8, md: 0.65, lg: 0.75, xl: 1 },
                          bgcolor: "transparent",
                          display: "flex",
                          flexDirection: "column",
                          transform: "translateY(0)",
                          transition: "transform 300ms ease-in-out",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: {
                              xs: "0.78rem",
                              md: "0.65rem",
                              lg: "0.74rem",
                              xl: "0.86rem",
                            },
                            lineHeight: { xs: 1.5, md: 1.4, xl: 1.6 },
                            color: textSecondary,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {description}
                        </Typography>

                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 1,
                            mt: "auto",
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: {
                                xs: "0.68rem",
                                md: "0.6rem",
                                lg: "0.65rem",
                                xl: "0.74rem",
                              },
                              color: textSecondary,
                              opacity: 0.75,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {pageCountLabel}
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                              color: textSecondary,
                              opacity: 0.6,
                              minWidth: 0,
                            }}
                          >
                            <Clock size={14} />
                            <Typography
                              sx={{
                                fontSize: {
                                  xs: "0.68rem",
                                  md: "0.6rem",
                                  lg: "0.65rem",
                                  xl: "0.74rem",
                                },
                                color: "inherit",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {updatedAtLabel}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                    </Box>

                    <Box
                      onClick={(e) => e.stopPropagation()}
                      sx={{
                        position: "relative",
                        zIndex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        gap: { xs: 0.75, md: 0.5, xl: 0.85 },
                        px: { xs: 1.25, md: 1, lg: 1.2, xl: 1.8 },
                        pb: { xs: 1, md: 0.8, lg: 0.95, xl: 1.35 },
                        pt: { xs: 0.9, md: 0.7, lg: 0.8, xl: 1 },
                        borderTop: `1px solid ${
                          isDarkCard
                            ? "rgba(255,255,255,0.10)"
                            : "rgba(255,255,255,0.14)"
                        }`,
                      }}
                    >
                      <Box
                        className="website-card-action-tray"
                        sx={{
                          minWidth: 0,
                          maxWidth: 0,
                          opacity: 0,
                          overflow: "hidden",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-end",
                          gap: { xs: 0.55, md: 0.35, xl: 0.7 },
                          transform: "translateX(18px)",
                          transition:
                            "max-width 260ms ease, opacity 180ms ease, transform 260ms ease",
                        }}
                      >
                        {secondaryActionItems.map(
                          (
                            {
                              Icon,
                              label,
                              onClick,
                              disabled,
                              tooltip,
                              danger,
                            },
                            actionIndex,
                          ) => (
                            <Tooltip
                              key={label}
                              title={tooltip || label}
                              placement="top"
                              arrow
                            >
                              <Box
                                className="website-card-action-item"
                                component="span"
                                sx={{
                                  opacity: 0,
                                  transform: "translateX(14px)",
                                  transition:
                                    "opacity 180ms ease, transform 240ms ease",
                                  transitionDelay: `${actionIndex * 22}ms`,
                                }}
                              >
                                <IconButton
                                  size="small"
                                  disabled={disabled}
                                  onClick={disabled ? undefined : onClick}
                                  aria-label={label}
                                  sx={{
                                    width: { xs: 33, md: 27, lg: 30, xl: 36 },
                                    height: { xs: 33, md: 27, lg: 30, xl: 36 },
                                    borderRadius: "10px",
                                    color: disabled
                                      ? alpha(textSecondary, 0.42)
                                      : danger
                                        ? "#ef4444"
                                        : teal,
                                    bgcolor: danger
                                      ? "rgba(239,68,68,0.08)"
                                      : isDarkCard
                                        ? "rgba(255,255,255,0.045)"
                                        : "rgba(55,140,146,0.06)",
                                    border: `1px solid ${
                                      danger
                                        ? "rgba(239,68,68,0.18)"
                                        : isDarkCard
                                          ? "rgba(255,255,255,0.07)"
                                          : "rgba(55,140,146,0.10)"
                                    }`,
                                    "&:hover": {
                                      bgcolor: disabled
                                        ? undefined
                                        : danger
                                          ? "rgba(239,68,68,0.14)"
                                          : actionHover,
                                    },
                                  }}
                                >
                                  <Icon size={16} />
                                </IconButton>
                              </Box>
                            </Tooltip>
                          ),
                        )}
                      </Box>

                      {previewAction && (
                        <Tooltip title="Preview" placement="top" arrow>
                          <Box
                            component="button"
                            className="website-card-preview-button"
                            onClick={previewAction.onClick}
                            aria-label="Preview"
                            sx={{
                              width: "auto",
                              height: { xs: 38, md: 33, lg: 36, xl: 42 },
                              minWidth: { xs: 104, md: 84, lg: 96, xl: 112 },
                              flexShrink: 0,
                              borderRadius: "10px",
                              border: "none",
                              px: { xs: 1.35, md: 1.05, lg: 1.2, xl: 1.45 },
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 0,
                              color: "#fff",
                              background:
                                "linear-gradient(135deg, #378C92, #2a6b70)",
                              boxShadow: "none",
                              cursor: "pointer",
                              fontFamily: "inherit",
                              fontWeight: 700,
                              fontSize: {
                                xs: "0.78rem",
                                md: "0.64rem",
                                lg: "0.72rem",
                                xl: "0.84rem",
                              },
                              lineHeight: 1,
                              overflow: "hidden",
                              transition:
                                "min-width 260ms ease, padding 260ms ease, background 160ms ease",
                              "&:hover": {
                                background:
                                  "linear-gradient(135deg, #2e7a80, #225a5f)",
                                boxShadow: "none",
                              },
                            }}
                          >
                            <Eye size={17} />
                            <Box
                              component="span"
                              className="website-card-preview-label"
                              sx={{
                                display: "inline-block",
                                maxWidth: 72,
                                ml: 0.75,
                                opacity: 1,
                                overflow: "hidden",
                                whiteSpace: "nowrap",
                                transform: "translateX(0)",
                                scale: 0.9,
                                transition:
                                  "max-width 240ms ease, opacity 160ms ease, transform 220ms ease, margin-left 240ms ease",
                              }}
                            >
                              Preview
                            </Box>
                          </Box>
                        </Tooltip>
                      )}
                    </Box>
                  </Card>
                </Grid>
              );
            })}

          {/* Loading More Skeletons */}

          {activeLoadingMore &&
            [...Array(3)].map((_, index) => (
              <Grid item xs={12} sm={6} md={3} key={`loading-more-${index}`}>
                <SkeletonCard />
              </Grid>
            ))}

          {/* Empty State for Filtered Views (Step 7.4.5) */}

          {!loading && filteredWebsites.length === 0 && websites.length > 0 && (
            <Grid item xs={12}>
              <EmptyState
                icon={<Globe size={48} color={colors.textSecondary} />}
                title={
                  roleFilter === "shared"
                    ? "No shared websites"
                    : roleFilter === "owned"
                      ? "No owned websites match"
                      : "No websites found"
                }
                subtitle={
                  roleFilter === "shared"
                    ? "When someone shares a website with you, it will appear here."
                    : "Try changing your filter to see other websites."
                }
                action={
                  roleFilter !== "all" && (
                    <Button
                      variant="outlined"
                      onClick={() => setRoleFilter("all")}
                      sx={{
                        textTransform: "none",

                        borderColor: colors.primary,

                        color: colors.primary,

                        fontWeight: 600,
                      }}
                    >
                      Show All Websites
                    </Button>
                  )
                }
              />
            </Grid>
          )}

          {/* Observer Target for Infinite Scroll */}

          {!loading && activeHasMore && (
            <Grid item xs={12}>
              <Box ref={observerTarget} sx={{ height: 20 }} />
            </Grid>
          )}
        </Grid>
      )}

      {/* Recently Deleted Section */}

      {viewMode === "deleted" && (
        <>
          {deletedItems.length === 0 && !loading && !error && (
            <Card
              sx={{
                background: `linear-gradient(135deg, ${alpha(colors.primary, 0.05)} 0%, ${alpha(colors.primaryDark, 0.02)} 100%)`,

                border: `1px solid ${alpha(colors.primary, 0.1)}`,

                borderRadius: 3,

                textAlign: "center",

                py: 8,
              }}
            >
              <CardContent>
                <Box sx={{ color: alpha(colors.textSecondary, 0.3), mb: 2 }}>
                  <Trash2 size={80} />
                </Box>

                <Typography
                  variant="h5"
                  sx={{ color: colors.text, fontWeight: 600, mb: 1 }}
                >
                  No recently deleted items
                </Typography>

                <Typography
                  variant="body1"
                  sx={{ color: colors.textSecondary }}
                >
                  Deleted websites and stores will appear here and be
                  permanently deleted after 30 days
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* Loading Skeletons */}

          {loading && (
            <Grid container spacing={3}>
              {[...Array(6)].map((_, index) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  key={`skeleton-deleted-${index}`}
                >
                  <SkeletonCard />
                </Grid>
              ))}
            </Grid>
          )}

          {deletedItems.length > 0 && !loading && (
            <>
              <Alert severity="info" sx={{ mb: 3 }}>
                Items in Recently Deleted will be permanently deleted after 30
                days. You can restore them anytime before then.
              </Alert>

              <Grid container spacing={3}>
                {deletedItems.map((item) => {
                  const daysRemaining = getDaysRemaining(item.deletedAt);

                  const isStore = item.itemType === "store";
                  const deletedCardImage =
                    getWebsitePreviewImage(item) || WEBSITE_CARD_FALLBACK_IMAGE;
                  const deletedDescription =
                    getWebsiteDescription(item) ||
                    (item.deletedAt
                      ? `Deleted ${new Date(item.deletedAt).toLocaleDateString()}`
                      : "Recently deleted item");

                  return (
                    <Grid
                      item
                      xs={12}
                      sm={6}
                      md={4}
                      key={`${item.itemType}-${item.id}`}
                    >
                      <Card
                        sx={{
                          minHeight: { xs: 300, sm: 360, lg: 380 },

                          position: "relative",

                          overflow: "hidden",

                          borderRadius: "1em",

                          border: "none",

                          opacity: 0.85,
                          color: "#fff",
                          display: "flex",
                          alignItems: "flex-end",
                          p: { xs: 2.5, md: 3 },
                          isolation: "isolate",
                          backgroundImage: `linear-gradient(rgba(0,0,0,0.62), rgba(0,0,0,0.62)), url("${escapeCssUrl(deletedCardImage)}")`,
                          backgroundSize: "cover",
                          backgroundPosition: "top center",
                          filter: "grayscale(0.35)",

                          transition: "all 0.3s ease",
                          "&::before, &::after": {
                            content: '""',
                            position: "absolute",
                            inset: 0,
                            transform: "scaleY(0)",
                            transformOrigin: "bottom",
                            transition:
                              "transform 760ms cubic-bezier(0.19, 1, 0.22, 1)",
                            pointerEvents: "none",
                            zIndex: 1,
                          },
                          "&::before": {
                            background:
                              "linear-gradient(to top, rgba(255,255,255,0.55) 0%, transparent 72%)",
                          },
                          "&::after": {
                            background:
                              "linear-gradient(to top, rgba(255,255,255,0.98) 0%, transparent 100%)",
                          },

                          "&:hover": {
                            opacity: 1,

                            transform: "translateY(-4px)",

                            boxShadow: `0 8px 24px ${alpha(colors.textSecondary, 0.2)}`,
                            "&::before, &::after": {
                              transform: "scaleY(1)",
                            },
                            "& .deleted-card-copy": {
                              color: "#1f2937",
                            },

                            "& .hover-actions": {
                              opacity: 1,
                            },
                            "& .deleted-card-actions": {
                              opacity: 1,
                              transform: "translateY(0)",
                              pointerEvents: "auto",
                            },
                          },
                          "&:focus-within": {
                            opacity: 1,
                            transform: "translateY(-4px)",
                            boxShadow: `0 8px 24px ${alpha(colors.textSecondary, 0.2)}`,
                            "&::before, &::after": {
                              transform: "scaleY(1)",
                            },
                            "& .deleted-card-copy": {
                              color: "#1f2937",
                            },
                            "& .deleted-card-actions": {
                              opacity: 1,
                              transform: "translateY(0)",
                              pointerEvents: "auto",
                            },
                          },
                        }}
                      >
                        {/* Preview Background - Grayed out */}

                        <Box
                          sx={{
                            position: "absolute",

                            inset: 0,

                            borderRadius: "1em",

                            pointerEvents: "none",

                            zIndex: 10,

                            p: "1px",

                            background:
                              "linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.04), rgba(255,255,255,0.1))",

                            WebkitMask:
                              "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",

                            WebkitMaskComposite: "xor",

                            maskComposite: "exclude",
                          }}
                        />

                        {/* Type Badge */}

                        <Chip
                          label={
                            isStore ? "Store" : getWebsiteCategoryLabel(item)
                          }
                          size="small"
                          sx={{
                            position: "absolute",

                            top: 12,

                            left: 12,
                            zIndex: 4,

                            bgcolor: isStore
                              ? alpha("#9c27b0", 0.9)
                              : alpha(colors.primary, 0.9),

                            color: "#fff",

                            fontWeight: 700,

                            fontSize: "0.68rem",

                            backdropFilter: "blur(10px)",
                          }}
                        />

                        {/* Days Remaining Badge */}

                        <Chip
                          label={
                            daysRemaining === null || daysRemaining === 0
                              ? "0d"
                              : `${daysRemaining}d`
                          }
                          size="small"
                          sx={{
                            position: "absolute",

                            top: 12,

                            right: 12,
                            zIndex: 4,

                            bgcolor:
                              daysRemaining === null || daysRemaining <= 7
                                ? alpha("#f44336", 0.9)
                                : alpha(colors.textSecondary, 0.8),

                            color: "#fff",

                            fontWeight: 600,

                            fontSize: "0.7rem",

                            backdropFilter: "blur(10px)",
                          }}
                        />

                        {/* Hover Actions */}

                        <Box
                          className="deleted-card-copy"
                          sx={{
                            position: "relative",

                            zIndex: 3,

                            width: "100%",

                            color: "#fff",

                            transition:
                              "color 700ms cubic-bezier(0.19, 1, 0.22, 1)",
                          }}
                        >
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 800,

                              lineHeight: 1.15,

                              mb: 0.75,

                              overflow: "hidden",

                              textOverflow: "ellipsis",

                              whiteSpace: "nowrap",
                            }}
                          >
                            {item.name}
                          </Typography>

                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: "0.86rem",

                              lineHeight: 1.45,

                              display: "-webkit-box",

                              WebkitLineClamp: 2,

                              WebkitBoxOrient: "vertical",

                              overflow: "hidden",

                              maxWidth: "95%",
                            }}
                          >
                            {deletedDescription}
                          </Typography>

                          {item.deletedAt && (
                            <Typography
                              variant="caption"
                              sx={{
                                display: "block",

                                mt: 0.75,

                                fontSize: "0.72rem",

                                fontWeight: 700,

                                mb: 0,
                              }}
                            >
                              Deleted{" "}
                              {new Date(item.deletedAt).toLocaleDateString()}
                            </Typography>
                          )}

                          <Box
                            className="deleted-card-actions"
                            onClick={(e) => e.stopPropagation()}
                            sx={{
                              mt: 2,
                              display: "flex",
                              gap: 1,
                              flexWrap: "wrap",
                              opacity: 0,
                              transform: "translateY(10px)",
                              pointerEvents: "none",
                              transition:
                                "opacity 260ms ease, transform 260ms cubic-bezier(0.19, 1, 0.22, 1)",
                            }}
                          >
                            <Button
                              size="small"
                              startIcon={<RotateCcw size={16} />}
                              onClick={() => handleRestoreItem(item)}
                              disabled={restoring}
                              sx={{
                                color: colors.primary,

                                textTransform: "none",

                                fontWeight: 600,

                                fontSize: "0.75rem",

                                "&:hover": {
                                  bgcolor: alpha(colors.primary, 0.1),
                                },
                              }}
                            >
                              Restore
                            </Button>

                            <Button
                              size="small"
                              startIcon={<Trash size={16} />}
                              onClick={() =>
                                handleOpenPermanentDeleteDialog(item)
                              }
                              sx={{
                                color: "#f44336",

                                textTransform: "none",

                                fontWeight: 600,

                                fontSize: "0.75rem",

                                "&:hover": { bgcolor: alpha("#f44336", 0.1) },
                              }}
                            >
                              Delete Forever
                            </Button>
                          </Box>
                        </Box>
                      </Card>
                    </Grid>
                  );
                })}

                {/* Loading More Skeletons */}

                {deletedLoadingMore &&
                  [...Array(3)].map((_, index) => (
                    <Grid
                      item
                      xs={12}
                      sm={6}
                      md={4}
                      key={`loading-more-deleted-${index}`}
                    >
                      <SkeletonCard />
                    </Grid>
                  ))}

                {/* Observer Target for Infinite Scroll */}

                {deletedHasMore && (
                  <Grid item xs={12}>
                    <Box ref={observerTarget} sx={{ height: 20 }} />
                  </Grid>
                )}
              </Grid>
            </>
          )}
        </>
      )}

      {/* Create Website Dialog */}

      <Dialog
        open={createDialogOpen}
        onClose={() => !submitting && setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: colors.bgCard,

            borderRadius: 3,

            border: `1px solid ${colors.border}`,
          },
        }}
      >
        <DialogTitle
          sx={{
            color: colors.text,

            fontWeight: 700,

            borderBottom: `0.5px solid ${colors.border}`,
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6" fontWeight={700}>
              Create Website
            </Typography>

            <IconButton
              size="small"
              onClick={() => setCreateDialogOpen(false)}
              disabled={submitting}
            >
              <X size={18} />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers sx={{ borderColor: colors.border, pt: 3 }}>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}

          {templatesError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {templatesError}
            </Alert>
          )}

          <Typography
            variant="subtitle2"
            sx={{ mb: 2, color: colors.text, fontWeight: 600 }}
          >
            Select a Template *
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 2,
              mb: 3,
            }}
          >
            {templatesLoading && (
              <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                Loading templates...
              </Typography>
            )}

            {websiteTemplates.map((template) => (
              <Card
                key={template.id}
                onClick={() => {
                  setFormData({
                    ...formData,

                    templateId: template.id,

                    primaryColor:
                      template.defaultWebsiteConfig?.primaryColor ||
                      formData.primaryColor,
                  });
                }}
                sx={{
                  cursor: "pointer",

                  border:
                    formData.templateId === template.id
                      ? `2px solid ${colors.primary}`
                      : `1px solid ${colors.border}`,

                  borderRadius: 2,

                  transition: "all 0.2s",

                  position: "relative",

                  "&:hover": {
                    borderColor: colors.primary,

                    transform: "translateY(-2px)",
                  },
                }}
              >
                {formData.templateId === template.id && (
                  <Box
                    sx={{
                      position: "absolute",

                      top: 8,

                      right: 8,

                      background: colors.primary,

                      borderRadius: "50%",

                      width: 24,

                      height: 24,

                      display: "flex",

                      alignItems: "center",

                      justifyContent: "center",
                    }}
                  >
                    <CircleCheck size={16} color="#fff" />
                  </Box>
                )}

                <CardContent>
                  <Typography
                    variant="subtitle1"
                    sx={{ color: colors.text, fontWeight: 600, mb: 0.5 }}
                  >
                    {template.name}
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{ color: colors.textSecondary, display: "block" }}
                  >
                    {template.description}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>

          <DashboardInput
            fullWidth
            label="Website Name"
            labelPlacement="floating"
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });

              // Auto-generate slug

              const slug = e.target.value

                .toLowerCase()

                .replace(/[^a-z0-9]+/g, "-")

                .replace(/^-|-$/g, "");

              setFormData({ ...formData, name: e.target.value, slug });
            }}
            disabled={submitting}
            containerSx={{ mb: 2 }}
            helperText="Example: Hassan Tech Solutions"
          />

          <DashboardInput
            fullWidth
            label="Slug"
            labelPlacement="floating"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            disabled={submitting}
            containerSx={{ mb: 2 }}
            helperText="URL-safe identifier (example: hassan-tech-solutions)"
          />

          <Box sx={{ mb: 2 }}>
            <ColorPickerWithAlpha
              value={formData.primaryColor}
              onChange={(color) =>
                setFormData({ ...formData, primaryColor: color })
              }
              label="Primary Color"
              helperText="Theme color for your website"
              showAlpha={true}
              disabled={submitting}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setCreateDialogOpen(false)}
            disabled={submitting}
          >
            Cancel
          </Button>

          <DashboardActionButton
            onClick={handleCreateWebsite}
            disabled={
              submitting ||
              !formData.name ||
              !formData.slug ||
              !formData.templateId
            }
            sx={{ px: 3 }}
          >
            {submitting ? (
              <CircularProgress size={24} sx={{ color: "inherit" }} />
            ) : (
              "Create"
            )}
          </DashboardActionButton>
        </DialogActions>
      </Dialog>

      {/* Create Store Website Dialog */}

      <Dialog
        open={createStoreDialogOpen}
        onClose={() => !storeLoading && setCreateStoreDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: colors.bgCard,

            borderRadius: 3,

            border: `1px solid ${colors.border}`,
          },
        }}
      >
        <DialogTitle
          sx={{
            color: colors.text,

            fontWeight: 700,

            borderBottom: `0.5px solid ${colors.border}`,
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6" fontWeight={700}>
              Create Store Website
            </Typography>

            <IconButton
              size="small"
              onClick={() => setCreateStoreDialogOpen(false)}
              disabled={storeLoading}
            >
              <X size={18} />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers sx={{ borderColor: colors.border, pt: 3 }}>
          {storeError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {storeError}
            </Alert>
          )}

          {partialError && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {partialError}
            </Alert>
          )}

          <Typography
            variant="body2"
            sx={{ color: colors.textSecondary, mb: 3 }}
          >
            Create a website with a built-in e-commerce store for selling
            products online.
          </Typography>

          <Typography
            variant="subtitle2"
            sx={{ mb: 2, color: colors.text, fontWeight: 600 }}
          >
            Select a Store Template *
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 2,
              mb: 3,
            }}
          >
            {templatesLoading && (
              <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                Loading templates...
              </Typography>
            )}

            {storeTemplates.map((template) => (
              <Card
                key={template.id}
                onClick={() => {
                  setStoreFormData({
                    ...storeFormData,

                    templateId: template.id,

                    primaryColor:
                      template.defaultWebsiteConfig?.primaryColor ||
                      storeFormData.primaryColor,
                  });
                }}
                sx={{
                  cursor: "pointer",

                  border:
                    storeFormData.templateId === template.id
                      ? `2px solid ${colors.primary}`
                      : `1px solid ${colors.border}`,

                  borderRadius: 2,

                  transition: "all 0.2s",

                  position: "relative",

                  "&:hover": {
                    borderColor: colors.primary,

                    transform: "translateY(-2px)",
                  },
                }}
              >
                {storeFormData.templateId === template.id && (
                  <Box
                    sx={{
                      position: "absolute",

                      top: 8,

                      right: 8,

                      background: colors.primary,

                      borderRadius: "50%",

                      width: 24,

                      height: 24,

                      display: "flex",

                      alignItems: "center",

                      justifyContent: "center",
                    }}
                  >
                    <CircleCheck size={16} color="#fff" />
                  </Box>
                )}

                <CardContent>
                  <Typography
                    variant="subtitle1"
                    sx={{ color: colors.text, fontWeight: 600, mb: 0.5 }}
                  >
                    {template.name}
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{ color: colors.textSecondary, display: "block" }}
                  >
                    {template.description}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>

          <Typography
            variant="subtitle2"
            sx={{ mb: 2, color: colors.text, fontWeight: 600 }}
          >
            Website Details
          </Typography>

          <DashboardInput
            fullWidth
            label="Website Name"
            labelPlacement="floating"
            value={storeFormData.websiteName}
            onChange={(e) => {
              const name = e.target.value;

              const slug = name

                .toLowerCase()

                .replace(/[^a-z0-9]+/g, "-")

                .replace(/^-|-$/g, "");

              setStoreFormData({
                ...storeFormData,

                websiteName: name,

                websiteSlug: slug,

                storeName: name, // Auto-populate store name

                storeSlug: slug, // Auto-populate store slug
              });
            }}
            disabled={storeLoading}
            containerSx={{ mb: 2 }}
            helperText="Example: My Online Store"
          />

          <DashboardInput
            fullWidth
            label="Website Slug"
            labelPlacement="floating"
            value={storeFormData.websiteSlug}
            onChange={(e) =>
              setStoreFormData({
                ...storeFormData,
                websiteSlug: e.target.value,
              })
            }
            disabled={storeLoading}
            containerSx={{ mb: 2 }}
            helperText="URL-safe identifier"
          />

          <Box sx={{ mb: 3 }}>
            <ColorPickerWithAlpha
              value={storeFormData.primaryColor}
              onChange={(color) =>
                setStoreFormData({ ...storeFormData, primaryColor: color })
              }
              label="Primary Color"
              helperText="Brand color for your store"
              showAlpha={true}
              disabled={storeLoading}
            />
          </Box>

          <Typography
            variant="subtitle2"
            sx={{ mb: 2, color: colors.text, fontWeight: 600 }}
          >
            Store Details
          </Typography>

          <DashboardInput
            fullWidth
            label="Store Name"
            labelPlacement="floating"
            value={storeFormData.storeName}
            onChange={(e) => {
              const name = e.target.value;

              const slug = name

                .toLowerCase()

                .replace(/[^a-z0-9]+/g, "-")

                .replace(/^-|-$/g, "");

              setStoreFormData({
                ...storeFormData,
                storeName: name,
                storeSlug: slug,
              });
            }}
            disabled={storeLoading}
            containerSx={{ mb: 2 }}
            helperText="Display name for your store"
          />

          <DashboardInput
            fullWidth
            label="Store Slug"
            labelPlacement="floating"
            value={storeFormData.storeSlug}
            onChange={(e) =>
              setStoreFormData({ ...storeFormData, storeSlug: e.target.value })
            }
            disabled={storeLoading}
            containerSx={{ mb: 2 }}
            helperText="Used in your store URL"
          />

          <DashboardSelect
            fullWidth
            label="Currency"
            value={storeFormData.currency}
            onChange={(e) =>
              setStoreFormData({ ...storeFormData, currency: e.target.value })
            }
            disabled={storeLoading}
            native
          >
            <option value="USD">USD - US Dollar</option>

            <option value="EUR">EUR - Euro</option>

            <option value="GBP">GBP - British Pound</option>

            <option value="PKR">PKR - Pakistani Rupee</option>
          </DashboardSelect>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setCreateStoreDialogOpen(false)}
            disabled={storeLoading}
          >
            Cancel
          </Button>

          <DashboardActionButton
            onClick={handleCreateStoreWebsite}
            disabled={
              storeLoading ||
              !storeFormData.websiteName ||
              !storeFormData.websiteSlug ||
              !storeFormData.storeName ||
              !storeFormData.storeSlug ||
              !storeFormData.templateId
            }
            sx={{ px: 3 }}
          >
            {storeLoading ? (
              <CircularProgress size={24} sx={{ color: "inherit" }} />
            ) : (
              "Create Store Website"
            )}
          </DashboardActionButton>
        </DialogActions>
      </Dialog>

      {/* Website Settings Dialog */}

      <Dialog
        open={settingsDialogOpen}
        onClose={() => !submitting && setSettingsDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: colors.bgCard,

            borderRadius: 3,

            border: `1px solid ${colors.border}`,
          },
        }}
      >
        <DialogTitle
          sx={{
            color: colors.text,

            fontWeight: 700,

            borderBottom: `0.5px solid ${colors.border}`,
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6" fontWeight={700}>
              Website Settings
            </Typography>

            <IconButton
              size="small"
              onClick={() => setSettingsDialogOpen(false)}
              disabled={submitting}
            >
              <X size={18} />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers sx={{ borderColor: colors.border, pt: 3 }}>
          {settingsError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {settingsError}
            </Alert>
          )}

          <Typography
            variant="subtitle2"
            sx={{ mb: 2, color: colors.textSecondary }}
          >
            Basic Information
          </Typography>

          <DashboardInput
            fullWidth
            label="Website Name *"
            labelPlacement="floating"
            value={settingsFormData.name}
            onChange={(e) =>
              setSettingsFormData({ ...settingsFormData, name: e.target.value })
            }
            disabled={submitting}
            sx={{ mb: 2 }}
            helperText="Display name for your website"
          />

          <DashboardInput
            fullWidth
            label="Slug (Read-only)"
            labelPlacement="floating"
            value={editingWebsite?.slug || ""}
            disabled
            sx={{ mb: 2 }}
            helperText="Cannot be changed after creation"
          />

          <DashboardInput
            fullWidth
            label="Status (Read-only)"
            labelPlacement="floating"
            value={editingWebsite?.status?.toUpperCase() || ""}
            disabled
            sx={{ mb: 3 }}
            helperText="Use Publish/Unpublish buttons to change status"
          />

          <Typography
            variant="subtitle2"
            sx={{ mb: 2, color: colors.textSecondary }}
          >
            Appearance
          </Typography>

          <Box sx={{ mb: 2 }}>
            <ColorPickerWithAlpha
              value={settingsFormData.primaryColor}
              onChange={(color) =>
                setSettingsFormData({
                  ...settingsFormData,
                  primaryColor: color,
                })
              }
              label="Primary Color"
              helperText="Theme color for your website"
              showAlpha={true}
              disabled={submitting}
            />
          </Box>

          <DashboardInput
            fullWidth
            label="Google Analytics Measurement ID"
            labelPlacement="floating"
            value={settingsFormData.gaMeasurementId || ""}
            onChange={(e) =>
              setSettingsFormData({
                ...settingsFormData,
                gaMeasurementId: e.target.value,
              })
            }
            disabled={submitting}
            placeholder="G-XXXXXXXXXX"
            sx={{ mb: 2 }}
            helperText="Optional: Add your GA4 Measurement ID to enable analytics tracking"
          />

          <Box sx={{ mb: 2 }}>
            <DashboardInput
              fullWidth
              label="Logo URL"
              labelPlacement="floating"
              value={settingsFormData.logoUrl}
              onChange={(e) =>
                setSettingsFormData({
                  ...settingsFormData,
                  logoUrl: e.target.value,
                })
              }
              disabled={submitting || uploadingLogo}
              helperText="URL to your logo image (optional)"
            />

            <Box sx={{ mt: 1, display: "flex", gap: 2, alignItems: "center" }}>
              <Button
                component="label"
                variant="outlined"
                startIcon={
                  uploadingLogo ? (
                    <CircularProgress size={16} />
                  ) : (
                    <Upload size={18} />
                  )
                }
                disabled={submitting || uploadingLogo}
                sx={{
                  textTransform: "none",

                  borderColor: colors.primary,

                  color: colors.primary,

                  "&:hover": {
                    borderColor: colors.primaryDark,

                    bgcolor: alpha(colors.primary, 0.1),
                  },
                }}
              >
                {uploadingLogo ? "Uploading..." : "Upload Logo"}

                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleUploadLogo}
                />
              </Button>

              {settingsFormData.logoUrl && (
                <Box
                  component="img"
                  src={settingsFormData.logoUrl}
                  alt="Logo preview"
                  sx={{
                    maxHeight: 50,

                    maxWidth: 150,

                    objectFit: "contain",

                    border: `1px solid ${alpha(colors.text, 0.2)}`,

                    borderRadius: 1,

                    p: 1,
                  }}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              )}
            </Box>
          </Box>

          <Box sx={{ mb: 3 }}>
            <DashboardInput
              fullWidth
              label="Favicon URL"
              labelPlacement="floating"
              value={settingsFormData.faviconUrl}
              onChange={(e) =>
                setSettingsFormData({
                  ...settingsFormData,
                  faviconUrl: e.target.value,
                })
              }
              disabled={submitting || uploadingFavicon}
              helperText="URL to your favicon image (optional)"
            />

            <Box sx={{ mt: 1, display: "flex", gap: 2, alignItems: "center" }}>
              <Button
                component="label"
                variant="outlined"
                startIcon={
                  uploadingFavicon ? (
                    <CircularProgress size={16} />
                  ) : (
                    <Upload size={18} />
                  )
                }
                disabled={submitting || uploadingFavicon}
                sx={{
                  textTransform: "none",

                  borderColor: colors.primary,

                  color: colors.primary,

                  "&:hover": {
                    borderColor: colors.primaryDark,

                    bgcolor: alpha(colors.primary, 0.1),
                  },
                }}
              >
                {uploadingFavicon ? "Uploading..." : "Upload Favicon"}

                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleUploadFavicon}
                />
              </Button>

              {settingsFormData.faviconUrl && (
                <Box
                  component="img"
                  src={settingsFormData.faviconUrl}
                  alt="Favicon preview"
                  sx={{
                    height: 32,

                    width: 32,

                    objectFit: "contain",

                    border: `1px solid ${alpha(colors.text, 0.2)}`,

                    borderRadius: 1,

                    p: 0.5,
                  }}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              )}
            </Box>
          </Box>

          <Typography
            variant="subtitle2"
            sx={{ mb: 2, color: colors.textSecondary }}
          >
            SEO & Meta Tags
          </Typography>

          <DashboardInput
            fullWidth
            label="Meta Title"
            labelPlacement="floating"
            value={settingsFormData.metaTitle}
            onChange={(e) =>
              setSettingsFormData({
                ...settingsFormData,
                metaTitle: e.target.value,
              })
            }
            disabled={submitting}
            sx={{ mb: 2 }}
            helperText="Default SEO title for your website (optional)"
          />

          <DashboardInput
            fullWidth
            label="Meta Description"
            labelPlacement="floating"
            value={settingsFormData.metaDescription}
            onChange={(e) =>
              setSettingsFormData({
                ...settingsFormData,
                metaDescription: e.target.value,
              })
            }
            disabled={submitting}
            multiline
            rows={3}
            helperText="Default SEO description for your website (optional)"
          />
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setSettingsDialogOpen(false)}
            disabled={submitting}
          >
            Cancel
          </Button>

          <DashboardActionButton
            onClick={handleSaveSettings}
            disabled={submitting || !settingsFormData.name}
          >
            {submitting ? (
              <CircularProgress size={24} sx={{ color: "inherit" }} />
            ) : (
              "Save Changes"
            )}
          </DashboardActionButton>
        </DialogActions>
      </Dialog>

      {/* Analytics Dialog */}

      <Dialog
        open={analyticsDialogOpen}
        onClose={() => setAnalyticsDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            background: colors.bgCard,

            borderRadius: 3,

            border: `1px solid ${colors.border}`,
          },
        }}
      >
        <DialogTitle
          sx={{
            color: colors.text,

            fontWeight: 700,

            borderBottom: `0.5px solid ${colors.border}`,
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6" fontWeight={700}>
              Analytics - {selectedWebsiteForAnalytics?.name}
            </Typography>

            <IconButton
              size="small"
              onClick={() => setAnalyticsDialogOpen(false)}
            >
              <X size={18} />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers sx={{ borderColor: colors.border, pt: 3 }}>
          {selectedWebsiteForAnalytics && (
            <WebsiteAnalytics
              websiteId={getWebsiteId(selectedWebsiteForAnalytics)}
            />
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setAnalyticsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Upgrade Dialog for Plan Limits */}

      <Dialog
        open={upgradeDialogOpen}
        onClose={() => setUpgradeDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: colors.bgCard,

            borderRadius: 3,

            border: `1px solid ${colors.border}`,
          },
        }}
      >
        <DialogTitle
          sx={{
            color: colors.text,

            fontWeight: 700,

            borderBottom: `0.5px solid ${colors.border}`,
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6" fontWeight={700}>
              Plan Limit Reached
            </Typography>

            <IconButton
              size="small"
              onClick={() => setUpgradeDialogOpen(false)}
            >
              <X size={18} />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers sx={{ borderColor: colors.border, pt: 3 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            {planLimitMessage ||
              "You have reached the limit for your current plan."}
          </Alert>

          <Typography variant="body2" sx={{ mb: 2 }}>
            Upgrade your plan to create more websites and unlock additional
            features like:
          </Typography>

          <Box component="ul" sx={{ pl: 3, mb: 0 }}>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              More websites and pages
            </Typography>

            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              Increased sections per page
            </Typography>

            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              Advanced analytics and insights
            </Typography>

            <Typography component="li" variant="body2">
              Priority directory ranking
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setUpgradeDialogOpen(false)}>
            Maybe Later
          </Button>

          <DashboardActionButton
            onClick={() => {
              setUpgradeDialogOpen(false);

              navigate("/pricing");
            }}
          >
            View Plans
          </DashboardActionButton>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}

      {/* Clone / Duplicate Website Dialog */}

      <Dialog
        open={cloneDialogOpen}
        onClose={() => !cloning && setCloneDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: colors.bgCard,

            borderRadius: 3,

            border: `1px solid ${colors.border}`,
          },
        }}
      >
        <DialogTitle
          sx={{
            color: colors.text,

            fontWeight: 700,

            borderBottom: `0.5px solid ${colors.border}`,
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6" fontWeight={700}>
              Clone Website
            </Typography>

            <IconButton
              size="small"
              onClick={() => setCloneDialogOpen(false)}
              disabled={cloning}
            >
              <X size={18} />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers sx={{ borderColor: colors.border, pt: 3 }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            This creates a new copy of{" "}
            <Box component="span" sx={{ fontWeight: 700 }}>
              {websiteToClone?.name}
            </Box>{" "}
            with its own name and address. The original stays unchanged.
          </Alert>

          {cloneError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {cloneError}
            </Alert>
          )}

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <DashboardInput
              label="New website name"
              fullWidth
              value={cloneFormData.name}
              onChange={(e) =>
                setCloneFormData((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              disabled={cloning}
              placeholder="e.g., My Website Copy"
            />

            <DashboardInput
              label="New website slug"
              fullWidth
              value={cloneFormData.slug}
              onChange={(e) =>
                setCloneFormData((prev) => ({
                  ...prev,
                  slug: slugifyWebsiteValue(e.target.value),
                }))
              }
              disabled={cloning}
              placeholder="my-website-copy"
              helperText="Used in the website address. Lowercase letters, numbers, and dashes."
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCloneDialogOpen(false)} disabled={cloning}>
            Cancel
          </Button>

          <Button
            onClick={handleCloneWebsite}
            variant="contained"
            disabled={
              cloning ||
              !cloneFormData.name.trim() ||
              !cloneFormData.slug.trim()
            }
            startIcon={
              cloning ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <Copy size={16} />
              )
            }
            sx={{
              background: colors.primary,

              color: "#fff",

              textTransform: "none",

              fontWeight: 600,

              "&:hover": { background: colors.primary },

              "&.Mui-disabled": {
                background: alpha(colors.textSecondary, 0.2),

                color: alpha(colors.text, 0.4),
              },
            }}
          >
            {cloning ? "Cloning..." : "Clone Website"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => !deleting && setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: colors.bgCard,

            borderRadius: 3,

            border: `1px solid ${colors.border}`,
          },
        }}
      >
        <DialogTitle
          sx={{
            color: colors.text,

            fontWeight: 700,

            borderBottom: `0.5px solid ${colors.border}`,
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6" fontWeight={700}>
              Move to Recently Deleted
            </Typography>

            <IconButton
              size="small"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              <X size={18} />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers sx={{ borderColor: colors.border, pt: 3 }}>
          <Alert severity="warning" sx={{ mb: 3 }}>
            This website will be moved to Recently Deleted and permanently
            deleted after 30 days. You can restore it anytime within this
            period.
          </Alert>

          {websiteToDelete && (
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="body1"
                sx={{ color: colors.text, mb: 1, fontWeight: 600 }}
              >
                You are about to move this website to Recently Deleted:
              </Typography>

              <Box
                sx={{
                  p: 2,

                  bgcolor: alpha(colors.primary, 0.05),

                  borderRadius: 2,

                  border: `1px solid ${alpha(colors.primary, 0.2)}`,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ color: colors.text, fontWeight: 700 }}
                >
                  {websiteToDelete.name}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ color: colors.textSecondary }}
                >
                  {websiteToDelete.slug}
                </Typography>
              </Box>
            </Box>
          )}

          <Typography
            variant="body2"
            sx={{ color: colors.text, mb: 2, fontWeight: 600 }}
          >
            To confirm, please type the website name{" "}
            <Box
              component="span"
              sx={{ fontWeight: 700, fontFamily: "monospace" }}
            >
              {websiteToDelete?.name}
            </Box>{" "}
            below:
          </Typography>

          <DashboardInput
            fullWidth
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            disabled={deleting}
            placeholder={`Type "${websiteToDelete?.name}" to confirm`}
          />
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleting}
          >
            Cancel
          </Button>

          <Button
            onClick={handleDeleteWebsite}
            variant="contained"
            disabled={deleting || deleteConfirmText !== websiteToDelete?.name}
            sx={{
              background:
                deleteConfirmText === websiteToDelete?.name
                  ? "#f44336"
                  : alpha(colors.textSecondary, 0.2),

              color:
                deleteConfirmText === websiteToDelete?.name
                  ? "#fff"
                  : colors.textSecondary,

              fontWeight: 600,

              "&:hover": {
                background:
                  deleteConfirmText === websiteToDelete?.name
                    ? "#d32f2f"
                    : alpha(colors.textSecondary, 0.3),
              },

              "&:disabled": {
                background: alpha(colors.textSecondary, 0.2),

                color: colors.textSecondary,
              },
            }}
          >
            {deleting ? (
              <CircularProgress size={24} />
            ) : (
              "Move to Recently Deleted"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Permanent Delete Confirmation Dialog */}

      <Dialog
        open={permanentDeleteDialogOpen}
        onClose={() =>
          !permanentlyDeleting && setPermanentDeleteDialogOpen(false)
        }
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: colors.bgCard,

            borderRadius: 3,

            border: `2px solid #f44336`,
          },
        }}
      >
        <DialogTitle
          sx={{
            color: colors.text,

            fontWeight: 700,

            borderBottom: `0.5px solid ${colors.border}`,
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6" fontWeight={700} sx={{ color: "#f44336" }}>
              Permanently Delete{" "}
              {websiteToPermanentlyDelete?.itemType === "store"
                ? "Store"
                : "Website"}
            </Typography>

            <IconButton
              size="small"
              onClick={() => setPermanentDeleteDialogOpen(false)}
              disabled={permanentlyDeleting}
            >
              <X size={18} />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers sx={{ borderColor: colors.border, pt: 3 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            This action cannot be undone. All{" "}
            {websiteToPermanentlyDelete?.itemType === "store"
              ? "store data, products, and orders"
              : "website data, pages, and content"}{" "}
            will be permanently deleted.
          </Alert>

          {websiteToPermanentlyDelete && (
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="body1"
                sx={{ color: colors.text, mb: 1, fontWeight: 600 }}
              >
                You are about to permanently delete:
              </Typography>

              <Box
                sx={{
                  p: 2,

                  bgcolor: alpha("#f44336", 0.05),

                  borderRadius: 2,

                  border: `1px solid ${alpha("#f44336", 0.2)}`,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ color: colors.text, fontWeight: 700 }}
                >
                  {websiteToPermanentlyDelete.name}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ color: colors.textSecondary }}
                >
                  {websiteToPermanentlyDelete.slug}
                </Typography>
              </Box>
            </Box>
          )}

          <Typography
            variant="body2"
            sx={{ color: colors.text, mb: 2, fontWeight: 600 }}
          >
            To confirm permanent deletion, please type the{" "}
            {websiteToPermanentlyDelete?.itemType === "store"
              ? "store"
              : "website"}{" "}
            name{" "}
            <Box
              component="span"
              sx={{
                color: "#f44336",
                fontWeight: 700,
                fontFamily: "monospace",
              }}
            >
              {websiteToPermanentlyDelete?.name}
            </Box>{" "}
            below:
          </Typography>

          <DashboardInput
            fullWidth
            value={permanentDeleteConfirmText}
            onChange={(e) => setPermanentDeleteConfirmText(e.target.value)}
            disabled={permanentlyDeleting}
            placeholder={`Type "${websiteToPermanentlyDelete?.name}" to confirm`}
          />
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setPermanentDeleteDialogOpen(false)}
            disabled={permanentlyDeleting}
          >
            Cancel
          </Button>

          <Button
            onClick={handlePermanentlyDeleteWebsite}
            variant="contained"
            disabled={
              permanentlyDeleting ||
              permanentDeleteConfirmText !== websiteToPermanentlyDelete?.name
            }
            sx={{
              background:
                permanentDeleteConfirmText === websiteToPermanentlyDelete?.name
                  ? "#f44336"
                  : alpha(colors.textSecondary, 0.2),

              color:
                permanentDeleteConfirmText === websiteToPermanentlyDelete?.name
                  ? "#fff"
                  : colors.textSecondary,

              fontWeight: 600,

              "&:hover": {
                background:
                  permanentDeleteConfirmText ===
                  websiteToPermanentlyDelete?.name
                    ? "#d32f2f"
                    : alpha(colors.textSecondary, 0.3),
              },

              "&:disabled": {
                background: alpha(colors.textSecondary, 0.2),

                color: colors.textSecondary,
              },
            }}
          >
            {permanentlyDeleting ? (
              <CircularProgress size={24} />
            ) : (
              "Delete Permanently"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Collaborator Management Modal (Step 7.4.4) */}

      <CollaboratorModal
        websiteId={collaboratorWebsiteId}
        open={collaboratorModalOpen}
        onClose={() => {
          setCollaboratorModalOpen(false);

          setCollaboratorWebsiteId(null);
        }}
        currentUserRole={collaboratorWebsiteRole}
      />
    </Container>
  );
};

export default Websites;
