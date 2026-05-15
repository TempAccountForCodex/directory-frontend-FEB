/**
 * ViewportPreviewToolbar — Step 9.5.4 + Step 9.11.2
 *
 * A toolbar for switching between Mobile (375px), Tablet (768px) and
 * Desktop (1280px) viewport presets in the live preview panel.
 *
 * Also provides an orientation toggle (portrait <-> landscape) that
 * swaps width / height for the mobile preset.
 *
 * Step 9.11.2 enhancements:
 * - aria-pressed on active viewport preset button for screen readers
 * - role="group" on ButtonGroup for proper a11y grouping semantics
 *
 * Constraints:
 * - Uses MUI theme tokens only
 * - Active viewport button is visually highlighted (contained variant)
 * - Orientation toggle is always rendered but only meaningful for mobile
 */
import React, { useCallback, useMemo } from "react";
import {
  Box,
  Button,
  ButtonGroup,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import TabletIcon from "@mui/icons-material/Tablet";
import DesktopWindowsIcon from "@mui/icons-material/DesktopWindows";
import ScreenRotationIcon from "@mui/icons-material/ScreenRotation";

export type ViewportOrientation = "portrait" | "landscape";

export interface ViewportPreset {
  label: string;
  width: number;
  height: number;
}

export const VIEWPORT_PRESETS: ViewportPreset[] = [
  { label: "375", width: 375, height: 667 },
  { label: "768", width: 768, height: 1024 },
  { label: "1280", width: 1280, height: 800 },
];

export interface ViewportPreviewToolbarProps {
  viewportWidth: number;
  orientation: ViewportOrientation;
  onViewportChange: (width: number, height: number) => void;
  onOrientationToggle: () => void;
}

const ViewportPreviewToolbar: React.FC<ViewportPreviewToolbarProps> = ({
  viewportWidth,
  orientation,
  onViewportChange,
  onOrientationToggle,
}) => {
  const icons: Record<string, React.ReactNode> = useMemo(
    () => ({
      "375": <SmartphoneIcon fontSize="small" />,
      "768": <TabletIcon fontSize="small" />,
      "1280": <DesktopWindowsIcon fontSize="small" />,
    }),
    [],
  );

  const activePreset = useMemo(
    () => VIEWPORT_PRESETS.find((p) => p.width === viewportWidth),
    [viewportWidth],
  );

  const handlePresetClick = useCallback(
    (preset: ViewportPreset) => {
      const w =
        orientation === "landscape" && preset.width < 900
          ? preset.height
          : preset.width;
      const h =
        orientation === "landscape" && preset.width < 900
          ? preset.width
          : preset.height;
      onViewportChange(w, h);
    },
    [orientation, onViewportChange],
  );

  return (
    <Box
      data-testid="viewport-preview-toolbar"
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        flexWrap: "wrap",
      }}
    >
      <Typography variant="caption" sx={{ color: "text.secondary", mr: 0.5 }}>
        Viewport:
      </Typography>

      <ButtonGroup
        size="small"
        aria-label="Viewport presets"
        variant="outlined"
        role="group"
      >
        {VIEWPORT_PRESETS.map((preset) => {
          const isActive = activePreset?.width === preset.width;
          return (
            <Button
              key={preset.label}
              aria-label={`${preset.label}px viewport`}
              aria-pressed={isActive}
              variant={isActive ? "contained" : "outlined"}
              onClick={() => handlePresetClick(preset)}
              startIcon={icons[preset.label]}
              sx={{
                textTransform: "none",
                minWidth: 70,
              }}
            >
              {preset.label}
            </Button>
          );
        })}
      </ButtonGroup>

      <Tooltip title="Toggle orientation (portrait/landscape)">
        <IconButton
          aria-label="Toggle orientation"
          size="small"
          onClick={onOrientationToggle}
          sx={{ ml: 0.5 }}
        >
          <ScreenRotationIcon
            fontSize="small"
            sx={{
              transform: orientation === "landscape" ? "rotate(90deg)" : "none",
              transition: "transform 0.2s",
            }}
          />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

ViewportPreviewToolbar.displayName = "ViewportPreviewToolbar";

export default ViewportPreviewToolbar;
