/**
 * SimpleCustomPanel — Step 9.13.4
 *
 * Simple/Quick customization tab panel for the editor.
 *
 * Sections:
 *   1. Quick Settings — 4 MUI Switch toggles for common boolean settings
 *   2. Color Presets  — 6 one-click color scheme buttons
 *   3. Layout Presets — Standard/Wide/Compact radio selection
 *
 * PERFORMANCE (vercel-react-best-practices):
 * - React.memo prevents parent-triggered re-renders
 * - useCallback on all event handlers
 * - useMemo for active preset detection
 */

import React, { useCallback, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  FormControlLabel,
  Switch,
  Tooltip,
  alpha,
} from "@mui/material";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

// DashboardColors comes from the JS getDashboardColors helper
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DashboardColors = Record<string, any>;

export interface ColorPreset {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  headingColor: string;
  bodyColor: string;
}

export interface SimpleCustomPanelProps {
  settings: Record<string, boolean>;
  onSettingChange: (key: string, value: boolean) => void;
  onPresetSelect: (colors: {
    primaryColor: string;
    secondaryColor: string;
    headingColor: string;
    bodyColor: string;
  }) => void;
  onLayoutSelect?: (layout: string) => void;
  colors: DashboardColors;
}

// ---------------------------------------------------------------------------
// Preset definitions
// ---------------------------------------------------------------------------

const COLOR_PRESETS: ColorPreset[] = [
  {
    name: "Professional",
    primaryColor: "#001f3f",
    secondaryColor: "#39CCCC",
    headingColor: "#111111",
    bodyColor: "#444444",
  },
  {
    name: "Modern",
    primaryColor: "#111111",
    secondaryColor: "#AEEA00",
    headingColor: "#222222",
    bodyColor: "#555555",
  },
  {
    name: "Warm",
    primaryColor: "#FF8F00",
    secondaryColor: "#F4511E",
    headingColor: "#3E2723",
    bodyColor: "#5D4037",
  },
  {
    name: "Cool",
    primaryColor: "#1565C0",
    secondaryColor: "#00BCD4",
    headingColor: "#1A237E",
    bodyColor: "#546E7A",
  },
  {
    name: "Bold",
    primaryColor: "#6A1B9A",
    secondaryColor: "#E53935",
    headingColor: "#4A148C",
    bodyColor: "#37474F",
  },
  {
    name: "Minimal",
    primaryColor: "#607D8B",
    secondaryColor: "#263238",
    headingColor: "#212121",
    bodyColor: "#757575",
  },
];

const LAYOUT_OPTIONS = [
  { label: "Standard", value: "standard" },
  { label: "Wide", value: "wide" },
  { label: "Compact", value: "compact" },
];

const QUICK_SETTINGS = [
  { key: "showNavigation", label: "Show Navigation Bar" },
  { key: "showFooter", label: "Show Footer" },
  { key: "showSocialLinks", label: "Show Social Links" },
  { key: "enableAnimations", label: "Enable Animations" },
];

// ---------------------------------------------------------------------------
// SimpleCustomPanel
// ---------------------------------------------------------------------------

const SimpleCustomPanel: React.FC<SimpleCustomPanelProps> = React.memo(
  ({ settings, onSettingChange, onPresetSelect, onLayoutSelect, colors }) => {
    // Detect active preset by comparing current colors (if passed via settings)
    const activePresetName = useMemo(() => {
      // Since color values aren't passed separately, we can't highlight presets
      // without them. Return null for no highlight when no match.
      return null;
    }, []);

    const handleToggle = useCallback(
      (key: string) =>
        (_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
          onSettingChange(key, checked);
        },
      [onSettingChange],
    );

    const handlePresetClick = useCallback(
      (preset: ColorPreset) => () => {
        onPresetSelect({
          primaryColor: preset.primaryColor,
          secondaryColor: preset.secondaryColor,
          headingColor: preset.headingColor,
          bodyColor: preset.bodyColor,
        });
      },
      [onPresetSelect],
    );

    const handleLayoutClick = useCallback(
      (value: string) => () => {
        if (onLayoutSelect) {
          onLayoutSelect(value);
        }
      },
      [onLayoutSelect],
    );

    return (
      <Stack spacing={3}>
        {/* Quick Settings */}
        <Paper
          sx={{
            p: 3,
            bgcolor: alpha(colors.dark, 0.3),
            borderRadius: 2,
          }}
        >
          <Typography
            variant="h6"
            sx={{ color: colors.text, fontWeight: 600, mb: 2 }}
          >
            Quick Settings
          </Typography>
          <Stack spacing={1}>
            {QUICK_SETTINGS.map(({ key, label }) => (
              <FormControlLabel
                key={key}
                control={
                  <Switch
                    checked={settings[key] ?? false}
                    onChange={handleToggle(key)}
                    size="small"
                  />
                }
                label={
                  <Typography variant="body2" sx={{ color: colors.text }}>
                    {label}
                  </Typography>
                }
              />
            ))}
          </Stack>
        </Paper>

        {/* Color Presets */}
        <Paper
          sx={{
            p: 3,
            bgcolor: alpha(colors.dark, 0.3),
            borderRadius: 2,
          }}
        >
          <Typography
            variant="h6"
            sx={{ color: colors.text, fontWeight: 600, mb: 2 }}
          >
            Color Presets
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1.5,
            }}
          >
            {COLOR_PRESETS.map((preset) => {
              const isActive = activePresetName === preset.name;
              return (
                <Tooltip key={preset.name} title={preset.name} arrow>
                  <Box
                    role="button"
                    aria-label={`Apply ${preset.name} color preset`}
                    tabIndex={0}
                    onClick={handlePresetClick(preset)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handlePresetClick(preset)();
                      }
                    }}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 0.5,
                      cursor: "pointer",
                      p: 1,
                      borderRadius: 2,
                      border: isActive
                        ? `2px solid ${colors.primary}`
                        : "2px solid transparent",
                      "&:hover": {
                        bgcolor: alpha(colors.primary, 0.1),
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    {/* Color swatches */}
                    <Box sx={{ display: "flex", gap: 0.25 }}>
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          bgcolor: preset.primaryColor,
                          border: "1px solid rgba(255,255,255,0.2)",
                        }}
                      />
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          bgcolor: preset.secondaryColor,
                          border: "1px solid rgba(255,255,255,0.2)",
                        }}
                      />
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{ color: colors.textSecondary, fontSize: "0.65rem" }}
                    >
                      {preset.name}
                    </Typography>
                  </Box>
                </Tooltip>
              );
            })}
          </Box>
        </Paper>

        {/* Layout Presets */}
        <Paper
          sx={{
            p: 3,
            bgcolor: alpha(colors.dark, 0.3),
            borderRadius: 2,
          }}
        >
          <Typography
            variant="h6"
            sx={{ color: colors.text, fontWeight: 600, mb: 2 }}
          >
            Layout Presets
          </Typography>
          <Box sx={{ display: "flex", gap: 1.5 }}>
            {LAYOUT_OPTIONS.map((option) => (
              <Box
                key={option.value}
                role="button"
                aria-label={`Select ${option.label} layout`}
                tabIndex={0}
                onClick={handleLayoutClick(option.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleLayoutClick(option.value)();
                  }
                }}
                sx={{
                  px: 2,
                  py: 1,
                  borderRadius: 1,
                  border: `1px solid ${colors.border ?? "rgba(255,255,255,0.2)"}`,
                  cursor: "pointer",
                  "&:hover": {
                    bgcolor: alpha(colors.primary, 0.1),
                    borderColor: colors.primary,
                  },
                  transition: "all 0.2s ease",
                }}
              >
                <Typography variant="body2" sx={{ color: colors.text }}>
                  {option.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      </Stack>
    );
  },
);

SimpleCustomPanel.displayName = "SimpleCustomPanel";

export default SimpleCustomPanel;
