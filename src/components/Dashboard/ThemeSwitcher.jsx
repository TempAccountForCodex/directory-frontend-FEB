/**
 * ThemeSwitcher (Step 9.4.3)
 *
 * Editor-toolbar dropdown for live-previewing website design token presets.
 * CSS variable overrides are applied directly via DOM (ref-based) to meet
 * the <200ms performance requirement. No React state updates during preview.
 *
 * Props:
 *   websiteId          {string}   — target website ID
 *   currentThemeId     {string}   — ID of the currently active theme
 *   previewContainerRef {React.RefObject} — ref to the container element for CSS variable injection
 *   onThemeApplied     {function} — called after PATCH set-as-default succeeds
 */

import { memo, useState, useCallback, useEffect, useRef } from 'react';
import {
  Box,
  MenuItem,
  Typography,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Skeleton,
} from '@mui/material';
import axios from 'axios';

import DashboardSelect from './shared/DashboardSelect';
import { useTheme as useCustomTheme } from '../../context/ThemeContext';
import { getDashboardColors } from '../../styles/dashboardTheme';

// ---------------------------------------------------------------------------
// CSS variable helpers — pure DOM, no React re-render (<200ms guarantee)
// ---------------------------------------------------------------------------

const TOKEN_MAP = {
  '--color-primary': (tokens) => tokens?.colors?.primary,
  '--color-secondary': (tokens) => tokens?.colors?.secondary,
  '--color-background': (tokens) => tokens?.colors?.background,
  '--color-surface': (tokens) => tokens?.colors?.backgroundSecondary,
  '--color-text': (tokens) => tokens?.colors?.text,
  '--color-text-secondary': (tokens) => tokens?.colors?.textSecondary,
  '--spacing-xs': (tokens) => tokens?.spacing?.xs,
  '--spacing-sm': (tokens) => tokens?.spacing?.sm,
  '--spacing-md': (tokens) => tokens?.spacing?.md,
  '--spacing-lg': (tokens) => tokens?.spacing?.lg,
  '--spacing-xl': (tokens) => tokens?.spacing?.xl,
  '--border-radius-sm': (tokens) => tokens?.borderRadius?.sm,
  '--border-radius-md': (tokens) => tokens?.borderRadius?.md,
  '--border-radius-lg': (tokens) => tokens?.borderRadius?.lg,
};

function applyCSSVars(el, tokens) {
  if (!el || !tokens) return;
  Object.entries(TOKEN_MAP).forEach(([varName, getter]) => {
    const value = getter(tokens);
    if (value != null) {
      el.style.setProperty(varName, value);
    }
  });
}

function revertCSSVars(el, tokens) {
  applyCSSVars(el, tokens);
}

// ---------------------------------------------------------------------------
// ThemeSwitcher Component
// ---------------------------------------------------------------------------

const API_BASE = '/api';

const ThemeSwitcher = memo(({
  websiteId,
  currentThemeId,
  previewContainerRef,
  onThemeApplied,
}) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);

  // ── State ──────────────────────────────────────────────────────────────
  const [themes, setThemes] = useState([]);
  const [loadingThemes, setLoadingThemes] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const [selectedThemeId, setSelectedThemeId] = useState(currentThemeId || '');
  const [previewingThemeId, setPreviewingThemeId] = useState(null); // null = not in preview mode
  const [applying, setApplying] = useState(false);

  // Store original theme tokens for undo (Cancel)
  const originalTokensRef = useRef(null);

  // ── Data fetching ───────────────────────────────────────────────────────
  const fetchThemes = useCallback(async () => {
    setLoadingThemes(true);
    try {
      const { data } = await axios.get(`${API_BASE}/websites/${websiteId}/themes`);
      const list = Array.isArray(data) ? data : [];
      setThemes(list);
      // Store original theme tokens
      const original = list.find((t) => t.id === currentThemeId) || list.find((t) => t.isDefault);
      if (original) {
        originalTokensRef.current = original.tokens;
      }
    } catch (err) {
      setErrorMsg('Failed to load themes');
      setSnackbarOpen(true);
    } finally {
      setLoadingThemes(false);
    }
  }, [websiteId, currentThemeId]);

  useEffect(() => {
    fetchThemes();
  }, [fetchThemes]);

  // Sync selectedThemeId when currentThemeId prop changes
  useEffect(() => {
    setSelectedThemeId(currentThemeId || '');
  }, [currentThemeId]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleThemeChange = useCallback((e) => {
    const newThemeId = e.target.value;
    setSelectedThemeId(newThemeId);

    const selectedTheme = themes.find((t) => t.id === newThemeId);
    if (!selectedTheme) return;

    const isCurrentDefault = selectedTheme.isDefault || newThemeId === currentThemeId;

    if (isCurrentDefault) {
      // Revert to original and dismiss preview
      if (previewContainerRef?.current && originalTokensRef.current) {
        revertCSSVars(previewContainerRef.current, originalTokensRef.current);
      }
      setPreviewingThemeId(null);
      return;
    }

    // Apply CSS variables via DOM (pure ref manipulation — no React setState for styling)
    if (previewContainerRef?.current && selectedTheme.tokens) {
      applyCSSVars(previewContainerRef.current, selectedTheme.tokens);
    }

    setPreviewingThemeId(newThemeId);
  }, [themes, currentThemeId, previewContainerRef]);

  const handleApply = useCallback(async () => {
    if (!previewingThemeId) return;
    setApplying(true);
    try {
      await axios.patch(`${API_BASE}/websites/${websiteId}/themes/${previewingThemeId}/default`);
      // Update stored original tokens to the newly applied theme
      const appliedTheme = themes.find((t) => t.id === previewingThemeId);
      if (appliedTheme) {
        originalTokensRef.current = appliedTheme.tokens;
      }
      setPreviewingThemeId(null);
      if (onThemeApplied) onThemeApplied(previewingThemeId);
    } catch (err) {
      setErrorMsg('Failed to apply theme');
      setSnackbarOpen(true);
    } finally {
      setApplying(false);
    }
  }, [previewingThemeId, websiteId, themes, onThemeApplied]);

  const handleCancel = useCallback(() => {
    // Revert CSS variables to original theme
    if (previewContainerRef?.current && originalTokensRef.current) {
      revertCSSVars(previewContainerRef.current, originalTokensRef.current);
    }
    setSelectedThemeId(currentThemeId || '');
    setPreviewingThemeId(null);
  }, [previewContainerRef, currentThemeId]);

  const handleSnackbarClose = useCallback(() => {
    setSnackbarOpen(false);
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────

  const previewingTheme = previewingThemeId
    ? themes.find((t) => t.id === previewingThemeId)
    : null;

  if (loadingThemes) {
    return (
      <Box sx={{ minWidth: 180 }}>
        <Skeleton variant="rounded" width={180} height={40} />
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Theme dropdown */}
      <DashboardSelect
        label="Theme"
        value={selectedThemeId}
        onChange={handleThemeChange}
        disabled={applying}
        sx={{ minWidth: 180 }}
      >
        {themes.map((theme) => (
          <MenuItem key={theme.id} value={theme.id}>
            {theme.name}
          </MenuItem>
        ))}
      </DashboardSelect>

      {/* Preview banner */}
      {previewingTheme && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            px: 3,
            py: 1.5,
            bgcolor: colors.panelBg || 'background.paper',
            borderTop: `1px solid ${colors.border || 'divider'}`,
            boxShadow: '0 -4px 12px rgba(0,0,0,0.12)',
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: 'text.primary', fontWeight: 500 }}
          >
            Previewing: <strong>{previewingTheme.name}</strong>
          </Typography>

          <Button
            variant="contained"
            size="small"
            onClick={handleApply}
            disabled={applying}
            startIcon={applying ? <CircularProgress size={14} color="inherit" /> : undefined}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              minWidth: 80,
            }}
          >
            Apply
          </Button>

          <Button
            variant="outlined"
            size="small"
            onClick={handleCancel}
            disabled={applying}
            sx={{
              textTransform: 'none',
              fontWeight: 500,
              minWidth: 80,
            }}
          >
            Cancel
          </Button>
        </Box>
      )}

      {/* Error Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="error"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {errorMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
});

ThemeSwitcher.displayName = 'ThemeSwitcher';

export default ThemeSwitcher;
