/**
 * IntegrationsTab — step 10.6
 *
 * Full integrations management UI with:
 *   - Integration cards grid (1/2/3 col responsive)
 *   - Add Integration modal with template selector
 *   - Per-type config forms (GA, FB Pixel, GTM, Hotjar, Intercom, Custom Script)
 *   - Toggle active/inactive switch
 *   - Edit and Delete actions with confirmation dialog
 *   - Client-side ID format validation
 *   - Loading skeletons, error states, empty state
 *   - Success toasts via react-hot-toast
 *
 * Security: ID format validation client-side. Script content is sanitized server-side.
 *
 * Accessibility: touch targets >= 44px, aria-labels on all interactive elements.
 */

import { memo, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Grid,
  Alert,
  Skeleton,
  Switch,
  FormControlLabel,
  Chip,
  MenuItem,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import {
  Link,
  BarChart2,
  Facebook,
  Tag,
  Thermometer,
  MessageCircle,
  Code2,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { getDashboardColors } from '../../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../../context/ThemeContext';
import {
  EmptyState,
  DashboardInput,
  DashboardSelect,
  DashboardGradientButton,
  DashboardConfirmButton,
  DashboardCancelButton,
  DashboardTooltip,
  DashboardIconButton,
  ConfirmationDialog,
} from '../shared';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const INTEGRATION_TYPES = [
  {
    type: 'GOOGLE_ANALYTICS',
    label: 'Google Analytics 4',
    Icon: BarChart2,
    color: '#e37400',
    description: 'Track visitors and user behaviour',
  },
  {
    type: 'FACEBOOK_PIXEL',
    label: 'Facebook Pixel',
    Icon: Facebook,
    color: '#1877f2',
    description: 'Track conversions for Facebook ads',
  },
  {
    type: 'GOOGLE_TAG_MANAGER',
    label: 'Google Tag Manager',
    Icon: Tag,
    color: '#4285f4',
    description: 'Manage tags without code changes',
  },
  {
    type: 'HOTJAR',
    label: 'Hotjar',
    Icon: Thermometer,
    color: '#f0403b',
    description: 'Heatmaps, recordings, and feedback',
  },
  {
    type: 'INTERCOM',
    label: 'Intercom',
    Icon: MessageCircle,
    color: '#1f8dd6',
    description: 'Live chat and customer messaging',
  },
  {
    type: 'CUSTOM_SCRIPT',
    label: 'Custom Script',
    Icon: Code2,
    color: '#6366f1',
    description: 'Inject custom HTML snippets',
  },
];

const SCRIPT_POSITIONS = [
  { value: 'HEAD', label: 'Head' },
  { value: 'BODY_START', label: 'Body Start' },
  { value: 'BODY_END', label: 'Body End' },
];

// ---------------------------------------------------------------------------
// Validation helpers (client-side)
// ---------------------------------------------------------------------------

const GA_REGEX = /^G-[A-Z0-9]{10}$/;
const FB_PIXEL_REGEX = /^[0-9]{10,20}$/;
const GTM_REGEX = /^GTM-[A-Z0-9]{4,8}$/;
const HOTJAR_REGEX = /^[0-9]{4,10}$/;
const INTERCOM_REGEX = /^[a-z0-9]{8,12}$/;

function validateConfigClient(type, config) {
  const errors = {};
  switch (type) {
    case 'GOOGLE_ANALYTICS':
      if (!config.measurementId) errors.measurementId = 'Measurement ID is required';
      else if (!GA_REGEX.test(config.measurementId.trim()))
        errors.measurementId = 'Must match format G-XXXXXXXXXX';
      break;
    case 'FACEBOOK_PIXEL':
      if (!config.pixelId) errors.pixelId = 'Pixel ID is required';
      else if (!FB_PIXEL_REGEX.test(config.pixelId.trim()))
        errors.pixelId = 'Must be a numeric string (10-20 digits)';
      break;
    case 'GOOGLE_TAG_MANAGER':
      if (!config.containerId) errors.containerId = 'Container ID is required';
      else if (!GTM_REGEX.test(config.containerId.trim()))
        errors.containerId = 'Must match format GTM-XXXXXXX';
      break;
    case 'HOTJAR':
      if (!config.siteId) errors.siteId = 'Site ID is required';
      else if (!HOTJAR_REGEX.test(config.siteId.trim()))
        errors.siteId = 'Must be a numeric string (4-10 digits)';
      break;
    case 'INTERCOM':
      if (!config.appId) errors.appId = 'App ID is required';
      else if (!INTERCOM_REGEX.test(config.appId.trim()))
        errors.appId = 'Must be 8-12 lowercase alphanumeric characters';
      break;
    case 'CUSTOM_SCRIPT':
      if (!config.scriptContent) errors.scriptContent = 'Script content is required';
      if (!config.position) errors.position = 'Injection position is required';
      break;
    default:
      break;
  }
  return errors;
}

function getDefaultConfig(type) {
  switch (type) {
    case 'GOOGLE_ANALYTICS':
      return { measurementId: '' };
    case 'FACEBOOK_PIXEL':
      return { pixelId: '' };
    case 'GOOGLE_TAG_MANAGER':
      return { containerId: '' };
    case 'HOTJAR':
      return { siteId: '' };
    case 'INTERCOM':
      return { appId: '' };
    case 'CUSTOM_SCRIPT':
      return { scriptContent: '', position: 'BODY_END', description: '' };
    default:
      return {};
  }
}

function getTypeInfo(type) {
  return INTEGRATION_TYPES.find((t) => t.type === type) || {
    type,
    label: type,
    Icon: Code2,
    color: '#999',
    description: '',
  };
}

function getConfigSummary(type, config) {
  switch (type) {
    case 'GOOGLE_ANALYTICS':
      return config.measurementId || '—';
    case 'FACEBOOK_PIXEL':
      return config.pixelId || '—';
    case 'GOOGLE_TAG_MANAGER':
      return config.containerId || '—';
    case 'HOTJAR':
      return config.siteId || '—';
    case 'INTERCOM':
      return config.appId || '—';
    case 'CUSTOM_SCRIPT':
      return config.description || config.position || 'Custom';
    default:
      return '—';
  }
}

// ---------------------------------------------------------------------------
// SkeletonCard
// ---------------------------------------------------------------------------

const SkeletonCard = memo(() => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);
  return (
    <Box
      sx={{
        borderRadius: '18px',
        background: colors.panelBg,
        p: '20px',
        height: 160,
      }}
    >
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <Skeleton variant="circular" width={48} height={48} />
        <Box flex={1}>
          <Skeleton variant="text" width="60%" height={24} />
          <Skeleton variant="text" width="40%" height={18} />
        </Box>
        <Skeleton variant="rounded" width={64} height={28} />
      </Box>
      <Skeleton variant="text" width="80%" height={16} />
      <Skeleton variant="text" width="50%" height={16} />
    </Box>
  );
});
SkeletonCard.displayName = 'SkeletonCard';

// ---------------------------------------------------------------------------
// ConfigForm — per-type fields
// ---------------------------------------------------------------------------

const ConfigForm = memo(({ type, config, errors, onChange }) => {
  const handleChange = useCallback(
    (field) => (e) => {
      onChange({ ...config, [field]: e.target.value });
    },
    [config, onChange]
  );

  switch (type) {
    case 'GOOGLE_ANALYTICS':
      return (
        <DashboardInput
          label="Measurement ID"
          placeholder="G-XXXXXXXXXX"
          value={config.measurementId || ''}
          onChange={handleChange('measurementId')}
          error={!!errors.measurementId}
          helperText={errors.measurementId || 'Found in GA4 → Admin → Data Streams → Web'}
          inputProps={{ 'aria-label': 'Google Analytics Measurement ID' }}
        />
      );

    case 'FACEBOOK_PIXEL':
      return (
        <DashboardInput
          label="Pixel ID"
          placeholder="123456789012345"
          value={config.pixelId || ''}
          onChange={handleChange('pixelId')}
          error={!!errors.pixelId}
          helperText={errors.pixelId || 'Found in Facebook Events Manager → Pixels'}
          inputProps={{ 'aria-label': 'Facebook Pixel ID', inputMode: 'numeric' }}
        />
      );

    case 'GOOGLE_TAG_MANAGER':
      return (
        <DashboardInput
          label="Container ID"
          placeholder="GTM-XXXXXXX"
          value={config.containerId || ''}
          onChange={handleChange('containerId')}
          error={!!errors.containerId}
          helperText={errors.containerId || 'Found in GTM → Admin → Container Settings'}
          inputProps={{ 'aria-label': 'GTM Container ID' }}
        />
      );

    case 'HOTJAR':
      return (
        <DashboardInput
          label="Site ID"
          placeholder="1234567"
          value={config.siteId || ''}
          onChange={handleChange('siteId')}
          error={!!errors.siteId}
          helperText={errors.siteId || 'Found in Hotjar → Settings → Sites & Organizations'}
          inputProps={{ 'aria-label': 'Hotjar Site ID', inputMode: 'numeric' }}
        />
      );

    case 'INTERCOM':
      return (
        <DashboardInput
          label="App ID"
          placeholder="abc12def"
          value={config.appId || ''}
          onChange={handleChange('appId')}
          error={!!errors.appId}
          helperText={errors.appId || 'Found in Intercom → Settings → Installation → Web'}
          inputProps={{ 'aria-label': 'Intercom App ID' }}
        />
      );

    case 'CUSTOM_SCRIPT':
      return (
        <Box display="flex" flexDirection="column" gap={2}>
          <DashboardInput
            label="Script Content"
            placeholder="<!-- Your custom HTML snippet here -->"
            value={config.scriptContent || ''}
            onChange={handleChange('scriptContent')}
            error={!!errors.scriptContent}
            helperText={errors.scriptContent || 'Script and iframe tags are not allowed'}
            multiline
            minRows={4}
            maxRows={10}
            inputProps={{ 'aria-label': 'Custom script content' }}
          />
          <DashboardSelect
            label="Injection Position"
            value={config.position || 'BODY_END'}
            onChange={handleChange('position')}
            error={!!errors.position}
            helperText={errors.position || 'Where the snippet is injected in the page'}
            inputProps={{ 'aria-label': 'Script injection position' }}
          >
            {SCRIPT_POSITIONS.map((pos) => (
              <MenuItem key={pos.value} value={pos.value}>
                {pos.label}
              </MenuItem>
            ))}
          </DashboardSelect>
          <DashboardInput
            label="Description (optional)"
            placeholder="e.g., Chat widget, conversion pixel"
            value={config.description || ''}
            onChange={handleChange('description')}
            helperText="A short note about what this script does"
            inputProps={{ 'aria-label': 'Script description' }}
          />
        </Box>
      );

    default:
      return null;
  }
});
ConfigForm.displayName = 'ConfigForm';

// ---------------------------------------------------------------------------
// IntegrationCard
// ---------------------------------------------------------------------------

const IntegrationCard = memo(({ integration, onToggle, onEdit, onDelete }) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);
  const isDark = actualTheme === 'dark';
  const typeInfo = useMemo(() => getTypeInfo(integration.integrationType), [integration.integrationType]);
  const { Icon, color, label } = typeInfo;
  const summary = useMemo(
    () => getConfigSummary(integration.integrationType, integration.config || {}),
    [integration.integrationType, integration.config]
  );
  const lastModified = new Date(integration.updatedAt || integration.createdAt).toLocaleDateString();

  return (
    <Box
      sx={{
        borderRadius: '18px',
        background: colors.panelBg,
        border: `1px solid ${integration.isActive ? alpha(color, 0.3) : colors.panelBorder}`,
        p: { xs: '16px', sm: '20px' },
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          boxShadow: isDark
            ? `0 4px 24px ${alpha('#000', 0.3)}`
            : `0 4px 16px ${alpha('#000', 0.08)}`,
        },
      }}
    >
      {/* Header row */}
      <Box display="flex" alignItems="center" gap={1.5}>
        <Box
          sx={{
            width: 44,
            height: 44,
            minWidth: 44,
            borderRadius: '12px',
            background: alpha(color, 0.12),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
          aria-hidden="true"
        >
          <Icon size={22} color={color} />
        </Box>

        <Box flex={1} minWidth={0}>
          <Typography
            variant="subtitle2"
            sx={{
              color: colors.panelText,
              fontWeight: 600,
              fontSize: '0.95rem',
              lineHeight: 1.2,
            }}
            noWrap
          >
            {label}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: colors.panelMuted, fontSize: '0.78rem' }}
            noWrap
          >
            {summary}
          </Typography>
        </Box>

        {/* Status chip */}
        <Chip
          label={integration.isActive ? 'Active' : 'Inactive'}
          size="small"
          icon={
            integration.isActive ? (
              <CheckCircle size={12} />
            ) : (
              <XCircle size={12} />
            )
          }
          sx={{
            height: 26,
            fontSize: '0.72rem',
            fontWeight: 600,
            bgcolor: integration.isActive ? alpha('#22c55e', 0.12) : alpha(colors.panelMuted, 0.15),
            color: integration.isActive ? '#22c55e' : colors.panelMuted,
            '& .MuiChip-icon': {
              color: integration.isActive ? '#22c55e' : colors.panelMuted,
            },
            flexShrink: 0,
          }}
        />
      </Box>

      {/* Last modified */}
      <Typography
        variant="caption"
        sx={{ color: alpha(colors.panelText, 0.4), fontSize: '0.75rem' }}
      >
        Last updated: {lastModified}
      </Typography>

      {/* Actions row */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        sx={{ pt: 0.5, borderTop: `1px solid ${alpha(colors.panelBorder, 0.5)}` }}
      >
        {/* Toggle switch */}
        <FormControlLabel
          control={
            <Switch
              checked={Boolean(integration.isActive)}
              onChange={() => onToggle(integration.id)}
              size="small"
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': { color: '#22c55e' },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: '#22c55e',
                },
              }}
              inputProps={{
                'aria-label': `${integration.isActive ? 'Disable' : 'Enable'} ${label}`,
              }}
            />
          }
          label={
            <Typography sx={{ fontSize: '0.8rem', color: colors.panelMuted }}>
              {integration.isActive ? 'Enabled' : 'Disabled'}
            </Typography>
          }
          sx={{ m: 0, gap: 0.5 }}
        />

        {/* Edit / Delete buttons */}
        <Box display="flex" gap={0.5}>
          <DashboardTooltip title="Edit integration">
            <DashboardIconButton
              onClick={() => onEdit(integration)}
              size="small"
              aria-label={`Edit ${label} integration`}
              sx={{ minWidth: 44, minHeight: 44 }}
            >
              <Edit2 size={16} />
            </DashboardIconButton>
          </DashboardTooltip>
          <DashboardTooltip title="Delete integration">
            <DashboardIconButton
              onClick={() => onDelete(integration)}
              size="small"
              aria-label={`Delete ${label} integration`}
              sx={{ minWidth: 44, minHeight: 44, color: colors.panelDanger }}
            >
              <Trash2 size={16} />
            </DashboardIconButton>
          </DashboardTooltip>
        </Box>
      </Box>
    </Box>
  );
});
IntegrationCard.displayName = 'IntegrationCard';

// ---------------------------------------------------------------------------
// TypeSelector — shown in step 1 of add flow
// ---------------------------------------------------------------------------

const TypeSelector = memo(({ onSelect }) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);

  return (
    <Grid container spacing={1.5}>
      {INTEGRATION_TYPES.map(({ type, label, Icon, color, description }) => (
        <Grid item xs={12} sm={6} key={type}>
          <Box
            component="button"
            onClick={() => onSelect(type)}
            sx={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              p: '14px 16px',
              borderRadius: '12px',
              border: `1px solid ${colors.panelBorder}`,
              background: colors.panelBg,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease',
              minHeight: 44,
              '&:hover': {
                border: `1px solid ${alpha(color, 0.5)}`,
                background: alpha(color, 0.05),
                transform: 'translateY(-1px)',
              },
              '&:focus-visible': {
                outline: `2px solid ${color}`,
                outlineOffset: 2,
              },
            }}
            aria-label={`Add ${label} integration`}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                background: alpha(color, 0.12),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
              aria-hidden="true"
            >
              <Icon size={20} color={color} />
            </Box>
            <Box>
              <Typography
                sx={{
                  color: colors.panelText,
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  lineHeight: 1.2,
                }}
              >
                {label}
              </Typography>
              <Typography sx={{ color: colors.panelMuted, fontSize: '0.78rem' }}>
                {description}
              </Typography>
            </Box>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
});
TypeSelector.displayName = 'TypeSelector';

// ---------------------------------------------------------------------------
// IntegrationDialog — add/edit modal
// ---------------------------------------------------------------------------

const IntegrationDialog = memo(({
  open,
  mode,
  selectedType,
  config,
  configErrors,
  saving,
  onTypeSelect,
  onConfigChange,
  onSave,
  onClose,
}) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);
  const muiTheme = useTheme();
  const fullScreen = useMediaQuery(muiTheme.breakpoints.down('sm'));
  const typeInfo = selectedType ? getTypeInfo(selectedType) : null;

  const isStep2 = selectedType !== null;
  const title = mode === 'edit'
    ? `Edit ${typeInfo?.label || 'Integration'}`
    : isStep2
    ? `Configure ${typeInfo?.label || 'Integration'}`
    : 'Add Integration';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="sm"
      fullWidth
      aria-labelledby="integration-dialog-title"
      PaperProps={{
        sx: {
          bgcolor: colors.panelBg,
          borderRadius: fullScreen ? 0 : '16px',
          border: fullScreen ? 'none' : `1px solid ${colors.panelBorder}`,
        },
      }}
    >
      <DialogTitle
        id="integration-dialog-title"
        sx={{
          pb: 1,
          color: colors.panelText,
          fontWeight: 700,
          fontSize: '1.1rem',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        {typeInfo && (
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              background: alpha(typeInfo.color, 0.12),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
            aria-hidden="true"
          >
            <typeInfo.Icon size={18} color={typeInfo.color} />
          </Box>
        )}
        {title}
      </DialogTitle>

      <DialogContent sx={{ pt: isStep2 || mode === 'edit' ? 1 : 2 }}>
        {/* Step 1: type selector */}
        {!isStep2 && mode === 'add' && (
          <TypeSelector onSelect={onTypeSelect} />
        )}

        {/* Step 2: config form */}
        {(isStep2 || mode === 'edit') && selectedType && (
          <Box pt={1}>
            <ConfigForm
              type={selectedType}
              config={config}
              errors={configErrors}
              onChange={onConfigChange}
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, gap: 1 }}>
        {isStep2 && mode === 'add' && (
          <DashboardCancelButton
            onClick={() => onTypeSelect(null)}
            disabled={saving}
            sx={{ minHeight: 44 }}
          >
            Back
          </DashboardCancelButton>
        )}
        <DashboardCancelButton
          onClick={onClose}
          disabled={saving}
          sx={{ minHeight: 44 }}
        >
          Cancel
        </DashboardCancelButton>
        {(isStep2 || mode === 'edit') && (
          <DashboardConfirmButton
            tone="primary"
            onClick={onSave}
            disabled={saving}
            sx={{ minHeight: 44 }}
          >
            {saving ? 'Saving...' : mode === 'edit' ? 'Update' : 'Save Integration'}
          </DashboardConfirmButton>
        )}
      </DialogActions>
    </Dialog>
  );
});
IntegrationDialog.displayName = 'IntegrationDialog';

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const IntegrationsTab = memo(({ website, websiteId }) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);

  // List state
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' | 'edit'
  const [selectedType, setSelectedType] = useState(null);
  const [editingIntegration, setEditingIntegration] = useState(null);
  const [config, setConfig] = useState({});
  const [configErrors, setConfigErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ---------------------------------------------------------------------------
  // API helpers
  // ---------------------------------------------------------------------------

  const baseUrl = useMemo(
    () => `${API_URL}/websites/${websiteId}/integrations`,
    [websiteId]
  );

  const fetchIntegrations = useCallback(async () => {
    if (!websiteId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(baseUrl, { withCredentials: true });
      setIntegrations(res.data?.data || []);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to load integrations. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [websiteId, baseUrl]);

  useEffect(() => {
    fetchIntegrations();
  }, [fetchIntegrations]);

  // ---------------------------------------------------------------------------
  // Dialog handlers
  // ---------------------------------------------------------------------------

  const handleOpenAdd = useCallback(() => {
    setDialogMode('add');
    setSelectedType(null);
    setConfig({});
    setConfigErrors({});
    setEditingIntegration(null);
    setDialogOpen(true);
  }, []);

  const handleOpenEdit = useCallback((integration) => {
    setDialogMode('edit');
    setEditingIntegration(integration);
    setSelectedType(integration.integrationType);
    setConfig({ ...integration.config });
    setConfigErrors({});
    setDialogOpen(true);
  }, []);

  const handleTypeSelect = useCallback((type) => {
    setSelectedType(type);
    if (type) {
      setConfig(getDefaultConfig(type));
    }
    setConfigErrors({});
  }, []);

  const handleConfigChange = useCallback((newConfig) => {
    setConfig(newConfig);
    // Clear errors on change
    setConfigErrors({});
  }, []);

  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false);
    setSelectedType(null);
    setConfig({});
    setConfigErrors({});
    setEditingIntegration(null);
  }, []);

  const handleSave = useCallback(async () => {
    if (!selectedType) return;

    // Client-side validation
    const errors = validateConfigClient(selectedType, config);
    if (Object.keys(errors).length > 0) {
      setConfigErrors(errors);
      return;
    }

    setSaving(true);
    try {
      if (dialogMode === 'edit' && editingIntegration) {
        await axios.put(`${baseUrl}/${editingIntegration.id}`, { config }, { withCredentials: true });
        toast.success('Integration updated');
      } else {
        await axios.post(baseUrl, { integrationType: selectedType, config }, { withCredentials: true });
        toast.success('Integration added successfully');
      }
      await fetchIntegrations();
      handleCloseDialog();
    } catch (err) {
      const msg = err?.response?.data?.error || 'Failed to save integration. Please try again.';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }, [selectedType, config, dialogMode, editingIntegration, baseUrl, fetchIntegrations, handleCloseDialog]);

  // ---------------------------------------------------------------------------
  // Toggle handler
  // ---------------------------------------------------------------------------

  const handleToggle = useCallback(async (integrationId) => {
    try {
      await axios.patch(`${baseUrl}/${integrationId}/toggle`, {}, { withCredentials: true });
      setIntegrations((prev) =>
        prev.map((i) => (i.id === integrationId ? { ...i, isActive: !i.isActive } : i))
      );
    } catch (err) {
      toast.error('Failed to update integration status.');
    }
  }, [baseUrl]);

  // ---------------------------------------------------------------------------
  // Delete handlers
  // ---------------------------------------------------------------------------

  const handleDeleteClick = useCallback((integration) => {
    setDeleteTarget(integration);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await axios.delete(`${baseUrl}/${deleteTarget.id}`, { withCredentials: true });
      setIntegrations((prev) => prev.filter((i) => i.id !== deleteTarget.id));
      toast.success('Integration removed');
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    } catch (err) {
      toast.error('Failed to remove integration. Please try again.');
    } finally {
      setDeleting(false);
    }
  }, [baseUrl, deleteTarget]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
  }, []);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const deleteTargetLabel = deleteTarget ? getTypeInfo(deleteTarget.integrationType).label : '';

  return (
    <Box>
      {/* Header */}
      <Box
        display="flex"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        flexDirection={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        gap={2}
        mb={3}
      >
        <Box>
          <Typography
            variant="h6"
            sx={{ color: colors.text, fontWeight: 700, fontSize: '1.1rem' }}
          >
            Third-Party Integrations
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: colors.textSecondary, mt: 0.5, fontSize: '0.875rem' }}
          >
            Connect analytics, tracking, and marketing tools to your website.
          </Typography>
        </Box>
        <DashboardGradientButton
          startIcon={<Plus size={18} />}
          onClick={handleOpenAdd}
          aria-label="Add integration"
          sx={{ minHeight: 44, flexShrink: 0 }}
        >
          Add Integration
        </DashboardGradientButton>
      </Box>

      {/* Error state */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Loading state */}
      {loading && (
        <Grid container spacing={2}>
          {[1, 2, 3].map((n) => (
            <Grid item xs={12} sm={6} lg={4} key={n}>
              <SkeletonCard />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Empty state */}
      {!loading && !error && integrations.length === 0 && (
        <EmptyState
          icon={<Link size={48} color={colors.textSecondary} />}
          title="No integrations configured"
          subtitle="Add Google Analytics, Facebook Pixel, or custom scripts to enhance your website."
          action={
            <DashboardGradientButton
              startIcon={<Plus size={18} />}
              onClick={handleOpenAdd}
              aria-label="Add your first integration"
              sx={{ minHeight: 44 }}
            >
              Add Integration
            </DashboardGradientButton>
          }
        />
      )}

      {/* Integrations grid */}
      {!loading && integrations.length > 0 && (
        <Grid container spacing={2}>
          {integrations.map((integration) => (
            <Grid item xs={12} sm={6} lg={4} key={integration.id}>
              <IntegrationCard
                integration={integration}
                onToggle={handleToggle}
                onEdit={handleOpenEdit}
                onDelete={handleDeleteClick}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add / Edit dialog */}
      <IntegrationDialog
        open={dialogOpen}
        mode={dialogMode}
        selectedType={selectedType}
        config={config}
        configErrors={configErrors}
        saving={saving}
        onTypeSelect={handleTypeSelect}
        onConfigChange={handleConfigChange}
        onSave={handleSave}
        onClose={handleCloseDialog}
      />

      {/* Delete confirmation */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        variant="danger"
        title="Remove Integration"
        message={`Are you sure you want to remove the ${deleteTargetLabel} integration? This action cannot be undone.`}
        confirmLabel="Remove"
        cancelLabel="Cancel"
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </Box>
  );
});

IntegrationsTab.displayName = 'IntegrationsTab';

export default IntegrationsTab;
