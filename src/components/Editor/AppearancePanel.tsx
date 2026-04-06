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
import { Box, Paper, Typography, Grid, Stack, alpha } from "@mui/material";
import ColorPickerWithAlpha from "../UI/ColorPickerWithAlpha";
// @ts-ignore — ThemeManager is a JS component
import ThemeManager from "../Dashboard/ThemeManager";

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
  }) => {
    const hasWebsite = websiteId != null;

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
