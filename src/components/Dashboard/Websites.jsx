import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import axios from 'axios';
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
} from '@mui/material';
import {
  ArrowLeft,
  ChartBar,
  CircleCheck,
  Eye,
  EyeOff,
  Globe,
  LayoutTemplate,
  Pencil,
  Plus,
  RotateCcw,
  Settings,
  Trash,
  Trash2,
  Upload,
  Users,
  X,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getDashboardColors } from '../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../context/ThemeContext';
import WebsiteAnalytics from './WebsiteAnalytics';
import CollaboratorModal from './CollaboratorModal';
import { useStoreWebsiteCreation } from '../../hooks/useStoreWebsiteCreation';
import { getWebsiteTemplates, getStoreTemplates, refreshTemplateCache } from '../../templates/templateApi';
import ColorPickerWithAlpha from '../UI/ColorPickerWithAlpha';
import {
  DashboardActionButton,
  DashboardInput,
  DashboardSelect,
  PageHeader,
  DashboardMetricCard,
  EmptyState,
  SearchBar,
  getTrendProps,
} from './shared';
import {
  ROLE_PERMISSIONS,
  WEBSITE_ACTIONS,
} from '../../context/PermissionContext';
import LanguageIcon from '@mui/icons-material/Language';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import StorefrontIcon from '@mui/icons-material/Storefront';
import PeopleIcon from '@mui/icons-material/People';

// ── Role badge colors (Step 7.4.2) ──────────────────────────────────────────
const ROLE_COLORS = { OWNER: '#d4a017', ADMIN: '#2196f3', EDITOR: '#4caf50', VIEWER: '#9e9e9e' };

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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const SkeletonCard = () => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);

  return (
    <Card
      sx={{
        aspectRatio: '16/10',
        position: 'relative',
        overflow: 'hidden',
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
          position: 'absolute',
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
    const websiteItems = deletedWebsites.map((w) => ({ ...w, itemType: 'website' }));
    const storeItems = deletedStores.map((s) => ({ ...s, itemType: 'store' }));
    return [...websiteItems, ...storeItems].sort(
      (a, b) => new Date(b.deletedAt) - new Date(a.deletedAt)
    );
  }, [deletedWebsites, deletedStores]);
  // Determine view mode from initialView prop (removed tabs)
  const viewMode = initialView === 'deleted' ? 'deleted' : 'active';
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
    name: '',
    slug: '',
    primaryColor: '#378C92',
    isPublic: true,
    templateId: '',
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
    websiteName: '',
    websiteSlug: '',
    primaryColor: '#378C92',
    storeName: '',
    storeSlug: '',
    currency: 'USD',
    templateId: '',
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
      ? loader().then(() => Promise.all([getWebsiteTemplates(), getStoreTemplates()]))
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
          setTemplatesError('Failed to load templates');
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
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [loadTemplates]);

  // Settings dialog state
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [editingWebsite, setEditingWebsite] = useState(null);
  const [settingsFormData, setSettingsFormData] = useState({
    name: '',
    primaryColor: '',
    logoUrl: '',
    faviconUrl: '',
    metaTitle: '',
    metaDescription: '',
  });
  const [settingsError, setSettingsError] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);

  // Analytics dialog state
  const [analyticsDialogOpen, setAnalyticsDialogOpen] = useState(false);
  const [selectedWebsiteForAnalytics, setSelectedWebsiteForAnalytics] = useState(null);

  // Upgrade dialog state
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [planLimitMessage, setPlanLimitMessage] = useState('');

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [websiteToDelete, setWebsiteToDelete] = useState(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Search state for server-side filtering
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebouncedValue(searchQuery, 300);

  // Role filter state (Step 7.4.1)
  const [roleFilter, setRoleFilter] = useState('all'); // 'all' | 'owned' | 'shared'

  // Collaborator modal state (Step 7.4.4)
  const [collaboratorModalOpen, setCollaboratorModalOpen] = useState(false);
  const [collaboratorWebsiteId, setCollaboratorWebsiteId] = useState(null);
  const [collaboratorWebsiteRole, setCollaboratorWebsiteRole] = useState('VIEWER');

  // Restore state
  const [restoring, setRestoring] = useState(false);

  // Permanent delete confirmation state
  const [permanentDeleteDialogOpen, setPermanentDeleteDialogOpen] = useState(false);
  const [websiteToPermanentlyDelete, setWebsiteToPermanentlyDelete] = useState(null);
  const [permanentDeleteConfirmText, setPermanentDeleteConfirmText] = useState('');
  const [permanentlyDeleting, setPermanentlyDeleting] = useState(false);

  useEffect(() => {
    // Reset pagination when view mode changes
    setActivePage(1);
    setDeletedPage(1);
    setWebsites([]);
    setDeletedWebsites([]);
    setActiveHasMore(true);
    setDeletedHasMore(true);

    // Skip fetching for create-template view
    if (initialView === 'create-template') {
      setLoading(false);
      return;
    }

    if (viewMode === 'active') {
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
      const response = await axios.get(`${API_URL}/websites`, {
        params,
      });

      const newData = response.data.data || [];
      if (reset) {
        setWebsites(newData);
      } else {
        setWebsites((prev) => [...prev, ...newData]);
      }

      setActiveHasMore(newData.length === PAGE_SIZE);
      setActivePage(page);
    } catch (err) {
      console.error('Error fetching websites:', err);
      setError(err.response?.data?.message || 'Failed to load websites');
    } finally {
      setLoading(false);
      setActiveLoadingMore(false);
    }
  };

  // Re-fetch from page 1 when search changes
  useEffect(() => {
    if (viewMode === 'active') {
      setActivePage(1);
      setWebsites([]);
      setActiveHasMore(true);
      fetchWebsites(1, true);
    }
  }, [debouncedSearch]);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/websites/stats`);
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
      console.error('Error fetching website stats:', err);
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
      const response = await axios.get(`${API_URL}/websites?status=archived`, {
        params: {
          page,
          limit: PAGE_SIZE,
        },
      });

      const newData = response.data.data || [];
      if (reset) {
        setDeletedWebsites(newData);
      } else {
        setDeletedWebsites((prev) => [...prev, ...newData]);
      }

      setDeletedHasMore(newData.length === PAGE_SIZE);
      setDeletedPage(page);
    } catch (err) {
      console.error('Error fetching deleted websites:', err);
      setError(err.response?.data?.message || 'Failed to load deleted websites');
    } finally {
      setLoading(false);
      setDeletedLoadingMore(false);
    }
  };

  const fetchDeletedStores = async () => {
    try {
      const response = await axios.get(`${API_URL}/stores?deleted=true`);
      setDeletedStores(response.data.data || []);
    } catch (err) {
      console.error('Error fetching deleted stores:', err);
    }
  };

  const fetchAllDeletedItems = async (page = 1, reset = false) => {
    await Promise.all([fetchDeletedWebsites(page, reset), fetchDeletedStores()]);
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
          if (viewMode === 'active') {
            loadMoreWebsites();
          } else {
            loadMoreDeletedWebsites();
          }
        }
      },
      { threshold: 0.1 }
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
      await axios.post(`${API_URL}/websites/${websiteId}/restore`, {});

      // Refresh deleted items list
      await fetchAllDeletedItems(1, true);
      // Also refresh active websites list
      await fetchWebsites();
      fetchStats();
    } catch (err) {
      console.error('Error restoring website:', err);
      alert(err.response?.data?.message || 'Failed to restore website');
    } finally {
      setRestoring(false);
    }
  };

  const handleRestoreStore = async (storeId) => {
    try {
      setRestoring(true);
      await axios.post(`${API_URL}/stores/${storeId}/restore`, {});

      // Refresh deleted items list
      await fetchAllDeletedItems(1, true);
      fetchStats();
    } catch (err) {
      console.error('Error restoring store:', err);
      alert(err.response?.data?.message || 'Failed to restore store');
    } finally {
      setRestoring(false);
    }
  };

  const handleRestoreItem = async (item) => {
    if (item.itemType === 'store') {
      await handleRestoreStore(item.id);
    } else {
      await handleRestoreWebsite(item.id);
    }
  };

  const handleOpenPermanentDeleteDialog = (website) => {
    setWebsiteToPermanentlyDelete(website);
    setPermanentDeleteConfirmText('');
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
      if (websiteToPermanentlyDelete.itemType === 'store') {
        await axios.delete(`${API_URL}/stores/${websiteToPermanentlyDelete.id}/permanent`);
        setDeletedStores(deletedStores.filter((s) => s.id !== websiteToPermanentlyDelete.id));
      } else {
        await axios.delete(`${API_URL}/websites/${websiteToPermanentlyDelete.id}/permanent`);
        setDeletedWebsites(deletedWebsites.filter((w) => w.id !== websiteToPermanentlyDelete.id));
      }

      setPermanentDeleteDialogOpen(false);
      setWebsiteToPermanentlyDelete(null);
      setPermanentDeleteConfirmText('');
      fetchStats();
    } catch (err) {
      console.error('Error permanently deleting item:', err);
      alert(err.response?.data?.message || 'Failed to permanently delete item');
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

      const response = await axios.post(`${API_URL}/websites`, formData);

      setWebsites([...websites, response.data.data]);
      setCreateDialogOpen(false);
      setFormData({ name: '', slug: '', primaryColor: '#378C92', isPublic: true, templateId: '' });
      fetchStats();
    } catch (err) {
      console.error('Error creating website:', err);

      // Check if error is a plan limit error
      if (err.response?.data?.code === 'PLAN_LIMIT_REACHED') {
        setCreateDialogOpen(false);
        setPlanLimitMessage(err.response.data.message);
        setUpgradeDialogOpen(true);
      } else {
        setFormError(err.response?.data?.message || 'Failed to create website');
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
        }
      );

      // Success - refresh websites list and close dialog
      await fetchWebsites();
      fetchStats();
      setCreateStoreDialogOpen(false);
      setStoreFormData({
        websiteName: '',
        websiteSlug: '',
        primaryColor: '#378C92',
        storeName: '',
        storeSlug: '',
        currency: 'USD',
        templateId: '',
      });
    } catch (err) {
      console.error('Error creating store website:', err);

      // Check if error is a plan limit error
      if (err.code === 'PLAN_LIMIT_REACHED') {
        setCreateStoreDialogOpen(false);
        setPlanLimitMessage(err.message);
        setUpgradeDialogOpen(true);
      }
      // Error is already set in the hook, it will be displayed in the dialog
    }
  };

  const handlePublish = async (websiteId) => {
    try {
      const response = await axios.post(`${API_URL}/websites/${websiteId}/publish`, {});

      // Update website status in state
      setWebsites(websites.map((w) => (w.id === websiteId ? { ...w, status: 'PUBLISHED' } : w)));
      fetchStats();
    } catch (err) {
      console.error('Error publishing website:', err);
      alert(err.response?.data?.message || 'Failed to publish website');
    }
  };

  const handleUnpublish = async (websiteId) => {
    try {
      const response = await axios.post(`${API_URL}/websites/${websiteId}/unpublish`, {});

      // Update website status in state
      setWebsites(websites.map((w) => (w.id === websiteId ? { ...w, status: 'DRAFT' } : w)));
      fetchStats();
    } catch (err) {
      console.error('Error unpublishing website:', err);
      alert(err.response?.data?.message || 'Failed to unpublish website');
    }
  };

  const handleOpenSettings = (website) => {
    setEditingWebsite(website);
    setSettingsFormData({
      name: website.name || '',
      primaryColor: website.primaryColor || '#378C92',
      logoUrl: website.logoUrl || '',
      faviconUrl: website.faviconUrl || '',
      metaTitle: website.metaTitle || '',
      metaDescription: website.metaDescription || '',
    });
    setSettingsError(null);
    setSettingsDialogOpen(true);
  };

  const handleSaveSettings = async () => {
    try {
      setSubmitting(true);
      setSettingsError(null);

      const response = await axios.put(
        `${API_URL}/websites/${editingWebsite.id}`,
        settingsFormData
      );

      // Update website in state
      setWebsites(
        websites.map((w) => (w.id === editingWebsite.id ? { ...w, ...settingsFormData } : w))
      );

      setSettingsDialogOpen(false);
      setEditingWebsite(null);
    } catch (err) {
      console.error('Error updating website settings:', err);
      setSettingsError(err.response?.data?.message || 'Failed to update website settings');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadLogo = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setSettingsError('Please select a valid image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setSettingsError('File size must be less than 5MB');
      return;
    }

    try {
      setUploadingLogo(true);
      setSettingsError(null);

      const formData = new FormData();
      formData.append('logo', file);

      const response = await axios.post(`${API_URL}/websites/${editingWebsite.id}/logo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update form data with new logo URL
      const logoUrl = `${API_URL.replace('/api', '')}${response.data.data.logoUrl}`;
      setSettingsFormData({ ...settingsFormData, logoUrl });
    } catch (err) {
      console.error('Error uploading logo:', err);
      setSettingsError(err.response?.data?.message || 'Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleUploadFavicon = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setSettingsError('Please select a valid image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setSettingsError('File size must be less than 5MB');
      return;
    }

    try {
      setUploadingFavicon(true);
      setSettingsError(null);

      const formData = new FormData();
      formData.append('favicon', file);

      const response = await axios.post(
        `${API_URL}/websites/${editingWebsite.id}/favicon`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Update form data with new favicon URL
      const faviconUrl = `${API_URL.replace('/api', '')}${response.data.data.faviconUrl}`;
      setSettingsFormData({ ...settingsFormData, faviconUrl });
    } catch (err) {
      console.error('Error uploading favicon:', err);
      setSettingsError(err.response?.data?.message || 'Failed to upload favicon');
    } finally {
      setUploadingFavicon(false);
    }
  };

  const handleOpenAnalytics = (website) => {
    setSelectedWebsiteForAnalytics(website);
    setAnalyticsDialogOpen(true);
  };

  const handleOpenDeleteDialog = (website) => {
    setWebsiteToDelete(website);
    setDeleteConfirmText('');
    setDeleteDialogOpen(true);
  };

  const handleDeleteWebsite = async () => {
    if (deleteConfirmText !== websiteToDelete?.name || !websiteToDelete) {
      return;
    }

    try {
      setDeleting(true);
      await axios.delete(`${API_URL}/websites/${websiteToDelete.id}`);

      // Remove from list
      setWebsites(websites.filter((w) => w.id !== websiteToDelete.id));
      setDeleteDialogOpen(false);
      setWebsiteToDelete(null);
      setDeleteConfirmText('');
      fetchStats();
    } catch (err) {
      console.error('Error deleting website:', err);
      alert(err.response?.data?.message || 'Failed to delete website');
    } finally {
      setDeleting(false);
    }
  };

  const handlePreviewWebsite = (website) => {
    // Open preview in new tab - works for both published and draft websites
    window.open(`/site/${website.slug}`, '_blank');
  };

  const handleCardClick = (websiteId) => {
    // Navigate to website detail page
    navigate(`/dashboard/websites/${websiteId}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PUBLISHED':
        return '#4ade80';
      case 'DRAFT':
        return '#fbbf24';
      case 'ARCHIVED':
        return '#9ca3af';
      default:
        return colors.textSecondary;
    }
  };

  // ── Multi-tenancy: filtered websites and stats (Step 7.4.1) ──────────────
  const filteredWebsites = useMemo(() => {
    if (roleFilter === 'owned') {
      return websites.filter((w) => (w.role || 'VIEWER').toUpperCase() === 'OWNER');
    }
    if (roleFilter === 'shared') {
      return websites.filter((w) => (w.role || 'VIEWER').toUpperCase() !== 'OWNER');
    }
    return websites;
  }, [websites, roleFilter]);

  const ownershipStats = useMemo(() => {
    const owned = websites.filter((w) => (w.role || 'VIEWER').toUpperCase() === 'OWNER').length;
    const shared = websites.filter((w) => (w.role || 'VIEWER').toUpperCase() !== 'OWNER').length;
    return { owned, shared };
  }, [websites]);

  const handleOpenCollaboratorModal = useCallback((website) => {
    setCollaboratorWebsiteId(website.id);
    setCollaboratorWebsiteRole((website.role || 'OWNER').toUpperCase());
    setCollaboratorModalOpen(true);
  }, []);

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ px: { xs: 0, sm: 0 } }}>
        <PageHeader title={pageTitle} subtitle={pageSubtitle} />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
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
      {initialView === 'create-template' && (
        <Card
          sx={{
            background: `linear-gradient(135deg, ${alpha(colors.primary, 0.05)} 0%, ${alpha(colors.primaryDark, 0.02)} 100%)`,
            border: `1px solid ${alpha(colors.primary, 0.1)}`,
            borderRadius: 3,
            textAlign: 'center',
            py: 8,
          }}
        >
          <CardContent>
            <Box sx={{ color: alpha(colors.textSecondary, 0.3), mb: 2 }}>
              <LayoutTemplate size={80} />
            </Box>
            <Typography variant="h5" sx={{ color: colors.text, fontWeight: 600, mb: 1 }}>
              Template Creation Coming Soon
            </Typography>
            <Typography variant="body1" sx={{ color: colors.textSecondary, mb: 3, maxWidth: 500, mx: 'auto' }}>
              The template creation feature is under development. Soon you'll be able to design and create custom website templates for your team.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/dashboard/websites')}
                sx={{
                  borderColor: colors.primary,
                  color: colors.primary,
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: colors.primaryDark,
                    bgcolor: alpha(colors.primary, 0.1),
                  },
                }}
              >
                View All Websites
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/dashboard/websites/templates')}
                sx={{
                  borderColor: colors.primary,
                  color: colors.primary,
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': {
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
      {viewMode === 'active' && !['create-template'].includes(initialView) && (
        <Grid container spacing={{ xs: 2, sm: 2, md: 2 }} sx={{ mb: { xs: 2, md: 3 } }}>
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
      {viewMode === 'active' && !['create-template'].includes(initialView) && websites.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Box sx={{ display: 'flex', gap: 1 }}>
            {[
              { key: 'all', label: 'All' },
              { key: 'owned', label: 'Owned' },
              { key: 'shared', label: 'Shared with Me' },
            ].map(({ key, label }) => (
              <Chip
                key={key}
                label={label}
                size="small"
                onClick={() => setRoleFilter(key)}
                data-testid={`filter-${key}`}
                sx={{
                  fontWeight: 600,
                  cursor: 'pointer',
                  bgcolor: roleFilter === key ? alpha(colors.primary, 0.15) : alpha(colors.textSecondary, 0.08),
                  color: roleFilter === key ? colors.primary : colors.textSecondary,
                  border: roleFilter === key ? `1px solid ${alpha(colors.primary, 0.4)}` : '1px solid transparent',
                  '&:hover': {
                    bgcolor: roleFilter === key ? alpha(colors.primary, 0.2) : alpha(colors.textSecondary, 0.12),
                  },
                }}
              />
            ))}
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Typography variant="caption" sx={{ color: colors.textSecondary }}>
              Owned: {ownershipStats.owned}
            </Typography>
            {ownershipStats.shared > 0 && (
              <>
                <Typography variant="caption" sx={{ color: colors.textSecondary }}>|</Typography>
                <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                  <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                    <PeopleIcon sx={{ fontSize: 14 }} /> Shared: {ownershipStats.shared}
                  </Box>
                </Typography>
              </>
            )}
          </Box>
        </Box>
      )}

      {error && !['create-template'].includes(initialView) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Search Bar */}
      {viewMode === 'active' && !['create-template'].includes(initialView) && (
        <Box sx={{ mb: 3, maxWidth: { xs: '100%', md: 400 } }}>
          <SearchBar
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search websites..."
          />
        </Box>
      )}

      {/* Website Cards Grid */}
      {viewMode === 'active' && !['create-template'].includes(initialView) && (
        <Grid container spacing={3}>
          {/* Create New Website Card */}
          <Grid item xs={12} sm={6} md={4}>
            <Card
              onClick={() => navigate('/dashboard/websites/templates')}
              sx={{
                aspectRatio: '16/10',
                border: `2px dashed ${alpha(colors.textSecondary, 0.3)}`,
                borderRadius: 2,
                background: alpha(colors.bgCard, 0.3),
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: colors.primary,
                  background: alpha(colors.primary, 0.05),
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <Box sx={{ color: colors.textSecondary, mb: 2 }}>
                <Plus size={48} />
              </Box>
              <Typography variant="h6" sx={{ color: colors.text, fontWeight: 600 }}>
                Create New Website
              </Typography>
              <Typography variant="body2" sx={{ color: colors.textSecondary, mt: 1 }}>
                Start from a template
              </Typography>
            </Card>
          </Grid>

          {/* Loading Skeletons - Initial Load */}
          {loading &&
            [...Array(6)].map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={`skeleton-${index}`}>
                <SkeletonCard />
              </Grid>
            ))}

          {/* Existing Websites */}
          {!loading &&
            filteredWebsites.map((website) => {
              const websiteRole = (website.role || 'VIEWER').toUpperCase();
              const canEdit = canPerformAction(websiteRole, WEBSITE_ACTIONS.EDIT_CONTENT);
              const canEditSettings = canPerformAction(websiteRole, WEBSITE_ACTIONS.EDIT_SETTINGS);
              const canPublish = canPerformAction(websiteRole, WEBSITE_ACTIONS.PUBLISH);
              const canDelete = canPerformAction(websiteRole, WEBSITE_ACTIONS.DELETE);
              const canViewAnalytics = canPerformAction(websiteRole, WEBSITE_ACTIONS.VIEW_ANALYTICS);
              const canManageCollaborators = canPerformAction(websiteRole, WEBSITE_ACTIONS.MANAGE_COLLABORATORS);
              const isShared = websiteRole !== 'OWNER';

              return (
              <Grid item xs={12} sm={6} md={4} key={website.id}>
                <Card
                  sx={{
                    aspectRatio: '16/10',
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: 2,
                    border: `1px solid ${alpha(colors.border, 0.5)}`,
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 8px 24px ${alpha(colors.primary, 0.2)}`,
                      border: `1px solid ${alpha(colors.primary, 0.5)}`,
                      '& .hover-actions': {
                        opacity: 1,
                      },
                    },
                  }}
                  onClick={() => handleCardClick(website.id)}
                >
                  {/* Preview Image/Background */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: website.primaryColor
                        ? `linear-gradient(135deg, ${alpha(website.primaryColor, 0.2)} 0%, ${alpha(website.primaryColor, 0.05)} 100%)`
                        : `linear-gradient(135deg, ${alpha(colors.primary, 0.1)} 0%, ${alpha(colors.primaryDark, 0.05)} 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Globe size={64} color={alpha(colors.textSecondary, 0.2)} />
                  </Box>

                  {/* Role Badge (Step 7.4.2) */}
                  <Chip
                    label={websiteRole}
                    size="small"
                    data-testid={`role-badge-${website.id}`}
                    sx={{
                      position: 'absolute',
                      top: 12,
                      left: 12,
                      bgcolor: alpha(ROLE_COLORS[websiteRole] || colors.primary, 0.9),
                      color: '#fff',
                      fontWeight: 600,
                      fontSize: '0.65rem',
                      textTransform: 'uppercase',
                      backdropFilter: 'blur(10px)',
                      height: 22,
                    }}
                  />

                  {/* Status Badge */}
                  <Chip
                    label={website.status}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      bgcolor: alpha(getStatusColor(website.status), 0.9),
                      color: '#fff',
                      fontWeight: 600,
                      fontSize: '0.7rem',
                      textTransform: 'uppercase',
                      backdropFilter: 'blur(10px)',
                    }}
                  />

                  {/* Hover Actions */}
                  <Box
                    className="hover-actions"
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      p: 2,
                      background: `linear-gradient(to top, ${alpha(colors.bgCard, 0.95)} 0%, ${alpha(colors.bgCard, 0.8)} 100%)`,
                      backdropFilter: 'blur(10px)',
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        color: colors.text,
                        fontWeight: 700,
                        mb: 0.5,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {website.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: colors.textSecondary,
                        fontFamily: 'monospace',
                        fontSize: '0.75rem',
                        mb: 1,
                      }}
                    >
                      /s/{website.slug}
                    </Typography>
                    <Box display="flex" gap={1} flexWrap="wrap">
                      {/* Manage — always visible for EDITOR+ roles */}
                      <Button
                        size="small"
                        startIcon={<Settings size={18} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/dashboard/websites/${website.id}/manage/overview`);
                        }}
                        sx={{
                          color: colors.primary,
                          textTransform: 'none',
                          fontWeight: 600,
                          minHeight: 36,
                          bgcolor: alpha(colors.primary, 0.08),
                          '&:hover': { bgcolor: alpha(colors.primary, 0.15) },
                        }}
                      >
                        Manage
                      </Button>

                      {/* Edit — requires EDIT_CONTENT */}
                      {canEdit ? (
                        <Button
                          size="small"
                          startIcon={<Pencil size={18} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/dashboard/websites/${website.id}/editor`);
                          }}
                          sx={{
                            color: colors.primary,
                            textTransform: 'none',
                            fontWeight: 600,
                            minHeight: 36,
                            '&:hover': { bgcolor: alpha(colors.primary, 0.1) },
                          }}
                        >
                          Edit
                        </Button>
                      ) : (
                        <Tooltip title="You need EDITOR role to edit" arrow>
                          <Box component="span" sx={{ display: 'inline-flex' }}>
                            <Button
                              size="small"
                              startIcon={<Pencil size={18} />}
                              disabled
                              sx={{
                                textTransform: 'none',
                                fontWeight: 600,
                                minHeight: 36,
                              }}
                            >
                              Edit
                            </Button>
                          </Box>
                        </Tooltip>
                      )}

                      {/* Preview — always visible */}
                      <Button
                        size="small"
                        startIcon={<Eye size={18} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePreviewWebsite(website);
                        }}
                        sx={{
                          color: colors.primary,
                          textTransform: 'none',
                          fontWeight: 600,
                          minHeight: 36,
                          '&:hover': { bgcolor: alpha(colors.primary, 0.1) },
                        }}
                      >
                        Preview
                      </Button>

                      {/* Settings — requires EDIT_SETTINGS (ADMIN+) */}
                      {canEditSettings && (
                        <Button
                          size="small"
                          startIcon={<Settings size={18} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenSettings(website);
                          }}
                          sx={{
                            color: colors.textSecondary,
                            textTransform: 'none',
                            fontWeight: 600,
                            minHeight: 36,
                            '&:hover': { bgcolor: alpha(colors.textSecondary, 0.1) },
                          }}
                        >
                          Settings
                        </Button>
                      )}

                      {/* Analytics — requires VIEW_ANALYTICS */}
                      {canViewAnalytics && (
                        <Button
                          size="small"
                          startIcon={<ChartBar size={18} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenAnalytics(website);
                          }}
                          sx={{
                            color: colors.primary,
                            textTransform: 'none',
                            fontWeight: 600,
                            minHeight: 36,
                            '&:hover': { bgcolor: alpha(colors.primary, 0.1) },
                          }}
                        >
                          Analytics
                        </Button>
                      )}

                      {/* Collaborators — requires MANAGE_COLLABORATORS or is OWNER */}
                      {(canManageCollaborators || websiteRole === 'OWNER') && (
                        <Button
                          size="small"
                          startIcon={<Users size={18} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenCollaboratorModal(website);
                          }}
                          sx={{
                            color: colors.primary,
                            textTransform: 'none',
                            fontWeight: 600,
                            minHeight: 36,
                            '&:hover': { bgcolor: alpha(colors.primary, 0.1) },
                          }}
                        >
                          Team
                        </Button>
                      )}

                      {/* Publish/Unpublish — requires PUBLISH */}
                      {canPublish && (
                        website.status === 'PUBLISHED' ? (
                          <Button
                            size="small"
                            startIcon={<EyeOff size={18} />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUnpublish(website.id);
                            }}
                            sx={{
                              color: colors.textSecondary,
                              textTransform: 'none',
                              fontWeight: 600,
                              minHeight: 36,
                              '&:hover': { bgcolor: alpha(colors.textSecondary, 0.1) },
                            }}
                          >
                            Unpublish
                          </Button>
                        ) : (
                          <Button
                            size="small"
                            startIcon={<Eye size={18} />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePublish(website.id);
                            }}
                            sx={{
                              color: '#4ade80',
                              textTransform: 'none',
                              fontWeight: 600,
                              minHeight: 36,
                              '&:hover': { bgcolor: alpha('#4ade80', 0.1) },
                            }}
                          >
                            Publish
                          </Button>
                        )
                      )}

                      {/* Delete — requires DELETE (OWNER/ADMIN only) */}
                      {canDelete && (
                        <Button
                          size="small"
                          startIcon={<Trash2 size={18} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDeleteDialog(website);
                          }}
                          sx={{
                            color: '#f44336',
                            textTransform: 'none',
                            fontWeight: 600,
                            minHeight: 36,
                            '&:hover': { bgcolor: alpha('#f44336', 0.1) },
                          }}
                        >
                          Delete
                        </Button>
                      )}
                    </Box>
                  </Box>
                </Card>
              </Grid>
              );
            })}

          {/* Loading More Skeletons */}
          {activeLoadingMore &&
            [...Array(3)].map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={`loading-more-${index}`}>
                <SkeletonCard />
              </Grid>
            ))}

          {/* Empty State for Filtered Views (Step 7.4.5) */}
          {!loading && filteredWebsites.length === 0 && websites.length > 0 && (
            <Grid item xs={12}>
              <EmptyState
                icon={<Globe size={48} color={colors.textSecondary} />}
                title={
                  roleFilter === 'shared'
                    ? 'No shared websites'
                    : roleFilter === 'owned'
                    ? 'No owned websites match'
                    : 'No websites found'
                }
                subtitle={
                  roleFilter === 'shared'
                    ? 'When someone shares a website with you, it will appear here.'
                    : 'Try changing your filter to see other websites.'
                }
                action={
                  roleFilter !== 'all' && (
                    <Button
                      variant="outlined"
                      onClick={() => setRoleFilter('all')}
                      sx={{
                        textTransform: 'none',
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
      {viewMode === 'deleted' && (
        <>
          {deletedItems.length === 0 && !loading && !error && (
            <Card
              sx={{
                background: `linear-gradient(135deg, ${alpha(colors.primary, 0.05)} 0%, ${alpha(colors.primaryDark, 0.02)} 100%)`,
                border: `1px solid ${alpha(colors.primary, 0.1)}`,
                borderRadius: 3,
                textAlign: 'center',
                py: 8,
              }}
            >
              <CardContent>
                <Box sx={{ color: alpha(colors.textSecondary, 0.3), mb: 2 }}>
                  <Trash2 size={80} />
                </Box>
                <Typography variant="h5" sx={{ color: colors.text, fontWeight: 600, mb: 1 }}>
                  No recently deleted items
                </Typography>
                <Typography variant="body1" sx={{ color: colors.textSecondary }}>
                  Deleted websites and stores will appear here and be permanently deleted after 30
                  days
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* Loading Skeletons */}
          {loading && (
            <Grid container spacing={3}>
              {[...Array(6)].map((_, index) => (
                <Grid item xs={12} sm={6} md={4} key={`skeleton-deleted-${index}`}>
                  <SkeletonCard />
                </Grid>
              ))}
            </Grid>
          )}

          {deletedItems.length > 0 && !loading && (
            <>
              <Alert severity="info" sx={{ mb: 3 }}>
                Items in Recently Deleted will be permanently deleted after 30 days. You can restore
                them anytime before then.
              </Alert>
              <Grid container spacing={3}>
                {deletedItems.map((item) => {
                  const daysRemaining = getDaysRemaining(item.deletedAt);
                  const isStore = item.itemType === 'store';
                  return (
                    <Grid item xs={12} sm={6} md={4} key={`${item.itemType}-${item.id}`}>
                      <Card
                        sx={{
                          aspectRatio: '16/10',
                          position: 'relative',
                          overflow: 'hidden',
                          borderRadius: 2,
                          border: `1px solid ${alpha(colors.textSecondary, 0.3)}`,
                          opacity: 0.85,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            opacity: 1,
                            transform: 'translateY(-4px)',
                            boxShadow: `0 8px 24px ${alpha(colors.textSecondary, 0.2)}`,
                            '& .hover-actions': {
                              opacity: 1,
                            },
                          },
                        }}
                      >
                        {/* Preview Background - Grayed out */}
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: `linear-gradient(135deg, ${alpha(colors.textSecondary, 0.1)} 0%, ${alpha(colors.textSecondary, 0.05)} 100%)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Trash2 size={64} color={alpha(colors.textSecondary, 0.2)} />
                        </Box>

                        {/* Type Badge */}
                        <Chip
                          label={isStore ? 'Store' : 'Website'}
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 12,
                            left: 12,
                            bgcolor: isStore
                              ? alpha('#9c27b0', 0.9)
                              : alpha(colors.primary, 0.9),
                            color: '#fff',
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            backdropFilter: 'blur(10px)',
                          }}
                        />

                        {/* Days Remaining Badge */}
                        <Chip
                          label={
                            daysRemaining === null || daysRemaining === 0
                              ? '0d'
                              : `${daysRemaining}d`
                          }
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            bgcolor:
                              daysRemaining === null || daysRemaining <= 7
                                ? alpha('#f44336', 0.9)
                                : alpha(colors.textSecondary, 0.8),
                            color: '#fff',
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            backdropFilter: 'blur(10px)',
                          }}
                        />

                        {/* Hover Actions */}
                        <Box
                          className="hover-actions"
                          sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            p: 2,
                            background: `linear-gradient(to top, ${alpha(colors.bgCard, 0.95)} 0%, ${alpha(colors.bgCard, 0.8)} 100%)`,
                            backdropFilter: 'blur(10px)',
                            opacity: 0,
                            transition: 'opacity 0.3s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1,
                          }}
                        >
                          <Typography
                            variant="h6"
                            sx={{
                              color: colors.text,
                              fontWeight: 700,
                              mb: 0.5,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {item.name}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: colors.textSecondary,
                              fontFamily: 'monospace',
                              fontSize: '0.75rem',
                              mb: 0.5,
                            }}
                          >
                            {isStore ? `/store/${item.slug}` : `/s/${item.slug}`}
                          </Typography>
                          {item.deletedAt && (
                            <Typography
                              variant="caption"
                              sx={{
                                color: colors.textSecondary,
                                fontSize: '0.7rem',
                                mb: 1,
                              }}
                            >
                              Deleted {new Date(item.deletedAt).toLocaleDateString()}
                            </Typography>
                          )}
                          <Box display="flex" gap={1} flexWrap="wrap">
                            <Button
                              size="small"
                              startIcon={<RotateCcw size={16} />}
                              onClick={() => handleRestoreItem(item)}
                              disabled={restoring}
                              sx={{
                                color: colors.primary,
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                '&:hover': { bgcolor: alpha(colors.primary, 0.1) },
                              }}
                            >
                              Restore
                            </Button>
                            <Button
                              size="small"
                              startIcon={<Trash size={16} />}
                              onClick={() => handleOpenPermanentDeleteDialog(item)}
                              sx={{
                                color: '#f44336',
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                '&:hover': { bgcolor: alpha('#f44336', 0.1) },
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
                    <Grid item xs={12} sm={6} md={4} key={`loading-more-deleted-${index}`}>
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
          <Box display="flex" justifyContent="space-between" alignItems="center">
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

          <Typography variant="subtitle2" sx={{ mb: 2, color: colors.text, fontWeight: 600 }}>
            Select a Template *
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
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
                      template.defaultWebsiteConfig?.primaryColor || formData.primaryColor,
                  });
                }}
                sx={{
                  cursor: 'pointer',
                  border:
                    formData.templateId === template.id
                      ? `2px solid ${colors.primary}`
                      : `1px solid ${colors.border}`,
                  borderRadius: 2,
                  transition: 'all 0.2s',
                  position: 'relative',
                  '&:hover': {
                    borderColor: colors.primary,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                {formData.templateId === template.id && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      background: colors.primary,
                      borderRadius: '50%',
                      width: 24,
                      height: 24,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
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
                    sx={{ color: colors.textSecondary, display: 'block' }}
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
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '');
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
              onChange={(color) => setFormData({ ...formData, primaryColor: color })}
              label="Primary Color"
              helperText="Theme color for your website"
              showAlpha={true}
              disabled={submitting}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCreateDialogOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <DashboardActionButton
            onClick={handleCreateWebsite}
            disabled={submitting || !formData.name || !formData.slug || !formData.templateId}
            sx={{ px: 3 }}
          >
            {submitting ? <CircularProgress size={24} sx={{ color: 'inherit' }} /> : 'Create'}
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
          <Box display="flex" justifyContent="space-between" alignItems="center">
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

          <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 3 }}>
            Create a website with a built-in e-commerce store for selling products online.
          </Typography>

          <Typography variant="subtitle2" sx={{ mb: 2, color: colors.text, fontWeight: 600 }}>
            Select a Store Template *
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
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
                      template.defaultWebsiteConfig?.primaryColor || storeFormData.primaryColor,
                  });
                }}
                sx={{
                  cursor: 'pointer',
                  border:
                    storeFormData.templateId === template.id
                      ? `2px solid ${colors.primary}`
                      : `1px solid ${colors.border}`,
                  borderRadius: 2,
                  transition: 'all 0.2s',
                  position: 'relative',
                  '&:hover': {
                    borderColor: colors.primary,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                {storeFormData.templateId === template.id && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      background: colors.primary,
                      borderRadius: '50%',
                      width: 24,
                      height: 24,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
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
                    sx={{ color: colors.textSecondary, display: 'block' }}
                  >
                    {template.description}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>

          <Typography variant="subtitle2" sx={{ mb: 2, color: colors.text, fontWeight: 600 }}>
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
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '');
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
            onChange={(e) => setStoreFormData({ ...storeFormData, websiteSlug: e.target.value })}
            disabled={storeLoading}
            containerSx={{ mb: 2 }}
            helperText="URL-safe identifier"
          />

          <Box sx={{ mb: 3 }}>
            <ColorPickerWithAlpha
              value={storeFormData.primaryColor}
              onChange={(color) => setStoreFormData({ ...storeFormData, primaryColor: color })}
              label="Primary Color"
              helperText="Brand color for your store"
              showAlpha={true}
              disabled={storeLoading}
            />
          </Box>

          <Typography variant="subtitle2" sx={{ mb: 2, color: colors.text, fontWeight: 600 }}>
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
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '');
              setStoreFormData({ ...storeFormData, storeName: name, storeSlug: slug });
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
            onChange={(e) => setStoreFormData({ ...storeFormData, storeSlug: e.target.value })}
            disabled={storeLoading}
            containerSx={{ mb: 2 }}
            helperText="Used in your store URL"
          />

          <DashboardSelect
            fullWidth
            label="Currency"
            value={storeFormData.currency}
            onChange={(e) => setStoreFormData({ ...storeFormData, currency: e.target.value })}
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
          <Button onClick={() => setCreateStoreDialogOpen(false)} disabled={storeLoading}>
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
              <CircularProgress size={24} sx={{ color: 'inherit' }} />
            ) : (
              'Create Store Website'
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
          <Box display="flex" justifyContent="space-between" alignItems="center">
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

          <Typography variant="subtitle2" sx={{ mb: 2, color: colors.textSecondary }}>
            Basic Information
          </Typography>

          <DashboardInput
            fullWidth
            label="Website Name *"
            labelPlacement="floating"
            value={settingsFormData.name}
            onChange={(e) => setSettingsFormData({ ...settingsFormData, name: e.target.value })}
            disabled={submitting}
            sx={{ mb: 2 }}
            helperText="Display name for your website"
          />

          <DashboardInput
            fullWidth
            label="Slug (Read-only)"
            labelPlacement="floating"
            value={editingWebsite?.slug || ''}
            disabled
            sx={{ mb: 2 }}
            helperText="Cannot be changed after creation"
          />

          <DashboardInput
            fullWidth
            label="Status (Read-only)"
            labelPlacement="floating"
            value={editingWebsite?.status?.toUpperCase() || ''}
            disabled
            sx={{ mb: 3 }}
            helperText="Use Publish/Unpublish buttons to change status"
          />

          <Typography variant="subtitle2" sx={{ mb: 2, color: colors.textSecondary }}>
            Appearance
          </Typography>

          <Box sx={{ mb: 2 }}>
            <ColorPickerWithAlpha
              value={settingsFormData.primaryColor}
              onChange={(color) =>
                setSettingsFormData({ ...settingsFormData, primaryColor: color })
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
            value={settingsFormData.gaMeasurementId || ''}
            onChange={(e) =>
              setSettingsFormData({ ...settingsFormData, gaMeasurementId: e.target.value })
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
                setSettingsFormData({ ...settingsFormData, logoUrl: e.target.value })
              }
              disabled={submitting || uploadingLogo}
              helperText="URL to your logo image (optional)"
            />
            <Box sx={{ mt: 1, display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button
                component="label"
                variant="outlined"
                startIcon={uploadingLogo ? <CircularProgress size={16} /> : <Upload size={18} />}
                disabled={submitting || uploadingLogo}
                sx={{
                  textTransform: 'none',
                  borderColor: colors.primary,
                  color: colors.primary,
                  '&:hover': {
                    borderColor: colors.primaryDark,
                    bgcolor: alpha(colors.primary, 0.1),
                  },
                }}
              >
                {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                <input type="file" hidden accept="image/*" onChange={handleUploadLogo} />
              </Button>
              {settingsFormData.logoUrl && (
                <Box
                  component="img"
                  src={settingsFormData.logoUrl}
                  alt="Logo preview"
                  sx={{
                    maxHeight: 50,
                    maxWidth: 150,
                    objectFit: 'contain',
                    border: `1px solid ${alpha(colors.text, 0.2)}`,
                    borderRadius: 1,
                    p: 1,
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
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
                setSettingsFormData({ ...settingsFormData, faviconUrl: e.target.value })
              }
              disabled={submitting || uploadingFavicon}
              helperText="URL to your favicon image (optional)"
            />
            <Box sx={{ mt: 1, display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button
                component="label"
                variant="outlined"
                startIcon={uploadingFavicon ? <CircularProgress size={16} /> : <Upload size={18} />}
                disabled={submitting || uploadingFavicon}
                sx={{
                  textTransform: 'none',
                  borderColor: colors.primary,
                  color: colors.primary,
                  '&:hover': {
                    borderColor: colors.primaryDark,
                    bgcolor: alpha(colors.primary, 0.1),
                  },
                }}
              >
                {uploadingFavicon ? 'Uploading...' : 'Upload Favicon'}
                <input type="file" hidden accept="image/*" onChange={handleUploadFavicon} />
              </Button>
              {settingsFormData.faviconUrl && (
                <Box
                  component="img"
                  src={settingsFormData.faviconUrl}
                  alt="Favicon preview"
                  sx={{
                    height: 32,
                    width: 32,
                    objectFit: 'contain',
                    border: `1px solid ${alpha(colors.text, 0.2)}`,
                    borderRadius: 1,
                    p: 0.5,
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              )}
            </Box>
          </Box>

          <Typography variant="subtitle2" sx={{ mb: 2, color: colors.textSecondary }}>
            SEO & Meta Tags
          </Typography>

          <DashboardInput
            fullWidth
            label="Meta Title"
            labelPlacement="floating"
            value={settingsFormData.metaTitle}
            onChange={(e) =>
              setSettingsFormData({ ...settingsFormData, metaTitle: e.target.value })
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
              setSettingsFormData({ ...settingsFormData, metaDescription: e.target.value })
            }
            disabled={submitting}
            multiline
            rows={3}
            helperText="Default SEO description for your website (optional)"
          />
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSettingsDialogOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <DashboardActionButton
            onClick={handleSaveSettings}
            disabled={submitting || !settingsFormData.name}
          >
            {submitting ? <CircularProgress size={24} sx={{ color: 'inherit' }} /> : 'Save Changes'}
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
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight={700}>
              Analytics - {selectedWebsiteForAnalytics?.name}
            </Typography>
            <IconButton size="small" onClick={() => setAnalyticsDialogOpen(false)}>
              <X size={18} />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers sx={{ borderColor: colors.border, pt: 3 }}>
          {selectedWebsiteForAnalytics && (
            <WebsiteAnalytics websiteId={selectedWebsiteForAnalytics.id} />
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
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight={700}>
              Plan Limit Reached
            </Typography>
            <IconButton size="small" onClick={() => setUpgradeDialogOpen(false)}>
              <X size={18} />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers sx={{ borderColor: colors.border, pt: 3 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            {planLimitMessage || 'You have reached the limit for your current plan.'}
          </Alert>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Upgrade your plan to create more websites and unlock additional features like:
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
          <Button onClick={() => setUpgradeDialogOpen(false)}>Maybe Later</Button>
          <DashboardActionButton
            onClick={() => {
              setUpgradeDialogOpen(false);
              navigate('/pricing');
            }}
          >
            View Plans
          </DashboardActionButton>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
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
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight={700}>
              Move to Recently Deleted
            </Typography>
            <IconButton size="small" onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
              <X size={18} />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers sx={{ borderColor: colors.border, pt: 3 }}>
          <Alert severity="warning" sx={{ mb: 3 }}>
            This website will be moved to Recently Deleted and permanently deleted after 30 days.
            You can restore it anytime within this period.
          </Alert>

          {websiteToDelete && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" sx={{ color: colors.text, mb: 1, fontWeight: 600 }}>
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
                <Typography variant="h6" sx={{ color: colors.text, fontWeight: 700 }}>
                  {websiteToDelete.name}
                </Typography>
                <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                  {websiteToDelete.slug}
                </Typography>
              </Box>
            </Box>
          )}

          <Typography variant="body2" sx={{ color: colors.text, mb: 2, fontWeight: 600 }}>
            To confirm, please type the website name{' '}
            <Box component="span" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
              {websiteToDelete?.name}
            </Box>{' '}
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
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteWebsite}
            variant="contained"
            disabled={deleting || deleteConfirmText !== websiteToDelete?.name}
            sx={{
              background:
                deleteConfirmText === websiteToDelete?.name
                  ? '#f44336'
                  : alpha(colors.textSecondary, 0.2),
              color: deleteConfirmText === websiteToDelete?.name ? '#fff' : colors.textSecondary,
              fontWeight: 600,
              '&:hover': {
                background:
                  deleteConfirmText === websiteToDelete?.name
                    ? '#d32f2f'
                    : alpha(colors.textSecondary, 0.3),
              },
              '&:disabled': {
                background: alpha(colors.textSecondary, 0.2),
                color: colors.textSecondary,
              },
            }}
          >
            {deleting ? <CircularProgress size={24} /> : 'Move to Recently Deleted'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Permanent Delete Confirmation Dialog */}
      <Dialog
        open={permanentDeleteDialogOpen}
        onClose={() => !permanentlyDeleting && setPermanentDeleteDialogOpen(false)}
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
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight={700} sx={{ color: '#f44336' }}>
              Permanently Delete {websiteToPermanentlyDelete?.itemType === 'store' ? 'Store' : 'Website'}
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
            This action cannot be undone. All{' '}
            {websiteToPermanentlyDelete?.itemType === 'store'
              ? 'store data, products, and orders'
              : 'website data, pages, and content'}{' '}
            will be permanently deleted.
          </Alert>

          {websiteToPermanentlyDelete && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" sx={{ color: colors.text, mb: 1, fontWeight: 600 }}>
                You are about to permanently delete:
              </Typography>
              <Box
                sx={{
                  p: 2,
                  bgcolor: alpha('#f44336', 0.05),
                  borderRadius: 2,
                  border: `1px solid ${alpha('#f44336', 0.2)}`,
                }}
              >
                <Typography variant="h6" sx={{ color: colors.text, fontWeight: 700 }}>
                  {websiteToPermanentlyDelete.name}
                </Typography>
                <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                  {websiteToPermanentlyDelete.slug}
                </Typography>
              </Box>
            </Box>
          )}

          <Typography variant="body2" sx={{ color: colors.text, mb: 2, fontWeight: 600 }}>
            To confirm permanent deletion, please type the{' '}
            {websiteToPermanentlyDelete?.itemType === 'store' ? 'store' : 'website'} name{' '}
            <Box
              component="span"
              sx={{ color: '#f44336', fontWeight: 700, fontFamily: 'monospace' }}
            >
              {websiteToPermanentlyDelete?.name}
            </Box>{' '}
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
              permanentlyDeleting || permanentDeleteConfirmText !== websiteToPermanentlyDelete?.name
            }
            sx={{
              background:
                permanentDeleteConfirmText === websiteToPermanentlyDelete?.name
                  ? '#f44336'
                  : alpha(colors.textSecondary, 0.2),
              color:
                permanentDeleteConfirmText === websiteToPermanentlyDelete?.name
                  ? '#fff'
                  : colors.textSecondary,
              fontWeight: 600,
              '&:hover': {
                background:
                  permanentDeleteConfirmText === websiteToPermanentlyDelete?.name
                    ? '#d32f2f'
                    : alpha(colors.textSecondary, 0.3),
              },
              '&:disabled': {
                background: alpha(colors.textSecondary, 0.2),
                color: colors.textSecondary,
              },
            }}
          >
            {permanentlyDeleting ? <CircularProgress size={24} /> : 'Delete Permanently'}
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
