/**
 * ManageDocs — Admin Documentation CMS Panel (Step 10.9.6)
 *
 * Admin-only page for managing documentation articles:
 * - List all articles (published + draft) with CRUD
 * - Search by title (client-side)
 * - Filter by category
 * - Create/Edit dialog with title, category, content, tags, isPublished
 * - Delete with ConfirmationDialog
 * - Toast notifications on CRUD success/error
 */

import { memo, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Chip,
  Typography,
  Alert,
  Snackbar,
  CircularProgress,
  FormControlLabel,
  Switch,
  IconButton,
  Stack,
  Skeleton,
  Tooltip,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import {
  Plus as AddIcon,
  Pencil as EditIcon,
  Trash2 as DeleteIcon,
  BookOpen as BookOpenIcon,
  Eye as PublishedIcon,
  EyeOff as DraftIcon,
} from 'lucide-react';
import axios from 'axios';
import { getDashboardColors } from '../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import {
  PageHeader,
  DashboardCard,
  DashboardTable,
  DashboardTableHeadCell,
  DashboardTableRow,
  SearchBar,
  FilterBar,
  DashboardActionButton,
  EmptyState,
  DashboardInput,
  DashboardSelect,
  ConfirmationDialog,
} from './shared';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DOC_CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'getting-started', label: 'Getting Started' },
  { value: 'features', label: 'Features' },
  { value: 'troubleshooting', label: 'Troubleshooting' },
  { value: 'api', label: 'API' },
];

const CATEGORY_FILTER_OPTIONS = DOC_CATEGORIES;

const CATEGORY_SELECT_OPTIONS = DOC_CATEGORIES.filter((c) => c.value !== 'all');

const INITIAL_FORM = {
  title: '',
  category: 'getting-started',
  content: '',
  tags: '',
  isPublished: false,
};

// ---------------------------------------------------------------------------
// Helper: relative time
// ---------------------------------------------------------------------------

const formatRelativeTime = (isoString) => {
  if (!isoString) return '—';
  const diff = Date.now() - new Date(isoString).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(isoString).toLocaleDateString();
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const ManageDocs = memo(({ user, pageTitle, pageSubtitle }) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);
  const { token } = useAuth();
  const muiTheme = useMuiTheme();
  const isXs = useMediaQuery(muiTheme.breakpoints.down('sm'));

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Toast
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  // ---------------------------------------------------------------------------
  // Auth headers
  // ---------------------------------------------------------------------------
  const authHeaders = useMemo(
    () => ({ headers: { Authorization: `Bearer ${token}` } }),
    [token],
  );

  // ---------------------------------------------------------------------------
  // Fetch articles
  // ---------------------------------------------------------------------------
  const fetchArticles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await axios.get(`${API_URL}/docs/admin/articles`, authHeaders);
      const data = resp.data;
      setArticles(Array.isArray(data?.articles) ? data.articles : Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to load articles. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  // ---------------------------------------------------------------------------
  // Client-side filter
  // ---------------------------------------------------------------------------
  const filteredArticles = useMemo(() => {
    let result = articles;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((a) => a.title?.toLowerCase().includes(q));
    }

    if (categoryFilter && categoryFilter !== 'all') {
      result = result.filter((a) => a.category === categoryFilter);
    }

    return result;
  }, [articles, searchQuery, categoryFilter]);

  // ---------------------------------------------------------------------------
  // Handlers — search / filter
  // ---------------------------------------------------------------------------
  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleCategoryChange = useCallback((e) => {
    setCategoryFilter(e.target.value);
  }, []);

  // ---------------------------------------------------------------------------
  // Dialog handlers
  // ---------------------------------------------------------------------------
  const openCreateDialog = useCallback(() => {
    setEditingArticle(null);
    setFormData(INITIAL_FORM);
    setFormError(null);
    setDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((article) => {
    setEditingArticle(article);
    setFormData({
      title: article.title || '',
      category: article.category || 'getting-started',
      content: article.content || '',
      tags: Array.isArray(article.tags) ? article.tags.join(', ') : article.tags || '',
      isPublished: Boolean(article.isPublished),
    });
    setFormError(null);
    setDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    if (!saving) {
      setDialogOpen(false);
      setEditingArticle(null);
      setFormData(INITIAL_FORM);
      setFormError(null);
    }
  }, [saving]);

  const handleFormChange = useCallback((field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handlePublishedToggle = useCallback((e) => {
    setFormData((prev) => ({ ...prev, isPublished: e.target.checked }));
  }, []);

  const handleSave = useCallback(async () => {
    if (!formData.title.trim()) {
      setFormError('Title is required.');
      return;
    }
    if (!formData.category) {
      setFormError('Category is required.');
      return;
    }

    setSaving(true);
    setFormError(null);

    const payload = {
      title: formData.title.trim(),
      category: formData.category,
      content: formData.content,
      tags: formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      isPublished: formData.isPublished,
    };

    try {
      if (editingArticle) {
        await axios.put(
          `${API_URL}/docs/articles/${editingArticle.id}`,
          payload,
          authHeaders,
        );
        setToast({ open: true, message: 'Article updated successfully!', severity: 'success' });
      } else {
        await axios.post(`${API_URL}/docs/articles`, payload, authHeaders);
        setToast({ open: true, message: 'Article created successfully!', severity: 'success' });
      }

      setDialogOpen(false);
      fetchArticles();
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Failed to save article.');
    } finally {
      setSaving(false);
    }
  }, [formData, editingArticle, authHeaders, fetchArticles]);

  // ---------------------------------------------------------------------------
  // Delete handlers
  // ---------------------------------------------------------------------------
  const openDeleteDialog = useCallback((article) => {
    setArticleToDelete(article);
    setDeleteDialogOpen(true);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    if (!deleting) {
      setDeleteDialogOpen(false);
      setArticleToDelete(null);
    }
  }, [deleting]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!articleToDelete) return;
    setDeleting(true);
    try {
      await axios.delete(`${API_URL}/docs/articles/${articleToDelete.id}`, authHeaders);
      setToast({ open: true, message: 'Article deleted successfully!', severity: 'success' });
      setDeleteDialogOpen(false);
      setArticleToDelete(null);
      fetchArticles();
    } catch (err) {
      setToast({ open: true, message: 'Failed to delete article.', severity: 'error' });
      setDeleteDialogOpen(false);
    } finally {
      setDeleting(false);
    }
  }, [articleToDelete, authHeaders, fetchArticles]);

  const handleToastClose = useCallback(() => {
    setToast((prev) => ({ ...prev, open: false }));
  }, []);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const renderLoading = () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
      <CircularProgress size={48} sx={{ color: colors.primary }} />
    </Box>
  );

  const renderError = () => (
    <Alert severity="error" sx={{ mb: 2 }}>
      {error}
    </Alert>
  );

  const renderTable = () => {
    if (filteredArticles.length === 0) {
      return (
        <EmptyState
          icon={<BookOpenIcon size={40} color={colors.textSecondary} />}
          title={
            searchQuery || categoryFilter !== 'all'
              ? 'No articles match your filters.'
              : 'No documentation articles yet — create your first article'
          }
          subtitle={
            !searchQuery && categoryFilter === 'all'
              ? 'Start building your help center by creating documentation articles.'
              : undefined
          }
          action={
            !searchQuery && categoryFilter === 'all' ? (
              <DashboardActionButton startIcon={<AddIcon size={16} />} onClick={openCreateDialog}>
                Create Article
              </DashboardActionButton>
            ) : undefined
          }
        />
      );
    }

    return (
      <Box sx={{ overflowX: 'auto' }}>
        <DashboardTable variant="inset" colors={colors}>
          <thead>
            <tr>
              <DashboardTableHeadCell colors={colors}>Title</DashboardTableHeadCell>
              <DashboardTableHeadCell colors={colors}>Author</DashboardTableHeadCell>
              <DashboardTableHeadCell colors={colors}>Category</DashboardTableHeadCell>
              <DashboardTableHeadCell colors={colors}>Status</DashboardTableHeadCell>
              {!isXs && <DashboardTableHeadCell colors={colors}>Views</DashboardTableHeadCell>}
              <DashboardTableHeadCell colors={colors}>Updated</DashboardTableHeadCell>
              <DashboardTableHeadCell colors={colors}>Actions</DashboardTableHeadCell>
            </tr>
          </thead>
          <tbody>
            {filteredArticles.map((article) => (
              <DashboardTableRow key={article.id} colors={colors}>
                <td>
                  <Typography
                    variant="body2"
                    sx={{ color: colors.text, fontWeight: 600, maxWidth: 280, wordBreak: 'break-word' }}
                  >
                    {article.title}
                  </Typography>
                </td>
                <td>
                  <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: '0.8rem' }}>
                    {article.author?.name || '—'}
                    {article.author?.role && (
                      <Typography
                        component="span"
                        variant="caption"
                        sx={{ color: colors.textSecondary, ml: 0.5, opacity: 0.7 }}
                      >
                        ({article.author.role})
                      </Typography>
                    )}
                  </Typography>
                </td>
                <td>
                  <Chip
                    label={
                      DOC_CATEGORIES.find((c) => c.value === article.category)?.label ||
                      article.category
                    }
                    size="small"
                    sx={{
                      background: alpha(colors.primary, 0.15),
                      color: colors.primary,
                      fontWeight: 600,
                      fontSize: '0.7rem',
                    }}
                  />
                </td>
                <td>
                  <Chip
                    label={article.isPublished ? 'Published' : 'Draft'}
                    size="small"
                    sx={{
                      background: article.isPublished
                        ? alpha(colors.primary, 0.15)
                        : alpha(colors.textSecondary, 0.15),
                      color: article.isPublished ? colors.primary : colors.textSecondary,
                      fontWeight: 600,
                      fontSize: '0.7rem',
                    }}
                  />
                </td>
                {!isXs && (
                <td>
                  <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                    {(article.views || 0).toLocaleString()}
                  </Typography>
                </td>
                )}
                <td>
                  <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                    {formatRelativeTime(article.updatedAt)}
                  </Typography>
                </td>
                <td>
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Edit article">
                      <IconButton
                        size="small"
                        aria-label="edit article"
                        onClick={() => openEditDialog(article)}
                        sx={{
                          color: colors.primary,
                          '&:hover': { background: alpha(colors.primary, 0.1) },
                        }}
                      >
                        <EditIcon size={16} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete article">
                      <IconButton
                        size="small"
                        aria-label="delete article"
                        onClick={() => openDeleteDialog(article)}
                        sx={{
                          color: colors.error || '#ef4444',
                          '&:hover': { background: alpha(colors.error || '#ef4444', 0.1) },
                        }}
                      >
                        <DeleteIcon size={16} />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </td>
              </DashboardTableRow>
            ))}
          </tbody>
        </DashboardTable>
      </Box>
    );
  };

  return (
    <Box sx={{ pb: 4 }}>
      {/* Page Header with Admin Badge */}
      <PageHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {pageTitle || 'Documentation Management'}
            <Chip
              label="Admin Panel"
              size="small"
              sx={{
                background: alpha(colors.primary, 0.15),
                color: colors.primary,
                fontWeight: 700,
                fontSize: '0.7rem',
              }}
            />
          </Box>
        }
        subtitle={pageSubtitle || 'Create, edit, and manage documentation articles for your help center'}
      />

      {/* Toolbar: Search + Filter + Create */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          mb: 3,
          flexWrap: 'wrap',
        }}
      >
        <Box sx={{ flex: 1, minWidth: 200 }}>
          <SearchBar
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search articles by title..."
          />
        </Box>

        <FilterBar
          label="Category"
          value={categoryFilter}
          onChange={handleCategoryChange}
          options={CATEGORY_FILTER_OPTIONS}
        />

        <DashboardActionButton
          startIcon={<AddIcon size={16} />}
          onClick={openCreateDialog}
        >
          Create Article
        </DashboardActionButton>
      </Box>

      {/* Content */}
      <DashboardCard>
        {loading && renderLoading()}
        {!loading && error && renderError()}
        {!loading && !error && renderTable()}
      </DashboardCard>

      {/* Create / Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        maxWidth="md"
        fullWidth
        fullScreen={isXs}
        data-testid="article-dialog"
        PaperProps={{
          sx: {
            bgcolor: colors.bgCard,
            border: isXs ? 'none' : `1px solid ${colors.border}`,
            borderRadius: isXs ? 0 : '12px',
          },
        }}
      >
        <DialogTitle
          sx={{
            color: colors.text,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <BookOpenIcon size={20} color={colors.primary} />
          {editingArticle ? 'Edit Article' : 'Create Article'}
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2.5}>
            {formError && (
              <Alert severity="error" sx={{ mb: 1 }}>
                {formError}
              </Alert>
            )}

            {/* Title */}
            <DashboardInput
              label="Title"
              value={formData.title}
              onChange={handleFormChange('title')}
              fullWidth
              required
              error={formError && !formData.title.trim()}
              inputProps={{ 'data-testid': 'title-input' }}
            />

            {/* Category */}
            <DashboardSelect
              label="Category"
              value={formData.category}
              onChange={handleFormChange('category')}
              fullWidth
            >
              {CATEGORY_SELECT_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </DashboardSelect>

            {/* Content (Markdown textarea) */}
            <Box>
              <Typography
                variant="caption"
                sx={{ color: colors.textSecondary, mb: 0.5, display: 'block' }}
              >
                Content (Markdown supported)
              </Typography>
              <Box
                component="textarea"
                value={formData.content}
                onChange={handleFormChange('content')}
                rows={12}
                placeholder="# Article Title&#10;&#10;Write your article content here using Markdown..."
                data-testid="content-textarea"
                sx={{
                  width: '100%',
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  lineHeight: 1.6,
                  p: 1.5,
                  bgcolor: colors.bgCard,
                  color: colors.text,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  resize: 'vertical',
                  outline: 'none',
                  boxSizing: 'border-box',
                  '&:focus': {
                    borderColor: colors.primary,
                  },
                }}
              />
            </Box>

            {/* Tags */}
            <DashboardInput
              label="Tags (comma-separated)"
              value={formData.tags}
              onChange={handleFormChange('tags')}
              fullWidth
              placeholder="e.g. intro, guide, beginner"
            />

            {/* Published toggle */}
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isPublished}
                  onChange={handlePublishedToggle}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2" sx={{ color: colors.text }}>
                  {formData.isPublished ? 'Published' : 'Draft'}
                </Typography>
              }
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1 }}>
          <DashboardActionButton
            onClick={closeDialog}
            disabled={saving}
            sx={{
              bgcolor: 'transparent',
              color: colors.textSecondary,
              border: `1px solid ${colors.border}`,
              '&:hover': { bgcolor: alpha(colors.textSecondary, 0.08) },
            }}
          >
            Cancel
          </DashboardActionButton>
          <DashboardActionButton
            onClick={handleSave}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <BookOpenIcon size={16} />}
          >
            {saving ? 'Saving...' : editingArticle ? 'Update Article' : 'Create Article'}
          </DashboardActionButton>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={closeDeleteDialog}
        title="Delete Article"
        message={`Are you sure you want to delete "${articleToDelete?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        loading={deleting}
      />

      {/* Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={handleToastClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleToastClose} severity={toast.severity} sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
});

ManageDocs.displayName = 'ManageDocs';

export default ManageDocs;
