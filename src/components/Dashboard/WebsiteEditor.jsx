// CANONICAL EDITOR: This is the keeper route for website editing (Phase 9 decision).
// Phase 9 UX features are integrated here: BlockLibrary, ThemeManager, PreviewPanel,
// keyboard shortcuts, inline editing, governance UI (ApprovalStatusBanner, SectionLockIndicator).
//
// Block identity: WebsiteEditor uses database IDs exclusively.
//
// Page reorder: Uses pages from API, reordered via PATCH /api/blocks/reorder

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { flushSync } from "react-dom";
import { apiClient } from "../../api/client";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  ButtonBase,
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
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  FormControl,
  Select,
  Switch,
  FormControlLabel,
  Paper,
  Tooltip,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  useMediaQuery,
  useTheme,
  ClickAwayListener,
} from "@mui/material";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Eye,
  House,
  Image as ImageIcon,
  Layers,
  Palette,
  Pencil,
  Plus,
  Redo2,
  Save,
  Trash2,
  Undo2,
  Upload,
  X,
  Ellipsis,
} from "lucide-react";
import { getDashboardColors } from "../../styles/dashboardTheme";
import { PreviewProvider, usePreview } from "../../context/PreviewContext";
import PreviewPanel from "../WebsiteEditor/PreviewPanel";
import { DashboardInput, ConfirmationDialog, BottomSheet } from "./shared";
import RegenerateButton from "../Editor/RegenerateButton";
import DraggableBlockList from "../Editor/DraggableBlockList";
import FormGenerator from "../FormGenerator";
import { useAutosave } from "../../hooks/useAutosave";
import { useUnsavedChanges } from "../../hooks/useUnsavedChanges";
import { useLocalStorageBackup } from "../../hooks/useLocalStorageBackup";
import { useCollaborativeEditor } from "../../hooks/useCollaborativeEditor";
import { useAuth } from "../../context/AuthContext";
import {
  usePermissionContext,
  useWebsiteRole,
} from "../../context/PermissionContext";
import SaveStatus from "../Editor/SaveStatus";
import ConflictModal from "../Editor/ConflictModal";
import RecoveryModal from "../Editor/RecoveryModal";
import ConnectionStatus from "../Editor/ConnectionStatus";
import BlockLibrary from "../Editor/BlockLibrary";
import EditorStyleToolbar from "../Editor/EditorStyleToolbar";
import EditorSectionStyleToolbar from "../Editor/EditorSectionStyleToolbar";
import ResponsiveEditorLayout from "../Editor/ResponsiveEditorLayout";
import MobileActionBar from "../Editor/MobileActionBar";
import MobileFAB from "../Editor/MobileFAB";
import ThemeManager from "./ThemeManager";
import FrontendTemplateThemePanel, {
  getDefaultTemplateThemeSelection,
  getTemplateThemeSettings,
  resolveTemplateThemeSelection,
  supportsTemplateThemeCustomization,
} from "./FrontendTemplateThemePanel";
import ApprovalStatusBanner from "./ApprovalStatusBanner";
// SectionLockIndicator is available at ./SectionLockIndicator for per-block lock UI
// when DraggableBlockList is extended to support render props for block items.
import { useShortcutManager } from "../../hooks/useShortcutManager";
import { useHistory } from "../../hooks/useHistory";
import {
  buildFrontendTemplateEditorPages,
  buildTemplatePreviewBusinessData,
  inferFrontendTemplateIdFromPages,
  injectTemplateThemeSettingsIntoBlocks,
  isSyntheticTemplatePageId,
  readTemplateThemeSettingsFromPages,
  supportsFrontendTemplateEditor,
} from "../../templates/frontendTemplateEditorSupport";
import { getStoredWebsiteFrontendTemplateId } from "../../templates/frontendTemplatePersistence";
import { color } from "framer-motion";

const EDITABLE_STYLE_FIELD_MAP = {
  title: { styleKey: "titleStyle", label: "Heading" },
  subtitle: { styleKey: "subtitleStyle", label: "Paragraph" },
  text: { styleKey: "textStyle", label: "Paragraph" },
  heading: { styleKey: "headingStyle", label: "Heading" },
  subheading: { styleKey: "subheadingStyle", label: "Paragraph" },
  description: { styleKey: "descriptionStyle", label: "Paragraph" },
  buttonText: { styleKey: "buttonTextStyle", label: "Button text" },
  ctaText: { styleKey: "ctaTextStyle", label: "Button text" },
  primaryCtaText: { styleKey: "ctaTextStyle", label: "Button text" },
  brandName: { styleKey: "brandNameStyle", label: "Brand name" },
  copyright: { styleKey: "copyrightStyle", label: "Footer text" },
};

const DEFAULT_TEXT_STYLE = {
  fontFamily: '"Inter", "Segoe UI", sans-serif',
  fontSize: "16px",
  color: "#111827",
  fontWeight: "400",
  fontStyle: "normal",
  textDecoration: "none",
  textAlign: "left",
  lineHeight: "1.5",
  letterSpacing: "0em",
  wordSpacing: "0px",
  textTransform: "none",
  textShadow: "none",
  textIndent: "0px",
  paddingTop: "0px",
  paddingBottom: "0px",
  paddingLeft: "0px",
  paddingRight: "0px",
  marginTop: "0px",
  marginBottom: "0px",
  marginLeft: "0px",
  marginRight: "0px",
  listStyleType: "none",
  animation: "none",
  opacity: 1,
  rotate: "0deg",
  scaleX: "100%",
  scaleY: "100%",
  translateX: "0px",
  translateY: "0px",
  skewX: "0deg",
  skewY: "0deg",
  transform: "none",
};

const DEFAULT_SECTION_STYLE = {
  backgroundColor: "transparent",
  backgroundImageUrl: "",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  layoutWidth: "page",
  heightPreset: "auto",
  customHeight: "0px",
  contentAlign: "left",
  borderStyle: "none",
  borderWidth: "",
  borderRadius: "",
  borderColor: "#dbe3ea",
  opacity: 1,
  boxShadowPreset: "none",
  showOnDesktop: true,
  showOnTablet: true,
  showOnMobile: true,
  entranceAnimation: "none",
  layoutDirection: "",
  layoutGap: "",
  overflowMode: "",
  positionMode: "",
  minHeightValue: "",
  maxWidthValue: "",
  parallaxEnabled: false,
  parallaxSpeed: 50,
  stickySection: false,
  stickyOffset: "",
  semanticTag: "div",
  cssClass: "",
  customCss: "",
  dataAttributes: [],
  anchorId: "",
  zIndex: "",
  paddingTop: "0px",
  paddingBottom: "0px",
  paddingLeft: "0px",
  paddingRight: "0px",
  marginTop: "0px",
  marginBottom: "0px",
  marginLeft: "0px",
  marginRight: "0px",
};

const DEFAULT_IMAGE_VALUE = {
  src: "",
  objectFit: "cover",
  borderRadius: "0px",
  borderWidth: "0px",
  borderColor: "#e5e7eb",
};

const getSectionStyleKey = (selection) => selection?.styleKey || "sectionStyle";

const getEditableStyleConfig = (fieldPath) =>
  EDITABLE_STYLE_FIELD_MAP[fieldPath] || {
    styleKey: `${fieldPath}Style`,
    label: fieldPath,
  };

const humanizeLabel = (value = "") =>
  String(value)
    .split(".")
    .slice(-1)[0]
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]+/g, " ")
    .replace(/^./, (char) => char.toUpperCase());

const looksLikeImageSource = (value = "") =>
  /^(https?:\/\/|\/)/i.test(value) ||
  /^data:image\//i.test(value) ||
  /\.(png|jpe?g|webp|gif|svg|avif)(\?.*)?$/i.test(value);

// REMOVED: BLOCK_TYPES hardcoded allowlist. Block selection now exclusively
// uses BlockLibrary (fetches from /api/content-types/blocks with all 34 types).

const MAX_CTA_TEXT_LENGTH = 24;

const truncateText = (value, maxLength) => {
  if (typeof value !== "string") return value;
  return value.length > maxLength ? value.slice(0, maxLength) : value;
};

const sanitizeBlockForSave = (block) => {
  if (!block?.content || typeof block.content !== "object") {
    return block;
  }

  if (block.blockType !== "CTA") {
    return block;
  }

  return {
    ...block,
    content: {
      ...block.content,
      ctaText: truncateText(block.content.ctaText, MAX_CTA_TEXT_LENGTH),
    },
  };
};

const WebsiteEditorInner = () => {
  const { websiteId } = useParams();
  const navigate = useNavigate();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));
  const editorThemeMode = "light";
  const isEditorDark = editorThemeMode === "dark";
  const colors = getDashboardColors(editorThemeMode);
  const editorText = "#111827";
  const editorMutedText = "#374151";
  const editorLabelText = "#4b5563";

  const [website, setWebsite] = useState(null);
  const [pages, setPages] = useState([]);
  const [persistedPages, setPersistedPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const blocksRef = useRef([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [blockError, setBlockError] = useState(null);

  // Preview context bridge — Step 4.11
  const { updatePreviewContent, refreshPreview } = usePreview();

  // Mobile state — Step 9.5
  const [pagesBottomSheetOpen, setPagesBottomSheetOpen] = useState(false);

  // Block Library state — Phase 9 gap fix
  const [blockLibraryOpen, setBlockLibraryOpen] = useState(false);
  const [blockLibraryPreferredPosition, setBlockLibraryPreferredPosition] =
    useState("end");

  // Theme Manager state — Step 9.21
  const [sidebarMode, setSidebarMode] = useState("blocks");
  const [templateThemeSelection, setTemplateThemeSelection] = useState(null);

  const [selectedEditableElement, setSelectedEditableElement] = useState(null);
  const [selectedImageElement, setSelectedImageElement] = useState(null);
  const [selectedSectionElement, setSelectedSectionElement] = useState(null);
  const [activeToolbarMode, setActiveToolbarMode] = useState("text");
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [uploadedLibraryImages, setUploadedLibraryImages] = useState([]);
  const [previewContextMenu, setPreviewContextMenu] = useState(null);
  const [selectedPreviewTarget, setSelectedPreviewTarget] = useState(null);
  const [previewSaveSignal, setPreviewSaveSignal] = useState(0);
  const iframeRef = useRef(null);
  const previewContextMenuRef = useRef(null);
  const imageLibraryInputRef = useRef(null);
  const imageReplaceInputRef = useRef(null);
  const previewSelectionNonceRef = useRef(0);
  const resolvedFrontendTemplateId =
    website?.frontendTemplateId ||
    getStoredWebsiteFrontendTemplateId(website?.id || websiteId) ||
    null;
  const isLocalTemplateEditorPage = !!selectedPage?.localOnly;
  const supportsLocalTemplateEditor = supportsFrontendTemplateEditor(
    resolvedFrontendTemplateId,
  );
  const supportsTemplateThemeSidebar = supportsTemplateThemeCustomization(
    resolvedFrontendTemplateId,
  );
  const persistedTemplateThemeSettings = useMemo(
    () => readTemplateThemeSettingsFromPages(pages),
    [pages],
  );
  const localTemplateHydratedPageRef = useRef(null);

  // Dialogs
  const [pageDialogOpen, setPageDialogOpen] = useState(false);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState(null);
  const [headerMenuAnchorEl, setHeaderMenuAnchorEl] = useState(null);

  // Forms
  const [pageForm, setPageForm] = useState({
    title: "",
    path: "",
    isHome: false,
    isPublished: true,
  });
  const [blockForm, setBlockForm] = useState({ blockType: "", content: {} });
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formHasErrors, setFormHasErrors] = useState(false);

  // AI session state
  const [hasAISessions, setHasAISessions] = useState(false);
  const [aiQuestionnaireData, setAiQuestionnaireData] = useState({});
  const {
    canUndo,
    canRedo,
    undo,
    redo,
    push: pushHistory,
    clear: clearHistory,
  } = useHistory();
  const suppressHistoryRef = useRef(true);
  const historyBootstrappedRef = useRef(false);
  const pendingHistoryDescriptionRef = useRef("Edited blocks");
  const activeHistoryPageRef = useRef(null);

  // Autosave payload — derived from blocks (single source of truth)
  const autosavePayload = useMemo(
    () => ({ blocks: blocks.map(sanitizeBlockForSave) }),
    [blocks],
  );

  useEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);
  const isLoadingRef = useRef(true);

  // ETag + updatedAt refs for conflict detection (Step 5.9)
  const etagRef = useRef(null);
  const expectedUpdatedAtRef = useRef(null);
  const localConflictRetryRef = useRef(false);
  const isSoloEditingSessionRef = useRef(true);
  const templatePersistencePage = useMemo(() => {
    if (!supportsLocalTemplateEditor) {
      return null;
    }

    return (
      persistedPages.find((page) => page.isHome) ||
      persistedPages.find((page) => page.path === "/") ||
      persistedPages[0] ||
      null
    );
  }, [persistedPages, supportsLocalTemplateEditor]);

  // Autosave callback — PUT blocks to API with ETag conflict detection
  const handleAutosave = useCallback(
    async (data) => {
      if (!selectedPage?.id || !websiteId) {
        throw new Error("No page selected");
      }

      let blocksToSave = [];

      try {
        const normalizedBlocks = data.blocks.map(sanitizeBlockForSave);
        const resolvedThemeSettings = templateThemeSelection
          ? getTemplateThemeSettings(templateThemeSelection)
          : persistedTemplateThemeSettings;
        blocksToSave = selectedPage?.localOnly
          ? injectTemplateThemeSettingsIntoBlocks(
              normalizedBlocks,
              resolvedThemeSettings,
            )
          : normalizedBlocks;
        if (JSON.stringify(blocksToSave) !== JSON.stringify(blocks)) {
          setBlocks(blocksToSave);
        }

        let effectivePageId = selectedPage?.localOnly
          ? templatePersistencePage?.id
          : selectedPage.id;
        if (!effectivePageId && selectedPage?.localOnly) {
          const createdPageResponse = await apiClient.post(
            `/websites/${websiteId}/pages`,
            {
              title: selectedPage.title,
              path: selectedPage.path,
              isHome: selectedPage.isHome,
              isPublished: true,
            },
          );
          const createdPage =
            createdPageResponse.data?.data || createdPageResponse.data;
          effectivePageId = createdPage?.id;
          if (effectivePageId) {
            setPersistedPages((prevPages) => [
              ...prevPages,
              { ...createdPage, blocks: [] },
            ]);
          }
        }
        if (!effectivePageId) {
          throw new Error("No persisted template page is available for saving");
        }

        // Build headers — include If-Match when we have a stored ETag
        const headers = {};
        if (etagRef.current) {
          headers["If-Match"] = etagRef.current;
        }

        const response = await apiClient.put(
          `/websites/${websiteId}/pages/${effectivePageId}/blocks`,
          {
            blocks: blocksToSave.map((b, idx) => ({
              blockType: b.blockType,
              content: b.content,
              variant: b.variant,
              sortOrder: idx,
              isVisible: b.isVisible,
            })),
            ...(expectedUpdatedAtRef.current
              ? { expectedUpdatedAt: expectedUpdatedAtRef.current }
              : {}),
          },
          { headers },
        );

        // Store ETag from response for next request
        if (response.headers?.etag) {
          etagRef.current = response.headers.etag;
        }

        // Store updatedAt for next expectedUpdatedAt fallback
        const updatedAt = response.data?.data?.updatedAt;
        if (updatedAt) {
          expectedUpdatedAtRef.current = updatedAt;
        }

        if (selectedPage?.localOnly && resolvedThemeSettings?.primaryColor) {
          try {
            const websiteResponse = await apiClient.put(
              `/websites/${websiteId}`,
              {
                primaryColor: resolvedThemeSettings.primaryColor,
                secondaryColor:
                  resolvedThemeSettings.secondaryColor ||
                  website?.secondaryColor ||
                  resolvedThemeSettings.primaryColor,
              },
            );
            const updatedWebsite =
              websiteResponse.data?.data || websiteResponse.data || {};
            setWebsite((prev) =>
              prev ? { ...prev, ...updatedWebsite } : prev,
            );
          } catch {
            setWebsite((prev) =>
              prev
                ? {
                    ...prev,
                    primaryColor: resolvedThemeSettings.primaryColor,
                    secondaryColor:
                      resolvedThemeSettings.secondaryColor ||
                      prev.secondaryColor ||
                      resolvedThemeSettings.primaryColor,
                  }
                : prev,
            );
          }
        }

        if (selectedPage?.localOnly) {
          setPersistedPages((prevPages) =>
            prevPages.map((page) =>
              page.id === effectivePageId
                ? { ...page, blocks: blocksToSave }
                : page,
            ),
          );
        }

        localConflictRetryRef.current = false;

        // Step 4.11: Bump preview revision so PreviewPanel re-renders after save
        refreshPreview();

        return { updatedAt };
      } catch (error) {
        // Handle 412 Precondition Failed — conflict detected
        if (error?.response?.status === 412) {
          if (!localConflictRetryRef.current) {
            localConflictRetryRef.current = true;
            etagRef.current = null;
            expectedUpdatedAtRef.current = null;

            const retryPageId = selectedPage?.localOnly
              ? templatePersistencePage?.id
              : selectedPage.id;
            if (!retryPageId) {
              throw new Error(
                "No persisted template page is available for retry save",
              );
            }

            const retryResponse = await apiClient.put(
              `/websites/${websiteId}/pages/${retryPageId}/blocks`,
              {
                blocks: blocksToSave.map((b, idx) => ({
                  blockType: b.blockType,
                  content: b.content,
                  variant: b.variant,
                  sortOrder: idx,
                  isVisible: b.isVisible,
                })),
              },
            );

            if (retryResponse.headers?.etag) {
              etagRef.current = retryResponse.headers.etag;
            }

            const retryUpdatedAt = retryResponse.data?.data?.updatedAt;
            if (retryUpdatedAt) {
              expectedUpdatedAtRef.current = retryUpdatedAt;
            }

            localConflictRetryRef.current = false;
            refreshPreview();

            return { updatedAt: retryUpdatedAt };
          }

          localConflictRetryRef.current = false;
          return {
            conflict: true,
            serverData: error.response.data.serverData,
            serverUpdatedAt: error.response.data.serverUpdatedAt,
          };
        }
        // Re-throw non-412 errors for useAutosave error handling
        localConflictRetryRef.current = false;
        throw error;
      }
    },
    [
      selectedPage?.id,
      selectedPage?.localOnly,
      websiteId,
      refreshPreview,
      blocks,
      templateThemeSelection,
      persistedTemplateThemeSettings,
      templatePersistencePage?.id,
      website?.secondaryColor,
    ],
  );

  const {
    hasUnsavedChanges,
    saveStatus,
    conflictData,
    triggerSave,
    resolveConflict,
  } = useAutosave({
    entityType: "page",
    entityId: selectedPage?.id ?? null,
    data: autosavePayload,
    onSave: handleAutosave,
    isLoading: isLoadingRef.current,
    autoSaveEnabled: false,
  });

  const triggerManualSave = useCallback(async () => {
    localConflictRetryRef.current = false;
    const iframeDoc = iframeRef.current?.contentDocument || null;
    const activeIframeElement =
      iframeDoc?.querySelector('[data-inline-editing="true"]') ||
      (iframeDoc?.activeElement instanceof HTMLElement
        ? iframeDoc.activeElement
        : null);
    let nextBlocks = blocksRef.current;

    if (
      activeIframeElement &&
      activeIframeElement instanceof HTMLElement &&
      (activeIframeElement.getAttribute("data-inline-editing") === "true" ||
        activeIframeElement.isContentEditable)
    ) {
      const blockId = activeIframeElement.getAttribute("data-block-id");
      const fieldPath = activeIframeElement.getAttribute("data-editable");
      const nextValue = activeIframeElement.textContent || "";

      if (blockId && fieldPath) {
        flushSync(() => {
          pendingHistoryDescriptionRef.current = `Edited ${fieldPath}`;
          nextBlocks = blocksRef.current.map((block) => {
            if (String(block.id) !== String(blockId)) return block;

            const updated = {
              ...block,
              content: {
                ...(block.content || {}),
              },
            };

            const parts = fieldPath.split(".");
            let obj = updated.content;
            for (let i = 0; i < parts.length - 1; i++) {
              obj[parts[i]] = {
                ...(obj[parts[i]] && typeof obj[parts[i]] === "object"
                  ? obj[parts[i]]
                  : {}),
              };
              obj = obj[parts[i]];
            }
            obj[parts[parts.length - 1]] = nextValue;
            return updated;
          });
          blocksRef.current = nextBlocks;
          setBlocks(nextBlocks);
        });
      }

      activeIframeElement.blur();
    }

    setPreviewSaveSignal((prev) => prev + 1);
    await new Promise((resolve) => setTimeout(resolve, 0));
    await triggerSave({ blocks: nextBlocks.map(sanitizeBlockForSave) });
  }, [triggerSave]);

  useEffect(() => {
    if (!supportsTemplateThemeSidebar) {
      setTemplateThemeSelection(null);
      if (sidebarMode === "theme") {
        setSidebarMode("blocks");
      }
      return;
    }

    setTemplateThemeSelection(
      (prev) =>
        prev ||
        getDefaultTemplateThemeSelection(resolvedFrontendTemplateId, {
          ...website,
          templateThemeSettings: persistedTemplateThemeSettings,
        }),
    );
  }, [
    supportsTemplateThemeSidebar,
    website,
    sidebarMode,
    persistedTemplateThemeSettings,
    resolvedFrontendTemplateId,
  ]);

  // Unsaved changes warning — intercepts client-side navigation
  // skipBeforeUnload=true because useAutosave already handles beforeunload
  const {
    showDialog: showUnsavedDialog,
    confirmNavigation,
    cancelNavigation,
    saveAndNavigate,
  } = useUnsavedChanges({
    hasUnsavedChanges,
    onSaveBeforeLeave: triggerManualSave,
    skipBeforeUnload: true,
    saveStatus,
  });

  // LocalStorage backup — saves unsaved data on beforeunload, detects on mount (Step 5.10)
  const backupData = useMemo(() => ({ blocks }), [blocks]);
  const { hasBackup, backupEntry, restoreBackup, discardBackup, clearBackup } =
    useLocalStorageBackup({
      websiteId: websiteId ? Number(websiteId) : null,
      pageId: selectedPage?.id ?? null,
      currentData: backupData,
      hasUnsavedChanges,
      isLoading: loading,
    });

  const handleRestoreBackup = useCallback(() => {
    const data = restoreBackup();
    if (data && Array.isArray(data.blocks)) {
      setBlocks(data.blocks);
    }
  }, [restoreBackup]);

  // Clear backup after successful autosave
  useEffect(() => {
    if (saveStatus === "saved") {
      clearBackup();
    }
  }, [saveStatus, clearBackup]);

  // Collaborative editing — presence, locks, connection status (Step 7.5)
  const { user } = useAuth();
  const { setCurrentWebsite } = usePermissionContext();
  const websiteRole =
    useWebsiteRole(websiteId ? Number(websiteId) : undefined) || "OWNER";

  // Set active website in PermissionContext for permission hooks (Step 7.2)
  useEffect(() => {
    if (websiteId) {
      setCurrentWebsite(Number(websiteId));
    }
    return () => setCurrentWebsite(null);
  }, [websiteId, setCurrentWebsite]);

  const {
    isConnected,
    connectionState,
    activeUsers,
    cursorPositions,
    locks,
    canEdit: collaborativeCanEdit,
    broadcastChange,
    broadcastCursor,
    requestEditAccess,
  } = useCollaborativeEditor({
    pageId: selectedPage ? String(selectedPage.id) : "",
    websiteId: websiteId ? Number(websiteId) : 0,
    currentUserId: user?.id ?? 0,
    currentUserRole: websiteRole,
  });

  const isSoloEditingSession = activeUsers.length <= 1;

  useEffect(() => {
    isSoloEditingSessionRef.current = isSoloEditingSession;
  }, [isSoloEditingSession]);

  // Keyboard shortcuts — Step 9.23
  const { registerShortcut, unregisterShortcut } = useShortcutManager();

  useEffect(() => {
    registerShortcut({
      key: "ctrl+s",
      action: (e) => {
        e.preventDefault();
        triggerManualSave();
      },
      description: "Save changes",
      category: "Editing",
      scope: "global",
    });
    registerShortcut({
      key: "ctrl+b",
      action: (e) => {
        e.preventDefault();
        setBlockLibraryOpen((prev) => !prev);
      },
      description: "Toggle block library",
      category: "Blocks",
      scope: "editor",
    });
    registerShortcut({
      key: "escape",
      action: () => {
        setEditingBlock(null);
      },
      description: "Deselect block / cancel inline edit",
      category: "Editing",
      scope: "editor",
    });
    return () => {
      unregisterShortcut("ctrl+s");
      unregisterShortcut("ctrl+b");
      unregisterShortcut("escape");
    };
  }, [
    registerShortcut,
    unregisterShortcut,
    triggerManualSave,
    isLocalTemplateEditorPage,
  ]);

  // Sync editor state into PreviewContext — Step 4.11
  // Bridges blocks, selected page, and website metadata so PreviewPanel
  // can render a live srcdoc preview without network requests.
  useEffect(() => {
    if (!selectedPage?.id || !websiteId) return;
    const previewPages = pages.map((page) =>
      page.id === selectedPage.id ? { ...page, blocks } : page,
    );
    const baseTemplateDataOverride = supportsLocalTemplateEditor
      ? buildTemplatePreviewBusinessData(
          resolvedFrontendTemplateId,
          website || {},
          previewPages,
        )
      : null;
    const resolvedThemeSelection = templateThemeSelection
      ? resolveTemplateThemeSelection(templateThemeSelection)
      : null;
    const templateDataOverride = baseTemplateDataOverride
      ? {
          ...baseTemplateDataOverride,
          ...(resolvedThemeSelection && {
            primaryColor: resolvedThemeSelection.palette.primary,
            secondaryColor: resolvedThemeSelection.palette.secondary,
            themeSettings: {
              ...(baseTemplateDataOverride.themeSettings || {}),
              primaryColor: resolvedThemeSelection.palette.primary,
              secondaryColor: resolvedThemeSelection.palette.secondary,
              headingFont: resolvedThemeSelection.fontPack.headingFont,
              bodyFont: resolvedThemeSelection.fontPack.bodyFont,
            },
          }),
        }
      : null;

    updatePreviewContent({
      websiteId: String(websiteId),
      pageId: String(selectedPage.id),
      blocks: blocks.map((b, idx) => ({
        id: String(b.id),
        blockType: b.blockType,
        content: b.content || {},
        order: b.sortOrder ?? idx,
        designTokens: b.designTokens,
      })),
      websiteMeta: {
        name: website?.name,
        slug: website?.slug,
        frontendTemplateId: resolvedFrontendTemplateId,
        businessName: website?.businessName,
        primaryColor: website?.primaryColor,
        secondaryColor: website?.secondaryColor,
        metaDescription: website?.metaDescription,
        shortDescription: website?.shortDescription,
        logoUrl: website?.logoUrl,
        fullAddress: website?.fullAddress,
        tags: Array.isArray(website?.tags) ? website.tags : null,
        templateDataOverride,
        colors: website?.colors,
        fonts: website?.fonts,
        theme: website?.theme,
      },
    });
  }, [
    blocks,
    selectedPage,
    website,
    websiteId,
    updatePreviewContent,
    pages,
    supportsLocalTemplateEditor,
    templateThemeSelection,
    resolvedFrontendTemplateId,
  ]);

  useEffect(() => {
    if (!selectedPage?.id) return;
    setPages((prevPages) =>
      prevPages.map((page) =>
        page.id === selectedPage.id ? { ...page, blocks } : page,
      ),
    );
    setSelectedPage((prevSelectedPage) =>
      prevSelectedPage?.id === selectedPage.id
        ? { ...prevSelectedPage, blocks }
        : prevSelectedPage,
    );
  }, [blocks, selectedPage?.id]);

  useEffect(() => {
    if (
      !iframeRef.current?.contentWindow ||
      !selectedEditableElement?.blockId ||
      !selectedEditableElement?.fieldPath
    ) {
      return;
    }

    iframeRef.current.contentWindow.postMessage(
      {
        type: "SELECT_EDITABLE",
        blockId: selectedEditableElement.blockId,
        fieldPath: selectedEditableElement.fieldPath,
      },
      window.location.origin,
    );
  }, [selectedEditableElement, blocks]);

  useEffect(() => {
    if (!selectedPage?.id) return;
    if (activeHistoryPageRef.current !== selectedPage.id) {
      activeHistoryPageRef.current = selectedPage.id;
      suppressHistoryRef.current = true;
      historyBootstrappedRef.current = false;
      clearHistory();
    }
  }, [selectedPage?.id, clearHistory]);

  useEffect(() => {
    if (!selectedPage?.id) return;

    if (suppressHistoryRef.current) {
      suppressHistoryRef.current = false;
      return;
    }

    if (!historyBootstrappedRef.current) {
      pushHistory(blocks, "Initial page state");
      historyBootstrappedRef.current = true;
      return;
    }

    pushHistory(
      blocks,
      pendingHistoryDescriptionRef.current || "Edited blocks",
    );
  }, [blocks, selectedPage?.id, pushHistory]);

  useEffect(() => {
    if (websiteId) {
      fetchWebsiteData();
    }
  }, [websiteId]);

  useEffect(() => {
    if (selectedPage?.id) {
      setBlockError(null);
      fetchBlocks(selectedPage.id);
    } else {
      setBlockError(null);
      setBlocks([]);
    }
  }, [selectedPage?.id]);

  const fetchWebsiteData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch website details
      const websiteRes = await apiClient.get(`/websites/${websiteId}`, {
        headers: {},
      });
      const inferredFrontendTemplateId = inferFrontendTemplateIdFromPages(
        websiteRes.data.data?.pages,
      );
      const normalizedWebsiteData = {
        ...websiteRes.data.data,
        frontendTemplateId:
          websiteRes.data.data?.frontendTemplateId ||
          inferredFrontendTemplateId ||
          getStoredWebsiteFrontendTemplateId(
            websiteRes.data.data?.id || websiteId,
          ) ||
          null,
      };
      setWebsite(normalizedWebsiteData);

      let pagesList = [];
      let nextPersistedPages = [];

      try {
        const pagesRes = await apiClient.get(`/websites/${websiteId}/pages`, {
          headers: {},
        });
        nextPersistedPages = pagesRes.data.data || [];
      } catch (pagesErr) {
        nextPersistedPages = [];
      }

      const websiteFrontendTemplateId =
        normalizedWebsiteData.frontendTemplateId;

      if (supportsFrontendTemplateEditor(websiteFrontendTemplateId)) {
        const persistedPagesWithBlocks = await Promise.all(
          nextPersistedPages.map(async (page) => {
            try {
              const blocksRes = await apiClient.get(
                `/pages/${page.id}/blocks`,
                {
                  headers: {},
                },
              );
              if (page.isHome || page.path === "/") {
                if (blocksRes.headers?.etag) {
                  etagRef.current = blocksRes.headers.etag;
                }
                const pageUpdatedAt = blocksRes.data?.data?.updatedAt;
                if (pageUpdatedAt) {
                  expectedUpdatedAtRef.current = pageUpdatedAt;
                }
              }
              return {
                ...page,
                blocks: blocksRes.data.data || [],
              };
            } catch {
              return {
                ...page,
                blocks: [],
              };
            }
          }),
        );
        nextPersistedPages = persistedPagesWithBlocks;
        const inferredTemplateFromPersistedPages =
          inferFrontendTemplateIdFromPages(persistedPagesWithBlocks);
        if (!websiteFrontendTemplateId && inferredTemplateFromPersistedPages) {
          normalizedWebsiteData.frontendTemplateId =
            inferredTemplateFromPersistedPages;
          setWebsite({ ...normalizedWebsiteData });
        }
        setPersistedPages(persistedPagesWithBlocks);
        pagesList = buildFrontendTemplateEditorPages(
          normalizedWebsiteData.frontendTemplateId || websiteFrontendTemplateId,
          normalizedWebsiteData,
          persistedPagesWithBlocks,
        );
      } else if (nextPersistedPages.length > 0) {
        pagesList = nextPersistedPages;
        setPersistedPages(nextPersistedPages);
      } else {
        setPersistedPages([]);
      }
      setPages(pagesList);

      // Auto-select home page or first page
      const homePage = pagesList.find((p) => p.isHome) || pagesList[0];
      if (homePage) {
        if (homePage.localOnly) {
          const initialBlocks = Array.isArray(homePage.blocks)
            ? homePage.blocks
            : [];
          localTemplateHydratedPageRef.current = homePage.id;
          setBlocks(initialBlocks);
          setBlockError(null);
        }
        setSelectedPage(homePage);
      }

      // Check for AI sessions (detect _aiGenerated metadata in any block)
      try {
        const allBlocks = pagesList.flatMap((p) => p.blocks || []);
        const hasAI = allBlocks.some(
          (b) => b.content && b.content._aiGenerated,
        );
        setHasAISessions(hasAI);

        // Retrieve stored questionnaire data from the first AI session block
        if (hasAI) {
          const aiBlock = allBlocks.find((b) => b.content?._aiSessionId);
          if (aiBlock?.content?._aiSessionId) {
            // Try to load questionnaire from sessionStorage
            const stored = sessionStorage.getItem(
              `ai_questionnaire_${websiteId}`,
            );
            if (stored) {
              try {
                setAiQuestionnaireData(JSON.parse(stored));
              } catch {
                // Ignore parse errors
              }
            }
          }
        }
      } catch {
        // Non-critical — AI features just won't appear
      }
    } catch (err) {
      console.error("Error fetching website data:", err);
      setError(err.response?.data?.message || "Failed to load website");
    } finally {
      setLoading(false);
    }
  };

  const fetchBlocks = async (pageId) => {
    if (isSyntheticTemplatePageId(pageId) || selectedPage?.localOnly) {
      const localPage =
        selectedPage?.id === pageId
          ? selectedPage
          : pages.find((page) => page.id === pageId);
      const localBlocks = Array.isArray(localPage?.blocks)
        ? localPage.blocks
        : [];
      localTemplateHydratedPageRef.current =
        typeof pageId === "string" ? pageId : String(pageId);
      setBlocks(localBlocks);
      setBlockError(null);
      isLoadingRef.current = false;
      return;
    }

    try {
      isLoadingRef.current = true;
      setBlockError(null);
      const response = await apiClient.get(`/pages/${pageId}/blocks`, {
        headers: {},
      });
      const fetchedBlocks = response.data.data || [];
      setBlocks(fetchedBlocks);
      setPages((prevPages) =>
        prevPages.map((page) =>
          page.id === pageId ? { ...page, blocks: fetchedBlocks } : page,
        ),
      );
      setSelectedPage((prevSelectedPage) =>
        prevSelectedPage?.id === pageId
          ? { ...prevSelectedPage, blocks: fetchedBlocks }
          : prevSelectedPage,
      );

      // Populate initial ETag from GET response (Step 5.9)
      if (response.headers?.etag) {
        etagRef.current = response.headers.etag;
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Error fetching blocks:", err);
      setBlockError(
        err.response?.data?.message ||
          "Failed to load blocks. Please try again.",
      );
    } finally {
      isLoadingRef.current = false;
    }
  };

  const handleCreatePage = async () => {
    try {
      setSubmitting(true);
      setFormError(null);

      const response = await apiClient.post(
        `/websites/${websiteId}/pages`,
        pageForm,
        {
          headers: {},
        },
      );

      const newPage = response.data.data;
      setPages([...pages, newPage]);
      setPageDialogOpen(false);
      setPageForm({ title: "", path: "", isHome: false, isPublished: true });

      // Select the new page
      setSelectedPage(newPage);
    } catch (err) {
      console.error("Error creating page:", err);
      setFormError(err.response?.data?.message || "Failed to create page");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePage = async (pageId) => {
    if (
      !confirm(
        "Are you sure you want to delete this page? This will also delete all blocks.",
      )
    ) {
      return;
    }

    try {
      await apiClient.delete(`/pages/${pageId}`, {
        headers: {},
      });

      const updatedPages = pages.filter((p) => p.id !== pageId);
      setPages(updatedPages);

      // Select another page if current page was deleted
      if (selectedPage?.id === pageId) {
        setSelectedPage(updatedPages[0] || null);
      }
    } catch (err) {
      console.error("Error deleting page:", err);
      alert(err.response?.data?.message || "Failed to delete page");
    }
  };

  const handleSelectPage = useCallback((page) => {
    setSelectedEditableElement(null);
    setSelectedSectionElement(null);
    setSelectedImageElement(null);
    setIsInspectorOpen(false);
    if (page?.localOnly) {
      const localBlocks = Array.isArray(page.blocks) ? page.blocks : [];
      localTemplateHydratedPageRef.current = page.id;
      suppressHistoryRef.current = true;
      setBlocks(localBlocks);
      setBlockError(null);
    }
    setSelectedPage(page);
  }, []);

  const handleSetHomePage = async (pageId) => {
    try {
      await apiClient.put(
        `/pages/${pageId}`,
        { isHome: true },
        { headers: {} },
      );

      // Update pages state
      const updatedPages = pages.map((p) => ({
        ...p,
        isHome: p.id === pageId,
      }));
      setPages(updatedPages);
      setSelectedPage(updatedPages.find((p) => p.id === pageId));
    } catch (err) {
      console.error("Error setting home page:", err);
      alert(err.response?.data?.message || "Failed to set home page");
    }
  };

  const handleCreateBlock = async () => {
    try {
      setSubmitting(true);
      setFormError(null);

      const newBlock = {
        id: `local-${Date.now()}`,
        blockType: blockForm.blockType,
        content: blockForm.content,
        isVisible: true,
        sortOrder: blocks.length,
        localOnly: true,
      };
      pendingHistoryDescriptionRef.current = `Added ${blockForm.blockType} block`;
      setBlocks([...blocks, newBlock]);
      setBlockDialogOpen(false);
      setBlockForm({ blockType: "", content: {} });
      setFormHasErrors(false);
    } catch (err) {
      console.error("Error creating block:", err);
      setFormError(err.response?.data?.message || "Failed to create block");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateBlock = async () => {
    try {
      setSubmitting(true);
      setFormError(null);

      pendingHistoryDescriptionRef.current = `Updated ${editingBlock.blockType} block`;
      setBlocks(
        blocks.map((b) =>
          b.id === editingBlock.id
            ? {
                ...b,
                content: { ...b.content, ...blockForm.content },
                localOnly: true,
              }
            : b,
        ),
      );
      setEditingBlock(null);
      setBlockForm({ blockType: "", content: {} });
      setFormHasErrors(false);
    } catch (err) {
      console.error("Error updating block:", err);
      setFormError(err.response?.data?.message || "Failed to update block");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBlock = async (blockId) => {
    if (isLocalTemplateEditorPage) {
      return;
    }

    if (!confirm("Are you sure you want to delete this block?")) {
      return;
    }

    try {
      pendingHistoryDescriptionRef.current = "Deleted block";
      setBlocks(blocks.filter((b) => b.id !== blockId));
    } catch (err) {
      console.error("Error deleting block:", err);
      alert(err.response?.data?.message || "Failed to delete block");
    }
  };

  const handleToggleBlockVisibility = async (block) => {
    if (isLocalTemplateEditorPage) {
      return;
    }

    try {
      pendingHistoryDescriptionRef.current = `${block.isVisible ? "Hid" : "Showed"} block`;
      setBlocks(
        blocks.map((b) =>
          b.id === block.id
            ? { ...b, isVisible: !b.isVisible, localOnly: true }
            : b,
        ),
      );
    } catch (err) {
      console.error("Error toggling block visibility:", err);
      alert("Failed to update block visibility");
    }
  };

  const handleMoveBlock = async (blockId, direction) => {
    if (isLocalTemplateEditorPage) {
      return;
    }

    const blockIndex = blocks.findIndex((b) => b.id === blockId);
    if (
      (direction === "up" && blockIndex === 0) ||
      (direction === "down" && blockIndex === blocks.length - 1)
    ) {
      return;
    }

    const newBlocks = [...blocks];
    const targetIndex = direction === "up" ? blockIndex - 1 : blockIndex + 1;
    [newBlocks[blockIndex], newBlocks[targetIndex]] = [
      newBlocks[targetIndex],
      newBlocks[blockIndex],
    ];

    try {
      pendingHistoryDescriptionRef.current = "Reordered blocks";
      setBlocks(
        newBlocks.map((b, idx) => ({ ...b, sortOrder: idx, localOnly: true })),
      );
    } catch (err) {
      console.error("Error reordering blocks:", err);
      alert("Failed to reorder blocks");
    }
  };

  const handleAIContentUpdate = useCallback((blockId, newContent) => {
    pendingHistoryDescriptionRef.current = "Updated AI content";
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === blockId
          ? { ...b, content: { ...b.content, ...newContent } }
          : b,
      ),
    );
  }, []);

  const selectedEditableStyle = useMemo(() => {
    if (
      !selectedEditableElement?.blockId ||
      !selectedEditableElement?.fieldPath
    ) {
      return DEFAULT_TEXT_STYLE;
    }

    const targetBlock = blocks.find(
      (block) => String(block.id) === String(selectedEditableElement.blockId),
    );
    if (!targetBlock?.content) {
      return DEFAULT_TEXT_STYLE;
    }

    const { styleKey } = getEditableStyleConfig(
      selectedEditableElement.fieldPath,
    );
    const blockStyle = targetBlock.content?.[styleKey];

    return {
      ...DEFAULT_TEXT_STYLE,
      ...(blockStyle && typeof blockStyle === "object" ? blockStyle : {}),
    };
  }, [blocks, selectedEditableElement]);

  const selectedSectionStyle = useMemo(() => {
    if (!selectedSectionElement?.blockId) {
      return DEFAULT_SECTION_STYLE;
    }

    const targetBlock = blocks.find(
      (block) => String(block.id) === String(selectedSectionElement.blockId),
    );
    const styleKey = getSectionStyleKey(selectedSectionElement);
    if (
      !targetBlock?.content?.[styleKey] ||
      typeof targetBlock.content[styleKey] !== "object"
    ) {
      return DEFAULT_SECTION_STYLE;
    }

    return {
      ...DEFAULT_SECTION_STYLE,
      ...targetBlock.content[styleKey],
    };
  }, [blocks, selectedSectionElement]);

  const selectedImageValue = useMemo(() => {
    if (!selectedImageElement?.blockId || !selectedImageElement?.fieldPath) {
      return DEFAULT_IMAGE_VALUE;
    }

    const targetBlock = blocks.find(
      (block) => String(block.id) === String(selectedImageElement.blockId),
    );
    if (!targetBlock?.content) {
      return DEFAULT_IMAGE_VALUE;
    }

    const imageStyleKey = `${selectedImageElement.fieldPath}Style`;
    const blockStyle =
      targetBlock.content?.[imageStyleKey] &&
      typeof targetBlock.content[imageStyleKey] === "object"
        ? targetBlock.content[imageStyleKey]
        : {};

    return {
      ...DEFAULT_IMAGE_VALUE,
      src:
        typeof targetBlock.content?.[selectedImageElement.fieldPath] ===
        "string"
          ? targetBlock.content[selectedImageElement.fieldPath]
          : selectedImageElement.src || "",
      ...blockStyle,
    };
  }, [blocks, selectedImageElement]);

  const imageLibraryItems = useMemo(() => {
    const items = [];
    const walk = (blockId, value, path = []) => {
      if (Array.isArray(value)) {
        value.forEach((entry, index) =>
          walk(blockId, entry, [...path, String(index)]),
        );
        return;
      }

      if (!value || typeof value !== "object") {
        return;
      }

      Object.entries(value).forEach(([key, entryValue]) => {
        const nextPath = [...path, key];
        if (
          typeof entryValue === "string" &&
          entryValue.trim() &&
          /(image|hero|logo|banner|thumbnail|cover)/i.test(key) &&
          looksLikeImageSource(entryValue.trim()) &&
          !/style$/i.test(key)
        ) {
          items.push({
            id: `${blockId}:${nextPath.join(".")}`,
            blockId,
            fieldPath: nextPath.join("."),
            label: humanizeLabel(nextPath.join(".")),
            src: entryValue,
          });
          return;
        }

        if (entryValue && typeof entryValue === "object") {
          walk(blockId, entryValue, nextPath);
        }
      });
    };

    blocks.forEach((block) => {
      walk(block.id, block.content || {}, []);
    });

    return [...items, ...uploadedLibraryImages];
  }, [blocks, uploadedLibraryImages]);

  const syncPreviewSelection = useCallback((target) => {
    previewSelectionNonceRef.current += 1;
    setSelectedPreviewTarget({
      ...target,
      nonce: previewSelectionNonceRef.current,
    });
  }, []);

  const blockLibraryExtraBlocks = useMemo(() => {
    if (resolvedFrontendTemplateId !== "company-executive") {
      return [];
    }

    return [
      {
        key: "SECTION",
        label: "Plan Section",
        description:
          "A blank flexible section you can place anywhere and style yourself.",
        category: "core",
        icon: "layout",
        capabilities: {
          supportsBackground: true,
          supportsVisibility: true,
          supportsVariants: false,
          supportsCustomCss: true,
          isDynamic: false,
          dataSource: null,
        },
        variants: [],
        searchKeywords: [
          "plan",
          "blank",
          "custom",
          "section",
          "empty",
          "layout",
        ],
      },
    ];
  }, [resolvedFrontendTemplateId]);

  const resolveInsertPositionForSection = useCallback((blockId, placement) => {
    const blockIndex = blocksRef.current.findIndex(
      (block) => String(block.id) === String(blockId),
    );

    if (blockIndex < 0) {
      return "end";
    }

    if (placement === "before") {
      return blockIndex === 0 ? "beginning" : blockIndex - 1;
    }

    return blockIndex;
  }, []);

  const openBlockLibraryAtPosition = useCallback((position) => {
    setSidebarMode("blocks");
    setBlockLibraryPreferredPosition(position);
    setBlockLibraryOpen(true);
  }, []);

  const buildPlanSectionContent = useCallback((blockType = "PLAN") => {
    const existingPlanCount = blocksRef.current.filter((block) => {
      const sectionKey =
        typeof block.content?.editorSection === "string"
          ? block.content.editorSection
          : "";
      return block.blockType === "PLAN" || sectionKey.startsWith("plan-");
    }).length;

    const nextIndex = existingPlanCount + 1;
    const blockLabel = humanizeLabel(blockType || "Plan Section");

    return {
      editorLabel: blockLabel,
      editorSection: `plan-${Date.now()}`,
      sectionStyle: {
        backgroundColor: "#ffffff",
        layoutWidth: "full",
        heightPreset: "medium",
        contentAlign: "left",
        paddingTop: "0px",
        paddingBottom: "0px",
        paddingLeft: "0px",
        paddingRight: "0px",
        marginTop: "0px",
        marginBottom: "0px",
        marginLeft: "0px",
        marginRight: "0px",
      },
      outerSectionStyle: {
        backgroundColor: "transparent",
        layoutWidth: "full",
        heightPreset: "auto",
        contentAlign: "left",
        paddingTop: "0px",
        paddingBottom: "0px",
        paddingLeft: "0px",
        paddingRight: "0px",
        marginTop: "0px",
        marginBottom: "0px",
        marginLeft: "0px",
        marginRight: "0px",
      },
    };
  }, []);

  const handlePreviewEditableSelection = useCallback(
    (data) => {
      if (!data) {
        return;
      }

      setPreviewContextMenu(null);
      setSelectedImageElement(null);
      setSelectedEditableElement(data);
      setSelectedSectionElement((prev) =>
        prev && String(prev.blockId) === String(data.blockId)
          ? prev
          : {
              blockId: data.blockId,
              label: "Section",
              styleKey: "sectionStyle",
            },
      );
      setActiveToolbarMode("text");
      setIsInspectorOpen(true);
      setBlockDialogOpen(false);
      setEditingBlock(null);
      syncPreviewSelection({
        kind: "editable",
        blockId: data.blockId,
        fieldPath: data.fieldPath,
      });
    },
    [syncPreviewSelection],
  );

  const handlePreviewSectionSelection = useCallback(
    (data) => {
      setPreviewContextMenu(null);
      if (data) {
        setSelectedImageElement(null);
      }
      setSelectedSectionElement(data);
      if (data) {
        setActiveToolbarMode("section");
        setIsInspectorOpen(true);
        syncPreviewSelection({
          kind: "section",
          blockId: data.blockId,
          styleKey: data.styleKey || "sectionStyle",
        });
      }
      setBlockDialogOpen(false);
      setEditingBlock(null);
    },
    [syncPreviewSelection],
  );

  const handlePreviewSectionAddRequest = useCallback(
    (data, position) => {
      if (!data?.blockId) {
        return;
      }

      setPreviewContextMenu(null);
      setSelectedSectionElement(data);
      setSelectedEditableElement(null);
      setSelectedImageElement(null);
      setActiveToolbarMode("section");
      setIsInspectorOpen(true);
      openBlockLibraryAtPosition(
        resolveInsertPositionForSection(data.blockId, position),
      );
    },
    [openBlockLibraryAtPosition, resolveInsertPositionForSection],
  );

  const handlePreviewContextMenu = useCallback((data) => {
    setPreviewContextMenu(data);
  }, []);

  const uploadImageAsset = useCallback(async (file) => {
    if (!file) {
      return null;
    }

    const formData = new FormData();
    formData.append("image", file);
    const response = await apiClient.post("/upload/image", formData);
    return response?.data?.url || null;
  }, []);

  const handlePreviewImageSelection = useCallback(
    (data) => {
      if (!data) {
        return;
      }

      setPreviewContextMenu(null);
      setSelectedEditableElement(null);
      setSelectedImageElement(data);
      setSelectedSectionElement((prev) => prev || null);
      setIsInspectorOpen(false);
      setBlockDialogOpen(false);
      setEditingBlock(null);
      syncPreviewSelection({
        kind: "image",
        blockId: data.blockId,
        fieldPath: data.fieldPath,
      });
    },
    [syncPreviewSelection],
  );

  const handlePreviewElementTransform = useCallback((target, patch) => {
    if (!target?.blockId || !patch) {
      return;
    }

    pendingHistoryDescriptionRef.current =
      target.kind === "section"
        ? "Moved or resized section"
        : target.kind === "image"
          ? "Moved or resized image"
          : "Moved or resized text";

    setBlocks((prev) =>
      prev.map((block) => {
        if (String(block.id) !== String(target.blockId)) {
          return block;
        }

        if (target.kind === "section") {
          const styleKey = target.styleKey || "sectionStyle";
          const existingStyle =
            block.content?.[styleKey] &&
            typeof block.content[styleKey] === "object"
              ? block.content[styleKey]
              : {};

          return {
            ...block,
            content: {
              ...block.content,
              [styleKey]: {
                ...existingStyle,
                ...patch,
              },
            },
          };
        }

        if (target.kind === "image" && target.fieldPath) {
          const styleKey = `${target.fieldPath}Style`;
          const existingStyle =
            block.content?.[styleKey] &&
            typeof block.content[styleKey] === "object"
              ? block.content[styleKey]
              : {};

          return {
            ...block,
            content: {
              ...block.content,
              [styleKey]: {
                ...existingStyle,
                ...patch,
              },
            },
          };
        }

        if (target.kind === "editable" && target.fieldPath) {
          const { styleKey } = getEditableStyleConfig(target.fieldPath);
          const existingStyle =
            block.content?.[styleKey] &&
            typeof block.content[styleKey] === "object"
              ? block.content[styleKey]
              : {};

          return {
            ...block,
            content: {
              ...block.content,
              [styleKey]: {
                ...existingStyle,
                ...patch,
              },
            },
          };
        }

        return block;
      }),
    );
  }, []);

  const handleContextMenuLayerSelect = useCallback(
    (layer) => {
      if (!layer) {
        return;
      }

      if (layer.kind === "editable" && layer.editable) {
        handlePreviewEditableSelection(layer.editable);
      } else if (layer.kind === "image" && layer.image) {
        handlePreviewImageSelection(layer.image);
      } else if (layer.kind === "section" && layer.section) {
        handlePreviewSectionSelection(layer.section);
      }

      setPreviewContextMenu(null);
    },
    [
      handlePreviewEditableSelection,
      handlePreviewImageSelection,
      handlePreviewSectionSelection,
    ],
  );

  const handleLibraryUpload = useCallback(
    async (file) => {
      const url = await uploadImageAsset(file);
      if (!url) {
        return;
      }

      setSidebarMode("library");
      setUploadedLibraryImages((prev) => [
        ...prev,
        {
          id: `upload:${Date.now()}`,
          blockId: "",
          fieldPath: "",
          label: "Uploaded Image",
          src: url,
          uploaded: true,
        },
      ]);
    },
    [uploadImageAsset],
  );

  useEffect(() => {
    if (!previewContextMenu) {
      return undefined;
    }

    const handleGlobalPointerDown = (event) => {
      if (event.button !== 0) {
        return;
      }

      const menuNode = previewContextMenuRef.current;
      if (
        menuNode &&
        event.target instanceof Node &&
        menuNode.contains(event.target)
      ) {
        return;
      }

      setPreviewContextMenu(null);
    };

    document.addEventListener("mousedown", handleGlobalPointerDown, true);
    return () => {
      document.removeEventListener("mousedown", handleGlobalPointerDown, true);
    };
  }, [previewContextMenu]);

  const handleEditableStyleChange = useCallback(
    (patch) => {
      if (
        !selectedEditableElement?.blockId ||
        !selectedEditableElement?.fieldPath
      ) {
        return;
      }

      const { blockId, fieldPath } = selectedEditableElement;
      const { styleKey } = getEditableStyleConfig(fieldPath);

      pendingHistoryDescriptionRef.current = `Styled ${fieldPath}`;
      setBlocks((prev) =>
        prev.map((block) => {
          if (String(block.id) !== String(blockId)) {
            return block;
          }

          const existingStyle =
            block.content?.[styleKey] &&
            typeof block.content[styleKey] === "object"
              ? block.content[styleKey]
              : {};

          return {
            ...block,
            content: {
              ...block.content,
              [styleKey]: {
                ...existingStyle,
                ...patch,
              },
            },
          };
        }),
      );
    },
    [selectedEditableElement],
  );

  const handleImageChange = useCallback(
    (patch) => {
      if (!selectedImageElement?.blockId || !selectedImageElement?.fieldPath) {
        return;
      }

      const { blockId, fieldPath } = selectedImageElement;
      const imageStyleKey = `${fieldPath}Style`;

      pendingHistoryDescriptionRef.current = `Updated ${fieldPath} image`;
      setBlocks((prev) =>
        prev.map((block) => {
          if (String(block.id) !== String(blockId)) {
            return block;
          }

          const existingStyle =
            block.content?.[imageStyleKey] &&
            typeof block.content[imageStyleKey] === "object"
              ? block.content[imageStyleKey]
              : {};

          const nextContent = {
            ...block.content,
            ...(typeof patch.src === "string"
              ? { [fieldPath]: patch.src }
              : {}),
            [imageStyleKey]: {
              ...existingStyle,
              ...(typeof patch.objectFit === "string"
                ? { objectFit: patch.objectFit }
                : {}),
              ...(typeof patch.borderRadius === "string"
                ? { borderRadius: patch.borderRadius }
                : {}),
              ...(typeof patch.borderWidth === "string"
                ? { borderWidth: patch.borderWidth, borderStyle: "solid" }
                : {}),
              ...(typeof patch.borderColor === "string"
                ? { borderColor: patch.borderColor }
                : {}),
            },
          };

          return {
            ...block,
            content: nextContent,
          };
        }),
      );
    },
    [selectedImageElement],
  );

  const handleOpenLibraryImage = useCallback(
    (item) => {
      if (!item?.blockId || !item?.fieldPath) {
        return;
      }

      handlePreviewImageSelection({
        blockId: item.blockId,
        fieldPath: item.fieldPath,
        src: item.src,
        label: item.label,
      });
    },
    [handlePreviewImageSelection],
  );

  const handleReplaceSelectedImage = useCallback(
    async (file) => {
      const url = await uploadImageAsset(file);
      if (!url) {
        return;
      }

      handleImageChange({ src: url });
      setSelectedImageElement((prev) =>
        prev
          ? {
              ...prev,
              src: url,
            }
          : prev,
      );
    },
    [handleImageChange, uploadImageAsset],
  );

  const handleSectionStyleChange = useCallback(
    (patch) => {
      if (!selectedSectionElement?.blockId) {
        return;
      }

      const styleKey = getSectionStyleKey(selectedSectionElement);
      pendingHistoryDescriptionRef.current =
        `Styled section ${selectedSectionElement.label || ""}`.trim();
      setBlocks((prev) =>
        prev.map((block) => {
          if (String(block.id) !== String(selectedSectionElement.blockId)) {
            return block;
          }

          const existingStyle =
            block.content?.[styleKey] &&
            typeof block.content[styleKey] === "object"
              ? block.content[styleKey]
              : {};

          return {
            ...block,
            content: {
              ...block.content,
              [styleKey]: {
                ...existingStyle,
                ...patch,
              },
            },
          };
        }),
      );
    },
    [selectedSectionElement],
  );

  // Inline edit save handler — Step 9.24: nested path update for content fields
  const handleInlineEditSave = useCallback((blockId, fieldPath, newValue) => {
    pendingHistoryDescriptionRef.current = `Edited ${fieldPath}`;
    const nextBlocks = blocksRef.current.map((block) => {
      if (String(block.id) !== String(blockId)) return block;
      const updated = {
        ...block,
        content: {
          ...(block.content || {}),
        },
      };
      const parts = fieldPath.split(".");
      let obj = updated.content;
      for (let i = 0; i < parts.length - 1; i++) {
        obj[parts[i]] = {
          ...(obj[parts[i]] && typeof obj[parts[i]] === "object"
            ? obj[parts[i]]
            : {}),
        };
        obj = obj[parts[i]];
      }
      obj[parts[parts.length - 1]] = newValue;
      return updated;
    });

    blocksRef.current = nextBlocks;
    setBlocks(nextBlocks);
  }, []);

  // BlockLibrary insert handler — creates a block via API (Phase 9 gap fix)
  const handleInsertBlockFromLibrary = useCallback(
    async (blockType, position, content) => {
      if (!selectedPage?.id) return;
      try {
        const resolvedContent =
          content ||
          (resolvedFrontendTemplateId === "company-executive"
            ? buildPlanSectionContent(blockType)
            : {});
        const newBlock = {
          id: `local-${Date.now()}`,
          blockType,
          content: resolvedContent,
          isVisible: true,
          sortOrder: blocks.length,
          localOnly: true,
        };
        pendingHistoryDescriptionRef.current = `Inserted ${blockType} block`;
        setBlocks((prev) => {
          if (position === "beginning") {
            return [newBlock, ...prev].map((block, index) => ({
              ...block,
              sortOrder: index,
            }));
          }
          if (typeof position === "number") {
            const copy = [...prev];
            copy.splice(position + 1, 0, newBlock);
            return copy.map((block, index) => ({
              ...block,
              sortOrder: index,
            }));
          }
          // 'end' or default
          return [...prev, newBlock].map((block, index) => ({
            ...block,
            sortOrder: index,
          }));
        });
        setBlockLibraryOpen(false);
      } catch (err) {
        console.error("Error inserting block from library:", err);
      }
    },
    [
      selectedPage?.id,
      blocks.length,
      resolvedFrontendTemplateId,
      buildPlanSectionContent,
    ],
  );

  // Mobile action handlers for MobileActionBar (Phase 9 gap fix)
  const handleMobileSave = useCallback(() => {
    triggerManualSave();
  }, [triggerManualSave]);

  const handleMobilePublish = useCallback(async () => {
    // TODO: Wire to full publish flow when available
    try {
      await apiClient.put(
        `/websites/${websiteId}`,
        { status: "PUBLISHED" },
        { headers: {} },
      );
      setWebsite((prev) => (prev ? { ...prev, status: "PUBLISHED" } : prev));
    } catch (err) {
      console.error("Error publishing website:", err);
    }
  }, [websiteId]);

  const handleMobilePreview = useCallback(() => {
    if (website?.slug) {
      window.open(`/site/${website.slug}`, "_blank");
    }
  }, [website?.slug]);

  const handleUndoBlocks = useCallback(() => {
    const previous = undo();
    if (!previous || !selectedPage?.id) return;
    suppressHistoryRef.current = true;
    setBlocks(previous);
  }, [undo, selectedPage?.id]);

  const handleRedoBlocks = useCallback(() => {
    const next = redo();
    if (!next || !selectedPage?.id) return;
    suppressHistoryRef.current = true;
    setBlocks(next);
  }, [redo, selectedPage?.id]);

  const liveSiteHref = website?.slug ? `/site/${website.slug}` : null;
  const headerMenuOpen = Boolean(headerMenuAnchorEl);
  const pageCount = pages.length;
  const activeBlockCount = blocks.length;
  const inspectorTitle =
    activeToolbarMode === "section"
      ? selectedSectionElement?.label || "Section"
      : selectedEditableElement
        ? getEditableStyleConfig(selectedEditableElement.fieldPath).label
        : selectedImageElement?.label || "Inspector";
  const inspectorCaption = selectedImageElement
    ? "Manage selected image from the media dialog."
    : activeToolbarMode === "section"
      ? "Adjust section background, padding, and spacing."
      : selectedEditableElement
        ? "Edit typography and alignment for the selected text."
        : "Select text or a section on the canvas to edit its settings.";
  const sidebarModeMeta =
    sidebarMode === "theme"
      ? {
          key: "theme",
          label: "Theme",
          icon: Palette,
        }
      : sidebarMode === "media"
        ? {
            key: "media",
            label: "Media",
            icon: ImageIcon,
          }
        : {
            key: "blocks",
            label: "Blocks",
            icon: Layers,
          };
  const showDesktopInspector =
    !isMobile &&
    isInspectorOpen &&
    (Boolean(selectedEditableElement) || Boolean(selectedSectionElement));

  const builderPanelSx = {
    position: "relative",
    overflow: "hidden",
    background: isEditorDark
      ? "linear-gradient(180deg, rgba(18,24,26,0.98) 0%, rgba(12,17,19,0.96) 100%)"
      : "white",
    border: `1px solid ${alpha(colors.primary, isEditorDark ? 0.18 : 0.1)}`,
    borderRadius: 1,
    boxShadow: isEditorDark
      ? "0 28px 70px rgba(0, 0, 0, 0.48)"
      : "0 18px 40px rgba(15, 23, 42, 0.08), 0 2px 8px rgba(15, 23, 42, 0.04)",
    backdropFilter: "blur(20px)",
    "&::before": {
      content: '""',
      position: "absolute",
      inset: 0,
      background: isEditorDark
        ? "radial-gradient(circle at top right, rgba(45, 212, 191, 0.14), transparent 34%)"
        : "radial-gradient(circle at top right, rgb(99 99 99 / 8%), transparent 32%), radial-gradient(circle at bottom left, rgb(181 181 181 / 5%), transparent 28%)",
      pointerEvents: "none",
    },
    "&::after": {
      content: '""',
      position: "absolute",
      inset: 1,
      borderRadius: "inherit",
      border: "1px solid rgba(255,255,255,0.68)",
      pointerEvents: "none",
    },
  };

  const builderSectionLabelSx = {
    fontSize: "0.68rem",
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    color: alpha(editorLabelText, 0.88),
    fontWeight: 700,
  };

  const sidebarHeaderButtonSx = {
    textTransform: "none",
    minHeight: 40,
    px: 1.25,
    borderRadius: 999,
    boxShadow: "none",
    transition:
      "transform 160ms ease, background-color 160ms ease, border-color 160ms ease, color 160ms ease, box-shadow 160ms ease",
    fontWeight: 700,
    letterSpacing: "-0.01em",
    "&:hover": {
      boxShadow: "0 8px 18px rgba(15,23,42,0.08)",
      transform: "translateY(-1px)",
    },
    "&.Mui-disabled": {
      color: alpha(editorText, 0.34),
      borderColor: alpha(colors.primary, 0.12),
      backgroundColor: "rgba(255,255,255,0.52)",
    },
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress sx={{ color: colors.primary }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl">
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        height: { md: "100vh" },
        background: "#ffffff",
        px: { xs: 1.25, sm: 2.25, lg: "0px" },
        overflowX: "hidden",
        overflowY: { md: "hidden" },
      }}
    >
      <Container
        maxWidth={false}
        sx={{
          px: 0,
          height: { md: "100%" },
          display: "flex",
          flexDirection: "column",
          overflow: { md: "hidden" },
        }}
        disableGutters
      >
        {/* Header */}
        <Box
          sx={{
            ...builderPanelSx,
            mb: 0,
            px: { xs: 1, sm: 1.2 },
            py: { xs: 0.65, sm: 0.7 },
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 1,
            minHeight: 60,
          }}
        >
          <Box display="flex" alignItems="center" gap={0.9} minWidth={0}>
            <IconButton
              onClick={() => navigate("/dashboard?tab=websites")}
              sx={{
                width: 32,
                height: 32,
                border: `1px solid ${alpha(colors.primary, 0.1)}`,
                backgroundColor: "rgba(255,255,255,0.94)",
                color: colors.text,
                boxShadow: "none",
                "&:hover": { backgroundColor: "#ffffff" },
              }}
            >
              <ArrowLeft size={15} />
            </IconButton>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  mt: 0.15,
                  color: colors.text,
                  fontWeight: 700,
                  letterSpacing: "-0.03em",
                  lineHeight: 1.1,
                  fontSize: { xs: "1.02rem", md: "1.08rem" },
                  maxWidth: { xs: 120, sm: 180, md: 220 },
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {website?.name || "Untitled Website"}
              </Typography>
            </Box>
          </Box>

          <Box
            display="flex"
            alignItems="center"
            gap={0.45}
            flexWrap="nowrap"
            justifyContent="flex-end"
            sx={{ ml: "auto" }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.25,
                p: 0.25,
                borderRadius: 999,
                backgroundColor: "rgba(255,255,255,0.88)",
                border: `1px solid ${alpha(colors.primary, 0.08)}`,
              }}
            >
              <Tooltip title="Undo last block change">
                <span>
                  <IconButton
                    onClick={handleUndoBlocks}
                    disabled={!canUndo}
                    sx={{
                      minWidth: 28,
                      minHeight: 28,
                      border: `1px solid transparent`,
                      color: canUndo ? colors.text : alpha(colors.text, 0.42),
                      backgroundColor: "transparent",
                      "&:hover": canUndo
                        ? {
                            backgroundColor: "rgba(15,23,42,0.05)",
                            color: colors.text,
                          }
                        : {},
                      "&.Mui-disabled": {
                        color: alpha(colors.text, 0.42),
                        borderColor: alpha(colors.text, 0.12),
                      },
                    }}
                  >
                    <Undo2 size={14} />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Redo reverted block change">
                <span>
                  <IconButton
                    onClick={handleRedoBlocks}
                    disabled={!canRedo}
                    sx={{
                      minWidth: 28,
                      minHeight: 28,
                      border: `1px solid transparent`,
                      color: canRedo ? colors.text : alpha(colors.text, 0.42),
                      backgroundColor: "transparent",
                      "&:hover": canRedo
                        ? {
                            backgroundColor: "rgba(15,23,42,0.05)",
                            color: colors.text,
                          }
                        : {},
                      "&.Mui-disabled": {
                        color: alpha(colors.text, 0.42),
                        borderColor: alpha(colors.text, 0.12),
                      },
                    }}
                  >
                    <Redo2 size={14} />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>

            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                alignItems: "center",
                p: 0.25,
                borderRadius: 999,
                backgroundColor: "rgba(255,255,255,0.88)",
                border: `1px solid ${alpha(colors.primary, 0.08)}`,
              }}
            >
              <Button
                variant="outlined"
                startIcon={<Eye size={16} />}
                onClick={handleMobilePreview}
                sx={{
                  textTransform: "none",
                  borderRadius: 999,
                  minHeight: 30,
                  px: 1,
                  borderColor: "transparent",
                  color: colors.text,
                  backgroundColor: "transparent",
                  boxShadow: "none",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  "&:hover": {
                    borderColor: "transparent",
                    backgroundColor: "rgba(15,23,42,0.05)",
                  },
                }}
              >
                Live Preview
              </Button>
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                p: 0.25,
                borderRadius: 999,
                backgroundColor: "rgba(255,255,255,0.88)",
                border: `1px solid ${alpha(colors.primary, 0.08)}`,
              }}
            >
              <Button
                variant="contained"
                startIcon={<Save size={16} />}
                onClick={triggerManualSave}
                disabled={saveStatus === "saving"}
                sx={{
                  textTransform: "none",
                  borderRadius: 999,
                  minHeight: 30,
                  px: 1.5,
                  background:
                    "linear-gradient(135deg, #111827 0%, #020617 100%)",
                  color: "white !important",
                  fontWeight: 700,
                  fontSize: "0.82rem",
                  boxShadow: "none",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #0f172a 0%, #000000 100%)",
                    boxShadow: "none",
                  },
                }}
              >
                {saveStatus === "saving" ? "Saving..." : "Save Changes"}
              </Button>
            </Box>

            {/* Autosave status indicator */}
            <Box sx={{ display: { xs: "none", xl: "block" } }}>
              <SaveStatus status={saveStatus} onRetry={triggerManualSave} />
            </Box>
            {/* WebSocket connection status (Step 7.5) */}
            <Box sx={{ display: { xs: "none", xl: "block" } }}>
              <ConnectionStatus
                connectionState={connectionState}
                connectedUsers={activeUsers.length}
              />
            </Box>

            {liveSiteHref && website?.status === "PUBLISHED" && (
              <Button
                variant="contained"
                startIcon={<Eye size={16} />}
                onClick={() => window.open(liveSiteHref, "_blank")}
                sx={{
                  display: { xs: "none", xl: "inline-flex" },
                  textTransform: "none",
                  borderRadius: 999,
                  px: 1.05,
                  minHeight: 30,
                  background: `linear-gradient(135deg, ${colors.primary} 0%, ${alpha(colors.primary, 0.78)} 100%)`,
                  color: "#061214",
                  fontWeight: 700,
                  fontSize: "0.82rem",
                  boxShadow: "none",
                }}
              >
                Open Live Site
              </Button>
            )}
          </Box>
        </Box>

        {isMobile &&
          (activeToolbarMode === "text" ? (
            <EditorStyleToolbar
              selection={
                selectedEditableElement
                  ? {
                      blockId: selectedEditableElement.blockId,
                      fieldPath: selectedEditableElement.fieldPath,
                      label: getEditableStyleConfig(
                        selectedEditableElement.fieldPath,
                      ).label,
                      editType: selectedEditableElement.editType,
                    }
                  : null
              }
              value={selectedEditableStyle}
              disabled={!selectedEditableElement}
              onStyleChange={handleEditableStyleChange}
              containerSx={{ mb: 2.25 }}
            />
          ) : (
            <EditorSectionStyleToolbar
              selection={
                selectedSectionElement
                  ? {
                      blockId: selectedSectionElement.blockId,
                      label: selectedSectionElement.label,
                    }
                  : null
              }
              value={selectedSectionStyle}
              disabled={!selectedSectionElement}
              onStyleChange={handleSectionStyleChange}
              containerSx={{ mb: 2.25 }}
            />
          ))}

        <ClickAwayListener onClickAway={() => setPreviewContextMenu(null)}>
          <Menu
            open={!!previewContextMenu}
            onClose={() => setPreviewContextMenu(null)}
            anchorReference="anchorPosition"
            anchorPosition={
              previewContextMenu
                ? { top: previewContextMenu.y, left: previewContextMenu.x }
                : undefined
            }
            transformOrigin={{ vertical: "top", horizontal: "left" }}
            hideBackdrop
            disableAutoFocusItem
            MenuListProps={{
              autoFocusItem: false,
              onContextMenu: (event) => {
                event.preventDefault();
                event.stopPropagation();
              },
            }}
            PaperProps={{
              ref: previewContextMenuRef,
              sx: {
                mt: 0.5,
                minWidth: 280,
                borderRadius: 2.5,
                border: `1px solid ${alpha(colors.primary, 0.14)}`,
                boxShadow: "0 20px 48px rgba(15, 23, 42, 0.16)",
                overflow: "hidden",
                pointerEvents: "auto",
              },
              onContextMenu: (event) => {
                event.preventDefault();
                event.stopPropagation();
              },
            }}
          >
            <MenuItem
              disabled
              sx={{
                opacity: 1,
                minHeight: 42,
                fontWeight: 700,
                color: editorText,
                borderBottom: `1px solid ${alpha(colors.text, 0.08)}`,
              }}
            >
              Layers
            </MenuItem>
            {previewContextMenu?.layers?.length ? (
              previewContextMenu.layers.map((layer) => {
                const isActive =
                  layer.kind === "editable"
                    ? selectedEditableElement &&
                      String(selectedEditableElement.blockId) ===
                        String(layer.editable?.blockId) &&
                      selectedEditableElement.fieldPath ===
                        layer.editable?.fieldPath
                    : layer.kind === "image"
                      ? selectedImageElement &&
                        String(selectedImageElement.blockId) ===
                          String(layer.image?.blockId) &&
                        selectedImageElement.fieldPath ===
                          layer.image?.fieldPath
                      : selectedSectionElement &&
                        String(selectedSectionElement.blockId) ===
                          String(layer.section?.blockId) &&
                        getSectionStyleKey(selectedSectionElement) ===
                          (layer.section?.styleKey || "sectionStyle");

                return (
                  <MenuItem
                    key={layer.id}
                    onClick={() => handleContextMenuLayerSelect(layer)}
                    sx={{
                      minHeight: 40,
                      pl: 1.5 + layer.depth * 2,
                      pr: 1.5,
                      gap: 1.2,
                      color: editorText,
                      backgroundColor: isActive
                        ? alpha(colors.primary, 0.12)
                        : "transparent",
                      "&:hover": {
                        backgroundColor: alpha(colors.primary, 0.08),
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 24,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: isActive ? colors.primary : editorMutedText,
                      }}
                    >
                      {layer.kind === "section" ? (
                        <Layers size={16} />
                      ) : layer.kind === "image" ? (
                        <Palette size={16} />
                      ) : (
                        <Pencil size={16} />
                      )}
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: isActive ? 700 : 500,
                          color: editorText,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {layer.label}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: editorMutedText }}
                      >
                        {layer.kind === "section"
                          ? "Section"
                          : layer.kind === "image"
                            ? "Image"
                            : "Typography"}
                      </Typography>
                    </Box>
                  </MenuItem>
                );
              })
            ) : (
              <MenuItem disabled sx={{ opacity: 1, color: editorMutedText }}>
                No selectable layers
              </MenuItem>
            )}
          </Menu>
        </ClickAwayListener>

        <Menu
          anchorEl={headerMenuAnchorEl}
          open={headerMenuOpen}
          onClose={() => setHeaderMenuAnchorEl(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
          PaperProps={{
            sx: {
              mt: 1,
              minWidth: 220,
              borderRadius: 2,
            },
          }}
        >
          <MenuItem disabled sx={{ opacity: 1, color: editorMutedText }}>
            {selectedPage ? `${selectedPage.title} page` : `${pageCount} pages`}
          </MenuItem>
          <MenuItem disabled sx={{ opacity: 1, color: editorMutedText }}>
            {liveSiteHref || "/site/preview"}
          </MenuItem>
          {liveSiteHref && website?.status === "PUBLISHED" && (
            <MenuItem
              onClick={() => {
                setHeaderMenuAnchorEl(null);
                window.open(liveSiteHref, "_blank");
              }}
              sx={{ color: colors.text }}
            >
              Open Live Site
            </MenuItem>
          )}
        </Menu>

        {/* Governance UI — Step 9.25: ApprovalStatusBanner */}
        <ApprovalStatusBanner
          websiteId={websiteId ? Number(websiteId) : 0}
          userRole={websiteRole}
          userId={user?.id ?? 0}
        />

        {/* {website?.frontendTemplateId && (
        <Alert
          severity="info"
          sx={{
            mt: 2,
            borderRadius: 3,
            border: `1px solid ${alpha(colors.primary, 0.18)}`,
            backgroundColor: alpha(colors.primary, isEditorDark ? 0.08 : 0.04),
            color: colors.text,
            '& .MuiAlert-icon': {
              color: colors.primary,
            },
          }}
        >
          Template mode: <strong>{resolvedFrontendTemplateId}</strong>. Preview follows the live layout.
        </Alert>
      )} */}

        <ResponsiveEditorLayout
          sx={{
            mt: 0,
            flex: 1,
            minHeight: 0,
            overflow: { md: "hidden" },
          }}
        >
          <Grid container spacing={2.5}>
            {/* Compact page switcher */}
            {/* {pages.length > 0 && (
          <Grid item xs={12}>
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                overflowX: 'auto',
                pb: 1,
                pt:3,
                px: 0.5,
                '&::-webkit-scrollbar': { height: 4 },
                '&::-webkit-scrollbar-thumb': {
                  bgcolor: alpha(colors.textSecondary, 0.3),
                  borderRadius: 2,
                },
              }}
            >
              {pages.map((page) => (
                <Chip
                  key={page.id}
                  label={page.title}
                  icon={page.isHome ? <House size={14} /> : undefined}
                  onClick={() => handleSelectPage(page)}
                  variant={selectedPage?.id === page.id ? 'filled' : 'outlined'}
                  sx={{
                    flexShrink: 0,
                    minHeight: 36,
                    borderRadius: 999,
                    borderColor: alpha(colors.primary, 0.3),
                    color: selectedPage?.id === page.id ? '#061214' : editorMutedText,
                    backgroundColor: selectedPage?.id === page.id ? colors.primary : 'transparent',
                    '& .MuiChip-icon': {
                      color: selectedPage?.id === page.id ? '#061214' : editorMutedText,
                    },
                  }}
                />
              ))}
              {!supportsLocalTemplateEditor && (
                <Chip
                  label="+ Add Page"
                  onClick={() => setPageDialogOpen(true)}
                  variant="outlined"
                  sx={{
                    flexShrink: 0,
                    minHeight: 36,
                    borderRadius: 999,
                    borderColor: alpha(colors.primary, 0.3),
                    color: colors.text,
                  }}
                />
              )}
            </Box>
          </Grid>
        )} */}

            {/* Blocks & Preview */}
            <Grid item xs={12} mt={4}>
              {selectedPage ? (
                <Box>
                  <Box
                    sx={{
                      ...builderPanelSx,
                      mb: 2,
                      px: { xs: 1.25, md: 1.75 },
                      py: 1.25,
                      display: "none",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: { xs: "column", xl: "row" },
                        justifyContent: "space-between",
                        alignItems: { xs: "flex-start", xl: "center" },
                        gap: 1.25,
                      }}
                    >
                      <Box>
                        <Typography sx={builderSectionLabelSx}>
                          Canvas
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{ color: colors.text, fontWeight: 700 }}
                        >
                          {website?.name || "Untitled Website"}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ mt: 0.45, color: editorMutedText }}
                        >
                          Editing {selectedPage.title} with live preview sync.
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        <Chip
                          label={
                            selectedPage.isHome ? "Home page" : "Standard page"
                          }
                          variant="outlined"
                          sx={{
                            borderColor: alpha(colors.primary, 0.24),
                            color: editorMutedText,
                          }}
                        />
                        <Chip
                          label={`${activeBlockCount} blocks`}
                          variant="outlined"
                          sx={{
                            borderColor: colors.border,
                            color: editorMutedText,
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>

                  <Grid container spacing={1} alignItems="stretch">
                    {/* Blocks List */}
                    <Grid item xs={12} lg={2.1}>
                      <Paper
                        sx={{
                          ...builderPanelSx,
                          pl: 2,
                          height: "100%",
                          borderRadius: 5,
                          minHeight: { lg: 860 },
                        }}
                      >
                        <Box
                          sx={{
                            px: 1.3,
                            py: 1.1,
                            borderBottom: `1px solid ${alpha(colors.primary, 0.1)}`,
                            backgroundColor: "rgba(255,255,255,0.74)",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: 0.7,
                              p: 0,
                              backgroundColor: "transparent",
                            }}
                          >
                            <FormControl
                              size="small"
                              sx={{
                                flex: 1,
                                minWidth: 0,
                              }}
                            >
                              <Select
                                value={sidebarMode}
                                onChange={(event) =>
                                  setSidebarMode(event.target.value)
                                }
                                IconComponent={ArrowDown}
                                displayEmpty
                                renderValue={() => {
                                  const Icon = sidebarModeMeta.icon;

                                  return (
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 0.8,
                                        minWidth: 0,
                                      }}
                                    >
                                      <Icon size={15} color={editorMutedText} />
                                      <Typography
                                        sx={{
                                          fontSize: "0.9rem",
                                          fontWeight: 600,
                                          color: colors.text,
                                          whiteSpace: "nowrap",
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                        }}
                                      >
                                        {sidebarModeMeta.label}
                                      </Typography>
                                    </Box>
                                  );
                                }}
                                sx={{
                                  height: 40,
                                  borderRadius: 3,
                                  backgroundColor: "rgba(255,255,255,0.96)",
                                  boxShadow:
                                    "0 1px 2px rgba(15,23,42,0.04), inset 0 1px 0 rgba(255,255,255,0.9)",
                                  "& .MuiSelect-select": {
                                    display: "flex",
                                    alignItems: "center",
                                    py: 0.9,
                                    pl: 1.05,
                                    pr: "2rem !important",
                                  },
                                  "& .MuiOutlinedInput-notchedOutline": {
                                    borderColor: alpha(colors.primary, 0.16),
                                  },
                                  "&:hover .MuiOutlinedInput-notchedOutline": {
                                    borderColor: alpha(colors.primary, 0.26),
                                  },
                                  "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                    {
                                      borderColor: alpha(colors.primary, 0.3),
                                    },
                                  "& .MuiSelect-icon": {
                                    right: 10,
                                    width: 16,
                                    height: 16,
                                    color: editorMutedText,
                                  },
                                }}
                                aria-label="Select sidebar mode"
                              >
                                {[
                                  {
                                    key: "blocks",
                                    label: "Blocks",
                                    icon: Layers,
                                    disabled: false,
                                  },
                                  {
                                    key: "theme",
                                    label: "Theme",
                                    icon: Palette,
                                    disabled: !supportsTemplateThemeSidebar,
                                  },
                                  {
                                    key: "media",
                                    label: "Media",
                                    icon: ImageIcon,
                                    disabled: false,
                                  },
                                ].map((option) => {
                                  const Icon = option.icon;

                                  return (
                                    <MenuItem
                                      key={option.key}
                                      value={option.key}
                                      disabled={option.disabled}
                                      sx={{
                                        minHeight: 42,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                      }}
                                    >
                                      <Icon size={15} color={editorMutedText} />
                                      <Typography
                                        sx={{
                                          fontSize: "0.9rem",
                                          fontWeight: 500,
                                          color: editorMutedText,
                                        }}
                                      >
                                        {option.label}
                                      </Typography>
                                    </MenuItem>
                                  );
                                })}
                              </Select>
                            </FormControl>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<Layers size={15} />}
                              onClick={() => openBlockLibraryAtPosition("end")}
                              sx={{
                                ...sidebarHeaderButtonSx,
                                minWidth: 0,
                                px: 1,
                                color: editorText,
                                borderColor: alpha(colors.primary, 0.16),
                                backgroundColor: "rgba(255,255,255,0.86)",
                                "& .MuiButton-startIcon": {
                                  mr: 0.6,
                                },
                                "&:hover": {
                                  backgroundColor: "#ffffff",
                                  borderColor: alpha(colors.primary, 0.28),
                                },
                              }}
                              aria-label="Open block library"
                            >
                              Library
                            </Button>
                            <IconButton
                              size="small"
                              onClick={() => setBlockDialogOpen(true)}
                              sx={{
                                minWidth: 38,
                                minHeight: 38,
                                flexShrink: 0,
                                borderRadius: 3,
                                border: `1px solid ${alpha(colors.primary, 0.16)}`,
                                backgroundColor: "rgba(255,255,255,0.86)",
                                color: colors.text,
                                transition:
                                  "background-color 160ms ease, border-color 160ms ease, color 160ms ease",
                                "&:hover": {
                                  background:
                                    "linear-gradient(135deg, #111827 0%, #020617 100%)",
                                  borderColor: alpha(colors.primary, 0.3),
                                  color: "#ffffff",
                                },
                                "&.Mui-disabled": {
                                  color: alpha(colors.text, 0.34),
                                  borderColor: alpha(colors.primary, 0.12),
                                  backgroundColor: "rgba(255,255,255,0.52)",
                                },
                              }}
                              aria-label="Add block"
                            >
                              <Plus size={18} />
                            </IconButton>
                          </Box>
                        </Box>

                        <Box sx={{ p: 1.4 }}>
                          {blockError && (
                            <Alert
                              severity="error"
                              sx={{ mb: 2 }}
                              action={
                                <Button
                                  color="inherit"
                                  size="small"
                                  onClick={() =>
                                    selectedPage && fetchBlocks(selectedPage.id)
                                  }
                                >
                                  Retry
                                </Button>
                              }
                            >
                              {blockError}
                            </Alert>
                          )}

                          {sidebarMode === "blocks" ? (
                            <>
                              <DraggableBlockList
                                blocks={blocks}
                                pageId={selectedPage?.id}
                                websiteId={websiteId}
                                selectedBlockId={editingBlock?.id ?? null}
                                disabled={false}
                                persistReorder={!isLocalTemplateEditorPage}
                                onBlocksChange={(reordered) => {
                                  setBlocks(reordered);
                                }}
                                onBlockSelect={(blockId) => {
                                  const block = blocks.find(
                                    (b) => b.id === blockId,
                                  );
                                  if (block) {
                                    setEditingBlock(block);
                                    setBlockForm({
                                      blockType: block.blockType,
                                      content: block.content,
                                    });
                                  }
                                }}
                              />
                            </>
                          ) : sidebarMode === "media" ? (
                            <Box>
                              <input
                                ref={imageLibraryInputRef}
                                type="file"
                                accept="image/*"
                                hidden
                                onChange={(event) => {
                                  void handleLibraryUpload(
                                    event.target.files?.[0] || null,
                                  );
                                  event.target.value = "";
                                }}
                              />
                              <Box
                                sx={{
                                  display: "grid",
                                  gridTemplateColumns:
                                    "repeat(2, minmax(0, 1fr))",
                                  gap: 1.3,
                                  maxHeight: { xs: 420, lg: 700 },
                                  overflowY: "auto",
                                  pr: 0.6,
                                }}
                              >
                                {imageLibraryItems.map((item) => (
                                  <ButtonBase
                                    key={item.id}
                                    onClick={() => handleOpenLibraryImage(item)}
                                    disabled={!item.blockId}
                                    sx={{
                                      display: "flex",
                                      flexDirection: "column",
                                      alignItems: "stretch",
                                      textAlign: "left",
                                      borderRadius: 3,
                                      overflow: "hidden",
                                      border: `1px solid ${alpha(colors.primary, 0.14)}`,
                                      backgroundColor: "rgba(255,255,255,0.88)",
                                      transition:
                                        "transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease",
                                      "&:hover": {
                                        transform: item.blockId
                                          ? "translateY(-2px)"
                                          : "none",
                                        boxShadow: item.blockId
                                          ? "0 14px 30px rgba(15,23,42,0.1)"
                                          : "none",
                                        borderColor: alpha(
                                          colors.primary,
                                          0.26,
                                        ),
                                      },
                                      "&.Mui-disabled": {
                                        opacity: 0.86,
                                      },
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        height: 108,
                                        backgroundImage: `url(${item.src})`,
                                        backgroundSize: "cover",
                                        backgroundPosition: "center",
                                        backgroundColor: "#e5e7eb",
                                      }}
                                    />
                                    <Box sx={{ p: 1.1 }}>
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          color: colors.text,
                                          fontWeight: 700,
                                          whiteSpace: "nowrap",
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                        }}
                                      >
                                        {item.label}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        sx={{ color: editorMutedText }}
                                      >
                                        {item.blockId
                                          ? "Template image"
                                          : "Uploaded asset"}
                                      </Typography>
                                    </Box>
                                  </ButtonBase>
                                ))}
                                <ButtonBase
                                  onClick={() =>
                                    imageLibraryInputRef.current?.click()
                                  }
                                  sx={{
                                    minHeight: 156,
                                    borderRadius: 3,
                                    border: `1px dashed ${alpha(colors.primary, 0.32)}`,
                                    backgroundColor: "rgba(255,255,255,0.82)",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 1,
                                    color: colors.text,
                                    transition:
                                      "transform 160ms ease, border-color 160ms ease, background-color 160ms ease",
                                    "&:hover": {
                                      transform: "translateY(-2px)",
                                      borderColor: alpha(colors.primary, 0.44),
                                      backgroundColor: "rgba(255,255,255,0.94)",
                                    },
                                  }}
                                >
                                  <Upload size={20} />
                                  <Typography
                                    sx={{
                                      fontSize: "0.92rem",
                                      fontWeight: 700,
                                    }}
                                  >
                                    Upload
                                  </Typography>
                                </ButtonBase>
                              </Box>
                            </Box>
                          ) : (
                            <Box
                              sx={{
                                fontFamily: '"Poppins", "Inter", sans-serif',
                                "& .MuiTypography-root, & .MuiButton-root, & .MuiChip-root, & .MuiInputBase-root, & .MuiFormLabel-root, & .MuiFormHelperText-root":
                                  {
                                    fontFamily:
                                      '"Poppins", "Inter", sans-serif',
                                  },
                              }}
                            >
                              <FrontendTemplateThemePanel
                                templateId={resolvedFrontendTemplateId}
                                selection={templateThemeSelection}
                                onChange={setTemplateThemeSelection}
                              />
                              {/* <ThemeManager
                              websiteId={websiteId}
                              currentThemeId={website?.themeId || null}
                              onThemeChange={() => {
                                refreshPreview();
                                fetchWebsiteData();
                              }}
                            /> */}
                            </Box>
                          )}
                        </Box>
                      </Paper>
                    </Grid>

                    {/* Preview — Step 4.11: PreviewPanel with live srcdoc */}
                    <Grid item xs={12} lg={showDesktopInspector ? 8 : 9.9}>
                      <Paper
                        sx={{
                          ...builderPanelSx,
                          p: 1.15,
                          overflow: "hidden",
                          position: { md: "sticky" },
                          top: { md: 16 },
                          borderRadius: 5,
                        }}
                      >
                        {/* <Box
                    sx={{
                      px: 1.5,
                      py: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 1,
                    }}
                  >
                    <Box>
                      <Typography sx={builderSectionLabelSx}>Preview</Typography>
                      <Typography variant="subtitle1" sx={{ color: colors.text, fontWeight: 700 }}>
                        Live canvas
                      </Typography>
                    </Box>
                    <Chip
                      label={
                        resolvedFrontendTemplateId
                          ? `Template mode: ${resolvedFrontendTemplateId}`
                          : editingBlock
                            ? `Selected: ${editingBlock.blockType}`
                            : 'Select from canvas'
                      }
                      size="small"
                      variant="outlined"
                      sx={{ borderColor: alpha(colors.primary, 0.24), color: editorMutedText }}
                    />
                  </Box> */}
                        <Box sx={{ height: { xs: 440, md: 760, xl: 860 } }}>
                          <PreviewPanel
                            websiteId={websiteId}
                            pageId={selectedPage?.id}
                            pageTitle={selectedPage?.title}
                            pages={pages.map((page) => ({
                              id: page.id,
                              title: page.title,
                            }))}
                            onPageChange={(pageId) => {
                              const nextPage = pages.find(
                                (page) => String(page.id) === String(pageId),
                              );
                              if (nextPage) {
                                setSelectedPage(nextPage);
                              }
                            }}
                            selectedBlockId={
                              editingBlock?.id ? String(editingBlock.id) : null
                            }
                            onBlockSelected={(blockId) => {
                              setSelectedEditableElement(null);
                              setSelectedImageElement(null);
                              setSelectedSectionElement(null);
                              setActiveToolbarMode("text");
                              setIsInspectorOpen(false);
                              setPreviewContextMenu(null);
                              setBlockDialogOpen(false);
                              setEditingBlock(null);
                            }}
                            onEditableElementSelected={
                              handlePreviewEditableSelection
                            }
                            onImageSelected={handlePreviewImageSelection}
                            onSectionSelected={handlePreviewSectionSelection}
                            onSectionAddRequest={handlePreviewSectionAddRequest}
                            onPreviewContextMenu={handlePreviewContextMenu}
                            onEditableTextSave={handleInlineEditSave}
                            onElementTransform={handlePreviewElementTransform}
                            saveSignal={previewSaveSignal}
                            iframeRefCallback={(ref) => {
                              iframeRef.current = ref?.current ?? null;
                            }}
                            selectedPreviewTarget={selectedPreviewTarget}
                          />
                        </Box>
                      </Paper>
                    </Grid>
                    {showDesktopInspector && (
                      <Grid item xs={12} lg={1.9}>
                        <Paper
                          sx={{
                            ...builderPanelSx,
                            p: 0,
                            borderRadius: 5,
                            minHeight: { lg: 860 },
                            position: { md: "sticky" },
                            top: { md: 16 },
                            display: "flex",
                            flexDirection: "column",
                            height: { md: "calc(100vh - 32px)" },
                            maxHeight: { md: "calc(100vh - 32px)" },
                            overflow: "hidden",
                          }}
                        >
                          <Box
                            sx={{
                              px: 1.45,
                              py: 1.15,
                              borderBottom: `1px solid ${alpha(colors.primary, 0.1)}`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: 1,
                              backgroundColor: "rgba(255,255,255,0.74)",
                            }}
                          >
                            <Box>
                              <Typography sx={builderSectionLabelSx}>
                                {activeToolbarMode === "section"
                                  ? "Section"
                                  : selectedImageElement
                                    ? "Media"
                                    : "Typography"}
                              </Typography>
                              <Typography
                                variant="subtitle1"
                                sx={{
                                  mt: 0.35,
                                  color: colors.text,
                                  fontWeight: 700,
                                }}
                              >
                                {inspectorTitle}
                              </Typography>
                            </Box>
                            <Chip
                              size="small"
                              label={
                                activeToolbarMode === "section"
                                  ? "Layout"
                                  : selectedImageElement
                                    ? "Image"
                                    : "Style"
                              }
                              sx={{
                                borderRadius: 999,
                                backgroundColor: alpha(colors.primary, 0.08),
                                color: colors.text,
                                fontWeight: 700,
                              }}
                            />
                            <IconButton
                              size="small"
                              onClick={() => setIsInspectorOpen(false)}
                              sx={{
                                width: 30,
                                height: 30,
                                border: `1px solid ${alpha(colors.primary, 0.12)}`,
                                backgroundColor: "rgba(255,255,255,0.84)",
                                color: editorMutedText,
                                ml: 0.5,
                              }}
                              aria-label="Hide inspector"
                            >
                              <X size={15} />
                            </IconButton>
                          </Box>

                          <Box
                            sx={{
                              p: 1.45,
                              paddingBottom: "70px !important",
                              flex: 1,
                              minHeight: 0,
                              overflowY: "auto",
                              overflowX: "hidden",
                              "&::-webkit-scrollbar": {
                                width: 8,
                              },
                              "&::-webkit-scrollbar-thumb": {
                                backgroundColor: "rgba(148,163,184,0.38)",
                                borderRadius: 999,
                              },
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                mb: 1.6,
                                color: editorMutedText,
                                lineHeight: 1.6,
                              }}
                            >
                              {inspectorCaption}
                            </Typography>

                            {selectedImageElement ? (
                              <Box
                                sx={{
                                  p: 1.4,
                                  borderRadius: 3,
                                  border: `1px solid ${alpha(colors.primary, 0.14)}`,
                                  backgroundColor: "rgba(255,255,255,0.84)",
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{ color: colors.text, fontWeight: 600 }}
                                >
                                  Image editing opens in the media popup so the
                                  existing replace flow keeps working.
                                </Typography>
                              </Box>
                            ) : activeToolbarMode === "section" ? (
                              <EditorSectionStyleToolbar
                                selection={
                                  selectedSectionElement
                                    ? {
                                        blockId: selectedSectionElement.blockId,
                                        label: selectedSectionElement.label,
                                      }
                                    : null
                                }
                                value={selectedSectionStyle}
                                disabled={!selectedSectionElement}
                                onStyleChange={handleSectionStyleChange}
                                layout="panel"
                                containerSx={{
                                  flexWrap: "wrap",
                                  alignItems: "flex-start",
                                  overflowX: "visible",
                                  rowGap: 1.1,
                                  p: "0 !important",
                                  background: "transparent",
                                  boxShadow: "none",
                                  border: "none",
                                  "& .MuiDivider-root": { display: "none" },
                                  "& .editor-toolbar-selection-label": {
                                    display: "none",
                                  },
                                  "& .MuiFormControl-root": {
                                    width: "100%",
                                    minWidth: "100% !important",
                                  },
                                }}
                              />
                            ) : (
                              <EditorStyleToolbar
                                selection={
                                  selectedEditableElement
                                    ? {
                                        blockId:
                                          selectedEditableElement.blockId,
                                        fieldPath:
                                          selectedEditableElement.fieldPath,
                                        label: getEditableStyleConfig(
                                          selectedEditableElement.fieldPath,
                                        ).label,
                                        editType:
                                          selectedEditableElement.editType,
                                      }
                                    : null
                                }
                                value={selectedEditableStyle}
                                disabled={!selectedEditableElement}
                                onStyleChange={handleEditableStyleChange}
                                layout="panel"
                                containerSx={{
                                  flexWrap: "wrap",
                                  alignItems: "flex-start",
                                  overflowX: "visible",
                                  rowGap: 1.1,
                                  p: 0,
                                  background: "transparent",
                                  boxShadow: "none",
                                  border: "none",
                                  "& .MuiDivider-root": { display: "none" },
                                  "& .editor-toolbar-selection-label": {
                                    display: "none",
                                  },
                                  "& .MuiFormControl-root": {
                                    width: "100%",
                                    minWidth: "100% !important",
                                  },
                                }}
                              />
                            )}
                          </Box>
                        </Paper>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              ) : (
                <Paper
                  sx={{
                    ...builderPanelSx,
                    px: 3,
                    py: 6,
                    textAlign: "center",
                  }}
                >
                  <Typography sx={builderSectionLabelSx}>
                    Start Building
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{ mt: 0.8, color: colors.text, fontWeight: 700 }}
                  >
                    Select or create a page to get started
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ mt: 1, color: colors.textSecondary }}
                  >
                    Set up your sitemap first, then shape each section inside
                    the live canvas.
                  </Typography>
                </Paper>
              )}
            </Grid>
          </Grid>
        </ResponsiveEditorLayout>
        <Dialog
          open={!!selectedImageElement}
          onClose={() => setSelectedImageElement(null)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              backgroundColor: "#ffffff",
              backgroundImage: "none",
              overflow: "hidden",
              border: `1px solid ${alpha(colors.primary, 0.1)}`,
              boxShadow: "0 26px 70px rgba(15, 23, 42, 0.18)",
            },
          }}
        >
          <input
            ref={imageReplaceInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(event) => {
              void handleReplaceSelectedImage(event.target.files?.[0] || null);
              event.target.value = "";
            }}
          />
          <DialogTitle
            sx={{
              px: 3,
              py: 2.25,
              borderBottom: `1px solid ${alpha(colors.primary, 0.12)}`,
              background:
                "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(248,250,252,1) 100%)",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Box>
              <Typography sx={builderSectionLabelSx}>Image</Typography>
              <Typography
                variant="h6"
                sx={{ mt: 0.4, fontWeight: 800, color: editorText }}
              >
                {selectedImageElement?.label || "Selected Image"}
              </Typography>
              <Typography
                sx={{
                  mt: 0.75,
                  fontSize: "0.92rem",
                  color: editorMutedText,
                }}
              >
                Replace the image and tune fit, border, and radius for this block.
              </Typography>
            </Box>
            <IconButton
              onClick={() => setSelectedImageElement(null)}
              sx={{
                mt: 0.25,
                color: editorMutedText,
                border: `1px solid ${alpha("#111827", 0.08)}`,
                backgroundColor: "#fff",
              }}
            >
              <X size={18} />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ px: 3, py: 2.5, backgroundColor: "#f8fafc" }}>
            <Box
              sx={{
                height: 260,
                borderRadius: 3,
                border: `1px solid ${alpha(colors.primary, 0.14)}`,
                overflow: "hidden",
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(241,245,249,0.95) 100%)",
                backgroundImage: selectedImageValue.src
                  ? `url(${selectedImageValue.src})`
                  : "none",
                backgroundSize:
                  selectedImageValue.objectFit === "contain"
                    ? "contain"
                    : selectedImageValue.objectFit,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                mb: 2,
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.55)",
              }}
            />

            <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
              <Button
                variant="contained"
                startIcon={<Upload size={16} />}
                onClick={() => imageReplaceInputRef.current?.click()}
                sx={{
                  minHeight: 42,
                  textTransform: "none",
                  borderRadius: 2.5,
                  background: `linear-gradient(135deg, ${colors.primary} 0%, ${alpha(colors.primary, 0.78)} 100%)`,
                  color: "#ffffff",
                  boxShadow: "none",
                  fontWeight: 700,
                }}
              >
                Replace
              </Button>
              <Button
                variant="outlined"
                onClick={() => setSelectedImageElement(null)}
                sx={{
                  minHeight: 42,
                  textTransform: "none",
                  borderRadius: 2.5,
                  borderColor: alpha("#111827", 0.12),
                  color: editorText,
                  backgroundColor: "#fff",
                }}
              >
                Done
              </Button>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 1.25,
              }}
            >
              <DashboardInput
                fullWidth
                label="Image URL"
                labelPlacement="floating"
                value={selectedImageValue.src || ""}
                onChange={(event) =>
                  handleImageChange({ src: event.target.value })
                }
                sx={{
                  gridColumn: "1 / -1",
                  "& input": {
                    color: editorText,
                    fontSize: "14px",
                  },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    backgroundColor: "#ffffff",
                    "& fieldset": {
                      borderColor: alpha("#111827", 0.12),
                    },
                    "&:hover fieldset": {
                      borderColor: alpha(colors.primary, 0.35),
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: colors.primary,
                    },
                  },
                }}
              />
              <DashboardInput
                fullWidth
                label="Border Radius"
                labelPlacement="floating"
                value={selectedImageValue.borderRadius || "0px"}
                onChange={(event) =>
                  handleImageChange({ borderRadius: event.target.value })
                }
                sx={{
                  "& input": {
                    color: editorText,
                    fontSize: "14px",
                  },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    backgroundColor: "#ffffff",
                    "& fieldset": {
                      borderColor: alpha("#111827", 0.12),
                    },
                    "&:hover fieldset": {
                      borderColor: alpha(colors.primary, 0.35),
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: colors.primary,
                    },
                  },
                }}
              />
              <DashboardInput
                fullWidth
                label="Border Width"
                labelPlacement="floating"
                value={selectedImageValue.borderWidth || "0px"}
                onChange={(event) =>
                  handleImageChange({ borderWidth: event.target.value })
                }
                sx={{
                  "& input": {
                    color: editorText,
                    fontSize: "14px",
                  },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    backgroundColor: "#ffffff",
                    "& fieldset": {
                      borderColor: alpha("#111827", 0.12),
                    },
                    "&:hover fieldset": {
                      borderColor: alpha(colors.primary, 0.35),
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: colors.primary,
                    },
                  },
                }}
              />
              <DashboardInput
                fullWidth
                label="Border Color"
                labelPlacement="floating"
                value={selectedImageValue.borderColor || "#e5e7eb"}
                onChange={(event) =>
                  handleImageChange({ borderColor: event.target.value })
                }
                sx={{
                  "& input": {
                    color: editorText,
                    fontSize: "14px",
                  },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    backgroundColor: "#ffffff",
                    "& fieldset": {
                      borderColor: alpha("#111827", 0.12),
                    },
                    "&:hover fieldset": {
                      borderColor: alpha(colors.primary, 0.35),
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: colors.primary,
                    },
                  },
                }}
              />
              <FormControl size="small" sx={{ minWidth: 0 }}>
                <Select
                  value={selectedImageValue.objectFit || "cover"}
                  onChange={(event) =>
                    handleImageChange({ objectFit: event.target.value })
                  }
                  sx={{
                    height: 54,
                    borderRadius: 2.5,
                    backgroundColor: "#ffffff",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: alpha("#111827", 0.12),
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: alpha(colors.primary, 0.35),
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: colors.primary,
                    },
                  }}
                >
                  <MenuItem value="cover">Fit: cover</MenuItem>
                  <MenuItem value="contain">Fit: contain</MenuItem>
                  <MenuItem value="fill">Fit: fill</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions
            sx={{
              px: 3,
              py: 2,
              borderTop: `1px solid ${alpha(colors.primary, 0.12)}`,
              backgroundColor: "#ffffff",
              justifyContent: "space-between",
            }}
          >
            <Typography sx={{ fontSize: "0.82rem", color: editorMutedText }}>
              Changes apply instantly to the canvas. Use Save Changes to persist them.
            </Typography>
            <Button
              onClick={() => setSelectedImageElement(null)}
              variant="contained"
              sx={{
                minWidth: 108,
                minHeight: 42,
                textTransform: "none",
                borderRadius: 2.5,
                background: "#0f172a",
                color: "#ffffff",
                boxShadow: "none",
                fontWeight: 700,
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* BlockLibrary drawer — Phase 9 gap fix */}
        {selectedPage && (
          <BlockLibrary
            open={blockLibraryOpen}
            onClose={() => setBlockLibraryOpen(false)}
            pageId={selectedPage?.id}
            blocks={blocks}
            extraBlocks={blockLibraryExtraBlocks}
            preferredInsertPosition={blockLibraryPreferredPosition}
            onInsertBlock={handleInsertBlockFromLibrary}
            closeAfterInsert={false}
            currentUserRole={websiteRole}
          />
        )}

        {/* MobileFAB — opens block library on mobile (Phase 9 gap fix) */}
        {isMobile && selectedPage && (
          <MobileFAB onOpen={() => openBlockLibraryAtPosition("end")} />
        )}

        {/* MobileActionBar — save/publish/preview on mobile (Phase 9 gap fix) */}
        {isMobile && (
          <MobileActionBar
            onSave={handleMobileSave}
            onPublish={handleMobilePublish}
            onPreview={handleMobilePreview}
            isSaving={saveStatus === "saving"}
            isMac={
              typeof navigator !== "undefined" &&
              /Mac|iPad|iPhone/.test(navigator.userAgent)
            }
          />
        )}

        {/* Create Page Dialog */}
        <Dialog
          open={pageDialogOpen}
          onClose={() => !submitting && setPageDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              backgroundColor: "#ffffff",
              backgroundImage: "none",
              color: editorText,
            },
          }}
        >
          <DialogTitle sx={{ bgcolor: "#ffffff", color: editorText }}>
            Create Page
          </DialogTitle>
          <DialogContent sx={{ bgcolor: "#ffffff", pt: 3, color: editorText }}>
            {formError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {formError}
              </Alert>
            )}

            <DashboardInput
              fullWidth
              label="Title"
              labelPlacement="floating"
              value={pageForm.title}
              onChange={(e) =>
                setPageForm({ ...pageForm, title: e.target.value })
              }
              sx={{ mb: 2 }}
            />

            <DashboardInput
              fullWidth
              label="Path"
              labelPlacement="floating"
              value={pageForm.path}
              onChange={(e) =>
                setPageForm({ ...pageForm, path: e.target.value })
              }
              helperText="Must start with / (example: /about)"
              sx={{ mb: 2 }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={pageForm.isHome}
                  onChange={(e) =>
                    setPageForm({ ...pageForm, isHome: e.target.checked })
                  }
                />
              }
              label="Set as home page"
              sx={{ color: editorText }}
            />
          </DialogContent>

          <DialogActions sx={{ bgcolor: "#ffffff", px: 3, pb: 2 }}>
            <Button
              onClick={() => setPageDialogOpen(false)}
              disabled={submitting}
              sx={{ color: editorMutedText }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreatePage}
              variant="contained"
              disabled={submitting || !pageForm.title || !pageForm.path}
            >
              {submitting ? <CircularProgress size={24} /> : "Create"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Create/Edit Block Dialog */}
        <Dialog
          open={blockDialogOpen || !!editingBlock}
          onClose={() => {
            if (!submitting) {
              setBlockDialogOpen(false);
              setEditingBlock(null);
              setBlockForm({ blockType: "", content: {} });
              setFormError(null);
              setFormHasErrors(false);
            }
          }}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              overflow: "hidden",
              backgroundColor: "#ffffff",
              backgroundImage: "none",
              background: isEditorDark
                ? "linear-gradient(180deg, rgba(18,24,26,0.98) 0%, rgba(10,14,16,0.98) 100%)"
                : "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(249,250,251,1) 100%)",
              border: `1px solid ${alpha(colors.primary, isEditorDark ? 0.18 : 0.1)}`,
              boxShadow: isEditorDark
                ? "0 28px 80px rgba(0, 0, 0, 0.5)"
                : "0 24px 60px rgba(15, 23, 42, 0.16)",
            },
          }}
        >
          <DialogTitle
            sx={{
              px: 3,
              py: 2.25,
              borderBottom: `1px solid ${alpha(colors.primary, 0.12)}`,
              backgroundColor: alpha(
                colors.primary,
                isEditorDark ? 0.08 : 0.04,
              ),
              color: editorText,
            }}
          >
            <Typography sx={builderSectionLabelSx}>Block Settings</Typography>
            <Typography
              variant="h5"
              sx={{ mt: 0.5, fontWeight: 800, color: editorText }}
            >
              {editingBlock ? "Edit Block" : "Add Block"}
            </Typography>
            <Typography
              variant="body2"
              sx={{ mt: 0.75, color: editorMutedText }}
            >
              {editingBlock
                ? `Update the selected ${editingBlock.blockType?.toLowerCase() || "content"} section with live preview sync.`
                : "Choose a block source first, then configure its content and layout."}
            </Typography>
          </DialogTitle>

          <DialogContent
            dividers
            sx={{
              px: 3,
              py: 2.5,
              backgroundColor: "#ffffff",
              backgroundImage: "none",
              color: editorText,
              "& .MuiAlert-root": {
                borderRadius: 2.5,
              },
              "& .MuiBox-root > .MuiBox-root": {
                borderRadius: 2,
              },
              "& .MuiTypography-root, & .MuiFormLabel-root, & .MuiInputLabel-root, & .MuiFormHelperText-root, & .MuiFormControlLabel-label, & .MuiInputBase-input, & .MuiSelect-select, & .MuiButtonBase-root":
                {
                  color: `${editorText} !important`,
                },
              "& .MuiFormHelperText-root": {
                color: `${editorMutedText} !important`,
              },
              "& .MuiOutlinedInput-root, & .MuiInputBase-root": {
                backgroundColor: "#ffffff",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: `${alpha("#111827", 0.18)} !important`,
              },
              "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline":
                {
                  borderColor: `${alpha(colors.primary, 0.45)} !important`,
                },
              "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                {
                  borderColor: `${colors.primary} !important`,
                },
            }}
          >
            {formError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {formError}
              </Alert>
            )}

            {!editingBlock && (
              <Box sx={{ mb: 3 }}>
                <Alert
                  severity="info"
                  sx={{
                    mb: 2,
                    border: `1px solid ${alpha(colors.primary, 0.12)}`,
                    backgroundColor: alpha(
                      colors.primary,
                      isEditorDark ? 0.08 : 0.04,
                    ),
                    color: editorText,
                  }}
                >
                  Use the Block Library to add new blocks with full search and
                  categories.
                </Alert>
                <Button
                  variant="outlined"
                  startIcon={<Plus size={18} />}
                  onClick={() => {
                    setBlockDialogOpen(false);
                    openBlockLibraryAtPosition("end");
                  }}
                  fullWidth
                  sx={{
                    minHeight: 48,
                    borderRadius: 2.5,
                    textTransform: "none",
                    borderColor: alpha(colors.primary, 0.24),
                    color: editorText,
                    backgroundColor: "#ffffff",
                  }}
                >
                  Open Block Library
                </Button>
              </Box>
            )}

            {(blockForm.blockType || editingBlock) && (
              <FormGenerator
                blockType={(
                  blockForm.blockType ||
                  editingBlock?.blockType ||
                  ""
                ).toLowerCase()}
                initialValues={blockForm.content}
                onChange={(values) =>
                  setBlockForm((prev) => ({ ...prev, content: values }))
                }
                onValidate={(errors) =>
                  setFormHasErrors(Object.keys(errors).length > 0)
                }
                disabled={submitting}
              />
            )}
          </DialogContent>

          <DialogActions
            sx={{
              px: 3,
              py: 2,
              borderTop: `1px solid ${alpha(colors.primary, 0.12)}`,
              backgroundColor: "#f8fafc",
            }}
          >
            <Button
              onClick={() => {
                setBlockDialogOpen(false);
                setEditingBlock(null);
                setBlockForm({ blockType: "", content: {} });
                setFormError(null);
                setFormHasErrors(false);
              }}
              disabled={submitting}
              sx={{
                minWidth: 110,
                minHeight: 46,
                borderRadius: 2.5,
                textTransform: "none",
                color: editorMutedText,
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={editingBlock ? handleUpdateBlock : handleCreateBlock}
              variant="contained"
              disabled={
                submitting ||
                formHasErrors ||
                (!editingBlock && !blockForm.blockType)
              }
              sx={{
                minWidth: 140,
                minHeight: 46,
                borderRadius: 2.5,
                textTransform: "none",
                fontWeight: 700,
                background: "black",
                color: "#ffffff",
                boxShadow: "none",
              }}
            >
              {submitting ? (
                <CircularProgress size={24} />
              ) : editingBlock ? (
                "Update"
              ) : (
                "Add"
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Unsaved changes confirmation dialog */}
        <ConfirmationDialog
          open={showUnsavedDialog}
          variant="warning"
          title="Unsaved Changes"
          message="You have unsaved changes. Would you like to save before leaving?"
          confirmLabel="Leave"
          cancelLabel="Cancel"
          secondaryLabel="Save & Leave"
          onConfirm={confirmNavigation}
          onCancel={cancelNavigation}
          onSecondary={saveAndNavigate}
        />

        {/* Conflict resolution modal */}
        {conflictData && (
          <ConflictModal
            open={!!conflictData}
            conflictData={conflictData}
            onResolve={resolveConflict}
          />
        )}

        {/* Recovery modal — localStorage backup restore/discard (Step 5.10) */}
        <RecoveryModal
          open={hasBackup}
          timestamp={backupEntry?.timestamp ?? 0}
          onRestore={handleRestoreBackup}
          onDiscard={discardBackup}
        />

        {/* Mobile SpeedDial FAB — Step 9.5.2 */}
        {isMobile && (
          <SpeedDial
            ariaLabel="Mobile editor actions"
            sx={{
              position: "fixed",
              bottom: 24,
              right: 24,
              "& .MuiFab-primary": {
                bgcolor: colors.primary,
                "&:hover": { bgcolor: alpha(colors.primary, 0.85) },
              },
            }}
            icon={<SpeedDialIcon />}
          >
            <SpeedDialAction
              icon={<Plus size={20} />}
              tooltipTitle="Add Block"
              onClick={() => setBlockDialogOpen(true)}
              FabProps={{ sx: { minWidth: 48, minHeight: 48 } }}
            />
            <SpeedDialAction
              icon={<Layers size={20} />}
              tooltipTitle="Manage Pages"
              onClick={() => setPagesBottomSheetOpen(true)}
              FabProps={{ sx: { minWidth: 48, minHeight: 48 } }}
            />
          </SpeedDial>
        )}

        {/* Pages BottomSheet — Step 9.5.3 */}
        {isMobile && (
          <BottomSheet
            open={pagesBottomSheetOpen}
            onClose={() => setPagesBottomSheetOpen(false)}
            title="Pages"
            initialSnap={1}
          >
            <Box display="flex" justifyContent="flex-end" mb={1}>
              <IconButton
                size="small"
                onClick={() => {
                  setPagesBottomSheetOpen(false);
                  setPageDialogOpen(true);
                }}
                sx={{ minWidth: 48, minHeight: 48 }}
                aria-label="Add page"
              >
                <Plus size={18} />
              </IconButton>
            </Box>
            <List dense>
              {pages.map((page) => (
                <ListItem
                  key={page.id}
                  button
                  selected={selectedPage?.id === page.id}
                  onClick={() => {
                    setSelectedPage(page);
                    setPagesBottomSheetOpen(false);
                  }}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    minHeight: 48,
                    "&.Mui-selected": {
                      bgcolor: alpha(colors.primary, 0.2),
                    },
                  }}
                >
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        {page.isHome && <House size={16} />}
                        <Typography variant="body2">{page.title}</Typography>
                      </Box>
                    }
                    secondary={page.path}
                  />
                  <ListItemSecondaryAction>
                    {!page.isHome && (
                      <>
                        <IconButton
                          size="small"
                          edge="end"
                          onClick={() => handleSetHomePage(page.id)}
                          title="Set as home"
                          sx={{ minWidth: 48, minHeight: 48 }}
                        >
                          <House size={16} />
                        </IconButton>
                        <IconButton
                          size="small"
                          edge="end"
                          onClick={() => handleDeletePage(page.id)}
                          sx={{ minWidth: 48, minHeight: 48 }}
                        >
                          <Trash2 size={16} />
                        </IconButton>
                      </>
                    )}
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </BottomSheet>
        )}
      </Container>
    </Box>
  );
};

/**
 * Step 4.11: Wrap the editor in PreviewProvider so PreviewPanel and
 * usePreview() work inside WebsiteEditorInner.
 */
const WebsiteEditor = () => (
  <PreviewProvider>
    <WebsiteEditorInner />
  </PreviewProvider>
);

export default WebsiteEditor;
