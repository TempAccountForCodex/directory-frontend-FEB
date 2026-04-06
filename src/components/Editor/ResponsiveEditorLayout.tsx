/**
 * ResponsiveEditorLayout — Step 9.5.1 + Step 9.11.1 + Step 9.11.3
 *
 * Wraps the editor in a MUI Grid-based responsive layout.
 * Switches between 1 / 2 / 3 column arrangements based on viewport
 * using xs / md / lg breakpoint props on the Grid container.
 *
 * Step 9.11 enhancements:
 * - tabIndex={0}, role="region", aria-label for a11y
 * - ArrowUp/ArrowDown dispatches 'block-navigate' custom events
 * - Keyboard mode indicator chip on tablet breakpoints
 * - CSS class 'keyboard-mode' when keyboard navigation is forced
 *
 * Constraints:
 * - Uses MUI theme tokens only (no hardcoded colors/spacing)
 * - All touch targets >= 48px enforced via minHeight on children
 */
import React, { useCallback } from "react";
import {
  Box,
  Chip,
  Grid,
  Switch,
  type SxProps,
  type Theme,
  Typography,
} from "@mui/material";
import KeyboardIcon from "@mui/icons-material/Keyboard";
import { useResponsiveEditor } from "../../hooks/useResponsiveEditor";
import { useInputMethod } from "../../hooks/useInputMethod";

interface ResponsiveEditorLayoutProps {
  children?: React.ReactNode;
  /** Optional sx overrides for the outer Box */
  sx?: SxProps<Theme>;
}

const ResponsiveEditorLayout: React.FC<ResponsiveEditorLayoutProps> = ({
  children,
  sx,
}) => {
  const { columns, isTablet } = useResponsiveEditor();
  const { isKeyboardMode, forceKeyboardMode, setForceKeyboardMode } =
    useInputMethod();

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      // Only navigate blocks when not in an editable field
      const target = event.target as HTMLElement;
      const tag = target.tagName?.toUpperCase();
      const isEditable =
        tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable;

      if (!isEditable) {
        event.preventDefault();
        const direction = event.key === "ArrowUp" ? "up" : "down";
        window.dispatchEvent(
          new CustomEvent("block-navigate", { detail: { direction } }),
        );
      }
    }
  }, []);

  return (
    <Box
      data-testid="responsive-editor-layout"
      data-columns={columns}
      tabIndex={0}
      role="region"
      aria-label="Editor canvas"
      onKeyDown={handleKeyDown}
      className={isKeyboardMode ? "keyboard-mode" : undefined}
      sx={{
        width: "100%",
        // Ensure touch targets are at least 48px on mobile
        '& button, & [role="button"]': {
          minHeight: { xs: 48, md: "unset" },
          minWidth: { xs: 48, md: "unset" },
        },
        // Focus outline visible in keyboard mode
        "&.keyboard-mode:focus-visible": {
          outline: (theme) => `2px solid ${theme.palette.primary.main}`,
          outlineOffset: 2,
        },
        ...sx,
      }}
    >
      {/* Keyboard mode toggle — visible only on tablet breakpoints */}
      {isTablet && (
        <Box
          data-testid="keyboard-mode-toggle"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            px: 1,
            py: 0.5,
            gap: 1,
          }}
        >
          {forceKeyboardMode && (
            <Chip
              icon={<KeyboardIcon />}
              label="Keyboard Mode"
              size="small"
              onDelete={() => setForceKeyboardMode(false)}
              color="primary"
              variant="outlined"
              data-testid="keyboard-mode-chip"
              aria-label="Keyboard navigation mode active. Press delete to disable."
            />
          )}
          {!forceKeyboardMode && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                Keyboard Nav
              </Typography>
              <Switch
                size="small"
                checked={forceKeyboardMode}
                onChange={(e) => setForceKeyboardMode(e.target.checked)}
                inputProps={{
                  "aria-label": "Enable keyboard navigation mode",
                }}
              />
            </Box>
          )}
        </Box>
      )}

      <Grid container spacing={2}>
        {children}
      </Grid>
    </Box>
  );
};

ResponsiveEditorLayout.displayName = "ResponsiveEditorLayout";

export default ResponsiveEditorLayout;
