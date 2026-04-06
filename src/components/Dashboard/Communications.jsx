/**
 * Communications Dashboard — Admin / Content Creator
 *
 * Broadcast notifications to targeted user audiences.
 *
 * Sub-tabs:
 *   Compose  — audience selector, channels, title/message/link, schedule toggle, estimated count
 *   History  — paginated list of past/draft broadcasts with status chips, delete, send actions
 *
 * Role restrictions:
 *   ADMIN / SUPER_ADMIN — all targeting options
 *   CONTENT_CREATOR     — template_users only (own templates)
 *
 * Step 10.10a
 */

import { memo, useState, useEffect, useCallback, useRef } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Switch from '@mui/material/Switch';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { alpha } from '@mui/material/styles';
import {
  Megaphone,
  Send,
  Trash2,
  Clock,
  Users,
  Loader,
} from 'lucide-react';
import axios from 'axios';
import { getDashboardColors } from '../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../context/ThemeContext';
import { isAdmin, isContentManager, hasRole, ROLES } from '../../constants/roles';
import {
  PageHeader,
  DashboardCard,
  DashboardTable,
  DashboardTableHeadCell,
  DashboardTablePagination,
  DashboardTableRow,
  TabNavigation,
  EmptyState,
  DashboardActionButton,
  DashboardConfirmButton,
  DashboardInput,
  DashboardSelect,
  ConfirmationDialog,
} from './shared';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// ─── Constants ────────────────────────────────────────────────────────────────

const TABS = [
  { label: 'Compose', value: 'compose' },
  { label: 'History', value: 'history' },
];

const TARGET_TYPES_ADMIN = [
  { value: 'all', label: 'All Users' },
  { value: 'role', label: 'By Role' },
  { value: 'plan', label: 'By Plan' },
  { value: 'activity', label: 'By Activity' },
  { value: 'template_users', label: 'Template Users' },
];

const TARGET_TYPES_CC = [{ value: 'template_users', label: 'Template Users' }];

const ROLE_OPTIONS = [
  { value: 'USER', label: 'User' },
  { value: 'CONTENT_CREATOR', label: 'Content Creator' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
];

const PLAN_OPTIONS = [
  { value: 'website_free', label: 'Free' },
  { value: 'website_core', label: 'Core' },
  { value: 'website_growth', label: 'Growth' },
  { value: 'website_agency', label: 'Agency' },
];

const ACTIVITY_OPTIONS = [
  { value: 'active_30', label: 'Active in last 30 days' },
  { value: 'inactive_90', label: 'Inactive for 90+ days' },
];

const STATUS_COLORS = {
  draft: 'default',
  scheduled: 'info',
  sending: 'warning',
  sent: 'success',
  failed: 'error',
};

const STATUS_LABELS = {
  draft: 'Draft',
  scheduled: 'Scheduled',
  sending: 'Sending…',
  sent: 'Sent',
  failed: 'Failed',
};

// ─── Status Chip ─────────────────────────────────────────────────────────────

const StatusChip = memo(({ status, colors }) => {
  const colorMap = {
    draft: alpha(colors.text, 0.1),
    scheduled: alpha('#2196F3', 0.15),
    sending: alpha('#FF9800', 0.15),
    sent: alpha(colors.success || '#4CAF50', 0.15),
    failed: alpha(colors.error || '#F44336', 0.15),
  };
  const textMap = {
    draft: colors.textSecondary,
    scheduled: '#2196F3',
    sending: '#FF9800',
    sent: colors.success || '#4CAF50',
    failed: colors.error || '#F44336',
  };
  return (
    <Chip
      label={STATUS_LABELS[status] || status}
      size="small"
      sx={{
        backgroundColor: colorMap[status] || alpha(colors.text, 0.1),
        color: textMap[status] || colors.textSecondary,
        fontWeight: 600,
        fontSize: '0.75rem',
        border: `1px solid ${alpha(textMap[status] || colors.text, 0.2)}`,
      }}
    />
  );
});
StatusChip.displayName = 'StatusChip';

// ─── Main Component ───────────────────────────────────────────────────────────

const Communications = memo(({ user, pageTitle, pageSubtitle }) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);

  const userIsAdmin = isAdmin(user?.role);
  const userIsCC = hasRole(user?.role, ROLES.CONTENT_CREATOR);
  const targetTypeOptions = userIsAdmin ? TARGET_TYPES_ADMIN : TARGET_TYPES_CC;

  // ─── Tab state ────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('compose');

  // ─── Compose form state ───────────────────────────────────────────────────
  const [targetType, setTargetType] = useState(userIsAdmin ? 'all' : 'template_users');
  const [targetValue, setTargetValue] = useState('');
  const [channels, setChannels] = useState(['in_app']);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [link, setLink] = useState('');
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');
  const [estimatedCount, setEstimatedCount] = useState(null);
  const [countLoading, setCountLoading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [composing, setComposing] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // ─── History state ────────────────────────────────────────────────────────
  const [broadcasts, setBroadcasts] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(0);
  const [historyRowsPerPage, setHistoryRowsPerPage] = useState(20);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [sendConfirmTarget, setSendConfirmTarget] = useState(null);

  // ─── Toast ────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const showToast = useCallback((message, severity = 'success') => {
    setToast({ open: true, message, severity });
  }, []);

  // ─── Fetch templates for CC/template_users targeting ─────────────────────
  const fetchTemplates = useCallback(async () => {
    if (targetType !== 'template_users') return;
    setTemplatesLoading(true);
    try {
      const res = await axios.get(`${API_URL}/templates`, {
        params: { status: 'approved', limit: 100, userId: user?.id },
        withCredentials: true,
      });
      // Filter to user's own templates for CC
      const all = res.data?.templates || [];
      const own = userIsAdmin ? all : all.filter((t) => t.userId === user?.id);
      setTemplates(own);
    } catch {
      setTemplates([]);
    } finally {
      setTemplatesLoading(false);
    }
  }, [targetType, user?.id, userIsAdmin]);

  useEffect(() => {
    if (targetType === 'template_users') {
      fetchTemplates();
    }
    // Reset targetValue when targetType changes
    setTargetValue('');
    setEstimatedCount(null);
  }, [targetType, fetchTemplates]);

  // ─── Fetch estimated count ────────────────────────────────────────────────
  const countDebounceRef = useRef(null);

  const fetchEstimatedCount = useCallback(() => {
    if (!targetType) return;
    // For types that need a value, require it
    if (['role', 'plan', 'activity', 'template_users'].includes(targetType) && !targetValue) {
      setEstimatedCount(null);
      return;
    }

    clearTimeout(countDebounceRef.current);
    countDebounceRef.current = setTimeout(async () => {
      setCountLoading(true);
      try {
        const params = { targetType };
        if (targetValue) params.targetValue = targetValue;
        const res = await axios.get(`${API_URL}/admin/broadcasts/preview-count`, {
          params,
          withCredentials: true,
        });
        setEstimatedCount(res.data?.count ?? null);
      } catch {
        setEstimatedCount(null);
      } finally {
        setCountLoading(false);
      }
    }, 400);
  }, [targetType, targetValue]);

  useEffect(() => {
    fetchEstimatedCount();
    return () => clearTimeout(countDebounceRef.current);
  }, [fetchEstimatedCount]);

  // ─── Fetch history ────────────────────────────────────────────────────────
  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const params = {
        page: historyPage + 1,
        limit: historyRowsPerPage,
      };
      if (statusFilter) params.status = statusFilter;
      const res = await axios.get(`${API_URL}/admin/broadcasts`, {
        params,
        withCredentials: true,
      });
      setBroadcasts(res.data?.broadcasts || []);
      setHistoryTotal(res.data?.pagination?.total || 0);
    } catch {
      setBroadcasts([]);
      setHistoryTotal(0);
    } finally {
      setHistoryLoading(false);
    }
  }, [historyPage, historyRowsPerPage, statusFilter]);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab, fetchHistory]);

  // ─── Form validation ──────────────────────────────────────────────────────
  const validateForm = useCallback(() => {
    const errors = {};
    if (!title.trim()) errors.title = 'Title is required';
    else if (title.trim().length > 100) errors.title = 'Title must be at most 100 characters';
    if (!message.trim()) errors.message = 'Message is required';
    else if (message.trim().length > 1000) errors.message = 'Message must be at most 1000 characters';
    if (channels.length === 0) errors.channels = 'At least one channel is required';
    if (['role', 'plan', 'activity', 'template_users'].includes(targetType) && !targetValue) {
      errors.targetValue = 'Please select a value for the chosen targeting type';
    }
    if (scheduleEnabled && !scheduledAt) {
      errors.scheduledAt = 'Schedule date/time is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [title, message, channels, targetType, targetValue, scheduleEnabled, scheduledAt]);

  // ─── Save draft ───────────────────────────────────────────────────────────
  const handleSaveDraft = useCallback(async () => {
    if (!validateForm()) return;
    setComposing(true);
    try {
      await axios.post(
        `${API_URL}/admin/broadcasts`,
        {
          title: title.trim(),
          message: message.trim(),
          targetType,
          targetValue: targetValue || null,
          channels,
          link: link.trim() || null,
          scheduledAt: null, // Always save as draft when saving
        },
        { withCredentials: true },
      );
      showToast('Draft saved successfully');
      resetForm();
      // Refresh history if on history tab
      if (activeTab === 'history') fetchHistory();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save draft';
      showToast(msg, 'error');
    } finally {
      setComposing(false);
    }
  }, [title, message, targetType, targetValue, channels, link, validateForm, showToast, activeTab, fetchHistory]);

  // ─── Send now ─────────────────────────────────────────────────────────────
  const handleSendNow = useCallback(async () => {
    if (!validateForm()) return;
    setComposing(true);
    try {
      // First create the broadcast as a draft
      const createRes = await axios.post(
        `${API_URL}/admin/broadcasts`,
        {
          title: title.trim(),
          message: message.trim(),
          targetType,
          targetValue: targetValue || null,
          channels,
          link: link.trim() || null,
          scheduledAt: scheduleEnabled && scheduledAt ? scheduledAt : null,
        },
        { withCredentials: true },
      );
      const broadcastId = createRes.data?.broadcast?.id;
      if (!broadcastId) throw new Error('Failed to create broadcast');

      // Then trigger the send
      await axios.post(
        `${API_URL}/admin/broadcasts/${broadcastId}/send`,
        {},
        { withCredentials: true },
      );

      showToast('Broadcast send initiated!');
      resetForm();
      // Switch to history to show progress
      setActiveTab('history');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send broadcast';
      showToast(msg, 'error');
    } finally {
      setComposing(false);
    }
  }, [
    title,
    message,
    targetType,
    targetValue,
    channels,
    link,
    scheduleEnabled,
    scheduledAt,
    validateForm,
    showToast,
  ]);

  const resetForm = useCallback(() => {
    setTitle('');
    setMessage('');
    setLink('');
    setTargetType(userIsAdmin ? 'all' : 'template_users');
    setTargetValue('');
    setChannels(['in_app']);
    setScheduleEnabled(false);
    setScheduledAt('');
    setEstimatedCount(null);
    setFormErrors({});
  }, [userIsAdmin]);

  // ─── Delete broadcast ─────────────────────────────────────────────────────
  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await axios.delete(`${API_URL}/admin/broadcasts/${deleteTarget.id}`, {
        withCredentials: true,
      });
      showToast('Broadcast deleted');
      setDeleteTarget(null);
      fetchHistory();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete broadcast';
      showToast(msg, 'error');
    } finally {
      setDeleteLoading(false);
    }
  }, [deleteTarget, fetchHistory, showToast]);

  // ─── Send from history (resend draft) ────────────────────────────────────
  const handleSendFromHistory = useCallback(async () => {
    if (!sendConfirmTarget) return;
    try {
      await axios.post(
        `${API_URL}/admin/broadcasts/${sendConfirmTarget.id}/send`,
        {},
        { withCredentials: true },
      );
      showToast('Broadcast send initiated');
      setSendConfirmTarget(null);
      fetchHistory();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send broadcast';
      showToast(msg, 'error');
    }
  }, [sendConfirmTarget, fetchHistory, showToast]);

  // ─── Channel toggle ───────────────────────────────────────────────────────
  const handleChannelToggle = useCallback((channel) => {
    setChannels((prev) =>
      prev.includes(channel) ? prev.filter((c) => c !== channel) : [...prev, channel],
    );
  }, []);

  // ─── Target value sub-selector ────────────────────────────────────────────
  const renderTargetValueSelector = () => {
    if (targetType === 'all') return null;

    if (targetType === 'role') {
      return (
        <DashboardSelect
          label="Role"
          value={targetValue}
          onChange={(e) => setTargetValue(e.target.value)}
          error={!!formErrors.targetValue}
          helperText={formErrors.targetValue}
          sx={{ minWidth: 200 }}
        >
          {ROLE_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </DashboardSelect>
      );
    }

    if (targetType === 'plan') {
      return (
        <DashboardSelect
          label="Plan"
          value={targetValue}
          onChange={(e) => setTargetValue(e.target.value)}
          error={!!formErrors.targetValue}
          helperText={formErrors.targetValue}
          sx={{ minWidth: 200 }}
        >
          {PLAN_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </DashboardSelect>
      );
    }

    if (targetType === 'activity') {
      return (
        <DashboardSelect
          label="Activity"
          value={targetValue}
          onChange={(e) => setTargetValue(e.target.value)}
          error={!!formErrors.targetValue}
          helperText={formErrors.targetValue}
          sx={{ minWidth: 240 }}
        >
          {ACTIVITY_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </DashboardSelect>
      );
    }

    if (targetType === 'template_users') {
      return (
        <DashboardSelect
          label="Template"
          value={targetValue}
          onChange={(e) => setTargetValue(e.target.value)}
          error={!!formErrors.targetValue}
          helperText={formErrors.targetValue || (templatesLoading ? 'Loading templates…' : '')}
          sx={{ minWidth: 260 }}
          disabled={templatesLoading}
        >
          {templates.length === 0 && !templatesLoading ? (
            <MenuItem value="" disabled>
              No templates found
            </MenuItem>
          ) : (
            templates.map((t) => (
              <MenuItem key={t.id} value={t.id}>
                {t.name || t.title || t.id}
              </MenuItem>
            ))
          )}
        </DashboardSelect>
      );
    }

    return null;
  };

  // ─── Format audience label for history ───────────────────────────────────
  const formatAudience = (broadcast) => {
    const labels = {
      all: 'All Users',
      role: `Role: ${broadcast.targetValue || ''}`,
      plan: `Plan: ${broadcast.targetValue || ''}`,
      activity: `Activity: ${broadcast.targetValue || ''}`,
      template_users: `Template Users`,
    };
    return labels[broadcast.targetType] || broadcast.targetType;
  };

  const formatChannels = (channels) => {
    if (!channels || channels.length === 0) return '—';
    return channels
      .map((c) => (c === 'in_app' ? 'In-App' : c === 'email' ? 'Email' : c))
      .join(', ');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString();
  };

  // ─── Compose tab ─────────────────────────────────────────────────────────
  const renderComposeTab = () => (
    <Grid container spacing={3}>
      {/* Left column: Audience + Channels */}
      <Grid item xs={12} md={5}>
        <DashboardCard colors={colors} sx={{ p: 3, mb: 3 }}>
          <Typography
            variant="subtitle1"
            sx={{ color: colors.text, fontWeight: 700, mb: 2 }}
          >
            Audience
          </Typography>

          <FormControl component="fieldset" sx={{ width: '100%' }}>
            <RadioGroup
              value={targetType}
              onChange={(e) => setTargetType(e.target.value)}
            >
              {targetTypeOptions.map((opt) => (
                <FormControlLabel
                  key={opt.value}
                  value={opt.value}
                  control={
                    <Radio
                      size="small"
                      sx={{
                        color: colors.textSecondary,
                        '&.Mui-checked': { color: colors.primary },
                      }}
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ color: colors.text }}>
                      {opt.label}
                    </Typography>
                  }
                />
              ))}
            </RadioGroup>
          </FormControl>

          {/* Sub-selector */}
          {targetType !== 'all' && (
            <Box sx={{ mt: 2 }}>{renderTargetValueSelector()}</Box>
          )}

          {/* Estimated count */}
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              borderRadius: 2,
              backgroundColor: alpha(colors.primary, 0.06),
              border: `1px solid ${alpha(colors.primary, 0.15)}`,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              minHeight: 42,
            }}
          >
            <Users size={16} color={colors.primary} />
            {countLoading ? (
              <CircularProgress size={14} sx={{ color: colors.primary }} />
            ) : estimatedCount !== null ? (
              <Typography variant="body2" sx={{ color: colors.primary, fontWeight: 600 }}>
                ~{estimatedCount.toLocaleString()} recipient{estimatedCount !== 1 ? 's' : ''}
              </Typography>
            ) : (
              <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                Select audience to see estimate
              </Typography>
            )}
          </Box>
        </DashboardCard>

        {/* Channels */}
        <DashboardCard colors={colors} sx={{ p: 3 }}>
          <Typography
            variant="subtitle1"
            sx={{ color: colors.text, fontWeight: 700, mb: 2 }}
          >
            Channels
          </Typography>
          <FormGroup>
            {[
              { value: 'in_app', label: 'In-App Notification' },
              { value: 'email', label: 'Email' },
            ].map((ch) => (
              <FormControlLabel
                key={ch.value}
                control={
                  <Checkbox
                    checked={channels.includes(ch.value)}
                    onChange={() => handleChannelToggle(ch.value)}
                    size="small"
                    sx={{
                      color: colors.textSecondary,
                      '&.Mui-checked': { color: colors.primary },
                    }}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ color: colors.text }}>
                    {ch.label}
                  </Typography>
                }
              />
            ))}
          </FormGroup>
          {formErrors.channels && (
            <Typography variant="caption" sx={{ color: colors.error || '#f44336', mt: 0.5 }}>
              {formErrors.channels}
            </Typography>
          )}
        </DashboardCard>
      </Grid>

      {/* Right column: Message + Actions */}
      <Grid item xs={12} md={7}>
        <DashboardCard colors={colors} sx={{ p: 3 }}>
          <Typography
            variant="subtitle1"
            sx={{ color: colors.text, fontWeight: 700, mb: 2 }}
          >
            Message
          </Typography>

          <Box sx={{ mb: 2 }}>
            <DashboardInput
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              error={!!formErrors.title}
              helperText={formErrors.title || `${title.length}/100`}
              inputProps={{ maxLength: 100 }}
              required
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <DashboardInput
              label="Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              fullWidth
              multiline
              rows={4}
              error={!!formErrors.message}
              helperText={formErrors.message || `${message.length}/1000`}
              inputProps={{ maxLength: 1000 }}
              required
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <DashboardInput
              label="Link (optional)"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              fullWidth
              placeholder="https://example.com or /dashboard/settings"
            />
          </Box>

          {/* Schedule toggle */}
          <Box
            sx={{
              mb: 3,
              p: 2,
              borderRadius: 2,
              border: `1px solid ${colors.border}`,
              backgroundColor: alpha(colors.text, 0.02),
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={scheduleEnabled}
                  onChange={(e) => setScheduleEnabled(e.target.checked)}
                  size="small"
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': { color: colors.primary },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: colors.primary,
                    },
                  }}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Clock size={16} color={colors.textSecondary} />
                  <Typography variant="body2" sx={{ color: colors.text }}>
                    Schedule for later
                  </Typography>
                </Box>
              }
            />

            {scheduleEnabled && (
              <Box sx={{ mt: 2 }}>
                <TextField
                  type="datetime-local"
                  label="Send at"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  error={!!formErrors.scheduledAt}
                  helperText={formErrors.scheduledAt}
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: colors.text,
                      '& fieldset': { borderColor: colors.border },
                      '&:hover fieldset': { borderColor: colors.primary },
                      '&.Mui-focused fieldset': { borderColor: colors.primary },
                    },
                    '& .MuiInputLabel-root': { color: colors.textSecondary },
                    '& .MuiInputLabel-root.Mui-focused': { color: colors.primary },
                  }}
                />
              </Box>
            )}
          </Box>

          {/* Action buttons */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <DashboardActionButton
              onClick={handleSaveDraft}
              disabled={composing}
              startIcon={composing ? <CircularProgress size={14} /> : null}
              variant="outlined"
            >
              Save Draft
            </DashboardActionButton>

            <DashboardConfirmButton
              onClick={handleSendNow}
              disabled={composing || channels.length === 0}
              startIcon={
                composing ? (
                  <CircularProgress size={14} />
                ) : (
                  <Send size={16} />
                )
              }
            >
              {scheduleEnabled ? 'Schedule' : 'Send Now'}
            </DashboardConfirmButton>
          </Box>
        </DashboardCard>
      </Grid>
    </Grid>
  );

  // ─── History tab ──────────────────────────────────────────────────────────
  const renderHistoryTab = () => (
    <Box>
      {/* Filter row */}
      <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <DashboardSelect
          label="Status"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setHistoryPage(0);
          }}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">All Statuses</MenuItem>
          {Object.entries(STATUS_LABELS).map(([val, label]) => (
            <MenuItem key={val} value={val}>
              {label}
            </MenuItem>
          ))}
        </DashboardSelect>
      </Box>

      {historyLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: colors.primary }} />
        </Box>
      ) : broadcasts.length === 0 ? (
        <EmptyState
          icon={<Megaphone size={32} color={colors.textSecondary} />}
          title="No broadcasts yet"
          subtitle="Use the Compose tab to send your first broadcast."
        />
      ) : (
        <DashboardTable colors={colors} variant="inset">
          <TableHead>
            <TableRow>
              <DashboardTableHeadCell colors={colors}>Title</DashboardTableHeadCell>
              <DashboardTableHeadCell colors={colors}>Audience</DashboardTableHeadCell>
              <DashboardTableHeadCell colors={colors}>Channels</DashboardTableHeadCell>
              <DashboardTableHeadCell colors={colors}>Recipients</DashboardTableHeadCell>
              <DashboardTableHeadCell colors={colors}>Status</DashboardTableHeadCell>
              <DashboardTableHeadCell colors={colors}>Sent At</DashboardTableHeadCell>
              <DashboardTableHeadCell colors={colors} align="right">
                Actions
              </DashboardTableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {broadcasts.map((bc) => (
              <DashboardTableRow key={bc.id} colors={colors}>
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{ color: colors.text, fontWeight: 600, maxWidth: 200, noWrap: true }}
                  >
                    {bc.title}
                  </Typography>
                  {bc.message && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: colors.textSecondary,
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: 200,
                      }}
                    >
                      {bc.message}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ color: colors.text }}>
                    {formatAudience(bc)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                    {formatChannels(bc.channels)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ color: colors.text }}>
                    {bc.recipientCount !== null && bc.recipientCount !== undefined
                      ? bc.recipientCount.toLocaleString()
                      : '—'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <StatusChip status={bc.status} colors={colors} />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                    {formatDate(bc.sentAt)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    {bc.status === 'draft' && (
                      <>
                        <DashboardActionButton
                          size="small"
                          onClick={() => setSendConfirmTarget(bc)}
                          startIcon={<Send size={14} />}
                          title="Send now"
                        >
                          Send
                        </DashboardActionButton>
                        <DashboardActionButton
                          size="small"
                          color="error"
                          onClick={() => setDeleteTarget(bc)}
                          title="Delete draft"
                        >
                          <Trash2 size={14} />
                        </DashboardActionButton>
                      </>
                    )}
                    {bc.status === 'sending' && (
                      <Loader size={16} color={colors.textSecondary} />
                    )}
                  </Box>
                </TableCell>
              </DashboardTableRow>
            ))}
          </TableBody>
        </DashboardTable>
      )}

      {broadcasts.length > 0 && (
        <DashboardTablePagination
          count={historyTotal}
          page={historyPage}
          rowsPerPage={historyRowsPerPage}
          onPageChange={(_, newPage) => setHistoryPage(newPage)}
          onRowsPerPageChange={(e) => {
            setHistoryRowsPerPage(parseInt(e.target.value, 10));
            setHistoryPage(0);
          }}
          colors={colors}
        />
      )}
    </Box>
  );

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <Container maxWidth="xl" sx={{ px: { xs: 0, sm: 0 } }}>
      <PageHeader title={pageTitle || 'Communications'} subtitle={pageSubtitle || 'Send broadcasts and targeted notifications'} />

      <TabNavigation
        tabs={TABS}
        value={activeTab}
        onChange={(_, val) => setActiveTab(val)}
      />

      {activeTab === 'compose' && renderComposeTab()}
      {activeTab === 'history' && renderHistoryTab()}

      {/* Delete confirmation */}
      <ConfirmationDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Broadcast"
        message={
          deleteTarget
            ? `Are you sure you want to delete the draft "${deleteTarget.title}"? This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        loading={deleteLoading}
        colors={colors}
      />

      {/* Send from history confirmation */}
      <ConfirmationDialog
        open={!!sendConfirmTarget}
        onClose={() => setSendConfirmTarget(null)}
        onConfirm={handleSendFromHistory}
        title="Send Broadcast"
        message={
          sendConfirmTarget
            ? `Send "${sendConfirmTarget.title}" to all targeted recipients? This cannot be undone.`
            : ''
        }
        confirmLabel="Send"
        colors={colors}
      />

      {/* Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={toast.severity}
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          variant="filled"
          sx={{ borderRadius: 2 }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Container>
  );
});

Communications.displayName = 'Communications';

export default Communications;
