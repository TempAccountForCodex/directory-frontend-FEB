import { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Chip,
  Typography,
  Snackbar,
  Alert,
  Grid,
  alpha,
  InputAdornment,
  Stack,
  FormControlLabel,
  Checkbox,
  Divider,
} from '@mui/material';
import {
  Plus as AddIcon,
  Pencil as EditIcon,
  Trash2 as DeleteIcon,
  CircleCheck as ApproveIcon,
  CircleX as RejectIcon,
  Eye as ViewIcon,
  EyeOff as EyeOffIcon,
  History as HistoryIcon,
  Search as SearchIcon,
  Clock as PendingIcon,
  LayoutTemplate as TemplateIcon,
  CheckSquare as ApprovedIcon,
  Globe as PublishedIcon,
} from 'lucide-react';
import axios from 'axios';
import { getDashboardColors } from '../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../context/ThemeContext';
import {
  DashboardActionButton,
  DashboardInput,
  DashboardPanel,
  DashboardSelect,
  DashboardMetricCard,
  PageHeader,
  DashboardIconButton,
  DashboardGradientButton,
  DashboardCancelButton,
  DashboardTable,
  DashboardTablePagination,
  DashboardTableRow,
  DashboardTableHeadCell,
  DashboardCard,
  EmptyState,
  AuditLogCard,
} from './shared';
import { DashboardDataGrid } from './grid';
import {
  isAdmin as checkIsAdmin,
  isSuperAdmin as checkIsSuperAdmin,
} from '../../constants/roles';
import {
  TEMPLATE_CATEGORIES,
  TEMPLATE_COMPLEXITY_OPTIONS as COMPLEXITY_OPTIONS,
} from '../../constants/templateCategories';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const INITIAL_FORM = {
  name: '',
  description: '',
  category: '',
  complexity: 'standard',
  industry: '',
  thumbnailUrl: '',
  desktopPreviewUrl: '',
  mobilePreviewUrl: '',
  demoUrl: '',
  allowColorCustomization: false,
  allowFontCustomization: false,
  allowLayoutCustomization: false,
  isPremium: false,
  changeReason: '',
};

const ManageTemplates = ({
  user,
  highlightId,
  subtab: subtabProp,
  onSubTabChange,
  pageTitle,
  pageSubtitle,
}) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);
  const location = useLocation();
  const navigate = useNavigate();

  const parseSubtab = useCallback(() => {
    const segments = location.pathname.replace(/\/$/, '').split('/').filter(Boolean);
    return segments[2] || null;
  }, [location.pathname]);

  const subtab = parseSubtab();
  const activeView = subtab || 'all';

  const triggerNotificationRefresh = useCallback(() => {
    window.dispatchEvent(new Event('notifications:refresh'));
  }, []);

  // ── State ─────────────────────────────────────────────────────────────────
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(() => parseInt(localStorage.getItem('manageTemplatesPage')) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(() => parseInt(localStorage.getItem('manageTemplatesRowsPerPage')) || 10);
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, published: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openApprovalDialog, setOpenApprovalDialog] = useState(false);
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [originalFormData, setOriginalFormData] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [approvalData, setApprovalData] = useState({ action: 'approve', rejectionReason: '' });

  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(0);
  const [historyRowsPerPage, setHistoryRowsPerPage] = useState(10);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [actionLoading, setActionLoading] = useState(false);

  const isMobileScreen = useMediaQuery('(max-width: 600px)');

  const isAdmin = checkIsAdmin(user.role);
  const isSuperAdmin = checkIsSuperAdmin(user.role);

  // ── Redirect if no subtab ─────────────────────────────────────────────────
  useEffect(() => {
    if (!subtab && location.pathname === '/dashboard/templates') {
      navigate('/dashboard/templates/all', { replace: true });
    }
  }, [location.pathname, subtab, navigate]);

  // ── Highlight from URL ────────────────────────────────────────────────────
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const urlHighlight = searchParams.get('highlight');
    if (urlHighlight) {
      setTimeout(() => {
        const element = document.getElementById(`template-${urlHighlight}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('highlighted');
          setTimeout(() => element.classList.remove('highlighted'), 3000);
        }
      }, 500);
    }
  }, [location.search]);

  // ── Persist page/rowsPerPage ──────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem('manageTemplatesPage', page.toString());
  }, [page]);

  useEffect(() => {
    localStorage.setItem('manageTemplatesRowsPerPage', rowsPerPage.toString());
  }, [rowsPerPage]);

  useEffect(() => {
    setPage(1);
  }, [rowsPerPage]);

  // ── Fetch on mount / page change ──────────────────────────────────────────
  useEffect(() => {
    fetchTemplates();
    if (isAdmin) fetchStats();
  }, [page, rowsPerPage, activeView]);

  // ── API Calls ─────────────────────────────────────────────────────────────
  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const offset = (page - 1) * rowsPerPage;
      const params = new URLSearchParams({ limit: rowsPerPage, offset });

      if (isAdmin) {
        if (activeView === 'pending') params.set('status', 'PENDING_APPROVAL');
        else if (activeView === 'published') params.set('isPublished', 'true');
        else if (activeView === 'rejected') params.set('status', 'REJECTED');
      }

      const response = await axios.get(`${API_URL}/templates?${params}`);
      if (response.data.success) {
        setTemplates(response.data.data || []);
        const pag = response.data.pagination || {};
        setTotalPages(pag.totalPages || 1);
        setTotalCount(pag.total || response.data.count || 0);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      setSnackbar({ open: true, message: 'Failed to fetch templates', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, activeView, isAdmin]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/templates/stats`);
      if (response.data.success) {
        const d = response.data.data;
        setStats({ total: d.total || 0, approved: d.approved || 0, pending: d.pending || 0, published: d.published || 0 });
      }
    } catch (error) {
      console.error('Error fetching template stats:', error);
    }
  }, []);

  const fetchHistory = useCallback(async (templateId) => {
    setHistoryLoading(true);
    try {
      const response = await axios.get(`${API_URL}/templates/${templateId}/history`);
      if (response.data.success) {
        setHistoryData(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching template history:', error);
      setHistoryData([]);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  // ── Client-Side Filtering ─────────────────────────────────────────────────
  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = t.name?.toLowerCase().includes(q) || t.category?.toLowerCase().includes(q) || t.createdBy?.name?.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (statusFilter !== 'all') {
        const statusMap = { approved: 'APPROVED', pending: 'PENDING_APPROVAL', rejected: 'REJECTED', draft: 'DRAFT' };
        if (t.status !== statusMap[statusFilter]) return false;
      }
      if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
      return true;
    });
  }, [templates, searchQuery, statusFilter, categoryFilter]);

  // ── Form Handlers ─────────────────────────────────────────────────────────
  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setValidationErrors((prev) => ({ ...prev, [name]: '' }));
  }, []);

  const validateForm = useCallback(() => {
    const errors = {};
    if (!formData.name?.trim() || formData.name.length < 5 || formData.name.length > 255) {
      errors.name = 'Name must be between 5 and 255 characters';
    }
    if (!formData.category) errors.category = 'Category is required';
    if (!isAdmin && isEditing && currentTemplate?.status === 'APPROVED' && !formData.changeReason?.trim()) {
      errors.changeReason = 'Please describe your changes (required for editing approved templates)';
    }
    // pages field removed — pages are edited through the template editor, not this form
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, isAdmin, isEditing, currentTemplate]);

  const hasFormChanged = useCallback(() => {
    if (!isEditing || !originalFormData) return true;
    const fields = ['name', 'description', 'category', 'complexity', 'industry', 'thumbnailUrl', 'desktopPreviewUrl', 'mobilePreviewUrl', 'demoUrl', 'isPremium', 'allowColorCustomization', 'allowFontCustomization', 'allowLayoutCustomization'];
    return fields.some((f) => formData[f] !== originalFormData[f]);
  }, [formData, originalFormData, isEditing]);

  // ── Dialog Open/Close ─────────────────────────────────────────────────────
  const handleOpenDialog = useCallback((template = null) => {
    if (template) {
      setIsEditing(true);
      setCurrentTemplate(template);
      const fd = {
        name: template.name || '',
        description: template.description || '',
        category: template.category || '',
        complexity: template.complexity || 'standard',
        industry: Array.isArray(template.industry) ? template.industry.join(', ') : (template.industry || ''),
        thumbnailUrl: template.thumbnailUrl || '',
        desktopPreviewUrl: template.desktopPreviewUrl || '',
        mobilePreviewUrl: template.mobilePreviewUrl || '',
        demoUrl: template.demoUrl || '',
        allowColorCustomization: template.allowColorCustomization || false,
        allowFontCustomization: template.allowFontCustomization || false,
        allowLayoutCustomization: template.allowLayoutCustomization || false,
        isPremium: template.isPremium || false,
        changeReason: '',
      };
      setFormData(fd);
      setOriginalFormData(fd);
    } else {
      setIsEditing(false);
      setCurrentTemplate(null);
      setFormData(INITIAL_FORM);
      setOriginalFormData(null);
    }
    setValidationErrors({});
    setOpenDialog(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setCurrentTemplate(null);
    setValidationErrors({});
  }, []);

  // ── Submit Create/Edit ────────────────────────────────────────────────────
  const handleSubmit = useCallback(async (submitStatus) => {
    if (!validateForm()) return;
    setActionLoading(true);
    try {
      const payload = {
        ...formData,
        status: submitStatus,
        industry: formData.industry ? formData.industry.split(',').map((s) => s.trim()).filter(Boolean) : [],
      };

      let response;
      if (isEditing && currentTemplate) {
        response = await axios.put(`${API_URL}/templates/${currentTemplate.id}`, payload);
      } else {
        response = await axios.post(`${API_URL}/templates`, payload);
      }

      if (response.data.success) {
        setSnackbar({ open: true, message: isEditing ? 'Template updated successfully' : 'Template created successfully', severity: 'success' });
        handleCloseDialog();
        fetchTemplates();
        if (isAdmin) fetchStats();
        triggerNotificationRefresh();
      }
    } catch (error) {
      console.error('Error saving template:', error);
      setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to save template', severity: 'error' });
    } finally {
      setActionLoading(false);
    }
  }, [formData, isEditing, currentTemplate, validateForm, handleCloseDialog, fetchTemplates, fetchStats, isAdmin, triggerNotificationRefresh]);

  // ── Approve ───────────────────────────────────────────────────────────────
  const handleApprove = useCallback(async () => {
    if (!currentTemplate) return;
    setActionLoading(true);
    try {
      await axios.patch(`${API_URL}/templates/${currentTemplate.id}/approve`);
      setSnackbar({ open: true, message: 'Template approved successfully', severity: 'success' });
      setOpenApprovalDialog(false);
      fetchTemplates();
      fetchStats();
      triggerNotificationRefresh();
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to approve template', severity: 'error' });
    } finally {
      setActionLoading(false);
    }
  }, [currentTemplate, fetchTemplates, fetchStats, triggerNotificationRefresh]);

  // ── Reject ────────────────────────────────────────────────────────────────
  const handleReject = useCallback(async () => {
    if (!currentTemplate || !approvalData.rejectionReason?.trim()) return;
    setActionLoading(true);
    try {
      await axios.patch(`${API_URL}/templates/${currentTemplate.id}/reject`, { rejectionReason: approvalData.rejectionReason });
      setSnackbar({ open: true, message: 'Template rejected', severity: 'success' });
      setOpenApprovalDialog(false);
      fetchTemplates();
      fetchStats();
      triggerNotificationRefresh();
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to reject template', severity: 'error' });
    } finally {
      setActionLoading(false);
    }
  }, [currentTemplate, approvalData.rejectionReason, fetchTemplates, fetchStats, triggerNotificationRefresh]);

  // ── Publish / Unpublish ───────────────────────────────────────────────────
  const handlePublishToggle = useCallback(async (template) => {
    try {
      const endpoint = template.isPublished ? 'unpublish' : 'publish';
      await axios.patch(`${API_URL}/templates/${template.id}/${endpoint}`);
      setSnackbar({ open: true, message: `Template ${template.isPublished ? 'unpublished' : 'published'} successfully`, severity: 'success' });
      fetchTemplates();
      if (isAdmin) fetchStats();
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to update publish status', severity: 'error' });
    }
  }, [fetchTemplates, fetchStats, isAdmin]);

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = useCallback(async () => {
    if (!currentTemplate) return;
    setActionLoading(true);
    try {
      await axios.delete(`${API_URL}/templates/${currentTemplate.id}`);
      setSnackbar({ open: true, message: 'Template deleted permanently', severity: 'success' });
      setOpenDeleteDialog(false);
      fetchTemplates();
      if (isAdmin) fetchStats();
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to delete template', severity: 'error' });
    } finally {
      setActionLoading(false);
    }
  }, [currentTemplate, fetchTemplates, fetchStats, isAdmin]);

  // ── Status Chip ───────────────────────────────────────────────────────────
  const statusConfig = useMemo(() => ({
    APPROVED: { label: 'Approved', bg: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', shadow: '#22c55e' },
    PENDING_APPROVAL: { label: 'Pending', bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', shadow: '#f59e0b' },
    REJECTED: { label: 'Rejected', bg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', shadow: '#ef4444' },
    DRAFT: { label: 'Draft', bg: `linear-gradient(135deg, ${colors.textTertiary} 0%, ${alpha(colors.textTertiary, 0.8)} 100%)`, shadow: colors.textTertiary },
  }), [colors.textTertiary]);

  // ── Column Definitions ────────────────────────────────────────────────────
  const columnDefs = useMemo(() => [
    {
      header: '#',
      accessorFn: (row, index) => (page - 1) * rowsPerPage + index + 1,
      size: 80,
      enableSorting: false,
      Cell: ({ renderedCellValue }) => (
        <Box sx={{ color: colors.textTertiary, fontWeight: 500 }}>{renderedCellValue}</Box>
      ),
    },
    {
      header: 'Name',
      accessorKey: 'name',
      minSize: 280,
      Cell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={{ color: colors.text, fontWeight: 600 }}>
            {row.original.name}
          </Typography>
          {row.original.status === 'PENDING_APPROVAL' && (
            <Chip
              label={row.original.isEdit ? 'EDITED' : 'NEW'}
              size="small"
              sx={{
                background: row.original.isEdit
                  ? `linear-gradient(135deg, ${colors.primaryLight} 0%, ${colors.primary} 100%)`
                  : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                color: '#F5F5F5',
                fontWeight: 700,
                fontSize: '0.65rem',
                height: '20px',
                boxShadow: `0 2px 6px ${alpha(row.original.isEdit ? colors.primary : '#22c55e', 0.2)}`,
              }}
            />
          )}
        </Box>
      ),
    },
    {
      header: 'Category',
      accessorKey: 'category',
      size: 140,
      Cell: ({ cell }) => (
        <Chip
          label={cell.getValue()}
          size="small"
          sx={{ background: alpha(colors.primary, 0.15), color: colors.primary, fontWeight: 600, border: `1px solid ${alpha(colors.primary, 0.3)}` }}
        />
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      size: 160,
      Cell: ({ cell }) => {
        const config = statusConfig[cell.getValue()] || statusConfig.DRAFT;
        return (
          <Chip
            label={config.label}
            size="small"
            sx={{ background: config.bg, color: '#F5F5F5', fontWeight: 700, fontSize: '0.65rem', height: '24px', boxShadow: `0 2px 6px ${alpha(config.shadow, 0.2)}` }}
          />
        );
      },
    },
    {
      header: 'Creator',
      accessorKey: 'createdBy.name',
      size: 160,
      Cell: ({ cell }) => (
        <Typography variant="body2" sx={{ color: colors.textSecondary }}>{cell.getValue() || 'Unknown'}</Typography>
      ),
    },
    {
      header: 'Last Updated',
      accessorKey: 'updatedAt',
      size: 140,
      Cell: ({ cell }) => (
        <Typography variant="body2" sx={{ color: colors.textSecondary }}>
          {cell.getValue() ? new Date(cell.getValue()).toLocaleDateString() : '—'}
        </Typography>
      ),
    },
  ], [page, rowsPerPage, colors, statusConfig]);

  // ── View Labels ───────────────────────────────────────────────────────────
  const emptyMessages = {
    all: 'No templates found',
    pending: 'No templates pending approval',
    published: 'No published templates',
    rejected: 'No rejected templates',
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Box>
      {/* ── 3.13.1: Page Shell ── */}
      <PageHeader title={pageTitle} subtitle={pageSubtitle} />

      {/* Action Buttons */}
      <Box sx={{ mb: { xs: 2, md: 4 } }}>
        <Box display="flex" justifyContent="flex-end" gap={1.5} mb={2}>
          <DashboardIconButton
            icon={<AddIcon size={20} />}
            label="New Template"
            tooltip="Create New Template"
            variant="filled"
            onClick={() => handleOpenDialog()}
          />
        </Box>
      </Box>

      {/* Stats Row */}
      <Grid container spacing={{ xs: 2, sm: 2, md: 2 }} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardMetricCard title="Total Templates" value={stats.total} icon={TemplateIcon} showProgress={false} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardMetricCard title="Approved" value={stats.approved} icon={ApprovedIcon} showProgress={false} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardMetricCard title="Pending Approval" value={stats.pending} icon={PendingIcon} showProgress={false} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardMetricCard title="Published" value={stats.published} icon={PublishedIcon} showProgress={false} />
        </Grid>
      </Grid>

      {/* Search & Filters */}
      <Stack
        sx={{ mb: 3 }}
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        justifyContent="space-between"
      >
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 auto' }, maxWidth: { xs: '100%', sm: '500px' } }}>
          <DashboardInput
            fullWidth
            placeholder="Search by name, category, or creator..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon size={20} color={colors.panelIcon} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': { fontSize: { xs: '0.875rem', sm: '0.97rem' } },
              '& .MuiOutlinedInput-input': { padding: { xs: '8px 8px 8px 0', sm: '10px 10px 10px 0' } },
            }}
          />
        </Box>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ flexShrink: 0 }}>
          {isAdmin && (
            <DashboardSelect
              size="small"
              label="View"
              value={activeView}
              onChange={(e) => {
                const newValue = e.target.value;
                const searchParams = new URLSearchParams(location.search);
                const qs = searchParams.toString();
                navigate(`/dashboard/templates/${newValue}${qs ? `?${qs}` : ''}`);
                setSearchQuery('');
                if (onSubTabChange) onSubTabChange();
              }}
              containerSx={{ minWidth: 180, width: { xs: '100%', sm: 'auto' } }}
            >
              <MenuItem value="all">All Templates</MenuItem>
              <MenuItem value="pending">Pending Approval</MenuItem>
              <MenuItem value="published">Published</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </DashboardSelect>
          )}
          <DashboardSelect
            size="small"
            label="Category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            containerSx={{ minWidth: 140, width: { xs: '100%', sm: 'auto' } }}
          >
            <MenuItem value="all">All Categories</MenuItem>
            {TEMPLATE_CATEGORIES.map((c) => (
              <MenuItem key={c} value={c}>{c}</MenuItem>
            ))}
          </DashboardSelect>
          <DashboardSelect
            size="small"
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            containerSx={{ minWidth: 140, width: { xs: '100%', sm: 'auto' } }}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
            <MenuItem value="draft">Draft</MenuItem>
          </DashboardSelect>
        </Stack>
      </Stack>

      {/* ── 3.13.2: Data Grid ── */}
      <DashboardPanel padding={0} sx={{ borderRadius: 3 }}>
        <DashboardDataGrid
          gridId="manage-templates"
          rowData={filteredTemplates}
          columnDefs={columnDefs}
          actionColumn={{
            width: 180,
            actions: (template) => [
              {
                label: 'Edit',
                icon: <EditIcon size={18} />,
                onClick: (data) => handleOpenDialog(data),
                color: colors.warning,
                hoverBackground: alpha(colors.text, 0.1),
                show: isAdmin || template.createdById === user?.id,
              },
              {
                label: template.isPublished ? 'Unpublish' : 'Publish',
                icon: template.isPublished ? <EyeOffIcon size={18} /> : <ViewIcon size={18} />,
                onClick: (data) => handlePublishToggle(data),
                color: template.isPublished ? colors.textSecondary : colors.success,
                hoverBackground: alpha(template.isPublished ? colors.text : colors.success, 0.15),
                show: isAdmin && template.status === 'APPROVED',
              },
              {
                label: 'Approve',
                icon: <ApproveIcon size={18} />,
                onClick: (data) => {
                  setCurrentTemplate(data);
                  setApprovalData({ action: 'approve', rejectionReason: '' });
                  setOpenApprovalDialog(true);
                },
                color: colors.success,
                hoverBackground: alpha(colors.success, 0.2),
                show: isAdmin && template.status === 'PENDING_APPROVAL',
              },
              {
                label: 'Reject',
                icon: <RejectIcon size={18} />,
                onClick: (data) => {
                  setCurrentTemplate(data);
                  setApprovalData({ action: 'reject', rejectionReason: '' });
                  setOpenApprovalDialog(true);
                },
                color: colors.error,
                hoverBackground: alpha(colors.error, 0.2),
                show: isAdmin && template.status === 'PENDING_APPROVAL',
              },
              {
                label: 'History',
                icon: <HistoryIcon size={18} />,
                onClick: (data) => {
                  setCurrentTemplate(data);
                  setHistoryPage(0);
                  fetchHistory(data.id);
                  setOpenHistoryDialog(true);
                },
                color: colors.primary,
                hoverBackground: alpha(colors.primary, 0.15),
              },
              {
                label: 'Delete',
                icon: <DeleteIcon size={18} />,
                onClick: (data) => {
                  setCurrentTemplate(data);
                  setOpenDeleteDialog(true);
                },
                color: '#ef4444',
                hoverBackground: alpha('#ef4444', 0.2),
                show: isSuperAdmin,
              },
            ],
          }}
          serverSidePagination={{
            totalRows: totalCount,
            currentPage: page,
            onPageChange: (newPage) => setPage(newPage),
            onPageSizeChange: (newSize) => setRowsPerPage(newSize),
          }}
          paginationPageSize={rowsPerPage}
          loading={loading}
          rowHeight={72}
          emptyState={
            <EmptyState
              title={emptyMessages[activeView] || 'No templates found'}
              description={isAdmin ? 'Create a new template to get started' : 'No templates are available in this view'}
            />
          }
        />
      </DashboardPanel>

      {/* ── 3.13.3: Create/Edit Dialog ── */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        fullScreen={isMobileScreen}
        PaperProps={{ sx: { background: colors.bgCard, borderRadius: 3, border: `1px solid ${colors.border}`, maxHeight: '90vh' } }}
      >
        <DialogTitle sx={{ color: colors.text, fontWeight: 700, borderBottom: `0.5px solid ${colors.border}` }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <span>{isEditing ? 'Edit Template' : 'Create New Template'}</span>
            {isEditing && currentTemplate && (
              <Chip
                label={statusConfig[currentTemplate.status]?.label || currentTemplate.status}
                size="small"
                sx={{ background: statusConfig[currentTemplate.status]?.bg || 'gray', color: '#F5F5F5', fontSize: '0.7rem' }}
              />
            )}
          </Stack>
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: colors.border }}>
          {isEditing && !isAdmin && currentTemplate?.status === 'APPROVED' && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Editing this approved template will reset it to &quot;Pending Approval&quot; for admin review.
            </Alert>
          )}
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <DashboardInput
                fullWidth
                label="Template Name"
                labelPlacement="floating"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                error={!!validationErrors.name}
                helperText={validationErrors.name || 'Must be between 5 and 255 characters'}
              />
            </Grid>
            <Grid item xs={12}>
              <DashboardInput
                fullWidth
                label="Description"
                labelPlacement="floating"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DashboardSelect
                fullWidth
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                error={!!validationErrors.category}
              >
                {TEMPLATE_CATEGORIES.map((c) => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </DashboardSelect>
              {validationErrors.category && (
                <Typography variant="caption" sx={{ color: colors.panelDanger, mt: 0.5, ml: 1.5 }}>{validationErrors.category}</Typography>
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              <DashboardSelect
                fullWidth
                label="Complexity"
                name="complexity"
                value={formData.complexity}
                onChange={handleInputChange}
              >
                {COMPLEXITY_OPTIONS.map((c) => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </DashboardSelect>
            </Grid>
            <Grid item xs={12}>
              <DashboardInput
                fullWidth
                label="Industry (comma-separated)"
                labelPlacement="floating"
                name="industry"
                value={formData.industry}
                onChange={handleInputChange}
                placeholder="e.g. retail, healthcare, finance"
              />
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 1, borderColor: colors.border }}>
                <Typography variant="caption" sx={{ color: colors.textSecondary }}>Preview URLs</Typography>
              </Divider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <DashboardInput fullWidth label="Thumbnail URL" labelPlacement="floating" name="thumbnailUrl" value={formData.thumbnailUrl} onChange={handleInputChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DashboardInput fullWidth label="Demo URL" labelPlacement="floating" name="demoUrl" value={formData.demoUrl} onChange={handleInputChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DashboardInput fullWidth label="Desktop Preview URL" labelPlacement="floating" name="desktopPreviewUrl" value={formData.desktopPreviewUrl} onChange={handleInputChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DashboardInput fullWidth label="Mobile Preview URL" labelPlacement="floating" name="mobilePreviewUrl" value={formData.mobilePreviewUrl} onChange={handleInputChange} />
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 1, borderColor: colors.border }}>
                <Typography variant="caption" sx={{ color: colors.textSecondary }}>Customization Options</Typography>
              </Divider>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {[
                  { name: 'allowColorCustomization', label: 'Allow Color Customization' },
                  { name: 'allowFontCustomization', label: 'Allow Font Customization' },
                  { name: 'allowLayoutCustomization', label: 'Allow Layout Customization' },
                  { name: 'isPremium', label: 'Premium Template' },
                ].map(({ name, label }) => (
                  <FormControlLabel
                    key={name}
                    control={
                      <Checkbox
                        checked={formData[name]}
                        onChange={handleInputChange}
                        name={name}
                        size="small"
                        sx={{ color: colors.textSecondary, '&.Mui-checked': { color: colors.primary } }}
                      />
                    }
                    label={<Typography variant="body2" sx={{ color: colors.textSecondary }}>{label}</Typography>}
                  />
                ))}
              </Stack>
            </Grid>
            {/* Pages are edited through the template editor, not this metadata form */}
            {!isAdmin && (
              <Grid item xs={12}>
                <DashboardInput
                  fullWidth
                  label="Change Reason"
                  labelPlacement="floating"
                  name="changeReason"
                  value={formData.changeReason}
                  onChange={handleInputChange}
                  multiline
                  rows={2}
                  required={isEditing && currentTemplate?.status === 'APPROVED'}
                  error={!!validationErrors.changeReason}
                  helperText={validationErrors.changeReason || 'Describe what you changed and why (required when editing approved templates)'}
                  placeholder="What did you change and why?"
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ borderTop: `0.5px solid ${colors.border}`, p: 2, gap: 1, flexWrap: 'wrap' }}>
          <DashboardCancelButton onClick={handleCloseDialog}>Cancel</DashboardCancelButton>
          {isAdmin ? (
            <>
              <DashboardActionButton onClick={() => handleSubmit('DRAFT')} disabled={actionLoading || !hasFormChanged()}>
                Save as Draft
              </DashboardActionButton>
              <DashboardGradientButton onClick={() => handleSubmit('APPROVED')} disabled={actionLoading || !hasFormChanged()}>
                Save &amp; Approve
              </DashboardGradientButton>
            </>
          ) : (
            <>
              <DashboardActionButton onClick={() => handleSubmit('DRAFT')} disabled={actionLoading || !hasFormChanged()}>
                Save as Draft
              </DashboardActionButton>
              <DashboardGradientButton onClick={() => handleSubmit('PENDING_APPROVAL')} disabled={actionLoading || !hasFormChanged()}>
                Submit for Approval
              </DashboardGradientButton>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* ── 3.13.4: Approve/Reject Dialog ── */}
      <Dialog
        open={openApprovalDialog}
        onClose={() => setOpenApprovalDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { background: colors.bgCard, borderRadius: 3, border: `1px solid ${colors.border}` } }}
      >
        <DialogTitle sx={{ color: colors.text, fontWeight: 700, borderBottom: `0.5px solid ${colors.border}` }}>
          {approvalData.action === 'approve' ? 'Approve Template' : 'Reject Template'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 2 }}>
            {approvalData.action === 'approve'
              ? `Are you sure you want to approve "${currentTemplate?.name}"?`
              : `Please provide a reason for rejecting "${currentTemplate?.name}".`}
          </Typography>
          {approvalData.action === 'reject' && (
            <DashboardInput
              fullWidth
              label="Rejection Reason"
              labelPlacement="floating"
              value={approvalData.rejectionReason}
              onChange={(e) => setApprovalData((prev) => ({ ...prev, rejectionReason: e.target.value }))}
              multiline
              rows={4}
              required
              placeholder="Explain why this template is being rejected..."
              inputProps={{ maxLength: 1000 }}
              helperText={`${approvalData.rejectionReason.length}/1000`}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ borderTop: `0.5px solid ${colors.border}`, p: 2, gap: 1 }}>
          <DashboardCancelButton onClick={() => setOpenApprovalDialog(false)}>Cancel</DashboardCancelButton>
          {approvalData.action === 'approve' ? (
            <DashboardGradientButton onClick={handleApprove} disabled={actionLoading}>
              Approve
            </DashboardGradientButton>
          ) : (
            <DashboardGradientButton
              onClick={handleReject}
              disabled={actionLoading || !approvalData.rejectionReason?.trim()}
              sx={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}
            >
              Reject Template
            </DashboardGradientButton>
          )}
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { background: colors.bgCard, borderRadius: 3, border: `1px solid ${colors.border}` } }}
      >
        <DialogTitle sx={{ color: colors.text, fontWeight: 700, borderBottom: `0.5px solid ${colors.border}` }}>
          Delete Template
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Alert severity="error" sx={{ mb: 2 }}>This template will be permanently deleted and cannot be recovered.</Alert>
          <Typography variant="body2" sx={{ color: colors.textSecondary }}>
            Are you sure you want to delete &quot;{currentTemplate?.name}&quot;?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ borderTop: `0.5px solid ${colors.border}`, p: 2, gap: 1 }}>
          <DashboardCancelButton onClick={() => setOpenDeleteDialog(false)}>Cancel</DashboardCancelButton>
          <DashboardGradientButton
            onClick={handleDelete}
            disabled={actionLoading}
            sx={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}
          >
            Delete Permanently
          </DashboardGradientButton>
        </DialogActions>
      </Dialog>

      {/* ── 3.13.5: Template History Panel ── */}
      <Dialog
        open={openHistoryDialog}
        onClose={() => setOpenHistoryDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { background: colors.bgCard, borderRadius: 3, border: `1px solid ${colors.border}`, maxHeight: '80vh' } }}
      >
        <DialogTitle sx={{ color: colors.text, fontWeight: 700, borderBottom: `0.5px solid ${colors.border}` }}>
          Template History — {currentTemplate?.name}
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {historyLoading ? (
            <Box sx={{ p: 3 }}>
              <Typography variant="body2" sx={{ color: colors.textSecondary }}>Loading history...</Typography>
            </Box>
          ) : historyData.length === 0 ? (
            <Box sx={{ p: 3 }}>
              <EmptyState title="No changes recorded yet" description="Changes to this template will appear here" />
            </Box>
          ) : (
            <DashboardCard sx={{ m: 0, boxShadow: 'none', borderRadius: 0 }}>
              <DashboardTable>
                <thead>
                  <tr>
                    <DashboardTableHeadCell>Timestamp</DashboardTableHeadCell>
                    <DashboardTableHeadCell>Editor</DashboardTableHeadCell>
                    <DashboardTableHeadCell>Action</DashboardTableHeadCell>
                    <DashboardTableHeadCell>Change Reason</DashboardTableHeadCell>
                    <DashboardTableHeadCell>Version</DashboardTableHeadCell>
                  </tr>
                </thead>
                <tbody>
                  {historyData
                    .slice(historyPage * historyRowsPerPage, (historyPage + 1) * historyRowsPerPage)
                    .map((entry, idx) => {
                      const actionColors = {
                        create: '#22c55e',
                        update: colors.primary,
                        approve: '#22c55e',
                        reject: '#ef4444',
                        publish: colors.primary,
                        unpublish: colors.textSecondary,
                      };
                      const actionColor = actionColors[entry.action?.toLowerCase()] || colors.textSecondary;
                      return (
                        <DashboardTableRow key={entry.id || idx}>
                          <td>
                            <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                              {entry.createdAt ? new Date(entry.createdAt).toLocaleString() : '—'}
                            </Typography>
                          </td>
                          <td>
                            <Typography variant="body2" sx={{ color: colors.text }}>
                              {entry.changedBy?.name || 'Unknown'}
                            </Typography>
                          </td>
                          <td>
                            <Chip
                              label={entry.action || 'update'}
                              size="small"
                              sx={{ background: alpha(actionColor, 0.15), color: actionColor, fontWeight: 600, fontSize: '0.7rem', border: `1px solid ${alpha(actionColor, 0.3)}` }}
                            />
                          </td>
                          <td>
                            <Typography
                              variant="body2"
                              sx={{ color: colors.textSecondary, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                              title={entry.changeReason || ''}
                            >
                              {entry.changeReason || '—'}
                            </Typography>
                          </td>
                          <td>
                            <Typography variant="caption" sx={{ color: colors.textTertiary }}>
                              v{entry.version || idx + 1}
                            </Typography>
                          </td>
                        </DashboardTableRow>
                      );
                    })}
                </tbody>
              </DashboardTable>
              <DashboardTablePagination
                count={historyData.length}
                rowsPerPage={historyRowsPerPage}
                page={historyPage}
                onPageChange={(_, newPage) => setHistoryPage(newPage)}
                onRowsPerPageChange={(e) => { setHistoryRowsPerPage(parseInt(e.target.value, 10)); setHistoryPage(0); }}
              />
            </DashboardCard>
          )}
        </DialogContent>
        <DialogActions sx={{ borderTop: `0.5px solid ${colors.border}`, p: 2 }}>
          <DashboardCancelButton onClick={() => setOpenHistoryDialog(false)}>Close</DashboardCancelButton>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ManageTemplates;
