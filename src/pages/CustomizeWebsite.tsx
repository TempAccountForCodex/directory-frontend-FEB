// DEPRECATED: This component is no longer routed. The canonical editor is WebsiteEditor.jsx.
// Advanced Phase 9 features (undo/redo, selection, property panels) remain here as reference
// but are NOT part of the production user journey. See WebsiteEditor.jsx for the keeper path.
/**
 * CustomizeWebsite - Step 2 of Website Creation
 *
 * Complete customization UI for creating a website from a template.
 * Features:
 * - Basic website info (name, slug, colors)
 * - Page selection and reordering
 * - Section selection for key pages
 * - Live preview
 */

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Grid,
  Alert,
  CircularProgress,
  Stack,
  Chip,
  Snackbar,
  alpha,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  CheckCircle as CheckIcon,
} from "@mui/icons-material";
import axios from "axios";
import { getTemplateById, type Template } from "../templates/templateApi";
// @ts-ignore - dashboardTheme is a JS file
import { getDashboardColors } from "../styles/dashboardTheme";
import { useTheme as useCustomTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import BlockRenderer from "../components/PublicWebsite/BlockRenderer";
import type { Block } from "../components/BlockEditor/BlockList";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { useAutosave } from "../hooks/useAutosave";
import { useUnsavedChanges } from "../hooks/useUnsavedChanges";
import { useHistory } from "../hooks/useHistory";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { useShortcutManager } from "../hooks/useShortcutManager";
import UndoRedoToolbar from "../components/Editor/UndoRedoToolbar";
import ConflictModal from "../components/Editor/ConflictModal";
import RecoveryModal from "../components/Editor/RecoveryModal";
// @ts-ignore - ConfirmationDialog is a JS component
import { ConfirmationDialog } from "../components/Dashboard/shared";
import { useLocalStorageBackup } from "../hooks/useLocalStorageBackup";
import EditorTabs from "../components/Editor/EditorTabs";
import AppearancePanel from "../components/Editor/AppearancePanel";
import LayoutPanel from "../components/Editor/LayoutPanel";
import SimpleCustomPanel from "../components/Editor/SimpleCustomPanel";
import DetailedCustomPanel from "../components/Editor/DetailedCustomPanel";
import KeyboardShortcutsHelp from "../components/Editor/KeyboardShortcutsHelp";
import SelectionOverlay from "../components/Editor/SelectionOverlay";
import PropertyPanel from "../components/Editor/PropertyPanel";
import InlineTextEditor from "../components/Editor/InlineTextEditor";
import type { SelectedBlockInfo } from "../components/Editor/SelectionOverlay";
import type { InlineEditStartData } from "../components/WebsiteEditor/PreviewPanel";
import HelpIcon from "../components/Docs/HelpIcon";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

// Plan limits - MUST match backend/services/planService.js PLAN_LIMITS.maxPagesPerWebsite
const MAX_PAGES_PER_WEBSITE = 5;

interface PageSelection {
  id: string;
  title: string;
  path: string;
  isHome: boolean;
  selected: boolean;
  sortOrder: number;
  blocks: any[];
}

interface SectionToggle {
  pageTitle: string;
  sectionIndex: number;
  sectionName: string;
  enabled: boolean;
}

/**
 * EditorSnapshot captures the full editor state for undo/redo (Step 9.2.2)
 * Exported so tests and RESULT.json documentation can reference the type.
 */
export interface EditorSnapshot {
  websiteName: string;
  slug: string;
  pages: PageSelection[];
  editorBlocks: Block[];
  primaryColor: string;
  secondaryColor: string;
  headingColor: string;
  bodyColor: string;
  sections: SectionToggle[];
  simpleSettings: Record<string, boolean>;
}

/** Counter for generating stable block IDs within this module */
let blockIdCounter = 0;

/** Assign a stable _blockId to each block in an array (for React key + selection) */
function assignBlockIds(blocks: Record<string, any>[]): Record<string, any>[] {
  return blocks.map((block) => {
    if ((block as Record<string, unknown>)._blockId) return block;
    return { ...block, _blockId: `blk-${++blockIdCounter}` };
  });
}

/**
 * Generates a meaningful section name from a block
 * Avoids showing "TEXT - TEXT" for blocks without headings
 */
const generateSectionName = (block: any, index: number): string => {
  const heading = block.content?.heading;

  if (heading) {
    return `${block.type} - ${heading}`;
  }

  // For blocks without headings, try to use body text
  const body = block.content?.body;
  if (body && typeof body === "string") {
    // Truncate body to first 30 characters
    const truncated = body.length > 30 ? body.substring(0, 30) + "..." : body;
    return `${block.type} - ${truncated}`;
  }

  // Fallback: Use section number
  return `${block.type} Section ${index + 1}`;
};

interface CustomizeWebsiteProps {
  embedded?: boolean;
}

const CustomizeWebsite: React.FC<CustomizeWebsiteProps> = ({
  embedded = false,
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get("template");
  const { actualTheme } = useCustomTheme();
  const { user, loading: authLoading } = useAuth();
  const colors = getDashboardColors(actualTheme);

  // Template data
  const [template, setTemplate] = useState<Template | null>(null);
  const [templateLoading, setTemplateLoading] = useState(true);

  // Basic Info State
  const [websiteName, setWebsiteName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [primaryColor, setPrimaryColor] = useState(
    template?.defaultWebsiteConfig?.primaryColor || "#378C92",
  );
  const [secondaryColor, setSecondaryColor] = useState(
    template?.defaultWebsiteConfig?.secondaryColor || "#D3EB63",
  );
  const [headingColor, setHeadingColor] = useState(
    template?.defaultWebsiteConfig?.headingTextColor || "#252525",
  );
  const [bodyColor, setBodyColor] = useState(
    template?.defaultWebsiteConfig?.bodyTextColor || "#6A6F78",
  );

  // Pages State
  const [pages, setPages] = useState<PageSelection[]>([]);

  // Sections State (for Home and Services pages)
  const [sections, setSections] = useState<SectionToggle[]>([]);

  // UI State
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Color validation errors
  const [primaryColorError, setPrimaryColorError] = useState<
    string | undefined
  >(undefined);
  const [secondaryColorError, setSecondaryColorError] = useState<
    string | undefined
  >(undefined);
  const [headingColorError, setHeadingColorError] = useState<
    string | undefined
  >(undefined);
  const [bodyColorError, setBodyColorError] = useState<string | undefined>(
    undefined,
  );

  // Tab navigation state (Step 9.13.6)
  const [activeTab, setActiveTab] = useState("appearance");

  // Keyboard shortcuts UI state (Step 9.6)
  const [shortcutHelpOpen, setShortcutHelpOpen] = useState(false);
  const [blockLibraryOpen, setBlockLibraryOpen] = useState(false);
  const [previewScale, setPreviewScale] = useState(100);

  // Block selection state (Step 9.14.4)
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);

  // Inline text editing state (Step 9.16.3)
  const [inlineEditState, setInlineEditState] =
    useState<InlineEditStartData | null>(null);
  const previewIframeRef = useRef<React.RefObject<HTMLIFrameElement> | null>(
    null,
  );

  // Simple settings state (Step 9.13.6)
  const [simpleSettings, setSimpleSettings] = useState<Record<string, boolean>>(
    {
      showNavigation: true,
      showFooter: true,
      showSocialLinks: true,
      enableAnimations: true,
    },
  );

  // Block Editor State
  const [editorBlocks, setEditorBlocks] = useState<Block[]>([]);
  const [blockEditorWebsiteId, setBlockEditorWebsiteId] = useState<
    number | null
  >(null);
  const [blockEditorPageId, setBlockEditorPageId] = useState<number | null>(
    null,
  );
  const debouncedBlocks = useDebouncedValue(editorBlocks, 1000);
  const blocksInitializedRef = useRef(false);
  const previousDebouncedBlocksRef = useRef<string>("");

  // ETag + updatedAt refs for conflict detection (Step 5.9)
  const etagRef = useRef<string | null>(null);
  const expectedUpdatedAtRef = useRef<string | null>(null);

  // Undo/Redo history (Step 9.2.2)
  const history = useHistory<EditorSnapshot>();
  const SESSION_HISTORY_KEY = templateId
    ? `editor-history-${templateId}`
    : null;

  /**
   * Validates if a string is a valid hex color code
   * Accepts formats: #RGB, #RRGGBB, #RRGGBBAA
   */
  const isValidHexColor = (color: string): boolean => {
    return /^#([0-9A-F]{3}|[0-9A-F]{6}|[0-9A-F]{8})$/i.test(color);
  };

  /**
   * Validates a color and sets error state if invalid
   */
  const validateColor = (
    color: string,
    setError: React.Dispatch<React.SetStateAction<string | undefined>>,
  ): boolean => {
    if (!color) {
      setError("Color is required");
      return false;
    }
    if (!isValidHexColor(color)) {
      setError("Invalid hex color (e.g., #FF5733)");
      return false;
    }
    setError(undefined);
    return true;
  };

  // Initialize pages from template
  useEffect(() => {
    let isMounted = true;
    if (!templateId) {
      setTemplate(null);
      setTemplateLoading(false);
      return;
    }
    setTemplateLoading(true);
    getTemplateById(templateId)
      .then((data) => {
        if (isMounted) {
          setTemplate(data || null);
        }
      })
      .catch(() => {
        if (isMounted) {
          setTemplate(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setTemplateLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [templateId]);

  useEffect(() => {
    if (template) {
      setInitializing(true);
      const initialPages: PageSelection[] = template.defaultPages.map(
        (page, index) => ({
          id: `page-${index}`,
          title: page.title,
          path: page.path,
          isHome: page.isHome,
          selected: true, // All pages selected by default
          sortOrder: page.sortOrder,
          blocks: assignBlockIds(page.blocks),
        }),
      );
      setPages(initialPages);

      // Initialize sections for Home and Services pages
      const initialSections: SectionToggle[] = [];

      // Home page sections
      const homePage = template.defaultPages.find((p) => p.isHome);
      if (homePage) {
        homePage.blocks.forEach((block, index) => {
          initialSections.push({
            pageTitle: "Home",
            sectionIndex: index,
            sectionName: generateSectionName(block, index),
            enabled: true,
          });
        });
      }

      // Services page sections
      const servicesPage = template.defaultPages.find(
        (p) => p.title === "Services",
      );
      if (servicesPage) {
        servicesPage.blocks.forEach((block, index) => {
          initialSections.push({
            pageTitle: "Services",
            sectionIndex: index,
            sectionName: generateSectionName(block, index),
            enabled: true,
          });
        });
      }

      setSections(initialSections);

      setPrimaryColor(template.defaultWebsiteConfig?.primaryColor || "#378C92");
      setSecondaryColor(
        template.defaultWebsiteConfig?.secondaryColor || "#D3EB63",
      );
      setHeadingColor(
        template.defaultWebsiteConfig?.headingTextColor || "#252525",
      );
      setBodyColor(template.defaultWebsiteConfig?.bodyTextColor || "#6A6F78");

      // Small delay to ensure smooth transition
      setTimeout(() => setInitializing(false), 100);
    }
  }, [template]);

  // Auto-generate slug from name
  useEffect(() => {
    if (!slugTouched && websiteName) {
      const generatedSlug = websiteName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setSlug(generatedSlug);
    }
  }, [websiteName, slugTouched]);

  // Validate slug
  const slugError = useMemo(() => {
    if (!slug) return null;
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return "Slug can only contain lowercase letters, numbers, and hyphens";
    }
    if (slug.startsWith("-") || slug.endsWith("-")) {
      return "Slug cannot start or end with a hyphen";
    }
    return null;
  }, [slug]);

  // Handle page selection toggle
  const togglePage = (pageId: string) => {
    setPages((prevPages) =>
      prevPages.map((page) => {
        if (page.id === pageId && !page.isHome) {
          return { ...page, selected: !page.selected };
        }
        return page;
      }),
    );
    markAsModified("Toggled page");
  };

  // Handle page reordering
  const movePage = (index: number, direction: "up" | "down") => {
    // Only allow reordering of selected pages
    const currentPage = pages[index];
    if (!currentPage.selected) {
      return;
    }

    // Find the next selected page in the direction
    let targetIndex = index;
    if (direction === "up") {
      // Find previous selected page
      for (let i = index - 1; i >= 0; i--) {
        if (pages[i].selected) {
          targetIndex = i;
          break;
        }
      }
    } else {
      // Find next selected page
      for (let i = index + 1; i < pages.length; i++) {
        if (pages[i].selected) {
          targetIndex = i;
          break;
        }
      }
    }

    // If no target found (already at boundary of selected pages), do nothing
    if (targetIndex === index) {
      return;
    }

    const newPages = [...pages];
    [newPages[index], newPages[targetIndex]] = [
      newPages[targetIndex],
      newPages[index],
    ];

    // Update sortOrder only for the swapped pages (performance optimization)
    newPages[index].sortOrder = index;
    newPages[targetIndex].sortOrder = targetIndex;

    setPages(newPages);
    markAsModified("Reordered pages");
  };

  // Handle section toggle
  const toggleSection = (pageTitle: string, sectionIndex: number) => {
    setSections((prevSections) =>
      prevSections.map((section) =>
        section.pageTitle === pageTitle && section.sectionIndex === sectionIndex
          ? { ...section, enabled: !section.enabled }
          : section,
      ),
    );
    markAsModified("Toggled section");
  };

  // Get selected pages with enabled sections
  const getSelectedPagesData = () => {
    return pages
      .filter((page) => page.selected)
      .map((page) => {
        // Filter blocks based on enabled sections
        const enabledBlocks = page.blocks.filter((block, blockIndex) => {
          const section = sections.find(
            (s) => s.pageTitle === page.title && s.sectionIndex === blockIndex,
          );
          // If no section toggle exists, include the block
          return !section || section.enabled;
        });

        return {
          title: page.title,
          path: page.path,
          isHome: page.isHome,
          sortOrder: page.sortOrder,
          blocks: enabledBlocks,
        };
      });
  };

  // Get preview data (home page with enabled sections)
  const previewData = useMemo(() => {
    const selectedPages = pages
      .filter((page) => page.selected)
      .map((page) => {
        // Filter blocks based on enabled sections
        const enabledBlocks = page.blocks.filter((block, blockIndex) => {
          const section = sections.find(
            (s) => s.pageTitle === page.title && s.sectionIndex === blockIndex,
          );
          // If no section toggle exists, include the block
          return !section || section.enabled;
        });

        return {
          title: page.title,
          path: page.path,
          isHome: page.isHome,
          sortOrder: page.sortOrder,
          blocks: enabledBlocks,
        };
      });

    const homePage = selectedPages.find((p) => p.isHome);
    return homePage || null;
  }, [pages, sections]);

  // Handle create website
  const handleCreateWebsite = async () => {
    // Validate all required fields
    if (!websiteName || !slug || slugError) {
      setError("Please fill in all required fields correctly");
      return;
    }

    // Validate all colors
    const isPrimaryValid = validateColor(primaryColor, setPrimaryColorError);
    const isSecondaryValid = validateColor(
      secondaryColor,
      setSecondaryColorError,
    );
    const isHeadingValid = validateColor(headingColor, setHeadingColorError);
    const isBodyValid = validateColor(bodyColor, setBodyColorError);

    if (
      !isPrimaryValid ||
      !isSecondaryValid ||
      !isHeadingValid ||
      !isBodyValid
    ) {
      setError("Please fix color validation errors");
      return;
    }

    // Check if user is authenticated (using useAuth hook)
    if (!user) {
      setError("Please log in to create a website");
      navigate("/auth");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const selectedPagesData = getSelectedPagesData();

      // Get token for API request

      const response = await axios.post(
        `${API_URL}/websites`,
        {
          name: websiteName,
          slug,
          primaryColor,
          secondaryColor,
          headingTextColor: headingColor,
          bodyTextColor: bodyColor,
          templateId,
          customPages: selectedPagesData,
        },
        {
          headers: {},
        },
      );

      if (response.data.success) {
        setSuccess(true);

        // Clear sessionStorage history on successful creation (Step 9.2.2)
        if (SESSION_HISTORY_KEY) {
          try {
            sessionStorage.removeItem(SESSION_HISTORY_KEY);
          } catch {
            // Ignore storage errors during cleanup
          }
        }
        history.clear();

        // If the response includes website data with pages, enable block editor
        const createdWebsite = response.data.data || response.data.website;
        if (createdWebsite?.id && createdWebsite?.pages?.length > 0) {
          const homePage = createdWebsite.pages.find(
            (p: { isHome: boolean }) => p.isHome,
          );
          if (homePage) {
            setBlockEditorWebsiteId(createdWebsite.id);
            setBlockEditorPageId(homePage.id);
          }
        }

        setTimeout(() => {
          navigate("/dashboard/websites");
        }, 1500);
      }
    } catch (err: any) {
      console.error("Error creating website:", err);

      // Handle authentication errors
      if (err.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
        setTimeout(() => {
          navigate("/auth");
        }, 2000);
        return;
      }

      setError(err.response?.data?.message || "Failed to create website");
    } finally {
      setLoading(false);
    }
  };

  // Track if form has been modified by user interaction (kept for back-navigation guard)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  /**
   * Capture the current editor state as a snapshot for history.
   * Called inside markAsModified so all existing onChange handlers
   * automatically push to the undo stack.
   */
  const captureSnapshot = useCallback(
    (description: string) => {
      if (initializing) return;
      const snapshot: EditorSnapshot = {
        websiteName,
        slug,
        pages,
        editorBlocks,
        primaryColor,
        secondaryColor,
        headingColor,
        bodyColor,
        sections,
        simpleSettings,
      };
      history.push(snapshot, description);

      // Persist to sessionStorage keyed by templateId
      if (SESSION_HISTORY_KEY) {
        try {
          const stackData = {
            stack: [
              {
                state: snapshot,
                description,
                timestamp: Date.now(),
              },
            ],
            currentIndex: 0,
          };
          sessionStorage.setItem(
            SESSION_HISTORY_KEY,
            JSON.stringify(stackData),
          );
        } catch {
          // QuotaExceededError — gracefully degrade (keep in-memory history working)
        }
      }
    },
    [
      initializing,
      websiteName,
      slug,
      pages,
      editorBlocks,
      primaryColor,
      secondaryColor,
      headingColor,
      bodyColor,
      sections,
      simpleSettings,
      history,
      SESSION_HISTORY_KEY,
    ],
  );

  /**
   * Helper to mark form as modified (for back button navigation guard)
   * Enhanced (Step 9.2.2): also pushes snapshot to useHistory
   */
  const markAsModified = useCallback(
    (description = "Edited content") => {
      if (!initializing) {
        setHasUnsavedChanges(true);
        captureSnapshot(description);
      }
    },
    [initializing, captureSnapshot],
  );

  /**
   * Restore all state fields from a history snapshot (Step 9.2.2)
   */
  const restoreSnapshot = useCallback((snapshot: EditorSnapshot) => {
    setWebsiteName(snapshot.websiteName);
    setSlug(snapshot.slug);
    setPages(snapshot.pages);
    setEditorBlocks(snapshot.editorBlocks);
    setPrimaryColor(snapshot.primaryColor);
    setSecondaryColor(snapshot.secondaryColor);
    setHeadingColor(snapshot.headingColor);
    setBodyColor(snapshot.bodyColor);
    setSections(snapshot.sections);
    if (snapshot.simpleSettings) {
      setSimpleSettings(snapshot.simpleSettings);
    }
  }, []);

  /**
   * Undo: go back one history step and restore state (Step 9.2.2)
   */
  const handleUndo = useCallback(() => {
    const snapshot = history.undo();
    if (snapshot) {
      restoreSnapshot(snapshot);
    }
  }, [history, restoreSnapshot]);

  /**
   * Redo: go forward one history step and restore state (Step 9.2.2)
   */
  const handleRedo = useCallback(() => {
    const snapshot = history.redo();
    if (snapshot) {
      restoreSnapshot(snapshot);
    }
  }, [history, restoreSnapshot]);

  // Keyboard shortcuts (Step 9.2.3) — Ctrl+Z/Cmd+Z for undo, Ctrl+Shift+Z/Cmd+Shift+Z for redo
  const { isMac, toastOpen, toastMessage, closeToast } = useKeyboardShortcuts({
    onUndo: handleUndo,
    onRedo: handleRedo,
    enabled: !initializing,
    undoDescription: history.lastActionDescription,
  });

  // Shortcut manager (Step 9.6) — new registry-based system for all other shortcuts
  const { registerShortcut, unregisterShortcut, shortcuts } =
    useShortcutManager();

  // Stable refs for callbacks used inside shortcut registrations
  const triggerBlockSaveRef = useRef<(() => void) | null>(null);
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;
  const pagesRef = useRef(pages);
  pagesRef.current = pages;
  const setActiveTabRef = useRef(setActiveTab);
  setActiveTabRef.current = setActiveTab;

  // Register page-level shortcuts after autosave is set up
  // (triggerBlockSave is defined later — use a ref approach via useEffect)
  const shortcutsEnabled = !initializing;

  // Register page-level shortcuts
  useEffect(() => {
    if (!shortcutsEnabled) return;

    // Ctrl+S / Cmd+S → Save (prevents browser Save dialog)
    registerShortcut({
      key: "ctrl+s",
      action: () => {
        if (triggerBlockSaveRef.current) triggerBlockSaveRef.current();
      },
      description: "Save changes",
      category: "Editing",
      scope: "global",
    });

    // Ctrl+Enter → Quick save
    registerShortcut({
      key: "ctrl+enter",
      action: () => {
        if (triggerBlockSaveRef.current) triggerBlockSaveRef.current();
      },
      description: "Quick save",
      category: "Editing",
      scope: "global",
    });

    // Ctrl+Shift+P → Open preview in new tab
    registerShortcut({
      key: "ctrl+shift+p",
      action: () => {
        const url = window.location.href.replace("/customize", "/preview");
        window.open(url, "_blank", "noopener,noreferrer");
      },
      description: "Open preview",
      category: "Navigation",
      scope: "global",
    });

    // Ctrl+B → Toggle block library sidebar
    registerShortcut({
      key: "ctrl+b",
      action: () => setBlockLibraryOpen((prev) => !prev),
      description: "Toggle block library",
      category: "Blocks",
      scope: "global",
    });

    // Ctrl+\ → Toggle block library (alias)
    registerShortcut({
      key: "ctrl+\\",
      action: () => setBlockLibraryOpen((prev) => !prev),
      description: "Toggle sidebar",
      category: "UI",
      scope: "global",
    });

    // Ctrl+Shift+? → Open keyboard shortcuts help (Shift required to type '?')
    registerShortcut({
      key: "ctrl+shift+?",
      action: () => setShortcutHelpOpen(true),
      description: "Show keyboard shortcuts",
      category: "UI",
      scope: "global",
    });

    // Ctrl+T → Navigate to theme/appearance tab
    registerShortcut({
      key: "ctrl+t",
      action: () => setActiveTabRef.current("appearance"),
      description: "Go to theme / appearance",
      category: "Navigation",
      scope: "editor",
    });

    // Ctrl+] → Next page
    registerShortcut({
      key: "ctrl+]",
      action: () => {
        const selectedPages = pagesRef.current.filter((p) => p.selected);
        if (selectedPages.length < 2) return;
        // Find current active page index (we use pages array order)
        const currentIdx = 0; // First selected page is "current" — stub for navigation
        const nextIdx = (currentIdx + 1) % selectedPages.length;
        const nextPage = selectedPages[nextIdx];
        if (nextPage) {
          console.info("[Shortcut] Next page:", nextPage.title);
        }
      },
      description: "Next page",
      category: "Navigation",
      scope: "editor",
    });

    // Ctrl+[ → Previous page
    registerShortcut({
      key: "ctrl+[",
      action: () => {
        const selectedPages = pagesRef.current.filter((p) => p.selected);
        if (selectedPages.length < 2) return;
        const currentIdx = 0;
        const prevIdx =
          (currentIdx - 1 + selectedPages.length) % selectedPages.length;
        const prevPage = selectedPages[prevIdx];
        if (prevPage) {
          console.info("[Shortcut] Previous page:", prevPage.title);
        }
      },
      description: "Previous page",
      category: "Navigation",
      scope: "editor",
    });

    // Ctrl+H → Jump to home page
    registerShortcut({
      key: "ctrl+h",
      action: () => {
        const homePage = pagesRef.current.find((p) => p.isHome && p.selected);
        if (homePage) {
          console.info("[Shortcut] Jump to home page:", homePage.title);
        }
      },
      description: "Jump to home page",
      category: "Navigation",
      scope: "editor",
    });

    // Ctrl+= → Zoom in preview (Ctrl+= is standard zoom-in; avoids '+' delimiter conflict)
    registerShortcut({
      key: "ctrl+=",
      action: () => setPreviewScale((prev) => Math.min(200, prev + 10)),
      description: "Zoom in preview",
      category: "UI",
      scope: "editor",
    });

    // Ctrl+- → Zoom out preview
    registerShortcut({
      key: "ctrl+-",
      action: () => setPreviewScale((prev) => Math.max(25, prev - 10)),
      description: "Zoom out preview",
      category: "UI",
      scope: "editor",
    });

    // Ctrl+0 → Reset zoom to 100%
    registerShortcut({
      key: "ctrl+0",
      action: () => setPreviewScale(100),
      description: "Reset preview zoom",
      category: "UI",
      scope: "editor",
    });

    return () => {
      unregisterShortcut("ctrl+s");
      unregisterShortcut("ctrl+enter");
      unregisterShortcut("ctrl+shift+p");
      unregisterShortcut("ctrl+b");
      unregisterShortcut("ctrl+\\");
      unregisterShortcut("ctrl+shift+?");
      unregisterShortcut("ctrl+t");
      unregisterShortcut("ctrl+]");
      unregisterShortcut("ctrl+[");
      unregisterShortcut("ctrl+h");
      unregisterShortcut("ctrl+=");
      unregisterShortcut("ctrl+-");
      unregisterShortcut("ctrl+0");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shortcutsEnabled, registerShortcut, unregisterShortcut]);

  // Autosave callback — PUT blocks to API with ETag conflict detection (Step 5.9)
  const handleAutosaveBlocks = useCallback(
    async (data: Record<string, unknown>) => {
      if (!blockEditorWebsiteId || !blockEditorPageId) {
        throw new Error("No website/page selected");
      }
      const blocks = data.blocks as Block[];

      // Build headers — include If-Match when we have a stored ETag
      const headers: Record<string, string> = {};
      if (etagRef.current) {
        headers["If-Match"] = etagRef.current;
      }

      try {
        const response = await axios.put(
          `${API_URL}/websites/${blockEditorWebsiteId}/pages/${blockEditorPageId}/blocks`,
          {
            blocks: blocks.map((b, idx) => ({
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
        const updatedAt = (response.data?.data as { updatedAt?: string })
          ?.updatedAt;
        if (updatedAt) {
          expectedUpdatedAtRef.current = updatedAt;
        }

        return { updatedAt };
      } catch (error: any) {
        // Handle 412 Precondition Failed — conflict detected
        if (error?.response?.status === 412) {
          return {
            conflict: true,
            serverData: error.response.data.serverData,
            serverUpdatedAt: error.response.data.serverUpdatedAt,
          };
        }
        // Re-throw non-412 errors for useAutosave error handling
        throw error;
      }
    },
    [blockEditorWebsiteId, blockEditorPageId],
  );

  // Autosave data object (blocks wrapped in object for useAutosave)
  const autosaveBlocks = useMemo(
    () => ({ blocks: editorBlocks }),
    [editorBlocks],
  );

  // LocalStorage backup for unsaved changes (Step 5.10)
  const {
    hasBackup: hasLocalBackup,
    backupEntry: localBackupEntry,
    restoreBackup: restoreLocalBackup,
    discardBackup: discardLocalBackup,
    clearBackup: clearLocalBackup,
  } = useLocalStorageBackup({
    websiteId: blockEditorWebsiteId,
    pageId: blockEditorPageId,
    currentData: autosaveBlocks,
    hasUnsavedChanges: hasUnsavedChanges,
    isLoading: !blocksInitializedRef.current,
  });

  const {
    hasUnsavedChanges: autosaveHasChanges,
    saveStatus: blockSaveStatusFromHook,
    conflictData: blockConflictData,
    triggerSave: triggerBlockSave,
    resolveConflict: resolveBlockConflict,
  } = useAutosave({
    entityType: "page",
    entityId: blockEditorPageId,
    data: autosaveBlocks,
    onSave: handleAutosaveBlocks,
    isLoading: !blocksInitializedRef.current,
    onSaveSuccess: clearLocalBackup,
  });

  // Sync triggerBlockSave into ref so shortcut registrations can call it
  triggerBlockSaveRef.current = triggerBlockSave;

  // Sync hasUnsavedChanges from autosave hook
  useEffect(() => {
    setHasUnsavedChanges(autosaveHasChanges);
  }, [autosaveHasChanges]);

  // Use blockSaveStatus from hook (replaces old local state)
  const blockSaveStatus = blockSaveStatusFromHook;

  // Unsaved changes warning — replaces old window.confirm() navigation guard
  // Uses React Router useBlocker for client-side navigation + ConfirmationDialog
  // skipBeforeUnload=true because useAutosave already handles beforeunload
  const {
    showDialog: showUnsavedDialog,
    confirmNavigation,
    cancelNavigation,
    saveAndNavigate,
  } = useUnsavedChanges({
    hasUnsavedChanges: hasUnsavedChanges && !success,
    onSaveBeforeLeave: triggerBlockSave,
    skipBeforeUnload: true,
    saveStatus: blockSaveStatus,
  });

  // Recovery from localStorage backup (Step 5.10)
  const handleRestoreBackup = useCallback(() => {
    const data = restoreLocalBackup();
    if (data && Array.isArray(data.blocks)) {
      setEditorBlocks(data.blocks as Block[]);
      setHasUnsavedChanges(true);
    }
  }, [restoreLocalBackup]);

  const handleDiscardBackup = useCallback(() => {
    discardLocalBackup();
  }, [discardLocalBackup]);

  // Navigate back to template selection (useBlocker will intercept if dirty)
  const handleBack = () => {
    navigate(
      `/dashboard/websites/create${templateId ? `?selected=${templateId}` : ""}`,
    );
  };

  // Block Editor onChange handler
  const handleBlockEditorChange = useCallback((newBlocks: Block[]) => {
    setEditorBlocks(newBlocks);
  }, []);

  // ---------------------------------------------------------------------------
  // Panel callback handlers (Step 9.13.6)
  // ---------------------------------------------------------------------------

  // AppearancePanel color change handlers — wrap validateColor + markAsModified
  const handlePrimaryColorChange = useCallback(
    (color: string) => {
      setPrimaryColor(color);
      validateColor(color, setPrimaryColorError);
      markAsModified("Changed primary color");
    },
    [markAsModified],
  );

  const handleSecondaryColorChange = useCallback(
    (color: string) => {
      setSecondaryColor(color);
      validateColor(color, setSecondaryColorError);
      markAsModified("Changed secondary color");
    },
    [markAsModified],
  );

  const handleHeadingColorChange = useCallback(
    (color: string) => {
      setHeadingColor(color);
      validateColor(color, setHeadingColorError);
      markAsModified("Changed heading color");
    },
    [markAsModified],
  );

  const handleBodyColorChange = useCallback(
    (color: string) => {
      setBodyColor(color);
      validateColor(color, setBodyColorError);
      markAsModified("Changed body color");
    },
    [markAsModified],
  );

  // DetailedCustomPanel handlers
  const handleWebsiteNameChange = useCallback(
    (name: string) => {
      setWebsiteName(name);
      markAsModified("Changed website name");
    },
    [markAsModified],
  );

  const handleSlugChangeFromPanel = useCallback(
    (newSlug: string) => {
      setSlug(newSlug);
      setSlugTouched(true);
      markAsModified("Changed slug");
    },
    [markAsModified],
  );

  // SimpleCustomPanel handlers
  const handleSettingChange = useCallback(
    (key: string, value: boolean) => {
      setSimpleSettings((prev) => ({ ...prev, [key]: value }));
      markAsModified(`Changed setting: ${key}`);
    },
    [markAsModified],
  );

  const handlePresetSelect = useCallback(
    (presetColors: {
      primaryColor: string;
      secondaryColor: string;
      headingColor: string;
      bodyColor: string;
    }) => {
      // Validate all preset color values before applying (PAT-004)
      if (isValidHexColor(presetColors.primaryColor)) {
        setPrimaryColor(presetColors.primaryColor);
        setPrimaryColorError(undefined);
      }
      if (isValidHexColor(presetColors.secondaryColor)) {
        setSecondaryColor(presetColors.secondaryColor);
        setSecondaryColorError(undefined);
      }
      if (isValidHexColor(presetColors.headingColor)) {
        setHeadingColor(presetColors.headingColor);
        setHeadingColorError(undefined);
      }
      if (isValidHexColor(presetColors.bodyColor)) {
        setBodyColor(presetColors.bodyColor);
        setBodyColorError(undefined);
      }
      markAsModified("Applied color preset");
    },
    [markAsModified],
  );

  // LayoutPanel page reorder handler — merges reordered selected pages back
  const handlePagesChange = useCallback(
    (
      reorderedSelected: Array<{
        id: string;
        title: string;
        path: string;
        isHome: boolean;
        selected: boolean;
        sortOrder: number;
      }>,
    ) => {
      const selectedIds = new Set(reorderedSelected.map((p) => p.id));
      setPages((prev) => {
        // Rebuild full PageSelection objects by merging reordered data with existing blocks
        const reorderedFull = reorderedSelected.map((rp) => {
          const existing = prev.find((p) => p.id === rp.id);
          return existing
            ? { ...existing, sortOrder: rp.sortOrder }
            : { ...rp, blocks: [] };
        });
        const unselected = prev.filter((p) => !selectedIds.has(p.id));
        return [...reorderedFull, ...unselected];
      });
      markAsModified("Reordered pages");
    },
    [markAsModified],
  );

  // Tab change handler
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);

  // ---------------------------------------------------------------------------
  // Block selection callbacks (Step 9.14.4)
  // ---------------------------------------------------------------------------

  /** Derive the selected block info from editorBlocks + previewData */
  const selectedBlock: SelectedBlockInfo | null = useMemo(() => {
    if (!selectedBlockId) return null;

    // Try editorBlocks first (when block editor is active)
    const editorBlock = editorBlocks.find((b) => b.id === selectedBlockId);
    if (editorBlock) {
      return {
        id: editorBlock.id,
        blockType: editorBlock.blockType,
        content: editorBlock.content,
        isVisible: editorBlock.isVisible,
      };
    }

    // Fall back to previewData blocks (template preview — blocks use _blockId)
    if (previewData) {
      const block = previewData.blocks.find(
        (b: Record<string, unknown>) => String(b._blockId) === selectedBlockId,
      );
      if (block) {
        return {
          id: selectedBlockId,
          blockType: (block as Record<string, unknown>).type as string,
          content: (block as Record<string, unknown>).content as Record<
            string,
            unknown
          >,
        };
      }
    }

    return null;
  }, [selectedBlockId, editorBlocks, previewData]);

  /** Derive block index and total blocks for PropertyPanel position controls (Step 9.15.1) */
  const { selectedBlockIndex, totalBlockCount } = useMemo(() => {
    if (!selectedBlockId || !previewData)
      return { selectedBlockIndex: 0, totalBlockCount: 0 };
    const blocks = previewData.blocks;
    const idx = blocks.findIndex(
      (b: Record<string, unknown>) => String(b._blockId) === selectedBlockId,
    );
    return {
      selectedBlockIndex: idx >= 0 ? idx : 0,
      totalBlockCount: blocks.length,
    };
  }, [selectedBlockId, previewData]);

  const handleBlockSelected = useCallback((blockId: string) => {
    setSelectedBlockId(blockId);
  }, []);

  const handleBlockDeselect = useCallback(() => {
    setSelectedBlockId(null);
  }, []);

  const handleBlockHover = useCallback((blockId: string | null) => {
    setHoveredBlockId(blockId);
  }, []);

  const handlePropertyChange = useCallback(
    (blockId: string, partialContent: Record<string, unknown>) => {
      // Update editorBlocks (block editor mode)
      setEditorBlocks((prev) =>
        prev.map((b) =>
          b.id === blockId
            ? { ...b, content: { ...b.content, ...partialContent } }
            : b,
        ),
      );
      // Also update pages blocks (template preview mode — blocks identified by _blockId)
      setPages((prev) =>
        prev.map((page) => ({
          ...page,
          blocks: page.blocks.map((b: Record<string, unknown>) =>
            String(b._blockId) === blockId
              ? {
                  ...b,
                  content: {
                    ...(b.content as Record<string, unknown>),
                    ...partialContent,
                  },
                }
              : b,
          ),
        })),
      );
      markAsModified("Edited block property");
    },
    [markAsModified],
  );

  /** Toggle block-level isVisible (separate from content properties) */
  const handleToggleBlockVisibility = useCallback(
    (blockId: string, isVisible: boolean) => {
      setEditorBlocks((prev) =>
        prev.map((b) => (b.id === blockId ? { ...b, isVisible } : b)),
      );
      markAsModified("Toggled block visibility");
    },
    [markAsModified],
  );

  // ---------------------------------------------------------------------------
  // Inline text editing handlers (Step 9.16.3)
  // ---------------------------------------------------------------------------

  /** Start inline editing — called from PreviewPanel EDIT_START relay */
  const handleInlineEditStart = useCallback(
    (data: InlineEditStartData) => {
      setInlineEditState(data);
      // Auto-select the block being edited
      if (data.blockId && data.blockId !== selectedBlockId) {
        setSelectedBlockId(data.blockId);
      }
    },
    [selectedBlockId],
  );

  /** Save inline edit — updates block content and pushes to undo */
  const handleInlineEditSave = useCallback(
    (newValue: string) => {
      if (!inlineEditState) return;
      const { blockId, fieldPath } = inlineEditState;

      // Update via handlePropertyChange to keep both editorBlocks and pages in sync
      handlePropertyChange(blockId, { [fieldPath]: newValue });

      // Push to undo history with descriptive action
      markAsModified(`Edited ${fieldPath} inline`);

      // Send EDIT_COMPLETE to iframe to remove editing indicator (Step 9.16.3)
      try {
        const iframe = previewIframeRef.current?.current;
        if (iframe?.contentWindow) {
          iframe.contentWindow.postMessage(
            { type: "EDIT_COMPLETE", blockId, fieldPath },
            window.location.origin,
          );
        }
      } catch {
        /* silent */
      }

      // Clear inline edit state
      setInlineEditState(null);
    },
    [inlineEditState, handlePropertyChange, markAsModified],
  );

  /** Cancel inline edit — clears state without saving */
  const handleInlineEditCancel = useCallback(() => {
    setInlineEditState(null);
  }, []);

  /** Capture iframe ref from PreviewPanel for InlineTextEditor positioning */
  const handleIframeRefCallback = useCallback(
    (ref: React.RefObject<HTMLIFrameElement>) => {
      previewIframeRef.current = ref;
    },
    [],
  );

  const handleQuickDuplicate = useCallback(() => {
    if (!selectedBlockId) return;

    // For template preview blocks — duplicate in pages state
    setPages((prev) => {
      return prev.map((page) => {
        if (!page.isHome || !page.selected) return page;
        const idx = page.blocks.findIndex(
          (b: Record<string, unknown>) =>
            String(b._blockId) === selectedBlockId,
        );
        if (idx < 0) return page;
        const block = page.blocks[idx];
        const newBlocks = [...page.blocks];
        newBlocks.splice(idx + 1, 0, {
          ...block,
          _blockId: `blk-${++blockIdCounter}`,
        });
        return { ...page, blocks: newBlocks };
      });
    });
    markAsModified("Duplicated block");
  }, [selectedBlockId, markAsModified]);

  const handleQuickDelete = useCallback(() => {
    if (!selectedBlockId) return;

    setPages((prev) => {
      return prev.map((page) => {
        if (!page.isHome || !page.selected) return page;
        const newBlocks = page.blocks.filter(
          (b: Record<string, unknown>) =>
            String(b._blockId) !== selectedBlockId,
        );
        if (newBlocks.length === page.blocks.length) return page;
        return { ...page, blocks: newBlocks };
      });
    });
    setSelectedBlockId(null);
    markAsModified("Deleted block");
  }, [selectedBlockId, markAsModified]);

  const handleQuickMoveUp = useCallback(() => {
    if (!selectedBlockId) return;

    setPages((prev) => {
      return prev.map((page) => {
        if (!page.isHome || !page.selected) return page;
        const idx = page.blocks.findIndex(
          (b: Record<string, unknown>) =>
            String(b._blockId) === selectedBlockId,
        );
        if (idx <= 0) return page;
        const newBlocks = [...page.blocks];
        [newBlocks[idx - 1], newBlocks[idx]] = [
          newBlocks[idx],
          newBlocks[idx - 1],
        ];
        return { ...page, blocks: newBlocks };
      });
    });
    // selectedBlockId stays the same — it follows the block, not the position
    markAsModified("Moved block up");
  }, [selectedBlockId, markAsModified]);

  const handleQuickMoveDown = useCallback(() => {
    if (!selectedBlockId) return;

    setPages((prev) => {
      return prev.map((page) => {
        if (!page.isHome || !page.selected) return page;
        const idx = page.blocks.findIndex(
          (b: Record<string, unknown>) =>
            String(b._blockId) === selectedBlockId,
        );
        if (idx < 0 || idx >= page.blocks.length - 1) return page;
        const newBlocks = [...page.blocks];
        [newBlocks[idx], newBlocks[idx + 1]] = [
          newBlocks[idx + 1],
          newBlocks[idx],
        ];
        return { ...page, blocks: newBlocks };
      });
    });
    // selectedBlockId stays the same — it follows the block, not the position
    markAsModified("Moved block down");
  }, [selectedBlockId, markAsModified]);

  // Escape key to deselect (Step 9.14.4) — guarded for inline editor (Step 9.16.3)
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      // Do NOT deselect when inline editor is open — Escape cancels the inline edit instead
      if (inlineEditState) return;
      if (e.key === "Escape" && selectedBlockId) {
        setSelectedBlockId(null);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [selectedBlockId, inlineEditState]);

  // Reset selection on undo/redo restore (UI-only state)
  const restoreSnapshotOriginal = restoreSnapshot;
  const restoreSnapshotWithDeselect = useCallback(
    (snapshot: EditorSnapshot) => {
      restoreSnapshotOriginal(snapshot);
      setSelectedBlockId(null);
    },
    [restoreSnapshotOriginal],
  );

  // Fetch blocks when websiteId and pageId are set
  useEffect(() => {
    if (!blockEditorWebsiteId || !blockEditorPageId) return;

    let cancelled = false;
    axios
      .get(
        `${API_URL}/websites/${blockEditorWebsiteId}/pages/${blockEditorPageId}/blocks`,
      )
      .then((res) => {
        if (!cancelled && res.data.blocks) {
          const fetchedBlocks: Block[] = res.data.blocks.map(
            (b: {
              id: number;
              blockType: string;
              content: Record<string, unknown>;
              isVisible: boolean;
              sortOrder: number;
              variant?: string;
            }) => ({
              id: String(b.id),
              blockType: b.blockType,
              content: b.content,
              isVisible: b.isVisible,
              sortOrder: b.sortOrder,
              variant: b.variant,
            }),
          );
          setEditorBlocks(fetchedBlocks);
          previousDebouncedBlocksRef.current = JSON.stringify(fetchedBlocks);
          blocksInitializedRef.current = true;

          // Populate initial ETag from GET response (Step 5.9)
          if (res.headers?.etag) {
            etagRef.current = res.headers.etag;
          }
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("Failed to fetch blocks:", err);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [blockEditorWebsiteId, blockEditorPageId]);

  // Countdown for auto-redirect
  const [redirectCountdown, setRedirectCountdown] = useState(3);

  // Auto-redirect when template not found
  useEffect(() => {
    if (!template && !templateLoading) {
      // Update countdown every second
      const countdownInterval = setInterval(() => {
        setRedirectCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Redirect after 3 seconds
      const timer = setTimeout(() => {
        navigate("/dashboard/websites/create");
      }, 3000);

      return () => {
        clearTimeout(timer);
        clearInterval(countdownInterval);
      };
    }
  }, [template, navigate]);

  if (templateLoading) {
    const loadingContent = (
      <>
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<BackIcon />}
            onClick={handleBack}
            sx={{ mb: 2, color: colors.text }}
          >
            Back to Templates
          </Button>
          <Typography
            variant="h4"
            sx={{ color: colors.text, fontWeight: 700, mb: 1 }}
          >
            Loading Template
          </Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress sx={{ color: colors.primary }} />
        </Box>
      </>
    );

    if (embedded) {
      return loadingContent;
    }

    return (
      <Box sx={{ minHeight: "100vh", bgcolor: colors.bgDefault, py: 4 }}>
        <Container maxWidth="xl">{loadingContent}</Container>
      </Box>
    );
  }

  if (!template) {
    const errorContent = (
      <>
        <Alert severity="error">
          Template not found. Please select a template first.
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            Redirecting to template selection in {redirectCountdown} second
            {redirectCountdown !== 1 ? "s" : ""}...
          </Typography>
        </Alert>
        <Button onClick={handleBack} sx={{ mt: 2 }}>
          Back to Templates Now
        </Button>
      </>
    );

    if (embedded) {
      return errorContent;
    }

    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {errorContent}
      </Container>
    );
  }

  const canCreate = websiteName && slug && !slugError && !loading;

  // Show loading skeleton while initializing
  if (initializing) {
    const initializingContent = (
      <>
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<BackIcon />}
            onClick={handleBack}
            sx={{ mb: 2, color: colors.text }}
          >
            Back to Templates
          </Button>
          <Typography
            variant="h4"
            sx={{ color: colors.text, fontWeight: 700, mb: 1 }}
          >
            Customize Your Website
          </Typography>
          <Typography
            variant="body1"
            component="div"
            sx={{ color: colors.textSecondary }}
          >
            Template:{" "}
            <Chip
              label={template.name}
              size="small"
              color="primary"
              sx={{ ml: 1 }}
            />
          </Typography>
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={6}>
            <Stack spacing={3}>
              {[1, 2, 3, 4].map((i) => (
                <Paper
                  key={i}
                  sx={{
                    p: 3,
                    bgcolor: alpha(colors.dark, 0.3),
                    borderRadius: 2,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <CircularProgress
                      size={24}
                      sx={{ color: colors.primary }}
                    />
                    <Typography sx={{ color: colors.textSecondary }}>
                      Loading template configuration...
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Stack>
          </Grid>
          <Grid item xs={12} lg={6}>
            <Paper
              sx={{ p: 3, bgcolor: alpha(colors.dark, 0.3), borderRadius: 2 }}
            >
              <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress sx={{ color: colors.primary }} />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </>
    );

    if (embedded) {
      return initializingContent;
    }

    return (
      <Box sx={{ minHeight: "100vh", bgcolor: colors.bgDefault, py: 4 }}>
        <Container maxWidth="xl">{initializingContent}</Container>
      </Box>
    );
  }

  const content = (
    <>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={handleBack}
          sx={{ mb: 2, color: colors.text }}
        >
          Back to Templates
        </Button>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 1,
            mb: 1,
          }}
        >
          <Typography variant="h4" sx={{ color: colors.text, fontWeight: 700 }}>
            Customize Your Website
          </Typography>
          {/* Undo/Redo Toolbar (Step 9.2.4) */}
          <UndoRedoToolbar
            canUndo={history.canUndo}
            canRedo={history.canRedo}
            onUndo={handleUndo}
            onRedo={handleRedo}
            undoDescription={history.lastActionDescription}
            redoDescription=""
            isMac={isMac}
          />
        </Box>
        <Typography
          variant="body1"
          component="div"
          sx={{ color: colors.textSecondary }}
        >
          Template:{" "}
          <Chip
            label={template.name}
            size="small"
            color="primary"
            sx={{ ml: 1 }}
          />
        </Typography>
      </Box>

      {/* Success Message */}
      {success && (
        <Alert severity="success" icon={<CheckIcon />} sx={{ mb: 3 }}>
          Website created successfully! Redirecting to dashboard...
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Left Panel - Configuration */}
        <Grid item xs={12} lg={6}>
          <Stack spacing={3}>
            {/* EditorTabs — tab navigation (Step 9.13.6) */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box sx={{ flex: 1 }}>
                <EditorTabs activeTab={activeTab} onChange={handleTabChange} />
              </Box>
              {activeTab === "appearance" && (
                <HelpIcon
                  slug="customize-design"
                  tooltip="Learn about theme customization"
                />
              )}
            </Box>

            {/* Conditional panel rendering based on activeTab */}
            {activeTab === "appearance" && (
              <AppearancePanel
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                headingColor={headingColor}
                bodyColor={bodyColor}
                onPrimaryColorChange={handlePrimaryColorChange}
                onSecondaryColorChange={handleSecondaryColorChange}
                onHeadingColorChange={handleHeadingColorChange}
                onBodyColorChange={handleBodyColorChange}
                primaryColorError={primaryColorError}
                secondaryColorError={secondaryColorError}
                headingColorError={headingColorError}
                bodyColorError={bodyColorError}
                websiteId={blockEditorWebsiteId}
                colors={colors}
              />
            )}

            {activeTab === "layout" && (
              <LayoutPanel
                pages={pages}
                sections={sections}
                maxPagesPerWebsite={MAX_PAGES_PER_WEBSITE}
                onTogglePage={togglePage}
                onMovePage={movePage}
                onPagesChange={handlePagesChange}
                onToggleSection={toggleSection}
                colors={colors}
              />
            )}

            {activeTab === "simple" && (
              <SimpleCustomPanel
                settings={simpleSettings}
                onSettingChange={handleSettingChange}
                onPresetSelect={handlePresetSelect}
                colors={colors}
              />
            )}

            {activeTab === "detailed" && (
              <DetailedCustomPanel
                websiteName={websiteName}
                slug={slug}
                slugError={slugError}
                onWebsiteNameChange={handleWebsiteNameChange}
                onSlugChange={handleSlugChangeFromPanel}
                editorBlocks={editorBlocks}
                onBlockEditorChange={handleBlockEditorChange}
                blockEditorWebsiteId={blockEditorWebsiteId}
                blockEditorPageId={blockEditorPageId}
                blockSaveStatus={blockSaveStatus}
                onTriggerBlockSave={triggerBlockSave}
                disabled={loading}
                colors={colors}
              />
            )}

            {/* Action Buttons — always visible below tabs */}
            <Paper
              sx={{ p: 3, bgcolor: alpha(colors.dark, 0.3), borderRadius: 2 }}
            >
              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  onClick={handleBack}
                  disabled={loading}
                  fullWidth
                >
                  Back
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleCreateWebsite}
                  disabled={!canCreate || loading}
                  fullWidth
                >
                  {loading ? (
                    <CircularProgress size={24} />
                  ) : (
                    "Create Without AI"
                  )}
                </Button>
                <Button
                  variant="contained"
                  onClick={() =>
                    navigate(
                      `/dashboard/websites/create/questionnaire?template=${templateId}`,
                    )
                  }
                  disabled={!canCreate || loading}
                  fullWidth
                >
                  Next: AI Content
                </Button>
              </Stack>
            </Paper>
          </Stack>
        </Grid>

        {/* Right Panel - Live Preview */}
        <Grid item xs={12} lg={6}>
          <Box sx={{ position: "sticky", top: 20 }}>
            <Paper
              sx={{ p: 3, bgcolor: alpha(colors.dark, 0.3), borderRadius: 2 }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 3,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ color: colors.text, fontWeight: 600 }}
                >
                  Live Preview
                </Typography>
                {previewScale !== 100 && (
                  <Typography
                    variant="caption"
                    sx={{ color: colors.textSecondary }}
                  >
                    {previewScale}%
                  </Typography>
                )}
              </Box>

              {/* Selection Overlay — between header and preview (Step 9.14.4) */}
              <SelectionOverlay
                selectedBlock={selectedBlock}
                onEdit={() => setActiveTab("detailed")}
                onDuplicate={handleQuickDuplicate}
                onDelete={handleQuickDelete}
                onMoveUp={handleQuickMoveUp}
                onMoveDown={handleQuickMoveDown}
                onDeselect={handleBlockDeselect}
                colors={colors}
              />

              {/* Preview Container */}
              <Box
                sx={{
                  bgcolor: "#fff",
                  borderRadius: 2,
                  overflow: "hidden",
                  border: `1px solid ${alpha(colors.primary, 0.2)}`,
                  maxHeight: "70vh",
                  overflowY: "auto",
                  transform:
                    previewScale !== 100
                      ? `scale(${previewScale / 100})`
                      : undefined,
                  transformOrigin: "top left",
                  transition: "transform 0.2s ease",
                }}
              >
                {/* Preview Navigation */}
                <Box
                  sx={{
                    py: 2,
                    px: 3,
                    borderBottom: "1px solid #e2e8f0",
                    bgcolor: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: primaryColor,
                      flexShrink: 0,
                    }}
                  >
                    {websiteName || "Your Website"}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 2, overflow: "auto" }}>
                    {pages
                      .filter((p) => p.selected)
                      .map((page) => (
                        <Typography
                          key={page.id}
                          variant="body2"
                          sx={{
                            color: page.isHome ? primaryColor : "#64748b",
                            fontWeight: page.isHome ? 600 : 400,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {page.title}
                        </Typography>
                      ))}
                  </Box>
                </Box>

                {/* Preview Content — clickable block wrappers (Step 9.14.4) */}
                <Box>
                  {previewData && previewData.blocks.length > 0 ? (
                    previewData.blocks.map((block, idx) => {
                      const blockId = (block as Record<string, unknown>)
                        ._blockId
                        ? String((block as Record<string, unknown>)._blockId)
                        : `blk-fallback-${idx}`;
                      const isSelected = selectedBlockId === blockId;
                      const isHovered = hoveredBlockId === blockId;
                      return (
                        <Box
                          key={blockId}
                          data-block-wrapper={blockId}
                          onClick={() => handleBlockSelected(blockId)}
                          onMouseEnter={() => handleBlockHover(blockId)}
                          onMouseLeave={() => handleBlockHover(null)}
                          sx={{
                            cursor: "pointer",
                            position: "relative",
                            transition: "border-color 0.15s ease",
                            border: isSelected
                              ? "2px solid #1976d2"
                              : isHovered
                                ? "2px dashed rgba(25, 118, 210, 0.5)"
                                : "2px solid transparent",
                          }}
                        >
                          <BlockRenderer
                            block={{
                              id: idx,
                              blockType: block.type,
                              content: block.content,
                              sortOrder: block.sortOrder,
                            }}
                            primaryColor={primaryColor}
                            secondaryColor={secondaryColor}
                            headingColor={headingColor}
                            bodyColor={bodyColor}
                          />
                        </Box>
                      );
                    })
                  ) : (
                    <Box sx={{ py: 8, textAlign: "center", color: "#64748b" }}>
                      <Typography variant="body1">
                        No sections enabled for preview
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Preview Footer */}
                <Box
                  sx={{
                    py: 4,
                    px: 2,
                    bgcolor: "#1e293b",
                    color: "#fff",
                    textAlign: "center",
                  }}
                >
                  <Typography variant="body2">
                    © {new Date().getFullYear()} {websiteName || "Your Website"}
                    . All rights reserved.
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Box>
        </Grid>
      </Grid>

      {/* Property Panel for inline block editing (Step 9.14.4) */}
      <PropertyPanel
        open={!!selectedBlockId}
        selectedBlock={selectedBlock}
        onClose={handleBlockDeselect}
        onChange={handlePropertyChange}
        onToggleVisibility={handleToggleBlockVisibility}
        onMoveUp={handleQuickMoveUp}
        onMoveDown={handleQuickMoveDown}
        blockIndex={selectedBlockIndex}
        totalBlocks={totalBlockCount}
        colors={colors}
      />

      {/* Inline Text Editor overlay (Step 9.16.3) */}
      <InlineTextEditor
        open={!!inlineEditState}
        initialValue={inlineEditState?.value || ""}
        fieldPath={inlineEditState?.fieldPath || ""}
        editType={inlineEditState?.editType || "single"}
        rect={inlineEditState?.rect || { top: 0, left: 0, width: 0, height: 0 }}
        onSave={handleInlineEditSave}
        onCancel={handleInlineEditCancel}
        iframeRef={{ current: null }}
      />

      {/* Recovery modal for localStorage backup (Step 5.10) */}
      <RecoveryModal
        open={hasLocalBackup}
        timestamp={localBackupEntry?.timestamp ?? 0}
        onRestore={handleRestoreBackup}
        onDiscard={handleDiscardBackup}
      />

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

      {/* Conflict resolution modal for block editor */}
      {blockConflictData && (
        <ConflictModal
          open={!!blockConflictData}
          conflictData={blockConflictData}
          onResolve={resolveBlockConflict}
        />
      )}

      {/* Keyboard shortcut undo/redo toast feedback (Step 9.2.3) */}
      <Snackbar
        open={toastOpen}
        autoHideDuration={2000}
        onClose={closeToast}
        message={toastMessage}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />

      {/* Keyboard Shortcuts Help Modal (Step 9.6.4) */}
      <KeyboardShortcutsHelp
        open={shortcutHelpOpen}
        onClose={() => setShortcutHelpOpen(false)}
        shortcuts={shortcuts}
        isMac={isMac}
        showFirstTimeHint={true}
      />
    </>
  );

  if (embedded) {
    return content;
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: colors.bgDefault, py: 4 }}>
      <Container maxWidth="xl">{content}</Container>
    </Box>
  );
};

export default CustomizeWebsite;
