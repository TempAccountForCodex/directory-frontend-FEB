import { memo, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Checkbox,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Alert,
  Skeleton,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import { MessageSquare, Download, Trash2, Eye, EyeOff, AlertTriangle, Mail } from 'lucide-react';
import axios from 'axios';
import { getDashboardColors } from '../../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../../context/ThemeContext';
import {
  EmptyState,
  SearchBar,
  FilterBar,
  DashboardTable,
  DashboardTableHeadCell,
  DashboardTablePagination,
  DashboardTableRow,
  DashboardActionButton,
  DashboardIconButton,
  DashboardDateField,
  ConfirmationDialog,
} from '../shared';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'read', label: 'Read' },
  { value: 'spam', label: 'Spam' },
];

const FormsTab = memo(({ website, websiteId }) => {
  const navigate = useNavigate();
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

  // State
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({ total: 0, unread: 0, spam: 0 });
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selected, setSelected] = useState([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailSubmission, setDetailSubmission] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);

  // Fetch submissions
  const fetchSubmissions = useCallback(async () => {
    if (!websiteId) return;
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      params.set('page', String(page + 1));
      params.set('limit', String(rowsPerPage));
      if (filter === 'unread') { params.set('isRead', 'false'); params.set('isSpam', 'false'); }
      else if (filter === 'read') params.set('isRead', 'true');
      else if (filter === 'spam') params.set('isSpam', 'true');
      if (search) params.set('search', search);
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);

      const res = await axios.get(
        `${API_URL}/forms/websites/${websiteId}/submissions?${params.toString()}`,
        { withCredentials: true }
      );
      const data = res.data?.data || {};
      setSubmissions(data.submissions || []);
      setTotal(data.total || 0);
      setStats(data.stats || { total: 0, unread: 0, spam: 0 });
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load form submissions.');
    } finally {
      setLoading(false);
    }
  }, [websiteId, page, rowsPerPage, filter, search, startDate, endDate]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  // Handlers
  const handleFilterChange = useCallback((e) => {
    setFilter(e.target.value);
    setPage(0);
    setSelected([]);
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearch(e.target.value);
    setPage(0);
  }, []);

  const handlePageChange = useCallback((_, newPage) => {
    setPage(newPage);
    setSelected([]);
  }, []);

  const handleRowsPerPageChange = useCallback((e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
    setSelected([]);
  }, []);

  const handleSelectAll = useCallback((e) => {
    if (e.target.checked) {
      setSelected(submissions.map((s) => s.id));
    } else {
      setSelected([]);
    }
  }, [submissions]);

  const handleSelectOne = useCallback((id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);

  const handleOpenDetail = useCallback(async (submission) => {
    try {
      const res = await axios.get(
        `${API_URL}/forms/websites/${websiteId}/submissions/${submission.id}`,
        { withCredentials: true }
      );
      setDetailSubmission(res.data?.data || submission);
      setDetailOpen(true);
    } catch {
      setDetailSubmission(submission);
      setDetailOpen(true);
    }
  }, [websiteId]);

  const handleCloseDetail = useCallback(() => {
    setDetailOpen(false);
    setDetailSubmission(null);
    fetchSubmissions();
  }, [fetchSubmissions]);

  const handleMarkRead = useCallback(async (id, isRead) => {
    try {
      await axios.patch(
        `${API_URL}/forms/websites/${websiteId}/submissions/${id}`,
        { isRead },
        { withCredentials: true }
      );
      fetchSubmissions();
      if (detailSubmission?.id === id) {
        setDetailSubmission((prev) => prev ? { ...prev, isRead } : prev);
      }
    } catch { /* handled by refetch */ }
  }, [websiteId, fetchSubmissions, detailSubmission]);

  const handleMarkSpam = useCallback(async (id, isSpam) => {
    try {
      await axios.patch(
        `${API_URL}/forms/websites/${websiteId}/submissions/${id}`,
        { isSpam },
        { withCredentials: true }
      );
      fetchSubmissions();
      if (detailSubmission?.id === id) {
        setDetailSubmission((prev) => prev ? { ...prev, isSpam } : prev);
      }
    } catch { /* handled by refetch */ }
  }, [websiteId, fetchSubmissions, detailSubmission]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      if (Array.isArray(deleteTarget)) {
        await axios.post(
          `${API_URL}/forms/websites/${websiteId}/submissions/bulk-delete`,
          { ids: deleteTarget },
          { withCredentials: true }
        );
        setSelected([]);
      } else {
        await axios.delete(
          `${API_URL}/forms/websites/${websiteId}/submissions/${deleteTarget}`,
          { withCredentials: true }
        );
        if (detailSubmission?.id === deleteTarget) handleCloseDetail();
      }
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
      fetchSubmissions();
    } catch { /* handled by refetch */ }
  }, [websiteId, deleteTarget, fetchSubmissions, detailSubmission, handleCloseDetail]);

  const handleBulkMarkRead = useCallback(async () => {
    if (selected.length === 0) return;
    try {
      setBulkLoading(true);
      await axios.post(
        `${API_URL}/forms/websites/${websiteId}/submissions/bulk-update`,
        { ids: selected, isRead: true },
        { withCredentials: true }
      );
      setSelected([]);
      fetchSubmissions();
    } catch { /* handled by refetch */ } finally {
      setBulkLoading(false);
    }
  }, [websiteId, selected, fetchSubmissions]);

  const handleExport = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filter === 'unread') { params.set('isRead', 'false'); params.set('isSpam', 'false'); }
      else if (filter === 'read') params.set('isRead', 'true');
      else if (filter === 'spam') params.set('isSpam', 'true');
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);

      const res = await axios.get(
        `${API_URL}/forms/websites/${websiteId}/submissions/export?${params.toString()}`,
        { withCredentials: true, responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `form-submissions-${websiteId}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch { /* silent */ }
  }, [websiteId, filter, startDate, endDate]);

  // Computed filter options with counts
  const filterOptions = useMemo(() => [
    { value: 'all', label: `All (${stats.total})` },
    { value: 'unread', label: `Unread (${stats.unread})` },
    { value: 'read', label: 'Read' },
    { value: 'spam', label: `Spam (${stats.spam})` },
  ], [stats]);

  // Truncate helper
  const truncate = (str, len = 80) => {
    if (!str) return '';
    return str.length > len ? str.slice(0, len) + '...' : str;
  };

  const getMessagePreview = (formData) => {
    if (!Array.isArray(formData)) return '';
    const msg = formData.find((f) => f.fieldName === 'message' || f.fieldType === 'textarea');
    return truncate(msg?.fieldValue || formData[0]?.fieldValue || '');
  };

  // Empty state
  if (!loading && submissions.length === 0 && filter === 'all' && !search && !startDate && !endDate) {
    return (
      <EmptyState
        icon={<MessageSquare size={48} />}
        title="No Form Submissions Yet"
        subtitle="Once visitors submit forms on your website, their responses will appear here."
        action={
          <DashboardActionButton
            variant="outlined"
            onClick={() => navigate(`/dashboard/websites/${websiteId}/editor`)}
            aria-label="Open editor to add a contact block"
          >
            Add a Contact Block
          </DashboardActionButton>
        }
      />
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}

      {/* Filters + Search */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 2,
          mb: 2,
          alignItems: isMobile ? 'stretch' : 'center',
          flexWrap: 'wrap',
        }}
      >
        <FilterBar
          label="Status"
          value={filter}
          onChange={handleFilterChange}
          options={filterOptions}
        />
        <SearchBar
          value={search}
          onChange={handleSearchChange}
          placeholder="Search by name or email..."
          fullWidth={isMobile}
        />
        <DashboardDateField
          label="From"
          value={startDate}
          onChange={(e) => { setStartDate(e.target.value); setPage(0); }}
        />
        <DashboardDateField
          label="To"
          value={endDate}
          onChange={(e) => { setEndDate(e.target.value); setPage(0); }}
        />
        <DashboardActionButton
          variant="outlined"
          onClick={handleExport}
          startIcon={<Download size={16} />}
          aria-label="Export submissions as CSV"
        >
          Export CSV
        </DashboardActionButton>
      </Box>

      {/* Bulk action bar */}
      {selected.length > 0 && (
        <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'center' }}>
          <Typography variant="body2" sx={{ color: colors.text }}>
            {selected.length} selected
          </Typography>
          <DashboardActionButton
            variant="outlined"
            size="small"
            onClick={handleBulkMarkRead}
            disabled={bulkLoading}
            startIcon={<Eye size={14} />}
            aria-label="Mark selected as read"
          >
            Mark as Read
          </DashboardActionButton>
          <DashboardActionButton
            variant="outlined"
            size="small"
            onClick={() => { setDeleteTarget(selected); setDeleteConfirmOpen(true); }}
            startIcon={<Trash2 size={14} />}
            aria-label="Delete selected submissions"
            sx={{ color: 'error.main', borderColor: 'error.main' }}
          >
            Delete Selected
          </DashboardActionButton>
        </Box>
      )}

      {/* Loading skeleton */}
      {loading ? (
        <Box>
          {[...Array(5)].map((_, i) => (
            <Skeleton key={`skel-${i}`} variant="rectangular" height={48} sx={{ mb: 1, borderRadius: 1 }} />
          ))}
        </Box>
      ) : (
        <Box sx={{ overflowX: 'auto' }}>
          <DashboardTable variant="inset" colors={colors}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selected.length === submissions.length && submissions.length > 0}
                      indeterminate={selected.length > 0 && selected.length < submissions.length}
                      onChange={handleSelectAll}
                      sx={{ color: alpha(colors.text, 0.5) }}
                      inputProps={{ 'aria-label': 'Select all submissions' }}
                    />
                  </TableCell>
                  <DashboardTableHeadCell colors={colors}>Date</DashboardTableHeadCell>
                  {!isMobile && <DashboardTableHeadCell colors={colors}>Name / Email</DashboardTableHeadCell>}
                  <DashboardTableHeadCell colors={colors}>Message</DashboardTableHeadCell>
                  <DashboardTableHeadCell colors={colors}>Status</DashboardTableHeadCell>
                  <DashboardTableHeadCell colors={colors} align="right">Actions</DashboardTableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {submissions.map((sub) => (
                  <DashboardTableRow
                    key={sub.id}
                    colors={colors}
                    onClick={() => handleOpenDetail(sub)}
                    sx={{ cursor: 'pointer', '&:hover': { bgcolor: alpha(colors.text, 0.02) } }}
                  >
                    <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selected.includes(sub.id)}
                        onChange={() => handleSelectOne(sub.id)}
                        sx={{ color: alpha(colors.text, 0.5) }}
                        inputProps={{ 'aria-label': `Select submission ${sub.id}` }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: colors.text, whiteSpace: 'nowrap' }}>
                      {new Date(sub.createdAt).toLocaleDateString()}
                    </TableCell>
                    {!isMobile && (
                      <TableCell sx={{ color: colors.text }}>
                        <Typography variant="body2" sx={{ fontWeight: sub.isRead ? 400 : 600, color: colors.text }}>
                          {sub.submitterName || '—'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: alpha(colors.text, 0.6) }}>
                          {sub.submitterEmail || ''}
                        </Typography>
                      </TableCell>
                    )}
                    <TableCell sx={{ color: colors.text, maxWidth: 300 }}>
                      <Typography variant="body2" noWrap sx={{ color: colors.text, fontWeight: sub.isRead ? 400 : 600 }}>
                        {getMessagePreview(sub.formData)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {sub.isSpam ? (
                        <Chip label="Spam" size="small" color="error" variant="outlined" />
                      ) : sub.isRead ? (
                        <Chip label="Read" size="small" sx={{ color: alpha(colors.text, 0.5), borderColor: alpha(colors.text, 0.2) }} variant="outlined" />
                      ) : (
                        <Chip label="New" size="small" color="primary" variant="filled" />
                      )}
                    </TableCell>
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      <DashboardIconButton
                        aria-label={sub.isRead ? 'Mark as unread' : 'Mark as read'}
                        onClick={() => handleMarkRead(sub.id, !sub.isRead)}
                      >
                        {sub.isRead ? <EyeOff size={16} /> : <Eye size={16} />}
                      </DashboardIconButton>
                      <DashboardIconButton
                        aria-label="Delete submission"
                        onClick={() => { setDeleteTarget(sub.id); setDeleteConfirmOpen(true); }}
                      >
                        <Trash2 size={16} />
                      </DashboardIconButton>
                    </TableCell>
                  </DashboardTableRow>
                ))}
                {submissions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={isMobile ? 5 : 6} sx={{ textAlign: 'center', py: 4, color: alpha(colors.text, 0.5) }}>
                      No submissions match your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <DashboardTablePagination
              colors={colors}
              component="div"
              count={total}
              page={page}
              onPageChange={handlePageChange}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleRowsPerPageChange}
              rowsPerPageOptions={[10, 20, 50]}
            />
          </DashboardTable>
        </Box>
      )}

      {/* Detail Modal */}
      <Dialog
        open={detailOpen}
        onClose={handleCloseDetail}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        aria-labelledby="submission-detail-title"
      >
        {detailSubmission && (
          <>
            <DialogTitle id="submission-detail-title" sx={{ color: colors.text }}>
              Form Submission
              <Typography variant="caption" display="block" sx={{ color: alpha(colors.text, 0.6) }}>
                {new Date(detailSubmission.createdAt).toLocaleString()}
              </Typography>
            </DialogTitle>
            <DialogContent dividers>
              {/* Submitter info */}
              {(detailSubmission.submitterName || detailSubmission.submitterEmail) && (
                <Box sx={{ mb: 2 }}>
                  {detailSubmission.submitterName && (
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {detailSubmission.submitterName}
                    </Typography>
                  )}
                  {detailSubmission.submitterEmail && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Mail size={14} />
                      <Typography variant="body2">{detailSubmission.submitterEmail}</Typography>
                    </Box>
                  )}
                </Box>
              )}

              {/* Form data */}
              {Array.isArray(detailSubmission.formData) &&
                detailSubmission.formData.map((field, idx) => (
                  <Box key={`${field.fieldName}-${idx}`} sx={{ mb: 1.5 }}>
                    <Typography variant="caption" sx={{ color: alpha(colors.text, 0.6), fontWeight: 600, textTransform: 'uppercase' }}>
                      {field.fieldName}
                    </Typography>
                    <Typography variant="body2" sx={{ color: colors.text, whiteSpace: 'pre-wrap' }}>
                      {String(field.fieldValue || '')}
                    </Typography>
                  </Box>
                ))}

              {/* Status chips */}
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                {detailSubmission.isSpam && <Chip label="Spam" size="small" color="error" icon={<AlertTriangle size={14} />} />}
                {detailSubmission.isRead ? (
                  <Chip label="Read" size="small" variant="outlined" />
                ) : (
                  <Chip label="Unread" size="small" color="primary" />
                )}
              </Box>
            </DialogContent>
            <DialogActions sx={{ flexWrap: 'wrap', gap: 1, p: 2 }}>
              <DashboardActionButton
                variant="outlined"
                size="small"
                onClick={() => handleMarkRead(detailSubmission.id, !detailSubmission.isRead)}
                startIcon={detailSubmission.isRead ? <EyeOff size={14} /> : <Eye size={14} />}
              >
                {detailSubmission.isRead ? 'Mark Unread' : 'Mark Read'}
              </DashboardActionButton>
              <DashboardActionButton
                variant="outlined"
                size="small"
                onClick={() => handleMarkSpam(detailSubmission.id, !detailSubmission.isSpam)}
                startIcon={<AlertTriangle size={14} />}
              >
                {detailSubmission.isSpam ? 'Not Spam' : 'Mark Spam'}
              </DashboardActionButton>
              <DashboardActionButton
                variant="outlined"
                size="small"
                onClick={() => { setDeleteTarget(detailSubmission.id); setDeleteConfirmOpen(true); }}
                startIcon={<Trash2 size={14} />}
                sx={{ color: 'error.main', borderColor: 'error.main' }}
              >
                Delete
              </DashboardActionButton>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Delete confirmation */}
      <ConfirmationDialog
        open={deleteConfirmOpen}
        onClose={() => { setDeleteConfirmOpen(false); setDeleteTarget(null); }}
        onConfirm={handleDelete}
        title={Array.isArray(deleteTarget) ? `Delete ${deleteTarget.length} submissions?` : 'Delete submission?'}
        message="This action cannot be undone."
        variant="danger"
        confirmText="Delete"
      />
    </Box>
  );
});

FormsTab.displayName = 'FormsTab';

export default FormsTab;
