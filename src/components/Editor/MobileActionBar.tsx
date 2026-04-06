/**
 * MobileActionBar — Step 9.5.2 + Step 9.11.2
 *
 * A bottom-fixed action bar that renders only on mobile (xs/sm) viewports.
 * Provides Save, Publish, and Preview primary editor actions.
 *
 * Step 9.11.2 enhancements:
 * - Descriptive aria-labels (e.g., 'Save changes' instead of 'Save')
 * - aria-live region for announcing action results to screen readers
 * - Keyboard shortcut hints in tooltips (Ctrl+S / Cmd+S)
 *
 * Constraints:
 * - Hidden on md+ breakpoints via sx display
 * - Touch targets are >= 48px tall
 * - Uses MUI theme tokens only
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Box, Button, CircularProgress, Tooltip } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import PublishIcon from "@mui/icons-material/Publish";
import VisibilityIcon from "@mui/icons-material/Visibility";

export interface MobileActionBarProps {
  onSave: () => void;
  onPublish: () => void;
  onPreview: () => void;
  isSaving?: boolean;
  /** True when running on macOS/iPad — affects shortcut hints */
  isMac?: boolean;
}

const MobileActionBar: React.FC<MobileActionBarProps> = ({
  onSave,
  onPublish,
  onPreview,
  isSaving = false,
  isMac = false,
}) => {
  const [announcement, setAnnouncement] = useState("");
  const announcementTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Cleanup timeout on unmount to prevent state update after unmount
  useEffect(() => {
    return () => {
      if (announcementTimeoutRef.current) {
        clearTimeout(announcementTimeoutRef.current);
      }
    };
  }, []);

  const announce = useCallback((message: string) => {
    // Clear previous timeout
    if (announcementTimeoutRef.current) {
      clearTimeout(announcementTimeoutRef.current);
    }
    // Set message, then clear after delay to allow re-announcement of same message
    setAnnouncement(message);
    announcementTimeoutRef.current = setTimeout(() => {
      setAnnouncement("");
    }, 3000);
  }, []);

  const handleSave = useCallback(() => {
    announce("Saving changes...");
    onSave();
  }, [onSave, announce]);

  const handlePublish = useCallback(() => {
    announce("Publishing...");
    onPublish();
  }, [onPublish, announce]);

  const handlePreview = useCallback(() => {
    announce("Opening preview");
    onPreview();
  }, [onPreview, announce]);

  const modKey = isMac ? "Cmd" : "Ctrl";

  return (
    <Box
      data-testid="mobile-action-bar"
      sx={{
        // Hidden on md and above
        display: { xs: "flex", md: "none" },
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        bgcolor: "background.paper",
        borderTop: 1,
        borderColor: "divider",
        p: 1,
        gap: 1,
        zIndex: (theme) => theme.zIndex.appBar,
        // Ensure bar itself is tall enough for 48px touch targets
        minHeight: 64,
        alignItems: "center",
        justifyContent: "space-around",
      }}
    >
      {/* Screen reader live region for action announcements */}
      <Box
        aria-live="polite"
        aria-atomic="true"
        role="status"
        data-testid="action-announcer"
        sx={{
          position: "absolute",
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          whiteSpace: "nowrap",
          borderWidth: 0,
        }}
      >
        {announcement}
      </Box>

      <Tooltip title={`Save changes (${modKey}+S)`}>
        <span style={{ flex: 1, display: "flex" }}>
          <Button
            aria-label="Save changes"
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={isSaving}
            startIcon={
              isSaving ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <SaveIcon />
              )
            }
            sx={{
              flex: 1,
              minHeight: 48,
              textTransform: "none",
            }}
          >
            Save
          </Button>
        </span>
      </Tooltip>

      <Tooltip title="Publish website">
        <Button
          aria-label="Publish website"
          variant="outlined"
          color="primary"
          onClick={handlePublish}
          startIcon={<PublishIcon />}
          sx={{
            flex: 1,
            minHeight: 48,
            textTransform: "none",
          }}
        >
          Publish
        </Button>
      </Tooltip>

      <Tooltip title="Preview website">
        <Button
          aria-label="Preview website"
          variant="outlined"
          color="secondary"
          onClick={handlePreview}
          startIcon={<VisibilityIcon />}
          sx={{
            flex: 1,
            minHeight: 48,
            textTransform: "none",
          }}
        >
          Preview
        </Button>
      </Tooltip>
    </Box>
  );
};

MobileActionBar.displayName = "MobileActionBar";

export default MobileActionBar;
