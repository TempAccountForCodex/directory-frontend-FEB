/**
 * ThemeManager (Step 9.4.2)
 *
 * Visual manager for website theme presets. Fetches themes from the API,
 * displays them as DashboardCard grid items, and supports CRUD operations.
 *
 * Props:
 *   websiteId       {string} — target website ID
 *   currentThemeId  {string} — currently active theme ID
 *   onThemeChange   {function} — called after set-as-default or delete
 */

import { memo, useState, useCallback, useEffect, useMemo } from 'react';
import {
  Box,
  Grid,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Button,
  TextField,
  IconButton,
  Tooltip,
  alpha,
} from '@mui/material';
import { Palette, Copy, Trash2, Star, Plus, X } from 'lucide-react';
import axios from 'axios';

import DashboardCard from './shared/DashboardCard';
import ConfirmationDialog from './shared/ConfirmationDialog';
import EmptyState from './shared/EmptyState';
import DashboardGradientButton from './shared/DashboardGradientButton';
import { useTheme as useCustomTheme } from '../../context/ThemeContext';
import { getDashboardColors } from '../../styles/dashboardTheme';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const truncate = (str, max) => {
  if (!str) return '';
  return str.length > max ? str.slice(0, max) + '…' : str;
};

const API_BASE = '/api';

// ---------------------------------------------------------------------------
// ThemeManager Component
// ---------------------------------------------------------------------------

const ThemeManager = memo(({ websiteId, currentThemeId, onThemeChange }) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);

  // ── State ──────────────────────────────────────────────────────────────
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [settingDefault, setSettingDefault] = useState(null); // themeId
  const [cloning, setCloning] = useState(null); // themeId

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [themeToDelete, setThemeToDelete] = useState(null);

  // Set-default confirmation dialog
  const [setDefaultDialogOpen, setSetDefaultDialogOpen] = useState(false);
  const [themeToSetDefault, setThemeToSetDefault] = useState(null);

  // Create form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [createNameError, setCreateNameError] = useState('');
  const [creating, setCreating] = useState(false);

  // ── Data fetching ───────────────────────────────────────────────────────
  const fetchThemes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(`${API_BASE}/websites/${websiteId}/themes`);
      setThemes(Array.isArray(data) ? data : []);
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || 'Failed to load themes';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [websiteId]);

  useEffect(() => {
    fetchThemes();
  }, [fetchThemes]);

  // ── Derived state ────────────────────────────────────────────────────────
  const isEmpty = useMemo(() => !loading && !error && themes.length === 0, [loading, error, themes]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleOpenDeleteDialog = useCallback((theme) => {
    setThemeToDelete(theme);
    setDeleteDialogOpen(true);
  }, []);

  const handleCloseDeleteDialog = useCallback(() => {
    setDeleteDialogOpen(false);
    setThemeToDelete(null);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!themeToDelete) return;
    setDeleting(true);
    try {
      await axios.delete(`${API_BASE}/websites/${websiteId}/themes/${themeToDelete.id}`);
      setDeleteDialogOpen(false);
      setThemeToDelete(null);
      await fetchThemes();
      if (onThemeChange) onThemeChange();
    } catch (err) {
      // Keep dialog open on error — user can retry or cancel
      const msg = err?.response?.data?.message || 'Failed to delete theme';
      setError(msg);
    } finally {
      setDeleting(false);
    }
  }, [themeToDelete, websiteId, fetchThemes, onThemeChange]);

  const handleClone = useCallback(async (theme) => {
    setCloning(theme.id);
    try {
      await axios.post(`${API_BASE}/websites/${websiteId}/themes`, {
        name: `${theme.name} (Copy)`,
        description: theme.description || '',
        tokens: theme.tokens || {},
      });
      await fetchThemes();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to clone theme';
      setError(msg);
    } finally {
      setCloning(null);
    }
  }, [websiteId, fetchThemes]);

  const handleOpenSetDefaultDialog = useCallback((theme) => {
    setThemeToSetDefault(theme);
    setSetDefaultDialogOpen(true);
  }, []);

  const handleCloseSetDefaultDialog = useCallback(() => {
    setSetDefaultDialogOpen(false);
    setThemeToSetDefault(null);
  }, []);

  const handleConfirmSetDefault = useCallback(async () => {
    if (!themeToSetDefault) return;
    setSetDefaultDialogOpen(false);
    setSettingDefault(themeToSetDefault.id);
    const targetTheme = themeToSetDefault;
    setThemeToSetDefault(null);
    try {
      await axios.patch(`${API_BASE}/websites/${websiteId}/themes/${targetTheme.id}/default`);
      await fetchThemes();
      if (onThemeChange) onThemeChange(targetTheme.id);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to set default theme';
      setError(msg);
    } finally {
      setSettingDefault(null);
    }
  }, [themeToSetDefault, websiteId, fetchThemes, onThemeChange]);

  const handleOpenCreateForm = useCallback(() => {
    setShowCreateForm(true);
    setCreateName('');
    setCreateDescription('');
    setCreateNameError('');
  }, []);

  const handleCancelCreate = useCallback(() => {
    setShowCreateForm(false);
    setCreateName('');
    setCreateDescription('');
    setCreateNameError('');
  }, []);

  const handleCreateNameChange = useCallback((e) => {
    setCreateName(e.target.value);
    if (e.target.value.length > 100) {
      setCreateNameError('Max 100 characters');
    } else {
      setCreateNameError('');
    }
  }, []);

  const handleCreateSubmit = useCallback(async () => {
    if (!createName.trim()) {
      setCreateNameError('Name is required');
      return;
    }
    if (createName.length > 100) {
      setCreateNameError('Max 100 characters');
      return;
    }
    setCreating(true);
    try {
      // Clone tokens from current theme (or first available, or empty default)
      const currentTheme = themes.find((t) => t.id === currentThemeId) || themes[0];
      await axios.post(`${API_BASE}/websites/${websiteId}/themes`, {
        name: createName.trim(),
        description: createDescription.trim(),
        tokens: currentTheme?.tokens || {},
      });
      setShowCreateForm(false);
      setCreateName('');
      setCreateDescription('');
      await fetchThemes();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to create theme';
      setCreateNameError(msg);
    } finally {
      setCreating(false);
    }
  }, [createName, createDescription, websiteId, fetchThemes, themes, currentThemeId]);

  // ── Render helpers ────────────────────────────────────────────────────────

  const renderColorSwatch = useCallback((theme) => {
    const primaryColor = theme?.tokens?.colors?.primary || '#1976d2';
    return (
      <Box
        data-testid="color-swatch"
        sx={{
          width: 16,
          height: 16,
          borderRadius: '3px',
          backgroundColor: primaryColor,
          border: `1px solid ${alpha(primaryColor, 0.4)}`,
          display: 'inline-block',
          flexShrink: 0,
        }}
      />
    );
  }, []);

  const renderThemeCard = useCallback((theme) => {
    const isDefaultTheme = theme.isDefault;
    const description = truncate(theme.description, 80);
    const isSettingThisDefault = settingDefault === theme.id;
    const isCloningThis = cloning === theme.id;

    return (
      <Grid item xs={12} sm={6} md={4} key={theme.id}>
        <DashboardCard
          icon={Palette}
          title={theme.name}
          subtitle={description}
          sx={{ height: '100%' }}
        >
          {/* Color swatch + default badge row */}
          <Box
            display="flex"
            alignItems="center"
            gap={1}
            mb={1.5}
            flexWrap="wrap"
          >
            {renderColorSwatch(theme)}
            {isDefaultTheme && (
              <Chip
                label="Default"
                size="small"
                sx={{
                  bgcolor: alpha(colors.primary || '#1976d2', 0.15),
                  color: 'text.primary',
                  fontWeight: 600,
                  height: 20,
                  fontSize: '0.7rem',
                }}
              />
            )}
          </Box>

          {/* Action buttons */}
          <Box display="flex" alignItems="center" gap={0.5} flexWrap="wrap">
            {/* Set as Default */}
            {!isDefaultTheme && (
              <IconButton
                size="small"
                aria-label={`Set ${theme.name} as default`}
                onClick={() => handleOpenSetDefaultDialog(theme)}
                disabled={isSettingThisDefault || settingDefault !== null}
                sx={{ color: 'text.secondary' }}
              >
                {isSettingThisDefault ? (
                  <CircularProgress size={14} />
                ) : (
                  <Star size={14} />
                )}
              </IconButton>
            )}

            {/* Clone */}
            <IconButton
              size="small"
              aria-label={`Clone ${theme.name}`}
              onClick={() => handleClone(theme)}
              disabled={isCloningThis || cloning !== null}
              sx={{ color: 'text.secondary' }}
            >
              {isCloningThis ? (
                <CircularProgress size={14} />
              ) : (
                <Copy size={14} />
              )}
            </IconButton>

            {/* Delete — disabled with tooltip for default theme; active for others */}
            {isDefaultTheme ? (
              <Tooltip title="Cannot delete the default theme" arrow>
                <span>
                  <IconButton
                    size="small"
                    aria-label={`Cannot delete default theme ${theme.name}`}
                    disabled
                    sx={{ color: 'error.main' }}
                  >
                    <Trash2 size={14} />
                  </IconButton>
                </span>
              </Tooltip>
            ) : (
              <IconButton
                size="small"
                aria-label={`Delete ${theme.name}`}
                onClick={() => handleOpenDeleteDialog(theme)}
                sx={{ color: 'error.main' }}
              >
                <Trash2 size={14} />
              </IconButton>
            )}
          </Box>
        </DashboardCard>
      </Grid>
    );
  }, [
    settingDefault,
    cloning,
    colors,
    renderColorSwatch,
    handleOpenSetDefaultDialog,
    handleClone,
    handleOpenDeleteDialog,
  ]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Box sx={{ color: 'text.primary' }}>
      {/* Header row */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={3}
        flexWrap="wrap"
        gap={1}
      >
        <Typography
          variant="h6"
          sx={{ color: 'text.primary', fontWeight: 600 }}
        >
          Theme Presets
        </Typography>
        {!showCreateForm && (
          <DashboardGradientButton
            startIcon={<Plus size={16} />}
            onClick={handleOpenCreateForm}
            size="small"
          >
            Create Theme
          </DashboardGradientButton>
        )}
      </Box>

      {/* Inline Create Form */}
      {showCreateForm && (
        <Box
          sx={{
            mb: 3,
            p: 2.5,
            borderRadius: 2,
            border: `1px solid ${colors.border || 'divider'}`,
            bgcolor: alpha(colors.panelBg || '#ffffff', 0.5),
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.primary', fontWeight: 600 }}>
            New Theme
          </Typography>
          <Box display="flex" flexDirection="column" gap={1.5}>
            <TextField
              label="Theme Name"
              placeholder="Theme name"
              value={createName}
              onChange={handleCreateNameChange}
              error={Boolean(createNameError)}
              helperText={createNameError || `${createName.length}/100`}
              inputProps={{ maxLength: 100 }}
              size="small"
              fullWidth
              disabled={creating}
            />
            <TextField
              label="Description (optional)"
              placeholder="Theme description"
              value={createDescription}
              onChange={(e) => setCreateDescription(e.target.value)}
              size="small"
              fullWidth
              multiline
              rows={2}
              disabled={creating}
            />
            <Box display="flex" gap={1} justifyContent="flex-end">
              <Button
                size="small"
                onClick={handleCancelCreate}
                disabled={creating}
                sx={{ color: 'text.secondary', textTransform: 'none' }}
              >
                Cancel
              </Button>
              <DashboardGradientButton
                size="small"
                onClick={handleCreateSubmit}
                disabled={creating || Boolean(createNameError) || !createName.trim()}
                startIcon={creating ? <CircularProgress size={14} color="inherit" /> : undefined}
              >
                Save
              </DashboardGradientButton>
            </Box>
          </Box>
        </Box>
      )}

      {/* Loading */}
      {loading && (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      )}

      {/* Error */}
      {!loading && error && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={fetchThemes}>
              Retry
            </Button>
          }
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      )}

      {/* Empty state */}
      {isEmpty && (
        <EmptyState
          icon={<Palette size={32} />}
          title="No custom themes yet"
          subtitle="Create your first theme preset to customize the look of your website."
          action={
            <DashboardGradientButton
              startIcon={<Plus size={16} />}
              onClick={handleOpenCreateForm}
            >
              Create your first theme
            </DashboardGradientButton>
          }
        />
      )}

      {/* Theme cards grid */}
      {!loading && !error && themes.length > 0 && (
        <Grid container spacing={2}>
          {themes.map(renderThemeCard)}
        </Grid>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDeleteDialog}
        title="Delete Theme"
        message={
          themeToDelete
            ? `Are you sure you want to delete "${themeToDelete.name}"? This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        loading={deleting}
      />

      {/* Set-Default Confirmation Dialog */}
      <ConfirmationDialog
        open={setDefaultDialogOpen}
        onConfirm={handleConfirmSetDefault}
        onCancel={handleCloseSetDefaultDialog}
        title="Set Default Theme"
        message={
          themeToSetDefault
            ? `Set "${themeToSetDefault.name}" as default? This will replace the current default theme.`
            : ''
        }
        confirmLabel="Set as Default"
        cancelLabel="Cancel"
        variant="confirm"
      />
    </Box>
  );
});

ThemeManager.displayName = 'ThemeManager';

export default ThemeManager;
