// CANONICAL EDITOR: This is the keeper route for website editing (Phase 9 decision).
// Phase 9 UX features are integrated here: BlockLibrary, ThemeManager, PreviewPanel,
// keyboard shortcuts, inline editing, governance UI (ApprovalStatusBanner, SectionLockIndicator).
//
// Block identity: WebsiteEditor uses database IDs exclusively.
// The preview-vs-persisted duality (CustomizeWebsite legacy) does not apply here.
//
// Page reorder: Uses pages from API, reordered via PATCH /api/blocks/reorder
// Full-order editing (LayoutPanel) is not yet integrated — CustomizeWebsite legacy.

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Paper,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Eye,
  House,
  Layers,
  Palette,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import { getDashboardColors } from '../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../context/ThemeContext';
import { PreviewProvider, usePreview } from '../../context/PreviewContext';
import PreviewPanel from '../WebsiteEditor/PreviewPanel';
import { DashboardInput, DashboardSelect, ConfirmationDialog, BottomSheet } from './shared';
import RegenerateButton from '../Editor/RegenerateButton';
import DraggableBlockList from '../Editor/DraggableBlockList';
import { useAutosave } from '../../hooks/useAutosave';
import { useUnsavedChanges } from '../../hooks/useUnsavedChanges';
import { useLocalStorageBackup } from '../../hooks/useLocalStorageBackup';
import { useCollaborativeEditor } from '../../hooks/useCollaborativeEditor';
import { useAuth } from '../../context/AuthContext';
import { usePermissionContext, useWebsiteRole } from '../../context/PermissionContext';
import SaveStatus from '../Editor/SaveStatus';
import ConflictModal from '../Editor/ConflictModal';
import RecoveryModal from '../Editor/RecoveryModal';
import ConnectionStatus from '../Editor/ConnectionStatus';
import BlockLibrary from '../Editor/BlockLibrary';
import InlineTextEditor from '../Editor/InlineTextEditor';
import ResponsiveEditorLayout from '../Editor/ResponsiveEditorLayout';
import MobileActionBar from '../Editor/MobileActionBar';
import MobileFAB from '../Editor/MobileFAB';
import ThemeManager from './ThemeManager';
import ApprovalStatusBanner from './ApprovalStatusBanner';
// SectionLockIndicator is available at ./SectionLockIndicator for per-block lock UI
// when DraggableBlockList is extended to support render props for block items.
import { useShortcutManager } from '../../hooks/useShortcutManager';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// REMOVED: BLOCK_TYPES hardcoded allowlist. Block selection now exclusively
// uses BlockLibrary (fetches from /api/content-types/blocks with all 34 types).

const WebsiteEditorInner = () => {
  const { websiteId } = useParams();
  const navigate = useNavigate();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);

  const [website, setWebsite] = useState(null);
  const [pages, setPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Preview context bridge — Step 4.11
  const { updatePreviewContent, refreshPreview } = usePreview();

  // Mobile state — Step 9.5
  const [pagesBottomSheetOpen, setPagesBottomSheetOpen] = useState(false);

  // Block Library state — Phase 9 gap fix
  const [blockLibraryOpen, setBlockLibraryOpen] = useState(false);

  // Theme Manager state — Step 9.21
  const [showThemeManager, setShowThemeManager] = useState(false);

  // Inline editing state — Step 9.24
  const [inlineEditState, setInlineEditState] = useState(null);
  const iframeRef = useRef(null);

  // Dialogs
  const [pageDialogOpen, setPageDialogOpen] = useState(false);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState(null);

  // Forms
  const [pageForm, setPageForm] = useState({
    title: '',
    path: '',
    isHome: false,
    isPublished: true,
  });
  const [blockForm, setBlockForm] = useState({ blockType: '', content: {} });
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // AI session state
  const [hasAISessions, setHasAISessions] = useState(false);
  const [aiQuestionnaireData, setAiQuestionnaireData] = useState({});

  // Autosave payload — derived from blocks (single source of truth)
  const autosavePayload = useMemo(() => ({ blocks }), [blocks]);
  const isLoadingRef = useRef(true);

  // ETag + updatedAt refs for conflict detection (Step 5.9)
  const etagRef = useRef(null);
  const expectedUpdatedAtRef = useRef(null);

  // Autosave callback — PUT blocks to API with ETag conflict detection
  const handleAutosave = useCallback(async (data) => {
    if (!selectedPage?.id || !websiteId) {
      throw new Error('No page selected');
    }

    // Build headers — include If-Match when we have a stored ETag
    const headers = {};
    if (etagRef.current) {
      headers['If-Match'] = etagRef.current;
    }

    try {
      const response = await axios.put(
        `${API_URL}/websites/${websiteId}/pages/${selectedPage.id}/blocks`,
        {
          blocks: data.blocks.map((b, idx) => ({
            blockType: b.blockType,
            content: b.content,
            variant: b.variant,
            sortOrder: idx,
            isVisible: b.isVisible,
          })),
          ...(expectedUpdatedAtRef.current ? { expectedUpdatedAt: expectedUpdatedAtRef.current } : {}),
        },
        { headers }
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

      // Step 4.11: Bump preview revision so PreviewPanel re-renders after save
      refreshPreview();

      return { updatedAt };
    } catch (error) {
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
  }, [selectedPage?.id, websiteId, refreshPreview]);

  const {
    hasUnsavedChanges,
    saveStatus,
    conflictData,
    triggerSave,
    resolveConflict,
  } = useAutosave({
    entityType: 'page',
    entityId: selectedPage?.id ?? null,
    data: autosavePayload,
    onSave: handleAutosave,
    isLoading: isLoadingRef.current,
  });

  // Unsaved changes warning — intercepts client-side navigation
  // skipBeforeUnload=true because useAutosave already handles beforeunload
  const {
    showDialog: showUnsavedDialog,
    confirmNavigation,
    cancelNavigation,
    saveAndNavigate,
  } = useUnsavedChanges({
    hasUnsavedChanges,
    onSaveBeforeLeave: triggerSave,
    skipBeforeUnload: true,
    saveStatus,
  });

  // LocalStorage backup — saves unsaved data on beforeunload, detects on mount (Step 5.10)
  const backupData = useMemo(() => ({ blocks }), [blocks]);
  const {
    hasBackup,
    backupEntry,
    restoreBackup,
    discardBackup,
    clearBackup,
  } = useLocalStorageBackup({
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
    if (saveStatus === 'saved') {
      clearBackup();
    }
  }, [saveStatus, clearBackup]);

  // Collaborative editing — presence, locks, connection status (Step 7.5)
  const { user } = useAuth();
  const { setCurrentWebsite } = usePermissionContext();
  const websiteRole = useWebsiteRole(websiteId ? Number(websiteId) : undefined) || 'OWNER';

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
    pageId: selectedPage ? String(selectedPage.id) : '',
    websiteId: websiteId ? Number(websiteId) : 0,
    currentUserId: user?.id ?? 0,
    currentUserRole: websiteRole,
  });

  // Keyboard shortcuts — Step 9.23
  const { registerShortcut, unregisterShortcut } = useShortcutManager();

  useEffect(() => {
    registerShortcut({
      key: 'ctrl+s',
      action: (e) => { e.preventDefault(); triggerSave(); },
      description: 'Save changes',
      category: 'Editing',
      scope: 'global',
    });
    registerShortcut({
      key: 'ctrl+b',
      action: (e) => { e.preventDefault(); setBlockLibraryOpen((prev) => !prev); },
      description: 'Toggle block library',
      category: 'Blocks',
      scope: 'editor',
    });
    registerShortcut({
      key: 'escape',
      action: () => { setEditingBlock(null); setInlineEditState(null); },
      description: 'Deselect block / cancel inline edit',
      category: 'Editing',
      scope: 'editor',
    });
    return () => {
      unregisterShortcut('ctrl+s');
      unregisterShortcut('ctrl+b');
      unregisterShortcut('escape');
    };
  }, [registerShortcut, unregisterShortcut, triggerSave]);

  // Sync editor state into PreviewContext — Step 4.11
  // Bridges blocks, selected page, and website metadata so PreviewPanel
  // can render a live srcdoc preview without network requests.
  useEffect(() => {
    if (!selectedPage?.id || !websiteId) return;
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
        colors: website?.colors,
        fonts: website?.fonts,
        theme: website?.theme,
      },
    });
  }, [blocks, selectedPage, website, websiteId, updatePreviewContent]);

  useEffect(() => {
    if (websiteId) {
      fetchWebsiteData();
    }
  }, [websiteId]);

  useEffect(() => {
    if (selectedPage) {
      fetchBlocks(selectedPage.id);
    } else {
      setBlocks([]);
    }
  }, [selectedPage]);

  const fetchWebsiteData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch website details
      const websiteRes = await axios.get(`${API_URL}/websites/${websiteId}`, {
        headers: {},
      });
      setWebsite(websiteRes.data.data);

      // Fetch pages
      const pagesRes = await axios.get(`${API_URL}/websites/${websiteId}/pages`, {
        headers: {},
      });
      const pagesList = pagesRes.data.data || [];
      setPages(pagesList);

      // Auto-select home page or first page
      const homePage = pagesList.find((p) => p.isHome) || pagesList[0];
      if (homePage) {
        setSelectedPage(homePage);
      }

      // Check for AI sessions (detect _aiGenerated metadata in any block)
      try {
        const allBlocks = pagesList.flatMap((p) => p.blocks || []);
        const hasAI = allBlocks.some(
          (b) => b.content && b.content._aiGenerated
        );
        setHasAISessions(hasAI);

        // Retrieve stored questionnaire data from the first AI session block
        if (hasAI) {
          const aiBlock = allBlocks.find((b) => b.content?._aiSessionId);
          if (aiBlock?.content?._aiSessionId) {
            // Try to load questionnaire from sessionStorage
            const stored = sessionStorage.getItem(`ai_questionnaire_${websiteId}`);
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
      console.error('Error fetching website data:', err);
      setError(err.response?.data?.message || 'Failed to load website');
    } finally {
      setLoading(false);
    }
  };

  const fetchBlocks = async (pageId) => {
    try {
      isLoadingRef.current = true;
      const response = await axios.get(`${API_URL}/pages/${pageId}/blocks`, {
        headers: {},
      });
      const fetchedBlocks = response.data.data || [];
      setBlocks(fetchedBlocks);

      // Populate initial ETag from GET response (Step 5.9)
      if (response.headers?.etag) {
        etagRef.current = response.headers.etag;
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error fetching blocks:', err);
    } finally {
      isLoadingRef.current = false;
    }
  };

  const handleCreatePage = async () => {
    try {
      setSubmitting(true);
      setFormError(null);

      const response = await axios.post(`${API_URL}/websites/${websiteId}/pages`, pageForm, {
        headers: {},
      });

      const newPage = response.data.data;
      setPages([...pages, newPage]);
      setPageDialogOpen(false);
      setPageForm({ title: '', path: '', isHome: false, isPublished: true });

      // Select the new page
      setSelectedPage(newPage);
    } catch (err) {
      console.error('Error creating page:', err);
      setFormError(err.response?.data?.message || 'Failed to create page');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePage = async (pageId) => {
    if (!confirm('Are you sure you want to delete this page? This will also delete all blocks.')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/pages/${pageId}`, {
        headers: {},
      });

      const updatedPages = pages.filter((p) => p.id !== pageId);
      setPages(updatedPages);

      // Select another page if current page was deleted
      if (selectedPage?.id === pageId) {
        setSelectedPage(updatedPages[0] || null);
      }
    } catch (err) {
      console.error('Error deleting page:', err);
      alert(err.response?.data?.message || 'Failed to delete page');
    }
  };

  const handleSetHomePage = async (pageId) => {
    try {
      await axios.put(`${API_URL}/pages/${pageId}`, { isHome: true }, { headers: {} });

      // Update pages state
      const updatedPages = pages.map((p) => ({ ...p, isHome: p.id === pageId }));
      setPages(updatedPages);
      setSelectedPage(updatedPages.find((p) => p.id === pageId));
    } catch (err) {
      console.error('Error setting home page:', err);
      alert(err.response?.data?.message || 'Failed to set home page');
    }
  };

  const handleCreateBlock = async () => {
    try {
      setSubmitting(true);
      setFormError(null);

      // Validate content based on blockType
      const validatedContent = validateBlockContent(blockForm.blockType, blockForm.content);
      if (!validatedContent.valid) {
        setFormError(validatedContent.error);
        setSubmitting(false);
        return;
      }

      const response = await axios.post(
        `${API_URL}/pages/${selectedPage.id}/blocks`,
        {
          blockType: blockForm.blockType,
          content: blockForm.content,
          isVisible: true,
        },
        { headers: {} }
      );

      setBlocks([...blocks, response.data.data]);
      setBlockDialogOpen(false);
      setBlockForm({ blockType: '', content: {} });
    } catch (err) {
      console.error('Error creating block:', err);
      setFormError(err.response?.data?.message || 'Failed to create block');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateBlock = async () => {
    try {
      setSubmitting(true);
      setFormError(null);

      const response = await axios.put(
        `${API_URL}/blocks/${editingBlock.id}`,
        { content: blockForm.content },
        { headers: {} }
      );

      setBlocks(blocks.map((b) => (b.id === editingBlock.id ? response.data.data : b)));
      setEditingBlock(null);
      setBlockForm({ blockType: '', content: {} });
    } catch (err) {
      console.error('Error updating block:', err);
      setFormError(err.response?.data?.message || 'Failed to update block');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBlock = async (blockId) => {
    if (!confirm('Are you sure you want to delete this block?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/blocks/${blockId}`, {
        headers: {},
      });

      setBlocks(blocks.filter((b) => b.id !== blockId));
    } catch (err) {
      console.error('Error deleting block:', err);
      alert(err.response?.data?.message || 'Failed to delete block');
    }
  };

  const handleToggleBlockVisibility = async (block) => {
    try {
      const response = await axios.put(
        `${API_URL}/blocks/${block.id}`,
        { isVisible: !block.isVisible },
        { headers: {} }
      );

      setBlocks(blocks.map((b) => (b.id === block.id ? response.data.data : b)));
    } catch (err) {
      console.error('Error toggling block visibility:', err);
      alert('Failed to update block visibility');
    }
  };

  const handleMoveBlock = async (blockId, direction) => {
    const blockIndex = blocks.findIndex((b) => b.id === blockId);
    if (
      (direction === 'up' && blockIndex === 0) ||
      (direction === 'down' && blockIndex === blocks.length - 1)
    ) {
      return;
    }

    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? blockIndex - 1 : blockIndex + 1;
    [newBlocks[blockIndex], newBlocks[targetIndex]] = [
      newBlocks[targetIndex],
      newBlocks[blockIndex],
    ];

    try {
      await axios.patch(
        `${API_URL}/blocks/reorder`,
        {
          pageId: selectedPage.id,
          blockIds: newBlocks.map((b) => b.id),
        },
        { headers: {} }
      );

      // Update sortOrder in local state
      setBlocks(newBlocks.map((b, idx) => ({ ...b, sortOrder: idx })));
    } catch (err) {
      console.error('Error reordering blocks:', err);
      alert('Failed to reorder blocks');
    }
  };

  const handleAIContentUpdate = useCallback((blockId, newContent) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, content: newContent } : b))
    );
  }, []);

  // Inline edit save handler — Step 9.24: nested path update for content fields
  const handleInlineEditSave = useCallback((blockId, fieldPath, newValue) => {
    setBlocks((prev) =>
      prev.map((block) => {
        if (block.id !== blockId) return block;
        const updated = { ...block };
        const parts = fieldPath.split('.');
        let obj = updated;
        for (let i = 0; i < parts.length - 1; i++) {
          obj[parts[i]] = { ...obj[parts[i]] };
          obj = obj[parts[i]];
        }
        obj[parts[parts.length - 1]] = newValue;
        return updated;
      })
    );
  }, []);

  // BlockLibrary insert handler — creates a block via API (Phase 9 gap fix)
  const handleInsertBlockFromLibrary = useCallback(
    async (blockType, position, content) => {
      if (!selectedPage?.id) return;
      try {
        const response = await axios.post(
          `${API_URL}/pages/${selectedPage.id}/blocks`,
          {
            blockType,
            content: content || {},
            isVisible: true,
          },
          { headers: {} }
        );
        const newBlock = response.data.data;
        setBlocks((prev) => {
          if (position === 'beginning') return [newBlock, ...prev];
          if (typeof position === 'number') {
            const copy = [...prev];
            copy.splice(position + 1, 0, newBlock);
            return copy;
          }
          // 'end' or default
          return [...prev, newBlock];
        });
      } catch (err) {
        console.error('Error inserting block from library:', err);
      }
    },
    [selectedPage?.id]
  );

  // Mobile action handlers for MobileActionBar (Phase 9 gap fix)
  const handleMobileSave = useCallback(() => {
    triggerSave();
  }, [triggerSave]);

  const handleMobilePublish = useCallback(async () => {
    // TODO: Wire to full publish flow when available
    try {
      await axios.put(
        `${API_URL}/websites/${websiteId}`,
        { status: 'PUBLISHED' },
        { headers: {} }
      );
      setWebsite((prev) => prev ? { ...prev, status: 'PUBLISHED' } : prev);
    } catch (err) {
      console.error('Error publishing website:', err);
    }
  }, [websiteId]);

  const handleMobilePreview = useCallback(() => {
    if (website?.slug) {
      window.open(`/s/${website.slug}`, '_blank');
    }
  }, [website?.slug]);

  const validateBlockContent = (blockType, content) => {
    switch (blockType) {
      case 'HERO':
        if (!content.heading) {
          return { valid: false, error: 'HERO block requires a heading' };
        }
        break;
      case 'CTA':
        if (!content.heading || !content.ctaText || !content.ctaLink) {
          return { valid: false, error: 'CTA block requires heading, ctaText, and ctaLink' };
        }
        break;
      case 'FEATURES':
        if (
          !content.features ||
          !Array.isArray(content.features) ||
          content.features.length === 0
        ) {
          return { valid: false, error: 'FEATURES block requires at least one feature' };
        }
        break;
      case 'TESTIMONIALS':
        if (
          !content.testimonials ||
          !Array.isArray(content.testimonials) ||
          content.testimonials.length === 0
        ) {
          return { valid: false, error: 'TESTIMONIALS block requires at least one testimonial' };
        }
        break;
    }
    return { valid: true };
  };

  const getBlockContentPreview = (block) => {
    const content = block.content || {};
    const truncate = (str, maxLen = 40) => {
      if (!str) return '';
      return str.length > maxLen ? str.substring(0, maxLen) + '...' : str;
    };

    switch (block.blockType) {
      case 'HERO':
        return content.heading ? `HERO – ${truncate(content.heading)}` : 'HERO – (no heading)';
      case 'CTA':
        return content.heading ? `CTA – ${truncate(content.heading)}` : 'CTA – (no heading)';
      case 'FEATURES':
        const featCount = content.features?.length || 0;
        return `FEATURES – ${featCount} feature${featCount !== 1 ? 's' : ''}`;
      case 'TESTIMONIALS':
        const testCount = content.testimonials?.length || 0;
        return `TESTIMONIALS – ${testCount} testimonial${testCount !== 1 ? 's' : ''}`;
      case 'CONTACT':
        const parts = [];
        if (content.email) parts.push('email');
        if (content.phone) parts.push('phone');
        if (content.address) parts.push('address');
        if (content.showForm) parts.push('form');
        return `CONTACT – ${parts.length > 0 ? parts.join(', ') : 'empty'}`;
      default:
        return block.blockType;
    }
  };

  const renderBlockForm = () => {
    const blockType = blockForm.blockType || editingBlock?.blockType;
    const content = blockForm.content;

    switch (blockType) {
      case 'HERO':
        return (
          <>
            <DashboardInput
              fullWidth
              label="Heading *"
              labelPlacement="floating"
              value={content.heading || ''}
              onChange={(e) =>
                setBlockForm({ ...blockForm, content: { ...content, heading: e.target.value } })
              }
              sx={{ mb: 2 }}
              helperText="Main headline text (required)"
            />
            <DashboardInput
              fullWidth
              label="Subheading"
              labelPlacement="floating"
              value={content.subheading || ''}
              onChange={(e) =>
                setBlockForm({ ...blockForm, content: { ...content, subheading: e.target.value } })
              }
              sx={{ mb: 2 }}
              helperText="Supporting text (optional)"
            />
            <DashboardInput
              fullWidth
              label="CTA Text"
              labelPlacement="floating"
              value={content.ctaText || ''}
              onChange={(e) =>
                setBlockForm({ ...blockForm, content: { ...content, ctaText: e.target.value } })
              }
              sx={{ mb: 2 }}
              helperText="Button text (optional)"
            />
            <DashboardInput
              fullWidth
              label="CTA Link"
              labelPlacement="floating"
              value={content.ctaLink || ''}
              onChange={(e) =>
                setBlockForm({ ...blockForm, content: { ...content, ctaLink: e.target.value } })
              }
              sx={{ mb: 2 }}
              helperText="Button URL (optional)"
            />
            <DashboardInput
              fullWidth
              label="Background Image URL"
              labelPlacement="floating"
              value={content.backgroundImage || ''}
              onChange={(e) =>
                setBlockForm({
                  ...blockForm,
                  content: { ...content, backgroundImage: e.target.value },
                })
              }
              sx={{ mb: 2 }}
              helperText="Image URL for background (optional)"
            />
            <DashboardSelect
              fullWidth
              label="Alignment"
              value={content.alignment || 'center'}
              onChange={(e) =>
                setBlockForm({ ...blockForm, content: { ...content, alignment: e.target.value } })
              }
              containerSx={{ mb: 2 }}
            >
              <MenuItem value="center">Center</MenuItem>
              <MenuItem value="left">Left</MenuItem>
              <MenuItem value="right">Right</MenuItem>
            </DashboardSelect>
          </>
        );
      case 'CTA':
        return (
          <>
            <DashboardInput
              fullWidth
              label="Heading *"
              labelPlacement="floating"
              value={content.heading || ''}
              onChange={(e) =>
                setBlockForm({ ...blockForm, content: { ...content, heading: e.target.value } })
              }
              sx={{ mb: 2 }}
              helperText="Call to action headline (required)"
            />
            <DashboardInput
              fullWidth
              label="Subheading"
              labelPlacement="floating"
              value={content.subheading || ''}
              onChange={(e) =>
                setBlockForm({ ...blockForm, content: { ...content, subheading: e.target.value } })
              }
              sx={{ mb: 2 }}
              helperText="Supporting text (optional)"
            />
            <DashboardInput
              fullWidth
              label="CTA Button Text *"
              labelPlacement="floating"
              value={content.ctaText || ''}
              onChange={(e) =>
                setBlockForm({ ...blockForm, content: { ...content, ctaText: e.target.value } })
              }
              sx={{ mb: 2 }}
              helperText="Button text (required)"
            />
            <DashboardInput
              fullWidth
              label="CTA Link *"
              labelPlacement="floating"
              value={content.ctaLink || ''}
              onChange={(e) =>
                setBlockForm({ ...blockForm, content: { ...content, ctaLink: e.target.value } })
              }
              sx={{ mb: 2 }}
              helperText="Button URL (required)"
            />
            <DashboardInput
              fullWidth
              label="Background Image URL"
              labelPlacement="floating"
              value={content.backgroundImage || ''}
              onChange={(e) =>
                setBlockForm({
                  ...blockForm,
                  content: { ...content, backgroundImage: e.target.value },
                })
              }
              helperText="Image URL for background (optional)"
            />
          </>
        );
      case 'FEATURES':
        return (
          <>
            <DashboardInput
              fullWidth
              label="Heading"
              labelPlacement="floating"
              value={content.heading || ''}
              onChange={(e) =>
                setBlockForm({ ...blockForm, content: { ...content, heading: e.target.value } })
              }
              sx={{ mb: 2 }}
              helperText="Section heading (optional)"
            />
            <Typography variant="subtitle2" sx={{ mb: 1, color: colors.text }}>
              Features
            </Typography>
            {(content.features || []).map((feature, index) => (
              <Card key={index} sx={{ mb: 2, p: 2, bgcolor: alpha(colors.dark, 0.3) }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2" fontWeight={600}>
                    Feature {index + 1}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => {
                      const newFeatures = content.features.filter((_, i) => i !== index);
                      setBlockForm({
                        ...blockForm,
                        content: { ...content, features: newFeatures },
                      });
                    }}
                  >
                    <Trash2 size={16} />
                  </IconButton>
                </Box>
                <DashboardInput
                  fullWidth
                  label="Icon"
                  labelPlacement="floating"
                  value={feature.icon || ''}
                  onChange={(e) => {
                    const newFeatures = [...content.features];
                    newFeatures[index] = { ...feature, icon: e.target.value };
                    setBlockForm({ ...blockForm, content: { ...content, features: newFeatures } });
                  }}
                  sx={{ mb: 1 }}
                  size="small"
                  helperText="Icon name or URL"
                />
                <DashboardInput
                  fullWidth
                  label="Title *"
                  labelPlacement="floating"
                  value={feature.title || ''}
                  onChange={(e) => {
                    const newFeatures = [...content.features];
                    newFeatures[index] = { ...feature, title: e.target.value };
                    setBlockForm({ ...blockForm, content: { ...content, features: newFeatures } });
                  }}
                  sx={{ mb: 1 }}
                  size="small"
                />
                <DashboardInput
                  fullWidth
                  label="Description *"
                  labelPlacement="floating"
                  value={feature.description || ''}
                  onChange={(e) => {
                    const newFeatures = [...content.features];
                    newFeatures[index] = { ...feature, description: e.target.value };
                    setBlockForm({ ...blockForm, content: { ...content, features: newFeatures } });
                  }}
                  multiline
                  rows={2}
                  size="small"
                />
              </Card>
            ))}
            <Button
              startIcon={<Plus size={18} />}
              onClick={() => {
                const newFeatures = [
                  ...(content.features || []),
                  { icon: '', title: '', description: '' },
                ];
                setBlockForm({ ...blockForm, content: { ...content, features: newFeatures } });
              }}
              sx={{ textTransform: 'none' }}
            >
              Add Feature
            </Button>
          </>
        );
      case 'TESTIMONIALS':
        return (
          <>
            <DashboardInput
              fullWidth
              label="Heading"
              labelPlacement="floating"
              value={content.heading || ''}
              onChange={(e) =>
                setBlockForm({ ...blockForm, content: { ...content, heading: e.target.value } })
              }
              sx={{ mb: 2 }}
              helperText="Section heading (optional)"
            />
            <Typography variant="subtitle2" sx={{ mb: 1, color: colors.text }}>
              Testimonials
            </Typography>
            {(content.testimonials || []).map((testimonial, index) => (
              <Card key={index} sx={{ mb: 2, p: 2, bgcolor: alpha(colors.dark, 0.3) }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2" fontWeight={600}>
                    Testimonial {index + 1}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => {
                      const newTestimonials = content.testimonials.filter((_, i) => i !== index);
                      setBlockForm({
                        ...blockForm,
                        content: { ...content, testimonials: newTestimonials },
                      });
                    }}
                  >
                    <Trash2 size={16} />
                  </IconButton>
                </Box>
                <DashboardInput
                  fullWidth
                  label="Quote *"
                  labelPlacement="floating"
                  value={testimonial.quote || ''}
                  onChange={(e) => {
                    const newTestimonials = [...content.testimonials];
                    newTestimonials[index] = { ...testimonial, quote: e.target.value };
                    setBlockForm({
                      ...blockForm,
                      content: { ...content, testimonials: newTestimonials },
                    });
                  }}
                  sx={{ mb: 1 }}
                  multiline
                  rows={2}
                  size="small"
                />
                <DashboardInput
                  fullWidth
                  label="Author *"
                  labelPlacement="floating"
                  value={testimonial.author || ''}
                  onChange={(e) => {
                    const newTestimonials = [...content.testimonials];
                    newTestimonials[index] = { ...testimonial, author: e.target.value };
                    setBlockForm({
                      ...blockForm,
                      content: { ...content, testimonials: newTestimonials },
                    });
                  }}
                  sx={{ mb: 1 }}
                  size="small"
                />
                <DashboardInput
                  fullWidth
                  label="Position"
                  labelPlacement="floating"
                  value={testimonial.position || ''}
                  onChange={(e) => {
                    const newTestimonials = [...content.testimonials];
                    newTestimonials[index] = { ...testimonial, position: e.target.value };
                    setBlockForm({
                      ...blockForm,
                      content: { ...content, testimonials: newTestimonials },
                    });
                  }}
                  sx={{ mb: 1 }}
                  size="small"
                  helperText="Job title / company"
                />
                <DashboardInput
                  fullWidth
                  label="Avatar URL"
                  labelPlacement="floating"
                  value={testimonial.avatarUrl || ''}
                  onChange={(e) => {
                    const newTestimonials = [...content.testimonials];
                    newTestimonials[index] = { ...testimonial, avatarUrl: e.target.value };
                    setBlockForm({
                      ...blockForm,
                      content: { ...content, testimonials: newTestimonials },
                    });
                  }}
                  size="small"
                  helperText="Photo URL"
                />
              </Card>
            ))}
            <Button
              startIcon={<Plus size={18} />}
              onClick={() => {
                const newTestimonials = [
                  ...(content.testimonials || []),
                  { quote: '', author: '', position: '', avatarUrl: '' },
                ];
                setBlockForm({
                  ...blockForm,
                  content: { ...content, testimonials: newTestimonials },
                });
              }}
              sx={{ textTransform: 'none' }}
            >
              Add Testimonial
            </Button>
          </>
        );
      case 'CONTACT':
        return (
          <>
            <DashboardInput
              fullWidth
              label="Heading"
              labelPlacement="floating"
              value={content.heading || ''}
              onChange={(e) =>
                setBlockForm({ ...blockForm, content: { ...content, heading: e.target.value } })
              }
              sx={{ mb: 2 }}
              helperText="Contact section heading (optional)"
            />
            <DashboardInput
              fullWidth
              label="Email"
              labelPlacement="floating"
              value={content.email || ''}
              onChange={(e) =>
                setBlockForm({ ...blockForm, content: { ...content, email: e.target.value } })
              }
              sx={{ mb: 2 }}
              helperText="Contact email (optional)"
            />
            <DashboardInput
              fullWidth
              label="Phone"
              labelPlacement="floating"
              value={content.phone || ''}
              onChange={(e) =>
                setBlockForm({ ...blockForm, content: { ...content, phone: e.target.value } })
              }
              sx={{ mb: 2 }}
              helperText="Contact phone (optional)"
            />
            <DashboardInput
              fullWidth
              label="Address"
              labelPlacement="floating"
              value={content.address || ''}
              onChange={(e) =>
                setBlockForm({ ...blockForm, content: { ...content, address: e.target.value } })
              }
              sx={{ mb: 2 }}
              multiline
              rows={2}
              helperText="Physical address (optional)"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={content.showForm || false}
                  onChange={(e) =>
                    setBlockForm({
                      ...blockForm,
                      content: { ...content, showForm: e.target.checked },
                    })
                  }
                />
              }
              label="Show contact form"
            />
          </>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
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
    <Container maxWidth="xl" sx={{ px: { xs: 0, sm: 2 }, pb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={() => navigate('/dashboard?tab=websites')}>
            <ArrowLeft size={18} />
          </IconButton>
          <Box>
            <Typography variant="h5" sx={{ color: colors.text, fontWeight: 700 }}>
              {website?.name}
            </Typography>
            <Box display="flex" gap={1} mt={0.5}>
              <Chip label={website?.status} size="small" />
              <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                /s/{website?.slug}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box display="flex" alignItems="center" gap={2}>
          {/* Autosave status indicator */}
          <SaveStatus
            status={saveStatus}
            onRetry={triggerSave}
          />
          {/* WebSocket connection status (Step 7.5) */}
          <ConnectionStatus
            connectionState={connectionState}
            connectedUsers={activeUsers.length}
          />

          {website?.status === 'PUBLISHED' && (
            <Button
              variant="outlined"
              startIcon={<Eye size={18} />}
              onClick={() => window.open(`/s/${website?.slug}`, '_blank')}
              sx={{ textTransform: 'none' }}
            >
              View Live
            </Button>
          )}
        </Box>
      </Box>

      {/* Governance UI — Step 9.25: ApprovalStatusBanner */}
      <ApprovalStatusBanner
        websiteId={websiteId ? Number(websiteId) : 0}
        userRole={websiteRole}
        userId={user?.id ?? 0}
      />

      <ResponsiveEditorLayout>
      <Grid container spacing={3}>
        {/* Mobile page chips row — Step 9.5.1 */}
        {isMobile && pages.length > 0 && (
          <Grid item xs={12}>
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                overflowX: 'auto',
                pb: 1,
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
                  onClick={() => setSelectedPage(page)}
                  color={selectedPage?.id === page.id ? 'primary' : 'default'}
                  variant={selectedPage?.id === page.id ? 'filled' : 'outlined'}
                  sx={{
                    flexShrink: 0,
                    minHeight: 36,
                    borderColor: alpha(colors.primary, 0.3),
                  }}
                />
              ))}
            </Box>
          </Grid>
        )}

        {/* Pages Sidebar — hidden on mobile (Step 9.5.1) */}
        <Grid item xs={12} md={3} sx={{ display: { xs: 'none', md: 'block' } }}>
          <Paper sx={{ p: 2, bgcolor: alpha(colors.dark, 0.5), borderRadius: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" sx={{ color: colors.text, fontWeight: 600 }}>
                Pages
              </Typography>
              <IconButton
                size="small"
                onClick={() => setPageDialogOpen(true)}
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
                  onClick={() => setSelectedPage(page)}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    '&.Mui-selected': {
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
                        >
                          <House size={16} />
                        </IconButton>
                        <IconButton
                          size="small"
                          edge="end"
                          onClick={() => handleDeletePage(page.id)}
                        >
                          <Trash2 size={16} />
                        </IconButton>
                      </>
                    )}
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Blocks & Preview */}
        <Grid item xs={12} md={9}>
          {selectedPage ? (
            <Grid container spacing={3}>
              {/* Blocks List */}
              <Grid item xs={12} md={5}>
                <Paper sx={{ p: 2, bgcolor: alpha(colors.dark, 0.5), borderRadius: 2 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" sx={{ color: colors.text, fontWeight: 600 }}>
                      Blocks
                    </Typography>
                    <Box display="flex" gap={0.5}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Layers size={16} />}
                        onClick={() => setBlockLibraryOpen(true)}
                        sx={{ textTransform: 'none', minHeight: 36 }}
                        aria-label="Open block library"
                      >
                        Library
                      </Button>
                      <Button
                        size="small"
                        variant={showThemeManager ? 'contained' : 'outlined'}
                        startIcon={<Palette size={16} />}
                        onClick={() => setShowThemeManager((prev) => !prev)}
                        sx={{ textTransform: 'none', minHeight: 36 }}
                        aria-label="Toggle theme manager"
                      >
                        Theme
                      </Button>
                      <IconButton
                        size="small"
                        onClick={() => setBlockDialogOpen(true)}
                        sx={{ minWidth: 48, minHeight: 48 }}
                        aria-label="Add block"
                      >
                        <Plus size={18} />
                      </IconButton>
                    </Box>
                  </Box>

                  <DraggableBlockList
                    blocks={blocks}
                    pageId={selectedPage?.id}
                    websiteId={websiteId}
                    onBlocksChange={(reordered) => {
                      setBlocks(reordered);
                    }}
                    onBlockSelect={(blockId) => {
                      const block = blocks.find((b) => b.id === blockId);
                      if (block) {
                        setEditingBlock(block);
                        setBlockForm({ blockType: block.blockType, content: block.content });
                      }
                    }}
                  />

                  {/* ThemeManager — Step 9.21 */}
                  {showThemeManager && (
                    <Box sx={{ mt: 2 }}>
                      <Divider sx={{ mb: 2 }} />
                      <ThemeManager
                        websiteId={websiteId}
                        currentThemeId={website?.themeId || null}
                        onThemeChange={() => {
                          refreshPreview();
                          fetchWebsiteData();
                        }}
                      />
                    </Box>
                  )}
                </Paper>
              </Grid>

              {/* Preview — Step 4.11: PreviewPanel with live srcdoc */}
              <Grid item xs={12} md={7}>
                <Paper sx={{ p: 0, bgcolor: alpha(colors.dark, 0.5), borderRadius: 2, overflow: 'hidden' }}>
                  <Box sx={{ height: { xs: 400, md: 600 } }}>
                    <PreviewPanel
                      websiteId={websiteId}
                      pageId={selectedPage?.id}
                      onBlockSelected={(blockId) => {
                        const block = blocks.find((b) => String(b.id) === blockId);
                        if (block) {
                          setEditingBlock(block);
                          setBlockForm({ blockType: block.blockType, content: block.content });
                        }
                      }}
                      onInlineEditStart={(data) => setInlineEditState(data)}
                      iframeRefCallback={(ref) => { iframeRef.current = ref?.current ?? null; }}
                    />
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          ) : (
            <Typography
              variant="body1"
              sx={{ color: colors.textSecondary, textAlign: 'center', py: 8 }}
            >
              Select or create a page to get started
            </Typography>
          )}
        </Grid>
      </Grid>
      </ResponsiveEditorLayout>

      {/* InlineTextEditor overlay — Step 9.24 */}
      {inlineEditState && (
        <InlineTextEditor
          open={!!inlineEditState}
          initialValue={inlineEditState.value}
          fieldPath={inlineEditState.fieldPath}
          editType={inlineEditState.editType || 'single'}
          rect={inlineEditState.rect}
          iframeRef={{ current: iframeRef.current }}
          onSave={(newValue) => {
            handleInlineEditSave(
              inlineEditState.blockId,
              inlineEditState.fieldPath,
              newValue
            );
            setInlineEditState(null);
          }}
          onCancel={() => setInlineEditState(null)}
        />
      )}

      {/* BlockLibrary drawer — Phase 9 gap fix */}
      {selectedPage && (
        <BlockLibrary
          open={blockLibraryOpen}
          onClose={() => setBlockLibraryOpen(false)}
          pageId={selectedPage?.id}
          blocks={blocks}
          onInsertBlock={handleInsertBlockFromLibrary}
          closeAfterInsert={false}
          currentUserRole={websiteRole}
        />
      )}

      {/* MobileFAB — opens block library on mobile (Phase 9 gap fix) */}
      {isMobile && selectedPage && (
        <MobileFAB onOpen={() => setBlockLibraryOpen(true)} />
      )}

      {/* MobileActionBar — save/publish/preview on mobile (Phase 9 gap fix) */}
      {isMobile && (
        <MobileActionBar
          onSave={handleMobileSave}
          onPublish={handleMobilePublish}
          onPreview={handleMobilePreview}
          isSaving={saveStatus === 'saving'}
          isMac={typeof navigator !== 'undefined' && /Mac|iPad|iPhone/.test(navigator.userAgent)}
        />
      )}

      {/* Create Page Dialog */}
      <Dialog
        open={pageDialogOpen}
        onClose={() => !submitting && setPageDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: colors.bgDefault, color: colors.text }}>
          Create Page
        </DialogTitle>
        <DialogContent sx={{ bgcolor: colors.bgDefault, pt: 3 }}>
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
            onChange={(e) => setPageForm({ ...pageForm, title: e.target.value })}
            sx={{ mb: 2 }}
          />

          <DashboardInput
            fullWidth
            label="Path"
            labelPlacement="floating"
            value={pageForm.path}
            onChange={(e) => setPageForm({ ...pageForm, path: e.target.value })}
            helperText="Must start with / (example: /about)"
            sx={{ mb: 2 }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={pageForm.isHome}
                onChange={(e) => setPageForm({ ...pageForm, isHome: e.target.checked })}
              />
            }
            label="Set as home page"
          />
        </DialogContent>

        <DialogActions sx={{ bgcolor: colors.bgDefault, px: 3, pb: 2 }}>
          <Button onClick={() => setPageDialogOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleCreatePage}
            variant="contained"
            disabled={submitting || !pageForm.title || !pageForm.path}
          >
            {submitting ? <CircularProgress size={24} /> : 'Create'}
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
            setBlockForm({ blockType: '', content: {} });
            setFormError(null);
          }
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: colors.bgDefault, color: colors.text }}>
          {editingBlock ? 'Edit Block' : 'Add Block'}
        </DialogTitle>

        <DialogContent sx={{ bgcolor: colors.bgDefault, pt: 3 }}>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}

          {!editingBlock && (
            <Box sx={{ mb: 3 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                Use the Block Library to add new blocks with full search and categories.
              </Alert>
              <Button
                variant="outlined"
                startIcon={<Plus size={18} />}
                onClick={() => {
                  setBlockDialogOpen(false);
                  setBlockLibraryOpen(true);
                }}
                fullWidth
              >
                Open Block Library
              </Button>
            </Box>
          )}

          {(blockForm.blockType || editingBlock) && renderBlockForm()}
        </DialogContent>

        <DialogActions sx={{ bgcolor: colors.bgDefault, px: 3, pb: 2 }}>
          <Button
            onClick={() => {
              setBlockDialogOpen(false);
              setEditingBlock(null);
              setBlockForm({ blockType: '', content: {} });
              setFormError(null);
            }}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={editingBlock ? handleUpdateBlock : handleCreateBlock}
            variant="contained"
            disabled={submitting || (!editingBlock && !blockForm.blockType)}
          >
            {submitting ? <CircularProgress size={24} /> : editingBlock ? 'Update' : 'Add'}
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
            position: 'fixed',
            bottom: 24,
            right: 24,
            '& .MuiFab-primary': {
              bgcolor: colors.primary,
              '&:hover': { bgcolor: alpha(colors.primary, 0.85) },
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
                  '&.Mui-selected': {
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
