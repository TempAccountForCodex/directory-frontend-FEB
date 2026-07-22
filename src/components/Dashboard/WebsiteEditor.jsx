// CANONICAL EDITOR: This is the keeper route for website editing (Phase 9 decision).
// Phase 9 UX features are integrated here: BlockLibrary, ThemeManager, PreviewPanel,
// keyboard shortcuts, inline editing, governance UI (ApprovalStatusBanner, SectionLockIndicator).
//
// Block identity: WebsiteEditor uses database IDs exclusively.
//
// Page reorder: Uses pages from API, reordered via PATCH /api/blocks/reorder

import {
  startTransition,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { flushSync } from "react-dom";
import { apiClient } from "../../api/client";
import { normalizeContactFormFields } from "../../api/formSubmissions";
import {
  useParams,
  useNavigate,
  useLocation,
  useSearchParams,
} from "react-router-dom";
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
  Slider,
  Switch,
  TextField,
  FormControlLabel,
  Paper,
  Tooltip,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  useMediaQuery,
  useTheme,
  ClickAwayListener,
  Snackbar,
} from "@mui/material";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  CheckCircle2,
  Clipboard,
  ClipboardPaste,
  Copy,
  Eye,
  House,
  Image as ImageIcon,
  Layers,
  Palette,
  Pencil,
  Plus,
  Redo2,
  RotateCcw,
  Scissors,
  Save,
  Type,
  MousePointerClick,
  SeparatorHorizontal,
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
import {
  getBlockDefaultContent,
  getLocalFieldMetadata,
} from "../Editor/blockPresets";
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
import {
  buildStoredStaticMediaOverrideKey,
  buildStoredStaticStyleOverrideKey,
  getStoredStaticOverridesForPage,
  storeStaticMediaOverride,
  storeStaticStyleOverride,
} from "../../templates/frontendTemplateStaticOverrides";
import {
  markElementHidden,
  markContainerHidden,
} from "../../landingTemplates/utils/hiddenElements";
import {
  getMediaLimitSummary,
  IMAGE_ACCEPT_ATTR,
  validateWebsiteMediaUpload,
  VIDEO_ACCEPT_ATTR,
} from "../../utils/mediaUploadLimits";
import { color } from "framer-motion";
import { EditorAILayer } from "../WebsiteAI";
import {
  getWebsiteEditableSchema,
  generateWebsiteDraft,
  WebsiteAIRequestError,
  normalizeWebsiteAIError,
} from "../../api/websiteAI";
import {
  extractEditableSchemaTargets,
  findEditableSchemaTarget,
  normalizeChatPatches,
  resolveStyleTargetsForSelection,
  toFieldPath,
} from "../WebsiteAI/aiPatchUtils";
import { useWebsiteAIAccess } from "../../hooks/useWebsiteAIAccess";

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

const AI_DRAFT_LONG_RUNNING_DELAY_MS = 8000;

const imageEditorInputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    backgroundColor: "#ffffff",
    color: "#111827",
    boxShadow: "none",

    "& fieldset": {
      borderColor: alpha("#111827", 0.16),
      borderWidth: "1px",
    },

    "&:hover fieldset": {
      borderColor: "#111827",
    },

    "&.Mui-focused": {
      boxShadow: "none",
    },

    "&.Mui-focused fieldset": {
      borderColor: "#111827",
      borderWidth: "1px",
    },
  },

  "& .MuiInputBase-input": {
    color: "#111827 !important",
    WebkitTextFillColor: "#111827 !important",
    caretColor: "#111827",
    fontSize: "14px",

    "&::placeholder": {
      color: alpha("#111827", 0.45),
      opacity: 1,
    },
  },

  "& .MuiInputLabel-root": {
    color: alpha("#111827", 0.65),
  },

  "& .MuiInputLabel-root.Mui-focused": {
    color: "#111827",
  },

  "& .MuiInputLabel-root.MuiInputLabel-shrink": {
    color: alpha("#111827", 0.65),
    backgroundColor: "#ffffff",
    px: 0.4,
  },
};

const blockEditorFormSx = {
  mt: 1.5,
  "--editor-field-bg": "#ffffff",
  "--editor-field-border": alpha("#111827", 0.22),
  "--editor-field-border-strong": alpha("#111827", 0.34),
  "--editor-field-surface": alpha("#f8fafc", 0.92),
  "& form": {
    gap: 2,
  },
  "& form > .MuiBox-root": {
    gap: 1.2,
  },
  "& .MuiTypography-subtitle1": {
    color: "#111827",
    fontSize: "0.88rem",
    fontWeight: 700,
    letterSpacing: "0.01em",
  },
  "& .MuiTypography-subtitle2": {
    color: alpha("#111827", 0.75),
    fontSize: "0.72rem",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  "& .field-wrapper-label": {
    color: "#111827 !important",
    fontSize: "0.78rem",
    fontWeight: 700,
    letterSpacing: "0.01em",
  },
  "& .field-wrapper-help": {
    color: `${alpha("#111827", 0.62)} !important`,
  },
  "& .field-wrapper-error": {
    color: "#dc2626 !important",
  },
  "& .MuiDivider-root": {
    display: "none",
  },
  "& .MuiFormControl-root": {
    mb: 0,
  },
  "& .MuiInputLabel-root": {
    color: alpha("#111827", 0.65),
    fontSize: "0.86rem",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "#111827",
  },
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    backgroundColor: "var(--editor-field-bg)",
    color: "#111827",
    boxShadow: "none",
    "& fieldset": {
      borderColor: "var(--editor-field-border)",
      borderWidth: "1px",
    },
    "&:hover fieldset": {
      borderColor: "var(--editor-field-border-strong)",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#111827",
      borderWidth: "1px",
    },
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "var(--editor-field-border) !important",
  },
  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "var(--editor-field-border-strong) !important",
  },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#111827 !important",
  },
  "& .MuiInputBase-input, & .MuiInputBase-inputMultiline": {
    color: "#111827 !important",
    WebkitTextFillColor: "#111827 !important",
    caretColor: "#111827 !important",
    fontSize: "14px",
  },
  "& .MuiInputBase-root.Mui-focused input, & .MuiInputBase-root.Mui-focused textarea":
    {
      caretColor: "#111827 !important",
    },
  "& .MuiInputBase-input::placeholder, & textarea::placeholder": {
    color: `${alpha("#111827", 0.45)} !important`,
    opacity: "1 !important",
  },
  "& .MuiButton-root": {
    minHeight: 40,
    borderRadius: "12px",
    textTransform: "none",
    boxShadow: "none",
    fontWeight: 700,
  },
  "& .MuiButton-outlinedPrimary, & .MuiButton-outlined": {
    borderColor: alpha("#111827", 0.16),
    color: "#111827",
    backgroundColor: "#ffffff",
  },
  "& .MuiIconButton-root": {
    color: "#6b7280",
  },
  "& .MuiPaper-root": {
    borderRadius: "12px",
    border: `1px solid ${alpha("#111827", 0.18)}`,
    boxShadow: "none",
    backgroundColor: "var(--editor-field-bg)",
  },
  "& .MuiPaper-root .MuiTypography-caption": {
    color: `${alpha("#111827", 0.62)} !important`,
  },
  "& .MuiPaper-root .MuiOutlinedInput-root": {
    backgroundColor: "var(--editor-field-surface)",
  },
  "& .MuiPaper-root .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
    borderColor: "var(--editor-field-border-strong) !important",
  },
  "& textarea": {
    borderRadius: "12px",
  },
};

const DEFAULT_TEXT_STYLE = {
  fontFamily: '"Inter", "Segoe UI", sans-serif',
  fontSize: "16px",
  color: "#111827",
  backgroundColor: "transparent",
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

const FOOTER_DEFAULT_CARD_STYLE = {
  backgroundColor: "#0f1115",
  borderColor: "rgba(255,255,255,0.12)",
  boxShadowPreset: "none",
  layoutWidth: "page",
  paddingTop: "24px",
  paddingBottom: "24px",
  paddingLeft: "24px",
  paddingRight: "24px",
};

// Reusable iOS-style toggle. Shows a filled dark track + white thumb when ON,
// so a `true` value reads clearly. Reuse anywhere a Switch is needed by
// rendering <MediaToggleSwitch checked={...} onChange={...} /> — the styling
// travels with the component.
const MEDIA_TOGGLE_SWITCH_SX = {
  width: 42,
  height: 24,
  padding: 0,
  display: "inline-flex",
  "& .MuiSwitch-switchBase": {
    padding: 0,
    margin: "2px",
    transitionDuration: "250ms",
    "&.Mui-checked": {
      transform: "translateX(18px)",
      color: "#ffffff",
      "& + .MuiSwitch-track": {
        backgroundColor: "#0f172a",
        opacity: 1,
        border: 0,
      },
    },
    "&.Mui-checked.Mui-disabled + .MuiSwitch-track": {
      opacity: 0.5,
    },
  },
  "& .MuiSwitch-thumb": {
    boxSizing: "border-box",
    width: 20,
    height: 20,
    backgroundColor: "#ffffff",
    boxShadow: "0 1px 3px rgba(15,23,42,0.28)",
  },
  "& .MuiSwitch-track": {
    borderRadius: "999px",
    backgroundColor: "#d1d5db",
    opacity: 1,
    transition: "background-color 250ms",
  },
};

const MediaToggleSwitch = ({ sx, ...props }) => (
  <Switch
    disableRipple
    {...props}
    sx={{ ...MEDIA_TOGGLE_SWITCH_SX, ...(sx || {}) }}
  />
);

const DEFAULT_IMAGE_VALUE = {
  src: "",
  objectFit: "cover",
  borderRadius: "0px",
  borderWidth: "0px",
  borderColor: "#e5e7eb",
  heightPreset: "auto",
  customHeight: "",
  // Media type + video support. Existing image blocks have no mediaType, so
  // they default to "image" for backward compatibility.
  mediaType: "image",
  videoUrl: "",
  videoPoster: "",
  videoAutoplay: false,
  videoMuted: true,
  videoLoop: false,
  videoControls: true,
};

const SHARED_HEADER_BLOCK_TYPES = new Set(["NAVBAR", "WEBSITE_HEADER"]);
const SHARED_FOOTER_BLOCK_TYPES = new Set(["FOOTER"]);

const isSharedHeaderBlock = (block) =>
  SHARED_HEADER_BLOCK_TYPES.has(
    String(block?.blockType || block?.type || "")
      .trim()
      .toUpperCase(),
  );

const isSharedFooterBlock = (block) =>
  SHARED_FOOTER_BLOCK_TYPES.has(
    String(block?.blockType || block?.type || "")
      .trim()
      .toUpperCase(),
  );

const getSharedChromeBlocksFromPages = (pagesInput) => {
  const pages = Array.isArray(pagesInput) ? pagesInput : [];
  const homePage =
    pages.find((page) => page?.isHome) ||
    pages.find((page) => page?.path === "/") ||
    pages[0] ||
    null;
  const homeBlocks = Array.isArray(homePage?.blocks) ? homePage.blocks : [];

  return {
    header:
      homeBlocks.find(
        (block) => block?.isVisible !== false && isSharedHeaderBlock(block),
      ) || null,
    footer:
      [...homeBlocks]
        .reverse()
        .find(
          (block) => block?.isVisible !== false && isSharedFooterBlock(block),
        ) || null,
  };
};

const SECTION_INNER_BLOCK_LIBRARY = [
  {
    key: "heading",
    label: "Heading",
    description: "Add a section heading block.",
    icon: Type,
    category: "Text",
  },
  {
    key: "text",
    label: "Paragraph",
    description: "Add a paragraph block inside this section.",
    icon: Type,
    category: "Text",
  },
  {
    key: "eyebrow",
    label: "Label",
    description: "Add a small eyebrow or badge label.",
    icon: Type,
    category: "Text",
  },
  {
    key: "image",
    label: "Image",
    description: "Add an image block inside this section.",
    icon: ImageIcon,
    category: "Media",
  },
  {
    key: "button",
    label: "Button",
    description: "Add a call-to-action button.",
    icon: MousePointerClick,
    category: "Actions",
  },
  {
    key: "divider",
    label: "Line",
    description: "Add a simple divider line.",
    icon: SeparatorHorizontal,
    category: "Layout",
  },
  {
    key: "spacer",
    label: "Spacer",
    description: "Add vertical space between elements.",
    icon: SeparatorHorizontal,
    category: "Layout",
  },
];

const getSectionLibraryIcon = (item) => {
  const key = String(item?.key || "").toLowerCase();
  const category = String(item?.category || "").toLowerCase();

  if (key.includes("image") || category.includes("media")) return ImageIcon;
  if (
    key.includes("button") ||
    key.includes("cta") ||
    category.includes("conversion") ||
    category.includes("action")
  ) {
    return MousePointerClick;
  }
  if (
    key.includes("divider") ||
    key.includes("line") ||
    key.includes("spacer")
  ) {
    return SeparatorHorizontal;
  }
  if (
    key.includes("heading") ||
    key.includes("title") ||
    key.includes("text") ||
    key.includes("label") ||
    key.includes("paragraph") ||
    category.includes("content") ||
    category.includes("text")
  ) {
    return Type;
  }

  return Layers;
};

const getSectionStyleKey = (selection) => selection?.styleKey || "sectionStyle";
const getStaticStyleDraftKey = (selection) =>
  selection?.blockId && selection?.staticId
    ? `${selection.blockId}::${selection.styleKey || "sectionStyle"}::${selection.staticId}`
    : null;
const AI_STATIC_STYLE_FIELD_PREFIX = "__staticStyle|";
const buildAIStaticStyleFieldPath = (selection, property) => {
  if (!selection?.styleKey || !selection?.staticId || !property) return "";
  return `${AI_STATIC_STYLE_FIELD_PREFIX}${encodeURIComponent(
    selection.styleKey,
  )}|${encodeURIComponent(selection.staticId)}|${encodeURIComponent(property)}`;
};
const parseAIStaticStyleFieldPath = (fieldPath = "") => {
  const value = String(fieldPath || "");
  if (!value.startsWith(AI_STATIC_STYLE_FIELD_PREFIX)) return null;
  const [, styleKey, staticId, property] = value.split("|");
  if (!styleKey || !staticId || !property) return null;
  try {
    return {
      styleKey: decodeURIComponent(styleKey),
      staticId: decodeURIComponent(staticId),
      property: decodeURIComponent(property),
    };
  } catch {
    return null;
  }
};
const isAIStaticStyleRevertFieldPath = (fieldPath = "") => {
  const value = String(fieldPath || "");
  return (
    value.startsWith(AI_STATIC_STYLE_FIELD_PREFIX) ||
    value.startsWith("staticStyles.") ||
    value.includes(".content.staticStyles.")
  );
};
const aiTurnHasStaticStylePatch = (turn) => {
  const entries = [
    ...(Array.isArray(turn?.before) ? turn.before : []),
    ...(Array.isArray(turn?.after) ? turn.after : []),
  ];
  return (
    String(turn?.aiEditKey || "").startsWith("blog-static:") ||
    entries.some((entry) =>
      [
        entry?.fieldPath,
        entry?.editorPath,
        entry?.path,
        entry?.aiEditKey,
      ].some((value) => isAIStaticStyleRevertFieldPath(value)),
    )
  );
};
const buildStaticStyleAITargets = (selection) => {
  if (!selection?.blockId || !selection?.styleKey || !selection?.staticId) {
    return [];
  }

  const styleProperties = [
    ["color", "Text color", "color"],
    ["backgroundColor", "Background color", "background"],
    ["fontSize", "Font size", "font"],
    ["fontWeight", "Font weight", "font"],
    ["textAlign", "Text alignment", "alignment"],
    ["textShadow", "Text shadow", "shadow"],
    ["fontStyle", "Font style", "font"],
    ["textDecoration", "Text decoration", "font"],
    ["lineHeight", "Line height", "font"],
    ["letterSpacing", "Letter spacing", "font"],
    ["wordSpacing", "Word spacing", "font"],
    ["textTransform", "Text transform", "font"],
    ["paddingTop", "Top padding", "spacing"],
    ["paddingBottom", "Bottom padding", "spacing"],
    ["paddingLeft", "Left padding", "spacing"],
    ["paddingRight", "Right padding", "spacing"],
    ["marginTop", "Top margin", "spacing"],
    ["marginBottom", "Bottom margin", "spacing"],
    ["marginLeft", "Left margin", "spacing"],
    ["marginRight", "Right margin", "spacing"],
    ["borderColor", "Border color", "border"],
    ["borderRadius", "Border radius", "border"],
    ["borderWidth", "Border width", "border"],
    ["width", "Width", "size"],
    ["height", "Height", "size"],
    ["opacity", "Opacity", "style"],
    ["objectFit", "Object fit", "media"],
  ];

  return styleProperties.map(([property, label, category]) => {
    const fieldPath = buildAIStaticStyleFieldPath(selection, property);
    return {
      blockId: selection.blockId,
      blockType: selection.blockType,
      fieldPath,
      persistedFieldPath: fieldPath,
      label: `${selection.label || "Selected element"} ${label}`,
      category,
      computedStyle: selection.computedStyle,
      staticId: selection.staticId,
      styleKey: selection.styleKey,
      staticType: selection.staticType,
    };
  });
};
const getStaticMediaOverrideKey = (websiteId, pageId, selection) =>
  websiteId != null &&
  pageId != null &&
  selection?.blockId &&
  selection?.staticId
    ? `${String(websiteId)}::${String(pageId)}::${String(selection.blockId)}::${String(selection.staticId)}`
    : null;

const getEditableStyleConfig = (fieldPath) =>
  EDITABLE_STYLE_FIELD_MAP[fieldPath] || {
    styleKey: `${fieldPath}Style`,
    label: fieldPath,
  };

const getEditableTypographyStyleKey = (fieldName = "text") => {
  const normalizedFieldName = String(fieldName || "text").trim();
  const leafFieldName = normalizedFieldName
    .split(".")
    .filter(Boolean)
    .pop()
    ?.toLowerCase();

  switch (leafFieldName) {
    case "title":
    case "heading":
    case "question":
    case "logotext":
      return "headingStyle";
    case "subtitle":
    case "subheading":
    case "description":
    case "body":
    case "answer":
    case "quote":
    case "contactemail":
    case "contactphone":
    case "contactaddress":
    case "email":
    case "phone":
    case "address":
    case "copyright":
      return "bodyStyle";
    case "label":
    case "text":
    case "author":
    case "role":
      return "textStyle";
    case "buttontext":
    case "ctatext":
    case "primaryctatext":
      return "buttonTextStyle";
    default:
      return (
        getEditableStyleConfig(normalizedFieldName).styleKey || "textStyle"
      );
  }
};

const syncAliasedBlockContent = (blockType, content) => {
  if (!content || typeof content !== "object" || Array.isArray(content)) {
    return content;
  }

  const normalizedBlockType = String(blockType || "")
    .trim()
    .toUpperCase();
  const nextContent = { ...content };

  if (normalizedBlockType === "FEATURES") {
    const items = Array.isArray(nextContent.items) ? nextContent.items : null;
    const features = Array.isArray(nextContent.features)
      ? nextContent.features
      : null;

    if (features) {
      nextContent.items = features.map((item) => ({ ...item }));
    } else if (items) {
      nextContent.features = items.map((item) => ({ ...item }));
    }
  }

  if (normalizedBlockType === "GALLERY") {
    const items = Array.isArray(nextContent.items) ? nextContent.items : null;
    const images = Array.isArray(nextContent.images)
      ? nextContent.images
      : null;

    if (items) {
      nextContent.images = items.map((item) => ({
        ...item,
        image: item?.image || item?.url || item?.src || "",
        alt: item?.alt || item?.caption || "",
      }));
    } else if (images) {
      nextContent.items = images.map((item) => ({
        ...item,
        url: item?.url || item?.image || item?.src || "",
        caption: item?.caption || item?.alt || "",
      }));
    }
  }

  if (
    normalizedBlockType === "REVIEWS" ||
    normalizedBlockType === "TESTIMONIALS"
  ) {
    const items = Array.isArray(nextContent.items) ? nextContent.items : null;
    const testimonials = Array.isArray(nextContent.testimonials)
      ? nextContent.testimonials
      : null;

    // TESTIMONIALS owns `testimonials[]` (the Company Pro schema). Once the
    // legacy `items[]` mirror exists, treating it as authoritative overwrites
    // each textarea change on the next state update. REVIEWS keeps the inverse
    // ownership for its legacy schema.
    if (normalizedBlockType === "TESTIMONIALS" && testimonials) {
      nextContent.items = testimonials.map((item) => ({
        ...item,
        text: item?.text ?? item?.quote ?? item?.comment ?? "",
        author: item?.author ?? item?.name ?? "",
        role: item?.role ?? item?.position ?? "",
      }));
    } else if (normalizedBlockType === "REVIEWS" && items) {
      nextContent.testimonials = items.map((item) => ({
        ...item,
        quote: item?.quote ?? item?.text ?? item?.comment ?? "",
        author: item?.author ?? item?.name ?? "",
        position: item?.position ?? item?.role ?? "",
      }));
    } else if (testimonials) {
      nextContent.items = testimonials.map((item) => ({
        ...item,
        text: item?.text ?? item?.quote ?? item?.comment ?? "",
        author: item?.author ?? item?.name ?? "",
        role: item?.role ?? item?.position ?? "",
      }));
    } else if (items) {
      nextContent.testimonials = items.map((item) => ({
        ...item,
        quote: item?.quote ?? item?.text ?? item?.comment ?? "",
        author: item?.author ?? item?.name ?? "",
        position: item?.position ?? item?.role ?? "",
      }));
    }
  }

  return nextContent;
};

const getResolvedEditableStyleKey = (content, fieldPath = "text") => {
  const directStyleKey = getEditableStyleConfig(fieldPath).styleKey;
  const typographyStyleKey = getEditableTypographyStyleKey(fieldPath);
  const styleCandidates = [directStyleKey, typographyStyleKey].filter(
    (styleKey, index, list) =>
      Boolean(styleKey) && list.indexOf(styleKey) === index,
  );

  const existingStyleKey = styleCandidates.find((styleKey) => {
    const value = styleKey.includes(".")
      ? getValueAtPath(content || {}, styleKey)
      : content?.[styleKey];
    return value && typeof value === "object";
  });

  if (existingStyleKey) {
    return existingStyleKey;
  }

  if (
    typeof directStyleKey === "string" &&
    directStyleKey.includes(".") &&
    typeof typographyStyleKey === "string" &&
    !typographyStyleKey.includes(".")
  ) {
    return typographyStyleKey;
  }

  return directStyleKey;
};

const getEditableAIStyleTargetCandidates = (fieldName = "text") => {
  const normalizedFieldName = String(fieldName || "text").trim();
  const leafFieldName =
    normalizedFieldName.split(".").filter(Boolean).pop() || normalizedFieldName;
  const styleConfigKey = getEditableStyleConfig(leafFieldName).styleKey;
  const typographyStyleKey = getEditableTypographyStyleKey(leafFieldName);
  const capitalizedLeaf =
    leafFieldName.charAt(0).toUpperCase() + leafFieldName.slice(1);
  const styleKeys = [
    typographyStyleKey,
    styleConfigKey,
    "headingStyle",
    "titleStyle",
    "subtitleStyle",
    "subheadingStyle",
    "descriptionStyle",
    "bodyStyle",
    "textStyle",
    "buttonTextStyle",
    "ctaTextStyle",
    "primaryCtaTextStyle",
    "buttonStyle",
    "ctaStyle",
    "cardStyle",
    "sectionStyle",
    "backgroundStyle",
  ].filter(Boolean);
  const styleLeaves = [
    "color",
    "fontSize",
    "fontWeight",
    "fontStyle",
    "textShadow",
    "backgroundColor",
    "textAlign",
    "alignment",
    "borderColor",
    "borderWidth",
    "borderStyle",
    "borderRadius",
    "boxShadow",
    "paddingTop",
    "paddingBottom",
    "paddingLeft",
    "paddingRight",
    "marginTop",
    "marginBottom",
    "spacingTop",
    "spacingBottom",
    "opacity",
    "visibility",
  ];
  const nestedStyleCandidates = styleKeys.flatMap((styleKey) => [
    styleKey,
    ...styleLeaves.map((leaf) => `${styleKey}.${leaf}`),
  ]);

  return [
    ...nestedStyleCandidates,
    `${leafFieldName}Color`,
    `${leafFieldName}TextColor`,
    `${leafFieldName}Background`,
    `${leafFieldName}BackgroundColor`,
    `${leafFieldName}Shadow`,
    `${leafFieldName}TextShadow`,
    `${leafFieldName}Border`,
    `${leafFieldName}BorderColor`,
    `${leafFieldName}Radius`,
    `${leafFieldName}Spacing`,
    `${leafFieldName}Padding`,
    `${leafFieldName}Margin`,
    `${leafFieldName}Align`,
    `${leafFieldName}Alignment`,
    `${leafFieldName}FontSize`,
    `${leafFieldName}FontWeight`,
    `${leafFieldName}Style`,
    `${capitalizedLeaf}Color`,
    `${capitalizedLeaf}Style`,
    styleConfigKey,
    typographyStyleKey,
    "headingColor",
    "titleColor",
    "subtitleColor",
    "descriptionColor",
    "textColor",
    "bodyColor",
    "buttonTextColor",
    "ctaTextColor",
    "primaryCtaTextColor",
    "textShadow",
    "boxShadow",
    "buttonStyle",
    "ctaStyle",
    "cardStyle",
    "textStyle",
    "headingStyle",
    "titleStyle",
    "bodyStyle",
    "sectionStyle",
    "backgroundStyle",
    "backgroundColor",
    "textAlign",
    "alignment",
    "spacingTop",
    "spacingBottom",
    "paddingTop",
    "paddingBottom",
  ].filter((value, index, values) => value && values.indexOf(value) === index);
};

const getInnerBlockStyleKey = (innerBlock, fieldName = "text") => {
  if (
    String(fieldName || "").toLowerCase() === "__card" ||
    String(fieldName || "").toLowerCase() === "card"
  ) {
    return "cardStyle";
  }
  const blockType = String(innerBlock?.type || "").toLowerCase();
  if (blockType === "heading") {
    return "headingStyle";
  }
  if (blockType === "button") {
    return "buttonTextStyle";
  }
  if (blockType === "eyebrow") {
    return "textStyle";
  }
  if (blockType === "image") {
    return "imageStyle";
  }
  return getEditableTypographyStyleKey(fieldName);
};

const getDefaultInnerBlockPlacement = (blockKey, index = 0) => {
  const row = Math.floor(index / 2);
  const stackOffset = row * 48;
  const normalizedKey = String(blockKey || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_");
  const centeredCardOffset = 56;

  switch (normalizedKey) {
    case "eyebrow":
    case "label":
      return {
        textStyle: {
          transform: `translate(40px, ${28 + stackOffset}px)`,
        },
      };
    case "heading":
      return {
        headingStyle: {
          transform: `translate(40px, ${78 + stackOffset}px)`,
          maxWidth: "540px",
        },
      };
    case "text":
      return {
        textStyle: {
          transform: `translate(40px, ${170 + stackOffset}px)`,
          maxWidth: "520px",
        },
      };
    case "button":
      return {
        buttonTextStyle: {
          transform: `translate(${40 + row * 152}px, ${250 + stackOffset}px)`,
        },
      };
    case "image":
      return {
        imageStyle: {
          transform: `translate(560px, ${44 + row * 32}px)`,
          width: "320px",
          height: "320px",
        },
      };
    case "divider":
      return {
        textStyle: {
          transform: `translate(40px, ${308 + stackOffset}px)`,
          width: "420px",
        },
      };
    case "spacer":
      return {
        textStyle: {
          transform: `translate(40px, ${308 + stackOffset}px)`,
        },
      };
    case "cta":
    case "call_to_action":
    case "contact":
    case "newsletter":
    case "form_builder":
    case "reservation_form":
    case "faq":
    case "pricing":
    case "countdown":
    case "announcement_bar":
    case "testimonials":
    case "reviews":
    case "stats":
    case "logo_carousel":
    case "hero":
    case "video":
    case "features":
    case "navigation_bar":
    case "footer":
    case "map_location":
    case "menu_display":
    case "image_text_split":
    case "split_text_image":
    case "image_split_text":
    case "generic_card":
    case "section":
    case "plan_section":
      return {
        cardStyle: {
          transform: `translate(${centeredCardOffset}px, ${24 + row * 40}px)`,
          width: "100%",
        },
      };
    default:
      return {};
  }
};

const normalizeInnerBlockLibraryKey = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_");

const buildInnerBlockFromLibraryItem = (item) => {
  const normalizedKey = normalizeInnerBlockLibraryKey(item?.key || item?.label);
  const label = item?.label || humanizeLabel(normalizedKey);
  const description =
    item?.description ||
    `Add a ${label.toLowerCase()} block inside this section.`;

  switch (normalizedKey) {
    case "heading":
      return {
        type: "heading",
        label: "Heading",
        content: { text: "New section heading" },
      };
    case "text":
    case "paragraph":
      return {
        type: "text",
        label: "Paragraph",
        content: { text: "Add your text here." },
      };
    case "eyebrow":
    case "label":
      return {
        type: "eyebrow",
        label: "Label",
        content: { text: "Section label" },
      };
    case "image":
      return {
        type: "image",
        label: "Image",
        content: {
          src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
          alt: "Section image",
        },
      };
    case "button":
      return {
        type: "button",
        label: "Button",
        content: {
          text: "Button",
          href: "#",
        },
      };
    case "divider":
    case "line":
      return {
        type: "divider",
        label: "Line",
        content: {},
      };
    case "spacer":
      return {
        type: "spacer",
        label: "Spacer",
        content: {
          height: "24px",
        },
      };
    case "hero":
      return {
        type: "hero",
        label,
        content: {
          eyebrow: "Hero section",
          heading: "Large headline for this section",
          body: description,
          buttonText: "Get started",
          image:
            "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
        },
      };
    case "features":
      return {
        type: "features",
        label,
        content: {
          heading: "Core features",
          body: description,
          items: [
            {
              title: "Fast setup",
              description: "Launch quickly with reusable layouts.",
            },
            {
              title: "Flexible content",
              description: "Mix text, images, and calls to action.",
            },
            {
              title: "Easy editing",
              description: "Update content directly inside the editor.",
            },
          ],
        },
      };
    case "navigation_bar":
      return {
        type: "navigation_bar",
        label,
        content: {
          logoText: "Your Brand",
          links: ["Overview", "Services", "Contact"],
          buttonText: "Talk to us",
        },
      };
    case "footer":
      return {
        type: "footer",
        label,
        content: {
          logoText: "LOGO",
          description:
            "A modern business footer with direct contact details, useful navigation, and a simple subscribe form.",
          links: [
            { label: "Privacy policy", url: "/privacy-policy" },
            { label: "Terms & condition", url: "/terms-and-condition" },
            { label: "Cookie Policy", url: "/cookie-policy" },
          ],
          contactEmail: "hello@yourcompany.com",
          contactPhone: "+1 (555) 123-4567",
          contactAddress: "123 Business Avenue, New York, NY 10001",
          socialLinks: [
            { platform: "linkedin", url: "https://linkedin.com" },
            { platform: "instagram", url: "https://instagram.com" },
            { platform: "facebook", url: "https://facebook.com" },
          ],
          placeholder: "Enter your email",
          buttonText: "Subscribe",
          copyright: "(c) 2026 Your company. All rights reserved.",
          cardStyle: {
            backgroundColor: "#0f1115",
            borderColor: "rgba(255,255,255,0.12)",
            boxShadowPreset: "none",
            layoutWidth: "page",
            paddingTop: "24px",
            paddingBottom: "24px",
            paddingLeft: "24px",
            paddingRight: "24px",
          },
        },
      };
    case "cta":
    case "call_to_action":
      return {
        type: "cta",
        label,
        content: {
          heading: "Ready to launch your next idea?",
          body: "Use this CTA block to drive the visitor toward a clear action.",
          buttonText: "Get started",
        },
      };
    case "contact":
      return {
        type: "contact",
        label,
        content: {
          heading: "Get in touch",
          body: "Share contact details or use the built-in inquiry form.",
          email: "hello@yourcompany.com",
          phone: "+1 (555) 123-4567",
          address: "123 Business Avenue, New York, NY 10001",
          formTitle: "Send a message",
          buttonText: "Contact us",
          fullNamePlaceholder: "Full name",
          emailPlaceholder: "Email address",
          messagePlaceholder: "Message",
          fields: [
            { label: "Full name" },
            { label: "Email address" },
            { label: "Message" },
          ],
        },
      };
    case "pricing":
      return {
        type: "pricing",
        label,
        content: {
          heading: "Simple pricing",
          body: "Choose a plan that fits your business stage.",
          plans: [
            {
              name: "Starter",
              price: "$29",
              features: ["1 project", "Email support"],
            },
            {
              name: "Growth",
              price: "$79",
              features: ["5 projects", "Priority support"],
            },
          ],
        },
      };
    case "faq":
      return {
        type: "faq",
        label,
        content: {
          heading: "Frequently asked questions",
          items: [
            {
              question: "How quickly can we launch?",
              answer:
                "Most teams can publish an initial version within a few days.",
            },
            {
              question: "Can we update content later?",
              answer: "Yes, every section remains editable inside the builder.",
            },
            {
              question: "Do I need technical experience?",
              answer:
                "No, the editor is designed for content updates without code.",
            },
          ],
        },
      };
    case "form_builder":
    case "reservation_form":
      return {
        type: normalizedKey,
        label,
        content: {
          heading:
            normalizedKey === "reservation_form"
              ? "Book a reservation"
              : "Submit your details",
          body: description,
          buttonText:
            normalizedKey === "reservation_form" ? "Reserve now" : "Submit",
          fields:
            normalizedKey === "reservation_form"
              ? ["Name", "Email", "Date", "Guests"]
              : ["Name", "Email", "Message"],
        },
      };
    case "countdown":
      return {
        type: "countdown",
        label,
        content: {
          heading: "Launch countdown",
          body: "Build urgency for your upcoming launch or event.",
          days: "12",
          hours: "08",
          minutes: "44",
        },
      };
    case "announcement_bar":
      return {
        type: "announcement_bar",
        label,
        content: {
          text: "Special announcement for this section.",
          buttonText: "Learn more",
          cardStyle: {
            backgroundColor: "#050505",
            backgroundImageUrl: "",
            borderStyle: "none",
            boxShadowPreset: "none",
            paddingTop: "0px",
            paddingBottom: "0px",
            paddingLeft: "0px",
            paddingRight: "0px",
          },
        },
      };
    case "newsletter":
      return {
        type: "newsletter",
        label,
        content: {
          heading: "Join the newsletter",
          body: "Capture email signups directly inside this section.",
          placeholder: "Enter your email",
          buttonText: "Subscribe",
        },
      };
    case "testimonials":
    case "reviews":
      return {
        type: normalizedKey,
        label,
        content: {
          heading:
            normalizedKey === "reviews"
              ? "Customer reviews"
              : "What clients say",
          quote:
            "Working with this team made the launch feel simple and polished.",
          author: "Ayesha Khan",
          role: "Marketing Lead",
        },
      };
    case "stats":
      return {
        type: "stats",
        label,
        content: {
          heading: "Key numbers",
          items: [
            { value: "120+", label: "Projects" },
            { value: "98%", label: "Satisfaction" },
            { value: "24/7", label: "Support" },
          ],
        },
      };
    case "gallery":
      return {
        type: "gallery",
        label,
        content: {
          heading: "Gallery",
          images: [
            {
              image:
                "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
              alt: "Gallery image 1",
            },
            {
              image:
                "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
              alt: "Gallery image 2",
            },
            {
              image:
                "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80",
              alt: "Gallery image 3",
            },
            {
              image:
                "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
              alt: "Gallery image 4",
            },
            {
              image:
                "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
              alt: "Gallery image 5",
            },
          ],
        },
      };
    case "team":
      return {
        type: "team",
        label,
        content: {
          heading: "Meet our expert team",
          members: [
            {
              avatar: "/assets/publicAssets/images/home/avatar1.webp",
              name: "Ayesha Khan",
              role: "Creative Director",
            },
            {
              avatar: "/assets/publicAssets/images/home/avatar2.webp",
              name: "Bilal Ahmed",
              role: "Technical Lead",
            },
            {
              avatar: "/assets/publicAssets/images/home/avatar3.webp",
              name: "Hina Malik",
              role: "Brand Strategist",
            },
          ],
        },
      };
    case "logo_carousel":
      return {
        type: "logo_carousel",
        label,
        content: {
          heading: "Trusted by modern teams",
          items: [
            {
              name: "Ebay",
              image:
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='48' viewBox='0 0 150 48'%3E%3Ctext x='50%25' y='58%25' text-anchor='middle' fill='white' font-size='28' font-family='Arial' font-weight='800'%3Eebay%3C/text%3E%3C/svg%3E",
            },
            {
              name: "OpenAI",
              image:
                "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/OpenAI_Logo.svg/3840px-OpenAI_Logo.svg.png",
            },
            {
              name: "Shopify",
              image:
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='48' viewBox='0 0 180 48'%3E%3Ctext x='50%25' y='58%25' text-anchor='middle' fill='white' font-size='27' font-family='Arial' font-weight='800'%3EShopify%3C/text%3E%3C/svg%3E",
            },
            {
              name: "Meta",
              image:
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='48' viewBox='0 0 150 48'%3E%3Ctext x='50%25' y='58%25' text-anchor='middle' fill='white' font-size='28' font-family='Arial' font-weight='800'%3EMeta%3C/text%3E%3C/svg%3E",
            },
          ],
        },
      };
    case "map_location":
      return {
        type: "map_location",
        label,
        content: {
          heading: "Our locations",
          body: "Display your offices or service regions.",
          locations: ["Karachi", "Dubai", "London"],
        },
      };
    case "menu_display":
      return {
        type: "menu_display",
        label,
        content: {
          heading: "Services & pricing",
          items: [
            { name: "Consultation", price: "$120" },
            { name: "Implementation", price: "$420" },
            { name: "Support", price: "$90" },
          ],
        },
      };
    case "image_text_split":
    case "split_text_image":
    case "image_split_text":
      return {
        type: "image_text_split",
        label,
        content: {
          heading: "Image and text split",
          body: description,
          buttonText: "Explore more",
          image:
            "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
        },
      };
    case "video":
      return {
        type: "video",
        label,
        content: {
          videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
          showControls: true,
          muted: true,
          width: 94,
          mobileWidth: 100,
          heightPreset: "auto",
          objectFit: "contain",
        },
      };
    case "marquee":
      return {
        type: "marquee",
        label,
        content: {
          text: "We make things that work better and last longer.",
        },
      };
    case "tabs":
      return {
        type: "tabs",
        label,
        content: {
          heading: "Explore the details",
          tabs: [
            {
              label: "Strategy",
              content: "Clarify the message, offer, and conversion goal.",
              icon: "analytics",
            },
            {
              label: "Design",
              content: "Use a stronger visual layout instead of plain text.",
              icon: "palette",
            },
            {
              label: "Launch",
              content: "Ship a section that is already presentation-ready.",
              icon: "rocket",
            },
          ],
        },
      };

    case "social_embed":
      return {
        type: "social_embed",
        label,
        content: {
          heading: "Social proof",
          embeds: [
            {
              platform: "youtube",
              url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
              caption: "Replace this sample embed from the editor.",
            },
          ],
        },
      };
    case "embed":
      return {
        type: "embed",
        label,
        content: {
          heading: "Embedded content",
          url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        },
      };
    case "website_header":
      return {
        type: "website_header",
        label,
        content: {
          logoType: "text",
          logoText: "Brand",
          logoImage: "",
          menuId: "",
          ctaText: "Get Started",
          ctaUrl: "#contact",
          sticky: true,
          transparent: false,
        },
      };
    case "before_after":
      return {
        type: "before_after",
        label,
        content: {
          beforeImage:
            "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=1200&q=80",
          afterImage:
            "https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=1200&q=80",
          beforeLabel: "Before",
          afterLabel: "After",
        },
      };
    default:
      return {
        type: "generic_card",
        label,
        content: {
          heading: label,
          body: description,
          buttonText: "Learn more",
        },
      };
  }
};

const humanizeLabel = (value = "") =>
  String(value)
    .split(".")
    .slice(-1)[0]
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const deepClone = (value) =>
  value == null ? value : JSON.parse(JSON.stringify(value));

const parseInnerBlockFieldPath = (fieldPath = "") => {
  const match = /^innerBlocks\.(\d+)\.content(?:\.([^.]+(?:\..+)*)?)?$/i.exec(
    String(fieldPath),
  );
  if (!match) {
    return null;
  }

  return {
    index: Number(match[1]),
    contentPath: match[2] || "",
  };
};

const setValueAtPath = (source, path, value) => {
  if (!path) return source;
  const keys = String(path).split(".").filter(Boolean);
  if (!keys.length) return source;

  const root = Array.isArray(source) ? [...source] : { ...(source || {}) };
  let cursor = root;

  keys.forEach((key, index) => {
    const isLast = index === keys.length - 1;
    const nextKey = keys[index + 1];
    const normalizedKey = /^\d+$/.test(key) ? Number(key) : key;

    if (isLast) {
      cursor[normalizedKey] = value;
      return;
    }

    const existing = cursor[normalizedKey];
    const nextContainer =
      existing != null
        ? Array.isArray(existing)
          ? [...existing]
          : { ...existing }
        : /^\d+$/.test(nextKey)
          ? []
          : {};

    cursor[normalizedKey] = nextContainer;
    cursor = nextContainer;
  });

  return root;
};

const getBlockInnerBlocks = (block) => {
  if (Array.isArray(block?.content?.innerBlocks)) {
    return block.content.innerBlocks;
  }
  if (Array.isArray(block?.innerBlocks)) {
    return block.innerBlocks;
  }
  return [];
};

const withSyncedBlockContent = (block, nextContent) => {
  const syncedContent = syncAliasedBlockContent(
    block?.content?.editorBlockType || block?.blockType || "",
    nextContent,
  );

  return {
    ...block,
    content: syncedContent,
    ...(Array.isArray(syncedContent?.innerBlocks)
      ? { innerBlocks: syncedContent.innerBlocks }
      : {}),
  };
};

const withSyncedInnerBlocks = (block, innerBlocks) =>
  withSyncedBlockContent(block, {
    ...(block.content || {}),
    innerBlocks,
  });

const isMergeableEditorContentObject = (value) =>
  !!value && typeof value === "object" && !Array.isArray(value);

const mergeEditorContentObjects = (...sources) =>
  sources.reduce((accumulator, source) => {
    if (!isMergeableEditorContentObject(source)) {
      return accumulator;
    }

    Object.entries(source).forEach(([key, value]) => {
      const existingValue = accumulator[key];
      accumulator[key] =
        isMergeableEditorContentObject(existingValue) &&
        isMergeableEditorContentObject(value)
          ? {
              ...existingValue,
              ...value,
            }
          : value;
    });

    return accumulator;
  }, {});

const getEditorBlockContentFieldNames = (editorBlockType) => {
  const metadata = getLocalFieldMetadata(editorBlockType || "");
  if (!metadata?.groups?.length) {
    return new Set();
  }

  return new Set(
    metadata.groups.flatMap((group) =>
      Array.isArray(group.fields)
        ? group.fields
            .map((field) => String(field?.name || "").trim())
            .filter(Boolean)
        : [],
    ),
  );
};

const omitEditorWrapperKeys = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const {
    editorBlockType,
    editorLabel,
    sectionStyle,
    outerSectionStyle,
    cardStyle,
    innerBlocks,
    ...rest
  } = value;

  return rest;
};

const normalizeContactEditorContent = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return value;
  }

  const normalized = { ...value };
  normalized.formFields = normalizeContactFormFields(
    normalized.formFields,
    normalized,
  ).map((field) => ({
    _id: field.key,
    label: field.label,
    placeholder: field.placeholder,
    fieldType: field.fieldType,
    required: field.required,
    options: field.options.join(", "),
  }));
  const email = normalized.email ?? normalized.contactEmail;
  const phone = normalized.phone ?? normalized.contactPhone;
  const address = normalized.address ?? normalized.contactAddress;

  if (email !== undefined) {
    normalized.email = email;
  }
  if (phone !== undefined) {
    normalized.phone = phone;
  }
  if (address !== undefined) {
    normalized.address = address;
  }

  return normalized;
};

const buildBlockEditorInitialContent = (block) => {
  const rootContent = omitInnerBlocksMirror(block?.content || {});
  const rootBlockType = String(block?.blockType || "")
    .trim()
    .toUpperCase();
  if (!block?.content?.editorBlockType) {
    return rootBlockType === "CONTACT"
      ? normalizeContactEditorContent(
          mergeEditorContentObjects(
            getBlockDefaultContent("CONTACT"),
            rootContent,
          ),
        )
      : rootContent;
  }

  const firstInnerContent = getBlockInnerBlocks(block)[0]?.content;
  const editorBlockType = String(block?.content?.editorBlockType || "").trim();
  const defaultEditorContent = editorBlockType
    ? omitInnerBlocksMirror(getBlockDefaultContent(editorBlockType))
    : {};
  const mergedContent = mergeEditorContentObjects(
    defaultEditorContent,
    firstInnerContent && typeof firstInnerContent === "object"
      ? omitInnerBlocksMirror(firstInnerContent)
      : {},
    rootContent,
    {
      editorLabel: block?.content?.editorLabel ?? rootContent.editorLabel ?? "",
    },
  );

  return editorBlockType.toUpperCase() === "CONTACT"
    ? normalizeContactEditorContent(mergedContent)
    : mergedContent;
};

const getValueAtPath = (source, path) => {
  if (!path) return source;
  return String(path)
    .split(".")
    .filter(Boolean)
    .reduce((cursor, key) => {
      if (cursor == null) {
        return undefined;
      }
      return cursor[/^\d+$/.test(key) ? Number(key) : key];
    }, source);
};

// Remove a repeated array item that a field path points into (e.g. a feature
// card / process step / gallery item). For "items.1.title" this drops items[1]
// entirely — so "Delete" removes the whole element from the layout instead of
// just blanking its text. Returns the updated content, or null when the path
// is not an array item (caller then falls back to clearing the field).
const removeArrayItemAtFieldPath = (content, fieldPath) => {
  if (!fieldPath || typeof fieldPath !== "string") return null;
  const segments = fieldPath.split(".").filter(Boolean);
  let indexPos = -1;
  for (let i = segments.length - 1; i >= 0; i -= 1) {
    if (/^\d+$/.test(segments[i])) {
      indexPos = i;
      break;
    }
  }
  if (indexPos === -1) return null;

  const arrayPath = segments.slice(0, indexPos).join(".");
  const itemIndex = Number(segments[indexPos]);
  const array = arrayPath ? getValueAtPath(content || {}, arrayPath) : content;
  if (!Array.isArray(array) || itemIndex < 0 || itemIndex >= array.length) {
    return null;
  }

  const nextArray = array.filter((_, i) => i !== itemIndex);
  return arrayPath
    ? setValueAtPath({ ...(content || {}) }, arrayPath, nextArray)
    : nextArray;
};

const looksLikeImageSource = (value = "") =>
  /^(https?:\/\/|\/)/i.test(value) ||
  /^data:image\//i.test(value) ||
  /\.(png|jpe?g|webp|gif|svg|avif)(\?.*)?$/i.test(value);

const looksLikeVideoSource = (value = "") =>
  /^(https?:\/\/|\/)/i.test(value) &&
  /\.(mp4|webm|mov|ogg|m4v)(\?.*)?$/i.test(value);

const normalizeUploadedImageUrl = (value) => {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const trimmed = value.trim();
  if (/^data:image\//i.test(trimmed)) {
    return trimmed;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      if (/^\/uploads\//i.test(parsed.pathname)) {
        return `${window.location.origin}${parsed.pathname}${parsed.search || ""}`;
      }
    } catch {
      return trimmed;
    }

    return trimmed;
  }

  if (trimmed.startsWith("/")) {
    return `${window.location.origin}${trimmed}`;
  }

  if (/^uploads\//i.test(trimmed)) {
    return `${window.location.origin}/${trimmed}`;
  }

  return trimmed;
};

// REMOVED: BLOCK_TYPES hardcoded allowlist. Block selection now exclusively
// uses BlockLibrary (fetches from /api/content-types/blocks with all 34 types).

const MAX_CTA_TEXT_LENGTH = 24;
const SAVE_ENUM_FIELDS = {
  VIDEO: {
    aspectRatio: { values: ["16:9", "4:3", "1:1"], fallback: "16:9" },
  },
  FEATURES: {
    variant: {
      values: ["default", "4-column", "stacked", "badges"],
      fallback: "default",
    },
    badgeSpacing: { values: ["compact", "normal", "wide"], fallback: "normal" },
  },
  IMAGE_TEXT_SPLIT: {
    imagePosition: { values: ["left", "right"], fallback: "left" },
  },
  TABS: {
    variant: {
      values: ["standard", "outlined", "pills"],
      fallback: "standard",
    },
  },
  NAVBAR: {
    logoType: { values: ["text", "image"], fallback: "text" },
  },
  WEBSITE_HEADER: {
    logoType: { values: ["text", "image"], fallback: "text" },
  },
};

const SAVE_REPEATER_ENUM_FIELDS = {
  FOOTER: {
    socialLinks: {
      platform: {
        values: [
          "linkedin",
          "instagram",
          "facebook",
          "twitter",
          "youtube",
          "tiktok",
          "website",
        ],
        fallback: "website",
      },
    },
  },
  SOCIAL_EMBED: {
    embeds: {
      platform: {
        values: ["youtube", "instagram", "facebook", "tiktok"],
        fallback: "youtube",
      },
    },
  },
};

const truncateText = (value, maxLength) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (trimmed.length <= maxLength) return trimmed;

  const sliced = trimmed.slice(0, maxLength).trimEnd();
  const lastSpace = sliced.lastIndexOf(" ");
  if (lastSpace >= Math.floor(maxLength * 0.55)) {
    return sliced.slice(0, lastSpace);
  }

  return sliced;
};

const truncateContentFields = (content, fieldNames, maxLength) => {
  fieldNames.forEach((fieldName) => {
    if (content[fieldName] != null) {
      content[fieldName] = truncateText(content[fieldName], maxLength);
    }
  });
};

const normalizeEnumField = (content, fieldName, config) => {
  if (content[fieldName] == null) return;
  const value = String(content[fieldName]).trim();
  content[fieldName] = config.values.includes(value) ? value : config.fallback;
};

const normalizeEnumFieldsForSave = (blockType, content) => {
  const configByField = SAVE_ENUM_FIELDS[blockType];
  if (configByField) {
    Object.entries(configByField).forEach(([fieldName, config]) => {
      normalizeEnumField(content, fieldName, config);
    });
  }

  const repeaterConfig = SAVE_REPEATER_ENUM_FIELDS[blockType];
  if (!repeaterConfig) return;
  Object.entries(repeaterConfig).forEach(([arrayField, fieldConfig]) => {
    if (!Array.isArray(content[arrayField])) return;
    content[arrayField] = content[arrayField].map((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return item;
      }
      const nextItem = { ...item };
      Object.entries(fieldConfig).forEach(([fieldName, config]) => {
        normalizeEnumField(nextItem, fieldName, config);
      });
      return nextItem;
    });
  });
};

const clampNumberField = (content, fieldName, min, max, fallback) => {
  if (content[fieldName] == null) return;
  const parsed = Number(content[fieldName]);
  content[fieldName] = Number.isFinite(parsed)
    ? Math.min(max, Math.max(min, Math.round(parsed)))
    : fallback;
};

const normalizeNumberFieldsForSave = (blockType, content) => {
  if (blockType !== "COUNTDOWN") return;
  clampNumberField(content, "days", 0, 3650, 0);
  clampNumberField(content, "hours", 0, 23, 0);
  clampNumberField(content, "minutes", 0, 59, 0);
};

const omitInnerBlocksMirror = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return value;
  }

  const { innerBlocks, ...rest } = value;
  return rest;
};

const normalizeContainerBackgroundType = (style = {}) => {
  const rawType = String(style.backgroundType || "")
    .trim()
    .toLowerCase();
  if (["color", "image", "video", "animated", "none"].includes(rawType)) {
    return rawType;
  }
  if (["solid", "gradient", "pattern"].includes(rawType)) return "color";
  if (style.backgroundVideoUrl || style.backgroundVideo) return "video";
  if (style.backgroundImageUrl || style.backgroundImage) return "image";
  if (style.backgroundAnimatedPreset || style.animatedBackground)
    return "animated";
  if (style.backgroundColor) return "color";
  return "none";
};

const normalizeContainerStylesForSave = (containerStyles) => {
  if (
    !containerStyles ||
    typeof containerStyles !== "object" ||
    Array.isArray(containerStyles)
  ) {
    return containerStyles;
  }
  return Object.fromEntries(
    Object.entries(containerStyles).map(([containerId, style]) => {
      if (!style || typeof style !== "object" || Array.isArray(style)) {
        return [containerId, style];
      }
      const stableId = String(containerId).replace(
        /^(?:fallback-)+/,
        "fallback-",
      );
      return [
        stableId,
        {
          ...style,
          backgroundType: normalizeContainerBackgroundType(style),
        },
      ];
    }),
  );
};

// The backend block-type enum has no BLOG_HERO/BLOG_FEATURED/BLOG_GRID, so the
// split blog-page sections round-trip as BLOG_FEED + a `_subType` discriminator
// (same pattern as WEBSITE_HEADER ↔ NAVBAR).
const BLOG_SECTION_TYPE_TO_SUBTYPE = {
  BLOG_HERO: "blog_hero",
  BLOG_FEATURED: "blog_featured",
  BLOG_GRID: "blog_grid",
};
const BLOG_SECTION_SUBTYPE_TO_TYPE = {
  blog_hero: "BLOG_HERO",
  blog_featured: "BLOG_FEATURED",
  blog_grid: "BLOG_GRID",
};
const BLOG_STATIC_STYLE_BLOCK_TYPES = new Set([
  "BLOG_HERO",
  "BLOG_FEATURED",
  "BLOG_GRID",
  "BLOG_ARTICLE",
]);
const BLOG_HERO_EDITABLE_CONTENT_PATHS = new Set([
  "eyebrow",
  "heading",
  "headingAccent",
  "description",
]);
const BLOG_HERO_STATIC_ID_TO_CONTENT_PATH = {
  "blog-hero-eyebrow": "eyebrow",
  "blog-hero-heading": "heading",
  "blog-hero-heading-accent": "headingAccent",
  "blog-hero-description": "description",
};

const getBlogRenderBlockType = (block) => {
  const blockType = String(block?.blockType || "").toUpperCase();
  if (blockType === "BLOG_FEED" && block?.content?._subType) {
    return (
      BLOG_SECTION_SUBTYPE_TO_TYPE[
        String(block.content._subType).toLowerCase()
      ] || blockType
    );
  }
  return blockType;
};

const isBlogStaticStyleBlock = (block) =>
  BLOG_STATIC_STYLE_BLOCK_TYPES.has(getBlogRenderBlockType(block));
const getBlogHeroStaticContentPath = (selection) =>
  selection?.contentPath ||
  BLOG_HERO_STATIC_ID_TO_CONTENT_PATH[String(selection?.staticId || "")];
const isBlogHeroContentStaticElement = (selection) => {
  const isBlogHeroBlock =
    getBlogRenderBlockType({
      blockType: selection?.blockType,
      content: { _subType: selection?._subType },
    }) === "BLOG_HERO" ||
    String(selection?.staticId || "").startsWith("blog-hero-");
  return (
    isBlogHeroBlock &&
    selection?.staticType === "text" &&
    BLOG_HERO_EDITABLE_CONTENT_PATHS.has(getBlogHeroStaticContentPath(selection))
  );
};

const sanitizeBlockContentForSave = (blockType, content) => {
  const rawBlockType = String(blockType || "").toUpperCase();
  const sanitizedContent = syncAliasedBlockContent(rawBlockType, {
    ...omitInnerBlocksMirror(content || {}),
  });

  if (sanitizedContent.containerStyles) {
    sanitizedContent.containerStyles = normalizeContainerStylesForSave(
      sanitizedContent.containerStyles,
    );
  }
  if (sanitizedContent.staticStyles) {
    sanitizedContent.staticStyles = normalizeContainerStylesForSave(
      sanitizedContent.staticStyles,
    );
  }

  if (rawBlockType === "CONTACT") {
    Object.assign(
      sanitizedContent,
      normalizeContactEditorContent(sanitizedContent),
    );
  }

  if (rawBlockType === "TEAM" && Array.isArray(sanitizedContent.members)) {
    sanitizedContent.members = sanitizedContent.members.map(
      (member, index) => ({
        ...member,
        name: member?.name || `Team member ${index + 1}`,
        role: member?.role || "Team member",
      }),
    );
  }

  if (rawBlockType === "CTA" || rawBlockType === "HERO") {
    truncateContentFields(
      sanitizedContent,
      ["ctaText", "primaryCtaText", "secondaryCtaText"],
      MAX_CTA_TEXT_LENGTH,
    );
  }

  normalizeEnumFieldsForSave(rawBlockType, sanitizedContent);
  normalizeNumberFieldsForSave(rawBlockType, sanitizedContent);

  return sanitizedContent;
};

const sanitizeNestedInnerBlocksForSave = (innerBlocks) => {
  if (!Array.isArray(innerBlocks)) {
    return [];
  }

  return innerBlocks.map((innerBlock) => {
    const rawBlockType = String(innerBlock?.blockType || "").toUpperCase();
    const sourceContent = innerBlock?.content || {};
    const content = sanitizeBlockContentForSave(rawBlockType, sourceContent);
    const nestedInnerBlocks = Array.isArray(sourceContent.innerBlocks)
      ? sanitizeNestedInnerBlocksForSave(sourceContent.innerBlocks)
      : undefined;

    return {
      ...innerBlock,
      content: {
        ...content,
        ...(nestedInnerBlocks ? { innerBlocks: nestedInnerBlocks } : {}),
      },
    };
  });
};

const hasValidGalleryImages = (block) => {
  if (String(block?.blockType || "").toUpperCase() !== "GALLERY") return true;
  const images = block.content?.images;
  return (
    Array.isArray(images) &&
    images.some((img) => img?.image || img?.src || img?.url)
  );
};

const sanitizeBlockForSave = (block) => {
  if (!block?.content || typeof block.content !== "object") {
    return block;
  }

  const rawBlockType = String(block.blockType || "").toUpperCase();
  const sanitizedContent = sanitizeBlockContentForSave(
    rawBlockType,
    block.content,
  );

  const templateSectionByBlockType = {
    ABOUT: "about",
    PROCESS: "process",
    PLAN: "plan",
    HEADER: "navbar",
    FOOTER_SECTION: "footer",
    WHY_US: "why-us",
  };

  if (templateSectionByBlockType[rawBlockType]) {
    sanitizedContent.editorSection =
      sanitizedContent.editorSection ||
      templateSectionByBlockType[rawBlockType];
    sanitizedContent.editorBlockType =
      sanitizedContent.editorBlockType || rawBlockType;
  }

  if (Array.isArray(block.content.innerBlocks)) {
    sanitizedContent.innerBlocks = sanitizeNestedInnerBlocksForSave(
      block.content.innerBlocks,
    );
  }

  // Map WEBSITE_HEADER → NAVBAR for backend (backend doesn't accept WEBSITE_HEADER yet)
  if (rawBlockType === "WEBSITE_HEADER") {
    return {
      ...block,
      blockType: "NAVBAR",
      content: { ...sanitizedContent, _subType: "website_header" },
    };
  }

  // The split blog-page sections aren't in the backend block-type enum, so
  // persist them as BLOG_FEED + a `_subType` discriminator (remapped on load).
  if (BLOG_SECTION_TYPE_TO_SUBTYPE[rawBlockType]) {
    return {
      ...block,
      blockType: "BLOG_FEED",
      content: {
        ...sanitizedContent,
        _subType: BLOG_SECTION_TYPE_TO_SUBTYPE[rawBlockType],
      },
    };
  }

  if (rawBlockType === "GALLERY") {
    sanitizedContent.images = Array.isArray(sanitizedContent.images)
      ? sanitizedContent.images.map((item) => ({
          ...item,
          image: item?.image || item?.src || item?.url || "",
        }))
      : [];
  }

  if (templateSectionByBlockType[rawBlockType]) {
    return {
      ...block,
      blockType: "SECTION",
      content: sanitizedContent,
    };
  }

  return {
    ...block,
    content: sanitizedContent,
  };
};

// Remap NAVBAR → WEBSITE_HEADER when content._subType identifies it as such
const normalizeLoadedBlock = (block) => {
  const rawBlockType = String(block?.blockType || "").toUpperCase();
  const editorBlockType = String(
    block?.content?.editorBlockType || "",
  ).toUpperCase();

  if (rawBlockType === "CONTACT") {
    return {
      ...block,
      content: syncAliasedBlockContent(
        rawBlockType,
        normalizeContactEditorContent(block?.content || {}),
      ),
    };
  }

  if (
    editorBlockType === "CONTACT" &&
    block?.content &&
    !Array.isArray(block.content)
  ) {
    const normalizedContent = normalizeContactEditorContent(block.content);
    const innerBlocks = Array.isArray(block.content.innerBlocks)
      ? block.content.innerBlocks
      : [];

    if (innerBlocks[0]) {
      normalizedContent.innerBlocks = [
        {
          ...innerBlocks[0],
          content: normalizeContactEditorContent({
            ...(innerBlocks[0]?.content || {}),
            formFields: normalizedContent.formFields,
          }),
        },
        ...innerBlocks.slice(1),
      ];
    }

    return {
      ...block,
      content: normalizedContent,
    };
  }

  if (
    rawBlockType === "NAVBAR" &&
    block?.content?._subType === "website_header"
  ) {
    return { ...block, blockType: "WEBSITE_HEADER" };
  }
  if (rawBlockType === "BLOG_FEED" && block?.content?._subType) {
    const mappedType =
      BLOG_SECTION_SUBTYPE_TO_TYPE[
        String(block.content._subType).toLowerCase()
      ];
    if (mappedType) {
      return { ...block, blockType: mappedType };
    }
  }
  if (block?.content && !Array.isArray(block.content)) {
    return {
      ...block,
      content: syncAliasedBlockContent(
        editorBlockType || rawBlockType,
        block.content,
      ),
    };
  }
  return block;
};

const getConflictServerBlocks = (error) => {
  const serverData = error?.response?.data?.serverData;
  if (Array.isArray(serverData?.blocks)) {
    return serverData.blocks.map(normalizeLoadedBlock);
  }
  if (Array.isArray(serverData)) {
    return serverData.map(normalizeLoadedBlock);
  }
  return null;
};

const mergeLocalBlocksOntoServerBlocks = (serverBlocks, localBlocks) => {
  if (!Array.isArray(serverBlocks) || !serverBlocks.length) {
    return localBlocks;
  }

  const localById = new Map(
    localBlocks
      .filter((block) => block?.id != null)
      .map((block) => [String(block.id), block]),
  );

  const merged = serverBlocks.map((serverBlock, index) => {
    const localBlock = localById.get(String(serverBlock.id));
    if (!localBlock) {
      return {
        ...serverBlock,
        sortOrder: serverBlock.sortOrder ?? index,
      };
    }

    return {
      ...serverBlock,
      ...localBlock,
      id: serverBlock.id,
      pageId: serverBlock.pageId,
      createdAt: serverBlock.createdAt,
      updatedAt: serverBlock.updatedAt,
      sortOrder: localBlock.sortOrder ?? serverBlock.sortOrder ?? index,
      blockType: localBlock.blockType || serverBlock.blockType,
      content: {
        ...(serverBlock.content || {}),
        ...(localBlock.content || {}),
      },
    };
  });

  localBlocks.forEach((localBlock, index) => {
    if (
      localBlock?.id == null ||
      !serverBlocks.some((block) => String(block.id) === String(localBlock.id))
    ) {
      merged.push({
        ...localBlock,
        sortOrder: localBlock.sortOrder ?? merged.length + index,
      });
    }
  });

  return merged.map((block, index) => ({
    ...block,
    sortOrder: index,
  }));
};

const syncEditorBlocksState = ({
  blocks,
  blocksRef,
  effectivePageId,
  editorPageId,
  updatedAt,
  setBlocks,
  setPages,
  setSelectedPage,
  setPersistedPages,
}) => {
  const normalizedBlocks = blocks.map(normalizeLoadedBlock);
  const shouldUpdateEditorPage = (pageId) =>
    String(pageId) === String(effectivePageId) ||
    (editorPageId != null && String(pageId) === String(editorPageId));

  if (blocksRef) {
    blocksRef.current = normalizedBlocks;
  }
  setBlocks(normalizedBlocks);
  setPages((prevPages) =>
    prevPages.map((page) =>
      shouldUpdateEditorPage(page.id)
        ? {
            ...page,
            ...(updatedAt ? { updatedAt } : {}),
            blocks: normalizedBlocks,
          }
        : page,
    ),
  );
  setSelectedPage((prevSelectedPage) =>
    prevSelectedPage && shouldUpdateEditorPage(prevSelectedPage.id)
      ? {
          ...prevSelectedPage,
          ...(updatedAt ? { updatedAt } : {}),
          blocks: normalizedBlocks,
        }
      : prevSelectedPage,
  );
  setPersistedPages((prevPages) =>
    prevPages.map((page) =>
      String(page.id) === String(effectivePageId)
        ? {
            ...page,
            ...(updatedAt ? { updatedAt } : {}),
            blocks: normalizedBlocks,
          }
        : page,
    ),
  );
};

const getBlocksMutationPayload = (response) => {
  const body = response?.data || {};
  return body?.data &&
    typeof body.data === "object" &&
    !Array.isArray(body.data)
    ? body.data
    : body;
};

const getBlocksMutationUpdatedAt = (response) =>
  getBlocksMutationPayload(response)?.updatedAt ||
  response?.data?.updatedAt ||
  response?.data?.data?.updatedAt ||
  null;

const getBlocksMutationBlocks = (response) => {
  const payload = getBlocksMutationPayload(response);
  if (Array.isArray(payload?.blocks)) {
    return payload.blocks;
  }
  if (Array.isArray(response?.data?.blocks)) {
    return response.data.blocks;
  }
  if (Array.isArray(response?.data?.data?.blocks)) {
    return response.data.data.blocks;
  }
  return null;
};

const getRequestErrorMessage = (error, fallbackMessage) => {
  const message = error?.response?.data?.message;
  return typeof message === "string" && message.trim()
    ? message
    : fallbackMessage;
};

const OPEN_MEDIA_LIBRARY_EVENT = "editor:open-media-library";

const WebsiteEditorInner = () => {
  const { websiteId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));
  const desktopInspectorWidth = "clamp(300px, 18vw, 360px)";
  const editorThemeMode = "light";
  const isEditorDark = editorThemeMode === "dark";
  const colors = getDashboardColors(editorThemeMode);
  const editorText = "#111827";
  const editorMutedText = "#374151";
  const editorLabelText = "#4b5563";

  const [website, setWebsite] = useState(null);
  const pendingAIWebsitePatchRef = useRef({});
  const [websiteAIExternalTargets, setWebsiteAIExternalTargets] = useState([]);
  const [websiteAISchemaRefreshKey, setWebsiteAISchemaRefreshKey] = useState(0);
  const [pages, setPages] = useState([]);
  const [persistedPages, setPersistedPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const blocksRef = useRef([]);

  // AI website draft (creation questionnaire → editor preview). The draft runs
  // preview-only: patches are applied to local editor state and only persist if
  // the user keeps them and saves. A snapshot lets us restore the template.
  const [aiDraftLoading, setAiDraftLoading] = useState(false);
  const [aiDraftReadyPromptOpen, setAiDraftReadyPromptOpen] = useState(false);
  const [aiDraftReviewOpen, setAiDraftReviewOpen] = useState(false);
  const [aiDraftSummary, setAiDraftSummary] = useState("");
  const aiDraftSnapshotRef = useRef(null);
  const aiDraftPendingResultRef = useRef(null);
  const aiDraftLongRunningRef = useRef(false);
  const aiDraftStartedRef = useRef(false);
  // Non-selected pages a full-site draft touched, so "Save Changes" can persist
  // them too (the normal save only writes the selected page).
  const draftedOtherPageIdsRef = useRef(new Set());
  // Live mirror of pages/persistedPages for stable, closure-safe reads inside
  // draft apply/save callbacks.
  const pagesStateRef = useRef({ pages: [], persistedPages: [] });

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
  const [templateThemeSelectionDirty, setTemplateThemeSelectionDirty] =
    useState(false);

  const [selectedEditableElement, setSelectedEditableElement] = useState(null);
  const [askAIOpenSignal, setAskAIOpenSignal] = useState(0);
  const [askAIAnchorRect, setAskAIAnchorRect] = useState(null);
  const [askAIButtonStatus, setAskAIButtonStatus] = useState("idle");
  const [selectedImageElement, setSelectedImageElement] = useState(null);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [isImageLibraryPickerOpen, setIsImageLibraryPickerOpen] =
    useState(false);
  const [imageLibraryFieldRequest, setImageLibraryFieldRequest] =
    useState(null);
  const [selectedSectionElement, setSelectedSectionElement] = useState(null);
  const [selectedStaticElement, setSelectedStaticElement] = useState(null);
  const [dynamicBlogStyleTargets, setDynamicBlogStyleTargets] = useState([]);
  const [isSectionInnerBlockModalOpen, setIsSectionInnerBlockModalOpen] =
    useState(false);
  const [sectionInnerBlockSearch, setSectionInnerBlockSearch] = useState("");
  const [sectionInnerAvailableBlocks, setSectionInnerAvailableBlocks] =
    useState([]);
  const [activeToolbarMode, setActiveToolbarMode] = useState("text");
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  // AI chat panel now docks into the inspector (style bar) slot on the right.
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [aiChatDockNode, setAiChatDockNode] = useState(null);
  const [uploadedLibraryImages, setUploadedLibraryImages] = useState([]);
  const [uploadedLibraryVideos, setUploadedLibraryVideos] = useState([]);
  const [previewContextMenu, setPreviewContextMenu] = useState(null);
  const [previewClipboard, setPreviewClipboard] = useState(null);
  const [selectedPreviewTarget, setSelectedPreviewTarget] = useState(null);
  const [staticStyleDrafts, setStaticStyleDrafts] = useState({});
  const [staticMediaOverrides, setStaticMediaOverrides] = useState({});
  const staticUndoStackRef = useRef([]);
  const staticRedoStackRef = useRef([]);
  const [canUndoStatic, setCanUndoStatic] = useState(false);
  const [canRedoStatic, setCanRedoStatic] = useState(false);
  const [draggedLibraryBlock, setDraggedLibraryBlock] = useState(null);
  const [previewSaveSignal, setPreviewSaveSignal] = useState(0);

  useEffect(() => {
    if (websiteId == null || selectedPage?.id == null) {
      return;
    }

    const stored = getStoredStaticOverridesForPage(websiteId, selectedPage.id);
    setStaticMediaOverrides((prev) => {
      const next = { ...prev };
      Object.entries(stored.media).forEach(([pageKey, value]) => {
        next[
          buildStoredStaticMediaOverrideKey(
            websiteId,
            selectedPage.id,
            pageKey.split("::")[0],
            pageKey.split("::")[1],
          )
        ] = value;
      });
      return next;
    });
    setStaticStyleDrafts((prev) => {
      const next = { ...prev };
      Object.entries(stored.style).forEach(([pageKey, value]) => {
        const [blockId, styleKey, staticId] = pageKey.split("::");
        next[`${blockId}::${styleKey}::${staticId}`] = value;
      });
      return next;
    });
  }, [selectedPage?.id, websiteId]);

  useEffect(() => {
    setStaticStyleDrafts((previous) => {
      const next = { ...previous };
      blocks.forEach((block) => {
        const containerStyles = block?.content?.containerStyles;
        if (
          containerStyles &&
          typeof containerStyles === "object" &&
          !Array.isArray(containerStyles)
        ) {
          Object.entries(containerStyles).forEach(([containerId, style]) => {
            if (style && typeof style === "object" && !Array.isArray(style)) {
              next[`${block.id}::containerStyles::${containerId}`] = style;
            }
          });
        }
        const staticStyles = block?.content?.staticStyles;
        if (
          isBlogStaticStyleBlock(block) &&
          staticStyles &&
          typeof staticStyles === "object" &&
          !Array.isArray(staticStyles)
        ) {
          Object.entries(staticStyles).forEach(([targetKey, style]) => {
            if (style && typeof style === "object" && !Array.isArray(style)) {
              const parts = String(targetKey).split("::");
              if (parts.length >= 2) {
                next[`${block.id}::${targetKey}`] = style;
              }
            }
          });
        }
      });
      return next;
    });
  }, [blocks]);

  const syncStaticHistoryState = useCallback(() => {
    setCanUndoStatic(staticUndoStackRef.current.length > 0);
    setCanRedoStatic(staticRedoStackRef.current.length > 0);
  }, []);

  const cloneStaticOverrideSnapshot = useCallback(
    () => ({
      staticStyleDrafts: JSON.parse(JSON.stringify(staticStyleDrafts || {})),
      staticMediaOverrides: JSON.parse(
        JSON.stringify(staticMediaOverrides || {}),
      ),
    }),
    [staticMediaOverrides, staticStyleDrafts],
  );

  const pushStaticOverrideHistory = useCallback(() => {
    staticUndoStackRef.current.push(cloneStaticOverrideSnapshot());
    if (staticUndoStackRef.current.length > 50) {
      staticUndoStackRef.current.shift();
    }
    staticRedoStackRef.current = [];
    syncStaticHistoryState();
  }, [cloneStaticOverrideSnapshot, syncStaticHistoryState]);

  const getEditableCssUnitValue = useCallback((value) => {
    if (value === null || value === undefined) return "";
    const normalized = String(value).trim();
    if (!normalized) return "";
    const match = normalized.match(/^(-?\d+(?:\.\d+)?)px$/i);
    return match ? match[1] : normalized;
  }, []);

  const toEditableCssUnit = useCallback((value) => {
    const normalized = String(value ?? "").trim();
    if (!normalized) return "";
    const sanitized = normalized.replace(/[^\d.-]/g, "");
    return sanitized ? `${sanitized}px` : "";
  }, []);
  const iframeRef = useRef(null);
  const previewContextMenuRef = useRef(null);
  const imageLibraryInputRef = useRef(null);
  const imageReplaceInputRef = useRef(null);
  const imageLibraryPickerInputRef = useRef(null);
  const videoLibraryPickerInputRef = useRef(null);
  const handleInsertBlockFromLibraryRef = useRef(null);
  const previewSelectionNonceRef = useRef(0);
  const previewTransformHistoryPrimedRef = useRef(false);
  const previewTransformHistoryTimerRef = useRef(null);
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
  const isBlockEditorSidebarOpen = !!editingBlock;

  // Forms
  const [pageForm, setPageForm] = useState({
    title: "",
    path: "",
    isHome: false,
    isPublished: true,
  });
  const [blockForm, setBlockForm] = useState({ blockType: "", content: {} });
  const [blockEditorName, setBlockEditorName] = useState("");
  const [formError, setFormError] = useState(null);
  const [saveToast, setSaveToast] = useState({
    open: false,
    message: "",
    severity: "error",
  });
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
  const livePreviewFrameRef = useRef(null);
  const pendingLivePreviewRef = useRef(null);

  // Autosave payload — derived from blocks (single source of truth)
  const autosavePayload = useMemo(
    () => ({ blocks: blocks.map(sanitizeBlockForSave) }),
    [blocks],
  );

  useEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);

  useEffect(() => {
    pagesStateRef.current = { pages, persistedPages };
  }, [pages, persistedPages]);

  const findBlockOwnerPage = useCallback(
    (blockId) => {
      if (blockId == null) {
        return null;
      }

      if (
        selectedPage?.id != null &&
        blocksRef.current.some((block) => String(block.id) === String(blockId))
      ) {
        return {
          pageId: String(selectedPage.id),
          page: selectedPage,
          isSelectedPage: true,
        };
      }

      const candidates = [
        ...(Array.isArray(pagesStateRef.current.pages)
          ? pagesStateRef.current.pages
          : []),
        ...(Array.isArray(pagesStateRef.current.persistedPages)
          ? pagesStateRef.current.persistedPages
          : []),
      ];

      for (const page of candidates) {
        const pageBlocks = Array.isArray(page?.blocks) ? page.blocks : [];
        if (pageBlocks.some((block) => String(block.id) === String(blockId))) {
          return {
            pageId: String(page.id),
            page,
            isSelectedPage:
              selectedPage?.id != null &&
              String(page.id) === String(selectedPage.id),
          };
        }
      }

      return null;
    },
    [selectedPage],
  );

  const findBlockInEditorPages = useCallback(
    (blockId) => {
      if (blockId == null) {
        return null;
      }

      if (
        blocksRef.current.some((block) => String(block.id) === String(blockId))
      ) {
        return blocksRef.current.find(
          (block) => String(block.id) === String(blockId),
        );
      }

      const owner = findBlockOwnerPage(blockId);
      if (!owner?.page) {
        return null;
      }

      return (owner.page.blocks || []).find(
        (block) => String(block.id) === String(blockId),
      );
    },
    [findBlockOwnerPage],
  );

  const updateBlockInEditorState = useCallback(
    (blockId, updater, options = {}) => {
      const owner = findBlockOwnerPage(blockId);
      if (!owner?.pageId || typeof updater !== "function") {
        return null;
      }

      const ownerPageId = String(owner.pageId);
      const updatePageCollection = (prevPages) =>
        prevPages.map((page) => {
          if (String(page.id) !== ownerPageId) {
            return page;
          }

          let didChange = false;
          const nextBlocks = (page.blocks || []).map((block) => {
            if (String(block.id) !== String(blockId)) {
              return block;
            }
            const nextBlock = updater(block, page);
            if (nextBlock !== block) {
              didChange = true;
            }
            return nextBlock;
          });

          return didChange ? { ...page, blocks: nextBlocks } : page;
        });

      if (owner.isSelectedPage) {
        const nextBlocks = blocksRef.current.map((block) =>
          String(block.id) === String(blockId)
            ? updater(block, owner.page)
            : block,
        );
        blocksRef.current = nextBlocks;
        setBlocks(nextBlocks);
        setSelectedPage((prevSelectedPage) =>
          prevSelectedPage
            ? { ...prevSelectedPage, blocks: nextBlocks }
            : prevSelectedPage,
        );
      } else if (options.markDirty !== false) {
        draftedOtherPageIdsRef.current.add(ownerPageId);
      }

      setPages(updatePageCollection);
      setPersistedPages(updatePageCollection);

      return owner;
    },
    [findBlockOwnerPage],
  );

  useEffect(() => {
    if (editingBlock) {
      const hasCustomLabel = Object.prototype.hasOwnProperty.call(
        editingBlock.content || {},
        "editorLabel",
      );
      setBlockEditorName(
        hasCustomLabel
          ? (editingBlock.content?.editorLabel ?? "")
          : editingBlock.blockType || "",
      );
    } else {
      setBlockEditorName("");
    }
  }, [editingBlock]);

  const closeBlockEditorSidebar = useCallback(() => {
    if (livePreviewFrameRef.current !== null) {
      cancelAnimationFrame(livePreviewFrameRef.current);
      livePreviewFrameRef.current = null;
    }
    pendingLivePreviewRef.current = null;
    setEditingBlock(null);
    setBlockForm({ blockType: "", content: {} });
    setBlockEditorName("");
    setFormError(null);
    setFormHasErrors(false);
  }, []);

  const mergeLiveBlockEditorContent = useCallback((block, nextValues) => {
    if (!block) {
      return block;
    }

    const editorBlockType = String(
      block?.content?.editorBlockType || block?.blockType || "",
    )
      .trim()
      .toUpperCase();
    const normalizedNextValues =
      editorBlockType === "CONTACT"
        ? normalizeContactEditorContent(omitInnerBlocksMirror(nextValues || {}))
        : omitInnerBlocksMirror(nextValues || {});

    const nextContent = {
      ...(block.content || {}),
      ...normalizedNextValues,
    };

    const existingInnerBlocks = Array.isArray(nextContent.innerBlocks)
      ? nextContent.innerBlocks
      : getBlockInnerBlocks(block);

    if (nextContent?.editorBlockType && existingInnerBlocks[0]) {
      const firstInnerBlock = existingInnerBlocks[0];
      const contentFieldNames = getEditorBlockContentFieldNames(
        nextContent.editorBlockType,
      );
      const firstInnerContentPatch = Object.fromEntries(
        Object.entries(normalizedNextValues).filter(([key]) =>
          contentFieldNames.has(key),
        ),
      );
      const sanitizedExistingFirstInnerContent = omitEditorWrapperKeys(
        firstInnerBlock.content || {},
      );
      const syncedInnerBlocks = [
        {
          ...firstInnerBlock,
          content: {
            ...sanitizedExistingFirstInnerContent,
            ...firstInnerContentPatch,
          },
        },
        ...existingInnerBlocks.slice(1),
      ];

      return withSyncedBlockContent(block, {
        ...nextContent,
        innerBlocks: syncedInnerBlocks,
      });
    }

    return withSyncedBlockContent(block, nextContent);
  }, []);

  const flushLivePreviewUpdate = useCallback(() => {
    const pending = pendingLivePreviewRef.current;
    pendingLivePreviewRef.current = null;
    livePreviewFrameRef.current = null;

    if (!pending?.blockId) {
      return;
    }

    suppressHistoryRef.current = true;

    startTransition(() => {
      setBlocks((prevBlocks) =>
        prevBlocks.map((block) =>
          String(block.id) === String(pending.blockId)
            ? mergeLiveBlockEditorContent(block, pending.nextValues || {})
            : block,
        ),
      );
    });
  }, [mergeLiveBlockEditorContent]);

  const scheduleLivePreviewUpdate = useCallback(
    (blockId, nextValues) => {
      pendingLivePreviewRef.current = {
        blockId,
        nextValues,
      };

      if (livePreviewFrameRef.current !== null) {
        return;
      }

      livePreviewFrameRef.current = requestAnimationFrame(() => {
        flushLivePreviewUpdate();
      });
    },
    [flushLivePreviewUpdate],
  );

  useEffect(
    () => () => {
      if (livePreviewFrameRef.current !== null) {
        cancelAnimationFrame(livePreviewFrameRef.current);
      }
    },
    [],
  );

  const handleEditingBlockLabelChange = useCallback(
    (nextLabel) => {
      setBlockForm((prev) => ({
        ...prev,
        content: {
          ...(prev.content || {}),
          editorLabel: nextLabel,
        },
      }));

      scheduleLivePreviewUpdate(editingBlock?.id, {
        editorLabel: nextLabel,
      });
    },
    [editingBlock?.id, scheduleLivePreviewUpdate],
  );

  const handleEditingBlockContentChange = useCallback(
    (nextValues) => {
      setBlockForm((prev) => ({
        ...prev,
        content: mergeEditorContentObjects(
          prev.content || {},
          nextValues || {},
        ),
      }));

      scheduleLivePreviewUpdate(
        editingBlock?.id,
        mergeEditorContentObjects(blockForm.content || {}, nextValues || {}),
      );
    },
    [blockForm.content, editingBlock?.id, scheduleLivePreviewUpdate],
  );
  const isVideoEditingBlock =
    String(editingBlock?.blockType || "").toLowerCase() === "video";
  const selectedEditingBlockContent = useMemo(
    () => ({
      ...(editingBlock?.content || {}),
      ...(blockForm.content || {}),
    }),
    [editingBlock?.content, blockForm.content],
  );
  const updateEditingBlockContentPatch = useCallback(
    (patch) => {
      handleEditingBlockContentChange({
        ...selectedEditingBlockContent,
        ...patch,
      });
    },
    [handleEditingBlockContentChange, selectedEditingBlockContent],
  );
  const getVideoPercentValue = useCallback((value, fallback = 100) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      return fallback;
    }
    return Math.min(100, Math.max(20, Math.round(parsed)));
  }, []);
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

      const persistPendingAIWebsitePatch = async () => {
        const patch = pendingAIWebsitePatchRef.current || {};
        if (!Object.keys(patch).length) return;

        const websiteResponse = await apiClient.put(
          `/websites/${websiteId}`,
          patch,
        );
        const updatedWebsite =
          websiteResponse.data?.data || websiteResponse.data || patch;
        setWebsite((prev) =>
          prev ? { ...prev, ...patch, ...updatedWebsite } : prev,
        );
        pendingAIWebsitePatchRef.current = {};
      };

      try {
        const normalizedBlocks = data.blocks.map(sanitizeBlockForSave);
        const resolvedThemeSettings =
          templateThemeSelection && templateThemeSelectionDirty
            ? getTemplateThemeSettings(templateThemeSelection)
            : persistedTemplateThemeSettings;
        // Bake the theme settings into the page blocks whenever the palette was
        // changed (not just for not-yet-saved template pages). The public
        // template site reads its colors from the theme settings persisted in
        // the blocks (readTemplateThemeSettingsFromPages), so without this a
        // saved palette change never reaches the live site.
        blocksToSave =
          selectedPage?.localOnly || templateThemeSelectionDirty
            ? injectTemplateThemeSettingsIntoBlocks(
                normalizedBlocks,
                resolvedThemeSettings,
              )
            : normalizedBlocks;
        const blocksToDisplay = blocksToSave.map(normalizeLoadedBlock);
        if (JSON.stringify(blocksToDisplay) !== JSON.stringify(blocks)) {
          setBlocks(blocksToDisplay);
        }

        let effectivePageId = selectedPage?.localOnly
          ? templatePersistencePage?.id
          : selectedPage.id;
        if (!effectivePageId && selectedPage?.localOnly) {
          // A locally hydrated template page can temporarily lose its persisted
          // counterpart from state. Resolve it from the API before creating
          // anything, otherwise saving Home attempts to create "/" again.
          const pagesResponse = await apiClient.get(
            `/websites/${websiteId}/pages`,
          );
          const existingPages = Array.isArray(pagesResponse.data?.data)
            ? pagesResponse.data.data
            : Array.isArray(pagesResponse.data)
              ? pagesResponse.data
              : [];
          const existingPage =
            existingPages.find(
              (page) =>
                page.path === selectedPage.path ||
                (page.isHome && selectedPage.isHome),
            ) || null;

          if (existingPage?.id) {
            effectivePageId = existingPage.id;
            setPersistedPages((prevPages) => {
              const hasPage = prevPages.some(
                (page) => String(page.id) === String(existingPage.id),
              );
              return hasPage
                ? prevPages
                : [...prevPages, { ...existingPage, blocks: [] }];
            });
          } else {
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
        }
        if (!effectivePageId) {
          throw new Error("No persisted template page is available for saving");
        }

        const response = await apiClient.put(
          `/websites/${websiteId}/pages/${effectivePageId}/blocks`,
          {
            blocks: blocksToSave
              .filter(hasValidGalleryImages)
              .map((b, idx) => ({
                ...(b.id && !String(b.id).startsWith("local-")
                  ? { id: b.id }
                  : {}),
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
        );

        // Store ETag from response for next request
        if (response.headers?.etag) {
          etagRef.current = response.headers.etag;
        }

        // Store updatedAt for next expectedUpdatedAt fallback
        const updatedAt = getBlocksMutationUpdatedAt(response);
        if (updatedAt) {
          expectedUpdatedAtRef.current = updatedAt;
        }
        const savedBlocks = getBlocksMutationBlocks(response);
        if (savedBlocks?.length) {
          syncEditorBlocksState({
            blocks: savedBlocks,
            blocksRef,
            effectivePageId,
            editorPageId: selectedPage?.id,
            updatedAt,
            setBlocks,
            setPages,
            setSelectedPage,
            setPersistedPages,
          });
          setWebsiteAISchemaRefreshKey((key) => key + 1);
        }

        // Persist the theme colors to the website record whenever the user
        // changed the palette (templateThemeSelectionDirty) — not just for
        // not-yet-saved template pages. Without this, the color updates in the
        // editor/preview but the published site keeps the old website.primaryColor.
        if (
          resolvedThemeSettings?.primaryColor &&
          (selectedPage?.localOnly || templateThemeSelectionDirty)
        ) {
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

        await persistPendingAIWebsitePatch();

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
            expectedUpdatedAtRef.current =
              error.response.data?.serverUpdatedAt || null;

            const retryPageId = selectedPage?.localOnly
              ? templatePersistencePage?.id
              : selectedPage.id;
            if (!retryPageId) {
              throw new Error(
                "No persisted template page is available for retry save",
              );
            }

            const serverBlocks = getConflictServerBlocks(error);
            const retryBlocks = mergeLocalBlocksOntoServerBlocks(
              serverBlocks,
              blocksToSave,
            );

            const retryResponse = await apiClient.put(
              `/websites/${websiteId}/pages/${retryPageId}/blocks`,
              {
                blocks: retryBlocks
                  .filter(hasValidGalleryImages)
                  .map((b, idx) => ({
                    ...(b.id && !String(b.id).startsWith("local-")
                      ? { id: b.id }
                      : {}),
                    blockType: b.blockType,
                    content: b.content,
                    variant: b.variant,
                    sortOrder: idx,
                    isVisible: b.isVisible,
                  })),
                ...(error.response.data?.serverUpdatedAt
                  ? { expectedUpdatedAt: error.response.data.serverUpdatedAt }
                  : {}),
              },
            );

            if (retryResponse.headers?.etag) {
              etagRef.current = retryResponse.headers.etag;
            }

            const retryUpdatedAt = getBlocksMutationUpdatedAt(retryResponse);
            if (retryUpdatedAt) {
              expectedUpdatedAtRef.current = retryUpdatedAt;
            }

            const savedBlocks =
              getBlocksMutationBlocks(retryResponse) || retryBlocks;
            syncEditorBlocksState({
              blocks: savedBlocks,
              blocksRef,
              effectivePageId: retryPageId,
              editorPageId: selectedPage?.id,
              updatedAt: retryUpdatedAt,
              setBlocks,
              setPages,
              setSelectedPage,
              setPersistedPages,
            });
            setWebsiteAISchemaRefreshKey((key) => key + 1);

            await persistPendingAIWebsitePatch();

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
    saveError,
    conflictData,
    getHasUnsavedChanges,
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

  const showSaveToast = useCallback((message, severity = "error") => {
    if (!message) return;
    setSaveToast({
      open: true,
      message,
      severity,
    });
  }, []);

  useEffect(() => {
    if (saveError) {
      showSaveToast(saveError, "error");
    }
  }, [saveError, showSaveToast]);

  // Persist any non-selected pages a full-site AI draft modified. The normal
  // save only writes the selected page, so without this those pages' draft
  // changes would be lost. Best-effort per page; localOnly pages are skipped
  // (their blocks persist through the selected/home page). Successfully saved
  // pages are dropped from the set; failures are kept so a later save retries.
  const saveDraftedOtherPages = useCallback(async () => {
    const ids = Array.from(draftedOtherPageIdsRef.current);
    if (!ids.length) return;
    const { pages: curPages, persistedPages: curPersisted } =
      pagesStateRef.current;
    const remaining = new Set(draftedOtherPageIdsRef.current);
    for (const pageId of ids) {
      const page =
        curPages.find((p) => String(p.id) === String(pageId)) ||
        curPersisted.find((p) => String(p.id) === String(pageId));
      if (!page) {
        continue;
      }
      let effectivePageId = page.localOnly ? null : page.id;
      if (!effectivePageId) {
        try {
          // eslint-disable-next-line no-await-in-loop
          const createdPageResponse = await apiClient.post(
            `/websites/${websiteId}/pages`,
            {
              title: page.title,
              path: page.path,
              isHome: page.isHome,
              isPublished: page.isPublished ?? true,
            },
          );
          const createdPage =
            createdPageResponse.data?.data || createdPageResponse.data;
          effectivePageId = createdPage?.id;
          if (!effectivePageId) {
            continue;
          }
          setPages((prevPages) =>
            prevPages.map((entry) =>
              String(entry.id) === String(pageId)
                ? {
                    ...entry,
                    ...createdPage,
                    id: effectivePageId,
                    localOnly: false,
                  }
                : entry,
            ),
          );
          setPersistedPages((prevPages) => {
            const nextPages = prevPages.filter(
              (entry) => String(entry.id) !== String(pageId),
            );
            return [
              ...nextPages,
              {
                ...page,
                ...createdPage,
                id: effectivePageId,
                localOnly: false,
              },
            ];
          });
          remaining.delete(pageId);
          remaining.add(String(effectivePageId));
        } catch (err) {
          console.error(`Failed to create shared page ${pageId}:`, err);
          continue;
        }
      }
      const blocksToSave = (page.blocks || [])
        .map(sanitizeBlockForSave)
        .filter(hasValidGalleryImages)
        .map((b, idx) => ({
          ...(b.id && !String(b.id).startsWith("local-") ? { id: b.id } : {}),
          blockType: b.blockType,
          content: b.content,
          variant: b.variant,
          sortOrder: idx,
          isVisible: b.isVisible,
        }));
      try {
        // eslint-disable-next-line no-await-in-loop
        await apiClient.put(
          `/websites/${websiteId}/pages/${effectivePageId}/blocks`,
          {
            blocks: blocksToSave,
          },
        );
        remaining.delete(pageId);
        remaining.delete(String(effectivePageId));
      } catch (err) {
        console.error(`Failed to save AI draft for page ${pageId}:`, err);
      }
    }
    draftedOtherPageIdsRef.current = remaining;
  }, [websiteId]);

  const triggerManualSave = useCallback(async () => {
    localConflictRetryRef.current = false;
    const iframeDoc = iframeRef.current?.contentDocument || null;
    let nextBlocks = blocksRef.current;

    if (iframeDoc) {
      const editableElements = Array.from(
        iframeDoc.querySelectorAll("[data-editable]"),
      ).filter((node) => node instanceof HTMLElement);

      let hasDomEditableChanges = false;

      flushSync(() => {
        let workingBlocks = blocksRef.current;

        editableElements.forEach((editableNode) => {
          const editableEl = editableNode;
          const blockId = editableEl.getAttribute("data-block-id");
          const fieldPath = editableEl.getAttribute("data-editable");

          if (!blockId || !fieldPath || fieldPath.startsWith("__fallback.")) {
            return;
          }

          const nextValue = editableEl.textContent || "";
          const targetBlock = workingBlocks.find(
            (block) => String(block.id) === String(blockId),
          );

          if (!targetBlock) {
            const ownerBlock = findBlockInEditorPages(blockId);
            if (!ownerBlock) {
              return;
            }
            const currentValue = getValueAtPath(
              ownerBlock.content || {},
              fieldPath,
            );
            if (String(currentValue ?? "") === nextValue) {
              return;
            }
            hasDomEditableChanges = true;
            pendingHistoryDescriptionRef.current = `Edited ${fieldPath}`;
            updateBlockInEditorState(blockId, (block) =>
              withSyncedBlockContent(
                block,
                setValueAtPath(block.content || {}, fieldPath, nextValue),
              ),
            );
            return;
          }

          const currentValue = getValueAtPath(
            targetBlock.content || {},
            fieldPath,
          );

          if (String(currentValue ?? "") === nextValue) {
            return;
          }

          hasDomEditableChanges = true;
          pendingHistoryDescriptionRef.current = `Edited ${fieldPath}`;
          workingBlocks = workingBlocks.map((block) =>
            String(block.id) !== String(blockId)
              ? block
              : withSyncedBlockContent(
                  block,
                  setValueAtPath(block.content || {}, fieldPath, nextValue),
                ),
          );
        });

        if (hasDomEditableChanges) {
          nextBlocks = workingBlocks;
          blocksRef.current = workingBlocks;
          setBlocks(workingBlocks);
          setSelectedPage((prevSelectedPage) =>
            prevSelectedPage
              ? { ...prevSelectedPage, blocks: workingBlocks }
              : prevSelectedPage,
          );
          setPages((prevPages) =>
            prevPages.map((page) =>
              String(page.id) === String(selectedPage?.id)
                ? { ...page, blocks: workingBlocks }
                : page,
            ),
          );
          setPersistedPages((prevPages) =>
            prevPages.map((page) =>
              String(page.id) === String(selectedPage?.id)
                ? { ...page, blocks: workingBlocks }
                : page,
            ),
          );
        }
      });

      editableElements.forEach((editableNode) => {
        const editableEl = editableNode;
        if (
          editableEl.getAttribute("data-inline-editing") === "true" ||
          editableEl.isContentEditable
        ) {
          editableEl.blur();
        }
      });
    }

    setPreviewSaveSignal((prev) => prev + 1);
    await new Promise((resolve) => setTimeout(resolve, 0));
    // Persist non-selected pages a full-site AI draft touched, then the selected
    // page through the normal (conflict-aware) save.
    await saveDraftedOtherPages();
    await triggerSave({ blocks: nextBlocks.map(sanitizeBlockForSave) });
  }, [
    findBlockInEditorPages,
    saveDraftedOtherPages,
    selectedPage?.id,
    triggerSave,
    updateBlockInEditorState,
  ]);

  const handleAIBlocksPatched = useCallback(async () => {
    await triggerSave({
      blocks: blocksRef.current.map(sanitizeBlockForSave),
    });
  }, [triggerSave]);

  useEffect(() => {
    if (!supportsTemplateThemeSidebar) {
      setTemplateThemeSelection(null);
      setTemplateThemeSelectionDirty(false);
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
    setUnsavedChanges: setNavigationUnsavedChanges,
  } = useUnsavedChanges({
    hasUnsavedChanges,
    onSaveBeforeLeave: triggerManualSave,
    skipBeforeUnload: true,
    saveStatus,
  });

  const canTriggerSave = useMemo(
    () =>
      saveStatus !== "saving" &&
      (hasUnsavedChanges || getHasUnsavedChanges?.() || saveStatus === "error"),
    [getHasUnsavedChanges, hasUnsavedChanges, saveStatus],
  );

  const pendingWebsitesReloadRef = useRef(false);

  const reloadWebsitesDashboard = useCallback(() => {
    window.location.assign(`/dashboard/websites/${websiteId}/manage`);
  }, [websiteId]);

  const handleBackToWebsites = useCallback(() => {
    pendingWebsitesReloadRef.current = true;

    const hasPendingChanges =
      hasUnsavedChanges || getHasUnsavedChanges?.() || saveStatus === "error";

    if (hasPendingChanges) {
      flushSync(() => {
        setNavigationUnsavedChanges(true);
      });
      navigate(`/dashboard/websites/${websiteId}/manage`);
      return;
    }

    reloadWebsitesDashboard();
  }, [
    getHasUnsavedChanges,
    hasUnsavedChanges,
    navigate,
    reloadWebsitesDashboard,
    saveStatus,
    setNavigationUnsavedChanges,
  ]);

  const handleConfirmNavigation = useCallback(() => {
    const shouldReload = pendingWebsitesReloadRef.current;
    pendingWebsitesReloadRef.current = false;
    confirmNavigation();

    if (shouldReload) {
      window.setTimeout(reloadWebsitesDashboard, 0);
    }
  }, [confirmNavigation, reloadWebsitesDashboard]);

  const handleCancelNavigation = useCallback(() => {
    pendingWebsitesReloadRef.current = false;
    setNavigationUnsavedChanges(null);
    cancelNavigation();
  }, [cancelNavigation, setNavigationUnsavedChanges]);

  const handleSaveAndNavigate = useCallback(async () => {
    const shouldReload = pendingWebsitesReloadRef.current;
    pendingWebsitesReloadRef.current = false;
    await saveAndNavigate();

    if (shouldReload) {
      window.setTimeout(reloadWebsitesDashboard, 0);
    }
  }, [reloadWebsitesDashboard, saveAndNavigate]);

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
        if (!canTriggerSave) return;
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
    canTriggerSave,
    registerShortcut,
    unregisterShortcut,
    triggerManualSave,
    isLocalTemplateEditorPage,
  ]);

  // Sync editor state into PreviewContext — Step 4.11
  // Bridges blocks, selected page, and website metadata so PreviewPanel
  // can render a live srcdoc preview without network requests.
  const previewTemplateDataOverride = useMemo(() => {
    // Home renders the full frontend template. Non-home pages use the same
    // template data for shared chrome, but render their own page blocks inside
    // the template page shell.
    if (!selectedPage?.id || !websiteId || !supportsLocalTemplateEditor) {
      return null;
    }

    const previewPages = pages.map((page) =>
      String(page.id) === String(selectedPage.id) ? { ...page, blocks } : page,
    );
    const baseTemplateDataOverride = buildTemplatePreviewBusinessData(
      resolvedFrontendTemplateId,
      website || {},
      previewPages,
      selectedPage.id,
    );
    if (!baseTemplateDataOverride) return null;

    const storedStaticOverrides = getStoredStaticOverridesForPage(
      websiteId,
      selectedPage?.id,
    );
    const persistedStaticStyleOverrides =
      baseTemplateDataOverride.templateContent?.__editorStaticStyleOverrides ||
      {};

    const resolvedThemeSelection =
      templateThemeSelection && templateThemeSelectionDirty
        ? resolveTemplateThemeSelection(templateThemeSelection)
        : null;

    return {
      ...baseTemplateDataOverride,
      templateContent: {
        ...(baseTemplateDataOverride.templateContent || {}),
        __editorStaticMediaOverrides: storedStaticOverrides.media,
        // Block-backed container styles are authoritative. Browser-local values
        // only fill legacy preview keys that have not been persisted yet.
        __editorStaticStyleOverrides: {
          ...storedStaticOverrides.style,
          ...persistedStaticStyleOverrides,
        },
      },
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
    };
  }, [
    blocks,
    selectedPage?.id,
    website,
    websiteId,
    pages,
    supportsLocalTemplateEditor,
    templateThemeSelection,
    templateThemeSelectionDirty,
    resolvedFrontendTemplateId,
  ]);

  useEffect(() => {
    if (!selectedPage?.id || !websiteId) return;
    const previewPages = pages.map((page) =>
      String(page.id) === String(selectedPage.id) ? { ...page, blocks } : page,
    );
    const sharedChromeBlocks = getSharedChromeBlocksFromPages(previewPages);

    // Reflect the live (unsaved) theme-color selection so block-based pages that
    // read primaryColor via the page-shell preview (e.g. blog sections) update
    // immediately — mirrors the theme override applied to the template memo.
    const liveThemeSelection =
      templateThemeSelection && templateThemeSelectionDirty
        ? resolveTemplateThemeSelection(templateThemeSelection)
        : null;
    const livePrimaryColor =
      liveThemeSelection?.palette?.primary || website?.primaryColor;
    const liveSecondaryColor =
      liveThemeSelection?.palette?.secondary || website?.secondaryColor;

    updatePreviewContent({
      websiteId: String(websiteId),
      pageId: String(selectedPage.id),
      blocks: blocks.map((b, idx) => ({
        id: String(b.id),
        blockType: b.blockType,
        content: b.content || {},
        order: b.sortOrder ?? idx,
        isVisible: b.isVisible !== false,
        designTokens: b.designTokens,
      })),
      websiteMeta: {
        name: website?.name,
        slug: website?.slug,
        frontendTemplateId: supportsLocalTemplateEditor
          ? resolvedFrontendTemplateId
          : null,
        businessName: website?.businessName,
        primaryColor: livePrimaryColor,
        secondaryColor: liveSecondaryColor,
        metaDescription: website?.metaDescription,
        shortDescription: website?.shortDescription,
        logoUrl: website?.logoUrl,
        fullAddress: website?.fullAddress,
        tags: Array.isArray(website?.tags) ? website.tags : null,
        isHomePage: !!selectedPage?.isHome,
        sharedBlocks: {
          header: sharedChromeBlocks.header
            ? {
                id: String(sharedChromeBlocks.header.id),
                blockType: sharedChromeBlocks.header.blockType,
                content: sharedChromeBlocks.header.content || {},
              }
            : null,
          footer: sharedChromeBlocks.footer
            ? {
                id: String(sharedChromeBlocks.footer.id),
                blockType: sharedChromeBlocks.footer.blockType,
                content: sharedChromeBlocks.footer.content || {},
              }
            : null,
        },
        templateDataOverride: previewTemplateDataOverride,
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
    previewTemplateDataOverride,
    resolvedFrontendTemplateId,
    templateThemeSelection,
    templateThemeSelectionDirty,
  ]);

  useEffect(() => {
    if (!selectedPage?.id) return;
    setPages((prevPages) =>
      prevPages.map((page) =>
        String(page.id) === String(selectedPage.id)
          ? { ...page, blocks }
          : page,
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
    if (!iframeRef.current?.contentWindow) return;

    iframeRef.current.contentWindow.postMessage(
      {
        type: "ASK_AI_BUTTON_STATUS",
        status: askAIButtonStatus,
      },
      window.location.origin,
    );
  }, [askAIButtonStatus]);

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
      if (supportsLocalTemplateEditor) {
        const selectedPageId =
          typeof selectedPage.id === "string"
            ? selectedPage.id
            : String(selectedPage.id);

        if (localTemplateHydratedPageRef.current === selectedPageId) {
          setBlockError(null);
          isLoadingRef.current = false;
          return;
        }

        const templateBlocks = Array.isArray(selectedPage.blocks)
          ? selectedPage.blocks.map(normalizeLoadedBlock)
          : [];
        localTemplateHydratedPageRef.current = selectedPageId;
        setBlocks(templateBlocks);
        setBlockError(null);
        isLoadingRef.current = false;
        return;
      }
      setBlockError(null);
      fetchBlocks(selectedPage.id);
    } else {
      setBlockError(null);
      setBlocks([]);
    }
  }, [selectedPage?.id, selectedPage?.blocks, supportsLocalTemplateEditor]);

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
                const pageUpdatedAt =
                  blocksRes.data?.data?.updatedAt ||
                  blocksRes.data?.updatedAt ||
                  page.updatedAt;
                if (pageUpdatedAt) {
                  expectedUpdatedAtRef.current = pageUpdatedAt;
                }
              }
              return {
                ...page,
                blocks: (blocksRes.data.data || []).map(normalizeLoadedBlock),
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

      // Select the page requested via ?page=<id> (the Pages management "Edit"
      // button links here), falling back to the home page or the first page.
      // Honoring the query param is what makes the editor open the exact page the
      // user clicked instead of always defaulting to Home, and keeps that page
      // selected across a reload.
      const requestedPageId = searchParams.get("page");
      const requestedPage = requestedPageId
        ? pagesList.find((p) => String(p.id) === String(requestedPageId))
        : null;
      const blogDetailPageWithArticle = pagesList.find(
        (p) =>
          (p.pageType === "BLOG_DETAIL" || p.path === "/blog-detail") &&
          Array.isArray(p.blocks) &&
          p.blocks.some((b) => b.blockType === "BLOG_ARTICLE"),
      );
      const requestedPageIsEmptyBlogDetail =
        requestedPage &&
        (requestedPage.pageType === "BLOG_DETAIL" ||
          requestedPage.path === "/blog-detail" ||
          requestedPage.title === "Blog Detail") &&
        (!Array.isArray(requestedPage.blocks) ||
          !requestedPage.blocks.some((b) => b.blockType === "BLOG_ARTICLE"));
      const resolvedRequestedPage =
        requestedPageIsEmptyBlogDetail && blogDetailPageWithArticle
          ? blogDetailPageWithArticle
          : requestedPage ||
            (requestedPageId && blogDetailPageWithArticle
              ? blogDetailPageWithArticle
              : null);
      const homePage =
        resolvedRequestedPage || pagesList.find((p) => p.isHome) || pagesList[0];
      if (homePage) {
        if (
          supportsFrontendTemplateEditor(
            normalizedWebsiteData.frontendTemplateId,
          )
        ) {
          const initialBlocks = Array.isArray(homePage.blocks)
            ? homePage.blocks.map(normalizeLoadedBlock)
            : [];
          localTemplateHydratedPageRef.current = homePage.id;
          setBlocks(initialBlocks);
          setBlockError(null);
        } else if (homePage.localOnly) {
          const initialBlocks = Array.isArray(homePage.blocks)
            ? homePage.blocks.map(normalizeLoadedBlock)
            : [];
          localTemplateHydratedPageRef.current = homePage.id;
          setBlocks(initialBlocks);
          setBlockError(null);
        }
        setSelectedPage(homePage);
        if (
          requestedPageId &&
          homePage.id != null &&
          String(homePage.id) !== String(requestedPageId)
        ) {
          const nextSearchParams = new URLSearchParams(searchParams);
          nextSearchParams.set("page", String(homePage.id));
          setSearchParams(nextSearchParams, { replace: true });
        }
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
        ? localPage.blocks.map(normalizeLoadedBlock)
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
      const fetchedBlocks = (response.data.data || []).map(
        normalizeLoadedBlock,
      );
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
      const pageUpdatedAt =
        response.data?.data?.updatedAt ||
        response.data?.updatedAt ||
        selectedPage?.updatedAt;
      if (pageUpdatedAt) {
        expectedUpdatedAtRef.current = pageUpdatedAt;
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
      const message = getRequestErrorMessage(err, "Failed to create page");
      setFormError(message);
      showSaveToast(message, "error");
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

  const handleSelectPage = useCallback(
    (page) => {
      setSelectedEditableElement(null);
      setSelectedSectionElement(null);
      setSelectedImageElement(null);
      setIsImageDialogOpen(false);
      setIsInspectorOpen(false);
      if (page && supportsLocalTemplateEditor) {
        const localBlocks = Array.isArray(page.blocks)
          ? page.blocks.map(normalizeLoadedBlock)
          : [];
        localTemplateHydratedPageRef.current =
          typeof page.id === "string" ? page.id : String(page.id);
        suppressHistoryRef.current = true;
        setBlocks(localBlocks);
        setBlockError(null);
      } else if (page?.localOnly) {
        const localBlocks = Array.isArray(page.blocks)
          ? page.blocks.map(normalizeLoadedBlock)
          : [];
        localTemplateHydratedPageRef.current = page.id;
        suppressHistoryRef.current = true;
        setBlocks(localBlocks);
        setBlockError(null);
      }
      setSelectedPage(page);
    },
    [supportsLocalTemplateEditor],
  );

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
      const message = getRequestErrorMessage(err, "Failed to create block");
      setFormError(message);
      showSaveToast(message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateBlock = async () => {
    try {
      setSubmitting(true);
      setFormError(null);
      if (livePreviewFrameRef.current !== null) {
        cancelAnimationFrame(livePreviewFrameRef.current);
      }
      flushLivePreviewUpdate();

      pendingHistoryDescriptionRef.current = `Updated ${editingBlock.blockType} block`;
      setBlocks(
        blocks.map((b) => {
          if (b.id !== editingBlock.id) {
            return b;
          }
          return {
            ...mergeLiveBlockEditorContent(b, blockForm.content),
            localOnly: true,
          };
        }),
      );
      setEditingBlock(null);
      setBlockForm({ blockType: "", content: {} });
      setFormHasErrors(false);
    } catch (err) {
      console.error("Error updating block:", err);
      const message = getRequestErrorMessage(err, "Failed to update block");
      setFormError(message);
      showSaveToast(message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBlock = async (blockId) => {
    if (!confirm("Are you sure you want to delete this block?")) {
      return;
    }

    try {
      pendingHistoryDescriptionRef.current = "Deleted block";
      setBlocks((currentBlocks) =>
        currentBlocks.filter((b) => String(b.id) !== String(blockId)),
      );
      if (String(editingBlock?.id) === String(blockId)) {
        setEditingBlock(null);
        setBlockForm({ blockType: "", content: {} });
      }
    } catch (err) {
      console.error("Error deleting block:", err);
      alert(err.response?.data?.message || "Failed to delete block");
    }
  };

  const handleToggleBlockVisibility = async (block) => {
    try {
      const isCurrentlyVisible = block.isVisible !== false;
      pendingHistoryDescriptionRef.current = `${isCurrentlyVisible ? "Hid" : "Showed"} block`;
      setBlocks((currentBlocks) =>
        currentBlocks.map((b) =>
          String(b.id) === String(block.id)
            ? { ...b, isVisible: !isCurrentlyVisible, localOnly: true }
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

    const targetBlock = findBlockInEditorPages(selectedEditableElement.blockId);
    if (!targetBlock?.content) {
      return DEFAULT_TEXT_STYLE;
    }

    const innerMatch = parseInnerBlockFieldPath(
      selectedEditableElement.fieldPath,
    );
    const resolvedFieldName =
      innerMatch?.contentPath || selectedEditableElement.fieldPath;

    if (innerMatch) {
      const innerBlocks = Array.isArray(targetBlock.content?.innerBlocks)
        ? targetBlock.content.innerBlocks
        : [];
      const innerBlock = innerBlocks[innerMatch.index];
      const styleKey = getInnerBlockStyleKey(innerBlock, resolvedFieldName);
      const innerContent =
        innerBlock?.content && typeof innerBlock.content === "object"
          ? innerBlock.content
          : {};
      const innerStyle = styleKey.includes(".")
        ? getValueAtPath(innerContent, styleKey)
        : innerContent?.[styleKey];

      return {
        ...DEFAULT_TEXT_STYLE,
        ...(innerStyle && typeof innerStyle === "object" ? innerStyle : {}),
      };
    }

    const styleKey =
      selectedEditableElement.styleKey ||
      getResolvedEditableStyleKey(targetBlock.content || {}, resolvedFieldName);
    const blockStyle = styleKey.includes(".")
      ? getValueAtPath(targetBlock.content || {}, styleKey)
      : targetBlock.content?.[styleKey];

    return {
      ...DEFAULT_TEXT_STYLE,
      ...(blockStyle && typeof blockStyle === "object" ? blockStyle : {}),
    };
  }, [findBlockInEditorPages, selectedEditableElement]);

  const selectedEditableTextValue = useMemo(() => {
    if (
      !selectedEditableElement?.blockId ||
      !selectedEditableElement?.fieldPath
    ) {
      return "";
    }

    const targetBlock = findBlockInEditorPages(selectedEditableElement.blockId);
    if (!targetBlock?.content) {
      return selectedEditableElement.value || "";
    }

    const resolvedValue = getValueAtPath(
      targetBlock.content || {},
      selectedEditableElement.fieldPath,
    );

    return typeof resolvedValue === "string"
      ? resolvedValue
      : resolvedValue == null
        ? ""
        : String(resolvedValue);
  }, [findBlockInEditorPages, selectedEditableElement]);

  const selectedStaticTextCanEdit = useMemo(
    () => isBlogHeroContentStaticElement(selectedStaticElement),
    [selectedStaticElement],
  );

  const selectedStaticTextValue = useMemo(() => {
    if (selectedStaticTextCanEdit && selectedStaticElement?.blockId) {
      const contentPath = getBlogHeroStaticContentPath(selectedStaticElement);
      const targetBlock = findBlockInEditorPages(selectedStaticElement.blockId);
      const value = targetBlock
        ? getValueAtPath(targetBlock.content || {}, contentPath)
        : undefined;
      return typeof value === "string"
        ? value
        : value == null
          ? ""
          : String(value);
    }
    return selectedStaticElement?.textValue || "";
  }, [
    findBlockInEditorPages,
    selectedStaticElement,
    selectedStaticTextCanEdit,
  ]);

  const selectedStaticTextStyle = useMemo(() => {
    const key = getStaticStyleDraftKey(selectedStaticElement);
    const draft = key ? staticStyleDrafts[key] || {} : {};

    if (!selectedStaticElement?.computedStyle) {
      return {
        ...DEFAULT_TEXT_STYLE,
        ...draft,
      };
    }

    return {
      ...DEFAULT_TEXT_STYLE,
      color:
        selectedStaticElement.computedStyle.color || DEFAULT_TEXT_STYLE.color,
      backgroundColor:
        selectedStaticElement.computedStyle.backgroundColor ||
        DEFAULT_TEXT_STYLE.backgroundColor,
      fontSize:
        selectedStaticElement.computedStyle.fontSize ||
        DEFAULT_TEXT_STYLE.fontSize,
      fontWeight:
        selectedStaticElement.computedStyle.fontWeight ||
        DEFAULT_TEXT_STYLE.fontWeight,
      textAlign:
        selectedStaticElement.computedStyle.textAlign ||
        DEFAULT_TEXT_STYLE.textAlign,
      textShadow:
        selectedStaticElement.computedStyle.textShadow ||
        DEFAULT_TEXT_STYLE.textShadow,
      fontStyle:
        selectedStaticElement.computedStyle.fontStyle ||
        DEFAULT_TEXT_STYLE.fontStyle,
      lineHeight:
        selectedStaticElement.computedStyle.lineHeight ||
        DEFAULT_TEXT_STYLE.lineHeight,
      letterSpacing:
        selectedStaticElement.computedStyle.letterSpacing ||
        DEFAULT_TEXT_STYLE.letterSpacing,
      wordSpacing:
        selectedStaticElement.computedStyle.wordSpacing ||
        DEFAULT_TEXT_STYLE.wordSpacing,
      textTransform:
        selectedStaticElement.computedStyle.textTransform ||
        DEFAULT_TEXT_STYLE.textTransform,
      textDecoration:
        selectedStaticElement.computedStyle.textDecoration ||
        DEFAULT_TEXT_STYLE.textDecoration,
      paddingTop:
        selectedStaticElement.computedStyle.paddingTop ||
        DEFAULT_TEXT_STYLE.paddingTop,
      paddingBottom:
        selectedStaticElement.computedStyle.paddingBottom ||
        DEFAULT_TEXT_STYLE.paddingBottom,
      paddingLeft:
        selectedStaticElement.computedStyle.paddingLeft ||
        DEFAULT_TEXT_STYLE.paddingLeft,
      paddingRight:
        selectedStaticElement.computedStyle.paddingRight ||
        DEFAULT_TEXT_STYLE.paddingRight,
      marginTop:
        selectedStaticElement.computedStyle.marginTop ||
        DEFAULT_TEXT_STYLE.marginTop,
      marginBottom:
        selectedStaticElement.computedStyle.marginBottom ||
        DEFAULT_TEXT_STYLE.marginBottom,
      marginLeft:
        selectedStaticElement.computedStyle.marginLeft ||
        DEFAULT_TEXT_STYLE.marginLeft,
      marginRight:
        selectedStaticElement.computedStyle.marginRight ||
        DEFAULT_TEXT_STYLE.marginRight,
      borderRadius:
        selectedStaticElement.computedStyle.borderRadius ||
        DEFAULT_TEXT_STYLE.borderRadius,
      borderWidth:
        selectedStaticElement.computedStyle.borderWidth ||
        DEFAULT_TEXT_STYLE.borderWidth,
      borderColor:
        selectedStaticElement.computedStyle.borderColor ||
        DEFAULT_TEXT_STYLE.borderColor,
      ...draft,
    };
  }, [selectedStaticElement, staticStyleDrafts]);

  const selectedStaticContainerStyle = useMemo(() => {
    const key = getStaticStyleDraftKey(selectedStaticElement);
    const draft = key ? staticStyleDrafts[key] || {} : {};

    if (!selectedStaticElement?.computedStyle) {
      return {
        ...DEFAULT_SECTION_STYLE,
        ...draft,
      };
    }

    return {
      ...DEFAULT_SECTION_STYLE,
      backgroundColor:
        selectedStaticElement.computedStyle.backgroundColor ||
        DEFAULT_SECTION_STYLE.backgroundColor,
      contentAlign:
        selectedStaticElement.computedStyle.textAlign ||
        DEFAULT_SECTION_STYLE.contentAlign,
      ...draft,
    };
  }, [selectedStaticElement, staticStyleDrafts]);

  const selectedStaticMediaStyle = useMemo(() => {
    const key = getStaticStyleDraftKey(selectedStaticElement);
    const draft = key ? staticStyleDrafts[key] || {} : {};
    const staticPreviewSrc =
      selectedImageElement?.isStatic &&
      typeof selectedImageElement.src === "string"
        ? selectedImageElement.src
        : selectedStaticElement?.src || "";

    return {
      ...DEFAULT_IMAGE_VALUE,
      src: staticPreviewSrc,
      ...draft,
    };
  }, [selectedStaticElement, selectedImageElement, staticStyleDrafts]);

  const selectedSectionStyle = useMemo(() => {
    if (!selectedSectionElement?.blockId) {
      return DEFAULT_SECTION_STYLE;
    }

    const targetBlock = findBlockInEditorPages(selectedSectionElement.blockId);
    const styleKey = getSectionStyleKey(selectedSectionElement);
    const resolvedStyle = styleKey.includes(".")
      ? getValueAtPath(targetBlock?.content || {}, styleKey)
      : targetBlock?.content?.[styleKey];
    const footerInnerBlockMatch =
      /^innerBlocks\.(\d+)\.content\.cardStyle$/i.exec(styleKey);
    const footerDefaultStyle =
      footerInnerBlockMatch && targetBlock
        ? (() => {
            const innerIndex = Number(footerInnerBlockMatch[1]);
            const innerBlock = Array.isArray(targetBlock.content?.innerBlocks)
              ? targetBlock.content.innerBlocks[innerIndex]
              : null;
            return String(innerBlock?.type || "").toLowerCase() === "footer"
              ? FOOTER_DEFAULT_CARD_STYLE
              : null;
          })()
        : null;
    if (!resolvedStyle || typeof resolvedStyle !== "object") {
      return footerDefaultStyle
        ? {
            ...DEFAULT_SECTION_STYLE,
            ...footerDefaultStyle,
          }
        : DEFAULT_SECTION_STYLE;
    }

    return {
      ...DEFAULT_SECTION_STYLE,
      ...(footerDefaultStyle || {}),
      ...resolvedStyle,
    };
  }, [findBlockInEditorPages, selectedSectionElement]);

  const selectedImageValue = useMemo(() => {
    if (selectedImageElement?.isStatic) {
      return {
        ...DEFAULT_IMAGE_VALUE,
        ...selectedStaticMediaStyle,
        mediaType:
          selectedStaticMediaStyle.mediaType === "video" ||
          selectedStaticMediaStyle.videoUrl
            ? "video"
            : "image",
      };
    }

    if (!selectedImageElement?.blockId || !selectedImageElement?.fieldPath) {
      return DEFAULT_IMAGE_VALUE;
    }

    const targetBlock = findBlockInEditorPages(selectedImageElement.blockId);
    if (!targetBlock?.content) {
      return DEFAULT_IMAGE_VALUE;
    }

    const innerMatch = parseInnerBlockFieldPath(selectedImageElement.fieldPath);
    if (innerMatch) {
      const targetInnerBlock = Array.isArray(targetBlock.content?.innerBlocks)
        ? targetBlock.content.innerBlocks[innerMatch.index]
        : null;
      const targetInnerContent =
        targetInnerBlock?.content &&
        typeof targetInnerBlock.content === "object"
          ? targetInnerBlock.content
          : {};
      const blockStyle =
        targetInnerContent.imageStyle &&
        typeof targetInnerContent.imageStyle === "object"
          ? targetInnerContent.imageStyle
          : {};

      return {
        ...DEFAULT_IMAGE_VALUE,
        src:
          typeof targetInnerContent.src === "string"
            ? targetInnerContent.src
            : selectedImageElement.src || "",
        ...blockStyle,
      };
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
  }, [findBlockInEditorPages, selectedImageElement, selectedStaticMediaStyle]);

  const selectedImagePreviewHeight = useMemo(() => {
    switch (selectedImageValue.heightPreset) {
      case "small":
        return 180;
      case "medium":
        return 260;
      case "large":
        return 340;
      case "custom": {
        const parsed = parseInt(selectedImageValue.customHeight, 10);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : 260;
      }
      default:
        return 260;
    }
  }, [selectedImageValue.heightPreset, selectedImageValue.customHeight]);

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

  const videoLibraryItems = useMemo(() => {
    const items = [];
    const walk = (blockId, value, path = []) => {
      if (Array.isArray(value)) {
        value.forEach((entry, index) =>
          walk(blockId, entry, [...path, String(index)]),
        );
        return;
      }
      if (!value || typeof value !== "object") return;
      Object.entries(value).forEach(([key, entryValue]) => {
        const nextPath = [...path, key];
        if (
          typeof entryValue === "string" &&
          entryValue.trim() &&
          /(video|mp4|webm)/i.test(key) &&
          looksLikeVideoSource(entryValue.trim())
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
    blocks.forEach((block) => walk(block.id, block.content || {}, []));
    // Dedupe by source URL. Reusing one video across several sections (and the
    // just-uploaded copy) otherwise stacks the same clip in the gallery.
    const seen = new Set();
    const deduped = [];
    [...items, ...uploadedLibraryVideos].forEach((item) => {
      const key = String(item?.src || "").trim();
      if (!key || seen.has(key)) return;
      seen.add(key);
      deduped.push(item);
    });
    return deduped;
  }, [blocks, uploadedLibraryVideos]);

  const syncPreviewSelection = useCallback((target) => {
    if (!target) {
      setSelectedPreviewTarget(null);
      return;
    }
    previewSelectionNonceRef.current += 1;
    setSelectedPreviewTarget({
      ...target,
      nonce: previewSelectionNonceRef.current,
    });
  }, []);

  const blockLibraryExtraBlocks = useMemo(() => {
    const extras = [
      {
        key: "WEBSITE_HEADER",
        label: "Website Header",
        description:
          "Responsive header with logo, navigation menu, and CTA button. Supports sticky and transparent modes.",
        category: "core",
        icon: "navbar",
        capabilities: {
          supportsBackground: false,
          supportsVisibility: true,
          supportsVariants: false,
          supportsCustomCss: false,
          isDynamic: false,
          dataSource: null,
        },
        variants: [],
        searchKeywords: [
          "header",
          "navigation",
          "navbar",
          "menu",
          "logo",
          "cta",
          "sticky",
        ],
      },
    ];

    if (resolvedFrontendTemplateId === "company-executive") {
      extras.push({
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
      });
    }

    return extras;
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
    const blockLabel = humanizeLabel(blockType || "Plan Section");
    const normalizedType = normalizeInnerBlockLibraryKey(blockType);
    const shouldSeedInnerBlock =
      normalizedType &&
      normalizedType !== "plan" &&
      normalizedType !== "section" &&
      normalizedType !== "plan_section";
    const seededInnerBlock = shouldSeedInnerBlock
      ? buildInnerBlockFromLibraryItem({
          key: blockType,
          label: blockLabel,
          description: `Customize the ${blockLabel.toLowerCase()} block from the editor.`,
        })
      : null;

    return {
      editorLabel: blockLabel,
      editorBlockType: seededInnerBlock?.type
        ? String(seededInnerBlock.type).toUpperCase()
        : "SECTION",
      editorSection: `plan-${Date.now()}`,
      ...(seededInnerBlock?.content || {}),
      sectionStyle: {
        backgroundColor: "#ffffff",
        layoutWidth: "full",
        heightPreset:
          String(seededInnerBlock?.type || "").toLowerCase() === "video"
            ? "fullscreen"
            : shouldSeedInnerBlock
              ? "auto"
              : "medium",
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
      innerBlocks: seededInnerBlock
        ? [
            {
              id: `inner-${Date.now()}`,
              ...seededInnerBlock,
              content: {
                ...(seededInnerBlock.content || {}),
                ...getDefaultInnerBlockPlacement(seededInnerBlock.type, 0),
              },
            },
          ]
        : [],
    };
  }, []);

  const handlePreviewEditableSelection = useCallback(
    (data) => {
      if (!data) {
        return;
      }

      const innerMatch = parseInnerBlockFieldPath(data.fieldPath);
      if (innerMatch?.contentPath === "__card") {
        setPreviewContextMenu(null);
        setSelectedEditableElement(null);
        setSelectedStaticElement(null);
        setSelectedImageElement(null);
        setIsImageDialogOpen(false);
        setSelectedSectionElement({
          blockId: data.blockId,
          label: data.label || "Section",
          styleKey: `innerBlocks.${innerMatch.index}.content.cardStyle`,
        });
        setActiveToolbarMode("section");
        setIsInspectorOpen(true);
        setBlockDialogOpen(false);
        setEditingBlock(null);
        syncPreviewSelection({
          kind: "section",
          blockId: data.blockId,
          styleKey: `innerBlocks.${innerMatch.index}.content.cardStyle`,
        });
        return;
      }

      setPreviewContextMenu(null);
      setSelectedStaticElement(null);
      setSelectedImageElement(null);
      setIsImageDialogOpen(false);
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
        styleKey: data.styleKey,
      });
    },
    [syncPreviewSelection],
  );

  const handlePreviewSectionSelection = useCallback(
    (data) => {
      setPreviewContextMenu(null);
      if (data) {
        setSelectedEditableElement(null);
      }
      if (data) {
        if (data.targetKind === "static") {
          setSelectedStaticElement(data);
          setSelectedSectionElement(null);
          if (["media", "avatar"].includes(data.staticType || "")) {
            setSelectedImageElement({
              blockId: data.blockId,
              blockType: data.blockType,
              fieldPath: null,
              src: data.src || "",
              label: data.label || "Static media",
              staticId: data.staticId,
              styleKey: data.styleKey || `static.${data.staticId || "media"}`,
              staticType: data.staticType || "media",
              isStatic: true,
              mediaType: "image",
            });
            setActiveToolbarMode("image");
            setIsInspectorOpen(false);
            setIsImageDialogOpen(true);
          } else {
            setSelectedImageElement(null);
            setIsImageDialogOpen(false);
            setActiveToolbarMode(
              data.staticType === "container" ? "section" : "text",
            );
            setIsInspectorOpen(true);
          }
        } else {
          setSelectedStaticElement(null);
          setSelectedSectionElement(data);
          setSelectedImageElement(null);
          setIsImageDialogOpen(false);
          setActiveToolbarMode("section");
          setIsInspectorOpen(true);
        }
        syncPreviewSelection({
          kind: data.targetKind === "static" ? "static" : "section",
          blockId: data.blockId,
          blockType: data.blockType,
          contentPath: data.contentPath,
          styleKey: data.styleKey || "sectionStyle",
          staticId: data.staticId,
          containerId: data.containerId,
          containerStyleId: data.containerStyleId,
          hiddenKey: data.hiddenKey,
          parentSectionId: data.parentSectionId,
          staticType: data.staticType,
        });
      } else {
        setSelectedStaticElement(null);
        setSelectedSectionElement(null);
        syncPreviewSelection(null);
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
      setSelectedStaticElement(null);
      setSelectedEditableElement(null);
      setSelectedImageElement(null);
      setIsImageDialogOpen(false);
      setActiveToolbarMode("section");
      setIsInspectorOpen(true);
      openBlockLibraryAtPosition(
        resolveInsertPositionForSection(data.blockId, position),
      );
    },
    [openBlockLibraryAtPosition, resolveInsertPositionForSection],
  );

  const handlePreviewSectionInnerAddRequest = useCallback((data) => {
    if (!data?.blockId) {
      return;
    }

    setPreviewContextMenu(null);
    setSelectedSectionElement(data);
    setSelectedStaticElement(null);
    setSelectedEditableElement(null);
    setSelectedImageElement(null);
    setIsImageDialogOpen(false);
    setActiveToolbarMode("section");
    setIsInspectorOpen(true);
    setSectionInnerBlockSearch("");
    setIsSectionInnerBlockModalOpen(true);
  }, []);

  const handlePreviewContextMenu = useCallback((data) => {
    setPreviewContextMenu(data);
  }, []);

  const uploadImageAsset = useCallback(
    async (file) => {
      if (!file) {
        return null;
      }

      const validation = await validateWebsiteMediaUpload({
        file,
        websiteId,
        allowedMediaType: "image",
      });
      if (!validation.ok) {
        setSaveToast({
          open: true,
          message: validation.message,
          severity: "error",
        });
        return null;
      }

      const formData = new FormData();
      formData.append("image", file);
      if (websiteId) {
        formData.append("websiteId", String(websiteId));
      }

      try {
        const response = await apiClient.post("/upload/image", formData);
        return normalizeUploadedImageUrl(
          response?.data?.url ||
            response?.data?.fileUrl ||
            response?.data?.data?.url ||
            response?.data?.data?.fileUrl ||
            null,
        );
      } catch (error) {
        setSaveToast({
          open: true,
          message: getRequestErrorMessage(error, "Failed to upload image."),
          severity: "error",
        });
        return null;
      }
    },
    [websiteId],
  );

  const uploadVideoAsset = useCallback(
    async (file) => {
      if (!file) return null;

      const validation = await validateWebsiteMediaUpload({
        file,
        websiteId,
        allowedMediaType: "video",
      });
      if (!validation.ok) {
        setSaveToast({
          open: true,
          message: validation.message,
          severity: "error",
        });
        return null;
      }

      const formData = new FormData();
      formData.append("video", file);
      if (websiteId) {
        formData.append("websiteId", String(websiteId));
      }

      try {
        const response = await apiClient.post("/upload/video", formData);
        const url =
          response?.data?.url ||
          response?.data?.fileUrl ||
          response?.data?.data?.url ||
          null;
        return typeof url === "string" && url.trim() ? url.trim() : null;
      } catch (error) {
        setSaveToast({
          open: true,
          message: getRequestErrorMessage(error, "Failed to upload video."),
          severity: "error",
        });
        return null;
      }
    },
    [websiteId],
  );

  const handlePreviewImageSelection = useCallback(
    (data) => {
      if (!data) {
        return;
      }

      setPreviewContextMenu(null);
      setSelectedEditableElement(null);
      setSelectedStaticElement(null);
      setSelectedImageElement(data);
      setSelectedSectionElement((prev) => prev || null);
      setIsInspectorOpen(false);
      setIsImageDialogOpen(true);
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

  const handlePreviewImageDoubleClick = useCallback((data) => {
    if (!data) {
      return;
    }

    setSelectedStaticElement(null);
    setSelectedImageElement(data);
    setIsImageDialogOpen(true);
  }, []);

  const handlePreviewElementTransform = useCallback(
    (target, patch) => {
      if (!target?.blockId || !patch) {
        return;
      }

      if (!historyBootstrappedRef.current) {
        pushHistory(blocksRef.current, "Initial page state");
        historyBootstrappedRef.current = true;
      }
      if (!previewTransformHistoryPrimedRef.current) {
        pushHistory(blocksRef.current, "Before transform");
        previewTransformHistoryPrimedRef.current = true;
      }
      if (previewTransformHistoryTimerRef.current) {
        clearTimeout(previewTransformHistoryTimerRef.current);
      }

      pendingHistoryDescriptionRef.current =
        target.kind === "section"
          ? "Moved or resized section"
          : target.kind === "static"
            ? "Moved or resized static element"
            : target.kind === "image"
              ? "Moved or resized image"
              : "Moved or resized text";

      suppressHistoryRef.current = true;
      const nextBlocks = blocksRef.current.map((block) => {
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

        if (target.kind === "static") {
          return block;
        }

        if (target.kind === "image" && target.fieldPath) {
          const innerBlockMatch =
            /^innerBlocks\.(\d+)\.content(?:\.[^.]+)?$/i.exec(target.fieldPath);
          if (innerBlockMatch) {
            const innerIndex = Number(innerBlockMatch[1]);
            const existingInnerBlocks = Array.isArray(
              block.content?.innerBlocks,
            )
              ? block.content.innerBlocks
              : [];
            const existingInnerBlock = existingInnerBlocks[innerIndex] || {};
            const existingInnerContent =
              existingInnerBlock.content &&
              typeof existingInnerBlock.content === "object"
                ? existingInnerBlock.content
                : {};
            const existingStyle =
              existingInnerContent.imageStyle &&
              typeof existingInnerContent.imageStyle === "object"
                ? existingInnerContent.imageStyle
                : {};

            return withSyncedInnerBlocks(
              block,
              setValueAtPath(
                existingInnerBlocks,
                `${innerIndex}.content.imageStyle`,
                {
                  ...existingStyle,
                  ...patch,
                },
              ),
            );
          }

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
          const innerBlockMatch = parseInnerBlockFieldPath(target.fieldPath);
          if (innerBlockMatch) {
            const innerIndex = innerBlockMatch.index;
            const fieldName = innerBlockMatch.contentPath || "text";
            const existingInnerBlocks = Array.isArray(
              block.content?.innerBlocks,
            )
              ? block.content.innerBlocks
              : [];
            const existingInnerBlock = existingInnerBlocks[innerIndex] || {};
            const styleKey = getInnerBlockStyleKey(
              existingInnerBlock,
              fieldName,
            );
            const existingInnerContent =
              existingInnerBlock.content &&
              typeof existingInnerBlock.content === "object"
                ? existingInnerBlock.content
                : {};
            const resolvedExistingStyle = styleKey.includes(".")
              ? getValueAtPath(existingInnerContent, styleKey)
              : existingInnerContent[styleKey];
            const existingStyle =
              resolvedExistingStyle && typeof resolvedExistingStyle === "object"
                ? resolvedExistingStyle
                : {};

            return withSyncedInnerBlocks(
              block,
              setValueAtPath(
                existingInnerBlocks,
                `${innerIndex}.content.${styleKey}`,
                {
                  ...existingStyle,
                  ...patch,
                },
              ),
            );
          }

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
      });

      blocksRef.current = nextBlocks;
      flushSync(() => {
        setBlocks(nextBlocks);
      });

      previewTransformHistoryTimerRef.current = setTimeout(() => {
        previewTransformHistoryPrimedRef.current = false;
        pushHistory(
          blocksRef.current,
          pendingHistoryDescriptionRef.current || "Moved element",
        );
      }, 180);
    },
    [pushHistory],
  );

  const handleContextMenuLayerSelect = useCallback(
    (layer) => {
      if (!layer) {
        return;
      }

      if (layer.kind === "editable" && layer.editable) {
        handlePreviewEditableSelection(layer.editable);
      } else if (layer.kind === "image" && layer.image) {
        handlePreviewImageSelection(layer.image);
      } else if (
        (layer.kind === "section" || layer.kind === "static") &&
        layer.section
      ) {
        handlePreviewSectionSelection(layer.section);
      }

      setPreviewContextMenu((prev) =>
        prev
          ? {
              ...prev,
              target: layer,
              targetLayer: layer,
            }
          : prev,
      );
    },
    [
      handlePreviewEditableSelection,
      handlePreviewImageSelection,
      handlePreviewSectionSelection,
    ],
  );

  const buildPreviewClipboardItem = useCallback((layer) => {
    if (!layer) {
      return null;
    }

    if (layer.kind === "section" && layer.section?.blockId) {
      const block = blocksRef.current.find(
        (entry) => String(entry.id) === String(layer.section.blockId),
      );
      if (!block) {
        return null;
      }

      return {
        type: "section",
        label: layer.label || block.blockType || "Section",
        block: deepClone(block),
      };
    }

    if (layer.kind === "editable" && layer.editable?.blockId) {
      const block = blocksRef.current.find(
        (entry) => String(entry.id) === String(layer.editable.blockId),
      );
      if (!block) {
        return null;
      }

      const innerMatch = parseInnerBlockFieldPath(layer.editable.fieldPath);
      if (innerMatch) {
        const innerBlocks = Array.isArray(block.content?.innerBlocks)
          ? block.content.innerBlocks
          : [];
        const innerBlock = innerBlocks[innerMatch.index];
        if (!innerBlock) {
          return null;
        }

        return {
          type: "innerBlock",
          label: layer.label || innerBlock.label || "Block",
          innerBlock: deepClone(innerBlock),
        };
      }

      return {
        type: "editableValue",
        label: layer.label || humanizeLabel(layer.editable.fieldPath),
        value: getValueAtPath(block.content || {}, layer.editable.fieldPath),
      };
    }

    if (layer.kind === "image" && layer.image?.blockId) {
      const block = blocksRef.current.find(
        (entry) => String(entry.id) === String(layer.image.blockId),
      );
      if (!block) {
        return null;
      }

      const innerMatch = parseInnerBlockFieldPath(layer.image.fieldPath);
      if (innerMatch) {
        const innerBlocks = Array.isArray(block.content?.innerBlocks)
          ? block.content.innerBlocks
          : [];
        const innerBlock = innerBlocks[innerMatch.index];
        if (!innerBlock) {
          return null;
        }

        return {
          type: "innerBlock",
          label: layer.label || innerBlock.label || "Image",
          innerBlock: deepClone(innerBlock),
        };
      }

      return {
        type: "imageValue",
        label: layer.label || humanizeLabel(layer.image.fieldPath),
        src: getValueAtPath(block.content || {}, layer.image.fieldPath),
      };
    }

    return null;
  }, []);

  // Persistently delete a single field-path target from a block. Shared by the
  // editable / image / static delete branches so context menu and layers menu
  // behave identically. Resolution order:
  //   1. inner block  -> drop the innerBlock entry
  //   2. array item   -> remove the whole array element (features[1],
  //                      detailGroups.0.items.2, socialProof.avatars.0, ...)
  //   3. single field -> record it in block.content.hiddenElements so the
  //                      element disappears and does NOT revert to its template
  //                      default (the old behaviour blanked the value to "",
  //                      which templates fell back over via `value || "Default"`).
  const deleteFieldPathFromBlock = useCallback(
    (blockId, fieldPath, options = {}) => {
      if (!blockId || !fieldPath) {
        return false;
      }
      const { hideOnly = false } = options;

      const innerMatch = parseInnerBlockFieldPath(fieldPath);
      if (innerMatch) {
        pendingHistoryDescriptionRef.current = "Deleted block";
        setBlocks((prev) =>
          prev.map((block) => {
            if (String(block.id) !== String(blockId)) {
              return block;
            }
            const innerBlocks = Array.isArray(block.content?.innerBlocks)
              ? block.content.innerBlocks
              : [];
            return withSyncedInnerBlocks(
              block,
              innerBlocks.filter((_, index) => index !== innerMatch.index),
            );
          }),
        );
        return true;
      }

      // `hideOnly` (used for images/media): deleting an image removes just the
      // image, never the array item/card it lives in — that is the job of the
      // card/container delete. It also avoids unmounting a deep array-item
      // subtree, which is what triggered a React commit-phase removeChild crash.
      const targetBlock = blocksRef.current.find(
        (entry) => String(entry.id) === String(blockId),
      );
      const arrayContent =
        !hideOnly && targetBlock
          ? removeArrayItemAtFieldPath(targetBlock.content || {}, fieldPath)
          : null;

      if (arrayContent != null) {
        pendingHistoryDescriptionRef.current = "Deleted element";
        setBlocks((prev) =>
          prev.map((block) =>
            String(block.id) === String(blockId)
              ? withSyncedBlockContent(block, arrayContent)
              : block,
          ),
        );
        return true;
      }

      pendingHistoryDescriptionRef.current = "Deleted element";
      setBlocks((prev) =>
        prev.map((block) =>
          String(block.id) === String(blockId)
            ? withSyncedBlockContent(
                block,
                markElementHidden(block.content || {}, fieldPath),
              )
            : block,
        ),
      );
      return true;
    },
    [],
  );

  const handleDeletePreviewLayer = useCallback(
    (layer) => {
      if (!layer) {
        return;
      }

      if (layer.kind === "section" && layer.section?.blockId) {
        pendingHistoryDescriptionRef.current = "Deleted section";
        setBlocks((prev) =>
          prev.filter(
            (block) => String(block.id) !== String(layer.section.blockId),
          ),
        );
        setSelectedSectionElement(null);
        setSelectedEditableElement(null);
        setSelectedImageElement(null);
        setSelectedStaticElement(null);
        setSelectedPreviewTarget(null);
        setIsImageDialogOpen(false);
        setPreviewContextMenu(null);
        return;
      }

      if (layer.kind === "editable" && layer.editable?.blockId) {
        deleteFieldPathFromBlock(
          layer.editable.blockId,
          layer.editable.fieldPath,
        );
        setSelectedEditableElement(null);
        setSelectedPreviewTarget(null);
        setPreviewContextMenu(null);
        return;
      }

      if (layer.kind === "image" && layer.image?.blockId) {
        deleteFieldPathFromBlock(layer.image.blockId, layer.image.fieldPath, {
          hideOnly: true,
        });
        setSelectedImageElement(null);
        setSelectedPreviewTarget(null);
        setIsImageDialogOpen(false);
        setPreviewContextMenu(null);
        return;
      }

      // Static / container target (div, wrapper, card, decorative container).
      // Resolution order:
      //   1. mapped media/text field (fieldPath/contentPath) -> hide field / remove item
      //   2. array-item container/card (staticId "features.0.__card") -> remove features[0]
      //   3. any other container (fixed EditableContainer OR auto-detected
      //      "fallback-*" wrapper) -> persistently hide the WHOLE container and
      //      its children/styles by its stable container id (data-static-id),
      //      recorded in block.content.hiddenContainers.
      if (layer.kind === "static" && layer.section?.blockId) {
        const blockId = layer.section.blockId;
        const rawStaticId = String(layer.section.staticId || "");
        const directFieldPath =
          layer.section.fieldPath || layer.section.contentPath || null;
        const hiddenContainerId =
          layer.section.containerStyleId ||
          layer.section.containerId ||
          rawStaticId;
        const derivedFromStaticId = rawStaticId
          .replace(/\.__container$/, "")
          .replace(/\.__card$/, "");
        const isDerivedContentPath =
          derivedFromStaticId && derivedFromStaticId !== rawStaticId;

        const targetBlock = blocksRef.current.find(
          (entry) => String(entry.id) === String(blockId),
        );
        const arrayContent =
          !directFieldPath && isDerivedContentPath && targetBlock
            ? removeArrayItemAtFieldPath(
                targetBlock.content || {},
                derivedFromStaticId,
              )
            : null;

        if (directFieldPath) {
          deleteFieldPathFromBlock(blockId, directFieldPath);
        } else if (arrayContent != null) {
          pendingHistoryDescriptionRef.current = "Deleted element";
          setBlocks((prev) =>
            prev.map((block) =>
              String(block.id) === String(blockId)
                ? withSyncedBlockContent(block, arrayContent)
                : block,
            ),
          );
        } else if (hiddenContainerId) {
          pendingHistoryDescriptionRef.current = "Deleted container";
          setBlocks((prev) =>
            prev.map((block) =>
              String(block.id) === String(blockId)
                ? withSyncedBlockContent(
                    block,
                    markContainerHidden(block.content || {}, hiddenContainerId),
                  )
                : block,
            ),
          );
        }

        setSelectedSectionElement(null);
        setSelectedStaticElement(null);
        setSelectedImageElement(null);
        setSelectedPreviewTarget(null);
        setIsImageDialogOpen(false);
        setPreviewContextMenu(null);
        return;
      }
    },
    [deleteFieldPathFromBlock],
  );

  const handleDuplicatePreviewLayer = useCallback((layer) => {
    if (!layer) {
      return;
    }

    if (layer.kind === "section" && layer.section?.blockId) {
      pendingHistoryDescriptionRef.current = "Duplicated section";
      setBlocks((prev) => {
        const index = prev.findIndex(
          (block) => String(block.id) === String(layer.section.blockId),
        );
        if (index < 0) {
          return prev;
        }

        const duplicate = deepClone(prev[index]);
        duplicate.id = `section-copy-${Date.now()}`;
        return [
          ...prev.slice(0, index + 1),
          duplicate,
          ...prev.slice(index + 1),
        ];
      });
      setPreviewContextMenu(null);
      return;
    }

    const appendInnerBlockToSection = (
      sectionBlockId,
      innerBlock,
      afterIndex,
    ) => {
      setBlocks((prev) =>
        prev.map((block) => {
          if (String(block.id) !== String(sectionBlockId)) {
            return block;
          }

          const innerBlocks = Array.isArray(block.content?.innerBlocks)
            ? block.content.innerBlocks
            : [];
          const duplicate = {
            ...deepClone(innerBlock),
            id: `inner-${Date.now()}`,
          };

          const nextInnerBlocks = [...innerBlocks];
          if (typeof afterIndex === "number") {
            nextInnerBlocks.splice(afterIndex + 1, 0, duplicate);
          } else {
            nextInnerBlocks.push(duplicate);
          }

          return {
            ...block,
            content: {
              ...block.content,
              innerBlocks: nextInnerBlocks,
            },
          };
        }),
      );
    };

    if (layer.kind === "editable" && layer.editable?.blockId) {
      const block = blocksRef.current.find(
        (entry) => String(entry.id) === String(layer.editable.blockId),
      );
      const innerMatch = parseInnerBlockFieldPath(layer.editable.fieldPath);
      if (block && innerMatch) {
        const innerBlocks = Array.isArray(block.content?.innerBlocks)
          ? block.content.innerBlocks
          : [];
        const innerBlock = innerBlocks[innerMatch.index];
        if (innerBlock) {
          pendingHistoryDescriptionRef.current = "Duplicated block";
          appendInnerBlockToSection(
            layer.editable.blockId,
            innerBlock,
            innerMatch.index,
          );
        }
      } else if (block) {
        const value = getValueAtPath(
          block.content || {},
          layer.editable.fieldPath,
        );
        const { styleKey } = getEditableStyleConfig(layer.editable.fieldPath);
        const existingStyle =
          block.content?.[styleKey] &&
          typeof block.content[styleKey] === "object"
            ? deepClone(block.content[styleKey])
            : {};
        const duplicatedType =
          styleKey === "headingStyle"
            ? "heading"
            : styleKey === "buttonTextStyle"
              ? "button"
              : styleKey === "eyebrowStyle"
                ? "eyebrow"
                : "text";
        pendingHistoryDescriptionRef.current = "Duplicated text";
        appendInnerBlockToSection(layer.editable.blockId, {
          id: `inner-${Date.now()}`,
          type: duplicatedType,
          label:
            layer.label ||
            (duplicatedType === "heading"
              ? "Heading"
              : duplicatedType === "button"
                ? "Button"
                : duplicatedType === "eyebrow"
                  ? "Label"
                  : "Text"),
          content:
            duplicatedType === "button"
              ? {
                  text: typeof value === "string" ? value : "",
                  href: "#",
                  buttonTextStyle: existingStyle,
                }
              : duplicatedType === "heading"
                ? {
                    text: typeof value === "string" ? value : "",
                    headingStyle: existingStyle,
                  }
                : duplicatedType === "eyebrow"
                  ? {
                      text: typeof value === "string" ? value : "",
                      textStyle: existingStyle,
                    }
                  : {
                      text: typeof value === "string" ? value : "",
                      textStyle: existingStyle,
                    },
        });
      }

      setPreviewContextMenu(null);
      return;
    }

    if (layer.kind === "image" && layer.image?.blockId) {
      const block = blocksRef.current.find(
        (entry) => String(entry.id) === String(layer.image.blockId),
      );
      const innerMatch = parseInnerBlockFieldPath(layer.image.fieldPath);
      if (block && innerMatch) {
        const innerBlocks = Array.isArray(block.content?.innerBlocks)
          ? block.content.innerBlocks
          : [];
        const innerBlock = innerBlocks[innerMatch.index];
        if (innerBlock) {
          pendingHistoryDescriptionRef.current = "Duplicated block";
          appendInnerBlockToSection(
            layer.image.blockId,
            innerBlock,
            innerMatch.index,
          );
        }
      } else if (block) {
        const src = getValueAtPath(block.content || {}, layer.image.fieldPath);
        pendingHistoryDescriptionRef.current = "Duplicated image";
        appendInnerBlockToSection(layer.image.blockId, {
          id: `inner-${Date.now()}`,
          type: "image",
          label: layer.label || "Image",
          content: {
            src: typeof src === "string" ? src : "",
            alt: layer.label || "Image",
          },
        });
      }

      setPreviewContextMenu(null);
    }
  }, []);

  const handlePasteIntoPreviewTarget = useCallback(
    (layer) => {
      if (!previewClipboard) {
        return;
      }

      const finalizePaste = () => {
        if (previewClipboard?.mode === "cut") {
          setPreviewClipboard(null);
        }
        setPreviewContextMenu(null);
      };

      const resolveTargetSectionBlockId = () => {
        if (layer?.kind === "section" && layer.section?.blockId) {
          return layer.section.blockId;
        }
        if (layer?.kind === "editable" && layer.editable?.blockId) {
          return layer.editable.blockId;
        }
        if (layer?.kind === "image" && layer.image?.blockId) {
          return layer.image.blockId;
        }
        return selectedSectionElement?.blockId || null;
      };

      const targetSectionBlockId = resolveTargetSectionBlockId();

      if (previewClipboard.type === "section" && previewClipboard.block) {
        const anchorBlockId =
          layer?.kind === "section"
            ? layer.section?.blockId
            : targetSectionBlockId;
        pendingHistoryDescriptionRef.current = "Pasted section";
        setBlocks((prev) => {
          const duplicate = {
            ...deepClone(previewClipboard.block),
            id: `section-copy-${Date.now()}`,
          };
          const anchorIndex = prev.findIndex(
            (block) => String(block.id) === String(anchorBlockId),
          );
          if (anchorIndex < 0) {
            return [...prev, duplicate];
          }
          return [
            ...prev.slice(0, anchorIndex + 1),
            duplicate,
            ...prev.slice(anchorIndex + 1),
          ];
        });
        finalizePaste();
        return;
      }

      if (!targetSectionBlockId) {
        return;
      }

      if (
        previewClipboard.type === "innerBlock" &&
        previewClipboard.innerBlock
      ) {
        pendingHistoryDescriptionRef.current = "Pasted block";
        setBlocks((prev) =>
          prev.map((block) => {
            if (String(block.id) !== String(targetSectionBlockId)) {
              return block;
            }

            const innerBlocks = Array.isArray(block.content?.innerBlocks)
              ? block.content.innerBlocks
              : [];
            return withSyncedInnerBlocks(block, [
              ...innerBlocks,
              {
                ...deepClone(previewClipboard.innerBlock),
                id: `inner-${Date.now()}`,
              },
            ]);
          }),
        );
        finalizePaste();
        return;
      }

      if (
        previewClipboard.type === "editableValue" &&
        layer?.kind === "editable" &&
        layer.editable?.fieldPath
      ) {
        pendingHistoryDescriptionRef.current = "Pasted text";
        setBlocks((prev) =>
          prev.map((block) =>
            String(block.id) === String(layer.editable.blockId)
              ? withSyncedBlockContent(
                  block,
                  setValueAtPath(
                    { ...(block.content || {}) },
                    layer.editable.fieldPath,
                    previewClipboard.value ?? "",
                  ),
                )
              : block,
          ),
        );
        finalizePaste();
        return;
      }

      if (
        previewClipboard.type === "imageValue" &&
        layer?.kind === "image" &&
        layer.image?.fieldPath
      ) {
        pendingHistoryDescriptionRef.current = "Pasted image";
        setBlocks((prev) =>
          prev.map((block) =>
            String(block.id) === String(layer.image.blockId)
              ? withSyncedBlockContent(
                  block,
                  setValueAtPath(
                    { ...(block.content || {}) },
                    layer.image.fieldPath,
                    previewClipboard.src ?? "",
                  ),
                )
              : block,
          ),
        );
        finalizePaste();
        return;
      }

      if (previewClipboard.type === "editableValue") {
        pendingHistoryDescriptionRef.current = "Pasted text block";
        setBlocks((prev) =>
          prev.map((block) => {
            if (String(block.id) !== String(targetSectionBlockId)) {
              return block;
            }

            const innerBlocks = Array.isArray(block.content?.innerBlocks)
              ? block.content.innerBlocks
              : [];
            return withSyncedInnerBlocks(block, [
              ...innerBlocks,
              {
                id: `inner-${Date.now()}`,
                type: "text",
                label: previewClipboard.label || "Text",
                content: {
                  text:
                    typeof previewClipboard.value === "string"
                      ? previewClipboard.value
                      : "",
                },
              },
            ]);
          }),
        );
        finalizePaste();
        return;
      }

      if (previewClipboard.type === "imageValue") {
        pendingHistoryDescriptionRef.current = "Pasted image block";
        setBlocks((prev) =>
          prev.map((block) => {
            if (String(block.id) !== String(targetSectionBlockId)) {
              return block;
            }

            const innerBlocks = Array.isArray(block.content?.innerBlocks)
              ? block.content.innerBlocks
              : [];
            return withSyncedInnerBlocks(block, [
              ...innerBlocks,
              {
                id: `inner-${Date.now()}`,
                type: "image",
                label: previewClipboard.label || "Image",
                content: {
                  src:
                    typeof previewClipboard.src === "string"
                      ? previewClipboard.src
                      : "",
                  alt: previewClipboard.label || "Image",
                },
              },
            ]);
          }),
        );
        finalizePaste();
      }
    },
    [previewClipboard, selectedSectionElement],
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
      const innerMatch = parseInnerBlockFieldPath(fieldPath);
      const resolvedFieldName = innerMatch?.contentPath || fieldPath;

      pendingHistoryDescriptionRef.current = `Styled ${fieldPath}`;
      updateBlockInEditorState(blockId, (block) => {
        if (innerMatch) {
          const existingInnerBlocks = Array.isArray(block.content?.innerBlocks)
            ? block.content.innerBlocks
            : [];
          const existingInnerBlock =
            existingInnerBlocks[innerMatch.index] || {};
          const styleKey = getInnerBlockStyleKey(
            existingInnerBlock,
            resolvedFieldName,
          );
          const existingInnerContent =
            existingInnerBlock.content &&
            typeof existingInnerBlock.content === "object"
              ? existingInnerBlock.content
              : {};
          const resolvedExistingStyle = styleKey.includes(".")
            ? getValueAtPath(existingInnerContent, styleKey)
            : existingInnerContent[styleKey];
          const existingStyle =
            resolvedExistingStyle && typeof resolvedExistingStyle === "object"
              ? resolvedExistingStyle
              : {};

          return withSyncedInnerBlocks(
            block,
            setValueAtPath(
              existingInnerBlocks,
              `${innerMatch.index}.content.${styleKey}`,
              {
                ...existingStyle,
                ...patch,
              },
            ),
          );
        }

        const styleKey =
          selectedEditableElement.styleKey ||
          getResolvedEditableStyleKey(block.content || {}, resolvedFieldName);
        const resolvedExistingStyle = styleKey.includes(".")
          ? getValueAtPath(block.content || {}, styleKey)
          : block.content?.[styleKey];
        const existingStyle =
          resolvedExistingStyle && typeof resolvedExistingStyle === "object"
            ? resolvedExistingStyle
            : {};

        return withSyncedBlockContent(
          block,
          styleKey.includes(".")
            ? setValueAtPath(block.content || {}, styleKey, {
                ...existingStyle,
                ...patch,
              })
            : {
                ...block.content,
                [styleKey]: {
                  ...existingStyle,
                  ...patch,
                },
              },
        );
      });
    },
    [selectedEditableElement, updateBlockInEditorState],
  );

  const handleStaticStyleChange = useCallback(
    (patch) => {
      const key = getStaticStyleDraftKey(selectedStaticElement);
      if (!key || !patch) {
        return;
      }
      const isPersistentContainer =
        selectedStaticElement?.staticType === "container" ||
        selectedStaticElement?.staticType === "card" ||
        selectedStaticElement?.styleKey === "containerStyles";
      const resolvedPatch = isPersistentContainer
        ? {
            ...patch,
            ...(Object.prototype.hasOwnProperty.call(patch, "backgroundType")
              ? { backgroundType: normalizeContainerBackgroundType(patch) }
              : {}),
          }
        : patch;

      if (!isPersistentContainer) {
        pushStaticOverrideHistory();
      }

      if (
        isPersistentContainer &&
        selectedStaticElement?.blockId &&
        selectedStaticElement?.staticId
      ) {
        pendingHistoryDescriptionRef.current =
          `Styled container ${selectedStaticElement.label || ""}`.trim();
        setBlocks((previousBlocks) =>
          previousBlocks.map((block) => {
            if (String(block.id) !== String(selectedStaticElement.blockId)) {
              return block;
            }
            const existingContainerStyles =
              block.content?.containerStyles &&
              typeof block.content.containerStyles === "object" &&
              !Array.isArray(block.content.containerStyles)
                ? block.content.containerStyles
                : {};
            const existingStyle =
              existingContainerStyles[selectedStaticElement.staticId] &&
              typeof existingContainerStyles[selectedStaticElement.staticId] ===
                "object"
                ? existingContainerStyles[selectedStaticElement.staticId]
                : {};

            return withSyncedBlockContent(block, {
              ...(block.content || {}),
              containerStyles: {
                ...existingContainerStyles,
                [selectedStaticElement.staticId]: {
                  ...existingStyle,
                  ...resolvedPatch,
                },
              },
            });
          }),
        );
      }

      if (
        !isPersistentContainer &&
        websiteId != null &&
        selectedPage?.id != null &&
        selectedStaticElement?.blockId &&
        selectedStaticElement?.staticId
      ) {
        const storedKey = buildStoredStaticStyleOverrideKey(
          websiteId,
          selectedPage.id,
          selectedStaticElement.blockId,
          selectedStaticElement.styleKey || "sectionStyle",
          selectedStaticElement.staticId,
        );
        const currentDraft = staticStyleDrafts[key] || {};
        storeStaticStyleOverride(storedKey, {
          ...currentDraft,
          ...resolvedPatch,
        });
      }

      if (
        !isPersistentContainer &&
        selectedStaticElement?.blockId &&
        selectedStaticElement?.staticId
      ) {
        const styleKey = selectedStaticElement.styleKey || "sectionStyle";
        const staticStyleKey = `${styleKey}::${selectedStaticElement.staticId}`;
        setBlocks((previousBlocks) =>
          previousBlocks.map((block) => {
            if (
              String(block.id) !== String(selectedStaticElement.blockId) ||
              !isBlogStaticStyleBlock(block)
            ) {
              return block;
            }
            const existingStaticStyles =
              block.content?.staticStyles &&
              typeof block.content.staticStyles === "object" &&
              !Array.isArray(block.content.staticStyles)
                ? block.content.staticStyles
                : {};
            const existingStyle =
              existingStaticStyles[staticStyleKey] &&
              typeof existingStaticStyles[staticStyleKey] === "object"
                ? existingStaticStyles[staticStyleKey]
                : {};

            return withSyncedBlockContent(block, {
              ...(block.content || {}),
              staticStyles: {
                ...existingStaticStyles,
                [staticStyleKey]: {
                  ...existingStyle,
                  ...resolvedPatch,
                },
              },
            });
          }),
        );
      }

      setStaticStyleDrafts((prev) => ({
        ...prev,
        [key]: {
          ...(prev[key] || {}),
          ...resolvedPatch,
        },
      }));
    },
    [
      pushStaticOverrideHistory,
      selectedPage?.id,
      selectedStaticElement,
      staticStyleDrafts,
      websiteId,
    ],
  );

  const handleStaticMediaStyleChange = useCallback(
    (patch) => {
      const key = getStaticStyleDraftKey(selectedStaticElement);
      if (!key || !patch) {
        return;
      }
      pushStaticOverrideHistory();

      setStaticStyleDrafts((prev) => ({
        ...prev,
        [key]: {
          ...(prev[key] || {}),
          ...patch,
        },
      }));
    },
    [pushStaticOverrideHistory, selectedStaticElement],
  );

  const applyStaticMediaOverrideToPreview = useCallback(
    (selection, override) => {
      const iframeDoc = iframeRef.current?.contentDocument || null;
      if (
        !iframeDoc ||
        !selection?.blockId ||
        !selection?.staticId ||
        !override
      ) {
        return;
      }

      const escapedBlockId =
        typeof CSS !== "undefined" && typeof CSS.escape === "function"
          ? CSS.escape(String(selection.blockId))
          : String(selection.blockId);
      const escapedStaticId =
        typeof CSS !== "undefined" && typeof CSS.escape === "function"
          ? CSS.escape(String(selection.staticId))
          : String(selection.staticId);
      const selector = [
        `[data-static-selectable="true"][data-preview-block-id="${escapedBlockId}"][data-static-id="${escapedStaticId}"]`,
        `[data-preview-block-id="${escapedBlockId}"][data-fallback-id="${escapedStaticId}"]`,
        `[data-static-id="${escapedStaticId}"]`,
        `[data-fallback-id="${escapedStaticId}"]`,
      ].join(", ");
      const elements = Array.from(iframeDoc.querySelectorAll(selector));

      const resolvedHeight =
        typeof override.customHeight === "string" && override.customHeight
          ? override.customHeight
          : override.heightPreset === "small"
            ? "180px"
            : override.heightPreset === "medium"
              ? "260px"
              : override.heightPreset === "large"
                ? "340px"
                : override.heightPreset === "auto" || !override.heightPreset
                  ? undefined
                  : undefined;

      elements.forEach((element) => {
        const mediaTargets =
          element instanceof HTMLImageElement ||
          element instanceof HTMLVideoElement
            ? [element]
            : Array.from(element.querySelectorAll("img, video"));

        if (typeof override.src === "string" && override.src.trim()) {
          const nextSrc = override.src.trim();
          if (mediaTargets.length > 0) {
            mediaTargets.forEach((mediaEl) => {
              if (mediaEl instanceof HTMLImageElement) {
                mediaEl.setAttribute("src", nextSrc);
                mediaEl.setAttribute("data-image-src", nextSrc);
                mediaEl.removeAttribute("srcset");
                mediaEl.removeAttribute("sizes");
                mediaEl.src = nextSrc;
              }
            });
          } else if (element instanceof HTMLElement) {
            element.style.backgroundImage = `url(${nextSrc})`;
            element.setAttribute("data-image-src", nextSrc);
          }
        }

        if (element instanceof HTMLElement) {
          if (override.borderRadius)
            element.style.borderRadius = String(override.borderRadius);
          if (override.borderWidth) {
            element.style.borderWidth = String(override.borderWidth);
            element.style.borderStyle = String(override.borderStyle || "solid");
          }
          if (override.borderColor)
            element.style.borderColor = String(override.borderColor);
          if (override.width) element.style.width = String(override.width);
          if (override.height || resolvedHeight) {
            element.style.height = String(override.height || resolvedHeight);
          }
        }

        mediaTargets.forEach((mediaEl) => {
          if (!(mediaEl instanceof HTMLElement)) {
            return;
          }
          if (override.objectFit)
            mediaEl.style.objectFit = String(override.objectFit);
          if (override.borderRadius)
            mediaEl.style.borderRadius = String(override.borderRadius);
          if (override.borderWidth) {
            mediaEl.style.borderWidth = String(override.borderWidth);
            mediaEl.style.borderStyle = String(override.borderStyle || "solid");
          }
          if (override.borderColor)
            mediaEl.style.borderColor = String(override.borderColor);
          if (override.width) mediaEl.style.width = String(override.width);
          if (override.height || resolvedHeight) {
            mediaEl.style.height = String(override.height || resolvedHeight);
          }
        });
      });
    },
    [],
  );

  const updateStaticMediaOverride = useCallback(
    (selection, patch) => {
      const key = getStaticMediaOverrideKey(
        websiteId,
        selectedPage?.id,
        selection,
      );
      if (!key || !patch) {
        return;
      }

      setStaticMediaOverrides((prev) => ({
        ...prev,
        [key]: {
          ...(prev[key] || {}),
          ...patch,
        },
      }));
      storeStaticMediaOverride(key, {
        ...(staticMediaOverrides[key] || {}),
        ...patch,
      });
      applyStaticMediaOverrideToPreview(selection, patch);
    },
    [
      applyStaticMediaOverrideToPreview,
      selectedPage?.id,
      staticMediaOverrides,
      websiteId,
    ],
  );

  useEffect(() => {
    if (!selectedImageElement?.isStatic) {
      return;
    }

    const selection = selectedStaticElement || selectedImageElement;
    const key = getStaticMediaOverrideKey(
      websiteId,
      selectedPage?.id,
      selection,
    );
    if (!key) {
      return;
    }

    const override = staticMediaOverrides[key];
    if (!override) {
      return;
    }

    applyStaticMediaOverrideToPreview(selection, override);
  }, [
    applyStaticMediaOverrideToPreview,
    selectedImageElement,
    selectedPage?.id,
    selectedStaticElement,
    staticMediaOverrides,
    websiteId,
  ]);

  const handleImageChange = useCallback(
    (patch) => {
      if (selectedImageElement?.isStatic) {
        const key = getStaticStyleDraftKey(
          selectedStaticElement || selectedImageElement,
        );
        if (!key) {
          return;
        }
        pushStaticOverrideHistory();

        setStaticStyleDrafts((prev) => ({
          ...prev,
          [key]: {
            ...(prev[key] || {}),
            ...(typeof patch.src === "string" ? { src: patch.src } : {}),
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
            ...(typeof patch.heightPreset === "string"
              ? { heightPreset: patch.heightPreset }
              : {}),
            ...(typeof patch.customHeight === "string"
              ? { customHeight: patch.customHeight }
              : {}),
            ...(typeof patch.mediaType === "string"
              ? { mediaType: patch.mediaType }
              : {}),
            ...(typeof patch.videoUrl === "string"
              ? { videoUrl: patch.videoUrl }
              : {}),
            ...(typeof patch.videoPoster === "string"
              ? { videoPoster: patch.videoPoster }
              : {}),
            ...(typeof patch.videoAutoplay === "boolean"
              ? { videoAutoplay: patch.videoAutoplay }
              : {}),
            ...(typeof patch.videoMuted === "boolean"
              ? { videoMuted: patch.videoMuted }
              : {}),
            ...(typeof patch.videoLoop === "boolean"
              ? { videoLoop: patch.videoLoop }
              : {}),
            ...(typeof patch.videoControls === "boolean"
              ? { videoControls: patch.videoControls }
              : {}),
          },
        }));
        updateStaticMediaOverride(
          selectedStaticElement || selectedImageElement,
          {
            ...(typeof patch.src === "string" ? { src: patch.src } : {}),
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
            ...(typeof patch.heightPreset === "string"
              ? { heightPreset: patch.heightPreset }
              : {}),
            ...(typeof patch.customHeight === "string"
              ? { customHeight: patch.customHeight }
              : {}),
            ...(typeof patch.mediaType === "string"
              ? { mediaType: patch.mediaType }
              : {}),
            ...(typeof patch.videoUrl === "string"
              ? { videoUrl: patch.videoUrl }
              : {}),
            ...(typeof patch.videoPoster === "string"
              ? { videoPoster: patch.videoPoster }
              : {}),
          },
        );

        setSelectedImageElement((prev) =>
          prev
            ? {
                ...prev,
                ...(typeof patch.src === "string" ? { src: patch.src } : {}),
                ...(typeof patch.videoUrl === "string"
                  ? { src: patch.videoUrl }
                  : {}),
                ...(typeof patch.mediaType === "string"
                  ? { mediaType: patch.mediaType }
                  : {}),
              }
            : prev,
        );
        setSelectedStaticElement((prev) =>
          prev
            ? {
                ...prev,
                ...(typeof patch.src === "string" ? { src: patch.src } : {}),
                ...(typeof patch.videoUrl === "string"
                  ? { src: patch.videoUrl }
                  : {}),
              }
            : prev,
        );
        return;
      }

      if (!selectedImageElement?.blockId || !selectedImageElement?.fieldPath) {
        return;
      }

      const { blockId, fieldPath } = selectedImageElement;
      const innerMatch = parseInnerBlockFieldPath(fieldPath);
      const imageStyleKey = `${fieldPath}Style`;

      // Merge only the provided keys into the existing style object. This keeps
      // image styling controls working and adds media-type + video settings so a
      // single block can switch between image and video.
      const buildImageStylePatch = (existingStyle) => ({
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
        ...(typeof patch.heightPreset === "string"
          ? { heightPreset: patch.heightPreset }
          : {}),
        ...(typeof patch.customHeight === "string"
          ? { customHeight: patch.customHeight }
          : {}),
        ...(typeof patch.mediaType === "string"
          ? { mediaType: patch.mediaType }
          : {}),
        ...(typeof patch.videoUrl === "string"
          ? { videoUrl: patch.videoUrl }
          : {}),
        ...(typeof patch.videoPoster === "string"
          ? { videoPoster: patch.videoPoster }
          : {}),
        ...(typeof patch.videoAutoplay === "boolean"
          ? { videoAutoplay: patch.videoAutoplay }
          : {}),
        ...(typeof patch.videoMuted === "boolean"
          ? { videoMuted: patch.videoMuted }
          : {}),
        ...(typeof patch.videoLoop === "boolean"
          ? { videoLoop: patch.videoLoop }
          : {}),
        ...(typeof patch.videoControls === "boolean"
          ? { videoControls: patch.videoControls }
          : {}),
      });

      pendingHistoryDescriptionRef.current = `Updated ${fieldPath} image`;
      updateBlockInEditorState(blockId, (block) => {
        if (innerMatch) {
          const existingInnerBlocks = Array.isArray(block.content?.innerBlocks)
            ? block.content.innerBlocks
            : [];
          const existingInnerBlock =
            existingInnerBlocks[innerMatch.index] || {};
          const existingInnerContent =
            existingInnerBlock.content &&
            typeof existingInnerBlock.content === "object"
              ? existingInnerBlock.content
              : {};
          const existingStyle =
            existingInnerContent.imageStyle &&
            typeof existingInnerContent.imageStyle === "object"
              ? existingInnerContent.imageStyle
              : {};

          const nextInnerBlocks =
            typeof patch.src === "string"
              ? setValueAtPath(
                  existingInnerBlocks,
                  `${innerMatch.index}.content.${innerMatch.contentPath || "src"}`,
                  patch.src,
                )
              : existingInnerBlocks;

          return withSyncedInnerBlocks(
            block,
            setValueAtPath(
              nextInnerBlocks,
              `${innerMatch.index}.content.imageStyle`,
              buildImageStylePatch(existingStyle),
            ),
          );
        }

        const existingStyle =
          block.content?.[imageStyleKey] &&
          typeof block.content[imageStyleKey] === "object"
            ? block.content[imageStyleKey]
            : {};

        return {
          ...block,
          content: {
            ...(typeof patch.src === "string"
              ? setValueAtPath(block.content || {}, fieldPath, patch.src)
              : { ...(block.content || {}) }),
            [imageStyleKey]: buildImageStylePatch(existingStyle),
          },
        };
      });
    },
    [
      pushStaticOverrideHistory,
      selectedImageElement,
      selectedStaticElement,
      updateBlockInEditorState,
      updateStaticMediaOverride,
    ],
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

  useEffect(() => {
    const handleOpenMediaLibrary = (event) => {
      const detail = event?.detail || {};
      if (typeof detail?.onSelect !== "function") {
        return;
      }

      setImageLibraryFieldRequest({
        label: typeof detail.label === "string" ? detail.label : "Image",
        onSelect: detail.onSelect,
        mediaType: detail.mediaType === "video" ? "video" : "image",
      });
      setIsImageLibraryPickerOpen(true);
    };

    window.addEventListener(OPEN_MEDIA_LIBRARY_EVENT, handleOpenMediaLibrary);
    return () => {
      window.removeEventListener(
        OPEN_MEDIA_LIBRARY_EVENT,
        handleOpenMediaLibrary,
      );
    };
  }, []);

  const handleReplaceSelectedImage = useCallback(
    async (file) => {
      const url = await uploadImageAsset(file);
      if (!url) {
        return;
      }

      if (imageLibraryFieldRequest?.onSelect) {
        imageLibraryFieldRequest.onSelect(url);
      } else {
        handleImageChange({ src: url });
        setSelectedImageElement((prev) =>
          prev
            ? {
                ...prev,
                src: url,
              }
            : prev,
        );
        setSelectedStaticElement((prev) =>
          prev
            ? {
                ...prev,
                src: url,
              }
            : prev,
        );
      }
      setImageLibraryFieldRequest(null);
      setIsImageLibraryPickerOpen(false);
    },
    [handleImageChange, imageLibraryFieldRequest, uploadImageAsset],
  );

  const handleReplaceSelectedVideo = useCallback(
    async (file) => {
      const url = await uploadVideoAsset(file);
      if (!url) return;
      if (imageLibraryFieldRequest?.onSelect) {
        imageLibraryFieldRequest.onSelect(url);
      } else {
        handleImageChange({ videoUrl: url, mediaType: "video" });
      }
      setUploadedLibraryVideos((prev) => [
        ...prev,
        {
          id: `upload:video:${Date.now()}`,
          blockId: "",
          fieldPath: "",
          label: file?.name || "Uploaded Video",
          src: url,
          uploaded: true,
        },
      ]);
      setImageLibraryFieldRequest(null);
      setIsImageLibraryPickerOpen(false);
    },
    [handleImageChange, imageLibraryFieldRequest, uploadVideoAsset],
  );

  const handleUseLibraryImage = useCallback(
    (item) => {
      if (!item?.src) {
        return;
      }

      const isVideoRequest = imageLibraryFieldRequest?.mediaType === "video";
      if (imageLibraryFieldRequest?.onSelect) {
        imageLibraryFieldRequest.onSelect(item.src);
      } else if (isVideoRequest) {
        handleImageChange({ videoUrl: item.src, mediaType: "video" });
      } else {
        handleImageChange({ src: item.src });
        setSelectedImageElement((prev) =>
          prev
            ? {
                ...prev,
                src: item.src,
              }
            : prev,
        );
        setSelectedStaticElement((prev) =>
          prev
            ? {
                ...prev,
                src: item.src,
              }
            : prev,
        );
      }
      setImageLibraryFieldRequest(null);
      setIsImageLibraryPickerOpen(false);
    },
    [handleImageChange, imageLibraryFieldRequest],
  );

  const sectionInnerBlockItems = useMemo(() => {
    const mergedItems = [
      ...SECTION_INNER_BLOCK_LIBRARY,
      ...sectionInnerAvailableBlocks.filter(
        (item) =>
          !SECTION_INNER_BLOCK_LIBRARY.some(
            (baseItem) => String(baseItem.key) === String(item.key),
          ),
      ),
    ];

    const query = sectionInnerBlockSearch.trim().toLowerCase();
    if (!query) {
      return mergedItems;
    }

    return mergedItems.filter((item) =>
      `${item.label} ${item.description} ${item.category || ""}`
        .toLowerCase()
        .includes(query),
    );
  }, [sectionInnerAvailableBlocks, sectionInnerBlockSearch]);

  const sectionInnerBlockGroups = useMemo(() => {
    return sectionInnerBlockItems.reduce((groups, item) => {
      const category = item.category || "Essentials";
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(item);
      return groups;
    }, {});
  }, [sectionInnerBlockItems]);

  useEffect(() => {
    if (!isSectionInnerBlockModalOpen) {
      return;
    }

    let cancelled = false;

    const loadSectionInnerAvailableBlocks = async () => {
      try {
        const response = await apiClient.get("/content-types/blocks");
        const rawItems = Array.isArray(response?.data?.data)
          ? response.data.data
          : [];

        const normalizedItems = [
          ...blockLibraryExtraBlocks.map((item) => ({
            key: item.key,
            label: item.label,
            description: item.description,
            category: humanizeLabel(item.category || "Blocks"),
            icon: getSectionLibraryIcon(item),
          })),
          ...rawItems.map((item) => ({
            key: item.key,
            label: item.label,
            description: item.description,
            category: humanizeLabel(item.category || "Blocks"),
            icon: getSectionLibraryIcon(item),
          })),
        ];

        if (!cancelled) {
          setSectionInnerAvailableBlocks(normalizedItems);
        }
      } catch {
        if (!cancelled) {
          setSectionInnerAvailableBlocks([]);
        }
      }
    };

    void loadSectionInnerAvailableBlocks();

    return () => {
      cancelled = true;
    };
  }, [blockLibraryExtraBlocks, isSectionInnerBlockModalOpen]);

  const handleInsertInnerBlockIntoSection = useCallback(
    (blockKey) => {
      if (!selectedSectionElement?.blockId) {
        return;
      }

      const libraryItem = sectionInnerBlockItems.find(
        (item) => String(item.key) === String(blockKey),
      ) || {
        key: blockKey,
        label: humanizeLabel(blockKey),
        description: `Add a ${humanizeLabel(blockKey).toLowerCase()} block inside this section.`,
      };
      const blockTemplate = buildInnerBlockFromLibraryItem(libraryItem);
      const nextInnerBlock = blockTemplate
        ? {
            id: `inner-${Date.now()}`,
            ...blockTemplate,
          }
        : null;

      if (!nextInnerBlock) {
        return;
      }

      pendingHistoryDescriptionRef.current = `Added ${blockKey} inside section`;
      setBlocks((prev) =>
        prev.map((block) => {
          if (String(block.id) !== String(selectedSectionElement.blockId)) {
            return block;
          }

          const existingInnerBlocks = Array.isArray(block.content?.innerBlocks)
            ? block.content.innerBlocks
            : [];
          const isCanvasSection =
            String(block.blockType || "").toUpperCase() === "SECTION" ||
            String(block.blockType || "").toUpperCase() === "PLAN" ||
            String(block.content?.editorSection || "").startsWith("plan-");
          const positionedInnerBlock = isCanvasSection
            ? {
                ...nextInnerBlock,
                content: {
                  ...(nextInnerBlock.content || {}),
                  ...getDefaultInnerBlockPlacement(
                    nextInnerBlock.type || blockKey,
                    existingInnerBlocks.length,
                  ),
                },
              }
            : nextInnerBlock;

          return withSyncedInnerBlocks(block, [
            ...existingInnerBlocks,
            positionedInnerBlock,
          ]);
        }),
      );
      setIsSectionInnerBlockModalOpen(false);
      setSectionInnerBlockSearch("");
    },
    [sectionInnerBlockItems, selectedSectionElement],
  );

  const handleSectionStyleChange = useCallback(
    (patch) => {
      if (!selectedSectionElement?.blockId) {
        return;
      }

      const styleKey = getSectionStyleKey(selectedSectionElement);
      if (
        selectedSectionElement?.styleOnly &&
        selectedSectionElement?.staticId
      ) {
        return;
      }
      pendingHistoryDescriptionRef.current =
        `Styled section ${selectedSectionElement.label || ""}`.trim();
      updateBlockInEditorState(selectedSectionElement.blockId, (block) => {
        const existingStyle = styleKey.includes(".")
          ? getValueAtPath(block.content || {}, styleKey)
          : block.content?.[styleKey];
        const safeExistingStyle =
          existingStyle && typeof existingStyle === "object"
            ? existingStyle
            : {};

        if (styleKey.includes(".")) {
          return withSyncedBlockContent(
            block,
            setValueAtPath(block.content || {}, styleKey, {
              ...safeExistingStyle,
              ...patch,
            }),
          );
        }

        return {
          ...block,
          content: {
            ...block.content,
            [styleKey]: {
              ...safeExistingStyle,
              ...patch,
            },
          },
        };
      });
    },
    [selectedSectionElement, updateBlockInEditorState],
  );

  // Inline edit save handler — Step 9.24: nested path update for content fields
  const handleInlineEditSave = useCallback(
    (blockId, fieldPath, newValue) => {
      const staticStyleTarget = parseAIStaticStyleFieldPath(fieldPath);
      if (staticStyleTarget && blockId) {
        const { styleKey, staticId, property } = staticStyleTarget;
        const staticStyleKey = `${styleKey}::${staticId}`;
        const draftKey = `${blockId}::${styleKey}::${staticId}`;
        const shouldRemoveProperty =
          newValue === undefined || newValue === null || newValue === "";
        const patch = shouldRemoveProperty ? {} : { [property]: newValue };

        pendingHistoryDescriptionRef.current = `Styled static element ${property}`;
        flushSync(() => {
          updateBlockInEditorState(blockId, (block) => {
            const existingStaticStyles =
              block.content?.staticStyles &&
              typeof block.content.staticStyles === "object" &&
              !Array.isArray(block.content.staticStyles)
                ? block.content.staticStyles
                : {};
            const existingStyle =
              existingStaticStyles[staticStyleKey] &&
              typeof existingStaticStyles[staticStyleKey] === "object"
                ? existingStaticStyles[staticStyleKey]
                : {};
            const nextStyle = {
              ...existingStyle,
              ...patch,
            };
            if (shouldRemoveProperty) {
              delete nextStyle[property];
            }

            return withSyncedBlockContent(block, {
              ...(block.content || {}),
              staticStyles: {
                ...existingStaticStyles,
                [staticStyleKey]: nextStyle,
              },
            });
          });

          setStaticStyleDrafts((prev) => {
            const nextDraft = {
              ...(prev[draftKey] || {}),
              ...patch,
            };
            if (shouldRemoveProperty) {
              delete nextDraft[property];
            }
            return {
              ...prev,
              [draftKey]: nextDraft,
            };
          });
        });

        if (websiteId != null && selectedPage?.id != null) {
          const storedKey = buildStoredStaticStyleOverrideKey(
            websiteId,
            selectedPage.id,
            blockId,
            styleKey,
            staticId,
          );
          const currentDraft = staticStyleDrafts[draftKey] || {};
          const nextStoredStyle = {
            ...currentDraft,
            ...patch,
          };
          if (shouldRemoveProperty) {
            delete nextStoredStyle[property];
          }
          storeStaticStyleOverride(storedKey, nextStoredStyle);
        }
        return;
      }

      if (String(fieldPath || "").startsWith("website.")) {
        const websitePath = String(fieldPath).replace(/^website\./, "");
        pendingHistoryDescriptionRef.current = `Edited ${fieldPath}`;
        flushSync(() => {
          setWebsite((prev) => {
            const nextWebsite = setValueAtPath(
              prev || {},
              websitePath,
              newValue,
            );
            pendingAIWebsitePatchRef.current = setValueAtPath(
              pendingAIWebsitePatchRef.current || {},
              websitePath,
              newValue,
            );
            return nextWebsite;
          });
        });
        return;
      }

      pendingHistoryDescriptionRef.current = `Edited ${fieldPath}`;
      flushSync(() => {
        updateBlockInEditorState(blockId, (block) =>
          withSyncedBlockContent(
            block,
            setValueAtPath(block.content || {}, fieldPath, newValue),
          ),
        );
        setSelectedEditableElement((prevSelected) =>
          prevSelected &&
          String(prevSelected.blockId) === String(blockId) &&
          prevSelected.fieldPath === fieldPath
            ? {
                ...prevSelected,
                value:
                  typeof newValue === "string"
                    ? newValue
                    : newValue == null
                      ? ""
                      : String(newValue),
              }
            : prevSelected,
        );
      });
    },
    [selectedPage?.id, staticStyleDrafts, updateBlockInEditorState, websiteId],
  );

  // ---- AI website draft (creation questionnaire preview) ----

  const aiDraftStorageKey = websiteId
    ? `ai_website_draft_questionnaire_${websiteId}`
    : null;

  const cloneEditorValue = useCallback((value) => {
    if (value == null) return value;
    try {
      return structuredClone(value);
    } catch {
      try {
        return JSON.parse(JSON.stringify(value));
      } catch {
        return value;
      }
    }
  }, []);

  /** Snapshot every editor state container the draft can mutate. */
  const captureEditorSnapshot = useCallback(
    () => ({
      website: cloneEditorValue(website),
      pages: cloneEditorValue(pages),
      persistedPages: cloneEditorValue(persistedPages),
      selectedPage: cloneEditorValue(selectedPage),
      blocks: cloneEditorValue(blocksRef.current),
      pendingAIWebsitePatch: cloneEditorValue(pendingAIWebsitePatchRef.current),
    }),
    [cloneEditorValue, website, pages, persistedPages, selectedPage],
  );

  /** Restore a snapshot into every editor state container consistently. */
  const restoreEditorSnapshot = useCallback((snapshot) => {
    if (!snapshot) return;
    flushSync(() => {
      setWebsite(snapshot.website);
      setPages(snapshot.pages || []);
      setPersistedPages(snapshot.persistedPages || []);
      setSelectedPage(snapshot.selectedPage || null);
      blocksRef.current = snapshot.blocks || [];
      setBlocks(snapshot.blocks || []);
      pendingAIWebsitePatchRef.current = snapshot.pendingAIWebsitePatch || {};
    });
    // Nudge the live preview to re-render from the restored blocks.
    setPreviewSaveSignal((prev) => prev + 1);
  }, []);

  /** Clear the aiDraft query marker, route state, and stored questionnaire. */
  const clearAiDraftMarker = useCallback(() => {
    if (aiDraftStorageKey) {
      try {
        sessionStorage.removeItem(aiDraftStorageKey);
      } catch {
        /* ignore storage errors */
      }
    }
    if (searchParams.get("aiDraft") || location.state?.aiDraftQuestionnaire) {
      navigate(`/dashboard/websites/${websiteId}/editor`, {
        replace: true,
        state: {},
      });
    }
  }, [aiDraftStorageKey, searchParams, location.state, navigate, websiteId]);

  /**
   * Apply a single block-content patch to a NON-selected page's in-memory state
   * (both `pages` and `persistedPages`) so a full-site draft previews when the
   * user switches pages. Returns false if the target block wasn't found.
   */
  const applyBlockPatchToPage = useCallback(
    (pageId, blockId, editorPath, value) => {
      const { pages: curPages, persistedPages: curPersisted } =
        pagesStateRef.current;
      const pageHasBlock = (list) =>
        (list.find((p) => String(p.id) === String(pageId))?.blocks || []).some(
          (b) => String(b.id) === String(blockId),
        );
      if (!pageHasBlock(curPages) && !pageHasBlock(curPersisted)) {
        return false;
      }
      const updater = (prevPages) =>
        prevPages.map((page) => {
          if (String(page.id) !== String(pageId)) return page;
          const nextBlocks = (page.blocks || []).map((block) => {
            if (String(block.id) !== String(blockId)) return block;
            const nextContent = setValueAtPath(
              block.content || {},
              editorPath,
              value,
            );
            return withSyncedBlockContent(block, nextContent);
          });
          return { ...page, blocks: nextBlocks };
        });
      setPages(updater);
      setPersistedPages(updater);
      return true;
    },
    [],
  );

  /**
   * Apply draft patches to LOCAL editor state only (never persist). Website-level
   * fields flow through the `website.*` path; block content on the selected page
   * through the inline-edit handler (keeps live editing state in sync); block
   * content on OTHER pages through {@link applyBlockPatchToPage} so a full-site
   * draft previews everywhere and can be saved for every page.
   */
  const applyAiDraftPatches = useCallback(
    (rawPatches) => {
      const normalized = normalizeChatPatches(rawPatches || []).filter(
        (patch) => patch.value != null,
      );
      const selectedId =
        selectedPage?.id != null ? String(selectedPage.id) : null;
      let applied = 0;
      normalized.forEach((patch) => {
        const persisted = patch.persistedFieldPath || "";
        const editorPath = patch.fieldPath || "";
        const isWebsiteField =
          persisted.startsWith("website.") || editorPath.startsWith("website.");
        if (isWebsiteField) {
          const websitePath = persisted.startsWith("website.")
            ? persisted
            : editorPath;
          handleInlineEditSave(undefined, websitePath, patch.value);
          applied += 1;
          return;
        }
        const isBlockContent =
          persisted.startsWith("content.") || persisted.includes(".content.");
        if (patch.blockId == null || !(isBlockContent || editorPath)) return;

        const targetPageId =
          patch.pageId != null ? String(patch.pageId) : selectedId;
        const onSelectedPage =
          selectedId != null &&
          (targetPageId == null || targetPageId === selectedId) &&
          blocksRef.current.some((b) => String(b.id) === String(patch.blockId));

        if (onSelectedPage) {
          handleInlineEditSave(patch.blockId, editorPath, patch.value);
          applied += 1;
          return;
        }

        if (targetPageId == null) return;
        const ok = applyBlockPatchToPage(
          targetPageId,
          patch.blockId,
          editorPath,
          patch.value,
        );
        if (ok) {
          applied += 1;
          if (targetPageId !== selectedId) {
            draftedOtherPageIdsRef.current.add(targetPageId);
          }
        }
      });
      return applied;
    },
    [applyBlockPatchToPage, handleInlineEditSave, selectedPage?.id],
  );

  const applyAiDraftResult = useCallback(
    (result, snapshot) => {
      const appliedCount = applyAiDraftPatches(result?.patches);
      if (!appliedCount) {
        // Nothing applied — treat as a soft failure and keep the template.
        restoreEditorSnapshot(snapshot);
        aiDraftSnapshotRef.current = null;
        aiDraftPendingResultRef.current = null;
        draftedOtherPageIdsRef.current = new Set();
        clearAiDraftMarker();
        showSaveToast(
          "AI did not return any changes to apply. Showing the template as-is.",
          "info",
        );
        return;
      }
      setAiDraftSummary(
        result.summary ||
          `AI applied ${appliedCount} ${
            appliedCount === 1 ? "change" : "changes"
          }. Review and save when ready.`,
      );
      setAiDraftReadyPromptOpen(false);
      setAiDraftReviewOpen(true);
      aiDraftPendingResultRef.current = null;
    },
    [
      applyAiDraftPatches,
      clearAiDraftMarker,
      restoreEditorSnapshot,
      showSaveToast,
    ],
  );

  const runAiDraft = useCallback(
    async (questionnaireData) => {
      let longRunningTimer = null;
      setAiDraftLoading(true);
      setAiDraftReadyPromptOpen(false);
      aiDraftLongRunningRef.current = false;
      aiDraftPendingResultRef.current = null;
      const snapshot = captureEditorSnapshot();
      aiDraftSnapshotRef.current = snapshot;
      // Fresh draft — forget any pages a previous draft attempt tracked.
      draftedOtherPageIdsRef.current = new Set();
      longRunningTimer = window.setTimeout(() => {
        aiDraftLongRunningRef.current = true;
      }, AI_DRAFT_LONG_RUNNING_DELAY_MS);
      try {
        const pageIdNum =
          selectedPage?.id && !selectedPage?.localOnly
            ? Number(selectedPage.id)
            : undefined;
        const result = await generateWebsiteDraft({
          websiteId: Number(websiteId),
          pageId: Number.isFinite(pageIdNum) ? pageIdNum : undefined,
          questionnaire: questionnaireData,
        });
        if (aiDraftLongRunningRef.current) {
          aiDraftPendingResultRef.current = result;
          setAiDraftReadyPromptOpen(true);
          return;
        }
        applyAiDraftResult(result, snapshot);
      } catch (err) {
        const aiErr =
          err instanceof WebsiteAIRequestError
            ? err.aiError
            : normalizeWebsiteAIError(err);
        restoreEditorSnapshot(snapshot);
        aiDraftSnapshotRef.current = null;
        draftedOtherPageIdsRef.current = new Set();
        clearAiDraftMarker();
        showSaveToast(
          aiErr.message || "AI draft failed. Showing the template as-is.",
          "error",
        );
      } finally {
        if (longRunningTimer) {
          window.clearTimeout(longRunningTimer);
        }
        setAiDraftLoading(false);
        aiDraftLongRunningRef.current = false;
      }
    },
    [
      applyAiDraftResult,
      captureEditorSnapshot,
      clearAiDraftMarker,
      restoreEditorSnapshot,
      selectedPage,
      showSaveToast,
      websiteId,
    ],
  );

  const handleShowAiDraft = useCallback(() => {
    applyAiDraftResult(
      aiDraftPendingResultRef.current,
      aiDraftSnapshotRef.current,
    );
  }, [applyAiDraftResult]);

  const handleKeepAiDraft = useCallback(() => {
    aiDraftSnapshotRef.current = null;
    aiDraftPendingResultRef.current = null;
    setAiDraftReviewOpen(false);
    setAiDraftReadyPromptOpen(false);
    clearAiDraftMarker();
    showSaveToast("AI draft applied. Review and save when ready.", "success");
  }, [clearAiDraftMarker, showSaveToast]);

  const handleRevertAiDraft = useCallback(() => {
    restoreEditorSnapshot(aiDraftSnapshotRef.current);
    aiDraftSnapshotRef.current = null;
    aiDraftPendingResultRef.current = null;
    // Snapshot restore already reverted other pages' in-memory blocks; forget
    // them so a later save doesn't re-persist reverted content.
    draftedOtherPageIdsRef.current = new Set();
    setAiDraftReviewOpen(false);
    setAiDraftReadyPromptOpen(false);
    clearAiDraftMarker();
    showSaveToast("AI draft reverted. Showing the original template.", "info");
  }, [clearAiDraftMarker, restoreEditorSnapshot, showSaveToast]);

  // Detect the aiDraft marker once the editor has loaded, then run the draft.
  useEffect(() => {
    if (aiDraftStartedRef.current) return;
    if (loading || !website || !selectedPage || !websiteId) return;

    const hasMarker = searchParams.get("aiDraft") === "1";
    const routeQuestionnaire = location.state?.aiDraftQuestionnaire || null;
    let storedQuestionnaire = null;
    if (aiDraftStorageKey) {
      try {
        const raw = sessionStorage.getItem(aiDraftStorageKey);
        if (raw) storedQuestionnaire = JSON.parse(raw);
      } catch {
        storedQuestionnaire = null;
      }
    }

    if (!hasMarker && !routeQuestionnaire && !storedQuestionnaire) return;

    const questionnaireData = routeQuestionnaire || storedQuestionnaire;
    aiDraftStartedRef.current = true;

    if (!questionnaireData) {
      // Marker present but no questionnaire data — nothing to generate.
      clearAiDraftMarker();
      return;
    }

    void runAiDraft(questionnaireData);
  }, [
    loading,
    website,
    selectedPage,
    websiteId,
    searchParams,
    location.state,
    aiDraftStorageKey,
    clearAiDraftMarker,
    runAiDraft,
  ]);

  // ---- Website AI (Ask AI / chat) integration helpers ----
  const websiteAIContext = useMemo(() => {
    const raw = website?.aiContext ?? website?.ai_context ?? null;
    if (typeof raw === "string") {
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    }
    return raw && typeof raw === "object" ? raw : null;
  }, [website?.aiContext, website?.ai_context]);
  const embeddedWebsiteAIEditableTargets = useMemo(
    () => extractEditableSchemaTargets(websiteAIContext),
    [websiteAIContext],
  );
  const websiteAIEditableSchemaMeta = websiteAIContext?.editableSchema || {};

  useEffect(() => {
    if (!websiteId) {
      setWebsiteAIExternalTargets([]);
      return undefined;
    }

    const totalTargets =
      typeof websiteAIEditableSchemaMeta?.totalTargets === "number"
        ? websiteAIEditableSchemaMeta.totalTargets
        : null;
    const shouldFetchSchema =
      websiteAISchemaRefreshKey > 0 ||
      Boolean(websiteAIEditableSchemaMeta?.truncated) ||
      Boolean(websiteAIEditableSchemaMeta?.fetchVia) ||
      (totalTargets != null &&
        totalTargets > embeddedWebsiteAIEditableTargets.length);

    if (!shouldFetchSchema) {
      setWebsiteAIExternalTargets([]);
      return undefined;
    }

    const controller = new AbortController();
    getWebsiteEditableSchema(Number(websiteId), {
      signal: controller.signal,
    })
      .then((schema) => {
        if (!controller.signal.aborted) {
          setWebsiteAIExternalTargets(schema.targets || []);
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          console.error("Failed to load website AI editable schema:", err);
          setWebsiteAIExternalTargets([]);
        }
      });

    return () => controller.abort();
  }, [
    websiteId,
    websiteAIEditableSchemaMeta?.truncated,
    websiteAIEditableSchemaMeta?.fetchVia,
    websiteAIEditableSchemaMeta?.totalTargets,
    embeddedWebsiteAIEditableTargets.length,
    websiteAISchemaRefreshKey,
  ]);

  const websiteAIAccess = useWebsiteAIAccess(
    websiteId ? Number(websiteId) : undefined,
    {
      activeRequest: Boolean(websiteAIContext?.activeRequest),
      role: website?.role || websiteRole,
      isOwner:
        Boolean(user?.id) &&
        Boolean(website?.ownerUserId) &&
        Number(user.id) === Number(website.ownerUserId),
    },
  );
  const websiteAIEditableTargets = useMemo(
    () =>
      websiteAIExternalTargets.length
        ? websiteAIExternalTargets
        : embeddedWebsiteAIEditableTargets,
    [embeddedWebsiteAIEditableTargets, websiteAIExternalTargets],
  );
  const websiteAIRevertibleTurns = useMemo(() => {
    const history = Array.isArray(websiteAIContext?.aiHistory)
      ? websiteAIContext.aiHistory
      : [];
    return history
      .filter(
        (turn) =>
          turn?.revertible &&
          turn?.applied &&
          turn?.turnId &&
          !aiTurnHasStaticStylePatch(turn),
      )
      .slice(-2)
      .reverse();
  }, [websiteAIContext]);
  const websiteAIVersions = useMemo(() => {
    const versions = Array.isArray(websiteAIContext?.fullSiteVersions)
      ? websiteAIContext.fullSiteVersions
      : [];
    return versions;
  }, [websiteAIContext]);
  const selectedEditableAITarget = useMemo(() => {
    if (!selectedEditableElement?.fieldPath) {
      return undefined;
    }

    const directTarget = findEditableSchemaTarget(websiteAIEditableTargets, {
      pageId: selectedPage?.id,
      blockId: selectedEditableElement?.blockId,
      fieldPath: selectedEditableElement?.fieldPath,
    });
    if (
      directTarget &&
      (!selectedEditableElement?.blockId ||
        String(directTarget.blockId) ===
          String(selectedEditableElement.blockId) ||
        String(directTarget.currentValue ?? "") ===
          String(selectedEditableElement.value ?? ""))
    ) {
      return directTarget;
    }

    const selectedFieldPath = toFieldPath(selectedEditableElement.fieldPath);
    const selectedValue = String(selectedEditableElement.value ?? "").trim();
    const selectedPageId =
      selectedPage?.id != null ? String(selectedPage.id) : null;

    const valueMatchedTarget = websiteAIEditableTargets.find((target) => {
      if (selectedPageId && String(target.pageId) !== selectedPageId) {
        return false;
      }
      if (toFieldPath(target.fieldPath) !== selectedFieldPath) {
        return false;
      }
      return (
        selectedValue.length > 0 &&
        String(target.currentValue ?? "").trim() === selectedValue
      );
    });

    return valueMatchedTarget || directTarget;
  }, [
    websiteAIEditableTargets,
    selectedPage?.id,
    selectedEditableElement?.blockId,
    selectedEditableElement?.fieldPath,
    selectedEditableElement?.value,
  ]);
  const selectedEditableStyleAITarget = useMemo(() => {
    if (
      !selectedEditableElement?.blockId ||
      !selectedEditableElement?.fieldPath
    ) {
      return undefined;
    }

    const editorStyleFieldPath = getEditableStyleConfig(
      selectedEditableElement.fieldPath,
    ).styleKey;
    const styleFieldPaths = [
      editorStyleFieldPath,
      getEditableTypographyStyleKey(selectedEditableElement.fieldPath),
    ].filter(
      (fieldPath, index, paths) =>
        Boolean(fieldPath) && paths.indexOf(fieldPath) === index,
    );
    const resolvedBlockId =
      selectedEditableAITarget?.blockId ?? selectedEditableElement.blockId;

    return styleFieldPaths
      .map((fieldPath) =>
        findEditableSchemaTarget(websiteAIEditableTargets, {
          pageId: selectedPage?.id,
          blockId: resolvedBlockId,
          fieldPath,
        }),
      )
      .find(Boolean);
  }, [
    websiteAIEditableTargets,
    selectedPage?.id,
    selectedEditableAITarget?.blockId,
    selectedEditableElement?.blockId,
    selectedEditableElement?.fieldPath,
  ]);
  const selectedEditableStyleAITargets = useMemo(() => {
    if (
      !selectedEditableElement?.blockId ||
      !selectedEditableElement?.fieldPath
    ) {
      return [];
    }

    const resolvedBlockId =
      selectedEditableAITarget?.blockId ?? selectedEditableElement.blockId;

    // Primary: schema-driven resolution. The selected content target declares,
    // in metadata.styleObjects, the nested style object(s) the renderer uses to
    // style it — resolve those targets directly from the schema (no guessing).
    const schemaDriven = resolveStyleTargetsForSelection(
      websiteAIEditableTargets,
      selectedEditableAITarget,
      resolvedBlockId,
    );

    // Fallback: name-based candidates for schemas generated before the unified
    // contract (no metadata.styleObjects yet). Still only ever selects targets
    // that actually exist in the schema.
    const candidateMatches = getEditableAIStyleTargetCandidates(
      selectedEditableElement.fieldPath,
    )
      .map((fieldPath) =>
        findEditableSchemaTarget(websiteAIEditableTargets, {
          pageId: selectedPage?.id,
          blockId: resolvedBlockId,
          fieldPath,
        }),
      )
      .filter(Boolean);

    const matches = schemaDriven.length ? schemaDriven : candidateMatches;

    return matches.filter(
      (target, index, list) =>
        list.findIndex(
          (item) =>
            item.aiEditKey === target.aiEditKey ||
            item.fieldPath === target.fieldPath,
        ) === index,
    );
  }, [
    websiteAIEditableTargets,
    selectedPage?.id,
    selectedEditableAITarget,
    selectedEditableElement?.blockId,
    selectedEditableElement?.fieldPath,
  ]);
  const aiStaticStyleTargets = useMemo(
    () => buildStaticStyleAITargets(selectedStaticElement),
    [selectedStaticElement],
  );
  const isSelectedBlogStylePage = useMemo(
    () => (Array.isArray(blocks) ? blocks : []).some(isBlogStaticStyleBlock),
    [blocks],
  );
  const handleDynamicStyleTargetsChange = useCallback((targets = []) => {
    setDynamicBlogStyleTargets(Array.isArray(targets) ? targets : []);
  }, []);
  useEffect(() => {
    setDynamicBlogStyleTargets([]);
  }, [selectedPage?.id]);
  useEffect(() => {
    if (!isSelectedBlogStylePage) {
      setDynamicBlogStyleTargets([]);
    }
  }, [isSelectedBlogStylePage, selectedPage?.id]);
  const aiPageStaticStyleTargets = useMemo(
    () =>
      isSelectedBlogStylePage
        ? dynamicBlogStyleTargets.flatMap((target) =>
            buildStaticStyleAITargets(target),
          )
        : [],
    [dynamicBlogStyleTargets, isSelectedBlogStylePage],
  );
  const aiPagePrimaryColor = useMemo(() => {
    const liveThemeSelection =
      templateThemeSelection && templateThemeSelectionDirty
        ? resolveTemplateThemeSelection(templateThemeSelection)
        : null;
    return (
      liveThemeSelection?.palette?.primary ||
      website?.primaryColor ||
      website?.colors?.primary ||
      "#378C92"
    );
  }, [templateThemeSelection, templateThemeSelectionDirty, website]);
  const aiSectionBlockId =
    selectedSectionElement?.blockId ??
    selectedStaticElement?.blockId ??
    selectedEditableElement?.blockId ??
    null;
  const aiSectionStyleKey =
    selectedStaticElement?.blockId && aiStaticStyleTargets[0]?.fieldPath
      ? aiStaticStyleTargets[0].fieldPath
      : selectedSectionElement?.styleKey || "sectionStyle";
  const aiSectionLabel =
    selectedStaticElement?.label || selectedSectionElement?.label || "Section";

  const selectedSectionAITarget = useMemo(
    () => {
      if (selectedStaticElement?.blockId) {
        return undefined;
      }
      return findEditableSchemaTarget(websiteAIEditableTargets, {
        pageId: selectedPage?.id,
        blockId: aiSectionBlockId,
        fieldPath: aiSectionStyleKey,
      });
    },
    [
      websiteAIEditableTargets,
      selectedPage?.id,
      selectedStaticElement?.blockId,
      aiSectionBlockId,
      aiSectionStyleKey,
    ],
  );

  // Read the current value of a block content field (for AI conflict/revert).
  const getAIFieldValue = useCallback(
    (blockId, fieldPath) => {
      const staticStyleTarget = parseAIStaticStyleFieldPath(fieldPath);
      if (staticStyleTarget && blockId) {
        const draftKey = `${blockId}::${staticStyleTarget.styleKey}::${staticStyleTarget.staticId}`;
        const draftValue =
          staticStyleDrafts[draftKey]?.[staticStyleTarget.property];
        if (draftValue !== undefined) {
          return draftValue;
        }

        const block = blocksRef.current.find(
          (b) => String(b.id) === String(blockId),
        );
        const staticStyleKey = `${staticStyleTarget.styleKey}::${staticStyleTarget.staticId}`;
        return block?.content?.staticStyles?.[staticStyleKey]?.[
          staticStyleTarget.property
        ];
      }

      const persistedPath = String(fieldPath || "");
      if (persistedPath.startsWith("website.")) {
        return getValueAtPath(
          website || {},
          persistedPath.replace(/^website\./, ""),
        );
      }
      if (
        persistedPath.startsWith("pages.") &&
        persistedPath.includes(".content.")
      ) {
        const match = persistedPath.match(/blocks\.([^.]+)\.content\.(.+)$/);
        if (match) {
          const [, resolvedBlockId, contentPath] = match;
          const block = blocksRef.current.find(
            (b) => String(b.id) === String(resolvedBlockId),
          );
          return block
            ? getValueAtPath(block.content || {}, contentPath)
            : undefined;
        }
      }
      const block = blockId
        ? blocksRef.current.find((b) => String(b.id) === String(blockId))
        : null;
      if (!block) return undefined;
      return getValueAtPath(block.content || {}, persistedPath);
    },
    [staticStyleDrafts, website],
  );

  // BlockLibrary insert handler — creates a block via API (Phase 9 gap fix)
  const handleInsertBlockFromLibrary = useCallback(
    async (blockType, position, content) => {
      if (!selectedPage?.id) return;
      try {
        const resolvedContent =
          resolvedFrontendTemplateId === "company-executive"
            ? buildPlanSectionContent(blockType)
            : content || getBlockDefaultContent(blockType);
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
        setDraggedLibraryBlock(null);
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

  const handleLibraryBlockDropIntoPreview = useCallback(() => {
    if (!draggedLibraryBlock?.key) {
      return;
    }

    const dropPosition = selectedSectionElement?.blockId
      ? resolveInsertPositionForSection(selectedSectionElement.blockId, "after")
      : blockLibraryPreferredPosition;

    void handleInsertBlockFromLibrary(draggedLibraryBlock.key, dropPosition);
    setDraggedLibraryBlock(null);
  }, [
    draggedLibraryBlock,
    selectedSectionElement,
    resolveInsertPositionForSection,
    blockLibraryPreferredPosition,
    handleInsertBlockFromLibrary,
  ]);

  // Mobile action handlers for MobileActionBar (Phase 9 gap fix)
  const handleMobileSave = useCallback(() => {
    if (!canTriggerSave) return;
    triggerManualSave();
  }, [canTriggerSave, triggerManualSave]);

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

  const selectedPagePath = String(selectedPage?.path || "").trim();
  const liveSiteHref = website?.slug
    ? `/site/${website.slug}${
        selectedPage?.isHome || selectedPagePath === "/"
          ? ""
          : `/${selectedPagePath.replace(/^\/+/, "")}`
      }`
    : null;

  const handleMobilePreview = useCallback(() => {
    if (liveSiteHref) {
      window.open(liveSiteHref, "_blank");
    }
  }, [liveSiteHref]);

  const applyHistoryBlocksToActivePage = useCallback(
    (historyBlocks) => {
      if (!historyBlocks || !selectedPage?.id) return;
      const nextBlocks = historyBlocks.map(normalizeLoadedBlock);
      suppressHistoryRef.current = true;
      blocksRef.current = nextBlocks;
      setBlocks(nextBlocks);
      setSelectedPage((prevSelectedPage) =>
        String(prevSelectedPage?.id) === String(selectedPage.id)
          ? { ...prevSelectedPage, blocks: nextBlocks }
          : prevSelectedPage,
      );
      setPages((prevPages) =>
        prevPages.map((page) =>
          String(page.id) === String(selectedPage.id)
            ? { ...page, blocks: nextBlocks }
            : page,
        ),
      );
      setPersistedPages((prevPages) =>
        prevPages.map((page) =>
          String(page.id) === String(selectedPage.id)
            ? { ...page, blocks: nextBlocks }
            : page,
        ),
      );
    },
    [selectedPage?.id],
  );

  const handleUndoBlocks = useCallback(() => {
    if (staticUndoStackRef.current.length > 0) {
      const snapshot = staticUndoStackRef.current.pop();
      staticRedoStackRef.current.push(cloneStaticOverrideSnapshot());
      setStaticStyleDrafts(snapshot?.staticStyleDrafts || {});
      setStaticMediaOverrides(snapshot?.staticMediaOverrides || {});
      syncStaticHistoryState();
      return;
    }

    if (previewTransformHistoryTimerRef.current) {
      clearTimeout(previewTransformHistoryTimerRef.current);
      previewTransformHistoryTimerRef.current = null;
    }
    previewTransformHistoryPrimedRef.current = false;
    const previous = undo();
    applyHistoryBlocksToActivePage(previous);
  }, [
    applyHistoryBlocksToActivePage,
    cloneStaticOverrideSnapshot,
    syncStaticHistoryState,
    undo,
  ]);

  const handleRedoBlocks = useCallback(() => {
    if (staticRedoStackRef.current.length > 0) {
      const snapshot = staticRedoStackRef.current.pop();
      staticUndoStackRef.current.push(cloneStaticOverrideSnapshot());
      setStaticStyleDrafts(snapshot?.staticStyleDrafts || {});
      setStaticMediaOverrides(snapshot?.staticMediaOverrides || {});
      syncStaticHistoryState();
      return;
    }

    if (previewTransformHistoryTimerRef.current) {
      clearTimeout(previewTransformHistoryTimerRef.current);
      previewTransformHistoryTimerRef.current = null;
    }
    previewTransformHistoryPrimedRef.current = false;
    const next = redo();
    applyHistoryBlocksToActivePage(next);
  }, [
    applyHistoryBlocksToActivePage,
    cloneStaticOverrideSnapshot,
    redo,
    syncStaticHistoryState,
  ]);

  const effectiveCanUndo = canUndo || canUndoStatic;
  const effectiveCanRedo = canRedo || canRedoStatic;

  const headerMenuOpen = Boolean(headerMenuAnchorEl);
  const pageCount = pages.length;
  const activeBlockCount = blocks.length;
  const selectedStaticType = selectedStaticElement?.staticType || "unknown";
  const staticUsesTextInspector = ["text", "badge", "icon", "unknown"].includes(
    selectedStaticType,
  );
  const staticUsesMediaInspector = ["media", "avatar"].includes(
    selectedStaticType,
  );
  const staticUsesContainerInspector = ["container", "card"].includes(
    selectedStaticType,
  );
  const inspectorTitle = selectedStaticElement?.label
    ? selectedStaticElement.label
    : activeToolbarMode === "section"
      ? selectedSectionElement?.label || "Section"
      : selectedEditableElement
        ? getEditableStyleConfig(selectedEditableElement.fieldPath).label
        : selectedImageElement?.label || "Inspector";
  const inspectorCaption = selectedStaticElement
    ? staticUsesMediaInspector
      ? "Static media is selectable for styling context only. Replace/edit persistence is unavailable without a mapped media field."
      : staticUsesContainerInspector
        ? "This container has independent styles that are saved with its block."
        : "This static element is selectable independently from its parent section."
    : selectedImageElement
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
    (Boolean(selectedEditableElement) ||
      Boolean(selectedSectionElement) ||
      Boolean(selectedStaticElement));
  // The right rail (style bar slot) is reserved when either the style bar or
  // the AI chat panel occupies it, so the preview keeps the same padding.
  const showDesktopRightRail =
    showDesktopInspector || (!isMobile && isAIChatOpen);
  const showDesktopSidebar = !showDesktopInspector;

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
        minHeight="100vh"
        sx={{ bgcolor: "#ffffff" }}
      >
        <Box
          component="video"
          src="/assets/video/logoLoader.webm"
          autoPlay
          loop
          muted
          playsInline
          aria-label="Loading editor"
          sx={{
            width: { xs: 112, sm: 136 },
            height: { xs: 112, sm: 136 },
            objectFit: "contain",
            display: "block",
          }}
        />
      </Box>
    );

    useEffect(() => {
      handleInsertBlockFromLibraryRef.current = handleInsertBlockFromLibrary;
    }, [handleInsertBlockFromLibrary]);
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
              onClick={handleBackToWebsites}
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
                    disabled={!effectiveCanUndo}
                    sx={{
                      minWidth: 28,
                      minHeight: 28,
                      border: `1px solid transparent`,
                      color: effectiveCanUndo
                        ? colors.text
                        : alpha(colors.text, 0.42),
                      backgroundColor: "transparent",
                      "&:hover": effectiveCanUndo
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
                    disabled={!effectiveCanRedo}
                    sx={{
                      minWidth: 28,
                      minHeight: 28,
                      border: `1px solid transparent`,
                      color: effectiveCanRedo
                        ? colors.text
                        : alpha(colors.text, 0.42),
                      backgroundColor: "transparent",
                      "&:hover": effectiveCanRedo
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
                disabled={!canTriggerSave}
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
          (selectedStaticElement ? (
            staticUsesTextInspector ? (
              <EditorStyleToolbar
                selection={{
                  blockId: selectedStaticElement.blockId,
                  fieldPath: `__static.${selectedStaticElement.staticId || "element"}`,
                  label: selectedStaticElement.label || "Static element",
                  editType: "single",
                }}
                value={selectedStaticTextStyle}
                disabled={false}
                onStyleChange={handleStaticStyleChange}
                containerSx={{ mb: 2.25 }}
              />
            ) : staticUsesContainerInspector ? (
              <EditorSectionStyleToolbar
                selection={{
                  blockId: selectedStaticElement.blockId,
                  label: selectedStaticElement.label || "Static container",
                }}
                value={selectedStaticContainerStyle}
                disabled={false}
                onStyleChange={handleStaticStyleChange}
                containerSx={{ mb: 2.25 }}
              />
            ) : (
              <Box
                sx={{
                  mb: 2.25,
                  p: 1.4,
                  borderRadius: 3,
                  border: `1px solid ${alpha(colors.primary, 0.14)}`,
                  backgroundColor: "rgba(255,255,255,0.84)",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ color: colors.text, fontWeight: 600, mb: 1.2 }}
                >
                  Static media selection is local-only in this pass.
                </Typography>
                <TextField
                  size="small"
                  fullWidth
                  label="Border radius"
                  value={getEditableCssUnitValue(
                    selectedStaticMediaStyle.borderRadius,
                  )}
                  onChange={(event) =>
                    handleStaticMediaStyleChange({
                      borderRadius: toEditableCssUnit(event.target.value),
                    })
                  }
                  sx={{ mb: 1.2 }}
                />
                <TextField
                  size="small"
                  fullWidth
                  label="Border width"
                  value={getEditableCssUnitValue(
                    selectedStaticMediaStyle.borderWidth,
                  )}
                  onChange={(event) =>
                    handleStaticMediaStyleChange({
                      borderWidth: toEditableCssUnit(event.target.value),
                    })
                  }
                  sx={{ mb: 1.2 }}
                />
                <TextField
                  size="small"
                  fullWidth
                  label="Border color"
                  value={selectedStaticMediaStyle.borderColor || "#e5e7eb"}
                  onChange={(event) =>
                    handleStaticMediaStyleChange({
                      borderColor: event.target.value,
                    })
                  }
                  sx={{ mb: 1.2 }}
                />
              </Box>
            )
          ) : activeToolbarMode === "text" ? (
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
            {[
              {
                key: "cut",
                label: "Cut",
                shortcut: "Ctrl + X",
                icon: Scissors,
                disabled: !previewContextMenu?.target,
                onClick: () => {
                  const clipboardItem = buildPreviewClipboardItem(
                    previewContextMenu?.target,
                  );
                  if (!clipboardItem || !previewContextMenu?.target) {
                    return;
                  }
                  setPreviewClipboard({
                    ...clipboardItem,
                    mode: "cut",
                  });
                  handleDeletePreviewLayer(previewContextMenu.target);
                },
              },
              {
                key: "copy",
                label: "Copy",
                shortcut: "Ctrl + C",
                icon: Copy,
                disabled: !previewContextMenu?.target,
                onClick: () => {
                  const clipboardItem = buildPreviewClipboardItem(
                    previewContextMenu?.target,
                  );
                  if (!clipboardItem) {
                    return;
                  }
                  setPreviewClipboard({
                    ...clipboardItem,
                    mode: "copy",
                  });
                  setPreviewContextMenu(null);
                },
              },
              {
                key: "paste",
                label: "Paste",
                shortcut: "Ctrl + V",
                icon: ClipboardPaste,
                disabled: !previewClipboard,
                onClick: () =>
                  handlePasteIntoPreviewTarget(previewContextMenu?.target),
              },
              {
                key: "duplicate",
                label: "Duplicate",
                shortcut: "Ctrl + D",
                icon: Clipboard,
                disabled: !previewContextMenu?.target,
                onClick: () =>
                  handleDuplicatePreviewLayer(previewContextMenu?.target),
              },
              {
                key: "delete",
                label: "Delete",
                shortcut: "Del",
                icon: Trash2,
                disabled: !previewContextMenu?.target,
                onClick: () =>
                  handleDeletePreviewLayer(previewContextMenu?.target),
              },
            ].map((action, index) => {
              const ActionIcon = action.icon;
              return (
                <MenuItem
                  key={action.key}
                  disabled={action.disabled}
                  onClick={action.onClick}
                  sx={{
                    minHeight: 38,
                    gap: 1.1,
                    px: 1.4,
                    fontSize: "0.92rem",
                    fontWeight: 500,
                    color:
                      action.key === "delete" && !action.disabled
                        ? "#b42318"
                        : editorText,
                    "&:hover": {
                      backgroundColor: alpha(colors.primary, 0.06),
                    },
                    "&.Mui-disabled": {
                      opacity: 0.46,
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 18,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color:
                        action.key === "delete" && !action.disabled
                          ? "#b42318"
                          : editorMutedText,
                    }}
                  >
                    <ActionIcon size={15} />
                  </Box>
                  <Typography
                    sx={{
                      fontSize: "0.92rem",
                      fontWeight: 500,
                      color: "inherit",
                      flex: 1,
                    }}
                  >
                    {action.label}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.78rem",
                      color: editorMutedText,
                      letterSpacing: "0.01em",
                    }}
                  >
                    {action.shortcut}
                  </Typography>
                </MenuItem>
              );
            })}
            <Box
              sx={{
                mx: 1.2,
                my: 0.6,
                borderTop: `1px solid ${alpha(colors.text, 0.08)}`,
              }}
            />
            <MenuItem
              disabled
              sx={{
                opacity: 1,
                minHeight: 38,
                fontWeight: 700,
                color: editorText,
                fontSize: "0.92rem",
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
                      : layer.kind === "static"
                        ? selectedStaticElement &&
                          String(selectedStaticElement.blockId) ===
                            String(layer.section?.blockId) &&
                          (selectedStaticElement.staticId || "") ===
                            (layer.section?.staticId || "") &&
                          getSectionStyleKey(selectedStaticElement) ===
                            (layer.section?.styleKey || "sectionStyle")
                        : selectedSectionElement &&
                          String(selectedSectionElement.blockId) ===
                            String(layer.section?.blockId) &&
                          (selectedSectionElement.staticId || "") ===
                            (layer.section?.staticId || "") &&
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
                      ) : layer.kind === "static" ? (
                        <Pencil size={16} />
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
                          : layer.kind === "static"
                            ? "Static element"
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

                  <Grid
                    container
                    spacing={1}
                    alignItems="stretch"
                    sx={{ position: "relative" }}
                  >
                    {/* Blocks List */}
                    {showDesktopSidebar && (
                      <Grid item xs={12} lg={2.1}>
                        <Paper
                          sx={{
                            ...builderPanelSx,
                            pl: 2,
                            height: "100%",
                            borderRadius: 5,
                            minHeight: { lg: 860 },
                            maxHeight: {
                              xs: "auto",
                              lg: "calc(100vh - 120px)",
                            },
                            display: "flex",
                            flexDirection: "column",
                            overflow: "hidden",
                          }}
                        >
                          {isBlockEditorSidebarOpen ? (
                            <>
                              <Box
                                sx={{
                                  px: 1.3,
                                  py: 1.1,
                                  flexShrink: 0,
                                  borderBottom: `1px solid ${alpha(colors.primary, 0.1)}`,
                                  backgroundColor: "rgba(255,255,255,0.74)",
                                }}
                              >
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    justifyContent: "space-between",
                                    gap: 1,
                                  }}
                                >
                                  <Box sx={{ minWidth: 0 }}>
                                    <Typography sx={builderSectionLabelSx}>
                                      Block Editor
                                    </Typography>
                                    <Typography
                                      sx={{
                                        mt: 0.35,
                                        fontSize: "1rem",
                                        fontWeight: 800,
                                        color: colors.text,
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                      }}
                                    >
                                      {editingBlock?.blockType || "Block"}
                                    </Typography>
                                  </Box>
                                  <IconButton
                                    size="small"
                                    onClick={closeBlockEditorSidebar}
                                    sx={{
                                      width: 34,
                                      height: 34,
                                      flexShrink: 0,
                                      border: `1px solid ${alpha(colors.primary, 0.16)}`,
                                      backgroundColor: "rgba(255,255,255,0.92)",
                                      color: editorMutedText,
                                    }}
                                    aria-label="Close block editor"
                                  >
                                    <X size={16} />
                                  </IconButton>
                                </Box>
                              </Box>
                              <Box
                                sx={{
                                  p: 1.4,
                                  flex: 1,
                                  minHeight: 0,
                                  overflowY: "auto",
                                  overflowX: "hidden",
                                }}
                              >
                                <DashboardInput
                                  fullWidth
                                  label="Block name"
                                  labelPlacement="floating"
                                  placeholder="Enter block name"
                                  value={blockEditorName}
                                  onChange={(event) => {
                                    setBlockEditorName(event.target.value);
                                    handleEditingBlockLabelChange(
                                      event.target.value,
                                    );
                                  }}
                                  sx={{
                                    "& .MuiOutlinedInput-root": {
                                      borderRadius: "12px",
                                      backgroundColor: "#ffffff",
                                      color: "#111827",
                                      boxShadow: "none",
                                      "& fieldset": {
                                        borderColor: alpha("#111827", 0.16),
                                        borderWidth: "1px",
                                      },
                                      "&:hover fieldset": {
                                        borderColor: "#111827",
                                      },
                                      "&.Mui-focused": {
                                        boxShadow: "none",
                                      },
                                      "&.Mui-focused fieldset": {
                                        borderColor: "#111827",
                                        borderWidth: "1px",
                                      },
                                    },
                                    "& .MuiInputBase-input": {
                                      color: "#111827 !important",
                                      WebkitTextFillColor: "#111827 !important",
                                      caretColor: "#111827",
                                      fontSize: "14px",
                                      "&::placeholder": {
                                        color: alpha("#111827", 0.45),
                                        opacity: 1,
                                      },
                                    },
                                    "& .MuiInputLabel-root": {
                                      color: alpha("#111827", 0.65),
                                    },
                                    "& .MuiInputLabel-root.Mui-focused": {
                                      color: "#111827",
                                    },
                                    "& .MuiInputLabel-root.MuiInputLabel-shrink":
                                      {
                                        color: alpha("#111827", 0.65),
                                        backgroundColor: "#ffffff",
                                        px: 0.4,
                                      },
                                  }}
                                />
                                <Box sx={blockEditorFormSx}>
                                  {isVideoEditingBlock ? (
                                    <Box
                                      sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 2.25,
                                      }}
                                    >
                                      <Typography
                                        sx={{
                                          fontSize: "0.94rem",
                                          fontWeight: 800,
                                          color: colors.text,
                                        }}
                                      >
                                        Content
                                      </Typography>
                                      <DashboardInput
                                        fullWidth
                                        label="Video URL"
                                        labelPlacement="floating"
                                        placeholder="https://..."
                                        value={
                                          selectedEditingBlockContent.videoUrl ||
                                          ""
                                        }
                                        onChange={(event) =>
                                          updateEditingBlockContentPatch({
                                            videoUrl: event.target.value,
                                          })
                                        }
                                        sx={{
                                          "& .MuiOutlinedInput-root": {
                                            borderRadius: "12px",
                                            backgroundColor: "#ffffff",
                                          },
                                        }}
                                      />

                                      <Box>
                                        <Typography
                                          sx={{
                                            fontSize: "0.94rem",
                                            fontWeight: 800,
                                            color: colors.text,
                                            mb: 1.25,
                                          }}
                                        >
                                          Size
                                        </Typography>

                                        {[
                                          {
                                            key: "width",
                                            label: "Width",
                                          },
                                          {
                                            key: "mobileWidth",
                                            label: "Mobile width",
                                          },
                                        ].map((item) => {
                                          const value = getVideoPercentValue(
                                            selectedEditingBlockContent[
                                              item.key
                                            ],
                                          );

                                          return (
                                            <Box
                                              key={item.key}
                                              sx={{
                                                display: "grid",
                                                gridTemplateColumns: "1fr auto",
                                                gap: 1.2,
                                                alignItems: "center",
                                                mb:
                                                  item.key === "width"
                                                    ? 1.4
                                                    : 0,
                                              }}
                                            >
                                              <Box sx={{ minWidth: 0 }}>
                                                <Typography
                                                  sx={{
                                                    fontSize: "0.88rem",
                                                    color: editorMutedText,
                                                    mb: 0.7,
                                                  }}
                                                >
                                                  {item.label}
                                                </Typography>
                                                <Slider
                                                  value={value}
                                                  min={20}
                                                  max={100}
                                                  step={1}
                                                  onChange={(_, nextValue) =>
                                                    updateEditingBlockContentPatch(
                                                      {
                                                        [item.key]:
                                                          Array.isArray(
                                                            nextValue,
                                                          )
                                                            ? nextValue[0]
                                                            : nextValue,
                                                      },
                                                    )
                                                  }
                                                  sx={{
                                                    color: "#111827",
                                                    px: 0.2,
                                                    "& .MuiSlider-thumb": {
                                                      width: 18,
                                                      height: 18,
                                                    },
                                                  }}
                                                />
                                              </Box>
                                              <Box
                                                sx={{
                                                  minWidth: 72,
                                                  height: 42,
                                                  px: 1.3,
                                                  borderRadius: "12px",
                                                  border: `1px solid ${alpha("#111827", 0.16)}`,
                                                  backgroundColor: "#ffffff",
                                                  display: "flex",
                                                  alignItems: "center",
                                                  justifyContent: "center",
                                                  gap: 0.45,
                                                  color: "#111827",
                                                  fontWeight: 700,
                                                }}
                                              >
                                                <Typography
                                                  sx={{
                                                    fontSize: "0.95rem",
                                                    fontWeight: 700,
                                                    color: "#111827",
                                                  }}
                                                >
                                                  {value}
                                                </Typography>
                                                <Typography
                                                  sx={{
                                                    fontSize: "0.9rem",
                                                    color: alpha(
                                                      "#111827",
                                                      0.65,
                                                    ),
                                                  }}
                                                >
                                                  %
                                                </Typography>
                                              </Box>
                                            </Box>
                                          );
                                        })}
                                      </Box>

                                      <FormControl size="small" fullWidth>
                                        <Select
                                          value={
                                            selectedEditingBlockContent.heightPreset ||
                                            "fullscreen"
                                          }
                                          onChange={(event) =>
                                            updateEditingBlockContentPatch({
                                              heightPreset: event.target.value,
                                            })
                                          }
                                          sx={{
                                            height: 54,
                                            borderRadius: 2.5,
                                            backgroundColor: "#ffffff",
                                            "& .MuiOutlinedInput-notchedOutline":
                                              {
                                                borderColor: alpha(
                                                  "#111827",
                                                  0.12,
                                                ),
                                              },
                                            "&:hover .MuiOutlinedInput-notchedOutline":
                                              {
                                                borderColor: alpha(
                                                  colors.primary,
                                                  0.35,
                                                ),
                                              },
                                            "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                              {
                                                borderColor: colors.primary,
                                              },
                                          }}
                                        >
                                          <MenuItem value="auto">
                                            Height: auto
                                          </MenuItem>
                                          <MenuItem value="small">
                                            Height: small
                                          </MenuItem>
                                          <MenuItem value="medium">
                                            Height: medium
                                          </MenuItem>
                                          <MenuItem value="large">
                                            Height: large
                                          </MenuItem>
                                          <MenuItem value="fullscreen">
                                            Height: full screen
                                          </MenuItem>
                                        </Select>
                                      </FormControl>
                                    </Box>
                                  ) : (
                                    <FormGenerator
                                      blockType={String(
                                        editingBlock?.blockType || "",
                                      ).toLowerCase()}
                                      initialValues={{
                                        ...blockForm.content,
                                        _websiteId: websiteId,
                                      }}
                                      onChange={(values) => {
                                        const {
                                          _websiteId: _ignored,
                                          ...clean
                                        } = values;
                                        handleEditingBlockContentChange(clean);
                                      }}
                                      onValidate={(errors) =>
                                        setFormHasErrors(
                                          Object.keys(errors).length > 0,
                                        )
                                      }
                                    />
                                  )}
                                </Box>
                              </Box>
                            </>
                          ) : (
                            <>
                              {/* Fixed top header */}
                              <Box
                                sx={{
                                  px: 1.3,
                                  py: 1.1,
                                  flexShrink: 0,
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
                                            <Icon
                                              size={15}
                                              color={editorMutedText}
                                            />
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
                                        backgroundColor:
                                          "rgba(255,255,255,0.96)",
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
                                          borderColor: alpha(
                                            colors.primary,
                                            0.16,
                                          ),
                                        },
                                        "&:hover .MuiOutlinedInput-notchedOutline":
                                          {
                                            borderColor: alpha(
                                              colors.primary,
                                              0.26,
                                            ),
                                          },
                                        "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                          {
                                            borderColor: alpha(
                                              colors.primary,
                                              0.3,
                                            ),
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
                                          disabled:
                                            !supportsTemplateThemeSidebar,
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
                                            <Icon
                                              size={15}
                                              color={editorMutedText}
                                            />
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
                                    onClick={() =>
                                      openBlockLibraryAtPosition("end")
                                    }
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
                                        borderColor: alpha(
                                          colors.primary,
                                          0.28,
                                        ),
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
                                        borderColor: alpha(
                                          colors.primary,
                                          0.12,
                                        ),
                                        backgroundColor:
                                          "rgba(255,255,255,0.52)",
                                      },
                                    }}
                                    aria-label="Add block"
                                  >
                                    <Plus size={18} />
                                  </IconButton>
                                </Box>
                              </Box>

                              {/* Scrollable content */}
                              <Box
                                sx={{
                                  p: 1.4,
                                  flex: 1,
                                  minHeight: 0,
                                  overflowY: "auto",
                                  overflowX: "hidden",
                                  pr: 1,
                                  "&::-webkit-scrollbar": {
                                    width: 6,
                                  },
                                  "&::-webkit-scrollbar-thumb": {
                                    borderRadius: 999,
                                    backgroundColor: alpha(
                                      colors.primary,
                                      0.22,
                                    ),
                                  },
                                  "&::-webkit-scrollbar-track": {
                                    backgroundColor: "transparent",
                                  },
                                }}
                              >
                                {blockError && (
                                  <Alert
                                    severity="error"
                                    sx={{ mb: 2 }}
                                    action={
                                      <Button
                                        color="inherit"
                                        size="small"
                                        onClick={() =>
                                          selectedPage &&
                                          fetchBlocks(selectedPage.id)
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
                                      persistReorder={
                                        !isLocalTemplateEditorPage
                                      }
                                      onBlocksChange={(reordered) => {
                                        setBlocks(reordered);
                                      }}
                                      onBlockToggleVisibility={
                                        handleToggleBlockVisibility
                                      }
                                      onBlockDelete={handleDeleteBlock}
                                      onBlockSelect={(blockId) => {
                                        const block = blocks.find(
                                          (b) => b.id === blockId,
                                        );
                                        if (block) {
                                          setEditingBlock(block);
                                          setBlockForm({
                                            blockType: block.blockType,
                                            content:
                                              buildBlockEditorInitialContent(
                                                block,
                                              ) || {},
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
                                      }}
                                    >
                                      {imageLibraryItems.map((item) => (
                                        <ButtonBase
                                          key={item.id}
                                          onClick={() =>
                                            handleOpenLibraryImage(item)
                                          }
                                          disabled={!item.blockId}
                                          sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "stretch",
                                            textAlign: "left",
                                            borderRadius: 3,
                                            overflow: "hidden",
                                            border: `1px solid ${alpha(colors.primary, 0.14)}`,
                                            backgroundColor:
                                              "rgba(255,255,255,0.88)",
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
                                          backgroundColor:
                                            "rgba(255,255,255,0.82)",
                                          display: "flex",
                                          flexDirection: "column",
                                          gap: 1,
                                          color: colors.text,
                                          transition:
                                            "transform 160ms ease, border-color 160ms ease, background-color 160ms ease",
                                          "&:hover": {
                                            transform: "translateY(-2px)",
                                            borderColor: alpha(
                                              colors.primary,
                                              0.44,
                                            ),
                                            backgroundColor:
                                              "rgba(255,255,255,0.94)",
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
                                      fontFamily:
                                        '"Poppins", "Inter", sans-serif',
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
                                      onChange={(nextSelection) => {
                                        setTemplateThemeSelectionDirty(true);
                                        setTemplateThemeSelection(
                                          nextSelection,
                                        );
                                      }}
                                    />
                                  </Box>
                                )}
                              </Box>
                            </>
                          )}
                        </Paper>
                      </Grid>
                    )}

                    {/* Preview — Step 4.11: PreviewPanel with live srcdoc */}
                    <Grid item xs={12} lg={showDesktopSidebar ? 9.9 : 12}>
                      <Paper
                        sx={{
                          ...builderPanelSx,
                          p: 1.15,
                          pr: {
                            lg: showDesktopRightRail
                              ? `calc(${desktopInspectorWidth} + 16px)`
                              : 1.15,
                          },
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
                            frontendTemplateIdOverride={
                              supportsLocalTemplateEditor
                                ? resolvedFrontendTemplateId
                                : null
                            }
                            frontendTemplateDataOverride={
                              previewTemplateDataOverride
                            }
                            frontendTemplateRenderMode={
                              selectedPage?.isHome ||
                              resolvedFrontendTemplateId === "education-pro"
                                ? "full"
                                : "page-shell"
                            }
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
                                // Keep ?page=<id> in sync so the current page
                                // stays selected after a reload.
                                const nextParams = new URLSearchParams(
                                  searchParams,
                                );
                                nextParams.set("page", String(nextPage.id));
                                setSearchParams(nextParams, { replace: true });
                              }
                            }}
                            selectedBlockId={
                              editingBlock?.id ? String(editingBlock.id) : null
                            }
                            onBlockSelected={(blockId) => {
                              setSelectedEditableElement(null);
                              setSelectedImageElement(null);
                              setIsImageDialogOpen(false);
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
                            onImageDoubleClick={handlePreviewImageDoubleClick}
                            onSectionSelected={handlePreviewSectionSelection}
                            onSectionAddRequest={handlePreviewSectionAddRequest}
                            onSectionInnerAddRequest={
                              handlePreviewSectionInnerAddRequest
                            }
                            onPreviewContextMenu={handlePreviewContextMenu}
                            onAskAIRequest={(data) => {
                              setAskAIAnchorRect(data?.anchorRect || null);
                              setAskAIOpenSignal((v) => v + 1);
                            }}
                            onEditableTextSave={handleInlineEditSave}
                            onElementTransform={handlePreviewElementTransform}
                            onDynamicStyleTargetsChange={
                              handleDynamicStyleTargetsChange
                            }
                            saveSignal={previewSaveSignal}
                            staticStyleDrafts={staticStyleDrafts}
                            staticMediaOverrides={staticMediaOverrides}
                            iframeRefCallback={(ref) => {
                              iframeRef.current = ref?.current ?? null;
                            }}
                            selectedPreviewTarget={selectedPreviewTarget}
                            askAIButtonStatus={askAIButtonStatus}
                            draggedLibraryBlock={draggedLibraryBlock}
                            canDropLibraryBlock={Boolean(
                              selectedSectionElement,
                            )}
                            onLibraryBlockDrop={
                              handleLibraryBlockDropIntoPreview
                            }
                          />
                        </Box>
                      </Paper>
                    </Grid>
                    {!isMobile && (
                      <Box
                        /* Right rail — shared slot for the style bar and AI
                           chat. Toggling chat slides the style bar out to the
                           left while the chat slides in from the right. */
                        sx={{
                          display: { xs: "none", lg: "block" },
                          position: "absolute",
                          top: 0,
                          right: 0,
                          width: desktopInspectorWidth,
                          height: "100%",
                          zIndex: 5,
                          overflow: "hidden",
                          pointerEvents: "none",
                        }}
                      >
                        {/* Style bar layer */}
                        <Box
                          sx={{
                            position: "absolute",
                            inset: 0,
                            zIndex: 1,
                            pointerEvents:
                              !isAIChatOpen && showDesktopInspector
                                ? "auto"
                                : "none",
                            transform: isAIChatOpen
                              ? "translateX(-100%)"
                              : "translateX(0)",
                            transition: "transform 0.3s ease",
                          }}
                        >
                          {showDesktopInspector && (
                            <Paper
                              sx={{
                                ...builderPanelSx,
                                p: 0,
                                borderRadius: 5,
                                display: "flex",
                                flexDirection: "column",
                                height: "100%",
                                maxHeight: "100%",
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
                                    {selectedStaticElement
                                      ? staticUsesMediaInspector
                                        ? "Media"
                                        : staticUsesContainerInspector
                                          ? "Container"
                                          : "Typography"
                                      : activeToolbarMode === "section"
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
                                    selectedStaticElement
                                      ? staticUsesMediaInspector
                                        ? "Static media"
                                        : staticUsesContainerInspector
                                          ? "Saved container"
                                          : "Static style"
                                      : activeToolbarMode === "section"
                                        ? "Layout"
                                        : selectedImageElement
                                          ? "Image"
                                          : "Style"
                                  }
                                  sx={{
                                    borderRadius: 999,
                                    backgroundColor: alpha(
                                      colors.primary,
                                      0.08,
                                    ),
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

                                {selectedStaticElement ? (
                                  staticUsesTextInspector ? (
                                    <Box>
                                      <TextField
                                        fullWidth
                                        multiline
                                        minRows={2}
                                        label="Text"
                                        value={selectedStaticTextValue}
                                        onChange={(event) => {
                                          const contentPath =
                                            getBlogHeroStaticContentPath(
                                              selectedStaticElement,
                                            );
                                          if (
                                            !selectedStaticTextCanEdit ||
                                            !contentPath
                                          ) {
                                            return;
                                          }
                                          handleInlineEditSave(
                                            selectedStaticElement.blockId,
                                            contentPath,
                                            event.target.value,
                                          );
                                        }}
                                        disabled={!selectedStaticTextCanEdit}
                                        helperText={
                                          selectedStaticTextCanEdit
                                            ? "Saved with blog hero content"
                                            : "Style-only / not saved"
                                        }
                                        sx={{
                                          mb: 1.6,
                                          "& .MuiOutlinedInput-root": {
                                            borderRadius: 2.5,
                                            backgroundColor: "#ffffff",
                                          },
                                        }}
                                      />
                                      <EditorStyleToolbar
                                        selection={{
                                          blockId:
                                            selectedStaticElement.blockId,
                                          fieldPath: `__static.${selectedStaticElement.staticId || "element"}`,
                                          label:
                                            selectedStaticElement.label ||
                                            "Static element",
                                          editType: "single",
                                        }}
                                        value={selectedStaticTextStyle}
                                        disabled={false}
                                        onStyleChange={handleStaticStyleChange}
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
                                          "& .MuiDivider-root": {
                                            display: "none",
                                          },
                                          "& .editor-toolbar-selection-label": {
                                            display: "none",
                                          },
                                          "& .MuiFormControl-root": {
                                            width: "100%",
                                            minWidth: "100% !important",
                                          },
                                        }}
                                      />
                                    </Box>
                                  ) : staticUsesContainerInspector ? (
                                    <EditorSectionStyleToolbar
                                      selection={{
                                        blockId: selectedStaticElement.blockId,
                                        label:
                                          selectedStaticElement.label ||
                                          "Static container",
                                      }}
                                      value={selectedStaticContainerStyle}
                                      disabled={false}
                                      onStyleChange={handleStaticStyleChange}
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
                                        "& .MuiDivider-root": {
                                          display: "none",
                                        },
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
                                    <Box
                                      sx={{
                                        p: 1.4,
                                        borderRadius: 3,
                                        border: `1px solid ${alpha(colors.primary, 0.14)}`,
                                        backgroundColor:
                                          "rgba(255,255,255,0.84)",
                                      }}
                                    >
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          color: colors.text,
                                          fontWeight: 600,
                                        }}
                                      >
                                        Static media and avatar selections are
                                        local-only in this pass. They are
                                        intentionally separate from section
                                        controls. Replace remains unavailable
                                        without a mapped media field.
                                      </Typography>
                                      <TextField
                                        size="small"
                                        fullWidth
                                        label="Border radius"
                                        value={getEditableCssUnitValue(
                                          selectedStaticMediaStyle.borderRadius,
                                        )}
                                        onChange={(event) =>
                                          handleStaticMediaStyleChange({
                                            borderRadius: toEditableCssUnit(
                                              event.target.value,
                                            ),
                                          })
                                        }
                                        sx={{ mt: 1.2 }}
                                      />
                                      <TextField
                                        size="small"
                                        fullWidth
                                        label="Border width"
                                        value={getEditableCssUnitValue(
                                          selectedStaticMediaStyle.borderWidth,
                                        )}
                                        onChange={(event) =>
                                          handleStaticMediaStyleChange({
                                            borderWidth: toEditableCssUnit(
                                              event.target.value,
                                            ),
                                          })
                                        }
                                        sx={{ mt: 1.2 }}
                                      />
                                      <TextField
                                        size="small"
                                        fullWidth
                                        label="Border color"
                                        value={
                                          selectedStaticMediaStyle.borderColor ||
                                          "#e5e7eb"
                                        }
                                        onChange={(event) =>
                                          handleStaticMediaStyleChange({
                                            borderColor: event.target.value,
                                          })
                                        }
                                        sx={{ mt: 1.2 }}
                                      />
                                    </Box>
                                  )
                                ) : selectedImageElement ? (
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
                                      sx={{
                                        color: colors.text,
                                        fontWeight: 600,
                                      }}
                                    >
                                      Image editing opens in the media popup so
                                      the existing replace flow keeps working.
                                    </Typography>
                                  </Box>
                                ) : activeToolbarMode === "section" ? (
                                  <EditorSectionStyleToolbar
                                    selection={
                                      selectedSectionElement
                                        ? {
                                            blockId:
                                              selectedSectionElement.blockId,
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
                                  <Box>
                                    <TextField
                                      fullWidth
                                      multiline
                                      minRows={
                                        selectedEditableElement?.editType ===
                                        "multi"
                                          ? 3
                                          : 2
                                      }
                                      label="Text"
                                      value={selectedEditableTextValue}
                                      onChange={(event) => {
                                        if (!selectedEditableElement) {
                                          return;
                                        }
                                        handleInlineEditSave(
                                          selectedEditableElement.blockId,
                                          selectedEditableElement.fieldPath,
                                          event.target.value,
                                        );
                                      }}
                                      disabled={!selectedEditableElement}
                                      sx={{
                                        mb: 1.6,
                                        "& .MuiOutlinedInput-root": {
                                          borderRadius: 2.5,
                                          backgroundColor: "#ffffff",
                                        },
                                      }}
                                    />
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
                                        "& .MuiDivider-root": {
                                          display: "none",
                                        },
                                        "& .editor-toolbar-selection-label": {
                                          display: "none",
                                        },
                                        "& .MuiFormControl-root": {
                                          width: "100%",
                                          minWidth: "100% !important",
                                        },
                                      }}
                                    />
                                  </Box>
                                )}
                              </Box>
                            </Paper>
                          )}
                        </Box>
                        {/* AI chat layer — portal target; slides in from the
                            right, replacing the style bar in the same slot. */}
                        <Box
                          sx={{
                            position: "absolute",
                            inset: 0,
                            zIndex: 2,
                            bgcolor: "#fff",
                            pointerEvents: isAIChatOpen ? "auto" : "none",
                            transform: isAIChatOpen
                              ? "translateX(0)"
                              : "translateX(100%)",
                            transition: "transform 0.3s ease",
                          }}
                        >
                          <Box
                            ref={setAiChatDockNode}
                            sx={{ height: "100%", width: "100%" }}
                          />
                        </Box>
                      </Box>
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
          open={isSectionInnerBlockModalOpen}
          onClose={() => setIsSectionInnerBlockModalOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4.5,
              backgroundColor: "#ffffff",
              border: `1px solid ${alpha(colors.primary, 0.1)}`,
              boxShadow: "0 26px 70px rgba(15, 23, 42, 0.18)",
              overflow: "hidden",
            },
          }}
        >
          <DialogContent sx={{ p: 0, backgroundColor: "#f8fafc" }}>
            <Box
              sx={{
                px: 2.25,
                py: 1.5,
                borderBottom: `1px solid ${alpha(colors.primary, 0.08)}`,
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.94) 100%)",
              }}
            >
              <Typography
                sx={{
                  color: editorText,
                  fontSize: "1rem",
                  fontWeight: 800,
                  lineHeight: 1.2,
                }}
              >
                Add block inside {selectedSectionElement?.label || "section"}
              </Typography>
              <Typography
                sx={{
                  mt: 0.45,
                  color: editorMutedText,
                  fontSize: "0.88rem",
                }}
              >
                New blocks will be inserted inside the selected section content.
              </Typography>
            </Box>
            <Box sx={{ p: 2 }}>
              <DashboardInput
                fullWidth
                placeholder="Search"
                value={sectionInnerBlockSearch}
                onChange={(event) =>
                  setSectionInnerBlockSearch(event.target.value)
                }
                sx={{
                  mb: 2.25,

                  "& .MuiOutlinedInput-root": {
                    borderRadius: "14px",
                    backgroundColor: "#ffffff",
                    color: "#111827",
                    boxShadow: "none",

                    "& fieldset": {
                      borderColor: alpha("#111827", 0.16),
                      borderWidth: "1px",
                    },

                    "&:hover fieldset": {
                      borderColor: "#111827",
                    },

                    "&.Mui-focused": {
                      boxShadow: "none",
                    },

                    "&.Mui-focused fieldset": {
                      borderColor: "#111827",
                      borderWidth: "1px",
                    },
                  },

                  "& .MuiInputBase-input": {
                    color: "#111827",
                    caretColor: "#111827",

                    "&::placeholder": {
                      color: alpha("#111827", 0.45),
                      opacity: 1,
                    },
                  },
                }}
              />
              <Box sx={{ maxHeight: 500, overflowY: "auto", pr: 0.25 }}>
                {Object.keys(sectionInnerBlockGroups).length === 0 ? (
                  <Box
                    sx={{
                      minHeight: 220,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                      px: 2,
                    }}
                  >
                    <Typography
                      sx={{
                        color: editorMutedText,
                        fontSize: "0.96rem",
                        fontWeight: 700,
                      }}
                    >
                      No blocks found
                    </Typography>
                  </Box>
                ) : (
                  Object.entries(sectionInnerBlockGroups).map(
                    ([category, items]) => (
                      <Box key={category} sx={{ mb: 2 }}>
                        <Typography
                          sx={{
                            mb: 1,
                            fontSize: "0.82rem",
                            fontWeight: 800,
                            letterSpacing: "0.04em",
                            textTransform: "uppercase",
                            color: editorMutedText,
                          }}
                        >
                          {category}
                        </Typography>
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                            gap: 1,
                          }}
                        >
                          {items.map((item) => {
                            const Icon = item.icon;
                            return (
                              <ButtonBase
                                key={item.key}
                                onClick={() =>
                                  handleInsertInnerBlockIntoSection(item.key)
                                }
                                sx={{
                                  borderRadius: 3,
                                  px: 1.2,
                                  py: 1.1,
                                  border: `1px solid ${alpha(colors.primary, 0.08)}`,
                                  background: "#adadad08",
                                  display: "flex",
                                  alignItems: "flex-start",
                                  justifyContent: "flex-start",
                                  gap: 1,
                                  textAlign: "left",
                                  transition:
                                    "transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease",
                                  "&:hover": {
                                    transform: "translateY(-2px)",
                                    borderColor: alpha(colors.primary, 0.22),
                                    boxShadow:
                                      "0 12px 24px rgba(15,23,42,0.08)",
                                  },
                                }}
                              >
                                <Box
                                  sx={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 2.25,
                                    display: "grid",
                                    placeItems: "center",
                                    backgroundColor: "rgba(255,255,255,0.95)",
                                    border: `1px solid ${alpha(
                                      colors.primary,
                                      0.1,
                                    )}`,
                                    color: editorMutedText,
                                    flexShrink: 0,
                                  }}
                                >
                                  <Icon size={16} />
                                </Box>
                                <Box>
                                  <Typography
                                    sx={{
                                      color: editorText,
                                      fontSize: "0.92rem",
                                      fontWeight: 700,
                                      lineHeight: 1.2,
                                      paddingTop: "10px",
                                    }}
                                  >
                                    {item.label}
                                  </Typography>
                                </Box>
                              </ButtonBase>
                            );
                          })}
                        </Box>
                      </Box>
                    ),
                  )
                )}
              </Box>
            </Box>
          </DialogContent>
        </Dialog>
        <Dialog
          open={isImageDialogOpen && !!selectedImageElement}
          onClose={() => {
            setIsImageDialogOpen(false);
            setIsImageLibraryPickerOpen(false);
          }}
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
            accept={IMAGE_ACCEPT_ATTR}
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
                {selectedImageElement?.isStatic
                  ? selectedImageValue.mediaType === "video"
                    ? "Preview a static video locally in the editor and tune fit, border, and playback settings."
                    : "Preview a static image locally in the editor and tune fit, border, and radius settings."
                  : selectedImageValue.mediaType === "video"
                    ? "Replace with a video and tune fit, border, and playback for this block."
                    : "Replace the image or switch to a video, and tune fit, border, and radius for this block."}
              </Typography>
              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: "0.78rem",
                  color: editorMutedText,
                }}
              >
                {getMediaLimitSummary(
                  selectedImageValue.mediaType === "video" ? "video" : "image",
                )}
              </Typography>
            </Box>
            <IconButton
              onClick={() => {
                setIsImageDialogOpen(false);
                setIsImageLibraryPickerOpen(false);
              }}
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
            {/* Media type tabs — Image / Video */}
            <Box
              sx={{
                display: "inline-flex",
                p: 0.5,
                mb: 2,
                borderRadius: 2.5,
                backgroundColor: alpha("#111827", 0.05),
                border: `1px solid ${alpha("#111827", 0.08)}`,
              }}
            >
              {["image", "video"].map((mode) => {
                const active =
                  (selectedImageValue.mediaType === "video"
                    ? "video"
                    : "image") === mode;
                return (
                  <Button
                    key={mode}
                    disableElevation
                    onClick={() => handleImageChange({ mediaType: mode })}
                    sx={{
                      minWidth: 96,
                      minHeight: 34,
                      px: 2,
                      textTransform: "none",
                      fontWeight: 700,
                      borderRadius: 2,
                      boxShadow: "none",
                      color: active ? "#ffffff" : editorMutedText,
                      backgroundColor: active ? "#0f172a" : "transparent",
                      "&:hover": {
                        backgroundColor: active
                          ? "#0f172a"
                          : alpha("#111827", 0.06),
                      },
                    }}
                  >
                    {mode === "video" ? "Video" : "Image"}
                  </Button>
                );
              })}
            </Box>

            {/* Preview — image or video */}
            {selectedImageValue.mediaType === "video" ? (
              selectedImageValue.videoUrl ? (
                <Box
                  component="video"
                  src={selectedImageValue.videoUrl}
                  poster={selectedImageValue.videoPoster || undefined}
                  controls
                  muted
                  playsInline
                  sx={{
                    display: "block",
                    width: "100%",
                    height: selectedImagePreviewHeight,
                    borderRadius: 3,
                    border: `1px solid ${alpha(colors.primary, 0.14)}`,
                    objectFit:
                      selectedImageValue.objectFit === "fill"
                        ? "fill"
                        : selectedImageValue.objectFit || "cover",
                    backgroundColor: "#0f172a",
                    mb: 2,
                  }}
                />
              ) : (
                <Box
                  sx={{
                    height: selectedImagePreviewHeight,
                    borderRadius: 3,
                    border: `1px dashed ${alpha(colors.primary, 0.3)}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    color: editorMutedText,
                    fontSize: "0.9rem",
                    px: 3,
                    mb: 2,
                    backgroundColor: alpha("#0f172a", 0.02),
                  }}
                >
                  No video selected yet. Use Replace to upload or choose a
                  video.
                </Box>
              )
            ) : (
              <Box
                sx={{
                  height: selectedImagePreviewHeight,
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
            )}

            <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
              <Button
                variant="contained"
                startIcon={<Upload size={16} />}
                onClick={() => {
                  setImageLibraryFieldRequest({
                    label: selectedImageElement?.label || "Media",
                    mediaType:
                      selectedImageValue.mediaType === "video"
                        ? "video"
                        : "image",
                  });
                  setIsImageLibraryPickerOpen(true);
                }}
                sx={{
                  minHeight: 42,
                  textTransform: "none",
                  borderRadius: 2.5,
                  background: "black",
                  color: "#ffffff",
                  boxShadow: "none",
                  fontWeight: 700,
                }}
              >
                Replace
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setIsImageDialogOpen(false);
                  setIsImageLibraryPickerOpen(false);
                }}
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
              {selectedImageValue.mediaType === "video" ? (
                <DashboardInput
                  fullWidth
                  label="Video URL"
                  labelPlacement="floating"
                  value={selectedImageValue.videoUrl || ""}
                  onChange={(event) =>
                    handleImageChange({ videoUrl: event.target.value })
                  }
                  sx={{
                    gridColumn: "1 / -1",
                    ...imageEditorInputSx,
                  }}
                />
              ) : (
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
                    ...imageEditorInputSx,
                  }}
                />
              )}

              <DashboardInput
                fullWidth
                label="Border Radius"
                labelPlacement="floating"
                value={getEditableCssUnitValue(selectedImageValue.borderRadius)}
                onChange={(event) =>
                  handleImageChange({
                    borderRadius: toEditableCssUnit(event.target.value),
                  })
                }
                sx={imageEditorInputSx}
              />

              <DashboardInput
                fullWidth
                label="Border Width"
                labelPlacement="floating"
                value={getEditableCssUnitValue(selectedImageValue.borderWidth)}
                onChange={(event) =>
                  handleImageChange({
                    borderWidth: toEditableCssUnit(event.target.value),
                  })
                }
                sx={imageEditorInputSx}
              />

              <DashboardInput
                fullWidth
                label="Border Color"
                labelPlacement="floating"
                value={selectedImageValue.borderColor || "#e5e7eb"}
                onChange={(event) =>
                  handleImageChange({ borderColor: event.target.value })
                }
                sx={imageEditorInputSx}
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
              <FormControl size="small" sx={{ minWidth: 0 }}>
                <Select
                  value={selectedImageValue.heightPreset || "auto"}
                  onChange={(event) =>
                    handleImageChange({ heightPreset: event.target.value })
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
                  <MenuItem value="auto">Height: auto</MenuItem>
                  <MenuItem value="small">Height: small</MenuItem>
                  <MenuItem value="medium">Height: medium</MenuItem>
                  <MenuItem value="large">Height: large</MenuItem>
                  <MenuItem value="custom">Height: custom (px)</MenuItem>
                </Select>
              </FormControl>

              {selectedImageValue.heightPreset === "custom" && (
                <DashboardInput
                  fullWidth
                  type="number"
                  label="Custom Height (px)"
                  labelPlacement="floating"
                  value={getEditableCssUnitValue(
                    selectedImageValue.customHeight,
                  )}
                  onChange={(event) =>
                    handleImageChange({
                      customHeight: toEditableCssUnit(event.target.value),
                    })
                  }
                  sx={{ gridColumn: "1 / -1", ...imageEditorInputSx }}
                />
              )}

              {/* Video-only playback controls */}
              {selectedImageValue.mediaType === "video" && (
                <>
                  <DashboardInput
                    fullWidth
                    label="Poster Image URL (optional)"
                    labelPlacement="floating"
                    value={selectedImageValue.videoPoster || ""}
                    onChange={(event) =>
                      handleImageChange({ videoPoster: event.target.value })
                    }
                    sx={{
                      gridColumn: "1 / -1",
                      ...imageEditorInputSx,
                    }}
                  />
                  <Box
                    sx={{
                      gridColumn: "1 / -1",
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 0.5,
                      p: 1,
                      borderRadius: 2.5,
                      backgroundColor: "#ffffff",
                      border: `1px solid ${alpha("#111827", 0.1)}`,
                    }}
                  >
                    <FormControlLabel
                      control={
                        <MediaToggleSwitch
                          checked={Boolean(selectedImageValue.videoAutoplay)}
                          onChange={(event) =>
                            handleImageChange({
                              videoAutoplay: event.target.checked,
                            })
                          }
                        />
                      }
                      label="Autoplay"
                      sx={{ m: 0, gap: 1, color: editorText }}
                    />
                    <FormControlLabel
                      control={
                        <MediaToggleSwitch
                          checked={selectedImageValue.videoMuted !== false}
                          onChange={(event) =>
                            handleImageChange({
                              videoMuted: event.target.checked,
                            })
                          }
                        />
                      }
                      label="Muted"
                      sx={{ m: 0, gap: 1, color: editorText }}
                    />
                    <FormControlLabel
                      control={
                        <MediaToggleSwitch
                          checked={Boolean(selectedImageValue.videoLoop)}
                          onChange={(event) =>
                            handleImageChange({
                              videoLoop: event.target.checked,
                            })
                          }
                        />
                      }
                      label="Loop"
                      sx={{ m: 0, gap: 1, color: editorText }}
                    />
                    <FormControlLabel
                      control={
                        <MediaToggleSwitch
                          checked={selectedImageValue.videoControls !== false}
                          onChange={(event) =>
                            handleImageChange({
                              videoControls: event.target.checked,
                            })
                          }
                        />
                      }
                      label="Controls"
                      sx={{ m: 0, gap: 1, color: editorText }}
                    />
                  </Box>
                </>
              )}
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
              {selectedImageElement?.isStatic
                ? "Static media changes apply instantly to the canvas preview only and are not persisted without a mapped media field."
                : "Changes apply instantly to the canvas. Use Save Changes to persist them."}
            </Typography>
            <Button
              onClick={() => {
                setIsImageDialogOpen(false);
                setIsImageLibraryPickerOpen(false);
              }}
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

        {/* Media Library picker — supports image and video */}
        <Dialog
          open={isImageLibraryPickerOpen}
          onClose={() => {
            setIsImageLibraryPickerOpen(false);
            setImageLibraryFieldRequest(null);
          }}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              backgroundColor: "#ffffff",
              border: `1px solid ${alpha(colors.primary, 0.1)}`,
              boxShadow: "0 26px 70px rgba(15, 23, 42, 0.18)",
            },
          }}
        >
          {/* Hidden file inputs — one per media type */}
          <input
            ref={imageLibraryPickerInputRef}
            type="file"
            accept={IMAGE_ACCEPT_ATTR}
            hidden
            onChange={(event) => {
              void handleReplaceSelectedImage(event.target.files?.[0] || null);
              event.target.value = "";
            }}
          />
          <input
            ref={videoLibraryPickerInputRef}
            type="file"
            accept={VIDEO_ACCEPT_ATTR}
            hidden
            onChange={(event) => {
              void handleReplaceSelectedVideo(event.target.files?.[0] || null);
              event.target.value = "";
            }}
          />
          <DialogTitle
            sx={{
              px: 3,
              py: 2.25,
              borderBottom: `1px solid ${alpha(colors.primary, 0.12)}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography sx={builderSectionLabelSx}>Media Library</Typography>
              <Typography
                variant="h6"
                sx={{ mt: 0.35, fontWeight: 800, color: editorText }}
              >
                {imageLibraryFieldRequest?.mediaType === "video"
                  ? "Choose a replacement video"
                  : "Choose a replacement image"}
              </Typography>
            </Box>
            <IconButton
              onClick={() => {
                setIsImageLibraryPickerOpen(false);
                setImageLibraryFieldRequest(null);
              }}
              sx={{
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
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
                gap: 2,
              }}
            >
              <Typography sx={{ fontSize: "0.92rem", color: editorMutedText }}>
                {imageLibraryFieldRequest?.mediaType === "video"
                  ? "Pick from existing website videos or upload a new one."
                  : "Pick from existing website images or upload a new one."}
              </Typography>
              <Typography sx={{ fontSize: "0.78rem", color: editorMutedText }}>
                {getMediaLimitSummary(
                  imageLibraryFieldRequest?.mediaType === "video"
                    ? "video"
                    : "image",
                )}
              </Typography>
              <Button
                variant="contained"
                startIcon={<Upload size={16} />}
                onClick={() => {
                  if (imageLibraryFieldRequest?.mediaType === "video") {
                    videoLibraryPickerInputRef.current?.click();
                  } else {
                    imageLibraryPickerInputRef.current?.click();
                  }
                }}
                sx={{
                  minHeight: 40,
                  textTransform: "none",
                  borderRadius: 2.5,
                  background: "black",
                  color: "#ffffff",
                  boxShadow: "none",
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {imageLibraryFieldRequest?.mediaType === "video"
                  ? "Upload Video"
                  : "Upload Image"}
              </Button>
            </Box>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(3, 1fr)",
                },
                gap: 1.5,
                maxHeight: 480,
                overflowY: "auto",
                pr: 0.5,
              }}
            >
              {(imageLibraryFieldRequest?.mediaType === "video"
                ? videoLibraryItems
                : imageLibraryItems
              ).map((item) => (
                <ButtonBase
                  key={item.id}
                  onClick={() => handleUseLibraryImage(item)}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "stretch",
                    textAlign: "left",
                    borderRadius: 3,
                    overflow: "hidden",
                    border: `1px solid ${alpha(colors.primary, 0.14)}`,
                    backgroundColor: "#ffffff",
                    transition:
                      "transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 14px 30px rgba(15,23,42,0.1)",
                      borderColor: alpha(colors.primary, 0.26),
                    },
                  }}
                >
                  {imageLibraryFieldRequest?.mediaType === "video" ? (
                    <Box
                      component="video"
                      src={item.src}
                      muted
                      preload="metadata"
                      sx={{
                        height: 150,
                        width: "100%",
                        objectFit: "cover",
                        backgroundColor: "#0f172a",
                        display: "block",
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        height: 150,
                        backgroundImage: `url(${item.src})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundColor: "#e5e7eb",
                      }}
                    />
                  )}
                  <Box sx={{ p: 1.1 }}>
                    <Typography
                      sx={{
                        color: colors.text,
                        fontWeight: 700,
                        fontSize: "0.9rem",
                      }}
                    >
                      {item.label}
                    </Typography>
                    <Typography
                      sx={{
                        color: editorMutedText,
                        fontSize: "0.76rem",
                        mt: 0.25,
                      }}
                    >
                      {item.blockId
                        ? imageLibraryFieldRequest?.mediaType === "video"
                          ? "Template video"
                          : "Template image"
                        : "Uploaded asset"}
                    </Typography>
                  </Box>
                </ButtonBase>
              ))}
              {(imageLibraryFieldRequest?.mediaType === "video"
                ? videoLibraryItems
                : imageLibraryItems
              ).length === 0 && (
                <Box
                  sx={{
                    gridColumn: "1 / -1",
                    py: 6,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1.5,
                    color: editorMutedText,
                  }}
                >
                  <Typography sx={{ fontSize: "0.92rem", fontWeight: 600 }}>
                    No{" "}
                    {imageLibraryFieldRequest?.mediaType === "video"
                      ? "videos"
                      : "images"}{" "}
                    found
                  </Typography>
                  <Typography sx={{ fontSize: "0.82rem" }}>
                    Upload a{" "}
                    {imageLibraryFieldRequest?.mediaType === "video"
                      ? "video"
                      : "new image"}{" "}
                    using the button above.
                  </Typography>
                </Box>
              )}
            </Box>
          </DialogContent>
        </Dialog>

        {selectedPage && (
          <BlockLibrary
            open={blockLibraryOpen}
            onClose={() => setBlockLibraryOpen(false)}
            pageId={selectedPage?.id}
            blocks={blocks}
            extraBlocks={blockLibraryExtraBlocks}
            preferredInsertPosition={blockLibraryPreferredPosition}
            onInsertBlock={handleInsertBlockFromLibrary}
            onBlockDragChange={setDraggedLibraryBlock}
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
            canSave={canTriggerSave}
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
          open={blockDialogOpen}
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
                initialValues={{ ...blockForm.content, _websiteId: websiteId }}
                onChange={(values) => {
                  const { _websiteId: _ignored, ...clean } = values;
                  setBlockForm((prev) => ({ ...prev, content: clean }));
                }}
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
          onConfirm={handleConfirmNavigation}
          onCancel={handleCancelNavigation}
          onSecondary={handleSaveAndNavigate}
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
        <Snackbar
          open={saveToast.open}
          autoHideDuration={6000}
          onClose={(_, reason) => {
            if (reason === "clickaway") return;
            setSaveToast((prev) => ({ ...prev, open: false }));
          }}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert
            severity={saveToast.severity}
            variant="filled"
            onClose={() => setSaveToast((prev) => ({ ...prev, open: false }))}
            sx={{
              width: "100%",
              borderRadius: 2,
              boxShadow: "0 16px 40px rgba(15, 23, 42, 0.18)",
              alignItems: "center",
            }}
          >
            {saveToast.message}
          </Alert>
        </Snackbar>
      </Container>

      {aiDraftLoading && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: 2100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 2,
            bgcolor: "rgba(15,23,42,0.38)",
            backdropFilter: "blur(5px)",
          }}
        >
          <Paper
            elevation={0}
            sx={{
              width: { xs: 286, sm: 330 },
              height: { xs: 286, sm: 330 },
              px: { xs: 3, sm: 4 },
              py: { xs: 3, sm: 4 },
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              gap: { xs: 1.1, sm: 1.35 },
              borderRadius: "50%",
              bgcolor: "rgba(255,255,255,0.96)",
              border: `1px solid ${alpha("#ffffff", 0.56)}`,
              boxShadow:
                "0 24px 70px rgba(15, 23, 42, 0.22), inset 0 1px 18px rgba(255,255,255,0.42)",
              position: "relative",
              isolation: "isolate",
              "&::before": {
                content: '""',
                position: "absolute",
                inset: -10,
                borderRadius: "50%",
                bgcolor: "rgba(255,255,255,0.34)",
                filter: "blur(14px)",
                zIndex: -1,
              },
            }}
          >
            <Box
              component="video"
              src="/assets/video/logoLoader.webm"
              autoPlay
              loop
              muted
              speed
              playsInline
              aria-hidden="true"
              sx={{
                width: { xs: 70, sm: 120 },
                height: { xs: 70, sm: 120 },
                flexShrink: 0,
                objectFit: "contain",
                display: "block",
              }}
            />
            <Box sx={{ maxWidth: { xs: 210, sm: 235 } }}>
              <Typography
                sx={{
                  color: editorText,
                  fontSize: { xs: "0.94rem", sm: "1rem" },
                  fontWeight: 800,
                  lineHeight: 1.25,
                }}
              >
                Generating your AI draft…
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: editorMutedText,
                  fontSize: { xs: "0.74rem", sm: "0.8rem" },
                  lineHeight: 1.45,
                  mt: 0.65,
                }}
              >
                We are tailoring the template to your answers. Nothing is saved
                until you review it.
              </Typography>
            </Box>
          </Paper>
        </Box>
      )}

      <Dialog
        open={aiDraftReadyPromptOpen}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            bgcolor: "rgba(255,255,255,0.98)",
            border: `1px solid ${alpha(colors.primary, 0.18)}`,
            boxShadow: "0 24px 70px rgba(15, 23, 42, 0.24)",
          },
        }}
      >
        <DialogContent
          sx={{
            px: { xs: 2.5, sm: 3 },
            pt: { xs: 2.5, sm: 3 },
            pb: 2,
            textAlign: "center",
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              mx: "auto",
              mb: 1.5,
              borderRadius: "14px",
              bgcolor: alpha(colors.primary, 0.1),
              color: colors.primary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CheckCircle2 size={24} strokeWidth={2.3} color={colors.text} />
          </Box>
          <Typography
            sx={{
              color: editorText,
              fontSize: "1.05rem",
              fontWeight: 800,
              lineHeight: 1.25,
            }}
          >
            Your AI generated draft is ready for review
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: editorMutedText,
              fontSize: "0.84rem",
              lineHeight: 1.55,
              mt: 0.75,
            }}
          >
            Preview the AI draft in the editor, then decide whether to keep it
            or revert back to the template.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 0, justifyContent: "center" }}>
          <Button
            variant="contained"
            onClick={handleShowAiDraft}
            startIcon={<Eye size={16} />}
            sx={{
              textTransform: "none",
              minHeight: 40,
              borderRadius: 999,
              px: 2.4,
              background:
                "linear-gradient(135deg, #111827e8 0%, #020617d4 100%)",
              color: "white !important",
              fontSize: "0.82rem",
              fontWeight: 800,
              boxShadow: "0 12px 26px rgba(0, 0, 0, 0.28)",
              "&:hover": {
                background: "linear-gradient(135deg, #0f172a 0%, #000000 100%)",
                boxShadow: "0 14px 30px rgba(0, 0, 0, 0.45)",
              },
            }}
          >
            Proceed
          </Button>
        </DialogActions>
      </Dialog>

      {aiDraftReviewOpen && (
        <Paper
          elevation={0}
          sx={{
            position: "fixed",
            top: { xs: 12, sm: 18 },
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 2100,
            p: { xs: 1.25, sm: 1.5 },
            borderRadius: 3,
            maxWidth: 850,
            width: "calc(100% - 32px)",
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "stretch", sm: "center" },
            gap: { xs: 1.25, sm: 1.5 },
            bgcolor: "rgba(15, 23, 42, 0.96)",
            border: `1px solid ${alpha("#f8fafc", 0.16)}`,
            boxShadow: "0 18px 50px rgba(2, 6, 23, 0.38)",
            backdropFilter: "blur(10px)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              flex: 1,
              minWidth: 0,
            }}
          >
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: "10px",
                bgcolor: alpha("#f8fafc", 0.1),
                color: "#f8fafc",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <CheckCircle2 size={45} strokeWidth={2.3} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  color: "#f8fafc",
                  fontSize: "0.92rem",
                  fontWeight: 800,
                  lineHeight: 1.25,
                }}
              >
                AI draft applied
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: alpha("#f8fafc", 0.72),
                  fontSize: "0.75rem",
                  lineHeight: 1.45,
                  mt: 0.2,
                }}
              >
                {aiDraftSummary || "Review the changes before saving."}
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              display: "flex",
              gap: 1,
              flexShrink: 0,
              justifyContent: { xs: "flex-end", sm: "initial" },
              flexWrap: "wrap",
            }}
          >
            <Button
              variant="outlined"
              color="inherit"
              onClick={handleRevertAiDraft}
              startIcon={<RotateCcw size={16} />}
              size="small"
              sx={{
                minHeight: 36,
                borderRadius: 999,
                px: 1.7,
                color: alpha("#f8fafc", 0.82),
                borderColor: alpha("#f8fafc", 0.2),
                fontSize: "0.78rem",
                fontWeight: 800,
                textTransform: "none",
                "&:hover": {
                  borderColor: alpha("#f8fafc", 0.36),
                  bgcolor: alpha("#f8fafc", 0.08),
                },
              }}
            >
              Revert
            </Button>
            <Button
              variant="contained"
              onClick={handleKeepAiDraft}
              startIcon={<CheckCircle2 size={16} />}
              size="small"
              sx={{
                textTransform: "none",
                minHeight: 40,
                borderRadius: 999,
                px: 2.4,
                background: "linear-gradient(135deg, #ffffff 0%, #e5e7eb 100%)",
                color: "#020617 !important",
                fontSize: "0.82rem",
                fontWeight: 800,
                boxShadow: "0 12px 26px rgba(255, 255, 255, 0.16)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)",
                  boxShadow: "0 14px 30px rgba(255, 255, 255, 0.2)",
                },
              }}
            >
              Keep draft
            </Button>
          </Box>
        </Paper>
      )}

      {websiteId && (
        <EditorAILayer
          websiteId={Number(websiteId)}
          websiteName={website?.name || website?.businessName || "Website"}
          pageId={
            selectedPage?.id && !selectedPage?.localOnly
              ? Number(selectedPage.id)
              : null
          }
          canUseAI={websiteAIAccess.canUseAI}
          disabledReason={websiteAIAccess.disabledReason}
          chatOpen={isAIChatOpen}
          onChatOpenChange={setIsAIChatOpen}
          chatDockNode={aiChatDockNode}
          selection={{
            editable: selectedEditableElement?.blockId
              ? {
                  blockId:
                    selectedEditableAITarget?.blockId ??
                    selectedEditableStyleAITarget?.blockId ??
                    selectedEditableStyleAITargets[0]?.blockId ??
                    selectedEditableElement.blockId,
                  fieldPath: selectedEditableElement.fieldPath,
                  persistedFieldPath: selectedEditableAITarget?.fieldPath,
                  label: selectedEditableElement.label,
                  aiEditKey: selectedEditableAITarget?.aiEditKey,
                  computedStyle: selectedEditableElement.computedStyle,
                  styleTarget: {
                    blockId: selectedEditableStyleAITarget?.blockId,
                    fieldPath:
                      selectedEditableStyleAITarget?.editorPath ||
                      (selectedEditableStyleAITarget?.fieldPath
                        ? toFieldPath(selectedEditableStyleAITarget.fieldPath)
                        : getEditableStyleConfig(
                            selectedEditableElement.fieldPath,
                          ).styleKey),
                    persistedFieldPath:
                      selectedEditableStyleAITarget?.fieldPath,
                    aiEditKey: selectedEditableStyleAITarget?.aiEditKey,
                    label: `${selectedEditableElement.label || "Selection"} style`,
                    computedStyle: selectedEditableElement.computedStyle,
                  },
                  styleTargets: selectedEditableStyleAITargets.map(
                    (target) => ({
                      blockId: target.blockId,
                      fieldPath:
                        target.editorPath ||
                        String(target.fieldPath || "")
                          .split(".content.")
                          .pop() ||
                        target.fieldPath,
                      persistedFieldPath: target.fieldPath,
                      aiEditKey: target.aiEditKey,
                      label: target.label,
                      category: target.category,
                      computedStyle: selectedEditableElement.computedStyle,
                    }),
                  ),
                }
              : selectedStaticTextCanEdit
                ? {
                    blockId: selectedStaticElement.blockId,
                    blockType: selectedStaticElement.blockType,
                    fieldPath: getBlogHeroStaticContentPath(
                      selectedStaticElement,
                    ),
                    label: selectedStaticElement.label || "Blog hero text",
                    computedStyle: selectedStaticElement.computedStyle,
                    styleTargets: aiStaticStyleTargets,
                  }
                : null,
            section: aiSectionBlockId
              ? {
                  blockId: aiSectionBlockId,
                  label: aiSectionLabel,
                  fieldPath: aiSectionStyleKey,
                  persistedFieldPath: selectedSectionAITarget?.fieldPath,
                  aiEditKey: selectedSectionAITarget?.aiEditKey,
                  computedStyle: selectedStaticElement?.computedStyle,
                  styleTargets: aiStaticStyleTargets,
                }
              : null,
            page: selectedPage?.id
              ? {
                  id: selectedPage.id,
                  title: selectedPage.title,
                  primaryColor: aiPagePrimaryColor,
                  styleTargets: aiPageStaticStyleTargets,
                }
              : null,
          }}
          revertibleTurns={websiteAIRevertibleTurns}
          aiHistory={
            Array.isArray(websiteAIContext?.aiHistory)
              ? websiteAIContext.aiHistory
              : []
          }
          versions={websiteAIVersions}
          openAskSignal={askAIOpenSignal}
          openAskAnchorRect={askAIAnchorRect}
          getCurrentValue={getAIFieldValue}
          applyPatch={handleInlineEditSave}
          onLocalPatchesApplied={handleAIBlocksPatched}
          onRefresh={fetchWebsiteData}
          onAskAIButtonStatusChange={setAskAIButtonStatus}
        />
      )}
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
