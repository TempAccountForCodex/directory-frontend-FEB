import { memo, useState, useCallback } from 'react';
import axios from 'axios';
import {
  Box,
  Alert,
  Grid,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Check, Palette, RefreshCw, Save, Sun, Moon, Sparkles, Layers } from 'lucide-react';
import { getDashboardColors } from '../../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../../context/ThemeContext';
import { DashboardCard } from '../shared';
import DashboardActionButton from '../shared/DashboardActionButton';
import DashboardGradientButton from '../shared/DashboardGradientButton';
import DashboardCancelButton from '../shared/DashboardCancelButton';
import DashboardInput from '../shared/DashboardInput';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const THEME_PRESETS = [
  { id: 'light', label: 'Light', icon: Sun, bg: '#ffffff', text: '#111111' },
  { id: 'dark', label: 'Dark', icon: Moon, bg: '#111827', text: '#f9fafb' },
  { id: 'colorful', label: 'Colorful', icon: Sparkles, bg: '#f0f4ff', text: '#1e1b4b' },
  { id: 'minimal', label: 'Minimal', icon: Layers, bg: '#fafafa', text: '#262626' },
];

const FONT_OPTIONS = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Lato', label: 'Lato' },
  { value: 'Playfair Display', label: 'Playfair Display' },
  { value: 'Merriweather', label: 'Merriweather' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Montserrat', label: 'Montserrat' },
];

const MAX_WIDTH_OPTIONS = [
  { value: '1280px', label: 'Standard (1280px)' },
  { value: '1440px', label: 'Wide (1440px)' },
  { value: '960px', label: 'Narrow (960px)' },
  { value: '100%', label: 'Full Width' },
];

const HEADER_STYLE_OPTIONS = [
  { value: 'sticky', label: 'Sticky (follows scroll)' },
  { value: 'static', label: 'Static' },
  { value: 'transparent', label: 'Transparent' },
];

const FOOTER_STYLE_OPTIONS = [
  { value: 'standard', label: 'Standard' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'expanded', label: 'Expanded' },
];

const HEX_REGEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

const DEFAULT_CUSTOMIZATION = {
  theme: 'light',
  primaryColor: '#378C92',
  secondaryColor: '#6366f1',
  headingTextColor: '#1e1b4b',
  bodyTextColor: '#262626',
  fontHeading: 'Inter',
  fontBody: 'Roboto',
  maxWidth: '1280px',
  headerStyle: 'sticky',
  footerStyle: 'standard',
};

const DesignTab = memo(({ website, websiteId, onSaved }) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);

  const initial = {
    ...DEFAULT_CUSTOMIZATION,
    primaryColor: website?.primaryColor || DEFAULT_CUSTOMIZATION.primaryColor,
    secondaryColor: website?.secondaryColor || DEFAULT_CUSTOMIZATION.secondaryColor,
    headingTextColor: website?.headingTextColor || DEFAULT_CUSTOMIZATION.headingTextColor,
    bodyTextColor: website?.bodyTextColor || DEFAULT_CUSTOMIZATION.bodyTextColor,
  };

  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [colorErrors, setColorErrors] = useState({});

  const handleThemeSelect = useCallback((themeId) => {
    setForm((prev) => ({ ...prev, theme: themeId }));
  }, []);

  const handleColorChange = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    const isValid = HEX_REGEX.test(value);
    setColorErrors((prev) => ({ ...prev, [field]: isValid ? null : 'Invalid hex color' }));
  }, []);

  const handleFieldChange = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = async () => {
    // Validate colors
    const colorFields = ['primaryColor', 'secondaryColor', 'headingTextColor', 'bodyTextColor'];
    const errors = {};
    colorFields.forEach((f) => {
      if (form[f] && !HEX_REGEX.test(form[f])) {
        errors[f] = 'Invalid hex color';
      }
    });
    if (Object.keys(errors).length > 0) {
      setColorErrors(errors);
      return;
    }

    try {
      setSaving(true);
      setSaveError(null);
      const res = await axios.put(`${API_URL}/websites/${websiteId}`, {
        primaryColor: form.primaryColor,
        secondaryColor: form.secondaryColor,
        headingTextColor: form.headingTextColor,
        bodyTextColor: form.bodyTextColor,
      });
      if (onSaved) onSaved(res.data?.data || res.data);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err?.response?.data?.message || 'Failed to save design settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setForm(DEFAULT_CUSTOMIZATION);
    setColorErrors({});
    setResetDialogOpen(false);
  };

  const ColorRow = ({ field, label }) => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        py: 1.5,
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      <Typography variant="body2" sx={{ width: 140, flexShrink: 0, color: 'text.primary' }}>
        {label}
      </Typography>
      <Box
        component="input"
        type="color"
        value={form[field]}
        onChange={(e) => handleColorChange(field, e.target.value)}
        style={{
          width: 36,
          height: 36,
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer',
          padding: 2,
          background: 'transparent',
          flexShrink: 0,
        }}
        aria-label={`${label} color picker`}
      />
      <Box
        sx={{
          width: 28,
          height: 28,
          borderRadius: 1,
          bgcolor: form[field],
          border: `1px solid ${colors.border}`,
          flexShrink: 0,
        }}
        aria-hidden
      />
      <DashboardInput
        value={form[field]}
        onChange={(e) => handleColorChange(field, e.target.value)}
        size="small"
        inputProps={{
          maxLength: 7,
          placeholder: '#000000',
          'aria-label': `${label} hex value`,
          style: { fontFamily: 'monospace' },
        }}
        error={!!colorErrors[field]}
        helperText={colorErrors[field]}
        sx={{ width: 130 }}
      />
    </Box>
  );

  return (
    <Box>
      {saveError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setSaveError(null)}>
          {saveError}
        </Alert>
      )}
      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Design settings saved successfully.
        </Alert>
      )}

      {/* Theme presets — Coming soon */}
      <DashboardCard icon={Palette} title="Choose Theme" sx={{ mb: 3, opacity: 0.6, pointerEvents: 'none' }}>
        <Grid container spacing={2}>
          {THEME_PRESETS.map((preset) => {
            const isSelected = form.theme === preset.id;
            const PresetIcon = preset.icon;
            return (
              <Grid item xs={6} md={3} key={preset.id}>
                <Box
                  onClick={() => handleThemeSelect(preset.id)}
                  sx={{
                    border: isSelected
                      ? `2px solid ${colors.primary}`
                      : `2px solid ${colors.border}`,
                    borderRadius: 2,
                    p: 2,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1,
                    background: isSelected ? alpha(colors.primary, 0.05) : colors.bgCard,
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    '&:hover': { borderColor: colors.primary },
                  }}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  aria-label={`Select ${preset.label} theme`}
                  onKeyDown={(e) => e.key === 'Enter' && handleThemeSelect(preset.id)}
                >
                  {isSelected && (
                    <Check
                      size={16}
                      style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        color: colors.primary,
                      }}
                    />
                  )}
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: preset.bg,
                      border: `1px solid ${colors.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <PresetIcon size={18} color={preset.text} />
                  </Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    {preset.label}
                  </Typography>
                </Box>
              </Grid>
            );
          })}
        </Grid>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic', mt: 1, display: 'block' }}>
          Theme presets coming soon
        </Typography>
      </DashboardCard>

      {/* Color scheme */}
      <DashboardCard icon={Palette} title="Color Scheme" sx={{ mb: 3 }}>
        <ColorRow field="primaryColor" label="Primary" />
        <ColorRow field="secondaryColor" label="Secondary" />
        <ColorRow field="headingTextColor" label="Heading Text" />
        <ColorRow field="bodyTextColor" label="Body Text" />
      </DashboardCard>

      {/* Typography — Coming soon */}
      <DashboardCard icon={Palette} title="Typography" sx={{ mb: 3, opacity: 0.6 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
              Heading Font
            </Typography>
            <FormControl fullWidth disabled>
              <Select
                value={form.fontHeading}
                inputProps={{ 'aria-label': 'Heading font selector' }}
              >
                {FONT_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
              Body Font
            </Typography>
            <FormControl fullWidth disabled>
              <Select
                value={form.fontBody}
                inputProps={{ 'aria-label': 'Body font selector' }}
              >
                {FONT_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
            Custom typography support coming soon
          </Typography>
        </Box>
      </DashboardCard>

      {/* Layout options — Coming soon */}
      <DashboardCard icon={Layers} title="Layout" sx={{ mb: 3, opacity: 0.6 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth disabled>
            <InputLabel>Max Width</InputLabel>
            <Select
              value={form.maxWidth}
              label="Max Width"
            >
              {MAX_WIDTH_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth disabled>
            <InputLabel>Header Style</InputLabel>
            <Select
              value={form.headerStyle}
              label="Header Style"
            >
              {HEADER_STYLE_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth disabled>
            <InputLabel>Footer Style</InputLabel>
            <Select
              value={form.footerStyle}
              label="Footer Style"
            >
              {FOOTER_STYLE_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
            Custom layout options coming soon
          </Typography>
        </Box>
      </DashboardCard>

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <DashboardActionButton
          startIcon={<RefreshCw size={16} />}
          onClick={() => setResetDialogOpen(true)}
          variant="outlined"
          color="warning"
          aria-label="Reset design to defaults"
        >
          Reset to Defaults
        </DashboardActionButton>
        <DashboardGradientButton
          startIcon={<Save size={16} />}
          onClick={handleSave}
          disabled={saving}
          aria-label="Save design settings"
        >
          {saving ? 'Saving...' : 'Save Design'}
        </DashboardGradientButton>
      </Box>

      {/* Reset confirmation dialog */}
      <Dialog
        open={resetDialogOpen}
        onClose={() => setResetDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Reset to Defaults</DialogTitle>
        <DialogContent>
          Are you sure you want to reset all design settings to their defaults? This will discard any unsaved changes.
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <DashboardCancelButton onClick={() => setResetDialogOpen(false)} />
          <DashboardActionButton
            onClick={handleReset}
            color="warning"
            variant="contained"
            aria-label="Confirm reset design"
          >
            Reset
          </DashboardActionButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
});

DesignTab.displayName = 'DesignTab';

export default DesignTab;
