/**
 * AppearancePanel — Step 9.13.2
 *
 * Appearance tab panel for the CustomizeWebsite editor.
 * Wraps the 4 ColorPickerWithAlpha pickers in a 2x2 grid and optionally
 * renders the ThemeManager component when a websiteId is provided.
 *
 * Sections:
 *   1. Color Palette  — 4 pickers (primary, secondary, heading, body)
 *   2. Theme Presets  — ThemeManager (only when websiteId is set)
 *
 * PERFORMANCE (vercel-react-best-practices):
 * - React.memo prevents parent-triggered re-renders
 */

import React from "react";
import {
  Paper,
  Typography,
  Grid,
  Stack,
  alpha,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  type SelectChangeEvent,
} from "@mui/material";
import ColorPickerWithAlpha from "../UI/ColorPickerWithAlpha";
// @ts-ignore — ThemeManager is a JS component
import ThemeManager from "../Dashboard/ThemeManager";

// ---------------------------------------------------------------------------
// Font Presets (Step 12.1)
// ---------------------------------------------------------------------------

const FONT_PRESET_OPTIONS = [
  { key: "system", label: "System (Inter)" },
  { key: "serif", label: "Serif (Playfair / Lora)" },
  { key: "modern", label: "Modern (Poppins)" },
  { key: "editorial", label: "Editorial (Cormorant / Montserrat)" },
];

// ---------------------------------------------------------------------------
// Extended Typography Options (Step 12.2)
// ---------------------------------------------------------------------------

const LETTER_SPACING_OPTIONS = [
  { key: "normal", label: "Normal", value: "normal" },
  { key: "wide", label: "Wide", value: "0.05em" },
  { key: "wider", label: "Wider", value: "0.1em" },
];

const TEXT_TRANSFORM_OPTIONS = [
  { key: "none", label: "None", value: "none" },
  { key: "uppercase", label: "UPPERCASE", value: "uppercase" },
];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

// DashboardColors comes from the JS getDashboardColors helper — use loose type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DashboardColors = Record<string, any>;

export interface AppearancePanelProps {
  primaryColor: string;
  secondaryColor: string;
  headingColor: string;
  bodyColor: string;
  onPrimaryColorChange: (color: string) => void;
  onSecondaryColorChange: (color: string) => void;
  onHeadingColorChange: (color: string) => void;
  onBodyColorChange: (color: string) => void;
  primaryColorError?: string;
  secondaryColorError?: string;
  headingColorError?: string;
  bodyColorError?: string;
  websiteId?: number | null;
  currentThemeId?: string;
  onThemeChange?: () => void;
  colors: DashboardColors;
  /** Active font preset key (e.g. 'system', 'serif', 'modern', 'editorial') */
  fontPreset?: string;
  /** Called when the user selects a different font preset */
  onFontPresetChange?: (preset: string) => void;
  /** Heading letter-spacing key: 'normal' | 'wide' | 'wider' (Step 12.2) */
  headingLetterSpacing?: string;
  /** Called when the user changes letter-spacing (Step 12.2) */
  onHeadingLetterSpacingChange?: (value: string) => void;
  /** Heading text-transform key: 'none' | 'uppercase' (Step 12.2) */
  headingTextTransform?: string;
  /** Called when the user changes text-transform (Step 12.2) */
  onHeadingTextTransformChange?: (value: string) => void;
}

// ---------------------------------------------------------------------------
// AppearancePanel
// ---------------------------------------------------------------------------

const AppearancePanel: React.FC<AppearancePanelProps> = React.memo(
  ({
    primaryColor,
    secondaryColor,
    headingColor,
    bodyColor,
    onPrimaryColorChange,
    onSecondaryColorChange,
    onHeadingColorChange,
    onBodyColorChange,
    primaryColorError,
    secondaryColorError,
    headingColorError,
    bodyColorError,
    websiteId,
    currentThemeId,
    onThemeChange,
    colors,
    fontPreset = "system",
    onFontPresetChange,
    headingLetterSpacing = "normal",
    onHeadingLetterSpacingChange,
    headingTextTransform = "none",
    onHeadingTextTransformChange,
  }) => {
    const hasWebsite = websiteId != null;

    const handleFontPresetChange = React.useCallback(
      (event: SelectChangeEvent<string>) => {
        onFontPresetChange?.(event.target.value);
      },
      [onFontPresetChange],
    );

    const handleLetterSpacingChange = React.useCallback(
      (event: SelectChangeEvent<string>) => {
        onHeadingLetterSpacingChange?.(event.target.value);
      },
      [onHeadingLetterSpacingChange],
    );

    const handleTextTransformChange = React.useCallback(
      (event: SelectChangeEvent<string>) => {
        onHeadingTextTransformChange?.(event.target.value);
      },
      [onHeadingTextTransformChange],
    );

    return (
      <Stack spacing={3}>
        {/* Color Palette section */}
        <Paper
          sx={{
            p: 3,
            bgcolor: alpha(colors.dark, 0.3),
            borderRadius: 2,
          }}
        >
          <Typography
            variant="h6"
            sx={{ color: colors.text, fontWeight: 600, mb: 3 }}
          >
            Color Palette
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <ColorPickerWithAlpha
                value={primaryColor}
                onChange={onPrimaryColorChange}
                label="Primary Color"
                error={primaryColorError}
                showAlpha
              />
            </Grid>
            <Grid item xs={6}>
              <ColorPickerWithAlpha
                value={secondaryColor}
                onChange={onSecondaryColorChange}
                label="Secondary Color"
                error={secondaryColorError}
                showAlpha
              />
            </Grid>
            <Grid item xs={6}>
              <ColorPickerWithAlpha
                value={headingColor}
                onChange={onHeadingColorChange}
                label="Heading Text"
                error={headingColorError}
                showAlpha={false}
              />
            </Grid>
            <Grid item xs={6}>
              <ColorPickerWithAlpha
                value={bodyColor}
                onChange={onBodyColorChange}
                label="Body Text"
                error={bodyColorError}
                showAlpha={false}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Font Family section (Step 12.1) */}
        <Paper
          sx={{
            p: 3,
            bgcolor: alpha(colors.dark, 0.3),
            borderRadius: 2,
          }}
        >
          <Typography
            variant="h6"
            sx={{ color: colors.text, fontWeight: 600, mb: 3 }}
          >
            Font Family
          </Typography>
          <FormControl fullWidth size="small">
            <InputLabel id="font-preset-label" sx={{ color: colors.text }}>
              Font Preset
            </InputLabel>
            <Select
              labelId="font-preset-label"
              label="Font Preset"
              value={fontPreset}
              onChange={handleFontPresetChange}
              inputProps={{ "data-testid": "font-preset-select" }}
              sx={{
                color: colors.text,
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: alpha(colors.text, 0.3),
                },
              }}
            >
              {FONT_PRESET_OPTIONS.map((option) => (
                <MenuItem key={option.key} value={option.key}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Paper>

        {/* Extended Typography section (Step 12.2) */}
        <Paper
          sx={{
            p: 3,
            bgcolor: alpha(colors.dark, 0.3),
            borderRadius: 2,
          }}
        >
          <Typography
            variant="h6"
            sx={{ color: colors.text, fontWeight: 600, mb: 3 }}
          >
            Heading Style
          </Typography>
          <Stack spacing={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="letter-spacing-label" sx={{ color: colors.text }}>
                Letter Spacing
              </InputLabel>
              <Select
                labelId="letter-spacing-label"
                label="Letter Spacing"
                value={headingLetterSpacing}
                onChange={handleLetterSpacingChange}
                inputProps={{ "data-testid": "letter-spacing-select" }}
                sx={{
                  color: colors.text,
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: alpha(colors.text, 0.3),
                  },
                }}
              >
                {LETTER_SPACING_OPTIONS.map((option) => (
                  <MenuItem key={option.key} value={option.key}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel id="text-transform-label" sx={{ color: colors.text }}>
                Text Transform
              </InputLabel>
              <Select
                labelId="text-transform-label"
                label="Text Transform"
                value={headingTextTransform}
                onChange={handleTextTransformChange}
                inputProps={{ "data-testid": "text-transform-select" }}
                sx={{
                  color: colors.text,
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: alpha(colors.text, 0.3),
                  },
                }}
              >
                {TEXT_TRANSFORM_OPTIONS.map((option) => (
                  <MenuItem key={option.key} value={option.key}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Paper>

        {/* Theme Presets section — only shown when websiteId is available */}
        {hasWebsite && (
          <Paper
            sx={{
              p: 3,
              bgcolor: alpha(colors.dark, 0.3),
              borderRadius: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: colors.text, fontWeight: 600, mb: 3 }}
            >
              Theme Presets
            </Typography>
            <ThemeManager
              websiteId={String(websiteId)}
              currentThemeId={currentThemeId ?? ""}
              onThemeChange={onThemeChange ?? (() => undefined)}
            />
          </Paper>
        )}
      </Stack>
    );
  },
);

AppearancePanel.displayName = "AppearancePanel";

export default AppearancePanel;
