import { memo, useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../../api/client';
import {
  Box,
  Alert,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  FileText,
  Home,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getDashboardColors } from '../../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../../context/ThemeContext';
import {
  EmptyState,
} from '../shared';
import DashboardActionButton from '../shared/DashboardActionButton';
import DashboardGradientButton from '../shared/DashboardGradientButton';
import DashboardInput from '../shared/DashboardInput';
import DashboardCancelButton from '../shared/DashboardCancelButton';
import DashboardConfirmButton from '../shared/DashboardConfirmButton';
import DashboardTooltip from '../shared/DashboardTooltip';
import { getBlockDefaultContent } from '../../Editor/blockPresets';



const generateSlug = (title) =>
  '/' +
  title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const getPagePath = (page) => page?.path || page?.slug || '';

const PagesTab = memo(({ website, websiteId, onSaved }) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);
  const navigate = useNavigate();

  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add page dialog
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');
  const [newPageSlug, setNewPageSlug] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState(null);
  const [blogLoading, setBlogLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pageToDelete, setPageToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchPages = useCallback(async () => {
    if (!websiteId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get(`/websites/${websiteId}/pages`);
      // Backend returns { success, data: [...pages] }
      setPages(res.data?.data || res.data?.pages || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load pages.');
    } finally {
      setLoading(false);
    }
  }, [websiteId]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setNewPageTitle(title);
    if (title) {
      setNewPageSlug(generateSlug(title));
    } else {
      setNewPageSlug('');
    }
  };

  const handleAddPage = async () => {
    if (!newPageTitle.trim()) {
      setAddError('Page title is required.');
      return;
    }
    try {
      setAddLoading(true);
      setAddError(null);
      setSuccessMessage(null);
      // Backend expects { title, path } — not { title, slug }
      const res = await apiClient.post(`/websites/${websiteId}/pages`, {
        title: newPageTitle.trim(),
        path: newPageSlug || generateSlug(newPageTitle),
      });
      setPages((prev) => [...prev, res.data?.data || res.data?.page || res.data]);
      setAddDialogOpen(false);
      setNewPageTitle('');
      setNewPageSlug('');
      setSuccessMessage('Page created.');
      onSaved?.();
    } catch (err) {
      setAddError(err?.response?.data?.message || 'Failed to create page.');
    } finally {
      setAddLoading(false);
    }
  };

  const findBlogIndexPage = useCallback(
    () =>
      pages.find((page) => {
        const pagePath = getPagePath(page);
        return page.pageType === 'BLOG_INDEX' || pagePath === '/blog';
      }),
    [pages]
  );

  const addBlogMenuEntry = useCallback(
    async (path) => {
      try {
        const res = await apiClient.get(`/websites/${websiteId}/menus`);
        const raw = res.data?.data ?? res.data;
        const menuList = Array.isArray(raw) ? raw : [];
        const primary = menuList[0];

        if (primary) {
          const items = Array.isArray(primary.items) ? primary.items : [];
          if (
            items.some((item) => {
              const target = item.target || item.link || item.url;
              return target === path;
            })
          ) {
            return true;
          }

          const nextItems = [
            ...items.map(({ id, label, type, target }, order) => ({
              id,
              label,
              type,
              target,
              order,
            })),
            { label: 'Blog', type: 'page', target: path, order: items.length },
          ];

          await apiClient.put(`/menus/${primary.id}`, {
            name: primary.name,
            items: nextItems,
          });
        } else {
          await apiClient.post(`/websites/${websiteId}/menus`, {
            name: 'Main Menu',
            items: [{ label: 'Blog', type: 'page', target: path, order: 0 }],
          });
        }

        return true;
      } catch {
        return false;
      }
    },
    [websiteId]
  );

  const addBlogNavbarEntry = useCallback(
    async (path) => {
      try {
        let navbar = {
          brandName: website?.name || '',
          navigationItems: [{ label: 'Home', link: '/' }],
          ctaText: '',
          ctaLink: '',
          sticky: false,
          logo: '',
        };

        try {
          const res = await apiClient.get(`/websites/${websiteId}/global-components/navbar`);
          navbar = res.data?.data?.config || res.data?.config || navbar;
        } catch (err) {
          if (err?.response?.status !== 404) {
            throw err;
          }
        }

        const navigationItems = Array.isArray(navbar.navigationItems)
          ? navbar.navigationItems
          : [];

        if (
          navigationItems.some((item) => {
            const target = item.link || item.target || item.url;
            return target === path;
          })
        ) {
          return true;
        }

        await apiClient.put(`/websites/${websiteId}/global-components/navbar`, {
          config: {
            ...navbar,
            navigationItems: [
              ...navigationItems,
              { label: 'Blog', link: path },
            ],
          },
        });
        return true;
      } catch {
        return false;
      }
    },
    [website?.name, websiteId]
  );

  const handleAddBlogPage = async () => {
    const existing = findBlogIndexPage();
    if (existing) {
      await Promise.all([
        addBlogMenuEntry('/blog'),
        addBlogNavbarEntry('/blog'),
      ]);
      navigate(`/dashboard/websites/${websiteId}/editor?page=${existing.id}`);
      return;
    }

    try {
      setBlogLoading(true);
      setError(null);
      setSuccessMessage(null);

      const pageRes = await apiClient.post(`/websites/${websiteId}/pages`, {
        title: 'Blog',
        path: '/blog',
        isHome: false,
        isPublished: true,
        pageType: 'BLOG_INDEX',
      });
      const blogPage = pageRes.data?.data || pageRes.data?.page || pageRes.data;

      await apiClient.put(`/websites/${websiteId}/pages/${blogPage.id}/blocks`, {
        blocks: [
          {
            blockType: 'HERO',
            content: { ...getBlockDefaultContent('HERO'), heading: 'Our Blog' },
            sortOrder: 0,
            isVisible: true,
          },
          {
            blockType: 'BLOG_FEED',
            content: getBlockDefaultContent('BLOG_FEED'),
            sortOrder: 1,
            isVisible: true,
          },
        ],
      });

      setPages((prev) => [...prev, blogPage]);
      const [menuAdded, navbarAdded] = await Promise.all([
        addBlogMenuEntry('/blog'),
        addBlogNavbarEntry('/blog'),
      ]);
      setSuccessMessage(
        menuAdded || navbarAdded
          ? 'Blog page created and linked in your navigation.'
          : 'Blog page created. Add it to your menu if visitors should see it.'
      );
      onSaved?.();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create blog page.');
    } finally {
      setBlogLoading(false);
    }
  };

  const handleToggleVisibility = async (page) => {
    try {
      // Backend page update is PUT /api/pages/:pageId (standalone route, not nested under website).
      // The backend accepts isPublished (boolean) — not visible.
      const res = await apiClient.put(`/pages/${page.id}`, {
        isPublished: !page.isPublished,
      });
      const updatedPage = res.data?.data || res.data?.page || res.data;
      setPages((prev) =>
        prev.map((p) => (p.id === page.id ? { ...p, ...updatedPage } : p))
      );
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update page visibility.');
    }
  };

  const handleDeletePage = async () => {
    if (!pageToDelete) return;
    try {
      setDeleteLoading(true);
      // Backend page delete is DELETE /api/pages/:pageId (standalone route)
      await apiClient.delete(`/pages/${pageToDelete.id}`);
      setPages((prev) => prev.filter((p) => p.id !== pageToDelete.id));
      setDeleteDialogOpen(false);
      setPageToDelete(null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete page.');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <Box>
        <Skeleton variant="rectangular" height={48} sx={{ borderRadius: 1, mb: 2 }} />
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {/* Header with Add Page button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <DashboardActionButton
          startIcon={<Plus size={16} />}
          onClick={handleAddBlogPage}
          disabled={blogLoading}
          aria-label="Add blog page"
        >
          {findBlogIndexPage() ? 'Open Blog Page' : blogLoading ? 'Creating Blog...' : 'Add Blog Page'}
        </DashboardActionButton>
        <DashboardGradientButton
          startIcon={<Plus size={16} />}
          onClick={() => setAddDialogOpen(true)}
          aria-label="Add new page"
        >
          Add Page
        </DashboardGradientButton>
      </Box>

      {/* Pages table */}
      {pages.length === 0 ? (
        <EmptyState
          icon={<FileText size={48} />}
          title="No pages yet"
          subtitle="Add pages to build out your website structure."
          action={
            <DashboardGradientButton
              startIcon={<Plus size={16} />}
              onClick={() => setAddDialogOpen(true)}
            >
              Add Your First Page
            </DashboardGradientButton>
          }
        />
      ) : (
        <TableContainer component={Paper} sx={{ overflowX: 'auto', borderRadius: 2 }}>
          <Table size="small" aria-label="Pages table">
            <TableHead>
              <TableRow>
                <TableCell>Page Title</TableCell>
                <TableCell>URL Path</TableCell>
                <TableCell align="center">Blocks</TableCell>
                <TableCell>Last Modified</TableCell>
                <TableCell align="center">Visible</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pages.map((page) => (
                <TableRow key={page.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {page.isHome && (
                        <Home size={14} style={{ color: colors.primary, flexShrink: 0 }} />
                      )}
                      <Typography variant="body2">{page.title}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box
                      component="code"
                      sx={{ fontSize: '0.8rem', fontFamily: 'monospace' }}
                    >
                      {getPagePath(page)}
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">{page.blockCount ?? 0}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {page.updatedAt
                        ? new Date(page.updatedAt).toLocaleDateString()
                        : '—'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Switch
                      checked={page.isPublished !== false}
                      onChange={() => handleToggleVisibility(page)}
                      size="small"
                      inputProps={{ 'aria-label': `Toggle visibility for ${page.title}` }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                      <DashboardActionButton
                        size="small"
                        startIcon={<Pencil size={14} />}
                        onClick={() =>
                          navigate(`/dashboard/websites/${websiteId}/editor?page=${page.id}`)
                        }
                        variant="text"
                        aria-label={`Edit ${page.title}`}
                      >
                        Edit
                      </DashboardActionButton>

                      {page.isHome ? (
                        <DashboardTooltip title="Cannot delete the home page">
                          <span>
                            <DashboardActionButton
                              size="small"
                              startIcon={<Trash2 size={14} />}
                              disabled
                              variant="text"
                              aria-label="Cannot delete home page"
                            >
                              Delete
                            </DashboardActionButton>
                          </span>
                        </DashboardTooltip>
                      ) : (
                        <DashboardActionButton
                          size="small"
                          startIcon={<Trash2 size={14} />}
                          onClick={() => {
                            setPageToDelete(page);
                            setDeleteDialogOpen(true);
                          }}
                          variant="text"
                          color="error"
                          aria-label={`Delete ${page.title}`}
                        >
                          Delete
                        </DashboardActionButton>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add Page Dialog */}
      <Dialog
        open={addDialogOpen}
        onClose={() => {
          setAddDialogOpen(false);
          setNewPageTitle('');
          setNewPageSlug('');
          setAddError(null);
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Add New Page</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {addError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {addError}
            </Alert>
          )}
          <DashboardInput
            label="Page Title"
            value={newPageTitle}
            onChange={handleTitleChange}
            fullWidth
            autoFocus
            sx={{ mb: 2 }}
            inputProps={{ 'aria-label': 'New page title' }}
          />
          <DashboardInput
            label="URL Path"
            value={newPageSlug}
            onChange={(e) => setNewPageSlug(e.target.value)}
            fullWidth
            helperText="Auto-generated from title. Edit to customize."
            inputProps={{ 'aria-label': 'URL path for new page' }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <DashboardCancelButton
            onClick={() => {
              setAddDialogOpen(false);
              setNewPageTitle('');
              setNewPageSlug('');
              setAddError(null);
            }}
          />
          <DashboardGradientButton
            onClick={handleAddPage}
            disabled={addLoading || !newPageTitle.trim()}
            aria-label="Save new page"
          >
            {addLoading ? 'Creating...' : 'Create Page'}
          </DashboardGradientButton>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setPageToDelete(null);
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Page</DialogTitle>
        <DialogContent>
          Are you sure you want to delete "{pageToDelete?.title}"? This action cannot be undone.
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <DashboardCancelButton
            onClick={() => {
              setDeleteDialogOpen(false);
              setPageToDelete(null);
            }}
          />
          <DashboardConfirmButton
            onClick={handleDeletePage}
            color="error"
            disabled={deleteLoading}
            aria-label="Confirm delete page"
          >
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </DashboardConfirmButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
});

PagesTab.displayName = 'PagesTab';

export default PagesTab;
